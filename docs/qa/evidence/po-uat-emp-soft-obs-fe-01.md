# Evidence — `PO-UAT-EMP-SOFT-OBS-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UAT-EMP-SOFT-OBS-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution · soft OBS polish only |
| **parent** | `PO-UAT-EMP-QC-01` GWC — soft OBS blocking clean GO |
| **portal / API** | not claimed LIVE here — unit + code delta; QA U65 browser re-gate |
| **U65** | zero-seed · no API mutate evidence · no invent flag |
| **ack_status** | **READY_FOR_QA** |

---

## Goal

Close soft OBS only so QA/QC can re-gate path to `hrm_personnel_uat_ready` — **FE does NOT set the flag**.

| OBS | Sev | Fix |
|-----|-----|-----|
| **OBS-D1-HINT** | P3 | `hdsd-decisions-effective-wh-hint` mounts for catalog `HRD_01`/`HRD_02` + effective + employee |
| **OBS-SI-DATE-ISO** | P2 | SI card + periods list display `dd/MM/yyyy` via `formatInsurancePeriodDateVi` |

---

## Sealed must_keep (not reopened)

| ID | Status | FE note |
|----|--------|---------|
| **R-EMP-DEC-WH-NEO-CATALOG** (D1) | **SEALED** | Hint polish only; WH neo path untouched |
| **R-EMP-SI-ACTION-COMPANY-ID-BODY** (D5) | **SEALED** | `buildInsuranceActionBody` still sends body `company_id`; wire `effective_from` remains `yyyy-MM-dd` |
| **R-J03-DIALOG** | **SEALED** | No contracts Eye / dialog files touched |

Honesty: **`hrm_personnel_uat_ready` not set** (remains false until QC clean GO).

---

## Root cause → fix

### OBS-D1-HINT

- Hint gated on `isPersonBoundDecisionType` which only knew legacy keys (`appointment`…).
- Live catalog path uses **`HRD_01`** (BE-03 already mapped) → harness `hintVisible=false` even when neo + badge PASS.
- **Fix:** Align FE with BE — `hrd_01|hrd_02|hrd_03` person-bound; **`isWorkHistoryNeoDecisionType`** (`hrd_01|hrd_02` + appointment|transfer) drives hint. **HRD_03** person-bound but **no** WH hint (matches BE).

### OBS-SI-DATE-ISO

- Periods list + SI card rendered raw `effective_from` / `start_date` (`2026-08-07` ISO / date-only leak).
- Dialog entry already `ViDateField` (dd/MM/yyyy UX) — kept.
- **Fix:** `formatInsurancePeriodDateVi` → `formatDisplayDate` on periods + card; POST body unchanged.

---

## Files touched (allow-list EMP SI / hint)

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/decisionPersonBound.ts` | HRD_* + `isWorkHistoryNeoDecisionType` |
| `apps/web/hrm/src/lib/decisionPersonBound.test.ts` | HRD_* / neo asserts |
| `apps/web/hrm/src/pages/Decisions.tsx` | Hint gate → neo type |
| `apps/web/hrm/src/lib/insuranceTimelineActions.ts` | `formatInsurancePeriodDateVi` |
| `apps/web/hrm/src/lib/insuranceTimelineActions.test.ts` | locale + wire body assert |
| `apps/web/hrm/src/components/employee/InsuranceTimelineActionsPanel.tsx` | periods display format |
| `apps/web/hrm/src/components/employee/EmployeeInsurance.tsx` | card date format |

**Forbidden / not touched:** Nest API · seed · contracts J03 · invent `hrm_personnel_uat_ready=true`.

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| QC soft OBS | `docs/qa/evidence/po-uat-emp-qc-01.md` · OBS-D1-HINT · OBS-SI-DATE-ISO |
| UAT pack | `docs/qa/evidence/po-uat-emp-01.md` |
| BE parity | `apps/api/hrm-api/src/decisions/decisions.service.ts` PERSON_BOUND / WORK_HISTORY_NEO |
| Locale SoT | `docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md` · `formatDisplayDate` |

---

## Verify (dev)

```bash
cd apps/web/hrm
pnpm exec vitest run \
  src/lib/decisionPersonBound.test.ts \
  src/lib/insuranceTimelineActions.test.ts \
  src/lib/hdsdMutateTestIds.test.ts
```

**Result:** 3 files · **23 PASS** (2026-08-07).

---

## QA accept criteria (U65 browser)

1. **D1 hint:** Decisions → type **HRD_01** (Bổ nhiệm) → employee → status **Có hiệu lực** → `[data-testid=hdsd-decisions-effective-wh-hint]` **visible** → Lưu → neo/badge still PASS (no D1 regress).
2. **D1 negative:** type **HRD_03** + effective → hint **absent** (no invent WH hint).
3. **SI dates:** `?tab=insurance` → periods list after stop/F5 shows **`dd/MM/yyyy`** (e.g. `07/08/2026`), not `2026-08-07` raw ISO on card/periods.
4. **D5 sealed:** stop POST body still has `company_id` + `effective_from` wire `yyyy-MM-dd`.
5. **J03:** do not reopen; spot only if regression feared.
6. **Honesty:** do not claim `hrm_personnel_uat_ready=true` — QC decides after clean GO.

---

## Residual

| ID | Status |
|----|--------|
| OBS-D1-HINT | **CLOSED** (code) — await QA reconfirm |
| OBS-SI-DATE-ISO | **CLOSED** (code) — await QA reconfirm |
| Sealed D1/D5/J03 | **must_keep** |
| `hrm_personnel_uat_ready` | **false** — FE did not set |

**P0/P1 product:** none introduced.

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Soft OBS closed in FE: HRD_* WH hint mount + SI period/card `dd/MM/yyyy`. Sealed D1/D5/J03 untouched. Vitest 23 PASS. Flag not set. READY_FOR_QA. |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-uat-emp-soft-obs-fe-01.md` |
| **ack_status** | **READY_FOR_QA** |

### next_dispatch_prompt

```text
work_item_id: PO-UAT-EMP-SOFT-OBS-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-UAT-EMP-SOFT-OBS-FE-01 READY_FOR_QA
entry_criteria: L0 stack; browser-only U65; FE evidence po-uat-emp-soft-obs-fe-01.md
exit_criteria:
  - OBS-D1-HINT: HRD_01 + effective + employee → hdsd-decisions-effective-wh-hint visible; D1 neo/badge still PASS
  - HRD_03 + effective → hint absent
  - OBS-SI-DATE-ISO: SI card + periods after stop/F5 show dd/MM/yyyy (no raw ISO leak)
  - D5 body company_id still true; J03 not reopened
  - honesty: do NOT set hrm_personnel_uat_ready — PASS_TO_PM → qc for clean GO decision on personnel flag
cấm: seed · api_only_pass · invent hrm_personnel_uat_ready=true
evidence: docs/qa/evidence/po-uat-emp-soft-obs-qa-01.md
```
