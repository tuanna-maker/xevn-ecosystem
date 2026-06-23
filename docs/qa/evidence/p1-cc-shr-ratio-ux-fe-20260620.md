# P1-CC-SHR-RATIO-UX-01-FE — Shareholder ratio / contributed value UX fix

**work_item_id:** `P1-CC-SHR-RATIO-UX-01-FE`  
**role:** dev-fe  
**date:** 2026-06-20  
**ack_status:** READY_FOR_QA

## Spec citation (mandatory — before code)

| Source | Reference | Requirement |
|--------|-----------|-------------|
| SRS | `docs/xbos/COMMAND_CENTER_P0_SRS.md` § UC-CC-P0-01 | CRUD cổ đông; fields validated independently |
| SRS Data | UC-CC-P0-01 Data interaction table | `ratio_percent` 0–100 numeric; `contributed_value` >= 0 — **no cross-field derivation** |
| TechSpec | `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` § `xbos_shareholder` | Separate columns `ratio_percent`, `contributed_value` |
| Bus / incident | `docs/program/AGENT_MESSAGE_BUS.md` 2026-06-20 P1-CC-SHR-RATIO-UX-01 | `ratio_percent` & `contributed_value` **độc lập**; remove unsolicited `charterCapital×ratio/100` |
| BA delta | `docs/program/governance/p1-cc-shr-ratio-ux-ba-delta-20260620.md` | **Unavailable at dispatch** — SRS UC-CC-P0-01 used as SoT |

### spec says / code did (before fix)

| Aspect | Spec | Code (incident) |
|--------|------|-----------------|
| `ratio_percent` edit | User enters value; POST as-is | OK for ratio field |
| `contributed_value` edit | User enters value; POST as-is | **readOnly** + auto-filled from `charterCapital × ratio / 100` in `updateShareholderRow` |
| POST payload | Both fields independent | Derived value overwrote user intent |

### Protected regression (🟢)

- **UF-XBOS-04** — member legal entity shareholder POST 201
- **UF-XBOS-05** — holding root shareholder POST 201 via `resolveShareholderApiEntityKey` UUID path

## Implementation

| File | Change |
|------|--------|
| `apps/web/web-portal/src/pages/command-center/shareholderRowUpdate.ts` | Pure `applyShareholderRowFieldUpdate` — assign field only, no auto-calc |
| `apps/web/web-portal/src/pages/command-center/shareholderRowUpdate.test.ts` | Vitest — ratio change does not mutate `contributedValue` |
| `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | Wire util; `contributedValue` input editable (`type="number"`, `min=0`) |

**Not changed:** `resolveShareholderApiEntityKey`, `submitShareholderRow`, `syncShareholders` API paths.

## Verification

```bash
pnpm --filter web-portal exec vitest run src/pages/command-center/shareholderRowUpdate.test.ts src/integrations/legalEntityProfileApi.test.ts src/integrations/legalEntityProfileScope.test.ts
pnpm --filter web-portal run build
```

**Results (2026-06-20):**

| Suite | Result |
|-------|--------|
| `shareholderRowUpdate.test.ts` | 3/3 PASS |
| `legalEntityProfileScope.test.ts` | 11/11 PASS |
| `legalEntityProfileApi.test.ts` | 5/5 PASS (UF-XBOS-04/05 POST UUID paths) |
| `web-portal build` | exit 0 |

## QA handoff

- Retest **UF-XBOS-04** (member) and **UF-XBOS-05** (holding TẬP ĐOÀN): add row → green ✓ → POST **201**; GET list persists both `ratio_percent` and `contributed_value` as entered (independent values).
- Manual: change ratio only — `contributed_value` must **not** auto-change; edit `contributed_value` directly — must persist on submit.
