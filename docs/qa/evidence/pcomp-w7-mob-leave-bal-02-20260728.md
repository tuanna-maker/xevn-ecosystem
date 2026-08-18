# PCOMP-W7-MOB-LEAVE-BAL-02 — LeaveBalanceChip on wizard (reopen)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-LEAVE-BAL-02` |
| **from_role** | `dev-mobile` |
| **to_role** | `pm` → **BUILD** then `qa-device` |
| **date** | 2026-07-28 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | FIX (Plane B parity) · confirm source wire |
| **U65** | zero-seed — no `pnpm seed:*` |
| **HOLD_DEPLOY** | yes — **no APK this wave** (source + unit only) |
| **journeys** | **J-MOB-28** · **J-MOB-25** (must_keep header) |
| **AC** | **AC-LEAVE-BAL-01** (chip ≠ «—» on API 200) · AC-LEAVE-BAL-02 residual |
| **prior FAIL** | `docs/qa/evidence/pcomp-w7-mob-leave-bal-qa-20260719.md` |
| **prior Dev** | `docs/qa/evidence/pcomp-w7-mob-leave-bal-20260719.md` |

---

## Root-cause class (qa-device 2026-07-19)

| Finding | Verdict |
|---------|---------|
| Source `LeaveBalanceChip` + `testID leave-balance-chip` on Create Leave **step 0** | **Already present** since 2026-07-19 |
| Installed APK `lastUpdateTime=2026-06-16` · SHA `49B95D0E…` | **Stale** — bundle `leave-balance-chip=False` |
| Vitest 14/14 on source ≠ device L2.5 | Confirmed — unit cannot promote UF |
| Later WAVE-APK `9C346CA3…` (2026-07-19) had chip markers + QA PASS J-MOB-28 | Historical fold-in; current reopen needs **fresh BUILD** if device SHA lag |

**Conclusion:** Defect **D-W7-LEAVE-BAL-APK-01** (missing wave binary), not missing wizard wire in tree. This wave hardens Plane B + step-0 gate tests and re-hands READY_FOR_QA for **rebuild + qa-device**.

---

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| **srs** | `docs/hrm/MOBILE_W7_SRS_DELTA.md` **§4.3 UC-HRM-MOB-06c** — chip «Còn lại: R / E ngày phép năm Y»; B1–B3; AC-LEAVE-BAL-01/02 |
| **tech_spec** | `docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md` **§3.6** GET leave-balance · **§4.2** `LeaveBalanceChip` |
| **api_design** | `docs/hrm/API_DESIGN_HRM_LEAVE.md` — leave-balance purpose + MOB AC-LEAVE-BAL / J-MOB-25/28 |
| **data** | `docs/hrm/MOBILE_W7_DATA_CONTRACTS.md` **§4** leave_balance |
| **uc_ids** | UC-HRM-MOB-06c |
| **must_keep** | directory/profile/toast Plane B fixes; leave-doc attach gate; HOLD_DEPLOY |

**spec says / code does (this wave):**

| Spec | Code |
|------|------|
| Wizard step 0 shows chip + SRS copy on API 200 | `CreateLeaveRequestScreen` `case 0:` → `<LeaveBalanceChip>` before `HrmDateRangeField`; default `testID='leave-balance-chip'` |
| Plane B `company_id` slug (not LE UUID) | `resolveLeaveBalanceQueryCompanyId` → **delegates** `resolveDirectoryQueryCompanyId` (holding / trsport / `main`) |
| Fetch on wizard mount | `useEffect` → `fetchLeaveBalance` when `balanceQueryCid` + eid |

---

## Scope closed

1. **Confirm wire** — `LeaveBalanceChip` on steps **0** and **1**; default `testID leave-balance-chip`; copy via `formatLeaveBalanceChipText`.
2. **Plane B FIX** — leave-balance query scope ≡ directory/profile resolver (membership recover + `main` rollup).
3. **Vitest gate** — step-0 ordering + testID + Plane B parity cases.
4. **@CODE-MEMORY** APPEND on chip / create screen / `hrmLeaveBalance`.
5. **HOLD_DEPLOY** — no APK; next owner must BUILD then qa-device.

