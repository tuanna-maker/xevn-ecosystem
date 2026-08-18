# Evidence — `PO-UC-TC-W4-QC-B2-HRM-MD-R1`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QC-B2-HRM-MD-R1` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — W4-B2 HRM employee metadata queue (UF-HRM-11 · UC-HRM-26) R1 after FE IsJSON fix |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173` · route `/hr/employee-metadata?portal=1&companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-uc-tc-w4-qa-b2-hrm-md-r1.md`](po-uc-tc-w4-qa-b2-hrm-md-r1.md) PASS_TO_PM · Dev [`po-uc-tc-w4-dev-fe-b2-md01-submit-isjson.md`](po-uc-tc-w4-dev-fe-b2-md01-submit-isjson.md) |
| **spec_ref** | `docs/hrm/SRS.md` UC-HRM-26 · UF-HRM-11 · `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE` §5 (AU spot only) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed · no invent Leave L2 |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · `uat_done` remains **false** on MD-01..04 |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded **W4-B2 metadata seat R1** only: browser **HRM-MD-01..04 UI_PASS** after dev-fe IsJSON submit fix; residual **`R-W4-B2-MD01-SUBMIT-ISJSON CLOSED**; L0 + fe-be-health PASS; U65 no seed. Harness runtime JSON **`overall: PARTIAL`** and open **`R-W4-B2-AU-MEMBER-MAIN-METADATA-UNEXPECTED`** are **stale wrong AU expect** (403/409 on member own `main`) — **superseded** by QA narrative AU table + ADR §5 (same pattern as IM-03 GWC). **Network + step verdicts** are SoT for product close. must_keep AT-12 / CREATE-CATALOG / CI01 / BR-WF-04 / IM / Leave L2 **not reopened**. **NOT** Phase 1 / UAT DONE.

**Conditions:** self-approve on MD-03 **OBS only**; reject default note **OBS**; full **J-HRM-MENU-SWEEP** metadata leaf not re-closed this seat; QA entry pack **2/8** process gap; harness JSON cleanup **P3** optional.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `po-uc-tc-w4-qa-b2-hrm-md-r1.md` | PASS_TO_PM · MD-01..04 UI_PASS · IsJSON residual CLOSED | **ACCEPT** product narrative |
| `po-uc-tc-w4-dev-fe-b2-md01-submit-isjson.md` | READY_FOR_QA · FE omit null `current_value` + `{value}` wrap | **ACCEPT** root cause + unit tests cited |
| `_tmp-po-uc-tc-w4-qa-b2-hrm-md-r1-browser.json` | steps MD-01..04 PASS · network 201/200 · 11 PNG paths | **ACCEPT** Network SoT; **reject** `overall` + harness AU residual as product blockers |
| Prior FAIL `po-uc-tc-w4-qa-b2-hrm-md-rollup.md` | MD-01 400 IsJSON | **SUPERSEDED** by R1 |
| by-uc `HRM-MD-01..04.md` | execution **UI_PASS** · **uat_done false** | **ACCEPT** honesty stamp |

---

## Browser / JSON honesty audit

| Check | QA claim | Runtime JSON / disk | QC |
|-------|----------|---------------------|-----|
| MD-01 submit plain text | 201 `HRM-META-201` · row · toast · F5 | `MD-01-MAIN-FE` POST 201 · `toastOk`/`rowVisible`/`afterF5` true | **PASS** |
| MD-01 FD empty | submit disabled · no POST | `MD-01-VAL-FD-EMPTY` PASS | **PASS** |
| MD-02 list | GET 200 `HRM-META-200` · no Sync ERROR | `MD-02-OPEN-MAIN` · network GET 200 total rows | **PASS** |
| MD-03 approve | 201 `HRM-META-202` · pending gone F5 | `MD-03-MAIN-FE` · pending count 4→3 | **PASS** |
| MD-04 reject | 201 `HRM-META-203` · pending gone F5 | `MD-04-MAIN-FE` · reject id cf2750f2… | **PASS** |
| Console / page errors | clean | `consoleErrors`/`pageErrors` [] | **PASS** |
| PNG assets | 11 screens | `03-md01-submit.png` exists · ~105KB; JSON lists 01–10 + final | **PASS** spot + paths |
| Harness `overall` | seat PASS | `overall: PARTIAL` | **PROCESS** — do not demote; steps PASS |
| Harness AU residual | QA table 🟢 | `residuals[]` P1 unexpected 200 | **SUPERSEDED** — wrong expect vs ADR §5 |
| MD-03 self-approve | OBS allowed | `MD-03-APPR-AU-SELF` OBS_ALLOWED | **CONDITION** — not invented PASS for segregation AC |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this seat | QC |
|---------|-------------------|-----|
| **In-seat mutate path** (load queue → submit → Duyệt → Từ chối → F5) | **In-scope** P0 browser | **PASS** — Network 201 chain + F5 pending delta |
| **J-HRM-MENU-SWEEP** (metadata leaf UF-HRM-MENU-17) | Prior 🟡 GWC menu sweep; not full re-walk this gate | **context** — not claimed full sweep re-close |
| **J-HRM-02** employees host | Related embed context only | **not re-closed** this seat |
| Leave L2 | Out of scope | **SPEC_GAP** · not invented |
| AT-12 / CREATE-CATALOG / CI01 / BR-WF-04 / IM | must_keep | **untouched** |

Mandatory for this gate: **metadata queue mutate browser path PASS**. No mandatory J-* marked ⏳ while claiming full Phase1 journey closure.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | MD-01..04 UI_PASS; POST 201 HRM-META-201/202/203; GET HRM-META-200; F5 persistence; **R-W4-B2-MD01-SUBMIT-ISJSON CLOSED** |
| **PROCESS** | QA pack **2/8** (missing command_table · journey_l25); harness `overall PARTIAL` + JSON AU residual vs QA AU table |
| **ENV** | None (L0 200; Windows UV noise waived per QA) |
| **CONDITION / OBS** | MD-03 self-approve OBS · MD-04 default reject note OBS · uat_done **false** |

ENV does not drive verdict. QA pack format gap does **not** demote MD product close.

---

## Residual

| Id | Status | Sev | Blocks this seat GO? |
|----|--------|-----|----------------------|
| **R-W4-B2-MD01-SUBMIT-ISJSON** | **CLOSED** | — | No |
| **R-W4-B2-AU-MEMBER-MAIN-METADATA-UNEXPECTED** (harness JSON only) | **SUPERSEDED** | P3 process | No — member own `main` **200** on metadata list is **ADR §5** consistent; QA AU table documents 409 on holding/xevn mismatch only |
| Leave L2 | SPEC_GAP HOLD | — | No — not invented PASS |
| Phase1 / UAT DONE | — | — | No — **not claimed** |
| **C-B2-QA-PACK-FMT-01** | OPEN process | P3 | qa — add command_table + J-* on next QA MD |

**No open product P0/P1** for W4-B2 metadata R1 slice.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** (`uat_done` **false** on MD-01..04).
2. Do **not** reopen **R-W4-B2-MD01-SUBMIT-ISJSON** without new 400 IsJSON on plain submit.
3. Do **not** FAIL member metadata list **200** on own `main` without holding leak proof — ADR §5 (align IM-03).
4. Do **not** invent Leave L2 PASS or retouch AT-12 / CREATE-CATALOG / CI01 / BR-WF-04 / IM seats without new defect.
5. Self-approve / default reject note remain **OBS** until SRS AC tightens — not blockers for this GWC.
6. Prior W4-B2 MD rollup FAIL on MD-01 is **superseded** by R1.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-b2-hrm-md-r1.md
→ FAIL exit 1 · 2/8 — missing command_table · journey_l25
```

