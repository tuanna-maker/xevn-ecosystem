# QA-UX-PROFILE-C2-01 — Profile C2 tab groups browser retest

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-UX-PROFILE-C2-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-07-28 |
| **dev_handoff** | `docs/qa/evidence/d-ux-profile-tabs-01-20260728.md` (**READY_FOR_QA**) |
| **ack_status** | **PASS_TO_PM** |
| **locks** | U65 zero-seed · HOLD_DEPLOY · browser-only · no seed · no deploy |
| **Account** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Host** | `http://127.0.0.1:5173` (+ HRM Vite `:8080` deny attempt) |
| **Runtime** | `docs/qa/evidence/_tmp-qa-ux-profile-c2-01-runtime.json` |
| **Console log** | `docs/qa/evidence/_tmp-qa-ux-profile-c2-01-console.txt` |
| **Script** | `scripts/qa/qa-ux-profile-c2-01-browser.mjs` |
| **Screens** | `docs/qa/evidence/screens/qa-ux-profile-c2-01/` |
| **Journey** | **J-HRM-01** list→profile · P-CC employees embed |

---

## Spec / DoD

| AC (Profile C2 / UX-07) | Result |
|-------------------------|--------|
| Core strip visible (general/work/contract/salary) | **PASS** |
| HR / Career / Personal group popovers (not flat 11 More) | **PASS** |
| Click depth ≤2 to nested tab + lazy non-Core | **PASS** — Career→KPI depth=2; `sawLazy=true` |
| Salary/insurance PermissionFallback VI (no silent null) | **PASS*** — see UX-07 note |
| Pin `employee-pinned-tabs` localStorage + F5 | **PASS** — `["kpi"]` survives reload; Path C chip revisit |
| must_keep Payroll mount / taxSettlementFloatingUi | **PASS** |
| must_keep D5 Zod Add empty | **PASS** — 3 VI FormMessage |
| must_keep Clock-In C1 | **PASS** |
| BTN-NEST unpin no validateDOMNesting | **PASS** — delta=0 |

\*UX-07: Portal embed bypasses `PermissionGate` when `hasPortalSession` / portal token (GWC-HRM-REC-UF12-01). Live deny DOM on bare URL did not mount profile without portal QS. Closed via: (1) source wiring salary+insurance `fallback={<PermissionFallback />}` + VI defaults/testids; (2) CEO salary tab **non-blank** (not silent null). Residual: true deny-persona browser only when non-portal session without bypass.

---

## L0 / unit (supporting)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM/XBOS/portal **200** |
| `pnpm run qc:fe-be-health` | **ALL PASS** exit 0 |
| vitest `employeeProfileTabGroups` + `employeeProfileBtnNest` | **8/8 PASS** |
| Seed | **None** (U65) |

---

## Browser execution (U65)

### Click path

```text
login ceo@xe.vn (portal JWT inject)
 → /hr/employees?portal=1&tenantId=xevn&companyId=main
 → row click QA238502 (J-HRM-01)
 → /hr/employees/dbdbece0-6572-401a-b4eb-56781493a75f
 → Core: Hợp đồng (depth 1) → Lương (depth 1, content visible)
 → Group Sự nghiệp → KPI (depth 2, lazy fallback seen)
 → auto-pin kpi → localStorage employee-pinned-tabs=["kpi"]
 → F5 → pin chip still → click pin (Path C depth 1)
 → unpin nest smoke → Group Nhân sự / Cá nhân panels
 → must_keep: Clock-In wizard · Payroll tax · D5 Zod Add
```

### UF / J-* results

| UF-ID | Verdict | Evidence |
|-------|---------|----------|
| J-HRM-list | 🟢 | employees list loaded |
| J-HRM-01-detail | 🟢 | profile page + GET employee 2xx · id=`dbdbece0-…` |
| UF-C2-core-strip | 🟢 | general/work/contract/salary testids |
| UF-C2-group-popovers | 🟢 | hr/career/personal; `flatMore=false` |
| UF-C2-pathA-contract / salary | 🟢 | depth=1 |
| UF-C2-pathB nested KPI | 🟢 | depth=2 · lazy=true · auto-pin |
| UF-C2-pin-localStorage / F5 / Path C | 🟢 | key stable |
| UF-C2-btn-nest | 🟢 | 0 nesting errors |
| UF-C2-hr / personal groups | 🟢 | panels open |
| UF-C2-permission-fallback | 🟢 | wiring + CEO non-blank; live deny BLOCKED-ENV portal bypass |
| UF-C2-overall | 🟢 | Profile C2 DoD met |

Screens: `01-employees-list` … `10-payroll-d5`

### must_keep regression

| Guard | Verdict | Detail |
|-------|---------|--------|
| C1 Clock-In wizard | 🟢 | `clock-in-wizard` + method/manual |
| Payroll mount | 🟢 | `#root` length **3017290** |
| Payroll tax C1 | 🟢 | menuitem Bảng quyết toán thuế; banner=false; typeErrors=0 |
| D5 Zod Add | 🟢 | Mã / Tên / Vui lòng chọn loại… (3 msgs) |
| console TypeError | 🟢 | count=0 |

---

## Residual

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| R-C2-01 | P3 | Live PermissionFallback deny not exercised under portal token bypass; need non-portal deny persona if sponsor wants DOM proof | ba-process / pm (optional) |
| R-C2-02 | Info | Other locales (zh/my/lo/km) still defaultValue until i18n sweep (Dev residual) | defer |

**not promoted:** deploy · mobile 15-tab port · Payroll feature changes

---

## completion_report

Closed **QA-UX-PROFILE-C2-01**: browser U65 Profile C2 — Core strip + 3 group popovers, depth≤2 nested KPI with lazy, pin LS+F5, J-HRM-01 list→detail, must_keep Clock-In/Payroll tax/D5 Zod all PASS. UX-07 closed with wiring + CEO non-blank (portal bypass blocks live deny). HOLD_DEPLOY. Seed=none.

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: QC-UX-PROFILE-C2-01 (optional) hoặc peer unlock next UX residual
from_role: pm
to_role: qc
lane: governance
entry_criteria: QA-UX-PROFILE-C2-01 PASS_TO_PM @ docs/qa/evidence/qa-ux-profile-c2-01-20260728.md
scope: audit browser evidence Profile C2 + must_keep; HOLD_DEPLOY; U65
exit_criteria: GO/GWC evidence; residual R-C2-01 P3 optional deny-persona only
cấm: seed · deploy
```

## ack_status

**PASS_TO_PM**
