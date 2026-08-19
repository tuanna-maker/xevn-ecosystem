# UC — `UC-XBOS-CC-06` · Canvas quy trình

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-CC-06` |
| **stt_phase1** | 62 |
| **mod** | M01 |
| **name_vi** | Canvas quy trình |
| **actors** | Group CEO / Admin QT |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 62 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #62 · matrix SRS Có |
| **srs_new** | `SRS_VN.md` — WF 2-level · chống tự phê duyệt (khi spawn inbox) |
| **tech_spec** | TECHSPEC_HE · workflow-engine definitions |
| **api_contract** | GET/POST/PUT `/api/xbos/workflow-engine/definitions` `XBOS-WF-200/201` · POST `instances` `XBOS-WF-201` · approve/reject qua tasks complete/reject |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | **PARTIAL** · OPEN+SAVE+F5+CV-L2 sticky prior PASS · **TC-DM-CC-06-CV-SELF-FD-001 PASS** (PO-UC-TC-W4-QA-SELF-FD-02 2026-08-04 — inbox self → **422** `XBOS-WF-422`) · Leave L2 not invented · `po-uc-tc-w4-qa-self-fd-02.md` · `uat_done: false` |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | Canvas save → definition; có thể spawn inbox (UF-XBOS-08 path). |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Mở canvas, lưu/kích hoạt definition (kể cả 2 bước duyệt), F5 còn graph; validate thiếu bước; scope apply-to units.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-CV-R | Mở canvas | Đọc definition | Admin QT |
| CAP-CV-W | Lưu / active definition | Persist graph | Admin QT |
| CAP-CV-SP | Spawn thử từ canvas/policy | instances | Admin |
| CAP-CV-CTRL | Validate & scope | FD/AU | Hệ thống |

**Đếm nghiệp vụ:** 4

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-CV-R | FN-CV-OPEN | Mở canvas QT | GET definitions | N |
| CAP-CV-W | FN-CV-SAVE | Lưu canvas | POST/PUT definitions | Y |
| CAP-CV-W | FN-CV-L2 | Cấu hình 2 cấp duyệt | PUT graph 2 steps | Y |
| CAP-CV-SP | FN-CV-SPAWN | Khởi tạo instance | POST instances | Y |
| CAP-CV-CTRL | FN-CV-VAL | Thiếu bước/vai | PUT | Y |
| CAP-CV-CTRL | FN-CV-SCOPE | Apply-to member sai | PUT | Y |
| CAP-CV-CTRL | FN-CV-SELF | Sau spawn — self-approve chặn | complete | Y |

**Đếm chức năng:** 7

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-CV-OPEN | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-CV-SAVE | 1 | 1 | 0 | 0 | 1 | 3 |
| FN-CV-L2 | 1 | 1 | 1 | 0 | 0 | 3 |
| FN-CV-SPAWN | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-CV-VAL | 0 | 1 | 0 | 0 | 0 | 1 |
| FN-CV-SCOPE | 0 | 1 | 0 | 1 | 0 | 2 |
| FN-CV-SELF | 1 | 1 | 0 | 0 | 0 | 2 |
| **Tổng** | 5 | 6 | 1 | 1 | 2 | **15** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-CC-06-CV-OPEN-HP-001 | CAP-CV-R | FN-CV-OPEN | HP | P0 | ceo@xe.vn / Group CEO | login | 1. CC → Quy trình → mở canvas | 200 definitions · canvas render | UI/API | CC-06 |
| TC-DM-CC-06-CV-OPEN-UX-001 | CAP-CV-R | FN-CV-OPEN | UX | P1 | ceo@xe.vn / Group CEO | — | 1. API chậm | loading · không trắng | UI | UX |
| TC-DM-CC-06-CV-SAVE-HP-001 | CAP-CV-W | FN-CV-SAVE | HP | P0 | ceo@xe.vn / Group CEO | canvas mở | 1. Sửa node/edge 2. Lưu 3. F5 | `XBOS-WF-201` · graph sticky | UI/API | UF WF canvas |
| TC-DM-CC-06-CV-SAVE-FD-001 | CAP-CV-W | FN-CV-SAVE | FD | P0 | ceo@xe.vn / Group CEO | canvas | 1. Lưu graph rỗng / thiếu end | 4xx/`XBOS-WF-400` | API | FD |
| TC-DM-CC-06-CV-L2-HP-001 | CAP-CV-W | FN-CV-L2 | HP | P0 | ceo@xe.vn / Group CEO | canvas | 1. Thêm bước L1+L2 approver hats 2. Lưu active | 201 · 2 pending steps khi spawn | UI/API | SRS_VN 2-level |
| TC-DM-CC-06-CV-L2-FD-001 | CAP-CV-W | FN-CV-L2 | FD | P0 | ceo@xe.vn / Group CEO | — | 1. L2 không gán resolver | validate fail | API | FD L2 |
| TC-DM-CC-06-CV-L2-BD-001 | CAP-CV-W | FN-CV-L2 | BD | P1 | ceo@xe.vn / Group CEO | — | 1. Đúng 2 bước vs 3 bước | accept theo BR | API | BD |
| TC-DM-CC-06-CV-SPAWN-HP-001 | CAP-CV-SP | FN-CV-SPAWN | HP | P1 | ceo@xe.vn / Group CEO | definition active | 1. POST instances từ FE path | `XBOS-WF-201` · inbox có task | API/UI | instances |
| TC-DM-CC-06-CV-SPAWN-FD-001 | CAP-CV-SP | FN-CV-SPAWN | FD | P1 | ceo@xe.vn / Group CEO | definition inactive | 1. Spawn | 4xx SPAWN-MISSING honest | API | FD spawn |
| TC-DM-CC-06-CV-VAL-FD-001 | CAP-CV-CTRL | FN-CV-VAL | FD | P0 | ceo@xe.vn / Group CEO | canvas | 1. Edge reject không dashed policy UI | FE warning hoặc save fail theo BR | UI | UX dashed |
| TC-DM-CC-06-CV-SCOPE-AU-001 | CAP-CV-CTRL | FN-CV-SCOPE | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. PUT definition holding | 403/409 | API | AU |
| TC-DM-CC-06-CV-SCOPE-FD-001 | CAP-CV-CTRL | FN-CV-SCOPE | FD | P1 | ceo@xe.vn / Group CEO | apply-to unit lạ | 1. Lưu apply scope sai partition | reject (workflow-apply-scope) | API | apply-scope |
| TC-DM-CC-06-CV-SELF-FD-001 | CAP-CV-CTRL | FN-CV-SELF | FD | P0 | ceo@xe.vn / Group CEO | spawn instance do chính user | 1. Inbox tự duyệt | BR-WF-04 block | API/UI | **PASS 2026-08-04** `po-uc-tc-w4-qa-self-fd-02.md` — browser self → **422** `XBOS-WF-422` · prior FAIL closed |
| TC-DM-CC-06-CV-SELF-HP-001 | CAP-CV-CTRL | FN-CV-SELF | HP | P1 | Approver khác | task gán đúng | 1. complete | `XBOS-WF-200` | API | approve ok |
| TC-DM-CC-06-CV-SAVE-UX-001 | CAP-CV-W | FN-CV-SAVE | UX | P1 | ceo@xe.vn / Group CEO | sau save | 1. Quan sát | toast · canvas không mất node | UI | UX |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | 4 | YES | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | 6 | PARTIAL | — |
| Auth/scope nếu đa CT | required | YES | — |
| SPEC_GAP ghi rõ | — | none recorded | — |
| Self-approve FD (WF) | YES | YES | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | workflow-engine definitions/instances/tasks | workflow-engine.controller.ts |
| FE menu/nút/role | CC Quy trình canvas dots + Bézier | UF canvas / WF |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | main vs member apply-to + BR-WF-04 | workflow-apply-scope.ts |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-CC-06
cases_designed: 15
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
