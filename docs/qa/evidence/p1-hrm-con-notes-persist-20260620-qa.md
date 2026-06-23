# P1-HRM-CON-NOTES-PERSIST-01-R1 — QA retest (UF-HRM-02)

**work_item_id:** `P1-HRM-CON-NOTES-PERSIST-01-R1`  
**role:** qa  
**date:** 2026-06-20  
**defect closed:** `D-UF-WEB-HRM-02-01`  
**journey:** J-HRM-03 (contract create/edit + F5 surrogate)  
**ack_status:** `PASS_TO_PM`

---

## Entry

- Dev handoff: `docs/qa/evidence/p1-hrm-con-notes-persist-20260620.md` (`READY_FOR_QA`)
- Prior FAIL: UF-HRM-02 🟡 — POST `HRM-CON-201` OK; GET-by-id omitted `notes`

---

## L0 stack gate

| Gate | Command | Result |
|------|---------|--------|
| L0 | `pnpm run qc:dev-stack` | **PASS** — hrm-api `:28001`, xbos-api `:28002`, portal `:5173` |
| FE↔BE | `pnpm run qc:fe-be-health` | **PASS** 8/8 |

**Environment:** local dev stack · portal `http://127.0.0.1:5173`  
**Account:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main`

---

## UF-HRM-02 — contract `notes` persistence (F5 surrogate)

**Stamp:** `1781893281909`  
**Employee:** `8ac84520-0d6b-4737-8341-2f9a929b5f81`  
**Contract:** `ca864ba3-2aea-4945-9310-04875b5c2126`

| Step | Method | Path | HTTP | Code | `notes` | Pass |
|------|--------|------|------|------|---------|------|
| POST | POST | `/api/hrm/contracts-insurance/contracts` | 201 | `HRM-CON-201` | `UF02-1781893281909` | ✅ |
| GET-by-id (F5) | GET | `/api/hrm/contracts-insurance/contracts/{id}?company_id=main` | 200 | `HRM-CON-200` | `UF02-1781893281909` | ✅ |
| PATCH | PATCH | `/api/hrm/contracts-insurance/contracts/{id}?company_id=main` | 200 | `HRM-CON-200` | `UF02-PATCH-1781893281909` | ✅ |
| re-GET | GET | `/api/hrm/contracts-insurance/contracts/{id}?company_id=main` | 200 | `HRM-CON-200` | `UF02-PATCH-1781893281909` | ✅ |

**POST body (sample):**

```json
{
  "company_id": "main",
  "employee_id": "8ac84520-0d6b-4737-8341-2f9a929b5f81",
  "contract_type": "fixed_term",
  "start_date": "2026-06-01",
  "end_date": "2027-05-31",
  "salary": 15000000,
  "notes": "UF02-1781893281909"
}
```

**Verdict:** **PASS** — `notes` persisted on create and returned on GET-by-id; PATCH update survives re-GET.

---

## Matrix promotion

| UF-ID | Before | After |
|-------|--------|-------|
| UF-HRM-02 | 🟡 | **🟢** |

Updated in `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §4.

---

## Residual / not promoted

| Item | Status | Owner |
|------|--------|-------|
| UF-HRM-09 HRBP PATCH 403 | Open 🟡 | dev-be `P1-HRM-HRBP-EMP-PATCH-01` |
| UF-HRM-02 browser UI F5 (embed form) | Not in scope R1 — API F5 surrogate only | qa on next web L0 R2 if PM requests |
| Test contract cleanup | Left in DB (pilot data) | — |

---

## PM dispatch

**next_owner:** pm  
**next_dispatch_prompt:** Intake `PASS_TO_PM` from `docs/qa/evidence/p1-hrm-con-notes-persist-20260620-qa.md`. UF-HRM-02 🟢 — defect `D-UF-WEB-HRM-02-01` closed. Dispatch dev-be `P1-HRM-HRBP-EMP-PATCH-01` for UF-HRM-09 if not already in-flight; then qa `P1-USER-FLOW-WEB-QA-L0-R2` retest UF-HRM-09 + browser spot UF-XBOS-05 C1 per QC GWC conditions.
