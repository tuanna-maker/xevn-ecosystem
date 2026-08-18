# Evidence — PO-HRM-BP-ATT-SIGN-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-QA-02` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **lane** | execution · UF-HRM-ATT-SIGN · J-HRM-06c |
| **prior** | `po-hrm-bp-att-sign-fe-01.md` READY_FOR_QA · `po-hrm-bp-att-sign-qa-01.md` L1 sealed |
| **ack_status** | **PASS_WITH_OBS** |
| **verdict** | L0 **PASS** · FE wire **static 🟢** · UF browser **🟡 PARTIAL** (U65 — no `submitted` sheet · no FE submit control) |
| **u65_zero_seed** | true — no `pnpm seed:*` · no API fake sign/close |
| **attendance_closed** | **false** |
| **product_go** | **false** |
| **remaster_program_done** | **false** |
| **hdsd_align** | Portal `:5173` → HRM embed → **Chấm công** → **Bảng chấm công** → row kỳ → panel Ký |
| **runtime_commit** | `dc930c5` |

---

## L0 — stack / FE↔BE

| Check | Result | Notes |
|-------|--------|--------|
| `pnpm run qc:dev-stack` | **PASS (checks)** | hrm-api :28001 · xbos-api :28002 · portal :5173 **HTTP 200** |
| Node exit on Windows | **OBS-L0-UV-EXIT** | Process sometimes aborts after summary (`UV_HANDLE_CLOSING`); health lines above still **PASS** |
| `pnpm run qc:fe-be-health` | **PASS** | exit **0** · login · employees · catalog-sync · proxy routes |

Seed: **none**

---

## Static wire (post FE-01)

| Area | Path | Verdict |
|------|------|---------|
| Panel component | `apps/web/hrm/src/components/attendance/AttendanceSheetSignPanel.tsx` | 🟢 testids `att-sign-panel` · `att-sign-panel-hold-draft` · `att-sign-steps-list` · `att-sign-confirm-*` · `att-sign-close-sheet` |
| Page wire | `apps/web/hrm/src/pages/Attendance.tsx` (~3156) | 🟢 `AttendanceSheetSignPanel` with `sheetId` · `companyId` · `sheetStatus` · `onSheetMutated` |
| API client | `apps/web/hrm/src/integrations/hrmApi.ts` | 🟢 `listAttendanceSheetSignatures` · `createAttendanceSheetSignature` · `closeAttendanceSheet` · `getAttendanceSheetById` |
| Submit funnel (prereq) | FE search | 🟡 **no** `submit` attendance-sheet API/client — draft → `submitted` **not wired** (FR-UC-BP-ATT-10 gap) |

---

## U65 browser — UF-HRM-ATT-SIGN

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · `tenantId=xevn`  
**URL:** `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main`  
**Repro:** `node scripts/qa/_tmp-po-hrm-bp-att-sign-qa-02.mjs`

### Click path (executed)

1. Login (API token + portal auth inject) → **Chấm công** → menu **Bảng chấm công**.
2. List `att-sheets-precision` visible · `GET …/attendance-sheets?company_id=main` **200** (proxy).
3. **2** UI rows · **0** rows `submitted` in list text · direct HRM API list **0** items (same as QA-01 density OBS).
4. Click first row → weekly `att-weekly-precision` **visible**.
5. **FE submit funnel:** scanned DOM for buttons matching *gửi / chờ ký / submit / tổng hợp* → **`submitButtonCount=0`** → **cannot** promote draft → `submitted` under U65.
6. Sign UX: **`att-sign-panel-hold-draft` true** (copy gửi chờ ký trước) · **`att-sign-panel` false** · **`GET …/signatures` 0×**.
7. No POST signatures / POST close (panel not mounted for `submitted`).

**Console:** `pageErrors=[]`

### AC-ATT-SIGN-UF-01..07

