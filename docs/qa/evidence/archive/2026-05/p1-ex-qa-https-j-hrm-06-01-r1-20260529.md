# QA Runtime Evidence — P1-EX-QA-HTTPS-J-HRM-06-01-R1

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-J-HRM-06-01-R1` |
| from_role | `dev-fe` |
| to_role | `qa` → `pm` |
| execution_time_utc | `2026-05-29` |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` (portal session; `tokenLen=311`) |
| entry_evidence | `docs/qa/evidence/p1-ex-fe-https-j-hrm-06-scope-01-20260529.md` (`READY_FOR_QA`) |
| prior_fail | `docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-20260529.md` |
| ack_status | **FAIL_TO_PM** |

## Scope

1. **J-HRM-06** — L2.5 attendance list → employee profile on HTTPS pilot (`company_id=main`), **CC iframe** + **direct embed**.
2. **P-CC-07** — L2 regression: zero `127.0.0.1:54321`, sync CONNECTED, attendance list API **200**.

---

## Deploy precondition check (blocker)

FE handoff claims `resolveEmployeeFetchCompanyIds` + embed navigation fixes. **Pilot Vite source does not include the patch:**

| Check | Local workspace | HTTPS pilot (`/hr/src/hooks/useEmployee.ts`) |
|-------|-----------------|-----------------------------------------------|
| `resolveEmployeeFetchCompanyIds` | **present** | **absent** (`hasResolve: false`) |
| `HRM_LIST_DEFAULT_COMPANY_ID` fallback | **present** | **absent** |
| Source size | ~7.9k+ chars (post-fix) | **6010** bytes (pre-fix bundle) |

**Conclusion:** J-HRM-06 scope fix is **not deployed** to pilot (same class as R5 `fallbackAllCount=8` before `pscp` sync). QA cannot PASS L2.5 UI until DevOps syncs J-HRM-06 file set and recreates `hrm-fe`.

### Files DevOps should sync (from FE evidence)

```
apps/web/hrm/src/hooks/useEmployee.ts
apps/web/hrm/src/integrations/hrmApi.ts
apps/web/hrm/src/contexts/AuthContext.tsx
apps/web/hrm/src/lib/hrmEmbedNavigation.ts
apps/web/hrm/src/components/attendance/AttendanceRecordsTable.tsx
apps/web/hrm/src/pages/Attendance.tsx
```

---

## P-CC-07 — L2 matrix (attendance)

| Check | CC embed `/command-center/hrm/attendance?companyId=main` | Direct embed `/hr/attendance?portal=1&companyId=main` | Verdict |
|-------|--------------------------------------------------------|--------------------------------------------------------|---------|
| Route HTTP | Parent **200**; iframe `…/hr/attendance?portal=1&tenantId=xevn&companyId=main` | **200** | **PASS** |
| HRM sync banner | iframe path loaded | `HRM API Sync CONNECTED` | **PASS** |
| `GET /api/hrm/attendance/records?company_id=main` | (in-session) | **200** `HRM-ATT-200`, `total=299` | **PASS** |
| `localhost:54321` (`fallback54321`) | **0** | **0** (before/after nav) | **PASS** |
| API probe (`tmp-p1-ex-qa-https-01-probe.mjs`) | `P-CC-07` | **PASS** | **PASS** |

**P-CC-07 L2:** **PASS** (not regressed).

---

## J-HRM-06 — L2.5 list → detail

### API layer (portal transport)

| Probe | Result |
|-------|--------|
| `GET /api/hrm/employees/00000000-0000-4000-8000-000000000021?company_id=main` | **200** `HRM-EMP-200`, `full_name`: Nguyen NhanSu0021 |
| `tmp-p1-ex-qa-https-01-probe.mjs` **J-HRM-06** | **PASS** (list + GET by id **200**) |

### B) Direct embed — deep link profile

| Step | Action | Result |
|------|--------|--------|
| 1 | Navigate `…/hr/employees/00000000-0000-4000-8000-000000000021?portal=1&companyId=main` | **FAIL** UI |
| 2 | Detail API (in-session `fetch`) | **200** `HRM-EMP-200` |
| 3 | Detail UI | **«Không tìm thấy nhân viên»** + **Quay lại danh sách** |

### A) Command Center embed

| Step | Action | Result |
|------|--------|--------|
| 1 | Load `…/command-center/hrm/attendance?companyId=main` | iframe attendance **200**, `fallback54321=0` |
| 2 | List→detail click path | **Not re-proven PASS** — pilot lacks FE navigation/scope patch; deep-link in iframe expected **same FAIL** as direct path until deploy |

