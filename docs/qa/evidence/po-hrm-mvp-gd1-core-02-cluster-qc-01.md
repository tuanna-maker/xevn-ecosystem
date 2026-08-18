# Evidence — PO-HRM-MVP-GD1-CORE-02-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-02-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-CORE-02 C-SLICE only** · **not** module CORE / personnel UAT |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-11) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`CORE02QA-MSL7X7SJ`** · BE-01 / FE-01 READY |
| **uc_ids** | `UC-BP-CORE-02` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-core-02-cluster-qa-01.md`](po-hrm-mvp-gd1-core-02-cluster-qa-01.md) |
| **be_ref** | [`po-hrm-mvp-gd1-core-02-cluster-be-01.md`](po-hrm-mvp-gd1-core-02-cluster-be-01.md) |
| **fe_ref** | [`po-hrm-mvp-gd1-core-02-cluster-fe-01.md`](po-hrm-mvp-gd1-core-02-cluster-fe-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01.md) AC-CORE-CB · O1–O12 |
| **data_ref** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md) |
| **api_ref** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md) |
| **sa_ref** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md) Option A LOCKED |
| **machine** | `_tmp-po-hrm-mvp-gd1-core-02-cluster-qa-01.json` · overall **PASS** · stamp **`CORE02QA-MSL7X7SJ`** |
| **stamp** | QC **`CORE02QC1-MSL80DU6`** · QA **`CORE02QA-MSL7X7SJ`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · personnel/CORE UAT **false** · **CORE-01 ≠ C&B DONE** |
| **portal_url** | portal `http://127.0.0.1:5173/command-center/hrm/employees` · HRM `:28001` · `companyId=main` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **Personnel / CORE UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module |
| **CORE-01 public ring = UC-BP-CORE-02 / C&B DONE** | **DENIED** | public ≠ C&B |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/core` dual SoT** | **DENIED** | L1 Cannot GET · browser **0** hits |
| **Same-form public+salary / reopen J-HRM-CORE-01-*** | **DENIED** | CB-403 + CORE-01 GWC `CORE01QC1-MSL6WMS7` RETAIN |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed · `seed_used=false` |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-11 C&B packages GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `jd_dynamic_done=true`? | **NO** |
| May PM claim module CORE / personnel UAT / Phase1 DONE from this seat? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM claim CORE-01 public = C&B DONE? | **NO** |
| May PM invent Nest `/core` dual or reopen sealed J-HRM-CORE-01-*? | **NO** |
| May PM open next UC seat **UC-BP-CORE-08** (board #14) as **sa Option**? | **YES** (U88/U89 continuous) |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-CORE-02** (C&B packages physical path + bank/MST revise F5 + AuthZ-403 + public CB-403 must_keep + SI `change_rate`) after QA stamp **`CORE02QA-MSL7X7SJ`**.

Audited: QA-01 MD · raw JSON · screens 01–08 · L0/L1/network/journeys · BA/SA/DATA/API · BE-01 · FE-01 · DENY Nest `/core`.

**U65 ACCEPT:** Đãi ngộ GET packages* **200** · AuthZ **403** `HRM-CORE-CB-AUTHZ-403` · revise bank/MST **201** `HRM-COMP-201` + history≥2 F5 · public strip + forced CF **403** `HRM-CORE-CB-403` · SI actions `change_rate` **201** · PATCH contrib **400** `HRM-CORE-CB-VAL-400` · Nest `/core` **0** · physical `/contracts-insurance/compensation-packages*` + `/employee-insurances*` only.

**OBS ACCEPT (non-blocking):** stale dist rebuild+restart at QA intake (known class) · screen `08-j04-done` empty shell placeholders after Network **201** (timing/UI shell — not product P0) · HTP banner `HRM-HTP-NO-ACTIVE-CONTRACT` reinforces **≠** payroll / module DONE.

**NOT Phase 1 DONE. NOT module CORE / personnel UAT. NOT CORE-01 = C&B DONE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-HRM-CORE-02-01..04 browser U65 | PRODUCT L2.5 | **ACCEPT** this seat |
| packages* LIVE · bank/MST revise F5 · history≥2 | PRODUCT | **ACCEPT** |
| AuthZ-403 ≠ public CB-403 (must_keep CORE-01) | PRODUCT | **ACCEPT** |
| SI `change_rate` 201 · PATCH VAL-400 fail-closed | PRODUCT | **ACCEPT** |
| Nest `/core` dual · 0 browser hits · L1 Cannot GET | PRODUCT / GOVERNANCE | **ACCEPT** · DENY dual |
| Stale dist at QA intake → rebuild+restart | ENV/OPS | **ACCEPT** · class known prior seats |
| Screen 08 empty BH shell after 201 | PRODUCT **P2 OBS** | **ACCEPT** non-blocking |
| `qc:dev-stack` Windows UV assert after health 200 | ENV | **OBS** — health checks PASS |
| Honesty / seed / CORE-01=C&B DONE / sealed J-CORE-01 reopen | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-01 packages GET 200 + AuthZ-403 · Nest `/core` 0 | QA J-01 · JSON `pkgGet200` · `authzL1` · `nest0` · screen 01 | 🟢 |
| 2 | J-02 revise bank/MST 201 + history F5 | QA J-02 · `HRM-COMP-201` · `history_total=4` · `f5Bank` · screens 02–04 | 🟢 |
| 3 | J-03 public strip + CB-403 must_keep · Nest 0 | QA J-03 · `HRM-CORE-CB-403` · screens 05–06 | 🟢 |
| 4 | J-04 change_rate 201 + PATCH VAL-400 · Nest 0 | QA J-04 · `HRM-EINS-200` · `HRM-CORE-CB-VAL-400` · screens 07–08 | 🟢 |
| 5 | Residual P0/P1 | QA residual empty · no PRODUCT P0 | 🟢 |
| 6 | C-SLICE ≠ module CORE UAT · honesty false · CORE-01 ≠ C&B DONE | QA honesty + QC locks · JSON flags | 🟢 **RETAIN** |
| 7 | DENY Nest `/core` dual · reopen J-CORE-01 · seed | QA DENY + QC locks · `seed_used=false` | 🟢 **RETAIN** |
| 8 | Pack BA/SA/DATA/API/BE/FE/QA | specs + evidence present · verify **8/8** | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-qa-01.md` | exit **0** · **8/8 PASS** |
| QC SoT pack this file | 🟢 **8/8** below |
| QC spot `pnpm run qc:dev-stack` | hrm/xbos/portal **200** (Windows UV assert after PASS — ENV OBS) |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 + QC spot `qc:dev-stack` | hrm/xbos/portal **200** | ENV/L0 |
| QA L1 packages* · AuthZ-403 · CB-403 · Nest `/core` DENY · SI VAL-400/`change_rate` | packages `HRM-COMP-200` · Nest Cannot GET · CF `HRM-CORE-CB-403` · actions `HRM-EINS-200` | PRODUCT |
| QA runner U65 J-01..04 | overall **PASS** stamp `CORE02QA-MSL7X7SJ` | PRODUCT |
| `verify:qc:evidence-pack` QA-01 | **8/8 PASS** | PROCESS |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ portal `127.0.0.1:5173` · `:28001` · `/hrm/employees` |
| 5 | journey_l25 | ✅ **J-HRM-CORE-02-01..04** 🟢 |
| 6 | crud_or_matrix | ✅ AC-CORE-CB · packages revise · AuthZ/CB-403 · SI change_rate · Nest DENY |
| 7 | residual_section | ✅ below · OBS idle-ok · no P0 |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-CORE-02-01** | **PASS** | Đãi ngộ GET packages* 200 · AuthZ-403 · Nest `/core` 0 |
| **J-HRM-CORE-02-02** | **PASS** | revise bank/MST 201 · history≥2 F5 (v4 · 4 phiên bản) |
| **J-HRM-CORE-02-03** | **PASS** | public general strip · CF CB-403 · F5 clean · Nest 0 |
| **J-HRM-CORE-02-04** | **PASS** | browser `change_rate` 201 · PATCH VAL-400 · Nest 0 |
| Module CORE / personnel UAT J-* promote | **DENIED** | C-SLICE |
| **J-HRM-CORE-01-*** / prior CORE-01 seal | **PASS_RETAIN** | not re-litigated · DENY reopen · stamp `CORE01QC1-MSL6WMS7` |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-CORE-02-01 | **PASS** |
| J-HRM-CORE-02-02 | **PASS** |
| J-HRM-CORE-02-03 | **PASS** |
| J-HRM-CORE-02-04 | **PASS** |

