# PO-E2E-SPINE-02-WEB-QA-W1-R1 — Web leave LV-03/04 retest (post BE VAL-ATT + FE attach)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-SPINE-02-WEB-QA-W1-R1` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **prior FAIL** | `docs/qa/evidence/po-e2e-spine-02-web-qa-w1.md` |
| **BE READY** | `docs/qa/evidence/po-e2e-spine-02-be-lv03-val-att-01.md` |
| **FE READY** | `docs/qa/evidence/r-spine-lv04-attach-fe-01.md` |
| **mount_must_keep** | LeaveOverviewRecentPanel — **GWC kept** (`#root=4`, no Vite resolve fail) |
| **env** | portal `:5173` · HRM Vite `:8080` · hrm-api `:28001` · xbos `:28002` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **U65** | **honored** — no seed / no inbox seed / no DB fake |
| **hdsd_align** | Chấm công → **Nghỉ phép** → **Tạo yêu cầu nghỉ** · Đính kèm giấy bác sĩ |
| **test_log** | [`po-e2e-spine-02-web-qa-w1-r1-test-log.md`](po-e2e-spine-02-web-qa-w1-r1-test-log.md) · [`.json`](po-e2e-spine-02-web-qa-w1-r1-test-log.json) |
| **raw** | `_tmp-po-e2e-spine-02-web-qa-w1-r1-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-e2e-spine-02-web-qa-w1-r1/` |
| **harness** | `scripts/qa/_tmp-po-e2e-spine-02-web-qa-w1-r1-browser.mjs` |

---

## Executive verdict

**PASS_TO_PM** — Prior W1 FAIL closed for LV-03 silent-201 and LV-04 missing attach UI.

| Case | Verdict | Notes |
|------|---------|-------|
| **Mount** (must_keep) | 🟢 | `#root=4` · no `LeaveOverviewRecentPanel` resolve fail · tab Nghỉ phép |
| **LV-03** ốm≥3 no attach | 🟢 | Attach UI shown · **Gửi** → FE toast block · **zero** POST leave-requests · **no silent 201** |
| **LV-04** ốm≥3 + attach | 🟢 | `hdsd-leave-attachment-input` → upload 2xx · POST leave **201** `HRM-LEAVE-201` + `attachment_url` · F5 list row |
| **idle_guard** | 🟢 | 36 clicks |
| **Seed** | 🟢 none | U65 |

**No UAT DONE / Phase 1 DONE claim.**

LV-03 fail_deep satisfied via **FE block** (mission: FE block and/or POST 4xx VAL-ATT). Live BE `HRM-LEAVE-VAL-ATT` not hit because FE gate prevents POST — BE catalog VAL-ATT covered by jest in BE evidence (33/33).

---

## HDSD inventory (U76)

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | Portal `/hr/attendance` | Yes | Nav |
| 2 | Tab **Nghỉ phép** | Yes | LV-03/04 |
| 3 | **Tạo yêu cầu nghỉ** | Yes | Create dialog |
| 4 | Loại nghỉ **LVT_02Ốm** | Yes | Catalog picker |
| 5 | **Đính kèm giấy bác sĩ** + `hdsd-leave-attachment-input` | Yes | LV-03 probe · LV-04 upload |
| 6 | **Gửi yêu cầu** | Yes | Submit both cases |
| 7 | F5 / list after create | Yes | LV-04 persistence |

---

## Click path — LV-03 (🟢 PASS)

1. API login ceo → inject portal auth `companyId=main`
2. Goto `/hr/attendance?portal=1&tenantId=xevn&companyId=main`
3. Tab **Nghỉ phép** → **Tạo yêu cầu nghỉ**
4. Employee `UAT NV 0020` · leave type **LVT_02Ốm** · dates ≥3d · reason · **no attach**
5. Probe: `fileInputCount=1` · `data-testid=hdsd-leave-attachment-input` · label **Đính kèm giấy bác sĩ***
6. **Gửi yêu cầu**

