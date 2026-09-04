/**
 * @CODE-MEMORY
 * Module/Screen: HRM · Tiền lương · Component Dùng chung
 * Trace: XEVN_SRS_HRM_PAYROLL_POLICY_ENGINE_v1.md
 * WorkItem: PO-HRM-PAY-SHARED-RULE-01
 * SOLID: SRP (Đảm bảo trách nhiệm đơn lẻ) - Chỉ xử lý render và update JSON logic của Conditions, không chứa logic Business của Thuế/Bảo hiểm.
 */
import { Users, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

const NUMERIC_OPERATORS = [
  { value: 'gte', label: 'Lớn hơn hoặc bằng (>=)' },
  { value: 'gt', label: 'Lớn hơn (>)' },
  { value: 'lte', label: 'Nhỏ hơn hoặc bằng (<=)' },
  { value: 'lt', label: 'Nhỏ hơn (<)' },
  { value: 'eq', label: 'Bằng (=)' },
  { value: 'neq', label: 'Khác (!=)' },
  { value: 'between', label: 'Trong khoảng (Between)' },
  { value: 'in', label: 'Bao gồm (In)' },
  { value: 'not_in', label: 'Không bao gồm' }
];

const ALL_OPERATORS = [
  { value: 'gte', label: 'Lớn hơn hoặc bằng (>=)' },
  { value: 'gt', label: 'Lớn hơn (>)' },
  { value: 'lte', label: 'Nhỏ hơn hoặc bằng (<=)' },
  { value: 'lt', label: 'Nhỏ hơn (<)' },
  { value: 'eq', label: 'Bằng (Equals)' },
  { value: 'neq', label: 'Khác (!=)' },
  { value: 'in', label: 'Bao gồm (In)' },
  { value: 'not_in', label: 'Không bao gồm' },
  { value: 'between', label: 'Trong khoảng (Between)' }
];

export type Condition = {
  id: string;
  field: string;
  operator: string;
  value: string;
  logic?: 'AND' | 'OR';
};

export type FieldOption = { 
  value: string; 
  label: string; 
  type?: 'select' | 'text' | 'number' | string;
  options?: { value: string; label: string }[];
};

export type RuleConditionBuilderProps = {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
  fieldOptions: FieldOption[];
  disabled?: boolean;
};

export function RuleConditionBuilder({ conditions, onChange, fieldOptions, disabled }: RuleConditionBuilderProps) {
  
  const handleAddCondition = () => {
    const firstField = fieldOptions[0];
    const isNum = firstField?.type === 'number' || firstField?.value === 'seniority' || firstField?.value === 'kpi_score';
    const newCond: Condition = { 
      id: `c_${Date.now()}`, 
      field: firstField?.value || '', 
      operator: isNum ? 'gte' : 'eq', 
      value: '',
      logic: 'AND'
    };
    onChange([...conditions, newCond]);
  };

  const handleUpdateCondition = (condId: string, field: string, value: string) => {
    onChange(conditions.map(c => {
      if (c.id !== condId) return c;
      if (field === 'field') {
        const fieldDef = fieldOptions.find(f => f.value === value);
        const isNum = fieldDef?.type === 'number' || value === 'seniority' || value === 'kpi_score';
        return {
          ...c,
          field: value,
          operator: isNum ? 'gte' : 'eq',
          value: ''
        };
      }
      return { ...c, [field]: value };
    }));
  };

  const handleRemoveCondition = (condId: string) => {
    onChange(conditions.filter(c => c.id !== condId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-lg text-slate-800">Điều kiện áp dụng (Targeting Rules)</h3>
        </div>
        <Button variant="outline" size="sm" disabled={disabled} onClick={handleAddCondition} className="h-8 text-xs">
          <Plus className="w-3 h-3 mr-1" /> Thêm điều kiện
        </Button>
      </div>

      <div className="p-4 border rounded-md bg-slate-50/50 space-y-3">
        {conditions.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-4">
            Chưa có điều kiện nào. Chính sách này sẽ không áp dụng cho ai hoặc áp dụng cho toàn công ty tuỳ cấu hình lõi.
          </p>
        ) : (
          conditions.map((cond, idx) => {
            const selectedFieldDef = fieldOptions.find(f => f.value === cond.field);
            const isNumericField = selectedFieldDef?.type === 'number' || cond.field === 'seniority' || cond.field === 'kpi_score';
            const currentOperators = isNumericField ? NUMERIC_OPERATORS : ALL_OPERATORS;

            return (
              <div key={cond.id} className="flex items-center gap-2 bg-white p-2 border rounded-md shadow-sm">
                {idx === 0 ? (
                  <div className="w-16 shrink-0 flex justify-center">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 uppercase tracking-wider">
                      IF
                    </span>
                  </div>
                ) : (
                  <div className="w-16 shrink-0 flex justify-center">
                    <Select
                      value={cond.logic || 'AND'}
                      disabled={disabled}
                      onValueChange={(val) => handleUpdateCondition(cond.id, 'logic', val)}
                    >
                      <SelectTrigger className="h-8 w-16 font-bold text-xs text-indigo-700 bg-indigo-50/90 border-indigo-200 px-1.5 justify-center shadow-2xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND" className="font-bold text-xs text-indigo-700">AND</SelectItem>
                        <SelectItem value="OR" className="font-bold text-xs text-amber-700">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <Select value={cond.field} disabled={disabled} onValueChange={(val) => handleUpdateCondition(cond.id, 'field', val)}>
                  <SelectTrigger className="flex-[4] h-9 min-w-0"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                
                <Select value={cond.operator} disabled={disabled} onValueChange={(val) => handleUpdateCondition(cond.id, 'operator', val)}>
                  <SelectTrigger className="flex-[3] h-9 min-w-0"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {currentOperators.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>

              {(() => {
                const selectedFieldDef = fieldOptions.find(f => f.value === cond.field);
                if (selectedFieldDef?.type === 'select') {
                  return (() => {
                    const selectedValues = cond.value ? cond.value.split(',').filter(Boolean) : [];
                    
                    const toggleOption = (val: string) => {
                      const newValues = selectedValues.includes(val)
                        ? selectedValues.filter(v => v !== val)
                        : [...selectedValues, val];
                      handleUpdateCondition(cond.id, 'value', newValues.join(','));
                    };

                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" disabled={disabled} className="flex-[4] h-auto min-h-9 px-2 py-1 flex items-center flex-wrap gap-1 bg-white min-w-0 justify-start hover:bg-white text-left font-normal border-slate-200">
                            {selectedValues.length === 0 ? (
                              <span className="text-muted-foreground text-sm ml-1">Chọn giá trị...</span>
                            ) : (
                              selectedValues.map(v => {
                                const label = selectedFieldDef.options?.find(o => o.value === v)?.label || v;
                                return (
                                  <Badge key={v} variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0.5 font-medium border-0">
                                    {label}
                                  </Badge>
                                );
                              })
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-2" align="start">
                          <div className="space-y-1 max-h-[250px] overflow-y-auto pr-1">
                            {selectedFieldDef.options?.map(o => (
                              <label key={o.value} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded-md cursor-pointer transition-colors">
                                <Checkbox 
                                  checked={selectedValues.includes(o.value)} 
                                  onCheckedChange={() => toggleOption(o.value)} 
                                  className="border-slate-300"
                                />
                                <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  {o.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  })();
                }
                return (
                  <Input 
                    value={cond.value} 
                    onChange={(e) => handleUpdateCondition(cond.id, 'value', e.target.value)}
                    placeholder={
                      cond.field === 'seniority' ? 'Nhập số tháng (VD: 12)' :
                      cond.field === 'kpi_score' ? 'Nhập điểm % (VD: 80)' :
                      'Nhập giá trị (cách nhau dấu phẩy)'
                    }
                    disabled={disabled} className="flex-[4] h-9 bg-white min-w-0"
                  />
                );
              })()}

              <Button 
                variant="ghost" 
                size="icon" 
                disabled={disabled}
                className="h-9 w-9 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50" 
                onClick={() => handleRemoveCondition(cond.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        })
      )}
      </div>
    </div>
  );
}
