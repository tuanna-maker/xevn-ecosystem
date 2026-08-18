# Evidence — PO-HRM-BP-ATT-SIGN-QA-03

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-QA-03` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **lane** | execution · UF-HRM-ATT-SIGN · J-HRM-06c · FE submit retest |
| **prior** | `po-hrm-bp-att-sign-fe-submit-01.md` READY_FOR_QA · `po-hrm-bp-att-sign-qa-02.md` PASS_WITH_OBS |
| **ack_status** | **FAIL_TO_PM** |
| **verdict** | L0 **PASS** · FE **Gửi chờ ký** wired 🟢 · **POST submit 404** on live `:28001` → UF chain **🔴 blocked** |
| **u65_zero_seed** | true — no `pnpm seed:*` · no API fake sign/close/submit |
| **attendance_closed** | **false** |
| **product_go** | **false** |
| **remaster_program_done** | **false** |
| **hdsd_align** | HRM embed → **Chấm công** → **Bảng chấm công** → kỳ nháp → **Gửi chờ ký** |
| **runtime_commit** | `dc930c5` |

---

## L0 — stack / FE↔BE

| Check | Result | Notes |
|-------|--------|--------|
| `pnpm run qc:dev-stack` | **PASS (checks)** | hrm-api :28001 · xbos-api :28002 · portal :5173 **HTTP 200** |
| Node exit on Windows | **OBS-L0-UV-EXIT** | `UV_HANDLE_CLOSING` after summary (same as QA-02) |
| `pnpm run qc:fe-be-health` | **PASS** | exit **0** · login · employees · catalog-sync · proxy |

Seed: **none**

---

## U65 browser — submit + sign

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · `tenantId=xevn`  
**URL:** `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main`  
**Repro:** `node scripts/qa/_tmp-po-hrm-bp-att-sign-qa-03.mjs`

### Click path (executed)

| Step | Result |
|------|--------|
| S0 Login + **Chấm công** → **Bảng chấm công** | 🟢 `att-sheets-precision` visible · `GET …/attendance-sheets?company_id=main` **200** (proxy) |
| S1 Open draft row (index 0) | 🟢 weekly `att-weekly-precision` · `att-sign-panel-hold-draft` **true** |
| S2 **Gửi chờ ký** (`data-testid=att-sheet-submit`) | 🔴 **`POST …/attendance-sheets/{id}/submit?company_id=main` → 404** (`HRM-DATA-404` Cannot POST) |
| S3 FE after submit | 🔴 still hold-draft · **`att-sign-panel` false** · no `GET …/signatures` |
| S4 F5 + reopen row | 🔴 still hold-draft · status not **Chờ ký** in list |
| S5 Sign ladder NV→QL→HCNS | ⬜ **not run** (no `submitted`) |
| S6 POST close | ⬜ **not run** |

**Console:** `pageErrors=[]`

### Direct API probe (same session, no seed)

| Call | Result |
|------|--------|
| `GET …/attendance-sheets?company_id=main` | **200** · `total=2` · sheet `642a4713-…` **`status=draft`** · `company_id=holding` |
| `POST …/642a4713-…/submit?company_id=main` (direct `:28001`) | **404** Cannot POST |
| `GET …/642a4713-…/signatures?company_id=main` (direct `:28001`) | **404** Cannot GET |

**Root cause (QA):** Process on **:28001** serves **stale build** — sign/submit routes exist in source (`attendance.controller.ts` `@Post('attendance-sheets/:sheetId/submit')`) but **not registered** on running Nest. Attempted `pnpm run start:dev` in `apps/api/hrm-api` → **TS2345** `attendance-sheet-scope.ts:33` — watch compile **blocked**; old listener still bound.

### FE post-mutation (submit step — FAIL)

- **Trước mutate:** hold-draft + **Gửi chờ ký** visible.
- **Action:** click `att-sheet-submit`.
- **Network:** POST submit → **404** (not 2xx).
- **FE sau mutate:** hold-draft unchanged; no toast success observed in automation window; panel ký full not mounted.
- **F5:** unchanged draft UX.

---

## AC-ATT-SIGN-UF-01..07

| AC-ID | Verdict | Evidence |
|-------|---------|----------|
| **UF-01** | 🔴 | List/detail load 🟢; **cannot** reach `submitted` + panel ký — submit API missing on runtime |
| **UF-02** | ⬜ BLOCKED | No POST signatures |
| **UF-03** | ⬜ BLOCKED | No QL step |
| **UF-04** | ⬜ BLOCKED | No HCNS step |
| **UF-05** | ⬜ BLOCKED | No POST close |
| **UF-06** | ⬜ BLOCKED | No F5 closed |
| **UF-07** | ⬜ BLOCKED | Negative close not exercised |

### J-HRM-06c

| Step | Verdict |
|------|---------|
| List → detail (L2.5 partial) | 🟢 |
| Submit → sign → close → F5 | 🔴 **BLOCKED** — submit **404** |

**not promoted:** 🟢 UF-HRM-ATT-SIGN · ✅ J-HRM-06c full · Attendance CLOSED · QC UF browser 🟢

---

## Residual / OBS

| ID | Owner | Priority | Notes |
|----|-------|----------|--------|
| **P0-SUBMIT-404-RUNTIME** | dev-be + devops | P0 | Live hrm-api lacks `/submit` and `/signatures`; fix TS compile + restart `:28001` |
| **OBS-LIST-PARSE** | qa script | P3 | Probe `apiSheetCount=0` — API shape `data.data[]` not `items` (UI still shows 2 rows) |
| **OBS-LINE-COUNT-MVP** | dev-be | P2 | Code returns `line_count: 0` on submit MVP — **not auto-FAIL** once submit 2xx (per dispatch) |
| **OBS-L0-UV-EXIT** | devops | P2 | Windows node abort after `qc:dev-stack` |

---

## Artifacts

| Type | Path |
|------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-hrm-bp-att-sign-qa-03-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-bp-att-sign-qa-03/` (`01`–`04`) |
| Probe script | `scripts/qa/_tmp-po-hrm-bp-att-sign-qa-03.mjs` |

