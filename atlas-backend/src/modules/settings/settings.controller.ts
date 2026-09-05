import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateAiRulesDto } from './dto/update-ai-rules.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('ai-rules')
  async getAiRules() {
    const rules = await this.settingsService.getAiRules();
    return { success: true, data: rules };
  }

  @Patch('ai-rules')
  async updateAiRules(@Body() updateDto: UpdateAiRulesDto) {
    const rules = await this.settingsService.updateAiRules(updateDto);
    return { success: true, message: 'Settings updated', data: rules };
  }
}
