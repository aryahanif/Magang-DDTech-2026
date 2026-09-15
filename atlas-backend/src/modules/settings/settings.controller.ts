import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { SettingsService } from './settings.service';
import { UpdateAiRulesDto } from './dto/update-ai-rules.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('api/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Throttle({ default: { limit: 100, ttl: 60000 } })
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

  @Patch('email-signature')
  async updateEmailSignature(
    @Req() req: Request & { user: { id: string } },
    @Body() body: { signature: string }
  ) {
    await this.settingsService.updateEmailSignature(req.user.id, body.signature);
    return { success: true, message: 'Email signature updated successfully' };
  }
}
