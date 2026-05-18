# Gap Analysis — Họp Chủ tịch Nam (HRM–XEVN)

| Mục | Giá trị |
|---|---|
| Phiên bản | 1.0 |
| Ngày | 2026-05-15 |
| Nguồn | `docs/meetings/BIEN_BAN_HOP_HRM_XEVN_NGUYENVAN.md` |

## 1. Tóm tắt

Cuộc họp chốt **hệ điều hành tập đoàn**: tổ chức đa cấp → chức danh/JD/phân quyền → quy trình động → dữ liệu NS/TS. XBOS phải mở rộng từ catalog JSONB sang **mô hình tổ chức + RBAC + workflow runtime**.

## 2. Ma trận gap

| Yêu cầu họp | Trạng thái trước | Hướng xử lý (BRD 2.3+) |
|---|---|---|
| Mảng KD → promote công ty con | Chưa có | `business_segment`, UC-XBOS-10 |
| Hồ sơ ĐKKD đầy đủ | Một phần JSONB | `legal_entity`, API `/org-foundation/legal-entities` |
| Thư viện chức danh tập đoàn | `positions` JSONB | `position_template`, UC-XBOS-11 |
| Kiêm nhiệm + ký đủ từng vai | Chưa có | `position_assignment`, BR-XBOS-MULTI-HAT-01, UC-XBOS-14 |
| Mã quyền + check trùng | Chưa chuẩn | `permission_definition`/`grant`, UC-XBOS-12 |
| JD ↔ quyền ↔ QT đồng bộ | Rời rạc | `job_description`, liên kết template |
| Workflow engine + điều kiện | UI prototype | `workflow_*` tables, UC-XBOS-13/14 |
| Rollup báo cáo tách QT | Chưa có | `reporting_route`, UC-XBOS-15 |
| TS → KT 5 bước | Assets skeleton | `asset_request`, UC-XBOS-16 |
| Portal org mock | P0 audit | `orgFoundationApi`, company registry |
| Import NS 20–30 cột + doc version | HRM partial | HRM SRS + `employee_document_versions` |

## 3. Thứ tự triển khai (không đảo)

1. Thiết lập công ty & pháp nhân  
2. Sơ đồ tổ chức & phòng ban  
3. Chức danh, JD, phân quyền  
4. Quy trình động  
5. Dữ liệu NS, TS, phương tiện  

## 4. Backlog ưu tiên kỹ thuật

| ID | Mô tả | Wave |
|---|---|---|
| XBOS-B1 | Legal entity + org tree API | B |
| XBOS-B2 | Portal thiết lập công ty + GlobalFilter | B |
| XBOS-C1 | Position template + assignment + permission | C |
| XBOS-D1 | Workflow definition/instance pilot | D |
| XBOS-D2 | Payment workflow pilot (amount routing) | D |
| XBOS-E1 | Asset request → finance confirm | E |
| XBOS-E2 | Executive dashboard rollup hook | E |

## 5. Ngoài phạm vi đợt này

- QT vận tải end-to-end (phân hệ Vận hành)  
- Toàn bộ bộ QT kế toán (bổ sung dần)  
- Prisma migration toàn hệ (SQL trước)
