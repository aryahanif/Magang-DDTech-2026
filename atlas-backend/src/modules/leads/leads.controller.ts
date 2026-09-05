import { Body, Controller, Post, Get, Patch, Delete, Param, UseGuards, Query } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { GetLeadsQueryDto } from './dto/get-leads-query.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AddLeadNoteDto } from './dto/add-lead-note.dto';

@Controller('api/leads')
@UseGuards(ThrottlerGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) { }

  @Post()
  async create(@Body() createLeadDto: CreateLeadDto) {
    const lead = await this.leadsService.createLead(createLeadDto);
    return {
      success: true,
      lead_id: lead.id,
      message: 'Lead submitted successfully',
    };
  }
}
