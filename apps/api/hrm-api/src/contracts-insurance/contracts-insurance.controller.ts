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
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-CONTRACT-LEGAL-PRINT-BE-01
 * change_mode: ADD
 * What: Routes TPL/CL/PACK/PREV/VER/PDF under /contracts-insurance (F-CORE-CTR-*)
 * Why: DATA-01 §5 · TechSpec §6–§9 · sponsor CONFIRM 2026-08-06
 * must_keep: UF-HRM-02 registry CRUD; salary off body; contracts_printable_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-BE-02
 * change_mode: ADD
 * What: PDF route returns application/pdf binary; ?format=html debug; drop X-HRM-PDF-Stub default
 * Why: Q-CTR-02 QC CONDITION — real PDF engine
 * must_keep: print-spine GWC; company_id query scope; soft-delete
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-BE-03
 * change_mode: ADD
 * What: Routes contract-library publishes/pull/apply (F-CORE-CTR-PUB/PULL/APPLY)
 * Why: DATA-02 · ADR Option A group distribute
 * must_keep: print-spine GWC; pull≠apply; no synced_catalogs; honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-01
 * change_mode: EXPAND
 * What: company-settings CFG-01; matrix=xevn query; open catalog 9th+ CREATE
 * Why: XEVN-TPL-API · DYNAMIC LOCK (sponsor CORR-01)
 * must_keep: UF-HRM-02; printable=false; Q-CTR CLOSED
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-02
 * change_mode: FIX
 * What: (routes already present) — rebuild+restart ship company-settings + EXPAND create live
 * Why: QA-01 CFG 404 + HRM-VAL-001 on stale dist
 * must_keep: open catalog · print-spine · UF-HRM-02 · printable=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-01
 * change_mode: ADD
 * What: Routes F-SI-CAT-TYP/EFF under /contracts-insurance/insurance-types*
 * Why: DATA-01 · SA Option B · AC-PLT-SI-INS-01 Nest SoT
 * must_keep: enrollment ONE SoT · CTR seals · insurers OUT · printable=false · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BE-01
 * change_mode: ADD
 * What: Routes F-SI-CAT-INS/EFF under /contracts-insurance/insurers*
 * Why: DATA-01 · SA Option B · AC-PLT-SI-INSURER-01 Nest SoT
 * must_keep: si_insurance_type L1 RETAIN · enrollment ONE SoT · CTR seals · printable=false · U65 no seed
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
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest, resolveAuthorizationHeader } from '../common/internal-auth';
import { toHrmListScopeContext } from '../common/hrm-list-scope-context';
import { resolveScopeContext } from '../common/scope-context';
import { ContractLegalPrintService } from './contract-legal-print.service';
import { ContractLibraryPublishService } from './contract-library-publish.service';
import { ContractsInsuranceService } from './contracts-insurance.service';
import {
  CreateCompensationPackageDto,
  ReviseCompensationPackageDto,
} from './dto/create-compensation-package.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateInsurancePolicyDto } from './dto/create-insurance-policy.dto';
import { CreateInsuranceRecordDto } from './dto/create-insurance-record.dto';
import {
  ApplyContractLibraryDto,
  ContractPreviewDto,
  CreatePrintVersionDto,
  GetContractCompanySettingQueryDto,
  ListContractClausesQueryDto,
  ListContractLibraryPublishesQueryDto,
  ListContractPackRulesQueryDto,
  ListContractTemplatesQueryDto,
  PublishContractLibraryDto,
  PullContractLibraryDto,
  PutContractCompanySettingDto,
  PutContractPackRulesDto,
  PutContractPrintOverlayDto,
  PutTemplateClausesDto,
  UpdateContractClauseDto,
  UpdateContractTemplateDto,
  UpsertContractClauseDto,
  UpsertContractTemplateDto,
} from './dto/contract-legal-print.dto';
import { ListCompensationQueryDto } from './dto/list-compensation.query.dto';
import { ListExpiringQueryDto } from './dto/list-expiring.query.dto';
import { ListInsurancePoliciesQueryDto } from './dto/list-insurance-policies.query.dto';
import { ListContractsQueryDto } from './dto/list-contracts.query.dto';
import { ContractCreateContextQueryDto } from './dto/contract-create-context.query.dto';
import {
  GetSiInsuranceTypeQueryDto,
  ListEffectiveSiInsuranceTypesQueryDto,
  ListSiInsuranceTypesQueryDto,
  PatchSiInsuranceTypeDto,
  UpsertSiInsuranceTypeDto,
} from './dto/si-insurance-type.dto';
import {
  GetSiInsurerQueryDto,
  ListEffectiveSiInsurersQueryDto,
  ListSiInsurersQueryDto,
  PatchSiInsurerDto,
  UpsertSiInsurerDto,
} from './dto/si-insurer.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { UpdateInsurancePolicyDto } from './dto/update-insurance-policy.dto';
import { UpdateInsuranceRecordDto } from './dto/update-insurance-record.dto';
import { EmployeeCompensationService } from './employee-compensation.service';
import { SiInsuranceTypeService } from './si-insurance-type.service';
import { SiInsurerService } from './si-insurer.service';

