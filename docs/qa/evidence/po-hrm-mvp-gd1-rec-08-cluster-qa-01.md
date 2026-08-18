# Evidence — PO-HRM-MVP-GD1-REC-08-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-08-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | **REC08QA-MSKX5N59** |
| **ack_status** | **PASS_TO_PM** |
| **uc_ids** | `UC-BP-REC-08` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | BE-01 READY (jest 58) · FE-01 READY_FOR_QA (vitest 17) |
| **env** | portal `:5173` · hrm-api `:28001` (newest dist dashboard* LIVE) · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-08-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-08-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-08-cluster-qa-01/` (8) |
| **hdsd_align** | true — Tuyển dụng → Dashboard / Reports (module + `/reports`) |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01.md` AC-REC-08-01..10 · ALT/EX · VAL-REC-DASH · O1–O10 |
| **api** | `PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md` F-REC-DASH-01/02 · tokens HRM-REC-DASH-* |
| **be** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-be-01.md` |
| **fe** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-fe-01.md` |
| **uc_ids** | UC-BP-REC-08 |

**cấm respected:** no `pnpm seed:*` · no API-only UF PASS · no DB mutate · no honesty flip · no Nest `/rec` dual claim · no module REC UAT (C-SLICE).

---

## L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` | hrm-api **200** · xbos **200** · portal `:5173` **200** |
| Dist freshness | Intake: running process lacked dashboard → rebuild artifacts + restart `dist/main` → **GET dashboard LIVE** |
| Verdict | 🟢 **PASS** |

---

## L1 / API spot (supporting — UF from browser)

| Probe | Network | After | Verdict |
|-------|---------|-------|---------|
| GET `…/recruitment/dashboard?year=2026&include=yctd` | **200** `HRM-REC-DASH-200` | planned=45 · filled=0 · pipeline=13 · gap=45 · pct=0 · status=`in_progress` · eta=`2026-08` · funnel 5 keys · by_yctd=24 | 🟢 |
| GET from–to `2026-01`–`2026-12` | **200** `HRM-REC-DASH-200` | period range bind | 🟢 |
| Invalid year / from>to | **400** `HRM-REC-DASH-PERIOD-400` | VI message | 🟢 |
| `company_id=not-in-scope-zzzz` | **409** `SCOPE_CONTEXT_MISMATCH` | scope pattern (FE maps + `HRM-SCOPE-409` VI) | 🟢 |
| GET `/api/hrm/rec/dashboard` | **404** | no Nest dual SoT | 🟢 |
| O10 forbidden fields | omit | no salary/C&B/cost/mst/bank in JSON | 🟢 |

---

## U65 browser UF (HDSD)

Persona inject portal auth · URL `http://127.0.0.1:5173/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=dashboard`

### AC-REC-08-01 — Filter kỳ 🟢

| Step | Evidence |
|------|----------|
| Before | Login → Tuyển dụng → Dashboard panel `rec-nest-dashboard-panel` |
| Action | Kỳ **Theo năm** / **Từ tháng–đến** |
| Network | GET `/api/hrm/recruitment/dashboard*` → **200** `HRM-REC-DASH-200` |
| FE after 2xx | Filter axis + URL `dash_mode` / `dash_year` or `dash_from`+`dash_to` |
| F5 | (see 02-F5) |
| Verdict | 🟢 |
| spec_ref | BA AC-REC-08-01 · Diễn biến §3.4 #1–#2 |

### AC-REC-08-02 — Bind display-ready + F5 🟢

| Step | Evidence |
|------|----------|
| Before | Panel visible |
| Action | Load year 2026 |
| Network | **200** `HRM-REC-DASH-200` |
| FE after 2xx | KPI: planned / filled / pipeline / gap / % / open YCTD · enough_people · funnel 5 |
| F5 | URL retains `dash_mode=year&dash_year=2026` · GET **200** again · same bind |
| Verdict | 🟢 |
| spec_ref | AC-REC-08-02 · U63/U65 |

### AC-REC-08-03 — KH / empty integrity 🟢

| Step | Evidence |
|------|----------|
| Action | Observe KPIs year 2026 |
| Network | planned_need=**45** · completion_pct=**0** (not invented 100%) · empty_guide=null (has plan) |
| Verdict | 🟢 |
| spec_ref | AC-REC-08-03 · O2/O9 |

### AC-REC-08-04 — Funnel 5 keys 🟢

| FE after 2xx | UI `data-funnel-key` = cv · screening · interview · offer · onboard |
| Verdict | 🟢 |
| spec_ref | AC-REC-08-04 · O4 |

### AC-REC-08-05 — Enough people 🟢

| FE after 2xx | status `in_progress` · label «Dự kiến đủ người: 08/2026» · eta badge `2026-08` |
| Verdict | 🟢 |
| spec_ref | AC-REC-08-05 · O5 |

### AC-REC-08-06 / J-HRM-REC-DASH-01 / J-HRM-05 — YCTD drill 🟢

