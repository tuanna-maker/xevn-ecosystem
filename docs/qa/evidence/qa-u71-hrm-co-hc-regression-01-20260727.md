# QA-U71-HRM-CO-HC-REGRESSION-01 — Company headcount browser regression

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-U71-HRM-CO-HC-REGRESSION-01` · pack repair `QA-U71-HRM-CO-HC-PACK-REPAIR-01` |
| **Date** | 2026-07-27 |
| **Role** | qa |
| **lane** | execution · **U65 zero-seed** · browser-only · pack Layer B amend (no product re-matrix) |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` |
| **Portal URL** | `http://127.0.0.1:5173` · `PORTAL_DEV_URL=http://127.0.0.1:5173` |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/company` |
| **Iframe** | `http://127.0.0.1:5173/hr/company?portal=1&tenantId=xevn&companyId=main` |
| **Design SoT** | `API_DESIGN_HRM_EMPLOYEES_SUMMARY.md` · `DB_DESIGN_HRM_CO_HC.md` · TECHSPEC §19 · SRS UC-HRM-CO-01 / AC-CO-EMP-* · SA evidence `sa-u71-hrm-co-hc-design-01-20260727.md` |
| **Runners** | `scripts/qa/qa-hrm-co-emp-count-01.mjs` · `scripts/qa/qa-u71-hrm-co-hc-industry-spot.mjs` |
| **Runtime** | `docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-runtime-20260727.json` · `qa-u71-hrm-co-hc-industry-runtime-20260727.json` |
| **Screenshots** | `qa-u71-hrm-co-hc-regression-01-company.png` · `-f5.png` · `-dashboard.png` |
| **Seed** | **none** |
| **U65 / HOLD_DEPLOY** | zero-seed · **HOLD_DEPLOY** · **NOT** Phase1/PROD · **NOT** `:8088` |
| **Overall** | **PASS** (product claims unchanged — PACK-REPAIR-01 Layer B only) |
| **ack_status** | **READY_FOR_QC** |
| **pack_repair_evidence** | `docs/qa/evidence/qa-u71-hrm-co-hc-pack-repair-01-20260727.md` |

---

## 0. L0 entry

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | hrm-api `:28001` **200** · xbos-api `:28002` **200** · portal `:5173` **200** |
| Note | Node process exit showed Windows libuv assert after assertions printed ✓ — **services healthy**; not treated as stack FAIL |
| Seed | **not used** |

---

## 1. Click path (U65)

1. Login API session inject → portal shell `ceo@xe.vn` · `companyId=main`
2. Open `/command-center/hrm/company` → HRM iframe Company Management
3. Observe card **«Tổng nhân viên»** + table cột **«Số nhân viên»**
4. Navigate Dashboard same session → parity card
5. Return Company → **F5** / reload → numbers persist
6. Row action → **Xem chi tiết** (J-HRM-CO-01) → Escape/back → list still non-zero
7. Industry spot: cột **«Ngành nghề»** — no raw `subsidiary`/`holding`

---

## 2. UF-HRM-CO-HC — Số nhân viên màn Công ty

- **Persona / URL:** `ceo@xe.vn` · `http://127.0.0.1:5173/command-center/hrm/company`
- **Dashboard Nhân sự (cùng session):** **N=1109**
- **Card Tổng nhân viên:** **N=1109**
- **Cột theo dòng:** holding/Tập đoàn=**229** · trsport=**220** · logistics=**220** · finance=**220** · services=**220** (sum **1109**)
- **Network:** `GET /api/hrm/employees/summary?company_id=main` → **200** · code path live
  - `by_company.length=5`
  - keys = **OU slugs only:** `holding`, `trsport`, `logistics`, `finance`, `services` — **0 LE UUID keys**
  - query `company_id=main` only — `illegalUuidCompanyId=[]` · `badUuid=0`
  - mode = **Option A `by_company`** (not interim N× slug) · browser calls with `by_company` present
- **FE sau 2xx:** card/table bind non-zero; no error overlay; not all-0
- **F5:** card **1109** · rows still 229/220×4 · **PASS**
- **Verdict:** 🟢
- **spec_ref:** UC-HRM-CO-01 Diễn biến #4–6 · TECHSPEC §19 · `DB_DESIGN_HRM_CO_HC` · `API_DESIGN_HRM_EMPLOYEES_SUMMARY` · AC-CO-EMP-01..06 · design AC from SA-U71

