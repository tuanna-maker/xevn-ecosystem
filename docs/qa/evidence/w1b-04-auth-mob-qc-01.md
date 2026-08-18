# Evidence — W1-B-04-AUTH-MOB-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-04-AUTH-MOB-QC-01` |
| **from_role** | qc |
| **to_role** | pm |
| **date** | 2026-08-03 |
| **lane** | L3 gate — FR-UC-M01 / **J-MOB-01** Scope AC2 (device) |
| **priority** | P0 |
| **api_base** | `http://10.0.2.2:28001` (adb reverse → host `:28001`) |
| **device** | `emulator-5554` · package `vn.xevn.hrm.mobile` |
| **APK SHA256** | `E71EC1AB2AD4F0740949CC33014D95F9DEB251CA9C81FF5734FF0BB3230A0758` |
| **lastUpdateTime** | `2026-08-03 20:56:48` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | `w1b-04-auth-mob-qa-r3.md` PASS_TO_PM · test-log md+json · BUILD-01 READY_FOR_QA |
| **spec_ref** | FR-UC-M01 · J-MOB-01 · W1-B-04-AUTH-MOB AC2 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed |
| **NOT claimed** | product UAT DONE · Phase 1 DONE · PROD-READY |

---

## Verdict summary

**GO WITH CONDITIONS** — L3 QC on mobile AUTH after qa-device **R3 PASS** on fresh APK **E71EC1AB…** (`lastUpdateTime=2026-08-03 20:56:48`). Independent spot-check confirms Case **A** 401 alert, Case **B** password login + home VI company, and **AC2** Scope «Đang dùng» four labels (**Công ty / Pháp nhân / Vai trò / Chức danh**). R2 primary fail **`Tenant: xevn`** is **CLOSED** (`stale_Tenant_colon_primary: false`). World-standard test-log **md + json** (`xevn-test-log/v1`) chronological + anti-idle (U78). U65 + hdsd_align credible.

