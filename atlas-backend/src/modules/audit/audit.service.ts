import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logAdminActivity(
    adminUserId: string,
    action: string,
    resource?: string,
    details?: string,
    metadata?: any,
  ) {
    try {
      await this.prisma.adminActivityLog.create({
        data: {
          admin_user_id: adminUserId,
          action,
          resource,
          details,
          metadata: metadata ? metadata : undefined,
        },
      });
      this.logger.log(`Admin ${adminUserId} performed ${action} on ${resource}`);
    } catch (error) {
      this.logger.error('Failed to write admin activity log', error);
      // We don't throw here to prevent disrupting the main business logic if logging fails
    }
  }
}
