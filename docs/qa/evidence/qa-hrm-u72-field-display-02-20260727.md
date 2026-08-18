# QA-HRM-U72-FIELD-DISPLAY-02 — AC-FD-U02 retest after D-HRM-U72-LABEL-FE-02

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-HRM-U72-FIELD-DISPLAY-02` |
| **Date** | 2026-07-27 |
| **Role** | qa |
| **lane** | execution · **U65 zero-seed** · browser-only |
| **Prior FE** | `docs/qa/evidence/d-hrm-u72-label-fe-02-20260727.md` (`READY_FOR_QA`) |
| **Prior QA FAIL** | `docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md` — AC-FD-U02 `LEGAL_SPECIALIST` |
| **Prior QC** | `docs/qa/evidence/qc-hrm-u72-field-display-01-r2-20260727.md` — **NO-GO (product)** U02 |
| **Spec** | `docs/hrm/SRS_FIELD_DISPLAY.md` §3 U-02 · §4 **AC-FD-U02** · **AC-U72-GLOBAL** · AC-CO-IND-02 · AC-FD-04 |
| **Rule** | `.cursor/rules/display-label-no-raw-key.mdc` |
| **Env** | Portal `:5173` · HRM Vite `:8080` (proxy `/hr`) · hrm-api `:28001` · xbos `:28002` · `ceo@xe.vn` / `Xevn@2026` |
| **Runner** | `scripts/qa/qa-hrm-u72-field-display-02.mjs` |
| **Runtime** | `docs/qa/evidence/_tmp-qa-hrm-u72-field-display-02-runtime.json` |
| **Seed** | **none** |
| **Constraints** | U65 · no PASS-only-API · HOLD_DEPLOY · **NOT** Phase1/PROD · **NOT** `:8088` |
| **Overall** | **PASS** |
| **ack_status** | **PASS_TO_PM** |

---

## 0. L0 / stack

| Check | Result |
|-------|--------|
| Portal `:5173` | **200** |
| HRM Vite `:8080` | **200** `/hr/` — required for portal `/hr` proxy (`VITE_DEV_PROXY_HRM_WEB`) |
| First attempt | **BLOCKED ENV** — `/hr/*` → `ECONNREFUSED 127.0.0.1:8080` (HTTP 500 chrome-error). Started `pnpm --filter vite_react_shadcn_ts run dev` then retest |
| XBOS login | **201** `POST /api/xbos/auth/login` |
| Seed | **not used** |

---

## 1. AC matrix (this wave)

| AC | Surface / click path | Observed | Verdict |
|----|----------------------|----------|---------|
| **AC-FD-U02** | `/hr/employees/ff16d855-…` · HLD-0996 Phạm Đức Hùng · tab **Thông tin chung** · header chip + «Chức vụ» | Header **`Chuyên viên Pháp chế`** · «Chức vụ» **`Chuyên viên Pháp chế`** · **`LEGAL_SPECIALIST` absent** | **PASS** |
| **AC-FD-U02-F5** | Same URL · F5 · stay Thông tin chung | Same VI labels; no raw key | **PASS** |
| **AC-U72-GLOBAL** | Rollup for this retest slice | Driven by U02 close | **PASS** (spot scope) |
| **AC-U72-LEAVE-SOFT** | `/hr/attendance` → Nghỉ phép → Lịch nghỉ | `rawVisible=[]` · VI hint (Ốm/Phép) present; no `LVT_*`/`annual` cells | **PASS** (soft) |
| **AC-CO-IND-02** | `/hr/company?portal=1&…&companyId=main` · cột Ngành nghề | 5× `-` · **0** `holding`/`subsidiary` | **PASS** |
| **AC-FD-04** | `/hr/contracts` list · Loại hợp đồng | `Hợp đồng thử việc` · `Có thời hạn` · `Không thời hạn` · raw types **0** | **PASS** |

---

## 2. UF evidence blocks (browser)

### UF — AC-FD-U02 (was FAIL → PASS)

- **Persona / URL / click path:** `ceo@xe.vn` → `http://127.0.0.1:5173/hr/employees/ff16d855-41e4-4390-8381-9ec56262848c?portal=1&tenantId=xevn&companyId=main` → **Thông tin chung**
- **Trước (prior FAIL):** header + Chức vụ = **`LEGAL_SPECIALIST`** (`hasJobKey=true`)
- **Sau FE-02:** header chip **`Chuyên viên Pháp chế`** · row «Chức vụ» **`Chuyên viên Pháp chế`** · `hasJobKeyVisible=false` / `hasJobKeyInBody=false`
- **F5:** same VI; no raw key
- **Network assist (not UF alone):** page load via portal proxy to HRM `:8080` 200
- **Verdict:** 🟢
- **spec_ref:** AC-FD-U02 · FR-HRM-U72-LABEL-01 · BR-U72-NULL-01 · `display-label-no-raw-key.mdc`
- **Screenshot:** `docs/qa/evidence/screenshots/qa-hrm-u72-field-display-02/01-profile-u02.png` · `02-profile-u02-f5.png`

### UF — Leave soft (no raw codes)

- **URL:** `http://127.0.0.1:5173/hr/attendance?portal=1&…` → Nghỉ phép
- **Observed:** active tab Lịch nghỉ; visibility scan `rawVisible=[]`; VI leave wording present
- **Note:** Soft AC — catalog-miss → `—` path not force-injected (U65 no seed); anti-leak on visible surface PASS
- **Verdict:** 🟢 soft
- **Screenshot:** `03-leave-soft.png`

### UF — AC-CO-IND-02 regression

- **URL:** `/hr/company?portal=1&tenantId=xevn&companyId=main`
- **Observed:** Ngành nghề cells `-` ×5; no entity_type leak
- **Verdict:** 🟢
- **Screenshot:** `04-company-industry.png`

### UF — AC-FD-04 contracts VI (spot)

- **URL:** `/hr/contracts?portal=1&…`
- **Observed:** VI contract types; no `fixed_term`/`indefinite` cells
- **Verdict:** 🟢
- **Screenshot:** `05-contracts.png`

---

## 3. L2.5 journey matrix

SoT: `docs/program/PROGRAM_JOURNEY_MAP.md` · U19 click-path (not tab-load alone).

| Journey ID | UF / AC | Click path (portal `:5173`) | Observe | Verdict |
|------------|---------|-----------------------------|---------|---------|
| **J-HRM-01** (cite) | Profile deep link after prior contracts context | Direct employee URL HLD-0996 (same as list→detail target) · Thông tin chung | Profile 200 · Chức vụ VI · no scope 404 | **PASS** |
| **J-HRM-CO-01** | **AC-CO-IND-02** | `/hr/company` → cột Ngành nghề | `-` ×5 · no holding/subsidiary | **PASS** |
| Label product close | **AC-FD-U02** | Header + Chức vụ on HLD-0996 + F5 | `Chuyên viên Pháp chế` · no `LEGAL_SPECIALIST` | **PASS** |

### Read-only module matrix (this retest)

| Module | Mode | AC / UF | Verdict |
|--------|------|---------|---------|
| Employee profile · Chức vụ / job title | **read-only** display | AC-FD-U02 · F5 | **PASS** |
| Company · Ngành nghề | **read-only** display | AC-CO-IND-02 · J-HRM-CO-01 | **PASS** |
| Contracts · loại HĐ VI | **read-only** display | AC-FD-04 | **PASS** |
| Attendance · Nghỉ phép calendar | **read-only** display | leave soft anti-leak | **PASS** soft |

---

## Residual

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| R-U72-LEAVE-UNKNOWN-POSITIVE | P3 soft | qa (later) | Catalog-miss leave type → `—` not force-proven under U65 (no seed unknown code); visible raw=0 OK |
| R-PORTAL-HRM-8080 | ENV | devops | Portal `/hr` requires HRM Vite `:8080`; wave started it when missing — keep in L0 checklist |
| HOLD_DEPLOY · NOT Phase1/PROD/:8088 | Governance | pm/qc | Honored — local slice only |

**Prior P0 AC-FD-U02 / LEGAL_SPECIALIST:** **CLOSED** by browser retest.

---

## Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| AC-FD-U02 + F5 VI label | **PRODUCT** | **PASS** — clears prior NO-GO product blocker |
| AC-U72-GLOBAL (spot) | **PRODUCT** | **PASS** for U02 closure |
| AC-CO-IND-02 · AC-FD-04 | **PRODUCT** | **PASS** — no regression reopen |
| Leave soft anti-leak | **PRODUCT** P2 soft | **PASS** soft — OK for GWC condition close |
| Missing HRM `:8080` mid-wave | **ENV** | Recovered before PASS claim |
| HOLD_DEPLOY | Governance | Stands |

---

## Command table

| Command | Exit | Verdict |
|---------|------|---------|
| `pnpm --filter vite_react_shadcn_ts run dev` | — | **PASS** (HRM `:8080` up for proxy) |
| `node scripts/qa/qa-hrm-u72-field-display-02.mjs` | **0** | **PASS** all in-scope AC |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-u72-field-display-02-20260727.md` | **0** | **PASS** (8/8) |
| Seed | n/a | **none** |

**Browser evidence pointers:**  
`docs/qa/evidence/screenshots/qa-hrm-u72-field-display-02/` · `_tmp-qa-hrm-u72-field-display-02-runtime.json`

---

## completion_report

**Closed:** AC-FD-U02 on HLD-0996 — header + «Chức vụ» show **Chuyên viên Pháp chế**; never `LEGAL_SPECIALIST`; F5 keeps labels; soft leave no raw codes; AC-CO-IND-02 + AC-FD-04 spot PASS; AC-U72-GLOBAL spot PASS for U02.

**Residual:** ENV note keep HRM `:8080` in L0; leave unknown→— positive path optional P3; HOLD_DEPLOY; expect QC **GWC** (not Phase1/PROD).

### next_owner

**qc**

### next_dispatch_prompt

```text
work_item_id: QC-HRM-U72-FIELD-DISPLAY-01
role: qc
gate_revision: R3 (product re-gate after QA-HRM-U72-FIELD-DISPLAY-02)
entry_criteria:
  - QA PASS_TO_PM @ docs/qa/evidence/qa-hrm-u72-field-display-02-20260727.md
  - Prior R2 NO-GO product @ docs/qa/evidence/qc-hrm-u72-field-display-01-r2-20260727.md
  - U65 zero-seed; local :5173/:8080/:28001/:28002 only
exit_criteria:
  - Product audit: AC-FD-U02 / AC-U72-GLOBAL CLOSED (no LEGAL_SPECIALIST)
  - Keep PASS maps AC-CO-IND-02 / AC-FD-04 / F-01..F-13 from prior QA-01
  - Expect GO WITH CONDITIONS (GWC): HOLD_DEPLOY · NOT Phase1/PROD/:8088 · soft leave P3 OK
  - verify:qc:evidence-pack on QA-02 evidence if required by pack gate
  - evidence_path: docs/qa/evidence/qc-hrm-u72-field-display-01-r3-20260727.md
cấm: seed; treat pack 8/8 as product GO without reading U02 PASS row
```

### evidence_path

`docs/qa/evidence/qa-hrm-u72-field-display-02-20260727.md`

### ack_status

**PASS_TO_PM**
