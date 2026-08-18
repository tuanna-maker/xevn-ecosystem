# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01 (R2)

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01` |
| **dispatch_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01-R2` |
| **r2_note** | Prior SA `ae297c91` INVALID-HANDOFF (empty · 0 files) — R2 WriteAllText on NFD `.git`+`apps` True |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance · U88 |
| **parent** | EMP-STATUS-CATALOG-QC-01 **GWC** `EMPSTQA-MSK20G7H` · DOCS CH06e **ACCEPT** · residual **R-PLT-EMP-ST-FE-01** HOLD |
| **u88_prior** | EMP-STATUS L1 SEAL + DOCS ACCEPT · peer ATT-CODE FE-SA Option A UNLOCK · LVRULE FE-01g ACCEPT_AS_IS HOLD contrast |
| **verdict** | **CONFIRMED** — Option **A LOCKED** · **UNLOCK FE consumer Nest EFF status/reason rebind** |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-08 |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · `C-SLICE-≠-MODULE` · U65 |
| **path_lock** | NFD `.git`+`apps` True · WriteAllText UTF-8 no BOM |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01.md` |

---

## 1. read_first ack

| Artifact | Used |
|----------|------|
| `po-hrm-dynamic-config-platform-emp-status-catalog-qc-01.md` | GWC L1 · residual **R-PLT-EMP-ST-FE-01** P2 HOLD «do not invent FE as L1 mandatory» · owner later **dev-fe** · honesty false · seals RETAIN |
| `po-hrm-dynamic-config-platform-emp-status-catalog-docs-01.md` | CH06e ACCEPT · FE HOLD note · invent KEY pair cite · CHK DROP · admin≠consumer |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md` | Option B Nest SoT · Unlock FE after BA · L-EMP-ST-01/05/06 |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md` | AC-01/01b/01c/01d/01H · VAL-EMP-ST-CNS-02 FE hardcode GAP · VAL-EMP-STR-CNS-* |
| Peer `po-hrm-dynamic-config-platform-att-code-fe-sa-01.md` | Option **A UNLOCK** consumer Nest EFF — **preferred class** |
| Peer `po-hrm-dynamic-config-platform-att-lvrule-fe-01g-sa-01.md` | ACCEPT_AS_IS_P2 HOLD — ABSENT admin + MVP panel · **contrast REJECT as default** |
| FE read-only | `EmployeeFormDialog.tsx` Settings MD + hardcode fallback 3 · `Employees.tsx` filter hardcode · **no** employment-statuses EFF hook · **no** status_reason Select |
| BE read-only | `GET employment-statuses/effective` + `status-reasons/effective` LIVE · KEY sealed · CHK DROP |

---

## 2. AS-IS vs TO-BE (FE residual only)

| Layer | AS-IS | TO-BE (Option A) |
|-------|-------|------------------|
| Nest ST/STR catalog | LIVE L1 · invent KEY pair · EFF admin | **RETAIN** — no BE reopen |
| Consumer form status Select | Settings MD + hardcode `active\|probation\|inactive` | Nest ST EFF options when EFF>0 |
| Consumer reason Select | **ABSENT** | ADD Nest STR EFF when requires_reason / reason EFF>0 |
| Consumer list filter | Hardcode 3 | Prefer Nest ST EFF when EFF>0 |
| FE hooks | ABSENT | ADD `useEmpEmploymentStatusesEffective` + `useEmpStatusReasonsEffective` |
| FE admin Settings Nest ST/STR | ABSENT | **HOLD** FE-ADMIN — **no invent** |
| LVRULE / ATT-CODE FE-ADMIN | HOLD | **RETAIN HOLD** — **no invent** |
| Honesty | false | **false RETAIN** |

---

## 3. Option decision summary

| Option | Summary | Result |
|--------|---------|--------|
| **A** Unlock FE consumer Nest EFF (peer ATT-CODE/OT/COMP/SHIFT) | Closable Condition; admin N+1 usable on hồ sơ NV | **LOCKED / SELECTED** |
| **B** ACCEPT_AS_IS_P2 HOLD | Defer until sponsor — LVRULE class | **REJECT default** (wrong class; retain only if sponsor defer) |
| **C** Invent admin / invent LVRULE / reopen / flip | Seal churn | **REJECT** |

**Weighted:** A **154** · B 91 · C 4 (see spec §3).

**Why not B (LVRULE peer):** LVRULE 01g = admin FE ABSENT + BE panel MVP + QC DENY invent FE. EMP-STATUS FE-01 = **consumer surface LIVE** (`EmployeeFormDialog`) + Nest ST/STR EFF LIVE + AC picker locked + QC residual owner **dev-fe** — same class as **ATT-CODE FE-SA Option A** already UNLOCK.

**Why not C:** Dispatch DENY invent LVRULE FE 01g · invent ATT-CODE FE-ADMIN · reopen EMP-STATUS L1 · flip personnel · module EMP UAT · seed.

---

## 4. Residual disposition matrix

| Residual | Pre-SA | Post-SA |
|----------|--------|---------|
| **R-PLT-EMP-ST-FE-01** | P2 HOLD (L1 deferred) | **UNLOCK** → dispatch **dev-fe** FE-01 |
| **R-PLT-EMP-ST-FE-ADMIN** | Implicit ABSENT | **HOLD NOTE RETAIN** — DENY invent |
| LVRULE FE-01g | ACCEPT_AS_IS_P2 HOLD | **RETAIN** — DENY invent |
| EMP-STATUS L1 | SEALED `EMPSTQA-MSK20G7H` | **RETAIN** — cấm reopen invent KEY |
| EMP-CUSTOM / EXT / DOC-ET / ATT | SEAL RETAIN | **RETAIN** |
| DOCS CH06e | ACCEPT | **RETAIN** |

---

## 5. Consumer surfaces + EFF>0 Nest (UNLOCK inventory)

| Surface | File | AS-IS bind | Nest EFF target |
|---------|------|------------|-----------------|
| Form status Select | `EmployeeFormDialog.tsx` | Settings `employee_statuses`/`employment_statuses` + hardcode 3 | `GET …/employment-statuses/effective` when EFF>0 |
| Form reason Select | — ABSENT | free-text / none | `GET …/status-reasons/effective` when requires_reason |
| List filter | `Employees.tsx` | hardcode 3 SelectItem | Nest ST EFF codes when EFF>0 |
| Badge / list label | `StatusBadge` / list columns | i18n/hardcode | Prefer BE `status_label` |
| Invent toast | — | none | 400 `HRM-EMP-STATUS-KEY` + `HRM-EMP-STATUS-REASON-KEY` |
| Empty CTA | partial Settings | — | EFF=0 CTA Settings / CH06e · **no seed** |

**EFF proof (cite QC/QA — not re-opened):** ST effective **200** total≥1 · STR effective **200** (empty OK) · invent STATUS-KEY **400** · invent REASON-KEY **400** · stamp `EMPSTQA-MSK20G7H`.

---

## 6. DENY checklist (verified this seat)

| DENY | Status |
|------|--------|
| invent LVRULE FE 01g | **PASS** — HOLD RETAIN cite |
| invent ATT-CODE FE-ADMIN / EMP-STATUS FE-ADMIN | **PASS** — FORBIDDEN |
| reopen EMP-STATUS L1 / EMP-CUSTOM / EXT | **PASS** — RETAIN |
| flip `*_ready` / module EMP UAT | **PASS** — honesty false |
| seed | **PASS** — U65 |
| apps/** this SA seat | **PASS** — docs only |
| invent LVRULE 01g as «companion» | **PASS** — FORBIDDEN |

---

## 7. Path / length proof

| Check | Result |
|-------|--------|
| Repo `.git` AND `apps` | **True** (NFD) |
| Write method | `[IO.File]::WriteAllText(..., UTF8Encoding($false))` |
| Spec Length ≥ 4000 | *(printed after write — exit FAIL if below)* |
| Evidence Length ≥ 3000 | *(printed after write — exit FAIL if below)* |
| NFC shadow write | **DENIED** |

---

## 8. Honesty / non-claims / seals

| Flag / seal | State |
|-------------|-------|
| `hrm_personnel_uat_ready` | **false** — DENIED flip |
| `employees_e2e_linkage_ready` | **false** — DENIED flip |
| `contracts_printable_ready` | **false** — DENIED flip |
| EMP-STATUS L1 `EMPSTQA-MSK20G7H` | **SEAL RETAIN** — DENIED reopen invent KEY |
| EMP-CUSTOM CNS `EMPCFQA-MSK14LUH` | **SEAL RETAIN** |
| MergeToken EMP EXT `EMPTOKEXTQA-MSJ57PE1` | **SEAL RETAIN** |
| DOC/ET · ATT/SI/CTR | **SEAL RETAIN** |
| LVRULE FE-01g | **ACCEPT_AS_IS_P2 HOLD RETAIN** |
| Module EMP UAT / Phase1 / UF 🟢 | **DENIED** — `C-SLICE-≠-MODULE` |
| Seed (U65) | **DENIED** |

---

## 9. completion_report

**Closed:** SA Option/F.1 for EMP-STATUS FE HOLD — **R2** NFD rewrite · Option **A LOCKED UNLOCK** consumer Nest EFF status/reason rebind (peer ATT-CODE FE-SA); FE-ADMIN EMP-STATUS HOLD RETAIN; LVRULE 01g / ATT-CODE FE-ADMIN invent DENY; EMP-STATUS L1 / EMP-CUSTOM / EXT / ATT seals RETAIN; honesty false · C-SLICE; docs-only.

**Open:** PM Task **dev-fe** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-01` → QA-FE → QC-FE Condition close.

