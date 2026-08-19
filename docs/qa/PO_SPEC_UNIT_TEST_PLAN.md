# PO — Unit Test Plan (bám Spec / API spine P0)

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-SPEC-UNIT-TEST-PLAN-01` |
| **Date** | 2026-08-03 |
| **Owner** | qa (+ cite jest paths for dev-be) |
| **Program** | `docs/program/PO_SPEC_TEST_SUITE_PROGRAM.md` §2.2 |
| **Status** | T4 P0-1..P0-3 **QA VERIFIED** (`PO-SPEC-UNIT-TEST-IMPL-01-QA`) — HOLD P0-4 + ladder; complete reject SPEC_GAP |
| **Locks** | U65 zero-seed · **cấm** invent leave L1/L2 ladder unit without sponsor `T_L1` · **cấm** claim full API coverage |

## 0. Spec sources (read)

| Artifact | Status | Notes |
|----------|--------|-------|
| `docs/brand-new-documents-20270801/API_CONTRACT_VN.md` | Present (thin) | Lists METHOD paths; error catalog incomplete vs runtime |
| `API_CONTRACT_NEW.md` | **MISSING on disk** | Cited in leave CODE-MEMORY / BE evidence as §4.2 `HRM-LEAVE-VAL-ATT` — treat runtime codes + `docs/hrm/TECHSPEC.md` §14–§17 as binding until NEW restored |
| `docs/hrm/TECHSPEC.md` | Present | FR → HTTP → code matrix (AT-10/12/13, RC-03, INT-01, EM) |
| `docs/qa/evidence/po-e2e-ba-case-matrix-01.md` | Present | HP-* / LV-* case IDs; LV-02 SPEC_GAP |
| Recent BE evidence | Present | `po-e2e-spine-02-be-lv03-val-att-01` · `po-e2e-spine-01-be-cand-dto-01` · `r-spine-mgr-hier-01-be` · inbox BE-INBOX-01 |

**Gap label legend**

| Gap | Meaning |
|-----|---------|
| **COVERED** | Jest asserts input → expect code/behavior for the BR |
| **PARTIAL** | Related its exist; missing ≥1 fail-deep / path / code |
| **MISSING** | No dedicated unit case for the BR (P0 if spine) |
| **BLOCKED** | Spec HOLD / SPEC_GAP — **do not** invent unit (ladder `T_L1`) |

---

## 1. P0 endpoint coverage matrix

### 1.1 Leave — create / list / decide

| METHOD path | BR / SRS step | Unit cases (input → expect) | Existing spec file | Gap |
|-------------|---------------|----------------------------|--------------------|-----|
| `POST /api/hrm/attendance/leave-requests` | FR-UC-H03 · **BR-LEAVE-ATT-01** · TECHSPEC FR-HRM-AT-10 · LV-03 | `leave_type=sick`, `total_days≥3`, no `attachment_url` → **`HRM-LEAVE-VAL-ATT`** (no INSERT) | `apps/api/hrm-api/src/attendance/leave-requests.service.spec.ts` (`API_CONTRACT §4.2: sick ≥3…`) | **COVERED** |
| same | BR-LEAVE-ATT-01 catalog ốm | `leave_type=LVT_02`, days≥3, no attach → **`HRM-LEAVE-VAL-ATT`** | same (`PO-E2E-SPINE-02 LV-03: LVT_02 ≥3…`) | **COVERED** |
| same | BR-LEAVE-ATT-01 boundary | `LVT_02`, days&lt;3, no attach → create OK (label Ốm) | same (`LVT_02 <3…`) | **COVERED** |
| same | BR-LEAVE-ATT-01 metadata | catalog label Ốm / `metadata.is_sick` ≥3 → **`HRM-LEAVE-VAL-ATT`** | same | **COVERED** |
| same | VAL-W7-LATT-02 path | `attachment_url` outside `/api/hrm/files/` → **`HRM-LEAVE-VAL-ATT`** | same (`VAL-W7-LATT-02…`) | **COVERED** |
| same | G-AT10-02 overlap | overlapping pending/approved → **`HRM-LEAVE-VAL-OVERLAP`** | same | **COVERED** |
| same | G-AT10-02 balance | insufficient tracked balance → **`HRM-LEAVE-VAL-BALANCE`** | same | **COVERED** |
| same | Happy + display | sufficient balance → INSERT + `status_label` / `leave_type_label` | same (`W1-B-01-TC-LEAVE…`) | **COVERED** |
| same | FR-UC-H03 «gửi trước ≥3 ngày lịch» | start_date &lt; today+3 calendar → reject code TBD | — | **MISSING** (SRS cite; BE enforce unproven — plan only; confirm code with BA/Dev before green) |
| `GET /api/hrm/attendance/leave-requests` | FR-HRM-AT-10 list scope | `company_id=main` workforce scope; SELECT includes `attachment_url` | `leave-requests.service.spec.ts` | **COVERED** |
| `POST …/leave-requests/:id/approve` | FR-HRM-AT-12 · LV-01 AS-IS | approve pending under `main`/`holding` → **`HRM-LEAVE-203` path** + balance settle + display «Đã duyệt» | same (`approveLeaveRequest…` / `W1-B-01 approve settles…`) | **COVERED** (happy + scope) |
| `POST …/leave-requests/:id/reject` | FR-HRM-AT-13 | reject → display «Từ chối» + release pending | same | **COVERED** |
| leave WF spawn | D-HDSD-WF-LEAVE-BIND | create returns `workflow_instance_id` after spawn | `leave-requests.service.spec.ts` + `leave-workflow.bridge.spec.ts` | **COVERED** |
| leave L2 ladder | FR-UC-H03 «hai cấp» · **GAP-LEAVE-LADDER-01** · LV-02 | `total_days > N` requires L2 before APPROVED | — | **BLOCKED** — wait sponsor `T_L1` / BR-LEAVE-LADDER-01; **cấm** invent `N` |

### 1.2 Employees — `manager_id`

| METHOD path | BR / SRS step | Unit cases (input → expect) | Existing spec file | Gap |
|-------------|---------------|----------------------------|--------------------|-----|
| `PATCH /api/hrm/employees/:id` | FR-UC-H01 · TECH_SPEC TS-EMP · R-SPINE-MGR-HIER | body `{manager_id: uuid}` valid same company → persist | `employees.service.spec.ts` (`R-SPINE-MGR-HIER-01-BE manager_id write`) + `employee-manager.validation.spec.ts` | **COVERED** |
| same | clear | `{manager_id: null}` → clear OK | both | **COVERED** |
| same | self | `manager_id === employeeId` → **`HRM-EMP-MGR-SELF`** | both | **COVERED** |
| same | missing/archived | unknown manager → **`HRM-EMP-MGR-404`** | `employee-manager.validation.spec.ts` | **COVERED** |
| same | cross-company | manager other `company_id` → **`HRM-EMP-MGR-SCOPE`** | both | **COVERED** |
| same | cycle | A→B→A → **`HRM-EMP-MGR-CYCLE`** | both | **COVERED** |
| same | ESS authz | self employee JWT PATCH manager → **`HRM-EMP-403`** | `employees.service.spec.ts` | **COVERED** |
| `POST /api/hrm/employees` | create with manager | valid `manager_id` on INSERT | `employees.service.spec.ts` (`create persists manager_id…`) | **COVERED** |

### 1.3 Recruitment — candidates DTO + G-DB-01 hire

| METHOD path | BR / SRS step | Unit cases (input → expect) | Existing spec file | Gap |
|-------------|---------------|----------------------------|--------------------|-----|
| `POST /api/hrm/recruitment/candidates` (pool, no `requisition_id`) | FR-HRM-RC-03 · HP-04 FE form · forbidNonWhitelisted | FE-shaped body (`position`,`rating`,`nationality`,`hometown`,`marital_status`,`expected_start_date`,…) → **0** validation errors | `po-e2e-spine-01-be-cand-dto-01.spec.ts` | **COVERED** |
| same | unknown prop | extra non-FE field → validation error (still forbid) | same | **COVERED** |
| same | persist | INSERT includes FE form columns | same (`createCandidatePool persist`) | **COVERED** |
| `PATCH …/candidates-pool/:id` (DTO) | PATCH parity | `UpdateCandidatePoolDto` accepts same form fields | same | **COVERED** |
| `POST/PATCH` stage=`hired` without link | **G-DB-01** · FR-HRM-INT-01 #5 | create pool `stage=hired` no `employee_id` → **`HRM-REC-HIRE-400`**, no INSERT; PATCH same | `po-e2e-spine-01-be-cand-dto-01.spec.ts` | **COVERED** (`PO-SPEC-UNIT-TEST-IMPL-01`) |
| hire link helper | G-DB-01 · Diễn biến #4/#5/#7 | see §2 — `hire-employee-link.spec.ts` | `hire-employee-link.spec.ts` | **COVERED** (`PO-SPEC-UNIT-TEST-IMPL-01`) |
| hire cross-company | G-DB-01 · **`HRM-REC-HIRE-409`** | employee `company_id` ≠ candidate → **409** | `hire-employee-link.spec.ts` | **COVERED** |
| hire reverse link | G-DB-01 resolve | `employees.candidate_id` reverse → resolve OK → stamp | `hire-employee-link.spec.ts` | **COVERED** |
| WF terminal hire | VAL-REC-WF-05/06 | completed + `employee_id` → stage hired; without → CALLBACK-SKIP `hire_ac_unmet` | `recruitment-workflow.bridge.spec.ts` | **COVERED** (bridge) |
| Lane A create candidate | FR-HRM-RC-03 requisition | missing requisition → deterministic error; main→holding create | `recruitment.service.spec.ts` | **COVERED** (happy/fail scope; not FE form whitelist — Lane B) |

### 1.4 Workflow / Inbox (XBOS)

| METHOD path | BR / SRS step | Unit cases (input → expect) | Existing spec file | Gap |
|-------------|---------------|----------------------------|--------------------|-----|
| `GET` step tasks / inbox list | HP-03 · PO-E2E-SPINE-01-BE-INBOX-01 | enrich `workflow_name` / `display_title` from `subjectTitle` stamp | `apps/api/xbos-api/src/workflow-engine/workflow-engine.service.spec.ts` + `workflow-inbox-display.spec.ts` | **COVERED** |
| `POST …/complete` (step task) | HP-03 / J-REC-WF | complete → instanceCompleted; terminal notify uses `instance_id` | `workflow-engine.service.spec.ts` | **COVERED** (terminal / sibling) |
| spawn / reject terminal | VAL-REC-WF / J-06 | reject remaps id→instance_id | same | **COVERED** |
| BR-WF-04 chống tự duyệt | FR-UC-B03 · LV-05 | submitter cannot be sole assignee via resolver skip-self | `resolver-registry.spec.ts` (`BR-WF-04 anti self-approve`) | **COVERED** (resolver seam); **PARTIAL** completeStepTask reject — no product reject seam (SPEC_GAP residual) |

---

## 2. MISSING P0 — suggested jest `describe` / `it` (Dev Task)

> **IMPL status 2026-08-03 (`PO-SPEC-UNIT-TEST-IMPL-01`):** P0-1 **COVERED** · P0-2 **COVERED** · P0-3 resolver **COVERED** (complete reject SPEC_GAP) · P0-4 **HOLD** · ladder **BLOCKED**. Evidence: `docs/qa/evidence/po-spec-unit-test-impl-01.md`.  
> **QA re-verify 2026-08-03 (`PO-SPEC-UNIT-TEST-IMPL-01-QA`):** jest hrm 17 PASS · xbos 11 PASS · COVERED↔`it` map OK · no plan correction. Evidence: `docs/qa/evidence/po-spec-unit-test-impl-01-qa.md`.

Priority order for **`PO-SPEC-UNIT-TEST-IMPL-01`** (dev-be):

### P0-1 — Restore / add `hire-employee-link` unit (G-DB-01) — **DONE**

**File (create):** `apps/api/hrm-api/src/recruitment/hire-employee-link.spec.ts`

```text
describe('hire-employee-link G-DB-01 (PO-SPEC-UNIT-TEST-IMPL-01)', () => {
  describe('isHiredStage', () => {
    it('recognizes hired case-insensitively', () => {});
  });
  describe('resolveHireEmployeeId', () => {
    it('prefers explicitEmployeeId over existing and reverse link', () => {});
    it('falls back to existingEmployeeId when explicit empty', () => {});
    it('falls back to employees.candidate_id reverse SELECT', () => {});
    it('returns null when no link (cold DB / empty)', () => {});
  });
  describe('assertEmployeeInCandidateCompany', () => {
    it('missing employee → HRM-REC-HIRE-400', () => {});
    it('cross-company employee → HRM-REC-HIRE-409', () => {});
    it('same company → returns employee uuid', () => {});
  });
  describe('assertHireEmployeeLinkOrThrow', () => {
    it('unresolved link → HRM-REC-HIRE-400', () => {});
    it('resolved + same company → returns id', () => {});
  });
});
```

### P0-2 — PATCH pool → hired without `employee_id` — **DONE**

**File:** extend `po-e2e-spine-01-be-cand-dto-01.spec.ts` **or** `recruitment-catalog.service.spec.ts`

```text
describe('G-DB-01 updateCandidatePool hired bind', () => {
  it('PATCH stage=hired without employee_id → HRM-REC-HIRE-400 (no stage stamp)', () => {});
  it('PATCH stage=hired with explicit employee_id same company → stamps employee_id', () => {});
});
```

### P0-3 — BR-WF-04 / LV-05 self-approve (XBOS) — **DONE** (resolver); complete reject = SPEC_GAP

**File:** `apps/api/xbos-api/src/workflow-engine/resolver-registry.spec.ts` and/or `workflow-engine.service.spec.ts`

```text
describe('BR-WF-04 anti self-approve (PO-SPEC-UNIT-TEST-IMPL-01)', () => {
  it('direct_manager resolver skips submitter userId (depth guard)', () => {});
  it('completeStepTask by submitter on own pending leave task → deterministic reject / no APPROVED', () => {});
});
```

> Note: if product currently allows HRM direct `approveLeaveRequest` without WF hat check, Dev must **not** weaken browser LV-05 — either wire reject or document SPEC_GAP; unit must match chosen product rule.

### P0-4 — Advance notice ≥3 calendar days (only if BA confirms BR + error code)

**File:** `leave-requests.service.spec.ts` — **hold** until BA locks code name (matrix PARTIAL cite). Suggested names when unlocked:

```text
describe('FR-UC-H03 advance notice (≥3 calendar days)', () => {
  it('start_date before today+3 → reject deterministic code (no INSERT)', () => {});
  it('start_date on/after today+3 → create OK', () => {});
});
```

**Do not** implement ladder L2 / `total_days > N` units in this wave.

---

## 3. COVERED P0 summary (no Dev required for unit)

| Area | Evidence cite | Jest path |
|------|---------------|-----------|
| VAL-ATT sick + LVT_02 + metadata | `po-e2e-spine-02-be-lv03-val-att-01.md` | `leave-requests.service.spec.ts` |
| Candidate FE DTO whitelist | `po-e2e-spine-01-be-cand-dto-01.md` | `po-e2e-spine-01-be-cand-dto-01.spec.ts` |
| `manager_id` cycle/self/scope | `r-spine-mgr-hier-01-be.md` | `employee-manager.validation.spec.ts` + `employees.service.spec.ts` |
| Inbox subjectTitle stamp | `po-e2e-spine-01-be-inbox-01.md` | `workflow-inbox-display.spec.ts` + `workflow-engine.service.spec.ts` |

---

## 4. Out of scope this plan

- Full OpenAPI / every HRM CRUD endpoint (payroll lock, attendance geofence, …)
- Browser U65 / U78 (catalog + report waves T1/T3)
- Leave L2 ladder unit without sponsor **`T_L1`**
- Seed-backed fixtures

---

## 5. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | PASS_TO_PM (plan artifact) |
| **next_work_item** | `PO-SPEC-UNIT-TEST-IMPL-01` |
| **pm_dispatch_hint** | `dev-be` — implement §2 P0-1 + P0-2 first; P0-3 with xbos-api; hold P0-4 until BA code; cấm ladder |
| **evidence** | `docs/qa/evidence/po-spec-unit-test-plan-01.md` |

---

*PO-SPEC-UNIT-TEST-PLAN-01 · T2*
