# P1-CLOSE-W1 — Acceptance & business rules (BA-Process)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-CLOSE-BA-P-01` |
| **parent_wave** | `P1-CLOSE-W1` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-05-25 |
| **spec_ref** | `P1-CLOSE-W1` · `PHASE1_CLOSEOUT_SPRINT_PLAN.md` |

## Entry / exit

| | Criteria |
|---|----------|
| **entry** | W1 dispatched; G2 baseline **85/104** XBOS `e2e_pass`; U18 QC program **NO-GO**; matrix SoT `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` |
| **exit** | BR matrix (ORG, SYNC, AR, CC-05) + per-UC AC with evidence type + traceability rows for **19 G2 gap** + **top 20 FE** UC; waiver without PM **blocked** |
| **evidence_path** | `docs/program/governance/p1-close-w1-ac-br-20260525.md` |

## SoT & consumers

| Artifact | Role |
|----------|------|
| `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md` | Matrix STT / MOD / impl_status |
| `docs/qa/PHASE1_GATE_REPORT.md` | G2 **85/104** (2026-05-24) |
| `docs/xbos/S1_BA_PROCESS_XBOS_UC03-07.md` | SYNC / catalog BR (không nhân bản) |
| `docs/program/governance/PHASE1_UC_DELTA_AC_BR_20260524.md` | WF / AR / CC delta AC |
| `docs/ecosystem/FE_MOCK_TO_API_AUDIT.md` | Top-20 FE inventory W1–W20 |
| `docs/architecture/P1-TECHSPEC-OPENAPI-DELTA-U18-20260524.md` | CC-05 executive-rail compose |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | J-CC-03, J-XBOS-* |

**Consumers:** `P1-CLOSE-BE-A2`, `P1-CLOSE-FE-A2`, `P1-CLOSE-QA-W1`, PM promotion audit.

---

## 1. Scope W1 (BA)

| Slice | Count | Mục tiêu gate |
|-------|------:|----------------|
| **G2 gap (Khối A)** | **19** | XBOS **104/104** `e2e_pass` |
| **Top FE (Wave A UI)** | **20** | Mock→API; CC rail; AR/DASH; không claim G2 chỉ bằng FE |
| **G1 +40 (execution)** | 40 | QA promote sau BE/FE — AC tham chiếu §5 (subset overlap) |

**Định nghĩa 19 G2 gap (QC-U18-R2):** Mọi UC Khối A (STT 1–97, 367–373) còn `impl_status` ∈ `{be, planned}` **trên matrix 2026-05-24** — đúng **13 planned + 6 be = 19** (các UC `fe`/`data`/`e2e_pass` khác không nằm trong gap G2 đếm).

### 1.1 Danh sách 19 G2 gap

| # | Matrix STT | UC | impl_status | Owner | Dev owner W1 |
|---|------------|-----|-------------|-------|----------------|
| 1 | 8 | `UC-XBOS-SYNC-01` | be | XBOS | Dev-BE — POST bootstrap live |
| 2 | 10 | `UC-XBOS-08` | be | XBOS | Dev-BE — master domain whitelist |
| 3 | 22 | `UC-XBOS-10` | be | XBOS | Dev-BE — business-lines route/seed |
| 4 | 25 | `UC-XBOS-ORG-01` | be | XBOS | Dev-BE — org tree / ADR group overview |
| 5 | 27 | `UC-XBOS-ORG-03` | be | XBOS | Dev-BE — legal-entity profile |
| 6 | 37 | `UC-XBOS-16` | planned | XBOS | Dev-BE + FE — asset request 5-step |
| 7 | 48 | `UC-ECO-SCOPE-01` | planned | Portal | Dev-FE — unauth guard |
| 8 | 58 | `UC-CC-01` | planned | Portal | Dev-FE — dept per legal entity |
| 9 | 59 | `UC-CC-03` | planned | Portal | Dev-FE — member unit detail |
| 10 | 60 | `UC-CC-04` | planned | Portal | Dev-FE — save legal profile |
| 11 | 61 | `UC-XBOS-CC-05` | planned | XBOS | Dev-FE + BE — executive rail |
| 12 | 63 | `UC-XBOS-CC-07` | planned | XBOS | Dev-FE — infra catalog index |
| 13 | 64 | `UC-XBOS-CC-08` | planned | XBOS | Dev-FE — dept templates |
| 14 | 71 | `UC-XBOS-DASH-01` | planned | XBOS | Dev-FE — cockpit |
| 15 | 72 | `UC-XBOS-DASH-02` | planned | XBOS | Dev-FE — KPI board |
| 16 | 73 | `UC-XBOS-DASH-03` | planned | XBOS | Dev-FE — KPI policy |
| 17 | 95 | `UC-ECO-MASTER-01` | planned | Portal | Dev-BE — P2 waiver **chỉ PM** |
| 18 | 96 | `UC-ECO-MASTER-02` | be | XBOS | Dev-BE — tenant bootstrap |
| 19 | 97 | `UC-ECO-FE-01` | planned | Portal | Dev-FE — global mock removal |

