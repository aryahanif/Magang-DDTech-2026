import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalLeads, newLeadsThisWeek, tierALeads, convertedLeads] = await Promise.all([
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
    ]);

    const conversionRate = totalLeads === 0 ? 0 : (convertedLeads / totalLeads) * 100;

    return {
      total_leads: totalLeads,
      new_leads_this_week: newLeadsThisWeek,
      tier_a_leads: tierALeads,
      conversion_rate: parseFloat(conversionRate.toFixed(2)),
    };
  }
}
