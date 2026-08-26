import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { QualificationService } from '../qualification/qualification.service';
import { EmailService } from '../email/email.service';

describe('LeadsService', () => {
  let service: LeadsService;
  let prisma: { lead: { create: jest.Mock } };
  let qualificationService: {
    calculateRuleBasedScore: jest.Mock;
    analyzeLeadWithAI: jest.Mock;
  };
  let emailService: { sendProspectAutoReply: jest.Mock };

  const dto: CreateLeadDto = {
    full_name: 'John Smith',
    email: 'john@example.com',
    phone: '+61411222333',
    company_name: 'ABC Mortgage Brokers',
    country: 'Australia',
    business_type: 'Mortgage Broker',
    consent_status: true,
  };

  beforeEach(async () => {
    prisma = { lead: { create: jest.fn() } };
    qualificationService = {
      calculateRuleBasedScore: jest.fn().mockReturnValue(55),
      analyzeLeadWithAI: jest.fn().mockResolvedValue(undefined),
    };
    emailService = { sendProspectAutoReply: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: PrismaService, useValue: prisma },
        { provide: QualificationService, useValue: qualificationService },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  it('creates a lead via Prisma with the submitted data and calculated score', async () => {
    const created = { id: 'uuid-1', lead_score: 55, ...dto };
    prisma.lead.create.mockResolvedValue(created);

    const result = await service.createLead(dto);

    expect(qualificationService.calculateRuleBasedScore).toHaveBeenCalledWith(dto);
    expect(prisma.lead.create).toHaveBeenCalledWith({ data: { ...dto, lead_score: 55 } });
    expect(result).toBe(created);
  });

  it('triggers asynchronous AI analysis after creating the lead', async () => {
    const created = { id: 'uuid-1', lead_score: 55, ...dto };
    prisma.lead.create.mockResolvedValue(created);

    await service.createLead(dto);

    expect(qualificationService.analyzeLeadWithAI).toHaveBeenCalledWith(created.id, dto, 55);
  });

  it('does not let a failed AI analysis reject createLead', async () => {
    const created = { id: 'uuid-1', lead_score: 55, ...dto };
    prisma.lead.create.mockResolvedValue(created);
    qualificationService.analyzeLeadWithAI.mockRejectedValue(new Error('Gemini is down'));

    await expect(service.createLead(dto)).resolves.toBe(created);
  });

  it('sends the prospect auto-reply unconditionally after creating the lead', async () => {
    const created = { id: 'uuid-1', lead_score: 55, ...dto };
    prisma.lead.create.mockResolvedValue(created);

    await service.createLead(dto);

    expect(emailService.sendProspectAutoReply).toHaveBeenCalledWith(created);
  });

  it('does not let a failed auto-reply email reject createLead', async () => {
    const created = { id: 'uuid-1', lead_score: 55, ...dto };
    prisma.lead.create.mockResolvedValue(created);
    emailService.sendProspectAutoReply.mockRejectedValue(new Error('Resend is down'));

    await expect(service.createLead(dto)).resolves.toBe(created);
  });
});
