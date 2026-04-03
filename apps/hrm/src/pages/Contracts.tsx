import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDepartments } from '@/hooks/useDepartments';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Clock,
  GraduationCap,
  UserCheck,
  FileSignature,
  Pencil,
  CalendarIcon,
  Eye,
  FileUp,
  File,
  X,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ContractImportDialog } from '@/components/contract/ContractImportDialog';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface Contract {
  id: string;
  contract_code: string;
  employee_name: string;
  employee_avatar: string | null;
  department: string | null;
  contract_type: string;
  effective_date: string | null;
  expiry_date: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  file_url: string | null;
  notes: string | null;
  company_id: string;
  source: 'contracts' | 'employee_contracts'; // Track which table the contract came from
  employee_id?: string; // Only for employee_contracts
}

interface FormData {
  contract_code: string;
  employee_name: string;
  employee_avatar: string;
  department: string;
  contract_type: string;
  effective_date: Date | undefined;
  expiry_date: Date | undefined;
  status: string;
  notes: string;
  file_url: string;
}

const initialFormData: FormData = {
  contract_code: '',
  employee_name: '',
  employee_avatar: '',
  department: '',
  contract_type: 'Hợp đồng 1 năm',
  effective_date: undefined,
  expiry_date: undefined,
  status: 'pending',
  notes: '',
  file_url: '',
};

