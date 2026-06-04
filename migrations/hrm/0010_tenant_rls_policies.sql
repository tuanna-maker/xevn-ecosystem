-- PostgreSQL RLS baseline (NFR P2.4) — enable per-table after SA sign-off.
-- Set app.tenant_id per request in API pool middleware when PLATFORM_RLS_ENABLED=true.

DO $$
BEGIN
  IF current_setting('xevn.rls_bootstrap', true) IS NULL THEN
    PERFORM set_config('xevn.rls_bootstrap', '1', false);
  END IF;
END $$;

-- Example policy template (attendance_records) — uncomment after sign-off:
-- ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY attendance_records_tenant ON attendance_records
--   USING (tenant_id = current_setting('app.tenant_id', true));
