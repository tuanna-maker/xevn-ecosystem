# Evidence — `PO-MFD-M2-OT-FE-APPROVE-QC-R2`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-OT-FE-APPROVE-QC-R2` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — FR-HRM-AT-10 / ATT-C4 **OT FE create → Eye → Duyệt → F5 only** |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **uat_done** | **false** |
| **entry** | QA [`po-mfd-m2-ot-fe-approve-qa-r2.md`](po-mfd-m2-ot-fe-approve-qa-r2.md) PASS_TO_PM · FE [`po-mfd-m2-ot-fe-loading-01.md`](po-mfd-m2-ot-fe-loading-01.md) READY_FOR_QA · leave GWC [`po-mfd-m2-att-scope-01-qc.md`](po-mfd-m2-att-scope-01-qc.md) · runtime [`_tmp-po-mfd-m2-ot-fe-approve-qa-r2-browser.json`](_tmp-po-mfd-m2-ot-fe-approve-qa-r2-browser.json) |
| **spec_ref** | FR-HRM-AT-10 · ATT-C4 OT · residual `R-MFD-M2-OT-FE-APPROVE` / `R-MFD-M2-OT-FE-LOADING` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed · FE OT create→Duyệt only |
| **stamp** | `OTR2-E97UF2` |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · full Attendance CLOSED · other C4 types · leave U78 retest |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded OT FE create→approve slice (FR-HRM-AT-10 / ATT-C4) only. U65 browser: NV create → Network **201** `HRM-OT-201` → QL Eye→**Duyệt** → **201** `HRM-OT-203` → FE + **F5** stamp `OTR2-E97UF2` approved. Loading storm **CLOSED** (`idleGets=0`). Residuals `R-MFD-M2-OT-FE-LOADING` + `R-MFD-M2-OT-FE-APPROVE` **CLOSED** (supersedes leave-scope GWC CONDITION). OBS i18n badge keys + ISO date = optional, not invent FAIL. **uat_done=false**. **NOT** Attendance module CLOSED · **NOT** Phase 1 / UAT DONE.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `po-mfd-m2-ot-fe-loading-01.md` | READY_FOR_QA · `useOvertimeRequests` unstable `h` FIX · vitest 3/3 | **ACCEPT** root-cause class |
| `po-mfd-m2-ot-fe-approve-qa-r2.md` | PASS_TO_PM · create 201 + approve 201 + F5 · U65 · residuals CLOSED | **ACCEPT** product OT |
| `_tmp-po-mfd-m2-ot-fe-approve-qa-r2-browser.json` | `verdict: PASS` · network 201/201 · idleGets=0 · f5 pass | **ACCEPT** Network SoT |
| `po-mfd-m2-att-scope-01-qc.md` | GWC leave · OT CONDITION `R-MFD-M2-OT-FE-APPROVE` | **ACCEPT** prior; OT CONDITION **closed this seat** |
| Screens PNG (9) | create toast · approve toast · F5 stamp | **ACCEPT** spot-check |

---

## Independent spot-check (QC)

### EC1 — Loading storm CLOSED (R-MFD-M2-OT-FE-LOADING)

| Check | Result |
|-------|--------|
| Runtime `ot.idleGetsAfterSettle` | **0** (AC ≤2/5s) |
| Runtime `ot_idle_gets` step | **PASS** · `totalGetsBeforeWindow=1` |
| CTA `Thêm đơn tăng ca` | **true** · `stillLoad=false` |
| Network list GETs (captured) | **3×** GET 200 over full run (settle + post-create + F5) — **not** R1 ~124/20s |

**PASS** — residual **CLOSED**.

### EC2 — U65 FE OT create → Duyệt → F5

| Check | Result |
|-------|--------|
| Create POST | **201** `HRM-OT-201` · id `b3f995e2-6218-44fc-8909-e6ba103169b9` · `xCompanyId=main` · query OU `trsport` |
| Approve POST | **201** `HRM-OT-203` · `requestStatus=approved` · `eyeClicked=true` · `approveClicked=true` |
| FE after approve | `feStatusAfter=true` |
| F5 | `stampOk=true` · `approvedOk=true` · row text includes `OTR2-E97UF2` + `status.approved` |
| Seed | **None** (U65; FE-origin retries noted in QA honesty) |

**PASS** — residual `R-MFD-M2-OT-FE-APPROVE` **CLOSED**.

### EC3 — PNG spot (UI after 2xx)

