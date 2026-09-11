import { Module } from '@nestjs/common';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GoogleController],
  providers: [GoogleService],
  exports: [GoogleService],
})
export class IntegrationsModule {}
