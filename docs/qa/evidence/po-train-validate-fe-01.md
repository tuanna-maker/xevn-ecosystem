# PO-TRAIN-VALIDATE-FE-01 — Dev-FE governance read (catalog clone)

| Field | Value |
|-------|-------|
| work_item_id | `PO-TRAIN-VALIDATE-FE-01` |
| from_role | pm+po |
| to_role | dev-fe |
| lane | governance read-only |
| coded | 2026-08-04 |
| apps/** touched | **none** (cấm) |
| ack_status | **PASS_TO_PM** |

## spec_read_ack (docs only)

| Doc | Sections read |
|-----|----------------|
| `docs/program/knowledge/PO_PM_SENIOR_TRAINING_PACK_20260804.md` | §6 (6.1–6.4), §4.3 table endpoints, §12 Q-FE |
| `docs/program/knowledge/ENTERPRISE_HRM_XBOS_DOMAIN_NOTES_20260804.md` | §2.2–2.3, §6 SOLID FE row, §7 W3 case study |

---

## Q-FE answers

### 1. Hai menu clone tên gì? API path khác gì?

| Menu (CC, Group CEO) | UC | API path | Success code |
|----------------------|----|----------|--------------|
| **Sao chép bộ danh mục** | XBOS-DM-09 | `POST /api/xbos/config-sync/catalog/:key/clone` | `XBOS-CFG-206` |
| **Sao chép bộ danh mục LOG** | XBOS-DM-LOG-09 | `POST /api/xbos/config-sync/catalogs/clone-bundle` + body `domains=['logistics']` | `XBOS-CFG-205` |

**Không phải** menu/API **Apply** (DM-HRM-07 / apply-to-members).

Neo: TRAINING §6.3 · DOMAIN §2.2.

### 2. Sau 201 clone phải chứng minh gì ngoài Network?

Ngoài Network `201` + mã (`CFG-206` / `CFG-205`):

1. **FE sau 2xx** — toast/result panel đúng nghiệp vụ (không blank / không banner lỗi).
2. **F5 (hoặc navigate lại)** — kết quả vẫn đúng (vd. spot GET dest keys / list dest còn sau reload).
3. **AU** — member CEO không thấy menu / không dùng được clone tập đoàn (TRAINING §6.3: member menu ẩn).

U65: chuỗi từ UI; cấm seed. Neo: TRAINING §6.2 bước 3–5 · §8.1 bước 5.

### 3. must_keep nào với Apply panel?

| must_keep | Ý nghĩa |
|-----------|---------|
| `ApplyCatalogToMembersPanel` (+ apply-to-members API/client) | **Không hijack** — không map nút Apply thành clone DM-09/LOG-09 |
| Panel clone **≠** panel apply (SOLID S) | Hai nghiệp vụ → hai panel/menu; không gộp 1 component 2 nút giống nhau |
| leave L2 (inject §6.4) | Không đụng leave ladder khi wire catalog clone |

Neo: TRAINING §6.1.3 · §6.4 · DOMAIN §2.3 Dev-FE · §6 SOLID FE.

### 4. 5 bước checklist FE từ doc nếu wire LOG-09

Áp dụng TRAINING §6.2 (5 bước đầu) cho **LOG-09**:

| # | Bước | LOG-09 cụ thể |
|---|------|----------------|
| 1 | Client API typed → đúng path | `clone-bundle` + `domains=['logistics']` — **không** `:key/clone`, **không** apply |
| 2 | UI action tiếng Việt đúng nghiệp vụ | Menu **Sao chép bộ danh mục LOG** (riêng DM-09) |
| 3 | Sau 2xx: toast/result + F5 còn đúng | 201 `XBOS-CFG-205` → FE feedback + F5/spot GET dest |
| 4 | Surface error code nghiệp vụ | Fail-closed `XBOS-CFG-009` (và AUTH) — không nuốt body |
| 5 | AU: ẩn/chặn member theo SA/BA | Chỉ Group CEO; `du-lich.ceo` không dùng menu LOG clone |

Trước code còn §6.1: by-uc + evidence BE · HDSD U76 · grep Apply **must_keep** · design system hiện tại.

### 5. specificity_self_score + doc_verdict

| Field | Value |
|-------|-------|
| **specificity_self_score** | **8 / 10** |
| **doc_verdict** | **PASS_DOC** |

**Rationale (ngắn):**

- Đủ để Dev-FE wire đúng: hai tên menu, hai path, mã lỗi, must_keep Apply, checklist 9 bước, inject copy-ready.
- Trừ 2 điểm: HDSD alias/testid cụ thể và field form dest/source không nằm trong TRAINING §6 (phải đọc by-uc / evidence BE wave) — không chặn hiểu P0 clone vs apply.

**NEEDS_MORE_DETAIL** chỉ nếu thiếu tên menu hoặc gộp endpoint — không xảy ra ở §6 + DOMAIN §2.2.

---

## completion_report

**Closed:** Governance read TRAINING §6 + DOMAIN §2.2–2.3 §7; trả lời đủ Q-FE 1–5; evidence path này; không sửa `apps/**`.

**Residual:** Không — validate doc only. Wave wire LOG-09/DM-09 execution ngoài scope item này.

## next_owner

`pm` (+ po nếu tiếp validate role khác)

## next_dispatch_prompt

```text
work_item_id: PO-TRAIN-VALIDATE-FE-01
from_role: dev-fe
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-train-validate-fe-01.md
summary: Dev-FE doc validate PASS_DOC (score 8/10). Hai menu: «Sao chép bộ danh mục» → catalog/:key/clone (CFG-206); «Sao chép bộ danh mục LOG» → catalogs/clone-bundle domains=logistics (CFG-205). Sau 201 cần FE toast/result + F5 + AU ẩn member. must_keep ApplyCatalogToMembersPanel (không hijack). Checklist LOG-09 = §6.2 bước 1–5. PM intake → tiếp Q-QA / role kế trong TRAINING §12 nếu còn queue validate.
```

## ack_status

**PASS_TO_PM**
