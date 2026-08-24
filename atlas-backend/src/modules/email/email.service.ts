import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import type { Lead } from '@prisma/client';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly salesTeamEmail: string;
  private readonly emailFrom: string;
  private readonly dashboardUrl: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.salesTeamEmail = process.env.SALES_TEAM_EMAIL || '';
    this.emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    this.dashboardUrl = process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3000';
  }

  async sendNewLeadAlert(lead: Lead) {
    if (!this.salesTeamEmail) {
      this.logger.warn('SALES_TEAM_EMAIL is not configured; skipping new lead alert email');
      return;
    }

    const leadUrl = `${this.dashboardUrl}/leads/${lead.id}`;
    const subject = `[${lead.lead_tier}] New Lead from ${lead.company_name}`;

    const html = `
      <h2>New ${lead.lead_tier} Lead</h2>
      <p><strong>Name:</strong> ${lead.full_name ?? '-'}</p>
      <p><strong>Email:</strong> ${lead.email}</p>
      <p><strong>Phone:</strong> ${lead.phone ?? '-'}</p>
      <p><strong>Company:</strong> ${lead.company_name ?? '-'}</p>
      <h3>Problem Summary</h3>
      <p>${lead.qualification_summary ?? '-'}</p>
      <p><a href="${leadUrl}">View in Dashboard</a></p>
    `;

    const { error } = await this.resend.emails.send({
      from: this.emailFrom,
      to: this.salesTeamEmail,
      subject,
      html,
    });

    if (error) {
      throw new Error(`Failed to send new lead alert email: ${error.message}`);
    }
  }
}
