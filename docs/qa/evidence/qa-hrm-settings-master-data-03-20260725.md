# QA-HRM-SETTINGS-MASTER-DATA-03 — Settings MD leave/dept form vis + create→F5

| Field | Value |
|-------|--------|
| **Date** | 2026-07-25 |
| **Role** | qa |
| **work_item_id** | `QA-HRM-SETTINGS-MASTER-DATA-03` · pack amend `QA-HRM-SETTINGS-MASTER-DATA-03-PACK-01` |
| **FE entry** | `docs/qa/evidence/dev-fe-hrm-settings-md-form-vis-01-20260725.md` (`READY_FOR_QA`) |
| **Prior** | `docs/qa/evidence/qa-hrm-settings-master-data-02-20260725.md` (PARTIAL — `#md-code-*` missing) |
| **L0 stab** | `docs/qa/evidence/devops-hrm-settings-md-l0-stab-01-20260725.md` — HRM `:28001` = `dist-uat-w6` PID 14896 |
| **Env** | local 1B · portal `:5173/hr` embed · hrm-api `:28001` · xbos `:28002` · HRM FE `:8080` (not primary origin) |
| **Portal URL** | `http://127.0.0.1:5173/hr/settings?portal=1&tenantId=xevn&companyId=main` · `PORTAL_DEV_URL=http://127.0.0.1:5173` |
| **U65** | browser-only · zero-seed · **HOLD_DEPLOY** · **NOT** Phase1/PROD · **NOT** `:8088` |
| **W6** | Respect `dist-uat-w6` freeze — **no wipe / no nest rebuild** against `:28001` |
| **Overall (in-scope AC)** | **PASS** (product claims unchanged — PACK-01 docs Layer B only) |
| **Full Settings MD matrix 🟢** | **NOT claimed** (JT residual proxy P2 + POS notes still open) |
| **ack_status** | **READY_FOR_QC** |

---

## 0. L0 / environment

| Check | Result | Note |
|-------|--------|------|
| `pnpm run qc:dev-stack` (first) | **PARTIAL script** | hrm **200** · portal **200** · xbos **fail** initially; Node UV assert on Windows exit |
| Re-probe before UF | **PASS** | hrm **200** · portal **200** · xbos **200** (login 201) |
| HRM process | **PASS** | PID **14896** `dist-uat-w6` (devops L0-STAB) — not touched |
| Seed | **not used** | U65 |

**Origin lock (JT proven):** UF via `http://127.0.0.1:5173/hr/settings?portal=1&tenantId=xevn&companyId=main` so `/api/hrm` proxies to `:28001`. Direct `:8080` remains P2 residual (vite default `:3001`) — not used for promote.

Runtime: `docs/qa/evidence/_tmp-qa-hrm-settings-master-data-03-runtime.json`  
Script: `scripts/qa/qa-hrm-settings-master-data-03.mjs`

---

## 1. Exit criteria (dispatch AC)

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Settings → Danh mục nghiệp vụ → Loại nghỉ: `#md-code-leaveTypes` visible → Lưu → POST `settings-catalogs/items` **2xx** → F5 còn | **PASS** | Form + `data-testid=md-upsert-form-leaveTypes`; code `QA_LVT_09VGO4`; POST **201**; F5 text includes code |
| 2 | Same Phòng ban `#md-code-departments` | **PASS** | Form visible; code `QA_DEPT_9VQQ5`; POST **201**; F5 còn |
| 3 | Regression: leave/dept empty CTA; dept picker value=code | **PASS** | Catalog-strip intercept → amber CTA leave+dept, `fake8=[]`; picker options `DEPT_01…` / `QA_DEPT_*`, trigger shows **code** |
| 4 | Do not claim full Settings MD matrix 🟢 | **PASS (discipline)** | JT proxy P2 + POS notes remain **open** — promote only AC 1–3 |
| 5 | Unit form-vis + picker | **PASS** | vitest **22/22** (`MasterDataSettingsPanel` 5 + `catalogSearchPicker` 17) |

### Network (portal origin)

| Method | Path | Status | Note |
|--------|------|--------|------|
| POST | `/api/hrm/settings-catalogs/items` | **201** | leave `QA_LVT_09VGO4` |
| POST | `/api/hrm/settings-catalogs/items` | **201** | dept `QA_DEPT_9VQQ5` |
| GET | `/api/hrm/settings-catalogs?company_id=main` | **200** | baseline leave=4 dept=4 before create |

### Click path (AC1/AC2)

1. Login API `ceo@xe.vn` → inject portal session  
2. Goto portal `/hr/settings?portal=1&tenantId=xevn&companyId=main`  
3. Native click **Danh mục nghiệp vụ** → **Loại nghỉ** / **Phòng ban**  
4. Assert `#md-code-leaveTypes` / `#md-code-departments` in DOM (visible)  
5. Fill mã + tên → **Lưu** → wait POST 201  
6. F5 / reload → re-open bucket → code still in body text  

---

## 2. AC-SET-FS rollup (promoted slice only)

| Field | Create→2xx→F5 | Empty CTA | value=code | Field verdict |
|-------|---------------|-----------|------------|---------------|
| Loại nghỉ | **PASS** live | **PASS** (intercept) | — | **PASS** (this wave AC) |
| Phòng ban | **PASS** live | **PASS** (intercept) | **PASS** live picker | **PASS** (this wave AC) |
| Chức danh / POS-SEED | — | — | — | **not promoted** |
| JD templates / JT | — | — | — | residual **OPEN** (prior JT browser PASS on portal; direct `:8080` P2) |

Prior MASTER-DATA-02 blockers (`#md-code-*` missing) — **CLOSED** by FE FORM-VIS + this live UF.

