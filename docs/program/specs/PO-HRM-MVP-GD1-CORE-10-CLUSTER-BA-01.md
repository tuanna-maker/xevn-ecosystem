# BA AC pack — Wave-23 CORE cluster · UC-BP-CORE-10 (BHXH lifecycle Đóng / Ngừng / Tạm hoãn / Đổi mức / Resume · RETAIN LIVE enrollment actions)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-23 seat **#25**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD default** (LIVE `employee_insurances` · `hrm_insurance_rate_period` · peer type/insurer catalogs RETAIN cite — **no** schema invent) · sa API residual unlock **only if** BA proves closable wire gap · **DENY** claim catalog alone = CORE-10 DONE · **DENY** claim enrollment CRUD alone = CORE-10 DONE · **DENY** claim LIVE actions alone = module DONE without J-* · **printable false RETAIN** · **PAY AC-SI-TL-06 OUT invent DONE** |
| **change_mode** | **ADD** (align SA-01 gap-only RETAIN — **no** Nest `/core` dual · **no** wipe CORE-09 fill/registry/PREV/VER · **no** wipe CORE-07 activate/GATE 409/ACT-400 · **no** wipe CORE-06 soft≠DONE · **no** wipe CORE-05/03/02b/09d..01 · **no** invent PAY/ATT DONE · **no** invent printable/Word DONE · **no** claim CORE-09/07/06 DONE · **no** conflate BH «Hoạt động» with CORE-07 employee activate) |
| **uc_ids** | `UC-BP-CORE-10` |
| **depends_on** | `PO-HRM-MVP-GD1-CORE-10-CLUSTER-SA-01` **Option A LOCKED** · peer QC **`CORE09QC1-MSLNBA89`** · QA **`CORE09QA1-MSLNTR5P`** · printable **false** · **≠** CORE-09 DONE · must_keep CORE-07 **`CORE07QC1-KZJTSHNT`** (GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE) · soft≠DONE **`CORE06QC1-MSLID363`** · **`CORE05QC1-MSLGVT40`** · **`CORE03QC1-MSLFJH0K`** · **`CORE02BQC1-MSLEFQC1`** · **`CORE09DQC1-MSLDR8I3`** · `CORE09CQC1-MSLBXMUT` · `CORE09BQC1-MSLB05DZ` · `CORE09AQC1-MSLA4LX9` · `CORE08QC1-MSL9BFFE` · `CORE02QC1-MSL80DU6` · `CORE01QC1-MSL6WMS7` · SI type/insurer platform peers **RETAIN cite** · Nest `/core` DENY |
| **ref_sa** | `PO-HRM-MVP-GD1-CORE-10-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-CORE-09-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-CORE-07-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-10** · Mục đích · Luồng **#0a–#0f** (catalog peers) · **#1–#5** (timeline actions) · Diễn biến **#1–#5 + Thành công** · **AC-SI-TL-01..06** · **AC-SI-CAT-01..03** · **AC-SI-INR-01..03** · **BR-BP-SI-01** · peers CORE-09 printable false · CORE-07 activate · CORE-02 C&B · PAY-07 / PAY-05 **OUT invent DONE** |
| **ref_api_paper** | **F-CORE-SI-01** (enrollment) · **F-CORE-SI-02** (timeline GET) · **F-CORE-SI-03** (actions) · **F-SI-CAT-TYP/EFF** · **F-SI-CAT-INS-*/EFF** · **F-SI-POL-01** · must_keep **F-CORE-CTR-*** (CORE-09) · **F-CORE-ACT-01** (CORE-07) · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | LIVE `public.employee_insurances` (enrollment ONE SoT) · LIVE `public.hrm_insurance_rate_period` (append-only) · LIVE `si_insurance_type` / `si_insurer` (catalog peers cite) · Nest `@Controller('core')` **ABSENT** · **DENY** invent Nest `/core` dual |
| **ref_adr** | ADR 4-pillar · Nest physical prefer · paper `/core` alias only · U19 scope parity list↔get↔actions · enrollment **ONE SoT** · append-only rate periods |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · personnel / CORE / CTR / SI module UAT **false** · **`C-SLICE-≠-MODULE`** · **DENY** claim catalog alone = CORE-10 DONE · **DENY** claim enrollment CRUD alone = CORE-10 DONE · **DENY** claim LIVE actions alone = module DONE without U65 J-* · **DENY** claim CORE-09/07/06 DONE · **DENY** invent PAY/ATT/printable/Word DONE · **DENY** conflate BH Hoạt động ↔ CORE-07 |
| **Cấm** | Nest `/core` dual · wipe CORE-09 fill/registry/PREV/VER · wipe CORE-07 activate/GATE/ACT-400 · wipe CORE-06 soft≠DONE · wipe CORE-05/03/02b/09d..01 · invent PAY/ATT DONE · invent printable/Word DONE · claim catalog/CRUD/LIVE alone = CORE-10 DONE · claim CORE-09/07/06 DONE · honesty flip · seed · apps/** · reopen sealed J-HRM-CORE-09-01..06 / 07 / 06 / 05 / 03 / 02B / 09D..01 |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-23 seat #25 — **gap-only RETAIN** LIVE BHXH enrollment + lifecycle actions:

1. **Enrollment SoT** = LIVE `public.employee_insurances` trên **`/api/hrm/employee-insurances*`** — **RETAIN must_keep** · **≠ CORE-10 DONE** alone (CRUD).
2. **Lifecycle SoT** = LIVE **`POST …/employee-insurances/:id/actions`** với `close|stop|suspend|change_rate|resume` + `effective_from` — map **AC-SI-TL-01..05** · Diễn biến **#1–#4**.
3. **History** = append-only `hrm_insurance_rate_period` — **DENY** silent overwrite · F5 giữ dòng cũ + mới (**AC-SI-TL-04/05**).
4. **Suspend căn cứ** = `suspend_reason` required → **`HRM-SI-ACTION-400`** (**AC-SI-TL-03**).
5. **Vocabulary** = BH «Hoạt động» = enrollment `active` — **DENY** conflate with CORE-07 employee `employees.status=active`.
6. **Catalog peers** = AC-SI-CAT / AC-SI-INR **RETAIN cite** — **≠ CORE-10 DONE** alone.
7. **PAY read** = **AC-SI-TL-06 OUT invent PAY DONE** — cite residual only.
8. **Mint** `J-HRM-CORE-10-01..06` DRAFT · **must_keep** CORE-09 printable false · CORE-07 GATE/ACT · soft≠CORE-06 DONE · Nest `/core` DENY.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| C&B / HCNS | Mở timeline BH · Đóng / Ngừng / Tạm hoãn / Đổi mức / Resume · F5 |
| Quản trị cấu hình | Danh mục loại BH / nhà BH (peers — **≠** CORE-10 DONE) |
| Group CEO | Scope rollup `main` — U19 list = get = actions |
| Member CEO / HRBP | Chỉ pháp nhân membership · cùng scope resolver |
| Hệ thống (Nest) | Enrollment + actions append period · Nest `/core` **0** |
| CORE-09 / CORE-07 / PAY / ATT | Peers **must_keep / OUT invent DONE** — **≠** claim DONE from this seat |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · map FR-10 Diễn biến #1–#4 + AC-SI-TL-01..05 → AC-CORE-10-* · deepen on LIVE actions · residuals TL/SUSPEND/DISP/CAT-CITE/≠DONE · J-HRM-CORE-10-* DRAFT | Impl `apps/**` / migration / seed |
| Physical prefer `/employee-insurances*` + `POST …/actions` · paper `/core` alias | Nest `/core/…/insurance` SoT dual |
| Explicit catalog≠DONE · CRUD≠DONE · LIVE≠module DONE · vocab BH≠CORE-07 · printable false · PAY-06 OUT | Claim catalog / CRUD / LIVE alone = FR-10 DONE · invent PAY/ATT/printable/Word |
| Honesty footer · C-SLICE · CORE-09/07 RETAIN · soft≠CORE-06 DONE | Flip ready flags · reopen sealed J-* · claim CORE-09/07/06 DONE |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Physical path | **YES** — Timeline + actions Network **chỉ** physical **`GET/POST/PATCH/DELETE /api/hrm/employee-insurances*`** · **`POST …/:id/actions`** — paper `/api/hrm/core/…/insurance*` = **alias / DOC-DELTA only** — **FAIL** nếu Nest `@Controller('core')` second SI SoT — **AC-CORE-10-01** |
| **O2** | Action vocab | **YES** — `close`=Đóng · `stop`=Ngừng · `suspend`=Tạm hoãn · `change_rate`=Đổi mức · `resume`=Tiếp tục — 1:1 LIVE `InsuranceActionDto` · map **AC-SI-TL-01..04** (+ resume) — **AC-CORE-10-02** |
| **O3** | BH «Hoạt động» | **YES** — Enrollment status `active` on BH timeline — **FORBIDDEN** conflate with CORE-07 employee activate / claim CORE-07 DONE — footer every evidence — **AC-CORE-10-VOCAB** |
| **O4** | History | **YES** — Append period only · close prior open period · **DENY** silent overwrite amount/status history · F5 keeps prior rows — **AC-SI-TL-04/05** · **AC-CORE-10-04/05** |
| **O5** | Suspend căn cứ | **YES** — `suspend_reason` required when action=suspend — **DENY** save without căn cứ → **`HRM-SI-ACTION-400`** — **AC-SI-TL-03** · **AC-CORE-10-03** |
| **O6** | Catalog ≠ DONE | **YES** — AC-SI-CAT / AC-SI-INR = **RETAIN cite** peers — **≠** claim = CORE-10 module DONE — footer **catalog ≠ CORE-10 DONE** — **AC-CORE-10-≠-CAT-DONE** |
| **O7** | CRUD ≠ DONE | **YES** — Enrollment create/patch alone = **RETAIN** gắn người — **≠** CORE-10 DONE without lifecycle actions U65 journeys — **AC-CORE-10-≠-ENR-DONE** |
| **O8** | Actions ≠ module DONE | **YES** — LIVE panel/API alone — **≠** CORE-10 module DONE without U65 J-* pack PASS — **AC-CORE-10-≠-LIVE-DONE** |
| **O9** | PAY read | **YES OUT invent** — **AC-SI-TL-06** = peer residual **OUT invent PAY DONE** — cite only · **DENY** invent PAY engine / claim PAY DONE — footer every evidence — **AC-CORE-10-PAY-06-OUT** |
| **O10** | Honesty / peers OUT | **YES false** — all ready flags false · C-SLICE · **printable false RETAIN** · **DENY** flip personnel/printable/recruitment/jd · **DENY** claim CORE-09 DONE · CORE-07 DONE · soft=CORE-06 DONE · invent PAY/ATT/Word DONE · claim printable/closed-8 · **must_keep** CORE-09/07/06..01 · Nest DENY — **AC-CORE-10-H** |
| **O11** | Display-ready | **YES** — DTO: **`periods[]`** · **`statusLabelVi`** · **`effective_from`/`effective_to`** `dd/MM/yyyy` · **`suspend_reason`** · amounts (vi-VN grouping) — FE bind · **cấm** ISO leak / raw key as label / invent PAY / printable flip |
| **O12** | Journeys | **YES** — Mint **`J-HRM-CORE-10-01..06` DRAFT** (timeline load · Đóng · Ngừng · Tạm hoãn+căn cứ · Đổi mức · Resume+F5+Nest0+≠DONE+CORE-07 RETAIN) · **DENY** reopen sealed J-HRM-CORE-09-01..06 / 07 / 06 / 05 / 03 / 02B / 09D..01 |

**Architecture SoT:** ONE LIVE enrollment + actions spine on `/employee-insurances*` · paper `/core` alias only · catalog ≠ DONE · CRUD ≠ DONE · LIVE ≠ module DONE · BH Hoạt động ≠ CORE-07 · append-only periods · U19 list↔get↔actions · CORE-09/07..01 **must_keep**.

### Primary API surface (BA lock — O1)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| Enrollment CRUD | **`GET/POST/PATCH/DELETE /api/hrm/employee-insurances*`** | `/core/…/insurance` alias only |
| Timeline read | **`GET …/employee-insurances`** · **`GET …/:id`** (+ `periods[]`) | alias |
| Lifecycle actions | **`POST …/employee-insurances/:id/actions`** (`close\|stop\|suspend\|change_rate\|resume`) | alias |
| Type catalog peer | **`…/insurance-types*`** · `/effective` | alias — **≠** CORE-10 DONE |
| Insurer catalog peer | **`…/insurers*`** · `/effective` | alias — **≠** CORE-10 DONE |
| Policy soft | contracts-insurance policies | cite — OUT invent DONE alone |
| CORE-09 fill/registry | `/contracts-insurance/contracts*` + PREV/VER | must_keep · printable false |
| CORE-07 activate | **`POST /employees/:id/activate`** | must_keep · **≠** conflate CORE-10 |
| PAY / ATT | Peers **OUT invent DONE** | AC-SI-TL-06 cite only |

**Invariant CORE-10-PATH:** SI Network **MUST** hit `/employee-insurances*` · Nest dual `/core` SI SoT = **FAIL O1**.

**Invariant CORE-10-≠-CAT-DONE:** Claim type/insurer catalog alone = FR-UC-BP-CORE-10 / CORE-10 DONE = **FAIL O6**.

**Invariant CORE-10-≠-ENR-DONE:** Claim enrollment CRUD alone = CORE-10 DONE = **FAIL O7**.

**Invariant CORE-10-≠-LIVE-DONE:** Claim LIVE actions/panel alone = module SI/CORE DONE without U65 J-* = **FAIL O8**.

**Invariant CORE-10-VOCAB:** Conflate BH «Hoạt động» with CORE-07 employee activate / claim CORE-07 DONE = **FAIL O3/O10**.

**Invariant CORE-10-≠-PRINTABLE:** Claim printable / closed-8 DONE / flip `contracts_printable_ready` = **FAIL O10**.

**Invariant CORE-10-PAY-06-OUT:** Invent PAY DONE / claim AC-SI-TL-06 PASS as this seat DONE = **FAIL O9**.

**Wire codes (RETAIN — no invent rewrite):** `HRM-SI-ACTION-400` (suspend thiếu căn cứ / thiếu effective_from) · `HRM-EINS-*` · `HRM-INS-TYPE-KEY` · `HRM-INS-INSURER-KEY` · `HRM-CORE-CB-VAL-400` (PATCH contrib → redirect change_rate — CORE-02 must_keep) · `HRM-SCOPE-409` · sealed CORE-09/07 codes · **DENY** silent overwrite history.

---

## Footer — honesty (every section)

> **honesty:** `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · SI/CORE/CTR/personnel module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **PAY AC-SI-TL-06 OUT invent DONE** · catalog ≠ CORE-10 DONE · enrollment CRUD ≠ DONE · LIVE actions ≠ module DONE without J-* · BH Hoạt động ≠ CORE-07 · must_keep CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-23 · Option A) |
|---|----------------------|---------------------------|
| Enrollment CRUD | `/employee-insurances*` · ONE SoT | **RETAIN must_keep** · **≠** module DONE alone (**O7**) |
| Timeline GET + periods[] | F-CORE-SI-02 LIVE | **RETAIN** + U65 (**O1/O11/O12**) |
| Actions close/stop/suspend/change_rate/resume | `POST …/actions` LIVE · FE panel | **RETAIN path** + journey fidelity (**O2/O8**) · **≠** FR-10 DONE alone |
| Append history | `hrm_insurance_rate_period` | **RETAIN must_keep** (**O4**) |
| Suspend căn cứ | `suspend_reason` → ACTION-400 | **RETAIN** + U65 (**O5**) |
| Type / insurer catalogs | Nest peers PRESENT | **RETAIN cite** · **≠** CORE-10 DONE (**O6**) |
| Paper `/core` SI | Nest `@Controller('core')` ABSENT | **Alias only** (**O1**) |
| PAY read mức kỳ | AC-SI-TL-06 peer | **OUT invent PAY DONE** (**O9**) |
| CORE-09 fill/registry | SEALED `CORE09QC1-MSLNBA89` · printable false | **must_keep RETAIN** · **≠** reopen / claim DONE |
| CORE-07 activate | SEALED `CORE07QC1-KZJTSHNT` | **must_keep RETAIN** · **≠** conflate / claim DONE (**O3/O10**) |
| CORE-06 soft | soft≠DONE SEALED | **must_keep RETAIN** |
| Honesty | C-SLICE · printable false | **false RETAIN** (**O10**) |

### 1.1 Disposition **R-CORE-10-TL-01**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-10-TL-01` |
| **Scope** | **IN-SCOPE residual fidelity** — U65 Đóng / Ngừng / Tạm hoãn / Đổi mức / Resume + F5 history · AC-SI-TL-01..05 |
| **OUT of residual** | Claim LIVE actions alone = CORE-10 module DONE · Nest `/core` SI dual · invent PAY DONE |
| **Rationale** | FR-10 Diễn biến #1–#4 · SA O2/O4/O8/O12; LIVE actions PRESENT — residual = U65 AC + explicit ≠DONE locks |
| **Physical gap vs paper** | Path **PRESENT** — fidelity / journey residual (not greenfield) |
| **ba-data** | **HOLD** — LIVE `employee_insurances` + `hrm_insurance_rate_period` RETAIN · **no** invent second SoT |
| **sa API** | RETAIN cite F-CORE-SI-01/02/03 · residual wire **only if** BA/QA proves closable gap |
| **DENY** | Claim TL LIVE = FR-10 DONE · Nest `/core` dual · silent overwrite history |

### 1.2 Disposition **R-CORE-10-SUSPEND**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-10-SUSPEND` |
| **Scope** | **IN-SCOPE residual** — AC-SI-TL-03 · Diễn biến #3 · `suspend_reason` required |
| **OUT** | ATT→BH auto-suspend invent DONE · invent PAY DONE |
| **Rationale** | FR-10 quy tắc tạm hoãn · SA O5; LIVE ACTION-400 PRESENT — U65 fidelity |
| **ba-data** | **HOLD** |
| **sa API** | RETAIN cite F-CORE-SI-03 suspend branch |
| **DENY** | Silent 2xx suspend without căn cứ |

### 1.3 Disposition **R-CORE-10-DISP**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-10-DISP` |
| **Scope** | **IN-SCOPE residual** — display-ready periods / statusLabelVi / dd/MM/yyyy · O11 |
| **OUT** | FE invent PAY labels · raw enum as user label |
| **ba-data** | **HOLD** — prefer LIVE DTO fields; reopen REQUIRED only if typed col ABSENT proven |
| **DENY** | ISO leak as primary UI · raw key as label |

### 1.4 Disposition **R-CORE-10-CAT-CITE** / **R-CORE-10-≠-DONE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-10-CAT-CITE` · **`R-CORE-10-≠-CAT-DONE`** · **`R-CORE-10-≠-ENR-DONE`** · **`R-CORE-10-≠-LIVE-DONE`** |
| **Scope** | **INFO honesty locks** — every evidence footer |
| **Rule** | Catalog peers RETAIN cite **≠** CORE-10 DONE · enrollment CRUD **≠** DONE · LIVE actions **≠** module DONE without J-* |
| **DENY** | Claim CAT/ENR/LIVE alone = FR-10 / module DONE |

### 1.5 Disposition **R-CORE-10-PAY-06** / **R-CORE-10-HONESTY** / **R-CORE-10-PRINTABLE**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-10-PAY-06` · `R-CORE-10-HONESTY` · `R-CORE-10-PRINTABLE` |
| **Scope** | **OUT invent / INFO** |
| **Rule** | AC-SI-TL-06 **OUT invent PAY DONE** · all ready flags **false** · `contracts_printable_ready=false` **RETAIN** |
| **DENY** | Invent PAY/ATT/printable/Word DONE · honesty flip |

### 1.6 ba-data disposition summary

| Slice | Decision | Rule |
|-------|----------|------|
| `employee_insurances` enrollment | **HOLD** | LIVE RETAIN — **no** greenfield wipe / second SoT |
| `hrm_insurance_rate_period` | **HOLD** | LIVE append-only RETAIN — **DENY** invent overwrite table |
| `si_insurance_type` / `si_insurer` | **HOLD · cite peer** | **≠** CORE-10 DONE alone · **DENY wipe** |
| Nest `/core` | **DENY** | alias only |
| CORE-09 / 07 / 06 / 05 / 03 / 02b | **DENY wipe** | must_keep · printable false · soft≠CORE-06 DONE |
| PAY / ATT tables | **OUT invent DONE** | AC-SI-TL-06 cite only |

**Unlock next:** **ba-data HOLD** stamp → **sa API** RETAIN cite F-CORE-SI-01/02/03 — residual wire **ONLY if** closable gap proven.

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **PAY AC-SI-TL-06 OUT invent DONE** · catalog ≠ CORE-10 DONE · CRUD ≠ DONE · LIVE ≠ module DONE · BH ≠ CORE-07 · Nest `/core` DENY · C-SLICE

---

## 2. Business rules (normative — SRS + SA; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-SI-01** | Đổi trạng thái / mức BH | Action có ngày hiệu lực · append timeline | Silent overwrite / delete history = **FAIL** |
| **BR-CORE-10-PATH** | API SI | Physical `/employee-insurances*` + `/actions` | Nest `/core` dual = **FAIL O1** |
| **BR-CORE-10-VOCAB** | Label «Hoạt động» on BH | Enrollment `active` | Conflate CORE-07 activate = **FAIL O3** |
| **BR-CORE-10-CLOSE** | Action Đóng | `POST …/actions` `close` + `effective_from` | No action / silent delete = **FAIL** · **AC-SI-TL-01** |
| **BR-CORE-10-STOP** | Action Ngừng | `stop` + `effective_from` | Soft-delete only as «ngừng» = **FAIL** · **AC-SI-TL-02** |
| **BR-CORE-10-SUSPEND** | Action Tạm hoãn | `suspend` + `effective_from` + `suspend_reason` | Missing căn cứ still 2xx = **FAIL** · **AC-SI-TL-03** |
| **BR-CORE-10-RATE** | Đổi mức | `change_rate` append period | PATCH contrib silent overwrite = **FAIL** · **AC-SI-TL-04** · CORE-02 redirect must_keep |
| **BR-CORE-10-RESUME** | Tiếp tục | `resume` → enrollment `active` | Silent status PATCH only = **FAIL** residual |
| **BR-CORE-10-F5** | After action | F5 / reopen timeline | Lost prior rows = **FAIL** · **AC-SI-TL-05** |
| **BR-CORE-10-CAT≠DONE** | Type/insurer admin alone | ≠ FR-10 DONE | Claim DONE = **FAIL O6** |
| **BR-CORE-10-ENR≠DONE** | Enrollment CRUD alone | ≠ FR-10 DONE | Claim DONE = **FAIL O7** |
| **BR-CORE-10-LIVE≠DONE** | LIVE actions without J-* | ≠ module DONE | Claim DONE = **FAIL O8** |
| **BR-CORE-10-PAY-06-OUT** | Kỳ lương đọc mức | Peer PAY | Invent PAY DONE = **FAIL O9** · **AC-SI-TL-06 OUT** |
| **BR-CORE-10-NO-SEED** | Nghiệm thu | FE only | Seed = **FAIL U65** |
| **BR-CORE-10-≠-09-DONE** | CORE-09 seal | printable false · 09a–d≠DONE · registry≠DONE | Claim CORE-09 DONE = **FAIL O10** |
| **BR-CORE-10-≠-07-DONE** | CORE-07 seal | GATE/ACT-400/Nest DENY · checklist≠DONE · free PATCH≠DONE | Claim CORE-07 DONE = **FAIL O10** |
| **BR-CORE-10-≠-06-DONE** | CORE-06 seal | soft≠DONE | Claim soft=DONE = **FAIL O10** |
| **BR-CORE-10-PRINTABLE** | Honesty | `contracts_printable_ready=false` | Flip = **FAIL O10** |
| **BR-CORE-10-SCOPE** | list = get = actions | Same scope resolver | Cross-CT leak = **FAIL U19** |

### Error taxonomy (RETAIN + residual assert)

| Code family | HTTP | UX intent (VI) | ≠ |
|-------------|------|----------------|--|
| `HRM-SI-ACTION-400` | 400 | Thiếu ngày hiệu lực / thiếu căn cứ tạm hoãn | Silent 2xx |
| `HRM-EINS-*` | 2xx | Enrollment / action OK | Claim = module DONE |
| `HRM-INS-TYPE-KEY` / `HRM-INS-INSURER-KEY` | 4xx | Mã ngoài danh mục | Free-text SoT |
| `HRM-CORE-CB-VAL-400` + redirect `change_rate` | 400 | Không PATCH contrib silent | Bypass actions |
| `HRM-SCOPE-409` | 409 | Ngoài phạm vi pháp nhân | Soft OK |
| Sealed CORE-09 CTR | — | printable false must_keep | Reopen / flip printable |
| Sealed `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` | 409 | CORE-07 GATE must_keep | Reopen CORE-07 / conflate vocab |
| Sealed ACT-400 | 400 | Free PATCH status blocked | Claim free PATCH = CORE-07 DONE |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **PAY AC-SI-TL-06 OUT invent DONE** · catalog ≠ CORE-10 DONE · CRUD ≠ DONE · LIVE ≠ module DONE · BH ≠ CORE-07 · Nest `/core` DENY · C-SLICE

---

## 3. Diễn biến FR-UC-BP-CORE-10 + AC-SI-TL → AC / VAL map (normative)

### 3.0 Map overview

| SRS source | Tương tác | AC cite | J-* | LIVE Network (cite) |
|------------|-----------|---------|-----|---------------------|
| **Diễn biến #1** · Luồng #1 | Mở timeline BH | **AC-CORE-10-LOAD** · **AC-SI-TL-05** (baseline) | **J-HRM-CORE-10-01** | `GET …/employee-insurances*` · `periods[]` · Nest `/core` **0** |
| **Diễn biến #2** · **AC-SI-TL-01** | Action **Đóng** | **AC-CORE-10-CLOSE** · **AC-SI-TL-01** | **J-HRM-CORE-10-02** | `POST …/actions` `action=close` · `effective_from` · append period |
| **Diễn biến #2** · **AC-SI-TL-02** | Action **Ngừng** | **AC-CORE-10-STOP** · **AC-SI-TL-02** | **J-HRM-CORE-10-03** | `POST …/actions` `action=stop` · Nest `/core` 0 |
| **Diễn biến #2–#3** · **AC-SI-TL-03** | **Tạm hoãn** + căn cứ | **AC-CORE-10-SUSPEND** · **AC-SI-TL-03** | **J-HRM-CORE-10-04** | `suspend` + `suspend_reason` · thiếu → **400** ACTION-400 |
| **Diễn biến #2** · **AC-SI-TL-04** | **Đổi mức** | **AC-CORE-10-RATE** · **AC-SI-TL-04** | **J-HRM-CORE-10-05** | `change_rate` append · **DENY** silent PATCH contrib |
| **Diễn biến #4** · **AC-SI-TL-05** + resume | Resume + F5 history | **AC-CORE-10-RESUME** · **AC-CORE-10-F5** · **AC-SI-TL-05** | **J-HRM-CORE-10-06** | `resume` · F5 prior+new · Nest 0 · ≠DONE footers |
| **Luồng #0a–#0f** · AC-SI-CAT/INR | Catalog peers | **AC-CORE-10-≠-CAT-DONE** · cite AC-SI-CAT/INR | (peer cite · not promote as CORE-10 DONE) | type/insurer Nest · **≠** module DONE |
| **Diễn biến #5** · **AC-SI-TL-06** | Kỳ lương đọc mức | **AC-CORE-10-PAY-06-OUT** | — | **OUT invent PAY DONE** |
| **O3/O6/O7/O8/O10** | Vocab + ≠DONE + seals | **AC-CORE-10-VOCAB** · **≠-ENR/LIVE** · **H** · **MK-*** | **J-06** | CORE-09/07 RETAIN · printable false |

### 3.1 AC-SI-TL deepen → LIVE actions (normative)

| AC-ID (SRS) | LIVE mapping (BA lock) | Measurable PASS | FAIL |
|-------------|------------------------|-----------------|------|
| **AC-SI-TL-01** | UI timeline có **Đóng** · `POST …/actions` `close` + `effective_from` · enrollment → `closed` · period row `closed` | 2xx · statusLabelVi Đóng/closed · F5 còn dòng mới | Chỉ CRUD gắn người · không nút/action · soft-delete im lặng |
| **AC-SI-TL-02** | UI **Ngừng** · `stop` + `effective_from` · enrollment → `stopped` | 2xx · F5 còn · **không** = DELETE only | Ngừng chỉ bằng xóa bản ghi |
| **AC-SI-TL-03** | UI **Tạm hoãn** · `suspend` + `effective_from` + `suspend_reason` | 2xx khi đủ căn cứ · thiếu căn cứ → **400** `HRM-SI-ACTION-400` · **không** ghi giả | Thiếu căn cứ vẫn 2xx |
| **AC-SI-TL-04** | UI **Đổi mức** · `change_rate` · append period · keep active (unless suspended) | New period row · prior period closed · amounts mới · **DENY** PATCH contrib silent | Ghi đè mức cũ mất lịch sử |
| **AC-SI-TL-05** | After any action · F5 / navigate lại | `periods[]` đủ dòng trước **và** sau · Nest `/core` 0 | Mất lịch sử sau tải lại |
| **AC-SI-TL-06** | Kỳ lương đọc mức hiệu lực | **OUT invent PAY DONE** this seat — residual cite only | Claim PAY PASS / invent PAY engine = **FAIL O9** |

### 3.2 AC-CORE-10 (normative deepen)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-CORE-10-01** | C&B/HCNS trong scope · mở tab BH | Load list / get / actions | Network hits **only** physical `/api/hrm/employee-insurances*` · Nest `/api/hrm/core/**` SI SoT **0** | U65 · O1 · **R-CORE-10-TL-01** |
| **AC-CORE-10-02** | Action panel | Chọn Đóng/Ngừng/Tạm hoãn/Đổi mức/Resume | Body `action` ∈ `close\|stop\|suspend\|change_rate\|resume` 1:1 VI labels · `effective_from` required | O2 · BR-CORE-10-* |
| **AC-CORE-10-VOCAB** | UI label «Hoạt động» on BH | Read enrollment status | Means enrollment `active` · **not** CORE-07 employee activate · **≠** claim CORE-07 DONE | O3 |
| **AC-CORE-10-≠-CAT-DONE** | Type/insurer admin PASS alone | Claim FR-10 / CORE-10 DONE | **FAIL** — peers RETAIN cite only · footer **catalog ≠ CORE-10 DONE** | O6 |
| **AC-CORE-10-≠-ENR-DONE** | User only create/patch enrollment | Claim CORE-10 DONE | **FAIL** — CRUD = gắn người RETAIN only | O7 |
| **AC-CORE-10-≠-LIVE-DONE** | LIVE actions/panel present without U65 J-* PASS | Claim module SI/CORE DONE | **FAIL** — need J-* pack | O8 |
| **AC-CORE-10-LOAD** | Quyền C&B đúng scope | Mở timeline BH | GET 2xx · thấy `periods[]` + statusLabelVi · nút action · Nest `/core` 0 | Diễn biến #1 · J-01 |
| **AC-CORE-10-CLOSE** / **AC-SI-TL-01** | Enrollment active (or allowed) | Đóng + ngày hiệu lực → Lưu | `POST …/actions` `close` **2xx** · status closed · period append · F5 còn | O2/O4 · J-02 |
| **AC-CORE-10-STOP** / **AC-SI-TL-02** | Enrollment | Ngừng + ngày hiệu lực → Lưu | `stop` **2xx** · stopped · **≠** silent DELETE-as-ngừng | O2 · J-03 |
| **AC-CORE-10-SUSPEND** / **AC-SI-TL-03** | Enrollment | Tạm hoãn **không** căn cứ | **400** ACTION-400 · **không** ghi | O5 · J-04 neg |
| **AC-CORE-10-SUSPEND-OK** / **AC-SI-TL-03** | Enrollment | Tạm hoãn + căn cứ + ngày | `suspend` **2xx** · suspended · suspend_reason persisted · F5 còn | O5 · J-04 pos |
| **AC-CORE-10-RATE** / **AC-SI-TL-04** | Enrollment | Đổi mức + ngày (+ amounts) | `change_rate` **2xx** · new period · prior closed · PATCH contrib alone **400** redirect (CORE-02 must_keep) | O4 · J-05 |
| **AC-CORE-10-RESUME** | Enrollment suspended/stopped (allowed) | Resume + ngày | `resume` **2xx** · enrollment `active` · period append · **≠** CORE-07 activate | O2/O3 · J-06 |
| **AC-CORE-10-F5** / **AC-SI-TL-05** | After action 2xx | F5 / reopen tab BH | Prior + new periods visible · Nest `/core` 0 | O4 · J-06 |
| **AC-CORE-10-PAY-06-OUT** / **AC-SI-TL-06** | Any CORE-10 evidence | PAY kỳ đọc mức | **OUT invent** — cite residual only · claim PAY DONE = **FAIL** | O9 |
| **AC-CORE-10-DISP** | Timeline render | Show periods / status | `statusLabelVi` · dd/MM/yyyy · no raw key / ISO primary | O11 · **R-CORE-10-DISP** |
| **AC-CORE-10-MK-09** | Any CORE-10 evidence | Diff CORE-09 | Fill+registry · PREV · VER · printable **false** · 09a–d≠DONE · registry≠DONE **intact** · **no** reopen J-HRM-CORE-09-01..06 · **≠** claim CORE-09 DONE · **≠** Word invent | O10 · `CORE09QC1-MSLNBA89` |
| **AC-CORE-10-MK-07** | Any CORE-10 evidence | Diff CORE-07 activate | Physical activate · GATE **409** · ACT-**400** · Nest `/core` **0** · checklist≠DONE · free PATCH≠DONE **intact** · **no** reopen J-HRM-CORE-07-01..05 · **≠** claim CORE-07 DONE · **≠** conflate vocab | O3/O10 · `CORE07QC1-KZJTSHNT` |
| **AC-CORE-10-MK-06** | Any CORE-10 evidence | Diff CORE-06 soft-return | soft≠DONE · Nest `/core` 0 **intact** · **no** reopen J-HRM-CORE-06 · **≠** claim soft=CORE-06 DONE | O10 · `CORE06QC1-MSLID363` |
| **AC-CORE-10-MK-05/03/02B/09D..01** | Any CORE-10 evidence | Diff peers | AST · DOC/ET/CHK · EMP-CF · 09d..01 · RD · C&B · public **intact** · **no** reopen sealed J-* | O10 · peer stamps |
| **AC-CORE-10-H** | Evidence footer | Any seal | personnel/printable/recruitment/jd **false** · C-SLICE · **printable false RETAIN** · **DENY** catalog=CORE-10 DONE · CRUD=CORE-10 DONE · LIVE=module DONE · CORE-09/07/06 DONE · PAY/ATT/printable/Word DONE · Nest DENY · no reopen seals · BH≠CORE-07 | O6/O7/O8/O9/O10 |

### 3.3 Scope ladder (U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) + C&B | Enrollment list + actions across rollup membership | Cross-CT mutate without membership |
| **Member CEO / HRBP** | Chỉ pháp nhân membership | list ≠ get ≠ actions resolver |
| **No C&B / SI right** | Deny actions | Silent 2xx |

**Invariant CORE-10-SCOPE:** employee-insurances list **=** get-by-id **=** actions **same** hrm list-scope family.

**Prerequisite:** CORE-09 seals RETAIN (`CORE09QC1-MSLNBA89` · printable false · ≠ CORE-09 DONE) · CORE-07 (`CORE07QC1-KZJTSHNT`) · soft≠CORE-06 DONE · peers CORE-05/03/02b/09d..01 · **không** seed · honesty flags false.

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **PAY AC-SI-TL-06 OUT invent DONE** · catalog ≠ CORE-10 DONE · CRUD ≠ DONE · LIVE ≠ module DONE · BH ≠ CORE-07 · Nest `/core` DENY · C-SLICE

---

## 4. Diễn biến FE U65 (browser matrix)

```text
Login (ceo@xe.vn / member C&B)
  → /hr Nhân sự → Hồ sơ NV → tab Bảo hiểm (Profile BH / EmployeeInsurance)
  → (Pos LOAD) GET …/employee-insurances* 200 · periods[] · statusLabelVi · Nest /core 0
  → (Pos CLOSE) Chọn Đóng + ngày hiệu lực → Lưu
       → POST …/actions action=close 2xx · F5 còn dòng mới + lịch sử cũ
  → (Pos STOP) Ngừng + ngày → POST stop 2xx · F5 còn · ≠ DELETE-as-ngừng
  → (Neg SUSPEND) Tạm hoãn thiếu căn cứ → 400 HRM-SI-ACTION-400 · không ghi
  → (Pos SUSPEND) Tạm hoãn + căn cứ + ngày → suspend 2xx · F5 còn
  → (Pos RATE) Đổi mức + ngày → change_rate 2xx · period mới · prior closed
       → Assert PATCH contrib alone 400 redirect (CORE-02 must_keep)
  → (Pos RESUME) Resume + ngày → resume 2xx · enrollment Hoạt động (= active enrollment)
       → Assert ≠ CORE-07 employee activate path
  → Assert Nest /core SI = 0
  → Footer: catalog ≠ CORE-10 DONE
       · enrollment CRUD ≠ CORE-10 DONE
       · LIVE actions ≠ module DONE without J-* pack
       · BH Hoạt động ≠ CORE-07
       · printable false RETAIN
       · PAY AC-SI-TL-06 OUT invent DONE
       · must_keep CORE-09 CORE09QC1-MSLNBA89 · CORE-07 GATE/ACT-400/Nest DENY
       · soft≠CORE-06 DONE · honesty false · no reopen seals
```

**cấm:** `pnpm seed:*` · API seed enrollment/actions · DB fake · PASS chỉ curl · Nest `/core` dual · wipe CORE-09/07/06/05/03/02b/09d..01 · claim catalog/CRUD/LIVE=FR-10 DONE · claim CORE-09/07 DONE · invent PAY/ATT/printable/Word · conflate CORE-07 · claim module DONE · reopen sealed J-*.

### VAL pack (mint)

| VAL-ID | Expect | Maps |
|--------|--------|------|
| **VAL-CORE-SI-01** | Timeline GET periods + Nest `/core` 0 | AC-CORE-10-01/LOAD · O1 |
| **VAL-CORE-SI-02** | Đóng close 2xx + F5 history | AC-SI-TL-01 · AC-CORE-10-CLOSE · O2/O4 |
| **VAL-CORE-SI-03** | Ngừng stop 2xx · ≠ silent DELETE | AC-SI-TL-02 · AC-CORE-10-STOP |
| **VAL-CORE-SI-04** | Suspend thiếu căn cứ → 400; đủ → 2xx | AC-SI-TL-03 · AC-CORE-10-SUSPEND* · O5 |
| **VAL-CORE-SI-05** | change_rate append · no silent overwrite | AC-SI-TL-04 · AC-CORE-10-RATE · O4 |
| **VAL-CORE-SI-06** | Resume + F5 · catalog/CRUD/LIVE ≠ DONE · printable false · CORE-09/07 RETAIN · PAY-06 OUT · BH≠CORE-07 · honesty | AC-SI-TL-05 · AC-CORE-10-RESUME/F5/≠-*/H/MK-* · O3/O6/O7/O8/O9/O10 |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **PAY AC-SI-TL-06 OUT invent DONE** · catalog ≠ CORE-10 DONE · CRUD ≠ DONE · LIVE ≠ module DONE · BH ≠ CORE-07 · Nest `/core` DENY · C-SLICE

