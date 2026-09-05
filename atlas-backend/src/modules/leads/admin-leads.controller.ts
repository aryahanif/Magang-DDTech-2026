import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards, Delete } from '@nestjs/common';
import { Request } from 'express';
import { LeadsService } from './leads.service';
import { AddLeadNoteDto } from './dto/add-lead-note.dto';
import { GetLeadsQueryDto } from './dto/get-leads-query.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/admin/leads')
@UseGuards(JwtAuthGuard)
export class AdminLeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async findAll(@Query() query: GetLeadsQueryDto) {
    const leads = await this.leadsService.findAll(query);
    return {
      success: true,
      data: leads,
    };
  }

  @Patch(':id')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateData: UpdateLeadDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    await this.leadsService.updateLeadStatus(id, updateData, req.user.id);
    return {
      success: true,
      message: 'Lead updated successfully',
    };
  }

  @Post(':id/notes')
  async addNote(
    @Param('id') id: string,
    @Body() body: AddLeadNoteDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    await this.leadsService.addNoteToLead(id, req.user.id, body);
    return {
      success: true,
      message: 'Note added successfully',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const lead = await this.leadsService.findOne(id);
      return {
        success: true,
        data: lead,
      };
    } catch (error) {
      return { success: false, message: 'Lead not found or invalid ID' };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.leadsService.remove(id);
    return {
      success: true,
      message: 'Lead deleted successfully',
    };
  }
}
