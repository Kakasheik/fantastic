import { IsUUID, IsOptional } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  creatorId!: string;

  @IsOptional()
  @IsUUID()
  planId?: string;
}
