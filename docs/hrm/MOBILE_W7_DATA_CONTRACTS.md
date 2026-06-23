# Mobile W7 — Data contracts (BA-Data)

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W7-BA-DATA-01` |
| **Partner** | `PCOMP-W7-BA-SRS-01` (ba-process — SRS delta) |
| **Program** | `P1-MOBILE-W7` · `MOBILE_W7_GAP_ORCHESTRATION.md` |
| **date** | 2026-06-07 (ICT) |
| **ack_status** | **PASS_TO_PM** |

**Scope:** Field matrices, validation rules, API JSON envelopes, and traceability for W7 waves **avatar (W7-2)**, **celebrations/DOB privacy (W7-1)**, **leave attachment (W7-3)**, **leave balance (W7-4)**, **employee directory (W7-5)**. Partner SRS owns UC if/else narrative; this doc is **SoT for data semantics**.

**Related:** `MOBILE_W7_TECHSPEC_DELTA.md` · `MOBILE_HOME_HUB_AC_DELTA.md` §5–6 · `MOBILE_WEB_PROFILE_AVATAR_GAP_AUDIT.md` · `settings-catalogs` `hrm_employee_personal_fields`.

---

## 1. Entity domain map

```text
employees
  ├─ avatar_url          (column TEXT — SoT display URL)
  ├─ custom_fields       (JSONB — catalog extension values)
  │    ├─ date_of_birth  ← catalog `date_of_birth`
  │    ├─ phone_number   ← catalog `phone_number`
  │    └─ tenant_id      (scope partition — not mobile-visible)
  └─ list/get scope      resolveHrmListScope (list ≡ get-by-id)

leave_requests
  ├─ (existing columns)
  └─ attachment_url      (TEXT NULL — W7-3 migration)

employee_leave_balances   (W7-4 — new table, recommended)
  OR interim custom_fields.leave_balance_{type} until policy engine

hrm-files (disk)
  └─ POST /catalog-extensions/files/upload → url bound to employee or leave row
```

---

## 2. Field matrix — `avatar_url`

| Attribute | Rule |
|-----------|------|
| **SoT column** | `public.employees.avatar_url` TEXT NULL |
| **Legacy read fallback** | `custom_fields.avatar_url` — BE **read-only merge** if column null; **writes** go to column only (no dual-write) |
| **Catalog** | Not a catalog extension field — operational media URL |
| **Max length** | 2048 (`UpdateEmployeeDto`) |
| **Format** | Relative public path `/api/hrm/files/{company_slug}/{filename}` or absolute HTTPS pilot URL |
| **Self PATCH** | JWT `employee_id` === `:id` → only `avatar_url` allowed (`employee-update-policy.ts`) |
| **HR PATCH** | `group_ceo`, `hr_manager`, … → full employee PATCH including `avatar_url` |
| **List parity** | `GET /employees` and `GET /employees/:id` both return `avatar_url` under same scope filters |
| **Mobile type** | `EmployeeRow.avatar_url?: string \| null` |
| **Empty UI** | Initials avatar when null — never fake URL |

### Validation (VAL-W7-AVT-*)

| ID | Condition | Expected |
|----|-----------|----------|
| VAL-W7-AVT-01 | PATCH self with `full_name` only | `403 HRM-EMP-403` |
| VAL-W7-AVT-02 | PATCH self `{ "avatar_url": "/api/hrm/files/..." }` | `200`, GET returns same URL |
| VAL-W7-AVT-03 | `avatar_url` length > 2048 | `400 HRM-EMP-001` |
| VAL-W7-AVT-04 | Upload without PATCH employee | File orphan — **forbidden** (anti-pattern §9 gap audit) |

### API examples — avatar

**Upload (prerequisite)**

```http
POST /api/hrm/catalog-extensions/files/upload?company_id=holding&feature=avatar
Authorization: Bearer {jwt}
Content-Type: multipart/form-data

file=@photo.jpg
```

```json
{
  "success": true,
  "code": "HRM-FILE-201",
  "data": {
    "url": "/api/hrm/files/holding/avatar-1717747200000-photo.jpg",
    "filename": "avatar-1717747200000-photo.jpg",
    "mimetype": "image/jpeg",
    "company_id": "holding"
  }
}
```

**PATCH self avatar**

```http
PATCH /api/hrm/employees/{self_employee_id}?company_id=holding
Authorization: Bearer {jwt}
Content-Type: application/json

