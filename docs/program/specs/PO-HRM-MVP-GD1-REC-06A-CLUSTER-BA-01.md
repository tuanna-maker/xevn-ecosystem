# BA AC pack — Wave-4 REC cluster · UC-BP-REC-06a (một lịch PV đang hiệu lực)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-4) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O10 **CONFIRMED** · Dev **HOLD** until SA/API F.1 DOC-DELTA (`no_show` + R-A PATCH) |
| **change_mode** | **ADD** (align SA-01 — **no** wipe paper FR-06a · **no** reopen W1–W3) |
| **uc_ids** | `UC-BP-REC-06a` |
| **depends_on** | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01` **Option A LOCKED** · prior IV slice GWC `po-hrm-rec-iv-one-active-qc-slice-01.md` (**RETAIN** ≠ module UAT) |
| **ref_sa** | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01.md` |
| **ref_evidence_sa** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-sa-01.md` |
| **ref_ba_prior** | `PO-HRM-REC-INTERVIEW-ONE-ACTIVE-SPEC-01.md` (draft — **supersede OPEN-Q** by SA LOCK) |
| **ref_ba_style** | `PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01.md` |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-06a** · BR-BP-REC-IV-01..06 · AC-REC-IV-01..07 |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` **WBS-REC-04** |
| **ref_partner** | **REQ_REC_004** |
| **ref_api_paper** | Logical F-REC-IV-* · **physical Option A:** `/api/hrm/recruitment/interviews*` · paper `/api/hrm/rec/interviews*` = **alias only** |
| **ref_spine** | `recruitment_interviews` one-active LIVE · `active_interview` projection · soft-gate `allows_interview_schedule` |
| **Honesty** | `recruitment_uat_ready=false` · **`C-SLICE-≠-MODULE`** · DENY flip module REC UAT / product_go |
| **Cấm** | REC-03 · Nest `/rec` dual · Lane B as SoT · UV×YCTD ACTIVE · seed · reopen REC-01/02/08 · invent FE ACTIVE · apps/** |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE mutate (U63/U65)** cho Wave-4 seat #6:

1. **UC-BP-REC-06a** — Xếp / xác nhận / hủy / hoàn tất / không đến / đổi lịch PV với **≤1 lịch đang hiệu lực** / ứng viên × pháp nhân.
2. **Option A** — ACCEPT_AS_IS_UPGRADE trên spine LIVE `recruitment_interviews` (RETAIN 409 + badge); **UPGRADE residual** browser cancel/complete/reschedule + `no_show` TERMINAL + R-A PATCH datetime.
3. **Không** claim module REC UAT sau GWC slice.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| Nhân sự tuyển dụng (HR) | Xếp / hủy / hoàn tất / đổi lịch từ danh sách hoặc hồ sơ UV |
| Group CEO | Scope rollup member units — không leak ACTIVE ngoài scope |
| Member CEO | Chỉ pháp nhân mình |
| HRBP | Membership hẹp — cùng `resolveHrmListScope` |
| Hệ thống (Nest) | One-active gate · soft-gate stage · display-ready `active_interview` · soft status cancel |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O10 CONFIRM · AC-REC-IV-01..07 mapped · residual browser cancel/complete/reschedule/no_show · VAL-REC-IV-* · Diễn biến FE · J-* DRAFT | Impl `apps/**` / migration / seed |
| Path Lane A physical · cardinality UV×company · R-A · TERMINAL set | **UC-BP-REC-03** Campaign schedule (**DENY**) |
| Soft-gate ≠ 409 ACTIVE | Full REC-06 mail+eval · REC-06b compare · REC-05 history EXPAND |
| | Claim `recruitment_uat_ready` / module REC UAT |
| | Invent UV×YCTD concurrent ACTIVE · Nest `/rec` dual · Lane B SoT |
| | Reopen REC-01/02/08 · reopen prior IV create/409/badge as FAIL |
| | GET list interviews as MVP blocker (**P2**) |
| | REC-08 dashboard consume IV counts (**OUT** — sealed) |

### SA Option A — BA CONFIRM (đóng O1–O10)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Mutate path FE | **YES** — FE mutate **chỉ** `POST/PATCH /api/hrm/recruitment/interviews*` (Lane A) · paper `/api/hrm/rec/interviews*` = **alias only** · **Lane B** `public.interviews` / catalog create = **OUT as FR-06a SoT** · Network QA assert path `/recruitment/interviews` |
| **O2** | Cardinality | **YES** — one ACTIVE max per **`(company_id, candidate_id)`** (UV × pháp nhân) · board «× pipeline» = **context** (lịch trong pipeline UV) **không** khóa UV×YCTD · **DENY** invent concurrent ACTIVE theo YCTD |
| **O3** | Reschedule | **YES** — **R-A primary**: `PATCH …/interviews/:id` cập nhật `scheduled_at` (± interviewer) trên **cùng** row ACTIVE · **không** tạo row ACTIVE thứ hai · R-B atomic chỉ nếu API seat chứng minh cần — vẫn ≤1 ACTIVE |
| **O4** | `no_show` | **YES** — `no_show` ∈ **TERMINAL** (cùng `cancelled` \| `completed`; legacy `passed`\|`failed` ≈ completed-family) · sau `no_show` cho tạo lịch mới |
| **O5** | Soft-gate vs one-active | **YES** — stage `allows_interview_schedule=false` → **400** `HRM-REC-IV-400-STAGE-DISALLOW` · toast/copy **khác** **409** `HRM-REC-IV-409-ACTIVE` · **cấm** gộp hai lỗi một message |
| **O6** | Cancel reason | **CONFIRMED tenant CFG** — **default MVP: optional** (cho phép hủy không lý do) · khi tenant CFG `interview_cancel_reason_required=true` → bắt buộc lý do (**VAL-REC-IV-06**) · **luôn** soft status `cancelled` + audit trail — **không** hard DELETE (BR-IV-06) |
| **O7** | Past datetime | **CONFIRMED tenant CFG** — SRS «không quá khứ theo chính sách pháp nhân» · **default khi CFG unset: BLOCK** submit quá khứ (**VAL-REC-IV-07** + toast VI) · khi tenant CFG `allow_past_interview_schedule=true` → cho phép · **cấm** invent Decision global ngoài CFG · message VI rõ |
| **O8** | GET list interviews | **P2** — **không** block MVP AC · AC-REC-IV-06 dùng `active_interview` projection / 409 details `active_interview_id` · `GET …/interviews?candidate_id=` = residual P2 (QC prior) |
| **O9** | REC-08 / reports IV | **OUT this seat** — **DENY reopen** REC-08 · dashboard **không** bắt buộc consume IV counts trong Wave-4 |
| **O10** | Honesty after GWC | **false** — `recruitment_uat_ready=false` · **C-SLICE** · prior create/409/badge GWC **≠** module REC UAT |
| **Architecture** | SoT | `recruitment_interviews` · U19 `resolveHrmListScope` list=get=mutate · FE bind display-ready only |

---

## 1. As-is vs to-be

| | AS-IS (LIVE + prior slice) | TO-BE (Wave-4 · Option A) |
|---|----------------------------|---------------------------|
| Create + one-active | POST Lane A → 201 / **409 ACTIVE** + unique | **RETAIN** |
| Badge list + vi-VN + F5 | `active_interview` + FE badge | **RETAIN** |
| Soft-gate | **400 STAGE-DISALLOW** | **RETAIN** · AC-IV-07 |
| Confirm | `confirmed` ∈ ACTIVE | **RETAIN** |
| Cancel / complete browser | API status OK · **browser UF deferred** | **UPGRADE** FE/QA residual AC-IV-03/04 |
| `no_show` | Missing DTO TERMINAL | **UNLOCK ADD** status |
| Reschedule datetime | No PATCH `scheduled_at` | **UNLOCK ADD** R-A |
| Lane B catalog | Create **không** one-active | **DENY as SoT** · FE path lock O1 |
| Nest `/rec/interviews` | Paper | Alias only |
| GET list interviews | Absent / P2 | **P2** O8 |
| Honesty | Slice GWC | **false** · C-SLICE |

### Status dictionary (BA lock = SA §7)

| Group | Values | Rule |
|-------|--------|------|
| **ACTIVE** | `scheduled`, `confirmed` | ≤1 per `(company_id, candidate_id)` |
| **TERMINAL** | `cancelled`, `completed`, `no_show` | Cho tạo ACTIVE mới |
| **TERMINAL legacy** | `passed`, `failed` | completed-family cho filter one-active |
| **Not default MVP** | `rescheduled` | Chỉ nếu R-B atomic — **không** path mặc định |

---

## 2. Business rules (normative — SRS + SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-REC-IV-01** | UV đã có ACTIVE cùng pháp nhân | Từ chối tạo mới (FE gate + BE **409** `HRM-REC-IV-409-ACTIVE`) | Toast nêu ngày giờ hiện có + hướng Hủy/Đổi lịch |
| **BR-BP-REC-IV-02** | ACTIVE → TERMINAL (`cancelled`\|`completed`\|`no_show`) | Cho tạo lịch mới | Đúng 0→1 ACTIVE |
| **BR-BP-REC-IV-03** | Đổi lịch | R-A PATCH datetime (primary) | Luôn ≤1 ACTIVE; badge cập nhật |
| **BR-BP-REC-IV-04** | List UV có ACTIVE | Badge/cột + `dd/MM/yyyy HH:mm` | Không ACTIVE → «—» / trống; không crash |
| **BR-BP-REC-IV-05** | Nhiều vòng (peer REC-06) | Vòng sau sau TERMINAL | Không song song 2 ACTIVE |
| **BR-BP-REC-IV-06** | Đóng lịch | Soft status cancel trail | **Không** hard DELETE |
| **BR-REC-IV-PATH** | Mutate FR-06a | Lane A `/recruitment/interviews*` only | Lane B / Nest `/rec` dual = **FAIL O1** |
| **BR-REC-IV-CARD** | Cardinality | UV × `company_id` | UV×YCTD ACTIVE = **FAIL O2** |
| **BR-REC-IV-SOFT** | Stage disallow | **400** STAGE-DISALLOW | Message ≠ 409 ACTIVE (**O5**) |
| **BR-REC-IV-SCOPE** | list = get = mutate | `resolveHrmListScope` | U19 parity |
| **BR-REC-IV-DISPLAY** | Badge fields | BE display-ready | FE suy diễn ACTIVE = **FAIL** |
| **BR-REC-IV-NO-CAMPAIGN** | Schedule hub | Pipeline UV only | REC-03 = **FAIL** |
| **BR-REC-IV-NO-SEED** | Nghiệm thu | Chuỗi FE only | Seed = **FAIL U65** |
| **BR-REC-IV-HONESTY** | Sau GWC slice | Flags false | Flip ready = **FAIL O10** |

### Error taxonomy (BA / QA assert)

| Code | HTTP | UX intent (VI) | ≠ |
|------|------|----------------|--|
| `HRM-REC-IV-409-ACTIVE` | 409 | Đã có lịch đang hiệu lực — nêu ngày giờ + Hủy/Đổi | Soft-gate |
| `HRM-REC-IV-400-STAGE-DISALLOW` | 400 | Giai đoạn hiện tại không cho xếp lịch | One-active |
| `HRM-REC-IV-400-INVALID-TRANSITION` | 400 | Chuyển trạng thái / đổi lịch không hợp lệ (vd. R-A trên non-ACTIVE) | — |
| `HRM-REC-IV-400-PAST-DATETIME` *(mint API)* | 400 | Ngày giờ quá khứ khi CFG block (**O7**) | — |
| `HRM-REC-IV-400-CANCEL-REASON` *(mint API)* | 400 | Thiếu lý do hủy khi CFG required (**O6**) | — |
| Scope mismatch | 409/404 family | Ngoài phạm vi pháp nhân | — |

---

## 3. UC-BP-REC-06a — Acceptance criteria

### 3.0 Scope ladder (mọi AC — U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) | Schedule/status trong member units thuộc token scope | Silent cross-tenant ACTIVE |
| **Member CEO** | Chỉ pháp nhân mình; ngoài scope → 404/409 | Thấy lịch đơn vị khác |
| **HRBP** | Narrow membership — **cùng** resolver candidate list | Rollup tập đoàn khi không được phép |

**Invariant IV-S-SCOPE:** projection list candidates **=** get interview **=** create/update/reschedule.

### 3.1 Prior slice vs residual (honesty)

| AC family | Prior IV slice GWC | This seat |
|-----------|-------------------|-----------|
| AC-REC-IV-01 create + badge F5 | **PASS RETAIN** (must_keep) | Regression only — **cấm** đè FAIL |
| AC-REC-IV-02 duplicate 409 | **PASS RETAIN** | Regression |
| AC-REC-IV-07 soft-gate | LIVE RETAIN (assert ≠ 409) | Confirm O5 + browser residual if not in slice |
| AC-REC-IV-03 cancel→create | **deferred browser** | **UNLOCK residual** |
| AC-REC-IV-04 complete/no_show→round2 | **deferred** (+ `no_show` ADD) | **UNLOCK residual** |
| AC-REC-IV-05 reschedule R-A | **gap** (no PATCH datetime) | **UNLOCK residual** |
| AC-REC-IV-06 cross-nav | Partial / P2 list | Projection/409 id **MVP**; list GET **P2** |

### 3.2 Happy path (mapped AC-REC-IV-01..07)

| AC-ID | Given | When | Then (measurable — **user sees**) | Evidence |
|-------|-------|------|-------------------------------------|----------|
| **AC-REC-IV-01** | UV chưa ACTIVE; stage allows; persona in-scope | FE: Tuyển dụng → Ứng viên → Xếp lịch → nhập ngày giờ (`dd/MM/yyyy HH:mm`) · hình thức · PV → **Lưu** | Network **POST** `/api/hrm/recruitment/interviews` **2xx**; list badge «Đã có lịch» + datetime vi-VN; **F5** còn; **không** banner ERROR | DevTools + FE + F5 · **RETAIN** prior GWC |
| **AC-REC-IV-02** | UV đã ACTIVE | Thử tạo lịch mới (FE hoặc đua) | **Không** tạo bản thứ hai; **409** `HRM-REC-IV-409-ACTIVE` + toast nêu ngày giờ hiện có; FE không mở form tạo (hoặc form khóa) | Network + UI · **RETAIN** |
| **AC-REC-IV-03** | UV có ACTIVE | **Hủy** trên FE → status `cancelled` → **tạo lịch mới** | PATCH status **2xx**; badge mất / «—»; POST create mới **2xx**; list đúng **1** ACTIVE mới; **F5** đúng; **không** hard DELETE | Browser U65 residual |
| **AC-REC-IV-04** | UV có ACTIVE vòng 1 | **Hoàn tất** (`completed`) **hoặc** **Không đến** (`no_show`) → tạo vòng 2 | Status TERMINAL **2xx**; POST create vòng 2 **2xx**; ≤1 ACTIVE; `no_show` **không** còn đếm ACTIVE | Browser + Network |
| **AC-REC-IV-05** | UV có ACTIVE | **Đổi lịch** R-A: đổi `scheduled_at` (± interviewer) → Lưu | **PATCH** `/interviews/:id` (datetime) **2xx**; **cùng** `id` ACTIVE; badge ngày giờ **mới**; **F5** còn; **không** 2 row ACTIVE | Browser residual |
| **AC-REC-IV-06** | List có badge ACTIVE | Click badge / «xem lịch» / mở lịch đang hiệu lực | Mở đúng lịch ACTIVE (id khớp projection hoặc 409 details); **không** mở form tạo mới như SoT | J-HRM-REC-IV-06 |
| **AC-REC-IV-07** | UV stage `allows_interview_schedule=false`; **0** ACTIVE | Thử xếp lịch | **Không** tạo thành công; **400** `HRM-REC-IV-400-STAGE-DISALLOW`; toast **khác** copy 409 ACTIVE | Network + UI |

### 3.3 Residual browser (cancel / complete / reschedule) — ADD detail

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-IV-R01** | ACTIVE + CFG cancel reason **optional** (O6 default) | Hủy **không** nhập lý do | **2xx** `cancelled`; trail soft; cho tạo mới (AC-03) | Browser |
| **AC-REC-IV-R02** | ACTIVE + CFG `interview_cancel_reason_required=true` | Hủy thiếu lý do | **400** cancel-reason; **không** TERMINAL; vẫn 1 ACTIVE | Network |
| **AC-REC-IV-R03** | ACTIVE | Confirm → `confirmed` | Vẫn ACTIVE; AC-02 vẫn chặn tạo mới; badge còn | Browser |
| **AC-REC-IV-R04** | ACTIVE | Complete / no_show từ FE | DTO chấp nhận `no_show`; UI nhãn VI; sau đó AC-04 | Browser |
| **AC-REC-IV-R05** | ACTIVE | R-A đổi giờ hợp lệ (không quá khứ theo O7) | Một ACTIVE; badge mới; Network **không** POST create thứ hai | DevTools |
| **AC-REC-IV-R06** | ACTIVE | Thử R-A trên row đã TERMINAL | **400** INVALID-TRANSITION; **không** «hồi sinh» ACTIVE im lặng | Network |
| **AC-REC-IV-R07** | Path lock | Mọi mutate FR-06a trong UF | Network host path chứa `/recruitment/interviews` — **FAIL** nếu chỉ gọi Lane B catalog | DevTools O1 |

### 3.4 Alternate

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-IV-ALT-01** | 0 ACTIVE | List UV | Cột lịch «—» / trống; **không** crash | UI |
| **AC-REC-IV-ALT-02** | Group CEO đổi đơn vị trong scope | Schedule member UV | Thành công trong scope; không leak | Persona |
| **AC-REC-IV-ALT-03** | CFG `allow_past_interview_schedule=true` | Lưu giờ quá khứ | **2xx** cho phép (O7 exception) | CFG + Network |
| **AC-REC-IV-ALT-04** | CFG unset / block past | Lưu giờ quá khứ | **400** PAST-DATETIME; toast VI; **không** INSERT | VAL-07 |
| **AC-REC-IV-ALT-05** | Đua 2 POST create | Song song | Chỉ 1 **2xx**; bản kia **409** ACTIVE | Network |

### 3.5 Exception

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-IV-EX-01** | `company_id` / candidate ngoài scope | POST/PATCH | 404/409 scope — **không** lộ lịch chéo | Network |
| **AC-REC-IV-EX-02** | FE posts Lane B `interviews` as SoT | Review / QA | **FAIL O1** — không nghiệm thu FR-06a | Diff + Network |
| **AC-REC-IV-EX-03** | Nest greenfield `/rec/interviews` controller dual | Impl | **FAIL O1** | Diff |
| **AC-REC-IV-EX-04** | Hard DELETE để né ACTIVE | Impl / Network | **FAIL** BR-IV-06 | Diff |
| **AC-REC-IV-EX-05** | Soft-gate toast = copy 409 ACTIVE | UI | **FAIL O5** / AC-07 | UI |
| **AC-REC-IV-EX-06** | Reschedule tạo 2 ACTIVE | After R-A/R-B | **FAIL** AC-05 / BR-IV-03 | DB/list |
| **AC-REC-IV-EX-07** | `no_show` vẫn ACTIVE | After status | **FAIL** AC-04 / O4 | Filter |
| **AC-REC-IV-EX-08** | Seed lịch rồi claim PASS | QA | **FAIL U65** | Process |
| **AC-REC-IV-EX-09** | Flip `recruitment_uat_ready` sau GWC | QC | **FAIL O10** C-SLICE | Honesty |
| **AC-REC-IV-EX-10** | Reopen REC-01/02/08 for schedule | Process | **FAIL** must_keep | Bus |
| **AC-REC-IV-EX-11** | Invent UV×YCTD one-active key | Spec/impl | **FAIL O2** | Diff |
| **AC-REC-IV-EX-12** | Campaign / REC-03 schedule hub | Product | **FAIL** OUT | Process |
| **AC-REC-IV-EX-13** | FE suy ACTIVE từ raw rows (không bind projection) | Code | **FAIL** BR-DISPLAY | Audit |
| **AC-REC-IV-EX-14** | Claim module REC UAT vì prior create GWC | QC | **FAIL** C-SLICE | Honesty |

### 3.6 Diễn biến FE (U63/U65) — mutate lịch PV

| # | Actor FE | Action | Network | FE ngay sau 2xx | F5 / navigate lại |
|---|----------|--------|---------|-----------------|-------------------|
| 1 | HR | Mở Tuyển dụng → **Ứng viên** | GET candidates* **2xx** | List + cột/badge lịch (`active_interview` hoặc «—») | — |
| 2a | HR | UV **0** ACTIVE → **Xếp lịch** → nhập → Lưu | **POST** `/recruitment/interviews` **2xx** | Badge + datetime; toast OK | F5 badge còn |
| 2b | HR | UV **đã** ACTIVE → thử tạo | **409** ACTIVE | Toast đã có lịch + ngày giờ; form khóa / không tạo | F5 vẫn 1 ACTIVE |
| 2c | HR | Stage disallow | **400** STAGE-DISALLOW | Toast **khác** 409 | — |
| 3 | HR | **Xác nhận** lịch | **PATCH** `…/status` → `confirmed` **2xx** | Chip đã xác nhận; vẫn chặn tạo mới | F5 còn ACTIVE |
| 4 | HR | **Hủy** (O6 reason theo CFG) | **PATCH** `…/status` → `cancelled` **2xx** | Badge «—»; CTA xếp lịch mở lại | F5 0 ACTIVE |
| 5 | HR | **Hoàn tất** / **Không đến** | **PATCH** status `completed` \| `no_show` **2xx** | TERMINAL; cho vòng sau | F5 |
| 6 | HR | **Đổi lịch** R-A | **PATCH** `/interviews/:id` `scheduled_at` **2xx** | Badge giờ mới; **cùng** id | F5 giờ mới |
| 7 | HR | Click badge → xem lịch ACTIVE | GET by id / open detail **2xx** | Đúng lịch ACTIVE (AC-06) | Back list còn |
| 8 | HR | Sau TERMINAL → xếp vòng 2 | POST **2xx** | 1 ACTIVE mới | F5 |
| **Cấm** | QA/Dev | seed; Lane B SoT; Nest `/rec` dual; hard DELETE; honesty flip; REC-03 | — | — | **FAIL** |

**Thành công SRS:** Đúng một lịch đang hiệu lực hoặc không còn; dấu vết hủy/hoàn tất; UC kế = đánh giá / thư mời FR-UC-BP-REC-06 (**không** mở trong seat này).

```mermaid
sequenceDiagram
  autonumber
  actor HR as Nhân sự tuyển dụng
  participant List as Danh sách ứng viên
  participant API as API lịch PV Lane A

  HR->>List: Mở xếp lịch
  List->>API: Kiểm tra ACTIVE theo UV × pháp nhân
  alt Đã có ACTIVE
    API-->>List: 409 HRM-REC-IV-409-ACTIVE
    List-->>HR: Chặn tạo — hướng Hủy hoặc Đổi lịch
  else Stage không cho lịch
    API-->>List: 400 HRM-REC-IV-400-STAGE-DISALLOW
    List-->>HR: Thông báo khác với đã có lịch
  else Chưa ACTIVE và stage cho phép
    HR->>List: Nhập ngày giờ · Lưu
    List->>API: POST /recruitment/interviews
    API-->>List: 2xx
    List-->>HR: Badge + datetime; F5 còn
  end
  HR->>List: Hủy hoặc hoàn tất hoặc no_show hoặc Đổi lịch R-A
  List->>API: PATCH status hoặc PATCH scheduled_at
  API-->>List: 2xx — ≤1 ACTIVE
```

---

## 4. Validation table

| VAL-ID | Field / rule | Valid | Invalid → outcome |
|--------|--------------|-------|-------------------|
| **VAL-REC-IV-01** | `candidate_id` | In-scope UV | Missing/out-scope → 400/404/409 |
| **VAL-REC-IV-02** | `scheduled_at` | Required; format parseable; display `dd/MM/yyyy HH:mm` | Missing/invalid → 400 |
| **VAL-REC-IV-03** | Past datetime (**O7**) | Future/now per CFG; or past if CFG allow | Past + CFG block → **400** PAST-DATETIME |
| **VAL-REC-IV-04** | `mode` / hình thức | Catalog value (trực tiếp/trực tuyến/điện thoại) | Unknown → 400 |
| **VAL-REC-IV-05** | Interviewer | Required per tenant policy; in-scope | Fail policy → 400 |
| **VAL-REC-IV-06** | Cancel reason (**O6**) | Optional default; required if CFG on | CFG on + empty → **400** CANCEL-REASON |
| **VAL-REC-IV-07** | Create when ACTIVE>0 | Reject | **409** ACTIVE (not 200) |
| **VAL-REC-IV-08** | Create when stage disallow | Reject | **400** STAGE-DISALLOW (**≠** 409) |
| **VAL-REC-IV-09** | Status transition | ACTIVE→confirm/cancel/complete/no_show; legal set | Illegal → **400** INVALID-TRANSITION |
| **VAL-REC-IV-10** | R-A target | Row ACTIVE; PATCH datetime | Non-ACTIVE R-A → 400 |
| **VAL-REC-IV-11** | Cardinality after mutate | ≤1 ACTIVE `(company_id,candidate_id)` | ≥2 → **FAIL** |
| **VAL-REC-IV-12** | Soft-delete | Cancel = status | Hard DELETE → **FAIL** |
| **VAL-REC-IV-13** | Physical path | `/recruitment/interviews*` | Dual Nest `/rec` SoT → **FAIL O1** |
| **VAL-REC-IV-14** | Lane B | Not FR-06a SoT | Catalog-only schedule PASS claim → **FAIL** |
| **VAL-REC-IV-15** | Badge projection | BE `active_interview` display-ready | FE invent ACTIVE → **FAIL** |
| **VAL-REC-IV-16** | Scope parity | list=get=mutate same resolver | Mismatch → **FAIL U19** |
| **VAL-REC-IV-17** | U65 | FE-only evidence | Seed/API fake = **FAIL** |
| **VAL-REC-IV-18** | Honesty | `recruitment_uat_ready=false` | Flip = **FAIL O10** |
| **VAL-REC-IV-19** | GET list interviews | Optional P2 | Missing list **≠** FAIL MVP if AC-06 via projection |

---

## 5. Traceability — UC → BR → partner_req → AC → Journey/UF

| UC | BR | partner_req | Decision | AC (primary) | UF / J-* |
|----|-----|-------------|----------|--------------|----------|
| **UC-BP-REC-06a** | BR-BP-REC-IV-01..06 · BR-REC-IV-* | **REQ_REC_004** | SA Option **A** LOCKED · O1–O10 CONFIRMED | AC-REC-IV-01..07 · R01..R07 · ALT · EX · VAL-01..19 | **UF-HRM-REC-IV-06a** *(DRAFT)* · **J-HRM-REC-IV-01..07** (DRAFT) |
| UC-BP-REC-03 | — | — | OUT | — | **DENY** |
| UC-BP-REC-08 | — | — | Sealed W3 | — | **DENY reopen** O9 |
| UC-BP-REC-01/02 | — | — | Sealed W1–W2 | — | must_keep |

### Journey placeholders (U19) — DRAFT

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-REC-IV-01** | Login HR → Tuyển dụng → Ứng viên → UV 0 ACTIVE → Xếp lịch → Lưu → badge + datetime → **F5** → Network POST `/recruitment/interviews` 2xx | AC-REC-IV-01 · U65 · no seed |
| **J-HRM-REC-IV-02** | Cùng UV ACTIVE → thử tạo mới → **409** ACTIVE + toast ngày giờ; F5 vẫn 1 ACTIVE | AC-REC-IV-02 |
| **J-HRM-REC-IV-03** | ACTIVE → **Hủy** → badge «—» → xếp lịch mới → 1 ACTIVE → F5 | AC-REC-IV-03 · R01/R02 |
| **J-HRM-REC-IV-04** | ACTIVE → Hoàn tất **hoặc** Không đến (`no_show`) → xếp vòng 2 → 1 ACTIVE | AC-REC-IV-04 · R04 |
| **J-HRM-REC-IV-05** | ACTIVE → **Đổi lịch** R-A → badge giờ mới → F5; Network PATCH datetime (không POST create) | AC-REC-IV-05 · R05 |
| **J-HRM-REC-IV-06** | Click badge / xem lịch → đúng ACTIVE id (projection); **không** mở create như SoT | AC-REC-IV-06 |
| **J-HRM-REC-IV-07** | Stage disallow → xếp lịch → **400** STAGE-DISALLOW; toast ≠ 409 ACTIVE | AC-REC-IV-07 · O5 |

**Group CEO:** schedule chỉ UV trong scope rollup; Member/HRBP không thấy ngoài membership.

### UF matrix note

| UF | Status | Relation |
|----|--------|----------|
| **UF-HRM-REC-IV-06a** | ⬜ DRAFT | Browser residual cancel/complete/reschedule sau API F.1 + Dev wire |
| Prior IV create/409/badge | 🟢 RETAIN slice | **cấm** đè regression; ≠ module UAT |
| Sealed REC-01/02/08 UF/J | must_keep | **không** reopen |

---

## 6. Honesty & must_keep

| Lock | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| Program honesty flags | **false** |
| `C-SLICE-≠-MODULE` | Prior IV GWC + future Wave-4 GWC ≠ module REC UAT |
| DENY | REC-03 · Nest `/rec` dual · Lane B SoT · UV×YCTD ACTIVE · seed · reopen REC-01/02/08 · flip product_go · invent FE ACTIVE |
| must_keep | `recruitment_interviews` unique ACTIVE · 409 `HRM-REC-IV-409-ACTIVE` · `active_interview` projection · soft-gate STAGE-DISALLOW · `resolveHrmListScope` · soft cancel · W1–W3 seals · U65 |

---

## 7. Handoff expectations

| Role | Expectation | Done when |
|------|-------------|-----------|
| **sa (API F.1)** | DOC-DELTA **F-REC-IV-02** (`no_show` ∈ status DTO + bước SRS #6) · **F-REC-IV-03** (PATCH `scheduled_at` R-A · bước #5/#7) · mint VAL error codes PAST/CANCEL-REASON · physical path · mục đích · nghiệp vụ · bước SRS · DTO↔cột · U19 | Spec CONFIRMED |
| **ba-data** | **Narrow residual** — confirm spine columns for `scheduled_at` / status / cancel reason / soft-delete; **DENY** greenfield second interview SoT table; only if API finds column gap | DATA CONFIRMED or N/A cite sealed |
| **dev-be** | Sau API — ADD `no_show` + PATCH datetime; jest one-active regression; optional Lane B ALIGN deny; **no** reopen W1–W3 | READY_FOR_QA |
| **dev-fe** | Cancel/complete/no_show/reschedule UX · path Lane A only · toast 409 ≠ DISALLOW · F5 badge · U65 | READY_FOR_QA |
| **qa** | Browser U65 J-HRM-REC-IV-01..07 · residual R* · **no seed** · RETAIN prior create/409 | PASS_TO_PM / FAIL |
| **qc** | GWC C-SLICE · honesty false · **no** module UAT | GWC |

### Depends / unlock

```text
BA-01 CONFIRMED (this)
  → sa|ba-data API/DB F.1 residual (F-REC-IV-02/03)
  → dev-be / dev-fe
  → qa J-HRM-REC-IV-*
  → qc GWC (honesty false)
```

---

## 8. completion_report

| | |
|--|--|
| **Closed** | O1–O10 **CONFIRMED**; AC-REC-IV-01..07 mapped to Option A; residual R01–R07 cancel/complete/reschedule/no_show; VAL-REC-IV-01..19; Diễn biến FE #1–#8; J-HRM-REC-IV-01..07 **DRAFT**; DENY dual Nest / Lane B SoT / UV×YCTD / REC-03 / seed / honesty flip / W1–W3 reopen |
| **Residual** | SA API F.1 `no_show` + R-A PATCH; ba-data column cite if gap; Dev/QA browser residual; GET list **P2** |
| **ack_status** | **PASS_TO_PM** CONFIRMED |
| **next_owner** | **sa** (API F.1) — ba-data only if physical column gap |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-ba-01.md` |

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-4)
uc_ids: UC-BP-REC-06a
depends_on: BA-01 O1–O10 CONFIRMED docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01.md
ref_sa_option: docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01.md (Option A LOCKED)
ref_evidence_ba: docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-ba-01.md

MISSION: API_DESIGN F.1 DOC-DELTA for residual unlock only.
1) F-REC-IV-02 UPGRADE — PATCH …/interviews/:id/status ADD no_show TERMINAL; map SRS Diễn biến #4–#6; error INVALID-TRANSITION; cancel reason CFG (O6).
2) F-REC-IV-03 UNLOCK ADD — PATCH …/interviews/:id scheduled_at R-A; Diễn biến #5/#7; past datetime VAL (O7); never second ACTIVE.
3) RETAIN F-REC-IV-01/04/SCHED-SOFT physical /api/hrm/recruitment/interviews* ; paper /rec/* alias only.
4) Mint/stabilize HRM-REC-IV-400-PAST-DATETIME · HRM-REC-IV-400-CANCEL-REASON; cite DTO↔recruitment_interviews columns.
5) If column gap on spine → note ba-data narrow; else ba-data NOT REQUIRED.
must_keep: Lane A SoT · 409 ACTIVE · badge projection · soft-gate ≠ 409 · W1–W3 · prior IV GWC · honesty false · U65
DENY: Nest /rec dual · Lane B as SoT · UV×YCTD ACTIVE · REC-03 · seed · flip recruitment_uat_ready · greenfield interview table · reopen REC-01/02/08

EXIT: PASS_TO_PM CONFIRMED · unlock dev-be/fe · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-api-01.md · spec docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md
```
