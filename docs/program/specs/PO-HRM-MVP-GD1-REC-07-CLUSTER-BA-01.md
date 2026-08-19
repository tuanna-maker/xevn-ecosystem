# BA AC pack — Wave-9 REC cluster · UC-BP-REC-07 (Chấp nhận offer → tạo hồ sơ NS không nhập lại)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-07-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-9 seat **#11**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** until ba-data + SA/API F.1 residual |
| **change_mode** | **ADD** (align SA-01 — **no** wipe paper FR-07 · **no** reopen W1–W8 · **no** redefine 06/05/06a/04 / CAT / HTP-05) |
| **uc_ids** | `UC-BP-REC-07` |
| **depends_on** | `PO-HRM-MVP-GD1-REC-07-CLUSTER-SA-01` **Option A LOCKED** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-sa-01.md` · Wave-8 REC-06 **SEALED** stamp **`REC06QC1-MSL4CU2G`** |
| **ref_sa** | `PO-HRM-MVP-GD1-REC-07-CLUSTER-SA-01.md` |
| **ref_evidence_sa** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-sa-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01.md` |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-07** · Diễn biến #1–#5 · AC-HTP-05-01..03 · special cancel/missing fields/no-contract · peers **CORE-03/07/09/10** handoff |
| **ref_br** | **BR-BP-LC-01** (matrix / F-REC-HIRE-01 / SA) · SRS header **BR-BP-ONB-01** = **same intent** «không nhập lại» — **BA cites both; no invent third BR** |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` · partner **REQ_REC_004** · WBS-REC-05 · PPT 13 |
| **ref_br_depth** | `UC_BR_MATRIX_DEPTH.md` UC-BP-REC-07 · BR-BP-LC-01 · status **PARTIAL / PENDING** → this pack unlocks BA (not DONE claim) |
| **ref_uv_yctd** | `PO-HRM-REC-UV-YCTD-API-01` · ONE soft FK `requisition_id` · F-REC-UV-YCTD-* · F-REC-CMP-* **RETAIN** |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §2.4 `rec_candidate.employee_id` · §2.5 application · §2.4a `is_hired_outcome` · CORE employees/contracts |
| **ref_api_paper** | **F-REC-HIRE-01** ADD residual · **F-REC-APP-02** RETAIN · **F-REC-CAT-EFF-01** RETAIN · **F-CORE-HTP-05** RETAIN · **F-REC-MAIL-01** ≠ hire · physical Option A: `/api/hrm/recruitment/*` · paper `/api/hrm/rec/*` = **alias only** |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **`C-SLICE-≠-MODULE`** · DENY flip |
| **Cấm** | Nest `/rec` dual · second hire SoT · PAY invent · seed · honesty flip · claim REC-06 mail template `offer` = hire · reopen sealed J-HRM-REC-06-01..04 / REC-05/06a/04 J-* · pool PATCH hired / Kanban drag hired alone as FR-07 DONE · apps/** |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE mutate (U63/U65)** cho Wave-9 seat #11:

1. **UC-BP-REC-07** — (1) Xác nhận accept offer trên **đúng UV↔YCTD application**; (2) **CREATE** (hoặc LINK) hồ sơ NS cùng pháp nhân, **điền sẵn** field từ UV+YCTD — **không** bắt nhập lại; (3) Soft stamp `employee_id`; (4) Stage → `is_hired_outcome` **chỉ** qua sealed **F-REC-APP-02**; (5) Emit `offer.accepted` · **DENY** PAY; (6) Consume **HTP-05** + handoff CORE contract/SI/checklist.
2. **Option A** — ACCEPT_AS_IS_UPGRADE trên LIVE soft hire-link + APP-02 + HTP-05; **ADD** physical `accept-offer` create+prefill; paper `/rec/*` = **alias only**.
3. **Không** claim module REC UAT / flip honesty; **không** reopen REC-06/05/06a/04 J-*; **không** coi mail template `offer` = F-REC-HIRE-01.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| Nhân sự tuyển dụng (HR) | Mở UV–YCTD offer-ready → **Chấp nhận offer** → xác nhận tạo hồ sơ; quan sát prefill + stage hired-outcome |
| HCNS | Bổ sung field thiếu trên hồ sơ «chờ hoàn thiện»; tạo/gắn HĐ · BH · checklist (CORE peers) |
| Group CEO | Scope rollup — không leak hồ sơ ngoài scope |
| Member CEO / HRBP | Chỉ pháp nhân / membership · cùng `resolveHrmListScope` |
| Hệ thống (Nest) | Accept-offer create/link · soft stamp · call APP-02 · emit event · HTP-05 readiness · **không** invent PAY · **không** silent stage |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · AC-REC-07-* · VAL-REC-HIRE-* · Diễn biến FE #1–#2 (+ HTP #3–#5 handoff) · J-HRM-REC-07-* DRAFT | Impl `apps/**` / migration / seed |
| Physical accept-offer create+prefill+soft-link | Greenfield Nest `/rec/*` SoT · second hire SoT |
| Hired-outcome **only** via APP-02 after accept success | Silent stage on accept without history · redefine REC-05 |
| Prefill field map UV→EMP (logical) · **ba-data REQUIRED** | Invent empty re-key form as primary UX |
| HTP-05 consume · CORE contract/SI/checklist **handoff AC** | Invent payslip / PAY call · rewrite CORE contract SoT as REC-only |
| Idempotent re-accept · mint `HRM-REC-HIRE-*` expand | Claim REC-06 mail `offer` = hire DONE |
| Honesty footer · C-SLICE | Flip `jd_dynamic_done` / `recruitment_uat_ready` / Phase1 DONE |
| | **UC-BP-REC-03** Campaign |
| | **UC-BP-REC-06b** compare matrix |
| | Reopen sealed J-HRM-REC-06-01..04 without regression |
| | Pool hired / Kanban drag hired alone as FR-07 SoT |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Physical path | **YES** — FE accept-offer **chỉ** `/api/hrm/recruitment/*` · **primary** = **`POST /api/hrm/recruitment/applications/:id/accept-offer`** (neo N–N UV×YCTD = paper F-REC-HIRE-01) · paper `POST /api/hrm/rec/applications/{id}/accept-offer` = **alias only** · Network QA assert path chứa `/recruitment/` · **FAIL** nếu Nest dual `/rec/*` SoT · **DENY** alternate `candidates/:id/accept-offer` as second primary (thin alias OK **chỉ** nếu cùng SoT + cùng VAL + resolves to same application) |
| **O2** | Offer-accepted gate | **YES** — Accept **chỉ** khi application trên YCTD ở trạng thái **offer-ready**: stage hiện tại ∈ EFF **và** (stage_key/`code` = `offer` **hoặc** catalog/CFG flag `allows_accept_offer=true` trên stage — API seat names flag; **default GĐ1** = stage `offer` hoặc tương đương EFF) · chưa offer-ready → **400** `HRM-REC-HIRE-OFFER-INVALID` · **không** create emp · **không** transition · Offer **hủy sau** accept intent / cancelled flag → **400** `HRM-REC-HIRE-CANCELLED` (hoặc OFFER-INVALID) + lý do · **không** tạo hồ sơ mới |
| **O3** | Create vs link | **YES** — **Prefer CREATE** employee từ UV+YCTD prefill khi **không** có reverse `employees.candidate_id` / soft link hợp lệ cùng `company_id` · **LINK** nếu reverse/soft `employee_id` đã tồn tại **cùng pháp nhân** (RETAIN hire-employee-link assert) · **DENY** empty CORE form re-key làm primary path · Link-only picker (`HireEmployeeLinkDialog`) = **residual alternate** cho legacy — **không** = FR-07 DONE một mình |
| **O4** | Prefill map | **YES** — **ba-data REQUIRED**: map UV person + YCTD org → employees «chờ hoàn thiện» (§1.1) · thiếu field CORE bắt buộc → vẫn **CREATE** status chờ / block Active (FR-07 special) — **không** fail toàn bộ chỉ vì thiếu optional · **không** bắt user gõ lại name/email/phone/company/dept/position đã có |
| **O5** | Idempotency | **YES — idempotent 2xx** (SA prefer) — Re-accept cùng `application_id` đã hired+linked → **200/201** return existing `{ application_id, employee_id, … }` · **không** tạo emp thứ hai · True conflict (khác emp cùng offer / race) → **409** `HRM-REC-HIRE-DUP` · **cấm** silent second profile |
| **O6** | Stage write | **YES** — Sau create/link **success** → transition tới `hiredOutcomeKey` / stage `is_hired_outcome=true` ∈ EFF **chỉ** qua **F-REC-APP-02** (`POST …/candidates/:id/transitions` + history) · Accept endpoint **không** tự ghi stage bypass history · Invent stage đích → **`HRM-REC-STAGE-UNKNOWN`** RETAIN · Network: accept **2xx** + transition **2xx** + `history_id` (cùng logical unit hoặc sequential visible) |
| **O7** | Soft stamp | **YES** — Write Lane A `recruitment_candidates.employee_id` (+ mirror Lane B `candidates.employee_id` khi dual-lane linked) · reverse `employees.candidate_id` (hoặc paper equivalent) · **no** hard FK (G-DB-02) · RETAIN **`HRM-REC-HIRE-400`** / **`HRM-REC-HIRE-409`** cho path link-only thiếu/`cross-company` · create path **must** satisfy link assert after stamp |
| **O8** | CORE handoff | **YES** — Contract create/attach · BH/SI · checklist CORE-03 = **peer** CORE UC AC (mở API/màn hiện có) — **không** invent PAY · **HTP-05 RETAIN** `GET …/employees/:id/hire-readiness` cho AC-HTP-05-01..03 · Thiếu HĐ hiệu lực cùng CT → blocker `HRM-HTP-NO-ACTIVE-CONTRACT` · **DENY** claim «xong bước trước lương» khi chỉ có hồ sơ |
| **O9** | Peers must_keep | **YES** — RETAIN REC-06 mail/eval (**≠ hire**; stamp **`REC06QC1-MSL4CU2G`** · J-06-*) · REC-05 transitions/history · REC-06a IV · REC-04 scan · CAT STG/EFF · UV-YCTD · W1–W3 · hire-employee-link · HTP-05 · **OUT** REC-03 · REC-06b matrix · claim mail template `offer` = F-REC-HIRE-01 |
| **O10** | Honesty | **YES false** — `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · GWC slice ≠ module REC UAT |
| **O11** | Events / PAY | **YES** — Emit `offer.accepted` (paper event payload: tenant/company/candidate/application/offer?/position/accepted_at) · Client kèm payroll/payslip payload → **`HRM-REC-PAY-403`** · REC **↛** PAY (GW-HRM-02 / I-2) |
| **O12** | Display-ready | **YES** — Accept response + employee GET expose prefilled fields + `employee_id` + stage hired-outcome display — **cấm** FE aggregate invent SoT / re-derive hire từ mail outbox |
| **Architecture** | SoT | ONE soft hire link · APP-02 sole hired-outcome writer · physical `/recruitment/*` · U19 list=get=accept=employee=hire-readiness · soft-delete doctrine RETAIN |

### Primary API surface (BA lock — O1)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| Accept offer → create/link | **`POST /api/hrm/recruitment/applications/:id/accept-offer`** body optional `{ expected_start_date?, note? }` — **primary** | `POST /api/hrm/rec/applications/{id}/accept-offer` |
| Thin candidate alias | `POST …/candidates/:id/accept-offer` — **chỉ** nếu resolves **one** in-scope application on open YCTD + **cùng** VAL/SoT | — |
| Hired-outcome stage | **`POST …/candidates/:id/transitions`** (**RETAIN** REC-05) target = EFF `is_hired_outcome` | `/rec/…/transitions` |
| EFF hired key | `GET …/pipeline-stages/effective` (**RETAIN**) | — |
| Hire readiness | **`GET /api/hrm/employees/:id/hire-readiness`** (**RETAIN** HTP-05) | — |
| Soft hire assert (link paths) | hire-employee-link (**RETAIN**) | — |
| Mail template `offer` | `/recruitment/…/mail` | **RETAIN ≠ this seat** |

**Invariant HIRE-APP:** accept **2xx** ⇒ neo **application** YCTD-bound in-scope + `employee_id` soft stamped + **no** second emp for same application.

**Invariant HIRE-STAGE-APP-02:** hired-outcome write **chỉ** qua transitions · accept **không** mutate stage silently without history row.

**Invariant HIRE-NO-REKEY:** response/employee GET shows UV/YCTD-sourced fields prefilled · FE **không** require re-type of those fields for success path.

**Invariant HIRE-≠-MAIL:** REC-06 mail `template_code=offer` **≠** F-REC-HIRE-01 · claim mail = hire = **FAIL O9**.

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-9 · Option A) |
|---|----------------------|---------------------------|
| Accept-offer API | **ABSENT** Nest physical | **ADD** `POST …/applications/:id/accept-offer` (**O1**) |
| Create from UV | Link picker only | **CREATE+prefill** primary (**O3/O4**) |
| Soft `employee_id` | LIVE soft + HIRE-400/409 | **RETAIN** stamp after create (**O7**) |
| Hired stage | APP-02 + EFF | **RETAIN** — accept calls APP-02 (**O6**) |
| Idempotent re-accept | Partial reverse resolve | **UNLOCK** idempotent 2xx (**O5**) |
| Prefill map | None | **UNLOCK** ba-data REQUIRED (**O4**) |
| HTP-05 | LIVE | **RETAIN** consume (**O8**) |
| Contract / SI / checklist | CORE peers | **Handoff AC** — not invent (**O8**) |
| Mail template `offer` | SEALED REC-06 | **RETAIN ≠ hire** (**O9**) |
| Paper `/rec/*` | Naming | **Alias only** (**O1**) |
| Honesty | W1–W8 C-SLICE | **false** · C-SLICE (**O10**) |

### 1.1 Prefill field map (logical — **ba-data REQUIRED** physicalizes)

| Source | Logical field | → Employee target (logical) | Required on create | Rule |
|--------|---------------|-----------------------------|--------------------|------|
| UV (Lane A / paper `rec_candidate`) | `full_name` | `full_name` / display name | **YES** | No re-key |
| UV | `email` | `email` / work or personal per CORE map | Prefer | Copy if present |
| UV | `phone` | `phone` | Prefer | Copy if present |
| UV | `cv_file_ref` / docs refs | attachment refs if CORE supports | No | Soft copy — no invent PAY |
| YCTD (`job_requisitions`) | `company_id` | `company_id` | **YES** | Same CT as offer/YCTD |
| YCTD | `department_id` / dept key | department FK/key | Prefer | From YCTD — not free-text |
| YCTD | `position_key` / title | `position_key` / job title | Prefer | Derived YCTD — DENY free-text SoT |
| Offer / application / YCTD | `expected_start_date` | `expected_start_date` / hire date planned | Prefer (SRS Có) | `dd/MM/yyyy` UX · ISO persist |
| Application | `id` | soft neo / audit | YES neo | Persist link |
| UV | `id` (recruitment_candidate_id) | `candidate_id` reverse soft | YES | Soft stamp |
| — | — | `status` | YES | «chờ hoàn thiện» / pending-complete — **block Active** until CORE required set (FR-07 special) |

**ba-data:** lock physical column names + CHK + optional accept-audit cols (`accepted_at`, `accepted_by`, `offer_id` soft) · **DENY** second hire table · **DENY** hard FK candidate↔employee.

---

## 2. Business rules (normative — SRS + SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-LC-01** / **BR-BP-ONB-01** | Accept offer | Tạo/link hồ sơ **không nhập lại** data UV/YCTD đã có | Re-key primary = **FAIL O3/O4** |
| **BR-REC-HIRE-PATH** | Accept FR-07 | Physical `/recruitment/*` | Nest `/rec` dual = **FAIL O1** |
| **BR-REC-HIRE-GATE** | Accept | Offer-ready on YCTD application | Not ready = **FAIL O2** · 400 OFFER-INVALID |
| **BR-REC-HIRE-CANCEL** | Offer hủy sau accept | Không tạo hồ sơ mới; lý do hủy | New emp = **FAIL O2** |
| **BR-REC-HIRE-ONE** | Soft hire link | ONE `employee_id` on person + application neo | Second hire SoT / hard FK = **FAIL O7** |
| **BR-REC-HIRE-IDEM** | Re-accept same application | Return existing link 2xx | Second emp = **FAIL O5** |
| **BR-REC-HIRE-STAGE** | Hired-outcome | Only F-REC-APP-02 | Silent stage / invent = **FAIL O6** |
| **BR-REC-HIRE-EFF** | Target stage | `is_hired_outcome` ∈ EFF | STAGE-UNKNOWN = **FAIL** |
| **BR-REC-HIRE-SCOPE** | list = get = accept = emp = HTP | `resolveHrmListScope` | Cross-CT = **FAIL** U19 |
| **BR-REC-HIRE-NO-PAY** | Accept / response | No payslip | PAY payload = **HRM-REC-PAY-403** · **FAIL O11** if 2xx invent |
| **BR-REC-HIRE-HTP** | Trước lương | Profile + active contract same CT | Missing contract silent payroll = **FAIL O8** / AC-HTP-05 |
| **BR-REC-HIRE-MAIL-≠** | Mail template `offer` | Mail only | Claim = hire DONE = **FAIL O9** |
| **BR-REC-HIRE-NO-CAMPAIGN** | Pipeline | UV–YCTD application | REC-03 / posting = **FAIL** |
| **BR-REC-HIRE-POOL-≠-DONE** | Pool PATCH hired / Kanban drag | Not FR-07 SoT alone | Claim DONE = **FAIL** |
| **BR-REC-HIRE-NO-SEED** | Nghiệm thu | Chuỗi FE only | Seed = **FAIL U65** |
| **BR-REC-HIRE-HONESTY** | Sau GWC | Flags false | Flip ready / jd_dynamic = **FAIL O10** |
| **BR-REC-HIRE-PEER** | REC-06/05/06a/04 / UV / CAT / HTP / W1–W3 | RETAIN | Reopen sealed J-06 without regression = **FAIL O9** |
| **BR-REC-HIRE-DISPLAY** | FE bind | BE display-ready | FE invent hire aggregate = **FAIL O12** |

### Error taxonomy (BA / QA assert — mint in API seat)

| Code family | HTTP | UX intent (VI) | ≠ |
|-------------|------|----------------|--|
| **`HRM-REC-HIRE-OFFER-INVALID`** *(mint)* | 400 | Chưa offer-ready / không đủ điều kiện accept | STAGE-UNKNOWN |
| **`HRM-REC-HIRE-CANCELLED`** *(mint · optional)* | 400 | Offer đã hủy — không tạo hồ sơ | OFFER-INVALID |
| **`HRM-REC-HIRE-DUP`** *(mint)* | 409 | Xung đột emp/offer (không dùng cho re-accept idempotent) | Idempotent 2xx |
| **`HRM-REC-HIRE-PREFILL-FAIL`** *(mint · optional)* | 400 | Thiếu **bắt buộc** UV `full_name` / YCTD `company_id` không resolve | Missing optional CORE |
| `HRM-REC-HIRE-400` | 400 | Link-only thiếu `employee_id` (**RETAIN**) | Create path |
| `HRM-REC-HIRE-409` | 409 | Cross-company link (**RETAIN**) | Scope |
| `HRM-REC-STAGE-UNKNOWN` | 400 | Đích hired ngoài EFF (**RETAIN**) | OFFER-INVALID |
| `HRM-REC-PAY-403` | 403 | Kèm payroll payload (**RETAIN**) | — |
| `HRM-SCOPE-409` / 404 | 409/404 | Ngoài phạm vi | — |
| `HRM-HTP-NO-ACTIVE-CONTRACT` | 4xx/ready=false | Thiếu HĐ hiệu lực (**RETAIN** HTP-05) | Hire create fail |

---

## 3. UC-BP-REC-07 — Acceptance criteria

### 3.0 Scope ladder (mọi AC — U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) | Accept/hire UV–YCTD trong member units thuộc token scope | Silent cross-tenant emp |
| **Member CEO** | Chỉ pháp nhân mình; ngoài scope → 404/409 | Thấy hồ sơ đơn vị khác |
| **HRBP** | Narrow membership — **cùng** resolver | Rollup tập đoàn khi không được phép |

**Invariant HIRE-S-SCOPE:** get application **=** accept-offer **=** get employee **=** hire-readiness.

**Prerequisite:** UV gắn YCTD (FR-05a) · application **offer-ready** · persona quyền accept · EFF có đúng **một** active `is_hired_outcome` (catalog) · **không** dùng seed.

### 3.1 Happy path (Diễn biến #1–#2 + Thành công + HTP handoff)

| AC-ID | SRS # | Given | When | Then (measurable — **user sees**) | Evidence |
|-------|-------|-------|------|-------------------------------------|----------|
| **AC-REC-07-01** | #1–#2 | Application offer-ready; chưa có emp link | FE: Tuyển dụng → UV theo YCTD → **Chấp nhận offer** → xác nhận | Network **POST** `/api/hrm/recruitment/applications/:id/accept-offer` **2xx**; FE hiện `employee_id` + hồ sơ **prefilled** (name/email/phone/CT/dept/position từ UV/YCTD — **không** bắt gõ lại); soft stamp; **F5** còn link | Browser + F5 · O1/O3/O4/O7/O12 |
| **AC-REC-07-02** | #2 · O6 | Sau accept 2xx | Stage → hired-outcome | Network **POST** `…/candidates/:id/transitions` **2xx** + `history_id`; Timeline F5 hiện hired-outcome ∈ EFF; **không** stage đổi im lặng chỉ từ accept body | Browser · O6 · REC-05 RETAIN |
| **AC-REC-07-03** | O5 | Cùng application đã hired | Gọi lại Accept / FE bấm lại | **2xx idempotent** cùng `employee_id`; **không** emp thứ hai; toast/state «đã nhận việc» rõ | Browser/API · O5 |
| **AC-REC-07-04** | #3 · O8 | Emp created; chưa có HĐ hiệu lực | Mở hồ sơ + **HTP-05** | `GET …/hire-readiness` → chưa sẵn sàng / blocker `HRM-HTP-NO-ACTIVE-CONTRACT`; UI thông báo rõ — **không** seed HĐ giả | AC-HTP-05-03 · O8 |
| **AC-REC-07-05** | #3–#5 · AC-HTP-05 | Emp + HĐ hiệu lực **cùng** `company_id` (CORE peer) | Mở hồ sơ · F5 · thử readiness | AC-HTP-05-01/02: hồ sơ+HĐ còn sau F5; ngoài scope không thấy; readiness OK khi đủ — **không** claim payroll run | Peer CORE · O8 |
| **AC-REC-07-06** | #6 | Sau hồ sơ | Mở checklist / hoàn thiện (CORE-03) | Handoff CTA/màn peer — **không** invent checklist SoT trong REC | O8 · OUT invent |
| **AC-REC-07-07** | O11 | Accept success | Quan sát event / DENY PAY | `offer.accepted` emitted (L1/log/bus assert khi có); payroll payload → **403** PAY | O11 |
| **AC-REC-07-08** | O12 | Sau accept | Mở lại UV–YCTD + emp detail | DTO display-ready: `employee_id`, prefilled fields, hired stage — FE không suy diễn từ mail outbox | Browser · O12 |

### 3.2 Alternate

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-07-ALT-01** | Đã có soft `employee_id` cùng CT hợp lệ | Accept | **LINK** path — stamp/confirm; **không** create emp mới; stage via APP-02 nếu chưa hired-outcome | O3/O7 |
| **AC-REC-07-ALT-02** | Thiếu optional CORE fields (CCCD…) nhưng đủ name+company | Accept | CREATE status «chờ hoàn thiện»; HCNS bổ sung sau — **không** bắt re-key UV fields | O4 · FR-07 special |
| **AC-REC-07-ALT-03** | Legacy link-only picker | User gắn emp có sẵn (không create) | RETAIN HIRE-400/409; **không** claim FR-07 DONE alone | O3 residual |
| **AC-REC-07-ALT-04** | BH/SI CFG không bắt buộc | Sau hire | Skip SI tạo — handoff only if CFG requires | O8 · SRS #5 «nếu cấu hình» |

### 3.3 Exception

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-07-EX-01** | Application chưa offer-ready | Accept | **400** `HRM-REC-HIRE-OFFER-INVALID`; **không** emp; **không** transition | O2 |
| **AC-REC-07-EX-02** | Offer đã hủy | Accept | **400** CANCELLED/OFFER-INVALID + lý do; **không** emp mới | O2 · SRS special |
| **AC-REC-07-EX-03** | EFF thiếu / invent hired target | Accept + bad transition | **`HRM-REC-STAGE-UNKNOWN`**; không hồ sơ với mã lạ | O6 · SRS special |
| **AC-REC-07-EX-04** | Cross-company emp link | Link/accept mismatch CT | **`HRM-REC-HIRE-409`** / scope; **không** stamp | O7 · U19 |
| **AC-REC-07-EX-05** | Ngoài scope pháp nhân | Accept | 404/409; không leak | U19 · J-04 |
| **AC-REC-07-EX-06** | Client kèm payroll payload | Accept | **`HRM-REC-PAY-403`** | O11 |
| **AC-REC-07-EX-07** | FE/API Nest `/rec/.../accept-offer` như SoT | Mutate | **FAIL O1** nếu dual controller SoT | O1 |
| **AC-REC-07-EX-08** | Empty form bắt nhập lại name/email đã có trên UV | Primary UX | **FAIL O3/O4** / BR-BP-LC-01 | O3/O4 |
| **AC-REC-07-EX-09** | Claim REC-06 mail `offer` = hire DONE | Review | **FAIL O9** · C-SLICE | O9 |
| **AC-REC-07-EX-10** | Pool PATCH hired / Kanban drag hired alone | Claim FR-07 DONE | **FAIL** | O9 |
| **AC-REC-07-EX-11** | Seed hire để pass QA | Evidence | **FAIL U65** | O10 |
| **AC-REC-07-EX-12** | Reopen sealed J-HRM-REC-06-* rewrite | Wave | **FAIL O9** | must_keep |
| **AC-REC-07-EX-13** | True duplicate race (khác emp) | Accept | **409** `HRM-REC-HIRE-DUP` — ≠ idempotent same emp | O5 |

### 3.4 Diễn biến FE (U65 — mẫu nghiệm thu)

```text
#1–#2 Accept offer → tạo hồ sơ không nhập lại
Login HR → Menu Tuyển dụng → Ứng viên → mở UV gắn YCTD (offer-ready)
→ Chấp nhận offer → xác nhận
→ Network POST /api/hrm/recruitment/applications/:id/accept-offer → 2xx
→ FE: hồ sơ NS prefilled (UV+YCTD) · employee_id · không banner lỗi · không bắt gõ lại field đã có
→ Network POST …/candidates/:id/transitions → 2xx + history (hired-outcome ∈ EFF)
→ F5: soft link + Timeline hired còn
→ Assert: không Nest /rec dual · không PAY · không coi mail offer = bước này

#3–#5 HTP / CORE handoff (peer)
→ Mở hồ sơ emp đúng pháp nhân
→ GET …/hire-readiness: thiếu HĐ → blocker rõ (AC-HTP-05-03)
→ (Peer CORE) tạo/gắn HĐ hiệu lực cùng CT → F5 còn (AC-HTP-05-01/02)
→ Checklist CORE-03 handoff — không invent PAY
→ Cấm: seed · reopen J-06/J-STG-05/J-IV/J-CV-04 · honesty flip
```

---

## 4. Validation matrix (VAL-REC-HIRE-*)

| VAL-ID | Rule | Pass | Fail |
|--------|------|------|------|
| **VAL-REC-HIRE-01** | Physical path | Network `/recruitment/` | Nest `/rec` SoT dual |
| **VAL-REC-HIRE-02** | Primary id | `applications/:id/accept-offer` | Dual primary candidates+apps SoT |
| **VAL-REC-HIRE-03** | Offer-ready gate | 400 when not ready | Create without gate |
| **VAL-REC-HIRE-04** | Create+prefill | Fields from UV+YCTD | Empty re-key primary |
| **VAL-REC-HIRE-05** | Soft stamp | Lane A (+ mirror) · no hard FK | Second hire table / hard FK |
| **VAL-REC-HIRE-06** | Idempotent re-accept | 2xx same emp | Second emp silent |
| **VAL-REC-HIRE-07** | Stage writer | APP-02 + history | Accept silent stage |
| **VAL-REC-HIRE-08** | EFF hired-outcome | Target ∈ EFF | STAGE-UNKNOWN bypass |
| **VAL-REC-HIRE-09** | HTP-05 | Blocker without contract | Silent payroll-ready |
| **VAL-REC-HIRE-10** | CORE handoff | Peer contract/SI/checklist | Invent PAY / REC-only rewrite |
| **VAL-REC-HIRE-11** | PAY deny | 403 on payroll payload | 2xx invent payslip |
| **VAL-REC-HIRE-12** | Event | `offer.accepted` | Missing when success (L1) |
| **VAL-REC-HIRE-13** | U19 scope | list=get=accept=emp=HTP | Cross-CT leak |
| **VAL-REC-HIRE-14** | Mail ≠ hire | REC-06 RETAIN | Claim mail offer = FR-07 |
| **VAL-REC-HIRE-15** | Pool/Kanban ≠ DONE | — | Claim drag/PATCH = FR-07 |
| **VAL-REC-HIRE-16** | REC-03 OUT | no Campaign | job_posting hire SoT |
| **VAL-REC-HIRE-17** | Peers RETAIN | 06/05/06a/04 seals | Reopen J-06 rewrite |
| **VAL-REC-HIRE-18** | Honesty | flags false | Flip ready / jd_dynamic |
| **VAL-REC-HIRE-19** | U65 | FE chain only | Seed evidence |
| **VAL-REC-HIRE-20** | Display-ready | BE DTO | FE invent hire aggregate |
| **VAL-REC-HIRE-21** | Cancel after accept | no new emp | Emp created after cancel |
| **VAL-REC-HIRE-22** | Cross-company | HIRE-409 | Stamp wrong CT |
| **VAL-REC-HIRE-23** | Link-only RETAIN | HIRE-400 when missing id | Break link assert on create |
| **VAL-REC-HIRE-24** | ba-data map | Field matrix locked | Code before DATA |

---

## 5. Traceability — UC → BR → partner_req → AC → Journey/UF

| UC | BR | partner_req | Decision | AC (primary) | UF / J-* |
|----|-----|-------------|----------|--------------|----------|
| **UC-BP-REC-07** | BR-BP-LC-01 · BR-BP-ONB-01 (same intent) · BR-REC-HIRE-* · AC-HTP-05 | **REQ_REC_004** | SA Option **A** LOCKED · O1–O12 CONFIRMED | AC-REC-07-01..08 · ALT · EX · VAL-01..24 | **UF-HRM-REC-07** *(DRAFT)* · **J-HRM-REC-07-01..04** (DRAFT) |
| UC-BP-REC-06 | BR-BP-MAIL-01 | — | Peer SEALED `REC06QC1-MSL4CU2G` | Mail ≠ hire | **J-HRM-REC-06-*** RETAIN — **DENY reopen** |
| UC-BP-REC-05 | BR-BP-CV-02 | — | Peer SEALED | Stage via APP-02 only | **J-HRM-REC-STG-05-*** RETAIN |
| UC-BP-REC-06a | BR-BP-REC-IV-* | — | Peer SEALED | — | **J-HRM-REC-IV-*** RETAIN |
| UC-BP-REC-04 | BR-BP-CV-01 | — | Peer SEALED | — | **J-HRM-REC-CV-04-*** RETAIN |
| UC-BP-CORE-03/07/09/10 | — | — | Handoff peers | AC-REC-07-05/06 · HTP | Cite — **OUT invent** |
| UC-BP-REC-03 | — | — | OUT | — | **DENY** |
| UC-BP-REC-00/01/02/08 | — | — | Sealed W1–W5/W3 | — | must_keep |

### Journey placeholders (U19) — DRAFT

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-REC-07-01** | Login HR → Tuyển dụng → UV–YCTD offer-ready → Chấp nhận offer → POST `…/applications/:id/accept-offer` 2xx → prefilled emp · soft stamp → POST transitions hired-outcome 2xx → F5 | AC-REC-07-01/02 · O1/O3/O4/O6/O7 · U65 · no seed · **≠** Nest `/rec` · **≠** mail=hire |
| **J-HRM-REC-07-02** | Re-accept cùng application → 2xx same `employee_id`; true conflict → 409 DUP | AC-REC-07-03 · EX-13 · O5 |
| **J-HRM-REC-07-03** | Sau create chưa HĐ → hire-readiness blocker rõ; sau gắn HĐ cùng CT → AC-HTP-05-01/02 F5 | AC-REC-07-04/05 · O8 · AC-HTP-05 |
| **J-HRM-REC-07-04** | Ngoài scope / cross-CT → 404/409; PAY payload → 403; no Campaign / no reopen J-06 | EX-04/05/06 · O9/O11 · U19 |

**Group CEO:** accept/hire chỉ trong scope rollup; Member/HRBP không thấy ngoài membership.

### UF matrix note

| UF | Status | Relation |
|----|--------|----------|
| **UF-HRM-REC-07** | ⬜ DRAFT | Browser accept+prefill sau DATA+API+Dev |
| **J-HRM-REC-06-01..04** | 🟢 SEALED Wave-8 | **DENY** reopen without regression · **≠** hire |
| **J-HRM-REC-STG-05-01..04** | 🟢 SEALED Wave-7 | **DENY** reopen without regression |
| **J-HRM-REC-IV-*** | 🟢 SEALED Wave-4 | **DENY** reopen without regression |
| **J-HRM-REC-CV-04-01..04** | 🟢 SEALED Wave-6 | **DENY** reopen without regression |
| Sealed W1–W5 UF/J | must_keep | **không** reopen |

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD (`R-PLT-JD-DYNAMIC-DONE-01`) |
| C-SLICE | GWC REC-07 slice ≠ module REC UAT ≠ Phase1 DONE |
| must_keep W1–W3 | HC / YCTD / dashboard |
| must_keep W4 | IV one-active + soft-gate · J-IV-* |
| must_keep W5 | JD `job-templates` |
| must_keep W6 | REC-04 scan/posted · J-CV-04-* |
| must_keep W7 | REC-05 transitions+history · stamp **`REC05QC1-MSL35D49`** · J-STG-05-* |
| must_keep W8 | REC-06 mail+eval · stamp **`REC06QC1-MSL4CU2G`** · J-06-* · **mail ≠ hire** |
| must_keep | UV-YCTD ONE `requisition_id` · CAT STG/EFF `is_hired_outcome` · soft hire-link HIRE-400/409 · HTP-05 · U19 · soft-delete · G-DB-02 no hard FK |
| DENY | Nest `/rec` dual · second hire SoT · PAY invent · pool/Kanban hired alone as FR-07 DONE · REC-03 · seed · honesty flip · invent beyond SRS · apps/** this seat · reopen sealed J-06 · claim REC-06 mail `offer` = F-REC-HIRE-01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — physical UV→EMP field map + soft stamp columns + optional accept-audit (**O4/O7**) · **REQUIRED** |
| **ba-data** | **REQUIRED** |
| **Then** | **sa** — API F.1 **F-REC-HIRE-01** ADD residual physical + mint `HRM-REC-HIRE-*` expand · APP-02/HTP-05/EFF RETAIN · paper `/rec` alias |
| **Does not unlock** | Dev `apps/**` · honesty flips · REC-03 · Nest `/rec` dual · reopen W1–W8 / sealed J-06 · `jd_dynamic_done=true` · `recruitment_uat_ready=true` · PAY |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-ba-01.md` |

### Assumptions

- SA Option A LOCKED; REC-06/05/06a/04 sealed; UV-YCTD LIVE; HTP-05 LIVE.
- Paper `/rec/*` remains alias — no Nest dual.
- Primary accept path = `applications/:id` (YCTD neo).
- Default idempotent = **2xx** same emp; DUP reserved for true conflict.
- Offer-ready default GĐ1 = stage `offer` (or EFF equivalent) until CFG flag named by API.
- BR-BP-LC-01 ≡ intent BR-BP-ONB-01 on SRS header — no third BR invent.

### Dependencies

1. **ba-data** — UV→EMP column map · soft stamp Lane A/B · optional accept audit · **no** second hire SoT · **no** hard FK · **no** PAY columns.
2. **sa** — API F.1 F-REC-HIRE-01 physical · display-ready DTO · mint HIRE-* · U19 parity · wire APP-02 after accept.
3. **Dev-BE/FE** — after DATA + API CONFIRMED only (accept UI + prefill bind + HTP surface).
4. **QA** — U65 J-HRM-REC-07-01..04 · no seed · no reopen sealed J-06 · mail≠hire.
5. **QC** — GWC C-SLICE · honesty false.

### Open / non-blocking

| ID | Note |
|----|------|
| Q-REC-HIRE-OFFER-FLAG | Exact CFG/`allows_accept_offer` vs stage_key=`offer` — API seat names; BA default = offer stage ∈ EFF |
| Q-REC-HIRE-CAND-ALIAS | Thin `candidates/:id/accept-offer` — OK nếu cùng SoT; primary = applications/:id |
| Q-REC-HIRE-STATUS-TOKEN | Exact CORE status token «chờ hoàn thiện» — ba-data/CORE peer |
| Q-REC-HIRE-OFFER-ID | Soft `offer_id` on event — optional if no separate offer table GĐ1 |
| Physical column names | ba-data picks LIVE employees + recruitment_candidates mapping — **ONE** soft link SoT |

---

## completion_report

- **Closed:** O1–O12 CONFIRMED; AC-REC-07-01..08 + ALT + EX; VAL-REC-HIRE-01..24; Diễn biến FE #1–#2 (+ HTP handoff) U65; J-HRM-REC-07-01..04 DRAFT; primary `POST …/applications/:id/accept-offer`; create+prefill no re-key; soft employee_id; APP-02 hired-outcome only; HTP-05 + CORE handoff; idempotent 2xx; mint HIRE-* family; DENY Nest dual / second hire SoT / PAY / mail=hire / pool-Kanban DONE / seed / honesty flip / reopen sealed J-06; must_keep REC-06/05/06a/04/UV/HTP/W1–W5; **O4+O7 → ba-data REQUIRED**; unlock SA API next after DATA.
- **Residual:** ba-data field map physical; sa API F.1 F-REC-HIRE-01; Dev after contracts; QA browser.
- **O1 decision:** Primary FE accept id = **application_id** → `POST …/applications/:id/accept-offer`.
