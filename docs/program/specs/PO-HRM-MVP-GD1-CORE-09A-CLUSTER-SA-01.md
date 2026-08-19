# PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01 — Option/F.1 · Thư viện điều khoản HĐ (Cài đặt) — ADD

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock BA AC → (ba-data HOLD default) → API residual only if BA proves gap → Dev |
| **depends_on** | QC-01 GWC Wave-12 UC-BP-CORE-08 **SEALED** — stamp `CORE08QC1-MSL9BFFE` · evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-qc-01.md` · peer QA `CORE08QA-MSL980WO` |
| **uc_ids** | `UC-BP-CORE-09a` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#15** after CORE-08 (#14 SEALED) |
| **ref_sa_spine** | Peer RD [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md) · C&B [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md) · public [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md) · peer platform clause body SoT [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01.md) (Option B Nest RETAIN — **same architecture class**) — **reuse · DENY reopen sealed J-HRM-CORE-08-01..04 / J-HRM-CORE-02-* / J-HRM-CORE-01-* / REC without regression** |
| **ref_honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **`contracts_printable_ready=false`** · personnel / CORE module UAT **false** · 16 program honesty flags **false** · **DENY claim CORE-08 = CORE pillar DONE** · **DENY claim note-CRUD = FR-08 DONE** · **DENY claim printable/contract module UAT** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09a** · Diễn biến #1–#5 · **BR-CTR-CL-01..04** · AC-CTR-CL-01..03 · AC-PLT-CTR-CL-01..06 · peers CORE-09 · 09b · 09c · 09d **OUT invent this seat** |
| **ref_hdsd** | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH06h_HRM_THU_VIEN_DIEU_KHOAN_HD.md` |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-CORE-CTR-CL-01..04** · **F-CORE-CTR-PUB/PULL** (RETAIN) · peers F-CORE-CTR-PREV/VER/PDF **OUT invent** as 09b/09c engine this seat |
| **ref_code** | `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.controller.ts` (`@Controller('contracts-insurance')` · `contract-clauses*`) · `contract-legal-print.service.ts` (`hrm_contract_clauses` · draft-in-place · issued soft-block → activate) |
| **OUT** | Invent full print engine **09b/09c/09d** this seat · DOCX / DnD layout reorder · Nest `/core` dual clause SoT · Settings/XBOS body SoT · mega clause-version EAV · claim CORE-08 = pillar DONE · reopen sealed CORE-08/02/01 · seed · honesty flip · `contracts_printable_ready=true` |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **`contracts_printable_ready=false`** · **C-SLICE** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-13 architecture unlock: **versioned Vietnamese clause library (Settings)** vs AS-IS Nest `hrm_contract_clauses` + print-spine snapshot |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` · U89 after CORE-08 QC-01 GWC (`CORE08QC1-MSL9BFFE`) |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-CORE-09a · BR-CTR-CL-01..04 · F-CORE-CTR-CL-01..04 · must_keep CORE-08 rewards/discipline + payroll_link · CORE-02 packages/eins + AuthZ/CB-403 · CORE-01 public strip · Nest `/core` DENY · U19 scope_parity |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **CORE-08 SEALED (`CORE08QC1-MSL9BFFE`):** KT/KL execute + payroll_link on LIVE `/employees/:id/rewards*` + `/discipline*` · Nest `/core` **DENY** · decisions ≠ RD · CB-403 must_keep · **≠** CORE pillar DONE · **≠** note=FR-08 DONE. **Clause library AS-IS (Nest PRESENT):** (1) Table `public.hrm_contract_clauses` — `code · title_vi · body_vi · clause_group · apply_to_packs[] · sort_order · mandatory · status · version · effective_from · archived_at · origin/lineage`. (2) Nest `@Controller('contracts-insurance')` → `GET/POST/PATCH /api/hrm/contracts-insurance/contract-clauses*` + `POST …/:id/activate` + `POST …/:id/retire` via `ContractLegalPrintService`. (3) **Draft / not-issued:** `updateClause` edits `body_vi` **in place**. (4) **Active + issued snapshot:** body change soft-blocked `HRM-CTR-CL-CODE-CONFLICT` → force `POST …/activate` (version bump); issued bodies frozen in `hrm_contract_print_versions.clauses_snapshot_json`. (5) Placeholders **`{{token}}`** in `body_vi` / `keyword_map` (Q-PLT-01). (6) Group→member via `hrm_contract_library_publishes` + pull. (7) **No** Nest `@Controller('core')` clause SoT. Peer platform SA already locked Nest body SoT (**RETAIN**) — this seat **re-locks under U89 CORE board** with CORE-08/02/01 must_keep. |
| **Paper target** | FR-UC-BP-CORE-09a: Settings thư viện điều khoản VI theo mã/phiên bản/gói nghề; nháp sửa tại chỗ; đã gắn HĐ phát hành → tăng phiên bản; HĐ cũ giữ ảnh chụp; `{{tên_trường}}`; cấm hardcode văn bản luật dài trên màn nghiệp vụ; **không** claim nghiệm thu bản in / module HĐ. |
| **Gap class** | **fidelity / AC-FE residual on LIVE clause spine** — **not** greenfield dual: (1) board #15 needs GĐ1 Option lock + BA AC for U65 Settings path; (2) risk invent Nest `/core` dual or Settings/XBOS second body SoT; (3) risk invent full 09b/09c/09d print engine in this seat; (4) conflate CORE-08 RD GWC = CORE pillar DONE or LIVE CRUD = FR-09a DONE without AC; (5) flip `contracts_printable_ready` / module CTR UAT. |
| **Constraints** | U89 continuous · **preserve** CORE-08 RD + payroll_link · CORE-02 packages/eins + AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · REC seals · C-SLICE · DENY claim CORE-08 = pillar DONE · DENY note=FR-08 DONE · DENY printable UAT · DENY invent 09b/09c/09d full engine · DENY seed · **cấm code until Option CONFIRMED** |
| **Failure impact if unresolved** | Board #15 stalls; Dev invents `/core` dual or Settings body SoT; print-spine freeze broken; honesty flip; regression CORE-08/02/01 |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-CORE-01 (SEALED)          UC-BP-CORE-02 (SEALED)          UC-BP-CORE-08 (SEALED)
  /employees* public strip        compensation-packages*          /employees/:id/rewards*
  HRM-CORE-CB-403                 + employee-insurances*          + /discipline* + payroll_link
  Nest /core DENY                 AuthZ-403 · CB-403              Nest /core DENY · decisions ≠ RD
       │                                 │                                 │
       └──────────────────── must_keep ──┴─────────────────────────────────┘
                                         │
                                         ▼
  ┌──────────────────────── FR-UC-BP-CORE-09a (this seat) ───────────────────────┐
  │                                                                                │
  │  F-CORE-CTR-CL-01..04 RETAIN physical (prefer LIVE)                            │
  │    GET/POST/PATCH /api/hrm/contracts-insurance/contract-clauses*               │
  │    POST …/contract-clauses/:id/activate   (+ version bump when issued)         │
  │    POST …/contract-clauses/:id/retire     (soft; snapshot intact)              │
  │                                                                                │
  │  Lifecycle lock                                                                │
  │    draft / not-issued  → edit body_vi IN PLACE (version unchanged/optional)    │
  │    active + issued     → DENY silent overwrite → activate bump                 │
  │    issued contracts    → clauses_snapshot_json IMMUTABLE                       │
  │                                                                                │
  │  Placeholder lock                                                              │
  │    {{token}} / {{tên_trường}} ONLY — DENY dual syntax in one template          │
  │                                                                                │
  │  Body SoT = Nest hrm_contract_clauses.body_vi                                  │
  │    Settings = admin UX surface (not second body store)                         │
  │    paper /core/…/clauses (if any) = alias / DOC-DELTA ONLY                     │
  │                                                                                │
  │  RETAIN: library publish/pull · template_clauses order (DnD OUT reorder seat)  │
  │  RETAIN: CORE-01/02/08 must_keep · Nest /core DENY                             │
  └────────────────────────────────────────────────────────────────────────────────┘
       │
       │  OUT this seat (peer board #16–18)
       ▼
  F-CORE-CTR-PREV / VER / PDF / TPL invent     = UC-BP-CORE-09b · 09c · 09d
  DOCX · DnD layout reorder                    = GĐ2 / peer AC
  Flip contracts_printable_ready               = DENY

  DENY: Nest /core dual CL · Settings/XBOS body SoT · mega clause-version EAV
  DENY: claim CORE-08 = CORE pillar DONE · note-CRUD = FR-08 DONE · printable UAT
  Honesty: C-SLICE ≠ recruitment_uat_ready · ≠ jd_dynamic_done · ≠ CORE UAT
```

