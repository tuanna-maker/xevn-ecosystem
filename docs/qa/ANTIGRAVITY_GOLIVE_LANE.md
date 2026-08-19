# QA + Fix Lane — Golive HRM MVP (5 phần còn lại)

> **File này là lane chính thức cho antigravity.**
> PM = Claude (PO/SA/BA). Dev/QA executor = antigravity.
> Không có sub-agent. Làm tuần tự theo thứ tự ưu tiên bên dưới.
> Updated: 2026-08-19

---

## SETUP TRƯỚC KHI LÀM

### Bước 0 — Kiểm tra server

Chạy trong terminal:

    netstat -ano | findstr "LISTENING" | findstr ":8080 :3001 :3002"

- Port 8080 — HRM FE: bắt buộc
- Port 3001 — HRM BE: cần cho phần A / B / C / D
- Port 3002 — XBOS BE: không bắt buộc

Nếu 3001 không chạy → ghi BLOCKED ở phần cần BE, vẫn làm Phần E trước.

### Bước 0b — Auth bypass

KHÔNG mở /hr/register. KHÔNG sửa source code.

Mở browser http://localhost:8080/hr/ → F12 → Console → paste đoạn này:

    const exp = Date.now() + 86400000;
    sessionStorage.setItem('xevn.portal.accessToken', 'mock-qa-golive');
    sessionStorage.setItem('xevn.portal.tokenExpiresAt', String(exp));
    localStorage.setItem('xevn.portal.accessToken', 'mock-qa-golive');
    localStorage.setItem('xevn.portal.tokenExpiresAt', String(exp));
    localStorage.setItem('xevn.portal.user', JSON.stringify({userId:'ceo@xe.vn',displayName:'CEO Test'}));
    sessionStorage.setItem('xevn.portal.user', JSON.stringify({userId:'ceo@xe.vn',displayName:'CEO Test'}));
    localStorage.setItem('hrm_current_company_id','main');

Reload trang. Thấy nav sidebar → bypass OK.

---

## PHẦN A — CONTRACT CREATE QA (P0)

URL: http://localhost:8080/hr/contracts → nút Tạo hợp đồng
Cần BE port 3001.

| TC | Thao tác | Expected |
|----|----------|----------|
| TC-CTR-01 | Bấm Tạo HĐ mới → Bước 1: chọn Nhân viên | Picker NV hiển thị, chọn được từ danh sách |
| TC-CTR-02 | Chọn mẫu HĐ → sang Bước 2 | Danh sách điều khoản hiển thị |
| TC-CTR-03 | Kéo 1 điều khoản → đổi mẫu HĐ | Confirm dialog "Bạn đã kéo điều khoản, đổi mẫu sẽ xóa?" xuất hiện |
| TC-CTR-04 | Hoàn thành wizard → Lưu | HĐ tạo thành công, xuất hiện trong danh sách, F5 vẫn còn |
| TC-CTR-05 | Sửa HĐ vừa tạo | Form hydrate đúng (tên NV, ngày, mẫu, hình thức làm việc) |
| TC-CTR-06 | Tab Xem trước trong wizard | Không crash. Nếu printable=false → banner rõ ràng, không JS error |

Evidence: docs/qa/evidence/qa-ctr-create-wizard-golive-01.md

Nếu TC-CTR-03 FAIL (confirm dialog không xuất hiện):
- Allowed fix: apps/web/hrm/src/components/contracts/ContractCreateWizardDialog.tsx
- Fix: khi clauseOrderDirty=true và user đổi templateId → show confirm trước khi reset clauses
- Sau fix: git diff --stat HEAD -- <file> → paste vào evidence

---

## PHẦN B — PAYROLL e2e Journey (P1)

URL: http://localhost:8080/hr/payroll
Cần BE port 3001. Nếu offline → BLOCKED + ghi lý do, không bỏ evidence.

| Bước | Thao tác | Expected |
|------|----------|----------|
| P1 | Vào Payroll → tab Kỳ lương | Danh sách kỳ lương render (hoặc trống, không crash) |
| P2 | Tạo kỳ lương mới (nếu chưa có) | Form tạo kỳ, chọn tháng/năm → Lưu OK |
| P3 | Tab nhân viên trong kỳ | Danh sách NV enrolled |
| P4 | Chạy tính lương | POST → 200, progress hiển thị |
| P5 | Xem phiếu lương NV | Payslip render đủ dòng (lương cơ bản, phụ cấp, TNCN, BH) |
| P6 | Publish phiếu lương | Status → published |
| P7 | ESS: http://localhost:8080/hr/payslip | Phiếu lương hiển thị cho NV |

U65: Không seed NV hay kỳ lương. Không có data thật → BLOCKED: no data.
Evidence: docs/qa/evidence/qa-payroll-e2e-journey-golive-01.md

---

## PHẦN C — ATTENDANCE Regression Smoke (P1)

URL: http://localhost:8080/hr/attendance

ATT-SMOKE-01 — Luồng chính:

| Bước | Thao tác | Expected |
|------|----------|----------|
| A1 | Vào Attendance → Chấm công | Bảng chấm công tháng hiện tại render |
| A2 | Xem lịch sử một NV | Records hiển thị, không 500 |
| A3 | Tạo yêu cầu nghỉ phép | Form mở được, chọn loại phép từ catalog |
| A4 | Submit yêu cầu | POST thành công, hiện trạng thái pending |
| A5 | Approve yêu cầu (manager view) | Status → approved, số ngày phép trừ đúng |

