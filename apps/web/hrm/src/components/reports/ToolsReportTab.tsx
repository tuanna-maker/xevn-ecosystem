import { useToolsEquipment } from '@/hooks/useToolsEquipment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, Wrench, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function ToolsReportTab() {
  const { tools, assignments, isLoading } = useToolsEquipment();

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const totalQty = tools.reduce((s, t) => s + t.quantity, 0);
  const totalValue = tools.reduce((s, t) => s + t.purchase_price * t.quantity, 0);
  const inUse = tools.filter(t => t.status === 'in_use').length;
  const maintenance = tools.filter(t => t.status === 'maintenance').length;

  // By status
  const statusData = [
    { name: 'Sẵn sàng', value: tools.filter(t => t.status === 'available').length },
    { name: 'Đang dùng', value: inUse },
    { name: 'Bảo trì', value: maintenance },
    { name: 'Thanh lý', value: tools.filter(t => t.status === 'disposed').length },
  ].filter(d => d.value > 0);

  // By category
  const catCount: Record<string, number> = {};
  tools.forEach(t => { const c = t.category || 'Khác'; catCount[c] = (catCount[c] || 0) + t.quantity; });
  const categoryData = Object.entries(catCount).map(([name, value]) => ({ name: name === 'tool' ? 'Công cụ' : name === 'equipment' ? 'Thiết bị' : name === 'device' ? 'Máy móc' : name === 'furniture' ? 'Nội thất' : name, value }));

  // By condition
  const condData = [
    { name: 'Tốt', value: tools.filter(t => t.condition === 'good').length },
    { name: 'Trung bình', value: tools.filter(t => t.condition === 'fair').length },
    { name: 'Kém', value: tools.filter(t => t.condition === 'poor').length },
    { name: 'Hư hỏng', value: tools.filter(t => t.condition === 'damaged').length },
  ].filter(d => d.value > 0);

  // Assignment stats
  const assignCount = assignments.filter(a => a.assignment_type === 'assign').length;
  const returnCount = assignments.filter(a => a.assignment_type === 'return').length;

  // Top items by value
  const topValue = [...tools].sort((a, b) => b.purchase_price * b.quantity - a.purchase_price * a.quantity).slice(0, 5).map(t => ({
    name: t.name.length > 20 ? t.name.substring(0, 20) + '...' : t.name,
    value: t.purchase_price * t.quantity,
  }));

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center">
          <Package className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">{tools.length}</p>
          <p className="text-xs text-muted-foreground">Loại CCDC</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xl font-bold">{totalQty}</p>
          <p className="text-xs text-muted-foreground">Tổng số lượng</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xl font-bold">{totalValue.toLocaleString()}đ</p>
          <p className="text-xs text-muted-foreground">Tổng giá trị</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xl font-bold">{assignCount}/{returnCount}</p>
          <p className="text-xs text-muted-foreground">Cấp phát / Thu hồi</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Pie */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Phân bổ theo trạng thái</CardTitle></CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Bar */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Số lượng theo loại</CardTitle></CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Số lượng" fill={COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Condition Pie */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Tình trạng CCDC</CardTitle></CardHeader>
          <CardContent>
            {condData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={condData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {condData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Value */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top CCDC theo giá trị</CardTitle></CardHeader>
          <CardContent>
            {topValue.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topValue} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString()}đ`} />
                  <Bar dataKey="value" name="Giá trị" fill={COLORS[1]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
