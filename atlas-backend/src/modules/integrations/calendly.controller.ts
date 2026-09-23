import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CalendlyService } from './calendly.service';
import { Throttle } from '@nestjs/throttler';

@Controller('api/integrations/calendly')
export class CalendlyController {
  constructor(private readonly calendlyService: CalendlyService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  // Disable throttle temporarily for webhooks or use generous limits
  @Throttle({ default: { limit: 500, ttl: 60000 } })
  async handleWebhook(@Body() payload: any) {
    // Calendly expects a 200 OK immediately.
    // In production, we'd also verify the Calendly webhook signature here.
    return this.calendlyService.handleWebhook(payload);
  }
}
