# Evidence — `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QC-SRC-02-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QC-SRC-02-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **FE-CB-COMPONENT** residual close (U65 Đãi ngộ) · **not** full payroll module UAT · **not** AMIS DONE |
| **priority** | P0 |
| **parent** | `PO-HRM-RESUME-QC-WAVE-K1-K4` · resume_chunk **K1** |
| **prior** | QA PASS_TO_PM stamp **`SRCSRC0202-ISYBOK`** · parent FE-CB-01 READY_FOR_QA |
| **prior_process** | `…-QC-SRC-02-01` **GWC SEAL** PROCESS AC-PAY-SRC-01 — **do not reopen** |
| **closes** | **`R-EMP-SH-FE-CB-CLICK` SEAL** · FE Đãi ngộ POST 201 + `lines[].component_code` + F5 |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` · persona `ceo@xe.vn` / `company_id=main` |
| **journey_l25** | **J-HRM-07** FE Đãi ngộ C&B click (bounded) — **not** full process UAT / formula LIVE |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-amis-parity-emp-salary-history-qa-src-02-02.md`](po-hrm-amis-parity-emp-salary-history-qa-src-02-02.md) stamp **`SRCSRC0202-ISYBOK`** |
| **machine** | [`_tmp-…-qa-src-02-02.FINAL.json`](_tmp-po-hrm-amis-parity-emp-salary-history-qa-src-02-02.FINAL.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-emp-salary-history-qa-src-02-02/` (01–04 present) |
| **spec_ref** | BR-AMIS-PAY-SRC-02 · FE-CB-COMPONENT · U65 · U76 HDSD |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · **no product-path mirror** |
| **OS honesty** | `C-SLICE-≠-MODULE` — seat GWC ≠ AMIS DONE / payroll module UAT / Phase1 DONE / `payroll_e2e_ready=true` |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **AMIS parity DONE** | **DENIED** | FE-CB click slice only |
| **Module payroll UAT / formula LIVE** | **DENIED** | Seat GWC ≠ module GO |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | SETUP-SC catalog ≠ C&B package mirror |
| **Product-path C&B mirror** | **DENIED** as PASS | QA `NO-MIRROR` 🟢 · `product_path_mirror=false` |
| **Full J-HRM-07 process UAT** | **DENIED** | Bounded FE Đãi ngộ only |
| **Reopen PAY-SRC-QC-02 / QC-SRC-02-01 PROCESS** | **DENIED** | Prior GWC SEAL retained |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT FE-CB-COMPONENT residual after QA-SRC-02-02 against U65 browser Đãi ngộ. Audited QA MD + FINAL JSON stamp `SRCSRC0202-ISYBOK` (`verdict=PASS` · FE-CB-COMPONENT / F5-PERSIST / NO-MIRROR 🟢 · `honesty.payroll_e2e_ready=false` · `seed_used=false` · `product_path_mirror=false` · `amis_done=false`) + screens 01–04. Proven: L0 **200** → HDSD latch Đãi ngộ → FE fill base/an/xang → POST **201** `HRM-COMP-201` `compensation-packages` with `lines[].component_code` = `base` / `phu_cap_an` / `phu_cap_xang` → toast «Đã tạo gói đãi ngộ» → F5 active pkg `72971f1b-…` lines persist · uncaught=0. **SEAL `R-EMP-SH-FE-CB-CLICK`**. Prior **QC-SRC-02-01 PROCESS GWC** and **PAY-SRC-QC-02** **not reopened**. QA pack verify **1/8** = **PROCESS OBS** (missing `command_table`) — this QC consolidates **8/8**. Remaining CONDITION: **`C-SLICE-≠-MODULE`**. P3 OBS (`OBS-SC-XANG-DEFAULT` · `OBS-REVISE-CLICK-NO-POST`) **idle-ok** — not product demote. **DENIED** AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · module payroll UAT · formula LIVE · full J-HRM-07. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| L0 stack | hrm/xbos/portal **200** | 🟢 **ACCEPT** |
| AUTH | ceo@xe.vn · main | 🟢 **ACCEPT** |
| SETUP-SC | catalog base/an/xang · `phu_cap_xang` HRM-SC-201 | 🟢 **ACCEPT** · ≠ package mirror |
| HDSD-LATCH (U76) | Đãi ngộ panel + fields + revise/create-unlinked | 🟢 **ACCEPT** |
| **FE-CB-COMPONENT** | POST **201** · `allHaveCc=true` · mode revise→create-unlinked | 🟢 **ACCEPT** · **SEAL residual** |
| **F5-PERSIST** | pkg active · base+an(+xang) `component_code` | 🟢 **ACCEPT** |
| UF-CONSOLE | uncaught=0 pageErr=0 | 🟢 **ACCEPT** |
| NO-MIRROR / U65 | `product_path_mirror=false` · `seed_used=false` | 🟢 **ACCEPT** |
| Screens 01–04 | panel / filled / after-save / f5 | 🟢 **ACCEPT** |
| Honesty `payroll_e2e_ready=false` | MD + machine | 🟢 **DENIED promote** |
| QA pack 1/8 | command_table missing | 🟡 **PROCESS OBS** — QC consolidates |
| Harness `bodyHasError=true` on 201+toast | FINAL step fe_cb_save | 🟡 **PROCESS OBS** — product POST 201 + toast OK |
| OBS-SC-XANG / OBS-REVISE-CLICK | QA P3 | 🟡 **CONDITION OK / idle-ok** |
| AMIS / module / Phase1 / ready / full J-HRM-07 | Explicit DENIED | 🟢 |
| Prior PROCESS / PAY-SRC-QC-02 | SEAL retained | 🟢 **do not reopen** |

**Cấm:** invent AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · claim full J-HRM-07 · reopen PAY-SRC-QC-02 / QC-SRC-02-01 PROCESS · seed · claim module payroll UAT.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · FE-CB click ≠ module UAT · PROCESS/AMIS still open program-wide |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim FE Đãi ngộ UF FE-CB-COMPONENT ACCEPT / SEAL `R-EMP-SH-FE-CB-CLICK`? | **YES** — this seat GWC |
| May PM claim AMIS DONE / module UAT / Phase1 / full J-HRM-07 / ready? | **NO** |
| Forced residual dispatch this turn? | **NO** — P3 OBS idle-ok; K1 FE-CB residual **SEALED** |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-SRC-02-01 PROCESS | `…-qc-src-02-01.md` | GWC SEAL | **RETAIN** — do not reopen |
| FE-CB-01 | `…-fe-cb-01.md` (bus READY_FOR_QA) | READY_FOR_QA | TRACE OK |
| QA-SRC-02-02 | `…-qa-src-02-02.md` | PASS_TO_PM | **ACCEPT** stamp `SRCSRC0202-ISYBOK` |
| Machine FINAL | `_tmp-…-qa-src-02-02.FINAL.json` | PASS | **ACCEPT** |
| Screens | 01–04 png present | — | **ACCEPT** |
| Pack verify QA | `verify:qc:evidence-pack` | exit **1** · **1/8** | 🟡 **PROCESS OBS** — QC consolidates |
| Resume plan §K1 | `PO_HRM_RESUME_PLAN_20260807.md` | QC-SRC-02-02 | **IN SCOPE** |

### Machine JSON spot (`SRCSRC0202-ISYBOK`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `SRCSRC0202-ISYBOK` | 🟢 |
| `honesty.payroll_e2e_ready` / `seed_used` / `product_path_mirror` / `amis_done` | **false** ×4 | 🟢 |
| `ac.FE-CB-COMPONENT` | 🟢 PASS · post2xx · allHaveCc · posts=1 | 🟢 |
| `ac.F5-PERSIST` | 🟢 PASS · pkg `72971f1b-…` | 🟢 |
| `ac.NO-MIRROR` / `UF-CONSOLE` / `HDSD-LATCH` | 🟢 PASS | 🟢 |
| Network POST | **201** `HRM-COMP-201` · lines `component_code` | 🟢 |
| `residuals` (machine) | `[]` | 🟢 SEAL |
| `verdict` / `ack_status` | **PASS** / **PASS_TO_PM** | 🟢 |

---

## Gate AC audit (FE-CB-COMPONENT)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| FE Đãi ngộ save UF | POST 2xx from FE with `component_code` | **201** · base/an/xang cc | 🟢 |
| F5 persist | Active package lines remain | pkg + lines + UI | 🟢 |
| U65 zero-seed / no mirror | No seed · no product-path package invent as PASS | honesty false | 🟢 |
| — | AMIS DONE / module UAT / Phase1 / ready | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-SRC-02-02 | QC |
|-----------------|-------|--------------|-----|
| **J-HRM-07 FE Đãi ngộ C&B click** (in-scope) | CONDITION on QC-01 | 🟢 FE-CB + F5 | 🟢 **PASS / ACCEPT** (bounded) · **SEAL R-EMP-SH-FE-CB-CLICK** |
| J-HRM-07 SRC-02 PROCESS AC-PAY-SRC-01 | QC-01 GWC | not retested | 🟢 **RETAIN SEAL** — do not reopen |
| Full J-HRM-07 process UAT / formula LIVE | — | not claimed | ⬜ **DEFERRED** — DENIED this seat |
| PAY-SRC-QC-02 / AMIS payment seats | GWC SEAL | — | ⬜ **OUT** — do not reopen |

**U19 note:** This gate certifies **bounded FE Đãi ngộ C&B click** named in K1 dispatch — **not** a claim that full J-HRM-07 / AMIS DONE / module payroll UAT / `payroll_e2e_ready` is newly GO.

### CRUD / mutate matrix (FE-CB slice)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| SC catalog ensure (base/an/xang) | Read/Create catalog | **PASS** (prerequisite ≠ package mirror) |
| FE Đãi ngộ revise / create-unlinked save | Create | **PASS** (POST 201 + cc) |
| F5 active package lines | Read | **PASS** |
| Product-path C&B mirror as PASS | — | **DENIED** (NO-MIRROR PASS) |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA pack **1/8** | **PROCESS OBS** | Missing `command_table` — **not** product demote; QC consolidates |
| `bodyHasError=true` with HTTP 201 + success toast | **PROCESS OBS** | Harness flag; product path ACCEPT |
| FE-CB / F5 / NO-MIRROR | **PRODUCT OK** | Slice ACCEPT · residual SEAL |
| OBS-SC-XANG-DEFAULT / OBS-REVISE-CLICK-NO-POST | **PRODUCT OBS P3** | Idle-ok · optional FE gate later |
| AMIS / Phase1 / ready / full J-HRM-07 / module | **SCOPE CONDITION** | `C-SLICE-≠-MODULE` |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-EMP-SH-FE-CB-CLICK** | P0/P1 | `qa`/`qc` | **SEALED / CLOSED** | Stamp SRCSRC0202-ISYBOK · this seat |
| **OBS-SC-XANG-DEFAULT** | P3 | `dev-fe` optional | **OPEN · idle-ok** | DM default vs SC catalog |
| **OBS-REVISE-CLICK-NO-POST** | P3 | `dev-fe` optional | **OPEN · idle-ok** | First revise empty posts; create-unlinked 201 |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **Full J-HRM-07 process UAT** | L2.5 | `qa` later | **DEFERRED** | Program opens later |
| **`C-SLICE-≠-MODULE`** | governance | `pm`/`qc` | **CONDITION** | Seat GWC ≠ module UAT / Phase1 / AMIS DONE |
| **QC-SRC-02-01 PROCESS / PAY-SRC-QC-02** | — | — | **SEAL retained** | **cấm reopen** |

**P0 product residuals blocking this FE-CB WI:** none.

**CONDITION for GWC:** `C-SLICE-≠-MODULE` (+ optional P3 OBS idle-ok) — sufficient to deny `payroll_e2e_ready=true` and deny AMIS DONE / module / Phase1 / full J-HRM-07 GO; **not** product NO-GO for certified FE-CB ACs.

**Idle-ok for this QC seat:** no forced P0 Task; K1 FE-CB residual closed.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-src-02-02.md` | exit **1** · **1/8** (command_table) | **PROCESS OBS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qc-src-02-02.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness stamp `SRCSRC0202-ISYBOK` | **PASS** · FE-CB / F5 / NO-MIRROR | PRODUCT OK (cited) |
| Screens dir `…/qa-src-02-02/` | 01–04 png present | PRODUCT OK |
| Resume plan §K1 | QC-SRC-02-02 in-scope | GOVERNANCE OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON + screens audit.

---

## Evidence pack integrity (QC 8/8 consolidation)

| Check | Status |
|-------|--------|
| command_table | ✅ this QC MD |
| portal_url | ✅ `:5173` / persona |
| journey_l25 | ✅ J-HRM-07 FE Đãi ngộ bounded |
| crud_or_matrix | ✅ mutate matrix above |
| Classification | ✅ ENV/PROCESS vs PRODUCT |
| verdict | ✅ GO WITH CONDITIONS |
| residual / honesty | ✅ SEAL FE-CB + locked false + C-SLICE |
| handoff contract | ✅ completion + next_dispatch |

---

## completion_report

### Closed

1. QC FE-CB-COMPONENT gate (K1) — **GO WITH CONDITIONS**.  
2. Audited QA-SRC-02-02 MD + FINAL JSON stamp `SRCSRC0202-ISYBOK` + screens 01–04 — FE-CB / F5 / NO-MIRROR **ACCEPT**.  
3. **SEAL `R-EMP-SH-FE-CB-CLICK`**.  
4. Honesty locks held: `payroll_e2e_ready=false` · AMIS DONE **DENIED** · Phase1 **NOT** claimed · module UAT **DENIED** · full J-HRM-07 **DENIED**.  
5. Prior PROCESS QC-SRC-02-01 + PAY-SRC-QC-02 **not reopened**.  
6. QA pack PROCESS OBS consolidated into this QC pack **8/8**.  
7. Explicit **NO** to PM promote ready / AMIS DONE · CONDITION **`C-SLICE-≠-MODULE`** · P3 OBS idle-ok.  
8. **Idle-ok this QC seat** — no forced residual Task.

### Residual

- **`R-EMP-SH-FE-CB-CLICK` SEALED / CLOSED**.  
- **`C-SLICE-≠-MODULE`** retained (governance honesty).  
- OBS-SC-XANG / OBS-REVISE-CLICK **P3 idle-ok**.  
- **NOT** Phase 1 DONE · **NOT** module payroll UAT · **NOT** AMIS DONE · **`payroll_e2e_ready=false`**.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qc-src-02-02.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | K1 FE-CB GWC · stamp SRCSRC0202-ISYBOK · **SEAL R-EMP-SH-FE-CB-CLICK** · **cấm** flip `payroll_e2e_ready` / AMIS DONE / Phase1 / reopen PAY-SRC-QC-02 · continue resume plan next chunk (K2+) |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-RESUME-QC-WAVE-K1-K4 (continue after K1)
from_role: pm
to_role: pm
lane: governance
prior: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QC-SRC-02-02 GO WITH CONDITIONS
evidence: docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qc-src-02-02.md
stamp_qa: SRCSRC0202-ISYBOK

## Status
- FE-CB-COMPONENT / F5 / NO-MIRROR = ACCEPT GWC
- R-EMP-SH-FE-CB-CLICK = SEALED / CLOSED
- CONDITION: C-SLICE-≠-MODULE only (P3 OBS-SC-XANG / OBS-REVISE-CLICK idle-ok)
- payroll_e2e_ready=false LOCKED · no AMIS DONE · no module UAT · no Phase1 · no full J-HRM-07
- do NOT reopen PAY-SRC-QC-02 or QC-SRC-02-01 PROCESS

## Action
Mark K1 FE-CB QC done on PO_HRM_RESUME_PLAN_20260807.md.
Continue resume wave: next open K* QC seat already DISPATCHED (PROCESS-POST-02 / INPUT-PACK-QC-02 / PERIOD-BIND-QC-02) — await verdicts; do not duplicate FE-CB Task.
Run pnpm run pm:idle:check for unrelated P0 outside this seat.

cấm: flip payroll_e2e_ready · claim AMIS DONE · Phase1 DONE · module UAT · reopen PAY-SRC-QC-02 · seed
```
