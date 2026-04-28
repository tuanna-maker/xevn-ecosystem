import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, DataTable } from '../../../../components/common';
import { isSupabaseConfigured, supabase } from '../../../../integrations/supabase/client';
import { useGlobalFilter } from '../../../../contexts/GlobalFilterContext';
import type { Employee } from '../../../../data/mock-data';
import { mockEmployees, mockCompanies } from '../../../../data/mock-data';
import { SETTINGS_CONTROL_TEXT } from '../../../../pages/command-center/settings-form-pattern';
import { hrmDataProvider, getMode } from '../../data/hrmDataProvider';
import { CenteredModal } from '../shared/CenteredModal';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Check, Trash2, X, Download, Upload, FileSpreadsheet, FileText } from 'lucide-react';
import { EmployeeFormModal } from './components/EmployeeFormModal';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import { EmployeeTrashModal } from './components/EmployeeTrashModal';
import { EmployeeImportModal } from './components/EmployeeImportModal';
import { EmployeeExportModal } from './components/EmployeeExportModal';

// Import catalogs for synchronization
import { ORG_GRADE_LEVELS } from '../../../../data/org-grade-reference';

const DEPARTMENTS = [
  'Ban Giám đốc',
  'Phòng Kinh doanh',
  'Phòng Điều phối',
  'Phòng Bảo trì',
  'Phòng Nhân sự',
  'Phòng Kế toán',
  'Phòng Kỹ thuật',
  'Phòng Marketing',
  'Phòng Công nghệ thông tin',
];

// Extract unique titles from ORG_GRADE_LEVELS
const POSITIONS = Array.from(new Set(ORG_GRADE_LEVELS.flatMap(level => level.titles))).filter(Boolean);

type EmployeesRow = {
  id: string;
  employee_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  department: string | null;
  status: string;
  start_date: string | null;
  salary: number | null;
  avatar_url: string | null;
  gender: string | null;
  birth_date: string | null;
  id_number: string | null;
  id_issue_date: string | null;
  id_issue_place: string | null;
  permanent_address: string | null;
  temporary_address: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  employment_type: string | null;
  work_location: string | null;
  bank_name: string | null;
  bank_account: string | null;
  tax_code: string | null;
  social_insurance_number: string | null;
  health_insurance_number: string | null;
};

const toEmployeesRow = (row: any): EmployeesRow => ({
  id: String(row.id ?? ''),
  employee_code: String(row.employee_code ?? row.code ?? ''),
  full_name: String(row.full_name ?? row.fullName ?? ''),
  email: row.email ?? null,
  phone: row.phone ?? null,
  position: row.position ?? null,
  department: row.department ?? null,
  status: row.status ?? 'active',
  start_date: row.start_date ?? row.joinDate ?? null,
  salary: row.salary ?? null,
  avatar_url: row.avatar_url ?? null,
  gender: row.gender ?? null,
  birth_date: row.birth_date ?? null,
  id_number: row.id_number ?? null,
  id_issue_date: row.id_issue_date ?? null,
  id_issue_place: row.id_issue_place ?? null,
  permanent_address: row.permanent_address ?? null,
  temporary_address: row.temporary_address ?? null,
  emergency_contact: row.emergency_contact ?? null,
  emergency_phone: row.emergency_phone ?? null,
  employment_type: row.employment_type ?? null,
  work_location: row.work_location ?? null,
  bank_name: row.bank_name ?? null,
  bank_account: row.bank_account ?? null,
  tax_code: row.tax_code ?? null,
  social_insurance_number: row.social_insurance_number ?? null,
  health_insurance_number: row.health_insurance_number ?? null,
});

const emptyForm = () => ({
  employee_code: '',
  full_name: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  start_date: new Date().toISOString().slice(0, 10),
  salary: '',
  status: 'active',
  gender: '',
  birth_date: '',
  id_number: '',
  id_issue_date: '',
  id_issue_place: '',
  permanent_address: '',
  temporary_address: '',
  emergency_contact: '',
  emergency_phone: '',
  employment_type: 'full-time',
  work_location: '',
  bank_name: '',
  bank_account: '',
  tax_code: '',
  social_insurance_number: '',
  health_insurance_number: '',
  avatar_url: '',
});

