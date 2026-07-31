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
| **UC23-S1** (ADD) | Happy sheet | Create sheet kỳ + Công chuẩn | `POST …/attendance-sheets` **201** `HRM-AS-201` → list row | AC-ATT-SHEET-01 |
| **UC23-S2** (ADD) | Happy/Alt open | Open sheet | Grid data **hoặc** empty + lý do | AC-ATT-SHEET-02 |
| **UC23-S3** (ADD) | Exception storm | List hoặc weekly load | ≤2 GET / URL / 10s; no Abort×N | AC-ATT-SHEET-04/06 |
| **UC23-S4** (ADD) | F5 | After create | Sheet còn; kỳ đúng | AC-ATT-SHEET-05 |

**Ghi chú:** Mobile check-in (UC-HRM-MOB-04) **ngoài** P-CC-07 nhưng cùng bảng `attendance_records` — L1 UAT P3. **Sheet CRUD** = **HRM-AT-14** / **J-HRM-06b** / **UF-HRM-16**.

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
| **Sheet create** (ADD) | App/embed | Kỳ 01/07–31/07 + Công chuẩn → Lưu | POST **201**; list row; no storm | TC-BAP-07-S-CREATE · **J-HRM-06b** |
| **Sheet open** (ADD) | App/embed | Click sheet | Grid hoặc empty lý do; records ≤2 GET/10s | TC-BAP-07-S-OPEN |

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
| J-HRM-01 | List→profile: no «Không tìm thấy» when list row exists under `main` | P0 regression guard (BR-EMP-LIST-01) · **PASS** W5B |
| J-HRM-02 | P-CC-03 employees list → row → profile (`GET …/employees/:id?company_id=main`) | **PASS** API scope parity nip.io 2026-06-05 · browser embed click **GWC** (**C-EMPGRPQC-01**) · [`p1-phase1-qc-hrm-emp-group-crud-20260604.md`](evidence/p1-phase1-qc-hrm-emp-group-crud-20260604.md) |
| **J-HRM-IM-01** | P-CC-03 Employees → Import Excel → preview → Cancel/F5 (non-persist) | **PASS local** · **FR-HRM-IM-01** · Network `POST …/import/preview` **200** `SHEET-200` · zero persist · U65 · QC GWC [`qc-hrm-im-01-preview-ac-01-20260727.md`](evidence/qc-hrm-im-01-preview-ac-01-20260727.md) · BA [`ba-j-hrm-im-01-journey-01-20260727.md`](evidence/ba-j-hrm-im-01-journey-01-20260727.md) · **HOLD_DEPLOY** / NOT :8088 · **OUT** IM-02 · **must_keep** host J-HRM-02 |
| J-HRM-04 / P-CC-05 | Surface A «Bảo hiểm» shows BHXH columns from `GET .../insurance`, not contract-shaped proxy | **P0** BR-INS-01 |
| J-HRM-06 / P-CC-07 | No date cell `01/01/1970` when `attendance_date` invalid | **P0** BR-ATT-DATE-01 |
| J-HRM-01..02 | Profile satellite tab in embed: no `:54321`; `EmbedGuardedTab` or Nest data | **P1** BR-360-SOURCE-01 |
| J-CC-02 / CC-ORG | Member unit opens legal profile **200** or governed disable — no 404 loop | **P0** BR-ORG-LINK-01 · **PASS** nip.io read detail 2026-06-04 (`p1-phase1-qa-crud-matrix-20260604.md`) |
| J-XBOS-01 / CC-INBOX | `VITE_ALLOW_MOCK_FALLBACK=false` → zero mock tasks when API empty | **P0** BR-INBOX-01 |
| J-XBOS-01 / CC-WF | CEO: pending list → instance detail → `POST …/complete` (`XBOS-WF-200`) → list count decreases | **PASS** API L2.5 2026-06-04 · [`p1-phase1-qa-wf-inbox-20260604.md`](evidence/p1-phase1-qa-wf-inbox-20260604.md); **GWC** strict browser drawer click |

L2 **PASS** on a row does **not** satisfy UX AC above — QA must cite benchmark screen ID in evidence.

## 12. Cross-module integration journeys (U39 — `P1-PROD-INT-BA-P-01`)

