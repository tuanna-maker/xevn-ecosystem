# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01` |
| **role** | ba-process |
| **date** | 2026-08-07 |
| **ack_status** | **PASS_TO_PM** |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` |
| **program** | `docs/program/PO_HRM_DYNAMIC_CONFIG_PLATFORM_01.md` |

---

## completion_report

### Closed

1. **Capability matrix** 7 domains: EMP · REC · ATT · PAY · CTR · CATALOG · SETTINGS — AS-IS hardcode risk (H/F/O/S) vs TO-BE (catalog / schema / merge / clause).
2. **Shared platform pattern** BR-PLT-01..06 (custom field → merge token; picker SoT; freeze; soft-delete; starter ≠ ceiling; XBOS SoT).
3. **Contract vertical detail:** template CRUD open catalog · clause library · layout over time · version freeze · merge tokens — aligned **CORR-01 / DYNAMIC-LOCK** (cấm closed enum 8).
4. **AC U65 examples:** AC-PLT-CTR-01..06 (template 9 · edit clause · reorder · freeze · custom merge token) + PAY/REC/EMP/CAT/SET pointers; map AC-CTR-XEVN-11.
5. **Non-goals Phase1:** MISA AI generation; DOCX upload default → GĐ2 unless SA Option; no printable claim; no full HĐ paste.
6. **Honesty:** `contracts_printable_ready=false` · no `apps/**` · no contradict open catalog.

### Residual

| Residual | Owner |
|----------|-------|
| Sponsor CONFIRM matrix | PM |
| SA ADR Option A/B/C (syntax merge, storage, DOCX GĐ) | sa (`…-SA-01`) |
| ba-docs DOC-DELTA FR-09d «8» → open catalog + starter | ba-docs after CONFIRM |
| Q-PLT-01..05 open | SA / sponsor |
| Impl CTR 9th / clause / DnD | Dev lanes (already in flight — not this seat) |

### Must_keep verified in matrix

- CORR-01 open catalog + AC-CTR-XEVN-11
- UF-HRM-02 · print-spine freeze · Q-CTR-01/02 CLOSED
- JD-DYNAMIC pattern as reference vertical #2
- XBOS catalog publish/pull
- U65 zero-seed

---

## Read ack

| Artifact | Used |
|----------|------|
| `PO_HRM_DYNAMIC_CONFIG_PLATFORM_01.md` | Principles MISA/Base + XeVN draft |
| `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md` | Open catalog lock |
| `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md` | Supersede closed enum · BR-DYN · AC-11 |
| FR-UC-BP-CORE-09 / 09d (Enterprise SRS v0.19) | Print spine + matrix AC (delta wording residual ba-docs) |
| E2E EMP/ATT/PAY-CFG + JD-DYNAMIC SPEC | AS-IS risk stamps |
| SPEC-01 clause library C.1–C.3 | Clause + freeze BR |

---

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SA-01
from_role: pm
to_role: sa
lane: governance
program: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01

read_first:
1. docs/program/PO_HRM_DYNAMIC_CONFIG_PLATFORM_01.md
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md
3. docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md
4. docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md
5. docs/qa/evidence/po-hrm-dynamic-config-platform-ba-01.md

task:
1. ADR Option A/B/C for metadata platform (catalog+schema+merge+clause) — storage, merge token syntax (Q-PLT-01), DOCX GĐ1 vs GĐ2 (Q-PLT-02 default GĐ2), custom-field table strategy (Q-PLT-03).
2. Align CTR open catalog CORR-01 — cấm closed enum 8; recommend rollout order after CTR (BA default: PAY-COMP bind → EMP custom fields).
3. Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-sa-01.md
4. Honesty: contracts_printable_ready=false · no apps/** · no claim printable ready
5. After ADR + BA matrix: PM present sponsor CONFIRM → then ba-docs DOC-DELTA FR-09d open-catalog wording

exit: PASS_TO_PM
```

**Alternate (after sponsor CONFIRM only):**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DOCS-01
to_role: ba-docs
task: DOC-DELTA Enterprise SRS — FR-09d catalog động + starter 8 (no wipe 09/09a–c); pointer FR-PLT platform index optional; contracts_printable_ready=false; no apps/**
```

---

## Evidence checklist

- [x] Capability matrix path written
- [x] CTR vertical CRUD / clause / layout / freeze / merge
- [x] AC U65 examples
- [x] Non-goals Phase1
- [x] CORR-01 aligned (open catalog)
- [x] No apps/** · no full HĐ paste · printable false
- [x] next_dispatch_prompt copy-ready
