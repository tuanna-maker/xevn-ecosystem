import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  Gift, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar,
  Briefcase,
  Car,
  Home,
  Phone,
  Utensils,
  GraduationCap,
  Heart,
  Baby,
  Award,
  Target,
  ChevronRight,
  Info,
  BarChart3,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface EmployeeSalaryProps {
  employeeId: string;
  employeeName: string;
}

// Mock data for salary
const mockSalaryData = {
  baseSalary: 15000000,
  grossSalary: 22500000,
  netSalary: 19800000,
  effectiveDate: '2024-01-01',
  salaryGrade: 'Bậc 5',
  salaryCoefficient: 2.34,
};

const mockAllowances = [
  { id: '1', name: 'position_allowance', type: 'position', amount: 3000000, isFixed: true, effectiveDate: '2024-01-01' },
  { id: '2', name: 'transport_allowance', type: 'transport', amount: 1500000, isFixed: true, effectiveDate: '2024-01-01' },
  { id: '3', name: 'phone_allowance', type: 'phone', amount: 500000, isFixed: true, effectiveDate: '2024-01-01' },
  { id: '4', name: 'meal_allowance', type: 'meal', amount: 1000000, isFixed: true, effectiveDate: '2024-01-01' },
  { id: '5', name: 'housing_allowance', type: 'housing', amount: 1500000, isFixed: false, effectiveDate: '2024-01-01' },
];

const mockSalaryHistory = [
  { id: '1', effectiveDate: '2024-01-01', baseSalary: 15000000, reason: 'periodic_adjustment', approvedBy: 'Nguyễn Văn A' },
  { id: '2', effectiveDate: '2023-07-01', baseSalary: 13500000, reason: 'promotion', approvedBy: 'Nguyễn Văn A' },
  { id: '3', effectiveDate: '2023-01-01', baseSalary: 12000000, reason: 'periodic_adjustment', approvedBy: 'Trần Văn B' },
  { id: '4', effectiveDate: '2022-06-01', baseSalary: 10000000, reason: 'starting_salary', approvedBy: 'Trần Văn B' },
];

const mockMonthlyPayroll = [
  { id: '1', month: '01/2025', baseSalary: 15000000, allowances: 7500000, bonus: 2000000, deductions: 2200000, netSalary: 22300000, status: 'paid', payDate: '2025-01-05' },
  { id: '2', month: '12/2024', baseSalary: 15000000, allowances: 7500000, bonus: 5000000, deductions: 2200000, netSalary: 25300000, status: 'paid', payDate: '2024-12-05' },
  { id: '3', month: '11/2024', baseSalary: 15000000, allowances: 7500000, bonus: 1500000, deductions: 2200000, netSalary: 21800000, status: 'paid', payDate: '2024-11-05' },
  { id: '4', month: '10/2024', baseSalary: 15000000, allowances: 7500000, bonus: 1000000, deductions: 2200000, netSalary: 21300000, status: 'paid', payDate: '2024-10-05' },
  { id: '5', month: '09/2024', baseSalary: 15000000, allowances: 7500000, bonus: 2500000, deductions: 2200000, netSalary: 22800000, status: 'paid', payDate: '2024-09-05' },
  { id: '6', month: '08/2024', baseSalary: 15000000, allowances: 7500000, bonus: 1000000, deductions: 2200000, netSalary: 21300000, status: 'paid', payDate: '2024-08-05' },
  { id: '7', month: '07/2024', baseSalary: 13500000, allowances: 7500000, bonus: 3000000, deductions: 2000000, netSalary: 22000000, status: 'paid', payDate: '2024-07-05' },
  { id: '8', month: '06/2024', baseSalary: 13500000, allowances: 7500000, bonus: 1000000, deductions: 2000000, netSalary: 20000000, status: 'paid', payDate: '2024-06-05' },
  { id: '9', month: '05/2024', baseSalary: 13500000, allowances: 7500000, bonus: 1500000, deductions: 2000000, netSalary: 20500000, status: 'paid', payDate: '2024-05-05' },
  { id: '10', month: '04/2024', baseSalary: 13500000, allowances: 7500000, bonus: 2000000, deductions: 2000000, netSalary: 21000000, status: 'paid', payDate: '2024-04-05' },
  { id: '11', month: '03/2024', baseSalary: 13500000, allowances: 7500000, bonus: 1000000, deductions: 2000000, netSalary: 20000000, status: 'paid', payDate: '2024-03-05' },
  { id: '12', month: '02/2024', baseSalary: 13500000, allowances: 7500000, bonus: 8000000, deductions: 2000000, netSalary: 27000000, status: 'paid', payDate: '2024-02-05' },
];

const chartData = mockMonthlyPayroll.slice(0, 12).reverse().map(item => ({
  month: item.month,
  totalIncome: item.baseSalary + item.allowances + item.bonus,
  netSalary: item.netSalary,
  baseSalary: item.baseSalary,
  allowances: item.allowances,
  bonus: item.bonus,
}));