**Source:** [`p1-prod-int-ba-p-01-20260607.md`](../program/governance/p1-prod-int-ba-p-01-20260607.md) · SRS §15 · BR-INT-01..05

| Journey | Path | Pass (fail if) | Persona | Status |
|---------|------|----------------|---------|--------|
| **J-HRM-INT-01** | P-CC-06 requisition → detail → candidate; `filled` ⇒ `employee_id` | Same `company_id` slug; hire link NOT NULL | Group CEO + member CEO | ⏳ QA W4 |
| **J-HRM-INT-02** | P-CC-03 employee → P-CC-04 contract same NV | ≥1 contract; slug match (extends J-HRM-01) | Both | ⏳ |
| **J-HRM-INT-03** | P-CC-03 employee → P-CC-08 payslip same NV | `employee_id` + period slug match (extends J-HRM-07) | Both | ⏳ |
| **J-HRM-INT-04** | P-CC-06 hire → P-CC-03 new employee row | Visible without tenant switch; slug = requisition | Both | ⏳ |
| **J-HRM-INT-05** | Switcher slug **holding** → tabs 03/04/06/08 | All APIs same selected slug; **0× 409** | Group CEO only | **PASS** · CD-FB-06 QC GWC 2026-07-19 (`cd-fb-06-role-switch-qc-20260719.md`) |

**Scope overlay:** UC-HRM-SCOPE-01 (rollup) · UC-HRM-SCOPE-02 (member) · UC-HRM-SCOPE-03 (switcher) — AC-INT-SCOPE-* / AC-INT-SW-* in governance doc §7.

## 11. Mobile Home Portal — J-MOB-11..15 (U53)

**Source:** `docs/program/MOBILE_HOME_PORTAL_AC_DELTA.md` · **Account:** `uat.nv0001@xe.vn` / `xevn-uat-2026` · **Surface:** `TabDashboard` only (4-tab unchanged).

| Journey | Click path | Pass (L2.5) |
|---------|------------|-------------|
| **J-MOB-11** | Login → Trang chủ → tap bell | `InAppNotifications`; header `#1E40AF`; search stub không crash |
| **J-MOB-12** | Swipe carousel | ≥1 slide + dots khi ≥2 slides; work anniversary / birthday BR-BDAY/BR-ANNIV |
| **J-MOB-13** | Tap icon «Chấm công» / «Bảng lương» | → `CheckIn` / `PayrollSummary`; 8 icon 2×4 |
| **J-MOB-14** | Tap feed «Xem chi tiết» | → `PayslipDetail` (extends J-MOB-04) |
| **J-MOB-15** | Full scroll | Portal layers **trên** Smart Hub; **J-MOB-06..09** không regress |

**W7 ID renumber:** draft J-MOB-11..13 (leave doc / ESS / push) → **J-MOB-16..18** — see portal delta §3.

**U54 note:** U53 covers **subset SET A only** (portal shell). Full sponsor ESS mockup SET A–E → `MOBILE_HRM_ESS_UX_BENCHMARK.md`.

## 12. Mobile ESS UX — J-MOB-19..30 (U54)

**Source:** `docs/program/MOBILE_HRM_ESS_UX_BENCHMARK.md` · **Account:** `uat.nv0001@xe.vn` (NV) · manager account for SET B · **Regression:** J-MOB-11..15 + J-MOB-06..09 mandatory on Dashboard changes.

| Journey | Click path | Pass (L2.5) |
|---------|------------|-------------|
| **J-MOB-19** | Dashboard → header role+chat stub+bell | Avatar+name+role; chat stub; bell → inbox |
| **J-MOB-20** | Dashboard → date picker → stats row | Work/Late/Absence updates for selected date |
| **J-MOB-21** | Dashboard → 4 stat cards tap | Active Team / Off / Leave Requests / My Leaves navigate |
| **J-MOB-22** | Dashboard → announcements → tap row | List loads; tap → detail/inbox |
| **J-MOB-23** | Manager → leave cards inline Accept/Decline | Card+online dot; not select-then-footer only |
| **J-MOB-24** | Manager → confirm modal → snackbar Undo | Icon modal; snackbar affordance |
| **J-MOB-25** | My Leaves → balance cards | Available + Used + period header |
| **J-MOB-26** | My Leaves → Review\|Approved\|Rejected tabs | Date-grouped sections |
| **J-MOB-27** | My Leaves empty → Apply CTA | Illustration + → CreateLeaveRequest |
| **J-MOB-28** | Leave form → type + balance chip | Balance per leave type or HR fallback |
| **J-MOB-29** | Leave form → date modal → submit confirm | Modal range; confirm before POST |
| **J-MOB-30** | Team tab → search+filter+check-in badge | Directory list; status matches API |

