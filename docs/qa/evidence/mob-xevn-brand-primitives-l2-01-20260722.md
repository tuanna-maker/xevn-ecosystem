# MOB-XEVN-BRAND-PRIMITIVES-L2-01 — Mobile L2 brand primitives

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-XEVN-BRAND-PRIMITIVES-L2-01` |
| **Date** | 2026-07-22 |
| **Role** | Dev-Mobile |
| **Program** | `XEVN-BRAND-FULL-FE-REMASTER` L2m |
| **Entry** | QA L1m PASS — `docs/qa/evidence/qa-mob-xevn-brand-tokens-l1-01-20260722.md` |
| **Inventory** | `apps/mobile/hrm-mobile/src/theme/THEME_USAGE.md` § L2 |
| **U65** | Zero-seed · **no** full ESS remaster (L4c) · **no** Phase1/PROD claim |
| **ack_status** | `READY_FOR_QA` |
| **next_owner** | `qa` |
| **evidence_path** | `docs/qa/evidence/mob-xevn-brand-primitives-l2-01-20260722.md` |

---

## 1) Micro-checklist

| # | Check | Result |
|---|-------|--------|
| 1 | Wire **ConfirmActionModal**, **FabPrimaryActionSheet**, **ElevatedCard/SurfaceCard**, **FormField** to `radius.modal\|card\|input` + `borderWidth.thin\|focus\|hairline` + `colors.border` | **PASS** |
| 2 | Prefer branded ConfirmActionModal over Alert.alert where in-scope | **PASS** — AvatarUploadField remove + LeaveRequestDetailScreen cancel confirm |
| 3 | CODE-MEMORY on touched files | **PASS** |
| 4 | Relevant vitest | **PASS** — 25/25 (tokens 11 + L2 8 + fabPrimaryActions 6) |
| 5 | Evidence + READY_FOR_QA | **PASS** (this file) |

---

## 2) Changes (paths)

| Path | Delta |
|------|-------|
| `ConfirmActionModal.tsx` | `radius.modal` + `borderWidth.thin` + CODE-MEMORY |
| `FabPrimaryActionSheet.tsx` | `radius.modal` + `borderWidth.thin` + CODE-MEMORY |
| `ElevatedCard.tsx` | `borderWidth.hairline` (was `StyleSheet.hairlineWidth`) + CODE-MEMORY |
| `SurfaceCard.tsx` | `borderWidth.thin` + CODE-MEMORY |
| `FormField.tsx` | `borderWidth.thin` + focus ring `borderWidth.focus` / `colors.primary` + CODE-MEMORY |
| `AvatarUploadField.tsx` | Remove confirm → `ConfirmActionModal` (decline); error Alert kept |
| `LeaveRequestDetailScreen.tsx` | Cancel confirm → `ConfirmActionModal`; result Alert kept |
| `THEME_USAGE.md` | L2 wave status note |
| `src/theme/__tests__/mobL2Primitives.test.ts` | **new** static DNA gate |

---

## 3) Commands

```text
pnpm --filter hrm-mobile exec vitest run \
  src/theme/__tests__/mobL2Primitives.test.ts \
  src/theme/__tests__/tokens.test.ts \
  src/navigation/__tests__/fabPrimaryActions.test.ts
→ Test Files  3 passed (3)
→ Tests       25 passed (25)
→ exit 0
```

---

## 4) Scope / claim lock (U65)

| Claim | Status |
|-------|--------|
| Seed used | **No** |
| Full ESS screen remaster (L4c) | **Not done / not claimed** |
| All domain cards wired | **Residual** — HomeActionCard, LeaveHeroCard, … remain for follow-up / L4c |
| Remaining `Alert.alert` toast/error sites | **Documented** — system chrome OK; confirm destructive in-scope migrated |
| Phase1 / PROD | **Not claimed** |

---

## 5) Residual (not blocking L2 core READY)

| ID | Item | Owner |
|----|------|-------|
| R1 | Domain cards still may use literal `borderWidth: 1` | L4c / follow-up primitive sweep |
| R2 | Non-confirm `Alert.alert` (errors/toasts) remain system chrome | document-only unless UX asks branded toast |
| R3 | Device visual smoke of modal/sheet | optional `qa-device` after APK |
| R4 | ESS hex sweep | `MOB-XEVN-BRAND-SCREENS-ESS-01` (L4c) |

---

## 6) Handoff

### completion_report

- **Closed:** Core L2 primitives (ConfirmActionModal, FabPrimaryActionSheet, ElevatedCard, SurfaceCard, FormField) consume `radius.*` + `borderWidth.*` + `colors.border`; FormField focus ring; two confirm Alert→ConfirmActionModal; CODE-MEMORY; vitest 25/25; no seed / no ESS remaster / no Phase1-PROD claim.
- **Residual:** R1–R4 above.

### next_owner

`qa`

### next_dispatch_prompt

```text
Operate as qa for QA-MOB-XEVN-BRAND-PRIMITIVES-L2-01.
Entry: Dev READY — docs/qa/evidence/mob-xevn-brand-primitives-l2-01-20260722.md (vitest 25/25; U65 zero-seed).
Micro-checklist:
1) ConfirmActionModal / FabPrimaryActionSheet use radius.modal + borderWidth.thin + colors.border (no literal borderWidth: 1 in StyleSheet).
2) ElevatedCard → borderWidth.hairline; SurfaceCard → borderWidth.thin; FormField → radius.input + thin/focus.
3) AvatarUploadField remove + LeaveRequestDetail cancel confirm use ConfirmActionModal (not Alert.alert).
4) Re-run: pnpm --filter hrm-mobile exec vitest run src/theme/__tests__/mobL2Primitives.test.ts src/theme/__tests__/tokens.test.ts
5) Cấm: claim L4c ESS remaster / Phase1 / PROD / seed.
Exit: docs/qa/evidence/qa-mob-xevn-brand-primitives-l2-01-20260722.md · PASS_TO_PM or FAIL with residual.
read_first: docs/qa/evidence/mob-xevn-brand-primitives-l2-01-20260722.md · THEME_USAGE.md § L2
```

### evidence_path

`docs/qa/evidence/mob-xevn-brand-primitives-l2-01-20260722.md`

### ack_status

`READY_FOR_QA`

### pm_dispatch_hint

`QA-MOB-XEVN-BRAND-PRIMITIVES-L2-01` — dispatch `qa` same session after intake.
