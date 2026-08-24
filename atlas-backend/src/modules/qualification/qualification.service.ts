import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GoogleGenAI, Type } from '@google/genai';
import { EmailService } from '../email/email.service';

// Define configuration for scoring weights and individual criteria scores (1-5 scale)
const SCORING_CONFIG = {
  WEIGHTS: {
    COUNTRY: 0.4,
    BUSINESS_TYPE: 0.6,
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
  calculateRuleBasedScore(leadData: { country?: string; business_type?: string }): number {
    // 1. Country Score (1-5)
    const country = (leadData.country || '').trim().toLowerCase();
    const countryScore = SCORING_CONFIG.COUNTRY_SCORES[country] || SCORING_CONFIG.COUNTRY_SCORES['default'];

    // 2. Business Type Score (1-5)
    const businessType = (leadData.business_type || '').trim().toLowerCase();
    const businessScore = SCORING_CONFIG.BUSINESS_TYPE_SCORES[businessType] || SCORING_CONFIG.BUSINESS_TYPE_SCORES['default'];

    // Calculate weighted average
    const finalScore = (countryScore * SCORING_CONFIG.WEIGHTS.COUNTRY) + (businessScore * SCORING_CONFIG.WEIGHTS.BUSINESS_TYPE);

    // Round to 1 decimal place (e.g., 4.4, 3.8)
    return Math.round(finalScore * 10) / 10;
  }

  /**
   * Asynchronously analyzes a lead using Google Gemini API.
   */
  async analyzeLeadWithAI(leadId: string, leadData: any): Promise<void> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        this.logger.warn('GEMINI_API_KEY is not set. Skipping AI qualification.');
        return;
      }

      const prompt = `Anda adalah analis penjualan B2B profesional untuk Atlas, DDTech's AI Workforce Platform.
Analisis data klien berikut dan berikan wawasan mendalam mengenai potensi klien.

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
              lead_tier: { type: Type.STRING, enum: ["Tier A", "Tier B", "Tier C"], description: "Kategori tier klien" },
              fit_status: { type: Type.STRING, enum: ["Good Fit", "Potential", "Unlikely"], description: "Kecocokan klien dengan produk" },
              qualification_summary: { type: Type.STRING, description: "Ringkasan analisis maksimal 2 kalimat" },
              recommended_next_action: { type: Type.STRING, description: "Aksi selanjutnya yang direkomendasikan" },
              urgency_level: { type: Type.STRING, enum: ["High", "Medium", "Low"], description: "Tingkat urgensi" }
            },
            required: ["lead_tier", "fit_status", "qualification_summary", "recommended_next_action", "urgency_level"]
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

      if (updatedLead.lead_tier === 'Tier A') {
        // Fire-and-forget so a slow/failing Resend call never blocks qualification.
        this.emailService
          .sendNewLeadAlert(updatedLead)
          .catch((error) => this.logger.error('Failed to send new lead alert email', error));
      }
    } catch (error) {
      this.logger.error(`Error menganalisis lead ${leadId} dengan AI`, error);
    }
  }
}

