import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksQueryDto } from './dto/get-tasks-query.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: GetTasksQueryDto) {
    return this.prisma.task.findMany({
      where: query.status ? { status: query.status } : undefined,
      orderBy: { due_at: 'asc' },
    });
  }

  create(dto: CreateTaskDto, userId?: string) {
    return this.prisma.task.create({
      data: { ...dto, created_by: userId },
    });
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.ensureExists(id);
    return this.prisma.task.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.task.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
  }
}
