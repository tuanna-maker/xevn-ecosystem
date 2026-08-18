# QA-HDSD-W5-SCOPE-01 — W5 member vs group CEO scope negative

**work_item_id:** `QA-HDSD-W5-SCOPE-01`  
**program:** `P-HDSD-ECOSYSTEM-03 · W5 · Đ5`  
**from_role:** qa → pm  
**date:** 2026-08-01  
**policy:** U65 zero-seed · browser `:5173` · no seed  
**spec_ref:** `HDSD_BF_TC_MAP_DELTA.md` §9 · `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` §5  
**runtime:** `docs/qa/evidence/_tmp-qa-hdsd-w5-scope-01-runtime.json`  
**harness:** `scripts/qa/qa-hdsd-w5-scope-01-browser.mjs`  
**screens:** `docs/qa/evidence/screens/qa-hdsd-w5-scope-01-20260801/`

---

## L0 stack

| Gate | Result |
|------|--------|
| hrm-api `:28001` | **200** |
| xbos-api `:28002` | **200** |
| web-portal `:5173` | **200** |

---

## TC-XBOS-HDSD-M01 — Member CEO CC rollup negative (UF-XBOS-11)

| Field | Value |
|-------|-------|
| Persona | `du-lich.ceo@xe.vn` / `Xevn@2026` |
| Click path | `/login` → **Đăng nhập** → `/command-center` |
| Network login | `POST /api/xbos/auth/login` → **201** |
| GMU | `GET /api/xbos/tenant-scope/group-member-units` → **403** `XBOS-TENANT-403` |
| KPI holding | `GET /api/xbos/kpi-engine/rollup?companyId=holding` → **409** `SCOPE_CONTEXT_MISMATCH` |
| KPI main (member own) | `GET ...rollup?companyId=main` → **200** `rollupMode=single` |
| FE | No scope mismatch banner · CC loads member-scoped KPI (not group rollup) |
| Contrast | `ceo@xe.vn` GMU **200** · KPI holding **200** `rollupMode=group` |

**Verdict:** 🟢 — scope negative per SRS / ADR §5 (member **never** gets holding rollup)

**spec_ref:** FR-UC-CC-SCOPE-02 · UF-XBOS-11 · U28-R2

---

## TC-HRM-HDSD-M01 — Member CEO HRM scope negative (UF-HRM-13)

| Field | Value |
|-------|-------|
| Persona | `du-lich.ceo@xe.vn` / `Xevn@2026` |
| Click path | `/login` → `/command-center/hrm/employees?tenantId=xe-du-lich&companyId=main` |
| workspace-meta | `GET /api/xbos/command-center/workspace-meta?tenantId=xe-du-lich&companyId=main` → **200** |
| Holding probe (negative) | `GET /api/hrm/employees?company_id=holding` → **409** `SCOPE_CONTEXT_MISMATCH` |
| Member embed | `GET /api/hrm/employees?company_id=main&page=1` → **200** |
| FE | No HRM Sync ERROR · no scope banner · HRM menu shell visible |
| F5 | Reload → JWT **present** · route unchanged |
| Contrast | `ceo@xe.vn` employees `company_id=main` → **200** total=32 (group rollup) |

**Verdict:** 🟢 — member isolated to `xe-du-lich/main`; holding cross-scope **blocked**; session retained after expected 403/409 console noise

**spec_ref:** FR-UC-HRM-SCOPE-02 · UF-HRM-13 · UC-HRM-SCOPE-02

---

## Group CEO contrast (`ceo@xe.vn`)

| API | Status | Notes |
|-----|--------|-------|
| group-member-units | **200** | 4 member units in payload |
| kpi-engine/rollup?companyId=holding | **200** | `rollupMode=group` |
| hrm/employees?company_id=main | **200** | total=32 (rollup) |

Regression intact — group CEO still has rollup access per ADR §4.

---

## Matrix promote

| TC ID | Before | After | Evidence |
|-------|--------|-------|----------|
| TC-XBOS-HDSD-M01 | ⬜ | 🟢 | This file § TC-XBOS |
| TC-HRM-HDSD-M01 | ⬜ | 🟢 | This file § TC-HRM |

**W5 bucket:** **0⬜** (2/2 mapped)

---

## Residual

| ID | Item | Severity |
|----|------|----------|
| R-W5-CONSOLE-01 | Expected 403 GMU + 409 catalog-governance inbox logged in console for member — **not** JWT eviction (PASS negative) | P3 cosmetic |
| R-W5-FE-COUNT-01 | Employee count hint not parsed from embed shell text — list GET **200** sufficient | P3 |

---

## completion_report

Closed W5 scope bucket: **TC-XBOS-HDSD-M01** + **TC-HRM-HDSD-M01** both 🟢 on `:5173` U65. Member `du-lich.ceo@xe.vn` gets **403/409** on group rollup paths; HRM holding probe **409**; member embed **200** + F5 session persist. Group CEO contrast **200** rollup — no regression.

Residual: cosmetic console noise on expected member negatives (R-W5-CONSOLE-01); no P0/P1 defects.

## next_owner

`qc`

## next_dispatch_prompt

```
work_item_id: QC-HDSD-P2-GATE-01-R5
from_role: qa | to_role: qc
program: P-HDSD-ECOSYSTEM-03
entry_criteria:
- BF-01/02/03 CLOSED GWC · W5 scope 2/2 🟢 (qa-hdsd-w5-scope-01-20260801.md)
- Matrix W5 bucket 0⬜ · HDSD_SRS_TESTCASE_MATRIX summary refreshed
- L0 :5173 stack 200
exit_criteria:
- Program refresh GO/GWC for HDSD P2 — cite W5 closure + residual R-W5-*
- ack PASS_TO_PM with QC verdict + not promoted list if any
read_first:
- docs/qa/evidence/qa-hdsd-w5-scope-01-20260801.md
- docs/qa/evidence/qc-hdsd-bf-03-full-gate-01-20260801.md
cấm: false GO if W5 ⬜ remain · seed evidence
```

## evidence_path

docs/qa/evidence/qa-hdsd-w5-scope-01-20260801.md

## ack_status

PASS_TO_PM
