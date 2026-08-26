import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { QualificationService } from '../qualification/qualification.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly qualificationService: QualificationService,
    private readonly emailService: EmailService,
  ) {}

  async createLead(data: CreateLeadDto) {
    const initialScore = this.qualificationService.calculateRuleBasedScore(data);

    const lead = await this.prisma.lead.create({
      data: {
        ...data,
        lead_score: initialScore,
      },
    });

    // Asynchronous AI Processing (Non-blocking). The Tier A email alert is
    // sent from QualificationService once the AI determines the lead_tier,
    // since it isn't known yet at creation time.
    this.qualificationService.analyzeLeadWithAI(lead.id, data, initialScore).catch((error) => {
      this.logger.error('Failed to analyze lead with AI asynchronously', error);
    });

    // Prospect auto-reply is sent unconditionally, regardless of tier.
    this.emailService.sendProspectAutoReply(lead).catch((error) => {
      this.logger.error('Failed to send auto-reply to prospect', error);
    });

    return lead;
  }

  async findAll() {
    return this.prisma.lead.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.lead.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.lead.delete({
      where: { id },
    });
  }
}
