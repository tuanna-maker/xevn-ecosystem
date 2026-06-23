# P1-HRM-HRBP-EMP-PATCH-01-R1 — QA retest UF-HRM-09

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-HRBP-EMP-PATCH-01-R1` |
| **from_role** | `pm` |
| **to_role** | `qa` |
| **date** | 2026-06-20 |
| **ack_status** | **PASS_TO_PM** |
| **defect_closed** | `D-UF-WEB-HRM-09-01` |
| **uf_id** | `UF-HRM-09` |
| **spec_ref** | `ADR-HRM-RBAC-SCOPE-LADDER` §3.3 |

---

## L0 stack gate

| Gate | Command | Result |
|------|---------|--------|
| L0 | `pnpm run qc:dev-stack` | **PASS** exit 0 — hrm `:28001`, xbos `:28002`, portal `:5173` |

---

## Test execution

**Portal:** `http://127.0.0.1:5173`  
**HRM API:** `http://127.0.0.1:28001/api/hrm`  
**Account (positive):** `du-lich.hr@xe.vn` / `Xevn@2026` — tenant `xe-du-lich`, company `main`  
**Account (negative):** `du-lich.laixe01@xe.vn` / `xevn-pilot` — mobile JWT, roles `["employee"]`

**Automation:** `scripts/tmp-p1-hrm-hrbp-emp-patch-qa-r1.mjs`  
**Unit regression:** `pnpm exec jest --testPathPatterns="employee-update-policy|p1-hrm-hrbp-emp-patch-01"` — **11/11 PASS**

| Case | Result | HTTP | Code | Detail |
|------|--------|------|------|--------|
| T1 — HRBP portal login | **PASS** | 201 | `XBOS-AUTH-200` | tenant=xe-du-lich company=main |
| T2 — HRBP employee list | **PASS** | 200 | `HRM-EMP-200` | 18 rows in `main` scope |
| T3 — HRBP PATCH employee | **PASS** | 200 | `HRM-EMP-202` | `PATCH /employees/{id}?company_id=main` on **MEMEMP440961** (`job_title_key=STAFF`) — was **403** before fix |
| T4 — Plain employee mobile login | **PASS** | 201 | `HRM-AUTH-200` | roles=`["employee"]` |
| T5 — Employee PATCH peer (negative) | **PASS** | 403 | `HRM-EMP-403` | `du-lich.laixe01@xe.vn` cannot PATCH peer **MEMEMP315493** |

**Click/API path (UF-HRM-09):**

1. Portal login `du-lich.hr@xe.vn` → JWT `xe-du-lich` / `main`
2. `GET /api/hrm/employees?company_id=main` → 200
3. `PATCH /api/hrm/employees/b54718f2-6acd-44d4-b1b0-40f4575e0b2f?company_id=main` body `{ "job_title_key": "STAFF" }` → **200** `HRM-EMP-202`

---

## Matrix promotion

| UF-ID | Before | After | Evidence |
|-------|--------|-------|----------|
| **UF-HRM-09** | 🟡 (list 200 / PATCH 403) | **🟢** | This file + probe JSON |

| Defect | Status |
|--------|--------|
| **D-UF-WEB-HRM-09-01** | **CLOSED** — HRBP scoped PATCH returns 200; plain employee still 403 |

---

## Residual

- Dept-level row narrowing (G-FID §3.3) not in scope — HRBP can PATCH any employee in tenant `main` (per dev-be handoff).
- UI browser mutate path inside HRM iframe not re-tested (API proxy path sufficient for UF-HRM-09 API contract).
- **UF-HRM-02** contract notes — separate work item; not in this retest scope.

---

## Machine evidence

- `docs/qa/evidence/p1-hrm-hrbp-emp-patch-20260620-qa-probe.json`
- `docs/qa/evidence/p1-hrm-hrbp-emp-patch-20260620.md` (dev-be READY_FOR_QA)
- `scripts/tmp-p1-hrm-hrbp-emp-patch-qa-r1.mjs`

---

## completion_report

**Closed:** UF-HRM-09 promoted 🟢 — `du-lich.hr@xe.vn` PATCH employee in `xe-du-lich/main` returns 200 on prior-failing `MEMEMP440961`; negative employee peer PATCH still 403 `HRM-EMP-403`; L0 stack PASS; jest 11/11 PASS.

**Open:** UF-HRM-13 (member CEO UI mutate) untested; HRM iframe L2.5 click not automated this wave.

## next_owner

`pm` → `qc` (re-gate C3 on `qc-user-flow-web-l0-20260620.md`) or `qa` for `P1-USER-FLOW-WEB-QA-L0-R2` combined retest if PM batches UF-HRM-02 + UF-HRM-09.

## next_dispatch_prompt

```
Role: qc
work_item_id: P1-USER-FLOW-WEB-QC-L0-R1
from_role: qa
to_role: qc
entry_criteria: UF-HRM-09 🟢 — docs/qa/evidence/p1-hrm-hrbp-emp-patch-20260620-qa.md; UF-HRM-02 may still be 🟡 (check matrix)
Tasks:
1) Audit C3 closure — D-UF-WEB-HRM-09-01 CLOSED
2) Re-read USER_FLOW_OPERABILITY_MATRIX.md §3 UF-HRM-09 row
3) Issue GO/GWC/NO-GO for web L0 slice; note UF-HRM-02 residual if still open
Exit: PASS_TO_PM with qc evidence
ack_status: PASS_TO_PM
```

## evidence_path

`docs/qa/evidence/p1-hrm-hrbp-emp-patch-20260620-qa.md`
