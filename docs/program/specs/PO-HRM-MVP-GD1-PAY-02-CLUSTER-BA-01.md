# BA AC pack — Wave-38 PAY cluster · UC-BP-PAY-02 (Động cơ công thức lương · RETAIN metadata engine + gd1_eval_v1 · GAP author/publish/preview/process AC)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-02-CLUSTER-BA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 — Wave-38 seat **#43**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O16 **CONFIRMED** · **ba-data HOLD default** next · dev-fe/dev-be **HOLD** until DATA/API stamp · **DENY** claim table/evaluator jest alone = PAY-02 DONE · **DENY** claim publish/preview 2xx alone = FR-PAY-02 DONE · **DENY** PAY module UAT · **printable false RETAIN** · **C-SLICE** |
| **change_mode** | **ADD** (align SA PAY-02 gap-only RETAIN — **no** GĐ1 DnD requirement · **no** FE net SoT · **no** hardcode tenant formula in Nest · **no** open/draft sheet hour vars · **no** Leave/OT HTTP in bag · **no** invent `att_leave_hold` · **no** merge sick/compensatory/carry→annual · **no** wipe **`PAY01QC1-MSMBGWC1`** / **`ATT12QC1-MSMAIGWC1`** / **`ATT11QC1-MSLXTH9P`** / peer seals · **DENY reopen J-HRM-PAY-01-*** / **J-HRM-ATT-12-*** / **J-HRM-ATT-07-03..05** / **J-HRM-ATT-06-04** without regression bus) |
| **uc_ids** | `UC-BP-PAY-02` · `FR-UC-BP-PAY-02` · **BR-BP-PAY-01** · **AC-PAY-COMP-01** · peer **FR-UC-BP-PAY-01** (**Q-PAY-F-3** · **F-PAY-ATT-CLOSED-01**) · cross **FR-UC-BP-PAY-06** |
| **depends_on** | `PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01` **Option A LOCKED** · PAY-01 QC **`PAY01QC1-MSMBGWC1`** · **`PAY01QA1-MSMBA9OA`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** · `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01` **CONFIRMED** |
| **ref_sa** | `PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md` · `PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md` (closed-sheet must_keep) |
| **ref_api** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md` (**F-PAY-FORMULA-*** F.1 SoT) |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-02** · Diễn biến **#0a–#3 + Thành công** · **R-PAY-DD-01** · **Q-PAY-F-3** |
| **ref_evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-01-cluster-qc-01.md` (**PAY01QC1** · J-05 FORMULA-412 HOLD→PAY-02) |
| **Honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE-≠-MODULE** · **DENY** gd1_eval_v1 jest alone = PAY-02 DONE · **DENY** PAY / ATT module UAT DONE |
| **Cấm** | GĐ1 DnD as requirement · FE net on preview/process · hardcode formula in Nest · draft formula on live process · open sheet vars · Leave/OT HTTP for hour vars · flip `payroll_e2e_ready` · reopen sealed PAY-01/ATT journeys · wipe peer seals · seed · apps/** · honesty flip |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U65)** cho Wave-38 seat **#43** — **gap-only RETAIN** LIVE động cơ metadata **`pay_formula_definitions`** + dual-control publish + **`gd1_eval_v1`** evaluator + process/preview bind **published** formula — **must_keep** ranh giới PAY-01 closed-sheet (**`PAY01QC1-MSMBGWC1`** · **F-PAY-ATT-CLOSED-01** · **`HRM-PAY-ATT-412`** trước eval) · **GAP** AC form author GĐ1 · dual publish browser · preview display-ready · process sau bind+publish · **AC-PAY-COMP-01** trên bind surfaces · mint **J-HRM-PAY-02-*** + regression **J-HRM-PAY-01-*** / ATT peers:

1. **Engine SoT** = `pay_formula_definitions` versioned — **cấm** `salary_components.formula` TEXT as versioned engine (**O1** · G-PAY-F-07).
2. **GĐ1 surface** = **form** author only — DnD = **GĐ2 OUT** (**O2** · **R-PAY-DD-01**).
3. **Dual-control** author ≠ publisher · **`HRM-PAY-FORMULA-403-DUAL`** (**O3**).
4. **`required_vars_json`** before publish · **`HRM-PAY-FORMULA-412-VARS`** (**O4**).
5. **Closed-sheet vars** preview/process — **must_keep PAY-01** · no Leave/OT HTTP (**O5** · **Q-PAY-F-3**).
6. **Process order** **ATT-412** → then **FORMULA-412** if no publish (**O6** · J-PAY-01-05).
7. **Evaluator depth** `gd1_eval_v1` = **C-SLICE** — tax/BH/split = PAY-03/04/05/06 (**O7**).
8. **AC-PAY-COMP-01** picker from catalog on bind surfaces (**O8**).
9. **Catalog admin** may add code · bind form **no** free-text SoT (**O9**).
10. **Preview** BE SoT · FE lines only (**O10**).
11. **Immutability** `active` → new version only (**O11**).
12. **scope_parity** formulas list ↔ get ↔ mutate (**O12** · U19).
13. **Regression** **DENY reopen** sealed J-PAY-01 / J-ATT (**O13**).
14. **must_keep** PAY01 + ATT12 + ATT11 + peer chain (**O14**).
15. **Honesty** mint **J-HRM-PAY-02-*** · `payroll_e2e_ready=false` (**O15**).
16. **J-PAY-01-05** FORMULA-412 after closed bind = **expected** path into PAY-02 AC — non-blocking PAY-01 GWC (**O16**).

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| C&B Author | Soạn bản nháp form GĐ1 · `expression_json` opaque · không tự publish |
| Technical Publisher | Bước 2 phát hành · **≠** cùng subject với author khi dual-control bật |
| C&B / Payroll Admin | Preview · gắn công thức kỳ · chạy process sau closed bind |
| Hệ thống PAY | Evaluate BE · **FORMULA-412** / **ATT-412** honesty · **cấm** FE net SoT |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O16 CONFIRM · AC-PAY-02-* · residuals **R-PAY-02-*** | Impl `apps/**` / migration / seed |
| RETAIN cite formula lifecycle · evaluator · preview/process path | GĐ2 DnD designer · template override AMIS layer 3 |
| GAP AC author FE · publish/preview/process U65 · COMP-01 | PAY-04 split-month · PAY-06 full hire→payslip e2e |
| Unlock **ba-data HOLD** default | Claim jest/metadata = PAY-02 DONE · PAY module UAT |
| Regression PAY-01 + ATT attach | Flip `payroll_e2e_ready` |

### SA Option A — BA CONFIRM (đóng O1–O16)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Engine SoT | **YES** — Versioned engine = **`pay_formula_definitions`** (`expression_json` opaque · lifecycle SM) · **cấm** coi `salary_components.formula` TEXT là engine SoT · **AC-PAY-02-ENGINE-SOT** · cite **G-PAY-F-07** |
| **O2** | GĐ1 surface | **YES** — Authoring GĐ1 = **biểu mẫu form** only · kéo-thả DnD = **GĐ2 OUT** · **AC-PAY-02-≠-DND-GD1** · **R-PAY-DD-01** footer |
| **O3** | Dual-control | **YES RETAIN + AC** — Author submit-publish · Publisher publish · JWT subject publish **must ≠** `authored_by` → **`403` `HRM-PAY-FORMULA-403-DUAL`** · U65 browser · **AC-PAY-FORMULA-02/03** · **AC-PAY-02-DUAL-403** |
| **O4** | Publish vars | **YES RETAIN + AC** — `submit-publish` without `required_vars_json` allow-list → **`412` `HRM-PAY-FORMULA-412-VARS`** · **AC-PAY-FORMULA-05** · **AC-PAY-02-VARS-412** |
| **O5** | Closed-sheet vars | **YES must_keep PAY-01** — Preview/process variable bag = **F-PAY-ATT-CLOSED-01** + CORE C&B only · **cấm** Leave/OT HTTP for hour vars · **Q-PAY-F-3** · **AC-PAY-02-CLOSED-VARS** · **AC-PAY-02-≠-CROSS-READ** (peer PAY-01) |
| **O6** | Process order | **YES** — **`HRM-PAY-ATT-412`** (no closed bind/sheet) **before** formula eval · missing/unpublished formula → **`HRM-PAY-FORMULA-412`** family · **no** silent zero UAT · **AC-PAY-02-PROCESS-ORDER** · maps **J-HRM-PAY-01-05** HOLD→PAY-02 |
| **O7** | Evaluator depth | **YES C-SLICE** — **`gd1_eval_v1`** = gross/net component lines stub depth · full statutory tax/BH/split = **PAY-03/04/05/06** · **AC-PAY-02-≠-FULL-PAYROLL** · **AC-PAY-02-EVAL-SLICE** |
| **O8** | AC-PAY-COMP-01 | **YES GAP AC** — Khi danh mục `salary_components` còn phần tử hiệu lực: bind mẫu/kỳ/enroll **chỉ chọn mã từ danh mục** · mã lạ → từ chối lưu · F5 không mã lạ · **AC-PAY-02-COMP-01** · SRS **#0b–0c** |
| **O9** | Catalog admin | **YES** — Màn quản trị danh mục **được thêm mã mới** (open catalog · reject closed enum on new code) · **≠** áp «chỉ chọn mã có sẵn» lên admin · **AC-PAY-02-CATALOG-N+1** · SRS **#0a** |
| **O10** | Preview | **YES RETAIN + AC** — **`POST …/formulas/:id/preview`** BE evaluate · FE **chỉ hiển thị** `lines[]` display-ready (`componentCode`, `amountVnd` vi-VN) · **cấm** FE POST net tự tính · **AC-PAY-FORMULA-04** · **AC-PAY-02-PREVIEW-BE** |
| **O11** | Immutability | **YES RETAIN + AC** — `status=active` reject PATCH `expression_json` → **`409` `HRM-PAY-FORMULA-409-IMMUTABLE`** · đổi = **`POST …/:code/versions`** draft mới · period bind frozen after process · **AC-PAY-02-IMMUTABLE** |
| **O12** | scope_parity | **YES RETAIN + AC** — `GET /payroll/formulas` list vs `GET …/:id` vs mutate cùng `resolveHrmListScope` / company slug như periods · deep link id ngoài scope → **404/409** nhất quán · **AC-PAY-02-SCOPE-PARITY** · U19 |
| **O13** | Regression | **YES must_keep** — **DENY reopen** **J-HRM-PAY-01-01..07** · **J-HRM-ATT-12-07** · **J-HRM-ATT-07-03..05** · **J-HRM-ATT-06-04** without regression bus + **`PAY01QC1`** / **`ATT12QC1`** / **`ATT07QC1`** stamps · **AC-PAY-02-≠-REOPEN-JOURNEYS** |
| **O14** | must_keep stamps | **YES** — **`PAY01QC1-MSMBGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** · **DENY** merge sick/compensatory/carry→annual · **DENY** `att_leave_hold` · **AC-PAY-02-MK-PEERS** |
| **O15** | Honesty / journeys | **YES** — Mint **`J-HRM-PAY-02-01..08` DRAFT** · U65 FE-after-2xx+F5 · attach regression PAY-01 + ATT subset · `payroll_e2e_ready=false` · **≠ PAY module UAT** · **≠ FR-UC-BP-PAY-02 module DONE** · **C-SLICE** · **AC-PAY-02-H** |
| **O16** | J-PAY-01-05 | **YES** — **`HRM-PAY-FORMULA-412`** sau closed bind = **expected** until publish+process AC đóng · **non-blocking** PAY-01 GWC · QA **không** demote PAY-01 seal vì FORMULA-412 alone · **AC-PAY-02-J01-05-BRIDGE** |

### Primary API surface (BA lock)

| Intent | Physical (normative) | Paper alias | SRS Diễn biến |
|--------|----------------------|-------------|---------------|
| Author draft (RETAIN) | **`POST/PUT /api/hrm/payroll/formulas*`** · **`POST …/:code/versions`** | F-PAY-FORMULA-AUTHOR-01 | **#1** · **#0a** admin |
| Publish dual (RETAIN) | **`POST …/submit-publish`** · **`POST …/publish`** | F-PAY-FORMULA-PUBLISH-01 | **#2** |
| List/get (RETAIN) | **`GET /api/hrm/payroll/formulas`** · **`GET …/:id`** | F-PAY-FORMULA-LIST-01 | scope · picker |
| Preview (RETAIN) | **`POST …/formulas/:id/preview`** | F-PAY-FORMULA-PREVIEW-01 | **#3** trial |
| Process bind eval (partial) | **`POST …/payroll/periods/{id}/process`** | F-PAY-PROCESS-01 | **#3** · **must_keep ATT-412 first** |
| Component catalog (RETAIN partial) | **`GET|POST|PATCH …/salary-components`** | F-PAY-COMP-CATALOG-01 | **#0a–0c** |
| Closed-sheet bag (peer PAY-01) | Internal **F-PAY-ATT-CLOSED-01** | F-PAY-ATT-CLOSED-01 | **Q-PAY-F-3** |

**Invariant PAY-02-PATH:** Formula mutate/preview/process Network **MUST** hit `/api/hrm/payroll/formulas*` + `/payroll/periods/*/process` — Nest `/api/hrm/core/**` as formula/hour SoT = **FAIL O5**.

**Invariant PAY-02-≠-METADATA-DONE:** Claim `pay_formula_definitions` table or jest `gd1_eval_v1` alone = FR-PAY-02 / PAY-02 DONE = **FAIL O7/O15**.

**Invariant PAY-02-≠-PUBLISH-DONE:** Claim dual-control service exists without U65 publish AC = module DONE = **FAIL O3/O15**.

**Invariant PAY-02-≠-FE-NET:** FE computes preview/process net without BE evaluate response = **FAIL O10** (OS 28).

**Invariant PAY-02-≠-DRAFT-ON-LIVE:** Process with `status=draft` formula without **FORMULA-412** = **FAIL O6/O11**.

**Invariant PAY-02-HOLD-DUAL:** Invent physical `att_leave_hold` = **FAIL O14**.

**Invariant PAY-02-≠-REOPEN:** Demote sealed PAY-01/ATT journeys without bus = **FAIL O13/O15**.

**Invariant PAY-02-PROCESS-HOLD:** Evidence claiming PAY-02 DONE when tax/BH/split/payslip security (PAY-03/08) not stamped = **FAIL O7/O15**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-02 / FR-UC-BP-PAY-02 module DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT** · printable false · **`gd1_eval_v1` = C-SLICE not full statutory payroll** · GĐ2 DnD **OUT** · must_keep **`PAY01QC1-MSMBGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT peer chain · **F-PAY-ATT-CLOSED-01 RETAIN** · DENY `att_leave_hold` · DENY merge sick/compensatory/carry→annual · DENY FE net SoT · DENY reopen J-HRM-PAY-01-* / J-HRM-ATT-12-* / J-07-03..05 / J-06-04 · metadata/publish alone **necessary not sufficient** · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-38 #43 · Option A) |
|---|----------------------|--------------------------------|
| Formula definitions SM | `pay-formula.service` lifecycle **PRESENT** | **RETAIN cite** + author FE GAP (**O2/R-PAY-02-AUTHOR-FE**) |
| Dual publish | `HRM-PAY-FORMULA-403-DUAL` jest **PRESENT** | **RETAIN cite** + U65 publish AC (**O3**) |
| Evaluator | `gd1_eval_v1` **PRESENT** | **RETAIN cite** · **≠ full payroll** (**O7**) |
| Preview | endpoint **PRESENT** | **RETAIN cite** + display AC (**O10**) |
| Process + formula | bind published + **FORMULA-412** **PRESENT** | **RETAIN** + order ATT-412 first (**O5/O6**) |
| Closed-sheet vars | **F-PAY-ATT-CLOSED-01** via PAY-01 **SEALED** | **must_keep PAY01QC1** (**O5/O14**) |
| COMP-01 surfaces | partial | **GAP** **R-PAY-02-COMP-01** (**O8/O9**) |
| C&B bag trace | partial | **GAP** **F-PAY-CB-READ-01** trace (**carry**) |
| GĐ2 DnD | not in scope | **OUT** (**O2**) |
| PAY-04/06 depth | queued | **HOLD** footers |

### 1.1 Residual map **R-PAY-02-*** (engine unlock)

| ID | Scope | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **R-PAY-02-AUTHOR-FE** | GĐ1 form author UX (not DnD) | **IN-SCOPE GAP** | **dev-fe** + **qa** U65 |
| **R-PAY-02-PUBLISH-AC** | Dual publish browser + F5 immutability | **IN-SCOPE AC** | **dev-fe** + **qa** |
| **R-PAY-02-PREVIEW-AC** | Preview 2xx + line breakdown display-ready | **IN-SCOPE AC** | **dev-fe** + **qa** |
| **R-PAY-02-PROCESS-AC** | Process after bind+publish+closed sheet (412 family) | **IN-SCOPE AC** | **dev-be** + **qa** |
| **R-PAY-02-COMP-01** | AC-PAY-COMP-01 on template/period/enroll | **IN-SCOPE GAP** | **dev-fe** + **qa** |
| **R-PAY-02-CATALOG-N+1** | Open catalog — reject closed enum on new code | **IN-SCOPE AC** | **dev-be** + **qa** |
| **R-PAY-02-VARS** | `required_vars_json` / FORMULA-412-VARS | **IN-SCOPE AC** | **qa** |
| **R-PAY-02-JOURNEY** | J-HRM-PAY-02-* DRAFT + regression | **IN-SCOPE** (this pack) | **qa** |
| **R-PAY-02-EVAL-DEPTH** | gd1_eval_v1 ≠ full tax/BH/split | **HOLD footer** | PAY-03/04/05/06 |
| **F-PAY-CB-READ-01** | C&B vars into bag | **TRACE GAP** | PAY-06 peer · **≠ PAY-02 DONE** |
| **F-PAY-RD-APPLY-01** | KT/KL | **HOLD** | CORE-08 · PAY-06 |

**Carry (non-blocking):** AMIS template override layer 3 · payslip ESS security PAY-08 · split-month PAY-04 — **do not block** PAY-02 BA closure.

---

## 2. Business rule table (normative)

| Rule ID | Condition | Action | Outcome | Test hook |
|---------|-----------|--------|---------|-----------|
| **BR-BP-PAY-01** | Công thức theo công ty | Metadata engine · không hardcode Nest mỗi kỳ | Publish versioned | AC-PAY-02-ENGINE-SOT · J-02 |
| **BR-BP-PAY-DUAL** | Author = publisher JWT | Từ chối publish | **403** `HRM-PAY-FORMULA-403-DUAL` | J-03 · O3 |
| **BR-BP-PAY-VARS** | Thiếu `required_vars_json` khi submit-publish | Chặn | **412** `HRM-PAY-FORMULA-412-VARS` | J-03 · O4 |
| **BR-BP-TS-03** (peer PAY-01) | Biến giờ trong eval | Chỉ closed sheet + locked line | **Cấm** Leave/OT HTTP | AC-PAY-02-CLOSED-VARS · J-05 |
| **AC-PAY-COMP-01** | Danh mục còn phần tử · gắn mã trên form | Picker bắt buộc | Từ chối mã lạ | J-06 · O8 |
| **BR-BP-PAY-IMMUTABLE** | `status=active` | Không PATCH expression | New version draft | J-04 · O11 |
| **BR-BP-PAY-PROCESS-ORDER** | Process kỳ | ATT-412 trước · formula published | FORMULA-412 nếu thiếu publish | J-05 · O6 |
| **BR-BP-LV-06** (peer) | Leave hold | `pending_days` ATT-09 | **DENY** `att_leave_hold` | Regression J-07-04 |
| **BR-BP-LV-03-SEP** (peer) | Multi-bucket | Display/grant | **DENY** merge compensatory/sick/carry→annual | J-06-04 · J-07 |

---

## 3. SRS trace — Diễn biến → AC → J-* → API

| SRS | Nội dung | AC pack | Journey | API (LIVE/GAP) |
|-----|----------|---------|---------|----------------|
| **#0a** | Admin thêm mã TP | **CATALOG-N+1** | **J-HRM-PAY-02-01** | salary-components RETAIN |
| **#0b–0c** | Gắn mã từ danh mục | **COMP-01** | **J-HRM-PAY-02-06** | COMP GAP |
| **#1** | Soạn form GĐ1 | **AUTHOR** | **J-HRM-PAY-02-02** | F-PAY-FORMULA-AUTHOR RETAIN |
| **#2** | Phát hành dual | **DUAL-403** · **VARS-412** | **J-HRM-PAY-02-03** | F-PAY-FORMULA-PUBLISH RETAIN |
| **#3** | Preview / chạy kỳ | **PREVIEW-BE** · **PROCESS-ORDER** | **J-HRM-PAY-02-04** · **J-05** | PREVIEW/PROCESS RETAIN |
| **Thành công** | CT hiệu lực | **≠-FULL-PAYROLL** footer | **J-HRM-PAY-02-08** | **≠ module UAT** |
| Peer PAY-01 | Closed sheet | **CLOSED-VARS** | **J-HRM-PAY-01-02..06** regression | F-PAY-ATT-CLOSED-01 |
| O13/O14 | Peer seals | **MK-PEERS** · **≠-REOPEN** | **J-ATT-12/07/06** regression | — |

### 3.1 AC-PAY-02 pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-PAY-02-PATH** | Any PAY-02 path | Network | `/payroll/formulas*` + `/payroll/periods/*/process` · Nest `/core` formula/hour SoT **0** | U65 · J-* |
| **AC-PAY-02-ENGINE-SOT** | Footer / design | AC text | Engine = `pay_formula_definitions` · **≠** `salary_components.formula` TEXT SoT | O1 |
| **AC-PAY-02-≠-DND-GD1** | Requirement doc | Scope | GĐ1 form only · DnD **OUT** GĐ2 | O2 |
| **AC-PAY-02-AUTHOR-DRAFT** | C&B author | **POST/PUT** formula draft FE | **2xx** · `status=draft` · F5 list shows draft | O2 · J-02 |
| **AC-PAY-02-DUAL-403** | Same user author+publish | **POST publish** FE | **403** `HRM-PAY-FORMULA-403-DUAL` | O3 · J-03 |
| **AC-PAY-02-PUBLISH-2XX** | Publisher ≠ author · vars OK | Publish FE | **2xx** · `status=active` · F5 immutable expression | O3/O11 · J-03 |
| **AC-PAY-02-VARS-412** | Missing required_vars | submit-publish FE | **412** `HRM-PAY-FORMULA-412-VARS` | O4 · J-03 |
| **AC-PAY-02-CLOSED-VARS** | Preview/process | Bag source | Closed sheet vars only · cite **PAY01QC1** | O5 · J-04/J-05 |
| **AC-PAY-02-≠-CROSS-READ** | Preview/process window | DevTools | **No** leave/OT HTTP for hour vars | O5 · J-05 |
| **AC-PAY-02-PROCESS-ORDER** | No closed bind | Process FE | **412** `HRM-PAY-ATT-412` **before** formula eval | O6 · regression J-PAY-01-04 |
| **AC-PAY-02-FORMULA-412** | Closed bind · no published formula | Process FE | **412** `HRM-PAY-FORMULA-412` · **≠** silent zero | O6/O16 · J-05 |
| **AC-PAY-02-PREVIEW-BE** | Active/draft + sample bag | **POST preview** FE | **2xx** · `lines[]` display-ready · **≠** FE-only net math | O10 · J-04 |
| **AC-PAY-02-IMMUTABLE** | Active formula | PATCH expression FE | **409** `HRM-PAY-FORMULA-409-IMMUTABLE` | O11 · J-04 |
| **AC-PAY-02-SCOPE-PARITY** | List vs get id | Deep link / scope | Same company resolver · OOS id **404/409** | O12 |
| **AC-PAY-02-COMP-01** | Catalog non-empty | Bind component on period/template FE | Picker only · invalid code → reject save | O8 · J-06 |
| **AC-PAY-02-CATALOG-N+1** | Admin catalog | **POST** new component code | **2xx** · F5 list includes new code | O9 · J-01 |
| **AC-PAY-02-EVAL-SLICE** | Evidence | Footer | `gd1_eval_v1` cited · tax/BH/split **HOLD** PAY-03+ | O7 |
| **AC-PAY-02-≠-FULL-PAYROLL** | Partial eval LIVE | DONE claim | **FAIL** if stub = PAY-02 DONE | O7/O15 |
| **AC-PAY-02-MK-PEERS** | Footer | Stamps | **PAY01QC1** + **ATT12+ATT11+ATT10+ATT09+ATT07+ATT06+ATT05b+CORE07** · DENY merge · DENY `att_leave_hold` | O14 |
| **AC-PAY-02-≠-REOPEN-JOURNEYS** | Sealed J-PAY-01 / J-ATT | Reopen without bus | **FAIL** | O13 |
| **AC-PAY-02-J01-05-BRIDGE** | PAY-01 GWC | J-05 FORMULA-412 | **Expected** until PAY-02 process AC · non-blocking PAY01QC1 | O16 |
| **AC-PAY-02-H** | Program | QC GWC | `payroll_e2e_ready=false` · **≠ PAY-02 DONE** · **≠ PAY UAT** · C-SLICE | O15 · J-08 |

---

## 4. J-HRM-PAY-02-* DRAFT (narrow · U65 · Nest `/core` formula/hour SoT 0)

| Journey ID | Slice | Title | Click path (browser · U65) | AC / lock |
|------------|-------|-------|----------------------------|-----------|
| **J-HRM-PAY-02-01** | **catalog** | **Quản trị thêm mã thành phần lương (open catalog)** | Login `ceo@xe.vn` → HRM → **Tiền lương** → tab **Thành phần lương** (SRS #0a) → **Thêm** mã hợp lệ → **Lưu** → **F5** mã còn trên danh sách · Network **2xx** | AC-PAY-02-CATALOG-N+1 · O9 · **DRAFT** |
| **J-HRM-PAY-02-02** | **author** | **Soạn bản nháp công thức form GĐ1** | Màn **Công thức lương** (form · **không** DnD) → tạo/sửa draft · `expression_json` qua UI form → **Lưu** **2xx** · F5 draft còn · **≠** tự set active | AC-PAY-02-AUTHOR-DRAFT · O1/O2 · **DRAFT** |
| **J-HRM-PAY-02-03** | **publish** | **Hai bước phát hành — dual-control** | Author **Trình phát hành** (vars đủ → **2xx**; thiếu vars → **412-VARS**) · Publisher khác account **Phát hành** **2xx** · cùng user → **403-DUAL** · F5 `status=active` | AC-PAY-02-DUAL-403 · PUBLISH-2XX · VARS-412 · O3/O4/O11 · **DRAFT** |
| **J-HRM-PAY-02-04** | **preview** | **Xem trước BE — FE chỉ hiển thị dòng** | Chọn công thức + NV/kỳ mẫu (bag closed+C&B) → **Xem trước** → **POST preview** **2xx** · bảng `lines[]` amount vi-VN · **≠** FE tự tính net ẩn | AC-PAY-02-PREVIEW-BE · O10 · **DRAFT** |
| **J-HRM-PAY-02-05** | **process** | **Chạy kỳ sau bind chốt + công thức publish** | Prerequisite **J-PAY-01-02** closed bind (**PAY01QC1**) · formula **active** · **Chạy tính lương** → **ATT-412** nếu thiếu chốt · else **FORMULA-412** nếu thiếu publish · else **2xx** partial lines · **≠ PAY-02 DONE** | AC-PAY-02-PROCESS-ORDER · FORMULA-412 · O5/O6/O7/O16 · **DRAFT** |
| **J-HRM-PAY-02-06** | **comp-bind** | **Gắn mã thành phần — AC-PAY-COMP-01** | Màn gắn mã kỳ/mẫu (SRS #0b) · danh mục còn phần tử → **chỉ picker** · thử mã lạ → từ chối · F5 không mã lạ | AC-PAY-02-COMP-01 · O8 · **DRAFT** |
| **J-HRM-PAY-02-07** | **scope** | **List → chi tiết công thức — scope parity** | Danh sách công thức → click row → detail **2xx** · deep link id hợp scope · id ngoài scope **404/409** | AC-PAY-02-SCOPE-PARITY · O12 · **DRAFT** |
| **J-HRM-PAY-02-08** | **cross** | **Seals · honesty · regression PAY-01/ATT — ≠DONE** | (a) Nest `/core` SoT **0** (b) **≠ PAY-02 / FR-PAY-02 DONE** · **≠ PAY module UAT** · `payroll_e2e_ready=false` (c) must_keep **PAY01QC1** · **ATT12QC1** · **ATT11QC1** · peer chain (d) **DENY merge** buckets (e) **DENY reopen** sealed J-* (f) **gd1_eval_v1 = C-SLICE** · GĐ2 DnD OUT | AC-PAY-02-H/MK-* · O13–O15 · **DRAFT** |

### 4.1 Mandatory regression (attach to PAY-02 QC — do not reopen sealed PAY-01/ATT)

| Journey ID | Slice | Title | Click path | AC / lock |
|------------|-------|-------|------------|-----------|
| **J-HRM-PAY-01-01** | **regression** | **PAY-01 period scope — non-regression** | Re-run **PAY01QC1** subset when formula menu touched | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-02** | **regression** | **Closed bind — non-regression** | Bind closed **2xx** · **ATT11QC1** cite | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-04** | **regression** | **Process ATT-412 — non-regression** | No closed → **412** `HRM-PAY-ATT-412` | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-06** | **regression** | **Cross-read 0 — non-regression** | No leave/OT HTTP on process | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-ATT-12-07** | **regression** | **ATT-12 seals — panel/activate ≠ formula trigger** | Footer subset **ATT12QC1** | **`ATT12QC1`** · **DRAFT** |
| **J-HRM-ATT-07-03** | **regression** | **Nộp đơn ốm — non-regression** | Sick submit **2xx** **ATT07QC1** | **`ATT07QC1`** · **DRAFT** |
| **J-HRM-ATT-07-04** | **regression** | **Hold pending_days — non-regression** | **DENY `att_leave_hold`** | **`ATT09QC1`** · **DRAFT** |
| **J-HRM-ATT-07-05** | **regression** | **Fund-order — non-regression** | **ATT07QC1** | **`ATT07QC1`** · **DRAFT** |
| **J-HRM-ATT-06-04** | **regression** | **Quỹ compensatory — non-regression** | Panel separate · **≠** merge→`annual` | **`ATT06QC1`** · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC **C-SLICE** only · **≠** auto-flip `payroll_e2e_ready` · **narrow ≠ full PAY module**.

**BA trace:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` **§64** (minted with this pack).

