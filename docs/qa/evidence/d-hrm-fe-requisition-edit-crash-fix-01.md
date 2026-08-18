# Evidence — D-HRM-FE-REQUISITION-EDIT-CRASH-FIX-01 (P0 crash fix, dev-fe)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-FE-REQUISITION-EDIT-CRASH-FIX-01` |
| **from_role** | `dev-fe` |
| **to_role** | `pm` / `qa` |
| **date** | 2026-08-13 |
| **source** | QA P0 finding `R-QA-HRM22-EDIT-CRASH` — docs/qa/evidence/qa-uc-hrm-22-u65-01.md muc 3.1 |
| **ack_status** | **READY_FOR_QA** |

---

## 1. File sua

- `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx`
  - Them `import { Label } from '@/components/ui/label';`
  - Dialog **Sua** (`Dialog open={editRow != null}...`, dung state thuong `editRow/editMode/editCellId/editOutReason/editHireReason/editReplaceEmployeeId/editJobGradeKey/editHeadcount/editStatus`, KHONG phai react-hook-form) - doi 7 cho dung `<FormLabel>` sang `<Label>` (component thuong tu `@/components/ui/label`, khong phu thuoc `useFormContext`):
    - "Trong / ngoai dinh bien *"
    - YCTD_CELL_PICKER_LABEL_VI (label o Can tuyen)
    - "Ly do ngoai DB *" (`htmlFor="edit-out-reason"`)
    - "Ly do tuyen"
    - "NV thay the *"
    - "Ngach/bac"
    - "So luong *" (`htmlFor="edit-requisition-headcount"`)
  - Dialog **Tao** (`<Form {...createForm}>` ~dong 1748-2161, react-hook-form that) - **KHONG dung**, van dung `FormLabel` ben trong `Form` Provider nhu cu.
  - `@CODE-MEMORY-CHANGE 2026-08-13 D-HRM-FE-REQUISITION-EDIT-CRASH-FIX-01` da ghi o dau file.

- Test moi: `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.edit-dialog-crash-fix.source.test.ts`
  - Theo dung pattern `*.source.test.ts` co san trong cung thu muc (doc source nhu text, assert). Ly do khong dung render test @testing-library/react nhu dispatch goi y: apps/web/hrm/vite.config.ts test.include chi khop "src/**/*.test.ts" (khong co .test.tsx); @testing-library/react KHONG phai dependency cua package apps/web/hrm (chi co o apps/web/web-portal, hoisted len root node_modules mot cach tinh co) - file .test.tsx duy nhat tung co trong repo (EmployeeSkillsRadarChart.test.tsx) xac nhan khong duoc vitest chay (No test files found khi target truc tiep). Day la gioi han ha tang test co san cua workspace nay, khong phai do toi tao ra - khong tu y doi vite.config.ts (ngoai pham vi dispatch, anh huong toan workspace). Bang chung khong crash that den tu muc 3 (browser that) - la nguon xac nhan chinh thuc theo dispatch, test source-lock chi la regression guard cho lan sau.
  - 5 test: Label imported; edit dialog 0 FormLabel; edit dialog co dung 7 Label cho dung field; edit dialog khong co Form Provider (dung thiet ke state thuong); REGRESSION GUARD dialog Tao van con Form createForm + FormLabel (khong bi dung nham).

---

## 2. vitest truoc/sau

BEFORE (baseline, code cu, truoc khi sua):
 Test Files  12 passed (12)
      Tests  64 passed (64)

AFTER (sau khi sua + them test moi):
 Test Files  13 passed (13)
      Tests  69 passed (69)

Lenh: cd apps/web/hrm && pnpm exec vitest run src/components/recruitment --no-coverage
Khong co test nao fail hay bi skip ngoai y muon. +1 file, +5 test (test moi), 0 regression tren 12 file cu.

---

## 3. Browser verify that (server san co :8080/:28001, khong tu start)

- Tab trinh duyet MOI sach (tab-2, khong dinh console history cu) - http://localhost:8080/hr/recruitment - session ceo@xe.vn co san tu truoc (khong tu login lai).
- Baseline console (onlyErrors) ngay sau khi vao trang: chi 1 loi 404 xevn-logo.png (asset thieu, khong lien quan bug nay).
- Click tab "Yeu cau tuyen dung" (dispatch .click() - nut thuong, khong phai Radix tab role nen khong can full pointer sequence) - list 8 dong load dung.
- Click "Sua" tren dong YCTD QA RECCHQA-MSNJEXWE (trang thai Da duyet - dung dong QA dung de tai hien crash lan truoc):
  - document.querySelectorAll(role=dialog) - 1 dialog, title: Sua yeu cau tuyen dung.
  - dialogTextPreview: "Sua yeu cau tuyen dung Phan loai trong/ngoai DB (O4) + so luong - cam nhay open_for_hire bang PATCH. YCTD QA RECCHQA-MSNJEXWE Trong / ngoai dinh bien * Ngoai dinh bien Ly do ngoai DB * Phat sinh nhu cau tuyen dung Ly do tuyen Tuyen moi Ngach/bac Chon ngach bac So luong * Huy Luu thay doi Close" - TAT CA label (da doi tu FormLabel sang Label) render day du, dung data (Ngoai dinh bien / ly do Phat sinh nhu cau tuyen dung).
  - #root DOM: rootChildCount 6, rootTextLen 2455 - KHONG rong (khac han bao cao QA cu "root innerHTML rong - 0 ky tu").
  - Console errors sau click: chi con 2x 404 xevn-logo.png - KHONG co TypeError Cannot destructure property getFieldState of useFormContext as it is null (loi goc QA bao).
