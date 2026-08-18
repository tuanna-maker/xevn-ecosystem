# QA-HRM-ERP-FIDELITY-SPOT-01 — Multi-domain Settings→form spot

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-ERP-FIDELITY-SPOT-01` |
| **Date** | 2026-07-28 |
| **Lane** | G0 spot · U65 zero-seed · HOLD_DEPLOY · **no Phase1 claim** |
| **Scope** | Independent sample **≥5 HRM domains** — Settings exists? Catalog Select? Obvious missing required/constraint on create? |
| **Method** | Static form audit + route smoke + Bearer catalog overview (no seed, no mutate UF) |
| **Hosts** | `http://127.0.0.1:5173` · LAN `http://192.168.88.174:5173` · hrm `:28001` · xbos `:28002` |
| **nip.io** | **not used** |
| **Seed** | **none** (U65) |
| **Prior input** | `qa-hrm-md-picker-spot-01-20260728.md` (Work History position Input) |

---

## Environment smoke (L0 light)

| Probe | Result |
|-------|--------|
| `GET :5173/` / LAN `:5173/` | **200** / **200** |
| `GET :5173/hr/{settings,employees,decisions,attendance,payroll,recruitment,contracts}` | **200** each |
| `GET :28001/api/hrm` | **200** |
| `GET :28001/api/hrm/settings-catalogs` (no auth) | **401** (route alive) |
| `POST :28002/api/xbos/auth/login` `ceo@xe.vn` | **201** `XBOS-AUTH-200` |
| Bearer `GET …/settings-catalogs` | **200** `HRM-SET-200` · **76** catalogs |

Live catalog samples (Bearer): `job_titles=9` · `positions=33` · `leave_types=6` · `departments=5` · `contract_types=5` · **`hr_decision_types=3`** · **`decision_types` MISS** · **`salary_components` MISS**.

Browser full UF mutate (Lưu→F5) = **out of scope** this WI (spot inventory only).

---

## Spec says / Code does (ERP fidelity questions)

| PO question | Spec / program | Spot observation |
|-------------|----------------|------------------|
| (A) Settings có? | `HRM_ERP_DATA_FIDELITY_PROGRAM.md` §2 · UF-HRM-10 | MD panel tabs + API overview exist |
| (B) Consumer bind catalog Select? | BR-HRM-MD-01 / AC-HRM-PICKER-01 | Mixed: Leave/Employee/JD OK; WH/JobPosting/Payroll type FAIL/HARDCODE |
| (C)/(D) CRUD + constraint đủ? | Program §2 | Several create dialogs omit required catalog fields or use optional Zod |

---

## Verdict table (Domain × Check)

