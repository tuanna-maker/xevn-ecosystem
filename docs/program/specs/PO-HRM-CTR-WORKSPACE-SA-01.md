# PO-HRM-CTR-WORKSPACE-SA-01 — ContractWorkspace API/workspace LOCK (NV-first AMEND)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-SA-01` |
| **parent** | `PO-HRM-CTR-WORKSPACE-NV-FIRST-BA-03` **CONFIRM** · `ADR-HRM-CONTRACT-WORKSPACE-UNIFIED-01` G2 |
| **lane** | governance · sa |
| **date** | 2026-08-11 |
| **change_mode** | **LOCK** workspace modes · **EXPAND** GET detail clause layout · **AMEND** subject default NV-first · **RESOLVE** G-CTR-SUBJ-01 |
| **status** | **LOCK** — unlocks `PO-HRM-CTR-WORKSPACE-FE-01` (G3) |
| **uc_ids** | `FR-UC-BP-CORE-09` · `09a` · `09b` · `FR-HRM-INT-01` · `FR-HRM-RC-07` |
| **ref_ba** | [`PO-HRM-CTR-WORKSPACE-NV-FIRST-BA-03.md`](./PO-HRM-CTR-WORKSPACE-NV-FIRST-BA-03.md) §2–§8 |
| **ref_adr** | [`ADR-HRM-CONTRACT-WORKSPACE-UNIFIED-01.md`](../../architecture/ADR-HRM-CONTRACT-WORKSPACE-UNIFIED-01.md) · **§14 AMEND** (this seat) |
| **ref_ui** | [`UI-CTR-WORKSPACE.md`](../../hrm/ui-screens/UI-CTR-WORKSPACE.md) |
| **ref_api** | [`API_DESIGN_HRM_CONTRACTS_INS.md`](../../hrm/API_DESIGN_HRM_CONTRACTS_INS.md) · **§13 delta (this seat)** |
| **ref_sa_prior** | [`PO-HRM-CTR-CREATE-REDESIGN-SA-02.md`](./PO-HRM-CTR-CREATE-REDESIGN-SA-02.md) §4 (subject EXPAND-REGISTRY-01) |
| **Honesty** | `contracts_printable_ready=false` · **C-SLICE-≠-MODULE** · cấm registry-only view as PASS |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Verdict — BA-03 → architecture LOCK

| Decision | Stamp |
|----------|--------|
| ContractWorkspace modes | **LOCK** `create` \| `edit` \| `view` — single shell 2 bước; **cấm** registry-only Eye |
| Subject default | **AMEND** ADR §3.3 + SA-02 §4.3 — **NV-first** on CC create; UV = optional pre-hire only |
| Clause mutate on HĐ | **LOCK** — contract body chỉ **`clause_ids[]` order**; **`body_vi` SoT Settings** |
| GET detail for view | **EXPAND** — `clause_ids` + `clause_layout[]` + `can_issue` on get-by-id (or documented 2-call fallback §4.4) |
| REC hire CTA | **LOCK** deep-link / router state prefill `employee_id` + `XEVN_PROBATION_*` |
| G-CTR-SUBJ-01 | **RESOLVED** — EXPAND-REGISTRY-01 merged (`BE-SUBJ-01`); AMEND **default** NV-first (not schema) |
| Printable module | **HOLD** — `contracts_printable_ready=false` |

```text
  BA-03 CONFIRM (G1 NV-first + view parity)
       │
       ▼
  SA-01 LOCK:
    · ContractWorkspace modes + FE component map (ADR G2)
    · API §13 GET detail clause_layout for view shell
    · POST/PATCH registry vs PUT print-overlay separation
    · REC CTA query contract §5
    · ADR §14 AMEND subject default
       │
       ▼
  UNLOCK: PO-HRM-CTR-WORKSPACE-FE-01 (dev-fe G3)
```

---

## 2. ContractWorkspace — mode LOCK (FE architecture)

### 2.1 Mode discriminated union (normative)

| Mode | `mode` prop | Entry | Step 1 | Step 2 | Footer |
|------|-------------|-------|--------|--------|--------|
| **create** | `'create'` | CC «Thêm» · Profile «Thêm HĐ» · REC CTA | Editable · tab **NV default** | DnD palette/canvas · reorder `clause_ids` | Quay lại · Tiếp · **Lưu** |
| **edit** | `'edit'` | CC «Sửa» · Profile row «Sửa» | Editable (RETAIN O12 restore) | DnD + Gỡ (RETAIN DND-01/02) | Quay lại · Tiếp · **Lưu** |
| **view** | `'view'` | CC «Eye» · deep link `contract_id` | **readOnly** registry fields | **readOnly** canvas + preview + **In** · **PDF** when `can_issue` | **Đóng** · optional «Sửa» → `edit` |

