# Evidence — D-XBOS-LABEL-FE-02 (F-XBOS-09 only)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-XBOS-LABEL-FE-02` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **date** | 2026-07-27 |
| **lane** | execution · U65 · FIX · preserve_default |
| **change_mode** | FIX (display-label only) |
| **seed** | **none** |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | `docs/xbos/SRS_FIELD_DISPLAY.md` F-XBOS-09 · AC-F-XBOS-09 · QA FAIL `docs/qa/evidence/qa-xbos-u72-label-01-20260727.md` DEF-U72-F09 |
| **out_of_scope** | F-XBOS-10 (`ApplyCatalogToMembersPanel`) — parallel `D-XBOS-U72-F10-HOLDING-PATH-01` |

## spec_read_ack

| Artifact | Cite |
|----------|------|
| QA FAIL | `docs/qa/evidence/qa-xbos-u72-label-01-20260727.md` — F-09: options VI OK; live bind still showed short token `general` at ~L9325 |
| SRS | `docs/xbos/SRS_FIELD_DISPLAY.md` F-XBOS-09 — `general`→VI; `value=` giữ key; unknown → `—` |
| Surface | `CommandCenterPage.tsx` infra custom field modal · «Thuộc khối» |

## Root cause

Read-only «Thuộc khối» in nested field form rendered `{infraCustomFieldDraft.blockCode}` → user saw raw `general` / `location` / `capacity`. Select `<option>` text was already VI; wire `value=` correct.

## Fix

| Path | Change |
|------|--------|
| `apps/web/web-portal/src/utils/infraBlockDisplayLabels.ts` | **ADD** — `resolveInfraBlockCodeDisplayLabel` (+ defaults VI, customBlocks, overrides; unknown → `—`) |
| `apps/web/web-portal/src/utils/infraBlockDisplayLabels.test.ts` | **ADD** — 5 vitest cases |
| `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | **FIX** — Thuộc khối bind + khối header dùng resolver; `@CODE-MEMORY-CHANGE` APPEND; **không** sửa ApplyCatalog panel |

### Display contract (F-09)

| Wire `blockCode` | Visible text |
|------------------|--------------|
| `general` | Khối Thông tin chung (hoặc titleOverrides) |
| `location` | Khối Vị trí & liên hệ (hoặc titleOverrides) |
| `capacity` | Khối Năng lực (hoặc titleOverrides) |
| custom with `labelVi` | `labelVi` |
| unknown / empty | `—` |

`value=` / save payload vẫn dùng `infraCustomFieldDraft.blockCode` (key).

## Verification (dev)

```bash
pnpm --filter web-portal exec vitest run src/utils/infraBlockDisplayLabels.test.ts
# → 5 passed
```

## QA retest (U65 browser-only — F-09 only; F-10 when parallel FE ready)

- **URL:** `http://127.0.0.1:5173/command-center?settings=company_infrastructure`
- **Account:** `ceo@xe.vn` / `Xevn@2026`
- **Click path:** Hạ tầng cơ sở → **Sửa** danh mục nền → **Tiếp theo** ×2 → pháp nhân **TẬP ĐOÀN** → **Cấu hình khối & trường** → mở form thêm/sửa field
- **Assert:**
  - «Thuộc khối» read-only / select display **không** chứa bare `general|location|capacity`
  - Options vẫn VI only (không prefix `general - `)
  - Header khối đang chọn = nhãn VI (không raw code)
  - Network save vẫn gửi wire `blockCode` key (không đổi contract)

## must_keep

- F-XBOS-01..08 / F-11 green surfaces untouched
- `ApplyCatalogToMembersPanel` not edited (F-10 parallel)
- No seed

## completion_report

```yaml
work_item_id: D-XBOS-LABEL-FE-02
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/dev-fe-xbos-label-02-20260727.md
completion_report: |
  Closed F-XBOS-09: Thuộc khối + header khối map via resolveInfraBlockCodeDisplayLabel;
  raw general/location/capacity no longer rendered. Wire value= kept.
  Vitest 5 PASS. F-10 out of scope (parallel work_item).
  Residual: none for F-09; QA retest after F-10 FE also READY.
next_owner: qa
next_dispatch_prompt: |
  work_item_id: QA-XBOS-U72-LABEL-02
  role: qa
  entry_criteria: BOTH D-XBOS-LABEL-FE-02 (F-09) AND F-10 FE READY_FOR_QA; U65 zero-seed
  scope: retest F-XBOS-09 + F-XBOS-10 only (+ smoke F-08/F-11 optional)
  F-09 click path: CC company_infrastructure → Sửa → wizard → Cấu hình khối & trường → Thuộc khối
  assert: no visible short token general|location|capacity; options VI; header VI
  F-10: ApplyCatalog source summary không echo xevn/holding
  evidence_path: docs/qa/evidence/qa-xbos-u72-label-02-20260727.md
  exit_criteria: F-09+F-10 🟢 → PASS_TO_PM; else FAIL_TO_PM with DEF ids
```

## ack_status

**READY_FOR_QA**
