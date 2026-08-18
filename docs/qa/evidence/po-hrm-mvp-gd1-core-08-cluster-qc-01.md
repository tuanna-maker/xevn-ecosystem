# Evidence — PO-HRM-MVP-GD1-CORE-08-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-08-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-CORE-08 C-SLICE only** · **not** module CORE / personnel UAT |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-12) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`CORE08QA-MSL980WO`** · BE-01 / FE-01 READY |
| **uc_ids** | `UC-BP-CORE-08` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-core-08-cluster-qa-01.md`](po-hrm-mvp-gd1-core-08-cluster-qa-01.md) |
| **be_ref** | [`po-hrm-mvp-gd1-core-08-cluster-be-01.md`](po-hrm-mvp-gd1-core-08-cluster-be-01.md) |
| **fe_ref** | [`po-hrm-mvp-gd1-core-08-cluster-fe-01.md`](po-hrm-mvp-gd1-core-08-cluster-fe-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-BA-01.md) AC-CORE-08 · O1–O12 |
| **data_ref** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md) |
| **api_ref** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md) |
| **sa_ref** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md) Option A LOCKED |
| **machine** | `_tmp-po-hrm-mvp-gd1-core-08-cluster-qa-01.json` · overall **PASS** · stamp **`CORE08QA-MSL980WO`** |
| **stamp** | QC **`CORE08QC1-MSL9BFFE`** · QA **`CORE08QA-MSL980WO`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` · `seed_used=false` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · personnel/CORE UAT **false** · **CORE-02 ≠ pillar DONE** · **note-CRUD ≠ FR-08 DONE** |
| **portal_url** | HRM FE `http://127.0.0.1:8080/employees/{id}?tab=rewards` (QA fallback; portal `:5173` flaky at run) · hrm-api `:28001` · `companyId=main` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **Personnel / CORE UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module |
| **CORE-02 packages = CORE pillar DONE** | **DENIED** | C&B seat ≠ RD / pillar |
| **note-CRUD = FR-08 DONE** | **DENIED** | note-only ≠ FR-08 / PAY apply |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/core` dual SoT** | **DENIED** | L1 Cannot GET · browser **0** hits |
| **Fold RD into `/decisions`** | **DENIED** | decisions hits **0** · physical rewards/discipline only |
| **Reopen sealed J-HRM-CORE-02-* / J-HRM-CORE-01-*** | **DENIED** | must_keep CORE-02/01 · CB-403 RETAIN |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed · `seed_used=false` |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-12 KT/KL GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `jd_dynamic_done=true`? | **NO** |
| May PM claim module CORE / personnel UAT / Phase1 DONE from this seat? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM claim CORE-02 packages = CORE pillar DONE? | **NO** |
| May PM claim note-CRUD = FR-08 DONE? | **NO** |
| May PM invent Nest `/core` dual · fold `/decisions` · reopen sealed J-HRM-CORE-02/01? | **NO** |
| May PM open next UC seat **UC-BP-CORE-09a** (board #15) as **sa Option**? | **YES** (U88/U89 continuous) |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-CORE-08** (KT/KL create title-first + period gate · enforce → payroll_link F5 · cancel-enforce + note-only `none` · Nest `/core` DENY · CB-403 must_keep · physical `/employees/:id/rewards*`+`/discipline*`) after QA stamp **`CORE08QA-MSL980WO`**.

Audited: QA-01 MD · raw JSON · screens 01–10 · L0/L1/network/journeys · BA/SA/DATA/API · BE-01 · FE-01 · DENY Nest `/core` · DENY `/decisions` fold.

**U65 ACCEPT:** Tab KT/KL → create amount `1.250.000` + kỳ draft → POST rewards **201** → F5 **Chờ** / **Chờ kỳ lương** · enforce **201** → F5 **Đang thi hành** / **Đã gắn kỳ** · cancel-enforce **201** · note-only period picker hidden + link **Không gắn kỳ** · Nest `/core` **0** · decisions **0** · L1 VAL-400 + RD-404 + CB-403 + Nest Cannot GET.

**OBS ACCEPT (non-blocking):** stale dist rebuild+restart at QA intake (known class) · portal `:5173` unreachable → FE `:8080` fallback · **P1 OBS** `isRdPeriodSelectable` includes `processed` (QA picked draft only; BE LOCKED/409 if forced) — optional FE follow-up · **not** GO blocker under C-SLICE.

**NOT Phase 1 DONE. NOT module CORE / personnel UAT. NOT CORE-02 = pillar DONE. NOT note-CRUD = FR-08 DONE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-HRM-CORE-08-01..04 browser U65 | PRODUCT L2.5 | **ACCEPT** this seat |
| Physical rewards create/enforce/cancel · note-only none | PRODUCT | **ACCEPT** |
| Nest `/core` dual · 0 browser hits · L1 Cannot GET | PRODUCT / GOVERNANCE | **ACCEPT** · DENY dual |
| Fold `/decisions` · 0 hits · physical rewards/discipline | PRODUCT / GOVERNANCE | **ACCEPT** · DENY fold |
| CB-403 must_keep CORE-02/01 · reopen J-CORE-02/01 | GOVERNANCE | **LOCKED DENY** reopen |
| Stale dist at QA intake → rebuild+restart · portal 5173→8080 | ENV/OPS | **ACCEPT** · class known prior seats |
| `R-CORE-08-FE-PERIOD-FILTER` processed in picker | PRODUCT **P1 OBS** | **ACCEPT** non-blocking · optional **dev-fe** |
| `qc:dev-stack` health 200 then Windows UV assert | ENV | **OBS** — health checks PASS |
| Honesty / seed / CORE-02=pillar / note=FR-08 / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-01 create title-first + draft period POST 201 Chờ F5 · Nest `/core` 0 | QA J-01 · JSON `j01` · screens 01–04 | 🟢 |
| 2 | J-02 enforce 201 → Đang thi hành + Đã gắn kỳ F5 | QA J-02 · JSON `j02` · screens 05–06 | 🟢 |
| 3 | J-03 cancel-enforce 201 · note-only link none · picker hidden | QA J-03 · JSON `j03` · screens 07–09 | 🟢 |
| 4 | J-04 Nest `/core` 0 · decisions 0 · VAL-400 · CB-403 · physical RD | QA J-04 · JSON summary nest=0 decisions=0 · screen 10 | 🟢 |
| 5 | Residual P0 | none · P1 OBS period filter only | 🟢 non-block |
| 6 | C-SLICE ≠ module CORE UAT · honesty false · CORE-02 ≠ pillar · note ≠ FR-08 | QA honesty + QC locks · JSON flags | 🟢 **RETAIN** |
| 7 | DENY Nest `/core` dual · fold `/decisions` · reopen J-CORE-02/01 · seed | QA DENY + QC locks · `seed_used=false` | 🟢 **RETAIN** |
| 8 | Pack BA/SA/DATA/API/BE/FE/QA | specs + evidence present · verify **8/8** | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-qa-01.md` | exit **0** · **8/8 PASS** |
| QC SoT pack this file | 🟢 **8/8** below |
| QC spot `pnpm run qc:dev-stack` | hrm/xbos/portal **200** (Windows UV assert after PASS — ENV OBS) |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 + QC spot `qc:dev-stack` | hrm/xbos/portal **200** | ENV/L0 |
| QA L1 rewards/discipline · VAL-400 · RD-404 · CB-403 · Nest `/core` DENY | rewards `HRM-EMP-PROFILE-200` · Nest Cannot GET · CF `HRM-CORE-CB-403` · amount VAL-400 | PRODUCT |
| QA runner U65 J-01..04 | overall **PASS** stamp `CORE08QA-MSL980WO` | PRODUCT |
| `verify:qc:evidence-pack` QA-01 | **8/8 PASS** | PROCESS |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ HRM FE `127.0.0.1:8080` · `:28001` · tab=rewards |
| 5 | journey_l25 | ✅ **J-HRM-CORE-08-01..04** 🟢 |
| 6 | crud_or_matrix | ✅ AC-CORE-08 · create/enforce/cancel · note-only · Nest DENY · CB-403 |
| 7 | residual_section | ✅ below · P1 OBS idle-ok · no P0 |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-CORE-08-01** | **PASS** | create title-first + draft period POST 201 · F5 Chờ / Chờ kỳ lương · Nest 0 |
| **J-HRM-CORE-08-02** | **PASS** | enforce 201 · F5 Đang thi hành + Đã gắn kỳ · no payslip_line invent |
| **J-HRM-CORE-08-03** | **PASS** | cancel-enforce 201 · note-only Không gắn kỳ · picker hidden |
| **J-HRM-CORE-08-04** | **PASS** | Nest `/core` 0 · decisions 0 · VAL-400 · CB-403 · DONE claims DENY |
| Module CORE / personnel UAT J-* promote | **DENIED** | C-SLICE |
| **J-HRM-CORE-02-*** / **J-HRM-CORE-01-*** prior seals | **PASS_RETAIN** | not re-litigated · DENY reopen · stamps `CORE02QC1-MSL80DU6` / `CORE01QC1-MSL6WMS7` |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-CORE-08-01 | **PASS** |
| J-HRM-CORE-08-02 | **PASS** |
| J-HRM-CORE-08-03 | **PASS** |
| J-HRM-CORE-08-04 | **PASS** |

