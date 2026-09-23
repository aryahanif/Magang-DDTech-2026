import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CalendlyService {
  private readonly logger = new Logger(CalendlyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async handleWebhook(payload: any) {
    this.logger.log(`Received Calendly webhook: ${payload.event}`);

    try {
      if (payload.event === 'invitee.created' || payload.event === 'invitee.canceled') {
        const inviteeEmail = payload.payload?.email;
        if (!inviteeEmail) {
          this.logger.warn('No email found in Calendly payload');
          return { success: false, message: 'No email found' };
        }

        // Find the lead by email
        const lead = await this.prisma.lead.findFirst({
          where: { email: inviteeEmail },
          orderBy: { created_at: 'desc' },
        });

        if (lead) {
          const isCreated = payload.event === 'invitee.created';
          const newStatus = isCreated ? 'Demo Booked' : 'Demo Canceled';
          
          await this.prisma.$transaction(async (tx) => {
            // Update Lead status
            await tx.lead.update({
              where: { id: lead.id },
              data: { status: newStatus },
            });

            // Log activity
            await tx.leadActivityLog.create({
              data: {
                lead_id: lead.id,
                activity_type: newStatus,
                description: `Calendly meeting was ${isCreated ? 'scheduled' : 'canceled'} by the lead.`,
                metadata: {
                  event: payload.event,
                  scheduling_url: payload.payload?.scheduling_url,
                  name: payload.payload?.name,
                }
              }
            });
          });

          this.logger.log(`Updated lead ${lead.id} status to ${newStatus}`);
          return { success: true, message: 'Lead updated successfully' };
        } else {
          this.logger.warn(`Lead not found for email: ${inviteeEmail}`);
          return { success: false, message: 'Lead not found for this email' };
        }
      }

      return { success: true, message: 'Event ignored' };
    } catch (error) {
      this.logger.error('Error handling Calendly webhook', error);
      throw new Error('Internal Server Error processing webhook');
    }
  }
}
