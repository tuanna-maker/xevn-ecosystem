# Evidence — `PO-HRM-UI-BRAND-W4-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-05 |
| **lane** | L3 governance — W4 brand chrome GWC (PORT-LOGIN + ATT-DIALOG-EXT + PAY-A + REC-A-FIX) |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173` (PORT / ATT / REC) · PAY fallback `http://127.0.0.1:8080` when portal ECONNREFUSED |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8 pale ban · §9 dual-surface · §15.4 modal · §16 LOCK fonts |
| **Prior gate** | `docs/qa/evidence/po-hrm-ui-brand-w3-qc-01.md` GWC — remaster/ATT/Face honesty held |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · no Nest invent · mutates=**0** across seats |
| **NOT claimed** | remaster program DONE · product GO · Attendance CLOSED · Face LIVE · Employees CLOSED · OCR invent · Phase 1 DONE |
| **attendance_closed** | **false** |
| **face_live** | **false** (HOLD) |
| **remaster_program_done** | **false** |
| **product_go** | **false** |
| **stall** | **#2 WRITE** — QC evidence NOW after QA PASS packs |

---

## Verdict summary

**GO WITH CONDITIONS** — W4 Precision Motion brand chrome ACCEPT for in-scope seats:

1. **PORT-LOGIN** — neo two-pane login · glass 4px `#1E40AF` · CTA primary · POST login **201** → `/command-center` · F5 session · theme-contrast `--strict` 0
2. **ATT-DIALOG-EXT** (+ **DELTA**) — request-add / shift-form / add-sheet / manual+GPS clock confirms / export+import · title ≥20 · Face HOLD · mutates=0
3. **PAY-A** — payroll P0 spine overview→components→tax/BH→attendance data→batches/advance→payment · PayslipPrintDialog source-floor `#1E40AF` · vi-VN money · F5 overview
4. **REC-A-FIX** — Jobs title **20px/700 Montserrat** (prior FAIL 17.5px CLOSED) · R12/R15 dialog chrome hold · Reports S3=A honesty · theme-contrast 0

**Conditions** = honesty locks + P2/OBS (portal `:5173` intermittency on PAY seat, page-leave/edit static floors, GPS confirm gated, PayslipPrint not opened, live-payslips branch). **NOT** remaster DONE · **NOT** Attendance CLOSED · **NOT** Face LIVE · **NOT** product GO · **NOT** Phase 1 DONE.

---

## Evidence matrix (completeness)

| Seat | QA evidence | ack | theme-contrast --strict | Forbidden honesty | QC |
|------|-------------|-----|-------------------------|-------------------|-----|
| PORT-LOGIN | `po-hrm-ui-brand-w4-port-login-qa.md` | PASS_TO_PM · 6/6 | exit 0 · pale=0 | remaster/ATT/Face not claimed | **ACCEPT** |
| ATT-DIALOG-EXT | `po-hrm-ui-brand-w4-att-dialog-ext-qa.md` | PASS_TO_PM · 13/13 | exit 0 | attendance_closed=false · face_live=false | **ACCEPT** |
| ATT-DIALOG-EXT DELTA | `po-hrm-ui-brand-w4-att-dialog-ext-qa-delta.md` | PASS_TO_PM · 8/8 | exit 0 | parent not re-litigated · Face HOLD | **ACCEPT** |
| PAY-A | `po-hrm-ui-brand-w4-pay-a-qa.md` | PASS_TO_PM · 10/10 | exit 0 | salary invent false · mutates=0 | **ACCEPT** |
| REC-A-FIX | `po-hrm-ui-brand-w4-rec-a-fix-qa.md` | PASS_TO_PM · 7/7 · Jobs **20px** | exit 0 | ocr_invented=false · S3=A held | **ACCEPT** |

**Missing evidence:** none for in-scope W4 seats listed by PM. No invent LIVE / Attendance CLOSED / remaster DONE in any QA MD audited.

**Machine logs on disk:**

