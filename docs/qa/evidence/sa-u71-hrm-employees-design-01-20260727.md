# SA-U71-HRM-EMPLOYEES-DESIGN-01 — Employees Plane B DB + API F.1

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-EMPLOYEES-DESIGN-01` |
| **lane** | governance · U71 P1 |
| **date** | 2026-07-27 |
| **change_mode** | ADD |
| **ack_status** | **PASS_TO_PM** |
| **forbidden** | `apps/**` (not touched) |

---

## 1. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| DB_DESIGN | `docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md` | **ADD** — `public.employees` Plane B TEXT slug, indexes, soft FKs, custom_fields bag, dual-plane align CO-HC |
| API_DESIGN | `docs/hrm/API_DESIGN_HRM_EMPLOYEES.md` | **ADD** — list/get/create/update F.1 + summary cross-ref; scope parity list↔get |
| Pointers | `docs/tech-spec/DB_DESIGN_HRM_EMPLOYEES.md` · `API_DESIGN_HRM_EMPLOYEES.md` | **ADD** thin pointers |
| Index | `docs/tech-spec/README.md` | Promote employees CRUD out of backlog §3 → §2 |

---

## 2. F.1 checklist

| Endpoint | Mục đích | Nghiệp vụ | Bước SRS | DTO↔DB | Errors |
|----------|----------|-----------|----------|--------|--------|
| `GET /employees` | ✅ | ✅ | UC-HRM-21 · FR-EM-01 #7/#8 | ✅ | ✅ |
| `GET /employees/{id}` | ✅ | ✅ | FR-EM-01 #8/#9 · U19 parity | ✅ | ✅ |
| `POST /employees` | ✅ | ✅ | FR-EM-01 Diễn biến #1–#7 | ✅ | ✅ DUPLICATE / JOB-TITLE |
| `PATCH /employees/{id}` | ✅ | ✅ | FR-EM-01 maintain + #6 | ✅ | ✅ |
| `GET /employees/summary` | Cross-ref | — | → `API_DESIGN_HRM_EMPLOYEES_SUMMARY` · UC-HRM-CO-01 #4–6 | — | — |

**Scope parity:** documented list ↔ get ↔ summary same `resolveHrmListScope`.

**must_keep verified in docs:** TEXT `company_id` slug · dual-plane · U72 labels FE · no LE UUID SoT.

---

## 3. Alignment / residuals

| Item | Note |
|------|------|
| Align CO-HC | Same five slugs + anti LE UUID; headcount aggregation stays in CO-HC pair |
| G-EM-01..04 | Retained as TechSpec gaps — not closed by design ADD |
| Profile sub-resources | Out of scope (degrees/assets/…) |
| U72 | Explicit non-goal BE; cite `SRS_FIELD_DISPLAY.md` |

---

## 4. Handoff

### completion_report

**Closed:** Physical U71 F.1 pair for HRM Employees CRUD + list scope (`DB_DESIGN_HRM_EMPLOYEES` + `API_DESIGN_HRM_EMPLOYEES`) with Plane B slug must_keep, soft FKs, indexes, scope parity list↔get, summary cross-ref; tech-spec pointers + README promote.

**Residual:** Optional OpenAPI deepen for POST/PATCH; G-EM-* product deltas; next U71 P1 (ATT sheet / contracts-ins / recruitment / payroll) per scan backlog.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: SA-U71-HRM-ATT-SHEET-DESIGN-01 (or next P1 from scan)
role: sa
read_first:
  - docs/hrm/TECHSPEC.md §12.1 §13 §14.4 FR-AT-14
  - docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md (soft employee_id pattern)
  - .cursor/rules/spec-db-api-design-gate.mdc
deliver:
  - docs/hrm/DB_DESIGN_HRM_ATT_SHEET.md
  - docs/hrm/API_DESIGN_HRM_ATT_SHEET.md (F.1 each)
exit: F.1 complete; PASS_TO_PM
evidence_path: docs/qa/evidence/sa-u71-hrm-att-sheet-design-01-YYYYMMDD.md
Cấm: apps/** · Dev Employees feature without citing new pair in read_first
Optional: mark SA-U71-HRM-EMPLOYEES-DESIGN-01 COMPLETE on U71 board; do not Dev-mutate employees unless product delta cites both design files.
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/sa-u71-hrm-employees-design-01-20260727.md`

### pm_dispatch_hint

`SA-U71-HRM-ATT-SHEET-DESIGN-01` next P1 physical write — Employees pair COMPLETE for Dev read_first.
