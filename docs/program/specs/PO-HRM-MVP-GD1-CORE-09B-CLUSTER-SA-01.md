# PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01 — Option/F.1 · Chọn gói nghề + xem trước HĐLĐ — ADD

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock BA AC → (ba-data HOLD default) → API residual only if BA proves gap → Dev |
| **depends_on** | QC-01 GWC Wave-13 UC-BP-CORE-09a **SEALED** — stamp `CORE09AQC1-MSLA4LX9` · evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-qc-01.md` · peer QA `CORE09AQA-MSLA1C9L` |
| **uc_ids** | `UC-BP-CORE-09b` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#16** after CORE-09a (#15 SEALED) |
| **ref_sa_spine** | Peer clause [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01.md) · RD [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md) · C&B [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md) · public [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md) · print spine [`PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md) **E.2** — **reuse · DENY reopen sealed J-HRM-CORE-09A-01..04 / J-HRM-CORE-08-01..04 / J-HRM-CORE-02-* / J-HRM-CORE-01-* / REC without regression** |
| **ref_honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **`contracts_printable_ready=false`** · personnel / CORE / CTR module UAT **false** · 16 program honesty flags **false** · **DENY claim CORE-09a = printable DONE** · **DENY claim CORE-08 = CORE pillar DONE** · **DENY invent 09c PDF/version persist or 09d TPL catalog as this seat DONE** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09b** · Diễn biến **#1–#5** · **BR-CTR-CL-02** · **BR-CTR-CL-04** · **AC-CTR-PRINT-01..03 · 06..08** · peers CORE-09 · 09a (**must_keep**) · 09c · 09d **OUT invent this seat** |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-CORE-CTR-PACK-01** · **F-CORE-CTR-PREV-01** · RETAIN **F-CORE-CTR-CL-01..04** · peers **F-CORE-CTR-VER/PDF/TPL** **OUT invent** as 09c/09d DONE this seat |
| **ref_code** | `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.controller.ts` (`pack-resolve` · `POST …/contracts/:id/preview`) · `contract-legal-print.service.ts` (`resolvePackForEmployee` · `previewContract` · `mandatoryGate` · `cb_masked`) · FE `ContractPrintSpinePanel.tsx` / `hrmApi.ts` pack-resolve+preview |
| **OUT** | Invent **09c** print-version persist + PDF engine as this WI DONE · invent **09d** open TPL catalog DONE · Nest `/core` dual pack/preview SoT · FE hardcode clause body · claim CORE-09a = printable · reopen sealed CORE-09a/08/02/01 · seed · honesty flip · `contracts_printable_ready=true` |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **`contracts_printable_ready=false`** · **C-SLICE** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-14 architecture unlock: **occupational pack select + HĐLĐ merge preview** vs AS-IS Nest pack-resolve + PREV spine |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` · U89 after CORE-09a QC-01 GWC (`CORE09AQC1-MSLA4LX9`) |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-CORE-09b · AC-CTR-PRINT-01..03/06..08 · F-CORE-CTR-PACK-01 · F-CORE-CTR-PREV-01 · must_keep CORE-09a F-CORE-CTR-CL-01..04 physical `/contracts-insurance/contract-clauses*` · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · U19 scope_parity |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **CORE-09a SEALED (`CORE09AQC1-MSLA4LX9`):** versioned Vietnamese clause library on LIVE `/contracts-insurance/contract-clauses*` · draft in-place · issued bump · `clauses_snapshot_json` freeze · Nest `/core` DENY · **printable false** · **≠** module CORE/CTR UAT · PREV/VER/PDF/TPL invent **OUT** as 09a DONE. **Pack + preview AS-IS (Nest PRESENT):** (1) Pack codes enum `GENERAL` · `IT_OFFICE` · `DRIVER` · `LOGISTICS` on templates/clauses/rules. (2) `hrm_contract_pack_rules` + `GET /api/hrm/contracts-insurance/contracts/pack-resolve?employee_id=` → `{ suggested_pack, allowed_packs[], reason }` (job_family / rules → default GENERAL; HCNS override before issue). (3) `POST /api/hrm/contracts-insurance/contracts/:id/preview` → merge template+clauses+keyword_map/registry · C&B mask (`can_view_cb` / `cb_masked`) · mandatory gate → `missing_fields[]` · `missing_clauses[]` · `can_issue` · **no** persist snapshot. (4) Registry CRUD (UF-HRM-02 / CORE-09) remains orthogonal. (5) FE spine panel already binds pack-resolve + preview. (6) **No** Nest `@Controller('core')` pack/preview SoT. |
| **Paper target** | FR-UC-BP-CORE-09b: chọn gói nghề (+ mẫu); gợi ý từ họ nghề/chức danh; điền sẵn field lõi + C&B đủ quyền; gắn điều khoản hiệu lực theo gói; bản xem trước văn bản HĐLĐ; thiếu bắt buộc → chặn + liệt kê; đổi gói đổi nhóm điều khoản; sổ đăng ký không bị thay thế; **không** claim nghiệm thu bản in / PDF persist / catalog mẫu DONE. |
| **Gap class** | **fidelity / AC-FE residual on LIVE pack+preview spine** — **not** greenfield dual: (1) board #16 needs GĐ1 Option lock + BA AC for U65 contract preview path; (2) risk invent Nest `/core` dual or claim CORE-09a clause GWC = printable; (3) risk invent 09c VER/PDF or 09d TPL as this seat DONE; (4) conflate LIVE preview API = FR-09b DONE without BA AC / pack-switch clause diff / C&B ACL journeys; (5) flip `contracts_printable_ready` / module CTR UAT. |
| **Constraints** | U89 continuous · **preserve** CORE-09a clause library · CORE-08 RD + payroll_link · CORE-02 packages/eins + AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · REC seals · C-SLICE · DENY claim CORE-09a = printable DONE · DENY invent 09c/09d engines · DENY seed · **cấm code until Option CONFIRMED** |
| **Failure impact if unresolved** | Board #16 stalls; Dev invents `/core` dual or folds PDF/TPL into 09b; honesty flip; regression CORE-09a/08/02/01 |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-CORE-01 (SEALED)     UC-BP-CORE-02 (SEALED)     UC-BP-CORE-08 (SEALED)     UC-BP-CORE-09a (SEALED)
  /employees* public         compensation-packages*     /rewards*+/discipline*      /contract-clauses*
  HRM-CORE-CB-403            AuthZ-403 · CB-403         payroll_link                body SoT · snapshot freeze
  Nest /core DENY            Nest /core DENY            Nest /core DENY             Nest /core DENY
       │                            │                          │                           │
       └──────────── must_keep ─────┴──────────────────────────┴───────────────────────────┘
                                         │
                                         ▼
  ┌──────────────────────── FR-UC-BP-CORE-09b (this seat) ───────────────────────────────┐
  │                                                                                        │
  │  F-CORE-CTR-PACK-01 RETAIN physical                                                    │
  │    GET /api/hrm/contracts-insurance/contracts/pack-resolve?employee_id=                │
  │    → suggested_pack · allowed_packs[] · reason (HCNS override BEFORE issue)            │
  │                                                                                        │
  │  F-CORE-CTR-PREV-01 RETAIN / UPGRADE fidelity (prefer LIVE)                            │
  │    POST /api/hrm/contracts-insurance/contracts/:id/preview                             │
  │    → sections · merged_fields · clauses[] · missing_* · can_issue · cb_masked          │
  │    → NO persist print version / NO PDF write (peer 09c)                                │
  │                                                                                        │
  │  Pack lock (MVP)                                                                       │
  │    GENERAL · IT_OFFICE · DRIVER  (LOGISTICS = optional / GĐ1.5 — not mandatory AC)     │
  │    IT ↔ DRIVER must swap clause set (apply_to_packs / template pack)                   │
  │                                                                                        │
  │  C&B ACL lock                                                                          │
  │    can_view_cb / cb_masked — salary·MST·allowance masked without C&B                   │
  │    RETAIN CORE-02 CB-403 · AuthZ-403 must_keep                                         │
  │                                                                                        │
  │  Mandatory gate lock                                                                   │
  │    missing_fields + missing_clauses → can_issue=false (block save/print peer 09c)      │
  │    0 active template → HRM-CTR-TPL-NONE / CTA (AC-CTR-PRINT-01 · BR-CTR-CL-04)          │
  │                                                                                        │
  │  Clause consume lock                                                                   │
  │    Resolve ACTIVE clauses from CORE-09a library OR never FE hardcode (BR-CTR-CL-03)    │
  │    Preview is ephemeral — issued snapshot freeze remains 09a/09c must_keep             │
  │                                                                                        │
  │  Registry lock (AC-CTR-PRINT-08)                                                       │
  │    Create/edit/F5 employee_contracts registry CRUD RETAIN — preview ADD-only overlay   │
  │                                                                                        │
  │  RETAIN: CORE-09a CL · CORE-08 RD · CORE-02 C&B · CORE-01 public · Nest /core DENY     │
  └────────────────────────────────────────────────────────────────────────────────────────┘
       │
       │  OUT this seat (peer board #17–18)
       ▼
  F-CORE-CTR-VER / PDF invent          = UC-BP-CORE-09c
  F-CORE-CTR-TPL catalog invent DONE   = UC-BP-CORE-09d
  Flip contracts_printable_ready       = DENY

  DENY: Nest /core dual PACK/PREV · FE hardcode body · claim CORE-09a = printable DONE
  DENY: invent 09c PDF/version persist · 09d TPL catalog as CORE-09b DONE
  Honesty: C-SLICE ≠ recruitment_uat_ready · ≠ jd_dynamic_done · ≠ CORE/CTR UAT
```

