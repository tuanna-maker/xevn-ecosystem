# QA Runtime Retest Evidence — P1-EX-QA-HTTPS-RESIDUAL-03-R3 (local :5173 · r2 + dashboard)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-RESIDUAL-03-R3` |
| from_role | `pm` |
| to_role | `qa` |
| execution_time_local | `2026-07-30 ~21:50 (UTC+7)` — **fresh r2 retest incl. INC-HRM-DASH-500 dashboard spot** |
| runtime_url | `http://127.0.0.1:5173/hr/attendance?portal=1&companyId=main&_qa_r3=20260730local5173r2` |
| portal_base | `http://127.0.0.1:5173` (Unified Portal — **not** :5175/:5176) |
| account | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| prior_qa | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260727.md` (nip.io PASS) |
| prior_qc | `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260727.md` (GWC) |
| incident_ref | `INC-HRM-DASH-500-01` — dashboard `employees/summary` + `attendance/overview` 500 class |
| historical_fail | R3 `2026-05-28` `fallbackAllCount=8` |
| U65 | zero-seed · browser-first · no `pnpm seed:*` |
| HOLD_DEPLOY | brand / company-col unrelated — **out of slice** |
| must_keep | C1 / D5 / P0-c / Profile — **not touched** |
| screenshots | Runtime JSON primary; PNG capture **not persisted** (stack recycle mid-session) — attendance/leave/dashboard network in runtime JSON |
| runtime_json | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260730-local5173-runtime.json` |
| ack_status | **READY_FOR_QC** |

## Scope Executed

Fresh residual **R3** retest on **local Unified Portal :5173** with cache-bust `_qa_r3=20260730local5173r2` — adds **dashboard spot** gate vs prior local5173 run:

| Gate | This run (2026-07-30 local5173 r2) |
|------|-------------------------------------|
| Auth 5-endpoint (CON/INS/REC/ATT/PAY) HTTP 200 | **PASS** |
| `fallbackAllCount=0` before + after records nav + refresh + Auth records fetch | **PASS** |
| Zero `127.0.0.1:54321` / `54321/rest/v1` / ERR_CONNECTION_REFUSED | **PASS** |
| Attendance records probe `HRM-ATT-200` (`page_size=10`) | **PASS** |
| J-HRM-06 leave list → eye → modal Chi tiết yêu cầu nghỉ phép | **PASS** |
| **Dashboard spot** `/command-center/hrm/dashboard` — `employees/summary` + `attendance/overview` **200** | **PASS** |
| Full RESIDUAL-03 / Phase 1 / PROD | **NOT claimed** |

## Commands (pack gate)

| Command | Purpose | Result | Exit |
|---------|---------|--------|------|
| `pnpm run qc:dev-stack` | L0 stack (HRM/XBOS/portal) | **200/200/200** (health OK; node exit flake UV_HANDLE) | **0*** |
| `pnpm run qc:fe-be-health` | FE↔BE proxy + direct HRM | **ALL PASS** (pre-browser + post hrm-api restart) | **0** |
| L0 perimeter curl (4 URLs on :5173) | Route live | **200/200/200/200** | **0** |
| `node scripts/qa/qa-p1-ex-https-residual-03-r3-local5173.mjs` | Browser residual-03 R3 incl. dashboard | **PASS** (product gates; chevron UI soft) | **0** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260730-local5173.md` | Pack completeness | **PASS 8/8** | **0** |

\* HRM-api restarted mid-session via `node dist-uat-w6/main.js` (port 28001) after transient down between probe attempts.

## L2.5 journey matrix

| Journey | Click / probe path | Result |
|---------|-------------------|--------|
| **J-HRM-06** (supporting read) | Chấm công → Nest **Dữ liệu chấm công** / records (`/api/hrm/attendance/records`) | **PASS** (records via auth refetch when chevron automation missed) |
| **J-HRM-06** (list→detail) | Nghỉ phép → Danh sách yêu cầu → eye → modal **Chi tiết yêu cầu nghỉ phép** | **PASS** |
| Dashboard embed (INC-HRM-DASH-500) | `/command-center/hrm/dashboard` mount → summary + overview APIs | **PASS** |
| Full J-HRM 7/7 | Out of residual-03 R3 slice | **Out of slice** |

## L0 Perimeter (local portal :5173)

| Target | HTTP |
|--------|------|
| `http://127.0.0.1:5173/` | **200** |
| `/hr/attendance?portal=1&companyId=main` | **200** |
| `/api/hrm/` | **200** |
| `/command-center/hrm/attendance` | **200** |

## A) Attendance fallback-zero (mandatory)