---

## 5. Journeys DRAFT (O12)

| J-ID | Title | Click path (draft) | Pass when |
|------|-------|--------------------|-----------|
| **J-HRM-CORE-10-01** | **Mở timeline BH** | Login → Hồ sơ → tab BH → GET employee-insurances 200 · periods[] · statusLabelVi · Nest `/core` 0 · no seed | AC-CORE-10-01/LOAD · O1/O11 · U65 · **DRAFT** |
| **J-HRM-CORE-10-02** | **Đóng (close)** | Đóng + ngày hiệu lực → POST actions `close` 2xx → F5 còn dòng mới + lịch sử cũ · Nest `/core` 0 | AC-SI-TL-01 · AC-CORE-10-CLOSE · O2/O4 · U65 · **DRAFT** |
| **J-HRM-CORE-10-03** | **Ngừng (stop)** | Ngừng + ngày → POST `stop` 2xx → F5 · ≠ DELETE-as-ngừng · Nest `/core` 0 | AC-SI-TL-02 · AC-CORE-10-STOP · O2 · U65 · **DRAFT** |
| **J-HRM-CORE-10-04** | **Tạm hoãn + căn cứ** | (Neg) thiếu căn cứ → 400 ACTION-400 · (Pos) suspend + reason + ngày → 2xx → F5 · Nest `/core` 0 | AC-SI-TL-03 · AC-CORE-10-SUSPEND* · O5 · U65 · **DRAFT** |
| **J-HRM-CORE-10-05** | **Đổi mức (change_rate)** | Đổi mức + ngày → POST `change_rate` 2xx · period mới · prior closed · PATCH contrib 400 redirect · Nest `/core` 0 | AC-SI-TL-04 · AC-CORE-10-RATE · O4 · U65 · **DRAFT** |
| **J-HRM-CORE-10-06** | **Resume + F5 + seals · ≠DONE** | Resume → `active` enrollment · F5 history · Nest `/core` 0 · cite catalog≠DONE · CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 · printable false · PAY-06 OUT · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 GATE/ACT-400/Nest DENY/checklist≠DONE/free PATCH≠DONE · soft≠CORE-06 DONE · no reopen J-09/07/06/05/03/02B/09D..01 · ≠ invent PAY/ATT/Word | AC-SI-TL-05 · AC-CORE-10-RESUME/F5/≠-*/H/MK-* · O3/O6/O7/O8/O9/O10 · U19 · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip `hrm_personnel_uat_ready` · **≠** `contracts_printable_ready` · **≠** claim catalog/CRUD/LIVE = CORE-10 DONE · **≠** claim CORE-09/07 DONE · **≠** invent PAY AC-SI-TL-06 DONE.

