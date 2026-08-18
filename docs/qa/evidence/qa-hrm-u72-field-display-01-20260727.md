# QA-HRM-U72-FIELD-DISPLAY-01 — HRM field display / label-leak spot (U65)

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-HRM-U72-FIELD-DISPLAY-01` · pack repair `QA-HRM-U72-FIELD-DISPLAY-PACK-01` |
| **alias** | `QA-HRM-U72-LABEL-01` |
| **Date** | 2026-07-27 |
| **Role** | qa |
| **lane** | execution · **U65 zero-seed** · browser-only · pack Layer B amend (product AC matrix kept) |
| **RE-DISPATCH** | Prior Task stalled without evidence; merged mid-write draft + fresh recheck (do not wipe) |
| **Prior FE** | `docs/qa/evidence/d-hrm-u72-label-fe-01-20260727.md` (`READY_FOR_QA`) |
| **Prior QC** | `docs/qa/evidence/qc-hrm-u72-field-display-01-20260727.md` — **NO-GO (process)** · **C-U72-PACK-01** (audited earlier PASS draft; spot2 later **FAIL** U02) |
| **Spec** | `docs/hrm/SRS_FIELD_DISPLAY.md` §2–§4 · `docs/hrm/SRS.md` §17 / FR-HRM-U72-LABEL-01 · BA `ba-display-hrm-review-01-20260727.md` |
| **Rule** | `.cursor/rules/display-label-no-raw-key.mdc` · `.cursor/rules/qc-evidence-pack-gate.mdc` |
| **Env** | Portal `:5173` · `PORTAL_DEV_URL=http://127.0.0.1:5173` · hrm-api `:28001` · xbos `:28002` · `ceo@xe.vn` / `Xevn@2026` |
| **Runner** | `scripts/qa/qa-hrm-u72-field-display-01.mjs` + finalize/spot2/leave-visible rechecks |
| **Runtime** | `_tmp-qa-hrm-u72-field-display-01-runtime.json` · `_tmp-qa-hrm-u72-finalize-runtime.json` · `_tmp-qa-hrm-u72-spot2-runtime.json` · `_tmp-qa-hrm-u72-leave-visible-runtime.json` |
| **Seed** | **none** |
| **Constraints** | **U65 zero-seed** · browser-only · no PASS-only-API · **HOLD_DEPLOY** · **NOT** Phase1/PROD · **NOT** `:8088` |
| **Overall** | **FAIL** (product — AC-FD-U02 / AC-U72-GLOBAL) · pack Layer B **8/8** |
| **ack_status** | **READY_FOR_QC** |
| **pack_repair_evidence** | `docs/qa/evidence/qa-hrm-u72-field-display-pack-01-20260727.md` |

---

