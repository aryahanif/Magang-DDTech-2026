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
    it('should calculate score for Australia and Mortgage Broker', () => {
      const data = { country: 'Australia', business_type: 'Mortgage Broker' };
      // Australia (25) + Mortgage Broker (30) = 55
      expect(service.calculateRuleBasedScore(data)).toBe(55);
    });

    it('should calculate score for New Zealand and Finance Broker', () => {
      const data = { country: 'New Zealand', business_type: 'Finance Broker' };
      // New Zealand (25) + Finance Broker (25) = 50
      expect(service.calculateRuleBasedScore(data)).toBe(50);
    });

    it('should handle case insensitivity and extra spaces', () => {
      const data = { country: '  aUstraliA ', business_type: 'pROFessional services' };
      // Australia (25) + Professional services (15) = 40
      expect(service.calculateRuleBasedScore(data)).toBe(40);
    });

    it('should provide default score for unknown values', () => {
      const data = { country: 'Japan', business_type: 'Retail' };
      // Default country (5) + Default business (10) = 15
      expect(service.calculateRuleBasedScore(data)).toBe(15);
    });

    it('should handle missing fields', () => {
      const data = {};
      // Default country (5) + Default business (10) = 15
      expect(service.calculateRuleBasedScore(data)).toBe(15);
    });
  });
});
