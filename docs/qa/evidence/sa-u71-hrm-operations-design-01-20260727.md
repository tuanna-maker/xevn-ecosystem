# SA-U71-HRM-OPERATIONS-DESIGN-01 — Physical DB + API (OP-01..04)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-OPERATIONS-DESIGN-01` |
| **from_role** | `pm` |
| **to_role** | `sa` |
| **lane** | governance · U71 P2 physical design |
| **change_mode** | ADD · preserve_default |
| **date** | 2026-07-27 |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| DB_DESIGN (canonical) | `docs/hrm/DB_DESIGN_HRM_OPERATIONS.md` | **ADD** |
| API_DESIGN (canonical) | `docs/hrm/API_DESIGN_HRM_OPERATIONS.md` | **ADD** |
| Pointer DB | `docs/tech-spec/DB_DESIGN_HRM_OPERATIONS.md` | **ADD** |
| Pointer API | `docs/tech-spec/API_DESIGN_HRM_OPERATIONS.md` | **ADD** |
| Index promote | `docs/tech-spec/README.md` §2 → **18** pairs · §3 OP **DONE** · Fleet residual | **UPDATED** |

**forbidden_paths:** `apps/**` — **not touched**.

---

## 2. F.1 checklist (API_DESIGN)

| § | Endpoint | Mục đích | Nghiệp vụ xử lý | Bước SRS (UC/FR + Diễn biến) | Verdict |
|---|----------|----------|-----------------|------------------------------|---------|
| A | `POST /api/hrm/operations/tasks` | ✅ Tạo công việc vận hành | ✅ validate + UUID map + status todo | FR-HRM-OP-01 #1/#3/#4/#5/#6/#7/#8 | **PASS** |
| B | `GET /api/hrm/operations/tasks` | ✅ List / empty | ✅ resolveHrmListScope + UUID filter + pagination | FR-HRM-OP-02 #1/#2/#3/#5/#6/#8 · G-OP-02 #4/#7 residual | **PASS** |
| C | `PATCH …/tasks/:taskId/status` | ✅ Đổi trạng thái | ✅ load + assertResourceInHrmScope + CHK enum | FR-HRM-OP-03 #1/#2/#3/#6/#7/#8 · G-OP-03 #4/#5 residual | **PASS** |
| D | `GET …/operations/reports/summary` | ✅ Tổng hợp chỉ số | ✅ multi-table countByScope · zeros honest | FR-HRM-OP-04 #1/#4/#5/#6/#7/#8 · G-OP-04 FE | **PASS** |

---

## 3. must_keep (verified not rewritten)

| Pair | Path |
|------|------|
| HRM W2 slice | `docs/hrm/DB_DESIGN_HRM_W2_SLICE.md` · API |
| HRM Payroll | `docs/hrm/DB_DESIGN_HRM_PAYROLL.md` · API |
| HRM Leave | `docs/hrm/DB_DESIGN_HRM_LEAVE.md` · API |
| HRM ATT sheet | `docs/hrm/DB_DESIGN_HRM_ATT_SHEET.md` · API |
| XBOS Auth/Tenant | `docs/xbos/DB_DESIGN_XBOS_AUTH_TENANT.md` · API |
| XBOS RACI / WF / catalog-gov / KPI | prior `docs/xbos/DB_DESIGN_XBOS_*` |

---

## 4. Architecture facts (evidence-based)

| Fact | Source |
|------|--------|
| `hrm_tasks.company_id` UUID + CHK priority/status | `OperationsService.ensureSchema` |
| Persist map slug→UUID (`main`→holding) | `resolveHrmOperationsPersistCompanyId` |
| List filter UUID array | `pushCompanyIdUuidFilter` |
| Summary counts tasks+SR UUID; payroll/recruitment TEXT; attendance workforce | `getSummary` |
| No assignee / task_type columns | CreateTaskDto + DDL (G-OP-01) |
| List DTO page only | ListTasksQueryDto (G-OP-02) |

---

## 5. Residual

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **G-OP-01** | P2 | `dev-be` | Optional assignee + task_type vs SRS |
| **G-OP-02** | P2 | `dev-be` | List filters status/type/keyword |
| **G-OP-03** | Info/P2 | `ba`/`dev-be` | Strict SM + note if BA locks |
| **G-OP-04** | P2 | `dev-fe` | Summary FE bind + empty honesty |
| **G-OP-PLANE-01** | P2 | `dev-be` | Optional UUID→TEXT migrate (class G-MD-PLANE-01) |
| **G-SCOPE-01** | P0 standing | `dev-be`+`qa` | on-touch tasks list/mutate |
| Index `hrm_tasks` | P2 | `dev-be` | ADD idx company+status |
| **SA-U71-HRM-FLEET-DESIGN-01** | P2 | `sa` | **next** backlog FL-01 |

**Non-claims:** Phase 1 DONE · PROD-READY · UF 🟢 bulk · seed for evidence.

---

## 6. Handoff

### completion_report

**Closed:** U71 P2 HRM Operations physical design — `DB_DESIGN_HRM_OPERATIONS` + `API_DESIGN_HRM_OPERATIONS` F.1 for POST/GET tasks · PATCH status · GET reports/summary; `service_requests` twin + ATT/Payroll/Recruitment cited for aggregate only; thin pointers; README §2 count **18**; §3 OP marked DONE; F.1 checklist complete; must_keep W2/payroll/leave/ATT + XBOS Auth/RACI/WF/catalog-gov/KPI preserved; no `apps/**`.

**Residual:** G-OP-01/02/04 · G-OP-PLANE-01 · G-SCOPE-01 on-touch · next SA Fleet FL-01 · OpenAPI deepen when Dev opens.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: SA-U71-HRM-FLEET-DESIGN-01
role: sa
lane: governance · U71 P2
read_first:
  - docs/hrm/TECHSPEC.md §16.5 FR-HRM-FL-01
  - docs/hrm/DB_DESIGN_HRM_OPERATIONS.md (must_keep sibling — do not wipe)
  - docs/tech-spec/README.md §3 residual FL/admin/import
  - templates TECHSPEC_PHYSICAL_DB_TABLE + TECHSPEC_API_CONTRACT
deliver:
  - docs/hrm/DB_DESIGN_HRM_FLEET.md (hrm_fleet_vehicles)
  - docs/hrm/API_DESIGN_HRM_FLEET.md F.1 GET /api/hrm/fleet/vehicles (+ filters)
  - thin pointers + README §2 promote
  - evidence docs/qa/evidence/sa-u71-hrm-fleet-design-01-YYYYMMDD.md
change_mode: ADD · preserve_default
cấm: apps/** · wipe Operations/W2/payroll/leave/ATT · seed · Phase1/PROD claim
```

### evidence_path

`docs/qa/evidence/sa-u71-hrm-operations-design-01-20260727.md`

### ack_status

**PASS_TO_PM**
