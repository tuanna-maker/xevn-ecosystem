# Evidence — `PO-MFD-M2-ATT-REQUESTS-01-R2-QC`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-REQUESTS-01-R2-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — ATT-C4 **Quản lý đơn** requests loading + late-early create→F5 (#20/#22/#24 LIVE) |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **uat_done** | **false** |
| **entry** | QA [`po-mfd-m2-att-requests-01-r2-qa.md`](po-mfd-m2-att-requests-01-r2-qa.md) PASS_TO_PM · FE [`po-mfd-m2-att-requests-fe-loading-01.md`](po-mfd-m2-att-requests-fe-loading-01.md) · R1 FAIL [`po-mfd-m2-att-requests-01-qa.md`](po-mfd-m2-att-requests-01-qa.md) · runtime [`_tmp-po-mfd-m2-att-requests-01-r2-browser.json`](_tmp-po-mfd-m2-att-requests-01-r2-browser.json) |
| **spec_ref** | ATT-C4 · matrix #20–24 · `HRM-ATTENDANCE_FIDELITY_MATRIX.md` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed · FE late-early create only |
| **stamp** | `REQ2-EATJL6` |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · full Attendance CLOSED · invent FAIL on LEAVE/OT/CLOCK GWC |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded ATT-C4 **Quản lý đơn** R2 slice only: loading storm residuals CLOSED (`idleGets=0` on #20/#21/#22/#23/#24), CTA mounts, late-early U65 create **201** `HRM-LE-REQ-201` + FE + **F5** stamp `REQ2-EATJL6`. Matrix #20/#22/#24 **LIVE** (consistent with QA + fidelity matrix stamp). OT (#21) / update (#23) spot LIVE only — prior OT approve GWC **not reopened**. OBS raw `common.selectDate` + ISO date display = **non-blocking**. **uat_done=false**. **NOT** Attendance module CLOSED · **NOT** Phase 1 / UAT DONE.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `po-mfd-m2-att-requests-fe-loading-01.md` | FE `h()` deps FIX · READY_FOR_QA | **ACCEPT** root-cause class |
| `po-mfd-m2-att-requests-01-qa.md` | R1 FAIL · GET storm (#20 idle 85 / #22 94 / #24 55) | **ACCEPT** prior FAIL |
| `po-mfd-m2-att-requests-01-r2-qa.md` | PASS_TO_PM · residuals CLOSED · 201+F5 · #20/#22/#24 LIVE | **ACCEPT** product |
| `_tmp-po-mfd-m2-att-requests-01-r2-browser.json` | `verdict: PASS` · idleGets=0 · POST 201 · f5 stamp · stamps 20–24 LIVE | **ACCEPT** Network SoT |
| Matrix `HRM-ATTENDANCE_FIDELITY_MATRIX.md` #20–24 | **LIVE** (`REQUESTS-01-R2` …) | **ACCEPT** consistent with QA |
| Screens PNG (11) | list/CTA · modal selectDate · filled · F5 stamp · OT/trip/update/shift lists | **ACCEPT** spot-check |

---

## Independent spot-check (QC)

### EC1 — Idle GET storm CLOSED + CTA

| Surface | idleGets | CTA | storm | runtime JSON |
|--------:|---------:|-----|-------|--------------|
| #20 late-early | **0** | Thêm đơn | false | LIVE |
| #21 OT | **0** | Thêm đơn tăng ca | false | LIVE (spot) |
| #22 business-trip | **0** | Thêm đề nghị | false | LIVE |
| #23 update-attendance | **0** | Thêm đề nghị | false | LIVE (spot) |
| #24 shift-change | **0** | Thêm đề nghị | false | LIVE |

R1 contrast (QA): #20 idle **85** / #22 **94** / #24 **55** → R2 all **0**.

**PASS** — residuals `R-MFD-M2-REQ-*-LOADING` + `R-MFD-M2-REQ-MUTATE-CTA` **CLOSED**.

### EC2 — U65 late-early create → F5

| Check | Result |
|-------|--------|
| Create POST | **201** `HRM-LE-REQ-201` · id `7e7271ec-0fcd-4895-a54f-ee1244978738` · path `/api/hrm/attendance/late-early-requests` · `xCompanyId=main` · query OU `trsport` |
| FE after 2xx | mutate `createOk=true` · reason `created` |
| F5 | `stampVisible=true` · `rowCount=1` · stamp `REQ2-EATJL6` |
| Seed | **None** (U65; FE modal only) |

**PASS** — primary mutate AC closed.

### EC3 — PNG spot (UI after 2xx + OBS)

| Screen | Observed |
|--------|----------|
| `20-late-early-list.png` | LIVE list · **+ Thêm đơn** · no spinner · empty honesty pre-mutate |
| `20-late-early-modal.png` | Date trigger shows raw **`common.selectDate`** → confirms **OBS-MFD-M2-REQ-SELECTDATE-I18N** |
| `20-late-early-filled.png` | Employee VTH-0007 · date picked · reason stamp · Thêm mới |
| `f5-late-early.png` | KPI Tổng đơn=1 · Chờ duyệt=1 · reason `REQ2-EATJL6` · date column ISO `2026-09-03T17:00:00.000Z` → **OBS-MFD-M2-REQ-DATE-ISO-DISPLAY** |
| `22-business-trip-list.png` | LIVE · **+ Thêm đề nghị** · empty honesty · no spinner |

**PASS** — FE after create+F5 aligns Network SoT; OBS confirmed non-blocking.

### EC4 — Matrix consistency (#20/#22/#24 LIVE)

| # | QA R2 stamp | Matrix file stamp | QC |
|---|-------------|-------------------|-----|
| 20 | LIVE (idle0 + CTA + 201 + F5) | **LIVE** (`REQUESTS-01-R2` create 201+F5 · loading CLOSED) | **MATCH** |
| 21 | LIVE spot (OT GWC not reopened) | **LIVE** (OT spot + OT-FE-APPROVE GWC CLOSED) | **MATCH** |
| 22 | LIVE idle0+CTA | **LIVE** (`REQUESTS-01-R2` trip idle0+CTA) | **MATCH** |
| 23 | LIVE spot | **LIVE** (REQUESTS-01 / R2 list+CTA) | **MATCH** |
| 24 | LIVE idle0+CTA | **LIVE** (`REQUESTS-01-R2` shift-change idle0+CTA) | **MATCH** |

**PASS** — no invent CLOSED beyond LIVE stamp for this seat.

### EC5 — Forbidden honesty / prior GWC

| Check | Result |
|-------|--------|
| Seed | QA + FE + QC: **no** `pnpm seed:*` |
| Full Attendance CLOSED | **not claimed** |
| uat_done | **false** |
| Phase1 / UAT DONE | **not claimed** |
| LEAVE / OT / CLOCK GWC | **not reopened** as invent FAIL (OT spot only; leave/clock untouched) |

**PASS**

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P0 | QC |
|---------|------------------|-----|
| **ATT-C4** Quản lý đơn late-early create → F5 (#20) | In-scope mutate this WI | **PASS** (Network 201 + PNG F5) |
| **ATT-C4** trip / shift-change list+CTA (#22/#24) | In-scope loading CLOSE | **PASS** (idleGets=0 + PNG) |
| **J-HRM-06** Chấm công → yêu cầu | Host attendance journey (prior map) | **not reopened / not claimed closed anew** — requests R2 slice only |
| Leave WF / OT approve / CLOCK GPS | Prior GWC seats | **untouched** — not invent FAIL |

No invent of full Attendance / full J-HRM-06 re-gate. Mandatory in-scope click-path has Network + PNG evidence.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Loading storm CLOSED (idle GET 0/5s) · CTA mounts · late-early create **201** `HRM-LE-REQ-201` → FE + F5 stamp · matrix #20/#22/#24 LIVE |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **2/8** (missing portal_url · journey_l25) — process-only; FE loading pack **2/8** same class |
| **ENV** | None (L0 hrm/portal 200 in runtime JSON; QA L0 entry+exit PASS) |
| **OBS (optional)** | Raw `common.selectDate` on date trigger · list date ISO `2026-09-03T17:00:00.000Z` vs vi-VN · `x-company-id=main` + query `company_id=trsport` |
| **OUT-OF-SCOPE** | Full Attendance CLOSED · Phase1/UAT DONE · invent FAIL LEAVE/OT/CLOCK · trip/shift-change/update full mutate approve |

ENV does not drive verdict. Process pack gap + OBS do **not** demote requests R2 slice close.

---

## Residual

| Id | Status | Sev | Owner | Blocks this GWC? |
|----|--------|-----|-------|------------------|
| **R-MFD-M2-REQ-LATE-EARLY-LOADING** | **CLOSED** | — | — | No |
| **R-MFD-M2-REQ-BUSINESS-TRIP-LOADING** | **CLOSED** | — | — | No |
| **R-MFD-M2-REQ-CHANGE-SHIFT-LOADING** | **CLOSED** | — | — | No |
| **R-MFD-M2-REQ-MUTATE-CTA** | **CLOSED** | — | — | No |
| **OBS-MFD-M2-REQ-SELECTDATE-I18N** | OPEN optional | P2 | optional dev-fe | **No** — raw `common.selectDate` |
| **OBS-MFD-M2-REQ-DATE-ISO-DISPLAY** | OPEN optional | P2 | optional dev-fe | **No** — vi-VN `dd/MM/yyyy` |
| **C-MFD-M2-QA-PACK-FMT-REQ-R2** | OPEN process | P3 | qa | No — add portal_url · J-* on next QA MD |
| Full Attendance / Phase1 / UAT DONE | — | — | — | No — **not claimed** |

**No residual product P0/P1** open for the **requests R2 loading + late-early create** slice.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. Do **not** claim full **Attendance** module CLOSED.
3. **uat_done** remains **false**.
4. OBS `common.selectDate` + ISO date = **optional** polish — not invent FAIL on create AC.
5. U65: **no seed**.
6. LEAVE / OT / CLOCK prior GWC remain valid — **not reopened** as invent FAIL; OT/update = spot LIVE only.
7. Trip / shift-change / update full mutate→approve **not** claimed CLOSED by this seat (list+CTA LIVE only for #22/#24; #23 spot).

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-requests-01-r2-qa.md
→ FAIL 2/8 — missing portal_url, journey_l25
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote requests R2 close.

### FE loading pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-requests-fe-loading-01.md
→ FAIL 2/8 — missing portal_url, journey_l25
```

**PROCESS** — not product NO-GO.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-requests-01-r2-qc.md
→ PASS exit 0 (8/8) [target after write]
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-requests-01-r2-qa.md` | **FAIL** exit **1** · **2/8** missing portal_url / journey_l25 (process) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-requests-fe-loading-01.md` | **FAIL** exit **1** · **2/8** (process) |
| Runtime cross-check `_tmp-po-mfd-m2-att-requests-01-r2-browser.json` | **PASS** · idleGets=0 ×5 · POST 201 HRM-LE-REQ-201 · f5 stamp · stamps 20–24 LIVE · verdict PASS |
| Open QA MD `po-mfd-m2-att-requests-01-r2-qa.md` | **PASS** · U65 · residuals CLOSED · no Attendance invent |
| Open FE MD `po-mfd-m2-att-requests-fe-loading-01.md` | **PASS** · loading FIX prior |
| Open matrix #20–24 LIVE rows | **PASS** · matches QA stamp |
| PNG spot list / modal / filled / F5 / trip | **PASS** · CTA · selectDate OBS · stamp · ISO OBS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-requests-01-r2-qc.md` | **PASS** exit **0** (8/8) |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** | stack health entry+exit | **PASS** | QA L0 + runtime l0 200 |
| **READ** #20/#22/#24 settle | idle GET 0/5s · CTA visible · no storm | **PASS** | browser JSON tabs + PNG |
| **CREATE** late-early (NV FE) | POST 201 HRM-LE-REQ-201 | **PASS** | network + mutate |
| **READ** F5 after create | stamp REQ2-EATJL6 persists | **PASS** | f5 + PNG f5-late-early |
| **Matrix #20/#22/#24** | LIVE stamp | **PASS** | fidelity matrix + QA |
| **#21 OT / #23 update** | spot LIVE only | **PASS** | spot honesty · OT GWC not reopened |
| **J-HRM-06** host | attendance journey map | **not re-gated** | honesty |
| LEAVE / CLOCK GWC | prior seats | **untouched** | honesty |
| Full Attendance CLOSED | program | **NOT CLAIMED** | — |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE
- Did not invent full Attendance CLOSED
- Did not reopen LEAVE / OT / CLOCK GWC as invent FAIL
- Did not NO-GO solely on QA pack format gap or OBS i18n/date
- Did not GO without opening QA MD + FE MD + browser JSON + matrix + PNG spot

---

## completion_report

**Closed:** L3 QC gate `PO-MFD-M2-ATT-REQUESTS-01-R2-QC` for ATT-C4 Quản lý đơn R2 — loading residuals CLOSED (`idleGets=0`), CTA mounts, late-early create **201** `HRM-LE-REQ-201` + F5 stamp `REQ2-EATJL6`. Matrix #20/#22/#24 **LIVE** consistent with QA. OT/update spot LIVE; LEAVE/OT/CLOCK GWC not reopened. U65 zero-seed. OBS selectDate/ISO optional only.

**Residual / conditions:** OBS-MFD-M2-REQ-SELECTDATE-I18N + OBS-MFD-M2-REQ-DATE-ISO-DISPLAY (P2 optional); QA pack format P3; **uat_done=false**; **NOT** Attendance CLOSED · **NOT** Phase1/UAT DONE.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/po-mfd-m2-att-requests-01-r2-qc.md`

---

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-REQUESTS-01-R2-PM-CLOSE
from_role: qc
to_role: pm
lane: execution
priority: P0
entry_criteria:
  - docs/qa/evidence/po-mfd-m2-att-requests-01-r2-qc.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - Loading residuals R-MFD-M2-REQ-*-LOADING + R-MFD-M2-REQ-MUTATE-CTA CLOSED
  - Late-early create 201 HRM-LE-REQ-201 + F5 stamp REQ2-EATJL6
  - Matrix #20/#22/#24 LIVE (consistent QA + fidelity matrix)
action:
  1) Bus INTAKE PO-MFD-M2-ATT-REQUESTS-01-R2-QC PASS_TO_PM + mark requests loading/CTA residuals CLOSED on backlog / TEAM_WORKING_NOW
  2) Optional polish seat (P2, not blocker): OBS common.selectDate i18n + late-early date dd/MM/yyyy — only if capacity; do not invent FAIL
  3) Do NOT claim full Attendance CLOSED / product UAT DONE / Phase 1 DONE / uat_done=true from this GWC
  4) Do NOT reopen LEAVE / OT / CLOCK GWC without new FAIL evidence
  5) Continue next open MFD / PM_OPEN_BACKLOG item — do not idle
cấm: seed · invent Attendance CLOSED · invent UAT DONE · reopen LEAVE/OT/CLOCK without new FAIL
```

---

## pm_dispatch_hint

Close REQUESTS-01-R2 loading/CTA residuals; keep Attendance program open; OBS i18n/date polish only; do not invent ATT CLOSED.
