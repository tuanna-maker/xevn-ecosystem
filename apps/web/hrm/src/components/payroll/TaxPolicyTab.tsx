import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Pencil, Trash2, Settings, ArrowUp, ArrowDown, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTaxPolicyParticipants, TaxPolicyParticipantFormData } from '@/hooks/useTaxPolicyParticipants';
import { useEmployees } from '@/hooks/useEmployees';
import { format } from 'date-fns';

export function TaxPolicyTab() {
  const { t } = useTranslation();
  const { participants, isLoading, createManyParticipants, updateParticipant, deleteParticipant, toggleStatus, isCreating } = useTaxPolicyParticipants();
  const { employees } = useEmployees();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'participants' | 'pending' | 'settings'>('participants');
  const [showDateFilter, setShowDateFilter] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'effective-date' | 'employee-id-asc' | 'employee-id-desc'>('newest');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [policyTypeFilter, setPolicyTypeFilter] = useState<'all' | 'progressive' | 'flat'>('all');
  
  // Add participant dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [addDepartmentFilter, setAddDepartmentFilter] = useState('all');
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [addPolicyType, setAddPolicyType] = useState<'progressive' | 'flat'>('progressive');
  const [addEffectiveDate, setAddEffectiveDate] = useState('');

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department).filter(Boolean));
    return Array.from(depts) as string[];
  }, [employees]);

  // Filter participants
  const filteredParticipants = useMemo(() => {
    let result = [...participants];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.employee_name.toLowerCase().includes(query) ||
        p.employee_code.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    // Policy type filter
    if (policyTypeFilter !== 'all') {
      result = result.filter(p => p.policy_type === policyTypeFilter);
    }

    // Sort
    switch (sortOrder) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'effective-date':
        result.sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime());
        break;
      case 'employee-id-asc':
        result.sort((a, b) => a.employee_code.localeCompare(b.employee_code));
        break;
      case 'employee-id-desc':
        result.sort((a, b) => b.employee_code.localeCompare(a.employee_code));
        break;
    }

    return result;
  }, [participants, searchQuery, statusFilter, policyTypeFilter, sortOrder]);

  // Available employees to add (not already in participants)
  const availableEmployees = useMemo(() => {
    const existingCodes = new Set(participants.map(p => p.employee_code));
    return employees.filter(e => !existingCodes.has(e.employee_code));
  }, [employees, participants]);

  // Filtered employees for add dialog
  const filteredEmployeesToAdd = useMemo(() => {
    return availableEmployees.filter(emp => {
      const matchesSearch = emp.full_name.toLowerCase().includes(addSearch.toLowerCase()) ||
        emp.employee_code.toLowerCase().includes(addSearch.toLowerCase());
      const matchesDepartment = addDepartmentFilter === 'all' || emp.department === addDepartmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [availableEmployees, addSearch, addDepartmentFilter]);

  const toggleEmployeeSelection = (id: string) => {
    setSelectedEmployees(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEmployees.length === filteredParticipants.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredParticipants.map(p => p.id));
    }
  };

  const handleConfirmAdd = async () => {
    if (selectedToAdd.length === 0 || !addEffectiveDate) return;

    const itemsToAdd: TaxPolicyParticipantFormData[] = selectedToAdd.map(empId => {
      const emp = employees.find(e => e.id === empId);
      if (!emp) throw new Error('Employee not found');

      return {
        employee_id: emp.id,
        employee_code: emp.employee_code,
        employee_name: emp.full_name,
        position: emp.position || undefined,
        department: emp.department || undefined,
        policy_type: addPolicyType,
        policy_name: addPolicyType === 'progressive' ? t('taxPolicy.progressive') : t('taxPolicy.flat'),
        effective_date: addEffectiveDate,
        status: 'active',
      };
    });

    await createManyParticipants(itemsToAdd);
    setShowAddDialog(false);
    setSelectedToAdd([]);
    setAddSearch('');
    setAddDepartmentFilter('all');
    setAddPolicyType('progressive');
    setAddEffectiveDate('');
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('taxPolicy.deleteConfirm'))) {
      await deleteParticipant(id);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] p-6">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t('taxPolicy.title')}</h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('taxPolicy.searchPlaceholder')}
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-primary gap-2">
                     {t('taxPolicy.addParticipant')}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border shadow-lg z-50">
                   <DropdownMenuItem onClick={() => setShowAddDialog(true)}>
                     {t('taxPolicy.addFromList')}
                   </DropdownMenuItem>
                   <DropdownMenuItem>
                     {t('taxPolicy.importExcel')}
                   </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 mt-4 border-b -mx-6 px-6">
            <button
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'participants' 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('participants')}
            >
              {t('taxPolicy.tabs.participants')}
            </button>
            <button
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'pending' 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('pending')}
            >
              {t('taxPolicy.tabs.pending')}
            </button>
            <button
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1",
                activeTab === 'settings' 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-4 h-4" />
              {t('taxPolicy.tabs.settings')}
            </button>
          </div>
        </div>

        {/* Table */}
        {activeTab === 'participants' && (
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="w-10 p-3 text-left">
                    <Checkbox
                      checked={selectedEmployees.length === filteredParticipants.length && filteredParticipants.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="w-12 p-3 text-center text-xs font-medium text-muted-foreground"></th>
                   <th className="p-3 text-left text-xs font-medium text-muted-foreground">{t('taxPolicy.col.employee')}</th>
                   <th className="p-3 text-left text-xs font-medium text-muted-foreground">{t('taxPolicy.col.policy')}</th>
                   <th className="p-3 text-center text-xs font-medium text-muted-foreground">{t('taxPolicy.col.status')}</th>
                   <th className="p-3 text-left text-xs font-medium text-muted-foreground">{t('taxPolicy.col.createdBy')}</th>
                   <th className="p-3 text-center text-xs font-medium text-muted-foreground w-24"></th>
                 </tr>
              </thead>
              <tbody>
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      {t('taxPolicy.noParticipants')}
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((participant, index) => (
                    <tr key={participant.id} className="border-b hover:bg-muted/30">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedEmployees.includes(participant.id)}
                          onCheckedChange={() => toggleEmployeeSelection(participant.id)}
                        />
                      </td>
                      <td className="p-3 text-center text-muted-foreground">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-muted text-muted-foreground">
                              {participant.employee_name.split(' ').pop()?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{participant.employee_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {participant.employee_code} • {participant.position || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm">{participant.policy_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(participant.effective_date), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge 
                          variant={participant.status === 'active' ? 'default' : 'secondary'}
                          className={cn(
                            participant.status === 'active' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {participant.status === 'active' ? t('common.status.active') : t('common.status.inactive')}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm">{participant.created_by || t('taxPolicy.system')}</p>
                          <p className="text-xs text-muted-foreground">{participant.created_by_position || ''}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1">
                             {t('common.edit')}
                               <ChevronDown className="w-3 h-3" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="bg-popover border shadow-lg z-50">
                             <DropdownMenuItem onClick={() => toggleStatus(participant.id)}>
                               <Pencil className="w-4 h-4 mr-2" />
                               {participant.status === 'active' ? t('taxPolicy.deactivate') : t('taxPolicy.activate')}
                             </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(participant.id)}>
                             <Trash2 className="w-4 h-4 mr-2" />
                               {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t bg-card sticky bottom-0">
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
                {t('taxPolicy.showingResults', { from: 1, to: filteredParticipants.length, total: filteredParticipants.length })}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="flex-1 flex items-center justify-center">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">{t('taxPolicy.noPending')}</p>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 flex items-center justify-center">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">{t('taxPolicy.settingsWip')}</p>
            </Card>
          </div>
        )}
      </div>

      {/* Right Sidebar Filters */}
      <div className="w-72 border-l p-4 bg-muted/30 overflow-y-auto">
        {/* Ngày áp dụng */}
        <Collapsible open={showDateFilter} onOpenChange={setShowDateFilter} className="mb-6">
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full text-sm font-medium mb-3 text-muted-foreground hover:text-foreground transition-colors">
              <span>{t('taxPolicy.filter.effectiveDate')}</span>
              <ChevronRight className={cn("w-4 h-4 transition-transform duration-200", showDateFilter && "rotate-90")} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="relative">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pr-10"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Thứ tự hiển thị */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">{t('taxPolicy.filter.sortOrder')}</h4>
          <RadioGroup value={sortOrder} onValueChange={(v) => setSortOrder(v as typeof sortOrder)} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="newest" id="sort-newest" />
              <Label htmlFor="sort-newest" className="font-normal cursor-pointer text-sm">{t('taxPolicy.filter.newest')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="effective-date" id="sort-effective" />
              <Label htmlFor="sort-effective" className="font-normal cursor-pointer text-sm">{t('taxPolicy.filter.byEffective')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="employee-id-asc" id="sort-id-asc" />
               <Label htmlFor="sort-id-asc" className="font-normal cursor-pointer text-sm flex items-center gap-1">
                 {t('taxPolicy.filter.empIdAsc')} <ArrowUp className="w-3 h-3" />
               </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="employee-id-desc" id="sort-id-desc" />
               <Label htmlFor="sort-id-desc" className="font-normal cursor-pointer text-sm flex items-center gap-1">
                 {t('taxPolicy.filter.empIdDesc')} <ArrowDown className="w-3 h-3" />
               </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Trạng thái */}
        <div className="mb-6">
           <h4 className="text-sm font-medium mb-3 text-muted-foreground">{t('taxPolicy.filter.status')}</h4>
           <RadioGroup value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)} className="space-y-2">
             <div className="flex items-center space-x-2">
               <RadioGroupItem value="all" id="status-all" />
               <Label htmlFor="status-all" className="font-normal cursor-pointer text-sm">{t('common.all')}</Label>
             </div>
             <div className="flex items-center space-x-2">
               <RadioGroupItem value="active" id="status-active" />
               <Label htmlFor="status-active" className="font-normal cursor-pointer text-sm">{t('common.status.active')}</Label>
             </div>
             <div className="flex items-center space-x-2">
               <RadioGroupItem value="inactive" id="status-inactive" />
               <Label htmlFor="status-inactive" className="font-normal cursor-pointer text-sm">{t('common.status.inactive')}</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Loại chính sách */}
        <div className="mb-6">
           <h4 className="text-sm font-medium mb-3 text-muted-foreground">{t('taxPolicy.filter.policyType')}</h4>
           <RadioGroup value={policyTypeFilter} onValueChange={(v) => setPolicyTypeFilter(v as typeof policyTypeFilter)} className="space-y-2">
             <div className="flex items-center space-x-2">
               <RadioGroupItem value="all" id="policy-all" />
               <Label htmlFor="policy-all" className="font-normal cursor-pointer text-sm">{t('common.all')}</Label>
             </div>
             <div className="flex items-center space-x-2">
               <RadioGroupItem value="progressive" id="policy-progressive" />
               <Label htmlFor="policy-progressive" className="font-normal cursor-pointer text-sm">{t('taxPolicy.progressiveShort')}</Label>
             </div>
             <div className="flex items-center space-x-2">
               <RadioGroupItem value="flat" id="policy-flat" />
               <Label htmlFor="policy-flat" className="font-normal cursor-pointer text-sm">{t('taxPolicy.flatShort')}</Label>
             </div>
          </RadioGroup>
        </div>
      </div>

      {/* Add Participant Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('taxPolicy.addDialogTitle')}</DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder={t('taxPolicy.searchEmployee')}
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
              />
            </div>
            <Select value={addDepartmentFilter} onValueChange={setAddDepartmentFilter}>
              <SelectTrigger className="w-48">
                 <SelectValue placeholder={t('empExport.col.department')} />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">{t('empExport.allDepartments')}</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
               <Label>{t('taxPolicy.filter.policyType')}</Label>
               <Select value={addPolicyType} onValueChange={(v) => setAddPolicyType(v as 'progressive' | 'flat')}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="progressive">{t('taxPolicy.progressive')}</SelectItem>
                   <SelectItem value="flat">{t('taxPolicy.flat')}</SelectItem>
                 </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('taxPolicy.filter.byEffective')}</Label>
              <Input
                type="date"
                value={addEffectiveDate}
                onChange={(e) => setAddEffectiveDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto border rounded-md">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="w-10 p-2">
                    <Checkbox
                      checked={selectedToAdd.length === filteredEmployeesToAdd.length && filteredEmployeesToAdd.length > 0}
                      onCheckedChange={() => {
                        if (selectedToAdd.length === filteredEmployeesToAdd.length) {
                          setSelectedToAdd([]);
                        } else {
                          setSelectedToAdd(filteredEmployeesToAdd.map(e => e.id));
                        }
                      }}
                    />
                  </th>
                   <th className="p-2 text-left text-xs font-medium text-muted-foreground">{t('taxPolicy.col.empCode')}</th>
                   <th className="p-2 text-left text-xs font-medium text-muted-foreground">{t('taxPolicy.col.fullName')}</th>
                   <th className="p-2 text-left text-xs font-medium text-muted-foreground">{t('empExport.col.department')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployeesToAdd.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      {t('taxPolicy.noMatchEmployee')}
                    </td>
                  </tr>
                ) : (
                  filteredEmployeesToAdd.map(emp => (
                    <tr key={emp.id} className="border-b hover:bg-muted/30">
                      <td className="p-2">
                        <Checkbox
                          checked={selectedToAdd.includes(emp.id)}
                          onCheckedChange={() => {
                            setSelectedToAdd(prev => 
                              prev.includes(emp.id) 
                                ? prev.filter(id => id !== emp.id)
                                : [...prev, emp.id]
                            );
                          }}
                        />
                      </td>
                      <td className="p-2 text-sm">{emp.employee_code}</td>
                      <td className="p-2 text-sm">{emp.full_name}</td>
                      <td className="p-2 text-sm text-muted-foreground">{emp.department || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DialogFooter className="mt-4">
             <Button variant="outline" onClick={() => setShowAddDialog(false)}>
               {t('common.cancel')}
             </Button>
             <Button 
               onClick={handleConfirmAdd} 
               disabled={selectedToAdd.length === 0 || !addEffectiveDate || isCreating}
             >
               {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               {t('common.add')} {selectedToAdd.length > 0 && `(${selectedToAdd.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
