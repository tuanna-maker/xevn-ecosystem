/**
 * @CODE-MEMORY
 * Screen:     HRM → Lương / Phiếu lương (HTTP /payroll)
 * UC:         UC-HRM-24 · UC-HRM-28 · HRM-PR-05
 * BR:         scope ladder · empty trung thực khi chưa có phiếu
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.6 · FR-HRM-PR-05
 * SRS bước:   Diễn biến #1 auth · #4 Tải phiếu · #5 Empty hợp lệ · #6 Vượt phạm vi
 * TechSpec:   docs/hrm/TECHSPEC.md §14.6 (ref_srs: FR-HRM-PR-05)
 * Purpose:    Surface kỳ lương + list phiếu (W1 đọc); periods upstream cho xem phiếu.
 * WorkItem:   BE-HRM-CODE-MEMORY-SRS-STEP-01
 * Coded:      2026-07-21
 * Callers:    apps/web/hrm PayrollPayslipsApiTab
 * Callees:    PayrollService.listPayslips · PayrollCatalogService
 * FE-Actions: Chọn kỳ → GET payslips; empty = chưa có phiếu
 * BE-Chain:   controller → payroll_payslips JOIN payroll_periods
 * Impact:     Sai scope → xem hộ phiếu trái phép (Diễn biến #6)
 * must_keep:  empty 200 trung thực; không seed phiếu trong U65
 * SOLID:      Controller mỏng; service owns scope filters
 * LastVerified: payroll.controller.spec.ts · payroll.service.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-CODE-MEMORY-SRS-STEP-01
 * change_mode: ADD
 * What: CODE-MEMORY map Diễn biến PR-05 (không đổi logic)
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-01
 * change_mode: ADD
 * What: Surface F-PAY-FORMULA-* under /payroll/formulas (AUTHOR/PUBLISH/LIST/retire/preview stub)
 * must_keep: dual-control · scope_parity · cấm template HTTP · payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-TPL-BE-01
 * change_mode: ADD
 * What: Surface F-PAY-SHEET-TPL-* under /payroll/pay-sheet-templates (LIST/UPSERT/LINES/ARCHIVE + period bind)
 * must_keep: pack salary-templates ≠ mẫu · OV-C · soft-delete · payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BE-01
 * change_mode: ADD
 * What: GET salary-components/:id · DTO validation · list query filters · soft-delete retire
 * must_keep: scope_parity · payroll_e2e_ready=false · formula TEXT legacy only
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-PAYSLIP-LINES-GET-01
 * change_mode: ADD
 * What: F-PAY-PAYSLIP-01 GET /payslips/:id + /payslips/:id/lines (components from payroll_payslip_lines)
 * must_keep: scope_parity list↔get · 404 out-of-scope · payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-ESS-BE-01
 * change_mode: ADD
 * What: F-PAY-PAYSLIP-01 ESS GET /me/payslips* + POST confirm (AMIS step6 GĐ1)
 * must_keep: token employee_id · 403 cross-employee · payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-BE-01
 * change_mode: ADD
 * What: POST /periods/:id/wire-payment-batch — AMIS step7 batch from processed payslips
 * must_keep: payroll_e2e_ready=false · U65 no seed
 */
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
  Put,
  Query,
} from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import {
  isAuthorizedInternalRequest,
  resolveAuthorizationHeader,
} from '../common/internal-auth';
import { toHrmListScopeContext } from '../common/hrm-list-scope-context';
import { resolveScopeContext } from '../common/scope-context';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { UpdatePayrollPeriodDto } from './dto/update-payroll-period.dto';
import { CreatePayrollGroupDto } from './dto/create-payroll-group.dto';
import { UpdatePayrollGroupDto } from './dto/update-payroll-group.dto';
import { ListPayrollGroupsQueryDto } from './dto/list-payroll-groups.query.dto';
import { PayrollGroupMembersQueryDto } from './dto/payroll-group-members.query.dto';
import { PayrollEligibilityQueryDto } from './dto/payroll-eligibility.query.dto';
import { CreatePayrollEnrollDto } from './dto/create-payroll-enroll.dto';
import { ListPayrollPeriodsQueryDto } from './dto/list-payroll-periods.query.dto';
import { ListPayrollPayslipsQueryDto } from './dto/list-payroll-payslips.query.dto';
import { GetPayrollPayslipQueryDto } from './dto/get-payroll-payslip.query.dto';
import { ListMyPayslipsQueryDto } from './dto/list-my-payslips.query.dto';
import { PublishPayslipDto } from './dto/publish-payslip.dto';
import { PatchPayslipPaymentStatusDto } from './dto/patch-payslip-payment-status.dto';
import { VoidPayslipDto } from './dto/void-payslip.dto';
import { CreateSalaryTemplateDto } from './dto/create-salary-template.dto';
import { ListSalaryTemplatesQueryDto } from './dto/list-salary-templates.query.dto';
import { UpdateSalaryTemplateDto } from './dto/update-salary-template.dto';
import { CreateAdvanceRequestDto } from './dto/create-advance-request.dto';
import { CreateAdvanceRequestEmployeeDto } from './dto/create-advance-request-employee.dto';
import { DecideAdvanceRequestDto } from './dto/decide-advance-request.dto';
import {
  BridgeAdvanceToPeriodDto,
  CreatePeriodInputLineDto,
  ListPeriodInputLinesQueryDto,
  MarkAdvancePaidDto,
  UpdatePeriodInputLineDto,
} from './dto/pay-period-input-line.dto';
import {
  CreateTimesheetBindDto,
  ListTimesheetBindsQueryDto,
} from './dto/pay-period-timesheet-bind.dto';
import { ListAdvanceRequestsQueryDto } from './dto/list-advance-requests.query.dto';
import { AddPaymentRecordDto } from './dto/add-payment-record.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { WirePaymentBatchDto } from './dto/wire-payment-batch.dto';
import {
  CreatePayFormulaDto,
  CreatePayFormulaVersionDto,
  ListPayFormulasQueryDto,
  PayFormulaNoteDto,
  PreviewPayFormulaDto,
  UpdatePayFormulaDto,
} from './dto/pay-formula.dto';
import { PayrollService } from './payroll.service';
import { PayrollCatalogService } from './payroll-catalog.service';
import { PayPayrollGroupService } from './pay-payroll-group.service';
import { PayFormulaService } from './pay-formula.service';
import { PaySheetTemplateService } from './pay-sheet-template.service';
import { PayPeriodInputPackService } from './pay-period-input-pack.service';
import { PayCnttSetupService } from './pay-cntt-setup.service';
import {
  BindPaySheetTemplateDto,
  CreatePaySheetTemplateDto,
  ListPaySheetTemplatesQueryDto,
  PutPaySheetTemplateLinesDto,
  UpdatePaySheetTemplateDto,
} from './dto/pay-sheet-template.dto';
import {
  CreatePayInputPackProfileDto,
  CreatePayPolicyPackDto,
  ListPayInputPackProfilesQueryDto,
  ListPayPolicyPacksQueryDto,
  ResolvePaySetupQueryDto,
  UpdatePayInputPackProfileDto,
  UpdatePayPolicyPackDto,
} from './dto/pay-cntt-setup.dto';
import { TerminationSettleDto } from './dto/termination-settle.dto';
import {
  CreateSalaryComponentDto,
  ListSalaryComponentsQueryDto,
  UpdateSalaryComponentDto,
} from './dto/salary-component.dto';

