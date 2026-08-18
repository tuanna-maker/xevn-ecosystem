# D-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01 — FE evidence (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **ack_status** | **READY_FOR_QA** |
| **parent_qc** | `QC-HRM-MENU-FULL-SWEEP-01` GWC **C-HRM-MENU-SWEEP-01** P3 |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD claim · CODE-MEMORY kept |
| **date** | 2026-07-20 |

## spec_read_ack

- QC SoT: `docs/qa/evidence/qc-hrm-menu-full-sweep-01-20260720.md` § Conditions **C-HRM-MENU-SWEEP-01**
- QA SoT: `docs/qa/evidence/qa-hrm-menu-full-sweep-01-20260720.md` · Metadata queue row
- SRS: `docs/hrm/SRS.md` §13 · **UC-HRM-26** (Hàng chờ metadata)
- TechSpec: `docs/hrm/TECHSPEC.md` § metadata queue
- BRD: §5.3 `workflow_code` → XBOS definition (UI must not expose machine id)
- change_mode: **FIX** (display/copy only — no API/mutate contract change)

## Closed

| Condition | Fix |
|-----------|-----|
| **C-HRM-MENU-SWEEP-01** | `formatMetadataWorkflowLabel` maps `xbos.employee_metadata.default` → **Duyệt thay đổi hồ sơ (mặc định)**; unknown `xbos.*` / technical ids → **Quy trình phê duyệt metadata**; null → **Quy trình mặc định** |
| Column chrome | Header **Workflow** → **Quy trình**; **Field** → **Trường dữ liệu**; submit label **Field key** → **Mã trường** |

## Files

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/metadataWorkflowLabel.ts` | NEW — map + humanize helper + `@CODE-MEMORY` |
| `apps/web/hrm/src/lib/metadataWorkflowLabel.test.ts` | NEW — unit + source wiring |
| `apps/web/hrm/src/components/settings/MetadataQueueTab.tsx` | Wire label; VI headers; CODE-MEMORY |
| `apps/web/hrm/src/hooks/useMetadataQueue.ts` | Re-export helper; CODE-MEMORY-CHANGE |
| `apps/web/web-portal/src/modules/hrm/HrmMetadataQueueSection.tsx` | Portal parity (same humanize) |

## Keep (verified)

- Approve / reject / submit payloads unchanged
- `@CODE-MEMORY` retained / appended (not stripped)
- No seed scripts
- No Phase1 / PROD claim
- `formatMetadataDisplayValue` unchanged
- Prior chrome-strip CLOSED rows (Dashboard, payroll, Processes, sync ISO, perf cycles) **not** reopened

## Tests

```text
pnpm exec vitest run \
  src/lib/metadataWorkflowLabel.test.ts \
  src/hooks/useMetadataQueue.test.ts

→ 2 files, 8 tests PASS
```

## QA spot-check (metadata page only)

| Step | Assert |
|------|--------|
| Open `/hr/employee-metadata` (portal embed OK) | Page loads; no white-crash |
| If queue has rows | Cột **Quy trình** shows VI label — **no** substring `xbos.employee_metadata` / dotted machine id |
| Empty queue | Empty copy OK; headers are Vietnamese (**Quy trình**, not Workflow) |
| Approve/reject (if row exists) | Still works — out of chrome scope but must_keep |

**U65:** browser-only; **no seed** to create rows. Empty queue + header/source assert is enough if no pending rows.

## Residual

- `field_key` still may show machine keys (e.g. `job_title`) in mono — **out of this condition** (QC called out workflow ids only). Optional follow-up if sponsor wants field catalog labels.
- No Phase1 / PROD.

## Handoff

- **next_owner:** `qa`
- **ack_status:** `READY_FOR_QA`
- **pm_dispatch_hint:** After QA PASS → `qc` close **C-HRM-MENU-SWEEP-01** residual on GWC
