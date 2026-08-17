/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → tab Khen thưởng / kỷ luật (E23 / UC-BP-CORE-08)
 * UC:         UC-BP-CORE-08 · FR-UC-BP-CORE-08 · E23
 * BR:         BR-BP-RD-01 · BR-CORE-RD-PATH · AC-CORE-08-01..07
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-08 Diễn biến #1–#5
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md F-CORE-RD-01
 * Purpose:    Tab KT/KL — title-first; amount>0 → period picker; Enforce/Cancel-enforce;
 *             F5 bind status_label + payroll_link_status + period label từ BE; amounts vi-VN;
 *             dates dd/MM/yyyy; toast VAL/ENFORCE/DUAL/LOCKED/EMP. Cấm Nest /core SoT ·
 *             FE invent payslip Net · fold /decisions · claim CORE-02=DONE · note-CRUD=FR-08 DONE.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-08-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    EmployeeProfile activeTab=rewards
 * Callees:    useEmployeeRewardsDiscipline · empCoreRdRing · formatDisplayDate · ViMoneyInput
 * must_keep: SoftDel prefer; navigate employees/:id; U65; honesty false; C-SLICE
 * ADR:        docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-EMP-C
 * change_mode: UPGRADE
 * What: Labels/empty → text-xevn-textSecondary; blue/purple AI chrome → xevn DNA; KPI ops-dense
 * Why: ADR-20260805 §8–§10 · inventory W3-EMP-C
 * must_keep: SoftDel; navigate(/employees/:id); stub honesty; no OCR/QR invent; no Nest/seed; no Employees CLOSED
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-08-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Bind payroll_period picker when amount>0; Enforce / Hủy thi hành; display-ready BE labels;
 *       create omits status (pending); remove FE status invent; Network rewards* / discipline* only
 * Why: API-01 CONFIRMED · BA O1–O12 · J-HRM-CORE-08-01..04
 * must_keep: Physical path O1; no Nest /core; no payslip Net invent; CORE-02 ≠ pillar DONE; note ≠ FR-08 DONE
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ViMoneyInput } from '@/components/ui/ViMoneyInput';
import { ViDateField } from '@/components/ui/ViDateField';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, MoreHorizontal, Pencil, Trash2, Award, AlertTriangle,
  Calendar, DollarSign, FileText, Trophy, Medal, Star,
  ThumbsUp, ThumbsDown, Scale, Loader2, CheckCircle2, Ban,
} from 'lucide-react';
import {
  useEmployeeRewardsDiscipline,
  type RewardFormData,
  type DisciplineFormData,
} from '@/hooks/useEmployeeRewardsDiscipline';
import { formatDisplayDate } from '@/lib/formatDisplayDate';
import {
  canCancelEnforceRdCase,
  canEnforceRdCase,
  canHardDeleteRdCase,
  rdPayrollLinkLabelFallback,
  rdStatusLabelFallback,
} from '@/lib/empCoreRdRing';

interface EmployeeRewardsDisciplineProps {
  employeeId: string;
}

const rewardTypeIcons: Record<string, React.ReactNode> = {
  bonus: <DollarSign className="h-5 w-5" />,
  certificate: <Award className="h-5 w-5" />,
  promotion: <Trophy className="h-5 w-5" />,
  recognition: <Star className="h-5 w-5" />,
  gift: <Medal className="h-5 w-5" />,
};

const emptyRewardForm = (): RewardFormData => ({
  reward_type: 'bonus',
  title: '',
  description: '',
  decision_number: '',
  reward_date: '',
  amount: 0,
  issued_by: '',
  notes: '',
  payroll_period_id: '',
});

const emptyDisciplineForm = (): DisciplineFormData => ({
  discipline_type: 'warning',
  title: '',
  description: '',
  decision_number: '',
  discipline_date: '',
  penalty_amount: 0,
  issued_by: '',
  effective_from: '',
  effective_to: '',
  notes: '',
  payroll_period_id: '',
});

