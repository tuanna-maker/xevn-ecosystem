# PO-HRM-JD-YCTD-REF-DB-01 — DB_DESIGN delta · YCTD ↔ JD soft FK (ONE physical)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-YCTD-REF-DB-01` |
| **lane** | governance · ba-data |
| **change_mode** | ADD · **NO CODE** `apps/**` · **no migrate** |
| **Date** | 2026-08-06 |
| **Status** | **CONFIRMED DB delta (logical)** — cascade **API_DESIGN** còn mở; **cấm Dev** đến khi API-01 confirm |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **v0.10** · **FR-UC-BP-REC-02** · **02b** Diễn biến **1a–1d** |
| **ref_techspec** | [`PO-HRM-JD-YCTD-REF-TECHSPEC-01.md`](./PO-HRM-JD-YCTD-REF-TECHSPEC-01.md) **§5** |
| **ref_arch** | [`PO-HRM-JD-DYNAMIC-ARCH-02.md`](./PO-HRM-JD-DYNAMIC-ARCH-02.md) **§3.5** · **§3.7** |
| **Client pointer** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §2.3 + DOC-DELTA (cite — **no wipe** stubs) |
| **Honesty** | Không claim `jd_dynamic_done` / remaster / face_live / product GO · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Objective

Confirm **một** soft FK vật lý gắn YCTD → Thư viện JD:

| Plane | Table.column | Role |
|-------|--------------|------|
| **Physical (AS-IS Nest SoT)** | `job_requisitions.job_template_id` | **ONE** soft FK column — must_keep |
| **Logical (enterprise DB_DESIGN)** | `rec_recruitment_request.job_description_id` | **Alias only** — cùng id; **cấm** invent cột physical song song |

Consumer MVP = **YCTD** (REC-02/02b). **Không** mở Campaign / `job_postings` làm SoT mô tả.

---

## 1. Physical soft FK (locked)

### 1.1 Column contract

| Attribute | Value |
|-----------|--------|
| Table | `public.job_requisitions` |
| Column | `job_template_id` |
| Type (AS-IS) | TEXT / UUID-as-text (Nest DTO `@IsString` MaxLength 64) |
| Nullability | YES at DB; **business-required** when BR-YCTD-JD-REF-01 (vị trí có mô tả chuẩn) — enforced API |
| FK style | **Soft** — app-layer resolve to `job_description_templates.id` (logical `rec_job_description`) |
| ON DELETE | **NONE** — **FORBIDDEN** `ON DELETE CASCADE` that drops YCTD when JD retires |
| Scope | Same `company_id` resolver as list/get templates + requisitions (U19 `scope_parity`) |

### 1.2 Logical alias (enterprise)

| Logical | Physical | Rule |
|---------|----------|------|
| `rec_recruitment_request.job_description_id` | `job_requisitions.job_template_id` | **Same value** in API DTO map; serializers may expose either name |
| `rec_job_description.id` | `job_description_templates.id` | JD master SoT (ARCH-02 §3.7) |

**FORBIDDEN invent:**

| Invent | Why reject |
|--------|------------|
| Second physical column `job_description_id` on `job_requisitions` next to `job_template_id` | Dual SoT / dual write risk (TechSpec §5.2) |
| Hard FK + CASCADE from templates → requisitions | Retire JD must **not** delete YCTD history (BR-BP-JD-01) |
| `values_json` / `layout_snapshot_json` on `job_requisitions` as live JD SoT | Preview lock — dynamic form SoT stays on templates |

---

## 2. Optional YCTD snapshot text (one-way ≠ values_json)

| Physical col (YCTD / requisition) | Source at bind | Mutability after bind | SoT? |
|-----------------------------------|----------------|----------------------|------|
| `job_description` (TEXT, optional) | One-way copy from template canonical `job_description` / preview `short_description` (may be user-edited short) | Editable on YCTD draft **without** writing back to Thư viện | **Snapshot on YCTD only** |
| `requirements` (TEXT, optional) | One-way copy from template `requirements` / preview | Same | **Snapshot on YCTD only** |

### 2.1 Semantics (locked)

```text
job_description_templates.values_json     = SoT dynamic field values (Thư viện JD)
job_description_templates.job_description = canonical / bridge text for list+legacy
job_requisitions.job_template_id          = soft FK pointer (id only)
job_requisitions.job_description          = optional short snapshot on YCTD row
job_requisitions.requirements             = optional requirements snapshot on YCTD row
```

