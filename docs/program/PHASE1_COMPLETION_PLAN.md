# Kế hoạch hoàn thành Phase 1 — XeVN OS (245 UC)

**Owner:** PM  
**Ngày:** 2026-05-22 (WBS PMP: 2026-05-24)  
**Điều phối:** [`PHASE1_PMP_PROJECT_PLAN.md`](./PHASE1_PMP_PROJECT_PLAN.md) · [`PM_ORCHESTRATION_PLAYBOOK.md`](./PM_ORCHESTRATION_PLAYBOOK.md)  
**Nguồn sự thật:** [`LO_TRINH_PHASE_1_2_XEVN.md`](../ecosystem/LO_TRINH_PHASE_1_2_XEVN.md) · [`PHASE1_UC_SRS_TECHSPEC_MATRIX.md`](../ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md) · [`PHASE1_EXECUTION_BOARD.md`](../ecosystem/PHASE1_EXECUTION_BOARD.md) · [`PHASE1_GATE_REPORT.md`](../qa/PHASE1_GATE_REPORT.md)

---

## 1. Đích Phase 1 (Definition of Done)

| # | Tiêu chí | Chỉ số đích | Evidence bắt buộc |
|---|----------|-------------|-------------------|
| G1 | **245 UC** đóng trạng thái | Mỗi UC: `e2e_pass` **hoặc** `waived` (có `evidence_path` + expiry) | `phase1-impl-status.json` + ma trận regenerate |
| G2 | Khối **A — XBOS** | **104/104** `e2e_pass` | `pnpm verify:capabilities` · `FE_MOCK_TO_API_AUDIT.md` |
| G3 | Khối **C — HRM** | **119/119** QA sign-off (≥ `fe` + L2 route) | `PILOT_BUSINESS_FLOW_MATRIX.md` · `mobile-hrm-smoke.mjs` |
| G4 | Khối **B — DM-LOG** | **22/22** checklist PASS | `XBOS-DM-LOG-19` evidence |
| G5 | **183 danh mục** | Publish version + seed trên XBOS | `seed:phase1:logistic-catalog` · `seed:hrm:group-employee-catalog` |
| G6 | **Mobile HRM** | **15/15** `UC-HRM-MOB-*` = `e2e_pass` | `MOBILE_BACKLOG.md` (đã DONE — giữ regression) |
| G7 | Gate tự động | `pnpm phase1:gate` exit 0 | `PHASE1_GATE_REPORT.md` |
| G8 | Zero-defect pilot | L0→L3 PASS; P-CC-01..08 PASS | `docs/qa/evidence/*` |
| G9 | Traceability | 245 UC map test ≥ `partial` | `pnpm test:uc:catalog` (hiện 244/245 P1) |

**Ngoài scope Phase 1:** 128 UC Logistic nghiệp vụ (`LG-*`, `LG-MB-*`) → Phase 2.

---

## 2. Hiện trạng (baseline 2026-05-22)

### 2.1 impl_status (245 UC)

| Status | Số UC | Ý nghĩa | Việc còn lại |
|--------|------:|---------|--------------|
| `planned` | **111** | Chưa code | BE + FE + data + E2E |
| `be` | **54** | API có, chưa UI/E2E | FE nối + QA |
| `data` | **50** | Seed/catalog | Publish + verify + E2E |
| `fe` | **14** | UI nối API | E2E + QA |
| `e2e_pass` | **15** | Đã smoke | Giữ regression |
| `waived` | **1** | `UC-HRM-27` | PM duyệt waiver hoặc implement |

### 2.2 Pilot Command Center (L2)

| Route | Trạng thái |
|-------|------------|
| P-CC-01..04 | **PASS** |
| P-CC-05..08 | **READY_FOR_QA** (bảo hiểm, TD, chấm công, lương) |
| Chi tiết NV (`useEmployee`) | **FIXED** — QA retest HRM-EMBED-D7 |

### 2.3 Test automation (L4)

| Metric | Giá trị |
|--------|---------|
| P1 UC có ≥1 test layer | **244/245 (99,6%)** |
| P1 UC `covered` trực tiếp | **14/245 (5,7%)** |
| Gap P1 | `UC-ECO-MASTER-02` = `none` |

### 2.4 Waves trên board (ghi chú)

`phase1-impl-status.json` ghi W0–W4 `completed` — **không đồng nghĩa 111 UC `planned` đã xong**. PM dùng **ma trận impl_status** làm backlog thực tế, không chỉ cờ wave.

---

## 3. Nguyên tắc điều phối

