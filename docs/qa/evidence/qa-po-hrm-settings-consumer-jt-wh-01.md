# Evidence — QA-PO-HRM-WH-POSITION-PICKER-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-WH-POSITION-PICKER-01` |
| **ac_id** | **AC-SET-CONSUMER-JT-WH-01** |
| **from_role** | `qa` |
| **date** | 2026-08-11 |
| **stamp** | **`WHPOS1-MSNL05LB`** |
| **ack_status** | **`FAIL_TO_PM`** |
| **overall** | **FAIL** (U65 browser · không seed) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **portal** | `http://127.0.0.1:5173` · hrm-api `:28001` |
| **commit** | `dc930c5` |
| **runner** | `scripts/qa/_tmp-qa-po-hrm-wh-position-picker-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-qa-po-hrm-wh-position-picker-01.json` |
| **dev handoff** | `po-hrm-settings-consumer-jt-wh-fe-01.md` · `po-hrm-settings-consumer-jt-wh-be-01.md` |
| **spec_ref** | `docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.2 **AC-SET-CONSUMER-JT-WH-01** · `docs/hrm/SRS.md` §16.8 O4 |

## Gates

| Gate | Command / artifact | Result |
|------|-------------------|--------|
| **L0** | `pnpm run qc:fe-be-health` | **exit 0** — ALL PASS |
| **L1 (unit)** | vitest `po-hrm-settings-consumer-jt-wh-fe-01.test.ts` | **4/4** pass |
| **L1 (unit)** | jest `po-hrm-settings-consumer-jt-wh-be-01.spec.ts` | **4/4** pass (mocks) |
| **L2 / U65 browser** | QTCT Vị trí picker → Lưu → F5 | **FAIL** — POST **400** |

## UF-HRM-10 narrow — Quá trình công tác · Vị trí (`hdsd-work-timeline-position-picker`)

| Check | Result |
|-------|--------|
| **Verdict** | **FAIL** |
| **URL** | `http://127.0.0.1:5173/hr/employees/33333333-3333-4333-8333-333333333333?portal=1&tenantId=xevn&companyId=main` |
| **Click path** | Login (inject portal auth) → NV **Le Van C** → tab **Quá trình công tác** → **Thêm** (`hdsd-work-timeline-add-btn`) → **Vị trí** (`hdsd-work-timeline-position-picker`) → chọn **giám đốc** → **Lưu** (`hdsd-work-timeline-submit`) → F5 |
| **Trước mutate** | `GET …/work-timeline?company_id=main` **200** · `count=0` |
| **Picker FE** | `hdsd-work-timeline-position-picker` **mount** · **không** `input[name=position]` free-text SoT |
| **Network mutate** | `POST /api/hrm/employees/…/work-timeline?company_id=main` → **400** `HRM-WH-PICK-REQUIRED` |
| **Request body** | `position_key=ceo` · `position=giám đốc` · `department_key=DEPT_01` · `title=QA QTCT WHPOS1-MSNL05LB` |
| **FE sau 2xx (SRS)** | **Không đạt** — toast/console: `position_key 'ceo' is not in job_titles catalog` |
| **F5** | List vẫn **0** dòng QTCT mới |
| **Console** | `Failed to load resource: 400` · `Error saving work history: ApiClientError` (không `Uncaught` crash) |

### Catalog baseline (read-only, không seed)

| Source | `job_titles` EFF |
|--------|------------------|
| `GET /api/hrm/settings-catalogs?company_id=main` (overview) | **5** codes: `ceo`, `CHRO`, `dev_dead`, `DRIVER_LEAD`, `OPS_MANAGER` |
| `GET …/settings-catalogs/job_titles/items?company_id=main` | **5** active rows (same codes) |

### Defect — scope / catalog assert parity (P0)

**Triệu chứng:** Picker + overview API expose `ceo` (và các code khác) nhưng **POST work-timeline** với cùng `position_key` → **400** cho mọi code thử (`ceo`, `CHRO`, `CEO`, `OPS_MANAGER`) với `company_id=main`.

**Phân loại:** `scope_parity` / **BE catalog assert ≠ FE effective list** (list có data · mutate reject).

**Owner đề xuất:** `dev-be` — `assertCodeInEffectiveCatalog` / company scope cho `job_titles` trên `main` vs items endpoint.

**Cấm promote:** `settings_catalog_e2e_ready` flip · **UF-HRM-10 full PASS** · probe-only PASS.

## HDSD inventory (U76)

| testid | Màn / bước |
|--------|------------|
| `hdsd-work-timeline-add-btn` | QTCT → Thêm dòng |
| `hdsd-work-timeline-position-picker` | Dialog → Vị trí catalog |
| `hdsd-work-timeline-submit` | Dialog → Lưu |

## Screenshots

- `docs/qa/evidence/screens/qa-po-hrm-wh-position-picker-01/01-profile.png`
- `docs/qa/evidence/screens/qa-po-hrm-wh-position-picker-01/02-wh-dialog.png`
- `docs/qa/evidence/screens/qa-po-hrm-wh-position-picker-01/03-after-save.png`
- `docs/qa/evidence/screens/qa-po-hrm-wh-position-picker-01/04-f5.png`

## Residual / honesty

| Item | Note |
|------|------|
| AC-SET-CONSUMER-JT-WH-01 | **OPEN** — FE leg 🟡 partial (picker OK) · E2E mutate **🔴** |
| UF-HRM-10 full | **DENIED** — chỉ narrow QTCT leg; matrix `BR-SET-CONSUMER-MATRIX-01` still OPEN |
| L2.5 J-* | **N/A** slice — không claim J-HRM journey closure |

## completion_report

**Closed:** L0 PASS · vitest/jest slice PASS · U65 browser path executed với HDSD testids · evidence + Network body captured.

**Open (P0):** POST/PATCH work-timeline **400** `HRM-WH-PICK-REQUIRED` dù `position_key` ∈ `GET job_titles/items` — chặn AC pass (2xx + F5 label).

## next_owner

`dev-be` (catalog assert scope `main`) → sau fix `qa` retest cùng `work_item_id` suffix `-02`.

## next_dispatch_prompt

```text
work_item_id: D-BE-HRM-WH-POSITION-CATALOG-SCOPE-01
role: dev-be
read_first:
  - docs/qa/evidence/qa-po-hrm-settings-consumer-jt-wh-01.md
  - docs/qa/evidence/po-hrm-settings-consumer-jt-wh-be-01.md
  - docs/hrm/API_DESIGN_HRM_MD_BIND_E1A.md WH-C
entry_criteria: QA FAIL WHPOS1-MSNL05LB — POST work-timeline 400 HRM-WH-PICK-REQUIRED for position_key in GET job_titles/items (company_id=main)
exit_criteria:
  - assertCodeInEffectiveCatalog(job_titles) khớp items API + overview cho main
  - POST work-timeline position_key=ceo|CHRO → 201 từ browser path hoặc jest integration với catalog thật (không chỉ mock)
  - regression po-hrm-settings-consumer-jt-wh-be-01.spec.ts exit 0
  - evidence docs/qa/evidence/po-hrm-settings-consumer-jt-wh-be-02.md
  - ack_status READY_FOR_QA → QA-PO-HRM-WH-POSITION-PICKER-02
must_keep: settings_catalog_e2e_ready=false
cấm: seed để pass assert
```

**ack_status:** **FAIL_TO_PM**
