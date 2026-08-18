import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';

describe('LeadsService', () => {
  let service: LeadsService;
  let prisma: { lead: { create: jest.Mock } };

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  it('creates a lead via Prisma with the submitted data', async () => {
    const created = { id: 'uuid-1', ...dto };
    prisma.lead.create.mockResolvedValue(created);

    const result = await service.createLead(dto);

    expect(prisma.lead.create).toHaveBeenCalledWith({ data: dto });
    expect(result).toBe(created);
  });
});
