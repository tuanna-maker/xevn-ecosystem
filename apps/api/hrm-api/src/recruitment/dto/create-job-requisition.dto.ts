import { IsString, MaxLength } from 'class-validator';

export class CreateJobRequisitionDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(50)
  department!: string;

  @IsString()
  @MaxLength(20)
  employment_type!: string;
}
