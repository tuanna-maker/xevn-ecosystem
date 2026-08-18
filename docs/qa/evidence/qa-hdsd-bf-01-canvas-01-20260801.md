# QA-HDSD-BF-01-CANVAS-01 — BF-01 parallel prep (Canvas QT → YCTD spot)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HDSD-BF-01-CANVAS-01` |
| **program** | `P-HDSD-QA-SRS-01` · BF-01 · Đ0 parallel |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | Canvas **PASS** · YCTD spot **BLOCKED** (form-ready — not inbox) |
| **executed_at** | 2026-08-01 ~00:58–01:00 ICT |
| **URL** | `http://127.0.0.1:5173` |
| **persona** | Group CEO `ceo@xe.vn` / `company_id=main` |
| **U65** | zero-seed · browser Puppeteer · no seed |
| **spec_ref** | `HDSD_BUSINESS_FLOW_ORCHESTRATION.md` BF-01 · **J-REC-WF-01** · **J-REC-WF-02** spot |
| **runtime** | `docs/qa/evidence/_tmp-qa-hdsd-bf-01-canvas-01-runtime.json` |
| **harness** | `scripts/qa/qa-hdsd-bf-01-canvas-01-browser.mjs` |

---

## Executive summary

**PASS_TO_PM (parallel prep scope)** — XBOS Settings workflow canvas for **QT tuyển dụng** (`hrm_requisition_approval`) opened via preset testid, **Lưu quy trình** → **POST 201** `XBOS-WF-201`, F5 reload definitions **GET 200**. HRM embed **YCTD create/send** spot: dialog opens but **`hdsd-requisition-form-ready` never appears** → no POST / no **Gửi duyệt QT** — **BLOCKED** (catalog/form hydrate carry `R-QA-YCTD-CATALOG-PICKER-01`, **not** inbox/seed). No seed used.

---

## L0

| Gate | Exit | Notes |
|------|------|-------|
| `pnpm run qc:dev-stack` | **0** | hrm-api :28001 · xbos-api :28002 · portal :5173 HTTP 200 |
| `pnpm run qc:fe-be-health` | **0** | ALL PASS — proxy HRM employees + catalog-sync |

---

## Verdict matrix

| ID | Criterion | Verdict | Notes |
|----|-----------|---------|-------|
| **J-REC-WF-01** | CC → Canvas QT tuyển dụng active → Lưu → F5 | **🟢 PASS** | Preset `hrm-rec-wf-preset-requisition` → detail → POST 201 → F5 GET defs 200 |
| **J-REC-WF-02-spot** | HRM Tuyển dụng → Tạo YCTD → Lưu → Gửi duyệt QT | **🟡 BLOCKED** | Form dialog opens; `formReady=false`; POST none; submitWF none |
| **UF-XBOS-10** | Workflow settings load | **🟢** | Bridge presets visible · definitions list 200 |
| **UF-HRM-07** | YCTD mutate | **🟡 BLOCKED** | JD library has 1 row; requisition form not ready |

---

## J-REC-WF-01 — Canvas QT tuyển dụng (U65 browser)

### Click path

```
Login ceo@xe.vn → http://127.0.0.1:5173/command-center?settings=workflow
→ Bridge «Phê duyệt yêu cầu tuyển dụng HRM» [data-testid=hrm-rec-wf-preset-requisition]
→ Canvas detail (hrm_requisition_approval)
→ Lưu quy trình
→ FE persist toast path
→ F5 same URL → reopen preset → definitions still listed
```

### Network

```http
POST /api/xbos/workflow-engine/definitions
→ 201 (save after preset open — active hrm_requisition_approval path)

GET /api/xbos/workflow-engine/definitions
→ 200 XBOS-WF-200 (before + after F5)
```

### FE after 2xx

| Check | Result |
|-------|--------|
| Save clicked | yes (`Lưu quy trình`) |
| PUT/POST definition | **201** |
| F5 list | GET definitions **200** |
| must_keep spawn | Did not change member apply scope; preset bridge only |

Screens: `docs/qa/evidence/screens/hdsd-bf-01-canvas-01-20260801/canvas-*.png`, `03-after-save.png`, `04-after-f5.png`

