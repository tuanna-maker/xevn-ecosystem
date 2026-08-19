# BA AC pack — Wave-2 REC cluster · UC-BP-REC-02 + UC-BP-REC-02b

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O5 **CONFIRMED** · Dev **HOLD** until ba-data / TechSpec-API physical DOC-DELTA |
| **change_mode** | **ADD** (align SA-01 — **no** wipe paper FR) |
| **uc_ids** | `UC-BP-REC-02` · `UC-BP-REC-02b` |
| **depends_on** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01` **Option A LOCKED** · Y-S1..Y-S13 · F-REC-YCTD-01..04 |
| **ref_sa** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md` (AC / O-numbering / VAL / Diễn biến) |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-02** · **FR-UC-BP-REC-02b** |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` **WBS-REC-02** · **WBS-REC-02b** |
| **ref_api_paper** | Logical F-REC-YCTD-01..04 · **physical Option A:** `/api/hrm/recruitment/requisitions*` · paper `/rec/recruitment-requests*` = **alias only** |
| **ref_db_paper** | Logical `rec_recruitment_request` = **alias** · physical SoT = **UPGRADE** `job_requisitions` |
| **ref_spine** | REC-01 Option A **RETAIN** — `headcount_cell_id` · `headcount_mode` · spawn UQ · JD soft FK |
| **Sponsor chốt** | **Q-REC-HEADCOUNT** = Cho ngoài ĐB + duyệt BOD; WF **XBOS theo tenant** · **Q-REC-HC-2** = TP + HR · **RETAIN · không re-litigate** |
| **Honesty** | `recruitment_uat_ready=false` · **`C-SLICE-≠-MODULE`** · DENY flip module REC UAT / product_go |
| **Cấm** | REC-03 / chiến dịch · dual physical YCTD SoT · Nest `/rec/...` dual path · seed · invent «warn-cho-qua» out_of_plan without BOD · overwrite UF-HRM-12🟢 / J-HRM-05 / J-HRM-JD-YCTD-01 / J-REC-WF-* · apps/** |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE mutate (U63/U65)** cho Wave-2:

1. **UC-BP-REC-02** — YCTD **trong ĐB**: gắn ô `need_hire_approved` · `hire_reason` `new`\|`replace` · ma trận **SHORT** (TP+HR tối thiểu; BOD chỉ nếu tenant CFG) · sau duyệt → receivable.
2. **UC-BP-REC-02b** — YCTD **ngoài ĐB**: `out_of_plan_reason` bắt buộc · ma trận **LONG** (+ BOD) · **DEFAULT block** `open_for_hire` / nhận CV / posted đến khi BOD duyệt.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| Trưởng bộ phận (TP) | Tạo/sửa YCTD phòng mình; gửi duyệt |
| HCNS (HR) | Duyệt tối thiểu (SHORT); vận hành list/pipeline |
| Ban giám đốc (BOD) | Duyệt nhánh ngoài ĐB (và in_plan khi tenant CFG bắt) |
| Hệ thống | Validate mode/cell/reasons/JD; XBOS matrix conditions; receivable gate |
| Group CEO | Rollup `company_id=main` — đọc list theo scope U19; không bypass gate |

### Scope

| In (this seat) | Out |
|----------------|-----|
| AC-REC-YCTD-02* · AC-REC-YCTD-02b* · VAL-REC-YCTD-* · BR-BP-HC-05/06 cite · Diễn biến FE · UF/J-* DRAFT | Impl `apps/**` / migration / seed |
| O1–O5 CONFIRM · Y-S1..Y-S13 cite · JD bind RETAIN · spawn spine RETAIN | **UC-BP-REC-03** campaign (**DENY**) |
| depends_on SA Option A | «Warn-cho-qua» vượt HC / open tin trước BOD (**OUT** — Decision không reopen) |
| | Claim `recruitment_uat_ready` / module REC UAT |
| | Dual-write `headcount_proposals` as YCTD SoT |

### SA Option A — BA CONFIRM (đóng O1–O5)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Physical path | **Physical prefer** `/api/hrm/recruitment/requisitions*` · paper `/rec/recruitment-requests*` = **alias only** · **DENY** Nest greenfield dual path · **DENY** second YCTD table |
| **O2** | Vượt số lượng ô `in_plan` | **MVP default = 409 reject** create/submit `in_plan` khi qty vượt ô (**Y-S4**) · token gợi ý `HRM-YCTD-CELL-QTY` (ba-data/API seal exact) · **cấm silent stay in_plan** · CFG tùy chọn `force_out_of_plan=true` **HOLD** (không MVP default) — khi bật: rewrite mode + bắt `out_of_plan_reason` trước submit · **không** invent warn-cho-qua |
| **O3** | Receivable token | **Normative sau đủ duyệt = `open_for_hire`** · list filter **được** gồm synonym `open`\|`approved`\|`open_for_hire` đến FE remaster · submit → **`pending_approval`** (**Y-S7** — **cấm** create→`open` bypass) · sau reject → không receivable |
| **O4** | Legacy `status=open` không `headcount_mode` | **Grandfather** list/read · banner warn VI «cần phân loại trong/ngoài ĐB» · **chặn** attach CV / set posted / pipeline nhận hồ sơ đến khi classify · **next edit/save bắt buộc** chọn `headcount_mode` (+ cell hoặc out_of_plan_reason) trước 2xx · **cấm** im lặng coi legacy = in_plan |
| **O5** | `headcount_proposals` | **HOLD** non-SoT · AC cho phép FE CTA deprecate / redirect «Tạo YCTD ngoài ĐB» · **cấm** dual-write proposals + YCTD trong cluster này |
| **D-BOD** | Warn-cho-qua | **OUT** — **DEFAULT block** đến BOD (**Y-S9**) · Q-REC-HEADCOUNT **RETAIN** |
| **Architecture** | SoT | UPGRADE `job_requisitions` · one XBOS `hrm_requisition_approval` + **điều kiện** mode/hire_reason · REC-01 spawn **must_keep** |

---

## 1. As-is vs to-be

| | AS-IS (LIVE + paper) | TO-BE (Wave-2 · Option A) |
|---|----------------------|---------------------------|
| SoT YCTD | `job_requisitions` + JD soft FK | **UPGRADE** cùng spine · mode/hire/out reason/gates |
| Create | `status='open'` immediate; mode không enforce | Submit → `pending_approval` · mode **required** |
| Trong ĐB | Cell columns ADD (REC-01) nhưng create không gate | `in_plan` ⇒ cell `need_hire_approved` + SHORT matrix |
| Ngoài ĐB | Weak / proposals leftover | `out_of_plan` + reason + LONG + **block** đến BOD |
| Matrix | One WF code; thiếu condition depth | Conditions = `headcount_mode` + `hire_reason` (+ tenant CFG) · snapshot `approval_matrix_key` |
| Spawn REC-01 | LIVE in_plan + cell UQ | **RETAIN** — manual create không phá UQ |
| Campaign | REC-03 OUT | Pipeline flags on YCTD (**Y-S13**) |
| Honesty | Slice risk | `recruitment_uat_ready=false` · **C-SLICE** |

---

## 2. Business rules (normative — từ SRS/WBS/SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-HC-05** | `headcount_mode=in_plan` + ô Cần tuyển đã duyệt | Ma trận **SHORT**; **cấm** long-only path | Vi phạm → 4xx/409 |
| **BR-BP-HC-06** | `headcount_mode=out_of_plan` | Ma trận **LONG** (+ BOD); **cấm** short-only; **block** receivable đến BOD | Open tin trước BOD = FAIL |
| **BR-BP-HC-02** | Tạo YCTD từ ô | Chỉ ô **Cần tuyển đã duyệt** | Ô Dự kiến/Hiện tại → từ chối |
| **BR-BP-HC-04** | Spawn (peer) | Đúng một YCTD / ô | Manual create không mint trùng spawn UQ |
| **BR-BP-JD-01** | Chọn JD cho YCTD mới | Chỉ JD **Hiệu lực** đúng pháp nhân | Ngừng / ngoài scope → chặn |
| **BR-YCTD-JD-REF-01** | Vị trí bắt buộc mô tả chuẩn | Thiếu JD → từ chối gửi; giữ form | 4xx |
| **BR-YCTD-JD-REF-02** | Sau chọn JD | Cho chỉnh bản chép ngắn trên YCTD; **không** đổi gốc thư viện | Soft FK giữ |
| **BR-Q-REC-HEADCOUNT** | Ngoài ĐB | Cho phép + duyệt **BOD**; WF **XBOS theo tenant** | **RETAIN** — không re-litigate |
| **BR-Q-REC-HC-2** | SHORT tối thiểu | TP + HR | BOD chỉ khi tenant CFG |
| **BR-REC-02-MODE-REQ** | Submit YCTD | `headcount_mode` ∈ {in_plan, out_of_plan} | Missing → **400** (Y-S2) |
| **BR-REC-02-HIRE-REQ** | Submit | `hire_reason` ∈ {new, replace}; replace ⇒ `replace_employee_id` | Missing → **400** (Y-S6) |
| **BR-REC-02b-REASON** | out_of_plan submit | `out_of_plan_reason` required | Missing → **400** (Y-S5) |
| **BR-REC-02-NO-BYPASS-OPEN** | Create/submit | **Cấm** nhảy `open` / receivable trước đủ duyệt | Y-S7 |
| **BR-REC-02-NO-CAMPAIGN** | MVP «mở tin» | Flags trên YCTD | REC-03 **DENY** |
| **BR-REC-02-NO-SEED** | Nghiệm thu | Chuỗi FE only | Seed / API fake / DB fake = **FAIL U65** |
| **BR-REC-02-SCOPE** | list/get/mutate | Cùng `resolveHrmListScope` | U19 parity |

---

## 3. UC-BP-REC-02 — Acceptance criteria (YCTD trong ĐB)

### 3.1 Happy path

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-REC-YCTD-02** | Persona TP/HR; ĐB approved; ≥1 ô Cần tuyển `need_hire_approved`; catalog vị trí + JD Hiệu lực (khi bắt buộc) | Mở tạo YCTD từ ô / form «trong ĐB» | Form preset `headcount_mode=in_plan` + `headcount_cell_id`; không free-text SoT đơn vị/vị trí | Screenshot + URL |
| **AC-REC-YCTD-02b** | Form in_plan hợp lệ | Chọn JD Hiệu lực (khi bắt buộc) → preview tiêu đề/mô tả → chọn `hire_reason` new\|replace (+ NV thay thế nếu replace) → **Lưu nháp** (nếu có) | Network **2xx**; FE hiện mã/tiêu đề JD + mode Trong ĐB + lý do tuyển; **F5** còn | DevTools + FE + F5 |
| **AC-REC-YCTD-02c** | Nháp đủ VAL | **Gửi duyệt** | Network **2xx**; status FE = **chờ duyệt** (`pending_approval`); **không** chip «nhận hồ sơ» / open_for_hire; F5 vẫn chờ duyệt | FE + F5 |
| **AC-REC-YCTD-02d** | Submitted; matrix SHORT (TP+HR; BOD chỉ nếu CFG) | Approver duyệt đủ cấp (**chuỗi FE**/XBOS — **không seed inbox**) | Network **2xx**; FE → **`open_for_hire`** (receivable); list hiện YCTD + JD; F5 còn receivable + JD | FE + F5 |
| **AC-REC-YCTD-02e** | Receivable in_plan | Cập nhật pipeline flag trên YCTD (posted/has_cv…) **không** tạo Campaign | Network **2xx**; FE cập nhật flag; F5 còn; **không** entity Campaign | FE |
| **AC-REC-YCTD-02f** | List YCTD | Cross-nav click row → detail | Detail load; mode/cell/JD/hire_reason đúng; không 404 scope | J-* |

