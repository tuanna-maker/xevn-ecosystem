# PCOMP-W8-MOB-UI-QC-01 — MOB-UX-11 umbrella + W8 mobile polish gate @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W8-MOB-UI-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **decision** | **GO WITH CONDITIONS (reduced)** — **MOB-UX-11 umbrella** + **W8 mobile polish** **device promotable** @ nip.io emulator |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — MOB-UX-11 series + PCOMP-W8-MOB-UI-QA-01)

| In scope | Out of scope |
|----------|--------------|
| Umbrella gate **MOB-UX-11a–11f** sub-waves (SET F visual primitive layer) | Phase 1 DONE / `verify:product:completion` program exit |
| Full device J-MOB regression matrix (29 PASS / 2 GWC / 0 FAIL) | PROD cutover / store release |
| 4-tab bar + FAB + profile tabs + team directory (`uat.nv0002`) | Web portal J-HRM-* browser matrix |
| SET F-4 attendance month calendar (J-MOB-35 ext) | Manager-persona inline approve on employee account |
| Unified qa-device APK @ nip.io `emulator-5554` | Physical device matrix beyond emulator-5554 |
| Account `uat.nv0001@xe.vn` / `xevn-uat-2026` (+ team `uat.nv0002`) | J-MOB-03..05 strict re-gate (prior MOB-UX-03-GLOBAL QC closed) |

**Upstream chain:**

| Stage | Evidence | Verdict |
|-------|----------|---------|
| MOB-UX-11a/10c QC | [`qc-mob-ux-11a-10c-20260609.md`](qc-mob-ux-11a-10c-20260609.md) | GWC reduced — J-MOB-34 hero CLOSED |
| MOB-UX-11d QC | [`qc-mob-ux-11d-20260609.md`](qc-mob-ux-11d-20260609.md) | GWC reduced — J-MOB-35 ext calendar CLOSED |
| MOB-UX-11f QC | [`qc-mob-ux-11f-20260609.md`](qc-mob-ux-11f-20260609.md) | GWC reduced — AC-UI-MOTION CLOSED |
| QA-device umbrella | [`pcomp-w8-mob-ui-qa-01-device-20260609.md`](pcomp-w8-mob-ui-qa-01-device-20260609.md) | PASS_TO_PM — 29 PASS / 2 GWC / 0 FAIL |
| Machine JSON | [`pcomp-w8-mob-ui-qa-01-device-20260609.json`](pcomp-w8-mob-ui-qa-01-device-20260609.json) | `summary.pass: 29`, `gwc: 2`, `fail: 0`; `fatal: false` |
| UI dumps | [`pcomp-w8-mob-ui-qa-01-screens/`](pcomp-w8-mob-ui-qa-01-screens/) (48 XML) | QC spot-audit |
| Spec | [`MOBILE_UI_LIBRARY_DECISION.md`](../../program/MOBILE_UI_LIBRARY_DECISION.md) §5 MOB-UX-11a–f + gate | Delta aligned |

**APK lineage:** `hrm-mobile-qa-device.apk` · **68,863,470 B** · SHA-256 `2759AE0790AA1A381DABF8CE80E4485A658A33B94AB02500529DA87C01CD65DC`

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-w8-mob-ui-qa-01-device-20260609.md
# exit 1 — 5/8 checks (2026-06-09 QC audit)
# FAIL: work_item_id (table lacks **bold**), ack_status (table lacks **bold**), command_table (no exit-code table in MD)
```

**QC adjudication:** **PROCESS NOTE — not product NO-GO.** Same mobile-device slice class as prior MOB-UX-11 sub-wave QCs:

| Failed check | QC ruling |
|--------------|-----------|
| `work_item_id` / `ack_status` | **Format** — fields present in table rows without verifier-expected `**bold**` markdown; JSON handoff complete |
| `command_table` | **Format** — commands in fenced block + JSON `commands[]` with `exit: 0`; MD lacks tabular exit table |

Material pack present: full J-MOB matrix, `## Residual`, machine JSON booleans, 48 XML artifacts, APK SHA, api_base nip.io, valid handoff block — **auditable**.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| Emulator `emulator-5554` + cold install | ENV | **PASS** |
| APK SHA-256 matches PM dispatch + prior 11f QC | ENV / lineage | **PASS** |
| nip.io pilot API `https://14-225-217-232.nip.io` | ENV | **PASS** |
| `POST /auth/mobile/login` 201 + UUID scope (not `main`) | ENV / L2.5 | **PASS** |
| `GET /api/hrm/health` 404 on nip.io alias | ENV | **Accept** — mobile login + journeys 200; not product block |
| `fatal_logcat: false` | Stability | **PASS** |
| Script `node scripts/tmp-pcomp-w8-mob-ui-qa-01-device.mjs` exit **0** | Automation | **PASS** |
| **J-MOB-24** inline mgr approve on employee persona | PRODUCT / persona | **GWC** — employee list path acceptable; mgr approve covered prior MOB-UX-07/R4 waves |
| **J-MOB-29** leave form visual polish | PRODUCT / UX P2 | **GWC** — create flow exercised via J-MOB-28; no P0 block |
| All other in-matrix J-MOB rows | PRODUCT / L2.5 | **PASS — PROMOTED** umbrella regression |

