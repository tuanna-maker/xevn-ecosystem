import { Controller, Get, Headers, HttpStatus, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { normalizeHomeSummaryCompanyId } from '../common/hrm-list-scope';
import { resolveScopeContext } from '../common/scope-context';
import { GetHomeSummaryQueryDto } from './dto/get-home-summary.query.dto';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized home access', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * MOB-UX-04a/04b Smart Hub aggregate — tasks + manager_pending + optional celebrations/whos_out.
   * include=celebrations,whos_out per MOBILE_W7_TECHSPEC_DELTA.md §3.4 (W7-1).
   */
  @Get('summary')
  getSummary(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetHomeSummaryQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scopeCompanyId = normalizeHomeSummaryCompanyId(
      authorization,
      query.company_id ?? headerCompanyId ?? '',
    );
    resolveScopeContext(authorization, { tenantId, companyId: scopeCompanyId });
    return this.homeService
      .getSummary({ ...query, company_id: scopeCompanyId }, authorization, tenantId)
      .then((data) => ok(data, 'HRM-HOME-200', 'Home summary loaded'));
  }
}
