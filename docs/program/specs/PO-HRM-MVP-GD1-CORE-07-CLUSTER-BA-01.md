# BA AC pack — Wave-21 CORE cluster · UC-BP-CORE-07 (Kích hoạt hồ sơ Hoạt động khi checklist đủ · RETAIN status spine + activate gate delta)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-07-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous · Wave-21 seat **#23**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O12 **CONFIRMED** · Dev **HOLD** · **ba-data HOLD** (status spine RETAIN · gate aggregate wire-capable · `activated_at` HOLD invent soft ADD until DATA stamps) · sa API residual unlock after HOLD stamp · **DENY** claim checklist đủ alone = CORE-07 DONE · **DENY** claim free status PATCH = CORE-07 DONE · **DENY** claim CORE-06 soft = DONE |
| **change_mode** | **ADD** (align SA-01 gap-only RETAIN — **no** Nest `/core` dual · **no** wipe CORE-06 soft≠DONE / return checklist · **no** wipe CORE-05 AST/BB/serial/DELETE-FORBIDDEN · **no** wipe CORE-03 DOC/ET/CHK · **no** wipe CORE-02b EMP-CF · **no** invent PAY DONE · **no** invent CORE-09 DONE · **no** invent ATT-12 enroll DONE · **no** claim checklist đủ = CORE-07 DONE · **no** claim free PATCH = CORE-07 DONE · **no** claim CORE-06 DONE · **no** reopen CORE-06/05/03/02b/09d..01) |
| **uc_ids** | `UC-BP-CORE-07` |
| **depends_on** | `PO-HRM-MVP-GD1-CORE-07-CLUSTER-SA-01` **Option A LOCKED** · peer QC **`CORE06QC1-MSLID363`** · QA **`CORE06QA2-MSLI95K8`** · BE **`CORE06BE2-MSLI26NR`** · **`CORE05QC1-MSLGVT40`** / **`CORE03QC1-MSLFJH0K`** / **`CORE02BQC1-MSLEFQC1`** / **`CORE09DQC1-MSLDR8I3`** / `CORE09CQC1-MSLBXMUT` / `CORE09BQC1-MSLB05DZ` / `CORE09AQC1-MSLA4LX9` / `CORE08QC1-MSL9BFFE` / `CORE02QC1-MSL80DU6` / `CORE01QC1-MSL6WMS7` · EMP DOC/ET **`EMPPLATQA-MSIZXHIM`** · TOK **`EMPTOKQA-MSJ290VB`** · **`R-CORE-06-HONESTY` INFO idle-ok RETAIN** · soft≠CORE-06 DONE **RETAIN** |
| **ref_sa** | `PO-HRM-MVP-GD1-CORE-07-CLUSTER-SA-01.md` |
| **ref_ba_style** | `PO-HRM-MVP-GD1-CORE-06-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-CORE-05-CLUSTER-BA-01.md` · `PO-HRM-MVP-GD1-CORE-03-CLUSTER-BA-01.md` |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-07** · Luồng chính **#1–#4** · Diễn biến **#1–#2 + Thành công** · **BR-BP-LC-02** (matrix/`UC_BR_MATRIX_DEPTH` — **BA cite LC-02 for activate**; FR header still lists BR-BP-LC-01 = hire REC-07 — **not** rewrite SRS this seat) · phụ thuộc **CORE-03** checklist · peers CORE-06..01 **must_keep** · ATT-12 = peer consumer tín hiệu (**≠** invent ATT DONE) · CORE-09/10 / PAY **OUT invent DONE** |
| **ref_api_paper** | **F-CORE-ACT-01** (paper `POST /api/hrm/core/employees/{id}/activate` · physical prefer **`POST /api/hrm/employees/:id/activate`** **or** gated **`PATCH /api/hrm/employees/:id`**) · must_keep **F-CORE-CHK-01** · F-EMP-CAT-DOC/ET/EFF · F-EMP-TOK · F-CORE-AST-01/02 + BB · F-EMP-CF · CTR TPL/VER/PDF/PACK/PREV/CL · CORE-08/02/01 · peer ATT enroll via `employee.activated` (**OUT invent ATT DONE**) |
| **ref_db** | LIVE `public.employees` (open status catalog · hire default `pending_docs`) · LIVE `public.hrm_document_checklist_item` (CORE-03) · LIVE `emp_document_type.blocks_activation` / `required_by_default` · paper `activated_at` · Nest `@Controller('core')` **ABSENT** · **DENY** invent Nest `/core` dual |
| **ref_adr** | ADR 4-pillar · Nest physical prefer · paper `/core` alias only · U19 scope parity list↔get↔activate |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · personnel / CORE / CTR module UAT **false** · **`C-SLICE-≠-MODULE`** · **`R-CORE-06-HONESTY` INFO idle-ok** · **DENY** claim CORE-06 = personnel UAT / FR DONE · **DENY** claim soft Profile = CORE-06 DONE · **DENY** claim checklist đủ alone = CORE-07 DONE · **DENY** claim free status PATCH = CORE-07 DONE · **DENY** invent PAY / CORE-09 DONE · **DENY** claim printable / closed-8 DONE |
| **Cấm** | Nest `/core` dual · wipe CORE-06 soft≠DONE · wipe CORE-05 AST/BB · wipe CORE-03 DOC/ET/CHK · wipe CORE-02b EMP-CF · invent PAY/CORE-09/ATT-12 DONE · claim checklist=CORE-07 DONE · claim free PATCH=CORE-07 DONE · claim CORE-06 DONE · honesty flip · seed · apps/** · reopen sealed J-HRM-CORE-06-01..05 / 05 / 03 / 02B / 09D/09C/09B/09A/08/02/01 |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U63/U65)** cho Wave-21 seat #23 — **gap-only RETAIN** LIVE employees status spine + disposition residual activate gate:

1. **Employee SoT** = LIVE `public.employees` trên **`/api/hrm/employees*`** — **RETAIN** · PENDING=`pending_docs` · ENABLED/Hoạt động=`active`.
2. **Checklist gate input** = CORE-03 **F-CORE-CHK-01** + DOC flags `required_by_default` / `blocks_activation` — **RETAIN must_keep** · **≠ CORE-07 DONE** alone.
3. **Activate transition** = residual **`R-CORE-07-ACT-01`** + **`R-CORE-07-GATE-01`** — physical prefer **`POST …/employees/:id/activate`** **or** gated **`PATCH …/employees/:id`** (`status=active` + effective_date) — paper **`/core/…/activate`** = **alias only**.
4. **Free status PATCH** without gate = **≠ CORE-07 DONE** (**AC-CORE-07-≠-PATCH-DONE**).
5. **Effective date** = residual **`R-CORE-07-EFF-01`** — `dd/MM/yyyy` · paper `activated_at` · ba-data HOLD invent soft ADD.
6. **ATT-12 tín hiệu** = residual **`R-CORE-07-ATT-12`** — emit `employee.activated` readable · **DENY** invent ATT enroll / quỹ/ca engine DONE.
7. **Mint** `J-HRM-CORE-07-01..05` DRAFT · **DENY** reopen sealed CORE-06/05/03/02b/09d..01 · **DENY** invent PAY/CORE-09 DONE · soft≠CORE-06 DONE **RETAIN**.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| HCNS | Rà soát checklist bắt buộc → bấm kích hoạt + ngày hiệu lực → xác nhận Hoạt động |
| Hệ thống | Gate BR-BP-LC-02 · set `active` · persist effective date · emit ATT tín hiệu · U19 scope |
| ATT (peer) | Đọc `employee.activated` để mở quỹ/ca (**OUT invent engine** this seat) |
| Group CEO | Scope rollup `main` — U19 employees list = get = activate |
| Member CEO / HRBP | Chỉ pháp nhân membership · cùng profile scope resolver |
| PAY / CORE-09 | Peers **OUT invent DONE** |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O12 CONFIRM · map FR-07 Luồng #1–#4 + Diễn biến #1–#2 → AC-CORE-07-* · residual GATE/ACT/EFF/ATT disposition · J-HRM-CORE-07-* DRAFT | Impl `apps/**` / migration / seed |
| Physical prefer POST activate **or** gated PATCH · paper `/core` alias | Nest `/core/…/activate` SoT dual |
| Explicit checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE | Claim checklist CRUD / free PATCH / soft Profile = FR DONE |
| Honesty footer · C-SLICE · PAY/CORE-09/ATT OUT invent DONE | Flip ready flags · invent PAY/CORE-09/ATT DONE · reopen J-CORE-06..01 |
| must_keep CORE-06 soft≠DONE · CORE-05 AST/BB · CORE-03 DOC/ET/CHK · CORE-02b · CORE-09d..01 | Claim CORE-06 DONE · personnel/printable/closed-8 |

### SA Option A — BA CONFIRM (đóng O1–O12)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Physical path | **YES** — Activate Network **chỉ** physical **`POST /api/hrm/employees/:id/activate`** **or** gated **`PATCH /api/hrm/employees/:id`** (`status=active` + effective_date / `activated_at`) on **same** employees controller · paper `/api/hrm/core/employees/{id}/activate` = **alias / DOC-DELTA only** — **FAIL** nếu Nest `@Controller('core')` second ACT SoT — **AC-CORE-07-01** |
| **O2** | Status map | **YES** — PENDING = `pending_docs` (VI «Chờ hoàn thiện») · ENABLED / Hoạt động = `active` (VI «Hoạt động») — **DENY** invent closed PENDING\|ENABLED enum as primary · open employment-status catalog **RETAIN** — **AC-CORE-07-02** |
| **O3** | Checklist gate | **YES IN-SCOPE residual `R-CORE-07-GATE-01`** — activate **PASS** only when every **required** checklist item is `approved` **and** no open item with DOC `blocks_activation=true` remains non-approved · else **409** mint class (prefer `HRM-EMP-ACT-CHECKLIST-INCOMPLETE`) · **DENY** silent allow — gap **PROVEN** (AS-IS `assertEmployeeStatusPayload` = catalog only, **no** checklist gate) · gate SoT = LIVE CORE-03 checklist + DOC flags (**wire-capable** · **no** invent Nest dual) — **AC-CORE-07-03/04** |
| **O4** | Checklist ≠ DONE | **YES** — Checklist CRUD / «đủ» badge alone = **RETAIN path** for Diễn biến #1 check — **≠ CORE-07 DONE** without gated status transition + effective_date + ATT tín hiệu + U65 journeys — footer every evidence — **AC-CORE-07-≠-CHK-DONE** |
| **O5** | Free PATCH ≠ DONE | **YES** — Unrestricted `PATCH` `status=active` without gate = **FAIL** FR-07 once gate IN-SCOPE · until gate live, **≠** claim current free PATCH = CORE-07 DONE — **AC-CORE-07-≠-PATCH-DONE** |
| **O6** | Effective date | **YES IN-SCOPE residual `R-CORE-07-EFF-01`** — input **ngày hiệu lực** `dd/MM/yyyy` (FR-07) · paper `activated_at` · LIVE typed col **ABSENT / unconfirmed** (INSERT employees không có `activated_at`) = **gap PROVEN** · **ba-data HOLD invent** soft ADD `activated_at` (prefer typed col on `public.employees`) · reopen **REQUIRED** only if DATA stamps ADD over wire-body-only · **≠** invent PAY/ATT DONE — **AC-CORE-07-05** |
| **O7** | ATT-12 tín hiệu | **YES IN-SCOPE residual `R-CORE-07-ATT-12`** — on successful activate emit readable **`employee.activated`** (employee_id · company_id · effective_date) — ATT enroll / quỹ/ca engine = peer **OUT invent DONE** — **AC-CORE-07-06** · **AC-CORE-07-ATT-OUT** |
| **O8** | Override thiếu giấy | **YES OUT GĐ1** — default **deny** without override (SA prefer) · matrix override+lý do = **OUT invent** this seat (reopen later CR) · GĐ1 = hard gate only — **AC-CORE-07-OV-OUT** |
| **O9** | C&B tối thiểu | **YES HOLD / OUT invent C&B DONE** — FR tiên quyết «C&B tối thiểu theo cấu hình» = **soft cite** CORE-02 ring when config on · **HOLD** hard C&B gate invent this seat · **DENY** claim CORE-02 = C&B DONE / invent PAY — **AC-CORE-07-CB-HOLD** |
| **O10** | Honesty / peers OUT | **YES false** — all ready flags false · C-SLICE · **DENY** flip personnel/printable/recruitment/jd · **DENY** claim CORE-06 = personnel UAT / FR DONE · **DENY** claim soft Profile = CORE-06 DONE · **DENY** claim checklist đủ = CORE-07 DONE · **DENY** invent PAY DONE · **DENY** invent CORE-09 DONE · **DENY** claim printable/closed-8 · **must_keep** CORE-06..01 · Nest DENY · **`R-CORE-06-HONESTY` INFO idle-ok** — **AC-CORE-07-H** |
| **O11** | Display-ready | **YES** — Activate / profile DTO: **`status` + `statusLabelVi`** · **`checklist_complete`** (boolean) · **`blocking_items[]`** (documentTypeKey · nameVi · status) · **`activated_at` / effective_date** · **`can_activate`** — FE bind · **cấm** FE invent PAY/ATT SoT |
| **O12** | Journeys | **YES** — Mint **`J-HRM-CORE-07-01..05` DRAFT** (pending_docs → checklist đủ → kích hoạt → active F5 → thiếu bắt buộc 409 → Nest `/core` 0 · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE · seals) · **DENY** reopen sealed J-HRM-CORE-06-01..05 / 05 / 03 / 02B / 09D/09C/09B/09A/08/02/01 |

**Architecture SoT:** ONE LIVE employees status spine · paper `/core` activate = alias only · checklist CRUD ≠ FR-07 DONE · free PATCH ≠ FR-07 DONE · soft≠CORE-06 DONE RETAIN · U19 list↔get↔activate · CORE-06..01 **must_keep**.

### Primary API surface (BA lock — O1)

| Intent | Physical (normative) | Paper alias |
|--------|----------------------|-------------|
| Activate Hoạt động | Prefer **`POST /api/hrm/employees/:id/activate`** **or** gated **`PATCH /api/hrm/employees/:id`** (`status=active` + effective_date) | `/core/employees/{id}/activate` alias only |
| Gate input checklist | **`GET/PATCH /api/hrm/employees/:id/document-checklist*`** (CORE-03 must_keep) | `/core/…` alias |
| DOC flags | **`/employees/document-types*`** `required_by_default` · `blocks_activation` | alias |
| Status spine storage | **`GET/PATCH /api/hrm/employees/:id`** (open catalog) — gate when ACT residual live | alias |
| ATT enroll | Peer **OUT invent DONE** | `employee.activated` consumer |
| PAY / CORE-09 | Peers **OUT invent DONE** | — |
| CORE-06 soft-return | **must_keep** assets* soft≠DONE | alias |
| CORE-05 AST/BB | **must_keep** assets* + confirm | alias |
| CORE-03 CHK/DOC/ET | **must_keep** | alias |
| CORE-02b EMP-CF | **must_keep** | alias |
| CORE-09d..09a / 08 / 02 / 01 | **must_keep** | alias — 09c **≠** printable UAT |

**Invariant CORE-07-PATH:** Activate Network **MUST** hit `/employees/:id` (activate **or** gated PATCH) · Nest dual `/core` ACT SoT = **FAIL O1**.

**Invariant CORE-07-≠-CHK-DONE:** Claim checklist đủ / CRUD alone = FR-UC-BP-CORE-07 / CORE-07 DONE = **FAIL O4**.

**Invariant CORE-07-≠-PATCH-DONE:** Claim unrestricted status PATCH = CORE-07 DONE = **FAIL O5**.

**Invariant CORE-07-≠-06-DONE:** Claim CORE-06 soft-return / soft Profile = CORE-06 DONE / personnel UAT = **FAIL O10**.

**Invariant CORE-07-≠-PAY-09-ATT-DONE:** Invent PAY / CORE-09 / ATT-12 enroll DONE this seat = **FAIL O7/O10**.

**Invariant CORE-07-≠-PRINTABLE:** Claim printable / closed-8 DONE = **FAIL O10**.

**Wire codes (RETAIN + residual mint):** `HRM-EMP-PROFILE-200/201/202` · residual **`HRM-EMP-ACT-CHECKLIST-INCOMPLETE`** (409) · optional `HRM-EMP-ACT-EFF-DATE-INVALID` · `HRM-SCOPE-409` · sealed CORE-* · **DENY** 2xx silent allow when gate incomplete.

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-21 · Option A) |
|---|----------------------|---------------------------|
| Hire → PENDING | REC-07 → `pending_docs` | **RETAIN must_keep** |
| Checklist instance | `/employees/:id/document-checklist*` · missing\|submitted\|approved | **RETAIN must_keep** CORE-03 |
| DOC required / blocks | Typed cols LIVE | **RETAIN must_keep** |
| Status PATCH | Catalog assert only · **no** checklist gate | **RETAIN path** · **≠** FR-07 DONE alone (**O5**) |
| Activate dedicated | **ABSENT** POST activate · Nest `/core` ABSENT | Residual unlock (**O1/O3**) |
| Effective date / `activated_at` | **ABSENT** typed col | Residual unlock (**O6**) · ba-data HOLD |
| ATT-12 enroll | Peer | Emit tín hiệu only (**O7**) · OUT invent engine |
| Override thiếu giấy | ABSENT | **OUT GĐ1** deny-only (**O8**) |
| Soft-return CORE-06 | SEALED · soft≠DONE | **must_keep RETAIN** · **≠** reopen · **≠** claim DONE |
| Assets CORE-05 | SEALED | **must_keep RETAIN** |
| PAY / CORE-09 | Peers | **OUT invent DONE** |
| Honesty | C-SLICE · personnel/printable false · `R-CORE-06-HONESTY` idle-ok | **false** (**O10**) |

### 1.1 Disposition **R-CORE-07-GATE-01**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-07-GATE-01` |
| **Scope** | **IN-SCOPE residual** for UC-BP-CORE-07 Diễn biến **#1** + Luồng **#1** + **BR-BP-LC-02** «Không Enabled khi checklist bắt buộc chưa xong» |
| **OUT of residual** | Checklist CRUD itself (already **RETAIN LIVE** CORE-03) · Nest `/core` ACT dual · invent override engine (**O8 OUT**) · invent PAY/ATT DONE |
| **Rationale IN-SCOPE** | FR-07 «Thiếu giấy tờ bắt buộc → chặn» · BR-BP-LC-02 · F-CORE-ACT-01 verify required docs · SA O3; LIVE status PATCH **ignores** checklist |
| **Physical gap vs paper** | **PROVEN ABSENT** gate assert on status transition — gate SoT = LIVE `hrm_document_checklist_item` + `emp_document_type` flags (**wire-capable**) |
| **ba-data** | **HOLD** — **no REQUIRED** invent completeness table · prefer aggregate from checklist + DOC flags |
| **sa API** | After BA/DATA HOLD: residual surface unlock — assert before activate/gated PATCH · 409 incomplete · paper `/core` alias only |
| **DENY** | Claim checklist CRUD = GATE residual CLOSED · silent allow · Nest `/core` dual · seed checklist densify |

### 1.2 Disposition **R-CORE-07-ACT-01**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-07-ACT-01` |
| **Scope** | **IN-SCOPE residual** for Diễn biến **#2** «Kích hoạt» · Luồng **#2–#3** · F-CORE-ACT-01 physical path |
| **OUT of residual** | Nest `/core` ACT SoT invent · claim free PATCH alone = ACT DONE |
| **Rationale IN-SCOPE** | Paper POST activate · FR CTA «Kích hoạt Hoạt động» · SA O1; LIVE dedicated activate **ABSENT** |
| **Physical gap vs paper** | **PROVEN ABSENT** thin activate route — prefer ADD thin POST **or** gate existing PATCH on same controller |
| **ba-data** | **HOLD** (no new employee SoT table) |
| **sa API** | Unlock F.1 physical prefer POST activate / gated PATCH · paper alias |
| **DENY** | Nest `/core` dual · claim free PATCH = FR-07 DONE |

### 1.3 Disposition **R-CORE-07-EFF-01**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-07-EFF-01` |
| **Scope** | **IN-SCOPE residual** for FR-07 input «Ngày hiệu lực Hoạt động» `dd/MM/yyyy` · paper `activated_at` |
| **OUT of residual** | PAY period invent · ATT quỹ calc DONE |
| **Rationale IN-SCOPE** | FR Dữ liệu đầu vào bắt buộc · F-CORE-ACT-01 Request→DB `activated_at` · SA O6; LIVE employees INSERT **no** `activated_at` |
| **Physical gap vs paper** | Typed `activated_at` **ABSENT / unconfirmed** = **gap PROVEN** |
| **ba-data** | **HOLD invent** soft ADD `activated_at timestamptz` on `public.employees` (prefer typed) · reopen **REQUIRED** if DATA stamps ADD · until then API may accept effective_date body (persist when col live) |
| **sa API** | Wire effective_date on activate · display-ready `activated_at` · locale `dd/MM/yyyy` |
| **DENY** | Claim free PATCH without date = EFF residual DONE · invent PAY DONE |

### 1.4 Disposition **R-CORE-07-ATT-12**

| Field | BA ruling |
|-------|-----------|
| **ID** | `R-CORE-07-ATT-12` |
| **Scope** | **IN-SCOPE residual emit** — `employee.activated` tín hiệu · **OUT invent** ATT enroll / quỹ/ca engine DONE |
| **Rationale** | FR-07 Luồng #3 · Hậu điều kiện ATT-12 · API events table · SA O7 |
| **ba-data** | **HOLD / OUT invent** ATT tables this seat |
| **sa API** | Emit readable event / outbox signal on activate success · **DENY** invent ATT engine |
| **DENY** | Claim CORE-07 = ATT-12 module DONE |

### 1.5 ba-data disposition summary

| Slice | Decision | Rule |
|-------|----------|------|
| Employees status spine / open catalog | **HOLD** | LIVE RETAIN — **no** greenfield wipe |
| Checklist / DOC flags CORE-03 | **HOLD · must_keep** | CORE-03 sealed — **DENY wipe** |
| Completeness gate aggregate | **HOLD invent** | Prefer derive from checklist + flags · wire-capable |
| Soft ADD `activated_at` | **HOLD invent** (gap PROVEN ABSENT) | Reopen **REQUIRED** only if DATA stamps typed ADD |
| Nest `/core` | **DENY** | alias only |
| CORE-06 / 05 / 03 / EMP-CF / 09d..01 | **DENY wipe** | must_keep · soft≠CORE-06 DONE |
| PAY / CORE-09 / ATT enroll tables | **OUT invent DONE** | peers |

**Unlock next:** **ba-data HOLD** stamp → **sa API** residual (wire-only prefer) — RETAIN cite F-CORE-ACT-01 physical activate/gated PATCH + gate assert + effective_date + ATT emit.

---

## 2. Business rules (normative — SRS + SA + matrix; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-LC-02** | Activate / ENABLED | Không ENABLED khi checklist bắt buộc chưa xong | 409 incomplete · GĐ1 **no** override |
| **BR-CORE-07-PATH** | API activate | Physical `/employees/:id` activate\|gated PATCH | Nest `/core` dual = **FAIL O1** |
| **BR-CORE-07-STATUS** | PENDING→ENABLED | `pending_docs`→`active` | Open catalog RETAIN |
| **BR-CORE-07-GATE** | required items not all `approved` **or** blocks_activation open | Deny activate | 409 mint class |
| **BR-CORE-07-CHK≠DONE** | Checklist CRUD alone | ≠ FR-07 DONE | Claim DONE = **FAIL O4** |
| **BR-CORE-07-PATCH≠DONE** | Free status PATCH alone | ≠ FR-07 DONE | Claim DONE = **FAIL O5** |
| **BR-CORE-07-EFF** | Activate | Require effective_date `dd/MM/yyyy` | Invalid → 4xx |
| **BR-CORE-07-ATT** | Activate success | Emit `employee.activated` | ATT OUT invent engine |
| **BR-CORE-07-NO-SEED** | Nghiệm thu | FE only | Seed = **FAIL U65** |
| **BR-CORE-07-≠-06-DONE** | CORE-06 seal | soft≠DONE · ≠ personnel UAT | Claim = **FAIL O10** |
| **BR-CORE-07-PAY-09-OUT** | PAY / CORE-09 | Peers | Invent DONE = **FAIL O10** |
| **BR-CORE-07-OV-OUT** | Override thiếu giấy | OUT GĐ1 | Hard deny only |

### Error taxonomy (RETAIN + residual)

| Code | HTTP | UX intent (VI) | ≠ |
|------|------|----------------|--|
| Residual `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` | 409 | Thiếu giấy tờ bắt buộc — chưa kích hoạt được | Silent 2xx |
| Residual EFF invalid | 4xx | Ngày hiệu lực không hợp lệ | Epoch junk |
| `HRM-SCOPE-409` | 409 | Ngoài phạm vi pháp nhân | Soft OK |
| `HRM-EMP-PROFILE-200/202` | 2xx | Status update (non-activate / gated path) | Claim FR-07 DONE alone |
| Sealed CORE-* | — | **DENY** rewrite · must_keep regression | — |

---

## 3. Diễn biến FR-UC-BP-CORE-07 + BR-BP-LC-02 → AC / VAL map (normative)

### 3.0 Map overview

| SRS source | Tương tác | AC cite | J-* | LIVE Network (cite) |
|------------|-----------|---------|-----|---------------------|
| **Luồng #1** · Diễn biến #1 | Kiểm tra đủ · nút kích hoạt mở khi checklist OK | **AC-CORE-07-03/04** · **≠-CHK-DONE** | **J-HRM-CORE-07-01** | `GET …/document-checklist*` · DOC flags · Nest `/core` **0** |
| **Luồng #2** · Diễn biến #2 | Kích hoạt + ngày hiệu lực | **AC-CORE-07-01/02/05** | **J-HRM-CORE-07-02** | **POST …/activate** **or** gated **PATCH** `status=active` + date **2xx** · F5 `active` |
| **Luồng #3** | Đổi trạng thái + tín hiệu ATT-12 | **AC-CORE-07-06** · **ATT-OUT** | **J-02/03** | Emit `employee.activated` · **≠** invent ATT engine |
| **Luồng #4** | Chặn chấm/lương nếu còn chờ (cấu hình) | **AC-CORE-07-CB-HOLD** · peers | spot | Soft cite · PAY/ATT **OUT invent DONE** |
| **Quy tắc** thiếu giấy | Chặn kích hoạt | **AC-CORE-07-04** | **J-HRM-CORE-07-03** | 409 incomplete · F5 vẫn `pending_docs` |
| Free PATCH alone | Footer | **AC-CORE-07-≠-PATCH-DONE** | **J-04** | Free PATCH ≠ PASS FR-07 |
| Honesty / seals | Footer | **AC-CORE-07-H** · **MK-*** | **J-HRM-CORE-07-05** | Nest `/core` **0** · soft≠CORE-06 DONE · CORE-06..01 seals |

### 3.1 AC-CORE-07 (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-CORE-07-01** | NV `pending_docs` trong scope · checklist đủ · ngày hiệu lực hợp lệ | Bấm kích hoạt Hoạt động | Network **POST** `/api/hrm/employees/:id/activate` **or** gated **PATCH** `/api/hrm/employees/:id` **2xx** với `status=active` + effective_date → FE «Hoạt động» · **F5 còn** · Nest `/core` **0** · **no** Nest dual | U65 · O1/O2 · Luồng #2 · **R-CORE-07-ACT-01** |
| **AC-CORE-07-02** | After activate | Đọc hồ sơ / list | `status=active` · label VI **«Hoạt động»** · prior `pending_docs` cleared · display-ready O11 | O2 · BR-BP-LC-02 |
| **AC-CORE-07-03** | Có checklist bắt buộc | Mở CTA kích hoạt | `can_activate=true` **chỉ khi** required items `approved` **and** blocks_activation clear · else CTA disabled / explain + `blocking_items[]` | O3 · Diễn biến #1 · **R-CORE-07-GATE-01** |
| **AC-CORE-07-04** | Còn ≥1 required non-approved **or** blocks_activation open | Gọi activate / gated PATCH active | **409** `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` (or sealed mint) · status **không** đổi · F5 vẫn `pending_docs` · Nest `/core` 0 | O3 · BR-BP-LC-02 · FR quy tắc |
| **AC-CORE-07-≠-CHK-DONE** | User chỉ hoàn tất checklist CRUD / badge «đủ» (no gated activate) | Claim FR-07 / CORE-07 DONE | **FAIL** — checklist = gate input only | O4 · L-CORE-07-03 |
| **AC-CORE-07-≠-PATCH-DONE** | User free PATCH `status=active` without gate (AS-IS or bypass) | Claim FR-07 / CORE-07 DONE | **FAIL** — free PATCH ≠ activation DONE | O5 · L-CORE-07-04 |
| **AC-CORE-07-05** | Activate form | Submit không ngày / ngày invalid | **4xx** · no status flip · locale `dd/MM/yyyy` · null → `—` (no epoch) · on success persist `activated_at` when col live | O6 · **R-CORE-07-EFF-01** · UX vi-VN |
| **AC-CORE-07-06** | Activate 2xx | Side-effect | Readable **`employee.activated`** (employee_id · company_id · effective_date) emitted / observable — **≠** invent ATT enroll DONE | O7 · Luồng #3 · **R-CORE-07-ATT-12** |
| **AC-CORE-07-ATT-OUT** | ATT quỹ/ca engine | Claim ATT-12 DONE | **OUT invent** — CORE emits only | O7 |
| **AC-CORE-07-OV-OUT** | Override thiếu giấy + lý do | GĐ1 product | **OUT invent** — hard deny only | O8 |
| **AC-CORE-07-CB-HOLD** | C&B tối thiểu theo cấu hình | Soft cite CORE-02 | **HOLD** hard gate invent · **≠** invent CORE-02/PAY DONE | O9 |
| **AC-CORE-07-MK-06** | Any CORE-07 evidence | Diff CORE-06 soft-return / TERM/CLOSED | soft≠DONE · assigned/closed FE-derive · Nest `/core` 0 **intact** · **no** reopen J-HRM-CORE-06-01..05 · `R-CORE-06-HONESTY` INFO idle-ok · **≠** claim CORE-06 DONE / soft=DONE / personnel UAT | O10 · `CORE06QC1-MSLID363` |
| **AC-CORE-07-MK-05** | Any CORE-07 evidence | Diff CORE-05 AST/BB/serial/DELETE-FORBIDDEN | Physical assets* + BB + serial 409 + DELETE-FORBIDDEN **intact** · **no** reopen J-HRM-CORE-05 · **≠** CORE-05 DONE / personnel | O10 · `CORE05QC1-MSLGVT40` |
| **AC-CORE-07-MK-03** | Any CORE-07 evidence | Diff CORE-03 DOC/ET/CHK | Physical checklist + DOC/ET + TOK **intact** · **no** reopen J-HRM-CORE-03 · **≠** claim CHK = CORE-07 DONE | O3/O4/O10 · `CORE03QC1-MSLFJH0K` |
| **AC-CORE-07-MK-02B** | Any CORE-07 evidence | Diff EMP-CF | Four catalogs + KEY + soft-draft + EXT **intact** · **no** reopen J-HRM-CORE-02B | O10 · `CORE02BQC1-MSLEFQC1` |
| **AC-CORE-07-MK-09D..01** | Any CORE-07 evidence | Diff CTR/RD/C&B/public | TPL+clause · VER/PDF ≠ printable · PREV ephemeral · CL · RD · AuthZ/CB · public **intact** · **no** reopen sealed J-* · **≠** invent CORE-09 DONE | O10 · peer stamps |
| **AC-CORE-07-H** | Evidence footer | Any seal | personnel/printable/recruitment/jd **false** · C-SLICE · **DENY** checklist=CORE-07 DONE · **DENY** free PATCH=DONE · **DENY** CORE-06 DONE/soft=DONE · **DENY** PAY/CORE-09/ATT/printable/closed-8 DONE · Nest DENY · no reopen J-06/05/03/02B/09D..01 · `R-CORE-06-HONESTY` idle-ok | O10 |

### 3.2 Scope ladder (U19)

| Persona | User sees | Fail |
|---------|-----------|------|
| **Group CEO** (`main`) + HCNS | Activate across rollup membership | Cross-CT mutate without membership |
| **Member CEO / HRBP** | Chỉ pháp nhân membership | Employees list ≠ activate resolver |
| **No HR mutate** | Deny activate | Silent 2xx |

**Invariant CORE-07-SCOPE:** employees list/get/activate **=** same profile scope resolver family (CORE-01 RETAIN).

**Prerequisite:** CORE-06 soft≠DONE seals RETAIN · CORE-05 AST/BB RETAIN · CORE-03 DOC/ET/CHK RETAIN · CORE-02b EMP-CF RETAIN · CORE-09d..01 stamps RETAIN · **không** seed · honesty flags false · **`R-CORE-06-HONESTY` INFO idle-ok**.

---

## 4. Diễn biến FE U65 (browser matrix)

```text
Login (ceo@xe.vn / member HCNS)
  → /hr Nhân sự → hồ sơ NV status=pending_docs (hire handoff)
  → Tab / panel checklist giấy tờ (CORE-03 physical document-checklist*)
  → Rà soát required + blocks_activation → badge đủ / blocking_items
  → (Neg) thiếu bắt buộc → CTA kích hoạt disabled OR activate → 409 → F5 vẫn pending_docs
  → (Pos) đủ → nhập ngày hiệu lực dd/MM/yyyy → Kích hoạt
       → POST …/activate OR gated PATCH status=active 2xx
       → FE «Hoạt động» · F5 còn · activated_at display
  → Assert employee.activated tín hiệu cite (when residual live) · ≠ invent ATT DONE
  → Assert Nest /core activate = 0
  → Footer: checklist đủ alone ≠ CORE-07 DONE
       · free status PATCH alone ≠ CORE-07 DONE
       · soft≠CORE-06 DONE RETAIN · ≠ invent PAY/CORE-09 DONE
       · ≠ printable/closed-8 · honesty false · no reopen seals
```

**cấm:** `pnpm seed:*` · API seed checklist/status · DB fake active · PASS chỉ curl · Nest `/core` dual · wipe CORE-06/05/03/02b · claim checklist=FR-07 DONE · claim free PATCH=FR-07 DONE · claim CORE-06 DONE · claim module DONE · reopen sealed J-*.

### VAL pack (mint)

| VAL-ID | Expect | Maps |
|--------|--------|------|
| **VAL-CORE-ACT-01** | Checklist đủ → CTA can_activate · blocking_items empty | AC-CORE-07-03 · O3 |
| **VAL-CORE-ACT-02** | Activate 2xx + F5 active + date · Nest `/core` 0 | AC-CORE-07-01/02/05 · O1/O2/O6 |
| **VAL-CORE-ACT-03** | Incomplete → 409 · status unchanged F5 | AC-CORE-07-04 · O3 |
| **VAL-CORE-ACT-04** | ATT tín hiệu emit cite · ATT OUT | AC-CORE-07-06/ATT-OUT · O7 |
| **VAL-CORE-ACT-05** | checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE · seals · honesty | AC-CORE-07-≠-CHK/≠-PATCH/H/MK-* · O4/O5/O10 |

---

## 5. Journeys DRAFT (O12)

| J-ID | Title | Click path (draft) | Pass when |
|------|-------|--------------------|-----------|
| **J-HRM-CORE-07-01** | **Checklist đủ → can_activate** | Login → NV `pending_docs` → checklist CORE-03 → required approved · Nest `/core` 0 · no seed · cite checklist≠DONE alone | AC-CORE-07-03 · ≠-CHK-DONE · O3/O4 · U65 · **DRAFT until gate display-ready** |
| **J-HRM-CORE-07-02** | **Kích hoạt → Hoạt động F5** | Đủ + ngày hiệu lực → POST activate **or** gated PATCH 2xx → F5 `active` · Nest `/core` 0 | AC-CORE-07-01/02/05 · O1/O2/O6 · U65 · **DRAFT until ACT residual live** |
| **J-HRM-CORE-07-03** | **Thiếu bắt buộc → 409** | Incomplete checklist → activate → 409 · F5 vẫn `pending_docs` | AC-CORE-07-04 · O3 · U65 · **DRAFT until GATE live** |
| **J-HRM-CORE-07-04** | **Free PATCH ≠ DONE · ATT tín hiệu OUT** | Cite free PATCH path ≠ PASS FR-07 · ATT emit cite · **≠** invent ATT/PAY/CORE-09 DONE | AC-CORE-07-≠-PATCH-DONE/06/ATT-OUT · O5/O7 · U65 |
| **J-HRM-CORE-07-05** | **Seals · honesty · soft≠CORE-06 DONE** | Nest `/core` 0 · CORE-06/05/03/02b/09d..01 smoke · no CORE-06 DONE · no checklist=CORE-07 DONE · no printable/closed-8 · `R-CORE-06-HONESTY` idle-ok | AC-CORE-07-MK-*/H · O10 · U19 |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC C-SLICE only · **≠** auto-flip `hrm_personnel_uat_ready` · **≠** claim checklist = CORE-07 DONE · **≠** claim CORE-06 DONE.

