# Evidence — `PO-HRM-UI-BRAND-W4-PAY-B-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-PAY-B-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-05 |
| **lane** | L3 governance — W4 brand chrome **ADD-ON** PAY-B (P05–P07, P09, P12, P12b, P14, P17) |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173` · embed `/hr/payroll?portal=1&tenantId=xevn&companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8 pale ban · §15.4 modal · §16 LOCK fonts |
| **Parent gate** | `docs/qa/evidence/po-hrm-ui-brand-w4-qc-01.md` **GWC** — PAY-B is slice add-on; **not** remaster program DONE |
| **QA entry** | `docs/qa/evidence/po-hrm-ui-brand-w4-pay-b-qa.md` · PASS_TO_PM · mutates=**0** |
| **FE entry** | `docs/qa/evidence/po-hrm-ui-brand-w4-pay-b-fe.md` · READY_FOR_QA closed by QA |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · mutates=**0** |
| **NOT claimed** | remaster program DONE · product GO · Attendance CLOSED · Face LIVE · Phase 1 DONE |

---

## Honesty locks (QC verified — all false)

| Flag | Value |
|------|--------|
| **face_live** | **false** |
| **attendance_closed** | **false** |
| **remaster_program_done** | **false** |
| **product_go** | **false** |
| seed / API invent | **None** |
| mutates | **0** |

---

## Verdict summary

**GO WITH CONDITIONS** — PAY-B Precision Motion brand chrome **ACCEPT** for in-scope surfaces P05–P07, P09, P12, P12b tax honesty, P14 reports/payslip detail, P17 advance create chrome + PAY-A overview regression spot. QA browser harness exit **0** · theme-contrast `--strict` exit **0** · machine JSON checks all **pass** · **10** PNG on disk.

**Conditions** = honesty locks (unchanged) + **P2 OBS** P17 approval dialog not opened under U65 (create + Hủy only; no «Duyệt» row — **not** invent batch) + **PROCESS** QA seat pack `verify:qc:evidence-pack` **6/8** (missing formal `J-*` heading + residual heading regex) — **does not** demote product brand ACCEPT when JSON + PNG corroborate.

**NOT** remaster DONE · **NOT** Attendance CLOSED · **NOT** Face LIVE · **NOT** product GO.

---

## QA evidence audit (completeness)

| Area | Requirement | QC audit |
|------|-------------|----------|
| work_item_id / ack | PASS_TO_PM | **PASS** · `PO-HRM-UI-BRAND-W4-PAY-B-QA-01` |
| Persona / URL | U65 browser | **PASS** · `ceo@xe.vn` · portal embed `:5173` |
| Click path | §4 numbered steps | **PASS** · 11 steps · Hủy-only mutates |
| L0 | APIs + portal | **PASS** · HRM 200 · XBOS 200 · login 201 · console 0 |
| HDSD U76 | P05–P07, P09, P12, P14, P17 | **PASS** · inventory table Q1–Q10 |
| theme-contrast | `--strict` exit 0 | **PASS** · cited in QA + JSON |
| Honesty flags | all false | **PASS** · QA § + JSON `honesty` block |
| Machine JSON | reproducible | **PASS** · `_tmp-po-hrm-ui-brand-w4-pay-b-qa-browser.json` |
| Screenshots | paths on disk | **PASS** · **10** files under `docs/qa/evidence/screens/po-hrm-ui-brand-w4-pay-b-qa/` |
| FE handoff alignment | testids / scope | **PASS** · P05–P14 covered; P17 approval dialog testid **not** browser-opened (OBS) |
| Forbidden claims | none in QA | **PASS** · no remaster DONE / Face LIVE / ATT CLOSED / product GO |

**Spot-check (JSON vs QA claims):** P06/P12/P14 dialogs measured **4px** · `rgb(30, 64, 175)` · Montserrat **20px/700**; P12b `hasFakeAdd=false`; PAY-A regression purple=**0**; `mutates`: **[]**.

---

## L2.5 journey audit (brand slice)

