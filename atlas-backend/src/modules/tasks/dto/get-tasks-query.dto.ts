import { IsIn, IsOptional } from 'class-validator';

export class GetTasksQueryDto {
  @IsOptional()
  @IsIn(['pending', 'completed'])
  status?: string;
}
