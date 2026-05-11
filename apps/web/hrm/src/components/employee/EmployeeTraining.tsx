import { useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, MoreHorizontal, Pencil, Trash2, GraduationCap, Calendar, Clock, 
  Award, BookOpen, Users, Video, MapPin, 
  CheckCircle2, PlayCircle, PauseCircle, PackageOpen
} from 'lucide-react';
import { useEmployeeTraining, TrainingItem, TrainingFormData } from '@/hooks/useEmployeeTraining';

const typeColors: Record<string, string> = {
  internal: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  external: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  online: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  certification: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
};

const statusIcons: Record<string, React.ReactNode> = {
  planned: <Calendar className="h-4 w-4" />,
  'in-progress': <PlayCircle className="h-4 w-4" />,
  completed: <CheckCircle2 className="h-4 w-4" />,
  cancelled: <PauseCircle className="h-4 w-4" />
};

interface EmployeeTrainingProps {
  employeeId?: string;
}

export const EmployeeTraining = ({ employeeId: propEmployeeId }: EmployeeTrainingProps) => {
  const { t, i18n } = useTranslation();
  const { id: paramEmployeeId } = useParams();
  const employeeId = propEmployeeId || paramEmployeeId;
  const {
    trainings,
    isLoading,
    stats,
    createTraining,
    updateTraining,
    deleteTraining,
  } = useEmployeeTraining(employeeId);

  const typeLabels: Record<string, string> = {
    internal: t('training.types.internal'),
    external: t('training.types.external'),
    online: t('training.types.online'),
    certification: t('training.types.certification')
  };

  const categoryLabels: Record<string, string> = {
    technical: t('training.categories.technical'),
    'soft-skill': t('training.categories.softSkill'),
    management: t('training.categories.management'),
    compliance: t('training.categories.compliance'),
    language: t('training.categories.language'),
    other: t('training.categories.other')
  };

  const statusLabels: Record<string, string> = {
    planned: t('training.statuses.planned'),
    'in-progress': t('training.statuses.inProgress'),
    completed: t('training.statuses.completed'),
    cancelled: t('training.statuses.cancelled')
  };

  const durationUnitLabels: Record<string, string> = {
    hours: t('training.durationUnits.hours'),
    days: t('training.durationUnits.days'),
    weeks: t('training.durationUnits.weeks'),
    months: t('training.durationUnits.months')
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingItem | null>(null);
  const [skillsInput, setSkillsInput] = useState('');

  const [form, setForm] = useState<Omit<TrainingFormData, 'skills'>>({
    name: '',
    type: 'internal',
    category: 'technical',
    provider: '',
    instructor: '',
    start_date: '',
    end_date: '',
    duration: 0,
    duration_unit: 'hours',
    location: '',
    status: 'planned',
    progress: 0,
    score: null,
    certificate_number: '',
    cost: 0,
    paid_by: 'company',
    description: ''
  });

  const handleOpenDialog = (training?: TrainingItem) => {
    if (training) {
      setEditing(training);
      setSkillsInput((training.skills || []).join(', '));
      setForm({
        name: training.name,
        type: training.type,
        category: training.category,
        provider: training.provider || '',
        instructor: training.instructor || '',
        start_date: training.start_date || '',
        end_date: training.end_date || '',
        duration: training.duration,
        duration_unit: training.duration_unit,
        location: training.location || '',
        status: training.status,
        progress: training.progress,
        score: training.score,
        certificate_number: training.certificate_number || '',
        cost: training.cost,
        paid_by: training.paid_by,
        description: training.description || ''
      });
    } else {
      setEditing(null);
      setSkillsInput('');
      setForm({
        name: '',
        type: 'internal',
        category: 'technical',
        provider: '',
        instructor: '',
        start_date: '',
        end_date: '',
        duration: 0,
        duration_unit: 'hours',
        location: '',
        status: 'planned',
        progress: 0,
        score: null,
        certificate_number: '',
        cost: 0,
        paid_by: 'company',
        description: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    
    const data: TrainingFormData = {
      name: form.name,
      type: form.type,
      category: form.category,
      provider: form.provider,
      instructor: form.instructor,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      duration: form.duration,
      duration_unit: form.duration_unit,
      location: form.location,
      status: form.status,
      progress: form.progress,
      score: form.score,
      certificate_number: form.certificate_number,
      cost: form.cost,
      paid_by: form.paid_by,
      description: form.description,
      skills: skillsArray
    };

    if (editing) {
      await updateTraining(editing.id, data);
    } else {
      await createTraining(data);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteTraining(id);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'VND' }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
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
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('training.completed')}</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <PlayCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('training.inProgress')}</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('training.totalHours')}</p>
                <p className="text-2xl font-bold">{stats.totalHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('training.companyCost')}</p>
                <p className="text-xl font-bold">{formatCurrency(stats.totalCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            {t('training.title')}
          </CardTitle>
          <Button size="sm" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-1" />
            {t('training.add')}
          </Button>
        </CardHeader>
        <CardContent>
          {trainings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <PackageOpen className="h-12 w-12 mb-2" />
              <p>{t('training.empty')}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-1" />
                {t('training.add')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {trainings.map((training) => (
                <div key={training.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          training.type === 'online' ? 'bg-green-100 dark:bg-green-900' :
                          training.type === 'internal' ? 'bg-blue-100 dark:bg-blue-900' :
                          training.type === 'external' ? 'bg-purple-100 dark:bg-purple-900' :
                          'bg-orange-100 dark:bg-orange-900'
                        }`}>
                          {training.type === 'online' ? <Video className="h-5 w-5 text-green-600 dark:text-green-400" /> :
                           training.type === 'internal' ? <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" /> :
                           training.type === 'external' ? <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" /> :
                           <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{training.name}</h4>
                            <Badge className={typeColors[training.type]}>{typeLabels[training.type]}</Badge>
                            <Badge variant="outline">{categoryLabels[training.category]}</Badge>
                            <Badge variant={
                              training.status === 'completed' ? 'default' :
                              training.status === 'in-progress' ? 'secondary' :
                              training.status === 'cancelled' ? 'destructive' : 'outline'
                            } className="gap-1">
                              {statusIcons[training.status]}
                              {statusLabels[training.status]}
                            </Badge>
                          </div>
                          {training.provider && (
                            <p className="text-sm text-muted-foreground mt-1">{training.provider}</p>
                          )}
                        </div>
                      </div>

                      {/* Progress */}
                      {training.status !== 'cancelled' && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('training.progress')}</span>
                            <span className="font-medium">{t('training.progressWithPercent', { progress: training.progress })}</span>
                          </div>
                          <Progress value={training.progress} className="h-2" />
                        </div>
                      )}

                      {/* Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {(training.start_date || training.end_date) && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{training.start_date || '--'} - {training.end_date || '--'}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{training.duration} {durationUnitLabels[training.duration_unit]}</span>
                        </div>
                        {training.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{training.location}</span>
                          </div>
                        )}
                        {training.instructor && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{training.instructor}</span>
                          </div>
                        )}
                      </div>

                      {/* Skills */}
                      {training.skills && training.skills.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">{t('training.skills')}:</span>
                          {training.skills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      )}

                      {/* Score & Certificate */}
                      {training.status === 'completed' && (
                        <div className="flex items-center gap-4 pt-2 border-t">
                          {training.score !== null && (
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium">{t('training.scoreWithValue', { score: training.score })}</span>
                            </div>
                          )}
                          {training.certificate_number && (
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-primary" />
                              <span className="font-medium">{t('training.certificateWithValue', { certificate: training.certificate_number })}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(training)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          {t('training.editAction')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(training.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('training.deleteAction')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t('training.edit') : t('training.addNew')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('training.courseName')} *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('training.courseNamePlaceholder')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('training.type')}</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as TrainingFormData['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">{t('training.types.internal')}</SelectItem>
                    <SelectItem value="external">{t('training.types.external')}</SelectItem>
                    <SelectItem value="online">{t('training.types.online')}</SelectItem>
                    <SelectItem value="certification">{t('training.types.certification')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('training.categoryLabel')}</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v as TrainingFormData['category'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">{t('training.categories.technical')}</SelectItem>
                    <SelectItem value="soft-skill">{t('training.categories.softSkill')}</SelectItem>
                    <SelectItem value="management">{t('training.categories.management')}</SelectItem>
                    <SelectItem value="compliance">{t('training.categories.compliance')}</SelectItem>
                    <SelectItem value="language">{t('training.categories.language')}</SelectItem>
                    <SelectItem value="other">{t('training.categories.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('training.provider')}</Label>
                <Input
                  value={form.provider}
                  onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  placeholder={t('training.providerPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('training.instructor')}</Label>
                <Input
                  value={form.instructor}
                  onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                  placeholder={t('training.instructorPlaceholder')}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('training.startDate')}</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('training.endDate')}</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('training.duration')}</Label>
                <Input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('training.durationUnitLabel')}</Label>
                <Select
                  value={form.duration_unit}
                  onValueChange={(v) => setForm({ ...form, duration_unit: v as TrainingFormData['duration_unit'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">{t('training.durationUnits.hours')}</SelectItem>
                    <SelectItem value="days">{t('training.durationUnits.days')}</SelectItem>
                    <SelectItem value="weeks">{t('training.durationUnits.weeks')}</SelectItem>
                    <SelectItem value="months">{t('training.durationUnits.months')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('training.location')}</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder={t('training.locationPlaceholder')}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('training.statusLabel')}</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as TrainingFormData['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">{t('training.statuses.planned')}</SelectItem>
                    <SelectItem value="in-progress">{t('training.statuses.inProgress')}</SelectItem>
                    <SelectItem value="completed">{t('training.statuses.completed')}</SelectItem>
                    <SelectItem value="cancelled">{t('training.statuses.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('training.progress')}</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.progress}
                  onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('training.scoreLabel')}</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.score ?? ''}
                  onChange={(e) => setForm({ ...form, score: e.target.value ? Number(e.target.value) : null })}
                  placeholder={t('training.scorePlaceholder')}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('training.cost')}</Label>
                <Input
                  type="number"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('training.paidBy')}</Label>
                <Select
                  value={form.paid_by}
                  onValueChange={(v) => setForm({ ...form, paid_by: v as TrainingFormData['paid_by'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">{t('training.paidByOptions.company')}</SelectItem>
                    <SelectItem value="employee">{t('training.paidByOptions.employee')}</SelectItem>
                    <SelectItem value="shared">{t('training.paidByOptions.shared')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('training.certificateNumber')}</Label>
              <Input
                value={form.certificate_number}
                onChange={(e) => setForm({ ...form, certificate_number: e.target.value })}
                placeholder={t('training.certificatePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('training.skillsHint')}</Label>
              <Input
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder={t('training.skillsPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('training.description')}</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('training.cancel')}</Button>
            <Button onClick={handleSave} disabled={!form.name}>{t('training.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
