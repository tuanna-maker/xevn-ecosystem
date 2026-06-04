import { IsString, MaxLength } from 'class-validator';

/** Scope for employee profile tab lists (degrees, training, assets). */
export class EmployeeProfileListQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;
}
