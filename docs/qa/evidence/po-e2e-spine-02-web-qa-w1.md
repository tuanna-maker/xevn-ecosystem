# PO-E2E-SPINE-02-WEB-QA-W1 — Web leave spine (LV-03/04 + list/approve honesty)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-SPINE-02-WEB-QA-W1` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-03 |
| **ack_status** | **FAIL_TO_PM** |
| **program** | `PO_E2E_BUSINESS_SPINE_PROGRAM.md` § SPINE-02 · wave A3 |
| **prior_mob** | `docs/qa/evidence/po-e2e-spine-02-03-mob-qa-w1.md` (LV-01 submit PASS) |
| **ba_matrix** | `docs/qa/evidence/po-e2e-ba-case-matrix-01.md` |
| **mount_must_keep** | `docs/qa/evidence/w1b-01-qa-leave-live-r1.md` — **GWC kept** (`#root=4`, no Vite resolve fail) |
| **env** | portal `:5173` · HRM Vite `:8080` · hrm-api `:28001` · xbos `:28002` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **U65** | **honored** — no seed / no inbox seed / no DB fake |
| **hdsd_align** | Chấm công → **Nghỉ phép** → Tạo yêu cầu nghỉ / Danh sách / CC Việc cần xử lý |
| **test_log** | [`po-e2e-spine-02-web-qa-w1-test-log.md`](po-e2e-spine-02-web-qa-w1-test-log.md) · [`.json`](po-e2e-spine-02-web-qa-w1-test-log.json) |
| **raw** | `_tmp-po-e2e-spine-02-web-qa-w1-browser.json` (run2) · first-run silent create captured in narrative |
| **screens** | `docs/qa/evidence/screens/po-e2e-spine-02-web-qa-w1/` |

---

## Executive verdict

**FAIL_TO_PM** — **LV-03 fail_deep FAIL**: FE submit ốm catalog `LVT_02` · `total_days=5` · `attachment_url=null` → **POST 201** `HRM-LEAVE-201` (run1). BE `assertSickAttachmentIfRequired` only matches literal `leave_type === 'sick'`, so catalog ốm bypasses **BR-LEAVE-ATT-01** / `HRM-LEAVE-VAL-ATT`.  

| Case | Verdict | Notes |
|------|---------|-------|
| **Mount** (must_keep) | 🟢 | `#root=4` · LeaveOverviewRecentPanel OK · tab Nghỉ phép |
| **LV-03** ốm≥3 no attach | 🔴 **FAIL** | Run1: silent create `70461e4d-…` pending. Run2: same payload → **409** `HRM-LEAVE-VAL-OVERLAP` (not VAL-ATT) |
| **LV-04** ốm≥3 + attach | 🟡 **BLOCKED** | No `input[type=file]` / attach label on create dialog; payload omits `attachment_url` |
| **WEB_LIST** labels | 🟢 | GET leave-requests **200** `HRM-LEAVE-200` · `status_label=Chờ duyệt` · VI UI · row click |
| **WEB_APPROVE** honesty | 🟡 **BLOCKED** | CC shows leave WF tasks (`businessType=hrm_leave`, assignee ceo) — **FE-origin, not seed**; Duyệt not actionable after open; leave-list Duyệt probe 0 in harness |
| **LV-02** ladder | 🟡 **SPEC_GAP** | Cap per PO / BA `GAP-LEAVE-LADDER-01` — no invent `N` |
| **idle_guard** | 🟢 | 34 clicks (run2) |
| **Seed** | 🟢 none | U65 |

**No UAT DONE / Phase 1 DONE claim.**

---

## HDSD inventory (U76)

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | Portal shell `:5173` | Yes | Login inject |
| 2 | HRM → Chấm công `/hr/attendance` | Yes | Fallback URL |
| 3 | Tab **Nghỉ phép** | Yes | LV-03/04/list |
| 4 | **Tạo yêu cầu nghỉ** | Yes | LV-03/04 |
| 5 | Danh sách yêu cầu / Chờ duyệt | Yes | WEB_LIST · J-HRM-06 |
| 6 | CC **Việc cần xử lý** leave cards | Yes (text + WF GET) | Approve honesty |
| 7 | Đính kèm / upload giấy bác sĩ | **No** | LV-04 BLOCKED |
| 8 | Duyệt control (actionable) | Partial (label in CC; click path incomplete) | WEB_APPROVE BLOCKED |

---

## Click path — LV-03 (🔴 FAIL)

1. API login ceo → inject portal auth `companyId=main`
2. Goto `/hr/attendance?portal=1&tenantId=xevn&companyId=main`
3. Tab **Nghỉ phép** → **Tạo yêu cầu nghỉ**
4. Pick employee `UAT NV 0020` · leave type **LVT_02Ốm** · dates `12/10/2027`–`16/10/2027` (5 ngày) · reason · **no attach**
5. **Gửi yêu cầu**

### Run1 (authoritative for VAL-ATT)

| Field | Value |
|-------|--------|
| Network | `POST /api/hrm/attendance/leave-requests` → **201** `HRM-LEAVE-201` |
| leave_type | `LVT_02` (UI: Ốm) |
| total_days | 5 |
| attachment_url | null |
| Created id | `70461e4d-fb7a-4456-9d53-39c9dba6539b` · `status=pending` · `status_label=Chờ duyệt` |
| Expected | **4xx** `HRM-LEAVE-VAL-ATT` |
| Actual | **2xx create** — fail_deep **FAIL** |

