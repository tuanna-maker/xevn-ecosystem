/**
 * @CODE-MEMORY
 * Screen:     /contracts — workspace deep-link query params
 * UC:         FR-UC-BP-CORE-09 · FR-HRM-INT-01 hire → HĐ
 * WorkItem:   PO-HRM-CTR-WORKSPACE-WAVE-G3
 * Purpose:    Parse/build `workspace` URL params for create|edit|view + employee/candidate prefill.
 * must_keep:  CC embed query via hrmPathWithEmbedSearch; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-G4-EDIT-DEEPLINK-FE-01
 * What: mergePortalParentWorkspaceSearch — CC portal URL carries workspace params; iframe src omits them
 * Why: QA WS-G4-03-EDIT FAIL — ?workspace=edit&contractId= on parent only; Step1 shell not mounted
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-FE-01
 * What: applyIframeWorkspaceParamsToParent — iframe→parent write for workspace deep-link evidence
 * Why: DEF-CTR-G4-PROFILE-URL-P2 — profile «Thêm HĐ» opens Step1 but parent URL lacks lock query
 */

export type ContractWorkspaceMode = 'create' | 'edit' | 'view';

export type ContractWorkspacePrefill = {
  subject_type?: 'candidate' | 'employee';
  employee_id?: string;
  candidate_id?: string;
  requisition_id?: string;
  template_code?: string;
  /** Profile / REC hire — hide UV tab; NV locked to employee_id */
  lock_subject_employee?: boolean;
};

export const CONTRACT_WORKSPACE_QUERY = {
  workspace: 'workspace',
  contractId: 'contractId',
  employeeId: 'employee_id',
  candidateId: 'candidate_id',
  requisitionId: 'requisition_id',
  subjectType: 'subject_type',
  templateCode: 'template_code',
} as const;

export const WORKSPACE_DEEP_LINK_PARAM_KEYS = [
  CONTRACT_WORKSPACE_QUERY.workspace,
  CONTRACT_WORKSPACE_QUERY.contractId,
  CONTRACT_WORKSPACE_QUERY.employeeId,
  CONTRACT_WORKSPACE_QUERY.candidateId,
  CONTRACT_WORKSPACE_QUERY.requisitionId,
  CONTRACT_WORKSPACE_QUERY.subjectType,
  CONTRACT_WORKSPACE_QUERY.templateCode,
  'lock_subject_employee',
] as const;

function iframeSearchParams(search: string): URLSearchParams {
  const raw = search.trim();
  if (!raw) return new URLSearchParams();
  const qs = raw.startsWith('?') ? raw.slice(1) : raw;
  return new URLSearchParams(qs);
}

/**
 * CC embed write-path: copy workspace deep-link params from iframe search onto parent portal query.
 * Clears stale workspace keys when leaving /contracts or when iframe has no workspace mode.
 */
export function applyIframeWorkspaceParamsToParent(
  parentParams: URLSearchParams,
  iframeSearch: string,
  onContractsRoute: boolean,
): void {
  if (!onContractsRoute) {
    for (const key of WORKSPACE_DEEP_LINK_PARAM_KEYS) {
      parentParams.delete(key);
    }
    return;
  }

  const iframeParams = iframeSearchParams(iframeSearch);
  const iframeMode = (iframeParams.get(CONTRACT_WORKSPACE_QUERY.workspace) ?? '').trim();
  if (!iframeMode) {
    for (const key of WORKSPACE_DEEP_LINK_PARAM_KEYS) {
      parentParams.delete(key);
    }
    return;
  }

  for (const key of WORKSPACE_DEEP_LINK_PARAM_KEYS) {
    const value = iframeParams.get(key);
    if (value?.trim()) {
      parentParams.set(key, value.trim());
    } else {
      parentParams.delete(key);
    }
  }
}

function normalizeSearchString(search: string): string {
  const raw = search.trim();
  if (!raw) return '';
  return raw.startsWith('?') ? raw : `?${raw}`;
}

/**
 * CC embed: portal pathname query may include `workspace` + `contractId` while locked iframe src
 * only carries portal/tenant/company — merge parent params when iframe search lacks workspace mode.
 */
export function mergePortalParentWorkspaceSearch(search: string): string {
  const iframeQs = normalizeSearchString(search);
  const iframeParams = new URLSearchParams(iframeQs.startsWith('?') ? iframeQs.slice(1) : iframeQs);
  const iframeMode = (iframeParams.get(CONTRACT_WORKSPACE_QUERY.workspace) ?? '').trim();
  if (iframeMode) return iframeQs;

  if (typeof window === 'undefined' || window.parent === window) {
    return iframeQs;
  }

  try {
    const parentParams = new URLSearchParams(window.parent.location.search);
    const parentMode = (parentParams.get(CONTRACT_WORKSPACE_QUERY.workspace) ?? '').trim();
    if (!parentMode) return iframeQs;

    const merged = new URLSearchParams(iframeParams);
    for (const key of WORKSPACE_DEEP_LINK_PARAM_KEYS) {
      const value = parentParams.get(key);
      if (value?.trim()) merged.set(key, value.trim());
    }
    const qs = merged.toString();
    return qs ? `?${qs}` : iframeQs;
  } catch {
    return iframeQs;
  }
}

