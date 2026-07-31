# Evidence — QA-REC-HDSD-COVERAGE-01A

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-REC-HDSD-COVERAGE-01A` |
| **parent** | `QA-REC-HDSD-COVERAGE-01` (batch A — U69) |
| **from_role** | qa |
| **to_role** | pm |
| **program** | `P-REC-E2E-13STEP-01` · U76 · U65 |
| **priority** | P0 |
| **Ngày** | 2026-08-01 (runtime UTC 2026-07-31) |
| **hdsd_align** | true |
| **hdsd_sot** | `docs/qa/HDSD_REC_MENU_FUNCTION_INVENTORY.md` §1 rows ~31–69 + `HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md` |
| **env** | **http://14.225.217.232:8088** (prefer) · local `:5173` up but HRM/API stack **not usable** this run |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **u65** | zero-seed · browser-only · **no seed** |
| **ack_status** | **FAIL_TO_PM** |
| **runtime** | `docs/qa/evidence/_tmp-qa-rec-hdsd-coverage-01a-runtime.json` |
| **screens** | `docs/qa/evidence/screens/qa-rec-hdsd-coverage-01a-20260801/` |
| **harness** | `scripts/qa/qa-rec-hdsd-coverage-01a-browser.mjs` · diag `scripts/qa/_tmp-diag-rec-8088.mjs` |

## Verdict summary (Batch A)

| 🟢 | 🟡 | 🔴 | ⬜ | Total inventory rows exercised |
|----|----|----|----|--------------------------------|
| 0 | 0 | **39** | 0 | 39 (entry + 11 tabs + Tin×4 + UV×5 + PV×3 + dash/board/KPI/kanban) |

**Overall Batch A:** **FAIL** — Recruitment module **does not mount** on `:8088`. Tab/submenu/Kanban clicks **not reachable**. Not claiming `QA-REC-HDSD-COVERAGE-01` DONE.

## Root cause (blocker — env/deploy drift)

| Item | Evidence |
|------|----------|
| Symptom | Blank HRM recruitment surface; iframe Command Center stays «Đang tải…» / empty body |
| Browser | `SyntaxError: The requested module '/hr/src/lib/jobRequisitionUi.ts' does not provide an export named 'REQUISITION_EMPTY_JD_LIBRARY_HINT_VI'` |
| Cascade | Lazy `Recruitment.tsx` fails under `PermissionRoute` → all tabs unreachable |
| Remote `:8088` | `GET /hr/src/lib/jobRequisitionUi.ts` **lacks** `REQUISITION_EMPTY_JD_LIBRARY_HINT_VI` / `REQUISITION_JD_TEMPLATE_REQUIRED_VI` / `REQUISITION_OPEN_JD_LIBRARY_CTA_VI` (only older exports: `mapRequisitionStatus`, `REQUISITION_STATUS_LABEL_VI`, …) |
| Local workspace | `apps/web/hrm/src/lib/jobRequisitionUi.ts` **has** the export (L15–16); `JobRequisitionsTab.tsx` imports it |
| Class | **VPS FE stale / partial sync** (same family as prior Vite allow-list / missing-module 500s) — **not** HDSD product_gap on labels |
| Local fallback | Attempted `dev:hrm-api` / `dev:xbos-api` — **failed** (missing `ensure-dist.mjs`, TS missing DTOs). HRM Vite fell to `:8081` while portal proxies `:8080`. **Could not** complete Batch A on local. |

**spec_ref:** HDSD Ch07 §1–§2 inventory · FE neo `Recruitment.tsx` · `jobRequisitionUi.ts`  
**gap_id:** `R-REC-8088-JOBREQ-UI-EXPORT-01`

## L0 / entry

| Check | Result |
|-------|--------|
| Portal `:8088/` | **200** |
| Login API | **OK** (`ceo@xe.vn`) |
| `GET …/api/hrm/recruitment/requisitions` unauth | **401** (API up behind portal) |
| `/hr/recruitment?portal=1&…&tab=dashboard` | Shell loads; **Recruitment lazy FAIL** |
| `/command-center/hrm/recruitment` | CC chrome OK; iframe → `/hr/recruitment?…` **same SyntaxError** |
| Seed | **none** |

### Click path attempted (entry)

1. Auth inject (portal token + `hrm_portal_mode`)  
2. `http://14.225.217.232:8088/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=dashboard`  
3. Alternate: Command Center → iframe HRM Tuyển dụng  
4. Observe blank / SyntaxError — **stop mutate** (01A navigate-only)

---

## HDSD coverage table — Batch A (inventory §1 ≈ L31–69)

Convention: every row **🔴** = blocked by `R-REC-8088-JOBREQ-UI-EXPORT-01` unless noted. Click path = **intended** HDSD path (not completed past entry).

