# PCOMP-W7-MOB-BATCH-QC-R3 — W7 mobile batch R3 device gate @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-BATCH-QC-R3` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **decision** | **GO WITH CONDITIONS (reduced)** — W7 mobile batch R3 **promotable** nip.io emulator @ APK `EA9BD74F`; **J-MOB-05 manager approve tile remains CARRY** |
| **api_base** | `https://14-225-217-232.nip.io` |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — W7 batch R3 @ nip.io emulator)

| In scope | Out of scope |
|----------|--------------|
| **J-MOB-25** leave tile → list + balance **8/3** (`uat.nv0001`) | Phase 1 DONE / `verify:product:completion` program exit |
| **J-MOB-11** sick leave → `leave-attachment-picker` | PROD cutover / store release |
| **J-MOB-16** team directory regression (`home-action-tile-team`) | Web portal J-HRM-* browser |
| **G4 carry** CheckIn leaf — FAB hidden on hero | Manager persona **J-MOB-05** approve tile (nv0002) |
| **MOB-UX-15d** notification Vietnamese copy | Full MOB-UX-11 umbrella re-gate |
| APK SHA `EA9BD74F3DA158F6E36391FF4EC148391BD1BA10EF7907D798D4843F38C291F5` | Physical device matrix beyond emulator-5554 |

**Upstream chain:**

