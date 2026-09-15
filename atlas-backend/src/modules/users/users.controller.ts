import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
@Throttle({ default: { limit: 100, ttl: 60000 } })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req: Request & { user: { id: string } }) {
    const data = await this.usersService.getProfile(req.user.id);
    return { success: true, data };
  }

  @Patch('profile')
  async updateProfile(
    @Req() req: Request & { user: { id: string } },
    @Body() updateDto: UpdateProfileDto,
  ) {
    const data = await this.usersService.updateProfile(req.user.id, updateDto);
    return { success: true, message: 'Profile updated', data };
  }

  @Get()
  async findAll() {
    const data = await this.usersService.findAll();
    return { success: true, data };
  }

  @Post('invite')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async invite(@Body() inviteDto: InviteUserDto) {
    const data = await this.usersService.invite(inviteDto);
    return { success: true, message: 'User invited', data };
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updateRole(@Param('id') id: string, @Body() updateDto: UpdateRoleDto) {
    const data = await this.usersService.updateRole(id, updateDto);
    return { success: true, message: 'Role updated', data };
  }
}
