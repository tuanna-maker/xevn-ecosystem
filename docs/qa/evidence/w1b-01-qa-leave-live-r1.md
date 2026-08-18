# Evidence — W1-B-01-QA-LEAVE-LIVE-R1

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-01-QA-LEAVE-LIVE-R1` |
| **prior FAIL** | `docs/qa/evidence/w1b-01-qa-leave-live.md` (`R-LEAVE-FE-ATTENDANCE-MOUNT`) |
| **FE READY** | `docs/qa/evidence/w1b-01-fe-leave-attendance-mount.md` (restore `43c479a` + transitive) |
| **slice** | `docs/program/slices/DOC-ENT-P0-HRM-LEAVE.md` |
| **executor** | qa |
| **date** | 2026-08-03 |
| **env** | local NFD · portal `:5173` · HRM Vite `:8080` · hrm-api `:28001` · U65 zero-seed |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **ack_status** | `PASS_TO_PM` |
| **test_log** | `docs/qa/evidence/w1b-01-qa-leave-live-r1-test-log.md` + `.json` |
| **raw** | `docs/qa/evidence/_tmp-w1b-01-qa-leave-live-r1-browser.json` |
| **screens** | `docs/qa/evidence/screens/w1b-01-qa-leave-live-r1-20260803/` (8 PNG) |

## spec_read_ack

- fe_ready: `w1b-01-fe-leave-attendance-mount.md` · `LeaveOverviewRecentPanel` + Vite chain restore
- prior: `w1b-01-qa-leave-live.md` FAIL mount `#root=0`
- slice: `DOC-ENT-P0-HRM-LEAVE.md` · FR-UC-H03 / FR-UC-M03
- hdsd_align: Chấm công → tab **Nghỉ phép** · Tạo yêu cầu nghỉ / Danh sách / F5
- journeys: **J-HRM-06** leave list surface on Attendance
- U65 zero-seed · anti-idle clicks · AUTH/EMP CLOSED not reopened

## 1. L0 stack

| Probe | Result |
|-------|--------|
| `GET http://127.0.0.1:28001/api/hrm` | **200** (`qc:dev-stack`) |
| `GET http://127.0.0.1:28002/api/xbos` | **200** |
| Portal `http://127.0.0.1:5173/` | **200** |
| HRM Vite `http://127.0.0.1:8080/` | **200** |
| `GET :8080/hr/src/components/attendance/LeaveOverviewRecentPanel.tsx` | **200** |
| `GET :5173/hr/src/pages/Attendance.tsx` | **200** · no `Failed to resolve` |

## 2. Browser UF leave (U65 · HDSD · anti-idle)

Harness: `scripts/qa/_tmp-w1b-01-qa-leave-live-r1-browser.mjs`  
Window: `2026-08-03T14:30:05.347Z` → `2026-08-03T14:30:36.8Z` · **28** click_log entries

### Click path

1. API login ceo → inject portal auth (`companyId=main`)
2. Goto `:5173` → fallback `/hr/attendance?portal=1&tenantId=xevn&companyId=main`
3. Click tab **Nghỉ phép**
4. Case A: **Tạo yêu cầu nghỉ** → pick employee → sick/ốm → dates ≥3d · no attach → Gửi
5. Case B: **Danh sách yêu cầu** → click row → labels
6. Case C: F5 reload → leave surface + list GET 200

### Mount (resolves prior P0)

| Check | Result |
|-------|--------|
| `#root` childCount | **4** (was 0) |
| Vite resolve `LeaveOverviewRecentPanel` | **no error** |
| Tab Nghỉ phép visible | **true** |
| Console / page errors (P0) | **none** |

| Case | Result | Notes |
|------|--------|-------|
| A fail_deep | 🟢 PASS | Dialog opened; sick/ốm picked (`LVT_02Ốm`); submit clicked; **no** POST 2xx create; FE validation UI present (`validationUi=true`); `postAfter=[]` (client block before API) |
| B happy | 🟢 PASS | GET leave-requests **200** `HRM-LEAVE-200` · **28** rows · `status_label=Chờ duyệt` · `employee_display_name=CEO Tập đoàn` · UI shows Chờ duyệt / list; row click OK |
| C F5 | 🟢 PASS | After reload `#root=4` · leave text present · GET leave-requests **200** · no whitescreen |
| idle_guard | 🟢 PASS | 28 timestamped clicks |
| Seed | 🟢 none | U65 |
| **J-HRM-06** | 🟢 PASS | Attendance → leave list surface · list 200 · detail row click |

Sample list bind (browser network):

| Field | Value |
|-------|--------|
| `status` | `pending` |
| `status_label` | `Chờ duyệt` |
| `leave_type` | `LVT_01` |
| `leave_type_label` | `LVT_01` *(P2 depth — UI list still shows catalog text e.g. Phép năm)* |
| `employee_display_name` | `CEO Tập đoàn` |

## 3. Verdict matrix

| Gate | Result |
|------|--------|
| L0 stack | 🟢 PASS |
| Mount `/hr/attendance` + Nghỉ phép | 🟢 PASS · **R-LEAVE-FE-ATTENDANCE-MOUNT CLOSED** |
| Browser UF A | 🟢 PASS (FE validation; no silent create) |
| Browser UF B | 🟢 PASS (list + display fields bind) |
| Browser UF C F5 | 🟢 PASS |
| J-HRM-06 | 🟢 PASS |
| Seed | 🟢 none |
| AUTH/EMP CLOSED | 🟢 not reopened |

**Overall:** `PASS_TO_PM`

## 4. Residuals

| ID | Sev | Note | Owner |
|----|-----|------|-------|
| ~~R-LEAVE-FE-ATTENDANCE-MOUNT~~ | — | **CLOSED** this R1 | — |
| R-LEAVE-TYPE-LABEL-DEPTH | P2 | API `leave_type_label` often echoes `LVT_*` (field present; catalog VI depth) | defer / settings catalog |
| R-LEAVE-WF-FULL | P2 | Soft WF bridge (prior LIVE) | defer |

## completion_report

**Closed:** Prior mount P0 CLOSED — `/hr/attendance` mounts `#root=4`, tab Nghỉ phép visible, no Vite resolve error after FE restore. Browser Cases **A/B/C** + **J-HRM-06** PASS with 28 anti-idle clicks; U78 test-log md+json; U65 no seed; AUTH/EMP CLOSED untouched.

**Open:** P2 `R-LEAVE-TYPE-LABEL-DEPTH` (API label echo) · P2 `R-LEAVE-WF-FULL` — defer, not blocking this R1.

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: W1-B-01-QC-LEAVE-LIVE-R1
role: qc
priority: P0
mission: QC gate leave UF after QA LIVE-R1 PASS — audit evidence browser A/B/C + J-HRM-06 + mount CLOSED; confirm U65 no seed; residual P2 label-depth only.
entry: docs/qa/evidence/w1b-01-qa-leave-live-r1.md PASS_TO_PM · test-log md+json · screens w1b-01-qa-leave-live-r1-20260803 · FE READY w1b-01-fe-leave-attendance-mount.md
exit: GO or GO WITH CONDITIONS · evidence docs/qa/evidence/w1b-01-qc-leave-live-r1.md · list residuals with owner
cấm: seed · invent UF · reopen AUTH/EMP CLOSED · claim Phase1/UAT DONE
```

---

`ack_status: PASS_TO_PM`  
`evidence_path: docs/qa/evidence/w1b-01-qa-leave-live-r1.md`  
`next_owner: qc`
