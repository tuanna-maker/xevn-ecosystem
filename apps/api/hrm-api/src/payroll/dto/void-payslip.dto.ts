import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class VoidPayslipDto {
  @IsString()
  @MaxLength(2000)
  reason!: string;

  @IsOptional()
  @IsIn(['void_only', 'mark_adjustment_required'])
  adjustment_mode?: 'void_only' | 'mark_adjustment_required';

  @IsOptional()
  @IsString()
  company_id?: string;
}