- Dong dialog (nut Huy), click "Sua" tren dong YCTD QA RECCHQA-MSNJV0SR (trang thai Mo nhan ho so - trang thai khac QA cung test):
  - Dialog mo lai dung, dialogCount 1, title dung, day du field + data dung dong (RECCHQA-MSNJV0SR, "Dang tuyen" o So luong), rootChildCount 6 - khong crash lan 2.
- Ket luan: Crash P0 da het, tai hien dung kich ban QA (2/2 trang thai thu lai: Da duyet + Mo nhan ho so), dialog Sua hoat dong binh thuong, du lieu bind dung.
- Ghi chu cong cu: computer screenshot timeout (Browser pane is not displayed) giong han che QA tung gap - verify bang get_page_text + javascript_tool (doc DOM role=dialog, #root) + read_console_messages + read_network_requests, khong dung anh chup man hinh. Phat hien them: tab trinh duyet cu (tab-1, da mo tu truoc) giu console history ton dong tu phien truoc (ke ca loi crash cu) khong tu xoa qua soft-navigate - vi vay phai mo tab MOI sach (tab-2) de co baseline console dang tin cay truoc khi verify.

---

## 4. P1 - out_of_plan_reason required - KHONG sua (de PM/BA quyet dinh)

Da doc ky apps/api/hrm-api/src/recruitment/dto/create-job-requisition.dto.ts + apps/api/hrm-api/src/recruitment/recruitment.service.ts truoc khi quyet dinh khong sua:

- DTO co comment san: "Required when out_of_plan on submit; optional on draft." - day la thiet ke co chu dich, khong phai thieu sot.
- recruitment.service.ts co validateYctdFieldsOrThrow (opts bao gom requireComplete) - chi khi requireComplete la true (tai Gui duyet QT / submit workflow, khong phai luc Luu nhap/create) moi goi requireOutOfPlanReasonOrThrow (dong ~1360) de chan thieu ly do. Gate message that: yctd-requisition-gates.ts dong 502 - out_of_plan_reason bat buoc khi headcount_mode=out_of_plan.
- Lich su CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-REC-YCTD-CREATE-BLOCKER-01 trong chinh file DTO xac nhan: DTO tung bi doi nguoc lai (tu required sang optional o create) vi U65 POST bi chan khi FE zod yeu cau field nay o buoc Luu nhap trong khi BE draft von optional (residual Y-S7). Neu them IsNotEmpty hoac ValidateIf vao DTO bay gio, nhieu kha nang tai phat dung loi Y-S7 da fix truoc do (chan luu nhap).
- Vay: case QA TC-HRM-22-VAL-FD-001 (POST 201 khi de trong ly do o dialog Tao, dung field out_of_plan_reason) dung la hanh vi draft-save theo thiet ke - validate that da co, nhung chi chay o buoc Gui duyet QT, khong phai o Luu yeu cau (tao nhap).
- Viec con lai khong phai them validator thieu ma la quyet dinh UX: label dau * tren dialog Tao (dong ~1820, FormLabel Ly do ngoai dinh bien *) co dang gay hieu nham la bat buoc ngay luc luu nhap khong, hay giu nguyen (da dung y do: bat buoc truoc khi Gui duyet QT, khong bat buoc luc Luu nhap)? Can PM/BA xac nhan thiet ke truoc khi bat ky ai dung toi DTO nay.
- KHONG sua BE trong dispatch nay de tranh risk pha lai U65 draft-save flow. De xuat PM dispatch rieng (ba-process xac nhan UX truoc, roi moi quyet co sua label hay sua them gate o dau).
- Khong chay jest src/recruitment vi khong co thay doi BE nao (giu nguyen theo dispatch: baseline truoc/sau chi ap dung neu sua P1).

---

## 5. NFD path verify

Da xac nhan ca 3 file ton tai dung trong duong dan canonical NFD (Tai lieu) qua lenh ls -la (xem log dispatch, cac lenh ls chay sau khi tao file).

## 6. Khong commit git - dung theo dispatch.

## 7. Handoff

ack_status: READY_FOR_QA
work_item_id: D-HRM-FE-REQUISITION-EDIT-CRASH-FIX-01
files_changed:
  - apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx
  - apps/web/hrm/src/components/recruitment/JobRequisitionsTab.edit-dialog-crash-fix.source.test.ts (new)
  - docs/qa/evidence/d-hrm-fe-requisition-edit-crash-fix-01.md (new, this file)
vitest_before: 12 files / 64 tests passed
vitest_after: 13 files / 69 tests passed
browser_verify: PASS - 2 of 2 states (Da duyet, Mo nhan ho so), dialog Sua opens clean, no getFieldState/useFormContext TypeError, root intact
p1_out_of_plan_reason: NOT fixed - found intentional service-layer gate (requireComplete/requireOutOfPlanReasonOrThrow at submit, not draft); recommend PM/BA decide UX before touching DTO - see section 4
git_commit: none (per dispatch)
next_owner: qa (re-verify UC-HRM-22 P0 case) / pm (decide P1 label vs validator direction)
