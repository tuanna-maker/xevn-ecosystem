# QA-HRM-G-DB-01-HIRE-BIND-01 — J-HRM-INT-01 hire bind (U65 browser)

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-HRM-G-DB-01-HIRE-BIND-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **priority** | P0 |
| **journey** | **J-HRM-INT-01** |
| **date** | 2026-07-21 ~21:44–21:52 ICT |
| **URL** | `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` (session JWT already present from prior UAT) |
| **U65** | zero-seed · browser FE only · **cấm** API-only PASS |
| **ack_status** | **PASS_TO_PM** |
| **spec_ref** | SRS §3.33 FR-HRM-INT-01 · TechSpec §17.3 G-DB-01 |
| **entry** | `d-do-sync-8088-fe-hire-bind-01` · `d-do-sync-8088-g-db-01-conv-01` · `fe-hrm-g-db-01-hire-bind-01` · `be-hrm-g-db-01-hire-link-01` |

---

## Executive summary

On Dev8088 after FE+BE hire-bind sync: marking pool candidate **Đã tuyển** without hồ sơ opens **Gắn hồ sơ nhân viên** dialog with VI copy of `HRM-REC-HIRE-400` and **Xác nhận** disabled (FE blocks before PATCH — no orphan hired). Selecting `PORTAL-GCEO` → PATCH `/candidates-pool/:id/stage` **200** with `employee_id` stamped; F5 dashboard **Đã tuyển 1**; list GET still shows `stage=hired` + same `employee_id`. Soft must_keep: G-RC-01 **Số lượng *** still on Thêm yêu cầu; leave **Tạo yêu cầu nghỉ** still on Nghỉ phép.

**Not claimed:** Phase1 DONE · PROD · matrix UF 🟢 promote.

---

## Preflight (L0 / sync markers)

| Check | Result |
|-------|--------|
| Portal session `xevn.portal.accessToken` | present |
| `GET …/hr/src/lib/recruitmentHireLink.ts` | **200** · hire markers live |
| DevOps FE sync | entry PASS |
| DevOps BE hire+conv sync | entry PASS |

Surface used (avoid embed soft-nav thrash):  
`http://14.225.217.232:8088/hr/recruitment?tenantId=xevn&companyId=main&_cb=qa-hire-bind-01`

---

### UF / J-HRM-INT-01 — Hire stage binds employee_id

- **Persona / URL / click path:** `ceo@xe.vn` → standalone `/hr/recruitment` → **Ứng viên** → **Tất cả ứng viên** → stage dropdown on `QA Pool 1780114706910`
- **Trước mutate:** pool list **5**; tab **Đã tuyển 0**; candidate stage **Chờ CV / Mới** (id `289a9388-22c5-49be-a795-f498a0c72436`)
- **Negative:** chọn stage **Đã tuyển** không chọn hồ sơ
  - Dialog **Gắn hồ sơ nhân viên** mở
  - Copy VI: *«Chốt tuyển cần gắn hồ sơ nhân viên. Chọn hoặc tạo hồ sơ cùng đơn vị rồi thử lại.»* (FR-HRM-INT-01 / `HRM-REC-HIRE-400`)
  - **Xác nhận chốt tuyển** = **disabled** → **không** PATCH stage; stage row vẫn **Chờ CV / Mới**; **Đã tuyển** vẫn 0 (no orphan hired)
- **Happy:** chọn **PORTAL-GCEO — CEO Tập đoàn** → **Xác nhận chốt tuyển**
  - Network: `PATCH /api/hrm/recruitment/candidates-pool/289a9388-22c5-49be-a795-f498a0c72436/stage?company_id=main`
  - Request body: `{"stage":"hired","employee_id":"678b9cb2-c59a-4b1e-b257-ce93033ba2f3"}`
  - Response: **200** `HRM-REC-CP-200` · `data.stage=hired` · `data.employee_id=678b9cb2-…`
  - **FE sau 2xx:** tabs **Ứng tuyển 4** / **Đã tuyển 1**; dialog đóng
- **F5:** reload `/hr/recruitment?…&_cb=qa-hire-bind-f5` → pipeline **Đã tuyển 1**; GET pool **200** row still `hired` + same `employee_id`
- **Verdict:** 🟢
- **spec_ref:** SRS §3.33 FR-HRM-INT-01 Diễn biến #3/#5/#7 · TechSpec §17.3 G-DB-01
- **spec_gap:** none

---

## must_keep smoke (no full retest)

| Area | Action | Result |
|------|--------|--------|
| **G-RC-01** | Yêu cầu → **Thêm yêu cầu** | Field **Số lượng *** present (spinbutton) — UI intact |
| **Leave create** | Attendance → **Nghỉ phép** | Button **Tạo yêu cầu nghỉ** + list counters visible — UI intact |

---

## Gate table

| AC | Result |
|----|--------|
| Negative: dialog/toast VI · no orphan hired (FE block before POST **or** 400) | **PASS** (FE dialog + disabled confirm; no PATCH) |
| Happy: select employee_id → PATCH/POST 2xx · stamped · F5 còn | **PASS** (PATCH 200 + F5) |
| must_keep G-RC-01 / leave create (smoke) | **PASS** (UI present) |
| U65 no seed · browser-only | **PASS** |
| Phase1/PROD claim | **not claimed** |

---

## Residual

1. Soft UX: hire picker capped **100/1108** hồ sơ — thu hẹp đơn vị nếu cần NV ngoài cap (không fail AC).
2. Soft: known embed soft-nav thrash — mutate verified on standalone `/hr/recruitment` with portal JWT (same pattern as G-RC-01-R3).
3. **No FE residual** for hire-bind happy/negative on this wave.

---

## completion_report

**Closed:** J-HRM-INT-01 browser U65 on `:8088` — negative FE gate + happy PATCH 200 `employee_id` + F5 persistence; must_keep menus still open.

**Residual:** soft picker cap + soft-nav note only; no P0 product gap.

**Not claimed:** Phase1 DONE · PROD · UF matrix promote.

---

## Handoff

- **next_owner:** `pm` (optional `qc` gate if wave release-scoped)
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/qa-hrm-g-db-01-hire-bind-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QC-HRM-G-DB-01-HIRE-BIND-01
from_role: pm
to_role: qc
lane: governance
priority: P1

## Entry
QA PASS_TO_PM: docs/qa/evidence/qa-hrm-g-db-01-hire-bind-01-20260721.md
J-HRM-INT-01: negative FE dialog VI + happy PATCH 200 employee_id + F5
FE/BE/DevOps sync: d-do-sync-8088-fe-hire-bind-01 · d-do-sync-8088-g-db-01-conv-01

## Job
1. Audit evidence pack completeness (UF block + Network 2xx + F5 + U65)
2. Confirm no seed / no Phase1-PROD claim
3. GO / GWC / NO-GO; residual soft picker-cap optional only
4. Evidence: docs/qa/evidence/qc-hrm-g-db-01-hire-bind-01-20260721.md

entry_criteria: QA PASS hire-bind
exit_criteria: QC verdict recorded
```
