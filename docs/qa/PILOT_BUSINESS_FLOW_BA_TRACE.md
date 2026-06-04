# Pilot business flow — BA process trace (L2)

**work_item_id:** `P1-S0-BA-P-01`  
**program:** `PHASE1-SCRUM-S0`  
**from_role:** ba-process  
**to_role:** pm  
**ack_status:** `PASS_TO_PM`  
**matrix:** [`PILOT_BUSINESS_FLOW_MATRIX.md`](PILOT_BUSINESS_FLOW_MATRIX.md)  
**account:** `ceo@xe.vn` / `Xevn@2026` · base `http://localhost:5175`

## 1. Process objective and actors

| Actor | Vai trò trong pilot |
|-------|---------------------|
| CEO tập đoàn | `ceo@xe.vn` — membership master `tenantId=xevn`, `companyId=main` |
| QA | Thực thi L2 browser matrix P-CC-05..08; ghi `docs/qa/evidence/pilot-business-flow-YYYYMMDD.md` |
| Dev-FE | Portal `HrmWorkspacePanel` + iframe HRM (`?portal=1`); Supabase→Nest trên embed |
| Dev-BE | Scope resolver, envelope `HRM-*` / `SCOPE_*` |

**Mục tiêu (S0):** Gói acceptance **implementation-ready** cho P-CC-05..08: nhánh happy / alternate / exception xác định, map **UC-HRM-22..25**, ma trận quy tắc nghiệp vụ đo được — PM dispatch QA (`P1-S0-QA-01`) không cần BA bổ sung nhánh.

**Hai surface kiểm tra mỗi route 05..08:**

| Surface | Component | QA ưu tiên |
|---------|-----------|------------|
| **A — Portal cockpit** | `HrmWorkspacePanel` (`view=insurance|recruitment|attendance|payroll`) | Network tới `VITE_HRM_API_ORIGIN` qua `hrmApiClient.ts` |
| **B — HRM iframe** | `HrmWorkspaceRoute` → `/hr/{view}?portal=1&tenantId=xevn&companyId=main` | Console :54321; `shouldSkipSupabaseDataFetches()` trên page |

## 2. Cross-cutting business rules (mọi P-CC HRM embed)

| Mã | Điều kiện | Hành động | Kết quả | Mã lỗi / HTTP |
|----|-----------|-----------|---------|----------------|
| BR-SCOPE-01 | Gọi HRM qua portal | `x-tenant-id` + `x-company-id` khớp JWT (`main` cho CEO tập đoàn) | API resolve scope | — |
| BR-SCOPE-02 | `company_id` query/header ≠ JWT `companyId` | BE từ chối | **409** | `SCOPE_CONTEXT_MISMATCH` |
| BR-SCOPE-03 | iframe query `companyId=xevn` khi JWT `main` | FE override → `main` (`resolveHrmSpreadsheetScope`) | Tránh 409 trên load | — |
| BR-MOCK-01 | API **200** + `data` rỗng | Empty state có copy; **không** mock array khi `allowMockFallback()` false | PASS alternate | — |
| BR-MOCK-02 | HTTP 4xx/5xx / network / timeout 10s | Banner ERROR (`API_LOAD_FAILED_MESSAGE`); **không** empty im lặng | FAIL exception | envelope `code` |
| BR-DATA-01 | Pilot stack | **Không** bắt buộc `127.0.0.1:54321` trên **load** route | FAIL nếu `ERR_CONNECTION_REFUSED` | — |
| BR-PAGE-01 | `page_size` list (employees) | ≤ **100** | 400 nếu >100 | `HRM-VAL-001` |
| BR-AUTH-01 | Thiếu JWT / internal key | BE từ chối module | **401** | `HRM-AUTH-001` |
| BR-PORTAL-01 | `resolveIdentityScope` fail trước iframe | Không mount iframe; banner đỏ scope | FAIL trước L2 API | `SCOPE_*` UI |

