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
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { CatalogExtensionsService } from './catalog-extensions.service';

@Controller()
export class CatalogExtensionsController {
  constructor(private readonly service: CatalogExtensionsService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized catalog access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get('sales-data')
  listSalesData(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Query('period_month') periodMonth?: string,
    @Query('period_year') periodYear?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { companyId });
    return this.service
      .listSalesData(
        companyId,
        periodMonth ? Number(periodMonth) : undefined,
        periodYear ? Number(periodYear) : undefined,
        authorization,
      )
      .then((data) => ok(data, 'HRM-SALES-200', 'Sales data listed'));
  }

  @Post('sales-data')
  createSalesData(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .createSalesData(body, authorization)
      .then((data) => ok(data, 'HRM-SALES-201', 'Sales record created'));
  }

  @Patch('sales-data/:id')
  updateSalesData(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .updateSalesData(id, companyId, body, authorization)
      .then((data) => ok(data, 'HRM-SALES-200', 'Sales record updated'));
  }

  @Delete('sales-data/:id')
  deleteSalesData(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .deleteSalesData(id, companyId, authorization)
      .then((data) => ok(data, 'HRM-SALES-200', 'Sales record deleted'));
  }

  @Post('sales-data/sync')
  syncSalesData(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .syncSalesData(companyId, authorization)
      .then((data) => ok(data, 'HRM-SALES-202', 'Sales data synced'));
  }

  @Get('bonus-policies')
  listBonusPolicies(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .listBonusPolicies(companyId, authorization)
      .then((data) => ok(data, 'HRM-BONUS-200', 'Bonus policies listed'));
  }

  @Post('bonus-policies')
  createBonusPolicy(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .createBonusPolicy(body, authorization)
      .then((data) => ok(data, 'HRM-BONUS-201', 'Bonus policy created'));
  }

  @Patch('bonus-policies/:id')
  updateBonusPolicy(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .updateBonusPolicy(id, companyId, body, authorization)
      .then((data) => ok(data, 'HRM-BONUS-200', 'Bonus policy updated'));
  }

  @Delete('bonus-policies/:id')
  deleteBonusPolicy(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .deleteBonusPolicy(id, companyId, authorization)
      .then((data) => ok(data, 'HRM-BONUS-200', 'Bonus policy deleted'));
  }

  @Get('bonus-policies/:policyId/participants')
  listBonusParticipants(
    @Param('policyId', new ParseUUIDPipe()) policyId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .listBonusPolicyParticipants(policyId, companyId, authorization)
      .then((data) => ok(data, 'HRM-BONUS-200', 'Bonus participants listed'));
  }

  @Post('bonus-policies/participants')
  createBonusParticipant(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .createBonusPolicyParticipant(body, authorization)
      .then((data) => ok(data, 'HRM-BONUS-201', 'Bonus participant created'));
  }

  @Get('insurance-policy-participants')
  listInsuranceParticipants(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .listInsurancePolicyParticipants(companyId, authorization)
      .then((data) =>
        ok(data, 'HRM-INS-P-200', 'Insurance participants listed'),
      );
  }

  @Post('insurance-policy-participants')
  createInsuranceParticipant(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .createInsurancePolicyParticipant(body, authorization)
      .then((data) =>
        ok(data, 'HRM-INS-P-201', 'Insurance participant created'),
      );
  }

  @Patch('insurance-policy-participants/:id')
  updateInsuranceParticipant(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .updateInsurancePolicyParticipant(id, companyId, body, authorization)
      .then((data) =>
        ok(data, 'HRM-INS-P-200', 'Insurance participant updated'),
      );
  }

  @Delete('insurance-policy-participants/:id')
  deleteInsuranceParticipant(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .deleteInsurancePolicyParticipant(id, companyId, authorization)
      .then((data) =>
        ok(data, 'HRM-INS-P-200', 'Insurance participant deleted'),
      );
  }

