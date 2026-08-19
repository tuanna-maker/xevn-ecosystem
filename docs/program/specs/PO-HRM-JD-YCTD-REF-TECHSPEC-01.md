# PO-HRM-JD-YCTD-REF-TECHSPEC-01 — TechSpec delta · F-YCTD-JD ↔ SRS Diễn biến 1a–1d

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-YCTD-REF-TECHSPEC-01` |
| **lane** | governance · sa |
| **change_mode** | ADD · **NO CODE** `apps/**` |
| **Date** | 2026-08-06 |
| **Status** | **DRAFT TechSpec depth** — cascade **DB_DESIGN → API_DESIGN** còn mở; **cấm Dev** đến khi cả hai confirm |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **v0.10** · **FR-UC-BP-REC-02** · **02b** Diễn biến **1a–1d** · Thành công FE |
| **ref_spec** | [`PO-HRM-JD-YCTD-REF-SPEC-01.md`](./PO-HRM-JD-YCTD-REF-SPEC-01.md) |
| **ref_arch** | [`PO-HRM-JD-DYNAMIC-ARCH-02.md`](./PO-HRM-JD-DYNAMIC-ARCH-02.md) **F-YCTD-JD** · §3.5 soft FK · §2.12 `HRM-JD-YCTD-STATUS` · FORBIDDEN `job_postings` dual-write |
| **ref_ba_docs** | [`po-hrm-jd-yctd-ref-ba-docs-01.md`](../../qa/evidence/po-hrm-jd-yctd-ref-ba-docs-01.md) |
| **Client pointer** | [`TECHSPEC_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md) DOC-DELTA (cite only — no wipe stubs) |
| **Honesty** | Không claim `jd_dynamic_done` / remaster / face_live / product GO · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Context & objective

**Business intent (sponsor):** khi tạo nhu cầu tuyển (YCTD), mô tả công việc tham chiếu **Thư viện JD** — picker Hiệu lực, empty rõ, chặn Ngừng, preview trước lưu, FE sau 2xx còn mã JD.

**Architecture truth (locked):**

| Lock | Rule |
|------|------|
| Consumer MVP | **YCTD** — không phải tin đăng / `JobPostingsTab` |
| Soft FK | Physical `job_requisitions.job_template_id` · Logical alias `rec_recruitment_request.job_description_id` |
| Status gate | Chỉ JD **Hiệu lực** (`active` / `is_active=true`) bind được cho YCTD **mới** |
| Preview | Title + mô tả ngắn từ **template snapshot/canonical** — **không** biến YCTD thành SoT live full `values_json` |
| Snapshot text | Optional one-way copy `job_description` / `requirements` trên hàng YCTD (BR-YCTD-JD-REF-02) — chỉnh không đè Thư viện |
| FORBIDDEN | Dual-write JD → `job_postings` · mở **FR-UC-BP-REC-03** / campaign GĐ2 · hard-delete JD khi YCTD history |
| Dev gate | **DB_DESIGN delta confirm + API_DESIGN delta confirm** trước mọi `apps/**` |

Wave này **deepen** stub `F-YCTD-JD` (ARCH-02 một dòng) thành API F.1 map **1a–1d** — **không** rewrite ARCH-02 / không wipe client TechSpec stubs.

---

## 1. Capability map — F-YCTD-JD family

**Prefix physical (AS-IS Nest):** `/api/hrm/recruitment`  
**Prefix logical (enterprise API_DESIGN):** `/api/hrm/rec`  
**Envelope:** `{ code, message, data }` — không invent shape song song.  
**Scope:** mọi list / get / mutate dùng **cùng** `resolveHrmListScope` + `company_id` + `assertResourceInHrmScope` (U19).

| Cap | F-id | METHOD / path (physical AS-IS prefer) | Logical alias (enterprise) | SRS bước |
|-----|------|----------------------------------------|----------------------------|----------|
| List JD bindable (Hiệu lực) | **F-YCTD-JD-01** | `GET /recruitment/job-templates?company_id=&bindable=true` *(extend F-JD-01)* | same catalog | **1a** · **1b** |
| Preview JD for YCTD picker | **F-YCTD-JD-02** | `GET /recruitment/job-templates/:id?company_id=&preview=yctd` *(thin of F-JD-03)* | `GET …/job-descriptions/:id` preview | **1c** (preview) |
| Create YCTD + bind JD | **F-YCTD-JD-03** | `POST /recruitment/requisitions` *(AS-IS)* | `F-REC-YCTD-01` / `02` | **1c** persist · **1d** · **#2** |
| Update YCTD JD bind (draft) | **F-YCTD-JD-04** | `PATCH /recruitment/requisitions/:id` *(AS-IS extend)* | patch YCTD | **1c/1d** re-bind · **#4** giữ mã |
| List/get YCTD (display JD ref) | **F-YCTD-JD-05** | `GET /recruitment/requisitions` · `GET …/:id` | `GET recruitment-requests` | **Thành công** · AC FE F5 |

**Reuse — không invent SoT mới:**

- Master JD CRUD vẫn **F-JD-01..04** / `job_description_templates`.  
- Enterprise stub **F-REC-YCTD-01..04** được **delta** (API_DESIGN wave) để bắt buộc `job_description_id` ↔ `job_template_id` + status gate — không tạo entity Campaign.

---

## 2. API_DESIGN F.1 — F-YCTD-JD-01..05

### 2.1 F-YCTD-JD-01 — List JD bindable (picker)

| | |
|--|--|
| **Mục đích** | Cung cấp danh sách JD **Hiệu lực** đúng pháp nhân cho picker trên form YCTD (không liệt kê Nháp/Ngừng). |
| **Nghiệp vụ xử lý** | (1) Resolve scope JWT + `company_id`. (2) Query templates cùng scope với F-JD-01. (3) Filter **bindable** = status Hiệu lực (`is_active=true` **và** không `retired`/`archived`). (4) Nếu `items=[]` → **200 empty** (không 500) — FE hiển thị empty + CTA Thư viện (SRS **1b**). (5) **FORBIDDEN** đọc từ `job_postings`. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-02** Diễn biến **#1a** (mở danh sách — chỉ Hiệu lực) · **#1b** (thư viện trống) · **FR-UC-BP-REC-02b** cùng **1a–1b** · spine **FR-UC-BP-REC-00** Diễn biến #3 · **FR-UC-BP-REC-00c** #6 · BR-BP-JD-01. |
| **Request** | Query: `company_id` (required); `bindable=true` (required for YCTD picker path) hoặc server default when `for=yctd`. Optional: `q` search title/code. |
| **Response → DB** | `items[]` ← `job_description_templates` (display-ready): `id`, `code`, `title`, `position_code`, `position_name?`, `is_active`/`status`, **preview fields** optional thin: `short_description` (truncate `job_description` hoặc bridge từ `values_json.title`/`responsibilities` — **không** trả full nested dynamic form). |
| **Lỗi nghiệp vụ** | `403`/`409` scope · empty `items=[]` **hợp lệ** (AC-YCTD-JD-02) — **không** dùng 404 cho empty library. |

---

### 2.2 F-YCTD-JD-02 — Preview JD (title + short description)

| | |
|--|--|
| **Mục đích** | Sau khi user chọn một JD trên picker, trả **xem trước** tiêu đề + mô tả ngắn để xác nhận trước Gửi/Lưu — không bắt nhập lại toàn bộ trường động thư viện. |
| **Nghiệp vụ xử lý** | (1) GET template by id **cùng scope_parity list** (F-JD-03). (2) Reject nếu id ngoài scope → 404. (3) Nếu JD **không** Hiệu lực → **400** `HRM-JD-YCTD-STATUS` (SRS **1d**) — picker không được chỉ dựa FE. (4) Compose preview: `title`, `code`, `short_description` (canonical `job_description` truncated **hoặc** snapshot bridge text) + optional `requirements_preview`. (5) **Không** bắt client lưu full `values_json` lên YCTD; **không** trả layout canvas đầy đủ trừ khi FE Thư viện (out of YCTD form). |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-02** Diễn biến **#1c** (xem trước mô tả) · **#1d** (JD Ngừng) · BR-YCTD-JD-REF-02 · AC-YCTD-JD-03/04. |
| **Request** | Path `:id` + `company_id`; query `preview=yctd` (optional flag — same handler as F-JD-03 may branch). |
| **Response → DB** | Read `job_description_templates` cols: `id`, `code`, `title`, `job_description`, `requirements`, `is_active`/`status`. **Out of response SoT for YCTD row:** full `values_json` / `layout_snapshot_json` as mutable YCTD payload. |
| **Lỗi nghiệp vụ** | `HRM-JD-YCTD-STATUS` 400 — JD Ngừng/Nháp · `404` out-of-scope · scope 403/409. |

**Preview contract (locked):**

```text
YctdJdPreview = {
  job_template_id: string,   // = logical job_description_id
  code: string,
  title: string,
  short_description: string, // ≤ N chars; from canonical text / bridge — NOT live SoT of values_json
  requirements_preview?: string,
  status: 'active'           // bindable only; non-active → error before preview success
}
```

---

### 2.3 F-YCTD-JD-03 — Create YCTD with JD bind (status gate)

| | |
|--|--|
| **Mục đích** | Tạo YCTD gắn soft FK JD Hiệu lực; từ chối khi thiếu tham chiếu bắt buộc / JD Ngừng / thư viện bắt buộc mà không chọn. |
| **Nghiệp vụ xử lý** | (1) Scope assert. (2) Validate headcount / trong-ngoài ĐB theo F-REC-YCTD-01/02 (giữ nguyên). (3) **BR-YCTD-JD-REF-01:** khi vị trí có mô tả chuẩn → `job_template_id` **required**; thiếu → `HRM-JD-YCTD-REQUIRED` 400 — giữ form (SRS **1b**/#2). (4) Load template by id **same scope**; nếu không Hiệu lực → `HRM-JD-YCTD-STATUS` 400 (SRS **1d**). (5) INSERT YCTD với `job_template_id` (physical) = soft FK; optional one-way snapshot text cols `job_description`/`requirements` từ preview (client may send edited short copy) — **không** persist full `values_json` lên YCTD. (6) **FORBIDDEN** insert/update `job_postings` as JD source. (7) Return 201 display-ready gồm mã/tiêu đề JD. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-02** **#1c** (gắn mã) · **#1d** · **#2** (Gửi duyệt + JD bắt buộc) · **Thành công** · **FR-UC-BP-REC-02b** cùng · BR-BP-JD-01 · BR-YCTD-JD-REF-01/02 · AC-YCTD-JD-01/03/05. |
| **Request → DB** | Physical: `CreateJobRequisitionDto` → `job_requisitions` (`company_id`, `title`, `department`, `employment_type`, `headcount`, `job_template_id`, optional `job_description`, `requirements`). Logical: `job_description_id` ↔ same id; `qty`↔`headcount`; `headcount_mode` in/out. |
| **Response → DB** | 201 + row: `id`, `status`, `job_template_id`, `jd_code?`, `jd_title?` (join/denorm display-ready), snapshot text if stored. Code stub: keep existing requisition 2xx codes; ADD `HRM-JD-YCTD-201` optional alias. |
| **Lỗi nghiệp vụ** | `HRM-JD-YCTD-REQUIRED` 400 — thiếu tham chiếu khi bắt buộc · `HRM-JD-YCTD-STATUS` 400 — bind Ngừng/Nháp · `HRM-JD-YCTD-NOT-FOUND` 404 — id không tồn tại trong scope · scope 403/409 · headcount / ĐB errors existing. |

