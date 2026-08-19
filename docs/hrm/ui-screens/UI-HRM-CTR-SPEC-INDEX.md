# UI-HRM-CTR-SPEC-INDEX — Master index · Hợp đồng lao động (workspace)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-CTR-UIUX-SPEC-PACK-G5` |
| **sponsor_confirm** | 2026-08-11 — SOLID Contract Surface + UIUX spec song song G1–G4 |
| **honesty** | `contracts_printable_ready=false` · **C-SLICE-≠-MODULE** |
| **ref_guide** | `docs/program/specs/PO-HRM-FE-UI-SCREEN-SPEC-GUIDE-01.md` |
| **ref_adr** | `docs/architecture/ADR-HRM-CONTRACT-WORKSPACE-UNIFIED-01.md` |

---

## 1. Mục đích index

Bản đồ **màn → file spec → UC → API → component FE → testid** để Dev-FE implement G3 không đoán; QA G4 bind matrix browser U65.

---

## 2. Ma trận màn hình (runtime)

| Screen ID | Route / entry | UI spec file | UC / FR (SRS) | API chính (API_DESIGN) | Component FE target | Journey |
|-----------|---------------|--------------|---------------|------------------------|---------------------|---------|
| **CTR-WORKSPACE** | CC `…/command-center/hrm/contracts` · query `workspace=create\|edit\|view` | [`UI-HRM-CTR-WORKSPACE.md`](./UI-HRM-CTR-WORKSPACE.md) | FR-UC-BP-CORE-09 · 09a–09d · FR-HRM-CI-01 | POST/PATCH/GET `…/contracts*` · PUT overlay · POST preview · GET create-context | `ContractWorkspaceDialog` · `ContractRegistryFields` · `ContractClauseCanvas` · `useContractPrintSpine` | J-HRM-CTR-CREATE-01..09 |
| **CTR-VIEW-PARITY** | CC list → Eye · `workspace=view&contractId=` | [`UI-HRM-CTR-VIEW-PARITY.md`](./UI-HRM-CTR-VIEW-PARITY.md) | FR-UC-BP-CORE-09b · 09c · FR-HRM-CI-01 #8 | GET `…/contracts/{id}` · POST preview (read-only) | Same workspace `mode=view` | J-HRM-CTR-CREATE-06 · J-HRM-CTR-VIEW-01 |
| **CTR-PROFILE-DL** | Hồ sơ NV → tab Hợp đồng → Thêm/Sửa/Xem | [`UI-HRM-CTR-PROFILE-DEEP-LINK.md`](./UI-HRM-CTR-PROFILE-DEEP-LINK.md) | FR-UC-BP-CORE-09 · FR-HRM-INT-02 | GET `…/contracts?employee_id=` · GET create-context | `EmployeeContracts` launcher → workspace · `buildContractWorkspacePath` | J-HRM-CTR-PROFILE-01 |
| **CTR-HIRE-CTA** | Tuyển dụng → UV hired → «Tạo HĐ» | [`UI-HRM-CTR-HIRE-CTA.md`](./UI-HRM-CTR-HIRE-CTA.md) | FR-HRM-INT-01 · FR-HRM-RC-03 · FR-UC-BP-CORE-09 | GET candidates · POST contracts (`candidate_id`) | `CandidateDetailView` CTA · `contractWorkspaceDeepLink` | **J-HRM-CTR-HIRE-01** |
| **CTR-U65-TPL** | Settings → Contracts U65 chain | [`UI-CTR-CREATE-U65-TEMPLATE-PATH.md`](./UI-CTR-CREATE-U65-TEMPLATE-PATH.md) | FR-UC-BP-CORE-09d | contract-templates activate · POST contracts | Settings + workspace step1 template picker | CTR-U65-01..04 |
| **SETTINGS-CTR-CLAUSES** | `/settings?tab=contract-clauses` | [`UI-SETTINGS-CTR-CLAUSES.md`](./UI-SETTINGS-CTR-CLAUSES.md) | FR-UC-BP-CORE-09a | contract-clauses CRUD | `ContractLegalPrintSettingsPanel` view=clauses | J-CTR settings |
| **SETTINGS-CTR-TPL** | `/settings?tab=contract-templates` | [`UI-SETTINGS-CTR-TEMPLATE-COMPOSER.md`](./UI-SETTINGS-CTR-TEMPLATE-COMPOSER.md) | FR-UC-BP-CORE-09d | contract-templates · PUT clauses junction | `ContractLegalPrintSettingsPanel` view=templates | J-CTR settings |
| **PAT-DIALOG-CC** | Mọi dialog mutate HĐ trên CC | [`PAT-DIALOG-FULL-VIEWPORT-CC-01.md`](./PAT-DIALOG-FULL-VIEWPORT-CC-01.md) | TECHSPEC §4.1 | — | `hrmDialogFullViewport` · parent portal | AC-CTR-UX-06 |

