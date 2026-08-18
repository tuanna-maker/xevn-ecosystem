# Evidence — PO-TRAIN-VALIDATE-QA-01 · Q-QA training quiz

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-TRAIN-VALIDATE-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | governance read-only (doc + evidence mẫu — **không** browser live) |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true (không seed; không claim UAT) |
| **read_first** | TRAINING §8 + §12 Q-QA · DOMAIN §1.2, §3.2–3.3, §7 · skim `po-uc-tc-w3-qa-dm09-r2.md` |
| **doc_verdict** | **PASS** — trả lời có path / mã lỗi / persona / bước; không slogan-only |

> **Không claim:** UAT Phase1 DONE · UF 🟢 live · Leave L2 · apply-to-members = DM-09.

---

## Sources read

| Artifact | § / path |
|----------|----------|
| TRAINING | `docs/program/knowledge/PO_PM_SENIOR_TRAINING_PACK_20260804.md` §8, §12 Q-QA |
| DOMAIN | `docs/program/knowledge/ENTERPRISE_HRM_XBOS_DOMAIN_NOTES_20260804.md` §1.2, §2.2, §3.2–3.3, §7 |
| Evidence mẫu | `docs/qa/evidence/po-uc-tc-w3-qa-dm09-r2.md` (skim HP/FD/AU + L0) |

---

## Q-QA answers

### 1. Chuỗi U65 tối thiểu 5 bước cho DM-09

Neo: TRAINING §8.1 bước 3–5 + evidence R2 HDSD inventory; DOMAIN §3.2 (mutate FE pattern) áp cho catalog clone.

| # | Bước | Kỳ vọng |
|---|------|---------|
| 1 | **Login** persona Group CEO `ceo@xe.vn` | Holding scope |
| 2 | **Menu HDSD (U76):** Command Center → **Cài đặt** → **Sao chép bộ danh mục** | Đúng panel DM-09 — **không** «Áp dụng danh mục HRM» |
| 3 | Chọn `catalogKey` + ĐVTV đích → **Sao chép** / confirm | Mutate trên UI |
| 4 | **Network** `POST /api/xbos/config-sync/catalog/{key}/clone` → **2xx** `XBOS-CFG-206` **+ FE sau 2xx** (toast / result card / dest verify) | Không PASS chỉ curl |
| 5 | **F5** (vd. `/command-center?settings=hrm_catalog_clone`) → dữ liệu/kết quả còn đúng | Persist sau reload |

Bổ sung bắt buộc trong pack (TRAINING §8.1 bước 6; R2 đã làm) — **không** thay 5 bước trên:

- **FD:** clone lại cùng key → UI surfaces `XBOS-CFG-409` (HTTP 409).
- **AU:** `du-lich.ceo@xe.vn` — menu ẩn + deep-link blocked.

Mẫu đã chứng minh: key `shifts` → 201 `XBOS-CFG-206` · retry 409 `XBOS-CFG-409` (`po-uc-tc-w3-qa-dm09-r2.md`).

---

### 2. Vì sao apply-to-members không được tính PASS DM-09?

| | **XBOS-DM-09 (Clone)** | **DM-HRM-07 (Apply)** |
|--|------------------------|------------------------|
| UC | Sao chép **1** bộ danh mục nguồn→đích | Áp danh mục xuống member |
| API | `POST …/config-sync/catalog/:key/clone` → `XBOS-CFG-206` | apply-to-members panel/API |
| Conflict | `XBOS-CFG-409` | (khác mã / khác BR) |

**Lý do FAIL nếu gộp:** TRAINING §8.1 bước 10 cấm «dùng apply làm PASS clone»; DOMAIN §2.2 + §7 — ba thao tác (clone single / clone-bundle LOG-09 / apply) **khác endpoint + khác UC**. PASS apply chỉ chứng minh DM-HRM-07, **không** chứng minh wire FE `CloneCatalogPanel` hay contract clone `CFG-206/409`. Evidence R2 `must_keep`: mutate path = `…/clone` only.

---

### 3. Persona Group CEO vs member cho AU

Neo: DOMAIN §1.5 + §3.3; TRAINING §8.1 bước 3; R2 AU rows.

| Persona | Email | Vai trò trong DM-09 |
|---------|-------|---------------------|
| **Group CEO (HP)** | `ceo@xe.vn` | Holding — mở menu Sao chép, clone → `XBOS-CFG-206` |
| **Member CEO (AU)** | `du-lich.ceo@xe.vn` | Scope hẹp — **không** được clone tập đoàn: menu «Sao chép bộ danh mục» **hidden**; deep-link → AU blocked; API expect `XBOS-AUTH-003` (DOMAIN §2.2) |

AU PASS khi member **bị chặn** (UI +/hoặc AUTH) — không khi member clone thành công.

---

### 4. Ports L0

Neo: DOMAIN §1.2; R2 L0 table (wave browser dùng subset).

| Thành phần | Port | L0 note |
|------------|------|---------|
| **hrm-api** | `:28001` | Nest HRM — `pnpm dev` không luôn bật |
| **xbos-api** | `:28002` | Nest XBOS — bắt buộc cho DM-09 |
| **web-portal** | `:5173` / `:5175` (env) | CC + embed; R2 dùng `:5173` **200** |
| Health phụ | `pnpm run qc:dev-stack` / `qc:fe-be-health` | Thiếu `:28001` → proxy 500 ≠ bug FE |

Cho wave DM-09 browser tối thiểu: **xbos `:28002` + portal** alive; seed **không** chạy.

---

### 5. specificity_self_score + doc_verdict

| Field | Value |
|-------|--------|
| **specificity_self_score** | **SPECIFIC** |
| **Lý do score** | Có path evidence/by-uc, endpoint `/clone`, mã `XBOS-CFG-206` / `409` / `AUTH-003`, persona `ceo@` vs `du-lich.ceo@`, chuỗi 5 bước U65 + FD/AU, phân biệt UC DM-09 ≠ DM-HRM-07 ≠ LOG-09 |
| **doc_verdict** | **PASS** (training Q-QA) — đủ chi tiết theo bar §12 («không chung chung SOLID / business first») |
| **uat_done** | **false** — lane read-only; không claim UAT/Phase1 |

---

## Residual

| ID | Note |
|----|------|
| — | Không residual execution; đây là quiz governance |
| Live browser | Ngoài scope wave này — neo R2 đã có nếu PM cần re-cite |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-TRAIN-VALIDATE-QA-01
evidence_path: docs/qa/evidence/po-train-validate-qa-01.md
next_owner: pm
specificity_self_score: SPECIFIC
doc_verdict: PASS
```

### next_dispatch_prompt

```text
work_item_id: PO-TRAIN-VALIDATE-QA-01-INTAKE
from_role: pm
to_role: pm
lane: governance
ack_status_target: DISPATCHED

INTAKE QA PASS_TO_PM:
  evidence: docs/qa/evidence/po-train-validate-qa-01.md
  Q-QA 1–5 answered SPECIFIC; doc_verdict PASS
  U65 5-step DM-09 + apply≠DM-09 + persona AU + ports L0 cited
  không seed · không claim UAT
  next: tiếp quiz role còn mở (Q-FE/Q-BE/…) hoặc đóng training wave trên bus
```
