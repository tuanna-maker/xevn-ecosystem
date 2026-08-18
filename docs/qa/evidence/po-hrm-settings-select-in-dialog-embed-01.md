# QA — Select trong Dialog Settings embed (DEF-SETTINGS-SELECT-IN-DIALOG-EMBED-01)

| Field | Value |
|-------|--------|
| work_item_id | DEF-SETTINGS-SELECT-IN-DIALOG-EMBED-01 |
| spec_ref | PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01 §2.4 |
| persona | ceo@xe.vn |
| URL | `/command-center/hrm/settings?tab=att-leave-types` |
| ack_status | READY_FOR_QC |

## Root cause

Dialog embed mount **parent** (`z-[100000]`). Select dùng `portalScope="iframe"` mount **iframe body** (`z-50`) → dropdown render **dưới** overlay dialog.

## Fix

- `SettingsDialogSelectContent` → `portalScope="parent"` + `z-[100010]`
- Áp dụng: `AttLeaveTypeSettingsPanel` · dialog điều khoản `ContractLegalPrintSettingsPanel`

## Browser matrix (U65 · L2.5)

### UF-SETTINGS-ATT-LVT-DIALOG-SELECT

- Trước: màn list loại phép load
- Action: **Thêm loại phép** → mở Dialog → click **Nhóm**
- **FE sau mở:** danh sách option (Phép năm, Khác, …) **hiển thị trên** dialog, scroll/click một option → trigger cập nhật label
- F5: không bắt buộc (chỉ UX portal)
- Verdict: 🟢 khi option click được · 🔴 nếu chỉ thấy che mờ hoặc list dưới popup

### UF-SETTINGS-CTR-CL-DIALOG-SELECT (regression)

- URL: `?tab=contract-clauses` → **Thêm điều khoản** → **Nhóm điều khoản** — cùng AC trên

## Automation

- `pnpm exec vitest run src/lib/hrmDialogPortal.test.ts` — portal container rules
- `pnpm run build` (hrm) — compile

## QC gate

- GO slice khi cả 2 UF 🟢 trên :5173 embed CC
- Residual: catalog W3 còn panel — mọi Dialog mới **bắt buộc** `SettingsDialogSelectContent`
