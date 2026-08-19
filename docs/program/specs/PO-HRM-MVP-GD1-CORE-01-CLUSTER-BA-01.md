# BA AC pack — Wave-10 CORE cluster · UC-BP-CORE-01 (Hồ sơ vòng công khai — hành chính / phúc lợi)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-10 seat **#12**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** until ba-data + SA/API F.1 residual |
| **change_mode** | **ADD** (align SA-01 — **no** wipe paper FR-CORE-01 · **no** reopen W1–W9 · **no** redefine REC-07 hire / HTP-05 / APP-02) |
| **uc_ids** | `UC-BP-CORE-01` |
| **depends_on** | `PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01` **Option A LOCKED** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-sa-01.md` · Wave-9 REC-07 **SEALED** stamp **`REC07QC1-MSL5WXU5`** |
| **ref_sa** | `PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md` |
| **ref_evidence_sa** | `docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-sa-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-REC-07-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01.md` |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-01** · Diễn biến #1–#4 · **AC-CORE-PUB-01/02** · **AC-CORE-CB-MAP-01** · **BR-BP-SEC-01** · peers **CORE-02** / **CORE-01a** OUT |
| **ref_br** | **BR-BP-SEC-01** · BR-CORE-PUB-* (this pack) |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` · partner **REQ_HR_001** / **HR-001** |
| **ref_br_depth** | `UC_BR_MATRIX_DEPTH.md` UC-BP-CORE-01 · BR-BP-SEC-01 · status **PARTIAL** → this pack unlocks BA (not DONE claim) |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§3.1** `hrm_employee` public · **§3.3** `hrm_dependent` · §3.2 C&B **OUT** |
| **ref_api_paper** | **F-CORE-EMP-01** UPGRADE residual · **F-CORE-DEP-01** ADD residual · **F-CORE-EMP-02** OUT · **F-CORE-HTP-05** RETAIN · **F-REC-HIRE-01** RETAIN SEALED · physical Option A: `/api/hrm/employees*` · paper `/api/hrm/core/employees*` = **alias only** |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · personnel / CORE module UAT **false** · **`C-SLICE-≠-MODULE`** · DENY flip |
| **Cấm** | Nest `/core` dual EMP SoT · Nest `/rec` dual · second EMP / dependents SoT · claim REC-07 hire = CORE-01 DONE · reopen sealed J-HRM-REC-07-01..04 / REC-00..06 without regression · CORE-02 mutate in-seat · CORE-01a QSĐ→WH required for this GWC · seed · honesty flip · apps/** |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE mutate (U63/U65)** cho Wave-10 seat #12:

1. **UC-BP-CORE-01** — (1) Mở hồ sơ vòng công khai; (2) GET/list serializer **public-only**; (3) PATCH hành chính / cá nhân / dependents trên LIVE EMP SoT; (4) F5 **không** lộ C&B; (5) Welfare / quà 1/6 dùng DOB người phụ thuộc — **không** mở vòng C&B; (6) Lương/NH/MST/SI → CORE-02 peer.
2. **Option A** — ACCEPT_AS_IS_UPGRADE trên LIVE `/api/hrm/employees*` + **ADD** dependents; paper `/core/employees*` = **alias only**.
3. **Không** claim module CORE/REC UAT / flip honesty; **không** reopen J-HRM-REC-07-*; **không** coi accept-offer hire = public ring DONE.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS | Mở / sửa hồ sơ công khai; thêm người phụ thuộc (quà 1/6); **không** sửa C&B trên form hành chính |
| Quản lý / NV (xem được phép) | Xem hồ sơ công khai trong scope — không thấy field mật |
| Role C&B | C&B **chỉ** qua CORE-02 / HĐ–BH — redirect/hide trên form public (AC-CORE-CB-MAP-01) |
| Group CEO | Scope rollup `main` — không leak C&B trên public DTO |
| Member CEO / HRBP | Chỉ pháp nhân / membership · cùng `resolveHrmListScope` |
| Hệ thống (Nest) | Public serializer · CB-403 reject · dependents CRUD · U19 · **không** invent Nest `/core` SoT · **không** reopen hire SoT |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · AC-CORE-PUB-* deepen · AC-CORE-01-* · VAL-CORE-PUB-* · Diễn biến FE U65 · J-HRM-CORE-01-* DRAFT | Impl `apps/**` / migration / seed |
| Physical GET/PATCH `/api/hrm/employees*` public ring | Greenfield Nest `/core/employees*` SoT · second EMP table |
| Field allow-list + strip C&B keys · `HRM-CORE-CB-403` | Same-form C&B mutate (CORE-02) |
| Dependents CRUD welfare · **ba-data REQUIRED** | PAY invent · GTCG mutate as CORE-02 deep · payroll formula LIVE |
| FE hide/redirect C&B (AC-CORE-CB-MAP-01) | Invent CORE-02 compensation write |
| Hire handoff visibility from REC-07 (prefill + soft `candidate_id`) · **≠** CORE DONE | Reopen / rewrite F-REC-HIRE-01 · APP-02 · J-07 |
| Honesty footer · C-SLICE | Flip `jd_dynamic_done` / `recruitment_uat_ready` / Phase1 DONE |
| | **UC-BP-CORE-02** C&B mutate |
| | **UC-BP-CORE-01a** DEC→WH deep |
| | **UC-BP-CORE-03/09/10** invent |
| | Nest `/rec` dual · REC-03 Campaign |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Physical path | **YES** — Public get/patch/list **chỉ** physical **`/api/hrm/employees*`** · paper `GET/PATCH /api/hrm/core/employees/{id}` = **alias / DOC-DELTA only** · Network QA assert path chứa `/employees` (**not** Nest dual `/core` SoT) · **FAIL** nếu Nest `@Controller('core')` second EMP SoT |
| **O2** | Public field allow-list | **YES** — Allow (**public**): `full_name`, `employee_code`, work/personal email·phone, `department_id` / dept display, `position_key` / title display, `manager_employee_id` / manager display, `status` (open catalog consumer), `hire_date` / start dates, emergency contact, address / CCCD (checklist), `pending_docs` / profile status display, soft `candidate_id` (display-ready audit optional) · custom_fields **chỉ** keys ∈ Settings allow-list consumer (**F-EMP-CF-CNS-01** RETAIN) · **DENY** on public DTO/body: `salary` / `base_salary` / allowances money, `bank_*`, `tax_code` / `tax_id`, `social_insurance_no` / BHXH detail / SI rates · list summary **MUST NOT** expose salary bands to non-C&B public bind |
| **O3** | C&B reject + F5 | **YES** — GET public omits C&B keys even if legacy DB cols exist · PATCH/POST body containing C&B keys → **403** **`HRM-CORE-CB-403`** (RETAIN/mint; message VI rõ) · **AC-CORE-PUB-01/02**: after admin save **2xx** + **F5**, public UI/DTO still **no** salary/NH/MST/SI detail · Silent accept of C&B keys = **FAIL** |
| **O4** | FE CB-MAP-01 | **YES** — Non-C&B roles: **no** finance inputs on create/edit public · Blocks labeled lương / thu nhập: **hidden** **or** clear **redirect** to CORE-02 / HĐ–BH · **DENY** same-form mutate admin + salary · Role with C&B still **must not** mutate C&B via public PATCH (must use CORE-02 peer when unlocked) |
| **O5** | Dependents welfare | **YES** — **ADD** person rows: `full_name` + `relation_code` + `date_of_birth` (required for quà 1/6 eligibility) · soft-delete `archived_at` · scope = employee `company_id` · physical prefer **`/api/hrm/employees/:id/dependents*`** · ONE SoT (`employee_dependents` / paper `hrm_dependent` alias) · **ba-data REQUIRED** · Missing DOB when filtering quà 1/6 → soft warn / incomplete eligibility — **DENY** infer from C&B ring |
| **O6** | Tax flag boundary | **YES** — `is_tax_dependent` **may** exist on dependent row · Public may show **limited** welfare view (name/relation/DOB/eligibility) · **Tax detail / GTCG mutate** = CORE-02 / PAY-03 peer · Public GET **MUST NOT** leak salary/NH/MST because tax flag present · «Có thông tin gia đình» ≠ view lương (**SRS**) |
| **O7** | Hire handoff ≠ CORE DONE | **YES** — Employee from REC-07 appears on public list/get with prefill + `pending_docs` · soft `candidate_id` display-ready if present · **DENY** re-key UV fields as “new CORE create” primary · **DENY** claim accept-offer / soft-link = **UC-BP-CORE-01 DONE** · **DENY** reopen J-HRM-REC-07-01..04 without regression · HTP-05 **RETAIN** consume (readiness) — not redefine |
| **O8** | Peers OUT | **YES** — CORE-02 `F-CORE-EMP-02` · CORE-01a DEC/WH · CORE-03 checklist · CORE-09/10 — **peer** seats only · **DENY** pull into this WI GWC |
| **O9** | must_keep REC / EMP | **YES** — RETAIN F-REC-HIRE-01 · APP-02 · HTP-05 · soft stamp · Nest `/recruitment/*` · LIVE `/employees*` SoT · U19 · open status / CF consumer peers · **DENY** Nest `/rec` dual · **DENY** claim hire = CORE-01 DONE · **DENY** reopen J-HRM-REC-07-01..04 / REC-00..06 J-* without regression |
| **O10** | Honesty | **YES false** — `recruitment_uat_ready=false` · `jd_dynamic_done=false` · personnel/CORE module UAT **false** · **C-SLICE** · GWC slice ≠ module UAT |
| **O11** | Display-ready | **YES** — List/get/patch public + dependents DTO display-ready (labels for dept/position/status/relation) — **cấm** FE join invent SoT / re-aggregate salary for public |
| **O12** | Journeys | **YES** — DRAFT **`J-HRM-CORE-01-01..04`** (open+save public · F5 no C&B leak · dependents welfare · CB reject/hide/redirect) · U19 Group CEO rollup stated |

**Architecture SoT:** ONE LIVE EMP spine · ONE dependents SoT · paper `/core` alias only · U19 list=get=patch=dependents · soft-delete doctrine RETAIN · BR-BP-SEC-01 fail-closed.

### Primary API surface (BA lock — O1 / O5)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| List public projection | **`GET /api/hrm/employees`** | — |
| Get / patch public profile | **`GET/PATCH /api/hrm/employees/:id`** | `GET/PATCH /api/hrm/core/employees/{id}` |
| Create employee (public fields only) | **`POST /api/hrm/employees`** (RETAIN create; C&B keys → CB-403) | `/core/employees` alias only |
| Dependents CRUD | **`GET/POST/PATCH/DELETE /api/hrm/employees/:id/dependents*`** (verbs locked at API-01; soft-delete preferred over hard DELETE) | paper `hrm_dependent` |
| Hire readiness | **`GET /api/hrm/employees/:id/hire-readiness`** (**RETAIN** HTP-05) | — |
| Accept-offer hire | **`POST …/recruitment/applications/:id/accept-offer`** (**RETAIN** · **≠** this seat DONE) | `/rec/…` alias only |
| C&B compensation | Peer CORE-02 | `/core/employees/{id}/compensation` **OUT** |

**Invariant CORE-PUB-PATH:** public mutate/read Network **MUST** hit `/employees` · Nest dual `/core` SoT = **FAIL O1**.

**Invariant CORE-PUB-STRIP:** public GET/list DTO **MUST NOT** include C&B keys · F5 still clean = **AC-CORE-PUB-02**.

**Invariant CORE-PUB-REJECT:** body with C&B keys → **`HRM-CORE-CB-403`** · silent strip-and-200 = **FAIL O3**.

**Invariant CORE-DEP-ONE:** ONE dependents SoT under employee · **DENY** second table / PAY-owned person SoT rewrite.

**Invariant CORE-≠-HIRE:** REC-07 soft-link **≠** FR-UC-BP-CORE-01 DONE · claim hire = public ring = **FAIL O7**.

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-10 · Option A) |
|---|----------------------|---------------------------|
| Public path | LIVE `/api/hrm/employees*` · no Nest `/core` SoT | **RETAIN** physical · paper `/core` **alias only** (**O1**) |
| Serializer | Partial FE `view_salary`; BE/summary still salary-aware | **UPGRADE** public-only strip (**O2/O3**) |
| PATCH C&B keys | Risk silent accept via cols/custom_fields | **UNLOCK** **`HRM-CORE-CB-403`** (**O3**) |
| FE finance on public form | Same schema carries salary/bank/tax/SI | **UNLOCK** hide/redirect (**O4** · AC-CORE-CB-MAP-01) |
| Dependents person CRUD | **ABSENT** (PAY count only ≠ person rows) | **ADD** F-CORE-DEP-01 · **ba-data REQUIRED** (**O5**) |
| Tax / GTCG | Peer | Boundary: flag OK · mutate OUT (**O6**) |
| REC-07 hire | SEALED `REC07QC1-MSL5WXU5` | **RETAIN** handoff · **≠** CORE DONE (**O7**) |
| HTP-05 | LIVE | **RETAIN** (**O9**) |
| CORE-02 / CORE-01a | Peer | **OUT** (**O8**) |
| Honesty | W1–W9 C-SLICE | **false** · C-SLICE (**O10**) |

### 1.1 Public field matrix (logical — ba-data physicalizes allow-list / strip map)

| Logical field | Public ring | Notes |
|---------------|-------------|-------|
| `full_name` | **ALLOW** · required | |
| `employee_code` | **ALLOW** · required | UQ per company |
| `work_email` / `work_phone` | **ALLOW** | |
| `personal_phone` / personal contact | **ALLOW** | |
| `department_id` + display label | **ALLOW** | Display-ready · picker REF |
| `position_key` + display label | **ALLOW** | Display-ready · picker REF |
| `manager_employee_id` + display | **ALLOW** | |
| `status` + label | **ALLOW** | Open catalog consumer · invent → peer KEY codes |
| `hire_date` / start / `activated_at` display | **ALLOW** | |
| Emergency contact / address / CCCD | **ALLOW** per checklist | |
| `pending_docs` / profile lifecycle chip | **ALLOW** | Hire handoff |
| `candidate_id` soft | **ALLOW** display-ready (optional audit) | Soft · no hard FK reopen |
| `custom_fields.*` ∈ Settings EFF | **ALLOW** consumer | Invent → `HRM-EMP-CUSTOM-FIELD-KEY` |
| `salary` / `base_salary` / money allowances | **DENY** public | → CORE-02 · CB-403 |
| `bank_*` | **DENY** public | → CORE-02 · CB-403 |
| `tax_code` / `tax_id` | **DENY** public | → CORE-02 · CB-403 |
| `social_insurance_no` / SI rates / BH detail | **DENY** public | → CORE-02 / SI · CB-403 |
| Dependent `full_name` / `relation_code` / `date_of_birth` | **ALLOW** welfare | Quà 1/6 |
| Dependent `is_tax_dependent` | **ALLOW** limited flag | GTCG mutate **OUT** |

**ba-data:** lock physical column names + dependents table DDL + public serializer strip map + CB key deny-list · **DENY** second EMP / dependents SoT · **DENY** Nest `/core` table invent.

---

## 2. Business rules (normative — SRS + SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-SEC-01** | Public profile get/patch/list | No salary / money allowance / MST / bank / BHXH no / SI rates | Leak = **FAIL O2/O3** · AC-CORE-PUB-* |
| **BR-CORE-PUB-PATH** | FR-CORE-01 API | Physical `/employees*` | Nest `/core` dual SoT = **FAIL O1** |
| **BR-CORE-PUB-ALLOW** | Public DTO/body | Only allow-list fields | Extra C&B = **FAIL O2** |
| **BR-CORE-PUB-REJECT** | Body has C&B keys | **403** `HRM-CORE-CB-403` | Silent 2xx = **FAIL O3** |
| **BR-CORE-PUB-F5** | After admin save 2xx | F5 still no C&B on public | Leak after reload = **FAIL AC-CORE-PUB-02** |
| **BR-CORE-CB-MAP** | Lương / thu nhập UI | Hide or redirect · not same-form | Same-form mutate = **FAIL O4** · AC-CORE-CB-MAP-01 |
| **BR-CORE-DEP-WELFARE** | Quà 1/6 | Filter by dependent DOB / eligibility on public dependents | Infer from C&B = **FAIL O5** |
| **BR-CORE-DEP-ONE** | Dependents | ONE SoT under employee · soft-delete | Second SoT / hard-delete sole = **FAIL O5** |
| **BR-CORE-TAX-BOUND** | `is_tax_dependent` | Limited public view · GTCG mutate peer | Tax mutate on public = **FAIL O6** |
| **BR-CORE-≠-HIRE** | REC-07 soft-link / accept-offer | Handoff into CORE profile | Claim = CORE-01 DONE = **FAIL O7** |
| **BR-CORE-SCOPE** | list = get = patch = dependents | `resolveHrmListScope` | Cross-CT leak = **FAIL** U19 |
| **BR-CORE-NO-NEST-REC** | Any CORE mutate | No Nest `/rec` dual | Dual = **FAIL O9** |
| **BR-CORE-NO-SEED** | Nghiệm thu | Chuỗi FE only | Seed = **FAIL U65** |
| **BR-CORE-HONESTY** | Sau GWC | Flags false | Flip ready / jd_dynamic / CORE UAT = **FAIL O10** |
| **BR-CORE-PEER-OUT** | CORE-02 / CORE-01a | Peer seats | Pull into this WI = **FAIL O8** |
| **BR-CORE-DISPLAY** | FE bind | BE display-ready | FE invent salary aggregate on public = **FAIL O11** |
| **BR-CORE-FAMILY-≠-SALARY** | Có người phụ thuộc | Welfare only | «Có gia đình» ⇒ xem lương = **FAIL** SRS |

### Error taxonomy (BA / QA assert — mint in API seat)

| Code family | HTTP | UX intent (VI) | ≠ |
|-------------|------|----------------|--|
| **`HRM-CORE-CB-403`** | **403** | Không được gửi/sửa field mật (lương/NH/MST/BH) trên hồ sơ công khai | Scope 409 · validation 400 |
| **`HRM-CORE-PUB-VAL-400`** *(mint · optional)* | 400 | Field công khai thiếu/sai định dạng (name/code…) | CB-403 |
| **`HRM-CORE-DEP-VAL-400`** *(mint)* | 400 | Dependent thiếu name/relation/DOB (khi bắt buộc quà) | CB-403 |
| **`HRM-CORE-DEP-404`** *(mint)* | 404 | Dependent ngoài emp / đã soft-delete | Scope |
| `HRM-EMP-CUSTOM-FIELD-KEY` | 400 | Invent custom field (**RETAIN**) | CB-403 |
| `HRM-EMP-STATUS-KEY` | 400 | Invent status (**RETAIN** peer) | — |
| `HRM-SCOPE-409` / 404 | 409/404 | Ngoài phạm vi | CB-403 |
| `HRM-HTP-NO-ACTIVE-CONTRACT` | ready=false / 4xx | Thiếu HĐ (**RETAIN** HTP-05 · handoff) | Public save fail |

---

## 3. UC-BP-CORE-01 — Acceptance criteria

### 3.0 Scope ladder (mọi AC — U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) | Public emp trong member units thuộc token scope; **no** C&B on public DTO | Silent cross-tenant · C&B leak |
| **Member CEO** | Chỉ pháp nhân mình; ngoài scope → 404/409 | Thấy hồ sơ đơn vị khác |
| **HRBP** | Narrow membership — **cùng** resolver | Rollup tập đoàn khi không được phép |
| **Non-C&B HCNS** | Admin/welfare fields only | Finance inputs on public form |

**Invariant CORE-S-SCOPE:** list employees **=** get employee **=** patch public **=** dependents.

**Prerequisite:** Hồ sơ NS tồn tại (sau REC-07 hoặc tạo nội bộ) · persona trong scope · **không** dùng seed.

### 3.1 Happy path (Diễn biến #1–#4 + Thành công)

| AC-ID | SRS # | Given | When | Then (measurable — **user sees**) | Evidence |
|-------|-------|-------|------|-------------------------------------|----------|
| **AC-CORE-01-01** | #1 · O1/O2 | Emp in scope; non-C&B role | FE: Nhân sự → mở hồ sơ công khai | Network **GET** `/api/hrm/employees/:id` **200**; DTO **chỉ** public allow-list; **không** `salary`/`bank_*`/`tax_*`/`social_insurance_*`; FE form công khai không ô mật | Browser · O1/O2 · AC-CORE-PUB-01 |
| **AC-CORE-01-02** | #2 · O2/O3 | Public form hợp lệ | Sửa hành chính (phone/addr/…) → **Lưu** | Network **PATCH** `/api/hrm/employees/:id` **2xx**; FE cập nhật; toast OK; **không** banner lỗi | Browser · U65 |
| **AC-CORE-01-03** | #4 · AC-CORE-PUB-02 | Sau PATCH 2xx | **F5** / navigate lại hồ sơ công khai | Vẫn **không** lộ lương/NH/MST/SI; GET public vẫn strip | Browser + F5 · O3 |
| **AC-CORE-01-04** | #3 · O3 · AC-CORE-PUB-01 | Non-C&B (hoặc public endpoint) | Thử PATCH body kèm `salary`/`bank_*`/`tax_code`/`social_insurance_no` (DevTools hoặc forced) | **403** **`HRM-CORE-CB-403`**; DB public ring không nhận field mật; FE không hiện giá trị mật sau retry GET | L1 + browser · O3 |
| **AC-CORE-01-05** | O4 · AC-CORE-CB-MAP-01 | Non-C&B on public profile | Quan sát UI khối lương / thu nhập | **Ẩn** **hoặc** CTA/redirect rõ sang HĐ–BH / CORE-02 — **không** cùng form sửa hành chính + lương | Browser · O4 |
| **AC-CORE-01-06** | #3–#4 · O5 | Emp in scope | Thêm người phụ thuộc (họ tên + quan hệ + DOB) → Lưu | Network **POST** `…/employees/:id/dependents` **2xx**; list hiện row; **F5** còn; dùng được cho lọc quà 1/6 (DOB) | Browser · O5 · ba-data |
| **AC-CORE-01-07** | O5 · SRS special | Có ≥1 child với DOB | Chạy / xem bộ lọc phúc lợi quà 1/6 (khi UI có) | Eligibility dựa DOB dependents public — **không** gọi C&B compensation | Browser/L1 · O5 |
| **AC-CORE-01-08** | O7 · O9 | Emp từ REC-07 soft-link | Mở hồ sơ public sau hire | Prefill còn; `pending_docs` / soft `candidate_id` display-ready nếu có; **không** bắt re-key UV; **không** claim CORE-01 DONE chỉ vì hire | Browser · RETAIN J-07 · O7 |
| **AC-CORE-01-09** | O11 | Sau get/patch/dep | FE bind | Labels dept/position/status/relation display-ready từ BE — **không** FE invent salary aggregate | Browser · O11 |
| **AC-CORE-01-10** | O1 | Alias | Gọi paper `/core/employees/{id}` (nếu mounted) | Alias **cùng** SoT `/employees` **hoặc** DOC-DELTA not-as-SoT — **FAIL** nếu second Nest EMP controller SoT | L1 grep · O1 |

### 3.2 Alternate

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-CORE-01-ALT-01** | Role C&B | Mở khối lương trên hồ sơ | Redirect / open CORE-02 peer — **không** public PATCH C&B | O4/O8 |
| **AC-CORE-01-ALT-02** | Dependent soft-deleted | List default | Row ẩn; history OK nếu `include_archived` | O5 |
| **AC-CORE-01-ALT-03** | `is_tax_dependent=true` | Public view | Thấy flag/welfare limited — **không** lộ MST/lương | O6 |
| **AC-CORE-01-ALT-04** | Custom field ∈ EFF | PATCH public custom key | 2xx nếu ∈ allow-list; invent → `HRM-EMP-CUSTOM-FIELD-KEY` | O2 · CF RETAIN |
| **AC-CORE-01-ALT-05** | HTP chưa HĐ | Mở readiness | Blocker HTP-05 RETAIN — **không** redefine hire | O7/O9 |

### 3.3 Exception

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-CORE-01-EX-01** | Body C&B keys | PATCH public | **403** `HRM-CORE-CB-403` | O3 |
| **AC-CORE-01-EX-02** | Ngoài scope | GET/PATCH/dep | 404/409 · no leak | U19 |
| **AC-CORE-01-EX-03** | Dependent thiếu name/relation/DOB (bắt buộc) | POST dep | **400** `HRM-CORE-DEP-VAL-400` | O5 |
| **AC-CORE-01-EX-04** | Nest `/core/employees` second SoT | Impl review | **FAIL O1** | O1 |
| **AC-CORE-01-EX-05** | Second EMP / dependents table invent | Schema | **FAIL** | O5 · DENY |
| **AC-CORE-01-EX-06** | Claim REC-07 hire = CORE-01 DONE | Review | **FAIL O7** · C-SLICE | O7 |
| **AC-CORE-01-EX-07** | Nest `/rec` dual | Mutate/path | **FAIL O9** | O9 |
| **AC-CORE-01-EX-08** | Reopen sealed J-HRM-REC-07-01..04 rewrite | Wave | **FAIL O9** | must_keep |
| **AC-CORE-01-EX-09** | Seed emp/dep để pass QA | Evidence | **FAIL U65** | O10 |
| **AC-CORE-01-EX-10** | Flip `recruitment_uat_ready` / `jd_dynamic_done` / CORE UAT | Evidence | **FAIL O10** | honesty |
| **AC-CORE-01-EX-11** | Same-form admin+salary mutate | FE | **FAIL O4** · AC-CORE-CB-MAP-01 | O4 |
| **AC-CORE-01-EX-12** | Pull CORE-02 write / CORE-01a as required this seat | Scope | **FAIL O8** | O8 |
| **AC-CORE-01-EX-13** | F5 after admin save still shows salary | UI | **FAIL AC-CORE-PUB-02** | O3 |
| **AC-CORE-01-EX-14** | Quà 1/6 suy luận từ C&B compensation | Welfare | **FAIL O5** · SRS special | O5 |

### 3.4 Diễn biến FE (U65 — mẫu nghiệm thu)

```text
#1–#2 Open + save public (no C&B)
Login HCNS (non-C&B) → Menu Nhân sự → mở hồ sơ trong scope
→ Network GET /api/hrm/employees/:id → 200 public-only
→ Assert: không ô lương/NH/MST/SI trên form công khai
→ Sửa ĐT / địa chỉ / liên hệ khẩn → Lưu
→ Network PATCH /api/hrm/employees/:id → 2xx
→ F5: thay đổi còn · vẫn không lộ field mật (AC-CORE-PUB-02)

#3 CB reject / hide-redirect
→ (Non-C&B) không thấy khối lương hoặc thấy CTA sang HĐ–BH (AC-CORE-CB-MAP-01)
→ Forced PATCH kèm salary/bank/tax → 403 HRM-CORE-CB-403
→ GET lại: không leak

#4 Dependents / quà 1/6
→ Tab/gia đình → Thêm người phụ thuộc (họ tên + quan hệ + ngày sinh)
→ Network POST …/employees/:id/dependents → 2xx → F5 còn
→ Lọc quà 1/6 dùng DOB — không mở C&B

# Hire handoff (RETAIN ≠ DONE)
→ Emp từ REC-07: prefill + pending_docs (+ candidate_id nếu có) — không re-key UV
→ Cấm: claim CORE-01 DONE · reopen J-07 · Nest /rec · Nest /core dual · seed · honesty flip
```

---

## 4. Validation matrix (VAL-CORE-PUB-*)

| VAL-ID | Rule | Pass | Fail |
|--------|------|------|------|
| **VAL-CORE-PUB-01** | Physical path | Network `/employees` | Nest `/core` SoT dual |
| **VAL-CORE-PUB-02** | Paper alias | Alias only / DOC-DELTA | Second EMP controller SoT |
| **VAL-CORE-PUB-03** | Allow-list | Public DTO ⊆ allow | Salary/NH/MST/SI on public GET |
| **VAL-CORE-PUB-04** | CB reject | **403** `HRM-CORE-CB-403` | Silent 2xx accept C&B keys |
| **VAL-CORE-PUB-05** | F5 no leak | AC-CORE-PUB-02 | Leak after reload |
| **VAL-CORE-PUB-06** | FE CB-MAP | Hide or redirect | Same-form salary mutate |
| **VAL-CORE-PUB-07** | Dependents ADD | CRUD under `/employees/:id/dependents*` | ABSENT / second SoT |
| **VAL-CORE-PUB-08** | Quà 1/6 | DOB/eligibility on public deps | Infer from C&B |
| **VAL-CORE-PUB-09** | Soft-delete deps | archived_at | Hard-delete sole SoT |
| **VAL-CORE-PUB-10** | Tax boundary | Flag OK · GTCG mutate OUT | Tax mutate on public |
| **VAL-CORE-PUB-11** | Hire ≠ DONE | Prefill visible · claim denied | Hire = CORE-01 DONE |
| **VAL-CORE-PUB-12** | HTP-05 RETAIN | Readiness path OK | Redefine hire / reopen J-07 |
| **VAL-CORE-PUB-13** | Nest `/rec` DENY | 0 dual | Dual SoT |
| **VAL-CORE-PUB-14** | U19 scope | list=get=patch=dep | Cross-CT leak |
| **VAL-CORE-PUB-15** | Peers OUT | CORE-02/01a peer | Pull into seat |
| **VAL-CORE-PUB-16** | Display-ready | BE labels | FE invent salary aggregate |
| **VAL-CORE-PUB-17** | CF consumer | KEY when invent | Nest CF definition invent |
| **VAL-CORE-PUB-18** | Honesty | flags false | Flip ready / jd_dynamic / CORE UAT |
| **VAL-CORE-PUB-19** | U65 | FE chain only | Seed evidence |
| **VAL-CORE-PUB-20** | Second EMP DENY | ONE `employees` SoT | Dual table |
| **VAL-CORE-PUB-21** | List public | No salary bands to non-C&B public | Summary salary leak |
| **VAL-CORE-PUB-22** | Family ≠ salary | Deps OK | «Có gia đình» ⇒ lương |
| **VAL-CORE-PUB-23** | ba-data map | Deps + strip map locked | Code before DATA |
| **VAL-CORE-PUB-24** | REC seals | J-07 RETAIN | Reopen without regression |

---

## 5. Traceability — UC → BR → partner_req → AC → Journey/UF

| UC | BR | partner_req | Decision | AC (primary) | UF / J-* |
|----|-----|-------------|----------|--------------|----------|
| **UC-BP-CORE-01** | BR-BP-SEC-01 · BR-CORE-PUB-* · AC-CORE-PUB-01/02 · AC-CORE-CB-MAP-01 | **REQ_HR_001** · **HR-001** | SA Option **A** LOCKED · O1–O12 CONFIRMED | AC-CORE-01-01..10 · ALT · EX · VAL-01..24 | **UF-HRM-CORE-01** *(DRAFT)* · **J-HRM-CORE-01-01..04** (DRAFT) |
| UC-BP-REC-07 | BR-BP-LC-01 | REQ_REC_004 | Peer SEALED `REC07QC1-MSL5WXU5` | Hire ≠ CORE DONE | **J-HRM-REC-07-*** RETAIN — **DENY reopen** |
| UC-BP-CORE-02 | BR C&B | — | **OUT** peer | — | Cite — **OUT invent** |
| UC-BP-CORE-01a | DEC→WH | — | **OUT** peer | — | Cite — **OUT** |
| UC-BP-REC-00..06 | — | — | Sealed W1–W8 | — | must_keep |

### Journey placeholders (U19) — DRAFT

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-CORE-01-01** | Login HCNS → Nhân sự → mở hồ sơ công khai → sửa hành chính → Lưu → PATCH `/employees/:id` 2xx → F5 còn | AC-CORE-01-01/02 · O1/O2 · U65 · **≠** Nest `/core` dual |
| **J-HRM-CORE-01-02** | Sau lưu hành chính → F5; forced PATCH C&B keys → **403** `HRM-CORE-CB-403`; GET vẫn strip | AC-CORE-01-03/04 · AC-CORE-PUB-02 · O3 · U65 |
| **J-HRM-CORE-01-03** | Hồ sơ → thêm người phụ thuộc (name+relation+DOB) → POST dependents 2xx → F5; quà 1/6 dùng DOB | AC-CORE-01-06/07 · O5 · U65 |
| **J-HRM-CORE-01-04** | Non-C&B: khối lương ẩn hoặc redirect HĐ–BH; hire-handoff emp visible không re-key; Nest `/rec` DENY; no reopen J-07 | AC-CORE-01-05/08 · O4/O7/O9 · AC-CORE-CB-MAP-01 · U19 |

**Group CEO:** public list/get/patch/deps chỉ trong scope rollup; Member/HRBP không thấy ngoài membership; **không** C&B trên public DTO.

### UF matrix note

| UF | Status | Relation |
|----|--------|----------|
| **UF-HRM-CORE-01** | ⬜ DRAFT | Browser public ring sau DATA+API+Dev |
| **J-HRM-REC-07-01..04** | 🟢 SEALED Wave-9 | **DENY** reopen without regression · **≠** CORE-01 DONE |
| Sealed W1–W8 UF/J | must_keep | **không** reopen |

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD (`R-PLT-JD-DYNAMIC-DONE-01`) |
| Personnel / CORE module UAT | **false** |
| C-SLICE | GWC CORE-01 slice ≠ module CORE/REC UAT ≠ Phase1 DONE |
| must_keep W9 | REC-07 hire soft-link · stamp **`REC07QC1-MSL5WXU5`** · J-HRM-REC-07-* · **hire ≠ CORE DONE** |
| must_keep W1–W8 | REC seals · UV-YCTD · CAT · HTP-05 · soft-delete · U19 · G-DB-02 no hard FK reopen |
| must_keep EMP | LIVE `/api/hrm/employees*` · open status / CF **consumer** · soft `candidate_id` |
| DENY | Nest `/core` dual EMP · Nest `/rec` dual · second EMP/deps SoT · claim hire = CORE-01 DONE · CORE-02 write in-seat · CORE-01a required · seed · honesty flip · invent beyond SRS · apps/** this seat · reopen sealed J-07 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — physical dependents (`employee_dependents` / paper `hrm_dependent`) + public allow-list / CB strip map (**O2/O5**) · **REQUIRED** |
| **ba-data** | **REQUIRED** |
| **Then** | **sa** — API F.1 **F-CORE-EMP-01** UPGRADE + **F-CORE-DEP-01** ADD residual physical · mint `HRM-CORE-CB-403` / `HRM-CORE-PUB-*` / `HRM-CORE-DEP-*` · paper `/core` alias · HTP-05/REC-07 RETAIN |
| **Dev** | **HOLD** until DATA + API CONFIRMED |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-ba-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-01
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01.md
spec_ref: DB §3.1 hrm_employee public · §3.3 hrm_dependent · F-CORE-EMP-01 · F-CORE-DEP-01 · BR-BP-SEC-01

MISSION — Physical DATA lock (docs-only):
1) ONE dependents SoT physical (employee_dependents ↔ paper hrm_dependent) — columns: full_name, relation_code, date_of_birth, is_tax_dependent (boundary), soft archived_at, company_id scope
2) Public allow-list + CB deny-list strip map on LIVE employees (no second EMP table)
3) DENY Nest /core dual EMP · Nest /rec dual · second deps SoT · hard FK hire reopen · CORE-02 cols on public · seed · honesty flip · apps/**
4) Unlock sa API-01 F-CORE-EMP-01 UPGRADE + F-CORE-DEP-01 ADD — not Dev

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API-01
```

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-CORE-01 against SA Option A: physical `/api/hrm/employees*` public ring · paper `/core` alias only · allow-list + **`HRM-CORE-CB-403`** + F5 no leak · FE CB-MAP hide/redirect · dependents welfare **ADD** (**ba-data REQUIRED**) · hire handoff ≠ CORE DONE · J-HRM-CORE-01-01..04 DRAFT · DENY Nest `/core` dual · Nest `/rec` · second EMP · reopen J-07 · honesty flip · seed · apps/** · C-SLICE. |
| **next_owner** | **ba-data** |
| **ack_status** | **PASS_TO_PM** |
| **residual** | Physical dependents DDL + strip map (DATA-01) · API F.1 lock (API-01) · Dev HOLD · journeys DRAFT until QA |
