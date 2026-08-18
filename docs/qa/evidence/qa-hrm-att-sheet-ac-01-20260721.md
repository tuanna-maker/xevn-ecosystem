# QA-HRM-ATT-SHEET-AC-01 — Browser AC (Dev8088 · 2026-07-21)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-ATT-SHEET-AC-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **priority** | P0 |
| **executed_at** | 2026-07-21 ~11:42–11:55 ICT |
| **URL** | `http://14.225.217.232:8088` (hard nav `/hr/attendance?…&_cb=` ≈ Ctrl+F5) |
| **PORTAL_DEV_URL** | `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **U65** | zero-seed · browser-only · **no** Phase1/PROD |
| **J-*** | **J-HRM-06b** |
| **spec_ref** | `docs/hrm/SRS.md` UC-HRM-23 / HRM-AT-14 · AC-ATT-SHEET-01..06 · BA `ba-hrm-att-sheet-ac-01-20260721.md` |
| **entry** | DevOps `d-do-sync-8088-att-weekly-fix-01-20260721.md` · FE `d-hrm-att-sheet-empty-reload-loop-01-fe-20260721.md` · SA TechSpec |

### command_table (Layer B / C-ATT-SHEET-PACK-01 polish)

| Command | Result | Classification |
|---------|--------|----------------|
| Browser U65 AC-ATT-SHEET-01..06 + J-HRM-06b on Dev8088 | **PASS** | PRODUCT |
| `pnpm --filter @xevn/web-hrm exec vitest run` (FE cite `d-hrm-att-sheet-empty-reload-loop-01-fe-20260721.md`) | **20 PASS** · exit **0** | PRODUCT — FE regression |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-att-sheet-ac-01-20260721.md` | **PASS** · exit **0** (8/8 after polish) | PROCESS |

---

## Executive summary

After VPS FE sync (RQ `useWeeklyAttendanceSummary` + `weeklySheetContext`), Jul sheet **create → open weekly** on `:8088` **settles**: spinner stops, honest empty (`Không có dữ liệu` / `Tổng số: 0`), week-clipped columns `20/07/2026–26/07/2026`, **no** records GET storm (idle **0**/10s; open **1** GET), «Tải lại» only on click (+1 GET), F5 list persists (**3** Jul sheets), **0** Invalid time / RangeError.

**Verdict: PASS_TO_PM** — recommend **QC** residual close `QC-HRM-ATT-SHEET-AC-01` for J-HRM-06b / AC-ATT-SHEET-01..06. No Phase1/PROD.

---

## Environment / method

