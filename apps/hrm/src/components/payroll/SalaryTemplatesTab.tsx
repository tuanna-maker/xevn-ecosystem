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
  X
} from 'lucide-react';
import { useSalaryTemplates, SalaryTemplate, SalaryTemplateFormData, SalaryTemplateComponent, TemplateComponentFormData } from '@/hooks/useSalaryTemplates';
import { useSalaryComponents } from '@/hooks/useSalaryComponents';
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
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SalaryTemplate | null>(null);
  const [formData, setFormData] = useState<SalaryTemplateFormData>(initialFormData);
  const [templateComponents, setTemplateComponents] = useState<SalaryTemplateComponent[]>([]);
  const [isLoadingTemplateComponents, setIsLoadingTemplateComponents] = useState(false);

  // Fetch components when template is selected for editing
  useEffect(() => {
    if (selectedTemplate && isComponentDialogOpen) {
      setIsLoadingTemplateComponents(true);
      fetchTemplateComponents(selectedTemplate.id)
        .then(setTemplateComponents)
        .finally(() => setIsLoadingTemplateComponents(false));
    }
  }, [selectedTemplate, isComponentDialogOpen]);

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
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) return;

    try {
      if (selectedTemplate) {
        await updateTemplate({ id: selectedTemplate.id, formData });
      } else {
        await createTemplate(formData);
      }
      handleCloseDialog();
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

  const handleOpenComponentDialog = (template: SalaryTemplate) => {
    setSelectedTemplate(template);
    setIsComponentDialogOpen(true);
  };

  const handleAddComponent = async (componentId: string) => {
    if (!selectedTemplate) return;
    
    const component = allComponents.find(c => c.id === componentId);
    if (!component) return;

    try {
      await addTemplateComponent({
        templateId: selectedTemplate.id,
        componentData: {
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
      await removeTemplateComponent({
        templateId: selectedTemplate.id,
        componentId,
      });
      setTemplateComponents(prev => prev.filter(c => c.id !== componentId));
    } catch (error) {
      // Error handled in hook
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Hoạt động</Badge>;
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm mẫu bảng lương..."
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
                      <DropdownMenuItem onClick={() => handleOpenComponentDialog(template)}>
                        <Settings2 className="h-4 w-4 mr-2" />
                        {t('salaryTemplate.configComponents')}
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
                    onClick={() => handleOpenComponentDialog(template)}
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? t('salaryTemplate.editTitle') : t('salaryTemplate.addTitle')}
            </DialogTitle>
          </DialogHeader>
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
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.code || !formData.name || isCreating || isUpdating}
            >
              {isCreating || isUpdating ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Component Configuration Dialog */}
      <Dialog open={isComponentDialogOpen} onOpenChange={setIsComponentDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Cấu hình thành phần lương - {selectedTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add Component */}
            <div className="flex gap-2">
              <Select onValueChange={handleAddComponent}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Chọn thành phần để thêm..." />
                </SelectTrigger>
                <SelectContent>
                  {availableComponents.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Không còn thành phần nào để thêm
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

            {/* Components List */}
            {isLoadingTemplateComponents ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : templateComponents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có thành phần nào. Chọn thành phần từ danh sách trên để thêm.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thành phần</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Tính chất</TableHead>
                    <TableHead className="text-right">Giá trị mặc định</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templateComponents.map(tc => (
                    <TableRow key={tc.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tc.component?.name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{tc.component?.code || ''}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {tc.component?.component_type === 'fixed' ? 'Cố định' : 
                           tc.component?.component_type === 'variable' ? 'Biến đổi' : 'Công thức'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          tc.component?.nature === 'income' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        )}>
                          {tc.component?.nature === 'income' ? 'Thu nhập' : 'Khấu trừ'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {tc.default_value?.toLocaleString('vi-VN')} ₫
                      </TableCell>
                      <TableCell>
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
          <DialogFooter>
            <Button onClick={() => setIsComponentDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa mẫu bảng lương "{selectedTemplate?.name}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
