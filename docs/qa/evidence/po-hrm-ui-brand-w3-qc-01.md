# Evidence — `PO-HRM-UI-BRAND-W3-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-05 |
| **lane** | L3 governance — **docs-only** brand wave GWC (PORT + EMP + ATT A→G2) |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173` (PORT/EMP) · ATT late seats `http://127.0.0.1:8080` hrm_fe fallback when portal ECONNREFUSED |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8 pale ban · §9 dual-surface · §10 ops-dense |
| **Foundation** | `docs/qa/evidence/po-hrm-ui-brand-fe-foundation-01-qa.md` PASS_TO_PM (theme-contrast + hex lockstep) |
| **ATT-G2 entry** | `docs/qa/evidence/po-hrm-ui-brand-w3-att-g2-qa.md` PASS_TO_PM · checks **14/14** |
| **ATT-G2 runtime** | `docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-att-g2-qa-browser.PASS.json` verdict **PASS** · mutates=**0** |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · no Nest invent |
| **NOT claimed** | remaster program DONE · product GO · Attendance CLOSED · Face LIVE · Employees CLOSED · PROP-03e LIVE · Phase 1 DONE |
| **attendance_closed** | **false** |
| **face_live** | **false** |
| **remaster_program_done** | **false** |
| **prop_03e** | **SKIP** |
| **product_go** | **false** |

---

## Verdict summary

**GO WITH CONDITIONS** — docs-only brand wave audit ACCEPT for Precision Motion chrome remaster across **PORT-A/B**, **EMP-A/B/C**, **ATT-A..G2**, plus W2 foundation theme-contrast. Evidence matrix complete (13 QA MD + foundation QA + FE READY peers). ATT-G2 spot-check honest: S76–S85 STUB/GĐ2/CFG redirect · Face HOLD · PROP-03e SKIP · mutates=0 · forbidden claims false. ADR §8–§10 consistency ACCEPT (primary `#1E40AF` · text `#111827` · titles ≥20 · stub honesty kept · dual-surface).

**Conditions** = P2/OBS residuals (portal `:5173` intermittency on late ATT seats, empty-list/static floor OBS, Face models 404 under HOLD, Open Questions B1–B5 interim A1–A5, ModuleCard X-SCM domain purple OBS). **NOT** remaster DONE · **NOT** Attendance CLOSED · **NOT** Face LIVE · **NOT** product GO · **NOT** Phase 1 DONE.

---

## Evidence matrix (completeness)

| Seat | QA evidence | ack | theme-contrast --strict | Forbidden honesty | QC |
|------|-------------|-----|-------------------------|-------------------|-----|
| Foundation W2 | `po-hrm-ui-brand-fe-foundation-01-qa.md` | PASS_TO_PM | exit 0 · 0 pale | remaster/ATT CLOSED not claimed | **ACCEPT** |
| PORT-A | `po-hrm-ui-brand-w3-port-a-qa.md` | PASS_TO_PM | exit 0 | remaster/ATT/Face not claimed | **ACCEPT** |
| PORT-B | `po-hrm-ui-brand-w3-port-b-qa.md` | PASS_TO_PM | exit 0 | same | **ACCEPT** |
| EMP-A | `po-hrm-ui-brand-w3-emp-a-qa.md` | PASS_TO_PM | exit 0 | Employees not CLOSED | **ACCEPT** |
| EMP-B | `po-hrm-ui-brand-w3-emp-b-qa.md` | PASS_TO_PM | exit 0 · mutates=0 | Employees not CLOSED | **ACCEPT** |
| EMP-C | `po-hrm-ui-brand-w3-emp-c-qa.md` | PASS_TO_PM | exit 0 · mutates=0 | Employees/Job Nest not CLOSED | **ACCEPT** |
| ATT-A | `po-hrm-ui-brand-w3-att-a-qa.md` | PASS_TO_PM | exit 0 | attendance_closed=false · face_live=false | **ACCEPT** |
| ATT-B | `po-hrm-ui-brand-w3-att-b-qa.md` | PASS_TO_PM | exit 0 | same · empty records OBS | **ACCEPT** |
| ATT-C | `po-hrm-ui-brand-w3-att-c-qa.md` | PASS_TO_PM | exit 0 · mutates=0 | same · empty leave OBS | **ACCEPT** |
| ATT-D | `po-hrm-ui-brand-w3-att-d-qa.md` | PASS_TO_PM | exit 0 · mutates=0 | same · empty delete OBS | **ACCEPT** |
| ATT-E | `po-hrm-ui-brand-w3-att-e-qa.md` | PASS_TO_PM | exit 0 · mutates=0 · PROP-03e SKIP | same | **ACCEPT** |
| ATT-F | `po-hrm-ui-brand-w3-att-f-qa.md` | PASS_TO_PM | exit 0 · mutates=0 · GPS dialogs ≥20 | same · top-nav orange OBS | **ACCEPT** |
| ATT-G1 | `po-hrm-ui-brand-w3-att-g1-qa.md` | PASS_TO_PM | exit 0 · 12/12 · Face HOLD | same · PROP-03e SKIP | **ACCEPT** |
| ATT-G2 | `po-hrm-ui-brand-w3-att-g2-qa.md` | PASS_TO_PM | exit 0 · **14/14** | same · S76–S85 honesty | **ACCEPT** (spot deep) |