| Item | Detail |
|------|--------|
| Portal login | `http://14.225.217.232:8088/login` → Command Center |
| HRM path | Direct same-origin embed `…/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| Click path | **Chấm công** → **Chấm công tuần** → sheets list → Thêm / open row name |
| Network | `window.fetch` hook → `window.__qaNet` (attendance URLs only) |
| Console | `console.error/warn` → `window.__qaLogs` |
| Cấm | no `pnpm seed:*` · no API fake rows · no localhost-only claim |

---

## AC results

### AC-ATT-SHEET-01 — Create Jul + Công chuẩn · **PASS**

| Step | Result |
|------|--------|
| Thêm dialog | Dates prefilled `01/07/2026`–`31/07/2026`; radio **Công chuẩn cố định** checked; hình thức Theo ngày |
| Lưu | `POST /api/hrm/attendance/attendance-sheets` → **201** |
| List FE (no F5) | `Tổng số bản ghi: 3` (was 2); new row `… Tất cả vị trí` |

### AC-ATT-SHEET-02 — Open weekly settles · **PASS**

| Step | Result |
|------|--------|
| Open | Click sheet **name** cell (not trash) → weekly mode |
| Title | `Bảng chấm công từ 01/07/2026 đến 31/07/2026(Công chuẩn)` |
| Grid | Day headers Thứ Hai 20 … Chủ Nhật 26; footer `(20/07/2026 - 26/07/2026)` week-clipped into sheet |
| Settled empty | `Không có dữ liệu` · `Tổng số: 0` (API empty = contract OK) |
| Spinner | `.animate-spin` count **0** after settle |

### AC-ATT-SHEET-03 — Empty list / no false ERROR · **PASS (N/A path)**

List `total=3` (not 0). Empty **weekly** path used honest empty copy, **no** ERROR banner when records **200**.

### AC-ATT-SHEET-04 — sheets GET ≤2 / 10s settle · **PASS**

| Window | GET `attendance-sheets` (fetch) |
|--------|----------------------------------|
| Post-create settle | 1× GET 200 after POST (plus perf dup ignored) |
| Idle on list 10s | **0** additional |

### AC-ATT-SHEET-05 — F5 persists sheet list · **PASS**

Hard nav `_cb=20260721qa2` → Chấm công tuần → **3** rows still present for `01/07/2026–31/07/2026` (incl. created `Tất cả vị trí`).

### AC-ATT-SHEET-06 — records GET no storm · **PASS** (sponsor class closed)

| Window | GET `/api/hrm/attendance/records` |
|--------|-----------------------------------|
| Open weekly | **1** × 200 `from_date=2026-07-20&to_date=2026-07-26&page=1&page_size=100` |
| Idle 10s | **0** additional (total still 1) |
| Prior defect | 1000+ storm — **absent** |

### Must #4 — «Tải lại» only on user click · **PASS**

| Check | Result |
|-------|--------|
| Idle | Reload button present; **not** spinning |
| Click «Tải lại» | `spinningSoon: true` then settles; records GET **+1** only (1→2) |
| After | `spinningAfter: false`; empty still honest |

### Must #6 — No Invalid time crash · **PASS**

| Check | Result |
|-------|--------|
| UI | Dates `dd/MM/yyyy`; no white crash |
| `__qaLogs` | **0** `Invalid time` / `RangeError` |

---

## J-HRM-06b

| Field | Value |
|-------|--------|
| Journey | Create sheet → list → open weekly |
| Verdict | **PASS** (this evidence) |
| Route | P-CC-07 / `/hr/attendance` |

Recommend PM/QC mark `PROGRAM_JOURNEY_MAP.md` J-HRM-06b ✅ and promote **UF-HRM-16** flag when matrix update runs.

---

## Residual / not promoted

| Item | Severity | Note |
|------|----------|------|
| Auto-roster on create | out of scope | Header-only POST; empty weekly OK per SA/BA |
| UF-HRM-16 matrix row | CLOSED | Promoted 🟢 §4 — `qa-uf-hrm-16-promote-01-20260721.md` (C-ATT-SHEET-UF16-01) |
| C-ATT-SHEET-PACK-01 | CLOSED | `command_table` + `PORTAL_DEV_URL` added this polish |
| C-ATT-SHEET-AC03-COLD | P3 soft DEFER | Cold list `total=0` not exercised this run |
| Phase1 / PROD | **cấm** | Not claimed |

---

## Handoff

- **completion_report:** Closed browser AC-ATT-SHEET-01..06 + musts 1–6 on `:8088` after DevOps sync. Weekly settles; idle records GET 0/10s; Tải lại manual-only; F5 list OK; 0 Invalid time. Residual = QC gate + optional UF-HRM-16 promote.
- **next_owner:** `qc`
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/qa-hrm-att-sheet-ac-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QC-HRM-ATT-SHEET-AC-01
from_role: pm
to_role: qc
lane: execution
priority: P0
entry_criteria: QA PASS docs/qa/evidence/qa-hrm-att-sheet-ac-01-20260721.md; FE d-hrm-att-sheet-empty-reload-loop-01-fe-20260721.md; DevOps d-do-sync-8088-att-weekly-fix-01-20260721.md; BA AC-ATT-SHEET-01..06; U65 zero-seed
exit_criteria: Audit browser evidence vs AC-01..06 + J-HRM-06b; GO or GWC with residual list; update PROGRAM_JOURNEY_MAP J-HRM-06b if GO; cấm Phase1/PROD claim; evidence docs/qa/evidence/qc-hrm-att-sheet-ac-01-20260721.md; ack_status PASS_TO_PM
cấm: seed · re-run as only probe · localhost-only
```
