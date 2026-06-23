# MOB-PARTNER-QC-01 — Bounded Partner Go/No-Go (G4 cluster)

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-PARTNER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **gate** | **G4** — Mobile partner slice (`PHASE1_CLOSURE_REMAINING.md` §G4) |
| **decision** | **GO WITH CONDITIONS (bounded)** — partner ESS slice **promotable** for sponsor demo/UAT @ nip.io; **not** unconditional partner-ready · **not** Phase 1 DONE · **not** PROD-READY |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — partner mobile slice)

| In scope | Out of scope |
|----------|--------------|
| Consolidated gate: MOB-UX-15/16/17 QC trilogy + G3 J-MOB L2.5 batch + mob-parity + ILA G8 | Phase 1 DONE / `verify:product:completion` program exit |
| Canonical APK lineage **MOB-UX-17** @ nip.io `emulator-5554` | Full MOB-UX-11 umbrella re-regression (covered by prior `qc-pcomp-w8-mob-ui-qc-01`) |
| Core ESS journeys J-MOB-01..07, 13-ext, 22, 30 @ `uat.nv0001`/`nv0002` | MOB-UX-13e/f/g persona + swipe + culture device packs |
| ILA partner 10-screen rubric (`MOBILE_UI_LAYOUT_COMPOSITION_AUDIT.md`) | Physical OEM matrix beyond emulator API 33 |
| Ecosystem parity MP-08/MP-19 slug class (QC spot + BE fix) | Web portal L2/L2.5 P-CC matrix (G3 separate) |
| `MOBILE_PARTNER_READINESS_ASSESSMENT.md` honest assessment cross-check | Sponsor `PCOMP-W6-SP-01` human sign-off |

**Upstream evidence chain (audited):**

| Wave | Evidence | Prior QC/QA verdict | QC audit |
|------|----------|---------------------|----------|
| Sanitization | [`qc-mob-ux-15-20260609.md`](qc-mob-ux-15-20260609.md) | **GWC** — 15a P0 CLOSED | 15a device 16/16; grep gate PASS |
| ILA layout G8 | [`qc-mob-ux-16-20260609.md`](qc-mob-ux-16-20260609.md) + [`mob-ux-16-ila-scorecard-r3-20260609.md`](mob-ux-16-ila-scorecard-r3-20260609.md) | **GWC** — 9/10 ≥16 avg ~16.3 | CheckIn 15 carry |
| Home announcements | [`qc-mob-ux-17-20260609.md`](qc-mob-ux-17-20260609.md) | **GWC** — Hướng 1 CLOSED | J-MOB-22 bell-only PROMOTED |
| L2.5 J-MOB batch | [`p1-g3-jmob-l25-batch-20260609.md`](p1-g3-jmob-l25-batch-20260609.md) | **GWC PASS_TO_PM** | 11 journeys device @ MOB-UX-17 SHA |
| Parity matrix | [`mob-parity-01-20260609.md`](mob-parity-01-20260609.md) + [`d-mob-parity-leave-slug-01-20260609.md`](d-mob-parity-leave-slug-01-20260609.md) | QA **FAIL** → BE **READY_FOR_QA** | QC nip.io spot **4/4 PASS** (see §Parity) |
| Readiness SoT | [`MOBILE_PARTNER_READINESS_ASSESSMENT.md`](../../program/MOBILE_PARTNER_READINESS_ASSESSMENT.md) | PM honest **NOT 100%** | Cross-check confirms bounded GWC only |

**Canonical APK (partner line):**