**PROCESS** — product browser evidence independently verified; does not demote close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qc-b2-hrm-md-r1.md
→ PASS exit 0 · 8/8
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-b2-hrm-md-r1.md` | **FAIL** exit **1** · **2/8** (process) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qc-b2-hrm-md-r1.md` | **PASS** exit **0** · **8/8** (post-write) |
| Runtime read `_tmp-po-uc-tc-w4-qa-b2-hrm-md-r1-browser.json` | **PASS** · MD steps + network corroborate QA |
| PNG spot `docs/qa/evidence/screens/po-uc-tc-w4-qa-b2-hrm-md-r1/03-md01-submit.png` | **PASS** · file exists |
| Dev evidence vitest paths (dev-fe handoff) | **ACCEPT** · cited in dev MD |
| ADR §5 read (AU spot alignment) | **PASS** · consistent with QA AU table |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | QA l0 200 + JSON `l0` |
| **LOGIN** | ceo@ · main | **PASS** | JSON env EMAIL |
| **MD-01 CREATE** | plain submit 201 | **PASS** | HRM-META-201 · PNG 03/04 |
| **MD-02 READ** | pending list 200 | **PASS** | HRM-META-200 |
| **MD-03 UPDATE** | approve 201 | **PASS** | HRM-META-202 |
| **MD-04 UPDATE** | reject 201 | **PASS** | HRM-META-203 |
| **F5** | persist / pending delta | **PASS** | afterF5 flags + GET totals |
| **J-HRM-MENU-SWEEP** | metadata leaf | **context** | not full re-sweep this seat |
| **In-seat L2.5** | submit→approve→reject | **PASS** | click_log + network |
| Leave L2 | ladder | **SPEC_GAP** | not invented |

---

## Forbidden compliance (QC)

- No seed · no `apps/**` edit
- Did not invent Phase 1 / UAT DONE
- Did not invent Leave L2 PASS
- Did not reopen must_keep seats
- Did not NO-GO on QA pack 2/8 alone
- Did not treat harness wrong AU expect as product P1 without leak proof
- Opened QA MD + runtime JSON + PNG spot before verdict

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QC-B2-HRM-MD-R1
evidence_path: docs/qa/evidence/po-uc-tc-w4-qc-b2-hrm-md-r1.md
next_owner: pm
verdict: GO WITH CONDITIONS
slice: W4-B2 HRM metadata MD-01..04 R1 only
residual_closed: R-W4-B2-MD01-SUBMIT-ISJSON
uat_done: false
phase1_done: false
```

### completion_report

- **Closed (QC):** L3 GWC for W4-B2 metadata R1 — MD-01..04 browser PASS corroborated by network JSON + PNG spot; IsJSON residual CLOSED; must_keep honored; U65 respected.
- **Open (program):** `uat_done` false; MFD ATT wave parallel; harness JSON AU cleanup P3; QA pack format P3.

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-PM-B2-HRM-MD-R1-INTAKE-01
from_role: pm
to_role: pm
lane: governance
priority: P1
entry_criteria: QC PASS_TO_PM docs/qa/evidence/po-uc-tc-w4-qc-b2-hrm-md-r1.md — GWC W4-B2 metadata R1; R-W4-B2-MD01-SUBMIT-ISJSON CLOSED; uat_done false
exit_criteria: Bus INTAKE closed; TEAM_WORKING_NOW clears QC slot; do NOT reopen MD seat unless new defect; continue in-flight PO-MFD-M1-ATT-* (U87) without blocking on MD; optional P3: qa fix harness AU expect + QA MD pack 8/8 on next MD touch
evidence_path: docs/qa/evidence/po-uc-tc-w4-qc-b2-hrm-md-r1.md
ack_status: PASS_TO_PM
```
