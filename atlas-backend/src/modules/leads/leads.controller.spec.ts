import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';

describe('LeadsController', () => {
  let controller: LeadsController;
  let service: { createLead: jest.Mock };

  const dto: CreateLeadDto = {
    full_name: 'John Smith',
    email: 'john@example.com',
    phone: '+61411222333',
    company_name: 'ABC Mortgage Brokers',
    country: 'Australia',
    business_type: 'Mortgage Broker',
    consent_status: true,
    cf_turnstile_token: 'test-turnstile-token',
  };

  beforeEach(async () => {
    service = { createLead: jest.fn() };
    global.fetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve({ success: true }) }) as jest.Mock;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadsController],
      providers: [{ provide: LeadsService, useValue: service }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LeadsController>(LeadsController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns success payload with the created lead id', async () => {
    service.createLead.mockResolvedValue({ id: 'uuid-1', ...dto });

    const result = await controller.create(dto);

    expect(service.createLead).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      success: true,
      lead_id: 'uuid-1',
      message: 'Lead submitted successfully',
    });
  });

  it('rejects the submission when Turnstile verification fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ json: () => Promise.resolve({ success: false }) });

    await expect(controller.create(dto)).rejects.toThrow(ForbiddenException);
    expect(service.createLead).not.toHaveBeenCalled();
  });
});