**must_keep (untouched):** leave-doc attach gate, directory/profile Plane B, toast cycle fixes, attendance write UUID paths.

---

## Verification

```text
pnpm test:hrm-mobile -- leaveBalanceChip hrmLeaveBalance companyWireScope
→ Test Files  3 passed (3)
→ Tests      34 passed (34)
```

Expected chip text (nip.io UAT example from FAIL evidence): **`Còn lại: 8 / 12 ngày phép năm 2026`**.

---

## Files touched

| Path | Change |
|------|--------|
| `apps/mobile/hrm-mobile/src/integrations/companyWireScope.ts` | `resolveLeaveBalanceQueryCompanyId` → delegate Plane B directory |
| `apps/mobile/hrm-mobile/src/integrations/hrmLeaveBalance.ts` | CODE-MEMORY-CHANGE |
| `apps/mobile/hrm-mobile/src/components/ui/LeaveBalanceChip.tsx` | CODE-MEMORY-CHANGE · must_keep testID |
| `apps/mobile/hrm-mobile/src/features/attendance/CreateLeaveRequestScreen.tsx` | CODE-MEMORY-CHANGE (wire reaffirm) |
| `apps/mobile/hrm-mobile/src/components/ui/__tests__/leaveBalanceChip.test.ts` | step-0 wire + testID asserts |
| `apps/mobile/hrm-mobile/src/integrations/__tests__/hrmLeaveBalance.test.ts` | Plane B main/trsport |
| `apps/mobile/hrm-mobile/src/integrations/__tests__/companyWireScope.test.ts` | leave ≡ directory |

---

## Residual / not promoted

| Item | Owner |
|------|-------|
| Device J-MOB-28 / AC-LEAVE-BAL-01 on **new** APK (bundle markers True) | qa-device after BUILD |
| AC-LEAVE-BAL-02 approve→refresh drop | optional P2 |
| B2/B3 warn banners on device | qa-device with chip APK |
| Phase1 / PROD | **NOT** claimed |

---

## Handoff

- **completion_report:** Source already had `LeaveBalanceChip` on wizard step 0; qa-device FAIL 2026-07-19 = stale APK. Plane B leave-balance now delegates `resolveDirectoryQueryCompanyId`. Vitest **34/34**. HOLD_DEPLOY — need BUILD APK then device retest.
- **next_owner:** pm → **dev-mobile BUILD** (or devops APK) then **qa-device**
- **ack_status:** READY_FOR_QA
- **evidence_path:** `docs/qa/evidence/pcomp-w7-mob-leave-bal-02-20260728.md`
- **pm_dispatch_hint:** `PCOMP-W7-MOB-LEAVE-BAL-02-BUILD` then qa-device J-MOB-28
- **next_dispatch_prompt:** |
  Operate as **dev-mobile BUILD** (or devops APK lane) then **qa-device**.
  work_item_id: `PCOMP-W7-MOB-LEAVE-BAL-02-BUILD` → install → `PCOMP-W7-MOB-LEAVE-BAL-02` device.
  1) `BUILD_TARGET=qa-device` APK from current tree (include LeaveBalanceChip + leave-doc + directory/profile must_keep).
  2) Publish path + SHA-256; bundle audit must show `leave-balance-chip=True` + `formatLeaveBalanceChipText=True`.
  3) qa-device U65 zero-seed: `uat.nv0001@xe.vn` @ nip.io → My Leaves (J-MOB-25) → FAB Tạo đơn nghỉ → wizard step 0 assert `leave-balance-chip` text «Còn lại: R / E ngày phép năm Y» (AC-LEAVE-BAL-01). Touch ≥44px.
  4) Evidence `docs/qa/evidence/pcomp-w7-mob-leave-bal-02-qa-YYYYMMDD.md`. PASS_TO_PM or FAIL with residual.
  HOLD_DEPLOY until BUILD done. Do not claim Phase1/PROD. No seed.