---

## 5. HOLD / GAP rows (explicit — QC/Dev must not claim LIVE)

| ID | Topic | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **G-PAY-02-AUTHOR-FE** | Form GĐ1 author fidelity | **GAP** | **dev-fe** |
| **G-PAY-02-PUBLISH-FE** | Dual publish UI | **GAP AC** | **dev-fe** |
| **G-PAY-02-PREVIEW-FE** | Lines display-ready bind | **GAP AC** | **dev-fe** |
| **G-PAY-02-PROCESS-AC** | Full process U65 after publish | **GAP AC** | **dev-be** + **qa** |
| **G-PAY-02-COMP-FE** | Picker COMP-01 on bind surfaces | **GAP** | **dev-fe** |
| **H-PAY-02-EVAL-DEPTH** | tax/BH/split statutory | **HOLD** | PAY-03/04/05 |
| **H-PAY-02-DND** | GĐ2 designer | **OUT** | GĐ2 program |
| **H-PAY-02-TPL-OVERRIDE** | AMIS layer 3 | **HOLD** GĐ1.5 | SA parity wave |
| **H-PAY-02-CB-RD** | F-PAY-CB-READ-01 / RD | **TRACE HOLD** | PAY-06 |
| **H-PAY-02-ATT-LEAVE-HOLD-TABLE** | Physical `att_leave_hold` | **DENY invent** | **ba-data** confirm DENY |

