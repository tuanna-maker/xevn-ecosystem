# Evidence — XEVN-THM-MOB-00-QA (2026-07-22)

| Field | Value |
|-------|-------|
| **work_item_id** | `XEVN-THM-MOB-00-QA` |
| **from_role** | qa |
| **to_role** | pm |
| **program** | `P1-XEVN-THEME-REMASTER` |
| **ack_status** | `PASS_TO_PM` |
| **verdict** | **PASS** |
| **runtime_SoT** | `docs/architecture/ADR-XEVN-THEME-SHARP-OPS-20260722.md` (**Accepted**) §4.1–4.3 |
| **dev_evidence** | `docs/qa/evidence/xevn-thm-mob-00-20260722.md` (`READY_FOR_QA`) |
| **U65** | N/A — token-only; no seed |

## Scope under test

Token foundation only (`tokens.ts` + theme vitest). Full screen remaster = **XEVN-THM-MOB-W2** — legacy screen hex **not** a MOB-00 fail.

## AC matrix (ADR §4)

| # | Check | Expected | Observed | Result |
|---|-------|----------|----------|--------|
| A1 | `colors.text` | `#111827` | `#111827` (`tokens.ts` L35) | **PASS** |
| A2 | `colors.textSecondary` | `#4B5563` | `#4B5563` (L37) | **PASS** |
| A3 | `colors.textMuted` | `#6B7280` | `#6B7280` (L39) | **PASS** |
| A4 | Body type floor | ≥ **17** | `typography.fontSize.body` = **17** | **PASS** |
| A5 | Tests ban old `#1F2937` as `colors.text` | `expect(colors.text).not.toBe('#1F2937')` | `tokens.test.ts` L36 | **PASS** |
| A6 | Tests ban `#6B7280` as `textSecondary` | `expect(colors.textSecondary).not.toBe('#6B7280')` | L37 | **PASS** |
| A7 | `textMuted` remains Gray-500 | `#6B7280` | L38–39 + Theme barrel | **PASS** |
| A8 | Android `colorPrimary` | `#1E40AF` | `android/.../values/colors.xml` | **PASS** (spot) |

## Automation

```text
cwd: apps/mobile/hrm-mobile
pnpm exec vitest run src/theme/__tests__ --reporter=verbose
→ Test Files  6 passed (6)
→ Tests      29 passed (29)
→ exit 0
```

Key cases:

- `design tokens — brand SoT / sharp contrast` — palette map + ban AS-IS drift
- `uses iOS body ≥17pt` — `fontSize.body >= 17`
- `exports semantic textStyles with sharp text colors` — body `#111827` / footnote `#4B5563` / muted `#6B7280`
- `ThemeProvider / Theme barrel` — re-exports same locks

## Inventory note (W2 — not MOB-00 fail)

| Path | Hex | Note |
|------|-----|------|
| `src/components/ui/UndoSnackbar.tsx` L65 | `backgroundColor: '#1F2937'` | Chrome snackbar fill — **not** `colors.text`. Remaster → token in **XEVN-THM-MOB-W2**. |

No other `#1F2937` under `src/` except comment + ban assert in theme tests.

## Residual / not promoted

- Screen-level hardcoded text colors / remaster ESS/approve/attendance → **XEVN-THM-MOB-W2** (after inventory).
- Optional App root `ThemeProvider` wire → W2.
- No business API / L2.5 J-MOB / U65 flow in this wave.

## Handoff

- **next_owner:** pm
- **pm_dispatch_hint:** Inventory leftover hex → dispatch `XEVN-THM-MOB-W2` remaster screens to ADR tokens; include `UndoSnackbar` chrome.
- **ack_status:** `PASS_TO_PM`
