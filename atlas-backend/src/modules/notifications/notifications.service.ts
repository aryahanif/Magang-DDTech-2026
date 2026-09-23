import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';

interface CreateNotificationData {
  title: string;
  message?: string;
  icon?: string;
  lead_id?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: GetNotificationsQueryDto) {
    return this.prisma.notification.findMany({
      where: query.unread === 'true' ? { is_read: false } : undefined,
      orderBy: { created_at: 'desc' },
      take: 50,
    });
  }

  create(data: CreateNotificationData) {
    return this.prisma.notification.create({ data });
  }

  async markAsRead(id: string) {
    await this.ensureExists(id);
    return this.prisma.notification.update({ where: { id }, data: { is_read: true } });
  }

  markAllAsRead() {
    return this.prisma.notification.updateMany({ where: { is_read: false }, data: { is_read: true } });
  }

  private async ensureExists(id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
  }
}
