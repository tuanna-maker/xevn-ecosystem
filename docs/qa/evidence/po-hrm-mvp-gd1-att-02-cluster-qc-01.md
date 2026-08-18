# Evidence — PO-HRM-MVP-GD1-ATT-02-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-02-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-ATT-02 C-SLICE only** · **not** ATT module UAT · **not** CFG=ATT-02 DONE · **not** invent PAY/printable DONE · **not** PLT/CORE DONE · **not** soft=CORE-06 DONE |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-25 seat #27) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`ATT02QA1-MSLQWDN3`** · FE-02 READY · BE-01 READY · API-01 · BA-01 · must_keep **`PLT01QC1-MSLPUQIU`** · **`CORE10QC1-MSLP0EJB`** · **`CORE09QC1-MSLNBA89`** printable false · **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 · Nest `/core` DENY · R-ATT-02-MODE-FE **CLOSED** · PAY OUT |
| **uc_ids** | `UC-BP-ATT-02` · `FR-UC-BP-ATT-02` · `J-HRM-ATT-02-01..06` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-att-02-cluster-qa-01.md`](po-hrm-mvp-gd1-att-02-cluster-qa-01.md) · raw `_tmp-po-hrm-mvp-gd1-att-02-cluster-qa-01.json` |
| **fe_ref** | [`po-hrm-mvp-gd1-att-02-cluster-fe-02.md`](po-hrm-mvp-gd1-att-02-cluster-fe-02.md) |
| **be_ref** | [`po-hrm-mvp-gd1-att-02-cluster-be-01.md`](po-hrm-mvp-gd1-att-02-cluster-be-01.md) |
| **api_ref** | [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md) |
| **machine** | `_tmp-po-hrm-mvp-gd1-att-02-cluster-qa-01.json` · overall **PASS** · stamp **`ATT02QA1-MSLQWDN3`** · Nest `/core` ATT non-404 **0** · seed_used **false** · J-01..06 PASS |
| **stamp** | QC **`ATT02QC1-MSLQZUK7`** · QA **`ATT02QA1-MSLQWDN3`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` · `contracts_printable_ready=false` RETAIN · CFG alone ≠ ATT-02 DONE · LER ≠ mode SoT · ≠ ATT module UAT · PLT/CORE RETAIN · soft≠CORE-06 · PAY OUT · **≠** claim ATT-02 DONE |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&companyId=main` · Thiết lập → Quy định chấm công → tab Chung · hrm-api `:28001` · persona `ceo@xe.vn` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`attendance_uat_ready` / ATT module UAT** | **`false`** | **DENIED** flip |
| **Claim CFG alone = ATT-02 DONE** | **DENIED** | C-SLICE |
| **`contracts_printable_ready`** | **`false`** | **DENIED** flip |
| **`recruitment_uat_ready` / `jd_dynamic_done` / personnel UAT** | **`false`** | **DENIED** flip |
| **Claim PLT / CORE-10/09/07 DONE** | **DENIED** | must_keep peer stamps |
| **Claim soft Profile = CORE-06 DONE** | **DENIED** | soft≠CORE-06 |
| **Invent PAY / printable DONE** | **DENIED** | PAY OUT · printable false |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/core` dual ATT SoT** | **DENIED** | L0 probe **404** · SoT non-404 **0** · QC spot GET `/api/hrm/core/attendance/rules` **404** |
| **Reopen sealed J-HRM-PLT-01 / CORE-10/09/07…** | **DENIED** | must_keep |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed |
| **R-ATT-02-MODE-FE** | **CLOSED** | FE-02 + QA J-01 RETAIN |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-25 GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true` / claim ATT module UAT? | **NO** |
| May PM claim CFG alone = ATT-02 DONE? | **NO** |
| May PM set `contracts_printable_ready=true` / invent printable DONE? | **NO** |
| May PM invent PAY DONE? | **NO** |
| May PM claim PLT / CORE-10/09/07 DONE · soft=CORE-06 DONE? | **NO** |
| May PM promote `SERVICE_READINESS` / Phase1 DONE? | **NO** |
| May PM invent Nest `/core` dual · reopen sealed peers · seed? | **NO** |
| May PM open next UC seat **UC-BP-ATT-08** as **sa Option**? | **YES** (U88/U89 continuous · board #28) |
| May PM treat P2 OBS punch BA-map / BE mixed DTO as FAIL this seat? | **NO** — **P2 OBS** idle-ok · not block GWC |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-ATT-02** (CFG late/early penalty modes · physical `/attendance/rules*` · Nest `/core` ATT **0** · XOR+F5 · HRM-VAL-400 overlap · off≠notifyLate · sourceFlags/scope/bands · R-ATT-02-MODE-FE CLOSED · honesty seals · printable **false** · PAY OUT · PLT/CORE RETAIN · soft≠CORE-06) after QA stamp **`ATT02QA1-MSLQWDN3`**.

Audited: QA-01 MD · L0/L2.5/network J-01..06 · FE-02 READY · BE-01 READY · API/BA cite · must_keep PLT/CORE · DENY Nest `/core` · DENY CFG=ATT-02 DONE · DENY ATT UAT · DENY invent PAY/printable · DENY honesty flip · DENY seed · DENY reopen peers.

**U65 ACCEPT:** GET `/attendance/rules` **200** · PATCH XOR minute **200** + F5 · bands overlap **HRM-VAL-400** no silent 2xx · off≠notifyLate · sourceFlags/scope/bands · Nest `/core` **0** · honesty footers ≠DONE · C-SLICE.

**OBS ACCEPT (non-blocking):** QA pack verify **1/8** FAIL (`command_table`) — **PROCESS OBS** (QC consolidates **8/8**) · P2 **`R-ATT-02-EVAL-PUNCH`** idle-ok · P2 **`R-ATT-02-BE-MIXED-PROBE`** idle-ok · INFO **`R-ATT-02-HONESTY`** RETAIN.

**NOT Phase 1 DONE. NOT ATT module UAT. NOT CFG=ATT-02 DONE. NOT invent PAY/printable DONE. NOT PLT/CORE DONE. NOT soft=CORE-06 DONE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-HRM-ATT-02-01..06 browser U65 (PM CFG exit) | PRODUCT L2.5 | **ACCEPT** this seat |
| physical `/attendance/rules*` GET/PATCH | PRODUCT | **ACCEPT** |
| XOR + F5 · HRM-VAL-400 overlap · off≠notifyLate | PRODUCT | **ACCEPT** |
| Nest `/core` ATT 404 · SoT non-404 **0** | PRODUCT | **ACCEPT** · DENY Nest dual |
| CFG≠ATT-02 DONE · ≠ ATT UAT · printable false · PAY OUT · PLT/CORE RETAIN · soft≠CORE-06 | PRODUCT / GOVERNANCE | **ACCEPT** · DENY claim DONE |
| BA punch J-03/04 DRAFT ≠ PM CFG exit map | PRODUCT **P2 OBS** | **ACCEPT** idle-ok · not FAIL seat |
| BE mixed DTO VAL-001 ad-hoc | PRODUCT **P2 OBS** | **ACCEPT** idle-ok |
| QA pack command_table missing | PROCESS OBS | **ACCEPT** · QC consolidates 8/8 |
| Honesty / seed / module UAT / reopen sealed J-* | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-01 Load panel · GET rules · LIVE badge · Nest `/core` 0 | QA J-01 | 🟢 |
| 2 | J-02 XOR Theo phút → Lưu → F5 modeMinute | QA J-02 | 🟢 |
| 3 | J-03 Bands overlap → HRM-VAL-400 · no silent PATCH 2xx | QA J-03 | 🟢 |
| 4 | J-04 off latePenalty · notifyLate independent · F5 | QA J-04 | 🟢 |
| 5 | J-05 sourceFlags + scope + tier bands · PATCH + F5 | QA J-05 | 🟢 |
| 6 | J-06 Honesty seals · CFG≠DONE · printable false · PAY OUT · PLT/CORE | QA J-06 | 🟢 |
| 7 | Residual P0 | none · P2 punch/BE OBS idle-ok | 🟢 non-block |
| 8 | printable false · C-SLICE · honesty · DENY Nest / reopen / seed / invent PAY · R-ATT-02-MODE-FE CLOSED | QA honesty + FE-02 + QC locks | 🟢 **RETAIN** |
| 9 | Pack BA/API/QA/FE/BE | specs + evidence present · QC consolidates **8/8** | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-qa-01.md` | exit **1** · **1/8** FAIL `command_table` — **PROCESS OBS** (known class · peer PLT/CORE) |
| QC SoT pack this file | 🟢 **8/8** below |
| L0 from QA stamp | hrm/xbos/portal **200** `:5173` · Nest `/core/attendance/rules` **404** |
| QC Nest `/core` spot | GET `/api/hrm/core/attendance/rules` **404** · SoT non-404 **0** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 stack | hrm/xbos/portal **200** `:5173` · Nest `/core/attendance/rules` **404** | ENV/L0 |
| QA L1 Nest `/core` DENY · physical rules | nest SoT non-404 **0** · `/attendance/rules*` hits 21 · PATCH 2xx = 4 | PRODUCT |
| QA runner U65 J-01..06 | overall **PASS** stamp `ATT02QA1-MSLQWDN3` | PRODUCT |
| Network physical | GET/PATCH `/attendance/rules*` · Nest `/core` **0** · client VAL-400 | PRODUCT |
| QC curl Nest `/core` | core attendance/rules **404** | PRODUCT |
| `verify:qc:evidence-pack` QA-01 | **1/8** PROCESS OBS · QC consolidates | PROCESS |
| FE-02 vitest | 3 files · 15 PASS · R-ATT-02-MODE-FE CLOSED | PRODUCT |
| BE-01 jest | 3 suites · 31 PASS | PRODUCT |
| Screens | under `screens/po-hrm-mvp-gd1-att-02-cluster-qa-01/` | PRODUCT |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` attendance settings · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-ATT-02-01..06** 🟢 |
| 6 | crud_or_matrix | ✅ AC-ATT-02-* · F-ATT-RULE-01 · Nest DENY · XOR+F5 · VAL-400 · off≠notifyLate · printable false · PAY OUT · PLT/CORE RETAIN · soft≠CORE-06 · R-ATT-02-MODE-FE CLOSED |
| 7 | residual_section | ✅ below · P2 OBS · no P0 |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-ATT-02-01** | **PASS** | GET rules · LIVE · Nest 0 |
| **J-HRM-ATT-02-02** | **PASS** | XOR minute PATCH + F5 |
| **J-HRM-ATT-02-03** | **PASS** | overlap HRM-VAL-400 |
| **J-HRM-ATT-02-04** | **PASS** | off ≠ notifyLate |
| **J-HRM-ATT-02-05** | **PASS** | sourceFlags/scope/bands |
| **J-HRM-ATT-02-06** | **PASS** | honesty seals · PAY OUT · printable false |
| Module ATT UAT / CFG=ATT-02 DONE promote | **DENIED** | C-SLICE |
| Claim invent PAY/printable · PLT/CORE DONE · soft=CORE-06 | **DENIED** | OUT invent |
| **J-HRM-PLT-01-*** / **CORE-10/09/07-*** … prior seals | **PASS_RETAIN** | not re-litigated · DENY reopen |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-ATT-02-01 | **PASS** |
| J-HRM-ATT-02-02 | **PASS** |
| J-HRM-ATT-02-03 | **PASS** |
| J-HRM-ATT-02-04 | **PASS** |
| J-HRM-ATT-02-05 | **PASS** |
| J-HRM-ATT-02-06 | **PASS** |

### Screens

QA cite: `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-02-cluster-qa-01/` — `01-rules-chung-panel` … `06-honesty`.

**PM action:** stamp `PROGRAM_JOURNEY_MAP.md` J-HRM-ATT-02-01..06 with QC stamp **`ATT02QC1-MSLQZUK7`** (QA already 🟢 PASS · C-SLICE · honesty false · printable false · **≠** claim ATT UAT / CFG=ATT-02 DONE). Update continuous board seat #27 / Wave-25 **SEALED GWC** · next **UC-BP-ATT-08** SA (#28).

---

## Conditions (GWC)

1. **Honesty:** keep `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel UAT **false** · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · claim CFG = ATT-02 DONE · claim ATT module UAT · invent PAY/printable DONE · soft=CORE-06 DONE · PLT DONE · CORE-10/09/07 DONE · seed · reopen sealed J-HRM-PLT-01-* / J-HRM-CORE-10-* / J-HRM-CORE-09-* / J-HRM-CORE-07-* ….
2. **Condition OBS `R-ATT-02-EVAL-PUNCH` P2:** BA punch/eval journeys not in this PM CFG seat — **ACCEPT** idle-ok · ≠ ATT-10/PAY DONE · ≠ block GWC.
3. **Condition OBS `R-ATT-02-BE-MIXED-PROBE` P2:** ad-hoc DTO VAL-001 — **ACCEPT** idle-ok · client VAL-400 already PASS.
4. **Condition OBS pack verify 1/8:** QA missing command_table — QC consolidates 8/8 — **ACCEPT**.
5. **RETAIN** physical `/api/hrm/attendance/rules*` · F-ATT-RULE-01 · Nest `/core` DENY · R-ATT-02-MODE-FE CLOSED · must_keep PLT-01 · CORE-10 · CORE-09 printable false · CORE-07 · soft≠CORE-06 · U19 J-01..06.
6. **OUT** this seat: invent PAY DONE · invent printable DONE · invent Nest `/core` ATT dual · claim CFG alone = ATT-02 module DONE · claim ATT UAT · claim PLT/CORE DONE · soft=CORE-06 · punch/eval ATT-10 DONE.
7. **NOT** Phase 1 DONE · **NOT** ATT module UAT · Wave-25 **SEALED GWC** ≠ program exit.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-ATT-02-EVAL-PUNCH** | **P2 OBS** | OPEN / idle-ok | **ba-process** optional · ≠ FAIL this seat |
| **R-ATT-02-BE-MIXED-PROBE** | **P2 OBS** | OPEN / idle-ok | **dev-be** optional · ≠ FAIL |
| **R-ATT-02-HONESTY** | INFO | RETAIN | **pm** — DENY flip · CFG≠DONE · ≠ ATT UAT · printable false · PAY OUT · PLT/CORE RETAIN · soft≠CORE-06 |
| Honesty / C-SLICE / printable false / ≠ invent PAY · module UAT | — | RETAIN | **pm** — DENY flip |
| Journey map + continuous board QC stamp | PROCESS | open | **pm** same session |

