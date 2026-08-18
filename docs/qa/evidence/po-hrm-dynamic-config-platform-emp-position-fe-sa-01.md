# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-FE-SA-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-FE-SA-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance · U88 |
| **parent** | EMP-POSITION-CATALOG-QC-01 **GWC** `EMPPOSQA2-MSK3CDH1` · DOCS CH06f **ACCEPT** · residual **FE WH picker deepen HOLD** → mint **R-PLT-EMP-POS-FE-01** |
| **u88_prior** | EMP-STATUS QC-FE-01 **GWC** · **R-PLT-EMP-ST-FE-01 CLOSED ACCEPT** (e479b628) · FE-ADMIN EMP-ST **HOLD RETAIN** · LVRULE 01g **HOLD RETAIN** · peer EMP-STATUS/ATT-CODE FE-SA Option A |
| **verdict** | **CONFIRMED** — Option **A LOCKED** · **UNLOCK FE consumer Settings `job_titles` EFF picker deepen** |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-08 |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · `C-SLICE-≠-MODULE` · U65 |
| **path_lock** | NFD `.git`+`apps` True · WriteAllText UTF-8 no BOM |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-FE-SA-01.md` |

---

## 1. read_first ack

| Artifact | Used |
|----------|------|
| `po-hrm-dynamic-config-platform-emp-position-catalog-qc-01.md` | GWC L1 · stamp `EMPPOSQA2-MSK3CDH1` · FE WH picker HOLD · Nest deny · honesty false · seals RETAIN · R-PLT-EMP-POS-BE-01 CLOSED |
| `po-hrm-dynamic-config-platform-emp-position-catalog-docs-01.md` | CH06f ACCEPT · FE HOLD note · invent KEY cite · admin≠consumer |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md` | Option A Settings/XBOS `job_titles` SoT · Nest DENY |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01.md` | AC-01/01b/01c/01d/01e/01H · VAL-EMP-POS-CNS-* |
| Peer `po-hrm-dynamic-config-platform-emp-status-fe-sa-01.md` | Option **A UNLOCK** — **preferred class** |
| Peer LVRULE FE-01g SA | ACCEPT_AS_IS_P2 HOLD — **contrast REJECT as default** |
| FE read-only | `EmployeeFormDialog` CatalogSearchPicker job_titles · `EmployeeWorkTimeline` position_key picker + emptyHint · `useEmployeeMutations` STATUS KEY toast only · **no** POSITION KEY toast · Nest emp_position ABSENT |
| QA-FE EMP-STATUS OBS | UAT `job_title_key=STAFF` → **400 `HRM-EMP-POSITION-KEY`** orthogonal — cite · **do not reopen** EMP-STATUS FE CLOSED |

---

## 2. AS-IS vs TO-BE (FE residual only)

| Layer | AS-IS | TO-BE (Option A) |
|-------|-------|------------------|
| Settings `job_titles` EFF | LIVE L1 · invent KEY · admin CREATE/sync | **RETAIN** SoT — no Nest invent |
| Consumer EMP position picker | CatalogSearchPicker LIVE | **RETAIN** + deepen invent toast / edit resolve |
| Consumer WH position_key | CatalogSearchPicker LIVE + emptyHint | **RETAIN** + invent KEY toast on 400 |
| EMP mutate KEY toast | STATUS/REASON only | ADD **`HRM-EMP-POSITION-KEY`** (WH alias ≡) |
| Nest `emp_position` | DENIED | **DENIED RETAIN** |
| EMP-STATUS FE | CLOSED ACCEPT | **CLOSED RETAIN** |
| LVRULE / EMP-ST FE-ADMIN | HOLD | **HOLD RETAIN** |
| Honesty | false | **false RETAIN** |

---

## 3. Option decision summary

| Option | Summary | Result |
|--------|---------|--------|
| **A** Unlock FE consumer Settings EFF deepen (peer EMP-STATUS/ATT-CODE) | Closable Condition; invent KEY toast + picker SoT | **LOCKED / SELECTED** |
| **B** ACCEPT_AS_IS_P2 HOLD | Defer until sponsor — LVRULE class | **REJECT default** (wrong class; retain only if sponsor defer) |
| **C** Invent Nest / reopen EMP-STATUS FE / invent LVRULE / flip | Seal churn | **REJECT** |

**Weighted:** A **154** · B 91 · C 4 (see spec §3).

**Why not B (LVRULE peer):** LVRULE 01g = admin FE ABSENT + BE panel MVP + QC DENY invent FE. EMP-POSITION FE = **consumer surface LIVE** (`EmployeeFormDialog` + `EmployeeWorkTimeline`) + Settings EFF LIVE + invent KEY LIVE + AC picker locked + QC residual owner later **dev-fe** — same class as **EMP-STATUS / ATT-CODE FE-SA Option A** already UNLOCK.

**Why not C:** Dispatch DENY Nest emp_position · invent LVRULE · invent EMP-ST FE-ADMIN · reopen EMP-STATUS FE CLOSED · reopen L1 POSITION · flip personnel · module EMP UAT · Face · seed.

---

## 4. Residual disposition matrix

| Residual | Pre-SA | Post-SA |
|----------|--------|---------|
| **R-PLT-EMP-POS-FE-01** | P2 HOLD (QC/DOCS note) | **UNLOCK** → dispatch **dev-fe** FE-01 |
| Nest `emp_position` | DENIED | **DENIED RETAIN** |
| EMP-STATUS FE CLOSED | CLOSED | **RETAIN CLOSED** |
| FE-ADMIN EMP-ST / LVRULE 01g | HOLD | **HOLD RETAIN** — DENY invent |
| EMP-POSITION L1 | SEALED `EMPPOSQA2-MSK3CDH1` | **RETAIN** |
| EMP-CUSTOM / EXT / DOC-ET / ATT | SEAL RETAIN | **RETAIN** |
| DOCS CH06f | ACCEPT | **RETAIN** |
| Orthogonal STAFF POSITION KEY OBS | Out-of-seat EMP-STATUS | **OWNED** by R-PLT-EMP-POS-FE-01 |

---

## 5. Consumer surfaces + EFF>0 Settings bind (UNLOCK inventory)

| Surface | File | AS-IS bind | Deepen target |
|---------|------|------------|---------------|
| Form position Select/picker | `EmployeeFormDialog.tsx` | Settings `job_titles` CatalogSearchPicker | EFF>0 picker SoT · invent toast · edit resolve STAFF/invent |
| WH timeline position | `EmployeeWorkTimeline.tsx` | CatalogSearchPicker `position_key` | Invent KEY toast · empty CTA retain |
| EMP mutate toast | `useEmployeeMutations.ts` | STATUS KEY only | ADD POSITION KEY toast VI |
| Empty CTA | form + WH | Settings link | Align CH06f · empty-catalog · **no seed** |
| Invent toast | partial | STATUS only | **400 `HRM-EMP-POSITION-KEY`** (+ WH alias ≡) |

**EFF proof (cite QC/QA — not re-opened):** Settings `job_titles` active **8** · invent PATCH **400 `HRM-EMP-POSITION-KEY`** · invent not persisted (`STAFF` retained on probe emp) · Nest GET emp-position **404** · stamp `EMPPOSQA2-MSK3CDH1`.

**Orthogonal OBS cite:** EMP-STATUS QA-FE first attempt on UAT NV `job_title_key=STAFF` → **400 POSITION-KEY** while Nest status body OK — **ACCEPT OBS** · owned here · **FORBIDDEN** reopen EMP-STATUS FE CLOSED.

---

## 6. DENY checklist (verified this seat)

| DENY | Status |
|------|--------|
| Nest `emp_position` | **PASS** — DENIED RETAIN |
| invent LVRULE FE 01g | **PASS** — HOLD RETAIN |
| invent EMP-ST FE-ADMIN / reopen EMP-STATUS FE CLOSED | **PASS** — FORBIDDEN |
| reopen EMP-POSITION L1 / EMP-CUSTOM / EXT | **PASS** — RETAIN |
| flip `*_ready` / module EMP UAT / Face | **PASS** — honesty false |
| seed | **PASS** — U65 |
| apps/** this SA seat | **PASS** — docs only |

---

## 7. Path / length proof

| Check | Result |
|-------|--------|
| Repo `.git` AND `apps` | **True** (NFD) |
| Write method | `[IO.File]::WriteAllText(..., UTF8Encoding($false))` |
| Spec Length ≥ 4000 | *(printed after write)* |
| Evidence Length ≥ 3000 | *(printed after write)* |
| NFC shadow write | **DENIED** |

---

## 8. Honesty / non-claims / seals

| Flag / seal | State |
|-------------|-------|
| `hrm_personnel_uat_ready` | **false** — DENIED flip |
| `employees_e2e_linkage_ready` | **false** — DENIED flip |
| `contracts_printable_ready` | **false** — DENIED flip |
| EMP-POSITION L1 `EMPPOSQA2-MSK3CDH1` | **SEAL RETAIN** |
| EMP-STATUS L1 `EMPSTQA-MSK20G7H` | **SEAL RETAIN** |
| EMP-STATUS FE CLOSED | **RETAIN CLOSED** |
| EMP-CUSTOM CNS `EMPCFQA-MSK14LUH` | **SEAL RETAIN** |
| MergeToken EMP EXT `EMPTOKEXTQA-MSJ57PE1` | **SEAL RETAIN** |
| DOC/ET · ATT/SI/CTR | **SEAL RETAIN** |
| LVRULE FE-01g | **ACCEPT_AS_IS_P2 HOLD RETAIN** |
| Nest `emp_position` | **DENIED** |
| Module EMP UAT / Phase1 / UF 🟢 / Face | **DENIED** — `C-SLICE-≠-MODULE` |
| Seed (U65) | **DENIED** |

---

## 9. completion_report

**Closed:** SA Option/F.1 for EMP-POSITION FE WH picker HOLD — Option **A LOCKED UNLOCK** consumer Settings `job_titles` EFF picker deepen (peer EMP-STATUS/ATT-CODE FE-SA); minted **R-PLT-EMP-POS-FE-01**; Nest `emp_position` DENY RETAIN; EMP-STATUS FE CLOSED / EMP-CUSTOM / ATT / LVRULE HOLD RETAIN; honesty false · C-SLICE; docs-only; no apps/**.

**Open:** PM Task **dev-fe** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-FE-01` → QA-FE → QC-FE Condition close.

