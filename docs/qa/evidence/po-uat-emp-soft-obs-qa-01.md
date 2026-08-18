# Evidence — `PO-UAT-EMP-SOFT-OBS-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UAT-EMP-SOFT-OBS-QA-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | execution · U65 zero-seed · browser-only |
| **parent** | `PO-UAT-EMP-SOFT-OBS-FE-01` `READY_FOR_QA` |
| **prior GWC** | `PO-UAT-EMP-QC-01` — soft OBS blocked clean GO |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` |
| **machine JSON** | `docs/qa/evidence/_tmp-po-uat-emp-soft-obs-qa-01.FINAL.json` |
| **run log** | `docs/qa/evidence/_tmp-po-uat-emp-soft-obs-qa-01.RUN.log` |
| **screens** | `docs/qa/evidence/screens/po-uat-emp-soft-obs-qa-01/` (12 PNG) |
| **harness** | `scripts/qa/_tmp-po-uat-emp-soft-obs-qa-01.mjs` |
| **stamp** | `EMPOBS-IE3ORQ` |
| **overall** | **PASS** |
| **ack_status** | **PASS_TO_PM** |

---

## Honesty (mandatory)

| Flag | Value | QA note |
|------|-------|---------|
| **hrm_personnel_uat_ready** | **false** | **DENIED invent** — QC decides clean GO / flag promote |
| **employees_e2e_linkage_ready** | **false** | unchanged |
| Seed / API-only PASS | **DENIED** | U65 browser mutate only |
| Module personnel UAT | **NOT claimed** | soft-OBS reconfirm ≠ full module UAT |

---

## Exit criteria matrix

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | **OBS-D1-HINT** — HRD_01 + effective + employee → `hdsd-decisions-effective-wh-hint` visible | 🟢 **PASS** | `hintVisible=true` · hint text WH neo · PNG `01` |
| 2 | D1 neo/badge still PASS (sealed) | 🟢 **PASS** | POST **201** `HRM-DEC-201` · `work_history_id=68a6480a-…` · badge `QSĐ QD-EMPOBS-IE3ORQ` · F5 · PNG `03` |
| 3 | **HRD_03** + effective → hint **absent** | 🟢 **PASS** | type `HRD_03 Kỷ luật` · `hintVisible=false` · PNG `04` · dialog cancelled (no invent WH) |
| 4 | **OBS-SI-DATE-ISO** — SI card + periods after stop/F5 = `dd/MM/yyyy` (no raw ISO) | 🟢 **PASS** | Card `30/07/2026 - 28/09/2026` · periods `06/08/2026` / `07/08/2026` · `hasIsoLeak=false` · PNG `05-si-date-surface` |
| 5 | **D5** body `company_id` still true | 🟢 **PASS** | stop POST **201** `HRM-EINS-200` · body `{ company_id:"main", action:"stop", effective_from:"2026-08-07" }` · wire ISO OK |
| 6 | **J03** not reopened | 🟢 **PASS** | sealed · no contracts Eye/dialog paths touched |
| 7 | Honesty — do not set personnel UAT flag | 🟢 **PASS** | `hrm_personnel_uat_ready=false` |

**Overall soft OBS:** **CLOSED** (browser reconfirm). Hand off **QC** for clean GO decision on personnel flag.

---

## L0 entry

| Check | Result |
|-------|--------|
| `qc:dev-stack` | HRM/XBOS/portal **200** |
| `qc:fe-be-health` | **ALL PASS** |
| Machine `l0` | hrm/xbos/portal **200** |

---

## UF blocks (browser U65)

### OBS-D1-HINT + D1 sealed 🟢
- Path: `/hr/decisions` → Thêm → type **HRD_01 Bổ nhiệm** → employee UAT NV 0100 → position CEO → status **Có hiệu lực**
- **FE pre-save:** `[data-testid=hdsd-decisions-effective-wh-hint]` **visible** (blue WH neo copy)
- Network: POST `/api/hrm/decisions` → **201** `HRM-DEC-201`
- FE sau 2xx + F5 WH: `work_history_id` set · badge **QSĐ QD-EMPOBS-IE3ORQ**
- Screens: `01-d1-hrd01-hint` · `02` · `03-d1-wh-f5`
- Verdict: 🟢 soft OBS closed · sealed D1 **not reopened**

### OBS-D1-HINT HRD_03 absent 🟢
- Path: Thêm → type **HRD_03 Kỷ luật** → employee → effective
- Hint count/visible: **false**
- No Lưu (cancel) — no WH invent
- Screen: `04-d1-hrd03-no-hint`
- Verdict: 🟢

### OBS-SI-DATE-ISO 🟢
- Path: employee `22222222-…` (Tran Thi B) · `?tab=insurance` · F5
- Card: `30/07/2026 - 28/09/2026` (not `2026-07-29T…`)
- Periods list: `suspended 06/08/2026 → 06/08/2026` · `stopped 07/08/2026 → …`
- Machine: `hasIsoLeak=false` on card + periods surface · `displayClean=true`
- Screen: `05-si-date-surface`
- Verdict: 🟢 soft OBS closed

### D5 body company_id sealed 🟢
- FE create enrollment on UAT NV 0100 (dates filled via ViDateField) → stop action
- Network: POST `…/employee-insurances/:id/actions` → **201** `HRM-EINS-200`
- Request body: `{ "company_id": "main", "action": "stop", "effective_from": "2026-08-07" }`
- Wire `effective_from` remains `yyyy-MM-dd` (display-only format change)
- Screens: `05a`/`05b` create · `06` dialog · `07` post · `08` F5
- Verdict: 🟢 sealed D5 **not reopened**

### J03 🟢
- Out of soft-OBS scope · **R-J03-DIALOG** remains SEALED · not reopened

---

## Sealed must_keep

| ID | Status |
|----|--------|
| R-EMP-DEC-WH-NEO-CATALOG (D1) | **SEALED** reconfirm |
| R-EMP-SI-ACTION-COMPANY-ID-BODY (D5) | **SEALED** reconfirm |
| R-J03-DIALOG | **SEALED** not reopened |
| OBS-D1-HINT | **CLOSED** |
| OBS-SI-DATE-ISO | **CLOSED** |

**P0/P1 product residuals:** none (`residuals: []`).

---

## Process

| Check | Result |
|-------|--------|
| pageErrors | `[]` |
| Seed | DENIED |
| Invent `hrm_personnel_uat_ready=true` | DENIED |

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Soft OBS browser U65 PASS (`EMPOBS-IE3ORQ`): OBS-D1-HINT visible for HRD_01+effective; HRD_03 hint absent; SI card/periods `dd/MM/yyyy` no ISO leak; D5 body `company_id=main` still 201; D1/D5/J03 sealed; honesty flag remains false. |
| **next_owner** | **qc** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-uat-emp-soft-obs-qa-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt

```text
work_item_id: PO-UAT-EMP-SOFT-OBS-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-UAT-EMP-SOFT-OBS-QA-01 PASS_TO_PM
entry_criteria: QA evidence docs/qa/evidence/po-uat-emp-soft-obs-qa-01.md · machine _tmp-po-uat-emp-soft-obs-qa-01.FINAL.json stamp EMPOBS-IE3ORQ · screens po-uat-emp-soft-obs-qa-01
exit_criteria:
  - Audit soft OBS CLOSED (OBS-D1-HINT · OBS-SI-DATE-ISO) with browser evidence
  - Confirm D1/D5/J03 sealed not reopened
  - Decide clean GO vs GWC on personnel slice; ONLY if clean GO + sponsor honesty OK may recommend hrm_personnel_uat_ready — do NOT invent flag in QC without GO wording
  - C-SLICE-≠-MODULE honesty retained unless full-module scope explicit
cấm: invent hrm_personnel_uat_ready=true without clean GO · reopen sealed residuals · seed
evidence: docs/qa/evidence/po-uat-emp-soft-obs-qc-01.md
```
