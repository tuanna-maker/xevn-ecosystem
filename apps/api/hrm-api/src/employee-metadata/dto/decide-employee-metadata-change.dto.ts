import { IsOptional, IsString } from 'class-validator';

export class DecideEmployeeMetadataChangeDto {
  @IsOptional()
  @IsString()
  actor_user_id?: string;

  @IsOptional()
  @IsString()
  actor_name?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
