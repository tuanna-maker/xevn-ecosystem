# QA-HRM-SETTINGS-MD-JT-01 — Job Templates `position_code` catalog SoT (browser UF)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-25 |
| **Role** | qa |
| **work_item_id** | `QA-HRM-SETTINGS-MD-JT-01` |
| **pack_fix** | `QA-HRM-SETTINGS-MD-JT-01-PACK-01` — Layer B Command table + L2.5 (no product re-matrix) |
| **Depends on** | `D-HRM-SETTINGS-MD-JT-FE-01` · `D-HRM-SETTINGS-MD-JT-BE-01` |
| **Browser support** | `docs/qa/evidence/qa-hrm-settings-md-jt-browser-01-20260725.md` |
| **spec_ref** | FR-HRM-RC-JD-01 · AC-SET-FS-03 · BR-HRM-MD-01 · VAL-SET-MD |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Env** | Local L0 · U65 zero-seed · **HOLD_DEPLOY** · **NOT** Phase1/PROD · **NOT** `:8088` |
| **Portal URL** | `http://127.0.0.1:5173` · HRM FE `http://127.0.0.1:8080` |
| **ack_status** | **READY_FOR_QC** |

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` / FE↔BE | HRM `:28001` 200 · XBOS `:28002` 200 · HRM FE `:8080` (proxy → 28001) |
| FE handoff | `docs/qa/evidence/fe-hrm-settings-md-jt-01-20260725.md` READY (vitest 21/21) |
| BE handoff | `docs/qa/evidence/be-hrm-settings-md-jt-01-20260725.md` READY |
| Seed | **none** (U65) |

**Ops note (retest hygiene):** Direct `:8080` Vite default `VITE_DEV_PROXY_HRM_API` → `:3001` caused catalog 500 until FE restarted with `VITE_DEV_PROXY_HRM_API=http://127.0.0.1:28001`. Residual P2 tracked as `D-HRM-FE-PROXY-28001-01` — DevOps evidence **READY_FOR_QA** (`docs/qa/evidence/devops-hrm-fe-proxy-28001-01-20260725.md`); QA smoke may be in flight. Portal `:5173` proxy to HRM was healthy when up.

---

## 2. Exit criteria verdicts

| # | AC | Verdict | Evidence |
|---|-----|---------|----------|
| 1 | Recruitment → Thư viện JD → Thêm JD → chọn chức danh `job_titles` → Lưu | **PASS** | Click path local `:8080/hr/recruitment?portal=1&tenantId=xevn&companyId=main` (+ portal `:5173` support) |
| 2 | Network POST body includes `position_code` (catalog) → **2xx** | **PASS** | POST **201** `position_code=CHRO` · code `JD-QA-JT-09UTU9` |
| 3 | F5 → row still correct | **PASS** | After reload, mã + tiêu đề visible; API row `position_code=CHRO` |
| 4 | Empty `job_titles` → amber CTA + Lưu disabled | **PASS** | Fresh page + route intercept strip (no seed/DB wipe) |
| 5 | API rejects invent-only (spot) | **PASS** | Fake code → **400 `HRM-REC-JD-POS`**; omit code → **400 `HRM-VAL-001`** (DTO required string) |
| 6 | Evidence path | **PASS** | this file + runtime JSON |

**Overall:** **PASS** (UF browser + API spot) — product claims unchanged by PACK-01.

---

## 3. Click path (UF)

1. Login API `ceo@xe.vn` (XBOS JWT) → inject portal session storage.
2. Open `http://127.0.0.1:8080/hr/recruitment?portal=1&tenantId=xevn&companyId=main` (or portal `http://127.0.0.1:5173/hr/recruitment?...`).
3. Tab **Thư viện JD** → **Thêm JD**.
4. Fill Mã JD / Tiêu đề → CatalogSearchPicker **Chức danh** → select `CHRO` (`data-value`).
5. **Lưu JD** enabled → submit.
6. Network: `POST /api/hrm/recruitment/job-templates` → **201**, body `position_code: "CHRO"`.
7. F5 → row `JD-QA-JT-09UTU9` / title still listed (UI shows `position_name` label; code confirmed via GET).
8. Fresh page + intercept empty `job_titles`/`positions` → amber «Chưa có mục…» + **Lưu JD** `disabled`.

Runtime: `docs/qa/evidence/_tmp-qa-hrm-settings-md-jt-01-runtime.json`  
Harness: `scripts/qa/qa-hrm-settings-md-jt-01.mjs`

---

## 4. API / payload snapshot

```json
{
  "create": {
    "HTTP": 201,
    "code": "JD-QA-JT-09UTU9",
    "position_code": "CHRO"
  },
  "createdRow": {
    "id": "eda5cabc-a221-42df-a535-4dfa31b25b77",
    "position_code": "CHRO",
    "position_name": "Giám đốc Nhân sự"
  },
  "inventFake": {
    "HTTP": 400,
    "code": "HRM-REC-JD-POS"
  }
}
```

Catalog baseline: `job_titles` active=4 · pick `CHRO`.

---

## 5. L2.5 / journey_l25 (U19)

Nearest mandatory journey for Recruitment / Thư viện JD slice: **J-HRM-05** (`PROGRAM_JOURNEY_MAP.md` — Tuyển dụng).