| Item | Value |
|------|-------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Build | MOB-UX-17 qa-device |
| Bytes | 69,132,861 |
| SHA-256 | `C152EDD6B093871CCA59EE8AF60C65B3C1B615A53C82675DE1E078E240B412BE` |
| API | `https://14-225-217-232.nip.io` |
| Personas | `uat.nv0001@xe.vn` (EMP) · `uat.nv0002@xe.vn` (MGR) / `xevn-uat-2026` |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-mob-partner-01-20260609.md
# QC self-audit target: 8/8 (this file)

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-g3-jmob-l25-batch-20260609.md
# exit 1 — 1/8 format (work_item_id table style); process GWC — QC audited opened MD + JSON

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-mob-ux-17-20260609.md
# exit 1 — 2/8 mobile device pack; process GWC per prior MOB-UX waves
```

**QC adjudication:** Partner gate consolidates **multiple specialized mobile packs** (ILA scorecard, uiautomator spot, J-MOB batch). **Not** product NO-GO for upstream format gaps — QC **opened and cross-audited** primary artifacts listed above.

**QC independent spot-checks (2026-06-09):**

| Command | Exit | Result |
|---------|------|--------|
| `pnpm run test:mobile:user-copy` | **0** | PASS — 23 feature TSX + scopeError vitest 4/4 |
| `HRM_API_BASE_URL=https://14-225-217-232.nip.io node scripts/tmp-d-mob-parity-leave-slug-01-probe.mjs` | **0** | **4/4 PASS** — leave-requests + notifications holding slug + UUID |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| Emulator `emulator-5554` + APK SHA `C152EDD6…` | ENV / lineage | **PASS** |
| nip.io pilot API health + auth | ENV | **PASS** |
| `x-company-id` UUID ≠ `main` for UAT personas | ENV / scope | **PASS** |
| Play Store «Update your app» gate mid-session | ENV | **GWC** — adb hijack; non-blocking with retry protocol |
| Metro LogBox require-cycle (`teamDirectory.ts`) | PRODUCT P2 | **GWC** — hygiene; no crash |
| **P0** Notifications MOB-13 debug shell (15a) | PRODUCT / sponsor | **PASS — CLOSED** |
| **P0** Home announcements scroll list (17) | PRODUCT / sponsor | **PASS — CLOSED** — bell-only J-MOB-22 |
| **P0** payslip `holding` slug / leave gap / home matrix (16 P0) | PRODUCT | **PASS — CLOSED** on R2/R3 chain |
| **P0** leave/notifications `holding` slug API 500 (parity) | PRODUCT | **PASS — CLOSED** on nip.io (QC spot 4/4 post-deploy) |
| **P1** CheckIn ILA-09 FAB competition (15/20) | PRODUCT | **CARRY** — R3-CHECKIN-FAB-01 |
| **P1** MOB-UX-15d `update_type` / home hub rows | PRODUCT | **OPEN** — separate wave |
| **P1** 15b/15c device spot (Settings/Scope/Payroll) | PRODUCT / process | **GWC deferred** — grep-class closed |
| **P2** TopBar bell numeric badge (17) | PRODUCT | **GWC optional** |
| **P2** J-MOB-05 strict Duyệt tap (`pending=0`) | PRODUCT / seed | **GWC** — inbox loads; strict blocked |
| **P2** J-MOB-08/09 hub cards (no seed today) | PRODUCT / seed | **GWC** — prior waves CLOSED; date-dependent |
| **P3** Quick-access «Thông báo» tile (nav shortcut) | PRODUCT | **ACCEPTED** out of MOB-UX-17 scope |
| **DEFERRED** MOB-UX-13e/f/g persona/swipe/culture | PRODUCT | **NOT in G4 slice** — track PCOMP-W6 pack |

**Product NO-GO avoided:** No open **P0 sponsor screenshot class** on default partner journey @ canonical APK. Residuals are **bounded carry** (ILA CheckIn, 15d, seed-dependent strict paths) — not wave rollback.

---

## G4 gate criteria audit

Per `PHASE1_CLOSURE_REMAINING.md` + `MOBILE_PARTNER_READINESS_ASSESSMENT.md`:

