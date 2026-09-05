import { Controller, Post, Body, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { LeadsService } from './leads.service';

@Controller('api/webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly leadsService: LeadsService) {}

  @Post('calendly')
  async handleCalendlyWebhook(
    @Body() payload: any,
    @Headers('x-calendly-signature') signature: string, // Simple placeholder for signature
  ) {
    // In a real MVP, you'd verify the signature with a secret key from your .env
    // e.g. const isValid = verifyCalendlySignature(payload, signature, process.env.CALENDLY_SECRET);
    // if (!isValid) throw new UnauthorizedException('Invalid signature');
    
    // For this demonstration, we'll assume a basic payload structure similar to Calendly's invitee.created
    const event = payload.event;
    
    if (event === 'invitee.created') {
      const email = payload.payload?.email;
      const meetingUrl = payload.payload?.join_url || payload.payload?.event?.location?.join_url || 'https://meet.google.com/demo';
      const startTime = payload.payload?.event?.start_time || new Date().toISOString();
      
      if (!email) {
        this.logger.warn('Received webhook without an email.');
        return { success: false, message: 'Missing email' };
      }

      await this.leadsService.handleDemoScheduled(email, new Date(startTime), meetingUrl);
      return { success: true };
    }

    return { success: true, message: 'Event ignored' };
  }
}
