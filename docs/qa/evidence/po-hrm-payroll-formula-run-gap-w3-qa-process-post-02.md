# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-PROCESS-POST-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-PROCESS-POST-02` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | execution — W3 browser **fresh draft → POST /process 2xx** retest after BE-412 fix |
| **priority** | P1 |
| **parent** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-BE-PROCESS-FORMULA-412-01` |
| **prior** | QA-01 FAIL `PAYW3PROC-MSISALZ0` · BE READY live Sep `d92d3bbb` processed |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll` · HRM `:28001` · HRM-FE `:8080` · XBOS `:28002` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **journey_l25** | **J-HRM-07** — enroll → Khóa → process → payslip/lines F5 |
| **stamp** | **`PAYW3PROC2-MSIT867S`** |
| **machine** | [`_tmp-po-hrm-payroll-formula-run-gap-w3-qa-process-post-02.json`](_tmp-po-hrm-payroll-formula-run-gap-w3-qa-process-post-02.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-w3-qa-process-post-02/` |
| **harness** | `scripts/qa/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-process-post-02.mjs` |
| **U65** | zero-seed · browser-only · **no** `pnpm seed:*` |
| **Verdict** | **PASS** — POST `/process` **201** `HRM-PAY-202` · period **processed** · F5 lines non-zero |
| **ack_status** | **`PASS_TO_PM`** |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | LOCKED in process body · warnings include `PAYROLL_E2E_READY_FALSE` |
| **Formula LIVE / customer UAT** | **DENIED** | Non-zero line observed on F5 — **no** AC map promote · summary cards still **0 ₫** |
| **Module payroll UAT** | **DENIED** | slice process-post only ≠ module |
| **Seed** | **DENIED** | U65 |
| **R-PAY-BATCHES-SHOWADD-TDZ** | **CLOSED retained** | `tdzErrors=[]` · **not reopened** |

---

## Executive summary

U65 browser retest after BE expression-only var gate. **Sep create blocked** (`HRM-PAY-002` overlap with already-processed `d92d3bbb` — BE live-proof). Path used: FE **sign+close** Aug ATT sheet `74aba4d4` (first pass) → Aug draft **`cf38deac`** (empty, no D-only sheet tpl) → enroll **1** NV (`UAT-0100`) → **Khóa** → Network **POST `/process` 201** `HRM-PAY-202` · `payroll_e2e_ready=false` · period **processed** · F5 payslip row **12.345.000 ₫**. Skipped bad Aug draft `bb194e52` (template column `D` only → prior probe **412** `HRM-PAY-FORMULA-412` SRC / BR-AMIS-PAY-SRC-05). Residual **`R-PAY-W3-PROCESS-FORMULA-412-VARS` CLOSED** for browser. **DENY** LIVE / ready flip.

---

## Command table

| Command / check | Result | Exit / note |
|-----------------|--------|-------------|
| `pnpm run qc:dev-stack` | hrm/xbos **200** · portal flaky then restored | L0 |
| `pnpm run qc:fe-be-health` | **ALL PASS** | PASS |
| HRM-FE `:8080` | restarted mid-wave (`/hr` proxy was 500) | ops |
| `node scripts/qa/_tmp-…-process-post-02.mjs` | stamp **`PAYW3PROC2-MSIT867S`** | exit **0** |
| Seed | none | U65 |

---

## Target period selection

| Criterion | Result |
|-----------|--------|
| NOT `d92d3bbb` (already processed) | **PASS** — used `cf38deac-8b64-474d-9aee-b34249c0f5a1` |
| Fresh draft + ATT closed same month | **PASS** — Aug 2026 · ATT `74aba4d4` closed via FE (then already-closed on final run) |
| Sep FE create | **BLOCKED** — POST periods **409** `HRM-PAY-002` overlap |
| Aug `bb194e52` (D-only tpl) | **SKIPPED** — prior run POST process **412** SRC component `D` |

---

## UF / J-HRM-07 matrix (this seat)

| Step | Click path | Verdict | Evidence |
|------|------------|---------|----------|
| L0 / TDZ | load calc-list | **PASS** | `tdzErrors=[]` · `05-pay-list.png` |
| ATT close (Aug) | Sheets → sign EMP/DM/HR → Chốt | **PASS** | close POST **201** · `01`…`04` att screens (first pass) |
| Filter Aug | `pay-batch-period-option-8-2026` | **PASS** | |
| Open draft | `pay-batch-row-cf38deac` | **PASS** | `06-detail-before.png` · Bản nháp · 0 NV |
| Enroll | Thêm NV → select → Thêm | **PASS** | enroll POST **201** · emp→1 · `07`/`08` |
| Process | Khóa → confirm | **PASS** | POST **201** `HRM-PAY-202` · `09`/`10` |
| Payslip/lines UI | table after process | **PASS** | row visible (amounts race → 0 until refresh) |
| F5 | reload → re-open | **PASS** | `11-after-f5.png` · **12.345.000 ₫** base/net · status Đã duyệt/processed |
| Honesty | ready / LIVE | **LOCKED false / DENIED** | process `payroll_e2e_ready=false` |

---

## Acceptance criteria

| AC | Verdict | Notes |
|----|---------|-------|
| AC-ATT draft + ATT closed same month (≠ processed Sep) | **PASS** | Aug |
| AC-Enroll browser ≥1 | **PASS** | `UAT-0100` · POST enroll 201 |
| AC-Process POST **2xx** Network + machine | **PASS** | **201** `HRM-PAY-202` |
| AC-Payslip/lines UI after process + F5 | **PASS** | F5 non-zero line · period processed |
| Honesty `payroll_e2e_ready=false` | **PASS** | body + warnings |
| DENY formula LIVE invent | **PASS** | no promote · summary cards 0 ₫ OBS |
| Cấm reopen TDZ | **PASS** | no TDZ |

---

## Network (payroll mutate)

| Method | URL | Status | Code |
|--------|-----|--------|------|
| **POST** | `/api/hrm/payroll/periods/cf38deac-…/enroll` | **201** | `HRM-PAY-ENROLL-200` |
| **POST** | `/api/hrm/payroll/periods/cf38deac-…/process` | **201** | **`HRM-PAY-202`** |

### Process success excerpt

```json
{
  "code": "HRM-PAY-202",
  "status": "processed",
  "employee_count": 1,
  "payslip_summary": { "total_gross": 12345000, "total_net": 12345000 },
  "formula_bind": {
    "code": "qa_src02_ovr_srcsrc02isbdzw",
    "source": "company_active"
  },
  "warnings": ["SRC_RESOLVER_GD1", "PAYROLL_E2E_READY_FALSE"],
  "payroll_e2e_ready": false
}
```

---

## FE click path (final PASS run)

1. ATT already closed (prior harness pass signed+closed `74aba4d4`)
2. Login inject → `/hr/payroll` → Tính lương → Danh sách
3. Filter **Tháng 8/2026** → open `cf38deac`
4. Thêm nhân viên → enroll 1 → dialog close
5. **Khóa bảng lương** → confirm → process **201**
6. F5 → filter Aug → re-open → lines **12.345.000 ₫**

---

## Residuals

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-PAY-W3-PROCESS-FORMULA-412-VARS** | was P1 | be/qa | **CLOSED** | browser process 2xx proven on fresh draft |
| **R-PAY-W3-PROCESS-POST-UNPROVEN** | — | — | **CLOSED** | 2xx captured |
| **R-PAY-W3-SEP-CREATE-OVERLAP** | P3 OBS | pm | **OPEN** | Sep FE create 409 vs processed `d92d3bbb` — expected uniqueness |
| **R-PAY-W3-BAD-TPL-D-SRC** | P2 OBS | ba/dev | **OPEN** | `bb194e52` D-only tpl → 412 SRC for NV without bag — not this seat target |
| **R-PAY-W3-FE-SUMMARY-ZERO** | P3 OBS | dev-fe | **OPEN** | F5 line 12.345.000 ₫ but header cards Gross/Net still **0 ₫** |
| **R-PAY-BATCHES-SHOWADD-TDZ** | — | — | **CLOSED** | retained |
| **`payroll_e2e_ready`** | honesty | pm | **LOCKED false** | |
| **`C-SLICE-≠-MODULE`** | governance | pm/qc | **CONDITION** | |

---

## Not promoted

- `payroll_e2e_ready=true` / formula LIVE / module UAT
- Sep second draft create (overlap by design)
- Process on `bb194e52` D-only template
- Phase 1 DONE / full J-HRM-07 DoD beyond process-post slice

---

## Classification

| Signal | Class |
|--------|-------|
| POST `/process` **201** | **PRODUCT PASS** — BE-412 fix holds on fresh draft+ATT |
| F5 non-zero line | **OK** for payslip persist · **not** LIVE invent |
| Summary cards 0 | **FE OBS** rollup |
| TDZ | **OK** |

---

## completion_report

- **Closed:** L0 + fe-be; U65 browser fresh Aug draft (≠ `d92d3bbb`) + ATT closed; enroll 201; **POST `/process` 201** `HRM-PAY-202`; period processed; F5 payslip/lines **12.345.000 ₫**; honesty false; TDZ not reopened; machine + screens; residual VARS **CLOSED**.
- **Open OBS:** FE summary cards 0; Sep create overlap; D-only tpl SRC 412 on `bb194e52` (out of AC for this seat).
- **Not claimed:** LIVE · ready=true · module UAT.

## next_owner

**qc** (gate residual R-PAY-W3-PROCESS-POST / GWC close) → **pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QC-PROCESS-POST-02
from_role: pm
to_role: qc
lane: governance
priority: P1
parent: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-PROCESS-POST-02

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-process-post-02.md
- docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-process-post-02.json
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-be-process-formula-412-01.md

Mission:
1. Audit QA stamp PAYW3PROC2-MSIT867S — U65 browser POST /process 201 on Aug draft cf38deac (NOT d92d3bbb)
2. Confirm honesty payroll_e2e_ready=false · DENY LIVE · TDZ not reopened
3. Decide GO/GWC on residual R-PAY-W3-PROCESS-POST / FORMULA-412-VARS CLOSED; note OBS summary-cards-zero + bad-tpl-D SRC
4. evidence_path: docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qc-process-post-02.md
ack_status: PASS_TO_PM with GO | GO WITH CONDITIONS | NO-GO
```

## ack_status

**`PASS_TO_PM`**