| Criterion | Target | Evidence | QC verdict |
|-----------|--------|----------|------------|
| **G5** mobile unit + user-copy | exit 0 | `test:mobile:user-copy` spot **0**; program cites 429/429 | **PASS** (spot) |
| **G8** ILA ≥16/20 + `verify:mobile:layout` | 10/10 ≥16 partner | R3 **9/10** avg **~16.3**; layout gate PASS on R3 SHA | **MET (GWC)** |
| **G6** ecosystem parity | MP-08/19 no P0 slug | nip.io probe **4/4**; formal MOB-PARITY-01 R2 pending | **MET (GWC)** — spot promotes P0 closure |
| **G3** J-MOB L2.5 | device cross-nav | `p1-g3-jmob-l25-batch` 8 PASS + 3 GWC | **MET (GWC)** |
| Sanitization 15a P0 | sponsor class closed | `qc-mob-ux-15` 16/16 device | **PASS** |
| Home composition 17 | Hướng 1 | `qc-mob-ux-17` R2 device | **PASS** |
| Persona 13e + matrix 14d | device proof | **NOT CLOSED** — 13e/f/g deferred; 14d partial on R3 SHA | **GWC carry** |
| Sponsor PCOMP-W6-SP-01 | human UAT | pack ready; not signed | **BLOCKED** program exit only |
| **G4 partner slice QC** | bounded GO | this gate | **GO WITH CONDITIONS** |

---

## L2.5 — Journey audit (partner slice @ nip.io)

| J-ID | Journey | Batch / prior QC | QC verdict | Notes |
|------|---------|------------------|------------|-------|
| **J-MOB-01** | Login → home | batch PASS | **PASS — PROMOTED** | deep link |
| **J-MOB-02** | Check-in GPS | batch PASS | **PASS — PROMOTED** | sticky footer |
| **J-MOB-03** | Leave row → detail | batch PASS | **PASS — PROMOTED** | activity feed path |
| **J-MOB-04** | Payslip tab → detail | batch PASS | **PASS — PROMOTED** | no `holding` |
| **J-MOB-05** | Manager Duyệt | batch GWC | **GWC PASS** | `pending=0`; strict tap deferred |
| **J-MOB-06** | Home «việc cần làm» | batch PASS | **PASS — PROMOTED** | |
| **J-MOB-07** | Manager «Cần duyệt» | batch PASS | **PASS — PROMOTED** | nv0002 |
| **J-MOB-08** | Sinh nhật hôm nay | batch GWC | **GWC** | no seed today; JMAP prior CLOSED |
| **J-MOB-09** | Ai nghỉ hôm nay | batch GWC | **GWC** | no hub seed today; prior CLOSED |
| **J-MOB-13-ext** | Notifications bell | batch + 15a QC | **PASS — PROMOTED** | VI stack, no debug shell |
| **J-MOB-22** | Home → bell → inbox | 17 QC | **PASS — PROMOTED** | scroll list removed |
| **J-MOB-30** | Team directory → detail | batch PASS | **PASS — PROMOTED** | |
| J-MOB-17 | Profile tabs | prior CLOSED; ILA 16 R3 | **PASS** | |
| J-MOB-25 | Leave balance→tabs | 16 P0 + prior | **PASS** | 16b gap closed |
| J-MOB-34 | Payslip period VI | 16e | **PASS** | |
| J-MOB-36..38 | Persona device | **NOT RUN** | **DEFERRED** | MOB-UX-13e — out of G4 bounded slice |

**L2.5 rule compliance:** Partner gate cites **device adb + uiautomator** for in-scope J-MOB rows — **not** HTTP-only. QC **does not** NO-GO on J-MOB-08/09 date-seed GWC when prior device CLOSED evidence exists on JMAP.

---

## ILA partner slice (G8)

| Screen | R3 score | MOB-UX-17 batch | Partner threshold | QC |
|--------|----------|-----------------|-------------------|-----|
| Home | 17 | 17 | ≥16 | **PASS** |
| Notifications | 18 | 18 | ≥16 | **PASS** |
| Leave | 16 | 16 | ≥16 | **PASS** |
| Approvals | 16 | 16 | ≥16 | **PASS** |
| CheckIn | **15** | **16** (batch sticky) | ≥16 | **GWC CARRY** — R3-CHECKIN-FAB-01 |
| Team | 16 | 16 | ≥16 | **PASS** |
| Colleague | 17 | — | ≥16 | **PASS** |
| Profile | 16 | 16 (carry) | ≥16 | **PASS** — 16d closed |
| Payslip | 17 | 17 | ≥16 | **PASS** |
| Settings | 16 GWC | 16 (carry) | ≥16 | **GWC** — unit PASS; device adb partial |