## 0. L0 / stack

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` **200** · XBOS `:28002` **200** · portal `:5173` **200** (Node UV assert noise on exit; health lines PASS) |
| Seed | **not used** |
| Note | Portal Vite dropped mid-wave (`ERR_CONNECTION_REFUSED`); DevOps/other lane restarted `dev:web-only` — recheck resumed after `:5173`/`:5176` **200** |

---

## 1. AC matrix (AC-FD-01..13 · U01..U06 · GLOBAL · industry)

| AC | Surface / click path | Observed label | Verdict |
|----|----------------------|----------------|---------|
| **AC-CO-IND-02** | `/hr/company?portal=1` **and** CC `/command-center/hrm/company` → cột «Ngành nghề» | 5 rows industry **`—`/`-`** — **not** `holding`/`subsidiary` | **PASS** |
| **AC-FD-01** | `/hr/employees/{id}` → Giới tính (+ resume body scan) | Live sample top-level gender null → **`—`**; no `male`/`female` in body/resume | **PASS** (null→—; positive Nam/Nữ N/D — top-level API null, no seed) |
| **AC-FD-02** | Profile → Công việc / employment | No `full_time`/`full-time` raw in body | **PASS** (anti-leak; positive «Toàn thời gian» N/D on sampled rows) |
| **AC-FD-03** | Profile → Lương & Phụ cấp | No standalone `base`/`probation`/`PHU_CAP_*` cells; VI line labels present | **PASS** |
| **AC-FD-04** | `/hr/contracts` list | `Hợp đồng thử việc` · `Có thời hạn` · `Không thời hạn` (finalize 10 samples) | **PASS** |
| **AC-FD-05** | Emp contract history + list «Tình trạng» | List shows `Có hiệu lực` (VI); no raw `active`/`expired`/`terminated` cells | **PASS** |
| **AC-FD-06** | `/hr/dashboard` reminders | No standalone `annual`/`LVT_*` nodes | **PASS** |
| **AC-FD-07** | Recruitment → Yêu cầu tuyển | `Toàn thời gian` ×6 (primary runner) | **PASS** |
| **AC-FD-08** | Requisition detail Đơn vị | No mono slug cells `trsport`/`holding` | **PASS** |
| **AC-FD-09** | Requisition workflow | No full UUID cells; badge path OK | **PASS** |
| **AC-FD-10** | Candidate detail marital | No `single`/`married` raw cells | **PASS** |
| **AC-FD-11** | Import preview stage | Import UI not opened in session | **N/A** (no raw stage on page) |
| **AC-FD-12** | Settings catalog/master status | No raw `active`/`draft` cells (primary runner) | **PASS** |
| **AC-FD-13** | `/hr/performance` | Cycle suffix `(Nháp)`; no `Employee {uuid}`; no raw `draft`/`active`/`closed` tokens | **PASS** |
| **AC-FD-U01** | Profile Nơi làm việc / Địa điểm | `—` / `--` | **PASS** |
| **AC-FD-U02** | Profile header + Công việc «Chức vụ» | **`LEGAL_SPECIALIST`** raw (`HLD-0996` / Phạm Đức Hùng) — also under header chip | **FAIL** |
| **AC-FD-U03** | Profile → Bảo hiểm | No `social`/`active` raw chips | **PASS** |
| **AC-FD-U04** | Attendance → Nghỉ phép | Calendar side: **`Ốm`** (VI); visibility scan `rawVisible=[]` `rawAllCount=0` | **PASS** (see §3) |
| **AC-FD-U05** | Job postings employment | No raw employment_type cells (primary runner) | **PASS** |
| **AC-FD-U06** | Funnel/candidate stage col | No raw `screening` cells | **PASS** |
| **AC-U72-GLOBAL** | Rollup | **FAIL** — user-visible `job_title_key` raw on employee profile (U02) | **FAIL** |

---

## 2. UF evidence blocks (browser)

### UF — AC-CO-IND-02 (regression)

- **Persona / URL / click path:** `ceo@xe.vn` → `http://127.0.0.1:5173/hr/company?portal=1&tenantId=xevn&companyId=main` → table «Ngành nghề»; recheck also CC embed
- **Observed:** industry cells `-` / `—` for Tập đoàn + 4 members
- **Forbidden hits:** **0** (`holding`/`subsidiary` absent as industry)
- **Verdict:** 🟢
- **spec_ref:** AC-CO-IND-02 · FR-HRM-CO-IND-01 · must_keep `resolveIndustryDisplay`

### UF — AC-FD-04 / AC-FD-05 Contracts

- **URL:** `http://127.0.0.1:5173/hr/contracts?portal=1&…`
- **Observed types:** `Hợp đồng thử việc | Có thời hạn | Không thời hạn | …`
- **Observed status:** `Có hiệu lực` (not `active`)
- **Verdict:** 🟢

### UF — AC-FD-07 Recruitment employment

- **URL:** `http://127.0.0.1:5173/hr/recruitment?portal=1&…` → Yêu cầu tuyển
- **Observed:** `Toàn thời gian` (not `full_time` / `full-time`)
- **Verdict:** 🟢

### UF — AC-FD-01 / NULL

