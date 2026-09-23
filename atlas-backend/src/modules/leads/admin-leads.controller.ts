import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import type { Response } from 'express';
import { LeadsService } from './leads.service';
import { AddLeadNoteDto } from './dto/add-lead-note.dto';
import { GetLeadsQueryDto } from './dto/get-leads-query.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('api/admin/leads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Throttle({ default: { limit: 100, ttl: 60000 } })
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

  @Get('export')
  async exportCsv(@Query() query: GetLeadsQueryDto, @Res() res: Response) {
    const csv = await this.leadsService.exportLeadsToCsv(query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    res.send(csv);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SALES)
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
  @Roles(UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    await this.leadsService.remove(id);
    return {
      success: true,
      message: 'Lead deleted successfully',
    };
  }
}
