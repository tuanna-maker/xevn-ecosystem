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
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { DecisionsService } from './decisions.service';
import { CreateDecisionDto } from './dto/create-decision.dto';
import {
  GetHrDecisionTypeQueryDto,
  ListEffectiveHrDecisionTypesQueryDto,
  ListHrDecisionTypesQueryDto,
  PatchHrDecisionTypeDto,
  UpsertHrDecisionTypeDto,
} from './dto/hr-decision-type.dto';
import { ListDecisionsQueryDto } from './dto/list-decisions.query.dto';
import { UpdateDecisionDto } from './dto/update-decision.dto';
import { HrDecisionTypeService } from './hr-decision-type.service';

@Controller('decisions')
export class DecisionsController {
  constructor(
    private readonly service: DecisionsService,
    private readonly decisionTypeService: HrDecisionTypeService,
  ) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized decisions access', HttpStatus.UNAUTHORIZED);
    }
  }

  // --- F-DEC-CAT-* (must be registered before :decisionId) ---

  @Get('decision-types/effective')
  listEffectiveDecisionTypes(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListEffectiveHrDecisionTypesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id });
    return this.decisionTypeService
      .listEffective(query, authorization, { tenantId })
      .then((data) => ok(data, 'HRM-DEC-TYP-200', 'Effective decision types listed'));
  }

  @Get('decision-types')
  listDecisionTypes(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListHrDecisionTypesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id });
    return this.decisionTypeService
      .listDecisionTypes(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-DEC-TYP-200', 'Decision types listed'));
  }

  @Post('decision-types')
  createDecisionType(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertHrDecisionTypeDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.decisionTypeService
      .upsertDecisionType(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-DEC-TYP-201', 'Decision type created'));
  }

  @Put('decision-types')
  upsertDecisionType(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertHrDecisionTypeDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.decisionTypeService
      .upsertDecisionType(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-DEC-TYP-200', 'Decision type upserted'));
  }

  @Get('decision-types/:decisionTypeId')
  getDecisionTypeById(
    @Param('decisionTypeId', new ParseUUIDPipe()) decisionTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: GetHrDecisionTypeQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id });
    return this.decisionTypeService
      .getDecisionTypeById(decisionTypeId, query.company_id, authorization, tenantId)
      .then((data) => ok(data, 'HRM-DEC-TYP-200', 'Decision type loaded'));
  }

  @Patch('decision-types/:decisionTypeId')
  patchDecisionType(
    @Param('decisionTypeId', new ParseUUIDPipe()) decisionTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: PatchHrDecisionTypeDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.decisionTypeService
      .patchDecisionType(decisionTypeId, companyId, body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-DEC-TYP-200', 'Decision type updated'));
  }

  @Post('decision-types/:decisionTypeId/retire')
  retireDecisionType(
    @Param('decisionTypeId', new ParseUUIDPipe()) decisionTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.decisionTypeService
      .retireDecisionType(decisionTypeId, companyId, authorization, tenantId)
      .then((data) => ok(data, 'HRM-DEC-TYP-200', 'Decision type retired'));
  }

  // --- F-CORE-DEC-* TXN ---

  @Get()
  list(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListDecisionsQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.service.listDecisions(query, authorization).then((data) => ok(data, 'HRM-DEC-200', 'Decisions listed'));
  }

  @Post()
  create(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateDecisionDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.service.createDecision(body, authorization).then((data) => ok(data, 'HRM-DEC-201', 'Decision created'));
  }

  @Get(':decisionId')
  getById(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('decisionId') decisionId: string,
    @Query('company_id') companyId: string | undefined,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
    return this.service
      .getDecisionById(decisionId, companyId ?? headerCompanyId ?? 'main', authorization)
      .then((data) => ok(data, 'HRM-DEC-200', 'Decision detail'));
  }

  @Patch(':decisionId')
  update(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('decisionId') decisionId: string,
    @Query('company_id') queryCompanyId: string | undefined,
    @Body() body: UpdateDecisionDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    const companyId = body.company_id ?? queryCompanyId ?? headerCompanyId;
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service
      .updateDecision(decisionId, { ...body, company_id: companyId }, authorization)
      .then((data) => ok(data, 'HRM-DEC-200', 'Decision updated'));
  }

  @Post(':decisionId/files')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadFile(
    @Param('decisionId') decisionId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
    if (!file?.buffer?.length) {
      throw new ApiException('HRM-DEC-400', 'Multipart file field "file" is required', HttpStatus.BAD_REQUEST);
    }
    return this.service
      .saveDecisionFile(decisionId, companyId ?? headerCompanyId ?? 'main', authorization, {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      })
      .then((data) => ok(data, 'HRM-DEC-201', 'Decision file stored'));
  }

  @Delete(':decisionId')
  remove(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('decisionId') decisionId: string,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
    return this.service
      .deleteDecision(decisionId, companyId, authorization)
      .then((data) => ok(data, 'HRM-DEC-200', 'Decision deleted'));
  }
}
