# QA Evidence — QA-PO-HRM-PAY-CNTT-FE-STP-01-CLEANUP-01

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-PO-HRM-PAY-CNTT-FE-STP-01-CLEANUP-01` |
| **parent** | `PO-HRM-PAY-CNTT-FE-STP-01-CLEANUP-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-08-12 |
| **ack_status** | **PASS_WITH_HOLD** |
| **reason_hold** | Component `PolicyPackSetupScreen` chưa được wire vào bất kỳ route nào trong app (xem §3) — vitest + code-review PASS, nhưng chưa thể xác nhận sống trên trình duyệt vì route/hub thật chưa tồn tại. |

---

## 1. vitest — tự chạy

```
cd apps/web/hrm && pnpm exec vitest run src/components/payroll/policy-pack/ --no-coverage
→ ✓ src/components/payroll/policy-pack/PolicyPackSetupScreen.test.ts (7 tests) 131ms
→ Test Files  1 passed (1)
→ Tests       7 passed (7)
```

7/7 PASS — khớp đúng số dev-fe báo.

## 2. Code review — usePolicyPackApi.ts đối chiếu pay-cntt-setup.service.ts

Đọc `apps/web/hrm/src/components/payroll/policy-pack/usePolicyPackApi.ts` và
`apps/api/hrm-api/src/payroll/pay-cntt-setup.service.ts` + route đăng ký trong
`apps/api/hrm-api/src/payroll/payroll.controller.ts`:

- **company_id bắt buộc**: hook gửi `company_id` trên cả 3 call — `useListPolicyPacks` gắn vào query
  string (`params = new URLSearchParams({ scope, company_id: companyId })`), `useCreatePolicyPack`/
  `useUpdatePolicyPack` gắn vào body (`{ company_id: companyId, ...data }`). Đối chiếu BE:
  `listPolicyPacks(query, ...)` dùng `query.company_id`, `createPolicyPack(payload, ...)` dùng
  `payload.company_id`, `updatePolicyPack(id, payload, ...)` dùng `payload.company_id` — khớp.
- **Route BASE khớp**: hook dùng `BASE = /api/hrm/payroll/pay-policy-packs`. BE controller có
  `@Controller('payroll')` + route con `@Get('pay-policy-packs')` / `@Post('pay-policy-packs')` /
  `@Patch('pay-policy-packs/:id')` (dòng 1031/1046/1077 payroll.controller.ts), Nest `setGlobalPrefix`
  là `api/hrm` — ghép lại đúng `/api/hrm/payroll/pay-policy-packs` — khớp.
- **Envelope unwrap**: hook `parseEnvelope<T>()` đọc `res.json()` dạng `{success, code, message, data}`,
  throw nếu `!res.ok || body?.success === false`, trả `body.data`. Đối chiếu BE: mọi route trả qua
  `ok(data, code, message)` (từ `common/api-response.ts`, không đọc trực tiếp trong Task này nhưng xác
  nhận qua cách gọi thống nhất `ok(...)` trong toàn `payroll.controller.ts`) và lỗi qua
  `http-exception.filter.ts` — đúng shape `{success:false, code, message}` (đã tự thấy thực tế qua live
  smoke ở Việc 1 cùng Task này, response envelope thật khớp mô tả). Khớp.
- **List unwrap `data.items`**: hook `useListPolicyPacks` gọi `parseEnvelope<{ items: PolicyPack[] }>`
  rồi `return data.items ?? []`. Đối chiếu BE `listPolicyPacks()` (dòng 501–514
  `pay-cntt-setup.service.ts`): `const items = []; ...; return { items };` — response BE thật là
  `{items: [...]}` bên trong `data` — khớp chính xác.
- **Error code mapping**: hook map `HRM-PAY-POL-409-CODE` → "Mã gói đã tồn tại..." và
  `HRM-PAY-POL-400-DATE` → "Hiệu lực đến phải sau hiệu lực từ." Grep xác nhận cả 2 constant tồn tại thật
  trong `apps/api/hrm-api/src/payroll/pay-cntt-setup.constants.ts`
  (`HRM_PAY_POL_409_CODE = 'HRM-PAY-POL-409-CODE'`, `HRM_PAY_POL_400_DATE = 'HRM-PAY-POL-400-DATE'`) và
  được cover bởi test thật `pay-cntt-setup.service.spec.ts` dòng 197
  (`createPolicyPack duplicate code → HRM-PAY-POL-409-CODE`) — không phải code map vào constant ma.

**Kết luận code review: response shape FE/BE khớp nhau, không phát hiện sai lệch.**

## 3. Route / entry point — KHÔNG tìm thấy trong codebase (khác với dispatch giả định)

Đọc `docs/hrm/ui-screens/UI-HRM-PAY-STP-HUB.md` §1: route tài liệu ghi là
`/hr/payroll/setup?portal=1&tenantId=xevn&companyId=main`, component `PayrollSetupHub`
(`data-testid="pay-stp-hub-root"`), nav item "Gói chính sách" outlet tới child STP-POLICY-PACK.

