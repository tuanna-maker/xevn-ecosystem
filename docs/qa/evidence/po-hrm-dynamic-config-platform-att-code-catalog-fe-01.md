# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-FE-01 |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **priority** | P2 |
| **program** | PO-HRM-CONTINUOUS-W8-20260807 |
| **parent** | SA FE Option **A LOCKED** · L1 **ATTCODEQA-MSK4T1A5** RETAIN · residual **R-PLT-ATT-CODE-FE-01** |
| **condition_close** | **R-PLT-ATT-CODE-FE-01** (P2 · consumer Nest EFF rebind) |
| **ref_sa** | [PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-FE-SA-01.md](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-FE-SA-01.md) |
| **ref_ba** | AC-PLT-ATT-CODE-01 / 01c / 01f · VAL-ATT-CODE-CNS-06 |
| **change_mode** | **ADD** (FE consumer bind only · no FE-ADMIN invent · no seed · no L1 reopen) |
| **Date** | 2026-08-08 |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | ttendance_uat_ready=false · payroll_e2e_ready=false · ormula_LIVE=false · C-SLICE-≠-MODULE · U65 zero-seed · **R-PLT-ATT-CODE-FE-ADMIN** HOLD RETAIN · L1 KEY LIVE · OT/COMP Nest pickers RETAIN · LVRULE 01g HOLD · COMP OTC-03 CLOSED |

---

## 1. spec_read_ack

| Layer | Path / section |
|-------|----------------|
| **SA** | docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-FE-SA-01.md — Option **A LOCKED** · L-ATT-CODE-FE-01..10 · FE bind contract §5.2 |
| **SA evidence** | docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-fe-sa-01.md |
| **BA** | AC-PLT-ATT-CODE-01 / 01c / 01f · VAL-CNS-06 — Nest picker when EFF>0; bootstrap closed-4 when EFF=0 |
| **API_DESIGN** | GET /api/hrm/attendance/attendance-codes/effective?company_id= → { total, data[] } · code / 
ameVi / symbol / statusLabel / sortOrder |
| **BE** | F-ATT-CAT-CODE-EFF-01 LIVE · invent **400 HRM-ATT-CODE-KEY** · L1 stamp **ATTCODEQA-MSK4T1A5** RETAIN |
| **Peer** | useAttOtTypesEffective + OvertimeRequestTab · useAttOtCompTypesEffective |

**spec says / code does:**

- *spec says:* EFF>0 → Edit/filter Select = Nest EFF (code+nameVi/symbol); submit Nest code; invent → toast + Network **400 HRM-ATT-CODE-KEY**; early_leave|on_leave not sole Edit SoT; EFF=0 → bootstrap pending|present|absent|leave · no seed.
- *code did (trước):* API_STATUS_OPTIONS hardcode 4; filter hardcode late/early_leave; 	oApiAttendanceStatus coerce closed-4 → admin N+1 (wfh) unreachable.
- *code does (sau ADD):* useAttAttendanceCodesEffective + listEffectiveAttendanceCodes; AttendanceRecordsTable bind; pass-through Nest key; KEY toast.

---

## 2. completion_report

**Closed (CONDITION R-PLT-ATT-CODE-FE-01):**

| Gap | Impl |
|-----|------|
| Edit status Select hardcode | Bind useAttAttendanceCodesEffective().nestOptions when effectiveCount > 0 |
| Filter hardcode late/early_leave sole | Filter dùng statusOptions (Nest hoặc bootstrap 4) |
| Badge / nhãn | Prefer BE status_label / catalog nameVi+symbol; legacy i18n fallback lịch sử |
| Submit Nest code | updateRecord → 	oApiAttendanceStatus pass-through format-valid key |
| Bootstrap EFF=0 | ATT_ATTENDANCE_CODE_BOOTSTRAP_FALLBACK pending\|present\|absent\|leave + hint · **no seed** |
| Invent KEY surface | HRM-ATT-CODE-KEY → toast VI (hk.attendance.attCodeKeyError defaultValue) |
| early_leave/on_leave | 
esolveAttAttendanceCodeEditValue — không sole Edit option khi EFF>0 |

**Paths touched:**

| File | Change |
|------|--------|
| pps/web/hrm/src/integrations/hrmApi.ts | **ADD** listEffectiveAttendanceCodes + HrmAttAttendanceCodeEffectiveRecord |
| pps/web/hrm/src/hooks/useAttAttendanceCodesEffective.ts | **NEW** — helpers + RQ hook |
| pps/web/hrm/src/hooks/useAttAttendanceCodesEffective.test.ts | **NEW** — 17 vitest |
| pps/web/hrm/src/components/attendance/AttendanceRecordsTable.tsx | **ADD** Nest EFF bind + CODE-MEMORY APPEND |
| pps/web/hrm/src/hooks/useAttendanceRecords.ts | **ADD** open-key pass-through + KEY toast (peer OT pattern; required for submit Nest code) |
| pps/web/hrm/src/hooks/useAttendanceRecords.test.ts | **UPDATE** open-catalog expectations |

