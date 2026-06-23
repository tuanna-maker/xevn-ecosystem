import { useCallback, useEffect, useState } from 'react';

import { type DeptSystemFoundationTemplate } from '../data/dept-system-foundation-catalog';
import { MEMBER_DEFAULT_COMPANY_ID, MASTER_TENANT_ID } from '../constants/tenant';
import {
  isDeptTemplatesNotFoundError,
  listDeptSystemTemplates,
  loadDeptSystemTemplatesFromApi,
  mapDeptSystemTemplateRow,
  type DeptSystemTemplateRow,
} from '../integrations/deptSystemTemplatesApi';

export type DeptSystemTemplatesSource = 'idle' | 'loading' | 'api' | 'mock' | 'empty';

function toFoundationTemplate(row: DeptSystemTemplateRow): DeptSystemFoundationTemplate {
  return mapDeptSystemTemplateRow(row);
}

export function useDeptSystemTemplates(
  active: boolean,
  tenantId = MASTER_TENANT_ID,
  companyId = MEMBER_DEFAULT_COMPANY_ID,
) {
  const [templates, setTemplates] = useState<DeptSystemFoundationTemplate[]>([]);
  const [source, setSource] = useState<DeptSystemTemplatesSource>('idle');
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadNotFound, setLoadNotFound] = useState(false);

  const reload = useCallback(async (): Promise<DeptSystemFoundationTemplate[]> => {
    setSource('loading');
    setLoadFailed(false);
    setLoadNotFound(false);
    try {
      const rows = await listDeptSystemTemplates(tenantId, companyId);
      const resolved = loadDeptSystemTemplatesFromApi(rows, false);
      const next = resolved.templates.map(toFoundationTemplate);
      setTemplates(next);
      setSource(resolved.source);
      setLoadFailed(resolved.loadFailed);
      return next;
    } catch (error) {
      const notFound = isDeptTemplatesNotFoundError(error);
      setLoadNotFound(notFound);
      const resolved = loadDeptSystemTemplatesFromApi([], true);
      const next = resolved.templates.map(toFoundationTemplate);
      setTemplates(next);
      setSource(resolved.source);
      setLoadFailed(resolved.loadFailed || !notFound);
      return next;
    }
  }, [tenantId, companyId]);

  useEffect(() => {
    if (!active) return;
    void reload();
  }, [active, reload]);

  return {
    templates,
    setTemplates,
    source,
    loadFailed,
    loadNotFound,
    reload,
    usingMockFallback: source === 'mock',
    isLoading: source === 'loading',
  };
}
