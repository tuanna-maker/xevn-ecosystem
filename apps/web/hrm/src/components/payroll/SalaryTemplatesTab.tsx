/**
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-UI-BRAND-W4-PAY-B-01
 * change_mode: UPGRADE
 * What: Precision Motion P12 salary templates — title ≥20; dialog chrome; status badges DNA
 * Why: ADR §16 · W3-PAY-B P12
 * must_keep: useSalaryTemplates API; template component wiring
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-TPL-FE-01
 * change_mode: ADD
 * What: Banner pack≠mẫu — enroll salary-templates ≠ Settings pay-sheet-templates
 * Why: QC must_keep pack≠mẫu · cấm merge pack UI as mẫu SoT
 * must_keep: useSalaryTemplates API; enroll-only surface; no pay-sheet-templates merge
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Copy, 
  Star, 
  FileText, 
  Settings2,
  Check,
  X,
  Users
} from 'lucide-react';
import { useSalaryTemplates, SalaryTemplate, SalaryTemplateFormData, SalaryTemplateComponent, TemplateComponentFormData } from '@/hooks/useSalaryTemplates';
import { useSalaryComponents } from '@/hooks/useSalaryComponents';
import { TemplateAssignmentDialog } from './TemplateAssignmentDialog';
import { cn } from '@/lib/utils';


const initialFormData: SalaryTemplateFormData = {
  code: '',
  name: '',
  description: '',
  is_default: false,
  status: 'active',
};

export const SalaryTemplatesTab = () => {
  const { t } = useTranslation();
  const {
    templates,
    isLoadingTemplates,
    fetchTemplateComponents,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    addTemplateComponent,
    updateTemplateComponent,
    removeTemplateComponent,
    duplicateTemplate,
    isCreating,
    isUpdating,
    isDeleting,
  } = useSalaryTemplates();

  const { components: allComponents, isLoading: isLoadingSalaryComponents } = useSalaryComponents();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SalaryTemplate | null>(null);
  const [formData, setFormData] = useState<SalaryTemplateFormData>(initialFormData);
  const [templateComponents, setTemplateComponents] = useState<SalaryTemplateComponent[]>([]);
  const [isLoadingTemplateComponents, setIsLoadingTemplateComponents] = useState(false);

  // Fetch components when template is selected for editing
  useEffect(() => {
    if (selectedTemplate && isDialogOpen) {
      setIsLoadingTemplateComponents(true);
      fetchTemplateComponents(selectedTemplate.id)
        .then(setTemplateComponents)
        .finally(() => setIsLoadingTemplateComponents(false));
    }
  }, [selectedTemplate, isDialogOpen]);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenDialog = (template?: SalaryTemplate) => {
    if (template) {
      setSelectedTemplate(template);
      setFormData({
        code: template.code,
        name: template.name,
        description: template.description || '',
        is_default: template.is_default,
        status: template.status,
      });
    } else {
      setSelectedTemplate(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTemplate(null);
    setFormData(initialFormData);
    setTemplateComponents([]);
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) return;

    try {
      if (selectedTemplate) {
        await updateTemplate(selectedTemplate.id, formData);
        handleCloseDialog();
      } else {
        const response = await createTemplate(formData);
        if (response && response.id) {
          const mapped = {
            id: response.id,
            company_id: response.company_id,
            code: response.code,
            name: response.name,
            description: response.description,
            is_default: Boolean(response.is_default),
            status: response.status,
            created_at: response.created_at,
            updated_at: response.updated_at,
          };
          setSelectedTemplate(mapped);
          setFormData({
            code: mapped.code,
            name: mapped.name,
            description: mapped.description || '',
            is_default: mapped.is_default,
            status: mapped.status,
          });
        } else {
          handleCloseDialog();
        }
      }
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;
    try {
      await deleteTemplate(selectedTemplate.id);
      setIsDeleteDialogOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDuplicate = async (template: SalaryTemplate) => {
    try {
      await duplicateTemplate(template.id);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleAddComponent = async (componentId: string) => {
    if (!selectedTemplate) return;
    
    const component = allComponents.find(c => c.id === componentId);
    if (!component) return;

    try {
      await addTemplateComponent({
        templateId: selectedTemplate.id,
        data: {
          component_id: componentId,
          default_value: component.default_value || 0,
          is_required: true,
          sort_order: templateComponents.length,
        },
      });
      // Refresh components
      const updated = await fetchTemplateComponents(selectedTemplate.id);
      setTemplateComponents(updated);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleRemoveComponent = async (componentId: string) => {
    if (!selectedTemplate) return;
    try {
      await removeTemplateComponent(componentId);
      setTemplateComponents(prev => prev.filter(c => c.id !== componentId));
    } catch (error) {
      // Error handled in hook
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success">Hoạt động</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Không hoạt động</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const availableComponents = allComponents.filter(
    c => !templateComponents.find(tc => tc.component_id === c.id)
  );

  return (
    <div className="space-y-4 p-6" data-testid="pay-salary-template-precision">
      <h2 className="text-[20px] font-bold font-display text-xevn-text">
        {t('payroll.template')}
      </h2>
      <p
        className="text-sm text-xevn-textSecondary max-w-3xl"
        data-testid="pay-salary-template-pack-alias-note"
      >
        Đây là <strong>gói thành phần enroll</strong> khi tuyển dụng / gán lương
        (<span className="text-muted-foreground"> (/salary-templates)</span>
        — không phải mẫu bảng lương kỳ. Mẫu cột kỳ lương nằm ở{' '}
        <strong>Cài đặt → Mẫu bảng lương</strong>
        <span className="text-muted-foreground"> (/pay-sheet-templates)</span>.
      </p>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm gói thành phần enroll…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm mẫu mới
        </Button>
      </div>

      {/* Templates Grid */}
      {isLoadingTemplates ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {searchTerm || statusFilter !== 'all' 
                ? t('salaryTemplate.noMatch')
                : t('salaryTemplate.empty')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <Card key={template.id} className={cn(
              "relative transition-shadow hover:shadow-md",
              template.is_default && "ring-2 ring-primary"
            )}>
              {template.is_default && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
                     {t('salaryTemplate.default')}
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{t('salaryTemplate.code')}: {template.code}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(template)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOpenDialog(template)}>
                        <Settings2 className="h-4 w-4 mr-2" />
                        {t('salaryTemplate.configComponents')}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsAssignmentDialogOpen(true);
                        }}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Gán nhân viên
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                        <Copy className="h-4 w-4 mr-2" />
                        {t('salaryTemplate.duplicate')}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {template.description || t('salaryTemplate.noDescription')}
                </p>
                <div className="flex items-center justify-between">
                  {getStatusBadge(template.status)}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenDialog(template)}
                  >
                    <Settings2 className="h-4 w-4 mr-1" />
                    {t('salaryTemplate.components')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Template Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? setIsDialogOpen(true) : handleCloseDialog())}>
        <DialogContent 
          className={cn(
            "flex flex-col gap-4 max-h-[96vh] transition-all duration-300",
            selectedTemplate ? "sm:max-w-[1200px]" : "sm:max-w-[500px]"
          )}
          data-testid="pay-salary-template-dialog-precision"
        >
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-[20px] font-bold font-display">
              {selectedTemplate ? t('salaryTemplate.editTitle') : t('salaryTemplate.addTitle')}
            </DialogTitle>
          </DialogHeader>

          {selectedTemplate ? (
            <div className="flex h-[60vh] md:h-[70vh] gap-6 overflow-hidden">
              {/* Left Column: Basic Info (320px) */}
              <div className="w-[320px] flex-shrink-0 flex flex-col space-y-4 rounded-lg border bg-slate-50/60 p-4 overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="code">{t('salaryTemplate.code')} *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="VD: TPL001"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Tên mẫu *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="VD: Mẫu lương nhân viên văn phòng"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả chi tiết về mẫu bảng lương..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_default">Đặt làm mẫu mặc định</Label>
                  <Switch
                    id="is_default"
                    checked={formData.is_default}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
                  />
                </div>
                <div className="pt-2 flex flex-col gap-2 mt-auto">
                  <Button 
                    type="button"
                    onClick={handleSubmit}
                    disabled={!formData.code || !formData.name || isUpdating}
                    className="w-full"
                  >
                    {isUpdating ? 'Đang lưu...' : 'Lưu thông tin'}
                  </Button>
                  <Button variant="outline" onClick={handleCloseDialog} className="w-full">
                    Đóng
                  </Button>
                </div>
              </div>

              {/* Right Column: Components list (flex-1) */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 flex flex-col">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-semibold text-xevn-text">Thành phần lương trong mẫu</h3>
                  <div className="w-64">
                    <Select onValueChange={handleAddComponent}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Thêm thành phần..." />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingSalaryComponents ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">Đang tải Nest…</div>
                        ) : allComponents.length === 0 ? (
                          <div className="p-2 text-xs text-muted-foreground text-center">
                            Nest salary_components trống.
                          </div>
                        ) : availableComponents.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            Không còn thành phần nào
                          </div>
                        ) : (
                          availableComponents.map(component => (
                            <SelectItem key={component.id} value={component.id}>
                              <div className="flex items-center gap-2">
                                <span>{component.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {component.nature === 'income' ? 'Thu nhập' : 'Khấu trừ'}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-[300px]">
                  {isLoadingTemplateComponents ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  ) : templateComponents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Chưa có thành phần nào. Chọn thành phần từ danh sách trên để thêm.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">TT</TableHead>
                          <TableHead>Thành phần</TableHead>
                          <TableHead>Loại</TableHead>
                          <TableHead>Tính chất</TableHead>
                          <TableHead className="text-right w-[160px]">Giá trị mặc định</TableHead>
                          <TableHead className="w-12 text-center" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {templateComponents
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map(tc => (
                            <TableRow key={tc.id}>
                              <TableCell>
                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  className="h-8 w-12 text-center p-1 font-mono"
                                  value={tc.sort_order}
                                  onChange={async (e) => {
                                    const val = Number(e.target.value.replace(/\D/g, '')) || 0;
                                    setTemplateComponents(prev => 
                                      prev.map(item => item.id === tc.id ? { ...item, sort_order: val } : item)
                                    );
                                    await updateTemplateComponent({
                                      componentRowId: tc.id,
                                      data: { sort_order: val }
                                    });
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{tc.component?.name || 'N/A'}</p>
                                  <p className="text-xs text-muted-foreground">{tc.component?.code || ''}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {tc.component?.component_type === 'fixed' ? 'Cố định' : 
                                   tc.component?.component_type === 'variable' ? 'Biến đổi' : 'Công thức'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn(
                                  "text-xs",
                                  tc.component?.nature === 'income' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                )}>
                                  {tc.component?.nature === 'income' ? 'Thu nhập' : 'Khấu trừ'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="text"
                                  className="h-8 text-right font-mono text-sm"
                                  defaultValue={tc.default_value}
                                  onBlur={async (e) => {
                                    const rawVal = e.target.value.replace(/\./g, '').replace(/,/g, '');
                                    const val = Number(rawVal) || 0;
                                    await updateTemplateComponent({
                                      componentRowId: tc.id,
                                      data: { default_value: val }
                                    });
                                    const updated = await fetchTemplateComponents(selectedTemplate.id);
                                    setTemplateComponents(updated);
                                  }}
                                  onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                      const target = e.target as HTMLInputElement;
                                      const rawVal = target.value.replace(/\./g, '').replace(/,/g, '');
                                      const val = Number(rawVal) || 0;
                                      await updateTemplateComponent({
                                        componentRowId: tc.id,
                                        data: { default_value: val }
                                      });
                                      const updated = await fetchTemplateComponents(selectedTemplate.id);
                                      setTemplateComponents(updated);
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleRemoveComponent(tc.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">{t('salaryTemplate.code')} *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="VD: TPL001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Hoạt động</SelectItem>
                        <SelectItem value="inactive">Không hoạt động</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Tên mẫu *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="VD: Mẫu lương nhân viên văn phòng"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả chi tiết về mẫu bảng lương..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_default">Đặt làm mẫu mặc định</Label>
                  <Switch
                    id="is_default"
                    checked={formData.is_default}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
                  />
                </div>
              </div>
              <DialogFooter className="shrink-0 pt-4">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Hủy
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.code || !formData.name || isCreating}
                >
                  {isCreating ? 'Đang tạo...' : 'Tạo mẫu'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('salaryTemplate.deleteConfirmMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {isDeleting ? t('common.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TemplateAssignmentDialog
        isOpen={isAssignmentDialogOpen}
        onClose={() => {
          setIsAssignmentDialogOpen(false);
          setSelectedTemplate(null);
        }}
        templateId={selectedTemplate?.id || null}
        templateName={selectedTemplate?.name || ''}
      />
    </div>
  );
};