@Controller('contracts-insurance')
export class ContractsInsuranceController {
  constructor(
    private readonly service: ContractsInsuranceService,
    private readonly compensation: EmployeeCompensationService,
    private readonly legalPrint: ContractLegalPrintService,
    private readonly libraryPublish: ContractLibraryPublishService,
    private readonly siInsuranceTypeService: SiInsuranceTypeService,
    private readonly siInsurerService: SiInsurerService,
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

  // --- Legal print spine (static paths before :contractId) ---

  @Post('contract-library/publishes')
  publishContractLibrary(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: PublishContractLibraryDto,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.libraryPublish
      .publishLibrary(body, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-CTR-PUB-201', 'Contract library published'));
  }

  @Get('contract-library/publishes')
  listContractLibraryPublishes(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListContractLibraryPublishesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = query.company_id ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.libraryPublish
      .listPublishes(authorization, toHrmListScopeContext(tenantId), cid)
      .then((data) => ok(data, 'HRM-CTR-PUB-200', 'Contract library publishes listed'));
  }

  @Get('contract-library/publishes/:publishVersion')
  getContractLibraryPublish(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('publishVersion') publishVersionRaw: string,
    @Query() query: ListContractLibraryPublishesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = query.company_id ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    const publishVersion = Number(publishVersionRaw);
    if (!Number.isFinite(publishVersion) || publishVersion < 1) {
      throw new ApiException('HRM-CTR-PUB-NOT-FOUND', 'Invalid publish_version', HttpStatus.NOT_FOUND);
    }
    return this.libraryPublish
      .getPublishByVersion(publishVersion, authorization, toHrmListScopeContext(tenantId), cid, true)
      .then((data) => ok(data, 'HRM-CTR-PUB-200', 'Contract library publish detail'));
  }

  @Post('contract-library/pull')
  pullContractLibrary(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: PullContractLibraryDto,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.libraryPublish
      .pullLibrary(body, cid, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-CTR-PULL-200', 'Contract library pulled'));
  }

  @Post('contract-library/apply')
  applyContractLibrary(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: ApplyContractLibraryDto,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.libraryPublish
      .applyLibrary(body, cid, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-CTR-APPLY-200', 'Contract library applied'));
  }

  @Get('contract-templates')
  listContractTemplates(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListContractTemplatesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.legalPrint
      .listTemplates(query, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-CTR-TPL-200', 'Contract templates listed'));
  }

  @Get('company-settings')
  getContractCompanySetting(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: GetContractCompanySettingQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id });
    return this.legalPrint
      .getCompanySetting(query, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-CTR-CFG-200', 'Contract company setting'));
  }

  @Put('company-settings')
  putContractCompanySetting(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: PutContractCompanySettingDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id });
    return this.legalPrint
      .putCompanySetting(body, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-CTR-CFG-200', 'Contract company setting saved'));
  }

  @Post('contract-templates')
  createContractTemplate(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertContractTemplateDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id });
    return this.legalPrint
      .createTemplate(body, authorization)
      .then((data) => ok(data, 'HRM-CTR-TPL-201', 'Contract template created'));
  }

  @Get('contract-templates/:templateId')
  getContractTemplateById(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('templateId', new ParseUUIDPipe()) templateId: string,
    @Query() query: ListContractTemplatesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.legalPrint
      .getTemplateById(
        templateId,
        query.company_id ?? headerCompanyId ?? 'main',
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-CTR-TPL-200', 'Contract template detail'));
  }

  @Patch('contract-templates/:templateId')
  updateContractTemplate(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('templateId', new ParseUUIDPipe()) templateId: string,
    @Body() body: UpdateContractTemplateDto,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.legalPrint
      .updateTemplate(templateId, body, cid, authorization)
      .then((data) => ok(data, 'HRM-CTR-TPL-200', 'Contract template updated'));
  }

  @Post('contract-templates/:templateId/activate')
  activateContractTemplate(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('templateId', new ParseUUIDPipe()) templateId: string,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.legalPrint
      .activateTemplate(templateId, cid, authorization)
      .then((data) => ok(data, 'HRM-CTR-TPL-200', 'Contract template activated'));
  }

  @Put('contract-templates/:templateId/clauses')
  putContractTemplateClauses(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('templateId', new ParseUUIDPipe()) templateId: string,
    @Body() body: PutTemplateClausesDto,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.legalPrint
      .putTemplateClauses(templateId, body, cid, authorization)
      .then((data) => ok(data, 'HRM-CTR-TPL-200', 'Template clauses ordered'));
  }

  @Get('contract-clauses')
  listContractClauses(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListContractClausesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.legalPrint
      .listClauses(query, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-CTR-CL-200', 'Contract clauses listed'));
  }

  @Post('contract-clauses')
  createContractClause(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertContractClauseDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id });
    return this.legalPrint
      .createClause(body, authorization)
      .then((data) => ok(data, 'HRM-CTR-CL-201', 'Contract clause created'));
  }

  @Get('contract-clauses/:clauseId')
  getContractClauseById(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('clauseId', new ParseUUIDPipe()) clauseId: string,
    @Query() query: ListContractClausesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.legalPrint
      .getClauseById(
        clauseId,
        query.company_id ?? headerCompanyId ?? 'main',
        authorization,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-CTR-CL-200', 'Contract clause detail'));
  }

  @Patch('contract-clauses/:clauseId')
  updateContractClause(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('clauseId', new ParseUUIDPipe()) clauseId: string,
    @Body() body: UpdateContractClauseDto,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.legalPrint
      .updateClause(clauseId, body, cid, authorization)
      .then((data) => ok(data, 'HRM-CTR-CL-200', 'Contract clause updated'));
  }

  @Post('contract-clauses/:clauseId/activate')
  activateContractClause(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('clauseId', new ParseUUIDPipe()) clauseId: string,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.legalPrint
      .activateClause(clauseId, cid, authorization)
      .then((data) => ok(data, 'HRM-CTR-CL-200', 'Contract clause activated'));
  }

  @Post('contract-clauses/:clauseId/retire')
  retireContractClause(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('clauseId', new ParseUUIDPipe()) clauseId: string,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.legalPrint
      .retireClause(clauseId, cid, authorization)
      .then((data) => ok(data, 'HRM-CTR-CL-200', 'Contract clause retired'));
  }

  @Get('contract-pack-rules')
  listContractPackRules(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListContractPackRulesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.legalPrint
      .listPackRules(query, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-CTR-PACK-200', 'Contract pack rules listed'));
  }

  @Put('contract-pack-rules')
  putContractPackRules(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: PutContractPackRulesDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id });
    return this.legalPrint
      .putPackRules(body, authorization)
      .then((data) => ok(data, 'HRM-CTR-PACK-200', 'Contract pack rules replaced'));
  }

  @Get('contracts/pack-resolve')
  resolveContractPack(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string | undefined,
    @Query('employee_id') employeeId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.legalPrint
      .resolvePackForEmployee(cid, employeeId, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-CTR-PACK-200', 'Contract pack resolved'));
  }

  @Get('print-versions/:versionId/pdf')
  async renderPrintVersionPdf(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('versionId', new ParseUUIDPipe()) versionId: string,
    @Query('company_id') companyId: string | undefined,
    @Query('format') formatRaw: string | undefined,
    @Res() res: Response,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    const format = formatRaw?.trim().toLowerCase() === 'html' ? 'html' : 'pdf';
    const pdf = await this.legalPrint.renderPrintVersionPdf(
      versionId,
      cid,
      authorization,
      toHrmListScopeContext(tenantId),
      format,
    );
    res.setHeader('Content-Type', pdf.content_type);
    res.setHeader('Content-Disposition', `inline; filename="${pdf.filename}"`);
    if (pdf.stub) {
      res.setHeader('X-HRM-PDF-Stub', 'true');
    } else {
      res.setHeader('X-HRM-PDF-Stub', 'false');
      res.setHeader('X-HRM-PDF-Engine', format === 'pdf' ? 'pdfkit' : 'html-debug');
    }
    res.status(200).send(pdf.body);
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

  // --- F-SI-CAT-TYP/EFF insurance-type Nest SoT (static before :id) ---

  @Get('insurance-types/effective')
  listEffectiveInsuranceTypes(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListEffectiveSiInsuranceTypesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id });
    return this.siInsuranceTypeService
      .listEffective(query, authorization, { tenantId })
      .then((data) => ok(data, 'HRM-SI-INS-TYPE-200', 'Effective insurance types listed'));
  }

  @Get('insurance-types')
  listInsuranceTypes(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListSiInsuranceTypesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id });
    return this.siInsuranceTypeService
      .listInsuranceTypes(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-SI-INS-TYPE-200', 'Insurance types listed'));
  }

