# Evidence — PO-TRAIN-VALIDATE-SA-01 · Nghiệm thu training SA (docs-only)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-TRAIN-VALIDATE-SA-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-04 |
| **apps/** | **không đụng** |
| **read_first** | TRAINING v2 §4 + §12 Q-SA · DOMAIN v2 §1.3–1.5, §2, §6, §7, §11 |

---

## spec_read_ack (governance)

| Artifact | Path · § |
|----------|----------|
| Training pack | `docs/program/knowledge/PO_PM_SENIOR_TRAINING_PACK_20260804.md` §4 SA/TM · §12 Q-SA · (§5.3 cross-cite AUTH/conflict) |
| Domain notes | `docs/program/knowledge/ENTERPRISE_HRM_XBOS_DOMAIN_NOTES_20260804.md` §1.3 dual-plane · §1.4 JWT · §1.5 RBAC · §2 catalog SoT · §6 SOLID · §7 W3 case · §11 quiz |
| Cross-check (not substitute) | OpenAPI `docs/api/openapi/xbos-api.yaml` apply/clone/clone-bundle · evidence `po-uc-tc-w3-be-dm09.md` · ADR `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` |

---

## Q-SA answers (không slogan)

### Q1 — DM-09 vs LOG-09 vs apply-to-members

| Thao tác | UC | Endpoint (SoT training/domain) | HP code | Conflict / fail-closed | Khi nào dùng |
|----------|----|--------------------------------|---------|------------------------|--------------|
| Sao chép **1** bộ danh mục | **XBOS-DM-09** | `POST /api/xbos/config-sync/catalog/:key/clone` | `XBOS-CFG-206` | `XBOS-CFG-409` (dest trùng mã item, `onConflict=reject`) | Group CEO nhân bản **một** `catalogKey` partition nguồn → đích (vd. `shifts`) |
| Sao chép **bundle LOG** | **XBOS-DM-LOG-09** | `POST /api/xbos/config-sync/catalogs/clone-bundle` + body `domains=['logistics']` | `XBOS-CFG-205` | `XBOS-CFG-009` (fail-closed khi dest keys collide) | Group CEO nhân bản **nhiều** catalog theo domain logistics (không phải single-key) |
| Áp danh mục xuống members | **DM-HRM-07** (Apply) | Training/DOMAIN chỉ ghi «apply-to-members panel/API» — **thiếu path đầy đủ trong 2 doc bắt buộc** | *(OpenAPI cross-check: `POST …/catalog/{catalogKey}/apply-to-members` → `XBOS-CFG-204`)* | Apply = **upsert fan-out** (không phải reject-clone) | Đẩy snapshot catalog từ holding xuống **nhiều** member partitions đã chọn — **không** thay DM-09 |

**AU chung (clone/bundle):** member JWT → `XBOS-AUTH-003`.

**SA gate:** cấm Dev «một nút gọi nhầm API» hoặc implement DM-09 bằng apply-to-members (TRAINING §4.3, §5.3; DOMAIN §2.2).

| **specificity_self_score Q1** | **0.78** |
|---|---|
| Lý do điểm | DM-09/LOG-09 đủ endpoint + HP + conflict trong TRAINING §4.3 + DOMAIN §2.2. Apply chỉ neo UC + «panel/API» — thiếu METHOD/path + mã HP `CFG-204` trong 2 doc bắt buộc → trừ điểm. |

---

### Q2 — Member CEO clone: expect HTTP/code?

| Actor | Expect (từ TRAINING + DOMAIN) | Ghi chú |
|-------|-------------------------------|---------|
| `du-lich.ceo@xe.vn` (CEO CT thành viên) | Business code **`XBOS-AUTH-003`** | DOMAIN §2.2 AU; TRAINING §5.3 «Member → XBOS-AUTH-003»; §4.5 self-check hỏi HTTP |
| HTTP | DOMAIN §1.5: **403/409** nếu gọi rollup/**clone tập đoàn** | Không pin rõ «clone → luôn **403**» trong §4 SA table |
| FE U65 (case W3) | Menu «Sao chép bộ danh mục» **ẩn**; deep-link AU blocked | DOMAIN §7 / TRAINING §6.3 — UI gate bổ sung cho API 403 |

**Trả lời chuẩn SA (đủ để dispatch QA/Dev):** member CEO gọi API clone holding → **`XBOS-AUTH-003`**; kỳ vọng HTTP **403** (AUTH) — **không** nhầm với **409** `companyId mismatches token scope` (dual-plane/scope) hay **409** `XBOS-CFG-409` (conflict dest).

| **specificity_self_score Q2** | **0.72** |
|---|---|
| Lý do điểm | Code `AUTH-003` rõ. HTTP trong DOMAIN §1.5 viết **403/409** chung cho rollup/clone → agent dễ lẫn AUTH vs SCOPE vs CFG-409. TRAINING §4.3 không cột HTTP. |

---

### Q3 — Dual-plane: list OK / detail fail — SA bắt Dev làm gì?

**Triệu chứng (DOMAIN §1.3):** List **200** nhưng get-by-id **404**; hoặc **409** `companyId mismatches token scope` — thường vì lệch plane Org UUID vs HRM slug (`trsport` / `du-lich` / …).

**SA bắt Dev (và BA-Data/FE) trước `READY_FOR_QA`:**

1. **Scope parity (bắt buộc):** cùng **scope resolver** cho list **và** get-by-id (và mutation cùng module) — TRAINING §4.2 bước 5; DOMAIN §1.3 bảng SA.
2. **Không hardcode** slug trong service khi API nhận UUID (và ngược lại) — DOMAIN §1.3 Dev-BE.
3. **FE:** gửi `x-company-id` / scope khớp token khi mutate — DOMAIN §1.3.
4. **BA-Data:** precond TC ghi rõ UUID **và/hoặc** slug — DOMAIN §1.3.
5. **QA evidence:** mỗi UF ghi persona + company đang đứng.
6. **Jest/regression:** scope_parity trên module đụng (U19 / ADR holding scope).
7. **SOLID (DOMAIN §6):** BR/scope trong **service**, không controller; không đổi response shape im lặng.

**Không chấp nhận:** «list ổn rồi» đóng UC khi detail/deep-link fail (L2.5 / J-* gap).

| **specificity_self_score Q3** | **0.88** |
|---|---|
| Lý do điểm | DOMAIN §1.3 + TRAINING §4.2 đủ hành động SA→Dev; gắn ADR dual-plane `main`/`holding` khi wave CC/HRM. |

---

### Q4 — Invariant phá nếu gộp DM-09 với apply-to-members?

| Invariant | Nếu gộp / dùng apply thay clone | Hệ quả |
|-----------|----------------------------------|--------|
| **Ngữ nghĩa UC** | DM-09 = copy **1 key → 1 dest**; Apply (DM-HRM-07) = **fan-out** xuống nhiều members | Sai UC; QA PASS apply **không** promote DM-09 (TRAINING §8.1 / §12 Q-QA) |
| **Conflict policy** | Clone default **reject** → `XBOS-CFG-409`; Apply **upsert** (không reject-clone) | Mất fail-deep trùng mã; ghi đè im lặng |
| **Ownership / SoT** | Clone tạo **bản sao** keys đích; nguồn holding vẫn SoT khung; Apply = đẩy snapshot theo allow-list | Nhầm «đã clone» với «đã apply»; ownership TC sai (DOMAIN §2.1, BA-Data §3.3 training) |
| **Surface / SOLID FE** | Hai panel/menu riêng (clone ≠ apply); must_keep ApplyCatalogToMembersPanel | Hijack 1 component 2 nghiệp vụ — phá S (DOMAIN §6.2) |
| **Error taxonomy** | HP/conflict khác: 206/409 vs 204/upsert | FE nuốt code; matrix TC không tách được |
| **must_keep** | publish/pull + apply + clone-bundle **riêng** clone single-key | Regression publish/governance / LOG-09 |

**Kết luận SA:** gộp = phá boundary OpenAPI + UC neo + conflict semantics + must_keep W3. Option đúng = **3 endpoint / 3 UI actions** (DOMAIN §2.2, §7).

| **specificity_self_score Q4** | **0.85** |
|---|---|
| Lý do điểm | TRAINING §4.2–4.5 đặt câu hỏi invariant; DOMAIN §2 + §7 đủ trả lời. Thiếu 1 đoạn «answer key» tường minh trong §4 (chỉ self-check). |

---

## Aggregate score + doc_verdict

| Metric | Value |
|--------|--------|
| **specificity_self_score (mean Q1–Q4)** | **0.81** |
| **doc_verdict** | **NEEDS_MORE_DETAIL** |

### Vì sao không PASS_DOC

Hai doc bắt buộc **đủ để SA không invent BR** cho DM-09/LOG-09 và dual-plane, nhưng **chưa đủ kỹ thuật** để agent mới trả lời Q-SA mà không mở OpenAPI/evidence:

| # | Gap | § cần vá |
|---|-----|----------|
| G1 | Apply-to-members thiếu `POST /api/xbos/config-sync/catalog/:key/apply-to-members` + HP `XBOS-CFG-204` (+ phân biệt upsert vs reject) | **DOMAIN §2.2** hàng Apply · **TRAINING §4.3** thêm hàng thứ 3 |
| G2 | Member CEO: pin **HTTP 403 + `XBOS-AUTH-003`**; ghi chú «không nhầm 409 SCOPE / 409 CFG-409» | **TRAINING §4.3** cột HTTP · **DOMAIN §1.5** tách AUTH vs SCOPE · §11 Q1 answer-hint |
| G3 | §4 self-check Q invariant không có **answer key ngắn** (3–5 bullet) | **TRAINING §4.5** hoặc §4.3 note |
| G4 | LOG-09 path trong TRAINING dùng `POST …/catalogs/clone-bundle` (ellipsis) — nên full prefix `/api/xbos/config-sync/…` như DOMAIN DM-09 | **TRAINING §4.3** |

### Đủ tốt (không cần vá để hiểu)

- Ba thao tác catalog «khác nghĩa» + case W3 (§7).
- Dual-plane triệu chứng + bảng việc theo role (§1.3).
- SOLID Nest/React gắn clone≠apply (§6).
- Checklist SA trước Dev: invariant / must_keep / scope parity / readiness honest (§4.2).

---

## Residual (governance)

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| R-TRAIN-SA-APPLY-PATH | P2 | ba-docs / sa (docs) | Vá G1–G4; không cần Dev |
| R-TRAIN-SA-HTTP-PIN | P2 | sa | Pin 403 AUTH-003 vs 409 SCOPE/CFG |
| — | — | — | **Không** mở Dev/QA product từ wave này |

---

## Handoff

```text
work_item_id: PO-TRAIN-VALIDATE-SA-01
from_role: sa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-train-validate-sa-01.md
doc_verdict: NEEDS_MORE_DETAIL
specificity_self_score: 0.81
uat_done: false
```

### completion_report

- **Closed:** Đọc FULL TRAINING §4/§12 Q-SA + DOMAIN §1.3–1.5/§2/§6/§7/§11; trả lời 4 Q-SA kèm endpoint/mã lỗi/hành động Dev; chấm specificity; verdict **NEEDS_MORE_DETAIL** + danh sách § vá G1–G4. Không sửa `apps/**`.
- **Residual:** Docs patch G1–G4 (apply path/CFG-204; HTTP 403 pin; §4.5 answer key; full LOG-09 path). Không residual product P0.

### next_owner

`pm` (optional: `ba-docs` hoặc `sa` docs-only patch training/domain)

### next_dispatch_prompt

```text
work_item_id: PO-TRAIN-PATCH-SA-DOCS-01
to_role: ba-docs  # hoặc sa docs-only
lane: governance
read_first:
  - docs/qa/evidence/po-train-validate-sa-01.md  # G1–G4
  - docs/program/knowledge/PO_PM_SENIOR_TRAINING_PACK_20260804.md §4.3 §4.5
  - docs/program/knowledge/ENTERPRISE_HRM_XBOS_DOMAIN_NOTES_20260804.md §1.5 §2.2 §11
change_mode: ADD (docs only)
cấm: apps/**
exit_criteria:
  1) TRAINING §4.3 table 3 hàng: DM-09 / LOG-09 / apply-to-members — full path + HP + conflict/upsert + HTTP AU 403 AUTH-003
  2) DOMAIN §2.2 Apply row = POST /api/xbos/config-sync/catalog/:key/apply-to-members → XBOS-CFG-204; note upsert ≠ CFG-409
  3) DOMAIN §1.5 + §11 Q1: pin member clone → HTTP 403 XBOS-AUTH-003; không nhầm 409 SCOPE/CFG-409
  4) TRAINING §4.5: 4–6 bullet answer key invariant gộp DM-09↔apply
evidence_path: docs/qa/evidence/po-train-patch-sa-docs-01.md
ack_status_target: PASS_TO_PM
```
