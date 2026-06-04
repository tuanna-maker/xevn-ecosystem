import { useCallback, useEffect, useState } from 'react';

import {

  INITIAL_DEPT_SYSTEM_TEMPLATES,

  type DeptSystemFoundationTemplate,

} from '../data/dept-system-foundation-catalog';

import { MEMBER_DEFAULT_COMPANY_ID, MASTER_TENANT_ID } from '../constants/tenant';

import {

  isDeptTemplatesNotFoundError,

  listDeptSystemTemplates,

  mapDeptSystemTemplateRow,

  resolveDeptSystemTemplatesLoad,

  type DeptSystemTemplateRow,

} from '../integrations/deptSystemTemplatesApi';

import { allowMockFallback } from '../utils/mockPolicy';



export type DeptSystemTemplatesSource = 'idle' | 'loading' | 'api' | 'mock' | 'empty';



function toFoundationTemplate(row: DeptSystemTemplateRow): DeptSystemFoundationTemplate {

  return mapDeptSystemTemplateRow(row);

}



const MOCK_SEED: DeptSystemTemplateRow[] = INITIAL_DEPT_SYSTEM_TEMPLATES.map((r) =>

  mapDeptSystemTemplateRow(r),

);



export function useDeptSystemTemplates(

  active: boolean,

  tenantId = MASTER_TENANT_ID,

  companyId = MEMBER_DEFAULT_COMPANY_ID,

) {

  const [templates, setTemplates] = useState<DeptSystemFoundationTemplate[]>([]);

  const [source, setSource] = useState<DeptSystemTemplatesSource>('idle');

  const [loadFailed, setLoadFailed] = useState(false);

  const [loadNotFound, setLoadNotFound] = useState(false);



  const reload = useCallback(async () => {

    setSource('loading');

    setLoadFailed(false);

    setLoadNotFound(false);

    try {

      const rows = await listDeptSystemTemplates(tenantId, companyId);

      const resolved = resolveDeptSystemTemplatesLoad(rows, allowMockFallback(), MOCK_SEED, false);

      setTemplates(resolved.templates.map(toFoundationTemplate));

      setSource(resolved.source);

      setLoadFailed(resolved.loadFailed);

    } catch (error) {

      const notFound = isDeptTemplatesNotFoundError(error);

      setLoadNotFound(notFound);

      const resolved = resolveDeptSystemTemplatesLoad([], allowMockFallback(), MOCK_SEED, true);

      setTemplates(resolved.templates.map(toFoundationTemplate));

      setSource(resolved.source);

      setLoadFailed(resolved.loadFailed || !notFound);

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

