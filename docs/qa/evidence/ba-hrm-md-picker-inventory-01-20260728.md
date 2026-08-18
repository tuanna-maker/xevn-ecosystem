# BA-HRM-MD-PICKER-INVENTORY-01 — HRM Settings→Select inventory (G0)

**work_item_id:** `BA-HRM-MD-PICKER-INVENTORY-01`  
**from_role:** pm → **to_role:** ba-process  
**lane:** governance (docs only — **no** `apps/**` edits)  
**date:** 2026-07-28  
**program:** `P-HRM-MD-PICKER-01` · `docs/program/HRM_MASTER_DATA_PICKER_GAP_PROGRAM.md`

## Spec lock (read)

| Rule | Source |
|------|--------|
| Master-data fields = Settings CRUD (+ group base / company extension); consumer = combo/search | `docs/hrm/SRS.md` §16.0 **BR-HRM-MD-01** + **AC-HRM-PICKER-01** |
| Catalog FR map | **FR-HRM-SC-POS-01** · **FR-HRM-SC-JT-01** · **FR-HRM-SC-LEAVE-01** · **FR-HRM-SC-DEC-01** · **FR-HRM-SC-PAY-01** |
| Orphan context | `docs/program/ORPHAN_BUSINESS_VS_SRS_SIMPLE.md` §C #9/#12/#13/#19 — FR already ADD; gap = **implement / orphan picker** |

## Method

- GREP-only under `apps/web/hrm` for consumer forms: `Input` / `Select` / `CatalogSearchPicker` on position, department, leave type, decision type, pay component, employment type, contract type, JD.
- Settings SoT surface: `MasterDataSettingsPanel.tsx` buckets `job_titles` · `departments` · `leave_types` · `decision_types` (+ deep-link JT / pay).
- Catalog helpers: `lib/catalogSearchPicker.ts` → `HRM_MASTER_DATA_CATALOG_KEYS`.

### Verdict legend

| Verdict | Meaning |
|---------|---------|
| **PASS** | Consumer widget = `CatalogSearchPicker` or Select bound to Settings catalog (`settings-catalogs` / FR-HRM-SC-*) |
| **FAIL** | Free-text `Input` where BR-HRM-MD-01 requires Settings→Select (SoT risk) |
| **GAP** | Has Select/checkbox but SoT ≠ Settings catalog (hardcoded enum, `useDepartments().name`, employee free-text derived) |
| **N/A** | Not master-data catalog field (free narrative / external history / quantity) |

### Priority

| P | Criteria |
|---|----------|
| **P0** | Sponsor symptom or identity field (chức danh/vị trí) free-text on mutate form |
| **P1** | Department / JD / leave / decision consumer lệch SoT catalog |
| **P2** | Hardcoded Select enums that should be Settings-extendable |
| **P3** | Secondary / display-only / derived-from-employees |

---

## Inventory table

