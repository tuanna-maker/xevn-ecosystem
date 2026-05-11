import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Award,
  BarChart3,
  CheckCircle2,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useEmployeeKPI, type KPIFormData } from '@/hooks/useEmployeeKPI';

interface EmployeeKPIProps {
  employeeId: string;
}

const categoryOptions = ['Sales', 'Operations', 'Quality', 'HR', 'Finance', 'IT', 'other'];

const formatValue = (value: number, unit: string) => {
  if (unit === 'VNĐ') {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
  return `${value} ${unit}`;
};

const getProgress = (actual: number, target: number) => {
  if (target === 0) return 0;
  return Math.min(Math.round((actual / target) * 100), 100);
};

const getChartConfig = (t: any) => ({
  score: {
    label: t('kpi.currentScore'),
    color: "hsl(var(--chart-1))",
  },
});

export function EmployeeKPI({ employeeId }: EmployeeKPIProps) {
  const { t } = useTranslation();
  
  const statusOptions = [
    { value: 'not_started', label: t('kpi.statuses.notStarted'), color: 'bg-gray-100 text-gray-700' },
    { value: 'in_progress', label: t('kpi.statuses.inProgress'), color: 'bg-blue-100 text-blue-700' },
    { value: 'completed', label: t('kpi.statuses.completed'), color: 'bg-emerald-100 text-emerald-700' },
    { value: 'overdue', label: t('kpi.statuses.overdue'), color: 'bg-red-100 text-red-700' },
  ];

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };
  const { kpis, loading, addKPI, updateKPI, deleteKPI, getCurrentPeriodKPIs, getStats, getKPIsByPeriod } = useEmployeeKPI(employeeId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState<string | null>(null);
  const [formData, setFormData] = useState<KPIFormData>({
    period_name: 'Q1/2026',
    period_start: new Date().toISOString().split('T')[0],
    period_end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    kpi_name: '',
    category: 'Sales',
    target_value: 0,
    actual_value: null,
    weight: 10,
    unit: '%',
    status: 'not_started',
    notes: '',
  });

  const currentKPIs = getCurrentPeriodKPIs();
  const stats = getStats();
  const kpisByPeriod = getKPIsByPeriod();

  // Generate trend data from historical periods
  const trendData = Object.entries(kpisByPeriod)
    .map(([period, items]) => {
      const totalWeight = items.reduce((sum, k) => sum + k.weight, 0);
      const score = items.reduce((sum, k) => {
        if (k.target_value === 0) return sum;
        const progress = Math.min(((k.actual_value || 0) / k.target_value) * 100, 100);
        return sum + (progress * k.weight / 100);
      }, 0);
      return { period, score: Math.round(score) };
    })
    .reverse()
    .slice(-4);

  const handleOpenDialog = (kpiId?: string) => {
    if (kpiId) {
      const kpi = kpis.find(k => k.id === kpiId);
      if (kpi) {
        setEditingKPI(kpiId);
        setFormData({
          period_name: kpi.period_name,
          period_start: kpi.period_start,
          period_end: kpi.period_end,
          kpi_name: kpi.kpi_name,
          category: kpi.category,
          target_value: kpi.target_value,
          actual_value: kpi.actual_value,
          weight: kpi.weight,
          unit: kpi.unit || '%',
          status: kpi.status,
          notes: kpi.notes || '',
        });
      }
    } else {
      setEditingKPI(null);
      setFormData({
        period_name: 'Q1/2026',
        period_start: new Date().toISOString().split('T')[0],
        period_end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        kpi_name: '',
        category: 'Sales',
        target_value: 0,
        actual_value: null,
        weight: 10,
        unit: '%',
        status: 'not_started',
        notes: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.kpi_name || !formData.category || !formData.target_value) {
      return;
    }

    if (editingKPI) {
      await updateKPI(editingKPI, formData);
    } else {
      await addKPI(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('kpi.confirmDelete'))) {
      await deleteKPI(id);
    }
  };

  const chartConfig = getChartConfig(t);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
            <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{t('kpi.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('kpi.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t('kpi.currentScore')}</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {stats.currentScore}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t('kpi.currentPeriod')}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <Target className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t('kpi.completedCount')}</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {stats.completed}
                </p>
                <p className="text-xs text-muted-foreground mt-1">/{stats.totalKPIs} KPI</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t('kpi.inProgressCount')}</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {stats.inProgress}
                </p>
                <p className="text-xs text-muted-foreground mt-1">/{stats.totalKPIs} KPI</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t('kpi.totalWeight')}</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {stats.totalWeight}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stats.totalWeight === 100 ? t('kpi.weightComplete') : t('kpi.weightNeeded')}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current KPIs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-500" />
                {t('kpi.currentQuarter')}
              </CardTitle>
              <Button size="sm" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-1" />
                {t('kpi.add')}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentKPIs.length > 0 ? currentKPIs.map((kpi) => {
                  const progress = getProgress(kpi.actual_value || 0, kpi.target_value);
                  const statusInfo = getStatusInfo(kpi.status);
                  
                  return (
                    <div
                      key={kpi.id}
                      className="p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{kpi.kpi_name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {kpi.category}
                            </Badge>
                            <Badge className={`text-xs ${statusInfo.color}`}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          {kpi.notes && (
                            <p className="text-xs text-muted-foreground">{kpi.notes}</p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(kpi.id)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(kpi.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex-1">
                          <Progress value={progress} className="h-2" />
                        </div>
                        <span className="text-sm font-semibold min-w-[50px] text-right">
                          {progress}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t('kpi.actualValue')}: {formatValue(kpi.actual_value || 0, kpi.unit || '%')}</span>
                        <span>{t('kpi.targetValue')}: {formatValue(kpi.target_value, kpi.unit || '%')}</span>
                        <span>{t('kpi.weight')}: {kpi.weight}%</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                     <p>{t('kpi.empty')}</p>
                    <p className="text-sm">{t('kpi.emptyHint')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Trend Chart */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                {t('kpi.trend')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trendData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="period" fontSize={12} />
                      <YAxis fontSize={12} domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--chart-1))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-1))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <p className="text-sm">{t('kpi.noHistoricalData')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingKPI ? t('kpi.edit') : t('kpi.addNew')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('kpi.periodName')} *</Label>
                <Input
                  value={formData.period_name}
                  onChange={(e) => setFormData({ ...formData, period_name: e.target.value })}
                  placeholder="VD: Q1/2026"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('kpi.categoryLabel')} *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('kpi.periodStart')} *</Label>
                <Input
                  type="date"
                  value={formData.period_start}
                  onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('kpi.periodEnd')} *</Label>
                <Input
                  type="date"
                  value={formData.period_end}
                  onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('kpi.kpiName')} *</Label>
              <Input
                value={formData.kpi_name}
                onChange={(e) => setFormData({ ...formData, kpi_name: e.target.value })}
                placeholder="VD: Doanh số bán hàng"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('kpi.targetValue')} *</Label>
                <Input
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('kpi.actualValue')}</Label>
                <Input
                  type="number"
                  value={formData.actual_value || ''}
                  onChange={(e) => setFormData({ ...formData, actual_value: parseFloat(e.target.value) || null })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('kpi.unit')}</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="%"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('kpi.weight')} (%)</Label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('common.status.label')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('common.notes')}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Mô tả chi tiết..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave}>
              {editingKPI ? t('common.update') : t('common.addNew')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
