# PO-HRM-UI-BRAND-W4-MOB-A-QC-01 — W4 mobile brand device gate (observe-only)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-05 |
| **mode** | **Observe-only** — no device re-run; audit QA R2 + APK SoT + L1 |
| **decision** | **GO WITH CONDITIONS** — **not** full GO (SHA + login + MOB-04/04b open) |
| **ack_status** | **PASS_TO_PM** |

## Honesty locks (mandatory — QC enforced)

| Flag | Required | QC observed in evidence chain |
|------|----------|-------------------------------|
| **face_live** | false | **false** — no LIVE claim; L1 vitest + R2 honesty block |
| **remaster_program_done** | false | **false** |
| **product_go** | false | **false** |
| **attendance_closed** | false | **false** — check-in UI + submit present; mutate not closed |

**Forbidden claims (this gate):** Face LIVE · remaster program DONE · product GO · Attendance CLOSED — **none present** in upstream QA; QC does **not** grant them.

---

## Scope (bounded)

| In scope | Out of scope |
|----------|--------------|
| W4-MOB-A **J-MOB-01 / J-MOB-02** device chrome (home bar, stats bar, FAB sheet) | Phase 1 DONE / `verify:product:completion` |
| MOB-01 login card chrome on cold start | PROD cutover / store release |
| MOB-04 / MOB-04b **promotion** adjudication | Web portal W4 matrix |
| APK lineage vs dev-mobile SoT | Re-running adb on QC seat |

**Upstream chain:**

| Stage | Evidence | QA verdict |
|-------|----------|------------|
| L1 contract | [`po-hrm-ui-brand-w4-mob-a-qa-01.md`](po-hrm-ui-brand-w4-mob-a-qa-01.md) | PASS_TO_PM GWC — Vitest **20/20**, J-MOB defer device |
| APK build | [`po-hrm-ui-brand-w4-mob-a-apk-01.md`](po-hrm-ui-brand-w4-mob-a-apk-01.md) | READY_FOR_QA — **SoT SHA** below |
| Device R2 | [`po-hrm-ui-brand-w4-mob-a-qa-01-r2.md`](po-hrm-ui-brand-w4-mob-a-qa-01-r2.md) | PASS_TO_PM GWC — J-MOB chrome on emulator |

---

## APK lineage audit (C-SHA-SOT)

| Field | Dev-mobile SoT (`apk-01`) | QA R2 **installed / tested** | QC ruling |
|-------|---------------------------|------------------------------|-----------|
| **sha256** | `EB65FD6FF658FA2575DDFB7299347CDC2DE4985A2AE5FFDA1CEC5ED78DF5D066` | `0568F584B627B349867A99600D65F1F417CAA2F04A5BF9762E4BF11468176378` | **MISMATCH — CONDITION** |
| **size_bytes** | `71614240` | `71614246` (+6 B) | Supports stale/different artifact |
| **git (build)** | `dc930c5323e240bd77dc6371da834821c312c858` | Not re-stamped on device APK | R2 does not prove SoT bundle |
| **path** | `…/dist/hrm-mobile-qa-device.apk` | Same path string in R2 ENV | Path alone ≠ SHA parity |

**QC adjudication:** Device evidence is **auditable for chrome** but **not bound to current SoT APK**. W4 chrome promotion for release narrative **requires R3 on SoT SHA** (`EB65FD6F…`, **71614240**). **Not NO-GO** for bounded “chrome seen on *an* qa-device build” — **GWC with C-SHA-SOT**.

---

## L-layer audit (observe-only)

| Layer | Source | QC |
|-------|--------|-----|
| **L0** | R2 `pnpm run qc:fe-be-health` exit **0** | **Accept** — stack health cited |
| **L1** | L1 Vitest 20/20 + MOB contract trace | **Accept** — baseline for MOB-04b logic |
| **L2.5 J-MOB** | R2 device run4 + screenshots/XML | **GWC bound** — see journey table |

U65: no seed in R2/L1 chain — **Accept**.

---

## Journey audit — J-MOB-01 / J-MOB-02 (chrome GWC bound)

| Journey / slice | QA R2 | QC verdict | Bound |
|-----------------|-------|------------|-------|
| **J-MOB-01** — Home top bar + stats 4px bar | **PASS** (`home-brand.xml`, screenshots) | **ACCEPT — PROMOTED (chrome only)** | Subject to **C-SHA-SOT** re-proof on SoT APK |
| **J-MOB-01** — Login → Home **UF** | **PARTIAL** — `qa-login` deep link | **GWC — NOT PROMOTED** | **C-LOGIN-DEEPLINK** |
| **J-MOB-02** — FAB → sheet chrome | **PASS** (`fab-primary-action-sheet`) | **ACCEPT — PROMOTED (chrome only)** | **C-SHA-SOT** |
| **J-MOB-02** — Sheet → check-in entry | **PASS** (Chấm công stack) | **ACCEPT — PROMOTED (nav only)** | MOB-04 mutate separate |
| **MOB-01** login card | **PASS** cold start | **ACCEPT — PROMOTED** | Chrome only |

**Reject (full journey GO):** Treating J-MOB-01 as **closed** end-to-end UF — **rejected** until FE-only login or explicit waiver.

**Accept (bounded):** Home + FAB **Precision Motion chrome** on device with testIDs + artifacts in `docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r2/` — **consistent with L1 contract**.

---

## Conditions register (must close for full GO)

