# Program journey map — PM orchestration SoT

**Owner:** PM (cập nhật sau mỗi incident / sprint)  
**Mục đích:** PM và QA **không** chỉ kiểm «tab load» — phải biết luồng user thật end-to-end.  
**Liên kết:** `PILOT_BUSINESS_FLOW_MATRIX.md` (L2), rule `uat-production-readiness-orchestration.mdc` (L2.5)

**Cập nhật:** 2026-05-31 (`P1-P100-W10-DEVICE-02` — MOB-HEADER APK installed; J-MOB-03/04/05 **still FAIL** HRM-AUTH-001; UUID on home panel only)

---

## Persona mặc định UAT

| Persona | Account | Scope JWT | Dùng cho |
|---------|---------|-----------|----------|
| Group CEO | `ceo@xe.vn` / `Xevn@2026` | `company_id=main`, tenant `xevn` | Command Center + HRM embed |
| Member CEO | `du-lich.ceo@xe.vn` | member slug | Negative / member-only |
| Mobile NV | `uat.nv0001@xe.vn` / `xevn-uat-2026` | UUID company | HRM mobile |

---

## Command Center — shell

| J-ID | Journey | From → To | API phụ thuộc | Status |
|------|---------|-----------|---------------|--------|
| J-CC-01 | Login tập đoàn | `/login` → `/command-center` | XBOS auth, JWT 86400 | ✅ L2 |
| J-CC-02 | Chọn đơn vị | Settings → group-member-units | `tenant-scope/group-member-units` 200 | ✅ L2 |
| J-CC-03 | KPI rollup | CC dashboard load | kpi-engine rollup, không 409 | ✅ L2 |

---

## HRM embed — tab load (L2 = P-CC-03..08)

| P-CC | Route | Module |
|------|-------|--------|
| 03 | `/command-center/hrm/employees` | Nhân sự list |
| 04 | `/command-center/hrm/contracts` | Hợp đồng list |
| 05 | `/command-center/hrm/insurance` | Bảo hiểm |
| 06 | `/command-center/hrm/recruitment` | Tuyển dụng |
| 07 | `/command-center/hrm/attendance` | Chấm công |
| 08 | `/command-center/hrm/payroll` | Lương |

---

## HRM embed — cross-navigation (L2.5 = bắt buộc QA)

