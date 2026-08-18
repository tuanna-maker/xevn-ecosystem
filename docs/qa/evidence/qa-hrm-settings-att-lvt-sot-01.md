# Evidence — `QA-HRM-SETTINGS-ATT-LVT-SOT-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-SETTINGS-ATT-LVT-SOT-01` |
| **parent** | `PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01` |
| **from_role** | qa |
| **to_role** | pm |
| **Date** | 2026-08-10 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Stamp** | `ATTLVTSOTQA-MSNG88NH` |
| **U65** | zero-seed · browser + authenticated API |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (4/4 UF) |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `pnpm run qc:fe-be-health` | exit **0** (portal `:5173`, hrm `:28001`, xbos `:28002`) |
| Jest `hrm-settings-leave-type-sot` + `att-leave-type` | **14/14** PASS |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-qa-hrm-settings-att-lvt-sot-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-qa-hrm-settings-att-lvt-sot-01.json` |

**spec_ref:** HRM-SC-01 · `po-hrm-settings-att-lvt-sot-be-01.md` §5 QA matrix

---

## 2. UF blocks (exit criteria)

### UF-HRM-SC-01-OVERVIEW — Settings overview stamp

- **Persona / API:** `GET /api/hrm/settings-catalogs?company_id=main` (Bearer `ceo@xe.vn`)
- **Action:** Locate catalog row `leave_types`
- **Expected:** `tenantWriter.apiPath` + `effectiveApiPath` + `groupRefReadOnly: true`
- **Actual:** `tenantWriter.kind=att_leave_type` · `apiPath=/api/hrm/attendance/leave-types` · `effectiveApiPath=/api/hrm/attendance/leave-types/effective` · `groupRefReadOnly=true`
- **Verdict:** 🟢 **PASS**

### UF-HRM-SC-01-REF-409 — Extension mutate blocked on REF partition

- **Action:** `POST /api/hrm/settings-catalogs/leave_types/extension-items` with `x-catalog-write-mode: immediate` + `bulkSync: true` + one item
- **Network:** HTTP **409** · code **`HRM-SC-LEAVE-REF-ONLY`**
- **Verdict:** 🟢 **PASS**

### UF-ATT-ADMIN-CREATE-F5 — ATT writer (not settings MD)

- **Click path:** Login → **Cài đặt** → tab **Loại phép ATT** → **Thêm loại phép** → key `hr_lvt_sot_msng88nh` → **Lưu** → **F5** → tab lại
- **Network:** **PUT** `/api/hrm/attendance/leave-types` → **200**
- **FE sau 2xx:** row `settings-att-leave-type-row-hr_lvt_sot_msng88nh` visible after F5
- **Verdict:** 🟢 **PASS** (AC-PLT-ATT-01d retain · open slug N+1)

### UF-LEAVE-CONSUMER-EFFECTIVE — Picker SoT + unknown key guard

- **Click path:** **Chấm công** → **Nghỉ phép** → **Tạo yêu cầu**
- **Network:** **GET** `/api/hrm/attendance/leave-types/effective?company_id=main` → **200** (on create dialog path)
- **Invent probe (API, valid DTO):** `POST /attendance/leave-requests` with `leave_type=zz_invent_lvt_sot_msng88nh` → **400** **`HRM-LEAVE-TYPE-UNKNOWN`** (no persist)
- **Verdict:** 🟢 **PASS**

---

## 3. Key network stamps

```text
GET  /api/hrm/settings-catalogs?company_id=main     → 200  leave_types.tenantWriter stamped
POST /api/hrm/settings-catalogs/leave_types/extension-items (immediate+bulkSync) → 409 HRM-SC-LEAVE-REF-ONLY
PUT  /api/hrm/attendance/leave-types                  → 200  key=hr_lvt_sot_msng88nh
GET  /api/hrm/attendance/leave-types/effective?company_id=main → 200
POST /api/hrm/attendance/leave-requests (invent)      → 400  HRM-LEAVE-TYPE-UNKNOWN
```

---

## 4. L2.5 / J-* note

Wave scope = **HRM-SC-01 dual SoT BE** (settings REF vs `att_leave_type` writer). No new cross-nav J-* required beyond settings ↔ attendance leave picker path exercised above. **L2 PASS alone would be insufficient** if REF-409 or effective SoT failed — all in-scope UF 🟢.

---

## 5. Residual / not promoted

| Item | Severity | Note |
|------|----------|------|
| `PO-HRM-SETTINGS-ATT-LVT-SOT-FE-01` | P2 (PM hint) | Master-data tab may still show dual UX — **out of this BE QA slice** |
| UC matrix `HRM-SC-01` promote | Program | PM/QC after this evidence |
| `attendance_uat_ready` | Honesty | **not flipped** — C-SLICE only |

---

## 6. completion_report

**Closed:** HRM-SC-01 BE bridge verified end-to-end for `ceo@xe.vn` — overview `tenantWriter`, REF extension **409**, ATT admin CREATE+F5 on Nest writer, leave consumer **GET effective** + invent **UNKNOWN**. U65 zero-seed.

**Residual:** FE dual UX (`PO-HRM-SETTINGS-ATT-LVT-SOT-FE-01`); matrix promote HRM-SC-01 row.

---

## 7. Handoff

| Field | Value |
|-------|-------|
| **next_owner** | pm |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/qa-hrm-settings-att-lvt-sot-01.md` |
| **next_dispatch_prompt** | Dispatch `PO-HRM-SETTINGS-ATT-LVT-SOT-FE-01` (dev-fe): bind settings master-data leave UX to `tenantWriter` hint — hide/disable extension mutate on `leave_types`; deep-link admin to tab Loại phép ATT. Entry: this evidence PASS · must_keep ATT-QC-02 open slug · U65. Then narrow QC slice if FE touches settings shell. |