| id | hdsd_ref | HDSD label | maps_to_fe | label note | click_path (intended / attempted) | verdict | detail |
|----|----------|------------|------------|------------|-----------------------------------|---------|--------|
| A-ENTRY | CH07 §1 · Hình 7.0 | Tuyển dụng entry | `recruitment` route | — | login → `/hr/recruitment` **and** CC → iframe | 🔴 | Module not mount · SyntaxError export |
| A-TAB-DASHBOARD | §1 Tab | **Tổng quan** | `dashboard` | FE «Dashboard» = **label_drift** (expected) | click tab Tổng quan / Dashboard | 🔴 | blocked |
| A-TAB-REQ | §1 Tab | **Yêu cầu tuyển dụng** | `requisitions` | khớp HDSD | click tab | 🔴 | blocked |
| A-TAB-JD | §1 Tab | **Thư viện JD** | `jd-library` | khớp | click tab | 🔴 | blocked |
| A-TAB-JOBS | §1 Tab | **Tin tuyển dụng** | `jobs` | FE «Tin Tuyển dụng» | `recruitment-nav-jobs` | 🔴 | blocked |
| A-JOB-ALL | §1 Menu Tin | Tin → **Tất cả** | `jobs/all` | FE «Tất cả tin tuyển dụng» | nav-jobs → menu all | 🔴 | blocked · submenu not reachable |
| A-JOB-ACTIVE | §1 Menu Tin | Tin → **Đang tuyển** | `jobs/active` | FE «Tin đang tuyển» | nav-jobs → active | 🔴 | blocked |
| A-JOB-EXPIRED | §1 Menu Tin | Tin → **Hết hạn** | `jobs/expired` | FE «Tin hết hạn» | nav-jobs → expired | 🔴 | blocked |
| A-JOB-DRAFT | §1 Menu Tin | Tin → **Nháp** | `jobs/draft` | FE «Tin nháp» | nav-jobs → draft | 🔴 | blocked |
| A-TAB-CAND | §1 Tab | **Ứng viên** | `candidates` | — | `recruitment-nav-candidates` | 🔴 | blocked |
| A-UV-ALL | §1 Menu UV | UV → **Tất cả** | `candidates/all` | FE «Tất cả ứng viên» | nav-candidates → all | 🔴 | blocked |
| A-UV-NEW | §1 Menu UV | UV → **Mới** | `candidates/new` | FE «Ứng viên mới» | → new | 🔴 | blocked |
| A-UV-SCREEN | §1 Menu UV | UV → **Sàng lọc** | `candidates/screening` | FE «Đang sàng lọc» | → screening | 🔴 | blocked |
| A-UV-INT | §1 Menu UV | UV → **Phỏng vấn** | `candidates/interview` | FE «Đang phỏng vấn» | → interview | 🔴 | blocked |
| A-UV-HIRED | §1 Menu UV | UV → **Đã tuyển** | `candidates/hired` | — | → hired | 🔴 | blocked |
| A-TAB-PROP | §1 Tab | **Đề xuất định biên** | `proposals` | FE «Đề xuất» = **label_drift** | click tab | 🔴 | blocked |
| A-TAB-CAMP | §1 Tab | **Chiến dịch** | `campaigns` | — | click tab | 🔴 | blocked |
| A-TAB-INT | §1 Tab | **Phỏng vấn** | `interviews` | — | `recruitment-nav-interviews` | 🔴 | blocked |
| A-PV-SCHED | §1 Menu PV | PV → **Đã lên lịch** | `interviews/scheduled` | FE «Lịch phỏng vấn» | nav-interviews → scheduled | 🔴 | blocked |
| A-PV-DONE | §1 Menu PV | PV → **Hoàn thành** | `interviews/completed` | FE «Đã hoàn thành» | → completed | 🔴 | blocked |
| A-PV-CANCEL | §1 Menu PV | PV → **Đã hủy** | `interviews/cancelled` | — | → cancelled | 🔴 | blocked |
| A-TAB-EVAL | §1 Tab | **Đánh giá** | `evaluations` | — | click tab | 🔴 | blocked |
| A-TAB-PLAN | §1 Tab | **Kế hoạch tuyển dụng** | `plans` | FE «Kế hoạch» = **label_drift** | click tab | 🔴 | blocked |
| A-TAB-REP | §1 Tab | **Báo cáo** | `reports` | — | click tab | 🔴 | blocked |
| A-DASH-SUB | §2.1 | Tổng quan → **Dashboard** | `dashboard`+Dashboard | FE Dashboard · HDSD Tổng quan | sub-tab Dashboard | 🔴 | blocked |
| A-BOARD-SUB | §2.1 | Tổng quan → **Bảng Kanban** | `dashboard`+Board | FE «Board tuyển dụng» | sub-tab Board | 🔴 | blocked |
| A-DASH-CTA-JOB | §2 Nút | **Tạo tin tuyển dụng** (+) | jobs create | — | observe CTA (no mutate) | 🔴 | blocked |
| A-DASH-PIPELINE | §2 Pipeline | **Pipeline ứng viên (6 giai đoạn)** | funnel→candidates | — | observe funnel | 🔴 | blocked |
| A-DASH-KPI | §2 KPI | KPI Chỉ tiêu · CV · Đã PV · Đã tuyển | dashboard | — | read KPI | 🔴 | blocked |
| A-DASH-COST | §2 Chi phí | Chi phí TB/UV · TopCV · 24h | dashboard | Empty OK when no data | observe | 🔴 | blocked (would be ⬜ empty if module up) |
| A-DASH-CHART | §2 Biểu đồ | Biểu đồ đường/tròn/cột | dashboard | — | observe | 🔴 | blocked |
| A-DASH-ACTIVITY | §2 Hoạt động | **Hoạt động gần đây** | dashboard | — | observe | 🔴 | blocked |
| A-KANBAN-APPLIED | §2 Cột | Cột **Ứng tuyển** | `applied` | — | Board column | 🔴 | blocked |
| A-KANBAN-SCREEN | §2 Cột | Cột **Sàng lọc** | `screening` | — | Board column | 🔴 | blocked |
| A-KANBAN-INT | §2 Cột | Cột **Phỏng vấn** | `interview` | — | Board column | 🔴 | blocked |
| A-KANBAN-OFFER | §2 Cột | Cột **Offer** | `offer` | FE «Đề xuất» drift | Board column | 🔴 | blocked |
| A-KANBAN-HIRED | §2 Cột | Cột **Đã tuyển** | `hired` | — | Board column | 🔴 | blocked |
| A-KANBAN-REJECT | §2 Cột | Cột **Từ chối** | `rejected` | — | Board column | 🔴 | blocked |
| A-KANBAN-DRAG | §2 Thẻ | Kéo thẻ (Grip) | board | empty→🟡 if no UV | grip attempt | 🔴 | blocked (not empty-data yellow — module down) |