**Missing evidence:** none for in-scope seats. No invent LIVE / Attendance CLOSED / remaster DONE in any QA MD audited.

---

## ADR §8–§10 consistency

| ADR | Law | Wave evidence | QC |
|-----|-----|---------------|-----|
| **§8** Pale ban | No slate-400 / muted as body/label; sharp `#111827` / `#4B5563` | theme-contrast `--strict` exit **0** · 0 pale on every seat; foundation hex lockstep | **PASS** |
| **§9** Dual-surface | Portal chrome outside · HRM iframe light ops · same hex | PORT-A/B dual-surface login dark / ops light; EMP/ATT embed or hrm_fe fallback | **PASS** (ENV: late ATT used `:8080` when portal down — Class ENV OBS) |
| **§10** Ops-dense modal | Title ≥20 bold `#111827` · primary `#1E40AF` · stub honesty stays | ATT DialogTitle floors · EMP SoftDel AlertDialog · CFG titles 20/700 · STUB/GĐ2/CFG badges kept | **PASS** |

Open Questions §3 B1–B5 still blank → A1–A5 interim **kept** (ADR §6) — governance OBS, not product NO-GO.

---

## ATT-G2 spot-check (S76–S85 + Face + PROP-03e)

| Check | Runtime / visual | QC |
|-------|------------------|-----|
| Harness | exit 0 · `failReasons=[]` · checksPass **14/14** · mutates=[] | **PASS** |
| S76 tablet | STUB badge · title 20/700 `#111827` · liveInputs=0 · mutatesDelta=0 · PNG `docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-g2-qa/01-s76-tablet-stub.png` | **PASS** honesty STUB |
| S77 proxy | GĐ2 badge · no LIVE form · mutatesDelta=0 | **PASS** |
| S78 auto | STUB + ACCEPTED_AS_IS · mutatesDelta=0 | **PASS** |
| S79–S82 CFG | `hasCfg` · `href=/settings` · `hrefOk` · linkColor `rgb(30,64,175)` · liveInputs=0 · PNG `docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-g2-qa/04-s79-cfg-overtime.png` | **PASS** redirect-only |
| S83–S85 users/roles/system | STUB · liveInputs=0 · mutatesDelta=0 | **PASS** |
| Face HOLD | `faceBannerVisible` · `faceLiveClaim=0` · face_live_claimed=**false** · PNG `docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-g2-qa/00-spot-face-prop03e.png` | **PASS** · not LIVE |
| PROP-03e SKIP | `propSkipVisible` · `employeeQrLive=false` · `prop_03e_invented=false` · banner PROP-03e out of MVP | **PASS** |
| Forbidden gates | attendance_closed_claimed=**false** · remaster_program_done_claimed=**false** | **PASS** |
| Screens disk | **12** PNG under `screens/po-hrm-ui-brand-w3-att-g2-qa/` | **PASS** |
| Face model 404 console | expected under HOLD shell | **OBS** P3 → W4 mobile Face (not LIVE invent) |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs brand wave | QC |
|---------|---------------------|-----|
| **J-HRM-06** Chấm công → bản ghi / yêu cầu | Brand chrome on attendance shell (ATT-A..G2) — prior journey ✅; this wave = visual remaster + honesty, not product mutate UF reopen | **PASS** (brand slice) · prior ✅ untouched for business CLOSED |
| **J-HRM-06b** Bảng chấm công sheet | ATT-B sheets chrome; business sheet journey prior ✅ | **prior ✅** · brand chrome ACCEPT |
| **J-HRM-02** Nhân sự list → hồ sơ | EMP-A/B/C navigate list→detail kept | **PASS** brand + SoftDel Hủy mutates=0 |
| Face LIVE / Attendance CLOSED / remaster DONE | Forbidden | **not claimed** |
| Mobile Face W4 | Deferred | **CONDITION** (not this docs GWC) |

