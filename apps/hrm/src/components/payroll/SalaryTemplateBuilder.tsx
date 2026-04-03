import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Plus,
  GripVertical,
  Trash2,
  Settings2,
  Calculator,
  DollarSign,
  Minus,
  Building2,
  Users,
  Calendar as CalendarIcon,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronRight,
  Save,
  X,
  Copy,
  ArrowLeft,
  Info,
  Percent,
  Hash,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useSalaryTemplates, SalaryTemplate, SalaryTemplateFormData, SalaryTemplateComponent, TemplateComponentFormData } from '@/hooks/useSalaryTemplates';
import { useSalaryComponents, SalaryComponent } from '@/hooks/useSalaryComponents';
import { FormulaInput } from '@/components/payroll/FormulaInput';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ExtendedSalaryTemplateFormData extends SalaryTemplateFormData {
  applicable_departments: string[];
  applicable_positions: string[];
  applicable_employment_types: string[];
  effective_from: string | null;
  effective_to: string | null;
  notes: string;
  total_income_formula: string;
  total_deduction_formula: string;
  net_salary_formula: string;
}

interface ExtendedTemplateComponent extends TemplateComponentFormData {
  id?: string;
  formula: string;
  condition_formula: string;
  min_value: number | null;
  max_value: number | null;
  apply_tax: boolean;
  apply_insurance: boolean;
  description: string;
  is_visible: boolean;
  is_editable: boolean;
  component?: SalaryComponent;
}

interface SalaryTemplateBuilderProps {
  template?: SalaryTemplate | null;
  onClose: () => void;
  onSave: () => void;
}

const initialFormData: ExtendedSalaryTemplateFormData = {
  code: '',
  name: '',
  description: '',
  is_default: false,
  status: 'active',
  applicable_departments: [],
  applicable_positions: [],
  applicable_employment_types: [],
  effective_from: null,
  effective_to: null,
  notes: '',
  total_income_formula: '',
  total_deduction_formula: '',
  net_salary_formula: '',
};

const employmentTypes = [
  { value: 'full-time', label: 'Toàn thời gian' },
  { value: 'part-time', label: 'Bán thời gian' },
  { value: 'contract', label: 'Hợp đồng' },
  { value: 'intern', label: 'Thực tập sinh' },
  { value: 'seasonal', label: 'Thời vụ' },
];

