# Evidence — QA-D-CTR-CREATE-PICKER-PLACEMENT-01

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-D-CTR-CREATE-PICKER-PLACEMENT-01` |
| **role / lane** | qa / execution |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | ✅ **CRASH KHÔNG TÁI HIỆN** — false alarm của agent trước |
| **U65** | browser-only · zero-seed · không ghi DB · không sửa product code |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · `tenantId=xevn` |
| **commit** | `5ccb26e` |
| **runner** | `scripts/qa/_tmp-qa-d-ctr-create-picker-placement-01.mjs` (Playwright + Chrome thật, headless) |
| **raw JSON** | `docs/qa/evidence/_tmp-qa-d-ctr-create-picker-placement-01.json` |
| **screens** | `docs/qa/evidence/screens/qa-d-ctr-create-picker-placement-01/` |
| **honesty** | `contracts_printable_ready=false` · C-SLICE (chỉ kiểm Bước 1 render + picker placement, KHÔNG claim module CTR UAT) |

---

## Kết luận (verdict)

**Crash "`catalogSearchPlacement is not defined`" KHÔNG TÁI HIỆN** trên browser thật, ở **cả 2 chế độ**.

- Nguyên nhân báo cáo trước: agent Claude CLI **chết giữa phiên vì hạ tầng** (Cloudflare `API Error: 524 origin_response_timeout` — quan sát trong terminal `4.txt`), **chưa từng có evidence browser**. Đây là **false alarm**.
- Kiểm tra tĩnh của PM đúng: `catalogSearchPlacement` khai báo L150 **trong thân component** `ContractCreateStep1GeneralGrid`, dùng ở L244/258/410/461 **cùng scope**; import `getHrmPortalMode` từ `@/lib/hrmPortalMode` tồn tại (export L5). Không có lỗi scope.
- Browser xác nhận: **0** `Uncaught ReferenceError` / `is not defined` / `pageerror`; Bước 1 render đầy đủ; 4 picker hoạt động đúng placement theo `DEF-CTR-PICKER-INLINE-PORTAL-01` + `@CODE-MEMORY-CHANGE 2026-08-12`.

---

## L0 — Stack health (entry_criteria)

`pnpm run qc:fe-be-health` → **exit 0 · ALL PASS**

```
PASS  hrm-api-health              HTTP 200  http://127.0.0.1:28001/api/hrm/
PASS  xbos-api-health             HTTP 200  http://127.0.0.1:28002/api/xbos
PASS  web-portal                  HTTP 200  http://127.0.0.1:5173
PASS  portal-login                token ok
PASS  hrm-employees-direct        HTTP 200  .../employees?...&company_id=main
PASS  portal-proxy-hrm-employees  HTTP 200  http://127.0.0.1:5173/api/hrm/employees...
=== Summary: ALL PASS ===
```

Standalone HRM dev server `http://127.0.0.1:8080/hr/` + `/hr/contracts` → **HTTP 200**.

---

## Chế độ 1 — Standalone (`/hr/contracts`, top-document, port 8080)

| Mục | Kết quả |
|-----|---------|
| URL | `http://127.0.0.1:8080/hr/contracts` |
| Context | `top-document` (không iframe) |
| Render Bước 1 | ✅ `ctr-create-step-1` hiện — dialog «Thêm hợp đồng mới» đầy đủ |
| `Uncaught ReferenceError` / `is not defined` | ❌ **KHÔNG có** (`refErrors=0`, `pageErrors=0`) |
| Console errors | Chỉ 2 × `Failed to load resource: 404` (asset phụ, **không** liên quan crash / không phải ReferenceError) |

**4 picker — kỳ vọng POPOVER (ô tìm chỉ hiện khi bấm):**

| Picker | testid | Placement quan sát | Hành vi |
|--------|--------|--------------------|---------|
| NV picker | `hdsd-contracts-form-employee` | ✅ **popover** | search ẩn → bấm trigger → search hiện |
| Department picker | `ctr-create-department-picker` | ✅ **popover** | search ẩn → bấm → hiện |
| Work-arrangement picker | `ctr-create-work-arrangement` | ✅ **popover** | search ẩn → bấm → hiện |
| UV picker | `ctr-create-candidate-picker` | ✅ **popover** | search ẩn → bấm → hiện |

Screenshot: `screens/.../standalone-03-step1.png` — 4 trường chỉ có 1 combobox (không lộ ô tìm sẵn) → đúng root-cause fix của `PO-HRM-CTR-CREATE-PICKER-INLINE-PORTAL-CONDITIONAL-01`.

---

## Chế độ 2 — Portal embed (Command Center `:5173`, iframe, `?portal=1&companyId=main`)

| Mục | Kết quả |
|-----|---------|
| URL | `http://127.0.0.1:5173/command-center/hrm/contracts?portal=1&tenantId=xevn&companyId=main` |
| Context | `iframe` (HRM embed trong portal) |
| Render Bước 1 | ✅ `ctr-create-step-1` hiện — dialog «Thêm hợp đồng mới» đầy đủ |
| `Uncaught ReferenceError` / `is not defined` | ❌ **KHÔNG có** (`refErrors=0`, `pageErrors=0`, `consoleErrors=0`) |

