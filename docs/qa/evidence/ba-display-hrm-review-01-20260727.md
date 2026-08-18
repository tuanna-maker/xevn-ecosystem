# BA-DISPLAY-HRM-01 — HRM raw-key / label-leak inventory (U72)

| Field | Value |
|-------|-------|
| **work_item_id** | `BA-DISPLAY-HRM-01` |
| **Date** | 2026-07-27 |
| **Sponsor lock** | **U72** — «Các trường thông tin khi hiện ra ngoài phải hiện trường được định nghĩa rõ ràng — không hiện trường dạng key.» |
| **Related** | U72 + SRS `BR-CO-LABEL-01` · `FR-HRM-CO-IND-01` / `AC-CO-IND-*` (industry đã khóa riêng) |
| **Role** | ba-process |
| **ack_status** | `PASS_TO_PM` |

---

## 0. Entry / scope

| Check | Result |
|-------|--------|
| `docs/client-delivery/02_SRS_XeVN_OS.html` | **Exists** — UC-H01..H06 (employees, attendance, leave, payroll, recruitment) + mobile UC-M* |
| Entry path `apps/api/hrm/` | **Does not exist** |
| Actual API SoT | `apps/api/hrm-api/src/` (+ XBOS `apps/api/xbos-api/src/org-foundation/` for Company) |
| FE SoT | `apps/web/hrm/src/` |
| Team SRS display rules | `docs/hrm/SRS.md` — `BR-CO-LABEL-01`, `FR-HRM-CO-IND-01` |

**Method:** Static review FE render + BE response fields (enum/code without `*_label`). Not a browser UAT (U65). Verdict = source-of-truth for Dev fix queue.

**Verdict legend**

| Symbol | Meaning |
|--------|---------|
| ✅ PASS | UI đã dictionary / i18n label |
| ❌ FAIL-LABEL-LEAK | User-facing raw key/enum/slug/UUID |
| ⚠️ UNKNOWN | Cần runtime/sample data để khẳng định |
| 🔵 N/A | ID nội bộ / không render end-user (hoặc cột admin code kèm label) |

---

## 1. BE pattern (cross-cutting)

Almost **no** HRM response DTO returns `status_label` / `type_label` / `stage_label`. FE must map locally or join Settings `code`→`label`.

| Pattern | Companion VI? | Risk if FE binds raw |
|---------|---------------|----------------------|
| Lifecycle `status` / `stage` | No | English badge |
| `employment_type`, `contract_type`, `leave_type` | No (catalog `label` separate) | English / code |
| `job_title_key` | No on employee row | Catalog code |
| `company_id` slug | Often `company_display_name` / OU `display_name_vi` | Slug leak if ignored |
| XBOS `entity_type` | No | **Must not** bind to «Ngành nghề» |
| XBOS `business_lines` | No API label | Needs FE dictionary (industry) |
| Settings item `code` + `label` | Yes | OK if show label; FAIL if show status raw |

---

## 2. Module review tables

### 2.1 Employees

| Module | Trường | Giá trị nguồn (API) | Hiện tại UI hiển thị | Đúng chuẩn (label cần) | Verdict |
|--------|--------|---------------------|---------------------|----------------------|---------|
| Employees | `status` (list) | `active` / `inactive` / `probation` | `StatusBadge` → i18n | Active→Đang làm việc / … | ✅ PASS |
| Employees | Company column | `company_id` slug + display helpers | `resolveEmployeeCompanyColumnLabel` / LE name | Tên pháp nhân VI | ✅ PASS |
| Employees | Profile `gender` | `male` / `female` / … | Raw `{employee.gender}` (`EmployeeProfile.tsx` ~500) | Nam / Nữ / Khác | ❌ FAIL-LABEL-LEAK |
| Employees | Resume `gender` | same | Raw (`EmployeeResume.tsx` ~294) | Nam / Nữ / Khác | ❌ FAIL-LABEL-LEAK |
| Employees | Profile `employment_type` | `full-time` / `part-time` / `contract` / `full_time` / … | Partial ternary; else raw (`EmployeeProfile.tsx` ~557–560) | Toàn thời gian / Bán thời gian / Hợp đồng / … | ❌ FAIL-LABEL-LEAK |
| Employees | Profile `work_location` | free text or code | Raw (`~551`) | Tên địa điểm VI hoặc «—» | ⚠️ UNKNOWN |
| Employees | Profile department/position | TEXT / catalog | Raw string (often VI already) | Catalog `label` nếu lưu code | ⚠️ UNKNOWN |
| Employees | Compensation `line_type` | `base` / `probation` / `allowance` | Partial map; unknown→raw | Lương cơ bản / Thử việc / Phụ cấp | ❌ FAIL-LABEL-LEAK |
| Employees | Compensation `allowance_code` | catalog code | Raw mono (`EmployeeCompensationPanel` / History) | Catalog `label` VI | ❌ FAIL-LABEL-LEAK |
| Employees | Assets `status`/`condition` | enums | Map + `\|\| raw` fallback | Full map; unknown→«—» | ⚠️ UNKNOWN |
| Employees | Rewards/Discipline types | enums | Map + `\|\| raw` | Full map | ⚠️ UNKNOWN |
| Employees | `employee_id` / UUID | UUID | Not primary list label | Internal only | 🔵 N/A |