| AC-ID | Verdict | Evidence |
|-------|---------|----------|
| **UF-01** | 🟡 | S1–S2 load 🟢; panel ký full **blocked** — no `submitted` sheet; hold-draft honesty 🟢 |
| **UF-02** | ⬜ BLOCKED | No NV POST — no `att-sign-panel` |
| **UF-03** | ⬜ BLOCKED | No QL step |
| **UF-04** | ⬜ BLOCKED | No HCNS step |
| **UF-05** | ⬜ BLOCKED | No POST close |
| **UF-06** | ⬜ BLOCKED | No F5 closed state |
| **UF-07** | ⬜ BLOCKED | Negative close-on-incomplete not exercised (no panel) |

### J-HRM-06c

| Step | Verdict |
|------|---------|
| List → detail (L2.5 partial) | 🟢 row click · weekly detail |
| Signatures GET → sign ladder → close → F5 | 🟡 **BLOCKED-U65** — prerequisite `status=submitted` missing |

**not promoted:** 🟢 UF-HRM-ATT-SIGN · ✅ J-HRM-06c full · Attendance CLOSED · QC UF PASS

---

## Artifacts

| Type | Path |
|------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-hrm-bp-att-sign-qa-02-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-bp-att-sign-qa-02/` (`01`–`03`) |
| Probe script | `scripts/qa/_tmp-po-hrm-bp-att-sign-qa-02.mjs` |

---

## Residual

| ID | Owner | Priority |
|----|-------|----------|
| **OBS-UF-NO-SUBMITTED** | dev-fe | P0 — wire FR-UC-BP-ATT-10 funnel (UI → API) so sheet reaches `submitted` without seed |
| **OBS-LIST-DENSITY** | dev-fe / dev-be | P1 — API list **0** vs UI **2** rows (`company_id=main`) |
| **OBS-L0-UV-EXIT** | devops | P2 — Windows node crash after `qc:dev-stack` success line |
| **UF retest** | qa | P0 — `PO-HRM-BP-ATT-SIGN-QA-03` after submitted sheet exists via FE |

---

## completion_report

**Closed:** Evidence file `po-hrm-bp-att-sign-qa-02.md`. L0 fe-be-health **PASS**. Static confirmation: FE panel + hrmApi sign/close wired per FE-01. U65 browser: Bảng chấm công load, weekly detail, **hold-draft** sign panel; attempted FE-only submit funnel — **no control in DOM**; **no** `submitted` sheet → **no** signatures GET / POST / close / F5 chain.

**Open:** AC-ATT-SIGN-UF-02..07 · full J-HRM-06c · QC UF browser 🟢 (explicitly out of scope until UF unblocked).

---

## next_owner

**pm** → dispatch **dev-fe** (submit funnel) then **qa** retest; **qc** only after browser 🟢 UF bundle (not API-only GWC).

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-ATT-SIGN-FE-SUBMIT-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0

INTAKE: QA PASS_WITH_OBS PO-HRM-BP-ATT-SIGN-QA-02 — sign panel wire static OK; U65 blocked because no sheet status=submitted and no FE control to gửi chờ ký (submitButtonCount=0; hrmApi has no submit attendance-sheet).
read_first: docs/qa/evidence/po-hrm-bp-att-sign-qa-02.md · po-hrm-bp-att-sign-uf-ba-01.md · TECHSPEC §6.4.1 · FR-UC-BP-ATT-10
entry_criteria: BE sealed; AttendanceSheetSignPanel READY; U65 no seed
exit_criteria: FE chain draft/open sheet → submitted via UI (POST/PATCH per API_DESIGN); att-sign-panel visible; GET signatures 200; READY_FOR_QA
must_keep: vi-VN labels · can_close gate · no Attendance CLOSED claim
forbidden_paths: apps/api/hrm-api/** (BE sealed)
evidence_path: docs/qa/evidence/po-hrm-bp-att-sign-fe-submit-01.md
pm_dispatch_hint: PO-HRM-BP-ATT-SIGN-QA-03 full AC-ATT-SIGN-UF-01..07 + J-HRM-06c after submit exists
```

---

*End evidence PO-HRM-BP-ATT-SIGN-QA-02 · ack_status: **PASS_WITH_OBS***