**4 picker — kỳ vọng INLINE (ô tìm hiện sẵn dưới select):**

| Picker | testid | Placement quan sát | Hành vi |
|--------|--------|--------------------|---------|
| NV picker | `hdsd-contracts-form-employee` | ✅ **inline** | ô tìm «Tìm theo mã hoặc tên…» hiện sẵn |
| Department picker | `ctr-create-department-picker` | ✅ **inline** | ô tìm hiện sẵn |
| Work-arrangement picker | `ctr-create-work-arrangement` | ✅ **inline** | ô tìm hiện sẵn |
| UV picker | `ctr-create-candidate-picker` | ✅ **inline** | ô tìm hiện sẵn |

Screenshot: `screens/.../portal-03-step1.png` — mỗi select kèm ô tìm inline ngay bên dưới → giữ đúng `must_keep` (portal-embed vẫn inline, `DEF-CTR-PICKER-INLINE-PORTAL-01`).

---

## Chọn NV/UV + mẫu HĐ + bấm Tiếp

| Mục | Standalone | Portal embed |
|-----|-----------|--------------|
| Chọn đối tượng (NV/UV) | ✅ picker mở & chọn được | ✅ đã chọn UV `RECCHQA-MSNK95YR` |
| Số HĐ | ✅ điền được | ✅ `QAPLACEX3ZAF` |
| Mẫu in (template) | combobox mở được | ✅ chọn `XEVN_FT_12M_DRIVER — HĐLĐ 12 tháng (Lái xe)` |
| Bấm **Tiếp** | nút enable, click OK | nút enable, click OK |
| Sang Bước 2 | ❌ **chặn bởi validation** (không phải crash) | ❌ **chặn bởi validation** (không phải crash) |
| Toast validation | «**Chọn ngày ký trước khi lưu hoặc sang bước điều khoản.**» | (cùng luật — thiếu Ngày ký) |

> **Diễn giải:** Bước 1 KHÔNG vỡ. Không sang Bước 2 là do **quy tắc nghiệp vụ bắt buộc «Ngày ký»** — form validate đúng (toast tiếng Việt rõ ràng), deterministic, **không** ReferenceError, dialog vẫn mở nguyên. Harness cố tình không điền Ngày ký (không thuộc phạm vi verify placement) nên dừng ở validation. Đây là hành vi đúng, không phải defect.

Screenshots liên quan: `standalone-06-after-next.png` (toast «Chọn ngày ký…» + dialog vẫn mở), `portal-05-before-next.png` (template + UV đã chọn, inline search hiển thị).

---

## Screens index

```
screens/qa-d-ctr-create-picker-placement-01/
  standalone-00-landing.png
  standalone-03-step1.png        ← 4 picker popover, render đủ
  standalone-04-pickers-done.png
  standalone-05-before-next.png
  standalone-06-after-next.png   ← toast «Chọn ngày ký…», dialog vẫn mở (không crash)
  portal-00-landing.png
  portal-03-step1.png            ← 4 picker inline, render đủ
  portal-04-pickers-done.png
  portal-05-before-next.png      ← template + UV đã chọn
  portal-06-after-next.png
```

---

## Defect

**KHÔNG mở defect.** `DEF-CTR-CREATE-PLACEMENT-P0` = **không tồn tại / false alarm**. Không cần dispatch `dev-fe` cho crash này.

---

## Handoff

- **completion_report:** Crash `catalogSearchPlacement is not defined` **không tái hiện** trên browser thật ở cả standalone (popover) và portal embed (inline). Bước 1 render đầy đủ, 0 ReferenceError/pageError; 4 picker đúng placement theo spec; Tiếp bị chặn đúng bởi validation «Ngày ký» (không phải crash). Report của agent trước là false alarm do CLI chết vì Cloudflare 524. Không có residual P0/P1.
- **next_owner:** pm
- **next_dispatch_prompt:** «PM: đóng nghi vấn crash CTR create. QA đã bác bỏ crash `catalogSearchPlacement` bằng browser (evidence `docs/qa/evidence/qa-d-ctr-create-picker-placement-01.md`). Không dispatch dev-fe cho crash này. Nếu muốn nghiệm thu sâu hơn luồng tạo HĐ (Bước 1 → điền Ngày ký → Bước 2 điều khoản → xem trước in), dispatch `QA-CTR-CREATE-STEP2-FLOW-01` (browser, U65, điền đủ trường bắt buộc gồm Ngày ký, chọn mẫu active, kéo-thả điều khoản, kiểm không DnD storm) — giữ `contracts_printable_ready=false` cho tới khi có evidence in hợp lệ.»
- **evidence_path:** `docs/qa/evidence/qa-d-ctr-create-picker-placement-01.md`
- **ack_status:** **PASS_TO_PM**
