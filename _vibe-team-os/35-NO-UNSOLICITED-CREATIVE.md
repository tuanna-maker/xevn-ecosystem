# 35 — No unsolicited creative (sponsor lock)

**Version:** 1.12.9 · **Date:** 2026-08-06  
**Incident:** `incidents/INC-PM-INVENT-UI-WITHOUT-SPONSOR.md`  
**Cursor rule:** `.cursor/rules/pm-no-unsolicited-creative.mdc`

## Principle

Dispatch and implement **only** the sponsor’s literal request (plus technical minimum required to achieve that literal). Do **not** invent visual or UX “improvements” without an explicit ask + confirm.

## Hard rules

1. **Literal only** — size, copy, placement, behavior named by sponsor.
2. **Creative extras need ask** — background color, gradient, new font, new icon, dark shell, decorative chrome → ask sponsor; wait for confirm before `Task`.
3. **No piggyback beauty** — never bundle “làm đẹp thêm” into a technical fix Task.
4. **Dev packet fields**
   - `sponsor_literal: …`
   - `creative_extra: none` **or** `asked+confirmed: …`
5. **QA FAIL** if visual delta is not in sponsor text / confirmed ADR.

## Example (XeVN 2026-08-06)

| Sponsor | OK | SAI |
|---------|----|-----|
| «logo to hơn» | tăng kích thước mark | tự thêm `bg-black` quanh logo |
| sau reject «nền trắng» | `bg-white` / surface trắng | giữ black hoặc invent gradient |

## PM / QC

- PM: reject invent in dispatch review.
- QC: soft OBS if doctrine file missing from inventory; product chrome lane may still GWC.