---

## 6. Handoff package

| To | Expectation | Done when |
|----|-------------|-----------|
| **ba-data** | **HOLD default** — RETAIN cite `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-01` + `pay_formula_definitions` physical plan · **DENY** `att_leave_hold` · **DENY** merge buckets · ADD only if closable delta vs BA | DATA-01 PASS_TO_PM |
| **sa** | Optional API-02 cluster delta if F.1 drift vs live grep | optional |
| **dev-fe** | **HOLD** author/publish/preview/COMP-01 UI until DATA stamp | READY_FOR_QA when stamped |
| **dev-be** | **HOLD** residual COMP N+1 · scope parity tests · preserve gd1_eval_v1 | READY_FOR_QA when stamped |
| **qa** | U65 **J-HRM-PAY-02-01..08** mandatory · regression **J-PAY-01** subset · **J-ATT-12-07** · **J-ATT-07-03..05** · **J-ATT-06-04** | PASS_TO_PM |
| **qc** | GWC C-SLICE · **≠ PAY-02 module UAT** · **≠ payroll_e2e_ready flip** · must_keep **PAY01QC1** + **ATT12+ATT11** + peer chain | PASS_TO_PM |

---

## 7. completion_report

| | |
|--|--|
| **Closed** | BA AC pack **O1–O16 CONFIRMED** for UC-BP-PAY-02 / FR-UC-BP-PAY-02 / BR-BP-PAY-01 against SA Option A: **RETAIN cite** `pay_formula_definitions` lifecycle · dual-control publish · **`gd1_eval_v1`** evaluator · preview/process published path · **must_keep** **PAY01QC1-MSMBGWC1** closed-sheet boundary + **ATT12QC1+ATT11QC1** + full ATT peer chain; **GAP** **R-PAY-02-AUTHOR-FE/PUBLISH-AC/PREVIEW-AC/PROCESS-AC/COMP-01/CATALOG-N+1/VARS/JOURNEY** + trace **F-PAY-CB-READ-01**; **HOLD** eval depth PAY-03+ · GĐ2 DnD OUT; AC-PAY-02-*; mint **J-HRM-PAY-02-01..08 DRAFT** + regression **J-HRM-PAY-01-01/02/04/06** · **J-HRM-ATT-12-07** · **J-HRM-ATT-07-03..05** · **J-HRM-ATT-06-04** (U65 FE-after-2xx+F5); unlock **ba-data HOLD** default; explicit **≠ PAY-02 / FR-PAY-02 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **C-SLICE** · **DENY** metadata/jest alone DONE · **DENY** `att_leave_hold` · **DENY** merge buckets · **DENY reopen** sealed journeys |
| **Residual (open)** | ba-data DATA-01 HOLD · dev-fe author/publish/preview/COMP · dev-be process/COMP N+1 · QA J-* · QC GWC · PAY-03/04/06 depth |
| **next_owner** | **ba-data** (HOLD default) · **pm** orchestration |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-BA-01.md` |

### 7.1 next_dispatch_prompt (copy-ready — ba-data HOLD default)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-02-CLUSTER-DATA-01
role: ba-data
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-38 seat #43)
lane: governance · UC-BP-PAY-02 · BA-01 PASS_TO_PM
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-01.md (pay_formula_definitions ADD-plan — RETAIN CONFIRMED)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-BA-01.md (must_keep PAY01 closed-sheet · pay_period_timesheet_bind)
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md (pay_formula_definitions · salary_components · payroll_periods.formula_definition_id — DENY att_leave_hold · DENY merge hour buckets)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-BA-01.md · ATT-11 BA (must_keep ATT12QC1 · ATT11QC1)
entry_criteria: BA O1–O16 CONFIRMED · default RETAIN cite formula physical + PAY-01 bind tables — no schema ADD unless closable delta stamped
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-DATA-01.md
  - HOLD default: RETAIN pay_formula_definitions plan from FORMULA-RUN-GAP-DATA-01 · RETAIN pay_period_timesheet_bind + closed sheet/line peer · DENY physical att_leave_hold · DENY merge compensatory/sick/carry into annual keys for PAY reads
  - ADD only if closable + BA stamp: optional columns/index deltas for COMP-01 FK surfaces (else explicit HOLD waiver owner+trigger)
  - ack_status PASS_TO_PM
cấm: apps/** · seed · invent att_leave_hold · merge buckets · honesty flip · flip payroll_e2e_ready · reopen J-HRM-PAY-01-* / J-HRM-ATT-12-* / J-07-03..05 / J-06-04 without regression · wipe PAY01QC1 / ATT12/ATT11 peer seals · claim PAY-02 module DONE
```