  @Get('tax-policy-participants')
  listTaxParticipants(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .listTaxPolicyParticipants(companyId, authorization)
      .then((data) => ok(data, 'HRM-TAX-200', 'Tax participants listed'));
  }

  @Post('tax-policy-participants')
  createTaxParticipant(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .createTaxPolicyParticipant(body, authorization)
      .then((data) => ok(data, 'HRM-TAX-201', 'Tax participant created'));
  }

  @Patch('tax-policy-participants/:id')
  updateTaxParticipant(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .updateTaxPolicyParticipant(id, companyId, body, authorization)
      .then((data) => ok(data, 'HRM-TAX-200', 'Tax participant updated'));
  }

  @Delete('tax-policy-participants/:id')
  deleteTaxParticipant(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .deleteTaxPolicyParticipant(id, companyId, authorization)
      .then((data) => ok(data, 'HRM-TAX-200', 'Tax participant deleted'));
  }

  @Get('face-data')
  listFaceData(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .listFaceData(companyId, authorization)
      .then((data) => ok(data, 'HRM-FACE-200', 'Face data listed'));
  }

  @Post('face-data')
  upsertFaceData(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .upsertFaceData(body, authorization)
      .then((data) => ok(data, 'HRM-FACE-201', 'Face data saved'));
  }

  @Delete('face-data/:employeeId')
  deleteFaceData(
    @Param('employeeId', new ParseUUIDPipe()) employeeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .deleteFaceData(employeeId, companyId, authorization)
      .then((data) => ok(data, 'HRM-FACE-200', 'Face data deleted'));
  }

  @Get('company-subscription')
  getSubscription(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .getCompanySubscription(companyId, authorization)
      .then((data) => ok(data, 'HRM-SUB-200', 'Subscription loaded'));
  }

  @Post('company-subscription/upgrade')
  upgradeSubscription(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .upgradeCompanySubscription(companyId, body, authorization)
      .then((data) => ok(data, 'HRM-SUB-201', 'Subscription upgraded'));
  }

  @Get('guide-content')
  listGuideContent(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId?: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .listGuideContent(companyId)
      .then((data) => ok(data, 'HRM-GUIDE-200', 'Guide content listed'));
  }

  @Post('guide-content')
  upsertGuideContent(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .upsertGuideContent(body, authorization)
      .then((data) => ok(data, 'HRM-GUIDE-201', 'Guide content saved'));
  }

  @Delete('guide-content')
  deleteGuideContent(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body()
    body: {
      section_id: string;
      step_index: number | null;
      company_id?: string;
    },
  ) {
    this.assertAccess(authorization, internalApiKey);
    return this.service
      .deleteGuideContent(body)
      .then((data) => ok(data, 'HRM-GUIDE-200', 'Guide content deleted'));
  }

  @Get('files/:companyId/:filename')
  async getUploadedFile(
    @Param('companyId') companyId: string,
    @Param('filename') filename: string,
    @Headers('authorization') authorization: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.service.readUploadedFile(
      companyId,
      filename,
      authorization,
    );
    res.set('Cache-Control', 'public, max-age=3600');
    return new StreamableFile(file.buffer, {
      type: file.mimetype,
      disposition: `inline; filename="${file.filename}"`,
    });
  }

  @Post('files/upload')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Query('feature') feature: string,
    @Query('company_id') companyId: string | undefined,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (!companyId?.trim()) {
      throw new ApiException(
        'HRM-FILE-400',
        'Query parameter company_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    resolveScopeContext(authorization, { companyId: companyId.trim() });
    if (!file?.buffer?.length) {
      throw new ApiException(
        'HRM-FILE-400',
        'Multipart file field "file" is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.service
      .storeUploadedFile(companyId.trim(), authorization, feature || 'upload', {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      })
      .then((data) => ok(data, 'HRM-FILE-201', 'File stored'));
  }
}
