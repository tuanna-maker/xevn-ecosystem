# PO-HRM-JD-YCTD-REF-API-01 — API_DESIGN delta · F-YCTD-JD ↔ F-REC-YCTD (CONFIRMED)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-YCTD-REF-API-01` |
| **lane** | governance · sa |
| **change_mode** | ADD · **NO CODE** `apps/**` |
| **Date** | 2026-08-06 |
| **Status** | **CONFIRMED API delta** — cascade DB-01 + API-01 **đủ**; Dev `apps/**` **HOLD lifts** chỉ khi cả hai CONFIRMED (điều kiện này **đạt** sau wave này) |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **v0.10** · **FR-UC-BP-REC-02** · **02b** Diễn biến **1a–1d** · Thành công FE |
| **ref_techspec** | [`PO-HRM-JD-YCTD-REF-TECHSPEC-01.md`](./PO-HRM-JD-YCTD-REF-TECHSPEC-01.md) **§2** F-YCTD-JD-01..05 · **§4** errors |
| **ref_db** | [`PO-HRM-JD-YCTD-REF-DB-01.md`](./PO-HRM-JD-YCTD-REF-DB-01.md) **CONFIRMED** |
| **ref_arch** | [`PO-HRM-JD-DYNAMIC-ARCH-02.md`](./PO-HRM-JD-DYNAMIC-ARCH-02.md) **§3.5** · **§3.7** · FORBIDDEN `job_postings` |
| **Client pointer** | [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) F-REC-YCTD-* + DOC-DELTA (cite — **no wipe** stubs) |
| **Honesty** | Không claim `jd_dynamic_done` / remaster / face_live / product GO · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Objective

Confirm **API_DESIGN F.1** mapping TechSpec family **F-YCTD-JD-01..05** onto enterprise stubs **F-REC-YCTD-01/02** (+ list/get/patch extensions), with:

| Lock | Rule |
|------|------|
| DTO alias | `job_description_id` ↔ `job_template_id` — **ONE** physical column |
| Errors | `HRM-JD-YCTD-STATUS` · `REQUIRED` · `NOT-FOUND`; empty library **200 `[]`** |
| Preview | ≠ persist full `values_json` on YCTD; optional snapshot text only |
| SoT boundary | **FORBIDDEN** `job_postings` dual-write · REC-03 / campaign GĐ1 unlock |
| Cascade | Spec → TechSpec → **DB-01 CONFIRMED** → **this API-01 CONFIRMED** → QA plan → Dev |

---

## 1. Capability overlay — F-YCTD-JD → F-REC-YCTD family

**Prefix physical (AS-IS Nest):** `/api/hrm/recruitment`  
**Prefix logical (enterprise):** `/api/hrm/rec`  
**Envelope:** `{ code, message, data }`  
**Scope:** list / get / mutate = **cùng** `resolveHrmListScope` + `company_id` + `assertResourceInHrmScope` (U19 `scope_parity`).

| Cap | F-id (TechSpec) | Enterprise overlay | METHOD / path (physical prefer) | Logical path | SRS |
|-----|-----------------|--------------------|----------------------------------|--------------|-----|
| List JD bindable | **F-YCTD-JD-01** | Extends catalog read (F-REC-JD / F-JD-01) — **picker for YCTD** | `GET /recruitment/job-templates?company_id=&bindable=true` | `GET …/job-descriptions?bindable=true` | **1a** · **1b** |
| Preview JD | **F-YCTD-JD-02** | Thin of F-JD-03 / F-REC-JD get | `GET /recruitment/job-templates/:id?preview=yctd` | `GET …/job-descriptions/:id?preview=yctd` | **1c** preview · **1d** |
| Create YCTD + bind | **F-YCTD-JD-03** | **Delta on F-REC-YCTD-01** + **F-REC-YCTD-02** | `POST /recruitment/requisitions` | `POST /rec/recruitment-requests` | **1c** · **1d** · **#2** |
| Re-bind draft | **F-YCTD-JD-04** | Patch YCTD (extend F-REC-YCTD mutate) | `PATCH /recruitment/requisitions/:id` | `PATCH …/recruitment-requests/:id` | **1c/1d** · **#4** |
| List/get display | **F-YCTD-JD-05** | Read YCTD display-ready | `GET /recruitment/requisitions` · `GET …/:id` | `GET …/recruitment-requests` | Thành công · F5 |

