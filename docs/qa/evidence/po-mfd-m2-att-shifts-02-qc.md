# Evidence — `PO-MFD-M2-ATT-SHIFTS-02-QC`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SHIFTS-02-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — narrow M2 Attendance Ca menu honesty (list LIVE + schedule/OT GĐ2 hold) |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-mfd-m2-att-shifts-02-qa.md`](po-mfd-m2-att-shifts-02-qa.md) PASS_TO_PM · FE [`po-mfd-m2-att-shifts-02.md`](po-mfd-m2-att-shifts-02.md) READY_FOR_QA |
| **runtime** | [`_tmp-po-mfd-m2-att-shifts-02-qa-browser.json`](_tmp-po-mfd-m2-att-shifts-02-qa-browser.json) verdict **PASS** · `uat_done: false` |
| **screens** | `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/01-danh-sach-ca.png` · `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/02-lich-phan-ca-hold.png` · `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/03-ca-lam-them-hold.png` · `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/04-cta-back-to-list.png` |
| **spec_ref** | M2 backlog P0-5 surfaces 16–18 · G-MENU-STUB · GĐ2-HOLD `PO-MFD-M2-ATT-GD2-ROSTER-01` · prior loop SoT `po-uc-tc-w4-fe-att-workshift-update-loop-01.md` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · no roster invent |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · Attendance CLOSED · roster API LIVE · `uat_done` remains **false** |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P0 slice: Attendance **Ca** submenu honesty after FE `PO-MFD-M2-ATT-SHIFTS-02`. Browser + runtime prove (1) **Danh sách ca** LIVE (`shifts-table` + GET work-shifts **1×200**, no Maximum update depth, idle storm **0**), (2) **Lịch phân ca** + **Ca làm thêm** honest **GĐ2** + `featureInDev` hold with `shifts-table` **ABSENT**, (3) hold CTA returns to LIVE list. Empty list (0 rows) is OBS under U65 — not fake-empty. Full roster API remains **GĐ2 OOS**. **NOT** Phase 1 / UAT DONE · Attendance **not** CLOSED.

