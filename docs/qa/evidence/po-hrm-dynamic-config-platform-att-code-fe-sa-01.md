# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-FE-SA-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-FE-SA-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance · U88 |
| **parent** | ATT-CODE-CATALOG-QC-01 **GWC** `ATTCODEQA-MSK4T1A5` · DOCS CH05c **ACCEPT** · residual **R-PLT-ATT-CODE-FE-01** HOLD |
| **u88_prior** | ATT-COMP OTC-03 **CLOSED** · LVRULE FE-01g Option B **ACCEPT_AS_IS_P2 HOLD** |
| **verdict** | **CONFIRMED** — Option **A LOCKED** · **UNLOCK FE consumer Nest EFF rebind** |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-08 |
| **honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · formula HOLD · aggregate GĐ1 sealed · `C-SLICE-≠-MODULE` · U65 |
| **path_lock** | NFD `.git`+`apps` True · WriteAllText UTF-8 no BOM |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-FE-SA-01.md` |

---

## 1. read_first ack

| Artifact | Used |
|----------|------|
| `PO_HRM_CONTINUOUS_W8_20260807.md` ATT-CODE rows | SA/BA/DATA/BE/QA/QC/DOCS · QC GWC FE HOLD · DOCS ACCEPT CH05c |
| `po-hrm-dynamic-config-platform-att-code-catalog-qc-01.md` | GWC L1 · residual **R-PLT-ATT-CODE-FE-01** P2 HOLD «do not invent FE as L1 mandatory» · owner later **dev-fe** |
| `po-hrm-dynamic-config-platform-att-code-catalog-docs-01.md` | CH05c ACCEPT · FE HOLD note · invent KEY cite · counting sealed |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md` | Option B Nest SoT · Unlock FE after BA · AC-01/01f |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01.md` | AC-01/01b/01c/01f · VAL-CNS-06 FE hardcode GAP · S-ATT-CODE-CNS-01 |
| Peer `ot-type-catalog-fe-01.md` · `att-comp-type-catalog-fe-01.md` · `att-shift-catalog-fe-01.md` | Nest EFF Select consumer rebind pattern |
| Peer `ATT-LVRULE-FE-01G-SA-01.md` | ACCEPT_AS_IS_P2 HOLD class — ABSENT admin + MVP panel · **contrast** |
| FE read-only | `AttendanceRecordsTable.tsx` hardcode `API_STATUS_OPTIONS` + divergent map · **no** attendance-codes EFF hook |
| BE read-only | `GET attendance-codes/effective` LIVE · KEY sealed |

---

## 2. AS-IS vs TO-BE (FE residual only)

| Layer | AS-IS | TO-BE (Option A) |
|-------|-------|------------------|
| Nest catalog | LIVE L1 · invent KEY · EFF admin | **RETAIN** — no BE reopen |
| Consumer Edit Select | Hardcode 4 statuses | Nest EFF options when EFF>0 |
| Consumer filter / badge | Hardcode map incl. early_leave/on_leave | Prefer catalog/BE labels; reconcile divergence |
| FE hook | ABSENT | ADD `useAttAttendanceCodesEffective` peer OT |
| FE admin Settings | ABSENT | **HOLD** FE-ADMIN — **no invent** |
| LVRULE / OT FE-ADMIN | HOLD | **RETAIN HOLD** — **no invent** |
| Honesty | false | **false RETAIN** |

---

## 3. Option decision summary

| Option | Summary | Result |
|--------|---------|--------|
| **A** Unlock FE consumer Nest EFF (peer OT/COMP/SHIFT) | Closable Condition; admin N+1 usable on bảng ghi công | **LOCKED / SELECTED** |
| **B** ACCEPT_AS_IS_P2 HOLD | Defer until sponsor — LVRULE class | **REJECT default** (wrong class; retain only if sponsor defer) |
| **C** Invent admin / invent LVRULE / reopen / flip | Seal churn | **REJECT** |

**Weighted:** A **154** · B 91 · C 4 (see spec §3).

**Why not B (LVRULE peer):** LVRULE 01g = admin FE ABSENT + BE panel MVP + QC DENY invent FE. ATT-CODE FE-01 = **consumer surface LIVE** + Nest EFF LIVE + AC picker locked + QC residual owner **dev-fe** — same class as OT-TYPE/COMP/SHIFT FE-01 already CLOSED.

**Why not C:** Dispatch DENY invent LVRULE FE 01g · invent OT-comp FE-ADMIN · reopen COMP OTC-03 / OT-TYPE L1 · flip ready · formula LIVE · module ATT UAT · seed.

---

## 4. Residual disposition matrix

| Residual | Pre-SA | Post-SA |
|----------|--------|---------|
| **R-PLT-ATT-CODE-FE-01** | P2 HOLD (L1 deferred) | **UNLOCK** → dispatch **dev-fe** FE-01 |
| **R-PLT-ATT-CODE-FE-ADMIN** | Implicit ABSENT | **HOLD NOTE RETAIN** — DENY invent |
| LVRULE FE-01g | ACCEPT_AS_IS_P2 HOLD | **RETAIN** — DENY invent |
| COMP OTC-03 | CLOSED | **RETAIN CLOSED** |
| OT-TYPE L1/FE | SEALED/CLOSED | **RETAIN** |
| ATT-CODE L1 | SEALED `ATTCODEQA-MSK4T1A5` | **RETAIN** — cấm reopen invent KEY |

---

## 5. DENY checklist (verified this seat)

| DENY | Status |
|------|--------|
| invent LVRULE FE 01g | **PASS** — HOLD RETAIN cite |
| invent OT-comp / OT-TYPE FE-ADMIN | **PASS** — FORBIDDEN |
| reopen COMP OTC-03 / OT-TYPE L1 | **PASS** — RETAIN |
| flip `*_ready` / formula LIVE / module ATT UAT | **PASS** — honesty false |
| seed | **PASS** — U65 |
| apps/** this SA seat | **PASS** — docs only |
| aggregate rewrite | **PASS** — GĐ1 sealed |

---

## 6. Path / length proof

| Check | Result |
|-------|--------|
| Repo `.git` AND `apps` | **True** (NFD) |
| Write method | `[IO.File]::WriteAllText(..., UTF8Encoding($false))` |
| Spec Length ≥ 3000 | *(printed after write)* |
| Evidence Length ≥ 3000 | *(printed after write)* |

---

## 7. completion_report

**Closed:** SA Option/F.1 for ATT-CODE FE HOLD — Option **A LOCKED UNLOCK** consumer Nest EFF rebind (peer OT-TYPE/COMP/SHIFT); FE-ADMIN ATT-CODE HOLD RETAIN; LVRULE 01g / OT FE-ADMIN invent DENY; COMP OTC-03 / OT-TYPE / ATT-CODE L1 RETAIN; honesty false · C-SLICE; docs-only.

**Open:** PM Task **dev-fe** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-FE-01` → QA-FE → QC-FE Condition close.

