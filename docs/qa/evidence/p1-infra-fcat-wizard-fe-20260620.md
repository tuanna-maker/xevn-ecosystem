# P1-INFRA-FCAT-WIZARD-FE-01 — Foundation category wizard + list P0 fix

| Field | Value |
|-------|-------|
| **work_item_id** | P1-INFRA-FCAT-WIZARD-FE-01 |
| **spec_ref** | `docs/program/P1-INFRA-FOUNDATION-CATEGORY-UX-PROGRAM.md` · UC-XBOS-INF-01 |
| **ack_status** | READY_FOR_QA |
| **date** | 2026-06-20 |

## P0 fix (list pollution)

| Before | After |
|--------|-------|
| «Thêm» pushed empty row into `foundationCategories` immediately | Draft lives only in `foundationForm` + wizard modal until save |
| «Quay lại» left `—` / `0 pháp nhân` row in table | `closeFoundationCategoryWizard()` + `removeUnsavedFoundationDraft()` strips empty legacy rows |
| Save did not always refresh list from GET | `saveFoundationCategory()` → PUT → `loadInfrastructureSettingsFromDb()` → close wizard |

## UX delivered

- **`FoundationCategoryWizard.tsx`** — full-viewport modal (`fixed inset-0`, `z-[100]`, `backdrop-blur`, `xevn-safe-inline`)
- Steps: (1) Mã/Tên/Mô tả (2) Phạm vi pháp nhân chips (3) Khối/trường — opens nested infra fields modal (`z-[110]`)
- Primary **«Xác nhận & áp dụng»** via `MutationButton` + `Loader2`
- List table: `filterDisplayableFoundationCategories` — code, name, pháp nhân count, **Sửa** / **Xóa** (ConfirmDialog)

## Files

| Path | Change |
|------|--------|
| `apps/web/web-portal/src/pages/command-center/FoundationCategoryWizard.tsx` | New wizard |
| `apps/web/web-portal/src/pages/command-center/foundationCategoryList.ts` | List merge/filter helpers |
| `apps/web/web-portal/src/pages/command-center/foundationCategoryList.test.ts` | Vitest 5/5 |
| `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | Refactor wiring |

## Verify (agent)

```text
pnpm --filter web-portal exec vitest run src/pages/command-center/foundationCategoryList.test.ts  → 5/5 exit 0
pnpm --filter web-portal build                                                                  → exit 0
```

## QA browser path (:8088 — U65 FE-only)

1. Login `ceo@xe.vn` / `Xevn@2026`
2. Command Center → Cài đặt → **Hạ tầng cơ sở** → tab **1. Danh mục nền & phạm vi**
3. **Thêm danh mục nền** → wizard step 1 — table must **not** gain empty row
4. **Hủy** / **Quay lại** at step 1 without save — table unchanged
5. Complete wizard: code + name → tick ≥1 pháp nhân → step 3 **Cấu hình khối & trường** (optional) → **Xác nhận & áp dụng**
6. Network: PUT `/api/xbos/infrastructure/settings` **2xx**; F5 — row shows code, name, pháp nhân count
7. **Sửa** reopens wizard; **Xóa** shows confirm → row removed after F5

## DevOps deploy note

After QA PASS: rebuild/restart **web-portal** on `:8088` (`portal-fe-docker-rebuild-required`) — static bundle change in `CommandCenterPage` chunk.

## Residual

- Step 3 reuses existing infra fields modal (nested popup) rather than full inline extract of 800+ line panel — functionally equivalent for field config; full inline embed deferred to reduce regression risk.
