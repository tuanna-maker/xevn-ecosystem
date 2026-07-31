# Evidence — QA-REC-HDSD-COVERAGE-01A-RET

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-REC-HDSD-COVERAGE-01A-RET` |
| **parent** | `QA-REC-HDSD-COVERAGE-01` (batch A — U69) · prior `QA-REC-HDSD-COVERAGE-01A` |
| **from_role** | qa |
| **to_role** | pm |
| **program** | `P-REC-E2E-13STEP-01` · U76 · U65 |
| **priority** | P0 |
| **Ngày** | 2026-08-01 (runtime UTC 2026-07-31) |
| **hdsd_align** | true |
| **hdsd_sot** | `docs/qa/HDSD_REC_MENU_FUNCTION_INVENTORY.md` §1 rows ~31–69 + `HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md` |
| **env** | **http://14.225.217.232:8088** · HEAD ops `e3d41b1` · `jobRequisitionUi` **hasExport=1** |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **u65** | zero-seed · browser-only · **no seed** |
| **ops_entry** | `docs/ops/evidence/do-rec-8088-jobreq-ui-export-01-20260801.md` |
| **prior_fail** | `docs/qa/evidence/qa-rec-hdsd-coverage-01a-20260801.md` (39/39 🔴 mount) |
| **ack_status** | **PASS_TO_PM** |
| **runtime** | `docs/qa/evidence/_tmp-qa-rec-hdsd-coverage-01a-ret-runtime.json` |
| **submenu_spot** | `docs/qa/evidence/_tmp-qa-rec-hdsd-coverage-01a-ret-submenu.json` |
| **screens** | `docs/qa/evidence/screens/qa-rec-hdsd-coverage-01a-ret-20260801/` |
| **harness** | `scripts/qa/qa-rec-hdsd-coverage-01a-browser.mjs` + label-path submenu `_tmp-qa-rec-01a-ret-submenu.mjs` |

## Verdict summary (Batch A retest)

| 🟢 | 🟡 | 🔴 | ⬜ | Total |
|----|----|----|----|-------|
| **36** | **2** | **0** | **1** | **39** |

**Overall Batch A RET:** **PASS** (mount P0 **CLOSED**; inventory exercised; residuals non-blocking for Batch A navigate coverage).

| Closed blocker | Result |
|----------------|--------|
| `R-REC-8088-JOBREQ-UI-EXPORT-01` | **CLOSED** — no `SyntaxError` / missing `REQUISITION_EMPTY_JD_LIBRARY_HINT_VI`; `/hr/recruitment` mounts; `pageErrors: []` on main run |

Probe (pre-browser): `:8088/` **200** · module `jobRequisitionUi.ts` len=30516 · **hasExport=1** · isHtml=0.

## L0 / entry

| Check | Result |
|-------|--------|
| Portal `:8088/` | **200** |
| Login API | **OK** (`ceo@xe.vn`) |
| `GET …/api/hrm/recruitment/requisitions` unauth | **401** |
| `/hr/recruitment?…&tab=dashboard` | **Mounts** — nav tabs visible after warm |
| Seed | **none** |
| SoftDel / BH / Employees | **OOS** (not touched) |

### Click path (entry)

1. Auth inject (portal token + `hrm_portal_mode`)  
2. `http://14.225.217.232:8088/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=dashboard`  
3. Wait for nav labels (cold first paint may skeleton ≤~2s — harness 1800ms alone can false-miss; label wait / subsequent tabs confirm)  
4. Observe Dashboard + 11-tab strip — **no SyntaxError**

---

## HDSD coverage table — Batch A (inventory §1 ≈ L31–69)

