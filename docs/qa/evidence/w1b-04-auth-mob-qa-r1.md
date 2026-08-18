# Evidence — W1-B-04-AUTH-MOB-QA-R1

| Field | Value |
| --- | --- |
| **work_item_id** | W1-B-04-AUTH-MOB-QA-R1 |
| **role** | qa-device |
| **date** | 2026-08-03 |
| **prior** | `docs/qa/evidence/w1b-04-auth-mob-qa.md` (BLOCKED-STACK) · `docs/qa/evidence/w1b-04-auth-mob.md` |
| **L0 entry** | `docs/qa/evidence/w1b-stack-l0-01.md` |
| **J-*** | **J-MOB-01** — device/Expo UF **not** executed |
| **U65** | **PASS** — no `pnpm seed:*`, no DB/API fake mutate |
| **ack_status** | **BLOCKED-DEVICE** |

## entry_criteria check

| Criterion | Result |
| --- | --- |
| L0 hrm-api `:28001` | ✅ **HTTP 200** (`http://127.0.0.1:28001/api/hrm`) |
| xbos-api `:28002` | ✅ **HTTP 200** |
| hrm `:3001` | ⬜ DOWN (not required — L0 SoT is `:28001`) |
| Prior W1-B-04-AUTH-MOB READY_FOR_QA | ✅ |
| Prior QA BLOCKED-STACK | ✅ cleared on stack side |
| adb devices | ❌ **0** devices/emulators (daemon OK; empty list) |
| Expo session (8081 / 19000 / 19001 / 19006) | ❌ **none** listening |

## Commands run

```text
adb devices -l
→ List of devices attached
→ (empty)

adb version
→ Android Debug Bridge 1.0.41 · platform-tools 37.0.0-14910828

Invoke-WebRequest http://127.0.0.1:28001/api/hrm
→ HTTP 200

Invoke-WebRequest http://127.0.0.1:28002/api/xbos
→ HTTP 200

Get-NetTCPConnection -LocalPort 8081,19000,19001,19006
→ (none)

cd apps/mobile/hrm-mobile
pnpm exec vitest run src/features/auth/membershipDisplay.test.ts --reporter=verbose
→ ✓ prefers company_label over company_display
→ ✓ uses company_display when company_label empty — never company_id
→ ✓ binds tenant/role/job_title labels from BE without raw keys
→ Test Files: 1 passed · Tests: 3 passed (3)
```

## AC matrix (UF device / Expo)

Per mission: **still adb=0 and no Expo** → **BLOCKED-DEVICE**; vitest 3/3 OK; **do not invent UF 🟢**.

| # | AC | Device / Expo UF | Unit fallback |
| --- | --- | --- | --- |
| 1 | Login multi-membership toast = BE `company_label` not raw slug | ⬜ **BLOCKED-DEVICE** | ✅ vitest prefers `company_label` |
| 2 | ScopeScreen «Đang dùng» company/tenant/role/job_title labels | ⬜ **BLOCKED-DEVICE** | ✅ vitest binds four BE labels |
| 3 | List titles + save alert use labels not raw `tenant_id` | ⬜ **BLOCKED-DEVICE** | ⬜ needs UI (static wire OK in prior QA; not re-claimed 🟢) |
| 4 | select-membership switches JWT scope | ⬜ **BLOCKED-DEVICE** | ⬜ needs live login + device/Expo |
| 5 | U65 no seed | ✅ | — |

## Screenshots / logcat / APK

None — no device attached; no Expo Go / Metro session against live API; no release APK install path exercised this turn.

## Diff vs prior QA (`w1b-04-auth-mob-qa.md`)

| Layer | Prior (AUTH-MOB-QA) | This R1 |
| --- | --- | --- |
| Stack L0 | ❌ DOWN → BLOCKED-STACK | ✅ UP (`:28001` / `:28002` 200) |
| adb | 0 | **still 0** |
| Expo | n/a | **none** |
| vitest | 3/3 PASS | **3/3 PASS** (reconfirmed) |
| Device UF J-MOB-01 | BLOCKED-STACK | **BLOCKED-DEVICE** |

## Verdict

| Layer | Verdict |
| --- | --- |
| L0 stack | **PASS** |
| Unit (`membershipDisplay` 3/3) | **PASS** |
| Device / Expo UF J-MOB-01 (AC 1–4) | **BLOCKED-DEVICE** — adb=0 · no Expo |
| Overall work item | **BLOCKED-DEVICE** — **not** PASS_TO_PM for UF 🟢; **not** READY_FOR_QC |

## Residual

| id | Note | Owner |
| --- | --- | --- |
| W1-B-04-AUTH-MOB-QA-R2 | Attach emulator/USB device **or** start Expo (`apps/mobile/hrm-mobile`) against `:28001`; retest AC1–4 + screenshots | pm → devops/dev-mobile (device) → **qa-device** |
| R-M01-LOCKOUT-COL | unchanged OPEN (from BE) | BA/SA |

## completion_report

W1-B-04-AUTH-MOB-QA-R1: L0 confirmed (**hrm `:28001` 200**, xbos `:28002` 200). Prior BLOCKED-STACK cleared on stack. **adb devices = 0**; **no Expo/Metro ports**. Fallback: `membershipDisplay.test.ts` **3/3 PASS**. Device/Expo UF J-MOB-01 AC1–4 **not** executed — verdict **BLOCKED-DEVICE** (not UF 🟢). U65: no seed.

## next_owner

pm → **devops** / **dev-mobile** (bring emulator or `expo start` + device) then **qa-device** R2

## next_dispatch_prompt

```text
work_item_id: W1-B-04-AUTH-MOB-QA-R2
role: qa-device
priority: P1
mission: Device/Expo UF retest FR-UC-M01 after device available. Prior R1 BLOCKED-DEVICE (adb=0, no Expo); L0 already PASS.
entry_criteria:
  - adb device OR Expo session with W1-B-04-AUTH-MOB sources
  - hrm-api :28001 health 200 (docs/qa/evidence/w1b-stack-l0-01.md)
  - prior: docs/qa/evidence/w1b-04-auth-mob-qa-r1.md BLOCKED-DEVICE
exit_criteria:
  - Login toast multi-membership: company_label VI (not raw slug)
  - Scope «Đang dùng»: company_label, tenant_label, role_label, job_title_label
  - List titles = company_label; save alert labels not tenant_id
  - select-membership JWT scope switch
  - screenshots + evidence; U65 no seed
persona: uat.nv####@xe.vn / xevn-uat-2026 or multi-membership account
J-*: J-MOB-01
evidence_path: docs/qa/evidence/w1b-04-auth-mob-qa-r2.md
cấm: seed · invent UF 🟢 without UI path
```

## ack_status

**BLOCKED-DEVICE**
