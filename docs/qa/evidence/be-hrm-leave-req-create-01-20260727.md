# D-HRM-LEAVE-REQ-CREATE-BE-01 — Leave request create BE fix

| Field | Value |
|-------|--------|
| **Date** | 2026-07-27 |
| **Role** | dev-be |
| **work_item_id** | `D-HRM-LEAVE-REQ-CREATE-BE-01` |
| **Prior** | QA FAIL `docs/qa/evidence/qa-hrm-leave-req-create-01-20260727.md` — POST 400 `HRM-ATT-LEAVE-TYPE` + slug 500 uuid cast |
| **Constraints** | U65 zero-seed · HOLD_DEPLOY · NOT Settings MD reopen · NOT `:8088` |
| **ack_status** | **READY_FOR_QA** |

---

## spec_read_ack

| Item | Path / § |
|------|----------|
| **srs** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` §3.5 · **FR-HRM-AT-10** / UC-HRM-10 |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §14.5 FR-HRM-AT-10 · §14.9 **G-AT10-01** TEXT · VAL-SET-MD-02 / BR-HRM-MD-01 |
| **catalog partition** | `resolveHrmSettingsCatalogCompanyId` (`main`→`holding`; holding UUID→`holding`) — parity Settings controller |
| **sponsor_confirm** | PM dispatch `D-HRM-LEAVE-REQ-CREATE-BE-01` 2026-07-27 (QA residual) |
| **change_mode** | **FIX** |

---

## Root cause (closed)

1. **Catalog assert partition:** `createLeaveRequest` passed persist `company_id` (holding **UUID** kept) into `assertCodeInEffectiveCatalog`. Settings reads use `resolveHrmSettingsCatalogCompanyId` → partition **`holding`**. Same `LVT_01` rejected with `HRM-ATT-LEAVE-TYPE`.
2. **Controller:** POST leave-requests did **not** pass `x-tenant-id` into service options.
3. **G-AT10-01 / 500:** After assert on slug `holding`/`main`, fanout inbox INSERT used `$2::uuid` with TEXT slug → `invalid input syntax for type uuid: "holding"`.

---

## Fix (source)

| Area | Change |
|------|--------|
| `hrm-list-scope.ts` | ADD `resolveHrmCompanySlugForId`; Settings catalog + TEXT persist map pilot UUID→slug; `main`→`holding` unchanged |
| `leave-requests.service.ts` | Assert via `resolveHrmSettingsCatalogCompanyId(auth, tenant, body.company_id)`; persist still `resolveHrmPersistCompanyIdText` → `holding` TEXT; INSERT `$2::text` must_keep |
| `attendance.controller.ts` | Pass `tenantId` / `companySlug` headers into `createLeaveRequest` |
| `hrm-inbox.service.ts` | Map slug→pilot UUID via `resolveHrmCompanyUuidForSlug` before inbox `$2::uuid` |

**must_keep:** G-AT10-01 TEXT leave_requests · G-AT10-02 overlap/balance · leave-workflow bridge · VAL-SET-MD-02 catalog SoT (no invent leave types) · Settings MD not reopened

---

## Verification

### Jest

```text
pnpm --filter hrm-api exec jest --testPathPatterns="leave-requests.service.spec|hrm-list-scope.spec|hrm-inbox.service.spec|attendance.controller.spec" --no-coverage
→ Test Suites: 4 passed · Tests: 75 passed
```

New cases: holding UUID + `LVT_01` → catalog assert `companyId=holding` + INSERT TEXT; `main`/`holding` + `LVT_01`; inbox slug→UUID; list-scope UUID→holding.

### Ops — freeze `dist-uat-w6` **UPDATED** (not silent)

| Step | Result |
|------|--------|
| Prior `:28001` | `node … dist-uat-w6/main.js` (W6 freeze) |
| Action | `pnpm run build` → replace `dist-uat-w6` from `dist` → restart |
| Marker | `apps/api/hrm-api/dist-uat-w6/FREEZE_UPDATE_NOTE.md` (`D-HRM-LEAVE-REQ-CREATE-BE-01`) |
| Health | `GET :28001/api/hrm` **200** · FREEZE_SOT=PASS |
| Seed | **not used** |

### L1 smoke (local, after freeze refresh)

| POST `company_id` | `leave_type` | Result |
|-------------------|--------------|--------|
| holding UUID `10000000-…-0001` | `LVT_01` | **201** `HRM-LEAVE-201` |
| `holding` | `LVT_01` | **201** `HRM-LEAVE-201` |
| `main` | `LVT_01` | **201** `HRM-LEAVE-201` |

Persona: `ceo@xe.vn` · employee `PORTAL-GCEO` · **no seed**.

---

## Residuals

| Item | Sev | Owner |
|------|-----|--------|
| Browser UF create→2xx→F5 | P0 retest | **qa** `QA-HRM-LEAVE-REQ-CREATE-01` |
| FE prefer POST slug vs employee UUID | P1 optional | dev-fe after QA if still desired |
| HOLD_DEPLOY | — | unchanged |

---

## Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/be-hrm-leave-req-create-01-20260727.md`

### completion_report

**Closed:** Catalog assert partition parity with Settings (`main` / holding UUID → `holding`); tenantId on create; TEXT persist UUID→slug; inbox slug→UUID so create no longer 500; jest 75 PASS; `dist-uat-w6` rebuilt+restarted with update note; L1 smoke three company_id shapes → **201**. Zero seed. HOLD_DEPLOY. Settings MD not touched.

**Open:** Browser UF retest only.

### next_dispatch_prompt

```
work_item_id: QA-HRM-LEAVE-REQ-CREATE-01
role: qa
lane: execution
entry: BE READY_FOR_QA docs/qa/evidence/be-hrm-leave-req-create-01-20260727.md — L1 smoke 201 for holding UUID + slug main/holding + LVT_01; dist-uat-w6 UPDATED on :28001.
U65 zero-seed · HOLD_DEPLOY · NOT Settings MD · NOT :8088
retest: scripts/qa/qa-hrm-leave-req-create-01.mjs — ceo@xe.vn → Attendance → Nghỉ phép → Tạo yêu cầu → catalog LVT_* → Lưu → Network 2xx HRM-LEAVE-201 → FE row → F5 còn data
exit: PASS_TO_PM · matrix UF evidence block · residual only if FE slug bind still wanted
cấm: seed · invent leave types · reopen Settings MD
```
