# Evidence — PO-E2E-SPINE-01-QA-W2 (Hire-to-Pay Web retest)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-SPINE-01-QA-W2` |
| **program** | `PO-E2E-BIZ-SPINE-01` · spine **E2E-SPINE-01** |
| **executor** | qa |
| **date** | 2026-08-03 |
| **env** | local NFD · portal `:5173` · HRM Vite `:8080` · hrm-api `:28001` · xbos-api `:28002` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · member probe `du-lich.ceo@xe.vn` |
| **U65** | zero-seed · **no** `pnpm seed:*` · **no** prior-task inbox approve |
| **BA matrix** | `docs/qa/evidence/po-e2e-ba-case-matrix-01.md` HP-01..06 |
| **prior** | W1 `FAIL_TO_PM` mount · FE `po-e2e-spine-01-fe-rec-mount.md` READY_FOR_QA |
| **harness** | `scripts/qa/po-e2e-spine-01-qa-w2-browser.mjs` |
| **raw** | `docs/qa/evidence/_tmp-po-e2e-spine-01-qa-w2-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-e2e-spine-01-qa-w2-20260803/` (21 PNG) |
| **test_log** | `docs/qa/evidence/po-e2e-spine-01-qa-w2-test-log.md` + `.json` |
| **stamp** | `SP2SDD8FM8` |
| **ack_status** | **PASS_TO_PM** |

## spec_read_ack

- program: `PO_E2E_BUSINESS_SPINE_PROGRAM.md` § E2E-SPINE-01
- FE fix: `po-e2e-spine-01-fe-rec-mount.md` — JobTemplatesTab restore
- journeys: J-REC-WF-01..04 · J-HRM-01/02/03/05/07
- UF: UF-HRM-12 · UF-XBOS-08
- BA: HP-01..06
- hdsd_align: CC Workflow → HRM Tuyển dụng → Inbox (this-wave only) → Ứng viên → NV/HĐ → Lương
- U65 · U78 · anti-idle · Leave/AUTH/EMP/CAT CLOSED not reopened

## 1. L0 + Vite mount probes

| Probe | Result |
|-------|--------|
| `GET :28001/api/hrm` | **200** |
| `GET :28002/api/xbos` | **200** |
| Portal `:5173` | **200** |
| HRM Vite `:8080` | **200** |
| `GET :5173/hr/src/pages/Recruitment.tsx` | **200** (was 500 on W1) |
| `GET :5173/hr/src/components/recruitment/JobTemplatesTab.tsx` | **200** |
| `GET :8080/hr/src/pages/Recruitment.tsx` | **200** |
| `GET :8080/.../JobTemplatesTab.tsx` | **200** |

## 2. Browser spine (46 clicks · idle_guard PASS · seed=false)

| Step | Case | Verdict | Evidence |
|------|------|---------|----------|
| **SP1** WF smoke | HP-01 · J-REC-WF-01 | 🟢 | CC `settings=workflow` · GET definitions **200** · Lưu · F5 still shows tuyển dụng |
| **SP2-MOUNT** | R-PO-SPINE01-REC-MOUNT | 🟢 | `/hr/recruitment` chrome tabs visible · `#root` children=4 · **no** Vite JobTemplatesTab error |
| **SP2** YCTD create/submit/F5 | HP-02 · UF-HRM-12 · J-REC-WF-02 | 🟢 | POST requisitions **201** `HRM-REC-201` id=`34a421e7-…` · F5 stamp row · POST submit-workflow **201** `HRM-REC-WF-200` · `workflowInstanceId=5590cbb1-…` · `spawnMissing=false` |
| **SP3** Inbox duyệt | HP-03 · UF-XBOS-08 · J-REC-WF-03 | 🟡 | Prior tuyển tasks may exist · **this-wave stamp absent** · **no** approve (U65 — cấm prior-task complete) |
| **SP4** Candidate/hire | HP-04 · J-REC-WF-04 | 🟡 | Candidates tab **mounts** (W1 whitescreen CLOSED) · open create CTA · POST candidate not observed 2xx · hire incomplete upstream |
| **SP5** Emp + contracts | HP-05 · J-HRM-01/02/03 | 🟡 | Employees list/detail OK · stamp new-hire absent · contracts surface weak |
| **SP6** Payroll | HP-06 · J-HRM-07 | 🟡 | CC `hrm/payroll` loads · stamp absent · **not** blocking mount PASS (P1 residual) |
| **SP-MEM** | scope | 🟢 | Member `/hr/recruitment?companyId=xe-du-lich` mounts (W1 same mount fail CLOSED) |

