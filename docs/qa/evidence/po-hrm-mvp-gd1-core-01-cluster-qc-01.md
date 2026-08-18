# Evidence — PO-HRM-MVP-GD1-CORE-01-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-01-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-CORE-01 C-SLICE only** · **not** module CORE / personnel UAT |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-10) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`CORE01QA-MSL6U0AV`** · BE-01 / FE-01 READY |
| **uc_ids** | `UC-BP-CORE-01` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-core-01-cluster-qa-01.md`](po-hrm-mvp-gd1-core-01-cluster-qa-01.md) |
| **be_ref** | [`po-hrm-mvp-gd1-core-01-cluster-be-01.md`](po-hrm-mvp-gd1-core-01-cluster-be-01.md) |
| **fe_ref** | [`po-hrm-mvp-gd1-core-01-cluster-fe-01.md`](po-hrm-mvp-gd1-core-01-cluster-fe-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01.md) AC-CORE-01 · O1–O12 |
| **data_ref** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md) |
| **api_ref** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md) |
| **sa_ref** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md) Option A LOCKED |
| **machine** | `_tmp-po-hrm-mvp-gd1-core-01-cluster-qa-01.json` · overall **PASS** · stamp **`CORE01QA-MSL6U0AV`** |
| **stamp** | QC **`CORE01QC1-MSL6WMS7`** · QA **`CORE01QA-MSL6U0AV`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · personnel/CORE UAT **false** |
| **portal_url** | portal `http://127.0.0.1:5173/command-center/hrm/employees` · HRM `:28001` · `companyId=main` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **Personnel / CORE UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module |
| **Hire soft-link (REC-07) = UC-BP-CORE-01 DONE** | **DENIED** | handoff ≠ profile DONE |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/core` dual SoT** | **DENIED** | L1 Cannot GET · browser **0** hits |
| **Same-form salary / family⇒salary** | **DENIED** | CB-MAP + CB-403 sealed |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed |
| **Reopen sealed J-HRM-REC-07-*** | **DENIED** | RETAIN prior GWC `REC07QC1-MSL5WXU5` |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-10 public-ring GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `jd_dynamic_done=true`? | **NO** |
| May PM claim module CORE / personnel UAT / Phase1 DONE from this seat? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM claim hire soft-link = CORE-01 DONE? | **NO** |
| May PM open next UC seat **UC-BP-CORE-02** (board #13) as **sa Option**? | **YES** (U88/U89 continuous) |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-CORE-01** (public employee ring + dependents welfare + CB-MAP / CB-403) after QA stamp **`CORE01QA-MSL6U0AV`**.

Audited: QA-01 MD · raw JSON · screens 01–07 · L0/L1/network/journeys · BA/SA/DATA/API · BE-01 · FE-01 · DENY Nest `/core`.

**U65 ACCEPT:** List→profile public strip + CB-MAP · PATCH admin **200** `HRM-EMP-202` + F5 no C&B leak · dependents POST **201** `HRM-CORE-DEP-201` `relation_label=Con` DOB F5 · forced CF → **403** `HRM-CORE-CB-403` · DEP-404 soft-delete · summary `compensation_summary_included=false` · Nest `/core` **0**.

**P2 OBS ACCEPT (non-blocking):** top-level `salary` PATCH → `HRM-VAL-001` · missing DOB → `HRM-VAL-001` (DTO before service mint) — CF path CB-403 sealed.

**NOT Phase 1 DONE. NOT module CORE / personnel UAT. NOT hire = CORE DONE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-HRM-CORE-01-01..04 browser U65 | PRODUCT L2.5 | **ACCEPT** this seat |
| Public GET strip · CB-MAP · PATCH admin F5 | PRODUCT | **ACCEPT** |
| Dependents POST 201 + relation_label + DOB F5 | PRODUCT | **ACCEPT** |
| Forced CF → `HRM-CORE-CB-403` · DEP-404 · summary gate | PRODUCT | **ACCEPT** |
| Nest `/core` dual · 0 browser hits · L1 Cannot GET | PRODUCT / GOVERNANCE | **ACCEPT** · DENY dual |
| R-CORE-01-CB-TOP-VAL-001 · R-CORE-01-DEP-VAL-DTO | PRODUCT **P2 OBS** | **ACCEPT** non-blocking |
| Stale dist at QA intake → rebuild+restart | ENV/OPS | **ACCEPT** · class known prior seats |
| `qc:dev-stack` Windows UV assert after health 200 | ENV | **OBS** — health checks PASS |
| Honesty / seed / hire=CORE DONE / sealed J-07 reopen | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-01 public GET strip + CB-MAP · Nest `/core` 0 | QA J-01 · JSON `strip=true cbMap=true nest0=true` | 🟢 |
| 2 | J-02 PATCH admin 200 + F5 no C&B | QA J-02 · `HRM-EMP-202` · screen 03 | 🟢 |
| 3 | J-03 dependents POST 201 relation_label+DOB F5 | QA J-03 · `HRM-CORE-DEP-201` · screens 05–06 | 🟢 |
| 4 | J-04 CF CB-403 · DEP-404 · Nest 0 · summary false | QA J-04 · JSON forcedCF/dep404/nest0 | 🟢 |
| 5 | Residual P2 VAL-001 OBS only | QA residual table · no PRODUCT P0 | 🟢 **ACCEPT OBS** |
| 6 | C-SLICE ≠ module CORE UAT · honesty false | QA honesty + QC locks | 🟢 **RETAIN** |
| 7 | DENY hire=CORE DONE · reopen J-07 · Nest `/core` dual · seed | QA DENY + QC locks | 🟢 **RETAIN** |
| 8 | Pack BA/SA/DATA/API/BE/FE/QA | specs + evidence present · verify **8/8** | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-qa-01.md` | exit **0** · **8/8 PASS** |
| QC SoT pack this file | 🟢 **8/8** below |
| QC spot `pnpm run qc:dev-stack` | hrm/xbos/portal **200** (Windows UV assert after PASS — ENV OBS) |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 + QC spot `qc:dev-stack` | hrm/xbos/portal **200** | ENV/L0 |
| QA L1 public strip · deps LIVE · Nest `/core` DENY · CB-403 | deps `HRM-CORE-DEP-200` · Nest Cannot GET · CF `HRM-CORE-CB-403` | PRODUCT |
| QA runner U65 J-01..04 | overall **PASS** stamp `CORE01QA-MSL6U0AV` | PRODUCT |
| `verify:qc:evidence-pack` QA-01 | **8/8 PASS** | PROCESS |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ portal `127.0.0.1:5173` · `:28001` · `/hrm/employees` |
| 5 | journey_l25 | ✅ **J-HRM-CORE-01-01..04** 🟢 |
| 6 | crud_or_matrix | ✅ AC-CORE-01 · DEP-201 · CB-403 · Nest DENY |
| 7 | residual_section | ✅ below · P2 OBS OPEN idle-ok |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-CORE-01-01** | **PASS** | list→profile GET strip · CB-MAP · Nest `/core` 0 |
| **J-HRM-CORE-01-02** | **PASS** | PATCH admin 200 · F5 no C&B leak |
| **J-HRM-CORE-01-03** | **PASS** | dependents POST 201 · relation_label=Con · DOB F5 |
| **J-HRM-CORE-01-04** | **PASS** | CF CB-403 · VAL-001 OBS · DEP-404 · summary false · Nest 0 |
| Module CORE / personnel UAT J-* promote | **DENIED** | C-SLICE |
| **J-HRM-REC-07-*** / prior REC seals | **PASS_RETAIN** | not re-litigated · DENY reopen |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-CORE-01-01 | **PASS** |
| J-HRM-CORE-01-02 | **PASS** |
| J-HRM-CORE-01-03 | **PASS** |
| J-HRM-CORE-01-04 | **PASS** |

