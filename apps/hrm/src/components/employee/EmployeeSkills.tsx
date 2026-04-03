import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Zap, Code, Languages, Wrench, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EmployeeSkillsProps {
  employeeId: string;
}

interface Skill {
  id: string;
  category: string;
  name: string;
  level: number;
  notes: string | null;
}

const categoryIconMap = {
  technical: Code,
  soft: Zap,
  language: Languages,
  tools: Wrench,
};

const categoryColorMap: Record<string, string> = {
  technical: 'bg-blue-500',
  soft: 'bg-yellow-500',
  language: 'bg-green-500',
  tools: 'bg-purple-500',
};

export function EmployeeSkills({ employeeId }: EmployeeSkillsProps) {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    category: 'technical',
    name: '',
    level: 50,
    notes: '',
  });

  const categoryConfig: Record<string, { name: string; icon: typeof Code; color: string }> = {
    technical: { name: t('skills.categories.technical'), icon: Code, color: 'bg-blue-500' },
    soft: { name: t('skills.categories.soft'), icon: Zap, color: 'bg-yellow-500' },
    language: { name: t('skills.categories.language'), icon: Languages, color: 'bg-green-500' },
    tools: { name: t('skills.categories.tools'), icon: Wrench, color: 'bg-purple-500' },
  };

  function getSkillBadge(level: number) {
    if (level >= 90) return { label: t('skills.levels.expert'), variant: 'default' as const };
    if (level >= 70) return { label: t('skills.levels.good'), variant: 'secondary' as const };
    if (level >= 50) return { label: t('skills.levels.intermediate'), variant: 'outline' as const };
    return { label: t('skills.levels.basic'), variant: 'outline' as const };
  }

  useEffect(() => {
    if (employeeId && currentCompanyId) {
      fetchSkills();
    }
  }, [employeeId, currentCompanyId]);

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_skills')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('company_id', currentCompanyId)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast.error(t('skills.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingSkill(null);
    setFormData({ category: 'technical', name: '', level: 50, notes: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      category: skill.category,
      name: skill.name,
      level: skill.level,
      notes: skill.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error(t('skills.skillNameRequired'));
      return;
    }

    setSaving(true);
    try {
      if (editingSkill) {
        const { error } = await supabase
          .from('employee_skills')
          .update({
            category: formData.category,
            name: formData.name,
            level: formData.level,
            notes: formData.notes || null,
          })
          .eq('id', editingSkill.id);

        if (error) throw error;
        toast.success(t('skills.updateSuccess'));
      } else {
        const { error } = await supabase
          .from('employee_skills')
          .insert({
            employee_id: employeeId,
            company_id: currentCompanyId,
            category: formData.category,
            name: formData.name,
            level: formData.level,
            notes: formData.notes || null,
          });

        if (error) throw error;
        toast.success(t('skills.createSuccess'));
      }

      setDialogOpen(false);
      fetchSkills();
    } catch (error) {
      console.error('Error saving skill:', error);
      toast.error(t('skills.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (skillId: string) => {
    if (!confirm(t('skills.deleteConfirm'))) return;

    try {
      const { error } = await supabase
        .from('employee_skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;
      toast.success(t('skills.deleteSuccess'));
      fetchSkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast.error(t('skills.deleteError'));
    }
  };

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

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
        <h3 className="text-lg font-semibold">{t('skills.title')}</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              {t('skills.add')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSkill ? t('skills.edit') : t('skills.addNew')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('skills.categoryLabel')}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('skills.skillName')} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('skills.skillNamePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('skills.proficiency')}: {formData.level}%</Label>
                <Slider
                  value={[formData.level]}
                  onValueChange={(value) => setFormData({ ...formData, level: value[0] })}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t('skills.levels.basic')}</span>
                  <span>{t('skills.levels.intermediate')}</span>
                  <span>{t('skills.levels.good')}</span>
                  <span>{t('skills.levels.expert')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('skills.notes')}</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('skills.notesPlaceholder')}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('skills.cancel')}
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingSkill ? t('skills.update') : t('skills.addNew2')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {skills.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Zap className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('skills.empty')}</p>
            <Button variant="outline" className="mt-4" onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              {t('skills.addFirst')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(categoryConfig).map(([categoryKey, config]) => {
            const categorySkills = groupedSkills[categoryKey] || [];
            if (categorySkills.length === 0) return null;

            const IconComponent = config.icon;

            return (
              <Card key={categoryKey}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center text-white ${config.color}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    {config.name}
                    <Badge variant="secondary" className="ml-auto">
                      {categorySkills.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categorySkills.map((skill) => {
                      const badge = getSkillBadge(skill.level);
                      return (
                        <div key={skill.id} className="group">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{skill.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant={badge.variant} className="text-xs">
                                {badge.label}
                              </Badge>
                              <div className="hidden group-hover:flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => openEditDialog(skill)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive"
                                  onClick={() => handleDelete(skill.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <Progress value={skill.level} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
