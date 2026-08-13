import { Injectable } from '@nestjs/common';

@Injectable()
export class QualificationService {
  /**
   * Calculates a rule-based score based on basic lead information.
   * Priority is given to target countries and target business types.
   */
  calculateRuleBasedScore(leadData: { country?: string; business_type?: string }): number {
    let score = 0;

    // 1. Country Logic
    const country = (leadData.country || '').trim().toLowerCase();
    if (country === 'australia' || country === 'new zealand') {
      score += 25;
    } else if (country === 'indonesia') {
      score += 10;
    } else {
      score += 5; // Default for others
    }

    // 2. Business Type Logic
    const businessType = (leadData.business_type || '').trim().toLowerCase();
    if (businessType === 'mortgage broker') {
      score += 30;
    } else if (businessType === 'finance broker') {
      score += 25;
    } else if (businessType === 'professional services') {
      score += 15;
    } else {
      score += 10; // Default for other SMEs
    }

    return score;
  }
}
