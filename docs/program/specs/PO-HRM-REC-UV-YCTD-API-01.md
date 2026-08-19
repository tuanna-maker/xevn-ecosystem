# PO-HRM-REC-UV-YCTD-API-01 — API_DESIGN delta · UV↔YCTD + So sánh (CONFIRMED)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-UV-YCTD-API-01` |
| **lane** | governance · sa |
| **change_mode** | ADD · **NO CODE** `apps/**` · **no migrate** |
| **Date** | 2026-08-06 |
| **Status** | **CONFIRMED API delta** — cascade **DB-01 + API-01 đủ**; **Dev `apps/**` HOLD** until PM unlock after QA plan — **this wave does not unlock Dev** |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **v0.11** · **FR-UC-BP-REC-05a** · **FR-UC-BP-REC-06b** |
| **ref_techspec** | [`PO-HRM-REC-UV-YCTD-TECH-01.md`](./PO-HRM-REC-UV-YCTD-TECH-01.md) **§2–§3** F.1 · **§6** errors |
| **ref_db** | [`PO-HRM-REC-UV-YCTD-DB-01.md`](./PO-HRM-REC-UV-YCTD-DB-01.md) **CONFIRMED** — ONE physical `requisition_id` |
| **ref_soft_fk_pattern** | [`PO-HRM-JD-YCTD-REF-API-01.md`](./PO-HRM-JD-YCTD-REF-API-01.md) — alias ONE physical / empty 200[] |
| **Client pointer** | [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) F-REC-APP-* + DOC-DELTA (cite — **no wipe** stubs) |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · U65 zero-seed · FORBIDDEN `job_postings` / **REC-03** as UV/compare SoT |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Objective

Confirm **API_DESIGN F.1** overlay deepen **F-REC-APP-01** + ADD family **F-REC-UV-YCTD-01..05** / **F-REC-CMP-01..02**, with:

| Lock | Rule |
|------|------|
| DTO alias | `recruitment_request_id` ↔ `requisition_id` — **ONE** physical column |
| Write path | Create UV+application **YCTD required**; Lane A spine + N–N add — **cấm** invent second FK name |
| Position | Derive from YCTD; reject free-text SoT / `HRM-REC-UV-POSITION-MISMATCH` |
| Errors | `HRM-REC-UV-YCTD-REQUIRED` · `STATUS` · `NOT-FOUND` · `POSITION-MISMATCH` · `HRM-REC-CMP-MAX-N` · `YCTD-MIX` |
| Empty | Receivable 0 YCTD / 0 UV → **200 `[]`** |
| SoT boundary | **FORBIDDEN** `job_postings` · REC-03 / campaign GĐ1 |
| Cascade | Spec → Tech → **DB-01 CONFIRMED** → **this API-01 CONFIRMED** → **QA plan** → PM unlock Dev |

---

## 1. Capability overlay — F-REC-UV-YCTD / F-REC-CMP → F-REC-APP-*

**Prefix physical (AS-IS Nest prefer):** `/api/hrm/recruitment`  
**Prefix logical (enterprise):** `/api/hrm/rec`  
**Envelope:** `{ code, message, data }`  
**Scope:** list / get / mutate = **cùng** `resolveHrmListScope` + `company_id` + `assertResourceInHrmScope` (U19 `scope_parity`).

