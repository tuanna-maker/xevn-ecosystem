# Evidence — `PO-MFD-M2-ATT-SCOPE-01-QC`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SCOPE-01-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — ATT-C4 / FR-HRM-AT-10 **leave approve scope only** |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-mfd-m2-att-scope-01-qa.md`](po-mfd-m2-att-scope-01-qa.md) PASS_TO_PM · Dev-BE [`po-mfd-m2-att-scope-01.md`](po-mfd-m2-att-scope-01.md) READY_FOR_QA · runtime [`_tmp-po-mfd-m2-att-scope-01-qa-browser.json`](_tmp-po-mfd-m2-att-scope-01-qa-browser.json) |
| **spec_ref** | FR-HRM-AT-10 · TECHSPEC §14.5 · ATT-C4 · U78 pattern (must_keep, not retested) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed · FE leave create→Duyệt only |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · full Attendance CLOSED · OT browser approve PASS · U78 update-request regression PASS · other C4 types (business-trip / late-early / shift-change) |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded leave-approve scope (ATT-C4 / FR-HRM-AT-10) only. U65 browser FE: NV create leave → QL **Duyệt** → Network **201** `HRM-LEAVE-203` · FE **Đã duyệt** · **F5** PASS (`STAMP` `M2MAIN-8BWR9`). No seed. OT browser Duyệt remains **BLOCKED** (`R-MFD-M2-OT-FE-APPROVE`) — CONDITION, not leave-slice NO-GO. U78 update-request path **not claimed** retested this seat (must_keep honesty). **NOT** Phase 1 / UAT DONE.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-mfd-m2-att-scope-01.md` | READY_FOR_QA · leave/OT mutate `resolveScopeContext` · jest 73/73 · must_keep U78 | **ACCEPT** |
| `docs/qa/evidence/po-mfd-m2-att-scope-01-qa.md` | PASS_TO_PM · leave U65 PASS · OT BLOCKED · L1 main probe narrative | **ACCEPT** (product leave) |
| `_tmp-po-mfd-m2-att-scope-01-qa-browser.json` | `PARTIAL_PASS` · leave create 201 / approve 201 / f5 true · ot pendingApproveBtns=0 | **ACCEPT** Network SoT |
| Screens PNG | None listed this seat | **OBS** process P3 — Network JSON SoT stands |

---

## Independent spot-check (QC)

### EC1 — U65 FE leave create → Duyệt → F5

| Check | Result |
|-------|--------|
| Runtime create | **PASS** · POST leave-requests **201** `HRM-LEAVE-201` · id `407f8c4c-…` · `xCompanyId=main` |
| Runtime approve | **PASS** · POST `…/approve` **201** `HRM-LEAVE-203` · `requestStatus=approved` · `clicked=true` |
| Runtime F5 | **PASS** · `f5: true` |
| Seed | **None** (U65) |

**PASS** — leave slice product AC closed.

### EC2 — M2 `x-company-id=main` approve (no 409)

| Check | Result |
|-------|--------|
| Browser Network approve header (JSON) | **`trsport`** (FE mutate-scope parity AT-12; storage inject `main` did not force approve header) |
| Create header (JSON) | **`main`** · 201 |
| QA L1 probe narrative | Claims POST approve pending OU row with header **`main`** → **201** `HRM-LEAVE-203` (no separate probe JSON file) |
| Controller code | `approveLeaveRequest` uses `resolveScopeContext(…).companyId` (U78 parity) — supports M2 intent |

**PASS (product leave path)** · **OBS process:** machine SoT for **approve@main** is QA narrative L1 + controller/jest; browser JSON proves approve@**trsport** 201 without 409. Does **not** demote U65 leave FE PASS for this GWC.

### EC3 — OT approve

| Check | Result |
|-------|--------|
| Runtime `ot.pendingApproveBtns` | **0** |
| FE OT create this seat | **No** (U65; no seed) |
| Verdict | 🟡 **BLOCKED** → residual `R-MFD-M2-OT-FE-APPROVE` |

**CONDITION** — not leave-slice NO-GO (per PM dispatch).

### EC4 — U78 update-request regression honesty

| Check | Result |
|-------|--------|
| QA claims U78 retest PASS? | **No** |
| Dev-BE must_keep U78 | Documented; path not exercised this seat |
| QC invent U78 PASS? | **Forbidden — not claimed** |

**PASS** (process honesty) — no U78 update-request regression claimed without evidence.

### EC5 — U65 / forbidden claims

| Check | Result |
|-------|--------|
| Seed | QA + Dev-BE + QC: **no** `pnpm seed:*` |
| Full Attendance CLOSED | **not claimed** |
| OT invent PASS | **not claimed** |
| UAT / Phase1 DONE | **not claimed** |

**PASS**

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P1 | QC |
|---------|------------------|-----|
| Leave list → Duyệt → F5 (HRM-AT-10 / AT-12 L1 surface) | In-scope C4 leave mutate | **PASS** this seat (browser JSON) |
| **J-HRM-06** full attendance journey map row | Broader than leave-approve scope | **not reopened / not claimed closed anew** |
| OT FE create → Duyệt | In-scope residual only | **DEFERRED** CONDITION |
| Other C4 request types | OOS this WI | **untouched** |

No mandatory in-scope leave J-* claimed PASS without Network evidence. Full Phase1 journey closure **not** claimed.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Leave U65 create **201** → Duyệt **201** `HRM-LEAVE-203` → FE Đã duyệt → F5 · no 409 on approve path |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **2/8** (missing command_table · crud_or_matrix) — process-only; no PNG seat; approve@main L1 narrative without probe JSON (OBS) |
| **ENV** | None driving verdict (QA L0 hrm/portal 200; portal flaky mid-run restarted — not product FAIL) |
| **OUT-OF-SCOPE / CONDITION** | `R-MFD-M2-OT-FE-APPROVE` · U78 retest · other C4 types · full Attendance · Phase1/UAT DONE |

ENV does not drive verdict. Process pack gap + OBS do **not** demote leave-slice close.

---

## Residual

| Id | Status | Sev | Owner | Blocks this leave GWC? |
|----|--------|-----|-------|------------------------|
| **R-MFD-M2-OT-FE-APPROVE** | OPEN CONDITION · BLOCKED | P1 | qa (+ optional dev-fe if OT create UX blocks HP) | **No** — OT CONDITION per dispatch |
| **OBS-MFD-M2-APPROVE-MAIN-JSON** | OPEN info | P3 | qa | No — attach L1 probe JSON or capture approve Network with header `main` on next seat |
| **C-MFD-M2-QA-PACK-FMT-01** | OPEN process | P3 | qa | No — add command_table + CRUD/L2.5 matrix on next QA MD |
| U78 update-request browser retest | untouched must_keep | — | qa only if reopen | No — **not claimed PASS** |
| Other C4 (trip / late-early / shift) | OOS | — | program | No |
| Phase1 / UAT DONE | — | — | — | No — **not claimed** |

**No residual product P0** open for the **leave approve** slice.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. **OT** `R-MFD-M2-OT-FE-APPROVE` remains **CONDITION (BLOCKED)** — do **not** invent OT PASS.
3. Do **not** claim full Attendance CLOSED or other C4 types closed.
4. Do **not** claim **U78** update-request regression PASS without a dedicated browser/API evidence seat.
5. U65: **no seed** for OT pending rows to force Duyệt.
6. Leave slice closed on Network SoT; OBS approve@main machine artifact is backlog, not reopen trigger unless new 409 FAIL.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-scope-01-qa.md
→ FAIL 2/8 — missing command_table, crud_or_matrix
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote leave close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-scope-01-qc.md
→ PASS exit 0 (8/8) [target after write]
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-scope-01-qa.md` | **FAIL** exit **1** · **2/8** missing command_table / crud_or_matrix (process) |
| Runtime cross-check `docs/qa/evidence/_tmp-po-mfd-m2-att-scope-01-qa-browser.json` | **PASS** · leave 201/201/f5 · ot buttons=0 · verdict PARTIAL_PASS |
| Open QA MD `po-mfd-m2-att-scope-01-qa.md` | **PASS** · U65 leave PASS · OT BLOCKED · no U78 invent |
| Open Dev-BE MD `po-mfd-m2-att-scope-01.md` | **PASS** · READY_FOR_QA · resolveScopeContext · must_keep U78 |
| Controller spot `attendance.controller.ts` approveLeaveRequest | **PASS** · `resolveScopeContext` → `scope.companyId` |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-scope-01-qc.md` | **PASS** exit **0** (8/8) |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | QA entry hrm/portal 200 |
| **CREATE** leave (NV FE) | POST 201 HRM-LEAVE-201 | **PASS** | browser JSON · stamp M2MAIN-8BWR9 |
| **UPDATE** leave approve (QL FE) | POST 201 HRM-LEAVE-203 · FE Đã duyệt | **PASS** | browser JSON approve + clicked |
| **READ** F5 after approve | status persists | **PASS** | browser JSON `f5: true` |
| **SCOPE** no 409 on approve | no SCOPE_CONTEXT_MISMATCH | **PASS** | status 201 / code HRM-LEAVE-203 |
| **OT** FE Duyệt | pending + 201 | **BLOCKED / CONDITION** | `pendingApproveBtns=0` |
| **U78** update-request | regression retest | **NOT RUN / not claimed** | honesty |
| L2.5 leave list→Duyệt→F5 | cross-nav mutate | **PASS** | this seat leave path |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE
- Did not invent OT browser PASS
- Did not invent U78 update-request regression PASS
- Did not NO-GO solely on QA pack format gap or OT CONDITION
- Did not GO without opening QA MD + Dev-BE MD + browser JSON
- Did not claim full Attendance CLOSED

---

## completion_report

**Closed:** L3 QC gate `PO-MFD-M2-ATT-SCOPE-01-QC` for **leave approve scope** (ATT-C4 / FR-HRM-AT-10). Spot-check Network create **201** + approve **201** `HRM-LEAVE-203` + F5. U65 zero-seed. U78 **not** falsely claimed. OT residual documented as CONDITION.

**Residual / conditions:** `R-MFD-M2-OT-FE-APPROVE` (qa); OBS approve@main JSON (qa P3); QA pack format P3; **NOT** Phase1/UAT DONE.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/po-mfd-m2-att-scope-01-qc.md`

