# QA-CNTT-PAYROLL-CATEGORIES-AUTOTEST-01

**Date:** 2026-08-13  
**Status:** DISPATCHED (pending execution)  
**Scope:** Validate 6 payroll categories + 6 provinces against extracted data requirements  
**Entry criteria:** Payroll API live, GĐ1 data extraction DONE (67 files synthesized)  
**Exit criteria:** Test report with PASS/FAIL per category + evidence links

---

## Test Scope: 6 Payroll Categories

| # | Category | Vietnamese Name | Test Focus |
|---|----------|-----------------|-----------|
| 1 | ĐPHH | Điều phối hàng hóa | Revenue commission, probation/permanent tiers |
| 2 | TĐHK | Tổng đài hành khách | KPI-based (1500/1731 calls) + service quality |
| 3 | VP-HN | Lương thời gian (Hà Nội) | Fixed salary scales (thang lương 2A) + regional |
| 4 | LX-T | Lái xe tuyến | Per-trip + ANCA + 6 provincial RIENG override |
| 5 | LX-T2 | Lái xe tải | Flat khoán + mileage fuel allowance by vehicle type |
| 6 | VP-T | Văn phòng tỉnh | Regional office staff, 6 location variants |

---

## Test Matrix: Ready to Execute (GĐ1)

### AC-PAY-CNTT-CRUD-01: Create Payroll Template per Category
**Description:** Verify POST /hrm/payroll/batch accepts each of 6 category structures  
**Input data:** Sample rows from each category (extracted from 67-file synthesis)  
**Test steps:**
1. POST /hrm/payroll/batch with ĐPHH structure + sample row
2. POST /hrm/payroll/batch with TĐHK structure + sample row
3. POST /hrm/payroll/batch with VP-HN structure + sample row
4. POST /hrm/payroll/batch with LX-T structure + sample row (base + RIENG)
5. POST /hrm/payroll/batch with LX-T2 structure + sample row
6. POST /hrm/payroll/batch with VP-T structure + 6 province variants

**Expected result:**
- All 6 POST requests → 201 Created
- Each returns `id` + `tenant_id` + `period` + `status: DRAFT`
- Response headers contain `X-Payroll-Category: [ĐPHH|TĐHK|VP-HN|LX-T|LX-T2|VP-T]`

**Evidence path:** docs/qa/evidence/qa-cntt-payroll-categories-autotest-01-ac-01.md

---

### AC-PAY-CNTT-SCOPE-01: Multi-Tenant Isolation (U19)
**Description:** Verify payroll data respects tenant_id boundary  
**Setup:** Create 2 test tenants (A, B) with separate payroll records  
**Test steps:**
1. POST /hrm/payroll/batch as Tenant A (category ĐPHH)
2. POST /hrm/payroll/batch as Tenant B (category ĐPHH, same period)
3. GET /hrm/payroll/:period as Tenant A
4. Verify Tenant A sees only its payroll (1 record), not Tenant B's

**Expected result:**
- Tenant A list returns 1 record (only own)
- GET by Tenant B payroll ID as Tenant A → 403 Forbidden
- Response error: `SCOPE_OUT_OF_RANGE`

**Evidence path:** docs/qa/evidence/qa-cntt-payroll-categories-autotest-01-scope-01.md

---

### AC-PAY-CNTT-SOFTDELETE-01: Soft-Delete Verification (U65)
**Description:** Verify payroll period deletion hides from list but doesn't hard-delete  
**Setup:** Create payroll record, then delete via API  
**Test steps:**
1. POST /hrm/payroll/batch (category ĐPHH) → `id: P001`
2. DELETE /hrm/payroll/P001
3. GET /hrm/payroll/:period (same period) → should NOT include P001
4. GET /hrm/payroll/P001 (direct access) → 404 Not Found
5. Browser verify: F12 Network tab shows no deleted record in list response

**Expected result:**
- DELETE → 204 No Content
- List GET → P001 absent (filtered_out via deleted_at IS NOT NULL)
- Direct GET /hrm/payroll/P001 → 404 Payroll record not found
- DB query: SELECT * FROM payroll WHERE id='P001' → deleted_at is NOT NULL (soft-deleted)

**Evidence path:** docs/qa/evidence/qa-cntt-payroll-categories-autotest-01-softdelete-01.md

---

### AC-PAY-CNTT-APPROVAL-LOCK-01: Workflow Lock State
**Description:** Verify L1 approval + L2 lock prevents modification  
**Setup:** Create payroll, then approve + lock via API  
**Test steps:**
1. POST /hrm/payroll/batch (ĐPHH) → status: DRAFT
2. POST /hrm/payroll/:id/approve (L1 Finance approval)
3. PATCH /hrm/payroll/:id (attempt to modify after approval) → should fail
4. POST /hrm/payroll/:id/lock (L2 Tenant Admin lock)
5. PATCH /hrm/payroll/:id (attempt modify after lock) → should fail

