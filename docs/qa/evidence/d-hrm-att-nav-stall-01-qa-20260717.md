# D-HRM-ATT-NAV-STALL-01-QA — Soft-nav leave Attendance retest

- **Date:** 2026-07-17
- **work_item_id:** `D-HRM-ATT-NAV-STALL-01-QA`
- **owner:** `qa`
- **ack_status:** `PASS_TO_PM`
- **Environment:** `http://14.225.217.232:8088` (VPS Dev8088)
- **Persona:** Group CEO `ceo@xe.vn` / BOD / `companyId=main` / `tenantId=xevn`
- **Deploy refs:** VPS HEAD `96651c7` — soft-nav fix on wire (`v7_startTransition` off + `applyPortalEmbedSoftNavigate`)
- **Env precondition:** `D-HRM-ATT-NAV-STALL-01-ENV` READY_FOR_QA — `docs/qa/evidence/d-hrm-att-nav-stall-01-env-20260717.md`
- **Prior FAIL (superseded):** same file earlier revision — `BLOCKED-ENV` Vite `react-dom.js` 504
- **Method:** U65 browser-only — no seed, no API-only PASS
- **NOT claimed:** Phase 1 DONE / PROD-READY

## Verdict

**PASS_TO_PM** — soft-nav leave Attendance exit criteria **PASS** after ENV repair.

Recommend **QC** close `COND-SCALE-W2-ATT-NAV` / Scale W2 GWC condition for this defect.

---

## Preflight (mandatory before soft-nav AC)

| Check | Result |
|-------|--------|
| `curl` `http://14.225.217.232:8088/hr/node_modules/.vite/deps/react-dom.js` | **200** |
| `curl` `http://14.225.217.232:8080/hr/node_modules/.vite/deps/react-dom.js` | **200** |
| Hard load `/command-center/hrm/employees` → iframe `#root` | **non-empty** `rootLen≈97798`; «Quản lý nhân viên» + table rows |
| iframe `react-dom.js` PerformanceResourceTiming | **200** (`?v=24cf63f7`) |

Env blocker from prior FAIL is **cleared**. Soft-nav AC executed.

---

## Exit criteria matrix

| # | Criteria | Evidence | Verdict |
|---|----------|----------|---------|
| 1 | Soft-nav Attendance → Nhân sự: Employees UI without F5; employees GET fires; not stuck on Overview | Round 1+2: spa `/hr/employees`; «Quản lý nhân viên»; `stuckOnOverview=false`. Round 2 fetch: `GET /api/hrm/employees?company_id=main&page=1&page_size=50` **200** | **PASS** |
| 2 | Soft-nav Attendance → Hợp đồng: Contracts UI without F5 | Round 1+2: spa `/hr/contracts`; «Mã HĐ» / contract rows; `GET …/contracts-insurance/contracts` **200** | **PASS** |
| 3 | Repeat leave directions ×2 | Att→Emp ×2; Att→Contracts ×2 — all remount correct UI without F5 | **PASS** |
| 4 | J-HRM-02: list→profile→back; `_v`/iframe stable; employees↔contracts soft-nav | Profile `…/employees/ff16d855-…` (Phạm Đức Hùng HLD-0996); `history.back` → list; emp↔contracts soft-nav; `_v=1784274383615` **unchanged** entire session | **PASS** |
| 5 | Console P0=0 on path | Portal + iframe console error hooks: **[]** | **PASS** |

---

## RETEST after ENV (authoritative)

### Session / click path

1. Open `:8088` → BOD session → Command Center → **NHÂN SỰ**
2. Preflight hard-nav Employees → confirm `#root` mounts
3. Soft-nav **Chấm công** → confirm Attendance Overview (`Ca làm việc` / `Quản lý đơn`)
4. Soft-nav **Nhân sự** (no F5) → Employees UI
5. Soft-nav **Chấm công** → **Hợp đồng** (no F5) → Contracts UI
6. Repeat steps 3–5 a second time (×2 leave directions)
7. J-HRM-02: Employees list → open row Phạm Đức Hùng → profile → back → list; soft-nav Employees ↔ Contracts

### Soft-nav observations

| Round | From → To | spaPath | UI | Network | `_v` |
|-------|-----------|---------|----|---------|------|
| 1 | Att → Emp | `/hr/employees` | Quản lý nhân viên · 1107 NV | Session already had list GET from preflight; UI remount OK | `1784274383615` |
| 1 | Att → Contracts | `/hr/contracts` | Mã HĐ rows · 1104 HĐ | `contracts?page=1…` **200** (multi-page progressive) | same |
| 2 | Att → Emp | `/hr/employees` | Employees UI | `employees?page=1&page_size=50` **200** + summary **200** | same |
| 2 | Att → Contracts | `/hr/contracts` | Contracts UI | `contracts?page=1…` **200** | same |

