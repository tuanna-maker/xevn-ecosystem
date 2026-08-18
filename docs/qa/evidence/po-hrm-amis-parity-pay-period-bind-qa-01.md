# Evidence — `PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-QA-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — **browser UF** (U65) |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-FE-01` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **stamp** | `PAYBINDQA1-IRABN0` |
| **period_id** | `8af75b83-c9eb-4fb3-ae44-27e3fba60d71` |
| **harness** | `scripts/qa/_tmp-po-hrm-amis-parity-pay-period-bind-qa-01.mjs` |
| **machine JSON** | [`_tmp-po-hrm-amis-parity-pay-period-bind-qa-01.FINAL.json`](./_tmp-po-hrm-amis-parity-pay-period-bind-qa-01.FINAL.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-pay-period-bind-qa-01/` |
| **verdict** | **FAIL** — AC-PAY-TPL-03 row/F5 mẫu |
| **ack_status** | **`FAIL_TO_PM`** |
| **honesty** | **`payroll_e2e_ready=false`** |

### Honesty locks

| Flag | Value |
|------|-------|
| **`payroll_e2e_ready`** | **`false`** — **DENIED** flip |
| **Seed** | **DENIED** (U65) — mẫu + kỳ tạo từ FE |
| **Pack≠mẫu** | **ENFORCED** — POST body chỉ `paySheetTemplateId`, không `salary-templates` |
| **Module UAT** | **NOT claimed** |

---

## spec_read_ack

| Artifact | Used |
|----------|------|
| `po-hrm-amis-parity-pay-period-bind-fe-01.md` | Click path · testids · residual R-PAY-PERIOD-LIST-TPL |
| `po-hrm-amis-parity-pay-tpl-fe-01.md` | Settings mẫu prior · pack≠mẫu |
| `po-hrm-amis-parity-pay-depth-01.md` | **AC-PAY-TPL-03** · RJ-PAY-ENROLL-01 |

---

## 1. L0 / health

| Check | Result |
|-------|--------|
| Harness L0 | portal / hrm / xbos **200** |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Seed | **none** |

---

## 2. HDSD inventory (U76)

| testid | Used |
|--------|------|
| `settings-tab-pay-sheet-tpl` · `hdsd-pay-sheet-tpl-*` | ✅ tạo mẫu active U65 |
| `payroll-tab-calculate` → «Danh sách bảng lương» | ✅ |
| `pay-batches-precision` · `pay-batch-create-dialog-precision` | ✅ |
| `pay-period-pay-sheet-tpl-select` · `pay-period-pay-sheet-tpl-alias-note` | ✅ |
| `hdsd-pay-period-create-submit` | ✅ |
| `pay-batch-row-tpl-{periodId}` | ✅ asserted (empty) |

---

## 3. UF — AC-PAY-TPL-03

### AC-PAY-TPL-03 — Tạo kỳ chọn mẫu active

- **Persona / URL / click path:** `ceo@xe.vn` → `/hr/settings` tạo mẫu active → `/hr/payroll` → `payroll-tab-calculate` → «Danh sách bảng lương» → **Lập bảng lương** → chọn **Mẫu bảng lương** * → submit
- **Trước mutate:** ≥1 mẫu active trong picker (`GET …/pay-sheet-templates?active_only=true` **200**)
- **Action:** nhập tên kỳ `Bảng lương QA PAYBINDQA1-IRABN0` · tháng **3/2027** · chọn mẫu active → **Lập bảng lương**
- **Network:** **POST** `/api/hrm/payroll/periods` → **201** `HRM-PAY-201` · body có `paySheetTemplateId` (`c2073510-1b19-475e-9ce1-129e4a1b4e4d`) · **không** POST `/salary-templates`
- **Response snapshot:** `sheet_template_snapshot_json.template_name` = `QA mẫu bind PAYTPLQA-MSIGIKB1` · `pay_sheet_template_id` bound
- **FE sau 2xx (list refetch):** cột **Mẫu bảng lương** trống / `—` — row filter tháng hiện tại không thấy kỳ 3/2027 ngay; **GET list** trả period id nhưng `pay_sheet_template_id: null` · `snapshot_name: null`
- **F5:** không retest row (harness timeout trước F5 do row không visible under default filter) — **list API gap đủ root-cause** cho AC3 FAIL
- **Verdict:** 🔴 **FAIL** (POST bind OK · display/list persistence FAIL)
- **spec_ref:** AC-PAY-TPL-03 · `po-hrm-amis-parity-pay-depth-01.md` §4.1 · RJ-PAY-ENROLL-01
- **seed:** none (U65)

### Sub-checks

| Step | Verdict | Note |
|------|---------|------|
| Settings active mẫu (U65 create) | 🟢 PASS | POST `pay-sheet-templates` **201** |
| Dialog alias pack≠mẫu | 🟢 PASS | `pay-period-pay-sheet-tpl-alias-note` |
| POST `paySheetTemplateId` **201** | 🟢 PASS | Không dùng salary-templates enroll |
| Row hiển thị tên mẫu sau refetch | 🔴 **FAIL** | List DTO thiếu snapshot |
| Detail subtitle «Mẫu: …» | 🔴 **FAIL** | Blocked — row không mở được (filter + empty tpl cell) |
| F5 row còn tên mẫu | 🔴 **FAIL** | Same BE list gap (**R-PAY-PERIOD-LIST-TPL**) |

---

## 4. API parity probe (list vs POST create)

Harness captured **GET** `/api/hrm/payroll/periods?company_id=main` immediately after create:

```json
{
  "listHit": {
    "id": "8af75b83-c9eb-4fb3-ae44-27e3fba60d71",
    "pay_sheet_template_id": null,
    "snapshot_name": null
  }
}
```

POST create cùng id trả `paySheetTemplateId` + `snapshotTemplateName` — **list SELECT / `mapPeriod` không expose bind fields** (`payroll.service.ts` `listPayrollPeriods` + `mapPeriod`).

---

## 5. Verdict matrix

| AC | Verdict | Evidence |
|----|---------|----------|
| Active mẫu Settings | 🟢 PASS | U65 create FE |
| Pack≠mẫu alias on dialog | 🟢 PASS | alias note |
| POST bind **201** | 🟢 PASS | `HRM-PAY-201` + `paySheetTemplateId` |
| Row tpl name after refetch | 🔴 **FAIL** | list DTO null |
| Detail «Mẫu:» | 🔴 **FAIL** | blocked |
| F5 tpl persist | 🔴 **FAIL** | **R-PAY-PERIOD-LIST-TPL** |
| **AC-PAY-TPL-03 overall** | 🔴 **FAIL** | |

---

## 6. Residual / not promoted

| ID | Note | Owner |
|----|------|-------|
| **R-PAY-PERIOD-LIST-TPL** | `GET /payroll/periods` list: thiếu `pay_sheet_template_id` + `sheet_template_snapshot_json` trong SELECT và `mapPeriod` → FE row/detail `—` sau invalidateQueries/F5 | **dev-be** |
| **R-PAY-PERIOD-FILTER-UX** | Kỳ tạo tháng 3/2027 không hiện khi filter mặc định tháng hiện tại — QA harness timeout trên detail click (obs, không block BE fix) | **dev-fe** optional |
| **`payroll_e2e_ready`** | **LOCKED false** | pm |
| Process / SRC LIVE | **DENIED** | — |

### Explicit non-claims

- Did **not** set `payroll_e2e_ready=true`.
- Did **not** use `salary-templates` enroll làm mẫu kỳ.
- Did **not** claim J-HRM-07 / payroll module UAT.

---

## 7. Commands

| Command | Result |
|---------|--------|
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| `node scripts/qa/_tmp-po-hrm-amis-parity-pay-period-bind-qa-01.mjs` | exit **2** · overall **FAIL** · stamp `PAYBINDQA1-IRABN0` |

**U65:** no `pnpm seed:*` · browser mutate only.

---

## completion_report

### Closed (partial)

1. Browser U65: Settings tạo mẫu active → dialog **Lập bảng lương** với picker `pay-sheet-templates` + alias pack≠mẫu.
2. **POST** `/api/hrm/payroll/periods` **201** `HRM-PAY-201` với `paySheetTemplateId` — bind snapshot trên create response.
3. Xác nhận **R-PAY-PERIOD-LIST-TPL**: list API không trả snapshot → AC-PAY-TPL-03 **FAIL** row/F5 display.

### Residual (open)

- **dev-be:** expand `listPayrollPeriods` SELECT + `mapPeriod` return `pay_sheet_template_id` / `sheet_template_snapshot_json`.
- QA retest sau BE fix (same harness, expect AC3/AC5 PASS).

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **dev-be** (R-PAY-PERIOD-LIST-TPL) → **qa** retest |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-qa-01.md` |
| **ack_status** | **`FAIL_TO_PM`** |
| **payroll_e2e_ready** | **`false`** |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-BE-02
from_role: pm
to_role: dev-be
lane: execution
priority: P0
parent: PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-QA-01 FAIL

## Mission
Fix R-PAY-PERIOD-LIST-TPL: GET /api/hrm/payroll/periods list must return pay_sheet_template_id + sheet_template_snapshot_json (same as POST create bind / queryPeriodInScope).
Update listPayrollPeriods SELECT + mapPeriod() in apps/api/hrm-api/src/payroll/payroll.service.ts.
Regression jest scope parity · re-run QA harness po-hrm-amis-parity-pay-period-bind-qa-01.

## read_first
1. docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-qa-01.md
2. docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-fe-01.md § Residual
3. apps/api/hrm-api/src/payroll/payroll.service.ts mapPeriod + listPayrollPeriods

## exit
READY_FOR_QA · evidence docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-be-02.md
honesty: payroll_e2e_ready=false
```
