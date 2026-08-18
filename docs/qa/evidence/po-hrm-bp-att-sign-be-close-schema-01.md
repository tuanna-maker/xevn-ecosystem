# Evidence — PO-HRM-BP-ATT-SIGN-BE-CLOSE-SCHEMA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-BE-CLOSE-SCHEMA-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **date** | 2026-08-05 |
| **lane** | execution · F-ATT-SHEET-02 · P0-CLOSE-500-SCHEMA |
| **prior** | `po-hrm-bp-att-sign-qa-04.md` PASS_WITH_OBS |
| **ack_status** | **READY_FOR_QA** |
| **u65_zero_seed** | true |
| **attendance_closed** | **false** (product GO not claimed) |
| **must_keep** | SP-ATT-SIGN scope parity · no fake close · no seed |

---

## spec_read_ack

| Artifact | Path / § |
|----------|----------|
| **TechSpec** | `TECHSPEC_HRM_ENTERPRISE.md` §6.4 · F-ATT-SHEET-02 |
| **DB_DESIGN** | `DB_DESIGN_HRM_ENTERPRISE.md` §4.6 header `closed_at` / `closed_by` |
| **API_DESIGN** | F-ATT-SHEET-02 close preconditions P1–P5 |
| **change_mode** | FIX (runtime DDL + ALTER legacy table) |

**Root cause:** `attendance_sheets` created earlier by AT-14 catalog DDL lacked `closed_at` / `closed_by`. `CREATE TABLE IF NOT EXISTS` in sign service did not backfill columns → `POST …/close` UPDATE → **500** `HRM-SYS-001`.

---

## Implementation

| Deliverable | Path |
|-------------|------|
| Shared header bootstrap | `apps/api/hrm-api/src/attendance/attendance-sheet-schema.bootstrap.ts` |
| Catalog + sign wired | `attendance-catalog.service.ts` · `attendance-sheet-sign.service.ts` |
| SQL reference migration | `apps/api/hrm-api/migrations/20260805_attendance_sheets_close_columns.sql` |
| Unit spec | `attendance-sheet-schema.bootstrap.spec.ts` |

**Behavior:** On any sheet load/sign/close path, `ALTER TABLE … ADD COLUMN IF NOT EXISTS closed_at|closed_by` runs before close UPDATE.

---

## Verify

### Jest

```bash
cd apps/api/hrm-api
pnpm exec jest src/attendance/attendance-sheet-schema.bootstrap.spec.ts \
  src/attendance/attendance-sheet-scope-parity.spec.ts \
  src/attendance/attendance.controller.spec.ts
```

| Result | Exit |
|--------|------|
| 2026-08-05 | **0** — 28 tests PASS |

### API smoke (U65 — no seed; existing submitted sheet + prior sign steps)

```bash
node scripts/qa/_tmp-po-hrm-bp-att-sign-be-close-schema-01-smoke.mjs
```

| Call | Result |
|------|--------|
| `POST …/642a4713-b0ee-4802-a1d9-2fe650cbc17f/close?company_id=main` | **201** `HRM-AS-200` · `status=closed` · not 500 |

**Note:** hrm-api on `:28001` **restarted** after kill stale PID (EADDRINUSE) so new bootstrap code loaded.

**QA data impact:** Sheet `642a4713-…` is now **closed** from dev-be smoke. Retest close on another **submitted** sheet with full sign ladder, or use **reopen** then close+F5 per UF-05/06.

---

## completion_report

**Closed:** P0 schema gap for F-ATT-SHEET-02 close; happy path `can_close` → 2xx; jest regression green.

**Open:** Browser UF-05/06 + J-HRM-06c F5 after close (QA); optional draft **Gửi chờ ký** if draft row exists; checksum / line_locked deferred per slice MVP.

---

## next_owner / next_dispatch_prompt

| Field | Value |
|-------|--------|
| **next_owner** | `qa` |
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-QA-05` |

**next_dispatch_prompt (copy-ready):**

```text
ROLE: qa · PO-HRM-BP-ATT-SIGN-QA-05 · P0 retest close after BE-CLOSE-SCHEMA-01

entry: po-hrm-bp-att-sign-be-close-schema-01.md READY_FOR_QA · hrm-api :28001 restarted with bootstrap
u65_zero_seed: true · no seed

matrix:
- Persona ceo@xe.vn · /hr/attendance · Bảng chấm công
- Pick submitted sheet (not 642a4713 if still closed) OR reopen → sign ladder NV→QL→HCNS → Chốt att-sign-close-sheet
- Network: POST …/close → 2xx (not 500 closed_at)
- FE after 2xx: header closed · F5 persists
- Optional: if draft row visible → Gửi chờ ký att-sheet-submit click + 2xx

evidence: docs/qa/evidence/po-hrm-bp-att-sign-qa-05.md
exit: UF-05/06 🟢 · J-HRM-06c close leg 🟢 · PASS_TO_PM or FAIL with spec_ref
```

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **pm_dispatch_hint** | `PO-HRM-BP-ATT-SIGN-QA-05` |