### 1.2 Top 20 FE UC (`P1-CLOSE-FE-A2`)

Ánh xạ `FE_MOCK_TO_API_AUDIT.md` W1–W14 + RACI + AR UI + WF canvas (`PHASE1_CLOSEOUT_SPRINT_PLAN.md`).

| # | FE-ID | UC | Matrix STT | Màn / route |
|---|-------|-----|------------|-------------|
| 1 | W11 | `UC-XBOS-CC-05` | 61 | Command Center executive rail |
| 2 | W12 | `UC-XBOS-CC-06` | 62 | CC workflow canvas |
| 3 | W13 | `UC-XBOS-CC-07` | 63 | CC infrastructure catalogs |
| 4 | W14 | `UC-XBOS-CC-08` | 64 | CC dept system templates |
| 5 | W1 | `UC-XBOS-DASH-01` | 71 | `/cockpit` |
| 6 | W2 | `UC-XBOS-DASH-02` | 72 | `/dashboard/kpi-dashboard` |
| 7 | W3 | `UC-XBOS-DASH-03` | 73 | `/dashboard/kpi-policy` |
| 8 | — | `UC-CC-01` | 58 | CC dept config |
| 9 | — | `UC-CC-03` | 59 | Member unit detail |
| 10 | — | `UC-CC-04` | 60 | Legal entity save |
| 11 | REQ-ECO | `UC-ECO-FE-01` | 97 | Toàn portal — mock policy |
| 12 | — | `UC-XBOS-AR-01` | 38 | Asset request list UI |
| 13 | — | `UC-XBOS-AR-02` | 39 | Create asset request |
| 14 | — | `UC-XBOS-AR-03` | 40 | Transition asset request |
| 15 | — | `UC-XBOS-16` | 37 | 5-step accounting WF UI |
| 16 | — | `UC-XBOS-13` | 28 | WF definition (canvas hook) |
| 17 | — | `UC-XBOS-14` | 29 | Multi-hat run |
| 18 | W10 | `UC-ECO-SCOPE-02` | 49 | Global filter / accessible units |
| 19 | — | `UC-RACI-01` | 65 | RACI activity catalog |
| 20 | — | `UC-RACI-02` | 66 | RACI matrix editor |

*Ghi chú:* `UC-XBOS-CC-06` đã `e2e_pass` BE — FE AC vẫn bắt buộc (canvas API mode, không seed-only).

---

## 2. Business rule matrices (condition → action → outcome)

### 2.1 ORG — `UC-XBOS-ORG-01`, `UC-XBOS-ORG-03`, `UC-XBOS-10`