- **URL:** `http://127.0.0.1:5173/hr/employees/dbdbece0-6572-401a-b4eb-56781493a75f?portal=1&…` and `…/ff16d855-41e4-4390-8381-9ec56262848c`
- **Observed:** `Giới tính —` (em dash); `hasMale=false`
- **Note:** `custom_fields.gender="Nam"` exists on UAT employees but profile binds top-level/null → `—` (not raw EN)
- **Verdict:** 🟢 fail-closed null→—

### UF — AC-FD-U02 (FAIL — label-leak)

- **Persona / URL / click path:** `ceo@xe.vn` → Nhân sự → open `HLD-0996` Phạm Đức Hùng → profile header + tab Công việc «Chức vụ»
- **URL:** `http://127.0.0.1:5173/hr/employees/ff16d855-41e4-4390-8381-9ec56262848c?portal=1&tenantId=xevn&companyId=main`
- **Trước/quan sát:** Header chip + Chức vụ show **`LEGAL_SPECIALIST`** (API `job_title_key`); catalog has `job_title_label` «Chuyên viên Pháp chế» in `custom_fields` but UI renders key
- **F5:** same raw key remains
- **Verdict:** 🔴
- **spec_ref:** AC-FD-U02 · BR-CO-LABEL-01 · `display-label-no-raw-key.mdc`
- **Runtime cite:** `_tmp-qa-hrm-u72-spot2-runtime.json` → `profile.hasJobKey=true` · `job="Chức vụ LEGAL_SPECIALIST…"`

### UF — AC-FD-U04 Leave (visibility-corrected)

- **URL:** `http://127.0.0.1:5173/hr/attendance?portal=1&…` → Nghỉ phép → Lịch nghỉ
- **Observed:** side panel `…Vũ Văn An…Ốm…5 ngày…` — leave type **VI**, not `annual`/`LVT_01`
- **Visibility scan:** `rawAllCount=0`, `rawVisible=[]`
- **API assist (not UF alone):** `GET /api/hrm/attendance/leave-requests?company_id=main` → `leave_type=LVT_01` rows exist; UI maps to catalog label on calendar
- **List tab:** Puppeteer click «Danh sách yêu cầu» reported hit but Radix `data-state` stayed on calendar — list-table assert incomplete this session; prior leave-create browser evidence showed list **`Phép năm`**
- **Verdict:** 🟢 for visible calendar surface; list tab automation incomplete (not used to FAIL)

### UF — AC-FD-13 Performance

- **URL:** `http://127.0.0.1:5173/hr/performance?portal=1&…`
- **Observed:** `QA-BUNDLE-02-… (Nháp)`; `empUuid=[]`; `rawCycle=[]`
- **Verdict:** 🟢

---

## 3. Defect triage / superseded finding

| ID | Initial | Final | Note |
|----|---------|-------|------|
| AC-FD-U04 | First runner FAIL (`LVT_01`/`annual` in DOM textContent) | **PASS** | Superseded by visibility-filtered scan — codes were not user-visible (likely closed Select/hidden nodes). Calendar shows **Ốm**. |
| AC-CO-IND-02 | First runner BLOCKED (CC iframe rows=0) | **PASS** | Retest `/hr/company` + CC — industry column present, no entity_type leak |
| AC-FD-U02 | Mid-write draft **PASS** («no job_title_key raw») | **FAIL** | Recheck on `HLD-0996` proves **`LEGAL_SPECIALIST`** user-visible — draft U02 PASS **superseded** |
| AC-U72-GLOBAL | Mid-write draft PASS | **FAIL** | Driven by U02 label-leak |

**Code residual (P2 soft, not sole FAIL):** `resolveLeaveTypeLabel` in `catalogSearchPicker.ts` still falls back to **raw code** when catalog miss (`?? code`), while F-06 dashboard uses `resolveLeaveTypeDisplayLabel` → `—`. Optional FE harden: align LeaveTab to fail-closed `—`.

---

## 4. Screenshots

`docs/qa/evidence/screenshots/qa-hrm-u72-field-display-01/` (01-company … 18-performance from primary runner).

---

## 5. L2.5 journey matrix

