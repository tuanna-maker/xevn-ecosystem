# UC — `UC-CC-P0-06` · Hộp thư — mở chi tiết tác vụ quy trình

| Meta | Value |
|------|--------|
| **uc_id** | `UC-CC-P0-06` |
| **stt_phase1** | 55 |
| **mod** | M00 |
| **name_vi** | Hộp thư — mở chi tiết tác vụ quy trình |
| **actors** | Approver · Group CEO · Submitter |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 55 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #55 · matrix SRS Có |
| **srs_new** | `SRS_VN.md` — máy trạng thái WF phê duyệt **hai cấp**, chống tự phê duyệt, SLA 24h/48h (map khi UI hiện L2) |
| **tech_spec** | TECHSPEC_HE §8 · workflow-engine tasks |
| **api_contract** | GET `/api/xbos/workflow-engine/tasks` `XBOS-WF-203` · GET `instances/:id/detail` `XBOS-WF-204` · POST `tasks/:id/complete` `XBOS-WF-200` · POST `tasks/:id/reject` `XBOS-WF-205` · alias approve path qua complete · `API_CONTRACT_VN` POST `/xbos/workflows/:id/approve|reject` |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | **PARTIAL** · PO-UC-TC-W4-QA-SELF-FD-02 2026-08-04 · LIST+DET+APPR prior PASS · **TC-CC-P0-06-INB-SELF-FD-001 PASS** (browser self → **422** `XBOS-WF-422` BR-WF-04 · F5 still pending) · control non-self **201** `XBOS-WF-200` PASS · Leave L2 SPEC_GAP not invented · `po-uc-tc-w4-qa-self-fd-02.md` · `uat_done: false` |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | workflow-engine complete/reject + CC inbox FE; UF-XBOS-08; BR-WF-04 self-approve unit tests. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Mở hộp thư, xem chi tiết task WF sinh từ FE (không seed), duyệt/từ chối đúng assignee, chặn tự duyệt và sai scope; hỗ trợ quan sát bước L2 khi definition 2 cấp.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-INB-R | Mở hộp thư & chi tiết | Đọc task | Approver |
| CAP-INB-AP | Phê duyệt bước | complete/approve | Approver |
| CAP-INB-RJ | Từ chối bước | reject + lý do | Approver |
| CAP-INB-CTRL | Self-approve & scope | BR-WF-04 · AU | Hệ thống |

**Đếm nghiệp vụ:** 4

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-INB-R | FN-INB-LIST | List inbox tasks | GET /workflow-engine/tasks | N |
| CAP-INB-R | FN-INB-DET | Mở chi tiết phiên/task | GET instances/:id/detail | N |
| CAP-INB-AP | FN-INB-APPR | Duyệt / Xử lý nhanh | POST tasks/:id/complete | Y |
| CAP-INB-AP | FN-INB-L2 | Duyệt cấp 2 (khi WF 2-level) | POST complete L2 | Y |
| CAP-INB-RJ | FN-INB-REJ | Từ chối | POST tasks/:id/reject | Y |
| CAP-INB-CTRL | FN-INB-SELF | Chặn tự duyệt | complete | Y |
| CAP-INB-CTRL | FN-INB-SCOPE | Task ngoài scope CT | complete | Y |

