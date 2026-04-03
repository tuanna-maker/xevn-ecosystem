import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Users,
  TrendingUp,
  Award,
  Target,
  Calendar,
  DollarSign,
  BarChart3,
  Gift,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useBonusPolicies,
  BonusPolicy,
  BonusPolicyParticipant,
  BonusPolicyFormData,
  BonusType,
  CalculationMethod,
} from '@/hooks/useBonusPolicies';
import { useEmployees } from '@/hooks/useEmployees';

// These will be accessed via t() inside the component

const initialFormData: BonusPolicyFormData = {
  code: '',
  name: '',
  type: 'monthly',
  description: '',
  calculation_method: 'fixed',
  base_value: 0,
  percentage_base: 'base_salary',
  formula: '',
  conditions: [],
  effective_date: new Date().toISOString().split('T')[0],
  status: 'draft',
  applied_departments: [],
  applied_positions: [],
};

export function BonusPolicyTab() {
  const { t } = useTranslation();

  const bonusTypeLabels: Record<BonusType, string> = {
    monthly: t('bonus.typeMonthly'), quarterly: t('bonus.typeQuarterly'), yearly: t('bonus.typeYearly'),
    kpi: t('bonus.typeKpi'), sales: t('bonus.typeSales'), holiday: t('bonus.typeHoliday'),
    excellence: t('bonus.typeExcellence'), other: t('bonus.typeOther'),
  };

  const bonusTypeIcons: Record<BonusType, React.ReactNode> = {
    monthly: <Calendar className="w-4 h-4" />, quarterly: <BarChart3 className="w-4 h-4" />,
    yearly: <Gift className="w-4 h-4" />, kpi: <Target className="w-4 h-4" />,
    sales: <TrendingUp className="w-4 h-4" />, holiday: <Star className="w-4 h-4" />,
    excellence: <Award className="w-4 h-4" />, other: <DollarSign className="w-4 h-4" />,
  };

  const calculationMethodLabels: Record<CalculationMethod, string> = {
    fixed: t('bonus.calcFixed'), percentage: t('bonus.calcPercentage'),
    formula: t('bonus.calcFormula'), tier: t('bonus.calcTier'),
  };

  const {
    policies, isLoading, fetchParticipants, createPolicy, updatePolicy,
    deletePolicy, toggleStatus, addParticipant, removeParticipant,
    isCreating, isUpdating, isDeleting,
  } = useBonusPolicies();

  const { employees } = useEmployees();

  const [activeSubTab, setActiveSubTab] = useState<'policies' | 'participants' | 'settings'>('policies');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [showAddPolicyDialog, setShowAddPolicyDialog] = useState(false);
  const [showEditPolicyDialog, setShowEditPolicyDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddParticipantDialog, setShowAddParticipantDialog] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<BonusPolicy | null>(null);
  const [policyToDelete, setPolicyToDelete] = useState<BonusPolicy | null>(null);
  
  // Participants state
  const [participants, setParticipants] = useState<BonusPolicyParticipant[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [selectedParticipantPolicy, setSelectedParticipantPolicy] = useState<string>('all');
  const [selectedEmployeesToAdd, setSelectedEmployeesToAdd] = useState<string[]>([]);
  const [addParticipantPolicyId, setAddParticipantPolicyId] = useState<string>('');

  const [policyForm, setPolicyForm] = useState<BonusPolicyFormData>(initialFormData);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);

  // Load participants when tab changes or policy filter changes
  useEffect(() => {
    if (activeSubTab === 'participants') {
      loadParticipants();
    }
  }, [activeSubTab, selectedParticipantPolicy]);

  const loadParticipants = async () => {
    setIsLoadingParticipants(true);
    try {
      if (selectedParticipantPolicy && selectedParticipantPolicy !== 'all') {
        const data = await fetchParticipants(selectedParticipantPolicy);
        setParticipants(data);
      } else {
        // Load participants from all policies
        const allParticipants: BonusPolicyParticipant[] = [];
        for (const policy of policies) {
          const data = await fetchParticipants(policy.id);
          allParticipants.push(...data);
        }
        setParticipants(allParticipants);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  const filteredPolicies = useMemo(() => {
    return policies.filter(policy => {
      const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || policy.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [policies, searchTerm, typeFilter, statusFilter]);

  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      const matchesSearch = p.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [participants, searchTerm]);

  const handleSelectAll = () => {
    if (selectedPolicies.length === filteredPolicies.length) {
      setSelectedPolicies([]);
    } else {
      setSelectedPolicies(filteredPolicies.map(p => p.id));
    }
  };

  const handleSelectPolicy = (id: string) => {
    if (selectedPolicies.includes(id)) {
      setSelectedPolicies(selectedPolicies.filter(p => p !== id));
    } else {
      setSelectedPolicies([...selectedPolicies, id]);
    }
  };

  const handleAddPolicy = () => {
    setPolicyForm(initialFormData);
    setShowAddPolicyDialog(true);
  };

  const handleEditPolicy = (policy: BonusPolicy) => {
    setSelectedPolicy(policy);
    setPolicyForm({
      code: policy.code,
      name: policy.name,
      type: policy.type,
      description: policy.description || '',
      calculation_method: policy.calculation_method,
      base_value: policy.base_value,
      percentage_base: policy.percentage_base || undefined,
      formula: policy.formula || undefined,
      tiers: policy.tiers || undefined,
      conditions: policy.conditions || [],
      effective_date: policy.effective_date,
      expiry_date: policy.expiry_date || undefined,
      status: policy.status,
      applied_departments: policy.applied_departments || [],
      applied_positions: policy.applied_positions || [],
    });
    setShowEditPolicyDialog(true);
  };

  const handleSavePolicy = async () => {
    try {
      if (showEditPolicyDialog && selectedPolicy) {
        await updatePolicy({ id: selectedPolicy.id, formData: policyForm });
        setShowEditPolicyDialog(false);
      } else {
        await createPolicy(policyForm);
        setShowAddPolicyDialog(false);
      }
      setSelectedPolicy(null);
      setPolicyForm(initialFormData);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeletePolicy = async () => {
    try {
      if (policyToDelete) {
        await deletePolicy(policyToDelete.id);
      } else if (selectedPolicies.length > 0) {
        for (const id of selectedPolicies) {
          await deletePolicy(id);
        }
        setSelectedPolicies([]);
      }
      setShowDeleteDialog(false);
      setPolicyToDelete(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleToggleStatus = async (policy: BonusPolicy) => {
    const newStatus = policy.status === 'active' ? 'inactive' : 'active';
    await toggleStatus({ id: policy.id, status: newStatus });
  };

  const handleAddParticipants = async () => {
    if (!addParticipantPolicyId || selectedEmployeesToAdd.length === 0) return;

    try {
      for (const employeeId of selectedEmployeesToAdd) {
        const employee = employees.find(e => e.id === employeeId);
        if (employee) {
          await addParticipant({
            company_id: employee.company_id,
            policy_id: addParticipantPolicyId,
            employee_id: employeeId,
            employee_code: employee.employee_code,
            employee_name: employee.full_name,
            department: employee.department || null,
            position: employee.position || null,
            join_date: new Date().toISOString().split('T')[0],
            last_bonus_amount: null,
            last_bonus_date: null,
            status: 'active',
          });
        }
      }
      setShowAddParticipantDialog(false);
      setSelectedEmployeesToAdd([]);
      setAddParticipantPolicyId('');
      loadParticipants();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    await removeParticipant(participantId);
    loadParticipants();
  };

  const stats = useMemo(() => ({
    totalPolicies: policies.length,
    activePolicies: policies.filter(p => p.status === 'active').length,
    totalParticipants: policies.reduce((sum, p) => sum + p.participant_count, 0),
    totalPaidAmount: policies.reduce((sum, p) => sum + p.total_paid_amount, 0),
  }), [policies]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Gift className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('bonus.totalPolicies')}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalPolicies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('bonus.active')}</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.activePolicies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('bonus.totalParticipants')}</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalParticipants}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('bonus.totalPaid')}</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(stats.totalPaidAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as typeof activeSubTab)}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="policies" className="gap-2">
            <Gift className="w-4 h-4" />
            {t('bonus.policyList')}
          </TabsTrigger>
          <TabsTrigger value="participants" className="gap-2">
            <Users className="w-4 h-4" />
            {t('bonus.participants')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Target className="w-4 h-4" />
            {t('bonus.settings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="mt-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('bonus.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('bonus.bonusType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {Object.entries(bonusTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t('common.status.label')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="active">{t('bonus.active')}</SelectItem>
                <SelectItem value="inactive">{t('bonus.paused')}</SelectItem>
                <SelectItem value="draft">{t('bonus.draft')}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddPolicy} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              {t('bonus.addPolicy')}
            </Button>
          </div>

          {/* Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left w-10">
                      <Checkbox
                        checked={selectedPolicies.length === filteredPolicies.length && filteredPolicies.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                     <th className="p-3 text-left text-sm font-medium">{t('bonus.code')}</th>
                    <th className="p-3 text-left text-sm font-medium">{t('bonus.policyName')}</th>
                    <th className="p-3 text-left text-sm font-medium">{t('bonus.bonusType')}</th>
                    <th className="p-3 text-left text-sm font-medium">{t('bonus.calcMethod')}</th>
                    <th className="p-3 text-left text-sm font-medium">{t('bonus.value')}</th>
                    <th className="p-3 text-left text-sm font-medium">{t('bonus.participantCount')}</th>
                    <th className="p-3 text-left text-sm font-medium">{t('bonus.spent')}</th>
                    <th className="p-3 text-center text-sm font-medium">{t('common.status.label')}</th>
                    <th className="p-3 text-center text-sm font-medium">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPolicies.map((policy) => (
                    <tr key={policy.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedPolicies.includes(policy.id)}
                          onCheckedChange={() => handleSelectPolicy(policy.id)}
                        />
                      </td>
                      <td className="p-3 text-sm font-mono text-muted-foreground">{policy.code}</td>
                      <td className="p-3">
                        <div className="font-medium">{policy.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{policy.description}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="gap-1">
                          {bonusTypeIcons[policy.type]}
                          {bonusTypeLabels[policy.type]}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{calculationMethodLabels[policy.calculation_method]}</td>
                      <td className="p-3 text-sm">
                        {policy.calculation_method === 'fixed' && formatCurrency(policy.base_value)}
                        {policy.calculation_method === 'percentage' && `${policy.base_value}%`}
                        {policy.calculation_method === 'formula' && (
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{policy.formula}</code>
                        )}
                        {policy.calculation_method === 'tier' && t('bonus.calcTier')}
                      </td>
                      <td className="p-3 text-sm text-center">{policy.participant_count}</td>
                      <td className="p-3 text-sm font-medium text-amber-600">{formatCurrency(policy.total_paid_amount)}</td>
                      <td className="p-3 text-center">
                        <Switch
                          checked={policy.status === 'active'}
                          onCheckedChange={() => handleToggleStatus(policy)}
                        />
                      </td>
                      <td className="p-3 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditPolicy(policy)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedParticipantPolicy(policy.id);
                              setActiveSubTab('participants');
                            }}>
                              <Users className="w-4 h-4 mr-2" />
                              {t('bonus.viewParticipants')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setPolicyToDelete(policy);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredPolicies.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                {policies.length === 0 ? t('bonus.emptyPolicies') : t('bonus.noResults')}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="mt-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('bonus.searchEmployee')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={selectedParticipantPolicy}
              onValueChange={setSelectedParticipantPolicy}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('bonus.selectPolicy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('bonus.allPolicies')}</SelectItem>
                {policies.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setShowAddParticipantDialog(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              {t('bonus.addEmployee')}
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">{t('bonus.empCode')}</th>
                    <th className="p-3 text-left text-sm font-medium">{t('bonus.fullName')}</th>
                    <th className="p-3 text-left text-sm font-medium">{t('bonus.department')}</th>
                    <th className="p-3 text-left text-sm font-medium">{t('bonus.position')}</th>
                    <th className="p-3 text-left text-sm font-medium">{t('bonus.policy')}</th>
                    <th className="p-3 text-left text-sm font-medium">{t('bonus.joinDate')}</th>
                    <th className="p-3 text-right text-sm font-medium">{t('bonus.latestBonus')}</th>
                    <th className="p-3 text-center text-sm font-medium">{t('common.status.label')}</th>
                    <th className="p-3 text-center text-sm font-medium">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingParticipants ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        {t('common.loading')}
                      </td>
                    </tr>
                  ) : filteredParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
                        {t('bonus.noParticipants')}
                      </td>
                    </tr>
                  ) : (
                    filteredParticipants.map((participant) => {
                      const policy = policies.find(p => p.id === participant.policy_id);
                      return (
                        <tr key={participant.id} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="p-3 text-sm font-mono">{participant.employee_code}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {participant.employee_name.split(' ').pop()?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{participant.employee_name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-sm">{participant.department}</td>
                          <td className="p-3 text-sm">{participant.position}</td>
                          <td className="p-3">
                            <Badge variant="secondary">{policy?.name}</Badge>
                          </td>
                          <td className="p-3 text-sm">{participant.join_date}</td>
                          <td className="p-3 text-sm text-right font-medium text-emerald-600">
                            {participant.last_bonus_amount ? formatCurrency(participant.last_bonus_amount) : '-'}
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              variant={participant.status === 'active' ? 'default' : 'secondary'}
                              className={cn(
                                participant.status === 'active' && 'bg-emerald-500',
                                participant.status === 'suspended' && 'bg-amber-500',
                                participant.status === 'pending' && 'bg-blue-500'
                              )}
                            >
                              {participant.status === 'active' && t('bonus.active')}
                              {participant.status === 'suspended' && t('bonus.paused')}
                              {participant.status === 'pending' && t('common.status.pending')}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                <Pencil className="w-4 h-4 mr-2" />
                                {t('common.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleRemoveParticipant(participant.id)}
                                >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t('bonus.removeFromPolicy')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('bonus.settingsTitle')}</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">{t('bonus.autoCalc')}</p>
                  <p className="text-sm text-muted-foreground">{t('bonus.autoCalcDesc')}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">{t('bonus.notifyEmployee')}</p>
                  <p className="text-sm text-muted-foreground">{t('bonus.notifyEmployeeDesc')}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">{t('bonus.requireApproval')}</p>
                  <p className="text-sm text-muted-foreground">{t('bonus.requireApprovalDesc')}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{t('bonus.proRata')}</p>
                  <p className="text-sm text-muted-foreground">{t('bonus.proRataDesc')}</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Policy Dialog */}
      <Dialog open={showAddPolicyDialog || showEditPolicyDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddPolicyDialog(false);
          setShowEditPolicyDialog(false);
          setSelectedPolicy(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showEditPolicyDialog ? t('bonus.editPolicy') : t('bonus.addPolicy')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('bonus.policyCode')} <span className="text-destructive">*</span></Label>
                <Input
                  value={policyForm.code || ''}
                  onChange={(e) => setPolicyForm({ ...policyForm, code: e.target.value.toUpperCase() })}
                  placeholder="VD: THUONG_THANG"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('bonus.policyName')} <span className="text-destructive">*</span></Label>
                <Input
                  value={policyForm.name || ''}
                  onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })}
                  placeholder="VD: Thưởng tháng"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>{t('bonus.bonusType')}</Label>
              <Select value={policyForm.type} onValueChange={(v) => setPolicyForm({ ...policyForm, type: v as BonusType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(bonusTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        {bonusTypeIcons[value as BonusType]}
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('bonus.descriptionLabel')}</Label>
              <Input
                value={policyForm.description || ''}
                onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
                placeholder="Mô tả chi tiết về chính sách thưởng..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('bonus.calcMethod')}</Label>
                <Select
                  value={policyForm.calculation_method}
                  onValueChange={(v) => setPolicyForm({ ...policyForm, calculation_method: v as CalculationMethod })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(calculationMethodLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {policyForm.calculation_method === 'fixed' && (
                <div className="space-y-2">
                  <Label>{t('bonus.fixedAmount')}</Label>
                  <Input
                    type="number"
                    value={policyForm.base_value || 0}
                    onChange={(e) => setPolicyForm({ ...policyForm, base_value: Number(e.target.value) })}
                  />
                </div>
              )}
              
              {policyForm.calculation_method === 'percentage' && (
                <div className="space-y-2">
                  <Label>{t('bonus.percentageRate')}</Label>
                  <Input
                    type="number"
                    value={policyForm.base_value || 0}
                    onChange={(e) => setPolicyForm({ ...policyForm, base_value: Number(e.target.value) })}
                  />
                </div>
              )}
            </div>

            {policyForm.calculation_method === 'percentage' && (
              <div className="space-y-2">
                <Label>{t('bonus.percentageBase')}</Label>
                <Select
                  value={policyForm.percentage_base}
                  onValueChange={(v) => setPolicyForm({ ...policyForm, percentage_base: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="base_salary">{t('bonus.baseSalary')}</SelectItem>
                    <SelectItem value="gross_salary">{t('bonus.grossSalary')}</SelectItem>
                    <SelectItem value="net_salary">{t('bonus.netSalary')}</SelectItem>
                    <SelectItem value="kpi_score">{t('bonus.kpiScore')}</SelectItem>
                    <SelectItem value="sales_amount">{t('bonus.salesAmount')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {policyForm.calculation_method === 'formula' && (
              <div className="space-y-2">
                <Label>{t('bonus.formulaLabel')}</Label>
                <Input
                  value={policyForm.formula || ''}
                  onChange={(e) => setPolicyForm({ ...policyForm, formula: e.target.value })}
                  placeholder="VD: =DIEM_KPI * LUONG_CO_BAN * 0.005"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  {t('bonus.formulaHint')}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('bonus.effectiveDate')}</Label>
                <Input
                  type="date"
                  value={policyForm.effective_date || ''}
                  onChange={(e) => setPolicyForm({ ...policyForm, effective_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('bonus.expiryDate')}</Label>
                <Input
                  type="date"
                  value={policyForm.expiry_date || ''}
                  onChange={(e) => setPolicyForm({ ...policyForm, expiry_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('common.status.label')}</Label>
              <Select value={policyForm.status} onValueChange={(v) => setPolicyForm({ ...policyForm, status: v as BonusPolicy['status'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="draft">{t('bonus.draft')}</SelectItem>
                    <SelectItem value="active">{t('bonus.active')}</SelectItem>
                    <SelectItem value="inactive">{t('bonus.paused')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddPolicyDialog(false);
              setShowEditPolicyDialog(false);
              setSelectedPolicy(null);
            }}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleSavePolicy} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              disabled={isCreating || isUpdating}
            >
              {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {showEditPolicyDialog ? t('common.saveChanges') : t('bonus.addPolicy')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              {t('bonus.confirmDelete')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {policyToDelete ? (
              <p className="text-sm text-muted-foreground">
                {t('bonus.confirmDeleteSingle', { name: policyToDelete.name })}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('bonus.confirmDeleteMultiple', { count: selectedPolicies.length })}
              </p>
            )}
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {t('bonus.deleteWarning')}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              setShowDeleteDialog(false);
              setPolicyToDelete(null);
            }}>
              {t('common.cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePolicy}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Trash2 className="w-4 h-4 mr-2" />
              {t('bonus.confirmDelete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Participant Dialog */}
      <Dialog open={showAddParticipantDialog} onOpenChange={setShowAddParticipantDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('bonus.addParticipantTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('bonus.selectPolicy')} <span className="text-destructive">*</span></Label>
              <Select value={addParticipantPolicyId} onValueChange={setAddParticipantPolicyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chính sách thưởng" />
                </SelectTrigger>
                <SelectContent>
                  {policies.filter(p => p.status === 'active').map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('bonus.selectEmployees')}</Label>
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {employees.map(emp => (
                  <div 
                    key={emp.id} 
                    className={cn(
                      "flex items-center gap-3 p-3 border-b last:border-0 cursor-pointer hover:bg-muted/30",
                      selectedEmployeesToAdd.includes(emp.id) && "bg-primary/5"
                    )}
                    onClick={() => {
                      if (selectedEmployeesToAdd.includes(emp.id)) {
                        setSelectedEmployeesToAdd(selectedEmployeesToAdd.filter(id => id !== emp.id));
                      } else {
                        setSelectedEmployeesToAdd([...selectedEmployeesToAdd, emp.id]);
                      }
                    }}
                  >
                    <Checkbox checked={selectedEmployeesToAdd.includes(emp.id)} />
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {emp.full_name.split(' ').pop()?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{emp.full_name}</p>
                      <p className="text-xs text-muted-foreground">{emp.employee_code} - {emp.department}</p>
                    </div>
                  </div>
                ))}
                {employees.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    {t('bonus.noEmployees')}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddParticipantDialog(false);
              setSelectedEmployeesToAdd([]);
              setAddParticipantPolicyId('');
            }}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleAddParticipants}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              disabled={!addParticipantPolicyId || selectedEmployeesToAdd.length === 0}
            >
              {t('common.add')} {selectedEmployeesToAdd.length > 0 && `(${selectedEmployeesToAdd.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
