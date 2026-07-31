# QA-REC-13-S2-SUBMIT-INBOX-8088-RET — S2 «Gửi duyệt QT» → Inbox retest on :8088

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-REC-13-S2-SUBMIT-INBOX-8088-RET` |
| **program** | `P-REC-E2E-13STEP-01` · **J-REC-WF-02** · U65 + **U76 HDSD-align** |
| **from_role** | pm → **qa** |
| **date** | 2026-08-01 (runtime UTC 2026-07-31T08:05–08:07Z) |
| **prior FAIL** | `docs/qa/evidence/qa-rec-13-s2-submit-inbox-8088-01-20260801.md` (whitescreen / missing `REQUISITION_EMPTY_JD_LIBRARY_HINT_VI`) |
| **entry** | `DO-REC-8088-JOBREQ-UI-EXPORT-01` READY_FOR_QA · VPS `e3d41b1` · `hasExport=1` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` |
| **URL** | `http://14.225.217.232:8088` |
| **hdsd_align** | **true** · SoT `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md` §3 |
| **ack_status** | **FAIL_TO_PM** |
| **seed** | **none** (U65) |
| **harness** | `scripts/qa/qa-rec-13-s2-submit-inbox-8088-ret-browser.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-qa-rec-13-s2-submit-inbox-8088-ret-runtime.json` |
| **screens** | `docs/qa/evidence/screens/qa-rec-13-s2-submit-inbox-8088-ret-20260801/` |

---

## Verdict (executive)

**FAIL_TO_PM** — prior FE mount blocker **CLOSED**; S2 create + submit-workflow **not** PASS on live `:8088`.

| Layer | Result |
|-------|--------|
| L0 portal `:8088/` | **200** |
| Login `POST /api/xbos/auth/login` | **201** token OK |
| Vite `jobRequisitionUi.ts` | **200 non-SPA ~30KB** · **HAS** `REQUISITION_EMPTY_JD_LIBRARY_HINT_VI` (**CLOSED** vs prior stub) |
| FE `/hr/recruitment?tab=requisitions` | **mounts** · list + «Gửi duyệt QT» visible · `pageErrors=[]` |
| Thêm YCTD → Lưu → POST **201** | **FAIL** — dialog opens; empty JD library (honest UI); `GET /api/hrm/recruitment/job-templates?company_id=main` → **404** · no create POST |
| «Gửi duyệt QT» CTA click (existing row) | **FE wire OK** · POST submit-workflow → **404** `HRM-DATA-404` |
| Inbox task / SPAWN-MISSING | **⬜ not earned** (no 2xx submit) |
| Full 13-step DONE | **not claimed** |
| Historic UF-HRM-12 / local greens | **not demoted** |

---

## What closed vs prior FAIL (`8088-01`)

| Prior residual | This retest |
|----------------|-------------|
| Whitescreen Lazy `SyntaxError` missing `REQUISITION_EMPTY_JD_LIBRARY_HINT_VI` | **CLOSED** — Vite body contains export; requisitions tab renders table + CTA |
| labelMaps UTF-8 | Still **PASS** (unchanged) |
| Create / Gửi duyệt / Inbox | Still **FAIL** — now unblocked to observe deeper BE 404s |

---

## Vite / L0 proof (entry gate)

| URL | HTTP | SPA? | Assert | Verdict |
|-----|------|------|--------|---------|
| `:8088/` | 200 | yes | portal up | **PASS** |
| `:8088/hr/src/lib/jobRequisitionUi.ts` | 200 | false | `REQUISITION_EMPTY_JD_LIBRARY_HINT_VI` present · ~30516 B | **PASS** |
| Login | 201 | — | token | **PASS** |
| `GET …/requisitions?company_id=main` (browser) | 200 | — | list rows | **PASS** |
| `GET …/job-templates?company_id=main` | **404** | — | empty body / Nest miss | **FAIL** |

---

## HDSD coverage (U76) — inventory this wave

SoT: `HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md` §3 Tab **Yêu cầu tuyển dụng**.

| HDSD item | Click path | Verdict | Note |
|-----------|------------|---------|------|
| Menu **Tuyển dụng** | `/hr/recruitment` | 🟢 | |
| Tab **Yêu cầu tuyển dụng** | `?tab=requisitions` | 🟢 | list + helper text «sau Lưu bấm Gửi duyệt QT» |
| **+ Thêm yêu cầu** | `hdsd-requisition-create-btn` | 🟢 | dialog **Tạo yêu cầu tuyển dụng** opens |
| Form Lưu → POST create | UF-HRM-12 | 🔴 | blocked — empty JD + job-templates **404** |
| **Gửi duyệt QT** | row CTA (existing) | 🟡 | clicked · Network **404** (not 2xx) |
| Inbox after submit | `/command-center/inbox` | ⬜ | not earned (U65 no seed) |

---

## Steps (browser-only — U65)

1. Login API `ceo@xe.vn` → inject portal token · `portal=1` · `companyId=main`
2. `/hr/recruitment?tab=requisitions` — **mounts** (screens `02`/`03`)
3. **+ Thêm yêu cầu** → dialog opens (`04-create-dialog.png`)
   - Yellow hints: «Chưa có JD trong thư viện» + «Mở Thư viện JD»
   - `GET /api/hrm/recruitment/job-templates?company_id=main` → **404**
   - **Lưu yêu cầu** → **no** `POST /requisitions` (form gated on JD)
4. Residual: click first row **Gửi duyệt QT** (existing YCTD `8571bd03-…`)
   - `POST /api/hrm/recruitment/requisitions/8571bd03-…/submit-workflow?company_id=holding` → **404**
   - Body: `code=HRM-DATA-404` · message `Cannot POST /api/hrm/recruitment/requisitions/…/submit-workflow?company_id=holding`
5. Inbox visited — **not** a business PASS
6. No `pnpm seed:*` · no inbox seed · no DB fake · no 13-step DONE claim

### Network (this wave)

| Call | Status | Note |
|------|--------|------|
| `GET …/job-templates?company_id=main` | **404** | blocks create |
| `POST …/requisitions` (create) | **none** | |
| `POST …/requisitions/:id/submit-workflow?company_id=holding` | **404** ×2 | FE CTA wired; Nest route missing / stale BE on VPS |
| `GET …/requisitions` | **200** | list OK |

Workspace BE **has** `@Post('requisitions/:requisitionId/submit-workflow')` + `@Get('job-templates')` in `recruitment.controller.ts` — VPS runtime responds Nest **Cannot POST/GET** → **stale hrm-api deploy** class (not SPAWN-MISSING).

Secondary note: submit query used `company_id=holding` while portal inject `main` / UI rollup «Tất cả đơn vị» — scope query skew for FE follow-up after BE route exists.

---

## Exit criteria checklist

| # | Criterion | Result |
|---|-----------|--------|
| 1 | tab=requisitions mounts (no whitescreen) | **PASS** |
| 2 | Thêm YCTD → Lưu → POST **201** | **FAIL** (job-templates 404 + empty JD gate) |
| 3 | «Gửi duyệt QT» → POST submit-workflow **2xx** | **FAIL** (POST **404** after CTA click) |
| 4 | Inbox task OR honest SPAWN-MISSING/empty 🟡 | **⬜ not earned** (no 2xx; not SPAWN-MISSING) |
| 5 | Evidence path | **this file** |
| 6 | PASS_TO_PM or FAIL_TO_PM | **FAIL_TO_PM** |
| 7 | Do not demote UF-HRM-12 | **honored** |
| 8 | completion_report + next_dispatch_prompt | **yes** |

---

## Residuals (for PM)