**Conditions:** QA pack process gap (2/8) does not demote product close · J-HRM-06 full list→detail not re-certified this seat (Ca honesty spot only; map prior ✅) · GD2-ROSTER OOS OK · **NOT** Phase 1 / UAT DONE.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-mfd-m2-att-shifts-02.md` (FE) | READY_FOR_QA; schedule/OT GĐ2 badge + hold; useWorkShifts loop must_keep; uat_done false | **ACCEPT** |
| `docs/qa/evidence/po-mfd-m2-att-shifts-02-qa.md` | PASS_TO_PM; C1–C4 PASS; uat_done false; U65 | **ACCEPT** |
| `docs/qa/evidence/_tmp-po-mfd-m2-att-shifts-02-qa-browser.json` | verdict PASS; criteria c1–c4 true; workShiftGetTotal=1; idle5s=0; pageErrors=[]; uat_done false | **ACCEPT** Network SoT |
| Screens (4) | list · schedule hold · OT hold · CTA back | **ACCEPT** visual spot — see command table PNG rows |

---

## Gate AC audit (narrow M2 SHIFTS-02)

| # | AC | Runtime / visual | QC |
|---|-----|------------------|-----|
| 1 | Danh sách ca LIVE: `shifts-table` · no Maximum update depth · no work-shifts GET storm | `tableVisible=true` · GET `/api/hrm/attendance/work-shifts?company_id=main` **200** ×**1** · `workShiftGetsIdle5s=0` · `noMaximumUpdateDepth=true` · `pageErrors=[]` · PNG `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/01-danh-sach-ca.png` (table headers + 0 rows) | 🟢 **PASS** |
| 2 | Lịch phân ca: GĐ2 + featureInDev · `shifts-table` ABSENT | `menuGd2Badge=true` · `holdVisible` · `featureInDev=true` · `shiftsTableAbsent=true` · alert «chưa có API lịch ca» · PNG `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/02-lich-phan-ca-hold.png` | 🟢 **PASS** |
| 3 | Ca làm thêm: GĐ2 + hold · `shifts-table` ABSENT | `menuGd2Badge=true` · hold + alert «chưa có API lịch» · `shiftsTableAbsent=true` · PNG `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/03-ca-lam-them-hold.png` | 🟢 **PASS** |
| 4 | Hold CTA → Danh sách ca | `returnedToList=true` · `holdPanelsGone=true` · PNG `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/04-cta-back-to-list.png` (table back) | 🟢 **PASS** |
| 5 | No invent roster LIVE / uat_done / Attendance CLOSED | JSON + QA `uat_done: false`; holds state «chưa có API» | 🟢 **PASS** (honesty) |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P0 | QC |
|---------|------------------|-----|
| **J-HRM-06** attendance Ca surface (submenu list ↔ schedule/OT hold ↔ CTA back) | **In-scope** spot this gate | **PASS** (browser C1–C4) |
| **J-HRM-06** full list→detail / cross-nav | Related; not full re-cert this seat | **prior ✅** on `PROGRAM_JOURNEY_MAP.md` · **not** claimed full journey re-close |
| **J-HRM-06b** attendance sheets | Out of this P0 | **untouched** |
| Full roster API / Attendance CLOSED | Forbidden / GĐ2 OOS | **not claimed** |

Mandatory in-scope for this gate: Ca honesty AC 1–4 **PASS**. No untested mandatory J-* claimed PASS beyond this slice.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Danh sách ca LIVE table + GET work-shifts 1×200 storm-free · schedule/OT GĐ2 holds · CTA back · no Maximum update depth · pageErrors empty |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **2/8** (missing `portal_url`, `journey_l25`) — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | QA L0 entry+exit `qc:fe-be-health` PASS; browser JSON l0 hrm/xbos/portal **200** |
| **OUT-OF-SCOPE / CONDITION** | Full roster `PO-MFD-M2-ATT-GD2-ROSTER-01` · empty 0-row density (U65 OBS) · Phase1/UAT DONE · Attendance CLOSED |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote SHIFTS-02 close. Empty shifts list is **not** product NO-GO under U65 (LIVE surface + GET 200).

---

## Residual

| Id | Status | Sev | Owner | Blocks this P0 GO? |
|----|--------|-----|-------|--------------------|
| SHIFTS-02 C1–C4 (list LIVE + GĐ2 holds + CTA) | **CLOSED** this seat | — | — | No |
| **PO-MFD-M2-ATT-GD2-ROSTER-01** | OPEN GĐ2 | P2 program | pm / backlog | No — **OOS OK** (honest hold) |
| Empty shifts list (0 rows) | OBS | P3 | — | No — U65 zero-seed; LIVE shell proven |
| **C-SHIFTS02-QA-PACK-FMT-01** | OPEN process | P3 | qa | No — add portal_url + J-* on next QA MD |
| Phase1 / UAT DONE / Attendance CLOSED | — | — | — | No — **not claimed** (`uat_done: false`) |

**No residual product P0** open for this **SHIFTS-02** honesty slice. GD2-ROSTER residual is **acceptable OOS**.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. **Do not** stamp Attendance menu **CLOSED** or flip `uat_done` true.
3. **Do not** invent roster / schedule / OT API **LIVE** — GĐ2 hold must stay until `PO-MFD-M2-ATT-GD2-ROSTER-01`.
4. **Do not** treat empty 0-row Danh sách ca as FAIL density under U65 — LIVE = table + GET 200 + no storm.
5. **Do not** promote full Attendance STUB cluster / Face / leave L2 from this seat.
6. U65: **no seed** in acceptance path.
7. QA pack format 2/8 remains **CONDITION (process)** — not product NO-GO.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-shifts-02-qa.md
→ FAIL 2/8 — missing portal_url, journey_l25
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote P0 SHIFTS-02 close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-shifts-02-qc.md
→ PASS exit 0 (8/8) [target after write]
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-shifts-02-qc.md --check-assets
→ PASS exit 0 · PNG refs OK [target after write]
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-shifts-02-qa.md` | **FAIL** exit **1** · **2/8** missing portal_url, journey_l25 (process) |
| Disk check 4 PNG under `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/` | **PASS** · `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/01-danh-sach-ca.png` (53597) · `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/02-lich-phan-ca-hold.png` (39820) · `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/03-ca-lam-them-hold.png` (39460) · `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/04-cta-back-to-list.png` (53541) |
| Runtime cross-check `docs/qa/evidence/_tmp-po-mfd-m2-att-shifts-02-qa-browser.json` | **PASS** · verdict PASS · c1–c4 true · GET work-shifts 1×200 · idle0 · pageErrors=[] · uat_done false |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/01-danh-sach-ca.png` | **PASS** · LIVE list shell + shifts-table columns · 0 records |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/02-lich-phan-ca-hold.png` | **PASS** · featureInDev + GĐ2 — Lịch phân ca · no table |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/03-ca-lam-them-hold.png` | **PASS** · featureInDev + GĐ2 — Ca làm thêm · CTA Danh sách ca · no table |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/04-cta-back-to-list.png` | **PASS** · LIVE list table returned after CTA |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-shifts-02-qc.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-shifts-02-qc.md --check-assets` | **PASS** exit **0** |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | browser JSON l0 hrm/xbos/portal 200 |
| **LOGIN** | `ceo@xe.vn` company_id=main | **PASS** | browser login http 201 |
| **READ** Danh sách ca | shifts-table LIVE · GET ≤1 | **PASS** | workShiftGetTotal=1 · `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/01-danh-sach-ca.png` |
| **READ** no update-depth / storm | idle + console | **PASS** | idle5s=0 · maximumUpdateDepth=false · pageErrors=[] |
| **READ** Lịch phân ca hold | GĐ2 · table ABSENT | **PASS** | schedule.shiftsTableAbsent · `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/02-lich-phan-ca-hold.png` |
| **READ** Ca làm thêm hold | GĐ2 · table ABSENT | **PASS** | overtime.shiftsTableAbsent · `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/03-ca-lam-them-hold.png` |
| **NAV** hold CTA → list | returnedToList | **PASS** | holdCta · `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/04-cta-back-to-list.png` |
| **J-HRM-06** L2.5 spot | Ca honesty path | **PASS** | this seat |
| Full J-HRM-06 re-cert | list→detail | **prior** | map ✅ · not re-closed |
| Roster API LIVE | Forbidden | **not claimed** | GĐ2 hold remains |
| Attendance CLOSED / uat_done | Forbidden | **not claimed** | uat_done false |

---

## Forbidden compliance (QC)

- No seed (`u65_zero_seed`)
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE / Attendance CLOSED
- Did not invent roster / schedule / OT API LIVE
- Did not fake-green GĐ2 holds as LIVE shift grid
- Did not GO without opening QA MD + runtime JSON + PNG spot-check
- Did not NO-GO solely on QA pack format gap

---

## completion_report

**Closed:** QC L3 narrow gate **PO-MFD-M2-ATT-SHIFTS-02-QC** → **GO WITH CONDITIONS**. Danh sách ca LIVE (table + GET 1×200, no depth/storm); Lịch phân ca + Ca làm thêm honest GĐ2/`featureInDev` with `shifts-table` ABSENT; hold CTA returns to list. **uat_done false**. Attendance **not** CLOSED. U65 zero-seed. GD2-ROSTER residual OOS OK.

**Open / residual owners:** `PO-MFD-M2-ATT-GD2-ROSTER-01` (pm backlog GĐ2); QA pack portal_url/J-* format (`qa` P3). **No product P0** on this seat.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-SHIFTS-02-CLOSE-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
verdict: GO WITH CONDITIONS — docs/qa/evidence/po-mfd-m2-att-shifts-02-qc.md

Action:
1) Bus INTAKE: close PO-MFD-M2-ATT-SHIFTS-02 / QA / QC as GWC Ca honesty slice only; C1–C4 CLOSED; uat_done false; NOT Phase1/UAT DONE; NOT Attendance CLOSED; NOT roster LIVE.
2) Residual GD2-ROSTER (PO-MFD-M2-ATT-GD2-ROSTER-01) stays OPEN OOS — do not invent LIVE.
3) Next execution: dispatch next open P0/P1 from HRM-ATTENDANCE_M2_BACKLOG / fidelity matrix OR idle with explicit reason if no open P0 in MFD queue.
4) Optional P3: remind QA to include portal_url + J-* on next evidence MD (C-SHIFTS02-QA-PACK-FMT-01).
5) Do NOT claim Attendance CLOSED from this GWC.
```

## evidence_path

`docs/qa/evidence/po-mfd-m2-att-shifts-02-qc.md`
