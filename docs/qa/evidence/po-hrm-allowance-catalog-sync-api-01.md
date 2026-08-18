# Evidence — PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01` |
| **parent** | `PO-HRM-ALLOWANCE-CATALOG-SYNC-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P0 |
| **change_mode** | ADD |
| **date** | 2026-08-07 |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** claim AMIS parity DONE · **cấm** `apps/**` · U65 zero-seed |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md` §3–§9 | Physical PC table · sync map · MergeToken · VAL-ALLOW-* · F-id hints |
| 2 | `docs/qa/evidence/po-hrm-allowance-catalog-sync-data-01.md` | Dual SoT decision · reject PAY direct write · scope_parity |
| 3 | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01.md` | F-PLT-PAY-COMP peer paths · error taxonomy · merge live prefix |
| 4 | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md` §3 | `hrm_merge_tokens` columns · UQ · origin CHECK gap |
| 5 | `docs/qa/evidence/po-hrm-amis-parity-settings-defaults-ba-01.md` | UC-SET-DEF-03 · BR-AMIS-SET-DEF-03 · AC-AMIS-SET-PC-CAT-01 |
| 6 | Live READ-ONLY | `settings-catalogs.controller` scope · `payroll.controller` `/salary-components*` |

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01.md`](../../program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01.md) | **CONFIRMED** F.1 — F-ALLOW-CAT-01..05 full Mục đích · Nghiệp vụ · bước SRS · DTO↔column · errors |
| This file | Evidence · quality gates · handoff |

**Không đụng:** `apps/**` · seed · flip `payroll_e2e_ready` · migrate.

---

## 3. Architecture decision summary

| Topic | Decision |
|-------|----------|
| **Write authority GĐ1** | Settings **F-ALLOW-CAT-02/03/04** only for allowance/deduction kinds |
| **Path** | **ADD** `/api/hrm/settings/allowance-deduction-types*` — Settings vertical under same scope as `settings-catalogs` |
| **Sync TX** | Single transaction: PC → mirror `salary_components` → register `hrm_merge_tokens` → back-ref `salary_component_id` |
| **PAY guard** | **EXPAND** F-PLT-PAY-COMP-02/03/04 — **409** `HRM-ALLOW-CAT-409-DUAL-WRITE` / `HRM-ALLOW-CAT-409-LINKED` — **reject path locked** (no waiver GĐ1) |
| **MergeToken** | `cb.allowance_{code}` / `cb.deduction_{code}` · `domain=SET` · `origin=allowance_catalog` — **requires** BE EXPAND origin CHECK (DATA-01 gap) |
| **Open catalog** | Code N+1 = **2xx** if slug valid — **BR-PLT-05** |
| **scope_parity** | F-ALLOW-CAT-01 list ↔ get ↔ mutate ≡ F-PLT-PAY-COMP-01 resolver family |
| **PAY-native keep** | `LUONG_CO_BAN`, tax, attendance vars — not forced through PC catalog |

```text
WRITE (GĐ1):  Settings F-ALLOW-CAT-* ──TX──► PC + SC + merge_tokens
READ PAY:     F-PLT-PAY-COMP-01 (picker/engine sees mirrored SC)
BLOCK PAY:    F-PLT-PAY-COMP-02/03 phu_cap|khau_tru ──409──► use Settings
```

---

## 4. F.1 quality gate

| F-id | Mục đích | Nghiệp vụ | bước SRS | DTO↔column | Errors |
|------|----------|-----------|----------|------------|--------|
| **F-ALLOW-CAT-01** | PASS | PASS | UC-SET-DEF-03 · AC-PLT-PAY-01 | §2 row map | 404/scope |
| **F-ALLOW-CAT-02** | PASS | PASS | UC-SET-DEF-03 · AC-AMIS-SET-PC-CAT-01 · BR-AMIS-SET-DEF-03 | §3.2 body map | §6 full |
| **F-ALLOW-CAT-03** | PASS | PASS | UC-SET-DEF-03 · BR-PLT-04 | partial §3.2 | §6 |
| **F-ALLOW-CAT-04** | PASS | PASS | UC-SET-DEF-03 alt · BR-PLT-04 | lifecycle §3.4 | 200+warn |
| **F-ALLOW-CAT-05** | PASS | PASS | BR-PLT-01 | DATA-01 §7.1 | 200 honest empty |
| **F-PLT-PAY-COMP guard** | PASS | PASS | dual-write lock | N/A | 409 dual-write |

---

## 5. AC mapping

| AC / BR | F.1 coverage | PASS when (measurable) |
|---------|--------------|------------------------|
| **AC-AMIS-SET-PC-CAT-01** | F-ALLOW-CAT-02 + F-PLT-PAY-COMP-01 read | Settings Tạo `PC_DIEU_XE` → 201 → F5 → Lương picker **same code** |
| **UC-SET-DEF-03** | F-ALLOW-CAT-01..04 | Browser CRUD path (after BE/FE LIVE) |
| **BR-AMIS-SET-DEF-03** | F-ALLOW-CAT-02/03 sync TX | No orphan SC without PC |
| **AC-PLT-PAY-01** | mirror + list read | Picker lists synced codes |
| **BR-PLT-01** | token register on save | Merge picker shows token after F5 |
| **BR-PLT-02** | VAL-ALLOW-08 downstream | Policy/C&B reject free-text when catalog ≠ ∅ |
| **BR-PLT-04** | F-ALLOW-CAT-04 | Soft retire parity PC+SC+token |
| **VAL-ALLOW-13** | F-PLT-PAY-COMP-02 guard | POST PAY phu_cap → 409 dual-write |

---

## 6. Residual (SA → BE/BA)

| # | Item | Owner |
|---|------|-------|
| R1 | DDL + ensureSchema `hrm_allowance_deduction_types` | dev-be |
| R2 | EXPAND `hrm_merge_tokens.origin` CHECK `allowance_catalog` | dev-be |
| R3 | `AllowanceCatalogSyncService` + controller | dev-be |
| R4 | EXPAND `PayrollCatalogService` dual-write guard | dev-be |
| R5 | CATALOG_FAMILIES + settings overview row | dev-be |
| R6 | Orphan SC → PC backfill (ops waiver) | devops |
| R7 | Client DOC-DELTA `API_DESIGN_HRM_ENTERPRISE.md` §Settings | ba-docs optional |
| R8 | Position policy FK consume `component_code` | ba-data SETTINGS-DEFAULTS-DATA-01 |

---

## completion_report

### Closed

1. **CONFIRMED** API F.1 **F-ALLOW-CAT-01..05** with full Mục đích · Nghiệp vụ · bước SRS · DTO↔column · error taxonomy per team-spec-before-code-gate F.1.
2. **GĐ1 dual-write lock** documented: EXPAND F-PLT-PAY-COMP-02/03/04 — reject PAY direct create/update/retire for PC/KT class → `HRM-ALLOW-CAT-409-DUAL-WRITE` / `HRM-ALLOW-CAT-409-LINKED`.
3. **Single TX sync** contract: PC INSERT/UPDATE/retire → mirror SC → MergeToken register → `salary_component_id` back-ref; rollback on partial failure.
4. **MergeToken mapping** `cb.allowance_{code}` / `cb.deduction_{code}` with BE prerequisite to EXPAND origin enum.
5. **Validation matrix** VAL-ALLOW-01..15 including PAY guard VAL-ALLOW-13.
6. **Traceability** to UC-SET-DEF-03 · BR-AMIS-SET-DEF-03 · AC-AMIS-SET-PC-CAT-01 · BR-PLT-01/02/04/05 · scope_parity U19.
7. **Unlocked** dev-be `ALLOW-CAT-BE-01`.

### Residual

- BE implementation + jest (R1–R5).
- FE Settings PC/KT screen (after BE).
- Downstream VAL-ALLOW-08 on policy/C&B APIs (SETTINGS-DEFAULTS wave).
- Client API_DESIGN DOC-DELTA optional (R7).
- **`payroll_e2e_ready=false`**.

---

## next_owner

**pm** → dispatch **dev-be** `ALLOW-CAT-BE-01`

---

## next_dispatch_prompt

```text
work_item_id: ALLOW-CAT-BE-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-ALLOWANCE-CATALOG-SYNC-01
priority: P0
change_mode: ADD
sponsor_confirm: ALLOWANCE-CATALOG-SYNC-API-01 CONFIRMED 2026-08-07

## read_first
1. docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01.md F-ALLOW-CAT-01..05 + §4 PAY guard
2. docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md §3–§5 physical/sync
3. docs/qa/evidence/po-hrm-allowance-catalog-sync-api-01.md
4. apps/api/hrm-api/src/payroll/payroll-catalog.service.ts (EXPAND guard — merge, no fork)
5. apps/api/hrm-api/src/settings-catalogs/ (scope pattern)

## task
ensureSchema ADD public.hrm_allowance_deduction_types per DATA spec; EXPAND hrm_merge_tokens.origin CHECK + allowance_catalog; implement AllowanceCatalogSyncService (single TX: PC→SC→token→back-ref); new controller GET|POST|PATCH /settings/allowance-deduction-types + POST …/retire + GET …/merge-tokens; resolveHrmSettingsCatalogCompanyId scope_parity; EXPAND PayrollCatalogService POST/PATCH/DELETE guard HRM-ALLOW-CAT-409-DUAL-WRITE for phu_cap|khau_tru; ADD CATALOG_FAMILIES allowance_deduction; jest VAL-ALLOW-01..15 + scope_parity + sync rollback; @CODE-MEMORY APPEND; no seed U65.

## exit_criteria
- evidence docs/qa/evidence/allowance-catalog-sync-be-01.md
- jest PASS touched module
- ack_status READY_FOR_QA
- payroll_e2e_ready=false

## must_keep
Open catalog N+1 · soft-delete only · PAY-native LUONG_CO_BAN not via PC · single TX sync · U65 no seed
```

---

## evidence_path

- Spec: `docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01.md`
- Evidence: `docs/qa/evidence/po-hrm-allowance-catalog-sync-api-01.md`

## ack_status

**PASS_TO_PM**