**Product NO-GO avoided:** Zero FAIL rows; no new P0/P1 blockers on unified APK.

---

## L2.5 — Journey audit (device @ nip.io emulator)

### MOB-UX-11 sub-wave consolidation

| Sub-wave | SET F | Primary J-* | Prior QC | Umbrella QA | QC umbrella verdict |
|----------|-------|-------------|----------|-------------|---------------------|
| **MOB-UX-11a** | bootstrap + primitives | — | (boot in 11a-10c) | APK boots, no Reanimated crash | **PASS — reaffirmed** |
| **MOB-UX-11b** | F-1 login | J-MOB-01 | — | PASS login home | **PASS — PROMOTED** |
| **MOB-UX-11c** | F-2 dashboard | J-MOB-19..21 | — | PASS ESS layer | **PASS — PROMOTED** |
| **MOB-UX-11d** | F-4 calendar | J-MOB-35 ext | [`qc-mob-ux-11d`](qc-mob-ux-11d-20260609.md) | PASS cal+month | **PASS — reaffirmed** |
| **MOB-UX-11f** | motion/skeleton | J-MOB-19..30 smoke | [`qc-mob-ux-11f`](qc-mob-ux-11f-20260609.md) | Regressed in umbrella | **PASS — reaffirmed** |
| **MOB-UX-11 gate** | all SET F | J-MOB-01,02,06..35,30,AVT | **this file** | 29 PASS / 2 GWC | **GWC reduced — umbrella CLOSED** |

### Full regression matrix (QA → QC)

| Journey | QA | QC verdict | Spot evidence |
|---------|-----|------------|---------------|
| **J-MOB-01** | PASS | **PASS — PROMOTED** | `uiqa-login-home.xml` — home hub, 4-tab, FAB |
| **4-TAB-BAR** | PASS | **PASS — PROMOTED** | 4/4 tabs in XML dumps |
| **J-MOB-06..09** | PASS | **PASS — PROMOTED** | `uiqa-login-home.xml` — pending strip, birthday carousel, whos out |
| **J-MOB-11..15** | PASS | **PASS — PROMOTED** | portal shell elements in home XML |
| **J-MOB-17** | PASS | **PASS — PROMOTED** | `uiqa-j17-work.xml`, `uiqa-j17-doc.xml` |
| **J-MOB-19..22** | PASS | **PASS — PROMOTED** | ESS header/stats/cards in home XML |
| **J-MOB-23** | PASS | **PASS — PROMOTED** | `uiqa-leave-list.xml` |
| **J-MOB-24** | GWC | **GWC — ACCEPT** | employee persona; mgr path prior waves |
| **J-MOB-25** | PASS | **PASS — PROMOTED** | balance list |
| **J-MOB-26** | PASS | **PASS — PROMOTED** | My Leaves tabs |
| **J-MOB-27** | PASS | **PASS — PROMOTED** | create CTA |
| **J-MOB-28** | PASS | **PASS — PROMOTED** | `uiqa-j28-create.xml` balance chip |
| **J-MOB-29** | GWC | **GWC — ACCEPT** | form polish; J-MOB-28 create path OK |
| **J-MOB-02** | PASS | **PASS — PROMOTED** | `uiqa-j02-checkin.xml`, FAB sheet |
| **J-MOB-31** | PASS | **PASS — PROMOTED** | pending strip in home XML |
| **J-MOB-32** | PASS | **PASS — PROMOTED** | action grid → leave |
| **J-MOB-33** | PASS | **PASS — PROMOTED** | `uiqa-j02-fab-sheet.xml` |
| **J-MOB-34** | PASS | **PASS — PROMOTED** | `uiqa-j34-payslip.xml` |
| **J-MOB-35** | PASS | **PASS — PROMOTED** | `uiqa-j35-calendar.xml` — `attendance-month-calendar`, «Tháng 6 2026», legend 3 labels |
| **J-AVT-02** | PASS | **PASS — PROMOTED** | `uiqa-avt-picker.xml`, crop, success |
| **J-MOB-30** | PASS | **PASS — PROMOTED** | `uiqa-j30-team.xml`, `uiqa-j30-detail.xml` @ uat.nv0002 |

