# D-HRM-TOOLS-STUB-TOAST-01 — Tools menu deferred honesty (no fake toast)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-HRM-TOOLS-STUB-TOAST-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **date** | 2026-07-17 |
| **spec_ref** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` § tools_equipment (Deferred) · R-FID-02 |
| **pattern** | Same as `P1-HRM-PROCESSES-FE-01` — read-only + honest deferred copy |
| **U65** | zero-seed · no fake API |
| **ack_status** | **READY_FOR_QA** |

---

## Problem (prior QA residual)

| Symptom | Root cause |
|---------|------------|
| Toast «Đã thêm CCDC thành công» on **Thêm mới** | `useToolsEquipment` empty `mutationFn` + `toast.success` in `onSuccess` |
| List stays empty after toast | No `POST /api/hrm/tools` contract |
| Misleading mutate UX | Full Add/Edit/Delete + assignment dialogs without API |

Prior evidence: `docs/qa/evidence/p1-hrm-menu-tools_equipment-20260717.md` (🟡 stub toast residual).

---

## Fix (minimal delta)

### `apps/web/hrm/src/hooks/useToolsEquipment.ts`

- Removed all `useMutation` stubs and `toast` imports.
- Added `TOOLS_READ_ONLY` + `TOOLS_MUTATION_UNSUPPORTED_VI` exports.
- Query-only: returns honest `[]` until Nest tools API exists.
- `@CODE-MEMORY` block added.

### `apps/web/hrm/src/pages/ToolsEquipment.tsx`

- Removed **Thêm CCDC**, **Tạo phiếu**, Edit, Delete, and mutate dialogs.
- Added top **deferred banner** (`data-testid="tools-deferred-banner"`) + empty-state notice (`tools-readonly-notice`).
- Kept **view-only** Eye dialog with `DialogTitle` + `DialogDescription` (a11y).
- Removed `useEmployees` import — eliminates assignment-picker employee fan-out on mount (P2 bonus).

### Tests

| File | Asserts |
|------|---------|
| `src/hooks/useToolsEquipment.test.ts` | No `toast`/`useMutation` in hook; honest copy export |
| `src/pages/ToolsEquipment.readOnly.test.ts` | No Add/Edit/Delete stubs; deferred notice present |
| `src/lib/hrmNonPilotApiGuard.test.ts` | `ToolsEquipment.tsx` in non-pilot guard list |

---

## Verification (dev-fe)

```bash
cd apps/web/hrm
pnpm exec vitest run src/hooks/useToolsEquipment.test.ts src/pages/ToolsEquipment.readOnly.test.ts src/lib/hrmNonPilotApiGuard.test.ts
```

**Result:** 11/11 tests PASS (exit 0).

---

## QA retest matrix (browser — U65)

| Step | Expected |
|------|----------|
| Login `ceo@xe.vn` → HRM → **Công cụ & thiết bị** | L0 load 🟢; no Sync ERROR |
| Page top | Dashed banner: «Thêm/sửa/xóa CCDC… chưa hỗ trợ» |
| Empty inventory | «Chưa có CCDC nào» + same deferred copy; **no** «Thêm CCDC» button |
| Network | No `POST` tools; **no** `GET /api/hrm/employees?page=1..12` fan-out from this page |
| Console | No fake success toast on any click |
| Assignments tab | Empty honest + deferred notice; no «Tạo phiếu» |

**URL:** `http://14.225.217.232:8088/command-center/hrm/tools_equipment`  
**Embed:** `/hr/tools-equipment?portal=1&tenantId=xevn&companyId=main`

Menu status remains **⚪ DEFERRED** per program SoT — fix closes **🟡 mutate integrity** only; does not promote menu to 🟢 product DONE.

---

## Handoff

- **completion_report:** Removed fake success toasts and all stub CRUD UI on Tools/Equipment page. Hook is query-only with `TOOLS_MUTATION_UNSUPPORTED_VI`. Deferred banner + empty-state honest copy. Unit tests 11/11 PASS. Employee fan-out on Tools page removed (no assignment picker).
- **residual:** Menu still ⚪ deferred until Nest tools API + real CRUD contract. `ToolsReportTab` still reads empty aggregates (expected).
- **next_owner:** qa
- **ack_status:** READY_FOR_QA
- **evidence_path:** `docs/qa/evidence/d-hrm-tools-stub-toast-20260717.md`
- **next_dispatch_prompt:** |
  Retest D-HRM-TOOLS-STUB-TOAST-01 on pilot `:8088`. Persona `ceo@xe.vn` · BOD · `companyId=main`. UF: tools_equipment L0 + deferred honesty. Confirm: (1) no «Thêm CCDC» / «Tạo phiếu» buttons, (2) deferred banner visible, (3) no success toast on any click, (4) no POST tools, (5) no employee page fan-out from tools page mount. Update `p1-hrm-menu-tools_equipment-20260717.md` mutate row 🟡→🟢 if PASS. Menu overall stays ⚪ deferred.