**Label lock:** «Chọn gói nghề và xem trước HĐLĐ» = **pack resolve + ephemeral merge preview** — **not** print/PDF persist; not open template catalog invent; not clause-library rewrite; not CORE-08 RD.  
**Spine lock:** Physical prefer `/api/hrm/contracts-insurance/contracts/pack-resolve` + `…/contracts/:id/preview` — any paper `/core/…` path = **alias only** — **DENY** Nest `/core` second SoT.  
**Preview lock:** Preview **MUST NOT** INSERT `hrm_contract_print_versions` issued row — that is **09c**.  
**Consume lock:** Clauses from LIVE library (CORE-09a) / template attachment — **DENY** FE hardcode legal body.  
**Honesty lock:** Slice GWC later **≠** `contracts_printable_ready=true` · **≠** module CORE/personnel/CTR UAT · **≠** claim CORE-09a = printable DONE.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API) | AS-IS LIVE | Verdict |
|------------|-------------------|------------|---------|
| Pack suggestion | F-CORE-CTR-PACK-01 · 09b #1–#2/#5 | `GET …/pack-resolve` LIVE | **RETAIN** |
| Pack codes MVP | GENERAL / IT_OFFICE / DRIVER | Enum + LOGISTICS present | **RETAIN** MVP 3 · LOGISTICS **optional** |
| Pack rules Settings | SPEC-01 B.1 | `hrm_contract_pack_rules` + PUT rules | **RETAIN** |
| HCNS override pack | FR-09b #5 | FE/API pack_code on preview | **RETAIN** + BA AC |
| Merge preview | F-CORE-CTR-PREV-01 · 09b #2–#4 | `POST …/preview` LIVE | **RETAIN** / fidelity UPGRADE |
| C&B ACL on preview | AC-CTR-PRINT-07 | `can_view_cb` · `cb_masked` | **RETAIN** must_keep CORE-02 |
| Mandatory clause/field gate | BR-CTR-CL-02 · AC-CTR-PRINT-06 | `missing_*` · `can_issue` | **RETAIN** + BA AC |
| 0 template | AC-CTR-PRINT-01 · BR-CTR-CL-04 | `HRM-CTR-TPL-NONE` | **RETAIN** |
| Pack switch clause diff | AC-CTR-PRINT-03 | resolveClausesForPack by pack | **RETAIN** + BA journey |
| Text layout preview | AC-CTR-PRINT-02 | sections/clauses merge | **UNLOCK BA AC + FE residual** |
| Registry CRUD intact | AC-CTR-PRINT-08 · CORE-09 | Contracts page CRUD LIVE | **must_keep RETAIN** |
| Clause library SoT | CORE-09a | `/contract-clauses*` SEALED | **must_keep RETAIN** — **no reopen rewrite** |
| Snapshot freeze | BR-CTR-CL-01 | `clauses_snapshot_json` | **must_keep** (consume on issue = 09c) |
| Print version persist | 09c F-CORE-CTR-VER | LIVE peer exists | **OUT invent** as DONE this seat |
| PDF render | 09c F-CORE-CTR-PDF | LIVE peer / stub header | **OUT invent** as DONE this seat |
| Open TPL catalog 09d | 09d F-CORE-CTR-TPL | LIVE peer open catalog | **OUT invent** as DONE this seat |
| Nest `/core` pack/preview | paper alias? | **DENY** dual | **DENY** |
| Module / honesty | program | C-SLICE | **DENY flip** · **DENY printable UAT** |

