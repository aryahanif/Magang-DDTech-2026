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
  let prisma: { lead: { update: jest.Mock } };
  let emailService: { sendNewLeadAlert: jest.Mock; sendProspectAutoReply: jest.Mock };

  beforeEach(async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    prisma = { lead: { update: jest.fn() } };
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
    it('should calculate max score for Australia and Mortgage Broker', () => {
      const data = { country: 'Australia', business_type: 'Mortgage Broker', current_problem: 'Manual client onboarding and document collection', automation_interest: 'AI assistant for broker workflow', message: 'We want to explore automation', email: 'john@company.com', company_name: 'Company' };
      // Country (5*0.3) + Business (5*0.4) + Intent (5*0.3) = 1.5 + 2.0 + 1.5 = 5.0
      expect(service.calculateRuleBasedScore(data)).toBe(5);
    });

    it('should calculate intermediate score for New Zealand and Finance Broker', () => {
      const data = { country: 'New Zealand', business_type: 'Finance Broker', email: 'john@company.com', company_name: 'Company' };
      // Country (5*0.3) + Business (4*0.4) + Intent (2*0.3) = 1.5 + 1.6 + 0.6 = 3.7 => round to 4
      expect(service.calculateRuleBasedScore(data)).toBe(4);
    });

    it('should handle case insensitivity and extra spaces', () => {
      const data = { country: '  aUstraliA ', business_type: 'pROFessional services', email: 'john@company.com', company_name: 'Company' };
      // Country (5*0.3) + Business (3*0.4) + Intent (2*0.3) = 1.5 + 1.2 + 0.6 = 3.3 => round to 3
      expect(service.calculateRuleBasedScore(data)).toBe(3);
    });

    it('should provide default minimum score for unknown values', () => {
      const data = { country: 'Japan', business_type: 'Retail', email: 'john@company.com', company_name: 'Company' };
      // Country (1*0.3) + Business (1*0.4) + Intent (2*0.3) = 0.3 + 0.4 + 0.6 = 1.3 => round to 1
      expect(service.calculateRuleBasedScore(data)).toBe(1);
    });

    it('should handle missing fields and penalties', () => {
      const data = {};
      // Default (1*0.3) + (1*0.4) + Intent (1*0.3) = 1.0
      expect(service.calculateRuleBasedScore(data)).toBe(1);
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