SoT: `docs/program/PROGRAM_JOURNEY_MAP.md` · **J-HRM-CO-01** (industry / company label surface) · optional **J-HRM-01** (contracts list → employee profile cross-nav). U19: L2 tab load alone insufficient — promote click-path journeys with explicit verdict rows.

| Journey ID | UF / AC | Click path (portal `:5173`) | Network / observe | Verdict |
|------------|---------|-----------------------------|-------------------|---------|
| **J-HRM-CO-01** | **AC-CO-IND-02** · industry / company label spot | Login `ceo@xe.vn` → `/hr/company?portal=1&…&companyId=main` (+ CC embed recheck) → cột «Ngành nghề» (5 rows) | industry cells `-`/`—` · **0** `holding`/`subsidiary` | **PASS** |
| **J-HRM-01** (optional cite) | Contracts list → employee profile open | `/hr/contracts` → open NV profile `/hr/employees/{id}` (scope rollup `companyId=main`) | profile loads 2xx · no 404 scope | **PASS** (cross-nav) |
| Label residual on same profile | **AC-FD-U02** | Profile header + «Chức vụ» on `HLD-0996` | user-visible `LEGAL_SPECIALIST` (`hasJobKey=true`) | **FAIL** (product — not journey 404) |

**U19 note:** **J-HRM-CO-01** industry journey **PASS**. **J-HRM-01** cross-nav list→detail **PASS** (no scope 404). Product label-leak **AC-FD-U02** remains **FAIL** on the opened profile — pack cites journeys; does not promote GLOBAL PASS.

### Read-only module matrix (HRM field display / labels)

| Module | Mode | AC / UF | Verdict |
|--------|------|---------|---------|
| Company Management · cột Ngành nghề | **read-only** display | AC-CO-IND-02 · J-HRM-CO-01 | **PASS** |
| Contracts list · HĐ type / status VI | **read-only** display | AC-FD-04 · AC-FD-05 | **PASS** |
| Employee profile · gender / lương / BH | **read-only** display | AC-FD-01..03 · U01 · U03 | **PASS** |
| Employee profile · Chức vụ / job title | **read-only** display | AC-FD-U02 | **FAIL** (`LEGAL_SPECIALIST`) |
| Attendance · Nghỉ phép calendar | **read-only** display | AC-FD-U04 · VI **Ốm** | **PASS** |
| Recruitment / performance / settings | **read-only** display | AC-FD-07..13 · U05..U06 | **PASS** (or N/A F-11) |

---

## Residual

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| **AC-FD-U02** / **AC-U72-GLOBAL** | **P0** | **dev-fe** | Raw `LEGAL_SPECIALIST` on profile — blocks product GO; **not** closed by pack repair |
| R-U72-LEAVE-FALLBACK | P2 soft | dev-fe | Align `resolveLeaveTypeLabel` unknown → `—` — **condition OK** if product gate later; **no** sole reason to reopen other PASS maps |
| R-U72-POSITIVE-GENDER | P3 | qa (later) | When employee has non-null top-level gender/employment_type via FE, re-spot Nam/Nữ + Toàn thời gian |
| R-PORTAL-ECONNRESET | ops | devops | `:5173` Vite drop mid-session (restarted) |

---

## Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| AC-FD-01..13 (except U02) · AC-CO-IND-02 · U04 calendar | **PRODUCT** | **PASS** rows kept — **no** Dev reopen for those |
| AC-FD-U02 / AC-U72-GLOBAL raw `job_title_key` | **PRODUCT** P0 | Blocks GO — QC re-gate must **NO-GO (product)** or GWC only if PM waives (not recommended) |
| LeaveTab raw fallback on catalog miss | **PRODUCT** P2 soft | **C-U72-LEAVE-P2** condition OK |
| Prior pack missing `journey_l25` + `crud_or_matrix` | **PROCESS** | **CLOSED** by PACK-01 Layer B (`## 5. L2.5 journey matrix` + read-only module matrix) |
| `qc:dev-stack` UV assert after 200 | **ENV** | Noise — services healthy |
| HOLD_DEPLOY · NOT Phase1/PROD/:8088 · seed:none | Governance | Honored |

