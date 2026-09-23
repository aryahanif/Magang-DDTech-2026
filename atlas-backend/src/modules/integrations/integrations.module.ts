import { Module } from '@nestjs/common';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';
import { CalendlyController } from './calendly.controller';
import { CalendlyService } from './calendly.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GoogleController, CalendlyController],
  providers: [GoogleService, CalendlyService],
  exports: [GoogleService, CalendlyService],
})
export class IntegrationsModule {}
