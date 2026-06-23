# P1-EX-QC-HTTPS-BROWSER-01-R5-R2 — HTTPS browser embed gate (reconciled R5 pack)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-EX-QC-HTTPS-BROWSER-01-R5-R2` |
| **date** | `2026-05-28` |
| **owner** | QC |
| **from_role** | `pm` |
| **to_role** | `qc` → `pm` |
| **base_url** | `https://14-225-217-232.nip.io` |
| **account** | `ceo@xe.vn` / `Xevn@2026` (group CEO, `x-company-id: main`) |
| **entry** | QA `P1-EX-QA-HTTPS-BROWSER-01-R5-R2` PASS_TO_PM; deploy gap closed (`p1-ex-do-deploy-https-r5-pack-20260528.md`) |
| **prior gate** | [`p1-ex-qc-https-01-20260527.md`](p1-ex-qc-https-01-20260527.md) — **C-HTTPSQC-01** browser embed open |
| **rules** | `business-flow-zero-defect-gate.mdc`, `uat-production-readiness-orchestration.mdc` (U19 L2.5) |
| **no_commit** | `true` |

---

## Executive verdict

| Decision tier | Result |
|---------------|--------|
| **HTTPS browser embed slice** (P-CC-03..08 sync + `J-HRM-02` click on nip.io) | **GO WITH CONDITIONS** |
| **Production / PROD-READY** | **NOT MET** |
| **Excellence Program DONE** | **NOT MET** (unchanged vs QC-05) |
| **Phase 1 program closure** | **NOT MET** |
| **Unconditional QC GO** (corporate prod cutover) | **NOT APPROVED** |

**Honest sponsor line:**

- **Đạt trên HTTPS pilot (browser):** Command Center HRM embed tabs **P-CC-03..08** load without **Sync ERROR**; `GET /api/hrm/catalog-sync/status?company_id=main` → **200** `HRM-SYNC-203`; iframe `companyId=main`; **J-HRM-02** list → employee profile click **PASS** (no false profile banner; detail API **200**).
- **Vẫn chưa:** Full **J-HRM-01/03..07** browser list→detail on HTTPS; attendance rules UX message; Production GO; program/excellence closure.

**Do not tell sponsor:** “Production ready”, “all J-HRM browser-tested on HTTPS”, or “QC unconditional GO” from this gate alone.

---

## Entry lane audit

| Packet | Disposition | Evidence |
|--------|-------------|----------|
| **p1-ex-qa-https-browser-01-r5** | **ACCEPTED** (functional); prior FAIL = artifact-only | `docs/qa/evidence/p1-ex-qa-https-browser-01-r5-20260528.md` |
| **p1-ex-qa-https-browser-01-r5-r2** | **ACCEPTED** — PASS_TO_PM reconciliation | `docs/qa/evidence/p1-ex-qa-https-browser-01-r5-r2-20260528.md` |
| **p1-ex-do-deploy-https-r5-pack** | **ACCEPTED** — closes R5 precondition gap | `docs/ops/evidence/p1-ex-do-deploy-https-r5-pack-20260528.md` |
| **p1-ex-be-https-catalog-sync-10** | **ACCEPTED** (chain) | `docs/qa/evidence/p1-ex-be-https-catalog-sync-10-20260528.md` |
| **p1-ex-fe-https-emp-profile-10** | **ACCEPTED** (chain) | `docs/qa/evidence/p1-ex-fe-https-emp-profile-10-20260528.md` |
| **p1-ex-qc-https-01** | **Partial carry** — API 7/7 remains; browser condition **narrowed/closed** for this slice | `docs/qa/evidence/p1-ex-qc-https-01-20260527.md` |

**Precondition closure:** Missing deploy artifact cited in R5 QA is **present** and includes L0 + `HRM-SYNC-203` + J-HRM-02 browser smoke. **PASS.**

---

## QC reproduction (2026-05-28)

| Check | Exit | Result | Notes |
|-------|-----:|--------|-------|
| L0 `fetch` `/api/hrm/`, `/api/xbos/`, `/` | 0 | **PASS** | All **200** |
| Login `ceo@xe.vn` | 0 | **201**, token present | |
| `GET /api/hrm/catalog-sync/status?company_id=main` | 0 | **200** `HRM-SYNC-203` | QC inline Node |
| `GET /api/hrm/employees/00000000-0000-4000-8000-000000000001?company_id=main` | 0 | **200** `HRM-EMP-200` | J-HRM-02 API parity |
| `GET /api/xbos/kpi-engine/rollup?companyId=main` | 0 | **200** | J-CC-03 main (API) |

