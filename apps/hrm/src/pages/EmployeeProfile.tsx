import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Camera,
  Edit,
  MoreHorizontal,
  User,
  Phone as PhoneIcon,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Building2,
  ChevronDown,
  Briefcase,
  GraduationCap,
  FileCheck,
  Zap,
  Users,
  FileText,
  DollarSign,
  Shield,
  Pin,
  X,
  GripVertical,
  FileSignature,
  Target,
  BookOpen,
  Package,
  Award,
  CreditCard,
  Home,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useEmployee } from '@/hooks/useEmployee';
import { useEmployees, EmployeeFormData } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';
import { EmployeeFormDialog } from '@/components/employee/EmployeeFormDialog';
import { EmployeeSkillsRadarChart } from '@/components/employee/EmployeeSkillsRadarChart';
import { EmployeeWorkTimeline } from '@/components/employee/EmployeeWorkTimeline';
import { EmployeeStatsCards } from '@/components/employee/EmployeeStatsCards';
import { EmployeeWorkHistory } from '@/components/employee/EmployeeWorkHistory';
import { EmployeeDegrees } from '@/components/employee/EmployeeDegrees';
import { EmployeeCertificates } from '@/components/employee/EmployeeCertificates';
import { EmployeeSkills } from '@/components/employee/EmployeeSkills';
import { EmployeeFamilyInfo } from '@/components/employee/EmployeeFamilyInfo';
import { EmployeeContracts } from '@/components/employee/EmployeeContracts';
import { EmployeeSalary } from '@/components/employee/EmployeeSalary';
import { EmployeeResume } from '@/components/employee/EmployeeResume';
import { EmployeeKPI } from '@/components/employee/EmployeeKPI';
import { EmployeeInsurance } from '@/components/employee/EmployeeInsurance';
import { EmployeeTraining } from '@/components/employee/EmployeeTraining';
import { EmployeeAssets } from '@/components/employee/EmployeeAssets';
import { EmployeeRewardsDiscipline } from '@/components/employee/EmployeeRewardsDiscipline';
import { EmployeeJobList } from '@/components/employee/EmployeeJobList';
import { PermissionGate } from '@/components/auth/PermissionGate';
import {
  fetchEmployeeMetadataForm,
  saveEmployeeMetadataValues,
  type EmployeeMetadataForm,
  type FieldValidationError,
} from '@/services/xevnApiClient';

// Helper function to format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return '--';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy');
  } catch {
    return '--';
  }
};

