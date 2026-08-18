# QA-HRM-ADM-UPSERT-SPOT-01 — AC-ADM-02-UPSERT (G-ADM-03 KEEP UPSERT)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-ADM-UPSERT-SPOT-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · U65 · contract/L1 spot · HOLD_DEPLOY |
| **date** | 2026-07-27 |
| **ack_status** | **PASS_TO_PM** |
| **entry** | `BA-HRM-ADM-CONFLICT-01` PASS — G-ADM-03 **CLOSED** policy KEEP UPSERT |
| **spec_ref** | `docs/hrm/API_DESIGN_HRM_ADMIN.md` §A Policy lock · `docs/hrm/SRS.md` UC-HRM-02 `BR-ADM-02-UPSERT-01` + `AC-ADM-02-UPSERT-01..03` |
| **ba_evidence** | `docs/qa/evidence/ba-hrm-adm-conflict-01-20260727.md` |

---

## 1. Scope / cấm

| In | Out |
|----|-----|
| Double `POST /api/hrm/admin/platform-admin` same email → both **2xx**; **no 409** | Seed new admin only-for-test |
| OpenAPI + API_DESIGN policy lock + jest corroboration | Expect / invent `HRM-ERR-CONFLICT` |
| AC-ADM-02-UPSERT-01..02 (L1) | Phase1 / PROD claim · change `apps/**` to force conflict |
| AC-03 static FE bind note (UI exists) | Full browser Admin UF mutate wave |

---

## 2. Environment

| Item | Result |
|------|--------|
| Workspace | `C:\xevn-ecosystem` |
| L0 `qc:dev-stack` | HRM `:28001` **200** · XBOS `:28002` **200** · portal `:5173` **200** |
| Auth | XBOS `POST /api/xbos/auth/login` `ceo@xe.vn` / `Xevn@2026` → Bearer (group CEO / platform privilege) |
| Target email | **`ceo@xe.vn`** (existing persona — upsert grant, **not** seed-new-admin) |
| Seed | **none** |

---

## 3. Policy / OpenAPI corroboration

| Check | Result |
|-------|--------|
| API_DESIGN §A Policy lock | **KEEP UPSERT** · Errors: duplicate email = **2xx** · cấm expect 409 |
| OpenAPI `/admin/platform-admin` | description cites **UPSERT** / **G-ADM-03**; responses **200/400/401/403** — **no `'409'`** on this path |
| `pnpm run verify:openapi-hrm-p1-s3b` | **85 checks PASS** exit **0** |
| Runtime SQL | `INSERT … ON CONFLICT (user_id) DO UPDATE` in `HrmAdminService.createPlatformAdmin` |

---

## 4. Jest

```text
pnpm --filter hrm-api exec jest --testPathPatterns=hrm-admin --no-coverage
→ Test Suites: 3 passed · Tests: 13 passed · exit 0
```

Note: suite covers controller wrap `HRM-ADMIN-201` + group_ceo auth path; **no dedicated double-POST upsert jest** — L1 live fills AC-01/02.

---

## 5. L1 live — double POST (AC-ADM-02-UPSERT-01 / 02)

Unauth baseline: `POST` no Bearer → **401** `HRM-AUTH-001` (not UUID-400).

| Call | HTTP | code | `user_id` | 409? |
|------|------|------|-----------|------|
| POST1 `ceo@xe.vn` | **201** | `HRM-ADMIN-201` | `8b9939ec-a924-4a1a-b473-26d00d16a9e4` | **No** |
| POST2 same body | **201** | `HRM-ADMIN-201` | `8b9939ec-a924-4a1a-b473-26d00d16a9e4` | **No** |
| POST3 (grant still upsertable) | **201** | `HRM-ADMIN-201` | same UUID | **No** |

| AC | Verdict | Evidence |
|----|---------|----------|
| **AC-ADM-02-UPSERT-01** | **PASS** | Both (all) POSTs **2xx**; stable `user_id`; **no 409** / no `HRM-ERR-CONFLICT` |
| **AC-ADM-02-UPSERT-02** | **PASS** | POST2/POST3 same `user_id` — grant path still succeeds (list API `GET /admin/platform-admins` = **404** not implemented; L1 re-upsert = grant-still-present proxy) |
| **AC-ADM-02-UPSERT-03** | **N/A this spot** | Admin UI exists (`PlatformAdmin.tsx` → `useAddPlatformAdmin` → `toast.success` on 2xx; **no** conflict toast). Full FE-only double-submit U65 deferred to Admin UF wave — BA: L1 double-POST đủ contract spot |

---

## 6. Residual

| ID | Severity | Note |
|----|----------|------|
| ~~G-ADM-03~~ | — | **CLOSED** BA + **QA-verified** this evidence (KEEP UPSERT) |
| Hard-conflict CR flag | HOLD | Out of scope |
| G-ADM-01 / 04 / 05 / SCOPE | P2 open | Outside this spot |
| Admin list GET | Info | No `GET /admin/platform-admins` — AC-02 via re-upsert |
| AC-03 browser | Defer | Next Admin UF when PM schedules |

---

## 7. Handoff

### completion_report

**Closed:** `QA-HRM-ADM-UPSERT-SPOT-01` — G-ADM-03 KEEP UPSERT **QA-verified**. Live double `POST /api/hrm/admin/platform-admin` same email (`ceo@xe.vn`, existing persona) → **201 + 201** `HRM-ADMIN-201`, stable `user_id`, **no 409**. OpenAPI no 409 on path; verify **85 PASS**; jest hrm-admin **13/13**. U65: no seed-new-admin; HOLD_DEPLOY; no Phase1/PROD.

**Residual:** AC-03 browser FE defer; hard-conflict HOLD; other G-ADM-* open unrelated.

| Field | Value |
|-------|--------|
| **next_owner** | `pm` |
| **ack_status** | `PASS_TO_PM` |
| **evidence_path** | `docs/qa/evidence/qa-hrm-adm-upsert-spot-01-20260727.md` |

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QA-HRM-ADM-UPSERT-SPOT-01
role: pm
lane: governance
entry_criteria: QA-HRM-ADM-UPSERT-SPOT-01 PASS_TO_PM — G-ADM-03 KEEP UPSERT L1 verified
read_first:
  - docs/qa/evidence/qa-hrm-adm-upsert-spot-01-20260727.md
  - docs/qa/evidence/ba-hrm-adm-conflict-01-20260727.md
actions:
  1) Mark G-ADM-03 QC/PM CLOSED (policy + L1) on Admin residual board
  2) Do NOT dispatch BE hard-409
  3) Optional later: Admin UF wave for AC-ADM-02-UPSERT-03 browser (U65 FE-only)
  4) Continue parallel BE-HRM-ADM-AUDIT-01 if still DISPATCHED
cấm: seed admin · reopen G-ADM-03 as conflict · Phase1/PROD claim
```
