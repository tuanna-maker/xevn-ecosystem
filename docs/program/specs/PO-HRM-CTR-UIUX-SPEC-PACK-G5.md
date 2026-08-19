# PO-HRM-CTR-UIUX-SPEC-PACK-G5 — BA UI/UX spec pack (Contract workspace)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-CTR-UIUX-SPEC-PACK-G5` |
| **role** | ba-process |
| **lane** | governance |
| **sponsor_confirm** | 2026-08-11 — SOLID Contract Surface + UIUX spec song song G1–G4 |
| **status** | **PUBLISHED** |
| **honesty** | `contracts_printable_ready=false` · **C-SLICE-≠-MODULE** |
| **no_prompt_echo** | true |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Deliverables (A–G)

| ID | Artifact | Path | Status |
|----|----------|------|--------|
| **A** | Index master | `docs/hrm/ui-screens/UI-HRM-CTR-SPEC-INDEX.md` | ✅ |
| **B** | Workspace SoT | `docs/hrm/ui-screens/UI-HRM-CTR-WORKSPACE.md` | ✅ |
| **C** | View parity | `docs/hrm/ui-screens/UI-HRM-CTR-VIEW-PARITY.md` | ✅ |
| **D** | Profile deep-link | `docs/hrm/ui-screens/UI-HRM-CTR-PROFILE-DEEP-LINK.md` | ✅ |
| **E** | REC hire CTA | `docs/hrm/ui-screens/UI-HRM-CTR-HIRE-CTA.md` | ✅ |
| **F** | AMEND U65 path | `docs/hrm/ui-screens/UI-CTR-CREATE-U65-TEMPLATE-PATH.md` | ✅ |
| **G** | Delta trace (file này §2) | — | ✅ |

**Related (read_first — không duplicate):**

- `docs/program/specs/PO-HRM-FE-UI-SCREEN-SPEC-GUIDE-01.md`
- `docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-BA-02.md`
- `docs/hrm/SRS.md` FR-UC-BP-CORE-09 / 09a–09d (team paths)
- `docs/hrm/TECHSPEC.md` §14.2
- `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md`
- `docs/architecture/ADR-HRM-CONTRACT-WORKSPACE-UNIFIED-01.md`

**G1 note:** `PO-HRM-CTR-WORKSPACE-NV-FIRST-BA-03.md` chưa publish — G5 **incorporates** NV-first + hire CTA + view parity trong B/C/D/E.

---

## 2. Traceability matrix — SRS Diễn biến ↔ API ↔ UI AC