### 3.2 Alternate

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-YCTD-02-ALT-01** | Submitted in_plan | **Từ chối** + lý do bắt buộc | Network **2xx**; FE trả chỉnh sửa; JD giữ trên nháp; **không** receivable; F5 còn rejected + lý do | FE + F5 |
| **AC-REC-YCTD-02-ALT-02** | `hire_reason=replace` đúng vị trí; qty không vượt ô | Submit in_plan | Vẫn `in_plan` (SRS thay thế đúng vị trí); SHORT matrix | Network + FE |
| **AC-REC-YCTD-02-ALT-03** | Tenant CFG bắt BOD dù in_plan | Submit | Matrix có bước BOD; **cấm** hardcode «luôn bỏ BOD»; sau đủ duyệt mới receivable | WF evidence |
| **AC-REC-YCTD-02-ALT-04** | Spawn REC-01 đã tạo YCTD in_plan cho ô | Manual create cùng ô | **409** UQ / không insert thứ hai (**Y-S11** · BR-BP-HC-04) | Network |
| **AC-REC-YCTD-02-ALT-05** | JD bind path | Quan sát picker | Chỉ Hiệu lực; Ngừng chặn — **RETAIN** J-HRM-JD-YCTD-01 must_keep | UI |

### 3.3 Exception

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-YCTD-02-EX-01** | Thiếu `headcount_mode` | Submit | **400**; toast VI; FE giữ form; không 2xx im lặng | Network |
| **AC-REC-YCTD-02-EX-02** | in_plan thiếu `headcount_cell_id` / ô không `need_hire_approved` / plan chưa duyệt | Submit | **409** `HRM-YCTD-CELL-*`; FE không receivable | Network |
| **AC-REC-YCTD-02-EX-03** | in_plan qty vượt ô (**O2** default) | Submit | **409** reject; **không** silent in_plan; FE message VI gợi ý ngoài ĐB nếu SRS | Network |
| **AC-REC-YCTD-02-EX-04** | Thiếu `hire_reason` / replace thiếu `replace_employee_id` | Submit | **400**; giữ form | Network |
| **AC-REC-YCTD-02-EX-05** | Vị trí bắt buộc JD; thiếu JD / JD Ngừng | Submit | **4xx** BR-YCTD-JD-REF-01 / BR-BP-JD-01; giữ form | Network |
| **AC-REC-YCTD-02-EX-06** | Thư viện JD trống khi bắt buộc | Mở picker / gửi | Empty + CTA Thư viện JD; **không** lưu/gửi thiếu ref | FE |
| **AC-REC-YCTD-02-EX-07** | Attempt dùng LONG-only / bỏ SHORT khi in_plan | Submit/approve path | **FAIL** BR-BP-HC-05 | Process |
| **AC-REC-YCTD-02-EX-08** | Scope member vs `main` | GET list/detail/mutate | Cùng scope resolver; không 409 sai scope | U19 |
| **AC-REC-YCTD-02-EX-09** | Seed YCTD / seed inbox rồi claim PASS | — | **FAIL U65** | Process |

