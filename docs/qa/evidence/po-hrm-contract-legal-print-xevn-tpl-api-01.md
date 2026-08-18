# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-07 |
| **change_mode** | ADD / EXPAND · docs-only · **no** `apps/**` · **no** seed |
| **honesty** | `contracts_printable_ready=false` — **không** claim printable UAT |
| **must_keep** | UF-HRM-02 · print-spine GWC · Q-CTR-01/02 CLOSED · DATA-01/02 · no 9th `template_code` |

---

## 1. spec_read_ack

| Artifact | Đọc / dùng |
|----------|------------|
| DATA XEVN | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01.md` §3–§8 DTO · VAL-XEVN · Settings keys — **CONFIRMED** |
| TechSpec | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-TECHSPEC-01.md` §6 F.1 overlay · enum 8 |
| DATA spine | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md` §5 METHOD/path |
| Library | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md` §7 `/contract-library/*` must_keep |
| SRS | `SRS_HRM_ENTERPRISE.md` **v0.19** · **FR-UC-BP-CORE-09d** Diễn biến #1–#7 · AC-CTR-XEVN-01..10 |
| DATA evidence | `po-hrm-contract-legal-print-xevn-tpl-data-01.md` |
| AS-IS skim (read-only) | Nest `contracts-insurance` already has TPL/PREV/VER/PDF + contract-library; DTO thiếu XEVN cols / `template_code` / company-settings — **no code this seat** |

---

## 2. Deliverables

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01.md`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01.md) | **CONFIRMED** F.1 deepen — TPL/PREV/VER/CTR/CFG · errors · scope_parity · DTO↔column |
| [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) | DOC-DELTA overlay — **no wipe** print-spine / DATA-02 |

**Không đụng:** `apps/**` · seed · wipe DATA-01/02/XEVN-TPL-DATA · invent 9th code · claim printable UAT · reopen Q-CTR.

---

## 3. Verdict stamps (summary)

| Topic | Stamp |
|-------|--------|
| Paths | Preserve `/contracts-insurance` spine; EXPAND query/body/response only |
| TPL-01 | `matrix=xevn` · display duration/title/`matrix_family` · `template_code` alias |
| TPL-02 | `HRM-CTR-TPL-CODE-INVALID` · `PACK-MISMATCH` |
| PREV-01 | `template_code` · GPLX gate · indefinite term · `number_pattern_hint` from settings |
| VER-01 | Freeze PV.`template_code` + JSON mirror; denorm contract.`template_code` |
| CTR-01 | Nullable template_* · UF-HRM-02 must_keep |
| CFG-01 | `GET/PUT …/company-settings` → `contract_number_org_suffix` (+ pattern) |
| DATA-02 | Payload EXPAND fields only; library F-ids unchanged |
| Honesty | **false** |
| Cascade | DATA+API **SUFFICIENT** → unlock BE then FE |

---

## 4. Quality gates (SA)

| Check | Result |
|-------|--------|
| F.1 đủ Mục đích / Nghiệp vụ / bước SRS / DTO↔DB / lỗi | **PASS** |
| METHOD/path = DATA-01 §5 (no redesign) | **PASS** |
| DATA-02 contract-library must_keep | **PASS** |
| Enum = 8 only · no 9th | **PASS** |
| scope_parity U19 documented | **PASS** |
| Client DOC-DELTA no wipe | **PASS** |
| No apps/** / no seed / printable=false | **PASS** |
| Q-CTR CLOSED preserved | **PASS** |

---

## 5. completion_report

**Closed:** API_DESIGN F.1 deepen for FR-09d — confirm Nest paths; TPL-01/02 DTO↔XEVN columns + matrix filter; PREV with template_code · GPLX expand · term indefinite · number_pattern_hint; VER freeze+denorm; CTR nullable must_keep; ADD CFG-01 company-settings keys; error taxonomy CODE-INVALID / PACK-MISMATCH / TERM-INVALID / DRIVER-REQUIRED expand; U19 scope_parity; DATA-02/print-spine/Q-CTR must_keep; client DOC-DELTA; `contracts_printable_ready=false`.

**Residual:** PM unlock **dev-be** EXPAND ensureSchema + DTO/VAL then **dev-fe** Settings 8 rows. **Không** claim printable UAT.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **pm** → unlock **dev-be** then **dev-fe**

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-01
from_role: pm
to_role: dev-be
change_mode: EXPAND
parent: PO-HRM-CONTRACT-LEGAL-PRINT-01
lane: execution

## entry_criteria
- DATA: docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01.md CONFIRMED
- API: docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01.md CONFIRMED
- evidence: docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-api-01.md
- U65 zero-seed; contracts_printable_ready=false; Q-CTR-01/02 CLOSED must_keep

## read_first
1. docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01.md (F.1 + errors + CFG-01)
2. docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01.md (§3–§7 physical)
3. apps/api/hrm-api/src/contracts-insurance/contract-legal-print.service.ts (ensureSchema AS-IS)
4. docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md §7 (payload EXPAND only — no redesign)

## task
EXPAND ensureSchema + Nest DTOs/services (no wipe spine):
- hrm_contract_templates: default_term_type · duration · title_print_vi · matrix_family + CHK 8 XEVN codes/pack
- hrm_contract_print_versions.template_code (+ merged_fields mirror on issue)
- employee_contracts: template_code nullable · GPLX ADD cols · license_class alias
- hrm_company_settings keys contract_number_org_suffix (+ optional pattern)
- TPL list matrix=xevn; PREV template_code/GPLX/term/number_pattern_hint; VER freeze+denorm
- Errors: HRM-CTR-TPL-CODE-INVALID · PACK-MISMATCH · TERM-INVALID · DRIVER-REQUIRED expand
- scope_parity jest list↔get; preserve UF-HRM-02 nullable template; DATA-02 payload fields on publish freeze
- solid_convention_ack FE–BE boundary / display-ready on list

## exit
READY_FOR_QA (narrow BE) or PASS_TO_PM with next_dispatch_prompt → dev-fe Settings 8 XEVN rows + picker
evidence: docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-be-01.md
honesty: contracts_printable_ready=false

## forbidden
seed · invent 9th template_code · claim printable UAT · reopen Q-CTR · redesign PDF spine · dual driver_license_class column
```

**Parallel / after BE READY:** PM may dispatch **dev-fe** Settings 8 rows (`matrix=xevn` picker, org_suffix Settings UI, no FE-hardcoded suffix).

---

## 7. ack_status

**PASS_TO_PM**
