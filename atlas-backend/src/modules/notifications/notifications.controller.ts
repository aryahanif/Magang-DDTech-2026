import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/admin/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@Query() query: GetNotificationsQueryDto) {
    const data = await this.notificationsService.findAll(query);
    return { success: true, data };
  }

  @Patch('read-all')
  async markAllAsRead() {
    await this.notificationsService.markAllAsRead();
    return { success: true, message: 'All notifications marked as read' };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    const data = await this.notificationsService.markAsRead(id);
    return { success: true, data };
  }
}
