# XBOS Command Center — Mô hình nghiệp vụ (PM SoT)

> **Mục đích:** PM/BA/QA phải nắm *logic từng luồng* trước khi dispatch Dev.  
> **Cập nhật:** 2026-06-06 · Trigger: user feedback U31/U32 — QA PASS ≠ nghiệp vụ đúng.

## 1. XBOS trong hệ sinh thái

Command Center (portal `:5173`) là **vỏ điều hành** — không phải một app đơn. Mỗi menu Cài đặt gọi **bounded context** khác trên `xbos-api` (+ HRM cho danh mục nhân sự).

**Nguyên tắc SRS P0:** Mọi thao tác Lưu/Xóa phải **POST/PUT → GET lại cùng dữ liệu**. Cấm “lưu tạm UI” làm SoT (`COMMAND_CENTER_P0_SRS.md`).

## 1b. Consumer sync (U34 — PM bắt buộc QA kiểm)

Sau **mọi** write (Lưu / Thêm / Xóa / Duyệt / Sync):

| Hành vi user expect | PASS khi | FAIL khi |
|---------------------|----------|----------|
| Thêm bản ghi | **Danh sách** hiện row mới **ngay** (không bắt F5) | Chỉ thấy sau reload hoặc tab khác |
| Sửa trạng thái / field | List + detail + **tab liên quan** cùng giá trị mới | Tab A saved, tab B vẫn cũ |
| Đóng popup/modal sau lưu | Parent list/detail **đã refresh** | Popup đóng nhưng list trống/cũ |
| Action tiếp theo (vd. Mở chi tiết) | Mở đúng entity vừa lưu / workflow instance | No-op, 404, drawer trống |

QA **FAIL** nếu chỉ probe API mà UI consumer không sync — kể cả HTTP 200.

## 2. Ba lớp dữ liệu (cảm quan nghiệp vụ)

| Lớp | Ý nghĩa nghiệp vụ | Ví dụ |
|-----|-------------------|-------|
| **A — Master tập đoàn** | Chuẩn tham chiếu, ít thay đổi | ORG GRADE 9 cấp (static), cột RACI Excel |
| **B — Cấu hình tập đoàn (DB)** | Admin tập đoàn định nghĩa, áp dụng nhiều pháp nhân | Khung phòng/ban mẫu, danh mục hạ tầng nền, workflow, catalog văn bản |
| **C — Dữ liệu theo pháp nhân** | Mỗi công ty con có bản riêng | Cây phòng/ban thực, điểm hạ tầng, RACI ma trận pháp nhân, hồ sơ pháp nhân |

**Lỗi UX hay gặp:** User sửa lớp B/C nhưng xem lại tab/màn lớp A → tưởng “không lưu” (dept ref tab trước fix).

## 3. Map 12 menu Cài đặt → SoT → ai dùng

### Nhóm Thiết lập công ty

| Menu | Nghiệp vụ user | SoT (API) | Sau khi lưu, ai đọc? |
|------|----------------|-----------|----------------------|
| **Đơn vị thành viên** | Khai pháp nhân, cổ đông, tài liệu, RACI entity | `tenant-scope`, `org-foundation`, `raci-governance` | Mọi scope bar; tab Phòng/Ban pháp nhân; RACI |
| **Hạ tầng cơ sở** | Tab1: danh mục nền + phạm vi DN; Tab2: điểm hạ tầng theo DN trong phạm vi | `infrastructure/settings` | Tab2 chỉ nhập được nếu DN ∈ phạm vi Tab1 |
| **Hệ thống Phòng/Ban** | Tab Danh mục khung: CRUD mẫu + sơ đồ chức danh; Tab Tham chiếu: xem master + **khung đã lưu** | `business-master/dept_system_templates` | RACI panel; sau này gán khung cho DN |

### Nhóm vận hành / quản trị