| J-ID | Journey slice (this WI) | Click path | HTTP / outcome | Verdict |
|------|-------------------------|------------|----------------|---------|
| **J-HRM-05** | Recruitment → Thư viện JD create→201→F5 | Login `ceo@xe.vn` → `:5173/hr/recruitment` or `:8080/hr/recruitment` → tab Thư viện JD → Thêm JD → pick `job_titles` `CHRO` → Lưu → POST **201** → F5 row + API `position_code=CHRO` | POST **201** · F5 persist · empty CTA PASS | **PASS** |

Cross-nav support (portal origin): `docs/qa/evidence/qa-hrm-settings-md-jt-browser-01-20260725.md` — same AC create→201→F5 via `http://127.0.0.1:5173/hr/recruitment?...`.

### Classification ENV vs PRODUCT

| Finding | Type | Gate impact |
|---------|------|-------------|
| AC-SET-FS-03 create→201→F5 · empty CTA · invent reject | **PRODUCT** | **PASS** (local HOLD_DEPLOY) |
| Vite default `:3001` on direct `:8080` (pre-devops fix) | **ENV / ops P2** | **Not** product FAIL — `D-HRM-FE-PROXY-28001-01` **READY_FOR_QA**; optional GWC condition until smoke closes |
| HOLD_DEPLOY · NOT Phase1/PROD/:8088 | Governance | Honored |

---

## Residual / not promoted

| Item | Severity | Owner | Notes |
|------|----------|-------|-------|
| HRM FE Vite proxy `:3001` → `:28001` | P2 ops | devops → qa smoke | `D-HRM-FE-PROXY-28001-01` evidence **READY_FOR_QA** — QA smoke may be in flight; **not** product JT FAIL |
| F5 list shows label not code | info | — | FE column uses `position_name` / resolved label — SoT `position_code` on API row |
| Matrix UF 🟢 promote | — | — | HOLD_DEPLOY · local only · **not** Phase1/PROD/:8088 |

**cấm complied:** no seed · no invent codes in happy path · no Phase1/PROD/:8088 claim.

---

## Command table

| Command | Exit | Verdict |
|---------|------|---------|
| `pnpm run qc:dev-stack` (L0 cited) | 0 | PASS — HRM `:28001` / XBOS `:28002` / FE health 200 |
| `node scripts/qa/qa-hrm-settings-md-jt-01.mjs` | 0 | PASS — create→201→F5 · empty CTA · invent reject |
| `node scripts/qa/qa-hrm-settings-md-jt-browser-01.mjs` | 0 | PASS — portal `:5173` UF support |
| `pnpm exec vitest run src/lib/catalogSearchPicker.test.ts src/lib/jobTemplatesPositionCode.test.ts` (apps/web/hrm · FE cite) | 0 | PASS (21/21) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-settings-md-jt-01-20260725.md` | 0 | PASS (8/8) after PACK-01 |

**Portal URL:** `http://127.0.0.1:5173` · HRM FE `http://127.0.0.1:8080` · `PORTAL_DEV_URL=http://127.0.0.1:5173`

**Pack note (PACK-01):** Layer B only — Command table + L2.5 **J-HRM-05** + ENV vs PRODUCT classification appended; product AC-SET-FS-03 PASS claims unchanged; full Settings MD matrix / `:8088` **not** re-run.

---

## 7. Handoff

```yaml
work_item_id: QA-HRM-SETTINGS-MD-JT-01-PACK-01
from_role: qa
to_role: pm
ack_status: READY_FOR_QC
evidence_path: docs/qa/evidence/qa-hrm-settings-md-jt-01-20260725.md
next_owner: qc
completion_report: |
  PACK-01 Layer B CLOSED: Command table + journey_l25 J-HRM-05 PASS + ENV vs PRODUCT.
  verify:qc:evidence-pack → 8/8 exit 0. Product AC-SET-FS-03 claims unchanged (create→201→F5, empty CTA, invent reject).
  Residual P2: D-HRM-FE-PROXY-28001-01 READY_FOR_QA (smoke may be in flight).
  U65 · HOLD_DEPLOY · NOT Phase1/PROD/:8088. Closes C-JT-QA-PACK-01 process blocker.
next_dispatch_prompt: |
  work_item_id: QC-HRM-SETTINGS-MD-JT-01
  from_role: pm
  to_role: qc
  lane: execution
  entry: QA-HRM-SETTINGS-MD-JT-01-PACK-01 READY_FOR_QC · docs/qa/evidence/qa-hrm-settings-md-jt-01-20260725.md · verify:qc:evidence-pack exit 0 (8/8) · prior NO-GO process C-JT-QA-PACK-01 to CLOSE
  exit: Re-gate expected GO WITH CONDITIONS (bounded AC-SET-FS-03 local) · C-JT-PROXY-28001-01 optional if smoke not closed · HOLD_DEPLOY · NOT Phase1/PROD/:8088
  support: docs/qa/evidence/qa-hrm-settings-md-jt-browser-01-20260725.md · devops-hrm-fe-proxy-28001-01-20260725.md
  cấm: seed · invent · reopen BE/FE unless product claims change · promote :8088
```
