import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ok } from '../common/api-response';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import { ApiException } from '../common/api.exception';
import { HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PortalLoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() body: PortalLoginDto) {
    const data = await this.auth.login(body.email, body.password);
    return ok(data, 'XBOS-AUTH-200', 'Đăng nhập thành công');
  }

  @Get('me')
  async me(@Headers('authorization') authorization?: string) {
    const payload = getVerifiedInternalJwtPayload(authorization);
    const userId = typeof payload?.sub === 'string' ? payload.sub : typeof payload?.email === 'string' ? payload.email : null;
    if (!userId) {
      throw new ApiException('XBOS-AUTH-401', 'Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const data = await this.auth.me(userId);
    return ok(data, 'XBOS-AUTH-200', 'Session loaded');
  }
}
