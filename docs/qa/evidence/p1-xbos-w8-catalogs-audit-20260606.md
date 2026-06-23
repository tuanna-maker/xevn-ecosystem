# QA evidence — P1-XBOS-W8-CATALOGS-AUDIT (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-XBOS-W8-CATALOGS-AUDIT` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status** | **FAIL_TO_PM** |
| **executed_at** | 2026-06-06 |
| **environment** | `http://localhost:5173` · `ceo@xe.vn` / `Xevn@2026` · xbos-api `:28002` · hrm-api `:28001` |
| **journey** | **J-XBOS-11** — Văn bản / Đo lường / Giá: edit → 800ms debounce → consumer sync + F5 DB persist (U34) |
| **mental_model** | `docs/program/XBOS_CC_BUSINESS_MENTAL_MODEL.md` §1b U34, §7 J-XBOS-11 |

## Executive summary

| Tab (settings=) | Inline edit without F5 | F5 / reload persist from DB | Verdict |
|-----------------|--------------------------|-----------------------------|---------|
| **document** (Văn bản) | **PASS** — controlled input updates list row in place | **FAIL** — reverts to hardcoded seed (`Quy định An toàn lao động`) | **FAIL** |
| **measurement** (Đo lường) | **PASS** — `QA-W8-KM-20260606` visible immediately after edit | **FAIL** — F5 reverts to seed `Km` | **FAIL** |
| **pricing** (Giá) | **PASS** — `QA-W8-PRICE-20260606` visible immediately after edit | **FAIL** — F5 reverts to seed `Giá chuẩn xe tải hạng A` / `14500` | **FAIL** |

**J-XBOS-11 overall: FAIL** — U34 consumer sync **partial** (same-tab inline edit OK); **DB round-trip FAIL** on all three catalogs.

**Root cause (P0):** `scope_parity` — group CEO JWT `companyId=main` **writes** `command_center_catalogs` to partition `main`, **reads** via `resolveXbosGroupLegalReadScopeContext` → `holding`. PUT **201** but GET list empty → FE falls back to `useState` hardcoded seed rows.

---

## Environment traceability

| Service | Port | Health |
|---------|------|--------|
| web-portal | 5173 | HTTP 200 |
| hrm-api | 28001 | `GET /api/hrm` → 200 |
| xbos-api | 28002 | `GET /api/xbos` → 200 |

**Persona:** Group CEO · JWT `tenantId=xevn`, `companyId=main`.

---

## Commands executed

| # | Command | Exit | Notes |
|---|---------|------|-------|
| 1 | `pnpm run qc:dev-stack` | **0** | L0 |
| 2 | `pnpm run qc:fe-be-health` | **0** | 8/8 PASS |
| 3 | `node scripts/tmp-p1-w8-catalog-audit-probe.mjs` | **1** | 3/3 kinds FAIL read-back after PUT |
| 4 | `node scripts/tmp-p1-w8-catalog-scope-probe.mjs` | **0** | PUT save@**main**, GET readScope=**holding**, readVal null |
| 5 | MCP browser — `?settings=document|measurement|pricing` | — | J-XBOS-11 U34 inline + F5 |

---

## API scope parity (deterministic)

```
PUT /business-master/command_center_catalogs/items/regulations
  → HTTP 200 XBOS-MASTER-201 · saved company_id=main

GET /business-master/command_center_catalogs/items?tenantId=xevn&companyId=main
  → HTTP 200 · response companyId=holding · items=[] · regulations missing

Repeat for measurements, pricing → same pattern (fails=3/3)
```

**Code reference:** `business-master.controller.ts` — `listDomainItems` uses `resolveXbosGroupLegalReadScopeContext` (→ `holding`); `resolveWriteScope` for `command_center_catalogs` uses plain `resolveScopeContext` (→ `main`). Only `dept_system_templates` uses `resolveXbosGroupLegalMutationScopeContext`.

**Prior art:** Same class as **D-W5-HRM-CAT-SYNC-01** (settings-catalogs holding/main mismatch).

---

## J-XBOS-11 — Browser click paths

### Tab 1 — Văn bản (`?settings=document`)

| Step | Action | Result |
|------|--------|--------|
| 1 | Navigate Settings → Hệ thống văn bản/Quy định | Table 2 seed rows (QĐ-ATLD, QĐ-DL) |
| 2 | Edit row1 title → `QA W8 Doc Edit 20260606` (browser_fill) | **PASS** — list input shows new value without F5 |
| 3 | Navigate away + `?settings=document` reload (F5 class) | **FAIL** — title back to `Quy định An toàn lao động` (seed) |

