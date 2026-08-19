# PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01 — API F.1 · F-CORE-ACT-01 RETAIN cite activate/gated PATCH + GATE/EFF/ATT residual (Option A PHYSICAL · wire-only prefer)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-21 seat **#23**) |
| **lane** | governance · sa |
| **change_mode** | **RETAIN cite** **F-CORE-ACT-01** physical prefer **`POST /employees/:id/activate`** **OR** gated **`PATCH /employees/:id`** (`status=active` + `effective_date`) · **ADD residual** GATE assert 409 · EFF wire `effective_date` / display `activated_at` · ATT emit `employee.activated` · display-ready activate DTO · **must_keep** CORE-06 soft≠DONE · CORE-05 AST/BB/serial/DELETE-FORBIDDEN · CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d..01 · Nest `/core` DENY · **`R-CORE-06-HONESTY` INFO idle-ok** · **OUT invent** PAY / CORE-09 / ATT enroll DONE · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** · **no schema invent** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — F.1 physical Option A · status spine **HOLD RETAIN** · gate aggregate **wire-capable** · `activated_at` **HOLD invent** · closable gap on LIVE SoT **YES** (activate/gate/emit ABSENT) → unlock **Dev wire residual ONLY** · **DENY** invent completeness table / typed `activated_at` / Nest `/core` dual |
| **uc_ids** | `UC-BP-CORE-07` |
| **depends_on** | DATA-01 **CONFIRMED HOLD** · BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · **R-CORE-07-GATE-01 IN-SCOPE** · **R-CORE-07-ACT-01 IN-SCOPE** · **R-CORE-07-EFF-01 IN-SCOPE** · **R-CORE-07-ATT-12** emit only · OUT invent ATT/PAY/CORE-09 DONE · QC **`CORE06QC1-MSLID363`** · soft≠CORE-06 DONE · **`R-CORE-06-HONESTY` INFO idle-ok** · **`CORE05QC1-MSLGVT40`** · **`CORE03QC1-MSLFJH0K`** · **`CORE02BQC1-MSLEFQC1`** · peer **`CORE09DQC1-MSLDR8I3`..`CORE01QC1-MSL6WMS7`** · **`EMPPLATQA-MSIZXHIM`** · **`EMPTOKQA-MSJ290VB`** must_keep |
| **ref_data** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md) — status spine **HOLD RETAIN** · gate table **HOLD invent** · `activated_at` **HOLD invent** · display-ready activate DTO |
| **ref_ba** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-BA-01.md) · O1–O12 · AC-CORE-07-* · J-HRM-CORE-07-01..05 DRAFT |
| **ref_sa** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-SA-01.md) Option A · checklist≠DONE · free PATCH≠DONE · residuals GATE/ACT/EFF/ATT |
| **ref_core06_api** | [`PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01.md) — soft-return · TERM/CLOSED · soft≠DONE · **≠** CORE-06 DONE |
| **ref_core05_api** | [`PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01.md) — AST/BB · serial 409 · DELETE-FORBIDDEN |
| **ref_core03_api** | [`PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01.md) — F-CORE-CHK-01 · DOC/ET/TOK · **≠** claim CHK = CORE-07 DONE |
| **ref_core02b_api** | [`PO-HRM-MVP-GD1-CORE-02B-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-02B-CLUSTER-API-01.md) — EMP-CF RETAIN |
| **ref_core09d_api** | [`PO-HRM-MVP-GD1-CORE-09D-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-09D-CLUSTER-API-01.md) — TPL+clause · **≠ printable / closed-8 DONE** |
| **ref_core09c_api** | [`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01.md) — VER/PDF · **≠ printable UAT** |
| **ref_core09b_api** | [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01.md) — PACK+PREV ephemeral |
| **ref_core09a_api** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01.md) — CL |
| **ref_core08_api** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md) — RD + payroll_link |
| **ref_core02_api** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md) — packages/AuthZ/CB-403 |
| **ref_core01_api** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md) — public strip · Nest `/core` DENY |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-07** · Luồng **#1–#4** · Diễn biến **#1–#2** · **BR-BP-LC-02** · peers CORE-06..01 **must_keep** · ATT-12 peer consumer · CORE-09/10 / PAY **OUT invent DONE** |
| **ref_paper_api** | **F-CORE-ACT-01** (paper `POST /api/hrm/core/employees/{id}/activate` · physical prefer **`POST /api/hrm/employees/:id/activate`** **or** gated **`PATCH /api/hrm/employees/:id`**) · must_keep **F-CORE-CHK-01** · F-EMP-CAT-DOC/ET/EFF · F-EMP-TOK · F-CORE-AST-01/02 + BB · F-EMP-CF · CTR · CORE-08/02/01 · peer ATT via `employee.activated` (**OUT invent ATT DONE**) · PAY/CORE-09 **OUT invent DONE** |
| **ref_adr** | ADR 4-pillar · Nest physical prefer · paper `/core` alias only · U19 scope parity list↔get↔activate |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · personnel / CORE / CTR module UAT **false** · **C-SLICE** · U65 · **`R-CORE-06-HONESTY` INFO idle-ok** · **DENY** claim checklist đủ alone = CORE-07 DONE · **DENY** claim free PATCH = CORE-07 DONE · **DENY** claim CORE-06 DONE / soft=DONE · **DENY** invent PAY/CORE-09/ATT DONE · **DENY** claim printable / closed-8 DONE |
| **ba-data** | **ALREADY CONFIRMED HOLD** — this seat **does not** re-open schema invent · **DENY** invent completeness/gate table · **DENY** soft ADD `activated_at` without DATA REQUIRED reopen |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **artifact_size** | SPEC_LEN=38940 · EVID_LEN=3833 (NFD path) |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Employee SoT | **ONE RETAIN** Nest **`public.employees`** — **DENY** second EMP store · **DENY** Nest `/core` ACT dual |
| Status spine | **HOLD RETAIN** — PENDING=`pending_docs` · ENABLED=`active` · open catalog · **no invent/change** |
| Checklist / DOC flags | **HOLD must_keep** CORE-03 — LIVE `hrm_document_checklist_item` + `required_by_default` / `blocks_activation` |
| **F-CORE-ACT-01** | **RETAIN cite** — physical prefer **`POST /api/hrm/employees/:id/activate`** **OR** gated **`PATCH /api/hrm/employees/:id`** (`status=active` + `effective_date`) · paper `/api/hrm/core/…/activate` = **alias only** |
| Free status PATCH / checklist CRUD | **RETAIN path** — **≠ CORE-07 DONE** |
| **R-CORE-07-GATE-01** | **IN-SCOPE residual** — assert before activate/gated PATCH · **409** `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` · derive LIVE checklist+DOC flags · **DENY** invent completeness table · **DENY** silent allow |
| **R-CORE-07-EFF-01** | **IN-SCOPE residual** — accept `effective_date` `dd/MM/yyyy` · display `activated_at` · **HOLD invent** typed col · **DENY** epoch junk |
| **R-CORE-07-ATT-12** | **emit only** — readable `employee.activated` · **DENY** invent ATT enroll DONE |
| Display-ready DTO | `statusLabelVi` · `checklist_complete` · `blocking_items[]` · `activated_at` · `can_activate` (DATA-01 §5) |
| Nest path | Physical `/employees/:id*` · Nest `@Controller('core')` **ABSENT** — **DENY invent** |
| CORE-06 soft≠DONE | **must_keep** · **`CORE06QC1-MSLID363`** · **`R-CORE-06-HONESTY` INFO idle-ok** · **≠** CORE-06 DONE |
| CORE-05..01 / EMP DOC/TOK | **must_keep** · **DENY reopen** sealed J-* |
| PAY / CORE-09 / ATT enroll | **OUT invent DONE** |
| Closable gap on LIVE SoT? | **YES** — dedicated activate **ABSENT** · gate assert **ABSENT** · activate envelope fields **ABSENT** · emit **ABSENT** → **wire-only** residual closable **without** schema invent |
| Unlock | **Dev-BE + Dev-FE wire residual** (gate + activate/gated PATCH + EFF body + ATT emit + display-ready) · **HOLD** invent completeness table / typed `activated_at` / Nest `/core` |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim checklist/free PATCH = CORE-07 DONE |

