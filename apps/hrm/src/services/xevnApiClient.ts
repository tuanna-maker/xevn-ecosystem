const API_BASE_URL = (import.meta.env.VITE_XEVN_API_URL ?? '/api/v1').replace(/\/$/, '');

export type DynamicConfigField = {
  fieldCode: string;
  blockCode: string;
  labelVi: string;
  dataType: 'text' | 'number' | 'date' | 'select' | 'phone' | 'email';
  required: boolean;
  readonly: boolean;
  hidden: boolean;
  order: number;
  validationRules?: Record<string, unknown>;
  optionsSource?: {
    categoryCode: string;
    scope: 'global' | 'legal_entity';
  };
};

export type DynamicConfigBlock = {
  blockCode: string;
  labelVi: string;
  order: number;
  hidden?: boolean;
};

export type DynamicConfigOptionCategory = {
  categoryCode: string;
  items: Array<{ itemCode: string; labelVi: string; payloadJson?: Record<string, unknown> }>;
};

export type FieldValidationError = {
  fieldCode: string;
  errorCode: string;
  messageVi: string;
  meta?: Record<string, unknown>;
};

export type EmployeeMetadataFormResponse = {
  employeeId: string;
  effectiveConfig: {
    etag: string;
    blocks: DynamicConfigBlock[];
    fields: DynamicConfigField[];
    options: DynamicConfigOptionCategory[];
  };
  values: Record<string, string | number | boolean | null>;
  effectiveConfigVersion: string;
};

export type SaveEmployeeMetadataValuesResponse = {
  record?: {
    tenantId: string;
    employeeId: string;
    legalEntityId: string;
    effectiveConfigVersion: string;
    values: Record<string, string | number | boolean | null>;
    updatedAt: string;
  };
  errors: FieldValidationError[];
};

const fallbackEmployeeMetadataForm = (employeeId: string, legalEntityId: string): EmployeeMetadataFormResponse => ({
  employeeId,
  effectiveConfigVersion: `fallback:employee_profile:${legalEntityId}`,
  values: {},
  effectiveConfig: {
    etag: `fallback:employee_profile:${legalEntityId}`,
    blocks: [
      { blockCode: 'personal_info', labelVi: 'Thông tin cá nhân', order: 10 },
      { blockCode: 'employment_info', labelVi: 'Thông tin công việc', order: 20 },
      { blockCode: 'compliance_info', labelVi: 'Tuân thủ & hồ sơ pháp lý', order: 30 },
    ],
    fields: [
      {
        fieldCode: 'full_name',
        blockCode: 'personal_info',
        labelVi: 'Họ và tên',
        dataType: 'text',
        required: true,
        readonly: false,
        hidden: false,
        order: 10,
      },
      {
        fieldCode: 'employee_identity_number',
        blockCode: 'compliance_info',
        labelVi: 'Số CCCD',
        dataType: 'text',
        required: true,
        readonly: false,
        hidden: false,
        order: 10,
        validationRules: { pattern: '^[0-9]{12}$' },
      },
      {
        fieldCode: 'employment_group',
        blockCode: 'employment_info',
        labelVi: 'Nhóm nhân sự',
        dataType: 'select',
        required: true,
        readonly: false,
        hidden: false,
        order: 10,
        optionsSource: { categoryCode: 'EMPLOYMENT_GROUP', scope: 'legal_entity' },
      },
    ],
    options: [
      {
        categoryCode: 'EMPLOYMENT_GROUP',
        items: [
          { itemCode: 'driver', labelVi: 'Tài xế' },
          { itemCode: 'warehouse_operator', labelVi: 'Nhân sự kho bãi' },
          { itemCode: 'office_staff', labelVi: 'Khối văn phòng' },
        ],
      },
    ],
  },
});

export async function fetchEmployeeMetadataForm(input: {
  tenantId: string;
  legalEntityId: string;
  employeeId: string;
}): Promise<EmployeeMetadataFormResponse> {
  const params = new URLSearchParams({
    tenantId: input.tenantId,
    legalEntityId: input.legalEntityId,
  });

  try {
    const response = await fetch(
      `${API_BASE_URL}/hrm/employees/${encodeURIComponent(input.employeeId)}/metadata-form?${params.toString()}`,
    );
    if (!response.ok) throw new Error(`API ${response.status}`);
    return (await response.json()) as EmployeeMetadataFormResponse;
  } catch {
    return fallbackEmployeeMetadataForm(input.employeeId, input.legalEntityId);
  }
}

export async function getEmployeeMetadataForm(
  employeeId: string,
  legalEntityId: string,
  tenantId = 'tenant-xevn-holding',
): Promise<EmployeeMetadataFormResponse> {
  return fetchEmployeeMetadataForm({ tenantId, legalEntityId, employeeId });
}

function validateFallback(
  form: EmployeeMetadataFormResponse,
  values: Record<string, string>,
): FieldValidationError[] {
  return form.effectiveConfig.fields
    .filter((field) => !field.hidden)
    .flatMap((field) => {
      const value = String(values[field.fieldCode] ?? '').trim();
      if (field.required && value.length === 0) {
        return [{ fieldCode: field.fieldCode, errorCode: 'REQUIRED', messageVi: `${field.labelVi} là bắt buộc.` }];
      }
      const pattern = field.validationRules?.pattern;
      if (value && typeof pattern === 'string' && !new RegExp(pattern).test(value)) {
        return [{ fieldCode: field.fieldCode, errorCode: 'PATTERN_MISMATCH', messageVi: `${field.labelVi} không đúng định dạng.` }];
      }
      return [];
    });
}

export async function saveEmployeeMetadataValues(
  employeeId: string,
  legalEntityId: string,
  values: Record<string, string>,
  tenantId = 'tenant-xevn-holding',
): Promise<SaveEmployeeMetadataValuesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/hrm/employees/${encodeURIComponent(employeeId)}/metadata-values`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, legalEntityId, values }),
    });
    if (!response.ok) throw new Error(`API ${response.status}`);
    return (await response.json()) as SaveEmployeeMetadataValuesResponse;
  } catch {
    const fallbackForm = fallbackEmployeeMetadataForm(employeeId, legalEntityId);
    const errors = validateFallback(fallbackForm, values);
    if (errors.length > 0) return { errors };
    return {
      errors: [],
      record: {
        tenantId,
        employeeId,
        legalEntityId,
        effectiveConfigVersion: fallbackForm.effectiveConfigVersion,
        values,
        updatedAt: new Date().toISOString(),
      },
    };
  }
}
