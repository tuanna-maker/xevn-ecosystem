# QA — XBOS U72 Field Display R2 (AC-F-XBOS-01..11)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-XBOS-U72-FIELD-DISPLAY-01-R2` · pack repair `QA-XBOS-U72-FIELD-DISPLAY-PACK-01` |
| **alias** | `QA-XBOS-U72-LABEL-02` |
| **from_role** | qa |
| **to_role** | qc |
| **date** | 2026-07-27 |
| **lane** | execution · **U65** zero-seed browser-only · pack Layer B amend (product AC matrix kept) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` |
| **portal** | http://127.0.0.1:5173 · `PORTAL_DEV_URL=http://127.0.0.1:5173` |
| **x-bos-core** | http://127.0.0.1:5176 |
| **seed** | **none** |
| **Constraints** | **U65 zero-seed** · browser-only · **HOLD_DEPLOY** · **NOT** Phase1/PROD · **NOT** `:8088` |
| **Prior QC** | `docs/qa/evidence/qc-xbos-u72-field-display-01-20260727.md` — **NO-GO (process)** · **C-XBOS-U72-PACK-01** |
| **entry FE** | `dev-fe-xbos-u72-f10-holding-path-01-20260727.md` · `dev-fe-xbos-label-02-20260727.md` |
| **prior FAIL** | `qa-xbos-u72-field-display-01-20260727.md` · `qa-xbos-u72-label-01-20260727.md` |
| **runner** | `scripts/qa/qa-xbos-u72-field-display-01-r2.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-qa-xbos-u72-field-display-01-r2-runtime.json` |
| **console** | `docs/qa/evidence/_tmp-qa-xbos-u72-field-display-01-r2-console.txt` |
| **screenshots** | `docs/qa/evidence/screenshots/qa-xbos-u72-field-display-01-r2/` |
| **spec_ref** | `docs/xbos/SRS_FIELD_DISPLAY.md` AC-F-XBOS-01..11 · BR-XBOS-COPY-01 |
| **Rule** | `.cursor/rules/display-label-no-raw-key.mdc` · `.cursor/rules/qc-evidence-pack-gate.mdc` |
| **Overall** | **PASS** (product AC-F-XBOS-01..11 · F-09/F-10 CLOSED) · pack Layer B **8/8** |
| **ack_status** | **READY_FOR_QC** |
| **pack_repair_evidence** | `docs/qa/evidence/qa-xbos-u72-field-display-pack-01-20260727.md` |

## 0. Verdict

| Gate | Result |
|------|--------|
| **AC-F-XBOS-09** (Thuộc khối) | **PASS** — display/select VI; wire `value=general` kept |
| **AC-F-XBOS-10** (Apply Catalog) | **PASS** — `Nguồn tập đoàn: tập đoàn`; no `\bholding\b` / `xevn/holding` in panel; F5 clean; Network `companyId=holding` OK (wire allowed) |
| **AC-F-XBOS-01..08, 11** (spot regression) | **PASS** |
| **Spot AC-H-01/03/04/08/12** | **PASS** (H-04 soft N/A) |
| **Pack Layer B** | **PASS** — command table · L2.5 journey · Residual (verify 8/8) |
| **Overall** | **READY_FOR_QC** — F-09 + F-10 **CLOSED**; 01..11 all **PASS**; wire holding allowed; seed:none; **HOLD_DEPLOY** |

## 1. L0 / session

| Check | Result |
|-------|--------|
| Login API via portal proxy | PASS — `ceo@xe.vn` token |
| Portal `:5173` | 200 |
| x-bos-core `:5176` | 200 |
| Seed / DB mutate | **not used** |

## 2. AC-F-XBOS-01..11 matrix (browser)

| AC | Surface / click path | Observed | Verdict |
|----|----------------------|----------|---------|
| **AC-F-XBOS-01** | `5176/` Organization | No bare orgTypeCode | **PASS** |
| **AC-F-XBOS-02** | same · status | No bare `active`/`inactive` | **PASS** |
| **AC-F-XBOS-03** | `5176/metadata` | No bare meta keys | **PASS** |
| **AC-F-XBOS-04** | `5176/kpi` | frequency/status VI | **PASS** |
| **AC-F-XBOS-05** | `5176/kpi/assign` | VI status labels | **PASS** |
| **AC-F-XBOS-06** | `5176/policy` | status VI | **PASS** |
| **AC-F-XBOS-07** | `5176/policy/summary` | run status VI | **PASS** |
| **AC-F-XBOS-08** | `5173/partners` | type badges VI | **PASS** |
| **AC-F-XBOS-09** | CC infra → Sửa → Tiếp theo×2 → chip PN → Cấu hình khối → Thêm/Sửa field | See §2.1 | **PASS** |
| **AC-F-XBOS-10** | CC `?settings=hrm_catalog_apply_members` → F5 | See §2.2 | **PASS** |
| **AC-F-XBOS-11** | workflow mapper Vite-import | unknown→`—`; pending→Đang chờ; completed→Hoàn thành | **PASS** |

### 2.1 AC-F-XBOS-09 detail (PASS — closes DEF-U72-F09)