**Reuse — không invent SoT mới:**

- Master JD CRUD vẫn **F-JD-01..04** / `job_description_templates`.
- **F-REC-YCTD-03** (duyệt) / **F-REC-YCTD-04** (pipeline flags) — **giữ stub**; JD bind không đổi contract approve/pipeline.
- **F-REC-CAMPAIGN-*** / `job_postings` — **HOLD GĐ2** · **OUT** GĐ1 cho JD SoT.

---

## 2. DTO alias (locked — ONE physical)

| Plane | Field name | Maps to |
|-------|------------|---------|
| **Physical AS-IS** | `job_template_id` | `job_requisitions.job_template_id` |
| **Logical enterprise** | `job_description_id` | **Same id value** — serializer alias only |
| **JD master** | `job_description_templates.id` / logical `rec_job_description.id` | Soft-FK resolve target |

```text
Request may accept EITHER name; service normalizes to physical job_template_id.
Response SHOULD expose both (or document one + alias note) — NEVER two different values.
FORBIDDEN: dual physical columns · dual FK write · invent job_description_id column beside job_template_id.
```

| Rule ID | Condition | Expected |
|---------|-----------|----------|
| **AV-YCTD-JD-ALIAS-01** | Body has `job_description_id` only | Persist `job_template_id` = that id |
| **AV-YCTD-JD-ALIAS-02** | Body has both names with **different** values | **400** validation — reject ambiguous dual |
| **AV-YCTD-JD-ALIAS-03** | Migrate invents second physical col | **FAIL** schema review (DB DV-YCTD-JD-15) |

---

## 3. API_DESIGN F.1 — F-YCTD-JD-01..05

### 3.1 F-YCTD-JD-01 — List JD bindable (picker)

| | |
|--|--|
| **Mục đích** | Cung cấp danh sách JD **Hiệu lực** đúng pháp nhân cho picker form YCTD (không liệt kê Nháp/Ngừng). |
| **Nghiệp vụ xử lý** | (1) Resolve scope JWT + `company_id`. (2) Query templates cùng scope F-JD-01. (3) Filter **bindable** = Hiệu lực (`is_active=true` và không retired/archived). (4) `items=[]` → **200 empty** — FE empty + CTA Thư viện (SRS **1b**). (5) **FORBIDDEN** đọc từ `job_postings`. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-02** Diễn biến **#1a** · **#1b** · **FR-UC-BP-REC-02b** cùng · spine **FR-UC-BP-REC-00** #3 · **00c** #6 · BR-BP-JD-01. |
| **Request** | Query: `company_id` (required); `bindable=true` (required for YCTD picker) hoặc `for=yctd`. Optional: `q`. |
| **Response → DB** | `items[]` ← `job_description_templates`: `id`, `code`, `title`, `position_code`, `position_name?`, `is_active`/`status`, optional thin `short_description` — **không** full nested dynamic form / layout canvas. |
| **Lỗi nghiệp vụ** | `403`/`409` scope · empty `items=[]` **hợp lệ** — **không** 404 cho empty library. |

**Overlay note:** Không thay F-REC-YCTD-01/02 create path; đây là **read catalog** phục vụ form YCTD.

---

### 3.2 F-YCTD-JD-02 — Preview JD (title + short)

| | |
|--|--|
| **Mục đích** | Sau chọn JD trên picker, trả **xem trước** tiêu đề + mô tả ngắn trước Lưu/Gửi — không bắt nhập lại toàn bộ trường động thư viện. |
| **Nghiệp vụ xử lý** | (1) GET template by id **scope_parity** list. (2) Ngoài scope → `HRM-JD-YCTD-NOT-FOUND` 404. (3) Không Hiệu lực → **400** `HRM-JD-YCTD-STATUS` (SRS **1d**) — BE authoritative. (4) Compose preview. (5) **Không** bắt client lưu full `values_json` lên YCTD. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-02** **#1c** · **#1d** · BR-YCTD-JD-REF-02 · AC-YCTD-JD-03/04. |
| **Request** | Path `:id` + `company_id`; query `preview=yctd`. |
| **Response → DB** | Read templates: `id`, `code`, `title`, `job_description`, `requirements`, status. **Out of YCTD persist SoT:** full `values_json` / `layout_snapshot_json`. |
| **Lỗi** | `HRM-JD-YCTD-STATUS` 400 · `HRM-JD-YCTD-NOT-FOUND` 404 · scope 403/409. |

