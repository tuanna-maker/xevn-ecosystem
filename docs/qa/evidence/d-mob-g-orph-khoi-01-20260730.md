# D-MOB-G-ORPH-KHOI-01 — Mobile Plane A label resolver (G-ORPH-MOB-01..03)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-MOB-G-ORPH-KHOI-01` |
| **date** | 2026-07-30 (ICT) |
| **from_role** | dev-mobile |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **HOLD_DEPLOY** | true · **U65** zero-seed |
| **spec_ref** | FR-HRM-EMP-COL-01 · FR-HRM-MOB-OU-01 · BA-MOB-ORPH-KHOI-LABEL-01 |

---

## completion_report

**Closed (source):**

- Replaced pilot «Khối … X.E» with **TECHSPEC §19.1 / BA §4 Plane A** strings in `PLANE_A_COMPANY_LABELS_FALLBACK` (`hrmOperatingUnits.ts`); `PILOT_HRM_OPERATING_UNITS` aliases same array.
- **`sanitizeOperatingUnitDisplayLabel` / `normalizeOperatingUnitRows`**: API rows with Khối fiction → Plane A per slug.
- **`resolveCompanyDisplayVi`**: BA §5.3 priority — valid `membershipCompanyDisplay` → sanitized API row → Plane A fallback → `—` / `Chưa chọn công ty`; Plane B′ UUID pre-step preserved.
- **`LoginScreen`**: multi-membership toast uses `resolveCompanyDisplayVi` (G-ORPH-MOB-03).
- **`resolveOperatingUnitRowSubtitle`**: label via resolver (OU row Khối from API sanitized in subtitle).
- Vitest: **32/32** on scoped files; **0** Khối on company-semantics resolver outputs.

**Residual:**

- **BE coupling:** If live `GET /operating-units` still returns Khối, mobile **sanitizes on normalize** — OU list should show Plane A. If BE persists Khối elsewhere (employees summary), dispatch **`D-HRM-EMP-COL-BE`** (`pm_dispatch_hint`).
- **APK:** not rebuilt (HOLD_DEPLOY).
- **Out-of-scope touch:** `src/integrations/__tests__/hrmOperatingUnits.test.ts` updated for Plane A expectations (required for green vitest).

---

## spec_read_ack

- **srs:** `docs/hrm/SRS.md` FR-HRM-EMP-COL-01 · `docs/hrm/SRS_MOBILE.md` UC-HRM-MOB-02 / FR-HRM-MOB-OU-01
- **tech_spec:** `docs/hrm/TECHSPEC.md` §19.1
- **ba:** `docs/qa/evidence/ba-mob-orph-khoi-label-01-20260730.md` §4–§5.3
- **change_mode:** FIX · **code_memory:** APPEND on `hrmOperatingUnits.ts`, `companyDisplayVi.ts`, `LoginScreen.tsx`

---

## Verification

```text
cd apps/mobile/hrm-mobile
pnpm exec vitest run \
  src/utils/__tests__/companyDisplayVi.test.ts \
  src/utils/__tests__/scopeScreenCopy.test.ts \
  src/utils/__tests__/payslipDisplayVi.test.ts \
  src/integrations/__tests__/hrmOperatingUnits.test.ts
# → 4 files, 32 tests passed
```

**rg production (excl. tests/comments):** no «Khối» pilot strings in `src/integrations/hrmOperatingUnits.ts` fallback rows.

---

## Files touched

| Path | Change |
|------|--------|
| `apps/mobile/hrm-mobile/src/integrations/hrmOperatingUnits.ts` | Plane A fallback + sanitize |
| `apps/mobile/hrm-mobile/src/utils/companyDisplayVi.ts` | §5.3 resolver + helpers |
| `apps/mobile/hrm-mobile/src/utils/scopeScreenCopy.ts` | OU subtitle via resolver |
| `apps/mobile/hrm-mobile/src/features/auth/LoginScreen.tsx` | Toast resolver |
| `apps/mobile/hrm-mobile/src/utils/__tests__/*` | Expect Plane A; anti-Khối |
| `apps/mobile/hrm-mobile/src/integrations/__tests__/hrmOperatingUnits.test.ts` | Plane A + sanitize tests |

**must_keep verified:** JWT scope wire unchanged · Plane B′ UUID map unchanged · no seed · no APK.

---

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-MOB-G-ORPH-KHOI-01
from_role: pm
to_role: qa
lane: execution
entry: dev-mobile READY_FOR_QA D-MOB-G-ORPH-KHOI-01 — evidence docs/qa/evidence/d-mob-g-orph-khoi-01-20260730.md; vitest 32/32; HOLD_DEPLOY no APK
exit: U65 browser/device — ceo@xe.vn / Xevn@2026 + member CEO: login (multi-membership toast if applicable) → Scope (membership title + OU rows) → Settings phạm vi → Home greeting → Payslip subtitle; assert AC-MOB-LABEL-01..07 — zero «Khối … X.E» on company-semantics; Network JWT unchanged; F5 stable; ack_status PASS_TO_PM; evidence docs/qa/evidence/qa-mob-g-orph-khoi-01-20260730.md
read_first: docs/qa/evidence/ba-mob-orph-khoi-label-01-20260730.md · docs/qa/evidence/d-mob-g-orph-khoi-01-20260730.md
cấm: seed · probe-only PASS
pm_dispatch_hint: if OU API response body still contains Khối after UI PASS → dev-be D-HRM-EMP-COL-BE
```

## evidence_path

`docs/qa/evidence/d-mob-g-orph-khoi-01-20260730.md`