ATT-SMOKE-02 — Dual SoT leave types:

| Bước | Thao tác | Expected |
|------|----------|----------|
| B1 | Settings → ?tab=att-leave-types | Danh sách loại phép từ SoT đúng |
| B2 | Thử thêm loại phép tại master-data tab | Banner "quản lý tại tab chuyên biệt" — KHÔNG có nút Add |
| B3 | Thêm loại phép tại att-leave-types tab | Form Add + Lưu → row mới xuất hiện |

Evidence: docs/qa/evidence/qa-att-regression-smoke-golive-01.md

---

## PHẦN D — RECRUITMENT UAT (P1)

URL: http://localhost:8080/hr/recruitment

| Bước | Thao tác | Expected |
|------|----------|----------|
| R1 | Tab Vị trí tuyển dụng | Danh sách job postings hiển thị |
| R2 | Tạo vị trí mới | Form: tên, bộ phận, số lượng, JD chọn từ thư viện → Lưu |
| R3 | Xem chi tiết vị trí | JD liên kết hiển thị đúng (không phải ô nhập tay) |
| R4 | Tab Ứng viên | Danh sách ứng viên (hoặc trống — OK) |
| R5 | Thêm ứng viên vào pipeline | Dropdown stage: Mới → Phỏng vấn → Đề xuất → Nhận việc / Từ chối |
| R6 | Chuyển stage ứng viên | API PUT → stage cập nhật, F5 persist |
| R7 | Thuê ứng viên → tạo HĐ | Banner "Tạo hợp đồng" → CTR wizard prefill đúng NV |

Evidence: docs/qa/evidence/qa-rec-pipeline-golive-01.md

---

## PHẦN E — MENU SWEEP (P2) — làm được dù BE offline

Navigate từng URL, xác nhận render không crash / blank.
Ghi mỗi dòng: OK / CRASH / API-ERROR (lỗi hiển thị nhưng không crash).

| # | URL | Label |
|---|-----|-------|
| 1 | /hr/ | Dashboard |
| 2 | /hr/employees | Nhân sự |
| 3 | /hr/contracts | Hợp đồng |
| 4 | /hr/attendance | Chấm công |
| 5 | /hr/payroll | Lương |
| 6 | /hr/recruitment | Tuyển dụng |
| 7 | /hr/insurance | Bảo hiểm |
| 8 | /hr/decisions | Quyết định |
| 9 | /hr/fleet | Phương tiện |
| 10 | /hr/settings?tab=account | Settings — Tài khoản |
| 11 | /hr/settings?tab=branding | Settings — Thương hiệu |
| 12 | /hr/settings?tab=master-data | Settings — Danh mục nghiệp vụ |
| 13 | /hr/settings?tab=contract-clauses | Settings — Điều khoản HĐ |
| 14 | /hr/settings?tab=att-leave-types | Settings — Loại phép |
| 15 | /hr/settings?tab=jd-master-library | Settings — Thư viện JD |
| 16 | /hr/settings?tab=rec-pipeline-stages | Settings — Pipeline tuyển dụng |
| 17 | /hr/settings?tab=settings-defaults | Settings — Mặc định thuế/BH/PC |

Evidence: docs/qa/evidence/qa-menu-sweep-golive-01.md

---

## LUẬT BẮT BUỘC

| # | Luật |
|---|------|
| U65 | Không seed DB. Không tạo NV/data giả. Không có data thật → BLOCKED. |
| No-src-change | Không sửa source code trừ khi bug rõ ràng từ TC fail. |
| Auth bypass | Chỉ DevTools Console inject. KHÔNG sửa App.tsx hay bất kỳ source file nào. |
| git-diff | Sau mỗi code change: git diff --stat HEAD -- <file> → paste vào evidence. Không báo "đã sửa" nếu chưa có diff. |
| No mojibake | Test fail vì encoding sai → báo FAIL, không sửa assertion để khớp output lỗi. |
| Forbidden | apps/web/x-bos-core/** · apps/api/hrm-api/src/payroll/** · apps/api/hrm-api/src/contracts-insurance/** · apps/web/hrm/src/components/payroll/policy-pack/** |
| Evidence | Ghi evidence cho từng phần dù PASS / FAIL / BLOCKED. |

---

## THỨ TỰ THỰC HIỆN

1. E — Menu sweep (làm ngay, không cần BE)
2. A — CTR Create (cần BE 3001)
3. D — Recruitment UAT (cần BE 3001)
4. C — ATT smoke (cần BE 3001)
5. B — Payroll e2e (cần BE 3001 + data kỳ lương)

---

## FORMAT BÁO CÁO VỀ PM

Sau mỗi phần, append vào docs/program/AGENT_MESSAGE_BUS.md:

    [2026-08-19 antigravity] GOLIVE-<PART>
    - ack_status: PASS_TO_PM | FAIL_TO_PM | PASS_WITH_HOLD | BLOCKED
    - evidence: docs/qa/evidence/<file>.md
    - bugs/blockers: <mô tả nếu có>
