# PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01 — Option/F.1 · contract clause **body-as-data** SoT (`hrm_contract_clauses`)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01` |
| **Parent** | leave-balance QC **GWC** (`ATTLVRULEQA-MSK6G783`) · U88 continuous **next vertical** |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 narrow — LOCK **AC-PLT-CTR-02** clause body SoT · **RETAIN** LIVE `hrm_contract_clauses` + print-spine · **NO CODE** `apps/**` · **no seed** · **no wipe** · **no reopen** ATT L1 |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **B** **LOCKED (RETAIN + narrow clarify)** · ba-process **UNLOCK** · ba-data **HOLD** (conditional) · BE/FE **HOLD** |
| **prior_seals** | leave-balance admin L1 `ATTLVRULEQA-MSK6G783` · ATT-SHIFT `CNS-02 CLOSED` · ATT-CODE `ATTCODEQA-MSK4T1A5` · ATT-WS · EMP · SI · PAY · DEC · MergeToken **EXT** — **SEAL RETAIN** |
| **ref_ba_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.5 (CTR) · §3.3 clause library · **AC-PLT-CTR-02** · **BR-CTR-CL-01..04** · **BR-PLT-02/03/04** |
| **ref_lock** | [`PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md) · CORR-01 open catalog |
| **ref_peer_retain** | leave-balance `ATT-LEAVE-BALANCE-SA-01` Option B (Nest DEFINE) — **cite class-difference:** here Nest **PRESENT** → **RETAIN**, not DEFINE |
| **ref_peer_engine_hold** | PAY-CATALOG Option B — catalog SoT **≠** engine LIVE — **cite** printable HOLD pattern |
| **ref_code** | `apps/api/hrm-api/src/contracts-insurance/contract-legal-print.service.ts` · `.constants.ts` · `migrations/20260806_contract_legal_print.sql` · `20260807_contract_library_publish.sql` |
| **Honesty** | `contracts_printable_ready=false` · `payroll_e2e_ready=false` · **DENIED** module CTR UAT / Phase1 · **`C-SLICE-≠-MODULE`** · U65 zero-seed |
| **must_keep** | `hrm_contract_print_versions` immutable snapshot · `clauses_snapshot_json` freeze-on-issue · `updateClause` version-bump guard · UF-HRM-02 nullable template · library publish/pull DATA-02 · leave-balance CNS-WIRE/FE 01g Conditions · ATT L1 seals |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option evaluation)

| | |
|--|--|
| **Decision title** | AC-PLT-CTR-02 — SoT & lifecycle for contract **clause body-as-data** (`body_vi` + versioned units + freeze-on-issue) |
| **Requestor** | pm · U88 after leave-balance QC GWC · BA-01 §3.3 clause library |
| **Decision owner** | sa |
| **Related** | FR-UC-BP-CORE-09 / 09a–09d · BR-CTR-CL-01..04 · BR-PLT-02/03/04 · AC-PLT-CTR-02 (≡ clause edit body/version) · Q-PLT-01 merge syntax |

### 1.1 Problem — AS-IS vs target

| Current state (AS-IS evidence from code) | Gap / target |
|------------------------------------------|--------------|
| Nest **`hrm_contract_clauses`** LIVE (`20260806_contract_legal_print.sql`): `code · title_vi · body_vi TEXT NOT NULL · clause_group · apply_to_packs text[] · sort_order · mandatory · status · version INT DEFAULT 1 · effective_from · archived_at` | Clause **body already data** in Nest — **not** FE/Settings. Target = **LOCK** this as authoritative SoT; kill any migration to Settings/XBOS as body SoT |
| `ContractLegalPrintService.createClause / updateClause / getClauseById / listClauses / activateClause` LIVE + UQ `(company_id, lower(code)) WHERE active` | CRUD present; needs **BA AC wording** for U65 FE flow (edit `body_vi` → 2xx → F5) — not new SoT |
| `updateClause` **soft-block**: active clause with issued snapshot + `body_vi` change → `HRM-CTR-CL-CODE-CONFLICT` "requires POST …/activate (version bump)" | **version++ semantics already enforced** — RETAIN; BA locks the exact FE happy-path (draft edit in place vs issued → activate/version bump) |
| `hrm_contract_print_versions.clauses_snapshot_json` freeze-on-issue LIVE; `clauseHasIssuedSnapshot()` scans snapshot | **must_keep** — old contracts keep old body via snapshot; no separate clause-body history table required for correctness |
| Merge tokens use **`{{token}}`** syntax (`defaultXevnKeywordMap` · `keyword_map` per template) | Q-PLT-01 → CTR de-facto **`{{x}}`** LOCKED; **cấm** dual syntax in one template (merge token registry EXT already sealed) |
| BA-01 **BR-CTR-CL-03:** FE **cấm** hardcode body luật dài | Anti-pattern is **FE hardcode legal body**, not a runtime free-text API path — clause body always resolved from table row / snapshot |
| Library publish/pull (`hrm_contract_library_publishes` + lineage `origin/lineage_code`) LIVE | Group→member clause propagation versioned — **RETAIN**; not reinvented here |

**Failure if unresolved:** someone (a) migrates clause body into Settings MD / XBOS catalog as a *second* SoT (dual-write, breaks freeze); (b) lets FE hardcode legal body text; (c) rewrites the print-version snapshot to "prove" edit; (d) flips `contracts_printable_ready`; (e) opens a redundant `hrm_contract_clause_versions` mega-history table when snapshot already preserves issued bodies; (f) reopens leave-balance / ATT L1 seals.

### 1.2 Constraints

- Docs-only this seat · **no** `apps/**` · **no** seed (U65) · **no** paste full copyright HĐ body into docs/seed.
- **DENY** `contracts_printable_ready=true` · `payroll_e2e_ready=true` · module CTR UAT · Phase1 DONE.
- **SEAL RETAIN:** leave-balance L1 (`ATTLVRULEQA-MSK6G783`) · ATT-SHIFT CNS-02 CLOSED · ATT-CODE · ATT-WS · EMP · SI · PAY · DEC · MergeToken EXT · CTR print-spine GWC slice.
- **RETAIN as named Conditions (do not reopen / do not invent new):** leave-balance CNS-WIRE / FE-01g.
- Cite `/api/hrm/contracts/legal-print/*` clause endpoints — **cấm** invent `/api/hrm/platform/ctr/*` mega catalog / **mega-EAV** (Q-PLT-03 DENY).
- **OUT:** DOCX GĐ2 · ATT reopen · flip `contracts_printable_ready` · DnD layout reorder (AC-PLT-CTR-03 — separate seat).

### 1.3 Decision heuristic (program rule — applied)

| Rule | Application this seat |
|------|------------------------|
| Prefer **A Settings** if producer LIVE in Settings | Body producer is **Nest** (not Settings) → **A REJECT** as body SoT |
| Prefer **B Nest** if producer Nest-LIVE **or** absent | Body producer **Nest-PRESENT & LIVE** → **B = RETAIN + narrow clarify** (≠ leave-balance DEFINE) |
| REJECT hybrid dual writers / FE hardcode body / snapshot rewrite / reopen seals / flip ready | Explicit **Option C** reject |
| Catalog/body existing ≠ redundant history table | ba-data **HOLD** default; conditional UNLOCK only if BA proves admin-visible prior-body requirement snapshot can't satisfy |

---

## 2. Options

### Option A — Settings / XBOS clause catalog = clause body SoT

| | |
|--|--|
| **Description** | Move clause `body_vi` into Settings Master-Data (or XBOS group catalog) as authoritative body store; Nest `hrm_contract_clauses` becomes a mirror/consumer that pulls text. |
| **Benefits** | Central group catalog UX; reuse XBOS publish primitives. |
| **Costs** | Contradicts LIVE Nest body SoT + freeze-on-issue chain; creates **dual writers** (Settings + Nest snapshot); breaks `updateClause` version-bump guard; XBOS is **not** the print-spine owner; group→member already handled by `hrm_contract_library_publishes` (Nest-side) — moving body upstream duplicates it. |
| **Risks** | AC green in Settings while print resolves stale/duplicate body; snapshot parity lost — **REJECT** as body SoT. Settings/group `leave_types`-class **REF** relationship is fine for *merge/label*, not for legal body ownership. |

### Option B — Nest `hrm_contract_clauses` = body SoT · **RETAIN LIVE + narrow lock** · version-bump on issued edit · snapshot freeze — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | **RETAIN** the LIVE Nest clause library as the single body-as-data SoT. `body_vi` is stored per clause row (`hrm_contract_clauses`), edited by HCNS/Settings admin via `updateClause`. **Draft / active-not-issued** clause → edit `body_vi` **in place** (`version` unchanged or optional monotonic bump), 2xx, F5 shows new body, draft preview uses new body. **Active clause already referenced by an issued print version** → body change is **soft-blocked** (`HRM-CTR-CL-CODE-CONFLICT`) and must go through the **activate / version-bump** path — old issued contracts keep their frozen body via `hrm_contract_print_versions.clauses_snapshot_json` (**BR-CTR-CL-01** · **BR-PLT-03**). Tokens inside `body_vi` use **`{{token}}`** convention (Q-PLT-01 LOCK for CTR, consistent with `keyword_map` / `defaultXevnKeywordMap`). Group→member propagation stays on the **LIVE library publish/pull** (`hrm_contract_library_publishes` + `origin/lineage_code`), not a new SoT. FE **cấm** hardcode legal body (**BR-CTR-CL-03**) — always resolve from clause row / snapshot. **No new physical table required** for correctness; ba-data **HOLD** unless BA proves an admin-visible prior-body-history need that snapshot cannot serve. |
| **Benefits** | Aligns BA-01 §3.3 · DYNAMIC-LOCK · already-passing print-spine slice; zero dual SoT; version + freeze semantics **already implemented** → narrow BA/FE surface only; group publish RETAIN. |
| **Costs** | ba-process AC pack + later FE happy-path wiring/QA; must document draft-in-place vs issued-version-bump split clearly to avoid consumer confusion. |
| **Risks** | Misread as "reopen print-spine / add mega history table / flip printable" → **L-CTR-CL-*** mitigations below. |

### Option C — Hybrid dual writers / FE hardcode body / snapshot rewrite / mega clause-version-EAV / reopen seals / flip `contracts_printable_ready`

| | |
|--|--|
| **Description** | Settings **and** Nest both own body; or FE hardcodes long legal paragraphs; or edit rewrites issued snapshot; or add a mega `hrm_clause_body_versions` EAV; or reopen leave-balance/ATT L1; or flip `contracts_printable_ready=true` from this seat. |
| **Benefits** | None for GĐ1 honesty. |
| **Costs** | Dual SoT · snapshot corruption · legal-print regression · seal churn. |
| **Risks** | **REJECT** — DENY dual writers · DENY FE hardcode body · DENY snapshot rewrite · DENY mega-EAV (Q-PLT-03) · DENY reopen seals · DENY printable flip. |

---

## 3. Trade-off matrix

| Criteria | Weight | A Settings/XBOS body | **B Nest RETAIN + lock** | C Hybrid / hardcode / flip |
|----------|-------:|---------------------:|-------------------------:|---------------------------:|
| Business value (FR-CORE-09 · BA-01 §3.3) | 5 | 2 | **5** | 0 |
| Honesty / seal safety (print-spine · snapshot) | 5 | 2 | **5** | 0 |
| Single body SoT vs dual-write | 5 | 0 | **5** | 0 |
| Time to deliver (RETAIN vs migrate) | 4 | 1 | **5** | 1 |
| Complexity | 4 | 2 | **4** | 0 |
| Maintainability (freeze/version already live · peer) | 4 | 1 | **5** | 1 |
| **Weighted** | | 42 | **120** | 12 |

---

## 4. Decision

| | |
|--|--|
| **Selected** | **Option B** — architecture **LOCKED (RETAIN + narrow clarify)** |
| **Seat verdict** | **CONFIRMED** |
| **Why B** | Clause body is **already** Nest data (`hrm_contract_clauses.body_vi`) with **version-bump-on-issued-edit** and **snapshot-freeze** already implemented; moving to Settings/XBOS = dual SoT + regression; print-spine GWC slice must not churn. This seat **locks** the existing model as authoritative and hands BA a **narrow AC/FE** wording task — not a physicalize. |
| **Rejected** | **A** Settings/XBOS body SoT · **C** hybrid / FE hardcode / snapshot rewrite / mega-EAV / reopen seals / printable flip |
| **Assumptions** | `hrm_contract_print_versions.clauses_snapshot_json` preserves issued bodies (verified in `clauseHasIssuedSnapshot`); `{{x}}` token convention consistent with `keyword_map`; group publish stays Nest-side library. |

### 4.1 Physical / DATA / BA / BE gates

| Question | Answer |
|----------|--------|
| New ba-data physicalize? | **HOLD (default NO)** — `hrm_contract_clauses` + `version` + snapshot **already exist**; no new table needed for correctness. **Conditional UNLOCK** only if ba-process proves an **admin-visible prior-body history** requirement that the print snapshot cannot serve → then narrow ADD `hrm_contract_clause_versions` (append-only, soft FK to clause) — **FORBIDDEN** mega-EAV / second body SoT / rewrite existing table. |
| Unlock ba-process? | **YES** — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01` AC pack (**AC-PLT-CTR-CL-01***) |
| Unlock BE? | **HOLD** — RETAIN LIVE; unlock only for narrow FE-wiring gaps ba-process/QA identify after AC (no schema change unless conditional ba-data fires) |
| Unlock FE admin/consumer? | After BA AC — surfaces existing endpoints; **FORBIDDEN** invent leave-balance/ATT FE HOLDs |
| DnD layout reorder (`clause_ids`)? | **OUT** — **cite peer** AC-PLT-CTR-03 (separate seat); `template_clauses` DnD already LIVE (`replaceTemplateClauses`) |
| Flip `contracts_printable_ready` / module CTR UAT? | **FORBIDDEN** from this seat |
| Reopen leave-balance / ATT L1? | **FORBIDDEN** |

### 4.2 Layer map (SoT vs REF vs OUT)

| Layer | Artifact | Role this seat |
|-------|----------|----------------|
| **Clause body (OWN · RETAIN)** | Nest `hrm_contract_clauses.body_vi` + `version` | **Body SoT** — versioned; edited by admin |
| **Freeze (must_keep)** | `hrm_contract_print_versions.clauses_snapshot_json` | Issued body immutable — **not rewritten** |
| **Layout/order (RETAIN · separate)** | `hrm_contract_template_clauses` (DnD) | RETAIN — reorder is AC-PLT-CTR-03 seat |
| **Group propagation (RETAIN)** | `hrm_contract_library_publishes` + `origin/lineage_code` | Versioned publish/pull — not new SoT |
| **REF** | Settings/XBOS group catalog | Label/merge REF only — **≠** body SoT |
| **Merge (RETAIN · EXT sealed)** | `keyword_map` · `{{token}}` | Token registry — syntax `{{x}}` locked |
| **OUT** | DOCX GĐ2 · DnD reorder · ATT reopen · printable flip · mega body-EAV | Explicit §8 |

---

## 5. Locks (L-CTR-CL-*)

| Lock | Rule |
|------|------|
| **L-CTR-CL-01 Body SoT** | Authoritative clause body = Nest `hrm_contract_clauses.body_vi` — **FORBIDDEN** Settings MD / XBOS group catalog / FE constant as sole or dual body SoT |
| **L-CTR-CL-02 Admin edit ≠ consumer invent** | HCNS/Settings **admin** may CRUD/edit `body_vi` (open, N+1 clauses). **Consumers** (print/preview/issue, FE render) **resolve** body from clause row / snapshot — **never** inject free-text/hardcoded legal body (**BR-CTR-CL-03**). FE hardcode = QA/lint FAIL (not a wire code) |
| **L-CTR-CL-03 Version bump on issued edit** | Active clause already in an issued print version → `body_vi` change requires **activate / version-bump** path; RETAIN existing soft-block `HRM-CTR-CL-CODE-CONFLICT` (**BR-CTR-CL-01**). Draft / not-issued → edit in place allowed |
| **L-CTR-CL-04 Freeze immutable** | `hrm_contract_print_versions.clauses_snapshot_json` frozen at issue — **FORBIDDEN** rewrite to reflect later body edits; old contracts keep old body (**BR-PLT-03**) |
| **L-CTR-CL-05 Token syntax** | Body/keyword tokens = **`{{token}}`** (Q-PLT-01 LOCK for CTR); **cấm** dual syntax (`#x#`) in same template — consistent with `keyword_map` / MergeToken EXT seal |
| **L-CTR-CL-06 Soft-delete / retire** | Clause retire = soft-delete (`archived_at` / `status`) — history + FK + snapshot intact; **FORBIDDEN** hard-delete when referenced (**BR-PLT-04**) |
| **L-CTR-CL-07 Group propagation RETAIN** | Group→member clause changes via LIVE `hrm_contract_library_publishes` versioned payload — **FORBIDDEN** invent new upstream body SoT |
| **L-CTR-CL-08 Scope parity** | list ↔ get-by-id ↔ resolve ↔ preview same scope resolver (U19) |
| **L-CTR-CL-09 No physicalize by default** | ba-data **HOLD**; conditional narrow ADD `hrm_contract_clause_versions` **only** if BA proves admin prior-body-history gap — **FORBIDDEN** mega-EAV / second body table / rewrite existing |
| **L-CTR-CL-10 Seals / honesty** | **FORBIDDEN** reopen leave-balance / ATT L1 · invent FE HOLDs · DnD reorder here · DOCX GĐ2 · flip `contracts_printable_ready` / `payroll_e2e_ready` · **`C-SLICE-≠-MODULE`** |

```text
  Settings MD / XBOS group catalog ──► NOT body SoT (Option A REJECT · REF label/merge only)
           │
  hrm_contract_clauses.body_vi (RETAIN · versioned) ──► BODY SoT (this seat LOCK)
           │  admin edit
           ├─ draft / not-issued ──► edit in place → 2xx → F5 new body
           └─ active + issued ──► version bump (activate) ; HRM-CTR-CL-CODE-CONFLICT guard
           │
           ▼
  hrm_contract_print_versions.clauses_snapshot_json (FREEZE · immutable) ← issue
           │
  FE render / preview ──► resolve body from row/snapshot ; NEVER hardcode (BR-CTR-CL-03)
  Group→member ──► hrm_contract_library_publishes (versioned · RETAIN)
```

---

## 6. F.1 API map (Nest Option B — RETAIN + cite existing)

| Cap ID | METHOD / path (existing Nest — cite legal-print prefix) | Mục đích | Nghiệp vụ xử lý (tóm tắt) | Tham chiếu bước SRS | Request → DB | Lỗi |
|--------|----------------------------------------------------------|----------|---------------------------|---------------------|--------------|-----|
| **F-CTR-CL-01** | `GET …/contracts/legal-print/clauses` (+ `clause_group`, `pack`, `include_inactive`) | List clauses — display-ready | Scope · active default · group/pack filter | FR-UC-BP-CORE-09b cấu hình | `hrm_contract_clauses` | `HRM-SCOPE-409` |
| **F-CTR-CL-02** | `POST …/clauses` | Admin CREATE open N+1 | Validate code/title/body required · UQ active code · `{{token}}` allowed in body | FR-UC-BP-CORE-09b admin | INSERT clause | `HRM-CTR-CL-REQUIRED` · `HRM-CTR-CL-CODE-CONFLICT` |
| **F-CTR-CL-03** | `PATCH …/clauses/{id}` (updateClause) | Edit `body_vi` / meta | Draft → edit in place; active+issued+body change → **soft-block** version-bump | FR-UC-BP-CORE-09b · 09c | UPDATE body_vi | `HRM-CTR-CL-CODE-CONFLICT` (version bump) · `HRM-CTR-CL-404` |
| **F-CTR-CL-04** | `POST …/clauses/{id}/activate` | Version bump / (re)activate | New authoritative version; old snapshot untouched | FR-UC-BP-CORE-09c | UPDATE version/status | conflict |
| **F-CTR-CL-05** | `GET …/clauses/{id}` | Get-by-id | Scope parity with list | FR-UC-BP-CORE-09b | read | `HRM-CTR-CL-404` |
| **F-CTR-CL-CNS-01** | preview / issue / PDF resolve | Consumer resolve body | Resolve from row → freeze `clauses_snapshot_json` on issue · mandatory-gap gate | FR-UC-BP-CORE-09 / 09a | snapshot write | `HRM-CTR-ISSUE-BLOCKED` |
| **F-CTR-CL-PUB-\*** | library publish/pull | Group propagation | RETAIN versioned payload · lineage stamp | FR-UC-BP-CORE-09d | `hrm_contract_library_publishes` | `HRM-CTR-PUB-*` |

**Wire codes:** RETAIN existing (`HRM-CTR-CL-REQUIRED` · `HRM-CTR-CL-CODE-CONFLICT` · `HRM-CTR-CL-404` · `HRM-CTR-ISSUE-BLOCKED` · `HRM-CTR-CB-FORBIDDEN`). **No new wire code invented** — FE hardcode-body is a QA/lint FAIL (**BR-CTR-CL-03**), not a runtime 4xx.

**Path naming:** RETAIN `/api/hrm/contracts/legal-print/clauses*` — **cấm** invent `/api/hrm/platform/ctr/*` mega catalog.

---

## 7. Admin open N+1 ≠ consumer invent (stamp)

| Class | Who | Allowed | Forbidden | Signal |
|-------|-----|---------|-----------|--------|
| **ADMIN-CLAUSE** | HCNS / Settings clause CRUD | CREATE N+1 clauses; edit `body_vi` (draft in place / issued via version bump); open `{{token}}` in body | Treating admin edit as failure | 2xx / soft-block on issued only |
| **CONSUMER-RENDER** | preview · issue · PDF · FE render | Resolve body from clause row / snapshot | Free-text / hardcoded legal body as SoT | **BR-CTR-CL-03** — QA/lint FAIL |
| **CONSUMER-ISSUE** | issue print version | Freeze snapshot; mandatory clauses present | Rewrite snapshot on later edit | `HRM-CTR-ISSUE-BLOCKED` / L-CTR-CL-04 |
| **EMPTY** | no clauses for pack/template | CTA admin · soft empty | Seed fake body to pass UF | — (U65) |

**No new wire stamp locked** — reuse `HRM-CTR-CL-*`. Aliases BA may document as OBS only; **one** wire code per condition in BE.

---

## 8. Explicit OUT

| OUT | Rule |
|-----|------|
| DnD clause reorder (`clause_ids` / `layout_json`) | **OUT** — **cite peer** AC-PLT-CTR-03 (separate seat); DnD LIVE, not this AC |
| DOCX binary upload / render | **OUT** — GĐ2 (BA-01 §6 non-goal) |
| Full MISA AI template generation | **OUT** — research principle only |
| Paste full copyright HĐ body into docs / seed | **OUT** — body = tenant Settings/Nest data only |
| Flip `contracts_printable_ready` / `payroll_e2e_ready` | **OUT** |
| Module CTR UAT / Phase1 DONE | **OUT** · **`C-SLICE-≠-MODULE`** |
| Reopen leave-balance / ATT-CODE/WS/SHIFT L1 · invent FE HOLDs | **OUT** · **FORBIDDEN** |
| Snapshot rewrite / print-spine churn | **OUT** · **must_keep** immutable |
| Mega-EAV / platform mega clause table | **OUT** (Q-PLT-03) |
| Settings/XBOS body SoT (Option A) | **OUT** / REJECT |

---

## 9. ba-data UNLOCK vs HOLD

| Decision | **HOLD (conditional UNLOCK)** |
|----------|-------------------------------|
| Rationale | `hrm_contract_clauses` (body_vi + version) + `clauses_snapshot_json` freeze **already exist & LIVE**; issued bodies preserved by snapshot → **no physicalize required** for correctness (RETAIN class — unlike leave-balance Nest-ABSENT DEFINE). |
| Conditional trigger | If ba-process proves an **admin-visible prior-body history** AC that print snapshot cannot serve → narrow ADD append-only `hrm_contract_clause_versions` (soft FK to clause, immutable rows). |
| HOLD = NO | Second body SoT · mega-EAV · rewrite `hrm_contract_clauses` · migrate body to Settings/XBOS. |
| Next work_item (if fired) | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-DATA-01` |

---

## 10. Draft AC stubs (for ba-process)

| ID | Stub (PASS intent) | FAIL |
|----|---------------------|------|
| **AC-PLT-CTR-CL-01** | Settings → open clause → edit `body_vi` (đổi câu, không paste full HĐ) on **draft/not-issued** → 2xx → F5 nội dung mới; draft preview dùng body mới | FE body hardcode · Lưu OK nhưng F5 cũ · chỉ API PASS |
| **AC-PLT-CTR-CL-02** | Edit `body_vi` of **active clause already issued** → soft-block → **activate/version bump** → new version active; issued contract keeps old body (snapshot) | Silent overwrite · issued contract body changes retroactively |
| **AC-PLT-CTR-CL-03** | Issue print version → later edit clause body → F5 **issued version** body unchanged (snapshot freeze); new draft uses new body | Snapshot mutated on edit |
| **AC-PLT-CTR-CL-04** | Admin CREATE N+1 clause (open code, `{{token}}` in body) bound to pack → 2xx → F5 list has row | Reject admin as invent · closed clause list |
| **AC-PLT-CTR-CL-05** | Body SoT = Nest clause row; FE/consumer render resolves from row/snapshot — never hardcodes body (BR-CTR-CL-03) | FE hardcode legal body · Settings/XBOS second body SoT |
| **AC-PLT-CTR-CL-06** | Soft-retire clause → picker hides · history/snapshot OK | Hard-delete orphans snapshot |
| **AC-PLT-CTR-CL-H** | Honesty: `contracts_printable_ready=false` · no module CTR UAT · no reopen seals · no DnD/DOCX here · U65 · **`C-SLICE-≠-MODULE`** | Flip flags / reopen seals / scope creep |
| **VAL-CTR-CL-01** | Issued body edit without version bump | soft-block `HRM-CTR-CL-CODE-CONFLICT` | Silent accept |
| **VAL-CTR-CL-02** | Scope list ≠ get-by-id ≠ resolve | jest FAIL scope_parity | Drift |
| **VAL-CTR-CL-03** | Token syntax dual (`{{}}` + `#x#`) same template | reject / one syntax | Dual accepted |

**ba-process must:** enumerate exact UF/J-* (Settings clause admin · edit body draft vs issued · preview · issue freeze) · confirm token syntax `{{x}}` · decide conditional ba-data history trigger · cross-ref print-spine slice as **RETAIN** (do not reopen GWC).

---

## 11. Failure modes and mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Settings body green / Nest snapshot drift | Dual body audit | L-CTR-CL-01 REJECT A |
| B | Issued contract body changes retroactively | Snapshot diff on edit | L-CTR-CL-03/04 (guard already LIVE) |
| B | Redundant mega history table added | ba-data scope review | L-CTR-CL-09 HOLD default |
| B | Claim printable / module UAT | Honesty flags | L-CTR-CL-10 |
| C | FE hardcode legal body | Lint / code review | BR-CTR-CL-03 · L-CTR-CL-02 |
| C | Reopen leave-balance / ATT L1 | Seal churn | Option C REJECT · seals RETAIN |

---

## 12. Rollout / validation

| Step | Owner | Gate |
|------|-------|------|
| 1 This SA Option B LOCK | sa | **CONFIRMED** (this file) |
| 2 ba-process AC pack | ba-process | AC-PLT-CTR-CL-01* CONFIRMED |
| 3 ba-data conditional | ba-data | HOLD unless history trigger fires |
| 4 BE narrow (if gap) | dev-be | RETAIN LIVE; no schema change unless ba-data fires |
| 5 FE happy-path + QA U65 L1 | dev-fe / qa | browser · zero-seed · no printable flip |
| 6 QC GWC slice | qc | `C-SLICE` · honesty false |

**Success (this seat):** Option B locked (RETAIN) · ba-process UNLOCK · ba-data HOLD (conditional) · BE/FE HOLD · honesty false · seals retained · no `apps/**`.

---

## 13. Honesty

| Flag | Value |
|------|-------|
| `contracts_printable_ready` | **false** |
| `payroll_e2e_ready` | **false** |
| Module CTR UAT / Phase1 | **DENIED** |
| DnD reorder / DOCX GĐ2 | **OUT** this seat |
| `C-SLICE-≠-MODULE` | **RETAIN** |
| This seat | Docs-only Option/F.1 |

---

## 14. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-sa-01.md` |
| **next_owner** | **ba-process** (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01`) |
| **completion_report** | CONFIRMED Option B (RETAIN + narrow clarify): Nest `hrm_contract_clauses.body_vi` = clause body SoT; version-bump-on-issued-edit + snapshot freeze already LIVE (RETAIN); Settings/XBOS body SoT REJECT; token syntax `{{x}}` LOCK; ba-process UNLOCK, ba-data HOLD (conditional history trigger), BE/FE HOLD; DnD reorder + DOCX OUT (cite peer); seals retained; no apps/**. |
