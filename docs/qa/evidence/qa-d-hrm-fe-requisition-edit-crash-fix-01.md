# Evidence — QA-D-HRM-FE-REQUISITION-EDIT-CRASH-FIX-01 (browser thật, xác nhận cuối)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-D-HRM-FE-REQUISITION-EDIT-CRASH-FIX-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-13 |
| **source** | D-HRM-FE-REQUISITION-EDIT-CRASH-FIX-01 (dev-fe, READY_FOR_QA) — fix `<FormLabel>` -> `<Label>` trong dialog Sua, `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` |
| **U65** | honored — zero-seed, dung 2 ban ghi that co san (RECCHQA-MSNJV0SR, RECCHQA-MSNJEXWE) tao boi cac phien QA truoc, khong tao ban ghi rac moi |
| **persona** | ceo@xe.vn (session da co san tu truoc, khong can login lai — xac nhan qua localStorage xevn.portal.user) |
| **env** | hrm-fe :8080 (PID 25504) · hrm-api :28001 (PID 4476) — ca hai da LISTENING truoc khi qa vao, khong tu start/kill (netstat xac nhan) |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Tien kiem

- `netstat -ano | grep LISTENING | grep -E ":8080|:5173|:28001|:28002"` — ca 4 port dang LISTENING (8080/5173/28001/28002), dung PID nhu evidence truoc, khong tu start server moi.
- Browser pane (mcp__Claude_Browser) tab moi (tab-3), khong dinh console history cu.
- **Han che cong cu (da biet tu truoc):** computer/read_page tra ve viewport 0x0 / empty page trong moi truong nay (Browser pane khong compositing frame duoc). Da bu bang javascript_tool (doc/thao tac DOM truc tiep qua querySelector + click/dispatch event) + get_page_text + read_console_messages + read_network_requests, giong dung cach 2 evidence truoc da dung.

## 2. Log theo thoi gian (gio VN, 2026-08-13)

| Buoc | Hanh dong | Ket qua |
|------|-----------|---------|
| 1 | Doc qa-uc-hrm-22-u65-01.md + d-hrm-fe-requisition-edit-crash-fix-01.md | Xong, xac dinh 2 record can re-test: RECCHQA-MSNJV0SR (open_for_hire) + RECCHQA-MSNJEXWE (approved) |
| 2 | netstat xac nhan 8080/28001 LISTENING | OK, khong tu start |
| 3 | preview_start http://localhost:8080/hr/recruitment (tab-3 moi) | Load thanh cong, session ceo@xe.vn co san (localStorage: userId=ceo@xe.vn, company=main, tenant=xevn) |
| 4 | Click nut sidebar "Yeu cau tuyen dung" qua javascript_tool (button.click(), khong phai Radix tab) | List 8 dong load dung (bao gom ca 2 record muc tieu) |
| 5 | Tim dong RECCHQA-MSNJV0SR, click "Sua" qua DOM (button.click()) | Dialog "Sua yeu cau tuyen dung" mo, dialogCount=1, rootChildCount=6, rootTextLen=2455. Doc day du field: Trong/ngoai DB *, Ly do ngoai DB *, Ly do tuyen, Ngach/bac, So luong * — dung du lieu dong (RECCHQA-MSNJV0SR, "Ngoai dinh bien", "Phat sinh nhu cau tuyen dung") |
| 6 | read_console_messages sau khi mo dialog | Chi 2x loi 404 (asset khong lien quan, giong evidence dev-fe) — KHONG co TypeError getFieldState/useFormContext |
| 7 | Sua field So luong: 1 -> 2 (native setter + input/change event), click "Luu thay doi" | PATCH .../requisitions/{id}?company_id=holding -> **409 Conflict**. Dialog KHONG crash (dialogCount van =1, rootChildCount=6, text preview con nguyen) — xem muc 3 ve nguyen nhan 409 nay |
| 8 | Click "Huy" dong dialog | Dong sach |
| 9 | Tim dong RECCHQA-MSNJEXWE (Da duyet), click "Sua" | Dialog mo dung lan 2: dialogCount=1, rootChildCount=6, rootTextLen=2542, dung du lieu dong (RECCHQA-MSNJEXWE) |
| 10 | read_console_messages sau khi mo dialog lan 2 | Van chi 404 (asset) + 1x 409 cu (residual tu buoc 7) — KHONG co TypeError moi, KHONG co loi getFieldState/useFormContext |
| 11 | Click "Huy" dong dialog | Dong sach |
| 12 | F5 reload (navigate lai URL) + click lai "Yeu cau tuyen dung" | App khong crash, #root render lai day du, list 8 dong load lai dung (bao gom ca 2 record muc tieu, gia tri So luong cua RECCHQA-MSNJV0SR van la 1 — dung vi PATCH buoc 7 that bai 409 nen khong doi, khong phai loi persist) |

