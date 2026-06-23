# P1-CC-SHR-RATIO-UX-01-QA — Shareholder ratio/contributed independent fields

**work_item_id:** `P1-CC-SHR-RATIO-UX-01-QA`  
**role:** qa  
**date:** 2026-06-20  
**environment:** local dev — portal `:5173`, hrm-api `:28001`, xbos-api `:28002`  
**account:** `ceo@xe.vn` / `Xevn@2026`  
**ack_status:** **PASS_TO_PM**

**spec_ref:** `docs/xbos/COMMAND_CENTER_P0_SRS.md` UC-CC-P0-01 · BA delta `docs/program/governance/p1-cc-shr-ratio-ux-ba-delta-20260620.md` AC-SHR-01..06

---

## Verdict

**PASS_TO_PM** — FE fix verified: `ratio_percent` and `contributed_value` are **independent** (no `charterCapital×ratio/100` auto-calc); contributed input **editable**; UF-XBOS-04/05 regression POST **201** with independent field persistence. No `:8088` deploy (U32).

---

## L0 — Stack health

| Check | Command / URL | Result |
|-------|---------------|--------|
| hrm-api | `pnpm run qc:dev-stack` → `:28001` | **200** exit **0** |
| xbos-api | same | **200** |
| web-portal | same → `:5173` | **200** |

---

## Static / unit regression

```bash
pnpm --filter web-portal exec vitest run \
  src/pages/command-center/shareholderRowUpdate.test.ts \
  src/integrations/legalEntityProfileApi.test.ts \
  src/integrations/legalEntityProfileScope.test.ts
```

| Suite | Result |
|-------|--------|
| `shareholderRowUpdate.test.ts` | **3/3 PASS** — ratio change does not mutate `contributedValue` |
| `legalEntityProfileScope.test.ts` | **11/11 PASS** |
| `legalEntityProfileApi.test.ts` | **5/5 PASS** — UF-XBOS-04/05 UUID POST paths |

---

## AC-SHR-01 — Ratio change must NOT auto-update contributed (manual UX)

**Path:** `/command-center?settings=company_member_units` → TẬP ĐOÀN **Chỉnh sửa** → **Danh sách Cổ đông** → + row

| Step | Action | Observed |
|------|--------|----------|
| 1 | Set `contributed_value` = **123456789** | Spinbutton editable (`readOnly=false`, `type=number`) |
| 2 | Set `ratio_percent` = **40** (charterCapital field = 1_000_000_000) | `contributed_value` **remains 123456789** |
| 3 | Old bug check | Auto-calc would yield **400_000_000** (= 1B × 40%) — **NOT applied** |

**AC-SHR-01:** **PASS**

---

## AC-SHR-02 — Contributed editable + POST body independent (browser)

**Same row:** holder `QA-UX-RATIO-AC02`, identity `079900000099`, ratio **40**, contributed **123456789** → green ✓ Submit

| Field | POST body (fetch hook) | HTTP | Code |
|-------|------------------------|------|------|
| `ratioPercent` | **40** | **201** | `XBOS-SHR-201` |
| `contributedValue` | **123456789** | | |

**AC-SHR-02:** **PASS** — independent values sent as entered (not derived).

---

## AC-SHR-03 — F5 / GET persist (API surrogate)

Portal proxy POST + immediate GET list — independent pair persisted:

| Entity | ratio | contributed | GET match |
|--------|-------|-------------|-----------|
| Member `11d2bb7b…` (UF-04 probe) | 40 | 99_000_000 | **PASS** |
| Holding `bad45b73…` (UF-05 probe) | 15 | 123_456_789 | **PASS** |

**AC-SHR-03:** **PASS**

---

## AC-SHR-04 / AC-SHR-05 — Protected regression 🟢

Probe via portal `:5173` proxy (`ceo@xe.vn`, stamp `1781922972405`):

| UF | Scenario | POST | GET persist ratio+contrib | Verdict |
|----|----------|------|---------------------------|---------|
| **UF-XBOS-04** | Member XE_DU_LICH shareholder | **201** `XBOS-SHR-201` | 40 + 99_000_000 | **🟢 PASS** |
| **UF-XBOS-05** | Holding TẬP ĐOÀN UUID path | **201** `XBOS-SHR-201` | 15 + 123_456_789 | **🟢 PASS** |

`resolveShareholderApiEntityKey` / submit pipeline **unchanged** — no regression.

---

## AC-SHR-06 — Invalid ratio rejected

POST `ratioPercent=150` → **400** `XBOS-SHR-400` — **PASS**

---

## Console / scope

- No HTTP **409** scope errors on CC shareholder flow.
- No Vite overlay on `:5173` CC shell (`#root` ~28943 chars).

---

## Residual (not blocking)

| ID | Item | Owner | Note |
|----|------|-------|------|
| R-SHR-03 | Mock fallback `CommandCenterPage.tsx` L2530 still uses `charterCapital×ratio` for offline demo rows | dev-fe low | Out of scope BA delta; only when API fail mock path |
| GWC-8088 | `:8088` VPS not retested | — | **U32** — sponsor did not request deploy; local `:5173` evidence sufficient |

---

## Promoted

- UC-CC-P0-01 shareholder independent fields — **local 🟢**
- UF-XBOS-04 — **🟢** (regression confirmed)
- UF-XBOS-05 — **🟢** (regression confirmed)
- AC-SHR-01..06 — **all PASS** this wave

---

## Handoff

**next_owner:** pm  
**pm_dispatch_hint:** Promote matrix row if needed; optional QC spot on local CC only — no `:8088` unless sponsor requests.