- **URL:** `http://127.0.0.1:5173/command-center?settings=company_infrastructure`
- **Click path:** Hạ tầng cơ sở → **Sửa** danh mục nền → **Tiếp theo** ×2 → chip pháp nhân → **Cấu hình khối & trường** → mở form field
- **Assert:**
  - Select «Thuộc khối» display = **Khối Thông tin chung** (not bare `general`)
  - Read-only bind = **Khối Thông tin chung**
  - Options: `Khối Thông tin chung` / `Khối Vị trí & liên hệ` / `Khối Năng lực` — no `general -` prefix
  - Wire `valueAttr=general` retained on select
- **Screenshot:** `f09-infra-custom-fields.png`
- **Residual P2 (not fail):** data-type option text still EN `Text`/`Number`/`Date` (out of F-09 scope; same as prior)

### 2.2 AC-F-XBOS-10 detail (PASS — closes D-XBOS-U72-F10 / DEF-U72-F10)

- **URL:** `http://127.0.0.1:5173/command-center?settings=hrm_catalog_apply_members`
- **Click path:** Command Center → **Áp dụng danh mục HRM** → observe summary → **F5**
- **Before (FAIL R1):** `Nguồn tập đoàn: xevn/holding · version 7 · 4 mục`
- **After (R2):** `Nguồn tập đoàn: tập đoàn · version 7 · 4 mục`
- **F5:** same — no `\bholding\b` / `xevn/holding` in Apply Catalog panel
- **Network (OK wire):** `GET …/api/xbos/config-sync/catalog/job_titles?…&companyId=holding` — **allowed**; display plane mapped
- **Screenshots:** `f10-apply-catalog.png` · `f10-apply-catalog-f5.png`

## 3. Spot AC-H-* + industry

| AC | Result |
|----|--------|
| **AC-H-XBOS-01** | **PASS** — no raw entityLevel keys |
| **AC-H-XBOS-03** | **PASS** — HRM Company no `holding`/`subsidiary` as Ngành nghề |
| **AC-H-XBOS-04** | **PASS** (soft N/A — select not opened; no raw keys) |
| **AC-H-XBOS-08** | **PASS** |
| **AC-H-XBOS-12** | **PASS** (= F-04) |

## 4. L2.5 journey matrix

SoT: `docs/program/PROGRAM_JOURNEY_MAP.md` · **J-XBOS-05** (infra custom fields / F-09) · **J-XBOS-08** (catalog apply / F-10). U19: L2 tab load alone insufficient — promote click-path journeys with explicit verdict rows.

| Journey ID | UF / AC | Click path (portal `:5173`) | Network / observe | Verdict |
|------------|---------|-----------------------------|-------------------|---------|
| **J-XBOS-05** | **AC-F-XBOS-09** · Thuộc khối VI bind | Login `ceo@xe.vn` → CC infra wizard → Sửa → Tiếp theo×2 → chip PN → Cấu hình khối → Thêm/Sửa field | select/readonly **Khối Thông tin chung** · `valueAttr=general` · `displayLeak=[]` | **PASS** |
| **J-XBOS-08** | **AC-F-XBOS-10** · Apply Catalog holding path | CC `?settings=hrm_catalog_apply_members` → observe summary → **F5** | `Nguồn tập đoàn: tập đoàn` · no `\bholding\b` in panel · wire `companyId=holding` **allowed** | **PASS** |
| **J-CC-01** (optional cite) | Login → Command Center | Portal login → `/command-center` | session 2xx | **PASS** (session path) |

**U19 note:** **J-XBOS-05** infra custom-fields journey **PASS** (F-09 CLOSED). **J-XBOS-08** catalog-apply journey **PASS** (F-10 CLOSED). Wire `companyId=holding` is **allowed** on Network — display plane mapped; not a product FAIL.

### Read-only module matrix (XBOS field display / labels)

| Module | Mode | AC / UF | Verdict |
|--------|------|---------|---------|
| Organization / metadata / KPI / policy | **read-only** display | AC-F-XBOS-01..07 | **PASS** |
| Partners type badges | **read-only** display | AC-F-XBOS-08 | **PASS** |
| CC infra · Thuộc khối / custom fields | **read-only** display + form bind | AC-F-XBOS-09 · J-XBOS-05 | **PASS** |
| CC Apply Catalog · Nguồn tập đoàn | **read-only** display | AC-F-XBOS-10 · J-XBOS-08 | **PASS** |
| Workflow mapper labels | **read-only** display | AC-F-XBOS-11 | **PASS** |
| Holding / industry spot AC-H-* | **read-only** display | AC-H-01/03/04/08/12 | **PASS** |

---

