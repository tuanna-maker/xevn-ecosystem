import React, { useEffect, useState } from 'react';
import { CenteredModal } from '../../shared/CenteredModal';
import { 
  ShieldCheck, 
  User, 
  Calendar, 
  Briefcase, 
  Hash,
  AlertCircle,
  UploadCloud,
  X,
  ChevronDown,
  Heart,
  Activity,
  DollarSign
} from 'lucide-react';

interface InsuranceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const CustomDropdown: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  required?: boolean;
  placeholder?: string;
}> = ({ label, value, options, onChange, required, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-1" ref={containerRef}>
      <label className="text-[12px] font-bold text-slate-600 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-10 w-full items-center justify-between rounded-full border px-5 text-sm transition-all ${
            isOpen ? 'border-xevn-primary ring-4 ring-xevn-primary/10 bg-white' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className={value ? 'text-slate-700 font-medium' : 'text-slate-400'}>
            {value || placeholder || `Chọn ${label.toLowerCase()}`}
          </span>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-xevn-primary' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 py-2 overflow-hidden">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full px-5 py-2.5 text-left text-sm font-medium transition-colors hover:bg-slate-50 ${
                    value === opt ? 'text-xevn-primary bg-blue-50/50' : 'text-slate-600'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const InsuranceFormModal: React.FC<InsuranceFormModalProps> = ({ 
  open, 
  onClose, 
  onSave, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    employee_code: '',
    employee_name: '',
    department: '',
    bhxh_number: '',
    bhyt_number: '',
    bhtn_number: '',
    bhxh_rate: '8',
    bhyt_rate: '1.5',
    bhtn_rate: '1',
    salary: '0',
    effective_date: '',
    expiry_date: '',
    status: 'Đang hiệu lực',
    note: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        employee_code: initialData.employee_code || '',
        employee_name: initialData.employee_name || '',
        department: initialData.department || '',
        bhxh_number: initialData.bhxh_number || '',
        bhyt_number: initialData.bhyt_number || '',
        bhtn_number: initialData.bhtn_number || '',
        bhxh_rate: initialData.bhxh_rate || '8',
        bhyt_rate: initialData.bhyt_rate || '1.5',
        bhtn_rate: initialData.bhtn_rate || '1',
        salary: initialData.salary || '0',
        effective_date: initialData.effective_date || '',
        expiry_date: initialData.expiry_date || '',
        status: initialData.status || 'Đang hiệu lực',
        note: initialData.note || ''
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <CenteredModal
      open={open}
      title={
        <div className="flex flex-col">
          <span className="text-base font-bold text-slate-900 leading-tight">
            {initialData ? "Sửa thông tin bảo hiểm" : "Thêm thông tin bảo hiểm mới"}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            {initialData ? `Chỉnh sửa hồ sơ bảo hiểm của ${formData.employee_name}` : "Nhập hồ sơ bảo hiểm nhân sự mới"}
          </span>
        </div>
      }
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center px-6 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="insurance-form"
            className="inline-flex h-9 items-center px-8 rounded-full bg-xevn-primary text-sm font-bold text-white shadow-md shadow-blue-200 hover:opacity-90 transition-all active:scale-95"
          >
            {initialData ? "Lưu thay đổi" : "Lưu thông tin"}
          </button>
        </div>
      }
    >
      <form id="insurance-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5">
          {/* Mã NV */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 ml-1">
              Mã nhân viên <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="VD: NV001"
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                className="h-9 w-full rounded-full border border-slate-200 bg-white pl-11 pr-5 text-[13px] focus:border-xevn-primary focus:outline-none focus:ring-4 focus:ring-xevn-primary/10 transition-all font-mono"
              />
            </div>
          </div>

          {/* Tên NV */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 ml-1">
              Tên nhân viên <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="Họ và tên"
                value={formData.employee_name}
                onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                className="h-9 w-full rounded-full border border-slate-200 bg-white pl-11 pr-5 text-[13px] focus:border-xevn-primary focus:outline-none focus:ring-4 focus:ring-xevn-primary/10 transition-all"
              />
            </div>
          </div>

          <CustomDropdown
            label="Phòng ban"
            required
            placeholder="Chọn phòng ban"
            value={formData.department}
            options={['Phòng HCNS', 'Phòng Kỹ thuật', 'Phòng Kinh doanh', 'Ban Giám đốc']}
            onChange={(val) => setFormData({ ...formData, department: val })}
          />

          <CustomDropdown
            label="Trạng thái"
            value={formData.status}
            options={['Đang hiệu lực', 'Chờ xử lý', 'Hết hiệu lực', 'Tạm dừng']}
            onChange={(val) => setFormData({ ...formData, status: val })}
          />
        </div>

        <div className="p-4 bg-slate-50/50 rounded-[20px] border border-slate-100 space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số sổ bảo hiểm</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 ml-1">Số BHXH</label>
              <input
                type="text"
                placeholder="7901234567"
                value={formData.bhxh_number}
                onChange={(e) => setFormData({ ...formData, bhxh_number: e.target.value })}
                className="h-9 w-full rounded-full border border-slate-200 bg-white px-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 ml-1">Số BHYT</label>
              <input
                type="text"
                placeholder="DN7901234567"
                value={formData.bhyt_number}
                onChange={(e) => setFormData({ ...formData, bhyt_number: e.target.value })}
                className="h-9 w-full rounded-full border border-slate-200 bg-white px-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 ml-1">Số BHTN</label>
              <input
                type="text"
                placeholder="TN7901234567"
                value={formData.bhtn_number}
                onChange={(e) => setFormData({ ...formData, bhtn_number: e.target.value })}
                className="h-9 w-full rounded-full border border-slate-200 bg-white px-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 ml-1">BHXH (%)</label>
            <input
              type="text"
              value={formData.bhxh_rate}
              onChange={(e) => setFormData({ ...formData, bhxh_rate: e.target.value })}
              className="h-9 w-full rounded-full border border-slate-200 bg-white px-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 ml-1">BHYT (%)</label>
            <input
              type="text"
              value={formData.bhyt_rate}
              onChange={(e) => setFormData({ ...formData, bhyt_rate: e.target.value })}
              className="h-9 w-full rounded-full border border-slate-200 bg-white px-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 ml-1">BHTN (%)</label>
            <input
              type="text"
              value={formData.bhtn_rate}
              onChange={(e) => setFormData({ ...formData, bhtn_rate: e.target.value })}
              className="h-9 w-full rounded-full border border-slate-200 bg-white px-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 ml-1">Lương đóng BH</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="h-9 w-full rounded-full border border-slate-200 bg-white pl-11 pr-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 ml-1">Ngày hiệu lực</label>
            <input
              type="date"
              value={formData.effective_date}
              onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
              className="h-9 w-full rounded-full border border-slate-200 bg-white px-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 ml-1">Ngày hết hạn</label>
            <input
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              className="h-9 w-full rounded-full border border-slate-200 bg-white px-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 ml-1">Ghi chú</label>
          <textarea
            rows={2}
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="Nhập ghi chú..."
            className="w-full rounded-[20px] border border-slate-200 bg-white p-4 text-[13px] focus:border-xevn-primary focus:outline-none focus:ring-4 focus:ring-xevn-primary/10 transition-all resize-none shadow-sm"
          />
        </div>
      </form>
    </CenteredModal>
  );
};
