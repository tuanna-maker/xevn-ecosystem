# QA — QA-HRM-SETTINGS-MD-POS-BROWSER-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-SETTINGS-MD-POS-BROWSER-01` |
| **from_role** | `qa` |
| **to_role** | `pm` / `qc` |
| **execution_date** | `2026-07-27` |
| **spec_ref** | BA `docs/qa/evidence/ba-hrm-settings-master-data-01-20260723.md` **AC-SET-FS-01/03/05** · **FR-HRM-SC-MD-01** / **FR-HRM-SC-POS-01** · writeKey `job_titles` |
| **environment** | Local portal `http://127.0.0.1:5173` · hrm-api `:28001` · xbos-api `:28002` |
| **persona** | `ceo@xe.vn` · `company_id=main` |
| **HOLD_DEPLOY** | **honored** — **no** `:8088` / Phase1 / PROD claim |
| **U65** | zero-seed — **none** (`pnpm seed:*` not run); POS-SEED probe only (expect **403**) |
| **Overall** | **PASS** (bounded Chức danh / POS Settings slice) |
| **Full Settings MD matrix 🟢** | **NOT claimed** |
| **ack_status** | **READY_FOR_QC** |

---

## 0. SoT / N/A decision (explicit)

| Question | Verdict |
|----------|---------|
| Is POS Settings path **N/A** because JT `job_titles` consumer already CLOSED? | **No — not N/A.** Settings has dedicated UI bucket **Chức danh** (`MdBucket=positions`) with `writeKey: 'job_titles'` (`MasterDataSettingsPanel.tsx`). JT wave closed **Recruitment consumer** (AC-SET-FS-03 pick→`position_code`); this WI closes **Settings master-data create** for chức danh. |
| Production SoT for chức danh | XBOS pull + optional HRM extension via Settings CRUD — **not** `tenant-position-catalog` seed |
| POS-SEED reopen? | **Forbidden** — API remains **403** `HRM-CAT-POS-SEED-FORBIDDEN` (BE CLOSED; not reopened) |

---

## 1. Exit criteria map

| # | Exit | Result |
|---|------|--------|
| 1 | Browser U65: Settings MD position/job_titles — create or picker SoT **or** N/A with spec_ref | **PASS create** — `#md-code-positions` → Lưu → POST **201** `category_key=job_titles` → F5 + API `effectiveItems` |
| 2 | Clear residual: PASS promote or FAIL→dev | **PASS promote** (bounded local) — residual POS deferred **CLOSED** for Settings Chức danh |
| 3 | Do not claim full Settings MD matrix 🟢 | **Honored** — decisionTypes / salary / import / fleet still out of this WI |
| 4 | Evidence path | this file + runtime JSON |
| 5 | U65 · HOLD_DEPLOY · no seed | **Honored** |

---

## 2. Click path (U65 FE)

1. Login `ceo@xe.vn` / `Xevn@2026` (portal proxy → XBOS auth)
2. `http://127.0.0.1:5173/hr/settings?portal=1&tenantId=xevn&companyId=main`
3. Tab **Danh mục nghiệp vụ** → **Chức danh**
4. Assert `#md-code-positions` / `data-testid=md-upsert-form-positions` visible (+ FR-HRM-SC-POS-01 copy)
5. Fill mã `QA_POS_2LVZCM` + tên → **Lưu**
6. Network: `POST /api/hrm/settings-catalogs/items` → **201** body `category_key: "job_titles"`, `item_key: "QA_POS_2LVZCM"`
7. F5 → re-open Chức danh → code visible in list
8. GET catalogs → `job_titles.effectiveItems` includes code
9. Empty intercept strip `job_titles|positions|employee_positions` → honest empty / sync CTA (no hardcode bootstrap)
10. Employees form smoke: labels **Chức vụ** + combobox present (picker surface)

**Script:** `node scripts/qa/qa-hrm-settings-md-pos-browser-01.mjs` → exit **0**  
**Runtime:** `docs/qa/evidence/_tmp-qa-hrm-settings-md-pos-browser-01-runtime.json`

---

## 3. AC-SET-FS rollup (Chức danh / POS Settings)

| AC | Verdict | Evidence |
|----|---------|----------|
| **AC-SET-FS-01** catalog options from effectiveItems | **PASS** | Baseline `job_titles=8` then `9` after create; picker keys `job_titles\|positions\|employee_positions` |
| **AC-SET-FS-03** persist **code** not free label | **PASS** | POST `item_key=QA_POS_2LVZCM` · `category_key=job_titles` · F5 + API |
| **AC-SET-FS-05** empty honesty (no fake bootstrap) | **PASS** | Intercept empty → CTA/snapshot honesty; `fakeBootstrap=false` |
| POS-SEED gated | **PASS** | `POST …/seed/tenant-position-catalog` → **403** `HRM-CAT-POS-SEED-FORBIDDEN` |

### Product AC table