**SRS:** `docs/hrm/SRS.md` §13; `docs/ecosystem/SRS.md` §8.1 (`SCOPE_CONTEXT_MISMATCH`).

## 3. Matrix row → UC / SRS / API (P-CC-05..08 focus)

| Matrix ID | Route | UC-ID | SRS | API chính (Surface A) | Surface B (iframe) |
|-----------|-------|-------|-----|----------------------|-------------------|
| P-CC-05 | `/command-center/hrm/insurance` | **UC-HRM-25** (BHXH) | §13 UC-HRM-25 | `GET /api/hrm/contracts-insurance/contracts?company_id=main` (portal proxy HĐ→BHXH) · optional `GET .../insurance/expiring` | `/hr/insurance` — **Supabase** (`Insurance.tsx`) |
| P-CC-06 | `/command-center/hrm/recruitment` | **UC-HRM-22** | §13 UC-HRM-22 | `GET /api/hrm/recruitment/requisitions?company_id=main` → `HRM-REC-200` | `/hr/recruitment` — chưa `shouldSkipSupabase` |
| P-CC-07 | `/command-center/hrm/attendance` | **UC-HRM-23** | §13 UC-HRM-23 | `GET /api/hrm/attendance/records?company_id=` (UUID/slug resolved) → `HRM-ATT-200` | `/hr/attendance` — hooks Supabase phụ (departments) |
| P-CC-08 | `/command-center/hrm/payroll` | **UC-HRM-24** | §13 UC-HRM-24 | `GET /api/hrm/payroll/payslips?company_id=main` → `HRM-PAY-200` | `/hr/payroll` — chưa `shouldSkipSupabase` |

