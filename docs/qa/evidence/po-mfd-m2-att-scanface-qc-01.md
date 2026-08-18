# Evidence — `PO-MFD-M2-ATT-SCANFACE-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SCANFACE-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — narrow M2 Attendance fidelity ScanFace crash (#36 App tab) |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-mfd-m2-att-scanface-qa-01.md`](po-mfd-m2-att-scanface-qa-01.md) PASS_TO_PM · FE [`po-mfd-m2-att-scanface-undefined-01.md`](po-mfd-m2-att-scanface-undefined-01.md) READY_FOR_QA |
| **spec_ref** | Fidelity matrix row **#36** App tab · Face ID GĐ1 hold (`SRS_VN` / mindmap OUT GĐ1) · FE ScanLine fix |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · no CFG mutate |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · Face ID feature DONE · Attendance menu CLOSED · STUB_UI #37–46 · OT · NT · full M2 re-smoke · `uat_done` remains **false** |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P1 slice: Attendance rules **App tab (#36)** no longer crashes on unbound lucide `ScanFace`. Browser JSON + PNG prove (1) `pageErrors=[]` / `scanFaceError=false`, (2) App tab `hdsd-att-rules-tab-app` renders GPS/Wifi/QR cards + Face ID **GĐ1 hold** banner («Chưa hỗ trợ»), (3) matrix **#36 LIVE** is honest shell+cards (not fake-green STUB), (4) **Face ID remains GĐ1 hold** — not Face feature DONE, (5) Attendance menu **NOT CLOSED** · matrix/`uat_done` **false**. U65 zero-seed. **NOT** Phase 1 / UAT DONE.

**Conditions:** QA pack process gap (2/8) does not demote product close · J-HRM-06 full list→detail not re-certified this seat (App-tab shell only; map prior ✅) · STUB #37–46 / OT / NT untouched · **NOT** Phase 1 / UAT DONE.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-mfd-m2-att-scanface-undefined-01.md` (FE) | READY_FOR_QA; `ScanFace` → `ScanLine` + MethodIcon bind; CFG/Face hold preserved | **ACCEPT** |
| `docs/qa/evidence/po-mfd-m2-att-scanface-qa-01.md` | PASS_TO_PM; #36 LIVE; R-MFD-ATT-SCANFACE-UNDEFINED CLOSED; uat_done false | **ACCEPT** |
| `docs/qa/evidence/_tmp-po-mfd-m2-att-scanface-qa-01-browser.json` | verdict PASS; pageErrors=[]; surface.scanFaceError=false; faceBannerVisible; stamp LIVE; uat_done false | **ACCEPT** SoT |
| Screens (2) | rules shell · App tab | **ACCEPT** visual spot — see command table |
| Matrix `HRM-ATTENDANCE_FIDELITY_MATRIX.md` #36 | **LIVE** + meta `uat_done: false`; #37–46 remain **STUB_UI** | **ACCEPT** honest |
| Runtime log `rules-Chấm-trên-app` | **LIVE** · residual ScanFace **CLOSED** | **ACCEPT** |

---

## Gate AC audit (narrow — PM dispatch)

| # | AC | Runtime / visual | QC |
|---|-----|------------------|-----|
| 1 | No ScanFace ReferenceError (pageErrors empty / App tab screenshot) | JSON `pageErrors=[]` · `consoleErrors=[]` · `scanFaceError=false` · `noScanFace=true`; PNG `docs/qa/evidence/screens/po-mfd-m2-att-scanface-qa-01/02-app-tab.png` renders full App surface | 🟢 **PASS** |
| 2 | Matrix #36 LIVE honest (not fake-green LIVE for STUB) | Row #36 **LIVE** with cards + hold; #37–46 still **STUB_UI**; bodyLen=1061; method cards GPS/Wifi/QR + Face hold — not `featureInDev` stub shell | 🟢 **PASS** |
| 3 | Face ID remains GĐ1 hold — do not claim Face DONE | Banner «Face ID — ngoài phạm vi GĐ1» · CTA «Chưa hỗ trợ»; QA/FE explicitly hold; no check-in Face path claimed | 🟢 **PASS** |
| 4 | Attendance menu NOT CLOSED · uat_done false | Matrix meta `uat_done: false`; QA `uat_done: false`; menu Chấm công + Thiết lập accessible | 🟢 **PASS** |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P1 | QC |
|---------|------------------|-----|
| **J-HRM-06** attendance settings App-tab shell (Thiết lập → Quy định → Ứng dụng di động) | **In-scope** spot this gate (crash close) | **PASS** (0 pageErrors + App cards/hold) |
| **J-HRM-06** full list→detail / cross-nav | Related; not full re-cert this seat | **prior ✅** on `PROGRAM_JOURNEY_MAP.md` · **not** claimed full journey re-close |
| **J-HRM-06b** attendance sheets | Out of this P1 | **untouched** |
| STUB_UI #37–46 · OT · NT · full M2 re-smoke | Out of this P1 (dispatch OOS) | **untouched** |

