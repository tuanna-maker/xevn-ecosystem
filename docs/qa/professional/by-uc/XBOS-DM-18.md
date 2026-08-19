# UC — `XBOS-DM-18` · Thông báo phân hệ có danh mục mới

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-18` |
| **stt_phase1** | 94 |
| **mod** | M01 |
| **name_vi** | Thông báo phân hệ có danh mục mới |
| **actors** | Quản trị danh mục XBOS · Group CEO · (CEO CT thành viên khi request) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 94 · `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` · PHASE1 matrix row 94 |
| **srs_new** | `docs/brand-new-documents-20270801/SRS_VN.md` catalog/tenant (overlap) · **N/A-DELTA** nếu pack mới chưa tách FR-DM-05..18 |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · §8.1 catalog publish/pull · `docs/xbos/TECHSPEC.md` M01-Catalog |
| **api_contract** | Catalog sync notify / pull · BullMQ (TECH_SPEC_VN) |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_PARTIAL |
| **code_note** | TECHSPEC_HE queue lan truyền catalog; FE notice có thể là pull badge. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Người quản trị danh mục thực hiện «Thông báo phân hệ có danh mục mới» đúng phạm vi tenant/công ty, có kiểm soát validate/BR và scope; sau thao tác UI/API phản ánh đúng (F5). Phân hệ đích nhận tín hiệu/notification sau publish.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị ngữ cảnh danh mục | Mở đúng phân hệ / nhóm trước thao tác | Quản trị danh mục XBOS |
| CAP-02 | Thông báo phân hệ có danh mục mới | Phân hệ đích nhận tín hiệu/notification sau publish. | Quản trị danh mục XBOS · (gov nếu nhạy cảm) |
| CAP-03 | Xác nhận sau thao tác | FE sau 2xx + F5 / consumer thấy đúng | Quản trị · phân hệ đích |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở màn quản trị danh mục / settings liên quan | CC settings / catalog admin | N |
| CAP-02 | FN-NOTIFY | Phát/nhận thông báo catalog mới | Event/banner pull | Y |
| CAP-03 | FN-VERIFY | Xác nhận list/detail sau mutate hoặc export | FE list + F5 / file | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-NOTIFY | 1 | 1 | 0 | 1 | 1 | 4 |
| FN-VERIFY | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 3 | 1 | 0 | 2 | 3 | **9** |

> **cases_designed (SoT §5 rows):** **11** (fn Σ thiết kế = 9; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM18-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Đã publish FE | 1. Mở phân hệ đích | Tín hiệu version mới hoặc list mới | UI | #94 |
| TC-DM18-OPEN-AU-001 | CAP-01 | FN-OPEN | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | CT không assign | 1. Notice | Không nhận nhầm | UI/API | AU |
| TC-DM18-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Chưa publish | 1. Mở | Không false-positive | UI | UX |
| TC-DM18-NTF-HP-001 | CAP-02 | FN-NOTIFY | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Publish OK | 1. Quan sát notify/pull | Consumer cập nhật | UI/API | DM-18 |
| TC-DM18-NTF-FD-001 | CAP-02 | FN-NOTIFY | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Sync fail | 1. Error path | Retry/banner lỗi | API | FD |
| TC-DM18-NTF-AU-001 | CAP-02 | FN-NOTIFY | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Cross-tenant | 1. Event CT khác | Không leak | API | AU |
| TC-DM18-NTF-UX-001 | CAP-02 | FN-NOTIFY | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Badge | 1. Click notice | Deep link đúng màn | UI | UX |
| TC-DM18-VER-HP-001 | CAP-03 | FN-VERIFY | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Sau sync | 1. So version | Khớp published | UI/API | AC |
| TC-DM18-VER-UX-001 | CAP-03 | FN-VERIFY | UX | P2 | ceo@xe.vn (Group CEO / main→holding) | Dismiss | 1. Đóng banner | Không hiện lại sai | UI | UX |
| TC-DM18-NTF-HP-002 | CAP-02 | FN-NOTIFY | HP | P1 | ceo@xe.vn (Group CEO / main→holding) | Multi module assign | 1. Publish | Chỉ module được gán nhận | UI/API | DM-07 neo |
| TC-DM18-OPEN-FD-001 | CAP-01 | FN-OPEN | FD | P1 | ceo@xe.vn (Group CEO / main→holding) | API notify down | 1. Mở | Degraded rõ — không silent mock | UI | FD |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Y | Y | |
| Mọi FN mutate ≥1 HP + ≥1 FD | Y | Y |  |
| Auth/scope nếu đa CT | Y | Y | |
| SPEC_GAP ghi rõ | Y | — | |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Outbox/event notify · pull hint | apps/api/xbos-api · catalog-governance / business-master / config-sync |
| FE menu/nút/role | Banner/menu notice sau publish | apps/web CommandCenter · CatalogGovernancePanel · settings catalogs |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | JWT main→holding; member không ghi đè master platform; 403/409 ngoài scope | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_PARTIAL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-18
cases_designed: 11
code_readiness: LIKELY_PARTIAL
uat_done: false
```