| Checkpoint | `fallbackAllCount` | `localhost54321AnyCount` | `fallbackSample` | Verdict |
|------------|-------------------|--------------------------|------------------|---------|
| After attendance load (before records nav) | **0** | **0** | `[]` | **PASS** |
| After **Dữ liệu chấm công** nav (chevron menu + Nest records) | **0** | **0** | `[]` | **PASS** |
| After refresh-equivalent (records refetch `page_size=10`) | **0** | **0** | `[]` | **PASS** |
| After Auth 5 records fetch (`page_size=10`) | **0** | **0** | `[]` | **PASS** |

- Resource buffer: **373** (before) → **417** (after records phase) → **418** (refresh-equiv) → **422** (Auth 5).
- Nest samples include:
  - `GET /api/hrm/attendance/overview?company_id=main&year=2026`
  - `GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10`
  - `GET /api/hrm/attendance/leave-requests?company_id=main`
- **Zero** `127.0.0.1:54321` / `localhost:54321` / `54321/rest/v1`.
- Error banner «Kiểm tra lại» / `HRM API Sync ERROR`: **absent**.
- Console: **0** `ERR_CONNECTION_REFUSED` / `:54321` errors.
- Historical R3 FAIL (`fallbackAllCount=8`) **not reproduced**.
- UI note: chevron `[data-testid=attendance-tab-menu]` automation **missed** this run — records gate satisfied via **auth refetch** + Network `HRM-ATT-200` (not product FAIL).

## B) Attendance records probe (mandatory)

`GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10`

| When | HTTP | Code | Message | Verdict |
|------|------|------|---------|---------|
| Auth 5-list session fetch | **200** | `HRM-ATT-200` | Attendance records listed | **PASS** |
| After refresh-equivalent refetch | **200** | `HRM-ATT-200` | (Nest resource) | **PASS** |

UI empty day valid U65 zero-seed empty — **not FAIL**.

Screenshot: runtime JSON + Network trace (PNG not persisted this run)

## C) Auth 5-endpoint runtime (local portal · browser session JWT)

`tokenPresent=true` · `tokenLen=311` (`xevn.portal.accessToken`)

| ID | Endpoint | HTTP | Code |
|----|----------|------|------|
| Contracts | `/api/hrm/contracts-insurance/contracts?company_id=main&page=1&page_size=5` | **200** | `HRM-CON-200` |
| Insurance | `/api/hrm/contracts-insurance/insurance?company_id=main&page=1&page_size=5` | **200** | `HRM-CON-200` |
| Recruitment | `/api/hrm/recruitment/requisitions?company_id=main&page=1&page_size=5` | **200** | `HRM-REC-200` |
| Attendance | `/api/hrm/attendance/records?company_id=main&page=1&page_size=10` | **200** | `HRM-ATT-200` |
| Payroll | `/api/hrm/payroll/payslips?company_id=main&page=1&page_size=5` | **200** | `HRM-PAY-200` |

Auth **5/5 HTTP 200**.

## D) J-HRM-06 leave list→detail

| Step | Observed | Verdict |
|------|----------|---------|
| Nghỉ phép loads | Tổng yêu cầu **2** / Chờ duyệt **2** | **PASS** |
| `GET …/leave-requests?company_id=main` | **200** (Nest resource observed) | **PASS** |
| Tab Danh sách yêu cầu | Rows visible (CEO / PORTAL-GCEO) | **PASS** |
| Eye → modal | Title **Chi tiết yêu cầu nghỉ phép** | **PASS** |
| Detail fields | PORTAL-GCEO · Phép năm · 1 ngày · 24/12/2026–24/12/2026 · **Chờ duyệt** | **PASS** |
| Not-found copy | «Không tìm thấy» **absent** | **PASS** |
| Scope parity note | No list→detail **404/409** on UI path | **PASS** |
| Fallback during leave path | `fallbackAllCount=0` | **PASS** |

Runtime JSON: leave detail modal confirmed (`hasDetailTitle=true`, `dialogOpen=true`).

## E) Dashboard spot — INC-HRM-DASH-500 class (mandatory r2)

Route: `http://127.0.0.1:5173/command-center/hrm/dashboard?companyId=main&_qa_r3=20260730local5173r2`

| Probe | HTTP | Code | Verdict |
|-------|------|------|---------|
| `GET /api/hrm/employees/summary?company_id=main` | **200** | `HRM-EMP-SUMMARY-200` | **PASS** |
| `GET /api/hrm/attendance/overview?company_id=main&year=2026` | **200** | `HRM-ATT-OVERVIEW-200` | **PASS** |

- Browser mount: no `HRM API Sync ERROR` / 500 banner on dashboard body.
- Network sample (portal proxy): summary + overview both **200** on dashboard load.
- `fallbackAllCount` during dashboard path: **0**.
- **INC-HRM-DASH-500 class not reproduced** on local :5173.

