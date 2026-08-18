# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-07 |
| **change_mode** | EXPAND · docs-only · **no** `apps/**` · **no** migrate · **no** seed |
| **honesty** | `contracts_printable_ready=false` — **không** claim printable UAT |
| **must_keep** | UF-HRM-02 · print-spine GWC · Q-CTR-01/02 CLOSED · DATA-01/02 lineage · no 9th template_code |

---

## 1. spec_read_ack

| Artifact | Đọc / dùng |
|----------|------------|
| TechSpec | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-TECHSPEC-01.md` §2 enum · §3 overlay · §4 keyword_map · §7 DB/API hints · Option A |
| DATA spine | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md` §3.1 templates · §3.3 print_versions |
| Lineage | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md` must_keep publish/pull/apply |
| BA SPEC | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md` §2 · §5 |
| SRS | `SRS_HRM_ENTERPRISE.md` **v0.19** · **FR-UC-BP-CORE-09d** |
| TECH evidence | `po-hrm-contract-legal-print-xevn-tpl-tech-01.md` |
| AS-IS skim (read-only) | Nest `contract-legal-print.service.ts` ensureSchema — templates/PV/registry `license_class` already present; **no** XEVN duration cols yet |

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01.md`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01.md) | **CONFIRMED** physical EXPAND — code policy 8 XEVN_* · duration/title/matrix_family · keyword tokens · PV.`template_code` · contract denorm · GPLX SoT · Settings org_suffix · VAL-XEVN · DTO hints · DATA-02 payload EXPAND |

**Không đụng:** `apps/**` · seed · wipe DATA-01/02 · invent 9th code · claim printable UAT · client HTML wipe.

---

## 3. Verdict stamps (summary)

| Topic | Stamp |
|-------|--------|
| Storage | Option A — `hrm_contract_templates.code` |
| XEVN pack CHECK | `IT_OFFICE` \| `DRIVER` only for `XEVN_*` |
| Duration | days=60 probation; months=12\|24\|null |
| Freeze | **ADD** `hrm_contract_print_versions.template_code` (+ JSON mirror) |
| Registry | Optional nullable `employee_contracts.template_code` |
| GPLX | Live SoT = **contract columns**; `license_class` = class alias; **not** cb / not employee JSON GĐ1 |
| Number pattern | `hrm_company_settings` keys `contract_number_org_suffix` (+ optional pattern) |
| DATA-02 | Payload templates[] EXPAND new fields; lineage must_keep |
| Honesty | **false** |

---

## 4. Quality gates (ba-data)

| Check | Result |
|-------|--------|
| EXPAND-only vs DATA-01/02 | **PASS** |
| Enum = 8 BA/Tech LOCK | **PASS** |
| GPLX SoT chốt 1 path | **PASS** (employee_contracts) |
| Q-CTR / UF-HRM-02 / printable=false | **PASS** |
| No apps/** / no seed | **PASS** |
| DTO↔column hints for SA | **PASS** (§8) |

---

## 5. completion_report

**Closed:** Physical DB_DESIGN delta for X.E matrix — EXPAND `hrm_contract_templates` (code CHECK 8+legacy, default_term/duration, title_print_vi, matrix_family, keyword_map GPLX/unit/number), freeze `template_code` on print_versions, optional denorm on `employee_contracts`, GPLX quartet SoT on contract cols (`license_class` alias), org_suffix via `hrm_company_settings`, DATA-02 payload EXPAND, VAL-XEVN-01..10, API DTO hints; must_keep UF-HRM-02 · print-spine GWC · Q-CTR CLOSED; `contracts_printable_ready=false`.

**Residual:** SA API deepen (F.1 DTO + Settings path confirm) → then BE/FE after DATA+API sufficient. Client DB_DESIGN DOC-DELTA pointer. **Không** claim printable UAT.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **sa** (API deepen) — PM dispatch

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01
from_role: pm
to_role: sa
change_mode: ADD / EXPAND
parent: PO-HRM-CONTRACT-LEGAL-PRINT-01
lane: governance

## read_first
1. docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01.md (§3–§8 DTO map · VAL-XEVN · Settings keys)
2. docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-TECHSPEC-01.md §6 F.1 overlay
3. docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md §5 F.1 spine paths
4. docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md §7 contract-library (must_keep)
5. docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09d
6. docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-data-01.md

## task
API_DESIGN deepen (F.1) for FR-09d matrix — file e.g. docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01.md + client API DOC-DELTA overlay:
- Confirm METHOD/path + request/response DTO ↔ DATA-01 columns for TPL-01/02 (matrix=xevn, default_term/duration, title_print_vi, matrix_family)
- PREV-01: template_code · GPLX gate · term indefinite · number_pattern_hint from hrm_company_settings
- VER-01: freeze template_code column + merged_fields mirror; denorm contract.template_code
- CTR-01: nullable template_* must_keep UF-HRM-02
- Settings get/put contract_number_org_suffix (+ optional pattern) — reuse company-settings or nest path
- Error taxonomy: HRM-CTR-TPL-CODE-INVALID · PACK-MISMATCH · TERM-INVALID · DRIVER-REQUIRED expand
- scope_parity U19; preserve DATA-02 /print-spine; honesty contracts_printable_ready=false

## exit
PASS_TO_PM · evidence docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-api-01.md
next_dispatch_prompt → PM unlock dev-be EXPAND ensureSchema (XEVN cols) then dev-fe Settings 8 rows — only if DATA+API sufficient

## forbidden
apps/** · seed · wipe DATA-01/02/XEVN-TPL-DATA · invent 9th template_code · claim printable UAT · reopen Q-CTR CLOSED
```

---

## 7. ack_status

**PASS_TO_PM**
