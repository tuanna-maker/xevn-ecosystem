# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01-SA-DOC

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01-SA-DOC` |
| **from_role** | sa |
| **lane** | governance |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01` |
| **Date** | 2026-08-07 |
| **ack_status** | **PASS_TO_PM** |
| **Honesty** | `contracts_printable_ready=false` · **no** `apps/**` · **no** claim printable UAT |
| **BE gate** | **Do not block** BE dynamic in flight — no blocking drift |

---

## 1. Audit — program TECH / API / DATA vs open catalog

| Artifact | CORR-01 `@CHANGE` | Verdict |
|----------|-------------------|---------|
| `…-TECHSPEC-01.md` | Option A open catalog · Option D CHK IN (8) **FORBIDDEN** · AC-11 | **ALIGN** — no re-close |
| `…-API-01.md` | TPL-02 open upsert · CODE-INVALID=format · AC-11 | **ALIGN** |
| `…-DATA-01.md` | Remove FORBIDDEN 9th · REMOVE CHK IN (8) · VAL-06/07 revise | **ALIGN** |
| `…-SPEC-01.md` | Starter 8 examples · AC-11 | **ALIGN** |
| `DYNAMIC-LOCK.md` | Authoritative open catalog + platform pointer | **ALIGN** |

**Soft residual (non-blocking):** program API-01 TPL-01 body still had historical «`code IN` 8-set» under `matrix=xevn`. **ADD** note on `@CHANGE CORR-01`: filter = `matrix_family='XEVN_MATRIX'` only — **not** closed list. Does **not** block BE.

---

## 2. Client blueprint — drift found & DOC-DELTA

### API_DESIGN_HRM_ENTERPRISE.md — **DRIFT → FIXED (ADD-only)**

| Prior (drift) | DOC-DELTA CORR-01-SA-DOC |
|---------------|-------------------------|
| F-CORE-CTR-TPL-02: `reject 9th XEVN_% → HRM-CTR-TPL-CODE-INVALID` | **SUPERSEDE** — format/slug only; CRUD 9+ (AC-11) |
| DOC-DELTA XEVN-TPL-API-01: must_keep «no 9th code» · unlock «Settings 8 rows» | **SUPERSEDE** cascade note → open catalog |
| TPL-01: `matrix=xevn` → «8 XEVN_*» as if ceiling | Clarified = starter-family filter; default list = open |

**KEEP:** F-CORE-CTR-* · CFG-01 · PREV/VER freeze · DATA-01/02 · printable=false.

### DB_DESIGN_HRM_ENTERPRISE.md — **no closed-enum prose**

§3.4a already UQ-open (no CHK IN 8). **ADD** CORR row + DOC-DELTA log: **FORBIDDEN** ship `CHECK code IN (8)` · pointer CORR-01 / DYNAMIC-LOCK / platform program.

### TECHSPEC_HRM_ENTERPRISE.md — **ADD** FR-09d matrix row

Pointer to CORR-01 + XEVN-TPL-TECHSPEC `@CHANGE` + platform program — **no wipe** CORE-09 spine row.

---

## 3. Platform program (pointer only)

| Program | Note |
|---------|------|
| [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-01`](../../program/PO_HRM_DYNAMIC_CONFIG_PLATFORM_01.md) | Clauses + structure + content also dynamic (MISA/Base principles); HĐ vertical = first slice of platform — **not** expanded this seat |

Cited on: DYNAMIC-LOCK (already) · client API/DB DOC-DELTA · TECHSPEC 09d row.

---

## 4. Out of scope / must_keep

- `apps/**` / migrate / seed
- Wipe F-CORE-CTR-* stubs
- Claim `contracts_printable_ready=true`
- Reopen Q-CTR-01/02 · redesign PDF
- Block BE dynamic for SA-DOC residual

---

## 5. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Closed: confirmed program TECH/API/DATA `@CHANGE CORR-01` = open catalog (no re-close). Client **API_DESIGN** had «reject 9th / no 9th» drift → ADD DOC-DELTA CORR-01-SA-DOC (TPL-01/02 + log). Client **DB_DESIGN** had no closed-enum text → ADD FORBIDDEN CHK + pointer. Client **TECHSPEC** ADD FR-09d open-catalog pointer. Platform `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` pointer only. Soft non-blocking note on program API TPL-01 historical `code IN`. Honesty `contracts_printable_ready=false`. Residual: ba-docs FR-09d wording «8 mẫu» if still exclusive in SRS client body; FE Settings CRUD 9+; QA AC-CTR-XEVN-11 U65. |
| **next_owner** | **pm** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-corr-sa-doc-01.md` |
| **next_dispatch_prompt** | See below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01 (continue)
from_role: pm
to_role: pm
lane: orchestration

SA-DOC CORR client pointers DONE (PASS_TO_PM).
- Program TECH/API open catalog ALIGN — do NOT re-dispatch sa for enum.
- BE dynamic already in flight — CONTINUE (no SA block).
- Optional parallel: ba-docs DOC-DELTA FR-UC-BP-CORE-09d «8 mẫu» → «catalog động + starter 8» (no wipe CORE-09*).
- After BE READY_FOR_QA: QA AC-CTR-XEVN-11 U65 (Settings tạo mẫu 9+ → F5 → picker).
- Keep contracts_printable_ready=false.
```
