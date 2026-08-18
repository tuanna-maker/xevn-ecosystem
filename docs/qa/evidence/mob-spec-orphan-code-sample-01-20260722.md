# MOB-SPEC-ORPHAN-CODE-SAMPLE-01 — Mobile company_display / Khối / scope labels vs SRS

| Field | Value |
|-------|--------|
| **work_item_id** | `MOB-SPEC-ORPHAN-CODE-SAMPLE-01` |
| **Date** | 2026-07-22 |
| **Role** | Dev-Mobile (research only) |
| **Deploy** | **CẤM** — no APK build/deploy |
| **Register** | `docs/program/SPEC_CODE_TRACEABILITY_GAP_REGISTER.md` §4 |
| **ack_status** | **PASS_TO_PM** |

---

## 1. spec_read_ack

| Artifact | § / UC | Note |
|----------|--------|------|
| `docs/hrm/SRS_MOBILE.md` | UC-HRM-MOB-01 / **02** / 03 / 09 | Scope = chọn `tenantId`/`companyId`; **không** khóa nhãn UI «Khối * X.E» vs tên ĐVTV/legal DB |
| `docs/hrm/TECHSPEC_MOBILE.md` | auth / membership | `memberships[]`, select-membership — **không** map `display_name_vi` «Khối» |
| `docs/hrm/HRM_MOBILE_ACCOUNT.md` | Cài đặt → Phạm vi | Flow chọn card membership |
| `docs/hrm/SRS.md` | FR-HRM-SCOPE-01/02 (via TechSpec) | Scope resolver — không FR cột nhãn «Khối» |
| Register G-ORPH-01 / G-SPEC-01 | §4–§5 | Web employees «Khối» — mobile **cùng họ registry** |

**spec says:** UC-HRM-MOB-02 — chọn/xác nhận phạm vi công ty; JWT headers khớp scope.  
**code does:** Pilot registry + `resolveCompanyDisplayVi` map slug → **«Khối Vận tải/Logistics/Tài chính/Dịch vụ X.E»** (fallback cứng khi API trống).

---

## 2. Inventory — screens / helpers dùng company_display · Khối · scope labels

### 2.1 Surfaces (user-visible)

| # | Screen / surface | Path | Label source | Observed copy pattern |
|---|------------------|------|--------------|------------------------|
| 1 | **ScopeScreen** | `features/auth/ScopeScreen.tsx` | `resolveCompanyDisplayVi` + `unit.display_name_vi` from `fetchHrmOperatingUnits` / `PILOT_HRM_OPERATING_UNITS` | Title «Phạm vi công ty»; OU rows = **Khối * X.E**; Alert sau chọn membership dùng **raw** `m.company_display` |
| 2 | **SettingsScreen** | `features/settings/SettingsScreen.tsx` | `resolveCompanyDisplayVi(companyId, { membershipCompanyDisplay, operatingUnits })` | Card «Phạm vi đang dùng» → nhãn registry/API |
| 3 | **LoginScreen** | `features/auth/LoginScreen.tsx` | **Raw** `active?.company_display` (không qua `resolveCompanyDisplayVi`) | Toast: «Đang dùng: {company_display}» — có thể slug/EN seed |
| 4 | **Dashboard (Home)** | `features/dashboard/DashboardScreen.tsx` + `utils/dashboardHome.ts` | `resolveCompanyDisplayVi` + OU fetch | Greeting `companyLabel` = Khối / Tập đoàn |
| 5 | **PayslipList** | `features/payroll/PayslipListScreen.tsx` + `payslipDisplayVi.ts` | `membershipCompanyDisplay` + slug resolve | Subtitle kỳ lương «Tháng … — Khối …» |
| 6 | **PayslipDetail** | `features/payroll/PayslipDetailScreen.tsx` | same | Company segment in header/subtitle |
| 7 | **PayrollSummary** | `features/payroll/PayrollSummaryScreen.tsx` | same | Summary company label |

### 2.2 Shared helpers (orphan-risk core)

| Path | Symbol | Behavior | `@CODE-MEMORY`? |
|------|--------|----------|-----------------|
| `integrations/hrmOperatingUnits.ts` | `PILOT_HRM_OPERATING_UNITS` | Hardcode `trsport`→«Khối Vận tải X.E» … (5 rows) — comment «aligned with BE hrm-operating-unit-registry» | **NO** |
| `utils/companyDisplayVi.ts` | `resolveCompanyDisplayVi` | Known OU slugs **always** registry label — never raw slug | **NO** |
| `utils/scopeScreenCopy.ts` | `resolveMembershipRowTitle`, OU copy | «Lọc danh sách theo {display_name_vi}» | **NO** |
| `utils/dashboardHome.ts` | `resolveHomeGreeting` / companyLabel | Uses `resolveCompanyDisplayVi` | **NO** |
| `utils/payslipDisplayVi.ts` | payslip company segment | Uses `resolveCompanyDisplayVi` | **NO** |
| `context/AuthContext.tsx` | `MobileMembership.company_display` | JWT/login field — display string as returned | N/A (type) |

### 2.3 Registry labels (pilot fallback — identical class to G-ORPH-01)

| `operating_slug` | `display_name_vi` (mobile hardcode) |
|------------------|-------------------------------------|
| `holding` | Tập đoàn XeVN |
| `trsport` | Khối Vận tải X.E |
| `logistics` | Khối Logistics X.E |
| `finance` | Khối Tài chính X.E |
| `services` | Khối Dịch vụ X.E |

