# SA-HRM-ERP-WORLD-BENCHMARK-01 — World-class ERP HRM patterns vs XeVN HRM+XBOS

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-HRM-ERP-WORLD-BENCHMARK-01` |
| **from_role** | pm |
| **to_role** | sa |
| **lane** | governance G0-ERP — architecture/docs only · **no** `apps/**` |
| **date** | 2026-07-28 |
| **program** | `P-HRM-ERP-DATA-FIDELITY-01` (supersedes narrow `P-HRM-MD-PICKER-01`) |
| **extends** | `docs/qa/evidence/sa-xbos-hrm-control-gap-01-20260728.md` |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Executive verdict (sponsor PO)

| PO question | Verdict | One-line |
|-------------|---------|----------|
| Functionally «enough» menus vs data-model depth? | **Menus ≈ HAS · Depth = PARTIAL** | Portal/app menus cover Org→Workforce→Time→Pay→Recruit→PF→Settings; **detail fidelity** (catalog codes, FK assert, entitlement rules, position management) does **not** yet unlock ERP-class leverage. |
| Master data governance adequate? | **PARTIAL** | Ownership model §18.1 + L0→L1→L2a spine **correct**; coverage allow-list + consumer bind **incomplete** (prior SA control-gap). |
| Settings vs transactional separation clean? | **PARTIAL → YES on design · NO on enforcement** | Spec clean (DANH_MUC §1/§13 · TechSpec §18.1); runtime still allows free-text / soft TEXT as SoT on several TX forms. |
| Gaps blocking full business leverage? | **YES — cohort gaps** | Not one Position bug — **(A)** control-plane key breadth · **(B)** Settings→consumer bind · **(C)** constraint depth · **(D)** talent/comp thin · **(E)** BM vs L0 fork. |
| XBOS enough to **control** HRM subsystem? | **PARTIAL** (unchanged, extended) | Enough for **job_titles** end-to-end control pattern; **not** enough for full DANH_MUC 72 STT + leave/dept fan-out + DEC/PAY catalogs as controlled SoT. |
| Data detail enough to unlock business power? | **NO** (explicit) | Menus + live APIs ≠ ERP power. Power requires **code-keyed master → constrained TX → analytics**. XeVN is mid-journey: spine good, **detail chain broken** at pickers/constraints/breadth. |

**Phase1 / PROD:** **Not claimed** · HOLD_DEPLOY unchanged · **cấm** `apps/**` until SYNTH + sponsor chốt E-waves.

---

## 2. Method & evidence basis (facts vs assumptions)

### Benchmark frame (capability classes — not vendor marketing)

World-class HCM patterns (SuccessFactors / Oracle HCM / Workday-class) share five structural invariants:

1. **Foundation data** (legal entity, org tree, job architecture) = governed master, versioned, scoped.
2. **Workforce transactions** reference master **by durable code/id**, never free labels as SoT.
3. **Settings/config** (leave types, pay components, calendars, stages) separate from **TX** (requests, periods, payslips).
4. **Effective-dating / assignment** (who holds which position when) drives time, pay, security.
5. **Integration/control plane** publishes policy down to consuming modules with audit.

XeVN target architecture already **names** this (XBOS SoT → HRM snapshot → extension → picker). Gap is **completeness + enforcement**, not missing vision.

### Facts (repo artifacts)

| Source | What it proves |
|--------|----------------|
| `HRM_ERP_DATA_FIDELITY_PROGRAM.md` | Sponsor rejects Position-only plan; full ERP fidelity program G0 |
| `TECHSPEC.md` §14–§18 · §11.4 | FR↔API ALIGNED/PARTIAL matrix; Settings ownership lock; field-catalog path |
| `SRS.md` §16.0–16.2 | BR-HRM-MD-01 · AC-HRM-PICKER-01 · FR-HRM-SC-POS/JT/LEAVE/DEC/PAY |
| `DANH_MUC_XBOS_CHO_HRM.md` | 72 STT catalog inventory + XBOS-DM-HRM-01..15 UCs |
| `DB/API_DESIGN_HRM_SETTINGS_CATALOG.md` | L0→L1→L2a physical; P0 keys = leave/dept/job_titles only deep |
| Prior SA control-gap 20260728 | XBOS control **PARTIAL**; apply-to-members allow-list = 3 keys |
| BA picker inventory + catalog-trace 20260728 | Settings CRUD OK; many consumer forms FREE_TEXT / PARTIAL (name not code) |
| `HRM_MENU_DATA_LINKAGE_MATRIX.md` | Broad menu↔UC map; fidelity AC-FID still open on density/linkage |

### Assumptions

1. Runtime Nest allow-list still matches OpenAPI (docs WI — not live re-probe this seat).
2. Claude peer benchmark (`CLAUDE-SA-HRM-ERP-BENCHMARK-01`) may refine scores — **SYNTH merges**; this seat is Cursor baseline.
3. «World-class» = **pattern bar for Phase-1 product power**, not feature-parity with SAP SF full suite.

### Non-goals

- No `apps/**` · no Dev · no seed · no Phase1/PROD claim · no single-Position E1 unlock before G1 cohorts.

---

## 3. Capability scorecard (HAS / PARTIAL / MISSING)

Legend: **HAS** = design + enough runtime/API depth for the class · **PARTIAL** = menu/API exists but incomplete depth/bind/governance · **MISSING** = no enforceable product path for the class.

### 3.1 Org / Legal entity / Job architecture

| Capability class (ERP) | XeVN surface | Score | Evidence note |
|------------------------|--------------|-------|---------------|
| Legal entity / group→member | XBOS LE + Plane A/B bridge ADR | **HAS** | TechSpec §19 · ADR 4LE↔5slug |
| Org tree / departments | Catalog `departments` + Settings panel | **PARTIAL** | Settings OK; many filters store **name** not **code** (catalog-trace GAP-WH-DEPT) |
| Position / job title library | L0 `job_titles` + extension | **PARTIAL** | Control spine HAS for job_titles; consumer WH/Decisions/Contracts/REC often FREE_TEXT |
| Job grade / band / level | DANH_MUC thin; FR band orphan #11 | **MISSING** / thin | No ERP-grade job architecture (grade→pay band→position) |
| Cost center / org finance link | DANH_MUC STT 62 optional | **MISSING** | Not required for Phase-1 logistics HR; blocks finance leverage |
| Location / work site | STT 4 chi nhánh | **PARTIAL** | Catalog named; not consistently bound on TX |
| Multi-company membership / kiêm nhiệm | JWT memberships + STT 14 | **HAS** (platform) | Scope ladder ALIGNED W2b |

### 3.2 Workforce (Employee / Contract / Assignment)

| Capability class | XeVN surface | Score | Evidence note |
|------------------|--------------|-------|---------------|
| Employee master CRUD | UC-21 / EM-01 | **PARTIAL** | Live; G-EM-01..04 field/catalog parity open |
| Employment status catalog | STT 21 | **PARTIAL** | Default internal status; weak catalog map (G-EM-04) |
| Work history / career timeline | EmployeeWorkHistory | **PARTIAL** | CRUD exists; **position free-text** breaks MD invariant |
| Contracts + insurance | CI-01/02 | **HAS** (slice) | FK to employee ALIGNED; contract type catalog depth thin |
| Assignment / effective-dated position hold | ERP core | **MISSING** | No first-class assignment object (position×employee×dates); labels on timeline ≠ assignment |
| Compensation package | orphan #5 FR-CI-PKG | **PARTIAL** | API leftover / G-DB-06; not Settings-driven package SoT |
| Headcount by company | CO-HC | **HAS** (contract) | Plane B slug COUNT — must_keep bridge |

### 3.3 Time (Attendance / Leave / Calendar)

| Capability class | XeVN surface | Score | Evidence note |
|------------------|--------------|-------|---------------|
| Attendance sheets + records | AT-14 / AT-01..03 | **HAS** | Sheets contract ALIGNED; must_keep AC |
| Attendance update requests | UC-09 | **HAS** | Lifecycle + fanout |
| Leave request + approve/reject | AT-10/12/13 | **PARTIAL** | Lifecycle HAS; balance/overlap PARTIAL; leave_type assert design exists |
| Leave types + entitlement rules | FR-SC-LEAVE-01 | **PARTIAL** | Settings key HAS; XBOS apply allow-list **excludes** leave_types (control-gap G1) |
| Shift / work calendar / holiday calendar | STT 31 | **PARTIAL** | Attendance catalog/shifts exist; holiday/calendar governance thin vs ERP Time Off |
| OT / trip / late / shift-change | orphan #6 | **PARTIAL** | APIs present; FR/catalog depth uneven |

### 3.4 Pay (Payroll / Components / Tax)

| Capability class | XeVN surface | Score | Evidence note |
|------------------|--------------|-------|---------------|
| Payroll periods create/close | PR-01/04 | **HAS** | ALIGNED |
| Process → payslips | PR-03/05 | **PARTIAL** | Read payslip HAS; process AC/FE bind residual G-PR-03 |
| Pay components / deductions catalog | FR-SC-PAY-01 | **PARTIAL** | Company CRUD; `component_type` often **HARDCODE** (picker inventory #27) |
| Formula / rule engine | ERP Comp | **MISSING** | No governed formula graph on catalog codes |
| Tax / statutory / bank master | ERP Pay | **MISSING** / thin | Outside current FR spine depth |
| Advance / loan | ADV | **PARTIAL** | Live tab; not Settings-governed product class |

### 3.5 Talent (Recruit / Performance / Learn / Succession)

| Capability class | XeVN surface | Score | Evidence note |
|------------------|--------------|-------|---------------|
| Job requisition | RC-01 | **PARTIAL** | Live; G-RC-02/03 residual; headcount VERIFY closed |
| Candidates + interviews (spine) | RC-03/05 | **HAS** (spine) | Dual catalog twin locked §17.6 — leftover risk |
| Recruitment stages / channels catalogs | STT 37–42 · SC-JT | **PARTIAL** | JD templates FR; channels on apply allow-list; posting position FREE_TEXT |
| Hire → employee INT | INT-01 | **PARTIAL** | Path exists; AC/WF residual |
| Performance cycles/evals | PF-01 | **PARTIAL** | Cycles ALIGNED; talent calibration/goal library thin |
| Learning / succession / career path | ERP Talent suite | **MISSING** | Explicit non-goal vs full SF/Workday; do not fake menus |
| Decisions / disciplinary types | UC-27 · SC-DEC | **PARTIAL** | REST live-empty OK; type picker + density open; position on form FREE_TEXT |

### 3.6 Settings governance

| Capability class | XeVN surface | Score | Evidence note |
|------------------|--------------|-------|---------------|
| Settings overview + sync | SC-01 · UC-06/08 | **HAS** | ALIGNED overview |
| MasterDataSettingsPanel CRUD | FR-SC-* | **HAS** (UI surface) | Admin picker PASS per BA inventory #32 |
| Extension request + WF approve | FR-SC-EXT · CAT-02/05 | **HAS** | F.1 path |
| Consumer picker bind (all domains) | AC-HRM-PICKER-01 | **PARTIAL / FAIL cluster** | Settings OK ≠ consumer OK (shared lesson) |
| Field-group presets (6 nhóm HS) | STT 15–20 · DM-02/12 | **PARTIAL** | CC groupHrCatalogApi parallel to L0 |
| Import catalog pre-check | DM-11 · IM | **PARTIAL** | Preview F.1; catalog gate residual |

### 3.7 Integration / XBOS control plane

| Capability class | XeVN surface | Score | Evidence note |
|------------------|--------------|-------|---------------|
| Publish catalog L0 | DM-09 · config-sync | **HAS** | OpenAPI + API_DESIGN |
| Apply library → members | DM-07 | **PARTIAL** | Allow-list `job_titles|recruitment_channels|job_grades` only |
| Pull XBOS → HRM | DM-10 | **HAS** | Settings/catalog-sync |
| Assign systems ∋ hrm | DM-08 | **HAS** | Publish DTO |
| Catalog audit history productized | DM-15 | **PARTIAL** | Table exists; product UX thin |
| Business-master positions vs L0 job_titles | UC-XBOS-MD-01 | **PARTIAL** | **Fork risk** — must_keep L0 for HRM picker |
| Workflow codes for HRM request types | STT 55–58 · DM-14 | **PARTIAL** | Leave/REC bridges; position_template luxury gap C-03 |
| RACI / KPI / CC presets | STT 64–72 | **PARTIAL** | CC capabilities; not full HRM MD control |
| Full DANH_MUC 72 as controlled SoT | §2–§12 | **MISSING** | Unified control claim false |
| Cross-module J-HRM-INT | INT-04 | **PARTIAL** | L2.5 ownership |

### 3.8 Scorecard rollup

| Domain | Overall |
|--------|---------|
| Org | **PARTIAL** |
| Workforce | **PARTIAL** |
| Time | **PARTIAL** (sheets HAS; leave/calendar PARTIAL) |
| Pay | **PARTIAL** |
| Talent | **PARTIAL** (recruit spine) / **MISSING** (learn/succession) |
| Settings governance | **PARTIAL** (CRUD HAS · bind PARTIAL) |
| Integration / XBOS control | **PARTIAL** |

---

## 4. PO answers — depth vs menus

### 4.1 «Đủ menu» ≠ «đủ chi tiết dữ liệu»

```text
Menu density (visible IA)
  ≈ HAS — employees, contracts, attendance, leave, payroll, recruitment,
         decisions, performance, settings, fleet, ops, admin, embed tabs

Data-model depth (ERP power)
  = PARTIAL — soft TEXT FKs, free-text SoT, narrow XBOS fan-out,
              thin grade/assignment/formula/calendar classes
```

**Implication:** Closing a single UI Input (Vị trí) is **symptom fix**, not ERP unlock. Unlock requires **cohort** of: control keys → Settings depth → consumer bind → BE assert → analytics keys.

### 4.2 Master data governance

| Layer | Adequacy |
|-------|----------|
| Ownership policy (XBOS SoT / HRM snapshot / extension) | **Adequate** (§18.1 · ADR S1) |
| Operational fan-out (apply-to-members breadth) | **Inadequate** for P0 leave/dept |
| Consumer enforcement (picker + persist code + assert) | **Inadequate** (inventory FAIL cluster) |
| Dual-surface discipline (BM vs L0) | **At risk** without G1 lock |

### 4.3 Settings vs transactional separation

| Design intent | Runtime truth |
|---------------|---------------|
| DANH_MUC §1 catalog vs §13 TX | Correct separation on paper |
| Settings panel + TX menus | Visually separated |
| Persist path | **Leaky** — TX forms invent labels; dept Select uses name; pay types hardcoded |

**Cleanliness score:** Design **YES** · Enforcement **NO** → overall **PARTIAL**.

### 4.4 Gaps blocking business leverage (ordered)

| # | Gap class | Why it blocks power | Severity |
|---|-----------|---------------------|----------|
| B1 | Settings→consumer orphan bind (multi-form) | Cannot trust reports/WF `position_template` / leave charts | **P0** |
| B2 | XBOS apply allow-list narrow | Members cannot inherit leave/dept via control plane | **P0** |
| B3 | Persist code + BE catalog assert incomplete | Soft TEXT allows dirty master forever | **P0** |
| B4 | No assignment / effective-dating object | Time & pay cannot key off «who holds position when» | **P1** (architecture) |
| B5 | Pay component / formula governance thin | Payroll is period UI, not policy-driven Comp | **P1** |
| B6 | BM vs L0 fork | Ops may publish wrong SoT | **P1** |
| B7 | Talent beyond recruit/PF thin | OK for Phase-1 scope if **explicit**; do not fake ERP Talent | **P2** / out-of-scope flag |
| B8 | DANH_MUC STT 15–54 pattern-only | Field defs / fleet / RC stages not unified L0 | **P1** breadth |

### 4.5 XBOS enough to control HRM?

**Verdict: PARTIAL** — extends prior control-gap without reopening Option A/B.

| Enough for… | Not enough for… |
|-------------|-----------------|
| Pattern: publish → apply → pull → effectiveItems → (intended) picker | Full DANH_MUC control claim |
| job_titles E2E control at API/design | leave_types / departments fan-out via same apply API |
| Extension WF governance | Guaranteeing every TX form binds codes |
| Holding library for titles | Preventing BM positions fork confusion |

**Recommendation remains Option C** (prior SA): keep spine; expand key-scope + F.1; resolve BM; then E-wave consumer cohorts — **not** rebuild XBOS catalog.

---

## 5. Decision options (program framing)

| Option | Summary | Trade-off | SA |
|--------|---------|-----------|-----|
| **A — Claim YES depth** | Menus + Settings panel = ERP ready | Over-claims; sponsor will rediscover free-text | **Reject** |
| **B — Rebuild HRM as SF clone** | Full assignment/grade/formula/talent | Blast R3; kills Phase-1; invents out-of-scope | **Reject** |
| **C — Cohort fidelity (recommended)** | Keep architecture; close B1–B3 first as waves by domain; defer B4/B7 as ADR scope | Matches U71 preserve; unlocks real power incrementally | **Accept** |
| **D — Position-only hotfix** | One WH Input → Select | Sponsor already rejected; leaves Decisions/REC/Contracts dirty | **Reject** |

**Recommended: Option C.**

---

## 6. Recommended wave cohorts (not single Position fix)

After `SYNTH-HRM-ERP-FIDELITY-01` + sponsor chốt (U74) — **docs G1 first**, then E-waves. Parallel BA/QA seats feed merge; SA locks boundaries.

### Cohort G1 — Spec / control plane (docs only)

| WI | Owner | Outcome |
|----|-------|---------|
| `BA-HRM-ERP-SRS-DELTA-COHORT-01` | ba-process | ADD AC: apply keys ⊇ leave_types+departments+job_titles; persist **code**; BM ≠ picker SoT; assignment **non-goal** or future FR explicit |
| `SA-HRM-ERP-TECHSPEC-KEYMAP-01` | sa | TechSpec key map DANH_MUC STT→canonical keys; BM fork must_keep; Settings vs TX enforcement matrix |
| `BA-HRM-ERP-DB-API-ALLOWLIST-01` | ba-data | Expand apply-to-members F.1 + OpenAPI cite; DEC/PAY keys cite depth |

### Cohort E1 — Consumer bind P0 (execution after G1)

| WI | Domain forms | Exit |
|----|--------------|------|
| `D-FE-HRM-MD-PICKER-COHORT-WH-01` | Work History position (+ dept code) | AC-HRM-PICKER-01 |
| `D-FE-HRM-MD-PICKER-COHORT-DEC-01` | Decisions position / signer |
| `D-FE-HRM-MD-PICKER-COHORT-REC-01` | JobPostings / HeadcountProposal / Candidate position+dept |
| `D-FE-HRM-MD-PICKER-COHORT-CI-01` | Contracts position |
| `D-BE-HRM-MD-ASSERT-COHORT-01` | Assert catalog code on mutate allowlist columns | Reject free-text SoT |

### Cohort E2 — Time & leave governance

| WI | Focus |
|----|-------|
| `D-*-HRM-LEAVE-TYPE-CONTROL-01` | XBOS apply leave_types + HRM entitlement bind |
| `D-*-HRM-SHIFT-CALENDAR-01` | Shift/holiday Settings depth (PARTIAL→HAS) |

### Cohort E3 — Pay components governance

| WI | Focus |
|----|-------|
| `D-*-HRM-PAY-COMPONENT-CATALOG-01` | Replace hardcoded componentTypes; FR-SC-PAY-01 bind |
| `QA-HRM-PAY-PROCESS-AC-01` | Close G-PR-03 process→payslip FE |

### Cohort E4 — Architecture add (optional sponsor)

| WI | Focus |
|----|-------|
| `SA-HRM-ASSIGNMENT-ADR-01` | Decide: introduce effective-dated assignment vs keep soft timeline (Option C vs defer) |
| Talent learn/succession | Explicit **out of Phase-1** unless sponsor opens |

### Cohort X — XBOS control completeness

| WI | Focus |
|----|-------|
| Prior package | `BA-HRM-MD-SRS-DELTA-01` · `SA-HRM-MD-TECHSPEC-01` · `BA-HRM-MD-DB-API-01` (still valid; **fold into** G1 ERP cohort, do not drop) |

**Anti-pattern:** one WI «fix all free-text» monolith — violates U69; use cohorts above.

---

## 7. Architecture diagram (target vs gap)

```text
                    ┌─────────────────────────────────────┐
   XBOS control     │ L0 config_catalogs (+ apply-to-members) │
   plane            │ keys: job_titles ✅ · leave/dept ❌ narrow │
                    └──────────────┬──────────────────────┘
                                   │ pull
                    ┌──────────────▼──────────────────────┐
   HRM Settings     │ L1 synced_catalogs + L2a extension     │
                    │ MasterDataSettingsPanel CRUD ✅         │
                    └──────────────┬──────────────────────┘
                                   │ effectiveItems
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
        Pickers ✅           Pickers ❌ FREE_TEXT    Hardcoded enum
        (some forms)         (WH/DEC/REC/CI)         (pay types)
              │                    │                    │
              └────────────┬───────┴────────────────────┘
                           ▼
                    TX tables (employees, leave_requests,
                    hr_decisions, contracts, …)
                    soft TEXT / weak assert  ← ERP power broken here
```

---

## 8. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Peer Claude contradicts scores | APPEND merge; SYNTH owns deltas; do not Dev until sponsor chốt |
| E1 without G1 | Re-introduce wrong keys / BM fork — **HOLD Dev** |
| Scope creep to full SF Talent | ADR non-goal list in G1 SRS delta |
| Claiming Phase1 from menu map | QC/PM: fidelity = bind+assert+J-* not HTTP 200 |
| Dual BM publish | TechSpec must_keep L0 `job_titles` = HRM picker SoT |

---

## 9. Validation / acceptance evidence plan (post-SYNTH)

| Gate | Pass when |
|------|-----------|
| G0 SYNTH | This evidence + BA domain CRUD + settings-consumer + QA spot + Claude seats merged |
| G1 | Spec AC for keys + picker persist code; API_DESIGN allow-list expanded (docs) |
| E1 | U65 browser: Settings item → each cohort form Select → save → F5 → code persisted; no free-text SoT |
| Control | apply-to-members leave_types+departments smoke (ops UI or API with QA FE path) |
| Never | Seed to «prove» catalogs; Phase1 DONE while B1–B3 open |

---

## 10. Handoff

### completion_report

**Closed:** G0 SA world-benchmark — ERP-class capability scorecard (Org/Workforce/Time/Pay/Talent/Settings/Integration); explicit **NO** on data-detail unlock; XBOS control remains **PARTIAL**; Option **C** cohort waves (G1→E1–E4/X); extends control-gap evidence; **no** `apps/**`; **no** Phase1 claim.

**Residual:** Peer Claude SA/BA/QA seats + SYNTH; assignment ADR optional; Talent suite MISSING by design until sponsor opens.

### next_owner

`pm` — APPEND merge + U74 SYNTH with Claude-PM; **HOLD** Dev/apps until sponsor chốt cohorts.

### next_dispatch_prompt

```text
work_item_id: SYNTH-HRM-ERP-FIDELITY-01
from_role: pm
to_role: pm (Cursor lead) + peer Claude-PM
lane: governance G0→G1 — docs only; NO apps/**; NO Phase1 claim
entry_criteria:
  - SA-HRM-ERP-WORLD-BENCHMARK-01 PASS_TO_PM · docs/qa/evidence/sa-hrm-erp-world-benchmark-01-20260728.md
  - SA-XBOS-HRM-CONTROL-GAP-01 PARTIAL retained
  - Collect Cursor BA-HRM-ERP-DOMAIN-CRUD-01 · BA-HRM-ERP-SETTINGS-CONSUMER-01 · QA-HRM-ERP-FIDELITY-SPOT-01 + Claude G0 seats into docs/program/HRM_ERP_FIDELITY_KNOWLEDGE_MERGE.md
exit_criteria:
  1. Sponsor-facing synthesis: scorecard rollup + YES/PARTIAL/NO answers locked
  2. Ordered backlog = Cohort G1 then E1–E3 (reject Position-only)
  3. U74: Claude-PM góp ý entry before member DISPATCH
  4. evidence: docs/program/HRM_ERP_FIDELITY_KNOWLEDGE_MERGE.md APPEND + optional docs/program/HRM_ERP_FIDELITY_SYNTH.md
  5. cấm apps/** · cấm Phase1/PROD · cấm claim XBOS YES control
```

### evidence_path

`docs/qa/evidence/sa-hrm-erp-world-benchmark-01-20260728.md`

### ack_status

**PASS_TO_PM**
