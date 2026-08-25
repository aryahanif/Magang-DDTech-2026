import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { QualificationModule } from '../qualification/qualification.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [QualificationModule, EmailModule],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
