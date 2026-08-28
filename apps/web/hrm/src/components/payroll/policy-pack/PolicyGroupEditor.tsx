/**
 * @CODE-MEMORY
 * Screen:     HRM Chính sách lương — Quản lý danh sách nhóm chính sách
 * UC:         UC-BP-PAY-STP-01
 * Purpose:    Component quản lý thêm/sửa/xóa nhóm chính sách trong một Policy Pack.
 *             Mô hình mới: Mỗi Group là một Dynamic Data Grid độc lập, kế thừa cấu trúc cột 
 *             từ packType. Có thể thêm/sửa/xóa cột và map biến tùy ý.
 * WorkItem:   PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01
 * Coded:      2026-08-22
 * Callers:    PolicyPackSetupScreen.tsx (trong Dialog full-screen)
 * must_keep:  SRP; không gọi API; accordion expand/collapse per group; delete confirm
 * SOLID:      SRP, OCP
 * display_ready_ack: text user-facing tiếng Việt
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  type PolicyGroup,
  type PolicyPackType,
  type PolicyColumn,
  type PolicyRow,
  genClientId,
} from '@/lib/payPolicyPackForm';
import { usePolicyTypes } from '@/lib/policyTypeConfigStore';
import { SAMPLE_GRADES } from '../setup/PayrollGradeSetupScreen';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  GripVertical,
  Settings2,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MAPPABLE_FIELDS = [
  { id: 'luong_co_ban', name: 'Lương cơ bản (VND)' },
  { id: 'phu_cap_dien_thoai', name: 'Phụ cấp điện thoại (VND)' },
  { id: 'phu_cap_xang_xe', name: 'Phụ cấp xăng xe (VND)' },
  { id: 'he_so_kpi', name: 'Hệ số KPI (%)' },
  { id: 'thuong_doanh_thu', name: 'Thưởng doanh thu (%)' },
  { id: 'grade_code', name: 'Mã ngạch (Hệ thống)' },
  { id: 'position_hint', name: 'Chức danh (Hệ thống)' },
  { id: 'target_group', name: 'Đối tượng áp dụng' },
];

interface PolicyGroupEditorProps {
  packType: PolicyPackType;
  groups: PolicyGroup[];
  onChange: (next: PolicyGroup[]) => void;
}

export function PolicyGroupEditor({ packType, groups, onChange }: PolicyGroupEditorProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const { types: policyTypes } = usePolicyTypes();

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addGroup = () => {
    const config = policyTypes.find(t => t.code === packType);
    
    // Map từ cấu hình mặc định (nếu có)
    const columns: PolicyColumn[] = (config?.defaultColumns || []).map(col => ({
      id: genClientId(),
      name: col.name,
      isGradePicker: col.isGradePicker,
      mappedField: col.mappedField,
    }));

    const newGroup: PolicyGroup = {
      clientId: genClientId(),
      code: '',
      name: '',
      columns,
      rows: [],
    };
    onChange([...groups, newGroup]);
    setExpandedIds(prev => new Set([...prev, newGroup.clientId]));
  };

  const updateGroup = (clientId: string, partial: Partial<PolicyGroup>) => {
    onChange(groups.map(g => (g.clientId === clientId ? { ...g, ...partial } : g)));
  };

  const deleteGroup = (clientId: string) => {
    onChange(groups.filter(g => g.clientId !== clientId));
  };

  // --- Grid Management ---

  const addColumn = (groupId: string) => {
    const group = groups.find(g => g.clientId === groupId);
    if (!group) return;
    updateGroup(groupId, {
      columns: [...group.columns, { id: genClientId(), name: `Cột ${group.columns.length + 1}` }]
    });
  };

  const updateColumn = (groupId: string, colId: string, partial: any) => {
    const group = groups.find(g => g.clientId === groupId);
    if (!group) return;
    updateGroup(groupId, {
      columns: group.columns.map(c => c.id === colId ? { ...c, ...partial } : c)
    });
  };

  const removeColumn = (groupId: string, colId: string) => {
    const group = groups.find(g => g.clientId === groupId);
    if (!group) return;
    updateGroup(groupId, {
      columns: group.columns.filter(c => c.id !== colId),
      rows: group.rows.map(r => {
        const nextCells = { ...r.cells };
        delete nextCells[colId];
        return { ...r, cells: nextCells };
      }),
    });
  };

  const addRow = (groupId: string) => {
    const group = groups.find(g => g.clientId === groupId);
    if (!group) return;
    updateGroup(groupId, {
      rows: [...group.rows, { id: genClientId(), cells: {} }]
    });
  };

  const updateRowCell = (groupId: string, rowId: string, colId: string, val: string) => {
    const group = groups.find(g => g.clientId === groupId);
    if (!group) return;
    
    const targetGroup = group;
    const targetCol = targetGroup.columns.find(c => c.id === colId);
    
    updateGroup(groupId, {
      rows: targetGroup.rows.map(r => {
        if (r.id !== rowId) return r;
        const nextCells = { ...r.cells, [colId]: val };

        // Heuristic: Auto-fill position if grade is selected
        if (targetCol?.isGradePicker) {
          const grade = SAMPLE_GRADES.find(g => g.code === val);
          if (grade) {
            const posCol = targetGroup.columns.find(c => c.mappedField === 'position_hint');
            if (posCol) {
              nextCells[posCol.id] = grade.categoryGroup;
            }
          }
        }
        
        return { ...r, cells: nextCells };
      })
    });
  };

  const removeRow = (groupId: string, rowId: string) => {
    const group = groups.find(g => g.clientId === groupId);
    if (!group) return;
    updateGroup(groupId, {
      rows: group.rows.filter(r => r.id !== rowId)
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div>
          <h4 className="text-sm font-semibold">Cấu trúc Nhóm & Bảng dữ liệu</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Thêm các nhóm (VD: Lãnh đạo, Văn phòng). Mỗi nhóm là một bảng lưới dữ liệu động.
          </p>
        </div>
        <Button type="button" onClick={addGroup} className="gap-1.5 h-8 text-xs">
          <Plus className="w-3.5 h-3.5" /> Thêm Nhóm mới
        </Button>
      </div>

      {groups.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-muted p-8 text-center bg-white">
          <Layers className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">Chưa có nhóm nào</p>
          <p className="text-xs text-muted-foreground mt-1">
            Bấm "Thêm Nhóm mới" để khởi tạo bảng dữ liệu.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {groups.map((group) => {
          const isExpanded = expandedIds.has(group.clientId);
          
          return (
            <div key={group.clientId} className="rounded-lg border bg-white shadow-sm overflow-hidden">
              {/* Group Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b">
                <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0 cursor-move" />
                
                <div className="flex-1 grid grid-cols-[120px_1fr] gap-3">
                  <Input
                    placeholder="Mã nhóm"
                    className="h-8 text-sm"
                    value={group.code}
                    onChange={(e) => updateGroup(group.clientId, { code: e.target.value })}
                  />
                  <Input
                    placeholder="Tên nhóm (VD: Khối Lãnh đạo - Điều hành)"
                    className="h-8 text-sm font-medium"
                    value={group.name}
                    onChange={(e) => updateGroup(group.clientId, { name: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-primary"
                    onClick={() => toggleExpand(group.clientId)}
                  >
                    {isExpanded ? 'Thu gọn Bảng' : `Hiện Bảng (${group.rows.length} dòng)`}
                    {isExpanded ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteGroup(group.clientId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Group Content (Data Grid) */}
              {isExpanded && (
                <div className="p-4 bg-white overflow-x-auto">
                  <div className="border rounded-md">
                    <table className="w-full text-sm min-w-[600px]">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          {group.columns.map((col) => (
                            <th key={col.id} className="px-3 py-2 text-left font-semibold text-xs text-slate-600 border-r group min-w-[150px]">
                              <div className="flex items-center justify-between">
                                <Input
                                  className="h-7 text-xs bg-transparent border-transparent px-1 hover:border-input focus:border-input font-semibold"
                                  value={col.name}
                                  onChange={(e) => updateColumn(group.clientId, col.id, { name: e.target.value })}
                                />
                                
                                {/* Cấu hình map trường */}
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground opacity-50 hover:opacity-100">
                                      <Settings2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[260px] p-3 text-sm">
                                    <Label className="text-xs font-semibold mb-2 block">Map với biến số (Data Field)</Label>
                                    <Select
                                      value={col.mappedField || 'none'}
                                      onValueChange={(v) => updateColumn(group.clientId, col.id, { mappedField: v === 'none' ? undefined : v })}
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

                                    <div className="mt-3 flex items-center justify-between">
                                      <Label className="text-xs text-muted-foreground">Là ô chọn Ngạch?</Label>
                                      <input
                                        type="checkbox"
                                        checked={col.isGradePicker}
                                        onChange={(e) => updateColumn(group.clientId, col.id, { isGradePicker: e.target.checked })}
                                      />
                                    </div>

                                    <div className="mt-4 pt-3 border-t text-right">
                                      <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => removeColumn(group.clientId, col.id)}>
                                        Xóa cột này
                                      </Button>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                              {col.mappedField && (
                                <div className="px-1 mt-1 text-[10px] text-blue-600 font-medium truncate">
                                  → {MAPPABLE_FIELDS.find(f => f.id === col.mappedField)?.name || col.mappedField}
                                </div>
                              )}
                            </th>
                          ))}
                          <th className="w-10 px-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => addColumn(group.clientId)} className="h-7 w-7 p-0 shrink-0 text-primary">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {group.rows.length === 0 ? (
                          <tr>
                            <td colSpan={group.columns.length + 1} className="px-4 py-8 text-center text-muted-foreground text-xs italic bg-slate-50/50">
                              Chưa có dữ liệu. Hãy thêm cột và thêm dòng.
                            </td>
                          </tr>
                        ) : (
                          group.rows.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/50">
                              {group.columns.map((col) => (
                                <td key={col.id} className="px-3 py-2 border-r">
                                  {col.isGradePicker ? (
                                    <Select
                                      value={(row.cells[col.id] as string) || 'none'}
                                      onValueChange={(v) => updateRowCell(group.clientId, row.id, col.id, v === 'none' ? '' : v)}
                                    >
                                      <SelectTrigger className="h-8 text-xs bg-white">
                                        <SelectValue placeholder="Chọn ngạch" />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-[250px]">
                                        <SelectItem value="none">-- Chọn --</SelectItem>
                                        {SAMPLE_GRADES.map(g => (
                                          <SelectItem key={g.code} value={g.code}>{g.code} - {g.name}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Input
                                      className="h-8 text-xs bg-white"
                                      placeholder="..."
                                      value={row.cells[col.id] || ''}
                                      onChange={(e) => updateRowCell(group.clientId, row.id, col.id, e.target.value)}
                                    />
                                  )}
                                </td>
                              ))}
                              <td className="px-2 py-2 text-center bg-slate-50/30">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeRow(group.clientId, row.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    <div className="p-2 border-t bg-slate-50 flex items-center justify-between">
                      <Button type="button" variant="ghost" size="sm" onClick={() => addRow(group.clientId)} className="h-8 text-xs text-primary" disabled={group.columns.length === 0}>
                        <Plus className="w-3.5 h-3.5 mr-1" /> Thêm dòng dữ liệu
                      </Button>
                      <span className="text-xs text-muted-foreground mr-2">Tổng: {group.rows.length} dòng</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