| Menu | Nghiệp vụ | SoT | Phụ thuộc |
|------|-----------|-----|-----------|
| **Phòng/Ban pháp nhân** | Cây PB thực từng DN | `org-foundation/org-units` | UUID pháp nhân từ menu Đơn vị |
| **Danh mục hồ sơ NS** | Khối/trường hồ sơ + sync HRM | `hrm/settings-catalogs` | HRM embed form NV |
| **Duyệt danh mục HRM** | Inbox duyệt extension | `catalog-governance` | J-XBOS-02 publish → HRM |
| **Phân quyền** | Ma trận quyền theo **vai trò** | `position-rbac/matrix` | ≠ RACI tab trong form pháp nhân |
| **Quy trình** | Định nghĩa workflow | `workflow-engine/definitions` | Inbox CC ← tasks |
| **Yêu cầu tài sản** | Phiếu 5 bước | `asset-requests` | — |
| **Văn bản / Đo lường / Giá** | Bảng catalog | `business-master/command_center_catalogs` | Auto-save 800ms |

## 4. Luồng phụ thuộc (phải test theo chuỗi)

```
[1] Đơn vị thành viên (seed UUID)
      ↓
[2] Hạ tầng nền (gán phạm vi DN) → [2b] Điểm hạ tầng
      ↓
[3] Khung PB mẫu (dept_system_templates) → Tham chiếu / RACI
      ↓
[4] Phòng/Ban pháp nhân (org-units theo DN)
      ↓
[5] Danh mục NS → sync → HRM embed
      ↓
[6] Duyệt catalog → publish → HRM catalog-sync
```

**Hai hệ thống dễ nhầm (PM bắt buộc ghi defect nếu user nhầm):**

- **RACI form pháp nhân** (`raci-governance`) vs **Phân quyền settings** (`position-rbac`)
- **Khung mẫu PB** (`company_dept_system`) vs **Cây PB thực** (`tenant_departments`)

## 5. Vì QA báo PASS mà user dùng sai

| Gap QA cũ | Hậu quả user |
|-----------|--------------|
| Chỉ check GET 200 / bảng có dòng | Save → đổi tab → mất sync (dept ref) |
| Không test save → reload → consumer | Catalog/doc/infra “lưu” nhưng F5 mất |
| Mock fallback dev (`VITE_ALLOW_MOCK`) | UI đẹp nhưng không phải DB |
| Static seed (head PB, ORG GRADE master) | Tưởng đã tích hợp NV thật |
| Matrix chỉ P-CC-01/02/09 + HRM embed | 9/12 menu settings **không có hàng matrix** |
| Excel 399 unit test | ≠ journey nghiệp vụ |

## 6. Tiêu chí dispatch Dev mới (PM gate)

Trước mỗi Task dev-fe/dev-be cho XBOS settings:

1. **Ghi rõ lớp A/B/C** và menu bị ảnh hưởng  
2. **Journey id** bắt buộc retest (xem §7)  
3. **PASS** = save → reload/F5 → màn/tab consumer thấy cùng dữ liệu  
4. **Cấm** sign-off chỉ với probe JWT hoặc “tab load 200”

## 7. Journey QA XBOS đề xuất (bổ sung matrix)

| ID | Journey | PASS khi |
|----|---------|----------|
| J-XBOS-03 | Pháp nhân: sửa → lưu → F5 | GET cùng field |
| J-XBOS-04 | Cổ đông / tài liệu CRUD | Round-trip UC-CC-P0-01/02 |
| J-XBOS-05 | Hạ tầng: nền → gán DN → điểm | Tab2 gated đúng phạm vi |
| J-XBOS-06 | Khung PB: sửa sơ đồ → lưu → Tham chiếu + Chi tiết | gradeTitleLayout DB |
| J-XBOS-07 | PB pháp nhân: thêm node → reload cây | org-units |
| J-XBOS-08 | Danh mục NS sync → HRM tab NV | field hiện embed |
| J-XBOS-09 | Phân quyền: toggle → đợi debounce → reload | matrix sticky |
| J-XBOS-10 | Workflow: tạo → lưu → inbox | task pending |
| J-XBOS-11 | Văn bản/đo/giá: sửa → 800ms → F5 | BM catalog |

## 8. Tham chiếu

- SRS P0: `docs/xbos/COMMAND_CENTER_P0_SRS.md`
- Mock audit: `docs/ecosystem/FE_MOCK_TO_API_AUDIT.md`
- Scope: `docs/decisions/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`
- Code hub: `CommandCenterPage.tsx` + `apps/web/web-portal/src/integrations/*`