```text
  FE Profile «Kích hoạt Hoạt động» (residual · checklist≠DONE · free PATCH≠DONE)
        │  Network MUST contain /employees/:id (activate OR gated PATCH)
        │  DENY Nest /core/* ACT SoT
        │  DENY invent completeness table · activated_at typed without REQUIRED
        │  DENY invent PAY / CORE-09 / ATT enroll DONE
        │  DENY claim checklist alone / free PATCH alone = FR-07 DONE
        ▼
  F-CORE-ACT-01  prefer POST /api/hrm/employees/:id/activate
                 OR gated PATCH /api/hrm/employees/:id
                 body: status=active + effective_date (dd/MM/yyyy)
        → public.employees.status (HOLD RETAIN pending_docs→active)
        → display-ready statusLabelVi · checklist_complete · blocking_items[] ·
           activated_at · can_activate
        │
  GATE residual  assert required checklist approved + blocks_activation clear
        → else 409 HRM-EMP-ACT-CHECKLIST-INCOMPLETE · status unchanged
        → DENY invent gate/completeness table · DENY silent allow · O8 override OUT
        │
  EFF residual   wire effective_date · display activated_at
        → HOLD invent typed activated_at (DATA ABSENT PROVEN)
        → DENY epoch junk · null → «—»
        │
  ATT residual   emit employee.activated (employee_id · company_id · effective_date)
        → OUT invent ATT enroll / quỹ/ca DONE
        │
        └─► must_keep CORE-06 soft≠DONE · CORE-05 AST/BB/serial/DELETE-FORBIDDEN
              · CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d TPL+clause
              · 09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL · 08 RD
              · 02 CB · 01 public · Nest /core DENY · R-CORE-06-HONESTY INFO idle-ok
              · personnel/printable false · C-SLICE · PAY/CORE-09 OUT
```

**Invariant CORE-07-PATH (O1):** Activate Network **MUST** hit `/employees/:id` (activate **or** gated PATCH) · Nest dual `/core` ACT = **FAIL**.

**Invariant CORE-07-STATUS (O2):** PENDING=`pending_docs` · ENABLED=`active` · closed PENDING\|ENABLED invent primary = **FAIL**.

**Invariant CORE-07-GATE (O3):** Activate without checklist PASS → **409** · invent completeness table as required = **FAIL** · silent allow = **FAIL**.

**Invariant CORE-07-≠-CHK-DONE (O4):** Claim checklist CRUD / badge alone = FR-07 DONE = **FAIL**.

**Invariant CORE-07-≠-PATCH-DONE (O5):** Claim unrestricted status PATCH alone = FR-07 DONE = **FAIL**.

**Invariant CORE-07-EFF (O6):** Missing/invalid `effective_date` when ACT residual live → **4xx** · invent typed `activated_at` without DATA REQUIRED = **FAIL** · epoch junk = **FAIL**.