### Submenu coverage acknowledgment (U76)

- **Tin×4** · **UV×5** · **PV×3** — listed above; **not clickable** this env. Retest required after deploy.

### SoftDel / BH / Employees

**Not touched** (dispatch cấm).

---

## completion_report

**Closed**

- Ran browser-only Batch A against prefer URL `:8088` with `ceo@xe.vn`, zero-seed.
- Produced full inventory verdict table for entry + 11 tabs + Tin×4 + UV×5 + PV×3 + Dashboard/Board/KPI/pipeline/charts/activity + 6 Kanban columns + drag.
- Isolated blocker: VPS `jobRequisitionUi.ts` missing `REQUISITION_EMPTY_JD_LIBRARY_HINT_VI` while consumer `JobRequisitionsTab` imports it → Recruitment lazy load SyntaxError.
- Confirmed local workspace has export; remote Vite transform serves older module.
- Did **not** seed; did **not** claim full `COVERAGE-01` DONE; SoftDel/BH/Employees untouched.

**Open / residual**

| ID | Severity | Owner hint | Note |
|----|----------|------------|------|
| `R-REC-8088-JOBREQ-UI-EXPORT-01` | **P0** | devops + dev-fe | Redeploy/sync HRM web so `jobRequisitionUi.ts` matches workspace (exports EMPTY_JD / JD_TEMPLATE_REQUIRED / OPEN_JD_LIBRARY_CTA). Then **re-dispatch QA-REC-HDSD-COVERAGE-01A**. |
| Batch A functional coverage | P0 | qa | All rows remain 🔴 until retest on fixed `:8088` (or healthy local stack). |
| Local stack | P2 | devops | `dev:hrm-api` missing `ensure-dist.mjs`; xbos-api TS missing DTOs — blocked local fallback. |
| 01B / 01C | — | qa (parallel/wait) | Do not promote Batch A greens; synth/QC only after 01A retest PASS. |

## next_owner

`devops` (+ `dev-fe` verify export) → then **`qa` retest `QA-REC-HDSD-COVERAGE-01A`**

## next_dispatch_prompt (copy-ready)

```text
work_item_id: D-REC-8088-JOBREQ-UI-EXPORT-01
from_role: pm
to_role: devops
cc: dev-fe
program: P-REC-E2E-13STEP-01
priority: P0
entry_criteria: QA-REC-HDSD-COVERAGE-01A FAIL — Recruitment blank on http://14.225.217.232:8088
defect: SyntaxError — /hr/src/lib/jobRequisitionUi.ts missing export REQUISITION_EMPTY_JD_LIBRARY_HINT_VI (and related JD empty-library strings). Local apps/web/hrm/src/lib/jobRequisitionUi.ts has export; VPS serves stale module. JobRequisitionsTab imports it → lazy Recruitment.tsx fails.
exit_criteria:
  - curl/browser: named export present in transformed /hr/src/lib/jobRequisitionUi.ts on :8088
  - /hr/recruitment and CC iframe mount 11 tabs (Dashboard visible)
  - evidence: docs/qa/evidence/devops-rec-8088-jobreq-ui-export-01-20260801.md
cấm: seed · không đụng SoftDel/BH/Employees unrelated
after PASS: PM re-dispatch QA-REC-HDSD-COVERAGE-01A (same inventory Batch A) then continue 01B/01C → QC synth
```

## Screens (key)

- `00-entry.png` — blank recruitment  
- `diag-8088.png` / `diag-cc.png` — direct + Command Center  
- Submenu/board shots from harness run are **non-informative** (module down)

## Must keep

- U65 zero-seed  
- SoftDel / BH / Employees out of scope  
- Batch A ≠ full COVERAGE-01
