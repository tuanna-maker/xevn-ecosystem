# Evidence — `PO-HRM-CONTRACT-LEGAL-PRINT-SA-02`

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-SA-02` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance · docs-only |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-QC-01` GWC · CONDITION **Q-CTR-01** |
| **change_mode** | ADD |
| **Verdict** | **PASS** — Q-CTR-01 architecture **LOCKED Option A** |
| **ack_status** | `PASS_TO_PM` |
| **Honesty** | `contracts_printable_ready=false` · **DENIED** printable module UAT |
| **apps/** | **none** · print-spine GWC **must_keep** (no wipe) |

---

## Entry audit

| Artifact | SA action |
|----------|-----------|
| `po-hrm-contract-legal-print-qc-01.md` CONDITION Q-CTR-01 | Intake — P2 CONDITION owner SA |
| `PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md` OPEN-Q | Stamp Q-CTR-01 → LOCKED Option A |
| `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md` residual | Pointer to SA-02 physical next |
| ADR scope ladder / main↔holding | Reused for holding persist partition |
| catalog-sync pull≠apply | Pattern reused **in-HRM** (not `synced_catalogs`) |

---

## Deliverables

| # | Path | Content |
|---|------|---------|
| 1 | `docs/architecture/ADR-HRM-CONTRACT-LIBRARY-GROUP-PUBLISH-20260807.md` | Option A/B/C · trade-off · publish/pull/apply · override · scope_parity · version freeze |
| 2 | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SA-02.md` | DB sketch · F.1 PUB/PULL/APPLY (Mục đích · Nghiệp vụ · SRS 09a) · errors · must_keep |
| 3 | TechSpec §13 / DATA §8 | Q-CTR-01 stamp LOCKED |

---

## Decision summary

| Lock | Value |
|------|--------|
| Option | **A** — in-HRM `hrm_contract_library_publishes` + member pull/apply + lineage on TPL/CL |
| Reject | B live holding merge · C XBOS catalog key for legal bodies |
| Publish SoT | `holding` via ADR persist helpers |
| Consume | Local active after apply only — PREV/VER unchanged |
| Override | `member_override` skip on re-pull unless `force` |
| Print-spine GWC | **Preserved** |
| Honesty | `contracts_printable_ready=false` |

---

## API F.1 map (short)

| F-id | Path | SRS 09a |
|------|------|---------|
| F-CORE-CTR-PUB-01 | `POST …/contract-library/publishes` | #3 active → freeze |
| F-CORE-CTR-PUB-02 | `GET …/contract-library/publishes` | #1 list releases |
| F-CORE-CTR-PULL-01 | `POST …/contract-library/pull` | #1–#2 draft upsert |
| F-CORE-CTR-APPLY-01 | `POST …/contract-library/apply` | #3 activate lineages |

---

## Residual

| ID | Status | Owner |
|----|--------|-------|
| Q-CTR-01 architecture | **CLOSED** | — |
| Q-CTR-01 physical DB/API DOC-DELTA | **CLOSED** | [`DATA-02`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md) CONFIRMED |
| Q-CTR-01 BE/FE implement | **OPEN** | **dev-be** (PM dispatch `PO-HRM-CONTRACT-LEGAL-PRINT-BE-02`) |
| Q-CTR-02 PDF binary | OPEN CONDITION | sa/devops (unchanged) |
| Printable module UAT | **DENIED** | — |

---

## completion_report

Closed Q-CTR-01 **architecture**: ADR Option A (holding publish freeze → member pull ≠ apply → local preview/print) with scope_parity and member_override rules; TechSpec ADD SA-02 F.1 + DB sketch; stamped TECHSPEC/DATA OPEN-Q. No `apps/**`. Print-spine GWC untouched. `contracts_printable_ready=false`. Residual: ba-data physicalize publish table + lineage columns, then BE/FE.

## next_owner

**pm** → dispatch **ba-data** (`PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02` or reuse DATA seat) then **dev-be**.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02
from_role: pm
to_role: ba-data
lane: governance
change_mode: ADD
parent: PO-HRM-CONTRACT-LEGAL-PRINT-SA-02 PASS_TO_PM
honesty: contracts_printable_ready=false
must_keep: print-spine GWC · UF-HRM-02 · F-CORE-CTR-* spine · DATA-01 tables
forbidden: apps/** · synced_catalogs dual-write · wipe GWC · invent printable UAT · seed

read_first (ordered):
1) docs/architecture/ADR-HRM-CONTRACT-LIBRARY-GROUP-PUBLISH-20260807.md
2) docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SA-02.md
3) docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md
4) docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md §13 Q-CTR-01 LOCKED

entry_criteria:
- Q-CTR-01 Option A LOCKED (publish→pull→apply)
- SA-02 DB sketch + F.1 PUB/PULL/APPLY present

task:
1) Physicalize ADD `hrm_contract_library_publishes` (UQ tenant+publish_version, checksum, payload_json, soft-delete)
2) EXPAND lineage cols on `hrm_contract_templates` + `hrm_contract_clauses` (+ pack_rules if needed): origin, origin_company_id, origin_publish_version, lineage_code + indexes
3) Optional pull_audits table OR platform-audit pointer — pick one, CONFIRMED
4) Alias map + VAL-* for PUB-EMPTY / CODE-CONFLICT / NOTHING-TO-APPLY / override skip
5) Client DOC-DELTA pointer only (DB_DESIGN + API_DESIGN) — no wipe F-CORE-CTR-01 / CORE-09
6) Confirm F.1 paths physical prefer `/api/hrm/contracts-insurance/contract-library/*`
7) Evidence: docs/qa/evidence/po-hrm-contract-legal-print-data-02.md
8) next_dispatch_prompt for dev-be implement PUB/PULL/APPLY + scope_parity jest

exit_criteria:
- Status CONFIRMED physical plan
- Q-CTR-01 residual = Dev unlock after sponsor/PM only
- honesty false
ack_status: PASS_TO_PM
```

---

## pm_dispatch_hint

`PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02` — ba-data physicalize group publish; then BE; keep printable ready false; Q-CTR-02 still open P2.
