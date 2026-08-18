# Evidence — R-SPINE-WEB-APPROVE-UX-01-QA

| Field | Value |
|-------|--------|
| **work_item_id** | `R-SPINE-WEB-APPROVE-UX-01-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-03 |
| **lane** | execution |
| **priority** | P1 |
| **ack_status** | `PASS_TO_PM` |
| **entry** | `docs/qa/evidence/r-spine-web-approve-ux-01.md` (FE READY) |
| **spec_ref** | FR-UC-H03 · UF-XBOS-08 · J-HRM-06 · HDSD Chấm công → Nghỉ phép / CC Việc cần xử lý |
| **U65** | honored — browser-only · no seed · no inbox seed · no DB fake |
| **U76** | `hdsd_align: true` |
| **U78** | test-log md + json |
| **must_keep** | LV-03/04 attach GWC CLOSED · LeaveOverviewRecentPanel mount · no invent L2 ladder / T_L1 |
| **environment** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · xbos-api `:28002` · L0 stack 200 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **commit** | `dc930c5` (workspace HEAD at run) |
| **raw_harness** | `docs/qa/evidence/_tmp-r-spine-web-approve-ux-01-qa-browser.json` |
| **screens** | `docs/qa/evidence/screens/r-spine-web-approve-ux-01-qa/` |
| **test_log** | `docs/qa/evidence/r-spine-web-approve-ux-01-qa-test-log.md` · `.json` |

---

## HDSD inventory (U76)

| Menu / màn HDSD | Nút / function | Click path | Verdict |
|-----------------|----------------|------------|---------|
| HRM → Chấm công → **Nghỉ phép** | Tab load · mount | `/hr/attendance` → Nghỉ phép | 🟢 `#root=4` · no Vite resolve fail |
| Nghỉ phép → **Danh sách** | **Duyệt** pending (`hdsd-leave-list-approve-{id}`) | Danh sách → Duyệt → F5 | 🟢 Path A |
| Command Center → **Việc cần xử lý** / inbox | **Duyệt** leave (`hdsd-cc-leave-approve`) | `/command-center/inbox` → Duyệt → F5 | 🟢 Path B |
| Tạo yêu cầu nghỉ (annual short) | Fallback if no pending | Not needed this run — pending already FE-visible | ⬜ N/A |
| LV-03/04 attach | must_keep CLOSED | Not reopened | ⬜ SKIP (prior R1 PASS) |

---

## Case matrix

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | LV-03 spot | ⬜ SKIP | GWC CLOSED must_keep — prior `po-e2e-spine-02-web-qa-w1-r1` PASS; not reopened |
| B success HDSD | Path A + Path B | 🟢 PASS | List approve + CC complete 2xx + F5 |
| C logic BR | Duyệt CTA HDSD | 🟢 PASS | List pending exposes Duyệt testid; CC leave `accessibleName=Duyệt` |

---

## Path A — Leave list Duyệt

| Step | Result |
|------|--------|
| Persona / URL | `ceo@xe.vn` → `/hr/attendance?portal=1&tenantId=xevn&companyId=main` → **Nghỉ phép** → **Danh sách** |
| Pre-mutate | `hdsd-leave-list-approve*` count **30** (FE-origin pending rows; no create needed) |
| Action | Click `hdsd-leave-list-approve-639e8033-bdbe-4623-8677-7ee1d5b2b1ac` |
| Network | `POST /api/hrm/attendance/leave-requests/639e8033-…/approve` → **201** `HRM-LEAVE-203` · `status=approved` · `status_label=Đã duyệt` |
| FE sau 2xx | Approve observed; list still mounted |
| F5 | GET leave-requests **200** · `#root` mounts |
| Verdict | 🟢 PASS |

---

## Path B — CC inbox leave Duyệt

| Step | Result |
|------|--------|
| Persona / URL | `/command-center/inbox` |
| Pre-mutate | `data-business-type=hrm_leave` cards **28** · `hdsd-cc-leave-approve` **28** |
| Action | Click `hdsd-cc-leave-approve` · `aria-label=Duyệt` |
| Network | `POST /api/xbos/workflow-engine/tasks/669909c4-…/complete` → **201** `XBOS-WF-200` |
| FE sau 2xx + F5 | Leave approve CTAs **27** (card completed); page mounts |
| Verdict | 🟢 PASS |

---

## Mount / must_keep

| Check | Verdict |
|-------|---------|
| Leave tab mount `#root=4` | 🟢 |
| Vite `LeaveOverviewRecentPanel` resolve error | 🟢 none |
| LV-03/04 reopen | 🟢 not touched |
| L2 ladder invent | 🟢 not invented |
| Idle viewport | 🟢 **23** clicks |

---

## Journeys

| J-* / UF | Verdict | Note |
|----------|---------|------|
| J-HRM-06 leave list surface | 🟢 | List + approve CTA |
| UF-XBOS-08 inbox complete | 🟢 | leave-specific **Duyệt** label |

---

## Residuals

None for this wave.

**Not claimed:** UAT DONE / Phase 1 DONE / PROD-READY.

---

## completion_report

**Closed:** Browser Path A (list Duyệt → POST approve 201 → F5) and Path B (CC inbox `hdsd-cc-leave-approve` → POST complete 201 → F5). Mount must_keep honored. LV-03/04 not reopened. U65/U76/U78 satisfied. Prior FE READY residual (approve UX) **CLOSED**.

**Residual:** none P0/P1 this wave.

**ack_status:** PASS_TO_PM  
**next_owner:** pm (intake → qc wave if gate needs GWC close on prior condition)  
**evidence_path:** `docs/qa/evidence/r-spine-web-approve-ux-01-qa.md`

### next_dispatch_prompt

```text
work_item_id: R-SPINE-WEB-APPROVE-UX-01-QC
role: qc
mission: Gate audit browser evidence Path A+B leave Duyệt UX. entry: docs/qa/evidence/r-spine-web-approve-ux-01-qa.md + test-log md/json. Verify U65 no-seed · HDSD inventory · must_keep LV-03/04 + LeaveOverviewRecentPanel · close prior GWC condition R-SPINE-WEB-APPROVE-UX-01 if evidence sufficient. cấm: claim UAT DONE · invent L2 ladder. evidence_path: docs/qa/evidence/r-spine-web-approve-ux-01-qc.md · ack GO / GWC / NO-GO.
```
