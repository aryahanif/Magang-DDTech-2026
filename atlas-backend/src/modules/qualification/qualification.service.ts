import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GoogleGenAI, Type } from '@google/genai';
import Groq from 'groq-sdk';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';

// Define configuration for scoring weights and individual criteria scores (1-5 scale)
const SCORING_CONFIG = {
  WEIGHTS: {
    COUNTRY: 0.3,
    BUSINESS_TYPE: 0.4,
    INTENT: 0.3, // Based on completeness and detail of the inquiry
  },
  COUNTRY_SCORES: {
    'australia': 5,
    'new zealand': 5,
    'indonesia': 3,
    'default': 1,
  },
  BUSINESS_TYPE_SCORES: {
    'mortgage broker': 5,
    'finance broker': 4,
    'professional services': 3,
    'default': 1,
  }
};

export interface LeadScoringInput {
  country?: string | null;
  business_type?: string | null;
  current_problem?: string | null;
  automation_interest?: string | null;
  message?: string | null;
  email?: string | null;
  company_name?: string | null;
  full_name?: string | null;
  [key: string]: unknown;
}

interface QualificationResult {
  lead_tier: string;
  fit_status: string;
  qualification_summary: string;
  recommended_next_action: string;
  urgency_level: string;
  risk_flags: string[];
}

@Injectable()
export class QualificationService {
  private readonly logger = new Logger(QualificationService.name);
  private geminiClient: GoogleGenAI;
  private groqClient: Groq | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

