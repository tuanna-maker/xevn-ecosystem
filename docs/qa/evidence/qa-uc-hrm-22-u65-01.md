# Evidence — QA-UC-HRM-22-U65-01 (U65 browser thật — RETRY)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-UC-HRM-22-U65-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-13 |
| **lane** | execution · qa (U65 browser thật, no seed) |
| **uc_id** | `UC-HRM-22` — Embed — Tuyển dụng |
| **retry_note** | Lần trước bị dừng giữa chừng do sponsor tắt máy (không phải lỗi nội dung). Lần này chạy lại full 15 case từ đầu, session mới sạch. |
| **U65** | honored — zero-seed, dùng dữ liệu thật sẵn có trên `/hr/recruitment` (company_id=main/holding), tạo thêm 2 record qua chính UI khi cần test mutate |
| **persona** | ceo@xe.vn / Xevn@2026 (member du-lich.ceo@xe.vn — login FAIL, xem mục 4) |
| **env** | hrm-fe :8080 (dev vite, /hr/ base) · hrm-api :28001 (proxy /api/hrm) — cả hai đã chạy sẵn trước khi qa vào, không tự start/kill |
| **ack_status** | **FAIL_TO_PM** |

---

## 1. Tiền kiểm

- netstat xác nhận :8080 (PID 25504) và :28001 (PID 4476) đã LISTENING trước khi bắt đầu — không tự start thêm.
- Browser pane (Claude_Browser) mở http://localhost:8080/hr/recruitment — phiên trình duyệt đã có sẵn session ceo@xe.vn (localStorage xevn.portal.user = userId ceo@xe.vn, hrm_current_company_id=main, hrm_current_tenant_id=xevn) từ trước — xác nhận persona đúng, không cần đăng nhập lại cho case đầu.
- **Giới hạn công cụ:** computer screenshot timeout ("Browser pane is not displayed, so the page is not compositing frames") trong suốt phiên — không chụp được ảnh màn hình. Đã bù bằng get_page_text + read_page (accessibility tree) + read_network_requests (status code thật) + read_console_messages (lỗi JS thật) + truy vấn fetch() trực tiếp qua javascript_tool bằng đúng token trong localStorage của phiên đang đăng nhập (không phải seed, không phải giả lập — cùng token phiên trình duyệt thật). Click UI dùng element.click() / dispatch pointerdown+mousedown+pointerup+mouseup+click qua javascript_tool khi Radix Tabs cần full pointer sequence (native .click() không đủ trigger Radix role=tab).

---

## 2. Log theo thời gian (giờ VN, 2026-08-13)

