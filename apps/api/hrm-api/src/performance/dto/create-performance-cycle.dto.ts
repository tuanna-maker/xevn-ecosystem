import { IsDateString, IsString, MaxLength } from 'class-validator';

export class CreatePerformanceCycleDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(120)
  cycle_name!: string;

  @IsDateString()
  start_date!: string;

  @IsDateString()
  end_date!: string;

  @IsString()
  @MaxLength(255)
  created_by!: string;
}
