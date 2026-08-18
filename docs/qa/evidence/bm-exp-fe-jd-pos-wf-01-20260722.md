# BM-EXP-FE-JD-POS-WF-01 — FE inventory (JD · Positions · WF · Funnel)

| Field | Value |
|-------|--------|
| work_item_id | `BM-EXP-FE-JD-POS-WF-01` |
| from_role | pm |
| to_role | explore |
| program | `P1-BMINUTES-CUST-RETEST-01` |
| dated | 2026-07-22 |
| mode | Inventory ONLY — no `apps/**` edits · no seed |
| ack_status | **PASS_TO_PM** |

Repo root: `c:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem`

---

## Summary verdict

| Area | Verdict | One-line |
|------|---------|----------|
| 1. JD library + create | **PASS** | Tab «Thư viện JD» + create/edit dialog → POST `/job-templates` |
| 1b. Requisition JD binding | **FAIL** (vs JD-only) | Template optional; free-text JD always allowed |
| 2. Positions catalogs XBOS/HRM | **PASS** | XBOS Positions settings + HRM settings-catalogs `job_titles`/`positions` |
| 2b. Hire / employee picker shows job title | **FAIL** | Hire dialog shows code+name+(dept); `department` mapped null; ignores `position`/`job_title_key` |
| 3. Workflow assignee design | **PASS** | Canvas supports `direct_manager` / `position_template` / `parallel_group` / `fixed_user` / `role_code` (+ legacy hat) |
| 3b. WF position UX | **PARTIAL** | `position_code` is free-text, not catalog picker |
| 4. Recruitment dashboard funnel | **PASS** | 6 F6 columns wired from live candidate stages |

---

## Check matrix

| Check | File path (absolute under repo) | Exists? | Gap? |
|-------|----------------------------------|---------|------|
| JD library tab wired on Recruitment | `c:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\web\hrm\src\pages\Recruitment.tsx` (`activeTab === 'jd-library'`, tab id `jd-library`) | Yes | No |
| JobTemplatesTab create/edit UI | `c:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\web\hrm\src\components\recruitment\JobTemplatesTab.tsx` | Yes | No — dialog «Thêm JD» / Sửa (not a separate route; tab+dialog) |
| JD templates hook + API client | `c:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\web\hrm\src\hooks\useJobTemplates.ts` · `...\apps\web\hrm\src\integrations\hrmApi.ts` (`/api/hrm/recruitment/job-templates`) | Yes | No |
| BE job-templates CRUD | `c:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\api\hrm-api\src\recruitment\recruitment.controller.ts` · `...\dto\create-job-template.dto.ts` | Yes | No |
| Requisition form can pick JD template | `c:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\web\hrm\src\components\recruitment\JobRequisitionsTab.tsx` (`job_template_id`, `applyTemplate`, Select «Lấy từ thư viện JD») | Yes | **Yes** — `NONE_TEMPLATE` / optional; not JD-only |
| Requisition free-text JD | Same `JobRequisitionsTab.tsx` — `job_description` Textarea «Điền sẵn từ template hoặc nhập tay»; schema `job_template_id` optional | Yes | **Yes** if product requires JD-from-library only |
| XBOS positions / chức danh settings UI | `c:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\web\web-portal\src\pages\settings\PositionsSettingsPage.tsx` · route `...\App.tsx` `path="positions"` | Yes | Soft: also ORG GRADE chức danh editors on Command Center |
| XBOS business-master / config-sync `job_titles` | `c:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\api\xbos-api\src\config-sync\config-sync.service.ts` · `...\business-master\business-master.service.ts` (`positions`) | Yes | No for catalog existence |
| HRM settings catalogs UI (incl. chức danh labels) | `c:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\web\hrm\src\components\settings\SettingsCatalogsTab.tsx` · `...\lib\catalogDisplayLabels.ts` (`positions: 'Chức danh'`) | Yes | No |
| Employee form position from catalog | `c:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\web\hrm\src\components\employee\EmployeeFormDialog.tsx` (`job_titles` / `positions` / `employee_positions` → Select; else free Input) | Yes | Soft — free Input when catalog empty |
| Hire employee picker shows job title | `c:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\web\hrm\src\components\recruitment\HireEmployeeLinkDialog.tsx` | Yes (dialog) | **Yes** — label = `code — name (department)`; `mapHrmEmployeeRecord` sets `department: null`, `position: job_title_key` unused in UI |
| Employee record map for pickers | `c:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\web\hrm\src\hooks\useEmployee.ts` (`mapHrmEmployeeRecord`) | Yes | **Yes** — dept null; title only on `position` |
| Other satellite pickers show title? | Insurance: `...\AddInsuranceDialog.tsx` (`full_name - employee_code` only). Attendance OT/BT/…: name+code only. Leave: name+code · deptLabel (job_title_key fallback as “dept”) | Yes | **Yes** — no consistent job-title column |
| WF canvas + step resolver FE | `c:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\web\web-portal\src\pages\command-center\WorkflowCanvas.tsx` · `...\WorkflowStepResolverFields.tsx` · `...\data\workflow-resolver.ts` | Yes | Soft — `position_code` / `user_id` free-text; legacy hat when resolver unset |
| WF resolver types (title / manager / parallel / fixed) | Same `workflow-resolver.ts`: `direct_manager`, `position_template`, `parallel_group`, `fixed_user`, `role_code` | Yes | No for capability; fixed_user is opt-in not sole path |
| WF mapper round-trip resolver | `c:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\web\web-portal\src\integrations\workflowMapper.ts` | Yes | No |
| BE resolver registry | `c:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\api\xbos-api\src\workflow-engine\resolver-registry.ts` | Yes | No (execution lane BE already present) |
| Recruitment funnel 6 status columns | `c:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\web\hrm\src\lib\recruitmentFunnel.ts` · `...\CandidatePipelineFunnel.tsx` · wired in `Recruitment.tsx` | Yes | No — stages: `new`, `screening`, `interview`, `offer`, `hired`, `rejected` |

