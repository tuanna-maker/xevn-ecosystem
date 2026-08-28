/**
 * @CODE-MEMORY
 * Screen:     HRM · Lương · Tạo Chính sách (G5)
 * UC:         UC-G5-01..05 (Wizard 4 bước: Header→Scope→Components→Review)
 * SRS:        SRS_G5_POLICY_BUILDER_v1.md
 * Route:      /payroll-policies/create | /payroll-policies/:id/edit
 * WorkItem:   G5-POLICY-BUILDER-FE-01
 * Coded:      2026-08-27
 * must_keep:  BR-G5-01 ACTIVE clone before edit; BR-G5-02 DRAFT save; BR-G5-03 publish confirm
 */
import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Save, Rocket, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { listPayPolicyGroups, type PayPolicyGroupRecord } from '@/integrations/hrmApi';
import { PolicyAPI } from '@/lib/api/hrm-policy-api';
import { toErrorMessage } from '@/lib/apiError';
import { useEffect } from 'react';
import { GradeListSettingsPanel } from '@/components/settings/payroll/GradeListSettingsPanel';
import { StepListSettingsPanel } from '@/components/settings/payroll/StepListSettingsPanel';

// ─── Types ─────────────────────────────────────────────────────────────────
type Step1State = {
  name: string;
  group_id: string;
  description: string;
  effective_from: string;
  effective_to: string;
};
type Step2State = {
  pay_group: string;
  provinces: string[];
  vehicle_types: string[];
  shifts: string[];
};
type ComponentRow = {
  id: string;
  component_type: string;
  name: string;
  params: Record<string, unknown>;
};

const STEPS = [
  { id: 1, label: 'Thông tin' },
  { id: 2, label: 'Phạm vi' },
  { id: 3, label: 'Thành phần' },
  { id: 4, label: 'Xem lại' },
];

const PAY_GROUPS = ['LX_TUYEN', 'LX_TAI', 'DPHH', 'TONG_DAI', 'HANH_CHINH'];
const COMPONENT_TYPES = [
  'grade_base', 'grade_allowance', 'fixed_base_salary',
  'kpi_bonus_pct', 'trip_rate_tiered', 'revenue_commission_tiered',
  'kpi_pool_share', 'attendance_bonus_conditional', 'meal_allowance_conditional',
  'insurance_deduction', 'penalty_deduction',
];