**Preview contract (locked):**

```text
YctdJdPreview = {
  job_template_id: string,      // = logical job_description_id (alias)
  job_description_id?: string,  // optional echo alias — MUST equal job_template_id
  code: string,
  title: string,
  short_description: string,    // from canonical text / bridge — NOT live values_json SoT
  requirements_preview?: string,
  status: 'active'              // bindable only; non-active → error before success
}
```

---

### 3.3 F-YCTD-JD-03 — Create YCTD with JD bind (= delta **F-REC-YCTD-01** + **F-REC-YCTD-02**)

| | |
|--|--|
| **Mục đích** | Tạo YCTD (trong/ngoài ĐB) gắn soft FK JD Hiệu lực; từ chối thiếu tham chiếu bắt buộc / JD Ngừng. |
| **Nghiệp vụ xử lý** | (1) Scope assert. (2) Giữ headcount / trong-ngoài ĐB theo **F-REC-YCTD-01** (in_plan) / **F-REC-YCTD-02** (out_of_plan). (3) **BR-YCTD-JD-REF-01:** khi vị trí có mô tả chuẩn → `job_template_id` / `job_description_id` **required**; thiếu → `HRM-JD-YCTD-REQUIRED` 400. (4) Resolve template same scope; không Hiệu lực → `HRM-JD-YCTD-STATUS` 400. (5) INSERT với soft FK physical; optional one-way snapshot `job_description`/`requirements` — **không** persist full `values_json` trên YCTD. (6) **FORBIDDEN** insert/update `job_postings` / campaign. (7) 201 display-ready gồm mã/tiêu đề JD. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-02** **#1c** · **#1d** · **#2** · Thành công · **FR-UC-BP-REC-02b** · BR-BP-JD-01 · BR-YCTD-JD-REF-01/02. |
| **Request → DB** | Physical: `CreateJobRequisitionDto` → `job_requisitions` (`company_id`, `title`, `department`, `employment_type`, `headcount`, **`job_template_id`**, optional snapshot texts). Logical: `job_description_id` ↔ same; `qty`↔`headcount`; `headcount_mode` / `headcount_flag` in\|out; F-REC-YCTD-01 fields `plan_cell_id`…; F-REC-YCTD-02 `out_of_plan_reason`. |
| **Response → DB** | 201 + row: `id`, `status`, `job_template_id` (+ alias `job_description_id`), `jd_code?`, `jd_title?`, snapshot if stored. Optional code alias `HRM-JD-YCTD-201`. |
| **Lỗi nghiệp vụ** | `HRM-JD-YCTD-REQUIRED` 400 · `HRM-JD-YCTD-STATUS` 400 · `HRM-JD-YCTD-NOT-FOUND` 404 · scope 403/409 · existing headcount/ĐB 4xx. |

**Stub preserve:** Mục đích trong/ngoài ĐB của F-REC-YCTD-01/02 **giữ nguyên**; wave này **ADD** JD bind gate + alias — **không wipe** plan_cell / out_of_plan rules.

---

### 3.4 F-YCTD-JD-04 — Re-bind / clear JD on draft YCTD

