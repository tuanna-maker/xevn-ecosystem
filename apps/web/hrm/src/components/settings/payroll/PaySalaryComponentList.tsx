/**
 * @CODE-MEMORY
 * Screen:     /settings?tab=pay-salary-components · /payroll tab Thành phần lương
 * Purpose:    Apple-style UI + Nest CRUD salary-components + công thức gợi ý (FormulaInput).
 * WorkItem:   PO-HRM-SETTINGS-PAY-LIVE-WIRE-01
 * Callers:    Settings.tsx · Payroll.tsx (tab components)
 * Callees:    useSalaryComponents · useSettingsCatalogsOverview · FormulaInput
 * must_keep:  component_type = pay_types catalog; formula legacy hint (không engine SoT)
 */
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SettingsDialogSelectContent } from '@/components/settings/SettingsDialogSelectContent';
import {
  formatSalaryFormulaReadable,
  payFormulaPickerSearchOptsFromSalaryComponents,
} from '@/lib/payFormulaCatalog';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import {
  payTypeOptionsFromCatalog,
  resolvePayTypeLabel,
} from '@/lib/catalogSearchPicker';
import {
  useSalaryComponents,
  type SalaryComponent,
  type SalaryComponentFormData,
} from '@/hooks/useSalaryComponents';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const Badge = ({
  children,
  color = 'gray',
}: {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'gray';
}) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  return (
    <span
      className={`px-2.5 py-1 text-xs font-medium border rounded-full ${colors[color] || colors.gray}`}
    >
      {children}
    </span>
  );
};

type FormState = {
  code: string;
  name_vi: string;
  component_type: string;
  is_taxable: boolean;
  in_bhxh_base: boolean;
  formula: string;
  data_source_type: string;
  source_mapping_key: string;
};

const emptyForm = (): FormState => ({
  code: '',
  name_vi: '',
  component_type: '',
  is_taxable: false,
  in_bhxh_base: false,
  formula: '',
  data_source_type: 'FORMULA',
  source_mapping_key: '',
});

function displayFormulaReadable(raw: string | undefined): string {
  const v = (raw ?? '').trim();
  if (!v) return '—';
  const readable = formatSalaryFormulaReadable(v);
  if (readable === '—' || readable === v.replace(/^=/, '').trim()) {
    return v.length > 56 ? `${v.slice(0, 56)}…` : v;
  }
  return readable.length > 72 ? `${readable.slice(0, 72)}…` : readable;
}

export const PaySalaryComponentList = () => {
  const {
    components,
    isLoading,
    error,
    createComponent,
    updateComponent,
  } = useSalaryComponents();
  const { catalogs, isLoading: catalogsLoading } = useSettingsCatalogsOverview();
  const payTypeOptions = useMemo(
    () => payTypeOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );

  const formulaPickerOpts = useMemo(
    () => payFormulaPickerSearchOptsFromSalaryComponents(components),
    [components],
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SalaryComponent | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const handleFormulaChange = useCallback((formula: string) => {
    setFormData((prev) => ({ ...prev, formula }));
  }, []);

  const handleOpenDialog = (item: SalaryComponent | null = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        name_vi: item.name,
        component_type: item.component_type,
        is_taxable: item.is_taxable,
        in_bhxh_base: item.is_insurance_base,
        formula: item.formula ?? '',
        data_source_type: item.data_source_type ?? 'FORMULA',
        source_mapping_key: item.source_mapping_key ?? '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        ...emptyForm(),
        component_type: payTypeOptions[0]?.value ?? '',
      });
    }
    setIsDialogOpen(true);
  };

  const buildCreatePayload = (): SalaryComponentFormData => ({
    code: formData.code.trim(),
    name: formData.name_vi.trim(),
    component_type: formData.component_type,
    nature: 'income',
    value_type: 'currency',
    is_taxable: formData.is_taxable,
    is_insurance_base: formData.in_bhxh_base,
    formula: formData.formula.trim() || undefined,
    data_source_type: formData.data_source_type,
    source_mapping_key: formData.data_source_type !== 'FORMULA' ? formData.source_mapping_key.trim() || undefined : undefined,
    default_value: 0,
    applied_to: 'all',
    is_active: true,
    sort_order: 0,
  });

  /** PATCH chỉ các field dialog sửa — tránh ghi đè nature/value_type/… khi chỉ đổi công thức. */
  const buildUpdatePayload = (): Partial<SalaryComponentFormData> => ({
    name: formData.name_vi.trim(),
    component_type: formData.component_type,
    is_taxable: formData.is_taxable,
    is_insurance_base: formData.in_bhxh_base,
    formula: formData.formula.trim() || undefined,
  });

  const handleSave = async () => {
    if (!formData.code || !formData.name_vi) {
      toast.error('Vui lòng nhập đầy đủ mã và tên thành phần.');
      return;
    }
    if (!formData.component_type) {
      toast.error('Vui lòng chọn loại thành phần (pay_types).');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        const ok = await updateComponent(editingItem.id, buildUpdatePayload());
        if (ok) setIsDialogOpen(false);
      } else {
        await createComponent(buildCreatePayload());
        setIsDialogOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const loading = isLoading || catalogsLoading;

  return (
    <Card className="h-[calc(100vh-140px)] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between shrink-0">
        <div>
          <CardTitle>Danh mục Thành phần lương</CardTitle>
          <CardDescription className="mt-1">
            Mỗi thành phần: chọn <strong>trường dữ liệu</strong> theo tên tiếng Việt + phép tính. Tab
            Công thức lương gộp các mã TP.
          </CardDescription>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Thêm thành phần
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        {error ? (
          <p className="text-sm text-red-600 mb-4">{error}</p>
        ) : null}

        <div className="overflow-auto flex-1 border rounded-xl relative bg-white">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-gray-50 z-10 shadow-[0_1px_0_0_#e5e7eb]">
            <tr className="text-gray-500">
              <th className="pb-3 font-medium">Mã</th>
              <th className="pb-3 font-medium">Tên hiển thị</th>
              <th className="pb-3 font-medium">Loại</th>
              <th className="pb-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : components.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  Chưa có thành phần lương.
                </td>
              </tr>
            ) : (
              components.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 font-medium text-gray-900">{c.code}</td>
                  <td className="py-4">{c.name}</td>
                  <td className="py-4">
                    {resolvePayTypeLabel(payTypeOptions, c.component_type) || c.component_type}
                  </td>
                  <td className="py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(c)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Sửa
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="sm:max-w-md rounded-[16px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Sửa thành phần lương' : 'Thêm mới thành phần lương'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {/* Cột trái — thông tin chung */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Thông tin thành phần
              </p>

              <div className="flex flex-col gap-2">
                <Label htmlFor="code" className="text-sm font-medium">
                  Mã thành phần <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="VD: PHU_CAP_XANG"
                  disabled={Boolean(editingItem)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="name_vi" className="text-sm font-medium">
                  Tên hiển thị <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name_vi"
                  value={formData.name_vi}
                  onChange={(e) => setFormData({ ...formData, name_vi: e.target.value })}
                  placeholder="VD: Phụ cấp xăng xe"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">
                  Loại thành phần <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.component_type || undefined}
                  onValueChange={(val) => setFormData({ ...formData, component_type: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại từ master-data pay_types" />
                  </SelectTrigger>
                  <SettingsDialogSelectContent>
                    {payTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SettingsDialogSelectContent>
                </Select>
              </div>

            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-lg">
              Hủy
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              {saving ? 'Đang lưu...' : editingItem ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
    </Card>
  );
};