**Invariant CORE-07-ATT (O7):** Invent ATT enroll / quỹ/ca DONE = **FAIL** · emit-only OK.

**Invariant CORE-07-OV-OUT (O8):** Override thiếu giấy GĐ1 = **OUT** · hard deny only.

**Invariant CORE-07-CB-HOLD (O9):** Invent hard C&B gate / claim CORE-02=C&B DONE = **FAIL**.

**Invariant CORE-07-MK / HONESTY (O10):** Wipe CORE-06/05/03/02b · claim CORE-06 DONE · invent PAY/CORE-09/ATT/printable/closed-8 · reopen sealed J-* · honesty flip = **FAIL**.

**Invariant CORE-07-DISP (O11):** FE invent PAY/ATT SoT from DTO = **FAIL**.

**Invariant CORE-07-S-SCOPE (U19):** list = get-by-id = activate/gated PATCH — same profile scope resolver family — OOS → 404/403 · not empty-mask.

**Invariant CORE-07-DATA-HOLD:** status spine **HOLD RETAIN** · gate table **HOLD invent** · `activated_at` **HOLD invent** — **DENY** schema invent this wave.

---

## 2. AS-IS Nest baseline → residual gap

| Surface | LIVE (read-only cite 2026-08-09) | Gap vs F.1 this seat |
|---------|----------------------------------|----------------------|
| `PATCH …/employees/:employeeId` status | LIVE `EmployeesController` `@Patch(':employeeId')` · `updateEmployee` · `assertEmployeeStatusPayload` = **catalog only** · codes `HRM-EMP-PROFILE-200/202` | **RETAIN path** · **≠** FR-07 DONE · residual **gate** when `status→active` from activate intent |
| Dedicated `POST …/activate` | **ABSENT** (employees grep `activate` / `HRM-EMP-ACT` / `can_activate` **0**) | Residual **R-CORE-07-ACT-01** · prefer thin POST **or** gated PATCH |
| Checklist gate on status transition | **ABSENT** | Residual **R-CORE-07-GATE-01** · wire assert from LIVE checklist+DOC flags |
| `activated_at` typed col | **ABSENT PROVEN** (ensureSchema + INSERT + grep **0**) | Residual **R-CORE-07-EFF-01** · wire-body `effective_date` · **HOLD invent** col |
| Display envelope activate | **ABSENT** `checklist_complete` / `blocking_items` / `can_activate` | Wire display-ready from DATA-01 §5 |
| `employee.activated` emit | **ABSENT** dedicated activate emit | Residual **R-CORE-07-ATT-12** emit-only · use existing realtime/event seam if present · **DENY** invent ATT enroll |
| Checklist instance | LIVE F-CORE-CHK-01 `/document-checklist*` | **must_keep** CORE-03 · gate **input** · **≠** CORE-07 DONE |
| DOC flags | LIVE `required_by_default` · `blocks_activation` | **must_keep** |
| Completeness / gate table | **ABSENT** | Prefer aggregate · **HOLD invent** |
| Nest `@Controller('core')` | **ABSENT** · CoreModule = DB only | **DENY invent** |
| Source cite | `employees.controller.ts` `@Patch(':employeeId')` (~L1556) · `employees.service.ts` `assertEmployeeStatusPayload` (~L430) · `emp-document-checklist.service.ts` · `emp-document-type.service.ts` flags · `hrm-realtime.service.ts` event emit pattern | Docs-only this seat |

**FORBIDDEN invent this seat (docs):** Nest `@Controller('core')` · completeness/gate table as required · soft ADD `activated_at` without DATA REQUIRED · invent PAY/CORE-09/ATT DONE · claim checklist/free PATCH = CORE-07 DONE · claim CORE-06 DONE · printable/closed-8 · reopen sealed J-* · seed · honesty flip · `apps/**`.

---

## 3. Path & alias lock (O1)

| Plane | Path |
|-------|------|
| **PHYSICAL activate (F-CORE-ACT-01 prefer)** | **`POST /api/hrm/employees/:employeeId/activate`** — body `{ effective_date }` (locale `dd/MM/yyyy`) · sets `status=active` after GATE PASS |
| **PHYSICAL gated PATCH (alt same SoT)** | **`PATCH /api/hrm/employees/:employeeId`** — body `{ status: 'active', effective_date }` · **MUST** run same GATE assert when intent = CORE-07 activate (see §5) |
| **PHYSICAL free status PATCH (RETAIN ≠ DONE)** | **`PATCH /api/hrm/employees/:employeeId`** catalog status — **RETAIN** for non-activate status ops · **≠** FR-07 DONE alone · once gate live, unrestricted `active` **without** gate = **FAIL O5** |
| **PHYSICAL gate inputs (must_keep)** | **`GET/POST/PATCH /api/hrm/employees/:id/document-checklist*`** · DOC/ET catalogs |
| **PHYSICAL list/get (U19)** | **`GET /api/hrm/employees`** · **`GET /api/hrm/employees/:id`** — same scope family as activate |
| **LOGICAL (paper)** | `POST /api/hrm/core/employees/{id}/activate` — **alias only** |
| Rule | Client/docs **may** keep paper names; runtime **physical only**. |
| QA Network assert | Path **contains** `/employees/` — **FAIL O1** if FE hits Nest `/core/*` as second ACT SoT |

