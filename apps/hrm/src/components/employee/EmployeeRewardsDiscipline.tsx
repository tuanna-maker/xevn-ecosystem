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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, MoreHorizontal, Pencil, Trash2, Award, AlertTriangle, 
  Calendar, DollarSign, FileText, Trophy, Medal, Star,
  ThumbsUp, ThumbsDown, Scale, Loader2
} from 'lucide-react';
import { useEmployeeRewardsDiscipline, type RewardFormData, type DisciplineFormData } from '@/hooks/useEmployeeRewardsDiscipline';

interface EmployeeRewardsDisciplineProps {
  employeeId: string;
}

const rewardTypeIcons: Record<string, React.ReactNode> = {
  bonus: <DollarSign className="h-5 w-5" />,
  certificate: <Award className="h-5 w-5" />,
  promotion: <Trophy className="h-5 w-5" />,
  recognition: <Star className="h-5 w-5" />,
  gift: <Medal className="h-5 w-5" />
};

export const EmployeeRewardsDiscipline = ({ employeeId }: EmployeeRewardsDisciplineProps) => {
  const { t } = useTranslation();
  const { 
    rewards, disciplines, loading, 
    addReward, updateReward, deleteReward,
    addDiscipline, updateDiscipline, deleteDiscipline,
    getStats 
  } = useEmployeeRewardsDiscipline(employeeId);

  const rewardTypeLabels: Record<string, string> = {
    bonus: t('rewards.types.bonus'),
    certificate: t('rewards.types.certificate'),
    promotion: t('rewards.types.promotion'),
    recognition: t('rewards.types.recognition'),
    gift: t('rewards.types.gift')
  };

  const disciplineTypeLabels: Record<string, string> = {
    warning: t('discipline.types.warning'),
    'written-warning': t('discipline.types.writtenWarning'),
    suspension: t('discipline.types.suspension'),
    demotion: t('discipline.types.demotion'),
    termination: t('discipline.types.termination')
  };

  const statusLabels: Record<string, string> = {
    pending: t('common.status.pending'),
    approved: t('common.status.approved'),
    completed: t('common.status.completed'),
    active: t('common.status.active')
  };
  
  const [activeTab, setActiveTab] = useState('rewards');
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [disciplineDialogOpen, setDisciplineDialogOpen] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [editingDisciplineId, setEditingDisciplineId] = useState<string | null>(null);

  const [rewardForm, setRewardForm] = useState<RewardFormData>({
    reward_type: 'bonus',
    title: '',
    description: '',
    decision_number: '',
    reward_date: '',
    amount: 0,
    issued_by: '',
    status: 'approved',
    notes: ''
  });

  const [disciplineForm, setDisciplineForm] = useState<DisciplineFormData>({
    discipline_type: 'warning',
    title: '',
    description: '',
    decision_number: '',
    discipline_date: '',
    penalty_amount: 0,
    issued_by: '',
    effective_from: '',
    effective_to: '',
    status: 'active',
    notes: ''
  });

  const handleOpenRewardDialog = (rewardId?: string) => {
    if (rewardId) {
      const reward = rewards.find(r => r.id === rewardId);
      if (reward) {
        setEditingRewardId(rewardId);
        setRewardForm({
          reward_type: reward.reward_type,
          title: reward.title,
          description: reward.description || '',
          decision_number: reward.decision_number || '',
          reward_date: reward.reward_date,
          amount: reward.amount,
          issued_by: reward.issued_by || '',
          status: reward.status,
          notes: reward.notes || ''
        });
      }
    } else {
      setEditingRewardId(null);
      setRewardForm({
        reward_type: 'bonus',
        title: '',
        description: '',
        decision_number: '',
        reward_date: '',
        amount: 0,
        issued_by: '',
        status: 'approved',
        notes: ''
      });
    }
    setRewardDialogOpen(true);
  };

  const handleOpenDisciplineDialog = (disciplineId?: string) => {
    if (disciplineId) {
      const discipline = disciplines.find(d => d.id === disciplineId);
      if (discipline) {
        setEditingDisciplineId(disciplineId);
        setDisciplineForm({
          discipline_type: discipline.discipline_type,
          title: discipline.title,
          description: discipline.description || '',
          decision_number: discipline.decision_number || '',
          discipline_date: discipline.discipline_date,
          penalty_amount: discipline.penalty_amount,
          issued_by: discipline.issued_by || '',
          effective_from: discipline.effective_from || '',
          effective_to: discipline.effective_to || '',
          status: discipline.status,
          notes: discipline.notes || ''
        });
      }
    } else {
      setEditingDisciplineId(null);
      setDisciplineForm({
        discipline_type: 'warning',
        title: '',
        description: '',
        decision_number: '',
        discipline_date: '',
        penalty_amount: 0,
        issued_by: '',
        effective_from: '',
        effective_to: '',
        status: 'active',
        notes: ''
      });
    }
    setDisciplineDialogOpen(true);
  };

  const handleSaveReward = async () => {
    if (!rewardForm.title || !rewardForm.reward_date) return;
    if (editingRewardId) {
      await updateReward(editingRewardId, rewardForm);
    } else {
      await addReward(rewardForm);
    }
    setRewardDialogOpen(false);
  };

  const handleSaveDiscipline = async () => {
    if (!disciplineForm.title || !disciplineForm.discipline_date) return;
    if (editingDisciplineId) {
      await updateDiscipline(editingDisciplineId, disciplineForm);
    } else {
      await addDiscipline(disciplineForm);
    }
    setDisciplineDialogOpen(false);
  };

  const handleDeleteReward = async (id: string) => {
    if (confirm(t('rewards.confirmDelete'))) {
      await deleteReward(id);
    }
  };

  const handleDeleteDiscipline = async (id: string) => {
    if (confirm(t('discipline.confirmDelete'))) {
      await deleteDiscipline(id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
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
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('rewards.totalRewards')}</p>
                <p className="text-2xl font-bold">{stats.totalRewards}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('rewards.totalAmount')}</p>
                <p className="text-xl font-bold">{formatCurrency(stats.totalRewardAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                <ThumbsDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('discipline.totalDisciplines')}</p>
                <p className="text-2xl font-bold">{stats.totalDisciplines}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('discipline.activeDisciplines')}</p>
                <p className="text-2xl font-bold">{stats.activeDisciplines}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="rewards" className="gap-2">
            <Award className="h-4 w-4" />
            {t('rewards.title')} ({rewards.length})
          </TabsTrigger>
          <TabsTrigger value="discipline" className="gap-2">
            <Scale className="h-4 w-4" />
            {t('discipline.title')} ({disciplines.length})
          </TabsTrigger>
        </TabsList>

        {/* Rewards Tab */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                {t('rewards.listTitle')}
              </CardTitle>
              <Button size="sm" onClick={() => handleOpenRewardDialog()}>
                <Plus className="h-4 w-4 mr-1" />
                {t('rewards.add')}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rewards.length > 0 ? rewards.map((reward) => (
                  <div key={reward.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${
                          reward.reward_type === 'bonus' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' :
                          reward.reward_type === 'certificate' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' :
                          reward.reward_type === 'promotion' ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400' :
                          reward.reward_type === 'recognition' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400' :
                          'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400'
                        }`}>
                          {rewardTypeIcons[reward.reward_type] || <Award className="h-5 w-5" />}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{reward.title}</h4>
                            <Badge variant="outline">{rewardTypeLabels[reward.reward_type] || reward.reward_type}</Badge>
                            <Badge variant="default">{statusLabels[reward.status] || reward.status}</Badge>
                          </div>
                          {reward.description && (
                            <p className="text-sm text-muted-foreground">{reward.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            {reward.decision_number && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {reward.decision_number}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {reward.reward_date}
                            </span>
                            {reward.amount > 0 && (
                              <span className="font-medium text-green-600 dark:text-green-400">
                                {formatCurrency(reward.amount)}
                              </span>
                            )}
                          </div>
                          {reward.issued_by && (
                            <p className="text-sm text-muted-foreground">{t('rewards.issuedBy')}: {reward.issued_by}</p>
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
                          <DropdownMenuItem onClick={() => handleOpenRewardDialog(reward.id)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteReward(reward.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('rewards.empty')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discipline Tab */}
        <TabsContent value="discipline">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                {t('discipline.listTitle')}
              </CardTitle>
              <Button size="sm" onClick={() => handleOpenDisciplineDialog()}>
                <Plus className="h-4 w-4 mr-1" />
                {t('discipline.add')}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {disciplines.length > 0 ? disciplines.map((discipline) => (
                  <div key={discipline.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{discipline.title}</h4>
                            <Badge variant="outline">{disciplineTypeLabels[discipline.discipline_type] || discipline.discipline_type}</Badge>
                            <Badge variant={discipline.status === 'active' ? 'destructive' : 'secondary'}>
                              {statusLabels[discipline.status] || discipline.status}
                            </Badge>
                          </div>
                          {discipline.description && (
                            <p className="text-sm text-muted-foreground">{discipline.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            {discipline.decision_number && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {discipline.decision_number}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {discipline.discipline_date}
                            </span>
                            {discipline.penalty_amount > 0 && (
                              <span className="font-medium text-red-600 dark:text-red-400">
                                -{formatCurrency(discipline.penalty_amount)}
                              </span>
                            )}
                          </div>
                          {discipline.issued_by && (
                            <p className="text-sm text-muted-foreground">{t('discipline.issuedBy')}: {discipline.issued_by}</p>
                          )}
                          {(discipline.effective_from || discipline.effective_to) && (
                            <p className="text-sm text-muted-foreground">
                              {t('discipline.effectiveRange')}: {discipline.effective_from} - {discipline.effective_to || '-'}
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
                          <DropdownMenuItem onClick={() => handleOpenDisciplineDialog(discipline.id)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteDiscipline(discipline.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Scale className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('discipline.empty')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reward Dialog */}
      <Dialog open={rewardDialogOpen} onOpenChange={setRewardDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRewardId ? t('rewardForm.editTitle') : t('rewardForm.addTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('rewardForm.type')}</Label>
                <Select value={rewardForm.reward_type} onValueChange={(v) => setRewardForm({...rewardForm, reward_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(rewardTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('rewards.rewardDate')} *</Label>
                <Input type="date" value={rewardForm.reward_date} onChange={(e) => setRewardForm({...rewardForm, reward_date: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('rewardForm.titleLabel')} *</Label>
              <Input value={rewardForm.title} onChange={(e) => setRewardForm({...rewardForm, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>{t('rewardForm.description')}</Label>
              <Textarea value={rewardForm.description} onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('rewards.decisionNumber')}</Label>
                <Input value={rewardForm.decision_number} onChange={(e) => setRewardForm({...rewardForm, decision_number: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{t('rewards.amount')}</Label>
                <Input type="number" value={rewardForm.amount} onChange={(e) => setRewardForm({...rewardForm, amount: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('rewards.issuedBy')}</Label>
                <Input value={rewardForm.issued_by} onChange={(e) => setRewardForm({...rewardForm, issued_by: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{t('common.status.label')}</Label>
                <Select value={rewardForm.status} onValueChange={(v) => setRewardForm({...rewardForm, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRewardDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSaveReward}>{editingRewardId ? t('common.edit') : t('common.add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discipline Dialog */}
      <Dialog open={disciplineDialogOpen} onOpenChange={setDisciplineDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDisciplineId ? t('disciplineForm.editTitle') : t('disciplineForm.addTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('disciplineForm.type')}</Label>
                <Select value={disciplineForm.discipline_type} onValueChange={(v) => setDisciplineForm({...disciplineForm, discipline_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(disciplineTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('discipline.disciplineDate')} *</Label>
                <Input type="date" value={disciplineForm.discipline_date} onChange={(e) => setDisciplineForm({...disciplineForm, discipline_date: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('disciplineForm.titleLabel')} *</Label>
              <Input value={disciplineForm.title} onChange={(e) => setDisciplineForm({...disciplineForm, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>{t('disciplineForm.violation')}</Label>
              <Textarea value={disciplineForm.description} onChange={(e) => setDisciplineForm({...disciplineForm, description: e.target.value})} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('discipline.decisionNumber')}</Label>
                <Input value={disciplineForm.decision_number} onChange={(e) => setDisciplineForm({...disciplineForm, decision_number: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{t('discipline.penaltyAmount')}</Label>
                <Input type="number" value={disciplineForm.penalty_amount} onChange={(e) => setDisciplineForm({...disciplineForm, penalty_amount: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('discipline.effectiveFrom')}</Label>
                <Input type="date" value={disciplineForm.effective_from} onChange={(e) => setDisciplineForm({...disciplineForm, effective_from: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{t('discipline.effectiveTo')}</Label>
                <Input type="date" value={disciplineForm.effective_to} onChange={(e) => setDisciplineForm({...disciplineForm, effective_to: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('discipline.issuedBy')}</Label>
                <Input value={disciplineForm.issued_by} onChange={(e) => setDisciplineForm({...disciplineForm, issued_by: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{t('common.status.label')}</Label>
                <Select value={disciplineForm.status} onValueChange={(v) => setDisciplineForm({...disciplineForm, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisciplineDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSaveDiscipline}>{editingDisciplineId ? t('common.edit') : t('common.add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
