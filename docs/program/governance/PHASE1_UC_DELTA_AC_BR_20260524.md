# Phase 1 — Delta AC/BR (BA-Process, U18)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-TODAY-GOV-BA-P` |
| **program** | `U18-PHASE1-TODAY` |
| **author** | BA-Process |
| **date** | 2026-05-24 |
| **spec_ref** | `GOV-SRS-DELTA` |
| **consumers** | Dev-BE, Dev-FE, Dev-Mobile, QA |

## SoT và phạm vi

| Artifact | Vai trò |
|----------|---------|
| `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md` | 245 UC × SRS × TechSpec |
| `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` | L2 P-CC-01..09 (đã PASS hầu hết) |
| `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` | BR-SCOPE/MOCK + UC-HRM-22..25 (đủ — **không** delta lại) |
| `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` | AC-FID-* density (G-FID-07) |
| `docs/xbos/S1_BA_PROCESS_XBOS_UC03-07.md` | UC-XBOS-03..07 (đủ — **không** delta lại) |
| Resolver `scripts/lib/phase1-impl-status.mjs` + overrides | **57** UC `impl_status=planned` (2026-05-24) |

**Ghi chú đếm:** `docs/qa/PHASE1_GATE_REPORT.md` (P1-S5-QA-01) ghi **63 planned** — snapshot matrix trước BE-WAVE-FINAL. `pnpm phase1:gate` hiện tại: **57 planned**. Delta dưới đây áp dụng **57 UC** resolver; 6 UC đã promote (`be`/`e2e_pass`) không lặp AC.

**Nguyên tắc delta:** Chỉ bổ sung AC/BR **đo được** khi SRS có nghiệp vụ nhưng QA/Dev chưa có pass/fail rõ. Không viết lại SRS.

---

## 1. Cross-cutting (mọi wave — tham chiếu, không nhân bản)

| Mã | Điều kiện | Hành động | Kết quả | Evidence QA |
|----|-----------|-----------|---------|-------------|
| BR-SCOPE-01 | JWT + header/query scope | `tenantId`/`companyId` khớp membership | API 200 class | `scope-context.spec.ts`, L1 UAT |
| BR-SCOPE-02 | Scope mismatch | BE từ chối | **409** `SCOPE_CONTEXT_MISMATCH` | Probe `company_id=xevn` vs JWT `main` |
| BR-MOCK-01 | 200 + `data=[]` | Empty state có copy | PASS alternate | `PILOT_BUSINESS_FLOW_BA_TRACE.md` |
| BR-MOCK-02 | 4xx/5xx / timeout | Banner ERROR, không empty im lặng | FAIL | L2 matrix |
| BR-DATA-01 | Load route pilot | Không bắt buộc `:54321` | FAIL nếu `ERR_CONNECTION_REFUSED` | `test:hrm-embed:audit` |
| BR-FID-01 | Menu HRM có list | `R_child(c) ≥ 0.85` (module-specific) | PASS G-FID-07 | `verify:hrm:menu-density` |

---

## 2. Delta theo cụm (AC mới — chỉ cụm acceptance chưa rõ)

### 2.1 P0 — Embed / Portal (Wave C + A) — L2 đã chạy nhưng matrix `planned`

| UC | AC-ID | Pass (đo được) | Fail | QA evidence |
|----|-------|----------------|------|-------------|
| `UC-HRM-20` | AC-U18-20-01 | `ceo@xe.vn` → P-CC-03 hoặc `/command-center/hrm` dashboard: `GET /api/hrm/operations/reports/summary` **200**; ≥1 counter > 0 sau seed fidelity | 409 load; 500 proxy; all counters = 0 khi `N_EMP(main)≥1000` | `HRM_MENU_DATA_LINKAGE_MATRIX.md` §dashboard |
| `UC-HRM-20` | AC-U18-20-02 | Không banner `HRM API Sync ERROR` trên load | 4xx che bằng empty | L2 P-CC-03 |
| `UC-HRM-21` | AC-U18-21-01 | `GET /api/hrm/employees?page_size=100&company_id=main` **200** `HRM-EMP-200`; `total≥1` sau seed 1000 UAT **hoặc** empty+200 + CONNECTED (không 409) | 409; 54321 required; `page_size>100` → 400 | L2 P-CC-03; `hrm-list-scope.spec.ts` |
| `UC-HRM-21` | AC-U18-21-02 | Mở NV đầu tiên: detail **200** (Nest path, không Supabase-only) | Detail 500; work_history 54321 **không** fail cả trang | `p1-s3-be-01` embed note |
| `UC-ECO-SCOPE-01` | AC-U18-SCOPE-01 | Chưa login → `/login`; không gọi API protected **200** | Protected route 200 without auth | Browser + L1 auth negative |
| `UC-ECO-FE-01` | AC-U18-FE-01 | 8 route P-CC bắt buộc: **0** mock array khi `allowMockFallback()` false | Mock data hiển thị khi API fail | `FE_MOCK_TO_API_AUDIT.md` + L2 |

