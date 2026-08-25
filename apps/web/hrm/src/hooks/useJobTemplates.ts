/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Thư viện JD
 * UC:         UC-HRM-RC-07 · UC-HRM-RC-08
 * BR:         BR-CD-F6-01 · BR-CD-F6-02 · BR-HRM-MD-01
 * SRS:        docs/hrm/SRS.md §14 UC-HRM-30 · FR-HRM-RC-JD-01
 * TechSpec:   docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §6
 * Purpose:    CRUD reusable job-description templates; feed requisition create.
 * WorkItem:   CD-FB-09-RECRUIT
 * Coded:      2026-07-19
 *
 * Callers:
 *   - JobTemplatesTab.tsx
 *   - JobRequisitionsTab.tsx (list for picker)
 *
 * Callees:
 *   - hrmApi.listJobDescriptionTemplates / create / update / delete
 *
 * FE-Actions:
 *   | Load library | refetch | GET /recruitment/job-templates |
 *   | Create/Edit  | mutate  | POST/PATCH job-templates (+ position_code) |
 *
 * Impact:     Empty library forces retyping JD on every requisition
 * must_keep:  Scope via listCompanyId; code unique error surfaced; position_code catalog SoT
 * SOLID:      Hook owns server state for JD templates only
 * LastVerified: docs/qa/evidence/fe-hrm-settings-md-jt-01-20260725.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-25 D-HRM-SETTINGS-MD-JT-FE-01
 * change_mode: UPGRADE
 * What: create/update payload includes required position_code (catalog); position_name optional denorm
 * Why: BE HRM-REC-JD-POS — invent-only free text rejected (AC-SET-FS-03)
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-07
 * change_mode: FIX
 * What: Mount fetch keyed by companyId only; in-flight guard — stop job-templates refetch storm on create dialog
 * Why: QA RET-03-HRM-R4 — ~40+ GET job-templates during YCTD open; applyTemplate never reached form-ready
 * must_keep: Scope via listCompanyId; preserve cache on transient scope miss (FE-06)
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-12
 * change_mode: FIX
 * What: refetch returns rows for await-open hydrate in JobRequisitionsTab
 * Why: QA R9 — create dialog opened before templates state flushed; handleOpenCreate needs sync rows
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-13
 * change_mode: FIX
 * What: refetch dedupe — await in-flight promise instead of returning stale templatesRef []
 * Why: QA R10 — mount fetch in-flight caused handleOpenCreate refetch to return [] while GET 200 had rows
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-14
 * change_mode: FIX
 * What: refetch reads companyId via ref — never return stale [] while scope in-flight on sibling tab
 * Why: QA R11 — jd-library tbody count=1 but requisitions create dialog effectiveTemplates=[] after shared refetch
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-15
 * change_mode: FIX
 * What: unwrapJobDescriptionTemplateRows on list payload; hydrateTemplates sync for create-dialog prefetch
 * Why: QA R12 — GET 200 ×2 but effectiveTemplates=[]; res.data vs nested data[] envelope mismatch
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-16
 * change_mode: FIX
 * What: createTemplate optimistically merges created row before refetch — YCTD tab sees ≥1 template immediately
 * Why: QA R13 — U65 JD create prerequisite; shared hook must hydrate before requisitions navigate
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 PO-E2E-SPINE-01-FE-REC-MOUNT
 * change_mode: FIX
 * What: Restore hook from stash 43c479a UTF-8 (transitive of JobTemplatesTab / Recruitment shared state)
 * Why: R-PO-SPINE01-REC-MOUNT — Recruitment.tsx imports useJobTemplates for jd-library + requisitions picker
 * must_keep: unwrapJobDescriptionTemplateRows; companyId-keyed fetch; hydrateTemplates; leave CLOSED
 * LastVerified: docs/qa/evidence/po-e2e-spine-01-fe-rec-mount.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-DYNAMIC-FE-01
 * change_mode: ADD
 * What: create/update accept values_json + layout_snapshot v2; getTemplateById for view
 * Why: Q6 snapshot · GROUP-ARCH F-JD-02/03/04 · AC-JD-GRP-04
 * must_keep: position_code SoT; unwrap list; no job_postings dual-write
 * LastVerified: docs/qa/evidence/po-hrm-jd-dynamic-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-00-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: publishTemplate → POST …/job-templates/:id/publish; create omits status/is_active (P04 draft);
 *       soft-retire DELETE semantics; physical /recruitment/job-templates only
 * Why: UC-BP-REC-00 O1–O4 · API-01 F-JD-02/04 · BA Diễn biến 2a/2c · U65
 * must_keep: unwrap list; position_code; bindable picker separate; DENY /rec SoT · seed · honesty flip
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-fe-01.md
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import {
  createJobDescriptionTemplate,
  deleteJobDescriptionTemplate,
  getJobDescriptionTemplate,
  listJobDescriptionTemplates,
  publishJobDescriptionTemplate,
  updateJobDescriptionTemplate,
  type HrmJobDescriptionTemplate,
} from '@/integrations/hrmApi';
import type { JdLayoutSnapshotV2 } from '@/lib/jdDynamicSnapshot';
import { toErrorMessage } from '@/lib/apiError';
import { unwrapJobDescriptionTemplateRows } from '@/lib/jobRequisitionUi';