### 3.4 FE after 2xx + F5 (U63/U65) — Diễn biến mutate in_plan

| Bước | Actor FE | Action | Network | FE ngay sau 2xx | F5 / navigate lại |
|------|----------|--------|---------|-----------------|-------------------|
| 1 | TP/HR | Mở tạo từ ô Cần tuyển approved | GET cell/JD **2xx** | Form in_plan + cell bind | — |
| 2 | TP/HR | Chọn JD Hiệu lực → preview | GET template **2xx** | Preview tiêu đề/mô tả | — |
| 3 | TP/HR | Điền SL · hire_reason → **Lưu** (nháp) | POST/PATCH **2xx** | Row/detail: mode + JD + lý do; **không** receivable | Còn đúng |
| 4 | TP/HR | **Gửi duyệt** | POST submit **2xx** | Chip **chờ duyệt**; **không** mở nhận hồ sơ | Còn chờ duyệt |
| 5a | Approver | Inbox/XBOS **Duyệt** *(chuỗi FE)* | POST approve **2xx** | **`open_for_hire`**; list + JD | Còn receivable + JD |
| 5b | Approver | **Từ chối** + lý do | POST reject **2xx** | Trả chỉnh sửa; JD giữ | Còn |
| 6 | HR | Pipeline flag trên YCTD | PATCH flags **2xx** | Flag cập nhật; **không** Campaign | Còn |
| 7 | Any | Click list → detail | GET **2xx** | Detail đủ mode/cell/JD | — |
| **Cấm** | QA | seed requisition / seed inbox / SQL flip approved/open | — | — | **FAIL U65** |

