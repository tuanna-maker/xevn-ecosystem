import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Building2,
  Users,
  Loader2,
  List,
  Network,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrgChart } from './OrgChart';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DepartmentImportDialog } from './DepartmentImportDialog';

interface Department {
  id: string;
  company_id: string;
  parent_id: string | null;
  name: string;
  code: string | null;
  description: string | null;
  manager_name: string | null;
  manager_email: string | null;
  employee_count: number;
  level: number;
  sort_order: number;
  status: string;
  created_at: string;
  updated_at: string;
  children?: Department[];
}

interface DepartmentFormData {
  name: string;
  code: string;
  description: string;
  manager_name: string;
  manager_email: string;
  parent_id: string;
  status: string;
}

const initialFormData: DepartmentFormData = {
  name: '',
  code: '',
  description: '',
  manager_name: '',
  manager_email: '',
  parent_id: '',
  status: 'active',
};

export function DepartmentManagement() {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  useEffect(() => {
    if (currentCompanyId) {
      fetchDepartments();
    }
  }, [currentCompanyId]);

  const fetchDepartments = async () => {
    if (!currentCompanyId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error(t('dept.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (items: Department[], parentId: string | null = null): Department[] => {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        ...item,
        children: buildTree(items, item.id),
      }));
  };

  const flattenForSelect = (items: Department[], level = 0): { id: string; name: string; level: number }[] => {
    const result: { id: string; name: string; level: number }[] = [];
    items.forEach(item => {
      result.push({ id: item.id, name: item.name, level });
      if (item.children && item.children.length > 0) {
        result.push(...flattenForSelect(item.children, level + 1));
      }
    });
    return result;
  };

  const handleCreate = () => {
    setSelectedDepartment(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setSelectedDepartment(dept);
    setFormData({
      name: dept.name,
      code: dept.code || '',
      description: dept.description || '',
      manager_name: dept.manager_name || '',
      manager_email: dept.manager_email || '',
      parent_id: dept.parent_id || '',
      status: dept.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (dept: Department) => {
    setSelectedDepartment(dept);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!currentCompanyId) return;
    if (!formData.name.trim()) {
      toast.error(t('dept.pleaseEnterName'));
      return;
    }

    setSubmitting(true);
    try {
      const parentId = formData.parent_id === 'none' || formData.parent_id === '' ? null : formData.parent_id;
      const parentDept = parentId 
        ? departments.find(d => d.id === parentId) 
        : null;
      const level = parentDept ? parentDept.level + 1 : 1;

      const departmentData = {
        company_id: currentCompanyId,
        name: formData.name.trim(),
        code: formData.code.trim() || null,
        description: formData.description.trim() || null,
        manager_name: formData.manager_name.trim() || null,
        manager_email: formData.manager_email.trim() || null,
        parent_id: parentId,
        status: formData.status,
        level,
      };

      if (selectedDepartment) {
        const { error } = await supabase
          .from('departments')
          .update(departmentData)
          .eq('id', selectedDepartment.id);

        if (error) throw error;
        toast.success(t('dept.updateSuccess'));
      } else {
        const { error } = await supabase
          .from('departments')
          .insert(departmentData);

        if (error) throw error;
        toast.success(t('dept.createSuccess'));
      }

      setIsDialogOpen(false);
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error(t('dept.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedDepartment) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', selectedDepartment.id);

      if (error) throw error;
      toast.success(t('dept.deleteSuccess'));
      setIsDeleteDialogOpen(false);
      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error(t('dept.deleteError'));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const departmentTree = buildTree(departments);
  const flatDepartments = flattenForSelect(departmentTree);

  const renderDepartmentItem = (dept: Department, depth = 0) => {
    const hasChildren = dept.children && dept.children.length > 0;
    const isExpanded = expandedIds.has(dept.id);

    return (
      <div key={dept.id}>
        <div
          className="flex items-center gap-3 p-4 border rounded-lg hover:border-primary/50 transition-colors group"
          style={{ marginLeft: depth * 24 }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(dept.id)}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            {depth === 0 ? (
              <Building2 className="w-5 h-5 text-primary" />
            ) : (
              <Briefcase className="w-5 h-5 text-primary" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold truncate">{dept.name}</h4>
              {dept.code && (
                <Badge variant="outline" className="text-xs">
                  {dept.code}
                </Badge>
              )}
              <Badge variant={dept.status === 'active' ? 'default' : 'secondary'}>
                {dept.status === 'active' ? t('status.active') : t('status.inactive')}
              </Badge>
            </div>
            {dept.manager_name && (
              <p className="text-sm text-muted-foreground truncate">
                {t('employees.manager')}: {dept.manager_name}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{dept.employee_count}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleEdit(dept)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              onClick={() => handleDelete(dept)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {dept.children!.map(child => renderDepartmentItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">{t('company.departments')}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t('dept.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              {t('common.add')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {departments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('dept.empty')}</p>
              <Button variant="outline" className="mt-4" onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                {t('dept.createFirst')}
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="list" className="gap-2">
                  <List className="w-4 h-4" />
                  {t('dept.listView')}
                </TabsTrigger>
                <TabsTrigger value="chart" className="gap-2">
                  <Network className="w-4 h-4" />
                  {t('dept.orgChart')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="mt-0">
                <div className="space-y-2">
                  {departmentTree.map(dept => renderDepartmentItem(dept))}
                </div>
              </TabsContent>
              
              <TabsContent value="chart" className="mt-0">
                <div className="border rounded-lg bg-muted/20 min-h-[400px]">
                  <OrgChart 
                    departments={departments} 
                    onNodeClick={(dept) => handleEdit(dept)}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDepartment ? t('dept.editDept') : t('dept.createDept')}
            </DialogTitle>
            <DialogDescription>
              {selectedDepartment 
                ? t('dept.updateInfo')
                : t('dept.addToOrg')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('dept.deptName')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('dept.deptNamePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">{t('dept.deptCode')}</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="VD: HR"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent">{t('dept.parentDept')}</Label>
              <Select
                value={formData.parent_id}
                onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('dept.selectParent')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('dept.noParent')}</SelectItem>
                  {flatDepartments
                    .filter(d => d.id !== selectedDepartment?.id)
                    .map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {'—'.repeat(dept.level)} {dept.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('dept.description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('dept.descriptionPlaceholder')}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manager_name">{t('dept.managerName')}</Label>
                <Input
                  id="manager_name"
                  value={formData.manager_name}
                  onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager_email">{t('dept.managerEmail')}</Label>
                <Input
                  id="manager_email"
                  type="email"
                  value={formData.manager_email}
                  onChange={(e) => setFormData({ ...formData, manager_email: e.target.value })}
                  placeholder="email@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t('common.status.label')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('status.active')}</SelectItem>
                  <SelectItem value="inactive">{t('status.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedDepartment ? t('dept.update') : t('dept.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dept.confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dept.confirmDeleteDesc', { name: selectedDepartment?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DepartmentImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onSuccess={fetchDepartments}
        existingDepartments={departments.map(d => ({ id: d.id, name: d.name, code: d.code }))}
      />
    </>
  );
}