| Seat | JSON / log | Present |
|------|------------|---------|
| PORT-LOGIN | `_tmp-po-hrm-ui-brand-w4-port-login-qa-browser.json` | ✅ |
| ATT-EXT | `_tmp-po-hrm-ui-brand-w4-att-dialog-ext-qa-browser.json` | ✅ |
| ATT-DELTA | `_tmp-po-hrm-ui-brand-w4-att-dialog-ext-qa-delta-browser.json` | ✅ (cited) |
| PAY-A | `_tmp-po-hrm-ui-brand-w4-pay-a-qa-stall3-browser.FINAL.json` | ✅ |
| REC-A-FIX | `_tmp-po-hrm-ui-brand-w4-rec-a-fix-qa-S3.FINAL.json` | ✅ |

---

## ADR §8 / §9 / §15.4 / §16 consistency

| ADR | Law | Wave evidence | QC |
|-----|-----|---------------|-----|
| **§8** Pale ban | No slate-400 / muted body; sharp `#111827` / `#4B5563` | theme-contrast `--strict` exit **0** · pale=0 on every seat | **PASS** |
| **§9** Dual-surface | Portal login dark / ops light · HRM embed or hrm_fe | PORT neo black hero + glass card; ATT/REC portal embed; PAY hrm_fe fallback | **PASS** (ENV: PAY used `:8080`) |
| **§15.4** Modal chrome | 4px `#1E40AF` · glass · wordmark · title ≥20 | ATT dialogs measured · PAY add dialogs · REC R12/R15 | **PASS** |
| **§16** Fonts LOCK | Montserrat titles · no purple/cream AI | REC Jobs Montserrat 20/700 · PAY Montserrat · purple=0 | **PASS** |

---

## Seat spot-checks (QC audit)

### PORT-LOGIN

| Check | Evidence | QC |
|-------|----------|-----|
| Neo shell + wordmark XeVN | PNG `docs/qa/evidence/screens/po-hrm-ui-brand-w4-port-login-qa/W4-PORT-LOGIN-load.png` · testid `portal-login-neo` | **PASS** |
| Glass 4px `#1E40AF` + CTA primary | computed barH=4px · CTA `#1E40AF` · purple/cream applied=0 | **PASS** |
| Login → land · F5 | POST `/api/xbos/auth/login` **201** · `/command-center` · F5 hold · PNG after-auth + f5 | **PASS** |
| Fields empty by design | typed credentials · no prefill | **PASS** U65 |
| Forbidden claims | remaster_program_done=false | **PASS** |

### ATT-DIALOG-EXT (+ DELTA)

| Check | Evidence | QC |
|-------|----------|-----|
| Late/early + trip + shift-change add chrome | bar 4px primary · title 20/700 · Hủy · mutates=0 · PNG `docs/qa/evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa/01-late-early-add.png` | **PASS** |
| NEW shift-form + add-sheet | «Thêm ca…» / «Thêm bảng…» 20/700 · PNG `docs/qa/evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa/04-shift-form.png` · `docs/qa/evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa/05-add-sheet.png` | **PASS** |
| Manual + GPS clock confirms | manual LIVE chrome CTA `#1E40AF` · GPS gated/static OBS · Face HOLD `docs/qa/evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa/11-face-hold.png` | **PASS** honesty |
| Export + Import precision | 4px + logo + glass | **PASS** |
| Page leave/edit shells | static `text-[20px] font-bold` floor · not invent open | **PASS** OBS P2 |
| Face HOLD | hold banner · face_live=false · no LIVE invent | **PASS** |
| Forbidden gates | attendance_closed=false · remaster_done=false · mutates=0 | **PASS** |

### PAY-A

