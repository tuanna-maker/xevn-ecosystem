# P1-UF-XBOS-06 — Legal document file stream BE fix

**work_item_id:** `P1-UF-XBOS-06-LEGAL-DOC-FILE-BE`  
**spec_ref:** UC-CC-P0-02 · `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` §3–§4  
**date:** 2026-06-20  
**ack_status:** `READY_FOR_QA`

## Incident (sponsor)

- **Symptom:** `GET /api/xbos/org-foundation/legal-documents/{uuid}/file` → **404** `XBOS-DOC-404` «File not found» while document metadata row exists (list/detail OK).
- **URL:** `http://127.0.0.1:28002` (local) / VPS `:8088` proxy to xbos-be.

## Root cause

Two compounding issues in `legal-entity-profile.service.ts`:

1. **`storageRoot()` used `process.cwd()`** — unstable across monorepo root vs `apps/api/xbos-api` vs Docker `working_dir=/app`. Upload could write under one directory; stream lookup used another after restart or deploy.
2. **`storage_path` stored absolute filesystem path** — rows persisted paths like `/app/.../storage/...` or local Windows paths; after cwd/env change or container recreate without matching path, `existsSync(storage_path)` failed even when relative file existed under bind mount.

Secondary (expected UX): metadata-only `POST …/documents` leaves `storage_path` NULL → 404 on View until multipart upload succeeds (not a BE bug after fix).

## Fix

| Area | Change |
|------|--------|
| `storageRoot()` | Default `join(__dirname, '..', '..', 'storage', 'legal-documents')`; override via `XBOS_LEGAL_DOC_STORAGE_ROOT` |
| Upload | Persist **relative** key `{tenantId}/{entityId}/{documentId}.ext` in `storage_path` |
| Stream | `resolveStoredFilePath()` — relative key + legacy absolute re-root after `legal-documents/` segment |
| Docker | `deploy/xevn-ecosystem/docker-compose.yml` — `XBOS_LEGAL_DOC_STORAGE_ROOT=/app/apps/api/xbos-api/storage/legal-documents` |
| Deploy docs | `.env.example` comments for VPS `XBOS_PUBLIC_BASE_URL` |

**Files:** `legal-entity-profile.service.ts`, `legal-entity-profile.service.spec.ts`, `legal-entity-profile.controller.spec.ts`, `docker-compose.yml`, `deploy/xevn-ecosystem/.env.example`

## Repro (before)

1. Create document metadata: `POST …/legal-entities/{entityId}/documents` → 201, `storage_path` null.
2. Upload without stable cwd OR legacy row with absolute path from old machine → `GET …/legal-documents/{id}/file` → **404**.

## Verify (after)

### Unit / build

```bash
cd apps/api/xbos-api
pnpm test legal-entity-profile   # 14/14 PASS
pnpm build                       # exit 0
```

### Manual FE chain (U65 — no seed)

1. Login `ceo@xe.vn` → Command Center → legal entity → add document row → attach `.pdf` → save/upload.
2. Network: `POST …/documents/{id}/upload` → **201** `XBOS-DOC-201`; response `storage_path` like `xevn/{entityUuid}/{docUuid}.pdf` (relative).
3. Click View / `GET …/legal-documents/{id}/file` → **200**, `Content-Type: application/pdf`, body streams.
4. F5 → metadata + View still **200**.

### VPS :8088

1. Recreate xbos-be after compose env change: `docker compose up -d xbos-be` (bind mount keeps files under repo `apps/api/xbos-api/storage/legal-documents/`).
2. Optional: set `XBOS_PUBLIC_BASE_URL=http://<host>:8088` in deploy `.env` for correct `file_url` in JSON (stream GET unaffected).

## QA dispatch hints

- **UF-ID:** UF-XBOS-06  
- **J-*:** J-XBOS legal entity document view (if in matrix)  
- **Persona:** `ceo@xe.vn` / `Xevn@2026`  
- **FAIL if:** metadata without upload → View 404 (expected until upload); **PASS if:** upload → View 200 + F5 persists  
- **Regression:** do not change UX confirm/loading (FE out of scope)

## Residual

- Existing DB rows with **only** absolute path and **missing** file on disk still 404 until user re-uploads (legacy re-root covers path drift, not deleted bytes).
- `XBOS_PUBLIC_BASE_URL` on VPS should be set by DevOps for correct `file_url` display; not blocking stream GET.