---

## Detail notes (evidence)

### 1) JD library

- Tab label «Thư viện JD» → `JobTemplatesTab`.
- Create path: button «Thêm JD» opens Dialog; fields `code`, `title`, `position_name`, `job_description`, `requirements`, `notes`; mutate via `useJobTemplates` → POST/PATCH job-templates.
- **Not** a standalone `/jd/new` route — in-tab dialog is the create screen.
- Requisition create: Select «Lấy từ thư viện JD» with option «Không dùng template»; selecting template **snapshots** description into editable Textarea (comment: not live link). Free-text always available.

### 2) Positions / chức vụ

- **XBOS:** `PositionsSettingsPage` (business-master `positions` + position templates API).
- **HRM:** Settings catalogs overview/sync; employee form binds position Select to catalog keys `job_titles` | `positions` | `employee_positions`.
- **Hire picker FAIL:** `HireEmployeeLinkDialog` never renders `emp.position` / `job_title_key`; `department` always null from mapper → users only see code + name.

### 3) Workflow designer assignees

- FE enum supports assignee-by-title (`position_template`), manager (`direct_manager`), parallel (`parallel_group` + all|any), role, and fixed user — **not** hardcoded-user-only.
- Command Center still has legacy `handlerRoleId` / hat when `resolver_type` empty.
- Soft UX gap: position/user fields are typed codes, not HRM/XBOS catalog pickers.

### 4) Dashboard tuyển dụng funnel

- Normative F6 columns + VI labels in `recruitmentFunnel.ts`.
- `CandidatePipelineFunnel` always renders all 6 columns (`lg:grid-cols-6`); counts from `buildRecruitmentFunnelCounts(candidates)`.
- Click column → switch to Candidates tab filtered by stage.

---

## FAIL → copy-ready Dev-FE work items

### BM-EXP-FE-JD-REQ-ONLY-01 (P0 if sponsor locks JD-from-library)

