# PO-HRM-MVP-GD1-PAY-09-DATA-01 — `pay_payroll_group` DB_DESIGN §5.5

- **work_item_id**: `PO-HRM-MVP-GD1-PAY-09-DATA-01`
- **lane**: ba-data (docs-only — **no code**)
- **date**: 2026-08-18
- **unblocks**: `HRM-MVP-GD1-PAY-09-CLUSTER-01` (dev-be) — QUEUED until this file exists and is acked.
- **ack_status**: `PASS_TO_PM`

> **Honesty note**: no upstream spec names `pay_payroll_group`. `BA-CNTT-PAYROLL-CATALOG-ARCH-01.md`
> and `DB_DESIGN_NEW.md` were searched — neither contains the string `pay_payroll_group`, `payroll_group`,
> `5.5`, or `PAY-09`. This file is therefore written as a **proposal** for §5.5, not as a transcription of
> an existing section. Mark `PROPOSED` where the parent doc is silent.

---

## 1. Purpose

A **payroll group** (`pay_payroll_group`) is the unit that groups one or more pay runs
(`pay_run` / `pay_period`) under a single batch for a tenant+company+pay-cycle. It is the
**write-side anchor** for the PAY-09 cluster: every disbursement, payslip, and accounting
journal line of a batch references the group, never the bare period.

Why a separate table and not a column on `pay_run`:
- A batch can span multiple pay cycles (e.g. a 13th-month + regular batch processed together).
- A batch has its own lifecycle state independent of any single run.
- Audit: the group is the thing that gets approved, signed, and exported — the immutable
  evidence row.

## 2. Plane A/B rule (mandatory, do not violate)

Per `feedback_plane-ab-doctrine.md`:

| Rule | Application here |
|---|---|
| XBOS DB = master data | `company_id` resolves to XBOS `xbos_legal_entity`; HRM DB **never** FK to it |
| HRM DB has **no FK cross-plane** | `tenant_id`, `company_id` are `TEXT DEFAULT` — **not** UUID, **not** `REFERENCES` |
| Soft-delete only | `deleted_at TIMESTAMPTZ NULL`; **hard-delete forbidden** |
| Platform catalog rows cannot be hard-deleted by tenants | N/A — this is a tenant-scoped operational table, not a platform catalog |

## 3. Schema

```sql
CREATE TABLE pay_payroll_group (
  id                BIGSERIAL       PRIMARY KEY,
  tenant_id         TEXT            NOT NULL DEFAULT '',
  company_id        TEXT            NOT NULL DEFAULT '',

  code              TEXT            NOT NULL,               -- human batch code, e.g. 'PAY-2026-08-01'
  name              TEXT            NOT NULL DEFAULT '',
  pay_cycle_code    TEXT            NOT NULL DEFAULT '',     -- e.g. 'MONTHLY', 'BIMONTHLY', 'P13'
  period_from       DATE            NOT NULL,                -- inclusive
  period_to         DATE            NOT NULL,                -- inclusive

  status            TEXT            NOT NULL DEFAULT 'DRAFT',  -- see §5
  locked_at         TIMESTAMPTZ     NULL,
  approved_by       TEXT            NULL,
  approved_at       TIMESTAMPTZ     NULL,
  exported_at       TIMESTAMPTZ     NULL,

  total_employee_count   INTEGER   NOT NULL DEFAULT 0,
  total_gross_vnd        BIGINT    NOT NULL DEFAULT 0,
  total_net_vnd          BIGINT    NOT NULL DEFAULT 0,

  created_by       TEXT            NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_by       TEXT            NOT NULL DEFAULT '',
  updated_at       TIMESTAMPTZ     NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ     NULL,                    -- SOFT-DELETE ONLY

  CONSTRAINT pay_payroll_group_tenant_company_unique
      UNIQUE (tenant_id, company_id, code, deleted_at)
);
```

Column notes:
- `tenant_id` / `company_id` are `TEXT DEFAULT ''` — **not UUID, not FK** (Plane A/B).
- `code` uniqueness is scoped by `(tenant_id, company_id, deleted_at)` so a soft-deleted code can be
  reused; the partial unique index on `deleted_at IS NULL` is the production form.
- Money columns are `BIGINT` (VND, integer) — **never** `NUMERIC(19,2)` float for payroll.
- `total_*` are denormalized counters maintained by the cluster service, not recomputed on read.

## 4. Indexes

```sql
CREATE INDEX idx_pay_payroll_group_tenant_company_status
    ON pay_payroll_group (tenant_id, company_id, status, created_at DESC);

CREATE INDEX idx_pay_payroll_group_period
    ON pay_payroll_group (tenant_id, company_id, period_from, period_to);

CREATE INDEX idx_pay_payroll_group_deleted
    ON pay_payroll_group (tenant_id, company_id)
    WHERE deleted_at IS NULL;
```

Query patterns covered:
- tenant+company list, newest first, status-filtered → index 1
- "is there an open group overlapping this period" → index 2
- active-row-only lookups → index 3 (partial)

## 5. State machine (§5.5)

| State | Meaning | Allowed next states |
|---|---|---|
| `DRAFT` | Created, no runs attached yet | `ACTIVE`, `CANCELLED` |
| `ACTIVE` | Runs attached, being processed | `APPROVED`, `CANCELLED` |
| `APPROVED` | Approved for payment | `EXPORTED`, `CANCELLED` |
| `EXPORTED` | Journal/payslip batch exported | (terminal) |
| `CANCELLED` | Voided before export | (terminal) |

Rules:
- `DRAFT → ACTIVE` requires at least one `pay_run` row referencing the group.
- `ACTIVE → APPROVED` requires `approved_by` and `approved_at` (non-null).
- `APPROVED → EXPORTED` is terminal; no further mutation of the group or its runs.
- **No state ever goes back to `DRAFT`.** Re-work = new group, old one `CANCELLED`.
- Soft-delete (`deleted_at` set) is orthogonal to state: a deleted group is hidden from list queries
  but its state machine is unchanged.

## 6. §5.5 specifically

§5.5 of the parent `DB_DESIGN_NEW.md` is **not yet written** (no `5.5`, `PAY-09`, or
`pay_payroll_group` string exists in that file as of 2026-08-18). This file proposes the §5.5
content. When the parent §5.5 is authored, reconcile this file against it and mark the diff.

Proposed §5.5 obligations this table satisfies:
1. Anchor for the PAY-09 batch write path.
2. Tenant-scoped, soft-delete only, no cross-plane FK.
3. Money in `BIGINT` VND; no float.
4. State machine with terminal `EXPORTED` and no backward transitions.

## 7. Unblocks

This file is the gate for `HRM-MVP-GD1-PAY-09-CLUSTER-01` (dev-be). The cluster WI may start once
this spec is acked; it reads §3–§5 as the contract for the `pay_payroll_group` DAL + service.

## 8. Open items
1. Parent `DB_DESIGN_NEW.md` §5.5 not authored — this is a proposal, reconcile on merge.
2. `pay_cycle_code` vocabulary (MONTHLY / BIMONTHLY / P13 / QUARTERLY / custom) — confirm against
   the payroll catalog spec; currently a free-text enum-like column.
3. Whether `total_*` counters are maintained by the cluster service or computed by a DB trigger —
   proposed: service-maintained, for testability.