| Paper / logical | Physical | DB (DATA-01) |
|-----------------|----------|--------------|
| F-CORE-ACT-01 `/core/…/activate` | **`POST /employees/:id/activate`** **or** gated **`PATCH /employees/:id`** | `employees.status` **HOLD RETAIN** |
| Checklist gate | Aggregate from checklist + DOC flags | **HOLD invent** gate table |
| `activated_at` | Wire `effective_date` / display | **HOLD invent** typed col |
| `employee.activated` | Emit envelope | **OUT invent** ATT tables |
| F-CORE-CHK-01 | `/document-checklist*` | CORE-03 **must_keep** |
| PAY / CORE-09 | Peers | **OUT invent DONE** |

**Prefer rule (normative):** Dev **SHOULD** implement thin **`POST …/activate`** as the Profile CTA Network target (clearer AC / mint codes). Gated **PATCH** is an **acceptable alternate** on the **same** controller/SoT **if** it enforces identical GATE+EFF+ATT semantics — **not** a second SoT.

---

## 4. F-CORE-ACT-01 — F.1 RETAIN cite (normative)

### 4.1 Header

| | |
|--|--|
| **Function ID** | **F-CORE-ACT-01** |
| **METHOD / path (physical prefer)** | **`POST /api/hrm/employees/:employeeId/activate`** |
| **METHOD / path (physical alt)** | **`PATCH /api/hrm/employees/:employeeId`** gated (`status=active` + `effective_date`) |
| **Paper alias** | `POST /api/hrm/core/employees/{id}/activate` — **alias only** |
| **change_mode** | **RETAIN cite** paper · **ADD residual wire** on LIVE employees SoT (activate ABSENT AS-IS) |
| **Table** | **`public.employees`** (ONE SoT · status spine HOLD RETAIN) |

### 4.2 Mục đích

Cấp API vật lý để **kích hoạt hồ sơ nhân viên sang trạng thái Hoạt động** khi checklist giấy tờ bắt buộc đã đủ: chuyển `pending_docs` → `active`, ghi nhận ngày hiệu lực, trả display-ready envelope, và phát tín hiệu `employee.activated` cho ATT-12 (peer) — phục vụ SRS **FR-UC-BP-CORE-07 Luồng #2–#3 / Diễn biến #2** và **BR-BP-LC-02** — **không** thay Nest `/core` activate SoT; **không** claim checklist CRUD alone = FR-07 DONE; **không** claim free status PATCH alone = FR-07 DONE; **không** invent PAY / CORE-09 / ATT enroll DONE.

### 4.3 Nghiệp vụ xử lý

1. **Khóa phạm vi (U19):** resolve `:employeeId` trong **same** profile scope family as employees list/get (`resolveHrmListScope` / membership) · miss/OOS → **`HRM-EMP-PROFILE-404`** / **`HRM-SCOPE-409`** — **không** empty-mask list≠activate.
2. **GATE residual (§5):** trước khi flip status — assert checklist PASS (required all `approved` **and** no open `blocks_activation` non-approved) · FAIL → **409** `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` · status **unchanged**.
3. **EFF residual (§6):** require `effective_date` `dd/MM/yyyy` · invalid/missing → **4xx** · **no** status flip · **no** epoch junk on display.
4. **Status transition:** only legal activate spine `pending_docs` → `active` (open catalog RETAIN) · other transitions out of CORE-07 scope stay on free PATCH path (**≠** FR-07 DONE).
5. **Persist:** set `employees.status = active` · persist effective date into typed `activated_at` **only when** DATA unlocks col; until then accept/wire body + return display field (may be body echo / null-safe `—`).
6. **ATT residual (§7):** on 2xx emit readable `employee.activated` (`employee_id` · `company_id` · `effective_date`) · **DENY** invent ATT enroll engine.
7. **Envelope:** success 2xx with display-ready DTO (§8) · mint prefer `HRM-EMP-ACT-200` (or sealed profile 200/202 if gated PATCH alt — evidence must cite).
8. **Honesty:** 2xx activate **≠** module CORE-07 DONE without U65 J-* · footer every evidence · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE.

### 4.4 Tham chiếu bước SRS

| API | UC / Diễn biến | BA AC / J-* |
|-----|----------------|-------------|
| GET checklist + `can_activate` | FR-07 Luồng **#1** · Diễn biến **#1** | **AC-CORE-07-03** · **J-HRM-CORE-07-01** |
| POST activate / gated PATCH | FR-07 Luồng **#2** · Diễn biến **#2** | **AC-CORE-07-01/02/05** · **J-HRM-CORE-07-02** |
| 409 incomplete | FR quy tắc · **BR-BP-LC-02** | **AC-CORE-07-04** · **J-HRM-CORE-07-03** |
| Emit `employee.activated` | Luồng **#3** | **AC-CORE-07-06** · **J-02/04** |
| Checklist alone / free PATCH | O4/O5 | **AC-CORE-07-≠-CHK-DONE** · **≠-PATCH-DONE** · **J-04/05** |
| Nest `/core` 0 | O1 | **AC-CORE-07-H** · **J-05** |
| soft≠CORE-06 DONE | O10 | **AC-CORE-07-MK-06** |

### 4.5 Request / Response ↔ DB (DATA-01 HOLD)