### 2.2 Company Management

| Module | Trường | Giá trị nguồn (API) | Hiện tại UI hiển thị | Đúng chuẩn (label cần) | Verdict |
|--------|--------|---------------------|---------------------|----------------------|---------|
| Company | «Ngành nghề» / industry | Was wrongly `entity_type`; now `business_lines` | `resolveIndustryDisplay` — blocklist holding/subsidiary; VI catalog | VI ngành hoặc «—» | ✅ PASS (post D-HRM-CO-INDUSTRY) |
| Company | `entity_type` | `holding` / `subsidiary` | Not bound to industry | Optional cột «Loại đơn vị» VI (AC-CO-IND-05) | 🔵 N/A (not shown as industry) |
| Company | `status` | `active` / `inactive` | `getStatusBadge` i18n | Hoạt động / Ngừng | ✅ PASS |
| Company | OU filter slug | `operating_slug` | `display_name_vi` map | Tên đơn vị VI | ✅ PASS |
| Company | Members `role` | role codes | `t('roles.*')` | VI role; miss→key | ⚠️ UNKNOWN |
| Company | Holding synthetic id | `xbos-group-holding-root` | Internal filter id | Not user industry | 🔵 N/A |

### 2.3 Contracts

| Module | Trường | Giá trị nguồn (API) | Hiện tại UI hiển thị | Đúng chuẩn (label cần) | Verdict |
|--------|--------|---------------------|---------------------|----------------------|---------|
| Contracts | List/page `status` | `active` / `expired` / `terminated` | `getStatusBadge` / `getStatusLabel` | Đang hiệu lực / Hết hạn / … | ✅ PASS |
| Contracts | History panel `status` | same | Raw `{contract.status}` (`EmployeeContracts.tsx` ~1202) | Same VI badge as list | ❌ FAIL-LABEL-LEAK |
| Contracts | `contract_type` (employee tab / history) | `fixed_term` / `indefinite` / `HDLD_*` / free VN | Raw `{contract.contract_type}` (~1190, list cells) | Dictionary VI (vd. Có thời hạn / Không thời hạn) | ❌ FAIL-LABEL-LEAK |
| Contracts | `contract_type` (page + alert) | same | Raw (`Contracts.tsx`, `ExpiringContractsAlert.tsx` ~136) | Dictionary VI | ❌ FAIL-LABEL-LEAK |
| Contracts | `contract_code` | business code | Shown as badge | Acceptable business code | ✅ PASS |
| Contracts | Internal UUID | UUID | Not primary label | — | 🔵 N/A |

### 2.4 Insurance

| Module | Trường | Giá trị nguồn (API) | Hiện tại UI hiển thị | Đúng chuẩn (label cần) | Verdict |
|--------|--------|---------------------|---------------------|----------------------|---------|
| Insurance | Page `status` | `active` / `expired` / `cancelled` | `getStatusBadge` | VI | ✅ PASS |
| Insurance | Type chips (page) | type codes | i18n type filters | VI | ✅ PASS |
| Insurance | Employee tab `type`/`status` | `social` / `active` / … | i18n with raw fallback (`EmployeeInsurance.tsx`) | Always VI; unknown→«—» | ⚠️ UNKNOWN |
| Insurance | Provider | free text | Text | Text | ✅ PASS |

