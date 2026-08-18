# QC Gate Decision — QC-HRM-EMP-COMPANY-COL-01 (2026-07-25)

work_item_id: `QC-HRM-EMP-COMPANY-COL-01`
ack_status: `PASS_TO_PM`

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-EMP-COMPANY-COL-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-07-25` |
| **decision** | **GO WITH CONDITIONS** |
| **scope** | **Local only** — employees list cột «Thông tin công ty» = LE/ĐVTV; 0 «Khối*»; J-HRM-02 |
| **environment** | Local portal `http://localhost:5173` · hrm-api `:28001` · xbos-api `:28002` |
| **persona** | `ceo@xe.vn` · `companyId=main` |
| **HOLD_DEPLOY** | **honored** — **no** `:8088` / pilot assert; **cấm** claim deploy PASS |
| **U65** | zero-seed — no `pnpm seed:*` in chain |
| **Phase1 / PROD** | **NONE** — **NOT** Phase 1 DONE · **NOT** PROD-READY |

---

## 1. Mission / scope audited

QC gate after QA `READY_FOR_QC` for company-column LE SoT (FR-HRM-EMP-COL-01 / AC-EMP-COL-01..07).

**Approved (bounded):** Local delivery of LE/ĐVTV labels on P-CC-03 employees list + J-HRM-02 list→detail, per BA/BE/FE/QA evidence chain.

**Explicitly not approved:** Phase 1 Program DONE · PROD-READY · pilot UF 🟢 on `:8088` · sync/deploy without sponsor unlock HOLD_DEPLOY.

---

## 2. Evidence consumed

| # | Artifact | Role | Status |
|---|----------|------|--------|
| 1 | `docs/qa/evidence/qa-hrm-emp-company-col-01-20260723.md` | QA | **READY_FOR_QC** / PASS_TO_PM — **authoritative browser UF** |
| 2 | `docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md` | BA | AC-EMP-COL-01..07 SoT |
| 3 | `docs/qa/evidence/be-hrm-emp-company-col-01-20260722.md` | Dev-BE | READY_FOR_QA — `company_display_name` + registry LE |
| 4 | `docs/qa/evidence/fe-hrm-emp-company-col-01-20260722.md` | Dev-FE | READY_FOR_QA — resolve reject Khối; filter ĐVTV |
| 5 | Code spot: `hrm-operating-unit-registry.ts` · `hrm-company-display-name.ts` · `employeeCompanyDisplayName.ts` | QC | Defaults = LE set; Khối only in legacy reject set |
| 6 | `docs/program/PROGRAM_JOURNEY_MAP.md` | Journey | **J-HRM-02** in-scope |

---

## 3. Evidence pack integrity

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-emp-company-col-01-20260723.md
→ exit 0 (8/8 PASS) — QC 2026-07-25
```

| Check | Result |
|-------|--------|
| Pack completeness (QA handoff) | **8/8 PASS** |
| Layer B process gate | **PASS** — QC may issue GWC |

---

## 4. AC audit (QA vs BA AC-EMP-COL-01..07)

| AC | BA Pass condition | QA evidence | QC audit |
|----|-------------------|-------------|----------|
| **AC-EMP-COL-01** | Cells ∈ ĐVTV/LE; 0 `Khối … X.E` | 50 cells; unique LE set; `khoi=0` | **CONCUR PASS** |
| **AC-EMP-COL-02** | Holding → Tập đoàn XeVN | PORTAL-GCEO / HLD-* → Tập đoàn XeVN | **CONCUR PASS** |
| **AC-EMP-COL-03** | API/FE from LE SoT; not Khối registry final | `company_display_name` on rows; FE matches | **CONCUR PASS** + code: defaults LE-only |
| **AC-EMP-COL-04** | No re-seed Khối over LE | jest `be-hrm-emp-company-col-01` 8/8; live map 0 Khối | **CONCUR PASS** (unit + runtime) |
| **AC-EMP-COL-05** | J-HRM-02 no 404/409 | Detail GET **HRM-EMP-200**; profile loaded | **CONCUR PASS** |
| **AC-EMP-COL-06** | F5 stable LE labels | F5 `khoiCount=0` | **CONCUR PASS** |
| **AC-EMP-COL-07** | Filter copy / SoT align | «Đơn vị thành viên»; OU labels = column | **CONCUR PASS** |

### Observed LE set (QA — QC accepts as SoT for this slice)

| company_id | company_display_name |
|------------|----------------------|
| holding | Tập đoàn XeVN |
| trsport | Công ty Cổ phần Thương mại và Dịch vụ X.E |
| logistics | Công ty TNHH Du lịch Visun |
| finance | Công ty TNHH Du lịch X.E Việt Nam |
| services | Công ty TNHH X.E Việt Nam |

---

## 5. L2.5 journey coverage (U19)

| ID | QA | QC | Note |
|----|----|----|------|
| **J-HRM-02** list→detail | **PASS** | **PASS (concur)** | No scope 404/409; GET by id 200 |
| **P-CC-03** employees list | **PASS** (local) | **PASS (concur)** | Company column LE |
| `:8088` pilot | ⬜ HOLD | ⬜ **deferred** | Condition C-EMP-COL-8088-01 |

**U19:** In-scope mandatory J-HRM-02 has QA PASS evidence — **not** L1/L2-only pack. No NO-GO for missing journey.

---

## 6. Commands / QC spot (2026-07-25)

| Command / check | Result | Class |
|-----------------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-emp-company-col-01-20260723.md` | **PASS** exit **0** (8/8) | Process |
| `pnpm run qc:dev-stack` | **FAIL** — hrm `:28001` / xbos `:28002` / portal `:5173` fetch failed | **ENV** |
| Live browser re-spot company column | **Not run** (stack down) | **ENV** — does not override QA UF PASS |
| Code audit registry defaults | 0 Khối in `HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES`; Khối only in `HRM_LEGACY_KHOI_DISPLAY_NAMES` | PRODUCT support |
| FE resolve reject `^Khối\s+` | Present in `employeeCompanyDisplayName.ts` | PRODUCT support |