### Screens

`docs/qa/evidence/screens/po-hrm-mvp-gd1-core-02-cluster-qa-01/` — 01 dai-ngo-open · 02 comp-form-filled · 03 after-mutate · 04 f5-dai-ngo · 05 public-general · 06 f5-public-after-cb403 · 07 insurance-tab · 08 j04-done.

**PM action:** stamp `PROGRAM_JOURNEY_MAP.md` J-HRM-CORE-02-01..04 with QC stamp **`CORE02QC1-MSL80DU6`** (QA already 🟢 PASS · C-SLICE · honesty false · CORE-01 ≠ C&B DONE). Update continuous board Wave-11 **SEALED GWC**.

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · `jd_dynamic_done=false` · personnel/CORE UAT **false** · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · CORE-01=C&B DONE · same-form public+salary · seed · reopen sealed J-HRM-CORE-01-*.
2. **Condition OBS `R-CORE-02-STALE-DIST`:** QA intake rebuild+restart after pre-BE dist rejected `bank_*` — **ACCEPT** ops class; LIVE sealed before browser.
3. **Condition OBS `R-CORE-02-J04-SHELL`:** screen 08 empty BH placeholders after Network **201** — **ACCEPT** non-blocking; optional FE polish later — **not** reopen J-04 as P0.
4. **RETAIN** SA Option A physical `/api/hrm/contracts-insurance/compensation-packages*` + `/employee-insurances*` · bank/MST on packages · AuthZ-403 ≠ CB-403 · CORE-01 public strip · paper `/core` alias only · Nest `/core` DENY · U19 list=get=revise=SI.
5. **OUT** this seat: CORE-08 KT/KL · CORE-02b metadata · CORE-09/10 invent · PAY process / payslip run · invent Nest `/core` dual · module CORE UAT.
6. **NOT** Phase 1 DONE · **NOT** module CORE / personnel UAT · Wave-11 **SEALED GWC** ≠ program exit.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-CORE-02-STALE-DIST** | OBS | CLOSED / idle-ok | ops known — rebuild before LIVE claim |
| **R-CORE-02-J04-SHELL** | P2 | OPEN / idle-ok | optional **dev-fe** BH tab shell after action |
| Honesty / C-SLICE / module UAT / CORE-01≠C&B | — | RETAIN | **pm** — DENY flip |
| Journey map + continuous board QC stamp | PROCESS | open | **pm** same session |