| DTO field | DB / source | Notes |
|-----------|-------------|-------|
| `id` / `employeeId` | `employees.id` | path + row |
| `companyId` | `employees.company_id` | U19 |
| `status` | `employees.status` | `pending_docs` → `active` |
| **`statusLabelVi`** | employment-status catalog derived | «Chờ hoàn thiện» / «Hoạt động» |
| **`checklist_complete`** | aggregate CORE-03 | boolean · **HOLD invent** table |
| **`blocking_items[]`** | required non-approved ∪ blocks open | `{ documentTypeKey, nameVi, status }` |
| **`effective_date`** (request) | wire body | `dd/MM/yyyy` required on activate |
| **`activated_at`** (response) | paper col ABSENT · display | locale · null → `—` · **HOLD invent** typed |
| **`can_activate`** | derived = checklist_complete (GĐ1) | CTA gate · **no** override invent |
| `employee.activated` | event emit | ATT peer · **OUT invent** enroll |

**DENY** invent Nest `/core` activate · second EMP store · completeness table as required · typed `activated_at` without DATA REQUIRED reopen.

### 4.6 Lỗi nghiệp vụ (RETAIN + residual mint)

| Condition | HTTP / code | Outcome |
|-----------|-------------|---------|
| Emp OOS or missing | 404 `HRM-EMP-PROFILE-404` | no mask |
| Scope mismatch | 409 `HRM-SCOPE-409` | no cross-CT |
| Checklist incomplete / blocks open | 409 **`HRM-EMP-ACT-CHECKLIST-INCOMPLETE`** | status unchanged · F5 `pending_docs` |
| Invalid / missing effective_date | 400 `HRM-EMP-ACT-400` (or sealed profile 400) | no status flip · no epoch junk |
| Illegal transition (not pending_docs→active) | 409 mint / 400 | deterministic · no silent 2xx |
| Activate success | 2xx `HRM-EMP-ACT-200` (prefer) | F5 `active` · emit ATT · **≠** FR-07 DONE alone |
| Free PATCH success (AS-IS path) | 2xx `HRM-EMP-PROFILE-200/202` | **≠** claim FR-07 DONE |
| Nest `/core` dual invent | FAIL O1 | dual SoT rejected |

---

## 5. Residual — GATE assert (**R-CORE-07-GATE-01**)

### 5.1 Header

| | |
|--|--|
| **Residual ID** | **R-CORE-07-GATE-01** |
| **Physical inputs** | LIVE **`GET …/document-checklist*`** + DOC `required_by_default` / `blocks_activation` |
| **Assert on** | Before **POST activate** **or** gated **PATCH** `status=active` |
| **change_mode** | **ADD residual wire** · **DENY** invent completeness / gate table |
| **Paper** | F-CORE-ACT-01 verify required docs · **BR-BP-LC-02** |

### 5.2 Mục đích

Chặn kích hoạt Hoạt động khi còn giấy tờ bắt buộc chưa duyệt hoặc còn mục `blocks_activation` mở — khớp Diễn biến **#1** / Luồng **#1** / **BR-BP-LC-02** — **không** invent bảng completeness; **không** silent allow; **không** override GĐ1 (O8 OUT).

### 5.3 Nghiệp vụ xử lý

1. Load non-archived checklist items for employee (CORE-03 RETAIN).
2. Resolve required set = items with `required=true` **or** DOC `required_by_default` / `blocks_activation` as locked by CORE-03 SoT.
3. **PASS** iff every required item `status=approved` **AND** no `blocks_activation=true` item remains non-approved.
4. Build `blocking_items[]` for FAIL / CTA explain · set `checklist_complete` / `can_activate`.
5. On activate attempt FAIL → **409** `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` · body may include `blocking_items[]` · status unchanged.
6. **DENY:** invent gate table · silent 2xx · seed densify checklist to PASS · claim checklist CRUD = GATE residual CLOSED / CORE-07 DONE.

### 5.4 Tham chiếu bước SRS

| Step | SRS | AC / J-* |
|------|-----|----------|
| Check đủ / CTA | Diễn biến **#1** · Luồng **#1** | **AC-CORE-07-03** · **J-01** |
| Chặn thiếu | BR-BP-LC-02 · quy tắc | **AC-CORE-07-04** · **J-03** |
| ≠-CHK-DONE | O4 | **AC-CORE-07-≠-CHK-DONE** |

---

## 6. Residual — EFF effective date (**R-CORE-07-EFF-01**)

### 6.1 Header

| | |
|--|--|
| **Residual ID** | **R-CORE-07-EFF-01** |
| **Request** | `effective_date` `dd/MM/yyyy` |
| **Response display** | `activated_at` (locale) · null → `—` |
| **Typed col** | **HOLD invent** (`activated_at` ABSENT PROVEN — DATA-01) |
| **change_mode** | **ADD residual wire-body** · **DENY** invent typed col this seat |

### 6.2 Mục đích

Ghi nhận **ngày hiệu lực kích hoạt** theo FR-07 / F-CORE-ACT-01 — hiển thị an toàn vi-VN — **không** epoch junk; **không** claim free PATCH without date = EFF DONE.

### 6.3 Nghiệp vụ xử lý

1. Parse `effective_date` as `dd/MM/yyyy` · reject invalid → **4xx**.
2. Until typed col live: accept body · return display field · optional persist strategy **HOLD** (no silent invent col).
3. When DATA REQUIRED unlocks typed ADD: persist `activated_at TIMESTAMPTZ` · reopen **only** that narrow schema seat.
4. Display: format `dd/MM/yyyy` · null/absent → `—` · **DENY** `01/01/1970` / epoch junk.

### 6.4 Tham chiếu bước SRS

| Step | SRS | AC / J-* |
|------|-----|----------|
| Ngày hiệu lực | Diễn biến **#2** · Dữ liệu đầu vào | **AC-CORE-07-05** · **J-02** |

---

## 7. Residual — ATT-12 emit (**R-CORE-07-ATT-12**)

### 7.1 Header