**No residual PRODUCT P0** from J-HRM-ATT-02-01..06 browser matrix (PM CFG exit).

---

## DENY

- Flip `attendance_uat_ready` / `recruitment_uat_ready` / `jd_dynamic_done` / **`contracts_printable_ready`** / personnel / ATT module UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/core` dual ATT SoT  
- Claim CFG alone = ATT-02 DONE · claim ATT module UAT  
- Claim PLT DONE · CORE-10 DONE · CORE-09 DONE · CORE-07 DONE · soft=CORE-06 DONE  
- Invent PAY / printable DONE  
- Seed / reopen sealed J-HRM-PLT-01-* / J-HRM-CORE-10-* / J-HRM-CORE-09-* / J-HRM-CORE-07-* …  
- Treat GWC as module GO · C-SLICE-as-module-DONE  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **sa** (board #28 **UC-BP-ATT-08** Option · U88 continuous) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-ATT-02: J-HRM-ATT-02-01..06 PASS (GET/PATCH `/attendance/rules*` · Nest `/core` ATT **0** · XOR+F5 · HRM-VAL-400 · off≠notifyLate · sourceFlags/scope/bands · R-ATT-02-MODE-FE CLOSED · honesty · printable false · PAY OUT · PLT/CORE RETAIN · soft≠CORE-06 · U65 · pack QC 8/8). Conditions: honesty false · ≠ claim CFG=ATT-02 DONE · ≠ ATT UAT · ≠ invent PAY/printable · DENY Nest dual / seed / reopen peers. P2 OBS punch BA-map + BE mixed idle-ok. Next continuous: **UC-BP-ATT-08** SA Option (U88). |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-08-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-ATT-08 · FR-UC-BP-ATT-08
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-qc-01.md · stamp ATT02QC1-MSLQZUK7 · Wave-25 UC-BP-ATT-02 SEALED · QA ATT02QA1-MSLQWDN3 · must_keep PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · CFG≠ATT-02 DONE · ≠ ATT UAT · R-ATT-02-MODE-FE CLOSED · PAY OUT invent DONE · printable false RETAIN
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after ATT-02 (#27) = **UC-BP-ATT-08** (#28 QUEUED) «Tính ngày trừ phép xuyên cuối tuần và lễ (0,5 ngày / 1 giờ)»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-08 · Diễn biến trừ phép xuyên weekend/holiday · must_keep ATT-02 CFG late-penalty RETAIN (physical /attendance/rules* · Nest /core DENY · XOR modes · R-ATT-02-MODE-FE CLOSED) · must_keep PLT-01 · CORE-10/09/07 · printable false · DENY invent PAY DONE · DENY invent printable DONE · DENY claim ATT/PLT/CORE DONE

MISSION — SA Option seat (narrow):
1) Option A/B/C for leave-day deduction across weekends & holidays (0.5 day / 1 hour) vs AS-IS LIVE — DENY Nest /core dual · DENY wipe ATT-02 rules CFG · DENY wipe PLT-01 merge-tokens · DENY wipe CORE-10 SI · DENY wipe CORE-09 registry/PREV/VER · DENY wipe CORE-07 activate · DENY soft=CORE-06 DONE · DENY invent PAY/printable DONE · DENY claim ATT module UAT DONE from Option alone
2) F.1 API map + must_keep ATT-02 RETAIN · PLT-01 · CORE-10/09/07/06 seals · DENY reopen sealed J-HRM-ATT-02-01..06 / J-HRM-PLT-01-01..06 / J-HRM-CORE-10..01 without regression · DENY flip attendance_uat_ready / contracts_printable_ready / personnel UAT · DENY claim CFG=ATT-02 DONE · DENY claim printable DONE
3) Disposition: RETAIN cite LIVE leave calendar path vs unlock delta — unlock BA AC next — cấm code until Option CONFIRMED · note ATT-02 ADD seal ≠ ATT module UAT DONE · printable false RETAIN · PAY OUT invent from this Option unless in FR-ATT-08 scope
cấm: honesty flip · attendance_uat_ready · recruitment_uat_ready · jd_dynamic_done · contracts_printable_ready · hrm_personnel_uat_ready · module ATT/PLT/platform UAT claim DONE · seed · Nest /core dual · reopen sealed ATT-02 / PLT-01 / CORE-10 / CORE-09 / CORE-07 / CORE-06..01 · claim Wave-25 ATT-02 = ATT UAT DONE / CFG=ATT-02 DONE / PLT DONE / CORE-10/09/07 DONE / soft=CORE-06 DONE · invent PAY DONE · invent printable DONE · invent Word DONE
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`ATT02QC1-MSLQZUK7` · 2026-08-09 · Wave-25 UC-BP-ATT-02 **SEALED GWC** ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · printable false · PAY OUT · PLT RETAIN · CORE-10 RETAIN · CORE-09 RETAIN · CORE-07 RETAIN · soft≠CORE-06 DONE · ≠ invent PAY/printable DONE · Nest `/core` DENY · R-ATT-02-MODE-FE CLOSED · P2 OBS punch/BE idle-ok
