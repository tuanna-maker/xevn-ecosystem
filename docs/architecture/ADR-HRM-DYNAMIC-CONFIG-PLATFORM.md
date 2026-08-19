# ADR: HRM Dynamic Config Platform (MISA/Base-class metadata)

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-HRM-DYNAMIC-CONFIG-PLATFORM |
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SA-01` |
| **Status** | **CONFIRMED** — sponsor chat 2026-08-07 (MISA/Base · dynamic clauses/structure · whole HR) = Option **B** · BA matrix peer PASS |
| **Date** | 2026-08-07 |
| **Decision owner** | SA |
| **Program** | [`PO_HRM_DYNAMIC_CONFIG_PLATFORM_01.md`](../program/PO_HRM_DYNAMIC_CONFIG_PLATFORM_01.md) |
| **Related** | [`ADR-METADATA-APPLY-CONSUMERS-DELTA-20260620.md`](./ADR-METADATA-APPLY-CONSUMERS-DELTA-20260620.md) · [`ADR-HRM-CONTRACT-LIBRARY-GROUP-PUBLISH-20260807.md`](./ADR-HRM-CONTRACT-LIBRARY-GROUP-PUBLISH-20260807.md) · [`ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`](./ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md) · [`ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md`](./ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) · JD Option A [`PO-HRM-JD-DYNAMIC-ARCH-01.md`](../program/specs/PO-HRM-JD-DYNAMIC-ARCH-01.md) · Contract print-spine TechSpec · [`XEVN-TPL-DYNAMIC-LOCK.md`](../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md) |
| **Honesty** | No module UAT flip · `contracts_printable_ready=false` · no Phase1 DONE · U65 |
| **Evidence** | `docs/qa/evidence/po-hrm-dynamic-config-platform-sa-01.md` |

---

## 1. Decision context

- **Title:** XeVN metadata platform — catalog + form schema + merge tokens across HR domains.
- **Requestor:** PM / sponsor (research MISA AMIS + Base principles; clauses + HĐ template structure must be dynamic).
- **Related requirements:** CORE-09/09a/b/c print-spine · XEVN-TPL CORR (open catalog) · REC-00 JD dynamic · EMP settings-catalogs · ATT CFG · PAY components · XBOS catalog governance.
- **Public principle anchors (no paywall scrape / no product copy):**
  - **MISA:** document templates per subsystem · merge `#field#` · list expands when custom fields added · HR authors templates (not fixed law text in code).
  - **Base:** contract classification CRUD · DOCX `${vars}` · per-type custom fields.
- **Failure if unresolved:** Closed enums / FE hardcode clause bodies recur; each module invents a private “settings” shape; print-spine and JD/payroll drift; sponsor correction (8 X.E = starter only) gets re-broken by CHECK IN (8).

---

## 2. Problem to solve

### 2.1 Current state (facts from repo)

| Domain | Config pattern today | Gap vs sponsor |
|--------|----------------------|----------------|
| **Contracts** | `hrm_contract_templates` + `hrm_contract_clauses` + `layout_json` + `keyword_map` + pack_rules + print_versions; Settings DnD; holding publish/pull (ADR library) | XEVN-TPL once shipped **closed 8-code enum** → **CORR/DYNAMIC-LOCK** supersedes; still need **platform** so packs/clauses/tokens stay open catalogs |
| **Recruitment JD** | `rec_jd_*` field defs + layout snapshot (Option A form builder) | Parallel metadata stack — not yet shared FormSchema/MergeToken registry |
| **Employees** | XBOS Group HR → HRM `settings-catalogs` extension-items; ADR metadata apply consumers | Custom fields exist; **no auto-register merge tokens** for print/DOCX |
| **Attendance** | `work_shifts` ops SoT · `attendance_rules` UPSERT · XBOS `shifts` REF · leave types via catalogs | Codes/maps partial; not one platform contract |
| **Payroll** | Salary components / pay types dual SoT (hire-to-pay spine) | Components should be catalog rows, not FE enums |
| **Catalogs / Settings** | XBOS publish → HRM pull≠apply; settings-catalogs master keys | Group REF catalogs OK; **legal HĐ bodies stay in-HRM** (not XBOS synced_catalogs) per library ADR |
| **Cross-cutting** | Three CC metadata pipelines (infra / group_hr / legal static) — ADR-METADATA | Producer→consumer registry exists for CC; **HRM domain FormSchema+MergeToken not unified** |

