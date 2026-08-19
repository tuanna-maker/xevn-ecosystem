import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAttendanceSheetSignatureDto {
  @IsString()
  @MaxLength(64)
  step_code!: string;

  @IsIn(['employee', 'direct_manager', 'hr_admin'])
  persona_role!: 'employee' | 'direct_manager' | 'hr_admin';

  @IsIn(['approved', 'rejected'])
  outcome!: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;

  @IsOptional()
  @IsString()
  wf_task_instance_id?: string;

  @IsOptional()
  @IsString()
  workflow_definition_id?: string;
}
