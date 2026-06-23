# PCOMP-W8-MOB-RESIDUAL-R4-01-QC — W8 mobile residual R4 device gate @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W8-MOB-RESIDUAL-R4-01-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **decision** | **GO WITH CONDITIONS (reduced)** — W8 mobile residual R4 wave **promotable** nip.io emulator; **MOB-UX-07 balance GWC lifted**; **J-AVT-02 device CLOSED** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — W8 residual R4 @ nip.io emulator)

| In scope | Out of scope |
|----------|--------------|
| **J-MOB-25/28** balance numeric bind (**D-W8-MOB-BAL-UI-01** close) | Phase 1 DONE / `verify:product:completion` program exit |
| **J-AVT-02** avatar upload + display E2E | PROD cutover / store release |
| **J-MOB-09** hub regression on unified APK | Web portal J-HRM-* browser |
| **MOB-UX-07** leave slice GWC uplift (prior R3 QC) | MOB-UX-08+ / ZenHR FAB backlog |
| Account `uat.nv0001@xe.vn` / `xevn-uat-2026` | Physical device matrix beyond emulator-5554 |

**Upstream chain:**

| Stage | Evidence | Verdict |
|-------|----------|---------|
| Prior MOB-UX-07 QC | [`qc-pcomp-w8-mob-ess-leave-01-r3-20260609.md`](qc-pcomp-w8-mob-ess-leave-01-r3-20260609.md) | GWC — **D-W8-MOB-BAL-UI-01 OPEN** |
| QA-device R4 | [`pcomp-w8-mob-residual-r4-01-20260609.md`](pcomp-w8-mob-residual-r4-01-20260609.md) | PASS_TO_PM — unified APK + 4 journeys |
| Machine JSON | [`pcomp-w8-mob-residual-r4-01-20260609.json`](pcomp-w8-mob-residual-r4-01-20260609.json) | `pass: true`, journeys 25/28/09/AVT-02 PASS |
| UI dumps | `pcomp-w8-mob-residual-r4-01-screens/` (18 XML) | QC spot-audit |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-w8-mob-residual-r4-01-20260609.md
# exit 1 — 3/8 checks (2026-06-09 QC audit)
# FAIL: command_table, portal_url, residual_section
```

**QC adjudication:** **PROCESS NOTE — not product NO-GO.** Failures are **format / slice-appropriate** for mobile device pack (same class as MOB-UX-07 R3 QC **2/8**):

| Failed check | QC ruling |
|--------------|-----------|
| `command_table` | **Format** — adb/node scripts documented; missing normalized `pnpm run` + exit-code table |
| `portal_url` | **N/A W8 mobile** — `api_base` nip.io documented; no web portal probe in device slice |
| `residual_section` | **Format** — handoff lists closed items; no `## Residual` heading in QA pack |

Material pack present: journey matrix, API probe table, JSON booleans, 18 XML dumps, logcat audit, valid handoff — **auditable**.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| Unified APK SHA `075DB8E4…` (71,783,351 B) | ENV / artifact | **PASS** — not balance-only `6001D4D0…` |
| Cold boot + `pm clear` + install | ENV / L2.5 | **PASS** |
| Deep-link login `home_reached: true` | ENV / L2.5 | **PASS** |
| `GET /attendance/leave-balance` **200** `available=8` `used=3` | API / PRODUCT | **PASS** — nip.io holding slug |
| **J-MOB-25** header Còn lại **8** / Đã dùng **3** | PRODUCT / L2.5 | **PASS** — `r4-leaves-list.xml`; no `—`, no `Resource not found` |
| **J-MOB-28** create step 2 chip **Còn lại · 8 ngày** | PRODUCT / L2.5 | **PASS** — `r4-create-step2.xml`; not HR fallback |
| **J-AVT-02** picker → crop → success → `avatar_url` persist | PRODUCT / L2.5 | **PASS** — `r4-picker.xml`, `r4-profile-after.xml` **Đã cập nhật ảnh đại diện**; no HRM-FILE-409 |
| **J-MOB-09** **Nghỉ hôm nay** hub regression | PRODUCT / L2.5 | **PASS** — `r4-home.xml`, `r4-supp-home-final.xml` |
| Automation script false-negative J-MOB-28/J-AVT-02 | Automation | **INFO** — split text nodes + success dialog overlay; manual XML supersedes |
| Logcat `HRM-FILE-409` / `x-company-id: main` / FATAL | PRODUCT / scope | **PASS** — all absent |