**Waves:** MOB-UX-06 (19–22) · MOB-UX-07 (23–29) · MOB-UX-08 (30) · MOB-UX-09 (tab IA + payslip/profile ext).

## 13. Mobile ZenHR ESS polish — J-MOB-31..35 (U55)

**Source:** `docs/program/MOBILE_HRM_ESS_UX_BENCHMARK.md` §13 · **Account:** `uat.nv0001@xe.vn` (NV) · manager for pending/approve · **Regression:** J-MOB-19..30 + J-MOB-11..15 + J-MOB-06..09 + **4-tab count = 4**.

| Journey | Click path | Pass (L2.5) |
|---------|------------|-------------|
| **J-MOB-31** | Dashboard → **My Pending Actions** strip → tap row | Opens leave/detail/inbox; strip hidden when count=0 |
| **J-MOB-32** | Dashboard → **My Actions** grid (Time Off / Expenses / Letters) | Time Off → leave flow; Expenses/Letters → Phase 2 stub |
| **J-MOB-33** | Any tab → **center FAB (+)** → CheckIn | FAB visible; tab bar still 4 tabs; optional map/clock |
| **J-MOB-34** | Payslip tab → **net salary hero** → history row → detail | Green hero + latest net; list below; tap → PayslipDetail |
| **J-MOB-35** | Chấm công → Lịch sử → timeline badge | On Time / Late / Absent badge per row matches API |

**Waves:** MOB-UX-10 (31–35) · after MOB-UX-06..09 baseline · FAB Option B per benchmark §13.4.

## 15. Mobile persona UX — J-MOB-36..38 (MOB-UX-13)

**Source:** `docs/program/MOBILE_PERSONA_UX_MATRIX.md` · **Accounts:** `uat.nv0001@xe.vn` (EMP) · `uat.nv0002@xe.vn` (MGR) · `ceo@xe.vn` (LDR slice) · **Regression:** J-MOB-01..35 + **AC-PERS-LOC-01** (no GPS/geofence/UUID on check-in).

| Journey | Click path | Pass (L2.5) |
|---------|------------|-------------|
| **J-MOB-36** | EMP login → Trang chủ → «Việc cần làm» before grid → tile Nghỉ → detail | No «Cần duyệt» hero when `is_manager=false`; ≥ 9 VI tiles |
| **J-MOB-37** | MGR login → «Cần duyệt (n)» or pending strip → Duyệt → snackbar VI | Tile «Duyệt»; FAB duyệt row |
| **J-MOB-38** | LDR login → Pulse/báo cáo section → Đội nhóm rollup | FAB no check-in; leader copy VI |
| **J-MOB-02** (regress) | Check-in → «Vị trí thiết bị» auto capture | **Fail** if GPS/geofence/UUID field |

**Waves:** MOB-UX-13a..g per `MOBILE_APPLE_HIG_ESS_PROGRAM.md` §5.

## 14. Assumptions

- Pilot stack `:5175` / HRM `:28001` / XBOS `:28002`.
- CEO token `companyId=main`; query `company_id=main` (payroll slug; attendance UUID resolved by scope).
- `VITE_HRM_USE_API` default true; portal session via `portalAuthBridge`.
- Implementation truth: `docs/hrm/SRS.md` §13 + `apps/web/web-portal/src/modules/hrm/HrmWorkspacePanel.tsx` + `apps/api/hrm-api` controllers cited above.

## 16. Recruitment workflow bridge — J-REC-WF-01..06 (`XHRM-REC-WF-BA-01`)

