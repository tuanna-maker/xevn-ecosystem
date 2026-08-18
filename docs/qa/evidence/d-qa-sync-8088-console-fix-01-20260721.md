# D-QA-SYNC-8088-CONSOLE-FIX-01 — QA browser evidence (2026-07-21)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-QA-SYNC-8088-CONSOLE-FIX-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **priority** | P0 RECOVER (prior QA Tasks interrupted 2×; evidence was MISSING) |
| **executed_at** | 2026-07-21 ~10:54–11:05 ICT |
| **URL** | `http://14.225.217.232:8088` (**not** localhost) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` (`xevn.portal.user.userId=ceo@xe.vn`) |
| **U65** | zero-seed · browser-only · no Phase1/PROD claim |
| **entry** | FE: `d-hrm-att-invalid-date-01-fe-20260720.md` · `d-hrm-emp-profile-btn-nest-01-fe-20260720.md` · DevOps sync: `d-do-sync-8088-console-fix-01-20260720.md` |

---

## Executive summary

Browser retest on **Dev8088** confirms the two console crash/warn classes are closed after FE + VPS sync:

1. **Chấm công weekly** — sheet → weekly view renders date labels `dd/MM/yyyy`; **no** white crash; **no** `RangeError: Invalid time value`.
2. **Employee profile pin/DnD** — pin ≥2 tabs; unpin = `span[role=button]`; **0** native `button` nested in `button`; **no** `validateDOMNesting` warn.
3. **Carry a11y** — salary dialog open: title visible; **0** DialogTitle / Missing Description / React Router Future Flag warns in session console hook.
4. **Soft Lương** — tab loads; `Ngày trả` = `—`; `Kỳ lương MM/yyyy — slug`; **no** Invalid time.

**Verdict: PASS_TO_PM** — recommend QC residual close for this console wave (optional). No Phase1/PROD.

---

## Environment / method

| Item | Detail |
|------|--------|
| Session | Existing portal JWT for `ceo@xe.vn` on `:8088` (redirect `/login` → `/command-center`) |
| HRM paths | Direct iframe URLs (same origin as embed) |
| Console capture | `Page.addScriptToEvaluateOnNewDocument` + `console.error/warn` hook → `window.__qaLogs` |
| Cache | Hard nav to HRM URLs after DevOps sync (equivalent Ctrl+F5 for SPA modules) |

---

## AC results

### AC1 — Chấm công weekly · no Invalid time crash · **PASS**

| Step | Result |
|------|--------|
| `/hr/attendance?portal=1&tenantId=xevn&companyId=main` | Overview loads; chart range `(01/01/2026 - 31/12/2026)` |
| Menu **Chấm công** → **Chấm công tuần** → sheets list | Period column `01/07/2026 - 31/07/2026` (safe display) |
| Click sheet row → weekly view | Title `Bảng chấm công từ 01/07/2026 đến 31/07/2026(Công chuẩn)`; footer `(01/07/2026 - 31/07/2026)` |
| UI crash / Invalid time text | **Absent** |
| Console `RangeError` / `Invalid time` | **0** matches in `__qaLogs` |
| Network | `GET /api/hrm/attendance/records` → **200** (multiple) |
| VPS source probe | `/hr/src/lib/attendanceDashboardAggregator.ts` **200** · marker `formatWeeklyRangeTitleLabels` / ATT fix present |

**Soft note (non-blocking for AC1):** weekly grid stayed on spinner / `Tổng số: 0` after reload while records API returned 200 — empty/slow aggregate UX, **not** Invalid-time crash class.

### AC2 — Employee profile pin/DnD · no button-in-button · **PASS**

| Step | Result |
|------|--------|
| URL | `/hr/employees/70275eaa-830c-462c-81fb-03d5823945bc?portal=1&tenantId=xevn&companyId=main` (DVU-0005 · Hoàng Văn An) |
| **Thêm** → pin **Sơ yếu lý lịch** + **Đánh giá KPI** | Pinned strip appears; `localStorage employee-pinned-tabs` = `["cv","kpi"]` |
| DOM audit | `nestedNativeButtons: []` |
| Unpin control | `SPAN` + `role=button` + `aria-label=Bỏ ghim tab` (inside shadcn `BUTTON` — **not** nested native `<button>`) |
| Unpin click | Works (KPI remained pinned after unpin CV) |
| Console `validateDOMNesting` / `cannot appear as a descendant of <button>` | **0** |

### AC3 — Note RR / DialogTitle / Description · **PASS (clean session)**

| Check | Result |
|-------|--------|
| Open **Thêm phụ cấp** on Lương tab | Dialog open; title **Thêm phụ cấp mới**; description text present |
| Console DialogTitle / Missing Description / `React Router Future` / `v7_` | **0** in hooked session |
| Close via **Hủy** | OK |

### AC4 — Soft: Lương tab no Invalid time · **PASS**

| Check | Result |
|-------|--------|
| Tab **Lương & Phụ cấp** | Cards: Lương cơ bản `19.100.000 ₫` · thực nhận `17.190.000 ₫` |
| History rows | `Kỳ lương 05/2026 — services` / `12/2025`; **Ngày trả** = `—` |
| Invalid time / RangeError | **None** (UI + console) |

---

## Residual

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| R-ATT-WEEKLY-EMPTY-SPINNER | P3 soft | Weekly sheet UI spinner / `Tổng số: 0` despite records **200** — investigate aggregate empty vs hang separately | defer · not console AC |
| — | — | No P0/P1 residual for Invalid time or nested-button warn | — |

---

## Traceability

| Prior evidence | Role |
|----------------|------|
| `docs/qa/evidence/d-hrm-att-invalid-date-01-fe-20260720.md` | FE |
| `docs/qa/evidence/d-hrm-emp-profile-btn-nest-01-fe-20260720.md` | FE |
| `docs/qa/evidence/d-do-sync-8088-console-fix-01-20260720.md` | DevOps :8088 sync |
| This file | QA :8088 browser |

UF / J-* (spot): employee list→profile path · attendance weekly view (console class only; not full UF promote).

---

## Handoff

- **completion_report:** Closed P0 recover `D-QA-SYNC-8088-CONSOLE-FIX-01` — browser :8088 PASS for ATT Invalid time + profile nested-button + salary soft + dialog/RR console clean. Soft residual weekly empty spinner deferred. Evidence written (was previously MISSING).
- **next_owner:** `qc` (optional residual close) **or** `pm` wave kế
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/d-qa-sync-8088-console-fix-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: D-QC-SYNC-8088-CONSOLE-FIX-01
from_role: pm
to_role: qc
lane: governance
priority: P1 residual close
entry_criteria: QA PASS docs/qa/evidence/d-qa-sync-8088-console-fix-01-20260721.md; FE+DevOps prior evidence 20260720; URL http://14.225.217.232:8088; U65
exit_criteria: QC GO or GO WITH CONDITIONS on console wave only (ATT Invalid time + profile button-nest + salary soft); cite QA evidence; note soft R-ATT-WEEKLY-EMPTY-SPINNER as non-blocking; no Phase1/PROD; ack_status PASS_TO_PM
cấm: seed · re-open FE without new FAIL · localhost-only claim
```
