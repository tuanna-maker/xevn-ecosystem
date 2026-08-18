# D-MOB-U72-LABEL-SCAN-01 — Mobile HRM raw-key / label-leak inventory (U72)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-MOB-U72-LABEL-SCAN-01` |
| **Date** | 2026-07-27 |
| **Sponsor lock** | **U72** — cấm lộ raw enum/key/slug/UUID ra UI; null/unknown → «—» |
| **Related** | U65 inventory-only (no seed) · web pattern `BA-DISPLAY-HRM-01` · rule `display-label-no-raw-key.mdc` |
| **Role** | ba-process (governance · reclaim Claude LANE B) |
| **change_mode** | ADD (scan only — **no** `apps/**` fix) |
| **ack_status** | `PASS_TO_PM` |

---

## 0. Entry / scope

| Check | Result |
|-------|--------|
| Web inventory pattern | `docs/qa/evidence/ba-display-hrm-review-01-20260727.md` |
| Mobile SoT | `apps/mobile/hrm-mobile/src/` |
| Shared status helper | `integrations/mapApiError.ts` → `statusLabel()` (thin map + **raw fallback**) |
| Shared StatusBadge | `components/ui/StatusBadge.tsx` → `label ?? statusLabel(status)` |
| Method | Static FE render review (U65). Not device UAT. Verdict = Dev-Mobile fix queue. |

**Verdict legend**

| Symbol | Meaning |
|--------|---------|
| ✅ PASS | Dictionary / VI label; unknown→«—» or safe generic (không raw) |
| ❌ FAIL | User-facing raw key/enum/slug/UUID hoặc fallback raw/`snake→spaces` |
| ⚠️ UNKNOWN | Cần runtime/sample data |
| 🔵 N/A | Không render end-user / DEV-only / module không có trên mobile |

---

## 1. Cross-cutting BE / FE pattern (mobile)

| Pattern | Companion VI? | Risk |
|---------|---------------|------|
| Lifecycle `status` on list rows | Partial via `statusLabel` (5 keys only) | English badge khi thiếu map |
| `leave_type` | `resolveLeaveTypeLabel` | Unknown catalog code → **raw** |
| `contract_type` | `resolveContractTypeLabel` | Unknown / `full-time` / `HDLD_*` → spaces or raw |
| `service_type` / task `status` | `operationsLabels` | Unknown → underscore→space |
| `job_title_key` | `resolveRoleSubtitle` | Unknown → «Nhân viên» (safe) |
| `company_id` slug | `resolveCompanyDisplayVi` | Mapped / «Chưa chọn công ty» |
| Payslip `period_label` slug suffix | `resolvePayslipPeriodLabelVi` | Slug suffix → VI company |

**Root cause class:** nhiều màn truyền `status={api}` vào `ListRow` / `EssRichListRow` / `StatusBadge` **không** `statusLabel=…` → rơi vào `statusLabel()` raw fallback.

---

## 2. Inventory table

### 2.1 Auth / Scope / Settings

| Module | Field | Source value | UI today | Required VI label | Verdict |
|--------|-------|--------------|----------|-------------------|---------|
| Scope | Active company | `company_id` slug | `resolveCompanyDisplayVi` | Tên đơn vị VI | ✅ PASS |
| Scope | `company_id` / header wire | slug/UUID | Chỉ trong `__DEV__` meta | N/A prod | 🔵 N/A |
| Scope | Membership title | slug + display | `resolveMembershipRowTitle` | Tên công ty VI | ✅ PASS |
| Scope | Roles (settings path) | JWT role codes | `resolveAuthRolesVi` | Nhân viên / Quản lý / …; unknown→«Nhân viên» | ✅ PASS |
| Settings | Company scope | slug | `resolveCompanyDisplayVi` | VI | ✅ PASS |
| Settings | Roles | role codes | `resolveAuthRolesVi` | VI | ✅ PASS |
| Settings | Employee code | code / UUID id | `sanitizeProfileDisplay` (UUID→«—») | Mã NV hoặc «—» | ✅ PASS |
| Settings | UAT SecureStore fields | UUID inputs | DEV/QA override only | N/A prod persona | 🔵 N/A |
| Login | Error codes | `HRM-AUTH-*` | `formatHrmError` → `CODE: message` | Message VI; code optional support | ⚠️ UNKNOWN |

