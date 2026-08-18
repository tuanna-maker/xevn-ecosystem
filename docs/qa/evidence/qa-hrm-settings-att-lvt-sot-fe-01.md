# Evidence — `QA-HRM-SETTINGS-ATT-LVT-SOT-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-SETTINGS-ATT-LVT-SOT-FE-01` |
| **parent** | `PO-HRM-SETTINGS-ATT-LVT-SOT-FE-01` |
| **prior BE QA** | `QA-HRM-SETTINGS-ATT-LVT-SOT-01` · `ATTLVTSOTQA-MSNG88NH` |
| **from_role** | qa |
| **to_role** | pm |
| **Date** | 2026-08-10 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Stamp** | `ATTLVTSOTFEQA-MSNGJ8T2` |
| **U65** | zero-seed · browser + authenticated API (invent probe only) |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (4/4 UF) |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `pnpm run qc:fe-be-health` | exit **0** (portal `:5173`, hrm `:28001`, xbos `:28002`) |
| Vitest `hrmSettingsLeaveTypeSot` + `MasterDataSettingsPanel` | **10/10** PASS |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-qa-hrm-settings-att-lvt-sot-fe-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-qa-hrm-settings-att-lvt-sot-fe-01.json` |
| Screenshots | `docs/qa/evidence/screens/qa-hrm-settings-att-lvt-sot-fe-01/` |

**spec_ref:** HRM-SC-01 · `po-hrm-settings-att-lvt-sot-fe-01.md` · prior `qa-hrm-settings-att-lvt-sot-01.md`

---

## 2. UF blocks (exit criteria)

### UF-MD-LEAVE-TYPES-REF — Master data «Loại nghỉ» REF-only

- **Click path:** Login (session inject) → **Cài đặt** → `?tab=master-data` → tab **Loại nghỉ** (`md-tab-leaveTypes`)
- **FE asserts:** `md-leave-types-ref-readonly-banner` visible · **no** `md-upsert-form-leaveTypes` · **no** `md-save-leaveTypes`
- **Network:** **no** `POST …/settings-catalogs/leave_types/extension-items` during MD visit (`extensionPosts: []`)
- **CTA:** `md-leave-types-open-att-tab` → URL contains `tab=att-leave-types` · ATT panel loads
- **Verdict:** 🟢 **PASS**

### UF-CATALOGS-LEAVE-TYPES-REF — Danh mục (sync) overview

- **Click path:** **Cài đặt** → `?tab=catalogs`
- **Overview stamp:** `catalog-leave-types-tenant-writer-leave_types` visible (REF tập đoàn copy)
- **Add extension:** select `leave_types` → `settings-catalogs-leave-types-ref-readonly` · **Thêm** disabled · **no** extension POST
- **CTA:** `settings-catalogs-open-att-leave-types` → `tab=att-leave-types`
- **Verdict:** 🟢 **PASS**

### UF-ATT-ADMIN-CREATE-F5 — Regression ATT writer (retain BE QA)

- **Click path:** tab **Loại phép ATT** → **Thêm loại phép** → key `hr_lvt_fe_msngj8t2` → **Lưu** → **F5**
- **Network:** **PUT** `/api/hrm/attendance/leave-types` → **200**
- **FE sau 2xx:** row `settings-att-leave-type-row-hr_lvt_fe_msngj8t2` after F5
- **Verdict:** 🟢 **PASS**

### UF-LEAVE-CONSUMER-EFFECTIVE — Regression picker SoT

- **Click path:** **Chấm công** → **Nghỉ phép** → **Tạo yêu cầu**
- **Network:** **GET** `/api/hrm/attendance/leave-types/effective?company_id=main` → **200**
- **Invent (API, valid DTO):** unknown `leave_type` → **400** **`HRM-LEAVE-TYPE-UNKNOWN`**
- **Verdict:** 🟢 **PASS**

---

## 3. Key network stamps (session)

```text
(no POST /settings-catalogs/leave_types/extension-items during FE REF UX checks)
PUT  /api/hrm/attendance/leave-types                         → 200  key=hr_lvt_fe_msngj8t2
GET  /api/hrm/attendance/leave-types/effective?company_id=main → 200
POST /api/hrm/attendance/leave-requests (invent)             → 400  HRM-LEAVE-TYPE-UNKNOWN
```

---

## 4. L2.5 / J-* note

Wave = **HRM-SC-01 dual SoT FE** (settings MD + catalogs UX bound to `tenantWriter.groupRefReadOnly`). Cross-nav exercised: MD/catalogs CTA → **Loại phép ATT**; leave create dialog → **effective** GET (same spine as prior BE QA). **L2 tab load alone insufficient** — extension mutate UX must stay absent on REF partition.

---

## 5. Residual / not promoted

| Item | Severity | Note |
|------|----------|------|
| Narrow QC settings shell | P2 | PM may dispatch QC slice if matrix HRM-SC-01 FE row promote |
| UC matrix `HRM-SC-01` promote | Program | PM/QC after FE+BE evidence pair |
| `attendance_uat_ready` | Honesty | **not flipped** — C-SLICE only |

---

## 6. completion_report

**Closed:** FE dual SoT for `leave_types` on **Danh mục nghiệp vụ** + **Danh mục (sync)** — REF banner, no extension save UI, CTAs deep-link to `settings?tab=att-leave-types`; **no** extension POST on REF during U65 browse. ATT admin CREATE+F5 and leave **effective** consumer regressions **PASS**. U65 zero-seed.

**Residual:** QC narrow slice / matrix promote — PM lane.

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | pm |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/qa-hrm-settings-att-lvt-sot-fe-01.md` |
| **next_dispatch_prompt** | PM: seal `PO-HRM-SETTINGS-ATT-LVT-SOT-FE-01` + pair with `qa-hrm-settings-att-lvt-sot-01.md`; dispatch **qc** narrow slice on HRM-SC-01 (settings shell) if in-scope for wave; promote matrix HRM-SC-01 FE row when QC GO. Residual P2 only. |
