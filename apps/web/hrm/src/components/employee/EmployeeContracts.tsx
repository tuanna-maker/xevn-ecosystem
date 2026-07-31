/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → tab Hợp đồng (HĐ / Đãi ngộ / Lịch sử)
 * UC:         UC-HRM-CI-01..11 · UC-HRM-25 · AC-CD-F5-01..04
 * BR:         BR-CD-F5-01..05
 * SRS:        docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §5
 *             docs/hrm/SRS.md §13 UC-HRM-25
 * TechSpec:   docs/api/openapi/hrm-api.yaml contracts + compensation-*
 * Purpose:    Labor contract term CRUD + compensation package tabs. Salary is
 *             NOT required on HĐ form — lives on tab Đãi ngộ (versioned packages).
 * WorkItem:   CD-FB-08-CONTRACT
 * Coded:      2026-07-19
 * change_mode: UPGRADE
 *
 * Callers:
 *   - pages/EmployeeProfile.tsx → activeTab === 'contract'
 *
 * Callees:
 *   - useEmployeeContracts → Nest contracts API
 *   - EmployeeCompensationPanel / HistoryPanel → compensation APIs
 *
 * FE-Actions:
 *   | User action           | Handler              | API / module                     |
 *   |-----------------------|----------------------|----------------------------------|
 *   | Tab HĐ → Lưu          | handleSubmit         | create/updateEmployeeContract    |
 *   | Tab Đãi ngộ → Lưu     | EmployeeCompensation | POST compensation-packages       |
 *   | Tab Lịch sử           | HistoryPanel         | GET compensation-history         |
 *
 * Impact:     Inventing salary on contract body breaks F5 AC; U65 needs F5 persist
 * must_keep:  Existing renew/history-renewal dialogs; list→detail J-HRM-01/03
 * SOLID:      Term UI in this file; compensation SRP in panel components
 * LastVerified: compensationLines.test.ts · useEmployeeContracts.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19
 * WorkItem: CD-FB-08-CONTRACT
 * What: Tabs HĐ + Đãi ngộ + Lịch sử; remove salary required/display on HĐ body
 * Why: Customer demo F5 / AC-CD-F5-01..04
 * SRS/BR: CUSTOMER_DEMO_HRM_DELTA §5 · BR-CD-F5-01
 *
 * @CODE-MEMORY-CHANGE 2026-07-22
 * WorkItem: FE-HRM-G-CI-01
 * What: Open-ended types may omit expiry_date before POST; fixed-term still required
 * Why: QA residual — toast blocked indefinite create; align BE G-CI-01 / FR-HRM-CI-01
 * SRS/BR: FR-HRM-CI-01 · TechSpec G-CI-01 · docs/qa/evidence/qa-hrm-g-ci-01-20260722.md
 * must_keep: Fixed-term toast «ngày hiệu lực và ngày hết hạn»; F5 salary off body
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-U72-LABEL-FE-01
 * change_mode: FIX
 * What: View/history contract_type + status via labelMaps (no raw enum / no || raw)
 * Why: BA F-04/F-05 U72 display-label
 * SRS/BR: SRS_FIELD_DISPLAY.md AC-FD-04/05 · FR-HRM-U72-LABEL-01 · BR-CO-LABEL-01
 * must_keep: renew/history dialogs; F5 salary off body
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-FE-ERP-E1A-PICKER-01
 * change_mode: ADD
 * What: position/dept/signer_position CatalogSearchPicker; Network position_key (+dept/signer keys)
 * Why: AC-E1A-CI-POS-01 · FR-HRM-MD-BIND-E1A-01 · U72
 * must_keep: F5 salary off body; open-ended expiry; CONTRACT_TYPES fallback when catalog empty; defer A9
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-FE-ERP-E1A-CREATE-GAPS-01
 * change_mode: FIX
 * What: Create auto mã HĐ + default ngày hiệu lực/ký ISO; bỏ HTML required; data-testid ViDateField
 * Why: DEF-E1A-CI-DATE-01 — HTML required mã trống + dates gate chặn submit → không Network
 * must_keep: F5 salary off body; open-ended expiry policy; position_key picker; A8 type residual E2
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-FE-ERP-E2-01
 * change_mode: ADD
 * What: Loại HĐ = CatalogSearchPicker contract_types (persist code); đóng R-E1A-A8-CTYPE
 * Why: FR-HRM-CI-TYPE-E2-01 · AC-E2-CI-TYPE-01 — cấm HARDCODE khi items>0
 * must_keep: position_key E1-A; F5 salary off body; open-ended expiry policy
 */
import { useMemo, useState, useRef } from 'react';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import {
  buildDepartmentKeyFields,
  buildPositionKeyFields,
  contractTypeOptionsFromCatalog,
  departmentOptionsFromCatalog,
  jobTitleOptionsFromCatalog,
  resolveContractTypeCatalogLabel,
} from '@/lib/catalogSearchPicker';

import { useTranslation } from 'react-i18next';
import { useEmployeeContracts } from '@/hooks/useEmployeeContracts';
import { EmployeeCompensationPanel } from '@/components/employee/EmployeeCompensationPanel';
import { EmployeeCompensationHistoryPanel } from '@/components/employee/EmployeeCompensationHistoryPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { hrmStorageUploadStub } from '@/lib/hrmStorageUploadStub';
import {
  EM_DASH,
  resolveContractStatusDisplay,
  resolveContractTypeDisplayLabel,
} from '@/lib/labelMaps';
import {
  isOpenEndedContractType,
  validateContractDatesForSubmit,
} from '@/lib/contractEndDatePolicy';
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
  Wallet,
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
import { ViDateField } from '@/components/ui/ViDateField';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  /** @deprecated F5 — do not invent; compensation tab owns pay */
  salary: number | null;
  compensation_package_id?: string | null;
  position: string | null;
  position_key?: string | null;
  department: string | null;
  department_key?: string | null;
  work_location: string | null;
  probation_period: number | null;
  probation_end_date: string | null;
  signing_date: string | null;
  signer_name: string | null;
  signer_position: string | null;
  signer_position_key?: string | null;
  status: string;
  file_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  renewed_from_id: string | null;
}