**No residual PRODUCT P0** from J-HRM-CORE-02-01..04 browser matrix.

---

## DENY

- Flip `recruitment_uat_ready` / `jd_dynamic_done` / claim module CORE / personnel UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/core` dual SoT · claim CORE-01 public = C&B DONE · same-form public+salary  
- Seed / reopen sealed J-HRM-CORE-01-*  
- Treat GWC as module GO · C-SLICE-as-module-DONE · claim CORE pillar UAT DONE because C&B packages seat sealed  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board #14 **UC-BP-CORE-08** Option) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-CORE-02: J-HRM-CORE-02-01..04 PASS (packages AuthZ · bank/MST revise F5 · public CB-403 must_keep · SI change_rate · Nest `/core` DENY) · U65 · pack 8/8 · OBS stale-dist + J04 shell idle-ok. Conditions: honesty false · C-SLICE · CORE-01 ≠ C&B DONE. DENY module CORE UAT / Phase1 / Nest dual / seed / reopen J-CORE-01. Next continuous: **UC-BP-CORE-08** SA Option. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-CORE-08
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-qc-01.md · stamp CORE02QC1-MSL80DU6 · Wave-11 UC-BP-CORE-02 SEALED
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after CORE-02 (#13) = **UC-BP-CORE-08** (#14 QUEUED) «Khen thưởng & kỷ luật — thi hành → bảng lương»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-08 · DB_DESIGN / API_DESIGN CORE reward-discipline cite · must_keep CORE-02 packages/eins + AuthZ-403 + CB-403 + Nest /core DENY · must_keep CORE-01 public strip

MISSION — SA Option seat (narrow):
1) Option A/B/C for reward & discipline execute → payroll handoff vs AS-IS decision/payroll spine
2) F.1 API map + must_keep CORE-02 C&B packages/eins · AuthZ/CB-403 · CORE-01 public · DENY Nest /core dual · DENY reopen sealed J-HRM-CORE-02-01..04 / J-HRM-CORE-01-* without regression · DENY flip recruitment_uat_ready / personnel UAT · DENY claim CORE-02 = CORE pillar DONE
3) Lock decision + unlock BA AC next — cấm code until Option CONFIRMED
cấm: honesty flip · recruitment_uat_ready · jd_dynamic_done · module CORE/personnel UAT · seed · Nest /core dual · reopen sealed CORE-02 / CORE-01 / REC slices · invent PAY full engine in this seat
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`CORE02QC1-MSL80DU6` · 2026-08-09 · Wave-11 UC-BP-CORE-02 **SEALED GWC** ≠ module CORE / personnel UAT · CORE-01 ≠ C&B DONE
