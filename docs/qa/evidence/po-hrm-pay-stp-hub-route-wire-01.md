# Evidence — PO-HRM-PAY-STP-HUB-ROUTE-WIRE-01

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-PAY-STP-HUB-ROUTE-WIRE-01` |
| **from_role** | dev-fe |
| **date** | 2026-08-12 |
| **ack_status** | **READY_FOR_QA** |

---

## 1. File mới / sửa

| File | Loại | Ghi chú |
|------|------|---------|
| `apps/web/hrm/src/components/payroll/setup/PayrollSetupHub.tsx` | MỚI | Component hub 2-pane, `data-testid="pay-stp-hub-root"` |
| `apps/web/hrm/src/components/payroll/setup/PayrollSetupHub.test.ts` | MỚI | 5 test case (root testid, 6 nav items, default section, placeholder honesty, honesty banner copy) |
| `apps/web/hrm/src/App.tsx` | SỬA | +4 dòng: lazy import `PayrollSetupHub` + `<Route path="/payroll/setup" .../>` (pattern giống `/payroll` hiện có, cùng `PermissionRoute module="payroll"`) |

Không đụng `PolicyPackSetupScreen.tsx` / `usePolicyPackApi.ts` (chỉ import + render, xác nhận bằng `git diff` không có thay đổi 2 file này). Không đụng `apps/api/**`. Không commit git.

## 2. Quyết định thiết kế

- **Thư mục**: đặt tại `apps/web/hrm/src/components/payroll/setup/` (mới) thay vì bỏ chung vào
  `payroll/policy-pack/` — vì Hub là component cấp cao hơn bao 6 mục nav, không thuộc riêng slice
  Policy Pack; giữ `policy-pack/` chỉ chứa đúng 3 file của slice CHUNG đã QA PASS.
- **6 mục nav đúng thứ tự spec §3**: Gói chính sách (ready=true, render `PolicyPackSetupScreen` thật) ·
  Danh mục thành phần / Mẫu bảng / Profile nhập / Nhóm lương / Gợi ý cấu hình (ready=false, placeholder
  honesty "Chưa xây dựng — đang trong kế hoạch..." — không fake data, không disable-nhưng-trông-như-hoạt-động).
- **URL đổi khi click nav** (AC J-HRM-PAY-STP-NAV-01 "Click path 5 nav items · URL đổi · không 404"):
  dùng `useSearchParams` set `?section=<id>` trên cùng route `/payroll/setup` — tránh 404 vì không có
  route con thật cho 5 mục placeholder (chúng chưa tồn tại như spec §7 AC-PAY-STP-GLOBAL-03 "Không enum
  BP cứng trong DOM nav" — nav items ở đây là section id nội bộ, không phải enum BP).
- **Honesty banner**: nguyên văn §6 `"Thiết lập đã lưu ≠ chạy bảng lương kỳ — payroll_e2e_ready=false"`,
  sticky top (`className="... sticky top-0 z-10"`).
- **"Làm mới scope"**: không mutate — chỉ `queryClient.invalidateQueries({queryKey:['pay-policy-packs']})`
  (đúng key thật trong `usePolicyPackApi.ts` dòng 125/150/167) — hành động thật, không phải nút giả.
- **Company scope label**: dùng `resolveHrmSpreadsheetScope()` (cùng lib `usePolicyPackApi.ts` đang dùng)
  với fallback `HRM_MASTER_TENANT_ID`/`HRM_LIST_DEFAULT_COMPANY_ID` — khớp cách BE/FE khác trong app resolve
  scope, không tự chế logic mới.

## 3. vitest — trước / sau (tự chạy)

**Trước (baseline, chạy trước khi sửa)**
```
cd apps/web/hrm && pnpm exec vitest run --no-coverage
Test Files  6 failed | 341 passed (347)
     Tests  7 failed | 1839 passed (1846)
```
(6 file / 7 test FAIL này pre-existing, không liên quan payroll — ví dụ
`src/lib/xevn-thm-fe-w1-density-01.test.ts`, `src/components/auth/PermissionFallback.test.ts`.)

**Test mới riêng (`PayrollSetupHub.test.ts`)**
```
cd apps/web/hrm && pnpm exec vitest run src/components/payroll/setup/ --no-coverage
✓ src/components/payroll/setup/PayrollSetupHub.test.ts (5 tests) 82ms
Test Files  1 passed (1)
     Tests  5 passed (5)
```

**Sau (full suite lại)**
```
cd apps/web/hrm && pnpm exec vitest run --no-coverage
Test Files  6 failed | 342 passed (348)
     Tests  7 failed | 1844 passed (1851)
```

→ Cùng 6 file / 7 test FAIL như baseline (không tăng, không đổi danh sách) — **không giảm baseline**.
+1 file / +5 test PASS mới (đúng bằng `PayrollSetupHub.test.ts`).

## 4. Browser verify sống — server đang chạy sẵn (không tự start thêm)

```
netstat -ano | grep LISTENING | grep -E ":5173|:8080"
→ :8080 LISTENING (PID 24104) — hrm-fe đang chạy sẵn từ trước
```

Dùng Browser tool điều hướng `http://localhost:8080/hr/payroll/setup` (server có sẵn, không start mới):

- `window.location.href` → `http://localhost:8080/hr/payroll/setup` — route ăn, không 404.
- Trang hiển thị: header "Thiết lập lương" · "Company scope: main" · nút "Làm mới scope" · honesty
  banner nguyên văn `Thiết lập đã lưu ≠ chạy bảng lương kỳ — payroll_e2e_ready=false` · 6 nav item
  đúng nhãn spec (5 mục có nhãn phụ "(chưa có)").
- Mặc định vào "Gói chính sách" → render `PolicyPackSetupScreen` **thật**, thấy **5 gói chính sách
  CHUNG thật từ BE** (dữ liệu có sẵn trong DB, không phải seed của Task này — `qa_pol_cnttber2qa-*`,
  `pol_cnttber2_mso87gq8`).
- Click nav "Danh mục thành phần" (`ref_13`) → `window.location.href` đổi thành
  `http://localhost:8080/hr/payroll/setup?section=components` (URL đổi, không 404, đúng
  AC J-HRM-PAY-STP-NAV-01) → nội dung đổi thành placeholder honest:
  "Chưa xây dựng — đang trong kế hoạch. Mục này chưa có màn hình thật; không có dữ liệu để hiển thị
  và không có thao tác nào khả dụng ở đây." — không fake PASS, không fake data.

Verify sống bằng Browser tool thật — không chỉ đọc code/test.

## 5. @CODE-MEMORY

Cả 2 file mới (`PayrollSetupHub.tsx`, `PayrollSetupHub.test.ts`) có block `@CODE-MEMORY` tiếng Việt đầy
đủ ở đầu file — Screen/UC/SRS/SA/UI/Component/Purpose/must_keep/NOT scope/WorkItem/Coded.

## 6. Ngoài phạm vi (không làm trong Task này)

- Không implement CRUD thật cho 5 mục placeholder (Danh mục TP / Mẫu bảng / Profile nhập / Nhóm lương /
  Gợi ý cấu hình) — chỉ honest placeholder theo đúng yêu cầu dispatch.
- Không đổi Command Center embed route `/command-center/hrm/payroll/setup` (spec §1 "Alt") — dispatch
  chỉ yêu cầu route `/hr/payroll/setup` chính.
- Không đụng `PaySetupResolvePanel` (chưa tồn tại — nằm trong nhóm 5 mục CHƯA CÓ).

## 7. Handoff

| Field | Value |
|-------|-------|
| **evidence_path** | `docs/qa/evidence/po-hrm-pay-stp-hub-route-wire-01.md` |
| **ack_status** | `READY_FOR_QA` |
| **next_owner** | qa — browser verify U65 sống thêm nếu cần (5 nav placeholder còn lại), audit route Command Center embed nếu PM cần mở rộng |
