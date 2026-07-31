# Evidence — QA-REC-HDSD-COVERAGE-01C

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-REC-HDSD-COVERAGE-01C` |
| **parent** | `QA-REC-HDSD-COVERAGE-01` (batch C — U69) |
| **from_role** | qa |
| **to_role** | pm |
| **program** | `P-REC-E2E-13STEP-01` · U76 · U65 |
| **ack_status** | **PASS_TO_PM** |
| **Ngày** | 2026-08-01 (runtime UTC 2026-07-31) |
| **URL** | http://14.225.217.232:8088 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **hdsd_align** | SoftDel N/A · SoT `docs/qa/HDSD_REC_MENU_FUNCTION_INVENTORY.md` §1 CH04 (≈111–122) + §2 orphan |
| **entry** | browser-only · zero-seed · no SoftDel/BH |
| **runtime** | `docs/qa/evidence/_tmp-qa-rec-hdsd-coverage-01c-runtime.json` |
| **screens** | `docs/qa/evidence/screens/qa-rec-hdsd-coverage-01c-20260801/` |
| **harness** | `scripts/qa/qa-rec-hdsd-coverage-01c-browser.mjs` (+ recover/ch11 append) |

## L0

| Probe | Result |
|-------|--------|
| portal `:8088` | **200** |
| `/api/xbos/health` | 404 (path not used on this build — non-blocking) |
| `/api/hrm/health` | 404 (same) |
| WF defs unauth | 401 (expected) |

## HDSD coverage — Batch C (U76 inventory)

| hdsd_ref | Item (HDSD) | Click path | Verdict | Note |
|----------|-------------|------------|---------|------|
| CH04 §4.1 | Hộp thư Workflow — Action Cards | `/command-center` → Action Cards | 🟢 | 30× **Mở chi tiết**; GET tasks **200**; NHÂN SỰ 25 |
| CH04 §4.1 | Chi tiết task — **Hoàn thành** | Action Cards → Mở chi tiết → observe | 🟢 | Button **Hoàn thành** visible; **observe-only** (U65 — không approve task WF-definition lạ) |
| CH04 §4.1 | Chi tiết task — **Từ chối** | same drawer | 🟢 | Button **Từ chối** visible; observe-only |
| CH04 §4.2 | **Thêm quy trình mới** | `settings=workflow` | 🟢 | CTA present |
| CH04 §4.2 | Thẻ **Mẫu QT tuyển dụng HRM (bridge)** | `settings=workflow` · `data-testid=hrm-rec-wf-presets` | 🟡 | **product_gap**: bridge card ABSENT on `:8088`; list vẫn có `TDIT` + `hrm_requisition_approval` |
| CH04 §4.2 | **Chỉnh sửa** → mở canvas | row TDIT / hrm_requisition → **Chỉnh sửa** | 🟢 | Canvas «Tuyển dụng nhân sự» + **Lưu quy trình** |
| CH04 §4.2 | Cấu hình bước (Đồng ý / Từ chối / BOD) | canvas «Cấu hình bước & luồng» | 🟢 | HDSD step-flow copy present |
| CH04 §4.2 | **Lưu quy trình** · F5 | Lưu → reload `settings=workflow` | 🟢 | Save mutate 2xx + F5 vẫn thấy QT tuyển dụng |
| CH04 §4.4.1 | Áp dụng danh mục — chọn **Nguồn ứng viên** | `settings=hrm_catalog_apply_members` | 🟡 | **product_gap G-BM-03**: sidebar **không** có «Áp dụng danh mục HRM»; deep-link blank / CC `trim` crash; `ApplyCatalogToMembersPanel` missing in repo HEAD |
| CH04 §4.4.1 | **Tải lại nguồn tập đoàn** | — | 🟡 | Blocked by panel absent |
| CH04 §4.4.1 | **Áp dụng cho N ĐVTV** | — | 🟡 | ABSENT — no safe U65 apply path |
| CH11 §11.1 | Settings **Pull** / picker kênh TD · chức danh | `/hr/settings` → **Danh mục (XBOS + HRM)** → Đồng bộ từ XBOS | 🟢 | GET `/api/hrm/settings-catalogs` **200**; hasPull + hasChannel; UF-HRM-10 |

### Orphan HDSD (§2)

| hdsd_ref | Item | Verdict | Note |
|----------|------|---------|------|
| CH04 §4.2 orphan | Apply workflow to members (riêng) | 🟡 | **product_gap G-BM-03** — ABSENT (catalog apply §4.4.1 cũng ABSENT trên build) |

## Counts

| | |
|--|--|
| Inventory rows covered | **12** |
| 🟢 | **8** |
| 🟡 | **4** (+ 1 orphan 🟡) |
| 🔴 | **0** |
| Seed used | **None** |

## U65 notes

- Không seed inbox / API fake WF.
- Inbox **không trống** (30 Action Cards — chủ yếu «Duyệt định nghĩa quy trình» / Tuyển dụng nhân sự). Hoàn thành/Từ chối = **observe control** only; không click approve để tránh mutate task không thuộc chuỗi FE YCTD wave này.
- Catalog apply mutate **không** chạy — UI gap.
- SoftDel / BH: **N/A** (out of batch).

## Residuals (PM dispatch)

| ID | Severity | Owner | Summary |
|----|----------|-------|---------|
| R-REC-C-BRIDGE-01 | P2 | dev-fe | Deploy/wire `hrm-rec-wf-presets` «Mẫu QT tuyển dụng HRM (bridge)» trên `:8088` |
| R-REC-C-APPLY-01 | P1 | dev-fe (+dev-be) | Restore `ApplyCatalogToMembersPanel` + sidebar «Áp dụng danh mục HRM» · Nguồn ứng viên · Tải lại · Áp dụng N ĐVTV (G-BM-03) |
| R-REC-C-CC-TRIM-01 | P2 | dev-fe | CommandCenterPage `TypeError: …trim` khi `settings=hrm_catalog_apply_members` |
| R-REC-C-APPLY-WF-01 | P3 | ba/dev-fe | Orphan HDSD apply-WF-members — confirm ABSENT vs catalog-only |

## completion_report

**Closed**

- Batch C inventory CH04 Inbox / Canvas / Catalog apply + CH11 Pull: **mọi hàng có verdict + click path**.
- Inbox Action Cards 🟢; Hoàn thành/Từ chối 🟢 observe-only (U65).
- Canvas QT tuyển dụng: mở qua **Chỉnh sửa** TDIT + **Lưu** 2xx + F5 🟢.
- Bridge preset card + Áp dụng danh mục Nguồn ứng viên: 🟡 product_gap (không fake 🟢).
- CH11 Pull / catalogs: 🟢 qua `/hr/settings` → Danh mục (XBOS + HRM).
- Zero-seed · SoftDel/BH not touched.

**Open / residual**

- G-BM-03 apply-catalog panel missing on `:8088` / missing source file in HEAD.
- Bridge preset card not on VPS build.
- After **01A+01B+01C** → QC U76 spot / synth.

## next_owner

`pm` → after 01A+01B+01C complete → `qc` (`QC-REC-HDSD-U76-SPOT`) **or** synth coverage; parallel `dev-fe` for R-REC-C-APPLY-01 if P1.

## next_dispatch_prompt (copy-ready)

```text
work_item_id: QC-REC-HDSD-U76-SPOT
from_role: pm
to_role: qc
program: P-REC-E2E-13STEP-01 · U76
priority: P0
entry_criteria: QA-REC-HDSD-COVERAGE-01A + 01B + 01C PASS_TO_PM (or synth if any batch still open)
hdsd_align: true
hdsd_sot: docs/qa/HDSD_REC_MENU_FUNCTION_INVENTORY.md
read_first:
  - docs/qa/evidence/qa-rec-hdsd-coverage-01a-20260801.md
  - docs/qa/evidence/qa-rec-hdsd-coverage-01b-20260801.md
  - docs/qa/evidence/qa-rec-hdsd-coverage-01c-20260801.md
exit_criteria:
  - Spot-audit U76: sample ≥1 row/batch; reject false 🟢; confirm U65 zero-seed
  - GO / GWC with residual list (R-REC-C-APPLY-01 P1 catalog apply; bridge preset P2)
  - evidence: docs/qa/evidence/qc-rec-hdsd-u76-spot-20260801.md
ack_status_target: PASS_TO_PM
cấm: seed · SoftDel/BH retest in this spot
```

## pm_dispatch_hint

If 01A/01B not yet PASS → wait synth; else `QC-REC-HDSD-U76-SPOT`. Parallel optional: `dev-fe` **R-REC-C-APPLY-01** (ApplyCatalogToMembersPanel + sidebar Áp dụng danh mục HRM).
