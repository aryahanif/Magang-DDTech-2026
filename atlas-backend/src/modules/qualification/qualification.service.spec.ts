import { Test, TestingModule } from '@nestjs/testing';
import { QualificationService } from './qualification.service';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';

const generateContent = jest.fn();
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({ models: { generateContent } })),
  Type: { OBJECT: 'OBJECT', STRING: 'STRING', ARRAY: 'ARRAY' },
}));

describe('QualificationService', () => {
  let service: QualificationService;
  let prisma: { lead: { update: jest.Mock }; systemSetting: { findFirst: jest.Mock } };
  let emailService: { sendNewLeadAlert: jest.Mock; sendProspectAutoReply: jest.Mock };

  beforeEach(async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    prisma = {
      lead: { update: jest.fn() },
      systemSetting: {
        findFirst: jest.fn().mockResolvedValue({ is_ai_tiering_enabled: true, is_spam_detection_enabled: true }),
      },
    };
    emailService = {
      sendNewLeadAlert: jest.fn().mockResolvedValue(undefined),
      sendProspectAutoReply: jest.fn().mockResolvedValue(undefined),
    };
    generateContent.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QualificationService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get<QualificationService>(QualificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateRuleBasedScore', () => {
    it('should calculate max score for Australia and Mortgage Broker', async () => {
      const data = { country: 'Australia', business_type: 'Mortgage Broker', current_problem: 'Manual client onboarding and document collection', automation_interest: 'AI assistant for broker workflow', message: 'We want to explore automation', email: 'john@company.com', company_name: 'Company' };
      // Country (5*0.3) + Business (5*0.4) + Intent (5*0.3) = 1.5 + 2.0 + 1.5 = 5.0
      await expect(service.calculateRuleBasedScore(data)).resolves.toBe(5);
    });

    it('should calculate intermediate score for New Zealand and Finance Broker', async () => {
      const data = { country: 'New Zealand', business_type: 'Finance Broker', email: 'john@company.com', company_name: 'Company' };
      // Country (5*0.3) + Business (4*0.4) + Intent (2*0.3) = 1.5 + 1.6 + 0.6 = 3.7 => round to 4
      await expect(service.calculateRuleBasedScore(data)).resolves.toBe(4);
    });

    it('should handle case insensitivity and extra spaces', async () => {
      const data = { country: '  aUstraliA ', business_type: 'pROFessional services', email: 'john@company.com', company_name: 'Company' };
      // Country (5*0.3) + Business (3*0.4) + Intent (2*0.3) = 1.5 + 1.2 + 0.6 = 3.3 => round to 3
      await expect(service.calculateRuleBasedScore(data)).resolves.toBe(3);
    });

    it('should provide default minimum score for unknown values', async () => {
      const data = { country: 'Japan', business_type: 'Retail', email: 'john@company.com', company_name: 'Company' };
      // Country (1*0.3) + Business (1*0.4) + Intent (2*0.3) = 0.3 + 0.4 + 0.6 = 1.3 => round to 1
      await expect(service.calculateRuleBasedScore(data)).resolves.toBe(1);
    });

    it('should handle missing fields and penalties', async () => {
      const data = {};
      // Default (1*0.3) + (1*0.4) + Intent (1*0.3) = 1.0
      await expect(service.calculateRuleBasedScore(data)).resolves.toBe(1);
    });

    it('should skip spam/missing-data penalties when spam detection is disabled', async () => {
      prisma.systemSetting.findFirst.mockResolvedValue({ is_spam_detection_enabled: false });
      const data = { country: 'Australia', business_type: 'Mortgage Broker', message: 'this is spam' };
      // With detection ON, missing email/company (-2) and the "spam" keyword (-3) would clamp intent to 1
      // (score 3). With detection OFF those penalties don't apply: intent = 1 (base) + 1 (has message) = 2.
      // Country (5*0.3) + Business (5*0.4) + Intent (2*0.3) = 1.5 + 2.0 + 0.6 = 4.1 => round to 4
      await expect(service.calculateRuleBasedScore(data)).resolves.toBe(4);
    });
  });

  describe('analyzeLeadWithAI email alert', () => {
    const mockAiReply = (lead_tier: string) => {
      generateContent.mockResolvedValue({
        text: JSON.stringify({
          lead_tier,
          fit_status: 'Potential',
          qualification_summary: 'summary',
          recommended_next_action: 'follow up',
          urgency_level: 'Medium',
          risk_flags: [],
        }),
      });
      prisma.lead.update.mockResolvedValue({ id: 'lead-1', lead_tier });
    };

    it.each(['Tier A', 'Tier B', 'Tier C'])('sends the alert for %s', async (tier) => {
      mockAiReply(tier);

      await service.analyzeLeadWithAI('lead-1', {});

      expect(emailService.sendNewLeadAlert).toHaveBeenCalledWith({ id: 'lead-1', lead_tier: tier });
    });

    it('does not send the alert for Spam', async () => {
      mockAiReply('Spam');

      await service.analyzeLeadWithAI('lead-1', {});

      expect(emailService.sendNewLeadAlert).not.toHaveBeenCalled();
    });
  });

  describe('analyzeLeadWithAI prospect confirmation email', () => {
    const mockAiReply = (lead_tier: string) => {
      generateContent.mockResolvedValue({
        text: JSON.stringify({
          lead_tier,
          fit_status: 'Potential',
          qualification_summary: 'summary',
          recommended_next_action: 'follow up',
          urgency_level: 'Medium',
          risk_flags: [],
        }),
      });
      prisma.lead.update.mockResolvedValue({ id: 'lead-1', lead_tier });
    };

    it.each(['Tier A', 'Tier B', 'Tier C'])('sends the confirmation email for %s', async (tier) => {
      mockAiReply(tier);

      await service.analyzeLeadWithAI('lead-1', {});

      expect(emailService.sendProspectAutoReply).toHaveBeenCalledWith({ id: 'lead-1', lead_tier: tier });
    });

    it.each(['Spam', 'Disqualified'])('does not send the confirmation email for %s', async (tier) => {
      mockAiReply(tier);

      await service.analyzeLeadWithAI('lead-1', {});

      expect(emailService.sendProspectAutoReply).not.toHaveBeenCalled();
    });
  });
});