**next_owner:** **pm** → **dev-fe**

**ack_status:** **PASS_TO_PM** · **CONFIRMED**

**evidence_path:** this file · spec sibling

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P2
change_mode: ADD
entry_criteria:
  - SA FE Option A LOCKED — docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01.md
  - L1 EMPSTQA-MSK20G7H RETAIN · GET …/employment-statuses/effective + status-reasons/effective LIVE
  - peer: ATT-CODE / OT-TYPE / OT-COMP FE Nest EFF pattern
exit_criteria:
  - EmployeeFormDialog status Select = Nest ST EFF when EFF>0; bootstrap only EFF=0 + CTA
  - reason Select when requires_reason from Nest STR EFF
  - submit Nest keys; invent 400 HRM-EMP-STATUS-KEY / HRM-EMP-STATUS-REASON-KEY toast
  - Employees filter prefer Nest EFF when EFF>0
  - vitest + lint/build PASS · CODE-MEMORY · READY_FOR_QA
cấm: invent FE-ADMIN · invent LVRULE 01g · invent ATT-CODE FE-ADMIN · reopen L1/EMP-CUSTOM · seed · flip ready · module EMP UAT
allowed_paths:
  - apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx
  - apps/web/hrm/src/pages/Employees.tsx (status filter)
  - apps/web/hrm/src/hooks/useEmpEmploymentStatusesEffective.ts (+test)
  - apps/web/hrm/src/hooks/useEmpStatusReasonsEffective.ts (+test)
  - apps/web/hrm/src/integrations/hrmApi.ts (EFF list only)
  - apps/web/hrm/src/lib/empEmploymentStatusCatalog.ts (+test) optional
  - apps/web/hrm/src/components/common/StatusBadge.tsx optional
must_keep: ST/STR KEY · EMP-CUSTOM · ATT seals · LVRULE HOLD
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-fe-01.md
ack_status_target: READY_FOR_QA
```

---

## 10. Hand-off fields

| Field | Value |
|-------|--------|
| **completion_report** | Option A LOCKED UNLOCK FE consumer Nest EFF ST/STR; FE-ADMIN HOLD; DENY LVRULE/ATT invent; seals RETAIN; honesty false · C-SLICE |
| **next_owner** | pm → dev-fe |
| **next_dispatch_prompt** | §9 above |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-fe-sa-01.md` |
| **ack_status** | **PASS_TO_PM** |