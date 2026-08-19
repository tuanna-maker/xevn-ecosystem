# BA AC pack — Wave-20 CORE cluster · UC-BP-CORE-06 (Thu hồi tài sản khi kích hoạt nghỉ việc · Q-ASSET stub RETAIN soft-return + TERM checklist delta)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-06-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-20 seat **#22**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD** (soft-return RETAIN · TERM/CLOSED prefer wire/aggregate · **no** invent full `hrm_termination` primary this seat) · sa API residual unlock after HOLD stamp · **DENY** claim soft Thu hồi alone = CORE-06 DONE |
| **change_mode** | **ADD** (align SA-01 gap-only RETAIN — **no** Nest `/core` dual · **no** wipe CORE-05 AST/BB/serial/DELETE-FORBIDDEN · **no** wipe CORE-03 DOC/ET/CHK · **no** wipe CORE-02b EMP-CF · **no** full Asset accounting · **no** invent CORE-07 DONE · **no** invent PAY-07 settle engine DONE · **no** claim soft-return alone = CORE-06 DONE · **no** claim CORE-05 = personnel UAT / FR DONE · **no** reopen CORE-05/03/02b/09d..01) |
| **uc_ids** | `UC-BP-CORE-06` |
| **depends_on** | `PO-HRM-MVP-GD1-CORE-06-CLUSTER-SA-01` **Option A LOCKED** · peer QC **`CORE05QC1-MSLGVT40`** · QA **`CORE05QA2-MSLGSWSF`** · **`CORE03QC1-MSLFJH0K`** / `CORE02BQC1-MSLEFQC1` / `CORE09DQC1-MSLDR8I3` / `CORE09CQC1-MSLBXMUT` / `CORE09BQC1-MSLB05DZ` / `CORE09AQC1-MSLA4LX9` / `CORE08QC1-MSL9BFFE` / `CORE02QC1-MSL80DU6` / `CORE01QC1-MSL6WMS7` · EMP DOC/ET **`EMPPLATQA-MSIZXHIM`** · TOK **`EMPTOKQA-MSJ290VB`** · **`R-CORE-05-HONESTY` INFO idle-ok RETAIN** |
| **ref_sa** | `PO-HRM-MVP-GD1-CORE-06-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-CORE-05-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-CORE-03-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-06** · Luồng chính **#1–#4** · Diễn biến **#1–#2 + Thành công** · **BR-BP-AST-02** · phụ thuộc danh sách đang giữ **CORE-05** · gate **PAY-07** tín hiệu · peers CORE-05..01 **must_keep** · CORE-04 OCR **OUT** · CORE-07 activate = peer (**≠** this seat DONE) · PAY-07 settle = peer consumer (**≠** invent DONE) |
| **ref_api_paper** | **F-CORE-AST-02** (paper `/core/…/assets/{id}/return` · physical prefer **PATCH** `/employees/:id/assets/:assetId`) · residual peer **F-CORE-TERM-01** · PAY **F-PAY-TERM-SETTLE-01** reads tín hiệu (**OUT invent DONE**) · must_keep **F-CORE-AST-01** + **F-CORE-AST-BB-01** · F-CORE-CHK-01 · F-EMP-CAT-DOC/ET/EFF · F-EMP-TOK · F-EMP-CF · CTR TPL/VER/PDF/PACK/PREV/CL · CORE-08/02/01 · **F-CORE-ACT-01** CORE-07 **OUT invent DONE** |
| **ref_db** | LIVE `public.employee_assets` (RETAIN CORE-05 — status `assigned`/`returned`/`lost`/`maintenance` · `return_date` · BB confirm cols) · paper `hrm_termination.asset_checklist_closed` + `pay_termination_settlement.asset_checklist_ack` = consumer flags · Nest `hrm_termination` / terminations route **ABSENT AS-IS** · **DENY** invent full Asset ledger this seat |
| **ref_adr** | ADR **Q-ASSET-MODULE** GĐ1 assignment stub **must** support thu hồi khi nghỉ (BR-BP-AST-02) trên stub — **Không** SoT kho/CCDC toàn tập đoàn |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · personnel / CORE / CTR module UAT **false** · **`C-SLICE-≠-MODULE`** · **`R-CORE-05-HONESTY` INFO idle-ok** · **DENY** claim CORE-05 = personnel UAT / FR DONE · **DENY** claim soft-return alone = CORE-06 DONE · **DENY** invent CORE-07 DONE · **DENY** claim printable / closed-8 DONE |
| **Cấm** | Nest `/core` dual · wipe CORE-05 AST/BB/serial/DELETE-FORBIDDEN · wipe CORE-03 DOC/ET/CHK · wipe CORE-02b EMP-CF · full Asset accounting · invent CORE-07 / PAY-07 engine DONE · claim soft-return alone = FR-06 DONE · honesty flip · seed · apps/** · reopen sealed J-HRM-CORE-05-01..05 / 03 / 02B / 09D/09C/09B/09A/08/02/01 |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-20 seat #22 — **gap-only RETAIN** soft-return trên LIVE assignment SoT + disposition residual TERM checklist / closed tín hiệu:

1. **Assignment SoT** = LIVE `public.employee_assets` trên **`/api/hrm/employees/:id/assets*`** — **same CORE-05 SoT** · **RETAIN** · physical prefer **PATCH** status/return_date = paper **F-CORE-AST-02**.
2. **Soft Thu hồi Profile** = **RETAIN path** for Diễn biến mark returned/lost — **≠ CORE-06 DONE** without lệnh nghỉ checklist + closed tín hiệu.
3. **Danh sách đang giữ** = filter `status=assigned` từ CORE-05 — **RETAIN**.
4. **Termination checklist** = residual **`R-CORE-06-TERM-CHK-01` IN-SCOPE** — prefer checklist UI entry từ ngữ cảnh lệnh nghỉ (load assigned) · Nest terminations **ABSENT** · **DENY** invent Nest `/core` TERM dual primary · **≠** invent full offboard DONE.
5. **Closed tín hiệu PAY-07** = residual **`R-CORE-06-CLOSED-01` IN-SCOPE** — prefer **aggregate** «0 assigned bắt buộc còn mở» · **DENY** invent PAY settlement engine DONE.
6. **Exception / lost** = residual **`R-CORE-06-EXCEPTION-01`** — `status=lost` + notes **OK stub** · structured bồi thường **OUT invent**.
7. **Mint** `J-HRM-CORE-06-01..05` DRAFT · **DENY** reopen sealed CORE-05/03/02b/09d..01 · **DENY** invent CORE-07 DONE.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS | Mở checklist thu hồi từ lệnh nghỉ / ngữ cảnh nghỉ → rà soát đang giữ → mark returned/lost/exception → đánh dấu thu hồi xong |
| Nhân viên / Quản lý tài sản | Xác nhận bàn giao thu hồi (GĐ1 stub — **≠** full Asset accounting) |
| PAY (peer) | Đọc tín hiệu closed khi tất toán (**OUT invent engine** this seat) |
| Group CEO | Scope rollup `main` — U19 assets list = get = mutate |
| Member CEO / HRBP | Chỉ pháp nhân membership · cùng profile scope resolver |
| Hệ thống | Status VI · soft history · DELETE-FORBIDDEN · **không** Nest `/core` dual · **không** wipe CORE-05/03/02b |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · map FR-06 Luồng #1–#4 + Diễn biến #1–#2 → AC-CORE-06-* · residual TERM/CLOSED/EXCEPTION disposition · J-HRM-CORE-06-* DRAFT | Impl `apps/**` / migration / seed |
| Physical prefer PATCH `/employees/:id/assets*` soft-return RETAIN · checklist delta AC | Nest `/core/…/return` SoT · full Asset kho/depreciation |
| Soft≠DONE explicit · closed aggregate tín hiệu AC | Claim soft Profile Thu hồi alone = FR-06 DONE |
| Honesty footer · C-SLICE · CORE-07/PAY OUT invent DONE | Flip ready flags · invent CORE-07/PAY DONE · reopen J-CORE-05/03/02B/09D..01 |
| must_keep CORE-05 AST/BB/serial/DELETE-FORBIDDEN · CORE-03 · CORE-02b · CORE-09d..01 | Claim CORE-05 = personnel UAT · printable/closed-8 |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Physical path | **YES** — Mark thu hồi Network **chỉ** physical **`PATCH /api/hrm/employees/:id/assets/:assetId`** (`status` + `return_date`) · optional thin `…/assets/:assetId/return` on **same** controller if UX needs · paper `/api/hrm/core/…/assets/{id}/return` = **alias / DOC-DELTA only** — **FAIL** nếu Nest `@Controller('core')` second AST/TERM SoT — **AC-CORE-06-01** |
| **O2** | Assignment SoT | **YES** — LIVE **`public.employee_assets`** = **same** CORE-05 SoT — **DENY** second Nest table as primary · **DENY** wipe CORE-05 spine — **AC-CORE-06-01/MK-05** |
| **O3** | Status map | **YES** — `assigned` = **đang giữ / cần thu** (VI «Đang sử dụng») · `returned` = **đã thu** (VI «Đã thu hồi») · `lost` = **mất/ngoại lệ** (VI «Mất/ghi nợ») · `maintenance` retain — checklist filter = `status=assigned` — **BR-BP-AST-02** — **AC-CORE-06-02** |
| **O4** | Soft-return vs CORE-06 | **YES** — Soft Thu hồi Profile = **RETAIN path** for Diễn biến mark (#2) — **≠ CORE-06 DONE** without TERM checklist entry (#1) + closed tín hiệu (#3–#4) — footer every evidence — **AC-CORE-06-≠-SOFT-DONE** |
| **O5** | Termination trigger | **YES IN-SCOPE residual `R-CORE-06-TERM-CHK-01`** — prefer **checklist UI entry** từ ngữ cảnh lệnh nghỉ: load 100% `assigned` từ CORE-05 SoT · soft TERM case table **HOLD invent primary** (Nest terminations ABSENT · gap vs paper `hrm_termination` **PROVEN** but **not** unlock invent Nest `/core` TERM dual) · empty CTA nếu chưa có nguồn lệnh nghỉ (no seed) — **≠** invent full offboard DONE — **AC-CORE-06-03/04** |
| **O6** | Closed tín hiệu PAY-07 | **YES IN-SCOPE residual `R-CORE-06-CLOSED-01`** — prefer **aggregate** closed = **0** mandatory `assigned` còn mở (display-ready boolean) · optional persisted `asset_checklist_closed` **HOLD invent** unless TERM case later proves need · PAY-07 **reads tín hiệu only** — **DENY** invent PAY settle engine DONE — **AC-CORE-06-05/06** |
| **O7** | Exception / lost | **YES** — `status=lost` + reason `notes` **OK stub** · structured bồi thường / giá trị kế toán **OUT invent** full Asset — **AC-CORE-06-07** · **AC-CORE-06-EXC-OUT** |
| **O8** | Partial thu hồi | **YES** — FR-06 đặc biệt «nghỉ trong ngày»: **allow** partial close (một phần `returned`/`lost`) + track remainder still `assigned` · closed tín hiệu **false** until remainder cleared or waived — **AC-CORE-06-08** |
| **O9** | CORE-07 / PAY-07 | **YES OUT invent DONE** — activate `F-CORE-ACT-01` + settlement `F-PAY-TERM-SETTLE-01` = peers — CORE emits tín hiệu only — **AC-CORE-06-07-OUT** · **AC-CORE-06-PAY-OUT** |
| **O10** | Honesty / peers OUT | **YES false** — all ready flags false · C-SLICE · **DENY** flip personnel/printable/recruitment/jd · **DENY** claim CORE-05 = personnel UAT / FR DONE · **DENY** claim soft-return alone = CORE-06 DONE · **DENY** invent CORE-07 DONE · **DENY** claim printable/closed-8 · **must_keep** CORE-05..01 · Nest DENY · **`R-CORE-05-HONESTY` INFO idle-ok** — **AC-CORE-06-H** |
| **O11** | Display-ready | **YES** — Checklist DTO: asset rows (`asset_name` · `asset_code` · `serial_number` · `status` + **status_label_vi** · `return_date` · `notes`) + **`asset_checklist_closed`** (aggregate boolean) + optional soft `termination_context_id` when live — FE bind · **cấm** FE invent Asset / PAY SoT |
| **O12** | Journeys | **YES** — Mint **`J-HRM-CORE-06-01..05` DRAFT** (lệnh nghỉ/checklist → list đang giữ → mark returned/lost → closed tín hiệu · Nest `/core` 0 · soft Profile ≠ DONE alone · seals) · **DENY** reopen sealed J-HRM-CORE-05-01..05 / 03 / 02B / 09D/09C/09B/09A/08/02/01 |

**Architecture SoT:** ONE LIVE assignment spine · paper `/core` return = alias only · soft Profile ≠ FR-06 DONE · TERM checklist = UI entry on assigned list · closed = aggregate prefer · U19 list↔get↔mutate · CORE-05 AST/BB/serial/DELETE-FORBIDDEN + CORE-03 DOC/ET/CHK + CORE-02b EMP-CF + CORE-09d..01 **must_keep**.

### Primary API surface (BA lock — O1)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| List đang giữ / mark thu hồi | **`GET /api/hrm/employees/:id/assets`** · **`PATCH …/assets/:assetId`** (`status=returned\|lost\|maintenance` + `return_date`) | `/core/…/assets/{id}/return` alias only |
| Optional thin return | Prefer same controller `…/assets/:assetId/return` **if** UX needs — **same SoT** | alias |
| Checklist closed tín hiệu | Prefer **derived** from GET assets (count assigned=0) · optional soft flag later | paper `asset_checklist_closed` HOLD invent |
| Soft TERM / lệnh nghỉ | Prefer checklist UI entry · Nest terminations **HOLD invent primary** | paper `/core/…/terminations` alias only — **DENY** Nest dual |
| PAY settle | Peer **OUT invent DONE** | F-PAY-TERM-SETTLE-01 |
| CORE-05 AST/BB | **must_keep** assets* + confirm | alias |
| CORE-03 CHK/DOC/ET | **must_keep** document-checklist* · document-types* · employment-types* | alias |
| CORE-02b EMP-CF | **must_keep** settings-catalogs + custom_fields | alias |
| CORE-09d..09a / 08 / 02 / 01 | **must_keep** contracts-insurance* · rewards · packages · public | alias — 09c **≠** printable UAT |
| CORE-07 activate | **OUT invent DONE** | F-CORE-ACT-01 |

**Invariant CORE-06-PATH:** Checklist / Profile mark Network **MUST** hit `/employees/:id/assets*` · Nest dual `/core` AST/TERM SoT = **FAIL O1**.

**Invariant CORE-06-≠-SOFT-DONE:** Claim Profile «Thu hồi» alone = FR-UC-BP-CORE-06 / CORE-06 DONE = **FAIL O4**.

**Invariant CORE-06-≠-05-PERSONNEL:** Claim CORE-05 assets = personnel UAT / FR DONE = **FAIL O10**.

**Invariant CORE-06-≠-07-DONE:** Invent CORE-07 / F-CORE-ACT-01 DONE this seat = **FAIL O9**.

**Invariant CORE-06-≠-PAY-DONE:** Invent PAY-07 settle engine DONE this seat = **FAIL O9**.

**Invariant CORE-06-≠-PRINTABLE:** Claim printable / closed-8 DONE = **FAIL O10**.

**Wire codes (RETAIN — no invent rewrite sealed):** `HRM-EMP-PROFILE-200/201/202` · `HRM-EMP-ASSET-DELETE-FORBIDDEN` · `HRM-EMP-ASSET-SERIAL-CONFLICT` · `HRM-SCOPE-409` · residual closed gate codes when live · sealed CORE-* · **DENY** 2xx hard DELETE issued.

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-20 · Option A) |
|---|----------------------|---------------------------|
| Soft mark returned/lost | FE Profile «Thu hồi» → PATCH `status=returned` (+ `return_date`) · also `lost`/`maintenance` | **RETAIN path** (**O1/O4**) · **≠** FR-06 DONE alone |
| List đang giữ | GET assets · filter `assigned` | **RETAIN** (**O2/O3**) |
| DELETE-FORBIDDEN / history | `HRM-EMP-ASSET-DELETE-FORBIDDEN` | **RETAIN must_keep** (**O2**) |
| Serial 409 + BB confirm | Wave-19 sealed | **RETAIN must_keep** (**O10**) |
| Paper `/core` return | Nest `@Controller('core')` **ABSENT** | alias only (**O1**) |
| Lệnh nghỉ / termination.started | Nest terminations / `hrm_termination` **ABSENT** | Residual unlock checklist UI (**O5**) |
| Checklist thu hồi instance | No TERM-triggered checklist | Residual AC (**O5**) |
| Cờ thu hồi xong | ABSENT | Aggregate prefer (**O6**) |
| Exception / mất + bồi thường | `status=lost` + notes | **RETAIN stub** · structured OUT (**O7**) |
| PAY-07 settlement engine | Peer PAY | **OUT invent DONE** (**O9**) |
| Activate hồ sơ | CORE-07 QUEUED | **OUT invent DONE** (**O9**) |
| Full Asset / kho | ABSENT | **OUT** |
| Honesty | C-SLICE · personnel/printable false · `R-CORE-05-HONESTY` idle-ok | **false** (**O10**) |

### 1.1 Disposition **R-CORE-06-TERM-CHK-01**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-06-TERM-CHK-01` |
| **Scope** | **IN-SCOPE residual** for UC-BP-CORE-06 Diễn biến **#1** (rà soát từ lệnh nghỉ) + Luồng chính **#1** + BR-BP-AST-02 «100% Đang sử dụng → thu hồi» |
| **OUT of residual** | Soft mark returned/lost on Profile (already **RETAIN LIVE**) · Nest `/core` TERM dual invent · full offboard product · invent CORE-07 DONE · invent PAY settle DONE |
| **Rationale IN-SCOPE** | SRS tiên quyết «đã có lệnh nghỉ việc hoặc checklist nghỉ» · BR-BP-AST-02 «Lệnh nghỉ tạo checklist thu hồi 100% đang gán» · paper F-CORE-TERM-01 · SA O5; LIVE Nest **no** terminations route / `hrm_termination` |
| **Physical gap vs paper** | **PROVEN ABSENT** Nest terminations — **but** BA locks **prefer checklist UI entry** that loads assigned from LIVE `employee_assets` (no invent Nest `/core` TERM primary; soft TERM case table **HOLD invent**) |
| **ba-data** | **HOLD** — **no REQUIRED** invent `hrm_termination` / Nest TERM dual this seat · reopen DATA **REQUIRED** only if PM/SA later chooses soft TERM case cols over pure checklist-from-assigned |
| **sa API** | After BA HOLD: residual surface unlock — checklist entry loads `GET …/assets` filter `assigned` · optional soft TERM context id later — **wire-capable** on LIVE SoT · paper `/core/…/terminations` = alias only |
| **DENY** | Claim soft Profile Thu hồi = R-CORE-06-TERM-CHK-01 CLOSED · invent Nest `/core` TERM SoT · seed lệnh nghỉ densify · invent full offboard DONE |

### 1.2 Disposition **R-CORE-06-CLOSED-01**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-06-CLOSED-01` |
| **Scope** | **IN-SCOPE residual** for Diễn biến **#2** «Cờ thu hồi xong» · Luồng **#3–#4** · PAY-07 input tín hiệu · BR «chặn tất toán nếu còn item bắt buộc chưa thu» |
| **OUT of residual** | PAY settlement engine / payslip · invent `pay_termination_settlement` writer DONE |
| **Rationale IN-SCOPE** | Paper `asset_checklist_closed` / `asset_checklist_ack` · FR-06 #3–#4 · SA O6; LIVE flag col **ABSENT** |
| **Physical gap vs paper** | Paper flag col **ABSENT** — **BA prefer aggregate** closed = zero mandatory `assigned` remaining (display-ready) — **wire-capable** without invent col |
| **ba-data** | **HOLD** invent `asset_checklist_closed` / PAY ack cols — aggregate sufficient for GĐ1 CORE emit · ADD persisted flag only if PAY consumer proves need later |
| **sa API** | Expose display-ready `asset_checklist_closed` (derived) on checklist DTO · **DENY** invent PAY engine |
| **DENY** | Claim Profile soft-return alone = CLOSED residual DONE · invent PAY-07 DONE |

### 1.3 Disposition **R-CORE-06-EXCEPTION-01**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-06-EXCEPTION-01` |
| **Scope** | **IN-SCOPE stub RETAIN** — mark `status=lost` + reason notes · **OUT invent** structured bồi thường / giá trị kế toán Asset |
| **Rationale** | FR-06 đặc biệt «Tài sản mất: ghi lý do + giá trị bồi thường **nếu cấu hình**» — GĐ1 stub = lý do notes; giá trị structured = phase sau / full Asset |
| **ba-data** | **HOLD / OUT invent** structured compensation cols |
| **DENY** | Claim lost+notes = full Asset accounting DONE |

### 1.4 ba-data disposition summary

| Slice | Decision | Rule |
|-------|----------|------|
| Soft-return / status / return_date | **HOLD** | LIVE `employee_assets` RETAIN — **no** greenfield wipe |
| Assignment CRUD / BB / serial / DELETE-FORBIDDEN | **HOLD · must_keep** | CORE-05 sealed — **DENY wipe** |
| Full `hrm_termination` / Nest TERM dual | **HOLD invent** | Prefer checklist UI on assigned list · gap ABSENT ≠ auto invent Nest `/core` |
| `asset_checklist_closed` persisted col | **HOLD invent** | Prefer aggregate closed |
| Structured bồi thường | **HOLD / OUT invent** | lost+notes stub OK |
| Nest `/core` | **DENY** | alias only |
| CORE-05 / CORE-03 / EMP-CF tables | **DENY wipe** | must_keep |
| CORE-07 / PAY settle tables | **OUT invent DONE** | peers |

**Unlock next:** **sa API** residual (wire-only prefer) — RETAIN cite F-CORE-AST-02 physical PATCH + checklist closed aggregate + TERM UI entry AC — **ba-data HOLD** stamp sufficient to unlock API (no REQUIRED schema invent this wave).

---

## 2. Business rules (normative — SRS + SA + ADR; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-AST-02** | Kích hoạt nghỉ / checklist nghỉ | 100% tài sản «Đang sử dụng» (`assigned`) vào thu hồi | Checklist đủ · chặn tất toán nếu còn item bắt buộc chưa thu |
| **BR-CORE-06-PATH** | API mark / list | Physical `/employees/:id/assets*` | Nest `/core` dual = **FAIL O1** |
| **BR-CORE-06-STATUS** | Checklist đang giữ | Filter `status=assigned` | Other statuses = đã xử lý / ngoài «cần thu» |
| **BR-CORE-06-SOFT≠DONE** | Profile Thu hồi alone | ≠ FR-06 DONE | Claim DONE = **FAIL O4** |
| **BR-CORE-06-SOFT-HIST** | Issued history | Prefer PATCH status · **FORBIDDEN** hard DELETE issued | DELETE-FORBIDDEN RETAIN |
| **BR-CORE-06-CLOSED** | Mandatory assigned remaining > 0 | Closed = false · cảnh báo / chặn PAY tín hiệu | Aggregate |
| **BR-CORE-06-PARTIAL** | Nghỉ trong ngày | Allow partial return · track remainder | Closed false until clear/waive |
| **BR-CORE-06-EXC** | Mất | `lost` + notes stub | Structured bồi thường OUT |
| **BR-CORE-06-NO-SEED** | Nghiệm thu | FE only | Seed = **FAIL U65** |
| **BR-CORE-06-≠-05-DONE** | CORE-05 seal | ≠ personnel UAT / FR DONE | Claim = **FAIL O10** |
| **BR-CORE-06-07-OUT** | CORE-07 | Peer QUEUED | Invent DONE = **FAIL O9** |
| **BR-CORE-06-PAY-OUT** | PAY-07 | Emits tín hiệu only | Invent settle DONE = **FAIL O9** |
| **BR-CORE-06-STUB** | ADR Q-ASSET | Stub checklist on assignment | Full Asset invent = **FAIL** |

### Error taxonomy (RETAIN + residual)

| Code | HTTP | UX intent (VI) | ≠ |
|------|------|----------------|--|
| `HRM-EMP-PROFILE-200/202` | 2xx | Cập nhật status thu hồi | Claim FR-06 DONE alone |
| `HRM-EMP-ASSET-DELETE-FORBIDDEN` | 409 | Không xóa cứng — dùng Thu hồi | Silent hard DELETE |
| `HRM-EMP-ASSET-SERIAL-CONFLICT` | 409 | must_keep CORE-05 | Soft-return path |
| `HRM-SCOPE-409` | 409 | Ngoài phạm vi pháp nhân | Soft OK |
| Residual closed gate (when live) | 4xx | Còn tài sản bắt buộc chưa thu | PAY invent |
| Sealed CORE-* | — | **DENY** rewrite · must_keep regression | — |

---

## 3. Diễn biến FR-UC-BP-CORE-06 + BR-BP-AST-02 → AC / VAL map (normative)

### 3.0 Map overview

| SRS source | Tương tác | AC cite | J-* | LIVE Network (cite) |
|------------|-----------|---------|-----|---------------------|
| **Luồng #1** · Diễn biến #1 | Mở checklist thu hồi từ lệnh nghỉ · rà soát đang giữ | **AC-CORE-06-03/04** | **J-HRM-CORE-06-01** | `GET /api/hrm/employees/:id/assets` → filter `assigned` · Nest `/core` **0** · TERM Nest **ABSENT** (residual) |
| **Luồng #2** · Diễn biến #2 mark | Xác nhận từng TS đã thu / ngoại lệ | **AC-CORE-06-01/02/07** | **J-HRM-CORE-06-02** | **PATCH** `…/assets/:assetId` `status=returned\|lost` + `return_date` **2xx** · F5 · cite soft Profile path **≠ DONE alone** |
| **Luồng #3** · Diễn biến #2 cờ | Đủ điều kiện → đánh dấu thu hồi xong | **AC-CORE-06-05** | **J-HRM-CORE-06-03** | Aggregate closed · **ABSENT** persisted flag AS-IS |
| **Luồng #4** | PAY-07 đọc tín hiệu | **AC-CORE-06-06** · **PAY-OUT** | **J-03** spot | CORE emits only · **≠** invent PAY engine |
| **Đặc biệt** mất | lost + lý do | **AC-CORE-06-07** · **EXC-OUT** | **J-02** | PATCH `lost` + notes |
| **Đặc biệt** partial | Nghỉ trong ngày | **AC-CORE-06-08** | **J-04** | Partial PATCH · remainder `assigned` · closed false |
| Soft Profile alone | Footer | **AC-CORE-06-≠-SOFT-DONE** | **J-05** | Soft path RETAIN · **FAIL** if claimed FR-06 DONE |
| Honesty / seals | Footer | **AC-CORE-06-H** · **MK-*** | **J-HRM-CORE-06-05** | Nest `/core` **0** · CORE-05..01 seals |

### 3.1 AC-CORE-06 (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-CORE-06-01** | NV trong scope · ≥1 asset | Mark thu hồi / mất trên checklist hoặc Profile | Network **PATCH** `/api/hrm/employees/:id/assets/:assetId` **2xx** với `status=returned\|lost` (+ `return_date` khi returned) → FE cập nhật · **F5 còn** · Nest `/core` **0** · **no** Nest dual | U65 · O1/O2 · Luồng #2 · cite LIVE soft-return |
| **AC-CORE-06-02** | Có ≥1 row `assigned` | Mở checklist «đang giữ / cần thu» | Chỉ rows `status=assigned` · label VI **«Đang sử dụng»** · display-ready O11 | O3 · BR-BP-AST-02 · Diễn biến #1 |
| **AC-CORE-06-03** | Ngữ cảnh lệnh nghỉ / checklist nghỉ (when residual live) | Mở checklist thu hồi | Load **100%** `assigned` từ CORE-05 SoT · empty CTA hợp lệ nếu 0 assigned · **no seed** | O5 · Luồng #1 · **R-CORE-06-TERM-CHK-01** |
| **AC-CORE-06-04** | TERM Nest ABSENT AS-IS | Claim «lệnh nghỉ Nest `/core`» | **FAIL** — paper TERM = alias · prefer checklist UI entry · **≠** invent Nest dual / full offboard DONE | O5 · O1 |
| **AC-CORE-06-05** | Tất cả mandatory `assigned` đã `returned`/`lost` (or waived) | Đánh dấu thu hồi xong | Display-ready **`asset_checklist_closed=true`** (aggregate prefer) · F5 còn · Nest `/core` 0 | O6 · Luồng #3 · **R-CORE-06-CLOSED-01** |
| **AC-CORE-06-06** | Còn ≥1 mandatory `assigned` | Claim closed / mở tất toán | Closed **false** · cảnh báo / chặn tín hiệu PAY · **≠** invent PAY engine DONE | O6 · BR-BP-AST-02 |
| **AC-CORE-06-≠-SOFT-DONE** | User chỉ bấm Profile «Thu hồi» (no checklist từ lệnh nghỉ + no closed) | Claim FR-06 / CORE-06 DONE | **FAIL** — soft path = RETAIN mark only | O4 · L-CORE-06-02 |
| **AC-CORE-06-07** | Tài sản mất | Mark `lost` + notes lý do | PATCH **2xx** · row không còn «đang giữ» · F5 · structured bồi thường **không** bắt buộc GĐ1 | O7 · FR đặc biệt |
| **AC-CORE-06-EXC-OUT** | Yêu cầu giá trị bồi thường kế toán | Full compensation ledger | **OUT invent** — stub notes đủ GĐ1 | O7 · ADR |
| **AC-CORE-06-08** | Nghỉ trong ngày · partial | Thu một phần | Allow partial `returned`/`lost` · remainder `assigned` · closed **false** until clear/waive | O8 · FR đặc biệt |
| **AC-CORE-06-07-OUT** | Thành công FR-06 | UC kế activate | **Cite** peer CORE-07 / F-CORE-ACT-01 — **≠** PASS this WI as CORE-07 DONE | O9 |
| **AC-CORE-06-PAY-OUT** | Closed tín hiệu | PAY-07 tất toán | CORE **emits** tín hiệu only — **≠** invent F-PAY-TERM-SETTLE-01 DONE | O9 · Luồng #4 |
| **AC-CORE-06-MK-05** | Any CORE-06 evidence | Diff CORE-05 AST/BB/serial/DELETE-FORBIDDEN | Physical assets* + BB soft-confirm + serial 409 + DELETE-FORBIDDEN **intact** · **no** reopen J-HRM-CORE-05-01..05 · `R-CORE-05-HONESTY` INFO idle-ok · **≠** claim CORE-05 = personnel UAT / FR DONE | O2/O10 · `CORE05QC1-MSLGVT40` |
| **AC-CORE-06-MK-03** | Any CORE-06 evidence | Diff CORE-03 DOC/ET/CHK | Physical checklist + DOC/ET + TOK **intact** · **no** reopen J-HRM-CORE-03 | O10 · `CORE03QC1-MSLFJH0K` |
| **AC-CORE-06-MK-02B** | Any CORE-06 evidence | Diff EMP-CF | Four catalogs + KEY + soft-draft + EXT **intact** · **no** reopen J-HRM-CORE-02B | O10 · `CORE02BQC1-MSLEFQC1` |
| **AC-CORE-06-MK-09D..01** | Any CORE-06 evidence | Diff CTR/RD/C&B/public | TPL+clause · VER/PDF ≠ printable · PREV ephemeral · CL · RD · AuthZ/CB · public **intact** · **no** reopen sealed J-* | O10 · peer stamps |
| **AC-CORE-06-H** | Evidence footer | Any seal | personnel/printable/recruitment/jd **false** · C-SLICE · **DENY** soft=CORE-06 DONE · **DENY** CORE-05=personnel · **DENY** CORE-07/PAY/printable/closed-8 DONE · Nest DENY · no reopen J-05/03/02B/09D..01 · `R-CORE-05-HONESTY` idle-ok | O10 |

### 3.2 Scope ladder (U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) + HCNS | Checklist / mark across rollup | Cross-CT mutate without membership |
| **Member CEO / HRBP** | Chỉ pháp nhân membership | Assets list ≠ mutate resolver |
| **No HR mutate** | Deny PATCH assets | Silent 2xx |

**Invariant CORE-06-SCOPE:** assets list/get/mutate **=** same profile scope resolver family (CORE-05 RETAIN).

**Prerequisite:** CORE-05 AST/BB/serial/DELETE-FORBIDDEN seals RETAIN · CORE-03 DOC/ET/CHK RETAIN · CORE-02b EMP-CF RETAIN · CORE-09d..01 stamps RETAIN · **không** seed · honesty flags false · **`R-CORE-05-HONESTY` INFO idle-ok**.

---

## 4. Diễn biến FE U65 (browser matrix)

```text
Login (ceo@xe.vn / member HCNS)
  → /hr Nhân sự → ngữ cảnh lệnh nghỉ / checklist thu hồi (when residual live)
       OR Profile tab Tài sản (soft mark path — cite ≠ FR-06 DONE alone)
  → List đang giữ = GET /api/hrm/employees/:id/assets → status=assigned
  → Mark từng TS: Thu hồi → PATCH status=returned + return_date 2xx → F5
  → Ngoại lệ mất → PATCH status=lost + notes 2xx → F5
  → Partial: một phần returned, remainder assigned → closed=false
  → Khi 0 assigned bắt buộc → asset_checklist_closed=true (aggregate) → F5
  → Assert Nest /core assets|return|terminations = 0
  → Assert hard DELETE issued → 409 HRM-EMP-ASSET-DELETE-FORBIDDEN
  → Footer: soft Profile alone ≠ CORE-06 DONE · ≠ CORE-05 personnel UAT
       · ≠ invent CORE-07/PAY DONE · ≠ printable/closed-8 · honesty false
```

**cấm:** `pnpm seed:*` · API seed assets/TERM · DB fake closed · PASS chỉ curl · Nest `/core` dual · wipe CORE-05/03/02b · full Asset invent · claim soft=FR-06 DONE · claim module DONE · reopen sealed J-*.

### VAL pack (mint)

| VAL-ID | Expect | Maps |
|--------|--------|------|
| **VAL-CORE-RET-01** | GET assigned list + PATCH returned 2xx + F5 | AC-CORE-06-01/02 |
| **VAL-CORE-RET-02** | Checklist từ lệnh nghỉ loads 100% assigned (when residual live) | AC-CORE-06-03/04 · **HOLD until API surface** |
| **VAL-CORE-RET-03** | Aggregate closed true/false + PAY tín hiệu cite | AC-CORE-06-05/06 · PAY-OUT |
| **VAL-CORE-RET-04** | lost+notes · partial remainder | AC-CORE-06-07/08 |
| **VAL-CORE-RET-05** | Soft≠DONE · Nest `/core` 0 · seals · DELETE-FORBIDDEN | AC-CORE-06-≠-SOFT-DONE/H/MK-* |

---

## 5. Journeys DRAFT (O12)

| J-ID | Title | Click path (draft) | Pass when |
|------|-------|--------------------|-----------|
| **J-HRM-CORE-06-01** | **Checklist từ lệnh nghỉ → list đang giữ** | Login → ngữ cảnh nghỉ / checklist thu hồi → GET assets assigned · Nest `/core` 0 · no seed | AC-CORE-06-02/03/04 · O5 · U65 · **DRAFT until TERM UI residual live** |
| **J-HRM-CORE-06-02** | **Mark returned/lost + F5** | Checklist/Profile → PATCH returned\|lost 2xx → F5 · cite soft path · Nest `/core` 0 | AC-CORE-06-01/07 · O1/O3 · U65 · LIVE soft-return cite |
| **J-HRM-CORE-06-03** | **Closed tín hiệu (aggregate)** | Clear all mandatory assigned → closed=true · còn assigned → closed=false · **≠** invent PAY DONE | AC-CORE-06-05/06 · O6 · U65 · **DRAFT until closed display-ready** |
| **J-HRM-CORE-06-04** | **Partial thu hồi** | Return subset · remainder assigned · closed false · F5 | AC-CORE-06-08 · O8 · U65 |
| **J-HRM-CORE-06-05** | **Soft≠DONE · seals · honesty · CORE-07/PAY OUT** | Soft Profile alone ≠ PASS FR-06 · Nest `/core` 0 · CORE-05/03/02b/09d..01 smoke · no CORE-05=personnel · no CORE-07/PAY/printable/closed-8 DONE · DELETE-FORBIDDEN · `R-CORE-05-HONESTY` idle-ok | AC-CORE-06-≠-SOFT-DONE/MK-*/H/07-OUT/PAY-OUT · O4/O9/O10 · U19 |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip `hrm_personnel_uat_ready` · **≠** claim soft-return = CORE-06 DONE.

