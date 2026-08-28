import fetch from 'node-fetch';

const API_URL = 'http://127.0.0.1:28001/api/hrm/bonus-policies';
const INTERNAL_KEY = 'xevn-dev-internal-key';
const COMPANY_ID = 'holding';

const missingPolicies = [
  // LX Tuyến
  {
    code: 'CONTRACT_FEE',
    name: 'Hợp đồng',
    type: 'salary',
    component_type: 'contract_fee',
    calculation_method: 'formula',
    extra_data: { contract_type: 'QĐ 2023', base_rate: 150000 }
  },
  {
    code: 'VEHICLE_REPAIR',
    name: 'Bảo dưỡng',
    type: 'deduction',
    component_type: 'vehicle_repair_deduction',
    calculation_method: 'fixed',
    base_value: 50000,
    extra_data: { frequency: 'monthly' }
  },
  {
    code: 'MEAL_ALLOWANCE',
    name: 'Ăn ca CN',
    type: 'allowance',
    component_type: 'meal_allowance_conditional',
    calculation_method: 'fixed',
    base_value: 30000,
    conditions: { min_hours_per_shift: 8, policy: 'QĐ 439' }
  },
  // LX Tải
  {
    code: 'TAI_REV_COM',
    name: 'Thưởng DT LX Tải',
    type: 'bonus',
    component_type: 'revenue_commission_tiered',
    calculation_method: 'tier',
    tiers: [
      { max_value: 50000000, rate_pct: 2 },
      { max_value: 100000000, rate_pct: 3 },
      { max_value: 9999999999, rate_pct: 5 }
    ]
  },
  {
    code: 'CLHD_DED',
    name: 'Điểm CLHĐ',
    type: 'deduction',
    component_type: 'clhd_point_deduction',
    calculation_method: 'formula',
    extra_data: { deduction_per_point_vnd: 20000 }
  },
  {
    code: 'LOADING_SUPP',
    name: 'Bốc xếp',
    type: 'allowance',
    component_type: 'loading_support',
    calculation_method: 'fixed',
    base_value: 100000
  },
  // ĐPHH
  {
    code: 'DPHH_REV_REC',
    name: 'HH hàng nhận',
    type: 'bonus',
    component_type: 'revenue_commission_tiered',
    calculation_method: 'tier',
    extra_data: { policy: 'QĐ 10/2024' },
    tiers: [
      { max_value: 200000000, rate_pct: 6 },
      { max_value: 9999999999, rate_pct: 8 }
    ]
  },
  {
    code: 'DELIVERY_COM',
    name: 'Giao hàng ship',
    type: 'bonus',
    component_type: 'delivery_commission',
    calculation_method: 'percentage',
    percentage_base: 'shipping_fee',
    extra_data: { pct: 70 }
  },
  // TĐ
  {
    code: 'TD_SHIFT_BONUS',
    name: 'Thưởng HĐ+TG',
    type: 'bonus',
    component_type: 'zero_sum_pool',
    calculation_method: 'formula',
    extra_data: { pool_key: 'TD_SHIFT', shift_type: 'morning/afternoon' }
  },
  {
    code: 'APP_ALLOWANCE',
    name: 'PC app',
    type: 'allowance',
    component_type: 'special_allowance',
    calculation_method: 'fixed',
    base_value: 200000
  },
  // Đặc thù
  {
    code: 'REMOTE_ALLOWANCE',
    name: 'PC xa nhà',
    type: 'allowance',
    component_type: 'remote_work_allowance',
    calculation_method: 'fixed',
    base_value: 500000
  }
];

async function seed() {
  console.log(`Starting to seed ${missingPolicies.length} missing policies...`);
  let successCount = 0;
  for (const policy of missingPolicies) {
    try {
      const res = await fetch(`${API_URL}?company_id=${COMPANY_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-api-key': INTERNAL_KEY
        },
        body: JSON.stringify({
          ...policy,
          effective_date: new Date().toISOString().split('T')[0]
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
  console.log(`Seeding complete. Success: ${successCount}/${missingPolicies.length}`);
}

seed();
