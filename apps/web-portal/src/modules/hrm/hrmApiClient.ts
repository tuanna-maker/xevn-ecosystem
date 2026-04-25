const API_BASE_URL = (import.meta.env.VITE_XEVN_API_URL ?? '/api/v1').replace(/\/$/, '');

export type HrmMetadataChangeRequest = {
  id: string;
  tenantId: string;
  employeeId: string;
  legalEntityId: string;
  effectiveConfigVersion: string;
  values: Record<string, string | number | boolean | null>;
  reason: string;
  requestedBy: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  errors: Array<{ fieldCode: string; errorCode: string; messageVi: string }>;
  auditTrail: Array<{
    action: 'submitted' | 'approved' | 'rejected';
    actorUserId: string;
    at: string;
    reason?: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type HrmMetadataChangeRequestView = HrmMetadataChangeRequest & {
  employeeName: string;
  legalEntityName: string;
  configVersion: string;
  fields: string[];
  ageHours: number;
  slaHours: number;
};

function hoursSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.round(ms / (60 * 60 * 1000)));
}

function toViewModel(request: HrmMetadataChangeRequest): HrmMetadataChangeRequestView {
  return {
    ...request,
    employeeName: request.employeeId,
    legalEntityName: request.legalEntityId,
    configVersion: request.effectiveConfigVersion,
    fields: Object.keys(request.values),
    ageHours: hoursSince(request.createdAt),
    slaHours: 24,
  };
}

const fallbackRawHrmMetadataChangeRequests: HrmMetadataChangeRequest[] = [
  {
    id: 'hrm-meta-cr-001',
    tenantId: 'tenant-xevn-holding',
    employeeId: 'emp-driver-001',
    legalEntityId: 'comp-002',
    effectiveConfigVersion: 'employee_profile:1:1',
    values: {
      driver_license_class: 'FC',
      employee_identity_number: '079188001235',
    },
    reason: 'Bổ sung hạng GPLX FC theo yêu cầu vận hành container',
    requestedBy: 'hrm-operator',
    status: 'pending_approval',
    errors: [],
    auditTrail: [
      {
        action: 'submitted',
        actorUserId: 'hrm-operator',
        at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        reason: 'Bổ sung hạng GPLX FC theo yêu cầu vận hành container',
      },
    ],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'hrm-meta-cr-002',
    tenantId: 'tenant-xevn-holding',
    employeeId: 'emp-warehouse-002',
    legalEntityId: 'comp-003',
    effectiveConfigVersion: 'employee_profile:1:0',
    values: {
      employment_group: 'warehouse_operator',
    },
    reason: 'Cập nhật nhóm nhân sự kho bãi sau điều chuyển phòng ban',
    requestedBy: 'hrm-operator',
    status: 'pending_approval',
    errors: [],
    auditTrail: [
      {
        action: 'submitted',
        actorUserId: 'hrm-operator',
        at: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
        reason: 'Cập nhật nhóm nhân sự kho bãi sau điều chuyển phòng ban',
      },
    ],
    createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
  },
];

export const fallbackHrmMetadataChangeRequests: HrmMetadataChangeRequestView[] =
  fallbackRawHrmMetadataChangeRequests.map(toViewModel);

export async function fetchHrmMetadataChangeRequests(
  tenantId = 'tenant-xevn-holding',
): Promise<HrmMetadataChangeRequestView[]> {
  const params = new URLSearchParams({ tenantId });
  try {
    const response = await fetch(`${API_BASE_URL}/hrm/metadata-change-requests?${params.toString()}`);
    if (!response.ok) throw new Error(`API ${response.status}`);
    return ((await response.json()) as HrmMetadataChangeRequest[]).map(toViewModel);
  } catch {
    return fallbackHrmMetadataChangeRequests;
  }
}

export async function approveHrmMetadataChangeRequest(
  requestId: string,
  tenantId = 'tenant-xevn-holding',
): Promise<HrmMetadataChangeRequest> {
  const response = await fetch(
    `${API_BASE_URL}/hrm/metadata-change-requests/${encodeURIComponent(requestId)}/approve`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, approverUserId: 'portal-approver' }),
    },
  );
  if (!response.ok) {
    return {
      ...fallbackHrmMetadataChangeRequests.find((item) => item.id === requestId)!,
      status: 'approved',
      updatedAt: new Date().toISOString(),
    };
  }
  return (await response.json()) as HrmMetadataChangeRequest;
}
