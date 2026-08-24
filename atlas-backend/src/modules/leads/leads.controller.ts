import { Body, Controller, Post, Get, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Controller('api/leads')
@UseGuards(ThrottlerGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  async create(@Body() createLeadDto: CreateLeadDto) {
    const lead = await this.leadsService.createLead(createLeadDto);
    return {
      success: true,
      lead_id: lead.id,
      message: 'Lead submitted successfully',
    };
  }

  @Get()
  async findAll() {
    const leads = await this.leadsService.findAll();
    return {
      success: true,
      data: leads,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    const lead = await this.leadsService.update(id, updateData);
    return {
      success: true,
      data: lead,
      message: 'Lead updated successfully',
    };
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