**Shell invariants (all modes — RETAIN ADR §3.1):**

- Parent CC portal `data-hrm-dialog-portal="parent"` · ~90vw × ~90vh.
- `syncHrmStylesheetsToParentForPortalDialogs()` on open.
- Stepper 2 bước; view may use tab labels «Thông tin HĐ» \| «Điều khoản & bản in» (same components, `readOnly` prop).
- **Cấm PASS:** Eye opens static registry grid without step 2 canvas (BR-CTR-WS-01 · AC-CTR-VIEW-01).

### 2.2 Component map (SOLID — pointer ADR §4)

| Artifact | Responsibility | Mode awareness |
|----------|----------------|----------------|
| `ContractWorkspaceDialog` | Orchestrator: mode, step, submit, `onModeChange` | Dispatches `create` \| `edit` \| `view` |
| `ContractRegistryFields` | Step 1 manifest · subject tabs NV\|UV | `readOnly` when `view`; `subjectLock` on profile/REC |
| `ContractClauseCanvas` | Palette + canvas + Gỡ | `readOnly` when `view`; **no** `body_vi` editor ever |
| `useContractPrintSpine` | preview · overlay PUT · VER/PDF · `can_issue` | View: read-only preview + issued versions |

### 2.3 Launch context → defaults (AMEND ADR §3.3)

| Launch context | `subjectDefault` | `subjectLock` | `templatePrefill` |
|----------------|------------------|---------------|-------------------|
| CC `Contracts.tsx` «Thêm HĐ» | **`employee`** (G1-1) | none — user may switch to UV tab | none |
| CC deep-link `?subject=candidate` | `candidate` | none | none |
| `EmployeeProfile` «Thêm HĐ» | `employee` | `{ type: 'employee', id: employeeId }` | none |
| **REC hire CTA** «Tạo HĐ» | `employee` | `{ type: 'employee', id: hiredEmployeeId }` | `XEVN_PROBATION_*` first active in scope |
| Edit / view row | from `subject_type` + ids | display only in `view` | from row `template_code` |

**Cấm:** CC create default tab **Ứng viên** (BA-02 Q6 AS-IS) — gap **G-CTR-SUBJ-04** (dev-fe).

---

## 3. Clause SoT — mutate LOCK

### 3.1 Layer separation (G1-5)

| Layer | SoT `body_vi` | Contract mutate allowed |
|-------|---------------|-------------------------|
| **Settings → Điều khoản** | CRUD + activate/retire | — |
| **Settings → Template composer** | Template-level `clause_ids` order | — |
| **ContractWorkspace step 2** | Read from Settings library at preview time | **`clause_ids[]` order only** — select · reorder · gỡ |

**Invariants:**

- **CTR-WS-CLAUSE-01:** No textarea / inline editor for `body_vi` on workspace canvas (BR-CTR-WS-03/04).
- **CTR-WS-CLAUSE-02:** Persisted order = `print_overlay_clause_ids` JSONB on `employee_contracts`.
- **CTR-WS-CLAUSE-03:** HĐ đã lưu giữ snapshot tại issue time; Settings body change affects **new** contracts only (RETAIN issued policy).

### 3.2 API mutate paths (normative)

| Operation | Endpoint | Body fields | Cấm |
|-----------|----------|-------------|-----|
| Registry step 1 | `POST` / `PATCH` `…/contracts` | `subject_type`, `employee_id` \| `candidate_id`, `signed_at`, `work_arrangement`, `salary_ratio_percent`, `contract_abstract`, `template_code`, dates, … | `body_vi`, `clause_ids` on registry DTO |
| Clause order step 2 | `PUT` `…/contracts/{id}/print-overlay` | `{ clause_ids: string[] }` | Template junction replace; inline body |
| Ephemeral preview | `POST` `…/contracts/{id}/preview` | optional `{ clause_ids?: string[] }` | Persist body |

**Resolution order for canvas (RETAIN F-CORE-CTR-PREV-01):**

```text
preview clause source =
  body.clause_ids (ephemeral)
  → print_overlay_clause_ids (persisted)
  → template junction default
```

---

## 4. API_DESIGN delta — GET detail + view shell (§13)

> Append to `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` **§13**. Runtime cite: `getContractById` · `ContractLegalPrintService.resolveClauseRowsForContract`.

