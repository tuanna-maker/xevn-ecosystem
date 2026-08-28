import { IsString, IsNotEmpty, MaxLength, IsOptional, IsDateString, IsArray, ValidateNested, IsInt, IsPositive, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePayGradeStepDto {
  @IsInt()
  @Min(1)
  @Max(20)
  step_number!: number;

  @IsPositive()
  monthly_salary!: number;
}

export class CreatePayGradeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  decision_number?: string;

  @IsDateString()
  effective_from!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePayGradeStepDto)
  steps!: CreatePayGradeStepDto[];
}