| Sealed peer | Rule |
|-------------|------|
| **J-HRM-CORE-05-01..05** / `CORE05QC1-MSLGVT40` / `CORE05QA2-MSLGSWSF` | must_keep AST/BB/serial/DELETE-FORBIDDEN · **≠** CORE-05 DONE / personnel UAT · **`R-CORE-05-HONESTY` INFO idle-ok** |
| **J-HRM-CORE-03-01..05** / `CORE03QC1-MSLFJH0K` | must_keep DOC/ET/CHK · **≠** personnel UAT |
| **EMPPLATQA-MSIZXHIM** / **EMPTOKQA-MSJ290VB** | must_keep RETAIN |
| **J-HRM-CORE-02B-01..04** / `CORE02BQC1-MSLEFQC1` | must_keep · **DENY** wipe EMP-CF |
| **J-HRM-CORE-09D-01..04** / `CORE09DQC1-MSLDR8I3` | must_keep · **≠** printable / closed-8 DONE |
| **J-HRM-CORE-09C-01..04** / `CORE09CQC1-MSLBXMUT` | must_keep · VER/PDF **≠** printable |
| **J-HRM-CORE-09B-01..04** / `CORE09BQC1-MSLB05DZ` | must_keep · PREV ephemeral |
| **J-HRM-CORE-09A-01..04** / `CORE09AQC1-MSLA4LX9` | must_keep |
| **J-HRM-CORE-08-01..04** / `CORE08QC1-MSL9BFFE` | must_keep |
| **J-HRM-CORE-02-01..04** / `CORE02QC1-MSL80DU6` | must_keep · AuthZ/CB-403 |
| **J-HRM-CORE-01-01..04** / `CORE01QC1-MSL6WMS7` | must_keep · public strip |