### 2.5 Attendance / Leave

| Module | Trường | Giá trị nguồn (API) | Hiện tại UI hiển thị | Đúng chuẩn (label cần) | Verdict |
|--------|--------|---------------------|---------------------|----------------------|---------|
| Leave | `leave_type` (LeaveTab) | catalog code / `annual` | `leaveTypeDisplayLabel` / `resolveLeaveTypeLabel` | Catalog label VI | ✅ PASS |
| Leave | `status` (LeaveTab) | `pending` / `approved` / … | `StatusBadge` | Chờ duyệt / Đã duyệt / … | ✅ PASS |
| Attendance | Sheet type | `byHour`/`byDay` mapped | `t('attPage.byHour/byDay')` | Theo giờ / Theo ngày | ✅ PASS |
| Attendance | Dashboard reminder `leave_type` | same codes | Raw `{row.leave_type}` (`HrmApiReminders.tsx` ~99) | Same as LeaveTab label | ❌ FAIL-LABEL-LEAK |
| Attendance | View leave detail `leaveType` | may be code | `{selectedLeaveRequest.leaveType}` view mode | Catalog VI | ⚠️ UNKNOWN |
| Attendance | Record `status` | `present` / `absent` / … | StatusBadge / mapped in sheets | VI | ✅ PASS (primary paths) |

### 2.6 Payroll

| Module | Trường | Giá trị nguồn (API) | Hiện tại UI hiển thị | Đúng chuẩn (label cần) | Verdict |
|--------|--------|---------------------|---------------------|----------------------|---------|
| Payroll | Payslip / period status | `draft` / `processed` / `paid` / `closed` | `StatusBadge` + known maps | Nháp / Đã xử lý / Đã trả / … | ✅ PASS |
| Payroll | Payment batch status | enums | `getStatusBadge`; default→raw | Full map; unknown→«—» | ⚠️ UNKNOWN |
| Payroll | Component nature | nature codes | `getNatureBadge` | VI | ✅ PASS |
| Payroll | Bonus type | codes | `bonusTypeLabels` | VI | ✅ PASS |
| Payroll | Comp package lines | see Employees compensation | Raw codes on employee panel | Catalog VI | ❌ FAIL-LABEL-LEAK (shared) |
| Payroll | `period_label` | period name string | Display as-is | Period name OK | ✅ PASS |

### 2.7 Recruitment

| Module | Trường | Giá trị nguồn (API) | Hiện tại UI hiển thị | Đúng chuẩn (label cần) | Verdict |
|--------|--------|---------------------|---------------------|----------------------|---------|
| Recruitment | Requisition `status` | `open` / `on_hold` / … | `REQUISITION_STATUS_LABEL_VI` | VI | ✅ PASS |
| Recruitment | Requisition `employment_type` | `full-time` / `full_time` / … | Raw table + detail (`JobRequisitionsTab` ~491, ~851) | Dùng `EMPLOYMENT_TYPE_OPTIONS` labels | ❌ FAIL-LABEL-LEAK |
| Recruitment | Detail `company_id` | slug | `font-mono` raw (~861) | Tên đơn vị / `company_display_name` | ❌ FAIL-LABEL-LEAK |
| Recruitment | `workflow_instance_id` | UUID | Shown mono to user (~867) | Ẩn hoặc «Mã quy trình» rút gọn + không UUID full | ❌ FAIL-LABEL-LEAK |
| Recruitment | Posting `employment_type` | same | Map find label \|\| raw | Always label | ⚠️ UNKNOWN |
| Recruitment | Funnel `stage` (list) | `new` / `screening` / … | `RECRUITMENT_FUNNEL_LABEL_VI` + fallback | Full map | ⚠️ UNKNOWN |
| Recruitment | Import dialog `stage` | stage key | Raw `{row.stage}` | Funnel VI | ❌ FAIL-LABEL-LEAK |
| Recruitment | Candidate `marital_status` | `single` / `married` / … | Raw (`CandidateDetailView` ~407) | Độc thân / Đã kết hôn / … | ❌ FAIL-LABEL-LEAK |
| Recruitment | Candidate `source` | free / code | Raw \|\| other | Dictionary if coded | ⚠️ UNKNOWN |
| Recruitment | Interview status/type | enums | `statusConfig` / `typeConfig` | VI | ✅ PASS |
| Recruitment | Plan / proposal status | enums | VI maps / ternaries | VI | ✅ PASS |