| | |
|--|--|
| **Residual ID** | **R-CORE-07-ATT-12** |
| **Event** | **`employee.activated`** |
| **Payload (min)** | `employee_id` · `company_id` · `effective_date` |
| **change_mode** | **ADD residual emit** · **OUT invent** ATT enroll / quỹ/ca tables DONE |

### 7.2 Mục đích

Phát **tín hiệu đọc được** sau activate thành công để ATT-12 (peer) tiêu thụ sau — khớp Luồng **#3** — **không** claim CORE-07 = ATT module DONE.

### 7.3 Nghiệp vụ xử lý

1. On activate 2xx only — emit once (idempotent prefer on retry).
2. Prefer existing HRM realtime/event seam (`HrmRealtimeService` / platform queue) if available — **wire-only**.
3. Payload must be readable by ATT peer without inventing ATT schemas this seat.
4. **DENY:** invent ATT enroll / quỹ/ca engine · invent PAY DONE · claim ATT-12 DONE.

### 7.4 Tham chiếu bước SRS

| Step | SRS | AC / J-* |
|------|-----|----------|
| Tín hiệu ATT | Luồng **#3** | **AC-CORE-07-06** · **AC-CORE-07-ATT-OUT** · **J-04** |

---

## 8. Display-ready activate DTO (DATA-01 §5 · O11)

| Field | Type | Source | FE bind |
|-------|------|--------|---------|
| `status` | string | `employees.status` | spine |
| `statusLabelVi` | string | catalog derived | «Chờ hoàn thiện» / «Hoạt động» |
| `checklist_complete` | boolean | aggregate GATE | badge / CTA |
| `blocking_items[]` | array | GATE fail set | explain list |
| `activated_at` | string \| null | EFF display | `dd/MM/yyyy` or `—` |
| `can_activate` | boolean | = checklist_complete GĐ1 | enable CTA |
| `effective_date` | string (request) | body | form |

**Surfaces:** GET employee detail / activate response / optional GET checklist envelope may expose gate fields — **same derivation rules** · **DENY** FE invent PAY/ATT SoT.

---

## 9. U19 scope_parity (list = get = activate)

| Operation | Path | Resolver family |
|-----------|------|-----------------|
| List | `GET /api/hrm/employees` | `resolveHrmListScope` (CORE-01 RETAIN) |
| Get-by-id | `GET /api/hrm/employees/:id` | **same** |
| Activate | `POST …/activate` **or** gated `PATCH …/:id` | **same** |
| Checklist (gate input) | `…/document-checklist*` | **same** employee scope |

**PASS:** group CEO `main` list → deep-link activate **not** 404 scope.  
**FAIL:** list returns id but activate/get OOS empty-mask / mismatched company resolver.

---

## 10. DENY / must_keep / honesty

### DENY (this seat)

| Item | Why |
|------|-----|
| Invent Nest `/core` ACT SoT · `@Controller('core')` | O1 dual-SoT FAIL |
| Invent completeness / gate table as required | DATA HOLD · aggregate prefer |
| Invent soft ADD `activated_at` without DATA REQUIRED reopen | DATA HOLD · EFF wire-body |
| Wipe CORE-06 soft≠DONE / return checklist | must_keep `CORE06QC1-MSLID363` |
| Wipe CORE-05 AST/BB/serial/DELETE-FORBIDDEN | must_keep `CORE05QC1-MSLGVT40` |
| Wipe CORE-03 DOC/ET/CHK · CORE-02b EMP-CF | must_keep |
| Invent PAY / CORE-09 / ATT-12 enroll DONE | O7/O10 OUT |
| Claim checklist đủ alone = CORE-07 / FR-07 DONE | O4 |
| Claim free status PATCH alone = CORE-07 DONE | O5 |
| Claim CORE-06 DONE / soft Profile = DONE | O10 · soft≠DONE RETAIN |
| Claim printable / closed-8 DONE | O10 |
| Flip honesty / reopen sealed J-HRM-CORE-06-01..05 / 05 / 03 / 02B / 09D/09C/09B/09A/08/02/01 | seals |
| Seed · `apps/**` this seat | U65 · docs-only |

### must_keep RETAIN

| Stamp / surface | Retain |
|-----------------|--------|
| **`CORE06QC1-MSLID363`** | soft≠DONE · TERM/CLOSED FE-derive · Nest `/core` 0 · **≠** CORE-06 DONE · **`R-CORE-06-HONESTY` INFO idle-ok** |
| **`CORE05QC1-MSLGVT40`** | AST/BB/serial/DELETE-FORBIDDEN · **≠** CORE-05 DONE / personnel |
| **`CORE03QC1-MSLFJH0K`** | DOC/ET/CHK · **≠** claim CHK = CORE-07 DONE · **≠** personnel |
| **`EMPPLATQA-MSIZXHIM`** / **`EMPTOKQA-MSJ290VB`** | DOC/ET · TOK |
| **`CORE02BQC1-MSLEFQC1`** | EMP-CF four catalogs · **DENY wipe** |
| **`CORE09DQC1-MSLDR8I3`** | TPL+clause · **≠ printable** · **≠ closed-8 DONE** |
| **`CORE09CQC1-MSLBXMUT`** | VER/PDF · **≠ printable UAT** |
| **`CORE09BQC1-MSLB05DZ`** | PREV ephemeral |
| **`CORE09AQC1-MSLA4LX9`** | CL |
| **`CORE08QC1-MSL9BFFE`** | RD + payroll_link |
| **`CORE02QC1-MSL80DU6`** | packages · AuthZ/CB-403 |
| **`CORE01QC1-MSL6WMS7`** | public strip · Nest `/core` DENY |
| LIVE employees* physical | `/api/hrm/employees*` · checklist* · DOC/ET |
| Soft-delete · U19 scope_parity | doctrine |

