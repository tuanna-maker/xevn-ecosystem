# D-UX-PERMISSION-FALLBACK-FE-01 — PermissionFallback VI + CTA SoT (Wave B)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-UX-PERMISSION-FALLBACK-FE-01` |
| **from_role** | pm |
| **to_role** | qa |
| **date** | 2026-07-28 |
| **change_mode** | UPGRADE |
| **ack_status** | **READY_FOR_QA** |
| **locks** | U65 zero-seed · HOLD_DEPLOY · preserve_default · must_keep Profile C2 / Payroll D5/P0-c / Clock-In |
| **spec_ref** | `docs/program/UX-UI-ERP-ANALYSIS.md` §9 PermissionFallback · UX-07 · Profile residual R-C2-01 |
| **prior** | `docs/qa/evidence/qa-ux-profile-c2-01-20260728.md` (wiring PASS*; portal bypass note) |

---

## Spec / DoD

| AC | Result |
|----|--------|
| PermissionFallback VI message + CTA «Liên hệ HR» SoT consistent | **PASS** — `permissionFallbackSot.ts` + vi/en leaves aligned |
| Salary / insurance gates keep `fallback={<PermissionFallback />}` | **PASS** — unchanged paths |
| Silent-null gaps closed | **PASS** — general-tab CMND/CCCD `view_salary` was `fallback={null}` → `variant="compact"` |
| Portal embed bypass not broken | **PASS** — `PermissionGate.shouldBypassHrmPermissionGate` untouched; Gate vitest 5/5 |
| Vitest component/SoT | **PASS** — 5/5 PermissionFallback + Gate must_keep |
| CODE-MEMORY APPEND | **PASS** — PermissionFallback + EmployeeProfile |
| Seed / deploy / Phase1 DONE | **None** |

---

## What shipped

| Area | Change |
|------|--------|
| SoT module | `permissionFallbackSot.ts` — VI/EN copy, i18n keys, default `mailto:hr@xe.vn?subject=…`, testids |
| Component | Always CTA `<a data-testid="permission-fallback-contact-hr">`; default mailto; `variant` default\|compact |
| Profile | 5× `view_salary` gates → PermissionFallback (was 4 + 1 silent null) |
| Tests | Locale↔SoT match · render VI+CTA · compact · href override · no `fallback={null}` on view_salary |

### Files

- `apps/web/hrm/src/components/auth/permissionFallbackSot.ts` (**ADD**)
- `apps/web/hrm/src/components/auth/PermissionFallback.tsx` (**UPGRADE** + CODE-MEMORY-CHANGE)
- `apps/web/hrm/src/components/auth/PermissionFallback.test.ts` (**ADD**)
- `apps/web/hrm/src/pages/EmployeeProfile.tsx` (**UPGRADE** silent-null + CODE-MEMORY-CHANGE)

**Not touched:** Payroll · Attendance Clock-In · D5 Zod · `PermissionGate` bypass logic · pin/localStorage Profile C2 groups

---

## Verify (dev)

```bash
cd apps/web/hrm
pnpm exec vitest run src/components/auth/PermissionFallback.test.ts src/components/auth/PermissionGate.test.ts
# 10/10 PASS
pnpm exec tsc --noEmit -p tsconfig.json
# exit 0
```

---

## QA selectors

- `permission-fallback` (+ `data-variant="default|compact"`)
- `permission-fallback-contact-hr` (mailto href)
- Profile: salary tab / insurance tab / general financial+insurance cards / CMND fields under personalInfo

---

## Residual

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| **R-C2-01** | **P3** | Live deny DOM still blocked under portal JWT bypass (`shouldBypassHrmPermissionGate`) by design (GWC-HRM-REC-UF12-01). Unit + source wiring prove VI+CTA; browser deny needs **non-portal standalone** persona without portal QS/session/iframe. Do **not** remove bypass to force DOM. | qa (optional deny persona) / pm |

**not promoted:** deploy · seed · EmptyState Wave B sibling · i18n zh/my/lo/km sweep

---

## completion_report

Closed **D-UX-PERMISSION-FALLBACK-FE-01**: Wave B PermissionFallback SoT (VI title/message/CTA + default mailto), compact variant, closed Profile CMND silent-null on `view_salary`; portal bypass preserved; vitest 10/10 (Fallback 5 + Gate 5); tsc 0. Residual **R-C2-01 P3** documented — live deny under portal still by design. HOLD_DEPLOY · U65 · no seed.

## next_owner

qa

## next_dispatch_prompt

```text
work_item_id: QA-UX-PERMISSION-FALLBACK-01
from_role: pm
to_role: qa
lane: execution
residual_auto_fix: true
entry_criteria: D-UX-PERMISSION-FALLBACK-FE-01 READY_FOR_QA @ docs/qa/evidence/d-ux-permission-fallback-fe-01-20260728.md
locks: U65 zero-seed · HOLD_DEPLOY · browser-only
read_first:
  - docs/qa/evidence/d-ux-permission-fallback-fe-01-20260728.md
  - docs/program/UX-UI-ERP-ANALYSIS.md §9 PermissionFallback
  - docs/qa/evidence/qa-ux-profile-c2-01-20260728.md (R-C2-01)
scope:
  - Source/unit already green — confirm salary + insurance + general financial cards + CMND compact show PermissionFallback wiring (no blank/silent null in source)
  - Browser: ceo@xe.vn portal path — CEO salary non-blank (bypass by design); assert CTA testid present in DOM source if deny unreachable
  - Optional: standalone HRM non-portal deny persona → assert permission-fallback + «Liên hệ HR» mailto (closes R-C2-01 if available)
  - must_keep: Profile C2 groups · Payroll D5/P0-c · Clock-In C1 — smoke only, no feature change claim
  - cấm: seed · deploy · remove portal bypass
exit_criteria: evidence docs/qa/evidence/qa-ux-permission-fallback-01-20260728.md; PASS_TO_PM or FAIL with defect; keep R-C2-01 P3 if deny persona BLOCKED-ENV
```

## ack_status

**READY_FOR_QA**
