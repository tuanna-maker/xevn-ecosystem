# BA AC/BR — Loại quyết định / QSĐ open catalog (DEC vertical)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-process |
| **lane** | governance |
| **Date** | 2026-08-07 |
| **Status** | **BA LOCKED (AC/BR)** — chờ peer SA DEC vertical F.1 **CONFIRMED** → ba-data |
| **change_mode** | **ADD** |
| **Peer** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01` (parallel) |
| **Honesty** | `hrm_personnel_uat_ready=false` · `contracts_printable_ready=false` · `payroll_e2e_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` · Platform/Phase1 DONE **false** · U65 zero-seed |
| **Cấm** | `apps/**` · seed · invent personnel/payroll UAT · wipe sealed EMP/ATT/REC · invent closed enum loại QSĐ · claim UC-HRM-27 DONE chỉ vì catalog AC |
| **Align** | [`BA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.1 EMP · BR-PLT-02/04/05/06 · peer **AC-PLT-ATT-01..03** · **AC-PLT-REC-02..04** · **AC-PLT-EMP-02..05** · EMP SA **L-EMP-CAT-06** (QSĐ OUT GĐ1 → **this seat = GĐ1.5**) · Enterprise **FR-UC-BP-CORE-01a** · team **UC-HRM-27** / **BR-DEC-04/05** |

---

## 0. Process objective & actors

### Objective

Khóa **AC/BR implementation-ready** cho **Loại quyết định (QSĐ)** = **open catalog** theo platform Option B (`ICatalogRow`), đồng pattern ATT leave types / REC pipeline stages / EMP document+employment types:

- Settings/CFG: HR **thêm mã thứ N+** (không ceiling starter).
- Consumer form **Quyết định**: picker / FK từ **effective** catalog khi catalog >0 (**BR-PLT-02**).
- Cờ cấu hình **gắn người** (`person_bound` / tương đương) → bắt `employee_id` (**BR-DEC-05** · **BR-BP-DEC-EMP-01**) — **không** hardcode closed set mã loại trong product enum.
- Dual SoT alias **`hr_decision_types`** (storage/write) ↔ **`decision_types`** (family/REF) (**BR-PLT-06** · E1-B alias).
- **must_keep** spine create → duyệt/ký → **hiệu lực** → lịch sử công tác (**FR-UC-BP-CORE-01a** · F-CORE-DEC-02) — wave này **không** redesign approve/WH.

### Actors

| Actor | Role |
|-------|------|
| HCNS / Settings admin | CRUD loại QSĐ (code, label, person_bound, status) |
| HCNS nghiệp vụ | Tạo/sửa/duyệt quyết định — chọn loại từ catalog |
| Group CEO | Publish/pull catalog group (REF) khi XBOS có key — consumer union |
| System | Resolve effective keys · soft-delete · scope parity · WH write-on-effective |
| SA (peer) | F.1 API/DB Option B `hr_decision_types` |
| ba-data | Physical table + VAL after both BA+SA CONFIRMED |
| QA | Browser U65 AC-PLT-DEC-* after FE/BE |

### Scope

| In (this seat) | Out |
|----------------|-----|
| AC-PLT-DEC-01..06 · BR-PLT-02/04/05/06 + BR-PLT-DEC-* | Impl `apps/**` / migration |
| Open keys · retire · consumer assert · dual SoT · person_bound | Invent closed `CHECK (decision_type IN (...))` ceiling |
| U65 FE mutate AC (when Settings + Decisions FE exists) | Seed catalog / seed QSĐ for UF |
| Pointer must_keep create/approve/effective/WH | Redesign WF approve · print QSĐ merge GĐ2 · density AC-DEC-DENSITY reopen as DONE |
| Align L-EMP-CAT-06 residual → DEC vertical | Absorb into EMP DOC/ET seat · wipe sealed EMP/ATT/REC AC |

---

## 1. As-is vs to-be

| | AS-IS | TO-BE (this vertical) |
|---|-------|------------------------|
| Catalog key | Family `decision_types` + storage **`hr_decision_types`** (E1-B alias PASS) | **Keep alias**; deepen **open tenant writer** Option B (peer SA) |
| Starter | Bootstrap `HRD_*` / appointment\|transfer examples | **Bootstrap only** — **not** ceiling (**BR-PLT-05**) |
| Consumer | Picker partial; risk FE/BE fixed list or free-text | When effective **>0**: `decision_type` **must** ∈ catalog (**BR-PLT-02**) |
| Person-bound | BR-DEC-05 / CORE-01a (docs) + F-CORE-DEC-01 | Flag **on catalog row** drives require `employee_id` — **cấm** invent closed enum «chỉ 2 loại gắn người mã cứng» |
| Retire | Soft-delete class elsewhere | Retire hide picker; history QSĐ giữ key (**BR-PLT-04**) |
| Spine QSĐ→WH | EMP E2E / F-CORE-DEC-02 | **must_keep** — catalog wave không cắt |

**AS-IS stamps (không «sửa bằng seed»):** EMP SPEC D6 (employee_id) đã có DOC-DELTA BR-DEC-05 — platform catalog **cung cấp** loại + flag; spine WH owner riêng nếu còn residual runtime.

---

## 2. Platform locks (reuse — không invent mới trái BA-01)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-02** | Effective DEC catalog items **>0** | Consumer create/patch QSĐ SoT = picker/FK key | Reject free-text / unknown key **4xx** deterministic |
| **BR-PLT-04** | Retire / delete loại QSĐ | Soft-delete (`status=retired` + `archived_at`) | History `hr_decisions.decision_type` intact; picker ẩn |
| **BR-PLT-05** | Starter bootstrap (`HRD_*`, appointment, transfer, …) | Upsert examples only | **FORBIDDEN** ceiling / `CHK IN (...)` / API reject N+ vì «không thuộc starter» |
| **BR-PLT-06** | Group REF vs tenant writer | Effective = union REF pulled + tenant DEC rows; tenant wins on key collision (peer ATT/EMP) | **FORBIDDEN** FE hardcode list thay sync; writeKey prefer **`hr_decision_types`** |

---

## 3. DEC-specific business rules

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-DEC-01** | Catalog row `person_bound=true` (hoặc flag tương đương SA khóa) | Create/patch QSĐ → **require** `employee_id` in scope | Thiếu id → **4xx** (`HRM-DEC-EMP-REQUIRED` class) — align **BR-DEC-05** · **BR-BP-DEC-EMP-01** · **AC-DEC-WH-01** |
| **BR-PLT-DEC-02** | Catalog row `person_bound=false` | `employee_id` optional | **Không** bắt id; **không** auto-write WH từ loại này |
| **BR-PLT-DEC-03** | QSĐ `status=effective` **và** loại person_bound **và** có `employee_id` | Write/UPSERT lịch sử công tác by `decision_id` | **must_keep** F-CORE-DEC-02 / **AC-DEC-WH-02..04** — **cấm** catalog wave cắt spine |
| **BR-PLT-DEC-04** | Validate `decision_type_key` / code | Format/slug + UQ `(company_id, lower(code))` only | **FORBIDDEN** reject «not in closed HRD set» |
| **BR-PLT-DEC-05** | Alias family | GET/assert/pull resolve `decision_types` ↔ `hr_decision_types` | Storage/write prefer `hr_decision_types` (E1-B must_keep) |
| **BR-PLT-DEC-06** | Catalog empty (0 effective) | Consumer may allow legacy path per SA (document) | Khi **>0** → BR-PLT-02 bắt buộc; **cấm** mock catalog rows |

**SUPERSEDED / FORBIDDEN:** closed product enum of decision type codes; absorb QSĐ types into EMP DOC/ET seat; hard-delete loại đang còn FK history; claim personnel UAT từ AC catalog alone.

---

## 4. Use-case catalog (process)

| UC ID | Name | Happy | Alternate | Exception |
|-------|------|-------|-----------|-----------|
| **UC-PLT-DEC-01** | Settings — tạo loại QSĐ N+ | Admin tạo mã HR đặt + label + person_bound → **2xx** → list có row → **F5** còn | Sửa label/flag khi active | Code invalid format · UQ conflict · scope 409 |
| **UC-PLT-DEC-02** | Consumer — tạo QSĐ chọn loại mới | Form Quyết định picker có mã mới → Lưu draft **2xx** → F5 còn `decision_type` | Filter tab theo loại | Key ∉ catalog khi >0 → **4xx** |
| **UC-PLT-DEC-03** | Retire loại | Retire → picker ẩn → QSĐ cũ vẫn hiện key | Reactivate (nếu SA cho) | Hard-delete · mất history |
| **UC-PLT-DEC-04** | Person-bound assert | Loại gắn người → thiếu `employee_id` → chặn lưu/hiệu lực | Loại không gắn người → optional id | Orphan id ngoài scope |
| **UC-PLT-DEC-05** | Dual SoT effective | Picker = union REF + tenant | Tenant override cùng key | FE fixed enum · ignore pull |
| **UC-PLT-DEC-06** | Spine hiệu lực → WH | Effective + person_bound → WH có `decision_id` | Draft/pending → **không** ghi WH | Cắt spine / free-text position trên dòng auto |

```mermaid
sequenceDiagram
  autonumber
  actor Admin as HCNS Settings
  actor HR as HCNS Quyết định
  participant Cat as Catalog loại QSĐ
  participant QD as Quyết định
  participant HS as Lịch sử công tác

  Admin->>Cat: Tạo loại mã N+ (open)
  alt Reject ceiling / closed enum
    Cat-->>Admin: FAIL — vi phạm BR-PLT-05
  else 2xx
    Cat-->>Admin: Row active; F5 còn
  end
  HR->>Cat: Load effective picker
  HR->>QD: Tạo QSĐ chọn loại mới
  alt person_bound và thiếu employee_id
    QD-->>HR: Chặn — BR-PLT-DEC-01
  else Loại ∉ catalog khi catalog lớn hơn 0
    QD-->>HR: 4xx UNKNOWN — BR-PLT-02
  else Đủ điều kiện
    QD-->>HR: 2xx draft/saved
  end
  opt Chuyển hiệu lực
    HR->>QD: Hiệu lực
    QD->>HS: UPSERT WH (must_keep)
  end
```

---

## 5. Acceptance criteria — AC-PLT-DEC-* (U65)

> Browser-only khi FE Settings + Decisions tồn tại · zero-seed · FE sau 2xx + F5 · probe/API **không** 🟢 UF.  
> Honesty flags **giữ false**.  
> **Không** wipe **AC-PLT-EMP/ATT/REC** đã seal.

| ID | Đạt khi | Không đạt khi |
|----|---------|----------------|
| **AC-PLT-DEC-01** | Settings/CFG → **Tạo loại quyết định** mã HR đặt (**#N+**, không thuộc starter) → Network **2xx** → list có row → **F5** còn → form **Quyết định** **chọn được** mã mới | Reject «không thuộc HRD_* / 3 loại» · FE hardcode list · mất sau F5 · chỉ API PASS |
| **AC-PLT-DEC-02** | Retire loại → picker **ẩn** mã · QSĐ lịch sử / list cũ **còn** hiển thị `decision_type` key (label fallback OK) | Hard-delete · orphan list crash · history mất key |
| **AC-PLT-DEC-03** | Khi effective catalog **>0**: tạo/sửa QSĐ với `decision_type` **ngoài** catalog → **4xx** deterministic (mã lỗi SA khóa, vd. `HRM-DEC-TYPE-UNKNOWN`) — **không** 2xx free-text SoT | Free-text SoT khi catalog có items · 201 silent |
| **AC-PLT-DEC-04** | Tạo loại với **`person_bound=true`** → trên form QSĐ: chọn loại đó → Lưu/hiệu lực **không** thành công khi thiếu chọn NV trong phạm vi (FE chặn +/hoặc BE **4xx** `HRM-DEC-EMP-REQUIRED` class) | Lưu chỉ `employee_name` chữ · bỏ qua BR-DEC-05 |
| **AC-PLT-DEC-05** | Tạo loại **`person_bound=false`** → QSĐ **không** bắt `employee_id`; **không** sinh WH tự động khi effective | Ép id cho mọi loại · ghi WH cho loại không gắn người |
| **AC-PLT-DEC-06** | Dual SoT: sau pull/sync group (nếu có) + tenant ADD — picker Decisions thấy **effective union**; write path dùng storage **`hr_decision_types`** (alias `decision_types` vẫn resolve) | FE enum cứng · ignore alias · dual master write XBOS+HRM cùng lúc không rule |

### must_keep pointers (không phải AC mới — regression gate)

| Pointer | Pass | Fail |
|---------|------|------|
| **MK-DEC-SPINE-01** | Create → (approve/sign per AS-IS) → **effective** → WH có `decision_id` + `position_key` catalog (**AC-DEC-WH-02..03**) | Catalog wave cắt F-CORE-DEC-02 |
| **MK-DEC-CRUD-01** | UC-HRM-27 list/create/F5 paths không regress (AC-DEC-01/02 class) | Wipe decisions menu · mock empty dishonest |
| **MK-PLT-SEAL-01** | EMP/ATT/REC sealed AC-PLT-* **không** bị reopen/wipe bởi DEC docs | Reopen GWC seal không lý do |

### Journey đề xuất (ba-docs sau CONFIRM)

| Proposed | Maps |
|----------|------|
| `J-HRM-DEC-04` | Settings tạo loại N+ → F5 → Decisions picker (AC-PLT-DEC-01) |
| `J-HRM-DEC-05` | Retire + history (AC-PLT-DEC-02) |
| Reuse | `J-HRM-01` class list→detail NV; CORE-01a WH path |

---

## 6. Validation matrix (for SA / ba-data / QA)

| VAL ID | Input | Rule | Expect | AC / BR |
|--------|-------|------|--------|---------|
| **VAL-DEC-CAT-01** | Create key `hr_custom_dec_09` (N+) | No enum ceiling | **2xx** | AC-PLT-DEC-01 · BR-PLT-05 |
| **VAL-DEC-CAT-02** | Duplicate lower(code) same company | UQ | **4xx** conflict | BR-PLT-DEC-04 |
| **VAL-DEC-CAT-03** | Invalid slug/format | Format only | **4xx** invalid | BR-PLT-DEC-04 |
| **VAL-DEC-CAT-04** | Retire with existing QSĐ rows | Soft-delete | Picker hide; history OK | AC-PLT-DEC-02 · BR-PLT-04 |
| **VAL-DEC-CAT-05** | Hard-delete attempt | Forbidden | **4xx**/405 — no hard delete | BR-PLT-04 |
| **VAL-DEC-CNS-01** | QSĐ create type ∉ effective when catalog >0 | BR-PLT-02 | **4xx** UNKNOWN | AC-PLT-DEC-03 |
| **VAL-DEC-CNS-02** | person_bound + missing employee_id | BR-PLT-DEC-01 | **4xx** EMP-REQUIRED | AC-PLT-DEC-04 |
| **VAL-DEC-CNS-03** | !person_bound + null employee_id | BR-PLT-DEC-02 | **2xx** allowed | AC-PLT-DEC-05 |
| **VAL-DEC-CNS-04** | effective + person_bound + id | BR-PLT-DEC-03 | WH UPSERT by decision_id | MK-DEC-SPINE-01 |
| **VAL-DEC-ALS-01** | GET/pull `decision_types` vs `hr_decision_types` | Alias family | Resolve same effective | AC-PLT-DEC-06 · BR-PLT-DEC-05 |
| **VAL-DEC-SCP-01** | list ↔ get-by-id ↔ mutate | Scope parity U19 | Member 409 on foreign | BR-DEC-02 |