| Assert | Verdict | Detail |
|--------|---------|--------|
| Form `#md-code-positions` visible | **PASS** | `hasCode/hasForm/hasBucket=true` |
| POST items **201** writeKey `job_titles` | **PASS** | Network + `writeKeyHint=true` |
| F5 row persists | **PASS** | `QA_POS_2LVZCM` in DOM |
| API `job_titles` has code | **PASS** | `n=9` |
| Empty CTA | **PASS** | amber/CTA path |
| Employees picker surface | **PASS** | `comboboxN=7` · labels `Chức vụ` |
| Seed | none | U65 OK |

---

## 4. L2.5 / journey_l25 (U19)

| J-ID | Journey slice | Click path | HTTP / outcome | Verdict |
|------|---------------|------------|----------------|---------|
| **J-HRM-MENU-SWEEP** (Settings catalogs · Chức danh create) + **UF-HRM-10** | Settings → Danh mục nghiệp vụ → Chức danh → create→201→F5 | Login → `:5173/hr/settings?...` → Chức danh → fill `#md-code-positions` → Lưu → F5 | POST **201** · GET catalogs **200** · code in `job_titles` | **PASS** |

**Related (already CLOSED — not re-run):** JT consumer **J-HRM-05** / AC-SET-FS-03 pick `job_titles` → `position_code` (`QC-HRM-SETTINGS-MD-JT-01` GWC).  
**Leave+dept:** `QC-HRM-SETTINGS-MD-LEAVE-DEPT-01` GWC CLOSED (out of this WI).

---

## Residual

| Item | Severity | Owner | Notes |
|------|----------|-------|-------|
| Full Settings MD matrix 🟢 (decisionTypes, salary, fleet, import, …) | — | pm / later QA | **Not promoted** this WI |
| HOLD_DEPLOY / `:8088` / Phase1 / PROD | standing | pm | Local only |
| Employees create→persist `job_title_key` full UF | P3 optional | qa later | Picker surface PASS; full employee mutate not required to close POS Settings residual |
| POS-SEED / G-ORPH-BE-03 | **CLOSED** | — | 403 confirmed; do **not** reopen |

**cấm complied:** no seed · no invent for happy path · no Phase1/PROD/:8088 · no full matrix 🟢.

---

## Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| Settings Chức danh create→201→F5 · writeKey `job_titles` · empty CTA · POS-SEED 403 | **PRODUCT** | **PASS** — promote bounded local |
| SoT «N/A JT-only» | **Governance** | **Rejected** — Settings CRUD path exists and PASS |
| HOLD_DEPLOY | Governance | Honored |
| Full matrix remaining buckets | Out of scope | Do not green |

---

## Command table

| Command | Exit | Verdict |
|---------|------|---------|
| L0 hrm/xbos/portal probes (in script) | 0 | PASS — 200 on `:28001` / `:28002` / `:5173` |
| `node scripts/qa/qa-hrm-settings-md-pos-browser-01.mjs` | **0** | **PASS** — form · POST 201 · F5 · API · empty CTA · seed 403 · picker smoke |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-settings-md-pos-browser-01-20260727.md` | **0** | **PASS 8/8** |

**Portal URL:** `http://127.0.0.1:5173` · code `QA_POS_2LVZCM`

---

## Prior evidence consumed

| Artifact | Role |
|----------|------|
| `qc-hrm-settings-md-leave-dept-01-20260725.md` | Leave+dept GWC — POS out of scope |
| `qc-hrm-settings-md-jt-01-20260725.md` | JT consumer CLOSED |
| `be-hrm-settings-md-pos-seed-01-20260725.md` | Seed API 403 CLOSED |
| `ba-hrm-settings-master-data-01-20260723.md` | AC-SET-FS + FR-HRM-SC-MD-01 |

---

## Handoff

```yaml
work_item_id: QA-HRM-SETTINGS-MD-POS-BROWSER-01
from_role: qa
to_role: pm
ack_status: READY_FOR_QC
evidence_path: docs/qa/evidence/qa-hrm-settings-md-pos-browser-01-20260727.md
next_owner: qc
completion_report: |
  CLOSED: Settings Chức danh (positions UI → job_titles writeKey) browser U65 —
  #md-code-positions visible → POST settings-catalogs/items 201 category_key=job_titles
  code QA_POS_2LVZCM → F5 + API effectiveItems; empty CTA PASS; POS-SEED remains 403.
  Explicitly NOT N/A JT-only (Settings CRUD path separate from JT consumer J-HRM-05).
  Full Settings MD matrix 🟢 NOT claimed. U65 · HOLD_DEPLOY · no seed.
next_dispatch_prompt: |
  work_item_id: QC-HRM-SETTINGS-MD-POS-01
  from_role: pm
  to_role: qc
  lane: execution
  entry: QA-HRM-SETTINGS-MD-POS-BROWSER-01 READY_FOR_QC · docs/qa/evidence/qa-hrm-settings-md-pos-browser-01-20260727.md · verify:qc:evidence-pack · runtime _tmp-qa-hrm-settings-md-pos-browser-01-runtime.json
  exit: GWC bounded Chức danh/POS Settings local · close residual «POS deferred» · HOLD_DEPLOY · NOT Phase1/PROD/:8088 · NOT full Settings MD matrix 🟢
  cấm: seed · reopen POS-SEED · invent · claim matrix green for leave/JT/decision/salary out-of-scope buckets
```
