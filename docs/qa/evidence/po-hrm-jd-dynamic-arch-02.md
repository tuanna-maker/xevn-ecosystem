# Evidence — PO-HRM-JD-DYNAMIC-ARCH-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-DYNAMIC-ARCH-02` |
| **role** | sa |
| **date** | 2026-08-06 |
| **lane** | governance |
| **ack_status** | `PASS_TO_PM` |
| **deliverable** | `docs/program/specs/PO-HRM-JD-DYNAMIC-ARCH-02.md` |

---

## Exit criteria checklist

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Stamp sponsor confirm A / Q1 / Q6 | **PASS** — ARCH-02 §0 LOCKED |
| 2 | API_DESIGN F.1 F-JD-DEF/LAY/01-04 (+ F-JD-01..04) | **PASS** — §2 mục đích · nghiệp vụ · Diễn biến UC-00a/b/c · DTO↔column |
| 3 | DB_DESIGN physical delta | **PASS** — §3 `rec_jd_*` + `values_json` / `layout_snapshot_json` / `layout_version` |
| 4 | scope_parity · must_keep YCTD · FORBIDDEN job_postings dual-write | **PASS** — §4 |
| 5 | Close residual Q* sponsor-locked; note open with owner | **PASS** — §5 |
| 6 | Deliverable + this evidence | **PASS** |
| 7 | next_dispatch_prompt unlock Dev FE+BE | **PASS** — ARCH-02 §11 |
| — | No `apps/**` | **PASS** |

---

## Sponsor stamp (verbatim intent)

- **Option A:** in-HRM metadata form builder  
- **Q1:** Catalog @ Cài đặt; DnD @ Thư viện JD (+ default layout @ Settings)  
- **Q6:** L1 company default layout + `layout_snapshot` on JD save  

---

## AS-IS gap noted for Dev-BE

- `recruitment.controller.ts`: list/create/patch/delete `job-templates` — **missing GET by id** → F-JD-03 mandatory in `PO-HRM-JD-DYNAMIC-BE-01`.

---

## Artifacts read

- `PO-HRM-JD-DYNAMIC-ARCH-01.md`  
- `PO-HRM-JD-DYNAMIC-SPEC-01.md`  
- `PO-HRM-JD-DYNAMIC-DATA-01.md` §12  
- `PO-HRM-JD-DYNAMIC-TOPCV.md`  
- `SRS_HRM_ENTERPRISE.md` FR-UC-BP-REC-00  
- AS-IS `recruitment-catalog.service.ts` / `recruitment.controller.ts` (read-only)

---

## Residual (non-blocking)

| ID | Owner |
|----|-------|
| R-JD-DATA-04 journey map append | pm |
| ba-docs merge FR-00a/b/c | ba-docs |
| R-JD-DATA-01 XBOS skeleton GĐ2 | pm defer |
| F-JD-03 implement | dev-be |

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | TechSpec v0.2 deepen done; Dev unlock eligible; no apps/** |
| **next_owner** | pm |
| **next_dispatch_prompt** | See ARCH-02 §11 — `PO-HRM-JD-DYNAMIC-BE-01` + `PO-HRM-JD-DYNAMIC-FE-01` parallel |
| **ack_status** | `PASS_TO_PM` |