**Conditions (allowed):** **R-M01-MULTI-PERSONA** P2 — AC1 toast + AC4 select-membership JWT skipped (`n=1` membership; U65 forbids seed) — defer, not NO-GO. **R-M01-DEV-META** P3 — `__DEV__` Tenant key / Query / Header under labels (build-01 accepted). Parallel portal AUTH FE chip/select remain **CLOSED** — do not reopen from this mobile gate.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/w1b-04-auth-mob-build-01.md` | READY_FOR_QA; APK E71EC1AB; Scope four labels on device | **ACCEPT** |
| `docs/qa/evidence/w1b-04-auth-mob-qa-r2.md` | FAIL_TO_PM; AC2 `Tenant: xevn` on stale APK 2026-07-31 | **ACCEPT prior FAIL** — closed by R3 |
| `docs/qa/evidence/w1b-04-auth-mob-qa-r3.md` | PASS_TO_PM; Case A/B + AC2 PASS; U65 | **ACCEPT** |
| `…-qa-r3-test-log.md` | 13 steps chronological · verdict pass | **ACCEPT** (U78) |
| `…-qa-r3-test-log.json` | `schema: xevn-test-log/v1` · 13 steps · cases A/B/AC2 pass · AC1/AC4 skipped | **ACCEPT** (U78 / OS 31) |
| Screens `docs/qa/evidence/screenshots/w1b-04-auth-mob-qa-r3/` | Case A/B + Scope PNGs + labels txt | **ACCEPT** (spot visual) |
| Parallel `w1b-04-auth-fe-qc-01.md` | AUTH FE GWC · chip/select CLOSED | **NOTE only** — do not reopen |

---

## Independent spot-check (QC)

### EC1 — Case A fail-deep (401)

| Check | Result |
|-------|--------|
| UI | Alert `HRM-AUTH-401: Email hoặc mật khẩu không đúng` · OK |
| Screen | `docs/qa/evidence/screenshots/w1b-04-auth-mob-qa-r3/11-case-a-fail.png` — Lỗi modal + bad.user@xe.vn (QC visual) |
| Log | CASE-A **pass** · seq 6 |

**PASS**

### EC2 — Case B password login + home labels

| Check | Result |
|-------|--------|
| Persona | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| Home | **Nguyễn Văn An** · **Tập đoàn X.E** (not slug `holding`) |
| Screen | `docs/qa/evidence/screenshots/w1b-04-auth-mob-qa-r3/21-case-b-home.png` (QC visual) |
| APK | SHA match BUILD-01 · lastUpdate **2026-08-03** (not 2026-07-31) |

**PASS**

### EC3 — AC2 Scope «Đang dùng» (closes R2)

| Check | Result |
|-------|--------|
| Labels dump | `40-scope-labels.txt`: Công ty Tập đoàn X.E · Pháp nhân Tập đoàn XeVN · Vai trò Nhân viên · Chức danh Nhân viên · `ac2_four_labels: true` · `stale_Tenant_colon_primary: false` |
| Screen | `docs/qa/evidence/screenshots/w1b-04-auth-mob-qa-r3/40-scope.png` — four VI labels present; no primary `Tenant: xevn` colon card (QC visual) |
| vs R2 | R2 had `Tenant: xevn` + missing Pháp nhân/Vai trò/Chức danh → **CLOSED** |

**PASS** — R2 AC2 product FAIL **CLOSED** on APK E71EC1AB.

### EC4 — World-standard test log (U78 / OS 31)

| Field | JSON / MD |
|-------|-----------|
| schema | `xevn-test-log/v1` |
| log_id | `TEL-W1B-04-AUTH-MOB-QA-R3-20260803` |
| steps | **13** chronological · all `pass` |
| cases | CASE-A · CASE-B · CASE-C-AC2 **pass**; AC1/AC4 **skipped** (n=1 U65) |
| hdsd_align | **true** |
| u65_zero_seed | **true** |
| anti_idle | **true** · click_count ≥8 |
| summary | passed=13 failed=0 blocked=0 skipped=2 |

**PASS**

---

## L2.5 J-* audit (U19)

| Journey | Scope vs AUTH-MOB AC2 | QC |
|---------|----------------------|-----|
| **J-MOB-01** Login → Hồ sơ → Cài đặt → Phạm vi công ty → Scope labels | In-scope (password UF + AC2) | **PASS** (device R3) |
| AC1 multi-membership toast | In FR-UC-M01 but persona n=1 | **deferred** CONDITION |
| AC4 select-membership JWT | In FR-UC-M01 but persona n=1 | **deferred** CONDITION |
| Portal AUTH FE / J-CC-01 | Parallel WI | **not reopened** |

Mandatory in-scope journey for this mobile AC2 gate: **J-MOB-01 PASS** (login + Scope AC2). AC1/AC4 explicitly deferred — not claimed PASS.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Case A/B **PASS** · AC2 four labels **PASS** · R2 `Tenant: xevn` primary **CLOSED** |
| **PROCESS** | QA R3 pack `verify:qc:evidence-pack` **5/8** missing command_table / portal_url(=api_base bold) / crud_or_matrix — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | none blocking (metrics 200 recorded in R3; emulator online) |

ENV does not drive verdict. Process pack gaps on QA MD do **not** demote product AC2 close.

---

## Residual

| Id | Status | Sev | Owner | Blocks AUTH-MOB AC2 GO? |
|----|--------|-----|-------|-------------------------|
| **R2 AC2 Tenant:xevn primary** | **CLOSED** | — | — | No |
| **R-M01-MULTI-PERSONA** | **OPEN — CONDITION** | P2 | pm / BA account prep (no seed) | **No** — AC1/AC4 out of this UF slice when n=1 |
| **R-M01-DEV-META** | OPEN | P3 | dev-mobile optional | No — `__DEV__` meta under labels |
| **R-M01-LOCKOUT-COL** | OPEN OOS | P2 | BA/SA | No |
| **R-AUTH-FE-CC-MEMBERSHIP-CHIP** | **CLOSED** (parallel) | — | — | No — do not reopen |
| **R-AUTH-FE-SELECT-MEMBERSHIP-UI** | **CLOSED** (parallel) | — | — | No — do not reopen |
| **C-AUTH-MOB-QA-PACK-FMT-01** | OPEN process | P3 | qa-device | No — harness note for next device MD |

---

## Conditions (explicit)

1. **R-M01-MULTI-PERSONA** — AC1 multi-membership toast + AC4 select-membership JWT remain **deferred P2** until a real multi-membership mobile persona exists without seed (U65). Not NO-GO for AC2 slice.
2. **R-M01-DEV-META** — optional hide `__DEV__` Tenant key / Query / Header for release UX (P3).
3. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this mobile AUTH GWC alone.
4. Do **not** reopen portal AUTH FE chip/select CLOSED residuals from this mobile gate.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-04-auth-mob-qa-r3.md
→ FAIL exit 1 · 5/8 (missing command_table, portal_url/api_base bold, crud_or_matrix)
```

