# Evidence — PO-ECO-TC-MOB-SETTINGS-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-ECO-TC-MOB-SETTINGS-01` |
| **from_role** | `qa` |
| **to_role** | `qa-synth` / `pm` |
| **lane** | execution (test design) |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **program** | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` · roster Wave B `MOB-SETTINGS` + `MOB-SCOPE` gộp |
| **ack_status** | **READY_FOR_SYNTH** |
| **locks** | U65 · U76 · U78 (on execute) · **no seed** · **no apps/** edits · **no UAT DONE** |

---

## 1. Deliverables

| # | Artifact | Path | Result |
|---|----------|------|--------|
| 1 | Mobile Settings + Scope TC pack | `docs/qa/testcases/hrm-mobile/MOB-SETTINGS.md` | **READY_FOR_SYNTH** |
| 2 | This evidence | `docs/qa/evidence/po-eco-tc-mob-settings-01.md` | handoff |

**Not in this wave:** device execution · `*-test-log.md/json` · APK · matrix 🟢 promotion.

---

## 2. Spec read ack

| Source | Cited |
|--------|-------|
| `SettingsScreen.tsx` | Scope read-only card · UAT SecureStore card · biometric · logout · quick nav · `settings-create-update-request` |
| `ScopeScreen.tsx` | Đang dùng · OU rollup/member · membership pick · alerts |
| `profileSettingsNav.ts` | `settings-screen` · `settings-scope-link` · `scope-screen` · `profile-settings-entry` |
| `profileStackNav.ts` | `navigateToSettings` · `navigateToScope` · `navigateToCreateUpdateRequest` |
| `scopeScreenCopy.ts` · `membershipDisplay.ts` | VI labels · ILA-07 Plane A |
| `biometricUnlock.ts` | toggle + `promptBiometricIfEnabled` on UAT save |
| `profileStackNav.test.ts` | MOB-NAV-SETTINGS-01 regression wiring |
| `scopeScreenCopy.test.ts` | role VI · OU subtitle |
| `ECOSYSTEM_MENU_ROSTER.md` | MOB-SETTINGS · MOB-SCOPE gộp |
| `MOB-PROFILE.md` (planned) | Cross-ref — **no** full profile tab inventory |
| `MOB-LEAVE-APPR.md` · `MOB-ATTENDANCE.md` · `MOB-HOME.md` | Downstream execution depth |

---

## 3. Depth gate verification

| Gate | Required | Pack | PASS |
|------|----------|------|------|
| Screen inventory | Settings + Scope + alerts | §1 — **14** ids | ☑ |
| Field dictionary | toggles/fields/quick nav | §2 — **36** fields | ☑ |
| Function inventory | nav + scope pick + security | §3 — **18** fns | ☑ |
| TC matrix | HP+FD+AU+REG | §4 — **30** TC | ☑ |
| Scope coupled | MOB-SCOPE roster gộp | §1 SCR-SCOPE + §4 SCP-* | ☑ |
| MOB-PROFILE dedupe | entry only | §6 cross-pack | ☑ |
| Legacy map 006/032/033 | device MOB-NAV-SETTINGS-01 | REG rows | ☑ |
| Coverage check table | zero GAP | §4.1 footer | ☑ |
| Traceability | UC-MOB-02 · AT-01 · J-MOB-01 | §5 | ☑ |

---

## 4. Settings quick-nav inventory (explicit)

| vi title | testID | show rule | Nav target | Downstream pack |
|----------|--------|-----------|------------|-------------------|
| Phạm vi công ty | `settings-scope-link` | all | Scope | this pack |
| Phê duyệt | — | `auth.isManager` | ManagerApprovals | MOB-LEAVE-APPR |
| Đơn công | `settings-create-update-request` | all | CreateUpdateRequest | MOB-ATTENDANCE / TC-AT-01 |
| Lương | — | all | TabPayslip→PayrollSummary | payslip |
| Hợp đồng | — | all | Contracts | MOB-PROFILE gộp |
| Vận hành | — | mgr | Operations | ops |
| Hồ sơ | — | all | Profile | MOB-PROFILE |
| Thông báo | — | all | Notifications | MOB-PROFILE gộp |

Biometric: single secondary button toggles label Bật/Tắt · SecureStore `hrm_mobile_biometric_enabled`.

UAT card: visible `__DEV__` || `isQaDevLoginEnabled()` — **not** asserted on release (TC-MOB-SET-AU-003).

---

## 5. Scope screen inventory (coupled)

| Block | Persona | Behavior TC |
|-------|---------|-------------|
| «Đang dùng» | all | SCP-HP-001 · REG-033 |
| «Đơn vị vận hành» + rollup | Group CEO (`isGroupCeoMasterTenant`) | SCP-HP-004..006 |
| «Kiêm nhiệm» rows | all (≥1 mem) | SCP-HP-002..003 |
| Empty | no memberships | SCP-BD-001 |
| Member CEO — no OU section | uat.nv* | SCP-AU-001 |

---

## 6. Residual (explicit)

| Item | Owner | Trigger |
|------|-------|---------|
| Device execute 30 PLANNED TC | `qa-device` | APK + `:28001` · U65 |
| Synth merge roster MOB-SETTINGS/MOB-SCOPE | qa-synth | This READY_FOR_SYNTH |
| **MOB-PROFILE** full pack | qa | PO-ECO-TC-MOB-PROFILE-01 in flight / planned |
| Multi-membership UAT account for SCP-HP-003 | dev-mobile/ops | if pilot only single mem |

---

## completion_report

- Closed: WORLD-STANDARD depth TC pack for mobile **Settings (`SettingsScreen`)** and coupled **Scope (`ScopeScreen`)** with **36** fields, **18** functions, **30** design TCs, quick-nav inventory, legacy **TC-MOB-006/032/033** regression rows, coverage check **0 GAP**.
- **MOB-PROFILE** cross-referenced: ProfileSettingsEntry + quick nav to Profile only — no duplicate ESS/tab field inventory.
- Residual: no device run; no test-log; not UAT DONE.

## next_owner

`qa-synth` (catalog/report + roster `MOB-SETTINGS` / `MOB-SCOPE` PLANNED→pack linked) → then `qa-device` for TC-MOB-SET-HP-001..002 / SCP-HP-001 on pilot APK.

## next_dispatch_prompt

```
work_item_id: PO-ECO-TC-SYNTH-W1 (or next synth slot)
from_role: pm
to_role: qa-synth
read_first: docs/qa/testcases/hrm-mobile/MOB-SETTINGS.md · docs/qa/evidence/po-eco-tc-mob-settings-01.md · docs/qa/testcases/hrm-mobile/MOB-HOME.md · docs/qa/testcases/hrm-mobile/MOB-LEAVE-APPR.md · docs/qa/testcases/hrm-mobile/MOB-ATTENDANCE.md · docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md
entry_criteria: MOB-SETTINGS ack READY_FOR_SYNTH; MOB-HOME + MOB-LEAVE-APPR + MOB-ATTENDANCE already READY_FOR_SYNTH
exit_criteria: Dedupe TC-ID prefixes TC-MOB-SET-* vs TC-MOB-SCP-* vs TC-MOB-HOME-*; link MOB-SCOPE roster row to MOB-SETTINGS.md; append PO_SPEC_TEST_REPORT ecosystem depth section; map TC-MOB-006/032/033; no UAT DONE claim
evidence_path: docs/qa/evidence/po-eco-tc-synth-w1-mob-settings.md
ack_status target: PASS_TO_PM
```

## evidence_path

`docs/qa/evidence/po-eco-tc-mob-settings-01.md`

## ack_status

**READY_FOR_SYNTH**