### Run2 (retest after overlap)

| Network | `POST` → **409** `HRM-LEAVE-VAL-OVERLAP` |
|---|---|
| Note | Overlap from run1 row — **not** VAL-ATT. Harness briefly marked PASS on no-2xx — **corrected in this evidence to FAIL** (VAL-ATT never returned). |

**Root cause (code):** `leave-requests.service.ts` `assertSickAttachmentIfRequired` early-return unless `leaveType.toLowerCase() === 'sick'`. Catalog/FE send `LVT_02`.

---

## Click path — LV-04 (🟡 BLOCKED)

Re-open **Tạo yêu cầu nghỉ** · probe dialog controls:

- `input[type=file]` count = **0**
- Labels đính kèm / giấy bác sĩ / upload = **absent**
- Dialog fields: NV, loại nghỉ, từ/đến, bàn giao, lý do, Hủy, Gửi

`LeaveRequestFormData` / `buildLeaveCreatePayload` **omit** `attachment_url`. Cannot complete LV-04 without inventing API/seed — **U65 BLOCKED**. Residual `R-SPINE-LV04-ATTACH-FE-01`.

---

## Web list + J-HRM-06 (🟢)

- GET leave-requests **200** `HRM-LEAVE-200` · ~30 rows
- Sample: `status_label=Chờ duyệt` · `employee_display_name=UAT NV 0020` · UI shows Chờ duyệt
- Row click OK · F5/list surface stable · mount kept
- P2: `leave_type_label` often echoes `LVT_02` (`R-LEAVE-TYPE-LABEL-DEPTH`)

---

## Approve honesty (🟡 BLOCKED — U65)

| Check | Result |
|-------|--------|
| Seed inbox? | **No** |
| WF tasks for ceo | GET `/api/xbos/workflow-engine/tasks?…assigneeUserId=ceo@xe.vn` **200** · pending includes `businessType=hrm_leave` |
| CC UI | «Phê duyệt đơn nghỉ phép HRM» visible in Việc cần xử lý |
| Duyệt after open | **Not actionable** in harness (no 2xx approve) |
| Leave-list Duyệt | Harness count 0 at probe; approve exists in LeaveTab source but not exercised 2xx |

**Honesty:** do **not** seed inbox to force Duyệt. Tasks exist from FE creates; approve UX/depth residual for Dev-FE / CC inbox.

---

## Residuals (PM dispatch)

| ID | Sev | Owner | Trigger |
|----|-----|-------|---------|
| **R-SPINE-LV03-VAL-ATT-CATALOG** | **P0** | **dev-be** | Map catalog ốm (`LVT_02` / leave_types meta) → sick attachment rule; reject ≥3d without `attachment_url` via `HRM-LEAVE-VAL-ATT`; jest + QA retest LV-03 |
| **R-SPINE-LV04-ATTACH-FE-01** | P1 | **dev-fe** | HDSD upload control → `/api/hrm/files` → bind `attachment_url` on create; then QA LV-04 |
| **R-SPINE-WEB-APPROVE-UX-01** | P1 | **dev-fe** | Make leave WF task / leave-list **Duyệt** actionable from CC/HDSD path for FE-origin tasks |
| **R-SPINE-LV02-BA-01** | P1 | ba-process | Day ladder (already OPEN) |
| **R-LEAVE-TYPE-LABEL-DEPTH** | P2 | defer | `leave_type_label` echo LVT_* |
| **R-SPINE-MGR-HIER-01** | P0 | ba/dev-be | From mob wave — manager filter (still open) |

---

## completion_report

**Closed:** Browser L0+leave mount must_keep; LV-03 executed with network proof of VAL-ATT bypass; LV-04 documented BLOCKED (no attach FE); web list/J-HRM-06 PASS; LV-02 capped SPEC_GAP; U78 test-log md+json; U65 no seed; approve honesty BLOCKED without seed.

**Open:** P0 VAL-ATT catalog; P1 attach FE; P1 web approve UX; LV-02 SPEC_GAP; mob manager hierarchy residual.

**ack_status:** FAIL_TO_PM  
**next_owner:** pm  
**evidence_path:** `docs/qa/evidence/po-e2e-spine-02-web-qa-w1.md`

### next_dispatch_prompt

```text
work_item_id: PO-E2E-SPINE-02-BE-LV03-VAL-ATT-01
role: dev-be
priority: P0
mission: Fix assertSickAttachmentIfRequired so catalog ốm (LVT_02 / leave_types sick meta) with total_days≥3 and null attachment_url returns HRM-LEAVE-VAL-ATT (not 201). Jest for LVT_02 + literal sick. must_keep leave mount GWC.
entry: docs/qa/evidence/po-e2e-spine-02-web-qa-w1.md FAIL LV-03 · POST 201 LVT_02 5d no attach
exit: READY_FOR_QA · evidence docs/qa/evidence/po-e2e-spine-02-be-lv03-val-att-01.md
parallel: Task dev-fe R-SPINE-LV04-ATTACH-FE-01 (upload bind attachment_url)
after BE+FE: Task qa PO-E2E-SPINE-02-WEB-QA-W1-R1 retest LV-03/04 + approve honesty
cấm: seed inbox · invent L2 day ladder · claim UAT DONE
```
