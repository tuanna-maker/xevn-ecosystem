/**
 * @CODE-MEMORY
 * Screen:     HRM → Hồ sơ nhân viên (HTTP /employees)
 * UC:         UC-HRM-20 · UC-HRM-21 · HRM-EM-01
 * BR:         BR-HRM-SCOPE-LIST
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.1 · FR-HRM-EM-01
 * SRS bước:   Diễn biến #1 auth · #7 Lưu thành công (POST) · #8 Tải lại (GET list/get)
 * TechSpec:   docs/hrm/TECHSPEC.md §14.1 (ref_srs: FR-HRM-EM-01)
 * Purpose:    Surface Nest cho tạo/list/summary/CRUD hồ sơ; khóa id mở HĐ/BH/công.
 * WorkItem:   BE-HRM-CODE-MEMORY-SRS-STEP-01
 * Coded:      2026-07-21
 *
 * Callers:
 *   - portal/hrm FE → /api/hrm/employees*
 *
 * Callees:
 *   - EmployeesService.createEmployee / listEmployees / getEmployeesSummary / …
 *   - EmployeeProfileService.*
 *
 * FE-Actions:
 *   | Thao tác        | Handler             | Lib / RPC              |
 *   |-----------------|---------------------|------------------------|
 *   | Lưu hồ sơ mới   | createEmployee      | POST /employees        |
 *   | Danh sách / F5  | listEmployees       | GET /employees         |
 *   | Dashboard       | getEmployeesSummary | GET /employees/summary |
 *
 * BE-Chain: controller → EmployeesService → public.employees
 * Impact:   Sai thứ tự route summary → 500; sai scope → list trống / 404
 * must_keep: leave/recruit/F5; @Get('summary') trước :employeeId; empty list trung thực
 * SOLID:    Controller mỏng — auth + scope; service giữ nghiệp vụ
 * LastVerified: d-dash-01-employees-summary.spec.ts · cd-fb-05-perf-be.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-CODE-MEMORY-SRS-STEP-01
 * change_mode: ADD
 * What: Gắn SRS bước Diễn biến + TechSpec §14.1 ref_srs (không đổi nghiệp vụ)
 * Why: Sponsor lock — mỗi handler map FR-HRM-EM-01
 * SRS: docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.1 · FR-HRM-EM-01
 * TechSpec: docs/hrm/TECHSPEC.md §14.1 (ref_srs: FR-HRM-EM-01)
 * must_keep: CD-FB-05 cursor / summary route order
 *
 * @CODE-MEMORY-CHANGE 2026-07-19
 * WorkItem: CD-FB-05-PERF-BE
 * What: Document cursor query on list; no route change required (cursor is query param)
 * Why: Coordinate FE CD-FB-04 export walk off OFFSET storm
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-02-EMP
 * change_mode: UPGRADE
 * What: PATCH :employeeId truyền toHrmListScopeContext — parity list↔get↔patch (FR-UC-HRM-21)
 * Why: API_CONTRACT_NEW §3.4 · scope_parity U19
 * must_keep: summary route order; directory view branch; HRM-EMP-20x codes
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01
 * change_mode: ADD
 * What: Surface F-EMP-CAT-DOC/ET/EFF under /employees/document-types* · /employment-types*
 * Why: Platform Option B EMP open catalogs — DATA-01 + VERTICAL-SA CONFIRMED
 * must_keep: CORE-01/UF-HRM-02/SI · AC-PLT-EMP-01 XBOS position · summary/:employeeId route order · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01
 * change_mode: ADD
 * What: Surface F-EMP-CAT-ST/STR/EFF under /employees/employment-statuses* · /status-reasons*
 * Why: Option B status/reason open catalog — DATA+BA CONFIRMED · DROP chk_employees_status in service
 * must_keep: DOC/ET · EMP-CUSTOM/EXT · ATT/SI/CTR · summary/:employeeId route order · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-01-CLUSTER-BE-01
 * change_mode: ADD
 * What: Surface F-CORE-DEP-01 /employees/:employeeId/dependents* (GET/POST/PATCH/soft-DELETE)
 * Why: API-01 CONFIRMED · UC-BP-CORE-01 O5 · physical /employees only (no Nest /core dual)
 * must_keep: hire-readiness · summary route order · CB-403 on EMP mutate · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-08-CLUSTER-BE-01
 * change_mode: UPGRADE
 * What: Surface F-CORE-RD-01 rewards + discipline + POST enforce/cancel-enforce (no Nest /core dual)
 * Why: API-01 CONFIRMED · UC-BP-CORE-08 · payroll_link + period gates · note-CRUD neq FR-08 DONE
 * must_keep: dual LIVE · HRM-CORE-RD-* · CORE-01/02 seals · U65 · decisions neq RD
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-03-CLUSTER-BE-01
 * change_mode: ADD
 * What: Surface F-CORE-CHK-01 /employees/:employeeId/document-checklist* (no Nest /core dual)
 * Why: API-01 CONFIRMED · UC-BP-CORE-03 · wire assertDocumentTypeInEffectiveCatalog · RETAIN DOC/ET/TOK
 * must_keep: HRM-CORE-CHK-* · EMPPLATQA/EMPTOK seals · CORE-02b/09d..01 · U65 · no emp_position
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-05-CLUSTER-BE-01
 * change_mode: ADD
 * What: RETAIN /employees/:id/assets* · BB confirm PATCH · serial 409 · soft-delete waiver header
 * Why: API-01 CONFIRMED · F-CORE-AST-01/BB-01 · UC-BP-CORE-05 · paper /core alias only
 * must_keep: CORE-03 DOC/ET/CHK · CORE-02b · CORE-09d..01 · Nest /core DENY · AST-02 OUT · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-07-CLUSTER-BE-01
 * change_mode: ADD
 * What: Surface F-CORE-ACT-01 POST /employees/:employeeId/activate (no Nest /core dual)
 * Why: API-01 CONFIRMED · UC-BP-CORE-07 · GATE/EFF/ATT residual · gated PATCH same SoT
 * must_keep: CORE-06 soft≠DONE · CORE-05 AST · CORE-03 CHK · CORE-02b · CORE-09d..01 ·
 *            checklist≠DONE · free PATCH≠DONE · OUT invent PAY/ATT enroll · U65
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { toHrmListScopeContext } from '../common/hrm-list-scope-context';
import { resolveScopeContext } from '../common/scope-context';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ActivateEmployeeDto } from './dto/activate-employee.dto';
import { GetEmployeeQueryDto } from './dto/get-employee.query.dto';
import { EmployeeSummaryQueryDto } from './dto/employee-summary.query.dto';
import { ListEmployeesQueryDto } from './dto/list-employees.query.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeProfileListQueryDto } from './dto/employee-profile-list.query.dto';
import {
  CreateEmployeeDependentDto,
  GetEmployeeDependentQueryDto,
  ListEmployeeDependentsQueryDto,
  UpdateEmployeeDependentDto,
} from './dto/employee-dependent.dto';
import {
  CreateEmpDocumentChecklistDto,
  GetEmpDocumentChecklistQueryDto,
  ListEmpDocumentChecklistQueryDto,
  UpdateEmpDocumentChecklistDto,
} from './dto/emp-document-checklist.dto';
import {
  GetEmpDocumentTypeQueryDto,
  ListEffectiveEmpDocumentTypesQueryDto,
  ListEmpDocumentTypesQueryDto,
  PatchEmpDocumentTypeDto,
  UpsertEmpDocumentTypeDto,
} from './dto/emp-document-type.dto';
import {
  GetEmpEmploymentTypeQueryDto,
  ListEffectiveEmpEmploymentTypesQueryDto,
  ListEmpEmploymentTypesQueryDto,
  PatchEmpEmploymentTypeDto,
  UpsertEmpEmploymentTypeDto,
} from './dto/emp-employment-type.dto';
import {
  GetEmpEmploymentStatusQueryDto,
  ListEffectiveEmpEmploymentStatusesQueryDto,
  ListEmpEmploymentStatusesQueryDto,
  PatchEmpEmploymentStatusDto,
  UpsertEmpEmploymentStatusDto,
} from './dto/emp-employment-status.dto';
import {
  GetEmpStatusReasonQueryDto,
  ListEffectiveEmpStatusReasonsQueryDto,
  ListEmpStatusReasonsQueryDto,
  PatchEmpStatusReasonDto,
  UpsertEmpStatusReasonDto,
} from './dto/emp-status-reason.dto';
import { EmpDocumentChecklistService } from './emp-document-checklist.service';
import {
  HRM_CORE_CHK_200,
  HRM_CORE_CHK_201,
  HRM_CORE_CHK_202,
} from './emp-document-checklist.constants';
import { HRM_EMP_ACT_200 } from './emp-activate.constants';
import { EmpDocumentTypeService } from './emp-document-type.service';
import { EmpEmploymentStatusService } from './emp-employment-status.service';
import { EmpEmploymentTypeService } from './emp-employment-type.service';
import { EmpStatusReasonService } from './emp-status-reason.service';
import { EmployeeDependentsService } from './employee-dependents.service';
import {
  EmployeeProfileService,
  HRM_EMP_ASSET_DELETE_WAIVER,
} from './employee-profile.service';
import { EmployeeRewardDisciplineService } from './employee-reward-discipline.service';
import { isDirectoryView } from './employee-directory';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly employeeDependents: EmployeeDependentsService,
    private readonly employeeRewardDiscipline: EmployeeRewardDisciplineService,
    private readonly empDocumentChecklist: EmpDocumentChecklistService,
    private readonly employeeProfile: EmployeeProfileService,
    private readonly empDocumentTypeService: EmpDocumentTypeService,
    private readonly empEmploymentTypeService: EmpEmploymentTypeService,
    private readonly empEmploymentStatusService: EmpEmploymentStatusService,
    private readonly empStatusReasonService: EmpStatusReasonService,
  ) {}

  private assertBusinessAccess(
    authorization?: string,
    internalApiKey?: string,
  ) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized employee access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * @CODE-MEMORY method · FR-HRM-EM-01
   * SRS bước: Diễn biến #1 auth · #7 Lưu thành công — tạo hồ sơ mới
   * TechSpec: §14.1 ref_srs FR-HRM-EM-01 · POST /employees → HRM-EMP-201
   */
  @Post()
  createEmployee(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateEmployeeDto,
  ) {
    // Xử lý: Diễn biến #1 — từ chối nếu hết phiên / không đủ quyền.
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return (
      this.employeesService
        .createEmployee(body, authorization, toHrmListScopeContext(tenantId))
        // Thành công: Diễn biến #7 — hồ sơ mới trả FE (list sau F5 = #8).
        .then((data) => ok(data, 'HRM-EMP-201', 'Employee created'))
    );
  }

  /**
   * @CODE-MEMORY method · FR-HRM-EM-01
   * SRS bước: Diễn biến #8 Tải lại trang — danh sách / directory trong đơn vị
   * TechSpec: §14.1 ref_srs FR-HRM-EM-01 · GET /employees → HRM-EMP-200
   */
  @Get()
  listEmployees(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListEmployeesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    const scopeContext = toHrmListScopeContext(tenantId);
    if (isDirectoryView(query.view)) {
      return this.employeesService
        .listEmployeeDirectory(query, authorization, scopeContext)
        .then((data) =>
          ok(data, 'HRM-EMP-DIR-200', 'Employee directory listed'),
        );
    }
    return this.employeesService
      .listEmployees(query, authorization, scopeContext)
      .then((data) => ok(data, 'HRM-EMP-200', 'Employees listed'));
  }

  /**
   * @CODE-MEMORY method · FR-HRM-EM-01 (đọc tổng hợp cùng scope list)
   * SRS bước: Diễn biến #8 — tải lại / xem dữ liệu đơn vị (summary dashboard)
   * TechSpec: §14.1 ref_srs FR-HRM-EM-01 · GET /employees/summary
   * must_keep: route đăng ký trước :employeeId
   */
  @Get('summary')
  getEmployeesSummary(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeSummaryQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    const scopeContext = toHrmListScopeContext(tenantId);
    return this.employeesService
      .getEmployeesSummary(query, authorization, scopeContext)
      .then((data) =>
        ok(data, 'HRM-EMP-SUMMARY-200', 'Employee summary loaded'),
      );
  }

  // --- F-EMP-CAT-DOC / EFF-01 (must register before :employeeId) ---

  @Get('document-types/effective')
  listEffectiveDocumentTypes(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListEffectiveEmpDocumentTypesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.empDocumentTypeService
      .listEffective(query, authorization, { tenantId })
      .then((data) =>
        ok(data, 'HRM-EMP-DOC-200', 'Effective document types listed'),
      );
  }

  @Get('document-types')
  listDocumentTypes(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListEmpDocumentTypesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.empDocumentTypeService
      .listDocumentTypes(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-EMP-DOC-200', 'Document types listed'));
  }

  @Post('document-types')
  createDocumentType(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertEmpDocumentTypeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.empDocumentTypeService
      .upsertDocumentType(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-EMP-DOC-201', 'Document type created'));
  }

  @Put('document-types')
  upsertDocumentType(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertEmpDocumentTypeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.empDocumentTypeService
      .upsertDocumentType(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-EMP-DOC-200', 'Document type upserted'));
  }

  @Get('document-types/:documentTypeId')
  getDocumentTypeById(
    @Param('documentTypeId', new ParseUUIDPipe()) documentTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: GetEmpDocumentTypeQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.empDocumentTypeService
      .getDocumentTypeById(
        documentTypeId,
        query.company_id,
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-EMP-DOC-200', 'Document type loaded'));
  }

  @Patch('document-types/:documentTypeId')
  patchDocumentType(
    @Param('documentTypeId', new ParseUUIDPipe()) documentTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: PatchEmpDocumentTypeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.empDocumentTypeService
      .patchDocumentType(
        documentTypeId,
        companyId,
        body,
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-EMP-DOC-200', 'Document type updated'));
  }

  @Post('document-types/:documentTypeId/retire')
  retireDocumentType(
    @Param('documentTypeId', new ParseUUIDPipe()) documentTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.empDocumentTypeService
      .retireDocumentType(documentTypeId, companyId, authorization, tenantId)
      .then((data) => ok(data, 'HRM-EMP-DOC-200', 'Document type retired'));
  }

  // --- F-EMP-CAT-ET / EFF-02 (must register before :employeeId) ---

  @Get('employment-types/effective')
  listEffectiveEmploymentTypes(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListEffectiveEmpEmploymentTypesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.empEmploymentTypeService
      .listEffective(query, authorization, { tenantId })
      .then((data) =>
        ok(data, 'HRM-EMP-ET-200', 'Effective employment types listed'),
      );
  }

  @Get('employment-types')
  listEmploymentTypes(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListEmpEmploymentTypesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.empEmploymentTypeService
      .listEmploymentTypes(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-EMP-ET-200', 'Employment types listed'));
  }

  @Post('employment-types')
  createEmploymentType(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertEmpEmploymentTypeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.empEmploymentTypeService
      .upsertEmploymentType(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-EMP-ET-201', 'Employment type created'));
  }

  @Put('employment-types')
  upsertEmploymentType(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertEmpEmploymentTypeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.empEmploymentTypeService
      .upsertEmploymentType(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-EMP-ET-200', 'Employment type upserted'));
  }

  @Get('employment-types/:employmentTypeId')
  getEmploymentTypeById(
    @Param('employmentTypeId', new ParseUUIDPipe()) employmentTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: GetEmpEmploymentTypeQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.empEmploymentTypeService
      .getEmploymentTypeById(
        employmentTypeId,
        query.company_id,
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-EMP-ET-200', 'Employment type loaded'));
  }

  @Patch('employment-types/:employmentTypeId')
  patchEmploymentType(
    @Param('employmentTypeId', new ParseUUIDPipe()) employmentTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: PatchEmpEmploymentTypeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.empEmploymentTypeService
      .patchEmploymentType(
        employmentTypeId,
        companyId,
        body,
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-EMP-ET-200', 'Employment type updated'));
  }

  @Post('employment-types/:employmentTypeId/retire')
  retireEmploymentType(
    @Param('employmentTypeId', new ParseUUIDPipe()) employmentTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.empEmploymentTypeService
      .retireEmploymentType(
        employmentTypeId,
        companyId,
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-EMP-ET-200', 'Employment type retired'));
  }

  // --- F-EMP-CAT-ST / ST-EFF-01 (must register before :employeeId) ---

  @Get('employment-statuses/effective')
  listEffectiveEmploymentStatuses(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListEffectiveEmpEmploymentStatusesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.empEmploymentStatusService
      .listEffective(query, authorization, { tenantId })
      .then((data) =>
        ok(data, 'HRM-EMP-ST-200', 'Effective employment statuses listed'),
      );
  }

  @Get('employment-statuses')
  listEmploymentStatuses(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListEmpEmploymentStatusesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.empEmploymentStatusService
      .listEmploymentStatuses(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-EMP-ST-200', 'Employment statuses listed'));
  }

  @Post('employment-statuses')
  createEmploymentStatus(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertEmpEmploymentStatusDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.empEmploymentStatusService
      .upsertEmploymentStatus(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-EMP-ST-201', 'Employment status created'));
  }

  @Put('employment-statuses')
  upsertEmploymentStatus(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertEmpEmploymentStatusDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.empEmploymentStatusService
      .upsertEmploymentStatus(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-EMP-ST-200', 'Employment status upserted'));
  }

  @Get('employment-statuses/:statusId')
  getEmploymentStatusById(
    @Param('statusId', new ParseUUIDPipe()) statusId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: GetEmpEmploymentStatusQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.empEmploymentStatusService
      .getEmploymentStatusById(
        statusId,
        query.company_id,
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-EMP-ST-200', 'Employment status loaded'));
  }

  @Patch('employment-statuses/:statusId')
  patchEmploymentStatus(
    @Param('statusId', new ParseUUIDPipe()) statusId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: PatchEmpEmploymentStatusDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.empEmploymentStatusService
      .patchEmploymentStatus(statusId, companyId, body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-EMP-ST-200', 'Employment status updated'));
  }

  @Post('employment-statuses/:statusId/retire')
  retireEmploymentStatus(
    @Param('statusId', new ParseUUIDPipe()) statusId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.empEmploymentStatusService
      .retireEmploymentStatus(statusId, companyId, authorization, tenantId)
      .then((data) => ok(data, 'HRM-EMP-ST-200', 'Employment status retired'));
  }

  // --- F-EMP-CAT-STR / STR-EFF-01 (must register before :employeeId) ---

  @Get('status-reasons/effective')
  listEffectiveStatusReasons(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListEffectiveEmpStatusReasonsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.empStatusReasonService
      .listEffective(query, authorization, { tenantId })
      .then((data) =>
        ok(data, 'HRM-EMP-STR-200', 'Effective status reasons listed'),
      );
  }

  @Get('status-reasons')
  listStatusReasons(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListEmpStatusReasonsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.empStatusReasonService
      .listStatusReasons(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-EMP-STR-200', 'Status reasons listed'));
  }

  @Post('status-reasons')
  createStatusReason(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertEmpStatusReasonDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.empStatusReasonService
      .upsertStatusReason(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-EMP-STR-201', 'Status reason created'));
  }

  @Put('status-reasons')
  upsertStatusReason(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertEmpStatusReasonDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.empStatusReasonService
      .upsertStatusReason(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-EMP-STR-200', 'Status reason upserted'));
  }

  @Get('status-reasons/:reasonId')
  getStatusReasonById(
    @Param('reasonId', new ParseUUIDPipe()) reasonId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: GetEmpStatusReasonQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.empStatusReasonService
      .getStatusReasonById(reasonId, query.company_id, authorization, tenantId)
      .then((data) => ok(data, 'HRM-EMP-STR-200', 'Status reason loaded'));
  }

  @Patch('status-reasons/:reasonId')
  patchStatusReason(
    @Param('reasonId', new ParseUUIDPipe()) reasonId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: PatchEmpStatusReasonDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.empStatusReasonService
      .patchStatusReason(reasonId, companyId, body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-EMP-STR-200', 'Status reason updated'));
  }

  @Post('status-reasons/:reasonId/retire')
  retireStatusReason(
    @Param('reasonId', new ParseUUIDPipe()) reasonId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.empStatusReasonService
      .retireStatusReason(reasonId, companyId, authorization, tenantId)
      .then((data) => ok(data, 'HRM-EMP-STR-200', 'Status reason retired'));
  }

  @Get(':employeeId/degrees')
  listEmployeeDegrees(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .listDegrees(employeeId, query, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Employee degrees listed'),
      );
  }

  @Get(':employeeId/training')
  listEmployeeTraining(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .listTraining(employeeId, query, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Employee training listed'),
      );
  }

  @Get(':employeeId/assets')
  listEmployeeAssets(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .listAssets(employeeId, query, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Employee assets listed'),
      );
  }

  @Post(':employeeId/assets')
  createEmployeeAsset(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .createAsset(employeeId, query, body, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-201', 'Employee asset created'),
      );
  }

  @Patch(':employeeId/assets/:assetId')
  updateEmployeeAsset(
    @Param('employeeId') employeeId: string,
    @Param('assetId') assetId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .updateAsset(assetId, employeeId, query, body, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-202', 'Employee asset updated'),
      );
  }

  @Delete(':employeeId/assets/:assetId')
  deleteEmployeeAsset(
    @Param('employeeId') employeeId: string,
    @Param('assetId') assetId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Headers('x-ba-waiver') baWaiver: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    const waiverRaw = (baWaiver ?? '').trim();
    const waiverOk =
      waiverRaw === HRM_EMP_ASSET_DELETE_WAIVER ||
      waiverRaw === 'asset-hard-delete';
    return this.employeeProfile
      .deleteAsset(assetId, employeeId, query, authorization, {
        baWaiver: waiverOk,
      })
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Employee asset deleted'),
      );
  }

  @Get(':employeeId/skills')
  listEmployeeSkills(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .listSkills(employeeId, query, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Employee skills listed'),
      );
  }

  @Post(':employeeId/skills')
  createEmployeeSkill(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .createSkill(employeeId, query, body, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-201', 'Employee skill created'),
      );
  }

  @Patch(':employeeId/skills/:skillId')
  updateEmployeeSkill(
    @Param('employeeId') employeeId: string,
    @Param('skillId') skillId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .updateSkill(skillId, employeeId, query, body, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-202', 'Employee skill updated'),
      );
  }

  @Delete(':employeeId/skills/:skillId')
  deleteEmployeeSkill(
    @Param('employeeId') employeeId: string,
    @Param('skillId') skillId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .deleteSkill(skillId, employeeId, query, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Employee skill deleted'),
      );
  }

  @Get(':employeeId/work-timeline')
  listEmployeeWorkTimeline(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .listWorkTimeline(employeeId, query, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Employee work timeline listed'),
      );
  }

  /** F-CORE-HTP-05 — Hire-to-Pay bước 5 readiness (active contract same company). */
  @Get(':employeeId/hire-readiness')
  getHireReadiness(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetEmployeeQueryDto & { as_of?: string },
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeesService
      .getHireReadiness(
        employeeId,
        query,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-HTP-200', 'Hire readiness loaded'));
  }

  // --- F-CORE-CHK-01 — document checklist (must register before bare :employeeId) ---

  /** F-CORE-ACT-01 — Kích hoạt Hoạt động (prefer POST · paper /core alias only). */
  @Post(':employeeId/activate')
  activateEmployee(
    @Param('employeeId', new ParseUUIDPipe()) employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: ActivateEmployeeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.employeesService
      .activateEmployee(
        employeeId,
        body,
        scope.companyId,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, HRM_EMP_ACT_200, 'Employee activated'));
  }

  @Get(':employeeId/document-checklist')
  listEmployeeDocumentChecklist(
    @Param('employeeId', new ParseUUIDPipe()) employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListEmpDocumentChecklistQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.empDocumentChecklist
      .listChecklist(
        employeeId,
        query,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) =>
        ok(data, HRM_CORE_CHK_200, 'Employee document checklist listed'),
      );
  }

  @Post(':employeeId/document-checklist')
  createEmployeeDocumentChecklistItem(
    @Param('employeeId', new ParseUUIDPipe()) employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetEmpDocumentChecklistQueryDto,
    @Body() body: CreateEmpDocumentChecklistDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.empDocumentChecklist
      .createChecklistItem(
        employeeId,
        query,
        body,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) =>
        ok(data, HRM_CORE_CHK_201, 'Employee document checklist item created'),
      );
  }

  @Get(':employeeId/document-checklist/:itemId')
  getEmployeeDocumentChecklistItem(
    @Param('employeeId', new ParseUUIDPipe()) employeeId: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetEmpDocumentChecklistQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.empDocumentChecklist
      .getChecklistItemById(
        employeeId,
        itemId,
        query,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) =>
        ok(data, HRM_CORE_CHK_200, 'Employee document checklist item loaded'),
      );
  }

  @Patch(':employeeId/document-checklist/:itemId')
  updateEmployeeDocumentChecklistItem(
    @Param('employeeId', new ParseUUIDPipe()) employeeId: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetEmpDocumentChecklistQueryDto,
    @Body() body: UpdateEmpDocumentChecklistDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.empDocumentChecklist
      .updateChecklistItem(
        employeeId,
        itemId,
        query,
        body,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) =>
        ok(data, HRM_CORE_CHK_200, 'Employee document checklist item updated'),
      );
  }

  @Post(':employeeId/document-checklist/:itemId/archive')
  archiveEmployeeDocumentChecklistItem(
    @Param('employeeId', new ParseUUIDPipe()) employeeId: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetEmpDocumentChecklistQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.empDocumentChecklist
      .softArchiveChecklistItem(
        employeeId,
        itemId,
        query,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) =>
        ok(data, HRM_CORE_CHK_202, 'Employee document checklist item archived'),
      );
  }

  // --- F-CORE-DEP-01 — dependents (must register before bare :employeeId) ---

  @Get(':employeeId/dependents')
  listEmployeeDependents(
    @Param('employeeId', new ParseUUIDPipe()) employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListEmployeeDependentsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeDependents
      .listDependents(
        employeeId,
        query,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) =>
        ok(data, 'HRM-CORE-DEP-200', 'Employee dependents listed'),
      );
  }

  @Post(':employeeId/dependents')
  createEmployeeDependent(
    @Param('employeeId', new ParseUUIDPipe()) employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetEmployeeDependentQueryDto,
    @Body() body: CreateEmployeeDependentDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeDependents
      .createDependent(
        employeeId,
        query,
        body,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) =>
        ok(data, 'HRM-CORE-DEP-201', 'Employee dependent created'),
      );
  }

  @Get(':employeeId/dependents/:dependentId')
  getEmployeeDependentById(
    @Param('employeeId', new ParseUUIDPipe()) employeeId: string,
    @Param('dependentId', new ParseUUIDPipe()) dependentId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetEmployeeDependentQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeDependents
      .getDependentById(
        employeeId,
        dependentId,
        query,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) =>
        ok(data, 'HRM-CORE-DEP-200', 'Employee dependent loaded'),
      );
  }

  @Patch(':employeeId/dependents/:dependentId')
  updateEmployeeDependent(
    @Param('employeeId', new ParseUUIDPipe()) employeeId: string,
    @Param('dependentId', new ParseUUIDPipe()) dependentId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetEmployeeDependentQueryDto,
    @Body() body: UpdateEmployeeDependentDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeDependents
      .updateDependent(
        employeeId,
        dependentId,
        query,
        body,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) =>
        ok(data, 'HRM-CORE-DEP-200', 'Employee dependent updated'),
      );
  }

  @Delete(':employeeId/dependents/:dependentId')
  softDeleteEmployeeDependent(
    @Param('employeeId', new ParseUUIDPipe()) employeeId: string,
    @Param('dependentId', new ParseUUIDPipe()) dependentId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetEmployeeDependentQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeDependents
      .softDeleteDependent(
        employeeId,
        dependentId,
        query,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) =>
        ok(data, 'HRM-CORE-DEP-200', 'Employee dependent archived'),
      );
  }

  @Post(':employeeId/work-timeline')
  createEmployeeWorkTimeline(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .createWorkTimelineItem(employeeId, query, body, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-201', 'Work timeline item created'),
      );
  }

  @Patch(':employeeId/work-timeline/:itemId')
  updateEmployeeWorkTimeline(
    @Param('employeeId') employeeId: string,
    @Param('itemId') itemId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .updateWorkTimelineItem(itemId, employeeId, query, body, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-202', 'Work timeline item updated'),
      );
  }

  @Delete(':employeeId/work-timeline/:itemId')
  deleteEmployeeWorkTimeline(
    @Param('employeeId') employeeId: string,
    @Param('itemId') itemId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .deleteWorkTimelineItem(itemId, employeeId, query, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Work timeline item deleted'),
      );
  }

  @Get(':employeeId/resume-files')
  listEmployeeResumeFiles(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .listResumeFiles(employeeId, query, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Employee resume files listed'),
      );
  }

  @Post(':employeeId/resume-files')
  createEmployeeResumeFile(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .createResumeFile(employeeId, query, body, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-201', 'Resume file created'));
  }

  @Delete(':employeeId/resume-files/:fileId')
  deleteEmployeeResumeFile(
    @Param('employeeId') employeeId: string,
    @Param('fileId') fileId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .deleteResumeFile(fileId, employeeId, query, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-200', 'Resume file deleted'));
  }

  @Get(':employeeId/rewards')
  listEmployeeRewards(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeRewardDiscipline
      .listRewards(employeeId, query, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Employee rewards listed'),
      );
  }

  @Get(':employeeId/rewards/:rewardId')
  getEmployeeReward(
    @Param('employeeId') employeeId: string,
    @Param('rewardId') rewardId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeRewardDiscipline
      .getReward(rewardId, employeeId, query, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Employee reward loaded'),
      );
  }

  @Get(':employeeId/discipline')
  listEmployeeDiscipline(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeRewardDiscipline
      .listDiscipline(employeeId, query, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Employee discipline listed'),
      );
  }

  @Get(':employeeId/discipline/:disciplineId')
  getEmployeeDiscipline(
    @Param('employeeId') employeeId: string,
    @Param('disciplineId') disciplineId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeRewardDiscipline
      .getDiscipline(disciplineId, employeeId, query, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Employee discipline loaded'),
      );
  }

  @Post(':employeeId/rewards')
  createEmployeeReward(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeRewardDiscipline
      .createReward(employeeId, query, body, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-201', 'Employee reward created'),
      );
  }

  @Patch(':employeeId/rewards/:rewardId')
  updateEmployeeReward(
    @Param('employeeId') employeeId: string,
    @Param('rewardId') rewardId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeRewardDiscipline
      .updateReward(rewardId, employeeId, query, body, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-202', 'Employee reward updated'),
      );
  }

  @Post(':employeeId/rewards/:rewardId/enforce')
  enforceEmployeeReward(
    @Param('employeeId') employeeId: string,
    @Param('rewardId') rewardId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeRewardDiscipline
      .enforceReward(rewardId, employeeId, query, body, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Employee reward enforced'),
      );
  }

  @Post(':employeeId/rewards/:rewardId/cancel-enforce')
  cancelEnforceEmployeeReward(
    @Param('employeeId') employeeId: string,
    @Param('rewardId') rewardId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeRewardDiscipline
      .cancelEnforceReward(rewardId, employeeId, query, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Employee reward enforce cancelled'),
      );
  }

  @Delete(':employeeId/rewards/:rewardId')
  deleteEmployeeReward(
    @Param('employeeId') employeeId: string,
    @Param('rewardId') rewardId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeRewardDiscipline
      .deleteReward(rewardId, employeeId, query, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Employee reward deleted'),
      );
  }

  @Post(':employeeId/discipline')
  createEmployeeDiscipline(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeRewardDiscipline
      .createDiscipline(employeeId, query, body, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-201', 'Employee discipline created'),
      );
  }

  @Patch(':employeeId/discipline/:disciplineId')
  updateEmployeeDiscipline(
    @Param('employeeId') employeeId: string,
    @Param('disciplineId') disciplineId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeRewardDiscipline
      .updateDiscipline(disciplineId, employeeId, query, body, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-202', 'Employee discipline updated'),
      );
  }

  @Post(':employeeId/discipline/:disciplineId/enforce')
  enforceEmployeeDiscipline(
    @Param('employeeId') employeeId: string,
    @Param('disciplineId') disciplineId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeRewardDiscipline
      .enforceDiscipline(disciplineId, employeeId, query, body, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Employee discipline enforced'),
      );
  }

  @Post(':employeeId/discipline/:disciplineId/cancel-enforce')
  cancelEnforceEmployeeDiscipline(
    @Param('employeeId') employeeId: string,
    @Param('disciplineId') disciplineId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeRewardDiscipline
      .cancelEnforceDiscipline(disciplineId, employeeId, query, authorization)
      .then((data) =>
        ok(
          data,
          'HRM-EMP-PROFILE-200',
          'Employee discipline enforce cancelled',
        ),
      );
  }

  @Delete(':employeeId/discipline/:disciplineId')
  deleteEmployeeDiscipline(
    @Param('employeeId') employeeId: string,
    @Param('disciplineId') disciplineId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeRewardDiscipline
      .deleteDiscipline(disciplineId, employeeId, query, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Employee discipline deleted'),
      );
  }

  @Post(':employeeId/training')
  createEmployeeTraining(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .createTraining(employeeId, query, body, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-201', 'Employee training created'),
      );
  }

  @Patch(':employeeId/training/:trainingId')
  updateEmployeeTraining(
    @Param('employeeId') employeeId: string,
    @Param('trainingId') trainingId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .updateTraining(trainingId, employeeId, query, body, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-202', 'Employee training updated'),
      );
  }

  @Delete(':employeeId/training/:trainingId')
  deleteEmployeeTraining(
    @Param('employeeId') employeeId: string,
    @Param('trainingId') trainingId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.employeeProfile
      .deleteTraining(trainingId, employeeId, query, authorization)
      .then((data) =>
        ok(data, 'HRM-EMP-PROFILE-200', 'Employee training deleted'),
      );
  }

  /**
   * @CODE-MEMORY method · FR-HRM-EM-01
   * SRS bước: Diễn biến #8 — chi tiết hồ sơ / F5 cùng scope list (U19)
   * TechSpec: §14.1 ref_srs FR-HRM-EM-01 · GET …/:employeeId → HRM-EMP-200
   */
  @Get(':employeeId')
  getEmployeeById(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetEmployeeQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    const scopeContext = toHrmListScopeContext(tenantId);
    if (isDirectoryView(query.view)) {
      return this.employeesService
        .getEmployeeDirectoryById(
          employeeId,
          query,
          authorization,
          scopeContext,
        )
        .then((data) =>
          ok(data, 'HRM-EMP-200', 'Employee directory profile retrieved'),
        );
    }
    return this.employeesService
      .getEmployeeById(employeeId, query, authorization, scopeContext)
      .then((data) => ok(data, 'HRM-EMP-200', 'Employee retrieved'));
  }

  @Patch(':employeeId')
  updateEmployee(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: UpdateEmployeeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    // FR-UC-HRM-21 — patch cùng scopeContext tenant như GET list/get-by-id.
    return this.employeesService
      .updateEmployee(
        employeeId,
        body,
        scope.companyId,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-EMP-202', 'Employee updated'));
  }

  @Post(':employeeId/archive')
  archiveEmployee(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.employeesService
      .archiveEmployee(
        employeeId,
        scope.companyId,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-EMP-203', 'Employee archived'));
  }

  @Post(':employeeId/restore')
  restoreEmployee(
    @Param('employeeId') employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.employeesService
      .restoreEmployee(
        employeeId,
        scope.companyId,
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-EMP-204', 'Employee restored'));
  }
}
