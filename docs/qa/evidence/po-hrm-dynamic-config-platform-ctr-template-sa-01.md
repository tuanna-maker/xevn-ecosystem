# SA evidence — CTR template open catalog SoT Option/F.1

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-SA-01` |
| **from_role** | sa |
| **to_role** | pm → ba-process |
| **lane** | governance |
| **Date** | 2026-08-08 |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` (U88 continuous after CTR-CLAUSE-DOCS ACCEPT · clause `body_vi` RETAIN) |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-SA-01.md` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **verdict** | Option **B** LOCKED (RETAIN AS-IS LIVE Nest open catalog) |

---

## 1. Task recap

Narrow SA decision for **AC-PLT-CTR-01** focus — contract **template open catalog** (CREATE N+1 / mã 9+ · starter-8 ≠ ceiling):

- Option A/B/C: Settings vs Nest template table vs hybrid → **LOCK one** (cite AS-IS LIVE if RETAIN).
- Admin CREATE N+1 ≠ closed starter-8 ceiling · invent KEY class if consumer invent.
- must_keep: issued print version freeze · clause_ids layout cite peer CTR-03 DnD OUT or separate.
- OUT: DOCX GĐ2 · clause body reopen · ATT reopen · flip `contracts_printable_ready`.
- ba-data UNLOCK vs HOLD · draft AC-PLT-CTR-TPL-* stubs.
- Template: ADR_OPTION_TEMPLATE · RETAIN clause seat — **cấm reopen clause invent** · **cấm flip printable**.

HARD EXIT GATE: both files written and verified ≥ 3KB (see §7). Empty seat = INVALID.

---

## 2. Evidence read (grounding — not assumption)

| Source | Fact established |
|--------|------------------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` §2.5 · §3.2 · AC-PLT-CTR-01/03/04/06 · BR-CTR-TPL-DYN-01..07 | Open catalog CRUD 9+; starter 8 not max; freeze on issue; DnD separate; soft warn ≠ block |
| `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md` | `hrm_contract_templates` = open catalog; bootstrap 8 optional; CODE-INVALID ≠ not-in-8; printable=false |
| `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md` | SUPERSEDE closed enum / FORBIDDEN 9th; AC-CTR-XEVN-11 = Settings 9th; BR-CTR-TPL-DYN-01..07 authoritative |
| `migrations/20260806_contract_legal_print.sql` | Nest **`hrm_contract_templates`** LIVE: code/name/pack/layout_json/keyword_map/status/version/archived_at; UQ `(company_id, lower(code)) WHERE archived_at IS NULL`; join `hrm_contract_template_clauses`; print_versions freeze spine |
| `migrations/20260807_contract_library_publish.sql` | Lineage `origin` / `lineage_code` on templates + publishes table LIVE |
| `contract-legal-print.service.ts` | `createTemplate` INSERT open code; `bootstrapXevnMatrixDrafts` upserts 8 starters ≠ ceiling; `replaceTemplateClauses` DnD LIVE; CODE-MEMORY: DROP CHK IN 8 · CREATE accepts 9th+ · printable=false |
| `contract-legal-print.constants.ts` | `HRM-CTR-TPL-CODE-INVALID` · `PACK-MISMATCH` · `TPL-NONE` · `TPL-404`; CODE-INVALID = format only |
| Peer `CTR-CLAUSE-SA-01` | Nest **PRESENT → RETAIN** class — **cite same heuristic** for templates; **cấm reopen** clause body invent this seat |
| Peer leave-balance / ATT CNS | Nest ABSENT = DEFINE — **class difference**; ATT seals **RETAIN** |
| Honesty program board | `contracts_printable_ready=false` · `payroll_e2e_ready=false` · **C-SLICE-≠-MODULE** · U65 |

**Key architectural finding:** template open catalog asked by AC-PLT-CTR-01 is **already implemented LIVE in Nest** (CORR-01 + createTemplate 9+ + starter bootstrap ≠ ceiling + freeze). This seat is **RETAIN + platform AC naming**, not a physicalize and not a printable promotion.

---

## 3. Decision summary