    if (process.env.GROQ_API_KEY) {
      this.groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
      this.logger.log('Groq fallback provider initialized.');
    }
  }

  /**
   * Calculates a rule-based score based on basic lead information.
   * Uses weighted criteria to generate a final score from 1.0 to 5.0.
   */
  async calculateRuleBasedScore(leadData: LeadScoringInput): Promise<number> {
    // 1. Country Score (1-5)
    const country = (leadData.country || '').trim().toLowerCase();
    const countryScore = SCORING_CONFIG.COUNTRY_SCORES[country] || SCORING_CONFIG.COUNTRY_SCORES['default'];

    // 2. Business Type Score (1-5)
    const businessType = (leadData.business_type || '').trim().toLowerCase();
    const businessScore = SCORING_CONFIG.BUSINESS_TYPE_SCORES[businessType] || SCORING_CONFIG.BUSINESS_TYPE_SCORES['default'];

    // 3. Intent Score (1-5) based on completeness, business email, and spam indicators
    let intentScore = 1;
    if (leadData.current_problem && leadData.current_problem.trim().length > 10) intentScore += 1; // Real problem described
    if (leadData.automation_interest && leadData.automation_interest.trim().length > 0) intentScore += 1; // Specific interest
    if (leadData.message && leadData.message.trim().length > 5) intentScore += 1; // Left a message

    // Business Email Check
    const email = (leadData.email || '').toLowerCase();
    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
    const isFreeEmail = freeDomains.some(domain => email.includes(domain));
    if (email && !isFreeEmail) intentScore += 1;

    // Spam / Missing Data Check (toggleable via SystemSetting.is_spam_detection_enabled)
    const settings = await this.prisma.systemSetting.findFirst();
    if (settings?.is_spam_detection_enabled ?? true) {
      if (!leadData.email || !leadData.company_name) intentScore -= 2;
      const spamWords = ['test', 'spam', 'asdf', '1234'];
      const messageText = (leadData.message || '').toLowerCase() + ' ' + (leadData.full_name || '').toLowerCase();
      if (spamWords.some(w => messageText.includes(w))) intentScore -= 3;
    }

    intentScore = Math.max(1, Math.min(5, intentScore)); // Clamp between 1 and 5

    // Calculate weighted average
    const finalScore = 
      (countryScore * SCORING_CONFIG.WEIGHTS.COUNTRY) + 
      (businessScore * SCORING_CONFIG.WEIGHTS.BUSINESS_TYPE) + 
      (intentScore * SCORING_CONFIG.WEIGHTS.INTENT);

    // Round to nearest integer to match Prisma's Int schema
    return Math.round(finalScore);
  }

  /**
   * Builds the prompt for AI qualification.
   */
  private buildPrompt(leadData: LeadScoringInput, ruleBasedScore?: number, tierEnums?: string[]): string {
    const tiers = tierEnums ?? ['Tier A', 'Tier B', 'Tier C', 'Disqualified', 'Spam'];
    return `You are a professional B2B sales analyst for Atlas, DDTech's AI Workforce Platform.
Analyze the following client data and provide deep insights regarding the client's potential.

System Information:
- This client received a Rule-Based Score: ${ruleBasedScore ?? 'N/A'} (scale 1.0 - 5.0).
- Use this system score as one of the main references to determine the lead_tier (Tier A/B/C). A high score (>4.0) indicates Tier A or B.
- Valid lead_tier values: ${tiers.join(', ')}
- Valid fit_status values: Good Fit, Potential, Unlikely
- Valid urgency_level values: High, Medium, Low

Client Data:
${JSON.stringify(leadData, null, 2)}

Respond ONLY with a valid JSON object with these fields:
{
  "lead_tier": "Tier A|Tier B|Tier C|Disqualified|Spam",
  "fit_status": "Good Fit|Potential|Unlikely",
  "qualification_summary": "Max 2 sentence analysis summary",
  "recommended_next_action": "Specific next step",
  "urgency_level": "High|Medium|Low",
  "risk_flags": ["list of risk flags or empty array"]
}`;
  }

  /**
   * Try to qualify a lead using Google Gemini API.
   */
  private async tryGemini(
    prompt: string,
    tierEnums: string[],
  ): Promise<QualificationResult> {
    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    this.logger.log(`[AI Provider] Trying Gemini (${model})...`);

    const response = await this.geminiClient.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lead_tier: { type: Type.STRING, enum: tierEnums },
            fit_status: { type: Type.STRING, enum: ['Good Fit', 'Potential', 'Unlikely'] },
            qualification_summary: { type: Type.STRING },
            recommended_next_action: { type: Type.STRING },
            urgency_level: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
            risk_flags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['lead_tier', 'fit_status', 'qualification_summary', 'recommended_next_action', 'urgency_level', 'risk_flags'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('No text returned by Gemini');
    return JSON.parse(text) as QualificationResult;
  }

  /**
   * Try to qualify a lead using Groq API (OpenAI-compatible).
   */
  private async tryGroq(prompt: string): Promise<QualificationResult> {
    if (!this.groqClient) throw new Error('Groq client not initialized (GROQ_API_KEY not set)');

    const groqModel = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    this.logger.log(`[AI Provider] Trying Groq (${groqModel})...`);

    const completion = await this.groqClient.chat.completions.create({
      model: groqModel,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) throw new Error('No text returned by Groq');
    return JSON.parse(text) as QualificationResult;
  }

  /**
   * Try to qualify a lead using Ollama (local LLM).
   */
  private async tryOllama(prompt: string): Promise<QualificationResult> {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';
    this.logger.log(`[AI Provider] Trying Ollama (${ollamaModel} at ${ollamaUrl})...`);

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        prompt,
        format: 'json',
        stream: false,
        options: { temperature: 0.2 },
      }),
      signal: AbortSignal.timeout(60_000), // 60s timeout for local LLM
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with status ${response.status}`);
    }

    const data = await response.json() as { response: string };
    if (!data.response) throw new Error('No response from Ollama');
    return JSON.parse(data.response) as QualificationResult;
  }

  /**
   * Runs the AI qualification with fallback chain: Gemini → Groq → Ollama.
   */
  private async qualifyWithFallback(
    leadData: LeadScoringInput,
    ruleBasedScore: number | undefined,
    tierEnums: string[],
  ): Promise<QualificationResult> {
    const prompt = this.buildPrompt(leadData, ruleBasedScore, tierEnums);
    const errors: string[] = [];

    // 1. Try Gemini
    if (process.env.GEMINI_API_KEY) {
      try {
        const result = await this.tryGemini(prompt, tierEnums);
        this.logger.log('[AI Provider] ✅ Gemini succeeded.');
        return result;
      } catch (err) {
        const msg = (err as Error).message;
        errors.push(`Gemini: ${msg}`);
        this.logger.warn(`[AI Provider] ❌ Gemini failed: ${msg}. Trying Groq...`);
      }
    } else {
      this.logger.warn('[AI Provider] GEMINI_API_KEY not set. Skipping Gemini.');
    }

    // 2. Fallback to Groq
    if (process.env.GROQ_API_KEY) {
      try {
        const result = await this.tryGroq(prompt);
        this.logger.log('[AI Provider] ✅ Groq succeeded.');
        return result;
      } catch (err) {
        const msg = (err as Error).message;
        errors.push(`Groq: ${msg}`);
        this.logger.warn(`[AI Provider] ❌ Groq failed: ${msg}. Trying Ollama...`);
      }
    } else {
      this.logger.warn('[AI Provider] GROQ_API_KEY not set. Skipping Groq.');
    }

    // 3. Fallback to Ollama
    try {
      const result = await this.tryOllama(prompt);
      this.logger.log('[AI Provider] ✅ Ollama succeeded.');
      return result;
    } catch (err) {
      const msg = (err as Error).message;
      errors.push(`Ollama: ${msg}`);
      this.logger.warn(`[AI Provider] ❌ Ollama failed: ${msg}.`);
    }

    // All providers failed
    throw new Error(`All AI providers failed:\n${errors.join('\n')}`);
  }

  /**
   * Asynchronously analyzes a lead using the AI fallback chain (Gemini → Groq → Ollama).
   */
  async analyzeLeadWithAI(leadId: string, leadData: LeadScoringInput, ruleBasedScore?: number): Promise<void> {
    try {
      const settings = await this.prisma.systemSetting.findFirst();
      if (settings && !settings.is_ai_tiering_enabled) {
        this.logger.log('AI Tiering is disabled in System Settings. Skipping AI qualification.');
        return;
      }

      const tierEnums = ['Tier A', 'Tier B', 'Tier C', 'Disqualified'];
      if (!settings || settings.is_spam_detection_enabled) {
        tierEnums.push('Spam');
      }

      const parsed = await this.qualifyWithFallback(leadData, ruleBasedScore, tierEnums);

      const updatedLead = await this.prisma.lead.update({
        where: { id: leadId },
        data: {
          lead_tier: parsed.lead_tier,
          fit_status: parsed.fit_status,
          qualification_summary: parsed.qualification_summary,
          recommended_next_action: parsed.recommended_next_action,
          urgency_level: parsed.urgency_level,
        },
      });

      this.logger.log(`Successfully analyzed lead ${leadId} with AI.`);

      if (updatedLead.lead_tier !== 'Spam') {
        this.notificationsService
          .create({
            title: 'AI Scoring Complete',
            message: `${updatedLead.full_name ?? updatedLead.email} has been qualified by AI as ${updatedLead.lead_tier}.`,
            icon: 'sparkles',
            lead_id: updatedLead.id,
          })
          .catch((error) => this.logger.error('Failed to create AI scoring notification', error));
      }

      // Only qualified tiers get emails. Fire-and-forget so a slow/failing send never blocks qualification.
      if (updatedLead.lead_tier && ['Tier A', 'Tier B', 'Tier C'].includes(updatedLead.lead_tier)) {
        this.emailService
          .sendNewLeadAlert(updatedLead)
          .catch((error) => this.logger.error('Failed to send new lead alert email', error));
        this.emailService
          .sendProspectAutoReply(updatedLead)
          .catch((error) => this.logger.error('Failed to send auto-reply to prospect', error));
      }
    } catch (error) {
      this.logger.error(`Error analyzing lead ${leadId} with AI (all providers failed)`, error);
    }
  }
}