```text
work_item_id: BM-EXP-FE-JD-REQ-ONLY-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
entry_criteria: BM-EXP-FE-JD-POS-WF-01 inventory; U65 no seed; read JobRequisitionsTab + UC-HRM-RC-08 / AC-CD-F6-02
exit_criteria:
  - Create requisition: JD template Select required (no __none__ / no empty job_template_id) OR sponsor-confirmed hybrid retained with AC text
  - If JD-only: hide/disable free-text until template applied; still allow snapshot edit after apply if SRS says so
  - jest/unit or FE smoke notes; READY_FOR_QA with UF-HRM-12 / J-HRM-05 path
evidence_path: docs/qa/evidence/bm-exp-fe-jd-req-only-01-YYYYMMDD.md
allowed_paths:
  - apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx
  - apps/web/hrm/src/hooks/useJobTemplates.ts (if needed)
forbidden_paths: apps/api/** (unless BA/SA says BE must enforce job_template_id NOT NULL)
cấm: seed
```

### BM-EXP-FE-HIRE-TITLE-01 (P0 — hire/employee picker job title)

```text
work_item_id: BM-EXP-FE-HIRE-TITLE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
entry_criteria: BM-EXP-FE-JD-POS-WF-01; FR-HRM-INT-01 hire bind; U65 no seed
exit_criteria:
  - HireEmployeeLinkDialog SelectItem shows job title (emp.position / job_title_key), e.g. «CODE — Name · Chức danh»
  - Fix or stop relying on emp.department when mapHrmEmployeeRecord.department is always null
  - Align Leave/Insurance pickers optionally via shared formatEmployeePickerLabel helper (same wave if small)
  - unit test on label helper; READY_FOR_QA browser hire path
evidence_path: docs/qa/evidence/bm-exp-fe-hire-title-01-YYYYMMDD.md
allowed_paths:
  - apps/web/hrm/src/components/recruitment/HireEmployeeLinkDialog.tsx
  - apps/web/hrm/src/hooks/useEmployee.ts (mapHrmEmployeeRecord dept/position if needed)
  - apps/web/hrm/src/lib/* (optional shared picker label)
  - matching *.test.ts
cấm: seed · fake employee rows
```

### BM-EXP-FE-WF-POS-PICKER-01 (P1 — soft gap UX)

```text
work_item_id: BM-EXP-FE-WF-POS-PICKER-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P1
entry_criteria: ADR-WORKFLOW-RESOLVER-DYNAMIC; WorkflowStepResolverFields exists; catalogs available
exit_criteria:
  - position_template.position_code selectable from XBOS/HRM chức danh catalog (not only free-text)
  - fixed_user remains available; parallel_group unchanged
  - workflowMapper round-trip tests still PASS
evidence_path: docs/qa/evidence/bm-exp-fe-wf-pos-picker-01-YYYYMMDD.md
allowed_paths:
  - apps/web/web-portal/src/pages/command-center/WorkflowStepResolverFields.tsx
  - apps/web/web-portal/src/data/workflow-resolver.ts
  - apps/web/web-portal/src/integrations/* (catalog fetch if needed)
cấm: seed · hardcode user ids as only assignee path
```

---

## PASS areas (no Dev-FE required from this inventory)

- JD create library UI + API surface.
- XBOS/HRM chức danh catalog surfaces for employee form / settings.
- WF dynamic resolvers (manager / title / parallel) already on canvas + BE registry.
- Recruitment dashboard F6 funnel columns + live counts.

---

## Handoff

```yaml
work_item_id: BM-EXP-FE-JD-POS-WF-01
from_role: explore
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/bm-exp-fe-jd-pos-wf-01-20260722.md
completion_report: >
  Inventory complete. JD library create exists (tab+dialog). Requisition allows
  optional JD template + free-text (FAIL if JD-only required). Positions catalogs
  exist XBOS+HRM. Hire picker does NOT show job title (FAIL). WF designer supports
  title/manager/parallel/fixed (PASS; position_code free-text PARTIAL). Funnel
  6 F6 columns PASS.
next_owner: pm
next_dispatch_prompt: |
  Dispatch Dev-FE BM-EXP-FE-HIRE-TITLE-01 (P0) and BM-EXP-FE-JD-REQ-ONLY-01
  if sponsor confirms JD-only; optionally BM-EXP-FE-WF-POS-PICKER-01 (P1).
  Then QA retest hire bind + requisition create + funnel click (U65 browser-only).
```