/** Parse workspace deep-link from iframe search, falling back to parent portal query on CC embed. */
export function resolveContractWorkspaceSearch(search: string) {
  return parseContractWorkspaceSearch(mergePortalParentWorkspaceSearch(search));
}

export function parseContractWorkspaceSearch(search: string): {
  mode: ContractWorkspaceMode | null;
  contractId: string | null;
  prefill: ContractWorkspacePrefill;
} {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const rawMode = (params.get(CONTRACT_WORKSPACE_QUERY.workspace) ?? '').trim().toLowerCase();
  const mode =
    rawMode === 'create' || rawMode === 'edit' || rawMode === 'view'
      ? (rawMode as ContractWorkspaceMode)
      : null;
  const contractId = (params.get(CONTRACT_WORKSPACE_QUERY.contractId) ?? '').trim() || null;
  const employee_id = (params.get(CONTRACT_WORKSPACE_QUERY.employeeId) ?? '').trim() || undefined;
  const candidate_id = (params.get(CONTRACT_WORKSPACE_QUERY.candidateId) ?? '').trim() || undefined;
  const requisition_id = (params.get(CONTRACT_WORKSPACE_QUERY.requisitionId) ?? '').trim() || undefined;
  const subjectRaw = (params.get(CONTRACT_WORKSPACE_QUERY.subjectType) ?? '').trim().toLowerCase();
  const subject_type =
    subjectRaw === 'candidate' || subjectRaw === 'employee' ? subjectRaw : undefined;
  const template_code = (params.get(CONTRACT_WORKSPACE_QUERY.templateCode) ?? '').trim() || undefined;
  const lock_subject_employee = params.get('lock_subject_employee') === '1';

  const prefill: ContractWorkspacePrefill = {
    ...(employee_id ? { employee_id } : {}),
    ...(candidate_id ? { candidate_id } : {}),
    ...(requisition_id ? { requisition_id } : {}),
    ...(subject_type ? { subject_type } : {}),
    ...(template_code ? { template_code } : {}),
    ...(lock_subject_employee ? { lock_subject_employee: true } : {}),
  };

  return { mode, contractId, prefill };
}

/** Build HRM contracts path with workspace deep-link (REC hire CTA, profile tab). */
export function buildContractWorkspacePath(
  mode: ContractWorkspaceMode,
  opts: {
    contractId?: string;
    prefill?: ContractWorkspacePrefill;
    embedSearch?: string;
  } = {},
): string {
  const params = new URLSearchParams();
  params.set(CONTRACT_WORKSPACE_QUERY.workspace, mode);
  if (opts.contractId?.trim()) {
    params.set(CONTRACT_WORKSPACE_QUERY.contractId, opts.contractId.trim());
  }
  const p = opts.prefill ?? {};
  if (p.employee_id?.trim()) {
    params.set(CONTRACT_WORKSPACE_QUERY.employeeId, p.employee_id.trim());
  }
  if (p.candidate_id?.trim()) {
    params.set(CONTRACT_WORKSPACE_QUERY.candidateId, p.candidate_id.trim());
  }
  if (p.requisition_id?.trim()) {
    params.set(CONTRACT_WORKSPACE_QUERY.requisitionId, p.requisition_id.trim());
  }
  if (p.subject_type) {
    params.set(CONTRACT_WORKSPACE_QUERY.subjectType, p.subject_type);
  }
  if (p.template_code?.trim()) {
    params.set(CONTRACT_WORKSPACE_QUERY.templateCode, p.template_code.trim());
  }
  if (p.lock_subject_employee) {
    params.set('lock_subject_employee', '1');
  }
  const base = `/contracts?${params.toString()}`;
  if (!opts.embedSearch) return base;
  const embed = opts.embedSearch.startsWith('?') ? opts.embedSearch.slice(1) : opts.embedSearch;
  const merged = new URLSearchParams(embed);
  for (const [k, v] of params.entries()) {
    merged.set(k, v);
  }
  return `/contracts?${merged.toString()}`;
}

export function subjectStateFromPrefill(
  prefill?: ContractWorkspacePrefill,
): import('@/lib/contractCreateWizardState').ContractWizardSubjectState {
  const employeeId = (prefill?.employee_id ?? '').trim();
  const candidateId = (prefill?.candidate_id ?? '').trim();
  const subject_type =
    prefill?.subject_type ?? (employeeId ? 'employee' : candidateId ? 'candidate' : 'employee');
  return {
    subject_type,
    candidate_id: candidateId,
    requisition_id: (prefill?.requisition_id ?? '').trim(),
  };
}
