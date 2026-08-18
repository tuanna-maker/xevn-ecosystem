# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02` |
| **from_role** | ba-data |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-07 |
| **change_mode** | ADD · docs-only · **no** `apps/**` · **no** migrate · **no** seed |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-SA-02` PASS_TO_PM |
| **honesty (team only)** | `contracts_printable_ready=false` — **DENIED** invent printable UAT · print-spine GWC **must_keep** |
| **program** | `PO-HRM-CONTINUOUS-W7-20260807` (W7.5) |
| **Status** | **CONFIRMED** physical plan |

---

## 1. spec_read_ack

| Artifact | Đọc / dùng |
|----------|------------|
| ADR | `ADR-HRM-CONTRACT-LIBRARY-GROUP-PUBLISH-20260807.md` Option A |
| SA-02 | `PO-HRM-CONTRACT-LEGAL-PRINT-SA-02.md` DB sketch + F.1 PUB/PULL/APPLY |
| DATA-01 | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md` — must_keep spine |
| TechSpec §13 | Q-CTR-01 **LOCKED** Option A |
| SA evidence | `po-hrm-contract-legal-print-sa-02.md` |
| Client DB/API | DOC-DELTA pointer only (no wipe §3.4a–d / F-CORE-CTR-01) |

---

## 2. Paths touched

| Path | Change |
|------|--------|
| [`docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md) | **ADD** SoT CONFIRMED — publishes · lineage · pull_audits · VAL-PUB-* · F.1 |
| [`docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | DOC-DELTA §3.4e/f + **inline lineage EXPAND on §3.4a/b/d** · footer |
| [`docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) | DOC-DELTA F.1 PUB/PULL/APPLY · §7.3 · footer |
| [`docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md) | §8 Q-CTR-01 residual → physical CONFIRMED DATA-02 (pointer) |
| [`docs/qa/evidence/po-hrm-contract-legal-print-sa-02.md`](./po-hrm-contract-legal-print-sa-02.md) | Residual: physical **CLOSED**; BE **OPEN** |

**Không đụng:** `apps/**` · `synced_catalogs` · wipe GWC / DATA-01 tables / F-CORE-CTR spine · seed.

---

## 3. Verdict — **CONFIRMED**

| Topic | Stamp |
|-------|--------|
| ADD publishes | `hrm_contract_library_publishes` · UQ `(tenant_id, publish_version)` · checksum · immutable `payload_json` |
| EXPAND lineage | templates + clauses + **pack_rules** · `origin` / `origin_company_id` / `origin_publish_version` / `lineage_code` |
| Pull audit | **ADD** `hrm_contract_library_pull_audits` — **CONFIRMED**; platform-audit-only **REJECTED** as sole SoT |
| VAL-* | VAL-PUB-01 EMPTY · 02 CODE-CONFLICT · 03 NOTHING-TO-APPLY · 04 override skip (+ 05..12) |
| F.1 paths | `/api/hrm/contracts-insurance/contract-library/publishes` · `…/pull` · `…/apply` |
| Print spine / honesty | must_keep GWC · `contracts_printable_ready=false` |
| Dev this seat | **NO** — unlock **dev-be** via PM |

---

## 4. completion_report

**Closed:** Physicalized Q-CTR-01 Option A — publish registry + lineage EXPAND + dedicated pull_audits + VAL-PUB matrix + F.1 `/contract-library/*` confirmed; client DB/API DOC-DELTA ADD-only; DATA-01/print-spine preserved; no apps/**; honesty false.

**Residual:** PM dispatch **dev-be** PUB/PULL/APPLY + scope_parity jest; FE Settings later; Q-CTR-02 PDF unchanged; printable module UAT DENIED.

---

## 5. next_owner / next_dispatch_prompt

**next_owner:** **pm** → **dev-be**

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-BE-02
from_role: pm
to_role: dev-be
lane: execution
change_mode: ADD
parent: PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02 PASS_TO_PM
honesty: contracts_printable_ready=false
must_keep: print-spine GWC · UF-HRM-02 · F-CORE-CTR-01..PDF · DATA-01 tables · BR-CTR-CL-01 snapshots
forbidden: synced_catalogs dual-write · live holding join at PREV · wipe GWC · invent printable UAT · seed for evidence

read_first (ordered):
1) docs/architecture/ADR-HRM-CONTRACT-LIBRARY-GROUP-PUBLISH-20260807.md
2) docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md
3) docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SA-02.md §4 F.1
4) docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md (spine must_keep)
5) docs/qa/evidence/po-hrm-contract-legal-print-data-02.md

entry_criteria:
- DATA-02 Status CONFIRMED
- Q-CTR-01 architecture LOCKED Option A

task:
1) ensureSchema ADD hrm_contract_library_publishes (UQ tenant_id+publish_version, checksum, payload_json, soft-delete)
2) EXPAND lineage cols on hrm_contract_templates + hrm_contract_clauses + hrm_contract_pack_rules
3) ADD hrm_contract_library_pull_audits; write on PULL-01
4) Implement F-CORE-CTR-PUB-01/02 · PULL-01 · APPLY-01 under /api/hrm/contracts-insurance/contract-library/*
5) Errors: HRM-CTR-PUB-EMPTY · CODE-CONFLICT · NOTHING-TO-APPLY · override skip (force) · scope 403/409
6) Overlay CL/TPL list response: origin · origin_publish_version · origin_company_id · lineage_code
7) Jest: scope_parity list↔get publishes; pull into foreign member FAIL; apply never mutates print_versions; VAL-PUB-01..04
8) CODE-MEMORY APPEND; evidence docs/qa/evidence/po-hrm-contract-legal-print-be-02.md
9) next_dispatch_prompt for QA or FE Settings (PM choose) — honesty false

exit_criteria:
- READY_FOR_QA (or PASS_TO_PM if FE still required first — state clearly)
- No seed in evidence
- Print-spine paths regression green
- contracts_printable_ready remains false
```

---

## 6. ack_status

**PASS_TO_PM**
