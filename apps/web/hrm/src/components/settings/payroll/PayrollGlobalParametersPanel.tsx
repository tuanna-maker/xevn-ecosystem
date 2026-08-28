import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function PayrollGlobalParametersPanel() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  
  // State for mock settings form
  const [params, setParams] = useState({
    // VP Hà Nội
    vp_hn_salary_mode: 'grade_base',
    
    // Tạm ứng
    max_advance_salary_pct: 50,
    
    // Thưởng LX tải
    freight_revenue_tier1: 100000000,
    freight_revenue_tier2: 150000000,
    
    // Quỹ thưởng (Pool)
    pool_1500_vs_1731_logic: 'shared_weight',
    
    // Quyền nhập liệu
    freight_penalty_dept: 'fleet',
    
    // Thưởng chuyên cần
    attendance_bonus_expiry: '2026-12-31',
  });

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Lưu cấu hình tham số lương thành công');
    }, 800);
  };

  const updateParam = (key: keyof typeof params, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-xevn-text">Tham số lương (Global)</h2>
          <p className="text-sm text-xevn-textSecondary">
            Quản lý các biến số chung dùng trong Engine Tính Lương (Tỷ lệ tạm ứng, quỹ thưởng, cơ chế đặc thù).
          </p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="gap-2 bg-xevn-primary">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Lưu thay đổi
        </Button>
      </div>

      <Tabs defaultValue="limits" className="w-full">
        <TabsList className="bg-slate-100 border border-slate-200">
          <TabsTrigger value="limits">Hạn mức & Tỷ lệ</TabsTrigger>
          <TabsTrigger value="revenue">Mốc Doanh thu & Thưởng</TabsTrigger>
          <TabsTrigger value="pools">Quỹ thưởng (Pools)</TabsTrigger>
          <TabsTrigger value="rules">Quy tắc Đặc thù</TabsTrigger>
        </TabsList>

        <TabsContent value="limits" className="mt-6">
          <Card className="border-xevn-border shadow-sm">
            <CardHeader className="pb-4 border-b bg-slate-50/50">
              <CardTitle className="text-base">Hạn mức Tạm ứng & Thưởng</CardTitle>
              <CardDescription>Cấu hình trần (cap) cho các khoản chi trả tạm ứng và ngày hết hạn thưởng.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Tỷ lệ cho phép tạm ứng lương tối đa (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={params.max_advance_salary_pct} 
                      onChange={e => updateParam('max_advance_salary_pct', Number(e.target.value))} 
                      className="w-24"
                    />
                    <span className="text-sm text-slate-500">% lương dự kiến</span>
                  </div>
                  <p className="text-xs text-slate-500">Giới hạn trong Batch Request tạm ứng.</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Hạn áp dụng Thưởng Chuyên Cần LX Tuyến</Label>
                  <Input 
                    type="date" 
                    value={params.attendance_bonus_expiry} 
                    onChange={e => updateParam('attendance_bonus_expiry', e.target.value)}
                  />
                  <p className="text-xs text-slate-500">Mặc định ban đầu gia hạn đến 31/05/2026. Thay đổi tại đây sẽ cập nhật Engine tự động.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <Card className="border-xevn-border shadow-sm">
            <CardHeader className="pb-4 border-b bg-slate-50/50">
              <CardTitle className="text-base">Định mức Doanh thu Thưởng</CardTitle>
              <CardDescription>Cấu hình các mốc đạt doanh thu dành cho đội xe tải hoặc tuyến.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Doanh thu Mức 1 (VNĐ) - Lái xe tải</Label>
                  <Input 
                    type="number" 
                    value={params.freight_revenue_tier1} 
                    onChange={e => updateParam('freight_revenue_tier1', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Doanh thu Mức 2 (VNĐ) - Lái xe tải</Label>
                  <Input 
                    type="number" 
                    value={params.freight_revenue_tier2} 
                    onChange={e => updateParam('freight_revenue_tier2', Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="rounded-lg bg-blue-50 p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Ghi chú:</strong> Tham số này sẽ tự động thay thế logic hardcode <code>E2 component 11</code> cho thưởng doanh thu Lái xe Tải.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pools" className="mt-6">
          <Card className="border-xevn-border shadow-sm">
            <CardHeader className="pb-4 border-b bg-slate-50/50">
              <CardTitle className="text-base">Quỹ thưởng (Pool TĐ)</CardTitle>
              <CardDescription>Quy tắc tính toán và phân bổ tỷ trọng từ Pool tổng.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label>Cơ chế chia Pool TĐ 1500 vs 1731</Label>
                <Select 
                  value={params.pool_1500_vs_1731_logic} 
                  onValueChange={v => updateParam('pool_1500_vs_1731_logic', v)}
                >
                  <SelectTrigger className="w-full md:w-96">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shared_weight">Dùng chung Formula (Theo trọng số xe)</SelectItem>
                    <SelectItem value="independent">Tách biệt hoàn toàn (Independent Formula)</SelectItem>
                    <SelectItem value="equal_share">Cào bằng số lượng tài xế</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">Thay thế hardcode Q3 trong SRS cho Component 18.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="mt-6">
          <Card className="border-xevn-border shadow-sm">
            <CardHeader className="pb-4 border-b bg-slate-50/50">
              <CardTitle className="text-base">Cơ chế & Phân quyền Đặc thù</CardTitle>
              <CardDescription>Cấu hình nhóm quyền và hình thức tính lương ngoại lệ.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Hình thức lương VP Hà Nội</Label>
                  <Select 
                    value={params.vp_hn_salary_mode} 
                    onValueChange={v => updateParam('vp_hn_salary_mode', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grade_base">Lương Ngạch-Bậc chuẩn</SelectItem>
                      <SelectItem value="pool_based">Lương chia Pool dự án</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">VP Hà Nội (VP_HN) đang chạy cơ chế thử nghiệm.</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Quyền duyệt phạt CLHĐ (LX Tải)</Label>
                  <Select 
                    value={params.freight_penalty_dept} 
                    onValueChange={v => updateParam('freight_penalty_dept', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fleet">Đội xe (Fleet Dept)</SelectItem>
                      <SelectItem value="hr">Phòng Nhân sự (HR Dept)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">Ai là người sẽ nhập/duyệt bảng điểm phạt trước khi chạy Batch.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
