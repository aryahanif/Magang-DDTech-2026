import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksQueryDto } from './dto/get-tasks-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/admin/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(@Query() query: GetTasksQueryDto) {
    const data = await this.tasksService.findAll(query);
    return { success: true, data };
  }

  @Post()
  async create(@Body() dto: CreateTaskDto, @Req() req: Request & { user: { id: string } }) {
    const data = await this.tasksService.create(dto, req.user.id);
    return { success: true, data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    const data = await this.tasksService.update(id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.tasksService.remove(id);
    return { success: true, message: 'Task deleted successfully' };
  }
}
