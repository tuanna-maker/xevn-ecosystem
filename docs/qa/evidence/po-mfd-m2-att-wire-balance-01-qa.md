# PO-MFD-M2-ATT-WIRE-BALANCE-01-QA

| Field | Value |
|-------|--------|
| **work_item_id** | PO-MFD-M2-ATT-WIRE-BALANCE-01-QA |
| **fe_ref** | PO-MFD-M2-ATT-WIRE-BALANCE-01 · `docs/qa/evidence/po-mfd-m2-att-wire-balance-01.md` |
| **from_role** | qa · **to_role** | pm |
| **u65** | zero-seed · browser-only (Playwright + portal auth inject) |
| **date** | 2026-08-04 · **commit** | dc930c5 |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | false |

## L0 / FE↔BE

| Check | Result |
|-------|--------|
| `qc:dev-stack` (entry) | hrm-api briefly **ECONNREFUSED** → started `pnpm run dev:hrm-api` |
| Re-probe before browser | hrm **200** · xbos **200** · portal **5173** **200** |
| Unit (supplementary) | `vitest run src/lib/leaveBalance.test.ts` **3/3 PASS** |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main`  
**URL:** `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main`

## Browser matrix

| # | AC | Evidence | Verdict |
|---|-----|----------|---------|
| 1 | **Nghỉ phép** → Tạo yêu cầu → chọn NV → `GET .../leave-balance` **2xx** → panel days (no Demo / no endless spin) | `GET /api/hrm/attendance/leave-balance?...&employee_id=646306df-...&leave_type=annual&year=2026` → **200** · panel `Còn lại: 0 ngày` · `data-testid=leave-balance-panel` · no «Demo» | 🟢 |
| 2 | **Ca** → Lịch phân ca / Ca làm thêm → hold Alert, **not** `shifts-table` | `data-testid=shifts-schedule-hold` / `shifts-overtime-hold` visible · table **absent** | 🟢 |
| 3 | **Clock-In** → Face ID → hold; **no** check-in success toast / POST | Face wizard · **0** `POST .../attendance/records` · no success sonner toast | 🟢 |
| 4 | **Thiết lập** → Quy định chấm công → Chung → Lưu | **Build dc930c5:** `PATCH /api/hrm/attendance/rules?company_id=main` → **200** (CFG persist path merged — **not** `cfgNotPersisted` destructive-only) | 🟢 (honest persist) |

### UF / Journey

- **J-HRM-06** (attendance embed leave surface): leave tab + balance wire exercised; full list→detail journey not re-run (journey map already ✅ — spot only this wave).

### Network (leave-balance)

```
GET /api/hrm/attendance/leave-balance?company_id=main&employee_id=646306df-f4a6-4199-bf99-9ea8a3ff8584&leave_type=annual&year=2026 → 200
```

### Console (non-blocker)

- Repeated `Error loading face recognition models` (model manifest returns HTML) — **does not** bypass `featureHold` (no check-in POST).

### Screenshots / machine JSON

- `docs/qa/evidence/screens/po-mfd-m2-att-wire-balance-01-qa/*.png`
- `docs/qa/evidence/_tmp-po-mfd-m2-att-wire-balance-01-qa-browser.json`
- Repro: `node scripts/qa/_tmp-po-mfd-m2-att-wire-balance-01-qa.mjs`

## completion_report

- **Closed:** FE wire seat — leave balance API + panel, shift schedule/OT hold surfaces, Face ID GĐ2 hold (no successful check-in), settings rules save honest on **dc930c5** (PATCH 200).
- **Open:** `uat_done` false; J-HRM-06 full cross-nav not re-certified this seat; face model asset 404/HTML console noise (ops/FE asset path, out of wire slice).

## Residual

| ID | Owner | Note |
|----|-------|------|
| R-M2-ATT-HRM-DOWN | devops | Keep `hrm-api` on `:28001` before embed QA — proxy 500 blocks employee picker |
| R-M2-ATT-FACE-MODELS | dev-fe | Face-api model URLs serve HTML — console spam; hold still OK |
| R-M2-ATT-CFG-DOC | ba-process | **CLOSED** `PO-MFD-M2-ATT-CFG-DOC-01` — docs retired `cfgNotPersisted`; SoT ADR + PATCH 200 evidence · `po-mfd-m2-att-cfg-doc-01.md` |

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-M2-ATT-WIRE-BALANCE-CLOSE-01
PM intake: QA PASS_TO_PM PO-MFD-M2-ATT-WIRE-BALANCE-01-QA — leave-balance GET 200 + panel, shift hold tabs, Face hold, rules PATCH 200 on commit dc930c5. uat_done false.
Action: Close PO-MFD-M2-ATT-WIRE-BALANCE-01 on bus; optional narrow QC if sponsor wants M2 attendance fidelity gate; schedule PO-MFD-M1 runtime re-stamp if stack flaky (R-M2-ATT-HRM-DOWN).
evidence_path: docs/qa/evidence/po-mfd-m2-att-wire-balance-01-qa.md
```
