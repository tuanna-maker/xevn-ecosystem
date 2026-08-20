// @CODE-MEMORY: Cấu hình tham số mặc định lương. Grid 12 cột, Apple-style.
import React, { useState, useEffect } from 'react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-[12px] shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

const Input = ({ label, id, value, onChange, type = 'text', suffix = '' }) => (
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
  </div>
);

export const PaySystemSettingsForm = () => {
  const [formData, setFormData] = useState({
    MINIMUM_WAGE: '',
    STANDARD_WORK_DAYS: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API Fetch
    setTimeout(() => {
      setFormData({
        MINIMUM_WAGE: '5310000',
        STANDARD_WORK_DAYS: '26'
      });
      setLoading(false);
    }, 500);
  }, []);

  const handleChange = (key) => (e) => {
    setFormData(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = () => {
    // TODO: Call API POST /api/hrm/payroll-config/settings
    alert('Đã lưu cấu hình mặc định tính lương!');
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải cấu hình...</div>;

  return (
    <Card className="max-w-4xl">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">Mặc định tính lương</h2>
        <p className="text-sm text-gray-500 mt-1">Cấu hình các tham số hệ thống dùng chung cho toàn bộ công ty.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-6">
          <Input 
            id="min_wage" 
            label="Lương tối thiểu vùng" 
            value={formData.MINIMUM_WAGE}
            onChange={handleChange('MINIMUM_WAGE')}
            suffix="VNĐ"
          />
          <p className="text-xs text-gray-400 mt-1">Lương tối thiểu dùng để chặn dưới khi nhập liệu.</p>
        </div>

        <div className="col-span-12 md:col-span-6">
          <Input 
            id="std_days" 
            label="Ngày công tiêu chuẩn / tháng" 
            value={formData.STANDARD_WORK_DAYS}
            onChange={handleChange('STANDARD_WORK_DAYS')}
            type="number"
            suffix="Ngày"
          />
          <p className="text-xs text-gray-400 mt-1">Dùng để tính lương ngày nếu không cấu hình riêng theo nhóm.</p>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
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
