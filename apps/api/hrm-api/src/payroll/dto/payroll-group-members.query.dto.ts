import { IsOptional, IsString, IsUUID } from 'class-validator';

export class PayrollGroupMembersQueryDto {
  @IsUUID()
  period_id!: string;

  @IsOptional()
  @IsString()
  as_of_date?: string;
}