| Item | Result |
|------|--------|
| **Template catalog SoT** | **Nest `hrm_contract_templates`** — Option **B LOCK (RETAIN AS-IS LIVE)** |
| **Option A (Settings/XBOS sole)** | **REJECT** — dual SoT vs print-spine / freeze / DATA-02 Nest library |
| **Option C (hybrid / closed-8 / FE hardcode / mega-EAV / reopen / flip)** | **REJECT** |
| **Admin CREATE** | Open N+1 (mã 9+) — **≠** invent fail; CODE-INVALID = format only |
| **Starter 8** | Optional bootstrap — **≠ ceiling** (AC-PLT-CTR-06) |
| **Consumer invent** | When EFF>0 free-text → invent KEY **`HRM-CTR-TPL-KEY`** (BA may alias to TPL-404 with one-wire rule) |
| **Freeze** | **must_keep** issued `template_code` + layout/clause snapshot (AC-PLT-CTR-04) |
| **DnD layout** | **OUT** — cite peer **AC-PLT-CTR-03** |
| **Clause body** | **OUT** — peer CTR-CLAUSE RETAIN — **cấm reopen** |
| **ba-data** | **HOLD** |
| **ba-process** | **UNLOCK** |
| **BE/FE** | **HOLD** until BA |
| **Honesty** | printable / payroll e2e **false** · no module CTR UAT · C-SLICE |

---

## 4. Option evaluation (ADR condensed)

### Option A — Settings / XBOS = template SoT
Rejected: Nest already owns print-spine templates; moving SoT upstream creates dual writers and breaks freeze/`createTemplate` semantics; group publish already Nest-side library.

### Option B — Nest RETAIN open catalog — **LOCKED**
Selected: AS-IS LIVE matches BA-01 §3.2 and CORR/DYNAMIC-LOCK. Platform seat locks AC-PLT-CTR-01/04/06 semantics and invent KEY without migrating SoT.

### Option C — Hybrid / closed-8 / flip / reopen
Rejected: CORR-01 regression · seal churn · honesty violation · mega-EAV deny (Q-PLT-03).

**Weighted scores (spec §3):** A 38 · **B 120** · C 12.

---

## 5. Locks / OUT / invent stamp (audit checklist)

