import { HttpStatus, Injectable } from '@nestjs/common';
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { ApiException } from '../common/api.exception';
import { XbosDbService } from '../db/xbos-db.service';
import { OrgFoundationService } from '../org-foundation/org-foundation.service';

const ALLOWED_EXT = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx']);
const MAX_BYTES = Number(process.env.XBOS_LEGAL_DOC_MAX_BYTES ?? 25 * 1024 * 1024);

function storageRoot(): string {
  return (
    process.env.XBOS_LEGAL_DOC_STORAGE_ROOT?.trim() ||
    join(process.cwd(), 'storage', 'legal-documents')
  );
}

function publicBaseUrl(): string {
  return (process.env.XBOS_PUBLIC_BASE_URL?.trim() || 'http://127.0.0.1:28002').replace(/\/$/, '');
}

function mimeForExt(ext: string): string {
  const map: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return map[ext.toLowerCase()] ?? 'application/octet-stream';
}

export type ShareholderInput = {
  holderName: string;
  identityCode?: string;
  ratioPercent?: number;
  contributedValue?: number;
};

export type DocumentInput = {
  documentCode?: string;
  documentName: string;
  issuedDate?: string;
  expiredDate?: string;
};

@Injectable()
export class LegalEntityProfileService {
  constructor(
    private readonly db: XbosDbService,
    private readonly org: OrgFoundationService,
  ) {}

  private async resolveEntityPartition(
    entityId: string,
  ): Promise<{ tenantId: string; companyId: string }> {
    const partition = await this.org.resolveLegalEntityPartition(entityId);
    if (!partition) {
      throw new ApiException('XBOS-DOC-404', 'Legal entity not found', HttpStatus.NOT_FOUND);
    }
    return partition;
  }

  async listShareholders(_tenantId: string, _companyId: string, entityId: string) {
    const { tenantId } = await this.resolveEntityPartition(entityId);
    const { rows } = await this.db.query(
      `SELECT * FROM public.xbos_legal_entity_shareholder
       WHERE legal_entity_id = $1::uuid AND tenant_id = $2 AND status = 'active'
       ORDER BY created_at`,
      [entityId, tenantId],
    );
    return rows;
  }

  async createShareholder(
    _tenantId: string,
    _companyId: string,
    entityId: string,
    body: ShareholderInput,
  ) {
    const { tenantId, companyId } = await this.resolveEntityPartition(entityId);
    const name = body.holderName?.trim();
    if (!name) {
      throw new ApiException('XBOS-SHR-400', 'holderName is required', HttpStatus.BAD_REQUEST);
    }
    const ratio = Number(body.ratioPercent ?? 0);
    if (ratio < 0 || ratio > 100) {
      throw new ApiException('XBOS-SHR-400', 'ratioPercent must be 0-100', HttpStatus.BAD_REQUEST);
    }
    const { rows } = await this.db.query(
      `INSERT INTO public.xbos_legal_entity_shareholder (
        tenant_id, company_id, legal_entity_id, holder_name, identity_code, ratio_percent, contributed_value
      ) VALUES ($1,$2,$3::uuid,$4,$5,$6,$7) RETURNING *`,
      [
        tenantId,
        companyId,
        entityId,
        name,
        body.identityCode?.trim() || null,
        ratio,
        Number(body.contributedValue ?? 0),
      ],
    );
    return rows[0];
  }

  async updateShareholder(
    _tenantId: string,
    _companyId: string,
    entityId: string,
    shareholderId: string,
    body: ShareholderInput,
  ) {
    const { tenantId } = await this.resolveEntityPartition(entityId);
    const { rows } = await this.db.query(
      `UPDATE public.xbos_legal_entity_shareholder SET
        holder_name = COALESCE($4, holder_name),
        identity_code = COALESCE($5, identity_code),
        ratio_percent = COALESCE($6, ratio_percent),
        contributed_value = COALESCE($7, contributed_value),
        updated_at = NOW()
       WHERE id = $1::uuid AND legal_entity_id = $2::uuid AND tenant_id = $3 AND status = 'active'
       RETURNING *`,
      [
        shareholderId,
        entityId,
        tenantId,
        body.holderName?.trim() || null,
        body.identityCode?.trim() ?? null,
        body.ratioPercent ?? null,
        body.contributedValue ?? null,
      ],
    );
    if (!rows[0]) {
      throw new ApiException('XBOS-SHR-404', 'Shareholder not found', HttpStatus.NOT_FOUND);
    }
    return rows[0];
  }

  async deleteShareholder(_tenantId: string, _companyId: string, entityId: string, shareholderId: string) {
    const { tenantId } = await this.resolveEntityPartition(entityId);
    const { rows } = await this.db.query(
      `UPDATE public.xbos_legal_entity_shareholder SET status = 'deleted', updated_at = NOW()
       WHERE id = $1::uuid AND legal_entity_id = $2::uuid AND tenant_id = $3 RETURNING id`,
      [shareholderId, entityId, tenantId],
    );
    if (!rows[0]) {
      throw new ApiException('XBOS-SHR-404', 'Shareholder not found', HttpStatus.NOT_FOUND);
    }
    return { deleted: true };
  }

  async listDocuments(_tenantId: string, _companyId: string, entityId: string) {
    const { tenantId } = await this.resolveEntityPartition(entityId);
    const { rows } = await this.db.query(
      `SELECT * FROM public.xbos_legal_entity_document
       WHERE legal_entity_id = $1::uuid AND tenant_id = $2 AND status = 'active'
       ORDER BY created_at DESC`,
      [entityId, tenantId],
    );
    return rows;
  }