{ "avatar_url": "/api/hrm/files/holding/avatar-1717747200000-photo.jpg" }
```

```json
{
  "success": true,
  "code": "HRM-EMP-200",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "company_id": "holding",
    "employee_code": "NV1001",
    "email": "uat.nv0001@xe.vn",
    "full_name": "Nguyễn Văn UAT",
    "job_title_key": "STAFF",
    "manager_id": null,
    "status": "active",
    "hired_at": "2024-01-15",
    "archived_at": null,
    "avatar_url": "/api/hrm/files/holding/avatar-1717747200000-photo.jpg",
    "custom_fields": {
      "tenant_id": "xevn",
      "date_of_birth": "1992-03-15"
    },
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2026-06-07T10:00:00.000Z"
  }
}
```

**GET list (directory + profile consume same field)**

```http
GET /api/hrm/employees?company_id=holding&page=1&page_size=20&status=active
```

```json
{
  "success": true,
  "code": "HRM-EMP-LIST-200",
  "data": {
    "total": 1170,
    "page": 1,
    "page_size": 20,
    "data": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "company_id": "holding",
        "employee_code": "NV1001",
        "email": "uat.nv0001@xe.vn",
        "full_name": "Nguyễn Văn UAT",
        "job_title_key": "STAFF",
        "manager_id": "22222222-2222-4222-8222-222222222222",
        "status": "active",
        "hired_at": "2024-01-15",
        "archived_at": null,
        "avatar_url": "/api/hrm/files/holding/avatar-1717747200000-photo.jpg",
        "custom_fields": {
          "tenant_id": "xevn",
          "phone_number": "0901234567",
          "date_of_birth": "1992-03-15"
        },
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2026-06-07T10:00:00.000Z"
      }
    ]
  }
}
```

> **Scope parity (U19):** Group CEO JWT `companyId=main` must resolve list and `GET /employees/:id` for the same row — no list-visible id with detail `404`.

---

## 3. Field matrix — `leave_attachment` (`attachment_url`)

| Attribute | Rule |
|-----------|------|
| **SoT column** | `public.leave_requests.attachment_url` TEXT NULL (**W7-3 migration**) |
| **Required when** | `leave_type` ∈ `{ sick, medical, maternity_medical }` (configurable catalog `leave_types`) — optional for `annual`, `unpaid` |
| **Upload feature** | `POST .../files/upload?feature=leave_attachment` |
| **Max file size** | 10 MB (existing `FileInterceptor` limit) |
| **Allowed MIME** | `application/pdf`, `image/jpeg`, `image/png`, `image/webp` |
| **Binding** | Upload returns `url` → client sends `attachment_url` on **create** or **PATCH before approve** |
| **Privacy** | Manager/HR in scope may read URL; other employees **403** on foreign leave GET |
| **Web parity** | Align Nest DTO with `useLeaveRequests` `attachment_url` field (currently null stub) |

### Validation (VAL-W7-LATT-*)

| ID | Condition | Expected |
|----|-----------|----------|
| VAL-W7-LATT-01 | `leave_type=sick`, no attachment | `201` allowed (warning UI) or `400 HRM-LEAVE-ATT-REQ` per SRS UC-HRM-MOB-06b |
| VAL-W7-LATT-02 | `attachment_url` not under `/api/hrm/files/{scope}/` | `400 HRM-LEAVE-VAL-ATT` |
| VAL-W7-LATT-03 | PATCH attachment after `status=approved` | `409 HRM-LEAVE-409` |

### API examples — leave attachment

**Create leave with attachment**

```http
POST /api/hrm/attendance/leave-requests
Authorization: Bearer {jwt}
Content-Type: application/json

