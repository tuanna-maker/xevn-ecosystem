import { useState, useEffect } from 'react';
import { useDepartments } from '@/hooks/useDepartments';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdvanceRequests, AdvanceRequest, AdvanceRequestEmployee, ApprovalStep } from '@/hooks/useAdvanceRequests';
import { useEmployees } from '@/hooks/useEmployees';
import { toast } from 'sonner';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export function AdvanceRequestsTab() {
  const { t } = useTranslation();
  const a = (key: string, opts?: Record<string, unknown>) => t(`advance.${key}`, opts);
  const { departments } = useDepartments();
  const {
    requests,
    isLoading,
    fetchRequestEmployees,
    createRequest,
    updateRequest,
    deleteRequest,
    updateApproval,
    addEmployee,
    removeEmployee,
    isCreating,
  } = useAdvanceRequests();

  const { employees } = useEmployees();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AdvanceRequest | null>(null);
  const [requestEmployees, setRequestEmployees] = useState<AdvanceRequestEmployee[]>([]);
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<AdvanceRequest | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalNote, setApprovalNote] = useState('');
  const [approvalLevel, setApprovalLevel] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    salary_period: `${a('monthPrefix')}${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
    department: '',
    position: '',
  });

  // Add employee state
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedEmployeesToAdd, setSelectedEmployeesToAdd] = useState<string[]>([]);
  const [advanceAmounts, setAdvanceAmounts] = useState<Record<string, number>>({});

  // Load employees when viewing request detail
  useEffect(() => {
    if (selectedRequest) {
      fetchRequestEmployees(selectedRequest.id).then(setRequestEmployees);
    }
  }, [selectedRequest]);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredEmployeesToAdd = employees.filter(emp => {
    const matchesSearch = emp.full_name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(employeeSearchTerm.toLowerCase());
    const alreadyAdded = requestEmployees.some(re => re.employee_id === emp.id);
    return matchesSearch && !alreadyAdded && emp.status === 'active';
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success/10 text-success hover:bg-success/20">{a('statusPaid')}</Badge>;
      case 'approved':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{a('statusApproved')}</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">{a('statusPending')}</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">{a('statusRejected')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getApprovalStepBadge = (status: ApprovalStep['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success/10 text-success hover:bg-success/20 text-xs">{a('statusApproved')}</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs">{a('statusRejected')}</Badge>;
      case 'pending':
        return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80 text-xs">{a('statusPending')}</Badge>;
    }
  };

  const handleCreateRequest = async () => {
    if (!formData.name || !formData.salary_period) {
      toast.error(t('common.fillAllFields'));
      return;
    }

    const defaultApprovalSteps: ApprovalStep[] = [
      { level: 1, title: a('deptHead'), approverName: '', approverPosition: a('hrHead'), status: 'pending' },
      { level: 2, title: a('chiefAccountant'), approverName: '', approverPosition: a('chiefAccountant'), status: 'pending' },
      { level: 3, title: a('director'), approverName: '', approverPosition: a('director'), status: 'pending' },
    ];

    try {
      await createRequest({
        ...formData,
        approval_steps: defaultApprovalSteps,
      });
      setShowAddDialog(false);
      setFormData({
        name: '',
        salary_period: `${a('monthPrefix')}${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
        department: '',
        position: '',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;
    try {
      await deleteRequest(requestToDelete.id);
      setShowDeleteDialog(false);
      setRequestToDelete(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleApproval = async () => {
    if (!selectedRequest) return;
    try {
      await updateApproval({
        id: selectedRequest.id,
        level: approvalLevel,
        action: approvalAction,
        approverName: a('currentUser'),
        note: approvalNote,
      });
      setShowApprovalDialog(false);
      setApprovalNote('');
      const updated = requests.find(r => r.id === selectedRequest.id);
      if (updated) setSelectedRequest(updated);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddEmployees = async () => {
    if (!selectedRequest || selectedEmployeesToAdd.length === 0) return;

    try {
      for (const empId of selectedEmployeesToAdd) {
        const emp = employees.find(e => e.id === empId);
        if (!emp) continue;

        await addEmployee({
          company_id: emp.company_id,
          request_id: selectedRequest.id,
          employee_id: emp.id,
          employee_code: emp.employee_code,
          employee_name: emp.full_name,
          department: emp.department || null,
          position: emp.position || null,
          advance_amount: advanceAmounts[empId] || 0,
          note: null,
        });
      }
      
      const updatedEmployees = await fetchRequestEmployees(selectedRequest.id);
      setRequestEmployees(updatedEmployees);
      
      setShowAddEmployeeDialog(false);
      setSelectedEmployeesToAdd([]);
      setAdvanceAmounts({});
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveEmployee = async (empId: string) => {
    if (!selectedRequest) return;
    try {
      await removeEmployee({ id: empId, requestId: selectedRequest.id });
      setRequestEmployees(prev => prev.filter(e => e.id !== empId));
    } catch (error) {
      console.error(error);
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    totalAmount: requests.reduce((sum, r) => sum + (r.total_amount || 0), 0),
  };

  // Detail view
  if (selectedRequest) {
    const currentStep = selectedRequest.approval_steps?.find(
      s => s.status === 'pending' && s.level === (selectedRequest.current_approval_level || 1)
    );

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedRequest(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold">{selectedRequest.name}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedRequest.salary_period} • {selectedRequest.department || a('allUnits')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(selectedRequest.status)}
            {selectedRequest.status === 'pending' && currentStep && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Send className="w-4 h-4 mr-2" />
                    {a('approve')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setApprovalLevel(currentStep.level);
                    setApprovalAction('approve');
                    setShowApprovalDialog(true);
                  }}>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
                    {a('approveBtn')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setApprovalLevel(currentStep.level);
                    setApprovalAction('reject');
                    setShowApprovalDialog(true);
                  }}>
                    <XCircle className="w-4 h-4 mr-2 text-destructive" />
                    {a('rejectBtn')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Approval Steps */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">{a('approvalProcess')}</h3>
            <div className="flex items-center gap-4">
              {selectedRequest.approval_steps?.map((step, index) => (
                <div key={step.level} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.status === 'approved' ? 'bg-success/10 text-success' :
                      step.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {step.status === 'approved' ? <CheckCircle2 className="w-5 h-5" /> :
                       step.status === 'rejected' ? <XCircle className="w-5 h-5" /> :
                       <Clock className="w-5 h-5" />}
                    </div>
                    <p className="text-xs mt-1 font-medium">{step.title}</p>
                    {step.approverName && (
                      <p className="text-xs text-muted-foreground">{step.approverName}</p>
                    )}
                  </div>
                  {index < (selectedRequest.approval_steps?.length || 0) - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      step.status === 'approved' ? 'bg-success' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">
                {a('employeeList')} ({requestEmployees.length})
              </h3>
              {selectedRequest.status === 'pending' && (
                <Button size="sm" onClick={() => setShowAddEmployeeDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {a('addEmployee')}
                </Button>
              )}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{a('empCode')}</TableHead>
                  <TableHead>{a('fullName')}</TableHead>
                  <TableHead>{a('department')}</TableHead>
                  <TableHead>{a('position')}</TableHead>
                  <TableHead className="text-right">{a('advanceAmount')}</TableHead>
                  <TableHead>{a('note')}</TableHead>
                  {selectedRequest.status === 'pending' && <TableHead className="w-10"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {a('noEmployees')}
                    </TableCell>
                  </TableRow>
                ) : (
                  requestEmployees.map(emp => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.employee_code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {emp.employee_name.split(' ').pop()?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {emp.employee_name}
                        </div>
                      </TableCell>
                      <TableCell>{emp.department || '-'}</TableCell>
                      <TableCell>{emp.position || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(emp.advance_amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{emp.note || '-'}</TableCell>
                      {selectedRequest.status === 'pending' && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveEmployee(emp.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {requestEmployees.length > 0 && (
              <div className="flex justify-end mt-4 pt-4 border-t">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{a('total')}</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(requestEmployees.reduce((sum, e) => sum + e.advance_amount, 0))}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Employee Dialog */}
        <Dialog open={showAddEmployeeDialog} onOpenChange={setShowAddEmployeeDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{a('addEmployeeToAdvance')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={a('searchEmployee')}
                  value={employeeSearchTerm}
                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="max-h-64 overflow-y-auto border rounded-lg">
                {filteredEmployeesToAdd.map(emp => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-3 p-3 border-b last:border-0 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedEmployeesToAdd.includes(emp.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEmployeesToAdd(prev => [...prev, emp.id]);
                        } else {
                          setSelectedEmployeesToAdd(prev => prev.filter(id => id !== emp.id));
                        }
                      }}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {emp.full_name.split(' ').pop()?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{emp.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {emp.employee_code} • {emp.department}
                      </p>
                    </div>
                    <div className="w-40">
                      <Input
                        type="number"
                        placeholder={a('amountPlaceholder')}
                        value={advanceAmounts[emp.id] || ''}
                        onChange={(e) => setAdvanceAmounts(prev => ({
                          ...prev,
                          [emp.id]: parseFloat(e.target.value) || 0
                        }))}
                        disabled={!selectedEmployeesToAdd.includes(emp.id)}
                      />
                    </div>
                  </div>
                ))}
                {filteredEmployeesToAdd.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    {a('noMatchingEmployee')}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddEmployeeDialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={handleAddEmployees}
                disabled={selectedEmployeesToAdd.length === 0}
              >
                {a('addCount', { count: selectedEmployeesToAdd.length })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approval Dialog */}
        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {approvalAction === 'approve' ? a('approveAdvanceTitle') : a('rejectAdvanceTitle')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{a('note')}</Label>
                <Textarea
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder={approvalAction === 'approve' ? a('noteOptional') : a('rejectReason')}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                variant={approvalAction === 'approve' ? 'default' : 'destructive'}
                onClick={handleApproval}
              >
                {approvalAction === 'approve' ? a('approveBtn') : a('rejectBtn')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // List view
  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{a('totalAdvance')}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{a('statusPending')}</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
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
                <p className="text-sm text-muted-foreground">{a('statusApproved')}</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{a('totalAdvanceAmount')}</p>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={a('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('common.status.label')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="pending">{a('statusPending')}</SelectItem>
              <SelectItem value="approved">{a('statusApproved')}</SelectItem>
              <SelectItem value="paid">{a('statusPaid')}</SelectItem>
              <SelectItem value="rejected">{a('statusRejected')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {a('createAdvance')}
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRequests(filteredRequests.map(r => r.id));
                      } else {
                        setSelectedRequests([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>{a('createdDate')}</TableHead>
                <TableHead>{a('advanceName')}</TableHead>
                <TableHead>{a('salaryPeriod')}</TableHead>
                <TableHead>{a('unit')}</TableHead>
                <TableHead className="text-center">{a('empCount')}</TableHead>
                <TableHead className="text-right">{a('totalMoney')}</TableHead>
                <TableHead>{t('common.status.label')}</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {a('noAdvance')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map(request => (
                  <TableRow 
                    key={request.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRequests.includes(request.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRequests(prev => [...prev, request.id]);
                          } else {
                            setSelectedRequests(prev => prev.filter(id => id !== request.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(request.created_at)}</TableCell>
                    <TableCell className="font-medium">{request.name}</TableCell>
                    <TableCell>{request.salary_period}</TableCell>
                    <TableCell>{request.department || t('common.all')}</TableCell>
                    <TableCell className="text-center">{request.employee_count || 0}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(request.total_amount || 0)}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedRequest(request)}>
                            <Users className="w-4 h-4 mr-2" />
                            {t('common.view')}
                          </DropdownMenuItem>
                          {request.status === 'pending' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setRequestToDelete(request);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t('common.delete')}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{a('createNewAdvance')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{a('advanceName')} <span className="text-destructive">*</span></Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={a('advanceNamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{a('salaryPeriod')} <span className="text-destructive">*</span></Label>
              <Input
                value={formData.salary_period}
                onChange={(e) => setFormData(prev => ({ ...prev, salary_period: e.target.value }))}
                placeholder={a('salaryPeriodPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{a('unit')}</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={a('unitPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreateRequest} disabled={isCreating}>
              {isCreating ? a('creating') : a('createAdvance')}
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
              {a('confirmDelete')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              {a('deleteMsg', { name: requestToDelete?.name })}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {a('cannotUndo')}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteRequest}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
