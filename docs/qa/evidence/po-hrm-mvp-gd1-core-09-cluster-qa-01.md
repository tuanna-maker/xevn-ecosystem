# Evidence — PO-HRM-MVP-GD1-CORE-09-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · Wave-22 seat #24 · UC-BP-CORE-09) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `CORE09QA1-MSLNTR5P` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (PASS_WITH_OBS P2) |
| **uc_ids** | `UC-BP-CORE-09` · `J-HRM-CORE-09-01..06` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · personnel/CORE/CTR UAT **false** · **C-SLICE-≠-MODULE** · U65 zero-seed · **≠** claim registry/09a–d/VER = CORE-09 DONE · **≠** invent PAY/ATT/printable DONE · **≠** soft=CORE-06 DONE · **≠** CORE-07 DONE · Word/DOCX **OUT** |
| **depends_on** | FE-01 READY · `docs/qa/evidence/po-hrm-mvp-gd1-core-09-cluster-fe-01.md` · API-01 CONFIRMED RETAIN · BA-01 J-01..06 · peer seals `CORE07QC1-KZJTSHNT` · `CORE06QC1-MSLID363` · `CORE09DQC1-MSLDR8I3`..`CORE09AQC1-MSLA4LX9` |
| **env** | HRM FE portal `:8080` **200** · hrm-api `:28001` **200** · xbos `:28002` **200** · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-core-09-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-09-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-09-cluster-qa-01/` (12) |
| **U65** | zero-seed — **no** `pnpm seed:*` · browser FE only |
| **re-dispatch** | Prior bus DISPATCHED 16:01 orphaned (no evidence) — this run is full RE-DISPATCH evidence |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **no CORE / CTR / personnel UAT DONE** · **printable false RETAIN** |
| **L0** | hrm/xbos/portal **200** (`:8080` HRM embed + `:28001` / `:28002`) |
| **L1 seal** | Nest `/core/contracts*` **404** Cannot * · Nest `/core/…/preview` **404** · Nest `/core/…/print-versions` **404** · active TPL present (39) |
| **L2.5 J-*** | **J-HRM-CORE-09-01..06 PASS** |
| **Nest `/core` browser** | **0 hits** |
| **Physical Network** | contracts / preview / print-versions / templates **only** on `/api/hrm/contracts-insurance/*` |
| **Preview VER INSERT** | PREV alone **0** POST print-versions 201 · VER only on explicit Lưu (J-05) |
| **DENY** | seed unused · honesty false retained · Nest `/core` dual · printable flip · registry/09a–d=CORE-09 DONE · soft=CORE-06 DONE · CORE-07 DONE · Word invent · reopen sealed J-07/06/05/03/02B/09D..01 |

Mutated samples (U65 FE create — no seed):
- Contract + TPL spine: `HD-CORE09-LNTR5P` · id `07d73b1e-de89-49d5-b310-394c120c1e88`
- Issued VER v1: id `2f446770-9f59-443c-91db-7974484ff14f` · pack **GENERAL** · tpl `TPL_CLQA4-KN5SCA`
- Registry without template: `HD-CORE09NT-LNTR5P` · id `224cc4a8-49fa-45f8-a467-e92539a96b91` · `has_template_id=false`

**OBS run-1 (not this stamp):** First Playwright pass hit PREV **500** during Nest `--watch` remount mid-J-02; retest on stable Nest → **PASS** (stamp `CORE09QA1-MSLNTR5P`). Not product residual.

---

## L0 / L1

| Check | Evidence |
|-------|----------|
| HRM / XBOS / portal | **200** / **200** / **200** `:8080` |
| `GET …/contracts-insurance/contract-templates?status=active` | **200** `HRM-CTR-TPL-200` · total **39** |
| `GET …/contracts-insurance/contracts` | **200** `HRM-CON-200` |
| `GET …/core/contracts` | **404** Cannot GET — DENY dual |
| `POST …/core/contracts/:id/preview` | **404** Cannot POST — DENY dual |
| `GET …/core/contracts/:id/print-versions` | **404** Cannot GET — DENY dual |
| CORE-07 must_keep cite | `CORE07QC1-KZJTSHNT` GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · **≠** CORE-07 DONE (footer UI) |
| soft≠CORE-06 | Footer UI + honesty blob — **≠** soft=CORE-06 DONE |

URL: `http://127.0.0.1:8080/hr/contracts?portal=1&tenantId=xevn&companyId=main`

---

## Browser U65 — journeys

Persona: auth inject · URL `/hr/contracts` · **zero-seed**.

**hdsd_align:** Hợp đồng → Thêm → Lưu registry → Sửa → spine ZERO-TPL / Xem trước / Lưu phiên bản → F5 · registry without template.

| J-* | Click path | Network / FE after 2xx + F5 | Verdict |
|-----|------------|-----------------------------|---------|
| **J-HRM-CORE-09-01** | Edit HĐ → harness 0 active TPL → CTA · force Lưu VER | `ctr-core09-zero-tpl-cta` visible (HRM-CTR-TPL-NONE) · `ctr-print-save-version` **disabled** · force click → **0** VER 2xx · Nest `/core` **0** · no fake VER · restore live TPL spine OK | **PASS** |
| **J-HRM-CORE-09-02** | Chọn mẫu GENERAL → **Xem trước** | POST `…/contracts-insurance/contracts/:id/preview` **201** `HRM-CTR-PREV-200` · `merged_fields` **41** keys · UI preview body + **ephemeral** meta · **0** VER INSERT during PREV · Nest `/core` **0** | **PASS** |
| **J-HRM-CORE-09-03** | Clear `work_location` → PREV → cố Lưu VER | PREV `can_issue=false` + missing `work_location` · `ctr-print-missing-fields` · Lưu **disabled** · force → **0** silent VER 2xx · Nest `/core` **0** (ISSUE soft-disable OBS) | **PASS** |
| **J-HRM-CORE-09-04** | PREV as Group CEO | PREV `cb_masked=false` (CEO has C&B) · salary-like keys **[]** · Nest `/core` **0** · **DENY** invent C&B engine DONE · Non-C&B persona **deferred P2 OBS** | **PASS** (OBS) |
| **J-HRM-CORE-09-05** | PREV đủ → **Lưu phiên bản in** → reopen F5 | POST `…/print-versions` **201** `HRM-CTR-VER-201` physical · VER id `2f446770-…` · F5 reopen dialog OK · honesty `contracts_printable_ready=false` · **≠** printable flip · Nest `/core` **0** | **PASS** |
| **J-HRM-CORE-09-06** | Tạo sổ **không** mẫu → F5 · seals | POST `…/contracts` **201** `HRM-CON-201` · `has_template_id=false` · F5 row `HD-CORE09NT-LNTR5P` còn · Nest `/core` **0** (total) · footer 09a–d≠DONE · registry≠DONE · CORE-07 GATE/ACT RETAIN · soft≠CORE-06 DONE · Word OUT · no reopen sealed peers | **PASS** |

Screens: `01-contracts-list` · `02-form-filled` · `03-after-create` · `04-edit-spine` · `05-j01-zero-tpl` · `06-j02-preview` · `07-j03-mandatory` · `08-j04-cb-mask` · `09-j05-after-save` · `10-j05-f5` · `11-j06-create-no-tpl` (+ list F5).

### Honesty footer (UI excerpt)

```text
contracts_printable_ready=false
09a–d ADD ≠ CORE-09 DONE
registry CRUD ≠ CORE-09 DONE
CORE-07 GATE/ACT RETAIN (≠ DONE)
soft ≠ CORE-06 DONE
Word/DOCX OUT (spine banner)
Nest /core CTR = 0 (L1 + browser hits)
C-SLICE ≠ module CORE/CTR UAT
```

---

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-QA-CORE-09-ISSUE-SOFT-DISABLE** | **P2 OBS** | FE idle-ok / peer | FE disables «Lưu phiên bản» when `can_issue=false` — server `ISSUE-BLOCKED` not exercised via click; missing list + **0** INSERT asserted (stronger UX gate). Carry peer CORE-09c pattern. |
| **R-QA-CORE-09-CB-MASK-CEO** | **P2 OBS** | QA peer / optional Non-C&B seat | `ceo@xe.vn` → `cb_masked=false`. Banner path present in FE (`ctr-core09-cb-masked`); Non-C&B persona not in this seat. **DENY** invent C&B engine DONE. |
| **R-CORE-09-DISP-01** | INFO | FE RETAIN | FE-derive `statusLabelVi` — no BE invent required this seat. |

**What worked (must not regress):** ZERO-TPL CTA + VER gate · PREV physical merged_fields ephemeral · mandatory can_issue=false · VER 201 + F5 · registry without template · Nest `/core` **0** · honesty printable=false · 09a–d≠DONE · CORE-07/06 seals cited.

---

## DENY / honesty

| Item | Status |
|------|--------|
| Nest `/core/*` CTR SoT dual | **DENY** — L1 Cannot * · browser hits **0** |
| `pnpm seed:*` / API fake for UF pass | **not used** |
| Flip `contracts_printable_ready` | **false** retained (UI + evidence) |
| Claim registry CRUD = CORE-09 DONE | **DENY** |
| Claim 09a–d ADD = CORE-09 DONE | **DENY** |
| Claim VER/PDF = printable DONE | **DENY** |
| Claim soft = CORE-06 DONE | **DENY** |
| Claim CORE-07 DONE / checklist=DONE / free PATCH=DONE | **DENY** — must_keep `CORE07QC1-KZJTSHNT` |
| Invent PAY/ATT DONE · Word/DOCX primary | **DENY** |
| Reopen sealed J-HRM-CORE-07/06/05/03/02B/09D..01 | **DENY** |
| Module CORE / CTR / personnel UAT / Phase1 DONE | **DENY** — **C-SLICE** |

```text
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
personnel / CORE / CTR module UAT = false
C-SLICE ≠ module CORE UAT
U65 zero-seed
Nest /core CTR dual DENY · ≠ registry/09a–d DONE · ≠ printable · ≠ CORE-07 DONE · soft≠CORE-06 DONE · Word OUT
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09-cluster-qa-01.md` |
| **completion_report** | U65 QA **PASS** (RE-DISPATCH) — L0 OK; J-01 ZERO-TPL CTA + VER disabled + 0 fake VER PASS; J-02 PREV **201** PREV-200 merged=41 ephemeral 0 VER INSERT PASS; J-03 can_issue=false + missing work_location + 0 silent VER PASS; J-04 CEO C&B OBS (mask path FE; DENY invent C&B DONE) PASS; J-05 POST print-versions **201** VER-201 + F5 + printable=false PASS; J-06 registry without template **201** + F5 + Nest `/core` **0** + footer 09a–d≠DONE · registry≠DONE · CORE-07 RETAIN · soft≠CORE-06 DONE PASS. C-SLICE · no seed · no printable flip. P2 OBS soft-disable + CB-mask-CEO. |
| **residual** | P2 OBS ISSUE soft-disable · CB-mask Non-C&B deferred · no P0/P1 product defects |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 · Wave-22 seat #24)
uc_ids: UC-BP-CORE-09 · J-HRM-CORE-09-01..06
depends_on: QA-01 PASS_TO_PM · docs/qa/evidence/po-hrm-mvp-gd1-core-09-cluster-qa-01.md · stamp CORE09QA1-MSLNTR5P · FE-01 · API-01 CONFIRMED RETAIN
entry_criteria: QA J-HRM-CORE-09-01..06 PASS · Nest /core CTR=0 · PREV ephemeral · ZERO-TPL CTA · registry without template · printable false RETAIN · must_keep CORE07QC1-KZJTSHNT GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · soft≠CORE-06 DONE · peers 09a–d ADD ≠ CORE-09 DONE
exit_criteria: GO|GWC with residual list · DENY honesty flip · DENY claim registry/09a–d/VER = CORE-09 DONE · DENY invent PAY/ATT/printable DONE · DENY Word invent · DENY reopen sealed J-HRM-CORE-07/06/05/03/02B/09D..01 · C-SLICE seal ≠ module CORE/CTR UAT · evidence_path docs/qa/evidence/po-hrm-mvp-gd1-core-09-cluster-qc-01.md
cấm: seed · flip contracts_printable_ready · claim module DONE · soft=CORE-06 DONE · CORE-07 DONE · reopen sealed J-*
spec_ref: F-CORE-CTR-01 · F-CORE-CTR-PREV-01 · AC-CORE-09-01..08 · AC-CTR-TPL-01..05 · AC-CTR-XEVN-08 · J-HRM-CORE-09-01..06 · BA-01 O1–O12
```

---

*End QA-01 · stamp CORE09QA1-MSLNTR5P · PASS_TO_PM · U65 · printable false · C-SLICE · Nest /core 0.*