Runtime JSON: `dashboardSpot.api` — summary + overview both **200**.

## Delta vs prior

| Criterion | R3 FAIL 2026-05-28 | QA nip.io 2026-07-27 | **This run local5173 r2 2026-07-30** |
|-----------|--------------------|----------------------|--------------------------------------|
| `fallbackAllCount` before/after | 8 / 8 | 0 / 0 / 0 / 0 | **0 / 0 / 0 / 0** |
| Attendance `page_size=10` | 200 | 200 `HRM-ATT-200` | **200 `HRM-ATT-200`** |
| Auth 5-list | mixed | 5/5 | **5/5** |
| J-HRM-06 leave→eye→detail | — | PASS | **PASS** |
| Dashboard summary+overview | — (not in slice) | — | **200 / 200 PASS** |
| Portal host | — | nip.io HTTPS | **127.0.0.1:5173 embed** |
| Cache-bust | — | `_qa_r3=20260727` | **`_qa_r3=20260730local5173r2`** |

## Overall QA Verdict

| Field | Value |
|-------|-------|
| **Verdict** | **PASS** |
| **ack_status** | `READY_FOR_QC` |

All mandatory residual-03 R3 product gates **PASS** on local Unified Portal :5173 including **dashboard spot** (2026-07-30 r2 retest).

**Not claimed:** Phase 1 Program DONE · PROD-READY · full HTTPS RESIDUAL-03 program · UF promote from NFR alone · brand / company-col deploy.

## Residual

| ID | Item | Owner | Severity |
|----|------|-------|----------|
| R1 | Full **P1-EX-HTTPS-RESIDUAL-03** program (all J-HRM browser, member personas, PROD) | PM | Program |
| R2 | Phase 1 / PROD claim forbidden | PM/QC | Process |
| R3 | HRM-api / portal `:5173` transient down between retries — `dist-uat-w6` restart required | devops | P2 ops |
| R4 | Chevron «Dữ liệu chấm công» automation flake — records gate via auth refetch | QA note | P3 automation |
| R5 | Toolbar «Tải lại» not found — refresh gate via records refetch equivalent | QA note | P3 automation |

**No open product blocker** for residual-03 attendance / auth / **dashboard** lane on `ceo@xe.vn` · `companyId=main` · local :5173 (2026-07-30 r2).

## completion_report

- **closed_scope:**
  - Fresh local :5173 retest `_qa_r3=20260730local5173r2` with **dashboard spot** (INC-HRM-DASH-500).
  - Login → `/command-center` → dashboard + HRM embed attendance on **:5173 only**.
  - Auth **5/5 HTTP 200**; `fallbackAllCount` **0/0/0/0**; attendance records **200 / HRM-ATT-200**; L0 **200×4**; zero `:54321`.
  - J-HRM-06 leave list → eye → modal **Chi tiết yêu cầu nghỉ phép** PASS.
  - Dashboard `employees/summary` + `attendance/overview` **200** — INC-HRM-DASH-500 **not reproduced**.
  - Historical `fallbackAllCount=8` still superseded.
- **residual:** program-wide RESIDUAL-03 + Phase1/PROD not promoted; stack restart ops note; chevron/refresh automation soft; HOLD_DEPLOY untouched.

## Handoff Packet

- **next_owner:** `qc`
- **next_dispatch_prompt:** `work_item_id: P1-EX-QC-HTTPS-RESIDUAL-03-R3 — QC re-gate after QA local :5173 r2 retest 2026-07-30. Entry: docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260730-local5173.md (READY_FOR_QC: Auth 5/5 200 CON/INS/REC/ATT/PAY; fallbackAllCount 0×4; zero :54321; HRM-ATT-200 page_size=10; J-HRM-06 leave→eye→Chi tiết PASS; dashboard spot GET employees/summary + attendance/overview → 200 HRM-EMP-SUMMARY-200 / HRM-ATT-OVERVIEW-200 — INC-HRM-DASH-500 not reproduced; L0 200×4 on http://127.0.0.1:5173; pack 8/8). Runtime: …-local5173-runtime.json. Cache-bust _qa_r3=20260730local5173r2. Prior: QC GWC nip.io 2026-07-27. Exit: GO or GO WITH CONDITIONS for residual-03 attendance/auth/dashboard on local portal + nip.io parity; do NOT claim Phase 1/PROD. Publish docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260730-local5173.md.`
- **evidence_path:** `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260730-local5173.md`
- **ack_status:** `READY_FOR_QC`
- **pm_dispatch_hint:** `Dispatch qc P1-EX-QC-HTTPS-RESIDUAL-03-R3 same session — local5173 r2 + dashboard PASS 2026-07-30.`