---

## 3. vs SRS — orphan / gap verdict

| ID | Finding | SRS/FR? | Verdict |
|----|---------|---------|---------|
| **G-ORPH-MOB-01** | Pilot + `resolveCompanyDisplayVi` force «Khối * X.E» on Scope / Settings / Home / Payslip | UC-HRM-MOB-02 chỉ yêu cầu chọn `companyId` — **không** FR bắt buộc nhãn «Khối» thay tên ĐVTV/legal | **ORPHAN display convention** (cùng class G-ORPH-01 web) |
| **G-ORPH-MOB-02** | `GET /operating-units` + OU picker UI («Đơn vị vận hành», rollup «toàn tập đoàn») | SRS_MOBILE không mô tả OU filter / group CEO rollup UI | **ORPHAN UX surface** (ADR scope ladder exists; SRS Mobile shallow) |
| **G-ORPH-MOB-03** | Login toast dùng raw `company_display` (lệch path Settings/Home đã resolve VI) | UC-HRM-MOB-01 không khóa format nhãn | **Inconsistent + under-spec** |
| **G-SPEC-MOB-01** | UC-HRM-MOB-02 không có bảng Diễn biến 4 cột / AC nhãn công ty | Shallow vs OS §3.4 | Aligns register **G-SPEC-01** |

**Đề xuất (research — không code wave này):** Spec delta (BA) khóa: nhãn = legal/company DB **hoặc** operating-unit catalog SoT; **hoặc** Dev sửa registry/resolver về tên ĐVTV — không hardcode «Khối» không có FR.

---

## 4. CODE-MEMORY coverage sample (hrm-mobile)

### 4.1 Counts (2026-07-22 ripgrep / filesystem)

| Metric | Value |
|--------|-------|
| Files under `src/` with `@CODE-MEMORY` | **35** |
| `*Screen.tsx` total | **23** |
| `*Screen.tsx` with `@CODE-MEMORY` | **7 / 23 (~30%)** |
| Scope-label helpers (`companyDisplayVi`, `hrmOperatingUnits`, `scopeScreenCopy`, `dashboardHome`, `payslipDisplayVi`) | **0 / 5** |

### 4.2 Screen matrix (sample)

| Screen | CM? | Notes |
|--------|-----|-------|
| ScopeScreen | YES | UC-HRM-MOB-02 cited — nhưng SRS path = **brand remaster** program, **không** Diễn biến # SRS_MOBILE; WorkItem L3 shell |
| LoginScreen | YES | Brand L3m — không map bước login Diễn biến |
| SettingsScreen | **NO** | Hiển thị phạm vi + OU — orphan CM |
| DashboardScreen | **NO** | companyLabel via helper |
| PayslipList / Detail / PayrollSummary | **NO** | Khối in subtitle |
| CreateLeaveRequest / Profile / Team* / LeaveDetail | YES | W7 / brand — unrelated to Khối orphan |
| Attendance* / Contracts / Ops / Journey / Notif / Approvals | **NO** | Outside this sample focus |

### 4.3 Quality note (G-CM class)

- **Có block ≠ trỏ bước nghiệp vụ:** ScopeScreen CM phục vụ theme DNA, thiếu `Diễn biến #N` cho chọn membership / OU.
- **Core orphan logic không có CM:** đúng gap register **G-CM-01** (operating-unit registry) trên lane mobile.

---

## 5. J-MOB / deploy

- Journey smoke: **N/A** research — không đổi runtime.
- APK / qa-device: **không** build, **không** deploy (sponsor lock).

---

## 6. Handoff

**completion_report:** Closed MOB-SPEC-ORPHAN-CODE-SAMPLE-01 — inventory 7 surfaces + 5 helpers; 3 orphan IDs (G-ORPH-MOB-01..03) + G-SPEC-MOB-01; CODE-MEMORY sample 7/23 screens, 0/5 label helpers; register §4 appended. Residual: BA/SA lock nhãn Khối vs ĐVTV; optional Dev-Mobile follow-up only after spec delta (no deploy).

**next_owner:** `pm`

**ack_status:** `PASS_TO_PM`

**evidence_path:** `docs/qa/evidence/mob-spec-orphan-code-sample-01-20260722.md`

**next_dispatch_prompt:**
```text
work_item_id: PM-SPEC-ORPHAN-MOB-MERGE-01
role: pm
entry: MOB-SPEC-ORPHAN-CODE-SAMPLE-01 PASS_TO_PM; evidence docs/qa/evidence/mob-spec-orphan-code-sample-01-20260722.md; register §4 G-ORPH-MOB-01..03
exit: Merge mobile rows into SPEC_CODE_TRACEABILITY_GAP_REGISTER.md §6 Merged=yes; nếu BA-SPEC-CODE-GAP-HRM-01 chưa khóa nhãn Khối vs legal DB → keep G-SPEC-01 P0; không dispatch APK; không deploy
cấm: deploy · seed · mobile code change without BA delta
```

**pm_dispatch_hint:** After BA/SA lock on company label SoT — optional `MOB-FIX-COMPANY-LABEL-01` (dev-mobile) to drop hardcode Khối or bind legal name; until then **no** mobile remaster of registry.
)