### 4.1 EXPAND `GET /api/hrm/contracts-insurance/contracts/{contractId}`

| Item | Value |
|------|--------|
| **Mục đích** | Cấp **chi tiết HĐ + layout điều khoản** cho ContractWorkspace mode `view` / `edit` step 2 — **một round-trip** cho shell bind |
| **Success** | `HRM-CON-200` |
| **must_keep** | Scope parity list ↔ get · SA-02 display-ready fields · `contracts_printable_ready=false` |

**Nghiệp vụ xử lý (ADD):**

1. RETAIN §2 load + scope + enrich (`candidate_label`, `work_form_label_vi`, …).
2. Resolve **`clause_ids`**: `print_overlay_clause_ids` if non-empty; else template junction order for `template_code`.
3. Resolve **`clause_layout[]`**: JOIN active clause library rows for each id in order — fields: `id`, `code`, `title_vi`, `body_vi`, `clause_group`, `mandatory`, `sort_order` (display-ready, **read-only** on wire).
4. Compute **`can_issue`**: lightweight validation — same predicate as `previewContract` (`missing_fields` + `missing_clauses` empty); **không** claim printable module UAT.
5. Optional **`preview_summary`**: `{ pack_code, template_code, missing_fields[], missing_clauses[] }` — FE disables In/PDF with VI reason when `can_issue=false`.

**Tham chiếu SRS (BA-03):**

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| W1 | FR-UC-BP-CORE-09a | Eye → 2 bước read-only + clause canvas | **This EXPAND** |
| W5 | FR-UC-BP-CORE-09a | Điều khoản = order only; body từ Settings | `clause_layout[]` read-only |
| — | FR-UC-BP-CORE-09b | Preview / In / PDF when ready | `can_issue` flag |

**Response ADD (wire):**

| Field | Type | Source |
|-------|------|--------|
| `clause_ids` | `string[]` | Alias `print_overlay_clause_ids` ?? template default order |
| `print_overlay_clause_ids` | `string[]` | RETAIN column (alias target) |
| `clause_layout` | `ClauseLayoutItem[]` | Resolved library rows in `clause_ids` order |
| `can_issue` | `boolean` | Preview validation predicate |
| `preview_summary` | `object` optional | Missing fields/clauses for disabled In/PDF tooltip |

**ClauseLayoutItem (display-ready):**

| Field | Notes |
|-------|-------|
| `id` | Clause library UUID |
| `code` | Stable code |
| `title_vi` | Label on canvas |
| `body_vi` | **Read-only** — SoT Settings; FE **must not** render editor |
| `clause_group` | Section grouping |
| `mandatory` | Gỡ confirm (edit mode only) |
| `sort_order` | Persisted index |

### 4.2 AS-IS → TO-BE (get-by-id)

| Item | AS-IS (2026-08-11) | TO-BE (LOCK) |
|------|-------------------|--------------|
| `print_overlay_clause_ids` | Returned on GET | **RETAIN** + alias `clause_ids` |
| `clause_layout` | **Missing** — FE must POST preview | **ADD** on GET for view shell |
| `can_issue` | Only on POST preview | **ADD** on GET (embedded lightweight) |

**FE fallback (interim G3 only):** If BE slice lags, view step 2 may call `POST …/preview` once after GET — **not** PASS for G4 QA; dev-be should implement §4.1 before QA sign-off.

### 4.3 RETAIN — POST/PATCH registry (no clause body)

| Endpoint | Clause-related rule |
|----------|----------------------|
| `POST …/contracts` | **DENY** `body_vi`, `clause_layout`, per-clause text fields |
| `PATCH …/contracts/{id}` | **DENY** inline clause body; optional future `clause_ids` rejected with **`HRM-CTR-CLAUSE-MUTATE-400`** — use print-overlay |
| `PUT …/print-overlay` | **Only** path for `clause_ids[]` persist (F-CORE-CTR-OVERLAY-01) |

### 4.4 POST/PATCH subject branches (AMEND NV-first default)

**AMEND** SA-02 §4.3 step 2:

| Condition | Default `subject_type` | Validation |
|-----------|------------------------|------------|
| Body omits `subject_type` + has `employee_id` | `employee` | **NV path** — `employee_id` required |
| Body omits `subject_type` + has `candidate_id` only | `candidate` | UV pre-hire — `employee_id` null |
| Body omits both ids | **`employee`** (AMEND) | **`HRM-CTR-SUBJECT-400`** unless `registry_only` O8 |
| `subject_type=employee` | — | `employee_id` required · `candidate_id` null |
| `subject_type=candidate` | — | `candidate_id` required · `employee_id` null · UV not yet hired |