## Residual

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| **DEF-U72-F09** | P1 | — | **CLOSED** (AC-F-XBOS-09 PASS · J-XBOS-05) |
| **DEF-U72-F10** / **D-XBOS-U72-F10-HOLDING-PATH** | P0/P1 | — | **CLOSED** (AC-F-XBOS-10 PASS · J-XBOS-08) |
| **R-U72-F09-DATATYPE-EN** | P2 soft | **dev-fe** (defer) | dataType options / meta still EN (`Text`/`Number`/`Date`) — out of F-09 scope; **condition OK** · **no** Dev reopen for PASS F-09 |
| **R-U72-APPLY-JOB-TITLES-PAREN** | P2 soft | **dev-fe** (defer) | Dropdown `Chức danh (job_titles)` on Apply panel — out of AC-F-XBOS-10; **condition OK** |
| **R-U72-CC-TOAST-HOLDING** | P2 soft | **dev-fe** (defer) | Optional CC toast `(holding)` outside Apply `allowed_paths` — **not observed** on Apply Catalog this run; **condition OK** |

---

## Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| AC-F-XBOS-01..11 · F-09/F-10 CLOSED | **PRODUCT** | **PASS** — **no** Dev reopen |
| Wire `companyId=holding` in Network | **PRODUCT OK** | Spec: display plane only — **allowed** |
| Soft P2 EN / job_titles paren / toast | **PRODUCT** P2 soft | **C-XBOS-U72-P2** condition OK on GWC |
| Prior pack missing `command_table` + `journey_l25` + `residual_section` | **PROCESS** | **CLOSED** by PACK-01 Layer B |
| HOLD_DEPLOY · NOT Phase1/PROD/:8088 · seed:none | Governance | Honored |

---

## Command table

| Command | Exit | Verdict |
|---------|------|---------|
| Portal `:5173` / x-bos-core `:5176` health (session L0) | — | **PASS** (HTTP **200**) |
| `node scripts/qa/qa-xbos-u72-field-display-01-r2.mjs` | 0 | **PASS** — runtime `overall: PASS` · `seed: false` · F-09/F-10 probes PASS · `networkWire.companyIdHoldingSeen: true` |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md` | 0 | **PASS** (8/8) after PACK-01 |

**Browser evidence pointers:**  
`docs/qa/evidence/screenshots/qa-xbos-u72-field-display-01-r2/` · `_tmp-qa-xbos-u72-field-display-01-r2-runtime.json` · `_tmp-qa-xbos-u72-field-display-01-r2-console.txt`

**Pack note (PACK-01):** Layer B sections (`## 4. L2.5 journey matrix`, read-only module matrix, `## Residual`, `## Classification`, `## Command table`) added for verifier integrity — product AC-F-XBOS-01..11 **PASS** claims unchanged; closes process condition **C-XBOS-U72-PACK-01** only. No seed. No Dev reopen. **HOLD_DEPLOY** stands.

---

## 5. completion_report

**Closed (process):** PACK-01 Layer B — command table (runner exit **0**) + `## L2.5 journey matrix` with **J-XBOS-05** `| **PASS**` (F-09) + **J-XBOS-08** `| **PASS**` (F-10) + `## Residual` (P2 soft + F-09/F-10 **CLOSED**) → `verify:qc:evidence-pack` **8/8**. Seed **none**. HOLD_DEPLOY · NOT Phase1/PROD/:8088.

**Kept (product):** AC-F-XBOS-01..11 all **PASS**; F-09 + F-10 **CLOSED**; wire `companyId=holding` **allowed**; soft P2 residuals condition OK.

**Open:** Soft P2 only (EN dataType · job_titles paren · optional CC toast) — **no** Dev reopen for PASS AC rows.

## 6. Handoff

### next_owner

`qc`

### next_dispatch_prompt

```text
work_item_id: QC-XBOS-U72-FIELD-DISPLAY-01
from_role: pm
to_role: qc
lane: governance · re-gate after pack repair · expect GWC
entry_criteria:
  - Prior NO-GO (process): docs/qa/evidence/qc-xbos-u72-field-display-01-20260727.md · C-XBOS-U72-PACK-01
  - Pack repair DONE: docs/qa/evidence/qa-xbos-u72-field-display-pack-01-20260727.md
  - Patched QA MD: docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md · ack READY_FOR_QC · verify 8/8
  - Product: AC-F-XBOS-01..11 PASS · F-09/F-10 CLOSED · wire companyId=holding allowed
  - U65 · HOLD_DEPLOY · seed:none · no Dev reopen for PASS AC rows
exit_criteria:
  1) Re-run verify:qc:evidence-pack → 8/8; close C-XBOS-U72-PACK-01 (process)
  2) Product gate: expect GO WITH CONDITIONS — C-XBOS-U72-P2 (EN dataType · job_titles paren · CC toast soft)
  3) Keep HOLD_DEPLOY · NOT Phase1/PROD/:8088; wire holding = OK (C-XBOS-U72-WIRE-OK)
  4) Do NOT reopen Dev for PASS F-09/F-10
evidence_path: docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md
cấm: seed · Dev reopen PASS label surfaces · Phase1/PROD/:8088 claim
```

### evidence_path

`docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md`

### ack_status

**READY_FOR_QC**

### pm_dispatch_hint

`QC-XBOS-U72-FIELD-DISPLAY-01` re-gate — close **C-XBOS-U72-PACK-01** (pack 8/8) · expect **GWC** local + **C-XBOS-U72-P2** · HOLD_DEPLOY
