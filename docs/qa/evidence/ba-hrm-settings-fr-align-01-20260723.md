# BA-HRM-SETTINGS-FR-ALIGN-01 — catalog_key → FR SoT (SC-MD* → SC-POS/JT/…)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-23 |
| **Role** | ba-data (governance) |
| **work_item_id** | `BA-HRM-SETTINGS-FR-ALIGN-01` |
| **lane** | governance — **cấm** `apps/**` · seed · deploy |
| **Entry** | `ba-hrm-settings-master-data-01-20260723.md` · `BA_HRM_ORPHAN_TO_SRS_01_20260723.md` §1.1 · `sa-hrm-settings-rec-wf-01-20260723.md` S1/S3 |
| **change_mode** | **ADD appendix + rename map only** — **không** viết lại orphan SRS |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Normative rename (SC-MD* → SoT FR)

| BA-D FR target (cũ — master-data §3) | **FR SoT mới** (orphan delta §1 / §1.1) | Alias pack | Orphan # |
|--------------------------------------|------------------------------------------|------------|----------|
| **FR-HRM-SC-MD-01** | **FR-HRM-SC-POS-01** | (chức danh) | #9 |
| **FR-HRM-SC-MD-02** | **FR-HRM-SC-POS-01** | (phòng ban / org — cùng FR) | #9 |
| **FR-HRM-SC-MD-03** | **FR-HRM-SC-LEAVE-01** | — | #19 |
| **FR-HRM-SC-MD-04** | **FR-HRM-SC-DEC-01** | — | #13 |
| **FR-HRM-SC-MD-05** | **FR-HRM-SC-PAY-01** | — | #12 |
| **FR-HRM-RC-JD-01** | **FR-HRM-SC-JT-01** | = RC-JD-01 · UC-HRM-RC-07 | #4 |
| **FR-HRM-FL-SCHEMA-01** | **FR-HRM-FL-02** | mở rộng FL-01 | #7 |
| **FR-HRM-IM-FIELDS-01** | **FR-HRM-IM-02** | (+ IM-03 alias VI) | #8 |
| **FR-HRM-SC-MD-06** (P1 band) | **FR-HRM-20-BAND-01** | dashboard — **không** Settings master CRUD P0 | #11 |
| **FR-HRM-SC-MD-07** (P1 select values) | **FR-HRM-IM-02** / field catalogs DM §21–26 | bind import/profile — **không** SC-POS | — |

**Deprecation rule:** Mọi handoff / Dev / QA **sau 2026-07-23** phải cite **FR SoT mới**. `FR-HRM-SC-MD-01..05` = **alias lịch sử** (BA-D master-data) — vẫn hợp lệ khi đọc evidence cũ; **không** ADD FR mới dưới mã MD-*.

**BR / AC khóa (không đổi semantics):**

| ID | Role |
|----|------|
| **BR-HRM-MD-01** | Master data SoT — cấm free-text |
| **BR-SET-MD-01..03** | Ownership + empty honest (master-data §1) |
| **BR-HRM-OWN-01..04** | S1 XBOS SoT / S3 Settings UX (orphan §1.1 · SA ADR) |
| **AC-SET-FS-01..05** | Filter + search picker (master-data §2) |
| **AC-HRM-PICKER-01** | Consumer form picker (orphan §0) |

**Ownership (SA S1/S3 — cite `sa-hrm-settings-rec-wf-01`):**

| Option | Meaning |
|--------|---------|
| **S1** | XBOS = SoT master tập đoàn → HRM **sync/pull** + extension queue — **không** fork SoT |
| **S3** | Settings = **CRUD UX** trên snapshot/extension + filter/search; write = extension hoặc XBOS theo scope |

---

## 1. Phụ lục ma trận — catalog_key → FR SoT + DANH_MUC STT

### 1.1 P0 Settings master (sponsor lock)

