/**
 * @CODE-MEMORY
 * Screen:     Cấu hình Loại chính sách (Dynamic Policy Type Config)
 * UC:         UC-BP-PAY-STP-01 (Mở rộng)
 * Purpose:    Quản lý danh mục các Loại chính sách, định nghĩa sẵn các Cột (Columns)
 *             và Field Mapping để tự động sinh ra Lưới dữ liệu (Data Grid) khi tạo Policy Pack.
 * WorkItem:   PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01
 * Coded:      2026-08-22
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings2,
  Plus,
  Trash2,
  X,
  Layers,
  Save,
  Pencil,
  Search,
} from 'lucide-react';
import { genClientId } from '@/lib/payPolicyPackForm';
import {
  usePolicyTypes,
  MAPPABLE_SYSTEM_TABLES,
  type PolicyTypeConfig,
  type PolicyTypeColumnDef,
} from '@/lib/policyTypeConfigStore';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

export function PolicyTypeConfigPanel({ onClose }: { onClose: () => void }) {
  const { types, addType, updateType, deleteType } = usePolicyTypes();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state for creating/editing
  const [form, setForm] = useState<Partial<PolicyTypeConfig> | null>(null);

  const startCreate = () => {
    setForm({
      code: '',
      name: '',
      defaultColumns: [
        { id: genClientId(), name: 'Đối tượng' },
        { id: genClientId(), name: 'Giá trị' },
      ],
    });
    setEditingId('NEW');
  };

  const startEdit = (t: PolicyTypeConfig) => {
    setForm({ ...t });
    setEditingId(t.id);
  };

  const saveForm = () => {
    if (!form || !form.name || !form.code) return;
    if (editingId === 'NEW') {
      addType(form as PolicyTypeConfig);
    } else if (editingId) {
      updateType(editingId, form as PolicyTypeConfig);
    }
    setForm(null);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setForm(null);
    setEditingId(null);
  };

  // Column management in form
  const addColumn = () => {
    if (!form || !form.defaultColumns) return;
    setForm({
      ...form,
      defaultColumns: [...form.defaultColumns, { id: genClientId(), name: 'Cột mới' }],
    });
  };

  const updateColumn = (colId: string, partial: Partial<PolicyTypeColumnDef>) => {
    if (!form || !form.defaultColumns) return;
    setForm({
      ...form,
      defaultColumns: form.defaultColumns.map(c => c.id === colId ? { ...c, ...partial } : c)
    });
  };

  const removeColumn = (colId: string) => {
    if (!form || !form.defaultColumns) return;
    setForm({
      ...form,
      defaultColumns: form.defaultColumns.filter(c => c.id !== colId)
    });
  };

  const panel = (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="h-14 border-b bg-white flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm relative z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full -ml-2" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-slate-800 leading-tight flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              Cấu hình Loại chính sách
            </h1>
            <span className="text-[11px] text-slate-500 font-medium">
              Quản lý danh mục loại chính sách & Cấu trúc Data Grid mặc định
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left List */}
        <aside className="w-[320px] border-r bg-white flex flex-col">
          <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-700">Danh sách Loại</h3>
            <Button size="sm" className="h-7 text-xs" onClick={startCreate}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Thêm
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {types.map(t => (
              <button
                key={t.id}
                onClick={() => startEdit(t)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-md flex items-center justify-between group transition-colors",
                  editingId === t.id ? "bg-primary/10 text-primary" : "hover:bg-slate-100"
                )}
              >
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.code}</div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-muted-foreground" />
              </button>
            ))}
          </div>
        </aside>

        {/* Right Editor */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {!form ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Layers className="w-12 h-12 mb-3 opacity-20" />
              <p>Chọn một loại chính sách bên trái hoặc Thêm mới</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">
                  {editingId === 'NEW' ? 'Tạo mới Loại chính sách' : 'Chỉnh sửa Loại chính sách'}
                </h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={cancelEdit}>Hủy</Button>
                  <Button size="sm" onClick={saveForm} className="gap-2">
                    <Save className="w-4 h-4" /> Lưu cấu hình
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white p-5 rounded-lg border shadow-sm">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Mã loại (Code)</Label>
                  <Input 
                    value={form.code} 
                    onChange={e => setForm({ ...form, code: e.target.value })} 
                    placeholder="VD: LCS_LAI_XE" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Tên hiển thị</Label>
                  <Input 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    placeholder="VD: Bảng lương Lái xe tải" 
                  />
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-sm">Cấu trúc Cột (Grid Columns)</h3>
                    <p className="text-xs text-muted-foreground">
                      Các cột này sẽ tự động được tạo ra khi người dùng Thêm nhóm chính sách mới thuộc loại này.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addColumn} className="h-8 gap-1 text-xs">
                    <Plus className="w-3.5 h-3.5" /> Thêm Cột
                  </Button>
                </div>

                <div className="space-y-3">
                  {form.defaultColumns?.map((col, index) => (
                    <div key={col.id} className="flex gap-3 items-start p-3 border rounded-md bg-slate-50/50">
                      <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-500 shrink-0">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tên cột hiển thị</Label>
                            <Input 
                              value={col.name} 
                              onChange={e => updateColumn(col.id, { name: e.target.value })} 
                              className="h-8 bg-white"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Map với DB (Nguồn dữ liệu)</Label>
                            <Select
                              value={col.mappedField || 'none'}
                              onValueChange={v => updateColumn(col.id, { mappedField: v === 'none' ? undefined : v })}
                            >
                              <SelectTrigger className="h-8 bg-white text-xs">
                                <SelectValue placeholder="Chỉ hiển thị (Không map)" />
                              </SelectTrigger>
                              <SelectContent className="z-[300]">
                                <SelectItem value="none" className="text-muted-foreground italic">-- Chỉ hiển thị (Không map) --</SelectItem>
                                {MAPPABLE_SYSTEM_TABLES.map(table => (
                                  <SelectGroup key={table.id}>
                                    <SelectLabel className="bg-slate-100 text-[10px] font-bold tracking-wider text-slate-600">{table.name}</SelectLabel>
                                    {table.fields.map(f => (
                                      <SelectItem key={f.id} value={f.id} className="text-xs pl-6">
                                        {f.name} <span className="text-slate-400 ml-1">({f.id})</span>
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            id={`grade-${col.id}`}
                            checked={col.isGradePicker}
                            onChange={e => updateColumn(col.id, { isGradePicker: e.target.checked })}
                          />
                          <Label htmlFor={`grade-${col.id}`} className="text-xs font-medium cursor-pointer">
                            Sử dụng UI chọn Ngạch bậc (Grade Picker) cho cột này
                          </Label>
                        </div>
                      </div>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeColumn(col.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              {editingId !== 'NEW' && (
                <div className="flex justify-end pt-4 border-t">
                  <Button variant="destructive" size="sm" onClick={() => { deleteType(editingId as string); setForm(null); setEditingId(null); }}>
                    Xóa Loại chính sách này
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}

// Dummy ChevronRight since it wasn't imported from lucide-react initially
function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