---

## 3. What was NOT done / cấm respected

- No `pnpm seed:*` / invent catalog SoT  
- No wipe / rebuild `dist-uat-w6`  
- No Phase1 / PROD / `:8088` claim  
- No full Settings MD matrix 🟢  
- Empty CTA used **request intercept** (strip JSON) — not DB wipe  
- **PACK-01:** docs Layer B amend only — **no** UF re-run; product AC claims unchanged  

---

## L2.5

SoT: `docs/program/PROGRAM_JOURNEY_MAP.md` · **J-HRM-MENU-SWEEP** (Settings catalogs leaf) · UF matrix **UF-HRM-10** (settings catalog item create/persist).

| Journey ID | UF / map | Click path (portal `:5173`) | Network | Verdict |
|------------|----------|-----------------------------|---------|---------|
| **J-HRM-MENU-SWEEP** (Settings → Danh mục nghiệp vụ · leave + dept create slice) | **UF-HRM-10** create slice | Login `ceo@xe.vn` → `/hr/settings?portal=1&tenantId=xevn&companyId=main` → **Danh mục nghiệp vụ** → **Loại nghỉ** / **Phòng ban** → fill `#md-code-*` → **Lưu** → F5 → re-open bucket | POST `/api/hrm/settings-catalogs/items` **201** (leave `QA_LVT_09VGO4` · dept `QA_DEPT_9VQQ5`); GET catalogs **200** | **PASS** |
| JT / POS journeys | separate WI | out of scope this pack | — | **not claimed** |

**U19 note:** L2 tab load alone insufficient — this pack promotes create→POST 201→F5 under portal origin (not direct `:8080`).

---

## Residual

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| JT / HRM FE direct `:8080` proxy `:3001` → 500 | P2 | devops / fe | ENV — use portal `:5173` for UF; not in-scope product AC fail |
| POS-SEED / dual SoT notes | P2 | be (open from prior) | Seed HTTP already 403; registry residual — **not greened** |
| Full Settings MD matrix 🟢 | — | pm / qa later | Only after JT+POS residuals closed or waived — **not greened** this wave |

---

## Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| Leave + dept form vis · POST **201** · F5 · empty CTA · dept value=code (portal `:5173`) | **PRODUCT** | In-scope AC **PASS** — **no** PRODUCT fail in this WI |
| Direct HRM FE `:8080` proxy `:3001` → 500 | **ENV** | P2 residual open — **GWC condition** candidate; portal UF path PASS |
| POS-SEED / full Settings MD matrix 🟢 | **Governance / out of scope** | Standing — do not green matrix |
| HOLD_DEPLOY · NOT Phase1/PROD/:8088 | Governance | Honored |

---

## Command table

| Command | Exit | Verdict |
|---------|------|---------|
| `pnpm run qc:dev-stack` | — | PARTIAL script then re-probe **PASS** (hrm/portal/xbos **200**) |
| `node scripts/qa/qa-hrm-settings-master-data-03.mjs` | 0 | **PASS** (AC1/AC2 POST 201 + F5) |
| `pnpm --filter web-portal exec vitest run` (MasterDataSettingsPanel + catalogSearchPicker) | 0 | **PASS** **22/22** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-settings-master-data-03-20260725.md` | 0 | **PASS** (8/8) after PACK-01 |

**Portal URL:** `http://127.0.0.1:5173` · `PORTAL_DEV_URL=http://127.0.0.1:5173`

**Pack note (PACK-01):** Layer B sections (`## L2.5`, `## Residual`, `## Classification`, `## Command table`) added/renamed for verifier integrity only — product PASS claims unchanged; no UF re-matrix.

---

## 5. Handoff

- **ack_status:** `READY_FOR_QC`
- **next_owner:** `qc`
- **evidence_path:** `docs/qa/evidence/qa-hrm-settings-master-data-03-20260725.md`

### completion_report

**Closed:** Product AC leave+dept (prior run) unchanged PASS — form vis `#md-code-*`, POST **201** + F5, empty CTA, dept value=code, unit 22/22. **PACK-01:** Layer B docs — `## L2.5` **J-HRM-MENU-SWEEP** + **UF-HRM-10** PASS row; `## Residual` (singular); `## Classification` PRODUCT none-fail / ENV proxy P2; `## Command table` — expect `verify:qc:evidence-pack` **8/8**.

**Open / not promoted:** Full Settings MD matrix 🟢; JT direct-`:8080` proxy P2 (ENV); POS-SEED notes. Close process condition **C-LEAVE-DEPT-QA-PACK-01** on QC re-gate.

### next_dispatch_prompt

```text
work_item_id: QC-HRM-SETTINGS-MD-LEAVE-DEPT-01
from_role: pm
to_role: qc
lane: governance
entry_criteria: QA READY_FOR_QC docs/qa/evidence/qa-hrm-settings-master-data-03-20260725.md · verify:qc:evidence-pack exit 0 (8/8 PACK-01) · prior NO-GO process C-LEAVE-DEPT-QA-PACK-01 · U65 · HOLD_DEPLOY · local only · product AC claims unchanged
exit_criteria:
  (1) Re-gate leave+dept only — expect GO WITH CONDITIONS (ENV C-LEAVE-DEPT-PROXY-8080-01 P2 direct :8080; close C-LEAVE-DEPT-QA-PACK-01)
  (2) Confirm PRODUCT leave+dept AC PASS via portal :5173; cấm full Settings MD matrix 🟢 · Phase1/PROD/:8088 · seed
  (3) JT/POS remain out of scope (separate QC-HRM-SETTINGS-MD-JT-01)
evidence_path: docs/qa/evidence/qc-hrm-settings-md-leave-dept-01-20260725.md
```
