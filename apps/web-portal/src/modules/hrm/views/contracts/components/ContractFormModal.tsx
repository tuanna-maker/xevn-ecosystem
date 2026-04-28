import React, { useEffect, useState } from 'react';
import { CenteredModal } from '../../shared/CenteredModal';
import { 
  FileText, 
  User, 
  Calendar, 
  Briefcase, 
  Hash,
  AlertCircle,
  UploadCloud,
  X,
  ChevronDown
} from 'lucide-react';

interface ContractFormModalProps {
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

export const ContractFormModal: React.FC<ContractFormModalProps> = ({ 
  open, 
  onClose, 
  onSave, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    code: '',
    employee_name: '',
    department: '',
    contract_type: 'Hợp đồng 1 năm',
    effective_date: '',
    expiry_date: '',
    status: 'Chờ duyệt',
    note: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.employee_code || '',
        employee_name: initialData.employee_name || '',
        department: initialData.department || '',
        contract_type: initialData.contract_type || 'Hợp đồng 1 năm',
        effective_date: initialData.effective_date || '',
        expiry_date: initialData.expiry_date || '',
        status: initialData.status || 'Chờ duyệt',
        note: initialData.note || ''
      });
    } else {
      setFormData({
        code: '',
        employee_name: '',
        department: '',
        contract_type: 'Hợp đồng 1 năm',
        effective_date: '',
        expiry_date: '',
        status: 'Chờ duyệt',
        note: ''
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
            {initialData ? "Sửa hợp đồng" : "Thêm hợp đồng mới"}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            {initialData ? `Chỉnh sửa thông tin hợp đồng ${formData.code}` : "Nhập thông tin hợp đồng mới"}
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
            form="contract-form"
            className="inline-flex h-9 items-center px-8 rounded-full bg-xevn-primary text-sm font-bold text-white shadow-md shadow-blue-200 hover:opacity-90 transition-all active:scale-95"
          >
            {initialData ? "Lưu thay đổi" : "Thêm mới"}
          </button>
        </div>
      }
    >
      <form id="contract-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Mã hợp đồng */}
          <div className="space-y-1">
            <label className="text-[12px] font-bold text-slate-600 ml-1">
              Mã hợp đồng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: HD-001"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="h-10 w-full rounded-full border border-slate-200 bg-white px-5 text-sm focus:border-xevn-primary focus:outline-none focus:ring-4 focus:ring-xevn-primary/10 transition-all font-mono"
            />
          </div>

          {/* Tên nhân sự */}
          <div className="space-y-1">
            <label className="text-[12px] font-bold text-slate-600 ml-1">
              Tên nhân sự <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Nhập tên nhân sự"
              value={formData.employee_name}
              onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
              className="h-9 w-full rounded-full border border-slate-200 bg-white px-5 text-sm focus:border-xevn-primary focus:outline-none transition-all"
            />
          </div>

          {/* Phòng ban */}
          <CustomDropdown
            label="Phòng ban"
            required
            placeholder="Nhập phòng ban"
            value={formData.department}
            options={['Phòng HCNS', 'Phòng Kỹ thuật', 'Phòng Kinh doanh', 'Ban Giám đốc']}
            onChange={(val) => setFormData({ ...formData, department: val })}
          />

          {/* Loại hợp đồng */}
          <CustomDropdown
            label="Loại hợp đồng"
            required
            value={formData.contract_type}
            options={['Hợp đồng 1 năm', 'Hợp đồng 3 năm', 'Thử việc', 'Không xác định thời hạn']}
            onChange={(val) => setFormData({ ...formData, contract_type: val })}
          />

          {/* Ngày hiệu lực */}
          <div className="space-y-1">
            <label className="text-[12px] font-bold text-slate-600 ml-1">
              Ngày hiệu lực <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="date"
                required
                value={formData.effective_date}
                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                className="h-10 w-full rounded-full border border-slate-200 bg-white pl-11 pr-5 text-sm focus:border-xevn-primary focus:outline-none focus:ring-4 focus:ring-xevn-primary/10 transition-all"
              />
            </div>
          </div>

          {/* Ngày hết hạn */}
          <div className="space-y-1">
            <label className="text-[12px] font-bold text-slate-600 ml-1">Ngày hết hạn</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="h-10 w-full rounded-full border border-slate-200 bg-white pl-11 pr-5 text-sm focus:border-xevn-primary focus:outline-none focus:ring-4 focus:ring-xevn-primary/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Tình trạng */}
        <CustomDropdown
          label="Tình trạng"
          value={formData.status}
          options={['Chờ duyệt', 'Hiệu lực', 'Hết hạn', 'Đã chấm dứt']}
          onChange={(val) => setFormData({ ...formData, status: val })}
        />

        {/* Ghi chú */}
        <div className="space-y-1">
          <label className="text-[12px] font-bold text-slate-600 ml-1">Ghi chú</label>
          <textarea
            rows={2}
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="Nhập ghi chú..."
            className="w-full rounded-[24px] border border-slate-200 bg-white p-4 text-sm focus:border-xevn-primary focus:outline-none focus:ring-4 focus:ring-xevn-primary/10 transition-all resize-none shadow-sm"
          />
        </div>

        {/* File hợp đồng */}
        <div className="space-y-2">
          <label className="text-[12px] font-bold text-slate-600 ml-1">File hợp đồng (PDF, JPEG, PNG)</label>
          <div className="relative group">
            <div className="flex items-center gap-4 py-3.5 px-6 border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50/50 transition-all group-hover:bg-slate-100 group-hover:border-xevn-primary/30 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-xevn-primary transition-all">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-600">Kéo thả hoặc click để chọn file</p>
                <p className="text-[10px] text-slate-400 font-medium">Hỗ trợ PDF, JPG, PNG tối đa 10MB</p>
              </div>
            </div>
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
        </div>
      </form>
    </CenteredModal>
  );
};
