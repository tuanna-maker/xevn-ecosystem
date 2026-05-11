import { Type } from 'class-transformer';
import { IsIn, ValidateNested } from 'class-validator';
import { ListEmployeesQueryDto } from '../../employees/dto/list-employees.query.dto';

export class SpreadsheetExportBodyDto {
  @IsIn(['employee_export'])
  kind!: 'employee_export';

  @IsIn(['csv'])
  format!: 'csv';

  @ValidateNested()
  @Type(() => ListEmployeesQueryDto)
  filter!: ListEmployeesQueryDto;
}
