# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01` |
| **from_role** | `ba-data` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — narrow EXPAND EMP MergeToken origin + DOC register matrix |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01` |
| **change_mode** | **EXPAND** / **DOC** · docs-only · **no** `apps/**` · **no** seed · **no** reopen EMP-QC / EMP-DATA catalogs |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01.md) |
| **ref_sa** | [`po-hrm-dynamic-config-platform-merge-token-emp-sa-01.md`](po-hrm-dynamic-config-platform-merge-token-emp-sa-01.md) · Option **B** CONFIRMED |
| **Verdict** | **CONFIRMED** · unlock **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01` |
| **ack_status** | `PASS_TO_PM` · **CONFIRMED** |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** invent |
| **`employees_e2e_linkage_ready`** | **`false`** | **DENIED** invent |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** |
| **`attendance_uat_ready`** | **`false`** | **DENIED** |
| **`recruitment_uat_ready`** | **`false`** | **DENIED** |
| **`contracts_printable_ready`** | **`false`** | must_keep |
| Module EMP UAT / Phase1 | **DENIED** | `C-SLICE-≠-MODULE` |
| EMP-QC-01 / EMP-QC-02 | **SEAL RETAIN** | **cấm reopen** |
| LIST-TOTALS / CTR / ATT/REC/DEC | **must_keep** | not wiped |

---

## Entry audit (read_first)

| # | Artifact | Finding |
|---|----------|---------|
| 1 | MERGE-TOKEN-EMP-SA-01 | Option B · F-EMP-TOK-01..05 · unlock DATA EXPAND `emp_catalog` |
| 2 | PLATFORM-DATA-01 §3.2 / §5.2 | `hrm_merge_tokens` SoT · origin CHK baseline · registry-wins resolve |
| 3 | ALLOWANCE-SYNC §5 | Peer `origin=allowance_catalog` register-on-save |
| 4 | Nest AS-IS | CHK already has `allowance_catalog`; **no** `emp_catalog` yet |
| 5 | EMP-DATA-01 | DOC/ET tables **SEALED** — triggers only; **cấm** new emp_* catalogs |
| 6 | EMP-QC seals | L1 + browser GWC retained — not reopened |

---

## Deliverable stamps

| Topic | Stamp |
|-------|--------|
| Origin EXPAND | **`chk_hrm_merge_tok_origin` ADD `emp_catalog`** (retain `allowance_catalog`) |
| Register matrix DOC | `custom.emp.<code>` → `extension_field` · `emp.doc.<key>` / `emp.et.<key>` → **`emp_catalog`** |
| Table ADD | **NONE** — reuse `hrm_merge_tokens` only |
| emp_* catalog ADD | **FORBIDDEN** this seat |
| Resolve | Cite **DATA §5.2** — registry wins · keyword_map fallback must_keep |
| API cite | **F-EMP-TOK-01..05** · **F-PLT-TOK-01..03** |
| VAL | **VAL-EMP-TOK-01..12** |
| Second token table | **FORBIDDEN** |

---

## Quality gates (ba-data)

| Check | Result |
|-------|--------|
| EXPAND origin peer Allowance pattern | **PASS** |
| Matrix covers custom.emp / emp.doc / emp.et | **PASS** |
| DTO↔column via F-PLT-TOK-02 | **PASS** |
| §5.2 coexistence + empty-registry fallback | **PASS** |
| No new emp_* catalog tables | **PASS** |
| No second MergeToken table | **PASS** |
| Position XBOS OUT | **PASS** |
| EMP-QC / ATT/REC/DEC / LIST-TOTALS/CTR must_keep | **PASS** |
| No apps/** / no seed | **PASS** |
| Honesty flags false | **PASS** |

---

## must_keep check

| Item | Status |
|------|--------|
| EMP-QC-01/02 seals | ✅ |
| EMP-DATA DOC/ET physical | ✅ sealed — not reopened |
| position XBOS REF | ✅ OUT of register |
| contracts/SI | ✅ |
| soft-delete / BR-PLT-03/04 | ✅ |
| ATT/REC/DEC | ✅ |
| LIST-TOTALS/CTR + keyword_map fallback | ✅ |
| F-PLT-TOK paths | ✅ reuse |
| Seed / apps/** | ✅ none |

---

## Unlock gate

| Next | When |
|------|-------|
| **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01` | **UNLOCKED** now (DATA CONFIRMED) |
| **ba-docs** R-EMP-TOK-DOCS | Parallel OK |
| **qa** AC-PLT-EMP-TOK-* | After BE READY_FOR_QA · U65 |

---

## completion_report

### Closed

1. **CONFIRMED** narrow EXPAND `chk_hrm_merge_tok_origin` **+ `emp_catalog`** (peer `allowance_catalog`).
2. **DOC** register matrix: `custom.emp.*` / `emp.doc.*` / `emp.et.*` with DTO↔column + lifecycle + TX rollback.
3. Cite **F-EMP-TOK-01..05** · **F-PLT-TOK** · platform **DATA §5.2** registry-wins.
4. Explicit **no** new `emp_*` catalog tables · **no** second token table.
5. Unlock **MERGE-TOKEN-EMP-BE-01**; honesty LOCKED false; seals retained; no `apps/**`.

### Residual

- Execution: BE side-effect + jest VAL + scope_parity → QA/QC.
- **R-EMP-TOK-EXT** if extension producer incomplete.
- **R-EMP-TOK-DOCS** client footer.
- **C-SLICE-≠-MODULE** — no ready flips.

---

## next_owner

**pm** → dispatch **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01`

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01
program: PO-HRM-CONTINUOUS-W8-20260807
change_mode: ADD / EXPAND
ref_data: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01.md
ref_sa: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01.md
ref_evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-data-01.md
ref_peer: apps/api/hrm-api/src/settings/allowance-catalog-sync.service.ts (register-on-save)
ref_platform: apps/api/hrm-api/src/merge-tokens/*

## task
1. ensureSchema EXPAND chk_hrm_merge_tok_origin + MERGE_TOKEN_ORIGINS ADD emp_catalog (keep allowance_catalog)
2. Side-effect same TX: F-EMP-CAT-DOC create/upsert/retire → F-PLT-TOK-02 upsert emp.doc.<key> origin=emp_catalog
3. Side-effect same TX: F-EMP-CAT-ET → emp.et.<key> (hyphen→underscore) origin=emp_catalog
4. F-EMP-TOK-03 custom.emp.<code> if extension producer ready; else residual R-EMP-TOK-EXT — DOC/ET GĐ1 mandatory
5. EXPAND resolver bag F-EMP-TOK-05 labels from effective DOC/ET — cite DATA §5.2
6. Jest: VAL-EMP-TOK + scope_parity U19; no hard-delete; no seed UF
7. Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-be-01.md

## must_keep
EMP-QC-01/02 seals · EMP DOC/ET schema · position XBOS REF · contracts/SI · ATT/REC/DEC · LIST-TOTALS/CTR · keyword_map fallback · single hrm_merge_tokens

## Honesty LOCKED false
DENY hrm_personnel_uat_ready / employees_e2e / module EMP UAT / Phase1 · C-SLICE-≠-MODULE · printable=false

## cấm
second EMP token table · new emp_* catalog tables · seed for UF · invent ready=true · reopen QC seals · wipe F-PLT-TOK

## exit
READY_FOR_QA · completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status
```

---

## evidence_path

`docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-data-01.md`

## ack_status

**PASS_TO_PM** · **CONFIRMED**

## hrm_personnel_uat_ready

**false**

## employees_e2e_linkage_ready

**false**

## payroll_e2e_ready

**false**

## attendance_uat_ready

**false**

## recruitment_uat_ready

**false**

## contracts_printable_ready

**false**
