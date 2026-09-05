import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GoogleGenAI, Type } from '@google/genai';
import { EmailService } from '../email/email.service';

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

@Injectable()
export class QualificationService {
  private readonly logger = new Logger(QualificationService.name);
  private ai: GoogleGenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }

  /**
   * Calculates a rule-based score based on basic lead information.
   * Uses weighted criteria to generate a final score from 1.0 to 5.0.
   */
  calculateRuleBasedScore(leadData: any): number {
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

    // Spam / Missing Data Check
    if (!leadData.email || !leadData.company_name) intentScore -= 2;
    const spamWords = ['test', 'spam', 'asdf', '1234'];
    const messageText = (leadData.message || '').toLowerCase() + ' ' + (leadData.full_name || '').toLowerCase();
    if (spamWords.some(w => messageText.includes(w))) intentScore -= 3;

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
   * Asynchronously analyzes a lead using Google Gemini API.
   */
  async analyzeLeadWithAI(leadId: string, leadData: any, ruleBasedScore?: number): Promise<void> {
    try {
      const settings = await this.prisma.systemSetting.findFirst();
      if (settings && !settings.is_ai_tiering_enabled) {
        this.logger.log('AI Tiering is disabled in System Settings. Skipping Gemini AI qualification.');
        return;
      }

      if (!process.env.GEMINI_API_KEY) {
        this.logger.warn('GEMINI_API_KEY is not set. Skipping AI qualification.');
        return;
      }

      const prompt = `Anda adalah analis penjualan B2B profesional untuk Atlas, DDTech's AI Workforce Platform.
Analisis data klien berikut dan berikan wawasan mendalam mengenai potensi klien.

Informasi Sistem:
- Klien ini mendapatkan Rule-Based Score: ${ruleBasedScore ?? 'N/A'} (skala 1.0 - 5.0).
- Gunakan skor sistem tersebut sebagai salah satu acuan utama untuk menentukan lead_tier (Tier A/B/C). Skor tinggi (>4.0) mengindikasikan Tier A atau B.

Data Klien:
${JSON.stringify(leadData, null, 2)}`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              lead_tier: { type: Type.STRING, enum: ["Tier A", "Tier B", "Tier C", "Disqualified", "Spam"], description: "Kategori tier klien. Gunakan Spam untuk data palsu/tidak masuk akal, dan Disqualified untuk data sah yang tidak cocok dengan bisnis." },
              fit_status: { type: Type.STRING, enum: ["Good Fit", "Potential", "Unlikely"], description: "Kecocokan klien dengan produk" },
              qualification_summary: { type: Type.STRING, description: "Ringkasan analisis maksimal 2 kalimat" },
              recommended_next_action: { type: Type.STRING, description: "Aksi selanjutnya yang direkomendasikan" },
              urgency_level: { type: Type.STRING, enum: ["High", "Medium", "Low"], description: "Tingkat urgensi" },
              risk_flags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Bendera risiko atau data mencurigakan" }
            },
            required: ["lead_tier", "fit_status", "qualification_summary", "recommended_next_action", "urgency_level", "risk_flags"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error('Tidak ada teks yang dikembalikan oleh Gemini');
      }

      const parsed = JSON.parse(text);

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

      this.logger.log(`Berhasil menganalisis lead ${leadId} dengan AI.`);

      if (updatedLead.lead_tier !== 'Spam') {
        // Fire-and-forget so a slow/failing Resend call never blocks qualification.
        this.emailService
          .sendNewLeadAlert(updatedLead)
          .catch((error) => this.logger.error('Failed to send new lead alert email', error));
      }

      // Confirmation email only goes to genuine prospects (Tier A/B/C), not Spam/Disqualified.
      if (updatedLead.lead_tier && ['Tier A', 'Tier B', 'Tier C'].includes(updatedLead.lead_tier)) {
        this.emailService
          .sendProspectAutoReply(updatedLead)
          .catch((error) => this.logger.error('Failed to send auto-reply to prospect', error));
      }
    } catch (error) {
      this.logger.error(`Error menganalisis lead ${leadId} dengan AI`, error);
    }
  }
}

