# GOV-HRM-CO-EMP-SRS-01 — SRS ADD Company Management headcount

| Field | Value |
|-------|--------|
| **work_item_id** | `GOV-HRM-CO-EMP-SRS-01` |
| **date** | 2026-07-27 (ICT) |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **change_mode** | **ADD** (cấm rewrite wipe) |
| **no_prompt_echo** | true |
| **ack_status** | **PASS_TO_PM** |
| **apps/** | **not edited** |

---

## 1. Inputs read

| Artifact | Use |
|----------|-----|
| `docs/qa/evidence/ba-hrm-co-emp-count-01-20260727.md` | AC-CO-EMP-01..06 · BR-CO-EMP · prior QA insufficient |
| `docs/qa/evidence/ba-data-hrm-co-emp-linkage-01-20260727.md` | Plane A↔B · BR-CO-HC-01 · VAL-CO-HC · anti-join UUID |
| `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` | Align UC/FR ids on `company` rows |
| `docs/hrm/SRS.md` §15.4 BR-INT-05 · embed UC pattern | Uniform FR ADD target |

---

## 2. Normative root cause locked in SRS

1. Company UI listed XBOS Plane A legal entities but hardcoded `employee_count: null` → UI `\|\| 0`
2. Workforce lives on Plane B: `employees.company_id` = operating TEXT slug
3. Dashboard used HRM summary (correct); Company page never joined HRM COUNT
4. Prior QA PASS on «list visible» without headcount AC = insufficient

---

## 3. Artifacts updated (ADD-only)

| File | Delta |
|------|--------|
| `docs/hrm/SRS.md` | §1.1 row Company headcount; embed catalog **UC-HRM-CO-01**; full **UC-HRM-CO-01 / FR-HRM-CO-HC-01** (Purpose, Usecases, sequenceDiagram VI, Business Logic BR-INT-05/BR-CO-*, anti-pattern, success outcome, Data Interaction & Validation, AC-CO-EMP-01..06, J-HRM-CO-01); §15.4 BR-INT-05 UI binding + BR-CO-HC-01 / BR-CO-EMP-01..02; §15.5 card ↔ cardinality |
| `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` | `company` / `/company` cite UC-HRM-CO-01 / FR-HRM-CO-HC-01; §5 title; §6 **BR-CO-HC-01**; footer GOV id |
| `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md` | Row **351a** `UC-HRM-CO-01` · `impl_status: planned`; summary note +1 ADD |

**Not changed:** UC-HRM-03 body (company-admin CRUD) — preserved; client `SRS_HRM_KHACH.md` promote deferred to ba-docs if sponsor requires customer HTML.

---

## 4. Spec lock checklist (Dev/QA cannot miss)

| ID | Locked |
|----|--------|
| FR-HRM-CO-HC-01 / UC-HRM-CO-01 | Yes — SRS embed section |
| BR-INT-05 UI binding | Yes — §15.4 cite |
| BR-CO-HC-01, BR-CO-EMP-01, BR-CO-EMP-02 | Yes — SRS + matrix |
| AC-CO-EMP-01..06 | Yes — SRS + matrix §5 |
| Anti-pattern null\|\|0 · COUNT LE UUID · XBOS-only SoT | Yes — SRS Business Logic |
| Success: card ≈ `summary.main.total`; row = `by_company[slug].total` | Yes |

---

## Completion contract

### completion_report

- **Closed:** Governance SRS ADD for Company Management headcount; matrix + PHASE1 row 351a aligned; root cause + AC/BR/anti-pattern normative.
- **Residual:** Execution D-HRM-CO-EMP-COUNT-BE-01 + FE-01 → QA-HRM-CO-EMP-COUNT-01; optional ba-docs promote to `SRS_HRM_KHACH`; inventory regenerate if PM wants STT 245→246 formal.

### next_owner

`pm` → parallel **dev-be** + **dev-fe**, then **qa**

### next_dispatch_prompt

```text
work_item_id: D-HRM-CO-EMP-COUNT-BE-01 + D-HRM-CO-EMP-COUNT-FE-01 (parallel) then QA-HRM-CO-EMP-COUNT-01
from_role: pm
entry_criteria: GOV-HRM-CO-EMP-SRS-01 PASS_TO_PM — read docs/hrm/SRS.md UC-HRM-CO-01 / FR-HRM-CO-HC-01; docs/qa/evidence/gov-hrm-co-emp-srs-01-20260727.md; ba-hrm-co-emp-count-01 + ba-data-hrm-co-emp-linkage-01; matrix AC-CO-EMP. U65 zero-seed. change_mode ADD/FIX. must_keep GROUP_MEMBER_SLUGS + AC-EMP-COL LE names. forbidden: null||0; COUNT by LE UUID; XBOS-only headcount SoT; apps outside company/summary bind.
exit_criteria BE: expose/enrich headcount by operating slug + main rollup ≈ GET /employees/summary?company_id=main total; jest slug COUNT. evidence docs/qa/evidence/dev-be-hrm-co-emp-count-01-20260727.md READY_FOR_QA.
exit_criteria FE: bind card Tổng NV + cột Số nhân viên; fail → «—»; F5; Network HRM 2xx. evidence docs/qa/evidence/dev-fe-hrm-co-emp-count-01-20260727.md READY_FOR_QA.
exit_criteria QA: browser AC-CO-EMP-01..06 + J-HRM-CO-01; Dashboard parity; cấm PASS list-only. evidence docs/qa/evidence/qa-hrm-co-emp-count-01-20260727.md PASS_TO_PM.
spec_read_ack required on both Dev Tasks.
```

### evidence_path

`docs/qa/evidence/gov-hrm-co-emp-srs-01-20260727.md`

### ack_status

**PASS_TO_PM**