| J-ID | Journey | Steps | Scope note | Status |
|------|---------|-------|------------|--------|
| **J-HRM-01** | **Hợp đồng → Hồ sơ NV** | P-CC-04 list → click tên NV → `/employees/:id` | `GET /employees/:id?company_id=main` phải rollup như list (ADR C2) | ✅ PASS · [W5B L2.5](docs/qa/evidence/p1-close-qa-w5b-20260525.md#l25) |
| J-HRM-02 | Nhân sự list → Hồ sơ | P-CC-03 → row → detail | Same scope parity | ✅ PASS · [W5B L2.5](docs/qa/evidence/p1-close-qa-w5b-20260525.md#l25) |
| J-HRM-03 | Hợp đồng → tab chi tiết HĐ | P-CC-04 → open contract drawer/modal | contracts-insurance API | ✅ PASS · [W5B L2.5](docs/qa/evidence/p1-close-qa-w5b-20260525.md#l25) |
| J-HRM-04 | Bảo hiểm → NV linked | P-CC-05 → employee link | insurance + employee scope | ✅ PASS · [P1-EX-QA-01-R4](docs/qa/evidence/p1-ex-qa-01-r4-20260526.md) — list **200** + employee link **200** |
| J-HRM-05 | Tuyển dụng → ứng viên/requisition | P-CC-06 → detail | recruitment API | ✅ PASS · [W5B L2.5](docs/qa/evidence/p1-close-qa-w5b-20260525.md#l25) |
| J-HRM-06 | Chấm công → bản ghi / yêu cầu | P-CC-07 → detail | attendance scope | ✅ PASS · [W5B L2.5](docs/qa/evidence/p1-close-qa-w5b-20260525.md#l25) · **HTTPS pilot** [R6](docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r6-20260529.md) [QC GWC](docs/qa/evidence/qc-https-j-hrm-06-01-r6-20260529.md) |
| J-HRM-07 | Lương → phiếu lương | P-CC-08 → payslip detail | payroll scope | ✅ PASS · [W5B L2.5](docs/qa/evidence/p1-close-qa-w5b-20260525.md#l25) |
| J-HRM-08 | Catalog governance approve | P-CC-09 → inbox → approve | XBOS write scope strict | ✅ S2 |

**FAIL pattern (P0):** UI «Không tìm thấy nhân viên», console **404** trên `GET /employees/:id` với `company_id=main`.

---

## Mobile (L2.5)

| J-ID | Journey | Status |
|------|---------|--------|
| J-MOB-01 | Login → scope select → home | ✅ smoke · health **200** · UUID on panel [W10-D02](docs/qa/evidence/p1-p100-w10-device-02-20260531.md) |
| J-MOB-02 | Check-in GPS | ✅ smoke |
| J-MOB-03 | Leave list → **row tap** → detail | ❌ **FAIL** device [W10-D02](docs/qa/evidence/p1-p100-w10-device-02-20260531.md) — **HRM-AUTH-001**, empty vs API leave **1**; [D01](docs/qa/evidence/p1-p100-w10-device-01-20260531.md) |
| J-MOB-04 | Payslip list → **detail tap** | ❌ **FAIL** device [W10-D02](docs/qa/evidence/p1-p100-w10-device-02-20260531.md) — **HRM-AUTH-001**, no row vs API payslips **2** |
| J-MOB-05 | Manager approvals → **Duyệt** | ❌ **FAIL** device [W10-D02](docs/qa/evidence/p1-p100-w10-device-02-20260531.md) — no **Duyệt** vs API pending **1**; MOB-HEADER API **201** [QA-03](docs/qa/evidence/p1-resid-c-qa-03-20260530.md) |

---

## XBOS / workflow (Phase 1 partial)

| J-ID | Journey | Status |
|------|---------|--------|
| J-XBOS-01 | Workflow inbox → task detail | 🟡 partial |
| J-XBOS-02 | Catalog publish → HRM sync | 🟡 G5 |

---

## PM dispatch checklist (mỗi wave QA)

- [ ] Liệt kê J-* in-scope trong Task prompt
- [ ] Account = `ceo@xe.vn` cho CC/HRM embed
- [ ] Evidence path + screenshot/console cho mỗi J-* FAIL
- [x] Cập nhật cột Status bảng này sau verdict (J-HRM-01..07 — `P1-EX-PM-01` 2026-05-26)

---

## Incident log

| Date | J-ID | Symptom | Root cause | Fix / governance |
|------|------|---------|------------|------------------|
| 2026-05-24 | J-HRM-01 | 404 employee from contracts | `getEmployeeById` exact `main`, list đã rollup | BE scope parity + rule U19 + matrix J-* |
| 2026-05-26 | J-HRM-01..07 | Map ⏳ vs QA **7/7 PASS** (EX-R07) | Governance drift post W5B | PM `P1-EX-PM-01` — SoT → ✅ PASS; evidence `p1-ex-pm-01-20260526.md` |
| 2026-05-31 | J-MOB-03..05 | Device empty + **HRM-AUTH-001** vs pilot data | Installed APK sends **`x-company-id: main`**; MOB-HEADER release APK not installed | `P1-P100-W10-DEVICE-01` FAIL → PM dispatch APK-01 + device retest |
| 2026-05-31 | J-MOB-03..05 | MOB-HEADER APK installed; lists still **HRM-AUTH-001** | Home panel shows UUID but outbound/list still **`main`** slug + 403 | `P1-P100-W10-DEVICE-02` FAIL → `P1-P100-W10-MOB-HEADER-02` dev-mobile |