Mandatory in-scope for this gate: ScanFace crash close + #36 LIVE honesty + Face GĐ1 hold + uat_done false **PASS**. No untested mandatory J-* claimed PASS beyond this slice.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | App tab renders without `ReferenceError: ScanFace` · GPS/Wifi/QR cards · Face ID GĐ1 hold banner · matrix #36 LIVE honest |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **2/8** (missing `portal_url`, `journey_l25`) — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | QA L0 `qc:fe-be-health` entry+exit PASS (hrm/portal 200 in browser JSON) |
| **OUT-OF-SCOPE / CONDITION** | Face ID feature DONE · Attendance CLOSED / uat_done · STUB #37–46 · OT · NT · full M2 re-smoke · Phase1/UAT DONE |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote ScanFace close.

---

## Residual

| Id | Status | Sev | Owner | Blocks this P1 GO? |
|----|--------|-----|-------|--------------------|
| **R-MFD-ATT-SCANFACE-UNDEFINED** | **CLOSED** this seat | — | — | No |
| Matrix #36 LIVE honesty | **CLOSED** | — | — | No |
| Face ID GĐ1 hold honesty | **CLOSED** (hold remains) | — | — | No |
| Attendance CLOSED / uat_done | Forbidden / false | — | — | No — **not claimed** |
| STUB_UI #37–46 | OPEN | P1–P2 backlog | pm → next STUB_UI wave | No for **this** slice |
| **C-SCANFACE-QA-PACK-FMT-01** | OPEN process | P3 | qa | No — add portal_url + J-* on next QA MD |
| Phase1 / UAT DONE | — | — | — | No — **not claimed** (`uat_done: false`) |

**No residual product P0** open for this **ScanFace #36** slice.

