/**
 * Mock "effective config" engine cho FE prototype.
 *
 * Mục tiêu T-1.0: FE chạy được theo contract semantics bằng mockdata,
 * đảm bảo options/fields có thể khác nhau theo `legalEntityId`,
 * trước khi làm BE vs DB.
 */

export type MockInfrastructureFacilityType =
  | 'warehouse'
  | 'parking'
  | 'office'
  | 'icd'
  | 'hub'
  | 'workshop';

export type MockInfrastructureSiteStatus = 'active' | 'maintenance' | 'inactive';

export type MockEmployeeMetadataDataType = 'text' | 'number' | 'date' | 'select' | 'phone' | 'email';

export type MockEmployeeMetadataFieldRow = {
  id: string;
  fieldName: string;
  dataType: MockEmployeeMetadataDataType;
  /**
   * Khi kiểu Select: các giá trị cách nhau bởi dấu phẩy (prototype đang dùng CSV).
   * (Chính UI cũng chỉ parse CSV theo dấu phẩy.)
   */
  selectConfig: string;
};

export type MockInfrastructureUiFieldCode =
  | 'name'
  | 'siteCode'
  | 'facilityType'
  | 'operatingEntityId'
  | 'status'
  | 'gpsCoords'
  | 'addressDetail'
  | 'hotline'
  | 'directManager'
  | 'leaseLegalEndDate'
  | 'areaSqm'
  | 'palletOrVehicleMax'
  | 'ownerLegalEntityId'
  | 'capacitySummary';

export type MockInfrastructureUiField = {
  labelVi: string;
  ariaLabel?: string;
  placeholder?: string;
  visible?: boolean; // default true
};

export type MockInfrastructureUiBlock = {
  blockCode: 'general' | 'location' | 'capacity';
  titleVi: string;
};

export type MockInfrastructureUi = {
  blocks: {
    general: MockInfrastructureUiBlock;
    location: MockInfrastructureUiBlock;
    capacity: MockInfrastructureUiBlock;
  };
  fields: Partial<Record<MockInfrastructureUiFieldCode, MockInfrastructureUiField>>;
};

type MockEffectiveInfrastructureOptions = {
  facilityTypes: ReadonlyArray<MockInfrastructureFacilityType>;
  statuses: ReadonlyArray<MockInfrastructureSiteStatus>;
};

const INFRA_GLOBAL_FACILITY_TYPES: ReadonlyArray<MockInfrastructureFacilityType> = [
  'warehouse',
  'parking',
  'office',
  'icd',
  'hub',
  'workshop',
];

const INFRA_GLOBAL_STATUSES: ReadonlyArray<MockInfrastructureSiteStatus> = [
  'active',
  'maintenance',
  'inactive',
];

/**
 * Entity variant override: ví dụ comp-002 có subset facility/status khác comp-001.
 * Chỉ mock đủ case A/B để FE nhìn thấy khác biệt.
 */
const INFRA_VARIANTS_BY_ENTITY: Record<string, MockEffectiveInfrastructureOptions> = {
  // Entity A: chỉ dùng global (fallback)
  // (không khai báo comp-001 ở đây để dùng fallback global)

  // Entity B: comp-002 override subset
  'comp-002': {
    facilityTypes: ['parking', 'icd'],
    statuses: ['active', 'maintenance'],
  },

  // comp-003 override thêm 1 subset khác
  'comp-003': {
    facilityTypes: ['office', 'hub'],
    statuses: ['active'],
  },

  // comp-004 override subset sâu hơn
  'comp-004': {
    facilityTypes: ['hub', 'workshop'],
    statuses: ['maintenance', 'inactive'],
  },
};

export function getMockEffectiveInfrastructureOptions(
  legalEntityId: string | null | undefined,
): MockEffectiveInfrastructureOptions {
  if (!legalEntityId) {
    return { facilityTypes: INFRA_GLOBAL_FACILITY_TYPES, statuses: INFRA_GLOBAL_STATUSES };
  }
  return (
    INFRA_VARIANTS_BY_ENTITY[legalEntityId] ?? {
      facilityTypes: INFRA_GLOBAL_FACILITY_TYPES,
      statuses: INFRA_GLOBAL_STATUSES,
    }
  );
}

