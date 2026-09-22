import { IsBooleanString, IsOptional } from 'class-validator';

export class GetNotificationsQueryDto {
  @IsOptional()
  @IsBooleanString()
  unread?: string;
}