---

## 3. Options

### Option A — ACCEPT_AS_IS_RETAIN: LIVE pack-resolve + PREV merge preview + C&B ACL + mandatory gate (RECOMMENDED)

| | |
|--|--|
| **Description** | **Preserve** CORE-09a clause library F-CORE-CTR-CL-01..04 on physical `/contracts-insurance/contract-clauses*` (no reopen rewrite) · CORE-08 rewards/discipline + payroll_link · CORE-02 packages/eins + AuthZ-403 + CB-403 · CORE-01 public strip · Nest `/core` DENY. **Preserve** LIVE Nest **F-CORE-CTR-PACK-01** (`GET …/contracts/pack-resolve`) + **F-CORE-CTR-PREV-01** (`POST …/contracts/:id/preview`) as **single pack+preview SoT**. **LOCK packs MVP:** `GENERAL` · `IT_OFFICE` · `DRIVER` (LOGISTICS optional / not mandatory GĐ1 AC). **LOCK resolve:** job_family / `hrm_contract_pack_rules` → `suggested_pack`; HCNS **may override** before issue. **LOCK preview:** ephemeral merge (template + active clauses by pack + keyword_map/registry) · **C&B field ACL** (`cb_masked`) · mandatory field/clause gate → `can_issue=false` + list missings · 0 template → fail-closed CTA. **LOCK consume:** clause bodies from CORE-09a library only — **DENY** FE hardcode. **LOCK registry:** employee_contracts create/edit/F5 **RETAIN** (AC-CTR-PRINT-08). Paper `/core/…` = **alias / DOC-DELTA only**. **OUT** invent 09c VER/PDF persist + 09d TPL catalog **as this seat DONE**. **DENY** claim CORE-09a = printable DONE · reopen sealed J-HRM-CORE-09A-01..04 / J-CORE-08/02/01. |
| **Benefits** | Aligns FR-09b + F-CORE-CTR-PACK/PREV + LIVE code/FE spine; zero dual SoT; unlocks U89 #16 BA without greenfield; preserves W10–W13 must_keep; clear peer boundary to 09c/09d |
| **Costs** | BA AC pack (O1–O12) + U65 FE residual if preview UX/text-layout gap vs AC-CTR-PRINT-02; DOC-DELTA path cite if paper alias; no schema invent by default |
| **Risks** | Dev invents Nest `/core` dual or folds PDF/TPL into 09b — **mitigate:** DENY + O8. Claims CORE-09a=printable / flips ready — **mitigate:** O9/O10 |