**G-CTR-SUBJ-01 — resolution (LOCK):**

| Aspect | Status |
|--------|--------|
| Schema `employee_id` nullable + `candidate_id` | **DONE** — `PO-HRM-CTR-CREATE-REDESIGN-BE-SUBJ-01` |
| UV-only POST persist | **DONE** — jest `po-hrm-ctr-create-redesign-be-subj-01` |
| **Default tab / default subject on CC** | **OPEN dev-fe** — G-CTR-SUBJ-04 |
| Fake employee for UV | **REJECT** — RETAIN BR-CTR-CREATE-08 |

---

## 5. REC hire CTA — deep-link LOCK

### 5.1 CTA surfaces (FE)

| Surface | Condition | Action |
|---------|-----------|--------|
| REC UV detail post INT-01 | `employee_id` set · hire 2xx | Show **«Tạo HĐ»** |
| Hire success dialog/toast | Same session | Same CTA |

### 5.2 Navigation contract (normative)

**Primary — CC contracts route with query:**

```text
/command-center/hrm/contracts?workspace=create
  &employee_id={uuid}
  &template_code={active_probation_code}
  &company_id={scope_slug}
```

| Query param | Required | Source |
|-------------|----------|--------|
| `workspace` | yes | `create` |
| `employee_id` | yes | Hire response / UV.`employee_id` |
| `template_code` | no | First active `XEVN_PROBATION_*` in scope catalog; omit if none (BR-CTR-HIRE-03) |
| `company_id` | no | Token scope / NV company |

**Alternate — router state (same tab):**

```typescript
navigate('/command-center/hrm/contracts', {
  state: {
    contractWorkspace: {
      mode: 'create',
      subjectLock: { type: 'employee', id: employeeId },
      templateCode: probationTemplateCode ?? undefined,
    },
  },
});
```

**Workspace open rules:**

1. Parse query/state on `Contracts.tsx` mount / REC CTA click.
2. Open `ContractWorkspaceDialog` mode=`create` with `subjectLock` — **skip** NV picker.
3. Tab **Nhân viên** active; UV tab hidden or disabled.
4. Step 2 `clause_ids` default from selected template junction.
5. **Cấm:** Open UV tab or leave `employee_id` empty after REC CTA (AC-CTR-HIRE-CTA-02).

### 5.3 Peer API (no new POST)

| Need | Existing endpoint |
|------|-------------------|
| Probation template list | `GET …/contract-templates` filter `code` prefix `XEVN_PROBATION` |
| NV context card | `GET …/employees/{id}/contract-create-context` (F-CORE-CTR-CREATE-CTX-01) |
| Create persist | `POST …/contracts` with `subject_type=employee` |

---

## 6. View mode — print spine (must_keep)

| Capability | API | FE behavior |
|------------|-----|-------------|
| Read-only preview | GET `clause_layout` + optional `POST preview` refresh | Canvas rows from `clause_layout` |
| In / PDF | `POST preview` · `POST …/print-versions` when `can_issue` | Disabled + VI reason when false |
| Issued versions list | `GET …/contracts/{id}/print-versions` | View toolbar when data exists |

**Honesty:** Preview ephemeral; **cấm** flip `contracts_printable_ready` or claim CORE-09 module UAT from slice G1/G3.

---

## 7. Gap table (post-SA-01)

| Gap ID | Mô tả | Owner | SA disposition |
|--------|--------|-------|----------------|
| **G-CTR-WS-01** | Eye = registry-only | dev-fe | FE-01 — blocked until SA-01 ✓ |
| **G-CTR-WS-02** | No unified workspace component | dev-fe | FE-01 |
| **G-CTR-WS-03** | REC missing CTA | dev-fe REC+CTR | FE-01 §5 |
| **G-CTR-SUBJ-01** | UV-only POST blocked | dev-be | **RESOLVED** BE-SUBJ-01 |
| **G-CTR-SUBJ-04** | UV default tab in FE | dev-fe | FE-01 §2.3 |
| **G-CTR-INLINE-BODY** | Inline body editor on canvas | dev-fe | Remove in FE-01 |
| **G-CTR-GET-LAYOUT-01** | GET missing `clause_layout` | dev-be | **NEW** — implement §4.1 before G4 QA |

---

## 8. Impacted systems