| Check | Evidence | QC |
|-------|----------|-----|
| Overview primary chips/steps · no purple | PNG `docs/qa/evidence/screens/po-hrm-ui-brand-w4-pay-a-qa-stall3/01-overview.png` · chipPrimary · purple=0 | **PASS** |
| Components / tax / BH add dialogs | 4px `#1E40AF` · Montserrat 20/700 · Hủy · PNG `docs/qa/evidence/screens/po-hrm-ui-brand-w4-pay-a-qa-stall3/02-components-add-dialog.png` | **PASS** |
| Attendance data + payment vi-VN | titles ≥20 · «Tổng chi trả 0 ₫» | **PASS** |
| Batches/advance OBS | livePayslips branch · vi-VN on list · not invent batches KPI | **PASS** OBS P2 |
| PayslipPrintDialog | not opened under U65 · source-floor `#1E40AF` + vi-VN | **PASS** OBS P2 |
| F5 overview persist | PNG 08-f5-overview | **PASS** |
| Portal ENV | `:5173` ECONNREFUSED → hrm_fe `:8080` | **ENV OBS** — not product NO-GO |

### REC-A-FIX (Jobs 20px)

| Check | Evidence | QC |
|-------|----------|-----|
| Prior FAIL 17.5px Source Sans | DEF R04 CLOSED | **ACCEPT** closed |
| Jobs «Tin tuyển dụng» | **20px / 700 / Montserrat** · PNG `docs/qa/evidence/screens/po-hrm-ui-brand-w4-rec-a-qa/04-jobs.png` · JSON `checks.tabs_titles_no_purple.tabs.jobs` | **PASS** |
| All REC tab titles 7/7 | dashboard…reports 20/700 Montserrat · purple=0 | **PASS** |
| R12 job create chrome | bar 4px primary · glass · maxWidth 920 · Hủy | **PASS** |
| R15 hire→employee chrome | cancel only · mutates=0 | **PASS** |
| Reports S3=A honesty | «Chỉ số chiến dịch — ngoài MVP» · R07 OUT | **PASS** |
| Forbidden | remaster/Face/ATT/OCR false | **PASS** |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs W4 brand | QC |
|---------|-------------------|-----|
| **J-CC-01** Login tập đoàn | PORT-LOGIN neo brand + POST 201 → CC · F5 | **PASS** (brand slice) · prior ✅ business auth |
| **J-HRM-06** Chấm công shell | ATT dialog extend chrome · mutates=0 · Face HOLD | **PASS** brand · prior ✅ business · **Attendance NOT CLOSED** |
| **J-HRM-06b** Bảng chấm công | add-sheet dialog chrome opened · no sheet CRUD invent CLOSED | **PASS** brand chrome · prior ✅ sheet UF |
| **J-HRM-07** Lương → phiếu | PAY-A spine chrome · PayslipPrint source-floor (dialog not opened) | **PASS** brand · print open **deferred OBS** · prior ✅ |
| **J-HRM-05** Tuyển dụng | REC tabs + Jobs 20px fix + R12/R15 | **PASS** brand · prior ✅ |
| Face LIVE / Attendance CLOSED / remaster DONE | Forbidden | **not claimed** |

Mandatory for this gate: W4 brand evidence completeness + honesty · **not** invent Attendance / Remaster / Face product CLOSED. No invent PASS on untested salary formula or OCR.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Brand chrome ACCEPT on PORT-LOGIN / ATT-DIALOG-EXT(+DELTA) / PAY-A / REC-A-FIX; theme-contrast strict 0 pale; titles ≥20 Montserrat; dialog 4px `#1E40AF`; Jobs 20px FAIL→PASS; Face HOLD; mutates=0 |
| **PROCESS** | Individual seat QA packs may omit formal `journey_l25` heading — process OBS; this QC consolidated pack includes J-* matrix → targets **8/8**; does **not** demote brand GWC |
| **ENV** | PAY seat portal `:5173` ECONNREFUSED → hrm_fe `:8080` fallback — **P2 OBS** devops optional; PORT/ATT/REC had portal 200 |
| **OUT-OF-SCOPE / OBS** | Page-leave/edit static floors · GPS confirm gated · PayslipPrint not opened · live-payslips batches testid N/A · PAY-B / REC-B / R07 campaigns · Face LIVE product · remaster DONE · Attendance CLOSED · product GO · Phase 1 DONE |

