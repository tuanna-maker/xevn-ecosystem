/**
 * @CODE-MEMORY
 * Screen:     HTTP `/api/hrm/settings/company-settings` — F-SET-TAX-01
 * UC:         UC-SET-DEF-01 · AC-AMIS-SET-TAX-01
 * WorkItem:   PO-HRM-SETTINGS-DEFAULTS-BE-01
 * Purpose:    Settings tax KV mount — same physical hrm_company_settings as CTR CFG.
 * Coded:      2026-08-07
 * must_keep:  pay_tax_* only · U65 zero-seed · payroll_e2e_ready=false
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
import { HRM_SET_TAX_200 } from './settings-defaults.constants';
import { SettingsTaxParamsService } from './settings-tax-params.service';
import {
  GetSettingsCompanySettingsQueryDto,
  PutSettingsCompanySettingDto,
} from './dto/settings-defaults.dto';

@Controller('settings/company-settings')
export class SettingsCompanySettingsController {
  constructor(private readonly tax: SettingsTaxParamsService) {}

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
    @Query() query: GetSettingsCompanySettingsQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.tax
      .get(query, authorization, tenantId)
      .then((data) => ok(data, HRM_SET_TAX_200, 'Company tax settings'));
  }

  @Put()
  put(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: PutSettingsCompanySettingDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.tax
      .put(body, authorization, tenantId)
      .then((data) => ok(data, HRM_SET_TAX_200, 'Company tax setting saved'));
  }
}