### Honesty (LOCKED false)

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| **`contracts_printable_ready`** | **false** · **DENY** flip |
| **`hrm_personnel_uat_ready`** | **false** · **DENY** flip |
| personnel / CORE / CTR module UAT | **false** |
| **C-SLICE-≠-MODULE** | GWC later ≠ module UAT ≠ Phase1 |
| Claim checklist đủ alone = CORE-07 DONE | **DENIED** |
| Claim free PATCH alone = CORE-07 DONE | **DENIED** |
| Claim CORE-06 DONE / soft=DONE | **DENIED** · soft≠DONE **RETAIN** |
| Invent PAY / CORE-09 / ATT / printable / closed-8 DONE | **DENIED** |
| **`R-CORE-06-HONESTY`** | **INFO idle-ok RETAIN** |

---

## 11. Closable-gap decision (unlock gate)

| Residual | LIVE? | Closable without schema invent? | Unlock |
|----------|-------|----------------------------------|--------|
| Status spine `pending_docs`/`active` | **YES LIVE** | N/A — HOLD RETAIN | **No invent/change** |
| Free PATCH status (catalog) | **YES LIVE** | N/A — RETAIN ≠ DONE | **No claim DONE** |
| Checklist + DOC flags (gate input) | **YES LIVE** | N/A — must_keep CORE-03 | **No wipe** |
| GATE assert on activate | **ABSENT** | **YES** wire from LIVE checklist+flags | **Dev-BE wire** |
| `POST …/activate` | **ABSENT** | **YES** thin same controller | **Dev-BE wire** (prefer) |
| Gated PATCH alt | PATCH LIVE · gate ABSENT | **YES** add assert on active intent | **Dev-BE wire** (alt) |
| Display envelope fields | **ABSENT** | **YES** wire-only derived | **Dev-BE + FE bind** |
| `effective_date` / display `activated_at` | typed col ABSENT | **YES** wire-body · HOLD invent col | **Dev wire** · **HOLD** typed ADD |
| Completeness / gate table | ABSENT | Prefer aggregate | **HOLD invent** · **no unlock schema** |
| `employee.activated` emit | ABSENT | **YES** emit-only on existing seam | **Dev-BE wire** · ATT OUT |
| PAY / CORE-09 / ATT enroll | peers | OUT invent DONE | **No unlock DONE** |

**Verdict unlock:** API **CONFIRMED** · closable gap on LIVE SoT **YES** → unlock **Dev-BE + Dev-FE wire residual ONLY** (gate + prefer POST activate **or** gated PATCH + EFF body + ATT emit + display-ready) · **HOLD** invent completeness table / typed `activated_at` / Nest `/core` · PAY/CORE-09 remain **OUT invent DONE**.

---

## 12. Unlock next (governance)

| Next | Role | What |
|------|------|------|
| **`PO-HRM-MVP-GD1-CORE-07-CLUSTER-BE-01`** | **dev-be** | Wire residual ONLY: GATE assert → 409 `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` · prefer **`POST /employees/:id/activate`** (or gated PATCH same SoT) · EFF `effective_date` · emit `employee.activated` · display-ready DTO · U19 · CODE-MEMORY APPEND · **DENY** invent gate table / typed `activated_at` / Nest `/core` / ATT enroll / PAY/CORE-09 · soft≠CORE-06 DONE · checklist≠DONE · free PATCH≠DONE |
| **`PO-HRM-MVP-GD1-CORE-07-CLUSTER-FE-01`** | **dev-fe** | Profile CTA «Kích hoạt Hoạt động» · bind `can_activate` / `blocking_items` · date `dd/MM/yyyy` · Network physical activate/gated PATCH · Nest `/core` 0 · footer ≠-CHK/≠-PATCH · soft≠CORE-06 DONE · U65 · **DENY** invent PAY/ATT SoT |
| **`PO-HRM-MVP-GD1-CORE-07-CLUSTER-QA-01`** | **qa** | After BE+FE READY · J-HRM-CORE-07-01..05 · 409 incomplete · Nest `/core` 0 · no seed · seals · honesty false |
| PAY / CORE-09 | Peers | Remain **OUT invent DONE** |

---

