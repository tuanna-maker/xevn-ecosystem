import fetch from 'node-fetch';

const API_URL = 'http://127.0.0.1:28001/api/hrm/bonus-policies';
const INTERNAL_KEY = 'xevn-dev-internal-key';
const COMPANY_ID = 'holding';

const policiesToSeed = [
  // Nhóm 1: Chính sách chung
  {
    code: 'LCB_NB',
    name: 'Lương Cơ bản Ngạch-Bậc',
    type: 'allowance',
    component_type: 'grade_base',
    calculation_method: 'fixed',
    base_value: 0
  },
  {
    code: 'PCD_NG',
    name: 'Phụ cấp định mức theo ngạch',
    type: 'allowance',
    component_type: 'grade_allowance',
    calculation_method: 'fixed',
    base_value: 0,
    extra_data: { location_type: 'HN' }
  },
  {
    code: 'KPI_PCT',
    name: 'Thưởng KPI theo phần trăm',
    type: 'bonus',
    component_type: 'kpi_bonus_pct',
    calculation_method: 'percentage',
    percentage_base: 'LCB_NB'
  },
  // Nhóm 2: Lái xe Tuyến
  {
    code: 'L_TRIP',
    name: 'Lương lượt LX Tuyến',
    type: 'salary',
    component_type: 'trip_rate_tiered',
    calculation_method: 'tier',
    extra_data: { province_code: 'ND', support_rate_vnd: 200000, noibai_rate_vnd: 150000, sunday_meal_vnd: 25000 },
    tiers: [
      { max_value: 100, rate_vnd: 65000 },
      { max_value: 999999, rate_vnd: 70000 }
    ]
  },
  {
    code: 'L_REV_QUAL',
    name: 'Lương DT x CLDV',
    type: 'salary',
    component_type: 'revenue_quality',
    calculation_method: 'formula',
    extra_data: {
      province_code: 'ND',
      revenue_threshold_vnd: 100000000,
      tier1_pct: 3.5,
      tier2_pct: 4.5,
      cldv_table: [
        { min: 0, max: 50, multiplier: 0.5 },
        { min: 51, max: 80, multiplier: 0.8 },
        { min: 81, max: 100, multiplier: 1.0 }
      ]
    }
  },
  {
    code: 'CPN_COM',
    name: 'Hoa hồng CPN',
    type: 'bonus',
    component_type: 'cpn_commission',
    calculation_method: 'percentage',
    extra_data: { pct: 10 }
  },
  {
    code: 'ATT_BONUS',
    name: 'Thưởng chuyên cần LX Tuyến',
    type: 'bonus',
    component_type: 'attendance_bonus_conditional',
    calculation_method: 'fixed',
    base_value: 1000000,
    conditions: { min_working_days: 24, exclude_weekend: true }
  },
  // Nhóm 3: Lái xe Tải
  {
    code: 'LX_TAI_BASE',
    name: 'Lương cứng LX Tải',
    type: 'salary',
    component_type: 'fixed_base_salary',
    calculation_method: 'fixed',
    extra_data: { vehicle_type_code: 'QKR_2T_HOT' },
    base_value: 8000000
  },
  {
    code: 'LX_TAI_MGMT',
    name: 'Phụ cấp QLPT',
    type: 'allowance',
    component_type: 'vehicle_mgmt_allowance',
    calculation_method: 'fixed',
    base_value: 500000
  },
  {
    code: 'FUEL_DED',
    name: 'Khoán trừ nhiên liệu',
    type: 'deduction',
    component_type: 'fuel_quota_deduction',
    calculation_method: 'formula',
    extra_data: { vehicle_type_code: 'QKR_2T_HOT', quota_per_100km: 12.5 }
  },
  // Nhóm 4: Điều phối Hàng hóa
  {
    code: 'DPHH_KPI',
    name: 'Quỹ KPI Pool DPHH',
    type: 'bonus',
    component_type: 'kpi_pool_share',
    calculation_method: 'formula',
    extra_data: { pool_amount_vnd: 15000000, location_type: 'VP_NGOC_HOI', allocation_basis: 'working_days' }
  },
  {
    code: 'DPHH_REV_COM',
    name: 'Hoa hồng Gửi/Nhận',
    type: 'bonus',
    component_type: 'revenue_commission_tiered',
    calculation_method: 'tier',
    tiers: [
      { max_value: 150000000, rate_pct: 7.5 },
      { max_value: 200000000, rate_pct: 8.5 },
      { max_value: 9999999999, rate_pct: 9.5 }
    ]
  },
  {
    code: 'TEAM_MILESTONE',
    name: 'Vượt mốc VP',
    type: 'bonus',
    component_type: 'team_milestone_bonus',
    calculation_method: 'formula',
    extra_data: {
      office_code: 'VP_NGOC_HOI',
      milestones: [
        { threshold_vnd: 80000000, overachieve_pct: 5, bonus_team_vnd: 2000000 },
        { threshold_vnd: 92000000, overachieve_pct: 6, bonus_team_vnd: 3000000 }
      ]
    }
  },
  // Nhóm 5: Tổng đài Hành khách
  {
    code: 'TD_POOL',
    name: 'Pool Lương cơ sở TĐ',
    type: 'salary',
    component_type: 'zero_sum_pool',
    calculation_method: 'formula',
    extra_data: { pool_key: 'TD_1500', pool_amount_vnd: 5000000, allocation_basis: 'coefficient', min_attendance_pct: 50 }
  },
  {
    code: 'TD_KPI_MULT',
    name: 'Hệ số Nhỡ TĐ',
    type: 'deduction',
    component_type: 'kpi_multiplier',
    calculation_method: 'formula',
    extra_data: {
      thresholds: [
        { max_pct: 5, multiplier: 1.0 },
        { max_pct: 10, multiplier: 0.9 },
        { max_pct: 100, multiplier: 0.5 }
      ]
    }
  },
  {
    code: 'RANKING_BONUS',
    name: 'Top CLDV',
    type: 'bonus',
    component_type: 'ranking_bonus',
    calculation_method: 'formula',
    extra_data: {
      ranks: [
        { rank: 1, min_score: 95, bonus_vnd: 1000000 },
        { rank: 2, min_score: 90, bonus_vnd: 500000 }
      ]
    }
  },
  // Nhóm 6: Văn phòng Tỉnh
  {
    code: 'VP_TINH_POOL',
    name: 'Quỹ Lương VP Tỉnh',
    type: 'salary',
    component_type: 'zero_sum_pool',
    calculation_method: 'formula',
    extra_data: { pool_key: 'VP_TINH_ND', formula: 'Khach * DonGia + Xe * QLPT' }
  },
  // Nhóm 7: Đặc thù / Cố định thời hạn
  {
    code: 'LX_NEW_RATE',
    name: 'Lương lượt LX Mới',
    type: 'salary',
    component_type: 'trip_rate_tiered',
    calculation_method: 'tier',
    effective_date: '2026-08-01',
    expiry_date: '2027-08-01',
    tiers: [
      { max_value: 100, rate_vnd: 60000 },
      { max_value: 999999, rate_vnd: 65000 }
    ]
  },
  {
    code: 'TD_TRIAL',
    name: 'Lương thử việc TĐ',
    type: 'salary',
    component_type: 'fixed_trial_salary',
    calculation_method: 'fixed',
    base_value: 5000000
  }
];

async function seed() {
  const remainingPolicies = policiesToSeed.filter(p => ['TD_KPI_MULT', 'RANKING_BONUS', 'VP_TINH_POOL', 'LX_NEW_RATE', 'TD_TRIAL'].includes(p.code));
  console.log(`Starting to seed ${remainingPolicies.length} policies...`);
  let successCount = 0;
  for (const policy of remainingPolicies) {
    try {
      const res = await fetch(`${API_URL}?company_id=${COMPANY_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-api-key': INTERNAL_KEY
        },
        body: JSON.stringify({
          ...policy,
          effective_date: policy.effective_date || new Date().toISOString().split('T')[0]
        })
      });
      if (!res.ok) {
        const err = await res.text();
        console.error(`Failed to seed ${policy.code}: ${res.status} - ${err}`);
      } else {
        console.log(`Successfully seeded: ${policy.code}`);
        successCount++;
      }
    } catch (e: any) {
      console.error(`Network error seeding ${policy.code}:`, e.message);
    }
  }
  console.log(`Seeding complete. Success: ${successCount}/${policiesToSeed.length}`);
}

seed();
