# BM-FE-HIRE-TITLE-01 — Hire picker shows chức vụ / job_title

| Field | Value |
|-------|--------|
| work_item_id | `BM-FE-HIRE-TITLE-01` |
| from_role | dev-fe |
| to_role | qa |
| program | `P1-BMINUTES-CUST-RETEST-01` |
| dated | 2026-07-22 |
| ack_status | **READY_FOR_QA** |
| U65 | no seed · leave CREATE untouched |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| SRS | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` §3.33 · **FR-HRM-INT-01** (hire bind) |
| AC | `docs/program/deltas/BMINUTES_AC_MATRIX.md` · **BM-AC-07-01..03** (chức vụ trên NV / picker) |
| Inventory FAIL | `docs/qa/evidence/bm-exp-fe-jd-pos-wf-01-20260722.md` — Hire Select chỉ `code — name (dept)`; `department` luôn null; `position`/`job_title_key` không render |
| TechSpec | `docs/hrm/TECHSPEC.md` §17.3 G-DB-01 · CreateEmployee `job_title_key` |
| must_keep | G-DB-01 hire bind dialog · U65 · **cấm** change leave |

**spec says:** picker hồ sơ khi chốt tuyển phải nhận diện NV (mã/tên) và chức vụ từ catalog/`job_title_key`.  
**code did (before):** SelectItem = `code — name` + optional `(department)` nhưng `mapHrmEmployeeRecord.department = null` cứng → không hiện title.  
**code does (after):** `formatEmployeePickerLabel` → `CODE — Name · Chức danh` (+ dept nếu có và khác title).

---

## Changes

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/employeePickerLabel.ts` | **NEW** — `resolveEmployeeDepartmentLabel` / `resolveEmployeePositionLabel` / `formatEmployeePickerLabel` |
| `apps/web/hrm/src/lib/employeePickerLabel.test.ts` | **NEW** — 4 tests |
| `apps/web/hrm/src/hooks/useEmployee.ts` | `mapHrmEmployeeRecord`: dept từ `custom_fields.department`; position từ custom/position/`job_title_key` |
| `apps/web/hrm/src/hooks/useEmployee.test.ts` | Assert position + custom_fields dept/title mapping |
| `apps/web/hrm/src/components/recruitment/HireEmployeeLinkDialog.tsx` | SelectItem dùng `formatEmployeePickerLabel(emp)` |

**Not touched:** LeaveTab · Insurance · seed · Phase1/PROD claims.

---

## Verify

```bash
cd apps/web/hrm
pnpm test -- src/lib/employeePickerLabel.test.ts src/hooks/useEmployee.test.ts src/lib/recruitmentHireLink.test.ts
```

| Suite | Result |
|-------|--------|
| `employeePickerLabel.test.ts` | **4 PASS** |
| `useEmployee.test.ts` | **9 PASS** |
| `recruitmentHireLink.test.ts` | **4 PASS** (regression hire bind) |
| **Total** | **17 PASS** |

---

## QA browser path (U65 · no seed)

1. Login `ceo@xe.vn` / portal → HRM Tuyển dụng.
2. Candidate stage → **Đã tuyển** (hoặc kanban drop hired) → dialog **Gắn hồ sơ nhân viên**.
3. Mở Select: mỗi dòng dạng **`NV… — Họ tên · <job_title_key hoặc chức danh>`** (không chỉ mã+tên).
4. Chọn hồ sơ → Xác nhận → Network PATCH hired + `employee_id` **2xx** (G-DB-01 giữ nguyên).
5. F5 — candidate hired + link còn.

UF / J: **UF-HRM-12** · hire bind G-DB-01 · BM-AC-07 picker visibility.

---

## Residual

| Item | Notes |
|------|--------|
| Catalog display label | UI hiện `job_title_key` / custom position string — chưa resolve sang label XBOS catalog nếu key ≠ label (soft; BM-AC-07-02 profile path riêng) |
| Leave/Insurance pickers | Không đổi (dispatch **cấm change leave**); helper sẵn để wave sau |

---

## Handoff

- `ack_status`: **READY_FOR_QA**
- `next_owner`: **qa**
- `evidence_path`: `docs/qa/evidence/bm-fe-hire-title-01-20260722.md`
