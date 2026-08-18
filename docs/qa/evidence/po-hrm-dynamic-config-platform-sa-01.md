# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SA-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **Date** | 2026-08-07 |
| **ack_status** | **PASS_TO_PM** |
| **ADR** | [`docs/architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) |
| **Honesty** | No UAT / Phase1 flip · `contracts_printable_ready=false` · **no** `apps/**` |

---

## 1. read_first ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/program/PO_HRM_DYNAMIC_CONFIG_PLATFORM_01.md` | Charter principles + MISA/Base anchors |
| 2 | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md` | Open catalog; starter ≠ enum |
| 3 | `PO_HRM_CONTRACT_LEGAL_PRINT_PROGRAM.md` + XEVN-TPL CORR/DATA/API + print-spine TechSpec | AS-IS spine must_keep |
| 4 | `ADR-METADATA-APPLY-CONSUMERS-DELTA` · `ADR-HRM-CONTRACT-LIBRARY-GROUP-PUBLISH` · `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE` · `ADR-HRM-ATTENDANCE-CFG-PERSIST` · JD-DYNAMIC-ARCH-01 | Existing patterns |
| 5 | Public MISA/Base principles (help summaries in charter — no paywall scrape) | Merge fields · classification CRUD · DOCX vars |

---

## 2. Optioning summary

| Option | Verdict |
|--------|---------|
| **A** Extend clause+template tables only | Reject — fails cross-HR sponsor ask; debt |
| **B** Unified Catalog + FormSchema + MergeToken | **RECOMMEND** |
| **C** DOCX-upload-first (Base) as primary | Reject GĐ1 — breaks print-spine GWC; optional GĐ2 under B |

**Authoring lock under B:** clause-DnD-first (XeVN + MISA hybrid). DOCX = secondary compiler later.

---

## 3. Locks delivered

- Clause + template structure = **data**
- Starter X.E / 8 `XEVN_*` ≠ closed enum
- must_keep: multi-tenant scope · soft-delete · UF-HRM-02 · print-spine GWC · XBOS catalog governance (legal bodies in-HRM) · U65
- Domain map: EMP · REC · ATT · PAY · CTR · catalogs · Settings

---

## 4. Closed / residual

### Closed
- SA research + ADR Option B recommend
- Trade-off matrix + failure modes + validation plan V1–V6
- Explicit supersede of “platform = contracts-only” and “DOCX-only GĐ1”

### Residual (not this seat)
- BA-01 capability matrix + AC (peer)
- Sponsor CONFIRM Option B
- TECH/DATA platform physicalize
- Contract CORR BE open-catalog (in flight — vertical of platform)
- MergeToken auto-register from employee custom fields (V3 may stage)

### Forbidden claims
- Phase1 DONE · any `*_uat_ready=true` · invent closed enums · `apps/**` edits

---

## 5. completion_report

**Closed:** ADR `ADR-HRM-DYNAMIC-CONFIG-PLATFORM` with Option **B** recommended; MISA/Base principles mapped; module application table; L1–L7 locks including DYNAMIC-LOCK alignment; validation plan; next_dispatch copy-ready.

**Open:** BA peer matrix · sponsor CONFIRM · TechSpec platform · no Dev unlock from this seat alone.

---

## 6. Handoff

- **next_owner:** `pm` → dispatch **ba-docs** after **ba-process BA-01** peer (or TECH if BA-01 already PASS + sponsor CONFIRM)
- **ack_status:** `PASS_TO_PM`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01
from_role: pm
to_role: ba-process
lane: governance
program: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01

read_first:
1. docs/architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md (Option B LOCK recommend)
2. docs/program/PO_HRM_DYNAMIC_CONFIG_PLATFORM_01.md
3. docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md + CORR-01
4. docs/qa/evidence/po-hrm-dynamic-config-platform-sa-01.md

task:
- Capability matrix EMP·REC·ATT·PAY·CTR·Catalogs·Settings: Catalog vs FormSchema vs MergeToken ownership
- AC measurable: open catalog (9th template), no closed enums, clause/structure as data, starter≠ceiling
- must_keep: UF-HRM-02 · print-spine GWC · soft-delete · scope · XBOS REF ≠ legal body · U65
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-ba-01.md
- cấm: apps/** · invent closed enums · UAT flip

exit: PASS_TO_PM · then pm may dispatch ba-docs DOC-DELTA + sa TECH-01 after sponsor CONFIRM B
```

### Alternate (after BA-01 + sponsor CONFIRM)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECH-01
from_role: pm
to_role: sa
lane: governance
read_first: ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md · BA-01 evidence · print-spine TechSpec · JD-DYNAMIC-ARCH-02
task: Platform TechSpec — ICatalog/IFormSchema/IMergeToken · HĐ vertical F.1 token deepen · no mega-EAV · must_keep GWC
exit: PASS_TO_PM · honesty printable=false
```
