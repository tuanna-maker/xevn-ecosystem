// @CODE-MEMORY: Cấu hình tham số mặc định lương. Grid 12 cột, Apple-style.
import React, { useState, useEffect } from 'react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-[12px] shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

const Input = ({ label, id, value, onChange, type = 'text', suffix = '', hint = '' }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
          {suffix}
        </span>
      )}
    </div>
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const SectionTitle = ({ title }) => (
  <div className="col-span-12 mt-4 mb-2">
    <h3 className="text-md font-semibold text-gray-800 border-b pb-2">{title}</h3>
  </div>
);

export const PaySystemSettingsForm = () => {
  const [formData, setFormData] = useState({
    // Chung
    MINIMUM_WAGE: '',
    STANDARD_WORK_DAYS: '',
    STANDARD_WORK_HOURS: '',
    // BHXH
    BHXH_BASE: '',
    BHXH_CAP: '',
    BHXH_EMP_RATE: '',
    BHXH_CMP_RATE: '',
    // Thuế TNCN
    TNCN_PERSONAL: '',
    TNCN_DEPENDENT: '',
    // Kỳ lương
    PAY_DAY: '',
    ADVANCE_DAY: '',
    // Đặc thù
    CC_BASE_SALARY: '',
    CC_CALL_FUND: '',
    DRIVER_KPI_EXPRESS: '',
    DRIVER_MEAL_ALLOWANCE: ''
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API Fetch
    setTimeout(() => {
      setFormData({
        MINIMUM_WAGE: '5310000',
        STANDARD_WORK_DAYS: '26',
        STANDARD_WORK_HOURS: '8',
        BHXH_BASE: '2340000',
        BHXH_CAP: '46800000',
        BHXH_EMP_RATE: '10.5',
        BHXH_CMP_RATE: '17.5',
        TNCN_PERSONAL: '11000000',
        TNCN_DEPENDENT: '4400000',
        PAY_DAY: '10',
        ADVANCE_DAY: '20',
        CC_BASE_SALARY: '5000000',
        CC_CALL_FUND: '500000',
        DRIVER_KPI_EXPRESS: '2000000',
        DRIVER_MEAL_ALLOWANCE: '25000'
      });
      setLoading(false);
    }, 500);
  }, []);

  const handleChange = (key) => (e) => {
    setFormData(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = () => {
    alert('Đã lưu cấu hình mặc định tính lương!');
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải cấu hình...</div>;

  return (
    <Card className="max-w-4xl">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">Mặc định tính lương (Tham số hệ thống)</h2>
        <p className="text-sm text-gray-500 mt-1">Cấu hình 37 tham số hệ thống dùng chung cho toàn bộ công ty theo bảng lương chuẩn X.E.</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[60vh] overflow-y-auto pr-2 pb-10">
        
        <SectionTitle title="1. Thông số chung & Kỳ lương" />
        <div className="col-span-12 md:col-span-4">
          <Input id="min_wage" label="Lương tối thiểu vùng" value={formData.MINIMUM_WAGE} onChange={handleChange('MINIMUM_WAGE')} suffix="VNĐ" />
        </div>
        <div className="col-span-12 md:col-span-4">
          <Input id="std_days" label="Ngày công chuẩn / tháng" value={formData.STANDARD_WORK_DAYS} onChange={handleChange('STANDARD_WORK_DAYS')} suffix="Ngày" />
        </div>
        <div className="col-span-12 md:col-span-4">
          <Input id="std_hours" label="Giờ công chuẩn / ngày" value={formData.STANDARD_WORK_HOURS} onChange={handleChange('STANDARD_WORK_HOURS')} suffix="Giờ" />
        </div>
        <div className="col-span-12 md:col-span-6">
          <Input id="pay_day" label="Ngày trả lương chính" value={formData.PAY_DAY} onChange={handleChange('PAY_DAY')} suffix="Hàng tháng" />
        </div>
        <div className="col-span-12 md:col-span-6">
          <Input id="advance_day" label="Ngày ứng lương" value={formData.ADVANCE_DAY} onChange={handleChange('ADVANCE_DAY')} suffix="Hàng tháng" hint="Tối đa 70% lương thực tế" />
        </div>

        <SectionTitle title="2. Bảo hiểm xã hội (BHXH)" />
        <div className="col-span-12 md:col-span-6">
          <Input id="bhxh_base" label="Lương cơ sở BHXH" value={formData.BHXH_BASE} onChange={handleChange('BHXH_BASE')} suffix="VNĐ" hint="NĐ 73/2024/NĐ-CP" />
        </div>
        <div className="col-span-12 md:col-span-6">
          <Input id="bhxh_cap" label="Mức trần lương đóng BHXH" value={formData.BHXH_CAP} onChange={handleChange('BHXH_CAP')} suffix="VNĐ" />
        </div>
        <div className="col-span-12 md:col-span-6">
          <Input id="bhxh_emp" label="Tỉ lệ đóng NLĐ" value={formData.BHXH_EMP_RATE} onChange={handleChange('BHXH_EMP_RATE')} suffix="%" hint="8% BHXH + 1.5% BHYT + 1% BHTN" />
        </div>
        <div className="col-span-12 md:col-span-6">
          <Input id="bhxh_cmp" label="Tỉ lệ đóng Công ty" value={formData.BHXH_CMP_RATE} onChange={handleChange('BHXH_CMP_RATE')} suffix="%" hint="14% BHXH + 3% BHYT + 0.5% BHTN" />
        </div>

        <SectionTitle title="3. Thuế TNCN" />
        <div className="col-span-12 md:col-span-6">
          <Input id="tncn_per" label="Giảm trừ gia cảnh bản thân" value={formData.TNCN_PERSONAL} onChange={handleChange('TNCN_PERSONAL')} suffix="VNĐ" />
        </div>
        <div className="col-span-12 md:col-span-6">
          <Input id="tncn_dep" label="Giảm trừ người phụ thuộc" value={formData.TNCN_DEPENDENT} onChange={handleChange('TNCN_DEPENDENT')} suffix="VNĐ" />
        </div>

        <SectionTitle title="4. Thông số đặc thù (Tổng đài & Lái xe)" />
        <div className="col-span-12 md:col-span-6">
          <Input id="cc_base" label="Lương cơ sở Tổng đài" value={formData.CC_BASE_SALARY} onChange={handleChange('CC_BASE_SALARY')} suffix="VNĐ" hint="QĐ tổng đài 1500 mục 3.1" />
        </div>
        <div className="col-span-12 md:col-span-6">
          <Input id="cc_fund" label="Quỹ thưởng hạn chế gọi nhỡ" value={formData.CC_CALL_FUND} onChange={handleChange('CC_CALL_FUND')} suffix="VNĐ" />
        </div>
        <div className="col-span-12 md:col-span-6">
          <Input id="drv_kpi" label="KPI Lái xe tải Express" value={formData.DRIVER_KPI_EXPRESS} onChange={handleChange('DRIVER_KPI_EXPRESS')} suffix="VNĐ" hint="QĐ 206/2026 mục 7.1" />
        </div>
        <div className="col-span-12 md:col-span-6">
          <Input id="drv_meal" label="Tiền ăn ca Chủ nhật (Lái xe Tuyến)" value={formData.DRIVER_MEAL_ALLOWANCE} onChange={handleChange('DRIVER_MEAL_ALLOWANCE')} suffix="VNĐ" hint="NĐ, NB, TB (QĐ 439/2025)" />
        </div>

      </div>

      <div className="mt-8 flex justify-end pt-4 border-t border-gray-100">
        <button 
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-[12px] hover:bg-blue-700 transition-colors shadow-sm"
        >
          Lưu cấu hình
        </button>
      </div>
    </Card>
  );
};