### Option B — Greenfield Nest `/core` dual · OR invent 09c PDF/version + 09d TPL as CORE-09b DONE · OR rewrite pack rules greenfield wipe

| | |
|--|--|
| **Description** | Implement paper `/api/hrm/core/…/preview` as primary Nest SoT; **or** treat print-version persist + PDF + open TPL catalog as “pack preview DONE”; **or** wipe LIVE `hrm_contract_pack_rules` / PREV for a second engine. |
| **Benefits** | Paper path fidelity / one-seat mega delivery illusion |
| **Costs** | Dual writers · board #17–18 collapse · Nest `/core` DENY break · U89 delay · printable false honesty break |
| **Risks** | Snapshot/issue regression · CORE-09a/08/02/01 regression · honesty flip — **REJECT** |

### Option C — HOLD / LIVE preview = FR-09b DONE / CORE-09a = printable / honesty flip / reopen sealed

| | |
|--|--|
| **Description** | Treat LIVE PREV/API or CORE-09a GWC as FR-UC-BP-CORE-09b complete without BA AC; or HOLD board; or flip `contracts_printable_ready` / recruitment / personnel UAT; or reopen sealed J-HRM-CORE-09A-01..04 / J-CORE-08/02/01. |
| **Benefits** | Short-term idle |
| **Costs** | AC-CTR-PRINT unmet (pack switch / C&B mask / text preview); board #16 false DONE or stuck; violates U89 + honesty |
| **Risks** | C-SLICE violation · sponsor idle — **REJECT** |

---

## 4. Trade-off Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|-------:|:--------:|:--------:|:--------:|
| Business value (FR-CORE-09b + AC-CTR-PRINT) | 25 | **9** | 5 | 2 |
| Time to deliver (U89 continuous) | 20 | **9** | 2 | 1 |
| Complexity / blast radius | 15 | **9** | 2 | 6 |
| Security / C&B ACL + CORE-01·02·08·09a + U19 | 15 | **9** | 3 | 2 |
| Reliability (ONE PREV SoT · no premature issue) | 15 | **9** | 2 | 2 |
| Maintainability (RETAIN LIVE · Nest DENY · peer split) | 10 | **9** | 2 | 2 |
| **Weighted (≈)** | 100 | **9.00** | **2.90** | **2.35** |

---

