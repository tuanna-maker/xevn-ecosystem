# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-06 |
| **lane** | governance · ADD · no apps/** |
| **spec_path** | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md` |
| **honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` |

---

## 1. spec_read_ack

| Artifact | Đọc gì |
|----------|--------|
| Program | `docs/program/PO_HRM_CONTRACT_LEGAL_PRINT_PROGRAM.md` — problem class CRUD ≠ HĐLĐ; law baseline Đ.21 + TT10 |
| Team SRS | `docs/hrm/SRS.md` UC-HRM-25 — list contracts API only (shallow vs printable) |
| Enterprise | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09** — mẫu điền sẵn + AC-CTR-TPL-01..05; **chưa** clause pack IT/Driver + print AC đủ |
| DB logic | `DB_DESIGN_HRM_ENTERPRISE.md` `hrm_contract` — code/type/dates/position/work_location/compensation_snapshot; **thiếu** clause library / pack / print snapshot entities |
| EMP E2E | `PO-HRM-E2E-LINK-EMP-SPEC-01` **D4** C-ORPHAN-SCREEN mẫu HĐ — xác nhận gap sẵn |
| Matrix | `USER_FLOW_OPERABILITY_MATRIX.md` **UF-HRM-02** 🟢 = tạo/sửa HĐ + F5 CRUD — **không** = printable |
| FE skim | `apps/web/hrm/src/pages/Contracts.tsx` `DEFAULT_CONTRACT_FORM_FIELDS`: code, employee_name, department, contract_type, effective/expiry, status, notes, file_url — **không** Đ.21 a–k đủ |

---

## 2. Law / research refs (cite only — không paste full DOC)

| Ref | Dùng cho |
|-----|----------|
| **BLLĐ 2019 Điều 21** khoản 1 a–k · khoản 2 bảo mật | Bảng mandatory fields SPEC §A |
| **TT 10/2020/TT-BLĐTBXH** Điều 3 | Chi tiết ghi tên/địa chỉ NSDLĐ, NLĐ, công việc, địa điểm nhiều điểm, thời hạn, lương/PC |
| thuvienphapluat / MISA AMIS mẫu HĐLĐ | Cấu trúc chương/điều mẫu văn phòng — **không** copy full vào SRS khách |
| mauhopdong.vn / hopdongmau.com (driver samples) | Nhóm điều khoản xe · GPLX · an toàn — extract structure → pack `DRIVER` |

**Kết luận pháp lý vận hành:** Không có mẫu HĐLĐ nhà nước bắt buộc duy nhất; DN soạn đủ Đ.21 + bổ sung nghề.

---

## 3. Deliverable checklist

| # | Deliverable | Status |
|---|-------------|--------|
| A | Đ.21 → fields + source | **DONE** SPEC §A |
| B | Core vs pack GENERAL / IT_OFFICE / DRIVER (+ LOGISTICS) | **DONE** SPEC §B |
| C | Clause library model Settings | **DONE** SPEC §C |
| D | Print spine + AC FE 2xx/F5 | **DONE** SPEC §D |
| E | Draft FR 09a/09b/09c Diễn biến + sequenceDiagram | **DONE** SPEC §E |
| F | P0_fix_queue + copy-ready prompts | **DONE** SPEC §F |
| G | Honesty `contracts_printable_ready=false` | **DONE** SPEC §G |

---

## 4. As-is vs Đ.21 (evidence short)

| Đ.21 | FE Contracts form | Verdict |
|------|-------------------|---------|
| NSDLĐ + người ký A | Không | gap |
| NLĐ CCCD/DOB/cư trú | Chỉ tên (+ denorm) | gap |
| Công việc + địa điểm | position_key / dept mảnh | partial |
| Thời hạn | effective/expiry | partial |
| Lương/PC | Off body (C&B) — đúng boundary; chưa merge preview | gap print |
| e–k điều khoản | Không library | gap |
| In HĐLĐ | file_url upload ≠ generate | gap |

**UF-HRM-02:** must_keep CRUD — SPEC cấm wipe.

---

## 5. Residual / next

| Residual | Owner |
|----------|-------|
| Merge FR vào Enterprise SRS | **ba-docs** `PO-HRM-CONTRACT-LEGAL-PRINT-DOCS-01` |
| TechSpec + DB/API vật lý | sa → ba-data |
| Implement Settings + preview/print | FE/BE sau confirm |
| QA print U65 | sau Dev — mới xét `contracts_printable_ready` |

---

## completion_report

Closed governance SPEC for printable HĐLĐ: Đ.21 field map, role packs, clause library, print AC, draft FR ADD, P0 queue. No apps/**. Did not claim personnel/contract UAT. Residual = docs merge then SA/data.

## next_owner

**ba-docs** (`PO-HRM-CONTRACT-LEGAL-PRINT-DOCS-01`); then **sa**.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-DOCS-01
from_role: pm
to_role: ba-docs
change_mode: ADD
read_first:
  - docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09
  - docs/qa/evidence/po-hrm-contract-legal-print-spec-01.md
task: Merge draft FR-UC-BP-CORE-09a/09b/09c (clause library · pack preview · save/print) ADD-only into Enterprise SRS; preserve CORE-09 + UF-HRM-02 CRUD; no_prompt_echo; inventory clause groups GENERAL/IT_OFFICE/DRIVER; keep contracts_printable_ready=false in team honesty only.
forbidden: apps/** · wipe FR · paste copyrighted full DOC samples
exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-contract-legal-print-docs-01.md
```

## ack_status

**PASS_TO_PM**
