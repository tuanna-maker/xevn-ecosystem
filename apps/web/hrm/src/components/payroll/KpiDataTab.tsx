/**
 * @CODE-MEMORY
 * Screen:     HRM · Tiền lương · Dữ liệu → KPI
 * WorkItem:   PO-HRM-PAY-DATA-KPI-FE-01
 * Coded:      2026-08-22
 */
import { useState } from 'react';
import { Upload, Search, CheckCircle2, Clock, AlertCircle, BarChart3, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type KpiRecord = { id:string; employee_code:string; employee_name:string; department:string; kpi_score:number; revenue:number; target_revenue:number; period:string; status:'approved'|'pending'|'rejected' };

const fmt = (v: number) => new Intl.NumberFormat('vi-VN').format(v);

export function KpiDataTab() {
  const [records] = useState<KpiRecord[]>([]);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('2026-08');
  const filtered = records.filter(r => r.employee_name.toLowerCase().includes(search.toLowerCase()) || r.employee_code.includes(search));
  const avgScore = records.length ? (records.reduce((s,r)=>s+r.kpi_score,0)/records.length).toFixed(1) : '0';

  return (
    <div className="p-6 space-y-5 xevn-safe-inline" data-testid="pay-data-kpi-tab">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold font-display text-xevn-text flex items-center gap-2"><BarChart3 className="w-5 h-5 text-xevn-primary"/>Dữ liệu KPI tháng</h2>
          <p className="text-sm text-xevn-textSecondary mt-0.5">Điểm KPI và doanh thu dùng để tính thưởng/hoa hồng</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5"><RefreshCw className="w-3.5 h-3.5"/>Đồng bộ từ KPI Engine</Button>
          <Button size="sm" className="gap-1.5 bg-xevn-primary text-white hover:opacity-90"><Upload className="w-3.5 h-3.5"/>Import Excel</Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label:'Tổng nhân viên', value:records.length, color:'text-xevn-primary' },
          { label:'Đã duyệt', value:records.filter(r=>r.status==='approved').length, color:'text-green-600' },
          { label:'Chờ duyệt', value:records.filter(r=>r.status==='pending').length, color:'text-amber-600' },
          { label:'KPI TB', value:`${avgScore}%`, color:'text-blue-600' },
        ].map(c => (
          <Card key={c.label} className="rounded-card border border-xevn-border p-4 text-center">
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-xevn-textSecondary mt-1">{c.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="2026-08">Tháng 8/2026</SelectItem>
            <SelectItem value="2026-07">Tháng 7/2026</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
          <Input className="pl-9" placeholder="Tìm nhân viên..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>

      <Card className="rounded-card border border-xevn-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-xevn-surface border-b border-xevn-border">
              <tr>
                {['Nhân viên','Bộ phận','Điểm KPI','Doanh thu thực','Mục tiêu','Tỷ lệ đạt','Trạng thái'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left font-medium text-xevn-textSecondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-xevn-border">
              {filtered.map(r=>(
                <tr key={r.id} className="hover:bg-xevn-surface/50">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-xevn-primary">{r.employee_code}</p>
                    <p className="font-medium text-xevn-text">{r.employee_name}</p>
                  </td>
                  <td className="px-4 py-3 text-xevn-textSecondary">{r.department}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-xevn-primary rounded-full" style={{width:`${r.kpi_score}%`}}/>
                      </div>
                      <span className="font-medium">{r.kpi_score}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{r.revenue>0?`${fmt(r.revenue)} ₫`:'—'}</td>
                  <td className="px-4 py-3 tabular-nums">{r.target_revenue>0?`${fmt(r.target_revenue)} ₫`:'—'}</td>
                  <td className="px-4 py-3">
                    {r.target_revenue>0 ? (
                      <Badge className={r.revenue>=r.target_revenue?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}>
                        {((r.revenue/r.target_revenue)*100).toFixed(0)}%
                      </Badge>
                    ) : <span className="text-xevn-textSecondary">N/A</span>}
                  </td>
                  <td className="px-4 py-3">{statusBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}