**Label lock:** «Thư viện điều khoản HĐ (Cài đặt)» = **versioned body-as-data library** — **not** print/PDF engine; not pack preview; not template open catalog invent; not CORE-08 RD.  
**Spine lock:** Physical prefer `/api/hrm/contracts-insurance/contract-clauses*` — any paper `/core/…` clause path = **alias only** — **DENY** Nest `/core` second SoT.  
**Version lock:** Draft **in-place**; published/issued → **bump-on-activate**; snapshot freeze must_keep.  
**Placeholder lock:** `{{field}}` / `{{token}}` AS-IS contract spine — DENY invent alternate merge syntax this seat.  
**Honesty lock:** Slice GWC later **≠** `contracts_printable_ready=true` · **≠** module CORE/personnel/CTR UAT · **≠** claim CORE-08 = pillar DONE.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API) | AS-IS LIVE | Verdict |
|------------|-------------------|------------|---------|
| List/create/update clauses | F-CORE-CTR-CL-01/02 · `/contracts-insurance/contract-clauses` | Nest LIVE same path | **RETAIN** SoT |
| Activate + version bump | F-CORE-CTR-CL-03 | `POST …/activate` LIVE | **RETAIN** |
| Retire soft | F-CORE-CTR-CL-04 | `POST …/retire` LIVE | **RETAIN** |
| Draft edit in-place | FR-09a · AC-PLT-CTR-CL-01 | `updateClause` in-place | **RETAIN** |
| Issued body → bump | BR-CTR-CL-01 · AC-PLT-CTR-CL-02 | soft-block → activate | **RETAIN** |
| Snapshot freeze | BR-CTR-CL-01 · AC-PLT-CTR-CL-03 | `clauses_snapshot_json` | **must_keep RETAIN** |
| `{{field}}` placeholders | FR-09a Mục đích | `{{token}}` in body/keyword_map | **RETAIN LOCK** |
| FE hardcode body | BR-CTR-CL-03 | anti-pattern | **UNLOCK AC** (QA/lint FAIL) |
| Settings admin UX | FR-09a #1 | may be partial / residual | **UNLOCK BA AC + FE residual if proven** |
| Group publish/pull | F-CORE-CTR-PUB/PULL | LIVE | **RETAIN** · not new SoT |
| Pack preview / print PDF | 09b / 09c | LIVE peers exist | **OUT invent** as DONE this seat |
| Template catalog 09d | 09d | LIVE open catalog peer | **OUT invent** this seat |
| Nest `/core` clause | paper alias? | **DENY** dual | **DENY** |
| CORE-08 RD / CORE-02 / CORE-01 | sealed | stamps CORE08/02/01 | **must_keep RETAIN** |
| Module / honesty | program | C-SLICE | **DENY flip** · **DENY printable UAT** |