**Thành công SRS:** Người dùng thấy YCTD trên danh sách kèm tham chiếu JD; tải lại vẫn còn; sẵn sàng nhận hồ sơ; UC kế = kho CV / pipeline.

---

## 4. UC-BP-REC-02b — Acceptance criteria (YCTD ngoài ĐB)

### 4.1 Happy path

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-YCTD-02b-01** | Persona TP/HR; xác định phát sinh / vượt / ngoài ô | Mở tạo YCTD **ngoài ĐB** | Form `headcount_mode=out_of_plan`; bắt buộc `out_of_plan_reason`; hire_reason new\|replace; JD Hiệu lực khi bắt buộc | FE form |
| **AC-REC-YCTD-02b-02** | Form out_of_plan đủ VAL | **Lưu** nháp | Network **2xx**; FE hiện Ngoài ĐB + lý do vượt + JD; F5 còn; **không** receivable | FE + F5 |
| **AC-REC-YCTD-02b-03** | Nháp đủ | **Gửi duyệt** | Network **2xx**; `pending_approval`; matrix **LONG** (+ BOD); FE **không** cho nhận CV / posted / open_for_hire | FE + Network |
| **AC-REC-YCTD-02b-04** | Đang chờ; thiếu BOD (bắt buộc) | Attempt nhận CV / set posted / chuyển receivable | **409** `HRM-YCTD-BOD-REQUIRED` / `HRM-YCTD-NOT-RECEIVABLE`; FE block + toast VI | Network + FE |
| **AC-REC-YCTD-02b-05** | Đủ cấp gồm BOD (**chuỗi FE**) | BOD **Duyệt** | Network **2xx**; FE → **`open_for_hire`**; list + JD; F5 còn; mới cho nhận hồ sơ / pipeline flags | FE + F5 |
| **AC-REC-YCTD-02b-06** | Receivable out_of_plan | Cross-nav detail | Mode out_of_plan + reasons + JD đúng; không 404 scope | J-* |