| | |
|--|--|
| **Mục đích** | Đổi JD trên bản nháp / sau từ chối (SRS **#4**); re-bind chỉ JD Hiệu lực. |
| **Nghiệp vụ xử lý** | Same status gate as create khi đổi FK; reject Ngừng; soft FK only. **GĐ1 default:** chỉ `draft` / `rejected` được re-bind; approved+ → **409** nếu BR khóa. Clear chỉ khi BR-YCTD-JD-REF-01 không bắt buộc — else `REQUIRED`. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-02** **#4** · **1c/1d** · BR-BP-JD-01. |
| **Request → DB** | PATCH `job_template_id` / alias `job_description_id` (+ optional snapshot text). |
| **Lỗi** | Same taxonomy §3.3 · `409` sai trạng thái YCTD. |

---

### 3.5 F-YCTD-JD-05 — List/Get YCTD with JD reference

| | |
|--|--|
| **Mục đích** | Trả YCTD kèm tham chiếu JD display-ready — list sau Lưu + F5 còn mã/tiêu đề (AC-YCTD-JD-01). |
| **Nghiệp vụ xử lý** | List/get **scope_parity**; join/denorm `jd_title`/`jd_code` từ soft FK; history vẫn hiện JD dù template sau **Ngừng** (BR-BP-JD-01). Body text ưu tiên snapshot YCTD nếu có. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-02** Thành công · AC-YCTD-JD-01 · AC-YCTD-JD-06. |
| **Response → DB** | `job_requisitions.*` + `job_template_id` (+ alias) + `jd_title`/`jd_code`. |
| **Lỗi** | 404 out-of-scope get-by-id · không nuốt 500 thành empty list. |

---

## 4. Error taxonomy (locked)

| Code | HTTP | When | SRS |
|------|------|------|-----|
| `HRM-JD-YCTD-STATUS` | 400 | Bind / preview JD không Hiệu lực (Ngừng/Nháp/retired) | **1d** · BR-BP-JD-01 |
| `HRM-JD-YCTD-REQUIRED` | 400 | Thiếu `job_template_id`/`job_description_id` khi vị trí bắt buộc mô tả chuẩn | **1b** · **#2** · BR-YCTD-JD-REF-01 |
| `HRM-JD-YCTD-NOT-FOUND` | 404 | Template id không tồn tại trong scope | **1c/1d** |
| `HRM-JD-YCTD-EMPTY` | 400 *(optional FE-only)* | Client submit khi picker empty — BE dùng `REQUIRED` là đủ | **1b** |
| scope | 403/409 | `companyId` mismatch | U19 |
| Existing headcount / ĐB | 4xx | Giữ F-REC-YCTD-* | REC-02 #2+# |

**Empty library:** list bindable **200 + `items=[]`** — không 404; mutate thiếu JD → `HRM-JD-YCTD-REQUIRED`.

---

## 5. Preview ≠ persist · snapshot (locked)

```text
job_description_templates.values_json     = SoT dynamic (Thư viện)
job_description_templates.job_description = canonical / bridge text
job_requisitions.job_template_id          = soft FK (id only)  ← ONE physical
job_requisitions.job_description          = optional short snapshot on YCTD
job_requisitions.requirements             = optional requirements snapshot
```

| Rule | Expected |
|------|----------|
| Create/patch with bindable JD | Persist FK + optional snapshot texts |
| **FORBIDDEN** | Persist full `values_json` / `layout_snapshot_json` on YCTD as live SoT |
| User edits YCTD snapshot texts | UPDATE YCTD only — no write-back to templates |
| Template `values_json` changes later | YCTD FK + snapshot remain; no auto-sync live form onto YCTD |

---

## 6. FORBIDDEN (API / SoT)

| Forbidden | Why |
|-----------|-----|
| Dual-write JD content → `job_postings` / Lane B | ARCH-02 · REC-03 OUT GĐ1 |
| Unlock **F-REC-CAMPAIGN-*** / FR-UC-BP-REC-03 as JD SoT MVP | Client API HOLD GĐ2 · meeting R1 |
| Invent second physical FK column | Alias only (DB-01) |
| Empty library → 404 | Must 200[] |
| FE-only status gate (trust stale picker) | BE STATUS on preview + create/patch |
| Claim `jd_dynamic_done` / product GO | Honesty |
| Seed YCTD↔JD links for UAT evidence | U65 |

---

## 7. Matrix FR ↔ F-id ↔ bước SRS ↔ AC

| FR | Diễn biến | F-id | Enterprise overlay | AC |
|----|-----------|------|--------------------|-----|
| REC-02 / 02b | **1a** | F-YCTD-JD-01 | catalog bindable | AC-YCTD-JD-02 |
| REC-02 / 02b | **1b** | F-YCTD-JD-01 empty + F-YCTD-JD-03 REQUIRED | F-REC-YCTD-01/02 delta | AC-YCTD-JD-02 |
| REC-02 / 02b | **1c** | F-YCTD-JD-02 + F-YCTD-JD-03 | F-REC-YCTD-01/02 | AC-YCTD-JD-01/04 |
| REC-02 / 02b | **1d** | F-YCTD-JD-02/03 STATUS | same | AC-YCTD-JD-03 |
| REC-02 / 02b | Thành công / F5 | F-YCTD-JD-05 | list/get YCTD | AC-YCTD-JD-01 |
| REC-03 | — | **OUT** | F-REC-CAMPAIGN HOLD | AC-YCTD-JD-05 |

Journey: `J-HRM-JD-YCTD-01` — browser U65.

---

## 8. Client API_DESIGN pointer (no wipe)

| Artifact | Action |
|----------|--------|
| `API_DESIGN_HRM_ENTERPRISE.md` F-REC-YCTD-01/02 | DOC-DELTA: ADD JD bind + alias + errors + SRS **1a–1d**; keep plan_cell / out_of_plan stubs |
| F-REC-YCTD-03/04 | **KEEP** — no JD SoT change |
| F-REC-CAMPAIGN-* | Remain **HOLD GĐ2** |
| §7.3 matrix | UPGRADE F-REC-YCTD-01/02 row → cite soft FK + error codes |
| Footer DOC-DELTA | This work_item — SoT file cite |

---

## 9. Cascade & Dev HOLD

```text
SRS v0.10 (DONE)
  → TechSpec PO-HRM-JD-YCTD-REF-TECHSPEC-01 (DONE)
  → DB_DESIGN PO-HRM-JD-YCTD-REF-DB-01 (CONFIRMED)
  → API_DESIGN this file (CONFIRMED)  ← done
  → QA plan PO-HRM-JD-YCTD-REF-QA-PLAN-01
  → Dev-FE / Dev-BE (bindable-list + status-gate + alias DTO only)
```

| Gate | Rule |
|------|------|
| **Dev HOLD lifts** | **Chỉ khi** `PO-HRM-JD-YCTD-REF-DB-01` **và** `PO-HRM-JD-YCTD-REF-API-01` đều **CONFIRMED** trên bus |
| Status sau wave này | **Cả hai CONFIRMED** → PM **được** unlock Dev cho **bindable-list / status-gate / alias DTO** deltas only — **không** mở campaign / `job_postings` / full JD-dynamic remaster |
| **Cấm migrate** trong wave docs này | Logical confirm only (migrate = Dev-BE sau unlock) |
| **must_keep** | ONE physical `job_template_id` soft FK |

---

## 10. Risks

| Risk | Mitigation |
|------|------------|
| Dual column invent in Nest DTO | Alias map §2 + schema review |
| Preview mistaken for dynamic SoT | §5 + QA AC-04/05 |
| Empty library bypass | 200[] + BE REQUIRED |
| Stale picker Ngừng | BE STATUS on preview + create |
| Campaign creep | §6 FORBIDDEN · F-REC-CAMPAIGN HOLD |

---

## 11. Validation / acceptance (governance)

| Check | Pass |
|-------|------|
| Every Diễn biến **1a–1d** mapped ≥1 F-id F.1 | §3 |
| F-REC-YCTD-01/02 overlay without wipe | §3.3 · §8 |
| Alias ONE physical | §2 |
| Error codes STATUS/REQUIRED/NOT-FOUND + empty 200[] | §4 |
| Preview ≠ full values_json on YCTD | §5 |
| REC-03 / job_postings OUT | §6 |
| Dev HOLD rule explicit | §9 |
| Evidence | `docs/qa/evidence/po-hrm-jd-yctd-ref-api-01.md` |

---

## Completion

| Field | Value |
|-------|--------|
| completion_report | API delta CONFIRMED: F-YCTD-JD-01..05 F.1 overlay F-REC-YCTD-01/02 (+ picker/preview/list); DTO alias ONE physical; errors locked; preview ≠ values_json; FORBIDDEN job_postings/REC-03 GĐ1. Client DOC-DELTA. Cascade DB+API complete → Dev HOLD lifts for narrow bindable/status deltas. No apps/**. |
| next_owner | **pm** → **qa** (`PO-HRM-JD-YCTD-REF-QA-PLAN-01`) **hoặc** unlock Dev sau QA plan |
| evidence_path | `docs/qa/evidence/po-hrm-jd-yctd-ref-api-01.md` |
| ack_status | **PASS_TO_PM** |
