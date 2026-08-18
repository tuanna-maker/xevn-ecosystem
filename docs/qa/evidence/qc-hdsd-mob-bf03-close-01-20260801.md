# QC Close — HDSD BF-03 mobile depth (`QC-HDSD-MOB-BF03-CLOSE-01`)

| Field | Value |
|-------|-------|
| **work_item_id** | `QC-HDSD-MOB-BF03-CLOSE-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · **C-BF03-MOB-DEPTH-01** · Cursor sole |
| **gate_type** | L3 QC — close residual after `QA-HDSD-MOB-BF03-DEPTH-01` |
| **prior_gates** | `qc-hdsd-bf-03-profile-close-01-20260801.md` (MOB residual OPEN) · `qa-hdsd-mob-bf03-depth-01-20260801.md` PASS |
| **auditor** | QC |
| **date** | 2026-08-01 |
| **policy** | U65 zero-seed · device load/nav only · no mutate/seed · no Claude · no false demote 🟢 |
| **device / API** | `emulator-5554` · `http://14.225.217.232:3001` · persona `uat.nv0001@xe.vn` |
| **ack_status** | **PASS_TO_PM** |

## Verdict

**GO** — **C-BF03-MOB-DEPTH-01 CLOSED** (bounded mobile payslip/contracts depth slice):

- **TC-MOB-020 / 021 / 022 / 030** — **4/4 🟢** device depth (PayslipDetail · PayrollSummary · offline recovery · ContractsScreen)
- **J-MOB-04** list→detail (Thực lĩnh) — **🟢 PASS** (runtime `jmob04_spine` + PNG detail · journey map already ✅)
- **Matrix** — header/body **317🟢 · 43🟡 · 0⬜** · MOB-020/021/022/030 all 🟢 · yellow −4 vs prior profile close (47🟡)
- **must_keep** — **TC-MOB-011 / 027 / 028** remain **🟢** (runtime `must_keep_regression_ok: true` · matrix spot · reg PNG) — **0 demote**
- **Evidence pack** QA intake — `verify:qc:evidence-pack` **8/8 PASS**

**NOT in this gate:** Phase 1 DONE · PROD mobile · mutate payslip/contracts · `:8088` · false-promote remaining **43🟡** · Claude lane.

---

## Evidence polled (QA intake)

| Artifact | Pack / audit | QC |
|----------|--------------|-----|
| `qa-hdsd-mob-bf03-depth-01-20260801.md` | **8/8 PASS** | ✅ Product PASS — 4/4 TC · J-MOB-04 · residual honest · U65 |
| `_tmp-qa-hdsd-mob-bf03-depth-01-runtime.json` | — | ✅ 020/021/022/030 `ok:true` · `hasMain:false` · `jmob04_spine: 🟢 PASS` · regression 011/027/028 🟢 · APK SHA `24CDF95F…` |
| `screenshots/qa-hdsd-mob-bf03-depth-01-20260801/` | **16 PNG** | ✅ Spot: detail Thực lĩnh · summary kỳ · offline ERR-NETWORK · contracts PVI |
| `%TEMP%/qa-hdsd-mob-bf03-depth-01-20260801/*.xml` | dumps present | ✅ UI hierarchy captures for retries |
| `HDSD_SRS_TESTCASE_MATRIX.md` Mobile | — | ✅ TC-MOB-011/020/021/022/027/028/030 all **🟢** · summary **317🟢 · 43🟡 · 0⬜** |
| `PROGRAM_JOURNEY_MAP.md` J-MOB-04 | — | ✅ **PASS** (spine reconfirmed this wave) |

---

## Mobile depth audit (TC-020/021/022/030)