**Authoritative (not re-run):** QA R5 browser tables for P-CC-03..08 sync banner + iframe `companyId=main` + J-HRM-02 click path; DevOps deploy pack browser screenshots (`p1-ex-do-r5-*.png` on VPS).

---

## L0–L3 adjudication (browser embed slice)

| Layer | Status | Evidence |
|-------|--------|----------|
| **L0** Stack health | **PASS** | QC repro + deploy pack |
| **L1** System UAT JSON | **Not re-run on HTTPS** | Prior local 37/37 — does not substitute browser matrix |
| **L2** P-CC-03..08 embed load | **PASS** (sync gate) | QA R5: **CONNECTED**, no Sync ERROR on all six routes |
| **L2.5** J-* browser cross-nav | **PASS (partial)** | **J-HRM-02** browser click **PASS**; other J-HRM browser clicks **deferred** (see § J-*) |
| **L3** QC gate | **GWC** | This document |

**U19 check:** QA did **not** claim PASS on HTTP 200 tab load alone — catalog-sync contract + J-HRM-02 click path documented. **Pass** for in-scope slice.

---

## Focus checklist (PM mission)

| Focus | QA / deploy | QC |
|-------|-------------|-----|
| **P-CC-03..08** no Sync ERROR | **PASS** (all six) | **Concurred** |
| **catalog-sync** `200` + `HRM-SYNC-203` | **PASS** | **Concurred** (QC repro) |
| **iframe** `companyId=main` | **PASS** (all sampled routes) | **Concurred** |
| **J-HRM-02** list → profile | **PASS** (NV0001 → profile URL; no false banner) | **Concurred** (API repro + deploy/QA chain) |
| Attendance rules message | Noted: `"Không thể tải quy định chấm công"` | **Non-blocking** for this gate (outside sync/profile scope) |

---

## J-* coverage (explicit)

### In-scope — browser-tested or contract-verified on HTTPS (this wave)

| Journey / route | QC verdict | Method | Notes |
|-----------------|------------|--------|-------|
| **P-CC-03..08** (sync gate) | **PASS** | QA browser + deploy smoke | Tab load; **CONNECTED**; no Sync ERROR |
| **J-HRM-02** | **PASS** | QA browser click + QC API | Profile route; `HRM-EMP-200` |
| **J-CC-03** (`companyId=main`) | **PASS** (API) | QC repro | KPI rollup **200** — not re-clicked in CC shell this cycle |

### Deferred on HTTPS browser (not blocking this slice)

| Journey | Status | Owner | Trigger |
|---------|--------|-------|---------|
| **J-HRM-01, 03..07** | ⏳ Deferred | QA | Browser list→detail when rows exist on each tab |
| **J-CC-01, 02** | ⏳ Deferred | QA | Full CC navigation on HTTPS before prod GO |
| **J-HRM-06** detail path | ⏳ Partial | devops + QA | Attendance seed + rules load message |
| **J-MOB-*** | ⏳ Out of slice | QA / mobile | Separate channel |

---

## Options considered

| Option | Rationale | QC decision |
|--------|-----------|-------------|
| **GO** (unconditional + prod) | R5 functional green | **Rejected** — partial J-HRM browser; PROD 🔴 |
| **NO-GO** | R5 once FAIL on missing file | **Rejected** — precondition closed; QC repro PASS |
| **GO WITH CONDITIONS** | Honest browser embed slice; narrow **C-HTTPSQC-01** | **Selected** |

---

## Conditions

### Closed / narrowed

| ID | Disposition | Rationale |
|----|-------------|-----------|
| **C-HTTPSQC-01** | **CLOSED (narrow mandatory slice)** | Browser HTTPS embed: **P-CC-03..08** sync handshake + **J-HRM-02** click path **PASS** on `14-225-217-232.nip.io` |
| R5 deploy precondition | **CLOSED** | `p1-ex-do-deploy-https-r5-pack-20260528.md` on disk |