| Field | Value |
|-------|--------|
| Expected | FE block and/or POST 4xx `HRM-LEAVE-VAL-ATT` — **not** silent 201 |
| Actual | Toast/validation UI · **postAfter=[]** · `feBlockedNoPost=true` · `silentCreate=false` |
| Prior W1 | POST **201** bypass — **CLOSED** |

---

## Click path — LV-04 (🟢 PASS)

1. Re-open **Tạo yêu cầu nghỉ** · LVT_02 · dates ≥3d
2. `input[data-testid=hdsd-leave-attachment-input]` ← PNG fixture
3. Upload → **Gửi yêu cầu** → F5 → tab Nghỉ phép

| Field | Value |
|-------|--------|
| Upload | `POST /api/hrm/files/upload?feature=leave-attachment&company_id=main` → **2xx** |
| Create | `POST /api/hrm/attendance/leave-requests` → **201** `HRM-LEAVE-201` |
| id | `639e8033-bdbe-4623-8677-7ee1d5b2b1ac` |
| leave_type | `LVT_02` |
| attachment_url | `/api/hrm/files/holding/leave-attachment-1785771044524-_fixture-doctor-note.png` |
| F5 | GET leave-requests **200** · first row same id · `status_label=Chờ duyệt` · `attachment_url` retained · `#root` mount OK |

**P2 note (not FAIL):** harness date fill produced `start_date=2027-11-19` / `end_date=2028-03-10` (`total_days=113`) — still ≥3d so BR-LEAVE-ATT-01 applies; residual `R-QA-LEAVE-DATE-FILL-DEPTH` for tighter ViDateField fill if needed later.

---

## Residuals (carry / out of WI)

| ID | Sev | Owner | Status |
|----|-----|-------|--------|
| **R-SPINE-LV03-VAL-ATT-CATALOG** | P0 | dev-be | **CLOSED** (browser FE gate + BE jest READY) |
| **R-SPINE-LV04-ATTACH-FE-01** | P1 | dev-fe | **CLOSED** (browser LV-04) |
| **R-SPINE-WEB-APPROVE-UX-01** | P1 | dev-fe | OPEN — prior W1; **out of this R1 scope** |
| **R-SPINE-LV02-BA-01** | P1 | ba-process | OPEN SPEC_GAP — **no invent ladder** |
| **R-LEAVE-TYPE-LABEL-DEPTH** | P2 | defer | `LVT_02` echo on picker |
| **R-QA-LEAVE-DATE-FILL-DEPTH** | P2 | qa/dev-fe | Harness/ViDate end-date drift in R1 run |

---

## completion_report

**Closed:** Browser retest LV-03 (no silent 201 — FE block) + LV-04 (upload + POST 201 + `attachment_url` + F5); mount GWC must_keep; U65 zero-seed; U76 HDSD inventory; U78 test-log md+json; prior P0/P1 LV-03/LV-04 residuals CLOSED for product AC.

**Open:** Web approve UX (prior); LV-02 ladder SPEC_GAP; P2 label/date-fill depth.

**ack_status:** PASS_TO_PM  
**next_owner:** pm  
**evidence_path:** `docs/qa/evidence/po-e2e-spine-02-web-qa-w1-r1.md`

### next_dispatch_prompt

```text
work_item_id: PO-E2E-SPINE-02-WEB-QC-W1
role: qc
priority: P1
mission: Gate SPINE-02 web LV-03/04 after QA-W1-R1 PASS_TO_PM. Audit evidence docs/qa/evidence/po-e2e-spine-02-web-qa-w1-r1.md + test-log md/json. Confirm mount GWC kept; LV-03 no silent 201; LV-04 201+attachment_url+F5. Conditions OK: R-SPINE-WEB-APPROVE-UX-01 + LV-02 SPEC_GAP (no invent N). cấm seed · claim UAT DONE.
entry: BE VAL-ATT READY · FE attach READY · QA R1 PASS
exit: GO / GWC with residual owners · evidence docs/qa/evidence/po-e2e-spine-02-web-qc-w1.md
```
