# Phase 1 — WBS điều phối team (245 UC)

**Ngày:** 2026-05-29  
**Owner:** PM  
**SoT nghiệp vụ:** SRS + TechSpec (đã có) — **không** viết lại spec  
**SoT tracking:** `docs/ecosystem/phase1-impl-status.json` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md`

---

## 0. Verdict — có cần WBS execution không?

| Lớp | Trạng thái | Ghi chú |
|-----|------------|---------|
| **G1 — 245 UC ma trận** | **DONE** | 243 `e2e_pass` + 2 `waived` |
| **G2–G9 — Program DoD** | **Mở residual** | Gate strict + persona + Production |
| **HTTPS pilot wave** | **DONE** | Probe 23/23, QC GO JWT |

→ **Đóng gói G1:** [`PHASE1_CLOSURE_PACKAGE.md`](./PHASE1_CLOSURE_PACKAGE.md)  
→ **WBS dưới đây:** chỉ việc **còn lại** để ký **Phase 1 Program DONE** (không làm lại 245 UC từ đầu).

---

## 1. Mô hình team (theo yêu cầu sponsor)

| Lane | Role | Trách nhiệm | Không làm |
|------|------|-------------|-----------|
| **Governance** | SA | ADR drift, API parity, NFR; review sau wave | Code `apps/**` |
| **Governance** | BA-P / BA-D | AC delta khi QA `spec_gap`; trace matrix | Pack SRS mới |
| **Governance** | PM | WBS, bus, dispatch, closure | Implement |
| **Governance** | TA = **TM + QC** | TM: SOLID + unit test policy; QC: GO/NO-GO | Delivery code |
| **Execution** | **Dev-BE Lead** | Tiến độ API, scope parity, jest xbos/hrm | — |
| **Execution** | Dev-FE | Portal + HRM embed | — |
| **Execution** | Dev-Mobile | 15 UC mobile regression | — |
| **Execution** | DevOps | Stack, seed, deploy pilot/prod | — |
| **Execution** | **QA** | L0→L2.5, nghiệp vụ thật, matrix + J-* | Đổi SRS |
| **Execution** | **QC** | Gate, residual đóng | — |

**Cadence:** Dev song song tối đa 3 Task · sau mỗi wave → QA → QC → PM cập nhật artifact.

---

## 2. WBS residual (Program DONE — không trùng 245 UC đã đóng)

### Epic P1-R0 — Xác nhận đóng G1 (1–2 ngày)

| ID | Owner | Deliverable | Exit |
|----|-------|-------------|------|
| P1-R0-PM-01 | PM | Publish `PHASE1_CLOSURE_PACKAGE.md` + bus | Sponsor nhận gói |
| P1-R0-QA-01 | QA | `pnpm docs:phase1:matrix` + đối chiếu 245 dòng | Matrix = JSON |
| P1-R0-QC-01 | QC | Audit G1 — không bulk waive lậu | G1 sign note |

### Epic P1-R1 — Gate tự động & unit test (TA/Dev-BE) (3–5 ngày)

| ID | Owner | Deliverable | Exit |
|----|-------|-------------|------|
| P1-R1-DO-01 | DevOps | `qc:dev-stack` ổn định local + VPS | L0 PASS |
| P1-R1-BE-01 | **Dev-BE Lead** | `pnpm --filter hrm-api test` + `xbos-api test` green | Jest 0 fail |
| P1-R1-TM-01 | **TM** | Review unit test policy: critical modules có spec | TM sign-off note |
| P1-R1-QA-01 | QA | `pnpm phase1:gate --strict` | exit 0 |
| P1-R1-QC-01 | QC | G7 sign-off | MET |

### Epic P1-R2 — UAT nghiệp vụ thật (QA) (5–7 ngày)

| ID | Owner | Deliverable | Exit |
|----|-------|-------------|------|
| P1-R2-QA-01 | **QA** | `test:system:uat` + `PILOT_BUSINESS_FLOW_MATRIX` P-CC-01..09 | L1 PASS |
| P1-R2-QA-02 | **QA** | `PROGRAM_JOURNEY_MAP` J-HRM-01..07 click L2.5 | L2.5 PASS |
| P1-R2-QA-03 | **QA** | Persona: member CEO + HRBP (nếu trong scope UAT) | Evidence paths |
| P1-R2-BA-01 | BA-P | Chỉ khi QA `spec_gap` | AC delta 1 trang |
| P1-R2-QC-01 | QC | G8 sign-off | GWC hoặc GO |

### Epic P1-R3 — Production readiness (DevOps + QC) (song song, 2–3 tuần)

| ID | Owner | Deliverable | Exit |
|----|-------|-------------|------|
| P1-R3-DO-01 | DevOps | `verify:production-env` VPS + runbook | exit 0 |
| P1-R3-DO-02 | DevOps | VPS git sync thay pscp lẻ (C-JCC03-04) | Full tree deploy |
| P1-R3-SA-01 | SA | ADR production topology | ADR ngắn |
| P1-R3-QC-01 | QC | PROD-READY gate | GO / GWC |
| P1-R3-PM-01 | PM | `SERVICE_READINESS` cột PROD | Không 🔴 toàn bộ |

### Epic P1-R4 — Program sign-off (1 ngày)

| ID | Owner | Deliverable | Exit |
|----|-------|-------------|------|
| P1-R4-QC-01 | QC | **P1-S5-QC-02** program GO | Bus + report |
| P1-R4-PM-01 | PM | `PROJECT_STATUS_REPORT` = Phase 1 Program DONE | User brief |

---

## 3. Dev-BE Lead — checklist tiến độ (coding)

| # | Việc | Lệnh / evidence |
|---|------|-----------------|
| 1 | Không merge UC mới ở `planned` | Matrix grep |
| 2 | Scope parity list/get | `hrm-list-scope.spec.ts` mỗi module |
| 3 | Jest monorepo xanh trước QA | hrm-api + xbos-api |
| 4 | Handoff OpenAPI delta | Bus `READY_FOR_QA` |
| 5 | Không đổi contract không có BA/SA ack | Governance |

---

## 4. QA — rule test (bắt buộc mỗi wave)

| Lớp | Lệnh / artifact | PASS khi |
|-----|-----------------|----------|
| L0 | `pnpm run qc:dev-stack` | 200 all |
| L1 | `pnpm run test:system:uat` | exit 0 |
| L2 | `PILOT_BUSINESS_FLOW_MATRIX` | không ERROR banner |
| L2.5 | `PROGRAM_JOURNEY_MAP` J-* | click path |
| L3 | QC evidence | GO/GWC |

QA **đọc SRS FR-{mã}** cho UC trong wave trước khi ký PASS.

---

## 5. TA (TM + QC) — unit test & gate

| Role | Việc |
|------|------|
| **TM** | Mỗi PR BE: có spec; auth/scope có regression; không silent catch |
| **QC** | Không GO nếu thiếu J-* / probe fail / Production 🔴 |

---

## 6. SA / BA — chỉ khi trigger

| Trigger | Role |
|---------|------|
| QA `spec_gap` | BA-P hoặc BA-D |
| Arch drift / scope parity lặp | SA |
| Waiver UC | PM + QC + BA |

---

## 7. Không nằm trong WBS này

- Viết lại 245 UC SRS (đã có)
- 373 UC toàn chương trình
- Phase 2 Logistics 128 UC

---

## 8. Kích hoạt

PM dispatch: **`điều phối team đi`** + work_item `P1-R1-*` từ epic trên.  
Theo dõi: `docs/program/TEAM_WORKING_NOW.md`
