import { Test, TestingModule } from '@nestjs/testing';
import { QualificationService } from './qualification.service';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';

const generateContent = jest.fn();
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({ models: { generateContent } })),
  Type: { OBJECT: 'OBJECT', STRING: 'STRING', ARRAY: 'ARRAY' },
}));

// Mock Groq SDK so we can simulate fallback
const chatCompletionsCreate = jest.fn();
jest.mock('groq-sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: { completions: { create: chatCompletionsCreate } },
  })),
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
    const notificationsService = { create: jest.fn().mockResolvedValue(undefined) };
    generateContent.mockReset();
    chatCompletionsCreate.mockReset();
    process.env.GROQ_API_KEY = 'test-groq-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QualificationService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmailService, useValue: emailService },
        { provide: NotificationsService, useValue: notificationsService },
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

  // ─── AI qualification fallback chain ──────────────────────────────────────────
  describe('AI qualification fallback chain', () => {
    const validAiResponse = {
      lead_tier: 'Tier A',
      fit_status: 'Good Fit',
      qualification_summary: 'High-value prospect.',
      recommended_next_action: 'Schedule a demo.',
      urgency_level: 'High',
      risk_flags: [],
    };

    beforeEach(() => {
      prisma.lead.update.mockResolvedValue({ id: 'lead-1', lead_tier: 'Tier A' });
    });

    it('uses Gemini when it succeeds (primary provider)', async () => {
      generateContent.mockResolvedValue({ text: JSON.stringify(validAiResponse) });

      await service.analyzeLeadWithAI('lead-1', {});

      expect(generateContent).toHaveBeenCalledTimes(1);
      expect(chatCompletionsCreate).not.toHaveBeenCalled();
    });

    it('falls back to Groq when Gemini throws an error', async () => {
      generateContent.mockRejectedValue(new Error('Gemini API 503'));
      chatCompletionsCreate.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(validAiResponse) } }],
      });

      await service.analyzeLeadWithAI('lead-1', {});

      expect(generateContent).toHaveBeenCalledTimes(1);
      expect(chatCompletionsCreate).toHaveBeenCalledTimes(1);
    });

    it('falls back to Ollama when both Gemini and Groq throw errors', async () => {
      generateContent.mockRejectedValue(new Error('Gemini API 503'));
      chatCompletionsCreate.mockRejectedValue(new Error('Groq rate limit exceeded'));

      // Mock global fetch for Ollama
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ response: JSON.stringify(validAiResponse) }),
      }) as jest.Mock;

      await service.analyzeLeadWithAI('lead-1', {});

      expect(generateContent).toHaveBeenCalledTimes(1);
      expect(chatCompletionsCreate).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/generate'),
        expect.any(Object),
      );
    });

    it('does not throw and logs an error when all three providers fail', async () => {
      generateContent.mockRejectedValue(new Error('Gemini down'));
      chatCompletionsCreate.mockRejectedValue(new Error('Groq down'));
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 }) as jest.Mock;

      // Should resolve (not reject) — errors are caught internally
      await expect(service.analyzeLeadWithAI('lead-1', {})).resolves.toBeUndefined();
      // Lead should NOT be updated since all providers failed
      expect(prisma.lead.update).not.toHaveBeenCalled();
    });

    it('skips Groq when GROQ_API_KEY is not set and falls through to Ollama', async () => {
      delete process.env.GROQ_API_KEY;
      generateContent.mockRejectedValue(new Error('Gemini down'));
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ response: JSON.stringify(validAiResponse) }),
      }) as jest.Mock;

      await service.analyzeLeadWithAI('lead-1', {});

      // Groq should never be called because the key isn't set
      expect(chatCompletionsCreate).not.toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalled();
    });

    it('skips AI analysis entirely when is_ai_tiering_enabled is false', async () => {
      prisma.systemSetting.findFirst.mockResolvedValue({
        is_ai_tiering_enabled: false,
        is_spam_detection_enabled: true,
      });

      await service.analyzeLeadWithAI('lead-1', {});

      expect(generateContent).not.toHaveBeenCalled();
      expect(chatCompletionsCreate).not.toHaveBeenCalled();
      expect(prisma.lead.update).not.toHaveBeenCalled();
    });
  });
});
