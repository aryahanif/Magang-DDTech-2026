import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateAiRulesDto } from './dto/update-ai-rules.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAiRules() {
    let settings = await this.prisma.systemSetting.findFirst();
    if (!settings) {
      settings = await this.prisma.systemSetting.create({
        data: {},
      });
    }
    return settings;
  }

  async updateAiRules(data: UpdateAiRulesDto) {
    const settings = await this.getAiRules();
    return this.prisma.systemSetting.update({
      where: { id: settings.id },
      data,
    });
  }
}
