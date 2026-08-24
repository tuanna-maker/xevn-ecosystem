import {
  Body,
  Controller,
  Delete,
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
import { InternalNewsService } from './internal-news.service';
import { CreateInternalNewsDto } from './dto/create-news.dto';
import { ListInternalNewsQueryDto } from './dto/list-news.query.dto';
import { UpdateInternalNewsDto } from './dto/update-news.dto';

@Controller('internal-news')
export class InternalNewsController {
  constructor(private readonly service: InternalNewsService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized internal news access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get()
  list(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListInternalNewsQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.service
      .listNews(query, authorization)
      .then((data) => ok(data, 'HRM-NEWS-200', 'News listed'));
  }

  @Post()
  create(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateInternalNewsDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.service
      .createNews(body, authorization)
      .then((data) => ok(data, 'HRM-NEWS-201', 'News created'));
  }

  @Get(':id')
  getById(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('id') id: string,
    @Query('company_id') companyId: string | undefined,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.service
      .getNewsById(id, companyId ?? headerCompanyId ?? 'main', authorization)
      .then((data) => ok(data, 'HRM-NEWS-200', 'News detail'));
  }

  @Patch(':id')
  update(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('id') id: string,
    @Query('company_id') queryCompanyId: string | undefined,
    @Body() body: UpdateInternalNewsDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const companyId = body.company_id ?? queryCompanyId ?? headerCompanyId;
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service
      .updateNews(id, { ...body, company_id: companyId }, authorization)
      .then((data) => ok(data, 'HRM-NEWS-200', 'News updated'));
  }

  @Delete(':id')
  remove(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('id') id: string,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.service
      .deleteNews(id, companyId, authorization)
      .then((data) => ok(data, 'HRM-NEWS-200', 'News deleted'));
  }

  @Post(':id/view')
  incrementView(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('id') id: string,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.service
      .incrementViewCount(id, companyId)
      .then((data) => ok(data, 'HRM-NEWS-200', 'View count incremented'));
  }
}