### 2.2 Constraints (must_keep)

| Invariant | Rule |
|-----------|------|
| Multi-tenant scope | Same resolver list ↔ get-by-id ↔ mutate (`resolveHrmListScope` / settings-catalog holding map); main↔holding per ADR scope |
| Soft-delete | No hard-delete of catalog/template/clause rows |
| UF-HRM-02 | `employee_contracts` registry CRUD remains; printable spine is additive |
| Print-spine GWC | Template + clause DnD + preview + version freeze + PDF path must_keep; Q-CTR-01/02 CLOSED |
| XBOS catalog governance | Job titles / org REF via publish-pull; **legal clause bodies ≠ XBOS L0 catalog** |
| U65 | FE CRUD evidence; zero-seed for UF |
| Dynamic lock | Starter X.E / XEVN_* rows ≠ closed enum; HR CRUD 9+ without code release |

### 2.3 Non-goals (this ADR)

- Claim any `*_uat_ready` / Phase1 DONE.
- Ship `apps/**` in this seat.
- Invent closed enums for packs, template codes, leave codes, salary component codes.
- Replace print PDF engine or reopen Q-CTR.
- Make DOCX Word round-trip the only authoring path in GĐ1.

---

## 3. Options

### Option A — Extend current clause + template tables only

- **Description:** Keep deepening `hrm_contract_*` (+ maybe pack_rules). No shared FormSchema / MergeToken across EMP/REC/ATT/PAY. Each module continues its own settings tables.
- **Benefits:** Fastest for HĐ vertical; lowest blast radius; aligns with print-spine already live.
- **Costs:** Recurring reinvent (JD already separate; PAY/ATT will fork again); merge fields diverge from employee custom fields; MISA “custom field → merge list updates” never systemic.
- **Risks:** Sponsor “toàn HR” unmet; CORR open-catalog survives only on contracts while other modules stay hardcoded.

### Option B — Unified FormSchema + Catalog + MergeToken registry (cross-module) — **RECOMMEND**

- **Description:** One **platform contract** (logical) with three registries, specialized physical tables/UIs per domain:

  1. **Catalog** — open rows (codes, labels, status, scope): contract types/templates, packs, leave types, payroll components, recruitment stages, attendance code maps, settings master keys.
  2. **FormSchema** — field defs + layout_json / DnD (reuse JD `rec_jd_*` + Group HR extension pattern + contract clause canvas as schema consumers).
  3. **MergeToken** — SoT map `token_key` → resolver path (employee.*, contract.*, ou.*, license.*, cb.*, custom extension.*) for preview/PDF/DOCX/email; registering a Settings field **registers or refreshes** a token (MISA principle).

  Authoring for HĐ GĐ1: **clause-DnD-first** (current XeVN + MISA hybrid) — body_vi + legal_basis as data; DOCX upload = **optional GĐ2 channel** that compiles into same clause/layout + token graph (not a second SoT).

- **Benefits:** One mental model for NS·TD·lương·công·bảng lương·HĐ·danh mục·Settings; auto merge-list growth; prevents closed enums; preserves print-spine and JD Option A as first verticals of the same platform.
- **Costs:** Platform TechSpec + shared BE package/helpers; migration of token registry; BA matrix per domain; longer calendar than A.
- **Risks:** Over-abstraction — mitigate with **narrow shared interfaces** + domain tables (not one mega-EAV); phased rollout HĐ → JD → EMP custom → ATT/PAY catalogs.

### Option C — DOCX-upload-first (Base-like) as primary authoring

- **Description:** HR uploads DOCX with `${vars}` / `#fields#`; system extracts variables; per-type custom fields; classification CRUD. Clause DnD demoted or abandoned.
- **Benefits:** Familiar for legal teams who live in Word; matches Base public help model.
- **Costs / Risks:** Reworks print-spine GWC (clause canvas + layout_json + pack resolve); binary DOCX versioning + malware/scan ops; harder multi-tenant soft-delete of “partial clause”; conflicts with FE DnD already QC’d. **Reject as GĐ1 primary.** May return as **secondary import** under Option B in GĐ2.

---

## 4. Trade-off matrix

