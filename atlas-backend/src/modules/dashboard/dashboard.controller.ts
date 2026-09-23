import { Controller, Get, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/admin/dashboard')
@Throttle({ default: { limit: 100, ttl: 60000 } })
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMetrics() {
    const data = await this.dashboardService.getMetrics();
    return {
      success: true,
      data,
    };
  }
}
