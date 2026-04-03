import { useState, useEffect } from 'react';
import { useDepartments } from '@/hooks/useDepartments';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Plus, Edit, Trash2, Loader2, Briefcase, FileSignature, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface EmployeeWorkTimelineProps {
  employeeId: string;
}

interface WorkHistoryItem {
  id: string;
  event_date: string;
  title: string;
  description: string | null;
  event_type: string;
  status: string;
  contract_code: string | null;
  department: string | null;
  position: string | null;
  notes: string | null;
}

const getEventTypeConfig = (t: any) => ({
  position: { label: t('workTimeline.eventTypes.position'), icon: Briefcase, color: 'bg-blue-500' },
  promotion: { label: t('workTimeline.eventTypes.promotion'), icon: ArrowUpRight, color: 'bg-green-500' },
  transfer: { label: t('workTimeline.eventTypes.transfer'), icon: ArrowLeftRight, color: 'bg-orange-500' },
  contract: { label: t('workTimeline.eventTypes.contract'), icon: FileSignature, color: 'bg-purple-500' },
});

const getStatusConfig = (t: any) => ({
  completed: { label: t('workTimeline.statuses.completed'), color: 'bg-green-500', badgeClass: 'bg-green-100 text-green-700' },
  current: { label: t('workTimeline.statuses.current'), color: 'bg-orange-500', badgeClass: 'bg-orange-100 text-orange-700' },
  pending: { label: t('workTimeline.statuses.pending'), color: 'bg-gray-300', badgeClass: 'bg-gray-100 text-gray-700' },
});

export function EmployeeWorkTimeline({ employeeId }: EmployeeWorkTimelineProps) {
  const { currentCompanyId } = useAuth();
  const { t } = useTranslation();
  const { departments } = useDepartments();
  const eventTypeConfig = getEventTypeConfig(t);
  const statusConfig = getStatusConfig(t);
  const [items, setItems] = useState<WorkHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkHistoryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    event_date: '',
    title: '',
    description: '',
    event_type: 'position',
    status: 'current',
    contract_code: '',
    department: '',
    position: '',
    notes: '',
  });

  useEffect(() => {
    if (employeeId && currentCompanyId) {
      fetchWorkHistory();
    }
  }, [employeeId, currentCompanyId]);

  const fetchWorkHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_work_history')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('company_id', currentCompanyId)
        .order('event_date', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching work history:', error);
      toast.error(t('workTimeline.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingItem(null);
    setFormData({
      event_date: new Date().toISOString().split('T')[0],
      title: '',
      description: '',
      event_type: 'position',
      status: 'current',
      contract_code: '',
      department: '',
      position: '',
      notes: '',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (item: WorkHistoryItem) => {
    setEditingItem(item);
    setFormData({
      event_date: item.event_date,
      title: item.title,
      description: item.description || '',
      event_type: item.event_type,
      status: item.status,
      contract_code: item.contract_code || '',
      department: item.department || '',
      position: item.position || '',
      notes: item.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error(t('workTimeline.titleRequired'));
      return;
    }
    if (!formData.event_date) {
      toast.error(t('workTimeline.dateRequired'));
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('employee_work_history')
          .update({
            event_date: formData.event_date,
            title: formData.title,
            description: formData.description || null,
            event_type: formData.event_type,
            status: formData.status,
            contract_code: formData.contract_code || null,
            department: formData.department || null,
            position: formData.position || null,
            notes: formData.notes || null,
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success(t('workTimeline.updateSuccess'));
      } else {
        const { error } = await supabase
          .from('employee_work_history')
          .insert({
            employee_id: employeeId,
            company_id: currentCompanyId,
            event_date: formData.event_date,
            title: formData.title,
            description: formData.description || null,
            event_type: formData.event_type,
            status: formData.status,
            contract_code: formData.contract_code || null,
            department: formData.department || null,
            position: formData.position || null,
            notes: formData.notes || null,
          });

        if (error) throw error;
        toast.success(t('workTimeline.addSuccess'));
      }

      setDialogOpen(false);
      fetchWorkHistory();
    } catch (error) {
      console.error('Error saving work history:', error);
      toast.error(t('workTimeline.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('workTimeline.deleteConfirm'))) return;

    try {
      const { error } = await supabase
        .from('employee_work_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success(t('workTimeline.deleteSuccess'));
      fetchWorkHistory();
    } catch (error) {
      console.error('Error deleting work history:', error);
      toast.error(t('workTimeline.deleteError'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t('workTimeline.title')}</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              {t('workTimeline.addNew')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? t('workTimeline.editInfo') : t('workTimeline.addWorkHistory')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('workTimeline.date')} *</Label>
                  <Input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('workTimeline.eventType')}</Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(eventTypeConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('workTimeline.titleField')} *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('workTimeline.titlePlaceholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('workTimeline.department')}</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('workTimeline.departmentPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('workTimeline.position')}</Label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder={t('workTimeline.positionPlaceholder')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('workTimeline.contractCode')}</Label>
                  <Input
                    value={formData.contract_code}
                    onChange={(e) => setFormData({ ...formData, contract_code: e.target.value })}
                    placeholder={t('workTimeline.contractCodePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('workTimeline.statusField')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('workTimeline.description')}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('workTimeline.descriptionPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('workTimeline.notes')}</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('workTimeline.notesPlaceholder')}
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('workTimeline.cancel')}
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingItem ? t('workTimeline.update') : t('workTimeline.addNew')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('workTimeline.noData')}</p>
            <Button variant="outline" className="mt-4" onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              {t('workTimeline.addWorkHistory')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">{t('workTimeline.workProcess')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {items.map((item, index) => {
                const eventConfig = eventTypeConfig[item.event_type as keyof typeof eventTypeConfig] || eventTypeConfig.position;
                const statusConf = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.current;
                const IconComponent = eventConfig.icon;

                return (
                  <div key={item.id} className="flex gap-4 pb-6 last:pb-0 group">
                    {/* Timeline line and dot */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white',
                        eventConfig.color
                      )}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {index < items.length - 1 && (
                        <div className="w-0.5 flex-1 bg-border mt-2" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">
                            {format(new Date(item.event_date), 'dd/MM/yyyy')}
                          </p>
                          <p className="font-medium text-sm">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          {(item.department || item.position) && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {[item.department, item.position].filter(Boolean).join(' - ')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={cn('shrink-0 text-xs', statusConf.badgeClass)}>
                            {statusConf.label}
                          </Badge>
                          <div className="hidden group-hover:flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => openEditDialog(item)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