  @Post('insurance-types')
  createInsuranceType(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertSiInsuranceTypeDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.siInsuranceTypeService
      .upsertInsuranceType(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-SI-INS-TYPE-201', 'Insurance type created'));
  }

  @Put('insurance-types')
  upsertInsuranceType(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertSiInsuranceTypeDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.siInsuranceTypeService
      .upsertInsuranceType(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-SI-INS-TYPE-200', 'Insurance type upserted'));
  }

  @Get('insurance-types/:insuranceTypeId')
  getInsuranceTypeById(
    @Param('insuranceTypeId', new ParseUUIDPipe()) insuranceTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: GetSiInsuranceTypeQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id });
    return this.siInsuranceTypeService
      .getInsuranceTypeById(insuranceTypeId, query.company_id, authorization, tenantId)
      .then((data) => ok(data, 'HRM-SI-INS-TYPE-200', 'Insurance type loaded'));
  }

  @Patch('insurance-types/:insuranceTypeId')
  patchInsuranceType(
    @Param('insuranceTypeId', new ParseUUIDPipe()) insuranceTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: PatchSiInsuranceTypeDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.siInsuranceTypeService
      .patchInsuranceType(insuranceTypeId, companyId, body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-SI-INS-TYPE-200', 'Insurance type updated'));
  }

  @Post('insurance-types/:insuranceTypeId/retire')
  retireInsuranceType(
    @Param('insuranceTypeId', new ParseUUIDPipe()) insuranceTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.siInsuranceTypeService
      .retireInsuranceType(insuranceTypeId, companyId, authorization, tenantId)
      .then((data) => ok(data, 'HRM-SI-INS-TYPE-200', 'Insurance type retired'));
  }

  // --- F-SI-CAT-INS/EFF insurers Nest SoT (static before :id) — SEPARATE from insurance-types ---

  @Get('insurers/effective')
  listEffectiveInsurers(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListEffectiveSiInsurersQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id });
    return this.siInsurerService
      .listEffective(query, authorization, { tenantId })
      .then((data) => ok(data, 'HRM-SI-INSURER-200', 'Effective insurers listed'));
  }

  @Get('insurers')
  listInsurers(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListSiInsurersQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id });
    return this.siInsurerService
      .listInsurers(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-SI-INSURER-200', 'Insurers listed'));
  }

  @Post('insurers')
  createInsurer(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertSiInsurerDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.siInsurerService
      .upsertInsurer(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-SI-INSURER-201', 'Insurer created'));
  }

  @Put('insurers')
  upsertInsurer(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertSiInsurerDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.siInsurerService
      .upsertInsurer(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-SI-INSURER-200', 'Insurer upserted'));
  }

  @Get('insurers/:insurerId')
  getInsurerById(
    @Param('insurerId', new ParseUUIDPipe()) insurerId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: GetSiInsurerQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id });
    return this.siInsurerService
      .getInsurerById(insurerId, query.company_id, authorization, tenantId)
      .then((data) => ok(data, 'HRM-SI-INSURER-200', 'Insurer loaded'));
  }

  @Patch('insurers/:insurerId')
  patchInsurer(
    @Param('insurerId', new ParseUUIDPipe()) insurerId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: PatchSiInsurerDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.siInsurerService
      .patchInsurer(insurerId, companyId, body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-SI-INSURER-200', 'Insurer updated'));
  }

  @Post('insurers/:insurerId/retire')
  retireInsurer(
    @Param('insurerId', new ParseUUIDPipe()) insurerId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.siInsurerService
      .retireInsurer(insurerId, companyId, authorization, tenantId)
      .then((data) => ok(data, 'HRM-SI-INSURER-200', 'Insurer retired'));
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
  @Get('employees/:employeeId/contract-create-context')
  getContractCreateContext(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('employeeId', new ParseUUIDPipe()) employeeId: string,
    @Query() query: ContractCreateContextQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = query.company_id ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.service
      .getContractCreateContext(employeeId, { company_id: cid }, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-CTR-CREATE-CTX-200', 'Contract create context bundle'));
  }

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

  @Post('contracts/:contractId/preview')
  previewContract(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('contractId', new ParseUUIDPipe()) contractId: string,
    @Body() body: ContractPreviewDto,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.legalPrint
      .previewContract(contractId, body, cid, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-CTR-PREV-200', 'Contract merge preview'));
  }

  @Put('contracts/:contractId/print-overlay')
  putContractPrintOverlay(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('contractId', new ParseUUIDPipe()) contractId: string,
    @Body() body: PutContractPrintOverlayDto,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.legalPrint
      .putContractPrintOverlay(contractId, body, cid, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-CTR-OVERLAY-200', 'Contract print overlay saved'));
  }

  @Post('contracts/:contractId/print-versions')
  createPrintVersion(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('contractId', new ParseUUIDPipe()) contractId: string,
    @Body() body: CreatePrintVersionDto,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.legalPrint
      .createPrintVersion(contractId, body, cid, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-CTR-VER-201', 'Print version issued'));
  }

  @Get('contracts/:contractId/print-versions')
  listPrintVersions(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('contractId', new ParseUUIDPipe()) contractId: string,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.legalPrint
      .listPrintVersions(contractId, cid, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-CTR-VER-200', 'Print versions listed'));
  }

  @Get('contracts/:contractId/print-versions/:versionId')
  getPrintVersionById(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('contractId', new ParseUUIDPipe()) _contractId: string,
    @Param('versionId', new ParseUUIDPipe()) versionId: string,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.legalPrint
      .getPrintVersionById(versionId, cid, authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-CTR-VER-200', 'Print version detail'));
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