**next_owner:** **pm** → **dev-fe**

**ack_status:** **PASS_TO_PM** · **CONFIRMED**

**evidence_path:** this file · spec sibling

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-FE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P2
change_mode: ADD
residual: R-PLT-EMP-POS-FE-01
entry_criteria:
  - SA FE Option A LOCKED — docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-FE-SA-01.md
  - L1 EMPPOSQA2-MSK3CDH1 RETAIN · Settings job_titles EFF LIVE · invent KEY HRM-EMP-POSITION-KEY LIVE
  - peer: EMP-STATUS / ATT-CODE FE deepen pattern
  - cite STAFF POSITION KEY OBS — do NOT reopen EMP-STATUS FE CLOSED
exit_criteria:
  - EmployeeFormDialog + EmployeeWorkTimeline position picker = Settings job_titles EFF when EFF>0; empty CTA when EFF=0
  - invent / out-of-EFF → 400 HRM-EMP-POSITION-KEY (or WH-PICK-REQUIRED ≡) + VI toast · no persist
  - vitest + lint/build PASS · CODE-MEMORY · READY_FOR_QA
cấm: Nest emp_position · invent LVRULE · invent EMP-ST FE-ADMIN · reopen EMP-STATUS FE CLOSED · reopen L1 · seed · flip ready · module EMP UAT · Face
allowed_paths:
  - apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx
  - apps/web/hrm/src/components/employee/EmployeeWorkTimeline.tsx
  - apps/web/hrm/src/hooks/useEmployeeMutations.ts
  - apps/web/hrm/src/lib/empPositionCatalog.ts (+test) optional
  - apps/web/hrm/src/lib/catalogSearchPicker.ts (+test) optional
  - apps/web/hrm/src/integrations/hrmApi.ts (toast/error const only)
must_keep: POSITION KEY · EMP-STATUS FE CLOSED · EMP-CUSTOM · ATT · LVRULE HOLD · Nest emp_position DENY
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-fe-01.md
ack_status_target: READY_FOR_QA
```

---

## 10. Hand-off fields

| Field | Value |
|-------|--------|
| **completion_report** | Option A LOCKED UNLOCK FE consumer Settings job_titles EFF picker deepen; R-PLT-EMP-POS-FE-01; Nest DENY; seals RETAIN; honesty false · C-SLICE |
| **next_owner** | pm → dev-fe |
| **next_dispatch_prompt** | §9 above |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-fe-sa-01.md` |
| **ack_status** | **PASS_TO_PM** |