| BR-ID | Condition | Action | Outcome | HTTP / code | Evidence |
|-------|-----------|--------|---------|-------------|----------|
| BR-ORG-01 | Actor JWT thiếu `tenantId` hoặc `companyId` | Từ chối trước service | Không đọc cây | 400 | `SCOPE_TENANT_REQUIRED` / `SCOPE_COMPANY_REQUIRED` | jest `scope-context.spec.ts` |
| BR-ORG-02 | Query `companyId` ≠ JWT claim (cả hai có giá trị) | Từ chối | Không leak cross-company | 409 | `SCOPE_CONTEXT_MISMATCH` | jest + live probe |
| BR-ORG-03 | Group CEO; `companyId=main` trên **master** org-units tree | Không dùng endpoint tree master-only | UI/route dùng **group org overview** (ADR) | 400 hoặc redirect contract | `XBOS-ORG-400` nếu gọi sai route | live + `p1-s5-qa-02` |
| BR-ORG-04 | `PUT legal-entity-profile/:companyId` payload hợp lệ; scope khớp | Lưu MST, đại diện, vốn | Profile đọc lại khớp | 200 | — | live `ceo@xe.vn` |
| BR-ORG-05 | Thiếu trường bắt buộc pháp nhân | Từ chối | Không ghi DB | 400 | validation envelope | jest controller |
| BR-ORG-06 | `companyId` target ∉ membership actor | Từ chối | Không ghi | 403 | — | live member CEO negative |
| BR-ORG-07 | Promote business-line → subsidiary; preconditions đủ | Tạo/link công ty con | Công ty xuất hiện trong `group-member-units` | 200/201 | — | jest + seed |
| BR-ORG-08 | Route business-lines/profile **chưa seed** | Trả 404 có code | FE hiển thị empty có copy, không mock im lặng | 404 | documented | live |

**Scope parity (Group CEO):** List `group-member-units` và detail `UC-CC-03` phải dùng **cùng** `company_id` resolver — rollup `main` khi JWT `main` (ADR Group CEO).

### 2.2 SYNC — `UC-XBOS-SYNC-01` (+ liên kết `UC-ECO-MASTER-02`)

| BR-ID | Condition | Action | Outcome | HTTP / code | Evidence |
|-------|-----------|--------|---------|-------------|----------|
| BR-SYNC-01 | Caller có internal auth (`Authorization` hoặc `x-internal-api-key` hợp lệ) | `POST /config-sync/bootstrap-xevn` | Seed catalogs holding/VTC | 200 | `XBOS-CFG-200` | **live** POST (không chỉ GET catalogs) |
| BR-SYNC-02 | Bootstrap đã chạy; checksum không đổi | Idempotent re-bootstrap | Không duplicate version vô hạn | 200 | version stable | jest `config-sync.controller.spec.ts` |
| BR-SYNC-03 | Bootstrap thành công | Ghi audit + optional platform audit | UC-XBOS-06 partial | — | DB row | jest |
| BR-SYNC-04 | HRM spoke sau bootstrap | `POST /catalog-sync/pull/{key}` | Local replica | 200 | `HRM-SYNC-200` | uat step / jest HRM |
| BR-SYNC-05 | Portal read catalog trước pull | `GET /config-sync/catalog/{key}?target=hrm` | Source read OK scoped | 200 | `XBOS-CFG-201` | live |
| BR-SYNC-06 | Không auth | Từ chối | Không seed | 401 | `XBOS-AUTH-001` | jest |
| BR-SYNC-07 | `UC-ECO-MASTER-02` mở tenant mới | Bootstrap tenant master catalogs | Tenant có baseline | 201/200 | — | jest + ops runbook |

*Tham chiếu chi tiết publish/read:* `docs/xbos/S1_BA_PROCESS_XBOS_UC03-07.md` §1.1–1.4 (`BR-CAT-*`, `BR-SYNC-01..06`).

### 2.3 AR — `UC-XBOS-AR-01`, `UC-XBOS-AR-02`, `UC-XBOS-AR-03`, `UC-XBOS-16`

