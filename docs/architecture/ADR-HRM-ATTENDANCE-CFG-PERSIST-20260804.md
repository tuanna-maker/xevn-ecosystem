# ADR: HRM Attendance CFG persist — shifts SoT, rules table, geofence

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-HRM-ATTENDANCE-CFG-PERSIST |
| **work_item_id** | `PO-MFD-M1-ATT-P0-CFG-SA-01` |
| **Status** | Accepted |
| **Date** | 2026-08-04 |
| **Decision owner** | SA |
| **Closes** | DATA_CLASS_MATRIX §6 P0-1, P0-4, P0-6 (architecture); execution → `PO-MFD-M1-ATT-P0-CFG-BE-01` |
| **Related** | [`ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`](ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md) (company_id TEXT slug), [`docs/hrm/SRS.md`](../hrm/SRS.md) FR-HRM-SC-SHIFT-01, [`HRM-ATTENDANCE_DATA_CLASS_MATRIX.md`](../qa/professional/menu-fidelity/HRM-ATTENDANCE_DATA_CLASS_MATRIX.md) §6 |
| **Evidence** | `docs/qa/evidence/po-mfd-m1-att-p0-cfg-sa-01.md` |

---

## 1. Context

Menu Fidelity M1 (U87) classifies Attendance **CFG** as payroll-critical: standard days/month, rounding, method toggles, geofence. Today:

- FE `useAttendanceRules.ts` builds **in-memory defaults**; `saveRules` does not call Nest.
- BE geofence uses **`attendance_work_sites`** on `POST /attendance/records` (`assertWithinWorkSite`) with **`company_id UUID`** and pilot **`ensureDefaultWorkSite`** insert — scope mismatch vs JWT slug (`main`, `holding`, member slugs).
- **`work_shifts`** CRUD is live; XBOS catalog key **`shifts`** (FR-HRM-SC-SHIFT-01) remains **HOLD dual SoT** in SRS.
- Supabase types define **`public.attendance_rules`** (one row per `company_id` string) aligned with FE `AttendanceRules` — **no Nest route**.

Enterprise API map (`HRM-ATTENDANCE_ENTERPRISE_API_MAP.md`) covers TXN/UI gaps; **this ADR locks CFG persistence only** — no duplicate C1–C7 inventory.

---

## 2. Decisions

### D1 — Work shift SoT (P0-4)

| Plane | SoT GĐ1 | Mutate path | Consumers |
|-------|---------|-------------|-----------|
| **Attendance operations** | **`public.work_shifts`** | `GET/POST/PATCH/DELETE /attendance/work-shifts` | Ca→Danh sách, OT/shift-change TXN, **payroll shift coefficient** on assigned shift row |
| **Group REF catalog** | **XBOS → HRM `shifts`** (catalog-sync / Settings) | Settings→Danh mục publish/pull — **not** Attendance Ca modal as second master | Import labels, future roster codes, cross-module pickers |

**Rule:** For schedule display, payroll coeff, and OT base tied to a **concrete shift instance**, **`work_shifts` wins**. Catalog `shifts` is **REF only** in GĐ1; Attendance UI **must not** hardcode catalog rows as a parallel CRUD master.

**Deferred (not P0):** One-way sync catalog code → `work_shifts.code` or roster grid (DATA_CLASS §2.1 «Lịch ca») — separate work_item; **out of** `PO-MFD-M1-ATT-P0-CFG-BE-01` unless PM splits.

**Closes SRS HOLD:** FR-HRM-SC-SHIFT-01 dual resolved as **split responsibility** (REF vs operational table), not merge into one table in GĐ1.

---

### D2 — `attendance_rules` physical model (P0-1)

**Accepted:** Dedicated table **`public.attendance_rules`**, **one UPSERT document per `company_id` TEXT** (JWT operating slug), **not** `hrm_company_settings` JSON.