const getContractTypes = (t: any) => [
  { key: 'all', label: t('contracts.types.all'), icon: LayoutDashboard, color: 'bg-blue-500', textColor: 'text-blue-600' },
  { key: 'Hợp đồng 1 năm', label: t('contracts.types.oneYear'), icon: FileText, color: 'bg-indigo-500', textColor: 'text-indigo-600' },
  { key: 'Hợp đồng 3 năm', label: t('contracts.types.threeYear'), icon: FileSignature, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
  { key: 'Hợp đồng 6 tháng', label: t('contracts.types.sixMonth'), icon: Clock, color: 'bg-amber-500', textColor: 'text-amber-600' },
  { key: 'Hợp đồng học việc', label: t('contracts.types.apprentice'), icon: GraduationCap, color: 'bg-cyan-500', textColor: 'text-cyan-600' },
  { key: 'Hợp đồng thử việc', label: t('contracts.types.probation'), icon: UserCheck, color: 'bg-purple-500', textColor: 'text-purple-600' },
];

const CONTRACT_TYPE_OPTIONS = [
  'Hợp đồng 1 năm',
  'Hợp đồng 3 năm',
  'Hợp đồng 6 tháng',
  'Hợp đồng học việc',
  'Hợp đồng thử việc',
];

const getStatusOptions = (t: any) => [
  { value: 'pending', label: t('contracts.statuses.pending') },
  { value: 'active', label: t('contracts.statuses.active') },
  { value: 'expired', label: t('contracts.statuses.expired') },
];

const getStatusBadge = (status: string, t: any) => {
  const config: Record<string, { labelKey: string; className: string }> = {
    active: { labelKey: 'contracts.statuses.active', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0' },
    pending: { labelKey: 'contracts.statuses.pending', className: 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-0' },
    expired: { labelKey: 'contracts.statuses.expired', className: 'bg-rose-100 text-rose-700 hover:bg-rose-100 border-0' },
  };
  const { labelKey, className } = config[status] || { labelKey: '', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-0' };
  return <Badge className={className}>{labelKey ? t(labelKey) : status}</Badge>;
};

export default function Contracts() {
  const { t } = useTranslation();
  const { currentCompanyId, user } = useAuth();
  const { departments } = useDepartments();
  const queryClient = useQueryClient();
  const contractTypes = getContractTypes(t);
  const STATUS_OPTIONS = getStatusOptions(t);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterEffectiveDateFrom, setFilterEffectiveDateFrom] = useState<Date | undefined>();
  const [filterEffectiveDateTo, setFilterEffectiveDateTo] = useState<Date | undefined>();
  const [filterExpiryDateFrom, setFilterExpiryDateFrom] = useState<Date | undefined>();
  const [filterExpiryDateTo, setFilterExpiryDateTo] = useState<Date | undefined>();
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // Fetch employees for dropdown
  const { data: employeesList = [] } = useQuery({
    queryKey: ['employees-list', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, employee_code, department, position, avatar_url')
        .eq('company_id', currentCompanyId)
        .is('deleted_at', null)
        .order('full_name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentCompanyId,
  });

  const handleEmployeeSelect = (employeeId: string) => {
    const emp = employeesList.find(e => e.id === employeeId);
    if (emp) {
      setFormData(prev => ({
        ...prev,
        employee_name: emp.full_name,
        employee_avatar: emp.avatar_url || '',
        department: emp.department || '',
      }));
    }
  };

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts', selectedType, currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      
      // Fetch from contracts table
      let contractsQuery = supabase
        .from('contracts')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });

      if (selectedType !== 'all') {
        contractsQuery = contractsQuery.eq('contract_type', selectedType);
      }

      const { data: contractsData, error: contractsError } = await contractsQuery;
      if (contractsError) throw contractsError;

      // Fetch from employee_contracts table
      let employeeContractsQuery = supabase
        .from('employee_contracts')
        .select('*, employees!inner(full_name, avatar_url)')
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });

      if (selectedType !== 'all') {
        employeeContractsQuery = employeeContractsQuery.eq('contract_type', selectedType);
      }

      const { data: employeeContractsData, error: employeeContractsError } = await employeeContractsQuery;
      if (employeeContractsError) throw employeeContractsError;

      // Transform contracts table data
      const contractsFromTable: Contract[] = (contractsData || []).map((c) => ({
        id: c.id,
        contract_code: c.contract_code,
        employee_name: c.employee_name,
        employee_avatar: c.employee_avatar,
        department: c.department,
        contract_type: c.contract_type,
        effective_date: c.effective_date,
        expiry_date: c.expiry_date,
        status: c.status,
        created_by: c.created_by,
        created_at: c.created_at,
        file_url: c.file_url,
        notes: c.notes,
        company_id: c.company_id,
        source: 'contracts' as const,
      }));

      // Transform employee_contracts table data
      const contractsFromEmployees: Contract[] = (employeeContractsData || []).map((ec: any) => ({
        id: ec.id,
        contract_code: ec.contract_code,
        employee_name: ec.employees?.full_name || 'Unknown',
        employee_avatar: ec.employees?.avatar_url || null,
        department: ec.department,
        contract_type: ec.contract_type,
        effective_date: ec.effective_date,
        expiry_date: ec.expiry_date,
        status: ec.status,
        created_by: ec.created_by,
        created_at: ec.created_at,
        file_url: ec.file_url,
        notes: ec.notes,
        company_id: ec.company_id,
        source: 'employee_contracts' as const,
        employee_id: ec.employee_id,
      }));

      // Combine and sort by created_at
      const allContracts = [...contractsFromTable, ...contractsFromEmployees]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return allContracts;
    },
    enabled: !!currentCompanyId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!currentCompanyId) throw new Error('No company selected');
      
      const { error } = await supabase.from('contracts').insert({
        contract_code: data.contract_code,
        employee_name: data.employee_name,
        employee_avatar: data.employee_avatar || null,
        department: data.department || null,
        contract_type: data.contract_type,
        effective_date: data.effective_date ? format(data.effective_date, 'yyyy-MM-dd') : null,
        expiry_date: data.expiry_date ? format(data.expiry_date, 'yyyy-MM-dd') : null,
        status: data.status,
        notes: data.notes || null,
        file_url: data.file_url || null,
        company_id: currentCompanyId,
        created_by: user?.email || null,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success(t('contracts.createSuccess'));
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(t('contracts.createError') + ': ' + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const { error } = await supabase
        .from('contracts')
        .update({
          contract_code: data.contract_code,
          employee_name: data.employee_name,
          employee_avatar: data.employee_avatar || null,
          department: data.department || null,
          contract_type: data.contract_type,
          effective_date: data.effective_date ? format(data.effective_date, 'yyyy-MM-dd') : null,
          expiry_date: data.expiry_date ? format(data.expiry_date, 'yyyy-MM-dd') : null,
          status: data.status,
          notes: data.notes || null,
          file_url: data.file_url || null,
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success(t('contracts.updateSuccess'));
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(t('contracts.updateError') + ': ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (contract: Contract) => {
      const table = contract.source === 'employee_contracts' ? 'employee_contracts' : 'contracts';
      const { error } = await supabase.from(table).delete().eq('id', contract.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success(t('contracts.deleteSuccess'));
      setDeleteDialogOpen(false);
      setDeletingContract(null);
    },
    onError: (error) => {
      toast.error(t('contracts.deleteError') + ': ' + error.message);
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (contractsToDelete: Contract[]) => {
      // Group by source table
      const contractsIds = contractsToDelete.filter(c => c.source === 'contracts').map(c => c.id);
      const employeeContractsIds = contractsToDelete.filter(c => c.source === 'employee_contracts').map(c => c.id);
      
      if (contractsIds.length > 0) {
        const { error } = await supabase.from('contracts').delete().in('id', contractsIds);
        if (error) throw error;
      }
      
      if (employeeContractsIds.length > 0) {
        const { error } = await supabase.from('employee_contracts').delete().in('id', employeeContractsIds);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success(t('contracts.bulkDeleteSuccess', { count: selectedContracts.length }));
      setBulkDeleteDialogOpen(false);
      setSelectedContracts([]);
    },
    onError: (error) => {
      toast.error(t('contracts.deleteError') + ': ' + error.message);
    },
  });

  const handleOpenCreate = () => {
    setEditingContract(null);
    setFormData(initialFormData);
    setSelectedFile(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (contract: Contract) => {
    setEditingContract(contract);
    setFormData({
      contract_code: contract.contract_code,
      employee_name: contract.employee_name,
      employee_avatar: contract.employee_avatar || '',
      department: contract.department || '',
      contract_type: contract.contract_type,
      effective_date: contract.effective_date ? new Date(contract.effective_date) : undefined,
      expiry_date: contract.expiry_date ? new Date(contract.expiry_date) : undefined,
      status: contract.status,
      notes: contract.notes || '',
      file_url: contract.file_url || '',
    });
    setSelectedFile(null);
    setDialogOpen(true);
  };

  const handleOpenView = (contract: Contract) => {
    setViewingContract(contract);
    setViewDialogOpen(true);
  };

  const handleOpenDelete = (contract: Contract) => {
    setDeletingContract(contract);
    setDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingContract(null);
    setFormData(initialFormData);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('contracts.fileMaxSize'));
        return;
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(t('contracts.fileTypeError'));
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File, contractCode: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentCompanyId}/${contractCode}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('contracts')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const removeExistingFile = async (fileUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/contracts/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('contracts').remove([filePath]);
      }
    } catch (error) {
      console.error('Error removing file:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.contract_code || !formData.employee_name) {
      toast.error(t('contracts.requiredFields'));
      return;
    }

    setIsSubmitting(true);
    try {
      let fileUrl = formData.file_url;
      
      // Upload new file if selected
      if (selectedFile) {
        setIsUploading(true);
        const uploadedUrl = await uploadFile(selectedFile, formData.contract_code);
        if (uploadedUrl) {
          // Remove old file if editing and had a previous file
          if (editingContract?.file_url) {
            await removeExistingFile(editingContract.file_url);
          }
          fileUrl = uploadedUrl;
        } else {
          toast.error(t('contracts.uploadError'));
          setIsUploading(false);
          setIsSubmitting(false);
          return;
        }
        setIsUploading(false);
      }

      const dataWithFile = { ...formData, file_url: fileUrl };

      if (editingContract) {
        await updateMutation.mutateAsync({ id: editingContract.id, data: dataWithFile });
      } else {
        await createMutation.mutateAsync(dataWithFile);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if any filters are active
  const hasActiveFilters = filterStatus.length > 0 || 
    filterEffectiveDateFrom || filterEffectiveDateTo || 
    filterExpiryDateFrom || filterExpiryDateTo;

  const clearAllFilters = () => {
    setFilterStatus([]);
    setFilterEffectiveDateFrom(undefined);
    setFilterEffectiveDateTo(undefined);
    setFilterExpiryDateFrom(undefined);
    setFilterExpiryDateTo(undefined);
    setCurrentPage(1);
  };

  const toggleStatusFilter = (status: string) => {
    setFilterStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
    setCurrentPage(1);
  };

  const filteredContracts = contracts.filter((contract) => {
    // Search filter
    const matchesSearch = contract.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.contract_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contract.department?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    if (!matchesSearch) return false;

    // Status filter
    if (filterStatus.length > 0 && !filterStatus.includes(contract.status)) {
      return false;
    }

    // Effective date filter
    if (filterEffectiveDateFrom && contract.effective_date) {
      const effectiveDate = new Date(contract.effective_date);
      if (effectiveDate < filterEffectiveDateFrom) return false;
    }
    if (filterEffectiveDateTo && contract.effective_date) {
      const effectiveDate = new Date(contract.effective_date);
      if (effectiveDate > filterEffectiveDateTo) return false;
    }

    // Expiry date filter
    if (filterExpiryDateFrom && contract.expiry_date) {
      const expiryDate = new Date(contract.expiry_date);
      if (expiryDate < filterExpiryDateFrom) return false;
    }
    if (filterExpiryDateTo && contract.expiry_date) {
      const expiryDate = new Date(contract.expiry_date);
      if (expiryDate > filterExpiryDateTo) return false;
    }

    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);
  
  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedContracts([]);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
    setSelectedContracts([]);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const typeCounts = contractTypes.map((type) => ({
    ...type,
    count: type.key === 'all' 
      ? contracts.length 
      : contracts.filter((c) => c.contract_type === type.key).length,
  }));

  const toggleSelectAll = () => {
    if (selectedContracts.length === filteredContracts.length) {
      setSelectedContracts([]);
    } else {
      setSelectedContracts(filteredContracts.map((c) => c.id));
    }
  };

  const toggleSelectContract = (id: string) => {
    setSelectedContracts((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getStatusLabel = (status: string) => {
    return t(`contracts.statuses.${status}`) || status;
  };

  const handleExportExcel = () => {
    if (filteredContracts.length === 0) {
      toast.error(t('contracts.noExportData'));
      return;
    }

    const exportData = filteredContracts.map((contract, index) => ({
      [t('contracts.exNo')]: index + 1,
      [t('contracts.exCode')]: contract.contract_code,
      [t('contracts.exEmployee')]: contract.employee_name,
      [t('contracts.exDepartment')]: contract.department || '',
      [t('contracts.exType')]: contract.contract_type,
      [t('contracts.exEffective')]: contract.effective_date 
        ? format(new Date(contract.effective_date), 'dd/MM/yyyy') 
        : '',
      [t('contracts.exExpiry')]: contract.expiry_date 
        ? format(new Date(contract.expiry_date), 'dd/MM/yyyy') 
        : '',
      [t('contracts.exStatus')]: getStatusLabel(contract.status),
      [t('contracts.exCreatedBy')]: contract.created_by || '',
      [t('contracts.exCreatedAt')]: format(new Date(contract.created_at), 'dd/MM/yyyy HH:mm'),
      [t('contracts.exNotes')]: contract.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    worksheet['!cols'] = [
      { wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 20 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 30 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('contracts.exSheetName'));
    
    const fileName = `contracts_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast.success(t('contracts.exportedCount', { count: filteredContracts.length }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <PermissionGate module="contracts" action="create">
            <Button size="sm" className="gap-2" onClick={handleOpenCreate}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('contracts.addContract')}</span>
              <span className="sm:hidden">+</span>
            </Button>
          </PermissionGate>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('contracts.search')}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className={cn(hasActiveFilters && 'border-primary text-primary')}>
                <Filter className="w-4 h-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{t('contracts.advancedFilter')}</h4>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 text-xs">
                      {t('contracts.clearAll')}
                    </Button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('contracts.statusLabel')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((status) => (
                      <Button
                        key={status.value}
                        variant={filterStatus.includes(status.value) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleStatusFilter(status.value)}
                        className="h-7 text-xs"
                      >
                        {status.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Effective Date Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('contracts.effectiveDate')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'justify-start text-left font-normal h-8 text-xs',
                            !filterEffectiveDateFrom && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {filterEffectiveDateFrom ? format(filterEffectiveDateFrom, 'dd/MM/yyyy') : t('contracts.fromDate')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filterEffectiveDateFrom}
                          onSelect={setFilterEffectiveDateFrom}
                          locale={vi}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'justify-start text-left font-normal h-8 text-xs',
                            !filterEffectiveDateTo && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {filterEffectiveDateTo ? format(filterEffectiveDateTo, 'dd/MM/yyyy') : t('contracts.toDate')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filterEffectiveDateTo}
                          onSelect={setFilterEffectiveDateTo}
                          locale={vi}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Expiry Date Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('contracts.expiryDate')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'justify-start text-left font-normal h-8 text-xs',
                            !filterExpiryDateFrom && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {filterExpiryDateFrom ? format(filterExpiryDateFrom, 'dd/MM/yyyy') : t('contracts.fromDate')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filterExpiryDateFrom}
                          onSelect={setFilterExpiryDateFrom}
                          locale={vi}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'justify-start text-left font-normal h-8 text-xs',
                            !filterExpiryDateTo && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {filterExpiryDateTo ? format(filterExpiryDateTo, 'dd/MM/yyyy') : t('contracts.toDate')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filterExpiryDateTo}
                          onSelect={setFilterExpiryDateTo}
                          locale={vi}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => setFilterPopoverOpen(false)}
                >
                  {t('contracts.applyFilter')}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <PermissionGate module="contracts" action="export">
            <Button variant="outline" size="icon" onClick={handleExportExcel} title="Xuất Excel">
              <Download className="w-4 h-4" />
            </Button>
          </PermissionGate>
          <PermissionGate module="contracts" action="create">
            <Button variant="outline" size="icon" onClick={() => setImportDialogOpen(true)}>
              <Upload className="w-4 h-4" />
            </Button>
          </PermissionGate>
          <PermissionGate module="contracts" action="delete">
            <Button 
              variant="outline" 
              size="icon" 
              className="text-destructive"
              disabled={selectedContracts.length === 0}
              onClick={() => setBulkDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Horizontal Menu with Colored Icons */}
      <div className="px-6 py-3 border-b bg-card">
        <div className="flex items-center gap-2 overflow-x-auto">
          {typeCounts.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.key;
            return (
              <button
                key={type.key}
                onClick={() => setSelectedType(type.key)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                  isSelected
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded flex items-center justify-center',
                  type.color
                )}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span>{type.label}</span>
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{type.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50 z-10">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    filteredContracts.length > 0 &&
                    selectedContracts.length === filteredContracts.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>{t('contracts.tableCode')}</TableHead>
              <TableHead>{t('contracts.tableEmployee')}</TableHead>
              <TableHead>{t('contracts.tableDepartment')}</TableHead>
              <TableHead>{t('contracts.tableType')}</TableHead>
              <TableHead>{t('contracts.tableEffective')}</TableHead>
              <TableHead>{t('contracts.tableExpiry')}</TableHead>
              <TableHead>{t('contracts.tableStatus')}</TableHead>
              <TableHead className="w-28">{t('contracts.tableActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  {t('contracts.loading')}
                </TableCell>
              </TableRow>
            ) : paginatedContracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  {t('contracts.noData')}
                </TableCell>
              </TableRow>
            ) : (
              paginatedContracts.map((contract) => (
                <TableRow 
                  key={contract.id}
                  className={cn(
                    selectedContracts.includes(contract.id) && 'bg-primary/5'
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedContracts.includes(contract.id)}
                      onCheckedChange={() => toggleSelectContract(contract.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-primary">
                    {contract.contract_code}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={contract.employee_avatar || undefined} />
                        <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">
                          {getInitials(contract.employee_name)}
                        </AvatarFallback>
                      </Avatar>
                      {contract.source === 'employee_contracts' && contract.employee_id ? (
                        <Link 
                          to={`/employees/${contract.employee_id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {contract.employee_name}
                        </Link>
                      ) : (
                        <span className="font-medium">
                          {contract.employee_name}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contract.department || '-'}
                  </TableCell>
                  <TableCell>{contract.contract_type}</TableCell>
                  <TableCell>
                    {contract.effective_date
                      ? format(new Date(contract.effective_date), 'dd/MM/yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {contract.expiry_date
                      ? format(new Date(contract.expiry_date), 'dd/MM/yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(contract.status, t)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenView(contract)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenEdit(contract)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleOpenDelete(contract)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 border-t bg-card">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {t('contracts.showing', { from: filteredContracts.length > 0 ? startIndex + 1 : 0, to: Math.min(endIndex, filteredContracts.length), total: filteredContracts.length })}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('contracts.rowsPerPage')}</span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {getPageNumbers().map((page, index) => 
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            )
          )}
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContract ? t('contracts.editTitle') : t('contracts.createTitle')}
            </DialogTitle>
            <DialogDescription>
              {editingContract ? t('contracts.editDesc') : t('contracts.createDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Employee Selection */}
            {!editingContract && employeesList.length > 0 && (
              <div className="space-y-2">
                <Label>{t('contracts.selectEmployee')}</Label>
                <Select onValueChange={handleEmployeeSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('contracts.selectEmployeePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {employeesList.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name} - {emp.employee_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contract_code">{t('contracts.contractCode')} <span className="text-destructive">*</span></Label>
                <Input
                  id="contract_code"
                  placeholder={t('contracts.codePlaceholder')}
                  value={formData.contract_code}
                  onChange={(e) => setFormData({ ...formData, contract_code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee_name">{t('contracts.employeeName')} <span className="text-destructive">*</span></Label>
                <Input
                  id="employee_name"
                  placeholder={t('contracts.employeePlaceholder')}
                  value={formData.employee_name}
                  onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">{t('contracts.department')}</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('contracts.departmentPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract_type">{t('contracts.contractType')}</Label>
                <Select
                  value={formData.contract_type}
                  onValueChange={(value) => setFormData({ ...formData, contract_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('contracts.selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPE_OPTIONS.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('contracts.effectiveDate')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.effective_date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.effective_date ? (
                        format(formData.effective_date, 'dd/MM/yyyy')
                      ) : (
                        <span>{t('contracts.selectDate')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.effective_date}
                      onSelect={(date) => setFormData({ ...formData, effective_date: date })}
                      locale={vi}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{t('contracts.expiryDate')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.expiry_date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expiry_date ? (
                        format(formData.expiry_date, 'dd/MM/yyyy')
                      ) : (
                        <span>{t('contracts.selectDate')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.expiry_date}
                      onSelect={(date) => setFormData({ ...formData, expiry_date: date })}
                      locale={vi}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t('contracts.statusLabel')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('contracts.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('contracts.notes')}</Label>
              <Textarea
                id="notes"
                placeholder={t('contracts.notesPlaceholder')}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* File Upload Section */}
            <div className="space-y-2">
              <Label>{t('contracts.fileLabel')}</Label>
              
              {/* Show existing file */}
              {formData.file_url && !selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <File className="w-5 h-5 text-primary" />
                  <span className="flex-1 text-sm truncate">{t('contracts.fileUploaded')}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => window.open(formData.file_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setFormData({ ...formData, file_url: '' })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Show selected file */}
              {selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <File className="w-5 h-5 text-primary" />
                  <span className="flex-1 text-sm truncate">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* File input */}
              {!selectedFile && !formData.file_url && (
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                    <FileUp className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {t('contracts.dragDrop')}
                    </span>
                  </div>
                </div>
              )}

              {/* Upload button to change file when already has one */}
              {(formData.file_url || selectedFile) && (
                <div className="relative inline-block">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button type="button" variant="outline" size="sm" className="gap-2">
                    <FileUp className="w-4 h-4" />
                    {t('contracts.changeFile')}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              {t('contracts.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || isUploading}>
              {isUploading ? t('contracts.uploading') : isSubmitting ? t('contracts.saving') : editingContract ? t('contracts.updateBtn') : t('contracts.addNew')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('contracts.viewTitle')}</DialogTitle>
          </DialogHeader>
          {viewingContract && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('contracts.contractCode')}</Label>
                  <p className="font-medium">{viewingContract.contract_code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('contracts.employeeName')}</Label>
                  <p className="font-medium">{viewingContract.employee_name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('contracts.department')}</Label>
                  <p className="font-medium">{viewingContract.department || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('contracts.contractType')}</Label>
                  <p className="font-medium">{viewingContract.contract_type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('contracts.effectiveDate')}</Label>
                  <p className="font-medium">
                    {viewingContract.effective_date
                      ? format(new Date(viewingContract.effective_date), 'dd/MM/yyyy')
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('contracts.expiryDate')}</Label>
                  <p className="font-medium">
                    {viewingContract.expiry_date
                      ? format(new Date(viewingContract.expiry_date), 'dd/MM/yyyy')
                      : '-'}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('contracts.statusLabel')}</Label>
                <div className="mt-1">{getStatusBadge(viewingContract.status, t)}</div>
              </div>
              {viewingContract.notes && (
                <div>
                  <Label className="text-muted-foreground">{t('contracts.notes')}</Label>
                  <p className="font-medium">{viewingContract.notes}</p>
                </div>
              )}
              {viewingContract.file_url && (
                <div>
                  <Label className="text-muted-foreground">{t('contracts.fileLabel')}</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => window.open(viewingContract.file_url!, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                      {t('contracts.viewFile')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      asChild
                    >
                      <a href={viewingContract.file_url} download>
                        <Download className="w-4 h-4" />
                        {t('contracts.download')}
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('contracts.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('contracts.confirmDeleteDesc', { code: deletingContract?.contract_code, name: deletingContract?.employee_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('contracts.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingContract && deleteMutation.mutate(deletingContract)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('contracts.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('contracts.confirmBulkDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('contracts.confirmBulkDeleteDesc', { count: selectedContracts.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('contracts.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const contractsToDelete = contracts.filter(c => selectedContracts.includes(c.id));
                bulkDeleteMutation.mutate(contractsToDelete);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('contracts.deleteCount', { count: selectedContracts.length })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Dialog */}
      <ContractImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </div>
  );
}