| BR-ID | Condition | Action | Outcome | HTTP / code | Evidence |
|-------|-----------|--------|---------|-------------|----------|
| BR-AR-01 | Transition không theo DAG 5 bước KT | Từ chối | Trạng thái giữ nguyên | 409 | `ASSET-REQ-409` | jest `asset-request` |
| BR-AR-02 | Cùng `asset_code`, khác `company_id` | Cho phép đăng ký | Cross-company OK | 200/201 | — | jest live-path |
| BR-AR-03 | Trùng identity cùng `tenant_id+company_id` | Từ chối | Conflict có `conflictFields` | 409 | `ASSET-REG-409` | jest |
| BR-AR-04 | List `company_id` query ≠ JWT | Từ chối | Không list | 409 | scope | jest + live |
| BR-AR-05 | Create thiếu trường bắt buộc | Từ chối | Không tạo | 400 | validation | jest |
| BR-AR-06 | Approve bước cuối WF 5-step | Đóng request + audit | Terminal state | 200 | — | jest + FE UI |
| BR-AR-07 | FE hiển thị list | Gọi Nest list scoped; **không** mock array khi API fail (prod path) | Empty+200 hoặc ERROR banner | UI | BR-MOCK-02 | **live** CC/assets route |

### 2.4 CC-05 — `UC-XBOS-CC-05` (executive rail)

| BR-ID | Condition | Action | Outcome | HTTP / code | Evidence |
|-------|-----------|--------|---------|-------------|----------|
| BR-CC05-01 | `ceo@xe.vn` load Command Center | Compose rail: KPI alerts + WF tasks + optional counts | Rail render; không banner ERROR | 200 class | — | **live** `/command-center` |
| BR-CC05-02 | `companyId` rollup: JWT `main` + KPI probe | `kpi-engine` dùng **cùng** scope resolver như catalog | Không 409 `companyId mismatches token` | 200 hoặc empty+200 | — | live + J-CC-03 |
| BR-CC05-03 | Sub-call `portal-alerts` / `workflow-engine/tasks` một service fail | Partial degrade | Rail section empty có label; không crash shell | UI | — | live |
| BR-CC05-04 | `allowMockFallback()` false (pilot) | Không inject `command-center-mock.ts` | Chỉ API/empty state | UI | — | **live** + `FE_MOCK` audit |
| BR-CC05-05 | Unified inbox API chưa có | FE dùng compose endpoint `executive-rail` (OpenAPI delta) | Không claim inbox đầy đủ SRS | partial | — | jest FE + OpenAPI |
| BR-CC05-06 | Click task rail → WF detail | Navigate inbox/task detail | J-XBOS-01 partial PASS | UI | — | **live** cross-nav |

*OpenAPI:* `docs/architecture/P1-TECHSPEC-OPENAPI-DELTA-U18-20260524.md` — `ccExecutiveRail` compose, không duplicate KPI math.

---

## 3. Per-UC acceptance criteria (pass / fail + evidence type)

**Evidence legend:** `live` = browser L2 URL hoặc curl pilot; `jest` = `*.spec.ts` exit pass; `uat` = `test:system:uat`; `cap` = `verify:capabilities`; `promote` = QA cập nhật `phase1-impl-status.json`.

### 3.1 G2 gap — 19 UC