  async createDocument(_tenantId: string, _companyId: string, entityId: string, body: DocumentInput) {
    const { tenantId, companyId } = await this.resolveEntityPartition(entityId);
    const name = body.documentName?.trim();
    if (!name) {
      throw new ApiException('XBOS-DOC-400', 'documentName is required', HttpStatus.BAD_REQUEST);
    }
    const { rows } = await this.db.query(
      `INSERT INTO public.xbos_legal_entity_document (
        tenant_id, company_id, legal_entity_id, document_code, document_name, issued_date, expired_date
      ) VALUES ($1,$2,$3::uuid,$4,$5,$6::date,$7::date) RETURNING *`,
      [
        tenantId,
        companyId,
        entityId,
        body.documentCode?.trim() || null,
        name,
        body.issuedDate || null,
        body.expiredDate || null,
      ],
    );
    return rows[0];
  }

  async updateDocument(
    _tenantId: string,
    _companyId: string,
    entityId: string,
    documentId: string,
    body: DocumentInput,
  ) {
    const { tenantId } = await this.resolveEntityPartition(entityId);
    const { rows } = await this.db.query(
      `UPDATE public.xbos_legal_entity_document SET
        document_code = COALESCE($4, document_code),
        document_name = COALESCE($5, document_name),
        issued_date = COALESCE($6::date, issued_date),
        expired_date = COALESCE($7::date, expired_date),
        updated_at = NOW()
       WHERE id = $1::uuid AND legal_entity_id = $2::uuid AND tenant_id = $3 AND status = 'active'
       RETURNING *`,
      [
        documentId,
        entityId,
        tenantId,
        body.documentCode?.trim() ?? null,
        body.documentName?.trim() ?? null,
        body.issuedDate ?? null,
        body.expiredDate ?? null,
      ],
    );
    if (!rows[0]) {
      throw new ApiException('XBOS-DOC-404', 'Document not found', HttpStatus.NOT_FOUND);
    }
    return rows[0];
  }

  async deleteDocument(_tenantId: string, _companyId: string, entityId: string, documentId: string) {
    const { tenantId } = await this.resolveEntityPartition(entityId);
    const { rows } = await this.db.query(
      `UPDATE public.xbos_legal_entity_document SET status = 'deleted', updated_at = NOW()
       WHERE id = $1::uuid AND legal_entity_id = $2::uuid AND tenant_id = $3 RETURNING id`,
      [documentId, entityId, tenantId],
    );
    if (!rows[0]) {
      throw new ApiException('XBOS-DOC-404', 'Document not found', HttpStatus.NOT_FOUND);
    }
    return { deleted: true };
  }

  async uploadDocumentFile(
    _tenantId: string,
    _companyId: string,
    entityId: string,
    documentId: string,
    file: { buffer: Buffer; size: number; originalname?: string },
  ) {
    const { tenantId } = await this.resolveEntityPartition(entityId);
    if (!file?.buffer?.length) {
      throw new ApiException('XBOS-DOC-400', 'file is required', HttpStatus.BAD_REQUEST);
    }
    if (file.size > MAX_BYTES) {
      throw new ApiException('XBOS-DOC-413', 'File too large', HttpStatus.PAYLOAD_TOO_LARGE);
    }
    const ext = extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      throw new ApiException('XBOS-DOC-415', 'Unsupported file type', HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }

    const { rows: docRows } = await this.db.query(
      `SELECT * FROM public.xbos_legal_entity_document
       WHERE id = $1::uuid AND legal_entity_id = $2::uuid AND tenant_id = $3 AND status = 'active'`,
      [documentId, entityId, tenantId],
    );
    if (!docRows[0]) {
      throw new ApiException('XBOS-DOC-404', 'Document not found', HttpStatus.NOT_FOUND);
    }

    const relDir = join(tenantId, entityId);
    const absPath = join(storageRoot(), relDir, `${documentId}${ext}`);
    mkdirSync(dirname(absPath), { recursive: true });
    writeFileSync(absPath, file.buffer);

    const fileUrl = `${publicBaseUrl()}/api/xbos/org-foundation/legal-documents/${documentId}/file`;
    const { rows } = await this.db.query(
      `UPDATE public.xbos_legal_entity_document SET
        storage_path = $2, file_url = $3, mime_type = $4, file_size = $5, updated_at = NOW()
       WHERE id = $1::uuid RETURNING *`,
      [documentId, absPath, fileUrl, mimeForExt(ext), file.size],
    );
    return rows[0];
  }

  async streamDocumentFile(documentId: string) {
    const { rows } = await this.db.query(
      `SELECT storage_path, mime_type, document_name, file_url FROM public.xbos_legal_entity_document
       WHERE id = $1::uuid AND status = 'active'`,
      [documentId],
    );
    const row = rows[0] as { storage_path?: string; mime_type?: string; document_name?: string } | undefined;
    if (!row?.storage_path || !existsSync(row.storage_path)) {
      throw new ApiException('XBOS-DOC-404', 'File not found', HttpStatus.NOT_FOUND);
    }
    return {
      stream: createReadStream(row.storage_path),
      mimeType: row.mime_type || 'application/octet-stream',
      fileName: row.document_name || 'document',
    };
  }
}