### 4.2 Alternate

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-YCTD-02b-ALT-01** | Submitted out_of_plan | BOD **Từ chối** + lý do | Network **2xx**; YCTD rejected/closed; **không** receivable; JD giữ trên bản đã lưu; F5 còn | FE + F5 |
| **AC-REC-YCTD-02b-ALT-02** | User nhầm gắn in_plan nhưng vượt ô | Submit in_plan | **409** (**O2**); hoặc user chuyển form sang out_of_plan + reason — **không** silent | Network |
| **AC-REC-YCTD-02b-ALT-03** | FE tab `headcount_proposals` | Quan sát | **≠** SoT YCTD; CTA deprecate / redirect tạo out_of_plan OK; **cấm** dual persist (**O5**) | UI audit |
| **AC-REC-YCTD-02b-ALT-04** | Legacy row `open` + `headcount_mode` NULL (**O4**) | List/read | Hiển thị + warn classify; **block** CV đến classify; edit bắt mode | FE |

### 4.3 Exception

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-YCTD-02b-EX-01** | out_of_plan thiếu `out_of_plan_reason` | Submit | **400**; giữ form | Network |
| **AC-REC-YCTD-02b-EX-02** | Thiếu hire_reason / replace id | Submit | **400** | Network |
| **AC-REC-YCTD-02b-EX-03** | Attempt SHORT-only / skip BOD khi CFG bắt | Approve path / open tin | **Block** — BR-BP-HC-06 · Y-S9/Y-S10 | Network |
| **AC-REC-YCTD-02b-EX-04** | Invent «warn cho qua» mở tin trước BOD | Product claim | **FAIL process** — D-BOD OUT | Process |
| **AC-REC-YCTD-02b-EX-05** | JD thiếu khi bắt buộc / JD Ngừng | Submit | **4xx**; giữ form | Network |
| **AC-REC-YCTD-02b-EX-06** | Missing tenant WF definition | Submit | spawnMissing / block pattern RETAIN — **cấm** fake approve | Network |
| **AC-REC-YCTD-02b-EX-07** | Seed để có task BOD rồi claim PASS | — | **FAIL U65** | Process |
| **AC-REC-YCTD-02b-EX-08** | Dual SoT `rec_recruitment_request` physical / Nest `/rec` path | Impl | **FAIL** O1 / Y-S1 | Diff review |

