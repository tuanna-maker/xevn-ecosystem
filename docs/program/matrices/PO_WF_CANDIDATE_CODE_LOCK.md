# PO — Lock tên `workflowCode` CANDIDATE / HRM-only bridge

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-WF-CAT-CANDIDATE-LOCK` |
| **work_item_id** | `PO-WF-CAT-CANDIDATE-LOCK-01` |
| **Date** | 2026-08-03 |
| **Owner** | sa (governance) |
| **Parent** | `docs/program/PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md` · taxonomy `PO_WF_PROCESS_TAXONOMY.md` |
| **Status** | **GOVERNANCE LOCK (names)** — **không** claim code đã có trong product · **không** UAT DONE |
| **Locks** | U65 · U84 · cấm `apps/**` · cấm seed · cấm invent behavior / magic `T_L1` |

---

## 0. Mục đích

Sau taxonomy PASS: với mỗi process **CANDIDATE** và bridge **HRM-only** (P-ATT-ADJ, P-OT), SA chọn một trong hai:

| Decision | Ý nghĩa vận hành |
|----------|------------------|
| **LOCK_CODE** | Tên `workflowCode` + `businessType` **khóa governance** cho TC designer / TechSpec bridge wave — **chưa** có trong `workflow-catalog.constants.ts` |
| **SPEC_GAP** | Giữ gap đến khi sponsor CR / GĐ1 boundary mở — **không** dùng tên như đã product |

**AS-IS codes** (đã trong constants) **không** đổi tên — chỉ ghi tham chiếu.

---

## 1. Code SoT (read-only — 2026-08-03)

File: `apps/api/xbos-api/src/workflow-engine/workflow-catalog.constants.ts`

| `workflowCode` | `businessType` | process |
|----------------|----------------|---------|
| `hrm_leave_approval` | `hrm_leave` | P-LEAVE |
| `hrm_recruitment_plan_approval` | `hrm_recruitment_plan` | P-REC-PLAN |
| `hrm_requisition_approval` | `hrm_requisition` | P-REC-REQ |
| `hrm_candidate_pipeline` | `hrm_candidate` | P-REC-PIPE |
| `wf_hrm_catalog_extension_xe_du_lich` | `hrm_catalog_extension` | P-CAT-EXT (pattern `wf_hrm_catalog_extension_{member}`) |

HRM bridges AS-IS: `leave-workflow.bridge.ts` · `recruitment-workflow.bridge.ts` — **không** có bridge attendance/OT → XBOS.

---

## 2. Quy ước đặt tên (ADR-delta short — name only)

**Decision title:** `ADR-DELTA-PO-WF-CODE-NAMING-01` (companion — không file ADR riêng để tránh dual SoT).

| Rule | Pattern | Ví dụ AS-IS |
|------|---------|-------------|
| R1 | Approve 1-family: `hrm_<noun>_approval` | `hrm_leave_approval` |
| R2 | `businessType` = `hrm_<noun>` (không suffix `_approval`) | `hrm_leave` |
| R3 | Multi-stage pipeline: `hrm_<noun>_pipeline` | `hrm_candidate_pipeline` |
| R4 | Catalog extension member: `wf_hrm_catalog_extension_<slug>` | `wf_hrm_catalog_extension_xe_du_lich` |
| R5 | **Cấm** đổi `workflowCode` AS-IS khi chỉ mở rộng graph (L2/skip) | P-LEAVE giữ `hrm_leave_approval` |

**Non-goals:** Không khóa số bước, resolver, `T_L1`, BR logistics số ngày — chỉ **string identity** cho catalog/bridge tương lai.

---

## 3. Bảng quyết định (normative)

| `process_id` | decision | proposed `workflowCode` | proposed `businessType` | owner | expiry / trigger | notes |
|--------------|----------|-------------------------|-------------------------|-------|------------------|-------|
| **P-ATT-ADJ** | **LOCK_CODE** | `hrm_attendance_adjustment_approval` | `hrm_attendance_adjustment` | sa → ba-data (matrix) · later dev-be bridge | Unlock implement: TechSpec+API_DESIGN bridge wave sau matrix TC PLANNED | HRM-only AS-IS (`attendance_update_requests`); XBOS bridge **chưa** có — lock **tên** khớp taxonomy candidate |
| **P-OT** | **SPEC_GAP** | — *(draft taxonomy only, not locked)* | — | **sponsor** + PM | **2026-09-03** hoặc CR kéo OT vào GĐ1 (`G-P2-OT-FULL` / Q-OT-TR) | API `overtime-requests` approve HRM tồn tại; WF XBOS + multi-step OT = OUT GĐ1 mặc định (`po-hrm-comp-sa-01`) |
| **P-CONTRACT** | **LOCK_CODE** | `hrm_contract_approval` | `hrm_contract` | sa · ba-process FR depth | Implement sau SRS/TS contract WF ADD | P1 · Primary CO-VN |
| **P-PROBATION** | **LOCK_CODE** | `hrm_probation_approval` | `hrm_probation` | sa · ba-process | same | P1 · Primary CO-VN |
| **P-TRANSFER** | **LOCK_CODE** | `hrm_transfer_approval` | `hrm_transfer` | sa · ba-process | same | P1 · multi-co scope_parity bắt buộc khi bridge |
| **P-EXIT** | **LOCK_CODE** | `hrm_exit_approval` | `hrm_exit` | sa · ba-process | same | P1 · Primary CO-VN; checklist IT = behavior riêng (không khóa ở đây) |
| **P-TRAIN** | **SPEC_GAP** | — *(draft `hrm_training_cert_approval` not locked)* | — | **sponsor** + PM | **2026-09-03** hoặc CR logistics GPLX (L&D OUT GĐ1 `G-P2-LND`) | Taxonomy BR-PO-TRAIN-LGX-* giữ; **không** TC create-def như product code |
| **P-DISCIPLINE** | **SPEC_GAP** | — | — | ba-process (P2 backlog) | Sau đóng Primary P0+P1 matrix TC · target **2026-10-01** | P2 — không lock tên sớm |
| **P-PAY-EX** | **SPEC_GAP** | — | — | ba-process (P2) + payroll owner | **2026-10-01** hoặc sau payroll batch GĐ1 stable | P2 · tránh đụng formula OUT |
| **P-LEAVE** *(ref)* | **AS-IS_CODE** + **SPEC_GAP_BEHAVIOR** | `hrm_leave_approval` *(existing)* | `hrm_leave` *(existing)* | sponsor (`T_L1`) · ba-process GAP-LEAVE-LADDER-01 | Pilot ASSUMPTION đến sponsor confirm; Dev HOLD `C-LEAVE-DEV-UNLOCK-01` | **Không** invent code mới cho L2 — xem §4 |
| **P-REC-*** / **P-CAT-EXT** | **AS-IS_CODE** | *(constants)* | *(constants)* | — | — | Ngoài phạm vi lock CANDIDATE |

**Đếm:** LOCK_CODE = **5** (ATT-ADJ + CONTRACT + PROBATION + TRANSFER + EXIT) · SPEC_GAP = **4** (OT · TRAIN · DISCIPLINE · PAY-EX) · P-LEAVE behavior gap giữ nguyên.

---

## 4. P-LEAVE L1→L2 / `T_L1` — NFR / ADR boundary (align taxonomy)

| Layer | Boundary (locked this wave) | Open (not decided here) |
|-------|-----------------------------|-------------------------|
| **Identity** | Giữ `workflowCode=hrm_leave_approval` · `businessType=hrm_leave` | — |
| **Graph** | Target Option A (`po-e2e-leave-ladder-sa-01`): ADD bước L2 + `skipWhen` — **không** mã WF mới | Bước/resolver cụ thể khi Dev unlock |
| **Config** | Key thiết kế `leave_l1_max_days` per company; fail-closed thiếu config | **Giá trị** `T_L1` production — sponsor only (ASSUMPTION pilot ≠ prod) |
| **NFR** | scope_parity list↔get↔spawn↔callback · soft-delete · U65 no seed inbox · không magic N trong code | — |
| **QA** | LV-02 / TC-LV-03 = **BLOCKED / SPEC_GAP** đến sponsor | — |

**Cite:** `GAP-LEAVE-LADDER-01` · `BR-LEAVE-LADDER-01/02` · TECH_SPEC_NEW §4.4.1 · `R-PO-WF-01` taxonomy.

---

## 5. Options (name-lock strategy) — tóm tắt

| Option | Summary | Trade-off | Verdict |
|--------|---------|-----------|---------|
| **A** | Lock mọi CANDIDATE + ATT-ADJ ngay theo convention R1–R2 | TC designer nhanh; rủi ro tên thừa nếu OUT GĐ1 | **Partial** — dùng cho P1 HR + ATT-ADJ |
| **B** | SPEC_GAP toàn bộ đến khi mỗi FR có SRS | An toàn scope; chậm matrix TC def | Dùng cho OT/TRAIN/P2 |
| **C** | Invent codes vào constants ngay | Vi phạm mission / pretend product | **Reject** |

**Selected:** A∩B — LOCK_CODE where GĐ1/P1 matrix Primary cần identity; SPEC_GAP where competitive OUT hoặc P2.

---

## 6. QA / TC rules (enforce)

1. Pack `PO-ECO-TC-XBOS-WF-MATRIX`: create-def TC **chỉ** dùng AS-IS + **LOCK_CODE** rows — ghi `code_status: GOVERNANCE_LOCK` (chưa constants).
2. **SPEC_GAP** rows → TC **PLANNED/BLOCKED** + gap id; **cấm** assert HTTP spawn bằng draft name.
3. P-ATT-ADJ Primary CO-TMDV: instance/approve TC hiện tại = **HRM path**; XBOS inbox TC = BLOCKED until bridge wave.
4. P-LEAVE: không đổi code; ladder TC giữ BLOCKED.

---

## 7. Liên kết

| Artifact | Role |
|----------|------|
| `PO_WF_PROCESS_TAXONOMY.md` §3 | Map AS-IS / CANDIDATE nguồn |
| `PO_WF_CATALOG_COMPANY_MATRIX.md` §2 | Primary/Spot — cập nhật cột WF code theo bảng §3 khi ba-data refresh |
| `po-hrm-comp-sa-01.md` | GĐ1 OUT: OT full · L&D/TRAIN |
| `po-e2e-leave-ladder-sa-01.md` | Option A ladder · no new code |
| Evidence | `docs/qa/evidence/po-wf-cat-candidate-lock-01.md` |

---

*PO-WF-CAT-CANDIDATE-LOCK-01 · sa · 2026-08-03*
