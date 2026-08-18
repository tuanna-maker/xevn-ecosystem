# QA-PCOMP-W6-BROWSER-HRM-DEEP-01 — HRM deep browser (U65 FE-only)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PCOMP-W6-BROWSER-HRM-DEEP-01` |
| **from_role** | qa |
| **to_role** | pm |
| **execution_date** | 2026-07-27 |
| **environment** | `http://127.0.0.1:5173/hr` · hrm-api `:28001` **dist-uat-w6** · xbos `:28002` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **locks** | **U65 zero-seed** · **HOLD_DEPLOY** · **NOT** `:8088` · **NOT** Phase1/PROD · keep `dist-uat-w6` |
| **runner** | `node scripts/qa/qa-pcomp-w6-browser-hrm-deep-01.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-qa-pcomp-w6-browser-hrm-deep-01-runtime.json` |
| **screens** | `docs/qa/evidence/screens/qa-pcomp-w6-browser-hrm-deep-01/` (13 PNG) |
| **Overall** | **PASS_TO_PM** (bounded deep P0) — Leave create **🟡 BLOCKED** (known BE) |
| **ack_status** | **PASS_TO_PM** |

---

## spec_read_ack

| Artifact | Sections / IDs |
|----------|----------------|
| `_vibe-team-os/09-TEAM-OPERATING-MODEL.md` | §6 evidence / browser |
| `_vibe-team-os/roles/qa.md` | L2.5 journeys |
| `_vibe-team-os/incidents/INC-QA-EVIDENCE-WITHOUT-RUN` | no PASS without live run |
| U65 | `sponsor-zero-seed-fe-only-lock` · FE-only · cấm seed leave/inbox |
| `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` | **Wave 2** UF-HRM-01..13 |
| `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` | §4 UF-HRM-* |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | **J-HRM-01** · **J-HRM-03** · **J-HRM-06** |
| Prior leave FAIL | `docs/qa/evidence/qa-hrm-leave-req-create-01-20260727.md` |
| Prior Settings POS GWC | `docs/qa/evidence/qa-hrm-settings-md-pos-browser-01-20260727.md` |
| Dry-run (load-only — superseded for UF mutate) | `docs/qa/evidence/qa-pcomp-w6-local-dry-run-02-20260727.md` |

**Did not claim:** full Wave 2 11/11 · Phase1 DONE · PROD · `:8088` · Leave create 🟢

---

## Command table

| # | Command | Result |
|---|---------|--------|
| 1 | Process audit `dist-uat-w6` | PID **25960** · `node --enable-source-maps dist-uat-w6/main.js` |
| 2 | `pnpm run qc:dev-stack` | ✓ hrm / ✓ xbos / ✓ portal `:5173` (UV abort noise OK) |
| 3 | `pnpm run qc:fe-be-health` | exit **0** ALL PASS |
| 4 | `node scripts/qa/qa-pcomp-w6-browser-hrm-deep-01.mjs` | exit **0** · hardFail=none · Leave=BLOCKED |
| 5 | Seed | **none** |

---

## Rollup P0

| ID | Verdict | One-line |
|----|---------|----------|
| **UF-HRM-01** / **J-HRM-01** | 🟢 **PASS** | Employees list → click row → `/employees/{id}` · GET detail **200** |
| **UF-HRM-03** | 🟢 **PASS** | Profile **Chỉnh sửa** → `full_name` + `W6QA` → **Lưu** → PATCH **200** → F5 header shows `W6QA` |
| **UF-HRM-10** | 🟢 **PASS** | Live Settings → Chức danh form `#md-code-positions` + catalog GET **200** · cite POS create **201** GWC same-day |
| **UF-HRM-12** | 🟢 **PASS** | Recruitment → **Chi tiết** → dialog · GET requisition by id **200** |
| **J-HRM-03** | 🟢 **PASS** | Contracts list → open → dialog **Chi tiết hợp đồng** `HLD-0006-HD` |
| **J-HRM-06** | 🟢 **PASS** | Attendance load GET **200** · Leave tab list GET **200** (mutate not claimed) |
| **Leave create** | 🟡 **BLOCKED** | Cite `QA-HRM-LEAVE-REQ-CREATE-01` FAIL · BE `D-HRM-LEAVE-REQ-CREATE-BE-01` in flight · **no seed** |