| Rationale | Detail |
|-----------|--------|
| Shape lock | Columns match FE `AttendanceRules` / Supabase `types.ts` — Dev implements DTO 1:1 |
| Separation | `leave_l1_max_days` and ladder CFG stay **`hrm_company_settings`** (leave WF) — avoid mixed JSON blob |
| API | `GET /attendance/rules` + `PATCH /attendance/rules` (company-scoped, lazy create defaults server-side on first GET — **not seed script**, U65) |

**Column set (GĐ1 persist):**

| Column | Type | FE / business |
|--------|------|----------------|
| `id` | UUID | PK |
| `company_id` | TEXT NOT NULL UNIQUE | Scope slug |
| `work_start_day`, `work_end_day` | int | Rules→Chung |
| `work_days` | text[] | mon–sun codes |
| `round_in_minutes`, `round_out_minutes` | int | 0,5,10,15 |
| `standard_type` | text | `fixed` \| `monthly` |
| `standard_days_per_month`, `hours_per_day` | numeric | Payroll standard |
| `allow_multiple_checkin`, `auto_checkout`, `notify_late` | boolean | Chung |
| `gps_enabled`, `wifi_enabled`, `qr_enabled`, `faceid_enabled` | boolean | Device/App policy |
| `gps_locations` | jsonb | **Deprecated for enforcement** — see D3 |
| `created_at`, `updated_at` | timestamptz | audit |

**Rejected for GĐ1:** Storing the above only inside `hrm_company_settings` — harder QA traceability and breaks existing Supabase contract.

**SPEC_GAP (BA narrow, non-blocking P0):** Policy hours for `auto_checkout` (SRS_VN «10h») — implement flag persist in P0; duration job **GĐ2**.

---

### D3 — Geofence unify (P0-1, P0-6)

**Enforcement SoT:** **`public.attendance_work_sites`** only. Check-in path keeps `assertWithinWorkSite(companyId, lat, lon)`.

| Topic | Decision |
|-------|----------|
| **FE `gps_locations[]`** | Admin UX **binds to work-sites API**, not to `attendance_rules.gps_locations` for new writes. Optional: PATCH rules may omit `gps_locations`; GET rules may **embed read-only** list from work-sites for one-screen UX (BE aggregate) — prefer **separate** `GET /attendance/work-sites` + FE merge. |
| **`company_id`** | **`TEXT NOT NULL`** on `attendance_work_sites`, same slug as `attendance_records.company_id` and `resolveHrmListScope` — **migration** from UUID (P0-6). |
| **Pilot insert** | **`ensureDefaultWorkSite`** HQ UUID row — **remove from default UAT path** (U65); empty sites → geofence **not applied** (current: no sites → skip assert). QA documents behavior. |
| **Radius** | BE column `radius_meters`; FE `GPSLocation.radius` maps on CRUD DTO. |
| **Scope parity** | List/create/update/delete work-sites use **same** company scope resolver as attendance records (U19). |

**Error contract `HRM-ATT-GEO-001`:**

| Field | Value |
|-------|--------|
| When | `latitude` + `longitude` on record create and point outside all **active** sites for scoped company |
| HTTP | **400** Bad Request (as-built Nest) |
| Body code | `HRM-ATT-GEO-001` |
| Message | User-facing VI (e.g. «Check-in ngoài vùng cho phép») |
| Legacy | `ATTENDANCE_LOCATION_OUT_OF_RANGE` in `API_CONTRACT_VN.md` §4 — **alias only**; new OpenAPI/docs point to `HRM-ATT-GEO-001`; QA accepts either code until contract doc bump |

**If `gps_enabled=false`:** Mobile/portal may still send coords; BE **may** skip geofence when rules flag false (dev-be implements read rules in record path — P0 scope).

---

### D4 — GĐ2 / stub sidebar (P0-5 messaging, not P0 build)

Attendance **Cài đặt** panels below are **not** CFG SoT in GĐ1 — redirect copy + link target:

