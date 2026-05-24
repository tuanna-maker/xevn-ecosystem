import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { LegalEntityProfileService } from './legal-entity-profile.service';

type UploadedFilePayload = {
  buffer: Buffer;
  size: number;
  originalname?: string;
};

@Controller('org-foundation')
export class LegalEntityProfileController {
  constructor(private readonly service: LegalEntityProfileService) {}

  private assertInternal(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  private scope(headers: { tenantId?: string; companyId?: string; authorization?: string }) {
    return resolveScopeContext(headers.authorization, {
      tenantId: headers.tenantId,
      companyId: headers.companyId,
    });
  }

  @Get('legal-entities/:entityId/shareholders')
  async listShareholders(
    @Param('entityId') entityId: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.scope({ tenantId, companyId, authorization });
    const items = await this.service.listShareholders(scope.tenantId, scope.companyId, entityId);
    return ok({ items }, 'XBOS-SHR-200', 'Shareholders loaded');
  }

  @Post('legal-entities/:entityId/shareholders')
  async createShareholder(
    @Param('entityId') entityId: string,
    @Body() body: Record<string, unknown>,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.scope({ tenantId, companyId, authorization });
    return ok(
      await this.service.createShareholder(scope.tenantId, scope.companyId, entityId, body as never),
      'XBOS-SHR-201',
      'Shareholder saved',
    );
  }

  @Put('legal-entities/:entityId/shareholders/:shareholderId')
  async updateShareholder(
    @Param('entityId') entityId: string,
    @Param('shareholderId') shareholderId: string,
    @Body() body: Record<string, unknown>,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.scope({ tenantId, companyId, authorization });
    return ok(
      await this.service.updateShareholder(scope.tenantId, scope.companyId, entityId, shareholderId, body as never),
      'XBOS-SHR-201',
      'Shareholder saved',
    );
  }

  @Delete('legal-entities/:entityId/shareholders/:shareholderId')
  async deleteShareholder(
    @Param('entityId') entityId: string,
    @Param('shareholderId') shareholderId: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.scope({ tenantId, companyId, authorization });
    return ok(
      await this.service.deleteShareholder(scope.tenantId, scope.companyId, entityId, shareholderId),
      'XBOS-SHR-204',
      'Shareholder deleted',
    );
  }

  @Get('legal-entities/:entityId/documents')
  async listDocuments(
    @Param('entityId') entityId: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.scope({ tenantId, companyId, authorization });
    const items = await this.service.listDocuments(scope.tenantId, scope.companyId, entityId);
    return ok({ items }, 'XBOS-DOC-200', 'Documents loaded');
  }

  @Post('legal-entities/:entityId/documents')
  async createDocument(
    @Param('entityId') entityId: string,
    @Body() body: Record<string, unknown>,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.scope({ tenantId, companyId, authorization });
    return ok(
      await this.service.createDocument(scope.tenantId, scope.companyId, entityId, body as never),
      'XBOS-DOC-201',
      'Document saved',
    );
  }

  @Put('legal-entities/:entityId/documents/:documentId')
  async updateDocument(
    @Param('entityId') entityId: string,
    @Param('documentId') documentId: string,
    @Body() body: Record<string, unknown>,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.scope({ tenantId, companyId, authorization });
    return ok(
      await this.service.updateDocument(scope.tenantId, scope.companyId, entityId, documentId, body as never),
      'XBOS-DOC-201',
      'Document saved',
    );
  }

  @Delete('legal-entities/:entityId/documents/:documentId')
  async deleteDocument(
    @Param('entityId') entityId: string,
    @Param('documentId') documentId: string,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.scope({ tenantId, companyId, authorization });
    return ok(
      await this.service.deleteDocument(scope.tenantId, scope.companyId, entityId, documentId),
      'XBOS-DOC-204',
      'Document deleted',
    );
  }

  @Post('legal-entities/:entityId/documents/:documentId/upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 26 * 1024 * 1024 } }))
  async uploadDocument(
    @Param('entityId') entityId: string,
    @Param('documentId') documentId: string,
    @UploadedFile() file: UploadedFilePayload,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('x-company-id') companyId?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.scope({ tenantId, companyId, authorization });
    return ok(
      await this.service.uploadDocumentFile(scope.tenantId, scope.companyId, entityId, documentId, file),
      'XBOS-DOC-201',
      'File uploaded',
    );
  }

  @Get('legal-documents/:documentId/file')
  async streamFile(
    @Param('documentId') documentId: string,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Res() res: Response,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const scope = this.scope({ tenantId, companyId, authorization });
    const { stream, mimeType, fileName } = await this.service.streamDocumentFile(
      scope.tenantId,
      scope.companyId,
      documentId,
    );
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);
    stream.pipe(res);
  }
}
