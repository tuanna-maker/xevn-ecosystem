# P1 — Danh mục nền Hạ tầng: list bug + wizard UX (sponsor 2026-06-20)

| Field | Value |
|-------|-------|
| **trigger** | Sponsor: thêm danh mục + tick pháp nhân → list hiện `—` / `0 pháp nhân`; UX khó hiểu — cần popup full-screen CRUD thông minh |
| **UC** | UC-XBOS-INF-01 |
| **P0 bug class** | `foundationForm` không sync vào `foundationCategories` khi «Quay lại»; row rỗng thêm sẵn vào list |

## UX target (Apple-style)

**FoundationCategoryWizard** — modal full-viewport (`z-[100]`, glass header, 3 bước neo):

1. **Thông tin** — mã, tên, mô tả (bắt buộc trước)
2. **Phạm vi** — tick pháp nhân (chip grid)
3. **Cấu hình khối/trường** — embed block/field config (reuse infra fields panel)

Actions: Hủy · Lưu nháp · **Xác nhận & áp dụng** (PUT + đóng + list refresh).

List chỉ hiện row **đã lưu**; empty draft không pollute table.

## Waves

| ID | Role | Exit |
|----|------|------|
| P1-INFRA-FCAT-LIST-BUG-QA | qa | Repro + evidence |
| P1-INFRA-FCAT-WIZARD-BA-01 | ba-process | Wireframe AC trong SRS delta → **`docs/xbos/INFRA_FOUNDATION_CATEGORY_WIZARD_UX.md`** |
| P1-INFRA-FCAT-WIZARD-FE-01 | dev-fe | Wizard + list fix + deploy :8088 |
| P1-INFRA-FCAT-WIZARD-QA | qa | UF browser PASS |