## 13. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API-01 **CONFIRMED** for UC-BP-CORE-07: **RETAIN cite F-CORE-ACT-01** physical prefer **`POST /api/hrm/employees/:id/activate`** **OR** gated **`PATCH /api/hrm/employees/:id`** (`status=active` + `effective_date`) · paper `/core` alias only · residual **GATE** = assert LIVE checklist+DOC flags → **409** `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` (**DENY** invent completeness table · **DENY** silent allow) · residual **EFF** = wire `effective_date` `dd/MM/yyyy` / display `activated_at` (**HOLD invent** typed col · **DENY** epoch junk) · residual **ATT-12** = emit `employee.activated` (**DENY** invent ATT enroll DONE) · display-ready DTO (`statusLabelVi` · `checklist_complete` · `blocking_items[]` · `activated_at` · `can_activate`) · F.1 Mục đích+Nghiệp vụ+SRS Diễn biến #1–#2 · **BR-BP-LC-02** · DTO↔DATA-01 · U19 list=get=activate · must_keep CORE-06 soft≠DONE (`CORE06QC1-MSLID363` · `R-CORE-06-HONESTY` idle-ok) · CORE-05 AST/BB/serial/DELETE-FORBIDDEN · CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d..01 · Nest `/core` DENY · DENY wipe CORE-06/05/03/02b · invent PAY/CORE-09/ATT DONE · claim checklist alone = CORE-07 DONE · claim free PATCH = CORE-07 DONE · claim CORE-06 DONE · printable/closed-8 · honesty flip · reopen sealed J-* · seed · apps/** · closable gap **YES** → unlock **Dev-BE + Dev-FE wire residual ONLY** · HOLD schema invent · C-SLICE · honesty false. |
| **next_owner** | **pm** → **dev-be** + **dev-fe** (wire residual) · then **qa** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md` · `docs/qa/evidence/po-hrm-mvp-gd1-core-07-cluster-api-01.md` |
| **residual** | BE gate+activate/emit wire · FE CTA+bind · J-07-01..05 DRAFT · `activated_at` HOLD invent · gate table HOLD invent · PAY/CORE-09/ATT peers OUT · personnel/printable HOLD · soft≠CORE-06 DONE · `R-CORE-06-HONESTY` INFO idle-ok |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-07-CLUSTER-BE-01
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-07
depends_on: API-01 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md · DATA-01 HOLD · BA-01 O1–O12 · SA Option A · CORE06QC1-MSLID363 · soft≠CORE-06 DONE · R-CORE-06-HONESTY INFO idle-ok · CORE05QC1-MSLGVT40 · CORE03QC1-MSLFJH0K · CORE02BQC1-MSLEFQC1 · peer CORE09DQC1..CORE01QC1 · EMPPLATQA · EMPTOKQA must_keep
spec_ref: F-CORE-ACT-01 prefer POST /api/hrm/employees/:id/activate OR gated PATCH · GATE 409 HRM-EMP-ACT-CHECKLIST-INCOMPLETE · EFF effective_date · ATT emit employee.activated · paper /core alias only · Nest /core DENY

MISSION — BE wire residual ONLY (no schema invent · U65 · no seed):
1) Prefer POST /api/hrm/employees/:id/activate (or gated PATCH same SoT) — status pending_docs→active + effective_date
2) Before mutate: GATE assert from LIVE checklist + DOC flags — FAIL → 409 HRM-EMP-ACT-CHECKLIST-INCOMPLETE · DENY invent completeness table · DENY silent allow · O8 override OUT
3) EFF: accept effective_date dd/MM/yyyy · display activated_at · HOLD invent typed col · DENY epoch junk
4) On 2xx emit readable employee.activated (employee_id · company_id · effective_date) — DENY invent ATT enroll DONE
5) Display-ready: statusLabelVi · checklist_complete · blocking_items[] · activated_at · can_activate
6) U19 scope_parity list=get=activate · CODE-MEMORY APPEND · F.1 cite SRS Diễn biến #1–#2 · BR-BP-LC-02
7) RETAIN CORE-06 soft≠DONE · CORE-05 AST/BB/serial/DELETE-FORBIDDEN · CORE-03 DOC/ET/CHK · CORE-02b · CORE-09d..01 · Nest /core DENY
8) DENY wipe peers · invent PAY/CORE-09/ATT DONE · claim checklist/free PATCH = CORE-07 DONE · claim CORE-06 DONE · honesty flip · reopen sealed J-* · seed · Nest /core dual

Parallel: PO-HRM-MVP-GD1-CORE-07-CLUSTER-FE-01 — Profile CTA bind can_activate/blocking_items/date · Network physical activate · Nest /core 0 · footer ≠-CHK/≠-PATCH · soft≠CORE-06 DONE · U65

Then: PO-HRM-MVP-GD1-CORE-07-CLUSTER-QA-01 — J-HRM-CORE-07-01..05 · 409 incomplete · Nest /core 0 · no seed · seals

exit: BE evidence · READY_FOR_QA (after FE) · PAY/CORE-09 remain OUT invent DONE
```

---

## 14. Spec read ack (sa)

| Artifact | Cite |
|----------|------|
| DATA-01 | CONFIRMED HOLD · status RETAIN · gate aggregate HOLD invent · `activated_at` HOLD invent · display DTO §5 |
| BA-01 | O1 path · O2 status map · O3 GATE · O4 ≠-CHK · O5 ≠-PATCH · O6 EFF · O7 ATT · O8 OV OUT · O9 CB HOLD · O10 honesty · O11 display · O12 J-* |
| SA-01 | Option A LOCKED · status RETAIN · residuals GATE/ACT/EFF/ATT · checklist≠DONE · free PATCH≠DONE |
| CORE-06 API | soft≠DONE · Nest `/core` DENY · `R-CORE-06-HONESTY` idle-ok · CORE-07 was OUT invent (superseded: this seat unlocks CORE-07 wire) |
| CORE-03 API | F-CORE-CHK-01 RETAIN · gate input · ≠ claim CHK=CORE-07 DONE |
| AS-IS Nest (read-only) | `PATCH :employeeId` LIVE · `assertEmployeeStatusPayload` catalog-only · **0** employees activate/HRM-EMP-ACT/can_activate · **0** `activated_at` · **0** `@Controller('core')` · LIVE checklist + `blocks_activation`/`required_by_default` |
| Peer seals | `CORE06QC1-MSLID363` · `CORE05QC1-MSLGVT40` · `CORE03QC1-MSLFJH0K` · EMP DOC/TOK · `CORE02BQC1-MSLEFQC1` · `CORE09DQC1-MSLDR8I3`..`CORE01QC1-MSL6WMS7` |
