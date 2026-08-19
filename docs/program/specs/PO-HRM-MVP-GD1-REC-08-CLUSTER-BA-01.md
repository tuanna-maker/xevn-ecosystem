# BA AC pack — Wave-3 REC cluster · UC-BP-REC-08 (Dashboard «bao giờ đủ người»)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O10 **CONFIRMED** · Dev **HOLD** until SA API F.1 DOC-DELTA |
| **change_mode** | **ADD** (align SA-01 — **no** wipe paper FR) |
| **uc_ids** | `UC-BP-REC-08` |
| **depends_on** | `PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01` **Option A LOCKED** · D-S1..D-S10 · F-REC-DASH-01/02 |
| **ref_sa** | `PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01.md` |
| **ref_evidence_sa** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-sa-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md` (AC / O-numbering / VAL / Diễn biến) |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-08** |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` **WBS-REC-06** |
| **ref_partner** | **REQ_REC_005** |
| **ref_api_paper** | Logical F-REC-DASH-01 · **physical Option A:** `/api/hrm/recruitment/dashboard*` · paper `/api/hrm/rec/dashboard` = **alias only** |
| **ref_spine** | REC-01 cells **RETAIN** (KH) · REC-02 YCTD **RETAIN** (TT/funnel/drill) |
| **Honesty** | `recruitment_uat_ready=false` · **`C-SLICE-≠-MODULE`** · DENY flip module REC UAT / product_go |
| **Cấm** | REC-03 / Campaign drill · Nest `/rec` dual · FE domain aggregate · seed · Option B materialize · reopen REC-02 seals · invent VND cost · apps/** |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE đọc (U63/U65)** cho Wave-3:

1. **UC-BP-REC-08** — Bảng điều khiển / báo cáo tuyển: KH (định biên Cần tuyển đã duyệt) vs TT (pipeline / onboard gắn YCTD); funnel; % hoàn thành; câu trả lời «bao giờ đủ người»; khoan **YCTD** (MVP).
2. **Owner công thức = Nest** (Option A on-the-fly) — FE **chỉ bind** display-ready DTO; **cấm** join plans+YCTD+candidates/`job_postings` để bịa KH/TT/%.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| Trưởng tuyển dụng / TP TD | Đọc dashboard; lọc kỳ × đơn vị; khoan YCTD |
| BGĐ / Group CEO | Rollup `company_id=main` theo scope U19 |
| Member CEO | Chỉ pháp nhân mình |
| HRBP | Scope membership hẹp — cùng resolver list plans/YCTD |
| Hệ thống (Nest) | Aggregate read-only; `resolveHrmListScope`; omit C&B |

### Scope

| In (this seat) | Out |
|----------------|-----|
| AC-REC-08-01..10 · VAL-REC-DASH-* · BR formulas · Diễn biến FE load/filter/drill · J-* DRAFT | Impl `apps/**` / migration / seed |
| O1–O10 CONFIRM · D-S1..D-S10 cite · F-REC-DASH-01/02 unlock | **UC-BP-REC-03** Campaign drill (**DENY**) |
| Reports tab **align** same contract (O8) | Cost chart invent VND (**O10 OUT**) |
| | Claim `recruitment_uat_ready` / module REC UAT |
| | Option B materialized rollup (**HOLD P2**) |
| | Reopen REC-01/02 seals / dual `rec_headcount_*` |
| **ba-data physical** | **NOT required** this wave (read-only; no new SoT table) |

### SA Option A — BA CONFIRM (đóng O1–O10)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Physical path | **Physical prefer** `GET /api/hrm/recruitment/dashboard` (+ drill `…/dashboard/yctd` **or** `?include=yctd`) · paper `GET /api/hrm/rec/dashboard` = **alias only** · **DENY** Nest greenfield dual `/rec` controller as second SoT · **DENY** Option B write rollup table MVP |
| **O2** | Cells enter KH (`planned_need`) | Plan **`approved`** (sealed REC-01 status) **AND** cell `lifecycle_status=need_hire_approved` **AND** `need_hire ≥ 1` **AND** month ∈ kỳ lọc · **EXCLUDE** cell còn `need_hire` (chưa duyệt ô) dù plan approved · **EXCLUDE** `need_hire=0` · **KH SoT ≠** `job_postings` |
| **O3** | filled / TT | `filled_count` = số ứng viên/application **gắn `requisition_id`** trong scope có outcome map bucket **`onboard`** (synonym catalog `hired`→onboard nếu catalog map) · `in_pipeline_count` = stage **không** terminal reject **và chưa** onboard · KPI tuyển **dừng tại onboard** · nghỉ thử việc / exit sau onboard **không** tự trừ KPI trừ khi tenant CFG riêng (SRS special — default **không trừ**) |
| **O4** | Funnel keys | Canonical buckets **bắt buộc có mặt**: `cv` · `screening` · `interview` · `offer` · `onboard` · map từ **effective pipeline-stage catalog** (label VI display-ready) · stage thiếu / không map → count **0** · **cấm** hardcode English-only làm SoT UX · **cấm** bỏ bucket |
| **O5** | ETA «bao giờ đủ» | `enough_people_eta` = **earliest** `target_month` (`yyyy-MM`) trong các YCTD **mở** (receivable/`open_for_hire` hoặc đang tiến trình chưa closed) có `remaining = max(headcount − filled_on_yctd, 0) > 0` · kèm `enough_people_eta_label` VI · ownership **BE only** |
| **O6** | out_of_plan YCTD | **Include** TT / funnel / drill với `headcount_mode=out_of_plan` flag · **không** cộng vào `planned_need` (KH chỉ từ cells) · filled out_of_plan **được** tính vào `filled_count` / gap org-level |
| **O7** | Legacy `headcount_mode` NULL | Drill **đọc được** + cờ/warn classify (cite REC-02 O4) · **không** gán credit lấp ô **in_plan** (cell-level) khi chưa classify · vẫn được đếm TT/funnel org-level nếu có ứng viên gắn YCTD · **cấm** im lặng coi legacy = in_plan |
| **O8** | Reports tab | **ALIGN** — cùng Nest dashboard contract hoặc **subset field documented** · **cấm** công thức thứ hai (`buildRecruitmentReportFromApi` invent %/KH) |
| **O9** | ETA / % null | `planned_need=0` → `completion_pct=null` + `enough_people_status=no_plan` (hoặc empty_guide) — **cấm** bịa 0%/100% · không YCTD mở còn gap → `enough_people_eta=null` + label VI «Chưa xác định…» · `gap_count=0` & `planned_need>0` → status `enough` · eta có thể null |
| **O10** | Cost charts | **OUT** — **omit** / ẩn cost · **cấm** invent VND / offer salary / C&B trên Dashboard & Reports recruitment surface này |
| **Architecture** | SoT | Nest RecruitmentDashboardService read-only · sources = sealed plans cells + requisitions + apps · FE display-only · U19 `resolveHrmListScope` |

---

## 1. As-is vs to-be

| | AS-IS (LIVE + paper) | TO-BE (Wave-3 · Option A) |
|---|----------------------|---------------------------|
| KH | FE sum `job_postings` / không đọc cells | Nest Σ `need_hire` cells **O2** |
| TT / funnel | FE join candidates + apps + postings | Nest counts by YCTD + stage catalog **O3/O4** |
| % / gap / ETA | FE divide / stub | **BE only** display-ready |
| Nest API | ABSENT `/rec/dashboard` | **ADD** physical `/recruitment/dashboard*` |
| Reports | FE aggregate candidates | **Same** contract / subset **O8** |
| Drill | Campaign / posting-centric risk | **YCTD** only MVP **D-S10** |
| Cost | Stubs invent VND | **OUT O10** |
| Honesty | Slice risk | `recruitment_uat_ready=false` · **C-SLICE** |

---

## 2. Business rules (normative — từ SRS/SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-HC-01** | Đọc KH tuyển | Lấy từ định biên đã duyệt (ô Cần tuyển) | Không nhập tay trên dashboard |
| **BR-REC-08-KH-CELL** | Cell vào `planned_need` | **O2** only | Draft / chưa `need_hire_approved` → **không** cộng KH |
| **BR-REC-08-TT-YCTD** | Đếm TT / funnel | Gắn `requisition_id` trong scope | Không đếm app orphan ngoài YCTD scope |
| **BR-REC-08-STOP-ONBOARD** | KPI phễu | Dừng tại onboard | Probation exit default **không** trừ (**O3**) |
| **BR-REC-08-BE-FORMULA** | % / gap / ETA / status | Nest tính | FE compute = **FAIL** |
| **BR-REC-08-SCOPE** | GET summary = drill | Cùng `resolveHrmListScope` | U19 parity · **D-S9** |
| **BR-REC-08-NO-CB** | Response / UI | Omit lương offer / C&B / MST / bank | Lộ = **FAIL** |
| **BR-REC-08-NO-CAMPAIGN** | Drill MVP | YCTD / pipeline | Campaign primary = **FAIL** REC-03 |
| **BR-REC-08-EMPTY** | Không ĐB duyệt trong kỳ | `empty_guide` + zeros/`null` % | Bịa số = **FAIL** |
| **BR-REC-08-OUT-OF-PLAN** | YCTD `out_of_plan` | TT/drill yes · KH no inflate | **O6** |
| **BR-REC-08-LEGACY** | mode NULL | Read+warn; no in_plan cell credit | **O7** |
| **BR-REC-08-NO-SEED** | Nghiệm thu | Chuỗi FE only | Seed = **FAIL U65** |
| **BR-REC-08-NO-DUAL** | Physical path | `/recruitment/dashboard*` | Nest `/rec` dual SoT = **FAIL O1** |
| **BR-REC-08-READ-ONLY** | Dashboard endpoints | GET only | Mutate ĐB/YCTD qua dashboard = **FAIL D-S1** |
| **BR-REC-08-REPORTS-ONE** | Reports recruitment | Same Nest semantics | Second formula = **FAIL O8** |
| **BR-REC-08-COST-OUT** | Cost / VND | Omit | Invent cost = **FAIL O10** |

### 2.1 Metric ownership (deterministic — BE)

| Metric | Formula (Nest owns) | Null / empty |
|--------|---------------------|--------------|
| **`planned_need`** | `Σ need_hire` over cells matching **O2** in period ∩ scope | `0` when none; trigger `empty_guide` when no approved plan/cells in period |
| **`filled_count`** | Count apps/candidates on in-scope YCTD mapped to bucket **`onboard`** (**O3**) | `0` if none |
| **`in_pipeline_count`** | Count on in-scope YCTD where stage ∉ {terminal_reject} ∧ bucket ≠ onboard | `0` if none |
| **`open_yctd_count`** | Count `job_requisitions` in scope with receivable/`open_for_hire` (synonym filter RETAIN REC-02) **or** `pending_approval` **excluded** from «open receivable»; open = receivable + in-progress hiring not closed — **normative MVP:** status ∈ receivable set (`open_for_hire` + approved synonyms) **plus** non-terminal with pipeline active; API F.1 seals exact status set | `0` |
| **`gap_count`** | `max(planned_need − filled_count, 0)` | Always ≥ 0 integer |
| **`completion_pct`** | If `planned_need=0` → **`null`**; else `min(100, round(100 × filled_count / planned_need))` integer | **Never** FE divide |
| **`enough_people_status`** | `no_plan` \| `enough` \| `in_progress` \| `at_risk` — see **O9** + table dưới | Enum only |
| **`enough_people_eta`** | Earliest open YCTD `target_month` with remaining>0 (**O5**) | `null` + VI label |
| **`funnel.{cv,screening,interview,offer,onboard}`** | Counts by catalog→bucket map (**O4**); mỗi key **always present** | Missing stage → `0` |
| **`by_month[]` / `by_org_unit[]` / `by_yctd[]`** | Same formulas sliced; display-ready labels | Empty array OK |
| **FORBIDDEN fields** | offer_salary, c_and_b_*, bank, MST | Absent on DTO |

#### `enough_people_status` decision table

| # | Condition | Status | User sees (VI intent) |
|---|-----------|--------|------------------------|
| 1 | No approved ĐB / no O2 cells in period (`empty_guide`) | `no_plan` | Hướng dẫn tạo/duyệt định biên — **không** số bịa |
| 2 | `planned_need > 0` ∧ `gap_count = 0` | `enough` | Đã đủ người theo KH kỳ |
| 3 | `gap_count > 0` ∧ (`open_yctd_count > 0` ∨ `in_pipeline_count > 0`) | `in_progress` | Đang tuyển — kèm ETA nếu có |
| 4 | `gap_count > 0` ∧ `open_yctd_count = 0` ∧ `in_pipeline_count = 0` | `at_risk` | Còn thiếu · chưa có YCTD/pipeline mở |

---

## 3. UC-BP-REC-08 — Acceptance criteria

### 3.0 Scope ladder (mọi AC — U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) | Tổng hợp member units **trong** token scope; drill YCTD cùng tập | Silent mix ngoài scope |
| **Member CEO** | Chỉ pháp nhân mình; ngoài scope → **403/409** hoặc empty đúng resolver | Thấy pháp nhân khác |
| **HRBP** | Narrow membership — **cùng** `resolveHrmListScope` như list plans/YCTD | Rollup tập đoàn khi không được phép |

### 3.1 Happy path

| AC-ID | Given | When | Then (measurable — **user sees**) | Evidence |
|-------|-------|------|-------------------------------------|----------|
| **AC-REC-08-01** | Persona group/member/HRBP; login FE | Mở Tuyển dụng → **Dashboard**; chọn **kỳ** (năm hoặc from–to) + đơn vị trong quyền | Bộ lọc áp dụng; URL/query phản ánh kỳ; **không** mutate ĐB/YCTD; ngoài scope filter → ẩn/từ chối (**VAL-01**) | Screenshot + URL + persona |
| **AC-REC-08-02** | Filter hợp lệ | Hệ thống tải chỉ số | Network **GET** `/api/hrm/recruitment/dashboard*` **2xx**; FE bind DTO (KH/TT/funnel/status/ETA labels); **không** banner ERROR; **F5** cùng filter → cùng số | DevTools + FE + F5 |
| **AC-REC-08-03** | Có ĐB approved + ô `need_hire_approved` trong kỳ **hoặc** empty | Quan sát KH vs TT | `planned_need` khớp **O2**; `filled_count`/`gap_count`/`completion_pct` khớp §2.1; empty → `empty_guide` + zeros/`null` % — **cấm** bịa; user **không** nhập tay chỉ số | Compare Nest vs cell/YCTD sources |
| **AC-REC-08-04** | Dashboard loaded | Quan sát funnel | Đủ 5 bucket keys; label VI; đoạn không có data = **0** (không ẩn cột bắt buộc); map catalog **O4** | UI + Network body |
| **AC-REC-08-05** | Có/không gap | Đọc «bao giờ đủ người» | Thấy `enough_people_status` + `enough_people_eta_label` (hoặc null ETA đúng **O5/O9**); **không** FE tự suy ngày | UI bind |
| **AC-REC-08-06** | Có YCTD trong scope | **Khoan** → danh sách YCTD / pipeline | GET drill **2xx**; rows `by_yctd` (id, title, mode, status, headcount, filled, pipeline, target_month, cell_id); click row → **detail YCTD** (cross-nav); **không** màn Campaign | J-HRM-REC-DASH-01 |
| **AC-REC-08-07** | Có YCTD `out_of_plan` | So KH vs drill/TT | Drill/TT **có** row out_of_plan; `planned_need` **không** tăng vì out_of_plan; flag mode hiển thị | Network + UI |
| **AC-REC-08-08** | Mọi persona trên Dashboard/Reports REC | Inspect UI + Network JSON | **Không** lương offer / C&B / MST / bank; cost chart **OUT** | Network omit + UI |
| **AC-REC-08-09** | DevTools / code review after wire | Load Dashboard | FE **không** multi-list join invent KH/% (`listJobPostings` + aggregator domain); chỉ GET dashboard (+ optional drill); chart lib chỉ render arrays BE | Code audit + Network |
| **AC-REC-08-10** | Mở tab **Reports** recruitment (cùng module) | Tải báo cáo tuyển | Số KH/TT/%/funnel **cùng semantics** Nest (**O8** subset OK); **không** `buildRecruitmentReportFromApi` công thức lệch | UI + Network |

### 3.2 Alternate

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-08-ALT-01** | `planned_need>0`, `gap=0` | Load | status `enough`; ETA có thể null; user thấy đủ người | UI |
| **AC-REC-08-ALT-02** | gap>0 + open YCTD có `target_month` | Load | status `in_progress`; ETA = earliest month **O5**; label VI | UI + body |
| **AC-REC-08-ALT-03** | gap>0 + không open YCTD/pipeline | Load | status `at_risk`; ETA null + label «Chưa xác định…» | UI |
| **AC-REC-08-ALT-04** | Legacy YCTD mode NULL | Drill | Row hiện + warn classify; **không** credit ô in_plan; TT org vẫn đếm nếu có app (**O7**) | UI |
| **AC-REC-08-ALT-05** | Group CEO đổi filter member unit | Reload | Số theo đơn vị chọn; không leak ngoài scope | Persona |
| **AC-REC-08-ALT-06** | Funnel thiếu một stage catalog | Load | Bucket đó = **0**; đủ 5 keys | Body |

### 3.3 Exception

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-08-EX-01** | Kỳ thiếu / ngoài năm ĐB / invalid range | GET dashboard | **400** VAL period; toast VI; FE **không** hiện số cũ như đúng | Network |
| **AC-REC-08-EX-02** | `company_id` hint ≠ token scope | GET | **409** scope (cùng pattern list plans) | Network |
| **AC-REC-08-EX-03** | Member/HRBP gọi scope tập đoàn | GET | 403/409 hoặc empty đúng resolver — **không** rollup lậu | Persona |
| **AC-REC-08-EX-04** | Chưa ĐB duyệt trong kỳ | Load | `empty_guide` + `no_plan`; **không** bịa KH | UI |
| **AC-REC-08-EX-05** | Attempt Nest physical `/api/hrm/rec/dashboard` as sole SoT / dual controller | Impl review | **FAIL O1** — alias only; physical `/recruitment/dashboard*` | Diff |
| **AC-REC-08-EX-06** | FE vẫn aggregator + `job_postings` KH | Load | **FAIL** AC-09 / SOLID 25 §3.1 | Audit |
| **AC-REC-08-EX-07** | Drill Campaign / REC-03 | Product | **FAIL** D-S10 | Process |
| **AC-REC-08-EX-08** | Cost/VND invent trên surface | UI | **FAIL O10** | UI |
| **AC-REC-08-EX-09** | Seed data rồi claim PASS | QA | **FAIL U65** | Process |
| **AC-REC-08-EX-10** | Claim module REC UAT / flip honesty after slice GWC | QC | **FAIL** C-SLICE | Honesty |
| **AC-REC-08-EX-11** | Materialize rollup table as write SoT this wave | Impl | **FAIL** Option B DENY | Diff |
| **AC-REC-08-EX-12** | Reports second formula ≠ Nest | Load Reports | **FAIL O8** | Compare |

### 3.4 FE after 2xx + F5 (U63/U65) — Diễn biến đọc Dashboard

| Bước | Actor FE | Action | Network | FE ngay sau 2xx | F5 / navigate lại |
|------|----------|--------|---------|-----------------|-------------------|
| 1 | LD / TP TD / CEO / HRBP | Mở tab Dashboard tuyển | — | Shell filter kỳ + đơn vị (h-10 axis) | — |
| 2 | User | Chọn kỳ / đơn vị / (optional) vị trí | — | Filter state | — |
| 3 | System | Tải summary | **GET** `/api/hrm/recruitment/dashboard?…` **2xx** | Bind KH/TT/funnel/status/ETA; empty_guide nếu `no_plan`; **không** ERROR | Cùng filter → cùng số |
| 4 | User | Đổi filter | GET lại **2xx** | Số đổi theo filter; không stale mix | F5 giữ filter (nếu query) |
| 5 | User | Khoan YCTD | **GET** drill **2xx** (hoặc include=yctd) | Bảng YCTD display-ready; mode/status/gap row | — |
| 6 | User | Click YCTD row | GET detail requisition **2xx** | Detail YCTD (must_keep J-HRM-05 path); **không** Campaign | Back → dashboard còn |
| 7 | User | Mở Reports recruitment | GET **cùng** contract/subset **2xx** | Số khớp semantics Nest | F5 còn |
| **Cấm** | QA/Dev | seed; FE join multi-list invent %; Nest `/rec` dual; cost invent; honesty flip | — | — | **FAIL** |

**Thành công SRS:** Người dùng trả lời được «khi nào đủ người» theo kỳ × đơn vị; không lộ C&B; UC kế = điều chỉnh định biên hoặc đẩy YCTD (không qua dashboard mutate).

---

## 4. Validation table

| VAL-ID | Field / rule | Valid | Invalid → outcome |
|--------|--------------|-------|-------------------|
| **VAL-REC-DASH-01** | Period `year` **or** `from`+`to` | Trong năm định biên; month granularity | Missing/invalid → **400** |
| **VAL-REC-DASH-02** | Scope / `company_id` hint | Matches `resolveHrmListScope` | Mismatch → **409** (U19) |
| **VAL-REC-DASH-03** | `planned_need` sources | Only O2 cells | Draft/need_hire-not-approved in sum → **FAIL** |
| **VAL-REC-DASH-04** | `completion_pct` | null iff planned_need=0; else 0–100 int BE | FE-computed / NaN → **FAIL** |
| **VAL-REC-DASH-05** | `gap_count` | `max(planned_need−filled_count,0)` | Negative → **FAIL** |
| **VAL-REC-DASH-06** | Funnel keys | All 5 always present; ≥0 | Missing key / negative → **FAIL** |
| **VAL-REC-DASH-07** | `enough_people_status` | Enum §2.1 | Other / invent → **FAIL** |
| **VAL-REC-DASH-08** | `enough_people_eta` | `yyyy-MM` or null + VI label | FE invent date → **FAIL** |
| **VAL-REC-DASH-09** | out_of_plan | TT/drill include; KH unchanged by mode | Inflate KH → **FAIL O6** |
| **VAL-REC-DASH-10** | Legacy mode NULL | Warn; no silent in_plan cell credit | Silent in_plan → **FAIL O7** |
| **VAL-REC-DASH-11** | C&B / cost fields | Absent | Present salary/VND invent → **FAIL** |
| **VAL-REC-DASH-12** | Physical path | `/recruitment/dashboard*` | Dual Nest `/rec` SoT → **FAIL O1** |
| **VAL-REC-DASH-13** | Drill target | YCTD rows | Campaign-required → **FAIL** |
| **VAL-REC-DASH-14** | Read-only | GET only | POST mutate via dashboard → **FAIL** |
| **VAL-REC-DASH-15** | Reports align | Same Nest semantics | Second formula → **FAIL O8** |
| **VAL-REC-DASH-16** | Empty guide | no_plan + guide; no fake KH | Fake numbers → **FAIL** |
| **VAL-REC-DASH-17** | Scope parity | summary = drill = source lists | Mismatch → **FAIL U19** |
| **VAL-REC-DASH-18** | U65 | FE-only evidence | Seed/API fake = **FAIL** |
| **VAL-REC-DASH-19** | Honesty | `recruitment_uat_ready=false` | Flip after slice = **FAIL** |

---

## 5. Traceability — UC → BR → partner_req → AC → Journey/UF

| UC | BR | partner_req | Decision | AC (primary) | UF / J-* |
|----|-----|-------------|----------|--------------|----------|
| **UC-BP-REC-08** | BR-BP-HC-01 · BR-REC-08-* · D-S1..D-S10 | **REQ_REC_005** | SA Option **A** LOCKED | AC-REC-08-01..10 · ALT · EX · VAL-01..19 | **UF-HRM-REC-DASH-08** *(DRAFT)* · **J-HRM-REC-DASH-01** · **J-HRM-REC-DASH-02** (Reports align) |
| UC-BP-REC-01/01b | Cell KH | REQ_REC_003 | Sealed | Peer | must_keep J-HRM-REC-HC-* |
| UC-BP-REC-02/02b | YCTD TT | REQ_REC_001 | Sealed | Peer | must_keep J-HRM-REC-YCTD-* · J-HRM-05 |
| UC-BP-REC-03 | — | REQ_REC_002 | OUT | — | **DENY** Campaign |

### Journey placeholders (U19)

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-REC-DASH-01** | Login (group **and** member **and** HRBP sample) → Tuyển dụng → **Dashboard** → chọn kỳ/đơn vị → thấy KH/TT/funnel/status/ETA (hoặc empty_guide) → Network GET `/recruitment/dashboard` 2xx → **F5** còn → khoan YCTD → click row → detail YCTD → Back; assert **không** Campaign · **không** C&B · **không** FE multi-list KH | AC-REC-08-01..09 · U65 · no seed |
| **J-HRM-REC-DASH-02** | Cùng persona → tab **Reports** tuyển → số KH/TT/% khớp Nest semantics (subset OK) → F5 | AC-REC-08-10 · O8 · U65 |

**Group CEO:** rollup `company_id=main` trong scope; Member/HRBP không thấy ngoài membership.

### UF matrix note

| UF | Status | Relation |
|----|--------|----------|
| **UF-HRM-REC-DASH-08** | ⬜ DRAFT | Thêm khi Dev wire FE bind; QA browser U65 |
| Sealed REC-01/02 UF/J | must_keep | **không** đè regression |

---

## 6. Honesty & must_keep

| Lock | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| Program honesty flags | **false** |
| `C-SLICE-≠-MODULE` | Slice GWC dashboard ≠ module REC UAT |
| DENY | REC-03 · Nest `/rec` dual · FE domain aggregate · seed · Option B materialize · reopen REC-02 · invent cost · flip product_go |
| must_keep | REC-01 cell/`need_hire`/spawn · REC-02 mode/`open_for_hire`/flags/CELL-QTY/BOD · `resolveHrmListScope` · J-HRM-05 · UF-HRM-12 · soft-delete |

---

## 7. Handoff expectations

| Role | Expectation | Done when |
|------|-------------|-----------|
| **ba-data** | **HOLD / NOT REQUIRED** — Option A read-only on-the-fly; **no** new physical SoT table; optional index cite only if API proves missing (not gate) | N/A unlock — skip unless SA finds column gap on sealed spine |
| **sa (API F.1)** | DOC-DELTA F-REC-DASH-01/02: physical path · mục đích · nghiệp vụ · bước SRS #1–#3 · DTO↔source columns · error tokens VAL · funnel catalog map · status sets for open_yctd | Spec CONFIRMED |
| **dev-be** | Sau API — Nest dashboard service + scope tests + empty_guide + C&B omit + formula §2.1 | READY_FOR_QA |
| **dev-fe** | Replace aggregator domain joins with DTO bind; Reports align; hide cost; F5 | READY_FOR_QA |
| **qa** | Browser J-HRM-REC-DASH-01/02 · 3 personas · U65 zero-seed | PASS_TO_PM / FAIL |
| **qc** | GWC slice only; honesty false | GWC ≠ module GO |

---

## 8. Open risks / clarifications

| ID | Risk | Owner | Resolution path |
|----|------|-------|-----------------|
| R1 | FE giữ `recruitmentDashboardAggregator` + job_postings | qa/dev-fe | FAIL AC-09 |
| R2 | Dual Nest `/rec/dashboard` controller | sa/tm | FAIL O1 |
| R3 | Ambiguous hired vs onboard mapping | sa API | Seal catalog→bucket map in F.1 |
| R4 | `open_yctd_count` status set drift | sa API | Seal exact set in F.1 (cite REC-02 receivable) |
| R5 | Reports still second formula | qa | FAIL O8 |
| R6 | Claim module UAT after GWC | qc | Honesty false · C-SLICE |
| R7 | Perf → pressure Option B early | sa | HOLD P2 until measured |

**SRS gap?** Không. **SA Option A** + **O1–O10** sealed. **Không BLOCKED**.  
**ba-data?** **Không bắt buộc** (read-only Option A).  
Peer residual target_month P2 / REC-02 seals = **orthogonal** — **không** reopen.

---

## 9. Completion

| Field | Value |
|-------|-------|
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **next_owner** | **sa** (API F.1 DOC-DELTA F-REC-DASH-01/02) — **ba-data skip** unless column gap on sealed spine |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-ba-01.md` |
