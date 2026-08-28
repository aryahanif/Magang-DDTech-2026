import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { AdminLeadsController } from './admin-leads.controller';
import { LeadsService } from './leads.service';
import { QualificationModule } from '../qualification/qualification.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [QualificationModule, EmailModule],
  controllers: [LeadsController, AdminLeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
