# UC — `XBOS-DM-12` · Gửi phê duyệt thay đổi nhạy cảm

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-12` |
| **stt_phase1** | 88 |
| **mod** | M01 |
| **name_vi** | Gửi phê duyệt thay đổi nhạy cảm |
| **actors** | Quản trị danh mục XBOS · Group CEO · (CEO CT thành viên khi request) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 88 · `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` · PHASE1 matrix row 88 |
| **srs_new** | `docs/brand-new-documents-20270801/SRS_VN.md` catalog/tenant (overlap) · **N/A-DELTA** nếu pack mới chưa tách FR-DM-05..18 |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · §8.1 catalog publish/pull · `docs/xbos/TECHSPEC.md` M01-Catalog |
| **api_contract** | `POST …/catalog-governance/workflows/start` → **XBOS-CAT-211** |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_IMPL |
| **code_note** | Mapped catalog-governance workflows/start + HRM extension apply spawn. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Người quản trị danh mục thực hiện «Gửi phê duyệt thay đổi nhạy cảm» đúng phạm vi tenant/công ty, có kiểm soát validate/BR và scope; sau thao tác UI/API phản ánh đúng (F5). Đưa thay đổi danh mục vào hàng chờ duyệt tập đoàn/WF.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị ngữ cảnh danh mục | Mở đúng phân hệ / nhóm trước thao tác | Quản trị danh mục XBOS |
| CAP-02 | Gửi phê duyệt thay đổi nhạy cảm | Đưa thay đổi danh mục vào hàng chờ duyệt tập đoàn/WF. | Quản trị danh mục XBOS · (gov nếu nhạy cảm) |
| CAP-03 | Xác nhận sau thao tác | FE sau 2xx + F5 / consumer thấy đúng | Quản trị · phân hệ đích |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở màn quản trị danh mục / settings liên quan | CC settings / catalog admin | N |
| CAP-02 | FN-SUBMIT | Gửi yêu cầu phê duyệt | Gửi duyệt · POST workflows/start | Y |
| CAP-03 | FN-VERIFY | Xác nhận list/detail sau mutate hoặc export | FE list + F5 / file | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-SUBMIT | 1 | 1 | 0 | 1 | 1 | 4 |
| FN-VERIFY | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 3 | 1 | 0 | 2 | 3 | **9** |

> **cases_designed (SoT §5 rows):** **14** (fn Σ thiết kế = 9; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM12-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Login | 1. Tạo thay đổi nhạy cảm từ FE | Change set sẵn | UI | #88 |
| TC-DM12-OPEN-AU-001 | CAP-01 | FN-OPEN | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member | 1. Thay đổi vượt quyền | Chặn | UI/API | AU |
| TC-DM12-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | — | 1. Mở | Hint cần duyệt | UI | UX |
| TC-DM12-SUB-HP-001 | CAP-02 | FN-SUBMIT | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Change set FE hợp lệ | 1. Gửi duyệt | 211/2xx; task từ FE; F5 pending | UI/API | XBOS-CAT-211 · U65 |
| TC-DM12-SUB-FD-001 | CAP-02 | FN-SUBMIT | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Thiếu payload | 1. Gửi | 4xx; không spawn | UI/API | FD |
| TC-DM12-SUB-AU-001 | CAP-02 | FN-SUBMIT | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Sai scope | 1. Start WF | 403/409 | API | AU |
| TC-DM12-SUB-UX-001 | CAP-02 | FN-SUBMIT | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Sau gửi | 1. UI | Pending/locked | UI | UX |
| TC-DM12-VER-HP-001 | CAP-03 | FN-VERIFY | HP | P0 | Người duyệt catalog gov (Group) | Task tạo FE | 1. Mở inbox catalog | Thấy task | UI | CAT-03 |
| TC-DM12-VER-UX-001 | CAP-03 | FN-VERIFY | UX | P2 | ceo@xe.vn (Group CEO / main→holding) | Trước submit | 1. Inbox | Empty OK — không seed | UI | U65 |
| TC-DM12-SUB-FD-002 | CAP-02 | FN-SUBMIT | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Batch đã started | 1. Start lại | 4xx idempotent/BR | API | FD |
| TC-DM12-SUB-AU-002 | CAP-02 | FN-SUBMIT | AU | P0 | anonymous | — | 1. POST start | 401 | API | AU |
| TC-DM12-OPEN-HP-002 | CAP-01 | FN-OPEN | HP | P1 | ceo@xe.vn (Group CEO / main→holding) | HDSD path | 1. Theo menu SRS | Đúng màn | UI | U76 |
| TC-DM12-VER-HP-002 | CAP-03 | FN-VERIFY | HP | P1 | ceo@xe.vn (Group CEO / main→holding) | Sau start | 1. F5 change set | Trạng thái chờ duyệt | UI | AC |
| TC-DM12-SUB-UX-002 | CAP-02 | FN-SUBMIT | UX | P2 | ceo@xe.vn (Group CEO / main→holding) | Double click | 1. Click 2 lần nhanh | Một instance | UI | UX |

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
| BE API/DTO | WF start / change request | apps/api/xbos-api · catalog-governance / business-master / config-sync |
| FE menu/nút/role | Nút Gửi phê duyệt | apps/web CommandCenter · CatalogGovernancePanel · settings catalogs |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | JWT main→holding; member không ghi đè master platform; 403/409 ngoài scope | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_IMPL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-12
cases_designed: 14
code_readiness: LIKELY_IMPL
uat_done: false
```
