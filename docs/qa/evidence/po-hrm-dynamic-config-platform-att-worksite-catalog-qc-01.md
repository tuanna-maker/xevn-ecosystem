# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **ATT work-sites catalog Option B browser AC narrow only** · **not** module ATT UAT |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QA-01` PASS_TO_PM stamp **`ATTWSQA-MSJC3IN9`** |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | **N/A deferred** — portal GPS work-sites admin + geofence punch (U65) · **J-MOB-02 OOS** · **no** J-HRM-06c reopen · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | AC-PLT-ATT-WORKSITE-01 / 01b / 01c / 01d / 01H · VAL-ATT-WS-CNS-04 · VAL-ATT-WS-CNS-05 (optional L1) · SITE-UNKNOWN HOLD |
| **Verdict** | **GO WITH CONDITIONS** — ATT-WORKSITE-CATALOG **SEAL ACCEPT** · CONDITION: honesty `attendance_uat_ready=false` · printable/personnel **false** · ATT-LEAVE GWC · WAIVE/sign/**J-HRM-06c** · SI type/insurer · CTR · enrollment **SEAL RETAIN** · **R-PLT-ATT-WS-FE-CNS-05** P2 → **FE-01 already DISPATCHED** · OBS 01c empty **idle-ok** · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-att-worksite-catalog-qa-01.md`](po-hrm-dynamic-config-platform-att-worksite-catalog-qa-01.md) |
| **be_ref** | [`po-hrm-dynamic-config-platform-att-worksite-catalog-be-01.md`](po-hrm-dynamic-config-platform-att-worksite-catalog-be-01.md) READY_FOR_QA |
| **ba_ref** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md) **CONFIRMED** |
| **sa_ref** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md) Option **B** LOCKED |
| **peer_gwc** | ATT-LEAVE-CATALOG GWC · WAIVE/sign/J-HRM-06c · SI type/insurer L1 · CTR · enrollment · EMP·DEC·PAY·REC·EXT·LIST-TOTALS · **SEAL RETAIN** (cấm reopen) |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-att-worksite-catalog-qa-01-browser.json`](_tmp-po-hrm-dynamic-config-platform-att-worksite-catalog-qa-01-browser.json) · stamp **`ATTWSQA-MSJC3IN9`** |
| **screens** | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-worksite-catalog-qa-01/` (`01`…`09`) |
| **stamp_ref** | QA `ATTWSQA-MSJC3IN9` · commit `dc930c5` |
| **spec_ref** | BA-01 AC-PLT-ATT-WORKSITE-01* · VAL-ATT-WS-CNS-01..05 · SA Option B · F-ATT-CAT-WS · `HRM-ATT-GEO-001` / `HRM-ATT-GEO-REQ` · SITE-UNKNOWN HOLD |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — Nest work-sites deepen + GEO punch ≠ attendance module UAT / Phase1 / reopen ATT-LEAVE / flip `attendance_uat_ready` |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| printable / personnel | **`false`** | **LOCKED** — unchanged |
| ATT-LEAVE-CATALOG GWC | **SEAL RETAIN** | **cấm reopen** |
| Leave WAIVE / sign / **J-HRM-06c** | **SEAL RETAIN** | **cấm reopen** |
| SI type/insurer L1 · CTR · enrollment | **SEAL RETAIN** | **cấm reopen** |
| EMP · DEC · PAY · REC · EXT · LIST-TOTALS | **SEAL RETAIN** | **cấm reopen** |
| **Module ATT UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module seal |
| **J-MOB-02** | **OOS** | Portal wave — no invent FAIL / promote |
| **SITE-UNKNOWN** | **HOLD GĐ1.5** | No consumer `work_site_id` surface — **cấm invent FAIL** |
| **Seed / ensureDefault** | **DENIED** (U65) | QA + machine `seed_used=false` · `ensureDefault=false` |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | Nest SoT + GEO ≠ module ATT UAT |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow ATT work-sites catalog Option B browser AC after QA stamp **`ATTWSQA-MSJC3IN9`** (`overall=PASS` · honesty `attendance_uat_ready=false` · printable/personnel false · `seed_used=false` · `c_slice_ne_module=true`). Audited QA MD + BE READY + BA CONFIRMED + machine JSON + screens `02`/`05` + live L0 portal/hrm **200** + unauth `GET …/work-sites?company_id=main` → **401** + GEO codes present in `attendance.service.ts`. Proven: Admin CREATE Nest site `QA-WS-msjc3in9` → **POST 201** `HRM-ATT-SITE-201` → list + F5 (**01d**); GPS OOS (10,10) → **400** `HRM-ATT-GEO-001` · hasLatLon (**01b** · screen toast «Check-in ngoài vùng cho phép»); GPS inside → **201** `HRM-ATT-201` · Nest F5 (**01**); soft-retire DELETE **200** · hidden default + inactive audit (**CNS-04**); empty not forced / CTA · no seed (**01c** idle-ok); optional CNS-05 BE **400** `HRM-ATT-GEO-REQ` stamped · FE `check_in_method` omit = **CONDITION** **R-PLT-ATT-WS-FE-CNS-05** — bus already has **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-FE-01` DISPATCHED** (2026-08-08T02:29:10+07:00) — **QC does not invent duplicate FE**. SITE-UNKNOWN **HOLD**. J-MOB-02 **OOS**. QA pack verify **1/8** missing `command_table` = **PROCESS OBS** — this QC consolidates **8/8**. **DENIED** `attendance_uat_ready` flip · printable/personnel flip · reopen ATT-LEAVE / WAIVE / J-06c / SI / CTR / enrollment · module ATT UAT · Phase1 DONE · seed · invent SITE-UNKNOWN FAIL. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `ATTWSQA-MSJC3IN9` · overall PASS | machine `overall=PASS` · `ack_status=PASS_TO_PM` | 🟢 **ACCEPT** |
| AC-PLT-ATT-WORKSITE-01d admin CREATE N+1 | POST **201** · id=`d7e0de24-…` · F5 · screen `02` row `QA-WS-msjc3in9` | 🟢 **ACCEPT** |
| AC-PLT-ATT-WORKSITE-01 GPS inside | POST **201** `HRM-ATT-201` · hasLatLon · nestF5 | 🟢 **ACCEPT** |
| AC-PLT-ATT-WORKSITE-01b GEO OOS | **400** `HRM-ATT-GEO-001` · screen `05` | 🟢 **ACCEPT** |
| VAL-ATT-WS-CNS-04 soft-retire | DELETE **200** · hidden FE/F5 · inactiveView | 🟢 **ACCEPT** |
| AC-PLT-ATT-WORKSITE-01c empty | activeRemain=1 · CTA · noSeed · not forced | 🟡 **CONDITION idle-ok** |
| VAL-ATT-WS-CNS-05 GEO-REQ | API **400** · `fe_sends_check_in_method=false` | 🟡 **CONDITION** — FE-01 **DISPATCHED** |
| VAL-ATT-WS-CNS-02 SITE-UNKNOWN | HOLD | 🟢 **HOLD ACCEPT** — no invent FAIL |
| J-MOB-02 | OOS | ⬜ **OOS** — DENY invent |
| AC-PLT-ATT-WORKSITE-01H honesty | false · seals RETAIN · C-SLICE | 🟢 **ACCEPT** |
| U65 zero-seed | QA + machine | 🟢 **ACCEPT** |
| Peer / ATT-LEAVE / WAIVE / J-06c / SI / CTR | seals | 🟢 **SEAL RETAIN** |
| invent ready / module ATT UAT / Phase1 | Explicit DENIED | 🟢 **DENIED promote** |
| QA pack command_table miss | verify exit 1 · 1/8 | 🟡 **PROCESS OBS** — QC consolidates |
| GEO codes in BE | `attendance.service.ts` GEO-001 / GEO-REQ | 🟢 |

**Cấm:** invent `attendance_uat_ready=true` · flip printable/personnel · claim module ATT UAT DONE · reopen ATT-LEAVE GWC · reopen WAIVE/sign/J-HRM-06c · reopen SI/CTR/enrollment · seed as evidence · invent SITE-UNKNOWN FAIL · invent duplicate FE Task · treat work-sites GWC as module GO · Phase1 DONE.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| May PM flip printable / personnel ready? | **NO** |
| May PM reopen ATT-LEAVE GWC / WAIVE / sign / **J-HRM-06c**? | **NO** |
| May PM reopen SI type/insurer · CTR · enrollment? | **NO** |
| May PM claim module ATT UAT / Phase1 / invent SITE-UNKNOWN FAIL? | **NO** |
| May PM seal ATT work-sites catalog Option B browser AC slice? | **YES** — this seat GWC |
| May PM invent second FE Task for CNS-05? | **NO** — FE-01 already **DISPATCHED** |
| Why | `C-SLICE-≠-MODULE` · Nest SoT + GEO punch ≠ attendance module UAT |
| Recommended flag state | keep **`attendance_uat_ready=false` LOCKED** · printable/personnel **false** |
| Forced residual dispatch this turn? | **U88** — ≥1 **ba-docs** ATT work-sites DOC-DELTA · retain FE-01 in-flight (no invent) |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| SA-01 Option B | `…-ATT-WORKSITE-CATALOG-SA-01.md` | CONFIRMED LOCKED | **ACCEPT** (cited) |
| BA-01 AC pack | `…-ATT-WORKSITE-CATALOG-BA-01.md` | CONFIRMED | **ACCEPT** (cited) |
| DATA-01 LIVE | soft-retire · no second table | CONFIRMED EXPAND | **ACCEPT** (cited peer) |
| BE-01 deepen | soft-retire · list active · GEO-REQ · jest 52 | READY_FOR_QA | **ACCEPT** |
| QA-01 | `…-att-worksite-catalog-qa-01.md` | PASS_TO_PM · `ATTWSQA-MSJC3IN9` | **ACCEPT** |
| Machine JSON | `_tmp-…-qa-01-browser.json` | PASS · honesty false | **ACCEPT** |
| Screens | `02` create · `05` OOS GEO-001 | path present | **ACCEPT** |
| Pack verify QA-01 | `verify:qc:evidence-pack` | exit **1** · missing `command_table` | 🟡 **PROCESS OBS** — QC consolidates |
| Live unauth spot (QC) | `GET …/work-sites?company_id=main` | **401** | 🟢 OK (not 404/500) |
| L0 portal / hrm health | `:5173` · `:28001/api/hrm` | **200** / **200** | 🟢 ENV OK |
| GEO codes | `attendance.service.ts` | GEO-001 · GEO-REQ present | 🟢 |
| FE-01 bus | `ATT-WORKSITE-CATALOG-FE-01` | **DISPATCHED** 02:29:10 | 🟢 — **do not invent FE** |

### Machine JSON spot (`ATTWSQA-MSJC3IN9`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `ATTWSQA-MSJC3IN9` | 🟢 |
| `overall` / `ack_status` | **PASS** · **PASS_TO_PM** | 🟢 |
| `honesty.attendance_uat_ready` | **false** | 🟢 |
| `honesty.printable_ready` / `personnel_uat_ready` | **false** | 🟢 |
| `honesty.seed_used` / `ensureDefault` | **false** | 🟢 |
| `honesty.c_slice_ne_module` | **true** | 🟢 |
| `honesty.att_leave_gwc_seal_retain` | **true** | 🟢 |
| `honesty.waive_sign_j06c_seal_retain` | **true** | 🟢 |
| `honesty.si_ctr_enrollment_seal_retain` | **true** | 🟢 |
| `ac.AC-PLT-ATT-WORKSITE-01d` | POST **201** · F5 · SITE-201 | 🟢 |
| `ac.AC-PLT-ATT-WORKSITE-01b` | **400** `HRM-ATT-GEO-001` | 🟢 |
| `ac.AC-PLT-ATT-WORKSITE-01` | **201** `HRM-ATT-201` · nestF5 | 🟢 |
| `ac.VAL-ATT-WS-CNS-04` | DELETE **200** · hidden · inactive | 🟢 |
| `ac.AC-PLT-ATT-WORKSITE-01c` | activeRemain=1 · CTA · noSeed | 🟡 idle-ok OBS |
| `ac.VAL-ATT-WS-CNS-05` | API **400** GEO-REQ · FE omit residual | 🟡 CONDITION FE-01 |
| `ac.VAL-ATT-WS-CNS-02` | **HOLD** | 🟢 |
| `ac.J-MOB-02` | **OOS** | 🟢 |
| `ac.AC-PLT-ATT-WORKSITE-01H` | honesty false · seals | 🟢 |
| `pageErrors` | `[]` | 🟢 |
| `l0` | hrm/xbos/portal **200** | 🟢 |

### Screenshot spot-check (QC)

| Screen | Observed | QC |
|--------|----------|-----|
| `02-gps-after-create.png` | GPS card · row **`QA-WS-msjc3in9`** · toast «Đã lưu quy định chấm công» · peer `QA-GPS-e86a38` retained | 🟢 |
| `05-gps-oos-after.png` | Confirm dialog coords **10,10** · toast «Check-in ngoài vùng cho phép» (GEO-001) · emp UAT NV 0021 | 🟢 |
| Soft-retire / inside punch | Machine CNS-04 + 01 posts · screens `07`/`09` cited QA | 🟢 cite machine |

**OBS (i18n):** screen `05` shows raw keys `gpsAttendance.gpsLocation` / `gpsAttendance.checkIn` on confirm dialog — **not** invent as slice NO-GO; GEO-001 business toast PASS. Optional FE polish with FE-01 or separate idle-ok OBS.

---

## Gate AC audit (AC-PLT-ATT-WORKSITE-01*)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| 01d | Admin CREATE Nest N+1 → 2xx · list · F5 | POST **201** · F5 row | 🟢 **ACCEPT** |
| 01 | GPS inside · lat/lon · 2xx · Nest SoT F5 | POST **201** · nestF5 | 🟢 **ACCEPT** |
| 01b | OOS → 4xx `HRM-ATT-GEO-001` · no invent SITE-UNKNOWN | **400** GEO-001 | 🟢 **ACCEPT** |
| 01c | Empty skip / CTA / no seed | Live activeRemain=1 · CTA · 01d PASS | 🟡 **CONDITION idle-ok** |
| 01H | Honesty / seals | false · RETAIN · C-SLICE | 🟢 **ACCEPT** |
| CNS-04 | Soft-retire hide default/geofence | DELETE **200** · hidden | 🟢 **ACCEPT** |
| CNS-05 | gps method omit → GEO-REQ | BE API PASS · FE omit | 🟡 **CONDITION** FE-01 DISPATCHED |
| CNS-02 | SITE-UNKNOWN | HOLD | 🟢 **HOLD** — no invent FAIL |
| J-MOB-02 | Mobile spot | OOS | ⬜ **OOS** |
| — | invent ready / module ATT UAT / Phase1 / reopen seals | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA | QC |
|-----------------|-------|-----|-----|
| **ATT work-sites catalog** admin Nest + GPS geofence punch (in-scope) | SA/BA/BE CONFIRMED | 🟢 PASS stamp | 🟢 **PASS / ACCEPT** |
| **J-MOB-02** mobile GPS | Historical | **OOS** | ⬜ **OOS / DEFERRED** — **DENY invent FAIL** |
| **J-HRM-06c** leave funnel / WAIVE | Historical SEAL | **not retested** | ⬜ **DEFERRED** — **DENY reopen** |
| Module ATT UAT / sheet-sign | staged | not claimed | ⬜ **DEFERRED** — honesty |
| Empty active wipe (01c live) | FE wire | 🟡 OBS not forced | 🟡 **CONDITION idle-ok** |
| FE `check_in_method=gps` CNS-05 full UF | residual P2 | API only | 🟡 **CONDITION** — FE-01 in-flight |

**U19 note:** This gate certifies the **ATT-WORKSITE-CATALOG** portal slice named in dispatch — **not** J-MOB-02, J-HRM-06c reopen, or attendance module UAT. Missing mobile L2.5 does **not** NO-GO this pack; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE` + OOS J-MOB + FE CNS-05 Condition) and keeps `attendance_uat_ready=false`.

---

## Defect / OBS disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **R-PLT-ATT-WS-FE-CNS-05** | QA P2 · FE omits `check_in_method=gps` | **CONDITION** — owner **dev-fe** · work_item **ATT-WORKSITE-CATALOG-FE-01 already DISPATCHED** — **do not invent FE Task** |
| **OBS-01c-EMPTY-ACTIVE** | QA OBS · activeRemain=1 | **CONDITION idle-ok** — wipe peer Nest sites forbidden; CTA + 01d prove admin CREATE · **not** NO-GO |
| SITE-UNKNOWN | BA HOLD GĐ1.5 | **HOLD ACCEPT** — no invent FAIL |
| J-MOB-02 | OOS portal wave | **OOS ACCEPT** — no invent |
| QA pack missing command_table | verify 1/8 | **PROCESS OBS** — QC consolidates 8/8 |
| OBS i18n gpsAttendance keys on confirm | screen `05` | **idle-ok P3** — GEO-001 toast PASS · optional FE polish |
| Stale-dist / product P0 | — | **NONE** |
| L1/product FAIL on core AC | none | **NONE** — do not invent defect |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| QA overall PASS stamp `ATTWSQA-MSJC3IN9` | PRODUCT PASS | Yes → GWC ACCEPT work-sites SEAL |
| Admin POST 201 + F5 Nest SoT | PRODUCT PASS | Yes → 01d |
| GEO-001 OOS + inside 201 + soft-retire | PRODUCT PASS | Yes → 01 / 01b / CNS-04 |
| CNS-05 BE GEO-REQ + FE omit | PRODUCT CONDITION P2 | Yes → GWC (not full GO) · FE-01 in-flight |
| Honesty / ready flips / seal reopen | PRODUCT DENIED | Yes → CONDITIONS |
| 01c empty not forced | PRODUCT OBS P2 | Soft CONDITION idle-ok only |
| SITE-UNKNOWN / J-MOB-02 | PROCESS HOLD / OOS | No invent FAIL |
| QA pack command_table miss | PROCESS OBS | No — QC consolidates |
| Live unauth 401 / L0 200 | ENV OK / PRODUCT OK | Spot-check only |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **Honesty / C-SLICE** | — | **pm** | Keep `attendance_uat_ready=false` · printable/personnel false · no module ATT UAT / Phase1 invent · no ATT-LEAVE / WAIVE / J-06c / SI / CTR reopen |
| **R-PLT-ATT-WS-FE-CNS-05** | P2 | **dev-fe** (FE-01) | Already **DISPATCHED** — await READY_FOR_QA → QA retest · **do not invent FE** |
| **OBS-01c-EMPTY-ACTIVE** | P2 OBS | **pm** | Empty active live path — **idle-ok** this seat (no wipe peers) |
| Peer seals ATT-LEAVE / WAIVE / J-06c / SI / CTR / enrollment | must_keep | — | **do not reopen** |
| **U88 continuous** | — | **pm** | Dispatch **ba-docs** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DOCS-01` (client DOC-DELTA Nest F-ATT-CAT-WS · admin open ≠ consumer geofence · GEO-001/GEO-REQ · soft-retire) — do not idle program on this seat seal alone · retain FE-01 in-flight |

**No residual P0/P1 product** on ATT work-sites catalog AC pack. FE CNS-05 = **Condition** only (already owned).

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QC-01` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ **N/A deferred** — portal work-sites GPS · J-MOB-02 OOS · no J-* promote |
| 4 | crud_or_matrix | ✅ AC-PLT-ATT-WORKSITE-01* · CNS-04 · CNS-05 · SITE-UNKNOWN HOLD matrix above |
| 5 | Classification | ✅ PRODUCT / PROCESS |
| 6 | Honesty locks | ✅ `attendance_uat_ready=false` · printable/personnel false · DENIED seal reopen |
| 7 | Residual section | ✅ C-SLICE · FE-CNS-05 Condition · OBS 01c · U88 ba-docs |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-qa-01.md` | exit **1** · missing `command_table` | **PROCESS OBS** — QA seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-qc-01.md` | exit **0** · **PASS** · **8/8** | QC pack SoT (re-run after write) |
| QA-01 runner stamp `ATTWSQA-MSJC3IN9` | **PASS** · overall PASS | PRODUCT OK (cited machine JSON) |
| QC live spot unauth `:28001` `/attendance/work-sites?company_id=main` | **401** | PRODUCT OK (spot-check) |
| QC L0 portal `:5173` · hrm `/api/hrm` | **200** / **200** | ENV OK |
| QC GEO spot `HRM-ATT-GEO-001` / `HRM-ATT-GEO-REQ` in `attendance.service.ts` | **PRESENT** | PRODUCT OK |
| Bus FE-01 `ATT-WORKSITE-CATALOG-FE-01` | **DISPATCHED** | PROCESS OK — no invent |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit + unauth/L0/screen spot.

**L2.5 / journey:** No J-* promote in-scope this seat — **deferred**. Explicit: J-MOB-02 OOS · J-HRM-06c / module ATT UAT = **N/A / not tested** for this work-sites gate — **DENY reopen / invent**.

---

## Scope statement (bounded)

**IN scope ACCEPT:** AC-PLT-ATT-WORKSITE-01 / 01b / 01d / 01H · VAL-ATT-WS-CNS-04 · CNS-05 BE GEO-REQ stamp · SITE-UNKNOWN HOLD · J-MOB-02 OOS · U65 zero-seed · peer + ATT-LEAVE + WAIVE/J-06c + SI/CTR seals retain · work-sites slice **SEAL**.

**OUT of scope / DENIED:** Module ATT UAT · `attendance_uat_ready` flip · printable/personnel flip · reopen ATT-LEAVE GWC · reopen WAIVE/sign/J-HRM-06c · reopen SI/CTR/enrollment · Phase 1 DONE · seed · invent SITE-UNKNOWN FAIL · invent duplicate FE · claim empty-active live wipe PASS · claim `gps_locations` JSON sole SoT · J-MOB-02 promote this seat.

---

## completion_report

### Closed

1. Narrow QC GWC **SEAL** for ATT-WORKSITE-CATALOG (AC-PLT-ATT-WORKSITE-01* + CNS-04 + optional CNS-05 BE) complete.
2. QA stamp **`ATTWSQA-MSJC3IN9`** · overall **PASS** · U65 admin **POST 201** Nest + GEO-001 OOS + inside **201** + soft-retire **ACCEPT**.
3. Live unauth **401** · L0 **200** · GEO codes **PRESENT** · screens `02`/`05` spot-check PASS.
4. Seals retained: ATT-LEAVE GWC · WAIVE/sign/J-06c · SI type/insurer · CTR · enrollment · EMP·DEC·PAY·REC·EXT·LIST-TOTALS **not reopened**.
5. Honesty locked: `attendance_uat_ready=false` · printable/personnel false · DENIED module ATT UAT / Phase1.
6. Confirmed **R-PLT-ATT-WS-FE-CNS-05** → **FE-01 already DISPATCHED** — no invent FE Task.
7. Verdict **GO WITH CONDITIONS** (slice-SEAL) — not full-module GO.

### Residual

- **CONDITION:** honesty / `C-SLICE-≠-MODULE` retained · DENIED ready flips / seal reopen.
- **CONDITION P2:** R-PLT-ATT-WS-FE-CNS-05 → FE-01 **in-flight** (do not re-dispatch).
- **CONDITION OBS P2 idle-ok:** empty active live branch (01c) — do not wipe peer Nest sites.
- **U88 continuous:** next **ba-docs** ATT work-sites catalog DOC-DELTA — do not idle program on this seat seal alone.

---

## next_owner

**pm** → (1) retain **FE-01** in-flight for CNS-05 — **do not invent FE** · (2) dispatch **`ba-docs`** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DOCS-01` · honesty false · cấm reopen sealed GWC

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DOCS-01
from_role: pm
to_role: ba-docs
lane: governance
priority: P2
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QC-01 GWC · ATT work-sites catalog SEAL ACCEPT
program: PO-HRM-CONTINUOUS-W8-20260807
ref_qc: docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-qc-01.md
stamp_peer: ATTWSQA-MSJC3IN9 · ATT-LEAVE GWC · WAIVE/sign/J-HRM-06c · SI type/insurer · CTR · enrollment SEAL retain
spec_ref: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md · SA Option B · F-ATT-CAT-WS · HRM-ATT-GEO-001 · HRM-ATT-GEO-REQ · soft-retire active=false
peer_docs: ATT-LEAVE-CATALOG-DOCS-01 / PAY-CATALOG-DOCS-01 pattern (ADD-only DOC-DELTA · no wipe)
note: FE-01 already DISPATCHED for R-PLT-ATT-WS-FE-CNS-05 — do NOT invent FE Task

## entry_criteria
ATT-WORKSITE-CATALOG-QC-01 GWC sealed; honesty attendance_uat_ready=false · printable/personnel false LOCKED; ATT-LEAVE + WAIVE/sign/J-06c + SI/CTR/enrollment seals retained (cấm reopen); FE-01 in-flight for CNS-05 Condition

## task
Client DOC-DELTA (ADD-only) for Nest attendance_work_sites / F-ATT-CAT-WS platform catalog:
- Admin F-ATT-CAT-WS-02 open N+1 ≠ consumer invent OOS coords
- Consumer GPS punch when active>0 + gps_enabled · invent OOS → HRM-ATT-GEO-001 · soft-retire hides from geofence
- Optional note CNS-05 GEO-REQ when check_in_method=gps omit lat/lon (FE wire in-flight)
- SITE-UNKNOWN HOLD · J-MOB-02 OOS — no invent FAIL claim
- HDSD / SRS client delta only — no prompt-echo · no wipe prior seals
- DENY attendance_uat_ready flip · DENY reopen ATT-LEAVE / WAIVE / J-06c · DENY module ATT UAT claim
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-docs-01.md (+ client DOC path if applicable)

## cấm
seed · flip ready flags · invent module ATT UAT · reopen sealed GWC · wipe prior GĐ1 seals · claim Phase1 DONE · invent duplicate FE · invent SITE-UNKNOWN FAIL

## exit
PASS_TO_PM · DOC-DELTA ACCEPT or HOLD-WITH-RATIONALE · completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status
```

---

## evidence_path

`docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-qc-01.md`

## ack_status

**PASS_TO_PM**

## attendance_uat_ready

**false**

## C-SLICE-≠-MODULE

**RETAIN**
