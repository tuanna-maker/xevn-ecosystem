# Evidence — PO-HRM-MVP-GD1-CORE-01-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-01-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-10 · UC-BP-CORE-01) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `CORE01QA-MSL6U0AV` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (PASS_WITH_OBS P2) |
| **uc_ids** | `UC-BP-CORE-01` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · personnel/CORE UAT **false** · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | BE-01 READY · `docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-be-01.md` · FE-01 READY · `docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-fe-01.md` |
| **env** | portal `:5173` · hrm-api `:28001` **rebuild+restart** (stale dist at entry — no dependents / public-ring) · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-core-01-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-01-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-01-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **no CORE / hire UAT DONE** |
| **L0** | hrm/xbos/portal **200** |
| **L1 seal** | GET strip · deps `HRM-CORE-DEP-200` LIVE · CF salary → **403** `HRM-CORE-CB-403` · Nest `/core` **Cannot GET** DENY · summary `compensation_summary_included=false` |
| **L2.5 J-*** | **J-01..04 PASS** |
| **Nest `/core` browser** | **0 hits** |
| **U19** | list GET `/employees` · get-by-id · dependents same scope `main` / emp `2b4cbc90-…` |
| **DENY** | seed unused · honesty false retained · Nest `/core` dual · hire≠CORE DONE · reopen sealed J-07 · family⇒salary · module CORE UAT |

**Ops note (intake):** LIVE dist at entry **pre-BE-01** (no `employee-dependents` / `HRM-CORE-CB-403`) → QA **rebuild** `pnpm --filter hrm-api run build` + restart `dist/main` → seal LIVE before browser.

---

## L0 / L1

| Check | Evidence |
|-------|----------|
| Portal / HRM / XBOS | **200** |
| `GET /api/hrm/employees?company_id=main` | **200** `HRM-EMP-200` · no salary/bank/tax on rows |
| `GET /api/hrm/employees/{id}` | **200** · public strip · `custom_fields` no C&B |
| `GET …/dependents` | **200** `HRM-CORE-DEP-200` — **route LIVE** |
| `GET /api/hrm/core/employees/{id}` | **404** `HRM-DATA-404` Cannot GET — DENY dual |
| `PATCH` body `{custom_fields:{salary}}` | **403** `HRM-CORE-CB-403` |
| `PATCH` body `{salary}` top-level | **400** `HRM-VAL-001` (DTO whitelist) — P2 OBS |
| `GET /employees/summary` | **200** · `compensation_summary_included=false` · payroll zeros |
| Missing DOB POST deps | **400** `HRM-VAL-001` (DTO) before service `HRM-CORE-DEP-VAL-400` — P2 OBS |

---

## Browser U65 — journeys

Persona: portal auth inject · URL `http://127.0.0.1:5173/command-center/hrm/employees` · HRM iframe `/hr/employees/*` · **zero-seed**.

**hdsd_align:** Nhân sự → hồ sơ → Thông tin chung (CB-MAP) → Sửa hành chính → Gia đình (Cá nhân) → Thêm NPT → Lưu → F5 · forced C&B CF.

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-CORE-01-01** | List → profile general | GET `/api/hrm/employees/{id}` **200** · strip C&B · CB-MAP redirect/CTA · Nest `/core` **0** | **PASS** |
| **J-HRM-CORE-01-02** | Sửa → form no Tài chính + CB-MAP → Lưu → F5 | PATCH **200** `HRM-EMP-202` · F5 GET strip still clean | **PASS** |
| **J-HRM-CORE-01-03** | Cá nhân → Gia đình → Thêm NPT (Con + DOB 01/06/2015) → Lưu → F5 reopen | POST `…/dependents` **201** `HRM-CORE-DEP-201` · `relation_label=Con` · `date_of_birth=2015-06-01` · F5 panel name+rel+DOB · GET deps **200** | **PASS** |
| **J-HRM-CORE-01-04** | Forced CF salary/bank · top salary · missing DOB · soft-delete GET | CF → **403** `HRM-CORE-CB-403` · top → VAL-001 OBS · dep404 **404** `HRM-CORE-DEP-404` · summary gate false · Nest `/core` 0 | **PASS** |

Mutated samples:
- Employee under test: `2b4cbc90-fb74-4a2d-9fef-d188d4e48d61` (UV UAT REC soft-hire — **≠** CORE DONE)
- Dependent browser: `QA NPT Browser CORE01 MSL6UDTC` · relation_label **Con** · DOB **2015-06-01** (then soft-deleted for DEP-404)

Screens: `01-employees-list` · `02-profile-general` · `03-f5-after-patch` · `04-family-tab` · `05-dependent-created` · `06-f5-dependents` · `07-j04-done`.

---

## Residuals (non-blocking)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-CORE-01-CB-TOP-VAL-001** | P2 | peer-BE | Top-level `salary` PATCH → `HRM-VAL-001` before service `HRM-CORE-CB-403`; CF path sealed 403 |
| **R-CORE-01-DEP-VAL-DTO** | P2 | peer-BE | Missing DOB → `HRM-VAL-001` (class-validator) before mint `HRM-CORE-DEP-VAL-400` |

**What worked (must not regress):** public GET strip · CB-MAP hide/redirect · PATCH admin 2xx F5 no leak · dependents POST+relation_label+DOB F5 · CF CB-403 · DEP-404 soft-delete · Nest `/core` DENY · summary default no salary SoT · U19 list=get=deps · zero-seed · honesty false · C-SLICE.

---

## DENY / honesty

| Item | Status |
|------|--------|
| Nest `/core/*` SoT dual | **DENY** — L1 Cannot * · browser hits **0** |
| Same-form salary / family⇒salary | **DENY** |
| `pnpm seed:*` / API fake for UF | **not used** (L1 probes only) |
| Flip honesty / recruitment_uat_ready | **false** retained |
| Reopen sealed J-HRM-REC-07-* | **DENY** |
| Hire soft-link = UC-BP-CORE-01 DONE | **DENY** |
| Module CORE / personnel UAT / Phase1 DONE | **DENY** — **C-SLICE** |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-qa-01.md` |
| **completion_report** | U65 QA PASS — L0 OK; rebuild+restart seal BE-01 LIVE; J-01 public GET strip+CB-MAP PASS; J-02 PATCH admin 200 + F5 no C&B PASS; J-03 dependents POST 201 relation_label=Con DOB F5 PASS; J-04 forced CF → 403 HRM-CORE-CB-403 + DEP-404 + Nest/core 0 + summary gate PASS. P2 VAL-001 OBS top-salary/missing-DOB. Honesty false · C-SLICE · no seed · no CORE/hire UAT DONE. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-01-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-01
depends_on: QA-01 PASS_TO_PM · docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-qa-01.md · stamp CORE01QA-MSL6U0AV
entry_criteria: QA J-HRM-CORE-01-01..04 PASS; honesty false; C-SLICE; Nest /core 0; no seed in evidence
MISSION: QC GWC slice CORE-01 — audit browser evidence U65; confirm C-SLICE ≠ module CORE UAT; residual P2 VAL-001 OBS only; DENY honesty flip · hire=CORE DONE · reopen J-07 · Nest /core dual.
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-qc-01.md · GO WITH CONDITIONS (C-SLICE) or NO-GO
cấm: claim CORE/personnel UAT DONE · flip honesty · seed · Nest /core dual
```
