"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegalEntityProfileService = void 0;
exports.storageRoot = storageRoot;
exports.relativeStorageKey = relativeStorageKey;
exports.resolveStoredFilePath = resolveStoredFilePath;
const common_1 = require("@nestjs/common");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const api_exception_1 = require("../common/api.exception");
const xbos_db_service_1 = require("../db/xbos-db.service");
const org_foundation_service_1 = require("../org-foundation/org-foundation.service");
const ALLOWED_EXT = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx']);
const MAX_BYTES = Number(process.env.XBOS_LEGAL_DOC_MAX_BYTES ?? 25 * 1024 * 1024);
/** Stable package root — avoids process.cwd() drift (monorepo root vs apps/api/xbos-api vs Docker /app). */
function storageRoot() {
    const fromEnv = process.env.XBOS_LEGAL_DOC_STORAGE_ROOT?.trim();
    if (fromEnv)
        return fromEnv;
    return (0, node_path_1.join)(__dirname, '..', '..', 'storage', 'legal-documents');
}
function relativeStorageKey(tenantId, entityId, documentId, ext) {
    return node_path_1.posix.join(tenantId, entityId, `${documentId}${ext}`);
}
/** Resolve DB storage_path (relative key or legacy absolute) to an on-disk file. */
function resolveStoredFilePath(storagePath) {
    const raw = storagePath?.trim();
    if (!raw)
        return null;
    const looksAbsolute = raw.startsWith('/') || raw.startsWith('\\\\') || /^[a-zA-Z]:[/\\]/.test(raw);
    if (looksAbsolute) {
        if ((0, node_fs_1.existsSync)(raw))
            return raw;
        const legacyTail = raw.split(/[/\\]legal-documents[/\\]/);
        if (legacyTail.length === 2 && legacyTail[1]) {
            const candidate = (0, node_path_1.join)(storageRoot(), legacyTail[1]);
            if ((0, node_fs_1.existsSync)(candidate))
                return candidate;
        }
        return null;
    }
    const candidate = (0, node_path_1.join)(storageRoot(), raw);
    return (0, node_fs_1.existsSync)(candidate) ? candidate : null;
}
function publicBaseUrl() {
    return (process.env.XBOS_PUBLIC_BASE_URL?.trim() || 'http://127.0.0.1:28002').replace(/\/$/, '');
}
function mimeForExt(ext) {
    const map = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    return map[ext.toLowerCase()] ?? 'application/octet-stream';
}
let LegalEntityProfileService = class LegalEntityProfileService {
    db;
    org;
    constructor(db, org) {
        this.db = db;
        this.org = org;
    }
    async resolveEntityPartition(entityId) {
        const partition = await this.org.resolveLegalEntityPartition(entityId);
        if (!partition) {
            throw new api_exception_1.ApiException('XBOS-DOC-404', 'Legal entity not found', common_1.HttpStatus.NOT_FOUND);
        }
        return partition;
    }
    async listShareholders(_tenantId, _companyId, entityId) {
        const { tenantId } = await this.resolveEntityPartition(entityId);
        const { rows } = await this.db.query(`SELECT * FROM public.xbos_legal_entity_shareholder
       WHERE legal_entity_id = $1::uuid AND tenant_id = $2 AND status = 'active'
       ORDER BY created_at`, [entityId, tenantId]);
        return rows;
    }
    async createShareholder(_tenantId, _companyId, entityId, body) {
        const { tenantId, companyId } = await this.resolveEntityPartition(entityId);
        const name = body.holderName?.trim();
        if (!name) {
            throw new api_exception_1.ApiException('XBOS-SHR-400', 'holderName is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const ratio = Number(body.ratioPercent ?? 0);
        if (ratio < 0 || ratio > 100) {
            throw new api_exception_1.ApiException('XBOS-SHR-400', 'ratioPercent must be 0-100', common_1.HttpStatus.BAD_REQUEST);
        }
        const { rows } = await this.db.query(`INSERT INTO public.xbos_legal_entity_shareholder (
        tenant_id, company_id, legal_entity_id, holder_name, identity_code, ratio_percent, contributed_value
      ) VALUES ($1,$2,$3::uuid,$4,$5,$6,$7) RETURNING *`, [
            tenantId,
            companyId,
            entityId,
            name,
            body.identityCode?.trim() || null,
            ratio,
            Number(body.contributedValue ?? 0),
        ]);
        return rows[0];
    }
    async updateShareholder(_tenantId, _companyId, entityId, shareholderId, body) {
        const { tenantId } = await this.resolveEntityPartition(entityId);
        const { rows } = await this.db.query(`UPDATE public.xbos_legal_entity_shareholder SET
        holder_name = COALESCE($4, holder_name),
        identity_code = COALESCE($5, identity_code),
        ratio_percent = COALESCE($6, ratio_percent),
        contributed_value = COALESCE($7, contributed_value),
        updated_at = NOW()
       WHERE id = $1::uuid AND legal_entity_id = $2::uuid AND tenant_id = $3 AND status = 'active'
       RETURNING *`, [
            shareholderId,
            entityId,
            tenantId,
            body.holderName?.trim() || null,
            body.identityCode?.trim() ?? null,
            body.ratioPercent ?? null,
            body.contributedValue ?? null,
        ]);
        if (!rows[0]) {
            throw new api_exception_1.ApiException('XBOS-SHR-404', 'Shareholder not found', common_1.HttpStatus.NOT_FOUND);
        }
        return rows[0];
    }
    async deleteShareholder(_tenantId, _companyId, entityId, shareholderId) {
        const { tenantId } = await this.resolveEntityPartition(entityId);
        const { rows } = await this.db.query(`UPDATE public.xbos_legal_entity_shareholder SET status = 'deleted', updated_at = NOW()
       WHERE id = $1::uuid AND legal_entity_id = $2::uuid AND tenant_id = $3 RETURNING id`, [shareholderId, entityId, tenantId]);
        if (!rows[0]) {
            throw new api_exception_1.ApiException('XBOS-SHR-404', 'Shareholder not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { deleted: true };
    }
    async listDocuments(_tenantId, _companyId, entityId) {
        const { tenantId } = await this.resolveEntityPartition(entityId);
        const { rows } = await this.db.query(`SELECT * FROM public.xbos_legal_entity_document
       WHERE legal_entity_id = $1::uuid AND tenant_id = $2 AND status = 'active'
       ORDER BY created_at DESC`, [entityId, tenantId]);
        return rows;
    }
    async createDocument(_tenantId, _companyId, entityId, body) {
        const { tenantId, companyId } = await this.resolveEntityPartition(entityId);
        const name = body.documentName?.trim();
        if (!name) {
            throw new api_exception_1.ApiException('XBOS-DOC-400', 'documentName is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const { rows } = await this.db.query(`INSERT INTO public.xbos_legal_entity_document (
        tenant_id, company_id, legal_entity_id, document_code, document_name, issued_date, expired_date
      ) VALUES ($1,$2,$3::uuid,$4,$5,$6::date,$7::date) RETURNING *`, [
            tenantId,
            companyId,
            entityId,
            body.documentCode?.trim() || null,
            name,
            body.issuedDate || null,
            body.expiredDate || null,
        ]);
        return rows[0];
    }
    async updateDocument(_tenantId, _companyId, entityId, documentId, body) {
        const { tenantId } = await this.resolveEntityPartition(entityId);
        const { rows } = await this.db.query(`UPDATE public.xbos_legal_entity_document SET
        document_code = COALESCE($4, document_code),
        document_name = COALESCE($5, document_name),
        issued_date = COALESCE($6::date, issued_date),
        expired_date = COALESCE($7::date, expired_date),
        updated_at = NOW()
       WHERE id = $1::uuid AND legal_entity_id = $2::uuid AND tenant_id = $3 AND status = 'active'
       RETURNING *`, [
            documentId,
            entityId,
            tenantId,
            body.documentCode?.trim() ?? null,
            body.documentName?.trim() ?? null,
            body.issuedDate ?? null,
            body.expiredDate ?? null,
        ]);
        if (!rows[0]) {
            throw new api_exception_1.ApiException('XBOS-DOC-404', 'Document not found', common_1.HttpStatus.NOT_FOUND);
        }
        return rows[0];
    }
    async deleteDocument(_tenantId, _companyId, entityId, documentId) {
        const { tenantId } = await this.resolveEntityPartition(entityId);
        const { rows } = await this.db.query(`UPDATE public.xbos_legal_entity_document SET status = 'deleted', updated_at = NOW()
       WHERE id = $1::uuid AND legal_entity_id = $2::uuid AND tenant_id = $3 RETURNING id`, [documentId, entityId, tenantId]);
        if (!rows[0]) {
            throw new api_exception_1.ApiException('XBOS-DOC-404', 'Document not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { deleted: true };
    }
    async uploadDocumentFile(_tenantId, _companyId, entityId, documentId, file) {
        const { tenantId } = await this.resolveEntityPartition(entityId);
        if (!file?.buffer?.length) {
            throw new api_exception_1.ApiException('XBOS-DOC-400', 'file is required', common_1.HttpStatus.BAD_REQUEST);
        }
        if (file.size > MAX_BYTES) {
            throw new api_exception_1.ApiException('XBOS-DOC-413', 'File too large', common_1.HttpStatus.PAYLOAD_TOO_LARGE);
        }
        const ext = (0, node_path_1.extname)(file.originalname || '').toLowerCase();
        if (!ALLOWED_EXT.has(ext)) {
            throw new api_exception_1.ApiException('XBOS-DOC-415', 'Unsupported file type', common_1.HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        }
        const { rows: docRows } = await this.db.query(`SELECT * FROM public.xbos_legal_entity_document
       WHERE id = $1::uuid AND legal_entity_id = $2::uuid AND tenant_id = $3 AND status = 'active'`, [documentId, entityId, tenantId]);
        if (!docRows[0]) {
            throw new api_exception_1.ApiException('XBOS-DOC-404', 'Document not found', common_1.HttpStatus.NOT_FOUND);
        }
        const storageKey = relativeStorageKey(tenantId, entityId, documentId, ext);
        const absPath = (0, node_path_1.join)(storageRoot(), tenantId, entityId, `${documentId}${ext}`);
        (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(absPath), { recursive: true });
        (0, node_fs_1.writeFileSync)(absPath, file.buffer);
        const fileUrl = `${publicBaseUrl()}/api/xbos/org-foundation/legal-documents/${documentId}/file`;
        const { rows } = await this.db.query(`UPDATE public.xbos_legal_entity_document SET
        storage_path = $2, file_url = $3, mime_type = $4, file_size = $5, updated_at = NOW()
       WHERE id = $1::uuid RETURNING *`, [documentId, storageKey, fileUrl, mimeForExt(ext), file.size]);
        return rows[0];
    }
    async streamDocumentFile(documentId) {
        const { rows } = await this.db.query(`SELECT storage_path, mime_type, document_name, file_url FROM public.xbos_legal_entity_document
       WHERE id = $1::uuid AND status = 'active'`, [documentId]);
        const row = rows[0];
        const resolvedPath = resolveStoredFilePath(row?.storage_path);
        if (!resolvedPath) {
            throw new api_exception_1.ApiException('XBOS-DOC-404', 'File not found', common_1.HttpStatus.NOT_FOUND);
        }
        return {
            stream: (0, node_fs_1.createReadStream)(resolvedPath),
            mimeType: row?.mime_type || 'application/octet-stream',
            fileName: row?.document_name || 'document',
        };
    }
};
exports.LegalEntityProfileService = LegalEntityProfileService;
exports.LegalEntityProfileService = LegalEntityProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [xbos_db_service_1.XbosDbService,
        org_foundation_service_1.OrgFoundationService])
], LegalEntityProfileService);