---

## 7. Data / field semantics (logical — physical = SA/ba-data)

| Field | Meaning | Validation |
|-------|---------|------------|
| `decision_type_key` / `code` | Open catalog key SoT | Slug; UQ per company; **not** closed enum |
| `label_vi` | Display-ready | Required; vi-VN |
| `person_bound` | Gắn người? | Boolean; drives BR-PLT-DEC-01/02 |
| `status` | `active` \| `retired` | Soft lifecycle |
| `archived_at` | Retire timestamp | Set on retire |
| `sort_order` / `tab_group` | Optional UI | Non-SoT for type identity |
| Consumer `hr_decisions.decision_type` | FK-logical text key | ∈ effective when catalog >0; may hold **retired** for history |

**Starter examples only (bootstrap — not ceiling):** `appointment` / `transfer` / `HRD_01` / `HRD_02` / `HRD_03` (discipline/other class) — đúng tinh thần DM §28 + E1-B; **HR thêm mã 9+ phải PASS**.

**OUT GĐ1 catalog:** merge/print template QSĐ full MISA-class (**BA-01** EMP merge GĐ2); invent second decision table.

---

## 8. Role RACI & handoff checkpoints

| Checkpoint | Owner | Entry | Exit |
|------------|-------|-------|------|
| This BA AC/BR | ba-process | BA-01 + L-EMP-CAT-06 + CORE-01a | **PASS_TO_PM** (this doc) |
| SA F.1 Option B | sa peer | This BA + ATT/REC/EMP vertical pattern | CONFIRMED DEC-VERTICAL-SA-01 |
| Physical DB/API map | ba-data | **Both** BA + SA CONFIRMED | DEC-DATA-01 |
| Client DOC-DELTA | ba-docs | Sponsor/PM after CONFIRM | ADD FR pointer open catalog — **no** wipe CORE-01a |
| BE/FE | dev-be / dev-fe | DATA + API F.1 | READY_FOR_QA |
| Browser U65 | qa | FE Settings + Decisions | AC-PLT-DEC-01..06 evidence |
| Gate | qc | QA PASS slice | GWC ≠ personnel UAT |