### 4.4 FE after 2xx + F5 (U63/U65) — Diễn biến mutate out_of_plan

| Bước | Actor | Action | Network | FE ngay sau 2xx | F5 |
|------|-------|--------|---------|-----------------|-----|
| 1 | TP/HR | Tạo ngoài ĐB + reason + hire_reason + JD | POST **2xx** | Mode Ngoài ĐB; **không** receivable | Còn |
| 2 | TP/HR | **Gửi duyệt** dài | POST submit **2xx** | Chờ duyệt LONG; UI **chặn** nhận CV | Còn chờ |
| 3 | Attempt | Thêm CV / posted trước BOD | **409** NOT-RECEIVABLE | Toast VI; list không mở tin | — |
| 4a | BOD | **Duyệt** *(chuỗi FE)* | POST **2xx** | **`open_for_hire`** + JD | Còn |
| 4b | BOD | **Từ chối** | POST **2xx** | Rejected; không nhận hồ sơ | Còn |
| 5 | HR | Sau receivable — pipeline flag | PATCH **2xx** | Flag trên YCTD; không Campaign | Còn |
| **Cấm** | QA | seed / SQL BOD approve / warn-cho-qua | — | — | **FAIL** |

**Thành công SRS:** Ngoài kế hoạch được kiểm soát trước khi nhận hồ sơ; danh sách kèm JD; tải lại vẫn còn; UC kế = kho CV / pipeline.

---

## 5. Validation table

