# Evidence — `PO-UAT-REC-JD-DND-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UAT-REC-JD-DND-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution |
| **parent** | `PO-UAT-REC-SOFT-OBS-QC-01` GWC — residual JD DnD NON-CERTIFIED |
| **change_mode** | FIX · preserve_default · U65 no seed |
| **ack_status** | **READY_FOR_QA** |
| **portal_url** | `http://127.0.0.1:5173` · HRM embed `/hr` · Thư viện JD writer |

### Honesty locks (mandatory)

| Flag | Value |
|------|-------|
| **recruitment_uat_ready** | **false** (not invent) |
| **jd_dynamic_done** | **false** (not invent — QA/QC certify DnD first) |
| **Seed** | **DENIED** |
| **Phase 1 DONE** | **NOT claimed** |

---

## Goal

Certify-ready JD design DnD surface: **zero** `@hello-pangea/dnd` «Unable to find drag handle» / «Unable to find any drag handles» storm when opening/using DnD on JD writer; no Uncaught ReferenceError; preserve UTF-8 VI labels; no dup shell header invent.

---

## Spec says / code does

| Spec / prior finding | Before (gap) | After |
|----------------------|--------------|-------|
| hello-pangea `findDragHandle` queries **iframe** `document` | `portalScope="iframe"` kept | **kept** |
| Palette same-node bind | `sameNodeDragBind` | **kept** |
| Canvas groups | Nested header `{...drag.dragHandleProps}` (split ref/handle — storm class on `canvas-SEC_*`) | **`sameNodeDragBind` on card root** (same as contract clause canvas) |
| DnD mount vs portal paint | DragDropContext mounted immediately on dialog open | **Deferred** until double `requestAnimationFrame` after `open` (`dndReady`) |
| Soft OBS CMP/IV | CLOSED on pack | **must_keep** — untouched |
| Process FAIL-immediate classes | DnD/mojibake/dup/Uncaught | **must_keep** — no invent module ready |

---

## Root cause (harden)

Prior `PO-HRM-UI-HEADER-JD-DND-FE-01` fixed parent-portal invisibility + palette same-node; canvas still used **nested** handle. Sponsor storm log (`sponsor-console-20260806-recruitment.log`) listed both `canvas-SEC_*` and `pal-SEC_*`. Soft OBS / UAT pack QC left JD DnD **NON-CERTIFIED** (not re-exercised).

This seat closes the canvas gap + defers DnD registration until the iframe DialogContent has painted so handles register in the same document hello-pangea queries.

---

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/recruitment/JdTemplateWriterDialog.tsx` | Canvas `sameNodeDragBind`; `dndReady` double-rAF gate; `jd-writer-dnd-surface` / `jd-writer-dnd-pending` |
| `apps/web/hrm/src/lib/jdDndSameNodeProps.ts` | CODE-MEMORY APPEND callers |
| `apps/web/hrm/src/lib/jdDndSameNodeProps.test.ts` | + canvas-SEC_* merge case |
| `apps/web/hrm/src/components/recruitment/JdTemplateWriterDialog.source.test.ts` | **new** source locks |
| `docs/qa/evidence/po-uat-rec-jd-dnd-fe-01.md` | this file |

**Untouched (must_keep):** soft OBS CMP/IV FE; ScheduleInterview UTF-8; CC TopHeader; Settings JD groups (no DnD); U65 seed paths.

---

## Unit / source evidence

```text
pnpm exec vitest run \
  src/lib/jdDndSameNodeProps.test.ts \
  src/components/recruitment/JdTemplateWriterDialog.source.test.ts \
  src/components/ui/dialogCenter.source.test.ts
→ Test Files  3 passed (3)
→ Tests      18 passed (18)
```

Source locks assert: `portalScope="iframe"` · no `{...drag.dragHandleProps}` · `dndReady` + double rAF · HDSD `jdFormDialog` · VI labels.

---

## Expected QA browser (U65 · zero-seed)

### UF-JD-DND-01 (certify)

1. Login `ceo@xe.vn` → Command Center → HRM → **Tuyển dụng** → **Thư viện JD**
2. **Thêm JD** (or Sửa) → pick chức danh → wait canvas groups
3. Assert `jd-writer-dnd-surface` visible (pending spinner clears)
4. Drag ≥1 **canvas** group reorder **and/or** palette → canvas
5. Console class counts on writer path:
   - `Unable to find drag handle` = **0**
   - `Unable to find any drag handles` = **0**
   - Uncaught / ReferenceError = **0**
6. VI labels intact (Nhóm tùy chọn / Canvas nhóm / Thêm JD template); no invent dup shell claim beyond observed `portal-brand-mark`
7. Writer usable after drop (groups still editable; submit chrome present)

**FAIL if** storm ≥10 identical invariant lines on JD writer surface (process FAIL-immediate).

### Honesty after QA

- Browser storm=0 → QA PASS → QC may **certify JD DnD** slice
- Still **do not** set `recruitment_uat_ready=true` or `jd_dynamic_done=true` without explicit QC full-module / JD-done seat

---

## Residual

| Item | Status |
|------|--------|
| Browser storm=0 proof | **OPEN** → QA |
| JD DnD QC certify | **OPEN** → QC after QA |
| `recruitment_uat_ready` / `jd_dynamic_done` | remain **false** |
| Soft OBS CMP/IV | CLOSED (prior) — must_keep |

---

## Handoff

```yaml
work_item_id: PO-UAT-REC-JD-DND-FE-01
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-uat-rec-jd-dnd-fe-01.md
next_owner: qa
entry_criteria: L0 portal+HRM up; U65 zero-seed; FE READY this evidence
exit_criteria: UF-JD-DND-01 drag exercised; dndHits=0; Uncaught=0; UTF-8 VI OK
```

### `next_dispatch_prompt` (copy-ready)

```text
work_item_id: PO-UAT-REC-JD-DND-QA-01
from_role: pm
to_role: qa
parent: PO-UAT-REC-JD-DND-FE-01 READY_FOR_QA
goal: Browser-certify JD writer DnD — storm=0 then hand QC
read_first:
  - docs/qa/evidence/po-uat-rec-jd-dnd-fe-01.md
  - docs/qa/evidence/po-hrm-rec-ux-qc-process-01.md (FAIL-immediate DnD class)
  - docs/qa/evidence/po-uat-rec-soft-obs-qc-01.md (JD NON-CERTIFIED residual)
entry_criteria: L0 PASS; U65 zero-seed; no pnpm seed:*
exit_criteria:
  - UF-JD-DND-01: Thư viện JD → Thêm/Sửa → chức danh → drag canvas and/or palette→canvas
  - Console: Unable to find drag handle = 0 · Unable to find any drag handles = 0
  - Uncaught/ReferenceError = 0 · UTF-8 VI labels OK
  - Machine JSON + screens under docs/qa/evidence/
  - honesty: recruitment_uat_ready=false · jd_dynamic_done not invent true
cấm: seed · invent recruitment_uat_ready · invent jd_dynamic_done · claim Phase1
evidence_path: docs/qa/evidence/po-uat-rec-jd-dnd-qa-01.md
next → qc certify JD DnD (PO-UAT-REC-JD-DND-QC-01)
```

---

## completion_report

**Closed:** JD writer canvas same-node DnD + deferred DragDropContext mount; source/unit locks 18 PASS; honesty flags not invent.

**Open:** QA browser storm=0; QC JD DnD certify.