Mandatory for this gate: brand evidence completeness + honesty · **not** invent Attendance module CLOSED. No invent PASS on untested product UF beyond brand chrome.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Brand chrome remaster ACCEPT on PORT/EMP/ATT seats; theme-contrast strict 0 pale; titles ≥20 / primary `#1E40AF`; stub/CFG/Face honesty kept; ATT-G2 14/14 mutates=0 |
| **PROCESS** | Individual QA MD packs often **1/8** missing `journey_l25` — process OBS; this QC consolidated pack targets **8/8**; does **not** demote brand GWC |
| **ENV** | Portal `:5173` ECONNREFUSED on ATT-G1/G2/E harness → hrm_fe `:8080` fallback — **P2 OBS** devops optional; EMP/PORT seats had portal 200 |
| **OUT-OF-SCOPE / OBS** | Empty-list static floors (S27/S28/S45/S32…) · Face model weights 404 · Open Q B1–B5 · ModuleCard X-SCM `#7c2d92` · Face mobile W4 · remaster program DONE · Attendance CLOSED · product GO |

ENV portal intermittency does **not** demote ATT brand honesty when hrm_fe fallback + screens corroborate. Process QA pack gap ≠ product NO-GO.

---

## Residual

| Id | Status | Sev | Owner | Blocks brand GWC? |
|----|--------|-----|-------|-------------------|
| PORT-A/B + EMP-A/B/C + ATT-A..G2 brand QA chain | **CLOSED** this seat | — | — | No |
| Foundation theme-contrast | **CLOSED** prior | — | — | No |
| `OBS-PORTAL-5173` late ATT seats | OPEN OBS | P2 | devops optional | No — hrm_fe fallback OK |
| Empty-list / static Dialog floors (ATT-B/C/D/E) | OPEN OBS | P2 | qa spot when rows exist | No — U65 no seed |
| Face model 404 under HOLD | OPEN OBS | P3 | W4-MOB Face | No — not Face LIVE |
| `OBS-TOP-NAV-ORANGE` (ATT-F) | OPEN OBS | P2 | later shell | No |
| ModuleCard X-SCM domain purple | OPEN OBS | P2 | optional token later | No |
| Open Questions §3 B1–B5 | OPEN governance | — | sponsor / SA | No — A1–A5 interim |
| QA pack `journey_l25` format on seat MDs | OPEN process | P3 | qa next MD | No |
| Attendance CLOSED / Face LIVE / remaster DONE / product GO / Phase1 DONE | — | — | — | **not claimed** |

**No residual product P0/P1 FAIL** for brand chrome wave. GWC conditions = honesty locks + P2/OBS above.

---

## Conditions (explicit)

1. **NOT remaster program DONE** — `remaster_program_done=false` must remain.
2. **NOT Attendance CLOSED** — `attendance_closed=false` must remain.
3. **NOT Face LIVE** — Face GĐ2-HOLD / GĐ1 honesty; W4 mobile Face deferred.
4. **NOT PROP-03e LIVE** — SKIP card honesty kept.
5. **NOT product GO / Phase 1 DONE / Employees CLOSED**.
6. U65: **no seed** in acceptance path; brand mutates on G2=0 (stubs); ATT-B sheet CRUD was FE mutate for chrome wire only — not Attendance CLOSED.
7. Portal `:5173` ENV OBS — optional devops; not product NO-GO when hrm_fe evidence complete.
8. QA seat pack format `journey_l25` gap = **CONDITION (process)** only.

---

## Evidence-pack gate