| UC | AC-ID | Pass (measurable) | Fail | Evidence |
|----|-------|-------------------|------|----------|
| `UC-XBOS-SYNC-01` | AC-W1-SYNC-01 | `POST bootstrap-xevn` **200** + ≥1 catalog seeded | Chỉ GET catalogs 200 | **live** + jest |
| `UC-XBOS-SYNC-01` | AC-W1-SYNC-02 | HRM pull sau bootstrap **200** trên 1 catalogKey | Pull 409/500 | uat + jest HRM |
| `UC-XBOS-08` | AC-W1-08-01 | `GET business-master/{domain}/items` domain whitelist **200** | domain invalid **400** | jest + live |
| `UC-XBOS-10` | AC-W1-10-01 | Business-lines promote hoặc profile route **200** sau seed | **404** im lặng | live + jest |
| `UC-XBOS-ORG-01` | AC-W1-ORG-01 | Group CEO org overview **200** (ADR path) | Tree master **400** `XBOS-ORG-400` without UX fallback | **live** |
| `UC-XBOS-ORG-01` | AC-W1-ORG-02 | ORG-02 dept CRUD regression **200** (dependency) | 409 scope | jest |
| `UC-XBOS-ORG-03` | AC-W1-ORG-03 | Save + re-read legal profile **200** scoped | 409/404 | **live** + jest |
| `UC-XBOS-16` | AC-W1-16-01 | Create AR + 5-step transition terminal **200** | BR-AR-01 violation | jest + **live** FE |
| `UC-ECO-SCOPE-01` | AC-W1-SCOPE-01 | Unauthenticated → `/login`; no protected **200** | Protected leak | **live** |
| `UC-CC-01` | AC-W1-CC01-01 | Save dept tree per `company_id` **200** | 409; 404 template | **live** |
| `UC-CC-03` | AC-W1-CC03-01 | Member detail **200**; ≥1 unit `ceo@xe.vn` | 403 member CEO on group | **live** J-CC-02 |
| `UC-CC-04` | AC-W1-CC04-01 | Legal save validation **400** deterministic | Silent fail | jest + **live** |
| `UC-XBOS-CC-05` | AC-W1-CC05-01 | Rail load §2.4 BR-CC05-* | 409 KPI; mock rail | **live** |
| `UC-XBOS-CC-07` | AC-W1-CC07-01 | Infra catalog index **200** scoped | 5xx che empty | **live** + jest INF |
| `UC-XBOS-CC-08` | AC-W1-CC08-01 | Apply dept template **200** | **404** no banner | **live** |
| `UC-XBOS-DASH-01` | AC-W1-D01-01 | Cockpit widgets **200**; ≥1 widget khi seed KPI | All zero + employees exist | **live** |
| `UC-XBOS-DASH-02` | AC-W1-D02-01 | Filter `company_id` không leak cross-company | Wrong company data | **live** |
| `UC-XBOS-DASH-03` | AC-W1-D03-01 | Policy CRUD codes stable | Generic 500 | jest |
| `UC-ECO-MASTER-01` | AC-W1-MD-01 | Master list **200** **hoặc** PM waiver W1 packet | Promote without PM | **PM only** / live |
| `UC-ECO-MASTER-02` | AC-W1-MD-02 | Tenant bootstrap **200** | Duplicate tenant corrupt | jest |
| `UC-ECO-FE-01` | AC-W1-FE-01 | 8 P-CC routes: **0** mock when API fail (pilot) | Mock arrays visible | **live** + `test:hrm-embed:audit` |

**G2 promotion rule:** QA chỉ đặt `e2e_pass` khi **ít nhất một** AC-BE (`live` hoặc `jest`) **và** AC-FE (nếu có UI) PASS — không promote chỉ jest khi UC có màn pilot.

### 3.2 Top 20 FE UC (bổ sung / nhấn mạnh UI)