---

## 9. Dependencies · assumptions · open questions

### Dependencies

| Dep | Note |
|-----|------|
| Peer SA `…-DEC-VERTICAL-SA-01` | F.1 endpoints, error codes, physical table name |
| E1-B alias | `hr_decision_types` ↔ `decision_types` must_keep |
| EMP sealed | DOC/ET — **không** absorb QSĐ |
| CORE-01a / BR-DEC-05 | Person-bound spine must_keep |
| FE Settings surface | May be HOLD until DEC-FE — AC browser then |

### Assumptions

| ID | Assumption | If false |
|----|------------|----------|
| A1 | Option B Catalog (`ICatalogRow`) same as ATT/REC/EMP | SA documents Option delta |
| A2 | `person_bound` is catalog column (or equivalent metadata) | SA maps flag; BA rule vẫn đúng |
| A3 | Starter HRD_*/appointment/transfer exist or ensure later — **not** UF evidence | Bootstrap ≠ seed UF |

### Open questions (không block BA AC)

| ID | Question | Default until SA |
|----|----------|------------------|
| **Q-DEC-01** | Physical table name (`hr_decision_type` vs settings bucket only)? | SA Option B — peer seat |
| **Q-DEC-02** | Group REF publish stages for decision_types GĐ1? | Effective union if REF exists; tenant writer always |
| **Q-DEC-03** | Reactivate retired key? | Allow upsert active again; history unchanged |
| **Q-DEC-04** | Print/merge QSĐ template GĐ1? | **OUT** — GĐ2 per BA-01 EMP merge |

---

## 10. Honesty

| Flag | Value |
|------|-------|
| `hrm_personnel_uat_ready` | **false** |
| `contracts_printable_ready` | **false** |
| `payroll_e2e_ready` | **false** |
| `attendance_uat_ready` | **false** |
| `recruitment_uat_ready` | **false** |
| Platform / Phase1 DONE | **false** |
| UC-HRM-27 product DONE | **unchanged** — AC-DEC-DONE gate riêng; catalog AC ≠ module DONE |
| This seat | Docs only — AC/BR pack |

---

## 11. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-ba-01.md` |
| **next_owner** | **pm** → sau **cả** DEC-BA + DEC-VERTICAL-SA **CONFIRMED** → **ba-data** (parallel ba-docs DOC-DELTA optional) |
| **completion_report** | See evidence |
| **next_dispatch_prompt** | See evidence |
