# Evidence — PO-HRM-MVP-GD1-PLT-01-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PLT-01-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · Wave-24 · UC-BP-PLT-01) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `PLT01QA1-MSLPQZF6` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **uc_ids** | `UC-BP-PLT-01` · `FR-UC-BP-PLT-01` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `hrm_personnel_uat_ready=false` · `contracts_printable_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE-≠-MODULE** · peer catalog≠PLT DONE · merge≠platform UAT · catalog/CRUD/LIVE≠CORE-10 DONE · ≠ CORE-10/09/07 DONE · soft≠CORE-06 DONE · PAY/ATT OUT · U65 zero-seed |
| **depends_on** | FE-01 READY · API-01 CONFIRMED RETAIN · BA-01 J-01..06 DRAFT · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · Dev-BE HOLD |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-plt-01-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-plt-01-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-plt-01-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **DENY** claim peer catalog = PLT DONE · **DENY** merge LIVE = platform UAT · **DENY** catalog/CRUD/LIVE = CORE-10 DONE · **DENY** CORE-10/09/07 DONE · **DENY** invent PAY/ATT/printable/Word · **DENY** honesty flip · **DENY** seed |
| **L0** | hrm **200** · xbos **200** · portal `:5173` **200** · Nest `/core/merge-tokens` **404** |
| **L2.5 J-*** | **J-01 PASS** · **J-02 PASS** · **J-03 PASS** · **J-04 PASS** · **J-05 PASS** · **J-06 PASS** |
| **Nest `/core` TOK/PLT** | probe **404** · Network SoT non-404 **= 0** |
| **Seed** | **none** · FE upsert token only (U65) |

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| BA-01 | AC-PLT-01-* · J-HRM-PLT-01-01..06 DRAFT · O1–O12 |
| API-01 | F-PLT-TOK-01/02/03 physical `/merge-tokens*` · Nest `/core` DENY · R-PLT-01-DISP |
| FE-01 | `docs/qa/evidence/po-hrm-mvp-gd1-plt-01-cluster-fe-01.md` READY |
| CORE-10 QC | **`CORE10QC1-MSLP0EJB`** · catalog/CRUD/LIVE≠DONE · **≠** CORE-10 DONE |
| CORE-09 QC | **`CORE09QC1-MSLNBA89`** printable false RETAIN · **≠** CORE-09 DONE |
| CORE-07 QC | **`CORE07QC1-KZJTSHNT`** GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE |
| CORE-06 | soft≠DONE RETAIN |
| Mapping note | Evidence follows **PM exit_criteria** packet (J-01=list · J-02=upsert · J-03=retire · J-04=preview · J-05=peer · J-06=honesty). BA-01 DRAFT mapping differs — OBS P2 |

---

## Browser U65 — journeys (PM exit_criteria)

Persona: portal auth inject · Settings `/hr/settings?tab=contract-legal` · **zero-seed**.

**hdsd_align:** `settings-merge-tokens` · `hdsd-merge-token-{key\|label\|source\|save\|reload\|resolve-preview\|include-archived\|retire-*}` · `plt-01-honesty` · peer `settings-emp-document-types`.

| J-* | Click path / assert | Network / FE | Verdict |
|-----|---------------------|--------------|---------|
| **J-HRM-PLT-01-01** | Settings → Token merge list | **GET** `/api/hrm/merge-tokens?company_id=main&status=active` **200** · labelVi primary (Nhãn / token) · Nest `/core` TOK/PLT **0** · honestyLen 267 | **PASS** |
| **J-HRM-PLT-01-02** | Đăng ký / Upsert → Lưu → F5 | **PUT** `/api/hrm/merge-tokens` **200** · F5 row `custom.qa.plt01_mslpqzf6` + labelVi «Token PLT-01 QA mslpqzf6» · Nest 0 | **PASS** |
| **J-HRM-PLT-01-03** | Soft-retire → F5 · include_archived | **POST** `…/retire` **201** · default list **hidden** · include_archived shows archived · **no** DELETE · Nest 0 | **PASS** |
| **J-HRM-PLT-01-04** | Kiểm tra resolve (registry) | **POST** `/api/hrm/merge-tokens/resolve-preview` **201** · preview cite ≠ VER/print SoT · print-versions invent **0** · Nest 0 | **PASS** |
| **J-HRM-PLT-01-05** | Settings EMP DOC types peer | domain Nest document-types **200** (2 hits) · FE lock peer catalog≠PLT DONE · Nest 0 · **≠** claim PLT DONE | **PASS** |
| **J-HRM-PLT-01-06** | Honesty footer `plt-01-honesty` | banner **8/8** checks · seals CORE-10/09/07 in FE src · printable false · PAY/ATT OUT · soft≠CORE-06 · no reopen sealed J-* | **PASS** |

Screens: `01-merge-token-list` … `08-honesty`.

**Token fixture (LIVE FE upsert, no seed):** `custom.qa.plt01_mslpqzf6` → upsert → soft-retire.