### 2.8 Settings catalogs

| Module | Trường | Giá trị nguồn (API) | Hiện tại UI hiển thị | Đúng chuẩn (label cần) | Verdict |
|--------|--------|---------------------|---------------------|----------------------|---------|
| Settings | Catalog title `catalog_key` | `leave_types` / … | `resolveCatalogKeyDisplayLabel` | VI title | ✅ PASS |
| Settings | Item `label` | VI label | Shown | Label nghiệp vụ | ✅ PASS |
| Settings | Item `code` | `LVT_01` / `ceo` | `font-mono` next to label | Admin master-data: code OK **with** label | 🔵 N/A (admin code + label) |
| Settings | Item `origin` | `xbos` / `hrm` | i18n originXbos/Hrm | VI | ✅ PASS |
| Settings | Item `status` | `active` / `draft` | Raw `{row.status}` (`SettingsCatalogsTab` ~231; `MasterDataSettingsPanel` ~134) | Đang dùng / Nháp | ❌ FAIL-LABEL-LEAK |

### 2.9 Menu / Navigation

| Module | Trường | Giá trị nguồn (API) | Hiện tại UI hiển thị | Đúng chuẩn (label cần) | Verdict |
|--------|--------|---------------------|---------------------|----------------------|---------|
| Menu | Sidebar / mobile nav | `titleKey: nav.*` | i18n `t(titleKey)` | Tiếng Việt menu | ✅ PASS |
| Menu | Scope role chip | role codes | `formatRoleCodeVi` / `ROLE_LABEL_VI` | VI | ✅ PASS |
| Menu | Embed tenant context | tenant slug/UUID | `resolveTenantDisplayLabelVi` | VI / fallback an toàn | ✅ PASS |

### 2.10 Out-of-requested but in HRM app (residual)

| Module | Trường | Giá trị nguồn (API) | Hiện tại UI hiển thị | Đúng chuẩn (label cần) | Verdict |
|--------|--------|---------------------|---------------------|----------------------|---------|
| Performance | Cycle `status` | `draft` / `active` / `closed` | Raw `({item.status})` (`Performance.tsx` ~202) | Nháp / Đang mở / Đã đóng | ❌ FAIL-LABEL-LEAK |
| Performance | Evaluation row | `employee_id` UUID | `Employee {uuid}` (~217) | Tên NV (+ mã) | ❌ FAIL-LABEL-LEAK |
| Decisions | type/status | catalog / status | `getTypeLabel` / `getStatusBadge` | VI | ✅ PASS |

---

## 3. FAIL-LABEL-LEAK register (actionable)

| ID | Module | Field / UI surface | Raw example | Fix owner | Priority |
|----|--------|--------------------|-------------|-----------|----------|
| F-01 | Employees | Profile + Resume `gender` | `male` | **dev-fe** | P0 |
| F-02 | Employees | Profile `employment_type` fallback | `full_time` | **dev-fe** | P0 |
| F-03 | Employees / Payroll | Compensation `line_type` / `allowance_code` | `base`, `PHU_CAP_*` | **dev-fe** (+ catalog resolve) | P1 |
| F-04 | Contracts | `contract_type` list/history/alert | `fixed_term` | **dev-fe** | P0 |
| F-05 | Contracts | History `status` | `active` | **dev-fe** | P0 |
| F-06 | Attendance | Dashboard `leave_type` | `annual` / `LVT_01` | **dev-fe** | P0 |
| F-07 | Recruitment | Requisition `employment_type` | `full-time` | **dev-fe** | P0 |
| F-08 | Recruitment | Detail `company_id` | `trsport` | **dev-fe** | P0 |
| F-09 | Recruitment | `workflow_instance_id` | UUID | **dev-fe** | P1 |
| F-10 | Recruitment | Candidate `marital_status` | `single` | **dev-fe** | P0 |
| F-11 | Recruitment | Import `stage` | `screening` | **dev-fe** | P1 |
| F-12 | Settings | Catalog item `status` | `active` / `draft` | **dev-fe** | P0 |
| F-13 | Performance | Cycle `status` + eval `employee_id` | `draft`, UUID | **dev-fe** | P1 |

