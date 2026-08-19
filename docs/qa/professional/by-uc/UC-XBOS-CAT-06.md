# UC — `UC-XBOS-CAT-06` · Từ chối bước duyệt danh mục

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-CAT-06` |
| **stt_phase1** | 372 |
| **mod** | M02 |
| **name_vi** | Từ chối bước duyệt danh mục |
| **actors** | Group CEO / catalog approver · Member requester (HR/CEO CT) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 372 · `docs/xbos/USECASE_TONG_THE_XBOS.md` · FR-XBOS-CAT-* |
| **srs_new** | `SRS_VN.md` § WF/catalog · `docs/xbos/TECHSPEC.md` FR-XBOS-CAT-02/05 |
| **tech_spec** | `TECHSPEC_HE` §7–8 · `docs/xbos/TECHSPEC.md` §5 M01-Catalog · catalog-governance |
| **api_contract** | `POST /api/xbos/catalog-governance/tasks/:taskId/reject` → **XBOS-CAT-202** |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_IMPL |
| **code_note** | POST tasks/:taskId/reject → XBOS-CAT-202; lý do theo API_CONTRACT. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Approver từ chối kèm lý do; request không áp dụng; requester thấy trạng thái.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Mở task | Pending rejectable | Người duyệt catalog gov (Group) |
| CAP-02 | Từ chối | Reject + note | Người duyệt catalog gov (Group) |
| CAP-03 | Hậu từ chối | Không apply | Requester |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN-TASK | Mở task pending | Inbox | N |
| CAP-02 | FN-REJECT | Reject catalog task | POST reject | Y |
| CAP-03 | FN-POST | Verify not applied | FE F5 | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN-TASK | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-REJECT | 1 | 2 | 1 | 1 | 1 | 6 |
| FN-POST | 1 | 0 | 0 | 1 | 1 | 3 |
| **Tổng** | 3 | 2 | 1 | 3 | 3 | **12** |

> **cases_designed (SoT §5 rows):** **14** (fn Σ thiết kế = 12; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-CAT06-OP-HP-001 | CAP-01 | FN-OPEN-TASK | HP | P0 | Người duyệt catalog gov (Group) | Task FE | 1. Mở | Nút Từ chối | UI | UF-09 |
| TC-CAT06-OP-AU-001 | CAP-01 | FN-OPEN-TASK | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | — | 1. Mở | 403/ẩn | UI/API | AU |
| TC-CAT06-OP-UX-001 | CAP-01 | FN-OPEN-TASK | UX | P1 | Người duyệt catalog gov (Group) | Empty | 1. Inbox | Empty U65 | UI | U65 |
| TC-CAT06-RJ-HP-001 | CAP-02 | FN-REJECT | HP | P0 | Người duyệt catalog gov (Group) | Pending | 1. Từ chối + lý do ≥10 | 202; F5 rejected | UI/API | XBOS-CAT-202 |
| TC-CAT06-RJ-FD-001 | CAP-02 | FN-REJECT | FD | P0 | Người duyệt catalog gov (Group) | Pending | 1. Lý do ngắn | 4xx; vẫn pending | UI/API | API_CONTRACT |
| TC-CAT06-RJ-FD-002 | CAP-02 | FN-REJECT | FD | P0 | Người duyệt catalog gov (Group) | Terminal | 1. Reject lại | 4xx | API | FD |
| TC-CAT06-RJ-BD-001 | CAP-02 | FN-REJECT | BD | P1 | Người duyệt catalog gov (Group) | — | 1. Lý do đúng 10 ký tự | 202 | API | BD |
| TC-CAT06-RJ-AU-001 | CAP-02 | FN-REJECT | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member | 1. POST reject | 403/409 | API | AU |
| TC-CAT06-RJ-UX-001 | CAP-02 | FN-REJECT | UX | P1 | Người duyệt catalog gov (Group) | Dialog destructive | 1. Cancel | Không API | UI | UX |
| TC-CAT06-POST-HP-001 | CAP-03 | FN-POST | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Sau reject | 1. Consumer | Item không áp dụng | UI/API | AC |
| TC-CAT06-POST-AU-001 | CAP-03 | FN-POST | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Requester | 1. Xem trạng thái | Thấy rejected + lý do trong scope | UI | AU |
| TC-CAT06-POST-UX-001 | CAP-03 | FN-POST | UX | P1 | Người duyệt catalog gov (Group) | Inbox | 1. F5 | Task khỏi pending | UI | UX |
| TC-CAT06-RJ-AU-002 | CAP-02 | FN-REJECT | AU | P0 | anonymous | — | 1. POST | 401 | API | AU |
| TC-CAT06-RJ-HP-002 | CAP-02 | FN-REJECT | HP | P1 | Người duyệt catalog gov (Group) | HDSD | 1. Đúng nút Từ chối | U76 | UI | U76 |

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
| BE API/DTO | actOnTask reject | apps/api/xbos-api/src/catalog-governance/catalog-governance.controller.ts |
| FE menu/nút/role | POP-CAT-REJECT | CatalogGovernancePanel · CommandCenterInbox · groupHrCatalogApi |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | Group read main→holding; write scope match; member start với memberCompanyId | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_IMPL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-CAT-06
cases_designed: 14
code_readiness: LIKELY_IMPL
uat_done: false
```
