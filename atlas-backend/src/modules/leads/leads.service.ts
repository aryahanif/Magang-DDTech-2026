import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { QualificationService } from '../qualification/qualification.service';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qualificationService: QualificationService,
  ) {}

  async createLead(data: CreateLeadDto) {
    const initialScore = this.qualificationService.calculateRuleBasedScore(data);
    
    const lead = await this.prisma.lead.create({
      data: {
        ...data,
        lead_score: initialScore,
      },
    });

    // Asynchronous AI Processing (Non-blocking)
    this.qualificationService.analyzeLeadWithAI(lead.id, data).catch((error) => {
      console.error('Failed to analyze lead with AI asynchronously:', error);
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