**Scope note:** useAttendanceRecords.ts ngoài allowed_paths gốc nhưng **bắt buộc** (peer OT useOvertimeRequests) — không pass Nest code / không surface KEY nếu chỉ đổi table.

**must_keep honored:** OT/COMP Nest pickers · L1 KEY LIVE · list GET LIVE · CLOCK/SHEETS/LEAVE · Face HOLD · no FE-ADMIN invent · no LVRULE · no COMP OTC reopen · no seed · ready=false · no aggregate rewrite.

---

## 3. Bind matrix (EFF>0 vs EFF=0)

| Catalog | Edit Select | Filter | Badge | Submit | Negative |
|---------|-------------|--------|-------|--------|----------|
| EFF>0 | Nest code + nameVi/symbol | Nest options | status_label / catalog | Nest code | invent → **400 HRM-ATT-CODE-KEY** + toast |
| EFF=0 | bootstrap 4 + hint | bootstrap 4 | i18n fallback | bootstrap code | soft-skip BE · no seed |
| loading | disabled | — | — | save disabled | — |
| error load | bootstrap + error line | bootstrap | — | KEY vẫn surface nếu invent | tt-attendance-code-catalog-error |

**data-testid:** ttendance-record-edit-status (RETAIN) · tt-attendance-code-filter · tt-attendance-code-catalog-error · tt-attendance-code-catalog-bootstrap-hint · tt-code-edit-bootstrap-hint.

---

## 4. Verify commands (đã chạy)

| Check | Command | Kết quả |
|-------|---------|---------|
| Unit hook + bind | 
px vitest run src/hooks/useAttAttendanceCodesEffective.test.ts | **17 passed** |
| Unit records open-key | 
px vitest run src/hooks/useAttendanceRecords.test.ts | **12 passed** |
| Combined | both files | **29 passed** |
| ESLint new/consumer | 
px eslint …useAttAttendanceCodesEffective.ts …AttendanceRecordsTable.tsx | **exit 0** |
| Path lock | .git + pps True (NFD cwd) | **PASS** |
| Lengths | hook 7995 · test 6920 · table 31535 · records 21576 | **PASS** |

**U65:** không seed · không POST mutate · không flip ready.

---

## 5. Path / length proof

| Check | Result |
|-------|--------|
| Repo .git AND pps | **True** (NFD Tài liệu) |
| Write method | Cursor Write / StrReplace on NFD tree · evidence via Python UTF-8 no BOM |
| Hook file length | ≥ 3000 |
| Evidence length | ≥ 3000 (this file) |

---

## 6. Residual

| Item | Severity | Owner |
|------|----------|-------|
| Browser U65 AC-01/01f: EFF>0 admin N+1 (vd. wfh) hiện trên Edit Select → Lưu PATCH 2xx → F5 badge Nest | P2 | **qa** |
| Browser EFF=0: bootstrap 4 + hint; **không** CTA seed | P2 | **qa** |
| Browser negative: invent status khi EFF>0 → Network **400 HRM-ATT-CODE-KEY** + toast VI | P2 | **qa** |
| **R-PLT-ATT-CODE-FE-ADMIN** Settings admin ABSENT | P2 NOTE | **HOLD** — DENY invent |
| Honesty / C-SLICE / seals | — | **pm** — ready=false RETAIN |

---

## 7. completion_report / handoff

**Closed:** FE consumer Nest EFF rebind cho AttendanceRecordsTable (peer OT/COMP); hook + hrmApi EFF; invent KEY toast; early_leave/on_leave không sole Edit SoT khi EFF>0; vitest 29 PASS; honesty false.

**Open:** QA browser U65 ATT-CODE-CATALOG-QA-FE-01; FE-ADMIN HOLD.

**next_owner:** **qa**

**ack_status:** **READY_FOR_QA**

**evidence_path:** docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-fe-01.md

### next_dispatch_prompt (copy-ready)

`	ext
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QA-FE-01
from_role: pm
to_role: qa
lane: execution
priority: P2
entry_criteria:
  - FE-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-fe-01.md
  - L1 RETAIN ATTCODEQA-MSK4T1A5 · GET …/attendance-codes/effective LIVE · KEY HRM-ATT-CODE-KEY
  - U65 zero-seed · browser-only · persona ceo@xe.vn / Xevn@2026
exit_criteria:
  - UF: Chấm công → Dữ liệu chấm công → Edit status Select
  - EFF>0: options Nest code+nameVi/symbol (vd. admin N+1 wfh); Lưu → Network PATCH 2xx; FE sau 2xx + F5 badge Nest
  - EFF=0 (nếu có đơn vị trống): bootstrap pending|present|absent|leave + hint; không CTA seed
  - Negative: invent status khi EFF>0 → 400 HRM-ATT-CODE-KEY + toast VI; dialog không đóng success
  - early_leave|on_leave không sole Edit option trừ Nest có đúng code
  - DENY seed · DENY claim attendance_uat_ready · DENY FE-ADMIN invent
  - evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-qa-fe-01.md
  - ack_status_target: PASS_TO_PM
must_keep: OT/COMP Nest pickers · L1 KEY LIVE · CLOCK/SHEETS/LEAVE · Face HOLD
`
