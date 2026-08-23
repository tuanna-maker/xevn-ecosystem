/**
 * @CODE-MEMORY
 * Screen:     HRM · Tiền lương · Chính sách → Phụ cấp
 * WorkItem:   PO-HRM-PAY-ALLOWANCE-FE-01
 * Coded:      2026-08-22
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

type AllowanceNature = 'fixed' | 'pct_salary' | 'pct_revenue';
type AllowancePolicy = {
  id: string; code: string; name: string; nature: AllowanceNature;
  value: number; unit: string; taxable: boolean; bhxh: boolean; active: boolean;
  appliedTo: string;
};

const MOCK: AllowancePolicy[] = [
  { id:'1', code:'PC-XANG', name:'Phụ cấp xăng xe', nature:'fixed', value:500000, unit:'VND/tháng', taxable:false, bhxh:false, active:true, appliedTo:'Tất cả nhân viên' },
  { id:'2', code:'PC-AN', name:'Phụ cấp ăn trưa', nature:'fixed', value:730000, unit:'VND/tháng', taxable:false, bhxh:false, active:true, appliedTo:'Văn phòng Hà Nội' },
  { id:'3', code:'PC-DIEN-THOAI', name:'Phụ cấp điện thoại', nature:'fixed', value:300000, unit:'VND/tháng', taxable:false, bhxh:false, active:true, appliedTo:'Cấp trưởng phòng+' },
  { id:'4', code:'PC-TRACH-NHIEM', name:'Phụ cấp trách nhiệm', nature:'pct_salary', value:15, unit:'% lương CB', taxable:true, bhxh:true, active:true, appliedTo:'Quản lý' },
  { id:'5', code:'PC-DOC-HAI', name:'Phụ cấp độc hại', nature:'fixed', value:1000000, unit:'VND/tháng', taxable:false, bhxh:false, active:false, appliedTo:'Tài xế tải' },
];

const natureLabel = (n: AllowanceNature) => ({ fixed:'Cố định', pct_salary:'% Lương CB', pct_revenue:'% Doanh thu' }[n]);
const fmt = (v: number) => new Intl.NumberFormat('vi-VN').format(v);

export function AllowancePolicyTab() {
  const { t } = useTranslation();
  const [policies, setPolicies] = useState(MOCK);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AllowancePolicy | null>(null);
  const [form, setForm] = useState({ code:'', name:'', nature:'fixed' as AllowanceNature, value:'', unit:'VND/tháng', taxable:false, bhxh:false, active:true, appliedTo:'' });

  const filtered = policies.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setEditing(null); setForm({ code:'', name:'', nature:'fixed', value:'', unit:'VND/tháng', taxable:false, bhxh:false, active:true, appliedTo:'' }); setOpen(true); };
  const openEdit = (p: AllowancePolicy) => { setEditing(p); setForm({ code:p.code, name:p.name, nature:p.nature, value:String(p.value), unit:p.unit, taxable:p.taxable, bhxh:p.bhxh, active:p.active, appliedTo:p.appliedTo }); setOpen(true); };
  const toggle = (id: string) => setPolicies(ps => ps.map(p => p.id===id ? { ...p, active:!p.active } : p));
  const remove = (id: string) => setPolicies(ps => ps.filter(p => p.id!==id));

  const save = () => {
    if (!form.code || !form.name) return;
    if (editing) {
      setPolicies(ps => ps.map(p => p.id===editing.id ? { ...p, ...form, value:Number(form.value) } : p));
    } else {
      setPolicies(ps => [...ps, { ...form, id: Date.now().toString(), value:Number(form.value) }]);
    }
    setOpen(false);
  };

  return (
    <div className="p-6 space-y-5 xevn-safe-inline" data-testid="pay-allowance-policy-tab">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold font-display text-xevn-text">Chính sách phụ cấp</h2>
          <p className="text-sm text-xevn-textSecondary mt-0.5">Quản lý các loại phụ cấp áp dụng cho từng nhóm nhân viên</p>
        </div>
        <Button size="sm" className="gap-1.5 bg-xevn-primary text-white hover:opacity-90" onClick={openNew}>
          <Plus className="w-4 h-4" /> Thêm phụ cấp
        </Button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <span>Phụ cấp không chịu thuế TNCN tối đa theo quy định hiện hành. Bật <strong>Tính BHXH</strong> nếu phụ cấp được tính vào lương đóng BHXH.</span>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Tìm phụ cấp..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <Card className="rounded-card border border-xevn-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-xevn-surface border-b border-xevn-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-xevn-textSecondary">Mã / Tên phụ cấp</th>
                <th className="px-4 py-3 text-left font-medium text-xevn-textSecondary">Loại</th>
                <th className="px-4 py-3 text-right font-medium text-xevn-textSecondary">Mức / Tỷ lệ</th>
                <th className="px-4 py-3 text-left font-medium text-xevn-textSecondary">Áp dụng cho</th>
                <th className="px-4 py-3 text-center font-medium text-xevn-textSecondary">Thuế</th>
                <th className="px-4 py-3 text-center font-medium text-xevn-textSecondary">BHXH</th>
                <th className="px-4 py-3 text-center font-medium text-xevn-textSecondary">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium text-xevn-textSecondary">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-xevn-border">
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-xevn-textSecondary">Không có dữ liệu</td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-xevn-surface/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-xevn-primary">{p.code}</p>
                    <p className="font-medium text-xevn-text">{p.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">{natureLabel(p.nature)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">
                    {p.nature === 'fixed' ? `${fmt(p.value)} ₫` : `${p.value}%`}
                    <p className="text-xs text-xevn-textSecondary font-normal">{p.unit}</p>
                  </td>
                  <td className="px-4 py-3 text-xevn-textSecondary text-xs">{p.appliedTo}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={p.taxable ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-green-100 text-green-700 border-green-200'}>
                      {p.taxable ? 'Chịu thuế' : 'Miễn thuế'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={p.bhxh ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600'}>
                      {p.bhxh ? 'Có' : 'Không'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggle(p.id)} className="text-xevn-textSecondary hover:text-xevn-primary transition-colors">
                      {p.active ? <ToggleRight className="w-6 h-6 text-xevn-primary" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => remove(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-[20px] font-bold">{editing ? 'Sửa phụ cấp' : 'Thêm phụ cấp mới'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Mã phụ cấp *</Label>
                <Input placeholder="VD: PC-XANG" value={form.code} onChange={e => setForm(f=>({...f, code:e.target.value.toUpperCase()}))} />
              </div>
              <div className="space-y-1.5">
                <Label>Loại phụ cấp</Label>
                <Select value={form.nature} onValueChange={v => setForm(f=>({...f, nature:v as AllowanceNature}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Cố định (VND)</SelectItem>
                    <SelectItem value="pct_salary">% Lương cơ bản</SelectItem>
                    <SelectItem value="pct_revenue">% Doanh thu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tên phụ cấp *</Label>
              <Input placeholder="VD: Phụ cấp xăng xe" value={form.name} onChange={e => setForm(f=>({...f, name:e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Mức / Tỷ lệ</Label>
                <Input type="number" placeholder="0" value={form.value} onChange={e => setForm(f=>({...f, value:e.target.value}))} />
              </div>
              <div className="space-y-1.5">
                <Label>Đơn vị</Label>
                <Input placeholder="VND/tháng" value={form.unit} onChange={e => setForm(f=>({...f, unit:e.target.value}))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Áp dụng cho</Label>
              <Input placeholder="VD: Tất cả nhân viên, Văn phòng HN..." value={form.appliedTo} onChange={e => setForm(f=>({...f, appliedTo:e.target.value}))} />
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2"><Switch checked={form.taxable} onCheckedChange={v => setForm(f=>({...f, taxable:v}))} /><Label>Chịu thuế TNCN</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.bhxh} onCheckedChange={v => setForm(f=>({...f, bhxh:v}))} /><Label>Tính BHXH</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={v => setForm(f=>({...f, active:v}))} /><Label>Kích hoạt</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button className="bg-xevn-primary text-white hover:opacity-90" onClick={save}>Lưu phụ cấp</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}