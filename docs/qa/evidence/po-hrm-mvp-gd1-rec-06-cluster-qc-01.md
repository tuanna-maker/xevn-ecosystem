# Evidence — PO-HRM-MVP-GD1-REC-06-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-REC-06 C-SLICE only** · **not** module REC UAT |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-8) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`REC06QA-MSL48P4M`** · BE-01 / FE-01 READY |
| **uc_ids** | `UC-BP-REC-06` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-rec-06-cluster-qa-01.md`](po-hrm-mvp-gd1-rec-06-cluster-qa-01.md) |
| **be_ref** | [`po-hrm-mvp-gd1-rec-06-cluster-be-01.md`](po-hrm-mvp-gd1-rec-06-cluster-be-01.md) |
| **fe_ref** | [`po-hrm-mvp-gd1-rec-06-cluster-fe-01.md`](po-hrm-mvp-gd1-rec-06-cluster-fe-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01.md) AC-REC-06-01..04 · O1–O12 |
| **api_ref** | [`PO-HRM-MVP-GD1-REC-06-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-API-01.md) F-REC-MAIL-01 · F-REC-APP-03 · APP-02 RETAIN |
| **sa_ref** | [`PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01.md) Option A LOCKED |
| **machine** | `_tmp-po-hrm-mvp-gd1-rec-06-cluster-qa-01.json` · overall **PASS** · stamp **`REC06QA-MSL48P4M`** · J-04 supplemental `_tmp-po-hrm-mvp-gd1-rec-06-j04.json` |
| **stamp** | QC **`REC06QC1-MSL4CU2G`** · QA **`REC06QA-MSL48P4M`** · L1 **`REC06L1-MSL48QK4`** |
| **U65** | zero-seed · browser FE-after-2xx · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` |
| **portal_url** | portal `http://127.0.0.1:5173/command-center/hrm/recruitment?tab=candidates&companyId=main` · HRM `:28001` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **Module REC UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/rec` dual SoT** | **DENIED** | L1 Cannot POST · browser **0** hits |
| **Campaign / REC-03 as FR-06 SoT** | **DENIED** | not used |
| **Pool eval as FR-06 DONE** | **DENIED** | neo `recruitment_candidate_id` on eval 201 |
| **Mail endpoint writes stage** | **DENIED** | `mail_neq_transitions=true` · APP-02 sole writer |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed |
| **Reopen sealed J-STG-05 / J-IV / J-CV-04** | **DENIED** | RETAIN prior GWC |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-8 mail+eval GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `jd_dynamic_done=true`? | **NO** |
| May PM claim module REC UAT / Phase1 DONE from this seat? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM open next UC seat **UC-BP-REC-07** (board #11) as **sa Option**? | **YES** (U88/U89 continuous) |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-REC-06** (mail + Pass/Fail eval neo YCTD) after QA stamp **`REC06QA-MSL48P4M`**.

Audited: QA-01 MD · machine JSON L0/L1/network/journeys · J-04 supplemental · BA AC-REC-06 · API F-REC-MAIL-01 / F-REC-APP-03 · SA Option A · DENY Nest `/rec`.

**U65 ACCEPT:** Gửi thư `fail_cv` + `interview_invite`+CC · outbox F5 · Chốt Pass/Fail neo YCTD · POST transitions 201+`history_id` + stage-history · Network physical `/recruitment/*` only · mail ≠ stage.

**OBS ACCEPT (non-blocking P2):** PASSFAIL mint code on L1 omit-result · suggest-stage same-dialog (primary runner miss; J-04 supplemental seals APP-02).

**NOT Phase 1 DONE. NOT module REC UAT. NOT hire/REC-07 / 06b matrix DONE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-HRM-REC-06-01..04 browser + AC-REC-06-01..04 | PRODUCT L2.5 | **ACCEPT** this seat |
| POST mail 201 `HRM-REC-MAIL-201` · CC-REQUIRED 400 | PRODUCT | **ACCEPT** |
| POST eval 201 `HRM-REC-EVAL-201` Pass neo YCTD | PRODUCT | **ACCEPT** |
| POST transitions 201 + history + timeline (J-04 supplemental) | PRODUCT | **ACCEPT** |
| Nest `/rec` dual · 0 browser hits · L1 Cannot * | PRODUCT / GOVERNANCE | **ACCEPT** · DENY dual |
| mail ≠ transitions / eval ≠ transitions | PRODUCT | **ACCEPT** · APP-02 RETAIN |
| R-REC-06-EVAL-PASSFAIL-MINT (409 vs EVAL-PASSFAIL 400) | PRODUCT **P2 OBS** | **ACCEPT** non-blocking · browser Pass/Fail 201 sealed |
| R-REC-06-SUGGEST-STAGE-SAME-DIALOG | PRODUCT **P2 OBS** | **ACCEPT** non-blocking · J-04 supplemental seals stage |
| Stale dist at QA intake → rebuild+restart | ENV/OPS | **ACCEPT** · class known prior REC seats |
| `qc:dev-stack` Windows UV assert after health 200 | ENV | **OBS** — health checks PASS |
| Honesty / seed / Campaign / pool DONE / sealed J-* reopen | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | Browser U65 mail neo YCTD | J-01 POST mail **201** MAIL-201 · outbox_rows≥1 · screens 02–03 | 🟢 |
| 2 | Invite CC gate | J-02 client toast + L1 EX-01 `HRM-REC-MAIL-CC-REQUIRED` · invite **201** | 🟢 |
| 3 | Pass/Fail eval neo YCTD | J-03 POST eval **201** EVAL-201 · `result=pass` · neo id · History | 🟢 |
| 4 | Stage sau eval = APP-02 only | J-04 supplemental transitions **201** `HRM-REC-200` + `history_id` · stage-history **200** | 🟢 |
| 5 | mail ≠ transitions | machine `mail_neq_transitions=true` · eval_neq · Nest `/rec` **0** | 🟢 |
| 6 | Nest `/rec` DENY | L1 Cannot POST · browser_nest_rec **0** | 🟢 |
| 7 | P2 OBS PASSFAIL mint + suggest-stage | residual table · non-blocking | 🟢 **ACCEPT OBS** |
| 8 | DENY honesty · module UAT · Campaign · pool DONE · sealed J-* · seed | QA honesty + QC locks | 🟢 **RETAIN** |
| 9 | Evidence pack | QA **8/8** verify PASS · QC consolidates | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-qa-01.md` | exit **0** · **8/8 PASS** |
| QC SoT pack this file | 🟢 **8/8** below |
| QC spot `pnpm run qc:dev-stack` | hrm/xbos/portal **200** (Windows UV assert after PASS — ENV OBS) |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 + QC spot `qc:dev-stack` | hrm/xbos/portal **200** | ENV/L0 |
| QA L1 mail/eval LIVE + Nest `/rec` DENY | 404 HRM-REC-404 mapped · Nest Cannot * · stamp `REC06L1-MSL48QK4` | PRODUCT |
| QA business EX-01 / AC-02 | CC-REQUIRED **400** · invite **201** MAIL-201 | PRODUCT |
| QA runner + J-04 supplemental | overall **PASS** stamp `REC06QA-MSL48P4M` · transitions 201+history | PRODUCT |
| `verify:qc:evidence-pack` QA-01 | **8/8 PASS** | PROCESS |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ portal `127.0.0.1:5173` · `:28001` · tab=candidates |
| 5 | journey_l25 | ✅ **J-HRM-REC-06-01..04** 🟢 |
| 6 | crud_or_matrix | ✅ AC-REC-06-01..04 · EX-01 CC · mail≠stage |
| 7 | residual_section | ✅ below · P2 OBS OPEN idle-ok |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-REC-06-01** | **PASS** | fail_cv mail 201 · outbox · mail≠transitions |
| **J-HRM-REC-06-02** | **PASS** | invite+CC 201 · miss-CC toast · L1 CC-REQUIRED |
| **J-HRM-REC-06-03** | **PASS** | Pass eval neo YCTD 201 · History |
| **J-HRM-REC-06-04** | **PASS** | supplemental transitions 201+history_id · timeline · Nest `/rec` 0 |
| Module REC UAT J-* promote | **DENIED** | C-SLICE |
| **J-HRM-REC-STG-05-*** / **J-IV-*** / **J-CV-04-*** | **PASS_RETAIN** | not re-litigated |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-REC-06-01 | **PASS** |
| J-HRM-REC-06-02 | **PASS** |
| J-HRM-REC-06-03 | **PASS** |
| J-HRM-REC-06-04 | **PASS** (supplemental seal) |

### Screens (6)

`docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-06-cluster-qa-01/` — 01 candidates · 02 detail-mail · 03 mail-sent · 04 invite-cc · 05 eval-dialog · 06 eval-committed.

**PM action:** stamp `PROGRAM_JOURNEY_MAP.md` J-HRM-REC-06-01..04 **DRAFT → PASS** with QC stamp `REC06QC1-MSL4CU2G` (C-SLICE · honesty false).

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **DENY** module REC UAT · Phase1 · `SERVICE_READINESS` · Nest `/rec` dual · Campaign SoT · pool-eval-as-FR-06 · seed · reopen sealed J-STG-05 / J-IV / J-CV-04.
2. **Condition P2 OBS `R-REC-06-EVAL-PASSFAIL-MINT`:** L1 omit `result` → **409** `HRM-REC-409` (not mint `HRM-REC-EVAL-PASSFAIL` 400) — **ACCEPT** non-blocking; browser Pass/Fail commit **201** sealed. Optional peer-BE mint align later — **not** reopen J-01..04 as P0.
3. **Condition P2 OBS `R-REC-06-SUGGEST-STAGE-SAME-DIALOG`:** primary runner missed suggest-stage in same dialog; J-04 supplemental seals APP-02 transitions+history — **ACCEPT** non-blocking · optional FE polish — **not** reopen J-04 as P0.
4. **RETAIN** SA Option A physical `/recruitment/candidates/:id/mail` + `candidate-evaluations*` · APP-02 sole stage · paper `/rec` alias only.
5. **OUT** this seat: REC-07 hire · 06b matrix UI · Campaign · CSVC onboard.
6. **NOT** Phase 1 DONE · **NOT** module REC UAT · Wave-8 **SEALED GWC** ≠ program exit.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-REC-06-EVAL-PASSFAIL-MINT** | P2 | OPEN / idle-ok | optional **dev-be** mint code align |
| **R-REC-06-SUGGEST-STAGE-SAME-DIALOG** | P2 | OPEN / idle-ok | optional **dev-fe** same-dialog UX |
| Honesty / C-SLICE / module UAT | — | RETAIN | **pm** — DENY flip |
| Journey map DRAFT→PASS stamp | PROCESS | open | **pm** same session |

**No residual PRODUCT P0** from J-HRM-REC-06-01..04 browser matrix.

---

## DENY

- Flip `recruitment_uat_ready` / `jd_dynamic_done` / claim module REC UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/rec` dual SoT · second mail/eval SoT · pool eval as FR-06 DONE · Campaign SoT  
- Treat mail endpoint as stage writer · claim hire/REC-07 / 06b = FR-06 DONE  
- Seed / reopen sealed J-STG-05 / J-IV / J-CV-04  
- Treat GWC as module GO · C-SLICE-as-module-DONE  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board #11 **UC-BP-REC-07** Option) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-REC-06: J-HRM-REC-06-01..04 PASS (mail+CC · Pass/Fail neo YCTD · transitions+history) · Nest `/rec` DENY · mail≠stage · U65 · pack 8/8. Conditions: honesty false · P2 OBS PASSFAIL mint + suggest-stage idle-ok. DENY module REC UAT / Phase1 / Campaign / pool DONE / seed / sealed J-* reopen. Next continuous: **UC-BP-REC-07** SA Option. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-07-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-REC-07
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-qc-01.md · stamp REC06QC1-MSL4CU2G · Wave-8 UC-BP-REC-06 SEALED
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after REC-06 (#10) = **UC-BP-REC-07** (#11 QUEUED) «Chấp nhận offer → tạo hồ sơ nhân sự (không nhập lại)»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-07 · F-REC-HIRE-01 cite

MISSION — SA Option seat (narrow):
1) Option A/B/C for accept-offer → create employee profile without re-key vs AS-IS hire/onboard spine
2) F.1 API map + must_keep REC-06 mail/eval · REC-05 transitions · REC-06a IV · DENY Nest /rec dual · DENY invent second hire SoT · DENY reopen sealed J-HRM-REC-06-01..04 without regression
3) Lock decision + unlock BA AC next — cấm code until Option CONFIRMED
cấm: honesty flip · recruitment_uat_ready · jd_dynamic_done · module REC UAT · seed · claim REC-06 mail/eval = hire DONE · reopen sealed REC-00..06 slices
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`REC06QC1-MSL4CU2G` · 2026-08-09 · Wave-8 UC-BP-REC-06 **SEALED GWC** ≠ module REC UAT