1. **Không nhảy wave:** S1 auth/tenant → S2 RACI/WF → S3 DM → S4 HRM catalog → S5 HRM app → S6 CAT → S7 DM-LOG.
2. Mỗi packet handoff: `work_item_id`, `from_role`, `to_role`, `entry_criteria`, `exit_criteria`, `evidence_path`, `ack_status`.
3. Sau mỗi Dev: **QA retest bắt buộc** → QC trước khi PM ghi `e2e_pass`.
4. Cập nhật tracking: `pnpm docs:phase1:matrix` sau mỗi sprint; override trong `phase1-impl-status.json`.

---

## 4. Lộ trình sprint — ai làm gì

### Sprint 0 — Ổn định pilot (≈ 3–5 ngày) · **BLOCKER release nội bộ**

| work_item_id | Role | Giao việc cụ thể | Exit / evidence |
|--------------|------|------------------|-----------------|
| **P1-S0-QA-01** | **QA** | Retest P-CC-05..08 + HRM-EMBED-D7; chạy L0–L2; ghi `pilot-business-flow-*.md` | Tất cả P-CC-01..08 = PASS |
| **P1-S0-FE-01** | **Dev-FE** | Embed HRM: insurance, recruitment, attendance, payroll — `shouldSkipSupabase`, `resolveIdentityScope`, `page_size≤100` (mẫu P-CC-03/04) | PR + vitest hrm |
| **P1-S0-FE-02** | **Dev-FE** | Sửa `web-portal/vitest.config.ts` (callback merge) | `pnpm -C apps/web/web-portal test` PASS |
| **P1-S0-QC-01** | **QC** | Re-gate HRM embed toàn bộ 8 route; **NO-GO** nếu còn 54321/409 | `qc-hrm-embed-full-*.md` |
| **P1-S0-PM-01** | **PM** | Dispatch tuần tự; cập nhật bus + `PILOT_BUSINESS_FLOW_MATRIX` | — |

**Phụ thuộc:** DevOps L0 stack (`qc:dev-stack`) — **DevOps** giữ stack local/VPS pilot.

---

### Sprint 1 — Khối A: XBOS `planned` → `be` (≈ 3 tuần)

**Mục tiêu:** Giảm `planned` khối A từ ~70 xuống <20; tăng `be` lên ~90.

| work_item_id | Role | Phạm vi UC / module | Deliverable |
|--------------|------|---------------------|-------------|
| **P1-S1-SA-01** | **SA** | OpenAPI + boundary M01 (catalog, KPI, audit, org) | Cập nhật `TECHSPEC_HE` §4–9; contract CI xanh |
| **P1-S1-BA-P-01** | **BA-Process** | Gói UC: `UC-XBOS-03`…`07`, `UC-XBOS-SYNC-01`, `UC-XBOS-MET-01` | BR matrix + acceptance + test hints |
| **P1-S1-BA-D-01** | **BA-Data** | Master data contracts: `UC-XBOS-MD-01`…`07`, `UC-XBOS-08` | Data contract matrix |
| **P1-S1-BE-01** | **Dev-BE** | Catalog CRUD + publish (`UC-XBOS-02`…`05`) | Controller specs + UAT phase mới |
| **P1-S1-BE-02** | **Dev-BE** | KPI engine (`UC-XBOS-KPI-01`…`04`) — align `companyId` scope | Jest + rollup smoke |
| **P1-S1-BE-03** | **Dev-BE** | Org/RBAC (`UC-XBOS-ORG-*`, `UC-XBOS-11`…`12`) | API + tenant isolation test |
| **P1-S1-BE-04** | **Dev-BE** | Audit + alerts (`UC-XBOS-06`, `UC-XBOS-07`) | `platform_audit_events` emit |
| **P1-S1-BE-05** | **Dev-BE** | `UC-ECO-MASTER-02` (gap test catalog duy nhất P1) | Spec + map L4 `covered` |
| **P1-S1-QA-01** | **QA** | Mở rộng `test:system:uat` theo module BE vừa ship | Report JSON |
| **P1-S1-TM-01** | **Technical Manager** | Review SOLID + security trên PR khối A | Sign-off note trên bus |

**Song song FE (không chờ hết BE):**

| work_item_id | Role | Giao việc |
|--------------|------|-----------|
| **P1-S1-FE-01** | **Dev-FE** | `FE_MOCK_TO_API_AUDIT.md` — KPI rail, dashboard strict mode (UC-CC-P0-09) |
| **P1-S1-FE-02** | **Dev-FE** | Workflow canvas: giảm mock graph; instances API |
| **P1-S1-FE-03** | **Dev-FE** | Template phòng ban CRUD khi BE có (`INITIAL_DEPT_SYSTEM_TEMPLATES`) |

