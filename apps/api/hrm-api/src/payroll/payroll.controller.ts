import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest, resolveAuthorizationHeader } from '../common/internal-auth';
import { toHrmListScopeContext } from '../common/hrm-list-scope-context';
import { resolveScopeContext } from '../common/scope-context';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { ListPayrollPeriodsQueryDto } from './dto/list-payroll-periods.query.dto';
import { ListPayrollPayslipsQueryDto } from './dto/list-payroll-payslips.query.dto';
import { CreateSalaryTemplateDto } from './dto/create-salary-template.dto';
import { ListSalaryTemplatesQueryDto } from './dto/list-salary-templates.query.dto';
import { UpdateSalaryTemplateDto } from './dto/update-salary-template.dto';
import { CreateAdvanceRequestDto } from './dto/create-advance-request.dto';
import { DecideAdvanceRequestDto } from './dto/decide-advance-request.dto';
import { ListAdvanceRequestsQueryDto } from './dto/list-advance-requests.query.dto';
import { AddPaymentRecordDto } from './dto/add-payment-record.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { PayrollService } from './payroll.service';
import { PayrollCatalogService } from './payroll-catalog.service';

@Controller('payroll')
export class PayrollController {
  constructor(
    private readonly payrollService: PayrollService,
    private readonly payrollCatalog: PayrollCatalogService,
  ) {}

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
      .listPayrollPeriods(query, authorization)
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
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollService
      .processPayrollPeriod(periodId, scope.companyId, authorization)
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
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollService
      .closePayrollPeriod(periodId, scope.companyId, authorization)
      .then((data) => ok(data, 'HRM-PAY-203', 'Payroll period closed'));
  }

  @Get('payslips')
  listPayslips(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListPayrollPayslipsQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.payrollService
      .listPayslips(query, authHeader, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-PAY-200', 'Payroll payslips listed'));
  }

  @Get('salary-templates')
  listSalaryTemplates(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListSalaryTemplatesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.payrollService
      .listSalaryTemplates(query, authorization)
      .then((data) => ok(data, 'HRM-PAY-200', 'Salary templates listed'));
  }

  @Post('salary-templates')
  createSalaryTemplate(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateSalaryTemplateDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.payrollService
      .createSalaryTemplate(body, authorization)
      .then((data) => ok(data, 'HRM-PAY-201', 'Salary template created'));
  }

  @Patch('salary-templates/:templateId')
  updateSalaryTemplate(
    @Param('templateId', new ParseUUIDPipe()) templateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: UpdateSalaryTemplateDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.payrollService
      .updateSalaryTemplate(templateId, body, authorization)
      .then((data) => ok(data, 'HRM-PAY-200', 'Salary template updated'));
  }

  @Get('salary-templates/:templateId/components')
  listSalaryTemplateComponents(
    @Param('templateId', new ParseUUIDPipe()) templateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollService
      .listSalaryTemplateComponents(templateId, companyId, authorization)
      .then((data) => ok(data, 'HRM-PAY-200', 'Salary template components listed'));
  }

  @Post('salary-templates/:templateId/components')
  addSalaryTemplateComponent(
    @Param('templateId', new ParseUUIDPipe()) templateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: { company_id: string; component_id: string; default_value?: number; is_required?: boolean; sort_order?: number },
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollService
      .addSalaryTemplateComponent(templateId, body, authorization)
      .then((data) => ok(data, 'HRM-PAY-201', 'Salary template component added'));
  }

  @Patch('salary-template-components/:componentRowId')
  updateSalaryTemplateComponent(
    @Param('componentRowId', new ParseUUIDPipe()) componentRowId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollService
      .updateSalaryTemplateComponent(componentRowId, companyId, body, authorization)
      .then((data) => ok(data, 'HRM-PAY-200', 'Salary template component updated'));
  }

  @Delete('salary-template-components/:componentRowId')
  removeSalaryTemplateComponent(
    @Param('componentRowId', new ParseUUIDPipe()) componentRowId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollService
      .removeSalaryTemplateComponent(componentRowId, companyId, authorization)
      .then((data) => ok(data, 'HRM-PAY-200', 'Salary template component removed'));
  }

  @Post('salary-templates/:templateId/duplicate')
  duplicateSalaryTemplate(
    @Param('templateId', new ParseUUIDPipe()) templateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollService
      .duplicateSalaryTemplate(templateId, companyId, authorization)
      .then((data) => ok(data, 'HRM-PAY-201', 'Salary template duplicated'));
  }

  @Delete('salary-templates/:templateId')
  deleteSalaryTemplate(
    @Param('templateId', new ParseUUIDPipe()) templateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
    return this.payrollService
      .deleteSalaryTemplate(templateId, companyId, authorization)
      .then((data) => ok(data, 'HRM-PAY-200', 'Salary template deleted'));
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
      .getPayrollReconciliationSummary(scope.companyId, authorization)
      .then((data) => ok(data, 'HRM-PAY-200', 'Payroll reconciliation summary'));
  }

  @Get('advance-requests')
  listAdvanceRequests(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListAdvanceRequestsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.payrollService
      .listAdvanceRequests(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ADV-200', 'Advance requests listed'));
  }

  @Post('advance-requests')
  createAdvanceRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: CreateAdvanceRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollService
      .createAdvanceRequest(body, authorization)
      .then((data) => ok(data, 'HRM-ADV-201', 'Advance request created'));
  }

  @Get('advance-requests/:requestId/employees')
  listAdvanceRequestEmployees(
    @Param('requestId', new ParseUUIDPipe()) requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId: queryCompanyId ?? companyId });
    return this.payrollService
      .listAdvanceRequestEmployees(requestId, scope.companyId, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ADV-200', 'Advance request employees listed'));
  }

  @Post('advance-requests/:requestId/approve')
  approveAdvanceRequest(
    @Param('requestId', new ParseUUIDPipe()) requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideAdvanceRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollService
      .approveAdvanceRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-ADV-203', 'Advance request approved'));
  }

  @Post('advance-requests/:requestId/reject')
  rejectAdvanceRequest(
    @Param('requestId', new ParseUUIDPipe()) requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideAdvanceRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollService
      .rejectAdvanceRequest(requestId, body, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-ADV-204', 'Advance request rejected'));
  }

  @Get('salary-components')
  listSalaryComponents(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollCatalog
      .listSalaryComponents(companyId, authorization)
      .then((data) => ok(data, 'HRM-SC-200', 'Salary components listed'));
  }

  @Get('salary-component-categories')
  listSalaryComponentCategories(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollCatalog
      .listSalaryComponentCategories(companyId, authorization)
      .then((data) => ok(data, 'HRM-SC-200', 'Salary component categories listed'));
  }

  @Post('salary-components')
  createSalaryComponent(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollCatalog
      .createSalaryComponent(body, authorization)
      .then((data) => ok(data, 'HRM-SC-201', 'Salary component created'));
  }

  @Patch('salary-components/:componentId')
  updateSalaryComponent(
    @Param('componentId', new ParseUUIDPipe()) componentId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollCatalog
      .updateSalaryComponent(componentId, body, companyId, authorization)
      .then((data) => ok(data, 'HRM-SC-200', 'Salary component updated'));
  }

  @Delete('salary-components/:componentId')
  deleteSalaryComponent(
    @Param('componentId', new ParseUUIDPipe()) componentId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollCatalog
      .deleteSalaryComponent(componentId, companyId, authorization)
      .then((data) => ok(data, 'HRM-SC-200', 'Salary component deleted'));
  }

  @Post('salary-component-categories')
  createSalaryComponentCategory(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollCatalog
      .createSalaryComponentCategory(body, authorization)
      .then((data) => ok(data, 'HRM-SC-201', 'Salary component category created'));
  }

  @Delete('salary-component-categories/:categoryId')
  deleteSalaryComponentCategory(
    @Param('categoryId', new ParseUUIDPipe()) categoryId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollCatalog
      .deleteSalaryComponentCategory(categoryId, companyId, authorization)
      .then((data) => ok(data, 'HRM-SC-200', 'Salary component category deleted'));
  }

  @Get('payment-batches')
  listPaymentBatches(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollCatalog
      .listPaymentBatches(companyId, authorization)
      .then((data) => ok(data, 'HRM-PB-200', 'Payment batches listed'));
  }

  @Get('payment-batches/:batchId/records')
  listPaymentBatchRecords(
    @Param('batchId', new ParseUUIDPipe()) batchId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollCatalog
      .listPaymentBatchRecords(batchId, companyId, authorization)
      .then((data) => ok(data, 'HRM-PB-200', 'Payment records listed'));
  }

  @Post('payment-batches')
  createPaymentBatch(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollCatalog
      .createPaymentBatch(body, authorization)
      .then((data) => ok(data, 'HRM-PB-201', 'Payment batch created'));
  }

  @Patch('payment-batches/:batchId')
  updatePaymentBatch(
    @Param('batchId', new ParseUUIDPipe()) batchId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollCatalog
      .updatePaymentBatch(batchId, body, companyId, authorization)
      .then((data) => ok(data, 'HRM-PB-200', 'Payment batch updated'));
  }

  @Delete('payment-batches/:batchId')
  deletePaymentBatch(
    @Param('batchId', new ParseUUIDPipe()) batchId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollCatalog
      .deletePaymentBatch(batchId, companyId, authorization)
      .then((data) => ok(data, 'HRM-PB-200', 'Payment batch deleted'));
  }

  @Post('payment-batches/:batchId/records')
  addPaymentBatchRecord(
    @Param('batchId', new ParseUUIDPipe()) batchId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: AddPaymentRecordDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollCatalog
      .addPaymentRecord(batchId, body, authorization)
      .then((data) => ok(data, 'HRM-PB-201', 'Payment record added'));
  }

  @Post('payment-batches/:batchId/records/:recordId/process')
  processPaymentRecord(
    @Param('batchId', new ParseUUIDPipe()) batchId: string,
    @Param('recordId', new ParseUUIDPipe()) recordId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: ProcessPaymentDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollCatalog
      .processPaymentRecord(batchId, recordId, companyId, body, authorization)
      .then((data) => ok(data, 'HRM-PB-202', 'Payment record processed'));
  }

  @Post('payment-batches/:batchId/process')
  processPaymentBatch(
    @Param('batchId', new ParseUUIDPipe()) batchId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: ProcessPaymentDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollCatalog
      .processAllPaymentsInBatch(batchId, companyId, body, authorization)
      .then((data) => ok(data, 'HRM-PB-202', 'Payment batch processed'));
  }

  @Post('advance-requests/:requestId/mark-paid')
  markAdvanceRequestPaid(
    @Param('requestId', new ParseUUIDPipe()) requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideAdvanceRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollService
      .markAdvanceRequestPaid(requestId, body, companyId ?? 'main', authorization, tenantId)
      .then((data) => ok(data, 'HRM-ADV-205', 'Advance request marked paid'));
  }
}
