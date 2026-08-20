import { ListEmployeesQueryDto } from '../../employees/dto/list-employees.query.dto';
export declare class SpreadsheetExportBodyDto {
    kind: 'employee_export';
    format: 'csv';
    filter: ListEmployeesQueryDto;
}
