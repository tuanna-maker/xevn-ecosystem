-- Migration: 20260817_add_recruitment_perf_indexes.sql
-- WorkItem: REC-PERF-BE-01
-- Purpose: Add missing performance indexes for recruitment list queries.
-- NOTE: This project uses inline ensureSchema() DDL; this file is a standalone reference / apply-once script.
-- All 4 indexes are idempotent (IF NOT EXISTS) and safe to run on a live database.

-- -----------------------------------------------------------------------
-- job_requisitions — list filter by status + ORDER BY created_at DESC
-- -----------------------------------------------------------------------

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_job_requisitions_company_status
  ON public.job_requisitions (company_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_job_requisitions_company_created_at
  ON public.job_requisitions (company_id, created_at DESC);

-- -----------------------------------------------------------------------
-- recruitment_candidates — filter by (company_id, requisition_id) + ORDER BY created_at DESC
-- -----------------------------------------------------------------------

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recruitment_candidates_company_requisition
  ON public.recruitment_candidates (company_id, requisition_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recruitment_candidates_company_created_at
  ON public.recruitment_candidates (company_id, created_at DESC);
