import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ListAttendanceRecordsQueryDto } from '../attendance/dto/list-attendance-records.query.dto';
import { ListContractsQueryDto } from '../contracts-insurance/dto/list-contracts.query.dto';
import { ListPayrollPayslipsQueryDto } from '../payroll/dto/list-payroll-payslips.query.dto';
import { ListJobRequisitionsQueryDto } from '../recruitment/dto/list-job-requisitions.query.dto';

describe('HRM list query DTO regression', () => {
  it('accepts company_id=main + page_size for contracts list', async () => {
    const dto = plainToInstance(ListContractsQueryDto, {
      company_id: 'main',
      page: '1',
      page_size: '100',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts company_id=main for recruitment requisitions list', async () => {
    const dto = plainToInstance(ListJobRequisitionsQueryDto, {
      company_id: 'main',
      page_size: '5',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts company_id=main for attendance records list', async () => {
    const dto = plainToInstance(ListAttendanceRecordsQueryDto, {
      company_id: 'main',
      page_size: '5',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts company_id=main for payroll payslips list', async () => {
    const dto = plainToInstance(ListPayrollPayslipsQueryDto, {
      company_id: 'main',
      page_size: '5',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts array-like page_size by normalizing first value', async () => {
    const dto = plainToInstance(ListPayrollPayslipsQueryDto, {
      company_id: 'main',
      page_size: ['100', '50'],
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts pageSize alias for payroll/recruitment/contracts lists', async () => {
    const payrollDto = plainToInstance(ListPayrollPayslipsQueryDto, {
      company_id: 'main',
      pageSize: '100',
    });
    const recruitmentDto = plainToInstance(ListJobRequisitionsQueryDto, {
      company_id: 'main',
      pageSize: '100',
    });
    const contractsDto = plainToInstance(ListContractsQueryDto, {
      company_id: 'main',
      pageSize: '100',
    });

    await expect(validate(payrollDto)).resolves.toHaveLength(0);
    await expect(validate(recruitmentDto)).resolves.toHaveLength(0);
    await expect(validate(contractsDto)).resolves.toHaveLength(0);
  });
});
