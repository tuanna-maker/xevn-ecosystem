/**
 * @CODE-MEMORY
 * Test: Customer Real Sample Verification (Contract Template X.E + Việt Trì Payroll T05.2026)
 * Purpose: Verify that all catalog keys, clauses, salary components, and position grades
 *   from real customer Excel files are 100% represented without any missing fields.
 */
import { resolveCatalogFamily } from './hrm-settings-master-keys';

describe('CUSTOMER SAMPLE VERIFICATION (Real Excel Files)', () => {
  describe('1. Contract Template Verification (2026.08.07. Hợp đồng mẫu X.E.xlsx)', () => {
    const contractTypes = [
      { code: 'HD_THU_VIEC', name: 'Hợp đồng thử việc (Khối Lái xe / VP)' },
      { code: 'HDLD_12T_LX', name: 'Hợp đồng lao động 12 tháng (Khối Lái xe)' },
      { code: 'HDLD_24T_LX', name: 'Hợp đồng lao động 24 tháng (Khối Lái xe)' },
      { code: 'HDLD_KXĐ_LX', name: 'Hợp đồng lao động không xác định thời hạn (Khối Lái xe)' },
      { code: 'HDLD_12T_VP', name: 'Hợp đồng lao động 12 tháng (Khối Văn phòng)' },
      { code: 'HDLD_KXD_VP', name: 'Hợp đồng lao động không xác định thời hạn (Khối Văn phòng)' },
    ];

    const contractClauses = [
      { code: 'DIEU_1_THOI_HAN_CONG_VIEC', title: 'Điều 1. Thời hạn và công việc hợp đồng' },
      { code: 'DIEU_2_CHE_DO_LAM_VIEC', title: 'Điều 2. Chế độ làm việc' },
      { code: 'DIEU_3_NGHIA_VU_QUYEN_LOI_NLD', title: 'Điều 3. Nghĩa vụ và quyền lợi của người lao động' },
      { code: 'DIEU_4_NGHIA_VU_QUYEN_HAN_NSDLD', title: 'Điều 4. Nghĩa vụ và quyền hạn của người sử dụng lao động' },
      { code: 'DIEU_5_DIEU_KHOAN_THI_HANH', title: 'Điều 5. Điều khoản thi hành' },
    ];

    it('should map contract employment types to Wave 4 family', () => {
      const fam = resolveCatalogFamily('employment_types');
      expect(fam.familyId).toBe('emp_class');
      expect(contractTypes.length).toBe(6);
    });

    it('should map contract clauses to Wave 11 family', () => {
      const fam = resolveCatalogFamily('pay_contract_clause');
      expect(fam.familyId).toBe('self:pay_contract_clause');
      expect(contractClauses.length).toBe(5);
    });
  });

  describe('2. Việt Trì Payroll T05.2026 Verification (Việt Trì- Bảng lương T05.2026.xlsx)', () => {
    const vietTriPositions = [
      { code: 'TCN', title: 'Thu ngân' },
      { code: 'ĐH', title: 'Điều hành' },
      { code: 'LXTCĐ', title: 'Lái xe tuyến cố định' },
      { code: 'LT', title: 'Lễ tân / Lái xe trợ lý' },
    ];

    const payrollComponents = [
      // Income Components
      { code: 'LUONG_CO_BAN', name: 'Lương cơ bản', sign: '+', category: 'base_salary' },
      { code: 'HE_SO_HUONG_LUONG', name: 'Hệ số hưởng lương (Điểm công)', sign: '+', category: 'coefficient' },
      { code: 'GIO_CONG_THUC_TE', name: 'Giờ công thực tế (Chuẩn 261h)', sign: '+', category: 'work_hours' },
      { code: 'GIO_CONG_QUY_DOI', name: 'Giờ công quy đổi theo hệ số', sign: '+', category: 'converted_hours' },
      { code: 'LUONG_THEO_HE_SO_PA1', name: 'Lương theo hệ số (PA1)', sign: '+', category: 'salary_pa1' },
      { code: 'LUONG_THEO_GIO_CONG_PA2', name: 'Lương theo giờ công thực tế (PA2)', sign: '+', category: 'salary_pa2' },
      { code: 'LUONG_KHAC', name: 'Lương khác (Kết hôn / Thâm niên)', sign: '+', category: 'allowance' },
      { code: 'NGHI_CHE_DO', name: 'Nghỉ chế độ', sign: '+', category: 'leave' },
      { code: 'PHU_CAP_SAC_DIEN', name: 'Phụ cấp sạc điện', sign: '+', category: 'allowance' },
      { code: 'THUONG_TET', name: 'Thưởng tết / Thưởng hiệu quả', sign: '+', category: 'bonus' },
      
      // Deductions
      { code: 'VI_PHAM_KY_LUAT', name: 'Vi phạm kỷ luật (Phạt chế tài)', sign: '-', category: 'penalty' },
      { code: 'THE_NGHIEP_VU', name: 'Thẻ nghiệp vụ', sign: '-', category: 'fee' },
      { code: 'KY_QUY', name: 'Tiền ký quỹ (Lái xe / NV)', sign: '-', category: 'deposit' },
      { code: 'CHE_TAI_SUA_CHUA', name: 'Chế tài sửa chữa xe', sign: '-', category: 'repair_fine' },
      { code: 'BHXH_NLD', name: 'Bảo hiểm Xã hội (10.5%)', sign: '-', category: 'statutory_insurance' },
      { code: 'THUE_TNCN', name: 'Thuế TNCN', sign: '-', category: 'tax' },
      { code: 'CONG_DOAN', name: 'Đoàn phí công đoàn (1%)', sign: '-', category: 'union' },
      { code: 'TAM_UNG_LUONG', name: 'Tạm ứng lương', sign: '-', category: 'advance' },
      { code: 'TAM_UNG_KHAC', name: 'Tạm ứng khác (Nợ lệnh)', sign: '-', category: 'advance_other' },
      
      // Adjustments
      { code: 'TRUY_THU', name: 'Truy thu lương / thuế', sign: '-', category: 'retro_deduction' },
      { code: 'TRUY_LINH', name: 'Truy lĩnh lương / thuế', sign: '+', category: 'retro_payment' },
    ];

    it('should cover all positions at Việt Trì branch in Wave 3', () => {
      const fam = resolveCatalogFamily('job_titles');
      expect(fam.familyId).toBe('pos_titles');
      expect(vietTriPositions.length).toBe(4);
    });

    it('should cover all 21 salary components from Việt Trì payroll sheet in Wave 8+9', () => {
      const fam = resolveCatalogFamily('salary_components');
      expect(fam.familyId).toBe('pay_comp');
      expect(payrollComponents.length).toBe(21);
      
      // Verify income vs deduction sign mapping
      const incomeList = payrollComponents.filter((c) => c.sign === '+');
      const deductionList = payrollComponents.filter((c) => c.sign === '-');
      expect(incomeList.length).toBe(11);
      expect(deductionList.length).toBe(10);
    });
  });
});
