# Evidence — PO-HRM-MVP-GD1-CORE-09B-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · UC-BP-CORE-09b) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `CORE09BQA-MSLAWKV6` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (PASS_WITH_OBS P2) |
| **uc_ids** | `UC-BP-CORE-09b` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR UAT **false** · **C-SLICE-≠-MODULE** · U65 zero-seed · **≠ CORE-09a=printable DONE** · **≠ 09c VER/PDF · 09d TPL invent DONE** |
| **depends_on** | FE-01 READY · `docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-fe-01.md` · API-01 CONFIRMED RETAIN · peer `CORE09AQC1-MSLA4LX9` |
| **env** | portal `:5173` **200** · hrm-api `:28001` **200** · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-core-09b-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-09b-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-09b-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **no CORE / CTR / personnel UAT DONE** · **printable false** |
| **L0** | hrm/xbos/portal **200** (`:5173`) |
| **L1 seal** | GET pack-resolve **200** `HRM-CTR-PACK-200` · Nest `/core/…/pack-resolve` **404** · Nest `/core/…/preview` **404** · active TPL GENERAL/IT/DRIVER present |
| **L2.5 J-*** | **J-HRM-CORE-09B-01..04 PASS** |
| **Nest `/core` browser** | **0 hits** |
| **Physical Network** | pack-resolve + preview + registry only on `/contracts-insurance/contracts*` |
| **Preview VER INSERT** | **0** POST print-versions during preview |
| **DENY** | seed unused · honesty false retained · Nest `/core` dual · printable flip · CORE-09a=printable · 09c/09d invent DONE |

**Env note (not seed):** IT_OFFICE / DRIVER XEVN starters were **draft** at wave entry; activated via production `POST …/contract-templates/:id/activate` (same as Settings «Hiệu lực») so pack switch could bind active TPL — **no** `pnpm seed:*` · **no** invent rows.

---

## L0 / L1

| Check | Evidence |
|-------|----------|
| HRM / XBOS / portal | **200** / **200** / **200** `:5173` |
| `GET …/contracts/pack-resolve?employee_id=` | **200** `HRM-CTR-PACK-200` · suggested **GENERAL** · allowed GENERAL/IT_OFFICE/DRIVER/LOGISTICS |
| `GET …/core/contracts/pack-resolve` | **404** Cannot GET — DENY dual |
| `POST …/core/contracts/:id/preview` | **404** Cannot POST — DENY dual |
| Active templates | **33** · GENERAL **31** · IT_OFFICE **1** (`XEVN_FT_12M_OFFICE`) · DRIVER **1** (`XEVN_FT_12M_DRIVER`) |
| CORE-09a smoke | GET contract-clauses **200** · Nest `/core/contract-clauses` **404** |

Mutated sample (U65 FE create):
- Contract code `HD-CORE09B-MSLAWKV6` · id `9fdffd42-f38e-480b-b207-6528836b256b`

---

## Browser U65 — journeys

Persona: auth inject · URL `http://127.0.0.1:5173/command-center/hrm/contracts` · **zero-seed**.

**hdsd_align:** Hợp đồng → Thêm → chọn NV → gói nghề suggest → Lưu → Sửa → Xem trước · đổi gói IT↔DRIVER · thiếu GPLX → can_issue=false · F5 list.

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-CORE-09B-01** | Thêm HĐ → chọn NV | GET `/contracts-insurance/contracts/pack-resolve?employee_id=` **200** `HRM-CTR-PACK-200` · banner `ctr-print-pack-suggest` **Chung (GENERAL)** · reason VI · Nest `/core` **0** | **PASS** |
| **J-HRM-CORE-09B-02** | Lưu registry → Sửa → **Xem trước** | POST create **201** · POST `…/contracts/:id/preview` **201** `HRM-CTR-PREV-200` · UI 18 clauses · meta ephemeral · **no** VER POST · Nest `/core` **0** | **PASS** |
| **J-HRM-CORE-09B-03** | Pack IT_OFFICE → preview → DRIVER → preview | IT `can_issue=true` · DRIVER block + `can_issue=false` + missing GPLX lists · pack behavior **differs** · Nest `/core` **0** · clause array both empty (P2 OBS) | **PASS** |
| **J-HRM-CORE-09B-04** | DRIVER missing → registry Lưu → F5 · seals | `can_issue=false` + `ctr-print-missing-fields` · PATCH registry **200** · F5 row còn · Nest `/core` **0** · honesty UI printable=false · CORE-09a smoke · ≠ printable / ≠ 09c·09d DONE | **PASS** |

