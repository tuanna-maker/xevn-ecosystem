# B-Minutes Customer Retest + Spec↔Code Full Trace — Program

| Field | Value |
|-------|--------|
| **program_id** | `P1-BMINUTES-CUST-RETEST-01` |
| **opened** | 2026-07-22 |
| **source** | `B-Minutes AI - Trợ lý phòng họp thông minh.pdf` (biên bản rà soát HRM) |
| **sponsor** | Retest đúng mong muốn khách + đối chiếu BRD↔SRS↔TechSpec↔FE/BE/DB; tách sub-task song song (U69) |
| **U65** | Zero-seed · browser FE→BE |
| **U67** | B-Minutes SoT cho UF khách |
| **Standing** | **NOT** Phase1 / PROD / «SRS đủ 100% ecosystem» cho đến QC GWC có evidence |

---

## 1. Customer asks (from PDF) → work packages

| ID | Khách nói | Package | Owner lane |
|----|-----------|---------|------------|
| **BM-01** | Connect / template danh mục | Defer sponsor Connect (T8) | pm note |
| **BM-02** | Chuyển vai trò / tab công ty rõ | UX role-switch | ba → fe |
| **BM-03** | Workflow **động** (chức danh, cấp trên, song song) — không fix cứng người | WF designer | ba+sa → be+fe |
| **BM-04** | HĐLĐ: lương thử việc, phụ cấp tách, lịch sử | Contracts | ba → be+fe |
| **BM-05** | Tuyển dụng: **thư viện JD**, chọn JD; dashboard trạng thái UV | Recruitment | ba+qa → fe/be |
| **BM-06** | XBOS cấu hình tuyển dụng → **áp dụng đơn vị thành viên** → HRM chạy đúng **WF gán** | XBOS→HRM bridge | sa+be+fe+qa |
| **BM-07** | Chức vụ trong Setting; chọn NV hiện chức vụ | Catalog/position | ba-data+fe+qa |
| **TRACE-*** | BRD↔SRS↔TechSpec↔code↔test FE→BE (HRM spine trước; XBOS/CC inventory song song) | Governance | ba/sa/tm/qa |

---

## 2. Wave 0 — parallel discovery (U69) — **NOW**

| Sub-task | work_item_id | Role | Exit |
|----------|--------------|------|------|
| AC matrix từ PDF | `BM-BA-AC-MATRIX-01` | ba-process | AC testable + `spec_says / code_does` draft |
| SoT XBOS publish→member→HRM WF | `BM-SA-XBOS-HRM-REC-TRACE-01` | sa | **PASS_TO_PM** 2026-07-22 — evidence `docs/qa/evidence/bm-sa-xbos-hrm-rec-trace-01-20260722.md` · gaps **G-BM-REC-01..06** |
| Inventory JD / position / WF UI | `BM-EXP-FE-JD-POS-WF-01` | explore | File path + PASS/FAIL existence |
| Inventory BE bridge + WF assignee types | `BM-EXP-BE-WF-BRIDGE-01` | explore | Endpoint + assigneeType matrix |
| Ecosystem SRS coverage (not claim done) | `BM-BA-ECO-SRS-COVERAGE-01` | ba-docs | Heatmap XBOS/CC/HRM vs BRD; % + gaps |
| **Browser E2E P0** | `BM-QA-REC-E2E-8088-01` | qa | U65: XBOS catalog/process → member → HRM YCTD+JD+WF |

## 3. Wave 1 — fix gaps (sau matrix)

Dev-BE / Dev-FE / DevOps sync :8088 — **một gap = một work_item narrow**.

## 4. Wave 2 — QA L2.5 + QC

Mỗi BM-* có UF/J-* + AC post-mutation FE; QC GWC; **không** claim Phase1/PROD.

## 5. Prior art (reuse — không đè 🟢)

- `XBOS_HRM_RECRUITMENT_WORKFLOW_BRIDGE_PROGRAM.md`
- HRM JD tab `JobTemplatesTab` / `job-templates` API
- G-RC-01 headcount · G-DB-01 hire · G-DB-04 dual catalog
- UF-HRM-12 · J-HRM-05 · J-REC-WF-*

## 6. Cấm

Seed · API-only PASS · wipe UF 🟢 · claim «SRS đủ cả ecosystem» khi heatmap còn 🔴 · Phase1/PROD