export const SalaryTemplateBuilder = ({ template, onClose, onSave }: SalaryTemplateBuilderProps) => {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const {
    createTemplate,
    updateTemplate,
    fetchTemplateComponents,
    addTemplateComponent,
    removeTemplateComponent,
    updateTemplateComponent,
    isCreating,
    isUpdating,
  } = useSalaryTemplates();

  const { components: allComponents, isLoading: isLoadingSalaryComponents } = useSalaryComponents();

  const [formData, setFormData] = useState<ExtendedSalaryTemplateFormData>(initialFormData);
  const [templateComponents, setTemplateComponents] = useState<ExtendedTemplateComponent[]>([]);
  const [isLoadingComponents, setIsLoadingComponents] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [positions, setPositions] = useState<string[]>([]);

  // Fetch departments and positions
  useEffect(() => {
    const fetchDepartmentsAndPositions = async () => {
      if (!currentCompanyId) return;

      const { data: deptData } = await supabase
        .from('departments')
        .select('id, name')
        .eq('company_id', currentCompanyId)
        .eq('status', 'active');

      if (deptData) setDepartments(deptData);

      const { data: empData } = await supabase
        .from('employees')
        .select('position')
        .eq('company_id', currentCompanyId)
        .not('position', 'is', null);

      if (empData) {
        const uniquePositions = [...new Set(empData.map(e => e.position).filter(Boolean))];
        setPositions(uniquePositions as string[]);
      }
    };

    fetchDepartmentsAndPositions();
  }, [currentCompanyId]);

  // Load template data
  useEffect(() => {
    if (template) {
      setFormData({
        code: template.code,
        name: template.name,
        description: template.description || '',
        is_default: template.is_default,
        status: template.status,
        applicable_departments: (template as any).applicable_departments || [],
        applicable_positions: (template as any).applicable_positions || [],
        applicable_employment_types: (template as any).applicable_employment_types || [],
        effective_from: (template as any).effective_from || null,
        effective_to: (template as any).effective_to || null,
        notes: (template as any).notes || '',
        total_income_formula: (template as any).total_income_formula || '',
        total_deduction_formula: (template as any).total_deduction_formula || '',
        net_salary_formula: (template as any).net_salary_formula || '',
      });

      // Load template components
      setIsLoadingComponents(true);
      fetchTemplateComponents(template.id)
        .then((components) => {
          const extendedComponents: ExtendedTemplateComponent[] = components.map(c => ({
            component_id: c.component_id,
            default_value: c.default_value,
            is_required: c.is_required,
            sort_order: c.sort_order,
            id: c.id,
            formula: (c as any).formula || '',
            condition_formula: (c as any).condition_formula || '',
            min_value: (c as any).min_value,
            max_value: (c as any).max_value,
            apply_tax: (c as any).apply_tax ?? true,
            apply_insurance: (c as any).apply_insurance ?? false,
            description: (c as any).description || '',
            is_visible: (c as any).is_visible ?? true,
            is_editable: (c as any).is_editable ?? true,
            component: c.component as SalaryComponent,
          }));
          setTemplateComponents(extendedComponents.sort((a, b) => a.sort_order - b.sort_order));
        })
        .finally(() => setIsLoadingComponents(false));
    }
  }, [template]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(templateComponents);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update sort_order
    const updatedItems = items.map((item, index) => ({
      ...item,
      sort_order: index,
    }));

    setTemplateComponents(updatedItems);
  };

  const handleAddComponent = (component: SalaryComponent) => {
    if (templateComponents.find(tc => tc.component_id === component.id)) {
      toast.error('Thành phần này đã có trong mẫu');
      return;
    }

    const newComponent: ExtendedTemplateComponent = {
      component_id: component.id,
      default_value: component.default_value || 0,
      is_required: true,
      sort_order: templateComponents.length,
      formula: component.formula || '',
      condition_formula: '',
      min_value: null,
      max_value: null,
      apply_tax: component.is_taxable ?? true,
      apply_insurance: false,
      description: '',
      is_visible: true,
      is_editable: true,
      component: component,
    };

    setTemplateComponents([...templateComponents, newComponent]);
    toast.success(t('salaryTemplate.componentAdded'));
  };

  const handleRemoveComponent = (componentId: string) => {
    setTemplateComponents(templateComponents.filter(tc => tc.component_id !== componentId));
    if (selectedComponentId === componentId) {
      setSelectedComponentId(null);
    }
  };

  const handleUpdateComponent = (componentId: string, updates: Partial<ExtendedTemplateComponent>) => {
    setTemplateComponents(templateComponents.map(tc => 
      tc.component_id === componentId ? { ...tc, ...updates } : tc
    ));
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      toast.error(t('salaryTemplate.pleaseEnterCodeName'));
      return;
    }

    try {
      let templateId = template?.id;

      // Create or update template
      if (template) {
        await updateTemplate({
          id: template.id,
          formData: {
            ...formData,
          } as any,
        });
      } else {
        const result = await supabase
          .from('salary_templates')
          .insert({
            company_id: currentCompanyId,
            ...formData,
          })
          .select()
          .single();

        if (result.error) throw result.error;
        templateId = result.data.id;
      }

      // Update components
      if (templateId) {
        // Remove existing components and add new ones
        if (template) {
          await supabase
            .from('salary_template_components')
            .delete()
            .eq('template_id', templateId);
        }

        if (templateComponents.length > 0) {
          const componentsToInsert = templateComponents.map((tc, index) => ({
            template_id: templateId,
            component_id: tc.component_id,
            default_value: tc.default_value,
            is_required: tc.is_required,
            sort_order: index,
            formula: tc.formula || null,
            condition_formula: tc.condition_formula || null,
            min_value: tc.min_value,
            max_value: tc.max_value,
            apply_tax: tc.apply_tax,
            apply_insurance: tc.apply_insurance,
            description: tc.description || null,
            is_visible: tc.is_visible,
            is_editable: tc.is_editable,
          }));

          await supabase
            .from('salary_template_components')
            .insert(componentsToInsert);
        }
      }

      toast.success(template ? t('salaryTemplate.updateSuccess') : t('salaryTemplate.createSuccess'));
      onSave();
    } catch (error: any) {
      console.error('Error saving template:', error);
      if (error.code === '23505') {
        toast.error(t('salaryTemplate.codeExists'));
      } else {
        toast.error(t('salaryTemplate.saveError'));
      }
    }
  };

  const incomeComponents = templateComponents.filter(tc => tc.component?.nature === 'income');
  const deductionComponents = templateComponents.filter(tc => tc.component?.nature === 'deduction');
  const otherComponents = templateComponents.filter(tc => tc.component?.nature === 'other');

  const selectedComponent = templateComponents.find(tc => tc.component_id === selectedComponentId);

  const availableComponents = allComponents.filter(
    c => !templateComponents.find(tc => tc.component_id === c.id)
  );

  const componentCategories = [...new Set(availableComponents.map(c => c.category))];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">
              {template ? 'Chỉnh sửa mẫu bảng lương' : 'Tạo mẫu bảng lương mới'}
            </h2>
            <p className="text-sm text-muted-foreground">
              Xây dựng mẫu bảng lương linh hoạt cho đơn vị của bạn
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isCreating || isUpdating}>
            <Save className="h-4 w-4 mr-2" />
            {isCreating || isUpdating ? 'Đang lưu...' : 'Lưu mẫu'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-12 h-full">
          {/* Left Panel - Component Library */}
          <div className="col-span-3 border-r bg-muted/30 overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-medium mb-2">Thư viện thành phần</h3>
              <Input placeholder="Tìm kiếm thành phần..." className="h-9" />
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2">
                <Accordion type="multiple" className="space-y-1">
                  {componentCategories.map(category => {
                    const categoryStr = String(category);
                    return (
                    <AccordionItem key={categoryStr} value={categoryStr} className="border rounded-lg bg-background">
                      <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                        <span className="font-medium">{categoryStr}</span>
                        <Badge variant="secondary" className="ml-2">
                          {availableComponents.filter(c => c.category === category).length}
                        </Badge>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 pb-2">
                        <div className="space-y-1">
                          {availableComponents
                            .filter(c => c.category === category)
                            .map(component => (
                              <button
                                key={component.id}
                                onClick={() => handleAddComponent(component)}
                                className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors text-left group"
                              >
                                <div className={cn(
                                  "w-2 h-2 rounded-full flex-shrink-0",
                                  component.nature === 'income' ? 'bg-green-500' :
                                  component.nature === 'deduction' ? 'bg-red-500' : 'bg-gray-500'
                                )} />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{component.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{component.code}</p>
                                </div>
                                <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary flex-shrink-0" />
                              </button>
                            ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );})}
                </Accordion>
              </div>
            </ScrollArea>
          </div>

          {/* Middle Panel - Template Builder */}
          <div className="col-span-6 overflow-hidden flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="border-b px-4">
                <TabsList className="h-12">
                  <TabsTrigger value="basic" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Thông tin cơ bản
                  </TabsTrigger>
                  <TabsTrigger value="components" className="gap-2">
                    <Calculator className="h-4 w-4" />
                    Thành phần lương
                  </TabsTrigger>
                  <TabsTrigger value="scope" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    Phạm vi áp dụng
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <TabsContent value="basic" className="p-4 m-0">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="code">Mã mẫu *</Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                          placeholder="VD: TPL_VANPHONG_01"
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
                            <SelectItem value="active">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Hoạt động
                              </div>
                            </SelectItem>
                            <SelectItem value="inactive">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                Không hoạt động
                              </div>
                            </SelectItem>
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

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label>Đặt làm mẫu mặc định</Label>
                        <p className="text-sm text-muted-foreground">
                          Mẫu này sẽ được áp dụng cho nhân viên mới khi không có mẫu cụ thể
                        </p>
                      </div>
                      <Switch
                        checked={formData.is_default}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Công thức tính tổng</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Tổng thu nhập</Label>
                          <FormulaInput
                            value={formData.total_income_formula}
                            onChange={(value) => setFormData(prev => ({ ...prev, total_income_formula: value }))}
                            placeholder="VD: =SUM(LUONG_CO_BAN,PHU_CAP,THUONG)"
                            availableComponents={allComponents.map(c => ({ code: c.code, name: c.name }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tổng khấu trừ</Label>
                          <FormulaInput
                            value={formData.total_deduction_formula}
                            onChange={(value) => setFormData(prev => ({ ...prev, total_deduction_formula: value }))}
                            placeholder="VD: =SUM(BHXH_NV,BHYT_NV,BHTN_NV,THUE_TNCN)"
                            availableComponents={allComponents.map(c => ({ code: c.code, name: c.name }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Thực lĩnh</Label>
                          <FormulaInput
                            value={formData.net_salary_formula}
                            onChange={(value) => setFormData(prev => ({ ...prev, net_salary_formula: value }))}
                            placeholder="VD: =TONG_THU_NHAP-TONG_KHAU_TRU"
                            availableComponents={allComponents.map(c => ({ code: c.code, name: c.name }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Ghi chú</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Ghi chú thêm về mẫu bảng lương..."
                        rows={2}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="components" className="p-4 m-0">
                  {templateComponents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">Chưa có thành phần nào</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Chọn thành phần từ thư viện bên trái để thêm vào mẫu
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Income Components */}
                      {incomeComponents.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            <h4 className="font-medium text-green-700">Thu nhập ({incomeComponents.length})</h4>
                          </div>
                          <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="income-components">
                              {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                  {incomeComponents.map((tc, index) => (
                                    <Draggable key={tc.component_id} draggableId={tc.component_id} index={index}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className={cn(
                                            "flex items-center gap-2 p-3 rounded-lg border bg-background transition-colors",
                                            snapshot.isDragging && "shadow-lg",
                                            selectedComponentId === tc.component_id && "ring-2 ring-primary"
                                          )}
                                        >
                                          <div {...provided.dragHandleProps} className="cursor-grab">
                                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                                          </div>
                                          <div 
                                            className="flex-1 cursor-pointer"
                                            onClick={() => setSelectedComponentId(tc.component_id)}
                                          >
                                            <div className="flex items-center gap-2">
                                              <p className="font-medium">{tc.component?.name}</p>
                                              {tc.formula && (
                                                <Badge variant="outline" className="text-xs">
                                                  <Calculator className="h-3 w-3 mr-1" />
                                                  Công thức
                                                </Badge>
                                              )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{tc.component?.code}</p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {!tc.is_visible && <EyeOff className="h-4 w-4 text-muted-foreground" />}
                                            {!tc.is_editable && <Lock className="h-4 w-4 text-muted-foreground" />}
                                            <span className="font-medium text-green-600">
                                              +{tc.default_value?.toLocaleString('vi-VN')} ₫
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 text-destructive hover:text-destructive"
                                              onClick={() => handleRemoveComponent(tc.component_id)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </DragDropContext>
                        </div>
                      )}

                      {/* Deduction Components */}
                      {deductionComponents.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Minus className="h-5 w-5 text-red-500" />
                            <h4 className="font-medium text-red-700">Khấu trừ ({deductionComponents.length})</h4>
                          </div>
                          <div className="space-y-2">
                            {deductionComponents.map((tc) => (
                              <div
                                key={tc.component_id}
                                className={cn(
                                  "flex items-center gap-2 p-3 rounded-lg border bg-background transition-colors cursor-pointer",
                                  selectedComponentId === tc.component_id && "ring-2 ring-primary"
                                )}
                                onClick={() => setSelectedComponentId(tc.component_id)}
                              >
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{tc.component?.name}</p>
                                    {tc.formula && (
                                      <Badge variant="outline" className="text-xs">
                                        <Calculator className="h-3 w-3 mr-1" />
                                        Công thức
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">{tc.component?.code}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {!tc.is_visible && <EyeOff className="h-4 w-4 text-muted-foreground" />}
                                  {!tc.is_editable && <Lock className="h-4 w-4 text-muted-foreground" />}
                                  <span className="font-medium text-red-600">
                                    -{tc.default_value?.toLocaleString('vi-VN')} ₫
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveComponent(tc.component_id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Other Components */}
                      {otherComponents.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Hash className="h-5 w-5 text-gray-500" />
                            <h4 className="font-medium text-gray-700">Khác ({otherComponents.length})</h4>
                          </div>
                          <div className="space-y-2">
                            {otherComponents.map((tc) => (
                              <div
                                key={tc.component_id}
                                className={cn(
                                  "flex items-center gap-2 p-3 rounded-lg border bg-background transition-colors cursor-pointer",
                                  selectedComponentId === tc.component_id && "ring-2 ring-primary"
                                )}
                                onClick={() => setSelectedComponentId(tc.component_id)}
                              >
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                <div className="flex-1">
                                  <p className="font-medium">{tc.component?.name}</p>
                                  <p className="text-xs text-muted-foreground">{tc.component?.code}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-600">
                                    {tc.default_value?.toLocaleString('vi-VN')}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveComponent(tc.component_id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="scope" className="p-4 m-0">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">Phòng ban áp dụng</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {departments.map(dept => (
                          <div key={dept.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`dept-${dept.id}`}
                              checked={formData.applicable_departments.includes(dept.name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    applicable_departments: [...prev.applicable_departments, dept.name]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    applicable_departments: prev.applicable_departments.filter(d => d !== dept.name)
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={`dept-${dept.id}`} className="text-sm font-normal cursor-pointer">
                              {dept.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {departments.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">Chưa có phòng ban nào</p>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">Vị trí công việc áp dụng</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {positions.map(position => (
                          <div key={position} className="flex items-center space-x-2">
                            <Checkbox
                              id={`pos-${position}`}
                              checked={formData.applicable_positions.includes(position)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    applicable_positions: [...prev.applicable_positions, position]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    applicable_positions: prev.applicable_positions.filter(p => p !== position)
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={`pos-${position}`} className="text-sm font-normal cursor-pointer">
                              {position}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {positions.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">Chưa có vị trí nào</p>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">Loại hình lao động</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {employmentTypes.map(type => (
                          <div key={type.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`emp-${type.value}`}
                              checked={formData.applicable_employment_types.includes(type.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    applicable_employment_types: [...prev.applicable_employment_types, type.value]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    applicable_employment_types: prev.applicable_employment_types.filter(t => t !== type.value)
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={`emp-${type.value}`} className="text-sm font-normal cursor-pointer">
                              {type.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">Thời gian hiệu lực</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Từ ngày</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formData.effective_from && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.effective_from ? format(new Date(formData.effective_from), 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={formData.effective_from ? new Date(formData.effective_from) : undefined}
                                onSelect={(date) => setFormData(prev => ({ 
                                  ...prev, 
                                  effective_from: date ? format(date, 'yyyy-MM-dd') : null 
                                }))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label>Đến ngày</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formData.effective_to && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.effective_to ? format(new Date(formData.effective_to), 'dd/MM/yyyy', { locale: vi }) : t('salaryTemplate.noLimit')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={formData.effective_to ? new Date(formData.effective_to) : undefined}
                                onSelect={(date) => setFormData(prev => ({ 
                                  ...prev, 
                                  effective_to: date ? format(date, 'yyyy-MM-dd') : null 
                                }))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Right Panel - Component Config */}
          <div className="col-span-3 border-l bg-muted/30 overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-medium">Cấu hình thành phần</h3>
              <p className="text-sm text-muted-foreground">
                Chọn một thành phần để cấu hình chi tiết
              </p>
            </div>
            <ScrollArea className="flex-1">
              {selectedComponent ? (
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      selectedComponent.component?.nature === 'income' ? 'bg-green-500' :
                      selectedComponent.component?.nature === 'deduction' ? 'bg-red-500' : 'bg-gray-500'
                    )} />
                    <h4 className="font-medium">{selectedComponent.component?.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedComponent.component?.code}</p>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Giá trị mặc định</Label>
                      <Input
                        type="number"
                        value={selectedComponent.default_value || 0}
                        onChange={(e) => handleUpdateComponent(selectedComponent.component_id, { 
                          default_value: parseFloat(e.target.value) || 0 
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Công thức tính</Label>
                      <FormulaInput
                        value={selectedComponent.formula}
                        onChange={(value) => handleUpdateComponent(selectedComponent.component_id, { formula: value })}
                        placeholder="VD: =LUONG_CO_BAN*SO_NGAY_LAM_VIEC/26"
                        availableComponents={allComponents.map(c => ({ code: c.code, name: c.name }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Điều kiện áp dụng</Label>
                      <FormulaInput
                        value={selectedComponent.condition_formula}
                        onChange={(value) => handleUpdateComponent(selectedComponent.component_id, { condition_formula: value })}
                        placeholder="VD: SO_NGAY_LAM_VIEC >= 22"
                        availableComponents={allComponents.map(c => ({ code: c.code, name: c.name }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Giá trị tối thiểu</Label>
                        <Input
                          type="number"
                          value={selectedComponent.min_value ?? ''}
                          onChange={(e) => handleUpdateComponent(selectedComponent.component_id, { 
                            min_value: e.target.value ? parseFloat(e.target.value) : null 
                          })}
                          placeholder="Không giới hạn"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Giá trị tối đa</Label>
                        <Input
                          type="number"
                          value={selectedComponent.max_value ?? ''}
                          onChange={(e) => handleUpdateComponent(selectedComponent.component_id, { 
                            max_value: e.target.value ? parseFloat(e.target.value) : null 
                          })}
                          placeholder="Không giới hạn"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Mô tả</Label>
                      <Textarea
                        value={selectedComponent.description}
                        onChange={(e) => handleUpdateComponent(selectedComponent.component_id, { description: e.target.value })}
                        placeholder="Mô tả về thành phần này..."
                        rows={2}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Tính thuế TNCN</Label>
                          <p className="text-xs text-muted-foreground">Thành phần này chịu thuế</p>
                        </div>
                        <Switch
                          checked={selectedComponent.apply_tax}
                          onCheckedChange={(checked) => handleUpdateComponent(selectedComponent.component_id, { apply_tax: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Tính bảo hiểm</Label>
                          <p className="text-xs text-muted-foreground">Đóng BHXH, BHYT, BHTN</p>
                        </div>
                        <Switch
                          checked={selectedComponent.apply_insurance}
                          onCheckedChange={(checked) => handleUpdateComponent(selectedComponent.component_id, { apply_insurance: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Hiển thị trên phiếu lương</Label>
                          <p className="text-xs text-muted-foreground">Nhân viên có thể xem</p>
                        </div>
                        <Switch
                          checked={selectedComponent.is_visible}
                          onCheckedChange={(checked) => handleUpdateComponent(selectedComponent.component_id, { is_visible: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Cho phép chỉnh sửa</Label>
                          <p className="text-xs text-muted-foreground">Có thể thay đổi khi tính lương</p>
                        </div>
                        <Switch
                          checked={selectedComponent.is_editable}
                          onCheckedChange={(checked) => handleUpdateComponent(selectedComponent.component_id, { is_editable: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Bắt buộc</Label>
                          <p className="text-xs text-muted-foreground">Thành phần bắt buộc có</p>
                        </div>
                        <Switch
                          checked={selectedComponent.is_required}
                          onCheckedChange={(checked) => handleUpdateComponent(selectedComponent.component_id, { is_required: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Settings2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Chọn một thành phần từ danh sách để cấu hình chi tiết
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};
