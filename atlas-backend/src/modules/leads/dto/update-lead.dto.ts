import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  assigned_owner?: string;

  @IsOptional()
  @IsDateString()
  next_follow_up_at?: string;
}