| Cap | F-id | Enterprise overlay | METHOD / path (physical prefer) | Logical path | SRS |
|-----|------|--------------------|----------------------------------|--------------|-----|
| List YCTD receivable | **F-REC-UV-YCTD-01** | Reuse YCTD list + receivable filter | `GET /recruitment/requisitions?company_id=&receivable=true` | `GET /rec/recruitment-requests?open_for_hire=true` | **05a #1–#2** · **06b #1–#2** |
| Get YCTD → position | **F-REC-UV-YCTD-02** | Get YCTD display-ready | `GET /recruitment/requisitions/:id` | same | **05a #3–#4** |
| Create UV + YCTD link | **F-REC-UV-YCTD-03** | **Delta on F-REC-APP-01** create | `POST /recruitment/candidates` | `POST /rec/candidates` | **05a #5–#6** |
| Update / add N–N link | **F-REC-UV-YCTD-04** | **Delta on F-REC-APP-01** link | `PATCH …/candidates/:id` · `POST …/candidates/:id/applications` | same | **05a** N–N |
| List/get UV + YCTD | **F-REC-UV-YCTD-05** | Read UV display-ready | `GET /recruitment/candidates` · `GET …/:id` | `GET /rec/candidates` | **05a Thành công** |
| Apps + evals by YCTD | **F-REC-CMP-01** | Compare read (new family) | `GET /recruitment/applications?requisition_id=&include=evals` | `GET /rec/applications?recruitment_request_id=` | **06b #3–#4 · #6** |
| Compare matrix ≤ N | **F-REC-CMP-02** | Dedicated compare (**A1 CHOSEN**) | `GET /recruitment/compare?requisition_id=&candidate_ids=` | `GET /rec/compare` | **06b #5 · Thành công** |

**Reuse — không invent SoT mới:**

| Reuse | Do not invent |
|-------|----------------|
| YCTD list/get = F-YCTD-JD-05 / F-REC-YCTD-* (+ receivable) | Second YCTD table / campaign |
| Soft FK physical name = DB-01 **`requisition_id`** | Dual column `recruitment_request_id` |
| Eval = F-REC-APP-03 on `application_id` | Scores from `job_postings` |
| Stage timeline = F-REC-APP-02 | Rewrite pipeline stubs |
| Hire / mail stubs | Must_keep F-REC-HIRE-01 / F-REC-MAIL-01 |

---

## 2. DTO alias (locked — ONE physical)

| Plane | Field name | Maps to |
|-------|------------|---------|
| **Physical AS-IS / Nest** | `requisition_id` | `recruitment_candidates.requisition_id` **or** application.`requisition_id` (N–N) → `job_requisitions.id` |
| **Logical enterprise** | `recruitment_request_id` | **Same id value** — serializer alias only |
| **YCTD target** | `job_requisitions.id` / logical `rec_recruitment_request.id` | Soft-FK resolve |

```text
Request may accept EITHER name; service normalizes to physical requisition_id.
Response SHOULD expose both (or document one + alias note) — NEVER two different values.
FORBIDDEN: dual physical columns · dual FK write · invent recruitment_request_id column beside requisition_id.
FORBIDDEN: job_posting_id / job_postings as UV create or compare filter SoT.
```

| Rule ID | Condition | Expected |
|---------|-----------|----------|
| **AV-UV-YCTD-ALIAS-01** | Body has `recruitment_request_id` only | Persist `requisition_id` = that id |
| **AV-UV-YCTD-ALIAS-02** | Body has both names with **different** values | **400** — reject ambiguous dual |
| **AV-UV-YCTD-ALIAS-03** | Migrate invents second physical col | **FAIL** schema review (DB DV-UV-YCTD-15) |

---

## 3. Write path lock — Lane A vs N–N (no second FK)

### 3.1 CHOSEN path

| Step | Path | Physical persist | Notes |
|------|------|------------------|-------|
| **MVP create (FR-05a)** | `POST /recruitment/candidates` with **required** `requisition_id` \| `recruitment_request_id` | Lane A: `recruitment_candidates.requisition_id` **NOT NULL** (AS-IS spine FR-RC-03) | Satisfies ONE soft FK name; creates UV **with** YCTD |
| **N–N add (same UV, other YCTD)** | `POST /candidates/:id/applications` | Application row soft FK **`requisition_id`** only (logical alias `recruitment_request_id`) | Enterprise N–N home = application; **same column name** when physicalized |
| **List/compare filter** | Query `requisition_id` \| `recruitment_request_id` | Filter applications / Lane A rows by that id | Same alias rules |

### 3.2 AS-IS dual-route honesty (FR-05a override)