Portal URL (slice): `http://localhost:5173` · embed `/command-center/hrm/employees` · QA Network `GET /api/hrm/employees?company_id=main&page=1&page_size=50` → **200** `HRM-EMP-200`.

Read-only matrix (this slice — no mutate UF):

| Module | Journey | AC / assert | Verdict |
|--------|---------|-------------|---------|
| HRM employees list | P-CC-03 · J-HRM-02 | company_display_name LE · 0 Khối | **PASS** (QA + QC concur) |

---

## 7. Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| QA pack 8/8 + AC-EMP-COL-01..07 PASS | **PRODUCT** | Supports **GWC** |
| J-HRM-02 PASS | **PRODUCT** | U19 OK |
| `qc:dev-stack` down at QC time | **ENV** | Spot deferred — **not** product NO-GO |
| HOLD_DEPLOY / no `:8088` evidence | **Process** | Condition — **cấm** deploy PASS |
| R-EMP-COL-NEST-WATCH-01 nest `--watch` TS2322 | **PRODUCT P2 DX** | Condition (optional BE) |
| BR-INT-05 4 LE ≠ 5 slug interim map | **PRODUCT P3** | Condition (SA refine) — names ∈ ĐVTV OK for AC-01 |
| Phase1 / PROD claim | **Process** | **Forbidden** |

---

## 8. Residual / conditions

| ID | Severity | Owner | Status |
|----|----------|-------|--------|
| **C-EMP-COL-8088-01** | Process | pm → devops (only after sponsor unlock) | **OPEN** — `:8088` sync **deferred**; HOLD_DEPLOY |
| **C-EMP-COL-NEST-WATCH-01** | P2 DX | dev-be | **OPEN** — optional `D-HRM-EMP-COMPANY-COL-BE-02` QueryFn cast so `dev:hrm-api` boots |
| **C-EMP-COL-BR-INT-05** | P3 | sa | **OPEN** — interim slug→LE map; refine 1:1 if needed |
| **C-EMP-COL-SPOT-ENV-01** | ENV | devops / local | **OPEN** — re-spot when L0 up (optional; QA already PASS) |
| Phase1 / PROD | — | — | **not promoted** |

**No residual P0/P1 product defect** on local company-col AC.

---

## 9. Gate decision

### **GO WITH CONDITIONS** — local company-col slice only

**Conditions (must remain listed):**

1. **C-EMP-COL-8088-01** — Pilot `:8088` sync / UF 🟢 **blocked** until sponsor unlocks HOLD_DEPLOY; then devops sync + QA/QC spot — **do not** claim deploy PASS without `:8088` evidence.
2. **C-EMP-COL-NEST-WATCH-01** — Optional BE fix nest watch TS2322 (P2 DX).
3. **C-EMP-COL-BR-INT-05** — SA may refine slug↔LE; interim map acceptable for AC-01.
4. **NOT Phase 1 DONE** · **NOT PROD-READY**.

**Basis:** QA browser U65 evidence AC 01..07 + J-HRM-02 PASS; evidence pack verify 8/8; code audit LE defaults / Khối reject path; HOLD_DEPLOY honored.

---

## 10. Handoff contract

```yaml
work_item_id: QC-HRM-EMP-COMPANY-COL-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qc-hrm-emp-company-col-01-20260725.md
decision: GO WITH CONDITIONS
HOLD_DEPLOY: true
completion_report: |
  Closed: QC audited QA-HRM-EMP-COMPANY-COL-01 vs AC-EMP-COL-01..07 —
  all CONCUR PASS (local); J-HRM-02 PASS; pack verify 8/8; code LE defaults OK.
  Verdict GO WITH CONDITIONS (local only). Conditions: :8088 deferred (HOLD_DEPLOY);
  nest watch P2 optional; BR-INT-05 P3 interim; NOT Phase1/PROD.
  QC live spot skipped — L0 ENV down (not product NO-GO).
next_owner: pm
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-HRM-EMP-COMPANY-COL-POST-QC-01
entry_criteria: QC-HRM-EMP-COMPANY-COL-01 GWC PASS_TO_PM · docs/qa/evidence/qc-hrm-emp-company-col-01-20260725.md
actions:
  1. Record GWC local company-col CLOSED for AC-EMP-COL-01..07 / J-HRM-02 (local).
  2. DO NOT Task devops DO-HRM-EMP-COMPANY-COL-SYNC-01 until sponsor explicitly unlocks HOLD_DEPLOY.
  3. Optional parallel (non-blocking): D-HRM-EMP-COMPANY-COL-BE-02 — fix nest --watch QueryFn TS2322 (P2 DX).
  4. Optional: when L0 up, short re-spot company column (C-EMP-COL-SPOT-ENV-01) — not required to keep GWC.
cấm: seed · claim :8088/Phase1/PROD · deploy sync without sponsor unlock
```