| ID | Condition | Owner | Exit criteria | Expiry / trigger |
|----|-----------|-------|---------------|------------------|
| **C-SHA-SOT** | R2 ≠ dev SoT SHA/size | `qa-device` | Install APK with SHA `EB65FD6F…` · **71614240** B; log `adb` install + `sha256sum`/PowerShell hash in R3 evidence | Before any “W4 mobile UAT-ready” PM statement |
| **C-LOGIN-DEEPLINK** | Session via `xevn://qa-login` not U65-equivalent FE login | `qa-device` | `uat.nv0001@xe.vn` login through app UI → Home without qa-login; screenshot + XML **or** PM waiver with sponsor ack | R3 or documented waiver |
| **C-MOB-04** | GPS POST **2xx** not in logcat | `qa-device` | POST `/attendance/records` **2xx** via OkHttp logcat, Charles, or proxy; persona `uat.nv0001@xe.vn`; no seed | Same SoT APK seat |
| **C-MOB-04b** | `face-mvp-honesty-banner` not device-promoted | `qa-device` | On check-in: tap Face MVP → banner visible + `check-in-submit` disabled in UI dump/screenshot | Same SoT APK seat; L1 vitest **not** substitute for device promotion |

**Residual carry (informational):** Emulator cold-boot ANR (R2) — DevOps if blocks R3; not product NO-GO for this chrome gate.

---

## MOB matrix — QC promotion summary

| ID | L1 (`qa-01`) | R2 device | QC promoted? |
|----|--------------|-----------|--------------|
| MOB-01 | PASS contract | PASS | **Yes (chrome)** |
| MOB-03 / J-MOB-01 bars | PASS contract | PASS | **Yes (chrome)** — GWC SHA |
| MOB-05 / J-MOB-02 FAB | PASS contract | PASS | **Yes (chrome)** — GWC SHA |
| MOB-04 | PASS contract | PARTIAL | **No** — **C-MOB-04** |
| MOB-04b | PASS contract | PARTIAL (L1 only on device) | **No** — **C-MOB-04b** |
| Vitest W4 | 20/20 | N/A | **Reaffirmed** |

---

## Classification

| Signal | Type | QC |
|--------|------|-----|
| Chrome testIDs in uiautomator dumps | PRODUCT / W4 | **PASS within GWC** |
| SHA ≠ apk-01 SoT | PROCESS / lineage | **CONDITION — blocks full GO** |
| qa-login session | PROCESS / U65 alignment | **CONDITION** |
| Missing attendance POST proof | PRODUCT / mutate | **CONDITION** |
| Missing Face banner device shot | PRODUCT / honesty UX | **CONDITION** |
| Honesty flags false | Governance | **PASS** |

**Product NO-GO avoided:** No FAIL rows on in-scope **chrome**; gaps are **explicit conditions**, not silent PASS.

---

## QC decision

| Gate | Status |
|------|--------|
| W4 mobile brand **device chrome** (J-MOB-01/02 subset) | **GO WITH CONDITIONS** |
| Full mobile UF / Attendance mutate / SoT APK | **NOT GO** until C-* closed |
| **Full GO** | **Denied** (OBS-SHA + open C-LOGIN / C-MOB-04 / C-MOB-04b) |

---

## completion_report

Observed-only audit of `po-hrm-ui-brand-w4-mob-a-qa-01-r2.md` against L1 and `po-hrm-ui-brand-w4-mob-a-apk-01.md`. **Accepted** bounded promotion of **J-MOB-01/02 chrome** (home + FAB) with screenshot/XML trace. **Rejected** full J-MOB-01 UF closure and MOB-04/04b device promotion. **Stamped C-SHA-SOT** because R2 SHA `0568F584…` ≠ SoT `EB65FD6F…`. Honesty locks held; forbidden claims not granted.

**Open for PM:** Dispatch **R3** on SoT APK; do not claim product GO or remaster DONE.

---

## next_owner

`pm` → `qa-device` (**PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R3**)

---

## next_dispatch_prompt (R3 — SoT SHA)

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R3
from_role: pm
to_role: qa-device
priority: P1
entry_criteria: po-hrm-ui-brand-w4-mob-a-qc-01.md GWC; dev-mobile SoT po-hrm-ui-brand-w4-mob-a-apk-01.md
apk_path: C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk
sha256_required: EB65FD6FF658FA2575DDFB7299347CDC2DE4985A2AE5FFDA1CEC5ED78DF5D066
size_bytes_required: 71614240
git: dc930c5323e240bd77dc6371da834821c312c858
exit_criteria: (1) Install hash matches SoT — log in evidence header; (2) Close C-LOGIN-DEEPLINK: FE login uat.nv0001@xe.vn → Home OR waiver; (3) Close C-MOB-04: POST /attendance/records 2xx proof; (4) Close C-MOB-04b: face-mvp-honesty-banner + disabled check-in-submit on device; (5) Reconfirm J-MOB-01/02 chrome on SoT build; ack PASS_TO_PM or FAIL
read_first: po-hrm-ui-brand-w4-mob-a-qa-01-r2.md · po-hrm-ui-brand-w4-mob-a-qc-01.md · po-hrm-ui-brand-w4-mob-a-apk-01.md
cấm: seed · face_live · remaster_program_done · attendance_closed · product_go
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r3.md
U65: prefer app UI login; qa-login only if documented fallback with reason
```

---

**ack_status:** `PASS_TO_PM`