### 2.2 Wave A — Workflow (`UC-XBOS-13`..`15`)

| BR-ID | Điều kiện | Hành động | Kết quả |
|-------|-----------|-----------|---------|
| BR-WF-01 | Definition thiếu `steps[]` hoặc role hat | Từ chối lưu | **400** validation |
| BR-WF-02 | Instance ở bước N; actor không có hat bước N | Từ chối approve | **403** hoặc `XBOS-WF-409` |
| BR-WF-03 | Approve bước cuối | Chuyển `status=completed` | **200** + audit row |

| UC | AC-ID | Pass | Fail |
|----|-------|------|------|
| `UC-XBOS-13` | AC-U18-WF-13-01 | `POST …/workflow-engine/definitions` → **201**; `GET` cùng `definitionKey` trả đủ `steps` | 401; 400 BR-WF-01 |
| `UC-XBOS-14` | AC-U18-WF-14-01 | Start instance → approve từng hat theo definition → terminal **200** | Skip hat; 409 scope |
| `UC-XBOS-15` | AC-U18-WF-15-01 | Route báo cáo cấu hình lưu được; rollup task list **200** (có thể empty+200) | 404 route; 409 KPI scope |

### 2.3 Wave A — Tài sản (`UC-XBOS-16`, `UC-XBOS-AR-*`, `UC-XBOS-AST-*`)

| BR-ID | Điều kiện | Hành động | Kết quả |
|-------|-----------|-----------|---------|
| BR-AR-01 | Chuyển trạng thái không theo DAG 5 bước KT | Từ chối | **409** `ASSET-REQ-409` |
| BR-AR-02 | Cùng `asset_code` khác `company_id` | Cho phép (cross-company) | **200** |
| BR-AR-03 | Trùng identity cùng scope | Từ chối | **409** `ASSET-REG-409` + `conflictFields` |

| UC | AC-ID | Pass | Fail |
|----|-------|------|------|
| `UC-XBOS-AR-01` | AC-U18-AR-01 | List scoped `company_id` **200**; filter `status` hợp lệ | 409 scope |
| `UC-XBOS-AR-02` | AC-U18-AR-02 | Create **201**; field bắt buộc đủ | 400 validation |
| `UC-XBOS-AR-03` | AC-U18-AR-03 | Transition hợp lệ **200**; invalid **409** BR-AR-01 | Nhảy bước |
| `UC-XBOS-AST-01` | AC-U18-AST-01 | Register **201** `ASSET-REG-201` | BR-AR-03 |
| `UC-XBOS-AST-02` | AC-U18-AST-02 | Lifecycle event ghi lịch sử; list **200** | Mất audit |

### 2.4 Wave A — Command Center / KPI (`UC-CC-*`, `UC-XBOS-CC-*`, `UC-XBOS-DASH-*`)

| UC | AC-ID | Pass | Fail |
|----|-------|------|------|
| `UC-CC-01` | AC-U18-CC-01 | Lưu cây phòng ban theo `company_id` **200**; đọc lại khớp | 409; 404 dept-templates |
| `UC-CC-03` | AC-U18-CC-03 | `group-member-units` **200**; ≥1 row (`ceo@xe.vn`) | 403 member CEO |
| `UC-CC-04` | AC-U18-CC-04 | Lưu MST/đại diện **200**; validation thiếu field **400** | Silent fail |
| `UC-XBOS-CC-05` | AC-U18-CC-05 | KPI strip load **200** hoặc empty+200; **không** 409 `companyId` rollup | 409 kpi-engine |
| `UC-XBOS-CC-06` | AC-U18-CC-06 | Canvas definition list **200** | 500 |
| `UC-XBOS-CC-07` | AC-U18-CC-07 | Infra catalog index **200** | Empty che 5xx |
| `UC-XBOS-CC-08` | AC-U18-CC-08 | Dept template apply theo company **200** | 404 template |
| `UC-XBOS-DASH-01` | AC-U18-DASH-01 | Cockpit aggregates **200**; widget ≥1 khi seed | All zero + employees exist |
| `UC-XBOS-DASH-02` | AC-U18-DASH-02 | Per-company KPI board filter `company_id` | Cross-company leak |
| `UC-XBOS-DASH-03` | AC-U18-DASH-03 | Policy CRUD deterministic codes | Generic 500 |

### 2.5 Wave A — Hạ tầng DM + master (`UC-XBOS-INF-*`, `XBOS-DM-10`..`18`, `UC-ECO-MASTER-01`)

| BR-ID | Điều kiện | Hành động | Kết quả |
|-------|-----------|-----------|---------|
| BR-DM-10 | Export khi chưa publish version | Từ chối hoặc export draft có flag | **400** hoặc file có `draft=true` |
| BR-DM-12 | Thay đổi nhạy cảm | Tạo approval task | Inbox **200** |
| BR-DM-13 | Approver ≠ pending role | Từ chối | **403** |
| BR-DM-17 | Publish version | Bump `version`; notify subscribers | `XBOS-CFG-203` pattern |

