# SA-U71-HRM-LEAVE-DESIGN-01 — Physical DB_DESIGN + API_DESIGN (Leave)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-LEAVE-DESIGN-01` |
| **lane** | governance · U71 |
| **date** | 2026-07-27 |
| **change_mode** | ADD |
| **ack_status** | **PASS_TO_PM** |
| **forbidden** | `apps/**` (not touched) |

---

## 1. Deliverables

| Artifact | Path | F.1 / physical |
|----------|------|----------------|
| DB_DESIGN | `docs/hrm/DB_DESIGN_HRM_LEAVE.md` | `leave_requests` + `employee_leave_balances`; indexes; TEXT `company_id`; soft catalog FK `leave_types` |
| API_DESIGN | `docs/hrm/API_DESIGN_HRM_LEAVE.md` | Create / list / approve / reject / balance + WF resolve + terminal — each with Mục đích · Nghiệp vụ · Bước SRS · DTO↔DB · lỗi |

---

## 2. Spec read ack

| Layer | Cite |
|-------|------|
| Gap scan | `docs/qa/evidence/sa-u71-spec-gap-scan-01-20260727.md` Leave P0 |
| TechSpec | `docs/hrm/TECHSPEC.md` §14.5 · §16.1 FR-AT-10/12/13 · §17.1 |
| SRS khách | `SRS_HRM_KHACH.md` FR-HRM-AT-10 Diễn biến #4–#10 · AT-12 · AT-13 |
| SRS WF | delta `SRS_HRM_KHACH_DELTA_CAI_DAT_20260723.md` **FR-HRM-AT-WF-01** Diễn biến #1–#6 (closes G-ORPH-03 cite path for bridge) |
| Team SRS | `docs/hrm/SRS.md` UC-HRM-10 fanout |
| Style | `docs/hrm/API_DESIGN_HRM_COMPANY_LIST.md` / `DB_DESIGN_HRM_COMPANY_DISPLAY.md` |
| Runtime truth | `leave-requests.service.ts` ensureSchema · `HRM-ATT-LEAVE-TYPE` · overlap/balance codes · `LeaveWorkflowController` |

---

## 3. must_keep verified in docs

| Rule | Documented |
|------|------------|
| `company_id` TEXT slug (not LE UUID) | DB §1.1 + API create/list/approve |
| Catalog partition `resolveHrmSettingsCatalogCompanyId` | DB §1.3 + API §9 |
| `HRM-ATT-LEAVE-TYPE` | API Endpoint A errors |
| Leave-workflow bridge terminal | API Endpoints F–G · AT-WF-01 steps |
| Soft `employee_id` | DB §1 / §3 |

---

## 4. Residual

| ID | Note | Owner |
|----|------|-------|
| OpenAPI thin | `hrm-api.yaml` leave paths lack full error schemas — optional Dev sync | `dev-be` when coding wave |
| G-ORPH-03 | Bridge Diễn biến cited via **FR-HRM-AT-WF-01** delta (not shallow AT-10-only) — no PASS_TO_BA required for F.1 close | — |
| Settings catalog U71 | `leave_types` SoT CRUD still separate `SA-U71-HRM-SETTINGS-CATALOG-DESIGN-01` | PM queue |

---

## 5. Handoff

### completion_report

**Closed:** U71 Leave physical pair — `DB_DESIGN_HRM_LEAVE.md` + `API_DESIGN_HRM_LEAVE.md` with F.1 triad on create/list/approve/reject/balance + WF resolve/terminal; aligned to TechSpec §14.5/§16.1, SRS Diễn biến, Nest ensureSchema column truth; must_keep TEXT slug + catalog partition + leave-type error code.

**Residual:** OpenAPI deepen optional; settings catalog design still separate P0.

### next_owner

`pm`

### next_dispatch_prompt

```text
Operate as pm. work_item_id SA-U71-HRM-LEAVE-DESIGN-01 CLOSED.
Read docs/qa/evidence/sa-u71-hrm-leave-design-01-20260727.md.
Update U71 backlog: Leave module COMPLETE under physical F.1.
Do NOT dispatch Dev leave feature without read_first:
  - docs/hrm/DB_DESIGN_HRM_LEAVE.md
  - docs/hrm/API_DESIGN_HRM_LEAVE.md
  - docs/hrm/TECHSPEC.md §14.5
Continue parallel U71 writes if open: SA-U71-HRM-CO-HC-DESIGN-01 · SA-U71-HRM-SETTINGS-CATALOG-DESIGN-01 · SA-U71-XBOS-ORG-LEGAL-DESIGN-01.
If Dev leave mutate wave needed: Task dev-be with spec_read_ack including db_design+api_design+Diễn biến AT-10/12/13/AT-WF-01; must_keep TEXT company_id + HRM-ATT-LEAVE-TYPE; U65 zero-seed; then qa UF leave create→list→approve.
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/sa-u71-hrm-leave-design-01-20260727.md`

### pm_dispatch_hint

Mark Leave U71 pair DONE; queue remaining P0 design writes; any leave Dev must cite these two files in `read_first`.