## 5. Failure Modes and Mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Nest `/core/…/preview` as second SoT | Grep routes | **DENY** dual Nest; paper = alias only |
| A | Preview INSERT issued print version | Code review | **DENY** — peer **09c** only |
| A | PDF claim as CORE-09b DONE | Scope | **OUT** O8 · peer 09c |
| A | TPL catalog invent as CORE-09b DONE | Scope | **OUT** O8 · peer 09d |
| A | FE hardcode clause body on preview | QA/lint | **BR-CTR-CL-03** FAIL |
| A | Pack switch keeps same clause body set | Journey AC-CTR-PRINT-03 | BA AC + QA FAIL |
| A | C&B salary/MST leak without ACL | Role probe | RETAIN `cb_masked` · CORE-02 CB-403 |
| A | `can_issue=true` with missing mandatory | Contract test | RETAIN `mandatoryGate` |
| A | 0 template still “fake” preview printable | AC-CTR-PRINT-01 | RETAIN `HRM-CTR-TPL-NONE` |
| A | Break registry CRUD | AC-CTR-PRINT-08 | **must_keep** O7 |
| A | Reopen rewrite CORE-09a clause library | Diff/bus | **DENY reopen** without regression |
| A | Claim CORE-09a = printable DONE | Review | **DENY** · O9 |
| A | Flip `contracts_printable_ready` / recruitment / jd / CORE UAT | QC honesty | **DENY** · O10 |
| A | Seed for U65 | QA evidence | **DENY** seed |
| B | Dual SoT + Nest `/core` / PDF invent | Integration | Reject B |
| C | Board idle / false DONE / honesty flip | U89 | Reject C |

---

## 6. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE `pack-resolve` + `POST …/preview` on `/contracts-insurance/*`; pack MVP GENERAL/IT_OFFICE/DRIVER; C&B ACL + mandatory gate; consume CORE-09a clauses; paper `/core` alias only; **RETAIN** CORE-09a/08/02/01 · Nest `/core` DENY; **OUT** invent 09c VER/PDF + 09d TPL as this seat DONE |
| **Why selected** | AS-IS already implements pack suggestion, merge preview, C&B mask, mandatory/`can_issue`, and FE spine bind; residual is **GĐ1 BA AC + U65 preview fidelity** under U89 — not greenfield Nest dual, not PDF/TPL invent, not clause-library reopen; preserves W10–W13 must_keep; unlocks board #16 |
| **Assumptions** | CORE-09a F-CORE-CTR-CL-01..04 **SEALED RETAIN** (`CORE09AQC1-MSLA4LX9`). CORE-08 F-CORE-RD-01 **RETAIN** (`CORE08QC1-MSL9BFFE`). CORE-02 packages/eins + AuthZ/CB-403 **RETAIN**. CORE-01 public + CB-403 **RETAIN**. Nest `/core` DENY **RETAIN**. `contracts_printable_ready=false` · `jd_dynamic_done=false` · `recruitment_uat_ready=false`. |
| **Rejected** | **B** — Nest `/core` dual / invent 09c·09d engine as 09b DONE / wipe pack-PREV · **C** — HOLD / LIVE=FR-09b DONE / CORE-09a=printable / honesty flip / reopen sealed |

### 6.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|----------------------|-----------------|
| **O1** | Physical path | Prefer `GET …/contracts/pack-resolve` + `POST …/contracts/:id/preview`; any `/core/…` = alias / DOC-DELTA only — **DENY** Nest `/core` dual | Cite Network paths on HĐ preview spine |
| **O2** | Pack matrix | MVP packs `GENERAL` · `IT_OFFICE` · `DRIVER`; LOGISTICS optional (not required AC unless BA proves); suggestion + HCNS override | Pack picker AC + labels VI |
| **O3** | Preview vs issue | Preview ephemeral — **no** print-version INSERT; `can_issue` gates peer 09c save/PDF | AC-CTR-PRINT-02/06 wording · DENY 09c invent |
| **O4** | C&B ACL | Non-C&B → `cb_masked=true` (salary/MST/allowance hidden); C&B sees merge — RETAIN CORE-02 CB-403 | AC-CTR-PRINT-07 |
| **O5** | Mandatory gate | Missing Đ.21 field or mandatory clause → `can_issue=false` + `missing_*[]`; 0 template → TPL-NONE / CTA | AC-CTR-PRINT-01/06 · BR-CTR-CL-02/04 |
| **O6** | Pack switch | IT_OFFICE ↔ DRIVER changes clause set / pack-specific fields (DRIVER GPLX/plate) | AC-CTR-PRINT-03 |
| **O7** | Registry must_keep | Create/edit/F5 sổ đăng ký HĐ vẫn PASS — preview is ADD overlay | AC-CTR-PRINT-08 |
| **O8** | Peers OUT | UC-BP-CORE-09c VER/PDF · 09d TPL catalog invent as this WI DONE · DOCX · ATT · CORE-02b — **peer** seats only | Scope note |
| **O9** | must_keep CORE-09a / 08 / 02 / 01 | RETAIN F-CORE-CTR-CL-01..04 physical · RD payroll_link · packages/eins · AuthZ/CB-403 · public strip · Nest `/core` DENY · **DENY** claim CORE-09a = printable DONE · **DENY** CORE-08 = pillar DONE · **DENY** reopen J-HRM-CORE-09A-01..04 / J-CORE-08/02/01 / REC without regression | Footer |
| **O10** | Honesty | All flags false · C-SLICE · **DENY** flip `recruitment_uat_ready` / `jd_dynamic_done` / `contracts_printable_ready` / module CORE·personnel·CTR UAT | Footer every evidence |
| **O11** | Display-ready | Preview DTO display-ready (pack label · clause titles · missing lists VI · `can_issue` · `cb_masked`) — **no** FE invent PDF Net | FE bind |
| **O12** | Journeys | DRAFT `J-HRM-CORE-09B-01..04` (open draft+pack suggest · preview text layout · pack switch clause diff + C&B mask · mandatory block + Nest `/core` 0 + CORE-09a/08/02/01 regression) | BA mint J-* |

