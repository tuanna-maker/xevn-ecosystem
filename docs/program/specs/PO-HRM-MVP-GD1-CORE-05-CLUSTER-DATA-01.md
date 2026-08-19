# PO-HRM-MVP-GD1-CORE-05-CLUSTER-DATA-01 — Physical DB · ADD BB confirm soft cols on LIVE `employee_assets` (Option A · ba-data REQUIRED)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-05-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-19 seat **#21**) |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** soft confirm cols on LIVE **`public.employee_assets`** (paper §3.8 / F-CORE-AST-01 `handover_doc_id` gap **PROVEN**) · **HOLD / RETAIN** assignment CRUD spine cols · **HOLD/OUT** Asset master catalog / serial unique index · **NO** Nest `/core` table dual · **NO** full e-sign / Asset ledger invent · **NO** invent CORE-06/07 DONE · **NO CODE** `apps/**` · **no migrate run** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — handover physical **ADD soft cols (prefer)** locked · assignment spine **HOLD RETAIN** · catalog/serial-index **HOLD/OUT** · unlock **sa API-01** `F-CORE-AST-01` RETAIN cite + residual **`F-CORE-AST-BB-01`** + serial **409** |
| **uc_ids** | `UC-BP-CORE-05` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · [`PO-HRM-MVP-GD1-CORE-05-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-05-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · **R-CORE-05-HANDOVER-01 IN-SCOPE** · physical gap **PROVEN** · **R-CORE-05-CAT-SERIAL-01** catalog OUT / serial wire HOLD · QC **`CORE03QC1-MSLFJH0K`** · **`CORE02BQC1-MSLEFQC1`** · peer **`CORE09DQC1-MSLDR8I3`..`CORE01QC1-MSL6WMS7`** · **`EMPPLATQA-MSIZXHIM`** · **`EMPTOKQA-MSJ290VB`** · **`R-CORE-03-CC-EMBED-OBS` P2 idle-ok** must_keep |
| **ref_sa** | [`PO-HRM-MVP-GD1-CORE-05-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-05-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-CORE-05-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-05-CLUSTER-BA-01.md) · O1–O12 · AC-CORE-05-* · R-CORE-05-HANDOVER-01 · R-CORE-05-CAT-SERIAL-01 |
| **ref_core03_data** | [`PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md) — DOC/ET/CHK · **≠** personnel UAT |
| **ref_core02b_data** | [`PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md) — EMP-CF HOLD · **≠** personnel / EMPCF DONE |
| **ref_core09d_data** | [`PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01.md) — open TPL+clause · **≠ printable / closed-8 DONE** |
| **ref_core09c_data** | [`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md) — VER/PDF · **≠ printable UAT** |
| **ref_core09b_data** | [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md) — PACK+PREV ephemeral |
| **ref_core09a_data** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md) — CL body+snapshot |
| **ref_core08_data** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md) — dual RD + payroll_link |
| **ref_core02_data** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md) — packages/eins · AuthZ/CB-403 |
| **ref_core01_data** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md) — public strip · Nest `/core` DENY |
| **ref_paper_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) **§3.8** `hrm_asset_assignment` + `hrm_asset_handover` |
| **ref_paper_api** | **F-CORE-AST-01** (paper `/core/…/assets` · `handover_doc_id`) · residual **F-CORE-AST-BB-01** · **F-CORE-AST-02** peer CORE-06 **OUT invent DONE** · must_keep F-CORE-CHK-01 · F-EMP-CAT-DOC/ET/EFF · F-EMP-TOK · F-EMP-CF · CTR TPL/VER/PDF/PACK/PREV/CL · CORE-08/02/01 |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-05** · Luồng **#1–#4** · Diễn biến **#1–#2** · **BR-BP-AST-01** · peers CORE-03..01 **must_keep** · UC kế **CORE-06** (**depends_on** · ≠ invent DONE) · CORE-04 OCR **OUT** · CORE-07 activate = peer |
| **ref_adr** | ADR **Q-ASSET-MODULE** GĐ1 assignment stub (mã/serial + BB + status) — **not** SoT kho/CCDC toàn tập đoàn |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · personnel / CORE / CTR module UAT **false** · **C-SLICE** · U65 · **DENY** claim CORE-03 = personnel UAT · **DENY** claim LIVE CRUD alone = CORE-05 DONE · **DENY** invent CORE-06/07 DONE · **DENY** claim printable / closed-8 DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Assignment SoT | **ONE HOLD RETAIN** Nest **`public.employee_assets`** ↔ paper `hrm_asset_assignment` / `employee_asset_assignments` alias — **DENY** second assignment store · **DENY** Nest `/core` AST table |
| Handover BB SoT (GĐ1) | **ADD soft cols (prefer)** on **same** `employee_assets` — **`handover_confirmed_at`** · **`handover_confirmed_by`** · optional **`handover_receiver_name`** — gap **PROVEN ABSENT** |
| Paper `handover_doc_id` | **Alias** = assignment `id` once `handover_confirmed_at IS NOT NULL` (GĐ1) — **DENY** invent PKI / full e-sign doc store as SoT |
| Light `hrm_asset_handover` | **CONDITIONAL ALT only** — **NOT** unlocked this seat (soft cols sufficient for Diễn biến #2 / BR BB) · if future multi-issue history proven → soft `assignment_id` + `handover_type=issue` · **DENY** Nest `/core` dual |
| Gap vs §3.8 / F-CORE-AST-01 | **PROVEN ABSENT** — `apps/` grep **0** `handover_confirmed` / `hrm_asset_handover` / `handover_doc` (2026-08-09) · LIVE ensureSchema cols = code/name/category/serial/dates/status/condition/notes/brand/model/spec/value **only** |
| Assignment CRUD spine | **HOLD RETAIN** — **no** invent/change LIVE cols already present |
| Asset master / kho SKU | **HOLD / OUT invent** — row stub `category` + `asset_code` / `serial_number` **OK** (ADR §11) |
| Serial unique index | **HOLD** — wire **409** first (`HRM-EMP-ASSET-SERIAL-CONFLICT` or synonym) · index optional later |
| Soft-delete | Prefer **status** transition (`returned`/`lost`/`maintenance`) over hard `DELETE` · **`archived_at` HOLD** (ADD only if status-only insufficient later) |
| Status map (LIVE vocabulary) | `assigned` ≈ **«Đang sử dụng»** · `returned` ≈ «Đã thu hồi» · `maintenance` ≈ «Bảo trì» · `lost` ≈ «Mất/ghi nợ» · filter đang giữ = `status=assigned` — paper `allocated`/`return_pending` = **alias map only** (no wipe LIVE status set) |
| Nest path | Physical prefer **`/api/hrm/employees/:id/assets*`** · paper `/api/hrm/core/…/assets` = **alias only** |
| CORE-06 thu hồi | **OUT invent DONE** — same SoT rows · **F-CORE-AST-02** board #22 **QUEUED** · **depends_on** CORE-05 |
| CORE-03 DOC/ET/CHK | **must_keep** · stamp **`CORE03QC1-MSLFJH0K`** · **`R-CORE-03-CC-EMBED-OBS` P2 idle-ok** · **≠** personnel UAT |
| CORE-02b EMP-CF · CORE-09d..01 | **must_keep** · **DENY reopen** sealed J-* |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim CRUD = CORE-05 DONE |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `hrm_asset_assignment` §3.8 | **`public.employee_assets`** | **HOLD RETAIN** ONE assignment SoT |
| `employee_asset_assignments` (API map) | **same** `employee_assets` | Alias label — **DENY** dual table |
| `hrm_asset_handover` §3.8 issue | Soft confirm cols on assignment (**prefer**) | **ADD** on `employee_assets` |
| `handover_doc_id` (F-CORE-AST-01) | assignment `id` when confirmed | Display/API alias — **DENY** second doc ledger |
| `signed_internal_at` / signer metadata | `handover_confirmed_at` · `handover_confirmed_by` (+ optional receiver name) | GĐ1 stub ≠ full e-sign |
| `allocated` status | LIVE `assigned` | Map VI «Đang sử dụng» |
| `return_pending` | LIVE transitional via status/CORE-06 | **OUT invent DONE** this seat |
| Asset master / kho SKU | — | **OUT invent** · row stub OK |
| `/api/hrm/core/…/assets` | `/api/hrm/employees/:id/assets*` | **Alias only** — API seat |
| Nest `/core` AST / handover table | — | **DENY invent** |
| Full Asset ledger / depreciation | — | **DENY invent** |
| F-CORE-AST-02 return | same `employee_assets` | Peer CORE-06 **QUEUED** |

```text
  public.employee_assets (LIVE — HOLD RETAIN assignment spine SoT)
        RETAIN: id · employee_id · company_id · asset_code · asset_name ·
                category · serial_number · assigned_date · return_date ·
                status (default assigned) · condition · notes ·
                brand · model · specifications · value ·
                created_at · updated_at
        DENY:   wipe spine · Nest /core dual assignment · full Asset ledger
                │
                │ ADD soft BB confirm (prefer — gap PROVEN)
                ▼
        ADD:    handover_confirmed_at TIMESTAMPTZ NULL
                handover_confirmed_by TEXT NULL (soft user/actor id)
                handover_receiver_name TEXT NULL (optional display)
        DENY:   invent light hrm_asset_handover as primary this seat ·
                Nest /core handover table · full e-sign / PKI SoT ·
                invent CORE-06 return checklist as DONE
                │
                │ Display-ready list + «Đang sử dụng» gate
                ▼
  Asset list DTO (API — not this seat code)
        assetName · assetCode · serialNumber · category · assignedDate ·
        status + statusLabelVi · condition · notes ·
        handoverConfirmed (bool) · handoverConfirmedAt · handoverConfirmedBy ·
        handoverReceiverName? · paper handoverDocId alias = id when confirmed

  Serial conflict (wire residual — HOLD unique index)
        Non-empty serial already status=assigned in scope → 409
        HRM-EMP-ASSET-SERIAL-CONFLICT (or documented synonym)

  CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d TPL+clause ·
  09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL · 08 RD ·
  02 packages/AuthZ · 01 public · Nest /core DENY · R-CORE-03-CC-EMBED-OBS P2
        SEALED must_keep

  FORBIDDEN GĐ1 this seat:
        Invent/change LIVE assignment CRUD spine cols
        Nest @Controller('core') AST SoT · Asset master/kho invent
        Serial unique index as schema unlock (wire 409 first)
        Claim CRUD alone = FR-05 / BB DONE · claim CORE-03 = personnel
        Invent CORE-06/07 DONE · claim printable/closed-8 · wipe CORE-03/02b
        Reopen J-HRM-CORE-03-01..05 / 02B / 09D/09C/09B/09A/08/02/01 · seed · honesty · apps/**
```

**Label lock:** «Cấp phát + biên bản» = **assignment RETAIN** + **BB confirm ADD soft cols** — **not** CRUD alone = Diễn biến #2 / BR-BP-AST-01 BB DONE · **not** CORE-06 thu hồi DONE.  
**Spine lock:** Physical `/employees/:id/assets*` — **DENY** Nest `/core` dual.  
**Gap lock:** Confirm cols ABSENT → **ADD** (not HOLD forever) · assignment spine LIVE → **HOLD**.  
**Honesty lock:** CORE-03 ≠ personnel UAT · CRUD ≠ CORE-05 DONE · CORE-06/07 / printable / closed-8 **DENIED**.

---

## 3. AS-IS baseline (Nest facts — read-only cite)

| Object | AS-IS LIVE | Gap (Wave-19 DATA) |
|--------|------------|---------------------|
| **`public.employee_assets`** | `employee-profile.service.ts` `ensureSchema`: UUID id · `employee_id` · `company_id` · `asset_code` · `asset_name` · `category` · `serial_number` · `assigned_date` · `return_date` · `status` default `assigned` · `condition` · `notes` · `brand`/`model`/`specifications`/`value` · audit | **HOLD RETAIN** spine · **ADD** confirm cols |
| Physical CRUD API | `GET/POST /api/hrm/employees/:id/assets` · `PATCH/DELETE …/assets/:assetId` · codes `HRM-EMP-PROFILE-200/201/202` | **RETAIN cite** F-CORE-AST-01 physical |
| FE Profile tab | `EmployeeAssets` CRUD LIVE | **RETAIN** bind · **ADD** confirm flags when API live |
| BB confirm cols | **ABSENT** (`handover_confirmed*` **0** in `apps/`) | **ADD** soft cols |
| `hrm_asset_handover` Nest | **ABSENT** (`hrm_asset_handover` **0** in `apps/`) | Prefer soft cols · light table **NOT** primary |
| Paper `/core` | Nest `@Controller('core')` AST **ABSENT** · CoreModule = DB only | **DENY invent** dual |
| Serial conflict gate | Not proven in ensureSchema / service | **Wire residual** · index **HOLD** |
| Asset master catalog | Row `category` stub only | **OUT invent** master/kho |
| Soft-delete | Hard `deleteProfileRow` exists | Prefer status soft · hard DELETE issued **FORBIDDEN** without waiver |
| CORE-03 / EMP-CF / CTR peers | SEALED stamps | **must_keep** · **DENY wipe** |

**FORBIDDEN invent this seat:** change LIVE spine cols · Nest `/core` dual · Asset ledger/kho · serial unique index unlock · invent light handover as primary · invent CORE-06 return · seed · honesty flip · apps/** · reopen sealed CORE-03/02b/09d..01.

---

## 4. ADD — soft BB confirm cols on `public.employee_assets` (normative physical)

### 4.1 Columns (prefer — paper §3.8 issue metadata · soft-delete doctrine)

| Physical column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `handover_confirmed_at` | TIMESTAMPTZ | YES | NULL | Set on BB confirm (Diễn biến #2) · NULL = chưa xác nhận nhận |
| `handover_confirmed_by` | TEXT | YES | NULL | Soft actor/user id · **DENY hard FK GĐ1** to auth users |
| `handover_receiver_name` | TEXT | YES | NULL | **Optional** display name of receiver · not e-sign certificate |

**DENY ADD invent this seat (unless later BA proven):** full `hrm_asset_handover` as primary SoT · `signer_user_ids_json` mega · PKI cert blobs · Nest `/core` handover table · Asset depreciation cols · CORE-06 return checklist cols as CORE-05 DONE · hard FK to employees/users · closed status CHECK that wipes LIVE vocabulary.

### 4.2 Paper `handover_doc_id` mapping (GĐ1)

| Paper field | Physical GĐ1 | Rule |
|-------------|---------------|------|
| `handover_doc_id` | assignment `id` when `handover_confirmed_at IS NOT NULL` | API may expose `handoverDocId = id` (or null if unconfirmed) — **DENY** second document ledger |
| `handover_type=issue` | implied by confirm on assignment row | Return type = CORE-06 peer |
| Dual-sign platform | — | **DENY invent DONE** — internal confirm stub only |

### 4.3 Conditional ALT — light `hrm_asset_handover` (NOT unlocked)

| Gate | Ruling |
|------|--------|
| Soft cols cover AC-CORE-05-04/05 + BR BB | **YES** → prefer soft cols · **light table HOLD** |
| Unlock light table later only if | Proven need for multi-issue BB history / separate return BB rows beyond status soft — then soft `assignment_id` · `handover_type` issue\|return · soft-delete `archived_at` · **DENY** Nest `/core` dual · **DENY** wipe soft cols already live |

### 4.4 Soft-delete / history doctrine (O7 · CORE-06 depends_on)

| Event | Rule | Expected |
|-------|------|----------|
| Issued row (`assigned` ever / confirm set) | Prefer PATCH `status` → `returned`/`lost`/`maintenance` | History retained for CORE-06 |
| Hard DELETE issued | **FORBIDDEN** without BA waiver | FAIL AC-CORE-05-08 |
| `archived_at` | **HOLD** — ADD only if status-only insufficient | No invent this seat |
| Confirm clear / re-issue | API may clear confirm flags with audit (sa mint) | **DENY** silent wipe history for CORE-06 |

### 4.5 Lifecycle (assignment + BB)

| From → To | Legal? | Notes |
|-----------|--------|-------|
| (create) → `assigned` · confirm NULL | YES | POST attach · Luồng #1–#2 |
| confirm NULL → confirm SET | YES | PATCH BB · Diễn biến #2 |
| `assigned` → `returned`/`lost`/`maintenance` | YES | Soft disposition · CORE-06 peer uses same rows |
| Claim «Đang sử dụng» without confirm when CFG on | **NO** (after residual live) | AC-CORE-05-05 · default CFG **on** |
| Hard DELETE issued sole path | **NO** | Soft status |
| Invent Asset master row | **NO** | OUT · stub OK |

**Invalid-transition outcome:** API 4xx deterministic (sa API-01 mint) — **no** silent 2xx.

---

## 5. Display-ready columns (Profile Tài sản list + «Đang sử dụng» gate)

### 5.1 Assignment SoT columns (bind from `employee_assets`)

| Display field | Physical | List | Detail |
|---------------|----------|------|--------|
| `id` | `id` | YES | YES |
| `employeeId` | `employee_id` | YES | YES |
| `companyId` | `company_id` | YES | YES |
| `assetName` | `asset_name` | YES | YES |
| `assetCode` | `asset_code` | YES | YES |
| `serialNumber` | `serial_number` | YES | YES |
| `category` | `category` | YES | YES |
| `assignedDate` | `assigned_date` | YES | YES |
| `returnDate` | `return_date` | optional | YES |
| `status` | `status` | YES | YES |
| `statusLabelVi` | derived | YES | YES |
| `condition` | `condition` | YES | YES |
| `notes` | `notes` | optional | YES |
| `brand` / `model` / `specifications` / `value` | LIVE | optional | YES |
| `createdAt` / `updatedAt` | audit | optional | YES |

### 5.2 BB confirm flags (display-ready — **ADD** when cols live)

| Display field | Physical / derive | Rule |
|---------------|-------------------|------|
| `handoverConfirmed` | `handover_confirmed_at IS NOT NULL` | Boolean gate for «Đang sử dụng» when CFG on |
| `handoverConfirmedAt` | `handover_confirmed_at` | vi-VN datetime display · null → `—` |
| `handoverConfirmedBy` | `handover_confirmed_by` | Actor id / label enrich optional |
| `handoverReceiverName` | `handover_receiver_name` | Optional |
| `handoverDocId` | `id` if confirmed else null | Paper F-CORE-AST-01 alias — **not** second SoT |

**«Đang sử dụng» / đang giữ filter (normative):**

| Layer | Rule |
|-------|------|
| Base filter | `status = 'assigned'` only |
| BB gate (CFG default **on** after residual live) | Row counts as fully «Đang sử dụng» for BR BB only when `handoverConfirmed=true` · unconfirmed may show CTA «Xác nhận nhận» — **DENY** claim BR DONE with notes-only |
| FE | **MUST NOT** invent Asset SoT / e-sign platform · bind display-ready only |

**Invariant CORE-05-DISP:** FE **MUST NOT** invent Asset master / kho from DTO.  
**Invariant CORE-05-BB-GATE:** notes free-text **≠** BB confirm · confirm flags required for AC-CORE-05-04/05.  
**Invariant CORE-05-PATH:** Network on Profile Tài sản **MUST** hit `/employees/:id/assets*` · Nest `/core` = **0**.

---

## 6. HOLD — LIVE assignment spine · catalog · serial index

| Object | Decision | Cite |
|--------|----------|------|
| Spine cols (`asset_code` · `serial_number` · `status` · `notes` · …) | **HOLD RETAIN** — no invent/change | O2 · ensureSchema AS-IS |
| Asset master / kho SKU catalog | **HOLD / OUT invent** | O5 · ADR §11 · AC-CORE-05-CAT-OUT |
| Serial unique index | **HOLD** | O6 · wire 409 first · R-CORE-05-CAT-SERIAL-01 |
| `archived_at` on assignment | **HOLD** | Prefer status soft |
| Light `hrm_asset_handover` primary | **HOLD** (ALT not unlocked) | §4.3 |
| Nest `/core` AST tables | **DENY** | O1 |

**Conditional UNLOCK:** light handover table / `archived_at` / serial unique index — **NOT** this seat unless later gap proven after soft cols + wire 409.

---

## 7. Validation matrix (data layer)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-CORE-AST-D01** | ADD ensureSchema | Soft cols `handover_confirmed_at` · `handover_confirmed_by` · optional `handover_receiver_name` on `employee_assets` | Persist path exists (after Dev) |
| **VAL-CORE-AST-D02** | Spine cols mutate «rename/drop» | HOLD | **FORBIDDEN** · FAIL O2 |
| **VAL-CORE-AST-D03** | Nest `/core` AST/handover table SoT | — | **FORBIDDEN** · FAIL O1 |
| **VAL-CORE-AST-D04** | Light `hrm_asset_handover` as primary this seat | — | **FORBIDDEN** · soft cols prefer |
| **VAL-CORE-AST-D05** | Confirm SET | PATCH | `handover_confirmed_at` NOT NULL · F5 còn |
| **VAL-CORE-AST-D06** | CFG BB required · status=assigned · confirm NULL | «Đang sử dụng» BR claim | **FAIL** AC until confirmed |
| **VAL-CORE-AST-D07** | notes-only without confirm path | BR BB | **≠** DONE · FAIL AC-CORE-05-06 |
| **VAL-CORE-AST-D08** | Non-empty serial already `assigned` in scope | POST/PATCH | **409** · no persist duplicate assigned |
| **VAL-CORE-AST-D09** | Empty serial | POST | Allowed |
| **VAL-CORE-AST-D10** | Serial unique index invent this seat | HOLD | **FORBIDDEN** unlock · wire first |
| **VAL-CORE-AST-D11** | Asset master/kho invent | OUT | **FORBIDDEN** |
| **VAL-CORE-AST-D12** | Hard DELETE issued | O7 | **FORBIDDEN** without waiver |
| **VAL-CORE-AST-D13** | List vs get-by-id OOS emp | U19 scope_parity | 404/403 — not empty mask |
| **VAL-CORE-AST-D14** | Seed assets/BB for U65 | — | **FAIL U65** |
| **VAL-CORE-AST-D15** | Invent CORE-06 / F-CORE-AST-02 DONE | O8 | **FORBIDDEN** |
| **VAL-CORE-05-MK-03** | Diff CORE-03 DOC/ET/CHK | must_keep | Intact · OBS P2 idle-ok · **≠** personnel |
| **VAL-CORE-05-MK-02B..01** | Diff EMP-CF / CTR / RD / C&B / public | must_keep | No wipe · no reopen sealed J-* |

---

## 8. Traceability (BRD/SRS → DB → API → FE → Test)

| Requirement | DB | API (next sa) | FE | Test / J-* |
|-------------|-----|---------------|----|------------|
| FR-05 Luồng #1–#2 attach | HOLD spine | **F-CORE-AST-01** RETAIN cite POST | Profile Tài sản Thêm | **J-HRM-CORE-05-01** DRAFT |
| Luồng #4 list đang giữ | `status=assigned` | GET assets | Filter «Đang sử dụng» | **J-01** · AC-CORE-05-02 |
| Diễn biến #2 BB confirm | **ADD** soft cols §4 | residual **F-CORE-AST-BB-01** PATCH confirm | Xác nhận nhận | **J-HRM-CORE-05-02** DRAFT |
| BR-BP-AST-01 BB | confirm flags | BB-01 + CFG gate | CTA / gate | AC-CORE-05-04/05 |
| Paper `handover_doc_id` | id when confirmed | DTO alias | Display | VAL-CORE-AST-D05 |
| Serial trùng | HOLD index · wire | POST/PATCH **409** | Toast conflict | **J-HRM-CORE-05-03** DRAFT |
| Soft vs hard delete | status soft | Prefer PATCH status | Thu hồi soft | **J-04** · AC-CORE-05-08 |
| CORE-06 thu hồi | same SoT | **F-CORE-AST-02** peer | — | **AC-CORE-05-06-OUT** ≠ DONE |
| Catalog master | OUT stub OK | no master API invent | category stub | AC-CORE-05-CAT-OUT |
| CORE-03 must_keep | DOC/ET/CHK DATA | F-CORE-CHK / EMP CAT | — | `CORE03QC1-MSLFJH0K` · OBS idle-ok |
| CORE-02b..01 must_keep | peer DATA | peer F-* | — | stamps · **≠** printable |
| Nest `/core` DENY | no dual table | physical `/employees/:id/assets*` | Network 0 | O1 · **J-05** |
| scope_parity U19 | company_id filter | list=get=patch=delete | deep link | VAL-CORE-AST-D13 |

**scope_parity:** Assets list under emp id **=** get/patch/delete asset under same `resolveHrmListScope` · group CEO `main` rollup must not 404 when list returned id.

---

## 9. Error / integrity mapping (RETAIN + residual)

| Physical / mutate fail | HTTP / code | Data outcome |
|------------------------|-------------|--------------|
| Serial already `assigned` in scope | 409 residual **`HRM-EMP-ASSET-SERIAL-CONFLICT`** (or synonym) | **no** persist duplicate |
| Scope mismatch | 409 `HRM-SCOPE-409` | **no** cross-CT |
| Asset / emp not found | 404 `HRM-EMP-PROFILE-404` | — |
| Success attach | 2xx `HRM-EMP-PROFILE-201` | row spine · confirm NULL |
| Success confirm BB | 2xx (API mint) | confirm cols set · F5 còn |
| Success status soft | 2xx `HRM-EMP-PROFILE-202` | history retained |
| Hard DELETE issued without waiver | **FAIL** policy | prefer status |
| Nest `/core` dual | — | **FORBIDDEN** |
| Sealed CORE-* | — | **DENY** rewrite |
| Seed for UF | — | **FAIL U65** |

---

## 10. DENY / must_keep / honesty

### DENY (this seat)

| Item | Why |
|------|-----|
| Invent/change LIVE assignment CRUD spine cols | HOLD · already LIVE |
| Nest `/core` AST or handover table / `@Controller('core')` SoT | O1 dual-SoT FAIL |
| Full Asset ledger / kho SKU / depreciation invent | O5 · ADR stub |
| Full e-sign / PKI platform DONE | O4 · GĐ1 confirm stub only |
| Light `hrm_asset_handover` as **primary** this seat | Soft cols prefer · ALT HOLD |
| Serial unique index unlock this seat | Wire 409 first · HOLD |
| Claim LIVE CRUD alone = FR-05 / BB / CORE-05 DONE | O4 · AC-CORE-05-06 |
| Claim CORE-03 = personnel UAT / EMP DOC L1 DONE | O9/O10 · C-SLICE |
| Invent CORE-06 / F-CORE-AST-02 DONE | O8 · depends_on |
| Invent CORE-07 activate DONE | peer OUT |
| Claim printable / closed-8 DONE | O10 · CORE-09d/09c |
| Wipe CORE-03 DOC/ET/CHK · wipe CORE-02b EMP-CF | must_keep |
| Flip honesty ready flags | honesty lock |
| Reopen sealed J-HRM-CORE-03-01..05 / 02B / 09D/09C/09B/09A/08/02/01 | seals |
| Seed assets/BB for U65 | U65 |
| `apps/**` / migrate run this seat | docs-only |

### must_keep RETAIN

| Stamp / surface | Retain |
|-----------------|--------|
| **`CORE03QC1-MSLFJH0K`** | DOC/ET/CHK physical · Nest `/core` 0 · **≠** personnel · **`R-CORE-03-CC-EMBED-OBS` P2 idle-ok** |
| **`EMPPLATQA-MSIZXHIM`** | DOC catalog L1 |
| **`EMPTOKQA-MSJ290VB`** | F-EMP-TOK smoke |
| **`CORE02BQC1-MSLEFQC1`** | EMP-CF · Nest `/core` 0 · **≠** personnel · FE P2 HOLD |
| **`CORE09DQC1-MSLDR8I3`** | TPL+clause · **≠ printable** · **≠ closed-8 DONE** |
| **`CORE09CQC1-MSLBXMUT`** | VER/PDF · **≠ printable UAT** |
| **`CORE09BQC1-MSLB05DZ`** | PACK+PREV ephemeral |
| **`CORE09AQC1-MSLA4LX9`** | CL body + snapshot |
| **`CORE08QC1-MSL9BFFE`** | RD dual + payroll_link |
| **`CORE02QC1-MSL80DU6`** | packages/eins · AuthZ/CB-403 |
| **`CORE01QC1-MSL6WMS7`** | public strip · Nest `/core` DENY |
| LIVE `employee_assets` spine + `/employees/:id/assets*` | F-CORE-AST-01 physical |
| Soft history for CORE-06 | same SoT rows · **≠** invent CORE-06 DONE |
| U19 scope_parity | list=get=mutate |

### Honesty (LOCKED false)

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| **`contracts_printable_ready`** | **false** · **DENY** flip |
| **`hrm_personnel_uat_ready`** | **false** · **DENY** flip |
| personnel / CORE / CTR module UAT | **false** |
| **C-SLICE-≠-MODULE** | GWC later ≠ module UAT ≠ personnel ready |
| Claim CRUD = CORE-05 / FR-05 DONE | **DENIED** |
| Claim CORE-03 = personnel UAT | **DENIED** |
| Claim CORE-06/07 / printable / closed-8 DONE | **DENIED** |

---

## 11. Risks & mitigation

| Risk | Mitigation |
|------|------------|
| Dev invents Nest `/core` AST dual | VAL-CORE-AST-D03 · O1 FAIL |
| Dev invents light handover table instead of soft cols | §4 prefer · VAL-CORE-AST-D04 |
| Dev mutates LIVE spine cols «while here» | §6 HOLD · VAL-CORE-AST-D02 |
| FE treats notes as BB DONE | VAL-CORE-AST-D07 · AC-CORE-05-06 |
| Serial index invent before wire | VAL-CORE-AST-D10 · HOLD |
| Claim CRUD = CORE-05 DONE without BB | O4 · honesty |
| Invent CORE-06 return as this seat | VAL-CORE-AST-D15 · O8 |
| Wipe CORE-03/02b / reopen printable | must_keep stamps · O9/O10 |
| Seed to pass BB / serial UF | VAL-CORE-AST-D14 · U65 |
| scope list≠get under `main` | VAL-CORE-AST-D13 · U19 |

---

## 12. Unlock next (governance)

| Next | Role | What |
|------|------|------|
| **`PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01`** | **sa** | **RETAIN cite** **F-CORE-AST-01** physical **`GET/POST/PATCH/DELETE /api/hrm/employees/:id/assets*`** · residual **F-CORE-AST-BB-01** confirm PATCH (flags ↔ DATA §4–§5) + «Đang sử dụng» gate · serial conflict **409** wire · paper `/core` **alias only** · DTO display-ready confirm flags · **DENY** Nest `/core` dual · Asset ledger invent · invent CORE-06 DONE · must_keep CORE-03..01 — **not** Dev invent |
| Dev | — | **HOLD** until API CONFIRMED |
| CORE-06 | board #22 | Remains **QUEUED** · **depends_on** CORE-05 SoT · **F-CORE-AST-02 OUT invent DONE** this seat |
| QA / J-* | later | Promote **J-HRM-CORE-05-01..05** after API+FE · U65 browser · **≠** auto-flip personnel |

---

## 13. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED** |
| **next_owner** | **sa** — API-01 RETAIN cite F-CORE-AST-01 + residual F-CORE-AST-BB-01 + serial 409 |
| **Dev** | **HOLD** until API CONFIRMED · **DENY** Nest `/core` · **DENY** wipe CORE-03/02b · **DENY** invent CORE-06 · **DENY** Asset ledger |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-DATA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-data-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-CORE-05
depends_on: DATA-01 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA Option A · R-CORE-05-HANDOVER-01 · R-CORE-05-CAT-SERIAL-01 · CORE03QC1-MSLFJH0K · CORE02BQC1-MSLEFQC1 · peer CORE09DQC1-MSLDR8I3..CORE01QC1-MSL6WMS7 · EMPPLATQA-MSIZXHIM · EMPTOKQA-MSJ290VB · R-CORE-03-CC-EMBED-OBS P2 idle-ok must_keep
spec_ref: F-CORE-AST-01 physical /employees/:id/assets* · residual F-CORE-AST-BB-01 · paper /core alias only · DATA soft cols handover_confirmed_* · serial 409 wire · CORE-06 F-CORE-AST-02 OUT invent DONE QUEUED depends_on

MISSION — API F.1 lock (docs-only · REQUIRED after DATA):
1) RETAIN cite F-CORE-AST-01 — GET/POST/PATCH/DELETE /api/hrm/employees/:id/assets* · DTO↔LIVE employee_assets spine · paper /core alias only · DENY Nest @Controller('core') AST SoT
2) ADD/UNLOCK residual F-CORE-AST-BB-01 — prefer PATCH …/assets/:assetId confirm flags (handover_confirmed_at/by · optional receiver_name) · map paper handover_doc_id = id when confirmed · «Đang sử dụng» gate CFG default on · DENY notes-only = BB DONE · DENY full e-sign invent
3) Serial residual — POST/PATCH non-empty serial already assigned in scope → 409 HRM-EMP-ASSET-SERIAL-CONFLICT (or synonym) · HOLD unique index
4) Soft-delete — prefer status returned/lost/maintenance · DENY hard DELETE issued without waiver · CORE-06 same SoT depends_on · DENY invent F-CORE-AST-02 DONE
5) Display-ready confirm flags for Profile Tài sản list · U19 list=get=mutate scope_parity
6) RETAIN must_keep CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d TPL+clause · 09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 · Nest /core DENY · R-CORE-03-CC-EMBED-OBS P2 idle-ok
7) DENY wipe CORE-03/02b · invent CORE-06/07 DONE · claim CORE-03=personnel · claim printable/closed-8 · honesty flip · reopen J-HRM-CORE-03-01..05 / 02B / 09D/09C/09B/09A/08/02/01 · seed · apps/**

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01.md · PASS_TO_PM · next Dev HOLD until API CONFIRMED
```

---

## 14. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | DATA-01 **CONFIRMED** for UC-BP-CORE-05: prefer **ADD** soft cols `handover_confirmed_at` · `handover_confirmed_by` · optional `handover_receiver_name` on LIVE **`public.employee_assets`** (gap **PROVEN** vs paper §3.8 / `handover_doc_id`) · paper `handover_doc_id` = assignment `id` when confirmed · light `hrm_asset_handover` **ALT HOLD** · assignment CRUD spine **HOLD RETAIN** · Asset master/kho **OUT** stub OK · serial unique index **HOLD** (wire 409 first) · soft status over hard DELETE · display-ready confirm flags + «Đang sử dụng» gate cited · CORE-06 **OUT invent DONE** (depends_on SoT) · CORE-03 DOC/ET/CHK **must_keep** (`CORE03QC1-MSLFJH0K` · OBS P2 idle-ok) · CORE-02b · CORE-09d..01 **must_keep** · Nest `/core` **DENIED** · full e-sign/Asset ledger **DENIED** · honesty false · C-SLICE · docs-only · unlock **sa API-01** F-CORE-AST-01 RETAIN + F-CORE-AST-BB-01 + serial 409. |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
| **residual** | API F-CORE-AST-BB-01 + serial 409 wire · J-05-02/03 DRAFT until live · CORE-06 peer QUEUED · personnel/printable flags HOLD · `R-CORE-03-CC-EMBED-OBS` P2 idle-ok · light handover ALT HOLD · archived_at HOLD |
