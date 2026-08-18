# Evidence — PO-E2E-SPINE-01-QA-W1 (Hire-to-Pay Web)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-SPINE-01-QA-W1` |
| **program** | `PO-E2E-BIZ-SPINE-01` · spine **E2E-SPINE-01** |
| **executor** | qa |
| **date** | 2026-08-03 |
| **env** | local NFD · portal `:5173` · HRM Vite `:8080` · hrm-api `:28001` · xbos-api `:28002` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · member probe `du-lich.ceo@xe.vn` |
| **U65** | zero-seed · **no** `pnpm seed:*` · **no** API mutate for inbox |
| **BA matrix** | `docs/qa/evidence/po-e2e-ba-case-matrix-01.md` HP-01..06 |
| **harness** | `scripts/qa/po-e2e-spine-01-qa-w1-browser.mjs` |
| **raw** | `docs/qa/evidence/_tmp-po-e2e-spine-01-qa-w1-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-e2e-spine-01-qa-w1-20260803/` (20 PNG) |
| **test_log** | `docs/qa/evidence/po-e2e-spine-01-qa-w1-test-log.md` + `.json` |
| **stamp** | `SP1SDCGSBZ` |
| **ack_status** | **FAIL_TO_PM** |

## spec_read_ack

- program: `PO_E2E_BUSINESS_SPINE_PROGRAM.md` § E2E-SPINE-01
- journeys: J-REC-WF-01..04 · J-HRM-01/02/03/05/07
- UF: UF-HRM-12 · UF-XBOS-08
- BA: HP-01..06 (`po-e2e-ba-case-matrix-01.md`)
- hdsd_align: CC Workflow → HRM Tuyển dụng → Inbox Duyệt → Ứng viên/hire → NV/HĐ → Lương
- U65 · U78 · anti-idle · Leave GWC not reopened

## 1. L0 stack

| Probe | Result |
|-------|--------|
| `GET :28001/api/hrm` | **200** |
| `GET :28002/api/xbos` | **200** (pre-existing process; restart attempt hit `dist/main` MODULE_NOT_FOUND — ops residual) |
| Portal `:5173` | **200** |
| HRM Vite `:8080` | **200** |
| `GET :5173/hr/src/pages/Recruitment.tsx` | **500** — Vite resolve fail (see residual) |
| `GET :5173/hr/src/pages/Employees.tsx` | **200** |

## 2. Browser spine (24 clicks · idle_guard PASS)

| Step | Case | Verdict | Evidence |
|------|------|---------|----------|
| **SP1** WF smoke | HP-01 · J-REC-WF-01 | 🟢 | CC `settings=workflow` · GET definitions **200** · PUT definition **200** · F5 still shows tuyển dụng |
| **SP2** YCTD create/submit | HP-02 · UF-HRM-12 · J-REC-WF-02 | 🔴 | `/hr/recruitment` **whitescreen** · **no** POST requisitions · stamp not created |
| **SP3** Inbox duyệt | HP-03 · UF-XBOS-08 · J-REC-WF-03 | 🟡* | Inbox had pre-existing tuyển dụng tasks · POST `…/tasks/…/complete` **201** · **not** chained from this-wave YCTD (SP2 failed) |
| **SP4** Candidate/hire | HP-04 · J-REC-WF-04 | 🟡 | Candidates tab whitescreen (same Recruitment.tsx chunk) · no hire CTA |
| **SP5** Emp + contracts | HP-05 · J-HRM-01/02/03 | 🟡 | Employees list **43** rows · GET list/detail **200** · detail `…/employees/84df5edb-…` · **no** new-hire stamp · contracts surface weak this run |
| **SP6** Payroll | HP-06 · J-HRM-07 | 🟡 | CC `hrm/payroll` shell loads · main pane blank (no honest empty copy) · stamp absent · `/hr/salary` 404 route |
| **SP-MEM** | scope | 🟡 | Member `/hr/recruitment?companyId=xe-du-lich` — same Recruitment mount fail |

\*SP3 not claimed as spine-chain 🟢 for hire-to-pay; approve proves Inbox complete path only.

### Click path (executed)

1. Inject portal auth ceo → `:5173`
2. CC Workflow → search tuyển → open → Lưu → F5
3. `/hr/recruitment` jd-library + requisitions → create attempt → F5
4. `/command-center/inbox` → Xử lý/Duyệt → POST complete 201 → F5
5. `/hr/recruitment?tab=candidates` → hire attempt
6. `/hr/employees` → row → detail → `/hr/contracts`
7. payroll paths → F5
8. member recruitment probe

### Root cause (P0)

```
Failed to resolve import "@/components/recruitment/JobTemplatesTab"
  from "src/pages/Recruitment.tsx"
```

→ Vite **500** on `Recruitment.tsx` → React Lazy/Suspense crash under `PermissionRoute` → blank page → **blocks HP-02/04** (UF-HRM-12 live mutate).

## 3. Verdict matrix

| Gate | Result |
|------|--------|
| L0 stack | 🟢 PASS |
| HP-01 / J-REC-WF-01 | 🟢 PASS |
| HP-02 / UF-HRM-12 create+F5 | 🔴 FAIL (Recruitment mount) |
| HP-03 chain from this YCTD | 🔴 blocked by HP-02 (Inbox complete 201 on **prior** task only) |
| HP-04 hire | 🔴/🟡 blocked mount |
| HP-05 emp detail | 🟡 partial (list/detail 200; no new hire) |
| HP-06 payroll | 🟡 shell only / blank pane |
| Seed | 🟢 none |
| idle_guard | 🟢 24 clicks |
| Phase1 / UAT DONE claim | 🟢 **not** claimed |

**Overall:** `FAIL_TO_PM`

## 4. Residuals → PM dispatch

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-PO-SPINE01-REC-MOUNT** | **P0** | **dev-fe** | Restore `JobTemplatesTab` (or fix import) so `Recruitment.tsx` resolves on `:5173`/`:8080` — same class as prior LeaveOverview / Fleet missing-module |
| R-PO-SPINE01-PAYROLL-BLANK | P1 | dev-fe | CC HRM payroll content blank — need list/empty reason (FR-UC-H04) |
| R-PO-XBOS-DIST-MAIN | P2 | devops | `pnpm dev:xbos-api` crash `Cannot find module …/dist/main` when watch rebuild races — L0 still served by leftover process |
| must_keep | — | — | Do **not** demote historic UF-HRM-12 Dev8088 🟢 without prove regression after mount restore; this wave = **local Vite graph** blocker |

## 5. Handoff

```
ack_status: FAIL_TO_PM
next_owner: pm → Task dev-fe (R-PO-SPINE01-REC-MOUNT) → qa retest SPINE-01
evidence_path: docs/qa/evidence/po-e2e-spine-01-qa-w1.md
test_log: docs/qa/evidence/po-e2e-spine-01-qa-w1-test-log.md + .json
```
