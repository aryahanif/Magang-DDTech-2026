import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { LeadsService } from './leads.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { QualificationService } from '../qualification/qualification.service';

describe('LeadsService', () => {
  let service: LeadsService;
  let prisma: {
    lead: { create: jest.Mock; findMany: jest.Mock; update: jest.Mock };
    leadActivityLog: { create: jest.Mock };
    leadNote: { create: jest.Mock };
    $transaction: jest.Mock;
  };
  let qualificationService: {
    calculateRuleBasedScore: jest.Mock;
    analyzeLeadWithAI: jest.Mock;
  };
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
    prisma = {
      lead: { create: jest.fn(), findMany: jest.fn(), update: jest.fn() },
      leadActivityLog: { create: jest.fn() },
      leadNote: { create: jest.fn() },
      $transaction: jest.fn(async (ops: unknown[]) => Promise.all(ops)),
    };
    qualificationService = {
      calculateRuleBasedScore: jest.fn().mockReturnValue(55),
      analyzeLeadWithAI: jest.fn().mockResolvedValue(undefined),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: PrismaService, useValue: prisma },
        { provide: QualificationService, useValue: qualificationService },
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

  describe('findAll', () => {
    it('queries with no filters when the query is empty', async () => {
      prisma.lead.findMany.mockResolvedValue([]);

      await service.findAll({});

      expect(prisma.lead.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { created_at: 'desc' },
      });
    });

    it('builds a where clause from status, tier, and country filters', async () => {
      prisma.lead.findMany.mockResolvedValue([]);

      await service.findAll({ status: 'New Lead', tier: 'Tier A', country: 'Australia' });

      expect(prisma.lead.findMany).toHaveBeenCalledWith({
        where: { status: 'New Lead', lead_tier: 'Tier A', country: 'Australia' },
        orderBy: { created_at: 'desc' },
      });
    });

    it('searches full_name and company_name case-insensitively for search_keyword', async () => {
      prisma.lead.findMany.mockResolvedValue([]);

      await service.findAll({ search_keyword: 'acme' });

      expect(prisma.lead.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { full_name: { contains: 'acme', mode: 'insensitive' } },
            { company_name: { contains: 'acme', mode: 'insensitive' } },
          ],
        },
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('updateLeadStatus', () => {
    it('updates the lead and logs the activity atomically via $transaction', async () => {
      const updated = { id: 'lead-1', status: 'Demo Scheduled' };
      prisma.lead.update.mockResolvedValue(updated);
      prisma.leadActivityLog.create.mockResolvedValue({ id: 'log-1' });

      const result = await service.updateLeadStatus(
        'lead-1',
        { status: 'Demo Scheduled' },
        'admin-1',
      );

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.lead.update).toHaveBeenCalledWith({
        where: { id: 'lead-1' },
        data: { status: 'Demo Scheduled' },
      });
      expect(prisma.leadActivityLog.create).toHaveBeenCalledWith({
        data: {
          lead_id: 'lead-1',
          activity_type: 'STATUS_UPDATE',
          description: expect.stringContaining('admin-1'),
          metadata: { admin_user_id: 'admin-1', changes: { status: 'Demo Scheduled' } },
        },
      });
      expect(result).toBe(updated);
    });

    it('logs as OWNER_ASSIGNED when only assigned_owner changes', async () => {
      prisma.lead.update.mockResolvedValue({ id: 'lead-1' });
      prisma.leadActivityLog.create.mockResolvedValue({ id: 'log-1' });

      await service.updateLeadStatus('lead-1', { assigned_owner: 'Jane' }, 'admin-1');

      expect(prisma.leadActivityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ activity_type: 'OWNER_ASSIGNED' }) }),
      );
    });

    it('throws NotFoundException when the lead does not exist', async () => {
      prisma.$transaction.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        }),
      );

      await expect(
        service.updateLeadStatus('missing-id', { status: 'Demo Scheduled' }, 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addNoteToLead', () => {
    it('creates a lead note tied to the lead and the admin user', async () => {
      const created = { id: 'note-1', lead_id: 'lead-1', created_by: 'admin-1', note: 'Called, left voicemail' };
      prisma.leadNote.create.mockResolvedValue(created);

      const result = await service.addNoteToLead('lead-1', 'admin-1', { note: 'Called, left voicemail' });

      expect(prisma.leadNote.create).toHaveBeenCalledWith({
        data: { lead_id: 'lead-1', created_by: 'admin-1', note: 'Called, left voicemail' },
      });
      expect(result).toBe(created);
    });

    it('throws NotFoundException when the lead does not exist', async () => {
      prisma.leadNote.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
          code: 'P2003',
          clientVersion: '5.0.0',
        }),
      );

      await expect(
        service.addNoteToLead('missing-id', 'admin-1', { note: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