| Field UI (VI) | catalog_key / entity | DANH_MUC STT | FR SoT (normative) | BA-D alias (cũ) | Ownership S1/S3 | Consumers | AC |
|---------------|----------------------|--------------|--------------------|-----------------|-----------------|-----------|-----|
| Chức danh NV | `job_titles` (+ overlay `position` / `job_title_key`) | **§3 STT 7–8, 10** · **§10 STT 60** | **FR-HRM-SC-POS-01** | SC-MD-01 | **S1** XBOS + optional extension; Settings UX **S3** | Employees; Import; Rec plan; WF `position_template` | AC-SC-POS-01..03 · AC-SET-FS-* · AC-HRM-PICKER-01 |
| Phòng ban / bộ phận | `departments` / `department_catalog` / `org_departments` · org tree | **§2 STT 3** · **§3 STT 9** | **FR-HRM-SC-POS-01** | SC-MD-02 | **S1** XBOS org pull; company overlay CRUD nếu thiếu nhánh (**S3**) | Employees; Company; Attendance; Rec | cùng AC-SC-POS-* |
| Vị trí / JD tuyển dụng | entity `job_templates` (+ `job_grades` / channels) | **§6 STT 37–42** (kênh/trạng thái XBOS); templates = **company-local** | **FR-HRM-SC-JT-01** (= RC-JD-01) | RC-JD-01 | **S3 company-local CRUD** (BR-HRM-OWN-02) — không XBOS fork JD | YCTD; UC-HRM-RC-07 F6 | AC-SC-JT-01 · AC-CD-F6-01..02 · AC-HRM-PICKER-01 |
| Loại nghỉ | `leave_types` | **§5 STT 30** | **FR-HRM-SC-LEAVE-01** | SC-MD-03 | **S1** XBOS + company entitlement extension | Leave create; balance; chart FR-20-CHART | AC-SC-LEAVE-01..03 · AC-SET-FS-* |
| Loại quyết định | `decision_types` | **§5 STT 28** | **FR-HRM-SC-DEC-01** | SC-MD-04 | **S1** XBOS + optional company types | UC-HRM-27 create/tabs | AC-SC-DEC-01..03 · BR-DEC-04 |
| Thành phần lương | `salary_components` (+ categories); XBOS `payroll_templates` / phụ cấp–khấu trừ | **§5 STT 32–34** | **FR-HRM-SC-PAY-01** | SC-MD-05 | **Hybrid:** nature/type chuẩn **S1**; dòng thành phần **S3 company CRUD** | SalaryComponents; payslip; F5 allowance | AC-SC-PAY-01..03 · AC-SET-FS-* |
| Fleet fields (du lịch) | `hrm_fleet_*` (9 keys) | **§8 STT 46–54** · XBOS-DM-HRM-13 | **FR-HRM-FL-02** | FL-SCHEMA-01 | **S1** publish→pull; `xe-du-lich` extension | Fleet vehicles; Settings fleet | AC-FL-02-01..02 |
| Import Excel columns | `hrm_employee_*_fields` (+ select values) | **§4 STT 15–20** · **§4.1 STT 21–26** | **FR-HRM-IM-02** (+ **IM-03** alias VI) | IM-FIELDS-01 | **S1** field groups + alias VI/EN Settings | Spreadsheet import/export | AC-IM-02-* · AC-IM-03-* · VAL-SET-MD-06 |

### 1.2 P1 / related (không đổi P0 SoT)

| Field UI | catalog_key / entity | DANH_MUC STT | FR SoT | Ownership | Note |
|----------|----------------------|--------------|--------|-----------|------|
| Salary band dashboard | `salary_bands` (proposed Settings) | — (config company) | **FR-HRM-20-BAND-01** | S3 numeric bands | Was SC-MD-06 — **không** map vào SC-PAY |
| Interview status | `interview_statuses` / kết quả PV | **§6 STT 41–42** | **FR-HRM-RC-IV-01** | S1 XBOS | Was RC-IV / G-ORPH-BE-10 |
| Ops task priority/status | `operations_task_*` / request types | **§5 STT 35–36** | **FR-HRM-OP-01** | S1 + FR enum lock | Was OP-ENUM-01 |
| Allowance codes (F5) | loại phụ cấp | **§5 STT 33** | **FR-HRM-SC-PAY-01** (+ CI F5) | S1 codes | Consumer picker — VAL-SET-MD-05 |
| Compensation packages | `employee_compensation_packages` | — (transactional + catalog) | **FR-HRM-CI-PKG-01** | S3 company | Orphan #5 — ngoài SC-POS/JT |
| Catalog WF tenant gate | settings / policy | **§9 STT 55–59** (WF codes) | **FR-HRM-SC-WF-GATE-01** | Config / ADR | Orphan #20 |
| Catalog extensions | `hrm_catalog_extension_*` | STT 57 + G-DB-06 | **FR-HRM-SC-EXT-01** | S1 approve · S3 request UX | Orphan #21 |
| Chart leave colors | (metadata trên `leave_types`) | STT 30 | **FR-HRM-20-CHART-01** | consumes **SC-LEAVE-01** | Orphan #10 |