| Giờ | Hành động | Kết quả |
|-----|-----------|---------|
| 09:36 | Đọc UC-HRM-22.md, evidence BE audit, evidence rollup W4-E4 cũ | Xong |
| 09:37 | Xác nhận server :8080/:28001 LISTENING | OK |
| 09:38 | Mở /hr/recruitment, xác nhận session ceo@xe.vn qua localStorage | TC-OPEN-HP-001 PASS |
| 09:38 | read_network_requests: dashboard/job-templates/pipeline-stages/candidates-pool/recruitment-plans đều 200 OK | TC-MAIN-HP-002 PASS |
| 09:39 | Click tab "Yêu cầu tuyển dụng" → list 8 dòng, nhiều trạng thái (Nháp/Mở nhận hồ sơ/Chờ duyệt QT/Đã duyệt) | data bind thật |
| 09:40 | Mở dialog "Thêm yêu cầu" → để trống "Lý do ngoài định biên *" (field khác đã có default) → bấm "Lưu yêu cầu" | POST 201 Created (không bị chặn) |
| 09:41 | fetch GET requisition mới nhất bằng token phiên → out_of_plan_reason: null | Xác nhận field required (*) trên UI không được enforce |
| 09:42 | F5 reload /hr/recruitment → vào lại tab Yêu cầu tuyển dụng | Record rác vẫn còn (persist thật, không phải optimistic UI) → TC-VAL-FD-001 FAIL |
| 09:43 | Click "Sửa" trên dòng RECCHQA-MSNJEXWE (status Đã duyệt) | App crash toàn trang — root innerHTML rỗng (0 ký tự), console báo lỗi TypeError destructure getFieldState của useFormContext null, xảy ra tại FormLabel trong JobRequisitionsTab.tsx dòng 176 |
| 09:44 | Reload, lặp lại "Sửa" trên dòng Mở nhận hồ sơ (RECCHQA-MSNJV0SR) | Crash y hệt |
| 09:45 | Reload, lặp lại "Sửa" trên dòng Nháp (bất kỳ) | Crash y hệt → xác nhận 100% deterministic, mọi trạng thái, không riêng "illegal state" |
| 09:46 | Reload, click "Chi tiết" trên dòng Đã duyệt | Dialog chi tiết mở đúng, đọc được Lý do ngoài ĐB: Phát sinh nhu cầu tuyển dụng, không crash → TC-DETAIL-HP-003 PASS, cũng dùng lại cho TC-J-HP-005 |
| 09:47 | read_network_requests xác nhận GET requisitions/:id?company_id=holding → 200 khi mở Chi tiết | API thật, không mock |
| 09:47 | Thử login du-lich.ceo@xe.vn / Xevn@2026 tại /hr/login (hrm-fe standalone) | "Đăng nhập thất bại — Email hoặc mật khẩu không đúng" — không login được ở surface này (xem mục 4) |
| 09:47 | Login lại ceo@xe.vn / Xevn@2026 — khôi phục session | OK, vào Dashboard tổng quan HRM |
| 09:48 | fetch GET requisitions với company_id=nonexistent-co-xyz (token ceo@xe.vn thật) | 409 SCOPE_CONTEXT_MISMATCH — companyId mismatches token scope, không lộ data |
| 09:48 | fetch GET requisitions với header X-Tenant-ID=other-tenant-xyz | 409 SCOPE_CONTEXT_MISMATCH — tenantId mismatches token scope → TC-SCOPE-AU-001 PASS |
| 09:48 | Click tab "Board tuyển dụng" (Radix tab, cần dispatch full pointer sequence) | Load board pipeline-stage thật, GET pipeline-stages/effective → 200, không crash → TC-TAB-HP-004 PASS |
| 09:48 | Reload /hr/recruitment, xác nhận root re-render đầy đủ (66013 ký tự), dữ liệu còn nguyên | TC-TAB-UX-003 PASS |
| 09:48 | Mở dialog "Thêm yêu cầu", điền Lý do ngoài định biên, set Số lượng = 0 (native setter + input event), bấm Lưu | Không có POST bắn ra (network log không có request mới), dialog giữ nguyên giá trị đã điền → validate client chặn boundary 0 đúng. Kết hợp bằng chứng Số lượng=1 đã accept ở case trước → TC-VAL-BD-001 PASS |
| 09:48 | Click tab "Đề xuất" (Proposals — tab hợp lệ có 0 dữ liệu) | "Chưa có dữ liệu" hiển thị sạch, không spinner treo, không lỗi → TC-MAIN-UX-001 PASS |
| 09:48 | Đọc source JobRequisitionsTab.tsx để xác nhận root cause crash | Xem mục 3 |
| 09:48 | Đọc create-job-requisition.dto.ts xác nhận out_of_plan_reason | @IsOptional() — không có validate required tại BE dù UI ghi * |

---

## 3. Root cause (đã đọc code — KHÔNG sửa)

### 3.1 TC-HRM-22-VAL-FD-002 — App crash khi bấm "Sửa" (mọi trạng thái) — P0

File: apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx

- Dialog **Tạo** (dòng 1730–2160) bọc đúng bằng react-hook-form FormProvider (Form createForm ... /Form), nên mọi FormLabel bên trong hoạt động bình thường.
- Dialog **Sửa** (Dialog open editRow != null, dòng 2164 trở đi) dùng lại y hệt component FormLabel (dòng 2183, 2200, 2228, 2240, 2257, 2268, 2290 …) nhưng KHÔNG có Form bao ngoài — editRow/editMode/editCellId… là state thường (useState), không phải react-hook-form.
- FormLabel (shadcn ui/form.tsx dòng 103) gọi nội bộ useFormField -> useFormContext; khi không có FormProvider bao ngoài, useFormContext trả về null -> destructure getFieldState từ null -> TypeError -> không có Error Boundary trong cây (App.tsx) -> React unmount toàn bộ #root.
- Tái hiện 100%, mọi trạng thái (Nháp / Mở nhận hồ sơ / Đã duyệt) vì lỗi xảy ra ngay khi dialog Sửa mở (render), trước khi chạm tới business logic trạng thái nào.
- Không liên quan đến nghi vấn "Sửa hợp đồng đã duyệt" ở lần seat trước (đó là entity Hợp đồng / ContractsTab, đã re-test không tái hiện — false alarm riêng). Đây là bug khác, entity Yêu cầu tuyển dụng (JobRequisitionsTab), tái hiện chắc chắn trong session sạch, 3/3 lần thử.

