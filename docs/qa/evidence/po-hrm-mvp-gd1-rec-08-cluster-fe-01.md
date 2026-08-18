# Evidence — PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | execution · **dev-fe** |
| **Date** | 2026-08-09 |
| **ack_status** | **READY_FOR_QA** |
| **uc_ids** | `UC-BP-REC-08` |
| **change_mode** | UPGRADE · preserve_default · code_memory APPEND |
| **Honesty** | `recruitment_uat_ready=false` · C-SLICE · U65 zero-seed |
| **depends_on** | API-01 CONFIRMED · BE-01 READY_FOR_QA (routes LIVE · jest 58) |
| **solid_convention_ack** | FE display-only bind — **DENY** FE domain aggregation |

---

## spec_read_ack

| Artifact | Path · sections |
|----------|-----------------|
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-08** Diễn biến #1–#3 |
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01.md` §2.1 · O1–O10 · AC-REC-08-01..10 · Diễn biến §3.4 |
| **api** | `docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md` F-REC-DASH-01/02 · §7 DTO · §8 tokens · §11 Reports |
| **be evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-be-01.md` — GET dashboard* LIVE |
| **code AS-IS** | `useRecruitmentDashboard` + `recruitmentDashboardAggregator` + `buildRecruitmentReportFromApi` |
| **sponsor_confirm** | API-01 CONFIRMED · BA-01 O1–O10 · BE-01 READY |
| **uc_ids** | UC-BP-REC-08 |
| **change_mode** | UPGRADE |

**spec says / code does (delta closed this seat):**

| Spec | Before | After |
|------|--------|-------|
| KH / % / gap / ETA | FE `listJobPostings` + aggregator | Nest GET `/api/hrm/recruitment/dashboard*` bind only |
| Funnel | FE 6-stage candidates count | Nest 5 keys `cv..onboard` + labels |
| Drill | Campaign / posting risk | `by_yctd` table → YCTD detail (J-HRM-05) |
| Reports | `buildRecruitmentReportFromApi(candidates)` | Same Nest DTO subset (`mapRecruitmentReportFromNestDashboard`) |
| Cost / C&B | Cost strip / invent risk | **O10 hide** — no cost UI on dashboard |
| Errors | Generic | VI toast `HRM-REC-DASH-PERIOD-400` · `HRM-SCOPE-409`; clear data on error |
| F5 filter | Absent | URL `dash_year` / `dash_from`+`dash_to` + mode |

---

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/integrations/hrmApi.ts` | **ADD** DTO types + `getRecruitmentDashboard` / `getRecruitmentDashboardYctd` |
| `apps/web/hrm/src/lib/recruitmentDashboardNestBind.ts` | **ADD** display-only bind helpers |
| `apps/web/hrm/src/lib/recruitmentDashboardNestBind.test.ts` | **ADD** vitest + source audit |
| `apps/web/hrm/src/hooks/useRecruitmentNestDashboard.ts` | **ADD** React Query Nest GET |
| `apps/web/hrm/src/components/recruitment/RecruitmentNestDashboardPanel.tsx` | **ADD** filter + KPI + funnel + YCTD drill |
| `apps/web/hrm/src/hooks/useRecruitmentDashboard.ts` | UPGRADE — board/kanban only (no aggregator) |
| `apps/web/hrm/src/lib/recruitmentDashboardAggregator.ts` | DISABLE SoT — types + cost empty stub |
| `apps/web/hrm/src/pages/Recruitment.tsx` | Wire Nest panel; focus YCTD → requisitions |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | `focusRequisitionId` → openDetail |
| `apps/web/hrm/src/hooks/reportsApiAggregator.ts` | O8 Nest map; DENY `buildRecruitmentReportFromApi` |
| `apps/web/hrm/src/hooks/useReportsData.ts` | Recruitment → `getRecruitmentDashboard` |
| `apps/web/hrm/src/components/reports/RecruitmentReportTab.tsx` | Nest subset UI |
| `apps/web/hrm/src/components/recruitment/RecruitmentReportsTab.tsx` | Nest bind (module reports tab) |
| `apps/web/hrm/src/lib/apiError.ts` | HRM-REC-DASH-* + HRM-SCOPE-409 VI |
| `*.test.ts` | Updated / added |

**Removed aggregator SoT list:**

- `sumActiveJobPostingHeadcount` as KH (stub 0)
- `aggregateCandidatesByDepartment` / `aggregateCandidatesByAppliedMonth` (removed from SoT file)
- `buildRecruitmentReportFromApi` candidates formula (throws if called)
- Dashboard cost strip + pie/line FE invent charts
- Multi-list join enrichment via `listJobPostings` + `listCandidateApplications` in dashboard hook

**must_keep RETAIN:** chrome tabs · Board kanban · J-HRM-05 detail · sealed REC-01/02 UF · honesty false · C-SLICE

**DENY:** Nest `/rec` dual · seed · honesty flip · invent VND · FE compute completion_pct/gap/ETA · Campaign drill

---

## Vitest evidence

```text
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/recruitmentDashboardNestBind.test.ts \
  src/lib/recruitmentDashboardAggregator.test.ts \
  src/hooks/reportsApiAggregator.test.ts