### 6.2 must_keep / DENY

| Class | Rule |
|-------|------|
| **must_keep** | LIVE `GET …/pack-resolve` · `POST …/contracts/:id/preview` · pack codes + `hrm_contract_pack_rules` · `can_issue`/`missing_*`/`cb_masked` · LIVE `/contracts-insurance/contract-clauses*` + snapshot freeze (CORE-09a) · LIVE `/employees/:id/rewards*` + `/discipline*` + payroll_link (CORE-08) · LIVE compensation-packages* + employee-insurances* · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · CORE-01 public strip · Nest `/core` DENY · employee_contracts registry CRUD · soft-delete · `resolveHrmListScope` U19 · stamps **`CORE09AQC1-MSLA4LX9`** · **`CORE08QC1-MSL9BFFE`** · **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** · REC seals · honesty false |
| **DENY invent** | Nest `/api/hrm/core/**` as **second** pack/preview SoT · FE hardcode legal body · rewrite CORE-09a clause library / reopen J-HRM-CORE-09A-01..04 · invent 09c VER/PDF persist as CORE-09b DONE · invent 09d TPL catalog as CORE-09b DONE · claim CORE-09a = printable DONE · claim CORE-08 = CORE pillar DONE · claim printable/contract module UAT · flip `contracts_printable_ready` / `jd_dynamic_done` / `recruitment_uat_ready` · seed · reopen sealed J-CORE-08/02/01 / REC without regression |
| **OUT** | UC-BP-CORE-09c · 09d **implementation invent as this WI DONE** · DOCX · DnD layout reorder seat · CORE-05/06/07 · ATT · CORE-02b · PAY |
| **HOLD peer** | `contracts_printable_ready` · recruitment module UAT · personnel / CORE / CTR module UAT · `payroll_e2e_ready` · `R-PLT-JD-DYNAMIC-DONE-01` |
| **Honesty** | All flags **false** until named waves · **C-SLICE** |

### 6.3 Sealed peers (RETAIN — do not reopen)

| Wave | Stamp / residual | Rule |
|------|------------------|------|
| W1–W9 REC | prior GWC stamps | RETAIN |
| W10 CORE-01 | stamp **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-01-* | RETAIN — **DENY reopen without regression** |
| W11 CORE-02 | stamp **`CORE02QC1-MSL80DU6`** · J-HRM-CORE-02-01..04 | RETAIN — packages **≠** CORE pillar DONE |
| W12 CORE-08 | stamp **`CORE08QC1-MSL9BFFE`** · J-HRM-CORE-08-01..04 | RETAIN — RD **≠** pack preview · **≠** CORE pillar DONE |
| W13 CORE-09a | stamp **`CORE09AQC1-MSLA4LX9`** · QA `CORE09AQA-MSLA1C9L` · J-HRM-CORE-09A-01..04 | RETAIN — **DENY reopen rewrite** · clause library **≠** printable DONE · PREV was OUT invent as 09a DONE — **now unlocked as this seat** |
| Print spine peers | VER/PDF/TPL LIVE | **RETAIN peer** — **OUT** invent as CORE-09b DONE · printable flag **false** |

---

## 7. F.1 API map (intent — unlock BA; physical lock at API-01 if residual)

