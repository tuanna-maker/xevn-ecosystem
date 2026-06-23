# QA — P1-PHASE1-QA-CRUD-RD-RETST (localhost U32)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QA-CRUD-RD-RETST` |
| **from_role** | qa |
| **to_role** | pm → qc |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | `2026-06-06` |
| **prior QA** | [`p1-phase1-qa-crud-matrix-retest-20260606.md`](p1-phase1-qa-crud-matrix-retest-20260606.md) — J-HRM-05 FAIL · J-HRM-06 GWC |
| **dev evidence** | [`p1-phase1-be-crud-rd-parity-20260606.md`](p1-phase1-be-crud-rd-parity-20260606.md) |
| **policy** | U32 local-first · Group CEO `ceo@xe.vn` · `company_id=main` |

## Environment

| Target | Account | Notes |
|--------|---------|-------|
| **Local U32** `http://127.0.0.1:5173` | `ceo@xe.vn` / `Xevn@2026` | Portal proxy → hrm `:28001`, xbos `:28002` |
| Direct HRM | `http://127.0.0.1:28001/api/hrm` | Confirms route independent of Vite proxy |
| Scope | Group CEO holding rollup | Member CEO / mobile **out of scope** |

```bash
pnpm run qc:dev-stack          # exit 0
pnpm run qc:fe-be-health       # exit 0 — ALL PASS
$env:PORTAL_DEV_URL='http://127.0.0.1:5173'
node scripts/tmp-p1-phase1-qa-crud-matrix-retest-probe.mjs   # J-HRM-05 slice
# inline probe — J-HRM-05/06 portal + direct (see probe JSON)
```

---

## L0 — Stack health

| Gate | Result |
|------|--------|
| `qc:dev-stack` | **PASS** — hrm-api 200, xbos-api 200, web-portal 200 |
| `qc:fe-be-health` | **PASS** — login, direct HRM employees + catalog-sync, portal proxy |

---

## L2.5 — J-HRM-05 / J-HRM-06 scope parity (GET-by-id)

Re-test after **P1-PHASE1-BE-CRUD-RD-PARITY-01** — list resolver parity on GET-by-id.

| Journey | P-CC | AC-ID | Click / API path | List HTTP | Detail HTTP | Detail code | Entity id | Verdict |
|---------|------|-------|------------------|-----------|-------------|-------------|-----------|---------|
| **J-HRM-05** | P-CC-06 | **AC-CRUD-HRM-REC-G-RD-01** | `GET …/recruitment/requisitions?company_id=main` → `GET …/requisitions/{id}?company_id=main` | **200** | **200** | **HRM-REC-200** | `e5228749-e829-4edf-8864-f3255d8725dd` | **PASS** |
| **J-HRM-06** | P-CC-07 | **AC-CRUD-HRM-ATT-G-RD-01** | `GET …/attendance/records?company_id=main` → `GET …/records/{recordId}?company_id=main` | **200** | **200** | **HRM-ATT-200** | `8a90df5c-2831-4a30-9150-5e472565eefe` | **PASS** |

### Layer confirmation

| Journey | Portal proxy (`:5173/api/hrm`) | Direct hrm-api (`:28001`) |
|---------|-------------------------------|---------------------------|
| **J-HRM-05** | **200** `HRM-REC-200` | **200** `HRM-REC-200` |
| **J-HRM-06** | **200** `HRM-ATT-200` | **200** `HRM-ATT-200` |

**scope_parity:** List returns row id → GET-by-id **200** with same `company_id=main` — **PASS** (no 404 mismatch).

---

## Defects closed

| Defect ID | Journey | Prior symptom | Retest |
|-----------|---------|---------------|--------|
| **D-CRUDMAT-REC-RD-01** | **J-HRM-05** | List `HRM-REC-200` but GET `…/requisitions/:id` → **404** `HRM-DATA-404` | **CLOSED** — **200** `HRM-REC-200` |
| **D-CRUDMAT-ATT-RD-01** | **J-HRM-06** | List `HRM-ATT-200` but GET `…/records/:recordId` → **404** | **CLOSED** — **200** `HRM-ATT-200` |

---

## Summary

| Metric | Result |
|--------|--------|
| In-scope journeys | **2/2 PASS** |
| L2.5 scope_parity | **PASS** |
| L0 stack | **PASS** |
| Blocking FAIL | **0** |

**Matrix promotion (local U32):** `AC-CRUD-HRM-REC-G-RD-01` → **PASS** · `AC-CRUD-HRM-ATT-G-RD-01` → **PASS**.

---

## Residual (non-blocking · out of scope)

| Defect / item | Priority | Notes |
|---------------|----------|-------|
| **D-CRUDMAT-REC-U-01** | P2 | `PATCH …/requisitions/:id` still **404** — headcount-proposals PATCH works; unchanged from prior retest |
| **D-CRUDMAT-INS-RD-01** | P3 | `GET …/insurance-policy-participants/:id` → **404** — **J-HRM-04** employee link still valid; optional deep link |
| Browser embed click (P-CC-06/07 UI) | P3 | API L2.5 PASS; full iframe click-path not re-run this batch |

---

## completion_report

- L0 **PASS** (`qc:dev-stack` + `qc:fe-be-health` exit 0).
- **J-HRM-05** list→GET-by-id **PASS** — **200** `HRM-REC-200` portal + direct; **D-CRUDMAT-REC-RD-01 CLOSED**.
- **J-HRM-06** list→GET-by-id **PASS** — **200** `HRM-ATT-200` portal + direct; **D-CRUDMAT-ATT-RD-01 CLOSED**.
- Residual P2/P3 unchanged; no blocking defects for this wave.

## next_owner

**pm** — optional **qc** re-gate CRUD RD parity slice; no dev-be dispatch required for closed defects.

## next_dispatch_prompt

```
You are QC — xevn-ecosystem Sprint S5.
work_item_id: P1-PHASE1-QC-CRUD-RD-PARITY-01
entry_criteria: QA PASS_TO_PM docs/qa/evidence/p1-phase1-qa-crud-rd-retest-20260606.md — J-HRM-05 + J-HRM-06 GET-by-id scope parity PASS on localhost U32 (ceo@xe.vn company_id=main); D-CRUDMAT-REC-RD-01 and D-CRUDMAT-ATT-RD-01 closed.
exit_criteria: GO or GO WITH CONDITIONS for CRUD RD slice; cite L0 PASS + L2.5 J-HRM-05/06; note residual D-CRUDMAT-REC-U-01 (P2) and D-CRUDMAT-INS-RD-01 (P3) if waiving; ack_status PASS_TO_PM.
evidence_path: docs/qa/evidence/qc-p1-phase1-crud-rd-parity-20260606.md
```

## evidence_path

- [`p1-phase1-qa-crud-rd-retest-20260606.md`](p1-phase1-qa-crud-rd-retest-20260606.md)
- [`p1-phase1-qa-crud-rd-retest-20260606-probe.json`](p1-phase1-qa-crud-rd-retest-20260606-probe.json)
- Dev fix: [`p1-phase1-be-crud-rd-parity-20260606.md`](p1-phase1-be-crud-rd-parity-20260606.md)

## ack_status

**PASS_TO_PM**
