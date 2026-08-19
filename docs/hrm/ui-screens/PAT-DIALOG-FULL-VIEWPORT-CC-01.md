# PAT-DIALOG-FULL-VIEWPORT-CC-01 — Modal full viewport (Command Center embed)

| Meta | Value |
|------|--------|
| **ref_srs** | UF-HRM-* mutate · Settings §16 · HRM-CI-01 wizard |
| **ref_pattern** | `Contracts.tsx` create/view `DialogContent` (parent portal) |
| **Sponsor** | 2026-08-10 — popup không được kẹt trong khung HRM embed; **toàn màn trình duyệt** |

## Mục đích

Khi HRM chạy trong iframe CC (`/command-center/hrm/...`), dialog nghiệp vụ nặng phải portal lên **document cha** và dùng **~90vw × ~90vh** (tối đa viewport), overlay che toàn portal — không `sm:max-w-lg` / `max-w-900px` trong iframe.

## Chuẩn kỹ thuật

| Hạng mục | Chuẩn |
|----------|--------|
| Portal | **Không** truyền `portalScope="iframe"` (mặc định parent). Ghi `data-hrm-dialog-portal="parent"` nếu cần QA probe. |
| Kích thước | `className` gợi ý: `w-[min(90vw,96rem)] max-w-[min(90vw,96rem)] max-h-[min(90vh,calc(100vh-2rem))] overflow-hidden flex flex-col` + vùng scroll nội bộ `min-h-0 flex-1 overflow-y-auto` |
| Density | Giữ Settings W1.5 trên **list**; dialog được `xevn-safe-inline` khi form rộng (Contracts pattern) |
| DnD trong dialog | Dùng pattern đã PASS Contract create step 2; nếu đổi portal → chạy lại QA DnD + zero pangea storm |

## Phạm vi áp dụng (P0)

- `JdTemplateWriterDialog` (Thư viện JD + Tuyển dụng)
- `JdMasterLibrarySettingsPanel` — dialog Xem JD
- `ContractLegalPrintSettingsPanel` — `settings-contract-templates-dialog`, clauses dialog
- Các `Settings*SettingsPanel` mutate dialog (ATT/EMP/REC catalog) — cùng PAT nếu sponsor yêu cầu full viewport; catalog nhỏ có thể `max-w-2xl` parent portal vẫn bắt buộc

## AC UI (QA)

1. Mở dialog từ CC URL `:5173/command-center/hrm/...`
2. Overlay che header CC; panel rộng ≥ 85% viewport width
3. Không cắt footer/actions — scroll nội bộ
4. Đóng/Escape — không duplicate shell header

## Exception

`portalScope="iframe"` chỉ với waiver SA + evidence DnD + expiry — không dùng cho sponsor lock full browser.
