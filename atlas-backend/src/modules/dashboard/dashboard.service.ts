import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalLeads, 
      newLeadsThisWeek, 
      tierALeads, 
      convertedLeads,
      demoRequests,
      leadsByCountryRaw,
      leadsByStatusRaw,
      leadsBySourceRaw
    ] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.count({
        where: { created_at: { gte: sevenDaysAgo } },
      }),
      this.prisma.lead.count({
        where: { lead_tier: 'Tier A' },
      }),
      this.prisma.lead.count({
        where: { status: { in: ['Demo Scheduled', 'Demo', 'Demo Booked'] } },
      }),
      this.prisma.leadActivityLog.count({
        where: { activity_type: 'DEMO_SCHEDULED' }
      }),
      this.prisma.lead.groupBy({ by: ['country'], _count: { id: true } }),
      this.prisma.lead.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.lead.groupBy({ by: ['source_page'], _count: { id: true } })
    ]);

    const conversionRate = totalLeads === 0 ? 0 : (convertedLeads / totalLeads) * 100;

    const leadsByCountry = leadsByCountryRaw.reduce((acc, curr) => {
      if (curr.country) acc[curr.country] = curr._count.id;
      return acc;
    }, {});

    const pipelineSummary = leadsByStatusRaw.reduce((acc, curr) => {
      if (curr.status) {
        let statusKey = curr.status;
        if (statusKey === 'Demo Scheduled' || statusKey === 'Demo') {
          statusKey = 'Demo Booked';
        } else if (statusKey === 'Proposal Sent') {
          statusKey = 'Proposal';
        } else if (statusKey === 'Won' || statusKey === 'Lost') {
          statusKey = 'Won / Lost';
        }
        acc[statusKey] = (acc[statusKey] || 0) + curr._count.id;
      }
      return acc;
    }, {});

    const leadsBySource = leadsBySourceRaw.reduce((acc, curr) => {
      const source = curr.source_page || 'Website';
      acc[source] = (acc[source] || 0) + curr._count.id;
      return acc;
    }, {});

    return {
      total_leads: totalLeads,
      new_leads_this_week: newLeadsThisWeek,
      tier_a_leads: tierALeads,
      demo_requests: demoRequests > 0 ? demoRequests : convertedLeads,
      conversion_rate: parseFloat(conversionRate.toFixed(2)),
      leads_by_country: leadsByCountry,
      pipeline_summary: pipelineSummary,
      leads_by_source: leadsBySource
    };
  }
}
