# Evidence — PO-HRM-MVP-GD1-REC-07-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-07-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-REC-07 C-SLICE only** · **not** module REC UAT |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-9) |
| **depends_on** | QA-02 `PASS_TO_PM` stamp **`REC07QA2-MSL5SJDU`** · BE-02 / FE-01 READY |
| **uc_ids** | `UC-BP-REC-07` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-rec-07-cluster-qa-02.md`](po-hrm-mvp-gd1-rec-07-cluster-qa-02.md) |
| **be_ref** | [`po-hrm-mvp-gd1-rec-07-cluster-be-02.md`](po-hrm-mvp-gd1-rec-07-cluster-be-02.md) · BE-01 prior |
| **fe_ref** | [`po-hrm-mvp-gd1-rec-07-cluster-fe-01.md`](po-hrm-mvp-gd1-rec-07-cluster-fe-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-REC-07-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-BA-01.md) AC-REC-07 · O1–O12 |
| **data_ref** | [`PO-HRM-MVP-GD1-REC-07-CLUSTER-DATA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-DATA-01.md) |
| **api_ref** | [`PO-HRM-MVP-GD1-REC-07-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-API-01.md) F-REC-HIRE-01 |
| **sa_ref** | [`PO-HRM-MVP-GD1-REC-07-CLUSTER-SA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-SA-01.md) Option A LOCKED |
| **machine** | `_tmp-po-hrm-mvp-gd1-rec-07-cluster-qa-02.json` · overall **PASS** · stamp **`REC07QA2-MSL5SJDU`** |
| **stamp** | QC **`REC07QC1-MSL5WXU5`** · QA **`REC07QA2-MSL5SJDU`** · L1 **`REC07L1-*`** |
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
| **Mail template offer = hire** | **DENIED** | mail≠hire |
| **Picker / Kanban as FR-07 DONE** | **DENIED** | not used as SoT |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed |
| **Reopen sealed J-HRM-REC-06-*** | **DENIED** | RETAIN prior GWC |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-9 hire GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `jd_dynamic_done=true`? | **NO** |
| May PM claim module REC UAT / Phase1 DONE from this seat? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM open next UC seat **UC-BP-CORE-01** (board #12) as **sa Option**? | **YES** (U88/U89 continuous) |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-REC-07** (accept-offer → create employee + soft-link + APP-02 hired-outcome + HTP consume) after QA stamp **`REC07QA2-MSL5SJDU`**.

Audited: QA-02 MD · L0/L1/network/journeys · BA/SA/DATA/API · BE-02 soft-link+idempotent · FE-01 · DENY Nest `/rec`.

**U65 ACCEPT:** Chấp nhận offer create+prefill **201** · soft-link **F5 GET+LIST** `employee_id` · re-accept after hired → **200** `HRM-REC-HIRE-200` same emp · HTP `HRM-HTP-NO-ACTIVE-CONTRACT` · Network physical `/recruitment/` · Nest `/rec` **0**.

**P0 CLOSED:** `R-REC-07-SOFT-LINK-PROJECTION` · `R-REC-07-IDEMPOTENT-OFFER-GATE` · (`R-REC-07-ASSERT-BYPASS` BE-02).

**OBS ACCEPT (non-blocking P2):** PAY HTTP `HRM-VAL-001` (whitelist before service PAY-403) · FE CTA-after-hired idle (J-02 AC sealed via L1 HIRE-200).

**NOT Phase 1 DONE. NOT module REC UAT. NOT CORE onboard DONE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-HRM-REC-07-01..04 browser + AC-REC-07 | PRODUCT L2.5 | **ACCEPT** this seat |
| POST accept-offer **201** `HRM-REC-HIRE-201` create+prefill | PRODUCT | **ACCEPT** |
| Soft-link F5 GET+LIST `employee_id` match | PRODUCT | **ACCEPT** · P0 CLOSED |
| Re-accept → **200** `HRM-REC-HIRE-200` same emp | PRODUCT | **ACCEPT** · P0 CLOSED |
| HTP hire-readiness NO-ACTIVE-CONTRACT | PRODUCT | **ACCEPT** · no seed HĐ |
| Nest `/rec` dual · 0 browser hits · L1 Cannot * | PRODUCT / GOVERNANCE | **ACCEPT** · DENY dual |
| R-REC-07-PAY-HTTP-VAL-001 | PRODUCT **P2 OBS** | **ACCEPT** non-blocking · unit PAY-403 RETAIN |
| R-REC-07-FE-CTA-AFTER-HIRED | PRODUCT **P2 OBS** | **ACCEPT** idle-ok · L1 HIRE-200 seals J-02 |
| Stale dist at QA intake → rebuild+restart | ENV/OPS | **ACCEPT** · class known prior REC seats |
| `qc:dev-stack` Windows UV assert after health 200 | ENV | **OBS** — health checks PASS |
| Honesty / seed / mail=hire / sealed J-06 reopen | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | Soft-link F5 GET+LIST after accept | J-01 POST **201** HIRE-201 · F5 `employee_id` match · screens 03–04 | 🟢 |
| 2 | Idempotent HIRE-200 after hired-outcome | J-02 L1 **200** same emp · P0 CLOSED | 🟢 |
| 3 | HTP no-contract blocker | J-03 GET hire-readiness **200** `HRM-HTP-NO-ACTIVE-CONTRACT` · no seed HĐ | 🟢 |
| 4 | Nest `/rec` DENY + not-ready + PAY OBS | J-04 Nest hits **0** · OFFER-INVALID · PAY VAL-001 OBS | 🟢 |
| 5 | P0 soft-link + idempotent CLOSED | QA-02 defect table | 🟢 **CLOSED** |
| 6 | P2 PAY VAL-001 + FE CTA-after-hired | residual · non-blocking idle-ok | 🟢 **ACCEPT OBS** |
| 7 | DENY honesty · module UAT · Nest dual · seed · reopen J-06 | QA honesty + QC locks | 🟢 **RETAIN** |
| 8 | Pack BA/SA/DATA/API/BE/FE/QA | specs + evidence present · verify **8/8** | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-qa-02.md` | exit **0** · **8/8 PASS** |
| QC SoT pack this file | 🟢 **8/8** below |
| QC spot `pnpm run qc:dev-stack` | hrm/xbos/portal **200** (Windows UV assert after PASS — ENV OBS) |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 + QC spot `qc:dev-stack` | hrm/xbos/portal **200** | ENV/L0 |
| QA L1 accept-offer LIVE + Nest `/rec` DENY | route **404** HRM-REC-404 mapped · Nest Cannot POST · stamp `REC07L1-*` | PRODUCT |
| QA business EX not-ready / PAY | OFFER-INVALID **400** · PAY HTTP VAL-001 OBS | PRODUCT |
| QA runner U65 J-01..04 | overall **PASS** stamp `REC07QA2-MSL5SJDU` · soft-link+HIRE-200+HTP | PRODUCT |
| `verify:qc:evidence-pack` QA-02 | **8/8 PASS** | PROCESS |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ portal `127.0.0.1:5173` · `:28001` · tab=candidates |
| 5 | journey_l25 | ✅ **J-HRM-REC-07-01..04** 🟢 |
| 6 | crud_or_matrix | ✅ AC-REC-07 · HIRE-201/200 · HTP · Nest DENY |
| 7 | residual_section | ✅ below · P2 OBS OPEN idle-ok |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-REC-07-01** | **PASS** | accept create+prefill 201 · soft-link F5 GET+LIST |
| **J-HRM-REC-07-02** | **PASS** | HIRE-200 same emp after hired · P2 FE CTA OBS |
| **J-HRM-REC-07-03** | **PASS** | HTP NO-ACTIVE-CONTRACT · no seed HĐ |
| **J-HRM-REC-07-04** | **PASS** | Nest `/rec` 0 · OFFER-INVALID · PAY VAL-001 OBS |
| Module REC UAT J-* promote | **DENIED** | C-SLICE |
| **J-HRM-REC-06-*** / prior REC seals | **PASS_RETAIN** | not re-litigated · DENY reopen |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-REC-07-01 | **PASS** |
| J-HRM-REC-07-02 | **PASS** |
| J-HRM-REC-07-03 | **PASS** |
| J-HRM-REC-07-04 | **PASS** |

### Screens

`docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-07-cluster-qa-02/` — 01 candidates · 02 detail-offer-ready · 03 accept-result · 04 f5-after-accept · 07 deny-not-ready.

**PM action:** stamp `PROGRAM_JOURNEY_MAP.md` J-HRM-REC-07-01..04 with QC stamp **`REC07QC1-MSL5WXU5`** (QA already 🟢 PASS · C-SLICE · honesty false).

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **DENY** module REC UAT · Phase1 · `SERVICE_READINESS` · Nest `/rec` dual · mail=hire · picker/Kanban=FR-07 DONE · seed · reopen sealed J-HRM-REC-06-*.
2. **Condition P2 OBS `R-REC-07-PAY-HTTP-VAL-001`:** HTTP PAY keys → `HRM-VAL-001` before service `HRM-REC-PAY-403` — **ACCEPT** non-blocking; unit PAY-403 RETAIN. Optional peer-BE DTO align later — **not** reopen J-01..04 as P0.
3. **Condition P2 OBS `R-REC-07-FE-CTA-AFTER-HIRED`:** After hired-outcome F5, browser CTA absent while API soft-link PASS — **ACCEPT** idle-ok; J-02 AC sealed via L1 HIRE-200. Optional peer-FE list projection polish — **not** reopen J-02 as P0.
4. **RETAIN** SA Option A physical `/recruitment/applications/:id/accept-offer` · APP-02 sole hired-outcome writer · HTP-05 consume only · paper `/rec` alias only.
5. **OUT** this seat: CORE public/C&B profile depth · PAY formula · HĐ create · Campaign · module REC UAT.
6. **NOT** Phase 1 DONE · **NOT** module REC UAT · Wave-9 **SEALED GWC** ≠ program exit.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-REC-07-PAY-HTTP-VAL-001** | P2 | OPEN / idle-ok | optional **dev-be** DTO whitelist align |
| **R-REC-07-FE-CTA-AFTER-HIRED** | P2 | OPEN / idle-ok | optional **dev-fe** list `employee_id` projection |
| Honesty / C-SLICE / module UAT | — | RETAIN | **pm** — DENY flip |
| Journey map QC stamp append | PROCESS | open | **pm** same session |

**No residual PRODUCT P0** from J-HRM-REC-07-01..04 browser matrix — soft-link + idempotent **CLOSED**.

---

## DENY

- Flip `recruitment_uat_ready` / `jd_dynamic_done` / claim module REC UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/rec` dual SoT · mail offer = hire · picker/Kanban as FR-07 DONE  
- Seed / reopen sealed J-HRM-REC-06-*  
- Treat GWC as module GO · C-SLICE-as-module-DONE · claim REC pillar UAT DONE because hire seat sealed  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board #12 **UC-BP-CORE-01** Option) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-REC-07: J-HRM-REC-07-01..04 PASS (soft-link F5 · HIRE-200 · HTP · Nest `/rec` DENY) · P0 soft-link+idempotent CLOSED · Nest `/rec` DENY · U65 · pack 8/8. Conditions: honesty false · P2 OBS PAY VAL-001 + FE CTA-after-hired idle-ok. DENY module REC UAT / Phase1 / Nest dual / seed / reopen J-06. Next continuous: **UC-BP-CORE-01** SA Option. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-CORE-01
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-qc-01.md · stamp REC07QC1-MSL5WXU5 · Wave-9 UC-BP-REC-07 SEALED
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after REC-07 (#11) = **UC-BP-CORE-01** (#12 QUEUED) «Hồ sơ vòng công khai (hành chính / phúc lợi)»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-01 · DB_DESIGN / API_DESIGN CORE public profile cite

MISSION — SA Option seat (narrow):
1) Option A/B/C for public employee profile ring (admin/welfare fields) vs AS-IS EMP spine + REC-07 hire soft-link handoff
2) F.1 API map + must_keep REC-07 hire soft-link · HTP · APP-02 · DENY Nest /rec dual · DENY invent second EMP SoT · DENY reopen sealed J-HRM-REC-07-01..04 without regression · DENY flip recruitment_uat_ready
3) Lock decision + unlock BA AC next — cấm code until Option CONFIRMED
cấm: honesty flip · recruitment_uat_ready · jd_dynamic_done · module REC/CORE UAT · seed · claim REC-07 hire = CORE profile DONE · reopen sealed REC-00..07 slices
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`REC07QC1-MSL5WXU5` · 2026-08-09 · Wave-9 UC-BP-REC-07 **SEALED GWC** ≠ module REC UAT