| UI stub | Configure instead | Class |
|---------|-------------------|-------|
| Tăng ca (OT type catalog) | Settings→Danh mục (`shifts`/OT codes when published) + OT TXN API | REF + TXN |
| Quy tắc nghỉ phép | Settings catalog **`leave_types`** + **`hrm_company_settings`** ladder | REF + CFG |
| Đi muộn về sớm | Future FR / company policy table | CFG — **GĐ2** |
| Quy tắc đơn từ | WF + request TXN rules | CFG — **GĐ2** |
| FaceID toggle | **OUT GĐ1** (SRS competitive boundary) — column persisted **false**; UI disabled + banner | — |
| Ca→Lịch ca / tablet / proxy / auto subtabs | **GĐ2** — `featureInDev` | — |

FE **must** show «Cấu hình tại Cài đặt HRM → Danh mục / Công ty» on stubs — **not** fake Save. QA FAIL if stub implies persist.

---

## 3. Target API surface (dev-be contract sketch)

Not OpenAPI replacement — execution checklist for `PO-MFD-M1-ATT-P0-CFG-BE-01`:

```text
GET    /attendance/rules              → AttendanceRules (scoped company)
PATCH  /attendance/rules              → AttendanceRulesInput partial
GET    /attendance/work-sites         → list (scoped)
POST   /attendance/work-sites         → create site
PATCH  /attendance/work-sites/:id     → update
DELETE /attendance/work-sites/:id     → soft or hard per existing HRM delete pattern
```

Existing **`/attendance/work-shifts`** unchanged (D1).

---

## 4. Architecture (CFG data flow)

```text
┌─────────────────────┐     PATCH/GET      ┌──────────────────────┐
│ Attendance.tsx      │ ─────────────────► │ attendance_rules      │
│ Rules→Chung/Standard│                    │ (1 row / company slug)│
└─────────┬───────────┘                    └──────────┬───────────┘
          │ Rules→App GPS admin                         │
          │ CRUD work-sites                             │ flags: gps_enabled,
          ▼                                             │ standard_days, …
┌─────────────────────┐                    ┌──────────▼───────────┐
│ work-sites API      │ ─── enforce ─────► │ attendance_work_sites │
└─────────────────────┘     on POST        │ company_id TEXT       │
          ▲                                  └──────────┬───────────┘
          │ POST records + lat/lon                      │
          └──────── assertWithinWorkSite ─── HRM-ATT-GEO-001

┌─────────────────────┐
│ work_shifts API     │ ◄── payroll coeff · OT · Ca list (D1 SoT)
└─────────────────────┘
        ▲
        │ REF only GĐ1
┌───────┴─────────────┐
│ XBOS catalog shifts │  Settings sync — no Attendance dual CRUD
└─────────────────────┘
```

---

## 5. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Dual geofence during migration | Stop writing `gps_locations` JSON; FE uses work-sites only in P0 wire |
| Group CEO `main` vs `holding` sites | Work-sites CRUD uses same scope resolver as records; TM audit list↔create |
| Empty work-sites + GPS check-in | Document skip-assert; QA case «no sites» vs «out of range» |
| Catalog vs work_shifts drift | GĐ1 accept; backlog one-way sync with explicit FR |

---

## 6. Validation (QA / TM)

- U65: Rules→Chung **Lưu** → F5 → values match GET rules.
- U65: App→Add GPS site → check-in inside/outside → **HRM-ATT-GEO-001** / success.
- No `pnpm seed:*` for rules/sites.
- `attendance_work_sites.company_id` slug matches token scope on member + group personas.
- Sheet columns (`P0-3`) — **out of** this ADR; separate backlog.

---

## 7. Consequences

- **dev-be:** DDL migration TEXT `company_id`; Nest routes above; remove pilot site insert; specs for geo + rules.
- **dev-fe:** Wire `useAttendanceRules` to Nest; GPS UI → work-sites; stub banners per D4.
- **ba-data:** Optional delta for auto-checkout hours + OT catalog codes (non-blocking).
- **QC:** Block GO on CFG persist wave if rules still in-memory only or UUID geofence remains.

---

*PO-MFD-M1-ATT-P0-CFG-SA-01 · SA · Accepted 2026-08-04*