| Stage | Evidence | Verdict |
|-------|----------|---------|
| Dev R3 fix | `GestureHandlerRootView` root wrap `App.tsx` | Closes ADD23308 blank-leave class for **nv0001** |
| QA-device R3 final | [`pcomp-w7-mob-batch-qa-r3-final-20260609.md`](pcomp-w7-mob-batch-qa-r3-final-20260609.md) | PASS_TO_PM — 5/5 legs |
| Prior J-MOB-05 strict R2 | [`p1-g3-jmob-05-strict-r2-20260609.md`](p1-g3-jmob-05-strict-r2-20260609.md) | FAIL_TO_PM — **same APK** nv0002 approve tile blank |
| UI dumps | `pcomp-w7-mob-batch-qa-r3-final-screens/` (42 XML) + `r-w7-mob-leave-nav-01-r3-screens/` | QC spot-audit |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-w7-mob-batch-qa-r3-final-20260609.md
# exit 1 — 1/8 checks (2026-06-09 QC audit)
# FAIL: residual_section
```

**QC adjudication:** **PROCESS NOTE — not product NO-GO.** Single missing `## Residual` heading in upstream QA pack (same class as W8 R4 QC **3/8**). Material pack present: journey matrix, API probe, per-leg exit-code table, 42+ XML dumps, valid handoff — **auditable**.

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-pcomp-w7-mob-batch-20260609.md
# exit 0 — 8/8 checks (QC gate file)
```

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| APK SHA `EA9BD74F` on emulator-5554 | ENV / artifact | **PASS** — SHA lock matches QA |
| `pm clear` + install + deep-link login nv0001 | ENV / L2.5 | **PASS** |
| `GET /attendance/leave-balance` **200** `8/3/12` + UUID `x-company-id` | API / PRODUCT | **PASS** — nip.io holding slug |
| **J-MOB-25** `time_off` → `leave-requests-list-screen` + `leave-balance-header` **8/3** | PRODUCT / L2.5 | **PASS** — `r3-leave-list.xml` **~39k B** (was 2822 B blank) |
| **J-MOB-11** sick → `leave-attachment-picker` | PRODUCT / L2.5 | **PASS** — `final-j11-sick.xml` **36,474 B** |
| **G4 carry** CheckIn hero ILA **16**, no `check-in-fab` | PRODUCT / L2.5 | **PASS** — `final2-checkin.xml`; grep **no** `check-in-fab` |
| **MOB-UX-15d** `Giờ vào` / `Chỉnh sửa chấm công` (no raw `check_in_out`) | PRODUCT / L2.5 | **PASS** — `final3-notif.xml` **48,030 B** |
| **J-MOB-16** `team-directory-screen` + `Tất cả` + search | PRODUCT / L2.5 | **PASS** — `final-j16-directory.xml` **59,670 B** |
| **J-MOB-05** `home-action-tile-approve` nv0002 → blank **2822 B** | PRODUCT / L2.5 | **CARRY OPEN** — not in R3 batch scope; strict R2 FAIL on **same APK** |
| Prior ADD23308 blank leave (nv0001) | PRODUCT | **CLOSED** — GestureHandlerRootView R3 |

**Product NO-GO avoided:** All five in-scope nv0001 legs device-verified with XML corroboration. Manager approve tile defect **explicitly excluded** from promotion — not re-tested PASS in this wave.

---

## L2.5 — Journey audit (device @ nip.io emulator)

### Primary — W7 batch R3 wave (nv0001)

| Journey | Requirement | QA R3 | XML / probe | QC verdict |
|---------|-------------|-------|-------------|------------|
| **J-MOB-25** | `time_off` tile → leave list + balance **8/3** | PASS | `r3-leave-list.xml` — `leave-requests-list-screen`, `leave-balance-header` | **PASS** — ADD23308 regression **CLOSED** |
| **J-MOB-11** | Sick leave → attachment picker | PASS | `final-j11-sick.xml` — `leave-attachment-picker` | **PASS** — device CLOSED R3 |
| **G4 carry** | CheckIn leaf FAB hidden on hero | PASS | `final2-checkin.xml` — ILA 16, no `check-in-fab` | **PASS** — carry **CLOSED** on EA9BD74F |
| **MOB-UX-15d** | Notification copy VI, no raw enum | PASS | `final3-notif.xml` — `Giờ vào`, `Chỉnh sửa chấm công` | **PASS** — device CLOSED |
| **J-MOB-16** | Team directory regression (W7-5) | PASS | `final-j16-directory.xml` — `team-directory-screen`, `team-directory-search` | **PASS** — device CLOSED |

### Deferred / carry — manager persona (not in R3 batch)

| Journey | Requirement | Prior evidence | QC ruling |
|---------|-------------|----------------|-----------|
| **J-MOB-05** | Manager `home-action-tile-approve` → Duyệt đơn → **Thành công** | [`p1-g3-jmob-05-strict-r2-20260609.md`](p1-g3-jmob-05-strict-r2-20260609.md) FAIL @ **EA9BD74F** nv0002 | **CARRY OPEN** — **do not promote**; dispatch **R-W7-MOB-LEAVE-NAV-01-R4** |
| JMAP J-MOB-05 row (MOB-UX-03 typography) | Typography regate only | [`qc-mob-ux-03-global-20260609.md`](qc-mob-ux-03-global-20260609.md) | **Superseded for approve-tile nav** by strict R2 FAIL on same artifact |

---

## Defect / condition adjudication

| ID | Severity | Class | Prior state | QC ruling |
|----|----------|-------|-------------|-----------|
| **ADD23308** / blank leave nv0001 | P0 | PRODUCT | OPEN R2/R3 pre-fix | **CLOSED** — J-MOB-25/11 PASS @ EA9BD74F |
| **G4 CheckIn FAB** on leaf | P2 UX | PRODUCT | CARRY G4 gate | **CLOSED** — `final2-checkin.xml` PASS |
| **MOB-UX-15d** raw `check_in_out` | P1 UX | PRODUCT | CARRY partner gate | **CLOSED** — `final3-notif.xml` PASS |
| **J-MOB-16** directory regression | P1 | DEVICE | PASS R2, reaffirm R3 | **CLOSED** — `final-j16-directory.xml` PASS |
| **R-JMOB05-NAV-BLANK-R2** | P0 | PRODUCT | OPEN strict R2 | **CARRY OPEN** — nv0002 approve tile blank 2822 B @ EA9BD74F |
| **R-W7-MOB-LEAVE-NAV-01-R4** | P0 | PRODUCT | DISPATCHED per PHASE1_CLOSURE | **CARRY** — owner `dev-mobile` → `qa-device` retest |
| **C-W7QC-PACK-01** | Process | Format | OPEN | **CARRY** — upstream QA missing `## Residual` (1/8 verify) |

---

## Journey map sync (recommended — PM)