| Sealed peer | Rule |
|-------------|------|
| **J-HRM-CORE-06-01..05** / `CORE06QC1-MSLID363` / `CORE06QA2-MSLI95K8` | must_keep soft≠DONE · TERM/CLOSED FE-derive · Nest `/core` 0 · **≠** CORE-06 DONE · **`R-CORE-06-HONESTY` INFO idle-ok** |
| **J-HRM-CORE-05-01..05** / `CORE05QC1-MSLGVT40` | must_keep AST/BB/serial/DELETE-FORBIDDEN · **≠** CORE-05 DONE / personnel UAT |
| **J-HRM-CORE-03-01..05** / `CORE03QC1-MSLFJH0K` | must_keep DOC/ET/CHK · **≠** claim CHK = CORE-07 DONE · **≠** personnel UAT |
| **EMPPLATQA-MSIZXHIM** / **EMPTOKQA-MSJ290VB** | must_keep RETAIN |
| **J-HRM-CORE-02B-01..04** / `CORE02BQC1-MSLEFQC1` | must_keep · **DENY** wipe EMP-CF |
| **J-HRM-CORE-09D-01..04** / `CORE09DQC1-MSLDR8I3` | must_keep · **≠** printable / closed-8 DONE · **≠** invent CORE-09 DONE |
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
| Claim checklist đủ / CRUD alone = CORE-07 / FR-07 DONE | **DENIED** (O4) |
| Claim free status PATCH alone = CORE-07 DONE | **DENIED** (O5) |
| Claim CORE-06 soft-return / soft Profile = CORE-06 DONE | **DENIED** · soft≠DONE **RETAIN** |
| Claim CORE-06 = personnel UAT / FR DONE | **DENIED** |
| Claim PAY DONE / CORE-09 DONE / ATT-12 enroll DONE | **DENIED** |
| Claim printable / closed-8 DONE | **DENIED** |
| Nest `/core` dual · wipe CORE-06/05/03/02b | **DENIED** |
| C-SLICE | GWC later ≠ module CORE/personnel/CTR UAT ≠ Phase1 |
| `R-CORE-06-HONESTY` | **INFO idle-ok RETAIN** · ≠ invent CORE-07 DONE from Wave-20 alone |
| must_keep W20 | CORE-06 soft≠DONE · `CORE06QC1-MSLID363` |
| must_keep W19..W10 | CORE-05 AST/BB · CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d TPL+clause · 09c VER/PDF · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 stamps |
| DENY | honesty flip · seed · apps/** · reopen sealed J-HRM-CORE-06-01..05 / 05 / 03 / 02B / 09D/09C/09B/09A/08/02/01 |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **next_owner** | **ba-data** — **HOLD** (no REQUIRED schema invent default: gate aggregate wire-capable on LIVE checklist · `activated_at` HOLD invent soft ADD · gap O6 ABSENT noted) · then **sa API** residual wire unlock F-CORE-ACT-01 physical prefer activate/gated PATCH + GATE assert + EFF + ATT emit |
| **ba-data** | **HOLD** (default) — reopen **REQUIRED** only if DATA stamps typed `activated_at` ADD over wire-body-only |
| **sa API-01** | After HOLD stamp — RETAIN cite F-CORE-ACT-01 physical POST activate **or** gated PATCH · residual GATE 409 · EFF date · ATT emit · paper `/core` alias only |
| **Dev** | **HOLD** until API CONFIRMED · **DENY** Nest `/core` dual · **DENY** wipe CORE-06/05/03/02b · **DENY** invent PAY/CORE-09/ATT · **DENY** claim checklist alone = CORE-07 DONE · **DENY** claim free PATCH = CORE-07 DONE |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-BA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-07
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-BA-01.md · SA Option A · R-CORE-07-GATE-01 IN-SCOPE (prefer aggregate from LIVE checklist+DOC flags · wire-capable · HOLD invent completeness table) · R-CORE-07-ACT-01 IN-SCOPE (prefer POST /employees/:id/activate OR gated PATCH · paper /core alias only) · R-CORE-07-EFF-01 IN-SCOPE (activated_at ABSENT PROVEN · HOLD invent soft ADD) · R-CORE-07-ATT-12 emit only · OUT invent ATT/PAY/CORE-09 DONE · CORE06QC1-MSLID363 · soft≠CORE-06 DONE · R-CORE-06-HONESTY INFO idle-ok · CORE05QC1-MSLGVT40 · CORE03QC1-MSLFJH0K · CORE02BQC1-MSLEFQC1 · peer CORE09DQC1-MSLDR8I3..CORE01QC1-MSL6WMS7 · EMPPLATQA-MSIZXHIM · EMPTOKQA-MSJ290VB must_keep
spec_ref: F-CORE-ACT-01 physical prefer POST /employees/:id/activate OR gated PATCH · LIVE public.employees status spine RETAIN · LIVE hrm_document_checklist_item + emp_document_type flags RETAIN · paper activated_at HOLD invent · Nest /core DENY · checklist đủ ≠ CORE-07 DONE · free PATCH ≠ CORE-07 DONE · soft≠CORE-06 DONE RETAIN

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — no invent/change on LIVE employees status spine (pending_docs/active · open catalog RETAIN)
2) CONFIRM HOLD invent completeness / gate table — BA prefer aggregate from CORE-03 checklist + blocks_activation / required_by_default
3) CONFIRM HOLD invent soft ADD activated_at on public.employees — gap ABSENT PROVEN; reopen REQUIRED only if typed col stamped over wire-body-only effective_date
4) Cite display-ready activate DTO: statusLabelVi · checklist_complete · blocking_items[] · activated_at · can_activate
5) RETAIN CORE-06 soft≠DONE · CORE-05 AST/BB/serial/DELETE-FORBIDDEN · CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d TPL+clause · CORE-09c VER/PDF ≠ printable · CORE-09b PREV ephemeral · CORE-09a CL · CORE-08 · CORE-02 · CORE-01 · Nest /core DENY · R-CORE-06-HONESTY INFO idle-ok
6) DENY wipe CORE-06/05/03/02b · invent PAY/CORE-09/ATT-12 DONE · claim checklist alone = CORE-07 DONE · claim free PATCH = CORE-07 DONE · claim CORE-06 DONE · claim printable/closed-8 DONE · honesty flip · reopen J-HRM-CORE-06-01..05 / 05 / 03 / 02B / 09D/09C/09B/09A/08/02/01 · seed · apps/**
7) Unlock next: sa API-01 RETAIN cite F-CORE-ACT-01 physical activate/gated PATCH + GATE 409 + EFF + ATT emit — paper /core alias only — PAY/CORE-09 remain OUT invent DONE

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API residual (wire-only prefer)
```

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-CORE-07 against SA Option A: physical prefer **POST** `/employees/:id/activate` **or** gated **PATCH** · PENDING=`pending_docs`→ENABLED=`active` · paper `/core` activate = alias only · **checklist đủ ≠ CORE-07 DONE** · **free status PATCH ≠ CORE-07 DONE** · **CORE-06 soft≠DONE RETAIN** · **R-CORE-07-GATE-01 IN-SCOPE** (aggregate LIVE checklist+flags · wire-capable · HOLD invent table) · **R-CORE-07-ACT-01 IN-SCOPE** · **R-CORE-07-EFF-01 IN-SCOPE** (`activated_at` ABSENT PROVEN · HOLD invent soft ADD) · **R-CORE-07-ATT-12** emit only / ATT OUT invent DONE · override **OUT GĐ1** · C&B soft **HOLD** · PAY/CORE-09 **OUT invent DONE** · honesty false · display-ready O11 · mint **J-HRM-CORE-07-01..05 DRAFT** · Diễn biến/Luồng FR-07 + **BR-BP-LC-02** mapped to **AC-CORE-07-*** · Nest `/core` **DENIED** · must_keep CORE-06 (`CORE06QC1-MSLID363` · `R-CORE-06-HONESTY` idle-ok · **≠** CORE-06 DONE) · CORE-05 · CORE-03 · CORE-02b · CORE-09d..01 · **ba-data HOLD** · DENY wipe peers · claim checklist/PATCH=FR-07 DONE · invent PAY/CORE-09/ATT · printable/closed-8 · reopen sealed J-* · seed · apps/** · C-SLICE. |
| **next_owner** | **ba-data** (HOLD stamp → then sa API wire residual) |
| **ack_status** | **PASS_TO_PM** |
| **residual** | DATA-01 HOLD · API F-CORE-ACT-01 physical + GATE/EFF/ATT · J-07-01..03 DRAFT until live · PAY/CORE-09/ATT peers OUT · personnel/printable flags HOLD · soft≠CORE-06 DONE · `R-CORE-06-HONESTY` INFO idle-ok |