---

## 3. Options

### Option A — ACCEPT_AS_IS_RETAIN: Nest clause library + draft-in-place / bump-on-issued + `{{field}}` (RECOMMENDED)

| | |
|--|--|
| **Description** | **Preserve** CORE-08 rewards/discipline + payroll_link · CORE-02 packages/eins + AuthZ-403 + CB-403 · CORE-01 public strip · Nest `/core` DENY. **Preserve** LIVE Nest `/api/hrm/contracts-insurance/contract-clauses*` on `hrm_contract_clauses` as **single body SoT**. **LOCK lifecycle:** draft / not-issued → edit `body_vi` **in place**; active clause already in an **issued** print version → **DENY** silent overwrite → `POST …/activate` **version bump**; issued contracts keep frozen `clauses_snapshot_json`. **LOCK placeholders:** `{{token}}` / `{{tên_trường}}` only (AS-IS spine · Q-PLT-01) — DENY dual merge syntax. Settings = **admin UX** over Nest SoT (**not** Settings/XBOS second body store). Paper `/core/…/clauses` (if cited) = **alias / DOC-DELTA only**. **RETAIN** library publish/pull. **OUT** invent full 09b pack-preview / 09c print-PDF / 09d template-catalog **engines** as this seat’s DONE. Cite peer platform CTR-CLAUSE-SA Nest RETAIN as same class. **DENY** claim CORE-08 = CORE pillar DONE · note-CRUD = FR-08 DONE · printable/contract module UAT. |
| **Benefits** | Aligns SRS FR-09a + API F-CORE-CTR-CL-* + LIVE code; zero dual SoT; freeze/version already implemented; unlocks U89 #15 BA without greenfield; preserves W10–W12 must_keep |
| **Costs** | BA AC pack (O1–O12) + U65 Settings FE residual if UI gap; DOC-DELTA path cite if paper alias; no schema invent by default |
| **Risks** | Dev invents Nest `/core` dual or Settings body SoT — **mitigate:** DENY + O1. Invents 09b/c/d as CORE-09a DONE — **mitigate:** O8 OUT. Claims CORE-08=pillar DONE / printable ready — **mitigate:** O9/O10 |

