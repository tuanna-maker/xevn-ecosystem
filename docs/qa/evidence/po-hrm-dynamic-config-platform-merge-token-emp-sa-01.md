# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — Option/F.1 MergeToken hook `custom.emp` after EMP DOC/ET browser GWC |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QC-02` |
| **change_mode** | **ADD** · docs-only · **no** `apps/**` · **no** seed · **no** reopen EMP-QC-01/02 |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01.md) |
| **ref_qc** | [`po-hrm-dynamic-config-platform-emp-qc-02.md`](po-hrm-dynamic-config-platform-emp-qc-02.md) stamp **`EMPPLATQA2-MSJ0OAL9`** · L1 **`EMPPLATQA-MSIZXHIM`** retained |
| **Verdict** | **CONFIRMED** Option **B** · unlock **ba-data** narrow EXPAND → then **dev-be** |
| **ack_status** | `PASS_TO_PM` |

### Honesty locks (mandatory)

| Flag | Value | SA note |
|------|-------|---------|
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** invent |
| **`employees_e2e_linkage_ready`** | **`false`** | **DENIED** invent |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** |
| **`attendance_uat_ready`** | **`false`** | **DENIED** |
| **`recruitment_uat_ready`** | **`false`** | **DENIED** |
| Module EMP UAT / Phase1 | **DENIED** | `C-SLICE-≠-MODULE` |
| EMP-QC-01 L1 / EMP-QC-02 browser | **SEAL RETAIN** | **cấm reopen** |
| LIST-TOTALS / CTR / ATT/REC/DEC | **must_keep** | not wiped |

---

## Entry audit (read_first)

| # | Artifact | Finding |
|---|----------|---------|
| 1 | EMP-QC-02 | Browser GWC DOC/ET · residual U88 MergeToken `custom.emp` → this seat |
| 2 | EMP-VERTICAL-SA | **L-EMP-CAT-11** / **R-PLT-EMP-04** BR-PLT-01 residual after Catalog |
| 3 | ADR Option B | L3 MergeToken SoT · §8.1 Roll EMP token hook · V3 custom field → token list |
| 4 | F-PLT-TOK API-01 | Register shape `custom.emp.<code>` · domain EMP · origin `extension_field` |
| 5 | DATA-01 | `hrm_merge_tokens` physical · §5.2 registry-wins · starter family custom.emp |
| 6 | Allowance SYNC §5 | Peer register-on-save · origin `allowance_catalog` |
| 7 | AS-IS Nest | MergeTokensService + resolver live · builtins `employee.full_name` · scope_parity uses `custom.emp.badge` — **no** DOC/ET side-effect yet |

---

## Option decision

| Option | Verdict |
|--------|---------|
| A Manual F-PLT-TOK only | **REJECT** — BR-PLT-01 / ADR V3 unmet |
| **B Auto-register hook** | **CONFIRMED** — peer F-PLT-TOK + F-ALLOW-CAT |
| C Dual EMP token table | **REJECT** — ADR Q-PLT-03 / L3 |

**Weighted trade-off:** B highest (108 vs A 76 / C 36) — see spec §2.

---

## F.1 delivered (docs)

| Function | Role |
|----------|------|
| **F-EMP-TOK-01** | DOC create/upsert/retire → token `emp.doc.<key>` · `origin=emp_catalog` |
| **F-EMP-TOK-02** | ET create/upsert/retire → token `emp.et.<key>` · `origin=emp_catalog` |
| **F-EMP-TOK-03** | Extension save → `custom.emp.<code>` · `origin=extension_field` (GĐ1 mandatory DOC/ET; extension may HOLD **R-EMP-TOK-EXT**) |
| **F-EMP-TOK-04** | List via F-PLT-TOK `domain=EMP` (optional EMP alias) |
| **F-EMP-TOK-05** | Resolve bag EXPAND labels from effective DOC/ET |

**DATA unlock:** EXPAND `chk_hrm_merge_tok_origin` **+ `emp_catalog`** — **no** new EMP catalog table.

**Closed residuals (architecture):** L-EMP-CAT-11 · R-PLT-EMP-04.

---

## must_keep check

| Item | Status |
|------|--------|
| position XBOS REF AC-PLT-EMP-01 | ✅ OUT of register |
| contracts/SI spines | ✅ untouched |
| soft-delete / BR-PLT-03/04 | ✅ retire sync · issued immutable |
| EMP-QC-01/02 seals | ✅ not reopened |
| ATT/REC/DEC spines | ✅ not wiped |
| LIST-TOTALS/CTR | ✅ not reopened |
| F-PLT-TOK / keyword_map fallback | ✅ must_keep |
| Seed / apps/** | ✅ none this seat |

---

## Unlock gate

| Next | When |
|------|------|
| **ba-data** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01` | **UNLOCKED** now (CONFIRMED) |
| **dev-be** `…-MERGE-TOKEN-EMP-BE-01` | After DATA CONFIRMED (or PM same-wave with DATA ack) |
| **qa** AC-PLT-EMP-TOK-* | After BE READY_FOR_QA · U65 zero-seed |
| **ba-docs** DOC-DELTA | Parallel OK |

**Cấm BE before DATA** unless PM explicitly merges origin EXPAND into BE ensureSchema with DATA seat ack on bus.

---

## completion_report

### Closed

1. ADD-only Option evaluation A/B/C → **CONFIRMED Option B**.
2. F.1 F-EMP-TOK-01..05 + register matrix binding DOC/ET + `custom.emp` extension (peer F-PLT-TOK / Allowance).
3. Cite ADR L3/§8.1/V3 · F-PLT-TOK · EMP-VERTICAL residual · EMP-QC-02 stamps.
4. Unlock **ba-data** narrow EXPAND; BE HOLD until DATA.
5. Honesty LOCKED false · seals retained · no apps/**.

### Residual

- Execution: DATA → BE → QA/QC.
- **R-EMP-TOK-EXT** if extension producer incomplete.
- **C-SLICE-≠-MODULE** — no ready flips.

---

## next_owner

**pm** → dispatch **ba-data** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01`

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01
from_role: pm
to_role: ba-data
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01
program: PO-HRM-CONTINUOUS-W8-20260807
change_mode: ADD / EXPAND
ref_sa: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01.md
ref_evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-sa-01.md
ref_platform_data: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md
ref_peer: docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md §5 (allowance_catalog origin)

## task
Narrow EXPAND physical for EMP MergeToken hook (Option B CONFIRMED):
1. EXPAND chk_hrm_merge_tok_origin ADD emp_catalog (peer allowance_catalog)
2. DOC register matrix: custom.emp.<code> / emp.doc.<key> / emp.et.<key> — DTO↔column notes
3. No new emp_* catalog tables — must_keep EMP-DATA DOC/ET sealed
4. Cite F-EMP-TOK-01..05 · F-PLT-TOK · DATA §5.2 registry-wins
5. Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-data-01.md
6. Spec: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01.md

## must_keep
EMP-QC-01/02 seals · position XBOS REF · contracts/SI · soft-delete · ATT/REC/DEC · LIST-TOTALS/CTR · keyword_map fallback · printable=false

## Honesty LOCKED false
DENY hrm_personnel_uat_ready / employees_e2e / module EMP UAT / Phase1 · C-SLICE-≠-MODULE

## cấm
apps/** · reopen EMP-QC · invent ready=true · seed · wipe sealed verticals · second EMP token table

## exit
PASS_TO_PM · CONFIRMED · unlock next_owner dev-be MERGE-TOKEN-EMP-BE-01
completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status
```

---

## evidence_path

`docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-sa-01.md`

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