---

## UF / J evidence blocks

### UF-HRM-01 / J-HRM-01 — list→detail click

- **Persona / URL / click path:** `ceo@xe.vn` → `http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main` → click first data row
- **Trước mutate:** list GET **200**
- **Action:** row click → navigate profile
- **Network:** `GET /api/hrm/employees/dbdbece0-6572-401a-b4eb-56781493a75f?company_id=main` → **200**
- **FE sau 2xx:** profile shell `#root` · name **QA Dept Persist** · tabs Thông tin chung visible
- **F5:** N/A (read journey)
- **Screenshot:** `screens/…/01-employees-list.png` · `02-employee-detail.png`
- **Verdict:** 🟢
- **spec_ref:** PROGRAM_JOURNEY_MAP **J-HRM-01** · matrix UF-HRM-01 · ADR group CEO `main` rollup

### UF-HRM-03 — employee edit→Lưu→F5

- **Persona / URL / click path:** profile `/hr/employees/dbdbece0-…` → **Chỉnh sửa** → edit `full_name` → **Lưu**
- **Trước mutate:** name `QA Dept Persist`
- **Action:** set `full_name` = `QA Dept Persist W6QA` → Lưu
- **Network:** `PATCH /api/hrm/employees/dbdbece0-6572-401a-b4eb-56781493a75f` → **200**
- **FE sau 2xx:** dialog closes; header updates
- **F5:** header **QA Dept Persist W6QA** persists (`05-employee-after-f5.png`)
- **Screenshot:** `03-employee-edit-dialog.png` · `04-employee-after-save.png` · `05-employee-after-f5.png`
- **Verdict:** 🟢
- **spec_ref:** P1 Wave 2 UF-HRM-03 · J-HRM-02 related
- **note:** QA marker left on pilot QA employee (API restore PATCH 400 without full DTO — soft residual P3)

### UF-HRM-10 — Settings catalog spot

- **Persona / URL / click path:** `/hr/settings` → **Danh mục nghiệp vụ** → **Chức danh**
- **Action:** live open form (no re-create this run)
- **Network:** settings/catalog GET **200**
- **FE sau 2xx:** `#md-code-positions` + `data-testid=md-upsert-form-positions` visible
- **Cite recent GWC create:** `qa-hrm-settings-md-pos-browser-01-20260727.md` — POST items **201** `category_key=job_titles` `QA_POS_2LVZCM` → F5
- **Screenshot:** `10-settings-positions.png`
- **Verdict:** 🟢 (spot + cite)
- **spec_ref:** FR-HRM-SC-MD-01 / FR-HRM-SC-POS-01 · AC-SET-FS-01/03

### UF-HRM-12 — recruitment requisition open/edit

- **Persona / URL / click path:** `/hr/recruitment` → tab **Yêu cầu tuyển dụng** → row **Chi tiết**
- **Action:** open detail dialog (Sửa available; status locked by QT workflow — no unsafe status PATCH)
- **Network:** `GET /api/hrm/recruitment/requisitions/fba681e2-2812-475c-bed3-faf7c5de72f2?company_id=holding` → **200**
- **FE sau 2xx:** dialog **Chi tiết yêu cầu tuyển dụng** · title `QA AC02 1784976472287` · status Chờ duyệt QT · **Sửa** button present
- **F5:** N/A (open/edit surface verified; mutate status blocked by WF copy — safe)
- **Screenshot:** `11-recruitment-list.png` · `12-recruitment-detail.png`
- **Verdict:** 🟢
- **spec_ref:** UC-HRM-22 · J-HRM-05 · matrix UF-HRM-12

### J-HRM-03 — contract list→detail

- **Persona / URL / click path:** `/hr/contracts` → open first row / Eye
- **Network:** contracts list GET **200** (detail by-id soft — UI drawer)
- **FE sau 2xx:** dialog **Chi tiết hợp đồng** · mã `HLD-0006-HD` · status Có hiệu lực · dates `dd/MM/yyyy`
- **Screenshot:** `06-contracts-list.png` · `07-contract-detail.png`
- **Verdict:** 🟢
- **spec_ref:** PROGRAM_JOURNEY_MAP **J-HRM-03**

### J-HRM-06 — attendance path load

