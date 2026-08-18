# Evidence — PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01` |
| **lane** | governance · ba-data |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-10) |
| **uc_ids** | `UC-BP-CORE-01` |
| **Date** | 2026-08-09 |
| **depends_on** | BA-01 O1–O12 CONFIRMED · SA-01 Option A LOCKED · peer `REC07QC1-MSL5WXU5` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED** |
| **change_mode** | DOC-DELTA physical · **NO** `apps/**` · **no migrate run** · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| ONE dependents SoT (`employee_dependents` ↔ `hrm_dependent`) | **PASS** — §5 cols: full_name · relation_code · date_of_birth · is_tax_dependent · archived_at · company_id |
| Public allow-list + CB deny-list on LIVE employees | **PASS** — §4 strip/reject · no second EMP table |
| DENY Nest `/core` dual · Nest `/rec` · second deps · hard FK hire · CORE-02 on public · seed · honesty · apps/** | **PASS** §1/§11 |
| Unlock sa API-01 F-CORE-EMP-01 UPGRADE + F-CORE-DEP-01 ADD — not Dev | **PASS** §12 |
| Cite BA O2/O5 · SA Option A · REC-07 seal | **PASS** |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| BA-01 | O2 allow-list · O3 CB-403/F5 · O5 deps · O6 tax boundary · VAL-CORE-PUB-* · AC-CORE-01-* |
| SA-01 | Option A LOCKED · LIVE `/employees*` + deps ADD · paper `/core` alias · REJECT B/C |
| AS-IS Nest (read-only) | `employees.service.ts` ensureSchema LIVE cols + `candidate_id` · `EMPLOYEE_SALARY_NUM_SQL` CF salary · deps person CRUD **ABSENT** · PAY `dependent_count` ≠ person |
| Paper DB | §3.1 public EMP · §3.3 `hrm_dependent` · §3.2 C&B OUT |
| Hire DATA | REC-07 DATA-01 soft link RETAIN · ≠ CORE DONE |

---

## 3. Physical decisions (summary)

1. **EMP:** RETAIN `public.employees` · public DTO ⊆ column allow + CF allow · CB deny-list strip/403.
2. **Deps:** ADD `public.employee_dependents` ONE SoT · soft archive · scope = emp company_id.
3. **Boundary:** `is_tax_dependent` OK · GTCG mutate OUT · family ≠ salary.
4. **Path:** physical `/employees*` + `/dependents*` · `/core` alias only.

---

## 4. Honesty

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| CORE / personnel UAT | **false** |
| C-SLICE | GWC later ≠ module UAT |

---

## 5. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **sa** |
| **next_work_item** | `PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01` |
| **Dev** | **HOLD** until API CONFIRMED |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-01
depends_on: DATA-01 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md
spec_ref: F-CORE-EMP-01 UPGRADE · F-CORE-DEP-01 ADD · BR-BP-SEC-01 · BA O1–O12 · DATA §4–§5

MISSION — API F.1 lock (docs-only):
1) UPGRADE F-CORE-EMP-01 physical GET/PATCH/list on /api/hrm/employees* — public-only serializer from DATA §4 allow-list; PATCH/POST CB deny-list → 403 HRM-CORE-CB-403; F5 no leak; paper /api/hrm/core/employees/{id} = alias only
2) ADD F-CORE-DEP-01 GET/POST/PATCH/(soft)DELETE /api/hrm/employees/:id/dependents* on employee_dependents — mint HRM-CORE-DEP-VAL-400 / DEP-404; display-ready relation_label; U19 list=get=patch=deps
3) RETAIN HTP-05 · F-REC-HIRE-01 · soft candidate_id · CF/status consumers · DENY Nest /core dual EMP · Nest /rec dual · second deps SoT · CORE-02 write · hire=CORE DONE · seed · honesty · apps/**
4) Unlock Dev-BE + Dev-FE after API CONFIRMED — not before

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md · PASS_TO_PM · next Dev HOLD until CONFIRMED
```

---

## 6. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | DATA-01 CONFIRMED: ONE `employee_dependents` + public EMP strip/deny map on LIVE `employees`; DENY dual Nest/core/rec · second SoT · hard FK hire · CORE-02 on public · seed · honesty · apps/**; unlock sa API-01 — not Dev. |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |