import React, { useState, useEffect, useRef } from 'react';
import { CenteredModal } from '../../shared/CenteredModal';
import { Mail, Phone, Calendar, Briefcase, MapPin, User, ShieldCheck, Edit3, Save, X, Camera, Building, CreditCard, ChevronDown, Check } from 'lucide-react';
import { EmployeesRow } from '../../data/hrmDataProvider';

interface EmployeeDetailModalProps {
  open: boolean;
  onClose: () => void;
  employee: EmployeesRow | null;
  onSave?: (data: any) => Promise<void>;
  departments?: string[];
  positions?: string[];
}

type TabType = 'work' | 'personal' | 'finance';

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ 
  open, 
  onClose, 
  employee, 
  onSave,
  departments = [],
  positions = []
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('work');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (employee && open) {
      setForm({ ...employee });
      setIsEditing(false);
      setActiveTab('work');
    }
  }, [employee, open]);

  if (!employee) return null;

  const handleSave = async () => {
    if (!onSave) return;
    setLoading(true);
    try {
      await onSave(form);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, avatar_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <CenteredModal
      open={open}
      title={
        <div className="flex flex-col">
          <span className="text-base font-bold text-slate-900 leading-tight">
            {isEditing ? "Chỉnh sửa hồ sơ" : "Chi tiết nhân sự"}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            Xem và quản lý hồ sơ nhân viên chi tiết
          </span>
        </div>
      }
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => { setIsEditing(false); setForm({ ...employee }); }}
                disabled={loading}
                className="px-6 h-10 rounded-full text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-8 h-10 rounded-full bg-xevn-primary text-sm font-bold text-white shadow-lg shadow-blue-200 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Lưu thay đổi
              </button>
            </>
          ) : (
            <>
              <button 
                className="px-8 h-10 rounded-full text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                onClick={onClose}
              >Đóng</button>
              <button 
                onClick={() => setIsEditing(true)}
                className="px-8 h-10 rounded-full bg-slate-800 text-sm font-bold text-white shadow-lg shadow-slate-200 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Chỉnh sửa
              </button>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Profile */}
        <div className="flex items-center gap-6 pb-6 border-b border-slate-100 relative">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden ring-1 ring-slate-100">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt={form.full_name ?? ''} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-xevn-primary/20">
                  {form.full_name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-6 h-6" />
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarChange} 
            />
          </div>
          
          <div className="flex-1 min-w-0 space-y-3">
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Họ và tên</div>
                  <input 
                    className="w-full h-10 px-4 rounded-full border border-slate-200 font-bold text-slate-700 text-sm outline-none focus:ring-4 focus:ring-xevn-primary/10 transition-all"
                    value={form.full_name || ''} 
                    onChange={e => setForm({ ...form, full_name: e.target.value })} 
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Mã nhân viên</div>
                  <input 
                    className="w-full h-10 px-4 rounded-full border border-slate-200 font-bold text-slate-700 text-sm outline-none focus:ring-4 focus:ring-xevn-primary/10 transition-all"
                    value={form.employee_code || ''} 
                    onChange={e => setForm({ ...form, employee_code: e.target.value })} 
                  />
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight truncate">{employee.full_name}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                    {employee.employee_code}
                  </div>
                  <div className="px-3 py-1 bg-xevn-primary/5 text-xevn-primary rounded-full text-[10px] font-bold uppercase tracking-wider border border-xevn-primary/10">
                    {employee.position}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                    employee.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${employee.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {employee.status === 'active' ? 'Đang làm việc' : 'Đã nghỉ'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-full w-fit">
          <TabButton 
            active={activeTab === 'work'} 
            onClick={() => setActiveTab('work')} 
            icon={Building} 
            label="Công việc" 
          />
          <TabButton 
            active={activeTab === 'personal'} 
            onClick={() => setActiveTab('personal')} 
            icon={User} 
            label="Cá nhân" 
          />
          <TabButton 
            active={activeTab === 'finance'} 
            onClick={() => setActiveTab('finance')} 
            icon={CreditCard} 
            label="Tài chính" 
          />
        </div>

        {/* Tab Content */}
        <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-200/60 shadow-inner animate-in fade-in slide-in-from-bottom-4 duration-300">
          {activeTab === 'work' && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <InfoItem 
                label="Phòng ban" 
                value={form.department} 
                isEditing={isEditing} 
                options={departments}
                onChange={v => setForm({ ...form, department: v })}
              />
              <InfoItem 
                label="Chức vụ" 
                value={form.position} 
                isEditing={isEditing} 
                options={positions}
                onChange={v => setForm({ ...form, position: v })}
              />
              <InfoItem 
                label="Ngày gia nhập" 
                value={form.start_date} 
                isEditing={isEditing} 
                type="date"
                onChange={v => setForm({ ...form, start_date: v })}
              />
              <InfoItem 
                label="Hình thức làm việc" 
                value={form.employment_type} 
                isEditing={isEditing} 
                options={['full-time', 'part-time', 'contractor']}
                labelMap={{ 'full-time': 'Toàn thời gian', 'part-time': 'Bán thời gian', contractor: 'Hợp đồng' }}
                onChange={v => setForm({ ...form, employment_type: v })}
              />
              <InfoItem 
                label="Email công việc" 
                value={form.email} 
                isEditing={isEditing} 
                onChange={v => setForm({ ...form, email: v })}
                className="col-span-2"
              />
              <InfoItem 
                label="Địa điểm làm việc" 
                value={form.work_location} 
                isEditing={isEditing} 
                onChange={v => setForm({ ...form, work_location: v })}
                className="col-span-2"
              />
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <InfoItem 
                label="Số điện thoại" 
                value={form.phone} 
                isEditing={isEditing} 
                onChange={v => setForm({ ...form, phone: v })}
              />
              <InfoItem 
                label="Giới tính" 
                value={form.gender} 
                isEditing={isEditing} 
                options={['male', 'female', 'other']}
                labelMap={{ male: 'Nam', female: 'Nữ', other: 'Khác' }}
                onChange={v => setForm({ ...form, gender: v })}
              />
              <InfoItem label="Ngày sinh" value={form.birth_date} isEditing={isEditing} type="date" onChange={v => setForm({ ...form, birth_date: v })} />
              <InfoItem label="CCCD/CMND" value={form.id_number} isEditing={isEditing} onChange={v => setForm({ ...form, id_number: v })} />
              <InfoItem label="Ngày cấp" value={form.id_issue_date} isEditing={isEditing} type="date" onChange={v => setForm({ ...form, id_issue_date: v })} />
              <InfoItem label="Nơi cấp" value={form.id_issue_place} isEditing={isEditing} onChange={v => setForm({ ...form, id_issue_place: v })} />
              <InfoItem label="Địa chỉ thường trú" value={form.permanent_address} isEditing={isEditing} className="col-span-2" onChange={v => setForm({ ...form, permanent_address: v })} />
              <InfoItem label="Địa chỉ tạm trú" value={form.temporary_address} isEditing={isEditing} className="col-span-2" onChange={v => setForm({ ...form, temporary_address: v })} />
              <div className="col-span-2 pt-2 flex items-center gap-3">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Liên hệ khẩn cấp</div>
                <div className="h-px flex-1 bg-slate-200/60" />
              </div>
              <InfoItem label="Người liên hệ" value={form.emergency_contact} isEditing={isEditing} onChange={v => setForm({ ...form, emergency_contact: v })} />
              <InfoItem label="SĐT khẩn cấp" value={form.emergency_phone} isEditing={isEditing} onChange={v => setForm({ ...form, emergency_phone: v })} />
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <InfoItem label="Lương cơ bản" value={form.salary?.toString()} isEditing={isEditing} type="number" onChange={v => setForm({ ...form, salary: Number(v) })} />
              <InfoItem label="Mã số thuế" value={form.tax_code} isEditing={isEditing} onChange={v => setForm({ ...form, tax_code: v })} />
              <InfoItem label="Ngân hàng" value={form.bank_name} isEditing={isEditing} onChange={v => setForm({ ...form, bank_name: v })} />
              <InfoItem label="Số tài khoản" value={form.bank_account} isEditing={isEditing} onChange={v => setForm({ ...form, bank_account: v })} />
              <InfoItem label="Số thẻ BHYT" value={form.health_insurance_number} isEditing={isEditing} onChange={v => setForm({ ...form, health_insurance_number: v })} />
              <InfoItem label="Số sổ BHXH" value={form.social_insurance_number} isEditing={isEditing} onChange={v => setForm({ ...form, social_insurance_number: v })} />
            </div>
          )}
        </div>
      </div>
    </CenteredModal>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: any; label: string }> = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-[11px] font-bold transition-all ${active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
  >
    <Icon className={`w-3.5 h-3.5 ${active ? 'text-xevn-primary' : 'text-slate-400'}`} />
    {label}
  </button>
);