**Source:** `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` · Program `P1-XBOS-HRM-REC-WF-BRIDGE`  
**Account:** `ceo@xe.vn` (Group CEO rollup `company_id=main`) · Approver via XBOS Inbox (resolver)  
**must_keep:** UF-HRM-12 · J-HRM-05 · P-CC-06 · LeaveWorkflowBridge · F6 AC-CD-F6-*  
**U65:** zero-seed — inbox task chỉ sau chuỗi FE (canvas → HRM submit → spawn).

| Journey | Click path | Pass (L2.5) |
|---------|------------|-------------|
| **J-REC-WF-01** | XBOS Workflow canvas → save active `hrm_recruitment_*` → reload | Definition + resolver persist (AC-REC-WF-01) |
| **J-REC-WF-02** | P-CC-06 / HRM → tạo plan → Gửi duyệt → F5 | Spawn 2xx **hoặc** banner `SPAWN-MISSING` + pending (AC-REC-WF-02) |
| **J-REC-WF-03** | XBOS Inbox → Duyệt task tuyển dụng → HRM status sync → F5 | Status approved/open; **cấm** seed inbox (AC-REC-WF-03) |
| **J-REC-WF-04** | Candidate roadmap → sau step → stage chip = F6 map → J-HRM-05 | Unmapped fail-closed (AC-REC-WF-04) |
| **J-REC-WF-05** | P-CC-06 dashboard funnel 6 cột | Counts = live aggregate post-sync; BR-DQ-01 (AC-REC-WF-05) |
| **J-REC-WF-06** | Inbox Từ chối + lý do | rejected + notify; no hired downgrade (AC-REC-WF-06) |

**Waves:** BA `XHRM-REC-WF-BA-01` → SA ADR `XHRM-REC-WF-SA-01` → ba-data → Dev → QA L2.5.

## 16b. B-Minutes customer retest — BM-02..BM-07 AC (`BM-BA-AC-MATRIX-01`)

**Source:** `docs/program/deltas/BMINUTES_AC_MATRIX.md` · Evidence `docs/qa/evidence/bm-ba-ac-matrix-01-20260722.md` · Program `P1-BMINUTES-CUST-RETEST-01`  
**U65:** zero-seed · PASS = FE post-mutation + Network 2xx + F5 · `code_does` UNKNOWN until explore/QA  
**must_keep:** UF-HRM-02/12 · J-HRM-03/05 · J-HRM-INT-05 · J-REC-WF-01..06 (DRAFT until QA) · AC-CD-F3..F6 / AC-REC-WF-*  
**BM-01:** Connect/template **DEFER** (not in matrix).

| BM | AC cluster | Primary journeys / UF |
|----|------------|------------------------|
| **BM-02** | BM-AC-02-01..04 | J-HRM-INT-05 · UF-HRM-09/13 |
| **BM-03** | BM-AC-03-01..05 | F4 leave + J-REC-WF-01 pattern |
| **BM-04** | BM-AC-04-01..05 | UF-HRM-02 · J-HRM-03 |
| **BM-05** | BM-AC-05-01..04 | UF-HRM-12 · J-HRM-05 · J-REC-WF-05 |
| **BM-06** | BM-AC-06-01..08 | **J-REC-WF-01..06** · UF-HRM-12 |
| **BM-07** | BM-AC-07-01..03 | UF-HRM-10 · UF-HRM-03 (≠ G-DB-04 dual catalog) |

## 17. HRM full sidebar sweep — J-HRM-MENU-SWEEP (`BA-HRM-MENU-UF-MATRIX-01`)

**Source:** QA proposal in `docs/qa/evidence/qa-hrm-menu-full-sweep-01-20260720.md` · Matrix [`USER_FLOW_OPERABILITY_MATRIX.md`](./USER_FLOW_OPERABILITY_MATRIX.md) §4b · Journey [`PROGRAM_JOURNEY_MAP.md`](../program/PROGRAM_JOURNEY_MAP.md)  
**Account:** `ceo@xe.vn` · `companyId=main` · U65 zero-seed  
**Scope:** Load + no tech chrome + no crash/console P0 — **không** thay AC mutate UF-HRM-01..13.

