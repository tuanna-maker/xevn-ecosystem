# PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01 — API F.1 · F-CORE-SI-01 enrollment + F-CORE-SI-02 timeline + F-CORE-SI-03 actions RETAIN cite (Option A · wire-only if gap)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-23 seat **#25**) |
| **lane** | governance · sa |
| **change_mode** | **RETAIN cite** **F-CORE-SI-01** physical `/employee-insurances*` · **RETAIN cite** **F-CORE-SI-02** GET + `periods[]` · **RETAIN cite** **F-CORE-SI-03** `POST …/:id/actions` (`close\|stop\|suspend\|change_rate\|resume`) · paper `/core` **alias only** · Nest `@Controller('core')` **DENY** · **ADD residual wire ONLY if** closable gap proven · **prefer FE derive DISP** · **must_keep** CORE-09 printable false · CORE-07 GATE 409 · ACT-400 · Nest DENY · soft≠CORE-06 DONE · CORE-05/03/02b/09d..01 · **OUT invent** PAY AC-SI-TL-06 / ATT / printable / Word DONE · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** · **no schema invent** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED RETAIN** — F.1 physical Option A · enrollment + rate-period + actions **LIVE HOLD RETAIN** · closable schema gap **NOT proven** → **HOLD** invent · DISP `statusLabelVi` / `dd/MM/yyyy` **FE-derive OK** → unlock **prefer FE + QA** · optional **Dev-BE thin wire** `statusLabelVi` **ONLY if** FE cannot derive · **DENY** Dev invent endpoints / Nest `/core` / PAY / schema |
| **uc_ids** | `UC-BP-CORE-10` |
| **depends_on** | DATA-01 **CONFIRMED HOLD** · BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · **R-CORE-10-TL-01** · **R-CORE-10-SUSPEND** · **R-CORE-10-DISP** · **R-CORE-10-CAT-CITE** · **R-CORE-10-≠-DONE** · **R-CORE-10-PAY-06** OUT · printable **false** · QC **`CORE09QC1-MSLNBA89`** printable false · ≠ CORE-09 DONE · **`CORE07QC1-KZJTSHNT`** GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · soft≠DONE **`CORE06QC1-MSLID363`** · **`CORE05QC1-MSLGVT40`** · **`CORE03QC1-MSLFJH0K`** · **`CORE02BQC1-MSLEFQC1`** · peer **`CORE09DQC1-MSLDR8I3`..`CORE01QC1-MSL6WMS7`** |
| **ref_data** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md) — `employee_insurances` ONE SoT + append-only `hrm_insurance_rate_period` **HOLD RETAIN** · peer type/insurer cite ≠ DONE · display-ready DTO cite |
| **ref_ba** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01.md) · O1–O12 · AC-CORE-10-* · AC-SI-TL-01..06 · J-HRM-CORE-10-01..06 DRAFT |
| **ref_sa** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-SA-01.md) Option A · catalog≠DONE · CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 |
| **ref_core09_api** | [`PO-HRM-MVP-GD1-CORE-09-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-09-CLUSTER-API-01.md) — registry+PREV · printable **false** · ≠ CORE-09 DONE · **must_keep** |
| **ref_core07_api** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md) — activate GATE/ACT · **≠** CORE-07 DONE · **≠** conflate BH Hoạt động |
| **ref_core06_api** | [`PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01.md) — soft≠DONE |
| **ref_core05_api** | [`PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01.md) — AST/BB |
| **ref_core03_api** | [`PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01.md) — DOC/ET/CHK |
| **ref_core02b_api** | [`PO-HRM-MVP-GD1-CORE-02B-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-02B-CLUSTER-API-01.md) — EMP-CF |
| **ref_core02_api** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md) — packages / CB · PATCH contrib → change_rate redirect must_keep |
| **ref_core01_api** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md) — public strip · Nest `/core` DENY |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-10** · Luồng **#0a–#0f** · Diễn biến **#1–#5** · **AC-SI-TL-01..06** · **AC-SI-CAT** · **AC-SI-INR** · **BR-BP-SI-01** |
| **ref_paper_api** | **F-CORE-SI-01** · **F-CORE-SI-02** · **F-CORE-SI-03** · peers **F-SI-CAT-TYP/EFF** · **F-SI-CAT-INS-*/EFF** · must_keep **F-CORE-CTR-*** · **F-CORE-ACT-01** · Nest `@Controller('core')` **ABSENT** · paper `/core` alias only |
| **ref_adr** | ADR 4-pillar · Nest physical prefer · paper `/core` alias only · U19 scope parity list↔get↔actions · enrollment **ONE SoT** · append-only rate periods |
| **ref_code_cite** | `employee-insurances.controller` `@Controller('employee-insurances')` · `POST :insuranceId/actions` · `InsuranceActionDto` · `employee-insurances.service` `applyAction` / `getById` `periods[]` / `listPeriods` / `mapPeriod` · `insurance-enrollment-bridge` · Nest `@Controller('core')` **ABSENT** — **read-only cite** · **no** `apps/**` edit this seat |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · personnel / CORE / CTR / SI module UAT **false** · **C-SLICE** · U65 · **DENY** claim catalog alone = CORE-10 DONE · **DENY** claim enrollment CRUD alone = CORE-10 DONE · **DENY** claim LIVE actions alone = module DONE without J-* · **DENY** claim CORE-09/07/06 DONE · **DENY** invent PAY/ATT/printable/Word DONE · **DENY** conflate BH Hoạt động ↔ CORE-07 · honesty flip |
| **ba-data** | **ALREADY CONFIRMED HOLD** — this seat **does not** re-open schema invent · **DENY** Nest `/core` SI dual · **DENY** second history SoT |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN** |

---

## 1. Verdict — **CONFIRMED RETAIN**

| Decision | Stamp |
|----------|--------|
| Enrollment SoT | **ONE RETAIN** Nest **`public.employee_insurances`** on **`/api/hrm/employee-insurances*`** — **DENY** second enrollment · **DENY** Nest `/core` SI dual |
| **F-CORE-SI-01** | **RETAIN cite** LIVE `GET/POST/PATCH/DELETE …/employee-insurances*` · codes `HRM-EINS-*` · type KEY assert · **≠** CORE-10 DONE alone |
| **F-CORE-SI-02** | **RETAIN cite** LIVE `GET …/employee-insurances` · `GET …/:id` → **`periods[]`** · U65 timeline residual |
| **F-CORE-SI-03** | **RETAIN cite** LIVE `POST …/:id/actions` (`close\|stop\|suspend\|change_rate\|resume`) · append `hrm_insurance_rate_period` · **≠** module DONE without J-* |
| History | **RETAIN** append-only · close prior open · **DENY** silent overwrite |
| Catalog peers | **RETAIN cite** `si_insurance_type` / `si_insurer` (+ EFF) — **≠ CORE-10 DONE alone** |
| **R-CORE-10-DISP** | **FE-derive prefer** — `statusLabelVi` **ABSENT** on LIVE `mapRow`/`mapPeriod` · status/`period_status` LIVE · dates ISO text LIVE → FE `dd/MM/yyyy` + VI label · **HOLD** schema · optional thin BE wire **only if** FE blocked |
| Nest path | Physical `/employee-insurances*` · Nest `@Controller('core')` **ABSENT** — **DENY invent** |
| CORE-09 printable | **must_keep** · **`CORE09QC1-MSLNBA89`** · printable **false** · ≠ CORE-09 DONE |
| CORE-07 GATE/ACT | **must_keep** · **`CORE07QC1-KZJTSHNT`** · GATE **409** · ACT-**400** · Nest DENY · checklist≠DONE · free PATCH≠DONE · **≠** CORE-07 DONE · **DENY** conflate BH Hoạt động |
| CORE-06 soft≠DONE | **must_keep** · **`CORE06QC1-MSLID363`** |
| CORE-05 / 03 / 02b / 09d..01 | **must_keep** · **DENY reopen** sealed J-* |
| PAY / ATT / printable | **OUT invent DONE** · **AC-SI-TL-06** cite only · printable **false RETAIN** |
| Closable gap on LIVE SoT? | **NO schema** — spine PRESENT · DISP = derive · **no** invent endpoints |
| Unlock | **Prefer Dev-FE + QA** U65 journeys (**J-HRM-CORE-10-01..06**) · optional **Dev-BE** thin `statusLabelVi` wire **ONLY** · **HOLD** schema / Nest `/core` / PAY |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim catalog/CRUD/LIVE = CORE-10 DONE |

```text
  FE «Hồ sơ NV — tab Bảo hiểm · timeline Đóng/Ngừng/Tạm hoãn/Đổi mức/Resume» (U65 residual)
        │  Network MUST contain /employee-insurances
        │                  and /employee-insurances/:id/actions
        │  DENY Nest /core/* SI SoT · DENY invent PAY/ATT/printable/Word DONE
        │  DENY claim catalog / enrollment CRUD / LIVE actions alone = FR-10 DONE
        │  DENY conflate BH Hoạt động ↔ CORE-07 employee activate
        ▼
  F-CORE-SI-01     GET/POST/PATCH/DELETE /api/hrm/employee-insurances*
        → public.employee_insurances (HOLD RETAIN ONE SoT)
        → soft archived_at · type ∈ EFF · ≠ lifecycle DONE alone
        │
  F-CORE-SI-02     GET …/employee-insurances · GET …/:id
        → enrollment + periods[] (listPeriods / mapPeriod)
        → display: statusLabelVi (FE-derive) · effective_from/to dd/MM/yyyy · amounts
        │
  F-CORE-SI-03     POST …/employee-insurances/:id/actions
        → action ∈ close|stop|suspend|change_rate|resume
        → effective_from required · suspend_reason required on suspend
        → append hrm_insurance_rate_period · close prior open · denorm status
        → codes HRM-EINS-200 · HRM-SI-ACTION-400
        │
  Peers (paper /core alias only · ≠ CORE-10 DONE)
        F-SI-CAT-TYP/EFF  …/insurance-types* · /effective
        F-SI-CAT-INS-*/EFF …/insurers* · /effective
        │
  Residual DISP (prefer FE)
        statusLabelVi · dd/MM/yyyy — derive from status / period_status / ISO dates
        optional thin BE envelope ONLY if FE cannot derive · HOLD invent col
        │
        └─► must_keep CORE-09 printable false · CORE-07 GATE 409 · ACT-400 · Nest /core DENY
              · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE
              · CORE-05 AST/BB · CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · 09d..01
              · PAY AC-SI-TL-06 OUT · C-SLICE · honesty false
```

**Invariant CORE-10-PATH (O1):** SI Network **MUST** hit `/employee-insurances*` · Nest dual `/core` SI = **FAIL**.

**Invariant CORE-10-VOCAB (O3):** BH «Hoạt động» = enrollment `active` — conflate CORE-07 employee activate = **FAIL**.

**Invariant CORE-10-HISTORY (O4):** Silent overwrite prior period amounts/status as SoT = **FAIL** · F5 must keep prior + new.

**Invariant CORE-10-SUSPEND (O5):** `suspend` without `suspend_reason` still 2xx = **FAIL** · expect **400** `HRM-SI-ACTION-400`.

**Invariant CORE-10-≠-CAT-DONE (O6):** Claim type/insurer catalog alone = FR-10 / CORE-10 DONE = **FAIL**.

**Invariant CORE-10-≠-ENR-DONE (O7):** Claim enrollment CRUD alone = CORE-10 DONE = **FAIL**.

**Invariant CORE-10-≠-LIVE-DONE (O8):** Claim LIVE actions/panel alone = module DONE without U65 J-* = **FAIL**.

**Invariant CORE-10-PAY-06-OUT (O9):** Invent PAY DONE / claim AC-SI-TL-06 PASS as this seat DONE = **FAIL**.

**Invariant CORE-10-≠-PRINTABLE (O10):** Flip `contracts_printable_ready` / claim printable / Word invent = **FAIL**.

**Invariant CORE-10-MK-09/07/06 (O10):** Wipe / reopen sealed peers / claim CORE-09/07 DONE / soft=CORE-06 DONE = **FAIL**.

**Invariant CORE-10-SCOPE (U19):** list = get-by-id = actions — same hrm list-scope family — OOS → 404/403/409 · not empty-mask.

**Invariant CORE-10-DATA-HOLD:** Enrollment / rate_period / catalogs **HOLD RETAIN** — **DENY** schema invent this wave.

**Invariant CORE-10-DISP:** FE invent PAY/printable flip from DTO alone = **FAIL** · missing `statusLabelVi` may be FE-derive **or** thin BE wire — **not** typed col invent.

---

## 2. AS-IS Nest baseline → residual gap

| Surface | LIVE (read-only cite 2026-08-09) | Gap vs F.1 this seat |
|---------|----------------------------------|----------------------|
| `GET/POST/PATCH/DELETE …/employee-insurances*` | LIVE `EmployeeInsurancesController` `@Controller('employee-insurances')` · list/create/get/patch/delete · `HRM-EINS-*` | **RETAIN** F-CORE-SI-01 · **≠** FR-10 DONE alone |
| `GET …/:id` → `periods[]` | LIVE `getById` → `listPeriods` / `mapPeriod` | **RETAIN** F-CORE-SI-02 |
| `POST …/:id/actions` | LIVE `applyAction` · `InsuranceActionDto` close\|stop\|suspend\|change_rate\|resume | **RETAIN** F-CORE-SI-03 · U65 fidelity residual |
| Append history | LIVE close prior open + INSERT `hrm_insurance_rate_period` | **RETAIN** · **DENY** overwrite SoT |
| `suspend_reason` required | LIVE ACTION-400 when suspend missing reason | **RETAIN** R-CORE-10-SUSPEND |
| `effective_from` required | LIVE ACTION-400 when missing | **RETAIN** |
| PATCH contrib as history | LIVE redirect `HRM-CORE-CB-VAL-400` + path_hint actions | **must_keep** CORE-02 |
| **`statusLabelVi`** | mapRow/mapPeriod grep **ABSENT** | **R-CORE-10-DISP** — FE-derive prefer · **HOLD** invent col |
| `effective_from/to` | LIVE `::text` ISO on periods | FE format **`dd/MM/yyyy`** · **HOLD** typed locale col |
| amounts | LIVE `employee_amount` / `employer_amount` (+ rate_pct) | FE vi-VN grouping · **DENY** invent PAY engine |
| Type / insurer catalogs | Nest peers + EFF · KEY assert | **RETAIN cite peer** · **≠** CORE-10 DONE |
| Nest `@Controller('core')` | **ABSENT** · CoreModule = DB only | **DENY invent** |
| PAY AC-SI-TL-06 | Peer | **OUT invent DONE** |
| Source cite | `employee-insurances.controller.ts` · `employee-insurances.service.ts` (`applyAction` · `getById` · `listPeriods`) · `insurance-action.dto.ts` · `insurance-enrollment-bridge.ts` | Docs-only this seat |

**FORBIDDEN invent this seat (docs):** Nest `@Controller('core')` · second enrollment/history SoT · invent PAY/ATT/printable/Word DONE · claim catalog/CRUD/LIVE = CORE-10 DONE · claim CORE-09/07 DONE · soft=CORE-06 DONE · conflate BH↔CORE-07 · wipe peers · reopen sealed J-* · seed · honesty flip · `apps/**` · Dev invent endpoints/schema.

---

## 3. Path & alias lock (O1)

| Plane | Path |
|-------|------|
| **PHYSICAL enrollment (F-CORE-SI-01)** | **`GET/POST/PATCH/DELETE /api/hrm/employee-insurances*`** |
| **PHYSICAL timeline (F-CORE-SI-02)** | **`GET /api/hrm/employee-insurances`** · **`GET …/employee-insurances/:insuranceId`** (+ `periods[]`) |
| **PHYSICAL actions (F-CORE-SI-03)** | **`POST /api/hrm/employee-insurances/:insuranceId/actions`** |
| **PHYSICAL type catalog peer** | **`…/insurance-types*`** · **`/effective`** — **≠** CORE-10 DONE |
| **PHYSICAL insurer catalog peer** | **`…/insurers*`** · **`/effective`** — **≠** CORE-10 DONE |
| **PHYSICAL CORE-07 must_keep** | **`POST /api/hrm/employees/:id/activate`** — **≠** conflate / claim CORE-07 DONE |
| **PHYSICAL CORE-09 must_keep** | **`/contracts-insurance/contracts*`** (+ PREV/VER) — printable **false** |
| **LOGICAL (paper)** | `/api/hrm/core/…/insurance*` — **alias only** |
| Rule | Client/docs **may** keep paper names; runtime **physical only**. |
| QA Network assert | Path **contains** `/employee-insurances` for SI family — **FAIL O1** if FE hits Nest `/core/*` as second SI SoT |

| Paper / logical | Physical | DB (DATA-01) |
|-----------------|----------|--------------|
| F-CORE-SI-01 `/core/…/insurance` | `/employee-insurances*` | `employee_insurances` **HOLD RETAIN** |
| F-CORE-SI-02 timeline | `GET …/employee-insurances*` · `GET …/:id` | enrollment + `hrm_insurance_rate_period` |
| F-CORE-SI-03 actions | `POST …/:id/actions` | append period + denorm status |
| F-SI-CAT-TYP/EFF | `/insurance-types*` | `si_insurance_type` peer cite ≠ DONE |
| F-SI-CAT-INS-*/EFF | `/insurers*` | `si_insurer` peer cite ≠ DONE |
| F-CORE-ACT-01 | `/employees/:id/activate` | CORE-07 **must_keep** · ≠ BH Hoạt động |
| F-CORE-CTR-* | `/contracts-insurance/*` | CORE-09 **must_keep** · printable false |
| PAY / ATT | — | **OUT invent DONE** |

---

## 4. F-CORE-SI-01 — F.1 RETAIN cite (enrollment CRUD)

### 4.1 Header

| | |
|--|--|
| **Function ID** | **F-CORE-SI-01** |
| **METHOD / path (physical)** | **`GET/POST /api/hrm/employee-insurances`** · **`GET/PATCH/DELETE …/employee-insurances/:insuranceId`** |
| **Paper alias** | `/api/hrm/core/…/insurance*` — **alias only** |
| **change_mode** | **RETAIN cite** paper overlay · LIVE Nest SoT **HOLD RETAIN** |
| **Table** | **`public.employee_insurances`** (ONE SoT · soft `archived_at`) |

### 4.2 Mục đích

Cấp API vật lý gắn người với bảo hiểm (loại ∈ EFF · nhà BH · số sổ · ngày · mức đóng denorm · trạng thái enrollment): tạo/sửa/list/get/soft-delete phục vụ SRS **FR-UC-BP-CORE-10** gắn người / Luồng catalog→enrollment — **không** thay Nest `/core` SI SoT; **không** claim enrollment CRUD alone = FR-10 / CORE-10 DONE; **không** thay lifecycle actions (F-CORE-SI-03); **không** conflate status `active` với CORE-07 employee activate.

### 4.3 Nghiệp vụ xử lý

1. **Khóa phạm vi (U19):** resolve enrollment/employee trong **same** employee-insurances / hrm list-scope family · miss/OOS → **`HRM-EINS-404`** / **`HRM-SCOPE-409`** — **không** empty-mask list≠get.
2. **Create/Update:** validate type ∈ EFF (**`HRM-INS-TYPE-KEY`**) · insurer KEY peer when provided (**`HRM-INS-INSURER-KEY`**) · date rules · soft-archive prefer.
3. **List/get:** return enrollment fields; get-by-id **also** attaches `periods[]` (F-CORE-SI-02).
4. **Delete:** soft prefer (`archived_at`) — **DENY** hard-purge history periods for AC cheat.
5. **Đổi mức:** **DENY** silent PATCH contribution as history SoT — redirect **`HRM-CORE-CB-VAL-400`** → `POST …/actions` `change_rate` (CORE-02 must_keep).
6. **Honesty:** 2xx CRUD **≠** CORE-10 module DONE without lifecycle U65 J-* · footer **enrollment CRUD ≠ CORE-10 DONE**.

### 4.4 Tham chiếu bước SRS

| API | UC / Diễn biến | BA AC / J-* |
|-----|----------------|-------------|
| GET/POST/PATCH enrollment | FR-10 Luồng gắn người · #0b/#0e | **AC-CORE-10-≠-ENR-DONE** · peer load |
| Nest `/core` 0 | O1 | **AC-CORE-10-01** · **AC-CORE-10-H** |
| CRUD alone ≠ DONE | O7 | **AC-CORE-10-≠-ENR-DONE** · **J-HRM-CORE-10-06** footer |

### 4.5 Request / Response ↔ DB (DATA-01 HOLD)

| DTO field | DB / source | Notes |
|-----------|-------------|-------|
| `id` | `employee_insurances.id` | actions target |
| `company_id` / `employee_id` | cols | U19 |
| `type` · `provider` | cols | type/insurer KEY assert peers |
| `policy_number` · `policy_id` · `si_number` | cols | RETAIN |
| `start_date` · `end_date` | cols | display `dd/MM/yyyy` |
| `contribution` · `employer_contribution` | cols | denorm list UX · **≠** history SoT |
| `status` | `active\|closed\|stopped\|suspended` | BH Hoạt động = `active` enrollment |
| **`statusLabelVi`** | derived | residual DISP · e.g. «Hoạt động» / «Đã đóng» / «Ngừng» / «Tạm hoãn» — **≠** CORE-07 |
| `notes` · `archived_at` | cols | soft-delete |
| `periods[]` | via get-by-id | F-CORE-SI-02 |

**DENY** invent Nest `/core` enrollment · second enrollment store · claim CRUD = FR-10 DONE · conflate CORE-07.

### 4.6 Lỗi nghiệp vụ (RETAIN)

| Condition | HTTP / code | Outcome |
|-----------|-------------|---------|
| Not found / OOS | 404 `HRM-EINS-404` | no mask |
| Scope mismatch | 409 `HRM-SCOPE-409` | no cross-CT |
| Type / insurer KEY | 4xx `HRM-INS-TYPE-KEY` / `HRM-INS-INSURER-KEY` | no free-text SoT |
| PATCH contrib as rate SoT | 400 `HRM-CORE-CB-VAL-400` + path_hint actions | must_keep CORE-02 |
| Create/update success | 2xx `HRM-EINS-*` | F5 còn · **≠** FR-10 DONE alone |
| Nest `/core` dual invent | FAIL O1 | dual SoT rejected |

---

## 5. F-CORE-SI-02 — F.1 RETAIN cite (timeline GET + periods[])

### 5.1 Header

| | |
|--|--|
| **Function ID** | **F-CORE-SI-02** |
| **METHOD / path (physical)** | **`GET /api/hrm/employee-insurances`** · **`GET /api/hrm/employee-insurances/:insuranceId`** |
| **Paper alias** | `/api/hrm/core/…/insurance*` — **alias only** |
| **change_mode** | **RETAIN cite** · LIVE periods attach |
| **Tables read** | `employee_insurances` · `hrm_insurance_rate_period` (append-only history) |

### 5.2 Mục đích

Cấp API mở timeline BH của NV: list enrollment trong scope + get-by-id kèm **`periods[]`** (lịch sử mức/trạng thái) — phục vụ SRS **FR-UC-BP-CORE-10 Diễn biến #1 / #4** · **AC-SI-TL-05** baseline/F5 — **không** Nest `/core` dual; **không** FE invent second history store; **không** claim timeline load alone = module DONE.

### 5.3 Nghiệp vụ xử lý

1. **U19:** list/get same scope resolver · id from list **must** load.
2. **List:** enrollments `archived_at IS NULL` · optional `employee_id` filter · denorm status/amounts for list UX.
3. **Get-by-id:** enrollment + `listPeriods` ordered by `effective_from` · exclude archived periods.
4. **Display-ready (O11):** expose / allow FE bind `periods[]` · `statusLabelVi` · `effective_from`/`effective_to` as **`dd/MM/yyyy`** · `suspend_reason` · amounts (vi-VN) — **cấm** raw key as primary label · **cấm** ISO as primary UI · **cấm** invent PAY.
5. **Honesty:** GET 200 **≠** CORE-10 module DONE · footer catalog/CRUD/LIVE ≠ DONE.

### 5.4 Tham chiếu bước SRS

| API | UC / Diễn biến | BA AC / J-* |
|-----|----------------|-------------|
| Mở timeline | Diễn biến **#1** · Luồng #1 | **AC-CORE-10-LOAD** · **AC-CORE-10-01** · **J-HRM-CORE-10-01** |
| F5 history | Diễn biến **#4** · **AC-SI-TL-05** | **AC-CORE-10-F5** · **J-06** |
| Display-ready | O11 | **AC-CORE-10-DISP** · **R-CORE-10-DISP** |

### 5.5 Request / Response ↔ DATA-01

| DTO field | LIVE cite | Notes |
|-----------|-----------|-------|
| enrollment fields | `mapRow` | status · amounts denorm |
| **`periods[]`** | `listPeriods` → `mapPeriod` | Bind timeline · F5 prior+new |
| period.`effective_from` / `effective_to` | LIVE `::text` | FE **`dd/MM/yyyy`** |
| period.`suspend_reason` | LIVE | Show when suspended |
| period.`employee_amount` / `employer_amount` · rate_pct | LIVE | vi-VN · **≠** PAY DONE |
| period.`period_status` / `action` | LIVE | Align close/stop/suspend/change_rate/resume |
| **`statusLabelVi`** | **ABSENT** map | residual **R-CORE-10-DISP** FE-derive |

### 5.6 Lỗi nghiệp vụ (RETAIN)

| Condition | HTTP / code | Outcome |
|-----------|-------------|---------|
| List/get OK | 200 `HRM-EINS-200` | periods visible · Nest `/core` 0 |
| Not found / OOS | 404 `HRM-EINS-404` | no mask |
| Scope | `HRM-SCOPE-409` | no leak |
| Lost history after F5 | FAIL AC-SI-TL-05 | append-only must_keep |

---

## 6. F-CORE-SI-03 — F.1 RETAIN cite (lifecycle actions)

### 6.1 Header

| | |
|--|--|
| **Function ID** | **F-CORE-SI-03** |
| **METHOD / path (physical)** | **`POST /api/hrm/employee-insurances/:insuranceId/actions`** |
| **Paper alias** | `/api/hrm/core/…/insurance/:id/actions` — **alias only** |
| **change_mode** | **RETAIN cite** · LIVE `applyAction` · **DENY** invent second action API |
| **Tables write** | append **`public.hrm_insurance_rate_period`** · denorm **`employee_insurances.status`** (+ amount denorm on change_rate) |

### 6.2 Mục đích

Cấp API lifecycle BHXH trên enrollment: **Đóng / Ngừng / Tạm hoãn / Đổi mức / Resume** kèm ngày hiệu lực — append dòng lịch sử mới, đóng period mở trước — phục vụ SRS **FR-UC-BP-CORE-10 Diễn biến #2–#3** · **AC-SI-TL-01..04** (+ resume) · **BR-BP-SI-01** — **không** silent overwrite history; **không** Nest `/core` dual; **không** claim LIVE actions alone = module DONE without U65 J-*.

### 6.3 Nghiệp vụ xử lý

1. **U19:** load enrollment in scope · miss → EINS-404 / SCOPE-409.
2. **Validate body:** `action ∈ close|stop|suspend|change_rate|resume` · **`effective_from` required** → else **400** `HRM-SI-ACTION-400`.
3. **Suspend branch:** `suspend_reason` **required** when `action=suspend` → else **400** `HRM-SI-ACTION-400` · **DENY** silent 2xx.
4. **Append-only:** close prior open period (`effective_to`) · INSERT new `hrm_insurance_rate_period` with `action` · `period_status` · amounts/rates · `suspend_reason` when applicable — **DENY** UPDATE prior amounts as history SoT.
5. **Status map (LIVE):** `close`→enrollment `closed` · `stop`→`stopped` · `suspend`→`suspended` · `change_rate`→keep (unless already suspended) · `resume`→`active` — **DENY** conflate with CORE-07 activate.
6. **Return:** enrollment + refreshed `periods[]` (same as get-by-id shape preferred).
7. **Honesty:** 2xx actions **≠** CORE-10 module DONE without J-* pack · footer **LIVE ≠ module DONE**.

### 6.4 Tham chiếu bước SRS

| API / action | UC / Diễn biến | BA AC / J-* |
|--------------|----------------|-------------|
| `close` | Diễn biến **#2** · **AC-SI-TL-01** | **AC-CORE-10-CLOSE** · **J-HRM-CORE-10-02** |
| `stop` | Diễn biến **#2** · **AC-SI-TL-02** | **AC-CORE-10-STOP** · **J-03** |
| `suspend` (+ căn cứ) | Diễn biến **#2–#3** · **AC-SI-TL-03** | **AC-CORE-10-SUSPEND*** · **J-04** |
| `change_rate` | Diễn biến **#2** · **AC-SI-TL-04** | **AC-CORE-10-RATE** · **J-05** |
| `resume` + F5 | Diễn biến **#4** · **AC-SI-TL-05** | **AC-CORE-10-RESUME/F5** · **J-06** |
| Vocab BH≠CORE-07 | O3 | **AC-CORE-10-VOCAB** |
| LIVE ≠ DONE | O8 | **AC-CORE-10-≠-LIVE-DONE** |
| PAY read | Diễn biến **#5** · **AC-SI-TL-06** | **AC-CORE-10-PAY-06-OUT** · **OUT invent** |

### 6.5 Request / Response ↔ DATA-01

| DTO field | LIVE cite | Notes |
|-----------|-----------|-------|
| `company_id` | `InsuranceActionDto` | U19 |
| `action` | enum LIVE | VI: Đóng/Ngừng/Tạm hoãn/Đổi mức/Tiếp tục |
| `effective_from` | required | date · display `dd/MM/yyyy` |
| `suspend_reason` | required if suspend | ACTION-400 if missing |
| `employee_amount` / `employer_amount` · rate_pct | optional | change_rate |
| `change_reason` | optional | audit |
| Response enrollment + `periods[]` | `applyAction` → reload | F5 parity |

### 6.6 Lỗi nghiệp vụ (RETAIN)

| Condition | HTTP / code | Outcome |
|-----------|-------------|---------|
| Action OK | 200 `HRM-EINS-200` | period append · F5 prior+new · **≠** module DONE |
| Missing `effective_from` | 400 `HRM-SI-ACTION-400` | no write |
| Suspend missing căn cứ | 400 `HRM-SI-ACTION-400` | no write |
| Invalid date | 400 `HRM-SI-ACTION-400` | deterministic |
| Not found / OOS | 404 `HRM-EINS-404` / 409 scope | no mask |
| Silent overwrite history | FAIL O4 | append-only must_keep |
| Nest `/core` dual | FAIL O1 | rejected |

---

## 7. Peers type / insurer / CTR / ACT — RETAIN cite (paper `/core` alias only)

| Function | Physical (normative) | Rule |
|----------|----------------------|------|
| **F-SI-CAT-TYP/EFF** | `…/insurance-types*` · `/effective` | **RETAIN cite peer** · `HRM-INS-TYPE-KEY` · **≠ CORE-10 DONE** (O6) |
| **F-SI-CAT-INS-*/EFF** | `…/insurers*` · `/effective` | **RETAIN cite peer** · `HRM-INS-INSURER-KEY` · **≠ CORE-10 DONE** |
| **F-CORE-CTR-*** | `/contracts-insurance/*` | **must_keep** CORE-09 · printable **false** · stamp **`CORE09QC1-MSLNBA89`** · ≠ CORE-09 DONE |
| **F-CORE-ACT-01** | `POST /employees/:id/activate` | **must_keep** CORE-07 · GATE **409** · ACT-**400** · Nest DENY · stamp **`CORE07QC1-KZJTSHNT`** · **≠** conflate BH Hoạt động · ≠ CORE-07 DONE |
| **F-CORE-AST / CHK / EMP-CF / …** | peers 06/05/03/02b/09d..01 | **must_keep** · **DENY wipe** |
| **PAY / ATT** | peers | **OUT invent DONE** · AC-SI-TL-06 cite only |

**Footer every evidence:** **catalog ≠ CORE-10 DONE** · **enrollment CRUD ≠ DONE** · **LIVE ≠ module DONE without J-*** · **printable false RETAIN** · **BH ≠ CORE-07** · **PAY-06 OUT**.

**Paper rule:** any `/api/hrm/core/…` cite for SI = **alias / DOC-DELTA only** — Nest `@Controller('core')` **ABSENT** · **DENY invent**.

---

## 8. Residual — display-ready DISP (**R-CORE-10-DISP**)

### 8.1 Header

| | |
|--|--|
| **Residual ID** | **R-CORE-10-DISP** |
| **BA** | O11 display-ready |
| **change_mode** | **prefer FE derive** · **ADD residual BE wire ONLY if** FE blocked · **HOLD** invent typed col |
| **Closable schema?** | **NO** — status/`period_status`/ISO dates/amounts/`suspend_reason`/`periods[]` **PRESENT** |

### 8.2 Mục đích

Đảm bảo FE bind nhãn VI + ngày `dd/MM/yyyy` + amounts vi-VN trên timeline mà không dùng raw key / ISO làm primary — **không** schema invent; **không** invent PAY; **không** claim DISP alone = CORE-10 DONE.

### 8.3 Nghiệp vụ xử lý

1. Map enrollment `status` → VI (`active`→«Hoạt động» · `closed`→«Đã đóng» · `stopped`→«Ngừng» · `suspended`→«Tạm hoãn») — **DENY** use as CORE-07 employee Hoạt động.
2. Map `period_status` / `action` → VI on timeline rows.
3. Format `effective_from`/`effective_to` → **`dd/MM/yyyy`** for display/entry; parse plain on submit.
4. Show `suspend_reason` on suspended rows; amounts with **vi-VN** thousand grouping.
5. Prefer **FE derive** from LIVE fields; optional **thin BE** `statusLabelVi` on existing list/get/actions envelopes **only if** FE evidence proves cannot derive safely — **DENY** invent new endpoint / Nest `/core` / typed locale col.

### 8.4 Tham chiếu

| Step | SRS / BA | AC |
|------|----------|-----|
| Display-ready | O11 | **AC-CORE-10-DISP** · FE bind |
| ≠ DONE | O6/O7/O8/O10 | **≠-CAT/ENR/LIVE-DONE** · **AC-CORE-10-H** · **AC-CORE-10-VOCAB** |

---

## 9. U19 scope parity

| Surface | Same resolver family |
|---------|----------------------|
| `GET …/employee-insurances` list | employee-insurances + `resolveHrmListScope` / membership |
| `GET …/:id` (+ `periods[]`) | same |
| `POST …/:id/actions` | same company/enrollment scope |
| type/insurer EFF pickers | tenant/company effective catalogs (peer) |

**FAIL:** list returns id that get/actions 404-masks · or FE uses Nest `/core` second SI SoT · or cross-CT action.

---

## 10. Must_keep · honesty · DENY matrix

| Stamp / rule | Action |
|--------------|--------|
| **`CORE09QC1-MSLNBA89`** | printable **false** · fill/registry/PREV/VER · ≠ CORE-09 DONE · **DENY wipe** · **DENY** invent printable/Word DONE |
| **`CORE07QC1-KZJTSHNT`** | GATE **409** · ACT-**400** · Nest DENY · checklist≠DONE · free PATCH≠DONE · **≠** CORE-07 DONE · **DENY** conflate BH Hoạt động |
| **`CORE06QC1-MSLID363`** | soft≠DONE · **DENY** claim soft=CORE-06 DONE |
| **`CORE05QC1-MSLGVT40`** · **`CORE03QC1-MSLFJH0K`** · **`CORE02BQC1-MSLEFQC1`** | AST/BB · DOC/ET/CHK · EMP-CF **must_keep** |
| **`CORE09DQC1-MSLDR8I3`..`CORE01QC1-MSL6WMS7`** | peers **must_keep** · **DENY reopen** sealed J-* |
| Nest `/core` | **DENY invent** dual |
| Catalog / CRUD / LIVE alone = CORE-10 DONE | **DENIED** |
| PAY / ATT / printable / Word | **OUT invent DONE** · printable **false RETAIN** · AC-SI-TL-06 cite only |
| Honesty flags | all **false** · **C-SLICE** · **DENY** flip |
| Seed / `apps/**` | **DENY** this seat |

---

## 11. Unlock & next_owner

| Lane | Unlock? | Scope |
|------|---------|-------|
| **Dev-FE** | **YES prefer** | Profile BH timeline bind · actions panel · DISP derive · Nest `/core` 0 · vocab BH≠CORE-07 · footer ≠DONE · printable false · CORE-09/07 RETAIN smoke |
| **QA** | **YES prefer** | **J-HRM-CORE-10-01..06** browser U65 · AC-SI-TL-01..05 · Network physical path · ACTION-400 suspend · F5 history · Nest `/core` 0 · ≠ catalog/CRUD/LIVE DONE · PAY-06 OUT · CORE-09/07 must_keep |
| **Dev-BE** | **OPTIONAL thin ONLY** | **R-CORE-10-DISP** `statusLabelVi` on existing list/get/actions envelopes — **HOLD** invent endpoints/schema/Nest `/core`/PAY |
| **ba-data** | **HOLD** | DATA-01 already CONFIRMED HOLD |
| **PAY / ATT** | **OUT invent DONE** | AC-SI-TL-06 cite only |

**Prefer rule:** PM dispatch **FE-01 + QA-01** first. Dispatch **BE-01** only if FE cannot safely derive DISP and residual is proven in FE evidence — **not** Dev invent.

---

## 12. Completion / handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN** |
| **next_owner** | **pm** → **dev-fe** + **qa** (prefer) · **dev-be** only if `R-CORE-10-DISP` wire required |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01.md` |
| **completion_report** | See §13 + response handoff |

---

## 13. Options rejected (this seat)

| Option | Why REJECT |
|--------|------------|
| **B** Nest `/core` dual SI + wipe enrollment / second history | Violates O1/O4 · wipe risk peers · honesty |
| **C** Claim catalog / CRUD / LIVE = CORE-10 DONE · invent PAY · honesty flip | Violates O6/O7/O8/O9/O10 · C-SLICE |
| Schema invent statusLabelVi typed col / locale date col | DATA HOLD · DISP = FE-derive / thin wire |
| Invent PAY AC-SI-TL-06 DONE · ATT/printable/Word DONE | OUT invent |
| Reopen CORE-09/07/06/05/03/02B/09D..01 · claim CORE-09/07 DONE · soft=CORE-06 DONE | must_keep seals |
| Conflate BH Hoạt động ↔ CORE-07 | VOCAB lock O3 |

---

## 14. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-10-CLUSTER-FE-01 (+ QA-01 parallel)
role: dev-fe (+ qa)
lane: execution
entry_criteria:
  - API RETAIN CONFIRMED: docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01.md
  - DATA HOLD: docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md
  - BA O1–O12: docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01.md
  - must_keep CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT GATE 409 · ACT-400 · Nest /core DENY · soft≠CORE-06 DONE
  - NO apps/** invent Nest /core · NO seed · U65 · HOLD schema · PAY AC-SI-TL-06 OUT invent DONE
mission_FE:
  Bind Profile BH timeline to physical GET/POST …/employee-insurances* + POST …/:id/actions
  Derive statusLabelVi + dd/MM/yyyy + amounts vi-VN from LIVE DTO (R-CORE-10-DISP) — DENY raw key / ISO primary
  Vocab: BH Hoạt động = enrollment active — DENY conflate CORE-07 activate
  Explicit footers: catalog ≠ CORE-10 DONE · enrollment CRUD ≠ DONE · LIVE ≠ module DONE without J-*
  DENY invent PAY/ATT/printable/Word · wipe peers · honesty flip
mission_QA:
  Execute J-HRM-CORE-10-01..06 DRAFT browser U65 · AC-SI-TL-01..05
  Assert Network physical /employee-insurances* · Nest /core SI = 0
  Assert suspend thiếu căn cứ → 400 HRM-SI-ACTION-400 · F5 prior+new periods
  Footer honesty false · printable false · PAY-06 OUT · CORE-09/07 RETAIN ≠ DONE · BH≠CORE-07
exit_criteria:
  - FE READY_FOR_QA · QA evidence path · PASS_TO_PM · C-SLICE only · ≠ claim CORE-10 module DONE
  - Dev-BE ONLY if FE proves statusLabelVi cannot derive (thin wire on existing envelopes)
evidence_path_FE: docs/qa/evidence/po-hrm-mvp-gd1-core-10-cluster-fe-01.md
evidence_path_QA: docs/qa/evidence/po-hrm-mvp-gd1-core-10-cluster-qa-01.md
ack_status target: READY_FOR_QA (FE) / PASS_TO_PM (QA)
```

---

*sa · Wave-23 · UC-BP-CORE-10 · 2026-08-09 · CONFIRMED RETAIN · prefer FE+QA · no apps/** · no seed*