| Domain | Check | Result | Notes |
|--------|-------|--------|-------|
| **1. Settings catalogs** | Settings UI + API SoT exists | **PASS** | `MasterDataSettingsPanel` tabs: Chức danh / Phòng ban / Loại nghỉ / Loại quyết định; JT+Pay tabs = deep-link stubs to Recruitment/Payroll. Live overview **76** keys. Matrix UF-HRM-10 prior 🟢 (not re-promoted). |
| **1b. Settings key parity** | FE master keys match live catalog keys | **FAIL** | FE `HRM_MASTER_DATA_CATALOG_KEYS.decisionTypes = ['decision_types']` + Settings `writeKey: decision_types`; live SoT key = **`hr_decision_types`** (3 items). Consumer falls back to hardcoded `DECISION_TYPES`. |
| **2. Employees create/edit** | Position/Dept = catalog Select | **PASS** | `EmployeeFormDialog`: `CatalogSearchPicker` for department + position (`job_titles`/`positions`). |
| **2b. Employees create** | Required/constraint on create | **PARTIAL** | Zod: only `employee_code` + `full_name` min(1); `department`/`position` **optional** — ERP-class usually require assignment FK on hire. |
| **3. Work history** | Position uses catalog Select | **FAIL** | Prior confirmed: `EmployeeWorkHistory.tsx` L991–994 `<Input value={formData.position}>`; dept = Select. Orphans also `EmployeeContracts` / `EmployeeWorkTimeline` position Inputs. |
| **4. Leave request** | Leave type = catalog Select + required | **PASS** | `LeaveTab`: `CatalogSearchPicker` ← `leave_types`; submit blocked if type not in catalog; employee + dates required. Live `leave_types` items=6. |
| **5. Decisions** | Decision type = catalog Select | **PARTIAL** | UI has `CatalogSearchPicker` + `*` label, but key lookup misses `hr_decision_types` → **hardcoded fallback**. Position field = free-text `<Input>` (L1028–1031). |
| **5b. Decisions create** | Required fields enforced | **FAIL** | `handleSubmit` checks only `decision_code` + `employee_name` + `title` — **does not** assert `decision_type` despite UI `*`. |
| **6. Payroll component** | Component type from Settings catalog | **FAIL** | `SalaryComponentsTab` Select options = hardcoded `componentTypes` in `useSalaryComponents.ts` (Chấm công, Lương, …). Live overview **no** `salary_components` key. Settings Pay tab = link-only (not Settings CRUD). Zod min(1) on type = local enum only. |
| **7. Recruitment job posting** | Position/dept catalog Select on create | **FAIL** | `JobPostingsTab`: `position` + `department` = `<Input>` free-text (required via Zod min(1) only — no catalog FK). |
| **7b. Recruitment requisition / JD** | Catalog bind on create | **PASS** | `JobRequisitionsTab`: CatalogSearchPicker JD template + department; headcount Zod ≥1. `JobTemplatesTab`: position via CatalogSearchPicker `job_titles`. `employment_type` = hardcoded Select (PARTIAL note). |
| **8. Contracts (extra)** | Contract type Select from catalog | **PARTIAL** | `Contracts.tsx`: Select from `contract_types` with **hardcoded** `CONTRACT_TYPE_OPTIONS` fallback; submit requires only code + employee_name (type not forced). Profile `EmployeeContracts` position still free-text. |

---

## Cross-cut inventory (product gaps OK for G0)

| Class | Surfaces |
|-------|----------|
| **FREE_TEXT position** | Work History · Decisions · Job Postings · EmployeeContracts · WorkTimeline |
| **HARDCODE / fallback enum** | Decisions type (key miss) · Payroll `componentTypes` · Contracts type fallback · Requisition `employment_type` |
| **Key / SoT mismatch** | `decision_types` (FE/write) vs `hr_decision_types` (live) |
| **Settings UI thin** | Pay + JD = deep-link only; no MD CRUD for salary_components / contract_types in MD panel |
| **Required under-assert** | Decisions `decision_type`; Employee dept/position optional; Contracts type optional |

**Contrast PASS patterns (keep):** EmployeeForm CatalogSearchPicker · Leave `leave_types` · JobTemplates / Requisition dept+JD pickers · Settings MD CRUD for JT/dept/leave (when keys match).

---

## Overall QA verdict

| Layer | Result |
|-------|--------|
| Spot coverage (≥5 domains) | **PASS** — 7 domains + Contracts extra |
| Process / evidence completeness | **PASS** |
| Product fidelity (Settings→consumer) | **FAIL / PARTIAL cluster** (expected G0 inventory) |
| **ack_status** | **PASS_TO_PM** — product gaps OK; wait SYNTH; **no** QC GO this WI |
| Phase 1 / PROD / deploy | **NONE** · HOLD_DEPLOY |
| Seed | **NONE** |
| UF matrix promote | **NONE** (spot only) |

---

## Residual / next

1. Wait **SYNTH-HRM-ERP-FIDELITY-01** / peer merge — do **not** open Dev `apps/**` until sponsor chốt E-wave cohorts.
2. Suggested cohort signals for SYNTH (not dispatch Dev now): key alias `hr_decision_types`↔`decision_types`; E-MD-PICKER free-text cluster; E-PAY component_type catalog; JobPostings picker.
3. Full browser U65 UF retest after E1 — not this WI.

---

## Handoff

- **completion_report:** Multi-domain spot closed (≥5). Settings API/UI exist; Leave + EmployeeForm + Rec requisition/JD bind PASS; FAIL cluster = WH/JobPosting/EmployeeContracts free-text position, Decisions key-miss + under-required, Payroll hardcoded componentTypes, Settings pay stub.
- **next_owner:** pm (APPEND merge → wait SYNTH / peer; QC later)
- **ack_status:** PASS_TO_PM
- **evidence_path:** `docs/qa/evidence/qa-hrm-erp-fidelity-spot-01-20260728.md`