| Journey | Click path | Pass (L2 / L2.5 load) |
|---------|------------|------------------------|
| **J-HRM-MENU-SWEEP** | CC HRM embed → lần lượt mọi leaf AppSidebar (17) | Mỗi UF-HRM-MENU-01..17 load OK; no chrome patterns; no Sync ERROR / RangeError |
| **UF-HRM-MENU-02b** | Employees → mở 1 hồ sơ → tab Lương | No Invalid time; no badge `API` |
| **UF-HRM-MENU-17** | Settings + catalogs + metadata queue | Sync stamp human-readable; P3 workflow ids = GWC condition (không block load PASS) |

**Waves:** BA matrix `BA-HRM-MENU-UF-MATRIX-01` → optional QA promote Dev8088 · residual FE metadata ids (P3).

## 18. P0 date fidelity — ATT sheet + company founded (`FID-P0-BA-DATE-01`)

**Source:** `docs/qa/evidence/fid-p0-ba-date-01-20260722.md` · Program `P1-HRM-SPEC-CODE-DB-FIDELITY` · SoT `UX_VI_DATE_NUMBER_FORMAT_AC.md`  
**Incidents:** INC-DATE-ATT-SHEET · INC-DATE-CO-FOUND  
**U65:** zero-seed · picker MUST open · parse padded+unpadded → Network `yyyy-MM-dd`

| Journey / surface | AC cluster | Pass when |
|-------------------|------------|-----------|
| **J-HRM-06b** (reopen date slice) | AC-FID-ATT-D01..D05 · AC-FID-DATE-01..07 | Picker mở trên Thêm bảng; `1/7/2026` → body `2026-07-01`; POST 201; must_keep AC-ATT-SHEET storm/empty |
| **Company detail / edit** (embed Phòng/Ban & Công ty) | AC-FID-CO-D01..D04 | Founded picker mở; bind + persist `founded_date`; MST/email/phone không «—» giả |

**Waves:** BA `FID-P0-BA-DATE-01` → FE `FID-P0-FE-DATE-01` + SA `FID-P0-SA-DATE-01` (company SoT) → QA J-HRM-06b date + company founded.

## 19. Employees list — cột «Thông tin công ty» vs ĐVTV (`BA-HRM-EMP-COMPANY-COL-01`)

**Source:** `docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md`  
**Symptom:** `:8088` `/command-center/hrm/employees` hiện «Khối … X.E» — lệch danh sách công ty/ĐVTV DB.  
**Spec says:** cột = pháp nhân / ĐVTV (Plane A); **code does:** operating-unit registry Khối (Plane B).  
**HOLD_DEPLOY:** cấm deploy brand/FE pilot đến khi sponsor cho phép.

| Journey / surface | AC cluster | Pass when |
|-------------------|------------|-----------|
| **J-HRM-02** / **P-CC-03** employees list | **AC-EMP-COL-01..07** · BR-EMP-COL-01..04 | Cột «Thông tin công ty» ∈ tên LE/ĐVTV; **0** `Khối … X.E`; F5 giữ; J-HRM-02 detail OK |

**Waves:** BA `BA-HRM-EMP-COMPANY-COL-01` → BE `D-HRM-EMP-COMPANY-COL-BE-01` + FE `D-HRM-EMP-COMPANY-COL-FE-01` → QA `QA-HRM-EMP-COMPANY-COL-01`.

**Traceability program:** `BA-SPEC-CODE-GAP-HRM-01` merged G-ORPH-01/02 + G-SPEC-01/04/05/06 into `docs/program/SPEC_CODE_TRACEABILITY_GAP_REGISTER.md` §4–§5 — evidence `docs/qa/evidence/ba-spec-code-gap-hrm-01-20260722.md` (HOLD_DEPLOY).

---

## 19b. Mobile ESS — nhãn công ty vs Khối pilot (`BA-MOB-ORPH-KHOI-LABEL-01`)

**Source:** `docs/qa/evidence/ba-mob-orph-khoi-label-01-20260730.md` · QC FAIL `qc-mob-spec-orphan-code-sample-01-20260730.md`  
**Symptom:** Scope / Settings / Home / Payslip / Login toast hiện «Khối … X.E» từ `PILOT_HRM_OPERATING_UNITS`.  
**Spec says:** **FR-HRM-EMP-COL-01** + **FR-HRM-MOB-OU-01** — nhãn công ty = Plane A (TECHSPEC §19.1); **code does:** Plane B Khối hardcode.