PM should update `PROGRAM_JOURNEY_MAP.md`:
- **J-MOB-25** — cite this QC + `r3-leave-list.xml`; ADD23308 **CLOSED** @ EA9BD74F
- **J-MOB-11** sick attachment slice — cite this QC
- **J-MOB-16** (W7-5) — cite this QC; `home-action-tile-team` nav note
- **G4 carry** — cite this QC; CheckIn FAB **CLOSED**
- **MOB-UX-15d** — cite this QC
- **J-MOB-05** — add footnote: strict R2 **FAIL** approve tile @ EA9BD74F supersedes typography-only PASS until R4 closes

---

## Verdict summary

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS (reduced)** | **W7 mobile batch R3 promotable** nip.io emulator @ APK **EA9BD74F** (nv0001 ESS) |
| **GO (scoped)** | **J-MOB-25, J-MOB-11, J-MOB-16, G4 carry, MOB-UX-15d** device **CLOSED** R3 |
| **CARRY** | **J-MOB-05** manager approve tile (`R-W7-MOB-LEAVE-NAV-01-R4` / `R-JMOB05-NAV-BLANK-R2`) |
| | **NOT Phase 1 DONE** / **NOT PROD** / **NOT** manager-partner slice ready |

---

## Residual (program — outside R3 nv0001 batch)

| ID | Owner | Trigger |
|----|-------|---------|
| **R-W7-MOB-LEAVE-NAV-01-R4** | dev-mobile → qa-device | `uat.nv0002` `home-action-tile-approve` → ManagerApprovals ≥30k XML; re-run P1-G3-JMOB-05-STRICT-R2 |
| **R-JMOB05-NAV-BLANK-R2** | dev-mobile | Same APK EA9BD74F; blank 2822 B on approve tile |
| **C-W7QC-PACK-01** | qa-device | Add `## Residual` to device QA packs for verify 8/8 |
| **D-W8-ESS-PROMISE-01** | dev-mobile | Unrelated program carry — expiry 2026-06-14 |

---

## Handoff

**completion_report:** PCOMP-W7-MOB-BATCH-QC-R3 **GO WITH CONDITIONS (reduced)**. Audited QA R3 final chain on APK **EA9BD74F** @ nip.io emulator. Upstream pack verify **1/8** process-only (`residual_section`). XML spot-audit confirms **J-MOB-25/11/16 + G4 carry + MOB-UX-15d PASS** on nv0001. ADD23308 blank-leave regression **CLOSED**. **J-MOB-05 manager approve tile CARRY OPEN** — strict R2 FAIL on same APK nv0002 not superseded by this batch. **NOT Phase 1 DONE** / **NOT PROD**.

**next_owner:** `pm`

**next_dispatch_prompt:**

```
work_item_id: PCOMP-W7-MOB-BATCH-QC-R3-INTAKE
from_role: qc
to_role: pm
lane: governance
ack_status: PASS_TO_PM
summary: W7 mobile batch R3 QC GO WITH CONDITIONS (reduced) — J-MOB-25/11/16 + G4 carry + MOB-UX-15d CLOSED @ APK EA9BD74F nv0001; J-MOB-05 approve tile CARRY OPEN (strict R2 FAIL nv0002 same APK)
evidence_path: docs/qa/evidence/qc-pcomp-w7-mob-batch-20260609.md
action: PM intake — (1) promote J-MOB-25/11/16 + G4 + MOB-UX-15d rows in PROGRAM_JOURNEY_MAP.md with this QC cite; (2) dispatch dev-mobile R-W7-MOB-LEAVE-NAV-01-R4 for J-MOB-05 manager approve tile (P0, do not claim J-MOB-05 closed); (3) update PHASE1_PRODUCT_COMPLETION_TODO / TEAM_WORKING_NOW; (4) NOT Phase 1 DONE claim
pm_dispatch_hint: dev-mobile — R-W7-MOB-LEAVE-NAV-01-R4 manager approve tile blank nv0002 on EA9BD74F APK
```

**evidence_path:** `docs/qa/evidence/qc-pcomp-w7-mob-batch-20260609.md`

**ack_status:** `PASS_TO_PM`