### 1.3 DANH_MUC STT → catalog_key → FR (index nhanh)

| STT | Tên (DANH_MUC) | catalog_key (runtime) | FR SoT |
|-----|----------------|----------------------|--------|
| 3 | Cây ĐVTC / phòng ban | `departments` / org | **SC-POS-01** |
| 7–8, 10 | Thư viện / chức danh theo CT / chức vụ | `job_titles` · positions | **SC-POS-01** |
| 9 | Bộ phận làm việc | `departments` overlay | **SC-POS-01** |
| 15–20 | Nhóm trường hồ sơ | `hrm_employee_*_fields` | **IM-02** |
| 21–26 | Giá trị chọn hồ sơ | select values in field catalogs | **IM-02** (bind) |
| 28 | Loại quyết định NS | `decision_types` | **SC-DEC-01** |
| 30 | Loại đơn nghỉ | `leave_types` | **SC-LEAVE-01** |
| 32–34 | Kỳ lương / phụ cấp / khấu trừ | `payroll_templates` · `salary_components` | **SC-PAY-01** |
| 37–42 | Tuyển dụng (kênh/TT/PV) | `job_grades` · channels · interview_* | **SC-JT-01** (JD local) · **RC-IV-01** (PV) |
| 46–54 | Hồ sơ xe | `hrm_fleet_*` | **FL-02** |
| 55–59 | Mã QT XBOS | workflow codes (ref) | **AT-WF-01** / **SC-WF-GATE-01** / REC-WF |
| 60 | Chức danh master | `job_titles` | **SC-POS-01** |

