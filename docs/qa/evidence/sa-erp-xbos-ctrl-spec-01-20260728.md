# SA-ERP-XBOS-CTRL-SPEC-01 — XBOS apply-to-members expand (SPEC only)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-ERP-XBOS-CTRL-SPEC-01` |
| **from_role** | pm |
| **to_role** | sa |
| **lane** | governance `E-XBOS-CTRL-SPEC` — **docs ONLY** · **NO** `apps/**` · **NO** Dev G1/G2 |
| **date** | 2026-07-28 |
| **program** | `FIDELITY_PROGRAM_DISPATCH.md` Cohort 5 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **SPEC READY** · **Dev HOLD** · BA SRS landed · await **sponsor chốt** |

---

## 1. read_first ack

| # | Artifact | Result |
|---|----------|--------|
| 1 | `FIDELITY_PROGRAM_DISPATCH.md` Cohort 5 | Expand allow-list; TechSpec+DB+API; sponsor chốt before Dev |
| 2 | `sa-xbos-hrm-control-gap-01-20260728.md` | PARTIAL; G1 allow-list misses departments/leave_types |
| 3 | `DANH_MUC_XBOS_CHO_HRM.md` | DM-07 copy; STT inventory |
| 4 | `API_DESIGN_XBOS_CATALOG_GOV.md` + OpenAPI | Apply F.1-lite; AS-IS allow-list **3 keys** |
| 5 | `DB_DESIGN_HRM_SETTINGS_E1B.md` §3.1 | ≥10 bucket keys for P0/P1 alignment |
| 6 | Runtime cite (read-only) | `APPLY_TO_MEMBERS_CATALOG_ALLOWLIST` = job_titles, recruitment_channels, job_grades |
| 7 | `BA_ERP_XBOS_CTRL_SPEC_01_20260728.md` | SRS SoT P0/P1 — SA triad aligned |

---

## 2. Correction (fact)

Cohort summary text implied AS-IS ≈ `{job_titles, leave_types, departments}`.  
**AS-IS runtime/OpenAPI = `{job_titles, recruitment_channels, job_grades}`.**  
P0 Settings keys `departments` + `leave_types` are **missing** from allow-list (control-gap G1 confirmed).

---

## 3. Deliverables produced

| Artifact | Path |
|----------|------|
| TechSpec | `docs/xbos/TECHSPEC_XBOS_APPLY_TO_MEMBERS_EXPAND.md` |
| DB_DESIGN | `docs/xbos/DB_DESIGN_XBOS_APPLY_TO_MEMBERS_EXPAND.md` |
| API_DESIGN F.1 | `docs/xbos/API_DESIGN_XBOS_APPLY_TO_MEMBERS_EXPAND.md` |
| Pointers | `docs/tech-spec/TECHSPEC|DB|API_DESIGN_XBOS_APPLY_TO_MEMBERS_EXPAND.md` |
| Parent DOC-DELTA | `API_DESIGN_XBOS_CATALOG_GOV.md` §14 · `DB_DESIGN_XBOS_CATALOG_GOV.md` §11 · `TECHSPEC.md` G-BM-REC-01 |

### Design locks

| Lock | Decision |
|------|----------|
| Option | **C** — constant allow-list; **P0 then P1** (BA); **no DDL** |
| AS-IS | `job_titles`, `recruitment_channels`, `job_grades` |
| **P0** (min G1) | + `departments`, `leave_types` |
| **P1** (gated) | + `contract_types`, `employment_types`, `pay_types`, `shifts`, `decision_types` |
| DEC | Path canonical `decision_types`; **write key = source L0** (may stay `hr_decision_types`) |
| P2 HOLD | `salary_components`, insurers/types, kpi_library, rest DANH_MUC |
| HRM consume | Existing pull/sync-from-xbos — **no new push URL** |
| Dev unlock | **FORBIDDEN** this WI |

---

## 4. DoD vs Cohort 5

| DoD item | Status |
|----------|--------|
| TechSpec expand + consume pattern | **DONE** |
| DB_DESIGN (+ migration path = none G1) | **DONE** |
| API_DESIGN F.1 + auth/scope | **DONE** |
| SRS BR/AC formal | **DONE** (BA delta) |
| U71 sequence before Dev | SRS → TechSpec → DB → API **complete**; Dev HOLD |
| Sponsor chốt → G1/G2 | **Not claimed** |

---

## 5. Facts / assumptions / non-goals

**Facts:** OpenAPI + Nest const 3 keys; E1-B matrix ≥10 buckets; spine publish→apply→pull exists.  
**Assumptions:** Member slug targets still valid for fan-out after P0/P1 expand (no live re-probe).  
**Non-goals:** `apps/**`, Dev unlock, Phase1/PROD, seed, full 72 STT.

---

## 6. Handoff

### completion_report

**Closed:** XBOS TechSpec + DB_DESIGN + API_DESIGN F.1 for apply-to-members; Option C no-DDL; aligned BA P0/P1; DEC write-key reconcile; parent DOC-DELTA; Dev HOLD.  
**Residual:** Sponsor chốt E-XBOS-CTRL-SPEC; then E-XBOS-CTRL-G1 (P0 min) ± P1; G2 HRM only if pull gap; P2 HOLD; FE apply UI residual.

### next_owner

`pm` → sponsor chốt `E-XBOS-CTRL-SPEC` → then `dev-be` E-XBOS-CTRL-G1 (P0).

### next_dispatch_prompt

```text
work_item_id: PM-ERP-XBOS-CTRL-SPONSOR-CHOT-01
from_role: sa
to_role: pm
lane: governance — NO apps/**; NO Dev until sponsor chốt
entry_criteria:
  - SA-ERP-XBOS-CTRL-SPEC-01 PASS_TO_PM evidence docs/qa/evidence/sa-erp-xbos-ctrl-spec-01-20260728.md
  - BA SRS delta docs/program/deltas/BA_ERP_XBOS_CTRL_SPEC_01_20260728.md
  - TechSpec/DB/API: docs/xbos/*_XBOS_APPLY_TO_MEMBERS_EXPAND.md
ask_sponsor:
  - Chốt E-XBOS-CTRL-SPEC: unlock E-XBOS-CTRL-G1 with P0 allow-list
    {job_titles, recruitment_channels, job_grades, departments, leave_types}
  - Optional same wave: unlock P1 keys (contract_types, employment_types, pay_types, shifts, decision_types)
after_chốt_dispatch:
  work_item_id: D-BE-XBOS-CTRL-G1-ALLOWLIST-01
  to_role: dev-be
  exit: expand APPLY_TO_MEMBERS_CATALOG_ALLOWLIST P0 (+P1 if chốt); alias normalize; OpenAPI description; jest CFG-005; CODE-MEMORY APPEND; READY_FOR_QA
  cấm: new tables · seed · claim G2/HRM unless pull reject
```

### evidence_path

`docs/qa/evidence/sa-erp-xbos-ctrl-spec-01-20260728.md`

### ack_status

**PASS_TO_PM**
