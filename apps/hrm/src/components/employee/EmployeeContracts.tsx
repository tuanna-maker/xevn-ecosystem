import { useState, useRef } from 'react';
import { useDepartments } from '@/hooks/useDepartments';

import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays, addDays, addYears, addMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  FileSignature,
  Plus,
  Eye,
  Trash2,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Bell,
  XCircle,
  Upload,
  File,
  Download,
  X,
  Loader2,
  Edit,
  RefreshCcw,
  History,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface EmployeeContractsProps {
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department?: string;
}

interface EmployeeContract {
  id: string;
  employee_id: string;
  company_id: string;
  contract_code: string;
  contract_type: string;
  effective_date: string | null;
  expiry_date: string | null;
  salary: number | null;
  position: string | null;
  department: string | null;
  work_location: string | null;
  probation_period: number | null;
  probation_end_date: string | null;
  signing_date: string | null;
  signer_name: string | null;
  signer_position: string | null;
  status: string;
  file_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  renewed_from_id: string | null;
}

const CONTRACT_TYPES_KEYS = [
  { value: 'Hợp đồng thử việc', key: 'ec.types.probation' },
  { value: 'Hợp đồng 1 năm', key: 'ec.types.oneYear' },
  { value: 'Hợp đồng 2 năm', key: 'ec.types.twoYear' },
  { value: 'Hợp đồng 3 năm', key: 'ec.types.threeYear' },
  { value: 'Hợp đồng không thời hạn', key: 'ec.types.indefinite' },
];

const getStatusConfig = (status: string, t: any) => {
  switch (status) {
    case 'active':
      return { label: t('ec.statuses.active'), color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: CheckCircle };
    case 'pending':
      return { label: t('ec.statuses.pending'), color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', icon: Clock };
    case 'expired':
      return { label: t('ec.statuses.expired'), color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: XCircle };
    case 'terminated':
      return { label: t('ec.statuses.terminated'), color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: AlertCircle };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: FileText };
  }
};

interface FormData {
  contract_code: string;
  contract_type: string;
  effective_date: string;
  expiry_date: string;
  salary: string;
  position: string;
  department: string;
  work_location: string;
  probation_period: string;
  probation_end_date: string;
  signing_date: string;
  signer_name: string;
  signer_position: string;
  status: string;
  notes: string;
}

const initialFormData: FormData = {
  contract_code: '',
  contract_type: 'Hợp đồng 1 năm',
  effective_date: '',
  expiry_date: '',
  salary: '',
  position: '',
  department: '',
  work_location: '',
  probation_period: '',
  probation_end_date: '',
  signing_date: '',
  signer_name: '',
  signer_position: '',
  status: 'pending',
  notes: '',
};