---

### Sprint 2 — Khối A: `be` → `e2e_pass` + Capability gate (≈ 2 tuần)

| work_item_id | Role | Giao việc | Đích |
|--------------|------|-----------|------|
| **P1-S2-FE-01** | **Dev-FE** | Command Center: mọi nút trong `ACTION_BUTTON_INVENTORY` → API hoặc disabled có lý do | `verify-capability-e2e.mjs` PASS |
| **P1-S2-QA-01** | **QA** | E2E capability registry; cập nhật impl_status A → `e2e_pass` từng cụm UC | **104 XBOS UC** đạt G2 |
| **P1-S2-QC-01** | **QC** | Audit `ECOSYSTEM_CAPABILITY_GATE.md` | GO khối A |
| **P1-S2-BA-P-01** | **BA-Process** | `UC-XBOS-CAT-01`…`07` governance — acceptance đồng bộ HRM | Sign-off CAT |

---

### Sprint 3 — Khối C: HRM 119 UC (≈ 4 tuần)

**Baseline:** Mobile 15 UC đã `e2e_pass`; embed CC còn tab mock.

| work_item_id | Role | Giao việc | UC nhóm |
|--------------|------|-----------|---------|
| **P1-S3-BA-P-01** | **BA-Process** | Pilot trace mở rộng: P-CC-03..08 → full SRS branches | `UC-HRM-21`…`27` |
| **P1-S3-BA-D-01** | **BA-Data** | 72 DM HRM — verify `effectiveItems` trên form nhập HS | `DANH_MUC_XBOS_CHO_HRM.md` |
| **P1-S3-BE-01** | **Dev-BE** | 54 UC `be`: hoàn thiện contract thiếu (recruitment, insurance, tasks…) | OpenAPI hrm-api |
| **P1-S3-BE-02** | **Dev-BE** | `GET /employees/:id` (thay list-scan trong embed detail) | HRM-EMBED-D7 harden |
| **P1-S3-FE-01** | **Dev-FE** | HRM embed: mọi hook → API mode trong CC; audit `hrmDataMode` | `apps/web/hrm` |
| **P1-S3-FE-02** | **Dev-FE** | Web HRM standalone (nếu còn mock tab P3) | `FE_MOCK` § HRM Workspace |
| **P1-S3-MOB-01** | **Dev-Mobile** | Regression MOB-*; không feature mới trừ defect P1 | `mobile-hrm-smoke.mjs` |
| **P1-S3-QA-01** | **QA** | `simulate-hrm-uat-business-flow.ps1` + matrix 119 UC | Báo cáo sign-off khối C |
| **P1-S3-QA-02** | **QA** | Unit block specs: attendance, payroll, leave, employees (tăng L4 `covered`) | Target +30 UC `partial`→`covered` |
| **P1-S3-QC-01** | **QC** | Go/No-Go HRM pilot `ceo@xe.vn` | `MOBILE_QC_PILOT_CHECKLIST.md` |

**Quyết định PM:** `UC-HRM-27` — implement hoặc waiver có hạn (đã có draft trong `FE_MOCK_TO_API_AUDIT`).

---

### Sprint 4 — Khối B + 183 DM (≈ 2 tuần)

| work_item_id | Role | Giao việc | Đích |
|--------------|------|-----------|------|
| **P1-S4-DO-01** | **DevOps** | Chạy seed pipeline W2: `seed:phase1:logistic-catalog`, `seed:hrm:group-employee-catalog`, tourism pilot | DB evidence |
| **P1-S4-BA-D-01** | **BA-Data** | Checklist 183 mục: tenant, version, phân hệ | Spreadsheet + JSON export |
| **P1-S4-BA-P-01** | **BA-Process** | 22 UC `XBOS-DM-LOG-*` — kịch bản UAT cấu hình (không vận đơn) | `XBOS-DM-LOG-19` PASS |
| **P1-S4-BE-01** | **Dev-BE** | DM-LOG APIs còn `planned` trong ma trận | `be` → `data` |
| **P1-S4-QA-01** | **QA** | Script verify thiếu danh mục trước nghiệp vụ HRM | Gate G5 |

---

### Sprint 5 — Gate đóng Phase 1 (≈ 1 tuần)

