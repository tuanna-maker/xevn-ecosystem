import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Plus, MoreHorizontal, Pencil, Trash2, Laptop, Smartphone, Monitor, 
  Headphones, Key, CreditCard, Car, Package, Calendar, DollarSign,
  CheckCircle2, AlertTriangle, XCircle, RotateCcw, Loader2
} from 'lucide-react';
import { useEmployeeAssets, type AssetFormData } from '@/hooks/useEmployeeAssets';

interface EmployeeAssetsProps {
  employeeId: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  laptop: <Laptop className="h-5 w-5" />,
  phone: <Smartphone className="h-5 w-5" />,
  monitor: <Monitor className="h-5 w-5" />,
  accessory: <Headphones className="h-5 w-5" />,
  furniture: <Package className="h-5 w-5" />,
  vehicle: <Car className="h-5 w-5" />,
  card: <CreditCard className="h-5 w-5" />,
  key: <Key className="h-5 w-5" />,
  equipment: <Package className="h-5 w-5" />,
  other: <Package className="h-5 w-5" />
};

const categoryColors: Record<string, string> = {
  laptop: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
  phone: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
  monitor: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
  accessory: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
  furniture: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
  vehicle: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
  card: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400',
  key: 'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400',
  equipment: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400',
  other: 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
};

const statusIcons: Record<string, React.ReactNode> = {
  'assigned': <CheckCircle2 className="h-4 w-4" />,
  'returned': <RotateCcw className="h-4 w-4" />,
  'maintenance': <AlertTriangle className="h-4 w-4" />,
  'lost': <XCircle className="h-4 w-4" />
};