**next_owner:** **pm** → **dev-fe**

**ack_status:** **PASS_TO_PM** · **CONFIRMED**

**evidence_path:** this file · spec sibling

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-FE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P2
change_mode: ADD
entry_criteria:
  - SA FE Option A LOCKED — docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-FE-SA-01.md
  - L1 ATTCODEQA-MSK4T1A5 RETAIN · GET …/attendance-codes/effective LIVE
  - peer: ot-type / ot-comp / shift FE Nest EFF pattern
exit_criteria:
  - AttendanceRecordsTable Edit Select = Nest EFF when EFF>0; bootstrap only EFF=0
  - submit Nest code; invent 400 HRM-ATT-CODE-KEY toast; early_leave/on_leave not sole SoT when EFF>0
  - vitest + lint/build PASS · CODE-MEMORY · READY_FOR_QA
cấm: invent FE-ADMIN · invent LVRULE 01g · reopen COMP/OT/CODE L1 · seed · flip ready · aggregate rewrite · module ATT UAT
allowed_paths:
  - apps/web/hrm/src/components/attendance/AttendanceRecordsTable.tsx
  - apps/web/hrm/src/hooks/useAttAttendanceCodesEffective.ts (+test)
  - apps/web/hrm/src/integrations/hrmApi.ts (EFF list only)
  - apps/web/hrm/src/lib/attAttendanceCodeCatalog.ts (+test) optional
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-fe-01.md
ack_status_target: READY_FOR_QA
```

---

## 8. Hand-off fields

| Field | Value |
|-------|--------|
| **completion_report** | Option A LOCKED UNLOCK FE consumer Nest EFF; FE-ADMIN HOLD; DENY LVRULE/OT invent; seals RETAIN; honesty false |
| **next_owner** | pm → dev-fe |
| **next_dispatch_prompt** | §7 above |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-fe-sa-01.md` |
| **ack_status** | **PASS_TO_PM** |