- **Persona / URL / click path:** `/hr/attendance` → tab **Nghỉ phép** (load only)
- **Network:** attendance GET **200** · `GET …/leave-requests?company_id=main` **200**
- **FE sau 2xx:** attendance shell + leave tab loads
- **Mutate:** **not** executed (Leave create BLOCKED — below)
- **Screenshot:** `08-attendance.png` · `09-attendance-leave-tab.png`
- **Verdict:** 🟢 (load path)
- **spec_ref:** PROGRAM_JOURNEY_MAP **J-HRM-06** · UF-HRM-05

### Leave-request create — 🟡 BLOCKED

- **Cite:** `docs/qa/evidence/qa-hrm-leave-req-create-01-20260727.md`
- **Network (prior):** `POST …/leave-requests` → **400** `HRM-ATT-LEAVE-TYPE` (`LVT_01` rejected vs catalog partition / company_id TEXT)
- **BE in flight:** `D-HRM-LEAVE-REQ-CREATE-BE-01` (bus 2026-07-27)
- **Seed:** **not used** (U65)
- **Verdict:** 🟡 BLOCKED — not invented PASS

---

## journey_l25

| J-ID | Result | Evidence |
|------|--------|----------|
| J-HRM-01 | PASS | list→detail click + GET 200 |
| J-HRM-03 | PASS | contracts → Chi tiết dialog |
| J-HRM-06 | PASS | attendance + leave list load |

---

## Classification ENV vs PRODUCT

| Finding | Class | Owner |
|---------|-------|-------|
| Deep UF/J P0 click paths PASS on `:5173` + `dist-uat-w6` | **PRODUCT** OK (bounded) | — |
| Leave create POST 400 `HRM-ATT-LEAVE-TYPE` | **PRODUCT** P0 open | **dev-be** `D-HRM-LEAVE-REQ-CREATE-BE-01` |
| `qc:dev-stack` UV abort after ✓ probes | **ENV** P3 Windows flake | devops optional |
| Employee `W6QA` marker leftover (restore API 400) | **ENV/data** P3 | QA hygiene / optional FE revert |
| Dry-run-02 was load-only | **PROCESS** closed by this WI | INC-QA-EVIDENCE-WITHOUT-RUN honored |

---

## Residual

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| Leave create `HRM-ATT-LEAVE-TYPE` | **P0** | dev-be → qa retest | Do not seed; retest after BE READY_FOR_QA |
| Full Wave 2 11/11 (UF-09/11/13…) | P2 | pm | Out of this deep P0 slice |
| POS/leave/dept full MD matrix 🟢 | P2 | — | Not claimed; POS spot + cite only |
| HOLD_DEPLOY / SP-01 sponsor visual | P1 program | pm/sponsor | This WI ≠ sponsor UAT-PASS |

---

## Handoff

```yaml
work_item_id: QA-PCOMP-W6-BROWSER-HRM-DEEP-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qa-pcomp-w6-browser-hrm-deep-01-20260727.md
completion_report: |
  Closed W6 deep FE browser P0 on portal :5173 + dist-uat-w6 (U65 zero-seed).
  PASS: UF-HRM-01/J-HRM-01, UF-HRM-03 (PATCH 200+F5), UF-HRM-10 spot+cite POS GWC,
  UF-HRM-12 requisition Chi tiết+GET 200, J-HRM-03, J-HRM-06 load.
  BLOCKED: leave-request create (cite QA-HRM-LEAVE-REQ-CREATE-01 / BE in flight).
  Not claimed: Phase1/PROD/:8088 / full Wave2 / sponsor UAT-PASS.
next_owner: pm
next_dispatch_prompt: |
  PM intake QA-PCOMP-W6-BROWSER-HRM-DEEP-01 PASS_TO_PM.
  Keep D-HRM-LEAVE-REQ-CREATE-BE-01 in flight; after READY_FOR_QA dispatch
  QA-HRM-LEAVE-REQ-CREATE-02 browser retest U65 (no seed).
  Optional: QC spot-audit this evidence pack (command_table + journey_l25 + screens)
  before/alongside PCOMP-W6-SP-01 sponsor invite — do not treat dry-run-02 as UF mutate PASS.
  HOLD_DEPLOY · keep dist-uat-w6 · cấm :8088.
pm_dispatch_hint: D-HRM-LEAVE-REQ-CREATE-BE-01 still P0 — then QA leave retest
```