| work_item_id | Role | Giao việc | Đích |
|--------------|------|-----------|------|
| **P1-S5-QA-01** | **QA** | Full regression: `test:system:uat`, `test:pilot:flows`, `test:uc:catalog`, `phase1:gate` | G7, G9 |
| **P1-S5-QA-02** | **QA** | Cập nhật `PHASE1_GATE_REPORT.md`; đẩy impl_status còn `planned` → đích | G1 |
| **P1-S5-QC-01** | **QC** | Go/No-Go Phase 1 — checklist pre-merge + pilot matrix | **GO** hoặc GO WITH CONDITIONS |
| **P1-S5-PM-01** | **PM** | Ký bus; chốt Phase 2 discovery; archive evidence | Release note P1 |
| **P1-S5-SA-01** | **SA** | Architecture sign-off NFR (observability, tenant, OpenAPI) | SA note |
| **P1-S5-TM-01** | **Technical Manager** | Security + convention gate cuối | TM sign-off |

---

## 5. Ma trận RACI tóm tắt (theo hoạt động)

| Hoạt động | PM | SA | BA-P | BA-D | BE | FE | Mobile | QA | QC | TM | DevOps |
|-----------|:--:|:--:|:----:|:----:|:--:|:--:|:------:|:--:|:--:|:--:|:------:|
| Ưu tiên sprint | **A** | C | C | C | I | I | I | I | I | C | I |
| SRS/acceptance | I | C | **A** | **A** | I | I | I | C | I | I | — |
| API implement | I | C | C | C | **A** | — | C | I | — | C | I |
| Portal/HRM UI | I | C | C | — | I | **A** | C | I | — | C | — |
| Mobile HRM | I | C | C | — | C | — | **A** | C | C | C | — |
| Seed/DM 183 | I | I | C | **A** | C | — | — | C | I | — | **A** |
| Test L0–L4 | I | I | C | — | C | C | C | **A** | C | I | **A** |
| Go/No-Go | **A** | C | — | — | — | — | — | C | **A** | C | C |

*A = accountable, R = responsible (role **A** trong bảng = chủ trì).*

---

## 6. Lệnh & artifact (agent chạy — user không cần CLI)

```bash
pnpm run qc:dev-stack
pnpm run test:system:uat
pnpm run test:pilot:flows
pnpm run test:uc:catalog
pnpm docs:phase1:matrix
pnpm run phase1:gate
node scripts/mobile-hrm-smoke.mjs
```

| Artifact | Đường dẫn |
|----------|-----------|
| Ma trận UC | `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md` |
| Tracking override | `docs/ecosystem/phase1-impl-status.json` |
| Mock→API | `docs/ecosystem/FE_MOCK_TO_API_AUDIT.md` |
| Pilot matrix | `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` |
| UC test strategy | `docs/qa/UC_373_TEST_STRATEGY.md` |
| Bus dispatch | `.cursor/team/AGENT_MESSAGE_BUS.md` |

---

## 7. Ước lượng thời gian (1 squad + agent)

| Sprint | Tuần | UC / hạng mục chính |
|--------|-----:|---------------------|
| S0 Pilot | 1 | P-CC-05..08, QC embed |
| S1 XBOS BE | 3 | ~50 UC `planned`→`be` |
| S2 XBOS E2E | 2 | 104 UC `e2e_pass` |
| S3 HRM | 4 | 119 UC QA sign-off |
| S4 DM | 2 | 183 DM + 22 DM-LOG |
| S5 Gate | 1 | G1–G9 |
| **Tổng** | **~13 tuần** | Song song S1 FE + S3 Mobile regression |

*Khớp lộ trình “thực tế 7–9 tháng” trong `LO_TRINH` nếu chỉ 0.5 FTE; 13 tuần ≈ full-focus squad.*

---

## 8. Thứ tự dispatch PM (tuần này)

1. **P1-S0-FE-01** + **P1-S0-QA-01** (song song sau merge FE)  
2. **P1-S0-QC-01**  
3. **P1-S1-BE-01** + **P1-S1-BA-P-01** (kickoff khối A)  
4. **P1-S1-FE-01** (mock KPI/dashboard)  
5. Cuối tuần: review `impl_status` — mục tiêu `planned` < 100.

---

## 9. Rủi ro & mitigation

| Rủi ro | Owner | Mitigation |
|--------|-------|------------|
| Wave board “completed” che backlog 111 UC | PM | Báo cáo hàng tuần theo `impl_status` |
| Embed HRM còn Supabase | Dev-FE | Pattern `hrmDataMode` + QA bắt 54321 = FAIL |
| Scope creep Logistic P2 | PM + SA | Không ghi `e2e_pass` cho `LG-*` |
| 373 unit test hiểu nhầm | QA | Chỉ L4 catalog + module specs; không hứa 245 files |
| VPS/SSH agent không tới | DevOps | Pilot local; VPS khi user mở network |

---

*Tài liệu này là bản dispatch Phase 1. Cập nhật khi `pnpm docs:phase1:matrix` thay đổi số liệu.*