| Step | Evidence |
|------|----------|
| Before | Khoan YCTD table rows visible (out_of_plan badge present) |
| Action | Click row `rec-dash-yctd-row-e7529d70-…` |
| Network | GET `/api/hrm/recruitment/requisitions/e7529d70-…` → **200** `HRM-REC-200` |
| FE after 2xx | YCTD detail UI · **campaignPrimary=false** (DENY Campaign primary) |
| Verdict | 🟢 |
| spec_ref | AC-REC-08-06 · D-S10 · J-HRM-05 |

### AC-REC-08-07 — out_of_plan in drill 🟢

| FE | Mode «Ngoài định biên» visible in YCTD table |
| Verdict | 🟢 |
| spec_ref | AC-REC-08-07 · O6 |

### AC-REC-08-08 — No cost/C&B 🟢

| UI + JSON | No salary / C&B / cost / MST / bank |
| Verdict | 🟢 |
| spec_ref | AC-REC-08-08 · O10 |

### AC-REC-08-09 — No FE second formula 🟢

| Code audit | Nest panel wired · aggregator disabled · `buildRecruitmentReportFromApi` throws · Reports use `getRecruitmentDashboard` |
| Verdict | 🟢 |
| spec_ref | AC-REC-08-09 · SOLID 25 §3.1 |

### AC-REC-08-10 — Reports same Nest semantics 🟢

| Step | Evidence |
|------|----------|
| Action | Module Reports tab + `/hr/reports` recruitment |
| Network | Both GET dashboard* **200** `HRM-REC-DASH-200` |
| FE after 2xx | `rec-module-reports-nest` · sameSemanticsYear vs Dashboard KPIs |
| Verdict | 🟢 |
| spec_ref | AC-REC-08-10 · O8 |

### AC-REC-08-EX-01 — Invalid period 🟢

| Action | Range from `2026-12` → to `2026-01` |
| FE after | KPI shows `—` (no stale numbers) · L1 PERIOD-400 confirmed |
| Verdict | 🟢 |
| spec_ref | AC-REC-08-EX-01 |

### AC-REC-08-EX-02 — Scope 409 🟢

| L1 | **409** `SCOPE_CONTEXT_MISMATCH` · FE VI map present |
| Verdict | 🟢 |

### AC-REC-08-EX-04 — Empty guide 🟢

| Action | Year **2027** (no approved cells) |
| Network | **200** · `empty_guide.code=NO_APPROVED_HEADCOUNT` · status=`no_plan` |
| FE after | `rec-dash-empty-guide` visible (not blank white / crash) |
| Verdict | 🟢 |

### AC-REC-08-EX-05 — DENY Nest `/rec` dual 🟢

| Probe | GET `/api/hrm/rec/dashboard` → **404** |
| Verdict | 🟢 |

---

## Journeys

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-REC-DASH-01** | 🟢 | Dashboard → by_yctd → YCTD detail |
| **J-HRM-05** | 🟢 | Detail GET 200 from drill |

---

## Honesty (LOCKED)

```text
recruitment_uat_ready=false
program honesty flags=false
C-SLICE ≠ module REC UAT
U65 zero-seed · seed_used=false
DENY Nest /rec dual claim
```

---

## Residual / OBS

| Item | Severity | Notes |
|------|----------|-------|
| Scope error code | OBS P3 | Runtime token `SCOPE_CONTEXT_MISMATCH` (409) — FE maps VI; BA text also cites `HRM-SCOPE-409`. Acceptable pattern match. |
| Nest `nest build` typecheck | OBS P2 | Source import `HrmListScopeContext` from `hrm-list-scope-context` fails strict `nest build`; runtime dist present & LIVE. Recommend BE tidy import from `hrm-list-scope` — **not** UF blocker (dashboard served). |

**P0/P1 defects:** none.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-qa-01.md` |
| **completion_report** | Closed U65 browser AC-REC-08-01..10 + EX-01/02/04/05 + J-HRM-REC-DASH-01/J-HRM-05 for UC-BP-REC-08. L0 LIVE dashboard*; Nest bind KPI/funnel/enough_people/empty_guide; F5 dash_*; YCTD drill→detail DENY Campaign primary; Reports O8 same Nest; PERIOD-400 / scope 409 / no C&B; honesty false C-SLICE. stamp **REC08QA-MSKX5N59**. Residual: OBS import tidy + scope token alias only. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-08-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-08
depends_on: QA-01 PASS_TO_PM · stamp REC08QA-MSKX5N59
entry_criteria: docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-qa-01.md · BE/FE evidence · honesty false
MISSION: Narrow GWC audit AC-REC-08 browser evidence + J-HRM-REC-DASH-01/J-HRM-05 · DENY honesty flip · DENY module REC UAT (C-SLICE) · DENY Nest /rec dual · confirm residual OBS only
cấm: seed · flip recruitment_uat_ready · claim module REC UAT
exit: GO|GWC|NO-GO · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-qc-01.md · PASS_TO_PM
```