| Screen | Observed |
|--------|----------|
| `05-ot-after-submit.png` | Toast «Đã tạo đơn làm thêm giờ» · stamp reason OTR2 · CTA visible |
| `08-ot-after-approve.png` | Toast «Đã duyệt đơn» · stamp row `status.approved` |
| `09-ot-f5.png` | After reload: stamp row remains `status.approved` · CTA still mounted |

**PASS** — FE after 2xx + F5 aligns Network SoT.

### EC4 — Close leave-scope OT CONDITION

| Prior (ATT-SCOPE-01-QC) | This seat |
|-------------------------|-----------|
| `R-MFD-M2-OT-FE-APPROVE` OPEN CONDITION (BLOCKED · pendingApproveBtns=0) | **CLOSED** — full U65 create→Eye→Duyệt→F5 with Network 201/201 |

**PASS** — leave GWC Condition #2 OT BLOCKED **superseded CLOSED** for OT approve residual only. Leave slice itself unchanged.

### EC5 — U65 / forbidden claims

| Check | Result |
|-------|--------|
| Seed | QA + FE + QC: **no** `pnpm seed:*` |
| Full Attendance CLOSED | **not claimed** |
| uat_done | **false** |
| Phase1 / UAT DONE | **not claimed** |

**PASS**

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P1 | QC |
|---------|------------------|-----|
| **OT** FE create → Eye → Duyệt → F5 (FR-HRM-AT-10 / ATT-C4) | In-scope mutate this WI | **PASS** (Network + PNG) |
| **J-HRM-06** Chấm công → bản ghi / yêu cầu | Host attendance journey (prior PASS map) | **not reopened / not claimed closed anew** — OT slice evidence only |
| Leave create→Duyệt (ATT-SCOPE-01) | Prior GWC | **untouched** (still CLOSED leave) |
| Other C4 (trip / late-early / shift-change) | OOS | **untouched** |

No invent of full J-HRM-06 re-gate. Mandatory in-scope OT click-path has Network evidence.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | OT U65 create **201** `HRM-OT-201` → Duyệt **201** `HRM-OT-203` → FE + F5 · idle GET storm CLOSED |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **3/8** (missing portal_url · journey_l25 · residual_section) — process-only; FE loading pack **2/8** same class |
| **ENV** | None (L0 hrm/portal 200 in runtime JSON) |
| **OBS (optional)** | Badge raw keys `status.pending` / `status.approved` · OT date ISO `2026-09-04T17:00:00.000Z` · list/mutate `x-company-id=main` + query `company_id=trsport` |
| **OUT-OF-SCOPE** | Full Attendance CLOSED · Phase1/UAT DONE · other C4 · U78 |

ENV does not drive verdict. Process pack gap + OBS do **not** demote OT slice close.

---

## Residual

| Id | Status | Sev | Owner | Blocks this OT GWC? |
|----|--------|-----|-------|---------------------|
| **R-MFD-M2-OT-FE-LOADING** | **CLOSED** | — | — | No |
| **R-MFD-M2-OT-FE-APPROVE** | **CLOSED** (was leave GWC CONDITION) | — | — | No |
| **OBS-MFD-M2-OT-I18N-STATUS** | OPEN optional | P3 | optional dev-fe | **No** — badge `status.*` keys |
| **OBS-MFD-M2-OT-DATE-ISO** | OPEN optional | P3 | optional dev-fe | **No** — vi-VN `dd/MM/yyyy` display |
| **OBS-MFD-M2-OT-XCID-MAIN** | OPEN info | P3 | optional | No — 201 works; harden later |
| **C-MFD-M2-QA-PACK-FMT-OT-R2** | OPEN process | P3 | qa | No — add portal_url · J-* · ## Residual on next QA MD |
| Full Attendance / Phase1 / UAT DONE | — | — | — | No — **not claimed** |

**No residual product P0/P1** open for the **OT FE create→approve** slice.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. Do **not** claim full **Attendance** module CLOSED.
3. **uat_done** remains **false**.
4. OBS i18n status keys + ISO OT date = **optional** polish — not invent FAIL on approve AC.
5. U65: **no seed**; leftover pending rows = FE-origin R2 retries (QA honesty) — not seed invent.
6. Leave-scope GWC remains valid for leave; only OT CONDITION #2 is superseded **CLOSED**.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-ot-fe-approve-qa-r2.md
→ FAIL 3/8 — missing portal_url, journey_l25, residual_section
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote OT close.