ENV portal intermittency does **not** demote PAY brand honesty when hrm_fe + screens corroborate. Process seat-pack format gap ≠ product NO-GO.

---

## Residual

| Id | Status | Sev | Owner | Blocks W4 brand GWC? |
|----|--------|-----|-------|----------------------|
| PORT-LOGIN + ATT-EXT(+DELTA) + PAY-A + REC-A-FIX QA chain | **CLOSED** this gate | — | — | No |
| Jobs 17.5px FAIL (R04) | **CLOSED** by REC-A-FIX | — | — | No |
| `OBS-PORTAL-5173` PAY seat | OPEN OBS | P2 | devops optional | No — hrm_fe OK |
| OBS page-leave/edit / GPS gated (ATT) | OPEN OBS | P2 | qa when openable · U65 no seed | No |
| Q5 live-payslips / Q7 PayslipPrint empty | OPEN OBS | P2 | qa spot when printable rows | No |
| EMP profile quick-edit neo (PORT R1) | OPEN defer | P2 | FE EMP wave | No |
| Face HOLD → W4-MOB Face product | OPEN | P3 | mobile / Face wave | No — not LIVE invent |
| PAY-B / REC-B / R07 campaigns | OUT | — | backlog | No |
| Attendance CLOSED / Face LIVE / remaster DONE / product GO / Phase1 DONE | — | — | — | **not claimed** |

**No residual product P0/P1 FAIL** for W4 brand chrome seats. GWC conditions = honesty locks + P2/OBS above.

---

## Conditions (explicit)

1. **NOT remaster program DONE** — `remaster_program_done=false` must remain.
2. **NOT Attendance CLOSED** — `attendance_closed=false` must remain (ATT dialog chrome only).
3. **NOT Face LIVE** — Face HOLD honesty kept; W4 mobile Face deferred.
4. **NOT product GO / Phase 1 DONE / Employees CLOSED / OCR invent / salary formula invent**.
5. U65: **no seed** in acceptance path; all W4 seats mutates=**0** (auth login production path only on PORT).
6. Portal `:5173` ENV OBS on PAY — optional devops; not product NO-GO when hrm_fe evidence complete.
7. PayslipPrintDialog browser open + page-leave/edit LIVE open = **CONDITION (OBS)** only — source/static floors ACCEPT.
8. Seat QA pack `journey_l25` format gaps = **CONDITION (process)** only.

---

## Case / journey matrix (read-only brand + L2.5)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** | stack cited per seat | **PASS** / ENV OBS portal PAY | QA L0 tables |
| **LOGIN** J-CC-01 | `ceo@xe.vn` · neo brand · 201 → CC · F5 | **PASS** | PORT-LOGIN QA + PNG |
| **READ** ATT dialogs | 4px primary · title≥20 · Face HOLD · mutates=0 | **PASS** | ATT-EXT + DELTA |
| **READ** PAY spine | overview→payment chrome · vi-VN · F5 | **PASS** | PAY-A QA |
| **READ** REC Jobs | 20px Montserrat · R12/R15 | **PASS** | REC-A-FIX QA |
| **J-HRM-06 / 06b** | attendance shell + add-sheet chrome | **PASS** brand | ATT seats |
| **J-HRM-07** | payroll brand spine | **PASS** brand · print open OBS | PAY-A |
| **J-HRM-05** | recruitment tabs + Jobs fix | **PASS** brand | REC-A-FIX |
| Attendance CLOSED / Face LIVE / remaster DONE / product GO | Forbidden | **not claimed** | flags false |

---

## Forbidden compliance (QC)

- No seed (U65)
- No rewrite `apps/**` / Nest invent
- Did **not** invent Attendance CLOSED / Face LIVE / remaster DONE / product GO
- Did **not** invent OCR / salary formula / PROP-03e LIVE
- Did **not** NO-GO solely on portal ENV OBS with hrm_fe fallback or seat-pack process format
- Did **not** GO clean (zero residual) — residuals P2/OBS remain → **GWC only**
- Did open all five QA MD packs + machine JSON presence + screen dirs + ADR consistency + J-* matrix

