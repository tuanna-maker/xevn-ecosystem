# QA-HRM-OP-DUAL-PLANE-01 — OP Plane B′ anti-join LE (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-OP-DUAL-PLANE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · L1 live + Jest · U65 zero-seed |
| **date** | `2026-07-27` (ICT) |
| **entry** | `D-HRM-OP-DUAL-PLANE-GUARD-01` READY_FOR_QA — `be-hrm-op-dual-plane-guard-01-20260727.md` |
| **read_first** | BE evidence · `DATA_LINKAGE_BE_FE_QA_CONTROL.md` §6.4 · `API_DESIGN_HRM_OPERATIONS.md` |
| **must_keep** | CO-HC GWC closed · U65 · no browser UF claim without browser |
| **ack_status** | **PASS_TO_PM** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **deploy** | **HOLD_DEPLOY** · NOT `:8088` |

---

## 1. Scope / cấm

| In | Out |
|----|-----|
| Network: POST/GET `/operations/tasks` + GET `/operations/reports/summary` with XBOS LE UUID → **409** `HRM-PLANE-409` (not 200 + silent 0) | `pnpm seed:*` / seed tasks |
| Happy: `company_id=holding\|main` → **2xx**; persist maps to Plane B′ UUID | Reopen CO-HC FE / by_company GWC |
| OP-04 slug summary honest numbers; LE cannot undercount via fake 0 | Phase1 / PROD DONE claim |
| Jest service-layer cite + L1 live | Browser UF PASS (no UF browser session this WI) |

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

Plane B′ holding map UUID: `10000000-0000-4000-8000-000000000001`

---

## 3. Auth (tokens redacted)

| Persona | How | Notes |
|---------|-----|-------|
| Group CEO `ceo@xe.vn` | XBOS `POST :28002/api/xbos/auth/login` → `data.accessToken` | Happy GET summary `company_id=main` → **200** |
| Internal JWT `group_ceo` / `companyId=main` | HS256 `SERVICE_JWT_SECRET` (len 26, value redacted) | Happy list/summary + POST slug |
| Internal JWT `group_ceo` / `companyId=<LE UUID>` | Same secret | **Required** to reach service `HRM-PLANE-409` after scope parity |

Honesty: With token `companyId=main` + wire LE UUID, controller scope returns **409** `SCOPE_CONTEXT_MISMATCH` **before** plane guard — still fail-closed (not 200/0). To assert **`HRM-PLANE-409`**, QA used LE-scoped token + matching `x-company-id` / query.

---

## 4. Exit criteria matrix

### EC-1 — LE UUID → 409 `HRM-PLANE-409` (not 200 with 0)

| Case | Method / path | Auth | HTTP | `code` | Verdict |
|------|---------------|------|------|--------|---------|
| List LE | `GET /api/hrm/operations/tasks?company_id=<LE>` | JWT `companyId=<LE>` | **409** | **`HRM-PLANE-409`** | **PASS** |
| Summary LE | `GET /api/hrm/operations/reports/summary?company_id=<LE>` | JWT `companyId=<LE>` | **409** | **`HRM-PLANE-409`** | **PASS** |
| Create LE | `POST /api/hrm/operations/tasks` body `company_id=<LE>` | JWT `companyId=<LE>` | **409** | **`HRM-PLANE-409`** | **PASS** |
| List LE (group CEO main) | same GET | JWT/XBOS `companyId=main` | **409** | `SCOPE_CONTEXT_MISMATCH` | **PASS** (fail-closed; not silent 0) — plane code via LE token + Jest |
| Jest create/list/summary LE | `be-hrm-op-dual-plane-guard-01.spec.ts` | service direct | throw | `HRM-PLANE-409` | **PASS** |

Message (live): `company_id UUID is not an HRM pilot mapped UUID (XBOS legal-entity id rejected)`.

### EC-2 — Happy slug `holding` / `main` → 2xx; persist mapped UUID

| Case | Result | Verdict |
|------|--------|---------|
| `GET …/tasks?company_id=holding` | **200** `HRM-OPS-200` · rows `company_id=10000000-…0001` | **PASS** |
| `GET …/tasks?company_id=main` | **200** `HRM-OPS-200` · rollup total>0 | **PASS** |
| `GET …/reports/summary?company_id=holding` | **200** `HRM-OPS-200` | **PASS** |
| `GET …/reports/summary?company_id=main` (XBOS ceo token) | **200** `HRM-OPS-200` | **PASS** |
| `POST …/tasks` `company_id=holding` | **201** `HRM-OPS-201` · response `company_id` = **`10000000-0000-4000-8000-000000000001`** (mapped UUID, not LE) | **PASS** |
| Jest `createTask` slug `trsport` / `main`→holding | INSERT arg = map UUID | **PASS** |

