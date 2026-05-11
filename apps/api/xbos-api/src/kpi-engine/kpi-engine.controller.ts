import { Body, Controller, Headers, HttpStatus, Post } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { KpiEngineService } from './kpi-engine.service';

@Controller('kpi-engine')
export class KpiEngineController {
  constructor(private readonly service: KpiEngineService) {}

  private assertInternalAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('evaluate')
  evaluate(
    @Body() body: { target: number; actual: number; weight?: number; warningThreshold?: number; criticalThreshold?: number },
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    return ok(this.service.evaluate(body), 'XBOS-KPI-200', 'KPI evaluated');
  }

  @Post('evaluate-batch')
  evaluateBatch(
    @Body() body: { items?: Array<{ target: number; actual: number; weight?: number; warningThreshold?: number; criticalThreshold?: number }> },
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    return ok(this.service.evaluateBatch(body.items ?? []), 'XBOS-KPI-201', 'KPI batch evaluated');
  }
}

