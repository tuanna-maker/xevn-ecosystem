import { FormulaCalculator } from './src/payroll/engine/calculators/formula.calculator';
import { CalcContext } from './src/payroll/engine/calculator.interface';

async function runDphhPayroll() {
  const calc = new FormulaCalculator();
  
  // 1. Cấu hình DB Mapping (Giả lập màn hình Danh mục Thành phần lương)
  const catalogMap = {
    'Lương cơ bản': 'base_salary',
    'Ngày công CT': 'standard_days',
    'Doanh thu hàng gửi': 'revenue_dthg',
    'Hoa hồng tuyến mới': 'commission_new_route',
    'Quỹ lương KPI': 'kpi_fund',
    'Điểm KPI/ tháng (%)': 'kpi_score',
    'Tiền thưởng vi phạm QC': 'qc_bonus',
    'Tiền phạt vi phạm QC': 'qc_penalty',
    'Số phút đi muộn': 'late_mins',
    'Số phút về sớm': 'early_mins',
    'Quên GIP': 'forgot_gip'
  };

  // 2. Dữ liệu đầu vào của nhân viên Nguyễn Văn A (Giả lập Input Bag gom từ Hợp đồng + Chấm công + Import)
  const inputBag = {
    'base_salary': 8000000,          // Từ Hợp đồng
    'standard_days': 26,             // Từ Chấm công
    'revenue_dthg': 650000000,       // Đạt 650 triệu (Mức 2: > 500tr -> 5tr)
    'kpi_fund': 5000000,             // Quỹ KPI
    'kpi_score': 1.15,               // Đạt 115% KPI
    'commission_new_route': 1200000, // Hoa hồng
    'qc_bonus': 500000,              // Thưởng quy chuẩn
    'qc_penalty': 0,
    'late_mins': 30,
    'early_mins': 0,
    'forgot_gip': 2                  // Quên quẹt thẻ 2 lần
  };

  // 3. Khai báo các chính sách lương (Policies) theo file Excel
  const policies = [
    {
      name: 'Lương thời gian',
      formula: '[Lương cơ bản] * ([Ngày công CT] / 26)'
    },
    {
      name: 'Lương DTHG',
      formula: 'IF([Doanh thu hàng gửi] >= 1000000000, 7000000, IF([Doanh thu hàng gửi] >= 500000000, 5000000, 3000000))'
    },
    {
      name: 'Thưởng/Phạt KPI',
      formula: '[Quỹ lương KPI] + IF([Điểm KPI/ tháng (%)] > 1, 1.5 * ([Điểm KPI/ tháng (%)] - 1) * [Quỹ lương KPI], IF([Điểm KPI/ tháng (%)] < 1, ([Điểm KPI/ tháng (%)] - 1) * [Quỹ lương KPI], 0))'
    },
    {
      name: 'Hoa hồng',
      formula: '[Hoa hồng tuyến mới]'
    },
    {
      name: 'Thưởng / Phạt QC',
      formula: '[Tiền thưởng vi phạm QC] - [Tiền phạt vi phạm QC]'
    },
    {
      name: 'Phạt Vi phạm thời gian & GIP',
      formula: '-((([Số phút đi muộn] + [Số phút về sớm]) / 60) * 50000) - ([Quên GIP] * 100000)'
    }
  ];

  console.log('--- BẢNG TÍNH LƯƠNG NHÂN VIÊN: NGUYỄN VĂN A (BỘ PHẬN ĐPHH) ---');
  console.log('Dữ liệu đầu vào:', JSON.stringify(inputBag, null, 2));
  console.log('\n--- CHI TIẾT TÍNH TOÁN CÁC KHOẢN ---');

  let totalSalary = 0n;
  const payslip: Record<string, string> = {};

  // 4. Chạy Payroll Engine
  for (const policy of policies) {
    const ctx: CalcContext = {
      employeeId: 'NV_001',
      periodMonth: new Date(),
      attendance: {},
      gradeStep: null,
      catalogMap,
      inputBag,
      component: {
        type: 'FORMULA',
        params: { formula: policy.formula }
      }
    };
    
    const res = await calc.calculate(ctx);
    
    console.log(`\n🔹 ${policy.name}:`);
    console.log(`   Công thức gốc: ${policy.formula}`);
    console.log(`   Đã ánh xạ DB : ${res.breakdown.parsed_formula}`);
    console.log(`   >> KẾT QUẢ   : ${res.amount_vnd.toLocaleString('vi-VN')} VNĐ`);
    
    totalSalary += res.amount_vnd;
    payslip[policy.name] = res.amount_vnd.toLocaleString('vi-VN') + ' VNĐ';
  }

  console.log('\n======================================================');
  console.log(`💰 TỔNG THU NHẬP THỰC LÃNH: ${totalSalary.toLocaleString('vi-VN')} VNĐ`);
  console.log('======================================================');
}

runDphhPayroll().catch(console.error);
