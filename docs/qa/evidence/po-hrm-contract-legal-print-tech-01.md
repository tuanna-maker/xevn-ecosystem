# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-TECH-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-TECH-01` |
| **from_role** | sa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-06 |
| **change_mode** | ADD · docs-only · no `apps/**` |
| **honesty (team only)** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` — **không** claim printable UAT |

---

## 1. spec_read_ack

| Artifact | Đọc / dùng |
|----------|------------|
| SRS v0.18 | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09** · **09a** · **09b** · **09c** (Diễn biến + AC) |
| SPEC | `PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md` §A–D (Đ.21 map · pack · clause · print AC) |
| DB AS-IS target | `DB_DESIGN_HRM_ENTERPRISE.md` §3.4 `hrm_contract` |
| DOCS evidence | `po-hrm-contract-legal-print-docs-01.md` |
| Nest AS-IS (read-only) | `contracts-insurance.controller.ts` · `create-contract.dto.ts` · `employee_contracts` schema in service — registry only; salary ignored (F5) |
| API stub | `API_DESIGN` **F-CORE-CTR-01** (shallow — DOC-DELTA pointer) |

---

## 2. TechSpec paths / sections

| Path | Sections |
|------|----------|
| **Primary** [`docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md) | §0 context/AS-IS · §1 spine · §2 entities (template/clause/contract expand/print_version) · §3 pack resolve · §4 keyword_map · §5 C&B ACL · §6 capability map · §7 F.1 **09a** · §8 F.1 **09b** · §9 F.1 **09c** · §10 errors · §11 must_keep · §12 options · §13 OPEN-Q · §14 Dev unlock · §15 honesty |
| Client pointer [`TECHSPEC_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md) | Header DOC-DELTA · §5.2 Contract · §5.4 FR map · §10 matrix CORE-09 · §11 R-BP-CTR-PRINT-DB/HOLD |
| API pointer [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) | DOC-DELTA under **F-CORE-CTR-01** — cite program TechSpec; **không** wipe stub; physical F.1 = ba-data next |

**Không đụng:** `apps/**` · wipe CORE-09 FR · seed · claim printable ready · paste full DOC samples.

---

## 3. Architecture locks (summary)

| Lock | Value |
|------|-------|
| Registry SoT | `employee_contracts` ↔ `hrm_contract` — UF-HRM-02 must_keep |
| Print SoT | ADD template + clause + `print_version` snapshot |
| Packs | `GENERAL` · `IT_OFFICE` · `DRIVER` · optional `LOGISTICS` |
| Salary | Off body (F5); preview merge + issue snapshot only; ACL mask |
| Option | **A** child tables + expand contract — recommend |
| Dev | HOLD until DATA-01 DB + API physical + sponsor CONFIRM |

---

## 4. F-id inventory (for ba-data)

| Family | F-ids |
|--------|-------|
| Registry | F-CORE-CTR-01 |
| Template | F-CORE-CTR-TPL-01 · TPL-02 |
| Clause (09a) | F-CORE-CTR-CL-01..04 |
| Pack/Preview (09b) | F-CORE-CTR-PACK-01 · PREV-01 |
| Version/PDF (09c) | F-CORE-CTR-VER-01 · VER-02 · PDF-01 |

---

## 5. completion_report

**Closed:** TechSpec ADD with `ref_srs` CORE-09/09a/09b/09c; entities + pack resolve + keyword_map + C&B ACL; API F.1 (Mục đích · Nghiệp vụ · bước SRS) per Diễn biến; enterprise DOC-DELTA pointers; honesty false; must_keep registry + F5.

**Residual:** ba-data `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01` — DB_DESIGN physical then API_DESIGN F.1 paths/DTOs; Dev HOLD; QA print U65 later.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **ba-data**

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01
from_role: pm
to_role: ba-data
change_mode: ADD
lane: governance
read_first:
  - docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md §2–§10
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §3.4 hrm_contract
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-CORE-CTR-01 DOC-DELTA
  - docs/qa/evidence/po-hrm-contract-legal-print-tech-01.md
task: |
  1) DB_DESIGN ADD-only: physicalize hrm_contract_template · hrm_contract_clause · hrm_contract_print_version;
     EXPAND employee_contracts alias (pack_code, template_id soft FK, term_type, work_location*, driver fields, probation*);
     UQ/IX/soft-delete; alias map logical↔physical; must_keep registry columns + F5 salary off-body.
  2) API_DESIGN deepen F-CORE-CTR-TPL/CL/PACK/PREV/VER/PDF F.1 (METHOD/path physical prefer /contracts-insurance;
     DTO↔cột; error codes HRM-CTR-*; scope_parity) — Mục đích · Nghiệp vụ · Tham chiếu bước SRS 09a/09b/09c.
  3) Honesty: contracts_printable_ready=false; no apps/**; no wipe F-CORE-CTR-01 stub text without overlay.
forbidden: apps/** · packages/** · seed · claim printable UAT · wipe CORE-09
exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-contract-legal-print-data-01.md
  · next_owner pm (then unlock order: BE → FE → QA U65 after sponsor CONFIRM)
```

---

## 7. ack_status

**PASS_TO_PM**
