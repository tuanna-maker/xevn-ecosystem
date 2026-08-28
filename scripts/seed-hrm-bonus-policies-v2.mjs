import http from 'http';

const policies = [
  {
    company_id: 'xevn',
    code: 'POL_GRADE_BASE',
    name: 'Lương Cơ bản Ngạch-Bậc',
    type: 'monthly',
    component_type: 'grade_base',
    calculation_method: 'fixed',
    base_value: 0,
    effective_date: '2026-01-01',
    status: 'active',
    extra_data: [],
    conditions: []
  },
  {
    company_id: 'xevn',
    code: 'POL_GRADE_ALLOWANCE_HN',
    name: 'Phụ cấp Định mức (HN)',
    type: 'monthly',
    component_type: 'grade_allowance',
    calculation_method: 'fixed',
    base_value: 0,
    effective_date: '2025-06-01',
    status: 'active',
    extra_data: [
      { key: 'location_type', source: 'manual', default_value: 'HN' }
    ],
    conditions: []
  },
  {
    company_id: 'xevn',
    code: 'POL_KPI_BONUS_VP',
    name: 'Thưởng KPI % Khối VP HN',
    type: 'monthly',
    component_type: 'kpi_bonus_pct',
    calculation_method: 'percentage',
    base_value: 0,
    percentage_base: 'base_salary',
    effective_date: '2025-01-01',
    status: 'active',
    extra_data: [
      { key: 'max_pct', source: 'manual', default_value: '28' },
      { key: 'overachieve_multiplier', source: 'manual', default_value: '1.5' }
    ],
    conditions: []
  },
  {
    company_id: 'xevn',
    code: 'POL_TRIP_RATE_ND',
    name: 'Lương Lượt Nam Định',
    type: 'monthly',
    component_type: 'trip_rate_tiered',
    calculation_method: 'tier',
    base_value: 0,
    effective_date: '2025-09-01',
    status: 'active',
    tiers: [
      { from: 1, to: 100, value: 65000, type: 'fixed' },
      { from: 101, to: 9999, value: 70000, type: 'fixed' }
    ],
    extra_data: [
      { key: 'province_code', source: 'manual', default_value: 'ND' },
      { key: 'support_rate_vnd', source: 'manual', default_value: '70000' },
      { key: 'noibai_rate_vnd', source: 'manual', default_value: '50000' },
      { key: 'sunday_meal_vnd', source: 'manual', default_value: '25000' }
    ],
    conditions: []
  },
  {
    company_id: 'xevn',
    code: 'POL_REV_QUALITY_ND',
    name: 'Lương Doanh thu x CLDV (Nam Định)',
    type: 'monthly',
    component_type: 'revenue_quality',
    calculation_method: 'formula',
    base_value: 0,
    effective_date: '2020-01-01',
    status: 'active',
    extra_data: [
      { key: 'province_code', source: 'manual', default_value: 'ND' },
      { key: 'revenue_threshold_vnd', source: 'manual', default_value: '100000000' },
      { key: 'tier1_pct', source: 'manual', default_value: '4' },
      { key: 'tier2_pct', source: 'manual', default_value: '8' },
      { 
        key: 'cldv_table', 
        source: 'manual', 
        default_value: JSON.stringify([
          { min: 0, max: 8.99, multiplier: 'điểm/9' },
          { min: 9.0, max: 9.19, multiplier: 1.0 },
          { min: 9.2, max: 9.59, multiplier: 1.1 },
          { min: 9.6, max: 10, multiplier: 1.2 }
        ])
      }
    ],
    conditions: []
  },
  {
    company_id: 'xevn',
    code: 'POL_ATTENDANCE_MEAL_CN',
    name: 'Phụ cấp ăn ca Chủ Nhật (Tất cả Tuyến)',
    type: 'monthly',
    component_type: 'meal_allowance_conditional',
    calculation_method: 'fixed',
    base_value: 25000,
    effective_date: '2025-09-01',
    status: 'active',
    extra_data: [],
    conditions: [
      'is_sunday:true'
    ]
  },
  {
    company_id: 'xevn',
    code: 'POL_CPN_COMMISSION',
    name: 'Hoa hồng CPN',
    type: 'monthly',
    component_type: 'cpn_commission',
    calculation_method: 'percentage',
    base_value: 0,
    percentage_base: 'revenue_cpn',
    effective_date: '2020-01-01',
    status: 'active',
    extra_data: [
      { key: 'pct', source: 'manual', default_value: '10' }
    ],
    conditions: []
  },
  {
    company_id: 'xevn',
    code: 'POL_CONTRACT_FEE',
    name: 'Phí trả hợp đồng (Tour)',
    type: 'monthly',
    component_type: 'contract_fee',
    calculation_method: 'formula',
    base_value: 0,
    effective_date: '2020-01-01',
    status: 'active',
    extra_data: [
      { 
        key: 'fee_table', 
        source: 'manual', 
        default_value: JSON.stringify([
          { type: 'type_1', flat_vnd: 200000, revenue_pct: 0 },
          { type: 'type_2', flat_vnd: 0, revenue_pct: 5 }
        ])
      }
    ],
    conditions: []
  },
  {
    company_id: 'xevn',
    code: 'POL_VEHICLE_REPAIR_DED',
    name: 'Trừ phí bảo dưỡng xe',
    type: 'monthly',
    component_type: 'vehicle_repair_deduction',
    calculation_method: 'formula',
    base_value: 0,
    effective_date: '2020-01-01',
    status: 'active',
    extra_data: [
      { key: 'province_code', source: 'manual', default_value: 'ND' },
      { key: 'group_pct', source: 'manual', default_value: '2' },
      { key: 'personal_accident_pct', source: 'manual', default_value: '10' },
      { key: 'ford_override_pct', source: 'manual', default_value: '10' }
    ],
    conditions: []
  },
  {
    company_id: 'xevn',
    code: 'POL_FIXED_SALARY_TAI_2T',
    name: 'Lương cứng Tải QKR 2T',
    type: 'monthly',
    component_type: 'fixed_base_salary',
    calculation_method: 'fixed',
    base_value: 5000000,
    effective_date: '2020-01-01',
    status: 'active',
    extra_data: [
      { key: 'vehicle_type_code', source: 'manual', default_value: 'QKR_2T_HOT' }
    ],
    conditions: []
  },
  {
    company_id: 'xevn',
    code: 'POL_VEHICLE_MGMT_ALLOWANCE',
    name: 'Phụ cấp QLPT Tải',
    type: 'monthly',
    component_type: 'vehicle_mgmt_allowance',
    calculation_method: 'fixed',
    base_value: 2000000,
    effective_date: '2020-01-01',
    status: 'active',
    extra_data: [],
    conditions: [
      'min_working_days:24'
    ]
  },
  {
    company_id: 'xevn',
    code: 'POL_REV_COMMISSION_TAI',
    name: 'Thưởng Doanh thu Tải',
    type: 'monthly',
    component_type: 'revenue_commission_tiered',
    calculation_method: 'tier',
    base_value: 0,
    effective_date: '2020-01-01',
    status: 'active',
    tiers: [
      { from: 1, to: 80000000, value: 5, type: 'percentage' },
      { from: 80000001, to: 999999999, value: 6, type: 'percentage' }
    ],
    extra_data: [
      { key: 'driver_type', source: 'manual', default_value: 'MAIN' }
    ],
    conditions: []
  },
  {
    company_id: 'xevn',
    code: 'POL_FUEL_QUOTA_DED',
    name: 'Trừ âm khoán nhiên liệu',
    type: 'monthly',
    component_type: 'fuel_quota_deduction',
    calculation_method: 'formula',
    base_value: 0,
    effective_date: '2020-01-01',
    status: 'active',
    extra_data: [
      { key: 'vehicle_type_code', source: 'manual', default_value: 'NPR_35T_COLD' },
      { key: 'quota_per_100km', source: 'manual', default_value: '12.5' }
    ],
    conditions: []
  },
  {
    company_id: 'xevn',
    code: 'POL_CLHD_POINT_DED',
    name: 'Trừ điểm CLHĐ Tải',
    type: 'monthly',
    component_type: 'clhd_point_deduction',
    calculation_method: 'formula',
    base_value: 0,
    effective_date: '2020-01-01',
    status: 'active',
    extra_data: [
      { key: 'vnd_per_point', source: 'manual', default_value: '100000' },
      { 
        key: 'penalty_table', 
        source: 'manual', 
        default_value: JSON.stringify([
          { violation: 'Lateness', points: 1 },
          { violation: 'Customer_Complaint', points: 3 }
        ])
      }
    ],
    conditions: []
  },
  {
    company_id: 'xevn',
    code: 'POL_KPI_POOL_TD',
    name: 'Quỹ KPI Tổng đài',
    type: 'monthly',
    component_type: 'kpi_pool_share',
    calculation_method: 'formula',
    base_value: 0,
    effective_date: '2020-01-01',
    status: 'active',
    extra_data: [
      { key: 'pool_amount_vnd', source: 'manual', default_value: '50000000' },
      { key: 'location_type', source: 'manual', default_value: 'HN' },
      { key: 'allocation_basis', source: 'manual', default_value: 'working_days' }
    ],
    conditions: []
  },
  {
    company_id: 'xevn',
    code: 'POL_TEAM_MILESTONE_VP',
    name: 'Thưởng vượt mốc DT Văn phòng',
    type: 'monthly',
    component_type: 'team_milestone_bonus',
    calculation_method: 'formula',
    base_value: 0,
    effective_date: '2020-01-01',
    status: 'active',
    extra_data: [
      { key: 'office_code', source: 'manual', default_value: 'VP_NAM_DINH' },
      { 
        key: 'milestones', 
        source: 'manual', 
        default_value: JSON.stringify([
          { threshold_vnd: 200000000, overachieve_pct: 10, bonus_team_vnd: 5000000 },
          { threshold_vnd: 300000000, overachieve_pct: 15, bonus_team_vnd: 10000000 }
        ])
      }
    ],
    conditions: []
  },
  {
    company_id: 'xevn',
    code: 'POL_DELIVERY_COMMISSION',
    name: 'Thưởng giao hàng DPHH',
    type: 'monthly',
    component_type: 'delivery_commission',
    calculation_method: 'fixed',
    base_value: 5000, // per order
    effective_date: '2020-01-01',
    status: 'active',
    extra_data: [],
    conditions: []
  },
  {
    company_id: 'xevn',
    code: 'POL_ZERO_SUM_POOL',
    name: 'Quỹ Zero-Sum',
    type: 'monthly',
    component_type: 'zero_sum_pool',
    calculation_method: 'formula',
    base_value: 0,
    effective_date: '2020-01-01',
    status: 'active',
    extra_data: [
      { key: 'pool_size', source: 'manual', default_value: '30000000' }
    ],
    conditions: []
  },
  {
    company_id: 'xevn',
    code: 'POL_KPI_MULTIPLIER',
    name: 'Hệ số KPI (Multiplier)',
    type: 'monthly',
    component_type: 'kpi_multiplier',
    calculation_method: 'formula',
    base_value: 0,
    effective_date: '2020-01-01',
    status: 'active',
    extra_data: [],
    conditions: []
  },
  {
    company_id: 'xevn',
    code: 'POL_RANKING_BONUS',
    name: 'Thưởng Top Ranking',
    type: 'monthly',
    component_type: 'ranking_bonus',
    calculation_method: 'formula',
    base_value: 0,
    effective_date: '2020-01-01',
    status: 'active',
    extra_data: [
      { 
        key: 'top_rewards', 
        source: 'manual', 
        default_value: JSON.stringify([
          { rank: 1, reward_vnd: 5000000 },
          { rank: 2, reward_vnd: 3000000 },
          { rank: 3, reward_vnd: 1000000 }
        ])
      }
    ],
    conditions: []
  },
  {
    code: 'POL_LOADING_SUPPORT',
    name: 'Hỗ trợ Bốc xếp Tải',
    type: 'monthly',
    component_type: 'loading_support',
    calculation_method: 'fixed',
    base_value: 4400000,
    effective_date: '2020-01-01',
    status: 'active',
    extra_data: [
      { key: 'driver_type', source: 'manual', default_value: 'TC_LOGISTIC' }
    ],
    conditions: []
  },
  {
    code: 'POL_REMOTE_WORK',
    name: 'Phụ cấp Xa nhà / Tăng cường',
    type: 'monthly',
    component_type: 'remote_work_allowance',
    calculation_method: 'fixed',
    base_value: 3000000,
    effective_date: '2025-01-01',
    status: 'active',
    extra_data: [
      { key: 'location', source: 'manual', default_value: 'Ninh Binh' }
    ],
    conditions: []
  },
  {
    code: 'POL_SPECIAL_APP',
    name: 'Phụ cấp Hỗ trợ App X.E',
    type: 'monthly',
    component_type: 'special_allowance',
    calculation_method: 'formula',
    base_value: 0,
    effective_date: '2025-10-23',
    status: 'active',
    extra_data: [
      { key: 'rate_per_hour', source: 'manual', default_value: '37607' }
    ],
    conditions: []
  },
  {
    code: 'POL_DPHH_HANG_GUI',
    name: 'Hoa hồng Hàng gửi VP',
    type: 'monthly',
    component_type: 'revenue_commission_tiered',
    calculation_method: 'formula',
    base_value: 0,
    effective_date: '2024-10-01',
    status: 'active',
    extra_data: [
      { key: 'commission_type', source: 'manual', default_value: 'GUI' },
      { 
        key: 'commission_table', 
        source: 'manual', 
        default_value: JSON.stringify([
          { max_dt_vnd: 150000000, pct: 7.5 },
          { max_dt_vnd: 200000000, pct: 8.5 },
          { max_dt_vnd: 300000000, pct: 9.5 },
          { max_dt_vnd: 9999999999, pct: 10.5 }
        ])
      }
    ],
    conditions: []
  },
  {
    code: 'POL_DPHH_HANG_NHAN',
    name: 'Hoa hồng Hàng nhận VP',
    type: 'monthly',
    component_type: 'revenue_commission_tiered',
    calculation_method: 'formula',
    base_value: 0,
    effective_date: '2024-10-01',
    status: 'active',
    extra_data: [
      { key: 'commission_type', source: 'manual', default_value: 'NHAN' },
      { 
        key: 'commission_table', 
        source: 'manual', 
        default_value: JSON.stringify([
          { max_dt_vnd: 300000000, pct: 2.0 },
          { max_dt_vnd: 9999999999, pct: 3.0 }
        ])
      }
    ],
    conditions: []
  },
  {
    code: 'POL_ATTENDANCE_BONUS',
    name: 'Thưởng Chuyên cần Tuyến',
    type: 'monthly',
    component_type: 'attendance_bonus_conditional',
    calculation_method: 'fixed',
    base_value: 1000000,
    effective_date: '2026-04-01',
    status: 'active',
    extra_data: [],
    conditions: [
      'min_working_days:24',
      'no_leave:FRI,SAT,SUN'
    ]
  },
  {
    code: 'POL_TD_THUONG_HD',
    name: 'Thưởng Hợp đồng & TG TĐ',
    type: 'monthly',
    component_type: 'zero_sum_pool',
    calculation_method: 'formula',
    base_value: 0,
    effective_date: '2024-01-01',
    status: 'active',
    extra_data: [
      { key: 'hd_ca_sang', source: 'manual', default_value: '600000' },
      { key: 'hd_ca_chieu', source: 'manual', default_value: '800000' },
      { key: 'tg_ca_sang', source: 'manual', default_value: '700000' },
      { key: 'tg_ca_chieu', source: 'manual', default_value: '1500000' }
    ],
    conditions: []
  },
  {
    code: 'POL_VP_TINH_POOL',
    name: 'Quỹ lương VP Tỉnh',
    type: 'monthly',
    component_type: 'zero_sum_pool',
    calculation_method: 'formula',
    base_value: 0,
    effective_date: '2020-01-01',
    status: 'active',
    extra_data: [
      { key: 'province_code', source: 'manual', default_value: 'TB' },
      { key: 'price_per_customer', source: 'manual', default_value: '7500' },
      { key: 'qlpt_per_car', source: 'manual', default_value: '500000' }
    ],
    conditions: []
  },
  {
    code: 'POL_TD_THU_VIEC',
    name: 'Lương Thử việc Tổng đài',
    type: 'monthly',
    component_type: 'fixed_base_salary',
    calculation_method: 'fixed',
    base_value: 6000000,
    effective_date: '2025-09-01',
    status: 'active',
    extra_data: [
      { key: 'shift', source: 'manual', default_value: 'MORNING' }
    ],
    conditions: [
      'is_probation:true'
    ]
  },
  {
    code: 'POL_NEW_DRIVER_FLAT',
    name: 'Lượt phẳng LX mới NB',
    type: 'monthly',
    component_type: 'trip_rate_tiered',
    calculation_method: 'fixed',
    base_value: 140000,
    effective_date: '2025-01-01',
    status: 'active',
    extra_data: [
      { key: 'province_code', source: 'manual', default_value: 'NB' }
    ],
    conditions: [
      'is_new_driver:true'
    ]
  }
];

// In a real script we would seed all 30, but testing 20 complex ones is sufficient for the E2E.

function postData(data) {
  return new Promise((resolve, reject) => {
    // Re-add company_id to the payload because we updated the DTO
    const payload = { ...data, company_id: 'main' };
    const postDataString = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 28001,
      path: '/api/hrm/bonus-policies',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postDataString),
        'x-internal-api-key': 'xevn-dev-internal-key'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postDataString);
    req.end();
  });
}

async function run() {
  console.log('Seeding ' + policies.length + ' bonus policies via DTO Validation API...');
  let successCount = 0;
  for (const p of policies) {
    try {
      const { status, body } = await postData(p);
      if (status === 200 || status === 201) {
        console.log(`[SUCCESS] Created ${p.code}`);
        successCount++;
      } else {
        console.error(`[FAILED] Code: ${p.code} - Status: ${status} - Response: ${body}`);
      }
    } catch (e) {
      console.error(`[ERROR] Code: ${p.code} - ${e.message}`);
    }
  }
  console.log(`\nFinished: ${successCount}/${policies.length} seeded successfully.`);
}

run();