| Journey / surface | AC cluster | Pass when |
|-------------------|------------|-----------|
| **J-MOB-01** Scope / Settings | **AC-MOB-LABEL-01..02, 07** · BR-MOB-LABEL-01 | 0 «Khối … X.E»; §4 legal names or «—» |
| **J-MOB-01** Home / Payslip | **AC-MOB-LABEL-03..04** | Subtitle/greeting ∈ Plane A |
| **J-MOB-01** Login toast | **AC-MOB-LABEL-05** · G-ORPH-MOB-03 | Resolver parity Settings |
| OU filter (Group CEO) | **AC-MOB-OU-01..02** · BR-MOB-LABEL-04 | Row label = synced LE name; title «Đơn vị vận hành» giữ |

**Waves:** BA `BA-MOB-ORPH-KHOI-LABEL-01` → Dev-Mobile `D-MOB-G-ORPH-KHOI-01` → QA U65 → QC re-gate orphan sample. **HOLD_DEPLOY** · **U65** no seed.

---

## 20. Company Management — headcount ĐVTV ↔ slug (`D-HRM-CO-EMP-COUNT-BA-01`)

**Source:** `docs/qa/evidence/ba-hrm-co-emp-count-01-20260727.md`  
**Symptom:** `/command-center/hrm/company` «Tổng nhân viên»=0 / mọi «Số nhân viên»=0 trong khi Dashboard ≈1109.  
**Spec says:** Card + cột = workforce via LE→`GROUP_MEMBER_SLUGS` bridge (BR-INT-05 · BR-CO-EMP-01); **code does:** XBOS-only + `employee_count: null` → UI `|| 0`.  
**Prior QA:** UF-HRM-MENU-15 load-only 🟢 = **insufficient** — không promote headcount PASS.

| Journey / surface | AC cluster | Pass when |
|-------------------|------------|-----------|
| **J-HRM-CO-01** / Company `/company` · UF-HRM-MENU-15 (extend) | **AC-CO-EMP-01..06** · **AC-CO-IND-01..04** · BR-INT-05 · BR-CO-EMP-01..02 · **BR-CO-IND-01** · **BR-CO-LABEL-01** | Card ≈ `GET /employees/summary?company_id=main` `total`; per-row = slug count (Visun→`logistics`…); fail→«—»; F5 giữ; **«Ngành nghề»** = VI từ `business_lines`/catalog — **cấm** raw `entity_type`/`subsidiary` |

**Waves:** BA `D-HRM-CO-EMP-COUNT-BA-01` → BE `D-HRM-CO-EMP-COUNT-BE-01` + FE `D-HRM-CO-EMP-COUNT-FE-01` → QA `QA-HRM-CO-EMP-COUNT-01`.

---

## 19. HRM Import Excel preview — J-HRM-IM-01 (`BA-J-HRM-IM-01-JOURNEY-01`)

**Source:** QC GWC condition **C-IM01-JMAP-01** · [`qc-hrm-im-01-preview-ac-01-20260727.md`](evidence/qc-hrm-im-01-preview-ac-01-20260727.md) · BA evidence [`ba-j-hrm-im-01-journey-01-20260727.md`](evidence/ba-j-hrm-im-01-journey-01-20260727.md)  
**Spec:** **FR-HRM-IM-01** · `docs/hrm/SRS_HRM_IM_01_RESIDUAL_TEAM.md` · `docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md`  
**Host:** **J-HRM-02** (employees list) — **must_keep** status; this row is preview-only L2.5.

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-HRM-IM-01** | Login Group CEO → P-CC-03 Employees → Import Excel → upload → preview → **Cancel** → **F5** | Network `POST /api/hrm/spreadsheet/import/preview` → **HTTP 200** + **`SHEET-200`**; FE preview rows; **zero persist** (headcount unchanged; no commit); U65; **OUT** IM-02 · HOLD_DEPLOY / NOT :8088 |

