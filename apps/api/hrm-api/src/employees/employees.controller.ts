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
 */
import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { toHrmListScopeContext } from '../common/hrm-list-scope-context';
import { resolveScopeContext } from '../common/scope-context';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { GetEmployeeQueryDto } from './dto/get-employee.query.dto';
import { EmployeeSummaryQueryDto } from './dto/employee-summary.query.dto';
import { ListEmployeesQueryDto } from './dto/list-employees.query.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeProfileListQueryDto } from './dto/employee-profile-list.query.dto';
import { EmployeeProfileService } from './employee-profile.service';
import { isDirectoryView } from './employee-directory';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly employeeProfile: EmployeeProfileService,
  ) {}

  private assertBusinessAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized employee access', HttpStatus.UNAUTHORIZED);
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
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.employeesService
      .createEmployee(body, authorization, toHrmListScopeContext(tenantId))
      // Thành công: Diễn biến #7 — hồ sơ mới trả FE (list sau F5 = #8).
      .then((data) => ok(data, 'HRM-EMP-201', 'Employee created'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    const scopeContext = toHrmListScopeContext(tenantId);
    if (isDirectoryView(query.view)) {
      return this.employeesService
        .listEmployeeDirectory(query, authorization, scopeContext)
        .then((data) => ok(data, 'HRM-EMP-DIR-200', 'Employee directory listed'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    const scopeContext = toHrmListScopeContext(tenantId);
    return this.employeesService
      .getEmployeesSummary(query, authorization, scopeContext)
      .then((data) => ok(data, 'HRM-EMP-SUMMARY-200', 'Employee summary loaded'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .listDegrees(employeeId, query, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-200', 'Employee degrees listed'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .listTraining(employeeId, query, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-200', 'Employee training listed'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .listAssets(employeeId, query, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-200', 'Employee assets listed'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .createAsset(employeeId, query, body, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-201', 'Employee asset created'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .updateAsset(assetId, employeeId, query, body, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-202', 'Employee asset updated'));
  }

  @Delete(':employeeId/assets/:assetId')
  deleteEmployeeAsset(
    @Param('employeeId') employeeId: string,
    @Param('assetId') assetId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EmployeeProfileListQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .deleteAsset(assetId, employeeId, query, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-200', 'Employee asset deleted'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .listSkills(employeeId, query, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-200', 'Employee skills listed'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .createSkill(employeeId, query, body, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-201', 'Employee skill created'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .updateSkill(skillId, employeeId, query, body, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-202', 'Employee skill updated'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .deleteSkill(skillId, employeeId, query, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-200', 'Employee skill deleted'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .listWorkTimeline(employeeId, query, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-200', 'Employee work timeline listed'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .createWorkTimelineItem(employeeId, query, body, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-201', 'Work timeline item created'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .updateWorkTimelineItem(itemId, employeeId, query, body, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-202', 'Work timeline item updated'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .deleteWorkTimelineItem(itemId, employeeId, query, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-200', 'Work timeline item deleted'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .listResumeFiles(employeeId, query, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-200', 'Employee resume files listed'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .listRewards(employeeId, query, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-200', 'Employee rewards listed'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .listDiscipline(employeeId, query, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-200', 'Employee discipline listed'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .createReward(employeeId, query, body, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-201', 'Employee reward created'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .updateReward(rewardId, employeeId, query, body, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-202', 'Employee reward updated'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .deleteReward(rewardId, employeeId, query, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-200', 'Employee reward deleted'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .createDiscipline(employeeId, query, body, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-201', 'Employee discipline created'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .updateDiscipline(disciplineId, employeeId, query, body, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-202', 'Employee discipline updated'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .deleteDiscipline(disciplineId, employeeId, query, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-200', 'Employee discipline deleted'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .createTraining(employeeId, query, body, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-201', 'Employee training created'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .updateTraining(trainingId, employeeId, query, body, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-202', 'Employee training updated'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.employeeProfile
      .deleteTraining(trainingId, employeeId, query, authorization)
      .then((data) => ok(data, 'HRM-EMP-PROFILE-200', 'Employee training deleted'));
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
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    const scopeContext = toHrmListScopeContext(tenantId);
    if (isDirectoryView(query.view)) {
      return this.employeesService
        .getEmployeeDirectoryById(employeeId, query, authorization, scopeContext)
        .then((data) => ok(data, 'HRM-EMP-200', 'Employee directory profile retrieved'));
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
    return this.employeesService
      .updateEmployee(employeeId, body, scope.companyId, authorization)
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
      .archiveEmployee(employeeId, scope.companyId, authorization, toHrmListScopeContext(tenantId))
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
      .restoreEmployee(employeeId, scope.companyId, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-EMP-204', 'Employee restored'));
  }
}
