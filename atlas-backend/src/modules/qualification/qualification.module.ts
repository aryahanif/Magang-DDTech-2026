import { Module } from '@nestjs/common';
import { QualificationService } from './qualification.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  providers: [QualificationService],
  exports: [QualificationService],
})
export class QualificationModule {}