| id | hdsd_ref | HDSD label | maps_to_fe | label note | click_path | verdict | detail |
|----|----------|------------|------------|------------|------------|---------|--------|
| A-ENTRY | CH07 §1 · Hình 7.0 | Tuyển dụng entry | `recruitment` | — | login → `/hr/recruitment` | 🟢 | Mount OK (spot+submenu confirm; cold race on first harness shot demoted) |
| A-TAB-DASHBOARD | §1 Tab | **Tổng quan** | `dashboard` | FE «Dashboard» **label_drift** | deeplink / tab | 🟢 | panel visible |
| A-TAB-REQ | §1 Tab | **Yêu cầu tuyển dụng** | `requisitions` | khớp | click tab | 🟢 | |
| A-TAB-JD | §1 Tab | **Thư viện JD** | `jd-library` | khớp | deeplink | 🟢 | |
| A-TAB-JOBS | §1 Tab | **Tin tuyển dụng** | `jobs` | FE «Tin Tuyển dụng» | click tab label | 🟢 | |
| A-JOB-ALL | §1 Menu Tin | Tin → **Tất cả** | `jobs/all` | FE «Tất cả tin tuyển dụng» | `button«Tin Tuyển dụng»` → menuitem | 🟢 | label path (VPS **no** `data-testid`) |
| A-JOB-ACTIVE | §1 Menu Tin | Tin → **Đang tuyển** | `jobs/active` | FE «Tin đang tuyển» | → menuitem | 🟢 | |
| A-JOB-EXPIRED | §1 Menu Tin | Tin → **Hết hạn** | `jobs/expired` | FE «Tin hết hạn» | → menuitem | 🟢 | |
| A-JOB-DRAFT | §1 Menu Tin | Tin → **Nháp** | `jobs/draft` | FE «Tin nháp» | → menuitem | 🟢 | |
| A-TAB-CAND | §1 Tab | **Ứng viên** | `candidates` | — | click tab | 🟢 | |
| A-UV-ALL | §1 Menu UV | UV → **Tất cả** | `candidates/all` | FE «Tất cả ứng viên» | `button«Ứng viên»` → menuitem | 🟢 | |
| A-UV-NEW | §1 Menu UV | UV → **Mới** | `candidates/new` | FE «Ứng viên mới» | → menuitem | 🟢 | |
| A-UV-SCREEN | §1 Menu UV | UV → **Sàng lọc** | `candidates/screening` | FE «Đang sàng lọc» | → menuitem | 🟢 | |
| A-UV-INT | §1 Menu UV | UV → **Phỏng vấn** | `candidates/interview` | FE «Đang phỏng vấn» | → menuitem | 🟢 | |
| A-UV-HIRED | §1 Menu UV | UV → **Đã tuyển** | `candidates/hired` | — | → menuitem | 🟢 | |
| A-TAB-PROP | §1 Tab | **Đề xuất định biên** | `proposals` | FE «Đề xuất» **label_drift** | click tab | 🟢 | |
| A-TAB-CAMP | §1 Tab | **Chiến dịch** | `campaigns` | — | click tab | 🟢 | |
| A-TAB-INT | §1 Tab | **Phỏng vấn** | `interviews` | — | click tab | 🟢 | |
| A-PV-SCHED | §1 Menu PV | PV → **Đã lên lịch** | `interviews/scheduled` | FE «Lịch phỏng vấn» | `button«Phỏng vấn»` → menuitem | 🟢 | |
| A-PV-DONE | §1 Menu PV | PV → **Hoàn thành** | `interviews/completed` | FE «Đã hoàn thành» | → menuitem | 🟢 | |
| A-PV-CANCEL | §1 Menu PV | PV → **Đã hủy** | `interviews/cancelled` | — | → menuitem | 🟢 | |
| A-TAB-EVAL | §1 Tab | **Đánh giá** | `evaluations` | — | click tab | 🟢 | |
| A-TAB-PLAN | §1 Tab | **Kế hoạch tuyển dụng** | `plans` | FE «Kế hoạch» **label_drift** | click tab | 🟢 | |
| A-TAB-REP | §1 Tab | **Báo cáo** | `reports` | — | click tab | 🟢 | |
| A-DASH-SUB | §2.1 | Tổng quan → **Dashboard** | `dashboard` | label_drift | sub-tab Dashboard | 🟢 | funnel/KPI |
| A-BOARD-SUB | §2.1 | Tổng quan → **Bảng Kanban** | Board | FE «Board tuyển dụng» | sub-tab Board | 🟢 | |
| A-DASH-CTA-JOB | §2 Nút | **Tạo tin tuyển dụng** (+) | jobs create | observe only | observe CTA | 🟢 | no mutate |
| A-DASH-PIPELINE | §2 Pipeline | Pipeline ứng viên | funnel | stages_seen=4 | observe | 🟢 | |
| A-DASH-KPI | §2 KPI | KPI Chỉ tiêu · CV · Đã PV · Đã tuyển | dashboard | kpi 4/4 | read | 🟢 | |
| A-DASH-COST | §2 Chi phí | Chi phí TB/UV · TopCV · 24h | dashboard | Empty OK | observe | ⬜ | cost block hidden when no data |
| A-DASH-CHART | §2 Biểu đồ | Biểu đồ | dashboard | — | observe | 🟢 | |
| A-DASH-ACTIVITY | §2 Hoạt động | **Hoạt động gần đây** | dashboard | — | observe | 🟢 | |
| A-KANBAN-APPLIED | §2 Cột | Cột **Ứng tuyển** | `applied` | — | Board | 🟢 | visible · count 0 |
| A-KANBAN-SCREEN | §2 Cột | Cột **Sàng lọc** | `screening` | — | Board | 🟢 | |
| A-KANBAN-INT | §2 Cột | Cột **Phỏng vấn** | `interview` | — | Board | 🟢 | |
| A-KANBAN-OFFER | §2 Cột | Cột **Offer** | `offer` | FE «Đề xuất» drift | Board | 🟢 | |
| A-KANBAN-HIRED | §2 Cột | Cột **Đã tuyển** | `hired` | — | Board | 🟢 | |
| A-KANBAN-REJECT | §2 Cột | Cột **Từ chối** | `rejected` | — | Board | 🟡 | **product_gap** — FE Board shows **5** columns only (no «Từ chối») |
| A-KANBAN-DRAG | §2 Thẻ | Kéo thẻ (Grip) | board | empty | attempt grip | 🟡 | empty board · no drag handle (U65 zero-seed) |