**Cấm:** Settings composer/clauses **không** nhân bản vào workspace — chỉ **cross-ref** + deep link CTA.

---

## 3. Component map (SOLID — G3 target)

| Component / hook | Trách nhiệm | Extract từ (AS-IS) | Spec § |
|------------------|-------------|-------------------|--------|
| `ContractWorkspaceDialog` | Mode `create\|edit\|view` · stepper · footer · portal shell | `ContractCreateWizardDialog` + view grid `Contracts.tsx` | WORKSPACE §3–§5 |
| `ContractRegistryFields` | Bước 1 registry grid (NV-first · template · dates · C&B · ký) | `ContractCreateStep1GeneralGrid` | WORKSPACE §4.1 |
| `ContractClauseCanvas` | Palette · canvas DnD · Gỡ · mandatory confirm | `ContractCreateStep2ClausePreview` | WORKSPACE §4.2 |
| `useContractPrintSpine` | Preview · overlay PUT · VER/PDF state | `ContractPrintSpinePanel` logic | WORKSPACE §4.3 |
| `Contracts.tsx` | List · filter · open workspace | Giữ list; bỏ duplicate wizard markup G3+ | INDEX |
| `EmployeeContracts.tsx` | Tab list · renew · **launcher** workspace | Deprecate inline dialog L912+ | PROFILE-DL |

---

## 4. Testid registry (workspace P0)

| testid | Vùng | Mode |
|--------|------|------|
| `ctr-workspace-root` | Dialog shell | all |
| `ctr-workspace-mode` | Hidden/aria mode discriminator | all |
| `ctr-create-wizard-root` | **Alias shim** → workspace root (regression) | create/edit |
| `ctr-create-wizard-stepper` | Step 1 \| Step 2 | create/edit/view |
| `ctr-create-step-1` | Registry grid | all |
| `ctr-create-step-2` | Clause canvas | all |
| `ctr-create-subject-tab-employee` | NV tab (default G5) | create |
| `ctr-create-subject-tab-candidate` | UV tab «Offer trước hire» | create |
| `ctr-create-subject-tab-offer` | **G5 label** alias optional | create |
| `ctr-create-employee-picker` | NV combobox | create/edit |
| `ctr-create-candidate-picker` | UV combobox | create |
| `ctr-create-template-combobox` | Mẫu HĐ active | create/edit |
| `ctr-create-signing-date` | Ngày ký `dd/MM/yyyy` | create/edit |
| `ctr-create-work-arrangement` | Hình thức LV catalog | create/edit |
| `ctr-create-salary-ratio` | Tỉ lệ % (no thousand group) | create/edit |
| `ctr-create-abstract` | Trích yếu | create/edit |
| `ctr-create-clause-palette` | Palette trái | create/edit |
| `ctr-create-clause-canvas` | Canvas phải | create/edit/view |
| `ctr-clause-remove-{id}` | Nút Gỡ | create/edit only |
| `ctr-create-preview-btn` | Xem trước | create/edit/view |
| `ctr-create-preview-panel` | Panel preview | create/edit/view |
| `ctr-workspace-view-edit-cta` | «Sửa» từ view | view |
| `ctr-workspace-close-btn` | Đóng | view |
| `ctr-hire-create-contract-cta` | REC «Tạo HĐ» | REC detail |

**Locale:** ngày `dd/MM/yyyy` · tiền thousand group `vi-VN` · % salary_ratio **không** group.

---

## 5. Handoff

| Role | Đọc trước code | Exit |
|------|----------------|------|
| **dev-fe** | INDEX + WORKSPACE + VIEW-PARITY + PROFILE + HIRE | G3 slice `PO-HRM-CTR-WORKSPACE-G3` |
| **qa** | AC tables trong từng spec + BA-02 AC-CTR-* | G4 matrix update |
| **sa** | ADR + WORKSPACE §SOLID | Exception PAT only |

---

## 6. Honesty stamp

`contracts_printable_ready=false` — preview ephemeral; In/PDF khi BE CORE-09c sẵn sàng; **không** claim module CTR UAT DONE.
