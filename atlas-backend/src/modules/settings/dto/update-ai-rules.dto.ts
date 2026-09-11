import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAiRulesDto {
  @IsOptional()
  @IsBoolean()
  is_ai_tiering_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  is_spam_detection_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  is_data_enrichment_enabled?: boolean;
}
