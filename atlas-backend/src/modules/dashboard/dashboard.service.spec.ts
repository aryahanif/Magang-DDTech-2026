import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../database/prisma.service';

/**
 * Tests for:
 * - dashboard metrics (total leads, new leads, tier A, demo requests, conversion rate, groupings)
 */
describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    lead: {
      count: jest.Mock;
      groupBy: jest.Mock;
    };
    leadActivityLog: {
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      lead: {
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      leadActivityLog: {
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  /**
   * Utility: sets up all 12 parallel Promise.all mocks in order.
   * The order matches the destructuring in DashboardService.getMetrics().
   */
  function mockAllCounts({
    totalLeads = 100,
    newLeadsThisWeek = 10,
    newLeadsLastWeek = 8,
    tierALeads = 20,
    tierALeadsThisWeek = 3,
    tierALeadsLastWeek = 2,
    convertedLeads = 15,
    demoRequestsThisWeek = 5,
    demoRequestsLastWeek = 4,
    leadsByCountry = [{ country: 'Australia', _count: { id: 80 } }, { country: 'New Zealand', _count: { id: 20 } }],
    leadsByStatus = [{ status: 'New Lead', _count: { id: 60 } }, { status: 'Qualified', _count: { id: 40 } }],
    leadsBySource = [{ source_page: '/atlas', _count: { id: 70 } }, { source_page: null, _count: { id: 30 } }],
  } = {}) {
    prisma.lead.count
      .mockResolvedValueOnce(totalLeads)       // 0: total
      .mockResolvedValueOnce(newLeadsThisWeek)  // 1: new this week
      .mockResolvedValueOnce(newLeadsLastWeek)  // 2: new last week
      .mockResolvedValueOnce(tierALeads)        // 3: tier A total
      .mockResolvedValueOnce(tierALeadsThisWeek)// 4: tier A this week
      .mockResolvedValueOnce(tierALeadsLastWeek)// 5: tier A last week
      .mockResolvedValueOnce(convertedLeads);   // 6: converted

    prisma.leadActivityLog.count
      .mockResolvedValueOnce(demoRequestsThisWeek) // 7: demos this week
      .mockResolvedValueOnce(demoRequestsLastWeek); // 8: demos last week

    prisma.lead.groupBy
      .mockResolvedValueOnce(leadsByCountry)   // 9: by country
      .mockResolvedValueOnce(leadsByStatus)    // 10: by status
      .mockResolvedValueOnce(leadsBySource);   // 11: by source
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── Total leads ─────────────────────────────────────────────────────────────
  it('returns the correct total_leads count', async () => {
    mockAllCounts({ totalLeads: 100 });
    const result = await service.getMetrics();
    expect(result.total_leads).toBe(100);
  });

  // ─── New leads this week ──────────────────────────────────────────────────────
  it('returns the correct new_leads_this_week count', async () => {
    mockAllCounts({ newLeadsThisWeek: 14 });
    const result = await service.getMetrics();
    expect(result.new_leads_this_week).toBe(14);
  });

  // ─── Tier A leads ────────────────────────────────────────────────────────────
  it('returns the correct tier_a_leads count', async () => {
    mockAllCounts({ tierALeads: 25 });
    const result = await service.getMetrics();
    expect(result.tier_a_leads).toBe(25);
  });

  // ─── Demo requests ───────────────────────────────────────────────────────────
  it('uses demoRequestsThisWeek as demo_requests when it is greater than 0', async () => {
    mockAllCounts({ demoRequestsThisWeek: 5, convertedLeads: 15 });
    const result = await service.getMetrics();
    expect(result.demo_requests).toBe(5);
  });

  it('falls back to convertedLeads for demo_requests when demoRequestsThisWeek is 0', async () => {
    mockAllCounts({ demoRequestsThisWeek: 0, convertedLeads: 12 });
    const result = await service.getMetrics();
    expect(result.demo_requests).toBe(12);
  });

  // ─── Conversion rate ─────────────────────────────────────────────────────────
  it('calculates conversion_rate as (convertedLeads / totalLeads) * 100', async () => {
    mockAllCounts({ totalLeads: 100, convertedLeads: 15 });
    const result = await service.getMetrics();
    expect(result.conversion_rate).toBe(15.00);
  });

  it('returns conversion_rate of 0 when there are no leads', async () => {
    mockAllCounts({ totalLeads: 0, convertedLeads: 0 });
    const result = await service.getMetrics();
    expect(result.conversion_rate).toBe(0);
  });

  // ─── Leads by country grouping ────────────────────────────────────────────────
  it('transforms leads_by_country into a key-value map', async () => {
    mockAllCounts({
      leadsByCountry: [
        { country: 'Australia', _count: { id: 80 } },
        { country: 'New Zealand', _count: { id: 22 } },
      ],
    });
    const result = await service.getMetrics();
    expect(result.leads_by_country).toEqual({ Australia: 80, 'New Zealand': 22 });
  });

  it('skips country entries with a null country value', async () => {
    mockAllCounts({
      leadsByCountry: [
        { country: 'Australia', _count: { id: 80 } },
        { country: null, _count: { id: 5 } },
      ],
    });
    const result = await service.getMetrics();
    expect(result.leads_by_country).toEqual({ Australia: 80 });
    expect(result.leads_by_country).not.toHaveProperty('null');
  });

  // ─── Pipeline summary ────────────────────────────────────────────────────────
  it('builds pipeline_summary from lead statuses and merges Demo aliases', async () => {
    mockAllCounts({
      leadsByStatus: [
        { status: 'New Lead', _count: { id: 60 } },
        { status: 'Demo', _count: { id: 10 } },
        { status: 'Demo Booked', _count: { id: 5 } },
      ],
    });
    const result = await service.getMetrics();
    // "Demo" and "Demo Booked" should both be merged under "Demo Scheduled"
    expect(result.pipeline_summary['Demo Scheduled']).toBe(15);
    expect(result.pipeline_summary['New Lead']).toBe(60);
  });

  // ─── Leads by source ─────────────────────────────────────────────────────────
  it('transforms leads_by_source using source_page and defaults to "Website" for null', async () => {
    mockAllCounts({
      leadsBySource: [
        { source_page: '/atlas', _count: { id: 70 } },
        { source_page: null, _count: { id: 30 } },
      ],
    });
    const result = await service.getMetrics();
    expect(result.leads_by_source['/atlas']).toBe(70);
    expect(result.leads_by_source['Website']).toBe(30);
  });

  // ─── Trend calculations ──────────────────────────────────────────────────────
  it('returns a positive new_leads_trend when current week exceeds last week', async () => {
    mockAllCounts({ newLeadsThisWeek: 10, newLeadsLastWeek: 5 });
    const result = await service.getMetrics();
    expect(result.new_leads_trend).toBe(100.0); // 100% increase
  });

  it('returns a negative new_leads_trend when current week is lower than last week', async () => {
    mockAllCounts({ newLeadsThisWeek: 4, newLeadsLastWeek: 8 });
    const result = await service.getMetrics();
    expect(result.new_leads_trend).toBe(-50.0); // 50% decrease
  });

  it('returns 100 trend when previous period was 0 and current period has leads', async () => {
    mockAllCounts({ newLeadsThisWeek: 5, newLeadsLastWeek: 0 });
    const result = await service.getMetrics();
    expect(result.new_leads_trend).toBe(100);
  });

  it('returns 0 trend when both periods have 0 leads', async () => {
    mockAllCounts({ newLeadsThisWeek: 0, newLeadsLastWeek: 0 });
    const result = await service.getMetrics();
    expect(result.new_leads_trend).toBe(0);
  });
});