**Original W2 stall not reproduced:** portal URL and iframe SPA path both leave Attendance; Outlet shows target module (not stuck on Attendance Overview).

### J-HRM-02

| Step | Result |
|------|--------|
| List | `/hr/employees` — table visible |
| Profile | `/hr/employees/ff16d855-41e4-4390-8381-9ec56262848c` — «Phạm Đức Hùng» · HLD-0996 · tab «Thông tin chung» |
| Back | iframe `history.back` → `/hr/employees` list without F5 |
| emp ↔ contracts | soft-nav both directions; UI correct |
| `_v` / iframe | `_v=1784274383615` stable (no hard iframe remount storm) |

Note: PerformanceResourceTiming did not show a separate UUID `GET /employees/{id}` in this session (profile likely hydrated from list/cache). Profile route + UI fields rendered — L2.5 click path **PASS**.

### Screenshots

- `docs/qa/evidence/d-hrm-att-nav-stall-01-qa-softnav-emp-1-20260717.png`
- `docs/qa/evidence/d-hrm-att-nav-stall-01-qa-softnav-contracts-1-20260717.png`
- `docs/qa/evidence/d-hrm-att-nav-stall-01-qa-jhrm02-profile-20260717.png`
- `docs/qa/evidence/d-hrm-att-nav-stall-01-qa-jhrm02-list-back-20260717.png`

(Earlier BLOCKED-ENV screenshots retained for history: `*-employees-loading-*`, `*-iframe-blank-*`.)

---

## Prior FAIL (superseded — historical)

| | Prior QA (`BLOCKED-ENV`) | This retest |
|--|--------------------------|-------------|
| Symptom | blank `#root`; `react-dom.js` **504** | SPA mounts; soft-nav remounts target UI |
| Soft-nav AC | UNTESTABLE | **PASS** |
| COND-SCALE-W2-ATT-NAV | do not close | **recommend close** |

---

## Residuals

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| Nested orphan `@supabase/*` under hrm-fe `node_modules` | P3 hygiene | devops/fe | ENV residual — may re-break Vite if optimize re-runs; not blocking this PASS |
| COND-SCALE-W2-ATT-NAV | gate close | **qc** | Soft-nav AC evidence ready |

---

## Handoff packet

- `work_item_id`: `D-HRM-ATT-NAV-STALL-01-QA`
- `from_role`: `qa`
- `to_role`: `pm`
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/qa/evidence/d-hrm-att-nav-stall-01-qa-20260717.md`
- `completion_report`: After ENV READY_FOR_QA, browser retest on `:8088` HEAD `96651c7` **PASS**. Preflight `react-dom.js` 200 + Employees `#root` non-empty. Soft-nav Attendance→Nhân sự / Hợp đồng without F5 ×2; employees GET 200 on round 2; contracts GET 200; not stuck on Attendance Overview. J-HRM-02 list→profile→back + emp↔contracts soft-nav; `_v` stable; console P0=0. U65 zero-seed. Recommend QC close `COND-SCALE-W2-ATT-NAV`. No Phase 1/PROD claim.
- `next_owner`: `pm` → `qc`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: D-HRM-ATT-NAV-STALL-01-QC
from_role: pm
to_role: qc
subagent_type: qc

entry_criteria: D-HRM-ATT-NAV-STALL-01-QA PASS_TO_PM; evidence docs/qa/evidence/d-hrm-att-nav-stall-01-qa-20260717.md; ENV docs/qa/evidence/d-hrm-att-nav-stall-01-env-20260717.md; deploy HEAD 96651c7
scope: Close COND-SCALE-W2-ATT-NAV / Scale W2 GWC condition for Attendance soft-nav stall
exit_criteria:
  1) Audit QA matrix rows 1–5 PASS (soft-nav Att→Emp/Contracts ×2; J-HRM-02; _v stable; console P0=0)
  2) Confirm prior BLOCKED-ENV superseded by ENV READY_FOR_QA + this retest
  3) GO or GO WITH CONDITIONS with COND-SCALE-W2-ATT-NAV CLOSED (or explicit residual owner)
  4) evidence_path: docs/qa/evidence/qc-d-hrm-att-nav-stall-01-20260717.md
cấm: seed · reopen soft-nav as FAIL without browser counter-evidence · Phase 1/PROD claim
```
