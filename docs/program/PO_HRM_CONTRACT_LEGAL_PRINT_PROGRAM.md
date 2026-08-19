# PO — Hợp đồng lao động chuẩn VN (in được + điều khoản theo nghề)

| Meta | Value |
|------|--------|
| **Program ID** | `PO-HRM-CONTRACT-LEGAL-PRINT-01` |
| **Opened** | 2026-08-06 |
| **Sponsor** | HĐ hiện tại không đủ làm HĐLĐ chuẩn; cần in ra bản HĐ thật; IT vs Lái xe khác điều khoản; cấu hình điều khoản ở Cài đặt |
| **Status** | **ACTIVE** — print-spine GWC · **Q-CTR-01/02 CLOSED** · **X.E template matrix BA LOCKED** (8 codes) · SRS merge QUEUE · `contracts_printable_ready=false` |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · U65 |
| **Sponsor delta 2026-08-07** | Excel mẫu X.E — 8 code = **starter ví dụ**; catalog **động** (HR thêm 9+) · lock `XEVN-TPL-DYNAMIC-LOCK.md` |

## Problem class
UF-HRM-02 / J-HRM-03 🟢 = **CRUD registry** (loại HĐ, ngày, NV) — **không** = bản HĐLĐ đủ Điều 21 BLLĐ 2019 + điều khoản nghề + bản in.

## Law baseline (không thay luật sư)
- **Bộ luật Lao động 2019 Điều 21** — nội dung chủ yếu bắt buộc
- **Thông tư 10/2020/TT-BLĐTBXH** — hướng dẫn chi tiết các nội dung đó
- **Không** có mẫu HĐLĐ bắt buộc duy nhất của nhà nước — doanh nghiệp soạn theo Đ.21 + bổ sung nghề

## Target architecture (draft — BA lock)
1. **Core fields** (chung mọi nghề) = map Đ.21
2. **Clause packs** theo `position_family` / `contract_template_code` (vd. `GENERAL` · `IT_OFFICE` · `DRIVER`) — cấu hình Settings
3. **Merge print** = template + employee + company + selected clauses → PDF/DOCX preview + F5
4. Cấm FE hardcode toàn bộ văn bản luật; SoT = Settings templates + versioned clause library

## AS-IS inventory (explore 2026-08-06 — feed SPEC)
| Surface | Finding |
|---------|---------|
| `/contracts` · `Contracts.tsx` | Registry CRUD + Excel; fields: code, NV, dept, type, dates, status, notes, file_url UI |
| Profile `EmployeeContracts.tsx` | Richer UI (probation, work_location, signer) — **many not persisted** |
| Nest `employee_contracts` | No file_url, clauses, parties legal, JD text; salary **off body** (F5) |
| Print / CORE-09 | **Not implemented** — SRS FR-UC-BP-CORE-09 paper only · EMP-SPEC D4 C-ORPHAN-SCREEN |
| Honesty | `contracts_printable_ready=false` — usable as register only |

Source: explore agent evidence summary (paths above).

## Wave
| # | work_item | Owner |
|---|-----------|-------|
| 1 | `PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01` | ba-process — **DONE** · `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md` · evidence `docs/qa/evidence/po-hrm-contract-legal-print-spec-01.md` |
| 2 | `PO-HRM-CONTRACT-LEGAL-PRINT-DOCS-01` Docs merge + inventory clause packs | ba-docs — **DONE** · evidence `docs/qa/evidence/po-hrm-contract-legal-print-docs-01.md` · SRS v0.18 |
| 3 | `PO-HRM-CONTRACT-LEGAL-PRINT-TECH-01` TechSpec template+clause+print | sa — **DONE** · `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md` · evidence `docs/qa/evidence/po-hrm-contract-legal-print-tech-01.md` |
| 4 | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01` DB + API physical | ba-data — **DONE** · `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md` · evidence `docs/qa/evidence/po-hrm-contract-legal-print-data-01.md` |
| 5 | Settings clause UI + contract create/print | BE+FE+QA R3 **PASS** · QC-01 **GWC** print-spine · stamp `CTR3-HQV9ZW` |
| 6 | QA U65 print + F5 · QC slice | **DONE** narrow GWC · module printable UAT **DENIED** |
| 7 | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-01` Inventory + SPEC delta 8 template_code X.E | ba-process — **DONE** · SPEC `specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md` · evidence `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-01.md` · outline BA LOCKED |
| 8 | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DOCS-01` SRS merge FR-09d | ba-docs — **DONE** · evidence `po-hrm-contract-legal-print-xevn-tpl-docs-01.md` · SRS v0.19 |
| 9 | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-TECH-01` TechSpec enum + keyword_map | sa — **DONE** · evidence `po-hrm-contract-legal-print-xevn-tpl-tech-01.md` |
| 10 | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01` DB physical EXPAND | ba-data — **DONE** · evidence `po-hrm-contract-legal-print-xevn-tpl-data-01.md` |
| 11 | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01` API deepen F.1 | sa — **DONE** · evidence `po-hrm-contract-legal-print-xevn-tpl-api-01.md` |
| 12 | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-01` ensureSchema + open catalog | dev-be — **READY_FOR_QA** · evidence `po-hrm-contract-legal-print-xevn-tpl-be-01.md` |
| 13 | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-01` Settings CRUD open catalog | dev-fe — **READY_FOR_QA** · evidence `po-hrm-contract-legal-print-xevn-tpl-fe-01.md` |
| 14 | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-01` AC-11 U65 | qa — **DISPATCHED** |
