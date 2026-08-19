# UC — `UC-XBOS-MET-01` · Xem chỉ số vận hành dịch vụ API

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-MET-01` |
| **stt_phase1** | 9 |
| **mod** | M01 |
| **name_vi** | Xem chỉ số vận hành dịch vụ API |
| **actors** | SRE · Ops |
| **surfaces** | api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 9 |
| **srs_new** | N/A-DELTA — pack mới không FR chi tiết từng UC; neo matrix + TECHSPEC_HE + xbos TECHSPEC · NFR observability |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | GET `/api/xbos/metrics` · `?format=prometheus` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | `app.controller.ts` getMetrics + renderPrometheusMetrics. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Đọc chỉ số runtime/Prometheus của xbos-api cho giám sát vận hành.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-MET-01 | Snapshot metrics JSON | Xem uptime/memory | Ops |
| CAP-MET-02 | Prometheus scrape | Export text/plain | Prometheus |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-MET-01 | FN-MET-JSON | GET metrics JSON | GET /metrics | N |
| CAP-MET-02 | FN-MET-PROM | GET prometheus | ?format=prometheus | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-MET-JSON | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-MET-PROM | 1 | 1 | 0 | 0 | 0 | 2 |
| **Tổng** | 2 | 1 | 0 | 1 | 1 | **5** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-MET-01-JSON-HP-001 | CAP-MET-01 | FN-MET-JSON | HP | P0 | service/admin JWT | API up | 1. GET /api/xbos/metrics | 200 · XBOS-METRICS-200 · có uptime | API | UC-XBOS-MET-01 |
| TC-XBOS-MET-01-PROM-HP-001 | CAP-MET-02 | FN-MET-PROM | HP | P0 | service/admin JWT | API up | 1. GET ?format=prometheus | text/plain · có metric platform (vd. http_requests_total) | API | NFR |
| TC-XBOS-MET-01-PROM-FD-001 | CAP-MET-02 | FN-MET-PROM | FD | P1 | service/admin JWT | API down | 1. scrape | fail scrape | API |  |
| TC-XBOS-MET-01-JSON-UX-001 | CAP-MET-01 | FN-MET-JSON | UX | P2 | service/admin JWT | — | 1. Accept text/plain không format | hành vi AS-IS document | API |  |
| TC-XBOS-MET-01-JSON-AU-001 | CAP-MET-01 | FN-MET-JSON | AU | P2 | EMPLOYEE (NV thường) | metrics policy | 1. GET không auth | ghi nhận public vs protect AS-IS | API | security |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Yes | Yes | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | Yes | N/A (read-only) | — |
| Auth/scope nếu đa CT | Yes | Yes | — |
| SPEC_GAP ghi rõ | Yes | xem code_note / FD | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | `app.controller.ts` getMetrics + renderPrometheusMetrics. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-MET-01
cases_designed: 5
code_readiness: LIKELY_IMPL
```