// ─── PolicyBuilderPage ────────────────────────────────────────────────────────
export function PolicyBuilderPage({ onBack }: { onBack?: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [groups, setGroups] = useState<PayPolicyGroupRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [publishConfirm, setPublishConfirm] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const [step1, setStep1] = useState<Step1State>({
    name: '', group_id: '', description: '', effective_from: '', effective_to: '',
  });
  const [step2, setStep2] = useState<Step2State>({
    pay_group: '', provinces: [], vehicle_types: [], shifts: [],
  });
  const [components, setComponents] = useState<ComponentRow[]>([]);

  useEffect(() => {
    listPayPolicyGroups().then(r => setGroups(Array.isArray(r) ? r : (r as any).data ?? [])).catch(() => {});
  }, []);

  // ─── Validation ────────────────────────────────────────────────────────
  const validateStep1 = () => {
    if (!step1.name.trim()) { toast.error('Vui lòng nhập tên chính sách'); return false; }
    if (!step1.group_id) { toast.error('Vui lòng chọn nhóm chính sách'); return false; }
    if (!step1.effective_from) { toast.error('Vui lòng chọn ngày hiệu lực'); return false; }
    return true;
  };
  const validateStep2 = () => {
    if (!step2.pay_group) { toast.error('Vui lòng chọn nhóm đối tượng'); return false; }
    return true;
  };

  const goNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(s => Math.min(4, s + 1));
  };
  const goPrev = () => setCurrentStep(s => Math.max(1, s - 1));

  // ─── Save draft ─────────────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!validateStep1()) return;
    setSaving(true);
    try {
      const payload = {
        name: step1.name,
        policy_group_id: step1.group_id,
        description: step1.description,
        effective_from: step1.effective_from || undefined,
        effective_to: step1.effective_to || undefined,
        pay_group_code: step2.pay_group || undefined,
        status: 'DRAFT',
        components: components.map(c => ({ component_type: c.component_type, name: c.name, params: c.params })),
      };
      if (draftId) {
        await PolicyAPI.update(draftId, payload);
      } else {
        const res = await PolicyAPI.create(payload);
        setDraftId((res as any).id ?? null);
      }
      toast.success('Lưu bản nháp thành công');
    } catch (e) {
      toast.error(toErrorMessage(e) || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  // ─── Publish ─────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!validateStep1() || !validateStep2()) { setPublishConfirm(false); return; }
    setSaving(true);
    try {
      const payload = {
        name: step1.name,
        policy_group_id: step1.group_id,
        description: step1.description,
        effective_from: step1.effective_from || undefined,
        pay_group_code: step2.pay_group || undefined,
        status: 'ACTIVE',
        components: components.map(c => ({ component_type: c.component_type, name: c.name, params: c.params })),
      };
      const res = draftId
        ? await PolicyAPI.update(draftId, payload)
        : await PolicyAPI.create(payload);
      toast.success('Kích hoạt chính sách thành công!');
      setPublishConfirm(false);
      onBack?.();
    } catch (e) {
      toast.error(toErrorMessage(e) || 'Kích hoạt thất bại');
    } finally {
      setSaving(false);
    }
  };

  const addComponent = () => {
    setComponents(prev => [...prev, {
      id: Date.now().toString(),
      component_type: COMPONENT_TYPES[0],
      name: '',
      params: {},
    }]);
  };
  const removeComponent = (id: string) => setComponents(prev => prev.filter(c => c.id !== id));
  const updateComponent = (id: string, field: keyof ComponentRow, val: unknown) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c));
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-center flex-1">
            <button
              onClick={() => { if (step.id < currentStep) setCurrentStep(step.id); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStep === step.id ? 'bg-blue-600 text-white' :
                step.id < currentStep ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200' :
                'text-gray-400 cursor-default'
              }`}
            >
              {step.id < currentStep ? <Check className="w-4 h-4" /> : <span>{step.id}</span>}
              {step.label}
            </button>
            {idx < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white border rounded-xl p-6 space-y-5">
        {/* Step 1 */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Bước 1: Thông tin chính sách</h3>
            <div>
              <Label>Tên chính sách *</Label>
              <Input value={step1.name} onChange={e => setStep1(s => ({ ...s, name: e.target.value }))}
                placeholder="VD: Lương tài xế tuyến 2026" className="mt-1" data-testid="policy-name" />
            </div>
            <div>
              <Label>Nhóm chính sách *</Label>
              <Select value={step1.group_id} onValueChange={v => setStep1(s => ({ ...s, group_id: v }))}>
                <SelectTrigger className="mt-1" data-testid="policy-group">
                  <SelectValue placeholder="Chọn nhóm..." />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.icon} {g.name_vi}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hiệu lực từ *</Label>
                <Input type="date" value={step1.effective_from} onChange={e => setStep1(s => ({ ...s, effective_from: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>Hiệu lực đến</Label>
                <Input type="date" value={step1.effective_to} onChange={e => setStep1(s => ({ ...s, effective_to: e.target.value }))} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea value={step1.description} onChange={e => setStep1(s => ({ ...s, description: e.target.value }))}
                placeholder="Mô tả chính sách (tùy chọn)" rows={2} className="mt-1 resize-none" />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Bước 2: Phạm vi áp dụng</h3>
            <div>
              <Label>Nhóm đối tượng *</Label>
              <Select value={step2.pay_group} onValueChange={v => setStep2(s => ({ ...s, pay_group: v }))}>
                <SelectTrigger className="mt-1" data-testid="policy-pay-group">
                  <SelectValue placeholder="Chọn nhóm đối tượng..." />
                </SelectTrigger>
                <SelectContent>
                  {PAY_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Phạm vi tỉnh</Label>
              <p className="text-xs text-gray-400 mt-0.5">Không chọn = áp dụng Toàn quốc</p>
              <Input value={step2.provinces.join(', ')}
                onChange={e => setStep2(s => ({ ...s, provinces: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }))}
                placeholder="VD: Hà Nội, Hải Phòng (nhập cách nhau bởi dấu phẩy)"
                className="mt-1" />
            </div>
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Bước 3: Thành phần tính lương</h3>
              <Button size="sm" onClick={addComponent} className="gap-1.5">
                <Plus className="w-4 h-4" /> Thêm thành phần
              </Button>
            </div>
            {components.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg">
                <p>Chưa có thành phần nào</p>
                <p className="text-sm mt-1">Nhấn "+ Thêm thành phần" để bắt đầu</p>
              </div>
            ) : (
              <div className="space-y-3">
                {components.map((comp, idx) => (
                  <div key={comp.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">#{idx + 1}</span>
                      <button onClick={() => removeComponent(comp.id)} className="text-gray-300 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Loại thành phần</Label>
                        <Select value={comp.component_type} onValueChange={v => updateComponent(comp.id, 'component_type', v)}>
                          <SelectTrigger className="mt-1 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COMPONENT_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Tên hiển thị</Label>
                        <Input value={comp.name} onChange={e => updateComponent(comp.id, 'name', e.target.value)}
                          placeholder="VD: Lương cơ bản" className="mt-1 h-8 text-xs" />
                      </div>
                    </div>
                    {comp.component_type === 'fixed_base_salary' && (
                      <div>
                        <Label className="text-xs">Mức tiền cố định (₫)</Label>
                        <Input type="number" min={0}
                          value={(comp.params as any).amount ?? ''}
                          onChange={e => updateComponent(comp.id, 'params', { ...comp.params, amount: parseFloat(e.target.value) })}
                          className="mt-1 h-8 text-xs" placeholder="VD: 5000000" />
                      </div>
                    )}
                    {comp.component_type === 'grade_base' && (
                      <div className="col-span-2 pt-3 border-t mt-3">
                        <div className="mb-4">
                          <Label className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
                            <span>🏛️</span> Cấu hình danh mục Ngạch / Bậc (Áp dụng chung)
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">Quản lý trực tiếp các ngạch và bậc lương sẽ được áp dụng cho thành phần này.</p>
                        </div>
                        <div className="bg-slate-50/50 p-4 rounded-xl border space-y-6">
                          <div>
                            <h4 className="text-sm font-medium mb-3 text-slate-700">1. Danh mục Ngạch lương</h4>
                            <GradeListSettingsPanel />
                          </div>
                          <div className="border-t border-slate-200"></div>
                          <div>
                            <h4 className="text-sm font-medium mb-3 text-slate-700">2. Danh mục Bậc lương</h4>
                            <StepListSettingsPanel />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4 */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Bước 4: Xem lại & Kích hoạt</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="font-medium text-gray-700">📋 Thông tin chính sách</p>
                <p><span className="text-gray-500">Tên:</span> <span className="font-medium">{step1.name || '—'}</span></p>
                <p><span className="text-gray-500">Nhóm:</span> <span className="font-medium">{groups.find(g => g.id === step1.group_id)?.name_vi || '—'}</span></p>
                <p><span className="text-gray-500">Hiệu lực:</span> <span>{step1.effective_from || '—'}{step1.effective_to ? ` → ${step1.effective_to}` : ''}</span></p>
                {step1.description && <p><span className="text-gray-500">Mô tả:</span> <span>{step1.description}</span></p>}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="font-medium text-gray-700">🎯 Phạm vi</p>
                <p><span className="text-gray-500">Nhóm đối tượng:</span> <span className="font-mono font-medium">{step2.pay_group || '—'}</span></p>
                <p><span className="text-gray-500">Tỉnh:</span> <span>{step2.provinces.length > 0 ? step2.provinces.join(', ') : 'Toàn quốc'}</span></p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="font-medium text-gray-700">⚙️ Thành phần ({components.length})</p>
                {components.length === 0 ? <p className="text-gray-400">Chưa có thành phần</p> : (
                  components.map((c, i) => (
                    <p key={c.id}>{i + 1}. <span className="font-mono text-xs">{c.component_type}</span>{c.name ? ` — ${c.name}` : ''}</p>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={currentStep === 1 ? onBack : goPrev} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          {currentStep === 1 ? 'Quay lại' : 'Bước trước'}
        </Button>
        <div className="flex gap-2">
          {currentStep >= 1 && (
            <Button variant="outline" onClick={handleSaveDraft} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu nháp
            </Button>
          )}
          {currentStep < 4 ? (
            <Button onClick={goNext} className="gap-2">
              Tiếp theo <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={() => setPublishConfirm(true)} disabled={saving} className="gap-2 bg-green-600 hover:bg-green-700">
              <Rocket className="w-4 h-4" /> Kích hoạt ngay
            </Button>
          )}
        </div>
      </div>

      {/* Publish confirm */}
      <Dialog open={publishConfirm} onOpenChange={setPublishConfirm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Xác nhận kích hoạt chính sách?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">Chính sách <span className="font-semibold">"{step1.name}"</span> sẽ được kích hoạt với trạng thái ACTIVE. Hành động này không thể hoàn tác (chỉ có thể archive).</p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="ghost" onClick={() => setPublishConfirm(false)} disabled={saving}>Hủy</Button>
            <Button onClick={handlePublish} disabled={saving} className="gap-2 bg-green-600 hover:bg-green-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              Kích hoạt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PolicyBuilderPage;