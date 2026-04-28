import React, { useState, useEffect } from 'react';
import { CenteredModal } from '../../shared/CenteredModal';
import { Camera, ChevronDown, Check, User, Briefcase, Heart, CreditCard } from 'lucide-react';
import { EmployeesRow } from '../../data/hrmDataProvider';

interface EmployeeFormModalProps {
  open: boolean;
  onClose: () => void;
  employee: EmployeesRow | null;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  departments: string[];
  positions: string[];
  companies?: { id: string, name: string }[];
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ 
  open, onClose, employee, onSubmit, loading, departments, positions, companies = []
}) => {
  const [tab, setTab] = useState<'basic' | 'personal' | 'work_finance'>('basic');
  const [form, setForm] = useState<Partial<EmployeesRow>>({});
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    if (employee) {
      setForm(employee);
      setAvatarPreview(employee.avatar_url || '');
    } else {
      setForm({ status: 'active', employment_type: 'full-time' });
      setAvatarPreview('');
    }
  }, [employee, open]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setForm(s => ({ ...s, avatar_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Cơ bản', icon: User },
    { id: 'personal', label: 'Cá nhân', icon: Heart },
    { id: 'work_finance', label: 'Công việc & Tài chính', icon: Briefcase },
  ];

  return (
    <CenteredModal 
      open={open} 
      title={
        <div className="flex flex-col">
          <span className="text-base font-bold text-slate-900 leading-tight">
            {employee ? 'Cập nhật hồ sơ nhân sự' : 'Thêm mới nhân sự'}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            Quản lý thông tin chi tiết nhân sự hệ thống
          </span>
        </div>
      } 
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button 
            className="px-8 h-10 rounded-full text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
            onClick={onClose}
          >Hủy</button>
          <button 
            disabled={loading}
            onClick={() => onSubmit(form)}
            className="px-10 h-10 rounded-full bg-xevn-primary text-sm font-bold text-white shadow-lg shadow-blue-200 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-1.5 p-1 bg-slate-100/80 rounded-full w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${tab === t.id ? 'bg-white text-xevn-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <t.icon className="w-3 h-3" />
              {t.label}
            </button>
          ))}
        </div>

        <div>
          {tab === 'basic' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex flex-col items-center justify-center py-6 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-100 transition-transform group-hover:scale-105">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-black text-xevn-primary/20 tracking-tighter">
                        {form.full_name?.charAt(0).toUpperCase() || 'V'}
                      </span>
                    )}
                  </div>
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-black rounded-full cursor-pointer">
                    <Camera className="w-5 h-5 mb-1" />
                    THAY ĐỔI
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </label>
                </div>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-xevn-primary hover:text-white hover:border-xevn-primary transition-all shadow-sm active:scale-95 uppercase tracking-wider"
                  onClick={() => document.getElementById('avatar-upload-form')?.click()}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Chọn ảnh từ máy
                  <input id="avatar-upload-form" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <FormInput label="Mã nhân sự *" value={form.employee_code} onChange={v => setForm(s => ({ ...s, employee_code: v }))} placeholder="VD: NV-0001" />
                <FormInput label="Họ và tên *" value={form.full_name} onChange={v => setForm(s => ({ ...s, full_name: v }))} placeholder="VD: Nguyễn Văn A" />
                <FormInput label="Email công việc" value={form.email} onChange={v => setForm(s => ({ ...s, email: v }))} placeholder="VD: a@company.com" />
                <FormInput label="Số điện thoại" value={form.phone} onChange={v => setForm(s => ({ ...s, phone: v }))} placeholder="VD: 090..." />
                
                <FormSelect 
                  label="Phòng/Ban" 
                  value={form.department} 
                  options={departments} 
                  onChange={v => setForm(s => ({ ...s, department: v }))} 
                  placeholder="-- Chọn phòng ban --" 
                  direction="down"
                />
                <FormSelect 
                  label="Chức vụ" 
                  value={form.position} 
                  options={positions} 
                  onChange={v => setForm(s => ({ ...s, position: v }))} 
                  placeholder="-- Chọn chức vụ --" 
                  direction="down"
                />
                
                <FormInput label="Ngày vào làm" type="date" value={form.start_date} onChange={v => setForm(s => ({ ...s, start_date: v }))} placeholder="Chọn ngày vào làm" />
                <FormSelect 
                  label="Trạng thái" 
                  value={form.status} 
                  options={['active', 'on-leave', 'inactive', 'terminated']} 
                  labelMap={{ 
                    active: 'Đang làm việc', 
                    'on-leave': 'Nghỉ phép', 
                    inactive: 'Tạm nghỉ', 
                    terminated: 'Đã nghỉ việc' 
                  }}
                  onChange={v => setForm(s => ({ ...s, status: v }))} 
                  placeholder="-- Chọn trạng thái --"
                  direction="up"
                />
              </div>
            </div>
          )}

          {tab === 'personal' && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 animate-in fade-in slide-in-from-bottom-2">
              <FormSelect 
                label="Giới tính" 
                value={form.gender} 
                options={['male', 'female', 'other']} 
                labelMap={{ male: 'Nam', female: 'Nữ', other: 'Khác' }}
                onChange={v => setForm(s => ({ ...s, gender: v }))} 
                placeholder="-- Chọn giới tính --"
              />
              <FormInput label="Ngày sinh" type="date" value={form.birth_date} onChange={v => setForm(s => ({ ...s, birth_date: v }))} placeholder="Chọn ngày sinh" />
              <FormInput label="Số CMND/CCCD" value={form.id_number} onChange={v => setForm(s => ({ ...s, id_number: v }))} placeholder="VD: 0310..." />
              <FormInput label="Ngày cấp" type="date" value={form.id_issue_date} onChange={v => setForm(s => ({ ...s, id_issue_date: v }))} placeholder="Chọn ngày cấp" />
              <FormInput label="Nơi cấp" value={form.id_issue_place} onChange={v => setForm(s => ({ ...s, id_issue_place: v }))} className="col-span-2" placeholder="VD: Cục Cảnh sát Quản lý hành chính..." />
              <FormInput label="Địa chỉ thường trú" value={form.permanent_address} onChange={v => setForm(s => ({ ...s, permanent_address: v }))} className="col-span-2" placeholder="VD: Số 123, Đường ABC, Quận XYZ..." />
              <FormInput label="Địa chỉ tạm trú" value={form.temporary_address} onChange={v => setForm(s => ({ ...s, temporary_address: v }))} className="col-span-2" placeholder="VD: Chung cư DEF, Phường GHI..." />
              <FormInput label="Người liên hệ khẩn cấp" value={form.emergency_contact} onChange={v => setForm(s => ({ ...s, emergency_contact: v }))} placeholder="VD: Nguyễn Văn B (Bố)" />
              <FormInput label="SĐT khẩn cấp" value={form.emergency_phone} onChange={v => setForm(s => ({ ...s, emergency_phone: v }))} placeholder="VD: 0912..." />
            </div>
          )}

          {tab === 'work_finance' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-3.5 bg-xevn-primary rounded-full" />
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Thông tin công việc</div>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <FormSelect 
                    label="Hình thức làm việc" 
                    value={form.employment_type} 
                    options={['full-time', 'part-time', 'contractor']} 
                    labelMap={{ 'full-time': 'Toàn thời gian', 'part-time': 'Bán thời gian', contractor: 'Hợp đồng' }}
                    onChange={v => setForm(s => ({ ...s, employment_type: v }))} 
                    placeholder="-- Chọn hình thức --"
                    direction="down"
                  />
                  <FormSelect 
                    label="Địa điểm làm việc *" 
                    value={form.company_id} 
                    options={companies.map(c => c.id)} 
                    labelMap={Object.fromEntries(companies.map(c => [c.id, c.name]))}
                    onChange={v => setForm(s => ({ ...s, company_id: v }))} 
                    placeholder="-- Chọn chi nhánh --" 
                    direction="down"
                  />
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-3.5 bg-xevn-primary rounded-full" />
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Thông tin tài chính</div>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <FormInput label="Lương cơ bản" type="number" value={form.salary?.toString()} onChange={v => setForm(s => ({ ...s, salary: Number(v) }))} placeholder="VD: 15000000" />
                  <FormInput label="Mã số thuế" value={form.tax_code} onChange={v => setForm(s => ({ ...s, tax_code: v }))} placeholder="VD: 8493..." />
                  <FormInput label="Ngân hàng" value={form.bank_name} onChange={v => setForm(s => ({ ...s, bank_name: v }))} placeholder="VD: Vietcombank..." />
                  <FormInput label="Số tài khoản" value={form.bank_account} onChange={v => setForm(s => ({ ...s, bank_account: v }))} placeholder="VD: 1018..." />
                  <FormInput label="Số sổ BHXH" value={form.social_insurance_number} onChange={v => setForm(s => ({ ...s, social_insurance_number: v }))} placeholder="VD: 0123..." />
                  <FormInput label="Số thẻ BHYT" value={form.health_insurance_number} onChange={v => setForm(s => ({ ...s, health_insurance_number: v }))} placeholder="VD: GD47..." />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CenteredModal>
  );
};

