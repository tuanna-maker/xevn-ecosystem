# Evidence — PO-HRM-JD-IA-LIST-DETAIL-FE-01

| Field | Value |
|-------|--------|
| work_item_id | PO-HRM-JD-IA-LIST-DETAIL-FE-01 |
| role | dev-fe |
| ack_status | **READY_FOR_QA** |
| date | 2026-08-11 |

## spec_read_ack

- srs/delta: `docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.3 · AC-JD-SET-LIST-01..08
- ui_screen_spec: `docs/hrm/ui-screens/UI-SETTINGS-JD-MASTER-LIST.md`
- qc_context: `docs/qa/evidence/qc-po-hrm-settings-fidelity-gate-01.md` (JD mutate HOLD — shell smoke only until this FE + QA mutate)
- api: existing `GET/POST/PATCH/DELETE /api/hrm/recruitment/job-templates*` · `POST …/:id/publish`
- must_keep: SETFIDQC1 · SETW3MUTQC1 · ATTLVTSOTQC1 · `settings_catalog_e2e_ready=false`

## AC mapping (FE-ready 01..05 + 08 empty)

| AC | Implementation |
|----|----------------|
| **01** | Nav `jd-master-library` «Thư viện JD» vs `jd-dynamic` «Cấu hình trường JD» — `settingsNavigation.ts` |
| **02** | List → **Sửa** opens `JdTemplateWriterDialog` (pack/groups DnD inside dialog only) |
| **03** | **Thêm JD** → Lưu → `onWriterSubmit` → close dialog + `useJobTemplates` refetch list |
| **04** | Persist via job-templates API (QA F5 U65) |
| **05** | `JdTemplateWriterDialog` · `data-hrm-dialog-portal="parent"` · `HRM_DIALOG_FULL_VIEWPORT_CONTENT_CLASS` (~90vw×90vh) |
| **08** | Empty copy + CTA `settings-jd-master-library-cta-jd-dynamic` → `?tab=jd-dynamic` |

**Residual for QA (not FE block):** AC-06 J-HRM-JD-05 YCTD picker · AC-07 jd-dynamic no library DnD (CFG panel — regression spot).

## code_diff (this wave)

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/jdMasterLibraryIa.ts` | **ADD** tab ids, writer test id, empty copy, `settingsTabQuery` |
| `apps/web/hrm/src/lib/jdMasterLibraryIa.test.ts` | **ADD** vitest AC-01/05/08 + QA test id |
| `apps/web/hrm/src/components/settings/JdMasterLibrarySettingsPanel.tsx` | Empty state CTA · `dialogTestId` for QA harness |
| `apps/web/hrm/src/components/recruitment/JdTemplateWriterDialog.tsx` | Optional `dialogTestId` prop (Settings vs Recruitment HDSD id) |

**Pre-existing (retain):** `JdMasterLibrarySettingsPanel` list shell · `Settings.tsx` tab mount · `settingsNavigation` recruitment group.

## Verify (agent)

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/jdMasterLibraryIa.test.ts src/lib/jobTemplateStatus.test.ts
# Test Files 2 passed · Tests 8 passed · exit 0
pnpm exec tsc --noEmit -p tsconfig.json
# exit 0
```

## QA browser (U65 · U76)

| UF | Path | Account |
|----|------|---------|
| AC-JD-SET-LIST-01..08 | `/hr/settings?tab=jd-master-library` or CC embed `…/command-center/hrm/settings?tab=jd-master-library` | `ceo@xe.vn` |

**Click path:** Cài đặt → Tuyển dụng → **Thư viện JD** → (empty) CTA Cấu hình trường JD → **Thêm JD** → chọn chức danh → Lưu (POST 2xx) → dialog đóng · row list → F5 row còn → **Sửa** (GET detail + writer `settings-jd-master-library-writer-dialog`) → PATCH 2xx.

**Regression:** `?tab=jd-dynamic` CFG only · `/hr/recruitment?tab=jd-library` unchanged.

## completion_report

Closed FE slice for Settings JD master list→writer dialog (PAT-DIALOG-FULL-VIEWPORT-CC-01): distinct nav tabs, list-only shell, writer in dialog with QA test id, empty CTA to jd-dynamic. Vitest 8/8. No BE change. AC-06/07 left to QA mutate wave.

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: PO-HRM-SETTINGS-JD-MUTATE-QA-01
role: qa
read_first:
  - docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md §6.3
  - docs/hrm/ui-screens/UI-SETTINGS-JD-MASTER-LIST.md
  - docs/qa/evidence/po-hrm-jd-ia-list-detail-fe-01.md
entry_criteria: hrm-api :28001 + portal; U65 zero-seed; dev-fe READY_FOR_QA
exit_criteria: Browser AC-JD-SET-LIST-01..08; Network `/recruitment/job-templates*` only on mutate; jd-dynamic no library DnD; J-HRM-JD-05 picker sees new template after publish
evidence_path: docs/qa/evidence/po-hrm-settings-jd-mutate-qa-01.md
persona: ceo@xe.vn / Xevn@2026 · company main
hdsd_align: settings-tab-jd-master-library · settings-jd-master-library-writer-dialog · HDSD jd form submit
```
