# Evidence — PO-HRM-REC-UV-YCTD-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-UV-YCTD-QA-02` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **date** | 2026-08-06 |
| **parent** | BE-01 + CMP-FE-01 `READY_FOR_QA` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **u65** | zero-seed · browser-only · **cấm** seed · **cấm** `recruitment_uat_ready` · **cấm** `job_postings` compare SoT |
| **env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · commit `dc930c5` |
| **ack_status** | **PASS_TO_PM** (PASS_WITH_CONDITIONS) |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · seeded=false |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **qa_plan** | `docs/qa/evidence/po-hrm-rec-uv-yctd-qa-plan-01.md` §5.2 UF-REC-CMP-01..06 · §6.2 **J-HRM-REC-CMP-01** |
| **cmp_fe** | `docs/qa/evidence/po-hrm-rec-uv-yctd-cmp-fe-01.md` HDSD testids |
| **be** | `docs/qa/evidence/po-hrm-rec-uv-yctd-be-01.md` F-REC-CMP-01/02 routes |
| **srs** | `SRS_HRM_ENTERPRISE.md` v0.11 · **FR-UC-BP-REC-06b** · AC-REC-CMP-01..05 |

---

## L0 / FE↔BE

| Check | Result |
|-------|--------|
| `qc:dev-stack` | HRM 200 · XBOS 200 · portal `:5173` 200 (prior; UV_HANDLE_CLOSING noise on exit) |
| `qc:fe-be-health` | **ALL PASS** |
| Harness L0 | hrm=200 · xbos=200 · portal=200 |

### BE-01 live serve (entry)

| Probe | Result |
|-------|--------|
| Stale `nest --watch` process | `GET …/applications` · `GET …/compare` → **404** `HRM-DATA-404` |
| Restart `nest start --watch` | **FAIL compile** — TS2339 `workflow_instance_id` / `company_id` on `getJobRequisitionById` return (recruitment.service.ts ~794–800) |
| Recovery | `node apps/api/hrm-api/dist/main.js` (`start:prod` dist) — routes **live** |
| `GET …/applications?requisition_id=` | **200** `HRM-REC-CMP-200` |
| Forced compare 5 ids | **400** `HRM-REC-CMP-MAX-N` |
| Forced compare foreign candidate | **400** `HRM-REC-CMP-YCTD-MIX` |

**Residual ops:** Dev-BE must fix TS compile so `dev:hrm-api` watch serves BE-01 without relying on stale/prod dist.

---

## Click path (U65 · HDSD)

```text
1. Auth inject ceo@xe.vn · companyId=main
2. /hr/recruitment?tab=evaluations&portal=1&tenantId=xevn&companyId=main
3. Click hdsd-rec-compare-open-btn (So sánh)
4. Dialog hdsd-rec-compare-dialog
5. Assert YCTD label + picker · select first receivable YCTD
6. Load UV rows / empty · select UV → matrix · «Chưa đánh giá»
7. Network: requisitions?receivable=true · applications?requisition_id= · compare?requisition_id=
```

**Harness:** `scripts/qa/_tmp-po-hrm-rec-uv-yctd-qa-02.mjs`  
**JSON:** `docs/qa/evidence/_tmp-po-hrm-rec-uv-yctd-qa-02.FINAL.json`  
**Screens:** `docs/qa/evidence/screens/po-hrm-rec-uv-yctd-qa-02/` (`01`..`05`)

---

## UF / AC matrix

### UF-REC-CMP-01 — AC-REC-CMP-01 · 🟢 PASS

- Persona / URL / click path: `ceo@xe.vn` · evaluations → So sánh
- FE: label **«Chọn yêu cầu tuyển dụng (YCTD)»** · `hdsd-rec-compare-yctd-picker` visible · no tin-đăng picker **in dialog**
- Network (after dialog open): `GET …/requisitions?…&receivable=true` → **200** `HRM-REC-200` — **not** job_postings as compare filter
- Verdict: 🟢
- spec_ref: SRS REC-06b #1 · AC-REC-CMP-01

### UF-REC-CMP-02 — AC-REC-CMP-02 · 🟢 PASS (waived empty path)

- Natural state: receivable YCTD **total=10** → picker present; 0-YCTD empty **not** triggered (U65 no seed to clear)
- Waive: empty UI covered by CMP-FE unit + HDSD `hdsd-rec-compare-yctd-empty`; not forced
- Verdict: 🟢 (N/A natural-empty)

### UF-REC-CMP-03 — AC-REC-CMP-03 · 🟢 PASS (waived empty path)

- Selected first YCTD → natural **UV rows=1** → empty-UV path not triggered
- Network: `GET …/applications?requisition_id=…&include=evals` → **200** `HRM-REC-CMP-200`
- Verdict: 🟢 (N/A empty-UV)

### UF-REC-CMP-04 — AC-REC-CMP-04 · 🟡 PARTIAL

- Natural UV count **1 &lt; 5** — cannot FE-click &gt;N without seed
- BE corroborate: `GET …/compare` with 5 candidate_ids → **400** `HRM-REC-CMP-MAX-N` «Compare allows at most 4 candidates»
- FE disable/toast at N=4 **not** browser-proven this seat
- Verdict: 🟡 PARTIAL
- Residual: `R-CMP-FE-MAX-N-BROWSER` — retest after ≥5 UV on one YCTD via **FE** (J-HRM-REC-UV-01), not seed

