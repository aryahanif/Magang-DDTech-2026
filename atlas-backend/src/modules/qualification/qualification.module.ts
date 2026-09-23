import { Module } from '@nestjs/common';
import { QualificationService } from './qualification.service';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [EmailModule, NotificationsModule],
  providers: [QualificationService],
  exports: [QualificationService],
})
export class QualificationModule {}
