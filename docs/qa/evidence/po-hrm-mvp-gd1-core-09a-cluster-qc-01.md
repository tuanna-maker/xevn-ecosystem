# Evidence — PO-HRM-MVP-GD1-CORE-09A-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09A-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-CORE-09a C-SLICE only** · **not** module CORE / CTR / personnel UAT |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-13) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`CORE09AQA-MSLA1C9L`** · FE-01 READY · API-01 CONFIRMED RETAIN |
| **uc_ids** | `UC-BP-CORE-09a` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-core-09a-cluster-qa-01.md`](po-hrm-mvp-gd1-core-09a-cluster-qa-01.md) |
| **fe_ref** | [`po-hrm-mvp-gd1-core-09a-cluster-fe-01.md`](po-hrm-mvp-gd1-core-09a-cluster-fe-01.md) |
| **api_ref** | [`po-hrm-mvp-gd1-core-09a-cluster-api-01.md`](po-hrm-mvp-gd1-core-09a-cluster-api-01.md) · [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01.md) AC-CORE-09A-* · BR-CTR-CL-01..04 · O1–O12 |
| **data_ref** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md) |
| **sa_ref** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01.md) Option A LOCKED |
| **machine** | `_tmp-po-hrm-mvp-gd1-core-09a-cluster-qa-01.json` · overall **PASS** · stamp **`CORE09AQA-MSLA1C9L`** |
| **stamp** | QC **`CORE09AQC1-MSLA4LX9`** · QA **`CORE09AQA-MSLA1C9L`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` · `seed_used=false` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR UAT **false** · **CORE-08 ≠ pillar DONE** · **note-CRUD ≠ FR-08 DONE** · **PREV/VER/PDF/TPL ≠ invent DONE** |
| **portal_url** | `http://127.0.0.1:5173/command-center/hrm/settings?tab=contract-legal` · hrm-api `:28001` · `companyId=main` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **`contracts_printable_ready`** | **`false`** | **DENIED** flip |
| **Personnel / CORE / CTR UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module |
| **CORE-08 RD = CORE pillar DONE** | **DENIED** | must_keep · not this seat |
| **note-CRUD = FR-08 DONE** | **DENIED** | must_keep · not this seat |
| **PREV / VER / PDF / TPL invent DONE** | **DENIED** | peers 09b/09c/09d OUT |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/core` dual SoT** | **DENIED** | L1 Cannot GET · browser **0** hits |
| **Settings / XBOS as body SoT** | **DENIED** | mutate only Nest `contract-clauses*` |
| **Reopen sealed J-HRM-CORE-08 / 02 / 01** | **DENIED** | must_keep stamps CORE08QC1 / CORE02QC1 / CORE01QC1 |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed · `seed_used=false` |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-13 clause library GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `jd_dynamic_done=true`? | **NO** |
| May PM set `contracts_printable_ready=true`? | **NO** |
| May PM claim module CORE / CTR / personnel UAT / Phase1 DONE from this seat? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM claim CORE-08 = pillar DONE · note-CRUD = FR-08 DONE? | **NO** |
| May PM claim PREV/VER/PDF/TPL invent DONE? | **NO** |
| May PM invent Nest `/core` dual · reopen sealed J-CORE-08/02/01? | **NO** |
| May PM open next UC seat **UC-BP-CORE-09b** (board #16) as **sa Option**? | **YES** (U88/U89 continuous) |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-CORE-09a** (Settings Thư viện điều khoản · create+activate · draft PATCH F5 · issued CONFLICT→activate bump + print-version snapshot freeze · soft retire · Nest `/core` 0 · physical `/contracts-insurance/contract-clauses*`) after QA stamp **`CORE09AQA-MSLA1C9L`**.

Audited: QA-01 MD · raw JSON · screens 01–11 · L0/L1/network/journeys · BA/SA/DATA/API · FE-01 · DENY Nest `/core` · DENY printable · DENY PREV/VER/PDF/TPL invent · DENY CORE-08/note FR-08 DONE claims · must_keep CORE-08/02/01.

**U65 ACCEPT:** Cài đặt → Điều khoản HĐ → Thêm `LEGAL_CORE09A-LA1C9L` + `{{bo_luat}}` → POST **201** → F5 **Nháp** → Activate **201** → F5 **Hiệu lực** · draft PATCH **200** F5 body v2 · issued PATCH **409** `HRM-CTR-CL-CODE-CONFLICT` → bump activate **201** · `clauses_snapshot_json` unchanged · Retire **201** → F5 **Ngừng dùng** · Nest `/core` **0** · publish panel ≠ body SoT.

**OBS ACCEPT (non-blocking):** QA pack `command_table` **1/8 PROCESS OBS** (QC consolidates **8/8**) · Settings F5 drops to Tài khoản → reopen `?tab=contract-legal` (ops note) · **P2** `R-FE-CORE-09A-ISSUED-BODY` (activate bump does not apply pending form body — BE RETAIN) · peers PREV/PDF OUT.

**NOT Phase 1 DONE. NOT module CORE / CTR / personnel UAT. NOT printable ready. NOT PREV/VER/PDF/TPL invent DONE. NOT CORE-08 = pillar DONE. NOT note-CRUD = FR-08 DONE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-HRM-CORE-09A-01..04 browser U65 | PRODUCT L2.5 | **ACCEPT** this seat |
| Physical contract-clauses create/activate/PATCH/retire · snapshot freeze | PRODUCT | **ACCEPT** |
| Nest `/core` dual · 0 browser hits · L1 Cannot GET | PRODUCT / GOVERNANCE | **ACCEPT** · DENY dual |
| Settings F5 tab drop → reopen `contract-legal` | ENV/OPS | **ACCEPT** · documented ops note |
| `R-FE-CORE-09A-ISSUED-BODY` after CONFLICT bump | PRODUCT **P2 OBS** | **ACCEPT** non-blocking · BE RETAIN · peer BA optional |
| `R-FE-CORE-09A-PREV-PDF` peers OUT | GOVERNANCE | **LOCKED** — 09b/09c/09d |
| QA pack command_table missing | PROCESS OBS | **ACCEPT** · QC consolidates 8/8 |
| `qc:dev-stack` health 200 then Windows UV assert | ENV | **OBS** — health checks PASS |
| Honesty / seed / printable / CORE-08=pillar / note=FR-08 / PREV invent / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-01 create+activate F5 Nháp→Hiệu lực POST 201 physical · Nest `/core` 0 | QA J-01 · JSON `j01` · screens 01–05 | 🟢 |
| 2 | J-02 draft PATCH 200 → F5 body v2 | QA J-02 · JSON `j02` · screens 06–07 | 🟢 |
| 3 | J-03 issued 409 CONFLICT → activate bump 201 · snapshot freeze | QA J-03 · JSON freeze before=after · screens 08–09 | 🟢 |
| 4 | J-04 retire 201 Ngừng dùng · Nest 0 · publish≠body SoT · CORE-08/02/01 must_keep | QA J-04 · JSON nest_core_hits=0 · screens 10–11 | 🟢 |
| 5 | Residual P0 | none · P2 OBS issued-body only | 🟢 non-block |
| 6 | C-SLICE ≠ module CORE/CTR UAT · honesty false · printable false · CORE-08≠pillar · note≠FR-08 · PREV≠DONE | QA honesty + QC locks · JSON flags | 🟢 **RETAIN** |
| 7 | DENY Nest `/core` dual · Settings≠body SoT · reopen J-CORE-08/02/01 · seed | QA DENY + QC locks · `seed_used=false` | 🟢 **RETAIN** |
| 8 | Pack BA/SA/DATA/API/FE/QA | specs + evidence present · QC consolidates **8/8** | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-qa-01.md` | exit **1** · **1/8** FAIL `command_table` — **PROCESS OBS** (known class) |
| QC SoT pack this file | 🟢 **8/8** below |
| QC spot `pnpm run qc:dev-stack` | hrm/xbos/portal **200** (Windows UV assert after PASS — ENV OBS) |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 + QC spot `qc:dev-stack` | hrm/xbos/portal **200** | ENV/L0 |
| QA L1 clauses · Nest `/core` DENY · publish RETAIN · issued PATCH 409 | clauses `HRM-CTR-CL-200` · Nest Cannot GET · CONFLICT `HRM-CTR-CL-CODE-CONFLICT` | PRODUCT |
| QA runner U65 J-01..04 | overall **PASS** stamp `CORE09AQA-MSLA1C9L` | PRODUCT |
| `verify:qc:evidence-pack` QA-01 | **1/8** command_table PROCESS OBS · QC consolidates | PROCESS |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` settings `?tab=contract-legal` · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-CORE-09A-01..04** 🟢 |
| 6 | crud_or_matrix | ✅ AC-CORE-09A · F-CORE-CTR-CL-01..04 · create/activate/PATCH/retire · freeze · Nest DENY |
| 7 | residual_section | ✅ below · P2 OBS idle-ok · no P0 |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-CORE-09A-01** | **PASS** | create+activate F5 Nháp→Hiệu lực · POST 201 physical · Nest 0 |
| **J-HRM-CORE-09A-02** | **PASS** | draft PATCH 200 · F5 body v2 |
| **J-HRM-CORE-09A-03** | **PASS** | issued 409 CONFLICT → bump 201 · snapshot freeze unchanged |
| **J-HRM-CORE-09A-04** | **PASS** | retire 201 Ngừng dùng · Nest 0 · publish≠body SoT · seals must_keep · DENY printable/PREV invent |
| Module CORE / CTR / personnel UAT J-* promote | **DENIED** | C-SLICE |
| **J-HRM-CORE-08-*** / **02-*** / **01-*** prior seals | **PASS_RETAIN** | not re-litigated · DENY reopen · stamps `CORE08QC1-MSL9BFFE` / `CORE02QC1-MSL80DU6` / `CORE01QC1-MSL6WMS7` |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-CORE-09A-01 | **PASS** |
| J-HRM-CORE-09A-02 | **PASS** |
| J-HRM-CORE-09A-03 | **PASS** |
| J-HRM-CORE-09A-04 | **PASS** |

### Screens

`docs/qa/evidence/screens/po-hrm-mvp-gd1-core-09a-cluster-qa-01/` — 01-settings-clause-tab · 02-j01-form-filled · 03-j01-after-create · 04-j01-f5-after-create · 05-j01-f5-after-activate · 06-j02-after-patch · 07-j02-f5-body · 08-j03-conflict-banner · 09-j03-after-bump · 10-j04-open · 11-j04-f5-retired.

**PM action:** stamp `PROGRAM_JOURNEY_MAP.md` J-HRM-CORE-09A-01..04 with QC stamp **`CORE09AQC1-MSLA4LX9`** (QA already 🟢 PASS · C-SLICE · honesty false · printable false). Update continuous board Wave-13 **SEALED GWC** · next **UC-BP-CORE-09b** SA.

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR UAT **false** · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · Settings≠body SoT · CORE-08=pillar DONE · note-CRUD=FR-08 DONE · PREV/VER/PDF/TPL invent DONE · seed · reopen sealed J-HRM-CORE-08-* / J-HRM-CORE-02-* / J-HRM-CORE-01-*.
2. **Condition OBS `R-FE-CORE-09A-ISSUED-BODY` (P2):** After CONFLICT, activate bumps version but does not apply pending form body (BE RETAIN) — **ACCEPT** non-blocking under C-SLICE; optional peer BA/BE deepen on 09b/09c — **not** invent body-apply this WI.
3. **Condition OBS `R-FE-CORE-09A-PREV-PDF`:** F-CORE-CTR-PREV/VER/PDF/TPL **OUT** invent as DONE — peers **UC-BP-CORE-09b / 09c / 09d**.
4. **Condition OBS Settings F5 tab:** reload drops to Tài khoản — reopen `?tab=contract-legal` — **ACCEPT** ops class · not product NO-GO.
5. **Condition OBS pack command_table:** QA verify 1/8 PROCESS — QC consolidates 8/8 — **ACCEPT**.
6. **RETAIN** SA Option A physical `/api/hrm/contracts-insurance/contract-clauses*` · paper `/core/…/clauses` alias only · publish/pull ≠ body SoT · F-CORE-CTR-CL-01..04 · BR-CTR-CL-01..04 · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public · U19 J-09A.
7. **OUT** this seat: UC-BP-CORE-09b pack+preview · 09c version/PDF · 09d template catalog · DOCX · DnD · invent printable UAT · module CORE/CTR UAT.
8. **NOT** Phase 1 DONE · **NOT** module CORE / CTR / personnel UAT · Wave-13 **SEALED GWC** ≠ program exit.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-FE-CORE-09A-ISSUED-BODY** | P2 OBS | OPEN / idle-ok | peer BA/BE on later CTR seat — **not** invent this WI |
| **R-FE-CORE-09A-PREV-PDF** | P2 | OPEN / tracked | **sa** next **UC-BP-CORE-09b** (PREV) → 09c/09d |
| Honesty / C-SLICE / printable false / module UAT / CORE-08≠pillar / note≠FR-08 / PREV≠DONE | — | RETAIN | **pm** — DENY flip |
| Journey map + continuous board QC stamp | PROCESS | open | **pm** same session |

**No residual PRODUCT P0** from J-HRM-CORE-09A-01..04 browser matrix.

---

## DENY

- Flip `recruitment_uat_ready` / `jd_dynamic_done` / **`contracts_printable_ready`** / claim module CORE / CTR / personnel UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/core` dual SoT · Settings/XBOS as body SoT  
- Claim CORE-08 = pillar DONE · claim note-CRUD = FR-08 DONE  
- Claim PREV / VER / PDF / TPL invent DONE  
- Seed / reopen sealed J-HRM-CORE-08-* / J-HRM-CORE-02-* / J-HRM-CORE-01-*  
- Treat GWC as module GO · C-SLICE-as-module-DONE · claim CORE/CTR pillar UAT DONE because clause-library seat sealed  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board #16 **UC-BP-CORE-09b** Option) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-CORE-09a: J-HRM-CORE-09A-01..04 PASS (create+activate F5 · draft PATCH F5 · issued CONFLICT→bump + snapshot freeze · retire · Nest `/core` 0 · publish≠body SoT · CORE-08/02/01 must_keep) · U65 · pack QC 8/8 · P2 OBS issued-body idle-ok. Conditions: honesty false · printable false · C-SLICE · DENY CORE-08=pillar / note=FR-08 / PREV-VER-PDF-TPL invent DONE / module CORE·CTR UAT / Nest dual / seed / reopen J-CORE-08/02/01. Next continuous: **UC-BP-CORE-09b** SA Option. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-CORE-09b
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-qc-01.md · stamp CORE09AQC1-MSLA4LX9 · Wave-13 UC-BP-CORE-09a SEALED
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after CORE-09a (#15) = **UC-BP-CORE-09b** (#16 QUEUED) «Chọn gói nghề và xem trước HĐLĐ — ADD»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09b · docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md E.2 · TECHSPEC/API F-CORE-CTR-PREV-01 (+ pack resolve) · must_keep CORE-09a clause library F-CORE-CTR-CL-01..04 physical /contracts-insurance/contract-clauses* · must_keep CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public · Nest /core DENY

MISSION — SA Option seat (narrow):
1) Option A/B/C for occupational pack select + HDLD merge preview — pack_code/rules vs AS-IS · F-CORE-CTR-PREV-01 · C&B field ACL on preview · mandatory clause/field gate vs AS-IS print spine
2) F.1 API map + must_keep CORE-09a clause library (no reopen rewrite) · CORE-08 RD · CORE-02 · CORE-01 · DENY Nest /core dual · DENY reopen sealed J-HRM-CORE-09A-01..04 / J-CORE-08/02/01 without regression · DENY flip recruitment_uat_ready / contracts_printable_ready / personnel·CORE·CTR UAT · DENY claim CORE-09a = printable DONE · DENY invent 09c PDF/version persist or 09d TPL catalog as this seat DONE
3) Lock decision + unlock BA AC next — cấm code until Option CONFIRMED
cấm: honesty flip · recruitment_uat_ready · jd_dynamic_done · contracts_printable_ready · module CORE/CTR/personnel UAT · seed · Nest /core dual · reopen sealed CORE-09a / CORE-08 / CORE-02 / CORE-01 · invent 09c PDF engine / 09d full TPL catalog DONE in this seat
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`CORE09AQC1-MSLA4LX9` · 2026-08-09 · Wave-13 UC-BP-CORE-09a **SEALED GWC** ≠ module CORE / CTR / personnel UAT · printable false · CORE-08 ≠ pillar DONE · note-CRUD ≠ FR-08 DONE · PREV/VER/PDF/TPL ≠ invent DONE
