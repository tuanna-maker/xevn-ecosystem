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
import {
  CreatePayPositionDto,
  EffectivePositionsQueryDto,
  ListDepartmentPositionsQueryDto,
  ListPayPositionsQueryDto,
  UpdatePayPositionDto,
  UpsertDepartmentPositionDto,
} from './dto/positions.dto';
import { PositionsService } from './positions.service';

@Controller('positions')
export class PositionsController {
  constructor(private readonly service: PositionsService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized positions access',
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
    @Query() query: ListPayPositionsQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scopeContext = resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.service
      .listPositions(query, authorization, scopeContext)
      .then((data) => ok(data, 'HRM-POS-200', 'Positions listed'));
  }

  @Get('effective')
  listEffective(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: EffectivePositionsQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scopeContext = resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.service
      .listEffectivePositions(query, authorization, scopeContext)
      .then((data) => ok(data, 'HRM-POS-200', 'Effective positions listed'));
  }

  @Post()
  create(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreatePayPositionDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scopeContext = resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.service
      .createPosition(body, authorization, scopeContext)
      .then((data) => ok(data, 'HRM-POS-201', 'Position created'));
  }

  @Patch(':positionId')
  update(
    @Param('positionId') positionId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: UpdatePayPositionDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scopeContext = resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.service
      .updatePosition(positionId, body, authorization, scopeContext)
      .then((data) => ok(data, 'HRM-POS-200', 'Position updated'));
  }

  @Get('by-department/:departmentId')
  listByDepartment(
    @Param('departmentId') departmentId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListDepartmentPositionsQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scopeContext = resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.service
      .listDepartmentPositions(
        departmentId,
        query.company_id,
        authorization,
        scopeContext,
      )
      .then((data) => ok(data, 'HRM-POS-200', 'Department positions listed'));
  }

  @Post('by-department/:departmentId')
  upsertDepartmentPosition(
    @Param('departmentId') departmentId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: UpsertDepartmentPositionDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scopeContext = resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.service
      .upsertDepartmentPosition(
        departmentId,
        body,
        authorization,
        scopeContext,
      )
      .then((data) => ok(data, 'HRM-POS-200', 'Department position saved'));
  }

  @Delete('by-department/:departmentId/:positionCode')
  removeDepartmentPosition(
    @Param('departmentId') departmentId: string,
    @Param('positionCode') positionCode: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const scopeContext = resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.service
      .removeDepartmentPosition(
        departmentId,
        positionCode,
        companyId,
        authorization,
        scopeContext,
      )
      .then((data) => ok(data, 'HRM-POS-200', 'Department position removed'));
  }
}