export const EmployeeAssets = ({ employeeId }: EmployeeAssetsProps) => {
  const { t, i18n } = useTranslation();
  const { assets, loading, addAsset, updateAsset, deleteAsset, getStats } = useEmployeeAssets(employeeId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const categoryLabels: Record<string, string> = {
    laptop: t('assets.categories.laptop'),
    phone: t('assets.categories.phone'),
    monitor: t('assets.categories.monitor'),
    accessory: t('assets.categories.accessory'),
    furniture: t('assets.categories.furniture'),
    vehicle: t('assets.categories.vehicle'),
    card: t('assets.categories.card'),
    key: t('assets.categories.key'),
    equipment: t('assets.categories.equipment'),
    other: t('assets.categories.other')
  };

  const conditionLabels: Record<string, string> = {
    new: t('assets.conditions.new'),
    good: t('assets.conditions.good'),
    fair: t('assets.conditions.fair'),
    poor: t('assets.conditions.poor'),
    damaged: t('assets.conditions.damaged')
  };

  const statusLabels: Record<string, string> = {
    assigned: t('assets.status.assigned'),
    returned: t('assets.status.returned'),
    maintenance: t('assets.status.maintenance'),
    lost: t('assets.status.lost')
  };

  const [form, setForm] = useState<AssetFormData>({
    asset_name: '',
    asset_code: '',
    category: 'equipment',
    brand: '',
    model: '',
    serial_number: '',
    assigned_date: '',
    return_date: '',
    condition: 'new',
    status: 'assigned',
    value: 0,
    specifications: '',
    notes: ''
  });

  const handleOpenDialog = (assetId?: string) => {
    if (assetId) {
      const asset = assets.find(a => a.id === assetId);
      if (asset) {
        setEditingId(assetId);
        setForm({
          asset_name: asset.asset_name,
          asset_code: asset.asset_code,
          category: asset.category,
          brand: asset.brand || '',
          model: asset.model || '',
          serial_number: asset.serial_number || '',
          assigned_date: asset.assigned_date || '',
          return_date: asset.return_date || '',
          condition: asset.condition,
          status: asset.status,
          value: asset.value,
          specifications: asset.specifications || '',
          notes: asset.notes || ''
        });
      }
    } else {
      setEditingId(null);
      setForm({
        asset_name: '',
        asset_code: '',
        category: 'equipment',
        brand: '',
        model: '',
        serial_number: '',
        assigned_date: '',
        return_date: '',
        condition: 'new',
        status: 'assigned',
        value: 0,
        specifications: '',
        notes: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.asset_name || !form.asset_code) return;
    
    if (editingId) {
      await updateAsset(editingId, form);
    } else {
      await addAsset(form);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('assets.confirmDelete'))) {
      await deleteAsset(id);
    }
  };

  const formatCurrency = (value: number) => {
    const lang = i18n.language;
    const locale = lang === 'vi' ? 'vi-VN' : lang === 'zh' ? 'zh-CN' : 'en-US';
    const currency = lang === 'vi' ? 'VND' : lang === 'zh' ? 'CNY' : 'USD';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('assets.inUse')}</p>
                <p className="text-2xl font-bold">{stats.inUseCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('assets.totalValue')}</p>
                <p className="text-xl font-bold">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Laptop className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('assets.assetTypes')}</p>
                <p className="text-2xl font-bold">{stats.categoryCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('assets.underMaintenance')}</p>
                <p className="text-2xl font-bold">{stats.maintenanceCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('assets.title')}
          </CardTitle>
          <Button size="sm" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-1" />
            {t('assets.add')}
          </Button>
        </CardHeader>
        <CardContent>
          {assets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets.map((asset) => (
                <div key={asset.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${categoryColors[asset.category] || categoryColors.other}`}>
                        {categoryIcons[asset.category] || categoryIcons.other}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="font-semibold">{asset.asset_name}</h4>
                          <p className="text-sm text-muted-foreground">{asset.asset_code}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{categoryLabels[asset.category] || t('assets.categories.other')}</Badge>
                          <Badge variant={
                            asset.status === 'assigned' ? 'default' :
                            asset.status === 'returned' ? 'secondary' :
                            asset.status === 'maintenance' ? 'outline' : 'destructive'
                          } className="gap-1">
                            {statusIcons[asset.status]}
                            {statusLabels[asset.status] || asset.status}
                          </Badge>
                          <Badge variant={
                            asset.condition === 'new' ? 'default' :
                            asset.condition === 'good' ? 'secondary' :
                            asset.condition === 'fair' ? 'outline' : 'destructive'
                          }>
                            {conditionLabels[asset.condition] || asset.condition}
                          </Badge>
                        </div>

                        {(asset.brand || asset.model) && (
                          <p className="text-sm">
                            <span className="font-medium">{asset.brand}</span>
                            {asset.brand && asset.model && ' - '}
                            <span>{asset.model}</span>
                          </p>
                        )}

                        {asset.serial_number && (
                          <p className="text-sm text-muted-foreground">
                            S/N: {asset.serial_number}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {asset.assigned_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {asset.assigned_date}
                            </span>
                          )}
                          {asset.value > 0 && (
                            <span className="font-medium text-foreground">
                              {formatCurrency(asset.value)}
                            </span>
                          )}
                        </div>

                        {asset.specifications && (
                          <p className="text-sm text-muted-foreground italic">
                            {asset.specifications}
                          </p>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(asset.id)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          {t('assets.editAction')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(asset.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('assets.deleteAction')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('assets.empty')}</p>
              <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                {t('assets.addFirst')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? t('assets.edit') : t('assets.addNew')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('assets.assetName')} *</Label>
                <Input 
                  value={form.asset_name} 
                  onChange={(e) => setForm({ ...form, asset_name: e.target.value })}
                  placeholder={t('assets.assetNamePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('assets.assetCode')} *</Label>
                <Input 
                  value={form.asset_code} 
                  onChange={(e) => setForm({ ...form, asset_code: e.target.value })}
                  placeholder={t('assets.assetCodePlaceholder')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('assets.category')}</Label>
                <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('assets.brand')}</Label>
                <Input 
                  value={form.brand} 
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder={t('assets.brandPlaceholder')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('assets.model')}</Label>
                <Input 
                  value={form.model} 
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  placeholder={t('assets.modelPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('assets.serialNumber')}</Label>
                <Input 
                  value={form.serial_number} 
                  onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
                  placeholder={t('assets.serialPlaceholder')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('assets.assignedDate')}</Label>
                <Input 
                  type="date"
                  value={form.assigned_date} 
                  onChange={(e) => setForm({ ...form, assigned_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('assets.returnDate')}</Label>
                <Input 
                  type="date"
                  value={form.return_date} 
                  onChange={(e) => setForm({ ...form, return_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('assets.condition')}</Label>
                <Select value={form.condition} onValueChange={(value) => setForm({ ...form, condition: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(conditionLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('assets.statusLabel')}</Label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('assets.valueLabel')}</Label>
                <Input 
                  type="number"
                  value={form.value} 
                  onChange={(e) => setForm({ ...form, value: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('assets.specifications')}</Label>
              <Input 
                value={form.specifications} 
                onChange={(e) => setForm({ ...form, specifications: e.target.value })}
                placeholder={t('assets.specPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('assets.notes')}</Label>
              <Textarea 
                value={form.notes} 
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={t('assets.notesPlaceholder')}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('assets.cancel')}</Button>
            <Button onClick={handleSave}>{editingId ? t('assets.update') : t('assets.add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