### Still open (carry from QC-HTTPS-01)

| ID | Condition | Owner | Target |
|----|-----------|-------|--------|
| **C-HTTPSQC-01B** | Browser **J-HRM-01, 03..07** list→detail on HTTPS (not API-only) | QA + dev-fe | Before prod GO |
| **C-HTTPSQC-02** | Attendance seed + rules load (`J-HRM-06` detail) | devops | 2026-06-15 |
| **C-HTTPSQC-03** | Governed fidelity seed chain | devops | 2026-06-15 |
| **C-HTTPSQC-04** | JWT TTL probe alignment | dev-be / pm | 2026-06-15 |
| **C-HTTPSQC-05** | Production QC GO + SERVICE_READINESS PROD | DevOps + QC + PM | 2026-06-30 |
| **C-HTTPSQC-06** | Sponsor messaging: pilot ≠ PROD | PM | Immediate |
| **C-HTTPSQC-07** | TLS-R2 `/hr/` external demo hardening | devops | 2026-06-15 |
| **C-HTTPSQC-08** | Attendance UX: `"Không thể tải quy định chấm công"` on P-CC-07 | dev-be / dev-fe | 2026-06-15 |

**Waivers:** None for Production GO or Program DONE.

---

## Residual risks

| ID | Sev | Item |
|----|-----|------|
| HTTPSBR-R1 | Medium | Sponsor treats **sync CONNECTED** as full **L2.5** for all J-HRM |
| HTTPSBR-R2 | Low | Attendance rules message may confuse UAT operators on P-CC-07 |
| HTTPSBR-R3 | High | **Production** still 🔴 — nip.io browser GWC ≠ PROD-READY |

---

## Handoff

```yaml
work_item_id: P1-EX-QC-HTTPS-BROWSER-01-R5-R2
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
verdict: GO_WITH_CONDITIONS
https_browser_embed_slice: true
production_met: false
c_httpsqc_01: CLOSED_NARROW_SLICE
c_httpsqc_01b: OPEN
j_hrm_02_browser: PASS
p_cc_03_08_sync: PASS
catalog_sync_203: PASS
evidence_path: docs/qa/evidence/p1-ex-qc-https-browser-01-r5-r2-20260528.md
pm_dispatch_hint:
  - pm: Update USER_SERVICE_STATUS / PSR — HTTPS browser embed sync + J-HRM-02 green; not PROD
  - qa: C-HTTPSQC-01B — remaining J-HRM browser clicks on nip.io
  - devops: C-HTTPSQC-02 attendance seed; C-HTTPSQC-07 TLS-R2
no_commit: true
```

---

## completion_report

- **Closed:** Reconciled R5 QA + deploy artifact chain; QC concurred **P-CC-03..08** sync gate, **HRM-SYNC-203**, **companyId=main**, **J-HRM-02** browser path; reproduced L0 + catalog-sync + employee detail + KPI main on live pilot.
- **Residual (non-blocking this gate):** Attendance rules message on P-CC-07; **J-HRM-01/03..07** browser clicks not executed this wave; all Production / program closure conditions unchanged.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-PM-HTTPS-BROWSER-01-R5-R2-INTAKE
from_role: pm
to_role: pm
ack_status target: DISPATCHED

QC returned GO WITH CONDITIONS on P1-EX-QC-HTTPS-BROWSER-01-R5-R2.
Evidence: docs/qa/evidence/p1-ex-qc-https-browser-01-r5-r2-20260528.md

Actions:
1) Update USER_SERVICE_STATUS / PROJECT_STATUS_REPORT — HTTPS pilot browser embed (ceo@xe.vn): P-CC-03..08 sync PASS, J-HRM-02 PASS; NOT Production.
2) Dispatch qa for C-HTTPSQC-01B: browser list→detail on HTTPS for J-HRM-01,03..07 where rows exist.
3) Optional dev-be/dev-fe for C-HTTPSQC-08 attendance rules message on P-CC-07 if PM prioritizes UX hardening.
```

## evidence_path

`docs/qa/evidence/p1-ex-qc-https-browser-01-r5-r2-20260528.md`

## ack_status

**PASS_TO_PM**

---

*QC: P1-EX-QC-HTTPS-BROWSER-01-R5-R2 · 2026-05-28 · No commit.*
