import { Body, Controller, Get, Headers, HttpStatus, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { ListPayrollPeriodsQueryDto } from './dto/list-payroll-periods.query.dto';
import { ListPayrollPayslipsQueryDto } from './dto/list-payroll-payslips.query.dto';
import { PayrollService } from './payroll.service';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  private assertBusinessAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized payroll access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('periods')
  createPayrollPeriod(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreatePayrollPeriodDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.payrollService
      .createPayrollPeriod(body)
      .then((data) => ok(data, 'HRM-PAY-201', 'Payroll period created'));
  }

  @Get('periods')
  listPayrollPeriods(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListPayrollPeriodsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.payrollService
      .listPayrollPeriods(query)
      .then((data) => ok(data, 'HRM-PAY-200', 'Payroll periods listed'));
  }

  @Post('periods/:periodId/process')
  processPayrollPeriod(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollService
      .processPayrollPeriod(periodId)
      .then((data) => ok(data, 'HRM-PAY-202', 'Payroll period processed'));
  }

  @Post('periods/:periodId/close')
  closePayrollPeriod(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollService
      .closePayrollPeriod(periodId)
      .then((data) => ok(data, 'HRM-PAY-203', 'Payroll period closed'));
  }

  @Get('payslips')
  listPayslips(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListPayrollPayslipsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.payrollService
      .listPayslips(query)
      .then((data) => ok(data, 'HRM-PAY-200', 'Payroll payslips listed'));
  }

  @Get('reports/reconciliation')
  payrollReconciliationSummary(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
    return this.payrollService
      .getPayrollReconciliationSummary(scope.companyId)
      .then((data) => ok(data, 'HRM-PAY-200', 'Payroll reconciliation summary'));
  }
}
