# MOB-UX-12-FREEZE-QC — Unified SET G secondary screen polish gate (canonical APK)

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-12-FREEZE-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **decision** | **GO WITH CONDITIONS (reduced)** — **MOB-UX-12 SET G G-1..G-4** sponsor polish class **device promotable** @ nip.io `emulator-5554` on **canonical frozen APK** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — MOB-UX-12-PROGRAM / SET G)

| In scope | Out of scope |
|----------|--------------|
| Unified qa-device APK SHA `B8F73859…F3EA` (MOB-UX-12-APK-FREEZE) | Phase 1 DONE / `verify:product:completion` program exit |
| SET **G-1** `TeamColleagueDetailScreen` (MOB-UX-12a) | SET **G-5** `PayslipDetail` / `CreateLeaveRequest` (MOB-UX-12e) |
| SET **G-2** `TeamDirectoryScreen` rich rows (MOB-UX-12b) | PROD cutover / store release |
| SET **G-3** `ProfileScreen` F-3 hero / grid / quick actions / docs (MOB-UX-12c) | Web portal J-HRM-* |
| SET **G-4 partial** ManagerApprovals + LeaveRequestsList (MOB-UX-12d exercised) | G-4 **Contracts** + **Operations** device L2.5 (deferred) |
| Journeys J-MOB-30 ext, J-MOB-17 ext, J-MOB-23..28 on frozen artifact | Physical device matrix beyond `emulator-5554` |

**Upstream chain:**

| Stage | Evidence | Verdict |
|-------|----------|---------|
| Dev-mobile freeze | [`mob-ux-12-apk-freeze-20260609.md`](mob-ux-12-apk-freeze-20260609.md) | READY_FOR_QA — vitest **295/295**; canonical SHA pin |
| QA-device freeze | [`mob-ux-12-freeze-qa-20260609.md`](mob-ux-12-freeze-qa-20260609.md) | PASS_TO_PM — SET G 12a/12b/12c/12d @ frozen SHA |
| Per-wave QC G-1 | [`qc-mob-ux-12a-20260609.md`](qc-mob-ux-12a-20260609.md) | GO GWC — superseded **on artifact** by freeze pin (same code, unified SHA) |
| Per-wave QA 12b/12c/12d | [`mob-ux-12b-qa-20260609.md`](mob-ux-12b-qa-20260609.md), [`mob-ux-12c-qa-20260609.md`](mob-ux-12c-qa-20260609.md), [`mob-ux-12d-qa-20260609.md`](mob-ux-12d-qa-20260609.md) | FAIL_TO_PM SHA drift / partial G-4 — **resolved or bounded** by freeze QA |
| Spec | [`MOBILE_ESS_SECONDARY_SCREEN_POLISH.md`](../../program/MOBILE_ESS_SECONDARY_SCREEN_POLISH.md) SET G-1..G-4 | Delta aligned |

**Canonical APK (PIN — verified QC spot):**

| Field | Value |
|-------|-------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Size | **68,938,359** B |
| SHA-256 | **`B8F738596F9D11AFFFE9BD3AE1F92A6E759BE844717B5D617D026DB5D297F3EA`** |
| QC `Get-FileHash` | **MATCH** (2026-06-09) |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/mob-ux-12-freeze-qa-20260609.md
# exit 1 — 6/8 checks (work_item_id + ack_status table format vs colon style)
```

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-mob-ux-12-freeze-20260609.md
# exit 0 — 8/8 checks (QC audit file)
```

**QC adjudication:** **PASS (process GWC on upstream QA pack)** — upstream QA freeze pack **6/8**; missing only verifier token format for `work_item_id:` / `ack_status:` (content present in table). Product audit proceeds; QA should normalize format on next mobile pack. **QC file 8/8.**

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| Canonical SHA `B8F73859…` pin + dist match | ENV / lineage | **PASS — CLOSED** — supersedes per-wave SHA drift (12a/12b/12c/12d) |
| nip.io `https://14-225-217-232.nip.io` + `emulator-5554` | ENV | **PASS** |
| Deep-link login `uat.nv0001` / `uat.nv0002` | ENV / L2.5 | **PASS** |
| `fatal_logcat: true` on smoke script | ENV | **GWC carry** — non-blocking; `home_reached: true` |
| uiautomator marathon exit 137 / flake | ENV / automation | **GWC carry** — targeted XML captures used |
| G-1 hero + no `DRIVER`/`active` on exercised row | PRODUCT / UX | **PASS — PROMOTED** — `freeze-12a-detail.xml`, `12a-r2-detail.xml` |
| G-2 SectionList + rich rows + «Lái xe» | PRODUCT / UX | **PASS — PROMOTED** — `on-__i_nh_m.xml` `team-directory-section` |
| G-3 profile metric grid + tabs + doc cards | PRODUCT / UX | **PASS — PROMOTED** — `freeze-12c-work.xml`, `freeze-12c-docs.xml` |
| G-4 mgr approvals + leave balance/tabs | PRODUCT / UX | **PASS — PROMOTED** — `finish-approvals.xml`, `finish-leaves.xml`, `freeze-12d-leaves.xml` |
| G-4 Contracts + Operations screens | PRODUCT | **NOT promoted** — MOB-UX-12d-QA residual; nip.io contracts API 500 |
| English `job_title_key` on some directory rows | PRODUCT / polish | **GWC carry** — not sponsor `DRIVER`/`active` class |
| SET G-5 payslip / create leave polish | PRODUCT | **NOT in scope** — MOB-UX-12e backlog |

**Product NO-GO avoided:** Sponsor screenshot anti-patterns eliminated on exercised SET G slices; frozen artifact regression not observed vs per-wave PASS slices.

---

## L2.5 — Journey audit (device @ nip.io, frozen APK)

