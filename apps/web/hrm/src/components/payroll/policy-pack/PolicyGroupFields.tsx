/**
 * @CODE-MEMORY
 * Screen:     HRM Chính sách lương — Trường động theo loại nhóm chính sách
 * UC:         UC-BP-PAY-STP-01
 * Purpose:    Render các trường nhập liệu phù hợp khi người dùng chọn loại nhóm:
 *             salary_scale → bảng lương động nhiều ngạch, dùng Grade Picker.
 *             allowance    → 6 ô phụ cấp (QĐ 127A)
 *             kpi_bonus    → % tối đa + checkbox vị trí đặc thù
 *             other_bonus / deduction → tên + giá trị + điều kiện
 *             custom_table → Bảng tùy chỉnh (Dynamic data grid) map với biến số.
 * WorkItem:   PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01
 * Coded:      2026-08-22
 * Callers:    PolicyGroupEditor.tsx
 * Callees:    ViMoneyInput, Input, Label, Select
 * must_keep:  SRP — chỉ render fields; không gọi API; không state ngoài props
 * SOLID:      SRP, OCP
 * display_ready_ack: text user-facing tiếng Việt
 */
import type { ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ViMoneyInput } from '@/components/ui/ViMoneyInput';
import {
  type PolicyGroupType,
  type PolicyGroupData,
  type SalaryScaleData,
  type AllowanceData,
  type KpiBonusData,
  type GenericGroupData,
  type CustomTableData,
  genClientId,
} from '@/lib/payPolicyPackForm';
import { SAMPLE_GRADES } from '../setup/PayrollGradeSetupScreen';
import { Plus, Trash2, Settings2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface PolicyGroupFieldsProps {
  type: PolicyGroupType;
  data: PolicyGroupData;
  onChange: (next: PolicyGroupData) => void;
}

// ---------------------------------------------------------------------------
// 1. Salary Scale (thang/bảng lương) - Multi-row Grid
// ---------------------------------------------------------------------------

function SalaryScaleFields({ data, onChange }: {
  data: SalaryScaleData;
  onChange: (next: SalaryScaleData) => void;
}) {
  const addRow = () => {
    onChange({
      ...data,
      rows: [
        ...data.rows,
        { id: genClientId(), gradeCode: '', positionHint: '', steps: [{ level: 'I', amount: 0 }] },
      ],
    });
  };

  const removeRow = (rowId: string) => {
    onChange({
      ...data,
      rows: data.rows.filter(r => r.id !== rowId),
    });
  };

  const updateRow = (rowId: string, partial: Partial<typeof data.rows[0]>) => {
    onChange({
      ...data,
      rows: data.rows.map(r => r.id === rowId ? { ...r, ...partial } : r),
    });
  };

  const addStepToRow = (rowId: string) => {
    onChange({
      ...data,
      rows: data.rows.map(r => {
        if (r.id !== rowId) return r;
        return {
          ...r,
          steps: [...r.steps, { level: `Bậc ${r.steps.length + 1}`, amount: 0 }],
        };
      }),
    });
  };

  const updateStepInRow = (rowId: string, stepIdx: number, val: number) => {
    onChange({
      ...data,
      rows: data.rows.map(r => {
        if (r.id !== rowId) return r;
        const nextSteps = [...r.steps];
        nextSteps[stepIdx] = { ...nextSteps[stepIdx], amount: val };
        return { ...r, steps: nextSteps };
      }),
    });
  };

  // Find max steps to draw columns
  const maxSteps = Math.max(1, ...data.rows.map(r => r.steps.length));

  return (
    <div className="space-y-4">
      {/* Tên bảng & Lương tối thiểu */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Tên bảng lương con</Label>
          <Input
            placeholder="VD: Bảng lương chuyên gia"
            value={data.tableName}
            onChange={(e) => onChange({ ...data, tableName: e.target.value })}
            className="h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Lương tối thiểu (VND)</Label>
          <ViMoneyInput
            value={data.minWage}
            onValueChange={(val) => onChange({ ...data, minWage: val })}
            placeholder="5.310.000"
            className="h-8"
          />
        </div>
      </div>

      <div className="border rounded-md overflow-x-auto bg-white">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground w-[150px]">Ngạch (Grade)</th>
              <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground w-[200px]">Chức danh áp dụng</th>
              {Array.from({ length: maxSteps }).map((_, i) => (
                <th key={i} className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground w-[120px]">
                  Bậc {i + 1}
                </th>
              ))}
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50">
                <td className="px-3 py-2">
                  <Select
                    value={row.gradeCode || 'none'}
                    onValueChange={(v) => {
                      const grade = SAMPLE_GRADES.find(g => g.code === v);
                      if (grade) {
                        updateRow(row.id, { gradeCode: grade.code, positionHint: grade.categoryGroup });
                      } else {
                        updateRow(row.id, { gradeCode: '' });
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Chọn ngạch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Chọn ngạch --</SelectItem>
                      {SAMPLE_GRADES.map(g => (
                        <SelectItem key={g.code} value={g.code}>{g.code} - {g.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-2">
                  <Input
                    className="h-8 text-xs"
                    value={row.positionHint}
                    onChange={(e) => updateRow(row.id, { positionHint: e.target.value })}
                    placeholder="Tự động hoặc nhập..."
                  />
                </td>
                {/* Steps columns */}
                {Array.from({ length: maxSteps }).map((_, i) => {
                  const step = row.steps[i];
                  return (
                    <td key={i} className="px-3 py-2">
                      {step ? (
                        <ViMoneyInput
                          className="h-8 text-xs"
                          value={step.amount}
                          onValueChange={(val) => updateStepInRow(row.id, i, val)}
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-full text-xs text-muted-foreground border border-dashed"
                          onClick={() => addStepToRow(row.id)}
                        >
                          <Plus className="w-3 h-3 mr-1" /> Bậc {i + 1}
                        </Button>
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeRow(row.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-2 border-t bg-slate-50">
          <Button type="button" variant="ghost" size="sm" onClick={addRow} className="h-8 text-xs text-primary">
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm ngạch / dòng
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Custom Table (Bảng tùy chỉnh - Khai báo cột xong map trường)
// ---------------------------------------------------------------------------

const MAPPABLE_FIELDS = [
  { id: 'luong_co_ban', name: 'Lương cơ bản (VND)' },
  { id: 'phu_cap_dien_thoai', name: 'Phụ cấp điện thoại (VND)' },
  { id: 'phu_cap_xang_xe', name: 'Phụ cấp xăng xe (VND)' },
  { id: 'he_so_kpi', name: 'Hệ số KPI (%)' },
  { id: 'thuong_doanh_thu', name: 'Thưởng doanh thu (%)' },
];

function CustomTableFields({ data, onChange }: {
  data: CustomTableData;
  onChange: (next: CustomTableData) => void;
}) {
  const addColumn = () => {
    onChange({
      ...data,
      columns: [...data.columns, { id: genClientId(), name: `Cột ${data.columns.length + 1}` }],
    });
  };

  const updateColumn = (colId: string, partial: Partial<typeof data.columns[0]>) => {
    onChange({
      ...data,
      columns: data.columns.map(c => c.id === colId ? { ...c, ...partial } : c),
    });
  };

  const removeColumn = (colId: string) => {
    onChange({
      ...data,
      columns: data.columns.filter(c => c.id !== colId),
      // Xóa data thừa trong rows
      rows: data.rows.map(r => {
        const nextCells = { ...r.cells };
        delete nextCells[colId];
        return { ...r, cells: nextCells };
      }),
    });
  };

  const addRow = () => {
    onChange({
      ...data,
      rows: [...data.rows, { id: genClientId(), targetObject: '', cells: {} }],
    });
  };

  const updateRowCell = (rowId: string, colId: string, val: string) => {
    onChange({
      ...data,
      rows: data.rows.map(r => {
        if (r.id !== rowId) return r;
        return { ...r, cells: { ...r.cells, [colId]: val } };
      }),
    });
  };

  const updateRowTarget = (rowId: string, val: string) => {
    onChange({
      ...data,
      rows: data.rows.map(r => r.id === rowId ? { ...r, targetObject: val } : r),
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Tên bảng tùy chỉnh</Label>
          <Input
            placeholder="VD: Bảng phụ cấp rủi ro"
            value={data.tableName}
            onChange={(e) => onChange({ ...data, tableName: e.target.value })}
            className="h-8"
          />
        </div>
      </div>

      <div className="border rounded-md bg-white overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground w-[200px] border-r">
                Đối tượng áp dụng
              </th>
              {data.columns.map((col) => (
                <th key={col.id} className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground border-r group min-w-[150px]">
                  <div className="flex items-center justify-between">
                    <Input
                      className="h-7 text-xs bg-transparent border-transparent px-1 hover:border-input focus:border-input font-semibold"
                      value={col.name}
                      onChange={(e) => updateColumn(col.id, { name: e.target.value })}
                    />
                    
                    {/* Cấu hình map trường */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground">
                          <Settings2 className="w-3.5 h-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[260px] p-3 text-sm">
                        <Label className="text-xs font-semibold mb-2 block">Map với biến số (Data Field)</Label>
                        <Select
                          value={col.mappedField || 'none'}
                          onValueChange={(v) => updateColumn(col.id, { mappedField: v === 'none' ? undefined : v })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Không map (chỉ hiển thị)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none" className="italic text-muted-foreground">Không map</SelectItem>
                            {MAPPABLE_FIELDS.map(f => (
                              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="mt-4 pt-3 border-t text-right">
                          <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => removeColumn(col.id)}>
                            Xóa cột này
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  {col.mappedField && (
                    <div className="px-1 mt-1 text-[10px] text-blue-600 font-medium truncate">
                      → {MAPPABLE_FIELDS.find(f => f.id === col.mappedField)?.name}
                    </div>
                  )}
                </th>
              ))}
              <th className="w-10 px-2">
                <Button type="button" variant="ghost" size="sm" onClick={addColumn} className="h-7 w-7 p-0 shrink-0 text-primary">
                  <Plus className="w-4 h-4" />
                </Button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={data.columns.length + 2} className="px-4 py-8 text-center text-muted-foreground text-xs italic">
                  Chưa có dữ liệu. Hãy thêm cột và thêm dòng.
                </td>
              </tr>
            ) : (
              data.rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2 border-r">
                    <Input
                      className="h-8 text-xs"
                      placeholder="VD: Cấp quản lý..."
                      value={row.targetObject}
                      onChange={(e) => updateRowTarget(row.id, e.target.value)}
                    />
                  </td>
                  {data.columns.map((col) => (
                    <td key={col.id} className="px-3 py-2 border-r">
                      <Input
                        className="h-8 text-xs"
                        placeholder="Giá trị..."
                        value={row.cells[col.id] || ''}
                        onChange={(e) => updateRowCell(row.id, col.id, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => onChange({ ...data, rows: data.rows.filter(r => r.id !== row.id) })}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="p-2 border-t bg-slate-50">
          <Button type="button" variant="ghost" size="sm" onClick={addRow} className="h-8 text-xs text-primary" disabled={data.columns.length === 0}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm dòng dữ liệu
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Allowance, KPI, Generic (Giữ nguyên như cũ)
// ---------------------------------------------------------------------------

function AllowanceFields({ data, onChange }: {
  data: AllowanceData;
  onChange: (next: AllowanceData) => void;
}) {
  const set = <K extends keyof AllowanceData>(key: K, val: AllowanceData[K]) =>
    onChange({ ...data, [key]: val });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className="space-y-1.5 col-span-2">
        <Label className="text-xs font-semibold">Tên nhóm phụ cấp</Label>
        <Input
          value={data.groupName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => set('groupName', e.target.value)}
          placeholder="VD: Lãnh đạo - Điều hành"
          className="h-8"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Phân mức</Label>
        <Select value={data.tier} onValueChange={(v: '1'|'2'|'none') => set('tier', v)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Không phân mức</SelectItem>
            <SelectItem value="1">Mức 1 (100%)</SelectItem>
            <SelectItem value="2">Mức 2 (80%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Điện thoại</Label>
        <ViMoneyInput value={data.phone} onValueChange={(val) => set('phone', val)} className="h-8" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Xăng xe/Đi lại</Label>
        <ViMoneyInput value={data.transport} onValueChange={(val) => set('transport', val)} className="h-8" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Trang phục</Label>
        <ViMoneyInput value={data.clothing} onValueChange={(val) => set('clothing', val)} className="h-8" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Công tác phí</Label>
        <ViMoneyInput value={data.travel} onValueChange={(val) => set('travel', val)} className="h-8" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Nhà ở</Label>
        <ViMoneyInput value={data.housing} onValueChange={(val) => set('housing', val)} className="h-8" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Ăn trưa</Label>
        <ViMoneyInput value={data.meal} onValueChange={(val) => set('meal', val)} className="h-8" />
      </div>
    </div>
  );
}

function KpiBonusFields({ data, onChange }: {
  data: KpiBonusData;
  onChange: (next: KpiBonusData) => void;
}) {
  const set = <K extends keyof KpiBonusData>(key: K, val: KpiBonusData[K]) =>
    onChange({ ...data, [key]: val });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Tỷ lệ thưởng tối đa (%)</Label>
          <Input
            value={data.maxPct}
            onChange={(e: ChangeEvent<HTMLInputElement>) => set('maxPct', e.target.value)}
            placeholder="VD: 35"
            className="h-8"
          />
        </div>
        <div className="space-y-1.5 flex flex-col justify-end">
          <label className="flex items-center gap-2 text-sm font-medium h-8">
            <input
              type="checkbox"
              checked={data.isSpecialPosition}
              onChange={(e) => set('isSpecialPosition', e.target.checked)}
              className="rounded border-gray-300"
            />
            Vị trí đặc thù (Không áp trần)
          </label>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Ghi chú / Điều kiện</Label>
        <Input
          value={data.note}
          onChange={(e: ChangeEvent<HTMLInputElement>) => set('note', e.target.value)}
          placeholder="Tùy chọn..."
          className="h-8"
        />
      </div>
    </div>
  );
}

function GenericFields({ data, onChange }: {
  data: GenericGroupData;
  onChange: (next: GenericGroupData) => void;
}) {
  const set = <K extends keyof GenericGroupData>(key: K, val: GenericGroupData[K]) =>
    onChange({ ...data, [key]: val });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5 col-span-3">
          <Label className="text-xs font-semibold">Tên khoản</Label>
          <Input
            value={data.itemName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => set('itemName', e.target.value)}
            placeholder="VD: Thưởng sáng kiến"
            className="h-8"
          />
        </div>
        <div className="space-y-1.5 col-span-1">
          <Label className="text-xs font-semibold">Loại giá trị</Label>
          <Select value={data.valueType} onValueChange={(v: 'fixed'|'pct') => set('valueType', v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Tiền mặt (VND)</SelectItem>
              <SelectItem value="pct">Phần trăm (%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs font-semibold">
            {data.valueType === 'fixed' ? 'Số tiền (VND)' : 'Tỷ lệ (%)'}
          </Label>
          {data.valueType === 'fixed' ? (
            <ViMoneyInput value={data.amount} onValueChange={(val) => set('amount', val)} className="h-8" />
          ) : (
            <Input
              type="number"
              value={data.amount || ''}
              onChange={(e) => set('amount', Number(e.target.value))}
              placeholder="0"
              className="h-8"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export function PolicyGroupFields({ type, data, onChange }: PolicyGroupFieldsProps) {
  switch (type) {
    case 'salary_scale':
      return <SalaryScaleFields data={data as SalaryScaleData} onChange={onChange as any} />;
    case 'allowance':
      return <AllowanceFields data={data as AllowanceData} onChange={onChange as any} />;
    case 'kpi_bonus':
      return <KpiBonusFields data={data as KpiBonusData} onChange={onChange as any} />;
    case 'other_bonus':
    case 'deduction':
      return <GenericFields data={data as GenericGroupData} onChange={onChange as any} />;
    case 'custom_table':
      return <CustomTableFields data={data as CustomTableData} onChange={onChange as any} />;
    default:
      return null;
  }
}
