# QA-HRM-MD-DUAL-PLANE-01 — Metadata Plane B′ anti-join LE (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-MD-DUAL-PLANE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · L1 live + Jest · U65 zero-seed |
| **date** | `2026-07-27` (ICT) |
| **entry** | `D-HRM-MD-DUAL-PLANE-GUARD-01` READY_FOR_QA — `be-hrm-md-dual-plane-guard-01-20260727.md` |
| **read_first** | BE evidence · `DATA_LINKAGE_BE_FE_QA_CONTROL.md` §6.4 · `API_DESIGN_HRM_W2_SLICE.md` C1/C2 |
| **must_keep** | OP dual-plane GWC closed · CO-HC GWC closed · U65 · HOLD_DEPLOY |
| **ack_status** | **PASS_TO_PM** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **deploy** | **HOLD_DEPLOY** · NOT `:8088` |

---

## 1. Scope / cấm

| In | Out |
|----|-----|
| Network: POST/GET `/employee-metadata/change-requests` + GET `/employee-metadata/audit-logs` with XBOS LE UUID → **409** `HRM-PLANE-409` (not 200 + silent empty) | `pnpm seed:*` / seed metadata |
| Happy: `company_id=holding\|main\|finance` → **2xx**; persist maps to Plane B′ UUID | Reopen OP / CO-HC GWC |
| Jest MD dual-plane + controller + UF-HRM-11 company-uuid re-run EXIT 0 | Browser UF PASS (no browser session this WI) |
| §6.4 dual-plane checklist (non-CO-HC) | Phase1 / PROD DONE claim |

---

## 2. Environment (L0)

| Probe | Result |
|-------|--------|
| `GET :28001/api/hrm` | **200** |
| `GET :28002/api/xbos` | **200** |
| `GET :5173/` | **200** |
| Seed this wave | **none** (U65) |
| Workspace | `C:\xevn-ecosystem` |

Representative XBOS LE UUID (∉ `HRM_COMPANY_UUID_BY_SLUG`): `78b8a663-f5e5-4f4d-a020-b8f950ec2037`

| Slug | Plane B′ mapped UUID |
|------|----------------------|
| holding / main | `10000000-0000-4000-8000-000000000001` |
| finance | `10000000-0000-4000-8000-000000000004` |

---

## 3. Auth (tokens redacted)

| Persona | How | Notes |
|---------|-----|-------|
| Group CEO `ceo@xe.vn` | XBOS `POST :28002/api/xbos/auth/login` → **201** `accessToken` present | Stack auth OK |
| Internal JWT `group_ceo` / `companyId=main\|holding\|finance` | HS256 `SERVICE_JWT_SECRET` (len 26, value redacted) | Happy GET/POST slug |
| Internal JWT `group_ceo` / `companyId=<LE UUID>` | Same secret | **Required** to reach service `HRM-PLANE-409` after scope parity |
| Internal JWT `group_ceo` / `companyId=<mapped holding UUID>` | Same secret | Mapped UUID persist (scope match) |

Honesty: With token `companyId=main` + wire LE UUID, controller scope returns **409** `SCOPE_CONTEXT_MISMATCH` **before** plane guard — still fail-closed (not 200/empty). To assert **`HRM-PLANE-409`**, QA used LE-scoped token + matching `x-company-id` / query/body.

---

## 4. Exit criteria matrix

### EC-1 — LE UUID → 409 `HRM-PLANE-409` (not 200 with empty queue)

| Case | Method / path | Auth | HTTP | `code` | Verdict |
|------|---------------|------|------|--------|---------|
| List LE | `GET /api/hrm/employee-metadata/change-requests?company_id=<LE>` | JWT `companyId=<LE>` | **409** | **`HRM-PLANE-409`** | **PASS** |
| Audit LE | `GET /api/hrm/employee-metadata/audit-logs?company_id=<LE>` | JWT `companyId=<LE>` | **409** | **`HRM-PLANE-409`** | **PASS** |
| Submit LE | `POST /api/hrm/employee-metadata/change-requests` body `company_id=<LE>` | JWT `companyId=<LE>` | **409** | **`HRM-PLANE-409`** | **PASS** |
| List LE (group CEO main) | same GET | JWT `companyId=main` | **409** | `SCOPE_CONTEXT_MISMATCH` | **PASS** (fail-closed; not silent empty) — plane code via LE token + Jest |
| Jest persist/list/audit LE | `be-hrm-md-dual-plane-guard-01.spec.ts` | service direct | throw | `HRM-PLANE-409` | **PASS** |

Message (live): `company_id UUID is not an HRM pilot mapped UUID (XBOS legal-entity id rejected)`.

### EC-2 — Happy slug `holding` / `main` / `finance` → 2xx; persist mapped UUID

