# MOB-UX-14 — Home Responsive & 1-Screen Budget

**parent:** `MOBILE_PARTNER_READINESS_ASSESSMENT.md`  
**trigger:** Sponsor Home screenshots — top whitespace, 3-col grid waste, excessive scroll, stat cards tall

## Design targets (Apple HIG)

| Token | Value |
|-------|-------|
| Quick grid columns | **4** (phone ≥360dp); **3** only if width <360 |
| Tile min height | **72dp** (icon 40 + label 2 lines max) |
| Section gap | **12pt** between grid and stats |
| Above-fold budget | Welcome + grid + stat row ≤ **78%** viewport height (iPhone SE baseline) |
| Stat row | `EssStatRow`: label left **15pt**, value right **title3 semibold tabular-nums** |
| Top bar | `paddingTop: insets.top` only — no double `screenPaddingH` gap |

## Responsive matrix (MOB-UX-14d)

| Device class | Width | QA owner |
|--------------|-------|----------|
| iPhone SE 3 | 375×667 | qa-device |
| iPhone 14 Pro Max | 430×932 | qa-device |
| Pixel 4a | 393×851 | qa-device |
| Pixel 7 | 412×915 | qa-device |
| iPad Mini portrait | 744×1133 | qa-device GWC |

Script: `scripts/qa-mobile-home-responsive-matrix.mjs` (new in 14d).

## Anti-patterns (FAIL)

- `holding` / `main` / `trsport` visible on Home
- `bạn` when `full_name` exists in API
- >2 expandable sections above fold
- 3-col grid on width ≥390 with empty right gutter