| Rule ID | Condition | Expected |
|---------|-----------|----------|
| **DV-YCTD-JD-01** | Create/patch YCTD with bindable JD | Persist `job_template_id`; optional snapshot texts; **do not** persist full `values_json` on YCTD |
| **DV-YCTD-JD-02** | User edits YCTD `job_description` / `requirements` | UPDATE YCTD row only — **no** UPDATE templates / `values_json` |
| **DV-YCTD-JD-03** | Template `values_json` changes after YCTD saved | YCTD soft FK + snapshot remain; history readable; **no** auto-sync live form SoT onto YCTD |
| **DV-YCTD-JD-04** | Read YCTD display | Prefer join `jd_code`/`jd_title` via soft FK; body text from YCTD snapshot cols if present |

**BR map:** BR-YCTD-JD-REF-02 · TechSpec §2.2 preview contract · ARCH-02 F-YCTD-JD.

---

## 3. Status / bindable semantics

| JD status (logical) | Physical bridge | Bind **new** YCTD? | Existing YCTD history |
|---------------------|-----------------|--------------------|------------------------|
| Nháp / draft | `is_active=false` **or** status≠active | **No** → `HRM-JD-YCTD-STATUS` | N/A (not bindable) |
| Hiệu lực / active | `is_active=true` and not retired/archived | **Yes** | Yes |
| Ngừng / retired | `is_active=false` / retired / `archived_at` set | **No** → `HRM-JD-YCTD-STATUS` | **Still visible** via soft FK + snapshot; **no CASCADE delete** |

| Action on JD | Effect on YCTD rows |
|--------------|---------------------|
| Soft-retire / Ngừng | History YCTD **giữ** `job_template_id`; list/get still show ref (F-YCTD-JD-05) |
| Hard-delete template | **FORBIDDEN** while any YCTD references id (or soft-archive only) |
| Re-bind on draft YCTD | Allowed to another **Hiệu lực** JD only (F-YCTD-JD-04) |

**Picker query (data view):** bindable set = templates in scope ∩ Hiệu lực — empty set is **valid** (200 `[]`), not a schema error.

---

## 4. Lifecycle — YCTD × JD ref

| Entity | Legal transitions (JD ref aspect) | Invalid |
|--------|-----------------------------------|---------|
| YCTD draft/rejected | set / change / clear* `job_template_id` to bindable JD | Bind draft/retired JD |
| YCTD submitted+ (GĐ1 default) | keep FK; re-bind policy = API-01 (default: lock if approved) | Silent rebind Ngừng |
| JD active → retired | templates status only | DELETE YCTD rows / NULL FK forced |

\*Clear only if BR-YCTD-JD-REF-01 does not require JD for that position — else `HRM-JD-YCTD-REQUIRED`.

---

## 5. FORBIDDEN (DB / SoT)

| Forbidden | Why |
|-----------|-----|
| `job_postings` / `JobPostingsTab` / Lane B as JD SoT for YCTD bind | ARCH-02 FORBIDDEN · FR-UC-BP-REC-03 OUT GĐ1 |
| Treat `rec_campaign` / `rec_job_post*` as required MVP for JD ref | Client DB §2.8 **GĐ2 optional** only |
| Dual physical FK (`job_template_id` + `job_description_id` columns) | Alias only |
| `ON DELETE CASCADE` template → requisition | History BR |
| YCTD row owns live `values_json` SoT | Preview / BR-YCTD-JD-REF-02 |
| Seed to invent YCTD↔JD links for UAT evidence | U65 |

---

## 6. Validation matrix (DB-oriented)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **DV-YCTD-JD-10** | INSERT YCTD thiếu `job_template_id` khi vị trí bắt buộc JD | BR-YCTD-JD-REF-01 | 400 `HRM-JD-YCTD-REQUIRED` |
| **DV-YCTD-JD-11** | Bind id ngoài scope / không tồn tại | soft FK resolve | 404 `HRM-JD-YCTD-NOT-FOUND` |
| **DV-YCTD-JD-12** | Bind JD không Hiệu lực | status gate | 400 `HRM-JD-YCTD-STATUS` |
| **DV-YCTD-JD-13** | Retire JD | soft status on template | YCTD rows untouched; history readable |
| **DV-YCTD-JD-14** | List templates bindable empty | query filter | 200 `items=[]` (not 404) |
| **DV-YCTD-JD-15** | Dual column invent in migrate | schema review | **FAIL** review |
| **DV-YCTD-JD-16** | Write JD values into `job_postings` from YCTD bind | SoT boundary | **FORBIDDEN** |
| **DV-YCTD-JD-17** | list YCTD id → get-by-id | `scope_parity` same resolver | 200 or both out-of-scope 404 |