### Option B — Greenfield Nest `/core` dual · OR Settings/XBOS body SoT · OR invent full print engine (09b/c/d) here

| | |
|--|--|
| **Description** | Implement paper `/api/hrm/core/…/clauses` as primary Nest SoT; **or** move `body_vi` to Settings/XBOS catalog as authoritative store; **or** fold pack-preview + print-version + PDF + template catalog into this WI as “clause library DONE”. |
| **Benefits** | Paper path fidelity / one-seat mega delivery illusion |
| **Costs** | Dual writers · freeze regression · Nest `/core` DENY break · board #16–18 collapse · U89 delay |
| **Risks** | Snapshot corruption · CORE-08/02/01 regression · honesty flip — **REJECT** |

### Option C — HOLD / LIVE CRUD = FR-09a DONE / CORE-08 = pillar DONE / printable UAT / honesty flip

| | |
|--|--|
| **Description** | Treat LIVE Nest CRUD or CORE-08 GWC as FR-UC-BP-CORE-09a complete without BA AC; or HOLD board; or flip `contracts_printable_ready` / `recruitment_uat_ready` / personnel UAT; or reopen sealed J-CORE-08/02/01. |
| **Benefits** | Short-term idle |
| **Costs** | AC-PLT-CTR-CL unmet; board #15 false DONE or stuck; violates U89 + honesty |
| **Risks** | C-SLICE violation · sponsor idle — **REJECT** |

---

## 4. Trade-off Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|-------:|:--------:|:--------:|:--------:|
| Business value (FR-CORE-09a + BR-CTR-CL) | 25 | **9** | 5 | 2 |
| Time to deliver (U89 continuous) | 20 | **9** | 2 | 1 |
| Complexity / blast radius | 15 | **9** | 2 | 6 |
| Security / CORE-01·02·08 boundary + U19 | 15 | **9** | 3 | 2 |
| Reliability (ONE body SoT · snapshot freeze) | 15 | **9** | 2 | 2 |
| Maintainability (RETAIN LIVE · Nest DENY) | 10 | **9** | 2 | 2 |
| **Weighted (≈)** | 100 | **9.00** | **2.90** | **2.35** |

---

