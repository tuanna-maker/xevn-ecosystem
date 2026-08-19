# PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN LIVE `employee_insurances` + append-only `hrm_insurance_rate_period` + peer SI catalogs (Option A · ba-data HOLD)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-23 seat **#25**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **no** invent/change LIVE `public.employee_insurances` enrollment ONE SoT · **HOLD RETAIN** `public.hrm_insurance_rate_period` append-only · **DENY** overwrite / second history SoT · **HOLD · cite peer** `si_insurance_type` / `si_insurer` — catalog **≠** CORE-10 DONE alone · **DENY wipe** · **NO** Nest `/core` table dual · **NO** wipe CORE-09 printable false · **NO** wipe CORE-07 GATE 409 / ACT-400 · **NO** wipe CORE-06 soft≠DONE · **NO** wipe CORE-05/03/02b/09d..01 · **NO** invent PAY / ATT / printable / Word DONE · **NO CODE** `apps/**` · **no migrate invent** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED HOLD** — enrollment + rate-period spine **already LIVE** · catalog peers **RETAIN cite** · typed-col gap for DISP **NOT proven** → **NOT unlock** schema · unlock **sa API-01** RETAIN cite **F-CORE-SI-01/02/03** — residual wire **ONLY if** closable gap proven · **PAY AC-SI-TL-06 OUT invent DONE** |
| **uc_ids** | `UC-BP-CORE-10` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · **R-CORE-10-TL-01** · **R-CORE-10-SUSPEND** · **R-CORE-10-DISP** · **R-CORE-10-CAT-CITE** · **R-CORE-10-≠-DONE** · **R-CORE-10-PAY-06** OUT · **R-CORE-10-HONESTY** · **R-CORE-10-PRINTABLE** false RETAIN · QC **`CORE09QC1-MSLNBA89`** printable false · ≠ CORE-09 DONE · **`CORE07QC1-KZJTSHNT`** GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · soft≠DONE **`CORE06QC1-MSLID363`** · **`CORE05QC1-MSLGVT40`** · **`CORE03QC1-MSLFJH0K`** · **`CORE02BQC1-MSLEFQC1`** · peer **`CORE09DQC1-MSLDR8I3`..`CORE01QC1-MSL6WMS7`** · SI type/insurer platform peers RETAIN cite |
| **ref_sa** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01.md) · O1–O12 · AC-CORE-10-* · AC-SI-TL-01..06 · R-CORE-10-* |
| **ref_core09_data** | [`PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md) — registry + keyword fill · printable **false** · ≠ CORE-09 DONE |
| **ref_core07_data** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md) — activate HOLD · GATE aggregate · Nest `/core` DENY · checklist≠DONE · free PATCH≠DONE |
| **ref_core06_data** | [`PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01.md) — soft-return HOLD · soft≠DONE |
| **ref_core05_data** | [`PO-HRM-MVP-GD1-CORE-05-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-05-CLUSTER-DATA-01.md) — AST/BB · serial 409 · DELETE-FORBIDDEN |
| **ref_core03_data** | [`PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md) — DOC/ET/CHK |
| **ref_core02b_data** | [`PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md) — EMP-CF HOLD |
| **ref_core02_data** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md) — packages/eins · SI period RETAIN · AuthZ/CB-403 |
| **ref_core01_data** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md) — public strip · Nest `/core` DENY |
| **ref_paper_db** | paper enrollment ↔ LIVE `employee_insurances` · rate periods ↔ `hrm_insurance_rate_period` · type/insurer catalogs ↔ `si_insurance_type` / `si_insurer` |
| **ref_paper_api** | **F-CORE-SI-01** · **F-CORE-SI-02** · **F-CORE-SI-03** · peers **F-SI-CAT-TYP/EFF** · **F-SI-CAT-INS-*/EFF** · must_keep **F-CORE-CTR-*** · **F-CORE-ACT-01** · Nest `@Controller('core')` **ABSENT** · paper `/core` alias only |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-10** · Diễn biến **#0a–#0f** · **#1–#5** · **AC-SI-TL-01..06** · **AC-SI-CAT** · **AC-SI-INR** · **BR-BP-SI-01** |
| **ref_adr** | ADR 4-pillar · Nest physical prefer · paper `/core` alias only · U19 scope parity list↔get↔actions · enrollment **ONE SoT** · append-only rate periods |
| **ref_code_cite** | `insurance-enrollment-bridge.ts` `ensureEmployeeInsuranceEnrollmentSchema` · `employee-insurances.service` `applyAction` / `getById` `periods[]` · `InsuranceActionDto` · Nest `@Controller('core')` **ABSENT** — **read-only cite** · **no** `apps/**` edit this seat |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · personnel / CORE / CTR / SI module UAT **false** · **C-SLICE** · U65 · **DENY** claim catalog alone = CORE-10 DONE · **DENY** claim enrollment CRUD alone = CORE-10 DONE · **DENY** claim LIVE actions alone = module DONE without J-* · **DENY** claim CORE-09/07/06 DONE · **DENY** invent PAY/ATT/printable/Word DONE · **DENY** conflate BH Hoạt động ↔ CORE-07 · honesty flip |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD**

| Decision | Stamp |
|----------|--------|
| Enrollment SoT | **ONE HOLD RETAIN** Nest **`public.employee_insurances`** on **`/api/hrm/employee-insurances*`** — **DENY** second enrollment SoT · **DENY** Nest `/core` SI table dual · **DENY wipe** enrollment spine |
| History SoT | **HOLD RETAIN** **`public.hrm_insurance_rate_period`** **append-only** — **DENY** silent overwrite amount/status history · **DENY** invent second history SoT |
| Actions path | **HOLD RETAIN** physical **`POST …/employee-insurances/:id/actions`** (`close\|stop\|suspend\|change_rate\|resume`) — **≠** CORE-10 module DONE alone without U65 J-* |
| Catalog peers | **HOLD · cite peer** LIVE **`si_insurance_type`** / **`si_insurer`** (+ EFF) — **≠ CORE-10 DONE alone** · **DENY wipe** |
| **R-CORE-10-TL-01** | **HOLD** fidelity — LIVE PRESENT · U65 residual |
| **R-CORE-10-SUSPEND** | **HOLD** — LIVE `suspend_reason` → `HRM-SI-ACTION-400` |
| **R-CORE-10-DISP** | **HOLD** — prefer LIVE DTO fields; reopen REQUIRED only if typed col ABSENT proven |
| **R-CORE-10-≠-DONE** / CAT / ENR / LIVE | **INFO honesty locks** — catalog / CRUD / LIVE ≠ DONE footers |
| **R-CORE-10-PAY-06** | **OUT invent PAY DONE** — AC-SI-TL-06 cite only |
| **R-CORE-10-PRINTABLE** | printable **false RETAIN** (`CORE09QC1-MSLNBA89`) |
| Nest path | Physical `/employee-insurances*` · Nest `@Controller('core')` **ABSENT** · paper `/core` **alias only** |
| CORE-09 printable | **must_keep** · stamp **`CORE09QC1-MSLNBA89`** · printable **false** · ≠ CORE-09 DONE |
| CORE-07 GATE/ACT | **must_keep** · stamp **`CORE07QC1-KZJTSHNT`** · GATE **409** · ACT-**400** · Nest DENY · checklist≠DONE · free PATCH≠DONE · **≠** CORE-07 DONE · **DENY** conflate BH Hoạt động |
| CORE-06 soft≠DONE | **must_keep** · **`CORE06QC1-MSLID363`** |
| CORE-05 / 03 / 02b / 09d..01 | **must_keep** · **DENY reopen** sealed J-* |
| PAY / ATT | **OUT invent DONE** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim catalog/CRUD/LIVE = CORE-10 DONE |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| Enrollment / gắn người BH | **`public.employee_insurances`** | **HOLD RETAIN** ONE SoT |
| F-CORE-SI-01 `/core/…/insurance` | **`/api/hrm/employee-insurances*`** | Physical prefer · paper **alias only** |
| Timeline GET + periods | **`GET …/employee-insurances`** · **`GET …/:id`** → `periods[]` | **HOLD RETAIN** F-CORE-SI-02 |
| Lifecycle actions | **`POST …/:id/actions`** | **HOLD RETAIN** F-CORE-SI-03 |
| Rate / status history | **`public.hrm_insurance_rate_period`** | **HOLD RETAIN** append-only |
| Type catalog | **`si_insurance_type`** + EFF | **HOLD cite peer** · **≠** CORE-10 DONE |
| Insurer catalog | **`si_insurer`** + EFF | **HOLD cite peer** · **≠** CORE-10 DONE |
| Nest `/core` SI table | — | **DENY invent** |
| PAY read mức kỳ (AC-SI-TL-06) | PAY peer | **OUT invent DONE** |
| CORE-09 fill/registry | peers | **must_keep** · printable false |
| CORE-07 activate | `POST /employees/:id/activate` | **must_keep** · **≠** conflate |

```text
  public.employee_insurances (LIVE — HOLD RETAIN enrollment SoT · ONE)
        RETAIN: id · employee_id · company_id · type · provider · policy_number ·
                start_date · end_date · contribution · employer_contribution ·
                status (active|closed|stopped|suspended|…) · notes ·
                policy_id · si_number · archived_at · audit
        DENY:   wipe enrollment · second enrollment SoT · Nest /core dual ·
                claim enrollment CRUD alone = CORE-10 DONE
                │
                │ Lifecycle (HOLD RETAIN — F-CORE-SI-03)
                ▼
  POST /api/hrm/employee-insurances/:id/actions
        action ∈ close|stop|suspend|change_rate|resume
        effective_from required · suspend_reason required on suspend
                │
                │ History (HOLD RETAIN append-only)
                ▼
  public.hrm_insurance_rate_period
        RETAIN: id · enrollment_id · company_id · effective_from · effective_to ·
                employee_rate_pct · employer_rate_pct · employee_amount · employer_amount ·
                pay_rate_cfg_id · period_status · action · change_reason · suspend_reason ·
                archived_at · audit
                UQ open period (enrollment_id WHERE effective_to IS NULL AND archived_at IS NULL)
        DENY:   silent overwrite prior rows · invent second history SoT · hard-purge for AC cheat
                │
                │ Catalog peers (HOLD cite — ≠ CORE-10 DONE)
                ▼
  si_insurance_type · si_insurer (+ EFF pickers) — DENY wipe · DENY claim = FR-10 DONE

  Display-ready DTO (O11 — cite · HOLD schema):
        periods[] · statusLabelVi · effective_from/to dd/MM/yyyy ·
        suspend_reason · amounts (vi-VN grouping)

  CORE-09 printable false · CORE-07 GATE 409 · ACT-400 · Nest /core DENY ·
  checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE · CORE-05/03/02b/09d..01
        SEALED must_keep

  FORBIDDEN GĐ1 this seat:
        Invent/change LIVE employee_insurances enrollment SoT
        Overwrite / second history SoT for hrm_insurance_rate_period
        Wipe si_insurance_type / si_insurer · claim catalog = CORE-10 DONE
        Nest /core SI dual · invent PAY/ATT/printable/Word DONE
        Claim CRUD/LIVE alone = CORE-10 DONE · claim CORE-09/07/06 DONE
        Conflate BH Hoạt động ↔ CORE-07 · honesty flip · reopen sealed J-* · seed · apps/**
```

**Label lock:** Board «BHXH lifecycle (Hoạt động / Ngừng / Tạm hoãn)» GĐ1 = **LIVE enrollment + actions + append periods** — **not** Nest `/core` dual · **not** employee CORE-07 activate · **not** catalog/CRUD alone = FR-10 DONE.  
**Spine lock:** Physical `/employee-insurances*` + `POST …/actions` — **DENY** Nest `/core` second SI SoT.  
**Gap lock:** Schema UNLOCK only with BA/QA proven missing physical column — **default HOLD**.  
**Honesty lock:** printable false · catalog/CRUD/LIVE ≠ DONE · CORE-09/07/06 ≠ DONE · PAY/ATT OUT · BH ≠ CORE-07.

---

## 3. AS-IS baseline (Nest facts — read-only cite · 2026-08-09)

| Object | AS-IS LIVE | Gap (Wave-23 DATA) |
|--------|------------|---------------------|
| **`public.employee_insurances`** | `ensureEmployeeInsuranceEnrollmentSchema` — enrollment spine + `policy_id` · `si_number` · `archived_at` soft | **HOLD RETAIN** — **no** invent/change |
| **`public.hrm_insurance_rate_period`** | Append-only periods + UQ open period · `suspend_reason` · `action` · amounts/rates | **HOLD RETAIN** append-only — **DENY** overwrite SoT |
| **`POST …/:id/actions`** | `InsuranceActionDto` close\|stop\|suspend\|change_rate\|resume · `applyAction` append + denorm status | **HOLD RETAIN** path · U65 fidelity residual |
| **`GET …/:id` → `periods[]`** | `getById` returns enrollment + `listPeriods` | **HOLD RETAIN** F-CORE-SI-02 |
| **`statusLabelVi`** | Display-ready O11 — **derive/wire** from enrollment/`period_status` (not required typed col invent) | Residual wire-only if closable gap proven · **HOLD** schema |
| **`si_insurance_type` / `si_insurer`** | Nest platform catalogs + EFF · KEY assert | **HOLD cite peer** · **≠** CORE-10 DONE |
| Paper `/core` | Nest `@Controller('core')` **ABSENT** | **DENY invent** dual |
| CORE-09 / 07 / 06 / 05 / 03 / 02b / 09d..01 | SEALED stamps | **must_keep** · **DENY wipe** |
| PAY / ATT | Peers | **OUT invent DONE** |

**FORBIDDEN invent this seat:** change LIVE enrollment · overwrite rate-period history · wipe type/insurer catalogs · Nest `/core` SI dual · invent PAY/ATT/printable/Word DONE · claim catalog/CRUD/LIVE = FR-10 DONE · seed · honesty flip · apps/** · reopen sealed CORE-09..01.

---

## 4. HOLD dispositions (normative)

### 4.1 Enrollment `employee_insurances` — **HOLD RETAIN** (mission §1)

| Physical | Rule |
|----------|------|
| `public.employee_insurances` | **HOLD** — no invent/change SoT · ONE enrollment spine |
| Second enrollment / Nest `/core` SI table | **FORBIDDEN** |
| Soft archive `archived_at` | **RETAIN** soft-delete doctrine · preserve history periods |
| Enrollment CRUD alone | **RETAIN path** · **≠ CORE-10 DONE** (**R-CORE-10-≠-ENR-DONE** · **AC-CORE-10-≠-ENR-DONE**) |

### 4.2 Rate periods — **HOLD RETAIN** append-only (mission §2)

| Field | Ruling |
|-------|--------|
| **Scope** | **IN-SCOPE residual `R-CORE-10-TL-01`** · AC-SI-TL-04/05 · Diễn biến #4 |
| **Physical** | LIVE `hrm_insurance_rate_period` · close prior open · INSERT new row |
| **Overwrite** | **DENY** silent UPDATE of prior amount/status history as SoT |
| **Second history SoT** | **FORBIDDEN** |
| **ba-data** | **HOLD** — **no** invent overwrite table / dual period store |
| **DENY** | Claim F5 wipe of prior rows · hard-purge for AC cheat |

### 4.3 Catalog peers `si_insurance_type` / `si_insurer` — **HOLD cite** (mission §3)

| Peer | Rule |
|------|------|
| Type / insurer Nest catalogs + EFF | **HOLD · cite peer** |
| Claim catalog admin alone = CORE-10 / FR-10 DONE | **FORBIDDEN** (**R-CORE-10-≠-CAT-DONE**) |
| Wipe catalogs | **FORBIDDEN** |

### 4.4 Suspend / DISP / PAY / honesty — **HOLD / OUT** (no schema)

| ID | ba-data | Note |
|----|---------|------|
| **R-CORE-10-SUSPEND** | **HOLD** | LIVE `suspend_reason` + `HRM-SI-ACTION-400` |
| **R-CORE-10-DISP** | **HOLD** | Display-ready fields cite §5 — wire-only if gap |
| **R-CORE-10-PAY-06** | **OUT invent** | AC-SI-TL-06 cite only — **DENY** invent PAY DONE |
| **R-CORE-10-PRINTABLE** / **HONESTY** | **false RETAIN** | printable · all ready flags · C-SLICE |

---

## 5. Display-ready DTO fields (BA O11 — cite)

| Field | Semantics | LIVE cite | FE bind rule |
|-------|-----------|-----------|--------------|
| **`periods[]`** | Append-only history rows for enrollment | `getById` / list detail → `listPeriods` | Bind timeline · F5 keeps prior + new · **cấm** FE invent second history |
| **`statusLabelVi`** | VI label for enrollment / period status | Display-ready O11 — **derive/wire** (not typed enrollment col invent) · **HOLD** schema | FE bind · **cấm** raw key as label · **cấm** conflate with CORE-07 «Hoạt động» employee |
| **`effective_from` / `effective_to`** | Period bounds | `hrm_insurance_rate_period.effective_from/to` | Display/entry **`dd/MM/yyyy`** · **cấm** ISO leak as primary UI |
| **`suspend_reason`** | Căn cứ tạm hoãn | Period + action DTO · required on `suspend` | Show on suspended rows · missing → ACTION-400 |
| **amounts** | `employee_amount` / `employer_amount` (+ optional rate_pct) | Period cols · denorm on enrollment for list UX | **vi-VN** thousand grouping while typing · parse plain on submit · **cấm** invent PAY engine |

**Invariant CORE-10-DTO:** FE **MUST NOT** invent PAY · printable flip · Nest `/core` dual · BH Hoạt động = CORE-07 activate from these fields alone.

---

## 6. Validation matrix (data integrity — HOLD)

| Condition | Rule | Expected | Error / ≠ |
|-----------|------|----------|-----------|
| Action missing `effective_from` | F-CORE-SI-03 | **400** `HRM-SI-ACTION-400` | Silent 2xx |
| `suspend` without `suspend_reason` | AC-SI-TL-03 | **400** `HRM-SI-ACTION-400` | Silent suspend |
| Valid action | Append period · close prior open | New row + prior `effective_to` set · F5 keeps history | Silent overwrite prior amounts |
| `change_rate` | Append · keep active unless suspended | New period row | Free PATCH contrib as history SoT (**must_keep** CORE-02 redirect) |
| Type/insurer KEY | EFF assert | `HRM-INS-TYPE-KEY` / `HRM-INS-INSURER-KEY` | Claim catalog = CORE-10 DONE |
| Scope | U19 | list = get = actions same resolver | Cross-CT leak / list-id→detail-404 = `scope_parity` |
| Nest `/core` | PATH | SI Network **0** on `/core` | Dual SoT = **FAIL O1** |
| Soft-delete enrollment | Prefer `archived_at` | Preserve period history | Hard purge history for AC |

---

## 7. Lifecycle (enrollment + periods — RETAIN)

| Entity | States (LIVE map) | Illegal |
|--------|-------------------|---------|
| Enrollment `status` | `active` (BH Hoạt động) · `closed` · `stopped` · `suspended` (+ resume→`active`) | Conflate with CORE-07 `employees.status=active` · Nest `/core` dual status |
| Soft archive | `archived_at` set | Hard purge as GĐ1 SoT |
| Period `period_status` / `action` | Align close/stop/suspend/change_rate/resume | Overwrite prior period amounts in place as history SoT |
| Open period | At most one open (`effective_to` NULL · not archived) | Dual open periods · invent second history table |

**Invalid transition behavior:** Prefer deterministic **4xx** (`HRM-SI-ACTION-400` / scope) — **DENY** silent 2xx · **DENY** seed to force state.

---

## 8. Scope parity (U19)

| Surface | Resolver family | Parity rule |
|---------|-----------------|-------------|
| enrollment list | employee-insurances / hrm-list-scope | Same as get-by-id |
| get-by-id (+ `periods[]`) | same | id from list **must** load |
| actions | same company/enrollment scope | **DENY** cross-CT action |
| type/insurer EFF | tenant/company effective catalogs | Peer cite · **≠** CORE-10 DONE |

**Flag:** Any list-returns-id / detail-404 under group CEO `main` = **`scope_parity` defect** — sa API residual wire · **not** schema invent this seat.

---

## 9. must_keep peers · DENY matrix (mission §5–§6)

### 9.1 RETAIN CORE-09..01 / Nest DENY

| Peer | Stamp / lock | RETAIN |
|------|--------------|--------|
| CORE-09 | `CORE09QC1-MSLNBA89` | printable **false** · fill/registry/PREV/VER · ≠ CORE-09 DONE · **DENY** invent printable/Word DONE |
| CORE-07 | `CORE07QC1-KZJTSHNT` | GATE **409** · ACT-**400** · Nest `/core` **0** · checklist≠DONE · free PATCH≠DONE · **≠** CORE-07 DONE · **DENY** conflate BH Hoạt động |
| CORE-06 | `CORE06QC1-MSLID363` | soft≠DONE |
| CORE-05 | `CORE05QC1-MSLGVT40` | AST/BB/serial/DELETE-FORBIDDEN |
| CORE-03 | `CORE03QC1-MSLFJH0K` | DOC/ET/CHK |
| CORE-02b | `CORE02BQC1-MSLEFQC1` | EMP-CF |
| CORE-09d..01 | `CORE09DQC1-MSLDR8I3` … `CORE01QC1-MSL6WMS7` | TPL/VER/PREV/CL/RD/C&B/public · Nest DENY |

### 9.2 DENY (absolute this seat)

| DENY | Why |
|------|-----|
| Wipe CORE-09/07/06/05/03/02b/09d..01 | Sealed must_keep |
| Invent PAY / ATT / printable / Word DONE | OUT invent DONE · AC-SI-TL-06 cite only |
| Claim catalog alone = CORE-10 DONE | **R-CORE-10-≠-CAT-DONE** |
| Claim enrollment CRUD = CORE-10 DONE | **R-CORE-10-≠-ENR-DONE** |
| Claim LIVE actions = module DONE without J-* | **R-CORE-10-≠-LIVE-DONE** |
| Claim CORE-09 DONE · CORE-07 DONE · soft = CORE-06 DONE | Peer ≠DONE locks |
| Conflate BH Hoạt động ↔ CORE-07 | **CORE-10-VOCAB** |
| Honesty flip | C-SLICE · ready flags false |
| Reopen sealed J-HRM-CORE-09-01..06 / 07 / 06 / 05 / 03 / 02B / 09D..01 | Regression forbid |
| Seed · `apps/**` · migrate invent | U65 · docs-only HOLD |

---

## 10. Traceability (BRD/SRS → API → DB → FE → Test)

| Req / AC | API | DB | FE | Test / J-* |
|----------|-----|----|----|------------|
| AC-CORE-10-01 PATH | `/employee-insurances*` + `…/actions` | `employee_insurances` · rate_period | Profile BH tab | J-HRM-CORE-10-01..06 · Nest `/core` 0 |
| AC-CORE-10-02 vocab | `InsuranceActionDto` | status / period_status map | Đóng/Ngừng/Tạm hoãn/Đổi mức/Resume | J-02..06 |
| AC-SI-TL-01..02 close/stop | `POST …/actions` | append period | panel + F5 | J-02 / J-03 |
| AC-SI-TL-03 suspend | actions + `suspend_reason` | period.suspend_reason | căn cứ required | J-04 · ACTION-400 |
| AC-SI-TL-04/05 change_rate + F5 | actions append | rate_period history | timeline `periods[]` | J-05 |
| AC-CORE-10-VOCAB | — | enrollment `active` ≠ emp activate | footer | ≠ CORE-07 |
| AC-CORE-10-≠-CAT-DONE | F-SI-CAT-* | `si_insurance_type` / `si_insurer` | catalog peers | footer ≠ DONE |
| AC-CORE-10-≠-ENR-DONE | F-CORE-SI-01 | enrollment | CRUD alone | ≠ DONE |
| AC-CORE-10-≠-LIVE-DONE | F-CORE-SI-03 | actions LIVE | panel alone | need J-* pack |
| AC-CORE-10-PAY-06-OUT | — | — | — | PAY OUT invent DONE |
| AC-CORE-10-H / PRINTABLE | — | — | honesty footer | printable false · CORE-09/07 RETAIN |

---

## 11. Data risks & mitigation

| Risk | Mitigation |
|------|------------|
| Claim catalog / CRUD / LIVE = CORE-10 DONE | Explicit ≠DONE locks + evidence footer |
| Nest `/core` SI dual drift | grep **0** · PATH AC · paper alias only |
| Silent overwrite history | Append-only UQ open · DENY overwrite SoT |
| Conflate BH Hoạt động ↔ CORE-07 | Vocabulary lock O3 · footer every evidence |
| Invent PAY from AC-SI-TL-06 | OUT invent PAY DONE · cite residual only |
| Wipe peer seals / printable flip | must_keep stamps · printable false RETAIN |
| Scope list≠detail/actions | U19 parity · sa API residual if proven |
| Seed to pass timeline journeys | U65 · FE-only |

---

## 12. Unlock next — **sa API-01** (mission §7)

| Unlock | Rule |
|--------|------|
| **Owner** | **sa** · `PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01` |
| **Mode** | **RETAIN cite** **F-CORE-SI-01** + **F-CORE-SI-02** + **F-CORE-SI-03** |
| **Paper** | `/api/hrm/core/…/insurance*` = **alias only** |
| **Residual wire** | **ONLY if** closable gap proven (e.g. display-ready `statusLabelVi` envelope · date format · fidelity codes) — **not** Dev invent greenfield |
| **OUT** | Invent PAY DONE (**AC-SI-TL-06**) · invent ATT/printable/Word DONE · claim catalog/CRUD/LIVE = CORE-10 DONE |
| **must_keep** | CORE-09 printable false · CORE-07 GATE/ACT-400/Nest DENY · soft≠CORE-06 · 05/03/02b/09d..01 · Nest `/core` DENY |
| **Dev** | **HOLD** invent until API seat + closable gap stamped |

---

## 13. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | CORE-10 DATA **CONFIRMED HOLD** — LIVE `employee_insurances` ONE SoT + append-only `hrm_insurance_rate_period` RETAIN · peer `si_insurance_type`/`si_insurer` cite ≠ DONE · display-ready DTO cited · CORE-09 printable false · CORE-07 GATE/ACT RETAIN · soft≠CORE-06 · PAY-06 OUT · unlock sa API RETAIN cite F-CORE-SI-01/02/03 |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md` |

---

## 14. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01
role: sa
lane: governance
entry_criteria:
  - BA O1–O12 CONFIRMED: docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01.md
  - DATA HOLD CONFIRMED: docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md
  - SA Option A LOCKED: docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-SA-01.md
  - must_keep CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT GATE 409 · ACT-400 · Nest /core DENY · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE
  - NO apps/** · NO migration invent · NO seed · U65
mission:
  Produce API_DESIGN F.1 RETAIN cite for F-CORE-SI-01 (enrollment) · F-CORE-SI-02 (timeline GET + periods[]) · F-CORE-SI-03 (POST …/:id/actions close|stop|suspend|change_rate|resume)
  Physical prefer /api/hrm/employee-insurances* — paper /core alias only — Nest @Controller('core') DENY
  Cite display-ready: periods[] · statusLabelVi · effective_from/to dd/MM/yyyy · suspend_reason · amounts
  Residual wire ONLY if closable gap proven (HOLD schema default) — DENY invent PAY AC-SI-TL-06 DONE
  Explicit ≠DONE: catalog ≠ CORE-10 DONE · enrollment CRUD ≠ DONE · LIVE actions ≠ module DONE without J-*
  Vocabulary: BH Hoạt động = enrollment active — DENY conflate CORE-07 employee activate
  must_keep CORE-09 printable false · CORE-07 GATE/ACT · soft≠CORE-06 · peers CORE-05/03/02b/09d..01
  DENY wipe sealed peers · invent PAY/ATT/printable/Word DONE · honesty flip · reopen sealed J-* · seed · apps/**
exit_criteria:
  - API_DESIGN path written · F-CORE-SI-01/02/03 RETAIN cite · PASS_TO_PM · Dev HOLD until closable gap stamped
evidence_path: docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01.md
ack_status target: PASS_TO_PM
```

---

*ba-data · Wave-23 · UC-BP-CORE-10 · 2026-08-09 · HOLD default · no apps/** · no seed*