### 3.2 TC-HRM-22-VAL-FD-001 — Required field không được enforce

- FE label ghi "Lý do ngoài định biên *" (bắt buộc) nhưng submit vẫn qua khi để trống.
- BE: apps/api/hrm-api/src/recruitment/dto/create-job-requisition.dto.ts dòng 102-105: out_of_plan_reason chỉ có IsOptional + IsString + MaxLength(2000) — không có validate "required-khi-headcount_mode=out_of_plan" (conditional required thiếu ở cả 2 lớp FE+BE).

---

## 4. Ghi chú AU member (không kết luận PASS hay FAIL — DEFERRED)

- Login du-lich.ceo@xe.vn / Xevn@2026 tại http://localhost:8080/hr/login (hrm-fe standalone) trả về "Đăng nhập thất bại — Email hoặc mật khẩu không đúng".
- Dispatch packet chỉ cấp credential ceo@xe.vn; mật khẩu du-lich.ceo@xe.vn lấy tham chiếu từ evidence cũ (bm-fe-role-switch-01-20260722.md …) — các evidence đó test qua portal :8088 / :5173 (membership switcher), không phải hrm-fe standalone :8080. Portal :8088 không chạy trong phiên này; :5173 có chạy nhưng là app khác (XeVN OS Command Center) và chưa có session — cần login riêng ngoài phạm vi dispatch (không tự tạo phiên portal mới không được giao).
- Không kết luận đây là bug (có thể do kiến trúc: member chỉ auth qua portal SSO, không qua hrm-fe login trực tiếp) — cần PM/BA xác nhận lại thiết kế trước khi coi là FAIL.
- -> TC-HRM-22-SCOPE-AU-002, TC-HRM-22-SCOPE-AU-003: DEFERRED (không có persona thứ 2 khả dụng trong phạm vi dispatch này).

---

## 5. Case matrix (15/15)

| TC-ID | Type | Pri | Result | Ghi chú |
|-------|------|-----|--------|---------|
| TC-HRM-22-OPEN-HP-001 | HP | P0 | PASS | Session ceo@xe.vn land đúng /hr/recruitment, không banner lỗi |
| TC-HRM-22-MAIN-HP-002 | HP | P0 | PASS | dashboard/job-templates/pipeline-stages/candidates-pool/recruitment-plans đều 200, FE bind data thật |
| TC-HRM-22-VAL-FD-001 | FD | P0 | FAIL | out_of_plan_reason bắt buộc (*) trên UI nhưng POST 201 thành công khi để trống, persist qua F5. Root cause muc 3.2 |
| TC-HRM-22-VAL-FD-002 | FD | P1 | FAIL (P0 nghiêm trọng hơn spec) | Kỳ vọng "4xx deterministic", thực tế app crash trắng trang khi bấm Sửa — mọi trạng thái, tái hiện 3/3 lần. Root cause muc 3.1 |
| TC-HRM-22-SCOPE-AU-001 | AU | P0 | PASS | company_id sai → 409 SCOPE_CONTEXT_MISMATCH; tenant sai → 409 tương tự. Không lộ data |
| TC-HRM-22-SCOPE-AU-002 | AU | P1 | DEFERRED | Không có persona role khác trong phạm vi dispatch — xem muc 4 |
| TC-HRM-22-MAIN-UX-001 | UX | P1 | PASS | Tab "Đề xuất" 0 data → "Chưa có dữ liệu" sạch, không spinner treo |
| TC-HRM-22-MAIN-UX-002 | UX | P1 | DEFERRED | Cần ép hrm-api trả 500 — không an toàn để tự kill/hỏng server dùng chung (:28001 đang chạy cho các phiên khác); không giả lập giả |
| TC-HRM-22-DETAIL-HP-003 | HP | P1 | PASS | "Chi tiết" trên dòng Đã duyệt mở đúng, GET requisitions/:id → 200, không crash |
| TC-HRM-22-VAL-BD-001 | BD | P1 | PASS | Số lượng=0 → chặn client, không POST, giữ dialog; Số lượng=1 đã accept (case FD-001) |
| TC-HRM-22-TAB-HP-004 | HP | P0 | PASS | Tab "Board tuyển dụng" load pipeline-stages/effective → 200, không lỗi |
| TC-HRM-22-J-HP-005 | HP | P0 | PASS | List→Chi tiết: GET requisitions/:id?company_id=holding → 200 (API xác nhận; UI dùng dialog không đổi URL — không phải deep-link riêng, nhưng path nghiệp vụ đúng) |
| TC-HRM-22-TAB-FD-003 | FD | P0 | DEFERRED | Cần tắt hrm-api :28001 — server dùng chung, không tự kill theo chỉ dẫn dispatch |
| TC-HRM-22-SCOPE-AU-003 | AU | P0 | DEFERRED | Không có persona member khả dụng trên surface :8080 — xem muc 4 |
| TC-HRM-22-TAB-UX-003 | UX | P1 | PASS | F5 reload /hr/recruitment → data còn nguyên, #root re-render đầy đủ |