---

## Evidence-pack gate

### QA packs (entry seats — spot)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w4-port-login-qa.md
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w4-att-dialog-ext-qa.md
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w4-pay-a-qa.md
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w4-rec-a-fix-qa.md
```

Seat packs may FAIL process `journey_l25` — **PROCESS GWC** only; product/brand browser independently verified. Does not demote wave close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w4-qc-01.md
→ PASS exit 0 (8/8)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w4-qc-01.md --check-assets
→ PASS exit 0 · 8 PNG refs OK
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| Disk screens `po-hrm-ui-brand-w4-port-login-qa/` | **PASS** · 3 PNG present |
| Disk screens `po-hrm-ui-brand-w4-att-dialog-ext-qa/` | **PASS** · late/early·shift-form·manual·gps·face PNG present |
| Disk screens `po-hrm-ui-brand-w4-pay-a-qa-stall3/` | **PASS** · 11 PNG present |
| Disk screens `po-hrm-ui-brand-w4-rec-a-qa/` | **PASS** · jobs + dialog PNG present |
| Machine JSON PORT / ATT / PAY / REC-FIX | **PASS** · all four paths exist on disk |
| ADR §8/§9/§15.4/§16 read vs QA claims | **PASS** · consistent |
| Matrix 5 seat QA MD | **PASS** · all PASS_TO_PM on disk |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w4-qc-01.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w4-qc-01.md --check-assets` | **PASS** exit **0** · **8** PNG refs OK |

---

## completion_report

**Closed:** L3 QC `PO-HRM-UI-BRAND-W4-QC-01` (stall #2 WRITE) — **GO WITH CONDITIONS**. Audited PASS packs: PORT-LOGIN (6/6) · ATT-DIALOG-EXT (13/13) + DELTA (8/8) · PAY-A (10/10) · REC-A-FIX Jobs **20px/700 Montserrat** (7/7). Theme-contrast strict 0 · Face HOLD · mutates=0 · U65 zero-seed. ADR §8/§9/§15.4/§16 consistency ACCEPT. J-CC-01 / J-HRM-05 / J-HRM-06 / J-HRM-06b / J-HRM-07 brand-slice PASS. Forbidden flags remain false.

**Open (conditions):** portal `:5173` OBS on PAY · ATT page-shell/GPS static OBS · PayslipPrint open OBS · EMP profile neo defer · Face HOLD product deferred · **remaster_program_done=false · attendance_closed=false · face_live=false · product_go=false**.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W4-PM-CLOSE-01
from_role: pm
to_role: pm
priority: P1
lane: governance
entry_criteria: PO-HRM-UI-BRAND-W4-QC-01 GO WITH CONDITIONS · evidence docs/qa/evidence/po-hrm-ui-brand-w4-qc-01.md · verify:qc:evidence-pack 8/8
scope: Update TEAM_WORKING_NOW / brand program tracker — stamp W4 brand chrome GWC CLOSED for PORT-LOGIN + ATT-DIALOG-EXT(+DELTA) + PAY-A + REC-A-FIX; keep remaster_program_done=false · attendance_closed=false · face_live=false · product_go=false
optional_parallel (P2 OBS only — do not invent remaster DONE / Attendance CLOSED / Face LIVE):
  - devops: OBS-PORTAL-5173 stability (PAY seat used hrm_fe :8080)
  - qa spot: PayslipPrintDialog open when printable row exists (U65 no seed)
  - backlog: PAY-B / REC-B / EMP profile neo / Face HOLD product (not LIVE invent)
cấm: claim remaster DONE · Attendance CLOSED · Face LIVE · product GO · seed · reopen brand QA without FAIL
ack_status target: PASS_TO_PM (program status update)
evidence_path: docs/program/TEAM_WORKING_NOW.md (or brand program status delta)
```

## ack_status

**PASS_TO_PM**

## evidence_path

`docs/qa/evidence/po-hrm-ui-brand-w4-qc-01.md`