### Tab 2 — Đo lường (`?settings=measurement`)

| Step | Action | Result |
|------|--------|--------|
| 1 | Open tab | Seed: DISTANCE unit `Km`, FUEL `Lít` |
| 2 | Edit DISTANCE unit → `QA-W8-KM-20260606`, wait ≥800ms | **PASS** — list shows `QA-W8-KM-20260606` without F5 |
| 3 | F5 `?settings=measurement` | **FAIL** — unit reverts to `Km` |

### Tab 3 — Giá (`?settings=pricing`)

| Step | Action | Result |
|------|--------|--------|
| 1 | Open tab | Seed: PRC-FLEET-A label `Giá chuẩn xe tải hạng A`, amount `14500` |
| 2 | Edit label → `QA-W8-PRICE-20260606`, wait ≥800ms | **PASS** — list shows new label without F5 |
| 3 | F5 `?settings=pricing` | **FAIL** — label reverts to `Giá chuẩn xe tải hạng A` |

**Add row:** No **Thêm dòng** control on any of the three tabs — edit-only of seed rows (see D-W8-CAT-ADD-ROW-01).

**Save UX:** Silent 800ms debounce auto-save (no toast). Failure is silent — no error banner when GET returns empty.

---

## Defects

| ID | P | Owner | Symptom | Root cause | Fix hint |
|----|---|-------|---------|------------|----------|
| **D-W8-CAT-SCOPE-01** | **P0** | **dev-be** | PUT 201 all 3 kinds; GET list empty for group CEO | Write `company_id=main`, read remapped to `holding` | Extend `resolveWriteScope` to use `resolveXbosGroupLegalMutationScopeContext` for domain `command_center_catalogs` (mirror `dept_system_templates` fix) + regression spec |
| **D-W8-CAT-SEED-01** | **P1** | **dev-fe** | F5 shows plausible seed data user thinks is DB | `CommandCenterPage.tsx` `useState` hardcoded rows; hydrate `if (rows.length) set*` skips update when API empty | Empty-state or error banner when load returns 0 rows; do not present seed as SoT (`COMMAND_CENTER_P0_SRS.md`) |
| **D-W8-CAT-ADD-ROW-01** | **P2** | **dev-fe** | Cannot add catalog row — edit seed only | No add-row UI in document/measurement/pricing panels | BA/PM: confirm SRS add-row AC; implement if in scope |

---

## Residual / not promoted

- J-XBOS-11 **not promoted** — blocked on D-W8-CAT-SCOPE-01.
- Tab-switch without F5 (leave document → workflow → back): in-session React state may retain edits until full reload; **not** a substitute for DB persist — still FAIL on F5.
- Retest after dev-be fix: run `tmp-p1-w8-catalog-audit-probe.mjs` exit 0 + browser F5 on all 3 tabs.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | J-XBOS-11 audited 3/3 tabs on localhost:5173. Inline edit without F5 **PASS** all tabs. F5 DB persist **FAIL** all tabs — scope_parity write main/read holding. API probe 3/3 FAIL read-back. Defects filed: D-W8-CAT-SCOPE-01 (be P0), D-W8-CAT-SEED-01 (fe P1), D-W8-CAT-ADD-ROW-01 (fe P2). |
| **next_owner** | `dev-be` (P0 scope fix) → `dev-fe` (seed fallback) → `qa` retest |
| **evidence_path** | `docs/qa/evidence/p1-xbos-w8-catalogs-audit-20260606.md` |
| **ack_status** | **FAIL_TO_PM** |

### next_dispatch_prompt

```
work_item_id: P1-XBOS-W8-CAT-BE-FIX
from_role: pm
to_role: dev-be
lane: execution

QA FAIL docs/qa/evidence/p1-xbos-w8-catalogs-audit-20260606.md — D-W8-CAT-SCOPE-01 P0. Group CEO ceo@xe.vn: PUT command_center_catalogs saves company_id=main but GET list uses holding partition → empty → UI F5 reverts to seed. Fix business-master.controller resolveWriteScope for domain command_center_catalogs to use resolveXbosGroupLegalMutationScopeContext (same as dept_system_templates). Add controller spec + scope parity test. Exit: node scripts/tmp-p1-w8-catalog-audit-probe.mjs exit 0. ack_status READY_FOR_QA.
```
