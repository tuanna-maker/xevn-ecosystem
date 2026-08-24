/**
 * @CODE-MEMORY
 * Screen:     HRM · Tiền lương · Dữ liệu → Thu nhập khác
 * WorkItem:   PO-HRM-PAY-DATA-INCOME-FE-01
 * Coded:      2026-08-22
 */
import { useState } from 'react';
import { Plus, Upload, Search, Pencil, Trash2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type IncomeRecord = { id:string; employee_code:string; employee_name:string; type:string; amount:number; note:string; period:string; taxable:boolean };

const MOCK: IncomeRecord[] = [
  { id:'1', employee_code:'LX-001', employee_name:'Nguyễn Văn An', type:'Thưởng doanh số', amount:2500000, note:'Vượt KPI tháng 8', period:'2026-08', taxable:true },
  { id:'2', employee_code:'VP-001', employee_name:'Phạm Thị Dung', type:'Thưởng cải tiến', amount:1000000, note:'Sáng kiến tiết kiệm chi phí', period:'2026-08', taxable:true },
  { id:'3', employee_code:'DP-001', employee_name:'Lê Minh Cường', type:'Hỗ trợ làm thêm', amount:500000, note:'OT cuối tuần', period:'2026-08', taxable:false },
];

const fmt = (v: number) => new Intl.NumberFormat('vi-VN').format(v);

export function OtherIncomeDataTab() {
  const [records, setRecords] = useState(MOCK);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employee_code:'', employee_name:'', type:'', amount:'', note:'', taxable:true });
  const filtered = records.filter(r => r.employee_name.toLowerCase().includes(search.toLowerCase()) || r.employee_code.includes(search));
  const total = filtered.reduce((s,r)=>s+r.amount, 0);

  const save = () => {
    if (!form.employee_code || !form.amount) return;
    setRecords(rs => [...rs, { ...form, id:Date.now().toString(), amount:Number(form.amount), period:'2026-08' }]);
    setForm({ employee_code:'', employee_name:'', type:'', amount:'', note:'', taxable:true });
    setOpen(false);
  };

  return (
    <div className="p-6 space-y-5 xevn-safe-inline" data-testid="pay-data-other-income-tab">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold font-display text-xevn-text flex items-center gap-2"><DollarSign className="w-5 h-5 text-xevn-primary"/>Thu nhập khác tháng 8/2026</h2>
          <p className="text-sm text-xevn-textSecondary mt-0.5">Các khoản thu nhập phát sinh ngoài lương cơ bản</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5"><Upload className="w-3.5 h-3.5"/>Import Excel</Button>
          <Button size="sm" className="gap-1.5 bg-xevn-primary text-white hover:opacity-90" onClick={() => setOpen(true)}><Plus className="w-3.5 h-3.5"/>Thêm thu nhập</Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
          <Input className="pl-9" placeholder="Tìm nhân viên..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="text-sm font-medium text-xevn-text">
          Tổng: <span className="text-xevn-primary tabular-nums">{fmt(total)} ₫</span>
        </div>
      </div>

      <Card className="rounded-card border border-xevn-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-xevn-surface border-b border-xevn-border">
            <tr>{['Nhân viên','Loại thu nhập','Số tiền','Ghi chú','Thuế TNCN','Thao tác'].map(h=>(
              <th key={h} className="px-4 py-3 text-left font-medium text-xevn-textSecondary">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-xevn-border">
            {filtered.map(r=>(
              <tr key={r.id} className="hover:bg-xevn-surface/50">
                <td className="px-4 py-3">
                  <p className="font-mono text-xs text-xevn-primary">{r.employee_code}</p>
                  <p className="font-medium text-xevn-text">{r.employee_name}</p>
                </td>
                <td className="px-4 py-3"><Badge variant="outline">{r.type}</Badge></td>
                <td className="px-4 py-3 tabular-nums font-medium text-xevn-text">{fmt(r.amount)} ₫</td>
                <td className="px-4 py-3 text-xevn-textSecondary text-xs">{r.note}</td>
                <td className="px-4 py-3"><Badge className={r.taxable?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'}>{r.taxable?'Chịu thuế':'Miễn thuế'}</Badge></td>
                <td className="px-4 py-3">
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={()=>setRecords(rs=>rs.filter(x=>x.id!==r.id))}><Trash2 className="w-3.5 h-3.5"/></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-[20px] font-bold">Thêm thu nhập khác</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Mã NV</Label><Input placeholder="VD: LX-001" value={form.employee_code} onChange={e=>setForm(f=>({...f,employee_code:e.target.value}))}/></div>
              <div className="space-y-1.5"><Label>Tên NV</Label><Input placeholder="Họ và tên" value={form.employee_name} onChange={e=>setForm(f=>({...f,employee_name:e.target.value}))}/></div>
            </div>
            <div className="space-y-1.5"><Label>Loại thu nhập</Label><Input placeholder="VD: Thưởng doanh số" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}/></div>
            <div className="space-y-1.5"><Label>Số tiền (₫)</Label><Input type="number" placeholder="0" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}/></div>
            <div className="space-y-1.5"><Label>Ghi chú</Label><Input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpen(false)}>Hủy</Button>
            <Button className="bg-xevn-primary text-white hover:opacity-90" onClick={save}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}