{
  "company_id": "11111111-1111-4111-8111-111111111111",
  "employee_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "employee_code": "NV1001",
  "employee_name": "Nguyễn Văn UAT",
  "department": "Vận hành",
  "position": "STAFF",
  "leave_type": "sick",
  "start_date": "2026-06-10",
  "end_date": "2026-06-12",
  "total_days": 3,
  "reason": "Nghỉ ốm có giấy bác sĩ",
  "handover_to": "Trần Thị B",
  "handover_tasks": "Bàn giao ca sáng",
  "attachment_url": "/api/hrm/files/holding/leave_attachment-1717747300000-giay-bac-si.pdf"
}
```

```json
{
  "success": true,
  "code": "HRM-LEAVE-201",
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "company_id": "11111111-1111-4111-8111-111111111111",
    "employee_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "employee_code": "NV1001",
    "employee_name": "Nguyễn Văn UAT",
    "leave_type": "sick",
    "start_date": "2026-06-10",
    "end_date": "2026-06-12",
    "total_days": 3,
    "reason": "Nghỉ ốm có giấy bác sĩ",
    "status": "pending",
    "attachment_url": "/api/hrm/files/holding/leave_attachment-1717747300000-giay-bac-si.pdf",
    "requested_at": "2026-06-07T11:00:00.000Z",
    "reviewed_at": null,
    "reviewed_by": null,
    "rejected_reason": null
  }
}
```

**GET leave detail (manager)**

```http
GET /api/hrm/attendance/leave-requests/f47ac10b-58cc-4372-a567-0e02b2c3d479?company_id=holding
```

Response includes `attachment_url`; mobile opens in-app WebView or signed GET file route.

---

## 4. Field matrix — `leave_balance`

| Attribute | Rule |
|-----------|------|
| **SoT (target)** | Table `public.employee_leave_balances` — one row per `(company_id, employee_id, leave_type, balance_year)` |
| **Interim seed** | Optional `custom_fields.leave_balance_annual` numeric string until table seeded — **read-only fallback, not write path** |
| **Computed fields** | `remaining_days = entitled_days - used_days - pending_days` (server-side, never client-only) |
| **Leave types** | At minimum `annual`; extend via catalog `leave_types` codes |
| **Wizard UX** | Mobile Create Leave step 2 shows balance chip; Home summary optional `leave_balance_preview` |
| **Scope** | Employee may only read **own** balance; HR may read direct reports + rollup per scope ladder |

### Proposed columns — `employee_leave_balances`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `company_id` | TEXT | Scope slug |
| `employee_id` | UUID FK → employees | |
| `leave_type` | TEXT | e.g. `annual` |
| `balance_year` | INT | Calendar year VN |
| `entitled_days` | NUMERIC(5,1) | Policy allocation |
| `used_days` | NUMERIC(5,1) | Approved leave sum |
| `pending_days` | NUMERIC(5,1) | Pending requests sum |
| `updated_at` | TIMESTAMPTZ | |

### Validation (VAL-W7-LBAL-*)

| ID | Condition | Expected |
|----|-----------|----------|
| VAL-W7-LBAL-01 | `total_days` on create > `remaining_days` | `409 HRM-LEAVE-INSUFFICIENT-BALANCE` (warning + allow override if HR policy flag) |
| VAL-W7-LBAL-02 | GET balance for foreign `employee_id` (non-HR) | `403 HRM-LEAVE-403` |
| VAL-W7-LBAL-03 | Missing balance row | `200` with zeros + `source: "default"` — not mock fiction |

### API examples — leave balance

```http
GET /api/hrm/attendance/leave-balance?company_id=holding&employee_id={self}&leave_type=annual&year=2026
Authorization: Bearer {jwt}
```

```json
{
  "success": true,
  "code": "HRM-LEAVE-BAL-200",
  "data": {
    "company_id": "holding",
    "employee_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "leave_type": "annual",
    "balance_year": 2026,
    "entitled_days": 12,
    "used_days": 3,
    "pending_days": 1,
    "remaining_days": 8,
    "as_of": "2026-06-07T11:00:00+07:00",
    "source": "employee_leave_balances"
  }
}
```

**Home summary extension (optional W7-4)**

```json
"leave_balance_preview": {
  "annual_remaining_days": 8,
  "pending_days": 1
}
```

---

## 5. Field matrix — employee directory (UC-HRM-MOB-16)

Mobile **People / Directory** list — scoped colleague lookup (Personio-lite). Not full org chart in W7.

### Directory list projection (`view=directory`)

| Field | Source | Mobile list | Detail tap | Privacy |
|-------|--------|-------------|------------|---------|
| `id` | `employees.id` | ✓ | ✓ | — |
| `employee_code` | column | ✓ | ✓ | — |
| `full_name` | column | ✓ | ✓ | — |
| `job_title_key` | column | ✓ | ✓ | Resolve label via catalog/i18n |
| `department` | `custom_fields.department` or dept catalog | ✓ | ✓ | — |
| `avatar_url` | column | ✓ | ✓ | — |
| `status` | column | filter=`active` only | ✓ | Hide `inactive` default |
| `email` | column | ✗ list | optional detail | Mask `u***@xe.vn` unless HR |
| `phone_number` | `custom_fields.phone_number` | ✗ | ✓ self/HR only | **VAL-W7-DIR-03** |
| `manager_id` | column | ✗ | ✓ | For «Báo cáo cho» |
| `date_of_birth` | `custom_fields.date_of_birth` | **✗ forbidden** | **✗ forbidden** | Celebrations use MM-DD only |
| `custom_fields` raw | JSONB | **✗ forbidden** | Filtered subset | No PII leak |

### Query contract

```http
GET /api/hrm/employees?company_id=holding&view=directory&status=active&keyword=nguyen&page=1&page_size=30
```

```json
{
  "success": true,
  "code": "HRM-EMP-DIR-200",
  "data": {
    "total": 42,
    "page": 1,
    "page_size": 30,
    "data": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "employee_code": "NV1001",
        "full_name": "Nguyễn Văn UAT",
        "job_title_key": "STAFF",
        "department": "Vận hành",
        "avatar_url": "/api/hrm/files/holding/avatar-1717747200000-photo.jpg",
        "status": "active"
      }
    ]
  }
}
```

**Detail (colleague profile lite)**

```http
GET /api/hrm/employees/{colleague_id}?company_id=holding&view=directory
```

```json
{
  "success": true,
  "code": "HRM-EMP-200",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "employee_code": "NV1001",
    "full_name": "Nguyễn Văn UAT",
    "job_title_key": "STAFF",
    "department": "Vận hành",
    "avatar_url": "/api/hrm/files/holding/avatar-1717747200000-photo.jpg",
    "manager_id": "22222222-2222-4222-8222-222222222222",
    "phone_number": "0901234567",
    "status": "active"
  }
}
```

> `view=directory` response **must not** include `custom_fields` blob or `date_of_birth`.

### Validation (VAL-W7-DIR-*)

| ID | Condition | Expected |
|----|-----------|----------|
| VAL-W7-DIR-01 | List + detail same `employee_id` under group CEO `main` | Both 200 or both 404 |
| VAL-W7-DIR-02 | `keyword` matches `full_name` / `employee_code` | ILIKE scoped |
| VAL-W7-DIR-03 | Non-HR opens colleague detail | No `email` plaintext; phone optional per tenant policy |

---

## 6. Celebration DOB privacy (`date_of_birth` trace)

### Catalog → storage trace

| Layer | Location | Value shape |
|-------|----------|-------------|
| **Catalog definition** | `settings-catalogs` → `hrm_employee_personal_fields` → code `date_of_birth` | unit `date`, active |
| **Runtime SoT** | `employees.custom_fields.date_of_birth` | ISO `YYYY-MM-DD` (seed: `scripts/lib/uat-workforce.mjs`) |
| **NOT stored in** | `avatar_url` column, directory API, celebrations payload | — |

### Privacy rules (BR-BDAY-* — consolidated)

| ID | Rule | API surface |
|----|------|-------------|
| BR-BDAY-01 | Never expose birth **year** in mobile/UI | Forbidden keys: `birth_year`, full ISO `date_of_birth` in hub/celebrations |
| BR-BDAY-02 | Celebrations project **MM-DD only** | `month_day`, `display_date` (DD/MM) |
| BR-BDAY-03 | Invalid/null DOB | Omit employee from celebrations — no error |
| BR-BDAY-04 | «Today» = `Asia/Ho_Chi_Minh` | Server-side match |
| BR-BDAY-05 | Viewer birthday | `viewer.is_birthday_today` boolean only — no DOB in response |
| BR-BDAY-06 | Scope | Same `resolveHrmListScope` as employee list |

**Implemented (04a):** `home.service.ts` reads `custom_fields.date_of_birth` internally; exposes only `is_birthday_today` on viewer.

**W7-1 (04b):** populate `celebrations.items[]` — still **no** `date_of_birth` / `birth_year`.

### API example — celebrations (home summary include)

```http
GET /api/hrm/home/summary?company_id=holding&employee_id={self}&include=tasks,manager_pending,celebrations,whos_out
```

```json
{
  "success": true,
  "code": "HRM-HOME-200",
  "data": {
    "viewer": {
      "employee_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "display_name": "Nguyễn Văn UAT",
      "is_manager": false,
      "is_birthday_today": false
    },
    "celebrations": {
      "total_count": 2,
      "items": [
        {
          "employee_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          "display_name": "Trần Thị B",
          "month_day": "06-07",
          "display_date": "07/06",
          "avatar_url": "/api/hrm/files/holding/avatar-tran.jpg",
          "avatar_initials": "TB"
        }
      ]
    },
    "whos_out": { "total_count": 0, "items": [] },
    "generated_at": "2026-06-07T09:00:00+07:00"
  }
}
```

**Forbidden in any W7 mobile-facing JSON (grep QA):**

```text
"date_of_birth"
"birth_year"
"1990-06-07"
custom_fields (unfiltered on directory/celebrations)
```

---

## 7. `custom_fields` — catalog key reference (W7 subset)

| Catalog key (`hrm_employee_*`) | `custom_fields` key | W7 consumer | Write on mobile |
|-------------------------------|---------------------|-------------|-----------------|
| `date_of_birth` | `date_of_birth` | Celebrations (server only), profile HR | MOB-12 HR-only; not directory |
| `phone_number` | `phone_number` | Directory detail, profile | MOB-12 self (future) |
| `gender` | `gender` | Profile full | MOB-12 |
| `department` | `department` | Directory list | HR import only |
| `tenant_id` | `tenant_id` | BE scope partition | System — never mobile |
| — | `avatar_url` (legacy) | Read fallback | **Deprecated** — use column |
| — | `leave_balance_annual` | Interim balance read | System/seed only |

Full catalog: `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.ts` L684–712.

---

## 8. Traceability matrix

| W7 wave | UC (SRS delta) | Journey | API | DB | Mobile screen | Test ID |
|---------|----------------|---------|-----|-----|---------------|---------|
| W7-2 Avatar | UC-HRM-MOB-12 ext | J-AVT-01..03 | `PATCH /employees/:id`, `files/upload` | `employees.avatar_url` | ProfileScreen | VAL-W7-AVT-* |
| W7-1 Celebrations | UC-HRM-MOB-03 ext | J-MOB-08 | `GET /home/summary?include=celebrations` | `custom_fields.date_of_birth` | DashboardScreen | VAL-W7-BDAY / BR-BDAY-* |
| W7-1 Who's out | UC-HRM-MOB-03 ext | J-MOB-09 | `home/summary` whos_out | `leave_requests` approved | DashboardScreen | MOBILE_HOME_HUB AC-08 |
| W7-3 Leave doc | UC-HRM-MOB-06b | J-MOB-11 | `POST leave-requests` + upload | `leave_requests.attachment_url` | CreateLeaveRequestScreen | VAL-W7-LATT-* |
| W7-4 Leave bal | UC-HRM-MOB-06c | J-MOB-04 ext | `GET /attendance/leave-balance` | `employee_leave_balances` | CreateLeave + Home | VAL-W7-LBAL-* |
| W7-5 Directory | UC-HRM-MOB-16 | J-MOB-16 | `GET /employees?view=directory` | `employees` + `custom_fields` subset | DirectoryScreen (new) | VAL-W7-DIR-* |

**Scope parity row (mandatory QA):**

| List API | Detail API | Deep link |
|----------|------------|-----------|
| `GET /employees?view=directory` | `GET /employees/:id?view=directory` | J-MOB-16 list→detail |
| `GET /employees` (full) | `GET /employees/:id` | J-AVT-03 colleague avatar |
| `GET /home/summary` celebrations | N/A (aggregate) | J-MOB-08 |

---

## 9. Error code summary (deterministic)

| Code | HTTP | When |
|------|------|------|
| `HRM-EMP-403` | 403 | Self PATCH disallowed fields |
| `HRM-EMP-404` | 404 | Employee out of scope |
| `HRM-EMP-409` | 409 | Scope mismatch |
| `HRM-FILE-201` | 201 | Upload OK |
| `HRM-FILE-409` | 409 | Upload scope mismatch |
| `HRM-LEAVE-201` | 201 | Leave created |
| `HRM-LEAVE-ATT-REQ` | 400 | Medical leave missing attachment (if SRS strict) |
| `HRM-LEAVE-INSUFFICIENT-BALANCE` | 409 | Days exceed remaining |
| `HRM-LEAVE-BAL-200` | 200 | Balance read |
| `HRM-HOME-200` | 200 | Summary OK — no DOB leak |
| `HRM-ERR-SCOPE-INVALID` | 409 | company_id/header mismatch |

---

## 10. Implementation status (baseline 2026-06-07)

| Contract area | BE | Mobile | Notes |
|---------------|-----|--------|-------|
| `avatar_url` column + PATCH | **Done** | **Done** | W7-2 QA promote |
| Celebrations payload | Stub empty | — | W7-1 dev-be |
| DOB privacy on home/summary | **Done** viewer flag | — | 04a evidence |
| `attachment_url` on leave | **Not migrated** | — | W7-3 |
| `leave-balance` endpoint | **Not implemented** | Placeholder UI | W7-4 |
| `view=directory` | **Not implemented** | No screen | W7-5 |

---

**Evidence path:** `docs/hrm/MOBILE_W7_DATA_CONTRACTS.md` · `docs/program/governance/pcomp-w7-ba-data-01-20260607.md`