export function useJobTemplates(enabled = true) {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;
  const [templates, setTemplates] = useState<HrmJobDescriptionTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef<Promise<HrmJobDescriptionTemplate[]> | null>(null);
  const templatesRef = useRef(templates);
  templatesRef.current = templates;
  const companyIdRef = useRef(companyId);
  companyIdRef.current = companyId;

  const refetch = useCallback(async (): Promise<HrmJobDescriptionTemplate[]> => {
    const scopeCompanyId = companyIdRef.current;
    // D-HDSD-MUTATE-FE-06 — preserve cached templates on transient scope miss (tab switch / auth hydrate)
    if (!enabled || !scopeCompanyId) {
      return templatesRef.current;
    }
    // D-HDSD-MUTATE-FE-13/FE-14 — await shared in-flight fetch; never return stale [] while GET pending
    if (inFlightRef.current) {
      return inFlightRef.current;
    }
    const run = (async (): Promise<HrmJobDescriptionTemplate[]> => {
      setLoading(true);
      setError(null);
      try {
        const res = await listJobDescriptionTemplates({ company_id: scopeCompanyId });
        const rows = unwrapJobDescriptionTemplateRows<HrmJobDescriptionTemplate>(res);
        setTemplates([...rows]);
        templatesRef.current = [...rows];
        return [...rows];
      } catch (err: unknown) {
        setTemplates([]);
        templatesRef.current = [];
        setError(toErrorMessage(err, 'Không tải được thư viện JD.'));
        return [];
      } finally {
        setLoading(false);
        inFlightRef.current = null;
      }
    })();
    inFlightRef.current = run;
    return run;
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !companyId) {
      return;
    }
    void refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/scope only; tránh refetch storm (FE-07)
  }, [companyId, enabled]);

  const createTemplate = useCallback(
    async (payload: {
      code: string;
      title: string;
      position_code: string;
      position_name?: string;
      job_description?: string;
      requirements?: string;
      notes?: string;
      values_json?: Record<string, string>;
      layout_snapshot?: JdLayoutSnapshotV2;
      layout_snapshot_json?: JdLayoutSnapshotV2;
      layout_version?: number;
    }) => {
      if (!companyId) throw new Error('Chưa xác định phạm vi công ty.');
      // P04 — create = draft; do not send status/is_active (BE force draft after BE-01).
      const created = await createJobDescriptionTemplate({
        company_id: companyId,
        ...payload,
      });
      const createdRows = unwrapJobDescriptionTemplateRows<HrmJobDescriptionTemplate>(
        Array.isArray(created) ? created : [created as HrmJobDescriptionTemplate],
      );
      if (createdRows.length > 0) {
        setTemplates((prev) => {
          const merged = [...prev];
          for (const row of createdRows) {
            if (!merged.some((t) => t.id === row.id)) merged.push(row);
          }
          templatesRef.current = merged;
          return merged;
        });
      }
      await refetch();
      return created;
    },
    [companyId, refetch],
  );

  const updateTemplate = useCallback(
    async (
      templateId: string,
      payload: Partial<{
        code: string;
        title: string;
        position_code: string;
        position_name: string;
        job_description: string;
        requirements: string;
        notes: string;
        values_json: Record<string, string>;
        layout_snapshot: JdLayoutSnapshotV2;
        layout_snapshot_json: JdLayoutSnapshotV2;
        layout_version: number;
      }>,
    ) => {
      if (!companyId) throw new Error('Chưa xác định phạm vi công ty.');
      // O3 — content PATCH only; publish via publishTemplate (POST …/publish).
      const updated = await updateJobDescriptionTemplate(templateId, companyId, payload);
      await refetch();
      return updated;
    },
    [companyId, refetch],
  );

  const publishTemplate = useCallback(
    async (templateId: string) => {
      if (!companyId) throw new Error('Chưa xác định phạm vi công ty.');
      const published = await publishJobDescriptionTemplate(templateId, companyId);
      await refetch();
      return published;
    },
    [companyId, refetch],
  );

  const getTemplateById = useCallback(
    async (templateId: string) => {
      if (!companyId) throw new Error('Chưa xác định phạm vi công ty.');
      return getJobDescriptionTemplate(templateId, companyId);
    },
    [companyId],
  );

  const removeTemplate = useCallback(
    async (templateId: string) => {
      if (!companyId) throw new Error('Chưa xác định phạm vi công ty.');
      // P03 soft-retire (DELETE path → retired) — not hard delete.
      await deleteJobDescriptionTemplate(templateId, companyId);
      await refetch();
    },
    [companyId, refetch],
  );

  /** D-HDSD-MUTATE-FE-15 — sync page hook when create dialog prefetches rows directly. */
  const hydrateTemplates = useCallback((rows: readonly HrmJobDescriptionTemplate[]) => {
    const normalized = unwrapJobDescriptionTemplateRows<HrmJobDescriptionTemplate>(rows);
    if (normalized.length === 0) return;
    setTemplates([...normalized]);
    templatesRef.current = [...normalized];
  }, []);

  return {
    companyId,
    templates,
    loading,
    error,
    refetch,
    hydrateTemplates,
    createTemplate,
    updateTemplate,
    publishTemplate,
    removeTemplate,
    getTemplateById,
  };
}