---

## completion_report

**Closed:** Evidence `po-hrm-bp-att-sign-qa-03.md`. L0 fe-be-health **PASS**. U65 browser: draft sheet → **`att-sheet-submit` clicked** → **POST submit 404** on proxy and direct HRM API; **no** transition to `att-sign-panel`; **no** signatures GET/POST/close/F5 chain. Confirmed FE submit control present (closes QA-02 `submitButtonCount=0` gap).

**Open:** AC-ATT-SIGN-UF-01..07 browser 🟢 · full J-HRM-06c · QC UF gate — **blocked on P0 runtime route registration / hrm-api compile**.

---

## next_owner

**pm** → **dev-be** (fix compile + verify submit/sign routes on `:28001`) → **devops** restart stack → **qa** `PO-HRM-BP-ATT-SIGN-QA-04` retest.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-ATT-SIGN-BE-RUNTIME-01
from_role: pm
to_role: dev-be
lane: execution
priority: P0

INTAKE: QA FAIL PO-HRM-BP-ATT-SIGN-QA-03 — FE att-sheet-submit clicks; POST …/attendance-sheets/{id}/submit returns 404 on :28001 and :5173 proxy; GET …/signatures also 404. Source has @Post submit in attendance.controller.ts but running Nest does not register routes. start:dev blocked: attendance-sheet-scope.ts:33 TS2345.
read_first: docs/qa/evidence/po-hrm-bp-att-sign-qa-03.md · po-hrm-bp-att-sign-fe-submit-01.md
entry_criteria: reproduce 404 with ceo@xe.vn token on sheet 642a4713-b0ee-4802-a1d9-2fe650cbc17f
exit_criteria: pnpm --filter hrm-api build exit 0; POST submit → 200 HRM-AS-200 draft→submitted; GET signatures 200 on submitted sheet; READY_FOR_QA + pm_dispatch_hint PO-HRM-BP-ATT-SIGN-QA-04
must_keep: U65 · scope resolveScopeContext · line_count MVP OBS only
evidence_path: docs/qa/evidence/po-hrm-bp-att-sign-be-runtime-01.md
cấm: seed · claim Attendance CLOSED / product GO
```

**QC:** Do **not** full UF GO until **QA-04** browser AC-ATT-SIGN-UF-01..07 green enough after runtime fix.

---

*End evidence PO-HRM-BP-ATT-SIGN-QA-03 · ack_status: **FAIL_TO_PM***
