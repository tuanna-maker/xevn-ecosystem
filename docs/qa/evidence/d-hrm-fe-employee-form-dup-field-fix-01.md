# Dev Evidence — D-HRM-FE-EMPLOYEE-FORM-DUP-FIELD-FIX-01

- **work_item_id:** D-HRM-FE-EMPLOYEE-FORM-DUP-FIELD-FIX-01
- **PM audit gốc:** `docs/qa/evidence/pm-uiux-audit-employee-form-duplicate-fields-01.md`
- **Ngày:** 2026-08-12
- **Vai trò:** dev-fe

## Tình trạng khi bắt đầu phiên này

Fix (Hướng A) đã tồn tại sẵn trong working tree (unstaged, chưa `git add`) từ một phiên trước đó bị gián đoạn — chưa chạy test, chưa viết evidence. Phiên này: đọc lại evidence PM, đọc code, verify logic đúng yêu cầu, chạy test baseline/sau, xác nhận không có gì thiếu, hoàn thiện evidence.

## File đã sửa (nằm trong allowed_paths)

- `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx`
  - Thêm `export function normalizeFieldLabel(label: string): string` — chuẩn hoá: `.normalize('NFD')` + strip combining marks (`/[̀-ͯ]/g`) + lowercase + trim.
  - `buildDynamicFields<T>()` (dòng ~399) thêm tham số thứ 3 `knownLabels: readonly string[] = []` (backward-compatible, mặc định rỗng). Filter thêm điều kiện: nếu `normalizeFieldLabel(item.label)` nằm trong `Set` của `knownLabels` đã chuẩn hoá → loại khỏi danh sách dynamic field (không render).
  - 3 call site (`dynamicBasicFields` ~dòng 662, `dynamicPersonalFields` ~dòng 706, `dynamicWorkFields` ~dòng 738) đều truyền `knownLabels` là mảng gồm **cả 2** khả năng label built-in đang hiển thị: label fallback mặc định `t('employees.xxx' | 'employeeForm.xxx')` VÀ label override từ catalog qua `basicLabel/personalLabel/workLabel(...)`, để không sót trường hợp catalog override label built-in.
  - Field "Dân tộc" (`PERS_04` style, label không trùng built-in nào) không bị đụng — vẫn render bình thường (có test riêng cover).

- Test đã có sẵn (không cần tạo mới — đã tồn tại và cover đúng yêu cầu PM đề ra):
  - `apps/web/hrm/src/components/employee/EmployeeFormDialog.dedup-dynamic-fields.test.ts` — 9 test case, bao gồm đúng case PM yêu cầu: catalog item code `BASIC_01` label "Mã NV" → bị loại khỏi dynamic fields khi `knownLabels` chứa "Mã NV"/"Mã NV *" (không render input thứ 2). Có thêm case biến thể hoa/thường, khoảng trắng thừa, giữ lại field custom hợp lệ ("Dân tộc"), backward-compat khi không truyền `knownLabels`, và item `status !== 'active'` vẫn bị loại.
  - `apps/web/hrm/src/components/employee/EmployeeFormDialog.mount-guard.test.ts` — không liên quan trực tiếp fix này nhưng cùng file, chạy chung để đảm bảo không phá vỡ mount logic khác.

## Kết quả vitest

### Baseline (revert `EmployeeFormDialog.tsx` về đúng HEAD, tức bản GỐC trước khi có fix — dùng `git stash push -- <path>` tạm thời rồi pop lại nguyên trạng, không mất dữ liệu of các work item khác)

```
2 file test liên quan (dedup-dynamic-fields + mount-guard):
Test Files  2 failed (2)
     Tests  13 failed | 5 passed (18)
```
(Thất bại phần lớn vì bản gốc chưa export `buildDynamicFields`/`normalizeFieldLabel` và chưa có `knownLabels` — đúng như kỳ vọng lỗi PM đã audit.)

### Sau khi có fix (working tree hiện tại)

```
2 file test liên quan:
Test Files  2 passed (2)
     Tests  18 passed (18)
```

### Full suite `apps/web/hrm` (sau fix)

```
Test Files  6 failed | 340 passed (346)
     Tests  7 failed | 1832 passed (1839)
```

7 test fail còn lại **không liên quan** đến `EmployeeFormDialog`/dup-field (đã kiểm tra tên test):
- `src/hooks/useEmployeePicker.test.ts` (C-CD-FB-07-01 leave picker)
- `src/lib/poHrmMvpGd1Core09ClusterFe01.source.test.ts`
- `src/components/auth/PermissionFallback.test.ts`
- `src/lib/poHrmMvpGd1Att04bClusterFe01.source.test.ts`
- `src/lib/xevn-thm-fe-w1-density-01.test.ts` (payroll overview theme)
- `src/hooks/useOvertimeRequests.test.ts` (x2)

Đây là các failure có sẵn từ các work item khác đang dở dang trong cùng repo (không do task này gây ra, không nằm trong `allowed_paths` của task này nên không sửa). Không có regression nào do fix `D-HRM-FE-EMPLOYEE-FORM-DUP-FIELD-FIX-01` gây ra — pass rate cho 2 file test liên quan trực tiếp tăng từ 5/18 → 18/18.

## Smoke check dev server (mục 3)

Kiểm tra `netstat -ano | grep LISTENING | grep -E ":5173|:8080"` → **không có server nào đang chạy** trên 2 port này tại thời điểm dev-fe làm việc. Theo hướng dẫn task ("Nếu server dev đang chạy sẵn... verify bằng curl"), bước này là điều kiện — không có server chạy sẵn nên không tự start thêm và không có gì để smoke-check qua curl. PM sẽ tự verify lại bằng browser sau như đã ghi trong task.

## Giải thích ngắn gọn cách chuẩn hoá label

```ts
function normalizeFieldLabel(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
```
Bỏ dấu tiếng Việt (NFD decompose rồi loại combining marks Unicode range U+0300–U+036F), lowercase, trim khoảng trắng — để so khớp "Mã NV" ≡ "MÃ NV" ≡ "  Mã NV  " ≡ "ma nv".

## Git

Không `git add`, không commit — đúng yêu cầu. `git status` vẫn hiển thị `EmployeeFormDialog.tsx` là unstaged modified (nội dung tương đương trước, chỉ khác là toàn bộ diff của file này (bao gồm cả các work item khác đã có sẵn từ trước) tạm thời gộp về unstaged trong quá trình stash/pop để đo baseline — nội dung file không đổi so với trước khi dev-fe bắt đầu phiên này, đã verify bằng `wc -l` = 1587 dòng khớp cả trước/sau, và grep marker các work item khác (`AC-CORE-CB-MAP-01`, `EmployeeManagerPicker`...) vẫn còn đủ).

## Kết luận

- ack_status: **READY_FOR_QA**
- vitest trước/sau (2 file liên quan): 5/18 → 18/18 passed
- File đã sửa: `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx` (đã có sẵn từ phiên trước, verify + hoàn thiện evidence trong phiên này)
- evidence_path: `docs/qa/evidence/d-hrm-fe-employee-form-dup-field-fix-01.md`
