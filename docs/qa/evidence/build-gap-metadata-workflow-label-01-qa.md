# BUILD-GAP-METADATA-WORKFLOW-LABEL-01-QA — UF-HRM-11 metadata workflow labels

| Field | Value |
|-------|-------|
| work_item_id | BUILD-GAP-METADATA-WORKFLOW-LABEL-01-QA |
| from_role | qa |
| dev_handoff | BUILD-GAP-METADATA-WORKFLOW-LABEL-01 · `docs/qa/evidence/build-gap-metadata-workflow-label-01.md` |
| date | 2026-08-03 |
| ack_status | **PASS_TO_PM** |
| u65_zero_seed | true |
| uf_id | UF-HRM-11 · UC-HRM-26 |
| spec_ref | `HRM-SETTINGS.md` §2.8 · TC-SET-N-FD-006 / TC-SET-M-UX-009 (design) |
| hdsd_align | HRM Settings / hàng chờ metadata — cột **Quy trình** |

## L0 / L1 (pre-browser)

| Gate | Result |
|------|--------|
| `pnpm run qc:dev-stack` | HRM :28001 · XBOS :28002 · portal :5173 **200** (Node UV assert on exit — probes OK) |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Vitest | `metadataWorkflowLabel.test.ts` (5) + `useMetadataQueue.test.ts` (3) — **exit 0** |

## UF-HRM-11 — `/hr/employee-metadata` (`MetadataQueueTab`)

- **Persona / URL:** `ceo@xe.vn` / `Xevn@2026` · `http://127.0.0.1:5173/hr/employee-metadata?portal=1&tenantId=xevn&companyId=main`
- **Click path:** API login + portal storage inject (U65) → deep link employee-metadata (no seed · no mutate)
- **Trước mutate:** `GET …/change-requests?company_id=main&status=pending` → **200**, **total 0** (empty queue hợp lệ)
- **Action:** read-only mount — **không** duyệt/từ chối/gửi yêu cầu (cấm seed tạo row)
- **Network:** `GET /api/hrm/employee-metadata/change-requests?company_id=main&status=pending&page_size=50` → **200** (1 call)
- **FE sau load:**
  - H1 «Hàng chờ metadata nhân sự»; empty copy «Không có yêu cầu metadata đang chờ duyệt.»
  - Table header **Quy trình** (VI); **no** Vite overlay; **no** `Failed to resolve import metadataWorkflowLabel`
  - Vite module probes: `/hr/src/lib/metadataWorkflowLabel.ts` **200**, `MetadataQueueTab.tsx` **200**
  - **0** `[data-testid=metadata-workflow-label]` cells (empty queue) → **0** chuỗi `xbos.*` on screen
- **Approve/reject:** N/A trên empty queue; source + prior wiring: per-row **Duyệt** / **Từ chối** when `rows.length > 0` (`MetadataQueueTab.tsx`)
- **Row label AC (machine):** Vitest maps `xbos.employee_metadata.default` → «Duyệt thay đổi hồ sơ (mặc định)»; unknown technical ids → fallback VI; source scan cấm render raw `xbos.*` in TSX body
- **Console:** 0 `pageerror`; 0 blocking console `error`
- **F5:** not required (BUILD_GAP import-restore scope)
- **Verdict:** 🟢 **PASS** (mount + label contract; empty data)

## must_keep — MD panel spot (regression)

- **URL:** `/hr/settings?portal=1&tenantId=xevn&companyId=main` → tab **Danh mục nghiệp vụ**
- **FE:** `md-settings-panel` + `md-bucket-tabs` visible — **PASS** (unchanged vs `build-gap-md-panel-01-qa.md`)

## L2.5 note

BUILD_GAP scope = lib restore + queue UI mount. No J-HRM metadata list→detail journey in sprint matrix; empty queue → no row click path.

## Screenshots

| File | Note |
|------|------|
| `docs/qa/evidence/screens/build-gap-metadata-workflow-label-01-qa/01-employee-metadata-queue.png` | Empty queue + Quy trình column |
| `docs/qa/evidence/screens/build-gap-metadata-workflow-label-01-qa/02-settings-md-panel-spot.png` | MD panel must_keep |

## Machine trace

- Runtime JSON: `docs/qa/evidence/_tmp-build-gap-metadata-workflow-label-01-browser.json`
- Script: `scripts/qa/build-gap-metadata-workflow-label-01-browser.mjs` (exit 0)

## Residual

| Item | Owner | Note |
|------|-------|------|
| Live row label spot with pending CR | future PO-ECO-TC-EXEC / QA when FE creates request | Queue **0** today — không seed |
| HRM full `vite build` — `hrmCompanyEmployeeCount` | dev-fe (PM backlog) | Pre-existing; out of this work_item |
| TC-SET-M-UX-009 full UX class assert | PLANNED catalog | Not blocking BUILD_GAP closure |

## Handoff

```
completion_report: metadataWorkflowLabel restore verified — Vitest 8/8, U65 browser mount UF-HRM-11, Quy trình column VI, no xbos on screen (empty queue), GET change-requests 200, MD panel spot OK. No seed; not UAT DONE.
next_owner: pm
next_dispatch_prompt: PM — Close BUILD-GAP-METADATA-WORKFLOW-LABEL-01 on bus; optional QC doc spot; dispatch BUILD-GAP hrmCompanyEmployeeCount if full vite build green required; when pending metadata rows exist from FE flow, re-run browser script for row-level label + Duyệt/Từ chối click (no seed).
evidence_path: docs/qa/evidence/build-gap-metadata-workflow-label-01-qa.md
ack_status: PASS_TO_PM
```
