# Evidence — `PO-HRM-AMIS-PARITY-PAY-TPL-QC-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-TPL-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **browser U65 Settings mẫu bảng lương UF slice gate** (not module UAT · not AMIS DONE) |
| **priority** | P0 |
| **parent** | `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-TPL-QA-02` PASS_TO_PM (browser UF) |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **journey_l25** | Settings → **Mẫu bảng lương** CRUD UF + pack≠mẫu enroll — **not** full J-HRM-07 process UAT |
| **Verdict** | **GO WITH CONDITIONS** — browser Settings mẫu UF ACCEPT · **R-PAY-TPL-FE CLOSED** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-amis-parity-pay-tpl-qa-02.md`](po-hrm-amis-parity-pay-tpl-qa-02.md) stamp **`PAYTPLQA2-IH3JZR`** |
| **fe_ref** | [`po-hrm-amis-parity-pay-tpl-fe-01.md`](po-hrm-amis-parity-pay-tpl-fe-01.md) READY_FOR_QA |
| **l1_baseline** | [`po-hrm-amis-parity-pay-tpl-qc-01.md`](po-hrm-amis-parity-pay-tpl-qc-01.md) GWC L1 — **RETAINED** |
| **machine** | [`_tmp-po-hrm-amis-parity-pay-tpl-qa-02.FINAL.json`](_tmp-po-hrm-amis-parity-pay-tpl-qa-02.FINAL.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-pay-tpl-qa-02/` (01–09) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — browser Settings mẫu GWC ≠ payroll module UAT / AMIS DONE / Phase1 DONE |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **Pack as mẫu** | **DENIED** | Enroll tab banner + GET `/salary-templates` ≠ Settings `/pay-sheet-templates` |
| **DnD formula / FE net** | **DENIED** | GĐ1 form only · PUT no net/gross/AST |
| **J-HRM-07 process UAT** | **DENIED** this seat | Historical shell ≠ Settings mẫu author + process lines |
| **Phase 1 DONE / AMIS DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Browser UF only · `seed_used=false` |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT browser U65 Settings → **Mẫu bảng lương** UF (create POST **201** → lines PUT **200** label/sort/OV-C → F5 persist → archive soft-hide **201**) + pack enroll ≠ mẫu (banner + GET `/salary-templates`). Audited QA-02 MD + FINAL JSON stamp `PAYTPLQA2-IH3JZR` + FE-01 + screens 01/05/09 + pack verify **8/8**. **R-PAY-TPL-FE = CLOSED** (supersedes QC-01 OPEN CONDITION for Settings FE). L1 QC-01 API CRUD/bind/scope/pack baseline **RETAINED**. Residual **period-bind UX** (optional) + **R-PAY-SRC-PROCESS** remain **OPEN** → PM may idle this Settings mẫu UF seat or stage process/formula wave. **DENIED** `payroll_e2e_ready=true` · pack-as-mẫu · module UAT · AMIS DONE · Phase1 DONE.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| AC1 Tab + honesty + pack note | QA-02 · JSON · screen 01 | 🟢 **ACCEPT** |
| AC2 Create → FE row | POST **201** `HRM-PAY-TPL-201` · id `e67f9e3b-…` · code `qa_mau_paytplqa2_ih3jzr` | 🟢 **ACCEPT** |
| AC3 Lines label/sort/OV-C | PUT **200** · label stamp · sort=10 · OV-C control+null · `noFeNetKeys` | 🟢 **ACCEPT** |
| AC4 F5 persist | row + label + sort=10 | 🟢 **ACCEPT** |
| AC5 Archive soft-hide | POST **201** · `hiddenAfter=true` | 🟢 **ACCEPT** |
| AC6 Pack enroll ≠ mẫu | banner + GET `/salary-templates` · screen 09 · `mauGetOnPackSurface=0` | 🟢 **ACCEPT** |
| AC7 Honesty / no DnD / no FE net | badge false · `dndStorm=0` · `uncaught=0` | 🟢 **ACCEPT** |
| Pack verify QA-02 | **8/8** exit 0 | 🟢 **PROCESS OK** |
| **R-PAY-TPL-FE** | QA-02 CLOSE + QC confirm | 🟢 **CLOSED** |
| Period-bind UX on Tạo kỳ | FE-01 deferred · API helper only | 🟡 **CONDITION OPEN** (optional) |
| **R-PAY-SRC-PROCESS** | formula/process wave | 🟡 **CONDITION OPEN** |
| **C-SLICE-≠-MODULE** / ready / Phase1 | Explicit DENIED | 🟢 |

