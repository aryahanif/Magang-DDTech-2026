import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import request from 'supertest';
import { App } from 'supertest/types';
import { AdminLeadsController } from '../src/modules/leads/admin-leads.controller';
import { LeadsService } from '../src/modules/leads/leads.service';
import { JwtStrategy } from '../src/modules/auth/jwt.strategy';
import { JwtAuthGuard } from '../src/modules/auth/jwt-auth.guard';

describe('GET /api/admin/leads/export (e2e)', () => {
  let app: INestApplication<App>;
  let leadsService: { exportLeadsToCsv: jest.Mock };

  const buildApp = async (overrideGuard: boolean) => {
    leadsService = { exportLeadsToCsv: jest.fn() };

    const builder = Test.createTestingModule({
      imports: [PassportModule],
      controllers: [AdminLeadsController],
      providers: [
        JwtStrategy,
        { provide: LeadsService, useValue: leadsService },
      ],
    });

    if (overrideGuard) {
      builder.overrideGuard(JwtAuthGuard).useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest<{ user: { id: string } }>().user = {
            id: 'admin-1',
          };
          return true;
        },
      });
    }

    const moduleFixture: TestingModule = await builder.compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  };

  afterEach(async () => {
    await app.close();
  });

  it('rejects requests without a JWT (AC2)', async () => {
    await buildApp(false);
    await request(app.getHttpServer())
      .get('/api/admin/leads/export')
      .expect(401);
  });

  it('streams a CSV attachment for an authenticated admin, forwarding filters (AC3, AC5)', async () => {
    await buildApp(true);
    leadsService.exportLeadsToCsv.mockResolvedValue(
      'full_name,email,company_name,country,business_type,lead_tier,lead_score,status\r\nJohn,j@e.com,ABC,AU,MB,Tier A,90,New Lead',
    );

    const res = await request(app.getHttpServer())
      .get('/api/admin/leads/export?tier=Tier%20A')
      .expect(200);

    expect(res.header['content-type']).toContain('text/csv');
    expect(res.header['content-disposition']).toBe(
      'attachment; filename="leads.csv"',
    );
    expect(res.text).toContain(
      'full_name,email,company_name,country,business_type,lead_tier,lead_score,status',
    );
    expect(leadsService.exportLeadsToCsv).toHaveBeenCalledWith(
      expect.objectContaining({ tier: 'Tier A' }),
    );
  });
});