### Not re-gated this umbrella wave (prior QC closed)

| Journey | QC verdict | Rationale |
|---------|------------|-----------|
| **J-MOB-03..05** | **NOT re-gated** | MOB-UX-03-GLOBAL QC closed strict R4 |
| **J-MOB-07** mgr card count | **NOT re-gated** | Not in umbrella matrix; prior ESS-dash QC |

---

## Residual / conditions

| ID | Item | Severity | QC disposition |
|----|------|----------|----------------|
| **GWC-JMOB24-01** | Inline mgr approve not on employee persona path | INFO | **Accept** — mgr approve covered MOB-UX-07/R4; employee list path OK |
| **GWC-JMOB29-01** | Leave form visual polish deferred | INFO | **Accept** — J-MOB-28 create path PASS; P2 polish backlog |
| **ENV-HRM-HEALTH-404** | `GET /api/hrm/health` 404 nip.io route | ENV | **Accept** — journeys + login 200 |
| **C-W8-DEVICE-01** | Gradle MAX_PATH / unified release APK pipeline | GWC **carry** | Not re-tested; qa-device APK functional |
| **D-W8-ESS-PROMISE-01** | ExpoAsset ionicons promise snackbar on Home | GWC **carry** | Not re-tested this wave |
| **C-W8QC-PACK-03** | QA MD pack verifier 5/8 (format) | PROCESS | **Accept** — material pack auditable; not product NO-GO |

No new P0/P1 product blockers for MOB-UX-11 umbrella / W8 mobile polish.

---

## Verdict summary

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS (reduced)** | **MOB-UX-11 umbrella** + **W8 mobile polish** **device promotable** nip.io emulator |
| **CLOSED** | MOB-UX-11 gate (`PCOMP-W8-MOB-UI-QA-01`); SET F regression on APK SHA `2759AE07…CD65DC` |
| **GWC** | J-MOB-24 mgr-inline persona; J-MOB-29 form polish |
| **GWC carry** | C-W8-DEVICE-01, D-W8-ESS-PROMISE-01, ENV-HRM-HEALTH-404 |
| **NOT** Phase 1 DONE / **NOT** PROD | Program gates (`phase1:gate`, G4/G5, web CC/HRM) remain open |

**PROGRAM_JOURNEY_MAP.md:** Batch cite this QC file on regressed mobile rows (updated in same commit).

---

## Handoff

**completion_report:** PCOMP-W8-MOB-UI-QC-01 **GO WITH CONDITIONS (reduced)**. Audited QA-device umbrella chain + MOB-UX-11a/11d/11f prior QCs. Pack verify **5/8** process-only (MD format). Full J-MOB regression **29 PASS / 2 GWC / 0 FAIL** @ nip.io emulator-5554. APK SHA `2759AE0790AA1A381DABF8CE80E4485A658A33B94AB02500529DA87C01CD65DC` matches PM dispatch. XML spot-audit confirms calendar, home hub, FAB, leave, team detail. **MOB-UX-11 umbrella slice promotable.** Journey map batch cite synced.

**next_owner:** `pm`

**next_dispatch_prompt:**

```
PM intake PCOMP-W8-MOB-UI-QC-01 PASS_TO_PM (GO WITH CONDITIONS reduced).

Closed: MOB-UX-11 umbrella + W8 mobile polish device promotable @ nip.io — evidence docs/qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md. APK SHA 2759AE0790AA1A381DABF8CE80E4485A658A33B94AB02500529DA87C01CD65DC.

Mark MOB-UX-11 gate [x] in sprint backlog / PHASE1_PRODUCT_COMPLETION_TODO W8 mobile polish lane.

PROGRAM_JOURNEY_MAP.md already cites qc-pcomp-w8-mob-ui-qc-01-20260609.md on regressed J-MOB rows.

Next program wave per PM_OPEN_BACKLOG — do not claim Phase 1 DONE / PROD until verify:product:completion + QC program GO.
```

**evidence_path:** `docs/qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md`

**ack_status:** **PASS_TO_PM**
