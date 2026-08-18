# Evidence — PO-HRM-SETTINGS-DEFAULTS-API-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-SETTINGS-DEFAULTS-API-01` |
| **parent** | `PO-HRM-SETTINGS-DEFAULTS-DATA-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P1 |
| **change_mode** | ADD |
| **date** | 2026-08-07 |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** claim AMIS parity DONE · **cấm** `apps/**` · U65 zero-seed |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-DATA-01.md` §2–§7 | Physical tax KV · SI CFG · position policy · VAL-SET-* · F-id hints |
| 2 | `docs/qa/evidence/po-hrm-settings-defaults-data-01.md` | CONFIRMED unlock SA · SRC-02 prefill · SI 412 |
| 3 | `docs/qa/evidence/po-hrm-amis-parity-settings-defaults-ba-01.md` §4–§6 | UC-SET-DEF-01..06 · BR-AMIS-SET-DEF-01..08 · AC-AMIS-SET-* |
| 4 | `docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01.md` | Scope `resolveHrmSettingsCatalogCompanyId` · orphan `HRM-ALLOW-CAT-ORPHAN-CODE` |
| 5 | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01.md` §3.6 | CTR CFG-01 KV pattern · GET missing → 200 null |
| 6 | ADR Option B L1/L6 | Open catalog · soft-delete |

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-API-01.md`](../../program/specs/PO-HRM-SETTINGS-DEFAULTS-API-01.md) | **CONFIRMED** F.1 — F-SET-TAX-01 · F-SET-SI-01..03 · F-SET-POS-01..05 · Mục đích · Nghiệp vụ · bước SRS · DTO↔column · errors |
| This file | Evidence · quality gates · handoff |

**Không đụng:** `apps/**` · seed · flip `payroll_e2e_ready` · migrate.

---

## 3. Architecture decision summary

| Topic | Decision |
|-------|----------|
| **Tax path** | **ADD** `GET/PUT /api/hrm/settings/company-settings` for `pay_tax_*` — **ONE** physical `hrm_company_settings` shared with CTR CFG-01 mount |
| **SI path** | **ADD** `/api/hrm/settings/insurance-rate-cfg*` — master CFG ≠ enrollment period |
| **Position path** | **ADD** `/api/hrm/settings/position-compensation-policies*` + **GET …/resolve** |
| **SRC-02 lock** | **F-SET-POS-05** = read-only draft; **FORBIDDEN** emp write · **FORBIDDEN** PROCESS policy overwrite |
| **SI honesty** | Process missing active rate → **412** `HRM-SET-SI-412-MISSING` — **cấm** silent 0% |
| **Orphan PC** | Policy lines reuse `HRM-ALLOW-CAT-ORPHAN-CODE` when catalog ≠ ∅ |
| **scope_parity** | All F-SET use `resolveHrmSettingsCatalogCompanyId` · list↔get↔resolve identical |
| **OU** | Nullable `ouId` — OU wins over company-wide (Q2 GĐ1) |

```text
WRITE:  Settings F-SET-TAX / SI / POS CRUD ──► KV · pay_insurance_rate_cfg · policy+lines
READ:   F-SET-POS-05 resolve ──► draft only ──► C&B confirm (emp SoT)
PAY:    READ tax KV + SI snapshot · emp C&B amounts · NEVER policy overwrite
MISS SI: 412 HRM-SET-SI-412-MISSING
```

---

## 4. F.1 quality gate

| F-id | Mục đích | Nghiệp vụ | bước SRS | DTO↔column | Errors |
|------|----------|-----------|----------|------------|--------|
| **F-SET-TAX-01** | PASS | PASS | UC-SET-DEF-01 · AC-AMIS-SET-TAX-01 | §2.1–2.2 | TAX-400-SHAPE · 200 null · TAX-412 process |
| **F-SET-SI-01** | PASS | PASS | UC-SET-DEF-02/06 | §2.3 | SI-404 · scope |
| **F-SET-SI-02** | PASS | PASS | UC-SET-DEF-02 · AC-AMIS-SET-SI-01 | §3.3 body map | OVERLAP · dates |
| **F-SET-SI-03** | PASS | PASS | BR-AMIS-SET-DEF-07 · process pick 412 | lifecycle | HARD-DELETE · **SI-412-MISSING** |
| **F-SET-POS-01** | PASS | PASS | UC-SET-DEF-04 | §2.4–2.5 | POS-404 |
| **F-SET-POS-02** | PASS | PASS | UC-SET-DEF-04 · AC-AMIS-SET-POS-01 | header+lines TX | KEY · ORPHAN · ACTIVE |
| **F-SET-POS-03** | PASS | PASS | UC-SET-DEF-04 | replace lines | VAL-001 |
| **F-SET-POS-04** | PASS | PASS | BR-AMIS-SET-DEF-07 | soft retire | hard DELETE 409 |
| **F-SET-POS-05** | PASS | PASS | UC-SET-DEF-05 · SRC-02 · AC-AMIS-SET-POS-01/02 | PrefillDraft §2.6 | read-only · empty OK |

---

## 5. AC / BR mapping

| AC / BR | F.1 coverage | PASS when (measurable, after BE/FE) |
|---------|--------------|-------------------------------------|
| **AC-AMIS-SET-TAX-01** | F-SET-TAX-01 | PUT `pay_tax_*` 2xx → F5 → process var reflects |
| **AC-AMIS-SET-SI-01** | F-SET-SI-02 + process pick | BHXH row % + ceiling → snapshot ≠ silent 0 |
| **AC-AMIS-SET-POS-01** | F-SET-POS-02 + **05** | Map DRIVER→PC → resolve prefill → C&B Lưu |
| **AC-AMIS-SET-POS-02** · **SRC-02** | F-SET-POS-05 lock | Emp Y vs policy X → process **Y** |
| **AC-AMIS-SET-SCOPE-01** | all F-SET | Member slug isolation · no 409 banner |
| **UC-SET-DEF-01..06** | F-SET-TAX/SI/POS-* | J-HRM-SET-DEF-01/02 after FE |
| **V-13** | SI-412 | missing rate blocks process |

---

## 6. Residual (SA → BE / FE / PAY)

| # | Item | Owner |
|---|------|-------|
| R1 | ensureSchema + controllers + jest VAL-SET-* | **dev-be** `PO-HRM-SETTINGS-DEFAULTS-BE-01` |
| R2 | Settings FE tax/SI/position U65 | dev-fe |
| R3 | PROCESS SI snapshot + 412 + tax KV reader | PAY wave |
| R4 | Client DOC-DELTA API_DESIGN enterprise | ba-docs optional |
| R5 | Group publish GĐ2 | pm |

---

## completion_report

### Closed

1. **CONFIRMED** API F.1 **F-SET-TAX-01** · **F-SET-SI-01..03** · **F-SET-POS-01..05** with full Mục đích · Nghiệp vụ · bước SRS (UC-SET-DEF-*) · DTO↔column · error taxonomy (team F.1 gate).
2. **SRC-02 lock:** POS-05 resolve = **read-only** prefill draft; process must not apply policy over emp C&B.
3. **SI honesty lock:** process missing → **412** `HRM-SET-SI-412-MISSING` — **cấm** silent 0%.
4. **Tax KV** reuses `hrm_company_settings` via Settings mount; GET missing → 200 null (CTR pattern); open `pay_tax_*` registry.
5. **Orphan / dual SoT** on policy lines via peer `HRM-ALLOW-CAT-ORPHAN-CODE`.
6. **scope_parity U19** + soft-delete retire for SI/POS.
7. **Unlocked** `PO-HRM-SETTINGS-DEFAULTS-BE-01` — `payroll_e2e_ready=false` · no `apps/**`.

### Residual

- BE implementation (R1).
- FE Settings surfaces (R2).
- PAY process wire (R3).
- Client DOC-DELTA optional (R4).

### Explicit non-claims

- Not AMIS parity DONE.
- Not `payroll_e2e_ready=true`.
- Not Settings UI / UF PASS.
- No DDL executed this seat.

---

## next_owner

**pm** → **dev-be** (`PO-HRM-SETTINGS-DEFAULTS-BE-01`)

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-DEFAULTS-BE-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-SETTINGS-DEFAULTS-API-01
priority: P1
change_mode: ADD

## Goal
ensureSchema + Nest CRUD for Settings defaults per CONFIRMED API F.1:
- EXPAND hrm_company_settings usage: GET/PUT /api/hrm/settings/company-settings (pay_tax_*)
- ADD pay_insurance_rate_cfg + GET/POST/PATCH/retire /api/hrm/settings/insurance-rate-cfg
- ADD hrm_position_compensation_policy(+lines) + CRUD + GET …/resolve (read-only, no emp write)
Cite: docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-API-01.md · DATA-01.

## Locks
- SRC-02: resolve ≠ process write; jest spy no emp INSERT from POS-05
- SI missing process helper → 412 HRM-SET-SI-412-MISSING (not silent 0%)
- soft-delete only · scope_parity list↔get↔resolve · open catalogs
- HRM-ALLOW-CAT-ORPHAN-CODE on policy lines when PC catalog ≠ ∅
- payroll_e2e_ready=false · U65 zero-seed · no FE this seat

## read_first
1. docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-API-01.md
2. docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-DATA-01.md
3. docs/qa/evidence/po-hrm-settings-defaults-api-01.md
4. Peer: ALLOW-CAT-API-01 (scope + orphan) · CTR company-settings service if shareable

## exit_criteria
- ensureSchema + controllers live paths
- jest VAL-SET-TAX/SI/POS + scope_parity + POS-05 no-write + SI-412 helper
- @CODE-MEMORY APPEND
- evidence docs/qa/evidence/po-hrm-settings-defaults-be-01.md
- ack_status READY_FOR_QA (API smoke) or PASS_TO_PM if QA deferred
```

---

## evidence_path

`docs/qa/evidence/po-hrm-settings-defaults-api-01.md`

## ack_status

**PASS_TO_PM**
