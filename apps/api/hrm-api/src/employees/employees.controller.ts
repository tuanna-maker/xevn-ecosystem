import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { toHrmListScopeContext } from '../common/hrm-list-scope-context';
import { resolveScopeContext } from '../common/scope-context';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { GetEmployeeQueryDto } from './dto/get-employee.query.dto';
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

  @Post()
  createEmployee(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateEmployeeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.employeesService
      .createEmployee(body, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-EMP-201', 'Employee created'));
  }

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
