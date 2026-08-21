import {
  IsArray,
  IsBoolean,
  IsIn,
  IsISO8601,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class TerminationSettleDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  employee_ids?: string[];

  @IsOptional()
  @IsIn(['draft', 'ready', 'posted'])
  target_status?: 'draft' | 'ready' | 'posted';

  @IsOptional()
  @IsISO8601({ strict: true })
  termination_date?: string;

  @IsOptional()
  @IsBoolean()
  acknowledge_preview?: boolean;
}