---

## J-REC-WF-02-spot — YCTD create/send (partial)

### Click path

```
/hr/recruitment?tab=requisitions?portal=1&tenantId=xevn&companyId=main
→ #hdsd-requisition-create-btn
→ dialog #hdsd-requisition-form-dialog opens
→ pick JD template (combo / hdsd-requisition-job-template)
→ wait #hdsd-requisition-form-ready — TIMEOUT (never appeared)
→ Lưu skipped (form not ready)
→ Gửi duyệt QT — no row to send
```

### Network

| Step | Method | Status |
|------|--------|--------|
| JD library | GET `/api/hrm/recruitment/job-templates?company_id=main` | 200 (1 row) |
| Requisitions list | GET `/api/hrm/recruitment/requisitions?...` | 200 |
| Create YCTD | POST requisition | **none** |
| Submit workflow | POST submit-workflow | **none** |

### Blocker class

| Not | Because |
|-----|---------|
| Inbox empty | Did not reach submit-workflow — **no YCTD created** |
| Seed cheat | U65 — no seed |
| SPAWN-MISSING banner | Not observed (no submit attempted) |

**Root cause (carry):** `hdsd-requisition-form-ready` absent — same class as `qa-hdsd-mutate-ret-03-hrm-r2` / FE-05 `R-QA-YCTD-CATALOG-PICKER-01`. One transient GET `company-subscription` **500** during HRM embed (recovered on retry).

Screens: `05-requisitions-list.png` · `06-yctd-form-ready.png` · `07-yctd-after-f5.png` · `08-after-send-qt.png`

---

## Console

- 1× `Failed to load resource: 500` on `/api/hrm/company-subscription?company_id=main` (transient; subsequent GET 200)

---

## Residual / not promoted

| Item | Severity | Owner | Note |
|------|----------|-------|------|
| YCTD `formReady=false` — no POST | **P1** | dev-fe | `D-HDSD-MUTATE-FE-05` / `R-QA-YCTD-CATALOG-PICKER-01` — retest in `QA-HDSD-MUTATE-RET-03-HRM-R3` or BF-01-01 |
| J-REC-WF-03 inbox duyệt | — | qa (Đ3) | Out of scope this WI — requires YCTD submit first (U65) |
| F5 canvas dots selector | P3 | — | Visual dots not detected post-F5; list GET + preset reopen sufficient for J-REC-WF-01 |

**Promoted for BF-01 prep:** J-REC-WF-01 canvas active + save persist 🟢  
**Not promoted:** Full BF-01 e2e (YCTD → inbox → funnel) — blocked at YCTD form

---

## completion_report

**Closed:** J-REC-WF-01 canvas QT tuyển dụng — preset open, Lưu POST 201, F5 definitions 200 (U65, :5173, L0 PASS).

**Open:** YCTD create/send spot BLOCKED at form-ready gate — document for parallel Đ0; **no seed**; inbox not tested (no requisition to submit).

---

## next_owner

`pm` → chain **dev-fe** if R3 mutate still FAIL on YCTD, else **qa** `QA-HDSD-BF-01-01` full BF-01 e2e

---

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-03-HRM-R3
from_role: pm | to_role: qa
entry_criteria: docs/qa/evidence/d-hdsd-mutate-fe-05-20260801.md READY_FOR_QA; L0 :5173 exit 0; QA-HDSD-BF-01-CANVAS-01 canvas 🟢
exit_criteria: TC-HDSD-07-02-01 hdsd-requisition-form-ready → POST 2xx; then QA-HDSD-BF-01-01 can run YCTD→inbox U65
residual: R-QA-YCTD-CATALOG-PICKER-01 from qa-hdsd-bf-01-canvas-01-20260801.md
ack_status: PASS_TO_PM or FAIL_TO_PM
```

---

## Handoff

```yaml
work_item_id: QA-HDSD-BF-01-CANVAS-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qa-hdsd-bf-01-canvas-01-20260801.md
pm_dispatch_hint: Canvas prep 🟢 — unblock YCTD via RET-03-HRM-R3 or dev-fe FE-05 residual before QA-HDSD-BF-01-01 full path
```