**BE residual (not UI leak by itself, but enables FE):**

| ID | Module | Field | Note | Owner |
|----|--------|-------|------|-------|
| B-01 | Cross | Most enums lack `*_label` | FE dictionary OK short-term; optional companion labels for mobile/parity | **dev-be** (optional P2) |
| B-02 | Company | `business_lines` code only | FE dictionary required (already for industry) | **dev-be** if enrich missing | already tracked industry wave |
| B-03 | Contracts / Recruitment | Inconsistent `employment_type` / `contract_type` spellings | Normalize codes in API or document canonical set | **dev-be** P2 |

**Industry `subsidiary`/`holding`:** closed on FE mapper (`resolveIndustryDisplay`) — **not** reopened as FAIL in this inventory (✅ PASS). Re-verify QA AC-CO-IND if empty «—» only.

---

## 4. Acceptance criteria (remediation) — U72 / BR-CO-LABEL-01

Global rule for every FAIL:

> **AC-U72-GLOBAL:** Mọi giá trị enum/code/slug hiển thị cho người dùng trên UI HRM **phải** qua dictionary (i18n hoặc catalog `label`). Không có khóa kỹ thuật tiếng Anh / snake_case / UUID thay nhãn. Thiếu mapping → hiển thị «—» (không fallback raw).

| FAIL ID | Acceptance criteria (measurable) |
|---------|----------------------------------|
| **F-01** | UI phải hiển thị `{Nam\|Nữ\|Khác}` thay vì `{male\|female\|other}` trên Profile và Resume; form edit và view dùng cùng map. |
| **F-02** | UI phải hiển thị nhãn VI (`Toàn thời gian` / `Bán thời gian` / `Hợp đồng` / …) thay vì `{full-time\|full_time\|part-time\|contract\|intern}`; mọi biến thể spelling canonical → cùng label; unknown → «—». |
| **F-03** | UI phải hiển thị `{Lương cơ bản\|Thử việc\|Phụ cấp}` thay vì `{base\|probation\|allowance}`; `allowance_code` → catalog `label` VI, không mono code trên panel user. |
| **F-04** | UI phải hiển thị nhãn loại HĐ VI (catalog / dictionary) thay vì `{fixed_term\|indefinite\|permanent\|HDLD_*}` trên list Contracts, EmployeeContracts, ExpiringContractsAlert. |
| **F-05** | History panel phải dùng cùng `getStatusConfig` / badge VI như list — không `{active\|expired\|terminated}` thô. |
| **F-06** | `HrmApiReminders` phải dùng `resolveLeaveTypeLabel` / `leaveTypeDisplayLabel` — UI phải hiển thị `{Nghỉ phép năm\|…}` thay vì `{annual\|LVT_01}`. |
| **F-07** | Bảng + chi tiết Job Requisition: UI phải hiển thị label từ `EMPLOYMENT_TYPE_OPTIONS` thay vì raw `employment_type`. |
| **F-08** | Chi tiết requisition: UI phải hiển thị **tên đơn vị** VI thay vì slug `{holding\|trsport\|…}` mono. |
| **F-09** | Không hiện full `workflow_instance_id` UUID cho HR user; ẩn hoặc badge «Đã gắn quy trình» (không raw UUID). |
| **F-10** | Candidate detail: UI phải hiển thị `{Độc thân\|Đã kết hôn\|…}` thay vì `{single\|married\|divorced}`. |
| **F-11** | Candidate import preview: UI phải hiển thị funnel VI thay vì `{stage}` raw. |
| **F-12** | Settings / MasterData item status: UI phải hiển thị `{Đang dùng\|Nháp}` (hoặc i18n tương đương) thay vì `{active\|draft}`. |
| **F-13** | Performance: cycle status VI; evaluation row hiện **tên nhân viên** (và mã) thay vì `Employee {uuid}`. |

**Regression (must keep):**

- Company «Ngành nghề» = `resolveIndustryDisplay` — **cấm** regression `subsidiary`/`holding` (AC-CO-IND-02).
- LeaveTab `leaveTypeDisplayLabel`, Employees list `StatusBadge`, Menu `nav.*` i18n.
- U65: không seed để chứng minh label; FE click + F5.

