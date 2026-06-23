# Phase 1 — Product Completion PMP Plan (post-SRS baseline)

| Field | Value |
|-------|--------|
| **program_id** | `P1-PRODUCT-COMPLETE` |
| **owner** | PM (Composer) → COO orchestration model |
| **baseline** | SRS + TechSpec **ACCEPTED by sponsor** (2026-06-07) |
| **execution** | PM bổ sung delta thực tế (mock, scope, journey, seed) — **không** viết lại SRS |
| **success** | `pnpm run verify:product:completion` exit 0 · QC GO · sponsor UAT không thấy mock/500/409 giả |
| **todo SoT** | [`PHASE1_PRODUCT_COMPLETION_TODO.md`](./PHASE1_PRODUCT_COMPLETION_TODO.md) |
| **team org** | [`TEAM_ORG_AND_KNOWLEDGE_LOOP.md`](./TEAM_ORG_AND_KNOWLEDGE_LOOP.md) |

---

## 1. Executive summary (tầm nhìn PM)

**Đã có:** Multi-company scope (rollup + member isolation), HRM fidelity seeds, integrity script, operating-units API, recruitment/leave/contracts incident fixes.

**Chưa xong sản phẩm:** ~**15%** màn HRM embed + CC legacy panel vẫn hiển thị **mock/chart cứng** khi API fail hoặc tab chưa wire; journey **J-HRM-INT-03..05** chưa full browser; một số GET scope P0 XBOS (SA audit); mobile light theme residual.

**Quyết định PM:** Không dừng sau từng incident — chạy **6 wave** đến gate `verify:product:completion` với **10 role** + sub-agent song song (tối đa 4 Task/lượt).

---

## 2. WBS (PMP)

```text
2.0 PRODUCT_COMPLETION
├── 2.1 PMO & governance (PM)
│   ├── 2.1.1 PMP plan + TODO matrix (this doc)
│   ├── 2.1.2 Mock inventory SoT (FE_MOCK + grep gate)
│   ├── 2.1.3 Bus + TEAM_WORKING_NOW pulse
│   └── 2.1.4 Knowledge loop per wave (ROLE_SPRINT_IMPROVEMENT_LOG)
├── 2.2 W0 — Full source audit [IN PROGRESS]
│   ├── 2.2.1 QA grep mock matrix apps/web (PCOMP-W0-QA-01)
│   ├── 2.2.2 BA-D BR delta execution-only (PCOMP-W0-BA-D-01)
│   └── 2.2.3 SA scope/P0 closure list (PCOMP-W0-SA-01)
├── 2.3 W1 — HRM embed zero-mock P0 [QUEUED]
│   ├── 2.3.1 Attendance charts → API aggregate (dev-fe)
│   ├── 2.3.2 Payroll feedback mock → API/empty (dev-fe)
│   ├── 2.3.3 Report tabs static charts → useReportsData (dev-fe)
│   ├── 2.3.4 Employee performance charts → API (dev-fe)
│   └── 2.3.5 QA grep gate + L2 matrix (qa)
├── 2.4 W2 — Portal legacy HRM panel [QUEUED]
│   ├── 2.4.1 HrmWorkspacePanel HRM_MOCK_* → API or deprecate route (dev-fe)
│   ├── 2.4.2 CC dept templates API or empty (dev-be + dev-fe)
│   ├── 2.4.3 CC infrastructure seed → API-only (dev-fe)
│   └── 2.4.4 KPI rail strict mode default (dev-fe)
├── 2.5 W3 — BE integrity & journeys [PARTIAL]
│   ├── 2.5.1 operating-units ✅ · scope P0 XBOS (dev-be)
│   ├── 2.5.2 J-HRM-INT-03..05 recruitment→payroll FK browser (dev-be + qa)
│   ├── 2.5.3 company_slug_map bridge G-INT-03 (dev-be + ba-data)
│   └── 2.5.4 verify:hrm:xbos-integrity in CI gate (devops)
├── 2.6 W4 — Mobile + cross-surface [QUEUED]
│   ├── 2.6.1 Mobile scope screen parity (dev-mobile)
│   └── 2.6.2 QA device smoke J-MOB-* (qa-device)
├── 2.7 W5 — Verification pack [QUEUED]
│   ├── 2.7.1 Script verify:product:completion (devops)
│   ├── 2.7.2 Persona matrix full RBAC (qa)
│   └── 2.7.3 QC product completion GO (qc)
└── 2.8 W6 — Sponsor UAT sign-off [BLOCKED on W5]
```

---

## 3. Mock inventory (grep 2026-06-07 — cập nhật mỗi wave)

### 3.1 HRM embed `apps/web/hrm` — **P0 user-facing**