## 5. Failure Modes and Mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Nest `/core/…/clauses` as second SoT | Grep routes | **DENY** dual Nest; paper = alias only |
| A | Settings/XBOS owns `body_vi` | Architecture review | **DENY** second body SoT · Settings = UX only |
| A | Silent overwrite issued body | Contract test | RETAIN `HRM-CTR-CL-CODE-CONFLICT` → activate |
| A | Rewrite issued `clauses_snapshot_json` | Code review | **DENY** · BR-CTR-CL-01 |
| A | FE hardcode long legal body | QA/lint | **BR-CTR-CL-03** FAIL |
| A | Dual placeholder syntax | Template review | **DENY** · `{{x}}` only |
| A | Mega `hrm_contract_clause_versions` EAV without need | ba-data gate | **HOLD** default · conditional only |
| A | Invent 09b/09c/09d as this WI DONE | Scope | **OUT** O8 |
| A | Claim CORE-08 = CORE pillar DONE | Review | **DENY** · O9 |
| A | Claim note-CRUD = FR-08 DONE | Review | **DENY** · must_keep CORE-08 honesty |
| A | Flip `contracts_printable_ready` / recruitment / jd / CORE UAT | QC honesty | **DENY** · O10 |
| A | Reopen sealed J-HRM-CORE-08-01..04 / J-CORE-02 / J-CORE-01 | Bus | **DENY reopen** without regression |
| A | Seed for U65 | QA evidence | **DENY** seed |
| B | Dual SoT + Nest `/core` / print invent | Integration | Reject B |
| C | Board idle / false DONE / honesty flip | U89 | Reject C |

---

## 6. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: Nest `hrm_contract_clauses` body SoT on LIVE `/contracts-insurance/contract-clauses*`; **draft in-place** vs **bump-on-issued activate**; placeholders **`{{field}}`**; paper `/core` = alias only; **RETAIN** CORE-08 RD · CORE-02 C&B · CORE-01 public · Nest `/core` DENY; **OUT** invent 09b/09c/09d full print engine |
| **Why selected** | AS-IS already implements versioned Vietnamese clause CRUD + issued soft-block + snapshot freeze + `{{token}}`; residual is **GĐ1 BA AC + Settings FE fidelity** under U89 — not greenfield Nest dual, not Settings body migrate, not print-module invent; preserves W10–W12 must_keep; unlocks board #15 |
| **Assumptions** | CORE-08 F-CORE-RD-01 **SEALED RETAIN** (`CORE08QC1-MSL9BFFE`). CORE-02 packages/eins + AuthZ/CB-403 **RETAIN**. CORE-01 public + CB-403 **RETAIN**. Nest `/core` DENY **RETAIN**. Peer platform CTR-CLAUSE Nest body SoT **RETAIN class**. `contracts_printable_ready=false` · `jd_dynamic_done=false` · `recruitment_uat_ready=false`. |
| **Rejected** | **B** — Nest `/core` dual / Settings body SoT / invent 09b·09c·09d engine · **C** — HOLD / CRUD=FR-09a DONE / CORE-08=pillar DONE / printable UAT / honesty flip |

