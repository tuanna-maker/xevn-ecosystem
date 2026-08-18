# PO-TRAIN-VALIDATE-BE-01 — Dev-BE training quiz (read-only)

| Field | Value |
|-------|-------|
| work_item_id | `PO-TRAIN-VALIDATE-BE-01` |
| from_role | pm+po |
| to_role | dev-be |
| lane | governance (read-only — no `apps/**`) |
| dated | 2026-08-04 |
| ack_status | **PASS_TO_PM** |

## Sources read

| Artifact | Sections |
|----------|----------|
| `docs/program/knowledge/PO_PM_SENIOR_TRAINING_PACK_20260804.md` | §5 Dev-BE, §11 pipeline U86, §12 Q-BE |
| `docs/program/knowledge/ENTERPRISE_HRM_XBOS_DOMAIN_NOTES_20260804.md` | §1.3 dual-plane, §2.2 three catalog ops, §6.1 Nest SOLID, §7 W3 case |

---

## 1. Thứ tự `spec_read_ack` trước sửa Nest (fields)

Theo TRAINING §5.1 — **điền đủ trước** khi đụng `apps/api/**`:

| Field | Nội dung bắt buộc |
|-------|-------------------|
| `srs` | path + §… + UC… |
| `tech_spec` | path + §… |
| `db_design` / prisma | bảng / schema liên quan |
| `api_design` / OpenAPI | METHOD + path · mục đích · bước SRS |
| `by-uc` | `docs/qa/professional/by-uc/<UC>.md` |
| `change_mode` | `ADD` \| `FIX` |
| `must_keep` | danh sách không được đè |
| `forbidden` | vd. seed · Leave L2 invent · … |

Inject §5.4 nhấn: SRS + TechSpec + API + by-uc trước code.

---

## 2. DM-09 conflict dest + member

| Case | HTTP | Mã lỗi | Neo |
|------|------|--------|-----|
| Conflict đích (trùng mã, `onConflict=reject`) | **409** | **`XBOS-CFG-409`** | TRAINING §5.3; DOMAIN §2.2 |
| Member JWT gọi clone tập đoàn | **403** (AU) | **`XBOS-AUTH-003`** | TRAINING §5.3; DOMAIN §2.2 |

Happy path neo (không hỏi nhưng neo đúng): `POST …/catalog/:key/clone` → **`XBOS-CFG-206`**. Self-copy → `XBOS-VAL-013`.

**Không** implement DM-09 bằng `apply-to-members` (DM-HRM-07).

---

## 3. Checklist 5 bước implement nếu nhận Task DM-09 hôm nay

Rút từ TRAINING §5.2 (bước 1–5) + case §5.3 / DOMAIN §2.2 · §7:

| # | Việc sẽ làm |
|---|-------------|
| 1 | Grep AS-IS: đã có `clone` / `apply-to-members` / `clone-bundle` chưa — **reuse** service gần đúng; **cấm** gộp DM-09 vào apply |
| 2 | Controller mỏng: nhận DTO → gọi `cloneCatalog` → map HTTP — **không** chứa BR conflict/scope |
| 3 | Service: BR validate (self-copy VAL-013, Group CEO vs member AUTH-003), transaction, `onConflict=reject` → CFG-409 |
| 4 | Error code ổn định: success `XBOS-CFG-206`, conflict `XBOS-CFG-409`, member `XBOS-AUTH-003` — không message English rời |
| 5 | Scope dual-plane (§1.3): không hardcode slug khi API nhận UUID (và ngược lại); list/get cùng resolver nếu module có cả hai |

(Sau đó theo §5.2 còn: jest HP+FD+AU → CODE-MEMORY → by-uc → evidence → `READY_FOR_QA` + `next_dispatch_prompt` QA.)

---

## 4. Controller được chứa BR không?

**Không.**

- TRAINING §5.2 bước 2: Controller = nhận DTO, gọi service, map HTTP — **không chứa BR**.
- TRAINING §5.4 Inject: «Controller mỏng; BR trong service».
- DOMAIN §6.1 anti-pattern: if/else 200 dòng / conflict policy trong controller; BR conflict/onConflict thuộc Service (O + S).

---

## 5. `specificity_self_score` + `doc_verdict`

| Metric | Value |
|--------|-------|
| **specificity_self_score** | **4 / 5** |
| **doc_verdict** | **ĐỦ ĐỂ CODE UC đã neo (DM-09)** — không còn mức «làm đúng SOLID» chung chung |

### Vì sao 4/5 (không 5)

**Đủ cụ thể để code DM-09 hôm nay:**

- Endpoint + success/fail codes (`CFG-206` / `CFG-409` / `AUTH-003` / `VAL-013`)
- Phân biệt 3 thao tác catalog (§2.2) + cấm apply-as-clone
- Pipeline U86 (§11): GAP → Dev → QA → QC → by-uc
- Nest placement SOLID (§6.1) + checklist implement 10 bước
- Case W3 (§7) + evidence neo path

**Thiếu 1 điểm (vẫn cần lúc Task thật):** DTO field-level / OpenAPI request body chi tiết và by-uc TC-ID matrix nằm ở `by-uc/XBOS-DM-09.md` + evidence BE — training pack trỏ path nhưng không paste full contract. Agent mới vẫn phải mở by-uc + API_DESIGN trước khi `Write` Nest (đúng `spec_read_ack`).

---

## Q-BE quiz (§12) — trả lời ngắn

1. **spec_read_ack order/fields:** `srs` → `tech_spec` → `db_design/prisma` → `api_design/OpenAPI` → `by-uc` → `change_mode` → `must_keep` → `forbidden`.
2. **Conflict dest DM-09:** HTTP **409** + **`XBOS-CFG-409`**.

---

## Domain anchors used (BE relevance)

- §1.3: dual-plane UUID vs slug → scope 404/409; BE không hardcode plane sai.
- §2.2: DM-09 ≠ LOG-09 ≠ apply; conflict/member codes.
- §6.1: BR + conflict strategy in service, not controller.
- §7: W3 chain BE→QA API→FE→QA browser; evidence paths.

---

## completion_report

| Closed | Residual |
|--------|----------|
| Đọc TRAINING §5/§11/§12 + DOMAIN §1.3/§2.2/§6.1/§7 | Không sửa `apps/**` (đúng lane) |
| Trả lời đủ 5 câu hỏi PM + Q-BE | Score 4/5: Task thật vẫn mở by-uc + OpenAPI DTO |
| Evidence file này | — |

## Handoff

- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/po-train-validate-be-01.md`

### next_dispatch_prompt

```text
work_item_id: PO-TRAIN-VALIDATE-BE-01
from_role: dev-be
to_role: pm
ack_status: PASS_TO_PM
lane: governance

INTAKE: Dev-BE quiz PASS (specificity 4/5, verdict ĐỦ CODE DM-09).
Evidence: docs/qa/evidence/po-train-validate-be-01.md

Answers locked:
1) spec_read_ack: srs, tech_spec, db_design/prisma, api_design/OpenAPI, by-uc, change_mode, must_keep, forbidden
2) DM-09 conflict: HTTP 409 + XBOS-CFG-409; member: XBOS-AUTH-003
3) 5 bước: grep reuse → controller mỏng → service BR/scope/conflict → error codes ổn định → dual-plane scope
4) Controller KHÔNG chứa BR
5) specificity_self_score=4/5; doc_verdict=ĐỦ CODE UC neo (cần by-uc+OpenAPI lúc Task thật)

PM: ghi bus INTAKE; nếu wave train còn role khác → Task tiếp; không dispatch Nest code từ evidence này.
```
