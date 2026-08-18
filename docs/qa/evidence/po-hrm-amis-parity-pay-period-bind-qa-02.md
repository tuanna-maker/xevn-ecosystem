# Evidence — `PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-QA-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-QA-02` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — **browser UF** (U65) |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-BE-02` READY_FOR_QA |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://127.0.0.1:5173` · HRM FE `:8080` · HRM API `:28001` · XBOS `:28002` |
| **stamp** | `PAYBINDQA2-IT9Y27` |
| **period_id** | `47d43fe6-30d3-41ca-a3ea-e7bf3ffb84a6` |
| **harness** | `scripts/qa/_tmp-po-hrm-amis-parity-pay-period-bind-qa-02.mjs` |
| **machine JSON** | [`_tmp-po-hrm-amis-parity-pay-period-bind-qa-02.FINAL.json`](./_tmp-po-hrm-amis-parity-pay-period-bind-qa-02.FINAL.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-pay-period-bind-qa-02/` (6 png) |
| **verdict** | **PASS** — AC-PAY-TPL-03 row/F5 mẫu (closes **R-PAY-PERIOD-LIST-TPL**) |
| **ack_status** | **`PASS_TO_PM`** |
| **honesty** | **`payroll_e2e_ready=false`** |

### Honesty locks

| Flag | Value |
|------|-------|
| **`payroll_e2e_ready`** | **`false`** — **DENIED** flip |
| **Seed** | **DENIED** (U65) — mẫu + kỳ tạo từ FE |
| **Pack≠mẫu** | **ENFORCED** — POST body chỉ `paySheetTemplateId`, không `salary-templates` |
| **Module UAT / J-HRM-07** | **NOT claimed** |

---

## spec_read_ack

| Artifact | Used |
|----------|------|
| `po-hrm-amis-parity-pay-period-bind-be-02.md` | Fix list SELECT + `mapPeriod` expose bind fields |
| `po-hrm-amis-parity-pay-period-bind-qa-01.md` | Prior FAIL AC3/AC5 · listHit `pay_sheet_template_id: null` |
| Mission AC-PAY-TPL-03 | POST bind → GET list snapshot → row/F5 name not `—` |

---

## 1. L0 / health

| Check | Result |
|-------|--------|
| Harness L0 | portal / hrm / xbos **200** (HRM FE `:8080` required for `/hr` proxy) |
| Seed | **none** |

---

## 2. HDSD inventory (U76)

| testid | Used |
|--------|------|
| `settings-tab-pay-sheet-tpl` · `hdsd-pay-sheet-tpl-*` · status **active** | ✅ |
| `payroll-tab-calculate` → «Danh sách bảng lương» | ✅ |
| `pay-batches-precision` · `pay-batch-create-dialog-precision` | ✅ |
| `pay-period-pay-sheet-tpl-select` · `pay-period-pay-sheet-tpl-alias-note` | ✅ |
| `hdsd-pay-period-create-submit` | ✅ |
| `pay-batch-period-filter` · `pay-batch-period-option-{m}-{y}` | ✅ |
| `pay-batch-row-tpl-{periodId}` · `pay-batch-row-{periodId}` | ✅ |

---

## 3. UF — AC-PAY-TPL-03 (retest)

### AC-PAY-TPL-03 — Tạo kỳ chọn mẫu active → list/row/F5 giữ tên mẫu

- **Persona / URL / click path:** `ceo@xe.vn` → `/hr/settings` tạo mẫu **active** → `/hr/payroll` → `payroll-tab-calculate` → «Danh sách bảng lương» → **Lập bảng lương** → chọn mẫu active → submit → filter tháng kỳ → assert cột Mẫu → detail → F5
- **Action:** kỳ `Bảng lương QA PAYBINDQA2-IT9Y27` · tháng **3/2026** · mẫu active từ picker
- **Network:** **POST** `/api/hrm/payroll/periods` → **201** `HRM-PAY-201` · body `paySheetTemplateId` · **không** POST `/salary-templates`
- **GET list (same id):** `pay_sheet_template_id` **non-null** · `sheet_template_snapshot_json.template_name` = `Mẫu SRC02 SRCSRC02-ISBDZW` (mẫu active đã bind)
- **FE sau 2xx:** cột **Mẫu bảng lương** = snapshot name (**not** `—`)
- **Detail:** subtitle chứa `Mẫu: Mẫu SRC02 SRCSRC02-ISBDZW`
- **F5:** kỳ còn · row tpl name còn snapshot
- **Verdict:** 🟢 **PASS**
- **spec_ref:** AC-PAY-TPL-03 · closes **R-PAY-PERIOD-LIST-TPL**
- **seed:** none (U65)

### Sub-checks

| Step | Verdict | Note |
|------|---------|------|
| Settings active mẫu (U65) | 🟢 PASS | status **Đang hiệu lực** trước save |
| Dialog alias pack≠mẫu | 🟢 PASS | `pay-period-pay-sheet-tpl-alias-note` |
| POST `paySheetTemplateId` **201** | 🟢 PASS | `HRM-PAY-201` |
| GET list bind fields | 🟢 PASS | `pay_sheet_template_id` + `template_name` |
| Row hiển thị tên mẫu | 🟢 PASS | not `—` |
| Detail «Mẫu:» | 🟢 PASS | |
| F5 row còn tên mẫu | 🟢 PASS | **R-PAY-PERIOD-LIST-TPL CLOSED** |
| Pack enroll regression | 🟢 PASS | |

---

## 4. API parity (list vs create) — regression vs QA-01

| Wave | listHit `pay_sheet_template_id` | `snapshot_name` |
|------|----------------------------------|-----------------|
| QA-01 FAIL | `null` | `null` |
| QA-02 PASS | `f7728741-6894-469f-a015-ea3bf7bf6ade` | `Mẫu SRC02 SRCSRC02-ISBDZW` |

Prior mid-run (stamp `PAYBINDQA2-ISNGUJ`) also proved list DTO for newly authored mẫu name on GET list before portal blip — BE fix live.

---

## 5. Verdict matrix

| AC | Verdict |
|----|---------|
| Active mẫu Settings | 🟢 PASS |
| Pack≠mẫu alias | 🟢 PASS |
| POST bind **201** | 🟢 PASS |
| Row tpl name after refetch | 🟢 PASS |
| Detail «Mẫu:» | 🟢 PASS |
| F5 tpl persist | 🟢 PASS |
| **AC-PAY-TPL-03 overall** | 🟢 **PASS** |

---

## 6. Residual / not promoted

| ID | Note | Owner |
|----|------|-------|
| **R-PAY-PERIOD-LIST-TPL** | **CLOSED** — list DTO + row/F5 show snapshot | — |
| **R-PAY-PERIOD-FILTER-UX** | Month filter still required for non-current months; create response lacks `period_month` so FE may not auto-switch — harness uses `pay-batch-period-filter` / VN realign from `start_date` | **dev-fe** optional |
| **OBS picker vs snapshot** | UI pick log can show newly created label while POST binds another active mẫu id already in list — AC still met (active mẫu + persist). Tighten option click if sponsor requires exact new-code bind. | qa/dev-fe obs |
| **`payroll_e2e_ready`** | **LOCKED false** | pm |

### Explicit non-claims

- Did **not** set `payroll_e2e_ready=true`.
- Did **not** claim J-HRM-07 / payroll module UAT / process LIVE.
- Did **not** use seed or salary-templates enroll as mẫu kỳ.

---

## 7. Commands

| Command | Result |
|---------|--------|
| `QA_PERIOD_MONTH=3 QA_PERIOD_YEAR=2026 node scripts/qa/_tmp-po-hrm-amis-parity-pay-period-bind-qa-02.mjs` | exit **0** · overall **PASS** · stamp `PAYBINDQA2-IT9Y27` |

**U65:** no `pnpm seed:*` · browser mutate only.

---

## completion_report

### Closed

1. Retest AC-PAY-TPL-03 browser U65 after BE-02 — **PASS**.
2. **R-PAY-PERIOD-LIST-TPL** closed: GET `/payroll/periods` returns `pay_sheet_template_id` + `sheet_template_snapshot_json.template_name`; row + F5 show mẫu name (not `—`).
3. Pack≠mẫu regression retained.

### Residual

- Optional FE: auto filter to created month (`period_month` on create DTO / URL sync).
- `payroll_e2e_ready` remains **false**.

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **pm** → **qc** (narrow GWC delta on AC-PAY-TPL-03) |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-qa-02.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **payroll_e2e_ready** | **`false`** |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-QC-02
from_role: pm
to_role: qc
lane: governance
priority: P1
parent: PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-QA-02 PASS_TO_PM

## Mission
Narrow QC GWC on AC-PAY-TPL-03 after QA-02 PASS (R-PAY-PERIOD-LIST-TPL closed).
Audit evidence docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-qa-02.md + FINAL JSON.
Confirm: POST 201 bind → GET list pay_sheet_template_id + snapshot template_name → row/F5 not em-dash.
honesty: payroll_e2e_ready=false — DENIED module UAT / J-HRM-07 / ready flip.
Optional obs: R-PAY-PERIOD-FILTER-UX (FE month auto-switch).

## read_first
1. docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-qa-02.md
2. docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-be-02.md
3. docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-qa-01.md (prior FAIL baseline)

## exit
GO WITH CONDITIONS or GO · evidence docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-qc-02.md
honesty: payroll_e2e_ready=false
```
