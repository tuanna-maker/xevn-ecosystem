# Evidence — PO-E2E-SPINE-01-QA-W3 (HP-03 Inbox this-wave)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-SPINE-01-QA-W3` |
| **program** | `PO-E2E-BIZ-SPINE-01` · spine **E2E-SPINE-01** |
| **executor** | qa |
| **date** | 2026-08-03 |
| **env** | local NFD · portal `:5173` · hrm-api `:28001` · xbos-api `:28002` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **U65** | zero-seed · **no** `pnpm seed:*` · **no** prior-task approve cheat |
| **prior** | W2 HP-03 🟡 · BE `po-e2e-spine-01-be-inbox-01.md` READY_FOR_QA (subjectTitle / display_title) |
| **harness** | `scripts/qa/po-e2e-spine-01-qa-w3-browser.mjs` |
| **raw** | `docs/qa/evidence/_tmp-po-e2e-spine-01-qa-w3-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-e2e-spine-01-qa-w3-20260803/` |
| **test_log** | `docs/qa/evidence/po-e2e-spine-01-qa-w3-test-log.md` + `.json` |
| **stamp** | **`SP2SDD8FM8`** (legacy this-wave from W2 submit — **accepted**) |
| **ack_status** | **PASS_TO_PM** |

## spec_read_ack

- program: `PO_E2E_BUSINESS_SPINE_PROGRAM.md` § E2E-SPINE-01 · HP-03
- BE fix: `docs/qa/evidence/po-e2e-spine-01-be-inbox-01.md` — `subjectTitle` / `display_title` enrichment + soft backfill
- journeys: **J-REC-WF-03** · UF-XBOS-08
- hdsd_align: CC Inbox → mở task this-wave → Duyệt → F5
- U65 · U78 · anti-idle · Leave/AUTH/EMP/CAT CLOSED not reopened

## 1. L0

| Probe | Result |
|-------|--------|
| `GET :28001/api/hrm` | **200** |
| `GET :28002/api/xbos` | **200** |
| Portal `:5173` | **200** |

## 2. Browser HP-03 (6 clicks · idle_guard PASS · seed=false)

| Step | Case | Verdict | Evidence |
|------|------|---------|----------|
| **L0** | stack | 🟢 | hrm+xbos+portal 200 |
| **HP03_SCAN1** | stamp visible | 🟢 | UI + GET tasks show `YCTD HireToPay SP2SDD8FM8` |
| **HP03** | Duyệt → F5 | 🟢 | POST complete **201** `XBOS-WF-200` · F5 · stamp no longer pending |

### Click path (executed)

1. Inject portal auth `ceo@xe.vn` → `:5173`
2. `/command-center/inbox`
3. Open card containing **SP2SDD8FM8** / YCTD HireToPay
4. **Duyệt** → confirm
5. **F5** inbox — this-wave stamp no longer pending (`stillPending=false`)

### Stamp documentation

| Field | Value |
|-------|--------|
| **Accepted stamp** | `SP2SDD8FM8` |
| **Source** | **legacy** (W2 FE submit instance — BE display fix made it visible) |
| **New FE submit this wave** | not required (legacy already visible) |
| **Task id** | `f01d0f12-ab70-4967-90c3-4fa8746312d9` |
| **Instance id** | `5590cbb1-80ff-4c1b-af72-4a78ce3a3782` |
| **Assignee** | `ceo@xe.vn` |
| **company_id (task)** | `holding` (listed under portal `main` Group CEO — matches BE note) |

### Network (key)

| Call | Status | Code / note |
|------|--------|-------------|
| `GET /api/xbos/workflow-engine/tasks?tenantId=xevn&status=pending&assigneeUserId=ceo%40xe.vn` | **200** | `taskCount=32` · `hasLegacy=true` · first title = `Phê duyệt yêu cầu tuyển dụng HRM · YCTD HireToPay SP2SDD8FM8` · `subject_title=YCTD HireToPay SP2SDD8FM8` · `display_title` enriched |
| `POST /api/xbos/workflow-engine/tasks/f01d0f12-…/complete` | **201** | `XBOS-WF-200` |

## 3. Verdict matrix

| Gate | Result |
|------|--------|
| L0 stack | 🟢 PASS |
| HP-03 this-wave stamp visible | 🟢 PASS (`SP2SDD8FM8`) |
| J-REC-WF-03 Inbox → Duyệt | 🟢 PASS |
| UF-XBOS-08 approve 2xx | 🟢 PASS (201) |
| F5 after approve | 🟢 PASS (`stillPending=false`) |
| Seed | 🟢 none |
| idle_guard | 🟢 6 clicks (≥6) |
| Phase1 / UAT DONE claim | 🟢 **not** claimed |

**Overall:** `PASS_TO_PM` — residual **R-PO-SPINE01-INBOX-THISWAVE** CLOSED for browser HP-03.

## 4. Residuals (carry — not blocking HP-03)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| R-PO-SPINE01-CAND-HIRE | P1 | dev-fe / qa | HP-04 hire after approve — still open from W2 |
| R-PO-SPINE01-PAYROLL-BLANK | P1 | defer | HP-06 shell honesty — not this wave |
| must_keep | — | — | Leave / AUTH / EMP / CAT CLOSED lanes **not** reopened |

## 5. Handoff

```
ack_status: PASS_TO_PM
next_owner: pm
evidence_path: docs/qa/evidence/po-e2e-spine-01-qa-w3.md
test_log: docs/qa/evidence/po-e2e-spine-01-qa-w3-test-log.md + .json
```

### completion_report

- Closed: HP-03 / J-REC-WF-03 / UF-XBOS-08 — stamp `SP2SDD8FM8` visible on Inbox for `ceo@xe.vn`, Duyệt POST **201** `XBOS-WF-200`, F5 OK; BE-INBOX-01 display fix verified in browser (U65, no seed).
- Open: hire-to-pay chain HP-04+ residuals from W2 (not in this mission exit).

### next_dispatch_prompt

```text
work_item_id: PO-E2E-SPINE-01-QA-W4 (or PM priority HP-04)
role: qa (or dev-fe if hire CTA gap)
priority: P1
entry_criteria: PO-E2E-SPINE-01-QA-W3 PASS_TO_PM · HP-03 CLOSED · docs/qa/evidence/po-e2e-spine-01-qa-w3.md
task: Continue hire-to-pay spine after Inbox approve — HP-04 / J-REC-WF-04 candidates+hire FE path (U65 zero-seed) then HP-05 emp/contract stamp if hire 2xx. Do not reopen Leave/AUTH/EMP/CAT. Do not claim Phase1/UAT DONE.
exit_criteria: evidence + U78 test-log · PASS_TO_PM or FAIL_TO_PM with residual owners
cấm: pnpm seed:* · invent hire rows via DB
```