## 20. E2 E-PAY-CLEAN journey slices (ADD `BA-ERP-E2-SRS-01` · 2026-07-28)

**Source:** `docs/program/deltas/BA_ERP_E2_SRS_01_20260728.md` · evidence `docs/qa/evidence/ba-erp-e2-srs-01-20260728.md` · SRS §16.5  
**Host must_keep:** **J-HRM-07** (payslip) · **J-HRM-03** + **UF-HRM-02** (contracts load)  
**Unlock:** E1-A + E1-B QC GWC · carry **R-E1A-A8-CTYPE**

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-HRM-PAY-E2-01** | Group CEO → Payroll → Salary components → chọn bản chất (`pay_types`) → Lưu → F5; invalid Zod reject; invent nature → BE 400; **không** mock tax/BH islands | AC-E2-NOMOCK/PAY-NATURE/ZOD/BE/F5 · U65 |
| **J-HRM-CI-TYPE-E2-01** | Profile HĐ **và** Contracts page → loại HĐ từ `contract_types` → Lưu → F5; hai surface cùng SoT; invent → 400 | AC-E2-CI-TYPE/PARITY/BE · đóng R-E1A-A8-CTYPE |

## 21. E3 CONSTRAINT + PERF-SM + INS-DEPTH journey slices (ADD `BA-ERP-E3-SRS-01` · 2026-07-28)

**Source:** `docs/program/deltas/BA_ERP_E3_SRS_01_20260728.md` · evidence `docs/qa/evidence/ba-erp-e3-srs-01-20260728.md` · SRS §16.6  
**Host must_keep:** **J-HRM-03** · **UF-HRM-04** (insurance/contracts load) · Performance list load  
**Unlock:** E2 QC GWC CLOSED · Cohort 4 E3

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-HRM-PERF-E3-01** | Group CEO → Đánh giá → tạo/sửa chu kỳ → tạo phiếu → nộp→duyệt→hoàn thành → F5; illegal jump reject; KPI/`job_grades`/`departments` picker khi expose | AC-PERF-01..05 · AC-E3-ZOD/SM/U72 · U65 |
| **J-HRM-INS-E3-01** | Group CEO → Bảo hiểm → tạo policy (`insurers`+`insurance_types`) → gắn NV → PATCH/end → F5; invent insurer/type → 400; trùng sổ reject khi cấm | AC-INS-01..05 · AC-E3-BE/F5 · U65 |
| **J-HRM-SM-E3-01** | Spot Leave approve path + một RC stage illegal transition | AC-E3-SM-01 · VAL-E3-07/08 |

## 22. E-XBOS-CTRL-SPEC — apply-to-members expand (ADD `BA-ERP-XBOS-CTRL-SPEC-01` · 2026-07-28)

**Source:** `docs/program/deltas/BA_ERP_XBOS_CTRL_SPEC_01_20260728.md` · evidence `docs/qa/evidence/ba-erp-xbos-ctrl-spec-01-20260728.md` · SRS §16.7  
**Unlock:** E3 QC GWC CLOSED · Cohort 5 SPEC docs only — **HOLD** Dev G1/G2 đến sponsor chốt  
**must_keep:** J-XBOS-02 / J-XBOS-08 publish→sync spine · UF-09/15 catalog gov · E1-B Settings buckets

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-XBOS-CTRL-01** | Admin XBOS: publish `departments` → apply-to-members (≥1 ĐVTV) → HRM Settings PB → sync/pull → list + F5; cross-nav consumer dept picker cùng code | AC-XBOS-CTRL-02 · HRM-01/02 · U65 |
| **J-XBOS-CTRL-02** | Cùng luồng `leave_types` (+ spot `job_titles` regression keep) | AC-XBOS-CTRL-03 · 01 · U65 |
| **J-XBOS-CTRL-03** | Apply key ngoài allow-list phase → **400** `XBOS-CFG-005`; member L0 không đổi | AC-XBOS-CTRL-04 |

**P0 allow-list (normative):** `job_titles` · `departments` · `leave_types` · `recruitment_channels` · `job_grades`

---

*Prior cycle:* `PILOT-ZERO-DEFECT-01` (2026-05-22) — cùng file, mở rộng S0 `P1-S0-BA-P-01`.*