| SRS (FR-UC-BP-CORE-09*) | Diễn biến # / tên | API (METHOD path) | DTO / field | UI AC | UI spec |
|-------------------------|-------------------|-------------------|-------------|-------|---------|
| **09** (tạo HĐ) | N1 Mở dialog CC full viewport | — | — | AC-WS-01 · AC-CTR-UX-06 | WORKSPACE §8 |
| **09** | N2 Đối tượng HĐ | `GET …/employees` · `GET …/candidates` | `subject_type` · `employee_id` · `candidate_id` | AC-WS-03 · AC-HIRE-02 | WORKSPACE §4.1 · HIRE |
| **09** | N3 Ngày ký bắt buộc | `POST/PATCH …/contracts` | `signed_at` | AC-WS-04 · FIELD-02 | WORKSPACE §4.1 |
| **09** | N4 Hình thức LV + tỉ lệ % | `POST/PATCH` | `work_arrangement` · `salary_ratio_percent` | AC-WS-09 · FIELD-03 | WORKSPACE §4.1 |
| **09** | N5 Tên HĐ read-only | display merge | `contract_name` | FIELD-01 | WORKSPACE §4.1 |
| **09** | N6 Trích yếu | `POST/PATCH` | `contract_abstract` | FIELD-05 | WORKSPACE §4.1 |
| **09** | N7 Bước 2 DnD CC URL | `PUT …/print-overlay` | `clause_ids[]` | AC-WS-02 · AC-WS-06 | WORKSPACE §4.2 |
| **09** | N8 Gỡ mandatory confirm | `PUT …/print-overlay` | remove id | DND-02 | WORKSPACE §4.2 |
| **09** | N9 NV thiếu REC | — | banner | SUBJECT-03 | WORKSPACE §4.1 |
| **09a** | Thư viện clause SoT | Settings `contract-clauses` CRUD | `body_vi` | Settings AC | UI-SETTINGS-CTR-CLAUSES |
| **09b** | Preview ephemeral | `POST …/preview` | `clause_ids?` | AC-WS-07 · VIEW-04 | WORKSPACE · VIEW |
| **09c** | In/PDF (residual) | CORE-09c APIs | VER rows | honesty false | VIEW §6 |
| **09d** | Chọn mẫu catalog | Settings templates + row | `template_code` | AC-WS-10 · CTR-U65-02 | WORKSPACE · U65 |
| **FR-HRM-CI-01** | #7 Lưu thành công | `POST …/contracts` | created row | AC-WS-05 | WORKSPACE §6 |
| **FR-HRM-CI-01** | #8 F5 | `GET …/contracts` | list | AC-PROF-05 · CTR-U65-04 | PROFILE · U65 |
| **FR-HRM-CI-01** | #8/#9 View detail | `GET …/contracts/{id}` | full row | AC-VIEW-01..07 | VIEW-PARITY |
| **FR-HRM-INT-01** | Hire → HĐ | `POST` candidate path | `candidate_id` | AC-HIRE-03 | HIRE-CTA |
| **FR-HRM-INT-02** | Profile bind NV | `GET?employee_id=` | `employee_id` | AC-PROF-02 | PROFILE |
| **F-CORE-CTR-CREATE-CTX-01** | C&B card Bước 1 | `GET …/contract-create-context` | snapshot | AC-WS-09 | WORKSPACE §4.1 |
| **F-CORE-CTR-OVERLAY-01** | Lưu thứ tự clause | `PUT …/print-overlay` | `clause_ids[]` | AC-WS-06 | WORKSPACE §4.2 |
| **F-CORE-CTR-PREV-01** | Xem trước | `POST …/preview` | ephemeral | AC-WS-07 | WORKSPACE §4.2 |

---

## 3. Sponsor UI/UX locks (G5)

| # | Lock | Spec anchor |
|---|------|-------------|
| 1 | Một `ContractWorkspaceDialog` modes create\|edit\|view · parent CC ~90% | WORKSPACE §1 · PAT-DIALOG |
| 2 | **NV-first**; UV chỉ «Offer trước hire» / hire CTA | WORKSPACE §5 · U65 AMEND · HIRE |
| 3 | Clause body SoT Settings; create = `clause_ids` + merge tokens | WORKSPACE §4.2 · SETTINGS-CLAUSES |
| 4 | View = Edit minus mutate; 2-step; read-only + preview/In | VIEW-PARITY |
| 5 | Profile tab → same workspace; deprecate legacy dialog | PROFILE · ADR §3.2 |
| 6 | Settings composer/clauses separate PAT — cross-ref only | INDEX §2 |

---

## 4. Delta vs BA-02 (AMEND only)

| BA-02 | G5 AMEND |
|-------|----------|
| Q6 default tab **Ứng viên** on CC create | **Nhân viên** default — UV explicit Offer / hire CTA |
| `ContractCreateWizardDialog` as sole orchestrator | `ContractWorkspaceDialog` SoT + wizard shim |
| View = registry grid only | VIEW-PARITY full workspace |
| Profile own dialog | PROFILE deep-link workspace |

**RETAIN:** Q1 portal · Q2 CC URL · Q3–Q5 fields · Q7–Q8 DnD Gỡ · Q9 C&B card · Q10 trích yếu · Q11 theme · Q12 probation template.

---

## 5. Gaps / residual

| Gap | Owner | Trigger |
|-----|-------|---------|
| G-CTR-SUBJ-01 POST `candidate_id` | dev-be | AC-HIRE-03 · SUBJECT-02 |
| CORE-09c PDF/VER UI | dev-fe + qa | sau BE — honesty false |
| Delete legacy `EmployeeContracts` dialog | dev-fe chore | sau G4 PASS |
| `PO-HRM-CTR-WORKSPACE-NV-FIRST-BA-03` | — | superseded by G5 pack |

