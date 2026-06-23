# HRM Fidelity QA — BE-SCOPE retest (persona)

**work_item_id:** `HRM-FIDELITY-QA-RETEST-2`  
**upstream:** `HRM-FIDELITY-BE-SCOPE` (`READY_FOR_QA`)  
**gate:** `G-FID-07`  
**from_role:** qa  
**to_role:** pm, qc  
**generated:** 2026-05-23 (local)  
**environment:** `deploy/xevn-ecosystem/.env` · DB `xevn_hrm` · portal `http://127.0.0.1:5175`  
**verdict:** **PASS** — DB **7/7** + group CEO persona on `main` (contracts **1036**); **G-FID-07 closed** for pilot scope

---

## 1. Executive summary

| Layer | Command | Exit | Result |
|-------|---------|------|--------|
| Persona probes | `node scripts/verify-hrm-persona-scope-probes.mjs` | 0 | **PASS** — `ceo@xe.vn` contracts **1036**, employees **1100**, attendance **2649**, requisitions **10** |
| **G-FID-07 (DB)** | `pnpm run verify:hrm:menu-density` | 0 | **7/7** — contracts ratio **0.939**, insurance **1037/1104** |
| L2 proxy smoke | `pnpm run test:pilot:flows` | 0 | **11/11 PASS** |
| L2 embed audit | `pnpm run test:hrm-embed:audit` | 0 | **8/8 PASS** |

**G-FID-07 (program):** DB script **+** group CEO persona matrix **PASS** per `HRM-FIDELITY-BE-SCOPE` entry criteria (`contracts>0` on `main`).

**Residual (non-blocking this packet):** `du-lich.ceo@xe.vn` still low counts (member seed out of scope per dev-be); HRBP mobile **not** re-run (FID-D-06); `insurance-expiring` **total=0** (probe exempt; FID-D-07 cosmetic).

---

## 2. Persona scope probes — PASS

```text
verify-hrm-persona-scope-probes

## group-ceo (ceo@xe.vn) tenant=xevn company=main
  PASS  employees  HTTP 200  total=1100
  PASS  contracts  HTTP 200  total=1036
  PASS  insurance-expiring  HTTP 200  total=0
  PASS  requisitions  HTTP 200  total=10
  PASS  attendance  HTTP 200  total=2649

=== Persona probes PASS ===
```

| Menu | Group CEO `main` | Pass criteria | Status |
|------|-----------------:|---------------|--------|
| employees | 1100 | ≥100 | **PASS** |
| contracts | 1036 | >0 | **PASS** |
| requisitions | 10 | >0 | **PASS** |
| attendance | 2649 | >0 | **PASS** |

Member CEO (`du-lich.ceo@xe.vn`): employees **10**, contracts **0** — expected until member satellite seed; does not block BE-SCOPE exit.

---

## 3. `verify:hrm:menu-density` — PASS (7/7)

```text
PASS  employees       employees=1170 (need >=1000)
PASS  contracts-ratio contracts=1037 active=1104 ratio=0.939 need>=0.85
PASS  insurance-ratio insurance=1037 ratio need>=0.85
PASS  attendance-scale attendance=2819 need>=22
PASS  payroll-periods  payroll_periods=53 need>=10
PASS  recruitment-pipeline requisitions=21 candidates=33 need>=5
PASS  leave-requests     leave_requests=18 need>=5

=== Summary: 7/7 PASS ===
```

---

## 4. L2 regression — PASS

| Command | Summary |
|---------|---------|
| `test:pilot:flows` | P-CC-01..08 **11/11** |
| `test:hrm-embed:audit` | P-CC-03..08 + health **8/8** → `hrm-embed-fe-audit-20260523.md` |

---

## 5. Defect delta vs `HRM-FIDELITY-QA-RETEST` (FAIL)

| ID | Prior | This retest |
|----|-------|-------------|
| FID-D-01 | CLOSED | **CLOSED** |
| FID-D-02 | CLOSED | **CLOSED** |
| FID-D-03 | OPEN (10 employees on `main`) | **CLOSED** (1100) |
| FID-D-04 | OPEN (0 contracts) | **CLOSED** (1036) |
| FID-D-05 | OPEN (identical totals) | **CLOSED** (group vs member diverge) |
| FID-D-06 | OPEN | **OPEN** — HRBP not in scope |
| FID-D-07 | IMPROVED | **OPEN** — expiring list HTTP 200, **0** rows |

---

## 6. Gate mapping

| Gate | Status |
|------|--------|
| G-FID-07 DB script | **PASS** |
| G-FID-07 group CEO persona | **PASS** |
| **G-FID-07 overall** | **PASS** |
| L2 P-CC HTTP | **PASS** |
| FID-D-01..05 | **CLOSED** |
| FID-D-06..07 | **OPEN** (defer member/HRBP/expiring UI) |

---

## 7. Handoff

- **ack_status:** `PASS_TO_PM`
- **needed_by:** QC **G-FID-08**; PM may dispatch member CEO seed + HRBP matrix when S1 scope expands
- **evidence_path:** this file; prior FAIL: `hrm-fidelity-qa-retest-20260523.md`

## References

- Dev-BE: `docs/qa/evidence/hrm-fidelity-be-scope-20260523.md`
- Program: `docs/program/HRM_FULL_FIDELITY_PROGRAM.md`
- Bus: `docs/program/AGENT_MESSAGE_BUS.md` — `HRM-FIDELITY-QA-RETEST-2`
