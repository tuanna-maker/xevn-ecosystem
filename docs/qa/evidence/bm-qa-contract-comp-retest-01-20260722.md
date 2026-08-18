# BM-QA-CONTRACT-COMP-RETEST-01 — BM-04 / BM-AC-04-* U65 browser

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-QA-CONTRACT-COMP-RETEST-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **priority** | P1 |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · JWT scope `main` (rollup) |
| **URL** | `http://14.225.217.232:8088` |
| **HRM surface used** | `http://14.225.217.232:8088/hr/employees/{id}?tenantId=xevn&companyId=main` |
| **subject** | `HLD-0006` · `8ac84520-0d6b-4737-8341-2f9a929b5f81` · Huỳnh Văn An |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD claim |
| **entry** | `docs/qa/evidence/bm-exp-contract-comp-01-20260722.md` |
| **spec_ref** | `docs/program/deltas/BMINUTES_AC_MATRIX.md` BM-AC-04-01..05 · Delta AC-CD-F5-* |
| **executed_at** | `2026-07-21` (evidence stamp `20260722`) |
| **ack_status** | **PASS_TO_PM** |

---

## L0 / entry

| Check | Result |
|-------|--------|
| Portal `:8088` HTTP | **200** |
| Login API | **201** (session already present for HRM `/hr/*`) |
| Seed | **None** |
| Command Center `/command-center` | **BLOCKED** — Vite `[plugin:vite:import-analysis] Failed to resolve import "../../data/hrm-recruitment-workflow-presets"` from `CommandCenterPage.tsx` (file missing on VPS; SPA fallback HTML only). **Workaround:** HRM direct `/hr/*` (same host). |
| Cold GET `/compensation-packages/active` | **200** `HRM-COMP-200` (no 500) |

---

## Click path (U65)

1. Open `http://14.225.217.232:8088/hr/employees?tenantId=xevn&companyId=main` (1108 NV).
2. Deep link profile HLD-0006 → tab **Hợp đồng**.
3. **BM-AC-04-01:** **Thêm hợp đồng** → type **Hợp đồng thử việc** · mã `BM04-TV-20260722` · dates 21/07–21/10/2026 · status Hiệu lực · hint visible *«Lương / phụ cấp không nhập trên form HĐ — dùng tab «Đãi ngộ»»* · **no salary field** → **Thêm mới**.
4. Network: `POST /api/hrm/contracts-insurance/contracts` → **201** `HRM-CON-201` · FE list **12 → 13** · row **Hợp đồng thử việc**.
5. Tab **Đãi ngộ** → active package v2 (base 16M + PHU_CAP_AN/XANG) · form vi-VN grouping · probation checkbox **enabled** after HĐ thử việc present.
6. Attempt **Tăng lương / revise** with probation checked → **400** `HRM-COMP-002` (package still linked to prior `fixed_term` HĐ) — see residual.
7. **Tạo gói mới** (same form: base 17.000.000 + probation 13.000.000 + AN 900k + XANG 600k) → `POST …/compensation-packages` → **201** `HRM-COMP-201` · `contract_id=4e15f868-…` (HĐ thử việc) · lines include `probation` + `base` + 2 allowances.
8. Tab **Lịch sử** → timeline **≥3** entries (new v1 with probation + prior CD-FB-08 v2/v1).
9. **F5** profile → **Lịch sử** still shows BM-QA row with `probation: 13.000.000` + `base: 17.000.000`.
10. `/hr/contracts` list loads (1105+) · no salary column · no 409/Sync ERROR · HLD-0006 HĐ thử việc visible.

---

## BM-AC-04-* matrix (browser)

| AC-ID | Evidence | Verdict |
|-------|----------|---------|
| **BM-AC-04-01** | Thêm HĐ thử việc without salary on form; hint to Đãi ngộ; POST **201**; list +13 | **PASS** |
| **BM-AC-04-02** | Create package linked to HĐ thử việc: lines `base:17000000` + `probation:13000000` (GET package by id); History FE shows both after F5. Revise-on-old-package with probation → **400 HRM-COMP-002** (FE enabled / BE rejects) | **PASS** (happy create path) · residual revise parity |
| **BM-AC-04-03** | ≥2 codes `PHU_CAP_AN` + `PHU_CAP_XANG` on package; inputs show `17.000.000` / `13.000.000` grouping | **PASS** (soft: catalog still static — G-BM-04-02) |
| **BM-AC-04-04** | History API total **3**; FE timeline ≥2 versions; F5 persist; append-only (no overwrite of v2 amounts) | **PASS** |
| **BM-AC-04-05** | `/hr/employees/{id}` → Đãi ngộ/Lịch sử; GET packages/active/history **200**; `/hr/contracts` list OK. **P-CC** Command Center path **BLOCKED** by Vite missing file | **PASS** on `/hr` · **COND** for portal embed P-CC |

