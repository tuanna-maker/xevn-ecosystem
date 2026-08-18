# Evidence — QA-PO-HRM-WH-POSITION-PICKER-02

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-WH-POSITION-PICKER-02` |
| **ac_id** | **AC-SET-CONSUMER-JT-WH-01** |
| **from_role** | `qa` |
| **date** | 2026-08-11 |
| **stamp** | **`WHPOS1-MSNL78LF`** |
| **ack_status** | **`PASS_TO_PM`** |
| **overall** | **PASS** (U65 browser · không seed) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **portal** | `http://127.0.0.1:5173` · hrm-api `:28001` |
| **commit** | `dc930c5` |
| **prior_fail** | `WHPOS1-MSNL05LB` (`qa-po-hrm-settings-consumer-jt-wh-01.md`) |
| **be_fix** | `D-BE-HRM-WH-POSITION-CATALOG-SCOPE-01` · `po-hrm-settings-consumer-jt-wh-be-02.md` |
| **runner** | `scripts/qa/_tmp-qa-po-hrm-wh-position-picker-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-qa-po-hrm-wh-position-picker-01.json` (stamp MSNL78LF) |
| **spec_ref** | `docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.2 **AC-SET-CONSUMER-JT-WH-01** · `docs/hrm/SRS.md` §16.8 O4 |

## Gates

| Gate | Command / artifact | Result |
|------|-------------------|--------|
| **L0** | `pnpm run qc:fe-be-health` | **exit 0** — ALL PASS |
| **L1 (unit FE)** | vitest `po-hrm-settings-consumer-jt-wh-fe-01.test.ts` | **4/4** pass |
| **L1 (unit BE)** | jest `po-hrm-settings-consumer-jt-wh-be-01.spec.ts` + `be-erp-e1a-pos-key-01.spec.ts` | **23/23** pass |
| **L2 / U65 browser** | QTCT Vị trí picker → Lưu → F5 | **PASS** — POST **201** |

## UF-HRM-10 narrow — Quá trình công tác · Vị trí (`hdsd-work-timeline-position-picker`)

| Check | Result |
|-------|--------|
| **Verdict** | **PASS** |
| **URL** | `http://127.0.0.1:5173/hr/employees/33333333-3333-4333-8333-333333333333?portal=1&tenantId=xevn&companyId=main` |
| **Click path** | Login (inject portal auth) → NV **Le Van C** → tab **Quá trình công tác** → **Thêm** (`hdsd-work-timeline-add-btn`) → **Vị trí** (`hdsd-work-timeline-position-picker`) → chọn **giám đốc** (`position_key=ceo`) → **Lưu** (`hdsd-work-timeline-submit`) → F5 |
| **Trước mutate** | `GET …/work-timeline?company_id=main` **200** · `count=0` |
| **Picker FE** | `hdsd-work-timeline-position-picker` **mount** · **không** `input[name=position]` free-text SoT |
| **Network mutate** | `POST /api/hrm/employees/…/work-timeline?company_id=main` → **201** `HRM-EMP-PROFILE-201` |
| **Request body** | `position_key=ceo` · `position=giám đốc` · `department_key=DEPT_01` · `title=QA QTCT WHPOS1-MSNL78LF` |
| **Catalog parity** | `ceo` ∈ prior `GET …/settings-catalogs` EFF **5** codes (`ceo`, `CHRO`, `dev_dead`, `DRIVER_LEAD`, `OPS_MANAGER`) |
| **FE sau 2xx (SRS)** | Row hiển thị label catalog **giám đốc** · list `count=1` sau POST |
| **F5** | `GET work-timeline` **200** · `count=1` · `position_key=ceo` · `position=giám đốc` persisted |
| **Console** | Không `Uncaught` · không 400 mutate |

### Catalog baseline (read-only, không seed)

| Source | `job_titles` EFF |
|--------|------------------|
| `GET /api/hrm/settings-catalogs?company_id=main` (overview) | **5** codes (see JSON `catalogs.sampleCodes`) |
| Mutate `position_key` | **`ceo`** — khớp items/overview |

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
| AC-SET-CONSUMER-JT-WH-01 | **Narrow PASS** — browser leg `ceo` · BE scope fix verified |
| **CHRO** second picker option | **Not re-clicked** this run; `CHRO` in EFF list · BE jest covers holding catalog assert |
| UF-HRM-10 full | **DENIED** — không claim full matrix / `BR-SET-CONSUMER-MATRIX-01` |
| `settings_catalog_e2e_ready` | **RETAIN false** — cấm flip |
| L2.5 J-* | **N/A** slice — không claim journey closure |

## completion_report

**Closed:** L0 PASS · vitest 4/4 · jest 23/23 · U65 HDSD QTCT path POST **201** · `position_key=ceo` parity với catalog EFF · F5 row + label persisted · closes **WHPOS1-MSNL05LB** / `D-BE-HRM-WH-POSITION-CATALOG-SCOPE-01`.

**Open:** UF-HRM-10 full sweep · optional QC narrow on AC-SET-CONSUMER-JT-WH-01 · CHRO explicit browser pick (non-blocker if PM waives).

## next_owner

`qc` (narrow AC gate) hoặc `pm` promote AC slice.

## next_dispatch_prompt

```text
work_item_id: QC-PO-HRM-SETTINGS-CONSUMER-JT-WH-01
role: qc
read_first:
  - docs/qa/evidence/qa-po-hrm-settings-consumer-jt-wh-02.md
  - docs/qa/evidence/po-hrm-settings-consumer-jt-wh-be-02.md
entry_criteria: QA-PO-HRM-WH-POSITION-PICKER-02 PASS_TO_PM stamp WHPOS1-MSNL78LF
exit_criteria:
  - Audit U65 evidence: POST 201, position_key catalog parity, F5 — không flip settings_catalog_e2e_ready
  - GWC hoặc GO narrow AC-SET-CONSUMER-JT-WH-01 only
  - evidence docs/qa/evidence/qc-po-hrm-settings-consumer-jt-wh-01.md
  - ack_status PASS_TO_PM
cấm: UF-HRM-10 full claim · seed
```

**ack_status:** **PASS_TO_PM**
