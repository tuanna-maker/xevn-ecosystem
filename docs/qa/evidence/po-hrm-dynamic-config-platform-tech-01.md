# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECH-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECH-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **Date** | 2026-08-07 |
| **ack_status** | **PASS_TO_PM** |
| **TechSpec** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md) |
| **ADR** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) **CONFIRMED Option B** |
| **Honesty** | No UAT / Phase1 flip · `contracts_printable_ready=false` · **no** `apps/**` |

---

## 1. read_first ack

| # | Artifact | Used |
|---|----------|------|
| 1 | ADR-HRM-DYNAMIC-CONFIG-PLATFORM (CONFIRMED B · L1–L7) | Platform option + locks |
| 2 | PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01 | BR-PLT-01..06 · AC-PLT-* · domain matrix |
| 3 | PO_HRM_DYNAMIC_CONFIG_PLATFORM_01 | Charter principles |
| 4 | XEVN-TPL CORR-01 + DYNAMIC-LOCK | Open catalog · no closed enum 8 |
| 5 | PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01 + XEVN-TPL-TECHSPEC | Print-spine must_keep GWC |
| 6 | JD-DYNAMIC-ARCH-01 | FormSchema vertical #2 pattern |

**sponsor_confirm:** Option B CONFIRMED 2026-08-07 (Catalog + FormSchema + MergeToken · clause-DnD-first).

---

## 2. Delivered

| Item | Path / statement |
|------|------------------|
| Platform TechSpec | Catalog · FormSchema · MergeToken interfaces · versioning · scope · soft-delete |
| CTR vertical first | Open template catalog · clause library · layout_json · freeze · keyword_map↔tokens |
| Rollout map | ATT/PAY/REC/EMP/SETTINGS/XBOS — **interfaces only GĐ1** (except CTR deepen + REC must_keep) |
| Q-PLT-01..05 | Closed in TechSpec §7 (`{{token}}` GĐ1 · DOCX GĐ2 · domain tables · XBOS boundary · PAY then EMP) |
| must_keep | UF-HRM-02 · print-spine · soft-delete · XBOS group REF · U65 · no closed enum 8 · Q-CTR CLOSED · BR-CD-F5-01 |

---

## 3. Option / architecture summary

- **Selected:** Option B — shared **interfaces** + specialized domain tables (anti mega-EAV).
- **Authoring:** clause-DnD-first; DOCX = GĐ2 compiler into same schema/token graph.
- **CTR:** Platform lens on existing print-spine — **no** PDF redesign.
- **Merge resolve GĐ1:** MergeToken wins when present; fallback `keyword_map` (ADR rollback).

---

## 4. Closed / residual

### Closed
- Platform TechSpec CONFIRMED for governance cascade
- Contract vertical deepen rules aligned CORR + print-spine
- Cross-module interface rollout map
- Open questions Q-PLT-01..05 decided

### Residual (not this seat)
- **ba-data** physical: `hrm_merge_tokens` (name TBD) + open TPL constraints (no CHK IN 8); CTR-first EXPAND acceptable if MergeToken staged
- API F.1 for F-PLT-TOK-* (CTR CORR APIs may proceed in parallel)
- ba-docs FR-PLT / FR-09d wording DOC-DELTA
- Dev/QA only after DATA+API per vertical
- V3 custom-field→token may stage after registry physical

### Forbidden claims
- Phase1 DONE · any `*_uat_ready=true` · `contracts_printable_ready=true` · `apps/**` edits

---

## 5. completion_report

**Closed:** TechSpec platform Option B — three registries, versioning/scope/soft-delete, CTR vertical deepen (open catalog · clause · layout · freeze · tokens), rollout interfaces for ATT/PAY/REC/EMP/SETTINGS, Q-PLT closed, must_keep checklist, cascade unlock to ba-data.

**Open:** Physical DB_DESIGN + API deepen; no Dev unlock from this seat alone for shared MergeToken package; honesty flags remain false.

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **pm** → **ba-data** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-tech-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01
from_role: pm
to_role: ba-data
lane: governance
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
sponsor_confirm: Option B CONFIRMED 2026-08-07

read_first:
1. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md
2. docs/architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md (L1–L7)
3. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md
4. docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md + DATA-02 + XEVN-TPL-DATA-01 (@CHANGE CORR)
5. docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md (must_keep spine)

task:
1. Physical DB_DESIGN delta for platform:
   - hrm_merge_tokens (or equiv name) columns/FK/index/UQ/soft-delete/scope
   - Confirm CTR open catalog: NO CHK IN (8); UQ (company_id, lower(code)); pack ∈ configured
   - Map ICatalogRow / IFormSchema / IMergeToken → domain tables (CTR first; REC rec_jd_* adapter note)
2. CTR-first EXPAND OK if MergeToken table staged in same or immediate follow-on DATA
3. DTO↔column sketch for F-PLT-TOK + TPL keyword_map coexistence
4. Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-data-01.md
5. Honesty: contracts_printable_ready=false · no apps/** · no UAT flip

exit: PASS_TO_PM · next sa/API or CTR API deepen · unlock Dev only after DATA+API F.1
must_keep: UF-HRM-02 · print-spine · soft-delete · XBOS legal-body boundary · U65 · DYNAMIC-LOCK
```

---

## 7. Scope parity / journey note (U19)

- Platform registries **must** use same scope resolver as owning module list/get.
- Proposed journeys remain BA/ba-docs: `J-HRM-CTR-07` (9th template) + reuse CTR-04..06; no UAT flip from this evidence.
