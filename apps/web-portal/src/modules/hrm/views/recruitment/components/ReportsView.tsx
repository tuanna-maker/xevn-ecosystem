import React from 'react';
import { Card } from '../../../../../components/common';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Users, Briefcase, Target, 
  Calendar, Download, Filter, RefreshCw, FileText
} from 'lucide-react';

const DATA_EFFICIENCY = [
  { name: 'T1', value: 45 },
  { name: 'T2', value: 52 },
  { name: 'T3', value: 48 },
  { name: 'T4', value: 61 },
  { name: 'T5', value: 55 },
  { name: 'T6', value: 67 },
];

const DATA_SOURCES = [
  { name: 'TopCV', value: 400, color: '#3b82f6' },
  { name: 'LinkedIn', value: 300, color: '#10b981' },
  { name: 'Referral', value: 200, color: '#f59e0b' },
  { name: 'Facebook', value: 100, color: '#ef4444' },
];

export const ReportsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-800">Báo cáo tuyển dụng</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Phân tích hiệu quả và xu hướng tuyển dụng</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-[12px] font-black text-slate-600 hover:bg-slate-50 transition-all">
            <Calendar className="w-4 h-4" />
            Tháng này
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-full bg-xevn-primary px-6 text-[12px] font-black text-white shadow-lg shadow-blue-200 transition active:scale-95 hover:opacity-90">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Tỷ lệ chuyển đổi', val: '12.5%', trend: '+2.1%', icon: TrendingUp, color: 'text-blue-500' },
          { label: 'Thời gian tuyển TB', val: '18 ngày', trend: '-2 ngày', icon: Calendar, color: 'text-emerald-500' },
          { label: 'Chi phí/Ứng viên', val: '450k', trend: '+15k', icon: Target, color: 'text-amber-500' },
          { label: 'Ứng viên tiềm năng', val: '1,240', trend: '+12%', icon: Users, color: 'text-purple-500' },
        ].map((s, idx) => (
          <Card key={idx} className="p-5 border-slate-100">
             <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${s.color}`}>
                   <s.icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${s.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                   {s.trend}
                </span>
             </div>
             <p className="text-2xl font-black text-slate-800">{s.val}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-6 border-slate-100 rounded-[32px]">
          <div className="flex items-center justify-between mb-8">
             <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Hiệu quả tuyển dụng theo thời gian
             </h4>
             <select className="text-[11px] font-bold text-slate-400 bg-slate-50 border-none outline-none px-3 py-1 rounded-lg">
                <option>6 tháng qua</option>
             </select>
          </div>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DATA_EFFICIENCY}>
                   <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                         <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                   <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                   <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                   />
                   <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-slate-100 rounded-[32px]">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-2">
             <Briefcase className="w-4 h-4 text-emerald-500" />
             Nguồn ứng viên
          </h4>
          <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                   <Pie
                      data={DATA_SOURCES}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                   >
                      {DATA_SOURCES.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                   </Pie>
                   <Tooltip />
                </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
             {DATA_SOURCES.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-xs font-bold text-slate-500">{d.name}</span>
                   </div>
                   <span className="text-xs font-black text-slate-700">{d.value}</span>
                </div>
             ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 border-slate-100 rounded-[32px]">
         <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
               <FileText className="w-4 h-4 text-purple-500" />
               Chi tiết hiệu quả theo vị trí
            </h4>
            <button className="text-xs font-bold text-xevn-primary hover:underline">Xem tất cả</button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="border-b border-slate-50">
                     <th className="pb-4 text-left text-[10px] font-black text-slate-400 uppercase">Vị trí</th>
                     <th className="pb-4 text-left text-[10px] font-black text-slate-400 uppercase">Tin tuyển dụng</th>
                     <th className="pb-4 text-left text-[10px] font-black text-slate-400 uppercase">Ứng viên</th>
                     <th className="pb-4 text-left text-[10px] font-black text-slate-400 uppercase">Phỏng vấn</th>
                     <th className="pb-4 text-left text-[10px] font-black text-slate-400 uppercase">Tỷ lệ đạt</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {[
                     { pos: 'Frontend Developer', jobs: 2, candidates: 45, interviews: 12, rate: '26.7%' },
                     { pos: 'Backend Developer', jobs: 1, candidates: 32, interviews: 8, rate: '25.0%' },
                     { pos: 'UI/UX Designer', jobs: 1, candidates: 18, interviews: 5, rate: '27.8%' },
                  ].map((row, i) => (
                     <tr key={i} className="group hover:bg-slate-50/50 transition-all">
                        <td className="py-4 text-xs font-black text-slate-700">{row.pos}</td>
                        <td className="py-4 text-xs font-bold text-slate-500">{row.jobs}</td>
                        <td className="py-4 text-xs font-bold text-slate-500">{row.candidates}</td>
                        <td className="py-4 text-xs font-bold text-slate-500">{row.interviews}</td>
                        <td className="py-4">
                           <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-blue-500 rounded-full" style={{ width: row.rate }} />
                              </div>
                              <span className="text-[10px] font-black text-blue-600">{row.rate}</span>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
};
