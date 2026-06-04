# HRM API SQL migrations

Canonical migration files for `DATABASE_URL_HRM` live in **`migrations/hrm/`** at the repo root.

Apply on dev:

```bash
node scripts/migrate-apply.mjs hrm
```

Wave 1 Supabase Zero pilot DDL: `migrations/hrm/0011_wave1_supabase_pilot_tables.sql` (P1-SUPA-BE-01).

Wave 2 Nest CRUD tables: `migrations/hrm/0012_wave2_supabase_nest_tables.sql` (P1-SUPA-BE-02).

Wave 3 attendance request tables: `migrations/hrm/0013_wave3_attendance_request_tables.sql` (P1-SUPA-BE-03).

Runtime services also call `ensureSchema()` for idempotent DDL when migrate has not been run yet.
