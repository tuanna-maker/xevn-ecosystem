import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Pencil, Trash2, Settings, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
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
import { useInsurancePolicyParticipants, InsurancePolicyFormData } from '@/hooks/useInsurancePolicyParticipants';
import { useEmployees } from '@/hooks/useEmployees';
import { format } from 'date-fns';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

// getInsuranceTypeName moved inside component to use t()

// getStatusBadge moved inside component

export function InsurancePolicyTab() {
  const { t } = useTranslation();
  const { participants, isLoading, createManyParticipants, deleteParticipant, toggleStatus, isCreating } = useInsurancePolicyParticipants();
  const { employees } = useEmployees();

  const getInsuranceTypeName = (type: string) => {
    switch (type) {
      case 'social': return t('insurance.social', 'BHXH');
      case 'health': return t('insurance.health', 'BHYT');
      case 'unemployment': return t('insurance.unemployment', 'BHTN');
      case 'all': return t('insurance.all', 'Full');
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-primary text-primary-foreground">{t('insurance.participating', 'Active')}</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">{t('insurance.notParticipating', 'Inactive')}</Badge>;
      case 'expired':
        return <Badge variant="destructive">{t('insurance.expired', 'Expired')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'participants' | 'pending' | 'settings'>('participants');
  const [showDateFilter, setShowDateFilter] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'effective-date' | 'employee-id-asc' | 'employee-id-desc'>('newest');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [insuranceTypeFilter, setInsuranceTypeFilter] = useState<'all' | 'social' | 'health' | 'unemployment'>('all');
  
  // Add participant dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [addDepartmentFilter, setAddDepartmentFilter] = useState('all');
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [addInsuranceType, setAddInsuranceType] = useState<'social' | 'health' | 'unemployment' | 'all'>('all');
  const [addEffectiveDate, setAddEffectiveDate] = useState('');
  const [addBaseSalary, setAddBaseSalary] = useState('');

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

    // Insurance type filter
    if (insuranceTypeFilter !== 'all') {
      result = result.filter(p => p.insurance_type === insuranceTypeFilter || p.insurance_type === 'all');
    }

    // Sort
    switch (sortOrder) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'effective-date':
        result.sort((a, b) => {
          const dateA = a.effective_date ? new Date(a.effective_date).getTime() : 0;
          const dateB = b.effective_date ? new Date(b.effective_date).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'employee-id-asc':
        result.sort((a, b) => a.employee_code.localeCompare(b.employee_code));
        break;
      case 'employee-id-desc':
        result.sort((a, b) => b.employee_code.localeCompare(a.employee_code));
        break;
    }

    return result;
  }, [participants, searchQuery, statusFilter, insuranceTypeFilter, sortOrder]);

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
    if (selectedToAdd.length === 0) return;

    const baseSalaryValue = parseFloat(addBaseSalary) || 0;

    const itemsToAdd: InsurancePolicyFormData[] = selectedToAdd.map(empId => {
      const emp = employees.find(e => e.id === empId);
      if (!emp) throw new Error('Employee not found');

      return {
        employee_id: emp.id,
        employee_code: emp.employee_code,
        employee_name: emp.full_name,
        position: emp.position || undefined,
        department: emp.department || undefined,
        insurance_type: addInsuranceType,
        base_salary: baseSalaryValue,
        effective_date: addEffectiveDate || undefined,
        status: 'active',
        social_insurance_rate: addInsuranceType === 'all' || addInsuranceType === 'social' ? 8 : undefined,
        health_insurance_rate: addInsuranceType === 'all' || addInsuranceType === 'health' ? 1.5 : undefined,
        unemployment_insurance_rate: addInsuranceType === 'all' || addInsuranceType === 'unemployment' ? 1 : undefined,
      };
    });

    await createManyParticipants(itemsToAdd);
    setShowAddDialog(false);
    setSelectedToAdd([]);
    setAddSearch('');
    setAddDepartmentFilter('all');
    setAddInsuranceType('all');
    setAddEffectiveDate('');
    setAddBaseSalary('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa người tham gia này?')) {
      await deleteParticipant(id);
    }
  };

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
            <h1 className="text-2xl font-bold">Chính sách bảo hiểm</h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm người tham gia"
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-primary gap-2">
                    Thêm người tham gia
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border shadow-lg z-50">
                  <DropdownMenuItem onClick={() => setShowAddDialog(true)}>
                    Thêm từ danh sách nhân viên
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Nhập từ Excel
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
              NGƯỜI THAM GIA
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
              CHỜ XỬ LÝ
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
              CÀI ĐẶT
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
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">NHÂN SỰ</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">LOẠI BẢO HIỂM</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">SỐ BẢO HIỂM</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">MỨC ĐÓNG</th>
                  <th className="p-3 text-center text-xs font-medium text-muted-foreground">TRẠNG THÁI</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground">NGƯỜI TẠO</th>
                  <th className="p-3 text-center text-xs font-medium text-muted-foreground w-24"></th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                      Chưa có người tham gia bảo hiểm
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
                          <p className="text-sm font-medium">{getInsuranceTypeName(participant.insurance_type)}</p>
                          <p className="text-xs text-muted-foreground">
                            {participant.effective_date ? `${t('insurance.from', 'From')} ${format(new Date(participant.effective_date), 'dd/MM/yyyy')}` : t('insurance.notSet', 'Not set')}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {participant.social_insurance_number && (
                            <p className="text-xs"><span className="text-muted-foreground">BHXH:</span> {participant.social_insurance_number}</p>
                          )}
                          {participant.health_insurance_number && (
                            <p className="text-xs"><span className="text-muted-foreground">BHYT:</span> {participant.health_insurance_number}</p>
                          )}
                          {!participant.social_insurance_number && !participant.health_insurance_number && (
                            <p className="text-xs text-muted-foreground">Chưa có</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <p className="font-medium">{formatCurrency(participant.base_salary)}</p>
                      </td>
                      <td className="p-3 text-center">
                        {getStatusBadge(participant.status)}
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm">{participant.created_by || 'Hệ thống'}</p>
                          <p className="text-xs text-muted-foreground">{participant.created_by_position || ''}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1">
                              Sửa
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border shadow-lg z-50">
                            <DropdownMenuItem onClick={() => toggleStatus(participant.id)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              {participant.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(participant.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa
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
                Hiển thị kết quả 1 - {filteredParticipants.length} của {filteredParticipants.length}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="flex-1 flex items-center justify-center">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Không có yêu cầu nào đang chờ xử lý</p>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 flex items-center justify-center">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Cài đặt chính sách bảo hiểm đang được phát triển</p>
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
              <span>NGÀY ÁP DỤNG</span>
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
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">THỨ TỰ HIỂN THỊ</h4>
          <RadioGroup value={sortOrder} onValueChange={(v) => setSortOrder(v as typeof sortOrder)} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="newest" id="ins-sort-newest" />
              <Label htmlFor="ins-sort-newest" className="font-normal cursor-pointer text-sm">Mới tạo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="effective-date" id="ins-sort-effective" />
              <Label htmlFor="ins-sort-effective" className="font-normal cursor-pointer text-sm">Ngày hiệu lực</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="employee-id-asc" id="ins-sort-id-asc" />
              <Label htmlFor="ins-sort-id-asc" className="font-normal cursor-pointer text-sm flex items-center gap-1">
                ID nhân viên <ArrowUp className="w-3 h-3" />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="employee-id-desc" id="ins-sort-id-desc" />
              <Label htmlFor="ins-sort-id-desc" className="font-normal cursor-pointer text-sm flex items-center gap-1">
                ID nhân viên <ArrowDown className="w-3 h-3" />
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Trạng thái tham gia */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">TRẠNG THÁI THAM GIA</h4>
          <RadioGroup value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="ins-status-all" />
              <Label htmlFor="ins-status-all" className="font-normal cursor-pointer text-sm">Tất cả</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="active" id="ins-status-active" />
              <Label htmlFor="ins-status-active" className="font-normal cursor-pointer text-sm">Đang tham gia</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="inactive" id="ins-status-inactive" />
              <Label htmlFor="ins-status-inactive" className="font-normal cursor-pointer text-sm">Không tham gia</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="expired" id="ins-status-expired" />
              <Label htmlFor="ins-status-expired" className="font-normal cursor-pointer text-sm">Hết hạn</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Loại bảo hiểm */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">LOẠI BẢO HIỂM</h4>
          <RadioGroup value={insuranceTypeFilter} onValueChange={(v) => setInsuranceTypeFilter(v as typeof insuranceTypeFilter)} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="ins-type-all" />
              <Label htmlFor="ins-type-all" className="font-normal cursor-pointer text-sm">Tất cả</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="social" id="ins-type-social" />
              <Label htmlFor="ins-type-social" className="font-normal cursor-pointer text-sm">BHXH</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="health" id="ins-type-health" />
              <Label htmlFor="ins-type-health" className="font-normal cursor-pointer text-sm">BHYT</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unemployment" id="ins-type-unemployment" />
              <Label htmlFor="ins-type-unemployment" className="font-normal cursor-pointer text-sm">BHTN</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Add Participant Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Thêm người tham gia bảo hiểm</DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm nhân viên..."
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
              />
            </div>
            <Select value={addDepartmentFilter} onValueChange={setAddDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phòng ban</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Label>Loại bảo hiểm</Label>
              <Select value={addInsuranceType} onValueChange={(v) => setAddInsuranceType(v as typeof addInsuranceType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Bảo hiểm đầy đủ</SelectItem>
                  <SelectItem value="social">BHXH</SelectItem>
                  <SelectItem value="health">BHYT</SelectItem>
                  <SelectItem value="unemployment">BHTN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ngày hiệu lực</Label>
              <Input
                type="date"
                value={addEffectiveDate}
                onChange={(e) => setAddEffectiveDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Mức đóng (VND)</Label>
              <Input
                type="number"
                placeholder="15000000"
                value={addBaseSalary}
                onChange={(e) => setAddBaseSalary(e.target.value)}
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
                  <th className="p-2 text-left text-xs font-medium text-muted-foreground">Mã NV</th>
                  <th className="p-2 text-left text-xs font-medium text-muted-foreground">Họ tên</th>
                  <th className="p-2 text-left text-xs font-medium text-muted-foreground">Phòng ban</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployeesToAdd.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      Không có nhân viên phù hợp
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
              Hủy
            </Button>
            <Button 
              onClick={handleConfirmAdd} 
              disabled={selectedToAdd.length === 0 || isCreating}
            >
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Thêm {selectedToAdd.length > 0 && `(${selectedToAdd.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