| Criteria | Weight | A | B | C |
|----------|-------:|:-:|:-:|:-:|
| Business value (toàn HR + dynamic HĐ) | 5 | 2 | 5 | 3 |
| Time to deliver (first vertical) | 4 | 5 | 3 | 2 |
| Complexity | 4 | 5 | 3 | 2 |
| Security / scope_parity | 5 | 4 | 5 | 3 |
| Reliability (version freeze / soft-delete) | 5 | 4 | 5 | 2 |
| Maintainability (anti-enum / anti-hardcode) | 5 | 2 | 5 | 3 |
| Preserve print-spine GWC | 5 | 5 | 5 | 1 |
| Align MISA+Base principles | 4 | 2 | 5 | 4 |

**Selected: Option B** (platform) with **clause-DnD-first authoring** (not Option C).

---

## 5. Failure modes and mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Module forks + FE hardcode returns | Grep enums / QA UF fail on 9th template | Supersede with B; CORR tests for open catalog |
| B | Mega-EAV / one table for all domains | Schema review / TM gate | Domain physical tables + shared **interfaces** only (`ICatalogRow`, `IFormSchema`, `IMergeToken`) |
| B | Token registry drifts from employee fields | Merge preview missing `#custom#` | Register hook on extension-item create/update |
| B | XBOS absorbs legal bodies | Catalog-sync keys for clauses | Keep ADR library: legal packs in-HRM publish/pull |
| C | Wipe DnD GWC | QC regression | Forbid C as primary; optional DOCX import later |

---

## 6. Decision (locked for BA/Tech cascade)

### 6.1 Selected option

**Option B — Unified metadata platform (Catalog + FormSchema + MergeToken), specialized UIs per domain, clause-DnD-first for contracts.**

### 6.2 Why

1. Sponsor asks for **platform principles across HR**, not only HĐ tables (charter § target principles 1–4).
2. Repo already has **partial instances** of B (JD FormSchema, settings-catalogs, contract keyword_map, metadata apply ADR) — unify **contracts**, don’t invent a fourth pattern.
3. Option A fails “toàn HR”; Option C fails must_keep print-spine GWC and soft-delete/version discipline.

### 6.3 Explicit locks

| Lock | Statement |
|------|-----------|
| **L1 Catalog open** | Templates, packs, clauses, types = **data rows**. Starter X.E / 8 `XEVN_*` = **bootstrap examples only** — **not** closed enum (DYNAMIC-LOCK / CORR). |
| **L2 Clause & structure = data** | Ordered clause graph / `layout_json` / `body_vi` / `legal_basis` persisted; FE must not hardcode law paragraphs. |
| **L3 MergeToken SoT** | Print/preview/DOCX resolve only via registry; custom field add → token list refresh (MISA). |
| **L4 Authoring GĐ1** | Clause-DnD + Settings CRUD (XeVN+MISA hybrid). DOCX-upload = GĐ2 optional compiler into L2/L3. |
| **L5 Domain ownership** | Legal HĐ library = in-HRM (+ holding publish ADR). XBOS = REF catalogs (titles, shifts REF, org). |
| **L6 Scope** | All three registries honor tenant/OU scope_parity + soft-delete. |
| **L7 Honesty** | Platform ADR ≠ UAT flip. |

### 6.4 Rejected

- **A:** Insufficient for cross-module sponsor ask; technical debt multiplier.
- **C as primary:** Breaks print-spine GWC; ops/security cost of binary SoT.

### 6.5 Assumptions

- BA-01 delivers capability matrix + AC per domain without inventing code enums.
- Contract lane remains **first vertical** of the platform (CORR already in flight).
- Shared Nest helpers land under `apps/api/hrm-api` (or `packages/`) only after TechSpec→DB→API — not this seat.

---

## 7. Platform → domain map

```text
                    ┌─────────────────────────────────────┐
                    │  Metadata Platform (logical)        │
                    │  Catalog · FormSchema · MergeToken  │
                    └──────────────┬──────────────────────┘
           ┌───────────┬───────────┼───────────┬───────────┐
           ▼           ▼           ▼           ▼           ▼
        Settings    Employees   Recruitment  Attendance  Payroll
        (producer)  (consumer)  (JD builder) (codes/CFG) (components)
           │
           └── Contracts (first vertical: TPL/CL/pack + print merge)
```

