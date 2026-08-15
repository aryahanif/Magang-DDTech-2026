import { Injectable } from '@nestjs/common';

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
}