**No residual** product blocker for GWC on this narrow seat.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. **Do not** claim **Face ID feature DONE** — GĐ1 hold banner + «Chưa hỗ trợ» must stay until dedicated Face wave.
3. **Do not** stamp Attendance menu **CLOSED** or flip `uat_done` true.
4. **Do not** promote STUB_UI #37–46 / OT / NT / full M2 re-smoke from this seat.
5. **Do not** treat #36 LIVE as full mobile Face pipeline LIVE — LIVE = App policy shell + method cards without crash.
6. U65: **no seed** in acceptance path; no CFG mutate in this seat.
7. QA pack format 2/8 remains **CONDITION (process)** — not product NO-GO.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-scanface-qa-01.md
→ FAIL 2/8 — missing portal_url, journey_l25
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote P1 ScanFace close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-scanface-qc-01.md
→ PASS exit 0 (8/8) [target after write]
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-scanface-qc-01.md --check-assets
→ PASS exit 0 · PNG refs OK [target after write]
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-scanface-qa-01.md` | **FAIL** exit **1** · **2/8** missing portal_url, journey_l25 (process) |
| Disk check 2 PNG under `docs/qa/evidence/screens/po-mfd-m2-att-scanface-qa-01/` | **PASS** · `docs/qa/evidence/screens/po-mfd-m2-att-scanface-qa-01/01-rules-shell.png` (121041) · `docs/qa/evidence/screens/po-mfd-m2-att-scanface-qa-01/02-app-tab.png` (112747) |
| Runtime cross-check `docs/qa/evidence/_tmp-po-mfd-m2-att-scanface-qa-01-browser.json` | **PASS** · pageErrors=[] · scanFaceError=false · faceBannerVisible · stamp LIVE · uat_done false · verdict PASS |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-scanface-qa-01/02-app-tab.png` | **PASS** · App tab · Face GĐ1 banner · GPS/Wifi Đang bật · Face «Chưa hỗ trợ» · no crash UI |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-scanface-qa-01/01-rules-shell.png` | **PASS** · Thiết lập → Quy định shell (Máy chấm công visible; App tab present in strip) |
| Matrix/runtime stamp read | **PASS** · #36 LIVE · #37–46 STUB_UI · uat_done false · residual ScanFace CLOSED |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-scanface-qc-01.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-scanface-qc-01.md --check-assets` | **PASS** exit **0** |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | browser JSON l0 hrm/portal 200 |
| **LOGIN** | `ceo@xe.vn` company_id=main | **PASS** | browser login http 201 |
| **READ** App tab | testid click · body render | **PASS** | appTab count=1 · bodyLen=1061 |
| **READ** no ScanFace crash | pageErrors empty | **PASS** | pageErrors=[] · `docs/qa/evidence/screens/po-mfd-m2-att-scanface-qa-01/02-app-tab.png` |
| **READ** Face GĐ1 hold | banner + Chưa hỗ trợ | **PASS** | faceBannerVisible · holdOk · PNG banner |
| **READ** method cards | GPS/Wifi/QR present | **PASS** | hasGps/hasWifi/hasQr · PNG |
| Matrix #36 | LIVE honest | **PASS** | fidelity matrix row 36 + runtime log |
| **J-HRM-06** L2.5 spot | App-tab shell no crash | **PASS** | this seat |
| Full J-HRM-06 re-cert | list→detail | **prior** | map ✅ · not re-closed |
| Face feature DONE | Forbidden | **not claimed** | hold remains |
| STUB #37–46 / OT / NT | OOS | **untouched** | dispatch OOS |

---

## Forbidden compliance (QC)

- No seed (`u65_zero_seed`)
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE / Attendance CLOSED
- Did not invent Face ID feature DONE
- Did not fake-green STUB #37–46 as LIVE
- Did not GO without opening QA MD + runtime JSON + PNG spot-check + matrix stamp
- Did not NO-GO solely on QA pack format gap

---

## completion_report

**Closed:** QC L3 narrow gate **PO-MFD-M2-ATT-SCANFACE-QC-01** → **GO WITH CONDITIONS**. ScanFace ReferenceError CLOSED on rules App tab; matrix #36 LIVE honest; Face ID GĐ1 hold preserved; Attendance **not** CLOSED (`uat_done: false`); U65 zero-seed.

**Open / residual owners:** STUB_UI #37–46 backlog (`pm` next wave); QA pack portal_url/J-* format (`qa` P3). **No product P0** on this seat.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-SCANFACE-CLOSE-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
verdict: GO WITH CONDITIONS — docs/qa/evidence/po-mfd-m2-att-scanface-qc-01.md

Action:
1) Bus INTAKE: close PO-MFD-M2-ATT-SCANFACE-QA-01 / QC-01 as GWC ScanFace #36 slice only; R-MFD-ATT-SCANFACE-UNDEFINED CLOSED; uat_done false; NOT Phase1/UAT DONE; NOT Face DONE; NOT Attendance CLOSED.
2) Next execution: dispatch STUB_UI backlog (#37–46 top P0/P1 from HRM-ATTENDANCE_M2_BACKLOG / fidelity matrix) OR idle with explicit reason if no open P0 in MFD queue.
3) Do NOT invent Face ID LIVE / Attendance CLOSED from this GWC.
4) Optional P3: remind QA to include portal_url + J-* on next evidence MD (C-SCANFACE-QA-PACK-FMT-01).

evidence_path: docs/qa/evidence/po-mfd-m2-att-scanface-qc-01.md
```

## ack_status

**PASS_TO_PM**
