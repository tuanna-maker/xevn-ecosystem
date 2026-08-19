# PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN LIVE `employee_assets` soft-return + HOLD invent TERM/CLOSED cols (Option A · ba-data HOLD)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-20 seat **#22**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **no** invent/change LIVE soft-return spine · **HOLD invent** full `hrm_termination` / Nest TERM dual · **HOLD invent** `asset_checklist_closed` / PAY ack cols · **HOLD/OUT invent** structured bồi thường · **NO** Nest `/core` table dual · **NO** wipe CORE-05 AST/BB/serial/DELETE-FORBIDDEN · **NO** invent CORE-07 / PAY-07 DONE · **NO CODE** `apps/**` · **no migrate run** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED HOLD** — soft-return spine **HOLD RETAIN** · TERM primary **HOLD invent** · closed flag **HOLD invent** (aggregate prefer) · exception structured **HOLD/OUT** · unlock **sa API-01** wire-only prefer (F-CORE-AST-02 RETAIN cite + TERM checklist surface + closed aggregate display-ready) |
| **uc_ids** | `UC-BP-CORE-06` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · [`PO-HRM-MVP-GD1-CORE-06-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-06-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · **R-CORE-06-TERM-CHK-01 IN-SCOPE** (prefer checklist-from-assigned · Nest terminations ABSENT · HOLD invent `hrm_termination` primary) · **R-CORE-06-CLOSED-01 IN-SCOPE** (prefer aggregate closed · HOLD invent `asset_checklist_closed` col) · **R-CORE-06-EXCEPTION-01** stub RETAIN / structured OUT · QC **`CORE05QC1-MSLGVT40`** · QA **`CORE05QA2-MSLGSWSF`** · **`R-CORE-05-HONESTY` INFO idle-ok** · **`CORE03QC1-MSLFJH0K`** · **`CORE02BQC1-MSLEFQC1`** · peer **`CORE09DQC1-MSLDR8I3`..`CORE01QC1-MSL6WMS7`** · **`EMPPLATQA-MSIZXHIM`** · **`EMPTOKQA-MSJ290VB`** must_keep |
| **ref_sa** | [`PO-HRM-MVP-GD1-CORE-06-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-06-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-CORE-06-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-06-CLUSTER-BA-01.md) · O1–O12 · AC-CORE-06-* · R-CORE-06-TERM-CHK-01 · R-CORE-06-CLOSED-01 · R-CORE-06-EXCEPTION-01 |
| **ref_core05_data** | [`PO-HRM-MVP-GD1-CORE-05-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-05-CLUSTER-DATA-01.md) — AST/BB soft cols · serial 409 wire · DELETE-FORBIDDEN · **≠** CORE-05 DONE / personnel UAT |
| **ref_core03_data** | [`PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md) — DOC/ET/CHK |
| **ref_core02b_data** | [`PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md) — EMP-CF HOLD |
| **ref_core09d_data** | [`PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01.md) — open TPL+clause · **≠ printable / closed-8 DONE** |
| **ref_core09c_data** | [`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md) — VER/PDF · **≠ printable UAT** |
| **ref_core09b_data** | [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md) — PACK+PREV ephemeral |
| **ref_core09a_data** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md) — CL body+snapshot |
| **ref_core08_data** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md) — dual RD + payroll_link |
| **ref_core02_data** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md) — packages/eins · AuthZ/CB-403 |
| **ref_core01_data** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md) — public strip · Nest `/core` DENY |
| **ref_paper_db** | paper `hrm_termination.asset_checklist_closed` · `pay_termination_settlement.asset_checklist_ack` · assignment spine ↔ LIVE `employee_assets` |
| **ref_paper_api** | **F-CORE-AST-02** (paper `/core/…/assets/{id}/return` · physical prefer **PATCH** `/employees/:id/assets/:assetId`) · residual peer **F-CORE-TERM-01** · PAY **F-PAY-TERM-SETTLE-01** reads tín hiệu (**OUT invent DONE**) · must_keep **F-CORE-AST-01** + **F-CORE-AST-BB-01** · F-CORE-CHK-01 · F-EMP-* · CTR · CORE-08/02/01 · **F-CORE-ACT-01** CORE-07 **OUT invent DONE** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-06** · Luồng **#1–#4** · Diễn biến **#1–#2** · **BR-BP-AST-02** · peers CORE-05..01 **must_keep** · CORE-04 OCR **OUT** · CORE-07 activate = peer · PAY-07 settle = peer consumer |
| **ref_adr** | ADR **Q-ASSET-MODULE** GĐ1 assignment stub **must** support thu hồi khi nghỉ (BR-BP-AST-02) trên stub — **Không** SoT kho/CCDC toàn tập đoàn |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · personnel / CORE / CTR module UAT **false** · **C-SLICE** · U65 · **`R-CORE-05-HONESTY` INFO idle-ok** · **DENY** claim soft-return alone = CORE-06 DONE · **DENY** claim CORE-05 = personnel UAT · **DENY** invent CORE-07/PAY DONE · **DENY** claim printable / closed-8 DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD**

| Decision | Stamp |
|----------|--------|
| Assignment SoT | **ONE HOLD RETAIN** Nest **`public.employee_assets`** = **same CORE-05 SoT** — **DENY** second assignment store · **DENY** Nest `/core` AST/TERM table dual · **DENY wipe** BB/serial/DELETE-FORBIDDEN |
| Soft-return spine | **HOLD** — **no invent/change** LIVE cols: `status` · `return_date` · `notes` · BB `handover_confirmed_*` · serial · soft history · DELETE-FORBIDDEN must_keep |
| Status map (LIVE vocabulary) | `assigned` ≈ **«Đang sử dụng» / đang giữ / cần thu** · `returned` ≈ **«Đã thu hồi»** · `lost` ≈ **«Mất/ghi nợ»** · `maintenance` retain — checklist filter = `status=assigned` |
| Paper F-CORE-AST-02 | Physical prefer **`PATCH /api/hrm/employees/:id/assets/:assetId`** (`status` + `return_date`) · optional thin `…/assets/:assetId/return` **same** controller/SoT · paper `/api/hrm/core/…/return` = **alias only** |
| Soft Profile Thu hồi | **RETAIN path** for Diễn biến mark — **≠ CORE-06 / FR-06 DONE** without TERM checklist entry + closed tín hiệu |
| **R-CORE-06-TERM-CHK-01** | **IN-SCOPE** · prefer **checklist UI entry** loading 100% `assigned` from LIVE SoT · Nest terminations / `hrm_termination` **ABSENT AS-IS** (grep 2026-08-09 **0**) · **HOLD invent** full `hrm_termination` / Nest TERM dual primary · reopen DATA **REQUIRED** only if soft TERM case cols chosen later |
| **R-CORE-06-CLOSED-01** | **IN-SCOPE** · prefer **aggregate** closed = **0** mandatory `assigned` remaining (display-ready boolean) · paper `asset_checklist_closed` / PAY `asset_checklist_ack` **HOLD invent** cols · PAY-07 **reads tín hiệu only** · **DENY** invent PAY settle engine DONE |
| **R-CORE-06-EXCEPTION-01** | **stub RETAIN** — `status=lost` + `notes` **OK** · structured bồi thường / giá trị kế toán cols **HOLD/OUT invent** |
| Partial thu hồi | **ALLOW** — remainder stay `assigned` · closed **false** until clear/waive |
| Nest path | Physical `/employees/:id/assets*` · paper `/core` = **alias only** · Nest `@Controller('core')` **ABSENT** (**0** matches) |
| CORE-07 / PAY-07 | **OUT invent DONE** — peers QUEUED / consumer only |
| CORE-05 AST/BB/serial/DELETE-FORBIDDEN | **must_keep** · stamps **`CORE05QC1-MSLGVT40`** · **`CORE05QA2-MSLGSWSF`** · **`R-CORE-05-HONESTY` INFO idle-ok** · **≠** CORE-05 DONE / personnel UAT |
| CORE-03 / 02b / 09d..01 | **must_keep** · **DENY reopen** sealed J-* |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim soft-return = CORE-06 DONE |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `hrm_asset_assignment` / return | **`public.employee_assets`** | **HOLD RETAIN** ONE assignment SoT (CORE-05) |
| F-CORE-AST-02 `/core/…/assets/{id}/return` | **`PATCH /employees/:id/assets/:assetId`** (`status`+`return_date`) | Physical prefer · paper **alias only** |
| `hrm_termination` + TERM Nest route | Checklist UI entry → `GET …/assets` filter `assigned` | **HOLD invent** table/route primary |
| Soft `termination_context_id` | Optional display/API field when live later | **HOLD** — not required GĐ1 schema |
| `asset_checklist_closed` | **Derived** boolean on checklist DTO | **HOLD invent** persisted col |
| `pay_termination_settlement.asset_checklist_ack` | Peer PAY reads CORE tín hiệu | **HOLD invent** · **OUT invent** PAY engine DONE |
| Exception bồi thường structured | — | **HOLD/OUT invent** · lost+notes stub OK |
| Full Asset ledger / kho | — | **DENY invent** (ADR) |
| Nest `/core` AST/TERM table | — | **DENY invent** |
| F-CORE-ACT-01 / CORE-07 | Peer | **OUT invent DONE** |

```text
  public.employee_assets (LIVE — HOLD RETAIN soft-return spine · same CORE-05 SoT)
        RETAIN: id · employee_id · company_id · asset_code · asset_name ·
                category · serial_number · assigned_date · return_date ·
                status (assigned|returned|lost|maintenance) · condition · notes ·
                brand · model · specifications · value ·
                handover_confirmed_at · handover_confirmed_by · handover_receiver_name ·
                created_at · updated_at
        DENY:   wipe spine · invent/change soft-return cols · Nest /core dual ·
                hard DELETE issued (DELETE-FORBIDDEN must_keep) · full Asset ledger
                │
                │ TERM checklist (residual — NO schema invent this seat)
                ▼
        Prefer: checklist UI entry loads GET assets WHERE status='assigned'
                optional termination_context_id (soft / ephemeral) when live
        HOLD:   invent public.hrm_termination · Nest terminations controller dual
                │
                │ Closed tín hiệu (residual — aggregate prefer)
                ▼
        Derived: asset_checklist_closed =
                   (count mandatory rows with status='assigned' == 0)
        HOLD:   invent asset_checklist_closed / pay_termination_settlement ack cols
                │
                │ Exception
                ▼
        RETAIN: status='lost' + notes stub
        OUT:    structured compensation amount / accounting ledger cols

  Checklist DTO (API — not this seat code · display-ready)
        assets[]: assetName · assetCode · serialNumber · status · statusLabelVi ·
                  returnDate · notes · (BB flags RETAIN CORE-05)
        asset_checklist_closed: boolean (derived)
        termination_context_id?: string | null (optional when live)

  CORE-05 AST/BB/serial/DELETE-FORBIDDEN · CORE-03 DOC/ET/CHK · CORE-02b EMP-CF ·
  CORE-09d TPL+clause · 09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL ·
  08 RD · 02 packages/AuthZ · 01 public · Nest /core DENY · R-CORE-05-HONESTY idle-ok
        SEALED must_keep

  FORBIDDEN GĐ1 this seat:
        Invent/change LIVE soft-return spine cols
        Invent hrm_termination / Nest /core TERM dual as primary
        Invent asset_checklist_closed / PAY ack cols as required
        Invent structured bồi thường · invent CORE-07/PAY DONE
        Claim soft Profile Thu hồi alone = FR-06 / CORE-06 DONE
        Claim CORE-05 = personnel UAT · claim printable/closed-8 DONE
        Wipe CORE-05/03/02b · reopen sealed J-* · seed · honesty · apps/**
```

**Label lock:** «Thu hồi tài sản khi kích hoạt nghỉ việc» GĐ1 = **checklist-from-assigned + soft-return PATCH + aggregate closed** — **not** soft Profile alone = FR-06 DONE · **not** Nest `/core` TERM dual · **not** invent PAY settle.  
**Spine lock:** Physical `/employees/:id/assets*` — **DENY** Nest `/core` dual.  
**Gap lock:** Nest TERM ABSENT **PROVEN** → prefer UI checklist (**HOLD invent** table) · closed col ABSENT → prefer aggregate (**HOLD invent** col).  
**Honesty lock:** soft ≠ CORE-06 DONE · CORE-05 ≠ personnel · CORE-07/PAY/printable/closed-8 **DENIED**.

---

## 3. AS-IS baseline (Nest facts — read-only cite)

| Object | AS-IS LIVE | Gap (Wave-20 DATA) |
|--------|------------|---------------------|
| **`public.employee_assets`** | `employee-profile.service.ts` `ensureSchema`: spine + BB soft cols (`handover_confirmed_*`) · `return_date` · `status` default `assigned` · `notes` | **HOLD RETAIN** — **no** invent/change |
| Soft-return API | `PATCH …/assets/:assetId` allowlist status/return_date · FE Profile «Thu hồi» | **HOLD RETAIN path** · **≠** FR-06 DONE alone |
| DELETE-FORBIDDEN / serial 409 | LIVE sealed Wave-19 | **must_keep** CORE-05 |
| Display-ready | `statusLabelVi` · BB flags · `handoverDocId` | **RETAIN** · extend checklist DTO with derived closed |
| `hrm_termination` / terminations | **ABSENT** (`apps/api/hrm-api/src` grep **0** `hrm_termination` / `terminations` / `asset_checklist_closed` / `Controller('core')` — 2026-08-09) | Prefer checklist-from-assigned · **HOLD invent** |
| Paper `/core` | Nest `@Controller('core')` **ABSENT** · CoreModule = DB only | **DENY invent** dual |
| Closed flag col | **ABSENT** | Prefer aggregate · **HOLD invent** |
| Structured bồi thường | **ABSENT** | lost+notes stub · **HOLD/OUT** |
| CORE-05 / 03 / 02b / CTR peers | SEALED stamps | **must_keep** · **DENY wipe** |

**FORBIDDEN invent this seat:** change LIVE soft-return spine · Nest `/core` TERM dual · `hrm_termination` primary · persisted closed/ack cols as required · structured compensation · invent CORE-07/PAY DONE · seed · honesty flip · apps/** · reopen sealed CORE-05/03/02b/09d..01.

---

## 4. HOLD dispositions (normative)

### 4.1 Soft-return spine — **HOLD RETAIN** (mission §1)

| Physical | Rule |
|----------|------|
| `status` · `return_date` · `notes` | **HOLD** — no invent/change · soft mark returned/lost/maintenance RETAIN |
| BB cols `handover_confirmed_*` | **HOLD must_keep** CORE-05 — **DENY wipe** |
| `serial_number` + 409 wire | **HOLD must_keep** — index remains HOLD from CORE-05 |
| Hard DELETE issued | **FORBIDDEN** — `HRM-EMP-ASSET-DELETE-FORBIDDEN` **must_keep** |
| Soft history for CORE-06 | Prefer status transition — **DENY** greenfield wipe assignment history |

### 4.2 **R-CORE-06-TERM-CHK-01** — **HOLD invent** `hrm_termination` / Nest TERM dual (mission §2)

| Field | Ruling |
|-------|--------|
| **Scope** | **IN-SCOPE residual** Diễn biến #1 / Luồng #1 / BR-BP-AST-02 |
| **Prefer** | Checklist UI entry loads **100%** `status=assigned` from LIVE `employee_assets` |
| **Physical gap** | Nest terminations / `hrm_termination` **PROVEN ABSENT** |
| **ba-data** | **HOLD invent** full TERM table / Nest `/core` TERM dual primary |
| **Conditional UNLOCK REQUIRED** | Only if PM/SA later chooses **soft TERM case cols** over pure checklist-from-assigned |
| **DENY** | Claim soft Profile Thu hồi = TERM residual CLOSED · invent Nest `/core` TERM SoT · seed lệnh nghỉ · invent full offboard DONE |

### 4.3 **R-CORE-06-CLOSED-01** — **HOLD invent** closed/ack cols (mission §3)

| Field | Ruling |
|-------|--------|
| **Scope** | **IN-SCOPE residual** Diễn biến #2 cờ / Luồng #3–#4 / PAY-07 tín hiệu |
| **Prefer** | **Aggregate** `asset_checklist_closed = (mandatory assigned count == 0)` display-ready |
| **Physical gap** | Paper flag cols **ABSENT** — wire-capable without invent |
| **ba-data** | **HOLD invent** `asset_checklist_closed` · `pay_termination_settlement.asset_checklist_ack` |
| **PAY** | Reads tín hiệu only — **OUT invent** settle engine DONE |
| **DENY** | Claim soft-return alone = CLOSED residual DONE · invent PAY-07 DONE |

### 4.4 **R-CORE-06-EXCEPTION-01** — **HOLD/OUT invent** structured bồi thường (mission §4)

| Field | Ruling |
|-------|--------|
| **Stub** | `status=lost` + `notes` **OK RETAIN** |
| **Structured cols** | amount / accounting ledger **HOLD/OUT invent** |
| **DENY** | Claim lost+notes = full Asset accounting DONE |

### 4.5 Conditional UNLOCK gate (default = NOT)

| Condition | Unlock schema? | This seat |
|-----------|----------------|-----------|
| Soft TERM case cols needed because checklist-from-assigned cannot carry lệnh nghỉ neo | **YES** — narrow soft TERM cols after ba-data REQUIRED reopen | **NOT chosen** → **HOLD** |
| PAY consumer proves need for persisted `asset_checklist_closed` / ack | **YES** — narrow ADD flag later | **NOT proven** → aggregate **HOLD invent** |
| Structured bồi thường required for GĐ1 | **NO** — OUT invent full Asset | Default HOLD/OUT |
| Desire Nest `/core` TERM dual / wipe soft-return / invent CORE-07/PAY DONE | **NO** — **DENY** | Absolute |

**Verdict:** BA prefer checklist-from-assigned + aggregate closed → **HOLD / NOT unlock** schema invent this wave.

---

## 5. Display-ready checklist DTO (mission §5 — cite for sa API)

### 5.1 Asset rows (bind from LIVE `employee_assets`)

| Display field | Physical | Notes |
|---------------|----------|-------|
| `id` | `id` | Assignment id |
| `employeeId` | `employee_id` | Scope parent |
| `companyId` | `company_id` | U19 |
| `assetName` | `asset_name` | |
| `assetCode` | `asset_code` | |
| `serialNumber` | `serial_number` | CORE-05 serial 409 must_keep |
| `status` | `status` | assigned/returned/lost/maintenance |
| **`statusLabelVi`** | derived | «Đang sử dụng» / «Đã thu hồi» / «Mất/ghi nợ» / «Bảo trì» — RETAIN CORE-05 |
| **`returnDate`** | `return_date` | Set on returned |
| `notes` | `notes` | Exception reason stub |
| BB flags | `handover_confirmed_*` | must_keep CORE-05 · not wiped |

### 5.2 Checklist envelope (derived — **no** schema invent)

| Display field | Source | Rule |
|---------------|--------|------|
| **`asset_checklist_closed`** | Aggregate: mandatory `assigned` count == 0 | Boolean display-ready · **HOLD invent** persisted col |
| **`termination_context_id`** | Optional soft context when live | NULL/omit OK GĐ1 · **HOLD** invent TERM PK |
| `assets[]` / `openAssignedCount` | GET assets filter | FE bind · **cấm** FE invent Asset/PAY SoT |

**Partial:** if any mandatory `assigned` remains → `asset_checklist_closed=false`.

### 5.3 Lifecycle (soft-return — RETAIN)

| From → To | Legal? | Notes |
|-----------|--------|-------|
| `assigned` → `returned` (+ `return_date`) | YES | Soft thu hồi · F-CORE-AST-02 physical |
| `assigned` → `lost` (+ notes) | YES | Exception stub |
| `assigned` → `maintenance` | YES | Retain |
| Hard DELETE issued | **NO** | DELETE-FORBIDDEN |
| Claim FR-06 DONE from Profile alone | **NO** | soft ≠ DONE |
| Invent TERM dual as sole SoT | **NO** | HOLD invent |

**Invalid-transition outcome:** API 4xx deterministic (sa API-01) — **no** silent 2xx.

---

## 6. Validation matrix (physical)

| VAL-ID | Condition | Rule | Expected |
|--------|-----------|------|----------|
| **VAL-CORE-06-DATA-01** | Soft-return spine | No invent/change LIVE status/return_date/BB/serial | Schema invent = **FAIL** HOLD |
| **VAL-CORE-06-DATA-02** | Assignment SoT | ONE `employee_assets` | Second Nest table = **FAIL** |
| **VAL-CORE-06-DATA-03** | Physical path | PATCH `/employees/:id/assets*` | Nest `/core` return SoT = **FAIL O1** |
| **VAL-CORE-06-DATA-04** | Checklist đang giữ | Filter `status=assigned` | Wrong filter = **FAIL** |
| **VAL-CORE-06-DATA-05** | TERM residual | Prefer checklist-from-assigned | Invent `hrm_termination` primary without unlock = **FAIL** |
| **VAL-CORE-06-DATA-06** | Closed residual | Aggregate closed prefer | Invent flag col as required without PAY proof = **FAIL** |
| **VAL-CORE-06-DATA-07** | Exception | lost+notes stub | Structured bồi thường invent = **FAIL OUT** |
| **VAL-CORE-06-DATA-08** | Partial | Remainder assigned | Closed true while assigned>0 = **FAIL** |
| **VAL-CORE-06-DATA-09** | Soft≠DONE | Profile Thu hồi alone | Claim FR-06 DONE = **FAIL O4** |
| **VAL-CORE-06-DATA-10** | DELETE-FORBIDDEN | Issued hard DELETE | 409 · must_keep CORE-05 |
| **VAL-CORE-06-DATA-11** | Serial 409 | Conflict | must_keep CORE-05 |
| **VAL-CORE-06-DATA-12** | Scope U19 | list=get=mutate same resolver | Cross-CT / scope_parity FAIL |
| **VAL-CORE-06-DATA-13** | Peer seals | CORE-05/03/02b/09d..01 RETAIN | Wipe/reopen = **FAIL** |
| **VAL-CORE-06-DATA-14** | Honesty | soft≠DONE · CORE-05≠personnel · no CORE-07/PAY/printable flip | Claim/flip = **FAIL** |
| **VAL-CORE-06-DATA-15** | No seed | FE-only | Seed TERM/assets/closed = **FAIL U65** |
| **VAL-CORE-06-DATA-16** | CORE-07/PAY | Peers OUT invent DONE | Invent DONE this seat = **FAIL** |

---

## 7. Traceability (requirement → DB → API → FE → test)

| SRS / BR / residual | DB | API (paper → physical) | FE / J-* | Test expect |
|---------------------|----|------------------------|----------|-------------|
| Luồng #2 · AC-01 · F-CORE-AST-02 | `employee_assets.status`/`return_date` **HOLD** | **PATCH** `/employees/:id/assets/:assetId` | **J-HRM-CORE-06-02** | 2xx · F5 · Nest `/core` 0 · soft≠DONE cite |
| Luồng #1 · AC-02/03 · TERM-CHK | LIVE assigned filter · **HOLD invent** TERM | GET assets · checklist UI residual | **J-HRM-CORE-06-01** DRAFT | Load assigned · no seed · Nest TERM 0 |
| Luồng #3–#4 · AC-05/06 · CLOSED | Aggregate derived · **HOLD invent** col | display-ready `asset_checklist_closed` | **J-HRM-CORE-06-03** DRAFT | true/false · ≠ invent PAY |
| Exception · AC-07 | `lost`+`notes` HOLD | PATCH lost | **J-02** | stub OK · structured OUT |
| Partial · AC-08 | remainder `assigned` | PATCH subset | **J-04** | closed false |
| Soft≠DONE · AC-≠-SOFT-DONE | — | soft path RETAIN | **J-05** | FAIL if claim FR-06 DONE |
| MK-05 · BB/serial/DELETE | CORE-05 cols **HOLD** | F-CORE-AST-01/BB-01 | seals | no reopen J-05 · honesty idle-ok |
| MK-03/02B/09D..01 | peer tables | peer APIs | seals | no reopen |
| O9 CORE-07/PAY OUT | — | F-CORE-ACT-01 / F-PAY-TERM-SETTLE-01 | footer | ≠ invent DONE |
| O1 Nest deny | no `/core` table | physical assets* | Network | Nest `/core` 0 |

**scope_parity (U19):** assets list / get-by-id / PATCH mutate **MUST** use **same** profile scope resolver family as CORE-05 (`resolveHrmListScope` / membership). List returns assignment id → detail/mutate under group CEO `main` must not 404 scope (`scope_parity`). Trace: `GET/PATCH /employees/:id/assets*` + J-HRM-CORE-06-01..05 + UI deep link Profile/checklist.

---

## 8. Error / integrity mapping (RETAIN — no invent rewrite sealed)

| Physical fail | HTTP / code | Data outcome |
|---------------|-------------|--------------|
| Soft-return success | 2xx `HRM-EMP-PROFILE-200/202` | status/return_date updated · **≠** FR-06 DONE alone |
| Hard DELETE issued | 409 **`HRM-EMP-ASSET-DELETE-FORBIDDEN`** | history retained |
| Serial conflict | 409 **`HRM-EMP-ASSET-SERIAL-CONFLICT`** | must_keep CORE-05 |
| Scope mismatch | 409 `HRM-SCOPE-409` | no cross-CT |
| Closed gate (when live) | 4xx residual | closed false · ≠ invent PAY |
| Nest `/core` dual invent | FAIL O1 | dual SoT rejected |
| Sealed CORE-* | — | **DENY** rewrite |

---

## 9. DENY / must_keep / honesty

### DENY (this seat)

| Item | Why |
|------|-----|
| Invent/change LIVE soft-return spine cols | HOLD §4.1 |
| Invent full `hrm_termination` / Nest TERM dual primary | HOLD §4.2 · gap ≠ auto invent |
| Invent `asset_checklist_closed` / PAY ack cols as required | HOLD §4.3 · aggregate prefer |
| Invent structured bồi thường cols | HOLD/OUT §4.4 |
| Nest `/core` AST/TERM SoT · `@Controller('core')` | O1 dual-SoT FAIL |
| Wipe CORE-05 AST/BB/serial/DELETE-FORBIDDEN | must_keep `CORE05QC1-MSLGVT40` |
| Wipe CORE-03 DOC/ET/CHK · CORE-02b EMP-CF | must_keep |
| Invent CORE-07 / PAY-07 settle engine DONE | O9 OUT |
| Claim soft Profile Thu hồi alone = CORE-06 / FR-06 DONE | O4 |
| Claim CORE-05 = personnel UAT / FR DONE | O10 |
| Claim printable / closed-8 DONE | O10 |
| Flip honesty / reopen sealed J-HRM-CORE-05-01..05 / 03 / 02B / 09D/09C/09B/09A/08/02/01 | seals |
| Seed · `apps/**` | U65 · docs-only |

### must_keep RETAIN

| Stamp / surface | Retain |
|-----------------|--------|
| **`CORE05QC1-MSLGVT40`** / **`CORE05QA2-MSLGSWSF`** | AST/BB/serial/DELETE-FORBIDDEN · soft-return path · Nest `/core` 0 · **≠** CORE-05 DONE · **`R-CORE-05-HONESTY` INFO idle-ok** |
| **`CORE03QC1-MSLFJH0K`** | DOC/ET/CHK · **≠** personnel UAT |
| **`EMPPLATQA-MSIZXHIM`** / **`EMPTOKQA-MSJ290VB`** | DOC/ET · TOK |
| **`CORE02BQC1-MSLEFQC1`** | EMP-CF four catalogs · **DENY wipe** |
| **`CORE09DQC1-MSLDR8I3`** | TPL+clause · **≠ printable** · **≠ closed-8 DONE** |
| **`CORE09CQC1-MSLBXMUT`** | VER/PDF · **≠ printable UAT** |
| **`CORE09BQC1-MSLB05DZ`** | PREV ephemeral |
| **`CORE09AQC1-MSLA4LX9`** | CL |
| **`CORE08QC1-MSL9BFFE`** | RD + payroll_link |
| **`CORE02QC1-MSL80DU6`** | packages · AuthZ/CB-403 |
| **`CORE01QC1-MSL6WMS7`** | public strip · Nest `/core` DENY |
| LIVE assets* physical | `/api/hrm/employees/:id/assets*` |
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
| Claim soft-return alone = CORE-06 DONE | **DENIED** |
| Claim CORE-05 = personnel UAT / FR DONE | **DENIED** |
| Invent CORE-07 / PAY / printable / closed-8 DONE | **DENIED** |
| **`R-CORE-05-HONESTY`** | **INFO idle-ok RETAIN** |

---

## 10. Risks & mitigation

| Risk | Mitigation |
|------|------------|
| Dev invents Nest `/core` return/TERM dual | VAL-03/05 · O1 FAIL · DENY |
| Dev invents `hrm_termination` as primary without unlock | §4.2 HOLD · VAL-05 |
| Dev invents closed col / PAY ack as required | §4.3 · VAL-06 |
| Claim soft Profile = FR-06 DONE | VAL-09 · O4 · J-05 |
| Wipe CORE-05 BB/serial/DELETE | must_keep stamps · VAL-10/11/13 |
| Invent CORE-07/PAY DONE | VAL-16 · O9 |
| Seed lệnh nghỉ / closed fake | VAL-15 · U65 |
| scope_parity list≠mutate | VAL-12 · U19 |
| Misread ABSENT TERM as REQUIRED invent | §4.5 · prefer checklist-from-assigned |

---

## 11. Unlock next (governance)

| Next | Role | What |
|------|------|------|
| **`PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01`** | **sa** | **RETAIN cite** **F-CORE-AST-02** physical **PATCH** `/employees/:id/assets*` · residual **TERM checklist surface** (loads assigned · optional soft context id) · **closed aggregate display-ready** DTO · paper `/core` alias only · F.1 mục đích + bước SRS · U19 scope_parity · must_keep CORE-05..01 · Nest `/core` DENY · soft≠DONE · CORE-07 remain **QUEUED** — **wire-only prefer** · **not** Dev invent schema |
| Dev-BE / Dev-FE | **HOLD** | Until API CONFIRMED · residual wire only if API proves closable gap on LIVE SoT |
| QA / QC | After wire (if any) | J-HRM-CORE-06-01..05 DRAFT · C-SLICE · honesty false · cite soft≠DONE · CORE-05 seals |
| CORE-07 | Peer | Remain **QUEUED** · **OUT invent DONE** this seat |

---

## 12. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | DATA-01 **CONFIRMED HOLD** for UC-BP-CORE-06: **HOLD RETAIN** LIVE `public.employee_assets` soft-return spine (status · return_date · BB · serial · DELETE-FORBIDDEN must_keep CORE-05) · **HOLD invent** full `hrm_termination` / Nest TERM dual (prefer checklist-from-assigned) · **HOLD invent** `asset_checklist_closed` / PAY ack cols (prefer aggregate closed) · **HOLD/OUT invent** structured bồi thường (lost+notes stub OK) · cite display-ready checklist DTO (asset rows + statusLabelVi + return_date + derived `asset_checklist_closed` + optional `termination_context_id`) · RETAIN CORE-05 (`CORE05QC1-MSLGVT40` · `CORE05QA2-MSLGSWSF` · `R-CORE-05-HONESTY` idle-ok) · CORE-03 · CORE-02b · CORE-09d..01 · Nest `/core` DENY · DENY wipe CORE-05/03/02b · invent CORE-07/PAY DONE · claim soft-return alone = CORE-06 DONE · claim CORE-05 = personnel · printable/closed-8 · honesty flip · reopen sealed J-* · seed · apps/** · unlock **sa API-01** wire-only prefer · CORE-07 remain QUEUED · C-SLICE · honesty false. |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01.md` · `docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-data-01.md` |
| **residual** | API F-CORE-AST-02 RETAIN + TERM UI surface + closed aggregate DTO · J-06-01/03 DRAFT until live · CORE-07 peer QUEUED · PAY-07 peer OUT · soft TERM cols HOLD · persisted closed HOLD · personnel/printable flags HOLD |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-06
depends_on: DATA-01 CONFIRMED HOLD · docs/program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA Option A · R-CORE-06-TERM-CHK-01 IN-SCOPE (checklist-from-assigned · HOLD invent hrm_termination) · R-CORE-06-CLOSED-01 IN-SCOPE (aggregate closed · HOLD invent flag) · R-CORE-06-EXCEPTION-01 stub RETAIN · CORE05QC1-MSLGVT40 · CORE05QA2-MSLGSWSF · R-CORE-05-HONESTY INFO idle-ok · CORE03QC1-MSLFJH0K · CORE02BQC1-MSLEFQC1 · peer CORE09DQC1-MSLDR8I3..CORE01QC1-MSL6WMS7 · EMPPLATQA-MSIZXHIM · EMPTOKQA-MSJ290VB must_keep
spec_ref: F-CORE-AST-02 physical prefer PATCH /employees/:id/assets* · LIVE employee_assets HOLD RETAIN · paper /core alias only · Nest /core DENY · soft Profile ≠ CORE-06 DONE · CORE-07 / PAY-07 OUT invent DONE

MISSION — API F.1 lock (docs-only · wire-only prefer · no schema invent):
1) RETAIN cite F-CORE-AST-02 physical PATCH /api/hrm/employees/:id/assets/:assetId (status+return_date) · optional thin …/return same SoT · paper /core/…/return alias only
2) Residual TERM checklist surface — entry loads GET assets filter assigned · optional soft termination_context_id · DENY Nest /core TERM dual invent · DENY invent hrm_termination primary
3) Closed aggregate display-ready — expose asset_checklist_closed derived (0 mandatory assigned) · DENY invent PAY settle engine · DENY invent flag col as required
4) Exception — lost+notes stub RETAIN · structured bồi thường OUT
5) F.1 mỗi endpoint: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (UC-BP-CORE-06 Diễn biến) · DTO↔DB from DATA-01 · U19 scope_parity list=get=mutate
6) RETAIN CORE-05 AST/BB/serial/DELETE-FORBIDDEN · CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d..01 · Nest /core DENY · R-CORE-05-HONESTY INFO idle-ok
7) DENY wipe CORE-05/03/02b · invent CORE-07/PAY DONE · claim soft-return alone = CORE-06 DONE · claim CORE-05 = personnel UAT · claim printable/closed-8 DONE · honesty flip · reopen J-HRM-CORE-05-01..05 / 03 / 02B / 09D/09C/09B/09A/08/02/01 · seed · apps/**
8) Unlock next: Dev wire residual ONLY if API CONFIRMED closable gap on LIVE SoT — else FE/QA journey draft; CORE-07 remain QUEUED

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01.md · PASS_TO_PM · Dev HOLD until API CONFIRMED
```

---

## 13. Spec read ack (ba-data)

| Artifact | Cite |
|----------|------|
| BA-01 | O1 path · O2 SoT · O3 status · O4 soft≠DONE · O5 TERM HOLD invent · O6 closed aggregate · O7 exception OUT · O8 partial · O9 CORE-07/PAY OUT · O10 honesty · O11 display · O12 J-* |
| SA-01 | Option A LOCKED · soft-return RETAIN ≠ DONE · residuals TERM/CLOSED/EXCEPTION |
| CORE-05 DATA | soft-return + BB cols HOLD RETAIN · DELETE-FORBIDDEN · serial |
| AS-IS Nest (read-only) | `employee_assets` ensureSchema LIVE · apps grep **0** `hrm_termination` / `terminations` / `asset_checklist_closed` / `Controller('core')` |
| Peer seals | `CORE05QC1-MSLGVT40` · `CORE05QA2-MSLGSWSF` · `R-CORE-05-HONESTY` idle-ok · `CORE03QC1-MSLFJH0K` · EMP DOC/TOK · `CORE02BQC1-MSLEFQC1` · `CORE09DQC1-MSLDR8I3`..`CORE01QC1-MSL6WMS7` |