### 6.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|----------------------|-----------------|
| **O1** | Physical path | Prefer `/api/hrm/contracts-insurance/contract-clauses*`; any `/core/…/clauses` = alias / DOC-DELTA only — **DENY** Nest `/core` dual | Cite Network paths Settings list/create/update/activate/retire |
| **O2** | Field matrix | `code · title_vi · body_vi · clause_group · apply_to_packs · sort_order · mandatory · status · version` + display-ready labels | Field matrix + VAL empty code/title/body |
| **O3** | Draft vs bump | Draft / not-issued → in-place save 2xx + F5; active+issued → conflict → activate bump; snapshot immutable | AC-PLT-CTR-CL-01..03 wording |
| **O4** | Placeholders | `{{tên_trường}}` / `{{token}}` only — DENY dual syntax; open N+1 codes allowed | AC-PLT-CTR-CL-04 · BR-CTR-CL-03 |
| **O5** | Physical schema | **HOLD** ba-data default — tables LIVE; **conditional** prior-body admin history only if BA proves snapshot insufficient — **DENY** mega-EAV / second body SoT | ba-data HOLD vs conditional |
| **O6** | Soft retire | Retire/archive soft; issued snapshots readable; no hard-delete when referenced | AC-CTR-CL-03 · AC-PLT-CTR-CL-06 |
| **O7** | Consumer resolve | Preview/print **resolve** from library row or snapshot — **never** FE hardcode body | AC-PLT-CTR-CL-05 · scope note |
| **O8** | Peers OUT | UC-BP-CORE-09b / 09c / 09d full engines · DOCX · DnD reorder · F-CORE-CTR-PREV/VER/PDF invent as this WI DONE · ATT · CORE-02b — **peer** seats only | Scope note |
| **O9** | must_keep CORE-08 / 02 / 01 | RETAIN RD payroll_link · packages/eins · AuthZ/CB-403 · public strip · Nest `/core` DENY · **DENY** claim CORE-08 = CORE pillar DONE · **DENY** note-CRUD = FR-08 DONE · **DENY** reopen J-HRM-CORE-08-01..04 / J-CORE-02-* / J-CORE-01-* / REC without regression | Footer |
| **O10** | Honesty | All flags false · C-SLICE · **DENY** flip `recruitment_uat_ready` / `jd_dynamic_done` / `contracts_printable_ready` / module CORE·personnel·CTR UAT | Footer every evidence |
| **O11** | Display-ready | Clause DTO display-ready (group label · pack labels · status VI · version) — **no** FE invent print PDF Net | FE bind |
| **O12** | Journeys | DRAFT `J-HRM-CORE-09A-01..04` (Settings create+activate · draft edit F5 · issued bump + snapshot freeze · retire soft + Nest `/core` 0 + CORE-08/02/01 regression) | BA mint J-* |

### 6.2 must_keep / DENY

| Class | Rule |
|-------|------|
| **must_keep** | LIVE `/api/hrm/contracts-insurance/contract-clauses*` · `hrm_contract_clauses.body_vi` + `version` · activate soft-block · `hrm_contract_print_versions.clauses_snapshot_json` freeze · library publish/pull · LIVE `/employees/:id/rewards*` + `/discipline*` + payroll_link (CORE-08) · LIVE compensation-packages* + employee-insurances* · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · CORE-01 public strip · Nest `/core` DENY · soft-delete · `resolveHrmListScope` U19 · stamps **`CORE08QC1-MSL9BFFE`** · **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** · REC seals · honesty false |
| **DENY invent** | Nest `/api/hrm/core/**` as **second** clause SoT · Settings/XBOS as body SoT · mega clause-version EAV / second body table · rewrite issued snapshot · FE hardcode legal body · dual placeholder syntax · invent full 09b/09c/09d print engine as CORE-09a DONE · claim CORE-08 = CORE pillar DONE · claim note-CRUD = FR-08 DONE · claim printable/contract module UAT · flip `contracts_printable_ready` / `jd_dynamic_done` / `recruitment_uat_ready` · seed · reopen sealed J-HRM-CORE-08-01..04 / J-CORE-02-* / J-CORE-01-* / REC without regression |
| **OUT** | UC-BP-CORE-09b · 09c · 09d **implementation invent** · DOCX · DnD layout reorder seat · CORE-05/06/07 · ATT · CORE-02b · PAY |
| **HOLD peer** | `contracts_printable_ready` · recruitment module UAT · personnel / CORE module UAT · `payroll_e2e_ready` · `R-PLT-JD-DYNAMIC-DONE-01` |
| **Honesty** | All flags **false** until named waves · **C-SLICE** |

### 6.3 Sealed peers (RETAIN — do not reopen)

