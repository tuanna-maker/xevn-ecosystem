# Bộ Test Case chuyên nghiệp theo Use Case

**Đọc bắt đầu:** [`00_TEST_DESIGN_METHOD.md`](./00_TEST_DESIGN_METHOD.md)  
**Toàn hệ (245 UC Phase 1):** [`by-uc/`](./by-uc/) · Program [`PO_FULL_ECOSYSTEM_UC_TC_PROGRAM.md`](../../program/PO_FULL_ECOSYSTEM_UC_TC_PROGRAM.md)  
**Báo cáo tổng:** [`by-uc/MASTER_COVERAGE_REPORT.md`](./by-uc/MASTER_COVERAGE_REPORT.md)

## Cây tài liệu

| File | Nội dung |
|------|----------|
| `00_TEST_DESIGN_METHOD.md` | UC → Nghiệp vụ → Chức năng → Điều kiện → TC |
| **`by-uc/<UC-ID>.md`** | **SoT đầy đủ** — một file / một UC Phase 1 |
| `by-uc/_INVENTORY_PHASE1.md` | 245 UC + squad |
| `by-uc/_TEMPLATE_UC_TC.md` | Template squad |
| `UC-FR-H03_LEAVE.md` | Exemplar sâu Nghỉ phép (~39 case) |
| `UC-FR-B03_RECRUITMENT_WF.md` | Exemplar Tuyển + WF (~56) |
| `UC-ATT_ESS_ADJUST.md` | Exemplar Điều chỉnh CC (~27) |
| `99_TEST_REPORT_BY_UC_TEMPLATE.md` | Mẫu report theo cây UC |

## Quan hệ với file cũ

| Cũ | Vai trò mới |
|----|-------------|
| `PO_SPEC_TEST_CASE_CATALOG` / spine HP-LV-AT | Subset E2E — **không** thay professional UC |
| Menu packs `docs/qa/testcases/**` | Depth màn/field — bổ sung, neo vào FN khi cần |
| `PO_UC_TESTCASE_STATUS_ROLLUP` | Dashboard trạng thái — pointer sang đây |
| `PO_SPEC_TEST_REPORT` | Report thực thi cũ — sẽ chuyển dần sang mẫu §99 |

## Trạng thái chương trình

- **Giai đoạn A (thiết kế):** đang SoT tại thư mục này  
- **Giai đoạn B (chạy E2E / luồng tổng):** **chưa** — chờ Sponsor lệnh  

`uat_done: false` · không auto-dispatch khi chỉ đọc.
