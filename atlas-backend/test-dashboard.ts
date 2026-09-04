
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DashboardService } from './src/modules/dashboard/dashboard.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dashboardService = app.get(DashboardService);
  const metrics = await dashboardService.getMetrics();
  console.log(JSON.stringify(metrics, null, 2));
  await app.close();
}
bootstrap();