| VAL-ID | Field / rule | Valid | Invalid → outcome |
|--------|--------------|-------|-------------------|
| **VAL-REC-YCTD-01** | `headcount_mode` | `in_plan` \| `out_of_plan` | Missing/other → **400** (Y-S2) |
| **VAL-REC-YCTD-02** | `headcount_cell_id` when in_plan | NOT NULL · cell `need_hire_approved` · plan approved | Else **409** CELL-* (Y-S3) |
| **VAL-REC-YCTD-03** | Qty vs cell in_plan | ≤ remaining / policy ô; replace đúng vị trí OK | Vượt → **409** (**O2** default) |
| **VAL-REC-YCTD-04** | `out_of_plan_reason` | Non-empty when out_of_plan | Missing → **400** (Y-S5) |
| **VAL-REC-YCTD-05** | `hire_reason` | `new` \| `replace` | Missing → **400** (Y-S6) |
| **VAL-REC-YCTD-06** | `replace_employee_id` | Required when replace · ∈ scope | Missing/invalid → **400** |
| **VAL-REC-YCTD-07** | JD ref | Hiệu lực + scope; REQUIRED per position policy | Ngừng / missing required → **4xx** |
| **VAL-REC-YCTD-08** | Submit status | → `pending_approval` + start XBOS | create→`open` = **FAIL** (Y-S7) |
| **VAL-REC-YCTD-09** | Matrix key | SHORT when in_plan; LONG when out_of_plan; snapshot `approval_matrix_key` | in_plan long-only / out short-only = **FAIL** HC-05/06 |
| **VAL-REC-YCTD-10** | BOD gate out_of_plan | Receivable chỉ sau BOD approve | Open/CV/posted sớm → **409** (Y-S9) |
| **VAL-REC-YCTD-11** | Receivable token | Normative `open_for_hire` (**O3**) | Synonym `open` chỉ filter legacy — không bypass gate |
| **VAL-REC-YCTD-12** | Spawn UQ | Manual create không trùng `uq_job_requisitions_spawn_cell` | Duplicate → **409** |
| **VAL-REC-YCTD-13** | Campaign | Absent / optional flags on YCTD | Bắt buộc Campaign = **FAIL** REC-03 |
| **VAL-REC-YCTD-14** | Legacy mode NULL | Read OK + warn; mutate classify; block CV | Silent treat as in_plan = **FAIL O4** |
| **VAL-REC-YCTD-15** | Proposals tab | Non-SoT; no dual-write | Dual persist = **FAIL O5** |
| **VAL-REC-YCTD-16** | Scope parity | list = get = mutate = transitions = flags | Mismatch = **FAIL U19** |
| **VAL-REC-YCTD-17** | Reject reason | Required on reject | Missing → **4xx** |
| **VAL-REC-YCTD-18** | U65 | FE-only evidence | Seed/API fake = **FAIL** |

---

## 6. Traceability — UC → BR → partner_req → AC → Journey/UF

| UC | BR | partner_req | Decision | AC (primary) | UF / J-* |
|----|-----|-------------|----------|--------------|----------|
| **UC-BP-REC-02** | BR-BP-HC-05 · BR-BP-JD-01 · BR-YCTD-JD-REF-01/02 · BR-REC-02-* | **REQ_REC_001** | **Q-REC-HEADCOUNT** RETAIN · **Q-REC-HC-2** SHORT min | AC-REC-YCTD-02…02f · ALT · EX · VAL-01..03,05..13,16..18 | **UF-HRM-REC-YCTD-02** *(new DRAFT)* · **J-HRM-REC-YCTD-02** · must_keep **UF-HRM-12** / **J-HRM-05** / **J-HRM-JD-YCTD-01** / **J-REC-WF-*** |
| **UC-BP-REC-02b** | **BR-BP-HC-06** · JD refs · BR-REC-02b-REASON · Y-S9 | **REQ_REC_001** | **Q-REC-HEADCOUNT** ngoài ĐB+BOD | AC-REC-YCTD-02b-01…06 · ALT · EX · VAL-04,09..11,14..18 | **UF-HRM-REC-YCTD-02b** *(new DRAFT)* · **J-HRM-REC-YCTD-02b** |
| UC-BP-REC-01/01b | BR-BP-HC-04 · cell/mode | REQ_REC_003 | — | Peer sealed | must_keep spawn spine |
| UC-BP-REC-03 | — | REQ_REC_002 | R-CAMPAIGN OUT | — | **DENY** |

### UF matrix note

| UF | Status | Relation |
|----|--------|----------|
| **UF-HRM-12** | 🟢 Dev8088 | Requisition CRUD — **must_keep**; wave **nâng** mode/gate — **không** đè regression path JD/list |
| **J-HRM-JD-YCTD-01** | ✅ PASS slice | JD bind — **RETAIN** |
| **UF-HRM-REC-YCTD-02 / 02b** | ⬜ DRAFT | Thêm khi Dev wire FE; QA browser U65 |