export function EmployeeContracts({ 
  employeeId, 
  employeeName, 
  employeeAvatar,
  department 
}: EmployeeContractsProps) {
  const { t } = useTranslation();
  const { departments } = useDepartments();
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<EmployeeContract | null>(null);
  const [renewingFromContract, setRenewingFromContract] = useState<EmployeeContract | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Auto-update expired contracts and fetch
  const { data: contracts, isLoading, refetch } = useQuery({
    queryKey: ['employee-contracts', employeeId],
    queryFn: async () => {
      // First, auto-update expired contracts for this company
      if (currentCompanyId) {
        await supabase.rpc('update_expired_contracts', { p_company_id: currentCompanyId });
      }
      
      // Then fetch contracts for this employee
      const { data, error } = await supabase
        .from('employee_contracts')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmployeeContract[];
    },
    enabled: !!employeeId && !!currentCompanyId,
  });

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${employeeId}/${formData.contract_code}_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('contract-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('contract-files')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error(t('ec.pdfOnly'));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('ec.fileTooLarge'));
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenDialog = (contract?: EmployeeContract) => {
    if (contract) {
      setSelectedContract(contract);
      setFormData({
        contract_code: contract.contract_code,
        contract_type: contract.contract_type,
        effective_date: contract.effective_date || '',
        expiry_date: contract.expiry_date || '',
        salary: contract.salary?.toString() || '',
        position: contract.position || '',
        department: contract.department || department || '',
        work_location: contract.work_location || '',
        probation_period: contract.probation_period?.toString() || '',
        probation_end_date: contract.probation_end_date || '',
        signing_date: contract.signing_date || '',
        signer_name: contract.signer_name || '',
        signer_position: contract.signer_position || '',
        status: contract.status,
        notes: contract.notes || '',
      });
    } else {
      setSelectedContract(null);
      setFormData({ ...initialFormData, department: department || '' });
    }
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedContract(null);
    setRenewingFromContract(null);
    setSelectedFile(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompanyId) {
      toast.error(t('ec.noCompany'));
      return;
    }
    if (!formData.contract_code.trim()) {
      toast.error(t('ec.enterContractCode'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      let fileUrl = selectedContract?.file_url || null;
      
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
      }

      const contractData = {
        employee_id: employeeId,
        company_id: currentCompanyId,
        contract_code: formData.contract_code.trim(),
        contract_type: formData.contract_type,
        effective_date: formData.effective_date || null,
        expiry_date: formData.expiry_date || null,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        position: formData.position.trim() || null,
        department: formData.department.trim() || null,
        work_location: formData.work_location.trim() || null,
        probation_period: formData.probation_period ? parseInt(formData.probation_period) : null,
        probation_end_date: formData.probation_end_date || null,
        signing_date: formData.signing_date || null,
        signer_name: formData.signer_name.trim() || null,
        signer_position: formData.signer_position.trim() || null,
        status: formData.status,
        file_url: fileUrl,
        notes: formData.notes.trim() || null,
        renewed_from_id: renewingFromContract?.id || null,
      };

      if (selectedContract) {
        const { error } = await supabase
          .from('employee_contracts')
          .update(contractData)
          .eq('id', selectedContract.id);

        if (error) throw error;
        toast.success(t('ec.updated'));
      } else {
        const { error } = await supabase
          .from('employee_contracts')
          .insert(contractData);

        if (error) throw error;
        toast.success(t('ec.added'));
      }

      handleCloseDialog();
      refetch();
    } catch (error: any) {
      console.error('Error saving contract:', error);
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (contract: EmployeeContract) => {
    if (!confirm(t('ec.confirmDelete'))) return;

    try {
      if (contract.file_url) {
        const filePath = contract.file_url.split('/contract-files/')[1];
        if (filePath) {
          await supabase.storage.from('contract-files').remove([filePath]);
        }
      }

      const { error } = await supabase
        .from('employee_contracts')
        .delete()
        .eq('id', contract.id);
        
      if (error) throw error;
      toast.success(t('ec.deleted'));
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleViewContract = (contract: EmployeeContract) => {
    setSelectedContract(contract);
    setIsViewOpen(true);
  };

  // Function to calculate new expiry date based on contract type
  const calculateNewExpiryDate = (effectiveDate: Date, contractType: string): Date => {
    switch (contractType) {
      case 'Hợp đồng thử việc':
        return addMonths(effectiveDate, 2);
      case 'Hợp đồng 1 năm':
        return addYears(effectiveDate, 1);
      case 'Hợp đồng 2 năm':
        return addYears(effectiveDate, 2);
      case 'Hợp đồng 3 năm':
        return addYears(effectiveDate, 3);
      case 'Hợp đồng không thời hạn':
        return addYears(effectiveDate, 100); // Set a very far future date
      default:
        return addYears(effectiveDate, 1);
    }
  };

  // Function to generate new contract code
  const generateNewContractCode = (oldCode: string): string => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-4);
    // Extract base code pattern and add renewal suffix
    const baseCode = oldCode.replace(/-R\d+$/, ''); // Remove existing renewal suffix if any
    const renewalMatch = oldCode.match(/-R(\d+)$/);
    const renewalNumber = renewalMatch ? parseInt(renewalMatch[1]) + 1 : 1;
    return `${baseCode}-R${renewalNumber}`;
  };

  // Handle contract renewal
  const handleRenewContract = (contract: EmployeeContract) => {
    const today = new Date();
    const newEffectiveDate = contract.expiry_date 
      ? addDays(new Date(contract.expiry_date), 1) 
      : today;
    const newExpiryDate = calculateNewExpiryDate(newEffectiveDate, contract.contract_type);

    setRenewingFromContract(contract);
    setSelectedContract(null);
    setFormData({
      contract_code: generateNewContractCode(contract.contract_code),
      contract_type: contract.contract_type,
      effective_date: format(newEffectiveDate, 'yyyy-MM-dd'),
      expiry_date: format(newExpiryDate, 'yyyy-MM-dd'),
      salary: contract.salary?.toString() || '',
      position: contract.position || '',
      department: contract.department || department || '',
      work_location: contract.work_location || '',
      probation_period: '',
      probation_end_date: '',
      signing_date: format(today, 'yyyy-MM-dd'),
      signer_name: contract.signer_name || '',
      signer_position: contract.signer_position || '',
      status: 'pending',
      notes: t('ec.renewNote', { code: contract.contract_code }),
    });
    setSelectedFile(null);
    setIsDialogOpen(true);
    toast.info(t('ec.renewingFrom', { code: contract.contract_code }));
  };

  // Get renewal history chain for a contract
  const getRenewalHistory = (contract: EmployeeContract): EmployeeContract[] => {
    const history: EmployeeContract[] = [];
    let current: EmployeeContract | undefined = contract;
    
    // Go back to find original contract
    while (current?.renewed_from_id) {
      const parent = contracts?.find(c => c.id === current!.renewed_from_id);
      if (parent) {
        history.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    
    // Add current contract
    history.push(contract);
    
    // Find all renewals from this contract
    const findRenewals = (contractId: string): EmployeeContract[] => {
      const renewals = contracts?.filter(c => c.renewed_from_id === contractId) || [];
      const allRenewals: EmployeeContract[] = [];
      for (const renewal of renewals) {
        allRenewals.push(renewal);
        allRenewals.push(...findRenewals(renewal.id));
      }
      return allRenewals;
    };
    
    history.push(...findRenewals(contract.id));
    
    // Remove duplicates and sort by effective date
    const uniqueHistory = Array.from(new Map(history.map(c => [c.id, c])).values());
    return uniqueHistory.sort((a, b) => {
      const dateA = a.effective_date ? new Date(a.effective_date).getTime() : 0;
      const dateB = b.effective_date ? new Date(b.effective_date).getTime() : 0;
      return dateA - dateB;
    });
  };

  const handleViewHistory = (contract: EmployeeContract) => {
    setSelectedContract(contract);
    setIsHistoryOpen(true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get contracts expiring within 30 days
  const expiringContracts = contracts?.filter(contract => {
    if (!contract.expiry_date || contract.status !== 'active') return false;
    const expiryDate = new Date(contract.expiry_date);
    const today = new Date();
    const daysUntilExpiry = differenceInDays(expiryDate, today);
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
  }) || [];

  const getDaysUntilExpiry = (expiryDate: string) => {
    return differenceInDays(new Date(expiryDate), new Date());
  };

  return (
    <div className="space-y-6">
      {/* Expiring Contracts Alert */}
      {expiringContracts.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertTitle className="text-orange-800 dark:text-orange-200">
            {t('ec.alertTitle', { count: expiringContracts.length })}
          </AlertTitle>
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            <div className="mt-2 space-y-2">
              {expiringContracts.map(contract => {
                const daysLeft = getDaysUntilExpiry(contract.expiry_date!);
                return (
                  <div key={contract.id} className="flex items-center justify-between text-sm gap-2">
                    <span className="font-medium">
                      {contract.contract_code} - {contract.contract_type}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={
                          daysLeft <= 7 
                            ? 'border-red-500 text-red-600 dark:text-red-400' 
                            : daysLeft <= 14 
                              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                              : 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                        }
                      >
                        <Bell className="w-3 h-3 mr-1" />
                        {daysLeft === 0 ? t('ec.expiresToday') : t('ec.daysLeft', { count: daysLeft })}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => handleRenewContract(contract)}
                      >
                        <RefreshCcw className="w-3 h-3 mr-1" />
                        {t('ec.renew')}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <FileSignature className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{contracts?.length || 0}</p>
                <p className="text-xs text-muted-foreground">{t('ec.totalContracts')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {contracts?.filter(c => c.status === 'active').length || 0}
                </p>
                <p className="text-xs text-muted-foreground">{t('ec.activeContracts')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {contracts?.filter(c => c.status === 'pending').length || 0}
                </p>
                <p className="text-xs text-muted-foreground">{t('ec.pendingContracts')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {contracts?.filter(c => c.status === 'expired').length || 0}
                </p>
                <p className="text-xs text-muted-foreground">{t('ec.expiredContracts')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="w-5 h-5" />
            {t('ec.title')}
          </CardTitle>
          <Button size="sm" onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            {t('ec.add')}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !contracts?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileSignature className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-2">{t('ec.empty')}</p>
              <p className="text-sm text-muted-foreground">
                {t('ec.emptyHint')}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('ec.contractCode')}</TableHead>
                  <TableHead>{t('ec.contractType')}</TableHead>
                  <TableHead>{t('ec.effectiveDate')}</TableHead>
                  <TableHead>{t('ec.expiryDate')}</TableHead>
                  <TableHead>{t('ec.salary')}</TableHead>
                  <TableHead>{t('ec.file')}</TableHead>
                  <TableHead>{t('ec.status')}</TableHead>
                  <TableHead className="text-right">{t('ec.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => {
                  const statusConfig = getStatusConfig(contract.status, t);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.contract_code}</TableCell>
                      <TableCell>{contract.contract_type}</TableCell>
                      <TableCell>{formatDate(contract.effective_date)}</TableCell>
                      <TableCell>{formatDate(contract.expiry_date)}</TableCell>
                      <TableCell>{formatCurrency(contract.salary)}</TableCell>
                      <TableCell>
                        {contract.file_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-primary"
                            onClick={() => window.open(contract.file_url!, '_blank')}
                          >
                            <File className="w-4 h-4" />
                            PDF
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleViewContract(contract)}
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenDialog(contract)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {(contract.status === 'active' || contract.status === 'expired') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary"
                              onClick={() => handleRenewContract(contract)}
                              title="Gia hạn hợp đồng"
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </Button>
                          )}
                          {(contract.renewed_from_id || contracts?.some(c => c.renewed_from_id === contract.id)) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600"
                              onClick={() => handleViewHistory(contract)}
                              title="Xem lịch sử gia hạn"
                            >
                              <History className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(contract)}
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedContract ? t('ec.edit') : t('ec.addNew')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('ec.contractCode')} *</Label>
                <Input
                  value={formData.contract_code}
                  onChange={(e) => setFormData({ ...formData, contract_code: e.target.value })}
                  placeholder="HD-2024-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('ec.contractType')}</Label>
                <Select
                  value={formData.contract_type}
                  onValueChange={(value) => setFormData({ ...formData, contract_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPES_KEYS.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {t(type.key)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('ec.signingDate')}</Label>
                <Input
                  type="date"
                  value={formData.signing_date}
                  onChange={(e) => setFormData({ ...formData, signing_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('ec.status')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('ec.statuses.pending')}</SelectItem>
                    <SelectItem value="active">{t('ec.statuses.active')}</SelectItem>
                    <SelectItem value="expired">{t('ec.statuses.expired')}</SelectItem>
                    <SelectItem value="terminated">{t('ec.statuses.terminated')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('ec.effectiveDate')}</Label>
                <Input
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('ec.expiryDate')}</Label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('ec.salary')}</Label>
                <Input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="15000000"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('ec.position')}</Label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Nhân viên IT"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('ec.department')}</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('ec.department')} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('ec.workLocation')}</Label>
                <Input
                  value={formData.work_location}
                  onChange={(e) => setFormData({ ...formData, work_location: e.target.value })}
                  placeholder="Hà Nội"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('ec.probationPeriod')}</Label>
                <Input
                  type="number"
                  value={formData.probation_period}
                  onChange={(e) => setFormData({ ...formData, probation_period: e.target.value })}
                  placeholder="60"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('ec.probationEndDate')}</Label>
                <Input
                  type="date"
                  value={formData.probation_end_date}
                  onChange={(e) => setFormData({ ...formData, probation_end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('ec.signerName')}</Label>
                <Input
                  value={formData.signer_name}
                  onChange={(e) => setFormData({ ...formData, signer_name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('ec.signerPosition')}</Label>
                <Input
                  value={formData.signer_position}
                  onChange={(e) => setFormData({ ...formData, signer_position: e.target.value })}
                  placeholder="Giám đốc"
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>{t('ec.contractFile')}</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              {selectedFile ? (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <File className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeSelectedFile}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : selectedContract?.file_url ? (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <File className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{t('ec.fileUploaded')}</p>
                    <p className="text-xs text-muted-foreground">{t('ec.clickToReplace')}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t('ec.replace')}
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t('ec.clickToUpload')}</p>
                  <p className="text-xs text-muted-foreground">{t('ec.maxSize')}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('ec.notes')}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Nhập ghi chú..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                {t('ec.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isSubmitting ? t('ec.saving') : selectedContract ? t('ec.update') : t('ec.save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Contract Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5" />
              {t('ec.viewDetail')}
            </DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('ec.contractCode')}</p>
                  <p className="font-medium">{selectedContract.contract_code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('ec.contractType')}</p>
                  <p className="font-medium">{selectedContract.contract_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('ec.signingDate')}</p>
                  <p className="font-medium">{formatDate(selectedContract.signing_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('ec.status')}</p>
                  <Badge className={getStatusConfig(selectedContract.status, t).color}>
                    {getStatusConfig(selectedContract.status, t).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('ec.effectiveDate')}</p>
                  <p className="font-medium">{formatDate(selectedContract.effective_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('ec.expiryDate')}</p>
                  <p className="font-medium">{formatDate(selectedContract.expiry_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('ec.salary')}</p>
                  <p className="font-medium">{formatCurrency(selectedContract.salary)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('ec.position')}</p>
                  <p className="font-medium">{selectedContract.position || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('ec.department')}</p>
                  <p className="font-medium">{selectedContract.department || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('ec.workLocation')}</p>
                  <p className="font-medium">{selectedContract.work_location || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('ec.probationPeriod')}</p>
                  <p className="font-medium">{selectedContract.probation_period ? t('ec.probationDays', { days: selectedContract.probation_period }) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('ec.probationEndDate')}</p>
                  <p className="font-medium">{formatDate(selectedContract.probation_end_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('ec.signerName')}</p>
                  <p className="font-medium">{selectedContract.signer_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('ec.signerPosition')}</p>
                  <p className="font-medium">{selectedContract.signer_position || '-'}</p>
                </div>
              </div>

              {selectedContract.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('ec.notes')}</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedContract.notes}</p>
                </div>
              )}

              {selectedContract.file_url && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <File className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t('ec.contractFileLabel')}</p>
                    <p className="text-xs text-muted-foreground">PDF</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedContract.file_url!, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Tải xuống
                  </Button>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Đóng
                </Button>
                <Button onClick={() => {
                  setIsViewOpen(false);
                  handleOpenDialog(selectedContract);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Renewal History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Lịch sử gia hạn hợp đồng
            </DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Theo dõi chuỗi hợp đồng từ hợp đồng gốc đến các lần gia hạn
              </p>
              
              <div className="relative">
                {/* Timeline */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                
                <div className="space-y-4">
                  {getRenewalHistory(selectedContract).map((contract, index, array) => {
                    const statusConfig = getStatusConfig(contract.status, t);
                    const StatusIcon = statusConfig.icon;
                    const isCurrentContract = contract.id === selectedContract.id;
                    const isFirst = index === 0;
                    const isLast = index === array.length - 1;
                    
                    return (
                      <div key={contract.id} className="relative pl-10">
                        {/* Timeline dot */}
                        <div className={`absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isCurrentContract 
                            ? 'bg-primary border-primary text-primary-foreground' 
                            : contract.status === 'active'
                              ? 'bg-green-100 border-green-500 dark:bg-green-900'
                              : contract.status === 'expired'
                                ? 'bg-red-100 border-red-500 dark:bg-red-900'
                                : 'bg-background border-muted-foreground'
                        }`}>
                          {isFirst && !contract.renewed_from_id && (
                            <FileSignature className="w-3 h-3" />
                          )}
                          {!isFirst && (
                            <RefreshCcw className="w-3 h-3" />
                          )}
                        </div>
                        
                        {/* Contract card */}
                        <Card className={`${isCurrentContract ? 'ring-2 ring-primary' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold">{contract.contract_code}</span>
                                  <Badge className={statusConfig.color}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusConfig.label}
                                  </Badge>
                                  {isFirst && !contract.renewed_from_id && (
                                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                                      Hợp đồng gốc
                                    </Badge>
                                  )}
                                  {isCurrentContract && (
                                    <Badge variant="outline" className="text-primary border-primary">
                                      Đang xem
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Loại:</span>
                                    <p className="font-medium">{contract.contract_type}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Hiệu lực:</span>
                                    <p className="font-medium">{formatDate(contract.effective_date)}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Hết hạn:</span>
                                    <p className="font-medium">{formatDate(contract.expiry_date)}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Lương:</span>
                                    <p className="font-medium">{formatCurrency(contract.salary)}</p>
                                  </div>
                                </div>
                                
                                {contract.notes && contract.notes.includes('Gia hạn từ') && (
                                  <p className="text-xs text-muted-foreground italic">
                                    {contract.notes}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setIsHistoryOpen(false);
                                    handleViewContract(contract);
                                  }}
                                  title="Xem chi tiết"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Arrow indicator */}
                        {!isLast && (
                          <div className="absolute left-2 -bottom-2 w-5 flex justify-center">
                            <div className="text-muted-foreground text-xs">↓</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setIsHistoryOpen(false)}>
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