| Journey | Scope vs PAY-B | QC |
|---------|----------------|-----|
| **J-HRM-07** | Lương → phiếu / payroll embed chrome · P14 list→detail read-only | **PASS** brand · payslip detail opened existing row · no mutate |
| **J-CC-08** | CC → payroll route (embed) | **PASS** load · chrome only |
| PAY-A regression | Overview not regressed | **PASS** · `pay-overview-precision` |
| Face LIVE / Attendance CLOSED / remaster DONE | Forbidden | **not claimed** |

Mandatory for this gate: PAY-B brand evidence + honesty · **not** full salary lifecycle CLOSED · **not** invent approval batch under U65.

---

## ADR consistency (§8 / §15.4 / §16)

| ADR | Law | PAY-B evidence | QC |
|-----|-----|----------------|-----|
| **§8** Pale ban | sharp text · no slate-muted body cheat | theme-contrast strict **0** · purple=0 on tabs | **PASS** |
| **§15.4** Modal | 4px `#1E40AF` · title ≥20 | bonus · template · payslip detail measured | **PASS** |
| **§16** Fonts LOCK | Montserrat titles ≥20/700 | JSON title probes + QA table | **PASS** |
| Tax honesty | no invent mutate UI | P12b card only · no fake add | **PASS** |

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Brand chrome ACCEPT P05–P07, P09, P12, P12b, P14, P17 create chrome; PAY-A spot; mutates=0; theme-contrast 0 |
| **PROCESS** | QA MD `verify:qc:evidence-pack` **6/8** — no `J-*` token in QA file · `## 8. Residual / honesty` vs gate regex — QC consolidated J-* here |
| **OBS / P2** | P17 advance **approval** dialog (`pay-advance-approval-dialog-precision`) N/A — no approvable row · create+Hủy only · **CONDITION accept** |

---

## Residual

| Id | Status | Sev | Owner | Blocks PAY-B GWC? |
|----|--------|-----|-------|-------------------|
| PAY-B QA browser + JSON + PNG | **CLOSED** this gate | — | — | No |
| **P17_OBS** approval dialog chrome | OPEN OBS | P2 | backlog / qa when row exists U65 | No — documented · no invent |
| QA pack machine gate 6/8 | OPEN PROCESS | P2 | qa template hygiene optional | No |
| remaster DONE / Face LIVE / ATT CLOSED / product GO | — | — | — | **not claimed** |
| W4 parent GWC conditions | **HELD** | P2 | per `po-hrm-ui-brand-w4-qc-01.md` | No — additive slice only |

**No product P0/P1 FAIL** for PAY-B brand chrome. GWC = honesty + P17 OBS + process format.

---

## Conditions (explicit)

1. **NOT remaster program DONE** — `remaster_program_done=false` must remain.
2. **NOT Attendance CLOSED** — `attendance_closed=false` must remain.
3. **NOT Face LIVE** — `face_live=false` must remain.
4. **NOT product GO / Phase 1 DONE**.
5. U65: **no seed**; mutates=**0** on PAY-B seat.
6. **P17 OBS:** advance approval dialog not opened — **CONDITION (accept OBS)**; do not seed/invent «Duyệt» row to pass QC.
7. PAY-B is **ADD-ON** to W4 GWC — does **not** close remaster program or supersede parent honesty locks.

---

## Case matrix (read-only brand)

| Case / AC | Result | Evidence |
|-----------|--------|----------|
| P05 allowance stub | **PASS** | JSON `P05_allowance` · PNG 01 |
| P06 bonus + dialog | **PASS** | bar 4px primary · PNG 02/02b |
| P07 policy sales | **PASS** | PNG 03 |
| P09 data + KPI stub | **PASS** | PNG 04 |
| P12 template + dialog | **PASS** | PNG 05 |
| P12b tax honesty | **PASS** | PNG 06 |
| P14 reports + detail | **PASS** | PNG 07 |
| P17 advance create | **PASS** (OBS approval) | PNG 08 |
| F5 Báo cáo | **PASS** | PNG 09 |
| theme-contrast `--strict` | **PASS** | exit **0** |
| U65 honesty | **PASS** | flags false · mutates=0 |

---

## Forbidden compliance (QC)

