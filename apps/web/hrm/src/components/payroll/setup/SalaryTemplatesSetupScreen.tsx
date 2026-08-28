/**
 * @CODE-MEMORY
 * Screen:     HRM Lương → Thiết lập lương → Mẫu bảng lương
 * UC:         UC-BP-PAY-STP-03
 * WorkItem:   PO-HRM-PAY-STP-TEMPLATE-FE-01
 * Coded:      2026-08-22
 */
import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Copy, FileText, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type SalaryTemplate = {
  id: string; code: string; name: string; description: string;
  componentCount: number; isDefault: boolean; isLocked: boolean;
  appliedTo: string; createdAt: string;
};

export function SalaryTemplatesSetupScreen() {
  const [templates, setTemplates] = useState<SalaryTemplate[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code:'', name:'', description:'', appliedTo:'' });
  const filtered = templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.code.includes(search));

  const save = () => {
    if (!form.code || !form.name) return;
    setTemplates(ts => [...ts, { ...form, id:Date.now().toString(), componentCount:0, isDefault:false, isLocked:false, createdAt:new Date().toISOString().slice(0,10) }]);
    setForm({ code:'', name:'', description:'', appliedTo:'' });
    setOpen(false);
  };

  return (
    <div className="space-y-5" data-testid="pay-stp-templates-screen">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[18px] font-bold text-xevn-text">Mẫu bảng lương</h3>
          <p className="text-sm text-xevn-textSecondary mt-0.5">Cấu hình tập thành phần lương cho từng nhóm nhân sự</p>
        </div>
        <Button size="sm" className="gap-1.5 bg-xevn-primary text-white hover:opacity-90" onClick={()=>setOpen(true)}>
          <Plus className="w-4 h-4"/>Tạo mẫu mới
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
        <Input className="pl-9" placeholder="Tìm mẫu..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <div className="space-y-3">
        {filtered.map(t=>(
          <Card key={t.id} className="rounded-card border border-xevn-border hover:border-xevn-primary/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-xevn-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5 text-xevn-primary"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-xevn-primary truncate">{t.code}</span>
                      {t.isDefault && <Badge className="bg-xevn-primary/10 text-xevn-primary border-xevn-primary/30 text-xs gap-1 whitespace-nowrap"><CheckCircle2 className="w-3 h-3"/>Mặc định</Badge>}
                      {t.isLocked && <Badge variant="outline" className="text-xs gap-1 whitespace-nowrap"><Lock className="w-3 h-3"/>Khoá</Badge>}
                    </div>
                    <p className="font-semibold text-xevn-text mt-0.5 truncate">{t.name}</p>
                    <p className="text-sm text-xevn-textSecondary mt-0.5 line-clamp-2">{t.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-xevn-textSecondary flex-wrap">
                      <span className="whitespace-nowrap">👥 {t.appliedTo}</span>
                      <span className="whitespace-nowrap">📦 {t.componentCount} thành phần</span>
                      <span className="whitespace-nowrap">📅 {t.createdAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8" title="Nhân bản"><Copy className="w-3.5 h-3.5"/></Button>
                  {!t.isLocked && <>
                    <Button size="icon" variant="ghost" className="h-8 w-8"><Pencil className="w-3.5 h-3.5"/></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={()=>setTemplates(ts=>ts.filter(x=>x.id!==t.id))}><Trash2 className="w-3.5 h-3.5"/></Button>
                  </>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-[20px] font-bold">Tạo mẫu bảng lương mới</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Mã mẫu *</Label><Input placeholder="VD: TPL-DRIVER" value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))}/></div>
            </div>
            <div className="space-y-1.5"><Label>Tên mẫu *</Label><Input placeholder="VD: Lái xe tuyến" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
            <div className="space-y-1.5"><Label>Mô tả</Label><Input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
            <div className="space-y-1.5"><Label>Áp dụng cho</Label><Input placeholder="VD: Lái xe tuyến xe khách" value={form.appliedTo} onChange={e=>setForm(f=>({...f,appliedTo:e.target.value}))}/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpen(false)}>Hủy</Button>
            <Button className="bg-xevn-primary text-white hover:opacity-90" onClick={save}>Tạo mẫu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}