---

## 6. Honesty & must_keep

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false** · **DENY** flip |
| `hrm_personnel_uat_ready` | **false** · **DENY** flip |
| Claim soft Profile Thu hồi alone = CORE-06 / FR-06 DONE | **DENIED** (O4) |
| Claim CORE-05 = personnel UAT / FR DONE | **DENIED** |
| Claim CORE-07 activate DONE | **DENIED** |
| Claim PAY-07 settle engine DONE | **DENIED** |
| Claim printable / closed-8 DONE | **DENIED** |
| Nest `/core` dual · full Asset accounting · wipe CORE-05/03/02b | **DENIED** |
| C-SLICE | GWC later ≠ module CORE/personnel/CTR UAT ≠ Phase1 |
| `R-CORE-05-HONESTY` | **INFO idle-ok RETAIN** · ≠ invent CORE-06/07 from Wave-19 alone |
| must_keep W19 | CORE-05 AST/BB/serial/DELETE-FORBIDDEN · `CORE05QC1-MSLGVT40` |
| must_keep W18..W10 | CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d TPL+clause · 09c VER/PDF · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 stamps |
| DENY | honesty flip · seed · apps/** · reopen sealed J-HRM-CORE-05-01..05 / 03 / 02B / 09D/09C/09B/09A/08/02/01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **HOLD** (no REQUIRED schema invent: soft-return RETAIN · TERM prefer checklist-from-assigned · CLOSED prefer aggregate · EXCEPTION stub OUT structured) · then **sa API** residual wire unlock F-CORE-AST-02 RETAIN cite + closed display-ready + TERM UI entry |
| **ba-data** | **HOLD** (default) — reopen **REQUIRED** only if soft TERM case cols chosen over checklist-from-assigned / aggregate |
| **sa API-01** | After HOLD stamp — RETAIN cite F-CORE-AST-02 physical PATCH · residual TERM checklist surface + closed aggregate DTO · paper `/core` alias only |
| **Dev** | **HOLD** until API CONFIRMED · **DENY** Nest `/core` dual · **DENY** wipe CORE-05/03/02b · **DENY** full Asset invent · **DENY** invent CORE-07/PAY · **DENY** claim soft-return alone = CORE-06 DONE |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-BA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-06
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-BA-01.md · SA Option A · R-CORE-06-TERM-CHK-01 IN-SCOPE (prefer checklist-from-assigned · Nest terminations ABSENT · HOLD invent hrm_termination primary) · R-CORE-06-CLOSED-01 IN-SCOPE (prefer aggregate closed · HOLD invent asset_checklist_closed col) · R-CORE-06-EXCEPTION-01 stub RETAIN / structured OUT · CORE05QC1-MSLGVT40 · CORE05QA2-MSLGSWSF · R-CORE-05-HONESTY INFO idle-ok · CORE03QC1-MSLFJH0K · CORE02BQC1-MSLEFQC1 · peer CORE09DQC1-MSLDR8I3..CORE01QC1-MSL6WMS7 · EMPPLATQA-MSIZXHIM · EMPTOKQA-MSJ290VB must_keep
spec_ref: F-CORE-AST-02 physical prefer PATCH /employees/:id/assets* · LIVE public.employee_assets RETAIN CORE-05 · paper hrm_termination / asset_checklist_closed HOLD invent · ADR Q-ASSET-MODULE · Nest /core DENY · soft Profile ≠ CORE-06 DONE · CORE-07 / PAY-07 OUT invent DONE

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — no invent/change on LIVE employee_assets soft-return spine (status · return_date · BB · serial · DELETE-FORBIDDEN must_keep CORE-05)
2) CONFIRM HOLD invent full hrm_termination / Nest TERM dual — BA prefer checklist UI entry loading assigned; reopen REQUIRED only if soft TERM case cols chosen later
3) CONFIRM HOLD invent asset_checklist_closed / pay_termination_settlement ack cols — BA prefer aggregate closed = 0 mandatory assigned
4) CONFIRM HOLD/OUT invent structured bồi thường cols — lost+notes stub OK
5) Cite display-ready checklist DTO: asset rows + statusLabelVi + return_date + asset_checklist_closed (derived) + optional termination_context_id
6) RETAIN CORE-05 AST/BB/serial/DELETE-FORBIDDEN · CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d TPL+clause · CORE-09c VER/PDF ≠ printable · CORE-09b PREV ephemeral · CORE-09a CL · CORE-08 · CORE-02 · CORE-01 · Nest /core DENY · R-CORE-05-HONESTY INFO idle-ok
7) DENY wipe CORE-05/03/02b · invent CORE-07/PAY DONE · claim soft-return alone = CORE-06 DONE · claim CORE-05 = personnel UAT · claim printable/closed-8 DONE · honesty flip · reopen J-HRM-CORE-05-01..05 / 03 / 02B / 09D/09C/09B/09A/08/02/01 · seed · apps/**
8) Unlock next: sa API-01 RETAIN cite F-CORE-AST-02 physical PATCH + residual TERM checklist surface + closed aggregate display-ready — paper /core alias only — CORE-07 remain QUEUED

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API residual (wire-only prefer)
```

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-CORE-06 against SA Option A: physical prefer **PATCH** `/employees/:id/assets*` · same `employee_assets` CORE-05 SoT · status map assigned/returned/lost · **soft Profile Thu hồi ≠ CORE-06 DONE** · **R-CORE-06-TERM-CHK-01 IN-SCOPE** (prefer checklist-from-assigned · Nest TERM ABSENT · **HOLD invent** `hrm_termination` primary) · **R-CORE-06-CLOSED-01 IN-SCOPE** (prefer **aggregate** closed · **HOLD invent** flag col) · **R-CORE-06-EXCEPTION-01** stub RETAIN / structured **OUT** · partial thu hồi ALLOW · CORE-07 / PAY-07 **OUT invent DONE** · honesty false · display-ready O11 · mint **J-HRM-CORE-06-01..05 DRAFT** · Diễn biến/Luồng FR-06 + BR-BP-AST-02 mapped to **AC-CORE-06-*** · Nest `/core` **DENIED** · full Asset **DENIED** · must_keep CORE-05 (`CORE05QC1-MSLGVT40` · `R-CORE-05-HONESTY` idle-ok · **≠** CORE-05 DONE) · CORE-03 · CORE-02b · CORE-09d..01 · **ba-data HOLD** · DENY wipe CORE-05/03/02b · claim soft=FR-06 DONE · claim CORE-05=personnel · invent CORE-07/PAY/printable/closed-8 · reopen sealed J-* · seed · apps/** · C-SLICE. |
| **next_owner** | **ba-data** (HOLD stamp → then sa API wire residual) |
| **ack_status** | **PASS_TO_PM** |
| **residual** | DATA-01 HOLD · API F-CORE-AST-02 RETAIN + TERM UI + closed aggregate · J-06-01/03 DRAFT until live · CORE-07 peer QUEUED · PAY-07 peer OUT · personnel/printable flags HOLD · `R-CORE-05-HONESTY` INFO idle-ok |