**Product NO-GO avoided:** All four in-scope journeys device-verified with XML corroboration; prior balance GWC defect **closed**.

---

## L2.5 — Journey audit (device @ nip.io emulator)

### Primary — residual R4 wave

| Journey | Requirement | QA R4 | XML / JSON | QC verdict |
|---------|-------------|-------|------------|------------|
| **J-MOB-25** | Kỳ nghỉ + Còn lại/Đã dùng numeric from API | PASS | `r4-leaves-list.xml` — **8** / **3** | **PASS** — **D-W8-MOB-BAL-UI-01 CLOSED** |
| **J-MOB-28** | Create step 2 «Còn lại: X ngày» chip | PASS | `r4-create-step2.xml` — `Còn lại` + `8 ngày` | **PASS** — **D-W8-MOB-BAL-UI-01 CLOSED** |
| **J-AVT-02** | Native picker + upload + display E2E holding slug | PASS | `r4-picker.xml`, `r4-profile-after.xml`, API `avatar_url` | **PASS** — **device CLOSED** |
| **J-MOB-09** | Home whos_out hub regression | PASS | `r4-home.xml`, `r4-supp-home-final.xml` | **PASS** — reaffirmed on unified APK |

### MOB-UX-07 uplift (prior R3 QC chain)

| Journey | Prior R3 QC | R4 QC ruling |
|---------|-------------|--------------|
| **J-MOB-23..29** | GWC — balance bind open on 25/28 | **GO (scoped)** — **7/7 device CLOSED**; balance GWC **lifted** |
| **J-MOB-06..08** | PASS reaffirmed R3 | **PASS** — unchanged; not re-walked R4 (regression scope J-MOB-09 only) |

---

## Defect / condition adjudication

| ID | Severity | Class | Prior state | QC ruling |
|----|----------|-------|-------------|-----------|
| **D-W8-MOB-BAL-UI-01** | P1 UX | PRODUCT | GWC OPEN (R3 QC) | **CLOSED** — J-MOB-25/28 numeric 8/3 on nip.io unified APK |
| **C-W4QC-AVT-MOB-01** | P1 | PRODUCT | OPEN — picker absence | **CLOSED** — `media.module` picker + full upload E2E R4 |
| **C-W4QC-AVT-MOB-02** | P2 | PRODUCT | CARRY — upload/display E2E | **CLOSED** — picker→crop→PATCH→`avatar_url` device PASS |
| **C-W7QC-DEVICE-01** J-MOB-09 slice | P1 | DEVICE | CLOSED R3-05 | **REAFFIRMED CLOSED** — R4 regression PASS |
| **C-W7QC-DEVICE-01** J-AVT slice | P1 | DEVICE | OPEN since R3-05 | **CLOSED** — J-AVT-02 full device PASS R4 |
| **C-W7QC-DEVICE-01** (umbrella) | P1 | DEVICE | Partial close | **CLOSED** — both J-MOB-09 + J-AVT slices device PASS |
| **D-W8-ESS-PROMISE-01** | P1 UX | PRODUCT | OPEN | **CARRY** — unrelated promise snackbar/font; expiry 2026-06-14 |
| **C-W8QC-PACK-02** | Process | Format | OPEN | **CARRY** — add `pnpm run` exit-code table to device packs |

---

## Journey map sync (executed)

