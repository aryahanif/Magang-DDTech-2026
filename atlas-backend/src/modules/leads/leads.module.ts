import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { AdminLeadsController } from './admin-leads.controller';
import { WebhooksController } from './webhooks.controller';
import { LeadsService } from './leads.service';
import { QualificationModule } from '../qualification/qualification.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [QualificationModule, EmailModule],
  controllers: [LeadsController, AdminLeadsController, WebhooksController],
  providers: [LeadsService],
})
export class LeadsModule {}
