import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { LeadsService } from './leads.service';
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
}