### 2.2 Home / Dashboard / Notifications

| Module | Field | Source value | UI today | Required VI label | Verdict |
|--------|-------|--------------|----------|-------------------|---------|
| Home | Check-in status | `present` / `absent` / … | `resolveWorkflowStatusVi` + StatusBadge label | Có mặt / Vắng / … | ✅ PASS |
| Home | Upcoming leave status | leave status | `resolveWorkflowStatusVi` | Chờ duyệt / … | ✅ PASS |
| Home | Inbox / workflow rows | status | `resolveWorkflowStatusVi` | VI; snake_case unknown→«Đang xử lý» | ✅ PASS |
| Home | Announcement `event_type` | `leave_request.created` / … | `resolveInboxEventTypeVi` / title sanitize | VI event | ✅ PASS |
| Home | Role subtitle | `job_title_key` | `resolveRoleSubtitle` | VI or «Nhân viên» | ✅ PASS |
| Notifications | Read state | internal | `copy.readLabel` VI | Đã đọc / Chưa đọc | ✅ PASS |

### 2.3 Profile / Team

| Module | Field | Source value | UI today | Required VI label | Verdict |
|--------|-------|--------------|----------|-------------------|---------|
| Profile | Gender | `male` / `female` / … | `resolveGenderVi` | Nam / Nữ / Khác | ✅ PASS (known) |
| Profile | Gender unknown | exotic code | `sanitizeProfileDisplay(key)` may show raw | «—» | ❌ FAIL |
| Profile | Employment status | `active` / `on_leave` / … | `resolveEmployeeStatusLabel` | Đang làm việc / … | ✅ PASS (known) |
| Profile | Employment status unknown | e.g. `probation` | Fallback may show raw | «—» hoặc «Thử việc» | ❌ FAIL |
| Profile | Job title | `job_title_key` | `resolveRoleSubtitle` | VI / «Nhân viên» | ✅ PASS |
| Profile | Contract type (docs tab) | `fixed_term` / … | `resolveContractTypeLabel` | Có thời hạn / … | ✅ PASS (known) |
| Profile | Contract type unknown | `full-time` / `HDLD_*` | spaces / raw | Dictionary; unknown→«—» | ❌ FAIL |
| Profile | Contract/payslip status in docs | status | `statusLabel(c.status)` | VI full set | ❌ FAIL (active/paid/…) |
| Profile | Hero employment badge | status | `resolveEmployeeStatusLabel` | VI | ✅ PASS (known) |
| Profile | Task priority | high/normal | `priorityLabel` VI | Ưu tiên cao / … | ✅ PASS |
| Team list | Check-in badge | derived | `TEAM_CHECK_IN_BADGE` «Đã chấm»/«Chưa chấm» | VI | ✅ PASS |
| Team list | Job title | `job_title_key` | `resolveTeamMemberJobTitle` | VI | ✅ PASS |
| Team detail | Employment status | status | `mapEmploymentStatusVi` | VI | ✅ PASS (known) |
| Dynamic form | Field labels | catalog `label` | Catalog VI + gender map | Label nghiệp vụ | ✅ PASS |
| Dynamic form | `job_title_key` display | key | Via form display path | Role VI (not raw key as title) | ⚠️ UNKNOWN |

### 2.4 Attendance / Leave

| Module | Field | Source value | UI today | Required VI label | Verdict |
|--------|-------|--------------|----------|-------------------|---------|
| Leave list | `leave_type` | `annual` / `LVT_01` | `resolveLeaveTypeLabel` | Nghỉ phép năm / … | ✅ PASS (known) |
| Leave list | `leave_type` unknown | custom code | **raw code** (`?? key`) | Catalog label or «—» | ❌ FAIL |
| Leave list | `status` | pending/approved/rejected | StatusBadge → `statusLabel` (mapped) | Chờ duyệt / … | ✅ PASS |
| Leave list | `status` other | e.g. `cancelled` | Raw via `statusLabel` | Đã hủy | ❌ FAIL |
| Leave detail | Hero `status` | same | `LeaveHeroCard` → `<StatusBadge status={status} />` no label | Same VI map; no raw | ❌ FAIL (unmapped) |
| Leave detail | `leave_type` chip | code | `DetailMetricGrid` + `resolveLeaveTypeLabel` | VI | ✅ PASS (known) / ❌ if unknown |
| Create leave | Type picker | codes | `resolveLeaveTypeLabel(code)` | VI | ✅ PASS (known) |
| Manager approvals | Leave type | code | `resolveLeaveTypeLabel` | VI | ✅ PASS (known) |
| Manager approvals | Update type | `check_in_out` / … | `resolveUpdateTypeLabel` | Giờ vào và ra / … | ✅ PASS (known) |
| Update type unknown | wire token | `snake_case` → spaces English | Dictionary; unknown→«—» | ❌ FAIL |
| Update list | `status` | pending/… | StatusBadge via ListRow no label | VI for mapped | ✅ PASS / ❌ unmapped |
| Update detail | `status` | same | `<StatusBadge status={row.status} />` | VI full; unknown→«—» | ❌ FAIL (unmapped) |
| Attendance history | Timeline badge | present/late/absent/leave | `resolveAttendanceTimelineBadge` VI labels | Đúng giờ / Đi muộn / … | ✅ PASS (known) |
| Attendance history | Unknown status | odd enum | `label: raw` | «—» or mapped | ❌ FAIL |