`PROGRAM_JOURNEY_MAP.md` updated:
- **J-MOB-23..29** — cite this QC file; **D-W8-MOB-BAL-UI-01 CLOSED**
- **J-AVT-02** — cite this QC file; **C-W4QC-AVT-MOB-01** + **C-W4QC-AVT-MOB-02 CLOSED**

---

## Verdict summary

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS (reduced)** | **W8 mobile residual R4 wave promotable** nip.io emulator |
| **GO (scoped)** | **MOB-UX-07** leave UX **full device CLOSED** (balance GWC lifted) |
| | **J-MOB-25,28** balance numeric **CLOSED** |
| | **J-AVT-02** upload+display **device CLOSED** |
| | **C-W4QC-AVT-MOB-01/02** + **C-W7QC-DEVICE-01** umbrella **CLOSED** |
| | **J-MOB-09** hub regression **reaffirmed PASS** |
| **CARRY** | **D-W8-ESS-PROMISE-01**, **C-W8QC-PACK-02**, MOB-UX-08+/ZenHR FAB |
| | **NOT Phase 1 DONE** / **NOT PROD** / **NOT** W8 program full exit |

---

## Residual (program — outside R4 wave)

| ID | Owner | Trigger |
|----|-------|---------|
| **D-W8-ESS-PROMISE-01** | dev-mobile | MOB-UX-06 promise snackbar/font — expiry 2026-06-14 |
| **C-W8QC-PACK-02** | qa-device | Next mobile wave — normalized command table in device packs |
| **MOB-UX-08+** | pm → dev-mobile | J-MOB-30 team directory + ZenHR FAB per backlog |

---

## Handoff

**completion_report:** PCOMP-W8-MOB-RESIDUAL-R4-01-QC **GO WITH CONDITIONS (reduced)**. Audited R4 device chain post MOB-UX-07 R3 GWC. Pack verify **3/8** process-only. XML spot-audit confirms J-MOB-25/28 numeric **8/3**, J-AVT-02 full E2E, J-MOB-09 hub regression. **D-W8-MOB-BAL-UI-01 CLOSED**. **C-W4QC-AVT-MOB-01/02 CLOSED**. **C-W7QC-DEVICE-01 umbrella CLOSED**. MOB-UX-07 uplifted to **GO (scoped)**. Program carries D-W8-ESS-PROMISE-01 + pack format only.

**next_owner:** `pm`

**next_dispatch_prompt:**

```
work_item_id: PCOMP-W8-MOB-RESIDUAL-R4-01-INTAKE
from_role: qc
to_role: pm
lane: governance
ack_status: PASS_TO_PM
summary: W8 mobile residual R4 QC GO WITH CONDITIONS (reduced) — D-W8-MOB-BAL-UI-01 CLOSED; J-AVT-02 device CLOSED; C-W4QC-AVT-MOB-01/02 + C-W7QC-DEVICE-01 umbrella CLOSED; MOB-UX-07 uplift GO (scoped)
evidence_path: docs/qa/evidence/qc-pcomp-w8-mob-residual-r4-01-20260609.md
action: PM intake — (1) update PHASE1_PRODUCT_COMPLETION_TODO / TEAM_WORKING_NOW for closed conditions; (2) dispatch dev-mobile `D-W8-ESS-PROMISE-01` if expiry 2026-06-14 approaching OR backlog `PCOMP-W8-MOB-ZENHR-FAB-01` MOB-UX-10b per sprint priority; (3) no dev-mobile dispatch for balance/avatar unless sponsor requests MOB-UX-08+; (4) NOT Phase 1 DONE claim
pm_dispatch_hint: dev-mobile — D-W8-ESS-PROMISE-01 promise snackbar OR qa-device — C-W8QC-PACK-02 format fix on next mobile wave
```

**evidence_path:** `docs/qa/evidence/qc-pcomp-w8-mob-residual-r4-01-20260609.md`

**ack_status:** `PASS_TO_PM`
