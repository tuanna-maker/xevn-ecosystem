import { IsOptional, IsString } from 'class-validator';

export class DecideServiceRequestDto {
  @IsOptional()
  @IsString()
  approved_by?: string;

  @IsOptional()
  @IsString()
  rejected_reason?: string;
}