| TC | HDSD § | Runtime / matrix | QC spot PNG | QC |
|----|--------|------------------|-------------|-----|
| **TC-MOB-020** | §12.5 PayslipDetail | 🟢 · detailOk · noNet · jmob04 PASS | `tc-mob-020-detail.png` — Chi tiết lương · Thực lĩnh 82.340.000 đ · `x-company-id=holding` | ✅ |
| **TC-MOB-021** | §12.5 PayrollSummary | 🟢 · Settings→Lương · summaryMarkers | `tc-mob-021-summary-retry.png` — Lương · kỳ 05/2026 (UAT-MOB-PILOT) | ✅ |
| **TC-MOB-022** | §12.5 offline/recovery | 🟢 · svc-wifi · recovered | `tc-mob-022-offline.png` — `HRM-MOB-ERR-NETWORK` banner | ✅ |
| **TC-MOB-030** | §12.7 ContractsScreen | 🟢 · Settings→Hợp đồng | `tc-mob-030-contracts-retry.png` — Hợp đồng · PVI active | ✅ |

### L2.5 journey

| Journey | Verdict | Detail |
|---------|---------|--------|
| **J-MOB-04** | **PASS** | PayslipList → tap Thực lĩnh → PayslipDetail · pilot `:3001` · `hasMain: false` · no ERR-NETWORK on detail path |

---

## must_keep regression

| Item | Check | QC |
|------|-------|-----|
| **TC-MOB-011** | matrix 🟢 · runtime `homeOk` · `reg-home.png` | ✅ preserved |
| **TC-MOB-027** | matrix 🟢 · profile-employee-hero · `reg-profile.png` | ✅ preserved |
| **TC-MOB-028** | matrix 🟢 · dynamic-profile-form intact | ✅ preserved |
| **Prior 🟢 rows** | QA: no 🟢→⬜/🟡 · promote only 020/021/022/030 | ✅ **0** false demote |
| **U65 zero-seed** | runtime `u65_zero_seed: true` · load/nav only | ✅ no seed |

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT PASS** | C-BF03-MOB-DEPTH-01 CLOSED · 4/4 TC 🟢 · J-MOB-04 PASS · matrix 317🟢/43🟡 · 0 demote must_keep |
| **PROCESS PASS** | QA evidence pack **8/8** · QC this file targets **8/8** |
| **ENV / TOOLING INFO** | API34 emu blocks `AIRPLANE_MODE` broadcast — QA used `svc wifi` (acceptable offline path) |
| **OUT OF SLICE** | **C-BF03-MUTATE-DEFER-01** · remaining program **43🟡** · R-PROFILE-DENY-01 P3 (prior GWC) |
| **PROGRAM** | NOT Phase 1 DONE · NOT PROD mobile · HOLD_DEPLOY / pilot `:3001` only |

---

## Residual (mandatory audit)

| ID | Item | Sev | Class | Owner | Blocks MOB-DEPTH close? | Trigger |
|----|------|-----|-------|-------|-------------------------|---------|
| ~~**C-BF03-MOB-DEPTH-01**~~ | TC-MOB-020/021/022/030 device depth | P2 | mobile depth | — | **No — CLOSED** | — |
| **R-MOB-HOME-HOPDONG-TILE** | Home quick-grid «Hợp đồng» absent for nv0001; Settings path meets HDSD AC | P3 info | UX density | optional | **No** | Optional home-tile wave |
| **R-MOB-AIRPLANE-EMU** | API34 airplane broadcast blocked; svc-wifi used | P3 info | device tooling | qa-device | **No** | Physical device optional |
| **C-BF03-MUTATE-DEFER-01** | soft-delete/BH dialog defer | P2 | mutate defer | qa | No — out of slice | U65 mutate sub-wave |
| **C-PROGRAM** | NOT Phase 1 / PROD · 43🟡 remain | P0 program | program | PM | No | program gate |

**QC ruling:** **C-BF03-MOB-DEPTH-01 CLOSED**. No product P0/P1. No GWC condition on this residual. No Dev dispatch. No Claude. No false demote 🟢.

---

## Command table (QC audit)