### Screens

`docs/qa/evidence/screens/po-hrm-mvp-gd1-core-01-cluster-qa-01/` — 01 employees-list · 02 profile-general · 03 f5-after-patch · 04 family-tab · 05 dependent-created · 06 f5-dependents · 07 j04-done.

**PM action:** stamp `PROGRAM_JOURNEY_MAP.md` J-HRM-CORE-01-01..04 with QC stamp **`CORE01QC1-MSL6WMS7`** (QA already 🟢 PASS · C-SLICE · honesty false).

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · `jd_dynamic_done=false` · personnel/CORE UAT **false** · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · hire=CORE DONE · same-form salary · seed · reopen sealed J-HRM-REC-07-*.
2. **Condition P2 OBS `R-CORE-01-CB-TOP-VAL-001`:** top-level `salary` PATCH → `HRM-VAL-001` before service `HRM-CORE-CB-403` — **ACCEPT** non-blocking; CF path CB-403 RETAIN. Optional peer-BE DTO align later — **not** reopen J-04 as P0.
3. **Condition P2 OBS `R-CORE-01-DEP-VAL-DTO`:** missing DOB → `HRM-VAL-001` (class-validator) before mint `HRM-CORE-DEP-VAL-400` — **ACCEPT** non-blocking. Optional peer-BE mint align — **not** reopen J-03/J-04 as P0.
4. **RETAIN** SA Option A physical `/api/hrm/employees*` public ring · ONE `employee_dependents` SoT · paper `/core` alias only · CB-MAP hide/redirect · U19 list=get=deps.
5. **OUT** this seat: CORE-02 C&B mutate depth · PAY formula · HĐ · module CORE UAT · invent Nest `/core` EMP dual.
6. **NOT** Phase 1 DONE · **NOT** module CORE / personnel UAT · Wave-10 **SEALED GWC** ≠ program exit.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-CORE-01-CB-TOP-VAL-001** | P2 | OPEN / idle-ok | optional **dev-be** DTO whitelist align |
| **R-CORE-01-DEP-VAL-DTO** | P2 | OPEN / idle-ok | optional **dev-be** DEP-VAL mint align |
| Honesty / C-SLICE / module UAT | — | RETAIN | **pm** — DENY flip |
| Journey map QC stamp append | PROCESS | open | **pm** same session |

