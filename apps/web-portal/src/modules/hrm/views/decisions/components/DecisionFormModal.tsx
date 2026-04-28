import React, { useEffect, useState } from 'react';
import { CenteredModal } from '../../shared/CenteredModal';
import { 
  FileText, 
  User, 
  Calendar, 
  Briefcase, 
  Hash,
  X,
  ChevronDown,
  Signature,
  FileUp,
  Tag,
  PenTool,
  Clock
} from 'lucide-react';

interface DecisionFormModalProps {
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
      <label className="text-[11px] font-bold text-slate-500 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-9 w-full items-center justify-between rounded-full border px-5 text-[13px] transition-all ${
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
            <div className="bg-white rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 py-2 overflow-hidden max-h-[250px] overflow-y-auto no-scrollbar">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full px-5 py-2.5 text-left text-[13px] font-medium transition-colors hover:bg-slate-50 ${
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

export const DecisionFormModal: React.FC<DecisionFormModalProps> = ({ 
  open, 
  onClose, 
  onSave, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    decision_number: '',
    decision_type: '',
    title: '',
    employee_id: '',
    employee_name: '',
    department: '',
    position: '',
    effective_date: '',
    expiry_date: '',
    signer_name: '',
    signer_position: '',
    signing_date: '',
    status: 'Dự thảo',
    content: '',
    note: ''
  });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        decision_number: initialData.decision_number || '',
        decision_type: initialData.decision_type || '',
        title: initialData.title || '',
        employee_id: initialData.employee_id || '',
        employee_name: initialData.employee_name || '',
        department: initialData.department || '',
        position: initialData.position || '',
        effective_date: initialData.effective_date || '',
        expiry_date: initialData.expiry_date || '',
        signer_name: initialData.signer_name || '',
        signer_position: initialData.signer_position || '',
        signing_date: initialData.signing_date || '',
        status: initialData.status || 'Dự thảo',
        content: initialData.content || '',
        note: initialData.note || ''
      });
    } else {
      setAttachedFiles([]);
    }
  }, [initialData, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const newFiles = Array.from(e.dataTransfer.files);
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, files: attachedFiles });
    onClose();
  };

  return (
    <CenteredModal
      open={open}
      title={
        <div className="flex flex-col">
          <span className="text-base font-bold text-slate-900 leading-tight">
            {initialData ? "Sửa quyết định" : "Thêm quyết định mới"}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            {initialData ? `Chỉnh sửa quyết định ${formData.decision_number}` : "Nhập quyết định nhân sự mới"}
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
            form="decision-form"
            className="inline-flex h-9 items-center px-8 rounded-full bg-xevn-primary text-sm font-bold text-white shadow-md shadow-blue-200 hover:opacity-90 transition-all active:scale-95"
          >
            {initialData ? "Lưu thay đổi" : "Thêm mới"}
          </button>
        </div>
      }
    >
      <form id="decision-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Thông tin văn bản */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 ml-1">Số quyết định <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              placeholder="VD: QĐ-001/2024"
              value={formData.decision_number}
              onChange={(e) => setFormData({ ...formData, decision_number: e.target.value })}
              className="h-9 w-full rounded-full border border-slate-200 bg-white px-5 text-[13px] focus:border-xevn-primary focus:outline-none focus:ring-4 focus:ring-xevn-primary/10 transition-all font-mono"
            />
          </div>
          <CustomDropdown
            label="Loại quyết định"
            required
            value={formData.decision_type}
            options={['Bổ nhiệm', 'Thăng chức', 'Điều chuyển', 'Điều chỉnh lương', 'Khen thưởng', 'Kỷ luật', 'Chấm dứt HĐLĐ', 'Gia hạn HĐ']}
            onChange={(val) => setFormData({ ...formData, decision_type: val })}
          />
          <div className="col-span-2 space-y-1">
            <label className="text-[11px] font-bold text-slate-500 ml-1">Tiêu đề quyết định <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              placeholder="VD: Quyết định bổ nhiệm chức vụ..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="h-9 w-full rounded-full border border-slate-200 bg-white px-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Thông tin nhân sự */}
        <div className="p-4 bg-slate-50/50 rounded-[20px] border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-3.5 w-3.5 text-xevn-primary" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chọn nhân viên</span>
          </div>
          
          <CustomDropdown
            label="Chọn từ danh sách"
            value={formData.employee_name}
            options={['Nguyễn Văn A - NV001', 'Trần Thị B - NV002', 'Lê Văn C - NV003']}
            onChange={(val) => {
              const [name, code] = val.split(' - ');
              setFormData({ ...formData, employee_name: name, employee_id: code });
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 ml-1">Tên nhân viên <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.employee_name}
                onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                className="h-9 w-full rounded-full border border-slate-200 bg-white px-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 ml-1">Mã nhân viên</label>
              <input
                type="text"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="h-9 w-full rounded-full border border-slate-200 bg-white px-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomDropdown
              label="Phòng ban"
              value={formData.department}
              options={['Phòng HCNS', 'Phòng Kỹ thuật', 'Phòng Kinh doanh', 'Ban Giám đốc']}
              onChange={(val) => setFormData({ ...formData, department: val })}
            />
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 ml-1">Chức vụ</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="h-9 w-full rounded-full border border-slate-200 bg-white px-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Thời gian */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 ml-1">Ngày hiệu lực</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                className="h-9 w-full rounded-full border border-slate-200 bg-white pl-11 pr-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 ml-1">Ngày hết hiệu lực</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="h-9 w-full rounded-full border border-slate-200 bg-white pl-11 pr-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Thông tin ký duyệt */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 ml-1">Người ký</label>
            <input
              type="text"
              value={formData.signer_name}
              onChange={(e) => setFormData({ ...formData, signer_name: e.target.value })}
              className="h-9 w-full rounded-full border border-slate-200 bg-white px-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 ml-1">Chức vụ người ký</label>
            <input
              type="text"
              value={formData.signer_position}
              onChange={(e) => setFormData({ ...formData, signer_position: e.target.value })}
              className="h-9 w-full rounded-full border border-slate-200 bg-white px-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 ml-1">Ngày ký</label>
            <input
              type="date"
              value={formData.signing_date}
              onChange={(e) => setFormData({ ...formData, signing_date: e.target.value })}
              className="h-9 w-full rounded-full border border-slate-200 bg-white px-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all"
            />
          </div>
        </div>

        <CustomDropdown
          label="Tình trạng"
          value={formData.status}
          options={['Dự thảo', 'Chờ phê duyệt', 'Đã ban hành', 'Hết hiệu lực']}
          onChange={(val) => setFormData({ ...formData, status: val })}
        />

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 ml-1">Nội dung quyết định</label>
          <textarea
            rows={3}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Nhập nội dung chi tiết..."
            className="w-full rounded-[20px] border border-slate-200 bg-white p-4 text-[13px] focus:border-xevn-primary focus:outline-none focus:ring-4 focus:ring-xevn-primary/10 transition-all resize-none shadow-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 ml-1">Ghi chú</label>
          <input
            type="text"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="Nhập ghi chú..."
            className="h-9 w-full rounded-full border border-slate-200 bg-white px-5 text-[13px] focus:border-xevn-primary focus:outline-none transition-all"
          />
        </div>

        {/* File đính kèm */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 ml-1 flex items-center gap-2">
            <FileUp className="h-3.5 w-3.5 text-slate-400" />
            File đính kèm
          </label>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-[20px] p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
              isDragging 
                ? 'border-xevn-primary bg-blue-50 scale-[1.01]' 
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-xevn-primary/40'
            }`}
          >
            <div className={`w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center transition-colors ${isDragging ? 'text-xevn-primary' : 'text-slate-400'}`}>
              <UploadCloud className="h-4 w-4" />
            </div>
            <div className="text-[13px] font-medium text-slate-600">Kéo thả hoặc <span className="text-xevn-primary font-bold">click để chọn file</span></div>
            <div className="text-[11px] text-slate-400 font-medium">Hỗ trợ PDF, Word, hình ảnh (tối đa 10MB)</div>
          </div>

          {/* File list */}
          {attachedFiles.length > 0 && (
            <div className="space-y-2 mt-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between gap-3 p-3 bg-white border border-slate-100 rounded-[16px] group hover:border-xevn-primary/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                      <FileUp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-700 truncate max-w-[250px]">{file.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    className="w-7 h-7 rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </CenteredModal>
  );
};

const UploadCloud = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
);