| Metric | Value | Partner target | QC |
|--------|-------|----------------|-----|
| Screens ≥16/20 | **9/10** (R3) · batch cites 9/10 | 10/10 unconditional | **GWC** |
| Average ILA | **~16.3/20** | ≥16 | **PASS (GWC)** |
| Hard zero ILA-07/01 | none | mandatory | **PASS** |

---

## Parity audit (G6 mobile↔web)

| Route | MOB-PARITY-01 (2026-06-09) | QC spot (nip.io) | QC verdict |
|-------|---------------------------|------------------|------------|
| MP-08 leave list | FAIL P0 slug | holding slug **200** HRM-LEAVE-200 | **PROMOTED** — deploy + BE fix verified |
| MP-19 notifications | FAIL P0 slug | holding slug **200** HRM-NOTIF-200 | **PROMOTED** |
| MP-01 directory | GWC field drift | not re-probed | **GWC** — `job_title_key` documented |
| MP-11/17@ceo | GWC web-only | waived per assessment §6 | **ACCEPTED** out of partner slice |
| Other 15 routes | PASS per matrix | — | **PASS** (cited) |

**Formal promotion:** `MOB-PARITY-01` remains **FAIL_TO_PM** in QA file — QC promotes P0 slug class **on evidence of nip.io 4/4**; PM should dispatch **MOB-PARITY-01-R2** qa confirm for G6 program row closure.

---

## Consolidated carry list (G4 GWC)

| ID | Item | Sev | Owner | Blocks sponsor demo? | Blocks G4 GWC? |
|----|------|-----|-------|----------------------|----------------|
| **CARRY-G4-01** | CheckIn ILA 15/20 — FAB visible on focused screen (`R3-CHECKIN-FAB-01`) | P1 | dev-mobile | No | No — GWC documented |
| **CARRY-G4-02** | MOB-UX-15d `update_type` / dashboard hub rows | P1 | dev-mobile | Minor | No |
| **CARRY-G4-03** | 15bc device spot Settings/Scope/Payroll subtitle | P2 | qa-device | No | No |
| **CARRY-G4-04** | MOB-PARITY-01 formal R2 QA promotion | P2 | qa | No | No — spot PASS |
| **CARRY-G4-05** | J-MOB-05 strict Duyệt (`pending≥1` seed) | P2 | devops/qa | Demo only | No |
| **CARRY-G4-06** | J-MOB-08/09 hub cards date-seed | P2 | devops | Demo only | No |
| **CARRY-G4-07** | MOB-UX-16-QA-R3 formal 10-screen pack on SHA `C152EDD6…` | P2 | qa-device | No | No |
| **CARRY-G4-08** | MOB-UX-13e/f/g persona + swipe + culture | P1 | qa-device | Partner polish | No — out of bounded G4 |
| **CARRY-G4-09** | LogBox require-cycle toast | P2 | dev-mobile | No | No |
| **CARRY-G4-10** | TopBar bell numeric badge | P3 | dev-mobile | No | No |
| **CARRY-G4-11** | Sponsor `PCOMP-W6-SP-01` sign-off | Program | sponsor | **Yes** for Phase 1 DONE | No for G4 GWC |

---

## Conditions (bounded GO — not partner PROGRAM done)

| ID | Condition | Owner | Target |
|----|-----------|-------|--------|
| **GWC-G4-ILA-01** | CheckIn ≥16/20 — hide FAB on focused CheckIn navigate path | dev-mobile | MOB-UX-16d follow-up |
| **GWC-G4-15D-01** | Close MOB-UX-15d `update_type` sanitization | dev-mobile | MOB-UX-15d |
| **GWC-G4-PARITY-01** | Formal MOB-PARITY-01-R2 qa — promote MP-08/19 on nip.io | qa | G6 row |
| **GWC-G4-SEED-01** | nip.io `pending≥1` for strict J-MOB-05 demo | devops | optional demo |
| **GWC-G4-PERSONA-01** | MOB-UX-13e device before claiming «tier-1 persona» | qa-device | PCOMP-W6 pack |
| **GWC-G4-SPONSOR-01** | Human UAT session `PCOMP-W6-SP-01` before Phase 1 DONE | sponsor | W6 |