Note: One real POST create used for persist map proof (API path, **not** seed script). Title: `QA-HRM-OP-DUAL-PLANE-01 persist map`.

### EC-3 — OP-04 summary slug — honest zeros / no LE undercount

| Case | Result | Verdict |
|------|--------|---------|
| Live `GET summary?company_id=holding` | **200** numeric object (env has density data — not empty) | **PASS** path |
| Live LE summary | **409** `HRM-PLANE-409` — **no** undercount-via-0 | **PASS** |
| Jest `getSummary('holding')` with empty DB mocks | `{ attendance_records:0, payroll_periods:0, job_requisitions:0, tasks:0, service_requests:0 }` · tasks SQL `::uuid` · payroll TEXT (no `::uuid`) | **PASS** zeros honesty |
| Jest `getSummary(LE)` | rejects before `FROM public.hrm_tasks` | **PASS** |

§6.4 checklist: Plane B′ identified; LE rejected; OP-04 UUID vs TEXT mix documented in BE CODE-MEMORY / Jest; CO-HC not reopened.

---

## 5. Jest (independent re-run)

```text
cd apps/api/hrm-api
pnpm exec jest --testPathPatterns=be-hrm-op-dual-plane-guard-01 \
  --testPathPatterns=operations.service.spec \
  --testPathPatterns=hrm-list-scope.spec --no-coverage
→ Test Suites: 3 passed · Tests: 56 passed · EXIT 0
```

---

## 6. DATA_LINKAGE §6.4 add-on

| Check | Result |
|-------|--------|
| Identify key plane | OP persist/list/summary = **B′** mapped UUID |
| Network never LE on TEXT spine for OP UUID columns | LE → **409** |
| B′ paths UUID ∈ map only | Live + Jest |
| Cross-surface OP-04 mix | Documented (UUID tasks/SR; TEXT payroll/job; workforce ATT) — no LE fake 0 |
| No reopen CO-HC GWC | **Confirmed** — no CO-HC FE touch |

---

## 7. Residual / not promoted

| Item | Severity | Owner |
|------|----------|-------|
| `API_DESIGN_HRM_OPERATIONS.md` does not yet name error code **`HRM-PLANE-409`** (impl + BE evidence do) | Info / spec delta | ba-process (optional) |
| `pushCompanyIdUuidFilter` still pass-through raw UUID for non-OP (home/inbox) — MD WI owns metadata LE guard | Info (BE residual) | parallel MD WI |
| Browser UF OP create/list/summary FE after 2xx | Out of this WI (L1 Network + Jest) | future UF if PM opens |
| Phase1 / PROD / `:8088` | **not_promoted** | — |

---

## completion_report

**Closed:** `QA-HRM-OP-DUAL-PLANE-01` — Live L1 proves LE wire on GET tasks / GET summary / POST tasks → **409 `HRM-PLANE-409`** (LE-scoped token); group-CEO main + LE wire → **409** `SCOPE_CONTEXT_MISMATCH` (still not 200/0). Happy `holding`/`main` → **2xx**; POST `holding` persists **mapped** UUID `10000000-…0001`. OP-04 slug **200** with honest counts; LE cannot silent-zero; Jest empty-mock zeros **PASS**. Independent Jest **56/56**. U65 no seed. CO-HC not reopened. No Phase1/PROD.

**Residual:** API_DESIGN missing `HRM-PLANE-409` name (Info); non-OP UUID pass-through (BE/MD); no browser UF claim this wave.

### next_owner

`qc`

### next_dispatch_prompt

```text
work_item_id: QC-HRM-OP-DUAL-PLANE-01
role: qc
lane: governance · Go/No-Go
entry_criteria: QA-HRM-OP-DUAL-PLANE-01 PASS_TO_PM — docs/qa/evidence/qa-hrm-op-dual-plane-01-20260727.md
read_first:
  - docs/qa/evidence/qa-hrm-op-dual-plane-01-20260727.md
  - docs/qa/evidence/be-hrm-op-dual-plane-guard-01-20260727.md
  - docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md §6.4
must_keep: CO-HC GWC closed; U65; HOLD_DEPLOY; no Phase1/PROD
gate_checks:
  1) LE company_id on OP tasks POST/GET + reports/summary → 409 HRM-PLANE-409 (cite live + Jest); not 200+0
  2) holding|main → 2xx; persist response company_id = Plane B′ map UUID
  3) OP-04 slug honesty / LE no undercount path
  4) Residual Info only (API_DESIGN code name; non-OP filter) — GWC OK if listed
exit_criteria: evidence docs/qa/evidence/qc-hrm-op-dual-plane-01-20260727.md GO or GWC; PASS_TO_PM
cấm: seed; reopen CO-HC; claim PROD
```

### evidence_path

`docs/qa/evidence/qa-hrm-op-dual-plane-01-20260727.md`

### ack_status

**PASS_TO_PM**