### Click path (executed)

1. Inject portal auth ceo → `:5173`
2. CC Workflow → search tuyển → open → Lưu → F5
3. `/hr/recruitment` jd-library (mount assert) → create JD → requisitions → Thêm yêu cầu → Lưu → F5 → Gửi duyệt
4. `/command-center/inbox` → observe **no** this-wave stamp → **skip** Duyệt
5. `/hr/recruitment?tab=candidates` → hire attempt
6. `/hr/employees` → row → detail → `/hr/contracts`
7. payroll paths → F5
8. member recruitment probe

### Closed vs W1

| Residual W1 | W2 |
|-------------|-----|
| **R-PO-SPINE01-REC-MOUNT** P0 | **CLOSED** — Vite 200 + browser mount chrome |
| HP-02 create blocked | **CLOSED** — POST 201 + submit 201 + F5 |
| Candidates whitescreen | **CLOSED** mount; hire CTA still 🟡 product/upstream |

## 3. Verdict matrix

| Gate | Result |
|------|--------|
| L0 stack | 🟢 PASS |
| Vite JobTemplatesTab resolve | 🟢 PASS |
| HP-01 / J-REC-WF-01 | 🟢 PASS |
| HP-02 / UF-HRM-12 create+submit+F5 | 🟢 PASS |
| HP-03 this-wave Inbox approve | 🟡 BLOCKED (U65 — stamp not in ceo inbox; no seed) |
| HP-04 hire | 🟡 partial (mount OK; create/hire incomplete) |
| HP-05 emp detail | 🟡 partial (list/detail OK; no new hire stamp) |
| HP-06 payroll | 🟡 residual P1 (shell/content honesty) |
| Member recruitment mount | 🟢 PASS |
| Seed | 🟢 none |
| idle_guard | 🟢 46 clicks |
| Phase1 / UAT DONE claim | 🟢 **not** claimed |

**Overall:** `PASS_TO_PM` — P0 mount + HP-02 closed; hire-to-pay full chain not UAT DONE.

## 4. Residuals → PM dispatch

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-PO-SPINE01-INBOX-THISWAVE** | P1 | **dev-be** (+ SA if assignee) | submit-workflow **201** + `workflowInstanceId` but Inbox for `ceo@xe.vn` **no** stamp `SP2SDD8FM8` / title — check assignee vs Group CEO · `company_id=holding` on submit URL vs `main` list |
| R-PO-SPINE01-CAND-HIRE | P1 | dev-fe | Candidates mount OK; create/hire POST not observed — form/CTA after approve gate |
| R-PO-SPINE01-PAYROLL-BLANK | P1 | dev-fe | CC payroll pane honesty (empty reason) — FR-UC-H04 · **not** reopen mount |
| R-PO-SPINE01-CONTRACTS-UI | P2 | qa/dev-fe | contracts surface weak this run |
| must_keep | — | — | Leave / AUTH / EMP / CAT CLOSED lanes **not** reopened |

## 5. Handoff

```
ack_status: PASS_TO_PM
next_owner: pm
evidence_path: docs/qa/evidence/po-e2e-spine-01-qa-w2.md
test_log: docs/qa/evidence/po-e2e-spine-01-qa-w2-test-log.md + .json
next_dispatch_prompt: see completion_report below
```