**Tổng:** 9 PASS / 2 FAIL / 4 DEFERRED / 15

---

## 6. uat_done

Không cập nhật uat_done trong UC-HRM-22.md — còn 2 FAIL thật (1 P0 crash) + 4 DEFERRED, không đủ điều kiện "tất cả case PASS". Giữ nguyên uat_done: false.

---

## 7. Residuals / dispatch hint

| ID | Sev | Note | Owner đề xuất |
|----|-----|------|----------------|
| R-QA-HRM22-EDIT-CRASH | P0 | JobRequisitionsTab.tsx dialog Sửa thiếu Form bao FormLabel → crash toàn app, mọi trạng thái. File+dòng ở muc 3.1 | dev-fe |
| R-QA-HRM22-VAL-GAP | P1 | out_of_plan_reason UI ghi required nhưng FE+BE đều không enforce (DTO IsOptional) | dev-be + dev-fe |
| R-QA-HRM22-AU-MEMBER | P2 | Member du-lich.ceo@xe.vn không login được ở hrm-fe standalone :8080/hr/login — cần xác nhận đây là thiết kế (chỉ auth qua portal SSO) hay bug, trước khi test lại AU-002/003 | ba-process / pm xác nhận trước |
| R-QA-HRM22-INFRA-500 | P2 | TAB-FD-003 / MAIN-UX-002 cần môi trường có thể ép lỗi 500/API-down mà không đụng server dùng chung — đề xuất môi trường QA riêng hoặc feature flag lỗi giả lập phía BE (không phải seed DB) | devops/pm |
| dữ liệu rác | - | 2 record test tạo ra khi chạy VAL-FD-001/BD-001 (title QA JD master JDSETMUT-MSNHWI0A, headcount_mode=out_of_plan, out_of_plan_reason một cái null một cái QA BD-001…) vẫn còn trên company_id=holding/main — không xoá theo U65 (không seed/xoá DB); cần dev/ops dọn nếu ảnh hưởng demo | pm quyết định |

---

## 8. Handoff

```
ack_status: FAIL_TO_PM
work_item_id: QA-UC-HRM-22-U65-01
uc_id: UC-HRM-22
cases_total: 15
cases_pass: 9
cases_fail: 2
cases_deferred: 4
uat_done: false (unchanged)
seed_used: false
critical_finding: R-QA-HRM22-EDIT-CRASH (P0, app crash - Sua yeu cau tuyen dung moi trang thai)
next_owner: pm to dev-fe (crash) / dev-be+dev-fe (validation gap) / ba-process (AU member login xac nhan thiet ke)
evidence_path: docs/qa/evidence/qa-uc-hrm-22-u65-01.md
```
