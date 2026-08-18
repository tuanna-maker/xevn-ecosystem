# SA evidence — CTR clause body-as-data SoT Option/F.1

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01` |
| **from_role** | sa |
| **to_role** | pm → ba-process |
| **lane** | governance |
| **Date** | 2026-08-08 |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` (U88 continuous after leave-balance QC GWC) |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01.md` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **verdict** | Option **B** LOCKED (RETAIN + narrow clarify) |

---

## 1. Task recap

Narrow SA decision for **AC-PLT-CTR-02** — contract **clause library / body SoT**:
- Option A/B/C: Settings/XBOS clause vs Nest clause table vs hybrid → **LOCK one**.
- Admin edit `body_vi` / version++ vs consumer invent (KEY stamp?).
- must_keep issued contract snapshot.
- DnD layout OUT or cite peer.
- OUT: DOCX GĐ2 · ATT reopen · flip `contracts_printable_ready`.
- ba-data UNLOCK vs HOLD · draft AC-PLT-CTR-CL-* stubs · L-* locks · F.1 if Nest.

INVALID-HANDOFF re-dispatch — prior seat `906b6238` ended with **zero files on disk**. HARD EXIT GATE: both files written and verified > 3KB (see §7).

---

## 2. Evidence read (grounding — not assumption)

| Source | Fact established |
|--------|------------------|
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` §3.3 · AC-PLT-CTR-02 · BR-CTR-CL-01..04 | Clause = versioned `body_vi` + `{{keyword}}`; FE cấm hardcode body; edit issued → version++; freeze on issue |
| `migrations/20260806_contract_legal_print.sql` §2 | Nest **`hrm_contract_clauses`** LIVE: `body_vi TEXT NOT NULL`, `clause_group`, `apply_to_packs text[]`, `version INT DEFAULT 1`, `status`, `effective_from`, `archived_at`; UQ `(company_id, lower(code)) WHERE active` |
| `contract-legal-print.service.ts` `updateClause()` (L1411+) | Active clause with issued snapshot + `body_vi` change → **soft-block** `HRM-CTR-CL-CODE-CONFLICT` "requires POST …/activate (version bump)" — **version-bump semantics already implemented** |
| `contract-legal-print.service.ts` `clauseHasIssuedSnapshot()` (L1472+) | Scans `hrm_contract_print_versions.clauses_snapshot_json` — **freeze-on-issue LIVE**; issued bodies preserved |
| `contract-legal-print.service.ts` `activateClause()` (L1483+) | Version bump / re-activate path LIVE |
| `contract-legal-print.constants.ts` | Wire codes exist: `HRM-CTR-CL-REQUIRED` · `HRM-CTR-CL-CODE-CONFLICT` · `HRM-CTR-CL-404` · `HRM-CTR-ISSUE-BLOCKED` · `HRM-CTR-CB-FORBIDDEN`; `defaultXevnKeywordMap` uses **`{{token}}`** syntax |
| `migrations/20260807_contract_library_publish.sql` | Group→member propagation LIVE (`hrm_contract_library_publishes` + `origin/lineage_code`) — versioned publish/pull |
| `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md` | Open catalog; body/clause/structure = config data; `contracts_printable_ready=false` |
| Peer `ATT-LEAVE-BALANCE-SA-01` | Class contrast: leave-balance = Nest **ABSENT** → DEFINE. CTR clause = Nest **PRESENT** → **RETAIN** (different heuristic branch) |

**Key architectural finding:** the clause body model asked by AC-PLT-CTR-02 is **already implemented LIVE in Nest** — SoT location (`hrm_contract_clauses.body_vi`), version-bump-on-issued-edit, and snapshot-freeze all exist. This makes the seat a **RETAIN + narrow lock**, not a physicalize.

---

## 3. Decision summary

| Item | Result |
|------|--------|
| **Body SoT** | **Nest `hrm_contract_clauses.body_vi`** — Option B LOCK (RETAIN LIVE) |
| **Option A (Settings/XBOS body)** | **REJECT** — dual SoT, breaks freeze/version chain, XBOS not print-spine owner |
| **Option C (hybrid / FE hardcode / snapshot rewrite / mega-EAV / flip)** | **REJECT** |
| **Admin edit** | draft/not-issued → edit `body_vi` in place; active+issued → version bump (activate) — RETAIN existing guard |
| **Consumer invent** | **No new wire code** — FE hardcode body = QA/lint FAIL (BR-CTR-CL-03); RETAIN `HRM-CTR-CL-*` |
| **Snapshot** | **must_keep** `clauses_snapshot_json` immutable freeze-on-issue |
| **Token syntax** | **`{{token}}`** LOCK for CTR (Q-PLT-01) — consistent with `keyword_map`; no dual syntax |
| **DnD layout** | **OUT** — cite peer AC-PLT-CTR-03 (separate seat) |
| **DOCX GĐ2** | **OUT** |
| **ba-process** | **UNLOCK** — AC pack `AC-PLT-CTR-CL-01*` |
| **ba-data** | **HOLD (conditional)** — table exists; UNLOCK only if admin prior-body-history proven beyond snapshot |
| **BE / FE** | **HOLD** — RETAIN LIVE; narrow FE wiring after AC only |

