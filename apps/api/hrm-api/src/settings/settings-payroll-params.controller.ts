/**
 * HTTP `/api/hrm/settings/payroll-params` — tham số mặc định tính lương.
 */
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Put,
  Query,
} from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { SettingsPayrollParamsService } from './settings-payroll-params.service';

@Controller('settings/payroll-params')
export class SettingsPayrollParamsController {
  constructor(private readonly params: SettingsPayrollParamsService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized settings access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get()
  get(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (!companyId?.trim()) {
      throw new ApiException(
        'HRM-PAY-PARAMS-400',
        'company_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.params
      .getPayrollParamsDocument(companyId, authorization)
      .then((data) => ok(data, 'HRM-PAY-PARAMS-200', 'Payroll system params'));
  }

  @Put()
  put(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const companyId = String(body.company_id ?? body.companyId ?? '').trim();
    if (!companyId) {
      throw new ApiException(
        'HRM-PAY-PARAMS-400',
        'company_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    resolveScopeContext(authorization, { tenantId, companyId });
    const { company_id: _a, companyId: _b, ...rest } = body;
    return this.params
      .upsertPayrollParams(companyId, rest, authorization)
      .then((data) =>
        ok(data, 'HRM-PAY-PARAMS-200', 'Payroll system params saved'),
      );
  }
}