| Wave | Stamp / residual | Rule |
|------|------------------|------|
| W1–W9 REC | prior GWC stamps | RETAIN |
| W10 CORE-01 | stamp **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-01-* | RETAIN — **DENY reopen without regression** |
| W11 CORE-02 | stamp **`CORE02QC1-MSL80DU6`** · J-HRM-CORE-02-01..04 | RETAIN — packages **≠** CORE pillar DONE |
| W12 CORE-08 | stamp **`CORE08QC1-MSL9BFFE`** · QA `CORE08QA-MSL980WO` · J-HRM-CORE-08-01..04 | RETAIN — **DENY reopen without regression** · RD **≠** clause library · **≠** CORE pillar DONE · note **≠** FR-08 DONE |
| Platform CTR-CLAUSE | Nest body SoT RETAIN | **RETAIN class** — this seat re-locks under U89 CORE board |
| Print spine peers | PREV/VER/PDF/TPL LIVE | **RETAIN peer** — **OUT** invent as CORE-09a DONE · printable flag **false** |

---

## 7. F.1 API map (intent — unlock BA; physical lock at API-01 if residual)

| Cap | F-id | change | Physical prefer (Option A) | Paper alias | SRS bước |
|-----|------|--------|----------------------------|-------------|----------|
| List clauses | **F-CORE-CTR-CL-01** | **RETAIN** | `GET /api/hrm/contracts-insurance/contract-clauses` | `/core/…/clauses` alias only | FR-CORE-09a Diễn biến **#1** |
| Create / update | **F-CORE-CTR-CL-02** | **RETAIN** (+ residual FE AC) | `POST/PATCH …/contract-clauses` · draft in-place · issued soft-block | alias | **#2** · **#5** · BR-CTR-CL-01 |
| Activate + bump | **F-CORE-CTR-CL-03** | **RETAIN** | `POST …/contract-clauses/:id/activate` | alias | **#3** · AC-CTR-CL-02 |
| Retire | **F-CORE-CTR-CL-04** | **RETAIN** | `POST …/contract-clauses/:id/retire` | alias | **#4** · AC-CTR-CL-03 |
| Get-by-id | **F-CORE-CTR-CL-*** | **RETAIN** | `GET …/contract-clauses/:id` | — | U19 scope_parity |
| Publish / pull | **F-CORE-CTR-PUB/PULL-*** | **RETAIN** | `/contract-library/publishes*` · `/pull` | — | Group lineage — not new SoT |
| Pack preview | **F-CORE-CTR-PREV-01** | **OUT invent** | peer 09b | — | **OUT** this seat |
| Print version / PDF | **F-CORE-CTR-VER/PDF-*** | **OUT invent** | peer 09c | — | **OUT** this seat |
| Template catalog | **F-CORE-CTR-TPL-*** | **OUT invent** | peer 09d | — | **OUT** this seat |
| CORE-08 RD | **F-CORE-RD-01** | **RETAIN SEALED** | `/employees/:id/rewards*` + `/discipline*` | `/core/reward-discipline` alias | FR-CORE-08 — **≠ 09a** |
| CORE-02 C&B | **F-CORE-EMP-02** | **RETAIN SEALED** | compensation-packages* | `/core/…/compensation` alias | FR-CORE-02 |
| CORE-01 public | **F-CORE-EMP-01** | **RETAIN SEALED** | `/api/hrm/employees*` | `/core/employees` alias | FR-CORE-01 |

**Wire codes (RETAIN — no invent rewrite):** `HRM-CTR-CL-200/201` · `HRM-CTR-CL-REQUIRED` · `HRM-CTR-CL-CODE-CONFLICT` · `HRM-CTR-CL-404` · `HRM-SCOPE-409` · RETAIN CORE-08/02/01 `HRM-CORE-RD-*` / `HRM-CORE-CB-*` / AuthZ codes. FE hardcode-body = **QA/lint FAIL** (not new 4xx).

**U19:** list ↔ get-by-id ↔ update ↔ activate ↔ retire = **same** scope resolver family as contracts-insurance list (company membership ladder).

**Serializer / boundary rule:** Clause admin responses **MAY** include full `body_vi` + version to config roles. Public `/employees*` **MUST NOT** grow C&B or clause-body dumps (CORE-01/02 must_keep). Preview/print consumers **MUST** resolve from library row or snapshot — **never** invent body on FE. CORE-09a seat **MUST NOT** flip printable readiness or write payslip / RD fields.

---

## 8. ba-data / API unlock ladder

