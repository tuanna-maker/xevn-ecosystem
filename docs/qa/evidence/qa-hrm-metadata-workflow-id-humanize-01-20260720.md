# QA-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01 — Spot-check (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status** | **PASS_TO_PM** |
| **parent_condition** | `QC-HRM-MENU-FULL-SWEEP-01` GWC **C-HRM-MENU-SWEEP-01** P3 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` (session already authenticated; Group CEO `companyId=main`) |
| **sponsor_lock** | U65 zero-seed · browser-only · **no** reopen chrome-strip CLOSED · **no** Phase1/PROD claim |
| **date** | 2026-07-20 |
| **env** | portal `:5173` · HRM `/hr/employee-metadata?portal=1&tenantId=xevn&companyId=main` · hrm-api `:28001` · xbos-api `:28002` |
| **evidence_ref_fe** | `docs/qa/evidence/d-hrm-metadata-workflow-id-humanize-01-fe-20260720.md` |
| **screenshot** | `qa-hrm-metadata-workflow-id-humanize-01-20260720.png` (browser capture) |

---

## L0 entry

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` **200** · XBOS `:28002` **200** · portal `:5173` **200** |
| Seed | **None** (U65) — observed existing pending queue only |

---

## Scope (spot-check only)

| In scope | Out of scope |
|----------|--------------|
| `/hr/employee-metadata` load + cột **Quy trình** + VI headers | Approve/reject mutate deep test |
| Assert **no** `xbos.employee_metadata` / dotted machine workflow id in UI | `field_key` mono labels (e.g. `personal_email`) — FE residual optional |
| Close readiness for **C-HRM-MENU-SWEEP-01** | Reopen chrome-strip CLOSED rows; Phase1/PROD |

**UF / journey:** `UF-HRM-MENU-17` (metadata queue slice) · UC-HRM-26

---

## Click path (U65 browser)

1. Session `ceo@xe.vn` already on Command Center HRM.
2. Navigate: `http://127.0.0.1:5173/hr/employee-metadata?portal=1&tenantId=xevn&companyId=main`
3. Page title: **UNICOM HRM** · header **Hàng chờ metadata nhân sự** · **11 hồ sơ chờ duyệt**
4. CDP assert table headers + all **Quy trình** cell values

---

## AC matrix

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| Load OK | No white-crash; queue renders | Page loaded; 11 rows; OU filter rollup visible | **PASS** |
| Header tiếng Việt | **Quy trình** (not Workflow); **Trường dữ liệu** (not Field) | Headers: `Nhân sự` · `Trường dữ liệu` · `Giá trị đề nghị` · `Lý do` · **`Quy trình`** · `Thao tác` | **PASS** |
| Submit label VI | **Mã trường** (not Field key) | Form shows **Mã trường**; no `Field key` | **PASS** |
| Cột Quy trình humanize | No `xbos.employee_metadata` / dotted machine id | Unique workflow cell = **`Duyệt thay đổi hồ sơ (mặc định)`** ×11; `badWorkflows=[]`; `hasXbos=false`; `dottedMachine=false` | **PASS** |

### Sample rows (CDP)

| field_key (out of AC) | Quy trình (in AC) |
|-----------------------|-------------------|
| `personal_email` | Duyệt thay đổi hồ sơ (mặc định) |
| `emergency_contact` | Duyệt thay đổi hồ sơ (mặc định) |
| `address` | Duyệt thay đổi hồ sơ (mặc định) |

---

## Must_keep / closed chrome

| Item | Status |
|------|--------|
| Prior chrome-strip CLOSED (payroll/salary/processes/sync/perf) | **Not reopened** — this wave metadata page only |
| Approve / Từ chối buttons visible | Present (not exercised — mutate out of chrome AC) |

---

## Residual (non-blocking)

| Item | Sev | Note |
|------|-----|------|
| `field_key` still mono machine keys (`personal_email`, …) | P3 optional | Explicitly out of **C-HRM-MENU-SWEEP-01** (workflow ids only) |
| Existing density seed rows in queue | — | Pre-existing data; **QA did not seed** (U65) |

---

## Defect closure

| Condition | Sev | QA result |
|-----------|-----|-----------|
| **C-HRM-MENU-SWEEP-01** | P3 | **READY TO CLOSE** — UI humanized; recommend QC residual close |

---

## completion_report

**Closed:** Spot-check `/hr/employee-metadata` under U65 as Group CEO after FE `D-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01`. L0 PASS. Table headers Vietnamese; cột **Quy trình** shows **Duyệt thay đổi hồ sơ (mặc định)** on all 11 visible pending rows; **0** `xbos.employee_metadata` / dotted machine workflow ids in UI.

**Open / residual:** Optional field_key catalog labels only — not part of C-01.

**Overall:** **PASS_TO_PM** — next: QC close **C-HRM-MENU-SWEEP-01** residual on GWC. No Phase1/PROD claim. No seed.

---

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: QC-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01
from_role: pm
to_role: qc
lane: governance
entry_criteria: QA-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01 PASS_TO_PM; U65 zero-seed; no Phase1/PROD claim; do not reopen chrome-strip CLOSED
evidence_ref:
  - docs/qa/evidence/qa-hrm-metadata-workflow-id-humanize-01-20260720.md
  - docs/qa/evidence/d-hrm-metadata-workflow-id-humanize-01-fe-20260720.md
  - docs/qa/evidence/qc-hrm-menu-full-sweep-01-20260720.md (parent GWC C-HRM-MENU-SWEEP-01)
scope: Residual close only — audit QA spot-check that /hr/employee-metadata cột Quy trình shows VI human label (no xbos.employee_metadata / dotted machine id) + VI headers; close C-HRM-MENU-SWEEP-01 on QC-HRM-MENU-FULL-SWEEP-01 GWC
exit_criteria: C-HRM-MENU-SWEEP-01 CLOSED (or GO update); evidence_path docs/qa/evidence/qc-hrm-metadata-workflow-id-humanize-01-20260720.md (or amend parent qc-hrm-menu-full-sweep-01)
cấm: seed; reopen chrome-strip CLOSED; Phase1/PROD claim
```

## ack_status

**PASS_TO_PM**
