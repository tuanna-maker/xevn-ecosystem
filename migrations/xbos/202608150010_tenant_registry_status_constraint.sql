-- Migration: XBOS-TENANT-PROVISION-BE-01
-- Adds CHECK constraint + indexes on xbos_tenant_registry for status lifecycle enforcement
-- Safe to run idempotently: uses DROP IF EXISTS + CREATE IF NOT EXISTS

-- 1. Enforce valid status values
ALTER TABLE public.xbos_tenant_registry
  DROP CONSTRAINT IF EXISTS xbos_tenant_registry_status_check;

ALTER TABLE public.xbos_tenant_registry
  ADD CONSTRAINT xbos_tenant_registry_status_check
    CHECK (status IN ('provisioning', 'active', 'suspended', 'archived'));

-- 2. Index for status filtering (list active tenants, find provisioning tenants)
CREATE INDEX IF NOT EXISTS ix_tenant_registry_status
  ON public.xbos_tenant_registry(status);

-- 3. Index for tenant_kind filtering (list master vs member)
CREATE INDEX IF NOT EXISTS ix_tenant_registry_kind
  ON public.xbos_tenant_registry(tenant_kind);
