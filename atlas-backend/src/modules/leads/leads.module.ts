import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { QualificationModule } from '../qualification/qualification.module';

@Module({
  imports: [QualificationModule],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
