# Evidence — PO-HRM-MVP-GD1-REC-08-CLUSTER-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-08-CLUSTER-BE-01` |
| **lane** | execution · dev-be |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **uc_ids** | `UC-BP-REC-08` |
| **Date** | 2026-08-09 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD · preserve_default · code_memory APPEND |
| **depends_on** | API-01 CONFIRMED · BA-01 CONFIRMED · SA-01 Option A |

---

## spec_read_ack

| Spec | Cite |
|------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-08** Diễn biến #1–#3 |
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01.md` §2.1 · O1–O10 · VAL-01..19 |
| **api** | `docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md` F-REC-DASH-01/02 · §4.1–§4.4 · §7–§8 |
| **sa** | `docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01.md` D-S1..D-S10 Option A LOCKED |
| **code AS-IS** | `recruitment.controller.ts` · `recruitment.service.ts` · `recruitment-catalog.service.ts` · `rec-pipeline-stage.service.ts` · `hrm-list-scope.ts` |

**solid_convention_ack:** display-ready — Nest owns formulas · no FE aggregate · scope_parity via `resolveHrmListScope`

---

## Shipped

| Item | Detail |
|------|--------|
| Physical routes | `GET /api/hrm/recruitment/dashboard` · `GET …/dashboard/yctd` · `?include=yctd` |
| DENY dual | No Nest `@Controller('rec')` — paper `/rec/dashboard` alias only |
| Service | `RecruitmentDashboardService` on-the-fly (Option A — no rollup table) |
| KH (O2) | Σ `need_hire` from approved plans × `months_data` cells (`lifecycle_status=need_hire_approved` ∧ qty≥1 ∧ month∈period) |
| TT/funnel | `recruitment_candidates` by `requisition_id` + catalog→bucket map (§4.1); 5 funnel keys always |
| Open / ETA | `OPEN_YCTD_STATUS_SET` = `open_for_hire`\|`open`\|`approved`; earliest `target_month` with remaining>0 |
| Display-ready | `planned_need`, `filled_count`, `in_pipeline_count`, `gap_count`, `completion_pct` (null if planned=0), `enough_people_*`, `by_month`, `by_org_unit`, `empty_guide`, `by_yctd` |
| Errors | `HRM-REC-DASH-PERIOD-400` · `HRM-SCOPE-409` (resolver) · `HRM-REC-DASH-METHOD-405` · success `HRM-REC-DASH-200` |
| O10 | C&B/salary/cost fields omitted; jest assert absent |
| GET only | POST/PUT/PATCH/DELETE on dashboard* → 405 |

### Files

- `apps/api/hrm-api/src/recruitment/recruitment-dashboard.constants.ts` (ADD)
- `apps/api/hrm-api/src/recruitment/recruitment-dashboard.formulas.ts` (ADD)
- `apps/api/hrm-api/src/recruitment/recruitment-dashboard.service.ts` (ADD)
- `apps/api/hrm-api/src/recruitment/dto/recruitment-dashboard.query.dto.ts` (ADD)
- `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-08-cluster-be-01.spec.ts` (ADD)
- `apps/api/hrm-api/src/recruitment/recruitment.controller.ts` (APPEND routes + CODE-MEMORY)
- `apps/api/hrm-api/src/app.module.ts` (provider)
- `apps/api/hrm-api/src/recruitment/recruitment.controller.spec.ts` (mock DI)

---

## Verify

```text
pnpm exec jest --testPathPatterns=po-hrm-mvp-gd1-rec-08-cluster-be-01 \
  --testPathPatterns=recruitment.controller.spec \
  --testPathPatterns=recruitment-plan-headcount.spec \
  --testPathPatterns=po-hrm-mvp-gd1-rec-01-cluster-be-01 \
  --testPathPatterns=po-hrm-mvp-gd1-rec-02-cluster-be-01 --no-coverage
→ Test Suites: 5 passed · Tests: 58 passed (incl. REC-01/02 regressions)
REC-08 suite alone: 29 passed (formulas + service + controller DI)
```

### Formula coverage

| ID | Assert |
|----|--------|
| O2 | need_hire_approved ≥1 only; draft/open excluded |
| O3 | hired→onboard; filled counts |
| O5 | earliest open YCTD target_month remaining>0 |
| O6 | out_of_plan in TT/drill; KH not inflated |
| O7 | mode_warn when headcount_mode NULL |
| O9 | completion_pct null; enough/in_progress/at_risk/no_plan |
| Funnel | 5 keys always present |
| empty_guide | NO_APPROVED_HEADCOUNT when no O2 |
| U19 | summary + drill both filter company_id via resolveHrmListScope |
| O10 | assertNoForbiddenFields · JSON omit salary/C&B/cost |

---

## must_keep / DENY (honored)

| Class | Status |
|-------|--------|
| REC-01 cell identity + spawn UQ | RETAIN (read-only) |
| REC-02 open_for_hire / flags / CELL-QTY / BOD | RETAIN |
| TARGET-MONTH CLOSED | RETAIN (DATE→yyyy-MM truncate only) |
| resolveHrmListScope | USED on both GETs |
| soft-delete YCTD `archived_at IS NULL` | USED |
| Nest `/rec` dual · Option B rollup · seed · honesty flip · REC-03 | DENY |

---

## Honesty

```text
recruitment_uat_ready=false
program honesty flags=false
C-SLICE ≠ module REC UAT
U65 zero-seed
```

---

## Residual

| Item | Owner |
|------|--------|
| FE bind replace aggregator | `PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01` |
| Browser UF/J-* U65 | QA |
| Option B materialize | P2 HOLD |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-be-01.md` |
| **completion_report** | Closed Nest Option A dashboard read-model GET `/recruitment/dashboard*` + formulas O2–O9 + funnel/empty_guide/C&B omit + METHOD-405 + jest 58 PASS (REC-01/02 regression). Residual: QA browser + FE bind lane. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-08-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-08
depends_on: BE-01 READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-be-01.md
entry_criteria: L0 stack; U65 zero-seed browser-only; persona ceo@xe.vn
MISSION: Browser AC-REC-08-01..10 + ALT/EX period/scope —
1) Login → Tuyển dụng → Dashboard; filter year/from-to → Network GET /api/hrm/recruitment/dashboard* 2xx code HRM-REC-DASH-200
2) Assert planned_need/filled/gap/completion_pct/funnel 5 keys/enough_people_*/empty_guide bind; F5 retain filter
3) Drill GET …/dashboard/yctd or include=yctd → by_yctd; click → YCTD detail (J-HRM-05) — DENY Campaign
4) Invalid period → 400 HRM-REC-DASH-PERIOD-400; scope mismatch → 409; no C&B/salary in body
5) Coordinate FE-01 if aggregator still invents KH
cấm: seed · API-only PASS · honesty flip · Nest /rec dual claim
exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-qa-01.md
hdsd_align: true · UF matrix REC dashboard rows
```
