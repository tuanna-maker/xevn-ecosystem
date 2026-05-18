# UC-CC-P0-02 — Legal document upload & view

**Status:** Implemented (dev verification)

## Pass evidence

1. `POST /api/xbos/org-foundation/legal-entities/:entityId/documents` creates metadata row.
2. `POST …/documents/:documentId/upload` with `multipart/form-data` field `file` stores under `storage/legal-documents/{tenant}/{entity}/{id}.ext`.
3. `GET /api/xbos/org-foundation/legal-documents/:documentId/file` returns stream with `Content-Type` from stored MIME.
4. FE Eye opens `file_url` or proxy path in new tab.

## Manual smoke

- Upload `.pdf`, `.docx`, `.xlsx` under 25MB → DB `file_url` populated.
- Reject `.exe` → `XBOS-DOC-415`.

## Script

`node scripts/verify-capability-e2e.mjs --code BTN-CC-P0-LEGAL-DOC-UPLOAD` (requires xbos-api on 28002).
