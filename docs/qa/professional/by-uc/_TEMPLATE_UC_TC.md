# UC — `<UC-ID>` · `<Tên use case tiếng Việt>`

| Meta | Value |
|------|--------|
| **uc_id** | `UC-…` |
| **stt_phase1** | |
| **mod** | M00…M06 |
| **name_vi** | |
| **actors** | |
| **surfaces** | web-portal / xbos-cc / hrm-embed / hrm-mobile / api |
| **srs_old** | `docs/client-delivery/02_SRS_XeVN_OS.html` FR-… · `BANG_TONG_HOP_USECASE_*.md` |
| **srs_new** | `docs/brand-new-documents-20270801/SRS_VN.md` §… (nếu có) · hoặc **N/A-DELTA** |
| **tech_spec** | path §… |
| **api_contract** | METHOD paths + mã lỗi (API_CONTRACT_VN / OpenAPI / controller) |
| **author** | role · work_item |
| **design_status** | DRAFT \| DESIGNED |
| **execution** | not started |
| **code_readiness** | `UNKNOWN` \| `LIKELY_PARTIAL` \| `LIKELY_IMPL` \| `GAP` — **không** = UAT PASS |
| **code_note** | 1–3 câu: FE/BE/role khớp gì / lệch gì (cite file nếu đã đọc) |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

…

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | | | |

**Đếm nghiệp vụ:** __

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-… | | | Y/N |

**Đếm chức năng:** __

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-… | | | | | | |
| **Tổng** | | | | | | **__** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-…-HP-001 | | | HP | P0 | | | 1.… | 2xx + FE + F5 | UI/API | SRS… · API… |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | | | |
| Mọi FN mutate ≥1 HP + ≥1 FD | | | |
| Auth/scope nếu đa CT | | | |
| SPEC_GAP ghi rõ | | | |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | | |
| FE menu/nút/role | | |
| Mobile (nếu có) | | |
| RBAC / scope | | |

**Verdict code_readiness:** …

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH | DRAFT
uc_id: …
cases_designed: N
code_readiness: …
```