**Cấm:** invent `payroll_e2e_ready=true` · treat pack as mẫu SoT · Phase1 DONE · AMIS / module UAT · reopen R-PAY-TPL-FE without regression · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · PROCESS SRC not UF · J-HRM-07 process UAT not proven · period-bind UX optional open |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim R-PAY-TPL-FE closed? | **YES** — this seat ACCEPT |
| Idle-ok this Settings mẫu UF slice? | **YES** — residuals are optional bind UX + staged PROCESS SRC (other waves) |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-01 L1 GWC | `po-hrm-amis-parity-pay-tpl-qc-01.md` | PASS_TO_PM | **RETAIN** — L1 CRUD/bind/scope/pack ACCEPT |
| FE-01 Settings GĐ1 | `po-hrm-amis-parity-pay-tpl-fe-01.md` | READY_FOR_QA | **ACCEPT** prior |
| QA-02 browser U65 | `po-hrm-amis-parity-pay-tpl-qa-02.md` | PASS_TO_PM | **ACCEPT** stamp `PAYTPLQA2-IH3JZR` |
| Machine QA-02 | `_tmp-po-hrm-amis-parity-pay-tpl-qa-02.FINAL.json` | PASS | **ACCEPT** |
| Screens 01–09 | `screens/po-hrm-amis-parity-pay-tpl-qa-02/` | present | **ACCEPT** spot-check 01/05/09 |
| Pack verify QA-02 | `verify:qc:evidence-pack` | exit **0** · **8/8** | 🟢 |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `env.STAMP` | `PAYTPLQA2-IH3JZR` | 🟢 |
| `honesty.payroll_e2e_ready` / `seed_used` / `phase1_done_claimed` | all **false** | 🟢 |
| `honesty.pack_is_not_mau` | **true** | 🟢 |
| `ac.AC1_TAB_LOAD`..`AC7_*` | all **PASS** | 🟢 |
| AC2 POST | **201** `HRM-PAY-TPL-201` · id `e67f9e3b-3e7a-45e3-90c7-c70a10cce3e9` | 🟢 |
| AC3 PUT lines | **200** · `displayLabel` stamp · sort **10** · `formulaOverrideDefinitionId` key · `noFeNetKeys` | 🟢 |
| AC4 F5 | `rowVisibleF5` · `sortPersisted` | 🟢 |
| AC5 archive | **201** · `hiddenAfter=true` | 🟢 |
| AC6 pack | banner cites `/salary-templates` ≠ `/pay-sheet-templates` · `mauGetOnPackSurface=0` | 🟢 |
| `process.pageErrors` / `dndStorm` / `uncaught` | **0** | 🟢 |
| `overall` | **PASS** | 🟢 |

### Screen spot-check

| Screen | Observed | QC |
|--------|----------|-----|
| `01-settings-pay-sheet-tpl.png` | Settings tab Mẫu bảng lương · badge `payroll_e2e_ready=false` · GĐ1 form · OV-C «Không override» · no DnD | 🟢 |
| `05-after-save-lines.png` | code `qa_mau_paytplqa2_ih3jzr` · label stamp · toast «Đã lưu cột mẫu / 1 cột» · badge false | 🟢 |
| `09-payroll-pack-tab.png` | Payroll enroll surface · pack≠mẫu banner citing `/salary-templates` vs Settings `/pay-sheet-templates` | 🟢 |