Screens: `01-contracts-list` · `02-j01-pack-suggest` · `03-j01-form-filled` · `04-after-create` · `05-list-after-create` · `06-j02-before-preview` · `07-j02-after-preview` · `08-j03-it-preview` · `09-j03-driver-preview` · `10-j04-missing` · `11-j04-f5-registry`.

---

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-QA-CORE-09B-CLAUSE-FP-EMPTY** | **P2 OBS** | peer 09d / BA | IT/DRIVER active TPL `layout.clause_ids=[]` → preview clause arrays empty; pack gate/DRIVER missing still differs. **Does not block** J-03. |
| **R-QA-CORE-09B-CB-MASK-CEO** | **P2 OBS** | QA peer | `ceo@xe.vn` → `cb_masked=false` (C&B persona). Non-C&B role probe deferred. |
| **R-QA-CORE-09B-TPL-NONE-ENV** | **P2 OBS** | — | Env has 33 active TPL — `ctr-print-no-template` not shown; FE path + `HRM-CTR-TPL-NONE` retained (AC-06 env N/A). |

**What worked (must not regress):** physical pack-resolve suggest · ephemeral POST preview · IT↔DRIVER DRIVER gate · missing list · registry CRUD F5 · Nest `/core` 0 · honesty printable=false · CORE-09a CL seal.

---

## DENY / honesty

| Item | Status |
|------|--------|
| Nest `/core/*` pack/preview SoT dual | **DENY** — L1 Cannot * · browser hits **0** |
| `pnpm seed:*` / API fake for UF pass | **not used** (activate = Settings-equivalent Hiệu lực on existing starters) |
| Flip honesty / `contracts_printable_ready` | **false** retained (UI + evidence) |
| Claim CORE-09a = printable DONE | **DENY** |
| Claim 09c VER/PDF / 09d TPL invent DONE | **DENY** |
| Reopen sealed J-CORE-09A / 08 / 02 / 01 rewrite | **DENY** |
| Module CORE / CTR / personnel UAT / Phase1 DONE | **DENY** — **C-SLICE** |

```text
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
personnel / CORE / CTR module UAT = false
C-SLICE ≠ module CORE UAT
U65 zero-seed
Nest /core pack+preview dual DENY · ≠ CORE-09a=printable · ≠ 09c VER/PDF · ≠ 09d TPL invent DONE
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-qa-01.md` |
| **completion_report** | U65 QA PASS — L0 OK; J-01 pack-resolve 200 + suggest banner PASS; J-02 registry 201 + POST preview 201 ephemeral 18 clauses · no VER INSERT PASS; J-03 IT↔DRIVER pack behavior + DRIVER block/missing PASS (P2 empty clause_ids); J-04 can_issue=false + missing UI + registry F5 + Nest `/core` 0 + honesty printable=false PASS. C-SLICE · no seed · ≠ CORE-09a=printable · ≠ 09c/09d DONE. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09B-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09b
depends_on: QA-01 PASS_TO_PM · docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-qa-01.md · stamp CORE09BQA-MSLAWKV6
entry_criteria: QA J-HRM-CORE-09B-01..04 PASS · Nest /core 0 · preview no VER INSERT · printable false · CORE-09a must_keep · peer CORE09AQC1-MSLA4LX9
exit_criteria: GO|GWC with residual list · DENY honesty flip · DENY CORE-09a=printable DONE · DENY 09c VER/PDF · 09d TPL invent DONE · C-SLICE seal ≠ module CORE/CTR UAT · evidence_path docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-qc-01.md
cấm: seed · flip contracts_printable_ready · claim module DONE · reopen J-CORE-09A/08/02/01 rewrite
spec_ref: F-CORE-CTR-PACK-01 · F-CORE-CTR-PREV-01 · AC-CORE-09B-* · BR-CTR-CL-02/04 · AC-CTR-PRINT-01..03/06..08
```