### 2.5 Contracts / Insurance

| Module | Field | Source value | UI today | Required VI label | Verdict |
|--------|-------|--------------|----------|-------------------|---------|
| Contracts | `contract_type` | `fixed_term` / `indefinite` / … | `resolveContractTypeLabel` | Có thời hạn / Không thời hạn / … | ✅ PASS (known) |
| Contracts | `contract_type` variant | `full-time`, `HDLD_*` | Fallback spaces/raw | Full dictionary; unknown→«—» | ❌ FAIL |
| Contracts | `status` | `active` / `expired` / `terminated` | EssRichListRow **no** statusLabel → raw | Đang hiệu lực / Hết hạn / Chấm dứt | ❌ FAIL |
| Insurance | `provider` | free text | Text as-is | Text OK | ✅ PASS |
| Insurance | `policy_number` | business code | Shown in subtitle | Acceptable business code | ✅ PASS |
| Insurance | `status` | `active` / `expired` / … | Same StatusBadge raw path | Đang hiệu lực / Hết hạn / … | ❌ FAIL |
| Insurance | Type (if API has type) | type code | Not clearly bound on mobile list | VI type if shown | 🔵 N/A / ⚠️ UNKNOWN |

### 2.6 Payroll

| Module | Field | Source value | UI today | Required VI label | Verdict |
|--------|-------|--------------|----------|-------------------|---------|
| Payroll summary | `period_label` | may include slug | `resolvePayslipPeriodLabelVi` | Kỳ VI + tên CT | ✅ PASS |
| Payroll summary | Period `status` | `draft` / `processed` / `paid` / `closed` | ListRow status → `statusLabel` | Nháp / Đã xử lý / Đã trả / Đã đóng | ❌ FAIL (`processed`/`paid`/`closed` unmapped; `draft` OK) |
| Payslip list | Row `status` | same | ListRow no statusLabel | Same VI set | ❌ FAIL |
| Payslip hero | `status` | same | **Raw** `status` text + capitalize | VI label | ❌ FAIL |
| Payslip detail | `status` | same | `statusLabel(row.status)` | VI full set | ❌ FAIL (paid/processed) |
| Payslip | Amounts / dates | number / ISO | `formatHrmCurrency` / `formatHrmDate` | vi-VN | ✅ PASS |

### 2.7 Operations

| Module | Field | Source value | UI today | Required VI label | Verdict |
|--------|-------|--------------|----------|-------------------|---------|
| Ops tasks | `status` | open/in_progress/done/… | `resolveTaskStatusLabel` | Đang mở / Đang làm / … | ✅ PASS (known) |
| Ops tasks | `status` unknown | other | Falls to `statusLabel` → may raw | «—» | ❌ FAIL |
| Ops tasks | `priority` | high/low/… | `resolveOpsPriorityLabel` | Ưu tiên cao / … | ✅ PASS |
| Ops services | `service_type` | parking/locker/… | `resolveServiceTypeLabel` | Bãi đỗ xe / … | ✅ PASS (known) |
| Ops services | `service_type` unknown | new code | `key.replace(/_/g,' ')` English | Dictionary; unknown→«—» | ❌ FAIL |
| Ops services | `status` | pending/approved/rejected | EssRichListRow **no** statusLabel | Chờ duyệt / Đã duyệt / Từ chối | ✅ PASS (core) / ❌ other |