- No seed (U65)
- No rewrite `apps/**`
- Did **not** invent Attendance CLOSED / Face LIVE / remaster DONE / product GO
- Did **not** NO-GO on P17 OBS alone (sponsor mission: condition or accept OBS)
- Did **not** claim remaster program DONE or close full W4 remaster on PAY-B alone

---

## Evidence-pack gate

### QA seat (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w4-pay-b-qa.md
→ FAIL exit 1 (6/8)
  - journey_l25: no J-* id in QA MD
  - residual_section: heading format vs gate regex (## 8. Residual / honesty)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w4-pay-b-qa.md --check-assets
→ blocked by incomplete pack (same 6/8)
```

**QC note:** PROCESS gap only — browser JSON + PNG + QA §4 click path satisfy L3 product audit (same treatment as W4 consolidated QC on seat `journey_l25` gaps).

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w4-pay-b-qc-01.md
→ PASS exit 0 (8/8)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w4-pay-b-qc-01.md --check-assets
→ PASS exit 0
```

---

## Command table (QC independent)

| Command / check | Result |
|-----------------|--------|
| Read QA `po-hrm-ui-brand-w4-pay-b-qa.md` | **PASS** · PASS_TO_PM · 12/12 matrix |
| Read FE `po-hrm-ui-brand-w4-pay-b-fe.md` | **PASS** · scope aligned |
| JSON `_tmp-po-hrm-ui-brand-w4-pay-b-qa-browser.json` | **PASS** · checks pass · mutates [] |
| Disk PNG `screens/po-hrm-ui-brand-w4-pay-b-qa/` | **PASS** · **10** files |
| Parent `po-hrm-ui-brand-w4-qc-01.md` GWC | **PASS** · additive PAY-B not remaster DONE |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w4-pay-b-qa.md` | **FAIL** exit **1** · **6/8** (process) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w4-pay-b-qc-01.md` | **PASS** exit **0** · **8/8** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w4-pay-b-qc-01.md --check-assets` | **PASS** exit **0** |
| Honesty flags | **PASS** · all **false** |

---

## completion_report

**Closed:** L3 QC `PO-HRM-UI-BRAND-W4-PAY-B-QC-01` — **GO WITH CONDITIONS**. Audited QA PASS pack: U65 browser on portal `:5173` embed · 12/12 AC · theme-contrast `--strict` exit **0** · harness exit **0** · machine JSON corroborates dialog chrome and PAY-A regression · **10** PNG present. Honesty locks remain **false**; mutates=**0**. P17 approval dialog **P2 OBS** accepted as **CONDITION** (no invent under U65). QA evidence-pack machine score **6/8** (process only). PAY-B is **ADD-ON** to W4 GWC — **not** remaster program DONE.

**Open (conditions):** P17_OBS approval dialog · optional QA pack J-* heading hygiene · parent W4 GWC residuals unchanged.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W4-PM-PAY-B-STAMP-01
from_role: pm
to_role: pm
priority: P1
lane: governance
entry_criteria: PO-HRM-UI-BRAND-W4-PAY-B-QC-01 GO WITH CONDITIONS · evidence docs/qa/evidence/po-hrm-ui-brand-w4-pay-b-qc-01.md · QA mutates=0 · honesty all false
scope: Stamp brand tracker — PAY-B (P05–P07,P09,P12,P12b,P14,P17) GWC CLOSED additive to W4 parent; keep remaster_program_done=false · attendance_closed=false · face_live=false · product_go=false
optional_parallel:
  - next W4 slice per backlog (REC-B / EMP neo / etc.) — not reopen PAY-B without FAIL
  - qa optional: P17 approval dialog when approvable row exists (U65 no seed)
cấm: remaster DONE · Attendance CLOSED · Face LIVE · product GO · seed · claim PAY-B closes full remaster
ack_status target: PASS_TO_PM (program delta)
evidence_path: docs/program/TEAM_WORKING_NOW.md or HRM_UI_BRAND program status
```

## ack_status

**PASS_TO_PM**

## evidence_path

`docs/qa/evidence/po-hrm-ui-brand-w4-pay-b-qc-01.md`