export const EmployeeRewardsDiscipline = ({ employeeId }: EmployeeRewardsDisciplineProps) => {
  const { t } = useTranslation();
  const {
    rewards,
    disciplines,
    payrollPeriods,
    loading,
    mutating,
    addReward,
    updateReward,
    deleteReward,
    enforceReward,
    cancelEnforceReward,
    addDiscipline,
    updateDiscipline,
    deleteDiscipline,
    enforceDiscipline,
    cancelEnforceDiscipline,
    getStats,
  } = useEmployeeRewardsDiscipline(employeeId);

  const rewardTypeLabels: Record<string, string> = {
    bonus: t('rewards.types.bonus'),
    certificate: t('rewards.types.certificate'),
    promotion: t('rewards.types.promotion'),
    recognition: t('rewards.types.recognition'),
    gift: t('rewards.types.gift'),
  };

  const disciplineTypeLabels: Record<string, string> = {
    warning: t('discipline.types.warning'),
    'written-warning': t('discipline.types.writtenWarning'),
    suspension: t('discipline.types.suspension'),
    demotion: t('discipline.types.demotion'),
    termination: t('discipline.types.termination'),
  };

  const [activeTab, setActiveTab] = useState('rewards');
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [disciplineDialogOpen, setDisciplineDialogOpen] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [editingDisciplineId, setEditingDisciplineId] = useState<string | null>(null);
  const [rewardForm, setRewardForm] = useState<RewardFormData>(emptyRewardForm);
  const [disciplineForm, setDisciplineForm] = useState<DisciplineFormData>(emptyDisciplineForm);

  const handleOpenRewardDialog = (rewardId?: string) => {
    if (rewardId) {
      const reward = rewards.find((r) => r.id === rewardId);
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
          notes: reward.notes || '',
          payroll_period_id: reward.payroll_period_id || '',
        });
      }
    } else {
      setEditingRewardId(null);
      setRewardForm(emptyRewardForm());
    }
    setRewardDialogOpen(true);
  };

  const handleOpenDisciplineDialog = (disciplineId?: string) => {
    if (disciplineId) {
      const discipline = disciplines.find((d) => d.id === disciplineId);
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
          notes: discipline.notes || '',
          payroll_period_id: discipline.payroll_period_id || '',
        });
      }
    } else {
      setEditingDisciplineId(null);
      setDisciplineForm(emptyDisciplineForm());
    }
    setDisciplineDialogOpen(true);
  };

  const handleSaveReward = async () => {
    const ok = editingRewardId
      ? await updateReward(editingRewardId, rewardForm)
      : await addReward(rewardForm);
    if (ok) setRewardDialogOpen(false);
  };

  const handleSaveDiscipline = async () => {
    const ok = editingDisciplineId
      ? await updateDiscipline(editingDisciplineId, disciplineForm)
      : await addDiscipline(disciplineForm);
    if (ok) setDisciplineDialogOpen(false);
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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  const moneyDisplay = (amount: number, display?: string | null) => {
    if (display?.trim()) return display.trim();
    if (!amount) return '';
    return formatCurrency(amount);
  };

  const stats = getStats();
  const showRewardPeriod = Number(rewardForm.amount) > 0;
  const showDisciplinePeriod = Number(disciplineForm.penalty_amount) > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-hdsd="hdsd-emp-rd-tab">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-xevn-border bg-xevn-surface shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-xevn-success/15 dark:bg-xevn-success/20">
                <ThumbsUp className="h-5 w-5 text-xevn-success" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">{t('rewards.totalRewards')}</p>
                <p className="text-2xl font-bold text-xevn-text">{stats.totalRewards}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-xevn-border bg-xevn-surface shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-xevn-primary/10 dark:bg-xevn-primary/20">
                <DollarSign className="h-5 w-5 text-xevn-primary dark:text-xevn-accent" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">{t('rewards.totalAmount')}</p>
                <p className="text-xl font-bold text-xevn-text">
                  {formatCurrency(stats.totalRewardAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-xevn-border bg-xevn-surface shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-xevn-warning/15 dark:bg-xevn-warning/20">
                <ThumbsDown className="h-5 w-5 text-xevn-warning" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">{t('discipline.totalDisciplines')}</p>
                <p className="text-2xl font-bold text-xevn-text">{stats.totalDisciplines}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-xevn-border bg-xevn-surface shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-xevn-danger/15 dark:bg-xevn-danger/20">
                <AlertTriangle className="h-5 w-5 text-xevn-danger" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">{t('discipline.activeDisciplines')}</p>
                <p className="text-2xl font-bold text-xevn-text">{stats.activeDisciplines}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="rewards" className="gap-2" data-hdsd="hdsd-emp-rd-tab-rewards">
            <Award className="h-4 w-4" />
            {t('rewards.title')} ({rewards.length})
          </TabsTrigger>
          <TabsTrigger value="discipline" className="gap-2" data-hdsd="hdsd-emp-rd-tab-discipline">
            <Scale className="h-4 w-4" />
            {t('discipline.title')} ({disciplines.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rewards">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                {t('rewards.listTitle')}
              </CardTitle>
              <Button
                size="sm"
                onClick={() => handleOpenRewardDialog()}
                data-hdsd="hdsd-emp-rd-add-reward"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('rewards.add')}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rewards.length > 0 ? (
                  rewards.map((reward) => {
                    const statusLabel =
                      reward.status_label?.trim() || rdStatusLabelFallback(reward.status);
                    const linkLabel =
                      reward.payroll_link_status_label?.trim() ||
                      rdPayrollLinkLabelFallback(reward.payroll_link_status);
                    const periodLabel =
                      reward.payroll_period_ref?.trim() ||
                      (reward.payroll_period_id ? reward.payroll_period_id.slice(0, 8) : '');
                    return (
                      <div
                        key={reward.id}
                        className="p-4 border rounded-lg"
                        data-hdsd="hdsd-emp-rd-reward-row"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-4 flex-1">
                            <div
                              className={`p-2 rounded-lg ${
                                reward.reward_type === 'bonus'
                                  ? 'bg-xevn-success/15 dark:bg-xevn-success/20 text-xevn-success'
                                  : reward.reward_type === 'certificate'
                                    ? 'bg-xevn-primary/10 dark:bg-xevn-primary/20 text-xevn-primary dark:text-xevn-accent'
                                    : reward.reward_type === 'promotion'
                                      ? 'bg-xevn-accent/15 dark:bg-xevn-accent/20 text-xevn-primary dark:text-xevn-accent'
                                      : reward.reward_type === 'recognition'
                                        ? 'bg-xevn-warning/15 dark:bg-xevn-warning/20 text-xevn-warning'
                                        : 'bg-xevn-accent/15 dark:bg-xevn-accent/20 text-xevn-primary'
                              }`}
                            >
                              {rewardTypeIcons[reward.reward_type] || (
                                <Award className="h-5 w-5" />
                              )}
                            </div>
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold">{reward.title}</h4>
                                <Badge variant="outline">
                                  {reward.reward_type_label ||
                                    rewardTypeLabels[reward.reward_type] ||
                                    reward.reward_type}
                                </Badge>
                                <Badge variant="default" data-hdsd="hdsd-emp-rd-status-label">
                                  {statusLabel}
                                </Badge>
                                <Badge variant="secondary" data-hdsd="hdsd-emp-rd-link-status">
                                  {linkLabel}
                                </Badge>
                              </div>
                              {reward.description && (
                                <p className="text-sm text-xevn-textSecondary">
                                  {reward.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm flex-wrap">
                                {reward.decision_number && (
                                  <span className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    {reward.decision_number}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDisplayDate(reward.reward_date)}
                                </span>
                                {reward.amount > 0 && (
                                  <span className="font-medium text-xevn-success">
                                    {moneyDisplay(reward.amount, reward.amount_display)}
                                  </span>
                                )}
                                {periodLabel && (
                                  <span
                                    className="text-xevn-textSecondary"
                                    data-hdsd="hdsd-emp-rd-period-label"
                                  >
                                    Kỳ: {periodLabel}
                                  </span>
                                )}
                              </div>
                              {reward.issued_by && (
                                <p className="text-sm text-xevn-textSecondary">
                                  {t('rewards.issuedBy')}: {reward.issued_by}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 pt-1">
                                {canEnforceRdCase(reward.status) && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    disabled={mutating}
                                    data-hdsd="hdsd-emp-rd-enforce"
                                    onClick={() => void enforceReward(reward.id)}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Thi hành
                                  </Button>
                                )}
                                {canCancelEnforceRdCase(reward.status) &&
                                  !canEnforceRdCase(reward.status) && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={mutating}
                                      data-hdsd="hdsd-emp-rd-cancel-enforce"
                                      onClick={() => void cancelEnforceReward(reward.id)}
                                    >
                                      <Ban className="h-4 w-4 mr-1" />
                                      Hủy thi hành
                                    </Button>
                                  )}
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canEnforceRdCase(reward.status) && (
                                <DropdownMenuItem
                                  onClick={() => handleOpenRewardDialog(reward.id)}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  {t('common.edit')}
                                </DropdownMenuItem>
                              )}
                              {canHardDeleteRdCase({
                                status: reward.status,
                                payroll_link_status: reward.payroll_link_status,
                              }) && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => void handleDeleteReward(reward.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t('common.delete')}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-xevn-textSecondary">
                    <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('rewards.empty')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discipline">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                {t('discipline.listTitle')}
              </CardTitle>
              <Button
                size="sm"
                onClick={() => handleOpenDisciplineDialog()}
                data-hdsd="hdsd-emp-rd-add-discipline"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('discipline.add')}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {disciplines.length > 0 ? (
                  disciplines.map((discipline) => {
                    const statusLabel =
                      discipline.status_label?.trim() ||
                      rdStatusLabelFallback(discipline.status);
                    const linkLabel =
                      discipline.payroll_link_status_label?.trim() ||
                      rdPayrollLinkLabelFallback(discipline.payroll_link_status);
                    const periodLabel =
                      discipline.payroll_period_ref?.trim() ||
                      (discipline.payroll_period_id
                        ? discipline.payroll_period_id.slice(0, 8)
                        : '');
                    return (
                      <div
                        key={discipline.id}
                        className="p-4 border rounded-lg"
                        data-hdsd="hdsd-emp-rd-discipline-row"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="p-2 rounded-lg bg-xevn-danger/15 dark:bg-xevn-danger/20 text-xevn-danger">
                              <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold">{discipline.title}</h4>
                                <Badge variant="outline">
                                  {discipline.discipline_type_label ||
                                    disciplineTypeLabels[discipline.discipline_type] ||
                                    discipline.discipline_type}
                                </Badge>
                                <Badge
                                  variant={
                                    canCancelEnforceRdCase(discipline.status) &&
                                    !canEnforceRdCase(discipline.status)
                                      ? 'destructive'
                                      : 'secondary'
                                  }
                                  data-hdsd="hdsd-emp-rd-status-label"
                                >
                                  {statusLabel}
                                </Badge>
                                <Badge variant="outline" data-hdsd="hdsd-emp-rd-link-status">
                                  {linkLabel}
                                </Badge>
                              </div>
                              {discipline.description && (
                                <p className="text-sm text-xevn-textSecondary">
                                  {discipline.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm flex-wrap">
                                {discipline.decision_number && (
                                  <span className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    {discipline.decision_number}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDisplayDate(discipline.discipline_date)}
                                </span>
                                {discipline.penalty_amount > 0 && (
                                  <span className="font-medium text-xevn-danger">
                                    -
                                    {moneyDisplay(
                                      discipline.penalty_amount,
                                      discipline.penalty_amount_display,
                                    )}
                                  </span>
                                )}
                                {periodLabel && (
                                  <span
                                    className="text-xevn-textSecondary"
                                    data-hdsd="hdsd-emp-rd-period-label"
                                  >
                                    Kỳ: {periodLabel}
                                  </span>
                                )}
                              </div>
                              {discipline.issued_by && (
                                <p className="text-sm text-xevn-textSecondary">
                                  {t('discipline.issuedBy')}: {discipline.issued_by}
                                </p>
                              )}
                              {(discipline.effective_from || discipline.effective_to) && (
                                <p className="text-sm text-xevn-textSecondary">
                                  {t('discipline.effectiveRange')}:{' '}
                                  {formatDisplayDate(discipline.effective_from)} -{' '}
                                  {discipline.effective_to
                                    ? formatDisplayDate(discipline.effective_to)
                                    : '—'}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 pt-1">
                                {canEnforceRdCase(discipline.status) && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    disabled={mutating}
                                    data-hdsd="hdsd-emp-rd-enforce"
                                    onClick={() => void enforceDiscipline(discipline.id)}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Thi hành
                                  </Button>
                                )}
                                {canCancelEnforceRdCase(discipline.status) &&
                                  !canEnforceRdCase(discipline.status) && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={mutating}
                                      data-hdsd="hdsd-emp-rd-cancel-enforce"
                                      onClick={() =>
                                        void cancelEnforceDiscipline(discipline.id)
                                      }
                                    >
                                      <Ban className="h-4 w-4 mr-1" />
                                      Hủy thi hành
                                    </Button>
                                  )}
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canEnforceRdCase(discipline.status) && (
                                <DropdownMenuItem
                                  onClick={() => handleOpenDisciplineDialog(discipline.id)}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  {t('common.edit')}
                                </DropdownMenuItem>
                              )}
                              {canHardDeleteRdCase({
                                status: discipline.status,
                                payroll_link_status: discipline.payroll_link_status,
                              }) && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => void handleDeleteDiscipline(discipline.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t('common.delete')}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-xevn-textSecondary">
                    <Scale className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('discipline.empty')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={rewardDialogOpen} onOpenChange={setRewardDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRewardId ? t('rewardForm.editTitle') : t('rewardForm.addTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('rewardForm.titleLabel')} *</Label>
              <Input
                value={rewardForm.title}
                onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                data-hdsd="hdsd-emp-rd-title"
                placeholder="Nhập tiêu đề trước…"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('rewardForm.type')}</Label>
                <Select
                  value={rewardForm.reward_type}
                  onValueChange={(v) => setRewardForm({ ...rewardForm, reward_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(rewardTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('rewards.rewardDate')} *</Label>
                <ViDateField
                  value={rewardForm.reward_date}
                  onValueChange={(v) => setRewardForm({ ...rewardForm, reward_date: v })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('rewardForm.description')}</Label>
              <Textarea
                value={rewardForm.description}
                onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('rewards.decisionNumber')}</Label>
                <Input
                  value={rewardForm.decision_number}
                  onChange={(e) =>
                    setRewardForm({ ...rewardForm, decision_number: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('rewards.amount')}</Label>
                <ViMoneyInput
                  value={Number(rewardForm.amount) || 0}
                  onValueChange={(n) =>
                    setRewardForm({
                      ...rewardForm,
                      amount: n,
                      payroll_period_id: n > 0 ? rewardForm.payroll_period_id : '',
                    })
                  }
                />
              </div>
            </div>
            {showRewardPeriod && (
              <div className="space-y-2" data-hdsd="hdsd-emp-rd-period-picker">
                <Label>Kỳ lương đích *</Label>
                <Select
                  value={rewardForm.payroll_period_id || undefined}
                  onValueChange={(v) =>
                    setRewardForm({ ...rewardForm, payroll_period_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn kỳ mở / điều chỉnh" />
                  </SelectTrigger>
                  <SelectContent>
                    {payrollPeriods.length === 0 ? (
                      <SelectItem value="__none" disabled>
                        Không có kỳ mở — tạo kỳ lương trước
                      </SelectItem>
                    ) : (
                      payrollPeriods.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.period_label} ({p.status})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t('rewards.issuedBy')}</Label>
              <Input
                value={rewardForm.issued_by}
                onChange={(e) => setRewardForm({ ...rewardForm, issued_by: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRewardDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => void handleSaveReward()}
              disabled={mutating}
              data-hdsd="hdsd-emp-rd-save-reward"
            >
              {editingRewardId ? t('common.edit') : t('common.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={disciplineDialogOpen} onOpenChange={setDisciplineDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDisciplineId
                ? t('disciplineForm.editTitle')
                : t('disciplineForm.addTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('disciplineForm.titleLabel')} *</Label>
              <Input
                value={disciplineForm.title}
                onChange={(e) =>
                  setDisciplineForm({ ...disciplineForm, title: e.target.value })
                }
                data-hdsd="hdsd-emp-rd-title"
                placeholder="Nhập tiêu đề trước…"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('disciplineForm.type')}</Label>
                <Select
                  value={disciplineForm.discipline_type}
                  onValueChange={(v) =>
                    setDisciplineForm({ ...disciplineForm, discipline_type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(disciplineTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('discipline.disciplineDate')} *</Label>
                <ViDateField
                  value={disciplineForm.discipline_date}
                  onValueChange={(v) =>
                    setDisciplineForm({ ...disciplineForm, discipline_date: v })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('disciplineForm.violation')}</Label>
              <Textarea
                value={disciplineForm.description}
                onChange={(e) =>
                  setDisciplineForm({ ...disciplineForm, description: e.target.value })
                }
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('discipline.decisionNumber')}</Label>
                <Input
                  value={disciplineForm.decision_number}
                  onChange={(e) =>
                    setDisciplineForm({
                      ...disciplineForm,
                      decision_number: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('discipline.penaltyAmount')}</Label>
                <ViMoneyInput
                  value={Number(disciplineForm.penalty_amount) || 0}
                  onValueChange={(n) =>
                    setDisciplineForm({
                      ...disciplineForm,
                      penalty_amount: n,
                      payroll_period_id: n > 0 ? disciplineForm.payroll_period_id : '',
                    })
                  }
                />
              </div>
            </div>
            {showDisciplinePeriod && (
              <div className="space-y-2" data-hdsd="hdsd-emp-rd-period-picker">
                <Label>Kỳ lương đích *</Label>
                <Select
                  value={disciplineForm.payroll_period_id || undefined}
                  onValueChange={(v) =>
                    setDisciplineForm({ ...disciplineForm, payroll_period_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn kỳ mở / điều chỉnh" />
                  </SelectTrigger>
                  <SelectContent>
                    {payrollPeriods.length === 0 ? (
                      <SelectItem value="__none" disabled>
                        Không có kỳ mở — tạo kỳ lương trước
                      </SelectItem>
                    ) : (
                      payrollPeriods.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.period_label} ({p.status})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('discipline.effectiveFrom')}</Label>
                <ViDateField
                  value={disciplineForm.effective_from}
                  onValueChange={(v) =>
                    setDisciplineForm({ ...disciplineForm, effective_from: v })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('discipline.effectiveTo')}</Label>
                <ViDateField
                  value={disciplineForm.effective_to}
                  onValueChange={(v) =>
                    setDisciplineForm({ ...disciplineForm, effective_to: v })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('discipline.issuedBy')}</Label>
              <Input
                value={disciplineForm.issued_by}
                onChange={(e) =>
                  setDisciplineForm({ ...disciplineForm, issued_by: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisciplineDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => void handleSaveDiscipline()}
              disabled={mutating}
              data-hdsd="hdsd-emp-rd-save-discipline"
            >
              {editingDisciplineId ? t('common.edit') : t('common.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