---

## 5. Counts

| Verdict | Count (user-facing rows in §2 tables) |
|---------|----------------------------------------|
| ✅ PASS | **32** |
| ❌ FAIL-LABEL-LEAK | **18** (13 FAIL IDs; some IDs span multiple rows) |
| ⚠️ UNKNOWN | **12** |
| 🔵 N/A | **7** |

FAIL ID register: **13** FE fixes + **3** BE optional residuals.

---

## 6. Spec / SRS cites

| Ref | Use |
|-----|-----|
| Client SRS HTML | UC-H01..H06 modules in scope |
| `docs/hrm/SRS.md` `BR-CO-LABEL-01` | Normative anti raw-key |
| `FR-HRM-CO-IND-01` / `AC-CO-IND-*` | Industry already locked |
| U72 (2026-07-27) | System-wide display label lock |

**BA note:** U72 elevates `BR-CO-LABEL-01` from Company-only wording to **HRM-wide**. Optional follow-up governance: ADD short `FR-HRM-U72-LABEL-01` cross-cutting in team SRS (ba-process / ba-docs) — **not blocking** Dev-FE wave.

---

## 7. Handoff

### completion_report

Closed: Full HRM domain static inventory across 9 requested modules + Performance residual; entry path corrected to `hrm-api`; industry leak documented as already PASS; 13 FAIL IDs with AC-U72 remediation.

Residual: 12 UNKNOWN fields need QA spot-check with live persona; optional BE `*_label` companions P2; SRS cross-cut FR for U72 optional.

### Counts for PM

- **PASS:** 32  
- **FAIL-LABEL-LEAK:** 18 rows / **13** fix IDs (F-01..F-13)  
- **UNKNOWN:** 12  
- **N/A:** 7  

### next_owner

**dev-fe** (primary — all F-01..F-13 are FE dictionary/render).  
**dev-be** only for B-01..B-03 optional / spelling normalize (P2).

### next_dispatch_prompt

```text
work_item_id: D-HRM-U72-LABEL-FE-01
role: dev-fe
entry_criteria:
  - Read docs/qa/evidence/ba-display-hrm-review-01-20260727.md §3–§4
  - Read docs/hrm/SRS.md BR-CO-LABEL-01 + AC-CO-IND-* (must_keep industry)
  - U65 zero-seed; code_memory_required APPEND
change_mode: FIX
allowed_paths:
  - apps/web/hrm/src/pages/EmployeeProfile.tsx
  - apps/web/hrm/src/components/employee/**
  - apps/web/hrm/src/components/recruitment/**
  - apps/web/hrm/src/components/dashboard/HrmApiReminders.tsx
  - apps/web/hrm/src/components/dashboard/ExpiringContractsAlert.tsx
  - apps/web/hrm/src/components/settings/SettingsCatalogsTab.tsx
  - apps/web/hrm/src/components/settings/MasterDataSettingsPanel.tsx
  - apps/web/hrm/src/pages/Contracts.tsx
  - apps/web/hrm/src/pages/Performance.tsx
  - apps/web/hrm/src/lib/** (shared label maps)
forbidden_paths:
  - apps/api/** (unless PM opens D-HRM-U72-LABEL-BE-01)
must_keep:
  - resolveIndustryDisplay blocklist holding/subsidiary
  - LeaveTab leaveTypeDisplayLabel
  - Menu nav.* i18n
exit_criteria:
  - F-01..F-13 closed: no raw enum/slug/UUID on listed surfaces; unknown → «—»
  - Unit tests for gender / employment_type / marital_status / leave reminder / requisition employment_type maps
  - READY_FOR_QA evidence path docs/qa/evidence/d-hrm-u72-label-fe-01-YYYYMMDD.md
ack_status target: READY_FOR_QA
```

Parallel optional:

```text
work_item_id: QA-HRM-U72-LABEL-01
role: qa
entry_criteria: after D-HRM-U72-LABEL-FE-01 READY_FOR_QA; browser-only U65
exit_criteria: Spot F-01..F-13 + AC-CO-IND-02 regression; matrix note in USER_FLOW or evidence; PASS_TO_PM
```

### evidence_path

`docs/qa/evidence/ba-display-hrm-review-01-20260727.md`

### ack_status

**PASS_TO_PM**
