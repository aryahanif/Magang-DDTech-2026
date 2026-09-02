import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AddLeadNoteDto } from './dto/add-lead-note.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { GetLeadsQueryDto } from './dto/get-leads-query.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
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

  async findAll(query: GetLeadsQueryDto) {
    const where: Prisma.LeadWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.tier) where.lead_tier = query.tier;
    if (query.country) where.country = query.country;
    if (query.search_keyword) {
      where.OR = [
        { full_name: { contains: query.search_keyword, mode: 'insensitive' } },
        { company_name: { contains: query.search_keyword, mode: 'insensitive' } },
      ];
    }

    return this.prisma.lead.findMany({ where, orderBy: { created_at: 'desc' } });
  }

  async updateLeadStatus(leadId: string, data: UpdateLeadDto, adminUserId: string) {
    const activityType = data.status ? 'STATUS_UPDATE' : data.assigned_owner ? 'OWNER_ASSIGNED' : 'LEAD_UPDATED';

    try {
      const [lead] = await this.prisma.$transaction([
        this.prisma.lead.update({ where: { id: leadId }, data }),
        this.prisma.leadActivityLog.create({
          data: {
            lead_id: leadId,
            activity_type: activityType,
            description: `Lead updated by admin ${adminUserId}: ${JSON.stringify(data)}`,
            metadata: { admin_user_id: adminUserId, changes: { ...data } },
          },
        }),
      ]);

      return lead;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Lead ${leadId} not found`);
      }
      throw error;
    }
  }

  async addNoteToLead(leadId: string, adminUserId: string, data: AddLeadNoteDto) {
    try {
      return await this.prisma.leadNote.create({
        data: {
          lead_id: leadId,
          created_by: adminUserId,
          note: data.note,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new NotFoundException(`Lead ${leadId} not found`);
      }
      throw error;
    }
  }

  async handleDemoScheduled(email: string, eventTime: Date, meetingUrl: string) {
    // Cari prospek terbaru berdasarkan email (karena bisa jadi ada submission dobel)
    const lead = await this.prisma.lead.findFirst({
      where: { email },
      orderBy: { created_at: 'desc' },
    });

    if (!lead) {
      this.logger.warn(`Webhook received for email ${email}, but no lead found in DB.`);
      return;
    }

    try {
      await this.prisma.$transaction([
        this.prisma.lead.update({
          where: { id: lead.id },
          data: {
            status: 'Demo Scheduled',
            next_follow_up_at: eventTime,
          },
        }),
        this.prisma.leadActivityLog.create({
          data: {
            lead_id: lead.id,
            activity_type: 'DEMO_SCHEDULED',
            description: `Demo scheduled via Calendly for ${eventTime.toISOString()}`,
            metadata: { meeting_url: meetingUrl, event_time: eventTime.toISOString() },
          },
        }),
      ]);
      this.logger.log(`Successfully updated lead ${lead.id} status to Demo Scheduled from webhook.`);
    } catch (error) {
      this.logger.error(`Error updating lead ${lead.id} from webhook`, error);
      throw error;
    }
  }
}