const FormSelect: React.FC<{ 
  value?: string | null; 
  options: string[]; 
  onChange: (v: string) => void; 
  placeholder?: string; 
  labelMap?: Record<string, string>;
  direction?: 'up' | 'down';
}> = ({ value, options, onChange, placeholder, labelMap, direction = 'down' }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div className="relative w-full" ref={containerRef}>
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

const InfoItem: React.FC<{ 
  label: string; 
  value?: string | null; 
  className?: string;
  isEditing?: boolean;
  type?: string;
  options?: string[];
  labelMap?: Record<string, string>;
  onChange?: (v: string) => void;
}> = ({ label, value, className, isEditing, type = 'text', options, labelMap, onChange }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">{label}</div>
    {isEditing ? (
      options ? (
        <FormSelect 
          value={value} 
          options={options} 
          onChange={onChange || (() => {})} 
          labelMap={labelMap}
          direction={label === 'Hình thức làm việc' ? 'up' : 'down'}
        />
      ) : (
        <input 
          type={type}
          className="w-full h-10 px-4 rounded-full border border-slate-200 font-bold text-slate-700 text-sm outline-none focus:ring-4 focus:ring-xevn-primary/10 transition-all"
          value={value || ''}
          onChange={e => onChange?.(e.target.value)}
        />
      )
    ) : (
      <div className="text-[14px] font-bold text-slate-700 truncate bg-white px-5 py-2.5 rounded-full border border-slate-200/60 shadow-sm min-h-[40px] flex items-center">
        {labelMap?.[value || ''] || value || <span className="text-slate-300 font-normal italic">Chưa cập nhật</span>}
      </div>
    )}
  </div>
);
