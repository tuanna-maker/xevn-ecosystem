# PO-HRM-JD-DYNAMIC-UIUX-01 — UI/UX Spec: JD Dynamic Field Dialog — validation_json for select type

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-DYNAMIC-UIUX-01` |
| **lane** | governance · ba-process |
| **slice** | `docs/program/slices/PO-HRM-JD-DYNAMIC-TOPCV.md` |
| **status** | **READY** — binding SPEC-01, DATA-01 §12.7, ARCH-02 §2.3 to FE surface |
| **date** | 2026-08-17 |
| **forbidden** | `apps/**` code · seed · claim LIVE |
| **creative_extra** | `none` — Precision Motion tokens only |

---

## 0. Spec read ack (binding chain)

| Artifact | Cite |
|----------|------|
| Slice | `PO-HRM-JD-DYNAMIC-TOPCV.md` — settings fields → kéo vào create → popup dynamic → view TopCV-like |
| **SPEC-01 READY** | `PO-HRM-JD-DYNAMIC-SPEC-01.md` FR-UC-BP-REC-00a/b/c · BR-BP-JD-DYN-01..08 · AC-JD-DYN-01..16 |
| **DATA-01 ALIGNED-SPEC** | `PO-HRM-JD-DYNAMIC-DATA-01.md` §3.2 `validation_json` · §12.7 `select` source modes + `JD_SELECT_ALLOWLIST` |
| **ARCH-02 CONFIRMED** | `PO-HRM-JD-DYNAMIC-ARCH-02.md` §2.3 F-JD-DEF-02 DTO `validation_json` · VAL-JD-21/22 |

**Gap identified:** SPEC §6.2 lists "Danh sách chọn (khi có nguồn)" but **no UI surface** for entering `validation_json` when `field_type = select`. ARCH-02 §2.3 `CreateJdFieldDefDto.validation_json` exists — FE Dialog must surface it.

---

## 1. Surface map (FE ↔ API binding)

| Screen | Menu | UC | API (ARCH-02) | State |
|--------|------|-----|---------------|-------|
| **F1** Field catalog CRUD | Cài đặt → Trường JD | UC-00a | F-JD-DEF-01..04 | **EXISTING** (Dialog at lines 595–651 in JdDynamicSettingsPanel.tsx) |
| **F2** Default layout publish | Cài đặt → Bố cục mặc định JD | UC-00b (L1) | F-JD-LAY-01..04 | EXISTING |
| **F2b** DnD palette + canvas | Thư viện JD → Thêm/Sửa JD | UC-00b | F-JD-LAY-01 → F-JD-02 | Future (PO-HRM-JD-DYNAMIC-FE-01) |
| **F3** Dynamic create/edit | Thư viện JD (`JobTemplatesTab`) | UC-00c | F-JD-01..04 | Future |
| **F4** Public-style view | Thư viện JD → Xem | UC-00c | F-JD-03 | Future |

**This spec targets F1 only** — the **Add/Edit Field Dialog** inside `JdDynamicSettingsPanel.tsx` tab "Trường JD".

---

## 2. Current Dialog state (AS-IS)

Location: `apps/web/hrm/src/components/settings/JdDynamicSettingsPanel.tsx` lines **595–651**

```tsx
<DialogContent data-testid="jd-settings-field-dialog">
  <DialogHeader>
    <DialogTitle>Thêm trường JD</DialogTitle>
  </DialogHeader>
  <div className="grid grid-cols-12 gap-3">
    <div className="col-span-12 space-y-1 sm:col-span-6">
      <Label>Mã trường *</Label>
      <Input ... data-testid="jd-settings-field-key" />
    </div>
    <div className="col-span-12 space-y-1 sm:col-span-6">
      <Label>Nhãn *</Label>
      <Input ... data-testid="jd-settings-field-label" />
    </div>
    <div className="col-span-12 space-y-1 sm:col-span-6">
      <Label>Kiểu</Label>
      <Select value={fieldForm.field_type} onValueChange={...}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {FIELD_TYPES.map((t) => (
            <SelectItem key={t} value={t}>{displayFieldType(t)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
  <DialogFooter>
    <Button ... onClick={handleFieldDialogOpenChange(false)}>Hủy</Button>
    <Button ... onClick={onCreateField} data-testid="jd-settings-field-save">Thêm</Button>
  </DialogFooter>
</DialogContent>
```

**Missing:** No input for `validation_json` — required when `field_type = select`.

---

## 3. Required enhancement (TO-BE)

### 3.1 Conditional UI — show validation_json inputs ONLY when `field_type === 'select'`

| Mode | Source | `validation_json` shape | UI controls |
|------|--------|-------------------------|-------------|
| **Static** | Tenant-local options | `{ "source": "static", "options": ["A", "B", "C"] }` | Tag-input / comma-separated list → array of strings |
| **Catalog** | XBOS/HRM settings-catalog | `{ "source": "catalog", "catalog_key": "job_titles" }` | Select dropdown from `JD_SELECT_ALLOWLIST` (DATA §12.7) |

### 3.2 `JD_SELECT_ALLOWLIST` (from DATA-01 §12.7)

| catalog_key | Typical JD use | Owner SoT |
|-------------|----------------|-----------|
| `job_titles` | Chức danh / position (system field `position_code`) | XBOS→HRM effective |
| `job_grades` | Cấp bậc | XBOS/HRM catalog |
| `employment_types` | Loại HĐ / hình thức | Settings family |
| `departments` | Phòng ban (nếu field động) | Settings family |
| `recruitment_channels` | Kênh (optional on JD) | Settings family |

**Forbidden:** `leave_types`, `pay_types`, `salary_components`, `payroll_templates`, `insurers`, `insurance_types`, `kpi_library`, `hr_decision_types`, `contract_types`, `shifts`

### 3.3 Dialog layout (Precision Motion tokens, responsive grid)

```
┌─ Dialog: Thêm trường JD ─────────────────────────────────┐
│  Mã trường *  [____________________]  (col-span-6)       │
│  Nhãn *       [____________________]  (col-span-6)       │
│  Kiểu         [▼ Văn bản ngắn ▼]    (col-span-6)         │
│                                                         │
│  ────────────────────────────────────────────────────   │  ← divider when select
│  Nguồn danh sách  [▼ Tự định nghĩa ▼]  (col-span-6)    │
│                                                         │
│  ── When source = "static" ───────────────────────────  │
│  Tùy chọn (cách nhau bằng Enter/phẩy)                   │
│  [ TagInput / Textarea ]  (col-span-12)                 │
│  Helper: "Mỗi dòng hoặc cách nhau bởi dấu phẩy"         │
│                                                         │
│  ── When source = "catalog" ─────────────────────────   │
│  Catalog key  [▼ job_titles ▼]  (col-span-6)            │
│  Helper: "Lấy từ danh mục XBOS/HRM có sẵn"              │
│                                                         │
│  [Hủy]                                    [Thêm]        │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Component binding (Rule 41)

| UI Element | API Field | Validation |
|------------|-----------|------------|
| `field_type` Select | `CreateJdFieldDefDto.field_type` | Required, enum `short_text`\|`long_text`\|`select`\|`number`\|`date` |
| `source` Select (when select) | `validation_json.source` | Required when `field_type=select`; enum `static`\|`catalog` |
| TagInput (static) | `validation_json.options` | Required when `source=static`; min 1 option; unique; max 50 |
| Catalog Select (catalog) | `validation_json.catalog_key` | Required when `source=catalog`; must ∈ `JD_SELECT_ALLOWLIST` |

---

## 5. Data flow

```
User picks field_type = select
       │
       ▼
FE shows conditional "Nguồn danh sách" row
       │
       ├─ User picks "Tự định nghĩa" → shows TagInput for options[]
       │       │
       │       ▼
       │    User enters: "Lương cao, Môi trường tốt, Phúc lợi đầy đủ"
       │       │
       │       ▼
       │    FE builds: { source: "static", options: ["Lương cao", "Môi trường tốt", "Phúc lợi đầy đủ"] }
       │
       └─ User picks "Từ danh mục hệ thống" → shows Catalog Select
               │
               ▼
            User picks "job_titles"
               │
               ▼
            FE builds: { source: "catalog", catalog_key: "job_titles" }

On Save → createJdFieldDef({ ..., validation_json: builtObject })
       │
       ▼
API F-JD-DEF-02 validates: VAL-JD-21 (catalog value ∈ allowlist) · VAL-JD-22 (catalog_key ∈ allowlist)
```

---

## 6. Acceptance criteria (FE measurable)

| ID | Scenario | Pass | Fail |
|----|----------|------|------|
| **AC-UIX-JD-01** | Open Dialog, pick `field_type = select` | Conditional "Nguồn danh sách" row appears | No conditional row |
| **AC-UIX-JD-02** | Pick source = "Tự định nghĩa" | TagInput/textarea visible; helper text shown | Missing input |
| **AC-UIX-JD-03** | Enter 3 options via TagInput, Save | `validation_json: {source:"static", options:["A","B","C"]}` sent to API | Missing/incorrect shape |
| **AC-UIX-JD-04** | Pick source = "Từ danh mục hệ thống" | Catalog Select with 5 allowlisted keys visible | Missing/wrong keys |
| **AC-UIX-JD-05** | Pick `job_titles`, Save | `validation_json: {source:"catalog", catalog_key:"job_titles"}` sent | Missing/incorrect shape |
| **AC-UIX-JD-06** | Switch field_type away from select | Conditional row hides; validation_json not sent | Row stays / sends null |
| **AC-UIX-JD-07** | Edit existing select field (pre-filled) | Dialog loads existing validation_json correctly | Empty / wrong values |
| **AC-UIX-JD-08** | Empty options on static source + Save | FE blocks save, inline error "Cần ≥1 tùy chọn" | Allows empty → 400 API |
| **AC-UIX-JD-09** | Invalid catalog_key (not in allowlist) | FE blocks before API, or shows API error `HRM-JD-SELECT-SRC` | Silent fail |
| **AC-UIX-JD-10** | F5 after save | Field row shows correct type + source badge | Data loss |

---

## 7. Empty / error states (UX-PRODUCT-RULES §10)

| State | Behavior |
|-------|----------|
| No options entered (static) | Inline error under TagInput: "Cần ít nhất 1 tùy chọn"; Save disabled |
| Catalog key not selected | Inline error: "Chọn danh mục nguồn"; Save disabled |
| API 400 `HRM-JD-SELECT-SRC` | Toast: "Danh mục không được phép cho trường JD"; Dialog stays open |
| API 409 duplicate field_key | Toast: "Mã trường đã tồn tại"; Dialog stays open, focus field_key |
| Network error | Toast: "Không kết nối được máy chủ"; Retry button |

---

## 8. Test data (U65 — no seed evidence)

| Test case | Input | Expected `validation_json` |
|-----------|-------|----------------------------|
| TC-01 Static | options: "A\nB\nC" | `{source:"static",options:["A","B","C"]}` |
| TC-02 Catalog | catalog_key: "job_grades" | `{source:"catalog",catalog_key:"job_grades"}` |
| TC-03 Switch type | short_text → select → number | validation_json only sent when select |
| TC-04 Edit load | Existing field with catalog source | Dialog pre-fills source + catalog_key |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | `pm` → dispatch `dev-fe` for `PO-HRM-JD-DYNAMIC-FE-01` (F1 dialog enhancement) |
| **evidence** | This file + `docs/qa/evidence/po-hrm-jd-dynamic-uiux-01.md` |
| **Dev unlock** | **YES** — SPEC+DATA+ARCH-02+UIUX all on disk |

---

## 10. Next dispatch prompt (copy-ready)

```text
work_item_id: PO-HRM-JD-DYNAMIC-FE-01
role: dev-fe
lane: execution · FE web
entry_criteria:
  - docs/program/specs/PO-HRM-JD-DYNAMIC-ARCH-02.md CONFIRMED
  - docs/program/specs/PO-HRM-JD-DYNAMIC-UIUX-01.md READY (this file)
  - remaster_program_done=false · face_live=false · U65
read_first:
  - apps/web/hrm/src/components/settings/JdDynamicSettingsPanel.tsx (lines 595–651 Dialog)
  - apps/web/hrm/src/integrations/hrmApi.ts (createJdFieldDef DTO)
  - docs/program/specs/PO-HRM-JD-DYNAMIC-UIUX-01.md (AC-UIX-JD-01..10)
  - docs/program/specs/PO-HRM-JD-DYNAMIC-DATA-01.md §12.7 (allowlist)
  - docs/program/specs/PO-HRM-JD-DYNAMIC-ARCH-02.md §2.3 (F-JD-DEF-02 DTO)
spec_read_ack required: uiux_spec + api_design ARCH-02§2.3 + data §12.7
code_memory_required: true · change_mode: UPGRADE · preserve_default: true
allowed_paths:
  - apps/web/hrm/src/components/settings/JdDynamicSettingsPanel.tsx
  - apps/web/hrm/src/integrations/hrmApi.ts (if DTO extend needed)
forbidden_paths:
  - JobPostingsTab / JobTemplatesTab (future F2b/F3)
  - apps/api/**
exit_criteria:
  - Dialog shows conditional validation_json inputs when field_type=select
  - Static mode: TagInput → options[] array; min 1 option validation
  - Catalog mode: Select from JD_SELECT_ALLOWLIST (5 keys)
  - Edit mode pre-fills existing validation_json
  - AC-UIX-JD-01..10 pass (manual + unit test)
  - solid_convention_ack · fe_boundary · display_ready_ack
evidence_path: docs/qa/evidence/po-hrm-jd-dynamic-fe-01.md
ack_status: READY_FOR_QA
```