### 2.8 Out of mobile app (web-only modules)

| Module | Field | Source value | UI today | Required VI label | Verdict |
|--------|-------|--------------|----------|-------------------|---------|
| Recruitment / Performance / Settings catalogs admin | — | — | Not in `hrm-mobile` feature set | Covered by web `BA-DISPLAY-HRM-01` | 🔵 N/A |

---

## 3. Prioritized FAIL list (Dev-Mobile)

| ID | Priority | Module / surface | Field | Raw example | Fix hint |
|----|----------|------------------|-------|-------------|----------|
| **M-F-01** | **P0** | Contracts + Insurance list | `status` via EssRichListRow/StatusBadge | `active`, `expired`, `terminated` | Expand `statusLabel` **or** pass `statusLabel={resolveContractStatusVi(...)}`; unknown→«—» |
| **M-F-02** | **P0** | Payroll summary / Payslip list / hero / detail | period & payslip `status` | `processed`, `paid`, `closed` | Shared payslip status VI map; hero must not render raw `status` |
| **M-F-03** | **P0** | LeaveHeroCard + UpdateRequestDetail + any StatusBadge without label | lifecycle `status` | `cancelled`, unmapped enums | Always pass VI label; harden `statusLabel` (no raw fallback) |
| **M-F-04** | **P0** | `resolveLeaveTypeLabel` | unknown `leave_type` | `CUSTOM_X`, new catalog code | Prefer catalog label from settings; else «—» (**cấm** `?? key`) |
| **M-F-05** | **P1** | `resolveContractTypeLabel` | incomplete dictionary | `full-time`, `HDLD_*`, `permanent` | Align web contract-type dictionary; unknown→«—» (not spaces) |
| **M-F-06** | **P1** | `resolveServiceTypeLabel` / `resolveTaskStatusLabel` | unknown ops enums | `new_service` → `new service` | Unknown→«—»; keep known maps |
| **M-F-07** | **P1** | `resolveAttendanceChangeTypeVi` | unknown update_type | `foo_bar` → `foo bar` | Unknown→«Chỉnh sửa chấm công» or «—» |
| **M-F-08** | **P1** | `resolveAttendanceTimelineBadge` | unknown attendance status | `label: raw` | Unknown→«—» + neutral tone |
| **M-F-09** | **P1** | Profile gender / employment status resolvers | unknown codes | exotic gender / `probation` | Unknown→«—»; add `probation`→«Thử việc» if in API |

**Shared hardening (recommended first):**

1. Change `statusLabel()` in `mapApiError.ts` to full HRM status dictionary + **`?? '—'`** (never return raw).
2. Audit every `StatusBadge` / `ListRow` / `EssRichListRow` call site — either rely on hardened helper or pass explicit VI label.
3. Change all `?? key` / `replace(/_/g,' ')` display fallbacks to «—» (U72 AC-U72-GLOBAL).

---

## 4. Acceptance criteria (remediation) — U72

> **AC-U72-MOB-GLOBAL:** Mọi enum/code/slug trên UI mobile **phải** qua dictionary VI. Không snake_case, UUID, hoặc English key. Thiếu mapping → «—».

| FAIL ID | AC (measurable) |
|---------|-----------------|
| **M-F-01** | Contracts/Insurance badges show `{Đang hiệu lực\|Hết hạn\|Chấm dứt\|…}` not `{active\|expired\|terminated}` |
| **M-F-02** | Payroll/Payslip surfaces show `{Nháp\|Đã xử lý\|Đã trả\|Đã đóng}` not `{draft\|processed\|paid\|closed}` (including hero) |
| **M-F-03** | Leave/Update detail badges never show English status; cancelled→«Đã hủy» |
| **M-F-04** | Unknown leave type → «—» (vitest today expecting raw `CUSTOM_X` must flip) |
| **M-F-05** | `full-time` / `HDLD_*` → VI labels; unknown→«—» |
| **M-F-06..09** | No underscore→space English fallbacks on ops/attendance/profile unknown codes |

**must_keep (regression):**

- `resolveCompanyDisplayVi` / payslip period slug rewrite
- `resolveWorkflowStatusVi` on Home
- `TEAM_CHECK_IN_BADGE` VI
- `resolveLeaveTypeLabel` for `annual` / `LVT_0x`
- Gender known map Nam/Nữ/Khác
- U65: no seed in evidence

