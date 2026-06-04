import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ListAttendanceRecordsQueryDto } from '../attendance/dto/list-attendance-records.query.dto';
import { ListAttendanceUpdateRequestsQueryDto } from '../attendance/dto/list-attendance-update-requests.query.dto';
import { ListPayrollPayslipsQueryDto } from '../payroll/dto/list-payroll-payslips.query.dto';
import { ListContractsQueryDto } from '../contracts-insurance/dto/list-contracts.query.dto';
import { ListJobRequisitionsQueryDto } from '../recruitment/dto/list-job-requisitions.query.dto';

describe('HRM query validation regression (HTTPS R5/R6)', () => {
  it('accepts contracts/insurance company_id=main + page_size aliases', () => {
    const dto = plainToInstance(ListContractsQueryDto, {
      company_id: 'main',
      page_size: '100',
      pageSize: '100',
    });
    const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors).toHaveLength(0);
  });

  it('accepts recruitment company_id=main + page_size aliases', () => {
    const dto = plainToInstance(ListJobRequisitionsQueryDto, {
      company_id: 'main',
      page_size: '100',
      pageSize: '100',
    });
    const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors).toHaveLength(0);
  });

  it('accepts attendance company_id=main + page_size aliases', () => {
    const dto = plainToInstance(ListAttendanceRecordsQueryDto, {
      company_id: 'main',
      page_size: '100',
      pageSize: '100',
    });
    const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors).toHaveLength(0);
  });

  it('accepts payroll company_id=main + page_size aliases', () => {
    const dto = plainToInstance(ListPayrollPayslipsQueryDto, {
      company_id: 'main',
      page_size: '100',
      pageSize: '100',
    });
    const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors).toHaveLength(0);
  });

  it('accepts attendance update-requests company_id=main + page_size aliases', () => {
    const dto = plainToInstance(ListAttendanceUpdateRequestsQueryDto, {
      company_id: 'main',
      page_size: '100',
      pageSize: '100',
    });
    const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors).toHaveLength(0);
  });
});