### QA pack (ATT-G2 entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w3-att-g2-qa.md
→ FAIL 1/8 — missing journey_l25
```

**PROCESS GWC** — product/brand browser + runtime independently verified; does not demote wave close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w3-qc-01.md
→ PASS exit 0 (8/8)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w3-qc-01.md --check-assets
→ PASS exit 0 · ATT-G2 PNG refs OK
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w3-att-g2-qa.md` | **FAIL** exit **1** · **1/8** missing `journey_l25` (process) |
| Disk screens `po-hrm-ui-brand-w3-att-g2-qa/` | **PASS** · **12** PNG present |
| Runtime `_tmp-po-hrm-ui-brand-w3-att-g2-qa-browser.PASS.json` | **PASS** · 14/14 · mutates=0 · honesty gates false · CFG href=/settings |
| Spot visual `docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-g2-qa/00-spot-face-prop03e.png` | **PASS** · PROP-03e SKIP banner + Face model toast under HOLD |
| Spot visual `docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-g2-qa/01-s76-tablet-stub.png` | **PASS** · STUB honesty |
| Spot visual `docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-g2-qa/04-s79-cfg-overtime.png` | **PASS** · CFG redirect copy |
| ADR §8–§10 read | **PASS** · consistent with QA claims |
| Foundation QA present | **PASS** · `po-hrm-ui-brand-fe-foundation-01-qa.md` |
| Matrix 13 seat QA MD + foundation | **PASS** · all on disk PASS_TO_PM |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w3-qc-01.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w3-qc-01.md --check-assets` | **PASS** exit **0** · ATT-G2 PNG refs OK |

---

## Case / journey matrix (read-only brand + L2.5)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** | stack cited per seat | **PASS** / ENV OBS portal late ATT | QA L0 tables + G2 JSON |
| **LOGIN** | `ceo@xe.vn` · company_id=main | **PASS** | browser login 201 |
| **READ** brand chrome | theme-contrast · titles ≥20 · primary | **PASS** | all seats |
| **READ** ATT-G2 stubs | S76–S85 honesty · mutates=0 | **PASS** | JSON + PNG |
| **J-HRM-06** | related attendance shell brand | **PASS** brand · prior ✅ business | ATT-A..G2 |
| **J-HRM-02** | EMP navigate keep | **PASS** brand | EMP-A/B/C |
| Attendance CLOSED / Face LIVE / remaster DONE / product GO | Forbidden | **not claimed** | flags false |

---

## Forbidden compliance (QC)

- No seed (U65)
- No rewrite `apps/**` / Nest invent
- Did **not** invent Attendance CLOSED / Face LIVE / remaster DONE / product GO
- Did **not** invent PROP-03e EmployeeQRCard LIVE
- Did **not** NO-GO solely on QA pack `journey_l25` gap or portal ENV OBS with hrm_fe fallback
- Did **not** GO clean (zero residual) — residuals P2/OBS remain → **GWC only**
- Did open ATT-G2 QA MD + PASS.json + PNG disk + ADR §8–§10 + matrix of prior seat QA

---

## completion_report

**Closed:** L3 QC `PO-HRM-UI-BRAND-W3-QC-01` — **GO WITH CONDITIONS** (docs-only brand wave). Evidence matrix complete for Foundation + PORT-A/B + EMP-A/B/C + ATT-A..G2. ADR §8–§10 consistency ACCEPT. ATT-G2 spot: S76–S85 STUB/GĐ2/CFG href=/settings · Face HOLD · PROP-03e SKIP · mutates=0 · 14/14 · 12 PNG. Forbidden flags remain false.

**Open (conditions):** portal `:5173` OBS · empty-list static OBS · Face model 404 / W4 Face HOLD · Open Q B1–B5 · ModuleCard OBS · QA pack journey_l25 process · **remaster not DONE · Attendance not CLOSED · Face not LIVE · product not GO**.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W3-PM-CLOSE-01
from_role: pm
to_role: pm
priority: P1
lane: governance
entry_criteria: PO-HRM-UI-BRAND-W3-QC-01 GO WITH CONDITIONS · evidence docs/qa/evidence/po-hrm-ui-brand-w3-qc-01.md
scope: Update TEAM_WORKING_NOW / PROJECT_STATUS / brand program tracker — stamp W3 brand chrome GWC CLOSED; keep remaster_program_done=false · attendance_closed=false · face_live=false · product_go=false
optional_parallel (P2 OBS only — do not invent remaster DONE):
  - devops: OBS-PORTAL-5173 stability if ATT seats need portal embed parity
  - qa spot: empty-list Dialog floors when persona has rows (U65 no seed)
  - W4-MOB: Face HOLD product (not LIVE invent from chrome)
cấm: claim remaster DONE · Attendance CLOSED · Face LIVE · product GO · seed · reopen brand QA without FAIL
ack_status target: PASS_TO_PM (program status update)
evidence_path: docs/program/TEAM_WORKING_NOW.md (or brand program status delta)
```

## ack_status

**PASS_TO_PM**

## evidence_path

`docs/qa/evidence/po-hrm-ui-brand-w3-qc-01.md`