| Cap | F-id | change | Physical prefer (Option A) | Paper alias | SRS bước |
|-----|------|--------|----------------------------|-------------|----------|
| Pack resolve | **F-CORE-CTR-PACK-01** | **RETAIN** | `GET /api/hrm/contracts-insurance/contracts/pack-resolve?employee_id=` | `/core/…` alias only | FR-CORE-09b Diễn biến **#1** · **#2** · **#5** |
| Pack rules admin | **F-CORE-CTR-PACK-*** | **RETAIN** | `GET/PUT …/pack-rules` (Settings) | — | SPEC-01 B.1 — residual AC only |
| Merge preview | **F-CORE-CTR-PREV-01** | **RETAIN** (+ FE AC residual) | `POST /api/hrm/contracts-insurance/contracts/:id/preview` | alias | **#2–#4** · AC-CTR-PRINT-02/03/06/07 |
| Clause library | **F-CORE-CTR-CL-01..04** | **RETAIN SEALED** | `/contracts-insurance/contract-clauses*` | `/core/…/clauses` alias | FR-CORE-09a — **must_keep · no rewrite** |
| Registry CRUD | **F-CORE-CTR-01** family | **RETAIN** | `/contracts-insurance/contracts*` | — | AC-CTR-PRINT-08 · CORE-09 |
| Print version | **F-CORE-CTR-VER-*** | **OUT invent** | peer 09c | — | **OUT** this seat |
| PDF | **F-CORE-CTR-PDF-*** | **OUT invent** | peer 09c | — | **OUT** this seat |
| Template catalog | **F-CORE-CTR-TPL-*** | **OUT invent DONE** | peer 09d (RETAIN consume if LIVE for preview resolve) | — | **OUT invent as 09b DONE** — preview **may** resolve existing active template |
| CORE-08 RD | **F-CORE-RD-01** | **RETAIN SEALED** | `/employees/:id/rewards*` + `/discipline*` | `/core/reward-discipline` alias | FR-CORE-08 — **≠ 09b** |
| CORE-02 C&B | **F-CORE-EMP-02** | **RETAIN SEALED** | compensation-packages* | `/core/…/compensation` alias | FR-CORE-02 · preview ACL |
| CORE-01 public | **F-CORE-EMP-01** | **RETAIN SEALED** | `/api/hrm/employees*` | `/core/employees` alias | FR-CORE-01 |

**Wire codes (RETAIN — no invent rewrite):** `HRM-CTR-PREV-200` · `HRM-CTR-PACK-200` · `HRM-CTR-TPL-NONE` · `HRM-CTR-PACK-INVALID` · `HRM-CTR-TPL-PACK-MISMATCH` · `HRM-CTR-TERM-INVALID` · `HRM-CTR-DRIVER-REQUIRED` · `HRM-CTR-UNIT-SCOPE` · `HRM-SCOPE-409` · RETAIN CORE-09a `HRM-CTR-CL-*` · CORE-08/02/01 codes. FE hardcode-body = **QA/lint FAIL**.

**U19:** pack-resolve employee load ↔ contract get-by-id ↔ preview = **same** contracts-insurance / hrm list-scope resolver family.

**Serializer / boundary rule:** Preview responses **MAY** include merged public fields + clause titles/bodies for authorized roles. Without C&B → **MUST** mask salary/MST/allowance (`cb_masked`). Public `/employees*` **MUST NOT** grow C&B dumps (CORE-01/02 must_keep). Preview **MUST NOT** persist issued snapshot. CORE-09b seat **MUST NOT** flip printable readiness or rewrite CORE-09a library.

**F.1 PREV purpose (lock):**
1. **Mục đích** — Sinh bản xem trước HĐLĐ theo gói nghề + ACL C&B; không lưu phiên bản in.
2. **Nghiệp vụ xử lý** — Resolve template/clauses by pack; merge tokens; mask C&B; validate mandatory → `missing_*` + `can_issue`; 0 template → `HRM-CTR-TPL-NONE`.
3. **Bước SRS** — FR-UC-BP-CORE-09b Diễn biến **#2–#4** (+ #5 pack đổi).

**F.1 PACK purpose (lock):**
1. **Mục đích** — Gợi ý `pack_code` từ chức danh / họ nghề; HCNS đổi được trước ban hành.
2. **Nghiệp vụ xử lý** — Rules → suggested_pack · allowed_packs · reason; default GENERAL.
3. **Bước SRS** — FR-UC-BP-CORE-09b Diễn biến **#1–#2** · **#5**.

---

## 8. ba-data / API unlock ladder

