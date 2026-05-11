import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Plus,
  Download,
  Upload,
  Pencil,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Settings,
  AlertCircle,
  X,
  Info,
  Filter,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { FormulaInput } from '@/components/payroll/FormulaInput';
import {
  useSalaryComponents,
  SalaryComponent,
  SalaryComponentFormData,
  systemSalaryComponents,
  componentTypes,
} from '@/hooks/useSalaryComponents';
import { Skeleton } from '@/components/ui/skeleton';

const initialFormData: SalaryComponentFormData = {
  code: '',
  name: '',
  component_type: '',
  nature: 'income',
  value_type: 'currency',
  is_taxable: true,
  is_insurance_base: false,
  formula: '',
  default_value: 0,
  applied_to: 'all',
  is_active: true,
  sort_order: 0,
};

export const SalaryComponentsTab = () => {
  const { t } = useTranslation();
  const {
    components,
    isLoading,
    createComponent,
    updateComponent,
    deleteComponent,
    toggleComponentStatus,
    initializeDefaultComponents,
  } = useSalaryComponents();

  // State
  const [activeTab, setActiveTab] = useState<'custom' | 'system'>('custom');
  const [searchTerm, setSearchTerm] = useState('');
  const [componentTypeFilter, setComponentTypeFilter] = useState<string>('all');
  const [natureFilter, setNatureFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(true);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [componentToEdit, setComponentToEdit] = useState<SalaryComponent | null>(null);
  const [componentToDelete, setComponentToDelete] = useState<SalaryComponent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<SalaryComponentFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filter components
  const filteredComponents = useMemo(() => {
    return components.filter((comp) => {
      const matchesSearch =
        comp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = componentTypeFilter === 'all' || comp.component_type === componentTypeFilter;
      const matchesNature = natureFilter === 'all' || comp.nature === natureFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && comp.is_active) ||
        (statusFilter === 'inactive' && !comp.is_active);
      return matchesSearch && matchesType && matchesNature && matchesStatus;
    });
  }, [components, searchTerm, componentTypeFilter, natureFilter, statusFilter]);

  // Filter system components
  const filteredSystemComponents = useMemo(() => {
    return systemSalaryComponents.filter((comp) => {
      const matchesSearch =
        comp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = componentTypeFilter === 'all' || comp.componentType === componentTypeFilter;
      const matchesNature = natureFilter === 'all' || comp.nature === natureFilter;
      return matchesSearch && matchesType && matchesNature;
    });
  }, [searchTerm, componentTypeFilter, natureFilter]);

  // Available components for formula
  const formulaAvailableComponents = useMemo(() => {
    return [
      ...components.map(c => ({ code: c.code, name: c.name })),
      ...systemSalaryComponents.map(c => ({ code: c.code, name: c.name })),
    ];
  }, [components]);

  // Stats
  const stats = useMemo(() => {
    const total = components.length;
    const active = components.filter(c => c.is_active).length;
    const income = components.filter(c => c.nature === 'income').length;
    const deduction = components.filter(c => c.nature === 'deduction').length;
    return { total, active, income, deduction };
  }, [components]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code.trim()) {
      errors.code = t('salaryComponents.validation.codeRequired');
    } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
      errors.code = t('salaryComponents.validation.codeFormat');
    }

    if (!formData.name.trim()) {
      errors.name = t('salaryComponents.validation.nameRequired');
    }

    if (!formData.component_type) {
      errors.component_type = t('salaryComponents.validation.typeRequired');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle add
  const handleAdd = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await createComponent(formData);
    setIsSubmitting(false);

    if (result) {
      setShowAddDialog(false);
      setFormData(initialFormData);
      setFormErrors({});
    }
  };

  // Handle edit
  const handleOpenEdit = (component: SalaryComponent) => {
    setComponentToEdit(component);
    setFormData({
      code: component.code,
      name: component.name,
      category_id: component.category_id,
      component_type: component.component_type,
      nature: component.nature,
      value_type: component.value_type,
      is_taxable: component.is_taxable,
      is_insurance_base: component.is_insurance_base,
      formula: component.formula || '',
      default_value: component.default_value,
      min_value: component.min_value,
      max_value: component.max_value,
      description: component.description,
      applied_to: component.applied_to,
      is_active: component.is_active,
      sort_order: component.sort_order,
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!componentToEdit || !validateForm()) return;

    setIsSubmitting(true);
    const success = await updateComponent(componentToEdit.id, formData);
    setIsSubmitting(false);

    if (success) {
      setShowEditDialog(false);
      setComponentToEdit(null);
      setFormData(initialFormData);
      setFormErrors({});
    }
  };

  // Handle delete
  const handleOpenDelete = (component: SalaryComponent) => {
    setComponentToDelete(component);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!componentToDelete) return;

    setIsSubmitting(true);
    const success = await deleteComponent(componentToDelete.id);
    setIsSubmitting(false);

    if (success) {
      setShowDeleteDialog(false);
      setComponentToDelete(null);
    }
  };

  // Handle initialize defaults
  const handleInitializeDefaults = async () => {
    if (components.length > 0) {
      if (!confirm(t('salaryComponents.dialogs.confirmInitialize'))) {
        return;
      }
    }
    await initializeDefaultComponents();
  };

  // Get nature badge
  const getNatureBadge = (nature: string) => {
    switch (nature) {
      case 'income':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">{t('salaryComponents.nature.income')}</Badge>;
      case 'deduction':
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-200">{t('salaryComponents.nature.deduction')}</Badge>;
      default:
        return <Badge variant="secondary">{t('salaryComponents.nature.other')}</Badge>;
    }
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 flex-1" />
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
    <div className="flex h-[calc(100vh-120px)]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{t('salaryComponents.title')}</h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('salaryComponents.searchPlaceholder')}
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={handleInitializeDefaults}>
                <ClipboardList className="w-4 h-4 mr-2" />
                {t('salaryComponents.initializeDefaults')}
              </Button>
              <Button className="bg-primary gap-2" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4" />
                {t('salaryComponents.addNew')}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{t('salaryComponents.stats.total')}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{t('salaryComponents.stats.active')}</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{t('salaryComponents.stats.income')}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.income}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{t('salaryComponents.stats.deduction')}</p>
                <p className="text-2xl font-bold text-rose-600">{stats.deduction}</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b -mx-6 px-6">
            <button
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'custom'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('custom')}
            >
              {t('salaryComponents.tabs.company')} ({components.length})
            </button>
            <button
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'system'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('system')}
            >
              {t('salaryComponents.tabs.system')} ({systemSalaryComponents.length})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="w-12 p-3 text-center text-xs font-medium text-muted-foreground">#</th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">{t('salaryComponents.table.code')}</th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">{t('salaryComponents.table.name')}</th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">{t('salaryComponents.table.type')}</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">{t('salaryComponents.table.nature')}</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">{t('salaryComponents.table.valueType')}</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">{t('salaryComponents.table.taxable')}</th>
                {activeTab === 'custom' && (
                  <>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground">{t('salaryComponents.table.status')}</th>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground w-24"></th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {activeTab === 'custom' ? (
                filteredComponents.length > 0 ? (
                  filteredComponents.map((component, index) => (
                    <tr key={component.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 text-center text-muted-foreground">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="p-3">
                        <code className="text-sm bg-muted px-2 py-1 rounded text-primary font-medium">
                          {component.code}
                        </code>
                      </td>
                      <td className="p-3 font-medium">{component.name}</td>
                      <td className="p-3">
                        <Badge variant="outline">{component.component_type}</Badge>
                      </td>
                      <td className="p-3 text-center">{getNatureBadge(component.nature)}</td>
                      <td className="p-3 text-center">
                        <span className="text-sm text-muted-foreground">
                          {component.value_type === 'currency' ? t('salaryComponents.valueTypes.currency') : 
                           component.value_type === 'number' ? t('salaryComponents.valueTypes.number') : t('salaryComponents.valueTypes.percentage')}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {component.is_taxable ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={component.is_active ? 'default' : 'secondary'}
                          className={cn(
                            component.is_active
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {component.is_active ? t('salaryComponents.status.active') : t('salaryComponents.status.inactive')}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEdit(component)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              {t('salaryComponents.actions.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleComponentStatus(component.id, !component.is_active)}
                            >
                              {component.is_active ? t('salaryComponents.actions.deactivate') : t('salaryComponents.actions.activate')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleOpenDelete(component)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('salaryComponents.actions.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardList className="w-12 h-12 text-muted-foreground/50" />
                        <p>{t('salaryComponents.empty.message')}</p>
                        <Button size="sm" onClick={() => setShowAddDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          {t('salaryComponents.empty.addFirst')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              ) : (
                filteredSystemComponents.map((component, index) => (
                  <tr key={component.code} className="border-b hover:bg-muted/30">
                    <td className="p-3 text-center text-muted-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="p-3">
                      <code className="text-sm bg-muted px-2 py-1 rounded text-primary font-medium">
                        {component.code}
                      </code>
                    </td>
                    <td className="p-3 font-medium">{component.name}</td>
                    <td className="p-3">
                      <Badge variant="outline">{component.componentType}</Badge>
                    </td>
                    <td className="p-3 text-center">{getNatureBadge(component.nature)}</td>
                    <td className="p-3 text-center">
                      <span className="text-sm text-muted-foreground">{t('salaryComponents.valueTypes.currency')}</span>
                    </td>
                    <td className="p-3 text-center">
                      {component.isTaxable ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-card">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="default" size="sm" className="h-8 w-8 p-0">
              1
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">
            {t('salaryComponents.showingResults', { count: activeTab === 'custom' ? filteredComponents.length : filteredSystemComponents.length })}
          </span>
        </div>
      </div>

      {/* Right Sidebar Filters */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent className="w-72 border-l p-4 bg-muted/30 overflow-y-auto">
          {/* Component Type Filter */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">{t('salaryComponents.filters.componentType')}</h4>
            <Select value={componentTypeFilter} onValueChange={setComponentTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('common.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {componentTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nature Filter */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">{t('salaryComponents.filters.nature')}</h4>
            <RadioGroup value={natureFilter} onValueChange={setNatureFilter} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="nature-all" />
                <Label htmlFor="nature-all" className="font-normal cursor-pointer text-sm">{t('common.all')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="nature-income" />
                <Label htmlFor="nature-income" className="font-normal cursor-pointer text-sm">{t('salaryComponents.nature.income')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deduction" id="nature-deduction" />
                <Label htmlFor="nature-deduction" className="font-normal cursor-pointer text-sm">{t('salaryComponents.nature.deduction')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="nature-other" />
                <Label htmlFor="nature-other" className="font-normal cursor-pointer text-sm">{t('salaryComponents.nature.other')}</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Status Filter - only for custom tab */}
          {activeTab === 'custom' && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">{t('salaryComponents.filters.status')}</h4>
              <RadioGroup value={statusFilter} onValueChange={setStatusFilter} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="status-all" />
                  <Label htmlFor="status-all" className="font-normal cursor-pointer text-sm">{t('common.all')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="status-active" />
                  <Label htmlFor="status-active" className="font-normal cursor-pointer text-sm">{t('salaryComponents.filters.activeOnly')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="status-inactive" />
                  <Label htmlFor="status-inactive" className="font-normal cursor-pointer text-sm">{t('salaryComponents.filters.inactiveOnly')}</Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          setFormData(initialFormData);
          setFormErrors({});
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              {t('salaryComponents.form.addTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Code */}
            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">
                {t('salaryComponents.form.code')} <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-1">
                <Input
                  value={formData.code}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
                    setFormData(prev => ({ ...prev, code: value }));
                    if (formErrors.code) setFormErrors(prev => ({ ...prev, code: '' }));
                  }}
                  placeholder={t('salaryComponents.form.codePlaceholder')}
                  className={formErrors.code ? 'border-destructive' : ''}
                />
                {formErrors.code && <p className="text-xs text-destructive">{formErrors.code}</p>}
                <p className="text-xs text-muted-foreground">{t('salaryComponents.form.codeHint')}</p>
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">
                {t('salaryComponents.form.name')} <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-1">
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
                  }}
                  placeholder={t('salaryComponents.form.namePlaceholder')}
                  className={formErrors.name ? 'border-destructive' : ''}
                />
                {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
              </div>
            </div>

            {/* Component Type */}
            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">
                {t('salaryComponents.form.componentType')} <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-1">
                <Select
                  value={formData.component_type}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, component_type: value }));
                    if (formErrors.component_type) setFormErrors(prev => ({ ...prev, component_type: '' }));
                  }}
                >
                  <SelectTrigger className={formErrors.component_type ? 'border-destructive' : ''}>
                    <SelectValue placeholder={t('salaryComponents.form.selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {componentTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.component_type && <p className="text-xs text-destructive">{formErrors.component_type}</p>}
              </div>
            </div>

            {/* Nature + Taxable */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">{t('salaryComponents.form.nature')}</Label>
              <div className="flex items-center gap-4">
                <Select
                  value={formData.nature}
                  onValueChange={(value: 'income' | 'deduction' | 'other') => 
                    setFormData(prev => ({ ...prev, nature: value }))
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">{t('salaryComponents.nature.income')}</SelectItem>
                    <SelectItem value="deduction">{t('salaryComponents.nature.deduction')}</SelectItem>
                    <SelectItem value="other">{t('salaryComponents.nature.other')}</SelectItem>
                  </SelectContent>
                </Select>
                <RadioGroup
                  value={formData.is_taxable ? 'taxable' : 'nontaxable'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, is_taxable: value === 'taxable' }))}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="taxable" id="add-taxable" />
                    <Label htmlFor="add-taxable" className="font-normal cursor-pointer">{t('salaryComponents.form.taxable')}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nontaxable" id="add-nontaxable" />
                    <Label htmlFor="add-nontaxable" className="font-normal cursor-pointer">{t('salaryComponents.form.nonTaxable')}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Value Type */}
            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">{t('salaryComponents.form.valueType')}</Label>
              <Select
                value={formData.value_type}
                onValueChange={(value: 'currency' | 'number' | 'percentage') => 
                  setFormData(prev => ({ ...prev, value_type: value }))
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="currency">{t('salaryComponents.valueTypes.currency')}</SelectItem>
                  <SelectItem value="number">{t('salaryComponents.valueTypes.number')}</SelectItem>
                  <SelectItem value="percentage">{t('salaryComponents.valueTypes.percentage')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Formula */}
            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">{t('salaryComponents.form.formula')}</Label>
              <FormulaInput
                value={formData.formula || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, formula: value }))}
                availableComponents={formulaAvailableComponents}
                placeholder={t('salaryComponents.form.formulaPlaceholder')}
              />
            </div>

            {/* Description */}
            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">{t('salaryComponents.form.description')}</Label>
              <Input
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('salaryComponents.form.descriptionPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t('salaryComponents.dialogs.cancel')}
            </Button>
            <Button onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? t('salaryComponents.dialogs.saving') : t('salaryComponents.dialogs.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open);
        if (!open) {
          setComponentToEdit(null);
          setFormData(initialFormData);
          setFormErrors({});
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              {t('salaryComponents.form.editTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Same form fields as Add Dialog */}
            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">{t('salaryComponents.form.code')}</Label>
              <Input value={formData.code} disabled className="bg-muted" />
            </div>

            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">
                {t('salaryComponents.form.name')} <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-1">
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
                  }}
                  className={formErrors.name ? 'border-destructive' : ''}
                />
                {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">{t('salaryComponents.form.componentType')}</Label>
              <Select
                value={formData.component_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, component_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {componentTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">{t('salaryComponents.form.nature')}</Label>
              <div className="flex items-center gap-4">
                <Select
                  value={formData.nature}
                  onValueChange={(value: 'income' | 'deduction' | 'other') => 
                    setFormData(prev => ({ ...prev, nature: value }))
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">{t('salaryComponents.nature.income')}</SelectItem>
                    <SelectItem value="deduction">{t('salaryComponents.nature.deduction')}</SelectItem>
                    <SelectItem value="other">{t('salaryComponents.nature.other')}</SelectItem>
                  </SelectContent>
                </Select>
                <RadioGroup
                  value={formData.is_taxable ? 'taxable' : 'nontaxable'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, is_taxable: value === 'taxable' }))}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="taxable" id="edit-taxable" />
                    <Label htmlFor="edit-taxable" className="font-normal cursor-pointer">{t('salaryComponents.form.taxable')}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nontaxable" id="edit-nontaxable" />
                    <Label htmlFor="edit-nontaxable" className="font-normal cursor-pointer">{t('salaryComponents.form.nonTaxable')}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">{t('salaryComponents.form.valueType')}</Label>
              <Select
                value={formData.value_type}
                onValueChange={(value: 'currency' | 'number' | 'percentage') => 
                  setFormData(prev => ({ ...prev, value_type: value }))
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="currency">{t('salaryComponents.valueTypes.currency')}</SelectItem>
                  <SelectItem value="number">{t('salaryComponents.valueTypes.number')}</SelectItem>
                  <SelectItem value="percentage">{t('salaryComponents.valueTypes.percentage')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">{t('salaryComponents.form.formula')}</Label>
              <FormulaInput
                value={formData.formula || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, formula: value }))}
                availableComponents={formulaAvailableComponents}
                placeholder={t('salaryComponents.form.formulaPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">{t('salaryComponents.form.description')}</Label>
              <Input
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('salaryComponents.form.descriptionPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              {t('salaryComponents.dialogs.cancel')}
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSubmitting}>
              {isSubmitting ? t('salaryComponents.dialogs.saving') : t('salaryComponents.dialogs.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              {t('salaryComponents.dialogs.deleteTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-destructive">
                {t('salaryComponents.dialogs.deleteWarning')}
              </p>
            </div>
            {componentToDelete && (
              <div className="space-y-2 bg-muted/50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <span className="text-sm text-muted-foreground w-32 shrink-0">{t('salaryComponents.form.code')}:</span>
                  <code className="text-sm font-medium text-primary">{componentToDelete.code}</code>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm text-muted-foreground w-32 shrink-0">{t('salaryComponents.form.name')}:</span>
                  <span className="text-sm font-medium">{componentToDelete.name}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t('salaryComponents.dialogs.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isSubmitting}>
              <Trash2 className="w-4 h-4 mr-2" />
              {isSubmitting ? t('salaryComponents.dialogs.deleting') : t('salaryComponents.dialogs.confirmDelete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