### Submenu coverage acknowledgment (U76)

- **Tin×4 · UV×5 · PV×3** — all **🟢** via visible tab button + `[role=menuitem]` (VPS Vite transform: `testid_count=0` for `recruitment-nav-jobs`; first harness pass false-🟡 using testid-only).

### SoftDel / BH / Employees

**Not touched** (dispatch cấm).

---

## Harness notes (non-product)

| Issue | Impact | Mitigation used |
|-------|--------|-----------------|
| Cold first paint ~1.8s skeleton | A-ENTRY false 🔴 on first harness | Spot wait + later tabs / submenu confirm → 🟢 |
| VPS missing `data-testid` on jobs/cand/int nav | testid harness 🟡 | Label-path submenu retest → 🟢 |
| React key warning on `Recruitment` | console only | not FAIL |

---

## completion_report

**Closed**

- Retest Batch A on `:8088` after `DO-REC-8088-JOBREQ-UI-EXPORT-01` (HEAD `e3d41b1`, hasExport=1).
- Mount P0 **CLOSED** — no SyntaxError; Recruitment lazy loads; 11 tabs + Tin×4 + UV×5 + PV×3 + Dashboard/Board/KPI/charts/activity exercised browser-only, zero-seed.
- Inventory **36🟢 · 2🟡 · 0🔴 · 1⬜** (39 rows). SoftDel/BH OOS.
- Did **not** claim parent `QA-REC-HDSD-COVERAGE-01` DONE alone — needs 01B-RET + 01C synth for QC.

**Open / residual**

| ID | Severity | Owner hint | Note |
|----|----------|------------|------|
| `R-REC-KANBAN-REJECT-COL-01` | P2 | dev-fe / ba | HDSD §2 expects cột **Từ chối**; FE Board = 5 cols (Ứng tuyển…Đã tuyển). product_gap. |
| `R-REC-KANBAN-DRAG-EMPTY` | P3 | — | Drag not exercisable without UV cards (U65). Keep 🟡 empty. |
| A-DASH-COST | — | — | ⬜ empty OK |
| VPS testid drift | P3 | dev-fe | Optional: ship `data-testid` on nav for stable automation |

**Not claiming:** SoftDel/BH · Batch B/C · QC GO.

## next_owner

`pm` — if **01B-RET** + **01C** already **PASS_TO_PM** → dispatch **`QC-REC-HDSD-U76-SPOT`**; else wait/intake parallel 01B-RET.

## next_dispatch_prompt (copy-ready)

```text
work_item_id: QC-REC-HDSD-U76-SPOT
from_role: pm | to_role: qc
program: P-REC-E2E-13STEP-01 · U76 · U65
priority: P1
entry_criteria:
  - QA-REC-HDSD-COVERAGE-01A-RET PASS_TO_PM · docs/qa/evidence/qa-rec-hdsd-coverage-01a-ret-20260801.md (36🟢/2🟡/0🔴/1⬜ · mount CLOSED)
  - QA-REC-HDSD-COVERAGE-01B-RET PASS_TO_PM (confirm evidence)
  - QA-REC-HDSD-COVERAGE-01C PASS_TO_PM · docs/qa/evidence/qa-rec-hdsd-coverage-01c-20260801.md
exit_criteria:
  - Spot-audit HDSD Batch A/B/C evidence · no probe-only PASS · U65 zero-seed
  - GO / GWC with residual list (Kanban Từ chối P2 · drag empty P3)
  - evidence: docs/qa/evidence/qc-rec-hdsd-u76-spot-20260801.md
cấm: seed · SoftDel/BH demote · claim clean GO if 01A/B/C any 🔴
```

If 01B-RET **not** PASS yet:

```text
work_item_id: (intake) QA-REC-HDSD-COVERAGE-01B-RET
from_role: pm | to_role: qa|pm
note: hold QC-REC-HDSD-U76-SPOT until 01B-RET PASS_TO_PM; 01A-RET mount CLOSED unblocks Batch B forms
```

## ack_status

**PASS_TO_PM**

## pm_dispatch_hint

`QC-REC-HDSD-U76-SPOT` after 01A-RET + 01B-RET + 01C all PASS — residual P2 Kanban «Từ chối» column gap.
