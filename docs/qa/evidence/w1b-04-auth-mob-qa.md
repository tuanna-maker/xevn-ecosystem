# Evidence — W1-B-04-AUTH-MOB-QA

| Field | Value |
| --- | --- |
| **work_item_id** | W1-B-04-AUTH-MOB-QA |
| **role** | qa-device (fallback: vitest + static wire when no device / stack down) |
| **date** | 2026-08-03 |
| **slice** | `docs/program/slices/DOC-ENT-P0-AUTH-M01.md` |
| **J-*** | **J-MOB-01** (Login → scope select → home) — device UF not executed |
| **U65** | **PASS** — no `pnpm seed:*`, no DB/API fake mutate in this evidence |
| **ack_status** | **BLOCKED** (`BLOCKED-STACK` · no adb device) |

## entry_criteria check

| Criterion | Result |
| --- | --- |
| `docs/qa/evidence/w1b-04-auth-mob.md` READY_FOR_QA | ✅ |
| BE evidence `w1b-03-auth-be.md` | ✅ present |
| Slice DOC-ENT-P0-AUTH-M01 | ✅ read |
| hrm-api `:28001` / `:3001` | ❌ **DOWN** (`Unable to connect`) |
| xbos-api `:28002` | ❌ **DOWN** |
| adb devices | ❌ empty list (daemon started; **0** devices/emulators) |

## Commands run

```text
adb devices -l
→ List of devices attached
→ (empty)

Invoke-WebRequest http://127.0.0.1:28001/api/hrm/health
→ HRM_DOWN

Invoke-WebRequest http://127.0.0.1:3001/api/hrm/health
→ HRM3001_DOWN

cd apps/mobile/hrm-mobile
pnpm exec vitest run src/features/auth/membershipDisplay.test.ts --reporter=verbose
→ Test Files: 1 passed
→ Tests: 3 passed (3)
```

## AC matrix (UF device / Expo FE)

Per entry_criteria: stack down → vitest 3/3 + **do not claim UF 🟢**.

| # | AC | Device / Expo UF | Fallback (unit + static) |
| --- | --- | --- | --- |
| 1 | Login toast multi-membership shows BE `company_label` VI — not raw slug | ⬜ **BLOCKED-STACK** | ✅ LoginScreen uses `resolveMembershipCompanyLabel(active)` only; vitest prefers `company_label` over slug `company_display` |
| 2 | ScopeScreen «Đang dùng» shows company/tenant/role/job_title labels | ⬜ **BLOCKED-STACK** | ✅ ScopeScreen binds four `resolveMembership*` helpers into «Đang dùng» card |
| 3 | Membership list titles = `company_label`; save alert uses labels not raw `tenant_id` | ⬜ **BLOCKED-STACK** | ✅ List `title={resolveMembershipCompanyLabel(m)}`; save `Alert` = company_label · tenant_label |
| 4 | select-membership switches JWT scope; leave/payroll smoke | ⬜ **BLOCKED-STACK** | ⬜ not runnable without API + device |
| 5 | U65 no seed | ✅ | N/A — no seed commands |
| 6 | This evidence file | ✅ | — |

### Static wire notes (not UF 🟢)

- `LoginScreen.tsx` — multi-membership toast: `resolveMembershipCompanyLabel` (no `resolveCompanyDisplayVi` on login path).
- `ScopeScreen.tsx` — «Đang dùng»: Công ty / Pháp nhân / Vai trò / Chức danh from BE labels; `__DEV__` may show raw keys for debug only.
- `ScopeScreen` membership row title + save alert: BE label helpers.
- Residual note (out of AC claim): `resolveMembershipRowTitle` in `scopeScreenCopy.ts` still Plane-A via `resolveCompanyDisplayVi` — **not used** by current ScopeScreen list (list uses `resolveMembershipCompanyLabel`). No FAIL opened for unused helper.

## Screenshots / logcat

None — no device attached; no Expo login session against live API.

## Verdict

| Layer | Verdict |
| --- | --- |
| Unit (`membershipDisplay` 3/3) | **PASS** |
| Static bind vs W1-B-04-AUTH-MOB | **PASS** (wire matches AC 1–3) |
| Device / Expo UF J-MOB-01 (AC 1–4) | **BLOCKED-STACK** — hrm-api down + 0 adb devices |
| Overall work item | **BLOCKED** — **not** PASS_TO_PM for UF 🟢; **not** READY_FOR_QC |

## Residual

| id | Note | Owner |
| --- | --- | --- |
| W1-B-STACK-L0-01 | Bring L0: hrm-api `:28001` (+ xbos if needed) | devops |
| W1-B-04-AUTH-MOB-QA-R1 | Redispatch qa-device when L0 + device/emulator/Expo up; persona multi-membership; U65 FE-only | pm → qa-device |
| R-M01-LOCKOUT-COL | unchanged OPEN (from BE) | BA/SA |

## completion_report

W1-B-04-AUTH-MOB-QA: entry READY_FOR_QA confirmed; **no adb device**; **hrm-api :28001/:3001 and xbos :28002 DOWN**. Fallback executed: `membershipDisplay.test.ts` **3/3 PASS**; static review confirms Login toast + ScopeScreen «Đang dùng» + list title/save alert bind BE `*_label` (no FE slug invent on auth path). **Device UF J-MOB-01 AC1–4 = BLOCKED-STACK** — **not** claimed 🟢. U65: no seed. Residual: stack L0 then redispatch device/Expo QA.

## next_owner

pm → **devops** (L0) then **qa-device** retest

## next_dispatch_prompt

```text
work_item_id: W1-B-04-AUTH-MOB-QA-R1
role: qa-device (or qa Expo FE fallback if no APK)
priority: P1
mission: Retest FR-UC-M01 Login → ScopeScreen after L0 up. U65 zero-seed; device/Expo only for UF 🟢.
entry_criteria:
  - qc:dev-stack or hrm-api :28001 health 200
  - adb device OR Expo with W1-B-04-AUTH-MOB sources
  - prior: docs/qa/evidence/w1b-04-auth-mob-qa.md BLOCKED-STACK
exit_criteria:
  - Login toast multi-membership: company_label VI (not holding/trsport)
  - Scope «Đang dùng»: company_label, tenant_label, role_label, job_title_label
  - List titles = company_label; save alert labels not tenant_id
  - select-membership JWT scope switch + leave/payroll smoke
  - screenshots + evidence update; U65 no seed
persona: documented multi-membership (uat.nv####@xe.vn / xevn-uat-2026 or du-lich.ceo)
J-*: J-MOB-01
evidence_path: docs/qa/evidence/w1b-04-auth-mob-qa.md (append R1) or w1b-04-auth-mob-qa-r1.md
cấm: seed · invent labels · claim UF 🟢 without UI path
```

## ack_status

**BLOCKED**
