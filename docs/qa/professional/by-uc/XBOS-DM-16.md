# UC — `XBOS-DM-16` · Yêu cầu xóa trường — phê duyệt tập đoàn

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-16` |
| **stt_phase1** | 92 |
| **mod** | M01 |
| **name_vi** | Yêu cầu xóa trường — phê duyệt tập đoàn |
| **actors** | Quản trị danh mục XBOS · Group CEO · (CEO CT thành viên khi request) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 92 · `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` · PHASE1 matrix row 92 |
| **srs_new** | `docs/brand-new-documents-20270801/SRS_VN.md` catalog/tenant (overlap) · **N/A-DELTA** nếu pack mới chưa tách FR-DM-05..18 |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · §8.1 catalog publish/pull · `docs/xbos/TECHSPEC.md` M01-Catalog |
| **api_contract** | extension-requests · approve/reject · soft-delete only |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_PARTIAL |
| **code_note** | Soft-delete/inactive qua gov; cấm hard-delete platform — SRS_VN. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Người quản trị danh mục thực hiện «Yêu cầu xóa trường — phê duyệt tập đoàn» đúng phạm vi tenant/công ty, có kiểm soát validate/BR và scope; sau thao tác UI/API phản ánh đúng (F5). Đề nghị gỡ field; hiệu lực sau duyệt tập đoàn (không hard-delete platform).

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị ngữ cảnh danh mục | Mở đúng phân hệ / nhóm trước thao tác | Quản trị danh mục XBOS |
| CAP-02 | Yêu cầu xóa trường — phê duyệt tập đoàn | Đề nghị gỡ field; hiệu lực sau duyệt tập đoàn (không hard-delete platform). | Quản trị danh mục XBOS · (gov nếu nhạy cảm) |
| CAP-03 | Xác nhận sau thao tác | FE sau 2xx + F5 / consumer thấy đúng | Quản trị · phân hệ đích |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở màn quản trị danh mục / settings liên quan | CC settings / catalog admin | N |
| CAP-02 | FN-REQ-DEL | Gửi yêu cầu xóa/ngừng trường | Remove → submit gov | Y |
| CAP-02 | FN-GOV-DEL | Tập đoàn duyệt/từ chối xóa | Approve/reject | Y |
| CAP-03 | FN-VERIFY | Xác nhận list/detail sau mutate hoặc export | FE list + F5 / file | N |

**Đếm chức năng:** 4

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-REQ-DEL | 1 | 1 | 0 | 1 | 1 | 4 |
| FN-GOV-DEL | 1 | 1 | 0 | 1 | 0 | 3 |
| FN-VERIFY | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 4 | 2 | 0 | 3 | 3 | **12** |

> **cases_designed (SoT §5 rows):** **14** (fn Σ thiết kế = 12; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM16-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Field tồn tại FE | 1. Mở cấu hình | Thấy field | UI | #92 |
| TC-DM16-OPEN-AU-001 | CAP-01 | FN-OPEN | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Platform field | 1. Thử xóa cứng | Chặn / chỉ request | UI/API | SRS soft-delete |
| TC-DM16-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | — | 1. Hover xóa | Confirm destructive | UI | UX |
| TC-DM16-DEL-HP-001 | CAP-02 | FN-REQ-DEL | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Field tenant FE | 1. Gửi yêu cầu xóa | 2xx pending; consumer chưa mất | UI/API | DM-16 |
| TC-DM16-DEL-FD-001 | CAP-02 | FN-REQ-DEL | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Platform lock | 1. Request | 4xx BR | API | FD |
| TC-DM16-DEL-AU-001 | CAP-02 | FN-REQ-DEL | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Sai CT | 1. Request | 403/409 | API | AU |
| TC-DM16-DEL-UX-001 | CAP-02 | FN-REQ-DEL | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Pending | 1. UI | Badge chờ duyệt | UI | UX |
| TC-DM16-GOV-HP-001 | CAP-02 | FN-GOV-DEL | HP | P0 | Người duyệt catalog gov (Group) | Task FE | 1. Phê duyệt xóa | 201; soft inactive; F5 | UI/API | XBOS-CAT-201 |
| TC-DM16-GOV-FD-001 | CAP-02 | FN-GOV-DEL | FD | P0 | Người duyệt catalog gov (Group) | Reject path | 1. Từ chối | 202; field giữ | UI/API | XBOS-CAT-202 |
| TC-DM16-GOV-AU-001 | CAP-02 | FN-GOV-DEL | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member approve | 1. Approve | 403 | API | AU |
| TC-DM16-VER-HP-001 | CAP-03 | FN-VERIFY | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Sau approve | 1. Consumer | Field không dùng; không vỡ FK | UI | AC |
| TC-DM16-VER-UX-001 | CAP-03 | FN-VERIFY | UX | P2 | ceo@xe.vn (Group CEO / main→holding) | — | 1. History | Event ngừng | UI | DM-14 |
| TC-DM16-DEL-FD-002 | CAP-02 | FN-REQ-DEL | FD | P1 | ceo@xe.vn (Group CEO / main→holding) | Field đang pending khác | 1. Request trùng | 4xx | API | FD |
| TC-DM16-GOV-HP-002 | CAP-02 | FN-GOV-DEL | HP | P1 | Người duyệt catalog gov (Group) | Approve confirm | 1. Cancel rồi approve | Chỉ 1 lần API khi confirm | UI | UX/HP |

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
| BE API/DTO | Extension delete + approve | apps/api/xbos-api · catalog-governance / business-master / config-sync |
| FE menu/nút/role | UI gỡ field + gov panel | apps/web CommandCenter · CatalogGovernancePanel · settings catalogs |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | JWT main→holding; member không ghi đè master platform; 403/409 ngoài scope | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_PARTIAL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-16
cases_designed: 14
code_readiness: LIKELY_PARTIAL
uat_done: false
```
