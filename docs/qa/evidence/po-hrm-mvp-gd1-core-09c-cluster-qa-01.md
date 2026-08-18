# Evidence — PO-HRM-MVP-GD1-CORE-09C-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09C-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · UC-BP-CORE-09c) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `CORE09CQA-MSLBR3YX` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (PASS_WITH_OBS P2) |
| **uc_ids** | `UC-BP-CORE-09c` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR UAT **false** · **C-SLICE-≠-MODULE** · U65 zero-seed · **≠ CORE-09b=printable DONE** · **≠ 09d TPL invent DONE** |
| **depends_on** | FE-01 READY · `docs/qa/evidence/po-hrm-mvp-gd1-core-09c-cluster-fe-01.md` · API-01 CONFIRMED RETAIN · peer `CORE09BQC1-MSLB05DZ` |
| **env** | portal `:5173` **200** · hrm-api `:28001` **200** · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-core-09c-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-09c-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-09c-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **no CORE / CTR / personnel UAT DONE** · **printable false** |
| **L0** | hrm/xbos/portal **200** (`:5173`) |
| **L1 seal** | GET print-versions **200** `HRM-CTR-VER-200` · Nest `/core/…/print-versions` **404** · Nest `/core/…/pdf` **404** · active TPL present |
| **L2.5 J-*** | **J-HRM-CORE-09C-01..04 PASS** |
| **Nest `/core` browser** | **0 hits** |
| **Physical Network** | print-versions* + pdf + preview only on `/contracts-insurance/*` |
| **Preview VER INSERT** | **0** POST print-versions during preview alone |
| **DENY** | seed unused · honesty false retained · Nest `/core` dual · printable flip · CORE-09b=printable · 09d TPL invent DONE |

Mutated sample (U65 FE create — no seed):
- Contract code `HD-CORE09C-LBR3YX` · id `1de38825-16ce-4b45-87eb-3d3cdcf81d81`
- Issued VER v1 id `17c7b653-db4c-4dd4-9073-08fa787e59a5` · pack **GENERAL** → amend v2 issued · v1 **superseded**

---

## L0 / L1

| Check | Evidence |
|-------|----------|
| HRM / XBOS / portal | **200** / **200** / **200** `:5173` |
| `GET …/contracts/:id/print-versions` | **200** `HRM-CTR-VER-200` |
| `GET …/core/contracts/:id/print-versions` | **404** Cannot GET — DENY dual |
| `GET …/core/print-versions/:id/pdf` | **404** Cannot GET — DENY dual |
| Active templates | present (GENERAL + DRIVER used) |
| CORE-09a smoke | GET contract-clauses **200** · Nest `/core/contract-clauses` **404** |
| PDF L1 probe | **200** `application/pdf` · **%PDF-1.3** · 15094 bytes |

---

## Browser U65 — journeys

Persona: auth inject · URL `http://127.0.0.1:5173/command-center/hrm/contracts` (embed `/hr/contracts`) · **zero-seed**.

**hdsd_align:** Hợp đồng → Thêm → Lưu registry → Sửa → Xem trước → **Lưu phiên bản in** → F5 list/detail → **PDF** → DRIVER missing → soft-block Lưu → amend Lưu → registry F5.

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-CORE-09C-01** | Preview `can_issue=true` → **Lưu phiên bản in** → F5 | POST `…/contracts-insurance/contracts/:id/print-versions` **201** `HRM-CTR-VER-201` · list/detail `v1 · GENERAL · Đã phát hành` · F5 GET **200** `HRM-CTR-VER-200` same v1 · Nest `/core` **0** · preview alone **0** VER INSERT | **PASS** |
| **J-HRM-CORE-09C-02** | Issued VER → **PDF** | GET `…/contracts-insurance/print-versions/:id/pdf` **200** `application/pdf` physical · download `…-v1.pdf` · L1 **%PDF-1.3** 15094B · Nest `/core` **0** · ≠ live-library remerge | **PASS** |
| **J-HRM-CORE-09C-03** | DRIVER pack · clear GPLX → preview → Lưu | Preview `can_issue=false` + `ctr-print-missing-fields` (GPLX) · FE soft-disable Lưu · pvCount **1→1** (no fake issued) · Nest `/core` **0** | **PASS** |
| **J-HRM-CORE-09C-04** | PREV ephemeral · amend · seals · honesty | Preview Δ201=**0** · amend POST **201** v2 · L1 issued=[2] superseded=[1] · registry F5 row còn · Nest total **0** · honesty UI `contracts_printable_ready=false` · CORE-09a must_keep · ≠ 09d DONE · ≠ CORE-09b=printable | **PASS** |

