import { IsNumber, IsOptional, IsIn, Min, IsDateString } from 'class-validator';

export class UpdateMinimumWageDto {
  @IsNumber()
  @Min(100000)
  monthlyMinWage: number;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}