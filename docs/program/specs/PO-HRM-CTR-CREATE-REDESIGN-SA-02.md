# PO-HRM-CTR-CREATE-REDESIGN-SA-02 — Portal Option A LOCK · DnD proof plan · API subject delta

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-CREATE-REDESIGN-SA-02` |
| **parent** | `PO-HRM-CTR-CREATE-REDESIGN-BA-02` **CONFIRM** · `PO-HRM-CTR-CREATE-AUDIT-SA-01` · sponsor **Q1-A** + **Q2 CC URL** |
| **lane** | governance · sa |
| **date** | 2026-08-10 |
| **change_mode** | **LOCK** portal geometry · **EXPAND** API/DB subject + GĐ1 fields · **NO CODE** `apps/**` |
| **status** | **CONFIRMED LOCK** — closes **R-CTR-PORTAL-01** · unlock **`PO-HRM-CTR-CREATE-REDESIGN-FE-03`** + **`PO-HRM-CTR-CREATE-REDESIGN-BE-SUBJ-01`** (dev-be) |
| **uc_ids** | `FR-UC-BP-CORE-09` · `09a` · `09b` · peer `FR-HRM-RC-03` · `FR-HRM-INT-01` |
| **ref_ba** | [`PO-HRM-CTR-CREATE-REDESIGN-BA-02.md`](./PO-HRM-CTR-CREATE-REDESIGN-BA-02.md) §2–§7 |
| **ref_audit** | [`PO-HRM-CTR-CREATE-AUDIT-SA-01.md`](./PO-HRM-CTR-CREATE-AUDIT-SA-01.md) · [`po-hrm-ctr-create-audit-fe-01.md`](../../qa/evidence/po-hrm-ctr-create-audit-fe-01.md) |
| **ref_api_live** | `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` §3 · §11 · **§12 delta (this seat)** |
| **ref_code_as_is** | `apps/web/hrm/src/pages/Contracts.tsx` (`portalScope="iframe"` create) · `hrmDialogPortal.ts` · `dialog.tsx` · `contracts-insurance.service.ts` `ensureSchema` + `createContract` |
| **Honesty** | `contracts_printable_ready=false` · **C-SLICE-≠-MODULE** · **cấm** claim printable / CTR module UAT |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Verdict — Sponsor locks Option A (portal); Option B **REJECT**

| Decision | Stamp |
|----------|--------|
| Portal geometry | **LOCK Option A** — parent Command Center portal + `syncHrmStylesheetsToParentForPortalDialogs()` · overlay ~**90%** viewport w × ~**90vh** h (BA-02 §2.1 · Q1-A) |
| QA URL DnD | **LOCK** — J-HRM-CTR-CREATE-02 evidence **only** on `…/command-center/hrm/contracts` (Q2) |
| Option B iframe modal | **REJECT** — sponsor Q1-A + TECHSPEC §4.1; audit SA-01 Option B misalign |
| Subject SoT | **EXPAND** registry — `candidate_id` path + nullable `employee_id` when candidate (G-CTR-SUBJ-01) |
| UF-HRM-02 | **must_keep** — `employee_id` registry CRUD when `subject_type=employee` unchanged |
| GĐ1 fields | **EXPAND** DTO/DB — `signed_at`, `work_arrangement` (work form catalog), `salary_ratio_percent`, `contract_abstract` (trích yếu) |

```text
  Sponsor Q1-A + Q2
       │
       ▼
  LOCK: create/edit DialogContent → parent portal (omit portalScope="iframe")
        + stylesheet sync + floating z-index family
        + DnD proof plan §3.4 (same document as portal target)
       │
       ▼
  PARALLEL unlock:
    dev-fe FE-03 (portal + wizard fields + SUBJECT UI)
    dev-be BE-SUBJ-01 (schema + POST/PATCH validation)
```

**Invariant CTR-PORTAL-A-01:** Create dialog overlay **must** cover CC sidebar/chrome — screenshot evidence **AC-CTR-UX-06**.

**Invariant CTR-PORTAL-A-02:** DnD bước 2 **must** PASS on CC URL — **AC-CTR-UX-07**; `/hr/contracts?portal=1` alone **≠** slice PASS.

**Invariant CTR-SUBJECT-01:** `subject_type=candidate` → **`candidate_id` required** · `employee_id` null until INT-01 — **AC-CTR-SUBJECT-02**.

**Invariant CTR-SUBJECT-02:** `subject_type=employee` → **`employee_id` required** (UF-HRM-02) — **AC-CTR-SUBJECT-03**.

---

## 2. Portal architecture LOCK (Option A)

### 2.1 Normative

| Source | Rule |
|--------|------|
| `docs/ecosystem/TECHSPEC.md` §4.1 | HRM `?portal=1` dialog overlay **full browser viewport** on CC — **not** clipped to iframe bbox |
| Sponsor Q1-A | ~90% w × ~90vh dialog; theme XeVN (Q11-B — no numeric AC GĐ1) |
| `hrmDialogPortal.ts` must_keep | Parent mount · idempotent stylesheet clone · `HRM_PORTAL_FLOATING_Z` > overlay z · same-origin only |
| BA-02 BR-CTR-CREATE-05 | Mount parent CC + sync embed stylesheet |

### 2.2 AS-IS → TO-BE (create/edit only)

| Item | AS-IS (`po-hrm-ctr-create-audit-fe-01`) | TO-BE (LOCK) |
|------|----------------------------------------|--------------|
| Create `DialogContent` | `portalScope="iframe"` · `Contracts.tsx` | **Omit** `portalScope` (default **parent**) |
| View dialog | Parent (default) | **RETAIN** — parity create = view |
| Geometry CSS | `max-w-[min(96vw,80rem)] max-h-[92vh]` inside iframe | `w-[min(90vw,…)]` · `max-h-[90vh]` on **viewport** (parent) |
| Stylesheet sync | Partial / iframe path | **On dialog open:** `syncHrmStylesheetsToParentForPortalDialogs()` |
| Select/Popover step 1 | Risk mixed documents | All Radix consumers in create flow use `getRadixPortalContainer()` when embed |

### 2.3 must_keep (portal)

- `hrmDialogPortalA11y` mirror when parent portal
- **Không** revert view dialog to iframe
- **Không** postMessage full-viewport **unless** §3.4 Path C triggered after failed QA proof

---

## 3. DnD same-document strategy + proof plan (§3.4 audit SA-01)

### 3.1 Problem (one line)

`@hello-pangea/dnd` requires **DragDropContext + draggable/droppable DOM in the same `document`** as the library’s React tree. Parent portal moves **Radix** shell to `parent.document`; DnD **must** follow — không split context iframe vs handles parent.

### 3.2 LOCK implementation path for FE-03 (**Path A — primary**)

| Step | Requirement |
|------|-------------|
| P-A1 | `ContractCreateWizardDialog` + **entire** step-2 subtree (`ContractCreateStep2ClausePreview`, palette, canvas) rendered **inside** portaled `DialogContent` — **no** portal step-2 outside dialog |
| P-A2 | Single `DragDropContext` root **descendant** of portaled content (not on `Contracts.tsx` iframe page wrapper alone) |
| P-A3 | **RETAIN** `sameNodeDragBind` + `dndReady` defer if already stabilizing mount — **additive**, not substitute for P-A1 |
| P-A4 | On open create: parent portal + stylesheet sync before step 2 visible |
| P-A5 | Floating layers in step 1 (template picker, NV/UV picker) — parent `getRadixPortalContainer()` consistent with dialog |

**Cấm FE-03:** Parent portal dialog **but** `DragDropContext` mounted only in iframe route shell.

### 3.3 Fallback paths (only if Path A fails QA once)

| Path | When | Owner |
|------|------|--------|
| **B** | Path A retest FAIL `Unable to find drag handle` on CC URL | FE spike: re-mount entire wizard portal host including DnD in one React portal |
| **C** | Path A+B fail; sponsor refuses iframe waiver | SA delta postMessage / dual-layer overlay (**GAP platform** — `R-CTR-PORTAL-03`) — **not** default GĐ1 |

### 3.4 Proof plan (U65 — mandatory before QA-03 sign-off)

| # | Evidence | PASS |
|---|----------|------|
| E1 | URL `http://localhost:5173/command-center/hrm/contracts` (or pilot `:8088` same path) · `ceo@xe.vn` | Logged in CC HRM Contracts |
| E2 | Screenshot «Thêm HĐ» | Overlay covers **CC sidebar** — not iframe letterbox only |
| E3 | Bước 2: drag palette → canvas ≥2 clauses | Row moves; **no** console `Unable to find drag handle` |
| E4 | «Gỡ» + mandatory confirm (BA DND-02) | After DnD stable |
| E5 | Network | POST/PATCH/PUT mutate **2xx** same session · **F5** list CC |
| E6 | **Cấm** | PASS DnD only on `/hr/contracts?portal=1` for redesign slice |

**Regression:** J-HRM-CTR-CREATE-02 · matrix `AC-CTR-UX-06` · `AC-CTR-UX-07` · `AC-CTR-DND-01/02`.

---

## 4. API_DESIGN delta — GĐ1 fields + subject (F.1)

> Paper SoT append: `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` **§12**. Runtime cite: `CreateContractDto` · `contracts-insurance.service.ts`.

### 4.1 Physical DB delta (`employee_contracts`)

| Column | Action | Type | Ghi chú |
|--------|--------|------|---------|
| `employee_id` | **ALTER** nullable | UUID NULL allowed | When `candidate_id` set (G-CTR-SUBJ-01) — existing rows stay NOT NULL |
| `candidate_id` | **ADD** | UUID NULL | Soft FK → `recruitment_candidates.id` scope company |
| `requisition_id` | **ADD** optional | UUID NULL | Soft FK → `job_requisitions` when UV from YCTD |
| `subject_type` | **ADD** | TEXT NULL | Enum logical: `candidate` \| `employee` — persist on row |
| `contract_abstract` | **ADD** | TEXT NULL | **Trích yếu** (Q10) — **≠** `notes` (ghi chú sổ) · **≠** `job_description_text` (JD/GPLX block) |
| `signed_at` | **RETAIN** | DATE NULL | AS-IS expand col — **bắt buộc GĐ1** (Q4) → **`HRM-CTR-SIGN-REQ-400`** if missing on finalize |
| `work_arrangement` | **RETAIN** | TEXT NULL | Catalog code — **Hình thức làm việc** (Q5) |
| `salary_ratio_percent` | **RETAIN** | NUMERIC(6,2) | 0–100 · exempt thousand group UI |
| `contract_name` | **RETAIN** | TEXT NULL | Q3-B read-only FE; BE accepts but **may overwrite** from `contract_code` + `contract_type` label |

**CHECK (service-layer minimum):**

- `(subject_type = 'candidate' AND candidate_id IS NOT NULL AND employee_id IS NULL)` OR `(subject_type = 'employee' AND employee_id IS NOT NULL)` OR legacy rows with `employee_id` only (back-compat read).
- **DENY** both `candidate_id` and `employee_id` null on POST create wizard persist.

**Index:** `ix_employee_contracts_candidate` on `(company_id, candidate_id)` WHERE `candidate_id IS NOT NULL`.

### 4.2 G-CTR-SUBJ-01 — resolution path (**LOCK EXPAND-REGISTRY-01**)

| Option | Mô tả | Verdict |
|--------|--------|---------|
| **EXPAND-REGISTRY-01** | Nullable `employee_id` + `candidate_id` on **`employee_contracts`** same registry table | **LOCK** — aligns UF-HRM-02 list/F5; wizard `sessionContractId` unchanged |
| Draft-only table | Separate `hrm_contract_create_drafts` | **REJECT GĐ1** — extra list/get parity · duplicate UF-HRM-02 |
| Fake `employee_id` for UV | Placeholder employee row | **REJECT** — violates REC spine · U65 trace |

**Post INT-01 (peer, not create form):** `PATCH` contract or UV row sets `employee_id` when hire completes — **FR-HRM-INT-01**; create form **does not** auto-sync NV from UV picker (BR-CTR-CREATE-08).

### 4.3 Endpoint — **EXPAND** `POST /api/hrm/contracts-insurance/contracts`

| Item | Value |
|------|--------|
| **Mục đích** | Tạo / persist bước 1 wizard — sổ HĐ + overlay cols GĐ1 (UV hoặc NV) |
| **Body** | `CreateContractDto` **EXPAND** (below) |
| **Success** | `201` **`HRM-CON-201`** |
| **must_keep** | G-CI-01 · BR-CD-F5-01 salary ignore · scope persist slug · E2 `contract_type` assert |

**Nghiệp vụ xử lý (ADD branches):**

1. Auth + `resolveScopeContext` on `company_id`.
2. **`subject_type`** default `candidate` when body omits and `candidate_id` present; else `employee`.
3. **Candidate path:** assert `candidate_id` in `recruitment_candidates` company scope; **`employee_id` must be null**; skip `resolveEmployeeId` unless `subject_type=employee`.
4. **Employee path:** **must_keep** — resolve `employee_id` / name; assert employee in scope; **`candidate_id` null**.
5. **GĐ1 validation:** `signed_at` **required** on wizard persist (not optional registry-only «Chỉ lưu sổ» path may waive per O8 — separate `registry_only` flag if already in FE).
6. **`work_arrangement`:** assert in effective catalog `work_arrangements` (or platform catalog key per DATA — **ba-data** stamp if key missing).
7. **`salary_ratio_percent`:** 0–100; null → reject on candidate/employee create GĐ1.
8. **`contract_abstract`:** optional max length; map column `contract_abstract`.
9. **`contract_name`:** if omitted, server derive display from `contract_code` + `contract_type` label (Q3-B).
10. INSERT with expanded cols; return display-ready row (list parity §4.5).

**Tham chiếu SRS (BA-02):**

| # | UC / FR | Diễn biến | API |
|---|---------|-----------|-----|
| N2 | FR-UC-BP-CORE-09a | Chọn đối tượng UV/NV | `subject_type` + ids |
| N3 | | Ngày ký bắt buộc | `signed_at` |
| N4 | | Hình thức LV + tỉ lệ % | `work_arrangement` + `salary_ratio_percent` |
| N5 | | Tên HĐ read-only | `contract_name` derive |
| N6 | | Trích yếu | `contract_abstract` |
| N9 | | NV chưa REC | **400** `HRM-CTR-SUBJECT-REC-400` + message VI — no auto UV |

**Request ↔ DB (ADD rows):**

| DTO field | DB column | Notes |
|-----------|-----------|-------|
| `subject_type` | `subject_type` | `candidate` \| `employee` |
| `candidate_id` | `candidate_id` | UUID optional |
| `requisition_id` | `requisition_id` | UUID optional |
| `signing_date` | `signed_at` | **Alias** — FE may send `signing_date`; BE maps to `signed_at` |
| `signed_at` | `signed_at` | DATE ISO |
| `work_form` | `work_arrangement` | **Alias** — catalog code |
| `work_arrangement` | `work_arrangement` | RETAIN |
| `salary_ratio_percent` | `salary_ratio_percent` | RETAIN |
| `contract_abstract` | `contract_abstract` | **NEW** |
| `abstract` | `contract_abstract` | **Alias** optional |
| `employee_id` | `employee_id` | Optional when candidate path |
| `notes` | `notes` | Ghi chú sổ — **≠** abstract |

**Errors (ADD):**

| Condition | Code | HTTP |
|-----------|------|------|
| Missing `signed_at` on GĐ1 persist | `HRM-CTR-SIGN-REQ-400` | 400 |
| Candidate path missing `candidate_id` | `HRM-CTR-SUBJECT-400` | 400 |
| Employee path missing employee | `HRM-CON-001` | 400 RETAIN |
| UV out of scope | `HRM-CTR-CANDIDATE-404` | 404 |
| NV mode REC gap | `HRM-CTR-SUBJECT-REC-400` | 400 |
| Invalid work form code | `HRM-CTR-WORK-FORM-400` | 400 |
| `salary_ratio_percent` out of range | `HRM-CTR-SALARY-RATIO-400` | 400 |

### 4.4 Endpoint — **EXPAND** `PATCH /api/hrm/contracts-insurance/contracts/{contractId}`

Same field map as POST for wizard re-persist step 1 · **must_keep** `assertResourceInHrmScope` · list↔get parity.

**Mục đích:** Cập nhật draft registry sau bước 1 / trước bước 2 `goStep2` persist.

### 4.5 Endpoint — **EXPAND** `GET` list / get contract

**Mục đích:** F5 + edit restore + list label UV/NV.

**Response ADD (display-ready):**

| Field | Source |
|-------|--------|
| `subject_type` | column |
| `candidate_id` | column |
| `candidate_label` | JOIN `recruitment_candidates` name/code — **no UUID on trigger** |
| `requisition_id` | column |
| `signed_at` | column |
| `signing_date` | alias duplicate `signed_at` for FE |
| `work_arrangement` | column |
| `work_form_label_vi` | catalog resolve |
| `salary_ratio_percent` | column |
| `contract_abstract` | column |
| `contract_name` | column |

**Scope parity:** list ↔ get-by-id **same** resolver — **must_keep** UF-HRM-02 / U19.

### 4.6 RETAIN (must_keep — không đổi SoT)

| Fn | Path |
|----|------|
| F-CORE-CTR-PACK-01 | pack-resolve |
| F-CORE-CTR-PREV-01 | preview ephemeral |
| F-CORE-CTR-OVERLAY-01 | print-overlay clause_ids |
| Registry CRUD | UF-HRM-02 · FR-HRM-CI-01 #7 |
| G-CI-01 | end_date by type |

### 4.7 Peer reads (FE picker — no new POST)

| Mode | GET |
|------|-----|
| Ứng viên | `GET /api/hrm/recruitment/candidates` (search q) |
| Nhân viên | `GET /api/hrm/employees` scope |

---

## 5. must_keep — UF-HRM-02 employee registry

| Rule | Detail |
|------|--------|
| Employee create path | `subject_type=employee` → existing employee resolution · position_key assert · compensation package link |
| List contracts | Rows with `employee_id` display as today; ADD rows with `candidate_id` show UV label |
| «Chỉ lưu sổ» O8 | RETAIN AC-CTR-XEVN-08 — may omit template; **signed_at** rule follows BA O8 vs GĐ1 wizard (wizard Tiếp **requires** sign date) |
| No seed UF | U65 — evidence from FE create only |
| No fake employee for UV | BR-CTR-CREATE-08 |

---

## 6. Impacted systems

| System | Change |
|--------|--------|
| `apps/web/hrm` `Contracts.tsx` | Remove create `portalScope="iframe"`; geometry classes |
| `ContractCreateWizardDialog` | Fields + subject toggle + signed_at + abstract |
| `ContractCreateStep1GeneralGrid` | UV/NV `CatalogSearchPicker` modes |
| `hrmDialogPortal.ts` | Critical path on create open |
| `contracts-insurance.service.ts` | Schema ALTER + createContract branches |
| `create-contract.dto.ts` / `update-contract.dto.ts` | New fields + aliases |
| `API_DESIGN_HRM_CONTRACTS_INS.md` | §12 pointer |
| QA | QA-03 CC URL mandatory |

---

## 7. Rollout checkpoints

1. **dev-be BE-SUBJ-01** — schema + POST/PATCH/GET + jest (`po-hrm-ctr-create-redesign-be-01` extend).
2. **dev-fe FE-03** — portal Path A + wizard UI (can stub candidate POST until BE ready — **READY_FOR_QA** only when BE 2xx path works).
3. **qa QA-03** — full AC-CTR-* · proof plan §3.4.
4. **qc** — GWC slice only · `contracts_printable_ready=false`.

---

## 8. Residual

| ID | Mô tả | Owner |
|----|--------|-------|
| R-CTR-WF-01 | Workflow auto-trigger CTR on UV stage | defer GĐ2 · **sa** closed in BA-02 |
| R-CTR-PORTAL-03 | postMessage hybrid overlay | only if §3.3 Path C |
| R-CTR-CATALOG-WF | `work_arrangements` catalog key physical | **ba-data** if assert fails |
| R-CTR-PROBATION-DATA | `XEVN_PROBATION_*` active rows | catalog/seed policy — QA-01 HOLD until data |

---

## 9. completion_report

**Closed:** `PO-HRM-CTR-CREATE-REDESIGN-SA-02` — LOCK parent portal Option A (Q1-A); DnD Path A + U65 proof plan §3.4; API_DESIGN delta candidate_id / subject_type / signing_date / work_form / salary_ratio_percent / contract_abstract; G-CTR-SUBJ-01 **EXPAND-REGISTRY-01**; must_keep UF-HRM-02 employee path. **No** `apps/**` changes.

**Open:** BE schema migration; FE portal + DnD proof; workflow GĐ2; probation catalog data.

| Field | Value |
|-------|--------|
| **next_owner** | **pm** → parallel **dev-be** + **dev-fe** |
| **evidence_path** | `docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-SA-02.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (dev-be)

```text
work_item_id: PO-HRM-CTR-CREATE-REDESIGN-BE-SUBJ-01
role: dev-be
lane: execution
read_first:
  - docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-SA-02.md §4.1–§4.5
  - docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-BA-02.md §5
  - apps/api/hrm-api/src/contracts-insurance/dto/create-contract.dto.ts
  - apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts (ensureSchema, createContract)
entry_criteria: SA-02 PASS_TO_PM; G-CTR-SUBJ-01 EXPAND-REGISTRY-01 LOCKED
exit_criteria: ALTER employee_contracts (nullable employee_id, candidate_id, requisition_id, subject_type, contract_abstract); EXPAND CreateContractDto/UpdateContractDto (subject_type, candidate_id, signing_date/work_form/abstract aliases); createContract/PATCH validation per §4.3–4.4; GET list/get display fields; jest extend po-hrm-ctr-create-redesign-be-01; signed_at required HRM-CTR-SIGN-REQ-400; must_keep UF-HRM-02 employee path + G-CI-01; scope parity list↔get; READY_FOR_QA with FE-03
cấm: seed for UF evidence; break employee-only create regression
evidence_path: docs/qa/evidence/po-hrm-ctr-create-redesign-be-subj-01.md
ack_status: READY_FOR_QA
```

### next_dispatch_prompt (dev-fe)

```text
work_item_id: PO-HRM-CTR-CREATE-REDESIGN-FE-03
role: dev-fe
lane: execution
read_first:
  - docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-SA-02.md §2–§3
  - docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-BA-02.md §2–§4
  - docs/qa/evidence/po-hrm-ctr-create-audit-fe-01.md
  - apps/web/hrm/src/lib/hrmDialogPortal.ts
  - apps/web/hrm/src/pages/Contracts.tsx
entry_criteria: SA-02 portal LOCKED; BE-SUBJ-01 in flight or stub — coordinate candidate_id POST
exit_criteria: Parent portal create/edit (omit portalScope iframe); AC-CTR-UX-06 geometry; DnD Path A §3.2 proof on CC URL; FIELD-01..05; SUBJECT-01..03; DND-01/02; retain AC-CTR-UX-01; READY_FOR_QA J-CREATE-01..09
cấm: honesty paragraphs; seed; PASS DnD only /hr portal URL; portalScope iframe on create
evidence_path: docs/qa/evidence/po-hrm-ctr-create-redesign-fe-03.md
ack_status: READY_FOR_QA
```

---

*End of PO-HRM-CTR-CREATE-REDESIGN-SA-02 — LOCK Option A · PASS_TO_PM.*