### L2 / L2.5

| ID | Path | Result |
|----|------|--------|
| **UF-HRM-02** | Profile HĐ create + Đãi ngộ | **PASS** |
| **J-HRM-01** | Contracts list/employee → profile HLD-0006 (via `/hr`) | **PASS** |
| **J-HRM-03** | Contract detail/list under profile | **PASS** |
| **P-CC-04** | `/command-center/hrm/contracts` | **BLOCKED** (portal Vite) |

---

## Network (mutate)

| Step | Method / path | Status / code |
|------|---------------|---------------|
| Create HĐ thử việc | `POST /api/hrm/contracts-insurance/contracts` | **201** `HRM-CON-201` |
| Revise + probation (old pkg) | `POST …/compensation-packages/{id}/revise` | **400** `HRM-COMP-002` |
| Create package + probation | `POST …/compensation-packages` | **201** `HRM-COMP-201` |
| Active | `GET …/compensation-packages/active` | **200** (still prior v2 until new pkg effective_from 2026-07-22) |
| History | `GET …/compensation-history` | **200** total **3** |

New package id: `042f741a-444d-43bc-9972-6a7c7a4722fe` · linked contract `4e15f868-5986-41b3-a73c-86a3205ec9b8`.

---

## Residual

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| **R-BM-04-PORTAL-VITE-PRESETS** | **P0 env** | **devops** | Sync/deploy missing `apps/web/web-portal/src/data/hrm-recruitment-workflow-presets.ts` to `:8088` — blocks all Command Center / P-CC journeys |
| **R-BM-04-COMP-002-REVISE** | P1 | **dev-be** (+ FE if UX) | FE enables probation when *any* HĐ thử việc exists; revise uses *package.contract_id* (fixed_term) → BE `HRM-COMP-002`. Fix: BE check any probation HĐ on employee **or** FE revise should pass/select probation contract |
| **G-BM-04-02** | P2 | fe (prior) | Allowance codes still static mirror — not live XBOS catalog |
| History empty flash | P3 | fe | First open Lịch sử briefly empty/spinner before data — not blocking |

**not promoted:** Phase1 DONE · PROD-READY · P-CC embed green until portal Vite fixed

---

## Handoff

```yaml
work_item_id: BM-QA-CONTRACT-COMP-RETEST-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/bm-qa-contract-comp-retest-01-20260722.md
completion_report: |
  BM-AC-04-01..04 PASS on :8088 via /hr (U65). Created probation HĐ without
  salary-on-contract; allowances on Đãi ngộ package; history ≥3 with F5;
  probation+base persisted on new package linked to HĐ thử việc.
  Residual P0: portal Command Center Vite missing presets file.
  Residual P1: revise+probation → HRM-COMP-002 when active package linked to
  non-probation HĐ.
next_owner: pm
next_dispatch_prompt: |
  work_item_id: D-DO-8088-PORTAL-PRESETS-SYNC-01
  from_role: pm
  to_role: devops
  lane: execution
  priority: P0
  entry_criteria: QA R-BM-04-PORTAL-VITE-PRESETS; file exists in repo apps/web/web-portal/src/data/hrm-recruitment-workflow-presets.ts
  exit_criteria: http://14.225.217.232:8088/command-center loads without Vite import-analysis error; smoke P-CC-04 contracts embed
  evidence_path: docs/qa/evidence/d-do-8088-portal-presets-sync-01-YYYYMMDD.md
  cấm: seed · Phase1/PROD
  then optional: Task dev-be BM-BE-COMP-002-REVISE-PROBATION-01 — BE/FE parity for revise when employee has HĐ thử việc (cite evidence bm-qa-contract-comp-retest-01-20260722.md)
pm_dispatch_hint: D-DO-8088-PORTAL-PRESETS-SYNC-01 (P0) then BM-BE-COMP-002-REVISE-PROBATION-01 (P1)
```
