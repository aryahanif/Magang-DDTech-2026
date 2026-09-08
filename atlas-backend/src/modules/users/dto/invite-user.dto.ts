import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InviteUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  role?: string;
}
