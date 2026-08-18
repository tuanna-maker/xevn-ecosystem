# Evidence — DOC-ENT-DB-01

| Field | Value |
|-------|--------|
| **work_item_id** | `DOC-ENT-DB-01` |
| **role** | ba-data (governance) |
| **date** | 2026-08-03 |
| **deliverable** | `docs/brand-new-documents-20270801/DB_DESIGN_NEW.md` **v1.1** |
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | sa (API_CONTRACT) · ba-data co-review DTO↔column |

---

## spec_read_ack

| Artifact | Sections / use | Version note |
|----------|----------------|--------------|
| `TECH_SPEC_NEW.md` | §5 thực thể logic · §4 FR API map (qua evidence DOC-ENT-TS-01) | **v1.1** per `doc-ent-ts-01.md` — **disk drift:** file hiện có thể còn stub EN ngắn; **không** sửa TechSpec trong WI này |
| `docs/qa/evidence/doc-ent-ts-01.md` | Entity list §5 · residual DB · ref_srs 11 FR | handoff intake |
| `SRS_NEW.md` | §3.2 FR-UC-B03,B04,H01,H03,H04,HRM-21,HRM-25,HRM-27,M01,M03,M06 — fields/validation | **v1.1** |
| `DB_DESIGN_NEW.md` (prior) | stub tenants/users + orphan columns | **replaced** by physical v1.1 |
| Nest DDL (read-only) | `employees.service` · `leave-requests` · `leave-balance` · `payroll.service` · `contracts-insurance` · `decisions` · `catalog-sync` · `foundation-schema` · `auth.service` · `config-sync` | **Truth stack** — không Prisma |
| `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` | cột / PK-FK / index shape | applied lean |
| OS `13` §F | Physical DB SoT riêng sau TechSpec | applied |

---

## prisma-align / stack truth notes

| Expectation (docs cũ / CLAUDE) | Reality (skim 2026-08-03) | Documented as |
|--------------------------------|---------------------------|---------------|
| Prisma `schema.prisma` | **0** file `*.prisma` under repo | DDL Nest `ensureSchema` |
| Logic names: `tenants`, `users`, `memberships`, `workflow_instances`, `payslips`, `leave_balances` | `xbos_tenant_registry`, `xbos_portal_user`, `xbos_user_tenant_membership`, `xbos_workflow_*`, `payroll_payslips`, `employee_leave_balances` | Alias table §1.3 |
| Soft-delete `deleted_at` mọi bảng | `employees.archived_at`; nhiều bảng chưa có soft-delete | Convention §1.1 + gaps |
| `company_id` UUID LE | **TEXT slug** trên HRM spine | Scope §1.2 · scope_parity |
| CCCD / DOB / salary cột typed | Trong `employees.custom_fields` JSONB | Gap D-EMP-JSON-01 |
| Payroll SM 6 bước SRS | DB CHECK `draft\|processed\|closed` | Gap D-PAY-SM-01 |
| Offline queue server | Client + idempotency middleware | §5 M06 — no new table |

---

## Deliverable checklist (exit)

| # | Criteria | Status |
|---|----------|--------|
| 1 | Physical columns/PK/FK/index/soft-delete/tenant·company for P0 spine | **PASS** — DB_DESIGN_NEW v1.1 |
| 2 | ERD mermaid core | **PASS** |
| 3 | FR-UC → tables mapping | **PASS** §6 |
| 4 | Explicit out-of-scope | **PASS** §7 |
| 5 | Version bump | **1.0 → 1.1** |
| 6 | No rewrite BRD/SRS/TechSpec/API; no apps/** | **PASS** |

---

## Residual (for DOC-ENT-API-01 + follow-ups)

| Residual | Owner WI | Note |
|----------|----------|------|
| API_CONTRACT mỗi function: Mục đích · Nghiệp vụ · bước SRS · DTO↔cột · error | **DOC-ENT-API-01** sa (+ ba-data sync) | Map đúng tên bảng vật lý §1.3 |
| Restore/confirm `TECH_SPEC_NEW.md` v1.1 on disk | PM / sa | D-TS-DRIFT-01 — non-blocking DB nếu evidence TS còn |
| Q-INS-01 FE list BH | Product / BA | Bảng `employee_insurance_records` đã có |
| Typed columns CCCD/DOB/salary | Future BE (sau API map) | Không invent migrate trong WI này |
| Payroll 6-step columns vs 3-status | sa in API_CONTRACT | Không bịa SM DB |
| `hr_decisions.deleted_at` | Optional density wave | AC-DEC-DENSITY |

**Does not** claim Phase 1 DONE / e2e_pass / PROD-READY / migrate applied.

---

## completion_report

**Closed:** Upgraded `DB_DESIGN_NEW.md` to lean **physical** SoT v1.1 for P0 spine entities from TechSpec §5 / SRS eleven deep FRs — aligned to Nest ensureSchema table names; ERD; soft-delete/audit/scope conventions; FR→table map; out-of-scope; honest gaps (Prisma absent, JSONB PII fields, payroll SM, M06 client-only).

**Residual:** DOC-ENT-API-01 (sa) with ba-data DTO↔column co-review; TechSpec disk drift; Q-INS-01; typed employee columns optional later.

---

## next_dispatch_prompt (copy-ready)

```text
work_item_id: DOC-ENT-API-01
role: sa
Mission: Upgrade docs/brand-new-documents-20270801/API_CONTRACT_NEW.md — mỗi function bắt buộc: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (UC + Diễn biến #) · Request/Response DTO↔cột DB · mã lỗi ổn định. Bám DB_DESIGN_NEW.md v1.1 (tên bảng vật lý §1.3) + TECH_SPEC_NEW §4 logical paths + SRS_NEW v1.1 eleven P0 FR. ba-data co-review DTO↔column trước PASS_TO_PM. Cấm invent UC ngoài spine. Cấm sửa apps/**.

read_first:
1. docs/brand-new-documents-20270801/DB_DESIGN_NEW.md v1.1
2. docs/qa/evidence/doc-ent-db-01.md
3. docs/brand-new-documents-20270801/TECH_SPEC_NEW.md §4 (hoặc restore v1.1 nếu disk drift) + evidence docs/qa/evidence/doc-ent-ts-01.md
4. docs/brand-new-documents-20270801/SRS_NEW.md §3.2 deep FRs

allowed_paths: API_CONTRACT_NEW.md · docs/qa/evidence/doc-ent-api-01.md
forbidden_paths: BRD_NEW · SRS_NEW · TECH_SPEC_NEW · DB_DESIGN_NEW · apps/**

exit: API_CONTRACT_NEW đủ F.1 cho P0 paths; evidence doc-ent-api-01.md; PASS_TO_PM; residual QA/Dev chỉ sau sponsor confirm pack.
```

**evidence_path:** `docs/qa/evidence/doc-ent-db-01.md`  
**ack_status:** `PASS_TO_PM`