---

## Gate AC audit (browser U65)

| # | Expected | Observed | QC |
|---|----------|----------|-----|
| 1 | Settings tab + honesty + pack≠mẫu note | Panel + badge false + alias note | 🟢 |
| 2 | Create → POST 2xx → FE row | **201** `HRM-PAY-TPL-201` · row visible | 🟢 |
| 3 | Lines label/sort/OV-C · no FE net | PUT **200** · control present · null OV-C OK (empty formula catalog OBS) | 🟢 |
| 4 | F5 data còn | label + sort=10 | 🟢 |
| 5 | Archive soft-hide | **201** · hidden | 🟢 |
| 6 | Pack enroll ≠ mẫu | banner + GET pack only | 🟢 |
| 7 | No DnD / no FE net / ready=false | process clean · honesty locked | 🟢 |
| 8 | L1 QC-01 retain | prior GWC not reopened | 🟢 **RETAIN** |
| 9 | PROCESS SRC / J-HRM-07 e2e | Not this seat | ⬜ **OUT OF SCOPE** |

### L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-02 | QC |
|-----------------|-------|-------|-----|
| **Settings mẫu CRUD UF** (in-scope) | FE-01 READY | 🟢 AC1–7 PASS | 🟢 **PASS / ACCEPT** |
| **Pack enroll ≠ mẫu** | FE-01 banner | 🟢 AC6 | 🟢 **PASS / ACCEPT** |
| **L1 F-PAY-SHEET-TPL API** | QC-01 GWC | not retested | 🟢 **RETAINED** |
| **J-HRM-07** process / phiếu lương e2e | Historical shell | **not claimed** | ⬜ **DEFERRED** — honesty false |
| Period bind UX on Tạo kỳ | FE deferred | deferred | 🟡 **CONDITION OPEN** (optional) |

**U19 note:** This gate certifies the **Settings mẫu browser UF + pack≠mẫu** slice named in dispatch — **not** a claim that **J-HRM-07** process UAT or payroll module UAT is newly GO. Missing process SRC UF does **not** NO-GO this Settings seat; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE` + PROCESS residual) and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (browser U65)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| POST pay-sheet-template (Settings) | Create | **PASS** |
| PUT lines (label/sort/OV-C) | Update replace-set | **PASS** |
| F5 re-read | Read persist | **PASS** |
| POST archive | Soft-delete hide | **PASS** |
| GET salary-templates (pack surface) | Read regression | **PASS** (≠ mẫu) |
| Period bind UI on Tạo kỳ | Update | **N/A this seat** — deferred residual |
| Hard-delete mẫu | Delete | **N/A** — soft archive only |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA-02 pack verify **8/8** | **PROCESS OK** | exit 0 — QC audit entry valid |
| AC1–7 browser UF vs FE-01 / API F.1 | **PRODUCT OK** | Create/lines/F5/archive/pack match |
| OV-C null with empty formula catalog | **PRODUCT OK** (OBS) | Control+field proven · FK pick optional when catalog empty — **not** demote |
| Missing period-bind UX / PROCESS SRC / J-HRM-07 process | **SCOPE / CONDITION** | Blocks ready=true · **not** Settings UF product NO-GO |
| No P0/P1 product residual on Settings mẫu UF | **PRODUCT OK** | Slice ACCEPT |
| L0 stack / fe-be health (cited QA) | **ENV OK** | Observe-only this QC |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **C-SLICE-≠-MODULE** | honesty | `pm` | **CONDITION** | Settings mẫu GWC ≠ module UAT / AMIS DONE / Phase1 |
| **R-PAY-TPL-FE** | P1 | `dev-fe` | **CLOSED** | Settings GĐ1 UF ACCEPT this seat |
| **R-PAY-TPL-PERIOD-BIND-UX** | P2 optional | `dev-fe` | **OPEN CONDITION** | API `bindPaySheetTemplateToPeriod` wired · UI on Tạo kỳ deferred (FE-01) |
| **R-PAY-SRC-PROCESS** | P1 staged | `dev-be` / formula wave | **OPEN CONDITION** | PROCESS SRC + FORMULA-412 — **DENIED** LIVE claim |
| **OBS-OV-C-EMPTY-CATALOG** | OBS | — | **CONDITION OK** | null OV-C with control present |
| **OBS-HRM-PAY-002** | process OBS | — | **RETAIN** from QC-01 | Period uniqueness ≠ TPL defect |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **J-HRM-07** process e2e | L2.5 | `qa` later | **DEFERRED** | Not claimed |

**P0/P1 product residuals for this Settings mẫu UF WI:** none blocking slice ACCEPT.

**CONDITION for GWC:** `C-SLICE-≠-MODULE` + optional period-bind UX + R-PAY-SRC-PROCESS — sufficient to deny `payroll_e2e_ready=true` and deny clean module / Phase1 GO; **not** product NO-GO for certified Settings mẫu browser UF.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qa-02.md` | exit **0** · **8/8** | **PROCESS OK** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qc-02.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness (prior) `node scripts/qa/_tmp-po-hrm-amis-parity-pay-tpl-qa-02.mjs` | **PASS** · stamp `PAYTPLQA2-IH3JZR` | PRODUCT OK (cited) |
| L0 / fe-be (prior QA) | stack **200** · health **ALL PASS** | ENV OK (cited) |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + screen audit.

