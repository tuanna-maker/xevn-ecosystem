# Evidence — DOC-ENT-TS-01

| Field | Value |
|-------|--------|
| **work_item_id** | `DOC-ENT-TS-01` |
| **role** | sa (governance) |
| **date** | 2026-08-03 |
| **deliverable** | `docs/brand-new-documents-20270801/TECH_SPEC_NEW.md` **v1.1** |
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | ba-data (DB) · sa co-own API |

---

## spec_read_ack

| Artifact | Sections / use | Version note |
|----------|----------------|--------------|
| `SRS_NEW.md` | §2.3 spine · §3.2 eleven deep FRs · §3.3 AC-HRM-EMBED-01..05 · §3.4 AC-HRM-MOB-* · §3.6 events · §4 NFR · §6 BR | **v1.1** — locked `ref_srs` |
| `docs/qa/evidence/doc-ent-srs-01.md` | P0 FR list · gap closures · residual SA | handoff intake |
| `TECH_SPEC_NEW.md` (prior v1.0) | English infra dump §1–9 | **replaced** by lean v1.1 |
| `hrm-business-completeness-audit-20260524.md` | Embed EG/TR · stub 27 · scope list↔detail | arch implications only → TS-EMB-* + scope_parity |
| `ENTERPRISE_HRM_BUSINESS_ANALYSIS_REPORT.md` | Module landscape XBOS/HRM/Mobile/Portal | skim — informed boundaries |
| `docs/hrm/TECHSPEC.md` + `docs/xbos/TECHSPEC.md` (paths only) | Logical endpoint truthfulness | cited as existing paths — not pasted |
| `ADR-GROUP-CEO` / scope parity audit (paths) | main rollup vs member | §2.2 scope ladder |
| OS `13` TechSpec A–C / F | Architecture · API map by SRS step · DB logic; physical → separate files | applied lean; no column/DTO dump |
| `no_prompt_echo` | Client-facing body: no pipeline chat, no Writing Standards stamp, no audit filenames | **true** |

---

## What was cut (v1.0 → v1.1)

| Cut from prior draft | Why |
|----------------------|-----|
| Connection pool tables, PgBouncer essay | Ops detail — not FR-mapped |
| Redis catalog TTL digression as main body | Retained only as sync/cache note under B04 |
| Storage/S3/MinIO section | Out of P0 FR spine for NEW pack |
| Full Docker port matrix essay | Pointer-level topology only |
| Jobs/messaging long table | SLA reminder kept inside B03; events in §3 map |
| Mobile anti-spoof / Maps vendor essay | Deferred; M06 keeps offline idempotency only |
| “Traceability” stub without FR matrix | Replaced by §1 `ref_srs` table |

**Kept / added:** runtime short · scope ladder · module ownership · per-P0 FR API×Diễn biến · conceptual ERD/SM · NFR pointer · explicit DB/API next SoT · changelog.

**Line budget:** substantive lean pack (~200 lines body) vs prior infra essay.

---

## ref_srs coverage (exit #1)

| P0 FR | TS module | Mapped |
|-------|-----------|--------|
| FR-UC-B03 | TS-WF §4.1 | Yes |
| FR-UC-B04 | TS-CAT §4.2 | Yes |
| FR-UC-H01 | TS-EMP §4.3 | Yes (+ post-mutation) |
| FR-UC-H03 | TS-LEAVE §4.4 | Yes |
| FR-UC-H04 | TS-PAY §4.5 | Yes |
| FR-UC-HRM-21 | TS-EMB-EMP §4.6 | Yes · AC-HRM-EMBED-01 |
| FR-UC-HRM-25 | TS-EMB-CI §4.7 | Yes · AC-HRM-EMBED-03 · Q-INS-01 |
| FR-UC-HRM-27 | TS-EMB-DEC §4.8 | Yes · AC-HRM-EMBED-05 stub honesty |
| FR-UC-M01 | TS-MOB-AUTH §4.9 | Yes |
| FR-UC-M03 | TS-MOB-LEAVE §4.10 | Yes · AC-HRM-MOB-J03/J05 |
| FR-UC-M06 | TS-MOB-OFF §4.11 | Yes · AC-HRM-MOB-J06 |

AC packs EMBED-02/04 folded into §1 + embed sections. No UC invented outside SRS_NEW.

---

## Residual (for ba-data DB + sa API)

| Residual | Owner WI | Note |
|----------|----------|------|
| Physical columns / FK / index / soft-delete / RLS for §5 entities | **DOC-ENT-DB-01** ba-data | Must cite `ref_srs` FR rows |
| API_CONTRACT each function: Mục đích · Nghiệp vụ · bước SRS · DTO↔cột · error codes | **DOC-ENT-API-01** sa (+ ba-data sync) | Expand §4 logical paths — no invent UC |
| Q-INS-01 product waiver vs insurance list | Product / BA | Blocks “UC-HRM-25 đủ” claim only |
| BRD NEW alignment if DOC-ENT-BRD-01 still open | ba-docs / PM | **Non-blocking** — TechSpec proceeded on SRS alone; re-check when BRD lands |
| Full inventory UC (B01/H02/…) deep API rows | Optional later / phân hệ SoT | Out of lean NEW deep set by design |

**Does not** claim Phase 1 DONE / e2e_pass / PROD-READY.

---

## completion_report

**Closed:** Remastered `TECH_SPEC_NEW.md` to lean enterprise TechSpec v1.1 with `ref_srs` locked to SRS_NEW v1.1 for all eleven P0 deep FRs + embed/mobile AC packs; module boundaries; scope ladder; logical API map by Diễn biến; conceptual DB logic; cut English infra fluff; pointed DB_DESIGN_NEW / API_CONTRACT_NEW as next physical SoT.

**Residual:** ba-data DOC-ENT-DB-01; sa (+ ba-data) DOC-ENT-API-01; BRD alignment when BRD chốt; Q-INS-01 product.

---

## next_dispatch_prompt (copy-ready)

```text
work_item_id: DOC-ENT-DB-01 (+ chain DOC-ENT-API-01)
role_wave_1: ba-data
Mission: Upgrade docs/brand-new-documents-20270801/DB_DESIGN_NEW.md to physical SoT for entities in TECH_SPEC_NEW.md v1.1 §5 (employees, leave_requests/balances, payroll_periods/payslips, contracts/insurance, hr_decisions, workflow_*, catalog/synced_catalogs, membership/tenant). Columns · FK · index · soft-delete · tenant/company filters. ref_srs = SRS_NEW v1.1 FR-UC-B03,B04,H01,H03,H04,HRM-21,HRM-25,HRM-27,M01,M03,M06. No apps/**. Do not rewrite BRD/SRS/TECH_SPEC.

read_first: TECH_SPEC_NEW.md v1.1 §1 ref_srs + §4–5; SRS_NEW.md §3.2; evidence docs/qa/evidence/doc-ent-ts-01.md

exit: DB_DESIGN_NEW physical for P0 spine; evidence doc-ent-db-01.md; PASS_TO_PM with next_dispatch DOC-ENT-API-01 for sa (API_CONTRACT: mỗi function Mục đích · Nghiệp vụ · Tham chiếu bước SRS · DTO↔cột — co-own ba-data sync).

Parallel note: After DB draft stable, PM dispatch DOC-ENT-API-01 role=sa (ba-data review DTO↔column) — allowed_paths API_CONTRACT_NEW.md + evidence only.
```

**evidence_path:** `docs/qa/evidence/doc-ent-ts-01.md`  
**ack_status:** `PASS_TO_PM`
