# Evidence — PO-E2E-SPINE-01-QA-W4 (HP-04 candidates + hire)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-SPINE-01-QA-W4` |
| **program** | `PO-E2E-BIZ-SPINE-01` · spine **E2E-SPINE-01** |
| **executor** | qa |
| **date** | 2026-08-03 |
| **env** | local NFD · portal `:5173` · hrm-api `:28001` · xbos-api `:28002` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **U65** | zero-seed · **no** `pnpm seed:*` · **no** invent hire rows via DB/API for UF PASS |
| **prior** | W3 HP-03 CLOSED · stamp `SP2SDD8FM8` · requisition `34a421e7-…` |
| **harness** | `scripts/qa/po-e2e-spine-01-qa-w4-browser.mjs` |
| **raw** | `docs/qa/evidence/_tmp-po-e2e-spine-01-qa-w4-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-e2e-spine-01-qa-w4-20260803/` |
| **test_log** | `docs/qa/evidence/po-e2e-spine-01-qa-w4-test-log.md` + `.json` |
| **cand stamp** | `SP4SDE70SZ` |
| **ack_status** | **FAIL_TO_PM** |

## spec_read_ack

- program: `PO_E2E_BUSINESS_SPINE_PROGRAM.md` § E2E-SPINE-01 · HP-04 / HP-05
- BA: `docs/qa/evidence/po-e2e-ba-case-matrix-01.md` HP-04
- journeys: **J-REC-WF-04** · **J-HRM-05** · UF-HRM-12
- hdsd_align (U76): `docs/qa/HDSD_REC_MENU_FUNCTION_INVENTORY.md` CH07 §6 Thêm ứng viên · §6 Chuyển giai đoạn · §13 Liên kết nhân viên
- U65 · U78 · anti-idle
- **must_keep:** Leave / AUTH / EMP / CAT GWC CLOSED — **not** reopened · SPINE-02 LV-03/04 **not** reopened

## hdsd_inventory (this wave)

| HDSD | Control | Executed |
|------|---------|----------|
| CH07 §3 | YCTD context `SP2SDD8FM8` / `34a421e7` | 🟢 visible on requisitions |
| CH07 §6 | Tab **Ứng viên** | 🟢 mount · empty honest |
| CH07 §6 | **Thêm ứng viên** → form → Lưu | 🔴 POST **400** `HRM-VAL-001` |
| CH07 §6 / §13 | Chuyển **Đã tuyển** → HireEmployeeLinkDialog | ⬜ blocked upstream create |
| HP-05 NV/HĐ | after hire 2xx | ⬜ blocked |

## 1. L0

| Probe | Result |
|-------|--------|
| `GET :28001/api/hrm` | **200** |
| `GET :28002/api/xbos` | **200** |
| Portal `:5173` | **200** |

## 2. Browser HP-04 (12 clicks · idle_guard PASS · seed=false)

| Step | Case | Verdict | Evidence |
|------|------|---------|----------|
| **L0** | stack | 🟢 | hrm+xbos+portal 200 |
| **HP04_CTX** | YCTD after Inbox approve | 🟢 | requisition id=`34a421e7-33df-4c8b-b96c-559082b78086` · stamp `SP2SDD8FM8` on list |
| **HP04_CREATE** | Thêm UV → Lưu → F5 | 🔴 | POST `/api/hrm/recruitment/candidates` **400** `HRM-VAL-001` · toast «Dữ liệu gửi lên chưa hợp lệ.» · list remains 0 · F5 empty |
| **HP04_HIRE** | stage Đã tuyển + link NV | ⬜ | skipped — no candidate row |
| **HP05** | emp/contract | ⬜ | skipped — hire not 2xx |

### Click path (executed)

1. Inject portal auth `ceo@xe.vn` → `:5173`
2. `/hr/recruitment?tab=requisitions` — confirm YCTD `SP2SDD8FM8` / `34a421e7`
3. `/hr/recruitment?tab=candidates` → **Ứng viên**
4. **Thêm ứng viên** → fill Họ tên `Nguyen Hire Pay SP4SDE70SZ` · email · vị trí (stamp) · stage default Ứng tuyển
5. **Thêm ứng viên mới** / Lưu (no Escape)
6. Observe toast Lỗi · Network POST **400**
7. F5 candidates — still empty (no stamp)

### Network (key)