```text
SA-01 Option A CONFIRMED (this seat)
  → ba-process BA-01 AC (O1–O12) CONFIRMED
  → ba-data DATA-01 HOLD default (tables LIVE)
       └─ conditional UNLOCK only if BA proves admin prior-body history gap
  → sa API-01 F.1 physical LOCK only if BA/QA prove residual wire gap
       └─ else RETAIN F-CORE-CTR-CL-01..04 cite → Dev FE Settings residual
  → Dev BE (HOLD unless residual) + FE-01 Settings fidelity
  → QA U65 · QC GWC C-SLICE
```

**cấm code** `apps/**` until BA (+ DATA when required) + API contracts CONFIRMED per program gate.  
**cấm invent** 09b/09c/09d full print engine until board #16–18 seats.  
**cấm** honesty flip / Nest `/core` dual / reopen sealed CORE-08/02/01.

---

## 9. Validation / acceptance evidence plan (for BA→QA)

| Layer | PASS when |
|-------|-----------|
| L0 | Stack health |
| L1 | List/create clause 2xx · draft edit in-place F5 · issued body PATCH → `HRM-CTR-CL-CODE-CONFLICT` · activate bumps version · retire soft · Nest `/core` DENY · CORE-08 RD + CORE-02 packages/AuthZ/CB-403 + CORE-01 public still PASS |
| L2.5 J-* | Settings: create → activate → draft edit F5 · issued bump keeps old snapshot · retire hides from new select · Nest `/core` 0 · no RD/C&B/public regression |
| L3 QC | GWC C-SLICE only · honesty false · DENY module CORE/personnel/CTR UAT · DENY `contracts_printable_ready` · DENY claim CORE-08 = pillar DONE · DENY note=FR-08 DONE · DENY reopen J-CORE-08/02/01 without regression |

**Proposed journeys (DRAFT for BA):**  
`J-HRM-CORE-09A-01` Settings create + activate · `J-HRM-CORE-09A-02` draft edit in-place F5 · `J-HRM-CORE-09A-03` issued bump + snapshot freeze · `J-HRM-CORE-09A-04` retire soft + Nest `/core` 0 + CORE-08/02/01 must_keep regression.

---

## 10. Completion

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-CORE-09a: RETAIN Nest `hrm_contract_clauses` on LIVE `/contracts-insurance/contract-clauses*`; draft **in-place** vs issued **bump-on-activate**; placeholders **`{{field}}`**; paper `/core` alias only; RETAIN CORE-08 RD+payroll_link · CORE-02 packages/eins · AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY; OUT invent 09b/09c/09d print engine; REJECT B Nest dual/Settings body/print invent + C HOLD/CRUD=DONE/CORE-08=pillar DONE/printable UAT/honesty; unlock **ba-process** BA-01; **no** `apps/**`; honesty false · C-SLICE · `contracts_printable_ready=false`. |
| **next_owner** | **ba-process** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01
lane: governance · ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09a
depends_on: SA-01 Option A CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01.md · peer QC CORE08QC1-MSL9BFFE
spec_ref: SRS FR-UC-BP-CORE-09a · BR-CTR-CL-01..04 · AC-CTR-CL · AC-PLT-CTR-CL-01..06 · API F-CORE-CTR-CL-01..04 · HDSD CH06h · SA O1–O12

MISSION — BA AC pack (narrow):
1) Confirm O1–O12 under Option A — physical `/contracts-insurance/contract-clauses*` · draft in-place vs bump-on-issued · {{field}} · soft retire · Settings UX ≠ body SoT
2) AC matrix U65: Settings create→activate→F5 · draft edit F5 · issued conflict→activate·snapshot freeze · retire soft · Nest /core 0
3) Mint DRAFT J-HRM-CORE-09A-01..04 · must_keep CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest /core DENY
4) DENY invent 09b/09c/09d print engine · DENY claim CORE-08=pillar DONE · note=FR-08 DONE · contracts_printable_ready · reopen sealed J-CORE-08/02/01 · seed · apps/**

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01.md · PASS_TO_PM · next ba-data HOLD default (or sa API-01 if residual)
```