| UC | AC-ID | Pass | Fail |
|----|-------|------|------|
| `UC-XBOS-INF-01` | AC-U18-INF-01 | GET/PUT infra config **200** scoped | 409 |
| `UC-XBOS-INF-02` | AC-U18-INF-02 | Meta template theo company CRUD **200** | 404 |
| `UC-XBOS-INF-03` | AC-U18-INF-03 | Summary status **200** với `health` fields | Empty object only |
| `XBOS-DM-10` | AC-U18-DM-10 | Export file **200** + MIME hợp lệ | 500 |
| `XBOS-DM-11` | AC-U18-DM-11 | Import preview + commit; invalid row **400** row index | Silent skip |
| `XBOS-DM-12`..`13` | AC-U18-DM-12 | Approve/reject task **200**/`403` BR-DM-13 | Wrong actor |
| `XBOS-DM-14` | AC-U18-DM-14 | History list **200** sorted `created_at` desc | 404 |
| `XBOS-DM-15`..`16` | AC-U18-DM-15 | Field add/remove request → inbox | No task |
| `XBOS-DM-17` | AC-U18-DM-17 | Version publish BR-DM-17 | No version bump |
| `XBOS-DM-18` | AC-U18-DM-18 | Notify payload chứa `catalogKey`, `version` | Missing notify |
| `UC-ECO-MASTER-01` | AC-U18-MD-01 | Master list theo tenant+company **200** | 409 |

### 2.6 Wave C — Metadata / import / ops / perf (HRM `planned` cluster)

| UC | AC-ID | Pass | Fail |
|----|-------|------|------|
| `HRM-MD-01` | AC-U18-HMD-01 | `POST …/employee-metadata/change-requests` **201** | 400 missing field |
| `HRM-MD-02` | AC-U18-HMD-02 | Queue list **200** filter `pending` | 409 |
| `HRM-MD-03` | AC-U18-HMD-03 | Approve **200**; profile field cập nhật | Stale pending |
| `HRM-MD-04` | AC-U18-HMD-04 | Reject **200** + `reason` | 404 request |
| `HRM-MD-05` | AC-U18-HMD-05 | Audit log **200** | Empty che 5xx |
| `HRM-SC-06` | AC-U18-SC-06 | Reject catalog batch **200** | 409 |
| `HRM-SC-07`..`09` | AC-U18-SC-07 | Template init **201** idempotent | Duplicate error |
| `HRM-IM-01` | AC-U18-IM-01 | Preview import **200** + `rows[]` + error count | 500 |
| `HRM-IM-02` | AC-U18-IM-02 | Commit **201**; FK employee valid | Orphan FK |
| `HRM-IM-03` | AC-U18-IM-03 | Export **200** `Content-Disposition` | Timeout |
| `HRM-IM-04` | AC-U18-IM-04 | Template download **200** | 404 |
| `HRM-OP-01`..`04` | AC-U18-OP-01 | CRUD task + summary **200** scoped | 409 |
| `HRM-PF-01`..`04` | AC-U18-PF-01 | Cycle + review sheet lifecycle **200** | 404 cycle |

---

## 3. Ma trận delta → cột matrix (tham chiếu nhanh)

Thêm cột ảo `delta_ac_ref` (không regenerate toàn bộ 245 dòng):

| impl_status | Số UC | delta_ac_ref |
|-------------|------:|--------------|
| planned (57) | 57 | §2.1–§2.6 cụm tương ứng |
| be/fe/e2e (đã pilot) | UC-HRM-22..25 | `PILOT_BUSINESS_FLOW_BA_TRACE.md` |
| be (config) | UC-XBOS-03..07 | `S1_BA_PROCESS_XBOS_UC03-07.md` |

---

## 4. Mở / escalation

| ID | Câu hỏi | Owner | Trigger |
|----|---------|-------|---------|
| Q-U18-01 | `UC-XBOS-15` rollup có gọi `kpi-engine` cùng scope CC-05 không? | SA | 409 lặp trên dashboard |
| Q-U18-02 | `HRM-SC-07..09` seed script name chuẩn (`seed:hrm:fidelity` vs legacy) | DevOps | G-FID seed BLOCKED |
| Q-U18-03 | Insurance list API (`GET /insurance`) — có trong scope P1 today? | PM | FID-D-01 |

---

## 5. Handoff

| to_role | entry_criteria | exit_criteria |
|---------|----------------|---------------|
| Dev-BE / Dev-FE | Đọc §2 + wave map `p1-today-ba-p-delta-20260524.md` | Implement + `READY_FOR_QA` kèm AC-ID |
| QA | AC-ID + L2/L1 scripts | PASS/FAIL per AC; không GO nếu P0 FAIL |

**ack_status:** `PASS_TO_PM` (gói governance — không claim Phase 1 DONE)