| UC | AC-ID | Pass | Fail | Evidence |
|----|-------|------|------|----------|
| `UC-XBOS-CC-05` | AC-W1-FE-CC05 | §2.4 + click task → detail | Mock rail | **live** |
| `UC-XBOS-CC-06` | AC-W1-FE-CC06 | Canvas loads definitions **200**; save **200** | Seed-only graph | **live** + jest |
| `UC-XBOS-CC-07` | AC-W1-FE-CC07 | Infra panel API **200** | `INITIAL_INFRASTRUCTURE_*` only | **live** |
| `UC-XBOS-CC-08` | AC-W1-FE-CC08 | Template apply UX **200** | Static templates only | **live** |
| `UC-XBOS-DASH-01` | AC-W1-FE-D01 | No `mockExecutiveDashboardData` in prod path | Mock KPI | **live** |
| `UC-XBOS-DASH-02` | AC-W1-FE-D02 | `kpi-engine` data path | `mockKPIDashboardData` | **live** |
| `UC-XBOS-DASH-03` | AC-W1-FE-D03 | Policy from API or empty+200 | Inline mock policies | **live** |
| `UC-CC-01` | AC-W1-FE-C01 | Dept config persists | Placeholder | **live** |
| `UC-CC-03` | AC-W1-FE-C03 | Member detail tabs load | Broken embed | **live** |
| `UC-CC-04` | AC-W1-FE-C04 | Form validation inline | 500 toast only | **live** |
| `UC-ECO-FE-01` | AC-W1-FE-ECO | `allowMockFallback()` false → ERROR not mock | Mock on 500 | **live** matrix |
| `UC-XBOS-AR-01` | AC-W1-FE-AR1 | List from API scoped | Empty mock table | **live** |
| `UC-XBOS-AR-02` | AC-W1-FE-AR2 | Create **201** reflected in list | Client-only row | **live** |
| `UC-XBOS-AR-03` | AC-W1-FE-AR3 | Invalid transition shows **409** message | Silent fail | **live** |
| `UC-XBOS-16` | AC-W1-FE-16 | 5-step UI matches BR-AR-01 | Skip step UI | **live** |
| `UC-XBOS-13` | AC-W1-FE-WF13 | Definition save from canvas | Local-only | jest + **live** |
| `UC-XBOS-14` | AC-W1-FE-WF14 | Inbox approve path | Mock tasks | **live** J-XBOS-01 |
| `UC-ECO-SCOPE-02` | AC-W1-FE-GF | `tenant-scope/accessible` **200**; filter sync | `fallbackMaster` stuck | **live** |
| `UC-RACI-01` | AC-W1-FE-R1 | Activity catalog API **200** | Hardcoded catalog | **live** |
| `UC-RACI-02` | AC-W1-FE-R2 | Matrix save round-trip **200** | Local state only | **live** |

---

## 4. Traceability — matrix codes

| UC | Matrix STT | MOD | SRS FR | TechSpec | impl_status (matrix) | W1 target | QA promote evidence |
|----|------------|-----|--------|----------|----------------------|-----------|---------------------|
| `UC-XBOS-SYNC-01` | 8 | M01 | FR-XBOS-SYNC-01 | TECHSPEC_HE §4–9 · `config-sync` | be | e2e_pass | `p1-close-w1-qa-*.md` |
| `UC-XBOS-08` | 10 | M01 | FR-XBOS-08 | business-master | be | e2e_pass | jest + live |
| `UC-XBOS-10` | 22 | M01 | FR-XBOS-10 | org-foundation | be | e2e_pass | jest + live |
| `UC-XBOS-ORG-01` | 25 | M01 | FR-XBOS-ORG-01 | org-foundation | be | e2e_pass | ADR group overview |
| `UC-XBOS-ORG-03` | 27 | M01 | FR-XBOS-ORG-03 | legal-entity-profile | be | e2e_pass | live |
| `UC-XBOS-16` | 37 | M01 | FR-XBOS-16 | asset-request | planned | e2e_pass | jest+live+FE |
| `UC-ECO-SCOPE-01` | 48 | M00 | FR-ECO-SCOPE-01 | TECHSPEC_HE §8 | planned | e2e_pass | live auth |
| `UC-CC-01` | 58 | M00 | FR-CC-01 | Command Center | planned | e2e_pass | live |
| `UC-CC-03` | 59 | M00 | FR-CC-03 | Command Center | planned | e2e_pass | live |
| `UC-CC-04` | 60 | M00 | FR-CC-04 | Command Center | planned | e2e_pass | live |
| `UC-XBOS-CC-05` | 61 | M01 | FR-XBOS-CC-05 | OpenAPI `ccExecutiveRail` | planned | e2e_pass | live J-CC-03 |
| `UC-XBOS-CC-07` | 63 | M01 | FR-XBOS-CC-07 | infrastructure | planned | e2e_pass | live |
| `UC-XBOS-CC-08` | 64 | M01 | FR-XBOS-CC-08 | dept templates | planned | e2e_pass | live |
| `UC-XBOS-DASH-01` | 71 | M01 | FR-XBOS-DASH-01 | kpi-engine | planned | e2e_pass | live |
| `UC-XBOS-DASH-02` | 72 | M01 | FR-XBOS-DASH-02 | kpi-engine | planned | e2e_pass | live |
| `UC-XBOS-DASH-03` | 73 | M01 | FR-XBOS-DASH-03 | kpi-engine | planned | e2e_pass | jest+live |
| `UC-ECO-MASTER-01` | 95 | M00 | FR-ECO-MASTER-01 | P2 defer | planned | waived **or** e2e | **PM W1 only** |
| `UC-ECO-MASTER-02` | 96 | M00 | FR-ECO-MASTER-02 | config-sync bootstrap | be | e2e_pass | jest |
| `UC-ECO-FE-01` | 97 | M00 | FR-ECO-FE-01 | `FE_MOCK_TO_API_AUDIT` | planned | e2e_pass **or** waived | PM if P2 |