---

## 7. Data interaction (CRUD / transition — JD ref slice)

| Entity / col | C | R | U | D/Archive | Notes |
|--------------|---|---|---|-----------|-------|
| `job_template_id` | Set on create if BR | Join display | Re-bind draft only | Never CASCADE from JD | Soft FK |
| Snapshot `job_description`/`requirements` | Optional copy | Read on YCTD | Edit YCTD only | Soft with YCTD | ≠ template SoT |
| `job_description_templates` | Thư viện CRUD | Picker + preview | Status retire | Soft archive | YCTD consumer |

---

## 8. Traceability

| BRD/SRS | API (next wave) | DB | FE | Test |
|---------|-----------------|----|----|------|
| FR-UC-BP-REC-02 **1a** | F-YCTD-JD-01 | templates Hiệu lực filter | Picker | AC-YCTD-JD-02 |
| REC-02 **1b** | F-YCTD-JD-01 empty + F-YCTD-JD-03 REQUIRED | no invent empty row | Empty + CTA | AC-YCTD-JD-02 |
| REC-02 **1c** | F-YCTD-JD-02/03 | soft FK + optional snapshot | Preview + Lưu | AC-YCTD-JD-01/04 |
| REC-02 **1d** | STATUS | no bind retired | Error FE | AC-YCTD-JD-03 |
| Thành công / F5 | F-YCTD-JD-05 | join/display | List + F5 | AC-YCTD-JD-01 |
| REC-03 / campaign | **OUT** | §2.8 GĐ2 only | OUT | AC-YCTD-JD-05 |
| Journey | — | — | — | `J-HRM-JD-YCTD-01` (U65 browser) |

**scope_parity:** list `job_requisitions` / get-by-id must use same scope as `job_description_templates` list/get when resolving soft FK (group CEO `main` rollup — flag defect if list shows id and detail 404).

---

## 9. Client DB_DESIGN pointer (no wipe)

| Artifact | Action |
|----------|--------|
| `DB_DESIGN_HRM_ENTERPRISE.md` §2.3 | DOC-DELTA: `job_description_id` = **logical alias** of physical `job_template_id`; ADD note soft FK + snapshot cols; keep existing column row |
| §2.8 Campaign / job_post | Remain **GĐ2 optional** — not JD SoT for YCTD |
| §6 Validation | ADD DV-YCTD-JD-10..17 pointers (or cite this file) |
| §8 Forbidden | ADD dual physical FK + job_postings JD SoT + CASCADE |

---

## 10. Cascade & Dev HOLD

```text
SRS v0.10 (DONE)
  → TechSpec PO-HRM-JD-YCTD-REF-TECHSPEC-01 (DONE)
  → DB_DESIGN this file (DONE ba-data) CONFIRM
  → API_DESIGN PO-HRM-JD-YCTD-REF-API-01 (sa) CONFIRM  ← next
  → QA plan → Dev-FE/BE
```

| Gate | Rule |
|------|------|
| **Cấm Dev `apps/**`** | Until **this DB-01 + API-01** both confirmed on bus |
| **Cấm migrate** this wave | Logical confirm only |
| **must_keep** | ONE physical `job_template_id` soft FK |

---

## 11. Risks

| Risk | Mitigation |
|------|------------|
| FE/API invent second column | Schema review DV-YCTD-JD-15; SA API maps alias only |
| Snapshot mistaken for dynamic SoT | §2 semantics + QA AC-04/05 |
| CASCADE migrate habit | Explicit FORBIDDEN §5 |
| Campaign tables treated as MVP | §2.8 GĐ2 + REC-03 OUT |

---

## Completion

| Field | Value |
|-------|--------|
| completion_report | DB delta CONFIRMED: ONE physical soft FK `job_requisitions.job_template_id` ↔ logical `job_description_id` (alias); snapshot text one-way; status/bindable table; FORBIDDEN dual FK / CASCADE / job_postings SoT / REC-03 GĐ1. Client DOC-DELTA pointer. No apps/**. |
| next_owner | **sa** |
| next_dispatch | `PO-HRM-JD-YCTD-REF-API-01` |
| evidence_path | `docs/qa/evidence/po-hrm-jd-yctd-ref-db-01.md` |
| ack_status | **PASS_TO_PM** |