| # | Screen / route | Field label (VI) | Widget | Spec FR / AC | Verdict | Priority | Code note (grep) |
|---|----------------|------------------|--------|--------------|---------|----------|------------------|
| 1 | Employee Profile → Quá trình công tác · `EmployeeWorkHistory` · dialog «Thêm quá trình công tác» | **Vị trí** | **Input** free-text | BR-HRM-MD-01 · AC-HRM-PICKER-01 · FR-HRM-SC-POS-01 | **FAIL** | **P0** | `EmployeeWorkHistory.tsx` ~L990–994 `<Input value={formData.position} />` — **sponsor example** |
| 2 | Same · Work History dialog | Phòng ban | Select (`useDepartments` → `dept.name`) | FR-HRM-SC-POS-01 · AC-HRM-PICKER-01 | **GAP** | P1 | Select exists but value=**name**, not Settings catalog code via `CatalogSearchPicker` / `departmentOptionsFromCatalog` |
| 3 | Same · Work History dialog | Công ty (lịch sử) | Input | — | **N/A** | — | Past/external employer name may remain free-text; not FR-HRM-SC-* catalog |
| 4 | Employees → Thêm/Sửa NV · `EmployeeFormDialog` | Phòng ban | **CatalogSearchPicker** | FR-HRM-SC-POS-01 · AC-HRM-PICKER-01 | **PASS** | — | `departmentOptionsFromCatalog` |
| 5 | Same · EmployeeFormDialog | Chức danh / Vị trí | **CatalogSearchPicker** | FR-HRM-SC-POS-01 · AC-HRM-PICKER-01 | **PASS** | — | `job_titles` / `positions` / `employee_positions` |
| 6 | Same · EmployeeFormDialog | Loại hình làm việc | Select hardcoded (`full-time`…) | BR-HRM-MD-01 (catalog field chọn) · FR-HRM-SC-EXT-01 | **GAP** | P2 | Not Settings catalog; enum in FE |
| 7 | Quyết định · `Decisions` create/edit | Loại quyết định | **CatalogSearchPicker** | FR-HRM-SC-DEC-01 · AC-HRM-PICKER-01 | **PASS** | — | `decision_types` (+ bootstrap fallback if empty) |
| 8 | Same · Decisions | Phòng ban | Select (`departments` name) | FR-HRM-SC-POS-01 | **GAP** | P1 | Same pattern as Work History dept |
| 9 | Same · Decisions | **Vị trí** | **Input** free-text | FR-HRM-SC-POS-01 · AC-HRM-PICKER-01 | **FAIL** | **P0** | `Decisions.tsx` ~L1027–1030 |
| 10 | Same · Decisions | Chức danh người ký | Input | FR-HRM-SC-POS-01 (chức danh) | **FAIL** | P2 | `signer_position` free-text ~L1100–1102 |
| 11 | Chấm công → Nghỉ phép · `LeaveTab` | Loại nghỉ | **CatalogSearchPicker** | FR-HRM-SC-LEAVE-01 · AC-HRM-PICKER-01 | **PASS** | — | `leaveTypeOptionsFromCatalog`; empty → CTA Settings |
| 12 | Tuyển dụng → Thư viện JD · `JobTemplatesTab` | Chức danh / Vị trí | **CatalogSearchPicker** | FR-HRM-SC-POS-01 · FR-HRM-SC-JT-01 · AC-HRM-PICKER-01 | **PASS** | — | `position_code` from `job_titles` |
| 13 | Tuyển dụng → YCTD · `JobRequisitionsTab` | JD từ thư viện | **CatalogSearchPicker** | FR-HRM-SC-JT-01 · AC-HRM-PICKER-01 | **PASS** | — | `job_template_id` |
| 14 | Same · JobRequisitionsTab | Phòng/Ban | **CatalogSearchPicker** | FR-HRM-SC-POS-01 | **PASS** | — | department catalog keys |
| 15 | Same · JobRequisitionsTab | Loại hình | Select hardcoded | BR-HRM-MD-01 / EXT | **GAP** | P2 | `employment_type` FE enum |
| 16 | Tuyển dụng → Tin tuyển dụng · `JobPostingsTab` | **Vị trí** | **Input** free-text | FR-HRM-SC-POS-01 · AC-HRM-PICKER-01 | **FAIL** | **P0** | `name="position"` ~L817–822 |
| 17 | Same · JobPostingsTab | Phòng ban | **Input** free-text | FR-HRM-SC-POS-01 | **FAIL** | P1 | ~L831–836 |
| 18 | Same · JobPostingsTab | Loại hình | Select hardcoded | BR-HRM-MD-01 / EXT | **GAP** | P2 | local `employmentTypes[]` |
| 19 | Tuyển dụng → Đề xuất định biên · `HeadcountProposalTab` | Phòng ban | **Input** free-text | FR-HRM-SC-POS-01 | **FAIL** | P1 | ~L1044–1050 |
| 20 | Same · HeadcountProposalTab | **Vị trí tuyển dụng** | **Input** free-text | FR-HRM-SC-POS-01 · AC-HRM-PICKER-01 | **FAIL** | **P0** | `position_name` ~L1056–1064 |
| 21 | Tuyển dụng → Ứng viên · `CandidateFormDialog` | Vị trí ứng tuyển | **Input** free-text | FR-HRM-SC-POS-01 | **FAIL** | P1 | `name="position"` ~L338–343 — may mirror job posting; still free-text SoT |
| 22 | Hợp đồng (module) · `Contracts` | Loại hợp đồng | Select from Settings catalog (+ fallback hardcode) | catalog `contract_types` · AC-HRM-PICKER-01 spirit | **PASS*** | P2* | *PASS if catalog non-empty; fallback `CONTRACT_TYPE_OPTIONS` = soft GAP when empty |
| 23 | Hồ sơ NV → Hợp đồng · `EmployeeContracts` | Loại hợp đồng | Select **hardcoded** `CONTRACT_TYPES_KEYS` | same as #22 | **GAP** | P1 | Not wired to `contract_types` catalog (parity gap vs Contracts page) |
| 24 | Same · EmployeeContracts | **Vị trí** | **Input** free-text | FR-HRM-SC-POS-01 · AC-HRM-PICKER-01 | **FAIL** | **P0** | ~L861–864 |
| 25 | Same · EmployeeContracts | Phòng ban | Select (`dept.name`) | FR-HRM-SC-POS-01 | **GAP** | P1 | ~L869–879 |
| 26 | Same · EmployeeContracts | Chức danh người ký | Input | FR-HRM-SC-POS-01 | **FAIL** | P2 | `signer_position` |
| 27 | Lương → Thành phần lương · `SalaryComponentsTab` | Loại thành phần (`component_type`) | Select hardcoded `componentTypes` | FR-HRM-SC-PAY-01 (orphan #12) | **GAP** | P2 | `useSalaryComponents.ts` `componentTypes = ['Lương',…]` — not Settings catalog |
| 28 | Lương → Mẫu lương · `SalaryTemplateBuilder` | Thành phần lương (add) | Pick list from `useSalaryComponents` API | FR-HRM-SC-PAY-01 | **PASS** | — | Consumer picks existing components (CRUD surface = SalaryComponents + Settings deep-link) |
| 29 | Same · SalaryTemplateBuilder | Vị trí công việc áp dụng | Checkbox list from **employee `job_title_key`** | FR-HRM-SC-POS-01 · AC-HRM-PICKER-01 | **GAP** | P2 | ~L145–153 / L776–799 — derived from employees, not Settings `job_titles` picker; may show raw keys |
| 30 | Lương · Payroll dialogs «Vị trí áp dụng» | Vị trí áp dụng | Input readOnly «Tất cả…» | FR-HRM-SC-POS-01 | **GAP** | P3 | Placeholder UX — not a real catalog multi-select |
| 31 | Chấm công · tạo bảng · `Attendance` | Vị trí công việc | Select from **employee.position** free-text set | FR-HRM-SC-POS-01 | **GAP** | P2 | ~L3292–3308 — inherits free-text pollution |
| 32 | Cài đặt · `MasterDataSettingsPanel` | Chức danh / PB / Loại nghỉ / Loại QĐ | Settings CRUD (+ picker in admin) | FR-HRM-SC-* | **PASS** | — | Catalog SoT surface exists — consumer bind is the gap |
| 33 | Hồ sơ NV → Công việc · `EmployeeJobList` | Phòng ban (task) | Input | — | **N/A** | P3 | Task/project dept narrative — not HRM master-data identity (unless BA later extends SC-EXT) |

---

## Summary counts

| Verdict | Count (in-scope master-data rows) |
|---------|-----------------------------------|
| FAIL | **10** (#1 position WH, #9 Decisions position, #10 signer_position, #16–17 JobPostings, #19–20 Headcount, #21 Candidate position, #24–26 EmployeeContracts position+signer) |
| GAP | **10** (dept name-Select×3, employment_type×3, EmployeeContracts contract_type, pay component_type, template positions, payroll readOnly, attendance sheet) |
| PASS | **9** (EmployeeFormDialog×2, Leave, Decisions type, JobTemplates, Requisition JD+dept, SalaryTemplate component pick, Contracts contract_type*, Settings panel) |
| N/A | 2 |

**P0 FAIL cluster (position free-text):** Work History · Decisions · JobPostings · HeadcountProposal · EmployeeContracts.

---

## Spec says / Code does (anchor)

| Spec | Code (2026-07-28) |
|------|-------------------|
| AC-HRM-PICKER-01: consumer combo from Settings | `EmployeeFormDialog`, `LeaveTab`, `JobTemplatesTab`, `JobRequisitionsTab` (partial), `Decisions.decision_type` **PASS** |
| Same AC for **Vị trí** everywhere | `EmployeeWorkHistory` **FAIL** (sponsor); also Decisions / JobPostings / Headcount / EmployeeContracts **FAIL** |
| FR-HRM-SC-POS-01 department | Mixed: CatalogSearchPicker on Employee + YCTD; **name Select** on Work History / Decisions / EmployeeContracts; **Input** on JobPostings + Headcount |

**Conclusion:** Không thiếu FR — **orphan picker / implement gap**. Settings CRUD đã có; consumer forms không đồng nhất bind.

---

## Out of scope this WI

- `apps/**` code / seed / Phase1 DONE claim  
- XBOS publish control depth → `SA-XBOS-HRM-CONTROL-GAP-01`  
- FK/API column trace → `BA-HRM-MD-CATALOG-TRACE-01`  
- SRS delta only if SYNTH finds wording hole (likely not needed — BR/AC already lock)

---

## Handoff

```yaml
work_item_id: BA-HRM-MD-PICKER-INVENTORY-01
from_role: ba-process
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/ba-hrm-md-picker-inventory-01-20260728.md
knowledge_merge: docs/program/HRM_MD_PICKER_KNOWLEDGE_MERGE.md (Cursor findings appended)
```

### next_dispatch_prompt (copy-ready for PM)

```text
work_item_id: SYNTH-HRM-MD-PICKER-01 (or wait PEER Claude G0 seats)
from_role: pm
to_role: pm (Cursor-PM synthesis) + peer Claude if OPEN
entry_criteria: Cursor BA inventory PASS_TO_PM at docs/qa/evidence/ba-hrm-md-picker-inventory-01-20260728.md; ba-data CATALOG-TRACE + sa XBOS-CONTROL + Claude peer findings in HRM_MD_PICKER_KNOWLEDGE_MERGE.md
exit_criteria: docs/program/HRM_MD_PICKER_PEER_SYNTHESIS.md — table agree/diverge; P0 list for E1 (must lead with D-FE-HRM-WH-POSITION-PICKER-01); U74 sponsor chốt before any apps/** Dev
cấm: Dev apps/** trước sponsor chốt; seed; Phase1 claim
residual_P0_preview: EmployeeWorkHistory.position Input; Decisions.position; JobPostings.position+department; HeadcountProposal.position_name+department; EmployeeContracts.position
```

---

**ack_status:** `PASS_TO_PM`