| ID | Owner | Priority | Action |
|----|-------|----------|--------|
| **DO-REC-13-S2-HRM-API-ROUTES-8088-01** | **devops** (+ **dev-be** verify) | **P0** | Redeploy / recreate `hrm-api` on VPS so Nest serves `GET /api/hrm/recruitment/job-templates` and `POST /api/hrm/recruitment/requisitions/:id/submit-workflow` (workspace controller present; live returns Nest Cannot GET/POST). Prove both routes ≠404 with ceo token. HEAD align `e3d41b1`+ FE already hasExport. |
| **D-REC-13-S2-SUBMIT-COMPANY-QUERY-01** | **dev-fe** | **P1** | After BE routes live: submit uses `company_id=holding` under rollup/`main` session — align query to list scope / row company (must_keep UF-HRM-12). |
| **QA-REC-13-S2-SUBMIT-INBOX-8088-RET** (retest) | **qa** | **P0** | Same AC after API routes live: create 201+F5 → Gửi duyệt QT → submit-workflow **2xx** → Inbox OR honest SPAWN-MISSING 🟡 (U65). |
| Prior jobRequisitionUi export skew | — | — | **CLOSED** this wave |

**Cấm:** seed inbox · claim 13-step DONE · demote UF-HRM-12 / J-REC greens without regression after BE healthy.

---

## Handoff contract

### completion_report

Closed: U65/U76 browser retest on `:8088` after DO jobRequisitionUi export; Vite proof `REQUISITION_EMPTY_JD_LIBRARY_HINT_VI` present; `/hr/recruitment?tab=requisitions` **mounts** (prior whitescreen **CLOSED**); create dialog + empty-JD honest UI observed; CTA «Gửi duyệt QT» clicked; submit-workflow Network **404** `HRM-DATA-404` (Cannot POST) documented; job-templates **404** documented; harness+screens+runtime; no seed; historic UF-HRM-12 **not demoted**; 13-step DONE **not** claimed.

Open: VPS `hrm-api` missing live `job-templates` + `requisitions/:id/submit-workflow` routes → create 201 + submit 2xx + Inbox **not verifiable**. FE company_id=holding on submit is P1 after BE fix.

### next_owner

**devops** (P0 hrm-api route deploy) → **qa** retest same AC · **dev-fe** P1 company query after BE green

### ack_status

**FAIL_TO_PM**

### evidence_path

`docs/qa/evidence/qa-rec-13-s2-submit-inbox-8088-ret-20260801.md`

### next_dispatch_prompt

```text
work_item_id: DO-REC-13-S2-HRM-API-ROUTES-8088-01
from_role: pm | to_role: devops
priority: P0
program: P-REC-E2E-13STEP-01 · residual after QA-REC-13-S2-SUBMIT-INBOX-8088-RET
entry_criteria: QA FAIL_TO_PM · docs/qa/evidence/qa-rec-13-s2-submit-inbox-8088-ret-20260801.md
task: VPS :8088 hrm-api — redeploy/recreate so Nest serves routes already in apps/api/hrm-api recruitment.controller.ts:
  (1) GET /api/hrm/recruitment/job-templates?company_id=main → 200 (not Nest Cannot GET / 404)
  (2) POST /api/hrm/recruitment/requisitions/:id/submit-workflow → not 404 Cannot POST
Prove with ceo@xe.vn bearer. FE hasExport already OK (e3d41b1). No seed. Serialize SoftDel/ViMoney if needed.
exit_criteria: evidence docs/ops/evidence/do-rec-13-s2-hrm-api-routes-8088-01-20260801.md · PASS_TO_PM → PM Task QA-REC-13-S2-SUBMIT-INBOX-8088-RET retest (create 201 + Gửi duyệt QT + submit-workflow 2xx + Inbox U65 / SPAWN-MISSING 🟡).
cấm: pnpm seed:* · inbox seed · claim 13-step DONE · demote UF-HRM-12
parallel_ok: after BE green, optional D-REC-13-S2-SUBMIT-COMPANY-QUERY-01 (dev-fe) if submit still uses company_id=holding under main/rollup.
```