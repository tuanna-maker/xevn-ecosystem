/**
 * @CODE-MEMORY
 * Screen:     HRM → Đánh giá hiệu suất (HTTP /performance)
 * UC:         FR-HRM-PF-01 · FR-HRM-PERF-SM-E3-01
 * BR:         BR-HRM-PERF-E3-01..03
 * SRS:        docs/program/deltas/BA_ERP_E3_SRS_01_20260728.md Diễn biến #3–#9
 * TechSpec:   docs/hrm/TECHSPEC.md §16.1
 * API_DESIGN: docs/hrm/API_DESIGN_HRM_ERP_E3.md §§1–4
 * Purpose:    Surface tạo/list/PATCH/DELETE chu kỳ + phiếu đánh giá.
 * WorkItem:   D-BE-ERP-E3-01
 * Coded:      2026-07-28
 * Callers:    web portal performance embed
 * Callees:    PerformanceService
 * must_keep:  W2 POST/GET; E3 ADD PATCH/DELETE only
 * LastVerified: be-erp-e3-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-BE-ERP-E3-01
 * change_mode: ADD
 * What: PATCH/DELETE cycles + evaluations routes
 * Why: AC-PERF-01/02/03
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
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { CreatePerformanceCycleDto } from './dto/create-performance-cycle.dto';
import { CreatePerformanceEvaluationDto } from './dto/create-performance-evaluation.dto';
import {
  ListPerformanceCyclesQueryDto,
  ListPerformanceEvaluationsQueryDto,
} from './dto/list-performance.query.dto';
import { UpdatePerformanceCycleDto } from './dto/update-performance-cycle.dto';
import { UpdatePerformanceEvaluationDto } from './dto/update-performance-evaluation.dto';
import { PerformanceService } from './performance.service';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly service: PerformanceService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized performance access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('cycles')
  createCycle(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreatePerformanceCycleDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.service
      .createCycle(body, authorization)
      .then((data) => ok(data, 'HRM-PERF-201', 'Performance cycle created'));
  }

  @Get('cycles')
  listCycles(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListPerformanceCyclesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.service
      .listCycles(query, authorization)
      .then((data) => ok(data, 'HRM-PERF-200', 'Performance cycles listed'));
  }

  @Patch('cycles/:cycleId')
  updateCycle(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('cycleId', new ParseUUIDPipe()) cycleId: string,
    @Body() body: UpdatePerformanceCycleDto,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.service
      .updateCycle(cycleId, body, cid, authorization)
      .then((data) => ok(data, 'HRM-PERF-200', 'Performance cycle updated'));
  }

  @Delete('cycles/:cycleId')
  deleteCycle(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('cycleId', new ParseUUIDPipe()) cycleId: string,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.service
      .deleteCycle(cycleId, cid, authorization)
      .then((data) => ok(data, 'HRM-PERF-200', 'Performance cycle deleted'));
  }

  @Post('evaluations')
  createEvaluation(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreatePerformanceEvaluationDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.service
      .createEvaluation(body, authorization)
      .then((data) =>
        ok(data, 'HRM-PERF-202', 'Performance evaluation created'),
      );
  }

  @Get('evaluations')
  listEvaluations(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListPerformanceEvaluationsQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.service
      .listEvaluations(query, authorization)
      .then((data) =>
        ok(data, 'HRM-PERF-200', 'Performance evaluations listed'),
      );
  }

  @Patch('evaluations/:evaluationId')
  updateEvaluation(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('evaluationId', new ParseUUIDPipe()) evaluationId: string,
    @Body() body: UpdatePerformanceEvaluationDto,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.service
      .updateEvaluation(evaluationId, body, cid, authorization)
      .then((data) =>
        ok(data, 'HRM-PERF-200', 'Performance evaluation updated'),
      );
  }

  @Delete('evaluations/:evaluationId')
  deleteEvaluation(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('evaluationId', new ParseUUIDPipe()) evaluationId: string,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const cid = companyId ?? headerCompanyId ?? 'main';
    resolveScopeContext(authorization, { tenantId, companyId: cid });
    return this.service
      .deleteEvaluation(evaluationId, cid, authorization)
      .then((data) =>
        ok(data, 'HRM-PERF-200', 'Performance evaluation deleted'),
      );
  }
}