export const EmployeesView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCompany } = useGlobalFilter();

  const canWriteDb = isSupabaseConfigured && selectedCompany?.id && selectedCompany.id !== 'all';

  const [employeesDb, setEmployeesDb] = useState<EmployeesRow[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeeFormOpen, setEmployeeFormOpen] = useState(false);
  const [employeeFormMode, setEmployeeFormMode] = useState<'create' | 'edit'>('create');
  const [employeeFormTab, setEmployeeFormTab] = useState<'basic' | 'personal' | 'work' | 'finance'>('basic');
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [employeeDetailOpen, setEmployeeDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<EmployeesRow | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form, setForm] = useState(() => emptyForm());
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const employeeDraft = searchParams.get('createEmployee') === '1';
  const selectedEmployeeId = searchParams.get('employeeId');
  const activeModal = searchParams.get('modal'); // 'trash' | 'import' | 'export'

  const setPanelParams = (next: Record<string, string | null>) => {
    const params = new URLSearchParams(location.search);
    for (const [k, v] of Object.entries(next)) {
      if (v == null || v === '') params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    navigate(`${location.pathname}${qs ? `?${qs}` : ''}`, { replace: false });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setForm(s => ({ ...s, avatar_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!selectedCompany?.id) return;

    let cancelled = false;
    (async () => {
      setEmployeesLoading(true);
      try {
        if (cancelled) return;
        const rows = await hrmDataProvider.listEmployees({
          companyId: selectedCompany.id === 'all' ? null : selectedCompany.id,
          limit: 200,
        });
        if (cancelled) return;
        setEmployeesDb(
          rows.map((row: any) => ({
            id: row.id,
            employee_code: row.employee_code,
            full_name: row.full_name,
            email: row.email ?? null,
            phone: row.phone ?? null,
            position: row.position ?? null,
            department: row.department ?? null,
            status: row.status ?? 'active',
            start_date: row.start_date ?? null,
            salary: row.salary ?? null,
            avatar_url: row.avatar_url ?? null,
            gender: row.gender ?? null,
            birth_date: row.birth_date ?? null,
            id_number: row.id_number ?? null,
            id_issue_date: row.id_issue_date ?? null,
            id_issue_place: row.id_issue_place ?? null,
            permanent_address: row.permanent_address ?? null,
            temporary_address: row.temporary_address ?? null,
            emergency_contact: row.emergency_contact ?? null,
            emergency_phone: row.emergency_phone ?? null,
            employment_type: row.employment_type ?? null,
            work_location: row.work_location ?? null,
            bank_name: row.bank_name ?? null,
            bank_account: row.bank_account ?? null,
            tax_code: row.tax_code ?? null,
            social_insurance_number: row.social_insurance_number ?? null,
            health_insurance_number: row.health_insurance_number ?? null,
          }))
        );
      } finally {
        if (!cancelled) setEmployeesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedCompany?.id]);

  useEffect(() => {
    if (employeeDraft) {
      setEmployeeFormMode('create');
      setEditingEmployeeId(null);
      setEmployeeFormTab('basic');
      setForm(emptyForm());
      setEmployeeFormOpen(true);
    }
  }, [employeeDraft]);

  useEffect(() => {
    if (!selectedEmployeeId) return;
    // nếu có employeeId thì chỉ set state để action "Sửa" nhanh hơn
    setEditingEmployeeId(selectedEmployeeId);
  }, [selectedEmployeeId]);

  const openDetail = async (id: string, rowHint?: any) => {
    setPanelParams({ employeeId: id, createEmployee: null });

    // Open immediately with best-available info (even in mock mode).
    const cached = employeesDb.find((e) => e.id === id);
    if (cached) {
      setDetailRow(cached);
      setEmployeeDetailOpen(true);
    } else if (rowHint) {
      setDetailRow(toEmployeesRow({ ...rowHint, id }));
      setEmployeeDetailOpen(true);
    } else {
      const mock = (mockEmployees as any[]).find((e) => String(e.id) === String(id));
      if (mock) {
        setDetailRow(toEmployeesRow(mock));
        setEmployeeDetailOpen(true);
      }
    }

    // Then hydrate from DB if possible.
    if (!isSupabaseConfigured) return;
    const { data } = await supabase
      .from('employees')
      .select(
        'id, employee_code, full_name, email, phone, position, department, status, start_date, salary, avatar_url, gender, birth_date, id_number, id_issue_date, id_issue_place, permanent_address, temporary_address, emergency_contact, emergency_phone, employment_type, work_location, bank_name, bank_account, tax_code, social_insurance_number, health_insurance_number'
      )
      .eq('id', id)
      .maybeSingle();
    if (data) {
      setDetailRow(data as any);
      setEmployeeDetailOpen(true);
    }
  };

  useEffect(() => {
    if (!selectedEmployeeId) return;
    let cancelled = false;
    (async () => {
      const cached = employeesDb.find((e) => e.id === selectedEmployeeId);
      if (cached) {
        setDetailRow(cached);
        setEmployeeDetailOpen(true);
        return;
      }

      const mock = (mockEmployees as any[]).find((e) => String(e.id) === String(selectedEmployeeId));
      if (mock) {
        setDetailRow(toEmployeesRow(mock));
        setEmployeeDetailOpen(true);
        return;
      }

      if (!isSupabaseConfigured && getMode() !== 'rest') return;
      try {
        const data = await hrmDataProvider.getEmployee(selectedEmployeeId);
        if (cancelled) return;
        if (data) {
          setDetailRow(data as any);
          setEmployeeDetailOpen(true);
        }
      } catch (e) {
        console.error('Failed to load employee detail', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedEmployeeId, employeesDb]);

  const hrmEmployees = useMemo(() => {
    if ((isSupabaseConfigured || getMode() === 'rest') && employeesDb.length > 0) {
      return employeesDb.map((e) => ({
        id: e.id,
        code: e.employee_code,
        fullName: e.full_name,
        position: e.position ?? '—',
        department: e.department ?? '—',
        email: e.email ?? '',
        phone: e.phone ?? '',
        status: (e.status === 'active' ? 'active' : 'inactive') as Employee['status'],
        employmentType: (e.employment_type ?? 'full-time') as Employee['employmentType'],
        joinDate: e.start_date ?? new Date().toISOString().slice(0, 10),
        salary: e.salary ?? 0,
      }));
    }
    
    // Filter mock employees by companyId if selected
    const filteredMocks = !selectedCompany?.id || selectedCompany.id === 'all'
      ? mockEmployees
      : mockEmployees.filter(e => e.companyId === selectedCompany.id);

    return filteredMocks.map(e => ({
      ...e,
      joinDate: e.joinDate || new Date().toISOString().slice(0, 10),
    }));
  }, [employeesDb, selectedCompany?.id]);

  const openEdit = async (id: string) => {
    setEmployeeFormMode('edit');
    setEmployeeFormTab('basic');
    setEditingEmployeeId(id);
    setEmployeeFormOpen(true);
    setPanelParams({ createEmployee: null, employeeId: id });

    const cached = employeesDb.find((e) => e.id === id);
    const row = cached
      ? cached
      : await (async () => {
          try {
            return await hrmDataProvider.getEmployee(id);
          } catch (e) {
            return null;
          }
        })();

    if (!row) return;
    setForm({
      employee_code: row.employee_code ?? '',
      full_name: row.full_name ?? '',
      email: row.email ?? '',
      phone: row.phone ?? '',
      department: row.department ?? '',
      position: row.position ?? '',
      start_date: row.start_date ?? '',
      salary: row.salary == null ? '' : String(row.salary),
      status: row.status ?? 'active',
      gender: row.gender ?? '',
      birth_date: row.birth_date ?? '',
      id_number: row.id_number ?? '',
      id_issue_date: row.id_issue_date ?? '',
      id_issue_place: row.id_issue_place ?? '',
      permanent_address: row.permanent_address ?? '',
      temporary_address: row.temporary_address ?? '',
      emergency_contact: row.emergency_contact ?? '',
      emergency_phone: row.emergency_phone ?? '',
      employment_type: row.employment_type ?? 'full-time',
      work_location: row.work_location ?? '',
      bank_name: row.bank_name ?? '',
      bank_account: row.bank_account ?? '',
      tax_code: row.tax_code ?? '',
      social_insurance_number: row.social_insurance_number ?? '',
      health_insurance_number: row.health_insurance_number ?? '',
      avatar_url: row.avatar_url ?? '',
    });
  };

  const closeModal = () => {
    setEmployeeFormOpen(false);
    setPanelParams({ createEmployee: null });
  };

  const closeDetail = () => {
    setEmployeeDetailOpen(false);
    setDetailRow(null);
    setPanelParams({ employeeId: null });
  };

  const refresh = async () => {
    if (!selectedCompany?.id) return;
    setEmployeesLoading(true);
    try {
      const rows = await hrmDataProvider.listEmployees({
        companyId: selectedCompany.id === 'all' ? null : selectedCompany.id,
        limit: 200,
      });
      setEmployeesDb(
        rows.map((row: any) => ({
          id: row.id,
          employee_code: row.employee_code,
          full_name: row.full_name,
          email: row.email ?? null,
          phone: row.phone ?? null,
          position: row.position ?? null,
          department: row.department ?? null,
          status: row.status ?? 'active',
          start_date: row.start_date ?? null,
          salary: row.salary ?? null,
          avatar_url: row.avatar_url ?? null,
          gender: row.gender ?? null,
          birth_date: row.birth_date ?? null,
          id_number: row.id_number ?? null,
          id_issue_date: row.id_issue_date ?? null,
          id_issue_place: row.id_issue_place ?? null,
          permanent_address: row.permanent_address ?? null,
          temporary_address: row.temporary_address ?? null,
          emergency_contact: row.emergency_contact ?? null,
          emergency_phone: row.emergency_phone ?? null,
          employment_type: row.employment_type ?? null,
          work_location: row.work_location ?? null,
          bank_name: row.bank_name ?? null,
          bank_account: row.bank_account ?? null,
          tax_code: row.tax_code ?? null,
          social_insurance_number: row.social_insurance_number ?? null,
          health_insurance_number: row.health_insurance_number ?? null,
        }))
      );
    } finally {
      setEmployeesLoading(false);
    }
  };

  const submit = async (data: any = form) => {
    if (!canWriteDb) return;
    if (!data.employee_code?.trim() || !data.full_name?.trim()) return;

    setSubmitLoading(true);
    try {
      if (employeeFormMode === 'create') {
        await hrmDataProvider.createEmployee({
          company_id: data.company_id || selectedCompany.id,
          ...data,
          employee_code: data.employee_code.trim(),
          full_name: data.full_name.trim(),
          salary: data.salary ? Number(data.salary) : null,
        });
        alert('Thêm nhân sự mới thành công!');
      } else {
        if (!editingEmployeeId) return;
        await hrmDataProvider.updateEmployee(editingEmployeeId, {
          ...form,
          employee_code: form.employee_code.trim(),
          full_name: form.full_name.trim(),
          salary: form.salary ? Number(form.salary) : null,
        });
        alert('Cập nhật nhân sự thành công!');
      }

      closeModal();
      await refresh();
    } catch (error) {
      alert('Thao tác thất bại! Vui lòng kiểm tra lại.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return;
    try {
      await hrmDataProvider.deleteEmployee(id);
      alert('Xóa nhân sự thành công!');
      await refresh();
    } catch (error) {
      alert('Xóa nhân sự thất bại!');
    }
  };


  const editingEmployee = useMemo(() => {
    const fromDb = employeesDb.find(e => e.id === editingEmployeeId);
    if (fromDb) return fromDb;
    if (detailRow && detailRow.id === editingEmployeeId) return detailRow;
    return null;
  }, [editingEmployeeId, employeesDb, detailRow]);

  const [openDeptFilter, setOpenDeptFilter] = useState(false);
  const [openStatusFilter, setOpenStatusFilter] = useState(false);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('Tất cả phòng ban');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Tất cả trạng thái');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(hrmEmployees.length / pageSize);
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return hrmEmployees.slice(start, start + pageSize);
  }, [hrmEmployees, currentPage, pageSize]);

  return (
    <>
      {/* Search and Filters Row - Custom Rounded Dropdowns */}
      <div className="mt-2 flex flex-wrap items-center gap-3 bg-xevn-surface p-4 rounded-3xl border border-xevn-border shadow-soft">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nhân viên, vị trí..."
            className="w-full h-11 pl-11 pr-4 rounded-full border border-xevn-border bg-white text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20 transition-all shadow-sm"
          />
        </div>
        
        {/* Custom Dropdown for Department */}
        <div className="relative min-w-[180px]">
          <button 
            onClick={() => { setOpenDeptFilter(!openDeptFilter); setOpenStatusFilter(false); }}
            className="w-full h-11 px-5 flex items-center justify-between rounded-full border border-xevn-border bg-white text-sm hover:bg-slate-50 transition-all shadow-sm font-bold text-slate-600"
          >
            <span className="truncate">{selectedDeptFilter}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openDeptFilter ? 'rotate-180' : ''}`} />
          </button>
          {openDeptFilter && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpenDeptFilter(false)} />
              <div className="absolute top-full right-0 mt-2 w-[240px] bg-white border border-xevn-border rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Chọn phòng ban</div>
                <div className="max-h-[300px] overflow-y-auto">
                  <button 
                    onClick={() => { setSelectedDeptFilter('Tất cả phòng ban'); setOpenDeptFilter(false); }}
                    className={`w-full px-4 py-2 text-left text-sm font-bold flex items-center justify-between transition-colors ${selectedDeptFilter === 'Tất cả phòng ban' ? 'bg-xevn-primary/5 text-xevn-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    Tất cả phòng ban
                    {selectedDeptFilter === 'Tất cả phòng ban' && <Check className="w-4 h-4" />}
                  </button>
                  {DEPARTMENTS.map(d => (
                    <button 
                      key={d} 
                      onClick={() => { setSelectedDeptFilter(d); setOpenDeptFilter(false); }}
                      className={`w-full px-4 py-2 text-left text-sm font-bold flex items-center justify-between transition-colors ${selectedDeptFilter === d ? 'bg-xevn-primary/5 text-xevn-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {d}
                      {selectedDeptFilter === d && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Custom Dropdown for Status */}
        <div className="relative min-w-[160px]">
          <button 
            onClick={() => { setOpenStatusFilter(!openStatusFilter); setOpenDeptFilter(false); }}
            className="w-full h-11 px-5 flex items-center justify-between rounded-full border border-xevn-border bg-white text-sm hover:bg-slate-50 transition-all shadow-sm font-bold text-slate-600"
          >
            <span className="truncate">{selectedStatusFilter}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openStatusFilter ? 'rotate-180' : ''}`} />
          </button>
          {openStatusFilter && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpenStatusFilter(false)} />
              <div className="absolute top-full right-0 mt-2 w-[200px] bg-white border border-xevn-border rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</div>
                {[
                  { id: 'Tất cả trạng thái', label: 'Tất cả trạng thái' },
                  { id: 'active', label: 'Đang làm việc' },
                  { id: 'inactive', label: 'Đã thôi việc' },
                  { id: 'on-hold', label: 'Tạm hoãn' }
                ].map(s => (
                  <button 
                    key={s.id}
                    onClick={() => { setSelectedStatusFilter(s.label); setOpenStatusFilter(false); }}
                    className={`w-full px-4 py-2 text-left text-sm font-bold flex items-center justify-between transition-colors ${selectedStatusFilter === s.label ? 'bg-xevn-primary/5 text-xevn-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {s.label}
                    {selectedStatusFilter === s.label && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Card className="mt-4 p-0 overflow-hidden">
        <DataTable
          columns={[
            {
              key: 'code',
              header: 'Mã NV',
              render: (row: any) => <span className="font-mono text-sm font-medium text-xevn-primary">{row.code}</span>,
            },
            { key: 'fullName', header: 'Họ tên', render: (row: any) => <span className="font-medium">{row.fullName}</span> },
            { key: 'position', header: 'Chức vụ' },
            { key: 'department', header: 'Phòng/Ban' },
            {
              key: 'status',
              header: 'Trạng thái',
              render: (row: any) => (
                <span className={`font-medium px-3 py-1 rounded-full text-[12px] ${
                  row.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 
                  row.status === 'on-leave' ? 'bg-amber-50 text-amber-700' :
                  row.status === 'inactive' ? 'bg-slate-50 text-slate-700' :
                  'bg-rose-50 text-rose-700'
                }`}>
                  {row.status === 'active' ? 'Đang làm' : 
                   row.status === 'on-leave' ? 'Nghỉ phép' :
                   row.status === 'inactive' ? 'Tạm nghỉ' :
                   row.status === 'terminated' ? 'Nghỉ việc' : row.status}
                </span>
              ),
            },
            {
              key: 'joinDate',
              header: 'Ngày vào',
              render: (row: any) => <span className="text-slate-600">{row.joinDate ? new Date(row.joinDate).toLocaleDateString('vi-VN') : '—'}</span>,
            },
            {
              key: 'actions',
              header: 'Thao tác',
              render: (row: any) => (
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      className="text-[15px] font-semibold text-xevn-primary hover:underline"
                      onClick={() => void openDetail(row.id, row)}
                    >
                      Xem hồ sơ
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
                      title="Xóa nhân sự"
                      onClick={() => {
                        if (!isSupabaseConfigured) {
                          alert('Chế độ xem thử: Tính năng Xóa yêu cầu kết nối Cơ sở dữ liệu.');
                          return;
                        }
                        void handleDelete(row.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
              ),
            },
          ]}
          data={employeesLoading ? [] : paginatedEmployees}
          emptyMessage={employeesLoading ? 'Đang tải dữ liệu...' : 'Không có dữ liệu nhân sự'}
          className={SETTINGS_CONTROL_TEXT}
        />
        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-50 bg-slate-50/30 px-6 py-4">
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Hiển thị {hrmEmployees.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, hrmEmployees.length)} trong số {hrmEmployees.length} bản ghi
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Số hàng:</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="h-8 rounded-full border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 focus:outline-none focus:ring-4 focus:ring-xevn-primary/10 transition-all"
              >
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 disabled:opacity-40 hover:border-xevn-primary hover:text-xevn-primary transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-black text-slate-500 min-w-[60px] text-center">{currentPage} / {Math.max(1, totalPages)}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 disabled:opacity-40 hover:border-xevn-primary hover:text-xevn-primary transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* --- REFACTORED MODALS --- */}
      <EmployeeFormModal 
        open={employeeFormOpen}
        onClose={closeModal}
        employee={editingEmployee}
        onSubmit={async (data) => {
          await submit(data);
        }}
        loading={submitLoading}
        departments={DEPARTMENTS}
        positions={POSITIONS}
        companies={mockCompanies}
      />

      <EmployeeDetailModal 
        open={employeeDetailOpen}
        onClose={closeDetail}
        employee={detailRow}
        departments={DEPARTMENTS}
        positions={POSITIONS}
        onSave={async (data) => {
          if (!detailRow) return;
          try {
            await hrmDataProvider.updateEmployee(detailRow.id, {
              ...data,
              salary: data.salary ? Number(data.salary) : null
            });
            alert('Cập nhật nhân sự thành công!');
            await refresh();
          } catch (error) {
            alert('Cập nhật nhân sự thất bại!');
          }
        }}
      />

      <EmployeeTrashModal 
        open={activeModal === 'trash'}
        onClose={() => setPanelParams({ modal: null })}
      />

      <EmployeeImportModal 
        open={activeModal === 'import'}
        onClose={() => setPanelParams({ modal: null })}
      />

      <EmployeeExportModal 
        open={activeModal === 'export'}
        onClose={() => setPanelParams({ modal: null })}
        employees={hrmEmployees}
      />
    </>
  );
};

