# Evidence — PO-HRM-JD-DYNAMIC-FE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-DYNAMIC-FE-02` |
| **role** | `dev-fe` |
| **date** | 2026-08-06 |
| **change_mode** | FIX · preserve_default · no dual-write · no remaster |
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | `qa` *(PO-HRM-JD-DYNAMIC-QA-02 after BE-02 READY)* |
| **u65** | no seed · testids only |

---

## Entry residual closed

| ID | From | Fix |
|----|------|-----|
| **FE-HDSD-JD-TESTIDS** | `docs/qa/evidence/po-hrm-jd-dynamic-qa-01.md` | Added `jdForm*` / `jdLibrary*` to `HDSD_MUTATE_TEST_IDS` so FE-01 `data-testid={HDSD_MUTATE_TEST_IDS.*}` no longer renders `undefined` |

---

## Testids added (`apps/web/hrm/src/lib/hdsdMutateTestIds.ts`)

| Key | `data-testid` string | Wired in (FE-01 — unchanged) |
|-----|----------------------|------------------------------|
| `jdLibraryRefreshBtn` | `hdsd-jd-library-refresh-btn` | `JobTemplatesTab` Làm mới |
| `jdLibraryAddBtn` | `hdsd-jd-library-add-btn` | `JobTemplatesTab` Thêm JD |
| `jdLibraryEmpty` | `hdsd-jd-library-empty` | empty table row |
| `jdLibraryRow` | `hdsd-jd-library-row` | data table rows |
| `jdFormDialog` | `hdsd-jd-form-dialog` | `JdTemplateWriterDialog` DialogContent |
| `jdFormTitle` | `hdsd-jd-form-title` | title Input (title-first) |
| `jdFormCode` | `hdsd-jd-form-code` | mã JD Input |
| `jdFormPosition` | `hdsd-jd-form-position` | CatalogSearchPicker chức danh |
| `jdFormSubmit` | `hdsd-jd-form-submit` | Lưu submit |

### Settings JD (already stable literals — not missing)

Harness already uses string literals (no HDSD map gap):

- `settings-tab-jd-dynamic` · `jd-dynamic-settings-panel`
- `jd-settings-field-*` / `jd-settings-group-*` / `jd-settings-pack-*` / `jd-settings-rules-*` / `jd-settings-resolve-*`
- Writer extras: `jd-writer-pack-label` · `jd-writer-optional-palette` · `jd-writer-canvas` · `jd-writer-group-*` · `jd-writer-pack-confirm`
- View: `jd-template-view-panel` · `jd-view-group-*` · `jd-library-view-btn`

---

## must_keep verified

| Item | Status |
|------|--------|
| Settings Cấu hình JD mount | untouched |
| Thư viện writer + TopCV view | untouched (wire only via constants) |
| No JobPostingsTab JD write | untouched |
| Pack resolve / snapshot business logic | untouched |
| `remaster_program_done` | **false** (not claimed) |
| Seed | **false** |

---

## Tests

```text
pnpm exec vitest run src/lib/hdsdMutateTestIds.test.ts src/lib/jdDynamicSnapshot.test.ts src/lib/jobTemplatesPositionCode.test.ts
→ 3 files · 11 tests PASS
```

---

## Files touched

- `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` (+ CODE-MEMORY-CHANGE)
- `apps/web/hrm/src/lib/hdsdMutateTestIds.test.ts`
- `docs/program/slices/PO-HRM-JD-DYNAMIC-TOPCV.md` (allowed_paths FE-02)
- `docs/qa/evidence/po-hrm-jd-dynamic-fe-02.md`

---

## completion_report

**Closed:** FE residual FE-HDSD-JD-TESTIDS — 9 stable HDSD keys (`jdForm*`×5 + `jdLibrary*`×4) matching HDSD CH07 / harness `hdsd-jd-form-position`; vitest 11/11; Settings/writer/view mount paths unchanged; no pack/resolve logic edits.

**Open / residual:** Business J-* retest blocked until `PO-HRM-JD-DYNAMIC-BE-02` READY (routes 404 from nest TS). FE testid gap closed independently.

**ack_status:** `READY_FOR_QA`

**next_owner:** `qa`

**evidence_path:** `docs/qa/evidence/po-hrm-jd-dynamic-fe-02.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-JD-DYNAMIC-QA-02
role: qa
entry_criteria:
  - FE-02 READY_FOR_QA: docs/qa/evidence/po-hrm-jd-dynamic-fe-02.md (jdForm*/jdLibrary* HDSD ids)
  - BE-02 READY_FOR_QA: docs/qa/evidence/po-hrm-jd-dynamic-be-02.md (nest 0 errors · JD CFG/resolve 200)
  - Prior FAIL: docs/qa/evidence/po-hrm-jd-dynamic-qa-01.md
  - U65 browser-only · zero-seed
read_first:
  - docs/qa/evidence/po-hrm-jd-dynamic-fe-02.md (testid inventory)
  - docs/qa/evidence/po-hrm-jd-dynamic-be-02.md
  - docs/program/specs/PO-HRM-JD-GROUP-SPEC-01.md AC-JD-GRP-*
exit_criteria:
  - Assert [data-testid="undefined"] count=0 on Thư viện Thêm JD dialog + library list
  - getByTestId hdsd-jd-library-add-btn / hdsd-jd-form-dialog / hdsd-jd-form-position / hdsd-jd-form-submit
  - J-HRM-JD-01 Settings field/group/pack/rule → Lưu → F5
  - J-HRM-JD-02 Thêm JD → resolve pack → optional DnD → Lưu snapshot v2 → F5
  - J-HRM-JD-03 Xem hierarchy §3.6 from snapshot
  - G4 đổi chức danh → jd-writer-pack-confirm · values kept
  - No JobPostingsTab JD write · no seed
evidence_path: docs/qa/evidence/po-hrm-jd-dynamic-qa-02.md
ack_status: PASS_TO_PM
```
