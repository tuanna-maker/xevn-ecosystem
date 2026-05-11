import { IsIn, IsOptional } from 'class-validator';

export class ImportMultipartMetaDto {
  @IsIn(['employee_import'])
  kind!: 'employee_import';

  @IsOptional()
  @IsIn(['true', 'false'])
  dryRun?: string;
}
