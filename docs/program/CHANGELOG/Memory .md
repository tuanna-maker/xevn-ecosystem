/**
 * @CODE-MEMORY-CHANGE 2026-08-24
 *
 * =============================================================================
 * RECRUITMENT DISPLAY BUG INVESTIGATION — HRM-RECRUIT-DISPLAY-01
 * =============================================================================
 *
 * ## Problem Statement (Tổng quan vấn đề)
 *
 * Tab "Yêu cầu tuyển dụng" (Job Requisitions) trong /hr/recruitment hiển thị
 * thông báo "Chưa có yêu cầu — bấm «Thêm yêu cầu» để tạo mới." mặc dù:
 * - Database có data (tạo thành công)
 * - API trả về 200 OK
 * - Form tạo mới hoạt động bình thường
 *
 * =============================================================================
 * ## Bug Symptoms Observed
 *
 * ### Symptom 1: Empty State After Page Load
 * - Tab "Yêu cầu tuyển dụng" hiển thị empty state message
 * - Sau khi tạo mới 1 yêu cầu → hiển thị đúng 1 dòng
 * - Sau khi reload trang → quay lại empty state
 *
 * ### Symptom 2: JobCandidatesDialog Display Issue
 * - Dialog hiển thị candidates không đúng
 * - Prop `requisitionId` bị undefined trong một số trường hợp
 * - Sử dụng sai API: `listCandidatesPool` thay vì `listCandidateApplications`
 *
 * ### Symptom 3: Board Tuyển dụng Error
 * - Thông báo "Chưa có giai đoạn pipeline hiệu lực"
 * - Cần tạo Giai đoạn REC trong Cài đặt
 *
 * =============================================================================
 * ## Root Cause Analysis
 *
 * ### Root Cause #1: Empty State Persistence (PRIMARY)
 *
 * **Nguyên nhân gốc**: Data được tạo thành công nhưng không load lại sau reload
 *
 * Có thể do:
 * a) API query không trả về data đúng tenant/company scope
 * b) React Query cache không invalidate sau khi tạo mới
 * c) State management issue trong useJobRequisitions hook
 *
 * **Files liên quan**:
 * - apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx (render logic)
 * - apps/web/hrm/src/hooks/useJobRequisitions.ts (data fetching)
 * - apps/web/hrm/src/integrations/hrmApi.ts (API client)
 *
 * ### Root Cause #2: JobCandidatesDialog Prop Mismatch
 *
 * **Vấn đề**: Component nhận `requisitionId` nhưng thực tế nhận `job_posting.id`
 *
 * **Đã fix** (trong conversation trước):
 * - Đổi tên prop `requisitionId` → `jobPostingId`
 * - Cập nhật type `HrmCandidateApplicationRow` → `HrmCandidateApplicationEnriched`
 * - Sử dụng đúng API `listCandidateApplications` thay vì `listCandidatesPool`
 *
 * **Files đã thay đổi**:
 * - apps/web/hrm/src/components/recruitment/JobCandidatesDialog.tsx
 * - apps/web/hrm/src/integrations/hrmApi.ts
 *
 * ### Root Cause #3: Missing Internal API Key
 *
 * **Vấn đề**: 400 Bad Request với code `HRM-AUTH-001`
 *
 * **Đã fix**:
 * - Thêm `VITE_INTERNAL_API_KEY=xevn-dev-internal-key` vào apps/web/hrm/.env
 *
 * =============================================================================
 * ## Files Analyzed
 *
 * | File | Purpose | Status |
 * |------|---------|--------|
 * | JobRequisitionsTab.tsx | Render YCTD list | Chưa fix |
 * | useJobRequisitions.ts | Data fetching hook | Cần kiểm tra |
 * | JobCandidatesDialog.tsx | Candidates dialog | Đã fix prop |
 * | JobPostingsTab.tsx | Job postings list | Đã update prop |
 * | hrmApi.ts | API client | Đã fix types |
 * | JobRequisitionDialog.tsx | Create/Edit dialog | Đã fix |
 *
 * =============================================================================
 * ## Test Flow Executed (Browser Automation)
 *
 * ### Step 1: Create Job Requisition
 * - Navigate: http://localhost:8080/hr/recruitment
 * - Click: "Thêm yêu cầu" button
 * - Fill form:
 *   - Trong/ngoài định biên: "Ngoài định biên"
 *   - Lý do ngoài định biên: "Phát sinh dự án mới"
 *   - Lý do tuyển: "Tuyển mới"
 *   - Tiêu đề: "Nhân viên kinh doanh" (auto-filled from JD)
 *   - JD: kd-001 (pre-selected)
 *   - Phòng/Ban: Nhân viên Kinh doanh
 *   - Số lượng: 1
 *   - Loại hình: Chính thức
 * - Click: "Lưu"
 * - Result: ✅ Thành công - hiển thị 1 dòng trong bảng
 *
 * ### Step 2: Reload Page
 * - F5 or navigate to same URL
 * - Result: ❌ Empty state - "Chưa có yêu cầu"
 *
 * =============================================================================
 * ## Verification Commands Used
 *
 * ### Start HRM API
 * ```bash
 * cd apps/api && pnpm run start:dev hrm-api
 * ```
 * Port: 28001
 *
 * ### Start HRM Web
 * ```bash
 * cd apps/web/hrm && pnpm dev
 * ```
 * Port: 8080
 *
 * ### Check API Logs
 * - Xem terminal output cho request/response
 * - Tìm log entry với path `/api/hrm/recruitment/job-requisitions`
 *
 * =============================================================================
 * ## Recruitment Data Model
 *
 * ### Lane A: Requisition Flow (Yêu cầu tuyển dụng)
 * job_requisitions
 *   ├── status: draft → pending → approved → cancelled
 *   ├── within_budget: boolean
 *   ├── jd_template_id: FK → job_description_templates
 *
 * ### Lane B: Posting & Application Flow (Tin tuyển dụng)
 * job_postings
 *   ├── requisition_id: FK → job_requisitions
 *   ├── status: draft → open → closed → cancelled
 *
 * candidate_applications
 *   ├── job_posting_id: FK → job_postings
 *   ├── candidate_id: FK → candidates
 *   ├── stage: screening → interview → offer → hired
 *
 * ### Candidates Pool
 * candidates
 *   ├── company_id: FK
 *   ├── full_name, email, phone
 *   └── source: linkedin, referral, website, other
 *
 * =============================================================================
 * ## Technical Flow
 *
 * ### Data Flow khi load YCTD
 * 1. useJobRequisitions hook → call listJobRequisitions()
 * 2. hrmApi.ts → GET /api/hrm/recruitment/job-requisitions?company_id=xxx
 * 3. Backend validates scope (tenant + company)
 * 4. Backend returns list of job_requisitions
 * 5. JobRequisitionsTab renders table
 *
 * ### Data Flow khi create YCTD
 * 1. JobRequisitionDialog → form submit
 * 2. hrmApi.ts → POST /api/hrm/recruitment/job-requisitions
 * 3. Backend validates + saves to DB
 * 4. Frontend shows success + adds to local state
 * 5. Table re-renders with new row
 *
 * =============================================================================
 * ## Known Issues
 *
 * ### Issue #1: Data Not Persisting After Reload
 * - Symptom: YCTD hiển thị sau khi tạo, mất sau reload
 * - Hypothesis: API query scope mismatch OR cache issue
 * - Action needed: Debug network request + check DB records
 *
 * ### Issue #2: Board Tuyển dụng Requires Pipeline Setup
 * - Symptom: "Chưa có giai đoạn pipeline hiệu lực"
 * - Solution: Navigate to Cài đặt → Giai đoạn REC to configure
 *
 * ### Issue #3: Multiple Dialogs Opening
 * - Symptom: Click "Thêm yêu cầu" opens multiple dialogs
 * - Likely cause: Dialog state not properly reset
 *
 * =============================================================================
 * ## Related Skills & Tools
 *
 * - Browser automation via cursor-ide-browser MCP
 * - API testing via node script (test-recruitment-flow.mjs)
 * - Database inspection via Prisma Studio
 *
 * =============================================================================
 * ## Next Investigation Steps
 *
 * 1. **Network Tab Debugging**
 *    - Open DevTools (F12)
 *    - Go to Network tab
 *    - Filter: /api/hrm/recruitment/job-requisitions
 *    - Reload page
 *    - Check Request Headers (tenant_id, company_id)
 *    - Check Response Body
 *
 * 2. **Database Verification**
 *    ```bash
 *    npx prisma studio
 *    # Navigate to job_requisitions table
 *    # Verify records have correct company_id
 *    ```
 *
 * 3. **Scope Resolution Check**
 *    - Check resolveHrmListScope() returns correct companyIds
 *    - Verify tenant_id matches between request and DB records
 *
 * 4. **React Query Cache**
 *    - Check if queryKey includes company_id
 *    - Verify useQuery re-fetches on mount
 *
 * =============================================================================
 * ## Lessons Learned
 *
 * 1. **Browser Automation Testing**
 *    - Use browser tools to test full user flows
 *    - Capture screenshots + snapshots for verification
 *    - Test both create AND reload scenarios
 *
 * 2. **State Persistence Issues**
 *    - Data saving to DB doesn't mean it will load
 *    - Always test after page reload
 *    - Check API request/response for scope issues
 *
 * 3. **Multi-layer Debugging**
 *    - FE: React hooks + state management
 *    - API: Request validation + scope resolution
 *    - DB: Data existence + tenant/company scope
 *
 * 4. **Dialog State Management**
 *    - Ensure dialogs reset properly on close
 *    - Check for duplicate dialog instances
 *
 * =============================================================================
 * ## References
 *
 * - Previous Memory: Internal News Bug (HRM-NEWS-DISPLAY-01)
 * - Related DTO: apps/api/hrm-api/src/recruitment/dto/
 * - Frontend Components: apps/web/hrm/src/components/recruitment/
 *
 * =============================================================================
 */