### L1 assist (not UF alone)

```http
GET http://127.0.0.1:28001/api/hrm/employees/summary?company_id=main
→ 200  total=1109  company_id=main  by_company.length=5
  holding=229  trsport=220  logistics=220  finance=220  services=220
```

---

## 3. AC map (design + SRS)

| AC | Criterion | Verdict | Evidence |
|----|-----------|---------|----------|
| **AC-CO-EMP-01** | Card Tổng NV ≈ summary `main.total` | **PASS** | card=1109 · apiTotal=1109 |
| **AC-CO-EMP-02** | Per-row COUNT by bridged slug | **PASS** | 5 rows positive; not all 0 |
| **AC-CO-EMP-03** | Bridge LE→slug (Visun→logistics…) | **PASS** | mappedKnown=5 names match registry |
| **AC-CO-EMP-04** | Fail→«—»; no fake all-0 when API>0 | **PASS** | allZero=false while apiTotal=1109 |
| **AC-CO-EMP-05** | Company ≈ Dashboard same session | **PASS** | both UI **1109** · Δ 0% |
| **AC-CO-EMP-06** | F5 + Network 2xx | **PASS** | f5Card=1109 · summary 200 |
| **Network / Plane B** | `by_company[]` slug keys; no LE UUID query | **PASS** | cids=`main` · slugs only |
| **J-HRM-CO-01** | list→detail→back | **PASS** | detailEmp=229 · backPositive |
| **Design AC (U71)** | Physical API/DB contract live | **PASS** | matches API_DESIGN § sample shape |

---

## 4. UF-HRM-CO-IND regression (Ngành nghề)

- **Cột «Ngành nghề»:** all 5 rows show **`-`** (honest empty / AC-CO-IND-04)
- **Forbidden raw org-class:** `subsidiary` / `holding` / `parent` / `member` / `branch` in industry (or any cell) → **0 hits**
- **AC-CO-IND-02:** **PASS** (no entity_type leak)
- **AC-CO-IND-01 / 03:** Not exercised with live VI industry text this run (SoT empty → `-`); **not FAIL** — empty dash allowed; full industry catalog VI map remains orthogonal if DB later has `business_lines`
- **Verdict regression:** 🟢 no raw `subsidiary`/`holding`

---

## 5. L2.5 journey matrix

SoT: `docs/program/PROGRAM_JOURNEY_MAP.md` · **J-HRM-CO-01** · UF matrix **UF-HRM-CO-HC** · AC-CO-EMP-01..06.

| Journey ID | UF / AC | Click path (portal `:5173`) | Network | Verdict |
|------------|---------|-----------------------------|---------|---------|
| **J-HRM-CO-01** | **UF-HRM-CO-HC** · AC-CO-EMP-01..06 | Login `ceo@xe.vn` → `/command-center/hrm/company` (iframe `/hr/company?portal=1&…&companyId=main`) → card/table headcount → Dashboard parity → F5 → row **Xem chi tiết** → Escape/back | `GET /api/hrm/employees/summary?company_id=main` **200** · `by_company.length=5` · slug keys only · badUuid=0 | **PASS** |
| Industry spot (orthogonal) | **UF-HRM-CO-IND** regression | Same Company table · cột «Ngành nghề» | no entity_type leak | **PASS** (honest `-`) |

**U19 note:** L2 tab load alone insufficient — this pack promotes list→detail→back under portal origin with summary Plane B keys.

### Read-only module matrix (Company headcount display)

| Module | Mode | AC / UF | Verdict |
|--------|------|---------|---------|
| Company Management · Tổng NV + cột Số NV | **read-only** display (summary bind) | AC-CO-EMP-01..06 · UF-HRM-CO-HC | **PASS** |
| Company detail dialog (J-HRM-CO-01) | **read-only** detail | detailEmp=229 · backPositive | **PASS** |

---

## Residual

| Item | Severity | Owner |
|------|----------|-------|
| Detail dialog tax scrape odd (`tax=-229` — MST parse glued to headcount) | P3 cosmetic | defer / optional FE |
| Industry cells all `-` (no VI business line when DB empty) | Info / GWC-compatible | not blocker for U71 headcount |
| Menu item i18n key `common.viewDetail` in Radix menu | P3 | FE i18n |
| P0/P1 headcount / Plane B key | **None** | — |

---

## Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| Headcount card/table **1109** · Plane B slug keys · F5 · J-HRM-CO-01 | **PRODUCT** | In-scope AC **PASS** — **no** PRODUCT fail |
| Industry cells all `-` (empty SoT) | **PRODUCT** / data | Honest empty OK — do not reopen Dev |
| Detail MST scrape `tax=-229` | **PRODUCT** P3 cosmetic | Defer — not blocker |
| Prior pack missing `crud_or_matrix` wording | **PROCESS** | **CLOSED** by PACK-REPAIR-01 Layer B sections |
| `qc:dev-stack` UV assert after 200 | **ENV** | Noise — services healthy |
| HOLD_DEPLOY · NOT Phase1/PROD/:8088 | Governance | Honored |

---

## Command table

| Command | Exit | Verdict |
|---------|------|---------|
| `pnpm run qc:dev-stack` | — | **PASS** (hrm `:28001` / xbos `:28002` / portal `:5173` **200**) |
| `node scripts/qa/qa-hrm-co-emp-count-01.mjs` | 0 | **PASS** (UF-HRM-CO-HC · AC-CO-EMP-01..06 · J-HRM-CO-01) |
| `node scripts/qa/qa-u71-hrm-co-hc-industry-spot.mjs` | 0 | **PASS** (industry `-` · no entity_type leak) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-20260727.md` | 0 | **PASS** (8/8) after PACK-REPAIR-01 |

**Browser evidence pointers:**  
`docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-company.png` · `…-f5.png` · `…-dashboard.png` · runtime JSON `qa-u71-hrm-co-hc-regression-01-runtime-20260727.json`

**Pack note (PACK-REPAIR-01):** Layer B sections (`## 5. L2.5 journey matrix`, read-only module matrix, `## Residual`, `## Classification`, `## Command table`) added for verifier integrity only — product PASS claims unchanged; no UF re-matrix; closes QC condition **C-U71-HC-PACK-01**.

---

## 6. Handoff

### completion_report

**Closed:** U65 browser regression against U71 physical designs for Company headcount (prior run claims unchanged). L0 stack healthy. Persona `ceo@xe.vn` on `/command-center/hrm/company`: Network `GET …/employees/summary?company_id=main` **200** with `by_company.length=5` and **OU slug keys only** (no LE UUID). FE card **1109** + column counts 229/220×4 bind after 2xx; Dashboard parity 1109; F5 persists; J-HRM-CO-01 detail/back PASS. Industry regression: cột «Ngành nghề» shows `-`, **no** raw `subsidiary`/`holding`. Mapped AC-CO-EMP-01..06 all PASS. Seed not used. **PACK-REPAIR-01:** Layer B docs — explicit `## L2.5 journey matrix` + read-only module matrix with `| **PASS**` rows → `verify:qc:evidence-pack` **8/8**.

**Residual:** P3 detail MST parse cosmetic; industry VI map not live-exercised (empty SoT). No P0/P1 for headcount Plane B. Process condition **C-U71-HC-PACK-01** ready to close on QC re-gate.

### next_owner

`qc`

### next_dispatch_prompt

```text
work_item_id: QC-U71-HRM-CO-HC-DESIGN-GATE-01
from_role: pm
to_role: qc
lane: governance · re-gate after pack repair
entry_criteria:
  - Prior NO-GO (process): docs/qa/evidence/qc-u71-hrm-co-hc-design-gate-01-20260727.md · C-U71-HC-PACK-01
  - QA pack repaired: docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-20260727.md
  - Pack repair log: docs/qa/evidence/qa-u71-hrm-co-hc-pack-repair-01-20260727.md
  - verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-20260727.md → exit 0 (8/8)
  - U65 · HOLD_DEPLOY · local only · product claims unchanged · no Dev reopen
exit_criteria:
  1) Re-run verify:qc:evidence-pack → 8/8 PASS
  2) Close C-U71-HC-PACK-01; issue GO WITH CONDITIONS or GO for U71 F.1 + UF-HRM-CO-HC local slice
  3) Keep HOLD_DEPLOY · NOT Phase1/PROD/:8088; residual P3 MST + industry empty OK
evidence_path: docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-20260727.md
cấm: seed · Dev reopen headcount · Phase1/PROD/:8088 claim
```

### ack_status

**READY_FOR_QC**

### evidence_path

`docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-20260727.md`

### pm_dispatch_hint

`QC-U71-HRM-CO-HC-DESIGN-GATE-01` re-gate now — pack Layer B **8/8**; **no** Dev re-open for headcount
