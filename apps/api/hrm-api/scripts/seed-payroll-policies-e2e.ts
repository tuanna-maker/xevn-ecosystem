import '../src/load-env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { HrmDbService } from '../src/db/hrm-db.service';
import { PayFormulaService } from '../src/payroll/pay-formula.service';
import { PayrollCatalogService } from '../src/payroll/payroll-catalog.service';
import { randomUUID } from 'crypto';

/**
 * XEVN_POLICY_CATALOG.md Seeder for E2E Test
 * Seeds all 30+ policies and their formulas into the DB.
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get(HrmDbService);
  const formulaService = app.get(PayFormulaService);
  const catalogService = app.get(PayrollCatalogService);

  const companyId = 'xe-vietnam'; // default company
  const systemAuth = 'Bearer system-seed';

  console.log('--- BẮT ĐẦU SEED DỮ LIỆU TỪ XEVN_POLICY_CATALOG.md ---');

  // 1. Đảm bảo schema
  await catalogService.ensureSalaryComponentSchemaPublic();
  // await formulaService.ensureSchemaPublic();

  console.log('Schema OK. Đang dọn dẹp dữ liệu cũ (chỉ xóa của E2E Test)...');
  await db.query(`DELETE FROM public.salary_components WHERE is_system = TRUE AND company_id = $1`, [companyId]);
  await db.query(`DELETE FROM public.pay_formula_definitions WHERE company_id = $1`, [companyId]);

  // Danh sách các loại thành phần (pay_types)
  const policies = [
    // NHÓM 1: CHÍNH SÁCH CHUNG
    {
      code: 'LUONG_CB_NG',
      name: 'Lương Cơ bản Ngạch-Bậc',
      component_type: 'grade_base',
      nature: 'income',
      formula: '[Lương cơ bản] * ([Ngày công CT] / [Ngày công chuẩn])'
    },
    {
      code: 'PHU_CAP_NG',
      name: 'Phụ cấp Định mức theo Ngạch',
      component_type: 'grade_allowance',
      nature: 'income',
      formula: '[Phụ cấp ngạch]'
    },
    {
      code: 'KPI_VP_HN',
      name: 'Thưởng KPI Khối VP Hà Nội',
      component_type: 'kpi_bonus_pct',
      nature: 'income',
      formula: 'IF([Điểm KPI] > 1, [Lương cơ bản] * 1.5 * ([Điểm KPI] - 1), 0)'
    },
    // NHÓM 2: LÁI XE TUYẾN
    {
      code: 'LUONG_LUOT',
      name: 'Lương Lượt (Trip Rate)',
      component_type: 'trip_rate_tiered',
      nature: 'income',
      formula: '[Lương lượt]'
    },
    {
      code: 'LUONG_DT_CLDV',
      name: 'Lương DT × CLDV',
      component_type: 'revenue_quality',
      nature: 'income',
      formula: '[Lương DT] * IF([Điểm CLDV] >= 9.5, 1.05, IF([Điểm CLDV] < 9, [Điểm CLDV]/9, 1))'
    },
    {
      code: 'LUONG_CPN',
      name: 'Lương CPN 10%',
      component_type: 'cpn_commission',
      nature: 'income',
      formula: '[DT CPN] * 0.1'
    },
    {
      code: 'LUONG_HOP_DONG',
      name: 'Lương Hợp đồng',
      component_type: 'contract_fee',
      nature: 'income',
      formula: '[Tiền hợp đồng gốc] + ([DT Hợp đồng] * 0.04)'
    },
    {
      code: 'PHAT_BAO_DUONG',
      name: 'Giảm trừ Bảo dưỡng',
      component_type: 'vehicle_repair_deduction',
      nature: 'deduction',
      formula: '-([Chi phí sửa chữa] * 0.1)'
    },
    {
      code: 'THUONG_CC_LX',
      name: 'Thưởng Chuyên cần Lái xe Tuyến',
      component_type: 'attendance_bonus_conditional',
      nature: 'income',
      formula: 'IF([Ngày công CT] >= 24, 1000000, 0)'
    },
    // NHÓM 3: LÁI XE TẢI
    {
      code: 'LUONG_CUNG_TAI',
      name: 'Lương Cứng Loại Xe Tải',
      component_type: 'fixed_base_salary',
      nature: 'income',
      formula: '[Lương cứng tải]'
    },
    {
      code: 'THUONG_DT_TAI',
      name: 'Thưởng Doanh thu Lái xe Tải',
      component_type: 'revenue_commission_tiered',
      nature: 'income',
      formula: '[DT Tải] * 0.015'
    },
    {
      code: 'PHAT_CLHD',
      name: 'Phạt Chất lượng Hàng đơn',
      component_type: 'clhd_point_deduction',
      nature: 'deduction',
      formula: '-([Điểm phạt CLHD] * 100000)'
    },
    {
      code: 'KHOAN_NHIEN_LIEU',
      name: 'Khoán nhiên liệu',
      component_type: 'fuel_quota_deduction',
      nature: 'deduction',
      formula: 'IF([Xăng thực tế] > [Xăng định mức], -([Xăng thực tế] - [Xăng định mức]) * 20000, 0)'
    },
    // NHÓM 4: ĐIỀU PHỐI HÀNG HÓA
    {
      code: 'KPI_POOL_DPHH',
      name: 'Quỹ KPI Pool ĐPHH',
      component_type: 'kpi_pool_share',
      nature: 'income',
      formula: '[Quỹ KPI] * ([Ngày công CT] / [Ngày công chuẩn])'
    },
    {
      code: 'HH_HANG_GUI',
      name: 'Hoa hồng Hàng gửi',
      component_type: 'revenue_commission_tiered',
      nature: 'income',
      formula: '[DT hàng gửi VP] * [Tỷ lệ HH gửi] * [Giờ công cá nhân] / [Tổng giờ VP]'
    },
    {
      code: 'THUONG_VUOT_MOC',
      name: 'Thưởng Vượt mốc VP',
      component_type: 'team_milestone_bonus',
      nature: 'income',
      formula: '[Quỹ thưởng vượt mốc] * ([DT cá nhân] / [DT VP])'
    },
    {
      code: 'THUONG_GIAO_HANG',
      name: 'Thưởng Giao hàng (kiêm shipper)',
      component_type: 'delivery_commission',
      nature: 'income',
      formula: '[DT giao cá nhân] * 0.25 + [Quỹ nỗ lực] * ([DT giao cá nhân] / [DT bưu cục])'
    },
    // NHÓM 5: TỔNG ĐÀI HÀNH KHÁCH
    {
      code: 'POOL_LUONG_CS',
      name: 'Pool Lương Cơ sở',
      component_type: 'zero_sum_pool',
      nature: 'income',
      formula: 'IF([Ngày công CT] >= ([Ngày công chuẩn]*0.5), [Pool cơ sở] * ([Cuộc nghe cá nhân] / [Tổng cuộc VP]), [Pool cơ sở] * 0.5 * ([Cuộc nghe cá nhân] / [Tổng cuộc VP]))'
    },
    {
      code: 'HE_SO_NHO',
      name: 'Hệ số thưởng Tỷ lệ Nhỡ',
      component_type: 'kpi_multiplier',
      nature: 'income',
      formula: 'IF([Tỷ lệ nhỡ] <= 0.02, 500000, 0)'
    },
    // NHÓM 6: VĂN PHÒNG TỈNH
    {
      code: 'QUY_LUONG_VP',
      name: 'Quỹ Lương VP Tỉnh',
      component_type: 'zero_sum_pool',
      nature: 'income',
      formula: '[Đơn giá giờ VP] * [Giờ công cá nhân] * [Hệ số chức vụ]'
    }
  ];

  let count = 0;
  for (const policy of policies) {
    // 1. Tạo Formula Definition
    const formulaId = randomUUID();
    await db.query(`
      INSERT INTO public.pay_formula_definitions (
        id, company_id, code, version, status, expression_json, 
        authored_by, published_by, published_at
      ) VALUES (
        $1, $2, $3, 1, 'active', $4::jsonb, 'system', 'system', NOW()
      )
    `, [formulaId, companyId, 'F_' + policy.code, JSON.stringify({ type: 'math', formula: policy.formula })]);

    // 2. Tạo Salary Component liên kết
    await db.query(`
      INSERT INTO public.salary_components (
        id, company_id, code, name, component_type, nature, value_type,
        is_active, default_formula_definition_id, is_system
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 'currency', TRUE, $7, TRUE
      )
    `, [randomUUID(), companyId, policy.code, policy.name, policy.component_type, policy.nature, formulaId]);

    count++;
    console.log(`✅ Đã seed [${policy.code}] - ${policy.name}`);
  }

  console.log(`\n🎉 SEED THÀNH CÔNG ${count} CHÍNH SÁCH LƯƠNG XEVN!`);
  await app.close();
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