| Command | Exit | Result |
|---------|------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hdsd-mob-bf03-depth-01-20260801.md` | **0** | **PASS** 8/8 |
| Read `_tmp-qa-hdsd-mob-bf03-depth-01-runtime.json` | — | **PASS** — 4 TC 🟢 · J-MOB-04 PASS · must_keep ok · hasMain false |
| Spot matrix TC-MOB-011/020/021/022/027/028/030 | — | **PASS** — all 🟢 · header 317🟢/43🟡 |
| List screenshots dir (16 PNG) | — | **PASS** |
| Spot PNG 020-detail / 021-summary / 022-offline / 030-contracts | — | **PASS** — authentic device UI |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hdsd-mob-bf03-close-01-20260801.md` | **0** | **PASS** 8/8 (this file) |

---

## Conditions (updated vs profile-close)

| ID | Item | Sev | Status | Owner |
|----|------|-----|--------|-------|
| ~~**C-BF03-PROFILE-01**~~ | Profile tab depth | P2 | **✅ CLOSED** (prior) | qa |
| **R-PROFILE-DENY-01** | Non-CEO salary deny | P3 | ⏳ OPEN (prior GWC sole) | qa optional |
| ~~**C-BF03-MOB-DEPTH-01**~~ | 4× mobile TC depth | P2 | **✅ CLOSED** (this WI) | qa-device |
| **C-BF03-MUTATE-DEFER-01** | Soft-delete/BH dialog defer | P2 | ⏳ OPEN | qa |
| **C-PROGRAM** | NOT Phase 1 DONE · NOT PROD · 43🟡 | P0 program | ⏳ OPEN | PM |

---

## HDSD orchestration promotion

| WI | Status |
|----|--------|
| `QA-HDSD-MOB-BF03-DEPTH-01` | ☑ 4/4 🟢 · 317🟢 · 43🟡 |
| `QC-HDSD-MOB-BF03-CLOSE-01` | ☑ **GO · C-BF03-MOB-DEPTH-01 CLOSED** |

---

## Handoff

**completion_report:** L3 closeout after `QA-HDSD-MOB-BF03-DEPTH-01`. Independent runtime JSON + matrix + 16 screenshots + pack 8/8 confirm **TC-MOB-020/021/022/030 4/4 🟢 · J-MOB-04 PASS · must_keep 011/027/028 intact · 317🟢/43🟡 · 0 demote**. **C-BF03-MOB-DEPTH-01 CLOSED.** Next yellow residual: **C-BF03-MUTATE-DEFER-01**. NOT Phase1/PROD.

**next_owner:** `pm`

**next_dispatch_prompt:**

```text
work_item_id: PM-HDSD-BF-03-MOB-CLOSED-01
from_role: qc | to_role: pm
entry_criteria:
- QC-HDSD-MOB-BF03-CLOSE-01 GO — docs/qa/evidence/qc-hdsd-mob-bf03-close-01-20260801.md
- C-BF03-MOB-DEPTH-01 CLOSED · TC-MOB-020/021/022/030 🟢 · J-MOB-04 PASS · matrix 317🟢 · 43🟡
- must_keep 011/027/028 intact · 0 demote
exit_criteria:
- Mark QC-HDSD-MOB-BF03-CLOSE-01 ☒ on HDSD_BUSINESS_FLOW_ORCHESTRATION.md / TEAM_WORKING_NOW
- Dispatch next yellow residual: QA-HDSD-BF-03-MUTATE-DEFER-01 (C-BF03-MUTATE-DEFER-01 · U65 browser · soft-delete/BH dialog)
- Do NOT false-promote remaining 43🟡 · must_keep prior MOB+profile 🟢
ack_status: PASS_TO_PM
residual_auto_fix: C-BF03-MUTATE-DEFER-01 → qa
cấm: Claude · seed · demote 🟢
```

**evidence_path:** `docs/qa/evidence/qc-hdsd-mob-bf03-close-01-20260801.md`

**ack_status:** **PASS_TO_PM**