### C) Direct embed — records table (27/05/2026 seed)

| Step | Action | Result |
|------|--------|--------|
| 1 | **Chấm công → Dữ liệu chấm công** | View loads; date default **28/05/2026** |
| 2 | Table rows @ filter | **0** data rows in a11y snapshot (prior run had **19** @ **27/05/2026**) |
| 3 | Row→profile | **Not executable** this run (no clickable data row without date change) |

### Scope parity (blocker — unchanged from R0)

| Signal | Value |
|--------|-------|
| List API | **200** / `HRM-ATT-200` / `total=299` |
| Detail API | **200** / `HRM-EMP-200` |
| Detail UI | **404-equivalent UX** — «Không tìm thấy nhân viên» |
| Tag | **`scope_parity`** + **`deploy_gap`** (pilot `useEmployee.ts` missing FE fix) |

**J-HRM-06 L2.5:** **FAIL** (UI on HTTPS pilot).

---

## Console / network excerpt (sanitized)

```text
PILOT_SRC: GET /hr/src/hooks/useEmployee.ts → hasResolve=false len=6010
DIRECT: GET …/employees/…0021?company_id=main → 200 HRM-EMP-200 (browser fetch)
UI:   /hr/employees/…0021?portal=1&companyId=main → "Không tìm thấy nhân viên"
CC:   iframe …/hr/attendance?portal=1&companyId=main fallback54321=0
ATT:  GET attendance/records?company_id=main → 200 total=299
```

---

## Verdict summary

| Gate | Result |
|------|--------|
| P-CC-07 L2 (no 54321, sync, list API) | **PASS** |
| J-HRM-06 L2.5 (list→detail UI on HTTPS) | **FAIL** (`scope_parity`, **`deploy_gap`**) |
| **Overall** | **FAIL_TO_PM** |

---

## completion_report

- **closed_scope:** P-CC-07 L2 re-smoke on CC + direct embed — `fallback54321=0`, sync CONNECTED, attendance API **200** / `total=299`; API probe **J-HRM-06** **PASS**.
- **open / FAIL:** J-HRM-06 L2.5 UI still shows not-found despite **200** detail API; **root cause:** FE scope fix not on pilot Vite source (verified `resolveEmployeeFetchCompanyIds` absent on `14-225-217-232.nip.io`). Deploy required before another UI retest can pass.

## next_owner

`pm` (dispatch **devops** deploy, then **qa** R2)

## next_dispatch_prompt

```text
work_item_id: P1-EX-DO-DEPLOY-HTTPS-J-HRM-06-SCOPE-01
from_role: qa
to_role: devops
entry_criteria: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r1-20260529.md — FAIL deploy_gap: pilot /hr/src/hooks/useEmployee.ts lacks resolveEmployeeFetchCompanyIds (len 6010); local FE fix in p1-ex-fe-https-j-hrm-06-scope-01-20260529.md not on VPS.
exit_criteria: pscp/sync listed hrm-fe files to /opt/xevn-ecosystem; force-recreate hrm-fe; verify pilot useEmployee.ts contains resolveEmployeeFetchCompanyIds; READY_FOR_QA handoff.
evidence_path: docs/ops/evidence/p1-ex-do-deploy-https-j-hrm-06-scope-01-YYYYMMDD.md
ack_status: READY_FOR_QA
```

```text
work_item_id: P1-EX-QA-HTTPS-J-HRM-06-01-R2
from_role: pm
to_role: qa
entry_criteria: docs/ops/evidence/p1-ex-do-deploy-https-j-hrm-06-scope-01-*.md READY_FOR_QA — J-HRM-06 FE deployed on pilot
exit_criteria: J-HRM-06 L2.5 PASS CC iframe + /hr/attendance (row or late list → profile, no not-found when GET 200); P-CC-07 fallback54321=0
evidence_path: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r2-YYYYMMDD.md
ack_status: PASS_TO_PM or FAIL_TO_PM
```

## Handoff packet

```yaml
work_item_id: P1-EX-QA-HTTPS-J-HRM-06-01-R1
from_role: qa
to_role: pm
evidence_path: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r1-20260529.md
ack_status: FAIL_TO_PM
pm_dispatch_hint: P1-EX-DO-DEPLOY-HTTPS-J-HRM-06-SCOPE-01 — sync J-HRM-06 FE files to pilot then P1-EX-QA-HTTPS-J-HRM-06-01-R2
```
