# PCOMP-W7-BA-DATA-01 — Mobile W7 data contracts

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W7-BA-DATA-01` |
| **from_role** | ba-data |
| **to_role** | pm → dev-be / dev-mobile (W7-1..W7-5) |
| **partner** | `PCOMP-W7-BA-SRS-01` (ba-process) |
| **date** | 2026-06-07 (ICT) |
| **ack_status** | **PASS_TO_PM** |
| **program** | `P1-MOBILE-W7` · U51 |

---

## 1. Deliverables

| Artifact | Path |
|----------|------|
| Data contracts (SoT) | `docs/hrm/MOBILE_W7_DATA_CONTRACTS.md` |
| TechSpec index | `docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md` |
| Governance evidence | This file |

---

## 2. Closed scope

- Field matrices: `avatar_url`, `leave_attachment` (`attachment_url`), `leave_balance`, employee directory projection, celebration DOB privacy.
- API request/response JSON examples for each area (upload, PATCH avatar, leave create, leave balance GET, directory list/detail, home celebrations).
- Traceability: `employees.custom_fields.date_of_birth` ↔ catalog `date_of_birth`; `phone_number`; avatar column vs legacy JSONB.
- Validation IDs: `VAL-W7-AVT-*`, `VAL-W7-LATT-*`, `VAL-W7-LBAL-*`, `VAL-W7-DIR-*`; BR-BDAY consolidation.
- Traceability matrix §8 linking W7 waves → UC → J-* → API → DB → mobile screen.
- Implementation baseline table (avatar done; attachment/balance/directory pending).

---

## 3. Residual (PM dispatch)

| ID | Gap | Owner | Trigger |
|----|-----|-------|---------|
| R-W7-DC-01 | `leave_requests.attachment_url` migration + DTO | dev-be | `PCOMP-W7-MOB-LEAVE-DOC` |
| R-W7-DC-02 | `employee_leave_balances` + `GET /attendance/leave-balance` | dev-be | `PCOMP-W7-MOB-LEAVE-BAL` |
| R-W7-DC-03 | `GET /employees?view=directory` projection | dev-be | `PCOMP-W7-MOB-DIRECTORY` |
| R-W7-DC-04 | Celebrations SQL populate `home/summary` | dev-be | `PCOMP-W7-MOB-04b` |
| R-W7-DC-05 | SRS delta UC if/else (partner) | ba-process | `PCOMP-W7-BA-SRS-01` in-flight |

---

## 4. QA grep probes (copy-ready)

```bash
# DOB privacy — home summary must not leak full DOB
pnpm --filter hrm-api test -- home.service.spec.ts

# Avatar column in employee map
rg "avatar_url" apps/api/hrm-api/src/employees/employees.service.ts

# Forbidden mobile export of date_of_birth in celebrations fixtures (post W7-1)
rg '"date_of_birth"|birth_year' apps/mobile/hrm-mobile/src/features/dashboard --glob '*.tsx'
```

Expected after W7-1: celebrations fixtures contain `month_day` only; grep on Dashboard **no** `date_of_birth`.

---

## 5. Handoff

**next_owner:** pm  
**pm_dispatch_hint:** Unblock `PCOMP-W7-MOB-04b`, `PCOMP-W7-MOB-LEAVE-DOC`, `PCOMP-W7-MOB-LEAVE-BAL`, `PCOMP-W7-MOB-DIRECTORY` — cite `MOBILE_W7_DATA_CONTRACTS.md` § in bus DISPATCHED.

**completion_report:** Published W7 data contract pack with five field domains, JSON envelopes, catalog/custom_fields trace, scope parity rows, and implementation baseline. Partner SRS (`PCOMP-W7-BA-SRS-01`) remains in-flight for UC narrative.

**evidence_path:** `docs/program/governance/pcomp-w7-ba-data-01-20260607.md`
