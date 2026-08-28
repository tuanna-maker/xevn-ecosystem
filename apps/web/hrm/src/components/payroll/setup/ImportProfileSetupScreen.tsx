/**
 * @CODE-MEMORY
 * Screen:     HRM Lương → Thiết lập → Profile nhập liệu
 * WorkItem:   PO-HRM-PAY-STP-IMPORT-PROFILE-FE-01
 * Coded:      2026-08-22
 */
import { useState } from 'react';
import { Upload, Plus, Pencil, Trash2, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FieldMapping = { column: string; field: string; required: boolean };
type ImportProfile = {
  id: string; name: string; type: string; fileFormat: string;
  mappings: FieldMapping[]; lastUsed: string; status: 'active'|'draft';
};

export function ImportProfileSetupScreen() {
  const [profiles, setProfiles] = useState<ImportProfile[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name:'', type:'attendance', fileFormat:'xlsx' });

  const typeLabel = (t: string) => ({ attendance:'Chấm công', kpi:'KPI/Doanh thu', product:'Sản lượng', other_income:'Thu nhập khác', deduction:'Khấu trừ' }[t] ?? t);

  return (
    <div className="space-y-5" data-testid="pay-stp-import-profile-screen">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[18px] font-bold text-xevn-text">Profile nhập liệu</h3>
          <p className="text-sm text-xevn-textSecondary mt-0.5">Cấu hình mapping cột file Excel/CSV với trường dữ liệu lương</p>
        </div>
        <Button size="sm" className="gap-1.5 bg-xevn-primary text-white hover:opacity-90" onClick={()=>setOpen(true)}>
          <Plus className="w-4 h-4"/>Tạo profile mới
        </Button>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        💡 Profile nhập liệu giúp tái sử dụng cấu hình mapping khi import file từ các nguồn như máy chấm công, VTS, phần mềm KPI.
      </div>

      <div className="space-y-3">
        {profiles.map(p=>(
          <Card key={p.id} className="rounded-card border border-xevn-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-xevn-primary/10 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5 text-xevn-primary"/>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xevn-text">{p.name}</span>
                      <Badge className={p.status==='active'?'bg-green-100 text-green-700 gap-1':'bg-slate-100 text-slate-600 gap-1'}>
                        {p.status==='active'?<CheckCircle2 className="w-3 h-3"/>:<AlertCircle className="w-3 h-3"/>}
                        {p.status==='active'?'Đang dùng':'Nháp'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-xevn-textSecondary">
                      <span>📂 {typeLabel(p.type)}</span>
                      <span>📄 .{p.fileFormat.toUpperCase()}</span>
                      <span>🗓 Dùng lần cuối: {p.lastUsed}</span>
                      <span>🔗 {p.mappings.length} cột mapping</span>
                    </div>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {p.mappings.map(m=>(
                        <Badge key={m.column} variant="outline" className="text-xs font-mono">
                          {m.column} → {m.field}{m.required?' *':''}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8"><Upload className="w-3.5 h-3.5"/></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8"><Pencil className="w-3.5 h-3.5"/></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={()=>setProfiles(ps=>ps.filter(x=>x.id!==p.id))}><Trash2 className="w-3.5 h-3.5"/></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-[20px] font-bold">Tạo profile nhập liệu</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Tên profile *</Label><Input placeholder="VD: Import chấm công máy Hikvision" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Loại dữ liệu</Label>
                <Select value={form.type} onValueChange={v=>setForm(f=>({...f,type:v}))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendance">Chấm công</SelectItem>
                    <SelectItem value="kpi">KPI / Doanh thu</SelectItem>
                    <SelectItem value="product">Sản lượng</SelectItem>
                    <SelectItem value="other_income">Thu nhập khác</SelectItem>
                    <SelectItem value="deduction">Khấu trừ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Định dạng file</Label>
                <Select value={form.fileFormat} onValueChange={v=>setForm(f=>({...f,fileFormat:v}))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                    <SelectItem value="xls">Excel cũ (.xls)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-xevn-textSecondary">Sau khi tạo, có thể cấu hình chi tiết mapping cột trong màn hình chỉnh sửa.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpen(false)}>Hủy</Button>
            <Button className="bg-xevn-primary text-white hover:opacity-90" onClick={()=>{
              if(!form.name) return;
              setProfiles(ps=>[...ps,{...form,id:Date.now().toString(),mappings:[],lastUsed:'—',status:'draft'}]);
              setOpen(false);
            }}>Tạo profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}