| Module | Catalog | FormSchema | MergeToken | Notes |
|--------|---------|------------|------------|-------|
| **Settings** | Master keys, packs, stages, types | Builder UIs | Token admin / preview list | Producer; U65 CRUD |
| **Employees / NS** | Extension catalogs via settings-catalogs | Profile tabs dynamic fields | `employee.*` + custom → print/HĐ | ADR-METADATA apply parity |
| **Recruitment / TD** | Stages, JD field catalog | `rec_jd_*` layout DnD | JD tokens optional; YCTD bind must_keep | ARCH-01 Option A = platform instance |
| **Attendance / bảng công** | Leave types, attendance codes, shift REF | Sheet column maps (future) | Sheet/export tokens GĐ1.5 | Ops SoT `work_shifts` / rules ADR ATT — catalog ≠ dual master |
| **Payroll / bảng lương** | Salary components, pay types | Enroll/process forms bound to catalog | Payslip print tokens GĐ1.5 | FE must not compute net (OS 28) |
| **Contracts / HĐ** | Open templates + packs + clauses | Clause canvas + layout_json | `keyword_map` + MergeToken registry | First vertical; UF-02 registry; print-spine GWC |
| **Catalogs (XBOS)** | Group REF publish/pull | N/A for legal body | N/A | Titles/org; **not** clause library |

---

## 8. Implementation and validation plan

### 8.1 Rollout waves

| Wave | Owner | Exit |
|------|-------|------|
| **SA-01** (this) | sa | ADR Accepted recommend + evidence |
| **BA-01** | ba-process | Capability map + AC (no closed enums) |
| **DOCS** | ba-docs | SRS FR platform pointer + HĐ CORR already merged |
| **TECH** | sa | Platform TechSpec: interfaces + first vertical F.1 deepen (HĐ tokens) |
| **DATA** | ba-data | Physical: `hrm_merge_tokens` (or equiv) + open TPL CORR schema; no CHK IN (8) |
| **Vertical HĐ** | BE/FE/QA | Open catalog 9th template U65 + merge token smoke; printable flag stays false until QC |
| **Roll** | PM | JD align → EMP token hook → ATT/PAY catalogs |

### 8.2 Rollback

- Platform tables additive; domain features feature-flagged.
- Contract print-spine remains operable on existing TPL/CL if token registry empty (fallback `keyword_map` only).

### 8.3 Validation checkpoints

| Gate | PASS when |
|------|-----------|
| V1 Architecture | ADR B + L1–L7 cited in BA/Tech packets |
| V2 Contract open catalog | Create template code #9 via FE → picker lists it → preview binds (U65); **no** API enum reject |
| V3 Merge list | Add employee custom field → token appears on HĐ preview field list (or documented backlog AC date) |
| V4 Scope | Holding publish/pull still lineage; member merge local-only |
| V5 Regression | UF-HRM-02 CRUD; print-spine GWC paths; soft-delete; no XBOS legal-body sync |
| V6 Honesty | No `contracts_printable_ready=true` / Phase1 from this research alone |

### 8.4 Success criteria (program research)

- Sponsor CONFIRM Option B + L1–L7.
- BA matrix signed for EMP·REC·ATT·PAY·CTR·CAT·SET.
- TechSpec platform + HĐ vertical unlocks Dev only after DB+API F.1.

---

## 9. BA / Dev coaching notes

- **BA:** Prefer “starter rows” language; forbid AC that asserts exactly N codes forever.
- **Dev-BE:** Shared validators for slug/code/format; pack ∈ **configured catalog**, not hardcoded union type of 3 forever (starter packs OK as seed data, not TypeScript enum ceiling).
- **Dev-FE:** Picker = API list; no hardcode 8 XEVN cards.
- **QA:** Matrix row for “9th template”; producer→consumer after custom field (metadata apply class).
- **QC:** Slice GWC ≠ module UAT; platform research ≠ readiness flip.

---

## 10. Next dispatch

**Primary:** `ba-data` — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01` physicalize MergeToken + CTR open-catalog constraints (no CHK IN 8).  
**Parallel:** `ba-docs` FR-PLT / FR-09d DOC-DELTA (ADD-only · printable false).  
**TechSpec:** [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md`](../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md) · evidence `docs/qa/evidence/po-hrm-dynamic-config-platform-tech-01.md`.

Copy-ready prompt: see TECH evidence `next_dispatch_prompt`.
