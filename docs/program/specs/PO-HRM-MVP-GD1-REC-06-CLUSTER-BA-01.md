# BA AC pack — Wave-8 REC cluster · UC-BP-REC-06 (Thư tuyển theo mẫu + đánh giá PV neo UV↔YCTD)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-8 seat **#10**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** until ba-data + SA/API F.1 residual |
| **change_mode** | **ADD** (align SA-01 — **no** wipe paper FR-06 · **no** reopen W1–W7 · **no** redefine 05 / 05a / 06a / 04 / CAT) |
| **uc_ids** | `UC-BP-REC-06` |
| **depends_on** | `PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01` **Option A LOCKED** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-sa-01.md` · Wave-7 REC-05 **SEALED** stamp **`REC05QC1-MSL35D49`** |
| **ref_sa** | `PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01.md` |
| **ref_evidence_sa** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-sa-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01.md` |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-06** · **BR-BP-REC-MAIL-01** / **BR-BP-MAIL-01** · Diễn biến #1–#2 · Thành công · special gửi thất bại / nhiều vòng · peers **06a** / **06b** / **05** / **07** |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` · partner **REQ_REC_004** · WBS-REC-04 |
| **ref_br_depth** | `UC_BR_MATRIX_DEPTH.md` UC-BP-REC-06 · BR-BP-MAIL-01 · status **MISSING** → this pack unlocks BA (not DONE claim) |
| **ref_uv_yctd** | `PO-HRM-REC-UV-YCTD-API-01` · ONE soft FK `requisition_id` · F-REC-UV-YCTD-* · F-REC-CMP-* **RETAIN** |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §2.7 `rec_interview_eval_template` + `rec_interview_evaluation` · §2.9 `rec_mail_outbox` + `rec_mail_log` |
| **ref_api_paper** | **F-REC-MAIL-01** · **F-REC-APP-03** · **F-REC-APP-02** RETAIN · peers F-REC-IV-* · F-REC-HIRE-01 **OUT** — **physical Option A:** `/api/hrm/recruitment/*` · paper `/api/hrm/rec/*` = **alias only** |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **`C-SLICE-≠-MODULE`** · DENY flip |
| **Cấm** | Nest `/rec` dual · second mail/eval SoT · pool `candidates` eval as FR-06 DONE · REC-03 Campaign · Kanban drag `offer` alone as DONE · seed · invent beyond SRS · apps/** · honesty flip · reopen sealed REC-05 J-HRM-REC-STG-05-* / REC-06a J-HRM-REC-IV-* / REC-04 J-HRM-REC-CV-04-* · claim REC-07 hire / 06b matrix = FR-06 DONE |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE mutate (U63/U65)** cho Wave-8 seat #10:

1. **UC-BP-REC-06** — (1) Gửi thư tuyển theo mẫu tenant trên **liên kết UV↔YCTD** → ghi đã gửi + log; (2) Nhập đánh giá **Pass/Fail** (+ nhận xét / đề xuất lương) **neo UV↔YCTD**; (3) Cập nhật pipeline **chỉ** qua sealed F-REC-APP-02 (REC-05).
2. **Option A** — ACCEPT_AS_IS_UPGRADE trên LIVE `candidate_evaluations` + `evaluation_criteria_templates` → **YCTD-bound**; **ADD** one mail outbox + append log; paper `/rec/*` = **alias only**.
3. **Không** claim module REC UAT / flip honesty; **không** reopen REC-05/06a/04 J-* / REC-03 / Nest dual / second SoT.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| Nhân sự tuyển dụng (HR) | Chọn UV trên YCTD → gửi thư mẫu → theo dõi log; mở form đánh giá / chốt Pass/Fail; đề xuất stage sau kết quả |
| Người phỏng vấn | Nhập điểm / Pass/Fail trên đúng vòng PV gắn UV–YCTD |
| Group CEO | Scope rollup — không leak mail/eval ngoài scope |
| Member CEO / HRBP | Chỉ pháp nhân / membership · cùng `resolveHrmListScope` |
| Hệ thống (Nest) | Enqueue+log mail · VAL CC · Pass/Fail · round gate · soft-delete · scope · **không** fake stage khi mail fail |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · AC-REC-06-* · VAL-REC-ME-* · Diễn biến FE #1–#2 · J-HRM-REC-06-* DRAFT | Impl `apps/**` / migration / seed |
| Mail enqueue+log trên YCTD-bound link | Greenfield Nest `/rec/*` SoT · second mail SoT |
| Eval Pass/Fail neo YCTD (UPGRADE LIVE) | Pool `candidates` eval as FR-06 score SoT · second eval SoT |
| Round gate after 06a TERMINAL · stage write via APP-02 only | Redefine REC-05 transitions / 06a one-active / REC-04 scan |
| Cite BR-BP-MAIL-01 CC interviewer · mail fail no fake stage | **UC-BP-REC-03** Campaign / `job_postings` |
| Honesty footer · C-SLICE · **ba-data REQUIRED** note | Flip `jd_dynamic_done` / `recruitment_uat_ready` / Phase1 DONE |
| Template_code CFG (fail_cv \| interview_invite \| offer \| …) | Hardcode body mail · claim template `offer` = F-REC-HIRE-01 |
| | **UC-BP-REC-07** accept-offer / hire (**OUT**) |
| | **UC-BP-REC-06b** compare matrix implement (**OUT** — scores must be YCTD-ready) |
| | CSVC onboard task list (**P2/OUT** — depth matrix residual, not FR-06 MVP blocker) |
| | Claim Kanban drag `offer` / 06a schedule alone = FR-06 DONE |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Physical path | **YES** — FE mail + eval **chỉ** `/api/hrm/recruitment/*` · paper `/api/hrm/rec/applications/{id}/mail` + `/interview-evals` = **alias only** · Network QA assert path chứa `/recruitment/` · **FAIL** nếu Nest dual `/rec/*` SoT |
| **O2** | Eval persist home | **CONFIRMED — UPGRADE** LIVE `candidate_evaluations` (+ `evaluation_criteria_templates`) neo **YCTD-bound**: bắt buộc có `application_id` **và/hoặc** `recruitment_candidate_id` + `company_id` (Lane A link) · optional `interview_id` → `recruitment_interviews` · **DENY** Lane B `public.candidates` làm FR-06 score SoT · paper `rec_interview_evaluation` = **logical alias** · legacy pool-only rows = **read-only / exclude from 06b** (migrate rule ba-data) · **ba-data REQUIRED** |
| **O3** | Mail persist | **CONFIRMED — ADD một** outbox + **một** append log (paper `rec_mail_outbox` / `rec_mail_log`) · status ∈ `queued\|sending\|sent\|failed` · **mọi** attempt (gồm retry) APPEND log · **DENY** dual mail SoT · **ba-data REQUIRED** |
| **O4** | Template SoT | **YES** — Eval: **UPGRADE** `evaluation_criteria_templates` ↔ paper criteria/weight (admin CRUD / picker) · Mail: `template_code` từ tenant CFG catalog (`fail_cv` \| `interview_invite` \| `offer` \| …) — **không** hardcode body · XBOS sync = P2 later · **DENY** second template SoT |
| **O5** | Pass/Fail | **YES** — trên **chốt** submit: `result` ∈ {`pass`,`fail`} **bắt buộc** · draft/`pending` chỉ khi CFG explicit draft · **default: cấm** silent `pending` coi là DONE / 06b-ready · thiếu Pass/Fail → **400** family `HRM-REC-EVAL-*` / `HRM-VAL-400` |
| **O6** | Round gate | **YES** — tạo/chốt eval vòng mới **chỉ** khi lịch ACTIVE trước đó đã **TERMINAL** (`completed`\|`cancelled`\|`no_show`) theo FR-06a / BR-BP-REC-IV-05 — hoặc gắn `interview_id` vòng đã TERMINAL · **DENY** hai ACTIVE · **DENY** eval «DONE» khi còn ACTIVE song song |
| **O7** | Pipeline after result | **YES** — Pass/Fail **có thể đề xuất** stage · **ghi stage chỉ** qua sealed **F-REC-APP-02** (`POST …/candidates/:id/transitions` + history) · **mail fail / mail success alone không** ghi stage · Network: mail ≠ transition; eval chốt → optional transition **2xx** + `history_id` |
| **O8** | Mail CC / fail | **YES** — `template_code=interview_invite` ⇒ `cc_interviewers[]` **required** non-empty (emails hợp lệ) · thiếu → **400** `HRM-REC-MAIL-*` / `HRM-VAL-400` · **không** insert outbox sent · gửi thất bại ⇒ giữ `draft`/`queued`/`failed` + error · **không** đổi stage giả · retry APPEND log |
| **O9** | Peers must_keep | **YES** — RETAIN 05a UV-YCTD · REC-05 transitions/history (`REC05QC1-MSL35D49` · J-STG-05-*) · 06a IV (`REC06AQC2-*` · J-IV-*) · REC-04 scan/posted · CAT STG/EFF · CMP stub · W1–W3 · FR-06 **cite** không redefine · **OUT** REC-03 · REC-07 hire · REC-06b matrix implement · CSVC onboard **P2/OUT** |
| **O10** | Honesty | **YES false** — `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · GWC slice ≠ module REC UAT |
| **O11** | Soft-delete | **YES** — Prefer soft-delete / archive trên eval + outbox · hard DELETE LIVE path = residual fix (**không** expand hard-delete as SoT) |
| **O12** | Display-ready | **YES** — List/detail DTO expose mail `status` + `last_sent_at` / log summary + eval `result` / scores — **cấm** FE aggregate invent SoT |
| **Architecture** | SoT | ONE mail outbox+log · ONE YCTD-bound eval · stage writer = APP-02 only · U19 list=get=mail=eval · soft-delete RETAIN |

### Primary API surface (BA lock — O1)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| Enqueue mail | **`POST /api/hrm/recruitment/candidates/:id/mail`** body `{ template_code, to[], cc_interviewers?, payload? }` — **primary** (Lane A YCTD-bound `candidate_id`, cùng id family REC-05) | `POST /api/hrm/rec/applications/{id}/mail` |
| Thin alternate mail | `POST …/applications/:id/mail` — **chỉ** nếu cùng YCTD-bound SoT + cùng VAL/log | — |
| Outbox / log read | `GET …/candidates/:id/mail` **or** `…/mail-outbox/:id` + log — ba-data/API seat names | `/rec/…` |
| Eval submit (chốt) | **`POST /api/hrm/recruitment/candidate-evaluations`** (UPGRADE home) **or** `POST …/applications/:id/interview-evals` — **cùng ONE SoT**; body có neo YCTD + `result` pass\|fail | `POST /api/hrm/rec/applications/{id}/interview-evals` |
| Eval list/get | `GET …/candidate-evaluations*` (filter by `recruitment_candidate_id` / `application_id` / YCTD) | `/rec/…` |
| Eval templates | `GET/POST …/evaluation-criteria-templates*` **UPGRADE** | paper template |
| Stage after result | **`POST …/candidates/:id/transitions`** (**RETAIN** REC-05) | `/rec/…/transitions` |
| IV schedule | `/recruitment/interviews*` | **RETAIN** 06a — **không** reopen |

**Invariant MAIL-LOG:** mỗi enqueue/retry attempt **2xx hoặc failed persist** ⇒ ≥1 `rec_mail_log` row · success without log = **FAIL** FR-06 / BR-BP-MAIL-01.

**Invariant EVAL-YCTD:** mỗi eval **chốt 2xx** ⇒ neo YCTD-bound (`application_id` và/hoặc `recruitment_candidate_id`) + `result` ∈ {pass,fail} · pool-only candidate_id = **FAIL O2**.

**Invariant STAGE-APP-02:** pipeline stage change sau FR-06 **chỉ** qua transitions · mail endpoint **không** mutate stage.

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-8 · Option A) |
|---|----------------------|---------------------------|
| Mail outbox/log | **ABSENT** | **ADD** one outbox + append log (**O3**) |
| Mail CC invite | Absent | **UNLOCK** VAL (**O8**) |
| Mail fail → stage | N/A | **DENY** fake stage (**O7/O8**) |
| Eval tables | `candidate_evaluations` JOIN Lane B `candidates` · `pending` default · hard DELETE | **UPGRADE** YCTD home · Pass\|Fail chốt · soft-delete prefer (**O2/O5/O11**) |
| Eval templates | `evaluation_criteria_templates` | **UPGRADE** map paper (**O4**) |
| Round / IV | 06a SEALED · weak eval gate | **UNLOCK** gate after TERMINAL (**O6**) |
| Pipeline after eval | Not wired | **UNLOCK** via **RETAIN** APP-02 only (**O7**) |
| REC-05 / 06a / 04 | SEALED | **RETAIN must_keep** (**O9**) |
| REC-03 / hire / 06b | OUT / peer | **OUT** this seat |
| Paper `/rec/*` | Naming | **Alias only** (**O1**) |
| Honesty | W1–W7 C-SLICE | **false** · C-SLICE (**O10**) |

### Mail dictionary (BA lock = O3 — ba-data physicalizes)

| Column (logical) | Rule |
|------------------|------|
| Outbox `id` | uuid PK · API `outbox_id` |
| `company_id` | NOT NULL · U19 |
| `recruitment_candidate_id` | Preferred FK → Lane A when using candidate mail path (ba-data) |
| `application_id` | Soft FK nullable — paper primary; map to YCTD link |
| `requisition_id` / YCTD context | Optional context (paper `recruitment_request_id`) |
| `template_code` | NOT NULL · CFG catalog |
| `to_emails_json` / `cc_emails_json` | CC **required** when `interview_invite` |
| `status` | queued\|sending\|sent\|failed |
| `queued_at` / `sent_at` / `error_message` | Display-ready (**O12**) |
| Log `attempt_no` + `result` | APPEND every attempt · **no** overwrite wipe |

### Eval dictionary (BA lock = O2 — ba-data physicalizes)

| Column (logical) | Rule |
|------------------|------|
| `id` | uuid PK |
| `recruitment_candidate_id` | FK → Lane A when present — **preferred with application_id** |
| `application_id` | FK soft → N–N application khi tồn tại (paper NOT NULL = logical) |
| `company_id` | Scope persist |
| `template_id` | FK criteria template |
| `interview_id` | Optional FK → `recruitment_interviews` (round) |
| `scores_json` | Criteria scores |
| `result` | **pass\|fail** on chốt (**O5**) |
| `salary_recommendation` | Optional numeric (SRS «đề xuất lương») |
| `evaluated_at` | timestamptz |
| Legacy pool-only rows | Read-only / exclude 06b until migrate |

---

## 2. Business rules (normative — SRS + SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-MAIL-01** / **BR-BP-REC-MAIL-01** | Gửi lịch PV / `interview_invite` | Bắt buộc CC interviewer + log mọi lần gửi | Thiếu CC → chặn; không silent send |
| **BR-BP-REC-IV-05** cite | Nhiều vòng PV | Mỗi vòng một bản đánh giá; vòng sau sau TERMINAL | Song song 2 ACTIVE = **FAIL O6** |
| **BR-REC-ME-PATH** | Mail / eval FR-06 | Physical `/recruitment/*` | Nest `/rec` dual = **FAIL O1** |
| **BR-REC-ME-EVAL-HOME** | Score SoT | YCTD-bound link | Pool `candidates` sole = **FAIL O2** |
| **BR-REC-ME-MAIL-ONE** | Mail SoT | Exactly one outbox + one log | Dual mail = **FAIL O3** |
| **BR-REC-ME-EVAL-ONE** | Eval SoT | UPGRADE LIVE — no second table | Second eval SoT = **FAIL** |
| **BR-REC-ME-PASSFAIL** | Chốt đánh giá | `result` pass\|fail required | Free-text-only / silent pending DONE = **FAIL O5** |
| **BR-REC-ME-ROUND** | New eval round | Prior IV TERMINAL or linked TERMINAL interview | Eval while ACTIVE parallel = **FAIL O6** |
| **BR-REC-ME-STAGE** | Pipeline update | Only F-REC-APP-02 | Mail/eval endpoint writes stage = **FAIL O7** |
| **BR-REC-ME-FAIL-NO-FAKE** | Mail send fail | Retain draft/queued/failed + error | Fake stage flip = **FAIL O8** |
| **BR-REC-ME-LOG** | Every send/retry | APPEND log | Success without log = **FAIL** |
| **BR-REC-ME-TEMPLATE** | Mail body / eval criteria | Tenant CFG / templates | Hardcode body / invent second SoT = **FAIL O4** |
| **BR-REC-ME-SCOPE** | list = get = mail = eval | `resolveHrmListScope` | U19 parity |
| **BR-REC-ME-SOFTDEL** | Delete eval/outbox | Soft/archive prefer | Hard-delete as SoT = **FAIL O11** |
| **BR-REC-ME-DISPLAY** | FE bind | BE display-ready | FE invent mail/eval aggregate = **FAIL O12** |
| **BR-REC-ME-NO-CAMPAIGN** | Pipeline | Trong UV–YCTD | REC-03 / Campaign SoT = **FAIL** |
| **BR-REC-ME-NO-HIRE** | Template `offer` | Mail only | Claim hire / F-REC-HIRE-01 = **FAIL** · **OUT** REC-07 |
| **BR-REC-ME-NO-06B** | Compare matrix | Peer OUT | Implement 06b this seat = **FAIL O9** |
| **BR-REC-ME-NO-SEED** | Nghiệm thu | Chuỗi FE only | Seed = **FAIL U65** |
| **BR-REC-ME-HONESTY** | Sau GWC | Flags false | Flip ready / jd_dynamic = **FAIL O10** |
| **BR-REC-ME-PEER** | REC-05 / 06a / 04 / UV / CAT / W1–W3 | RETAIN | Reopen sealed J-* without regression = **FAIL O9** |
| **BR-REC-ME-POOL-≠-DONE** | Pool eval / Kanban `offer` | Not FR-06 SoT | Claim DONE = **FAIL** |

### Error taxonomy (BA / QA assert — mint codes in API seat)

| Code family | HTTP | UX intent (VI) | ≠ |
|-------------|------|----------------|--|
| **`HRM-REC-MAIL-*`** *(mint)* | 400 | Thiếu CC interviewer / template inactive / enqueue fail | Stage UNKNOWN |
| **`HRM-VAL-400`** | 400 | Paper alias thiếu interviewer email | — |
| **`HRM-REC-EVAL-*`** *(EXPAND)* | 400/404 | Thiếu Pass/Fail · wrong home · round gate · not found | MAIL |
| **`HRM-REC-EVAL-ROUND-GATE`** *(mint · optional)* | 400 | Eval khi còn ACTIVE / chưa TERMINAL | IV-409 |
| `HRM-REC-STAGE-*` | 400 | Stage invent / reject / reverse (**RETAIN** REC-05) | Mail/Eval |
| `HRM-REC-IV-409-ACTIVE` / `IV-400-STAGE-DISALLOW` | 409/400 | IV gates (**RETAIN** 06a) | Round-gate eval |
| `HRM-REC-UV-YCTD-*` | 4xx | Attach / receivable (**RETAIN**) | — |
| `HRM-REC-CV-SCAN-*` | 4xx | Scan/posted (**RETAIN**) | — |
| Scope mismatch | 409/404 | Ngoài phạm vi pháp nhân | — |

---

## 3. UC-BP-REC-06 — Acceptance criteria

### 3.0 Scope ladder (mọi AC — U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) | Mail/eval UV–YCTD trong member units thuộc token scope | Silent cross-tenant mail/eval |
| **Member CEO** | Chỉ pháp nhân mình; ngoài scope → 404/409 | Thấy mail/eval đơn vị khác |
| **HRBP** | Narrow membership — **cùng** resolver | Rollup tập đoàn khi không được phép |

**Invariant ME-S-SCOPE:** list candidates **=** get-by-id **=** mail enqueue/log **=** eval list/submit.

**Prerequisite:** UV đã gắn ≥1 YCTD (FR-UC-BP-REC-05a) · YCTD in-scope · có mẫu thư tenant (CFG) · persona có quyền gửi thư / đánh giá · (cho eval vòng) lịch 06a TERMINAL khi yêu cầu round gate.

### 3.1 Happy path (Diễn biến #1–#2 + Thành công)

| AC-ID | SRS # | Given | When | Then (measurable — **user sees**) | Evidence |
|-------|-------|-------|------|-------------------------------------|----------|
| **AC-REC-06-01** | #1 | UV gắn YCTD; mẫu `fail_cv`\|`offer` (không bắt buộc CC); persona in-scope | FE: Tuyển dụng → Ứng viên → mở UV theo YCTD → **Gửi thư** → chọn mẫu hiệu lực → Lưu/Gửi | Network **POST** `/api/hrm/recruitment/candidates/:id/mail` **2xx**; FE hiện đã gửi / xếp hàng + thời điểm; **F5** còn outbox status; ≥1 log attempt | Browser + F5 · O1/O3/O12 |
| **AC-REC-06-02** | #1 · BR-MAIL | Mẫu `interview_invite`; có ≥1 interviewer email | Gửi thư + CC interviewer | **2xx**; `cc_interviewers` persist; log có attempt; **F5** còn | Browser · O8 |
| **AC-REC-06-03** | #2 | UV–YCTD; vòng PV đã TERMINAL (06a) hoặc không cần IV cho fail_cv-only path; template eval EFF | Người PV / HR mở **Đánh giá** → nhập điểm + **Pass hoặc Fail** (+ nhận xét / đề xuất lương optional) → **Chốt** | Network **POST** candidate-evaluations **or** `…/interview-evals` **2xx**; FE hiện Pass/Fail; neo YCTD; **F5** còn; **không** chỉ `pending` | Browser · O2/O5/O6 |
| **AC-REC-06-04** | Thành công / #4 | Sau eval Pass (hoặc Fail) cần đổi stage | FE đề xuất / chọn stage ∈ EFF → **Lưu trạng thái** | Network **POST** `…/candidates/:id/transitions` **2xx** + history; Timeline F5 còn; **không** stage đổi từ mail endpoint | Browser · O7 · REC-05 RETAIN |
| **AC-REC-06-05** | #2 · 06b prep | Eval chốt Pass/Fail trên link YCTD A | Quan sát dữ liệu so sánh (đọc) | Điểm gắn đúng YCTD A; sẵn sàng làm đầu vào FR-06b (**không** implement matrix UI) | Cite O9 · no 06b UI |
| **AC-REC-06-06** | BR-IV-05 | Vòng 1 TERMINAL; tạo lịch vòng 2 ACTIVE rồi TERMINAL | Chốt eval vòng 2 | Eval mới lưu; mỗi vòng ≤1 bản đánh giá chốt; không song song 2 ACTIVE | Browser · O6 |
| **AC-REC-06-07** | O4 | Admin có quyền CFG template | CRUD/picker mẫu thư + mẫu đánh giá (tenant) | Picker không hardcode body; inactive template không gửi được (400) | CFG · O4 |
| **AC-REC-06-08** | O12 | Sau mail+eval | Mở lại hồ sơ UV–YCTD | DTO display-ready: mail status/last_sent · eval result/scores — FE không suy diễn SoT | Browser |

### 3.2 Alternate

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-06-ALT-01** | CFG cho phép draft eval | Lưu nháp không chốt | `pending`/draft **không** = DONE; 06b không tiêu thụ như đã đánh giá | O5 |
| **AC-REC-06-ALT-02** | Mail `queued` (async) | Quan sát sau gửi | FE hiện xếp hàng; sau worker → `sent` + log; **F5** cập nhật | O3 |
| **AC-REC-06-ALT-03** | Retry sau `failed` | Gửi lại | Status cập nhật; **append** log attempt mới (không xóa log cũ) | O3/O8 |
| **AC-REC-06-ALT-04** | Eval Fail + đề xuất loại | Chốt Fail → transition reject class + lý do (REC-05) | Stage chỉ qua APP-02; history note khi reject | O7 · REC-05 O5 cite |

### 3.3 Exception

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-06-EX-01** | `interview_invite` thiếu CC / email trống | Gửi | **400** MAIL/VAL; **không** outbox `sent`; stage **không** đổi; toast VI | O8 · BR-BP-MAIL-01 |
| **AC-REC-06-EX-02** | Provider/send fail | Gửi / worker fail | `failed` + error; giữ nháp/queued; **không** fake stage interview/offer; log failed | SRS special · O7/O8 |
| **AC-REC-06-EX-03** | Chốt eval thiếu Pass/Fail | Submit | **400** EVAL/VAL; **F5** không có result DONE | O5 |
| **AC-REC-06-EX-04** | Còn ACTIVE interview (06a) | Tạo/chốt eval vòng mới không gắn TERMINAL | **400** ROUND-GATE (hoặc tương đương); **không** silent | O6 |
| **AC-REC-06-EX-05** | FE/API gọi Nest `/rec/.../mail` như SoT | Mutate | **FAIL O1** nếu dual controller SoT (alias-only OK nếu cùng physical) | O1 |
| **AC-REC-06-EX-06** | Eval chỉ `candidate_id` pool Lane B | Submit như FR-06 | **FAIL O2** — phải neo YCTD | O2 |
| **AC-REC-06-EX-07** | Mail 2xx nhưng stage tự nhảy | Quan sát Network + timeline | **FAIL O7** nếu không có transitions riêng | O7 |
| **AC-REC-06-EX-08** | Ngoài scope pháp nhân | Mail/eval | 404/409; không leak | U19 |
| **AC-REC-06-EX-09** | Seed mail/eval để pass QA | Evidence | **FAIL U65** | O10 |
| **AC-REC-06-EX-10** | Claim pool eval / Kanban `offer` = FR-06 DONE | Review | **FAIL** · C-SLICE | O9 |

### 3.4 Diễn biến FE (U65 — mẫu nghiệm thu)

```text
#1 Gửi thư theo mẫu
Login HR → Menu Tuyển dụng → Ứng viên → mở UV gắn YCTD
→ Gửi thư → chọn mẫu hiệu lực (fail_cv | interview_invite | offer | …)
→ (invite) nhập/ chọn CC interviewer → Gửi
→ Network POST /api/hrm/recruitment/candidates/:id/mail → 2xx
→ FE: đã gửi/xếp hàng + thời điểm · không banner lỗi
→ F5: outbox status + log còn
→ Assert: không POST transitions từ bước mail; stage không đổi giả khi fail

#2 Đánh giá Pass/Fail neo UV↔YCTD
(Prereq vòng: IV TERMINAL theo 06a khi đánh giá theo vòng)
→ Đánh giá → chọn mẫu tiêu chí → nhập điểm → chọn Pass|Fail → Chốt
→ Network POST …/candidate-evaluations (hoặc …/interview-evals) → 2xx
→ FE: Pass/Fail hiện · neo đúng YCTD
→ F5: còn
→ (Thành công pipeline) Đổi trạng thái qua picker EFF → POST …/transitions 2xx + Timeline F5
→ Cấm: seed · Nest /rec dual · Campaign · reopen J-STG-05 / J-IV / J-CV-04
```

---

## 4. Validation matrix (VAL-REC-ME-*)

| VAL-ID | Rule | Pass | Fail |
|--------|------|------|------|
| **VAL-REC-ME-01** | Physical path | Network `/recruitment/` | Nest `/rec` SoT dual |
| **VAL-REC-ME-02** | Eval YCTD home | `application_id` and/or `recruitment_candidate_id` | Pool-only SoT |
| **VAL-REC-ME-03** | One mail outbox+log | Single SoT + append log | Dual mail / no log |
| **VAL-REC-ME-04** | One eval SoT | UPGRADE LIVE | Second eval table SoT |
| **VAL-REC-ME-05** | Template CFG | `template_code` + criteria picker | Hardcode body |
| **VAL-REC-ME-06** | Pass\|Fail chốt | required | Silent pending DONE |
| **VAL-REC-ME-07** | Round gate | After 06a TERMINAL | Eval + ACTIVE parallel |
| **VAL-REC-ME-08** | Stage writer | APP-02 only | Mail writes stage |
| **VAL-REC-ME-09** | interview_invite CC | required | 200 without CC |
| **VAL-REC-ME-10** | Mail fail | no fake stage | Stage flips on fail |
| **VAL-REC-ME-11** | Soft-delete prefer | archive/soft | Hard-delete SoT expand |
| **VAL-REC-ME-12** | Display-ready | BE DTO | FE invent aggregate |
| **VAL-REC-ME-13** | U19 scope | list=get=mail=eval | Cross-CT leak |
| **VAL-REC-ME-14** | REC-03 OUT | no Campaign SoT | job_posting mail/eval SoT |
| **VAL-REC-ME-15** | REC-07 OUT | template offer ≠ hire | F-REC-HIRE this seat |
| **VAL-REC-ME-16** | 06b OUT | scores ready only | Compare UI this seat |
| **VAL-REC-ME-17** | Peers RETAIN | 05/06a/04 seals | Reopen J-* rewrite |
| **VAL-REC-ME-18** | Honesty | flags false | Flip ready / jd_dynamic |
| **VAL-REC-ME-19** | U65 | FE chain only | Seed evidence |
| **VAL-REC-ME-20** | Pool ≠ DONE | — | Claim pool eval = FR-06 |
| **VAL-REC-ME-21** | Kanban offer ≠ DONE | — | Drag offer = FR-06 DONE |
| **VAL-REC-ME-22** | Log every attempt | retry appends | Overwrite wipe log |
| **VAL-REC-ME-23** | Salary proposal | optional on chốt | Required always (not SRS) |
| **VAL-REC-ME-24** | CSVC onboard | P2/OUT | Block FR-06 MVP unlock |

---

## 5. Traceability — UC → BR → partner_req → AC → Journey/UF

| UC | BR | partner_req | Decision | AC (primary) | UF / J-* |
|----|-----|-------------|----------|--------------|----------|
| **UC-BP-REC-06** | BR-BP-MAIL-01 · BR-BP-REC-MAIL-01 · BR-REC-ME-* · BR-BP-REC-IV-05 cite | **REQ_REC_004** | SA Option **A** LOCKED · O1–O12 CONFIRMED | AC-REC-06-01..08 · ALT · EX · VAL-01..24 | **UF-HRM-REC-06** *(DRAFT)* · **J-HRM-REC-06-01..04** (DRAFT) |
| UC-BP-REC-06a | BR-BP-REC-IV-* | — | Peer SEALED | Cite round TERMINAL | **J-HRM-REC-IV-*** RETAIN — **DENY reopen** |
| UC-BP-REC-05 | BR-BP-CV-02 | — | Peer SEALED `REC05QC1-MSL35D49` | Stage via APP-02 only | **J-HRM-REC-STG-05-*** RETAIN — **DENY reopen** |
| UC-BP-REC-04 | BR-BP-CV-01 | — | Peer SEALED | — | **J-HRM-REC-CV-04-*** RETAIN |
| UC-BP-REC-06b | — | — | OUT this seat | Scores ready cite | — |
| UC-BP-REC-07 | BR-BP-LC-01 | — | OUT this seat | — | — |
| UC-BP-REC-03 | — | — | OUT | — | **DENY** |
| UC-BP-REC-00/01/02/08 | — | — | Sealed W1–W5/W3 | — | must_keep |

### Journey placeholders (U19) — DRAFT

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-REC-06-01** | Login HR → Tuyển dụng → UV theo YCTD → Gửi thư mẫu → POST `…/candidates/:id/mail` 2xx → F5 outbox+log | AC-REC-06-01 · O1/O3 · U65 · no seed |
| **J-HRM-REC-06-02** | `interview_invite` + CC → 2xx; thiếu CC → 400; send fail → failed + **không** đổi stage / **không** transitions giả | AC-REC-06-02 · EX-01/02 · O7/O8 · BR-BP-MAIL-01 |
| **J-HRM-REC-06-03** | IV TERMINAL → Đánh giá Pass/Fail chốt → POST eval 2xx → F5 neo YCTD; thiếu Pass/Fail → 400; pool-only → FAIL | AC-REC-06-03 · EX-03/06 · O2/O5/O6 |
| **J-HRM-REC-06-04** | Sau eval → POST transitions 2xx + Timeline F5; mail không ghi stage; no Campaign / Nest `/rec`; no reopen J-STG-05 / J-IV / J-CV-04 | AC-REC-06-04 · EX-05/07 · O7/O9 |

**Group CEO:** mail/eval chỉ trong scope rollup; Member/HRBP không thấy ngoài membership.

### UF matrix note

| UF | Status | Relation |
|----|--------|----------|
| **UF-HRM-REC-06** | ⬜ DRAFT | Browser mail + eval sau DATA+API+Dev |
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
| C-SLICE | GWC REC-06 slice ≠ module REC UAT ≠ Phase1 DONE |
| must_keep W1–W3 | HC / YCTD / dashboard |
| must_keep W4 | IV one-active + soft-gate · J-IV-* |
| must_keep W5 | JD `job-templates` |
| must_keep W6 | REC-04 scan/posted · J-CV-04-* |
| must_keep W7 | REC-05 transitions+history · stamp **`REC05QC1-MSL35D49`** · J-STG-05-* |
| must_keep | UV-YCTD ONE `requisition_id` · CAT STG/EFF · U19 · soft-delete · LIVE eval route family as upgrade base |
| DENY | Nest `/rec` dual · second mail/eval SoT · pool eval as FR-06 DONE · REC-03 · seed · honesty flip · invent beyond SRS · apps/** this seat · reopen sealed J-* · REC-07 hire · 06b matrix · claim Kanban offer = DONE |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — physical ADD mail outbox+log + eval FK/home migrate + soft-delete (**O2/O3/O11**) |
| **ba-data** | **REQUIRED** |
| **Then** | **sa** — API F.1 **F-REC-MAIL-01** ADD + **F-REC-APP-03** UPGRADE + mint `HRM-REC-MAIL-*` / `HRM-REC-EVAL-*` residual · paper `/rec` alias · APP-02 RETAIN |
| **Does not unlock** | Dev `apps/**` · honesty flips · REC-03 · Nest `/rec` dual · reopen W1–W7 / sealed J-* · REC-07 · `jd_dynamic_done=true` · `recruitment_uat_ready=true` |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-ba-01.md` |

### Assumptions

- SA Option A LOCKED; REC-05 / 06a / 04 sealed; UV-YCTD LIVE.
- Paper `/rec/*` remains alias — no Nest dual.
- Default: no silent pending as DONE; interview_invite CC required; stage only APP-02.
- CSVC onboard = P2/OUT — does not block DATA/API unlock.
- Primary mail path = Lane A `candidates/:id/mail` (align REC-05 id family).

### Dependencies

1. **ba-data** — ONE outbox + ONE log physical · UPGRADE eval columns/FK YCTD · migrate legacy pool-only · soft-delete/archive · **no** second SoT · **no** Campaign tables.
2. **sa** — API F.1 F-REC-MAIL-01 ADD · F-REC-APP-03 UPGRADE · display-ready DTO · mint MAIL/EVAL codes · U19 parity.
3. **Dev-BE/FE** — after DATA + API CONFIRMED only (residual mail UI + eval Pass/Fail + wire optional transition).
4. **QA** — U65 J-HRM-REC-06-01..04 · no seed · no reopen sealed J-*.
5. **QC** — GWC C-SLICE · honesty false.

### Open / non-blocking

| ID | Note |
|----|------|
| Q-REC-ME-MAIL-ALT | `applications/:id/mail` alternate — OK nếu cùng SoT; primary = candidates/:id |
| Q-REC-ME-EVAL-PATH | Prefer UPGRADE `candidate-evaluations*` vs expose `interview-evals` alias — API seat picks ONE physical primary |
| Q-REC-ME-DRAFT-CFG | Exact CFG key cho phép draft eval — API/CFG seat |
| Q-REC-ME-CSVC | Onboard CSVC task — P2/OUT peer depth matrix |
| Physical table names | ba-data picks `rec_mail_*` vs LIVE-aligned names — **ONE** outbox+log SoT |

---

## completion_report

- **Closed:** O1–O12 CONFIRMED; AC-REC-06-01..08 + ALT + EX; VAL-REC-ME-01..24; Diễn biến FE #1–#2 U65; J-HRM-REC-06-01..04 DRAFT; mail ADD outbox+log; eval UPGRADE YCTD-bound Pass/Fail; CC interviewer; mail fail no fake stage; round after 06a TERMINAL; stage chỉ APP-02; DENY Nest dual / second SoT / pool-as-DONE / Campaign / seed / honesty flip / reopen sealed J-*; must_keep REC-05/06a/04/UV/W1–W5; **O2+O3 → ba-data REQUIRED**; unlock SA API next after DATA.
- **Residual:** ba-data physical mail+eval FK; sa API F.1 F-REC-MAIL-01 + F-REC-APP-03; Dev after contracts; QA browser.
- **O1 decision:** Primary FE mail id = Lane A `candidate_id` → `POST …/candidates/:id/mail`.
