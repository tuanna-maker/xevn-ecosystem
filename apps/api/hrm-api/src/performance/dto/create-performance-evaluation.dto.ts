import { IsNumber, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreatePerformanceEvaluationDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  employee_id!: string;

  @IsString()
  cycle_id!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number;

  @IsString()
  @MaxLength(2000)
  summary!: string;

  @IsString()
  @MaxLength(255)
  reviewer!: string;
}