---

## 6. Handoff

| Role | work_item | Entry | Exit |
|------|-----------|-------|------|
| **dev-fe** | `PO-HRM-CTR-WORKSPACE-WAVE-G3` | G5 published + ADR | `spec_read_ack` all UI-HRM-CTR-* · READY_FOR_QA |
| **qa** | `PO-HRM-CTR-WORKSPACE-WAVE-G4` | FE G3 READY | Matrix J-HRM-CTR-* + HIRE-01 + VIEW + PROFILE U65 |

---

## 7. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Published A–G: INDEX · WORKSPACE (7 mục guide) · VIEW-PARITY · PROFILE-DEEP-LINK · HIRE-CTA · U65 AMEND · traceability §2. SOLID map ContractRegistryFields / ContractClauseCanvas / useContractPrintSpine. NV-first G5 AMEND documented. |
| **residual** | G-CTR-SUBJ-01 BE · 09c print UI · legacy dialog removal post-G4 |
| **next_owner** | **dev-fe** (G3 align) + **qa** (G4 matrix) |
| **evidence_path** | `docs/program/specs/PO-HRM-CTR-UIUX-SPEC-PACK-G5.md` · `docs/hrm/ui-screens/UI-HRM-CTR-*.md` |
| **ack_status** | **PASS_TO_PM** |
| **printable** | **false** |

### next_dispatch_prompt (dev-fe)

```text
work_item_id: PO-HRM-CTR-WORKSPACE-WAVE-G3
role: dev-fe
read_first:
  - docs/hrm/ui-screens/UI-HRM-CTR-SPEC-INDEX.md
  - docs/hrm/ui-screens/UI-HRM-CTR-WORKSPACE.md
  - docs/hrm/ui-screens/UI-HRM-CTR-VIEW-PARITY.md
  - docs/hrm/ui-screens/UI-HRM-CTR-PROFILE-DEEP-LINK.md
  - docs/architecture/ADR-HRM-CONTRACT-WORKSPACE-UNIFIED-01.md
  - docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md §11-§12
entry_criteria: PO-HRM-CTR-UIUX-SPEC-PACK-G5 PASS_TO_PM; sponsor_confirm 2026-08-11
exit_criteria: ContractWorkspaceDialog create|edit|view; extract ContractRegistryFields + ContractClauseCanvas + useContractPrintSpine; NV-first default; profile + CC launchers; parent portal PAT; deprecate EmployeeContracts inline dialog; vitest source tests; spec_read_ack ui_screen_spec paths; READY_FOR_QA — contracts_printable_ready=false
cấm: invent API; honesty paragraph; seed; claim module UAT DONE
evidence_path: docs/qa/evidence/po-hrm-ctr-workspace-fe-g3.md
ack_status: READY_FOR_QA
```

### next_dispatch_prompt (qa)

```text
work_item_id: PO-HRM-CTR-WORKSPACE-WAVE-G4
role: qa
read_first:
  - docs/hrm/ui-screens/UI-HRM-CTR-SPEC-INDEX.md §4 testid registry
  - docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-BA-02.md §4 §6
  - docs/hrm/ui-screens/UI-HRM-CTR-VIEW-PARITY.md §7
  - docs/hrm/ui-screens/UI-HRM-CTR-HIRE-CTA.md §7
entry_criteria: dev-fe G3 READY_FOR_QA; L0 PASS; U65 zero-seed
exit_criteria: Browser evidence AC-WS-* + retained AC-CTR-* + AC-VIEW-* + AC-PROF-* + J-HRM-CTR-HIRE-01; URL command-center/hrm/contracts for DnD; F5 after mutate; contracts_printable_ready=false; update PILOT_BUSINESS_FLOW_BA_TRACE J-HRM-CTR-VIEW-01 · J-HRM-CTR-PROFILE-01 · J-HRM-CTR-HIRE-01
evidence_path: docs/qa/evidence/po-hrm-ctr-workspace-qa-g4.md
ack_status: PASS_TO_PM
```