export function getMockEffectiveInfrastructureUi(
  legalEntityId: string | null | undefined,
): MockInfrastructureUi {
  const entity = legalEntityId ?? 'global';

  // Default (global origin)
  const base: MockInfrastructureUi = {
    blocks: {
      general: { blockCode: 'general', titleVi: 'Khối Thông tin chung' },
      location: { blockCode: 'location', titleVi: 'Khối Vị trí và liên hệ' },
      capacity: { blockCode: 'capacity', titleVi: 'Khối Năng lực (Capacity)' },
    },
    fields: {
      name: { labelVi: 'Tên hạ tầng', ariaLabel: 'Tên hạ tầng' },
      siteCode: { labelVi: 'Mã định danh', ariaLabel: 'Mã định danh', placeholder: 'VD: KHO-SGN-01' },
      facilityType: { labelVi: 'Loại hạ tầng', ariaLabel: 'Loại hạ tầng' },
      operatingEntityId: { labelVi: 'Đơn vị trực thuộc', ariaLabel: 'Đơn vị trực thuộc' },
      status: { labelVi: 'Trạng thái vận hành', ariaLabel: 'Trạng thái vận hành' },
      gpsCoords: { labelVi: 'Tọa độ GPS', ariaLabel: 'Tọa độ GPS', placeholder: 'lat, lng' },
      addressDetail: { labelVi: 'Địa chỉ chi tiết', ariaLabel: 'Địa chỉ chi tiết' },
      hotline: { labelVi: 'Hotline điểm', ariaLabel: 'Hotline điểm' },
      directManager: { labelVi: 'Quản lý trực tiếp', ariaLabel: 'Quản lý trực tiếp' },
      leaseLegalEndDate: { labelVi: 'Thời hạn thuê / pháp lý', ariaLabel: 'Thời hạn thuê / pháp lý' },
      areaSqm: { labelVi: 'Diện tích (m²)', ariaLabel: 'Diện tích m2' },
      palletOrVehicleMax: { labelVi: 'Số lượng Pallet / Xe tối đa', ariaLabel: 'Pallet hoặc xe tối đa' },
      ownerLegalEntityId: { labelVi: 'Pháp nhân sở hữu', ariaLabel: 'Pháp nhân sở hữu' },
      capacitySummary: { labelVi: 'Tóm tắt sức chứa (cột danh sách)', ariaLabel: 'Tóm tắt sức chứa' },
    },
  };

  if (entity === 'comp-002') {
    return {
      blocks: {
        general: { blockCode: 'general', titleVi: 'Khối Vận hành kho (Hà Nội)' },
        location: { blockCode: 'location', titleVi: 'Khối Vị trí & liên hệ tuyến' },
        capacity: { blockCode: 'capacity', titleVi: 'Khối Năng lực (Capacity & tải)' },
      },
      fields: {
        ...base.fields,
        facilityType: { labelVi: 'Loại điểm vận hành', ariaLabel: 'Loại điểm vận hành' },
        status: { labelVi: 'Trạng thái khai thác', ariaLabel: 'Trạng thái khai thác' },
        gpsCoords: { labelVi: 'Tọa độ định tuyến', ariaLabel: 'Tọa độ định tuyến', placeholder: 'lat, lng' },
        hotline: { labelVi: 'Hotline điều phối', ariaLabel: 'Hotline điều phối' },
        directManager: { labelVi: 'Quản lý phụ trách', ariaLabel: 'Quản lý phụ trách' },
        areaSqm: { labelVi: 'Diện tích quy hoạch (m²)', ariaLabel: 'Diện tích m2' },
        palletOrVehicleMax: { labelVi: 'Sức chứa xe tối đa', ariaLabel: 'Sức chứa xe tối đa' },
        capacitySummary: { labelVi: 'Ghi chú tải trọng (cột danh sách)', ariaLabel: 'Ghi chú tải trọng' },
      },
    };
  }

  if (entity === 'comp-003') {
    return {
      blocks: {
        general: { blockCode: 'general', titleVi: 'Khối Hồ sơ cơ sở (Đà Nẵng)' },
        location: { blockCode: 'location', titleVi: 'Khối Tọa độ & thông tin đầu mối' },
        capacity: { blockCode: 'capacity', titleVi: 'Khối Năng lực (Capacity tổng hợp)' },
      },
      fields: {
        ...base.fields,
        name: { labelVi: 'Tên điểm logistics', ariaLabel: 'Tên điểm logistics' },
        facilityType: { labelVi: 'Nhóm cơ sở', ariaLabel: 'Nhóm cơ sở' },
        status: { labelVi: 'Tình trạng vận hành', ariaLabel: 'Tình trạng vận hành' },
        hotline: { labelVi: 'Số hotline bến bãi', ariaLabel: 'Số hotline bến bãi' },
        directManager: { labelVi: 'Quản lý trực tiếp', ariaLabel: 'Quản lý trực tiếp', visible: false },
        palletOrVehicleMax: {
          labelVi: 'Số lượng Pallet / Xe tối đa',
          ariaLabel: 'Pallet hoặc xe tối đa',
          visible: false,
        },
        capacitySummary: { labelVi: 'Ghi chú sức chứa (cột danh sách)', ariaLabel: 'Ghi chú sức chứa' },
      },
    };
  }

  if (entity === 'comp-004') {
    return {
      blocks: {
        general: { blockCode: 'general', titleVi: 'Khối Cơ sở vận hành (Cần Thơ)' },
        location: { blockCode: 'location', titleVi: 'Khối Vị trí & thông tin điều phối' },
        capacity: { blockCode: 'capacity', titleVi: 'Khối Năng lực (Capacity)' },
      },
      fields: {
        ...base.fields,
        operatingEntityId: { labelVi: 'Pháp nhân vận hành', ariaLabel: 'Pháp nhân vận hành' },
        ownerLegalEntityId: { labelVi: 'Pháp nhân đại diện', ariaLabel: 'Pháp nhân đại diện' },
        capacitySummary: { labelVi: 'Tóm tắt tải trọng (cột danh sách)', ariaLabel: 'Tóm tắt tải trọng' },
      },
    };
  }

  return base;
}

