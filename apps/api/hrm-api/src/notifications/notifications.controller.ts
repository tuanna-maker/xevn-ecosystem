import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { ListInboxQueryDto } from './dto/list-inbox.query.dto';
import { MarkInboxReadDto } from './dto/mark-inbox-read.dto';
import { MarkInboxReadQueryDto } from './dto/mark-inbox-read.query.dto';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { HrmInboxService } from './hrm-inbox.service';
import { PushOutboundService } from './push-outbound.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly inbox: HrmInboxService,
    private readonly push: PushOutboundService,
  ) {}

  private assertBusinessAccess(
    authorization?: string,
    internalApiKey?: string,
  ) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized notifications access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get('inbox')
  listInbox(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListInboxQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    const limit = query.limit ?? 40;
    return this.inbox
      .listInbox(
        query.company_id,
        query.employee_id,
        limit,
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-NOTIF-200', 'Inbox listed'));
  }

  @Patch('inbox/:notificationId/read')
  markInboxRead(
    @Param('notificationId') notificationId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query() query: MarkInboxReadQueryDto,
    @Body() body: MarkInboxReadDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.inbox
      .markRead(notificationId, query.company_id, body.viewer_employee_id)
      .then((data) => ok(data, 'HRM-NOTIF-202', 'Marked read'));
  }

  @Post('push-tokens')
  registerPushToken(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: RegisterPushTokenDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.push
      .upsertToken(body.company_id, body.employee_id, body.platform, body.token)
      .then((data) => ok(data, 'HRM-NOTIF-201', 'Push token registered'));
  }
}