---

## AC map

| AC | Result |
|----|--------|
| **AC-PLT-01-PATH** physical `/merge-tokens*` · Nest `/core` 0 | **PASS** |
| **AC-PLT-01-TOK-LIST** GET 200 · labelVi | **PASS** |
| **AC-PLT-01-TOK-REG** upsert 2xx + F5 | **PASS** |
| **AC-PLT-01-RETIRE** soft-retire · no hard-delete | **PASS** |
| **AC-PLT-01-FREEZE** resolve-preview ≠ VER/print invent | **PASS** (cite) |
| **AC-PLT-01-CAT** peer catalog path cite · ≠ PLT DONE | **PASS** |
| **AC-PLT-01-H / ≠-*** honesty · C-SLICE · seals RETAIN | **PASS** |
| **AC-PLT-01-PAY-ATT-OUT** | **PASS** — footer |
| **AC-PLT-01-MK-10/09/07** | **PASS** — seals RETAIN · printable false · soft≠CORE-06 DONE |
| **Nest `/core` DENY** | **PASS** |
| **Honesty / C-SLICE** | **PASS** (false · no flip · **≠** claim PLT/platform UAT DONE) |

---

## Network summary

| Metric | Value |
|--------|-------|
| `/merge-tokens*` hits | 14 (list/upsert/retire/resolve-preview) |
| Peer catalog hits | 2 (emp-document-types) |
| Nest `/core` TOK/PLT non-404 | **0** |
| Hard DELETE merge-tokens | **0** |
| print-versions / VER invent | **0** |
| Nest `/core/merge-tokens` probe | **404** |

---

## Residuals / OBS

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-PLT-01-HONESTY** | INFO | **qc** | C-SLICE · peer≠PLT DONE · merge≠UAT · catalog≠CORE-10 DONE · printable false · PAY/ATT OUT · CORE-10/09/07 RETAIN · soft≠CORE-06 DONE · **DENY** claim PLT/platform UAT DONE |
| **OBS-BA-J-MAP** | **P2 OBS** | ba-process | BA-01 DRAFT J-* mapping ≠ PM exit_criteria used this seat — align when promoting journeys |

**Ops:** L0 healthy · Dev-BE HOLD · no rebuild.

---

## Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
hrm_personnel_uat_ready=false
C-SLICE-≠-MODULE
peer catalog ≠ PLT-01 DONE
merge LIVE ≠ platform / PLT module UAT
catalog/CRUD/LIVE ≠ CORE-10 DONE
≠ CORE-10 DONE · CORE10QC1-MSLP0EJB
≠ CORE-09 DONE · printable false · CORE09QC1-MSLNBA89
≠ CORE-07 DONE · CORE07QC1-KZJTSHNT
soft ≠ CORE-06 DONE
PAY/ATT OUT invent DONE
Nest /core TOK/PLT = 0
DENY mega-EAV · U65 zero-seed
```

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-plt-01-cluster-qa-01.md` |
| **completion_report** | J-HRM-PLT-01-01..06 **PASS** U65 browser · physical `/api/hrm/merge-tokens*` (GET 200 · PUT 200 · POST retire 201 · POST resolve-preview 201) · Nest `/core` TOK/PLT **0** · labelVi primary · soft-retire no hard-delete · peer DOC types cite · honesty 8/8 · seals CORE-10/09/07 RETAIN · printable false · PAY/ATT OUT · soft≠CORE-06 DONE · **≠** claim PLT/platform UAT / CORE DONE · stamp **`PLT01QA1-MSLPQZF6`** · Dev-BE HOLD |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PLT-01-CLUSTER-QC-01
role: qc
entry_criteria: QA-01 PASS_TO_PM @ docs/qa/evidence/po-hrm-mvp-gd1-plt-01-cluster-qa-01.md stamp PLT01QA1-MSLPQZF6 · FE-01 READY · API-01 CONFIRMED RETAIN · U65 zero-seed · J-01..06 PASS
exit_criteria: GWC C-SLICE only · verify Nest /core TOK/PLT=0 · peer catalog≠PLT DONE · merge≠platform UAT · catalog/CRUD/LIVE≠CORE-10 DONE · printable false RETAIN · PAY/ATT OUT · must_keep CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · DENY claim PLT/CORE DONE · DENY honesty flip · stamp PLT01QC1-…
must_keep: CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · Dev-BE HOLD
cấm: seed · Nest /core TOK/PLT SoT · claim peer catalog=PLT DONE · merge LIVE=platform UAT · invent PAY/ATT/printable/Word · mega-EAV · honesty flip · reopen sealed J-* · claim CORE-10/09/07 DONE
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-plt-01-cluster-qc-01.md
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-plt-01-cluster-qa-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-plt-01-cluster-fe-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01.md
```

---

*End QA-01 · PASS_TO_PM · stamp PLT01QA1-MSLPQZF6 · U89 Wave-24 · C-SLICE · ≠ PLT DONE.*