| AS-IS today | FR-05a / this API lock |
|-------------|------------------------|
| `POST /candidates` **+** `requisition_id` → Lane A `recruitment_candidates` | **KEEP** — primary MVP create |
| `POST /candidates` **−** `requisition_id` → Lane B pool (`candidates`) | **FORBIDDEN for FR-05a MVP create** → **400** `HRM-REC-UV-YCTD-REQUIRED` (do **not** silent-fallback to pool as «Thêm UV» success) |
| Lane B `candidate_applications.job_posting_id` | **OUT of SoT** — REC-03 · AC-REC-CMP-01 |

### 3.3 Transition to physical N–N

```text
Today (Lane A 1:1):   UV row carries requisition_id
Target (enterprise):  application row carries requisition_id; person row has no position SoT
Migration rule:       RENAME/MOVE only — NEVER invent second FK column name
UQ:                   (candidate_id, requisition_id) active
```

**Rebind policy GĐ1:** default **lock** `requisition_id` on application once stage = `hired`; other stages may add **new** application to another YCTD (N–N), not silently overwrite hired link.

---

## 4. Position contract (locked)

```text
UvPositionDisplay = {
  recruitment_request_id: string,  // = physical requisition_id
  position_key: string,            // SoT from YCTD
  position_name: string,           // display-ready
  source: 'yctd'                   // never 'free_text'
}
```

| Rule | Expected |
|------|----------|
| Create/link | Derive `position_key` / `position_name` from YCTD |
| Client sends `position_key` ≠ YCTD | **400** `HRM-REC-UV-POSITION-MISMATCH` |
| Client sends free-text `position` as SoT | **Reject** (or ignore + never persist as SoT) — AC-REC-UV-03 |
| Optional denorm on application | Copy from YCTD at link time — **not** second SoT |

---

## 5. Receivable YCTD enum (locked)

| Plane | Receivable (MVP GĐ1) | Not receivable |
|-------|----------------------|----------------|
| Enterprise lifecycle | `approved` / `open` / `open_for_hire` | draft, submitted, rejected, filled, cancelled |
| AS-IS `job_requisitions.status` | `open` | `closed`, `on_hold` |

Empty receivable set → **200 `[]`**. Bind when not receivable → `HRM-REC-UV-YCTD-STATUS`.

---

## 6. API_DESIGN F.1 — F-REC-UV-YCTD-01..05

### 6.1 F-REC-UV-YCTD-01 — List YCTD receivable (picker)

