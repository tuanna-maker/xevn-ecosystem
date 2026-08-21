import type { CatalogExtensionItemDto } from './dto/append-extension-items.dto';

/** Danh mục quản lý phương tiện — CT Du lịch X.E (tenant xe-du-lich), bổ sung ngoài bộ HR chung tập đoàn. */
export const TOURISM_TENANT_ID = 'xe-du-lich';
export const TOURISM_COMPANY_ID = 'main';

export type TourismFleetCatalogDef = {
  catalogKey: string;
  name: string;
  domain: string;
  items: CatalogExtensionItemDto[];
};

export const TOURISM_FLEET_CATALOGS: TourismFleetCatalogDef[] = [
  {
    catalogKey: 'hrm_fleet_driver_fields',
    name: 'Lái xe & tuyến',
    domain: 'hrm_fleet',
    items: [
      {
        code: 'driver_name',
        label: 'Tên lái xe',
        unit: 'text',
        status: 'active',
      },
      {
        code: 'driver_phone',
        label: 'SĐT lái xe',
        unit: 'phone',
        status: 'active',
      },
      { code: 'route_name', label: 'Tuyến', unit: 'text', status: 'active' },
      {
        code: 'usage_purpose',
        label: 'Mục đích sử dụng',
        unit: 'text',
        status: 'active',
      },
    ],
  },
  {
    catalogKey: 'hrm_fleet_vehicle_fields',
    name: 'Thông tin xe',
    domain: 'hrm_fleet',
    items: [
      { code: 'license_plate', label: 'BKS', unit: 'text', status: 'active' },
      {
        code: 'chassis_number',
        label: 'Số khung',
        unit: 'text',
        status: 'active',
      },
      {
        code: 'engine_number',
        label: 'Số máy',
        unit: 'text',
        status: 'active',
      },
      {
        code: 'production_year',
        label: 'Năm sản xuất',
        unit: 'number',
        status: 'active',
      },
      {
        code: 'manufacturer',
        label: 'Hãng sản xuất',
        unit: 'text',
        status: 'active',
      },
      { code: 'model', label: 'Model', unit: 'text', status: 'active' },
      {
        code: 'seat_capacity',
        label: 'Số chỗ (không gồm LX)',
        unit: 'number',
        status: 'active',
      },
      {
        code: 'current_odometer_km',
        label: 'Số KM hiện tại',
        unit: 'number',
        status: 'active',
      },
      {
        code: 'operation_start_date',
        label: 'Ngày bắt đầu hoạt động xe',
        unit: 'date',
        status: 'active',
      },
    ],
  },
  {
    catalogKey: 'hrm_fleet_registration_fields',
    name: 'Đăng ký & đăng kiểm',
    domain: 'hrm_fleet',
    items: [
      {
        code: 'first_registration_date',
        label: 'Ngày đăng ký lần đầu',
        unit: 'date',
        status: 'active',
      },
      {
        code: 'first_inspection_date',
        label: 'Ngày đăng kiểm lần đầu',
        unit: 'date',
        status: 'active',
      },
      {
        code: 'vehicle_registration_date',
        label: 'Ngày đăng ký xe',
        unit: 'date',
        status: 'active',
      },
      {
        code: 'inspection_date',
        label: 'Ngày đăng kiểm',
        unit: 'date',
        status: 'active',
      },
      {
        code: 'inspection_expiry_date',
        label: 'Ngày hết hạn đăng kiểm',
        unit: 'date',
        status: 'active',
      },
    ],
  },
  {
    catalogKey: 'hrm_fleet_insurance_fields',
    name: 'Bảo hiểm xe',
    domain: 'hrm_fleet',
    items: [
      {
        code: 'tpl_insurance_issue_date',
        label: 'Ngày cấp bảo hiểm TNDS',
        unit: 'date',
        status: 'active',
      },
      {
        code: 'tpl_insurance_expiry_date',
        label: 'Ngày hết hạn bảo hiểm TNDS',
        unit: 'date',
        status: 'active',
      },
      {
        code: 'comprehensive_insurance_issue_date',
        label: 'Ngày cấp bảo hiểm vật chất xe',
        unit: 'date',
        status: 'active',
      },
      {
        code: 'comprehensive_insurance_expiry_date',
        label: 'Ngày hết hạn bảo hiểm vật chất xe',
        unit: 'date',
        status: 'active',
      },
    ],
  },
  {
    catalogKey: 'hrm_fleet_permit_fields',
    name: 'Phù hiệu & giấy đi đường',
    domain: 'hrm_fleet',
    items: [
      {
        code: 'badge_issue_date',
        label: 'Ngày cấp phù hiệu',
        unit: 'date',
        status: 'active',
      },
      {
        code: 'badge_expiry_date',
        label: 'Ngày hết hạn phù hiệu',
        unit: 'date',
        status: 'active',
      },
      {
        code: 'road_permit_issue_date',
        label: 'Ngày cấp giấy đi đường',
        unit: 'date',
        status: 'active',
      },
      {
        code: 'road_permit_expiry_date',
        label: 'Ngày hết hạn giấy đi đường',
        unit: 'date',
        status: 'active',
      },
    ],
  },
  {
    catalogKey: 'hrm_fleet_road_fee_fields',
    name: 'Phí bảo trì đường bộ',
    domain: 'hrm_fleet',
    items: [
      {
        code: 'road_maintenance_fee',
        label: 'Phí bảo trì đường bộ',
        unit: 'currency',
        status: 'active',
      },
      {
        code: 'road_fee_payment_date',
        label: 'Ngày đóng phí bảo trì',
        unit: 'date',
        status: 'active',
      },
      {
        code: 'road_fee_expiry_date',
        label: 'Ngày hết hạn phí bảo trì',
        unit: 'date',
        status: 'active',
      },
    ],
  },
  {
    catalogKey: 'hrm_fleet_telecom_fields',
    name: 'Viễn thông / SIM',
    domain: 'hrm_fleet',
    items: [
      {
        code: 'mobile_plan',
        label: 'Gói cước di động',
        unit: 'text',
        status: 'active',
      },
      {
        code: 'mobile_carrier',
        label: 'Nhà mạng',
        unit: 'text',
        status: 'active',
      },
      {
        code: 'sim_registration_date',
        label: 'Ngày đăng ký SIM',
        unit: 'date',
        status: 'active',
      },
      {
        code: 'sim_expiry_date',
        label: 'Ngày hết hạn SIM',
        unit: 'date',
        status: 'active',
      },
    ],
  },
  {
    catalogKey: 'hrm_fleet_gps_fields',
    name: 'Thiết bị định vị',
    domain: 'hrm_fleet',
    items: [
      {
        code: 'gps_device',
        label: 'Thiết bị định vị',
        unit: 'text',
        status: 'active',
      },
      {
        code: 'gps_install_date',
        label: 'Ngày lắp định vị',
        unit: 'date',
        status: 'active',
      },
    ],
  },
  {
    catalogKey: 'hrm_fleet_finance_fields',
    name: 'Tài chính vay xe',
    domain: 'hrm_fleet',
    items: [
      {
        code: 'loan_organization',
        label: 'Tổ chức vay',
        unit: 'text',
        status: 'active',
      },
      { code: 'loan_date', label: 'Ngày vay', unit: 'date', status: 'active' },
      {
        code: 'loan_amount',
        label: 'Số tiền vay',
        unit: 'currency',
        status: 'active',
      },
    ],
  },
];