/** F-05 / AC-FD-05 — badge VI từ labelMaps (cùng dictionary list); unknown → «—». */
const getStatusConfig = (status: string, _t?: unknown) => {
  const label = resolveContractStatusDisplay(status);
  switch ((status ?? '').trim().toLowerCase()) {
    case 'active':
      return { label, color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: CheckCircle };
    case 'pending':
      return { label, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', icon: Clock };
    case 'expired':
      return { label, color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: XCircle };
    case 'terminated':
      return { label, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: AlertCircle };
    default:
      // U72 fail-closed: never render raw status slug
      return { label: EM_DASH, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: FileText };
  }
};

interface FormData {
  contract_code: string;
  contract_type: string;
  effective_date: string;
  expiry_date: string;
  position_key: string;
  department_key: string;
  work_location: string;
  probation_period: string;
  probation_end_date: string;
  signing_date: string;
  signer_name: string;
  signer_position_key: string;
  status: string;
  notes: string;
}

const initialFormData: FormData = {
  contract_code: '',
  contract_type: '',
  effective_date: '',
  expiry_date: '',
  position_key: '',
  department_key: '',
  work_location: '',
  probation_period: '',
  probation_end_date: '',
  signing_date: '',
  signer_name: '',
  signer_position_key: '',
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
  const { currentCompanyId } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    catalogs,
    isLoading: catalogsLoading,
    isError: catalogsError,
  } = useSettingsCatalogsOverview();
  const positionOptions = useMemo(
    () => jobTitleOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );
  const departmentOptions = useMemo(
    () => departmentOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );
  const contractTypeOptions = useMemo(
    () => contractTypeOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );
  const displayContractType = (code: string | null | undefined) => {
    const fromCatalog = resolveContractTypeCatalogLabel(contractTypeOptions, code);
    if (fromCatalog !== '—') return fromCatalog;
    return resolveContractTypeDisplayLabel(code);
  };
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<EmployeeContract | null>(null);
  const [renewingFromContract, setRenewingFromContract] = useState<EmployeeContract | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Auto-update expired contracts and fetch
  const { contracts, isLoading, refetch, createContract, updateContract, deleteContract } =
    useEmployeeContracts(employeeId);

  const uploadFile = async (file: File): Promise<string | null> => {
    return hrmStorageUploadStub(file, 'employee-contracts-file');
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

  const buildCreateContractCode = () => {
    const stamp = format(new Date(), 'yyyyMMdd');
    const suffix = Date.now().toString().slice(-4);
    return `HD-${stamp}-${suffix}`;
  };

  const handleOpenDialog = (contract?: EmployeeContract) => {
    if (contract) {
      setSelectedContract(contract);
      setFormData({
        contract_code: contract.contract_code,
        contract_type: contract.contract_type,
        effective_date: contract.effective_date || '',
        expiry_date: contract.expiry_date || '',
        position_key: (contract as EmployeeContract & { position_key?: string }).position_key?.trim() || '',
        department_key: (contract as EmployeeContract & { department_key?: string }).department_key?.trim() || '',
        work_location: contract.work_location || '',
        probation_period: contract.probation_period?.toString() || '',
        probation_end_date: contract.probation_end_date || '',
        signing_date: contract.signing_date || '',
        signer_name: contract.signer_name || '',
        signer_position_key:
          (contract as EmployeeContract & { signer_position_key?: string }).signer_position_key?.trim() || '',
        status: contract.status,
        notes: contract.notes || '',
      });
    } else {
      // Create: prefill code + ISO dates so ViDateField shows dd/MM/yyyy and HTML5/dates gate không chặn trống
      const todayIso = format(new Date(), 'yyyy-MM-dd');
      const preferredType =
        contractTypeOptions.find((o) => isOpenEndedContractType(o.value))?.value ??
        contractTypeOptions[0]?.value ??
        '';
      setSelectedContract(null);
      setFormData({
        ...initialFormData,
        contract_code: buildCreateContractCode(),
        contract_type: preferredType,
        effective_date: todayIso,
        signing_date: todayIso,
        expiry_date: '',
      });
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
      toast.error(`${t('ec.contractCode')} bắt buộc`);
      return;
    }
    if (!formData.contract_type.trim()) {
      toast.error(`${t('ec.contractType')} bắt buộc`);
      return;
    }
    if (
      contractTypeOptions.length > 0 &&
      !contractTypeOptions.some((o) => o.value === formData.contract_type)
    ) {
      toast.error('Chọn loại hợp đồng từ danh mục (Cài đặt → Loại HĐ).');
      return;
    }
    if (contractTypeOptions.length === 0) {
      toast.error('Danh mục loại hợp đồng trống — mở Cài đặt → Danh mục nghiệp vụ.');
      return;
    }
    // G-CI-01 / FE-HRM-G-CI-01 — open-ended may omit expiry; fixed-term still required
    const datesGate = validateContractDatesForSubmit({
      contractType: formData.contract_type,
      effectiveDate: formData.effective_date,
      expiryDate: formData.expiry_date,
    });
    if (!datesGate.ok) {
      toast.error(datesGate.message);
      return;
    }

    const pos = formData.position_key.trim()
      ? buildPositionKeyFields(formData.position_key, positionOptions)
      : null;
    if (formData.position_key.trim() && !pos) {
      toast.error('Chọn vị trí từ danh mục (không nhập tự do).');
      return;
    }
    const dept = formData.department_key.trim()
      ? buildDepartmentKeyFields(formData.department_key, departmentOptions)
      : null;
    if (formData.department_key.trim() && !dept) {
      toast.error('Chọn phòng ban từ danh mục.');
      return;
    }
    const signerPos = formData.signer_position_key.trim()
      ? buildPositionKeyFields(formData.signer_position_key, positionOptions)
      : null;
    if (formData.signer_position_key.trim() && !signerPos) {
      toast.error('Chọn chức danh người ký từ danh mục.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (selectedFile) {
        await uploadFile(selectedFile);
      }

      const expiryForApi = formData.expiry_date.trim() || undefined;
      const catalogPayload = {
        ...(pos
          ? { position_key: pos.position_key, position: pos.position }
          : {}),
        ...(dept
          ? { department_key: dept.department_key, department: dept.department }
          : {}),
        ...(signerPos
          ? {
              signer_position_key: signerPos.position_key,
              signer_position: signerPos.position,
            }
          : {}),
        ...(formData.signer_name.trim()
          ? { signer_name: formData.signer_name.trim() }
          : {}),
      };

      // F5: contract body = term only — do NOT send salary (AC-CD-F5-01)
      if (selectedContract) {
        const ok = await updateContract(selectedContract.id, {
          contract_type: formData.contract_type,
          effective_date: formData.effective_date,
          expiry_date: expiryForApi,
          status: formData.status,
          ...catalogPayload,
        });
        if (ok) handleCloseDialog();
      } else {
        const ok = await createContract({
          contract_type: formData.contract_type,
          effective_date: formData.effective_date,
          expiry_date: expiryForApi,
          status: formData.status,
          ...catalogPayload,
        });
        if (ok) handleCloseDialog();
      }
    } catch (error: unknown) {
      console.error('Error saving contract:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (contract: EmployeeContract) => {
    if (!confirm(t('ec.confirmDelete'))) return;

    try {
      const ok = await deleteContract(contract.id);
      if (!ok) return;
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    }
  };

  const handleViewContract = (contract: EmployeeContract) => {
    setSelectedContract(contract);
    setIsViewOpen(true);
  };

  // Function to calculate new expiry date based on contract type (code or legacy label)
  const calculateNewExpiryDate = (effectiveDate: Date, contractType: string): Date => {
    if (isOpenEndedContractType(contractType)) {
      return addYears(effectiveDate, 100);
    }
    const key = contractType.trim().toLowerCase();
    if (key.includes('thử việc') || key.includes('probation') || key === 'probation') {
      return addMonths(effectiveDate, 2);
    }
    if (key.includes('3 năm') || key.includes('3y') || key.includes('3_year')) {
      return addYears(effectiveDate, 3);
    }
    if (key.includes('2 năm') || key.includes('2y') || key.includes('2_year')) {
      return addYears(effectiveDate, 2);
    }
    return addYears(effectiveDate, 1);
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
      position_key: (contract as EmployeeContract & { position_key?: string }).position_key?.trim() || '',
      department_key: (contract as EmployeeContract & { department_key?: string }).department_key?.trim() || '',
      work_location: contract.work_location || '',
      probation_period: '',
      probation_end_date: '',
      signing_date: format(today, 'yyyy-MM-dd'),
      signer_name: contract.signer_name || '',
      signer_position_key:
        (contract as EmployeeContract & { signer_position_key?: string }).signer_position_key?.trim() || '',
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
      <Tabs defaultValue="hop-dong" className="space-y-4">
        <TabsList className="grid w-full max-w-xl grid-cols-3">
          <TabsTrigger value="hop-dong" className="gap-1.5">
            <FileSignature className="h-4 w-4" />
            Hợp đồng
          </TabsTrigger>
          <TabsTrigger value="dai-ngo" className="gap-1.5">
            <Wallet className="h-4 w-4" />
            Đãi ngộ
          </TabsTrigger>
          <TabsTrigger value="lich-su" className="gap-1.5">
            <History className="h-4 w-4" />
            Lịch sử
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hop-dong" className="space-y-6">
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
                      {contract.contract_code} - {displayContractType(contract.contract_type)}
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
                      <TableCell>{displayContractType(contract.contract_type)}</TableCell>
                      <TableCell>{formatDate(contract.effective_date)}</TableCell>
                      <TableCell>{formatDate(contract.expiry_date)}</TableCell>
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
                  data-testid="contract-code"
                  value={formData.contract_code}
                  onChange={(e) => setFormData({ ...formData, contract_code: e.target.value })}
                  placeholder="HD-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('ec.contractType')} *</Label>
                <CatalogSearchPicker
                  options={contractTypeOptions}
                  value={formData.contract_type}
                  onValueChange={(value) => setFormData({ ...formData, contract_type: value })}
                  placeholder={t('ec.contractType')}
                  loading={catalogsLoading}
                  errorText={catalogsError ? t('settings.catalogs.loadError') : undefined}
                  emptyHint={
                    <a href="/settings" className="text-primary underline text-xs font-medium">
                      Mở Cài đặt → Danh mục nghiệp vụ (contract_types)
                    </a>
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('ec.signingDate')}</Label>
                <ViDateField
                  data-testid="contract-signing-date"
                  value={formData.signing_date}
                  onValueChange={(v) => setFormData({ ...formData, signing_date: v })}
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
                <ViDateField
                  data-testid="contract-effective-date"
                  value={formData.effective_date}
                  onValueChange={(v) => setFormData({ ...formData, effective_date: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {t('ec.expiryDate')}
                  {isOpenEndedContractType(formData.contract_type)
                    ? ' (không bắt buộc)'
                    : ''}
                </Label>
                <ViDateField
                  data-testid="contract-expiry-date"
                  value={formData.expiry_date}
                  onValueChange={(v) => setFormData({ ...formData, expiry_date: v })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('ec.position')}</Label>
                <CatalogSearchPicker
                  options={positionOptions}
                  value={formData.position_key}
                  onValueChange={(value) => setFormData({ ...formData, position_key: value })}
                  placeholder={t('ec.position')}
                  loading={catalogsLoading}
                  errorText={catalogsError ? t('settings.catalogs.loadError') : undefined}
                  emptyHint={
                    <a href="/settings" className="text-primary underline text-xs font-medium">
                      Mở Cài đặt → Danh mục nghiệp vụ
                    </a>
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('ec.department')}</Label>
                <CatalogSearchPicker
                  options={departmentOptions}
                  value={formData.department_key}
                  onValueChange={(value) => setFormData({ ...formData, department_key: value })}
                  placeholder={t('ec.department')}
                  loading={catalogsLoading}
                  errorText={catalogsError ? t('settings.catalogs.loadError') : undefined}
                  emptyHint={
                    <a href="/settings" className="text-primary underline text-xs font-medium">
                      Mở Cài đặt → Danh mục nghiệp vụ
                    </a>
                  }
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground rounded-input border bg-muted/40 px-3 py-2">
              Lương / phụ cấp không nhập trên form HĐ — dùng tab «Đãi ngộ».
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('ec.workLocation')}</Label>
                <Input
                  value={formData.work_location}
                  onChange={(e) => setFormData({ ...formData, work_location: e.target.value })}
                  placeholder="Hà Nội"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('ec.probationPeriod')}</Label>
                <Input
                  type="number"
                  value={formData.probation_period}
                  onChange={(e) => setFormData({ ...formData, probation_period: e.target.value })}
                  placeholder="60"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('ec.probationEndDate')}</Label>
                <ViDateField
                  value={formData.probation_end_date}
                  onValueChange={(v) => setFormData({ ...formData, probation_end_date: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('ec.signerName')}</Label>
                <Input
                  value={formData.signer_name}
                  onChange={(e) => setFormData({ ...formData, signer_name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('ec.signerPosition')}</Label>
                <CatalogSearchPicker
                  options={positionOptions}
                  value={formData.signer_position_key}
                  onValueChange={(value) =>
                    setFormData({ ...formData, signer_position_key: value })
                  }
                  placeholder={t('ec.signerPosition')}
                  loading={catalogsLoading}
                  errorText={catalogsError ? t('settings.catalogs.loadError') : undefined}
                  emptyHint={
                    <a href="/settings" className="text-primary underline text-xs font-medium">
                      Mở Cài đặt → Danh mục nghiệp vụ
                    </a>
                  }
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
                  <p className="font-medium">{displayContractType(selectedContract.contract_type)}</p>
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
                                    <p className="font-medium">
                                      {displayContractType(contract.contract_type)}
                                    </p>
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
                                    <span className="text-muted-foreground">Trạng thái:</span>
                                    <Badge className={statusConfig.color}>
                                      <StatusIcon className="w-3 h-3 mr-1" />
                                      {statusConfig.label}
                                    </Badge>
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
        </TabsContent>

        <TabsContent value="dai-ngo">
          <EmployeeCompensationPanel employeeId={employeeId} contracts={contracts ?? []} />
        </TabsContent>

        <TabsContent value="lich-su">
          <EmployeeCompensationHistoryPanel employeeId={employeeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
