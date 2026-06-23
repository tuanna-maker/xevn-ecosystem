# P1-INFRA-FCAT-LIST-BUG-QA — Danh mục nền list `—` / `0 pháp nhân`

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-INFRA-FCAT-LIST-BUG-QA` |
| **Date** | 2026-06-20 |
| **Env** | VPS `:8088` · `http://14.225.217.232:8088` |
| **Persona** | `ceo@xe.vn` / BOD (session persisted) |
| **UC** | UC-XBOS-INF-01 |
| **spec_ref** | `docs/program/P1-INFRA-FOUNDATION-CATEGORY-UX-PROGRAM.md` · `METADATA_APPLY_PROPAGATION_MATRIX.md` AC-META-PROP-FND-01 |
| **ack_status** | **PASS_TO_PM** |

## Verdict

**BUG CONFIRMED (P0 UX/data integrity)** — Sponsor symptom reproduced on `:8088`. Root cause is **FE dual-state desync** (`foundationForm` vs `foundationCategories`), **not** API failure on «Quay lại». «Quay lại» performs **no PUT**; list reads stale `foundationCategories` rows that were inserted empty at «Thêm danh mục nền».

**Defect:** `DEF-INFRA-FCAT-LIST-01` → owner **dev-fe** (`P1-INFRA-FCAT-WIZARD-FE-01`).

---

## Repro (primary — Quay lại without save)

**URL:** `/command-center?settings=company_infrastructure` → tab **1. Danh mục nền & phạm vi**

| Step | Action | Expected (SRS) | Observed |
|------|--------|------------------|----------|
| 1 | **Thêm danh mục nền** | Open create/detail form | 🟢 Form «Danh mục nền mới» |
| 2 | Mã = `QA-FCAT-LIST-BUG-20260620`, Tên = `QA repro list bug — Quay lại without save` | Bind form | 🟢 Header updates live |
| 3 | Tick **TẬP ĐOÀN** + **XE_TMDV** (2 pháp nhân) | Scope chips checked in form | 🟢 Checkboxes checked in detail |
| 4 | **Quay lại** (sticky footer) — **no** «Lưu danh mục nền» | Discard draft OR show merged scope in list | 🔴 List row: `—` / `—` / **`0 pháp nhân`** |
| 5 | Network during steps 1–4 | No PUT unless Lưu | 🟢 **No** `PUT /api/xbos/infrastructure/settings` (only initial GET on page load) |
| 6 | GET API (authenticated) after step 4 | DB unchanged vs pre-create | 🟢 `foundationCategories.length === 0` in `data` wrapper |

**List table DOM after step 4 (CDP extract):**

```json
[
  ["—", "—", "0 pháp nhân", "Chi tiết & cấu hình"],
  ["—", "—", "0 pháp nhân", "Chi tiết & cấu hình"]
]
```

**Re-open detail from phantom row:** form loads **empty** (code/name blank, no ticks) — `openFoundationCategoryDetail` copies from `foundationCategories` stub, not discarded `foundationForm`.

---

## Root cause (code trace)

| Layer | Finding |
|-------|---------|
| **FE — premature list insert** | `openNewFoundationCategory()` pushes empty row into `foundationCategories` immediately (`appliesToCompanyIds: []`, blank code/name). |
| **FE — edit isolation** | All detail edits (inputs, `toggleFoundationCompany`) mutate **`foundationForm` only**. |
| **FE — Quay lại** | `closeFoundationCategoryDetail()` clears `foundationForm` + detail id; **does not** merge form into list **nor** remove unsaved draft row. |
| **FE — list render** | Table binds `foundationCategories` → `{row.code \|\| '—'}`, `{row.appliesToCompanyIds.length} pháp nhân`. |
| **API** | `saveFoundationCategory()` is the **only** path that merges `foundationForm` → array and calls `saveInfrastructureSettingsToDb`. «Quay lại» never invokes it. |

**File:** `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`

- `openNewFoundationCategory` ~3290–3301 — inserts empty draft into `foundationCategories`
- `toggleFoundationCompany` ~3345–3352 — updates `foundationForm` only
- `closeFoundationCategoryDetail` ~3285–3288 — drop form, keep stale list row
- List cells ~5544–5551 — display stale array
- Sticky «Quay lại» ~7887 — calls `closeFoundationCategoryDetail()` without sync

**Not an API bug** for the sponsor path (Quay lại). API contract (`PUT` → `XBOS-INFRA-201`) works when «Lưu danh mục nền» is used (see control below).

---

## Control — Lưu path (contrast)

Same session, third create after repro pollution:

| Step | Result |
|------|--------|
| Fill `QA-FCAT-SAVE-CTRL-20260620` + tick TẬP ĐOÀN → **Lưu danh mục nền** | `PUT /api/xbos/infrastructure/settings` **200** · toast «Đã lưu danh mục nền và phạm vi áp dụng.» |
| List after Lưu + Quay lại | Row 3: `QA-FCAT-SAVE-CTRL-20260620` · `1 pháp nhân` 🟢 |
| Rows 1–2 (prior drafts) | Still `—` / `0 pháp nhân` 🔴 |

**GET after control save (`data.foundationCategories`):**

```json
[
  {"code": "", "applies": 0},
  {"code": "", "applies": 0},
  {"code": "QA-FCAT-SAVE-CTRL-20260620", "applies": 1}
]
```

**Secondary defect:** phantom draft rows persist to **DB** on any later Lưu because `saveFoundationCategory` PUTs the **entire** `foundationCategories` array including never-discarded empty drafts.

---

## Recommended fix (for dev-fe / BA delta)

Align with `P1-INFRA-FOUNDATION-CATEGORY-UX-PROGRAM.md`:

1. Do **not** push draft into list/table until validated save (wizard modal).
2. On «Quay lại» / Hủy: remove unsaved draft id from `foundationCategories` **or** merge `foundationForm` before close (prefer discard for empty drafts).
3. Filter empty categories (`!code.trim()`) before PUT.
4. AC: after tick + Quay lại without save → **no new list row** OR row reflects ticks; F5 must match DB.

---

## PM dispatch hint

```
work_item_id: P1-INFRA-FCAT-WIZARD-FE-01
from: qa PASS_TO_PM (P1-INFRA-FCAT-LIST-BUG-QA)
entry: DEF-INFRA-FCAT-LIST-01 confirmed :8088 — dual-state foundationForm/foundationCategories; Quay lại no PUT; phantom rows pollute list + DB on later save
exit: FoundationCategoryWizard or minimal fix; deploy :8088; list no —/0 after tick+Quay lại; PUT excludes empty drafts
evidence_path: docs/qa/evidence/p1-infra-fcat-list-bug-qa-20260620.md
spec_ref: UC-XBOS-INF-01 · P1-INFRA-FOUNDATION-CATEGORY-UX-PROGRAM.md
ack_status: READY_FOR_QA (P1-INFRA-FCAT-WIZARD-QA)
```

---

## Residual (not in scope this wave)

- 2 empty categories now in DB on `:8088` pilot — cleanup optional after FE fix (FE delete row or one-time admin PUT).
- L2.5 J-* not in scope for this infra-settings list bug QA item.