*FR mã chi tiết:* `docs/client-delivery/02_SRS_XeVN_OS.html` · catalog `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md`.

---

## 5. Waiver policy (BA block)

| Rule | Mô tả |
|------|--------|
| **BA-WV-01** | BA **không** khuyến nghị `impl_status: waived` cho 19 G2 gap — phải `e2e_pass` + evidence |
| **BA-WV-02** | Chỉ `UC-ECO-MASTER-01` và `UC-ECO-FE-01` eligible **W1 tier** (QC-U18) — cần **PM + SA** packet; expiry **2026-09-30** |
| **BA-WV-03** | Bulk waiver 123 UC (**rejected** QC) — không áp dụng W1 |
| **BA-WV-04** | `UC-ECO-SCOPE-01` cần security review trước waive — default **implement** |

---

## 6. Handoff packet

| to_role | Entry | Exit |
|---------|-------|------|
| **Dev-BE** (`P1-CLOSE-BE-A2`) | §2.1–2.3 + AC có `jest`/`live` POST | `READY_FOR_QA` + AC-ID list |
| **Dev-FE** (`P1-CLOSE-FE-A2`) | §1.2 + §2.4 + §3.2 | `READY_FOR_QA` + route map |
| **QA** (`P1-CLOSE-QA-W1`) | L0 `qc:dev-stack`; AC tables | Promote 19→G2 MET; evidence `p1-close-w1-*.md` |
| **PM** | This file `PASS_TO_PM` | Dispatch QC when G2=104/104 |

### Cross-cutting QA (bắt buộc W1)

| Layer | Command | Owner |
|-------|---------|-------|
| L0 | `pnpm run qc:dev-stack` | QA |
| L1 | `pnpm run test:system:uat` | QA |
| L2 | `pnpm run test:pilot:flows` + P-CC nếu đụng HRM | QA |
| L2.5 | `PROGRAM_JOURNEY_MAP.md` J-CC-03, J-XBOS-01 | QA |
| Promote | `pnpm docs:phase1:matrix` + `pnpm phase1:gate` | QA |

---

## 7. Open questions

| ID | Question | Owner | Trigger |
|----|----------|-------|---------|
| Q-W1-01 | `UC-ECO-MASTER-01` implement vs W1 waive? | PM + SA | Sprint day 2 |
| Q-W1-02 | Executive rail: single compose endpoint vs 3 FE calls? | SA | CC-05 409 recurrence |
| Q-W1-03 | `UC-XBOS-ORG-01` document canonical route in OpenAPI? | SA | ORG live probe FAIL |

---

**ack_status:** **PASS_TO_PM**  
**Không claim:** Phase 1 DONE · G2 MET · Production GO.