**Đếm chức năng:** 7

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-INB-LIST | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-INB-DET | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-INB-APPR | 1 | 1 | 0 | 0 | 1 | 3 |
| FN-INB-L2 | 1 | 1 | 0 | 0 | 1 | 3 |
| FN-INB-REJ | 1 | 1 | 1 | 0 | 0 | 3 |
| FN-INB-SELF | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-INB-SCOPE | 0 | 0 | 0 | 2 | 0 | 2 |
| **Tổng** | 6 | 5 | 1 | 3 | 3 | **18** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-CC-P0-06-INB-LIST-HP-001 | CAP-INB-R | FN-INB-LIST | HP | P0 | ceo@xe.vn / Group CEO | đã có task từ chuỗi FE (U65 — không seed) | 1. CC → Hộp thư | 200 `XBOS-WF-203` · thấy task stamp | UI/API | UF-XBOS-08 |
| TC-CC-P0-06-INB-LIST-UX-001 | CAP-INB-R | FN-INB-LIST | UX | P0 | ceo@xe.vn / Group CEO | inbox trống | 1. Mở Hộp thư | empty · **BLOCKED** tạo nguồn FE — cấm seed | UI | U65 |
| TC-CC-P0-06-INB-DET-HP-001 | CAP-INB-R | FN-INB-DET | HP | P0 | ceo@xe.vn / Group CEO | có task | 1. Click mở chi tiết | 200 `XBOS-WF-204` · steps/assignee | UI/API | P0-06 |
| TC-CC-P0-06-INB-DET-FD-001 | CAP-INB-R | FN-INB-DET | FD | P1 | ceo@xe.vn / Group CEO | — | 1. Deep link instanceId giả | 404 | API | 404 |
| TC-CC-P0-06-INB-APPR-HP-001 | CAP-INB-AP | FN-INB-APPR | HP | P0 | ceo@xe.vn / Group CEO | task pending gán CEO từ FE spawn | 1. Duyệt/Xử lý nhanh | 201/200 `XBOS-WF-200` · card biến · F5 · consumer sync | UI/API | UF-XBOS-08 · complete |
| TC-CC-P0-06-INB-APPR-FD-001 | CAP-INB-AP | FN-INB-APPR | FD | P0 | ceo@xe.vn / Group CEO | task already completed | 1. complete lại | 4xx/no-op | API | FD done |
| TC-CC-P0-06-INB-APPR-UX-001 | CAP-INB-AP | FN-INB-APPR | UX | P1 | ceo@xe.vn / Group CEO | sau duyệt | 1. Quan sát list | count giảm không cần hard-refresh sai | UI | UX |
| TC-CC-P0-06-INB-L2-HP-001 | CAP-INB-AP | FN-INB-L2 | HP | P0 | ceo@xe.vn / Group CEO | definition 2-level · L1 đã duyệt · task L2 pending (tạo từ FE) | 1. Approver L2 Duyệt | `XBOS-WF-200` · instance terminal/completed · F5 | UI/API | SRS_VN 2-level |
| TC-CC-P0-06-INB-L2-FD-001 | CAP-INB-AP | FN-INB-L2 | FD | P0 | ceo@xe.vn / Group CEO | L1 chưa xong | 1. Cố complete L2 sớm | 4xx / không hiện task | API | order |
| TC-CC-P0-06-INB-L2-UX-001 | CAP-INB-AP | FN-INB-L2 | UX | P1 | ceo@xe.vn / Group CEO | giữa L1–L2 | 1. Xem detail | hiển thị cấp đang chờ | UI | UX L2 |
| TC-CC-P0-06-INB-REJ-HP-001 | CAP-INB-RJ | FN-INB-REJ | HP | P0 | ceo@xe.vn / Group CEO | task pending từ FE | 1. Từ chối + lý do ≥10 ký tự | `XBOS-WF-205` · status rejected · F5 | UI/API | reject · API_CONTRACT min 10 |
| TC-CC-P0-06-INB-REJ-FD-001 | CAP-INB-RJ | FN-INB-REJ | FD | P0 | ceo@xe.vn / Group CEO | task pending | 1. Reject lý do <10 | 4xx | API | FD reason |
| TC-CC-P0-06-INB-REJ-BD-001 | CAP-INB-RJ | FN-INB-REJ | BD | P1 | ceo@xe.vn / Group CEO | task | 1. Lý do đúng 10 ký tự | 205/2xx accept | API | BD |
| TC-CC-P0-06-INB-SELF-FD-001 | CAP-INB-CTRL | FN-INB-SELF | FD | P0 | ceo@xe.vn / Group CEO | user vừa submit instance (cùng email assignee) | 1. Cố Duyệt task mình | chặn BR-WF-04 · không complete | API/UI | **PASS 2026-08-04** `po-uc-tc-w4-qa-self-fd-02.md` — POST complete **422** `XBOS-WF-422` · F5 still pending · prior FAIL closed |
| TC-CC-P0-06-INB-SELF-HP-001 | CAP-INB-CTRL | FN-INB-SELF | HP | P1 | Approver khác hat | task gán đúng hat | 1. Duyệt | 2xx (đối chứng self fail) | UI/API | multi-hat |
| TC-CC-P0-06-INB-SCOPE-AU-001 | CAP-INB-CTRL | FN-INB-SCOPE | AU | P0 | du-lich.ceo@xe.vn / Member CEO | task holding | 1. complete bằng JWT member | 403/409/404 | API | AU scope |
| TC-CC-P0-06-INB-SCOPE-AU-002 | CAP-INB-CTRL | FN-INB-SCOPE | AU | P0 | ceo@xe.vn / Group CEO | task assignee khác user | 1. complete không phải assignee | 403/4xx | API | assignee AU |
| TC-CC-P0-06-INB-LIST-AU-001 | CAP-INB-R | FN-INB-LIST | AU | P1 | du-lich.ceo@xe.vn / Member CEO | login member | 1. List tasks | chỉ task trong scope CT | API | list scope |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | 4 | YES | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | 5 | PARTIAL | — |
| Auth/scope nếu đa CT | required | YES | — |
| SPEC_GAP ghi rõ | — | SRS_VN mô tả SLA/escalate — verify UI có/không; không invent PASS escalate nếu UI chưa có | SLA escalate UI có thể SPEC_GAP — ghi khi chạy |
| Self-approve FD (WF) | YES | YES | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | workflow-engine.controller complete/reject/listTasks/detail | apps/api/xbos-api/src/workflow-engine/workflow-engine.controller.ts |
| FE menu/nút/role | CC Hộp thư · Duyệt/Từ chối · confirm dialog nếu có | UF-XBOS-08 evidence |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | assignee + company scope + BR-WF-04 | resolver-registry.spec BR-WF-04 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-CC-P0-06
cases_designed: 18
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