---

## completion_report

### Closed

1. QC browser slice gate on Settings → **Mẫu bảng lương** UF + pack≠mẫu — **GO WITH CONDITIONS**.  
2. AC1–AC7 integrity ACCEPT vs machine stamp `PAYTPLQA2-IH3JZR` + screens 01/05/09.  
3. **R-PAY-TPL-FE CLOSED** (Settings GĐ1 FE residual from QC-01).  
4. L1 QC-01 API baseline **RETAINED**.  
5. Honesty: `payroll_e2e_ready=false` **LOCKED** · pack-as-mẫu / module UAT / AMIS DONE / Phase1 **DENIED**.  
6. QA pack **8/8** PROCESS OK; this QC consolidates browser seat.

### Residual

- **R-PAY-TPL-PERIOD-BIND-UX** (optional) · **R-PAY-SRC-PROCESS** (staged) · **C-SLICE-≠-MODULE** · ready flag locked false.  
- **Idle-ok** this Settings mẫu UF slice for PM unless sponsor prioritizes period-bind or process SRC next.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | see below (idle-ok this slice · residual optional) |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qc-02.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | ACCEPT Settings mẫu UF · **R-PAY-TPL-FE CLOSED** · **cấm** flip `payroll_e2e_ready` · idle-ok this seat OR stage PROCESS SRC / optional period-bind |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-TPL-QC-02-INTAKE
from_role: qc
to_role: pm
lane: governance
priority: P0
prior: PO-HRM-AMIS-PARITY-PAY-TPL-QC-02 GO WITH CONDITIONS

## Mission (PM intake)
Settings → Mẫu bảng lương browser UF GWC ACCEPT · R-PAY-TPL-FE CLOSED.
Retain C-SLICE-≠-MODULE · L1 QC-01 baseline · payroll_e2e_ready=false.
Cấm invent payroll_e2e_ready=true · cấm module UAT / AMIS DONE / Phase1 DONE.

## Decision
IDLE-OK this Settings mẫu UF seat.

Optional residuals (do NOT block this slice close):
1) R-PAY-TPL-PERIOD-BIND-UX — optional dev-fe: Tạo kỳ UI bind paySheetTemplateId (API already wired)
2) R-PAY-SRC-PROCESS — staged on formula/process wave (not this seat)

## evidence
docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qc-02.md
docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qa-02.md (stamp PAYTPLQA2-IH3JZR)

## ack
PASS_TO_PM · honesty payroll_e2e_ready=false
```