// Status badge mapping - will be localized via t()
const getStatusInfo = (status: string, t: (key: string) => string) => {
  const statusConfig: Record<string, { className: string }> = {
    active: { className: 'bg-green-100 text-green-700 hover:bg-green-100' },
    inactive: { className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' },
    probation: { className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
    suspended: { className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  };
  return {
    label: t(`employeeProfile.status.${status}`) || t('employeeProfile.status.active'),
    className: statusConfig[status]?.className || statusConfig.active.className,
  };
};

// Main visible tabs with colors - labels from translation
const getMainTabs = (t: (key: string) => string) => [
  { id: 'general', label: t('employeeProfile.tabs.general'), icon: User, color: 'bg-indigo-500' },
  { id: 'work', label: t('employeeProfile.tabs.work'), icon: Briefcase, color: 'bg-amber-500' },
  { id: 'contract', label: t('employeeProfile.tabs.contract'), icon: FileSignature, color: 'bg-emerald-500' },
  { id: 'salary', label: t('employeeProfile.tabs.salary'), icon: DollarSign, color: 'bg-rose-500' },
];

// More tabs in dropdown with colors like ClickUp
const getMoreTabs = (t: (key: string) => string) => [
  { id: 'cv', label: t('employeeProfile.tabs.cv'), icon: FileText, description: t('employeeProfile.tabDescriptions.cv'), color: 'bg-purple-500' },
  { id: 'kpi', label: t('employeeProfile.tabs.kpi'), icon: Target, description: t('employeeProfile.tabDescriptions.kpi'), color: 'bg-amber-500' },
  { id: 'insurance', label: t('employeeProfile.tabs.insurance'), icon: Shield, description: t('employeeProfile.tabDescriptions.insurance'), color: 'bg-green-500' },
  { id: 'training', label: t('employeeProfile.tabs.training'), icon: BookOpen, description: t('employeeProfile.tabDescriptions.training'), color: 'bg-cyan-500' },
  { id: 'assets', label: t('employeeProfile.tabs.assets'), icon: Package, description: t('employeeProfile.tabDescriptions.assets'), color: 'bg-indigo-500' },
  { id: 'rewards', label: t('employeeProfile.tabs.rewards'), icon: Award, description: t('employeeProfile.tabDescriptions.rewards'), color: 'bg-rose-500' },
  { id: 'workHistory', label: t('employeeProfile.tabs.workHistory'), icon: Briefcase, description: t('employeeProfile.tabDescriptions.workHistory'), color: 'bg-orange-500' },
  { id: 'degrees', label: t('employeeProfile.tabs.degrees'), icon: GraduationCap, description: t('employeeProfile.tabDescriptions.degrees'), color: 'bg-blue-500' },
  { id: 'certificates', label: t('employeeProfile.tabs.certificates'), icon: FileCheck, description: t('employeeProfile.tabDescriptions.certificates'), color: 'bg-teal-500' },
  { id: 'skills', label: t('employeeProfile.tabs.skills'), icon: Zap, description: t('employeeProfile.tabDescriptions.skills'), color: 'bg-yellow-500' },
  { id: 'family', label: t('employeeProfile.tabs.family'), icon: Users, description: t('employeeProfile.tabDescriptions.family'), color: 'bg-pink-500' },
];

const getAllTabs = (t: (key: string) => string) => [...getMainTabs(t), ...getMoreTabs(t)];

// Load pinned tabs from localStorage
const getInitialPinnedTabs = (): string[] => {
  try {
    const saved = localStorage.getItem('employee-pinned-tabs');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export default function EmployeeProfile() {
  const [moreOpen, setMoreOpen] = useState(false);
  const [pinnedTabs, setPinnedTabs] = useState<string[]>(getInitialPinnedTabs);
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [metadataForm, setMetadataForm] = useState<EmployeeMetadataForm | null>(null);
  const [metadataValues, setMetadataValues] = useState<Record<string, string>>({});
  const [metadataErrors, setMetadataErrors] = useState<Record<string, FieldValidationError>>({});
  const [metadataMessage, setMetadataMessage] = useState('');
  
  // Fetch employee from database
  const { employee, isLoading, error, refetch } = useEmployee(id);
  const { updateEmployee } = useEmployees();
  const { departments } = useDepartments();

  useEffect(() => {
    if (!id || !employee) return;
    const legalEntityId = employee.company_id ?? 'comp-001';
    void fetchEmployeeMetadataForm({
      tenantId: 'tenant-xevn-holding',
      legalEntityId,
      employeeId: id,
    }).then((form) => {
      setMetadataForm(form);
      setMetadataValues(
        Object.fromEntries(
          Object.entries(form.values ?? {}).map(([key, value]) => [key, value == null ? '' : String(value)]),
        ),
      );
    });
  }, [employee, id]);

  const handleEditSubmit = useCallback(async (data: EmployeeFormData & { company_id?: string }) => {
    if (!employee) return false;
    setIsEditLoading(true);
    try {
      const success = await updateEmployee(employee.id, data);
      if (success) {
        await refetch();
        setIsEditDialogOpen(false);
      }
      return success;
    } finally {
      setIsEditLoading(false);
    }
  }, [employee, updateEmployee, refetch]);

  const handleSaveDynamicMetadata = useCallback(async () => {
    if (!employee) return;
    setMetadataMessage('');
    setMetadataErrors({});
    const result = await saveEmployeeMetadataValues({
      tenantId: 'tenant-xevn-holding',
      legalEntityId: employee.company_id ?? 'comp-001',
      employeeId: employee.id,
      values: metadataValues,
      reason: 'HR cập nhật hồ sơ nhân sự theo cấu hình X-BOS',
      requestedBy: 'hr-portal-user',
      autoApprove: false,
    });
    if (result.errors.length > 0) {
      setMetadataErrors(Object.fromEntries(result.errors.map((item) => [item.fieldCode, item])));
      setMetadataMessage('Chưa thể lưu. Vui lòng kiểm tra các trường cấu hình động.');
      return;
    }
    setMetadataMessage(
      result.approved
        ? 'Đã lưu thông tin động theo cấu hình X-BOS.'
        : `Đã tạo yêu cầu duyệt ${result.request?.id ?? ''}. Dữ liệu sẽ có hiệu lực sau khi phê duyệt.`,
    );
  }, [employee, metadataValues]);

  // Save pinned tabs to localStorage
  const updatePinnedTabs = (newPinned: string[]) => {
    setPinnedTabs(newPinned);
    localStorage.setItem('employee-pinned-tabs', JSON.stringify(newPinned));
  };

  const togglePin = (tabId: string) => {
    if (pinnedTabs.includes(tabId)) {
      updatePinnedTabs(pinnedTabs.filter(id => id !== tabId));
    } else {
      updatePinnedTabs([...pinnedTabs, tabId]);
    }
  };

  // Get localized tabs
  const mainTabs = getMainTabs(t);
  const moreTabs = getMoreTabs(t);
  const allTabs = getAllTabs(t);

  // Get pinned tab objects in the correct order
  const pinnedTabObjects = pinnedTabs
    .map(tabId => moreTabs.find(tab => tab.id === tabId))
    .filter(Boolean) as typeof moreTabs;
  
  // Get unpinned tabs for dropdown
  const unpinnedTabs = moreTabs.filter(tab => !pinnedTabs.includes(tab.id));

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(pinnedTabs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    updatePinnedTabs(items);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/employees')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-28 h-28 rounded-full" />
                  <Skeleton className="h-5 w-32 mt-4" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-9">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !employee) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">{error || t('employeeProfile.notFound')}</p>
        <Button onClick={() => navigate('/employees')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('employeeProfile.backToList')}
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(employee.status, t);

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate('/employees')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-base sm:text-xl font-bold truncate">{employee.full_name}</h1>
        <Badge variant="outline" className="shrink-0">
          {employee.employee_code}
        </Badge>
        <div className="ml-auto shrink-0">
          <PermissionGate module="employees" action="edit">
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('common.edit')}</span>
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b overflow-hidden">
        <div className="flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
          {/* Main visible tabs */}
          {mainTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'shrink-0 gap-2',
                activeTab === tab.id && 'bg-primary text-primary-foreground'
              )}
            >
              <div className={cn('w-5 h-5 rounded flex items-center justify-center text-white shrink-0', tab.color)}>
                <tab.icon className="w-3 h-3" />
              </div>
              <span className="hidden sm:inline">{tab.label}</span>
            </Button>
          ))}

          {/* Pinned tabs with drag and drop */}
          {pinnedTabObjects.length > 0 && (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="pinned-tabs" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex items-center gap-1"
                  >
                    {pinnedTabObjects.map((tab, index) => (
                      <Draggable key={tab.id} draggableId={tab.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              'flex items-center',
                              snapshot.isDragging && 'opacity-80'
                            )}
                          >
                            <Button
                              variant={activeTab === tab.id ? 'default' : 'ghost'}
                              size="sm"
                              onClick={() => setActiveTab(tab.id)}
                              className={cn(
                                'shrink-0 gap-1 pr-1',
                                activeTab === tab.id && 'bg-primary text-primary-foreground'
                              )}
                            >
                              <span
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 hover:bg-muted-foreground/20 rounded"
                              >
                                <GripVertical className="w-3 h-3" />
                              </span>
                              <div className={cn('w-4 h-4 rounded flex items-center justify-center text-white', tab.color)}>
                                <tab.icon className="w-3 h-3" />
                              </div>
                              <span className="hidden sm:inline">{tab.label}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePin(tab.id);
                                }}
                                className="ml-1 p-0.5 rounded hover:bg-muted-foreground/20"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* More tabs dropdown */}
          {unpinnedTabs.length > 0 && (
            <Popover open={moreOpen} onOpenChange={setMoreOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={unpinnedTabs.some(t => t.id === activeTab) ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'shrink-0 gap-1',
                    unpinnedTabs.some(t => t.id === activeTab) && 'bg-primary text-primary-foreground'
                  )}
                >
                  {unpinnedTabs.find(tab => tab.id === activeTab)?.label || t('employeeProfile.more')}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[480px] p-3 bg-background border shadow-lg z-50" align="start">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
                  {unpinnedTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        // Pin tab and navigate to it
                        if (!pinnedTabs.includes(tab.id)) {
                          updatePinnedTabs([...pinnedTabs, tab.id]);
                        }
                        setActiveTab(tab.id);
                        setMoreOpen(false);
                      }}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg text-left hover:bg-muted transition-colors cursor-pointer',
                        activeTab === tab.id && 'bg-primary/10 border border-primary/20'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white',
                        tab.color
                      )}>
                        <tab.icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">{tab.label}</p>
                        <p className="text-xs text-muted-foreground">{tab.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Profile & Personal Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Avatar className="w-28 h-28 border-4 border-background shadow-lg">
                      <AvatarImage src={employee.avatar_url || ''} />
                      <AvatarFallback className="text-3xl bg-primary/10 text-primary font-semibold">
                        {employee.full_name.split(' ').pop()?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <h3 className="text-lg font-bold">{employee.full_name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {employee.position || t('employeeProfile.noPosition')}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {employee.department || t('employeeProfile.noDepartment')}
                  </p>
                  <Badge className={statusInfo.className}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Personal Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t('employeeProfile.sections.personalInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoItem icon={Mail} label={t('employeeProfile.fields.email')} value={employee.email || '--'} />
                <InfoItem icon={PhoneIcon} label={t('employeeProfile.fields.phone')} value={employee.phone || '--'} />
                <InfoItem icon={Calendar} label={t('employeeProfile.fields.birthDate')} value={formatDate(employee.birth_date)} />
                <InfoItem icon={User} label={t('employeeProfile.fields.gender')} value={employee.gender || '--'} />
                <PermissionGate module="employees" action="view_salary" fallback={null}>
                  <InfoItem icon={CreditCard} label={t('employeeProfile.fields.idNumber')} value={employee.id_number || '--'} />
                  <InfoItem icon={Calendar} label={t('employeeProfile.fields.idIssueDate')} value={formatDate(employee.id_issue_date)} />
                  <InfoItem icon={MapPin} label={t('employeeProfile.fields.idIssuePlace')} value={employee.id_issue_place || '--'} />
                </PermissionGate>
              </CardContent>
            </Card>

            {/* Address Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  {t('employeeProfile.sections.address')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoItem icon={MapPin} label={t('employeeProfile.fields.permanentAddress')} value={employee.permanent_address || '--'} />
                <InfoItem icon={MapPin} label={t('employeeProfile.fields.temporaryAddress')} value={employee.temporary_address || '--'} />
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {t('employeeProfile.sections.emergencyContact')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoItem icon={User} label={t('employeeProfile.fields.contactPerson')} value={employee.emergency_contact || '--'} />
                <InfoItem icon={PhoneIcon} label={t('employeeProfile.fields.contactPhone')} value={employee.emergency_phone || '--'} />
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Work Info & Skills */}
          <div className="lg:col-span-5 space-y-6">
            {/* Work Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {t('employeeProfile.sections.workInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoItem icon={Building2} label={t('employeeProfile.fields.department')} value={employee.department || '--'} />
                <InfoItem icon={Briefcase} label={t('employeeProfile.fields.position')} value={employee.position || '--'} />
                <InfoItem icon={MapPin} label={t('employeeProfile.fields.workLocation')} value={employee.work_location || '--'} />
                <InfoItem icon={Calendar} label={t('employeeProfile.fields.startDate')} value={formatDate(employee.start_date)} />
                <InfoItem icon={Calendar} label={t('employeeProfile.fields.endDate')} value={formatDate(employee.end_date)} />
                <InfoItem 
                  icon={Briefcase} 
                  label={t('employeeProfile.fields.contractType')} 
                  value={employee.employment_type === 'full-time' ? t('employeeProfile.contractTypes.fullTime') : 
                         employee.employment_type === 'part-time' ? t('employeeProfile.contractTypes.partTime') :
                         employee.employment_type === 'contract' ? t('employeeProfile.contractTypes.contract') :
                         employee.employment_type || '--'} 
                />
              </CardContent>
            </Card>

            {/* Financial Info - Only visible to users with view_salary permission */}
            <PermissionGate module="employees" action="view_salary">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {t('employeeProfile.sections.financialInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoItem 
                    icon={DollarSign} 
                    label={t('employeeProfile.fields.baseSalary')} 
                    value={employee.salary ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(employee.salary) : '--'} 
                  />
                  <InfoItem icon={CreditCard} label={t('employeeProfile.fields.bank')} value={employee.bank_name || '--'} />
                  <InfoItem icon={CreditCard} label={t('employeeProfile.fields.bankAccount')} value={employee.bank_account || '--'} />
                  <InfoItem icon={FileText} label={t('employeeProfile.fields.taxCode')} value={employee.tax_code || '--'} />
                </CardContent>
              </Card>
            </PermissionGate>

            {/* Insurance Info - Only visible to users with view_salary permission */}
            <PermissionGate module="employees" action="view_salary">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {t('employeeProfile.sections.insuranceInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoItem icon={Shield} label={t('employeeProfile.fields.socialInsurance')} value={employee.social_insurance_number || '--'} />
                  <InfoItem icon={Heart} label={t('employeeProfile.fields.healthInsurance')} value={employee.health_insurance_number || '--'} />
                </CardContent>
              </Card>
            </PermissionGate>
          </div>

          {/* Right Column - Stats */}
          <div className="lg:col-span-4 space-y-6">
            {/* Skills Radar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{t('employeeProfile.sections.workSkills')}</CardTitle>
              </CardHeader>
              <CardContent>
                <EmployeeSkillsRadarChart />
                <div className="flex justify-center gap-6 mt-2 text-xs flex-wrap">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500/30 border border-blue-500" />
                    <span>{t('employeeProfile.skillsLegend.benchmark')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>{t('employeeProfile.skillsLegend.manager')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span>{t('employeeProfile.skillsLegend.director')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Work Timeline */}
            <EmployeeWorkTimeline employeeId={id!} />

            {/* Stats */}
            <EmployeeStatsCards />
          </div>
        </div>
      )}

      {/* Work/Job List Tab */}
      {activeTab === 'work' && <EmployeeJobList />}

      {/* Work History Tab */}
      {activeTab === 'workHistory' && <EmployeeWorkTimeline employeeId={id!} />}

      {/* Degrees Tab */}
      {activeTab === 'degrees' && <EmployeeDegrees employeeId={id!} />}

      {/* Certificates Tab */}
      {activeTab === 'certificates' && <EmployeeCertificates employeeId={id!} />}

      {/* Skills Tab */}
      {activeTab === 'skills' && <EmployeeSkills employeeId={id!} />}

      {/* Family Info Tab */}
      {activeTab === 'family' && <EmployeeFamilyInfo employeeId={id!} />}

      {/* Contracts Tab */}
      {activeTab === 'contract' && (
        <EmployeeContracts 
          employeeId={employee.id}
          employeeName={employee.full_name}
          department={employee.department || undefined}
        />
      )}

      {/* Salary Tab - restricted */}
      {activeTab === 'salary' && (
        <PermissionGate module="employees" action="view_salary" fallback={
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">{t('permissions.accessDenied', 'Không có quyền truy cập')}</p>
          </div>
        }>
          <EmployeeSalary 
            employeeId={employee.id}
            employeeName={employee.full_name}
          />
        </PermissionGate>
      )}

      {/* CV/Resume Tab */}
      {activeTab === 'cv' && (
        <EmployeeResume 
          employeeId={employee.id}
          employeeName={employee.full_name}
        />
      )}

      {/* KPI Tab */}
      {activeTab === 'kpi' && <EmployeeKPI employeeId={employee.id} />}

      {/* Insurance & Benefits Tab - restricted */}
      {activeTab === 'insurance' && (
        <PermissionGate module="employees" action="view_salary" fallback={
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">{t('permissions.accessDenied', 'Không có quyền truy cập')}</p>
          </div>
        }>
          <EmployeeInsurance employeeId={employee.id} />
        </PermissionGate>
      )}

      {/* Training Tab */}
      {activeTab === 'training' && <EmployeeTraining employeeId={employee.id} />}

      {/* Assets Tab */}
      {activeTab === 'assets' && <EmployeeAssets employeeId={employee.id} />}

      {/* Rewards & Discipline Tab */}
      {activeTab === 'rewards' && <EmployeeRewardsDiscipline employeeId={employee.id} />}

      {/* Other tabs - placeholder */}
      {!['general', 'work', 'workHistory', 'degrees', 'certificates', 'skills', 'family', 'contract', 'salary', 'cv', 'kpi', 'insurance', 'training', 'assets', 'rewards'].includes(activeTab) && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            {t('employeeProfile.tabContent')} {allTabs.find((tab) => tab.id === activeTab)?.label}
          </p>
        </div>
      )}

      {/* Edit Employee Dialog */}
      <EmployeeFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        employee={employee}
        departments={departments.map(d => ({ id: d.id, name: d.name }))}
        onSubmit={handleEditSubmit}
        isLoading={isEditLoading}
      />
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value || '--'}</p>
      </div>
    </div>
  );
}