---

## Command table

| Command | Exit | Verdict |
|---------|------|---------|
| `pnpm run qc:dev-stack` | — | **PASS** (hrm `:28001` / xbos `:28002` / portal `:5173` **200**) |
| `node scripts/qa/qa-hrm-u72-field-display-01.mjs` (+ finalize/spot2/leave-visible) | 0 / spot2 | **PASS** runners for anti-leak surfaces · spot2 **FAIL** U02 (`hasJobKey=true`) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md` | 0 | **PASS** (8/8) after PACK-01 |

**Browser evidence pointers:**  
`docs/qa/evidence/screenshots/qa-hrm-u72-field-display-01/` · `_tmp-qa-hrm-u72-field-display-01-runtime.json` · `_tmp-qa-hrm-u72-spot2-runtime.json` · `_tmp-qa-hrm-u72-leave-visible-runtime.json`

**Pack note (PACK-01):** Layer B sections (`## 5. L2.5 journey matrix`, read-only module matrix, `## Residual`, `## Classification`, `## Command table`) added for verifier integrity — product AC verdicts **not** rewritten to PASS; closes process condition **C-U72-PACK-01** only.

---

## 6. Handoff

### completion_report

**Closed (process):** PACK-01 Layer B — `## L2.5 journey matrix` with **J-HRM-CO-01** `| **PASS**` + optional **J-HRM-01** cross-nav **PASS** + read-only module matrix → `verify:qc:evidence-pack` **8/8**. Seed **none**. HOLD_DEPLOY · NOT Phase1/PROD/:8088.

**Kept (product):** AC-FD / AC-CO-IND-02 / LeaveTab P2 soft residual as in §1–§3. **AC-FD-U02** + **AC-U72-GLOBAL** remain **FAIL** (`LEGAL_SPECIALIST` · spot2 `hasJobKey=true`) — pack repair does **not** promote product GO.

**Open:** Product P0 U02 → after QC confirms pack/process closed, PM must keep **D-HRM-U72-LABEL-FE-02** (or re-dispatch) — **no** Dev reopen for already-PASS AC rows.

### next_owner

`qc`

### next_dispatch_prompt

```text
work_item_id: QC-HRM-U72-FIELD-DISPLAY-01
from_role: pm
to_role: qc
lane: governance · re-gate after pack repair
entry_criteria:
  - Prior NO-GO (process): docs/qa/evidence/qc-hrm-u72-field-display-01-20260727.md · C-U72-PACK-01
  - Pack repair DONE: docs/qa/evidence/qa-hrm-u72-field-display-pack-01-20260727.md
  - Patched QA MD: docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md · ack READY_FOR_QC · verify 8/8
  - Product overall FAIL retained: AC-FD-U02 / AC-U72-GLOBAL (LEGAL_SPECIALIST) — spot2 runtime
  - U65 · HOLD_DEPLOY · seed:none · no Dev reopen for PASS AC rows
exit_criteria:
  1) Re-run verify:qc:evidence-pack → 8/8; close C-U72-PACK-01 (process)
  2) Product gate: NO-GO (product) or explicit residual P0 U02 — do NOT GO/GWC as if GLOBAL PASS
  3) Keep HOLD_DEPLOY · NOT Phase1/PROD/:8088; LeaveTab P2 = C-U72-LEAVE-P2 condition OK
  4) next_dispatch_hint for PM: D-HRM-U72-LABEL-FE-02 (job_title_key → VI/—)
evidence_path: docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md
cấm: seed · Dev reopen PASS label maps · Phase1/PROD/:8088 claim · treat pack 8/8 as product GO
```

### evidence_path

`docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md`

### ack_status

**READY_FOR_QC**

### pm_dispatch_hint

`QC-HRM-U72-FIELD-DISPLAY-01` re-gate — close **C-U72-PACK-01** (pack 8/8) · product **NO-GO** on **AC-FD-U02** → then `D-HRM-U72-LABEL-FE-02`