| | |
|--|--|
| **Mục đích** | Cung cấp danh sách YCTD đúng pháp nhân ở trạng thái **được nhận hồ sơ** cho form Thêm UV và bộ chọn So sánh — empty trung thực khi 0. |
| **Nghiệp vụ xử lý** | (1) Resolve scope JWT + `company_id`. (2) Query YCTD **cùng scope** list/get (parity F-YCTD-JD-05). (3) Filter **receivable** (§5). (4) `items=[]` → **200 empty** — FE empty + CTA tạo/duyệt YCTD (SRS **05a #2** · **06b #2**). (5) **FORBIDDEN** đọc từ `job_postings` / campaigns. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-05a** Diễn biến **#1** · **#2** · **FR-UC-BP-REC-06b** **#1** · **#2** · BR-BP-CV-03 · BR-BP-REC-CMP-01. |
| **Request** | Query: `company_id` (required); `receivable=true` / `open_for_hire=true`. Optional: `q`. |
| **Response → DB** | `items[]` ← `job_requisitions` / `rec_recruitment_request`: `id`, `code?`, `title`, `position_key`, `position_name?`, `status`, `headcount?`. |
| **Lỗi nghiệp vụ** | `403`/`409` scope · empty `[]` **hợp lệ** — **không** 404 cho empty list. |

---

### 6.2 F-REC-UV-YCTD-02 — Get YCTD → derive position display

| | |
|--|--|
| **Mục đích** | Sau khi user chọn YCTD, trả **vị trí hiển thị** (mã/tên chức danh) để bind SELECT/read-only — không bắt nhập free-text. |
| **Nghiệp vụ xử lý** | (1) GET YCTD by id **scope_parity**. (2) Ngoài scope → `HRM-REC-UV-YCTD-NOT-FOUND` 404. (3) Không receivable → `HRM-REC-UV-YCTD-STATUS` 400. (4) Compose `UvPositionDisplay` từ YCTD (+ catalog join) — **không** chấp nhận client ghi đè free-text SoT. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-05a** Diễn biến **#3** · **#4** · AC-REC-UV-03. |
| **Request** | Path `:id` + `company_id`. |
| **Response → DB** | YCTD: `id`, `status`, `position_key`, `position_name`; optional JD ref display (reuse F-YCTD-JD-05). |
| **Lỗi** | `HRM-REC-UV-YCTD-STATUS` · `HRM-REC-UV-YCTD-NOT-FOUND` · scope 403/409. |

---

### 6.3 F-REC-UV-YCTD-03 — Create UV + application (YCTD required) · **overlay F-REC-APP-01**

| | |
|--|--|
| **Mục đích** | Tạo hồ sơ ứng viên và **bắt buộc** gắn soft FK → YCTD; stage pipeline trên liên kết UV–YCTD. |
| **Nghiệp vụ xử lý** | (1) Scope assert. (2) Validate PII tối thiểu (họ tên; liên hệ theo chính sách). (3) **BR-BP-CV-03:** normalize alias → physical `requisition_id` **required** — thiếu → `HRM-REC-UV-YCTD-REQUIRED` 400 (SRS **#5**). (4) Load YCTD same scope; không tồn tại → `NOT-FOUND`; không receivable → `STATUS`. (5) Derive position; client `position_key` lệch → `POSITION-MISMATCH`; free-text `position` **không** persist as SoT. (6) Persist Lane A spine **and/or** application link with **same** `requisition_id` (§3) + UQ; stage initial. (7) **FORBIDDEN** insert/link qua `job_postings` / Lane B posting SoT. (8) **FORBIDDEN** silent Lane B pool create when YCTD missing. (9) Return 201 display-ready gồm YCTD id + position derived. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-05a** **#5** · **#6** · **Thành công** · AC-REC-UV-01..04 · BR-BP-CV-01/03. |
| **Request → DB** | `full_name`, `email?`, `phone?`, `source`/`source_code`, **`requisition_id` \| `recruitment_request_id`** (required), `stage`/`status` initial, optional `position_key` (must match). Physical: `recruitment_candidates.*` (+ application when N–N). |
| **Response → DB** | 201: `candidate_id`, `application_id?`, `requisition_id` (+ alias), `position_key`, `position_name`, `stage`. Keep AS-IS 2xx codes; optional `HRM-REC-UV-201`. |
| **Lỗi nghiệp vụ** | `HRM-REC-UV-YCTD-REQUIRED` · `STATUS` · `NOT-FOUND` · `POSITION-MISMATCH` · `409` duplicate UQ · scope 403/409 · `HRM-VAL-400` thiếu họ tên/liên hệ. |

**Context create (AC-REC-UV-04):** FE prefill `?requisition_id=` — BE vẫn validate required + receivable.

**Stub preserve:** F-REC-APP-01 Mục đích N–N **giữ**; wave **ADD** REQUIRED/STATUS/alias/position gates + map Diễn biến **05a** — **không wipe** F-REC-APP-02/03/HIRE.

---

### 6.4 F-REC-UV-YCTD-04 — Update UV / add application (N–N)

| | |
|--|--|
| **Mục đích** | Cập nhật PII; gắn thêm YCTD (N–N) với cùng gate receivable + position derived. |
| **Nghiệp vụ xử lý** | Same REQUIRED/STATUS/MISMATCH/alias khi thêm application; soft FK only; **không** đổi YCTD của link đã `hired` (GĐ1); UQ `(candidate_id, requisition_id)`. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-05a** quy tắc N–N · FR-UC-BP-REC-05 pipeline trên từng liên kết. |
| **Request → DB** | PATCH candidate fields; POST application `{ requisition_id \| recruitment_request_id, stage }`. |
| **Lỗi** | Same taxonomy §6.3 · `409` invalid stage / duplicate / hired rebind. |

---

### 6.5 F-REC-UV-YCTD-05 — List/Get UV with YCTD + position

| | |
|--|--|
| **Mục đích** | Trả UV kèm liên kết YCTD + vị trí derived để list/detail sau Lưu và F5 (AC-REC-UV-02). |
| **Nghiệp vụ xử lý** | List/get **scope_parity**; join YCTD via soft FK; expose `position_key`/`position_name` từ YCTD (hoặc denorm sync) — **không** free-text SoT. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-05a** **Thành công** · AC-REC-UV-02 · UC kế REC-05/06. |
| **Response → DB** | Candidate + `applications[]` hoặc embedded: `{ application_id?, requisition_id (+alias), yctd_title?, position_key, position_name, stage }`. |
| **Lỗi** | 404 out-of-scope get-by-id · không nuốt 500 thành empty list. |

---

## 7. API_DESIGN F.1 — F-REC-CMP-01..02

### 7.1 F-REC-CMP-01 — Applications + evals by YCTD

| | |
|--|--|
| **Mục đích** | Sau khi chọn một YCTD trên So sánh, tải ứng viên đã gắn + điểm đánh giá trên liên kết UV–YCTD (empty ngữ cảnh khi 0 UV). |
| **Nghiệp vụ xử lý** | (1) Scope assert. (2) Require `requisition_id` / `recruitment_request_id`. (3) List applications / Lane A UV cho YCTD. (4) LEFT JOIN latest evals (F-REC-APP-03). (5) Chưa đánh giá → `eval_status: none` + label «chưa đánh giá» (SRS **#6**) — vẫn trả row. (6) `items=[]` → **200 empty** (AC-REC-CMP-03). (7) **FORBIDDEN** `job_postings` filter. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-06b** **#3** · **#4** · **#6** · AC-REC-CMP-01..03 · **05** · BR-BP-REC-CMP-01 · FR-UC-BP-REC-06. |
| **Request** | Query: `company_id`, `requisition_id` \| `recruitment_request_id` (required), `include=evals`. |
| **Response → DB** | `items[]`: `candidate_id`, `application_id?`, `full_name`, `stage`, `eval_status`, `scores[]?`, `result?`. |
| **Lỗi** | `HRM-REC-UV-YCTD-REQUIRED` nếu thiếu id · `NOT-FOUND` / scope · empty `[]` hợp lệ. |

---

### 7.2 F-REC-CMP-02 — Compare matrix (≤ N) · **Option A1 CHOSEN**

| | |
|--|--|
| **Mục đích** | Trả payload ma trận/radar cho tối đa N ứng viên **cùng một YCTD** theo tiêu chí đã lưu. |
| **Nghiệp vụ xử lý** | (1) Validate mọi `candidate_ids` / `application_ids` thuộc cùng `requisition_id`. (2) count > N (default **4**) → `HRM-REC-CMP-MAX-N` 400. (3) Assemble criteria + scores; missing → null / «chưa đánh giá». (4) **BE authoritative max-N + mix guard** — không chỉ FE disable. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-06b** **#5** · **Thành công** · AC-REC-CMP-04 · AC-REC-CMP-05. |
| **Request** | Query: `requisition_id` \| `recruitment_request_id` + `candidate_ids[]` (≤ N) **hoặc** `application_ids[]`. |
| **Response** | `{ requisition_id, criteria[], rows[{ candidate_id, scores{}, eval_status }] }` — display-ready; không C&B. |
| **Lỗi** | `HRM-REC-CMP-MAX-N` · `HRM-REC-CMP-YCTD-MIX` · scope. |

**Compare SoT (locked):**

```text
Compare filter SoT     = YCTD (requisition_id / recruitment_request_id)
Score SoT              = interview eval on application_id (UV×YCTD)
FORBIDDEN filter SoT   = job_postings / campaign / tin đăng
Empty 0 YCTD / 0 UV    = 200 [] (not fake rows)
```

**Option A2 (FE compose from CMP-01):** allowed only if BE still exposes a thin max-N/mix check — default delivery = **A1** dedicated `GET compare`.

---

## 8. Error taxonomy (locked)

| Code | HTTP | When | SRS |
|------|------|------|-----|
| `HRM-REC-UV-YCTD-REQUIRED` | 400 | Create/link thiếu YCTD id (alias either name) | 05a #5 · AC-UV-01 |
| `HRM-REC-UV-YCTD-STATUS` | 400 | YCTD không receivable | 05a #3 |
| `HRM-REC-UV-YCTD-NOT-FOUND` | 404 | Id ngoài scope / không tồn tại | 05a đặc biệt |
| `HRM-REC-UV-POSITION-MISMATCH` | 400 | `position_key` lệch YCTD / free-text SoT | 05a #4 · AC-UV-03 |
| `HRM-REC-CMP-MAX-N` | 400 | Chọn > N ứng viên | 06b #5 · AC-CMP-04 |
| `HRM-REC-CMP-YCTD-MIX` | 400 | Trộn ứng viên hai YCTD | BR-BP-REC-CMP-01 |
| scope | 403/409 | JWT / company mismatch | U19 |

Empty lists = **200 []** — không dùng error codes cho «0 YCTD» / «0 UV».

---

## 9. FORBIDDEN (API / SoT)

| Forbidden | Why |
|-----------|-----|
| Dual physical `requisition_id` + `recruitment_request_id` | Alias only (DB DV-UV-YCTD-15) |
| `job_postings` / `job_posting_id` as UV create or compare SoT | REC-03 OUT · AC-REC-CMP-01 |
| Unlock **F-REC-CAMPAIGN-*** / FR-UC-BP-REC-03 GĐ1 | Client HOLD GĐ2 |
| Silent Lane B pool create as FR-05a success without YCTD | BR-BP-CV-03 |
| Free-text `position` as position SoT | AC-REC-UV-03 |
| Empty receivable → 404 | Must 200[] |
| Claim `recruitment_uat_ready` / `jd_dynamic_done` / Dev unlock this seat | Honesty |
| Seed UV↔YCTD links for UAT evidence | U65 |
| CASCADE-delete applications when YCTD closes | DB-01 |

---

## 10. Matrix FR ↔ F-id ↔ bước SRS ↔ AC

| FR | Diễn biến | F-id | Enterprise overlay | AC |
|----|-----------|------|--------------------|-----|
| REC-05a | **#1** mở form | F-REC-UV-YCTD-01 | — | — |
| REC-05a | **#2** 0 YCTD | F-REC-UV-YCTD-01 empty 200[] | — | empty CTA |
| REC-05a | **#3** chọn YCTD | F-REC-UV-YCTD-02 (+ STATUS) | — | — |
| REC-05a | **#4** vị trí derived | F-REC-UV-YCTD-02 · create derive | — | AC-REC-UV-03 |
| REC-05a | **#5** thiếu YCTD | F-REC-UV-YCTD-03 REQUIRED | **F-REC-APP-01** | AC-REC-UV-01 |
| REC-05a | **#6** lưu đủ | F-REC-UV-YCTD-03 | **F-REC-APP-01** | AC-REC-UV-01/04 |
| REC-05a | **Thành công** / F5 | F-REC-UV-YCTD-05 | — | AC-REC-UV-02 |
| REC-06b | **#1** mở so sánh | F-REC-UV-YCTD-01 | — | AC-REC-CMP-01 |
| REC-06b | **#2** 0 YCTD | F-REC-UV-YCTD-01 empty | — | AC-REC-CMP-02 |
| REC-06b | **#3–#4** chọn YCTD / 0 UV | F-REC-CMP-01 | — | AC-REC-CMP-03 |
| REC-06b | **#5** ≤ N | F-REC-CMP-02 | — | AC-REC-CMP-04 |
| REC-06b | **#6** chưa đánh giá | F-REC-CMP-01 eval_status | F-REC-APP-03 read | AC-REC-CMP-05 |
| REC-06b | **Thành công** | F-REC-CMP-02 | — | AC-REC-CMP-05 |
| REC-03 | — | **OUT** | F-REC-CAMPAIGN HOLD | FORBIDDEN postings |
| REC-05 / 06 | pipeline / eval write | F-REC-APP-02 / 03 | **must_keep stubs** | consumer of CMP |

Journey (QA): `J-HRM-REC-UV-01` · `J-HRM-REC-CMP-01` — browser U65.

---

## 11. Client API_DESIGN pointer (no wipe)

| Artifact | Action |
|----------|--------|
| `API_DESIGN_HRM_ENTERPRISE.md` **F-REC-APP-01** | DOC-DELTA: deepen YCTD required + alias + position + errors + map **05a**; keep N–N intent |
| F-REC-APP-02 / 03 / MAIL / HIRE | **KEEP** stubs — no wipe |
| ADD pointer family | F-REC-UV-YCTD-01..05 · F-REC-CMP-01..02 → SoT file |
| F-REC-CAMPAIGN-* | Remain **HOLD GĐ2** |
| §7.3 matrix | UPGRADE F-REC-APP-01 row + ADD UV/CMP rows |
| Footer DOC-DELTA | This work_item — SoT file cite |

---

## 12. Cascade & Dev HOLD

```text
SRS v0.11 FR-05a/06b (DONE)
  → TechSpec PO-HRM-REC-UV-YCTD-TECH-01 (DONE)
  → DB_DESIGN PO-HRM-REC-UV-YCTD-DB-01 (CONFIRMED)
  → API_DESIGN this file (CONFIRMED)  ← done
  → QA plan PO-HRM-REC-UV-YCTD-QA-PLAN-01
  → PM unlock Dev-BE/FE (narrow UV create + compare) — NOT this seat
```

| Gate | Rule |
|------|------|
| **Cascade complete** | DB-01 + API-01 both **CONFIRMED** |
| **This wave** | **No** `apps/**` · **no** migrate · **no** Dev unlock claim |
| **PM unlock Dev** | After QA plan (or PM policy) — narrow: REQUIRED/STATUS/alias/position/compare max-N only |
| **must_keep** | ONE physical `requisition_id` · F-REC-APP-02/03/HIRE stubs · eval on application |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` |

---

## 13. Risks

| Risk | Mitigation |
|------|------------|
| Dual column invent in Nest DTO | Alias map §2 + schema review |
| AS-IS dual-route pool bypass FR-05a | §3.2 FORBIDDEN silent Lane B |
| Compare still calls postings | §9 + AC-CMP-01 |
| Empty list treated as error | 200 [] contract |
| FE free-text position survives | BE MISMATCH/reject + QA browser |
| Claim module UAT after narrow GWC | honesty flags false |

---

## 14. Validation / acceptance (governance)

| Check | Pass |
|-------|------|
| Every Diễn biến **05a #1–#6** + Thành công mapped ≥1 F-id F.1 | §6 · §10 |
| Every Diễn biến **06b #1–#6** + Thành công mapped ≥1 F-id F.1 | §7 · §10 |
| F-REC-APP-01 overlay without wipe APP-02/03 | §6.3 · §11 |
| Alias ONE physical | §2 |
| Write path Lane A + N–N same FK name | §3 |
| Error codes REQUIRED/STATUS/NOT-FOUND/MISMATCH/MAX-N/YCTD-MIX | §8 |
| Empty receivable / 0 UV = 200 [] | §5 · §7 |
| REC-03 / job_postings OUT | §9 |
| No Dev unlock / honesty false | §12 |
| Evidence | `docs/qa/evidence/po-hrm-rec-uv-yctd-api-01.md` |

---

## Completion

| Field | Value |
|-------|--------|
| completion_report | API delta CONFIRMED: F-REC-UV-YCTD-01..05 + F-REC-CMP-01..02 F.1 overlay F-REC-APP-01; DTO alias ONE physical `requisition_id`; write path Lane A + N–N same FK; position derived; errors locked; empty 200[]; FORBIDDEN job_postings/REC-03. Client DOC-DELTA no wipe. Cascade DB+API complete → next QA plan (no Dev unlock this seat). No apps/**. Honesty false. |
| next_owner | **pm** → **qa** (`PO-HRM-REC-UV-YCTD-QA-PLAN-01`) |
| evidence_path | `docs/qa/evidence/po-hrm-rec-uv-yctd-api-01.md` |
| ack_status | **PASS_TO_PM** |