### Screens

`docs/qa/evidence/screens/po-hrm-mvp-gd1-core-08-cluster-qa-01/` — 01-rd-tab-open · 02-reward-form-filled · 03-after-create · 04-f5-after-create · 05-after-enforce · 06-f5-after-enforce · 07-after-cancel · 08-note-only-created · 09-f5-note-cancel · 10-j04-done (+ 99-exception).

**PM action:** stamp `PROGRAM_JOURNEY_MAP.md` J-HRM-CORE-08-01..04 with QC stamp **`CORE08QC1-MSL9BFFE`** (QA already 🟢 PASS · C-SLICE · honesty false · CORE-02 ≠ pillar DONE · note ≠ FR-08 DONE). Update continuous board Wave-12 **SEALED GWC**.

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · `jd_dynamic_done=false` · personnel/CORE UAT **false** · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · fold `/decisions` · CORE-02=pillar DONE · note-CRUD=FR-08 DONE · seed · reopen sealed J-HRM-CORE-02-* / J-HRM-CORE-01-*.
2. **Condition OBS `R-CORE-08-STALE-DIST`:** QA intake rebuild+restart after pre-BE dist missing RD service / `payroll_period_id` — **ACCEPT** ops class; LIVE sealed before browser.
3. **Condition OBS `R-CORE-08-FE-PERIOD-FILTER` (P1):** `isRdPeriodSelectable` includes `processed` while BE locks processed → optional **dev-fe** align to `draft|open|adjust` only — **ACCEPT** non-blocking under C-SLICE (QA used draft; forced processed → 409).
4. **Condition OBS portal `:5173`:** QA used HRM Vite `:8080` fallback — **ACCEPT** ENV; not product NO-GO.
5. **RETAIN** SA Option A physical `/api/hrm/employees/:id/rewards*` + `/discipline*` (+ enforce/cancel-enforce) · dual tables + payroll_link · paper `/core/reward-discipline` alias only · Nest `/core` DENY · CORE-02 AuthZ/CB-403 · CORE-01 public strip · U19 list=create=enforce=note.
6. **OUT** this seat: CORE-09a clause library · CORE-09b/c/d · CORE-02b metadata · invent PAY process/payslip apply · invent Nest `/core` dual · fold RD into `/decisions` · module CORE UAT.
7. **NOT** Phase 1 DONE · **NOT** module CORE / personnel UAT · Wave-12 **SEALED GWC** ≠ program exit.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-CORE-08-STALE-DIST** | OBS | CLOSED / idle-ok | ops known — rebuild before LIVE claim |
| **R-CORE-08-FE-PERIOD-FILTER** | P1 | OPEN / idle-ok | optional **dev-fe** — selectable = `draft\|open\|adjust` only |
| Honesty / C-SLICE / module UAT / CORE-02≠pillar / note≠FR-08 | — | RETAIN | **pm** — DENY flip |
| Journey map + continuous board QC stamp | PROCESS | open | **pm** same session |