---

## Residual

| ID | Item | Sev | Owner |
|----|------|-----|-------|
| R-G4-CHECKIN-FAB | CheckIn FAB in uiautomator tree | P1 | dev-mobile |
| R-G4-15D | `update_type` raw tokens list/detail/home | P1 | dev-mobile |
| R-G4-PARITY-FORMAL | MOB-PARITY-01 QA file still FAIL_TO_PM | P2 | qa |
| R-G4-ILA-CAPTURE | Formal ILA screenshots on MOB-UX-17 SHA | P2 | qa-device |
| R-G4-13EFG | Persona/swipe/culture device deferred | P1 | qa-device |
| R-G4-PROGRAM | Phase 1 DONE / PROD / sponsor sign-off | Program | pm/sponsor |

---

## Program statements

- **G4 mobile partner slice:** **GO WITH CONDITIONS (bounded)** — core ESS @ nip.io **promotable** for sponsor demo/UAT on APK `C152EDD6…412BE`; consolidates 15/16/17 QC GWC + J-MOB L2.5 batch + parity P0 spot closure.
- **Unconditional partner-ready:** **DENIED** — CheckIn ILA carry, 15d open, 13e persona deferred, formal parity R2 pending.
- **G8 ILA layout gate:** **MET (GWC)** — 9/10 ≥16, avg ~16.3.
- **G6 ecosystem parity:** **MET (GWC)** — P0 slug class closed on nip.io QC spot; formal QA promotion pending.
- **Phase 1 DONE:** **EXPLICITLY DENIED** — G7 sponsor sign-off + program gates G1–G3 carry remain.
- **PROD-READY:** **DENIED** — nip.io pilot only.

---

## Handoff

```yaml
completion_report: >
  MOB-PARTNER-QC-01 GO WITH CONDITIONS (bounded G4): consolidated qc-mob-ux-15/16/17 GWC,
  p1-g3-jmob-l25-batch GWC on APK C152EDD6…, ILA 9/10≥16 avg ~16.3, parity P0 slug 4/4
  nip.io spot PASS. Partner ESS slice promotable for sponsor demo @ nip.io. Carry: CheckIn
  FAB ILA-15, MOB-UX-15d, 15bc device spot, MOB-PARITY-01 formal R2, 13e persona, PCOMP-W6-SP-01.
  NOT Phase 1 DONE / NOT PROD-READY / NOT unconditional partner-ready.
next_owner: pm
next_dispatch_prompt: >
  PM intake MOB-PARTNER-QC-01 PASS_TO_PM (G4 GWC) → update PHASE1_CLOSURE_REMAINING G4 row to
  GWC PASS; dispatch dev-mobile CARRY-G4-01 CheckIn FAB hide (R3-CHECKIN-FAB-01) + MOB-UX-15d;
  dispatch qa MOB-PARITY-01-R2 (nip.io 4/4 reprobe + promote MP-08/19); optional qa-device
  MOB-UX-13e for PCOMP-W6 pack. Schedule sponsor PCOMP-W6-SP-01 with APK SHA C152EDD6… and
  account uat.nv0001@xe.vn @ https://14-225-217-232.nip.io. Do NOT claim Phase 1 DONE until
  G7 sign-off + verify:product:completion + carry closure or explicit PM waive register.
evidence_path: docs/qa/evidence/qc-mob-partner-01-20260609.md
ack_status: PASS_TO_PM
pm_dispatch_hint: G4 GWC closed — dev-mobile CheckIn FAB + MOB-UX-15d; qa MOB-PARITY-01-R2; sponsor PCOMP-W6-SP-01
```
