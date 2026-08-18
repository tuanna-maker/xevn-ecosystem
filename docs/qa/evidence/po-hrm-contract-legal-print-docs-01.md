# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-DOCS-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-DOCS-01` |
| **from_role** | ba-docs |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-06 |
| **change_mode** | ADD-only · no_prompt_echo |
| **honesty (team only)** | `contracts_printable_ready=false` — **không** claim printable UAT trong SRS khách |

---

## 1. spec_read_ack

| Artifact | Đọc / dùng |
|----------|------------|
| SPEC | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md` §E draft 09a/b/c · §B packs · §C clause · §D AC |
| Enterprise SRS | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` FR-UC-BP-CORE-09 (preserve) |
| Evidence SPEC | `docs/qa/evidence/po-hrm-contract-legal-print-spec-01.md` |
| Program AS-IS | `docs/program/PO_HRM_CONTRACT_LEGAL_PRINT_PROGRAM.md` § AS-IS |

---

## 2. SRS paths / sections touched

| Path | Section / delta |
|------|-----------------|
| `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` | §3.A inventory **55→58**; rows **12a/12b/12c** |
| same | **FR-UC-BP-CORE-09** — cross-ref ADD only (giữ AC-CTR-TPL · CRUD register semantics) |
| same | **ADD** `### FR-UC-BP-CORE-09a` — thư viện điều khoản (7 mục + AC-CTR-CL) |
| same | **ADD** `### FR-UC-BP-CORE-09b` — gói nghề + xem trước (inventory packs + AC-CTR-PRINT) |
| same | **ADD** `### FR-UC-BP-CORE-09c` — lưu phiên bản + in/PDF |
| same | §6.2 Nhật ký → **v0.18** |
| `docs/client-delivery/hrm-enterprise-blueprint/UC_INVENTORY.md` | CORE: ADD UC-BP-CORE-09a/b/c · ver **0.3.6** |

**Không đụng:** `apps/**` · `packages/**` · wipe thân CORE-09 · paste full DOC mẫu HĐLĐ.

---

## 3. Clause pack inventory (merged into FR-09b)

| Pack (khách) | SPEC code | MVP |
|--------------|-----------|-----|
| Chung | `GENERAL` | Yes |
| IT / văn phòng | `IT_OFFICE` | Yes |
| Lái xe | `DRIVER` | Yes |
| Kho vận | `LOGISTICS` | Optional giai đoạn sau |

---

## 4. Quality gates (ba-docs)

| Check | Result |
|-------|--------|
| Uniform FR: sequenceDiagram + Diễn biến 4 cột | **PASS** 09a/b/c |
| 7 mục Bateco / FR | **PASS** |
| no_prompt_echo (Ctrl+F work_item / docs/program / U65 / Sponsor trong thân FR) | **PASS** |
| CORE-09 + AC-CTR-TPL preserved | **PASS** |
| Client SRS không claim printable live | **PASS** (`Liên hệ phần mềm… không khẳng định đã nghiệm thu bản in`) |
| Team honesty `contracts_printable_ready=false` | **PASS** (chỉ evidence / team — không đưa vào HTML khách như UAT live) |

---

## 5. completion_report

**Closed:** Merge ADD FR-UC-BP-CORE-09a · 09b · 09c vào Enterprise SRS v0.18; inventory 58; pack Chung/IT/Lái xe (+ Kho vận optional); giữ CORE-09 + sổ đăng ký; client-safe VI; honesty printable=false team-only.

**Residual:** TechSpec vật lý (template + clause + merge/print + pack resolve + C&B ACL + keyword_map + snapshot) — **sa**; DB/API design — ba-data; chưa code / chưa QA print U65.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **sa**

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-TECH-01
from_role: pm
to_role: sa
change_mode: ADD
read_first:
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09 · 09a · 09b · 09c (v0.18)
  - docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md §A–D
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md hrm_contract
  - docs/qa/evidence/po-hrm-contract-legal-print-docs-01.md
task: |
  Soạn TechSpec (ref_srs CORE-09/09a/09b/09c):
  - Entity template + clause library + print/merge spine
  - Pack resolve (GENERAL / IT_OFFICE / DRIVER / optional LOGISTICS)
  - keyword_map · versioning snapshot · C&B field ACL trên preview
  - API map từng bước Diễn biến 09a / 09b / 09c (mục đích · nghiệp vụ · bước SRS)
  - Honesty: contracts_printable_ready=false đến QA U65
forbidden: apps/** until sponsor CONFIRM docs · wipe CORE-09 · seed
exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-contract-legal-print-tech-01.md
  (hoặc po-hrm-contract-legal-print-sa-01.md nếu PM giữ mã SA-01)
```

---

## 7. ack_status

**PASS_TO_PM**