### FE loading pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-ot-fe-loading-01.md
→ FAIL 2/8 — missing portal_url, journey_l25
```

**PROCESS** — not product NO-GO.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-ot-fe-approve-qc-r2.md
→ PASS exit 0 (8/8) [target after write]
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-ot-fe-approve-qa-r2.md` | **FAIL** exit **1** · **3/8** missing portal_url / journey_l25 / residual_section (process) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-ot-fe-loading-01.md` | **FAIL** exit **1** · **2/8** (process) |
| Runtime cross-check `_tmp-po-mfd-m2-ot-fe-approve-qa-r2-browser.json` | **PASS** · create 201 HRM-OT-201 · approve 201 HRM-OT-203 · idleGets=0 · f5 pass · verdict PASS |
| Open QA MD `po-mfd-m2-ot-fe-approve-qa-r2.md` | **PASS** · U65 · residuals CLOSED · no Attendance invent |
| Open FE MD `po-mfd-m2-ot-fe-loading-01.md` | **PASS** · storm root-cause + vitest |
| Open leave GWC `po-mfd-m2-att-scope-01-qc.md` | **PASS** · OT was CONDITION; closed this seat |
| PNG spot 05 / 08 / 09 | **PASS** · create toast · approve toast · F5 approved |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-ot-fe-approve-qc-r2.md` | **PASS** exit **0** (8/8) |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** | stack health | **PASS** | runtime l0 hrm/portal 200 |
| **READ** OT list settle | idle GET ≤2/5s · CTA visible | **PASS** | idleGets=0 · cta=true |
| **CREATE** OT (NV FE) | POST 201 HRM-OT-201 | **PASS** | network + PNG 05 |
| **UPDATE** OT approve (QL FE) | POST 201 HRM-OT-203 · FE approved | **PASS** | network + PNG 08 |
| **READ** F5 after approve | stamp + approved persists | **PASS** | f5 + PNG 09 |
| **J-HRM-06** host | attendance journey map | **not re-gated** | honesty |
| **Leave** ATT-SCOPE | prior GWC | **untouched CLOSED** | leave QC |
| Full Attendance CLOSED | program | **NOT CLAIMED** | — |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE
- Did not invent full Attendance CLOSED
- Did not NO-GO solely on QA pack format gap or OBS i18n/date
- Did not GO without opening QA MD + FE MD + leave GWC + browser JSON + PNG spot
- Did not leave `R-MFD-M2-OT-FE-APPROVE` OPEN after Network 201/201 + F5 proved

---

## completion_report

**Closed:** L3 QC gate `PO-MFD-M2-OT-FE-APPROVE-QC-R2` for **OT FE create→approve** (FR-HRM-AT-10 / ATT-C4). Spot-check Network create **201** `HRM-OT-201` + approve **201** `HRM-OT-203` + F5 stamp `OTR2-E97UF2`. Loading storm CLOSED. Residuals `R-MFD-M2-OT-FE-LOADING` + `R-MFD-M2-OT-FE-APPROVE` **CLOSED** (leave-scope OT CONDITION superseded). U65 zero-seed. OBS i18n/date optional.

**Residual / conditions:** OBS i18n status + ISO date (optional P3); QA pack format P3; **uat_done=false**; **NOT** Attendance CLOSED · **NOT** Phase1/UAT DONE.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/po-mfd-m2-ot-fe-approve-qc-r2.md`

---

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-OT-FE-APPROVE-PM-CLOSE
from_role: qc
to_role: pm
lane: execution
priority: P1
entry_criteria:
  - docs/qa/evidence/po-mfd-m2-ot-fe-approve-qc-r2.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - OT FE create→approve CLOSED (U65 · 201 HRM-OT-201 · 201 HRM-OT-203 · F5 · idleGets=0)
  - Residuals R-MFD-M2-OT-FE-LOADING + R-MFD-M2-OT-FE-APPROVE CLOSED (leave GWC OT CONDITION superseded)
action:
  1) Bus INTAKE PO-MFD-M2-OT-FE-APPROVE-QC-R2 PASS_TO_PM + mark OT approve residual CLOSED on backlog / TEAM_WORKING_NOW / leave-scope GWC residual table
  2) Optional polish seat (P3, not blocker): OBS i18n status.* badge + OT date dd/MM/yyyy — only if capacity; do not invent FAIL
  3) Do NOT claim full Attendance CLOSED / product UAT DONE / Phase 1 DONE / uat_done=true from this GWC
  4) Continue next open MFD / PM_OPEN_BACKLOG item — do not idle
cấm: seed · invent Attendance CLOSED · invent UAT DONE · reopen OT residual without new FAIL evidence
```

---

## pm_dispatch_hint

Close OT FE approve residual on leave GWC; keep Attendance program open; optional i18n/date polish only.