```text
SA-01 Option A CONFIRMED (this seat)
  → ba-process BA-01 AC (O1–O12) CONFIRMED
  → ba-data DATA-01 HOLD default (tables LIVE: pack_rules · templates · clauses · contracts)
       └─ conditional UNLOCK only if BA proves physical column gap for preview fields
  → sa API-01 F.1 physical LOCK only if BA/QA prove residual wire gap
       └─ else RETAIN F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 cite → Dev FE preview fidelity
  → Dev BE (HOLD unless residual) + FE-01 pack+preview U65
  → QA U65 · QC GWC C-SLICE
```

**cấm code** `apps/**` until BA (+ DATA when required) + API contracts CONFIRMED per program gate.  
**cấm invent** 09c/09d full engines as CORE-09b DONE until board #17–18.  
**cấm** honesty flip / Nest `/core` dual / reopen sealed CORE-09a/08/02/01.

---

## 9. Validation / acceptance evidence plan (for BA→QA)

| Layer | PASS when |
|-------|-----------|
| L0 | Stack health |
| L1 | pack-resolve 200 · preview 200 with clauses · IT↔DRIVER clause set differs · non-C&B `cb_masked` · missing mandatory → `can_issue=false` · 0 template → TPL-NONE · Nest `/core` DENY · CORE-09a CL + CORE-08 RD + CORE-02 AuthZ/CB-403 + CORE-01 public still PASS · preview does **not** create issued print-version |
| L2.5 J-* | Open HĐ → pack suggest → preview text layout · pack switch clause diff · C&B mask · mandatory block list · registry CRUD F5 still works · Nest `/core` 0 · no CORE-09a/08/02/01 regression |
| L3 QC | GWC C-SLICE only · honesty false · DENY module CORE/personnel/CTR UAT · DENY `contracts_printable_ready` · DENY claim CORE-09a = printable DONE · DENY invent 09c/09d DONE · DENY reopen J-HRM-CORE-09A/08/02/01 without regression |

**Proposed journeys (DRAFT for BA):**  
`J-HRM-CORE-09B-01` open draft + pack-resolve suggest · `J-HRM-CORE-09B-02` preview text layout (A/B · term · ≥1 clause) · `J-HRM-CORE-09B-03` pack IT↔DRIVER clause diff + C&B mask · `J-HRM-CORE-09B-04` mandatory block + Nest `/core` 0 + CORE-09a/08/02/01 must_keep regression (+ registry F5).

---

## 10. Completion

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-CORE-09b: RETAIN LIVE `F-CORE-CTR-PACK-01` + `F-CORE-CTR-PREV-01` on `/contracts-insurance/*`; pack MVP GENERAL/IT_OFFICE/DRIVER; C&B ACL + mandatory/`can_issue`; consume CORE-09a clauses (**no reopen rewrite**); paper `/core` alias only; RETAIN CORE-09a/08/02/01 · Nest `/core` DENY; OUT invent 09c VER/PDF + 09d TPL as this seat DONE; REJECT B Nest dual/PDF-TPL invent + C HOLD/LIVE=DONE/printable/honesty; unlock **ba-process** BA-01; **no** `apps/**`; honesty false · C-SLICE · `contracts_printable_ready=false`. |
| **next_owner** | **ba-process** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01
lane: governance · ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09b
depends_on: SA-01 Option A CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01.md · peer QC CORE09AQC1-MSLA4LX9
spec_ref: SRS FR-UC-BP-CORE-09b · AC-CTR-PRINT-01..03/06..08 · BR-CTR-CL-02/04 · SPEC-01 E.2 · API F-CORE-CTR-PACK-01 · F-CORE-CTR-PREV-01 · must_keep F-CORE-CTR-CL-01..04 · SA O1–O12

MISSION — BA AC pack (narrow):
1) Confirm O1–O12 under Option A — physical pack-resolve + POST …/preview · pack MVP · ephemeral preview (no VER insert) · C&B cb_masked · mandatory can_issue · pack switch clause diff · registry must_keep
2) AC matrix U65: open HĐ→pack suggest→preview text · IT↔DRIVER clause change · non-C&B mask · missing→block list · Nest /core 0
3) Mint DRAFT J-HRM-CORE-09B-01..04 · must_keep CORE-09a clause library · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public · Nest /core DENY
4) DENY invent 09c VER/PDF · 09d TPL catalog as this WI DONE · DENY claim CORE-09a=printable DONE · contracts_printable_ready · reopen sealed J-HRM-CORE-09A/08/02/01 · seed · apps/**

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01.md · PASS_TO_PM · next ba-data HOLD default (or sa API-01 if residual)
```
