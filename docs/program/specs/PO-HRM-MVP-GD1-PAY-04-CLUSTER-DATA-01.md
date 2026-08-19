# PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01 — Physical DB · STAMPED ADD split segment + RETAIN one-net payslip (Option A · ba-data)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-39 seat **#44**) |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** (stamped closable) — **`public.payroll_payslip_split_segments`** per paper §5.8 · **RETAIN** LIVE **`public.payroll_payslips`** one-net UQ + header grain · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · peer ATT chain · **NO** invent `att_leave_hold` · **NO** merge sick/compensatory/carry→annual on PAY hour read · **NO** static tax/GTCG/SI columns on segment rows (**DV-14**) · **NO CODE** `apps/**` · **no seed** · **no migrate** governance seat |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED ADD stamp** — segment child table **closable** (ABSENT LIVE · greenfield FK) · payslip header **RETAIN** · paper static header cols (`tax_amount`, `gtgc_amount`, `si_*`) → **HOLD waiver** (map via `deduction_amount` + lines GĐ1 C-SLICE until PAY-03/05 stamp) · unlock **sa** `PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01` · dev-be/FE **HOLD** until API stamp · **`payroll_e2e_ready=false`** · **≠ PAY-04 / PAY module UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-PAY-04` · `FR-UC-BP-PAY-04` · **BR-BP-SPL-01** · **BR-BP-SPL-02** (peer PAY-05 footer) · peer **FR-UC-BP-PAY-01** (**F-PAY-ATT-CLOSED-01**) · **FR-UC-BP-PAY-02** (process order · **gd1_eval_v1**) |
| **depends_on** | BA-01 O1–O18 **CONFIRMED** · [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md) · peer DATA [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-DATA-01.md) · [`PO-HRM-MVP-GD1-PAY-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-PAY-02-CLUSTER-DATA-01.md) · **must_keep** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT07QC1-MSM9GWC1`** · **`ATT06QC1-MSM84GWC1`** · **`ATT05BQC1-MSM5SDQC1`** · **`CORE07QC1-KZJTSHNT`** |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **§5.6** `pay_payslip` · **§5.8** `pay_payslip_split_segment` · **DV-13** · **DV-14** |
| **ref_code_cite** | **read-only cite (2026-08-10):** `payroll.service.ts` ensureSchema `payroll_payslips` + **`uq_payroll_payslip_period_employee`** · **no** `split_segment` symbol in `apps/api/hrm-api` — **≠ waive ADD** |
| **Honesty** | **`payroll_e2e_ready=false`** · **`attendance_uat_ready=false`** · **C-SLICE** · **DENY** segment DDL stamp alone = PAY-04 DONE · **DENY** PAY / ATT module UAT · **DENY** invent `att_leave_hold` · **DENY** merge buckets · **DENY** reopen **J-HRM-PAY-01-*** / **J-HRM-PAY-02-05..07** / **J-HRM-ATT-12-07** / **J-ATT-07-03..05** / **J-ATT-06-04** without regression bus |
| **ack_status** | **PASS_TO_PM CONFIRMED ADD stamp** |

---

## 1. Verdict — **CONFIRMED ADD stamp** (segment closable)

| Decision | Stamp |
|----------|--------|
| **`pay_payslip_split_segment` (paper)** | **ADD stamp closable** → physical **`public.payroll_payslip_split_segments`** · child of **`payroll_payslips`** · **ABSENT** LIVE (grep 2026-08-10) · greenfield · **no** orphan rows |
| **One Net / NV / period (DV-13)** | **HOLD RETAIN** — LIVE **`UNIQUE (period_id, employee_id)`** on `payroll_payslips` · **cấm** second net row for split · segments **must** reference **one** `payslip_id` |
| **Time vs static (DV-14)** | **ENFORCE in ADD plan** — segment cols **only** time-varying (`effective_*`, `base_salary_snapshot`, `hours_payable`, `segment_gross`) · **cấm** `tax_amount` / `gtgc_amount` / `si_*` on segment table |
| **Payslip header static monthly vars** | **HOLD waiver** — paper §5.6 `tax_amount` / `gtgc_amount` / `si_*` **not** on LIVE `payroll_payslips` (only `gross_amount` / `deduction_amount` / `net_amount`) · GĐ1 C-SLICE: static merge may map to header aggregates + `payroll_payslip_lines` until PAY-03/05 DATA stamp · **AC-PAY-04-DV-14** QA inspects **0** static on segment + **once** on header/lines path |
| **Closed-sheet hours (peer PAY-01)** | **must_keep RETAIN** — segment `hours_payable` **only** from closed+locked line proration · **cấm** Leave/OT HTTP (**PAY01QC1**) |
| **Process order (peer PAY-02)** | **must_keep RETAIN** — split persistence **after** ATT-412 + FORMULA-412 guards (**PAY02QC1**) |
| **Leave hold** | **DENY invent** **`att_leave_hold`** · **`pending_days`** only (**ATT09QC1**) |
| **Multi-bucket leave** | **DENY merge** compensatory / sick / carry_over → annual on PAY hour read |
| **Nest `/core` dual** | **DENY** as hour/CB SoT |
| **`split_segments_json` blob SoT** | **DENY** — rows in **`payroll_payslip_split_segments`** per SA-01 |
| **This seat** | Docs only — **NO** `apps/**` · **NO** seed · **NO** migrate governance seat |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical GĐ1 LIVE / proposed | Action |
|-----------------|------------------------------|--------|
| `pay_payslip` | **`public.payroll_payslips`** | **HOLD RETAIN** · one row / NV / period UQ |
| `pay_payslip_line` | **`public.payroll_payslip_lines`** | **HOLD RETAIN** · component grain |
| `pay_payslip_split_segment` | **`public.payroll_payslip_split_segments`** | **ADD stamp** §6.1 · **not LIVE** |
| `payroll_period_id` (paper) | **`period_id`** on payslip | **RETAIN** alias |
| `gross` / `net` (paper) | **`gross_amount`** / **`net_amount`** | **RETAIN** |
| `tax_amount` / `gtgc_amount` / `si_*` (paper header) | **ABSENT** dedicated cols | **HOLD waiver** §6.3 · lines/deduction C-SLICE |
| F-PAY-ATT-CLOSED-01 | closed bind + locked lines | **must_keep PAY01QC1** |
| `pay_period_timesheet_bind` | LIVE bind | **RETAIN** |
| Paper `att_leave_hold` | **`employee_leave_balances.pending_days`** | **DENY dual table** |

```text
  PAY-01 SEALED (must_keep PAY01QC1): closed sheet → hours_payable per segment (date prorate)
  PAY-02 SEALED (must_keep PAY02QC1): ATT-412 → FORMULA-412 → then split writer
       │
       ▼
  public.payroll_payslips (LIVE — RETAIN · uq period_id + employee_id = DV-13)
        │ 1 ── N (when split)
        ▼
  public.payroll_payslip_split_segments (ADD stamp §6.1 — NOT LIVE)
        time-varying only: segment_seq · effective_from/to · base_salary_snapshot
                           hours_payable · segment_gross
        FORBIDDEN on segment: tax_amount · gtgc_amount · si_employee_amount · si_employer_amount

  Static merge once → pay_payslip HEADER (+ lines) — NOT per segment (DV-14)
  FORBIDDEN: second payslip row same period+employee for split
             att_leave_hold · merge bucket hour keys · Nest /core SoT
             split_segments_json as audit SoT
```

**Label lock:** Wave-39 PAY-04 GĐ1 DATA = **stamped closable segment audit table** + **RETAIN** one-net payslip UQ + PAY-01/02 peer boundaries — **not** F-PAY-SPLIT-01 runtime DONE · **not** full paper header tax cols · **C-SLICE**.  
**Honesty lock:** `payroll_e2e_ready=false` · **≠ PAY-04 / FR-PAY-04 module UAT**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-04 / FR-UC-BP-PAY-04 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠ ATT module UAT**  
> must_keep **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10/09/07/06/05b/CORE07  
> segment ADD stamp **necessary not sufficient** · **F-PAY-SPLIT-01** runtime **ABSENT** until Dev after API stamp  
> DENY `att_leave_hold` · DENY merge sick/compensatory/carry→annual · DENY static cols on segment  
> no seed · no apps/**

---

## 3. AS-IS baseline (physical — read-only cite · 2026-08-10)

| Object | AS-IS LIVE | Gap (Wave-39 DATA) |
|--------|------------|---------------------|
| **`public.payroll_payslips`** | ensureSchema + **`uq_payroll_payslip_period_employee`** | **HOLD RETAIN** · DV-13 anchor |
| **`public.payroll_payslip_lines`** | ensureSchema in `pay-formula.service.ts` | **HOLD RETAIN** |
| **`public.payroll_payslip_split_segments`** | grep CREATE **0** | **ADD** §6.1 stamp |
| **F-PAY-SPLIT-01 writer** | process path **ABSENT** | **GAP** dev-be after API |
| **Paper header `tax_*` / `gtgc_*` / `si_*`** | cols **ABSENT** on payslip | **HOLD waiver** §6.3 |
| **Peer PAY-01 bind + lines** | **SEALED** | **must_keep** |
| **Peer PAY-02 formula bind** | **SEALED** | **must_keep** |
| **`att_leave_hold`** | **ABSENT** | **DENY invent** |

---

## 4. HOLD / residual dispositions

### 4.1 Payslip header — **HOLD RETAIN** + static cols **HOLD waiver**

| Physical / rule | Ruling |
|-----------------|--------|
| `payroll_payslips` grain | **HOLD RETAIN** · one row per `(period_id, employee_id)` |
| `gross_amount` / `net_amount` / `deduction_amount` | **HOLD RETAIN** · merge output targets |
| `formula_definition_id` (peer PAY-02) | **HOLD RETAIN** when column present |
| Paper `tax_amount`, `gtgc_amount`, `si_employee_amount`, `si_employer_amount` | **HOLD waiver** — optional future ALTER seat when PAY-03/05 + QA AC require named header fields · until then static-once via **deduction_amount** + **deduction** lines · **≠** block segment ADD |
| `timesheet_header_id` FK (paper §5.6) | **TRACE** — bind via `pay_period_timesheet_bind` GĐ1 · hard FK on payslip **not** closable without backfill |

### 4.2 Peer seals — **must_keep**

| Stamp | Ruling |
|-------|--------|
| **`PAY01QC1-MSMBGWC1`** | RETAIN closed-sheet · ATT-412 · **F-PAY-ATT-CLOSED-01** |
| **`PAY02QC1-MSMC4GWC1`** | RETAIN process order · **gd1_eval_v1** C-SLICE |
| **ATT12/11/10/09/07/06/05b/CORE07** | RETAIN · DENY merge · DENY `att_leave_hold` |
| Reopen sealed J-* | **DENY** without regression bus |

### 4.3 Rejected ADD / DENY

| Object | Verdict |
|--------|---------|
| `public.att_leave_hold` | **DENY** — `pending_days` only |
| Static tax/GTCG/SI **columns on segment** | **DENY** — **DV-14** |
| Second `payroll_payslips` per segment (Option B) | **DENY** — **DV-13** |
| `split_segments_json` on payslip as SoT | **DENY** — SA Option A |
| FK segment → `leave_requests` / OT / punch | **DENY** — paper FK forbidden pattern |

---

## 5. Validation matrix (data integrity)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-PAY-04-DATA-01** | Insert 2nd `payroll_payslips` same `period_id`+`employee_id` | **DV-13** UQ | **409** / DB unique violation |
| **VAL-PAY-04-DATA-02** | Segment row with `tax_amount` / `gtgc_amount` / `si_*` | **DV-14** schema | Migration review **FAIL** · no such columns |
| **VAL-PAY-04-DATA-03** | `segment_seq` duplicate on same `payslip_id` | UQ §6.1 | **409** |
| **VAL-PAY-04-DATA-04** | `effective_from` > `effective_to` | CHK §6.1 | **FAIL** insert |
| **VAL-PAY-04-DATA-05** | Segment `payslip_id` OOS company scope | U19 + `company_id` on segment | list/detail parity **409/404** |
| **VAL-PAY-04-DATA-06** | Process without closed sheet (peer) | PAY-01 | **412** `HRM-PAY-ATT-412` **before** segment write |
| **VAL-PAY-04-DATA-07** | `hours_payable` sourced from leave/OT HTTP | BR-BP-TS-03 | **FAIL** · closed lines only |
| **VAL-PAY-04-DATA-08** | Invent `att_leave_hold` | grep | **FAIL** |
| **VAL-PAY-04-DATA-09** | Merge compensatory/sick/carry→annual hour read | peer seals | **FAIL** |
| **VAL-PAY-04-DATA-10** | Claim segment table stamp = PAY-04 DONE | honesty | **FAIL** |
| **VAL-PAY-04-DATA-11** | Two net payslips for split scenario | **BR-BP-SPL-01** | **FAIL** · one header + N segments |

Map paper **DV-13** / **DV-14** → rows above.

---

## 6. Stamped ADD (closable — not LIVE · no migrate this seat)

> **BA stamp (2026-08-10):** O1–O2 CONFIRMED — audit store for **N** segments → **one** payslip **cannot** use payslip row alone without child table. **Closable YES** (ABSENT LIVE · FK to existing payslip · no legacy segment rows). **Dev-be** migrates only after **sa API-01** F.1 + program waiver. **Governance seat:** stamp only — **no** `ensureSchema` edit here.

### 6.1 Split segment audit — **`public.payroll_payslip_split_segments`** (**R-PAY-04-AUDIT-DB**)

| Proposed column | Type | Null | Default | Rule |
|-----------------|------|------|---------|------|
| `id` | `UUID` | NO | `gen_random_uuid()` | PK |
| `payslip_id` | `UUID` | NO | | **FK** → `public.payroll_payslips(id)` **ON DELETE CASCADE** |
| `company_id` | `TEXT` | NO | | Must match parent payslip `company_id` · **U19** scope |
| `segment_seq` | `INT` | NO | | **1..n** contiguous per payslip |
| `effective_from` | `DATE` | NO | | Segment window start · CORE/C&B cut (**O4**) |
| `effective_to` | `DATE` | NO | | Segment window end · inclusive policy in API |
| `base_salary_snapshot` | `NUMERIC(15,2)` | YES | | CB snapshot at segment eval |
| `hours_payable` | `NUMERIC(12,4)` | YES | | Sum from **closed** lines date-filtered (**O6**) |
| `segment_gross` | `NUMERIC(15,2)` | YES | | Time-varying gross for segment (**O8**) |
| `archived_at` | `TIMESTAMPTZ` | YES | | Soft-delete |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | |
| `updated_at` | `TIMESTAMPTZ` | NO | `now()` | |

| Constraint (hint) | Rule |
|-------------------|------|
| **UQ segment order** | `UNIQUE (payslip_id, segment_seq)` |
| **CHK dates** | `effective_from <= effective_to` |
| **IX** | `(company_id, payslip_id)` · `(payslip_id)` |
| **Forbidden columns** | **No** `tax_amount` · **no** `gtgc_amount` · **no** `si_employee_amount` · **no** `si_employer_amount` on this table (**DV-14**) |

| Question | Ruling |
|----------|--------|
| Closable from LIVE? | **YES** — table **ABSENT** · greenfield child |
| Closable **this** seat? | **NO migrate** — stamp only |
| Writer behavior | On split process: DELETE segments for payslip (re-process policy) → INSERT 1..N rows transactional with header upsert · **≠** second payslip |
| **FAIL** | Orphan segments without payslip · static cols on segment · two payslips same NV+period |
| Unlock | **F-PAY-SPLIT-01** persistence · **AC-PAY-04-SEGMENT-DB** · **J-HRM-PAY-04-02** |

**Paper alias:** logical `pay_payslip_split_segment` → physical **`payroll_payslip_split_segments`** (consistent with `payroll_payslips` / `payroll_payslip_lines`).

**Idempotent DDL pattern (Dev reference only):** `CREATE TABLE IF NOT EXISTS public.payroll_payslip_split_segments (...)` inside payroll ensureSchema **after** API-01 LOCK — **not** this governance seat.

### 6.2 HOLD waiver — paper header static columns

| Residual | Waiver | Owner · trigger |
|----------|--------|-----------------|
| **`tax_amount` / `gtgc_amount` / `si_*` on `payroll_payslips`** | **HOLD** — use `deduction_amount` + deduction **lines** for GĐ1 C-SLICE static-once semantics | **dev-be** split merge · **qa** **AC-PAY-04-MERGE-STATIC-ONCE** |
| Reopen ADD named header cols | When PAY-03 GTCG + PAY-05 SI depth stamped + QA requires DB inspect of named fields | **ba-data** delta + migrate seat |

### 6.3 HOLD waiver — orchestration (not schema)

| Residual | Waiver | Owner |
|----------|--------|-------|
| **R-PAY-04-DETECT/SEGMENT/EVAL/MERGE** | Runtime **ABSENT** | **dev-be** after API |
| **HRM-PAY-SPLIT-409** | App guard | **dev-be** + **qa** J-04-05 |
| **BR-BP-SPL-02** ceiling math | **HOLD** | **PAY-05** |
| **GTCG dependents** | **HOLD** | **PAY-03** |

---

## 7. Lifecycle — segment rows

| State | Meaning | Transition |
|-------|---------|------------|
| **active** | `archived_at IS NULL` · tied to payslip | Created on successful split process |
| **archived** | `archived_at` set | Re-process replaces via delete+insert or archive policy (API-01) |

| Invalid | Expected |
|---------|----------|
| Segment without parent payslip | **FK reject** |
| `segment_seq` gap or duplicate | **UQ reject** |
| Payslip void (future) with live segments | API policy — **HOLD** PAY-08 |

---

## 8. scope_parity (U19)

| Surface | Resolver | Parity rule |
|---------|----------|-------------|
| `GET …/payslips` list | Same as PAY periods/payslips | Segment expand only on get-by-id when stamped |
| `GET …/payslips/:id` + `segments[]` | Same `payslip_id` scope as list row | CEO `main` rollup consistent with PAY-01/02 |
| Segment `company_id` | Must equal parent payslip | Mismatch → **409** on write |

Trace: **J-HRM-PAY-04-02** · **J-HRM-PAY-04-06** list→detail.

---

## 9. Traceability (SRS → DB → API → FE → test)

| BR/AC | Physical | API (GAP/RETAIN) | FE / J-* | Evidence |
|-------|----------|------------------|----------|----------|
| **O1** ONE-NET · **DV-13** | `payroll_payslips` UQ | F-PAY-SPLIT internal | **J-HRM-PAY-04-04** | one row |
| **O2** SEGMENT-DB | §6.1 ADD | F-PAY-SPLIT persist | **J-HRM-PAY-04-02** | N rows · 1 payslip_id |
| **O3** DV-14 | segment col allow-list | — | inspect | no static on segment |
| **O6** CLOSED-HOURS | `hours_payable` col | F-PAY-ATT-CLOSED-01 **RETAIN** | **J-HRM-PAY-04-07** | PAY01QC1 |
| **O9** MERGE-STATIC | header/lines **RETAIN** | F-PAY-SPLIT merge GAP | **J-HRM-PAY-04-03** | §6.2 waiver |
| **O12** PROCESS-ORDER | — | ATT-412 → FORMULA → split | regression **J-PAY-02-05** | PAY02QC1 |
| **O14** MK-PEERS | peer tables cite | — | **J-HRM-PAY-04-08** | stamps |
| Diễn biến **#1–#3** | segment + header | F-PAY-PROCESS-01 step 4 GAP | **J-04-01..03** | U65 |

---

## 10. Data interaction matrix (PAY-04 slice)

| Entity | Create | Read | Update | Delete/Archive | PAY-04 seat |
|--------|--------|------|--------|----------------|-------------|
| `payroll_payslips` | process upsert | list/get | process refresh | policy | **RETAIN** · one net |
| `payroll_payslip_split_segments` | split process | get payslip `segments[]` | re-process replace | `archived_at` | **ADD stamp** |
| `payroll_payslip_lines` | eval output | get lines | re-process | — | **RETAIN** peer PAY-02 |
| Peer bind/lines | ATT/PAY | closed bag | — | — | **must_keep PAY01** |
| `att_leave_hold` | — | — | — | — | **DENY invent** |

---

## 11. Deterministic error mapping (data-related)

| Code / condition | When | HTTP | Data note |
|------------------|------|------|-----------|
| **DV-13** unique payslip | Second insert same period+employee | **409** | UQ `uq_payroll_payslip_period_employee` |
| **`HRM-PAY-SPLIT-409`** | Double static merge detected | **409** | app guard · **≠** DB trigger alone |
| **`HRM-PAY-ATT-412`** (peer) | No closed bind | **412** | before segment write |
| **`HRM-PAY-FORMULA-412`** (peer) | No formula | **412** | before split |
| Segment FK violation | Bad `payslip_id` | **4xx** | scope |
| Invent **`att_leave_hold`** | migration | — | **process defect** |

---

## 12. Closability analysis (exit gate)

| Candidate ADD | Closable? | Verdict |
|---------------|-----------|---------|
| **`payroll_payslip_split_segments`** full §6.1 | **YES** — ABSENT · FK parent exists · no orphans | **ADD stamp** |
| HARD FK segment → compensation timeline | **NO** — CORE ring soft | **app** detect (**R-PAY-04-DETECT**) |
| ALTER payslip add `tax_amount`/`gtgc`/`si_*` | **YES** technically · **not required** for segment closable | **HOLD waiver** §6.2 |
| `split_segments_json` on payslip | **NO** — violates SA deny blob SoT | **REJECT** |
| `att_leave_hold` | **NO** | **DENY** |

---

## 13. Unlock next

| Field | Value |
|-------|--------|
| **next_owner** | **sa** (API-01 cluster) · **pm** orchestration |
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01` |
| **Mission** | F.1 deepen **F-PAY-SPLIT-01** inside **F-PAY-PROCESS-01** · cite §6.1 physical name · **DV-13/14** · optional `segments[]` on **F-PAY-PAYSLIP-01** · **HRM-PAY-SPLIT-409** · **must_keep** **F-PAY-ATT-CLOSED-01** / **PAY01QC1** / **PAY02QC1** process order · **DENY** Nest `/core` · **DENY** `att_leave_hold` · **DENY** merge buckets · **DENY** claim PAY-04 module DONE |

---

## 14. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See §15 |
| **next_owner** | `sa` · `pm` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md` |

---

## 15. completion_report

**Closed:** ba-data **CONFIRMED ADD stamp** for UC-BP-PAY-04 / FR-UC-BP-PAY-04 / BR-BP-SPL-01 against SA Option A + BA O1–O18 — **stamped closable** **`public.payroll_payslip_split_segments`** (paper `pay_payslip_split_segment` §5.8) with FK `payslip_id` · `segment_seq` · `effective_from/to` · `base_salary_snapshot` · `hours_payable` · `segment_gross` · `company_id` · **DV-14** forbid static tax/GTCG/SI on segment; **HOLD RETAIN** **`payroll_payslips`** + **`uq_payroll_payslip_period_employee`** (**DV-13**); **HOLD waiver** paper header `tax_amount`/`gtgc_amount`/`si_*` cols (GĐ1 via deduction + lines); **must_keep** **`PAY01QC1-MSMBGWC1`** + **`PAY02QC1-MSMC4GWC1`** + **`ATT12QC1-MSMAIGWC1`** + **`ATT11QC1-MSLXTH9P`** + ATT peer chain; **DENY** `att_leave_hold` · **DENY** merge compensatory/sick/carry→annual · validation + lifecycle + scope parity + traceability; **≠ PAY-04 DONE** · **≠ payroll_e2e_ready** · **C-SLICE**; docs-only · no `apps/**` · no seed · no migrate this seat.

**Residual open (not DATA migrate this seat):** sa **API-01** F.1 · dev-be ensureSchema + split orchestration + 409 · dev-fe `segments[]` display · qa **J-HRM-PAY-04-01..08** + regression PAY-01/02/ATT · QC GWC C-SLICE · PAY-03/05 header col depth · optional future ALTER header static cols.

---

## 16. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01
role: sa
lane: governance · UC-BP-PAY-04 · FR-UC-BP-PAY-04 · BR-BP-SPL-01 · DATA-01 PASS_TO_PM CONFIRMED ADD stamp
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-DATA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md (F-PAY-SPLIT-01 · F-PAY-PROCESS-01 step (4) · HRM-PAY-SPLIT-409 · F-PAY-PAYSLIP-01 segments[])
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md (must_keep F-PAY-ATT-CLOSED-01 · HRM-PAY-ATT-412)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-API-01.md (must_keep process order · gd1_eval_v1 C-SLICE)
entry_criteria: ba-data stamped payroll_payslip_split_segments §6.1 closable · DV-13/14 mapped · must_keep PAY01QC1 + PAY02QC1 + ATT12/ATT11 peer seals · payroll_e2e_ready=false · U65
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md
  - F.1 per function: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (FR-UC-BP-PAY-04 Diễn biến #1–#3 · FAIL · Thành công)
  - Physical table name payroll_payslip_split_segments · segment DTO ↔ §6.1 columns · DENY static fields on segment · one payslip_id · display-ready process result + optional GET segments[]
  - RETAIN F-PAY-ATT-CLOSED-01 + ATT-412 → FORMULA-412 before split · HRM-PAY-SPLIT-409
  - ack_status PASS_TO_PM
cấm: invent att_leave_hold · merge buckets · Nest /core SoT · two payslips per segment · split_segments_json SoT · claim API pointer = PAY-04 DONE · flip payroll_e2e_ready · wipe PAY01QC1 / PAY02QC1 / ATT seals · reopen J-HRM-PAY-01-* / J-HRM-PAY-02-05..07 / J-ATT-12/07/06 · seed · apps/** (docs-only seat)
```
