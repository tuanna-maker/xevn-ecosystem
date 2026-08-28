/**
 * @CODE-MEMORY
 * Screen:     HRM · Tiền lương · Dữ liệu → Sản phẩm / Sản lượng
 * WorkItem:   PO-HRM-PAY-DATA-PRODUCT-FE-01
 * Coded:      2026-08-22
 */
import { useState } from 'react';
import { Upload, Search, Package2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type ProductRecord = { id:string; employee_code:string; employee_name:string; product_type:string; quantity:number; unit:string; unit_price:number; total:number; period:string };

const fmt = (v: number) => new Intl.NumberFormat('vi-VN').format(v);

export function ProductDataTab() {
  const [records, setRecords] = useState<ProductRecord[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employee_code:'', employee_name:'', product_type:'', quantity:'', unit:'lượt', unit_price:'' });
  const filtered = records.filter(r => r.employee_name.toLowerCase().includes(search.toLowerCase()) || r.employee_code.includes(search));
  const totalAmt = filtered.reduce((s,r)=>s+r.total, 0);

  const save = () => {
    if (!form.employee_code || !form.quantity) return;
    const qty = Number(form.quantity), price = Number(form.unit_price);
    setRecords(rs=>[...rs, { ...form, id:Date.now().toString(), quantity:qty, unit_price:price, total:qty*price, period:'2026-08' }]);
    setForm({ employee_code:'', employee_name:'', product_type:'', quantity:'', unit:'lượt', unit_price:'' });
    setOpen(false);
  };

  return (
    <div className="p-6 space-y-5 xevn-safe-inline" data-testid="pay-data-product-tab">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold font-display text-xevn-text flex items-center gap-2">
            <Package2 className="w-5 h-5 text-xevn-primary"/>Dữ liệu sản phẩm / sản lượng tháng 8/2026
          </h2>
          <p className="text-sm text-xevn-textSecondary mt-0.5">Số lượng lượt tuyến, sản phẩm dùng để tính lương khoán, lương sản phẩm</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5"><Upload className="w-3.5 h-3.5"/>Import từ VTS/GPS</Button>
          <Button size="sm" className="gap-1.5 bg-xevn-primary text-white hover:opacity-90" onClick={()=>setOpen(true)}><Plus className="w-3.5 h-3.5"/>Nhập thủ công</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Tổng nhân viên', value:records.length },
          { label:'Tổng sản lượng', value:`${records.reduce((s,r)=>s+r.quantity,0)} lượt` },
          { label:'Tổng giá trị', value:`${fmt(totalAmt)} ₫` },
        ].map(c=>(
          <Card key={c.label} className="rounded-card border border-xevn-border p-4">
            <p className="text-lg font-bold text-xevn-primary">{c.value}</p>
            <p className="text-xs text-xevn-textSecondary mt-0.5">{c.label}</p>
          </Card>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
        <Input className="pl-9" placeholder="Tìm nhân viên..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <Card className="rounded-card border border-xevn-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-xevn-surface border-b border-xevn-border">
            <tr>{['Nhân viên','Loại sản phẩm/tuyến','Số lượng','Đơn giá','Thành tiền',''].map(h=>(
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
                <td className="px-4 py-3 text-xevn-textSecondary">{r.product_type}</td>
                <td className="px-4 py-3"><Badge variant="outline">{r.quantity} {r.unit}</Badge></td>
                <td className="px-4 py-3 tabular-nums">{fmt(r.unit_price)} ₫/{r.unit}</td>
                <td className="px-4 py-3 tabular-nums font-medium text-xevn-primary">{fmt(r.total)} ₫</td>
                <td className="px-4 py-3"><Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={()=>setRecords(rs=>rs.filter(x=>x.id!==r.id))}><Trash2 className="w-3.5 h-3.5"/></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-[20px] font-bold">Nhập sản lượng</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Mã NV</Label><Input value={form.employee_code} onChange={e=>setForm(f=>({...f,employee_code:e.target.value}))}/></div>
              <div className="space-y-1.5"><Label>Tên NV</Label><Input value={form.employee_name} onChange={e=>setForm(f=>({...f,employee_name:e.target.value}))}/></div>
            </div>
            <div className="space-y-1.5"><Label>Loại sản phẩm/tuyến</Label><Input placeholder="VD: Hà Nội - Việt Trì" value={form.product_type} onChange={e=>setForm(f=>({...f,product_type:e.target.value}))}/></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label>Số lượng</Label><Input type="number" value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:e.target.value}))}/></div>
              <div className="space-y-1.5"><Label>Đơn vị</Label><Input value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}/></div>
              <div className="space-y-1.5"><Label>Đơn giá (₫)</Label><Input type="number" value={form.unit_price} onChange={e=>setForm(f=>({...f,unit_price:e.target.value}))}/></div>
            </div>
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