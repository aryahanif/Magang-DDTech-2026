import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { parse } from 'json2csv';
import { PrismaService } from '../../database/prisma.service';
import { AddLeadNoteDto } from './dto/add-lead-note.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { GetLeadsQueryDto } from './dto/get-leads-query.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QualificationService } from '../qualification/qualification.service';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly qualificationService: QualificationService,
  ) {}

  async createLead(dto: CreateLeadDto) {
    const { cf_turnstile_token, ...data } = dto;
    const initialScore = await this.qualificationService.calculateRuleBasedScore(data);

    const existingLead = await this.prisma.lead.findFirst({
      where: {
        OR: [
          { email: { equals: data.email, mode: Prisma.QueryMode.insensitive } },
          ...(data.company_name ? [{ company_name: { equals: data.company_name, mode: Prisma.QueryMode.insensitive } }] : []),
        ],
      },
    });

    const lead = await this.prisma.lead.create({
      data: {
        ...data,
        lead_score: initialScore,
        consent_at: data.consent_status ? new Date() : null,
      },
    });

    if (existingLead) {
      let duplicateReason: string[] = [];
      if (existingLead.email?.toLowerCase() === data.email.toLowerCase()) {
        duplicateReason.push(`Email (${data.email})`);
      }
      if (data.company_name && existingLead.company_name?.toLowerCase() === data.company_name.toLowerCase()) {
        duplicateReason.push(`Company Name (${data.company_name})`);
      }
      const specificNote = `⚠️ System Alert: Duplicate entry detected matching an existing lead (ID: ${existingLead.id} - ${existingLead.full_name || existingLead.company_name}). Matching fields: ${duplicateReason.join(' and ')}.`;

      await this.prisma.$transaction([
        this.prisma.leadNote.create({
          data: {
            lead_id: lead.id,
            created_by: 'System',
            note: specificNote,
          },
        }),
        this.prisma.leadActivityLog.create({
          data: {
            lead_id: lead.id,
            activity_type: 'DUPLICATE_FLAGGED',
            description: `Duplicate entry detected matching lead ${existingLead.id}`,
            metadata: { duplicate_of: existingLead.id, matching_fields: duplicateReason },
          },
        }),
      ]);
      this.logger.warn(`Lead ${lead.id} flagged as duplicate of ${existingLead.id}`);
    }

    // Asynchronous AI Processing (Non-blocking). The sales alert and the
    // prospect confirmation email are both sent from QualificationService
    // once the AI determines the lead_tier, since it isn't known yet here.
    this.qualificationService.analyzeLeadWithAI(lead.id, data, initialScore).catch((error) => {
      this.logger.error('Failed to analyze lead with AI asynchronously', error);
    });

    return lead;
  }

  async findAll(query: GetLeadsQueryDto = {}) {
    const where = this.buildLeadsWhere(query);
    return this.prisma.lead.findMany({ where, orderBy: { created_at: 'desc' } });
  }

  async exportLeadsToCsv(query: GetLeadsQueryDto = {}) {
    const where = this.buildLeadsWhere(query);
    const leads = await this.prisma.lead.findMany({ where, orderBy: { created_at: 'desc' } });

    const rows = leads.map((lead) => ({
      full_name: lead.full_name,
      email: lead.email,
      company_name: lead.company_name,
      country: lead.country,
      business_type: lead.business_type,
      lead_tier: lead.lead_tier,
      lead_score: lead.lead_score,
      status: lead.status,
    }));

    const fields = [
      'full_name',
      'email',
      'company_name',
      'country',
      'business_type',
      'lead_tier',
      'lead_score',
      'status',
    ];

    if (rows.length === 0) return fields.join(',');

    return parse(rows, { fields, quote: '' });
  }

  private buildLeadsWhere(query: GetLeadsQueryDto): Prisma.LeadWhereInput {
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

    return where;
  }

  async findOne(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: {
        notes: { orderBy: { created_at: 'desc' } },
        activity_logs: { orderBy: { created_at: 'desc' } },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.$transaction([
      this.prisma.leadNote.deleteMany({ where: { lead_id: id } }),
      this.prisma.leadActivityLog.deleteMany({ where: { lead_id: id } }),
      this.prisma.lead.delete({ where: { id } })
    ]);
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