**No residual PRODUCT P0** from J-HRM-CORE-08-01..04 browser matrix.

---

## DENY

- Flip `recruitment_uat_ready` / `jd_dynamic_done` / claim module CORE / personnel UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/core` dual SoT · fold RD into `/decisions`  
- Claim CORE-02 packages = CORE pillar DONE · claim note-CRUD = FR-08 DONE  
- Seed / reopen sealed J-HRM-CORE-02-* / J-HRM-CORE-01-*  
- Treat GWC as module GO · C-SLICE-as-module-DONE · claim CORE pillar UAT DONE because KT/KL seat sealed  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board #15 **UC-BP-CORE-09a** Option) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-CORE-08: J-HRM-CORE-08-01..04 PASS (create+period · enforce payroll_link F5 · cancel + note-only none · Nest `/core` 0 · decisions 0 · CB-403 must_keep) · U65 · pack 8/8 · OBS stale-dist + P1 FE period filter idle-ok. Conditions: honesty false · C-SLICE · CORE-02 ≠ pillar DONE · note ≠ FR-08 DONE. DENY module CORE UAT / Phase1 / Nest dual / fold decisions / seed / reopen J-CORE-02/01. Next continuous: **UC-BP-CORE-09a** SA Option. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-CORE-09a
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-qc-01.md · stamp CORE08QC1-MSL9BFFE · Wave-12 UC-BP-CORE-08 SEALED
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after CORE-08 (#14) = **UC-BP-CORE-09a** (#15 QUEUED) «Thư viện điều khoản HĐ (Cài đặt) — ADD»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09a · TECHSPEC F-CORE-CTR-CL-* · API_DESIGN clause library cite · must_keep CORE-08 rewards/discipline + payroll_link · must_keep CORE-02 packages/eins + AuthZ/CB-403 · must_keep CORE-01 public strip · Nest /core DENY

MISSION — SA Option seat (narrow):
1) Option A/B/C for contract clause library (Settings) — versioned Vietnamese clauses · draft in-place vs bump-on-published · {{field}} placeholders vs AS-IS contract spine
2) F.1 API map + must_keep CORE-08 RD physical path · CORE-02 C&B · CORE-01 public · DENY Nest /core dual · DENY reopen sealed J-HRM-CORE-08-01..04 / J-HRM-CORE-02-* / J-HRM-CORE-01-* without regression · DENY flip recruitment_uat_ready / personnel UAT · DENY claim CORE-08 = CORE pillar DONE · DENY claim note-CRUD = FR-08 DONE · DENY claim printable/contract module UAT
3) Lock decision + unlock BA AC next — cấm code until Option CONFIRMED
cấm: honesty flip · recruitment_uat_ready · jd_dynamic_done · module CORE/personnel UAT · contracts_printable_ready · seed · Nest /core dual · reopen sealed CORE-08 / CORE-02 / CORE-01 / REC slices · invent 09b/09c/09d full print engine in this seat
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`CORE08QC1-MSL9BFFE` · 2026-08-09 · Wave-12 UC-BP-CORE-08 **SEALED GWC** ≠ module CORE / personnel UAT · CORE-02 ≠ pillar DONE · note-CRUD ≠ FR-08 DONE