---

## 5. Counts

| Verdict | Count (rows in §2) |
|---------|---------------------|
| ✅ PASS | **38** |
| ❌ FAIL | **22** (grouped into **9** fix IDs M-F-01..M-F-09) |
| ⚠️ UNKNOWN | **3** |
| 🔵 N/A | **5** |

FAIL > 0 → next owner **dev-mobile**.

---

## 6. Spec / rule cites

| Ref | Use |
|-----|-----|
| U72 / `TEAM_USER_REQUIREMENTS` | System-wide display label lock |
| `.cursor/rules/display-label-no-raw-key.mdc` | No raw key on UI |
| Web inventory | Pattern + AC-U72-GLOBAL |
| `docs/hrm/SRS.md` BR-CO-LABEL-01 (elevated HRM-wide) | Normative anti raw-key |

---

## 7. Handoff

### completion_report

Closed: Static U72 label-leak inventory for `apps/mobile/hrm-mobile` across Auth/Scope/Settings, Home, Profile/Team, Attendance/Leave, Contracts/Insurance, Payroll, Operations. Pattern aligned with web `BA-DISPLAY-HRM-01`. **9 prioritized FAIL IDs** (P0: status badge hardening + leave-type unknown + payroll/contracts status). No code changes; no seed; no UF PASS claim.

Residual: 3 UNKNOWN (error code prefix UX, insurance type if added, dynamic form job_title display path) — spot after Dev fix via QA device.

### next_owner

**dev-mobile**

### next_dispatch_prompt

```text
work_item_id: D-MOB-U72-LABEL-FE-01
role: dev-mobile
lane: execution
change_mode: FIX
entry_criteria:
  - Read docs/qa/evidence/d-mob-u72-label-scan-01-20260727.md §3–§4 (M-F-01..M-F-09)
  - Read .cursor/rules/display-label-no-raw-key.mdc + U72
  - U65 zero-seed; code_memory_required APPEND
allowed_paths:
  - apps/mobile/hrm-mobile/src/integrations/mapApiError.ts
  - apps/mobile/hrm-mobile/src/components/ui/StatusBadge.tsx
  - apps/mobile/hrm-mobile/src/components/ui/LeaveHeroCard.tsx
  - apps/mobile/hrm-mobile/src/components/ui/PayslipHeroCard.tsx
  - apps/mobile/hrm-mobile/src/features/contracts/ContractsScreen.tsx
  - apps/mobile/hrm-mobile/src/features/payroll/**
  - apps/mobile/hrm-mobile/src/features/attendance/**
  - apps/mobile/hrm-mobile/src/features/operations/OperationsScreen.tsx
  - apps/mobile/hrm-mobile/src/i18n/leaveTypes.ts
  - apps/mobile/hrm-mobile/src/utils/operationsLabels.ts
  - apps/mobile/hrm-mobile/src/utils/profileTabs.ts
  - apps/mobile/hrm-mobile/src/utils/profileEssFields.ts
  - apps/mobile/hrm-mobile/src/utils/attendanceUpdateTypes.ts
  - apps/mobile/hrm-mobile/src/utils/attendanceTimelineBadge.ts
  - apps/mobile/hrm-mobile/src/utils/__tests__/**
  - apps/mobile/hrm-mobile/src/i18n/__tests__/**
forbidden_paths:
  - apps/web/** (web wave separate)
  - apps/api/**
  - seed scripts
must_keep:
  - resolveCompanyDisplayVi / resolvePayslipPeriodLabelVi
  - resolveWorkflowStatusVi Home
  - TEAM_CHECK_IN_BADGE VI
  - known leaveTypeLabels annual/LVT_*
  - gender Nam/Nữ/Khác
exit_criteria:
  - M-F-01..M-F-09 closed: no raw enum/slug; unknown → «—»
  - statusLabel (or shared resolver) never returns raw English status
  - Vitest updated (leaveTypes CUSTOM_X → «—»; status/contract/payslip maps)
  - evidence docs/qa/evidence/d-mob-u72-label-fe-01-YYYYMMDD.md
ack_status target: READY_FOR_QA
```

### evidence_path

`docs/qa/evidence/d-mob-u72-label-scan-01-20260727.md`

### ack_status

**PASS_TO_PM**
