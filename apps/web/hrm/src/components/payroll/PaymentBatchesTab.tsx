import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Plus,
  Trash2,
  MoreHorizontal,
  DollarSign,
  CheckCircle2,
  Clock,
  Eye,
  ArrowLeft,
  Download,
  CreditCard,
  Banknote,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePaymentBatches, PaymentBatch, PaymentRecord } from '@/hooks/usePaymentBatches';
import { usePayrollBatches } from '@/hooks/usePayrollBatches';
import { toast } from 'sonner';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export function PaymentBatchesTab() {
  const { t } = useTranslation();
  const {
    batches,
    isLoading,
    fetchBatchRecords,
    createBatch,
    updateBatch,
    deleteBatch,
    processPayment,
    isCreating,
  } = usePaymentBatches();

  const { batches: payrollBatches } = usePayrollBatches();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<PaymentBatch | null>(null);
  const [batchRecords, setBatchRecords] = useState<PaymentRecord[]>([]);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<PaymentBatch | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    salary_period: '',
    payroll_batch_id: '',
    payment_method: 'bank_transfer' as 'bank_transfer' | 'cash' | 'check',
    department: '',
  });

  useEffect(() => {
    if (selectedBatch) {
      fetchBatchRecords(selectedBatch.id).then(setBatchRecords);
    }
  }, [selectedBatch]);

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const lockedPayrollBatches = payrollBatches.filter(b => 
    b.status === 'locked' || b.status === 'approved'
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success hover:bg-success/20">{t('payment.statusCompleted')}</Badge>;
      case 'partial':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">{t('payment.statusPartial')}</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">{t('payment.statusPending')}</Badge>;
      case 'cancelled':
        return <Badge className="bg-muted text-muted-foreground">{t('payment.statusCancelled')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return <Badge variant="outline" className="gap-1"><CreditCard className="w-3 h-3" />{t('payment.bankTransfer')}</Badge>;
      case 'cash':
        return <Badge variant="outline" className="gap-1"><Banknote className="w-3 h-3" />{t('payment.cash')}</Badge>;
      case 'check':
        return <Badge variant="outline">{t('payment.check')}</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  const handleCreateBatch = async () => {
    if (!formData.name) {
      toast.error(t('payment.pleaseEnterName'));
      return;
    }

    try {
      await createBatch({
        name: formData.name,
        salary_period: formData.salary_period,
        payroll_batch_id: formData.payroll_batch_id || undefined,
        payment_method: formData.payment_method,
        department: formData.department || undefined,
      });
      setShowAddDialog(false);
      setFormData({ name: '', salary_period: '', payroll_batch_id: '', payment_method: 'bank_transfer', department: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteBatch = async () => {
    if (!batchToDelete) return;
    try {
      await deleteBatch(batchToDelete.id);
      setShowDeleteDialog(false);
      setBatchToDelete(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAsPaid = async (recordId: string) => {
    if (!selectedBatch) return;
    try {
      await processPayment({
        recordId,
        batchId: selectedBatch.id,
        transactionRef: `TXN-${Date.now()}`,
      });
      const updatedRecords = await fetchBatchRecords(selectedBatch.id);
      setBatchRecords(updatedRecords);
    } catch (error) {
      console.error(error);
    }
  };

  const stats = {
    total: batches.length,
    pending: batches.filter(b => b.status === 'pending').length,
    completed: batches.filter(b => b.status === 'completed').length,
    totalAmount: batches.reduce((sum, b) => sum + (b.total_amount || 0), 0),
  };

  // Detail view
  if (selectedBatch) {
    const pendingRecords = batchRecords.filter(r => r.status === 'pending');
    const paidRecords = batchRecords.filter(r => r.status === 'paid');

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedBatch(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold">{selectedBatch.name}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedBatch.salary_period} • {getPaymentMethodBadge(selectedBatch.payment_method)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(selectedBatch.status)}
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {t('payment.exportList')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{t('payment.totalPayment')}</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(selectedBatch.total_amount || 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{t('payment.paidAmount')}</p>
              <p className="text-xl font-bold text-success">{formatCurrency(selectedBatch.paid_amount || 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{t('payment.unpaidAmount')}</p>
              <p className="text-xl font-bold text-amber-600">{formatCurrency((selectedBatch.total_amount || 0) - (selectedBatch.paid_amount || 0))}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{t('payment.progress')}</p>
              <p className="text-xl font-bold">{paidRecords.length}/{batchRecords.length} {t('payment.employees')}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{t('payment.paymentDetails')}</h3>
              {pendingRecords.length > 0 && (
                <Button size="sm">
                  <Send className="w-4 h-4 mr-2" />
                  {t('payment.payAll')} ({pendingRecords.length})
                </Button>
              )}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('payment.empCode')}</TableHead>
                  <TableHead>{t('payment.fullName')}</TableHead>
                  <TableHead>{t('payment.department')}</TableHead>
                  <TableHead>{t('payment.bank')}</TableHead>
                  <TableHead>{t('payment.accountNumber')}</TableHead>
                  <TableHead className="text-right">{t('payment.amount')}</TableHead>
                  <TableHead>{t('common.status.label')}</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batchRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {t('payment.noEmployeesInBatch')}
                    </TableCell>
                  </TableRow>
                ) : (
                  batchRecords.map(record => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.employee_code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {record.employee_name.split(' ').pop()?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {record.employee_name}
                        </div>
                      </TableCell>
                      <TableCell>{record.department || '-'}</TableCell>
                      <TableCell>{record.bank_name || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{record.bank_account || '-'}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(record.amount)}</TableCell>
                      <TableCell>
                        {record.status === 'paid' ? (
                          <Badge className="bg-success/10 text-success">{t('payment.recordPaid')}</Badge>
                        ) : record.status === 'failed' ? (
                          <Badge variant="destructive">{t('payment.recordFailed')}</Badge>
                        ) : (
                          <Badge variant="secondary">{t('payment.statusPending')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.status === 'pending' && (
                          <Button variant="ghost" size="sm" onClick={() => handleMarkAsPaid(record.id)}>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            {t('payment.confirm')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // List view
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg"><CreditCard className="w-5 h-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">{t('payment.totalBatches')}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">{t('payment.statusPending')}</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">{t('payment.statusCompleted')}</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg"><DollarSign className="w-5 h-5 text-purple-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">{t('payment.totalPaid')}</p>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('payment.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder={t('common.status.label')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="pending">{t('payment.statusPending')}</SelectItem>
              <SelectItem value="partial">{t('payment.statusPartial')}</SelectItem>
              <SelectItem value="completed">{t('payment.statusCompleted')}</SelectItem>
              <SelectItem value="cancelled">{t('payment.statusCancelled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('payment.createBatch')}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedBatches.length === filteredBatches.length && filteredBatches.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) { setSelectedBatches(filteredBatches.map(b => b.id)); } else { setSelectedBatches([]); }
                    }}
                  />
                </TableHead>
                <TableHead>{t('payment.createdDate')}</TableHead>
                <TableHead>{t('payment.batchName')}</TableHead>
                <TableHead>{t('payment.salaryPeriod')}</TableHead>
                <TableHead>{t('payment.method')}</TableHead>
                <TableHead className="text-center">{t('payment.empCount')}</TableHead>
                <TableHead className="text-right">{t('payment.totalAmount')}</TableHead>
                <TableHead>{t('common.status.label')}</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">{t('common.loading')}</TableCell>
                </TableRow>
              ) : filteredBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">{t('payment.noBatches')}</TableCell>
                </TableRow>
              ) : (
                filteredBatches.map(batch => (
                  <TableRow key={batch.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedBatch(batch)}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedBatches.includes(batch.id)}
                        onCheckedChange={(checked) => {
                          if (checked) { setSelectedBatches(prev => [...prev, batch.id]); } else { setSelectedBatches(prev => prev.filter(id => id !== batch.id)); }
                        }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(batch.created_at)}</TableCell>
                    <TableCell className="font-medium">{batch.name}</TableCell>
                    <TableCell>{batch.salary_period}</TableCell>
                    <TableCell>{getPaymentMethodBadge(batch.payment_method)}</TableCell>
                    <TableCell className="text-center">{batch.employee_count || 0}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(batch.total_amount || 0)}</TableCell>
                    <TableCell>{getStatusBadge(batch.status)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedBatch(batch)}>
                            <Eye className="w-4 h-4 mr-2" />{t('common.view')}
                          </DropdownMenuItem>
                          {batch.status === 'pending' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setBatchToDelete(batch); setShowDeleteDialog(true); }}>
                                <Trash2 className="w-4 h-4 mr-2" />{t('common.delete')}
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
            <DialogTitle>{t('payment.createPaymentBatch')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('payment.batchName')} <span className="text-destructive">*</span></Label>
              <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder={t('payment.batchNamePlaceholder')} />
            </div>
            <div className="space-y-2">
              <Label>{t('payment.selectPayroll')}</Label>
              <Select 
                value={formData.payroll_batch_id} 
                onValueChange={(val) => {
                  const batch = lockedPayrollBatches.find(b => b.id === val);
                  setFormData(prev => ({ ...prev, payroll_batch_id: val, salary_period: batch?.salary_period || '' }));
                }}
              >
                <SelectTrigger><SelectValue placeholder={t('payment.selectLockedPayroll')} /></SelectTrigger>
                <SelectContent>
                  {lockedPayrollBatches.map(batch => (
                    <SelectItem key={batch.id} value={batch.id}>{batch.name} - {formatCurrency(batch.total_net || 0)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('payment.salaryPeriod')}</Label>
              <Input value={formData.salary_period} onChange={(e) => setFormData(prev => ({ ...prev, salary_period: e.target.value }))} placeholder={t('payment.salaryPeriodPlaceholder')} />
            </div>
            <div className="space-y-2">
              <Label>{t('payment.paymentMethod')}</Label>
              <Select value={formData.payment_method} onValueChange={(val: 'bank_transfer' | 'cash' | 'check') => setFormData(prev => ({ ...prev, payment_method: val }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">{t('payment.bankTransfer')}</SelectItem>
                  <SelectItem value="cash">{t('payment.cash')}</SelectItem>
                  <SelectItem value="check">{t('payment.check')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleCreateBatch} disabled={isCreating}>
              {isCreating ? t('payment.creating') : t('payment.createBatch')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              {t('payment.confirmDelete')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              {t('payment.deleteConfirmMsg', { name: batchToDelete?.name })}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={handleDeleteBatch}>{t('common.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
