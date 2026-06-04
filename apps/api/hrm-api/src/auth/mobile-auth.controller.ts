import { Body, Controller, Headers, HttpStatus, Post } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import { MobileLoginDto } from './dto/mobile-login.dto';
import { MobileRefreshDto } from './dto/mobile-refresh.dto';
import { MobileSelectMembershipDto } from './dto/mobile-select-membership.dto';
import { MobileAuthService } from './mobile-auth.service';

@Controller('auth/mobile')
export class MobileAuthController {
  constructor(private readonly mobileAuth: MobileAuthService) {}

  /** Email + password only; server resolves tenant/company from employee record(s). */
  @Post('login')
  login(
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: MobileLoginDto,
  ) {
    const hint =
      tenantId?.trim() && companyId?.trim()
        ? { tenantId: tenantId.trim(), companyId: companyId.trim() }
        : undefined;
    return this.mobileAuth
      .login(body, hint)
      .then((data) => ok(data, 'HRM-AUTH-200', 'Mobile login successful'));
  }

  @Post('select-membership')
  selectMembership(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: MobileSelectMembershipDto,
  ) {
    const payload = getVerifiedInternalJwtPayload(authorization);
    const email = typeof payload?.sub === 'string' ? payload.sub : '';
    if (!email) {
      throw new ApiException('HRM-AUTH-401', 'Cần access token hợp lệ', HttpStatus.UNAUTHORIZED);
    }
    return this.mobileAuth
      .selectMembership(email, body.employee_id)
      .then((data) => ok(data, 'HRM-AUTH-203', 'Membership selected'));
  }

  @Post('refresh')
  refresh(@Body() body: MobileRefreshDto) {
    return this.mobileAuth
      .refresh(body)
      .then((data) => ok(data, 'HRM-AUTH-201', 'Token refreshed'));
  }
}