| System | Change |
|--------|--------|
| `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` | §13 EXPAND pointer |
| `docs/architecture/ADR-HRM-CONTRACT-WORKSPACE-UNIFIED-01.md` | §14 AMEND NV-first |
| `apps/web/hrm` contracts + REC | FE-01 — workspace modes + CTA + NV default |
| `apps/api/hrm-api` `getContractById` | G-CTR-GET-LAYOUT-01 — optional parallel BE slice |
| QA G4 | J-HRM-CTR-VIEW-* · J-HRM-CTR-HIRE-CTA-01 · amended SUBJECT-* |

---

## 9. Rollout checkpoints

| # | Gate | Owner | Pass when |
|---|------|-------|-----------|
| 1 | SA-01 LOCK | sa | This file + ADR §14 published |
| 2 | FE-01 READY_FOR_QA | dev-fe | Workspace 3 modes · NV default · view parity · REC CTA |
| 3 | BE GET layout (if split) | dev-be | GET returns `clause_layout` + `can_issue` |
| 4 | QA G4 U65 | qa | AC-CTR-VIEW/HIRE/SUBJECT/WS-CLAUSE browser CC URL |

---

## 10. completion_report

**Closed:** `PO-HRM-CTR-WORKSPACE-SA-01` — LOCK ContractWorkspace modes `create|edit|view`; AMEND subject default **NV-first** (CC + REC CTA); clause mutate **clause_ids order only** via print-overlay; GET detail EXPAND `clause_layout[]` + `can_issue` for view shell; REC hire deep-link contract §5; G-CTR-SUBJ-01 **resolved** (schema) + G-CTR-SUBJ-04 assigned FE; ADR §14 appended. **No** `apps/**` changes.

**Residual:** G-CTR-GET-LAYOUT-01 BE enrich on GET (parallel OK) · G-CTR-WS-* FE implementation · `contracts_printable_ready=false` HOLD · G-CTR-WF-01 defer GĐ2.

| Field | Value |
|-------|--------|
| **next_owner** | **dev-fe** (`PO-HRM-CTR-WORKSPACE-FE-01`) · parallel **dev-be** if GET layout not yet enriched |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-CTR-WORKSPACE-SA-01.md` · `docs/architecture/ADR-HRM-CONTRACT-WORKSPACE-UNIFIED-01.md` §14 |

### next_dispatch_prompt (dev-fe)

```text
work_item_id: PO-HRM-CTR-WORKSPACE-FE-01
role: dev-fe
lane: execution
read_first:
  - docs/program/specs/PO-HRM-CTR-WORKSPACE-SA-01.md (LOCK)
  - docs/program/specs/PO-HRM-CTR-WORKSPACE-NV-FIRST-BA-03.md §2 §6 §7
  - docs/hrm/ui-screens/UI-CTR-WORKSPACE.md
  - docs/architecture/ADR-HRM-CONTRACT-WORKSPACE-UNIFIED-01.md §3–§4 §14
entry_criteria: SA-01 PASS_TO_PM; BA-03 CONFIRM
exit_criteria: ContractWorkspaceDialog (create|edit|view) replaces create+eye dialogs; NV tab default CC; UV optional pre-hire; Eye=2-step read-only+In/PDF from GET clause_layout; REC CTA query §5.2; no inline body_vi; RETAIN portal Option A + DND Path A; READY_FOR_QA J-HRM-CTR-CREATE/VIEW/HIRE-CTA
cấm: registry-only view PASS; UV default tab; seed; contracts_printable_ready flip
allowed_paths: apps/web/**/contracts/** · recruitment hire CTA touch only
evidence_path: docs/qa/evidence/po-hrm-ctr-workspace-fe-01.md
ack_status: READY_FOR_QA
```

### next_dispatch_prompt (dev-be — optional parallel)

```text
work_item_id: PO-HRM-CTR-WORKSPACE-BE-LAYOUT-01
role: dev-be
lane: execution
read_first:
  - docs/program/specs/PO-HRM-CTR-WORKSPACE-SA-01.md §4
  - docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md §13 (after append)
  - apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts getContractById
entry_criteria: SA-01 LOCK §4.1
exit_criteria: GET contract by id returns clause_ids alias + clause_layout[] + can_issue; jest extend contracts-insurance.service.spec.ts; scope parity retained; no body_vi on POST/PATCH
cấm: seed; break BE-SUBJ-01 regression
evidence_path: docs/qa/evidence/po-hrm-ctr-workspace-be-layout-01.md
ack_status: READY_FOR_QA
```

---

*End of PO-HRM-CTR-WORKSPACE-SA-01 — LOCK · PASS_TO_PM.*
