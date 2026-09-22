import { Body, Controller, Post, Get, Patch, Delete, Param, Query, ForbiddenException } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { GetLeadsQueryDto } from './dto/get-leads-query.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AddLeadNoteDto } from './dto/add-lead-note.dto';

@Controller('api/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) { }

  @Post()
  async create(@Body() createLeadDto: CreateLeadDto) {
    await this.verifyTurnstileToken(createLeadDto.cf_turnstile_token);

    const lead = await this.leadsService.createLead(createLeadDto);
    return {
      success: true,
      lead_id: lead.id,
      message: 'Lead submitted successfully',
    };
  }

  private async verifyTurnstileToken(token: string) {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY || '', response: token }),
    });
    const result = await response.json();
    console.log('Turnstile Verify Result:', result);

    if (!result.success) {
      throw new ForbiddenException('Bot verification failed');
    }
  }
}