**Expected result:**
- After approve: status → APPROVED (read-only flag set)
- PATCH in APPROVED state → 409 Conflict (PAYROLL_ALREADY_LOCKED)
- After lock: status → LOCKED
- PATCH in LOCKED state → 409 Conflict (PAYROLL_ALREADY_LOCKED)

**Evidence path:** docs/qa/evidence/qa-cntt-payroll-categories-autotest-01-approval-01.md

---

### AC-PAY-CNTT-RIENG-OVERRIDE-01: RIENG Policy Fragment Precedence
**Description:** Verify RIENG override chains per QĐ 439 (base) vs QĐ 837 (Nội Bài)  
**Setup:** Create LX-T payroll with base policy + RIENG override  
**Test steps:**
1. POST /hrm/payroll/batch (LX-T, business_line: "lx-t-noi-bai") with base policy pack + RIENG fragment override
2. GET /hrm/payroll/:id → examine fragment selection
3. Verify effective_from precedence: RIENG effective_from < base effective_from?
4. Call GET /hrm/payroll/:id/policy-stack → verify fragment chain resolution

**Expected result:**
- Fragment chain resolved per effective_from (latest first)
- Nội Bài rate override applied (if effective_from < now)
- Policy stack returned shows [QĐ-837-RIENG, QĐ-439-base] order
- Formula engine will use top stack item (QĐ 837) when calculating

**Evidence path:** docs/qa/evidence/qa-cntt-payroll-categories-autotest-01-rieng-01.md

---

### AC-PAY-CNTT-VP-PROVINCE-01: 6 Province Variants (VP-T Category)
**Description:** Verify 6 provincial office payroll templates work independently  
**Setup:** Extract 6 sample rows (Việt Trì, Yên Bái, Nam Định, Phú Thọ, Ninh Bình, Thái Bình)  
**Test steps:**
1. POST /hrm/payroll/batch with VP-T province=Việt Trì
2. POST /hrm/payroll/batch with VP-T province=Yên Bái
3. ... (repeat for 4 more provinces)
4. GET /hrm/payroll?filter[province_code]=vt-vt → verify Việt Trì records only
5. GET /hrm/payroll?filter[province_code]=yb-yb → verify Yên Bái records only

**Expected result:**
- All 6 POST requests succeed (201)
- Filter by province_code returns correct subset
- Each province shows correct department count per extracted data

**Evidence path:** docs/qa/evidence/qa-cntt-payroll-categories-autotest-01-province-01.md

---

## Test Data: Sample Payroll Rows per Category

### ĐPHH (Logistics) — Sample Input
```
Mã NV | Tên NV | Điểm ĐPHH (T6) | Hệ số phục vụ | Chứng chỉ HĐT | Lương Cơ bản | Tính lương theo
001   | Nguyễn A | 450 | 1.0 | Có | 8,000,000 | Hóa đơn
```
Expected in DB: payroll_type=ĐPHH, employee_id=001, calculation_period="T6.2026"

### TĐHK (Call Center) — Sample Input
```
Mã NV | Tên NV | Lượng cuộc gọi (T5) | Điểm chất lượng | Lương Cơ bản | KPI threshold
T001 | Trần B | 1650 | 98% | 7,500,000 | 1500
```
Expected: payroll_type=TĐHK, employee_id=T001, kpi_calls=1650, quality_score=98

### VP-HN (Time-based Office Hà Nội) — Sample Input
```
Mã NV | Tên NV | Chức vụ | Hệ số lương | Phụ cấp khu vực | Lương cơ sở
VPH01 | Lê C | Quản lý | 1.5 | 500,000 | 10,000,000
```
Expected: payroll_type=VP-HN, salary_scale_level=1.5, regional_allowance=500000

### LX-T (Route Drivers) — Sample Input (Base + RIENG)
```
Mã NV | Tên NV | Lượt chạy (T6) | Cước ỵ lệnh | Ân Cấp | Khu vực | Ghi chú
LX001 | Phạm D | 120 | 2,000,000 | Có | Nội Bài | RIENG QĐ 837 áp dụng
```
Expected: payroll_type=LX-T, trips_count=120, revenue=2000000, anca=true, rieng_policy="QĐ-837"

