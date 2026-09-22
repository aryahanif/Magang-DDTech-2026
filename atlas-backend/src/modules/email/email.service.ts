import { Injectable, Logger } from '@nestjs/common';
import type { Lead } from '@prisma/client';

const MAILTRAP_SEND_URL = 'https://send.api.mailtrap.io/api/send';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly mailtrapToken: string;
  private readonly salesTeamEmail: string;
  private readonly emailFrom: string;
  private readonly dashboardUrl: string;

  constructor() {
    this.mailtrapToken = process.env.MAILTRAP_API_TOKEN || '';
    this.salesTeamEmail = process.env.SALES_TEAM_EMAIL || '';
    this.emailFrom = process.env.EMAIL_FROM || 'onboarding@atlas.dev';
    this.dashboardUrl = process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3000';
  }

  private async send(to: string, subject: string, html: string) {
    const response = await fetch(MAILTRAP_SEND_URL, {
      method: 'POST',
      headers: {
        Authorization: \Bearer \\,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: { email: this.emailFrom },
        to: [{ email: to }],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(\Mailtrap request failed (\): \\);
    }
  }

  async sendNewLeadAlert(lead: Lead) {
    if (!this.salesTeamEmail) {
      this.logger.warn('SALES_TEAM_EMAIL is not configured; skipping new lead alert email');
      return;
    }

    const leadUrl = \\/leads/\\;
    const subject = \[\] New Lead from \\;

    const html = \
      <h2>New \ Lead</h2>
      <p><strong>Name:</strong> \</p>
      <p><strong>Email:</strong> \</p>
      <p><strong>Phone:</strong> \</p>
      <p><strong>Company:</strong> \</p>
      <h3>Problem Summary</h3>
      <p>\</p>
      <p><a href="\">View in Dashboard</a></p>
    \;

    try {
      await this.send(this.salesTeamEmail, subject, html);
    } catch (error) {
      throw new Error(\Failed to send new lead alert email: \\);
    }
  }

  async sendProspectAutoReply(lead: Lead) {
    const html = \
      <p>Hi \,</p>
      <p>Thank you for reaching out to Atlas. We have received your request regarding <strong>\</strong>.</p>
      <p>Our team is currently reviewing your details to understand how our AI Workforce Platform can best assist you. One of our automation specialists will be in touch with you shortly.</p>
      <p>Best regards,<br>The Atlas Team</p>
    \;

    try {
      await this.send(lead.email, "We've Received Your Request - Atlas AI Platform", html);
    } catch (error) {
      throw new Error(\Failed to send prospect auto-reply email: \\);
    }
  }

  async sendPasswordResetEmail(email: string, resetUrl: string) {
    const subject = \Reset Your Password - Atlas AI Platform\;
    const html = \
      <h2>Password Reset Request</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password for the Atlas Admin Dashboard.</p>
      <p>Please click the link below to reset your password. This link will expire in 1 hour.</p>
      <p><a href="\">Reset Password</a></p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,<br>The Atlas Team</p>
    \;

    try {
      await this.send(email, subject, html);
    } catch (error) {
      throw new Error(\Failed to send password reset email: \\);
    }
  }
}
