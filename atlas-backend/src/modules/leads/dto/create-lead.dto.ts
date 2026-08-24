import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLeadDto {
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  company_name: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  business_type: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  website_url?: string;

  @IsOptional()
  @IsString()
  company_size?: string;

  @IsOptional()
  @IsString()
  current_problem?: string;

  @IsOptional()
  @IsString()
  automation_interest?: string;

  @IsOptional()
  @IsString()
  preferred_contact_method?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  source_page?: string;

  @IsOptional()
  @IsString()
  utm_source?: string;

  @IsOptional()
  @IsString()
  utm_medium?: string;

  @IsOptional()
  @IsString()
  utm_campaign?: string;

  @IsBoolean()
  consent_status: boolean;
}