Screens: `01-contracts-list` · `02-form-filled` · `03-after-create` · `04..07` J01 · `08..10` J02 · `11..12` J03 · `13..14` J04.

---

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-QA-CORE-09C-PDF-BROWSER-BODY** | **P2 OBS** | — | Browser Network pdf **200** physical; Playwright response body race → magic asserted via L1 probe `%PDF-1.3`. Does not block J-02. |
| **R-QA-CORE-09C-ISSUE-SOFT-DISABLE** | **P2 OBS** | FE idle-ok / peer | FE disables «Lưu phiên bản in» when `can_issue=false` — server `ISSUE-BLOCKED` not exercised via UI click; missing lists + **0** INSERT asserted (stronger UX gate). |
| **R-QA-CORE-09B-CLAUSE-FP-EMPTY** | **P2 carry** | peer **09d** | Carry from peer CORE09BQA — idle-ok this seat. |

**What worked (must not regress):** physical POST/GET print-versions · PDF snapshot `%PDF` · PREV ephemeral · amend supersede · Nest `/core` 0 · honesty printable=false · CORE-09a/09b seals.

---

## DENY / honesty

| Item | Status |
|------|--------|
| Nest `/core/*` VER/PDF SoT dual | **DENY** — L1 Cannot * · browser hits **0** |
| `pnpm seed:*` / API fake for UF pass | **not used** |
| Flip honesty / `contracts_printable_ready` | **false** retained (UI + evidence) |
| Claim CORE-09b = printable DONE | **DENY** |
| Claim 09d TPL invent DONE | **DENY** |
| Reopen sealed J-CORE-09B / 09A / 08 / 02 / 01 rewrite | **DENY** |
| Module CORE / CTR / personnel UAT / Phase1 DONE | **DENY** — **C-SLICE** |

```text
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
personnel / CORE / CTR module UAT = false
C-SLICE ≠ module CORE UAT
U65 zero-seed
Nest /core VER+PDF dual DENY · ≠ CORE-09b=printable · ≠ 09d TPL invent DONE
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09c-cluster-qa-01.md` |
| **completion_report** | U65 QA PASS — L0 OK; J-01 preview can_issue → POST print-versions **201** VER-201 + F5 GET **200** list/detail pack+v1 PASS; J-02 PDF physical **200** `%PDF` PASS; J-03 DRIVER missing soft-disable + 0 fake INSERT PASS; J-04 PREV ephemeral 0 VER · amend v2 supersede v1 · Nest `/core` **0** · honesty printable=false · ≠ 09d · ≠ CORE-09b=printable PASS. C-SLICE · no seed. P2 OBS pdf-body race + ISSUE soft-disable. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09C-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09c
depends_on: QA-01 PASS_TO_PM · docs/qa/evidence/po-hrm-mvp-gd1-core-09c-cluster-qa-01.md · stamp CORE09CQA-MSLBR3YX
entry_criteria: QA J-HRM-CORE-09C-01..04 PASS · Nest /core 0 · PREV ephemeral 0 VER · PDF %PDF · printable false · peer CORE09BQC1-MSLB05DZ must_keep
exit_criteria: GO|GWC with residual list · DENY honesty flip · DENY CORE-09b=printable DONE · DENY 09d TPL invent DONE · C-SLICE seal ≠ module CORE/CTR UAT · evidence_path docs/qa/evidence/po-hrm-mvp-gd1-core-09c-cluster-qc-01.md
cấm: seed · flip contracts_printable_ready · claim module DONE · invent 09d DONE · reopen J-CORE-09B/09A/08/02/01 rewrite
spec_ref: F-CORE-CTR-VER-01/02 · F-CORE-CTR-PDF-01 · AC-CORE-09C-01..08 · AC-CTR-PRINT-01/04/05/06/08 · J-HRM-CORE-09C-01..04
```
