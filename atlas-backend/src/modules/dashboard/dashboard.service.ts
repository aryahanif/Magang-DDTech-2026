import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalLeads, newLeadsThisWeek, tierALeads, convertedLeads, allLeads] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.count({
        where: {
          created_at: {
            gte: sevenDaysAgo,
          },
        },
      }),
      this.prisma.lead.count({
        where: {
          lead_tier: 'Tier A',
        },
      }),
      this.prisma.lead.count({
        where: {
          status: 'Demo Scheduled',
        },
      }),
      this.prisma.lead.findMany({
        select: {
          country: true,
          source_page: true,
          status: true,
        },
      }),
    ]);

    const conversionRate = totalLeads === 0 ? 0 : (convertedLeads / totalLeads) * 100;

    const leads_by_country: Record<string, number> = { Australia: 0, 'New Zealand': 0, Indonesia: 0 };
    const leads_by_source: Record<string, number> = { Website: 0, 'Outbound AI': 0, Referral: 0, Events: 0, Partners: 0 };
    const pipeline_summary: Record<string, number> = {
      'New Lead': 0,
      'Qualified': 0,
      'Contacted': 0,
      'Meeting Requested': 0,
      'Demo Scheduled': 0,
      'Proposal Sent': 0,
      'Negotiation': 0,
      'Won': 0,
      'Lost': 0,
      'Disqualified': 0,
    };
    
    let demo_requests = 0;

    allLeads.forEach(lead => {
      // 1. Pipeline Summary
      const status = lead.status || 'New Lead';
      if (pipeline_summary[status] !== undefined) {
        pipeline_summary[status]++;
      } else {
        pipeline_summary['New Lead']++; // Default if unknown status
      }

      if (status === 'Demo Scheduled') {
        demo_requests++;
      }

      // 2. Leads by Country
      const country = lead.country;
      if (country === 'Australia' || country === 'New Zealand' || country === 'Indonesia') {
        leads_by_country[country]++;
      } else if (country) {
        // fallback unknown countries to Indonesia for mock data if needed, or leave it. 
        // We'll just map unknown to Indonesia for charting purposes if we want it visible
        leads_by_country['Indonesia']++;
      }

      // 3. Leads by Source
      const source = lead.source_page;
      if (source && leads_by_source[source] !== undefined) {
        leads_by_source[source]++;
      } else {
        leads_by_source['Website']++;
      }
    });

    return {
      total_leads: totalLeads,
      new_leads_this_week: newLeadsThisWeek,
      tier_a_leads: tierALeads,
      demo_requests,
      conversion_rate: parseFloat(conversionRate.toFixed(2)),
      leads_by_country,
      leads_by_source,
      pipeline_summary,
    };
  }
}
