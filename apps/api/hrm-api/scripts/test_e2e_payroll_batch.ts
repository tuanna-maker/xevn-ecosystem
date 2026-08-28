import '../src/load-env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PayFormulaService } from '../src/payroll/pay-formula.service';
import { FormulaCalculator } from '../src/payroll/engine/calculators/formula.calculator';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const formulaService = app.get(PayFormulaService);
  
  console.log('--- KHỞI ĐỘNG KỲ LƯƠNG 08/2026 ---');
  const companyId = 'xe-vietnam';
  const periodMonth = '2026-08';

  // Lấy toàn bộ policies từ DB
  console.log('Đang tải cấu hình chính sách từ DB...');
  const res = await formulaService.listFormulas({ company_id: companyId, active_only: 'true' });
  const policies = res.items;
  console.log(`Đã tải thành công ${policies.length} chính sách áp dụng cho kỳ này.`);
  
  if (policies.length === 0) {
    console.error('LỖI: Không tìm thấy chính sách nào. Hãy chạy script seed trước!');
    await app.close();
    return;
  }

  const formulaCalc = new FormulaCalculator();

  console.log('\n--- 1. CHẠY LƯƠNG NHÂN VIÊN VĂN PHÒNG ---');
  const vpEmp = { employeeId: 'emp-01', name: 'Nguyễn Văn VP', department: 'Kế toán' };
  const vpInputs = {
    'Lương cơ bản': 12000000,
    'Ngày công chuẩn': 26,
    'Ngày công CT': 26,
    'Phụ cấp ngạch': 1500000,
    'Điểm KPI': 1.2
  };
  console.log(`Nhân sự: ${vpEmp.name} | Đầu vào:`, vpInputs);
  let vpTotal = 0n;
  for (const pol of policies) {
    const res = await formulaCalc.calculate({
        component: {
            params: pol.expressionJson
        },
        inputBag: vpInputs,
        attendance: {},
        gradeStep: null,
        employeeId: vpEmp.employeeId,
        periodMonth: new Date()
    });
    if (res && res.amount_vnd !== 0n) {
        console.log(`  + [${pol.code}]: ${Number(res.amount_vnd).toLocaleString('vi-VN')} VNĐ`);
        vpTotal += res.amount_vnd;
    }
  }
  console.log(`>> TỔNG LƯƠNG: ${Number(vpTotal).toLocaleString('vi-VN')} VNĐ\n`);

  console.log('--- 2. CHẠY LƯƠNG LÁI XE TUYẾN ---');
  const lxEmp = { employeeId: 'emp-02', name: 'Trần Lái Xe', department: 'Đội xe Nam Định' };
  const lxInputs = {
    'Lương lượt': 5000000,
    'Lương DT': 8000000,
    'Điểm CLDV': 9.6,
    'DT CPN': 1500000,
    'Ngày công CT': 25,
    'Chi phí sửa chữa': 2000000
  };
  console.log(`Nhân sự: ${lxEmp.name} | Đầu vào:`, lxInputs);
  let lxTotal = 0n;
  for (const pol of policies) {
    const res = await formulaCalc.calculate({
        component: {
            params: pol.expressionJson
        },
        inputBag: lxInputs,
        attendance: {},
        gradeStep: null,
        employeeId: lxEmp.employeeId,
        periodMonth: new Date()
    });
    if (res && res.amount_vnd !== 0n) {
        console.log(`  ${res.amount_vnd >= 0n ? '+' : ''}[${pol.code}]: ${Number(res.amount_vnd).toLocaleString('vi-VN')} VNĐ`);
        lxTotal += res.amount_vnd;
    }
  }
  console.log(`>> TỔNG LƯƠNG: ${Number(lxTotal).toLocaleString('vi-VN')} VNĐ\n`);


  console.log('--- 3. CHẠY LƯƠNG NHÂN VIÊN TỔNG ĐÀI ---');
  const tdEmp = { employeeId: 'emp-03', name: 'Lê Thị Tổng Đài', department: 'CSKH' };
  const tdInputs = {
    'Ngày công chuẩn': 26,
    'Ngày công CT': 24,
    'Pool cơ sở': 5000000,
    'Cuộc nghe cá nhân': 1200,
    'Tổng cuộc VP': 10000,
    'Tỷ lệ nhỡ': 0.015
  };
  console.log(`Nhân sự: ${tdEmp.name} | Đầu vào:`, tdInputs);
  let tdTotal = 0n;
  for (const pol of policies) {
    const res = await formulaCalc.calculate({
        component: {
            params: pol.expressionJson
        },
        inputBag: tdInputs,
        attendance: {},
        gradeStep: null,
        employeeId: tdEmp.employeeId,
        periodMonth: new Date()
    });
    if (res && res.amount_vnd !== 0n) {
        console.log(`  + [${pol.code}]: ${Number(res.amount_vnd).toLocaleString('vi-VN')} VNĐ`);
        tdTotal += res.amount_vnd;
    }
  }
  console.log(`>> TỔNG LƯƠNG: ${Number(tdTotal).toLocaleString('vi-VN')} VNĐ\n`);

  console.log('✅ HOÀN TẤT CHẠY LÔ (BATCH RUN) THÀNH CÔNG CHO TOÀN CÔNG TY!');
  await app.close();
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
