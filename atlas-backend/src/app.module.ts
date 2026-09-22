import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { LeadsModule } from './modules/leads/leads.module';
import { QualificationModule } from './modules/qualification/qualification.module';
import { EmailModule } from './modules/email/email.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SettingsModule } from './modules/settings/settings.module';
import { UsersModule } from './modules/users/users.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { TasksModule } from './modules/tasks/tasks.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 5, // strict default for public endpoints (e.g. POST /api/leads)
      },
    ]),
    PrismaModule,
    LeadsModule,
    QualificationModule,
    EmailModule,
    AdminModule,
    AuthModule,
    DashboardModule,
    SettingsModule,
    UsersModule,
    IntegrationsModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