### Journey placeholders (U19)

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-REC-YCTD-02** | Login TP/HR → Tuyển dụng → Yêu cầu tuyển → tạo từ ô Cần tuyển approved → JD Hiệu lực → hire_reason → Lưu → Gửi duyệt → Approver SHORT duyệt (FE) → F5 `open_for_hire` + JD → click detail | AC-REC-YCTD-02* · U65 · no seed |
| **J-HRM-REC-YCTD-02b** | Login → tạo YCTD ngoài ĐB + out_of_plan_reason → JD → Gửi → **assert block CV** → BOD duyệt (FE) → F5 receivable → detail; reject path không mở tin | AC-REC-YCTD-02b* · BR-BP-HC-06 · Y-S9 · U65 |

**Group CEO:** list/detail rollup `company_id=main` (EX-08); không bypass BOD gate trên out_of_plan.

---

## 7. Honesty & must_keep

| Lock | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `C-SLICE-≠-MODULE` | Slice GWC YCTD mode ≠ module REC UAT |
| DENY | REC-03 · dual YCTD SoT · Nest `/rec` dual · seed · invent warn-cho-qua · re-litigate Q-REC-HEADCOUNT · flip product_go |
| must_keep | UF-HRM-12🟢 · J-HRM-05 · J-HRM-JD-YCTD-01 · J-REC-WF-* · REC-01 spawn/`headcount_cell_id`/`headcount_mode` · JD soft FK · XBOS requisition bridge |

---

## 8. Handoff expectations

| Role | Expectation | Done when |
|------|-------------|-----------|
| **ba-data** | Physical DOC-DELTA Option A: `hire_reason` · `replace_employee_id` · `out_of_plan_reason` · `approval_matrix_key` · pipeline_flags · CHK status/`open_for_hire` · legacy NULL mode policy · **DENY** dual `rec_recruitment_request` table | DATA CONFIRMED |
| **sa** | TechSpec/API F.1 depth YCTD-01..04 trên **physical** `/recruitment/requisitions*` + transitions + pipeline-flags + error tokens · cite bước SRS | Spec DOC-DELTA CONFIRMED |
| **dev-be / dev-fe** | Sau DATA+API — wire gates U65; SHORT/LONG conditions; BOD block; spawn regression | READY_FOR_QA |
| **qa** | Browser J-HRM-REC-YCTD-02 / 02b · block CV trước BOD · F5 · O2 409 · O4 classify | PASS_TO_PM / FAIL |
| **qc** | GWC slice only; honesty false | GWC ≠ module GO |

---

## 9. Open risks / clarifications

| ID | Risk | Owner | Resolution path |
|----|------|-------|-----------------|
| R1 | Dev tạo dual Nest `/rec` hoặc second table | ba-data/tm | DENY Option B · O1 |
| R2 | Create vẫn `open` immediate | qa | FAIL VAL-08 / Y-S7 |
| R3 | Open tin trước BOD out_of_plan | qa | FAIL AC-02b-04 / Y-S9 |
| R4 | Proposals dual-write | qa/dev | FAIL O5 |
| R5 | Claim module REC UAT sau slice | qc | Honesty false · C-SLICE |
| R6 | CFG `force_out_of_plan` confusion | ba-data | HOLD — MVP = reject only (**O2**) |

**SRS gap?** Không. **SA Option A** + **O1–O5** sealed. **Không BLOCKED**. Peer residual `R-REC-HC-OVERRIDE-CELLID` = **orthogonal** (không mở lại trong seat này).

---

## 10. Completion

| Field | Value |
|-------|-------|
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **next_owner** | **ba-data** (physical Option A) rồi **sa** (API F.1) — PM có thể song song |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-ba-01.md` |