**Catalog:** `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` (#346–349). **Client FR:** `FR-UC-HRM-22..25` trong `docs/client-delivery/02_SRS_XeVN_OS.html`.

**Embed:** `HrmWorkspaceRoute` → `hrmProxyPath(view, { portal: true, tenantId, companyId })` — `apps/web/web-portal/src/modules/hrm/HrmWorkspaceRoute.tsx`.

## 4. UC-HRM-22..25 — branch catalog (QA script backbone)

### UC-HRM-22 — Embed tuyển dụng (P-CC-06)

| Branch ID | Loại | Điều kiện kích hoạt | Luồng | Kết quả đo được |
|-----------|------|---------------------|-------|-----------------|
| UC22-H1 | Happy | Auth OK; scope `main`; DB có ≥1 requisition | A: panel load → `listHrmJobRequisitions` | HTTP **200**, `code=HRM-REC-200`, bảng ≥1 row (`title`, `status` VI) |
| UC22-A1 | Alternate | Auth OK; `data=[]`, `total=0` | A hoặc B | Empty state + **200**; không `HRM_MOCK_RECRUITMENT` khi prod policy |
| UC22-E1 | Exception | `company_id` ≠ JWT (probe `xevn`) | Negative API | **409** `SCOPE_CONTEXT_MISMATCH` |
| UC22-E2 | Exception | Không auth | API | **401** `HRM-AUTH-001` |
| UC22-E3 | Exception | HRM down / envelope invalid | A catch | Banner `API_LOAD_FAILED_MESSAGE`; `hrmDataSource=error` |
| UC22-E4 | Exception | iframe B + Supabase required | Console | `ERR_CONNECTION_REFUSED` :54321 → **FAIL** BR-DATA-01 |

### UC-HRM-23 — Embed chấm công (P-CC-07)

| Branch ID | Loại | Điều kiện | Luồng | Kết quả |
|-----------|------|-----------|-------|---------|
| UC23-H1 | Happy | Scope OK; có `attendance_records` | `GET .../attendance/records` | **200** `HRM-ATT-200`; cột `attendance_date`, `status` |
| UC23-A1 | Alternate | `data=[]` | Panel/iframe list | Empty + **200** |
| UC23-A2 | Alternate | Filter `status`, `from_date`/`to_date` (API) | Query optional | Subset hợp lệ hoặc empty+200 |
| UC23-E1 | Exception | Scope mismatch | Probe | **409** |
| UC23-E2 | Exception | `attendance_date` epoch 0 trên UI | Render | Ngày **01/01/1970** → **FAIL** data quality |
| UC23-E3 | Exception | `company_id` invalid UUID khi BE strict | Query | **400** `HRM-VAL-001` (class validation) |
| UC23-E4 | Exception | Network | A/B | BR-MOCK-02 |

**Ghi chú:** Mobile check-in (UC-HRM-MOB-04) **ngoài** P-CC-07 nhưng cùng bảng `attendance_records` — L1 UAT P3.

### UC-HRM-24 — Embed lương (P-CC-08)

| Branch ID | Loại | Điều kiện | Luồng | Kết quả |
|-----------|------|-----------|-------|---------|
| UC24-H1 | Happy | Scope OK; có payslip seed | `GET .../payroll/payslips?company_id=main` | **200** `HRM-PAY-200`; hiển thị `period_label`, `net_amount` |
| UC24-A1 | Alternate | `data=[]` | Panel payroll view | Empty + **200** |
| UC24-E1 | Exception | Scope mismatch | Probe | **409** |
| UC24-E2 | Exception | API fail | A | BR-MOCK-02; không mock salary khi `allowMockFallback()` false |
| UC24-E3 | Exception | iframe Supabase payroll tables | B | 54321 on load → **FAIL** |

### UC-HRM-25 — Embed HĐ + BHXH (P-CC-04, P-CC-05)

| Branch ID | Loại | Route | Điều kiện | Kết quả |
|-----------|------|-------|-----------|---------|
| UC25-H1 | Happy | P-CC-04 contracts | Có HĐ | `GET .../contracts-insurance/contracts` **200** `HRM-CON-200` |
| UC25-H2 | Happy | P-CC-05 insurance (A) | Portal panel `view=insurance` | Cùng API contracts → map cột BHXH (`regime`, `period`) |
| UC25-A1 | Alternate | 04/05 | 0 HĐ, API 200 | Empty + **200** |
| UC25-A2 | Alternate | 05 expiring alert | `GET .../insurance/expiring?company_id=main` | **200** `HRM-CON-200` (widget; không thay list chính) |
| UC25-E1 | Exception | 04/05 | Scope mismatch | **409** |
| UC25-E2 | Exception | 04 | `settings-catalogs` fail | **409**/5xx rollup | FAIL nếu empty che lỗi (đã fix C1–C6) |
| UC25-E3 | Exception | 05 iframe B | `Insurance.tsx` Supabase | **FAIL** BR-DATA-01 (HRM-EMBED-D5) |
| UC25-E4 | Gap | 05 | Không có `GET .../insurance` list đầy đủ | Chỉ `insurance/expiring` + POST; QA ghi **GAP-BHXH-LIST** nếu product yêu cầu list BHXH native |

**Phụ thuộc nghiệp vụ (governance, không FK):** Chấm công đóng kỳ → ảnh hưởng payslip display; tuyển dụng → nhân sự mới — cùng `company_id` scope.

## 5. Flow branches per matrix row (P-CC-05..08 — L2 chi tiết)

### P-CC-05 — Bảo hiểm (UC-HRM-25 / UC25-*)

| Nhánh | Surface | Điều kiện | Kỳ vọng đo được | TC-ID |
|-------|---------|-----------|-----------------|-------|
| Happy | A | Seed có HĐ/BHXH | `contracts-insurance/contracts` **200**; panel ≥1 row; không ERROR banner | TC-BAP-05-H-A |
| Happy | B | FE migrate D5 (post P1-S0-FE-01) | iframe load không 54321; hoặc Nest list khi có API | TC-BAP-05-H-B |
| Alternate | A | 0 row, 200 | Empty copy BHXH; không mock `HRM_MOCK_INSURANCE` | TC-BAP-05-A-A |
| Alternate | A | Expiring widget | `insurance/expiring` **200** (optional) | TC-BAP-05-A-EXP |
| Exception | A/B | Probe scope `xevn` | **409** không trên request **chính** load | TC-BAP-05-E-SCOPE |
| Exception | B | Supabase-only (hiện trạng) | Console `ERR_CONNECTION_REFUSED` :54321 | TC-BAP-05-E-54321 |
| Exception | A | API 5xx | Banner ERROR | TC-BAP-05-E-API |

**QA ghi actual:** Portal hiển thị HĐ mapped as BHXH (R-02) — PASS nếu PM chấp nhận proxy; FAIL product nếu yêu cầu `employee_insurance_records`.

### P-CC-06 — Tuyển dụng (UC-HRM-22 / UC22-*)

| Nhánh | Surface | Điều kiện | Kỳ vọng | TC-ID |
|-------|---------|-----------|---------|-------|
| Happy | A | Có TT | `recruitment/requisitions` **200** `HRM-REC-200`; cột Chiến dịch | TC-BAP-06-H-A |
| Happy | B | Post API mode embed | Không 54321; data từ Nest hoặc empty+200 | TC-BAP-06-H-B |
| Alternate | A/B | 0 TT, 200 | Empty + **200** | TC-BAP-06-A |
| Exception | A/B | Scope 409 load | FAIL blocker | TC-BAP-06-E-SCOPE |
| Exception | A | `hrmDataSource=error` | Banner; mock chỉ khi dev fallback enabled | TC-BAP-06-E-API |
| Exception | B | Recruitment page Supabase | 54321 on load → FAIL | TC-BAP-06-E-54321 |

### P-CC-07 — Chấm công (UC-HRM-23 / UC23-*)

| Nhánh | Surface | Điều kiện | Kỳ vọng | TC-ID |
|-------|---------|-----------|---------|-------|
| Happy | A | Có bản ghi | `attendance/records` **200** `HRM-ATT-200` | TC-BAP-07-H-A |
| Happy | B | API mode | `AttendanceRecordsTable` / Nest path; không 54321 load | TC-BAP-07-H-B |
| Alternate | A/B | 0 record, 200 | Empty + **200** | TC-BAP-07-A |
| Exception | A/B | Scope 409 | FAIL | TC-BAP-07-E-SCOPE |
| Exception | B | Date epoch 0 | Không **01/01/1970** trên cột ngày | TC-BAP-07-E-DATE |
| Exception | A/B | API fail | BR-MOCK-02 | TC-BAP-07-E-API |

### P-CC-08 — Tiền lương (UC-HRM-24 / UC24-*)

| Nhánh | Surface | Điều kiện | Kỳ vọng | TC-ID |
|-------|---------|-----------|---------|-------|
| Happy | A | Có payslip | `payroll/payslips` **200** `HRM-PAY-200` | TC-BAP-08-H-A |
| Happy | B | API mode embed | Không 54321; payslip list hoặc empty+200 | TC-BAP-08-H-B |
| Alternate | A/B | 0 payslip, 200 | Empty + **200** | TC-BAP-08-A |
| Exception | A/B | Scope 409 | FAIL | TC-BAP-08-E-SCOPE |
| Exception | A/B | 5xx | ERROR banner | TC-BAP-08-E-API |
| Exception | B | Payroll Supabase legacy | 54321 → FAIL | TC-BAP-08-E-54321 |

### P-CC-03 / P-CC-04 — Regression (sau 05..08)

| Nhánh | Kỳ vọng | Evidence |
|-------|---------|----------|
| Regression | U1–U4 + C1–C6 vẫn PASS | `docs/qa/evidence/hrm-embed-employees-fix-20260522.md`; `hrm-embed-contracts-fix-20260522.md` |

## 6. Business rule matrix — UC-HRM-22..25 (condition → action → outcome)

| Mã | UC | Điều kiện (IF) | Hành động (THEN) | Kết quả (OUTCOME) | HTTP / code |
|----|-----|----------------|------------------|-------------------|-------------|
| BR-UC22-01 | 22 | JWT + `company_id=main` hợp lệ | `listJobRequisitions` | Envelope success, map `title`→Chiến dịch | 200 `HRM-REC-200` |
| BR-UC22-02 | 22 | `data.length=0` | Render empty state | PASS alternate; không inject mock | 200 |
| BR-UC22-03 | 22 | Scope mismatch | `resolveScopeContext` throw | Không render list giả | 409 `SCOPE_CONTEXT_MISMATCH` |
| BR-UC22-04 | 22 | Unauthorized | `assertAccess` | Không list | 401 `HRM-AUTH-001` |
| BR-UC23-01 | 23 | `company_id` + optional filters | `listRecords` | Rows với `attendance_date` ISO hợp lệ | 200 `HRM-ATT-200` |
| BR-UC23-02 | 23 | `page_size` > 100 | Validation | Từ chối | 400 `HRM-VAL-001` |
| BR-UC23-03 | 23 | Timestamp null/0 trên FE | Format date | Không hiển thị 1970 | UI FAIL |
| BR-UC23-04 | 23 | Empty list | Empty UI | PASS alternate | 200 |
| BR-UC24-01 | 24 | `company_id=main` (slug) | `listPayslips` | Hiển thị kỳ + net | 200 `HRM-PAY-200` |
| BR-UC24-02 | 24 | API error + `allowMockFallback()` false | Panel catch | Banner ERROR | UI error |
| BR-UC24-03 | 24 | Empty payslips | Empty UI | PASS alternate | 200 |
| BR-UC25-01 | 25 | Tab contracts | `listContracts` | Bảng HĐ | 200 `HRM-CON-200` |
| BR-UC25-02 | 25 | Tab insurance (portal) | `listHrmContracts` → map BHXH columns | Proxy HĐ→BHXH UI | 200 |
| BR-UC25-03 | 25 | Expiring BHXH | `listExpiringInsurance` | Alert/danh sách sắp hết hạn | 200 `HRM-CON-200` |
| BR-UC25-04 | 25 | iframe insurance Supabase | Query `supabase` tables | **FAIL** pilot until Nest | 54321 |
| BR-UC25-05 | 25 | `settings-catalogs` on rollup | Parallel fetch | **200** `HRM-SET-200` on load (P-CC-04/05) | 200 |

## 7. Acceptance criteria → test evidence (QA — P1-S0)

| AC-ID | Mô tả | Map | Pass khi |
|-------|-------|-----|----------|
| AC-P1-01 | Không 409 scope trên request chính | P-CC-05..08 | Mọi TC-*-E-SCOPE: 409 chỉ trên **probe**, không load |
| AC-P1-02 | Empty hợp lệ | P-CC-05..08 | TC-*-A: **200** + empty UI |
| AC-P1-03 | Không Supabase bắt buộc | P-CC-05..08 | TC-*-E-54321 absent trên load (Surface B sau FE-01) |
| AC-P1-04 | Portal panel API path | P-CC-05..08 A | `HrmWorkspacePanel` `hrmDataSource=api`; Network 200 |
| AC-P1-05 | UC branch coverage | UC22..25 | Mỗi UC có ≥1 H, 1 A, ≥2 E được execute hoặc N/A ghi lý do |
| AC-P1-06 | Regression | P-CC-03,04 | AC-PILOT-05 / U1–U4 / C1–C6 |

**Verdict QA:** `PASS` chỉ khi AC-P1-01..06 true cho **cả** 05..08 (hoặc GO WITH CONDITIONS ghi route DEFER + owner).

## 8. Handoff packet

| Field | Value |
|-------|-------|
| work_item_id | `P1-S0-BA-P-01` |
| from_role | ba-process |
| to_role | pm |
| entry_criteria | PM dispatch S0; matrix P-CC-05..08 `READY_FOR_QA`; SRS §13 UC-HRM-22..25 |
| exit_criteria (BA) | File này có §4–6 đầy đủ; TC-BAP-05..08; BR-UC22..25; `ack_status=PASS_TO_PM` |
| exit_criteria (QA — downstream) | P-CC-05..08 PASS/FAIL + evidence; không blocker 409/54321 |
| evidence_path | `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` |
| needed_by | PM → dispatch `P1-S0-QA-01` |
| ack_status | **PASS_TO_PM** |

**PM action:** Dispatch QA với entry = §5 TC-ID + §7 AC-P1-*; thứ tự **P-CC-05 → 06 → 07 → 08 → regression 03/04**.

**Coaching:** `.cursor/team/PM_COACHING_FOR_ROLES.md` — L2 bắt buộc; L1 UAT không thay iframe.

## 9. Open risks / clarifications

| ID | Risk | Owner | Trigger |
|----|------|-------|---------|
| R-01 | `Insurance.tsx` Supabase-only (UC25-E3) | dev-fe (`P1-S0-FE-01`) | TC-BAP-05-E-54321 FAIL |
| R-02 | Portal insurance = contracts proxy (BR-UC25-02) | PM/product | QA document actual vs `employee_insurance_records` |
| R-03 | Recruitment/Attendance/Payroll iframe chưa `shouldSkipSupabase` | dev-fe | TC-BAP-06/07/08-E-54321 |
| R-04 | GAP-BHXH-FE — BE `GET /insurance` exists; Surface A still `listHrmContracts` for insurance view | dev-fe (`P1-EX-FE-01`) | BR-INS-01 / P1-EX-BA-01-R2 |
| R-05 | Residual 54321 `subscription_plans` on employees embed | dev-fe P2 | PARTIAL nếu không block 05..08 |

## 10. UX benchmark AC overlay (P1-EX-BA-01-R2 — T5)

**Source:** [`PHASE1_UX_BENCHMARK_ASSESSMENT.md`](../program/PHASE1_UX_BENCHMARK_ASSESSMENT.md) · evidence [`p1-ex-ba-01-20260526.md`](evidence/p1-ex-ba-01-20260526.md)

| Journey / P-CC | UX AC (measurable) | Priority |
|----------------|-------------------|----------|
| J-HRM-01..02 | List→profile: no «Không tìm thấy» when list row exists under `main` | P0 regression guard (BR-EMP-LIST-01) |
| J-HRM-04 / P-CC-05 | Surface A «Bảo hiểm» shows BHXH columns from `GET .../insurance`, not contract-shaped proxy | **P0** BR-INS-01 |
| J-HRM-06 / P-CC-07 | No date cell `01/01/1970` when `attendance_date` invalid | **P0** BR-ATT-DATE-01 |
| J-HRM-01..02 | Profile satellite tab in embed: no `:54321`; `EmbedGuardedTab` or Nest data | **P1** BR-360-SOURCE-01 |
| J-CC-02 / CC-ORG | Member unit opens legal profile **200** or governed disable — no 404 loop | **P0** BR-ORG-LINK-01 |
| J-XBOS-01 / CC-INBOX | `VITE_ALLOW_MOCK_FALLBACK=false` → zero mock tasks when API empty | **P0** BR-INBOX-01 |

L2 **PASS** on a row does **not** satisfy UX AC above — QA must cite benchmark screen ID in evidence.

## 11. Assumptions

- Pilot stack `:5175` / HRM `:28001` / XBOS `:28002`.
- CEO token `companyId=main`; query `company_id=main` (payroll slug; attendance UUID resolved by scope).
- `VITE_HRM_USE_API` default true; portal session via `portalAuthBridge`.
- Implementation truth: `docs/hrm/SRS.md` §13 + `apps/web/web-portal/src/modules/hrm/HrmWorkspacePanel.tsx` + `apps/api/hrm-api` controllers cited above.

---

*Prior cycle:* `PILOT-ZERO-DEFECT-01` (2026-05-22) — cùng file, mở rộng S0 `P1-S0-BA-P-01`.*
