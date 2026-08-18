# Evidence — QA-PO-HRM-CTR-PICKER-INLINE-PORTAL-01-RETEST-DND

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-CTR-PICKER-INLINE-PORTAL-01-RETEST-DND` |
| **stamp** | **`CTRPICKRTDND-MSMTBIID`** |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL (BLOCKED — U65 data prereq)** · C-SLICE · `contracts_printable_ready=false` |
| **URL (mandatory)** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **persona** | `ceo@xe.vn` · `companyId=main` · U65 zero-seed |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-picker-inline-portal-retest-dnd-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-picker-inline-portal-retest-dnd-qa-01.json` |
| **FE handoff** | `docs/qa/evidence/po-hrm-ctr-create-redesign-fe-04-dnd-parent-02.md` |
| **commit** | `dc930c5` |

## Gates

| Gate | Result |
|------|--------|
| L0 | `pnpm run qc:dev-stack` — hrm + xbos + portal **200** |
| L0+ | `pnpm run qc:fe-be-health` — **ALL PASS** (post-restart) |

## Scope exit

| AC / J | Verdict | Detail |
|--------|---------|--------|
| **AC-CTR-SUBJECT-02** | **BLOCKED** | Không có `ctr-create-template-combobox` (0 active template); `ctr-create-no-active-template-banner` hiển thị; không chọn UV (`candidates` API **0**). |
| **AC-CTR-DND-01** | **BLOCKED** | Không vào bước 2 — thiếu mẫu HĐ active. **FE-04 `ctr-create-clause-dnd-ready` chưa kiểm được.** |
| **AC-CTR-DND-02** | **BLOCKED** | Cùng lý do — chưa có canvas. |
| **J-HRM-CTR-CREATE-02** | **BLOCKED** | Parent-portal dialog mở (`dialog_on=parent-portal`) nhưng wizard kẹt bước 1. |

## U65 data probe (API — không mutate)

| Probe | Result |
|-------|--------|
| `GET …/contract-templates?company_id=main&status=active` | **200** · **0** items |
| `GET …/recruitment/candidates?company_id=main&page_size=5` | **200** · **0** rows |

## Embed / DnD

| Check | Value |
|-------|--------|
| dialog mount | `parent-portal` |
| step-1 | visible; `ctr-create-contract-code` **visible** |
| template picker | **absent** (`CatalogSearchPicker` renders empty-state khi `options.length===0`, không gắn `ctr-create-template-combobox`) |
| `ctr-create-clause-dnd-ready` | **not reached** |
| DnD storms | **none** (không tới bước 2) |

## Defects

- **DEF-CTR-U65-DATA-PREREQ** (P0 test block): Môi trường local không có mẫu HĐ **active** và không có UV — U65 cấm seed; cần luồng FE trước (Cài đặt mẫu HĐ + tuyển dụng) hoặc DB pilot đã có fidelity.
- **DEF-CTR-PICKER-QA-FATAL** (P0 harness): Playwright timeout chờ `ctr-create-template-combobox` — **expected** khi không có template options (harness cần fallback banner / prereq gate).

## Screens

- `docs/qa/evidence/screens/po-hrm-ctr-picker-inline-portal-retest-dnd-qa-01/debug-wizard.png`

## Console

— (run ổn định, không DnD storm)

## QA conclusion

- **SUBJECT-02 regression:** **BLOCKED** — không tái hiện được lần PASS `CTRPICKQA1-MSMSODO2` trên DB hiện tại.
- **DND-01 / DND-02 / J-CREATE-02:** **BLOCKED** — không đánh giá được fix FE-04 (`ctr-create-clause-dnd-ready`).
- **Not promoted:** printable UAT · `contracts_printable_ready=false`.

**ack_status:** **FAIL_TO_PM**
