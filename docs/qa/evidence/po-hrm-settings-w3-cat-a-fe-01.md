# PO-HRM-SETTINGS-W3-CAT-A-FE-01 — Batch A ATT catalog UX evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-W3-CAT-A-FE-01` |
| **lane** | execution · **dev-fe** |
| **Date** | 2026-08-10 |
| **Parent** | `PO-HRM-SETTINGS-W3-UX-DENSITY-CONTINUOUS-01` · `PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01` |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `attendance_uat_ready=false` on CODE/OT/OTC admin panels · U65 zero-seed |

---

## 1. spec_read_ack

| Layer | Path / cite |
|-------|-------------|
| **dispatch** | `docs/program/dispatch/PO-HRM-SETTINGS-W3-UX-DENSITY-CONTINUOUS-01.md` — MUST_KEEP density · pattern Loại phép |
| **spec** | `docs/program/specs/PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01.md` §2.2 · §2.4 |
| **reference** | `AttLeaveTypeSettingsPanel.tsx` · `SettingsCatalogScreenShell` (`compact`) |
| **srs / admin** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md` §5.2 |
| **api_design** | F-ATT-CAT-CODE / F-ATT-CAT-OT / F-ATT-CAT-OTC — list/upsert/retire Nest paths (RETAIN) |
| **change_mode** | **UPGRADE** — list+dialog+pagination; no MUST_KEEP file edits |
| **must_keep** | AppLayout settings embed padding · Settings.tsx compact PageHeader · no `xevn-safe-inline` on Settings · honesty banners · `hdsd-att-*` testids · F-ATT-CAT-* API |

---

## 2. Scope closed

| Panel | Tab id | Pattern |
|-------|--------|---------|
| `AttAttendanceCodeSettingsPanel` | `att-attendance-codes` | Shell compact · filter/pagination · dialog + `SettingsDialogSelectContent` |
| `AttOtTypeSettingsPanel` | `att-ot-types` | Shell compact · filter/pagination · dialog (no Select field — N/A portal) |
| `AttOtCompTypeSettingsPanel` | `att-ot-comp-types` | Shell compact · filter/pagination · dialog |

**Residual:** None in batch A FE scope. Full `pnpm test` suite has unrelated failures outside this slice.

---

## 3. Files changed (this wave)

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/settings/AttAttendanceCodeSettingsPanel.tsx` | Verified W3 shell (prior UPGRADE) — no regression |
| `apps/web/hrm/src/components/settings/AttOtTypeSettingsPanel.tsx` | Verified W3 shell (prior UPGRADE) |
| `apps/web/hrm/src/components/settings/AttOtCompTypeSettingsPanel.tsx` | Verified W3 shell (prior UPGRADE) |
| `apps/web/hrm/src/components/settings/AttCodeOtFeAdminSettingsPanels.test.ts` | W3 source gate (`expectW3CatalogShell`) — refresh testid via shell `onRefresh` |

**Not touched:** MUST_KEEP paths in dispatch § MUST_KEEP (`AppLayout`, `Settings.tsx` root density, `SettingsNavLayout`, `PageHeader`, `index.css`, `AttLeaveTypeSettingsPanel`, `SettingsDialogSelectContent`, contract clauses W1).

---

## 4. Commands & exit codes

| Command | Exit |
|---------|------|
| `pnpm exec vitest run src/components/settings/AttCodeOtFeAdminSettingsPanels.test.ts` (cwd `apps/web/hrm`) | **0** — 8 tests |
| `pnpm build` (cwd `apps/web/hrm`) | **0** |

Note: package name is `vite_react_shadcn_ts` — `pnpm --filter @xevn/hrm-web` does not match monorepo filter; use `apps/web/hrm` scripts above.

---

## 5. QA handoff (browser)

- **URL:** `http://localhost:5173/command-center/hrm/settings?tab=<id>`
- **Tabs:** `att-attendance-codes` · `att-ot-types` · `att-ot-comp-types`
- **Persona:** `ceo@xe.vn` / `Xevn@2026` · company scope `main`
- **UF:** Thêm 1 dòng qua dialog → Lưu → Network 2xx → row trong bảng → F5 còn · Select-in-dialog (attendance codes `countsAs`) không clip embed
- **work_item_id QA:** `QA-PO-HRM-SETTINGS-W3-BROWSER-01`

---

## 6. completion_report

Batch A ATT catalog panels align with Loại phép UX: compact `SettingsCatalogScreenShell`, client search/pagination, table-only list, add/edit in dialog, row actions retire. Vitest source gate updated for shell-derived refresh testids. HRM web production build PASS.

**next_owner:** qa

**next_dispatch_prompt:**

```text
work_item_id: QA-PO-HRM-SETTINGS-W3-BROWSER-01
entry_criteria: L0 stack up (:5173 portal + :28001 hrm-api); browser-only U65; evidence template qa-fe-outside-browser-gate
exit_criteria: For tabs att-attendance-codes, att-ot-types, att-ot-comp-types — login ceo@xe.vn → settings tab → Thêm → Lưu → FE after 2xx + F5; dialog Select (attendance codes) uses parent portal; no density regression vs Loại phép; block evidence in docs/qa/evidence/
spec_ref: docs/program/dispatch/PO-HRM-SETTINGS-W3-UX-DENSITY-CONTINUOUS-01.md · po-hrm-settings-w3-cat-a-fe-01.md
ack_status target: PASS_TO_PM or FAIL with UF-ID
```
