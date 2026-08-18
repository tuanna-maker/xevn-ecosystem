# Evidence — D-FE-ERP-E1A-CREATE-GAPS-01

| Field | Value |
|-------|--------|
| **work_item_id** | `D-FE-ERP-E1A-CREATE-GAPS-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **date** | 2026-07-28 |
| **lane** | execution E1-A residual after QA-ERP-E1A-01 FAIL |
| **change_mode** | FIX |
| **ack_status** | **READY_FOR_QA** |
| **HOLD_DEPLOY** | yes |
| **U65** | no seed · no `pnpm seed:*` |
| **spec_ref** | `docs/program/deltas/BA_ERP_E1A_SRS_01_20260728.md` · AC-E1A-* · QA `qa-erp-e1a-01-20260728.md` |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| QA FAIL residuals | `docs/qa/evidence/qa-erp-e1a-01-20260728.md` · DEF-E1A-JP-NAV-01 / HCP-SUBMIT-01 / CI-DATE-01 |
| SRS delta | `BA_ERP_E1A_SRS_01_20260728.md` · FR-HRM-MD-BIND-E1A-01 · AC-E1A-JP/HC/CI |
| Prior FE | `d-fe-erp-e1a-picker-01-20260728.md` (must_keep WH/DEC pickers) |
| API_DESIGN | `docs/hrm/API_DESIGN_HRM_MD_BIND_E1A.md` (BE POS-KEY already green) |

---

## Root cause → fix

| Residual | Root cause | Fix |
|----------|------------|-----|
| **DEF-E1A-JP-NAV-01** | Jobs `DropdownMenuContent` portaled to **parent** under `?portal=1` → headless iframe saw **0** `[role=menuitem]`; trigger click did **not** `setActiveTab('jobs')` so create form never mounted (`jobsMounted` false-positive from nav label). | (1) Jobs/Candidates/Interviews: trigger `onClick` → `setActiveTab` immediately; `data-testid=recruitment-nav-jobs` + `recruitment-jobs-menu-*`. (2) `DropdownMenuContent` `portalScope="iframe"` (new prop on primitive, default parent unchanged for dialog menus). |
| **DEF-E1A-HCP-SUBMIT-01** | Zod `requested_by.min(1)` empty on create; QA filled title/pos/dept but not requester → RHF blocked → **no Network**. Label mismatch «Số lượng đề xuất». | Default `requested_by` from `profile.full_name` / email on `handleAddProposal`; label «Số lượng đề xuất (…)»; `data-testid` hcp-*. |
| **DEF-E1A-CI-DATE-01** | Create form: HTML `required` on empty `contract_code` + empty ISO dates + default fixed-term → browser/dates gate short-circuit before POST. | Prefill `HD-yyyyMMdd-####`, today ISO on effective/signing, default type «Hợp đồng không thời hạn»; remove HTML required (JS toast if blank); `data-testid` on ViDateField. |

---

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/ui/dropdown-menu.tsx` | `portalScope` on Content · CODE-MEMORY APPEND |
| `apps/web/hrm/src/pages/Recruitment.tsx` | Jobs/Cand/Interview nav activate + iframe portal + testids · CODE-MEMORY APPEND |
| `apps/web/hrm/src/components/recruitment/HeadcountProposalTab.tsx` | requested_by default + labels/testids · CODE-MEMORY APPEND |
| `apps/web/hrm/src/components/employee/EmployeeContracts.tsx` | create prefill code/dates/type · CODE-MEMORY APPEND |

---

## must_keep (not regressed by this WI)

| Island | Status |
|--------|--------|
| WH / DEC `position_key` create path | **untouched** |
| Leave / EmployeeForm / JobTemplates pickers | **untouched** |
| E1-B Settings MD panel | **untouched** |
| Dialog Select/Popover parent portal default | **kept** (only top-nav menus use iframe scope) |
| F5 salary off contract body · open-ended expiry policy | **kept** |
| A8 contract_types HARDCODE · A9 Candidate | **still residual / deferred** |

---

## Local verify

| Check | Result |
|-------|--------|
| `pnpm exec tsc --noEmit` (apps/web/hrm) | **exit 0** |
| vitest `hrmDialogPortal` + `contractEndDatePolicy` + `viDateField` | **22/22 PASS** |
| Seed | **none** |
| Deploy / :8088 / Phase1 DONE | **not claimed** · HOLD_DEPLOY |

---

## QA entry — `QA-ERP-E1A-01-R2`

Persona: `ceo@xe.vn` · `http://127.0.0.1:5173` · `companyId=main` · U65 browser-only.

| AC | Click path | Network expect |
|----|------------|----------------|
| **A5 JP** | `/hr/recruitment?portal=1` → click `data-testid=recruitment-nav-jobs` (or menuitem `recruitment-jobs-menu-all`) → **Tạo tin tuyển dụng** → pick Vị trí → Lưu | POST `job-postings` **2xx** + `position_key` → F5 label VI |
| **A6 HCP** | Recruitment → Đề xuất → Tạo đề xuất → pick dept+pos → Lưu (Người đề xuất prefilled) | POST `headcount-proposals` **2xx** + `position_key` |
| **A7 CI** | Employee → Hợp đồng → Thêm mới → (mã+ngày prefilled; editable ViDate dd/MM/yyyy) → pick position → Lưu | POST contracts **2xx** + `position_key` → F5 |
| Regression | WH/DEC create still 201; EmployeeForm/Leave/JobTemplates pickers | no break |

**Cấm:** seed · API fake inbox · claim UF green from probe-only.

---

## Handoff

```yaml
work_item_id: D-FE-ERP-E1A-CREATE-GAPS-01
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/d-fe-erp-e1a-create-gaps-01-20260728.md
next_owner: qa
```

### completion_report

**Closed:** DEF-E1A-JP-NAV-01 (iframe portalScope + activate tab on trigger); DEF-E1A-HCP-SUBMIT-01 (requested_by default + label); DEF-E1A-CI-DATE-01 (create prefill code/dates/open-ended + no HTML required). tsc 0 · vitest 22/22. CODE-MEMORY APPEND. U65/HOLD_DEPLOY.

**Open / residual:** A8 contract_types HARDCODE (E2); A9 Candidate deferred; browser R2 not run in this FE lane.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: QA-ERP-E1A-01-R2
from_role: pm
to_role: qa
lane: execution E1-A retest after D-FE-ERP-E1A-CREATE-GAPS-01

entry_criteria:
  - docs/qa/evidence/d-fe-erp-e1a-create-gaps-01-20260728.md READY_FOR_QA
  - L0 stack :5173 + hrm :28001 + xbos :28002
  - U65 zero-seed · HOLD_DEPLOY
  - BE HRM-*-POS-KEY already green — do not re-open BE unless 4xx on valid key

scope:
  Re-run browser A5 JobPostings create → Network position_key → 2xx → F5
  Re-run A6 Headcount create → Network position_key → 2xx
  Re-run A7 Contracts create → Network position_key → 2xx → F5
  Soft-check A5 menuitem count > 0 OR recruitment-nav-jobs activates JobPostingsTab
  Regression: WH/DEC create + EmployeeForm/Leave/JobTemplates pickers still PASS
  Keep A8/A9 residual (do not hardFail)

exit_criteria:
  - evidence docs/qa/evidence/qa-erp-e1a-01-r2-20260728.md
  - ack_status PASS_TO_PM or FAIL_TO_PM with residual IDs
  - script: node scripts/qa/qa-erp-e1a-01-browser.mjs (or R2 copy)
```