| ID | File / area | Issue | Wave | Owner |
|----|-------------|-------|------|-------|
| M-HRM-01 | `Attendance.tsx` | `attendanceSheetsData`, `weeklyAttendanceData`, `monthlyLeaveData`, … chart mock | W1 | dev-fe |
| M-HRM-02 | `Payroll.tsx` | `payrollFeedbackData` mock | W1 | dev-fe |
| M-HRM-03 | `ToolsReportTab`, `ServiceReportTab` | Static `statusData` / `condData` | W1 | dev-fe |
| M-HRM-04 | `EmployeeWorkHistory`, `EmployeeJobProgressChart` | Performance chart mock | W1 | dev-fe |
| M-HRM-05 | `CandidateDetailView` | `radarChartData` hardcoded | W1 | dev-fe |
| M-HRM-06 | `HeadcountProposalTab` | Summary chart mock | W1 | dev-fe |
| M-HRM-07 | Import dialog `templateData` | OK — Excel template only | — | — |
| M-HRM-08 | `RecruitmentPieChart`, `CampaignFunnelChart` | Derived from props/API | ✅ | — |

### 3.2 Portal `apps/web/web-portal` — **P1 legacy**

| ID | File | Issue | Wave | Owner |
|----|------|-------|------|-------|
| M-CC-01 | `HrmWorkspacePanel.tsx` | `HRM_MOCK_*` fallback on API error | W2 | dev-fe |
| M-CC-02 | `modules/hrm/mock-data.ts` | Full mock catalog | W2 | dev-fe |
| M-CC-03 | `useDeptSystemTemplates` | `MOCK_SEED` fallback | W2 | dev-be |
| M-CC-04 | `infrastructureApi` | `INFRASTRUCTURE_MOCK_SEED` | W2 | dev-fe |
| M-CC-05 | `mockData.ts` / `mock-data.ts` | Legacy companies | W2 | dev-fe |
| M-CC-06 | `useCommandCenterKpiRail` | Mock when flag on | W2 | dev-fe |

### 3.3 Closed (reference)

| ID | Fix |
|----|-----|
| M-HRM-R01 | Recruitment 1OFFICE bar/line → API ✅ |
| M-HRM-R02 | Leave `query is not defined` → API ✅ |
| M-HRM-R03 | Contracts 500 ec.ec.employee_id ✅ |
| M-HRM-R04 | GPS HCM / skills radar fallback ✅ |

---

## 4. Resource plan (10 role + sub-agent)

| Role | Sub-agent | Capacity | Waves |
|------|-----------|----------|-------|
| PM | Composer | 100% orchestration | All |
| Dev-BE | `dev-be` | 2 parallel max | W3, W2-BE |
| Dev-FE | `dev-fe` | 2 parallel max | W1, W2 |
| Dev-Mobile | `dev-mobile` | 1 | W4 |
| DevOps | `devops` | 1 | W5 scripts |
| QA | `qa` | 2 (browser + API) | W0, W1–W5 |
| QC | `qc` | 1 per gate | W5, W6 |
| BA-Process | `ba-process` | 0.5d/wave | W0 delta |
| BA-Data | `ba-data` | 0.5d/wave | W3 G-INT-03 |
| SA | `sa` | 0.5d/wave | W0 P0 list |
| TA | `technical-manager` | After W3 | Architecture sign-off |

**Không cần thêm nhân sự** — cần **dùng hết lane** song song (U40/U41).

---

## 5. Schedule (relative — PM không hứa ngày cố định)

| Wave | Duration est. | Gate |
|------|---------------|------|
| W0 Audit | 1 PM session | Mock matrix signed BA+QA |
| W1 HRM embed | 2–3 sessions | `verify:hrm:no-mock-ui` P0 PASS |
| W2 Portal legacy | 2 sessions | CC strict no mock banner |
| W3 BE/journey | 2 sessions (partial done) | J-HRM-INT 5/5 PASS |
| W4 Mobile | 1 session | J-MOB smoke |
| W5 QC pack | 1 session | QC GO GWC |
| W6 UAT | Sponsor | UAT-PASS |

---

## 6. Knowledge loop (mỗi wave)

1. Execution completes → evidence path
2. QA PASS → BA delta 1 trang nếu spec_gap
3. Governance 30m → `ROLE_SPRINT_IMPROVEMENT_LOG.md` + rule/KB nếu lesson lặp
4. PM cập nhật TODO matrix `% complete`

---

## 7. Exit criteria (program DONE)

- [ ] Mock inventory M-HRM-01..06 **CLOSED**
- [ ] M-CC-01..06 **CLOSED** or deprecated with ADR
- [ ] `verify:product:completion` exit 0
- [ ] J-HRM-INT-01..05 + persona matrix PASS
- [ ] QC **GO** or **GO WITH CONDITIONS** (PROD separate per U32)
- [ ] Sponsor sign-off UAT (no console P0)
