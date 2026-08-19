# PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-SA-01 — Option/F.1 · contract **template open catalog** SoT (`hrm_contract_templates`)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-SA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-DOCS-01` **ACCEPT** · U88 continuous **next vertical** after clause **body_vi RETAIN** |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 narrow — LOCK **AC-PLT-CTR-01** (focus) + **AC-PLT-CTR-04/06** · **RETAIN** LIVE Nest open catalog · **NO CODE** `apps/**` · **no seed** · **no wipe** · **cấm reopen** clause L1 / ATT L1 · **cấm flip** printable |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **B** **LOCKED (RETAIN AS-IS LIVE + narrow platform name)** · ba-process **UNLOCK** · ba-data **HOLD** · BE/FE **HOLD** until BA |
| **prior_seals** | CTR-CLAUSE Option B RETAIN `body_vi` · leave-balance / ATT CNS-WIRE closing via QC-02 · ATT-SHIFT/CODE/WS · EMP · SI · PAY · DEC · MergeToken **EXT** — **SEAL RETAIN** |
| **ref_ba_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.5 · §3.2 Template CRUD · **AC-PLT-CTR-01/03/04/06** · **BR-CTR-TPL-DYN-01..07** · **BR-PLT-02/03/04/05** |
| **ref_lock** | [`PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md) · [`CORR-01`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md) · TechSpec/DATA/API XEVN-TPL (open catalog SUPERSEDE closed-8) |
| **ref_peer_retain** | CTR-CLAUSE-SA-01 Option B Nest **PRESENT → RETAIN** — **cite class-same** (Nest LIVE open catalog); **≠** leave-balance Nest-ABSENT DEFINE |
| **ref_peer_engine_hold** | PAY-CATALOG Option B — catalog SoT ≠ engine LIVE; printable HOLD pattern **cite** |
| **ref_code** | `apps/api/hrm-api/migrations/20260806_contract_legal_print.sql` · `20260807_contract_library_publish.sql` · `contract-legal-print.service.ts` (`createTemplate` · `bootstrapXevnMatrixDrafts` · `replaceTemplateClauses`) · `contract-legal-print.constants.ts` · FE `ContractLegalPrintSettingsPanel.tsx` |
| **Honesty** | `contracts_printable_ready=false` · `payroll_e2e_ready=false` · **DENIED** module CTR UAT / Phase1 · **`C-SLICE-≠-MODULE`** · U65 zero-seed |
| **must_keep** | issued `hrm_contract_print_versions.template_code` freeze · layout/`clause_ids` snapshot at issue (**BR-PLT-03**) · UF-HRM-02 nullable template · library publish/pull DATA-02 · DYNAMIC-LOCK / CORR-01 open catalog · clause `body_vi` RETAIN · ATT/EMP/SI/PAY/DEC/MergeToken seals |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option evaluation)

| | |
|--|--|
| **Decision title** | AC-PLT-CTR-01 — SoT & open-catalog lifecycle for contract **templates** (CREATE N+1 / mã 9+ · starter-8 ≠ ceiling) |
| **Requestor** | pm · U88 after CTR-CLAUSE-DOCS ACCEPT · BA-01 §3.2 / AC-PLT-CTR-01 focus |
| **Decision owner** | sa |
| **Related** | FR-UC-BP-CORE-09 / 09d · AC-CTR-XEVN-11 ≡ AC-PLT-CTR-01 · AC-CTR-XEVN-01 ≡ AC-PLT-CTR-06 · BR-CTR-TPL-DYN-01..07 · BR-PLT-05 · AC-PLT-CTR-04 freeze · AC-PLT-CTR-03 DnD **OUT peer** |

### 1.1 Problem — AS-IS vs target

| Current state (AS-IS evidence from code / CORR) | Gap / target |
|-----------------------------------------------|--------------|
| Nest **`hrm_contract_templates`** LIVE (`20260806`): `code · name_vi · pack_code · layout_json · keyword_map · status draft\|active\|retired · version · archived_at` + UQ `(company_id, lower(code)) WHERE archived_at IS NULL` | Template **catalog already Nest data** — not Settings MD sole / not XBOS sole |
| CORR-01 + DYNAMIC-LOCK + CODE-MEMORY: **DROP** closed `CHK IN (8)`; `createTemplate` accepts **9th+**; `HRM-CTR-TPL-CODE-INVALID` = **format/slug only** — never «not in starter 8» | Platform seat must **name** this as Option B **RETAIN** under AC-PLT-CTR-* (not re-invent SoT; not reopen closed-8 debate) |
| `bootstrapXevnMatrixDrafts` upserts **8** `XEVN_*` starter drafts (seed-of-structure) | Starter = **optional bootstrap** (**BR-CTR-TPL-DYN-02** · **BR-PLT-05**) — **≠ ceiling** (**AC-PLT-CTR-06**) |
| Print versions freeze `template_code` column (+ meta mirror); issue immutability LIVE | **must_keep** AC-PLT-CTR-04 — edit template after issue **must not** mutate issued version |
| `replaceTemplateClauses` / DnD `clause_ids` LIVE | Layout reorder = **AC-PLT-CTR-03** — **OUT this seat** (cite peer; do not reopen clause body) |
| Settings FE panel + `/contracts/legal-print/templates*` CRUD LIVE | Needs **BA AC wording** U65 (Tạo mẫu 9 → 2xx → F5 → picker) — not new physicalize |
| Library publish/pull + lineage (`origin` / `lineage_code`) LIVE | Group→member template propagation **RETAIN** — not second SoT |

**Failure if unresolved:** (a) treat starter-8 as closed enum again; (b) migrate template SoT to Settings MD / XBOS sole and dual-write Nest; (c) FE hardcode list of 8 codes; (d) reject admin CREATE 9th as «invent»; (e) flip `contracts_printable_ready`; (f) reopen clause `body_vi` / ATT L1; (g) fold DnD/DOCX into this seat; (h) mega-EAV second template table.

### 1.2 Constraints

- Docs-only · **no** `apps/**` · **no** seed (U65) · **no** empty seat.
- **DENY** `contracts_printable_ready=true` · `payroll_e2e_ready=true` · module CTR UAT · Phase1 DONE · **`C-SLICE-≠-MODULE`**.
- **SEAL RETAIN:** clause Option B `body_vi` · print-spine GWC slice · ATT leave-balance CNS-WIRE/QC · ATT/EMP/SI/PAY/DEC/MergeToken EXT.
- **OUT:** DOCX GĐ2 · clause body reopen · ATT reopen · flip printable · invent FE HOLDs · mega-EAV.
- Cite `/api/hrm/contracts/legal-print/templates*` — **cấm** invent `/api/hrm/platform/ctr/*` mega catalog.

### 1.3 Decision heuristic (program rule — applied)

| Rule | Application this seat |
|------|------------------------|
| Prefer **A Settings** if producer LIVE in Settings only | Template producer is **Nest** (`hrm_contract_templates`) → **A REJECT** as sole SoT |
| Prefer **B Nest** if producer Nest-LIVE **or** absent | Template producer **Nest-PRESENT & LIVE** (+ CORR open catalog) → **B = RETAIN + narrow platform lock** |
| REJECT hybrid dual writers / closed-8 restore / FE hardcode 8 / reopen seals / flip ready | Explicit **Option C** reject |
| Catalog LIVE ≠ redundant physicalize | ba-data **HOLD** |

---

## 2. Options

### Option A — Settings / XBOS master-data = template SoT (Nest mirror only)

| | |
|--|--|
| **Description** | Move authoritative `template_code` catalog into Settings Master-Data (or XBOS group catalog); Nest `hrm_contract_templates` becomes pull-mirror / consumer only. |
| **Benefits** | Central group catalog UX narrative. |
| **Costs** | Contradicts LIVE Nest print-spine owner; dual writers vs freeze `template_code` + `layout_json` + clause join; XBOS publish already covered by **Nest** `hrm_contract_library_publishes` — moving SoT upstream duplicates DATA-02; Settings MD lacks pack/term/title_print/matrix_family semantics already on Nest rows. |
| **Risks** | AC green in Settings while PREV/VER resolve stale Nest row; print-spine regression — **REJECT** as sole template SoT. Settings/XBOS may remain **REF** for unrelated labels — **≠** template catalog SoT. |

### Option B — Nest `hrm_contract_templates` = open catalog SoT · **RETAIN AS-IS LIVE** · admin CREATE N+1 · starter-8 ≠ ceiling — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | **RETAIN** LIVE Nest template table as the **single** open-catalog SoT for `template_code`. Admin (HCNS/Settings) **CREATE / update / activate / soft-retire** rows with HR-chosen `code` (slug/format + UQ + `pack_code` ∈ configured packs) — **9th+ required capability** (**AC-PLT-CTR-01** ≡ **AC-CTR-XEVN-11**). Optional `bootstrapXevnMatrixDrafts` upserts starter **8** `XEVN_*` (**BR-CTR-TPL-DYN-02**) — soft warn if missing **must not** block CREATE (**AC-PLT-CTR-06** · **BR-PLT-05**). Consumer paths (UF-HRM-02 picker · preview · issue) **select/resolve** active catalog rows — **FORBIDDEN** free-text invent when catalog EFF>0 → invent KEY class **`HRM-CTR-TPL-KEY`** (see §7; aliases `HRM-CTR-TPL-404` when resolve miss — BA picks one wire). Issue freezes `template_code` (+ layout/clause snapshot) — later template edit **does not** mutate issued versions (**AC-PLT-CTR-04** · **BR-CTR-TPL-DYN-06** · **BR-PLT-03**). Group→member via LIVE library publish/pull. FE **cấm** hardcode starter-8 list. **No new physical table.** |
| **Benefits** | Aligns BA-01 §3.2 · CORR-01 · DYNAMIC-LOCK · already-shipped Nest/FE CRUD; zero dual SoT; hands ba-process **named AC-PLT-CTR-TPL-*** wording for U65 — not a SoT migrate. |
| **Costs** | ba-process AC pack + later FE/QA residual for happy-path 9th if any UX gap; must keep invent KEY vs admin CREATE distinction crisp. |
| **Risks** | Misread as «reopen print-spine / flip printable / reopen clause body / fold DnD» → **L-CTR-TPL-*** mitigations. |

### Option C — Hybrid dual writers / restore closed-8 / FE hardcode 8 / mega template-EAV / reopen clause·ATT / flip `contracts_printable_ready`

| | |
|--|--|
| **Description** | Settings **and** Nest both own codes; or restore CHECK IN (8); or FE enum 8; or second mega template table; or reopen clause L1 / ATT; or flip printable from this seat. |
| **Benefits** | None for GĐ1 honesty. |
| **Costs** | Dual SoT · seal churn · CORR-01 regression. |
| **Risks** | **REJECT** — DENY dual writers · DENY closed-8 · DENY FE hardcode · DENY mega-EAV (Q-PLT-03) · DENY reopen seals · DENY printable flip · DENY clause invent reopen. |

---

## 3. Trade-off matrix

| Criteria | Weight | A Settings/XBOS sole | **B Nest RETAIN open** | C Hybrid / closed-8 / flip |
|----------|-------:|---------------------:|-----------------------:|---------------------------:|
| Business value (FR-09d · AC-PLT-CTR-01) | 5 | 2 | **5** | 0 |
| Honesty / seal safety (print-spine · CORR) | 5 | 1 | **5** | 0 |
| Single catalog SoT vs dual-write | 5 | 0 | **5** | 0 |
| Time to deliver (RETAIN vs migrate) | 4 | 1 | **5** | 1 |
| Complexity | 4 | 2 | **4** | 0 |
| Maintainability (LIVE createTemplate · peer clause) | 4 | 1 | **5** | 1 |
| **Weighted** | | 38 | **120** | 12 |

---

## 4. Decision

| | |
|--|--|
| **Selected** | **Option B** — architecture **LOCKED (RETAIN AS-IS LIVE + narrow platform name)** |
| **Seat verdict** | **CONFIRMED** |
| **Why B** | Template open catalog is **already** Nest LIVE (`hrm_contract_templates` + `createTemplate` 9+ + starter bootstrap ≠ ceiling + freeze `template_code`). Settings/XBOS sole = dual SoT + print-spine risk. This seat **locks** CORR/DYNAMIC-LOCK under platform AC-PLT-CTR-* and unlocks **ba-process** AC pack — **not** a physicalize, **not** a printable flip, **not** a clause reopen. |
| **Rejected** | **A** Settings/XBOS sole SoT · **C** hybrid / closed-8 / FE hardcode / mega-EAV / reopen / flip |
| **Assumptions** | Issued freeze column LIVE; UF-HRM-02 remains nullable template; pack configured set RETAIN; clause body SoT remains Nest `body_vi` (peer RETAIN — **cấm reopen**). |

### 4.1 Physical / DATA / BA / BE gates

| Question | Answer |
|----------|--------|
| New ba-data physicalize? | **HOLD** — table + UQ + freeze column + lineage **already LIVE** (RETAIN class = peer clause). |
| Unlock ba-process? | **YES** — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BA-01` AC pack (**AC-PLT-CTR-TPL-***) |
| Unlock BE? | **HOLD** until BA confirms residual gap vs LIVE `createTemplate` / resolve (no schema invent) |
| Unlock FE? | After BA — surface existing Settings CRUD; **FORBIDDEN** invent ATT/clause FE HOLDs |
| DnD `clause_ids` layout? | **OUT** — **cite peer** **AC-PLT-CTR-03** (separate seat) |
| Clause `body_vi` edit? | **OUT** — **RETAIN peer** CTR-CLAUSE — **cấm reopen** |
| Flip printable / module UAT? | **FORBIDDEN** |

### 4.2 Layer map (SoT vs REF vs OUT)

| Layer | Artifact | Role this seat |
|-------|----------|----------------|
| **Template catalog (OWN · RETAIN)** | Nest `hrm_contract_templates.code` | **Open catalog SoT** — admin CREATE N+1 |
| **Starter bootstrap (REF · optional)** | `XEVN_MATRIX_CATALOG` upsert 8 | Example rows — **≠ ceiling** |
| **Freeze (must_keep)** | `hrm_contract_print_versions.template_code` + layout/clause snapshot | Immutable on issue |
| **Layout/order (OUT peer)** | `hrm_contract_template_clauses` / `layout_json.clause_ids` | **Cite AC-PLT-CTR-03** |
| **Clause body (OUT peer RETAIN)** | `hrm_contract_clauses.body_vi` | **Do not reopen** |
| **Group propagation (RETAIN)** | `hrm_contract_library_publishes` + lineage | Versioned publish/pull |
| **REF** | Settings MD / XBOS unrelated catalogs | Label/merge REF — **≠** template SoT |
| **OUT** | DOCX GĐ2 · closed-8 · printable flip · ATT reopen · mega-EAV | Explicit §8 |

---

## 5. Locks (L-CTR-TPL-*)

| Lock | Rule |
|------|------|
| **L-CTR-TPL-01 Catalog SoT** | Authoritative template catalog = Nest `hrm_contract_templates` — **FORBIDDEN** Settings MD / XBOS group catalog / FE constant list as sole or dual SoT |
| **L-CTR-TPL-02 Admin CREATE ≠ consumer invent** | Admin **may** CREATE open N+1 (mã 9+) with valid format/UQ/pack. Consumer **must** picker/FK when EFF>0 — invent free-text → **`HRM-CTR-TPL-KEY`** (see §7). **FORBIDDEN** treat admin 9th as invent fail |
| **L-CTR-TPL-03 Starter ≠ ceiling** | Starter 8 optional ensure — soft warn OK; **FORBIDDEN** hard-block CREATE because ≠8 / not in `XEVN_*` (**AC-PLT-CTR-06** · **BR-PLT-05** · **BR-CTR-TPL-DYN-02**) |
| **L-CTR-TPL-04 CODE-INVALID = format only** | `HRM-CTR-TPL-CODE-INVALID` = empty/illegal charset/slug — **never** «not in starter 8» (**BR-CTR-TPL-DYN-03**) |
| **L-CTR-TPL-05 Pack validation** | `pack_code` ∈ configured packs; starter matrix pack rules RETAIN → `HRM-CTR-TPL-PACK-MISMATCH` (**BR-CTR-TPL-DYN-04/05**) |
| **L-CTR-TPL-06 Freeze immutable** | Issued `template_code` + structure snapshot frozen — template edit after issue **does not** rewrite issued version (**AC-PLT-CTR-04** · **BR-CTR-TPL-DYN-06** · **BR-PLT-03**) |
| **L-CTR-TPL-07 Soft-delete / retire** | Retire = soft (`archived_at` / `status=retired`) — picker hides; history FK/print versions intact (**BR-PLT-04**) |
| **L-CTR-TPL-08 UF-HRM-02 nullable** | Registry CRUD **without** template remains allowed — **must_keep** |
| **L-CTR-TPL-09 Scope parity** | list ↔ get-by-id ↔ create ↔ preview/issue same scope resolver (U19) |
| **L-CTR-TPL-10 Seals / honesty / OUT peers** | **FORBIDDEN** reopen clause body · ATT L1 · invent FE HOLDs · DnD here · DOCX GĐ2 · flip `contracts_printable_ready` / `payroll_e2e_ready` · mega-EAV · **`C-SLICE-≠-MODULE`** |

```text
  Settings MD / XBOS ──► NOT template SoT (Option A REJECT · REF only)
           │
  hrm_contract_templates (RETAIN · open catalog) ──► TEMPLATE SoT (this seat LOCK)
           │  admin CREATE N+1 (mã 9+) · starter 8 optional ≠ ceiling
           │
           ├─ consumer picker when EFF>0 ──► bind template_code
           │     invent free-text ──► HRM-CTR-TPL-KEY (FORBIDDEN SoT)
           │
           ▼
  issue ──► hrm_contract_print_versions.template_code + layout/clause snapshot (FREEZE)
           │
  later template edit ──► draft/new issue only · issued version UNCHANGED (AC-PLT-CTR-04)
  Group→member ──► hrm_contract_library_publishes (RETAIN)
  DnD clause_ids ──► OUT peer AC-PLT-CTR-03
  Clause body_vi ──► OUT peer CTR-CLAUSE RETAIN (cấm reopen)
```

---

## 6. F.1 API map (Nest Option B — RETAIN + cite existing)

| Cap ID | METHOD / path (existing Nest — legal-print prefix) | Mục đích | Nghiệp vụ xử lý (tóm tắt) | Tham chiếu bước SRS | Request → DB | Lỗi |
|--------|-----------------------------------------------------|----------|---------------------------|---------------------|--------------|-----|
| **F-CTR-TPL-01** | `GET …/contracts/legal-print/templates` (+ status / pack / `matrix=xevn`) | List open catalog — display-ready | Scope · active default · optional starter-family filter | FR-UC-BP-CORE-09d · AC-PLT-CTR-01/06 | `hrm_contract_templates` | `HRM-SCOPE-409` |
| **F-CTR-TPL-02** | `POST …/templates` (`createTemplate`) | Admin CREATE open N+1 (mã 9+) | Format/UQ/pack · **cấm** reject not-in-8 · optional clause_ids bind | 09d AC-CTR-XEVN-11 · AC-PLT-CTR-01 | INSERT template | `HRM-CTR-TPL-CODE-INVALID` · `HRM-CTR-TPL-PACK-MISMATCH` · `HRM-CTR-CL-CODE-CONFLICT` |
| **F-CTR-TPL-03** | `PATCH …/templates/{id}` | Update metadata / layout bind | Draft/active policy; issued contracts keep freeze | BR-CTR-TPL-02 · AC-PLT-CTR-04 | UPDATE row | conflict / 404 |
| **F-CTR-TPL-04** | `POST …/templates/{id}/activate` (or status→active) | Activate | Matrix title_print rules when XEVN_MATRIX | 09d | UPDATE status/version | required fields |
| **F-CTR-TPL-05** | `GET …/templates/{id}` | Get-by-id | Scope parity with list | 09d | read | `HRM-CTR-TPL-404` |
| **F-CTR-TPL-CNS-01** | preview / print-versions | Consumer resolve + freeze | Resolve active code → freeze `template_code` on issue | 09 / 09a · AC-PLT-CTR-04 | snapshot write | `HRM-CTR-TPL-NONE` · `HRM-CTR-TPL-KEY` · `HRM-CTR-ISSUE-BLOCKED` |
| **F-CTR-TPL-PUB-\*** | library publish/pull | Group propagation | RETAIN lineage stamp | 09d | publishes table | `HRM-CTR-PUB-*` |

**Path naming:** RETAIN `/api/hrm/contracts/legal-print/templates*` — **cấm** invent `/api/hrm/platform/ctr/*`.

**Wire codes RETAIN:** `HRM-CTR-TPL-CODE-INVALID` · `HRM-CTR-TPL-PACK-MISMATCH` · `HRM-CTR-TPL-NONE` · `HRM-CTR-TPL-404` · UQ via `HRM-CTR-CL-CODE-CONFLICT` class. **Invent KEY class ADD (docs):** `HRM-CTR-TPL-KEY` — consumer free-text when catalog EFF>0 (ba-process may alias to 404 with explicit AC wording — **one** wire per condition in BE).

---

## 7. Admin open N+1 ≠ consumer invent (stamp)

| Class | Who | Allowed | Forbidden | Signal |
|-------|-----|---------|-----------|--------|
| **ADMIN-TPL** | HCNS / Settings template CRUD | CREATE mã 9+ · update · activate · soft-retire · optional starter ensure | Treating 9th as «not in 8» fail · hard-delete referenced | 2xx · `CODE-INVALID` format only |
| **CONSUMER-PICK** | UF-HRM-02 · preview · issue | Select active `template_code` from catalog when EFF>0 | Free-text invent as SoT | **`HRM-CTR-TPL-KEY`** (invent class) |
| **CONSUMER-EMPTY** | catalog EFF=0 | Nullable UF-HRM-02 · CTA admin · `HRM-CTR-TPL-NONE` on print paths that require template | Seed fake 8 to pass UF (U65) | soft empty / NONE |
| **STARTER** | bootstrap | Upsert 8 `XEVN_*` optional | Ceiling / hard-block CREATE | soft warn only |

---

## 8. Explicit OUT

| OUT | Rule |
|-----|------|
| DnD clause reorder (`clause_ids`) | **OUT** — **cite peer AC-PLT-CTR-03** |
| Clause `body_vi` edit / version-bump seat | **OUT** — **RETAIN peer CTR-CLAUSE** — **cấm reopen invent** |
| DOCX binary GĐ2 | **OUT** |
| Flip `contracts_printable_ready` / `payroll_e2e_ready` | **OUT** |
| Module CTR UAT / Phase1 DONE | **OUT** · **`C-SLICE-≠-MODULE`** |
| Reopen ATT leave-balance / ATT L1 · invent FE HOLDs | **OUT** · **FORBIDDEN** |
| Restore closed-8 CHECK / FE enum 8 | **OUT** · CORR-01 SUPERSEDE |
| Mega-EAV / second template table / Settings sole SoT | **OUT** / REJECT A·C |
| Seed to «prove» 9th | **OUT** · U65 |

---

## 9. ba-data UNLOCK vs HOLD

| Decision | **HOLD** |
|----------|----------|
| Rationale | `hrm_contract_templates` + UQ + status + layout_json + keyword_map + freeze `print_versions.template_code` + lineage columns **already exist & LIVE** (CORR DATA-01 CONFIRMED class). Same RETAIN heuristic as CTR-CLAUSE — **no physicalize**. |
| Conditional UNLOCK | Only if ba-process proves a **net-new column/index** required for an AC that LIVE schema cannot express (narrow ADD) — **FORBIDDEN** rewrite SoT / mega-EAV / dual table. |
| HOLD = NO | Migrate catalog to Settings · invent `emp_contract_template` dual · closed enum restore. |
| Next work_item (if fired) | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-DATA-01` |

---

## 10. Draft AC stubs (for ba-process) — **AC-PLT-CTR-TPL-***

| ID | Stub (PASS intent) | FAIL | Maps |
|----|---------------------|------|------|
| **AC-PLT-CTR-TPL-01** | Settings → **Tạo mẫu** thứ **9** (code HR đặt, pack ∈ configured, metadata tối thiểu) → Network **2xx** → list có row → **F5** còn → form HĐ/preview **chọn được** mã 9 | Reject «không thuộc 8» · FE hardcode 8 · mất sau F5 · chỉ API PASS | **AC-PLT-CTR-01** ≡ AC-CTR-XEVN-11 |
| **AC-PLT-CTR-TPL-02** | Starter 8 (nếu bootstrap) có thể hiện; sau TPL-01 catalog **>8**; soft warn thiếu starter **không** chặn thêm | Soft warn / UI / API chặn vì ≠8 | **AC-PLT-CTR-06** ≡ AC-CTR-XEVN-01 revised |
| **AC-PLT-CTR-TPL-03** | Issue print version trên HĐ gắn mẫu → đổi metadata/layout template sau đó → F5 **version cũ** giữ `template_code` + structure freeze; draft mới theo template mới | Issued version đổi theo edit template | **AC-PLT-CTR-04** |
| **AC-PLT-CTR-TPL-04** | When catalog EFF>0: consumer binds picker/FK only; free-text invent → **`HRM-CTR-TPL-KEY`** (or documented alias) | Free-text accepted as SoT | BR-PLT-02 |
| **AC-PLT-CTR-TPL-05** | Soft-retire template → picker ẩn · history/print versions OK | Hard-delete orphans freeze | BR-PLT-04 |
| **AC-PLT-CTR-TPL-06** | UF-HRM-02 CRUD **without** template still OK | Force template required | UF-HRM-02 must_keep |
| **AC-PLT-CTR-TPL-07** | Scope list = get-by-id = mutate same resolver | 409/404 drift | U19 |
| **AC-PLT-CTR-TPL-H** | Honesty: printable false · no module CTR UAT · no reopen clause/ATT · no DnD/DOCX here · U65 · **C-SLICE** | Flip flags / reopen / scope creep | — |
| **VAL-CTR-TPL-01** | Admin invalid slug | `HRM-CTR-TPL-CODE-INVALID` format only | ≠ not-in-8 |
| **VAL-CTR-TPL-02** | Starter pack mismatch | `HRM-CTR-TPL-PACK-MISMATCH` | BR-DYN-04/05 |
| **VAL-CTR-TPL-03** | Consumer invent when EFF>0 | `HRM-CTR-TPL-KEY` | invent class |

**ba-process must:** enumerate UF/J-* (Settings Tạo mẫu · F5 · picker · issue freeze) · lock invent KEY wire vs TPL-404 alias · **cite** AC-PLT-CTR-03 DnD OUT · **cite** clause RETAIN no reopen · cross-ref print-spine as RETAIN (do not reopen GWC) · U65 zero-seed evidence template.

**DnD note:** layout reorder AC remains **AC-PLT-CTR-03** — **not** authored as TPL-* in this seat (OUT).

---

## 11. Failure modes and mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Settings green / Nest PREV stale | Dual catalog audit | L-CTR-TPL-01 REJECT A |
| B | FE restores closed-8 list | Browser AC-01 FAIL | L-CTR-TPL-02/03 · CORR-01 |
| B | Soft warn blocks 9th | AC-06 FAIL | L-CTR-TPL-03 |
| B | Issued freeze mutated | Snapshot diff | L-CTR-TPL-06 |
| B | Claim printable / module UAT | Honesty flags | L-CTR-TPL-10 |
| C | Reopen clause body / ATT | Seal churn | Option C REJECT · seals RETAIN |
| C | Mega second template table | ba-data scope | §9 HOLD |

---

## 12. Rollout / validation

| Step | Owner | Gate |
|------|-------|------|
| 1 This SA Option B LOCK | sa | **CONFIRMED** (this file) |
| 2 ba-process AC pack | ba-process | AC-PLT-CTR-TPL-* CONFIRMED |
| 3 ba-data | ba-data | **HOLD** unless conditional trigger |
| 4 BE narrow (if gap) | dev-be | RETAIN LIVE; no schema invent |
| 5 FE happy-path + QA U65 | dev-fe / qa | browser · zero-seed · no printable flip |
| 6 QC slice | qc | GWC/GO slice only · **C-SLICE** · honesty false |

**Rollback:** docs-only revert this Option lock; product code unchanged this seat.

**Success criteria:** Option B cited; admin≠consumer invent stamped; starter≠ceiling; freeze must_keep; ba-data HOLD; ba-process unlocked; seals/honesty intact; both evidence files ≥3KB.

---

## 13. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Option **B LOCKED (RETAIN AS-IS LIVE)** Nest `hrm_contract_templates` open catalog for **AC-PLT-CTR-01** (CREATE N+1 / mã 9+). Starter-8 ≠ ceiling (**AC-PLT-CTR-06**). Freeze issued `template_code` (**AC-PLT-CTR-04**). Invent KEY **`HRM-CTR-TPL-KEY`**. DnD **OUT** cite **AC-PLT-CTR-03**. Clause body **RETAIN peer — cấm reopen**. ba-data **HOLD**. ba-process **UNLOCK**. BE/FE **HOLD**. Honesty false · C-SLICE · no `apps/**` · no seed · no printable flip. |
| **next_owner** | **ba-process** |
| **next_dispatch_prompt** | See evidence handoff § next_dispatch_prompt |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-sa-01.md` |