| Call | Status | Code / note |
|------|--------|-------------|
| `GET …/requisitions?company_id=main` | **200** | hasLegacy stamp · id `34a421e7-…` |
| `GET …/candidates-pool?company_id=main` | **200** | empty OK (U65) |
| `POST …/recruitment/candidates` | **400** | `HRM-VAL-001` — `property position should not exist; property rating should not exist; property expected_start_date should not exist; property nationality should not exist; property hometown should not exist; property marital_status should not exist` |

### Root cause (product_gap — FE↔BE contract)

| Layer | Fact |
|-------|------|
| FE | `CandidateFormDialog` POST body includes `position`, `rating`, `nationality`, `hometown`, `marital_status`, `expected_start_date` (+ whitelist fields) |
| BE | `CreateCandidateDto` + Nest `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` → **400** on unknown properties |
| Diagnosis (L1 only, **not** UF PASS) | Minimal body `{company_id, full_name, email, stage}` → **201** `HRM-REC-CP-201`; FE-shaped body → **400** same code |
| U65 | Did **not** use API-created rows to continue hire / claim PASS |

## 3. Verdict matrix

| Gate | Result |
|------|--------|
| L0 stack | 🟢 PASS |
| HP-03 prior closed | 🟢 not reopened |
| HP-04 create FE HDSD | 🔴 FAIL `HRM-VAL-001` |
| HP-04 hire / J-REC-WF-04 | ⬜ BLOCKED upstream |
| HP-05 emp/contract | ⬜ BLOCKED upstream |
| Seed | 🟢 none |
| idle_guard | 🟢 12 clicks (≥6) |
| LV-03/04 / Leave / AUTH / EMP / CAT | 🟢 **not** reopened |
| Phase1 / UAT DONE claim | 🟢 **not** claimed |

**Overall:** `FAIL_TO_PM` — residual **R-PO-SPINE01-CAND-HIRE** remains OPEN (narrowed to DTO/FE payload parity).

## 4. Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-PO-SPINE01-CAND-HIRE** | P1 | **dev-be** (DTO extend) ± **dev-fe** (strip/map fields) | `CreateCandidateDto` must accept HDSD form fields FE sends **or** FE must omit non-DTO props before POST; then QA retest create→hire→HP-05 |
| R-PO-SPINE01-PAYROLL-BLANK | P1 | defer | HP-06 — not this wave |
| must_keep | — | — | Leave / AUTH / EMP / CAT · SPINE-02 LV-03/04 CLOSED |

## 5. Handoff

```
ack_status: FAIL_TO_PM
next_owner: pm → dev-be (primary) / dev-fe
evidence_path: docs/qa/evidence/po-e2e-spine-01-qa-w4.md
test_log: docs/qa/evidence/po-e2e-spine-01-qa-w4-test-log.md + .json
```

### completion_report

- Closed this wave: L0; YCTD context after W3 approve; HDSD candidates tab mount; honest fail on Thêm ứng viên with Network proof `HRM-VAL-001` whitelist mismatch; HP-05 not claimed; no seed; LV/Leave/AUTH/EMP/CAT not touched.
- Open: FE create candidate blocked → hire + emp/contract spine cannot proceed until DTO↔form parity fixed and QA retest.

### next_dispatch_prompt

```text
work_item_id: PO-E2E-SPINE-01-BE-CAND-DTO-01 (or FE strip twin)
role: dev-be (primary) — optional narrow dev-fe
priority: P1
entry_criteria: PO-E2E-SPINE-01-QA-W4 FAIL_TO_PM · docs/qa/evidence/po-e2e-spine-01-qa-w4.md
task: Fix POST /api/hrm/recruitment/candidates HRM-VAL-001 when CandidateFormDialog sends position, rating, expected_start_date, nationality, hometown, marital_status (forbidNonWhitelisted). Prefer ADD optional fields on CreateCandidateDto (+ persist if schema has columns) OR FE strip unknown before POST — keep G-DB-01 hire bind must_keep. Jest for FE-shaped payload → 2xx pool create. Do not reopen Leave/LV-03/04/AUTH/EMP/CAT.
exit_criteria: READY_FOR_QA · evidence path · then QA-W4-R1 browser U65 Thêm UV → Lưu 2xx → stage Đã tuyển → HireEmployeeLinkDialog → F5
cấm: pnpm seed:* · claim Phase1/UAT DONE
```
