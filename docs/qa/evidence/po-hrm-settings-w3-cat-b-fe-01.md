# Evidence — PO-HRM-SETTINGS-W3-CAT-B-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-W3-CAT-B-FE-01` |
| **Role** | dev-fe |
| **Date** | 2026-08-10 |
| **Pattern** | `AttLeaveTypeSettingsPanel` · `SettingsCatalogScreenShell` compact · client search · `SettingsCatalogPagination` · Dialog mutate · `SettingsCatalogRowActions` |
| **must_keep** | Không đụng AppLayout / Settings.tsx chrome / SettingsNavLayout / PageHeader / index.css / AttLeaveType reference |

## Panels refactored (Batch B)

| Tab id | Component | testId shell |
|--------|-----------|--------------|
| `emp-document-types` | `EmpDocumentTypeSettingsPanel.tsx` | `settings-emp-document-types` |
| `emp-employment-types` | `EmpEmploymentTypeSettingsPanel.tsx` | `settings-emp-employment-types` |
| `emp-employment-statuses` | `EmpEmploymentStatusSettingsPanel.tsx` | `settings-emp-employment-statuses` + `settings-emp-status-reasons` |
| `si-insurance-types` | `SiInsuranceTypeSettingsPanel.tsx` | `settings-si-insurance-types` |
| `si-insurers` | `SiInsurerSettingsPanel.tsx` | `settings-si-insurers` |
| `dec-decision-types` | `DecDecisionTypeSettingsPanel.tsx` | `settings-dec-decision-types` |
| `rec-pipeline-stages` | `RecPipelineStageSettingsPanel.tsx` | `settings-rec-pipeline-stages` |

## Behavioral notes

- Bỏ form inline; mutate qua Dialog + `SettingsCatalogRowActions` (edit/retire).
- Tìm kiếm client-side `filterCatalogByCodeOrName`; API list không gửi `q`.
- Dialog giữ `hdsd-*` save/key/name/sort và row edit/retire testids.
- **EMP ST/STR:** giữ effective picker preview (`hdsd-emp-*-effective-picker`) — gate test bắt buộc.
- **SI/DEC/REC:** bỏ list preview picker (align Loại phép / document type).
- Không có Select trong dialog batch B (N/A `SettingsDialogSelectContent`).

## Verify

```text
cwd: xevn-ecosystem
cmd: pnpm --filter vite_react_shadcn_ts exec vitest run src/components/settings/EmpEmploymentStatusSettingsPanel.test.ts
exit: 0

cmd: pnpm --filter vite_react_shadcn_ts build
exit: 0
```

Full `pnpm --filter vite_react_shadcn_ts test`: 8 pre-existing failures (LeaveTab picker / unrelated); không regression batch B.

## QA handoff (U65)

- URL base: `http://localhost:5173/command-center/hrm/settings?tab=<id>`
- Account: `ceo@xe.vn` / `Xevn@2026`
- Mỗi tab: Thêm → Lưu → row list → F5 → retire (nếu có row) — **cấm seed**

### Tab ids for matrix

- `emp-document-types`
- `emp-employment-types`
- `emp-employment-statuses` (ST + STR sub-shells)
- `si-insurance-types`
- `si-insurers`
- `dec-decision-types`
- `rec-pipeline-stages`

## ack_status

**READY_FOR_QA**

## not promoted

- Browser UF per tab (QA `QA-PO-HRM-SETTINGS-W3-BROWSER-01`)
- Effective picker consumer flows (profile/form) — out of scope slice; invalidate query keys vẫn gọi sau save/retire
