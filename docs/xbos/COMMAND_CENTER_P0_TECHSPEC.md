# TECHSPEC — Command Center P0

> SRS team: [`COMMAND_CENTER_P0_SRS.md`](./COMMAND_CENTER_P0_SRS.md)  
> **ref_srs (W1):** khách `docs/client-delivery/xbos/SRS_XBOS_KHACH.md` — **FR-CC-P0-01** (cổ đông) · **FR-XBOS-ORG-03** (hồ sơ + tài liệu) · **FR-XBOS-ORG-02** (phòng ban qua org-foundation, không matrix RBAC).  
> **ref_srs (W2):** **FR-CC-P0-04** (position-rbac matrix) · **FR-CC-P0-05** (business-master `command_center_catalogs` autosave) — master `docs/xbos/TECHSPEC.md` §14.15–14.16 · evidence `docs/qa/evidence/sa-xbos-techspec-w2-ref-01-20260722.md`.  
> Master trace: `docs/xbos/TECHSPEC.md` §14.5–14.7 (W1) · §14.14–14.17 (W2).  
> **Cấm** đè UF-XBOS-04/05/03/06/12/07/13/14/10 🟢.

## 1. Stack & modules

| Module | Path | Responsibility |
|--------|------|----------------|
| `legal-entity-profile` | `apps/api/xbos-api/src/legal-entity-profile/` | Shareholders, documents, file I/O |
| `command-center` | `apps/api/xbos-api/src/command-center/` | Workspace meta |
| `position-rbac` (extend) | matrix GET/PUT | Permission matrix UI |
| `org-foundation` (existing) | org-units | Departments |

Register in [`app.module.ts`](../../apps/api/xbos-api/src/app.module.ts).

## 2. Database

Migration: `migrations/20260518_legal_entity_profile.sql`

### `xbos_legal_entity_shareholder`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id | TEXT | |
| company_id | TEXT | |
| legal_entity_id | UUID FK → xbos_legal_entity | |
| holder_name | TEXT NOT NULL | |
| identity_code | TEXT | |
| ratio_percent | NUMERIC(5,2) | |
| contributed_value | NUMERIC(18,2) | |
| status | TEXT | active / deleted |
| created_at, updated_at | TIMESTAMPTZ | |

### `xbos_legal_entity_document`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id, company_id | TEXT | |
| legal_entity_id | UUID FK | |
| document_code, document_name | TEXT | |
| issued_date, expired_date | DATE | |
| file_url | TEXT | Public API URL |
| storage_path | TEXT | Absolute path on disk |
| mime_type | TEXT | |
| file_size | BIGINT | |
| status | TEXT | |

### `xbos_cc_permission_matrix_cell`

| Column | Type |
|--------|------|
| tenant_id, role_id, row_id | TEXT (PK composite) |
| view, write, delete, approve | BOOLEAN |
| data_scope | TEXT |
| updated_at | TIMESTAMPTZ |

## 3. File storage

| Env var | Default (dev) |
|---------|----------------|
| `XBOS_LEGAL_DOC_STORAGE_ROOT` | `apps/api/xbos-api/storage/legal-documents` |
| `XBOS_PUBLIC_BASE_URL` | `http://127.0.0.1:28002` |

Path pattern: `{root}/{tenantId}/{entityId}/{documentId}.{ext}`

Allowed extensions: `pdf`, `doc`, `docx`, `xls`, `xlsx`  
Max size: 25MB (`XBOS_LEGAL_DOC_MAX_BYTES`)

`.gitignore`: `apps/api/xbos-api/storage/legal-documents/*` except `.gitkeep`

## 4. API contracts

Base: `/api/xbos` (global prefix in main.ts). Headers: `x-tenant-id`, `x-company-id`, `authorization` or `x-internal-api-key`.

### Legal entity profile

| Method | Path |
|--------|------|
| GET | `/org-foundation/legal-entities/:entityId/shareholders` |
| POST | `/org-foundation/legal-entities/:entityId/shareholders` |
| PUT | `/org-foundation/legal-entities/:entityId/shareholders/:shareholderId` |
| DELETE | `/org-foundation/legal-entities/:entityId/shareholders/:shareholderId` |
| GET | `/org-foundation/legal-entities/:entityId/documents` |
| POST | `/org-foundation/legal-entities/:entityId/documents` |
| PUT | `/org-foundation/legal-entities/:entityId/documents/:documentId` |
| DELETE | `/org-foundation/legal-entities/:entityId/documents/:documentId` |
| POST | `/org-foundation/legal-entities/:entityId/documents/:documentId/upload` |
| GET | `/org-foundation/legal-documents/:documentId/file` |

Upload: `multipart/form-data`, field `file`.

### Position RBAC matrix

| Method | Path | Body |
|--------|------|------|
| GET | `/position-rbac/matrix?roleId=` | — |
| PUT | `/position-rbac/matrix` | `{ roleId, rows: PermissionMatrixRow[] }` |

### Command Center meta

| Method | Path |
|--------|------|
| GET | `/command-center/workspace-meta?tenantId=&companyId=` |

Response:

```json
{
  "asOf": "2026-05-18T10:00:00.000Z",
  "dataSyncNote": "Dữ liệu hội tụ theo lô — làm mới gần nhất",
  "sources": { "workflow_tasks": true, "portal_alerts": true }
}
```

`asOf` = GREATEST of latest timestamps from workflow tasks, portal alerts, legal entities (best effort).

### Workflow (existing)

`GET /workflow-engine/instances/:instanceId/detail` — FE drawer.

## 5. Frontend integrations

| File | Role |
|------|------|
| `legalEntityProfileApi.ts` | CRUD + upload + file URL |
| `commandCenterWorkspaceApi.ts` | workspace-meta |
| `workflowEngineApi.ts` | + `fetchWorkflowInstanceDetail` |
| `WorkflowTaskDetailDrawer.tsx` | Inbox detail UI |
| `CommandCenterPage.tsx` | Wire handlers; remove publish on P0 paths |

### Permission row IDs (stable)

`pm-org-1` … `pm-sys-3` — see `PERMISSION_ROW_DEFS` in CommandCenterPage.

## 6. Error codes

| Code | HTTP | Meaning |
|------|------|---------|
| XBOS-SHR-400 | 400 | Shareholder validation |
| XBOS-DOC-400 | 400 | Document metadata validation |
| XBOS-DOC-413 | 413 | File too large |
| XBOS-DOC-415 | 415 | Unsupported file type |
| XBOS-DOC-404 | 404 | Document/file not found |
| XBOS-POS-400 | 400 | Matrix validation |

## 7. Deploy checklist

1. Create `XBOS_LEGAL_DOC_STORAGE_ROOT` on server with write perms for xbos-api process.
2. Mount volume shared if multi-instance.
3. Reverse proxy `/api/xbos/org-foundation/legal-documents/*/file` without auth strip (or signed token P0.5).
4. Set `XBOS_PUBLIC_BASE_URL` to public origin.

## 8. Tests

- Service unit: shareholder CRUD, upload MIME reject.
- Smoke: `scripts/verify-capability-e2e.mjs --group CC-P0`
- Manual evidence: `docs/qa/evidence/UC-CC-P0-*.md`
