import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Settings, FileJson, CheckCircle2, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { usePayPolicies, PayPolicy } from '@/hooks/usePayPolicies';
import { useGrades } from '@/hooks/useGrades';
import { toast } from 'sonner';
import { PolicyAPI } from '@/lib/api/hrm-policy-api';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import { jobTitleOptionsFromCatalog } from '@/lib/catalogSearchPicker';

const PAY_GROUPS = [
  { value: 'CHUNG', label: 'Chính sách Chung' },
  { value: 'LX_TUYEN', label: 'Lái xe Tuyến' },
  { value: 'LX_TAI', label: 'Lái xe Tải' },
  { value: 'DPHH', label: 'Điều phối HH' },
  { value: 'TONG_DAI', label: 'Tổng đài' },
  { value: 'VP_HN', label: 'VP Hà Nội' },
  { value: 'VP_TINH', label: 'VP Tỉnh' },
];

// --- SPECIALIZED COMPONENT FORMS ---

function GradeBaseForm({ params }: { params: any }) {
  const { grades, isLoading } = useGrades();
  const [selectedGradeId, setSelectedGradeId] = useState(params.grade_id || '');

  const selectedGrade = grades.find(g => g.id === selectedGradeId);

  return (
    <div className="space-y-4 p-4 border rounded-md bg-slate-50">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Ngạch Lương Áp Dụng (Master Data)</Label>
          <Select value={selectedGradeId} onValueChange={setSelectedGradeId}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder={isLoading ? "Đang tải danh mục ngạch..." : "Chọn ngạch áp dụng"} />
            </SelectTrigger>
            <SelectContent>
              {grades.map(g => (
                <SelectItem key={g.id} value={g.id}>{g.grade_code} - {g.grade_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Yêu cầu KPI tối thiểu nâng bậc (%)</Label>
          <Input type="number" defaultValue={params.min_kpi_for_promotion || 80} className="bg-white" />
        </div>
      </div>
      
      {selectedGrade && (
        <div className="mt-4 p-3 bg-white border rounded-md shadow-sm">
          <Label className="text-sm font-semibold text-slate-700 mb-2 block">Chi tiết Bậc Lương (Preview)</Label>
          <div className="flex flex-wrap gap-2">
            {selectedGrade.steps.map(step => (
              <Badge key={step.step_number} variant="secondary" className="px-3 py-1 font-mono bg-blue-50 text-blue-700 hover:bg-blue-100">
                Bậc {step.step_number}: {step.salary_vnd.toLocaleString()} đ
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="text-sm text-slate-500 italic mt-2">
        * Bảng lương chi tiết được cấu hình tập trung trong module "Danh mục Ngạch Bậc" (Master Data). Policy Engine sẽ tự động tham chiếu dữ liệu này khi quét chạy lương.
      </div>
    </div>
  );
}

function TieredTableForm({ params, title }: { params: any; title?: string }) {
  const tiers = Array.isArray(params.tiers) ? params.tiers : 
                (params.miss_rate_tiers ? params.miss_rate_tiers : []);
  const columns = tiers.length > 0 ? Object.keys(tiers[0]) : ['min', 'max', 'value'];

  return (
    <div className="space-y-2 border rounded-md p-3 bg-slate-50">
      <Label className="font-semibold text-slate-700">{title || 'Bảng Bậc Thang (Tiered Table)'}</Label>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border text-sm bg-white">
          <thead>
            <tr className="bg-slate-100">
              {columns.map(col => (
                <th key={col} className="border p-2 text-left capitalize">{col.replace(/_/g, ' ')}</th>
              ))}
              <th className="border p-2 w-12 text-center">Xóa</th>
            </tr>
          </thead>
          <tbody>
            {tiers.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="border p-4 text-center text-slate-400">Chưa có dữ liệu</td>
              </tr>
            ) : (
              tiers.map((row: any, rIdx: number) => (
                <tr key={rIdx}>
                  {columns.map(col => (
                    <td key={col} className="border p-1">
                      <Input defaultValue={String(row[col])} className="h-8 shadow-none rounded-sm border-transparent hover:border-slate-300 focus:border-blue-500" />
                    </td>
                  ))}
                  <td className="border p-1 text-center">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50"><Trash2 className="w-3 h-3"/></Button>
                  </td>
                </tr>
              ))
            )}
            <tr>
              <td colSpan={columns.length + 1} className="border p-2 text-center bg-slate-50">
                <Button variant="ghost" size="sm" className="text-blue-600 h-8"><Plus className="w-4 h-4 mr-1"/> Thêm bậc mới</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ZeroSumPoolForm({ params }: { params: any }) {
  return (
    <div className="space-y-4 p-4 border rounded-md bg-slate-50">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Ngân sách Quỹ (Pool Amount - VNĐ)</Label>
          <Input type="number" defaultValue={params.pool_amount || params.pool_per_month_vnd || 0} className="bg-white" />
        </div>
        <div className="space-y-1">
          <Label>Số ngày công chuẩn / Tháng</Label>
          <Input type="number" defaultValue={params.standard_days_off ? 30 - params.standard_days_off : 26} className="bg-white" />
        </div>
      </div>
      <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-md border border-blue-200 mt-2">
        <strong>Cơ chế chia Quỹ:</strong> Hệ thống sẽ tự động tính (Tổng Quỹ / Tổng điểm toàn VP) × Điểm cá nhân.
      </div>
    </div>
  );
}

function GenericForm({ params }: { params: any }) {
  if (!params || Object.keys(params).length === 0) {
    return <div className="text-sm text-gray-500 italic p-4 bg-slate-50 rounded-md">Không có tham số cấu hình riêng biệt. Sử dụng dữ liệu mặc định từ hệ thống HR.</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-slate-50">
      {Object.entries(params).map(([key, val]) => (
        <div key={key} className="space-y-1">
          <Label className="capitalize">{key.replace(/_/g, ' ')}</Label>
          <Input defaultValue={typeof val === 'object' ? JSON.stringify(val) : String(val)} className="bg-white" />
        </div>
      ))}
    </div>
  );
}

// STRATEGY RENDERER
function ComponentRenderer({ comp }: { comp: any }) {
  if (comp.component_type === 'grade_base') {
    return <GradeBaseForm params={comp.params} />;
  }
  if (comp.component_type.includes('tiered') || comp.component_type.includes('multiplier') || (comp.params && Array.isArray(comp.params.tiers))) {
    return <TieredTableForm params={comp.params} title={comp.component_type.includes('multiplier') ? 'Bảng Hệ số' : 'Bảng Bậc thang (Tiers)'} />;
  }
  if (comp.component_type.includes('pool')) {
    return <ZeroSumPoolForm params={comp.params} />;
  }
  
  // Xử lý các params chứa mảng nhưng không phải là `tiers` (Ví dụ locations array)
  const hasArrayParam = Object.values(comp.params || {}).some(val => Array.isArray(val) && val.length > 0 && typeof val[0] === 'object');
  if (hasArrayParam) {
    const arrayKey = Object.keys(comp.params).find(k => Array.isArray(comp.params[k]));
    const arrayData = comp.params[arrayKey!];
    return (
      <div className="space-y-4">
        <GenericForm params={Object.fromEntries(Object.entries(comp.params).filter(([k]) => k !== arrayKey))} />
        <TieredTableForm params={{ tiers: arrayData }} title={`Danh sách: ${arrayKey}`} />
      </div>
    );
  }

  return <GenericForm params={comp.params} />;
}

// --- MAIN PAGE ---

export function PolicyEngineConfig() {
  const { t } = useTranslation();
  const { policies, isLoading, createPolicy, addComponent } = usePayPolicies();
  
  const [activeTab, setActiveTab] = useState<string>('CHUNG');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

  const groupPolicies = policies.filter((p) => p.pay_group_code === activeTab);
  const selectedPolicy = policies.find(p => p.id === selectedPolicyId) || null;

  const { catalogs, isLoading: catalogsLoading } = useSettingsCatalogsOverview();
  const positionOptions = jobTitleOptionsFromCatalog(catalogs);

  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [assignmentEffectiveDate, setAssignmentEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setSelectedPolicyId(null);
  };

  const handleCreatePolicy = () => {
    createPolicy.mutate({
      name: `Chính sách ${PAY_GROUPS.find(g => g.value === activeTab)?.label} Mới`,
      pay_group_code: activeTab,
      effective_from: new Date().toISOString().split('T')[0]
    });
  };

  const handleAddComponent = () => {
    if (!selectedPolicy) return;
    addComponent.mutate({
      policyId: selectedPolicy.id,
      component: {
        component_type: 'grade_base', // Default type, user can change later in real app
        name: 'Thành phần thu nhập mới',
        sort_order: 99,
        is_deduction: false,
        input_source: 'manual',
        params: {}
      }
    });
  };

  const handleAssignPolicy = async () => {
    if (!selectedPolicy) return;
    if (selectedPositions.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 vị trí');
      return;
    }
    try {
      setIsAssigning(true);
      await PolicyAPI.assignToTarget(selectedPolicy.id, {
        target_type: 'position',
        target_ids: selectedPositions,
        effective_from: assignmentEffectiveDate
      });
      toast.success('Đã áp dụng chính sách thành công!');
      setAssignmentModalOpen(false);
      setSelectedPositions([]);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi gán chính sách');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* 1. Sub-navigation cho 7 Nhóm Chính sách */}
      <div className="border-b">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start h-auto flex-wrap bg-transparent gap-2 p-0">
            {PAY_GROUPS.map((g) => (
              <TabsTrigger 
                key={g.value} 
                value={g.value}
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 border border-transparent px-4 py-2 rounded-t-lg rounded-b-none"
              >
                {g.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 2. Body Split View */}
      <div className="flex flex-1 overflow-hidden space-x-4">
        {/* LEFT: Policy Versions List */}
        <div className="w-1/3 flex flex-col h-full border rounded-lg bg-white shadow-sm overflow-hidden">
          <div className="p-3 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Các Phiên bản (Policies)</h3>
            <Button size="sm" variant="outline" onClick={handleCreatePolicy} disabled={createPolicy.isPending} className="h-8">
              <Plus className="w-4 h-4 mr-1" /> Tạo mới
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading ? (
              <div className="text-center py-10 text-slate-400">Đang tải...</div>
            ) : groupPolicies.length === 0 ? (
              <div className="text-center py-10 text-slate-400">Chưa có chính sách nào.</div>
            ) : (
              groupPolicies.map((policy) => (
                <div
                  key={policy.id}
                  className={`p-3 rounded-md border cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all ${
                    selectedPolicy?.id === policy.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'bg-white'
                  }`}
                  onClick={() => setSelectedPolicyId(policy.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm text-slate-800 leading-tight">{policy.name}</span>
                    <Badge variant={policy.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-[10px]">
                      {policy.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-end text-xs text-slate-500">
                    <div>
                      <div>Hiệu lực: {policy.effective_from} {policy.effective_to ? `- ${policy.effective_to}` : ''}</div>
                      <div className="mt-1 font-medium text-slate-600">{(policy.components || []).length} thành phần</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Policy Detail & Components */}
        <div className="w-2/3 flex flex-col h-full border rounded-lg bg-white shadow-sm overflow-hidden">
          {selectedPolicy ? (
            <>
              {/* Policy Header */}
              <div className="p-4 border-b bg-slate-50 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedPolicy.name}</h2>
                  <div className="flex items-center space-x-3 mt-2 text-sm text-slate-500">
                    <span>Mã nhóm: <strong>{selectedPolicy.pay_group_code}</strong></span>
                    <span>•</span>
                    <span>Phiên bản: <strong>v{selectedPolicy.version}</strong></span>
                    <span>•</span>
                    <span>Hiệu lực từ: <strong>{selectedPolicy.effective_from}</strong></span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => setAssignmentModalOpen(true)}>
                    <CheckCircle2 className="w-4 h-4 mr-2"/> Áp dụng cho Vị trí
                  </Button>
                  <Button variant="outline" size="sm" className="h-8"><Copy className="w-3 h-3 mr-2"/> Nhân bản</Button>
                  <Button variant="default" size="sm" className="h-8"><CheckCircle2 className="w-4 h-4 mr-2"/> Lưu Cấu Hình</Button>
                </div>
              </div>

              {/* Components List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h3 className="font-semibold text-lg text-slate-800">Danh sách Thành phần Thu nhập</h3>
                  <Button size="sm" variant="secondary" onClick={handleAddComponent} disabled={addComponent.isPending}>
                    <Plus className="w-4 h-4 mr-1" /> Thêm thành phần
                  </Button>
                </div>

                {(selectedPolicy.components || []).length === 0 ? (
                  <div className="text-center py-16 text-slate-400 border-2 border-dashed rounded-lg bg-slate-50">
                    <p className="mb-2">Phiên bản chính sách này chưa có thành phần thu nhập nào.</p>
                    <Button variant="outline" size="sm" onClick={handleAddComponent}>Thêm thành phần đầu tiên</Button>
                  </div>
                ) : (
                  selectedPolicy.components.map((comp) => (
                    <div key={comp.id} className="border rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                      {/* Component Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Settings className="w-5 h-5 text-slate-400" />
                            <h4 className="font-bold text-lg text-slate-800">{comp.name}</h4>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="bg-slate-50 font-mono text-xs">{comp.component_type}</Badge>
                            {comp.is_deduction && <Badge variant="destructive" className="text-xs">Loại: Giảm trừ (Deduction)</Badge>}
                            <Badge variant="secondary" className="text-xs">Nguồn: {comp.input_source}</Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                      </div>

                      {/* Component Form Body */}
                      <div className="mt-4">
                        <ComponentRenderer comp={comp} />
                      </div>

                      {/* Raw JSON Debug */}
                      <details className="mt-4 pt-4 border-t border-dashed">
                        <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 flex items-center select-none">
                          <FileJson className="w-3 h-3 mr-1" /> Xem cấu trúc kỹ thuật (Technical Spec)
                        </summary>
                        <div className="mt-3">
                          <Textarea 
                            className="font-mono text-xs h-32 bg-slate-900 text-green-400 border-none" 
                            defaultValue={JSON.stringify(comp, null, 2)}
                            readOnly
                          />
                        </div>
                      </details>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-8 text-center">
              <Settings className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="text-lg font-medium text-slate-500 mb-1">Chưa chọn Phiên bản Chính sách</h3>
              <p className="text-sm">Vui lòng chọn một phiên bản từ danh sách bên trái để cấu hình, hoặc tạo phiên bản mới.</p>
            </div>
          )}
        </div>
      </div>

      {/* ASSIGNMENT MODAL */}
      <Dialog open={assignmentModalOpen} onOpenChange={setAssignmentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Áp dụng Chính sách cho Vị trí</DialogTitle>
            <DialogDescription>
              Gán chính sách <strong>{selectedPolicy?.name}</strong> cho các vị trí chức danh.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ngày hiệu lực</Label>
              <Input type="date" value={assignmentEffectiveDate} onChange={e => setAssignmentEffectiveDate(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label>Thêm Vị trí (Chức danh)</Label>
              <Select onValueChange={(val) => {
                if (!selectedPositions.includes(val)) {
                  setSelectedPositions([...selectedPositions, val]);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder={catalogsLoading ? "Đang tải danh mục..." : "Chọn vị trí..."} />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label} ({opt.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPositions.length > 0 && (
              <div className="mt-2 p-3 bg-slate-50 border rounded-md">
                <Label className="text-xs text-slate-500 mb-2 block">Các vị trí đã chọn:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedPositions.map(pos => {
                    const label = positionOptions.find(p => p.value === pos)?.label || pos;
                    return (
                      <Badge key={pos} variant="secondary" className="flex items-center gap-1 bg-blue-50 text-blue-700">
                        {label}
                        <Trash2 
                          className="w-3 h-3 cursor-pointer hover:text-red-500" 
                          onClick={() => setSelectedPositions(selectedPositions.filter(p => p !== pos))}
                        />
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignmentModalOpen(false)}>Hủy</Button>
            <Button disabled={isAssigning} onClick={handleAssignPolicy} className="bg-blue-600 text-white hover:bg-blue-700">
              {isAssigning ? 'Đang gán...' : 'Xác nhận Gán'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