---

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-SCOPE-01-PM-CLOSE
from_role: qc
to_role: pm
lane: execution
priority: P1
entry_criteria:
  - docs/qa/evidence/po-mfd-m2-att-scope-01-qc.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - Leave approve scope CLOSED (U65 FE create→Duyệt→F5 · 201 HRM-LEAVE-203)
  - OT residual R-MFD-M2-OT-FE-APPROVE OPEN CONDITION (BLOCKED — no pending OT from FE)
action:
  1) Bus INTAKE PO-MFD-M2-ATT-SCOPE-01-QC PASS_TO_PM + mark leave-scope slice CLOSED on backlog / TEAM_WORKING_NOW
  2) Optional seat: PO-MFD-M2-OT-FE-APPROVE-QA — U65 FE create OT (uat.nv0007) → QL Duyệt → Network 2xx + F5; cấm seed; persona main/trsport same as leave seat
  3) Do NOT claim full Attendance CLOSED / product UAT DONE / Phase 1 DONE from this GWC
  4) Do NOT invent U78 update-request PASS; only reopen U78 if new FAIL evidence
  5) Continue next open MFD / PM_OPEN_BACKLOG item — do not idle
cấm: seed · invent OT PASS · invent UAT DONE · claim full ATT CLOSED
```

---

## pm_dispatch_hint

Close leave-scope M2 slice; keep OT as optional FE create→approve seat; do not invent U78/UAT.