Test Files  3 passed (3)
Tests:      17 passed (17)
```

Coverage: funnel 5 keys · null % · enough_people labels · Nest chart bind · O8 map · PERIOD-400/SCOPE-409 VI · source audit Nest-only · DENY legacy report builder · disabled aggregator stubs.

---

## U65 browser plan (QA)

| # | Step | Expect |
|---|------|--------|
| 1 | Login `ceo@xe.vn` → Tuyển dụng → Dashboard | Shell filter kỳ + đơn vị; **no seed** |
| 2 | Chọn năm / from–to → Network **GET** `/api/hrm/recruitment/dashboard?…&include=yctd` **2xx** `HRM-REC-DASH-200` | Bind planned_need / filled / pipeline / gap / completion_pct / funnel 5 / enough_people_* / empty_guide |
| 3 | **F5** | Filter retained (`dash_*` query); same numbers |
| 4 | Khoan bảng YCTD → click row | Opens YCTD detail (J-HRM-05) — **DENY** Campaign |
| 5 | Reports (module + `/reports` recruitment) | Same Nest semantics; no second formula |
| 6 | Invalid period / scope mismatch | Toast VI PERIOD-400 / SCOPE-409; **no** stale numbers |
| 7 | Inspect UI | **No** cost/C&B/salary |

`hdsd_align: true` · UF matrix REC dashboard rows · J-HRM-REC-DASH-01

---

## Honesty

```text
recruitment_uat_ready=false
program honesty flags=false
C-SLICE ≠ module REC UAT
U65 zero-seed
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-fe-01.md` |
| **completion_report** | Closed FE Nest DTO bind for UC-BP-REC-08: Dashboard filter→GET dashboard* · KPI/funnel/enough_people/empty_guide/YCTD drill→J-HRM-05 · Reports O8 same contract · aggregator/report FE formulas disabled · cost O10 omitted · PERIOD-400/SCOPE-409 VI · F5 filter URL · vitest 17 PASS. Residual: QA browser U65. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-08-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-08
depends_on: FE-01 READY_FOR_QA · BE-01 READY · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-fe-01.md
entry_criteria: L0 stack; U65 zero-seed browser-only; persona ceo@xe.vn
MISSION: Browser AC-REC-08-01..10 + ALT/EX —
1) Login → Tuyển dụng → Dashboard; filter year/from-to → GET /api/hrm/recruitment/dashboard* 2xx HRM-REC-DASH-200
2) Assert planned_need/filled/gap/completion_pct/funnel 5 keys/enough_people_*/empty_guide bind; F5 retain dash_* filter
3) Drill by_yctd → click → YCTD detail (J-HRM-05) — DENY Campaign
4) Reports recruitment (module + /reports) same Nest semantics — DENY second formula
5) Invalid period → 400 toast VI; scope mismatch → 409; no cost/C&B; no stale numbers on error
cấm: seed · API-only PASS · honesty flip · Nest /rec dual claim
exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-qa-01.md
hdsd_align: true · UF matrix REC dashboard · J-HRM-REC-DASH-01
```