| Case | Result | Verdict |
|------|--------|---------|
| `GET …/change-requests?company_id=holding` | **200** `HRM-META-200` | **PASS** |
| `GET …/change-requests?company_id=main` | **200** `HRM-META-200` · total>0 · row `company_id` Plane B′ UUID | **PASS** |
| `GET …/change-requests?company_id=finance` | **200** `HRM-META-200` · rows `company_id=10000000-…0004` | **PASS** |
| `GET …/audit-logs?company_id=holding` | **200** `HRM-META-204` | **PASS** |
| `POST …/change-requests` `company_id=holding` | **201** `HRM-META-201` · response `company_id` = **`10000000-0000-4000-8000-000000000001`** | **PASS** |
| `POST …/change-requests` `company_id=main` | **201** `HRM-META-201` · `company_id` = holding mapped UUID `…0001` | **PASS** |
| `POST …/change-requests` `company_id=finance` | **201** `HRM-META-201` · `company_id` = **`10000000-0000-4000-8000-000000000004`** | **PASS** |
| `POST …` mapped Plane B′ UUID (token scope = same UUID) | **201** `HRM-META-201` · `company_id` = `…0001` (accepted as-is) | **PASS** |
| `GET holding` after POST | **200** · total ≥ 1 · row `company_id=…0001` (not stuck empty) | **PASS** |
| Jest slug finance/holding/main + mapped UUID | INSERT arg = map UUID | **PASS** |

Note: Real POST create used for persist map proof (API production path, **not** seed script). Reason tag: `QA-HRM-MD-DUAL-PLANE-01 persist map`. Soft `employee_id` UUID accepted by DTO.

### EC-3 — Jest independent re-run EXIT 0

```text
cd apps/api/hrm-api
pnpm exec jest --testPathPatterns=be-hrm-md-dual-plane-guard-01 \
  --testPathPatterns=p1-web-acceptance-metadata-company-uuid \
  --testPathPatterns=employee-metadata.controller.spec --no-coverage
→ Test Suites: 3 passed · Tests: 19 passed · EXIT 0
```

---

## 5. DATA_LINKAGE §6.4 add-on

| Check | Result |
|-------|--------|
| Identify key plane | Metadata persist/list/audit/decide wire = **B′** mapped UUID |
| Network never LE on HRM TEXT/UUID spine for MD | LE → **409** `HRM-PLANE-409` |
| B′ paths UUID ∈ map only | Live + Jest |
| Cross-surface | Settings TEXT catalogs out of WI (BE note) — not reopened |
| No reopen OP / CO-HC GWC | **Confirmed** — no OP/CO-HC FE or by_company touch |

---

## 6. Residual / not promoted

| Item | Severity | Owner |
|------|----------|-------|
| `API_DESIGN_HRM_W2_SLICE.md` C1 still names map-fail as `HRM-VAL-001` — does not yet name **`HRM-PLANE-409`** (impl + BE/QA evidence do) | Info / spec delta | ba-process (optional) — same class as OP GWC Info |
| Browser UF-HRM-11 / metadata FE after 2xx | Out of this WI (L1 Network + Jest) | future UF if PM opens |
| Optional UUID→TEXT migrate G-MD-PLANE-01 | Deferred (BE) | not this WI |
| Phase1 / PROD / `:8088` | **not_promoted** | — |

---

## completion_report

**Closed:** `QA-HRM-MD-DUAL-PLANE-01` — Live L1 proves LE wire on GET change-requests / GET audit-logs / POST change-requests → **409 `HRM-PLANE-409`** (LE-scoped token); group-CEO main + LE wire → **409** `SCOPE_CONTEXT_MISMATCH` (still not 200/empty). Happy `holding`/`main`/`finance` → **2xx**; POST slug/main/finance/mapped-UUID persists **mapped** Plane B′ UUIDs. Independent Jest **19/19** EXIT 0. U65 no seed. OP + CO-HC GWC not reopened. No Phase1/PROD. HOLD_DEPLOY.

**Residual:** API_DESIGN C1 missing `HRM-PLANE-409` name (Info); no browser UF claim this wave.

### next_owner

`qc`

### next_dispatch_prompt

```text
work_item_id: QC-HRM-MD-DUAL-PLANE-01
role: qc
lane: governance · Go/No-Go
entry_criteria: QA-HRM-MD-DUAL-PLANE-01 PASS_TO_PM — docs/qa/evidence/qa-hrm-md-dual-plane-01-20260727.md
read_first:
  - docs/qa/evidence/qa-hrm-md-dual-plane-01-20260727.md
  - docs/qa/evidence/be-hrm-md-dual-plane-guard-01-20260727.md
  - docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md §6.4
must_keep: OP dual-plane GWC closed; CO-HC GWC closed; U65; HOLD_DEPLOY
exit_criteria:
  1) Audit EC-1 LE → 409 HRM-PLANE-409 (list/audit/post) — not 200 empty
  2) Audit EC-2 holding|main|finance 2xx + mapped UUID persist
  3) Jest 19/19 cite EXIT 0 accepted
  4) Evidence GO / GO WITH CONDITIONS; residual Info API_DESIGN name only unless blocker found
  5) cấm reopen OP/CO-HC; cấm Phase1/PROD claim; HOLD_DEPLOY
```

### evidence_path

`docs/qa/evidence/qa-hrm-md-dual-plane-01-20260727.md`

### ack_status

**PASS_TO_PM**