## 3. Ket qua doi voi P0 crash fix (trong tam work item)

**PASS** — Da xac nhan song 2/2 trang thai (open_for_hire + approved), dialog Sua mo binh thuong ca 2 lan, khong trang man hinh, khong unmount `#root`, khong xuat hien loi `TypeError: Cannot destructure property 'getFieldState' of 'useFormContext(...)' as it is null` trong console — dung loi goc QA da bao trong qa-uc-hrm-22-u65-01.md muc 3.1. Fix `FormLabel` -> `Label` cua dev-fe dung nhu bao cao.

## 4. Phat hien moi — KHONG thuoc scope fix nay (khong chan PASS)

Khi thu Luu thay doi (buoc 7), PATCH tra ve `409 Conflict` (khong phai crash) vi `editRow.company_id` cua ban ghi RECCHQA-MSNJV0SR la `holding` (da doc code `resolveRequisitionMutateCompanyId` — uu tien company_id goc cua record) trong khi session hien tai dang active `company_id=main` (JWT scope check BE tra 409 SCOPE_CONTEXT_MISMATCH, dung co che da thay o TC-HRM-22-SCOPE-AU-001 truoc). Day la **van de scope/company-context rieng, khong lien quan toi bug FormLabel/Label dang fix** — khong sua, khong PASS/FAIL cho work item nay, chi ghi nhan de PM/BA quyet dinh co can dispatch rieng khong (vi du: UI edit dialog nen tu dong chuyen company context ve dung company cua record truoc khi cho sua, hoac canh bao ro rang cho user thay vi de PATCH 409 am tham). Quan trong: **du 409, dialog van khong crash** — cung la mot bang chung gian tiep app on dinh hon truoc (truoc day moi lan mo dialog Sua la crash ngay, gio ca truong hop loi nghiep vu cung khong lam sap UI).

Vi 409 nay, khong xac nhan duoc persist qua F5 cho gia tri So luong moi (khong doi duoc do PATCH khong thanh cong) — day KHONG phai loi cua fix dang QA, la gioi han cua du lieu test san co (record thuoc company khac session). Khong tu tao ban ghi moi / khong tu doi company context de ep test (ngoai pham vi dispatch, tranh side-effect khong xin phep).

## 5. Case matrix

| TC-ID | Result | Ghi chu |
|-------|--------|---------|
| TC-QA-EDIT-CRASH-001 | PASS | Sua RECCHQA-MSNJV0SR (open_for_hire) — dialog mo sach, khong crash, khong loi getFieldState |
| TC-QA-EDIT-CRASH-002 | PASS | Sua RECCHQA-MSNJEXWE (approved) — dialog mo sach lan 2, khong crash |
| TC-QA-EDIT-CRASH-003 | PASS | F5 reload sau ca 2 lan mo dialog — app khong sap, list load lai day du |
| TC-QA-EDIT-SAVE-PERSIST-004 | DEFERRED | PATCH that bai 409 do scope company khac (van de rieng, xem muc 4) — khong xac nhan duoc persist qua UI save that, nhung KHONG phai regression cua fix nay |

## 6. Ket luan

ack_status: **PASS_TO_PM**
Ly do: P0 crash "bam Sua tren Yeu cau tuyen dung -> trang man hinh" da het, xac nhan song browser that tren ca 2 trang thai QA yeu cau test (open_for_hire, approved), khong con loi getFieldState/useFormContext. Fix dev-fe dung scope, khong pha thu gi khac (dialog Tao van dung Form provider, khong bi anh huong).
Ghi chu rieng: co 1 phat hien moi ngoai scope (409 SCOPE_CONTEXT_MISMATCH khi Luu voi record khac company session) — de nghi PM tao work item rieng neu can, khong lien quan va khong chan PASS cua work item nay.
