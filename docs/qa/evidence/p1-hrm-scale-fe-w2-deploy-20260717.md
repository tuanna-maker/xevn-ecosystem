# P1-HRM-SCALE-FE-W2-DEPLOY — portal-fe + hrm-fe on :8088

**work_item_id:** `P1-HRM-SCALE-FE-W2-DEPLOY`  
**date:** 2026-07-17  
**owner:** devops  
**ack_status:** READY_FOR_QA  
**U65:** zero-seed (no seed used)  
**NOT claimed:** Phase 1 DONE / PROD-READY

**Source wave:** `P1-HRM-SCALE-FE-W2` — `docs/qa/evidence/p1-hrm-scale-fe-w2-20260717.md`  
**Closes residual (deploy path):** `COND-SCALE-W2-PICKER` FE code live on VPS for browser Network retest.

---

## Steps executed

| Step | Result |
|------|--------|
| Allow-list commit | `5d27676` `fix(hrm): Scale W2 — picker typeahead / capped listEmployees (no dump)` — **7 files only** (useEmployeePicker + tests, useEmployees, AddInsuranceDialog, CompanyMembersManagement, FE evidence). Unrelated dirty lanes left unstaged. |
| Push | `origin/main` `5e0b67a..5d27676` |
| VPS audit | `xevn-portal-fe-dev` :8088, `xevn-hrm-fe-dev` :8080 Up; non-xevn (ytexa/hsbx/asms/viconnec) left running. |
| `git pull origin main` | HEAD `5d27676c09465dcd19e8bef963d806b3435a764a` |
| Verify sources on VPS | `useEmployeePicker.ts` present; `useEmployees.ts` has picker helpers (grep count 4); insurance dialog imports typeahead (count 2). |
| merge-vps-port-env | keep 8088/8080/5173/3001/28002 |
| Recreate | `docker compose --env-file .env up -d --build --no-deps --force-recreate portal-fe hrm-fe` → RECREATE_RC=0 |

**VPS HEAD after deploy:** `5d27676` (`5d27676c09465dcd19e8bef963d806b3435a764a`)  
**Compose:** `/opt/xevn-ecosystem/deploy/xevn-ecosystem`  
**Not touched:** `hrm-be`, `xbos-be`, `xbos-fe`; no `docker compose down`; no seed.

---

## L0 smoke (PASS)

### On-VPS (127.0.0.1)

| Probe | HTTP |
|-------|------|
| `http://127.0.0.1:8088/` | **200** |
| `http://127.0.0.1:8088/command-center` | **200** |
| `http://127.0.0.1:8088/command-center/hrm/employees` | **200** |
| `http://127.0.0.1:8088/command-center/hrm/insurance` | **200** |
| `http://127.0.0.1:8088/command-center/hrm/company` | **200** |
| `http://127.0.0.1:8080/` | **302** (SPA redirect — OK) |

### External (from devops workstation)

| Probe | HTTP |
|-------|------|
| `http://14.225.217.232:8088/` | **200** |
| `http://14.225.217.232:8088/command-center` | **200** |
| `http://14.225.217.232:8088/command-center/hrm/employees` | **200** |
| `http://14.225.217.232:8088/command-center/hrm/insurance` | **200** |
| `http://14.225.217.232:8088/command-center/hrm/company` | **200** |

### Live module confirmation (Vite `/hr/` base)

| Check | Result |
|-------|--------|
| `GET :8080/hr/src/hooks/useEmployeePicker.ts` | `@CODE-MEMORY` Satellite employee pickers header present |
| `useEmployees.ts` picker symbols | grep hits=4 (`fetchEmployeePickerPage` / `useEmployeePickerSearch`) |
| `AddInsuranceDialog.tsx` typeahead | grep hits=3 |

Containers after recreate: `xevn-portal-fe-dev` / `xevn-hrm-fe-dev` Up (~35s at smoke time).

---

## Gate table (deploy slice)

| Gate | Verdict |
|------|---------|
| Allow-list commit/push (no unrelated scoop) | PASS |
| VPS pull includes FE W2 | PASS (`5d27676`) |
| portal-fe + hrm-fe recreated (`--no-deps --force-recreate`) | PASS |
| :8088/ + employees/insurance/company 200 | PASS |
| New FE sources live | PASS |
| Non-xevn undisturbed | PASS |
| Seed used | **none** (U65) |
| Phase 1 / PROD claim | **none** |

---

## Residual

- Browser Network checklist (insurance ≤1 GET page=1; company no mount dump; J-HRM-02 regression) = **QA** — not claimed by DevOps L0.
- Attendance child-tab further defer-to-dialog = optional FE P3 (FE residual).

---

## Handoff

- `completion_report:` Allow-list FE W2 committed+pushed (`5d27676`); VPS pulled same HEAD; portal-fe + hrm-fe force-recreated; :8088 employees/insurance/company **200**; live `useEmployeePicker` + insurance typeahead confirmed. READY_FOR_QA browser Network retest.
- `next_owner:` qa
- `ack_status:` READY_FOR_QA
- `evidence_path:` `docs/qa/evidence/p1-hrm-scale-fe-w2-deploy-20260717.md`

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-QA-W2
from_role: pm
to_role: qa
entry_criteria: P1-HRM-SCALE-FE-W2-DEPLOY READY_FOR_QA; L0 :8088 200; VPS HEAD 5d27676; evidence docs/qa/evidence/p1-hrm-scale-fe-w2-deploy-20260717.md + docs/qa/evidence/p1-hrm-scale-fe-w2-20260717.md; U65 zero-seed
read_first: ADR §6 W2; p1-hrm-scale-fe-w2-20260717.md QA checklist; qc-p1-hrm-scale-w1-20260717.md COND-SCALE-W2-PICKER
persona: ceo@xe.vn / Xevn@2026 · URL http://14.225.217.232:8088
exit_criteria:
  1) Insurance Add dialog: ≤1 employees GET page=1 (keyword typeahead); 0 multi-page listAllEmployees chain
  2) Company members: 0 employees dump on mount; link/bulk dialog capped + keyword
  3) Optional smoke: Attendance leave tab Select — capped not 12-page fan-out
  4) Regression J-HRM-02 Employees: T-FANOUT ≤1; profile detail ≤1; embedScopeKey/_v stable; console P0=0
  5) Evidence docs/qa/evidence/p1-hrm-scale-qa-w2-20260717.md; PASS_TO_PM or FAIL with Network counts
cấm: seed; claim Phase 1/PROD; reopen CLOSED profile dedupe without new FAIL
```
