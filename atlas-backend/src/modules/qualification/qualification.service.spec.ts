import { Test, TestingModule } from '@nestjs/testing';
import { QualificationService } from './qualification.service';

describe('QualificationService', () => {
  let service: QualificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QualificationService],
    }).compile();

    service = module.get<QualificationService>(QualificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateRuleBasedScore', () => {
    it('should calculate max score for Australia and Mortgage Broker', () => {
      const data = { country: 'Australia', business_type: 'Mortgage Broker' };
      // Country (5 * 0.4) + Business (5 * 0.6) = 2.0 + 3.0 = 5.0
      expect(service.calculateRuleBasedScore(data)).toBe(5);
    });

    it('should calculate intermediate score for New Zealand and Finance Broker', () => {
      const data = { country: 'New Zealand', business_type: 'Finance Broker' };
      // Country (5 * 0.4) + Business (4 * 0.6) = 2.0 + 2.4 = 4.4
      expect(service.calculateRuleBasedScore(data)).toBe(4.4);
    });

    it('should handle case insensitivity and extra spaces', () => {
      const data = { country: '  aUstraliA ', business_type: 'pROFessional services' };
      // Country (5 * 0.4) + Business (3 * 0.6) = 2.0 + 1.8 = 3.8
      expect(service.calculateRuleBasedScore(data)).toBe(3.8);
    });

    it('should provide default minimum score for unknown values', () => {
      const data = { country: 'Japan', business_type: 'Retail' };
      // Country (1 * 0.4) + Business (1 * 0.6) = 0.4 + 0.6 = 1.0
      expect(service.calculateRuleBasedScore(data)).toBe(1);
    });

    it('should handle missing fields', () => {
      const data = {};
      // Default (1 * 0.4) + (1 * 0.6) = 1.0
      expect(service.calculateRuleBasedScore(data)).toBe(1);
    });
  });
});
