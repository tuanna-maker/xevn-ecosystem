/**
 * @CODE-MEMORY
 * Screen:     HRM → Hợp đồng & Bảo hiểm (HTTP /contracts-insurance)
 * UC:         UC-HRM-25 · HRM-CI-01 · HRM-CI-02
 * BR:         BR-CD-F5-01 (lương không bắt buộc trên body HĐ)
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.2 FR-HRM-CI-01 · §3.3 FR-HRM-CI-02
 * SRS bước:   CI-01 Diễn biến #1/#7/#8 · CI-02 Diễn biến #1/#6/#8
 * TechSpec:   docs/hrm/TECHSPEC.md §14.2 · §14.3 (ref_srs: FR-HRM-CI-01 · FR-HRM-CI-02)
 * Purpose:    Surface tạo/list HĐ + BH + compensation F5; khóa gắn hồ sơ NV.
 * WorkItem:   BE-HRM-CODE-MEMORY-SRS-STEP-01
 * Coded:      2026-07-21
 *
 * Callers:    apps/web/hrm EmployeeContracts / EmployeeInsurance / compensation panels
 * Callees:    ContractsInsuranceService · EmployeeCompensationService
 *
 * FE-Actions:
 *   | Thao tác        | Handler           | Lib / RPC                         |
 *   |-----------------|-------------------|-----------------------------------|
 *   | Lưu HĐ          | createContract    | POST …/contracts → HRM-CON-201    |
 *   | Lưu BH          | createInsurance   | POST …/insurance → HRM-CON-202    |
 *   | List / F5       | listContracts/…   | GET …/contracts · /insurance      |
 *
 * BE-Chain: controller → service → employee_contracts / employee_insurance_records
 * Impact:   Sai scope → 404 HĐ; bắt salary trên HĐ = phá BR-CD-F5-01
 * must_keep: F5 compensation packages; salary deprecated trên contract body
 * SOLID:    Controller auth+scope; service persist; compensation tách service
 * LastVerified: contracts-insurance.controller.spec.ts · employee-compensation.service.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-BE-ERP-E3-01
 * change_mode: ADD
 * What: Routes insurance-policies CRUD + insurance GET/PATCH by id (path freeze CI prefix)
 * Why: API_DESIGN_HRM_ERP_E3 §§6–12 · SA-ERP-E3-ACK-01
 * must_keep: contracts CRUD; list insurance; E2 type assert; no /api/hrm/insurance-policies alias
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
  Query,
} from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest, resolveAuthorizationHeader } from '../common/internal-auth';
import { toHrmListScopeContext } from '../common/hrm-list-scope-context';
import { resolveScopeContext } from '../common/scope-context';
import { ContractsInsuranceService } from './contracts-insurance.service';
import {
  CreateCompensationPackageDto,
  ReviseCompensationPackageDto,
} from './dto/create-compensation-package.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateInsurancePolicyDto } from './dto/create-insurance-policy.dto';
import { CreateInsuranceRecordDto } from './dto/create-insurance-record.dto';
import { ListCompensationQueryDto } from './dto/list-compensation.query.dto';
import { ListExpiringQueryDto } from './dto/list-expiring.query.dto';
import { ListInsurancePoliciesQueryDto } from './dto/list-insurance-policies.query.dto';
import { ListContractsQueryDto } from './dto/list-contracts.query.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { UpdateInsurancePolicyDto } from './dto/update-insurance-policy.dto';
import { UpdateInsuranceRecordDto } from './dto/update-insurance-record.dto';
import { EmployeeCompensationService } from './employee-compensation.service';

@Controller('contracts-insurance')
export class ContractsInsuranceController {
  constructor(
    private readonly service: ContractsInsuranceService,
    private readonly compensation: EmployeeCompensationService,
  ) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized contracts/insurance access', HttpStatus.UNAUTHORIZED);
    }
  }

  // --- F5 Compensation package (must register static paths before :packageId) ---

  @Post('compensation-packages')
  createCompensationPackage(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateCompensationPackageDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.compensation
      .createPackage(body, authorization)
      .then((data) => ok(data, 'HRM-COMP-201', 'Compensation package created'));
  }

  @Get('compensation-packages/active')
  getActiveCompensationPackage(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListCompensationQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.compensation
      .getActivePackage(query, authHeader, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-COMP-200', 'Active compensation package'));
  }

  @Get('compensation-packages')
  listCompensationPackages(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListCompensationQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.compensation
      .listPackages(query, authHeader, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-COMP-200', 'Compensation packages listed'));
  }

  @Get('compensation-packages/:packageId')
  getCompensationPackageById(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('packageId', new ParseUUIDPipe()) packageId: string,
    @Query() query: ListCompensationQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.compensation
      .getPackageById(
        packageId,
        query.company_id ?? headerCompanyId ?? 'main',
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-COMP-200', 'Compensation package detail'));
  }

  @Post('compensation-packages/:packageId/revise')
  reviseCompensationPackage(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('packageId', new ParseUUIDPipe()) packageId: string,
    @Body() body: ReviseCompensationPackageDto,
    @Query() query: ListCompensationQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.compensation
      .revisePackage(
        packageId,
        body,
        query.company_id ?? headerCompanyId ?? 'main',
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-COMP-201', 'Compensation package revised'));
  }

  @Get('compensation-history')
  listCompensationHistory(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListCompensationQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.compensation
      .listHistory(query, authHeader, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-COMP-200', 'Compensation history listed'));
  }

  /**
   * @CODE-MEMORY method · FR-HRM-CI-01
   * SRS bước: Diễn biến #1 auth · #7 Lưu thành công — tạo hợp đồng lao động
   * TechSpec: §14.2 ref_srs FR-HRM-CI-01 · POST …/contracts → HRM-CON-201
   */
  @Post('contracts')
  createContract(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateContractDto,
  ) {
    // Xử lý: Diễn biến #1 — auth/scope trước khi ghi HĐ.
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.service
      .createContract(body, authorization)
      // Thành công: Diễn biến #7 — dòng HĐ mới (F5 = #8).
      .then((data) => ok(data, 'HRM-CON-201', 'Contract created'));
  }

  /**
   * @CODE-MEMORY method · FR-HRM-CI-02
   * SRS bước: Diễn biến #1 auth · #6 Lưu thành công — ghi nhận bảo hiểm
   * TechSpec: §14.3 ref_srs FR-HRM-CI-02 · POST …/insurance → HRM-CON-202
   */
  @Post('insurance')
  createInsurance(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateInsuranceRecordDto,
  ) {
    // Xử lý: Diễn biến #1 — auth trước ghi BH (FR-HRM-CI-02).
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.service
      .createInsuranceRecord(body, authorization)
      // Thành công: Diễn biến #6 — dòng BH mới (F5 = #8).
      .then((data) => ok(data, 'HRM-CON-202', 'Insurance record created'));
  }

  @Get('contracts/expiring')
  listExpiringContracts(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListExpiringQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.service
      .listExpiringContracts(query, authorization)
      .then((data) => ok(data, 'HRM-CON-200', 'Expiring contracts listed'));
  }

  /**
   * @CODE-MEMORY method · FR-HRM-CI-02
   * SRS bước: Diễn biến #7 Empty / #8 Tải lại — list BH trong đơn vị
   * TechSpec: §14.3 ref_srs FR-HRM-CI-02 · GET …/insurance → HRM-CON-200
   */
  @Get('insurance')
  listInsurance(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListContractsQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.service
      .listInsurance(query, authHeader, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-CON-200', 'Insurance listed'));
  }

  @Get('insurance-policy-participants')
  listInsurancePolicyParticipants(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListContractsQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.service
      .listInsurance(query, authHeader, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-INS-200', 'Insurance policy participants listed'));
  }

  @Get('insurance/expiring')
  listExpiringInsurance(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListExpiringQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.service
      .listExpiringInsurance(query, authorization)
      .then((data) => ok(data, 'HRM-CON-200', 'Expiring insurance listed'));
  }

  /** E3 — policy master list (before :recordId) */
  @Get('insurance-policies')
  listInsurancePolicies(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListInsurancePoliciesQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.service
      .listInsurancePolicies(query, authHeader, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-INS-POL-200', 'Insurance policies listed'));
  }

  @Post('insurance-policies')
  createInsurancePolicy(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateInsurancePolicyDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.service
      .createInsurancePolicy(body, authorization)
      .then((data) => ok(data, 'HRM-INS-POL-201', 'Insurance policy created'));
  }

  @Get('insurance-policies/:policyId')
  getInsurancePolicyById(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('policyId', new ParseUUIDPipe()) policyId: string,
    @Query() query: ListInsurancePoliciesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.service
      .getInsurancePolicyById(
        policyId,
        query.company_id ?? headerCompanyId ?? 'main',
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-INS-POL-200', 'Insurance policy detail'));
  }

  @Patch('insurance-policies/:policyId')
  updateInsurancePolicy(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('policyId', new ParseUUIDPipe()) policyId: string,
    @Body() body: UpdateInsurancePolicyDto,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.service
      .updateInsurancePolicy(policyId, body, cid, authorization)
      .then((data) => ok(data, 'HRM-INS-POL-200', 'Insurance policy updated'));
  }

  @Delete('insurance-policies/:policyId')
  deleteInsurancePolicy(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('policyId', new ParseUUIDPipe()) policyId: string,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.service
      .deleteInsurancePolicy(policyId, cid, authorization)
      .then((data) => ok(data, 'HRM-INS-POL-200', 'Insurance policy deleted'));
  }

  @Get('insurance/:recordId')
  getInsuranceById(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('recordId', new ParseUUIDPipe()) recordId: string,
    @Query() query: ListContractsQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.service
      .getInsuranceRecordById(
        recordId,
        query.company_id ?? headerCompanyId ?? 'main',
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-CON-200', 'Insurance record detail'));
  }

  @Patch('insurance/:recordId')
  updateInsurance(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('recordId', new ParseUUIDPipe()) recordId: string,
    @Body() body: UpdateInsuranceRecordDto,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.service
      .updateInsuranceRecord(recordId, body, cid, authorization)
      .then((data) => ok(data, 'HRM-CON-200', 'Insurance record updated'));
  }

  /**
   * @CODE-MEMORY method · FR-HRM-CI-01
   * SRS bước: Diễn biến #8 Tải lại trang — list hợp đồng trong đơn vị
   * TechSpec: §14.2 ref_srs FR-HRM-CI-01 · GET …/contracts → HRM-CON-200
   */
  @Get('contracts')
  listContracts(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListContractsQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.service
      .listContracts(query, authHeader, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-CON-200', 'Contracts listed'));
  }

  @Get('contracts/:contractId')
  getContractById(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('contractId', new ParseUUIDPipe()) contractId: string,
    @Query() query: ListContractsQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.service
      .getContractById(
        contractId,
        query.company_id ?? headerCompanyId ?? 'main',
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-CON-200', 'Contract detail'));
  }

  @Patch('contracts/:contractId')
  updateContract(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('contractId') contractId: string,
    @Body() body: UpdateContractDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: headerCompanyId });
    return this.service
      .updateContract(contractId, body, headerCompanyId ?? 'main', authorization)
      .then((data) => ok(data, 'HRM-CON-200', 'Contract updated'));
  }

  @Delete('contracts/:contractId')
  deleteContract(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('contractId') contractId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: headerCompanyId });
    return this.service
      .deleteContract(contractId, headerCompanyId ?? 'main', authorization)
      .then((data) => ok(data, 'HRM-CON-200', 'Contract deleted'));
  }

}
