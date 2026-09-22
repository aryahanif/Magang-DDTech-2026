import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title!: string;

  @IsDateString()
  due_at!: string;

  @IsOptional()
  @IsIn(['task', 'call', 'email', 'meeting'])
  type?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: string;

  @IsOptional()
  @IsString()
  lead_name?: string;
}