export function getMockEffectiveEmployeeMetadataDefaults(
  legalEntityId: string | null | undefined,
): MockEmployeeMetadataFieldRow[] {
  const entity = legalEntityId ?? 'global';

  // Global origin defaults
  const base: MockEmployeeMetadataFieldRow[] = [
    { id: 'emf-name', fieldName: 'Họ tên', dataType: 'text', selectConfig: '' },
    { id: 'emf-birth', fieldName: 'Ngày sinh', dataType: 'date', selectConfig: '' },
    { id: 'emf-gender', fieldName: 'Giới tính', dataType: 'select', selectConfig: 'Nam, Nữ' },
  ];

  // Entity variant override
  if (entity === 'comp-002') {
    return [
      ...base.slice(0, 2),
      { ...base[2], selectConfig: 'Nam, Nữ, Khác' },
      { id: 'emf-dept', fieldName: 'Phòng/Bộ phận', dataType: 'select', selectConfig: 'Vận tải, Kế toán, Tài chính' },
    ];
  }

  if (entity === 'comp-003') {
    return [
      ...base.slice(0, 2),
      { id: 'emf-gender', fieldName: 'Giới tính (ghi chú)', dataType: 'text', selectConfig: '' },
    ];
  }

  if (entity === 'comp-004') {
    return [
      ...base,
      { id: 'emf-cccd', fieldName: 'Số CCCD', dataType: 'text', selectConfig: '' },
    ];
  }

  // Fallback global origin
  return base;
}