**PROCESS GWC** — product Case A/B + AC2 independently verified via screens + labels dump + U78 log; does not demote AC2 close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-04-auth-mob-qc-01.md
→ target EXIT 0 (8/8)
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-04-auth-mob-qa-r3.md` | **FAIL** exit **1** · **5/8** (process) |
| `node -e` schema/chrono/allPass on `w1b-04-auth-mob-qa-r3-test-log.json` | **PASS** exit **0** · schema `xevn-test-log/v1` · steps=13 · chrono=true · failed=0 |
| Disk check PNG under screenshots/w1b-04-auth-mob-qa-r3/ | **PASS** · `docs/qa/evidence/screenshots/w1b-04-auth-mob-qa-r3/11-case-a-fail.png` · `docs/qa/evidence/screenshots/w1b-04-auth-mob-qa-r3/21-case-b-home.png` · `docs/qa/evidence/screenshots/w1b-04-auth-mob-qa-r3/40-scope.png` present |
| Labels dump `40-scope-labels.txt` | **PASS** · `ac2_four_labels: true` · `stale_Tenant_colon_primary: false` |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-04-auth-mob-qc-01.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-04-auth-mob-qc-01.md --check-assets` | **PASS** exit **0** (PNG paths resolve) |
| `adb shell` (recorded in R3) lastUpdate + package | **PASS** · lastUpdate `2026-08-03 20:56:48` · SHA E71EC1AB |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **A** fail_deep | Wrong pwd → HRM-AUTH-401 VI | **PASS** | `docs/qa/evidence/screenshots/w1b-04-auth-mob-qa-r3/11-case-a-fail.png` |
| **B** success_hdsd | Password login → Home VI company | **PASS** | `docs/qa/evidence/screenshots/w1b-04-auth-mob-qa-r3/21-case-b-home.png` |
| **C** logic_br AC2 | Scope Đang dùng four `*_label` | **PASS** | `docs/qa/evidence/screenshots/w1b-04-auth-mob-qa-r3/40-scope.png` · `40-scope-labels.txt` |
| AC1 multi-toast | company_label on multi-mem | **skipped** CONDITION | n=1 · U65 |
| AC4 select JWT | membership switch | **skipped** CONDITION | n=1 · U65 |
| **J-MOB-01** L2.5 | Login → Scope path | **PASS** | R3 click path + screens |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT DONE / Phase 1 DONE
- Did not reopen AUTH-FE chip/select CLOSED residuals
- Did not invent AC1/AC4 PASS beyond device evidence
- Did not treat QA pack process 5/8 as product NO-GO

---

## completion_report

**Closed:** L3 QC gate `W1-B-04-AUTH-MOB-QC-01` for FR-UC-M01 / **J-MOB-01** Scope **AC2** after qa-device R3 on APK **E71EC1AB…** (2026-08-03). Spot-check Case A 401, Case B login, AC2 four labels credible; R2 `Tenant: xevn` primary **CLOSED**. U78 test-log md+json OK. U65 honored.

**Residual / conditions:** R-M01-MULTI-PERSONA P2 (AC1/AC4) defer; R-M01-DEV-META P3; QA pack format P3 process; **NOT** Phase1/UAT DONE.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/w1b-04-auth-mob-qc-01.md`

---

## next_dispatch_prompt

```text
work_item_id: W1-B-04-AUTH-MOB-PM-CLOSE
role: pm
priority: P0
entry_criteria:
  - docs/qa/evidence/w1b-04-auth-mob-qc-01.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - J-MOB-01 AC2 Scope four-label CLOSED on APK E71EC1AB (R2 Tenant:xevn primary CLOSED)
  - Parallel AUTH FE chip/select remain CLOSED — do not reopen
action:
  1) Bus INTAKE W1-B-04-AUTH-MOB-QC-01 PASS_TO_PM + promote mobile AC2 CLOSED on backlog / TEAM_WORKING_NOW
  2) Continue next open W1-B / PM_OPEN_BACKLOG item (do not idle)
  3) Defer R-M01-MULTI-PERSONA P2 (AC1/AC4) to account-prep WI without seed — only when multi-membership UF enters scope
  4) Do NOT claim product UAT DONE / Phase 1 DONE from this mobile AUTH GWC
cấm: seed · reopen AUTH-FE chip/select · invent UAT DONE
```

---

## pm_dispatch_hint

`W1-B-04-AUTH-MOB-PM-CLOSE` — promote J-MOB-01 AC2 CLOSED; GWC R-M01-MULTI-PERSONA P2 defer; next W1-B backlog; no UAT DONE claim.
