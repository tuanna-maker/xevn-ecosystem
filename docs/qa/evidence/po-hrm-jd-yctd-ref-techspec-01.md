# Evidence — PO-HRM-JD-YCTD-REF-TECHSPEC-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-JD-YCTD-REF-TECHSPEC-01` |
| role | sa |
| lane | governance |
| change_mode | ADD · **NO CODE** `apps/**` |
| date | 2026-08-06 |
| techspec_delta | `docs/program/specs/PO-HRM-JD-YCTD-REF-TECHSPEC-01.md` |
| client_pointer | `docs/client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md` DOC-DELTA + matrix §10 + residual §11 |
| ref_srs | `SRS_HRM_ENTERPRISE.md` **v0.10** FR-UC-BP-REC-02 · 02b Diễn biến **1a–1d** |
| ref_arch | `PO-HRM-JD-DYNAMIC-ARCH-02.md` F-YCTD-JD · soft FK · FORBIDDEN job_postings |
| ack_status | **PASS_TO_PM** |

---

## 1. Deliverables

| Artifact | Action |
|----------|--------|
| `PO-HRM-JD-YCTD-REF-TECHSPEC-01.md` | **ADD** — F-YCTD-JD-01..05 F.1 (Mục đích · Nghiệp vụ · Tham chiếu bước SRS · Request/Response→DB · lỗi) |
| `TECHSPEC_HRM_ENTERPRISE.md` | **DOC-DELTA** header + FR-02/02b matrix cite + residual R-BP-YCTD-JD-REF-DB/API — **no wipe** stubs |
| ARCH-02 | **Unchanged** (preserve stub; deepen lives in dedicated file) |

---

## 2. Map F-YCTD-JD ↔ SRS 1a–1d (audit)

| SRS bước | F-id | Gate / preview |
|----------|------|----------------|
| **1a** Mở danh sách — chỉ Hiệu lực | F-YCTD-JD-01 | `bindable=true` filter |
| **1b** Thư viện trống | F-YCTD-JD-01 → 200 `[]` · create → `HRM-JD-YCTD-REQUIRED` | Empty ≠ 404 |
| **1c** Chọn + preview + gắn mã | F-YCTD-JD-02 + F-YCTD-JD-03 | Preview = title + short_description — **not** live full `values_json` on YCTD |
| **1d** JD Ngừng | F-YCTD-JD-02/03 → `HRM-JD-YCTD-STATUS` | BE authoritative |
| Thành công / F5 | F-YCTD-JD-05 | Display-ready jd_code/title |

---

## 3. Locks verified

| Lock | Status |
|------|--------|
| Soft FK `job_template_id` / logical `job_description_id` must_keep | PASS |
| Only Hiệu lực bindable + error codes | PASS (`STATUS` · `REQUIRED` · `NOT-FOUND`) |
| Preview ≠ YCTD SoT of `values_json` | PASS (§2.2 contract) |
| REC-03 / job_postings dual-write FORBIDDEN | PASS |
| Dev HOLD until DB-01 + API-01 | PASS (§9 cascade) |
| No wipe TechSpec / ARCH stubs | PASS |
| `apps/**` | PASS — not touched |
| No `jd_dynamic_done` claim | PASS |

---

## 4. Cascade next (explicit)

```text
PO-HRM-JD-YCTD-REF-DB-01 (ba-data) → PO-HRM-JD-YCTD-REF-API-01 (sa) → QA-PLAN → Dev FE/BE
```

**Cấm** Dev `apps/**` trước khi DB + API confirm.

---

## 5. Completion / handoff

| Field | Value |
|-------|--------|
| completion_report | TechSpec depth F-YCTD-JD-01..05 mapped to SRS v0.10 Diễn biến 1a–1d; client DOC-DELTA pointer; Dev HOLD. No apps/**. |
| next_owner | **ba-data** |
| next_dispatch_prompt | (xem §6) |
| evidence_path | `docs/qa/evidence/po-hrm-jd-yctd-ref-techspec-01.md` |
| ack_status | **PASS_TO_PM** |

---

## 6. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-JD-YCTD-REF-DB-01
role: ba-data
lane: governance
change_mode: ADD · NO CODE apps/**

entry_criteria:
- TechSpec: docs/program/specs/PO-HRM-JD-YCTD-REF-TECHSPEC-01.md §5 (must_keep soft FK · FORBIDDEN dual column)
- Arch: PO-HRM-JD-DYNAMIC-ARCH-02.md §3.5 · §3.7 alias map
- Client DB: docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §2.3 rec_recruitment_request.job_description_id
- SRS v0.10 FR-UC-BP-REC-02/02b Diễn biến 1a–1d
- evidence TechSpec: docs/qa/evidence/po-hrm-jd-yctd-ref-techspec-01.md

task:
1. DB_DESIGN delta — confirm ONE physical soft FK: job_requisitions.job_template_id
   ↔ logical job_description_id (alias only; cấm invent cột SoT song song)
2. Document optional YCTD snapshot text cols (job_description/requirements) as one-way ≠ values_json SoT
3. Status/bindable semantics table; retire JD ≠ CASCADE delete YCTD history
4. FORBIDDEN: job_postings as JD SoT; REC-03 tables GĐ1
5. Pointer/DOC-DELTA in DB_DESIGN_HRM_ENTERPRISE.md — no wipe stubs
6. evidence_path: docs/qa/evidence/po-hrm-jd-yctd-ref-db-01.md
7. next_dispatch_prompt for sa PO-HRM-JD-YCTD-REF-API-01
8. ack_status: PASS_TO_PM
9. Append bus brief

cấm: apps/** · seed · jd_dynamic_done · dual physical FK · open campaign/job_postings SoT
```
