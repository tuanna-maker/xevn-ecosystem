/**
 * @CODE-MEMORY
 * Screen:     HRM · Tiền lương · Dữ liệu → Khấu trừ khác
 * WorkItem:   PO-HRM-PAY-DATA-DEDUCTION-FE-01
 * Coded:      2026-08-22
 */
import { useState } from 'react';
import { Plus, Upload, Search, Trash2, MinusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type DeductionRecord = { id:string; employee_code:string; employee_name:string; type:string; amount:number; reason:string; period:string };

const fmt = (v: number) => new Intl.NumberFormat('vi-VN').format(v);

export function DeductionDataTab() {
  const [records, setRecords] = useState<DeductionRecord[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employee_code:'', employee_name:'', type:'', amount:'', reason:'' });
  const filtered = records.filter(r => r.employee_name.toLowerCase().includes(search.toLowerCase()) || r.employee_code.includes(search));
  const total = filtered.reduce((s,r)=>s+r.amount, 0);

  const save = () => {
    if (!form.employee_code || !form.amount) return;
    setRecords(rs => [...rs, { ...form, id:Date.now().toString(), amount:Number(form.amount), period:'2026-08' }]);
    setForm({ employee_code:'', employee_name:'', type:'', amount:'', reason:'' });
    setOpen(false);
  };

  return (
    <div className="p-6 space-y-5 xevn-safe-inline" data-testid="pay-data-deduction-tab">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold font-display text-xevn-text flex items-center gap-2">
            <MinusCircle className="w-5 h-5 text-red-500"/>Khấu trừ khác tháng 8/2026
          </h2>
          <p className="text-sm text-xevn-textSecondary mt-0.5">Phạt, hoàn ứng và các khoản trừ phát sinh trong kỳ</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5"><Upload className="w-3.5 h-3.5"/>Import Excel</Button>
          <Button size="sm" className="gap-1.5 bg-xevn-primary text-white hover:opacity-90" onClick={()=>setOpen(true)}><Plus className="w-3.5 h-3.5"/>Thêm khấu trừ</Button>
        </div>
      </div>

      {/* Warning banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        ⚠️ Khấu trừ đã nhập ở đây sẽ tự động cộng vào cột <strong>Khấu trừ khác</strong> khi chạy bảng lương kỳ này.
      </div>

      <div className="flex items-center justify-between">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
          <Input className="pl-9" placeholder="Tìm nhân viên..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="text-sm font-medium">
          Tổng khấu trừ: <span className="text-red-600 tabular-nums">- {fmt(total)} ₫</span>
        </div>
      </div>

      <Card className="rounded-card border border-xevn-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-xevn-surface border-b border-xevn-border">
            <tr>{['Nhân viên','Loại khấu trừ','Số tiền','Lý do','Thao tác'].map(h=>(
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
                <td className="px-4 py-3"><Badge variant="outline" className="border-red-200 text-red-700">{r.type}</Badge></td>
                <td className="px-4 py-3 tabular-nums font-medium text-red-600">- {fmt(r.amount)} ₫</td>
                <td className="px-4 py-3 text-xevn-textSecondary text-xs">{r.reason}</td>
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
          <DialogHeader><DialogTitle className="text-[20px] font-bold">Thêm khấu trừ</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Mã NV</Label><Input placeholder="VD: LX-001" value={form.employee_code} onChange={e=>setForm(f=>({...f,employee_code:e.target.value}))}/></div>
              <div className="space-y-1.5"><Label>Tên NV</Label><Input value={form.employee_name} onChange={e=>setForm(f=>({...f,employee_name:e.target.value}))}/></div>
            </div>
            <div className="space-y-1.5"><Label>Loại khấu trừ</Label><Input placeholder="VD: Phạt muộn giờ" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}/></div>
            <div className="space-y-1.5"><Label>Số tiền (₫)</Label><Input type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}/></div>
            <div className="space-y-1.5"><Label>Lý do</Label><Input value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))}/></div>
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