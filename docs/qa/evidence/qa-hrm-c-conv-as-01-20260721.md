# QA-HRM-C-CONV-AS-01 — Browser smoke sheet DTO (Dev8088 · 2026-07-21)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-C-CONV-AS-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **priority** | P1 |
| **executed_at** | 2026-07-21 ~21:39–21:43 ICT |
| **URL** | `http://14.225.217.232:8088` |
| **PORTAL_DEV_URL** | `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` · `companyId=main` (session already authenticated) |
| **U65** | zero-seed · browser FE create · **no** hire retest · **no** Phase1/PROD |
| **J-*** | J-HRM-06b (create → list → open weekly empty) — smoke slice |
| **spec_ref** | SRS AC-ATT-SHEET-01/02/05/06 · TechSpec §15.1 DTO at edge · BE `be-hrm-c-conv-as-01-20260721.md` |
| **entry** | BE READY `docs/qa/evidence/be-hrm-c-conv-as-01-20260721.md` · DevOps sync `docs/qa/evidence/d-do-sync-8088-g-db-01-conv-01-20260721.md` |

### command_table

| Command | Result | Classification |
|---------|--------|----------------|
| Browser U65: Chấm công → Bảng chấm công → Thêm → Lưu (Công chuẩn Jul) | **PASS** POST **201** `HRM-AS-201` | PRODUCT |
| Open sheet empty honesty (records total 0) | **PASS** | PRODUCT |
| Hard nav `_cb=` + list F5 | **PASS** total **4** persists | PRODUCT |
| Optional invalid POST (missing / bad date / unknown field) | **PASS** all **400** `HRM-VAL-001` | PRODUCT |
| Seed / auto-fill roster / hire | **Not run** (cấm) | — |

---

## Executive summary

After DevOps sync of `CreateAttendanceSheetDto` onto `:8088`, CEO FE path **create kỳ Công chuẩn** works: dialog Lưu → `POST /api/hrm/attendance/attendance-sheets` **201** `HRM-AS-201` with `standard_type: fixed` + ISO dates; list **3→4** without F5; open weekly shows honest empty (`Không có dữ liệu` / `Tổng số: 0`, records GET `total:0` — **no** auto roster); F5 list still **4**; ValidationPipe rejects invalid bodies with **400**.

**Verdict: PASS_TO_PM** — C-CONV-AS-01 browser closed. Hire G-DB-01 remains separate (out of scope). No Phase1/PROD claim.

---

## Environment / method

| Item | Detail |
|------|--------|
| Portal | `http://14.225.217.232:8088/hr/attendance?portal=1&tenantId=xevn&companyId=main&_cb=…` |
| Click path | **Chấm công** dropdown → **Bảng chấm công** → **Thêm** → dates `01/07/2026`–`31/07/2026` + radio **Công chuẩn cố định** → **Lưu** → click row name → weekly |
| Network | `window.fetch` hook → `window.__qaNet` (attendance URLs) |
| Invalid probe | Same-origin `fetch` POST from authenticated portal session (not seed; optional AC) |
| Cấm respected | no `pnpm seed:*` · no roster invent · no hire stage · no Phase1/PROD |

---

## AC / exit criteria

### 1) Create sheet · POST 201 HRM-AS-201 · list + F5 — **PASS**

| Step | Result |
|------|--------|
| Dialog | Dates prefilled `01/07/2026`–`31/07/2026`; **Công chuẩn cố định** checked; hình thức Theo ngày |
| Lưu (FE) | `POST /api/hrm/attendance/attendance-sheets` → **201** |
| Body | `company_id=main`, `start_date=2026-07-01`, `end_date=2026-07-31`, `attendance_type=daily`, `standard_type=fixed`, `positions=null` |
| Response | `code: HRM-AS-201`, `data.id: beb89499-06b1-460b-a9d7-bba9dcf2fdbd` |
| FE after 2xx | Dialog closed; `Tổng số bản ghi: 4` (was 3); list shows July rows |
| F5 | Hard nav `_cb=qa-conv-as-f5-01` → Bảng chấm công → **4** rows still present (incl. `Tất cả vị trí`) |

### 2) Open sheet · empty honesty (AC-ATT-SHEET) — **PASS**

| Step | Result |
|------|--------|
| Open | Click sheet name cell → weekly mode |
| Title | `Bảng chấm công từ 01/07/2026 đến 31/07/2026(Công chuẩn)` |
| Settled empty | `Không có dữ liệu` · `Tổng số: 0` |
| Spinner | `.animate-spin` count **0** |
| Records GET | **1×** 200 `from_date=2026-07-20&to_date=2026-07-26` · `data.total: 0` · `data: []` |
| Auto roster | **Absent** — header-only create must_keep held |

### 3) Optional invalid body → 400 — **PASS**

| Probe | HTTP | code | Message (excerpt) |
|-------|------|------|-------------------|
| `{ company_id: main }` missing name/dates | **400** | `HRM-VAL-001` | name must be a string; start/end ISO |
| `start_date: 01/07/2026` (non-ISO) | **400** | `HRM-VAL-001` | must be valid ISO 8601 |
| valid dates + `hacker_field: true` | **400** | `HRM-VAL-001` | property hacker_field should not exist |

Confirms TechSpec §15.1 / BE jest: ValidationPipe whitelist + forbidNonWhitelisted live on VPS.

---

## Residual / out of scope

| ID | Note |
|----|------|
| Hire G-DB-01 / J-HRM-INT-01 | **Separate** — not retested this item |
| G-AT10-02 leave overlap | Out of scope |
| BR-ATT-SHEET-04 start≤end | DTO does not enforce; service/FE residual (BE residual) |
| Phase1 / PROD | **Not claimed** |

---

## completion_report

**Closed:** QA-HRM-C-CONV-AS-01 — U65 browser create Công chuẩn sheet on `:8088` after DTO sync; POST **201** `HRM-AS-201`; list+F5; empty honesty; invalid → **400**.

**Residual:** Hire G-DB-01 browser (if still open); no product gap on C-CONV-AS sheet DTO.

**Not claimed:** Phase 1 DONE · PROD · hire PASS.

---

## Handoff

- **next_owner:** `pm` (then `qc` optional for C-CONV-AS residual close, or `qa` for hire G-DB-01)
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/qa-hrm-c-conv-as-01-20260721.md`

### next_dispatch_prompt

```text
work_item_id: QC-HRM-C-CONV-AS-01
from_role: pm
to_role: qc
lane: governance
priority: P2
entry_criteria: QA PASS docs/qa/evidence/qa-hrm-c-conv-as-01-20260721.md; BE be-hrm-c-conv-as-01; DevOps d-do-sync-8088-g-db-01-conv-01
exit_criteria: Audit browser evidence vs AC-ATT-SHEET create/empty/F5 + VAL 400; close TM C-CONV-AS-01 / C3 if in GWC; no Phase1/PROD
cấm: seed · reopen hire in this QC
evidence_path: docs/qa/evidence/qc-hrm-c-conv-as-01-20260721.md
ack_status: PASS_TO_PM

# Parallel if hire still open:
work_item_id: QA-HRM-G-DB-01-HIRE-8088-01
from_role: pm
to_role: qa
U65 browser hire negative HRM-REC-HIRE-400 + happy employee_id — separate from sheet
```