Đã grep thật trong `apps/web/hrm/src/`:

```
grep -rln "PolicyPackSetupScreen" src/ --include=*.tsx --include=*.ts | grep -v test
→ chỉ chính nó (PolicyPackSetupScreen.tsx) + usePolicyPackApi.ts — KHÔNG có file nào khác import nó

grep -rln "pay-stp-hub-root|PayrollSetupHub" src/ --include=*.tsx | grep -v test
→ (không có kết quả — component PayrollSetupHub KHÔNG tồn tại trong repo)

grep -n "payroll/setup|PayrollSetupHub" src/App.tsx src/**/*.tsx
→ (không có kết quả)

grep -n path= src/App.tsx | grep -i payroll
→ chỉ có 1 route: <Route path="/payroll" element={<PermissionRoute module="payroll">...<Payroll /></PermissionRoute>} />
  (KHÔNG có "/payroll/setup")
```

**Kết luận: `PolicyPackSetupScreen.tsx` là component đã viết xong, test xanh, nhưng CHƯA được wire vào
bất kỳ route nào trong ứng dụng thật.** `PayrollSetupHub` mô tả trong `UI-HRM-PAY-STP-HUB.md` chưa tồn
tại trong code — tài liệu UI đi trước implementation. Đây không phải lỗi của cleanup Task này (dispatch
cleanup chỉ scope dọn file rác + sửa hook, không yêu cầu build routing hub — dev-fe cũng tự ghi rõ trong
evidence "Ngoài phạm vi" là chỉ scope CHUNG, không đụng hub). Nhưng nó có nghĩa: **không thể browser-test
sống được** vì không có URL nào dẫn tới component này trong app hiện tại — không phải do server chưa sẵn
sàng (server hrm-fe/hrm-api đều đang chạy, xem §4) mà do route thật sự chưa được lập trình.

## 4. Server đang chạy — xác nhận health chung, không browser-verify được màn Policy Pack

```
netstat -ano | grep LISTENING | grep :8080  → hrm-fe LISTENING (PID 24104)
netstat -ano | grep LISTENING | grep :28001 → hrm-api LISTENING (PID 28112)
```

Cả 2 server đều sẵn sàng, nhưng vì không có route thật cho Policy Pack setup screen (§3), không thể
điều hướng Browser tool tới màn hình cần verify. Không mở Browser tool lãng phí vào route không tồn tại
(sẽ chỉ vào 404/route mặc định của `/hr/`, không phản ánh gì về component đang QA). Verify dừng ở mức
vitest (§1) + code-review đối chiếu response shape thật FE/BE (§2) — đúng fallback ghi trong dispatch
("Nếu không tìm được route thật ... ghi rõ verify ở mức vitest + code-review, không browser").

## 5. Xác nhận danh sách file cleanup

```
ls apps/web/hrm/src/components/payroll/policy-pack/
→ PolicyPackSetupScreen.test.ts
→ PolicyPackSetupScreen.tsx
→ usePolicyPackApi.ts
```

Không còn `.bak`, không còn `PolicyPackSetup.test.ts`/`.test.tsx`/`.test.skip.ts` cũ — khớp đúng danh
sách "Xoá" trong evidence dev-fe.

## 6. Exit criteria

| Criteria | Status | Ghi chú |
|----------|--------|---------|
| vitest policy-pack/ = 7/7 | PASS | Tự chạy |
| Hook gửi company_id đúng 3 call | PASS | Đối chiếu BE service |
| Unwrap envelope đúng shape thật | PASS | Đối chiếu BE `{items}`/error constants |
| File rác đã xoá | PASS | `ls` xác nhận chỉ còn 3 file |
| Browser verify màn Policy Pack sống | **KHÔNG THỰC HIỆN ĐƯỢC** | Route/hub thật chưa tồn tại trong codebase — không phải do server, không phải lỗi cleanup Task này |

## 7. Kết luận

Phần code FE (hook + component + test) làm đúng, đối chiếu chính xác với BE thật, 7/7 vitest PASS,
cleanup file rác đúng danh sách. Đánh dấu `PASS_WITH_HOLD` (không phải `PASS_TO_PM` thẳng) vì:
component chưa reachable từ bất kỳ route nào trong app — cleanup Task này tự thân không có nghĩa vụ xây
route (đúng phạm vi), nhưng PM cần biết trước khi coi work item cha `PO-HRM-PAY-CNTT-FE-STP-01` là
"đã có màn hình dùng được" — thực chất mới là component isolated, cần 1 Task riêng build
`PayrollSetupHub` + wire route `/hr/payroll/setup` mới thực sự demo được cho end-user.

## 8. Handoff

| Field | Value |
|-------|-------|
| **evidence_path** | `docs/qa/evidence/qa-po-hrm-pay-cntt-fe-stp-01-cleanup-01.md` |
| **ack_status** | `PASS_WITH_HOLD` |
| **next_owner** | pm — quyết định có mở Task mới "wire PayrollSetupHub + route /hr/payroll/setup" trước khi coi slide Policy Pack là done-to-user hay không |
