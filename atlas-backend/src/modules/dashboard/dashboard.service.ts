import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateTrend(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  async getMetrics() {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(now.getDate() - 14);

    const [
      totalLeads, 
      newLeadsThisWeek, 
      newLeadsLastWeek,
      tierALeads,
      tierALeadsThisWeek,
      tierALeadsLastWeek,
      convertedLeads,
      demoRequestsThisWeek,
      demoRequestsLastWeek,
      leadsByCountryRaw,
      leadsByStatusRaw,
      leadsBySourceRaw
    ] = await Promise.all([
      // 0. Total leads
      this.prisma.lead.count(),
      // 1. New leads this week
      this.prisma.lead.count({ where: { created_at: { gte: sevenDaysAgo } } }),
      // 2. New leads last week
      this.prisma.lead.count({ where: { created_at: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
      // 3. Total Tier A leads
      this.prisma.lead.count({ where: { lead_tier: 'Tier A' } }),
      // 4. Tier A leads this week
      this.prisma.lead.count({ where: { lead_tier: 'Tier A', created_at: { gte: sevenDaysAgo } } }),
      // 5. Tier A leads last week
      this.prisma.lead.count({ where: { lead_tier: 'Tier A', created_at: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
      // 6. Total Converted Leads (Status)
      this.prisma.lead.count({ where: { status: { in: ['Demo Scheduled', 'Demo', 'Demo Booked'] } } }),
      // 7. Demo requests this week
      this.prisma.leadActivityLog.count({ where: { activity_type: 'DEMO_SCHEDULED', created_at: { gte: sevenDaysAgo } } }),
      // 8. Demo requests last week
      this.prisma.leadActivityLog.count({ where: { activity_type: 'DEMO_SCHEDULED', created_at: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
      // 9. Groupings
      this.prisma.lead.groupBy({ by: ['country'], _count: { id: true } }),
      this.prisma.lead.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.lead.groupBy({ by: ['source_page'], _count: { id: true } })
    ]);

    // Trends Calculation
    const totalLeadsTrend = this.calculateTrend(totalLeads, totalLeads - newLeadsThisWeek);
    const newLeadsTrend = this.calculateTrend(newLeadsThisWeek, newLeadsLastWeek);
    const tierATrend = this.calculateTrend(tierALeadsThisWeek, tierALeadsLastWeek);
    const demoRequestsTrend = this.calculateTrend(demoRequestsThisWeek, demoRequestsLastWeek);

    // Conversion rate logic
    const currentConversionRate = totalLeads === 0 ? 0 : (convertedLeads / totalLeads) * 100;
    
    // Approximate past conversion rate
    const totalLeadsLastWeekCumulative = totalLeads - newLeadsThisWeek;
    // We assume the number of converted leads up to last week is roughly total converted minus demo requests this week
    const convertedLeadsLastWeekCumulative = convertedLeads - demoRequestsThisWeek;
    
    const pastConversionRate = totalLeadsLastWeekCumulative <= 0 
      ? 0 
      : (Math.max(0, convertedLeadsLastWeekCumulative) / totalLeadsLastWeekCumulative) * 100;

    // Conversion rate trend is usually measured in percentage points (pp) difference
    const conversionRateTrend = currentConversionRate - pastConversionRate;

    // Grouping transforms
    const leadsByCountry = leadsByCountryRaw.reduce<Record<string, number>>((acc, curr) => {
      if (curr.country) acc[curr.country] = curr._count.id;
      return acc;
    }, {});

    const STATUS_ALIASES: Record<string, string> = {
      'Demo': 'Demo Scheduled',
      'Demo Booked': 'Demo Scheduled',
    };

    const pipelineSummary = leadsByStatusRaw.reduce<Record<string, number>>((acc, curr) => {
      if (curr.status) {
        const statusKey = STATUS_ALIASES[curr.status] || curr.status;
        acc[statusKey] = (acc[statusKey] || 0) + curr._count.id;
      }
      return acc;
    }, {});

    const leadsBySource = leadsBySourceRaw.reduce<Record<string, number>>((acc, curr) => {
      const source = curr.source_page || 'Website';
      acc[source] = (acc[source] || 0) + curr._count.id;
      return acc;
    }, {});

    return {
      total_leads: totalLeads,
      total_leads_trend: parseFloat(totalLeadsTrend.toFixed(1)),
      
      new_leads_this_week: newLeadsThisWeek,
      new_leads_trend: parseFloat(newLeadsTrend.toFixed(1)),
      
      tier_a_leads: tierALeads,
      tier_a_trend: parseFloat(tierATrend.toFixed(1)),
      
      demo_requests: demoRequestsThisWeek > 0 ? demoRequestsThisWeek : convertedLeads,
      demo_requests_trend: parseFloat(demoRequestsTrend.toFixed(1)),
      
      conversion_rate: parseFloat(currentConversionRate.toFixed(2)),
      conversion_rate_trend: parseFloat(conversionRateTrend.toFixed(2)), // in percentage points
      
      leads_by_country: leadsByCountry,
      pipeline_summary: pipelineSummary,
      leads_by_source: leadsBySource
    };
  }
}
