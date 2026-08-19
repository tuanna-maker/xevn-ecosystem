# UC — `XBOS-DM-13` · Phê duyệt hoặc từ chối

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-13` |
| **stt_phase1** | 89 |
| **mod** | M01 |
| **name_vi** | Phê duyệt hoặc từ chối |
| **actors** | Quản trị danh mục XBOS · Group CEO · (CEO CT thành viên khi request) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 89 · `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` · PHASE1 matrix row 89 |
| **srs_new** | `docs/brand-new-documents-20270801/SRS_VN.md` catalog/tenant (overlap) · **N/A-DELTA** nếu pack mới chưa tách FR-DM-05..18 |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · §8.1 catalog publish/pull · `docs/xbos/TECHSPEC.md` M01-Catalog |
| **api_contract** | `POST …/tasks/:taskId/approve` → **XBOS-CAT-201** · reject → **XBOS-CAT-202** |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_IMPL |
| **code_note** | approve XBOS-CAT-201 / reject XBOS-CAT-202; FE confirm dialogs. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Người quản trị danh mục thực hiện «Phê duyệt hoặc từ chối» đúng phạm vi tenant/công ty, có kiểm soát validate/BR và scope; sau thao tác UI/API phản ánh đúng (F5). Approver quyết định thay đổi nhạy cảm / extension.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị ngữ cảnh danh mục | Mở đúng phân hệ / nhóm trước thao tác | Quản trị danh mục XBOS |
| CAP-02 | Phê duyệt hoặc từ chối | Approver quyết định thay đổi nhạy cảm / extension. | Quản trị danh mục XBOS · (gov nếu nhạy cảm) |
| CAP-03 | Xác nhận sau thao tác | FE sau 2xx + F5 / consumer thấy đúng | Quản trị · phân hệ đích |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở màn quản trị danh mục / settings liên quan | CC settings / catalog admin | N |
| CAP-02 | FN-APPROVE | Phê duyệt | POST tasks/:id/approve | Y |
| CAP-02 | FN-REJECT | Từ chối + lý do | POST reject | Y |
| CAP-03 | FN-VERIFY | Xác nhận list/detail sau mutate hoặc export | FE list + F5 / file | N |

**Đếm chức năng:** 4

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-APPROVE | 1 | 1 | 0 | 1 | 1 | 4 |
| FN-REJECT | 1 | 1 | 1 | 1 | 0 | 4 |
| FN-VERIFY | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 4 | 2 | 1 | 3 | 3 | **13** |

> **cases_designed (SoT §5 rows):** **16** (fn Σ thiết kế = 13; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM13-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | Người duyệt catalog gov (Group) | Task từ FE chain | 1. Mở task | Detail actionable | UI | #89 · UF-09 |
| TC-DM13-OPEN-AU-001 | CAP-01 | FN-OPEN | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Không assignee | 1. Mở task | 403/không thấy | UI/API | AU |
| TC-DM13-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | Người duyệt catalog gov (Group) | Empty inbox | 1. Mở | Empty U65 — không seed | UI | U65 |
| TC-DM13-AP-HP-001 | CAP-02 | FN-APPROVE | HP | P0 | Người duyệt catalog gov (Group) | Pending FE | 1. Phê duyệt confirm | 201; F5 approved | UI/API | XBOS-CAT-201 |
| TC-DM13-AP-FD-001 | CAP-02 | FN-APPROVE | FD | P0 | Người duyệt catalog gov (Group) | Task terminal | 1. Approve lại | 4xx | API | FD |
| TC-DM13-AP-AU-001 | CAP-02 | FN-APPROVE | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member duyệt hộ | 1. Approve | 403/409 | API | AU |
| TC-DM13-AP-UX-001 | CAP-02 | FN-APPROVE | UX | P1 | Người duyệt catalog gov (Group) | Dialog | 1. Cancel | Không gọi API | UI | UX |
| TC-DM13-RJ-HP-001 | CAP-02 | FN-REJECT | HP | P0 | Người duyệt catalog gov (Group) | Pending khác FE | 1. Từ chối + lý do đủ | 202; F5 rejected | UI/API | XBOS-CAT-202 |
| TC-DM13-RJ-FD-001 | CAP-02 | FN-REJECT | FD | P0 | Người duyệt catalog gov (Group) | Pending | 1. Lý do <10 ký tự (contract) | 4xx; vẫn pending | UI/API | API_CONTRACT |
| TC-DM13-RJ-BD-001 | CAP-02 | FN-REJECT | BD | P1 | Người duyệt catalog gov (Group) | — | 1. Lý do đúng 10 ký tự | Pass biên | API | BD |
| TC-DM13-RJ-AU-001 | CAP-02 | FN-REJECT | AU | P0 | anonymous | — | 1. POST reject | 401 | API | AU |
| TC-DM13-VER-HP-001 | CAP-03 | FN-VERIFY | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Sau approve | 1. Consumer HRM | Item áp dụng | UI/API | UF-15 |
| TC-DM13-VER-UX-001 | CAP-03 | FN-VERIFY | UX | P2 | Người duyệt catalog gov (Group) | Sau reject | 1. Requester xem | Thấy lý do | UI | UX |
| TC-DM13-AP-HP-002 | CAP-02 | FN-APPROVE | HP | P1 | Người duyệt catalog gov (Group) | Multi-item batch | 1. Approve | Mọi item theo BR | UI/API | HP |
| TC-DM13-RJ-FD-002 | CAP-02 | FN-REJECT | FD | P1 | Người duyệt catalog gov (Group) | Thiếu review_note khi bắt buộc | 1. Reject trống | 4xx | API | FD |
| TC-DM13-OPEN-HP-002 | CAP-01 | FN-OPEN | HP | P1 | Người duyệt catalog gov (Group) | HDSD | 1. Đúng menu Phê duyệt danh mục | Đúng panel | UI | U76 |

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
| BE API/DTO | POST approve/reject | apps/api/xbos-api · catalog-governance / business-master / config-sync |
| FE menu/nút/role | POP-CAT-APPROVE / REJECT · Inbox | apps/web CommandCenter · CatalogGovernancePanel · settings catalogs |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | JWT main→holding; member không ghi đè master platform; 403/409 ngoài scope | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_IMPL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-13
cases_designed: 16
code_readiness: LIKELY_IMPL
uat_done: false
```
