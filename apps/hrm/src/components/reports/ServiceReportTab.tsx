import { useServiceRequests } from '@/hooks/useServiceRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, UtensilsCrossed, Car, Package, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function ServiceReportTab() {
  const { data: requests = [], isLoading } = useServiceRequests();

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const meals = requests.filter(r => r.service_type === 'meal');
  const vehicles = requests.filter(r => r.service_type === 'vehicle');
  const supplies = requests.filter(r => r.service_type === 'supply');

  const byType = [
    { name: 'Báo cơm', value: meals.length },
    { name: 'Đặt xe', value: vehicles.length },
    { name: 'VPP', value: supplies.length },
  ];

  const statusData = ['pending', 'approved', 'rejected', 'completed'].map(s => ({
    name: s === 'pending' ? 'Chờ duyệt' : s === 'approved' ? 'Đã duyệt' : s === 'rejected' ? 'Từ chối' : 'Hoàn thành',
    'Báo cơm': meals.filter(r => r.status === s).length,
    'Đặt xe': vehicles.filter(r => r.status === s).length,
    'VPP': supplies.filter(r => r.status === s).length,
  }));

  // Monthly trend
  const monthlyData: Record<string, { meal: number; vehicle: number; supply: number }> = {};
  requests.forEach(r => {
    const month = r.created_at.substring(0, 7);
    if (!monthlyData[month]) monthlyData[month] = { meal: 0, vehicle: 0, supply: 0 };
    if (r.service_type === 'meal') monthlyData[month].meal++;
    else if (r.service_type === 'vehicle') monthlyData[month].vehicle++;
    else monthlyData[month].supply++;
  });
  const trend = Object.entries(monthlyData).sort().slice(-6).map(([m, v]) => ({ month: m.substring(5), ...v }));

  // Top departments
  const deptCount: Record<string, number> = {};
  requests.forEach(r => { if (r.department) deptCount[r.department] = (deptCount[r.department] || 0) + 1; });
  const topDepts = Object.entries(deptCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{requests.length}</p>
          <p className="text-xs text-muted-foreground">Tổng yêu cầu</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <UtensilsCrossed className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">{meals.length}</p>
          <p className="text-xs text-muted-foreground">Báo cơm</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Car className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">{vehicles.length}</p>
          <p className="text-xs text-muted-foreground">Đặt xe</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Package className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">{supplies.length}</p>
          <p className="text-xs text-muted-foreground">VPP</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Type Pie */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Phân bổ theo loại dịch vụ</CardTitle></CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={byType} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status Bar */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Trạng thái theo loại dịch vụ</CardTitle></CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Báo cơm" fill={COLORS[0]} />
                  <Bar dataKey="Đặt xe" fill={COLORS[1]} />
                  <Bar dataKey="VPP" fill={COLORS[2]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Xu hướng theo tháng</CardTitle></CardHeader>
          <CardContent>
            {trend.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="meal" name="Báo cơm" fill={COLORS[0]} />
                  <Bar dataKey="vehicle" name="Đặt xe" fill={COLORS[1]} />
                  <Bar dataKey="supply" name="VPP" fill={COLORS[2]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Departments */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top phòng ban sử dụng dịch vụ</CardTitle></CardHeader>
          <CardContent>
            {topDepts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topDepts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="value" name="Số yêu cầu" fill={COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