const ALLOWANCE_TYPE_ICONS: Record<string, any> = {
  position: Briefcase,
  transport: Car,
  housing: Home,
  phone: Phone,
  meal: Utensils,
  education: GraduationCap,
  health: Heart,
  childcare: Baby,
  performance: Award,
  target: Target,
  other: Gift,
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export function EmployeeSalary({ employeeId, employeeName }: EmployeeSalaryProps) {
  const { t } = useTranslation();
  const [allowances, setAllowances] = useState(mockAllowances);
  const [salaryHistory] = useState(mockSalaryHistory);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState<typeof mockAllowances[0] | null>(null);
  
  const [newAllowance, setNewAllowance] = useState({
    name: '',
    type: 'other',
    amount: '',
    isFixed: true,
    effectiveDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
  const totalIncome = mockSalaryData.baseSalary + totalAllowances;

  const allowanceTypeKeys = ['position', 'transport', 'housing', 'phone', 'meal', 'education', 'health', 'childcare', 'performance', 'target', 'other'];

  const getTypeIcon = (type: string) => ALLOWANCE_TYPE_ICONS[type] || Gift;
  const getTypeLabel = (type: string) => t(`salary.allowanceTypes.${type}`);

  const chartConfig = {
    totalIncome: { label: t('salary.totalIncome'), color: "hsl(var(--chart-1))" },
    netSalary: { label: t('salary.netSalary'), color: "hsl(var(--chart-2))" },
    baseSalary: { label: t('salary.baseSalary'), color: "hsl(var(--chart-3))" },
    allowances: { label: t('salary.allowances'), color: "hsl(var(--chart-4))" },
    bonus: { label: t('salary.bonus'), color: "hsl(var(--chart-5))" },
  };

  const handleAddAllowance = () => {
    if (!newAllowance.name || !newAllowance.amount) {
      toast.error(t('salary.fillAllFields'));
      return;
    }

    const allowance = {
      id: Date.now().toString(),
      name: newAllowance.name,
      type: newAllowance.type,
      amount: parseFloat(newAllowance.amount),
      isFixed: newAllowance.isFixed,
      effectiveDate: newAllowance.effectiveDate,
    };

    setAllowances([...allowances, allowance]);
    setNewAllowance({ name: '', type: 'other', amount: '', isFixed: true, effectiveDate: format(new Date(), 'yyyy-MM-dd') });
    setIsAddDialogOpen(false);
    toast.success(t('salary.addAllowanceSuccess'));
  };

  const handleEditAllowance = () => {
    if (!editingAllowance) return;
    setAllowances(allowances.map(a => a.id === editingAllowance.id ? editingAllowance : a));
    setEditingAllowance(null);
    setIsEditDialogOpen(false);
    toast.success(t('salary.updateAllowanceSuccess'));
  };

  const handleDeleteAllowance = (id: string) => {
    setAllowances(allowances.filter(a => a.id !== id));
    toast.success(t('salary.deleteAllowanceSuccess'));
  };

  const renderAllowanceForm = (data: any, onChange: (d: any) => void) => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>{t('salary.allowanceType')}</Label>
        <Select value={data.type} onValueChange={(value) => onChange({ ...data, type: value })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {allowanceTypeKeys.map((key) => {
              const Icon = ALLOWANCE_TYPE_ICONS[key] || Gift;
              return (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {t(`salary.allowanceTypes.${key}`)}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t('salary.allowanceName')}</Label>
        <Input value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })} placeholder={t('salary.allowanceNamePlaceholder')} />
      </div>
      <div className="space-y-2">
        <Label>{t('salary.amount')}</Label>
        <Input type="number" value={data.amount} onChange={(e) => onChange({ ...data, amount: e.target.value })} placeholder="2000000" />
      </div>
      <div className="space-y-2">
        <Label>{t('salary.effectiveDate')}</Label>
        <Input type="date" value={data.effectiveDate} onChange={(e) => onChange({ ...data, effectiveDate: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>{t('salary.paymentType')}</Label>
        <Select value={data.isFixed ? 'fixed' : 'variable'} onValueChange={(value) => onChange({ ...data, isFixed: value === 'fixed' })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">{t('salary.fixedMonthly')}</SelectItem>
            <SelectItem value="variable">{t('salary.variableMonthly')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border-rose-200 dark:border-rose-800">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t('salary.baseSalary')}</p>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{formatCurrency(mockSalaryData.baseSalary)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">{mockSalaryData.salaryGrade}</Badge>
                  <Badge variant="outline" className="text-xs">{t('salary.coefficient')}: {mockSalaryData.salaryCoefficient}</Badge>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t('salary.totalAllowances')}</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(totalAllowances)}</p>
                <p className="text-xs text-muted-foreground mt-2">{t('salary.allowanceCount', { count: allowances.length })}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <Gift className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t('salary.totalIncome')}</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(totalIncome)}</p>
                <p className="text-xs text-muted-foreground mt-2">{t('salary.beforeTax')}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t('salary.netSalary')}</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(mockSalaryData.netSalary)}</p>
                <p className="text-xs text-muted-foreground mt-2">{t('salary.afterTax')}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allowances List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500" />
                {t('salary.allowanceList')}
              </CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    {t('salary.addAllowance')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('salary.addNewAllowance')}</DialogTitle>
                  </DialogHeader>
                  {renderAllowanceForm(newAllowance, setNewAllowance)}
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">{t('common.cancel')}</Button>
                    </DialogClose>
                    <Button onClick={handleAddAllowance}>{t('salary.addAllowance')}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allowances.map((allowance) => {
                  const TypeIcon = getTypeIcon(allowance.type);
                  return (
                    <div key={allowance.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{allowance.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {allowance.isFixed ? t('salary.fixed') : t('salary.variable')}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t('salary.effectiveFrom')}: {format(new Date(allowance.effectiveDate), 'dd/MM/yyyy', { locale: vi })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(allowance.amount)}</p>
                        <p className="text-xs text-muted-foreground">/{t('salary.perMonth')}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingAllowance(allowance); setIsEditDialogOpen(true); }}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t('common.edit')}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteAllowance(allowance.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t('common.delete')}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  );
                })}

                {allowances.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('salary.noAllowances')}</p>
                    <p className="text-sm">{t('salary.noAllowancesHint')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Salary Adjustment History */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                {t('salary.adjustmentHistory')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salaryHistory.map((history, index) => (
                  <div key={history.id} className="relative">
                    {index !== salaryHistory.length - 1 && (
                      <div className="absolute left-4 top-10 w-0.5 h-full bg-border" />
                    )}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0 z-10">
                        <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(history.baseSalary)}</p>
                          {index === 0 && (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs">
                              {t('salary.current')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium mt-1">{history.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(history.effectiveDate), 'dd/MM/yyyy', { locale: vi })} • {history.approvedBy}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Income Chart */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            {t('salary.incomeChart12Months')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBaseSalary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="colorAllowances" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#d97706" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="colorBonus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} className="fill-muted-foreground" />
              <ChartTooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
              <Bar dataKey="baseSalary" stackId="income" fill="url(#colorBaseSalary)" name={t('salary.baseSalary')} radius={[0, 0, 0, 0]} />
              <Bar dataKey="allowances" stackId="income" fill="url(#colorAllowances)" name={t('salary.allowances')} radius={[0, 0, 0, 0]} />
              <Bar dataKey="bonus" stackId="income" fill="url(#colorBonus)" name={t('salary.bonus')} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
          
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-blue-500 to-blue-700" />
              <span className="text-sm text-muted-foreground">{t('salary.baseSalary')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-amber-500 to-amber-600" />
              <span className="text-sm text-muted-foreground">{t('salary.allowances')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-emerald-500 to-emerald-600" />
              <span className="text-sm text-muted-foreground">{t('salary.bonus')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Payroll History */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-500" />
            {t('salary.monthlyPayrollHistory')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">{t('salary.month')}</TableHead>
                  <TableHead className="font-semibold text-right">{t('salary.baseSalary')}</TableHead>
                  <TableHead className="font-semibold text-right">{t('salary.allowances')}</TableHead>
                  <TableHead className="font-semibold text-right">{t('salary.bonus')}</TableHead>
                  <TableHead className="font-semibold text-right">{t('salary.deductions')}</TableHead>
                  <TableHead className="font-semibold text-right">{t('salary.netSalary')}</TableHead>
                  <TableHead className="font-semibold text-center">{t('common.status.label')}</TableHead>
                  <TableHead className="font-semibold">{t('salary.payDate')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMonthlyPayroll.map((payroll) => (
                  <TableRow key={payroll.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{payroll.month}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payroll.baseSalary)}</TableCell>
                    <TableCell className="text-right text-amber-600 dark:text-amber-400">{formatCurrency(payroll.allowances)}</TableCell>
                    <TableCell className="text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(payroll.bonus)}</TableCell>
                    <TableCell className="text-right text-rose-600 dark:text-rose-400">-{formatCurrency(payroll.deductions)}</TableCell>
                    <TableCell className="text-right font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(payroll.netSalary)}</TableCell>
                    <TableCell className="text-center">
                      {payroll.status === 'paid' ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {t('salary.paid')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="w-3 h-3" />
                          {t('salary.pendingPayment')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(payroll.payDate), 'dd/MM/yyyy', { locale: vi })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('salary.editAllowance')}</DialogTitle>
          </DialogHeader>
          {editingAllowance && renderAllowanceForm(editingAllowance, setEditingAllowance)}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('common.cancel')}</Button>
            </DialogClose>
            <Button onClick={handleEditAllowance}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