**No residual PRODUCT P0** from J-HRM-CORE-01-01..04 browser matrix.

---

## DENY

- Flip `recruitment_uat_ready` / `jd_dynamic_done` / claim module CORE / personnel UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/core` dual SoT · hire soft-link = CORE-01 DONE · same-form salary / family⇒salary  
- Seed / reopen sealed J-HRM-REC-07-*  
- Treat GWC as module GO · C-SLICE-as-module-DONE · claim CORE pillar UAT DONE because public-ring seat sealed  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board #13 **UC-BP-CORE-02** Option) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-CORE-01: J-HRM-CORE-01-01..04 PASS (public strip · PATCH F5 · dependents DOB · CB-403 · Nest `/core` DENY) · P2 VAL-001 OBS only · U65 · pack 8/8. Conditions: honesty false · C-SLICE. DENY module CORE UAT / Phase1 / hire=CORE DONE / Nest dual / seed / reopen J-07. Next continuous: **UC-BP-CORE-02** SA Option. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-CORE-02
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-qc-01.md · stamp CORE01QC1-MSL6WMS7 · Wave-10 UC-BP-CORE-01 SEALED
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after CORE-01 (#12) = **UC-BP-CORE-02** (#13 QUEUED) «Hồ sơ vòng C&B (lương, BH, thuế, ngân hàng)»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-02 · DB_DESIGN / API_DESIGN CORE C&B cite · must_keep CORE-01 public strip + CB-403 + dependents + Nest /core DENY

MISSION — SA Option seat (narrow):
1) Option A/B/C for C&B employee profile ring (salary / insurance / tax / bank) vs AS-IS EMP spine + CORE-01 public allow-list boundary
2) F.1 API map + must_keep CORE-01 public GET strip · HRM-CORE-CB-403 · dependents ONE SoT · DENY Nest /core dual EMP · DENY reopen sealed J-HRM-CORE-01-01..04 without regression · DENY flip recruitment_uat_ready / personnel UAT
3) Lock decision + unlock BA AC next — cấm code until Option CONFIRMED
cấm: honesty flip · recruitment_uat_ready · jd_dynamic_done · module CORE/personnel UAT · seed · claim CORE-01 public ring = C&B DONE · Nest /core dual · reopen sealed CORE-01 / REC-07 slices
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`CORE01QC1-MSL6WMS7` · 2026-08-09 · Wave-10 UC-BP-CORE-01 **SEALED GWC** ≠ module CORE / personnel UAT
