# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-TECH-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-TECH-01` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-07 |
| **change_mode** | ADD-only · no `apps/**` |
| **honesty** | `contracts_printable_ready=false` — **không** claim printable UAT |
| **must_keep** | UF-HRM-02 · print-spine GWC · Q-CTR-01/02 CLOSED · TECHSPEC-01 spine · pack IT_OFFICE\|DRIVER |

---

## 1. spec_read_ack

| Artifact | Đọc / dùng |
|----------|------------|
| SRS | `SRS_HRM_ENTERPRISE.md` **v0.19** · **FR-UC-BP-CORE-09d** (+ preserve 09 · 09a · 09b · 09c) |
| BA SPEC | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md` §2 matrix · §5 keyword · §9 Tech/DATA |
| Prior Tech | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md` print-spine (extend catalog only) |
| Prior Data | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md` · `DATA-02.md` (EXPAND hints) |
| Docs evidence | `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-docs-01.md` |

---

## 2. Deliverable

| Path | Content |
|------|---------|
| `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-TECHSPEC-01.md` | Option A LOCK — 8 `template_code` enum · pack/duration · keyword_map (GPLX · đơn vị · pattern số) · F.1 FR-09d · DB/API hints ba-data · must_keep · printable=false |

**Không đụng:** `apps/**` · seed · wipe TECHSPEC-01 · reopen Q-CTR · claim printable UAT · invent mã thứ 9.

---

## 3. Architecture locks (summary)

| Lock | Value |
|------|--------|
| Storage option | **A** — `hrm_contract_templates.code` ∈ 8 `XEVN_*` + ADD duration/title columns |
| Pack neo | `*_OFFICE`→`IT_OFFICE` · `*_DRIVER`→`DRIVER` |
| GPLX | 4 tokens required for DRIVER `can_issue` |
| Number pattern | Settings `orgSuffix` — no FE hardcode |
| Spine | Preview → version snapshot → PDF **unchanged** |

---

## 4. Quality gates (sa)

| Check | Result |
|-------|--------|
| ADD-only vs print-spine TECHSPEC-01 | **PASS** |
| Enum = BA LOCK 8 codes | **PASS** |
| F.1 map Diễn biến FR-09d | **PASS** (TPL-01/02 · PREV · VER · CTR-01) |
| Q-CTR / UF-HRM-02 / printable=false | **PASS** |
| DB physicalize deferred to ba-data | **PASS** (hints §7 only) |
| No apps/** | **PASS** |

---

## 5. completion_report

**Closed:** TechSpec delta XEVN template catalog — 8 `template_code`, pack/duration defaults, keyword_map (GPLX · multi-OU · contract number patterns), API F.1 overlay FR-09d, ba-data touch-point hints; print architecture not redesigned; honesty `contracts_printable_ready=false`.

**Residual:** ba-data physical EXPAND `hrm_contract_templates` (+ print_versions / employee GPLX SoT / OU number pattern) → API deepen → Settings 8 rows → BE/FE → QA AC-CTR-XEVN-* (U65). **Không** claim printable UAT.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **ba-data**

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01
from_role: pm
to_role: ba-data
change_mode: ADD / EXPAND
parent: PO-HRM-CONTRACT-LEGAL-PRINT-01
read_first:
  - docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-TECHSPEC-01.md §2 enum · §3 entity overlay · §4 keyword_map · §7 DB/API hints
  - docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md §3.1 hrm_contract_templates · §3.3 print_versions
  - docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md (lineage must_keep)
  - docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md §2 · §5
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09d
  - docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-tech-01.md
task: |
  Physical DB_DESIGN delta (XEVN template_code):
  - EXPAND hrm_contract_templates: code policy for 8 XEVN_* (+ legacy); ADD default_term_type,
    default_duration_days (60), default_duration_months (12|24|null), title_print_vi;
    keyword_map schema tokens GPLX + employer_unit + contract_number pattern;
    pack_code CHECK IT_OFFICE|DRIVER for XEVN rows; optional matrix_family
  - Freeze template_code on hrm_contract_print_versions (column or merged_fields_json)
  - Optional denorm template_code on employee_contracts (nullable)
  - Chốt SoT vật lý GPLX 4 fields (employee cols vs JSON vs cb)
  - OU/company Settings: org_suffix / contract_number_pattern
  - Indexes/constraints; preserve DATA-02 lineage publish/pull/apply
  - Map F-CORE-CTR-TPL/PREV/VER columns ↔ DTO (hints for API seat)
  - Honesty: contracts_printable_ready=false; must_keep UF-HRM-02 · print-spine GWC · Q-CTR CLOSED
forbidden: apps/** · seed · wipe DATA-01/02 · invent 9th template_code · claim printable UAT
exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-data-01.md
```

---

## 7. ack_status

**PASS_TO_PM**