**Linkage §3:** `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §3 giữ `catalogKey` runtime — FR SoT cite bảng §1.1 này (không đổi publish/pull paths trong wave này).

---

## 2. VAL / error map (IDs giữ; FR cite mới)

| VAL-ID | Condition | Expected | FR SoT |
|--------|-----------|----------|--------|
| VAL-SET-MD-01 | `job_title_key` ∉ synced `job_titles` | **400** catalog miss (hoặc soft badge G-FID-06 — SA) | **SC-POS-01** |
| VAL-SET-MD-02 | `leave_type` ∉ `leave_types` | **400** `HRM-ATT-LEAVE-TYPE` | **SC-LEAVE-01** |
| VAL-SET-MD-03 | `decision_type` ∉ `decision_types` | **400** `HRM-DEC-TYPE` | **SC-DEC-01** |
| VAL-SET-MD-04 | Requisition thiếu `job_template_id` | **400** (G-RC-01) | **SC-JT-01** |
| VAL-SET-MD-05 | `allowance_code` ∉ catalog | **400** (BR-CD-F5-03) | **SC-PAY-01** |
| VAL-SET-MD-06 | Import header unknown + no alias | **SHEET-422** | **IM-02** / **IM-03** |

**scope_parity (U19):** list settings-catalogs + get items by key = cùng `(tenant_id, company_id)` resolver như employees list; Group CEO `main` rollup không 404 company-scoped catalog đã list.

---

## 3. Gap register (ownership — IDs giữ; FR cite mới)

| Gap-ID | Conflict | FR SoT | Recommendation |
|--------|----------|--------|----------------|
| GAP-MD-01 | Seed `tenant-position-catalog` vs XBOS STT 7–10,60 | **SC-POS-01** | **S1** XBOS SoT; deprecate seed path UAT evidence |
| GAP-MD-02 | FE hardcode decision types vs STT 28 | **SC-DEC-01** | Lock `decision_types`; DTO `@IsIn` synced |
| GAP-MD-03 | FE/BE leave palette vs STT 30 | **SC-LEAVE-01** | Sync-only list; colors từ catalog metadata |
| GAP-MD-04 | Job templates CRUD thiếu FR khách (đã ADD) | **SC-JT-01** | Promote khách ba-docs; Settings/TD library UX |
| GAP-MD-05 | Import VI ≠ spreadsheet EN | **IM-02** / **IM-03** | One field matrix + alias Settings |
| GAP-MD-06 | Fleet schema chỉ TS seed | **FL-02** | XBOS-DM-HRM-13 publish OR Settings schema |
| GAP-MD-07 | Payroll `component_type` default `'Lương'` | **SC-PAY-01** | Enum SoT Settings; align nature |
| GAP-MD-08 | Settings upsert free `code`/`label` | mọi SC-* | Remaster searchable items; free-text = extension only |

---

## 4. Traceability (BRD/SRS → API → DB → FE → test)

| FR SoT | API | DB | FE | Journey / UF |
|--------|-----|----|----|--------------|
| **SC-POS-01** | `settings-catalogs` · `sync-from-xbos` · `pull/job_titles` | `synced_catalogs` · extension | EmployeeForm; Settings | UF-HRM-10 · J-HRM-02 · AC-FID-10 |
| **SC-JT-01** | `…/recruitment/job-templates` | `job_templates` | JobRequisitionsTab | UF-HRM-12 · J-HRM-05 · F6 |
| **SC-LEAVE-01** | pull `leave_types` · leave CRUD | `leave_requests.leave_type` | LeaveTab | UF-HRM leave · J-HRM attendance |
| **SC-DEC-01** | `…/decisions` | `hr_decisions.decision_type` | Decisions.tsx | UC-HRM-27 · AC-DEC-* |
| **SC-PAY-01** | payroll catalog / salary components | payslip lines · components | SalaryComponentsTab | UC-HRM-28 · F5 |
| **FL-02** | `hrm_fleet_*` pull | fleet_fields | Fleet | HRM-FL-01 |
| **IM-02** | spreadsheet + field catalogs | employees + aliases | Import UI | HRM-IM-* |

---

## 5. Risks

| Risk | Mitigation |
|------|------------|
| Dev/QA vẫn cite SC-MD-* → lệch SRS §16 | Evidence này = SoT rename; master-data § appendix pointer |
| SC-MD-01 và SC-MD-02 cùng **SC-POS-01** → nhầm 2 FR | Document: **một FR**, hai catalog family (titles vs dept) |
| SC-MD-06 map nhầm vào SC-PAY | Explicit → **FR-HRM-20-BAND-01** only |

---

## 6. Residual

| # | Residual | Owner |
|---|----------|-------|
| R1 | Khách HTML promote FR SC-POS/JT/LEAVE/DEC/PAY | **ba-docs** (đã DISPATCHED `BA-HRM-ORPHAN-SRS-KHACH-01` nếu còn mở) |
| R2 | Dev remaster picker + DTO `@IsIn` | **sau** Sponsor confirm — **không** wave này |
| R3 | ADR S1/S3 execution wiring | SA ADR đã PASS; Dev sau sponsor |

---

## 7. Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/ba-hrm-settings-fr-align-01-20260723.md`
- **Artifacts touched:** this evidence · appendix pointer on `ba-hrm-settings-master-data-01-20260723.md`  
- **Cấm:** apps/** · seed · deploy · rewrite orphan SRS

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-HRM-SETTINGS-FR-TRACE-01 (or PM backlog next)
from_role: pm
to_role: qa (governance verify) OR ba-docs if khách promote still open
lane: governance / verify
entry_criteria:
  - docs/qa/evidence/ba-hrm-settings-fr-align-01-20260723.md PASS
  - FR SoT: FR-HRM-SC-POS-01 · SC-JT-01 · SC-LEAVE-01 · SC-DEC-01 · SC-PAY-01
  - BR-HRM-MD-01 · AC-HRM-PICKER-01 · AC-SET-FS-01..05
  - DANH_MUC STT map §1.3 evidence
exit_criteria:
  1) Matrix / UF rows cite FR SoT mới (không SC-MD-* làm primary)
  2) Confirm SC-POS covers job_titles STT 7–10,60 + departments STT 3,9
  3) Evidence path + PASS_TO_PM
cấm: apps/** · seed · deploy · claim Phase1/PROD
```

---

## completion_report

**Closed:** Phụ lục ma trận `catalog_key` → **FR SoT mới** (SC-POS / SC-JT / SC-LEAVE / SC-DEC / SC-PAY + FL-02 / IM-02); rename SC-MD-01..05 → aliases; DANH_MUC STT alignment (§1.3); VAL/gap/trace cập nhật cite FR mới; ownership S1/S3 giữ nguyên SA. **Không** viết lại orphan SRS.

**Open:** ba-docs khách promote (nếu chưa PASS); Dev remaster blocked until sponsor.