| Sealed peer | Rule |
|-------------|------|
| **J-HRM-CORE-09-01..06** / `CORE09QC1-MSLNBA89` / `CORE09QA1-MSLNTR5P` | must_keep fill+registry · printable **false** · 09a–d≠DONE · registry≠DONE · Word OUT · **≠** claim CORE-09 DONE |
| **J-HRM-CORE-07-01..05** / `CORE07QC1-KZJTSHNT` | must_keep activate · GATE 409 · ACT-400 · Nest `/core` 0 · checklist≠DONE · free PATCH≠DONE · **≠** claim CORE-07 DONE · **≠** conflate BH Hoạt động |
| **J-HRM-CORE-06-*** / `CORE06QC1-MSLID363` | must_keep soft≠DONE · **≠** claim soft=CORE-06 DONE |
| **J-HRM-CORE-05-01..05** / `CORE05QC1-MSLGVT40` | must_keep AST/BB/serial/DELETE-FORBIDDEN |
| **J-HRM-CORE-03-01..05** / `CORE03QC1-MSLFJH0K` | must_keep DOC/ET/CHK |
| **J-HRM-CORE-02B-01..04** / `CORE02BQC1-MSLEFQC1` | must_keep EMP-CF |
| **J-HRM-CORE-09D..09A / 08 / 02 / 01** | must_keep peer stamps · **≠** printable / closed-8 DONE |
| SI type / insurer catalog peers | **RETAIN cite** · **≠** CORE-10 DONE alone |

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **PAY AC-SI-TL-06 OUT invent DONE** · catalog ≠ CORE-10 DONE · CRUD ≠ DONE · LIVE ≠ module DONE · BH ≠ CORE-07 · Nest `/core` DENY · C-SLICE

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false RETAIN** · **DENY** flip |
| `hrm_personnel_uat_ready` | **false** · **DENY** flip |
| Claim catalog alone = CORE-10 / FR-10 DONE | **DENIED** (O6) — footer **catalog ≠ CORE-10 DONE** |
| Claim enrollment CRUD alone = CORE-10 DONE | **DENIED** (O7) |
| Claim LIVE actions alone = module DONE | **DENIED** (O8) — need J-* |
| Conflate BH «Hoạt động» ↔ CORE-07 activate | **DENIED** (O3) |
| Claim CORE-09 DONE / printable flip / Word invent | **DENIED** |
| Claim CORE-07 DONE / checklist=CORE-07 DONE / free PATCH=CORE-07 DONE | **DENIED** |
| Claim soft = CORE-06 DONE | **DENIED** · soft≠DONE **RETAIN** |
| Claim PAY DONE (AC-SI-TL-06) / ATT DONE | **DENIED** · **OUT invent** |
| Claim printable / closed-8 DONE | **DENIED** |
| Nest `/core` dual · wipe CORE-09/07/06/05/03/02b/09d..01 | **DENIED** |
| C-SLICE | GWC later ≠ module CORE/CTR/SI/personnel UAT ≠ Phase1 |
| must_keep W22 | CORE-09 `CORE09QC1-MSLNBA89` · printable false · ≠ CORE-09 DONE |
| must_keep W21 | CORE-07 activate `CORE07QC1-KZJTSHNT` · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · **≠** CORE-07 DONE |
| must_keep W20..W10 | CORE-06 soft≠DONE · CORE-05 · CORE-03 · CORE-02b · CORE-09d..01 · 08 · 02 · 01 |
| DENY | honesty flip · seed · apps/** · reopen sealed J-HRM-CORE-09-01..06 / 07 / 06 / 05 / 03 / 02B / 09D..01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **HOLD default** (no REQUIRED schema invent: LIVE `employee_insurances` · `hrm_insurance_rate_period` · peer type/insurer RETAIN cite) · then **sa API** RETAIN cite F-CORE-SI-01/02/03 — residual wire **only if** closable gap proven |
| **ba-data** | **HOLD** (default) — reopen **REQUIRED** only if DATA proves typed col ABSENT for display-ready periods/status |
| **sa API-01** | After HOLD stamp — RETAIN cite F-CORE-SI-01 · F-CORE-SI-02 · F-CORE-SI-03 · paper `/core` alias only · **DENY** Nest dual · **DENY** invent PAY |
| **Dev** | **HOLD** until API CONFIRMED · **DENY** Nest `/core` dual · **DENY** wipe CORE-09/07/06.. · **DENY** invent PAY/ATT/printable/Word · **DENY** claim catalog/CRUD/LIVE = CORE-10 DONE · **DENY** conflate CORE-07 · **DENY** claim CORE-09/07 DONE |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-10
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01.md · SA Option A · R-CORE-10-TL-01 fidelity HOLD · R-CORE-10-SUSPEND HOLD · R-CORE-10-DISP HOLD · R-CORE-10-CAT-CITE ≠ DONE · R-CORE-10-PAY-06 OUT invent PAY DONE · printable false · CORE09QC1-MSLNBA89 ≠ CORE-09 DONE · CORE07QC1-KZJTSHNT GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE · CORE06QC1-MSLID363 soft≠DONE · peers CORE-05/03/02b/09d..01
spec_ref: F-CORE-SI-01/02/03 physical /api/hrm/employee-insurances* + POST …/:id/actions · LIVE public.employee_insurances · hrm_insurance_rate_period append-only RETAIN · Nest /core DENY · catalog ≠ CORE-10 DONE · enrollment CRUD ≠ DONE · LIVE ≠ module DONE · BH Hoạt động ≠ CORE-07

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — no invent/change on LIVE employee_insurances enrollment ONE SoT
2) CONFIRM HOLD — hrm_insurance_rate_period append-only RETAIN — DENY invent overwrite / second history SoT
3) CONFIRM HOLD — si_insurance_type / si_insurer peer cite — ≠ CORE-10 DONE alone — DENY wipe
4) Cite display-ready DTO: periods[] · statusLabelVi · effective_from/to dd/MM/yyyy · suspend_reason · amounts
5) RETAIN CORE-09 printable false · CORE-07 activate GATE 409 · ACT-400 · Nest /core DENY · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE · Nest /core DENY
6) DENY wipe CORE-09/07/06/05/03/02b/09d..01 · invent PAY/ATT/printable/Word DONE · claim catalog/CRUD/LIVE = CORE-10 DONE · claim CORE-09/07 DONE · conflate BH Hoạt động ↔ CORE-07 · honesty flip · reopen sealed J-HRM-CORE-09-01..06 / 07 / 06 / 05 / 03 / 02B / 09D..01 · seed · apps/**
7) Unlock next: sa API-01 RETAIN cite F-CORE-SI-01/02/03 — paper /core alias only — residual wire ONLY if closable gap proven — PAY AC-SI-TL-06 remain OUT invent DONE

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API residual (RETAIN cite · wire-only if gap)
```

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-CORE-10 against SA Option A: physical prefer **`/api/hrm/employee-insurances*`** + **`POST …/:id/actions`** (`close\|stop\|suspend\|change_rate\|resume`) · paper `/core` = alias only · map **AC-SI-TL-01..05** → LIVE actions · deepen **AC-CORE-10-*** · **catalog ≠ CORE-10 DONE** · **enrollment CRUD ≠ DONE** · **LIVE actions ≠ module DONE without J-*** · vocab **BH Hoạt động = enrollment active** · **DENY** conflate CORE-07 · residuals **R-CORE-10-TL/SUSPEND/DISP/CAT-CITE/≠DONE/PAY-06/HONESTY** · **printable false RETAIN** · **PAY AC-SI-TL-06 OUT invent DONE** · **must_keep** CORE-09 (`CORE09QC1-MSLNBA89`) · CORE-07 (`CORE07QC1-KZJTSHNT` · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE) · soft≠CORE-06 DONE · Nest `/core` **DENIED** · mint **J-HRM-CORE-10-01..06 DRAFT** · **ba-data HOLD default** · DENY invent PAY/ATT/printable/Word · wipe peers · reopen sealed J-* · seed · apps/** · C-SLICE. |
| **next_owner** | **ba-data** (HOLD stamp → then sa API RETAIN cite) |
| **ack_status** | **PASS_TO_PM** |
| **residual** | DATA-01 HOLD · API F-CORE-SI-01/02/03 cite · J-10-01..06 DRAFT until U65 · PAY AC-SI-TL-06 OUT · personnel/printable flags HOLD · catalog/CRUD/LIVE ≠ DONE · CORE-09/07 RETAIN ≠ DONE · soft≠CORE-06 DONE |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01.md` |

---

*End BA-01 · O1–O12 CONFIRMED · U89 Wave-23 · printable false RETAIN · catalog ≠ CORE-10 DONE · CRUD ≠ DONE · LIVE ≠ module DONE · PAY-06 OUT · BH ≠ CORE-07 · CORE-09/07 RETAIN · Nest /core DENY · no apps/** · no seed.*