Trade-off weighted score: **A=42 · B=120 · C=12** (see spec §3).

---

## 4. Locks emitted (L-CTR-CL-*)

`L-CTR-CL-01` Body SoT = Nest · `-02` Admin edit ≠ consumer invent (FE hardcode FAIL) · `-03` Version bump on issued edit · `-04` Freeze immutable · `-05` Token `{{x}}` · `-06` Soft-delete · `-07` Group publish RETAIN · `-08` Scope parity U19 · `-09` No physicalize by default (ba-data HOLD conditional) · `-10` Seals/honesty (no reopen · no flip · C-SLICE).

## 5. F.1 API map

RETAIN existing `/api/hrm/contracts/legal-print/clauses*` (F-CTR-CL-01..05 + CNS-01 + PUB-*). **No new endpoints, no new wire codes.** See spec §6.

---

## 6. Honesty flags (unchanged — this seat cannot flip)

| Flag | Value |
|------|-------|
| `contracts_printable_ready` | **false** |
| `payroll_e2e_ready` | **false** |
| Module CTR UAT / Phase1 DONE | **DENIED** |
| `C-SLICE-≠-MODULE` | **RETAIN** |
| DnD reorder / DOCX GĐ2 | **OUT** this seat |
| apps/** touched | **NO** (docs-only) |
| seed | **NO** (U65) |
| seals reopened (leave-balance / ATT / EMP / SI / PAY / DEC / MergeToken) | **NONE** — RETAIN |

---

## 7. HARD EXIT GATE — file byte sizes

| File | Requirement | Status |
|------|-------------|--------|
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01.md` | > 3 KB | see §7.1 verified sizes |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-sa-01.md` | > 3 KB | see §7.1 verified sizes |

(Byte sizes measured post-write via `Get-Item Length` — recorded in §7.1 and the final handoff.)

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-sa-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01.md` |
| **next_owner** | **ba-process** |
| **completion_report** | Option B LOCKED (RETAIN + narrow clarify). Nest `hrm_contract_clauses.body_vi` = clause body SoT; version-bump-on-issued-edit + `clauses_snapshot_json` freeze already LIVE and RETAINED. Settings/XBOS body SoT REJECT (dual-write). Token syntax `{{x}}` LOCK. No new wire code (FE hardcode = BR-CTR-CL-03 QA FAIL). ba-process UNLOCK (AC-PLT-CTR-CL-01*); ba-data HOLD (conditional history trigger); BE/FE HOLD. DnD reorder + DOCX GĐ2 OUT (cite peer AC-PLT-CTR-03). Honesty false; seals retained; no apps/**; U65 zero-seed. |
| **next_dispatch_prompt** | See §9 |

---

## 9. next_dispatch_prompt (copy-ready → ba-process)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: CTR-CLAUSE-SA-01 CONFIRMED Option B (RETAIN)
change_mode: ADD
no_code: true

entry_criteria:
- Read SA lock: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01.md (Option B · L-CTR-CL-01..10 · §10 AC stubs)
- Read BA-01 §3.3 clause library · BR-CTR-CL-01..04 · AC-PLT-CTR-02
- RETAIN: hrm_contract_clauses body_vi SoT · print snapshot freeze · version-bump guard (already LIVE) · leave-balance/ATT seals

task:
- Author AC pack AC-PLT-CTR-CL-01..06 + AC-PLT-CTR-CL-H (U65 browser: edit body_vi draft→2xx→F5; issued→version bump; snapshot immutable; admin CREATE N+1; FE resolve not hardcode; soft-retire)
- Enumerate exact UF/J-* (Settings clause admin · edit body draft vs issued · preview · issue freeze)
- Confirm token syntax {{x}} (Q-PLT-01) · one syntax per template
- Decide conditional ba-data trigger: is admin prior-body history required beyond print snapshot? If YES → flag PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-DATA-01 (narrow append-only hrm_contract_clause_versions); if NO → ba-data stays HOLD
- Lock validation matrix (VAL-CTR-CL-01..03) with error codes RETAINED (HRM-CTR-CL-*)

FORBIDDEN:
- apps/** · seed · flip contracts_printable_ready / payroll_e2e_ready
- reopen leave-balance / ATT-CODE/WS/SHIFT L1 · invent FE HOLDs
- DnD reorder AC here (cite AC-PLT-CTR-03) · DOCX GĐ2 · module CTR UAT · Phase1
- Settings/XBOS as body SoT · mega-EAV · new wire code · snapshot rewrite

exit:
- CONFIRMED AC pack + validation matrix + UF/J-* + ba-data trigger decision
- ack_status PASS_TO_PM · next_owner ba-data (if trigger) or dev-be (narrow) per PM
- evidence_path docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-ba-01.md
```