### UF-REC-CMP-05 — AC-REC-CMP-05 · 🟢 PASS

- Select 1 UV → `hdsd-rec-compare-uv-not-eval` + text **«Chưa đánh giá»** · `hdsd-rec-compare-matrix` visible
- Network: `GET …/compare?company_id=main&requisition_id=…&candidate_ids=52442fa0-…` → **200** `HRM-REC-CMP-200`
- Console: pageErrors=0 · no Uncaught on path
- Verdict: 🟢

### UF-REC-CMP-06 — BR-CMP-01 MIX · 🟢 PASS

- FE: single-YCTD picker blocks mix UX
- BE probe: foreign candidate_id → **400** `HRM-REC-CMP-YCTD-MIX`
- Dual-YCTD FE mix attempt not available under zero-seed (single picker)
- Verdict: 🟢

---

## J-HRM-REC-CMP-01 (L2.5)

| Field | Value |
|-------|--------|
| **J-ID** | `J-HRM-REC-CMP-01` |
| **Click path** | login → Tuyển dụng → Đánh giá → So sánh (`hdsd-rec-compare-open-btn`) → dialog |
| **Final URL** | `http://127.0.0.1:5173/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=evaluations&…` |
| **Dialog** | `hdsd-rec-compare-dialog` visible |
| **Detail APIs** | applications **200** · compare **200** |
| **Console** | clean (no pageErrors) |
| **Verdict** | 🟢 **PASS** |
| **Journey map** | `PROGRAM_JOURNEY_MAP.md` — **row MISSING** → `spec_gap` flag (PM/BA add row) |

---

## Network SoT gate (compare)

| Gate | Result |
|------|--------|
| After dialog open: `job_postings` | **0** — PASS |
| Compare SoT | `requisitions?receivable=true` + `applications?requisition_id=` + `compare?requisition_id=` |
| OBS | `GET …/job-postings` on evaluations **tab preload** (before So sánh) — **not** compare SoT |

---

## Residual / conditions

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| **R-CMP-FE-MAX-N-BROWSER** | P1 | FE max-N disable/toast not proven (natural UV=1); BE MAX-N 400 OK | qa retest after FE UV create ≥5 / or accept BE+unit |
| **R-HRM-API-WATCH-TS** | P0 ops | `nest start --watch` fails TS2339 on `submitJobRequisitionForApproval` after BE-01 type narrowing | **dev-be** |
| **R-JOURNEY-MAP-CMP** | P2 | `J-HRM-REC-CMP-01` missing from `PROGRAM_JOURNEY_MAP.md` | pm / ba-process |
| **OBS-JOB-POSTINGS-TAB-PRELOAD** | OBS | job_postings GET on evaluations tab load | — |
| **DENIED** | — | `recruitment_uat_ready` · seed · module UAT · jd_dynamic_done | — |

---

## Honesty

- Slice compare YCTD SoT browser **PASS_WITH_CONDITIONS** — **not** recruitment module UAT.
- Empty 0 YCTD / 0 UV paths waived under natural data (U65 no seed).
- No commit.

---

## completion_report

Closed browser U65 execute for **PO-HRM-REC-UV-YCTD-QA-02**: L0 + fe-be-health PASS; restored BE-01 compare routes via `dist/main` after watch compile break; J-HRM-REC-CMP-01 click path PASS; UF-REC-CMP-01/05/06 PASS; UF-02/03 PASS waived-empty; UF-04 PARTIAL (BE MAX-N 400, FE &gt;N not natural); no job_postings as compare SoT after dialog open; pageErrors=0; honesty flags false. Conditions: Dev-BE fix watch TS; journey-map row; optional FE max-N retest after ≥5 UV via FE.

## next_owner

**pm** (intake) → **dev-be** for `R-HRM-API-WATCH-TS`; optional **qc** narrow GWC on compare slice only (not module UAT)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-UV-YCTD-BE-WATCH-FIX-01
from_role: pm
to_role: dev-be
lane: execution
entry: QA-02 PASS_TO_PM · residual R-HRM-API-WATCH-TS
problem: nest start --watch fails TS2339 workflow_instance_id/company_id on getJobRequisitionById return in submitJobRequisitionForApproval (recruitment.service.ts ~794–800); live compare routes only via dist/main
exit: pnpm run dev:hrm-api compiles; GET /recruitment/applications + /compare return CMP codes (not 404); no regression receivable list
evidence_path: docs/qa/evidence/po-hrm-rec-uv-yctd-be-watch-fix-01.md
DENIED: seed · recruitment_uat_ready
```

Optional parallel:

```text
work_item_id: PO-HRM-REC-UV-YCTD-QC-02
from_role: pm
to_role: qc
lane: governance
entry: QA-02 evidence docs/qa/evidence/po-hrm-rec-uv-yctd-qa-02.md
scope: narrow GWC compare YCTD slice only · retain recruitment_uat_ready=false · note UF-04 PARTIAL + watch-TS residual
```

## ack_status

**PASS_TO_PM**
