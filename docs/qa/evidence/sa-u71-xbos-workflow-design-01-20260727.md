# SA-U71-XBOS-WORKFLOW-DESIGN-01 — Physical DB_DESIGN + API_DESIGN (F.1)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-XBOS-WORKFLOW-DESIGN-01` |
| **lane** | governance · U71 P1 |
| **date** | 2026-07-27 |
| **change_mode** | ADD · preserve_default |
| **forbidden** | `apps/**` (not touched) · wipe catalog-gov / Settings |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Spec read ack

| Layer | Path · section |
|-------|----------------|
| Prior residual | `docs/qa/evidence/sa-u71-xbos-catalog-gov-design-01-20260727.md` — next WI this slice |
| TechSpec | `docs/xbos/TECHSPEC.md` **§12.3** · **§14.8 FR-XBOS-WF-01** · **§14.9 FR-XBOS-WF-03** · **§14.10 FR-XBOS-WF-04** |
| SRS khách | `docs/client-delivery/xbos/SRS_XBOS_KHACH.md` **§3.8** Diễn biến #1–7 · **§3.9** #1–6 · **§3.10** #1–7 |
| UF must_keep | `USER_FLOW_OPERABILITY_MATRIX.md` **UF-XBOS-08** · **UF-XBOS-09** · **UF-XBOS-15** 🟢 |
| Bridge must_keep | `docs/xbos/DB_DESIGN_XBOS_CATALOG_GOV.md` **§6** · `API_DESIGN_XBOS_CATALOG_GOV.md` §8 |
| Gate | `.cursor/rules/spec-db-api-design-gate.mdc` · OS `13` §3.4.11.F/F.1 |
| Runtime truth | `FoundationSchemaService` `xbos_workflow_*` · `WorkflowEngineController/Service` · `workflow-catalog.constants` · OpenAPI M01-WF |

---

## 2. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| DB_DESIGN | `docs/xbos/DB_DESIGN_XBOS_WORKFLOW.md` | **ADD** — def/instance/step_task + indexes + catalog/leave/REC bridge keys |
| API_DESIGN | `docs/xbos/API_DESIGN_XBOS_WORKFLOW.md` | **ADD** — create def / start / list tasks / complete / reject F.1 |
| Pointers | `docs/tech-spec/DB_DESIGN_XBOS_WORKFLOW.md` · `API_DESIGN_XBOS_WORKFLOW.md` | **ADD** thin |
| Index | `docs/tech-spec/README.md` §2 + §3 | **Promoted** · count **12** pairs |

### F.1 checklist (API)

| Endpoint | Mục đích | Nghiệp vụ | Bước SRS | DTO↔DB | Errors |
|----------|----------|-----------|----------|--------|--------|
| POST/PUT `…/workflow-engine/definitions*` | ✅ | ✅ | FR-WF-01 #1–7 | ✅ | WF-201 / BR-WF-01 / 409 |
| POST `…/workflow-engine/instances` | ✅ | ✅ | FR-WF-03 #1–6 · UF-08 | ✅ | WF-201 / 409 |
| GET `…/workflow-engine/tasks` | ✅ | ✅ | FR-WF-04 #2 · FR-WF-03 #4 | ✅ | WF-203 empty OK |
| POST `…/tasks/{taskId}/complete` | ✅ | ✅ | FR-WF-04 #1–7 · UF-08 | ✅ | WF-200 / BR-WF-02 |
| POST `…/tasks/{taskId}/reject` | ✅ | ✅ | WF-04 alt · G-W2-REJ-01 note | ✅ | WF-205 |

---

## 3. Architecture notes (facts)

- Physical canvas SoT column = **`graph` JSONB** (runtime DDL). TechSpec §12.3 «payload» = wire alias only (`body.payload` / `steps` / `graph` → `graph`).
- Catalog bridge wire: `business_type = hrm_catalog_extension` (constant `WF_BUSINESS_TYPE_HRM_CATALOG`); catalog-gov §6 shorthand `HRM_CATALOG` = docs alias — **must not** persist literal `HRM_CATALOG`.
- Catalog step key must_keep: `group_catalog_approval`; `business_id` = HRM `batchId`.
- Index runtime: `idx_xbos_wf_instance_biz (tenant_id, company_id, business_type, business_id)`.
- Unique def: `(tenant_id, workflow_code, version)`; Option B member `company_id` override on resolve.
- **must_keep:** catalog-gov + Settings pairs unchanged; UF-08/09/15 🟢; U65 zero-seed; empty inbox valid in steady state.

---

## 4. Residual

| Item | Owner | Priority |
|------|-------|----------|
| OpenAPI deepen full graph JSON schema | `dev-be` | when execution |
| FR khách reject depth G-W2-REJ-01 | BA W2 | P3 |
| XBOS RACI + position-rbac + CC catalogs physical | `SA-U71-XBOS-RACI-RBAC-CAT-DESIGN-01` | P1 |
| Optional TechSpec §12.3 prose payload→graph | SA delta | non-blocking |

---

## 5. Handoff

### completion_report

**Closed:** U71 P1 physical F.1 pair for XBOS workflow engine — `DB_DESIGN_XBOS_WORKFLOW.md` + `API_DESIGN_XBOS_WORKFLOW.md` covering create/upsert definition, start instance, list tasks, complete, reject with Mục đích · Nghiệp vụ · bước SRS (FR-WF-01/03/04 Diễn biến) · DTO↔DB · errors; catalog bridge keys aligned to runtime `hrm_catalog_extension`; catalog-gov §6 + Settings must_keep; tech-spec pointers + README §2 promote to **12** pairs; no `apps/**`.

**Residual:** OpenAPI deepen; G-W2-REJ-01 P3; RACI/RBAC WI; optional TechSpec §12.3 wording.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: SA-U71-XBOS-RACI-RBAC-CAT-DESIGN-01
role: sa
lane: governance · U71 P1
read_first:
  - docs/xbos/TECHSPEC.md (RACI / position-rbac / CC catalogs sections)
  - docs/xbos/RACI_GOVERNANCE_TECHSPEC.md
  - docs/xbos/DB_DESIGN_XBOS_WORKFLOW.md (assignment_id soft cite — must_keep)
  - .cursor/rules/spec-db-api-design-gate.mdc
deliver:
  - docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md (or split per slice)
  - docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md (F.1)
  - promote docs/tech-spec/README.md §2 + thin pointers
exit: F.1 pair; PASS_TO_PM
evidence_path: docs/qa/evidence/sa-u71-xbos-raci-rbac-design-01-YYYYMMDD.md
cấm: apps/** · wipe workflow / catalog-gov / Settings pairs
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/sa-u71-xbos-workflow-design-01-20260727.md`

### pm_dispatch_hint

`SA-U71-XBOS-RACI-RBAC-CAT-DESIGN-01` — next XBOS P1 physical; workflow COMPLETE for Dev `read_first` on workflow-engine deepen (keep CAT facade for UF-09/15).
