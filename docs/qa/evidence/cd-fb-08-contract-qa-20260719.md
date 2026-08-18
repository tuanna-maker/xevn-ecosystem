# CD-FB-08-CONTRACT — QA evidence (2026-07-19)

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-08-CONTRACT` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · JWT `companyId=main` · `roleCode=group_ceo` |
| **env** | local `:5173` portal · `:28001` hrm-api · `:28002` xbos-api |
| **sponsor_lock** | U65 browser-only zero-seed · no Phase1/PROD claim |
| **spec_ref** | `docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md` §5 AC-CD-F5-01..04,07 |
| **FE entry** | `docs/qa/evidence/cd-fb-08-contract-fe-20260719.md` |
| **BE entry** | `docs/qa/evidence/cd-fb-08-contract-be-20260719.md` |
| **date** | 2026-07-19 |

---

## Entry / L0

| Check | Result |
|-------|--------|
| Portal `:5173` | **200** |
| hrm-api `:28001` | **200** (transient EADDRINUSE / watch restart during session — recovered) |
| xbos-api `:28002` | **200** (brief disconnect mid-session — re-auth; recovered) |
| Seed | **None** (U65) |

---

## Click path (U65)

1. Login `ceo@xe.vn` → Command Center → **HRM → Hợp đồng** (`/command-center/hrm/contracts`)
2. P-CC-04 list loads · total **1104** · columns: Mã HĐ / Tên NV / Phòng ban / Loại / hiệu lực / hết hạn / Tình trạng — **no Lương column**
3. **J-HRM-01:** click NV **Huỳnh Văn An** (`8ac84520-…`) → profile URL `/hr/employees/8ac84520-…` · employee **HLD-0006** · no 404
4. Profile tab **Hợp đồng** → sub-tabs **Hợp đồng / Đãi ngộ / Lịch sử**
5. **Thêm hợp đồng** dialog → AC-CD-F5-01 hint visible; no salary required field
6. Tab **Đãi ngộ** → create package base + ≥2 allowances → **POST 201** `HRM-COMP-201`
7. **Tăng lương / revise** → **POST …/revise 201** `HRM-COMP-201`
8. Tab **Lịch sử** → **v1 + v2** timeline
9. **F5** reload profile → Lịch sử still **v1 + v2**
10. Back to contracts list → **J-HRM-03:** Eye «Chi tiết hợp đồng» → dialog **HLD-0006-HD** 200 UI

---

## AC matrix (browser FE)

| AC-ID | Tiêu chí | Evidence | Verdict |
|-------|----------|----------|---------|
| **AC-CD-F5-01** | Tab HĐ không có lương bắt buộc; Đãi ngộ riêng | Dialog «Thêm hợp đồng mới»: fields term-only; note *«Lương / phụ cấp không nhập trên form HĐ — dùng tab «Đãi ngộ» (AC-CD-F5-01)»*; no `salary` input/`required` | **PASS** |
| **AC-CD-F5-02** | Probation salary nếu NV/HĐ thử việc | Employee HLD-0006 contracts = `fixed_term` / `indefinite` — **no probation HĐ**; UI shows probation field disabled/hint «Chỉ khi HĐ thử việc»; create without probation line **OK** | **PASS** (N/A path — conditional per exit: *if thử việc*) |
| **AC-CD-F5-03** | ≥2 allowance codes DM §33 | Create: base `15.000.000` + `PHU_CAP_AN` `800.000` + `PHU_CAP_XANG` `500.000` · Network **POST** `/compensation-packages` → **201** `HRM-COMP-201` | **PASS** |
| **AC-CD-F5-04** | Revise → ≥2 versions in history | Revise **POST** `…/8f957a30-…/revise` → **201**; Lịch sử shows **v2** (16M / 900k / 600k) + **v1** (15M / 800k / 500k); GET `compensation-history` **200** `HRM-COMP-200` | **PASS** |
| **AC-CD-F5-07** | F5 persist (no seed) | Hard reload profile → Lịch sử still **v1 + v2** with same amounts/reasons | **PASS** |

Out of this wave scope (not fail): **AC-CD-F5-05** embed already covered via P-CC-04 + J-*; **AC-CD-F5-06** payroll consumer — deferred per BE residual.

---

## L2 / L2.5

| ID | Path | Result |
|----|------|--------|
| **P-CC-04** | `/command-center/hrm/contracts` list 1104 · no 409/54321 · no salary col | **PASS** |
| **J-HRM-01** | Contracts → click NV name → profile HLD-0006 | **PASS** |
| **J-HRM-03** | Contracts → Eye «Chi tiết hợp đồng» → dialog HLD-0006-HD | **PASS** |

---

## Network (mutate — in-session iframe fetch)

| Step | Method / path | Status / code |
|------|---------------|---------------|
| Create package | `POST /api/hrm/contracts-insurance/compensation-packages` | **201** `HRM-COMP-201` |
| List packages | `GET …/compensation-packages?employee_id=…` | **200** `HRM-COMP-200` |
| Active | `GET …/compensation-packages/active?…` | **200** `HRM-COMP-200` (after create; see residual) |
| Revise | `POST …/compensation-packages/{id}/revise?company_id=main` | **201** `HRM-COMP-201` |
| History | `GET …/compensation-history?…` | **200** `HRM-COMP-200` |

---

## Verdict summary

| Gate | Verdict |
|------|---------|
| AC-CD-F5-01,03,04,07 | **PASS** |
| AC-CD-F5-02 | **PASS** (N/A — no probation contract on subject NV) |
| P-CC-04 / J-HRM-01 / J-HRM-03 | **PASS** |
| U65 zero-seed | **PASS** |
| Overall | **PASS_TO_PM** |

**Not claimed:** Phase 1 DONE / PROD-READY.

---

## Residual (not blocking PASS)

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| `R-CD-FB-08-ACTIVE-COLD-500` | P2 | **dev-be** | First open Đãi ngộ (before any create) showed banner `duplicate key … pg_type_typname_nsp_index` on `GET …/active` (**500** `HRM-SYS-001`) while list packages already **200**. After create, `/active` stayed **200**. Likely race/idempotency in schema bootstrap (enum/type create) — harden `ensure*` to ignore duplicate type. |
| Payroll AC-CD-F5-06 | P3 | BE/FE follow-up | Consumer switch from legacy `contracts.salary` — out of this QA wave. |

---

## Handoff

**completion_report:** Browser U65 QA for CD-FB-08-CONTRACT closed AC-CD-F5-01/03/04/07 + conditional F5-02 + P-CC-04 + J-HRM-01/03. Create compensation **201**, revise **201**, history ≥2 versions, F5 persist. Intermittent cold `/active` 500 logged as P2 residual → BE (not FE). No seed. No Phase1/PROD claim.

**next_owner:** pm (optional qc gate wave; residual → `dev-be` if PM prioritizes P2)

**ack_status:** **PASS_TO_PM**

**evidence_path:** `docs/qa/evidence/cd-fb-08-contract-qa-20260719.md`

**next_dispatch_prompt:**

```text
work_item_id: CD-FB-08-CONTRACT-QC
from_role: pm
to_role: qc
lane: governance
entry_criteria: QA PASS_TO_PM — docs/qa/evidence/cd-fb-08-contract-qa-20260719.md
spec_ref: CUSTOMER_DEMO_HRM_DELTA_20260620.md §5 AC-CD-F5-01..04,07
exit_criteria:
  - Audit browser evidence vs AC matrix; confirm U65 zero-seed
  - GO or GO WITH CONDITIONS listing residual R-CD-FB-08-ACTIVE-COLD-500 (P2 BE)
  - evidence: docs/qa/evidence/qc-cd-fb-08-contract-YYYYMMDD.md
optional parallel:
  work_item_id: D-CD-FB-08-ACTIVE-COLD-500
  to_role: dev-be
  entry: GET compensation-packages/active cold load 500 pg_type_typname_nsp_index
  exit: idempotent ensure schema; jest + READY_FOR_QA
cấm: seed; Phase1/PROD claim; waive F5
```