### SET G unified (MOB-UX-12-FREEZE)

| Slice | Journey / AC | QA | QC verdict | Evidence |
|-------|--------------|-----|------------|----------|
| G-1 | **J-MOB-30 ext** detail hero + sections + back | PASS | **PASS — PROMOTED** | `freeze-12a-detail.xml`, `12a-r2-detail-scrolled.xml` |
| G-1 | No raw `DRIVER` / `active` | PASS | **PASS — PROMOTED** | «Lái xe» / «Đang làm việc» |
| G-2 | **J-MOB-30** directory rich rows + search | PASS | **PASS — PROMOTED** | `on-__i_nh_m.xml` |
| G-3 | **J-MOB-17 ext** tabs + metric grid + quick actions | PASS | **PASS — PROMOTED** | `freeze-12c-work.xml` |
| G-3 | **J-AVT-02** avatar hero (reaffirmed) | PASS | **PASS — reaffirmed** | cross-ref MOB-UX-12c-QA |
| G-4 | **J-MOB-23** mgr approvals elevated + Lottie empty | PASS | **PASS — PROMOTED** | `finish-approvals.xml` |
| G-4 | **J-MOB-25** leave balance header 8/3 | PASS | **PASS — PROMOTED** | `finish-leaves.xml`, `freeze-12d-leaves.xml` |
| G-4 | **J-MOB-26** leave tabs Đang xét / Đã duyệt | PASS | **PASS — PROMOTED** | `freeze-12d-leaves.xml` |
| G-4 | **J-MOB-24/27/28** (modal, empty CTA, create chip) | PASS | **PASS — reaffirmed** | MOB-UX-12d-QA @ same frozen SHA |

### Not promoted / deferred

| Item | QC verdict | Rationale |
|------|------------|-----------|
| **G-4 Contracts** device L2.5 | **DEFERRED** | Carousel nav + API 500 `HRM-SYS-001` — `mob-ux-12d-qa-20260609.md` |
| **G-4 Operations** device L2.5 | **DEFERRED** | Settings→Vận hành not reached on device |
| **G-5** MOB-UX-12e | **NOT in freeze scope** | Separate wave per polish program |
| Phase 1 / PROD | **NOT claimed** | Program gates open |

---

## Residual / conditions

| ID | Item | Severity | QC disposition |
|----|------|----------|----------------|
| **GWC-PACK-FREEZE-01** | Upstream QA pack 6/8 (`work_item_id`/`ack_status` format) | PROCESS | **Accept** — normalize on next QA mobile pack |
| **GWC-G4-CONTRACTS-01** | Contracts + Operations device L2.5 not verified | P1 | **Carry** — dispatch `dev-be` contracts API 500 + `qa-device` carousel nav |
| **GWC-G5-12E-01** | SET G-5 payslip/create leave polish open | INFO | **Accept** — MOB-UX-12e backlog |
| **GWC-TITLEKEY-12B-01** | Some rows show English job keys (CEO, LEGAL SPECIALIST) | INFO | **Accept** — not sponsor DRIVER/active class |
| **GWC-UIAUTO-FREEZE-01** | `tmp-mob-ux-12-freeze-qa.mjs` exit 137 on marathon | INFO | **Accept** — freeze-session XML sufficient |
| **GWC-LOGCAT-01** | `fatal_logcat` on login-intent smoke | INFO | **Accept** — known font/push class |
| **C-W8-DEVICE-01** | Gradle MAX_PATH / unified release APK pipeline | GWC **carry** | qa-device APK functional @ frozen SHA |

---

## Decision summary

| Verdict | **GO WITH CONDITIONS (reduced)** |
|---------|----------------------------------|
| **Promotable** | **MOB-UX-12 SET G G-1..G-4 (partial)** on canonical APK `B8F73859…F3EA` @ nip.io `emulator-5554` |
| **SHA lineage** | **CLOSED** — single frozen artifact; no further dev-mobile rebuild until next PM wave |
| **Journeys** | **J-MOB-30 ext**, **J-MOB-17 ext**, **J-MOB-23..28** (mgr+leave) **device CLOSED** on frozen artifact |
| **Deferred** | G-4 Contracts/Operations L2.5; G-5 MOB-UX-12e |
| **Blockers** | None P0 product on exercised slices |
| **Program** | **NOT Phase 1 DONE** · **NOT PROD-READY** |

---

## Handoff

- **completion_report:** MOB-UX-12-FREEZE-QC **GO WITH CONDITIONS (reduced)**. Unified SET G G-1..G-4 promotable on canonical frozen APK SHA `B8F73859…F3EA`; QC spot SHA match + XML audit confirms hero/directory/profile/mgr-leave polish. Supersedes per-wave SHA drift FAILs. Residual: Contracts/Operations G-4 defer, G-5 12e open, QA pack format 6/8. **NOT** Phase 1 DONE.
- **next_owner:** `pm`
- **next_dispatch_prompt:** PM intake MOB-UX-12-FREEZE-QC PASS_TO_PM → (1) update `PROGRAM_JOURNEY_MAP.md` J-MOB-30 ext + J-MOB-17 ext lines with SET G polish cite `qc-mob-ux-12-freeze-20260609.md` + frozen SHA pin; (2) dispatch `dev-be` MOB-UX-12d-CONTRACTS-API fix nip.io `GET /contracts-insurance/contracts` 500 + `qa-device` G-4 Contracts/Operations L2.5 retest on **same** frozen SHA; (3) optional `dev-mobile` MOB-UX-12e SET G-5 when PM prioritizes; pin SHA on bus — **no rebuild** until next explicit wave.
- **evidence_path:** `docs/qa/evidence/qc-mob-ux-12-freeze-20260609.md`
- **ack_status:** `PASS_TO_PM`
