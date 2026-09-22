import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  due_at?: string;

  @IsOptional()
  @IsIn(['task', 'call', 'email', 'meeting'])
  type?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: string;

  @IsOptional()
  @IsIn(['pending', 'completed'])
  status?: string;

  @IsOptional()
  @IsString()
  lead_name?: string;
}
