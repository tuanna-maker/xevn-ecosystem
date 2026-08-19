# DB_DESIGN — HRM Attendance sheets + period records (open grid)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-ATT-SHEET-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` **§3.4 FR-HRM-AT-14** Diễn biến #1–#12 · team `docs/hrm/SRS.md` **UC-HRM-23 / HRM-AT-14 / UC-HRM-32** · **AC-ATT-SHEET-01..06** · **BR-ATT-SHEET-01..07** |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§12.1** · **§13** · **§14.4 FR-HRM-AT-14** · G-DB-07 (no auto FK sheet→records) |
| **ref_api** | `docs/hrm/API_DESIGN_HRM_ATT_SHEET.md` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |
| **U71** | Physical DB slice before Dev claim on attendance-sheet mutate / weekly grid |
| **Date** | 2026-07-27 |
| **Runtime ensure** | `AttendanceCatalogService.ensureAttendanceSheetSchema` · `AttendanceService.ensureSchema` (records) |

> **must_keep:**  
> 1. `attendance_sheets.company_id` = **TEXT operating slug** (Plane B) via `resolveHrmPersistCompanyIdText` — **not** holding LE UUID as persist type.  
> 2. **Header create ≠ auto roster** — POST sheet INSERT **one** row only; **no** FK/cascade that bulk-inserts `attendance_records` (AC-ATT-SHEET / G-DB-07).  
> 3. Leave pair (`docs/hrm/DB_DESIGN_HRM_LEAVE.md` / `API_DESIGN_HRM_LEAVE.md`) — **do not wipe / rewrite**.  
> 4. List vs get/update/delete/close use **same** `resolveHrmListScope` / `assertResourceInHrmScope` (U19 scope parity).

---

## 1. Table SoT — `public.attendance_sheets`

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`attendance_sheets`** |
| Owner service | HRM (`hrm-api` attendance catalog) |
| Consumers | Attendance tab «Bảng chấm công» · weekly grid binder · Command Center embed |

### 1.1 Columns (physical)

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK DEFAULT `gen_random_uuid()` | NO | Khóa bảng kỳ | FR-HRM-AT-14 #8 khóa mang |
| **`company_id`** | **TEXT NOT NULL** | NO | Đơn vị vận hành (slug ladder) | FR-HRM-AT-14 · scope ladder |
| `name` | TEXT NOT NULL | NO | Tên bảng (vd. kỳ + Công chuẩn) | #5 / AC-01 |
| `start_date` | DATE NOT NULL | NO | Từ ngày kỳ | #5–#6 · BR-ATT-SHEET-04 |
| `end_date` | DATE NOT NULL | NO | Đến ngày kỳ | #5–#6 · BR-ATT-SHEET-04 |
| `attendance_type` | TEXT NOT NULL DEFAULT `'daily'` | NO | Loại chấm (ngày / …) | Input optional |
| `standard_type` | TEXT NOT NULL DEFAULT `'standard'` | NO | Chuẩn công — UI «Công chuẩn» (`standard` / `fixed`) | AC-ATT-SHEET-01 |
| `department` | TEXT | YES | Lọc phòng ban metadata header | Input optional |
| `positions` | TEXT | YES | Lọc chức danh metadata header | Input optional |
| `status` | TEXT NOT NULL DEFAULT `'draft'` | NO | Lifecycle: `draft` \| `open` \| `closed` | Kết quả trả về «đang mở» / close |
| `notes` | TEXT | YES | Ghi chú | Optional |
| `created_by` | TEXT | YES | Người tạo (display) | Audit |
| `created_at` | TIMESTAMPTZ NOT NULL DEFAULT NOW() | NO | Tạo | #11 F5 |
| `updated_at` | TIMESTAMPTZ NOT NULL DEFAULT NOW() | NO | Cập nhật / đóng | Close / PATCH |

### 1.2 Constraints / indexes

| Name / definition | Purpose |
|-------------------|---------|
| App check: `start_date <= end_date` on create/update | Diễn biến #6 · BR-ATT-SHEET-04 |
| App check: `status IN ('draft','open','closed')` | Lifecycle generate/close |
| Soft unique (optional app): same `(company_id, start_date, end_date, department, positions)` when product forbids overlap | Diễn biến #7 |
| Recommended index `idx_attendance_sheets_company_start` ON `(company_id, start_date DESC)` | List scope + sort TechSpec §12.1.2 |