@Controller('payroll')
export class PayrollController {
  constructor(
    private readonly payrollService: PayrollService,
    private readonly payrollCatalog: PayrollCatalogService,
    private readonly payFormulaService: PayFormulaService,
    private readonly paySheetTemplateService: PaySheetTemplateService,
    private readonly payInputPackService: PayPeriodInputPackService,
    private readonly payCnttSetupService: PayCnttSetupService,
    private readonly payPayrollGroupService: PayPayrollGroupService,
  ) {}

  private assertBusinessAccess(
    authorization?: string,
    internalApiKey?: string,
  ) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized payroll access',
        HttpStatus.UNAUTHORIZED,
      );
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
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    const templateId = body.paySheetTemplateId ?? body.pay_sheet_template_id;
    return this.payrollService
      .createPayrollPeriod(body, authorization, tenantId)
      .then(async (data) => {
        if (templateId) {
          const bound = await this.paySheetTemplateService.bindToPeriod(
            data.id,
            { company_id: body.company_id, paySheetTemplateId: templateId },
            authorization,
          );
          return ok(
            {
              ...data,
              pay_sheet_template_id: bound.pay_sheet_template_id,
              sheet_template_snapshot_json: bound.sheet_template_snapshot_json,
            },
            'HRM-PAY-201',
            'Payroll period created',
          );
        }
        return ok(data, 'HRM-PAY-201', 'Payroll period created');
      });
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
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.payrollService
      .listPayrollPeriods(query, authorization)
      .then((data) => ok(data, 'HRM-PAY-200', 'Payroll periods listed'));
  }

  @Patch('periods/:periodId')
  updatePayrollPeriod(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: UpdatePayrollPeriodDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollService
      .updatePayrollPeriod(periodId, scope.companyId, body, authorization)
      .then((data) => ok(data, 'HRM-PAY-200', 'Payroll period updated'));
  }

  @Get('groups')
  listPayrollGroups(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListPayrollGroupsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.payPayrollGroupService
      .listGroups(query, authorization)
      .then((data) => ok(data, 'HRM-PAY-200', 'Payroll groups listed'));
  }

  @Get('groups/:groupId')
  getPayrollGroup(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.payPayrollGroupService
      .getGroupById(groupId, scope.companyId, authorization)
      .then((data) => ok(data, 'HRM-PAY-200', 'Payroll group loaded'));
  }

  @Post('groups')
  createPayrollGroup(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: CreatePayrollGroupDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id,
    });
    return this.payPayrollGroupService
      .createGroup(body, authorization)
      .then((data) => ok(data, 'HRM-PAY-201', 'Payroll group created'));
  }

  @Patch('groups/:groupId')
  updatePayrollGroup(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: UpdatePayrollGroupDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.payPayrollGroupService
      .updateGroup(groupId, scope.companyId, body, authorization)
      .then((data) => ok(data, 'HRM-PAY-200', 'Payroll group updated'));
  }

  @Get('groups/:groupId/members')
  listPayrollGroupMembers(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Query() query: PayrollGroupMembersQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.payPayrollGroupService
      .listGroupMembers(
        groupId,
        scope.companyId,
        query.period_id,
        authorization,
      )
      .then((data) => ok(data, 'HRM-PAY-200', 'Payroll group members preview'));
  }

  @Post('periods/:periodId/process')
  processPayrollPeriod(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: Record<string, unknown> | undefined,
    @Query('include_terminations') includeTerminations?: string,
    @Query('company_id') queryCompanyId?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: queryCompanyId ?? companyId,
    });
    const queryPayload =
      includeTerminations != null
        ? { include_terminations: includeTerminations }
        : undefined;
    return this.payrollService
      .processPayrollPeriod(
        periodId,
        scope.companyId,
        authorization,
        body ?? null,
        queryPayload,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-PAY-202', 'Payroll period processed'));
  }

  @Post('periods/:periodId/termination-settle')
  terminationSettlePayrollPeriod(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: TerminationSettleDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollService
      .terminationSettlePayrollPeriod(
        periodId,
        scope.companyId,
        body,
        authorization,
      )
      .then((data) =>
        ok(data, 'HRM-PAY-TERM-200', 'Termination settlement saved'),
      );
  }

  @Get('periods/:periodId/termination-settle/preview')
  getTerminationSettlePreview(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Query('employee_id', new ParseUUIDPipe()) employeeId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollService
      .getTerminationSettlePreview(
        periodId,
        scope.companyId,
        employeeId,
        authorization,
      )
      .then((data) => ok(data, 'HRM-PAY-200', 'Termination settle preview'));
  }

  @Get('termination-settlements/:settlementId')
  getTerminationSettlementById(
    @Param('settlementId', new ParseUUIDPipe()) settlementId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollService
      .getTerminationSettlementById(
        settlementId,
        scope.companyId,
        authorization,
      )
      .then((data) => ok(data, 'HRM-PAY-200', 'Termination settlement loaded'));
  }

  @Get('periods/:periodId/eligibility')
  getPayrollEligibility(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Query() query: PayrollEligibilityQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollService
      .getPayrollEligibility(
        periodId,
        scope.companyId,
        authorization,
        query?.payroll_group_id,
      )
      .then((data) => ok(data, 'HRM-PAY-200', 'Payroll eligibility listed'));
  }

  @Post('periods/:periodId/enroll')
  enrollPayrollPeriod(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: CreatePayrollEnrollDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollService
      .enrollPayrollPeriod(periodId, scope.companyId, body, authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-ENROLL-200', 'Payroll period enrolled'),
      );
  }

  @Post('periods/:periodId/close')
  closePayrollPeriod(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: queryCompanyId ?? companyId,
    });
    return this.payrollService
      .closePayrollPeriod(
        periodId,
        scope.companyId,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-PAY-203', 'Payroll period closed'));
  }

  // ── F-PAY-PERIOD-BIND-01 / F-PAY-PERIOD-INPUT-01 (AMIS Step4 input packs) ──

  @Get('periods/:periodId/timesheet-binds')
  listTimesheetBinds(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListTimesheetBindsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.payInputPackService
      .listTimesheetBinds(periodId, scope.companyId, authorization, {
        includeArchived: Boolean(query.include_archived),
        transferKind: query.transfer_kind,
        scopeContext: toHrmListScopeContext(tenantId),
      })
      .then((data) => ok(data, 'HRM-PAY-INP-200', 'Timesheet binds listed'));
  }

  @Get('periods/:periodId/timesheet-binds/:bindId')
  getTimesheetBind(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Param('bindId', new ParseUUIDPipe()) bindId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: queryCompanyId ?? headerCompanyId,
    });
    return this.payInputPackService
      .getTimesheetBindById(periodId, bindId, scope.companyId, authorization)
      .then((data) => ok(data, 'HRM-PAY-INP-200', 'Timesheet bind retrieved'));
  }

  @Post('periods/:periodId/timesheet-binds')
  createTimesheetBind(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateTimesheetBindDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: headerCompanyId,
    });
    return this.payInputPackService
      .createTimesheetBind(periodId, body, scope.companyId, authorization)
      .then((data) => ok(data, 'HRM-PAY-INP-201', 'Timesheet bind created'));
  }

  @Post('periods/:periodId/timesheet-binds/:bindId/archive')
  archiveTimesheetBind(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Param('bindId', new ParseUUIDPipe()) bindId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: queryCompanyId ?? headerCompanyId,
    });
    return this.payInputPackService
      .archiveTimesheetBind(periodId, bindId, scope.companyId, authorization)
      .then((data) => ok(data, 'HRM-PAY-INP-200', 'Timesheet bind archived'));
  }

  @Get('periods/:periodId/input-lines')
  listPeriodInputLines(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListPeriodInputLinesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.payInputPackService
      .listInputLines(periodId, scope.companyId, authorization, {
        employeeId: query.employee_id,
        componentCode: query.component_code,
        sourceKind: query.source_kind,
        includeArchived: Boolean(query.include_archived),
        limit: query.limit,
      })
      .then((data) => ok(data, 'HRM-PAY-INP-200', 'Period input lines listed'));
  }

  @Get('periods/:periodId/input-lines/:lineId')
  getPeriodInputLine(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Param('lineId', new ParseUUIDPipe()) lineId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: queryCompanyId ?? headerCompanyId,
    });
    return this.payInputPackService
      .getInputLineById(periodId, lineId, scope.companyId, authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-INP-200', 'Period input line retrieved'),
      );
  }

  @Post('periods/:periodId/input-lines')
  createPeriodInputLine(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreatePeriodInputLineDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: headerCompanyId,
    });
    return this.payInputPackService
      .createInputLine(periodId, body, scope.companyId, authorization)
      .then((data) => ok(data, 'HRM-PAY-INP-201', 'Period input line created'));
  }

  @Patch('periods/:periodId/input-lines/:lineId')
  patchPeriodInputLine(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Param('lineId', new ParseUUIDPipe()) lineId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: UpdatePeriodInputLineDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: headerCompanyId,
    });
    return this.payInputPackService
      .patchInputLine(periodId, lineId, body, scope.companyId, authorization)
      .then((data) => ok(data, 'HRM-PAY-INP-200', 'Period input line updated'));
  }

  @Post('periods/:periodId/input-lines/:lineId/archive')
  archivePeriodInputLine(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Param('lineId', new ParseUUIDPipe()) lineId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') queryCompanyId?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: queryCompanyId ?? headerCompanyId,
    });
    return this.payInputPackService
      .archiveInputLine(periodId, lineId, scope.companyId, authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-INP-200', 'Period input line archived'),
      );
  }

  /**
   * AMIS step7 — wire payment batch from processed payslips (period close-out spine).
   */
  @Post('periods/:periodId/wire-payment-batch')
  wirePaymentBatchFromPeriod(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: WirePaymentBatchDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id,
    });
    return this.payrollCatalog
      .wirePaymentBatchFromPeriod(periodId, body, authorization)
      .then((data) =>
        ok(
          data,
          'HRM-PAY-WIRE-201',
          'Payment batch wired from processed payslips',
        ),
      );
  }

  /**
   * @CODE-MEMORY method · FR-HRM-PR-05
   * SRS bước: Diễn biến #1 auth · #4 Tải phiếu · #5 Empty hợp lệ · #6 scope
   * TechSpec: §14.6 ref_srs FR-HRM-PR-05 · GET /payroll/payslips → HRM-PAY-200
   */
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
    // Xử lý: Diễn biến #1 — auth; service lọc scope (#6).
    this.assertBusinessAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return (
      this.payrollService
        .listPayslips(query, authHeader, toHrmListScopeContext(tenantId))
        // Thành công: Diễn biến #4/#5 — list hoặc empty trung thực.
        .then((data) => ok(data, 'HRM-PAY-200', 'Payroll payslips listed'))
    );
  }

  /**
   * F-PAY-PAYSLIP-01 ESS — GET /payroll/me/payslips (token employee_id only).
   * Paper alias: GET /api/hrm/pay/me/payslips
   */
  @Get('me/payslips')
  listMyPayslips(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListMyPayslipsQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    const companyId = query.company_id ?? headerCompanyId;
    if (companyId) {
      resolveScopeContext(authHeader, { tenantId, companyId });
    }
    return this.payrollService
      .listMyPayslips(
        { company_id: companyId, period_id: query.period_id },
        authHeader,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-PAY-200', 'ESS payroll payslips listed'));
  }

  /**
   * F-PAY-PAYSLIP-01 ESS — GET /payroll/me/payslips/:payslipId
   */
  @Get('me/payslips/:payslipId')
  getMyPayslipById(
    @Param('payslipId', new ParseUUIDPipe()) payslipId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListMyPayslipsQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    const companyId = query.company_id ?? headerCompanyId;
    if (companyId) {
      resolveScopeContext(authHeader, { tenantId, companyId });
    }
    return this.payrollService
      .getMyPayslipById(
        payslipId,
        companyId,
        authHeader,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-PAY-200', 'ESS payroll payslip loaded'));
  }

  /**
   * AMIS step6 GĐ1 — POST /payroll/me/payslips/:payslipId/confirm
   */
  @Post('me/payslips/:payslipId/confirm')
  confirmMyPayslip(
    @Param('payslipId', new ParseUUIDPipe()) payslipId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListMyPayslipsQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    const companyId = query.company_id ?? headerCompanyId;
    if (companyId) {
      resolveScopeContext(authHeader, { tenantId, companyId });
    }
    return this.payrollService
      .confirmMyPayslip(
        payslipId,
        companyId,
        authHeader,
        toHrmListScopeContext(tenantId),
      )
      .then((data) =>
        ok(data, 'HRM-PAY-204-ESS', 'ESS payroll payslip confirmed'),
      );
  }

  /**
   * F-PAY-PAYSLIP-01 lines — GET /payroll/payslips/:payslipId/lines
   * SRS: FR-UC-BP-PAY-08 · API_DESIGN F-PAY-PAYSLIP-01 components[]
   */
  @Get('payslips/:payslipId/lines')
  listPayslipLines(
    @Param('payslipId', new ParseUUIDPipe()) payslipId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetPayrollPayslipQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.payrollService
      .listPayslipLines(
        payslipId,
        query.company_id,
        authHeader,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-PAY-200', 'Payroll payslip lines listed'));
  }

  /**
   * F-PAY-PAYSLIP-01 — GET /payroll/payslips/:payslipId (header + components/lines)
   * Paper alias: GET /api/hrm/pay/payslips/{id}
   */
  @Get('payslips/:payslipId')
  getPayslipById(
    @Param('payslipId', new ParseUUIDPipe()) payslipId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetPayrollPayslipQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    const includeSegments = query.include_segments !== false;
    return this.payrollService
      .getPayslipById(
        payslipId,
        query.company_id,
        authHeader,
        toHrmListScopeContext(tenantId),
        includeSegments,
      )
      .then((data) => ok(data, 'HRM-PAY-200', 'Payroll payslip loaded'));
  }

  @Post('payslips/:payslipId/publish')
  publishPayslip(
    @Param('payslipId', new ParseUUIDPipe()) payslipId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: PublishPayslipDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    const companyId = body.company_id ?? headerCompanyId ?? 'main';
    resolveScopeContext(authHeader, { tenantId, companyId });
    return this.payrollService
      .publishPayslip(
        payslipId,
        companyId,
        body,
        authHeader,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-PAY-200', 'Payroll payslip published'));
  }

  @Patch('payslips/:payslipId/payment-status')
  patchPayslipPaymentStatus(
    @Param('payslipId', new ParseUUIDPipe()) payslipId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: PatchPayslipPaymentStatusDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    const companyId = body.company_id ?? headerCompanyId ?? 'main';
    resolveScopeContext(authHeader, { tenantId, companyId });
    return this.payrollService
      .patchPayslipPaymentStatus(
        payslipId,
        companyId,
        body,
        authHeader,
        toHrmListScopeContext(tenantId),
      )
      .then((data) =>
        ok(data, 'HRM-PAY-200', 'Payroll payslip payment status updated'),
      );
  }

  @Post('payslips/:payslipId/void')
  voidPayslip(
    @Param('payslipId', new ParseUUIDPipe()) payslipId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: VoidPayslipDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    const companyId = body.company_id ?? headerCompanyId ?? 'main';
    resolveScopeContext(authHeader, { tenantId, companyId });
    return this.payrollService
      .voidPayslip(
        payslipId,
        companyId,
        body,
        authHeader,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-PAY-200', 'Payroll payslip voided'));
  }

  @Patch('payslips/:payslipId')
  denyGenericPayslipPatch(
    @Body() body: Record<string, unknown>,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    this.payrollService.denyGenericPayslipPatch(body);
    throw new ApiException(
      'HRM-PAY-PAYSLIP-405',
      'Unreachable',
      HttpStatus.METHOD_NOT_ALLOWED,
    );
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
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
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
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
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
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
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
      .then((data) =>
        ok(data, 'HRM-PAY-200', 'Salary template components listed'),
      );
  }

  @Post('salary-templates/:templateId/components')
  addSalaryTemplateComponent(
    @Param('templateId', new ParseUUIDPipe()) templateId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body()
    body: {
      company_id: string;
      component_id: string;
      default_value?: number;
      is_required?: boolean;
      sort_order?: number;
    },
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.payrollService
      .addSalaryTemplateComponent(templateId, body, authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-201', 'Salary template component added'),
      );
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
      .updateSalaryTemplateComponent(
        componentRowId,
        companyId,
        body,
        authorization,
      )
      .then((data) =>
        ok(data, 'HRM-PAY-200', 'Salary template component updated'),
      );
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
      .then((data) =>
        ok(data, 'HRM-PAY-200', 'Salary template component removed'),
      );
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
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.payrollService
      .deleteSalaryTemplate(templateId, companyId, authorization)
      .then((data) => ok(data, 'HRM-PAY-200', 'Salary template deleted'));
  }

  // --- AMIS mẫu bảng lương (≠ salary-templates enroll pack) ---

  // --- CNTT Thiết lập lương L4/L5 + resolve helper ---

  @Get('pay-policy-packs')
  listPayPolicyPacks(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListPayPolicyPacksQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.payCnttSetupService
      .listPolicyPacks(query, authorization)
      .then((data) => ok(data, 'HRM-PAY-POL-200', 'Policy packs listed'));
  }

  @Post('pay-policy-packs')
  createPayPolicyPack(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreatePayPolicyPackDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.payCnttSetupService
      .createPolicyPack(body, authorization)
      .then((data) => ok(data, 'HRM-PAY-POL-201', 'Policy pack created'));
  }

  @Get('pay-policy-packs/:id')
  getPayPolicyPack(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.payCnttSetupService
      .getPolicyPackById(
        id,
        companyId ?? headerCompanyId ?? 'main',
        authorization,
      )
      .then((data) => ok(data, 'HRM-PAY-POL-200', 'Policy pack loaded'));
  }

  @Patch('pay-policy-packs/:id')
  updatePayPolicyPack(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: UpdatePayPolicyPackDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.payCnttSetupService
      .updatePolicyPack(id, body, authorization)
      .then((data) => ok(data, 'HRM-PAY-POL-200', 'Policy pack updated'));
  }

  @Post('pay-policy-packs/:id/archive')
  archivePayPolicyPack(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.payCnttSetupService
      .archivePolicyPack(
        id,
        companyId ?? headerCompanyId ?? 'main',
        authorization,
      )
      .then((data) => ok(data, 'HRM-PAY-POL-200', 'Policy pack archived'));
  }

  @Get('pay-input-pack-profiles')
  listPayInputPackProfiles(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListPayInputPackProfilesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.payCnttSetupService
      .listInputProfiles(query, authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-INP-PROF-200', 'Input pack profiles listed'),
      );
  }

  @Post('pay-input-pack-profiles')
  createPayInputPackProfile(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreatePayInputPackProfileDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.payCnttSetupService
      .createInputProfile(body, authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-INP-PROF-201', 'Input pack profile created'),
      );
  }

  @Get('pay-input-pack-profiles/:id')
  getPayInputPackProfile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.payCnttSetupService
      .getInputProfileById(
        id,
        companyId ?? headerCompanyId ?? 'main',
        authorization,
      )
      .then((data) =>
        ok(data, 'HRM-PAY-INP-PROF-200', 'Input pack profile loaded'),
      );
  }

  @Patch('pay-input-pack-profiles/:id')
  updatePayInputPackProfile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: UpdatePayInputPackProfileDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.payCnttSetupService
      .updateInputProfile(id, body, authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-INP-PROF-200', 'Input pack profile updated'),
      );
  }

  @Post('pay-input-pack-profiles/:id/archive')
  archivePayInputPackProfile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.payCnttSetupService
      .archiveInputProfile(
        id,
        companyId ?? headerCompanyId ?? 'main',
        authorization,
      )
      .then((data) =>
        ok(data, 'HRM-PAY-INP-PROF-200', 'Input pack profile archived'),
      );
  }

  @Get('pay-setup/resolve')
  resolvePaySetup(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ResolvePaySetupQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.payCnttSetupService
      .resolveSetup(query, authorization)
      .then((data) => ok(data, 'HRM-PAY-SETUP-200', 'Pay setup resolved'));
  }

  @Get('pay-sheet-templates')
  listPaySheetTemplates(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListPaySheetTemplatesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.paySheetTemplateService
      .listTemplates(query, authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-TPL-200', 'Pay sheet templates listed'),
      );
  }

  @Post('pay-sheet-templates')
  createPaySheetTemplate(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreatePaySheetTemplateDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.paySheetTemplateService
      .createTemplate(body, authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-TPL-201', 'Pay sheet template created'),
      );
  }

  @Get('pay-sheet-templates/:id')
  getPaySheetTemplate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
    @Query('include_lines') includeLines?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.paySheetTemplateService
      .getTemplateById(
        id,
        companyId ?? headerCompanyId ?? 'main',
        authorization,
        {
          includeLines: String(includeLines ?? '').toLowerCase() === 'true',
        },
      )
      .then((data) => ok(data, 'HRM-PAY-TPL-200', 'Pay sheet template loaded'));
  }

  @Patch('pay-sheet-templates/:id')
  updatePaySheetTemplate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: UpdatePaySheetTemplateDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.paySheetTemplateService
      .updateTemplate(id, body, authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-TPL-200', 'Pay sheet template updated'),
      );
  }

  @Get('pay-sheet-templates/:id/lines')
  getPaySheetTemplateLines(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.paySheetTemplateService
      .getLines(id, companyId ?? headerCompanyId ?? 'main', authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-TPL-200', 'Pay sheet template lines listed'),
      );
  }

  @Put('pay-sheet-templates/:id/lines')
  putPaySheetTemplateLines(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: PutPaySheetTemplateLinesDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.paySheetTemplateService
      .replaceLines(id, body, authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-TPL-200', 'Pay sheet template lines replaced'),
      );
  }

  @Post('pay-sheet-templates/:id/archive')
  archivePaySheetTemplate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.paySheetTemplateService
      .archiveTemplate(
        id,
        companyId ?? headerCompanyId ?? 'main',
        authorization,
      )
      .then((data) =>
        ok(data, 'HRM-PAY-TPL-200', 'Pay sheet template archived'),
      );
  }

  @Post('pay-sheet-templates/:id/lines/:lineId/archive')
  archivePaySheetTemplateLine(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('lineId', new ParseUUIDPipe()) lineId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.paySheetTemplateService
      .archiveLine(
        id,
        lineId,
        companyId ?? headerCompanyId ?? 'main',
        authorization,
      )
      .then((data) =>
        ok(data, 'HRM-PAY-TPL-200', 'Pay sheet template line archived'),
      );
  }

  @Post('periods/:periodId/bind-sheet-template')
  bindPaySheetTemplateToPeriod(
    @Param('periodId', new ParseUUIDPipe()) periodId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: BindPaySheetTemplateDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.paySheetTemplateService
      .bindToPeriod(periodId, body, authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-TPL-200', 'Pay sheet template bound to period'),
      );
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
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.payrollService
      .getPayrollReconciliationSummary(scope.companyId, authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-200', 'Payroll reconciliation summary'),
      );
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
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
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
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: queryCompanyId ?? companyId,
    });
    return this.payrollService
      .listAdvanceRequestEmployees(
        requestId,
        scope.companyId,
        authorization,
        tenantId,
      )
      .then((data) =>
        ok(data, 'HRM-ADV-200', 'Advance request employees listed'),
      );
  }

  /** F-PAY-ADV-EMP-01 — product-path add NV (R-PAY-ADV-EMP-API-ABSENT). */
  @Post('advance-requests/:requestId/employees')
  createAdvanceRequestEmployee(
    @Param('requestId', new ParseUUIDPipe()) requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: CreateAdvanceRequestEmployeeDto,
    @Query('company_id') queryCompanyId?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: queryCompanyId ?? companyId,
    });
    return this.payrollService
      .createAdvanceRequestEmployee(
        requestId,
        body,
        scope.companyId,
        authorization,
        tenantId,
      )
      .then((data) =>
        ok(data, 'HRM-ADV-201', 'Advance request employee created'),
      );
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
      .approveAdvanceRequest(
        requestId,
        body,
        companyId ?? 'main',
        authorization,
        tenantId,
      )
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
      .rejectAdvanceRequest(
        requestId,
        body,
        companyId ?? 'main',
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-ADV-204', 'Advance request rejected'));
  }

  @Get('salary-components')
  listSalaryComponents(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListSalaryComponentsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.payrollCatalog
      .listSalaryComponents(query.company_id, authorization, query)
      .then((data) => ok(data, 'HRM-SC-200', 'Salary components listed'));
  }

  @Get('salary-components/:componentId')
  getSalaryComponent(
    @Param('componentId', new ParseUUIDPipe()) componentId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollCatalog
      .getSalaryComponentById(componentId, companyId, authorization)
      .then((data) => ok(data, 'HRM-SC-200', 'Salary component detail'));
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
      .then((data) =>
        ok(data, 'HRM-SC-200', 'Salary component categories listed'),
      );
  }

  @Post('salary-components')
  createSalaryComponent(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: CreateSalaryComponentDto,
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
    @Body() body: UpdateSalaryComponentDto,
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
      .then((data) =>
        ok(data, 'HRM-SC-201', 'Salary component category created'),
      );
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
      .then((data) =>
        ok(data, 'HRM-SC-200', 'Salary component category deleted'),
      );
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
    @Body() body: MarkAdvancePaidDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollService
      .markAdvanceRequestPaid(
        requestId,
        body,
        companyId ?? 'main',
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-ADV-205', 'Advance request marked paid'));
  }

  @Post('advance-requests/:requestId/bridge-to-period')
  bridgeAdvanceRequestToPeriod(
    @Param('requestId', new ParseUUIDPipe()) requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: BridgeAdvanceToPeriodDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.payrollService
      .bridgeAdvanceRequestToPeriod(
        requestId,
        body,
        companyId ?? 'main',
        authorization,
        tenantId,
      )
      .then((data) =>
        ok(data, 'HRM-ADV-206', 'Advance request bridged to period input pack'),
      );
  }

  // ── F-PAY-FORMULA-* (PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-01) ──────────────

  @Get('formulas')
  listPayFormulas(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListPayFormulasQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.payFormulaService
      .listFormulas(query, authorization)
      .then((data) => ok(data, 'HRM-PAY-FORMULA-200', 'Pay formulas listed'));
  }

  @Post('formulas')
  createPayFormula(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreatePayFormulaDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.payFormulaService
      .createFormula(body, authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-FORMULA-201', 'Pay formula draft created'),
      );
  }

  @Post('formulas/:code/versions')
  createPayFormulaVersion(
    @Param('code') code: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreatePayFormulaVersionDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.payFormulaService
      .createNewVersion(code, body, authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-FORMULA-201', 'Pay formula new version drafted'),
      );
  }

  @Get('formulas/:id')
  getPayFormula(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.payFormulaService
      .getFormulaById(id, companyId ?? headerCompanyId ?? 'main', authorization)
      .then((data) => ok(data, 'HRM-PAY-FORMULA-200', 'Pay formula loaded'));
  }

  @Put('formulas/:id')
  updatePayFormula(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: UpdatePayFormulaDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.payFormulaService
      .updateFormula(id, body, authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-FORMULA-200', 'Pay formula draft updated'),
      );
  }

  @Post('formulas/:id/submit-publish')
  submitPayFormulaPublish(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() _body: PayFormulaNoteDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.payFormulaService
      .submitPublish(id, companyId ?? headerCompanyId ?? 'main', authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-FORMULA-200', 'Pay formula submitted for publish'),
      );
  }

  @Post('formulas/:id/withdraw-publish')
  withdrawPayFormulaPublish(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.payFormulaService
      .withdrawPublish(
        id,
        companyId ?? headerCompanyId ?? 'main',
        authorization,
      )
      .then((data) =>
        ok(data, 'HRM-PAY-FORMULA-200', 'Pay formula withdrawn to draft'),
      );
  }

  @Post('formulas/:id/publish')
  publishPayFormula(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() _body: PayFormulaNoteDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.payFormulaService
      .publish(id, companyId ?? headerCompanyId ?? 'main', authorization)
      .then((data) => ok(data, 'HRM-PAY-FORMULA-200', 'Pay formula published'));
  }

  @Post('formulas/:id/retire')
  retirePayFormula(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.payFormulaService
      .retireFormula(id, companyId ?? headerCompanyId ?? 'main', authorization)
      .then((data) => ok(data, 'HRM-PAY-FORMULA-200', 'Pay formula retired'));
  }

  @Post('formulas/:id/preview')
  previewPayFormula(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: PreviewPayFormulaDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const companyId = body.company_id ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.payFormulaService
      .previewFormula(id, companyId, body, authorization)
      .then((data) => ok(data, 'HRM-PAY-FORMULA-200', 'Pay formula preview'));
  }
}