| Check | Status |
|-------|--------|
| L-CTR-TPL-01 Nest catalog SoT | LOCK |
| L-CTR-TPL-02 Admin ≠ consumer invent | LOCK · KEY=`HRM-CTR-TPL-KEY` |
| L-CTR-TPL-03 Starter ≠ ceiling | LOCK |
| L-CTR-TPL-04 CODE-INVALID format only | LOCK (RETAIN wire) |
| L-CTR-TPL-06 Issued freeze immutable | LOCK · must_keep |
| DnD AC-PLT-CTR-03 | OUT cite peer |
| Clause body_vi reopen | FORBIDDEN |
| ATT / leave-balance reopen | FORBIDDEN |
| Flip `contracts_printable_ready` | FORBIDDEN |
| DOCX GĐ2 | OUT |
| mega-EAV / apps/** / seed | FORBIDDEN |
| ba-data physicalize | HOLD |
| Empty seat | **DENIED** — both files written |

---

## 6. Draft AC stubs delivered to ba-process

Spec §10 delivers **AC-PLT-CTR-TPL-01..07 + H** and **VAL-CTR-TPL-01..03**, mapped to:

- TPL-01 → AC-PLT-CTR-01 (≡ AC-CTR-XEVN-11)
- TPL-02 → AC-PLT-CTR-06 (≡ AC-CTR-XEVN-01 revised)
- TPL-03 → AC-PLT-CTR-04
- TPL-04 → invent KEY / BR-PLT-02
- Honesty H row · U65 · C-SLICE

ba-process owns UF/J-* enumeration and wire alias decision (`HRM-CTR-TPL-KEY` vs document-as-alias of `HRM-CTR-TPL-404`).

---

## 7. HARD EXIT GATE — byte sizes

| File | Path | Size (bytes) |
|------|------|-------------:|
| Spec | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-SA-01.md` | **25116** |
| Evidence | `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-sa-01.md` | **10908** |

Measurement command (PowerShell):

```powershell
(Get-Item 'docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-SA-01.md').Length
(Get-Item 'docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-sa-01.md').Length
```

**Gate rule:** each file **≥ 3072 bytes (3KB)**. If either below → INVALID-HANDOFF.

### 7.1 Measured sizes (same session) — HARD EXIT **PASS**

| File | Bytes | ≥3KB |
|------|------:|:----:|
| Spec `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-SA-01.md` | **25116** | **PASS** |
| Evidence `po-hrm-dynamic-config-platform-ctr-template-sa-01.md` | **10908** | **PASS** |

Empty seat = INVALID — **DENIED** (both files on disk, both ≥3KB).

---

## 8. Honesty & seals retained

| Flag / seal | State |
|-------------|-------|
| `contracts_printable_ready` | **false** (DENIED flip) |
| `payroll_e2e_ready` | **false** |
| Module CTR UAT / Phase1 DONE | **DENIED** |
| `C-SLICE-≠-MODULE` | **RETAIN** |
| CTR-CLAUSE `body_vi` Option B | **RETAIN** — not reopened |
| Print-spine GWC slice | **RETAIN** |
| ATT leave-balance / SHIFT/CODE/WS | **RETAIN** |
| EMP / SI / PAY / DEC / MergeToken EXT | **RETAIN** |
| U65 zero-seed | **RETAIN** |

---

## 9. Risks & residual for next owner

| Residual | Owner | Note |
|----------|-------|------|
| Author full AC pack from stubs | ba-process | Include browser U65 click paths |
| Decide KEY vs TPL-404 one-wire | ba-process | Prefer explicit `HRM-CTR-TPL-KEY` for invent class clarity |
| Confirm any FE UX gap on 9th CREATE | ba-process → later FE/QA | BE HOLD until AC proves gap |
| DnD layout seat | future AC-PLT-CTR-03 | OUT this seat |
| ba-data | HOLD | Do not open DATA-01 unless AC proves schema gap |

---

## 10. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Closed: Option **B CONFIRMED (RETAIN AS-IS LIVE)** Nest `hrm_contract_templates` as open catalog SoT for AC-PLT-CTR-01 (admin CREATE N+1 / mã 9+; starter-8 ≠ ceiling AC-06; freeze AC-04; invent KEY `HRM-CTR-TPL-KEY`). Rejected A Settings/XBOS sole and C hybrid/closed-8/flip/reopen. ba-data **HOLD**. ba-process **UNLOCK**. BE/FE **HOLD**. DnD OUT cite AC-PLT-CTR-03. Clause body **cấm reopen**. Honesty false · C-SLICE · no apps/** · no seed · no printable flip. Residual: BA AC pack + KEY wire alias. |
| **next_owner** | **ba-process** |
| **next_dispatch_prompt** | `work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BA-01` · `from_role: pm` · `to_role: ba-process` · `lane: governance` · `change_mode: ADD` · `no_code: true` · Read SA Option B LOCK `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-SA-01.md` + evidence `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-sa-01.md` + BA-01 AC-PLT-CTR-01/04/06 · BR-CTR-TPL-DYN-* · peer CTR-CLAUSE BA RETAIN (cấm reopen body_vi). Author AC pack **AC-PLT-CTR-TPL-01..H** + VAL from SA stubs; lock invent KEY `HRM-CTR-TPL-KEY` (or one-wire alias to TPL-404); UF/J-* U65 browser paths; cite DnD OUT AC-PLT-CTR-03; must_keep freeze + UF-HRM-02 nullable; honesty contracts_printable_ready=false · C-SLICE; ba-data HOLD confirm; BE/FE HOLD; FORBIDDEN apps/** · seed · flip printable · reopen clause/ATT. Exit: CONFIRMED AC pack · PASS_TO_PM · evidence ≥3KB. |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-sa-01.md` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 11. Architecture diagram (logic)

```text
Admin Settings ──CREATE N+1──► hrm_contract_templates (Nest SoT · RETAIN)
                                      │
                 starter 8 bootstrap ─┘ (optional ≠ ceiling)
                                      │
Consumer picker (EFF>0) ──bind──► template_code
     invent free-text ──► HRM-CTR-TPL-KEY (FAIL)
                                      │
Issue ──freeze──► print_versions.template_code + layout/clause snapshot
Later template edit ──► does NOT mutate issued (AC-PLT-CTR-04)
DnD clause_ids ──► peer AC-PLT-CTR-03 (OUT)
Clause body_vi ──► peer CTR-CLAUSE RETAIN (OUT reopen)
```
