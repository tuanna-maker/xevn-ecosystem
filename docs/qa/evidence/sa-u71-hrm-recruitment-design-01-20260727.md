# SA-U71-HRM-RECRUITMENT-DESIGN-01 — Physical DB/API F.1 (Recruitment)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-RECRUITMENT-DESIGN-01` |
| **lane** | governance · U71 P1 |
| **date** | 2026-07-27 |
| **change_mode** | ADD |
| **forbidden** | `apps/**` (not touched) |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| DB_DESIGN | `docs/hrm/DB_DESIGN_HRM_RECRUITMENT.md` | **ADDED** |
| API_DESIGN (F.1) | `docs/hrm/API_DESIGN_HRM_RECRUITMENT.md` | **ADDED** |
| Thin pointers | `docs/tech-spec/DB_DESIGN_HRM_RECRUITMENT.md` · `API_DESIGN_HRM_RECRUITMENT.md` | **ADDED** |
| Index | `docs/tech-spec/README.md` §2 + §3 + §5 must_keep | **UPDATED** |

---

## 2. F.1 checklist (API_DESIGN)

| Endpoint | Mục đích | Nghiệp vụ | Bước SRS | Verdict |
|----------|----------|-----------|----------|---------|
| `GET …/requisitions` | ✅ | ✅ | FR-RC-01 #6/#7 · UC-HRM-22 | **PASS** |
| `POST …/requisitions` | ✅ | ✅ | FR-RC-01 #3/#4/#6/#8 · `HRM-REC-201` | **PASS** |
| `GET …/requisitions/:id` | ✅ | ✅ | FR-RC-01 detail · scope parity | **PASS** |
| `PATCH …/requisitions/:id` | ✅ | ✅ | status/headcount + `HRM-REC-WF-LOCKED` | **PASS** |
| `POST …/requisitions/:id/submit-workflow` | ✅ | ✅ | §18.2 Option B · FR-RC-01 unlock WF | **PASS** |
| `POST …/candidates` (+ requisition_id) | ✅ | ✅ | FR-RC-03 #7 · `HRM-REC-202` | **PASS** |
| `GET …/candidates` | ✅ | ✅ | FR-RC-03 #7/#8 | **PASS** |
| `POST …/interviews` | ✅ | ✅ | FR-RC-05 #7 · `HRM-REC-203` | **PASS** |

---

## 3. DB spine (facts from TechSpec + runtime ensureSchema)

| Table | Key invariants locked |
|-------|----------------------|
| `job_requisitions` | TEXT `company_id`; `headcount ≥ 1`; WF columns; status CHECK WF-extended |
| `recruitment_candidates` | Hard FK → requisitions; soft `employee_id` |
| `recruitment_interviews` | Hard FK → **recruitment_candidates** (not catalog) |

**must_keep cited:** §17.6 dual catalog; G-RC-01; XHRM-REC-WF LOCK; UF-HRM-12; employees/CI/leave pairs untouched.

---

## 4. Residual

| ID | Note | Next |
|----|------|------|
| G-RC-02 | Create defaults `open` vs SRS nháp/chờ duyệt | Optional BA/Dev when closing FR-RC-01 full DONE |
| G-RC-03 | No `needed_by` date column | P2 — do not invent without BA |
| OpenAPI deepen | yaml F.1 bước SRS | Execution wave |
| Next U71 P1 | Payroll / XBOS WF / RACI | PM backlog §3 |

---

## 5. Handoff

### completion_report

**Closed:** U71 physical F.1 pair for HRM Recruitment — DB (Lane A three tables + REC-WF columns) + API (list/create/get/update + submit-workflow + RC-03/05 stages); tech-spec README indexed; thin pointers; employees/CI/leave must_keep preserved; no `apps/**`.

**Residual:** G-RC-02/03 documented; Lane B leftover out-of-scope; payroll / XBOS WF still missing physical pairs.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: SA-U71-HRM-PAYROLL-DESIGN-01
role: sa
lane: governance · U71 P1
read_first:
  - docs/tech-spec/README.md §3
  - docs/hrm/TECHSPEC.md §14.6 FR-PR-05
  - docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md (soft refs)
  - .cursor/rules/spec-db-api-design-gate.mdc
deliver:
  - docs/hrm/DB_DESIGN_HRM_PAYROLL.md
  - docs/hrm/API_DESIGN_HRM_PAYROLL.md (F.1 each endpoint)
  - Update docs/tech-spec/README.md §2 + thin pointers
change_mode: ADD · must_keep employees/CI/leave/recruitment pairs
forbidden: apps/**
exit: F.1 pair; PASS_TO_PM
evidence_path: docs/qa/evidence/sa-u71-hrm-payroll-design-01-20260727.md
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/sa-u71-hrm-recruitment-design-01-20260727.md`

### pm_dispatch_hint

`SA-U71-HRM-PAYROLL-DESIGN-01` or `SA-U71-XBOS-WORKFLOW-DESIGN-01` — next P1 physical writes from README §3.