---

### 2.4 F-YCTD-JD-04 — Re-bind / clear JD on draft YCTD

| | |
|--|--|
| **Mục đích** | Cho phép đổi JD trên bản nháp / sau từ chối (SRS **#4** giữ mã nếu đã chọn; cho re-bind Hiệu lực). |
| **Nghiệp vụ xử lý** | Same status gate as create khi `job_template_id` đổi; reject bind Ngừng; không orphan hard FK; soft FK only. Approved/fulfilled policy: **không** đổi JD nếu BR khóa (API_DESIGN wave chốt) — default GĐ1: chỉ draft/rejected. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-02** **#4** · **1c/1d** · BR-BP-JD-01. |
| **Request → DB** | PATCH `job_template_id` (+ optional snapshot text). |
| **Lỗi** | Same taxonomy as §2.3 · `409` sai trạng thái YCTD nếu khóa. |

---

### 2.5 F-YCTD-JD-05 — List/Get YCTD with JD reference (FE sau 2xx / F5)

| | |
|--|--|
| **Mục đích** | Trả YCTD kèm tham chiếu JD display-ready để list cập nhật sau Lưu và F5 còn mã/tiêu đề (SRS Thành công · AC-YCTD-JD-01). |
| **Nghiệp vụ xử lý** | List/get **scope_parity**; LEFT JOIN hoặc denorm `jd_title`/`jd_code` từ soft FK; YCTD lịch sử vẫn hiện JD đã gắn dù template sau đó **Ngừng** (BR-BP-JD-01 history). |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-02** **Thành công** · AC-YCTD-JD-01 · AC-YCTD-JD-06 cross-nav. |
| **Response → DB** | `job_requisitions.*` + `job_template_id` + display `jd_title`/`jd_code` (from templates at read time **or** snapshot title on row — prefer join for code/title; text body = YCTD snapshot cols). |
| **Lỗi** | 404 out-of-scope get-by-id · không “nuốt” 500 thành empty list. |

---

## 3. Sequence — YCTD bind JD (TechSpec)

```mermaid
sequenceDiagram
  autonumber
  actor TP as TruongBoPhan
  participant FE as Form_YCTD
  participant API as hrm_api
  participant DB as PostgreSQL

  TP->>FE: Mo tao YCTD
  FE->>API: F-YCTD-JD-01 GET job-templates bindable
  API->>DB: SELECT templates Hieu luc + scope
  alt Thu vien trong
    API-->>FE: 200 items=[]
    FE-->>TP: Empty + CTA Thu vien JD — khong cho Luu thieu JD
  else Co JD Hieu luc
    API-->>FE: items display-ready
    TP->>FE: Chon JD
    FE->>API: F-YCTD-JD-02 GET preview
    alt JD Ngung / khong Hieu luc
      API-->>FE: 400 HRM-JD-YCTD-STATUS
      FE-->>TP: Chan — yeu cau JD Hieu luc
    else Hop le
      API-->>FE: title + short_description
      FE-->>TP: Preview
      TP->>FE: Luu / Gui duyet
      FE->>API: F-YCTD-JD-03 POST requisitions + job_template_id
      API->>DB: INSERT job_requisitions soft FK
      API-->>FE: 201 + jd ref
      FE-->>TP: List cap nhat; F5 con ma JD
    end
  end
```

---

## 4. Error taxonomy (YCTD↔JD) — locked stubs

| Code | HTTP | When | SRS |
|------|------|------|-----|
| `HRM-JD-YCTD-STATUS` | 400 | Bind / preview JD không Hiệu lực (Ngừng/Nháp/retired) | **1d** · BR-BP-JD-01 |
| `HRM-JD-YCTD-REQUIRED` | 400 | Thiếu `job_template_id` khi vị trí bắt buộc mô tả chuẩn | **1b** · **#2** · BR-YCTD-JD-REF-01 |
| `HRM-JD-YCTD-NOT-FOUND` | 404 | Template id không tồn tại trong scope | **1c/1d** |
| `HRM-JD-YCTD-EMPTY` | 400 *(optional FE-only path)* | Client cố submit khi picker đã biết empty — BE vẫn `REQUIRED` là đủ | **1b** |
| scope | 403/409 | `companyId` mismatch | U19 |
| Existing headcount / ĐB | 4xx | Giữ F-REC-YCTD-* | REC-02 #2+# |

**Empty library:** list **200 + []** — không 404; mutate thiếu JD → `HRM-JD-YCTD-REQUIRED`.

---

## 5. Data contract (pointer — DB_DESIGN wave sở hữu chi tiết)

### 5.1 must_keep

| Physical | Logical alias | Rule |
|----------|---------------|------|
| `job_requisitions.job_template_id` TEXT soft FK | `rec_recruitment_request.job_description_id` | **must_keep** — không invent cột SoT song song; retire JD ≠ DELETE history |
| `job_description_templates` | `rec_job_description` | SoT mô tả; YCTD chỉ tham chiếu |
| Optional YCTD `job_description` / `requirements` text | snapshot ngắn trên YCTD | One-way; **≠** live `values_json` SoT |

### 5.2 FORBIDDEN (DB)

| Forbidden | Why |
|-----------|-----|
| FK cứng ON DELETE CASCADE xóa YCTD khi Ngừng JD | BR history |
| Cột `values_json` trên `job_requisitions` làm SoT động thay thư viện | ARCH preview lock |
| Dual-write / SoT mô tả trên `job_postings` | REC-03 OUT · ARCH FORBIDDEN |
| Second FK `job_description_id` **physical** song song `job_template_id` | Alias only — DB_DESIGN confirm một cột physical |

### 5.3 Status semantics (bindable)

| JD status (logical) | `is_active` (physical bridge) | Bind YCTD mới? | History YCTD cũ |
|---------------------|-------------------------------|----------------|-----------------|
| Nháp / draft | false | **No** | N/A |
| Hiệu lực / active | true | **Yes** | Yes |
| Ngừng / retired | false | **No** (`HRM-JD-YCTD-STATUS`) | Vẫn xem được |

---

## 6. FE–BE boundary (OS 28)

| FE | BE |
|----|-----|
| Picker options từ F-YCTD-JD-01 only (Hiệu lực) | Authoritative status gate on create/patch |
| Preview bind F-YCTD-JD-02 (title + short) | Reject Ngừng even if FE stale cache |
| Submit `job_template_id` + optional edited short text | Persist soft FK + optional snapshot cols — **not** full dynamic aggregate invent on FE |
| Empty → CTA Thư viện; disable Lưu khi bắt buộc | `HRM-JD-YCTD-REQUIRED` |
| **Cấm** chọn JD từ tin đăng / job_postings UI | **Cấm** dual-write |

---

## 7. Matrix FR ↔ F-id ↔ bước SRS

| FR | Diễn biến | F-id | AC |
|----|-----------|------|-----|
| REC-02 / 02b | **1a** | F-YCTD-JD-01 | AC-YCTD-JD-02 (non-empty path) |
| REC-02 / 02b | **1b** | F-YCTD-JD-01 empty + F-YCTD-JD-03 REQUIRED | AC-YCTD-JD-02 |
| REC-02 / 02b | **1c** | F-YCTD-JD-02 + F-YCTD-JD-03 | AC-YCTD-JD-01/04 |
| REC-02 / 02b | **1d** | F-YCTD-JD-02/03 STATUS | AC-YCTD-JD-03 |
| REC-02 / 02b | Thành công / F5 | F-YCTD-JD-05 | AC-YCTD-JD-01 |
| REC-00 / 00c | spine bind | same family | AC-JD-DYN-15 pointer |
| REC-03 | — | **OUT** — no F-REC-CAMPAIGN | AC-YCTD-JD-05 |

Journey đề xuất: `J-HRM-JD-YCTD-01` (SPEC-01) — browser U65.

---

## 8. Client TechSpec / API_DESIGN / DB_DESIGN — DOC-DELTA pointers

| Artifact | Action this wave | Next wave |
|----------|------------------|-----------|
| `TECHSPEC_HRM_ENTERPRISE.md` | ADD DOC-DELTA cite file này + matrix row F-YCTD-JD | — |
| `DB_DESIGN_HRM_ENTERPRISE.md` | **HOLD** chi tiết cột | **`PO-HRM-JD-YCTD-REF-DB-01`** — confirm soft FK alias; không invent dual column |
| `API_DESIGN_HRM_ENTERPRISE.md` | **HOLD** full rewrite F-REC-YCTD-* | **`PO-HRM-JD-YCTD-REF-API-01`** — delta F.1 trên F-REC-YCTD-01/02 + error codes + Diễn biến 1a–1d |
| `PO-HRM-JD-DYNAMIC-ARCH-02.md` | **No wipe** — F-YCTD-JD stub vẫn valid; file này = deepen | Optional APPEND one-liner cite |

---

## 9. Cascade & Dev HOLD (explicit)

```text
SRS v0.10 (DONE ba-docs)
  → TechSpec this file (DONE sa) 
  → DB_DESIGN delta PO-HRM-JD-YCTD-REF-DB-01 (ba-data/sa) CONFIRM
  → API_DESIGN delta PO-HRM-JD-YCTD-REF-API-01 (sa) CONFIRM
  → QA plan PO-HRM-JD-YCTD-REF-QA-PLAN-01
  → Dev-FE PO-HRM-JD-YCTD-REF-FE-01 + Dev-BE PO-HRM-JD-YCTD-REF-BE-01
```

| Gate | Rule |
|------|------|
| **Cấm Dev `apps/**`** | Cho đến khi **DB-01 + API-01** cùng `ack` confirm trên bus |
| **Cấm** claim | `jd_dynamic_done` · remaster · face_live · tin đăng GĐ2 unlocked |
| **must_keep** | soft FK `job_template_id` / logical `job_description_id` |
| **U65** | Nghiệm thu browser; zero-seed |

---

## 10. Options (SA) — path chosen

| Option | Summary | Verdict |
|--------|---------|---------|
| **A** | Deepen F-YCTD-JD as **family 01–05** over AS-IS requisitions + job-templates; logical alias enterprise | **CHOSEN** — preserve AS-IS physical; align SRS 1a–1d |
| **B** | New microservice / new YCTD table SoT | Reject — over-scope |
| **C** | Bind JD via `job_postings` | **FORBIDDEN** — REC-03 OUT |

---

## 11. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Logical `job_description_id` vs physical `job_template_id` dual-column invent | DB-01 **one physical**; alias map only |
| FE snapshot text mistaken for dynamic SoT | Preview contract + BR-YCTD-JD-REF-02; QA AC-04/05 |
| Empty library bypass | 200[] + BE REQUIRED |
| Stale picker shows Ngừng | BE STATUS on preview + create |
| Scope leak get-by-id | scope_parity jest on templates + requisitions |

---

## 12. Validation / acceptance (governance)

| Check | Pass |
|-------|------|
| Every Diễn biến **1a–1d** mapped to ≥1 F-id with F.1 fields | This §2 |
| Error codes for Ngừng + missing ref | §4 |
| Preview ≠ full `values_json` YCTD SoT | §2.2 |
| REC-03 / job_postings OUT | §0 · §5.2 |
| Dev HOLD until DB+API | §9 |
| Evidence | `docs/qa/evidence/po-hrm-jd-yctd-ref-techspec-01.md` |

---

## Completion

| Field | Value |
|-------|--------|
| completion_report | TechSpec delta ADD: F-YCTD-JD-01..05 F.1 map SRS REC-02/02b **1a–1d**; status gate + preview contract; must_keep soft FK; REC-03 OUT; Dev HOLD until DB-01+API-01. No apps/**. |
| next_owner | **ba-data** (DB_DESIGN) rồi **sa** (API_DESIGN) — hoặc sa tuần tự cả hai nếu PM gộp |
| ack_status | **PASS_TO_PM** |