### LX-T2 (Truck Drivers) — Sample Input
```
Mã NV | Tên NV | Xe loại | Số chuyến (T5) | Khoán lương | Xăng/dầu allowance
TX001 | Vũ E | Tải 5T | 45 | 12,000,000 | 2,000,000
```
Expected: payroll_type=LX-T2, vehicle_type=5T, trip_count=45, fixed_salary=12000000, fuel_allowance=2000000

### VP-T (Provincial Office) — Sample Input (6 variants)
```
Mã NV | Tên NV | Phòng ban | Tỉnh | Hệ số lương | Phụ cấp tỉnh
VP_VT001 | Tạ F | Hành chính | Việt Trì | 1.2 | 400,000
VP_YB001 | Ngô G | Kế toán | Yên Bái | 1.1 | 350,000
...
```
Expected: payroll_type=VP-T, province=[VT|YB|ND|PT|NB|TB], salary_index=1.2/1.1/etc

---

## Blocked Test Cases (Pending Formula Evaluator)

### AC-PAY-CNTT-FORMULA-CALC-01: Formula Calculation ⏳
**Blocker:** Formula evaluator not ready (interim: 0₫ placeholder)  
**Will test when evaluator ready:** Verify payment calculation per formula:
- ĐPHH: `lương = điểm_ĐPHH * (cơ_bản + phụ_cấp) * hệ_số`
- TĐHK: `lương = KPI_match * cơ_bản + (cuộc_gọi - threshold) * unit_rate`
- LX-T: `lương = ∑(lượt × cước) + anca_allowance + regional_adjustment`

### AC-PAY-CNTT-BATCH-PERF-01: Batch Performance ⏳
**Blocker:** Formula engine dependency  
**Will test when ready:** Verify batch insert <30min for 500 employees (P95 < 300ms, P99 < 800ms)

---

## Test Execution Checklist

- [ ] Environment: HRM API running at `:28001` / `:3001`
- [ ] Auth: Test user token (L1 Finance + L2 Admin roles)
- [ ] Database: Fresh test tenant (multi-tenant scoping)
- [ ] Framework: Jest / Vitest configured for API integration tests
- [ ] Evidence: Screenshots, API logs, DB query results per AC

---

## Evidence Template Per AC

**File:** `docs/qa/evidence/qa-cntt-payroll-categories-autotest-01-<AC>.md`

```markdown
# AC-PAY-CNTT-[TESTNAME]-01

**Date:** 2026-08-13  
**Tester:** QA-CNTT-AUTO  
**Status:** PASS / FAIL / BLOCKED

## Setup
- Environment: ...
- Test tenant: ...
- Sample data: [REFERENCE TO EXTRACTED FILE]

## Test results
### Step 1: [description]
- Request: [API call + payload]
- Response: [HTTP status + body excerpt]
- Evidence: [screenshot / log excerpt]

### Step 2: ...

## Summary
- PASS: All steps completed as expected
- FAIL: Step X broke with error Y
- Remediation: ...

## Conclusion
- Payroll category [CATEGORY] ✅ or ❌ verified
```

---

## Test Dispatch Instructions

**To:** dev-qa / qa role  
**From:** pm (Claude Lead)  
**work_item_id:** QA-CNTT-PAYROLL-CATEGORIES-AUTOTEST-01  

**Entry criteria:**
- HRM API live
- Test database seeded with sample payroll data (per section "Sample Payroll Rows")
- Jest/Vitest framework ready in `apps/api/hrm-api/test/e2e/payroll-categories.test.ts`

**Exit criteria (ack_status):**
- **PASS_TO_PM** if all 6 AC-PAY-CNTT-[CATEGORY]-* pass
- **PASS_WITH_HOLD** if 4+ pass but 1-2 AC blocked by formula evaluator
- **FAIL_TO_PM** if <4 pass (break-fix required before release)

**Evidence path:** `docs/qa/evidence/qa-cntt-payroll-categories-autotest-01-summary.md`

**Next owner:** pm (for sponsor gate review)

---

## Related Documentation

- **Payroll synthesis:** `docs/brand-new-documents-20270801/SYNTHESIS-CNTT-PAYROLL-67FILES-20260813.xlsx` (source data)
- **SRS:** `docs/brand-new-documents-20270801/SRS_VN.md` §5.3 (payroll schema)
- **API contract:** `docs/brand-new-documents-20270801/API_CONTRACT_VN.md` §3.2 (endpoints)
- **Policies:** `docs/từ khách hàng/Gửi P.CNTT/Chính sách chung/` (base regulations)
- **Previous testcase:** `docs/qa/evidence/po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md` (framework reference)

---

**Created:** 2026-08-13  
**By:** PM (Claude Lead) / QA orchestration  
**Status:** Ready to dispatch to dev-qa / qa role
