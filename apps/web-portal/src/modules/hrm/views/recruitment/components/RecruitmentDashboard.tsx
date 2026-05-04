import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  Users, UserCheck, MessageSquare, Target, 
  TrendingUp, DollarSign, PieChart, Activity 
} from 'lucide-react';
import { Card } from '../../../../../components/common';

const LINE_DATA = [
  { month: '01/2023', value: 15 },
  { month: '02/2023', value: 22 },
  { month: '03/2023', value: 28 },
  { month: '04/2023', value: 45 },
  { month: '05/2023', value: 58 },
  { month: '06/2023', value: 42 },
  { month: '07/2023', value: 35 },
  { month: '08/2023', value: 50 },
  { month: '09/2023', value: 38 },
  { month: '10/2023', value: 32 },
  { month: '11/2023', value: 25 },
  { month: '12/2023', value: 30 },
];

const BAR_DATA = [
  { name: 'CÔNG TY CỔ PHẦN 1OFFICE', value: 95, color: '#F59E0B' },
  { name: 'Chi nhánh HCM - Echard Phở...', value: 82, color: '#10B981' },
  { name: 'Chi nhánh HCM - Phòng kế toán...', value: 70, color: '#8B5CF6' },
  { name: 'CÔNG TY CỔ PHẦN 1OFFICE - Chi...', value: 65, color: '#06B6D4' },
  { name: 'Chi nhánh Hà Nội - Kinh doanh...', value: 58, color: '#F59E0B' },
  { name: 'Chi nhánh Hà Nội - Triển khai...', value: 52, color: '#10B981' },
  { name: 'CÔNG TY CỔ PHẦN 1OFFICE - Ban...', value: 45, color: '#8B5CF6' },
  { name: 'Chi nhánh Hà Nội - Phòng kế toán...', value: 38, color: '#06B6D4' },
];

export const RecruitmentDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Chỉ tiêu', count: 86, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'CV Ứng tuyển', count: 124, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Đã phỏng vấn', count: 42, icon: MessageSquare, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Đã tuyển', count: 18, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((s, idx) => (
          <Card key={idx} className="p-4 flex items-center gap-4 border-slate-100">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-slate-800">{s.count}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Cost Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Chi phí TB/ Ứng viên', count: '990.000 đ', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50/50' },
          { label: 'Chi phí kênh TopCV', count: '13.395.000 đ', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50/50' },
          { label: 'Chi phí kênh 24h', count: '2.756.804 đ', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50/50' },
        ].map((s, idx) => (
          <div key={idx} className={`p-4 rounded-[24px] border border-slate-100 ${s.bg} flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-lg font-black text-slate-800">{s.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <Card className="p-6 border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-xevn-primary" />
            Biểu đồ tuyển dụng
          </h4>
          <div className="flex gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <div className="w-2 h-2 rounded-full bg-xevn-primary" /> Số lượng CV
            </span>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={LINE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="recruitmentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0047FF" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#0047FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#0047FF" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#recruitmentGradient)" 
                dot={{ r: 4, fill: '#fff', stroke: '#0047FF', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#0047FF', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Chart */}
        <Card className="p-6 border-slate-100">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-6">Biểu đồ tuyển dụng theo trạng thái</h4>
          <div className="flex flex-col items-center justify-center py-10 opacity-40">
             <PieChart className="w-16 h-16 mb-2 text-slate-300" />
             <p className="text-xs font-bold text-slate-400">Chưa có dữ liệu phân tích trạng thái</p>
          </div>
        </Card>

        {/* Activity Feed */}
        <Card className="p-6 border-slate-100">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-6">Hoạt động gần đây</h4>
          <div className="space-y-4">
            {[
              { user: 'Nguyễn Minh Tuấn', action: 'đã phê duyệt đề xuất', target: 'Kỹ sư Backend', time: '5 phút trước' },
              { user: 'Trần Thị Mai Lan', action: 'vừa cập nhật trạng thái', target: 'Ứng viên: Lê Hoàng Phúc', time: '12 phút trước' },
              { user: 'Hệ thống', action: 'đã gửi lời mời phỏng vấn tới', target: '5 ứng viên mới', time: '1 giờ trước' },
            ].map((a, idx) => (
              <div key={idx} className="flex gap-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                  {a.user[0]}
                </div>
                <div>
                  <p className="text-[13px] leading-snug">
                    <span className="font-black text-slate-700">{a.user}</span>{' '}
                    <span className="text-slate-500">{a.action}</span>{' '}
                    <span className="font-bold text-xevn-primary">{a.target}</span>
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Department Chart */}
      <Card className="p-6 border-slate-100">
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-6">Biểu đồ tuyển dụng theo phòng ban</h4>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={BAR_DATA} 
              layout="vertical" 
              margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
              barSize={12}
            >
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 700, fill: '#64748B' }}
                width={140}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', fontSize: '11px' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {BAR_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
