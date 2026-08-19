# BA AC delta — R-REC-HC-OVERRIDE-CELLID (stable cell identity on override)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · closes residual **R-REC-HC-OVERRIDE-CELLID** (P2 from QC-02 GWC) |
| **change_mode** | **ADD-only delta** — **không** wipe / reopen sealed REC-01/01b GWC |
| **parent_residual** | `R-REC-HC-OVERRIDE-CELLID` — QA-02 CONFIRMED mint `30ae64e4…` → `f447d354…` khi `allow_override=true` **omit** `cell_id` |
| **uc_ids** | `UC-BP-REC-01` · `UC-BP-REC-01b` (identity / O3 deepen — **không** mở REC-02) |
| **ref_ba** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md` **O3** · AC-REC-HC-01b-ALT-02 · BR-REC-01-LOCK · BR-BP-HC-04 |
| **ref_data** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md` §6.1–6.2 · §6.4 · §7.2 UQ spawn |
| **ref_api** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md` §5 F-REC-HC-01 · §8 `HRM-HC-*` · HC-S4/S5 |
| **ref_evidence** | `po-hrm-mvp-gd1-rec-01-cluster-qc-02.md` · `be-02.md` · `qa-02.md` |
| **Honesty** | `recruitment_uat_ready=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **Cấm** | Reopen P0 `R-REC-HC-PUT-LOCKED-WIPE` / 409 `HRM-HC-CELL-LOCKED` semantics · dual SoT · mint+soft-retire invent · seed · flip honesty · module REC UAT claim · apps/** (governance) |

---

## 0. Process objective

Khóa **AC đo được** để PUT `allow_override=true` **không** tạo `cell_id` mới cho cùng natural key — tránh YCTD `headcount_cell_id` mồ côi và gãy **BR-BP-HC-04** (UQ spawn `(company_id, headcount_cell_id)`).

**Không invent** ngoài SRS + sponsor/BA đã chốt:

| Chốt sẵn | Áp dụng |
|----------|---------|
| DATA-01 §6.1 | `cell_id` = **Stable identity** — mint **chỉ lần đầu** |
| DATA-01 §6.2 | Natural key `(plan_id, department_key, position_key, month)` · surrogate `cell_id` · **1 YCTD / cell_id** |
| BA O3 | Đổi SL sau spawn → **warn `qty_drift`** · **cấm silent overwrite YCTD** · cập nhật YCTD chỉ sau xác nhận version |
| BR-REC-01-LOCK | Ô đã duyệt: mutate cần override + quyền — **RETAIN** 409 `HRM-HC-CELL-LOCKED` khi thiếu override |
| BR-BP-HC-04 | Đúng một YCTD / ô; reopen cùng version → skip |

---

## 1. Decision package (Option A/B/C)

### 1.1 Problem

| | |
|--|--|
| **AS-IS** | `normalizeHeadcountCell` mint `randomUUID()` khi omit `cell_id` **trước** bước reuse natural key; điều kiện reuse `!cell.cell_id` **không bao giờ** true sau normalize → identity mới. YCTD giữ `headcount_cell_id` cũ → orphan. Re-spawn theo cell mới có thể tạo YCTD thứ hai (gãy idempotency / trace plan→YCTD). |
| **Impact** | Traceability plan ô → YCTD đứt; HC-S4 UQ lệch; cross-nav ô→YCTD sai/404 nghiệp vụ. |
| **Constraints** | must_keep REC-01/01b GWC · O3 drift · spawn UQ · không soft-delete hard · không seed |

### 1.2 Options

#### Option A — **REUSE by natural key (RECOMMENDED · LOCKED)**

- **Description:** Khi natural key khớp ô đã tồn tại trên plan: BE **bắt buộc** gán lại `cell_id` = ô cũ, kể cả payload **omit / empty** `cell_id`. Mint UUID **chỉ** khi natural key **chưa** có ô. FE **nên** luôn echo `cell_id` từ GET (belt). YCTD giữ nguyên `headcount_cell_id`. Qty đổi sau spawn → O3 warn drift — **không** silent PATCH YCTD.
- **Benefits:** Khớp DATA-01 stable identity; giữ BR-BP-HC-04; fix orphan không invent version cell; blast radius hẹp (BE normalize/reuse + FE echo).
- **Costs:** 1 seat BE FIX + FE echo + QA retest P2.
- **Risks:** Client cố ý gửi `cell_id` lạ → cần CNS mismatch (dưới).

#### Option B — Mint mới + relink YCTD + soft-retire ô cũ

- **Description:** Cho phép mint; UPDATE mọi `job_requisitions.headcount_cell_id` cũ→mới; đánh dấu ô cũ retired.
- **Benefits:** Cho phép «phiên bản identity» tường minh.
- **Costs / Risks:** Invent semantics ngoài O3 (O3 = version **YCTD qty**, không version `cell_id`); phá UQ/history; R2–R3 blast; **REJECT**.

#### Option C — Block override nếu omit `cell_id` (400 only)

- **Description:** `allow_override` + thiếu `cell_id` → 400; bắt FE luôn gửi.
- **Benefits:** Contract FE rõ.
- **Costs / Risks:** Không đủ một mình — API/partial client vẫn mint nếu BE không reuse; **REJECT as sole fix**. **ACCEPT as belt** kèm Option A (FE echo bắt buộc trên portal).

### 1.3 Trade-off matrix

| Criteria | Weight | A REUSE | B mint+relink | C block-only |
|----------|-------:|--------:|--------------:|-------------:|
| Business value (trace plan→YCTD) | 5 | **5** | 2 | 3 |
| Time to deliver | 4 | **5** | 1 | 4 |
| Complexity | 4 | **5** | 1 | 4 |
| Reliability (BR-BP-HC-04) | 5 | **5** | 2 | 3 |
| Maintainability | 3 | **5** | 1 | 3 |
| Align SRS/DATA/O3 (no invent) | 5 | **5** | 0 | 3 |

### 1.4 Decision

| Field | Value |
|-------|--------|
| **Selected** | **Option A LOCKED** + FE echo belt (C as complementary UX, not sole gate) |
| **Why** | DATA-01 đã chốt stable identity + natural key; O3 đã chốt drift YCTD **không** đổi identity ô; mint+relink = invent ngoài sponsor. |
| **Rejected B** | Invent cell-version + orphan rewrite risk. |
| **Rejected C-alone** | Không đóng lỗ hổng BE normalize-before-reuse. |

### 1.5 Answers to mission questions (normative)

| # | Question | Decision |
|---|----------|----------|
| **1** | Override omit `cell_id` → reuse hay mint+relink? | **REUSE** existing cell by natural key. **Cấm** mint thứ hai cho cùng NK. |
| **2** | YCTD đã spawn từ ô cũ? | **KEEP** link (`headcount_cell_id` = cell ổn định). **Không** relink. **Không** block override chỉ vì omit `cell_id`. Nếu SL ô ≠ `YCTD.headcount` → **warn O3 `qty_drift`** (giống AC-REC-HC-01b-ALT-02) — YCTD **không** đổi đến khi user xác nhận version path. |
| **3** | Validation / errors / UI? | Xem §3–§4. Extend `HRM-HC-*`. FE after 2xx + F5 cùng `cell_id`; drift dialog peer O3. |
| **4** | AC rows? | §5 happy / alternate / exception + FE-after-2xx + F5. |

---

## 2. Business rules (ADD — cite parents)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-REC-HC-CELL-STABLE** | PUT/POST grid cell có natural key đã tồn tại trên plan | Persist **cùng** `cell_id` (reuse) | Mint identity mới cho cùng NK = **FAIL** |
| **BR-REC-HC-CELL-MINT-ONCE** | Natural key **chưa** tồn tại | Cho phép mint `cell_id` mới | Surrogate lần đầu only (DATA-01 §6.1) |
| **BR-REC-HC-CELL-ID-MISMATCH** | Payload có `cell_id` **≠** `cell_id` đang gắn NK đó | **Từ chối** ghi | **409** `HRM-HC-CELL-ID-MISMATCH` — **không** thay identity |
| **BR-REC-HC-OVERRIDE-OMIT-OK** | `allow_override=true` + omit/empty `cell_id` + NK khớp | Reuse + ghi qty/status theo override | **2xx** · **không** 400 chỉ vì omit |
| **BR-REC-01-LOCK** *(RETAIN)* | Ô `need_hire_approved` + mutate qty/status **không** `allow_override` | **409** `HRM-HC-CELL-LOCKED` · lưới nguyên | Sealed QC-02 — **cấm** reopen |
| **BR-BP-HC-04** *(RETAIN)* | Spawn / re-spawn | ≤1 YCTD / `headcount_cell_id` in_plan | UQ partial |
| **BR-O3-QTY-DRIFT** *(RETAIN)* | Sau spawn, override đổi SL ô | Warn drift · **cấm** silent overwrite YCTD | Version confirm path riêng |

---

## 3. Error / validation semantics (`HRM-HC-*` extend)

| Code | HTTP | When | FE feedback |
|------|------|------|-------------|
| **`HRM-HC-CELL-LOCKED`** | **409** | Mutate locked **without** `allow_override` | Toast/banner VI · lưới **không** blank *(must_keep)* |
| **`HRM-HC-CELL-ID-MISMATCH`** | **409** | Payload `cell_id` ≠ existing NK identity | Toast VI: ô đã có định danh — gửi đúng `cell_id` hoặc bỏ trống để hệ thống giữ | 
| **`HRM-HC-SPAWN-QTY-DRIFT`** | 200 envelope warn **hoặc** 422 trên path conflict *(API-01 HC-S5)* | Override đổi SL khi YCTD đã gắn | Dialog warn peer O3 — **không** auto sửa YCTD |
| **`HRM-HC-VAL-400`** | 400 | Qty/status/month invalid (VAL sẵn) | Toast field |
| *(no new code for omit)* | — | Omit `cell_id` + NK hit | **Silent reuse** — không lỗi |

**DENY:** Code mới kiểu `HRM-HC-CELL-ORPHAN-FORCE` / auto-relink. **DENY** 400 bắt buộc `cell_id` khi Option A đã reuse.

---

## 4. UI / FE after 2xx (U63/U65)

| Rule | Measurable |
|------|------------|
| **Echo** | Portal PUT luôn gửi `cell_id` lấy từ GET/detail gần nhất (belt). |
| **After override 2xx** | FE hiển thị **cùng** `cell_id`; SL mới; lifecycle vẫn `need_hire_approved` (trừ rule khác). |
| **Drift** | Nếu đã có YCTD `in_plan` cùng `headcount_cell_id` và `need_hire ≠ yctd.headcount` → AlertDialog / banner **qty_drift** (copy peer O3) — user xác nhận version **mới** cập nhật YCTD (OUT silent). |
| **F5** | GET lại: **same** `cell_id` · qty mới · YCTD count không +1 vì mint ảo; cross-nav ô→YCTD vẫn đúng. |
| **409 LOCKED** | Không đổi UI grid thành 0 vị trí *(must_keep EX-04)*. |

---

## 5. Acceptance criteria (ADD ids)

### 5.1 Happy

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-HC-CELL-01** | Plan approved; ô NK có `cell_id=C0`; **chưa** hoặc **đã** spawn YCTD gắn `C0`; user có quyền override | PUT `allow_override=true` đổi `need_hire`, **omit** `cell_id` | **200**; GET cell **`cell_id=C0`** (reuse); **không** mint mới | L1 GET before/after |
| **AC-REC-HC-CELL-01b** | Same; FE portal | User confirm override (O3 dialog nếu drift) → Lưu | Network PUT body **có** `cell_id=C0` (echo); **200**; FE sau 2xx hiện cùng id + SL mới | DevTools + screenshot |
| **AC-REC-HC-CELL-01c** | AC-01 PASS; YCTD đã spawn `headcount_cell_id=C0` | Quan sát YCTD | `headcount_cell_id` **vẫn `C0`**; không row YCTD thứ hai; re-spawn → `skipped_duplicate` | Spawn + list |

### 5.2 Alternate

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-HC-CELL-ALT-01** | Ô `C0` đã spawn; override đổi SL | PUT override omit `cell_id` → 200 reuse | Response/FE có **qty_drift warn** (O3); YCTD.headcount **chưa** đổi đến khi xác nhận version | Envelope / dialog |
| **AC-REC-HC-CELL-ALT-02** | Draft / unlocked cell; omit `cell_id`; NK đã có | PUT không cần override | Reuse `C0`; mint không xảy ra | GET |
| **AC-REC-HC-CELL-ALT-03** | NK **chưa** tồn tại (ô tháng/vị trí mới) | PUT/POST | Mint `cell_id` mới **hợp lệ** (lần đầu) | GET new id |

### 5.3 Exception

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-HC-CELL-EX-01** | Ô locked `C0` | PUT đổi SL **không** `allow_override` | **409** `HRM-HC-CELL-LOCKED`; GET `cell_id=C0` nguyên; spawn eligible giữ *(must_keep)* | L1 |
| **AC-REC-HC-CELL-EX-02** | Ô `C0` tồn tại | PUT `allow_override` + `cell_id=C_FOREIGN` (≠ C0, cùng NK) | **409** `HRM-HC-CELL-ID-MISMATCH`; identity vẫn `C0` | Network |
| **AC-REC-HC-CELL-EX-03** | Regression mint | PUT override omit `cell_id` | **FAIL** nếu GET `cell_id ≠ C0` | L1 assert |
| **AC-REC-HC-CELL-EX-04** | Seed / SQL flip identity để «fix» orphan | — | **FAIL U65** | Process |

### 5.4 FE-after-2xx + F5 diễn biến

| Bước | Actor | Action | Network / FE | F5 |
|------|-------|--------|--------------|-----|
| 1 | QA/Dev | Baseline GET ô `C0` (+ optional YCTD) | Ghi `C0`, qty0, yctdId? | — |
| 2 | User | Override SL (dialog O3 nếu cần) → Lưu | PUT `allow_override=true` · prefer body có `cell_id` · **hoặc** omit | — |
| 3 | Hệ thống | Persist | **200**; body/GET `cell_id=C0` · qty1 | — |
| 4 | FE | Sau 2xx | Cùng id + SL mới; drift warn nếu YCTD lệch | — |
| 5 | User | F5 detail | Cùng `C0` + qty1; YCTD vẫn gắn `C0`; không orphan | Còn |
| 6 | Hệ thống | Re-spawn | `skipped_duplicate` trên `C0` | Count ổn |

---

## 6. VAL rows (ADD)

| VAL-ID | Rule | Valid | Invalid |
|--------|------|-------|---------|
| **VAL-REC-HC-CELL-01** | Reuse when NK hit | Omit `cell_id` → same id | New id on same NK = FAIL |
| **VAL-REC-HC-CELL-02** | Explicit match | `cell_id=C0` + NK(C0) → 2xx | — |
| **VAL-REC-HC-CELL-03** | Mismatch | — | Foreign id → `HRM-HC-CELL-ID-MISMATCH` |
| **VAL-REC-HC-CELL-04** | Lock RETAIN | — | No override → `HRM-HC-CELL-LOCKED` |
| **VAL-REC-HC-CELL-05** | Drift RETAIN | Warn; YCTD unchanged | Silent YCTD overwrite = FAIL O3 |

---

## 7. Spec says / code does (handoff BE)

| | |
|--|--|
| **spec says** | DATA-01 stable identity; natural key unique; Option A REUSE on omit. |
| **code does (AS-IS)** | `normalizeHeadcountCell` luôn mint khi thiếu `cell_id` → reuse branch `!cell.cell_id` dead; QA mint confirmed. |
| **fix required** | Reuse **trước hoặc thay** mint khi `existingByNaturalKey` hit; nếu payload có id lệch → MISMATCH; jest: omit override → same `cell_id` + YCTD still linked. |
| **FE** | Echo `cell_id` trên PUT; O3 drift dialog khi lệch YCTD (NOTE_BLOCKED hiện tại → closable khi wire). |

---

## 8. must_keep / OUT / honesty

| Keep | OUT |
|------|-----|
| 409 `HRM-HC-CELL-LOCKED` + no wipe (BE-02/QA-02/QC-02) | REC-02/02b body |
| Spawn idempotency BR-BP-HC-04 | Mint+relink Option B |
| O3 no silent YCTD overwrite | Soft-retire cell identity |
| U19 list=get=spawn · invent `/rec/headcount-plans` 404 | Module REC UAT / honesty flip |
| XBOS submit-workflow | Seed / DB fake |

**Honesty:** `recruitment_uat_ready=false` · **C-SLICE-≠-MODULE**.

---

## 9. Traceability

| Residual | BR / AC | Journey |
|----------|---------|---------|
| **R-REC-HC-OVERRIDE-CELLID** | BR-REC-HC-CELL-STABLE · AC-REC-HC-CELL-01* | Deepen **J-HRM-REC-HC-01** override omit path · **J-HRM-REC-HC-01b** link keep |
| O3 | AC-REC-HC-01b-ALT-02 · AC-REC-HC-CELL-ALT-01 | qty_drift dialog |
| Lock | AC-REC-HC-01-EX-04 · AC-REC-HC-CELL-EX-01 | must_keep |

---

## 10. Completion contract (spec)

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **next_owner** | **dev-be** (FIX required — **không** ACCEPT_AS_IS) |
| **disposition** | Option A LOCKED · residual closable sau BE+QA |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-hc-override-cellid-ba-01.md` |