const FormInput: React.FC<{ label: string; value?: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string }> = ({ label, value, onChange, placeholder, type = 'text', className }) => (
  <label className={`space-y-1 ${className}`}>
    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</div>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-xevn-primary/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
    />
  </label>
);

const FormSelect: React.FC<{ 
  label: string; 
  value?: string; 
  options: string[]; 
  onChange: (v: string) => void; 
  placeholder?: string; 
  labelMap?: Record<string, string>;
  direction?: 'up' | 'down';
}> = ({ label, value, options, onChange, placeholder, labelMap, direction = 'down' }) => {
  const [open, setOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative space-y-1" ref={containerRef}>
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-10 w-full rounded-full border border-slate-200 bg-white px-5 flex items-center justify-between text-sm font-bold text-slate-700 outline-none hover:bg-slate-50 focus:ring-4 focus:ring-xevn-primary/10 transition-all"
      >
        <span className={value ? 'text-slate-700' : 'text-slate-400 font-normal'}>
          {value ? (labelMap?.[value] || value) : (placeholder || '-- Chọn --')}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className={`absolute ${direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} left-0 w-full bg-white border border-slate-200 rounded-[20px] shadow-2xl z-[70] py-2 animate-in fade-in zoom-in-95 duration-200`}>
          <div className="max-h-[160px] overflow-y-auto">
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full px-5 py-2 text-left text-sm font-bold transition-colors flex items-center justify-between ${value === opt ? 'bg-xevn-primary/5 text-xevn-primary' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {labelMap?.[opt] || opt}
                {value === opt && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
