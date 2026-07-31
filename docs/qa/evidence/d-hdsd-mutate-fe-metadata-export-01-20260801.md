# D-HDSD-MUTATE-FE-METADATA-EXPORT-01 — Align `resolveHrmCompanySlugForDisplay` export

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HDSD-MUTATE-FE-METADATA-EXPORT-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · `R-8088-FE-SOFTDEL-METADATA-EXPORT-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` (via PM → DevOps redeploy first) |
| **date** | 2026-08-01 (ICT) · wall 2026-07-31 local |
| **priority** | P0 |
| **change_mode** | FIX · `preserve_default: true` |
| **entry** | `QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A` FAIL_TO_PM |
| **entry_evidence** | `docs/qa/evidence/qa-hdsd-mutate-softdel-8088-smoke-03a-20260801.md` |
| **ack_status** | **READY_FOR_QA** |

## Problem (spec says / code does)

| Layer | Spec / DoD | Observed (VPS `ea2df15`) |
|-------|------------|--------------------------|
| `employeeCompanyDisplayName.ts` | imports `resolveHrmCompanySlugForDisplay` | present on VPS |
| `hrmMetadataCompany.ts` (HEAD stub) | must export that symbol + Plane B′ maps | **missing** → Employees `SyntaxError` · SoftDel TC-025 BLOCKED |
| Local working tree | fuller module with export | **present** (uncommitted vs HEAD) |

**Root cause:** allow-list / tree skew — consumer shipped; producer stub on `main`/VPS.

## Fix (allow-list only)

| Path | Action |
|------|--------|
| `apps/web/hrm/src/lib/hrmMetadataCompany.ts` | Prefer local fuller version: `HRM_COMPANY_SLUG_BY_UUID`, `resolveHrmLeaveCreateCompanyId`, **`export function resolveHrmCompanySlugForDisplay`**, serialize helper; APPEND `@CODE-MEMORY-CHANGE` this WI |
| `apps/web/hrm/src/lib/hrmMetadataCompany.test.ts` | Suite covers Plane B′ UUID/`main` → slug + LE UUID → `null` |

**Not touched (must_keep):** SoftDel DataTable · TC-025 local · CatalogSearchPicker · ViMoney · **no** `Employees.tsx` rewrite · **no** seed.

### Export proof (local source)

```text
export function resolveHrmCompanySlugForDisplay(
```

Inverse map keys: holding UUID + member pilot UUIDs `…0002`…`…0005` → `trsport`/`logistics`/`finance`/`services`. Unknown/LE UUID → `null` (UI «—»).

## Verify

```bash
cd apps/web/hrm && pnpm test -- src/lib/hrmMetadataCompany.test.ts
```

| Check | Result |
|-------|--------|
| vitest `hrmMetadataCompany.test.ts` | **8/8 PASS** (2026-08-01) |
| Includes `resolveHrmCompanySlugForDisplay` describe | ✅ Plane B′ + LE null cases |
| SoftDel / Employees.tsx diff | **none** this WI |
| Seed | **none** |

## Deploy allow-list (next)

`DO-HDSD-MUTATE-SOFTDEL-REDEPLOY-03A` — **only**:

- `apps/web/hrm/src/lib/hrmMetadataCompany.ts`
- `apps/web/hrm/src/lib/hrmMetadataCompany.test.ts` (optional on image; source align)

**Exit for DevOps:** VPS Vite body `:8088/hr/src/lib/hrmMetadataCompany.ts` contains `resolveHrmCompanySlugForDisplay` (not SPA shell); recreate `hrm-fe`/`portal-fe` as runbook.

## Residual

| ID | Owner | Note |
|----|-------|------|
| SoftDel TC-025 Dev8088 | qa after redeploy | Still blocked until VPS module ships |
| `R-8088-FE-BH-VIMONEY-01` | parallel | **unchanged** — out of scope |
| Local TC-025 `:5173` | — | **must_keep** — not demoted |

## Handoff

```yaml
work_item_id: D-HDSD-MUTATE-FE-METADATA-EXPORT-01
from_role: dev-fe
to_role: devops
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/d-hdsd-mutate-fe-metadata-export-01-20260801.md
next_owner: devops
next_work_item: DO-HDSD-MUTATE-SOFTDEL-REDEPLOY-03A
then_qa: QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A-RET
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: DO-HDSD-MUTATE-SOFTDEL-REDEPLOY-03A
from_role: pm | to_role: devops
priority: P0
entry: D-HDSD-MUTATE-FE-METADATA-EXPORT-01 READY_FOR_QA
evidence_fe: docs/qa/evidence/d-hdsd-mutate-fe-metadata-export-01-20260801.md
allow_list ONLY:
  - apps/web/hrm/src/lib/hrmMetadataCompany.ts
  - apps/web/hrm/src/lib/hrmMetadataCompany.test.ts
Do: commit/push allow-list → recreate hrm-fe/portal-fe per SoftDel redeploy runbook.
Exit: VPS GET :8088/hr/src/lib/hrmMetadataCompany.ts body contains export resolveHrmCompanySlugForDisplay (HTML shell=false); same on :8080 if used.
cấm: wide push · seed · touch Employees.tsx · ViMoney lane
Then PM → QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A-RET (TC-025 archive 2xx+F5 + row→profile; ignore BH).
```