**Cấm:**

- `company_id UUID` / cast `::uuid` trên persist sheet hoặc scope match.
- DB FK / trigger từ `attendance_sheets` → auto INSERT `attendance_records` (G-DB-07 · AC-ATT-SHEET-06).

### 1.3 Status lifecycle (normative)

| Status | Meaning (VI) | Set by |
|--------|--------------|--------|
| `draft` | Mới tạo (runtime create default) | **Generate** POST |
| `open` | Đang mở vận hành (xem lưới / ghi điểm danh) | Optional PATCH; FE may treat `draft` as operable until close |
| `closed` | Đã đóng kỳ — không sửa kỳ/metadata nghiệp vụ (chỉ xem) | **Close** PATCH `status=closed` |

---

## 2. Related table — `public.attendance_records` (weekly open grid)

> Not a child FK of sheets. Grid binds by **date range** = `[sheet.start_date, sheet.end_date]` + same workforce `company_id` scope (TechSpec §12.1.1).

| Column (physical truth) | Type | Notes |
|-------------------------|------|-------|
| `id` | UUID PK | |
| **`company_id`** | **TEXT NOT NULL** | Migrated from UUID → TEXT in `ensureSchema` — Plane B parity with sheets/leave |
| `employee_id` | UUID NOT NULL | Soft FK employees |
| `attendance_date` | DATE NOT NULL | In-period filter for open sheet |
| `check_in_at` / `check_out_at` | TIMESTAMPTZ | Nullable |
| `status` | TEXT | `pending` \| `present` \| `absent` \| `leave` |
| `note` / `created_by` / timestamps | … | |

| Index | Purpose |
|-------|---------|
| `uq_attendance_company_employee_date` | One day / NV / company |
| `idx_attendance_company_date` | Weekly GET `from_date`/`to_date` |

**Empty OK:** sheet exists + zero records in period → **200** live-empty (BR-ATT-SHEET-06) — not ERROR.

---

## 3. Dual-plane / scope notes

```text
attendance_sheets.company_id   = operating slug TEXT  (Plane B)
attendance_records.company_id  = operating slug TEXT  (Plane B — after ALTER)
xbos_legal_entity.id (UUID)    = Plane A — NEVER persist as sheet.company_id
leave_requests.company_id      = sibling Plane B (must_keep leave pair — separate file)
```

| Invariant | Rule |
|-----------|------|
| List vs get-by-id vs PATCH/DELETE/close | Same `resolveHrmListScope` + `assertResourceInHrmScope` → `HRM-AS-404` / `HRM-AS-409` |
| Weekly records | Same workforce ladder (`pushWorkforceEmployeeScopeFilter`) as other attendance lists |
| Sheet ↔ records | **Logical** period bind only — **no** physical FK (G-DB-07) |

---

## 4. ER (logical)

```text
employees (id UUID)
    │ soft
    └──< attendance_records (company_id TEXT, attendance_date)

attendance_sheets (company_id TEXT, start_date, end_date, status)
    │  (no FK)
    └── period bind ──> attendance_records WHERE date ∈ [start, end]
                        AND company scope match

leave_requests / employee_leave_balances ── sibling attendance domain
    (see DB_DESIGN_HRM_LEAVE.md — must_keep)
```

---

## 5. Out of scope / non-goals

- Auto-generate roster / `attendance_records` on sheet create (product CR riêng — TechSpec §12.1.8).
- Hard FK sheet_id on records (would break empty-grid AC).
- Wipe or edit `DB_DESIGN_HRM_LEAVE.md`.
- Seed sheets/records for U65 evidence (forbidden).
- Work-shifts / update-requests physical packs (separate slices).

---

## 6. Trace matrix (table → FR → API)

| Table | FR / Diễn biến | Primary API |
|-------|----------------|-------------|
| `attendance_sheets` | #3 list · #4 empty · #8 generate · #11 F5 · close lifecycle | See `API_DESIGN_HRM_ATT_SHEET.md` list/get/generate/close |
| `attendance_records` | #9–#10 open grid / empty | `GET …/attendance/records` (companion) |
