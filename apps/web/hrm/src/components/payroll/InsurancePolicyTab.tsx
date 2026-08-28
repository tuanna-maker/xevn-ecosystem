/**
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-UI-BRAND-W4-PAY-A
 * change_mode: UPGRADE
 * What: Precision Motion P04 insurance policy — dialog wide + title ≥20; ViMoneyInput vi-VN kept
 * Why: ADR §16 · FE-PAY P0
 * must_keep: useInsurancePolicyParticipants API; ViMoneyInput parse; no insurance rate invent
 * 
 * @CODE-MEMORY-CHANGE 2026-08-26
 * Trace: XEVN_SRS_HRM_PAYROLL_POLICY_ENGINE_v1.md
 * change_mode: UPGRADE
 * What: Thay thế luồng quản lý Participants thủ công bằng Rule Engine tự động quét theo Điều kiện.
 * Why: Đồng bộ cấu trúc XEVN_POLICY_CATALOG.md với Phụ cấp và Thuế. 
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, FileText, Plus, Settings2, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ViMoneyInput } from '@/components/ui/ViMoneyInput';
import { PolicyAPI, SettingsAPI } from '@/lib/api/hrm-policy-api';
import { RuleConditionBuilder } from './RuleConditionBuilder';
import { toast } from 'sonner';

const useMasterDataFields = () => {
  return useQuery({
    queryKey: ['master-data-fields'],
    queryFn: () => SettingsAPI.getMasterDataFields()
  });
};

export function InsurancePolicyTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  // 1. Fetch Insurance Policies from Database
  const { data: dbPolicies = [], isLoading: isLoadingPolicies } = useQuery({
    queryKey: ['pay-policies', 'INSURANCE'],
    queryFn: async () => {
      return await PolicyAPI.list({ pay_group_code: 'INSURANCE' });
    }
  });

  const { data: fieldOptions = [] } = useMasterDataFields();

  // 2. Local State for drafting/editing
  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const dbPoliciesStr = JSON.stringify(dbPolicies);

  // Sync DB to Local State when loaded
  useEffect(() => {
    if (dbPolicies.length > 0) {
      // Map DB structure to UI structure
      const mapped = dbPolicies.map(p => {
        const comp = p.components?.[0];
        const params = comp?.params || {};
        return {
          id: p.id,
          code: p.name.toUpperCase().replace(/\s/g, '_'),
          name: p.name,
          policy_type: comp?.component_type === 'insurance_statutory' ? 'statutory' : 'custom',
          status: p.status,
          effective_from: p.effective_from,
          params: params.calculation_rules || { emp_rate: 0, er_rate: 0, cap_amount: 0 },
          target_conditions: params.target_conditions || []
        };
      });
      setPolicies(mapped);
    } else {
      setPolicies(prev => prev.length === 0 ? prev : []);
      if (selectedPolicyId && !selectedPolicyId.includes('ins_new_')) {
        setSelectedPolicyId(null);
      }
    }
  }, [dbPoliciesStr]);

  const selectedPolicy = policies.find(p => p.id === selectedPolicyId);

  // --- Mutations ---
  const savePolicyMutation = useMutation({
    mutationFn: async (policyToSave: any) => {
      const isNew = policyToSave.id.startsWith('ins_new_');
      
      let policyId = policyToSave.id;
      if (isNew) {
        const res: any = await PolicyAPI.create({
          name: policyToSave.name,
          pay_group_code: 'INSURANCE',
          effective_from: policyToSave.effective_from,
          status: 'DRAFT'
        });
        policyId = res.id || res.policy_id;
      } else {
        await PolicyAPI.update(policyId, {
          name: policyToSave.name,
          effective_from: policyToSave.effective_from,
          description: `Bảo hiểm: ${policyToSave.name}`
        });
      }

      await PolicyAPI.addComponent(policyId, {
        component_type: policyToSave.policy_type === 'statutory' ? 'insurance_statutory' : 'insurance_custom',
        name: 'Luật tính Bảo hiểm',
        sort_order: 1,
        is_deduction: true,
        input_source: 'system',
        params: {
          calculation_rules: policyToSave.params,
          target_conditions: policyToSave.target_conditions
        }
      });
      
      if (isNew && policyToSave.status === 'ACTIVE') {
         await PolicyAPI.toggleStatus(policyId);
      }
      
      return policyId;
    },
    onSuccess: () => {
      toast.success('Đã lưu Cấu hình Bảo hiểm vào Database thành công!');
      queryClient.invalidateQueries({ queryKey: ['pay-policies', 'INSURANCE'] });
      setIsSheetOpen(false);
      setSelectedPolicyId(null);
    },
    onError: (err: any) => {
      toast.error(`Lỗi khi lưu DB: ${err.message}`);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      await PolicyAPI.toggleStatus(id);
    },
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái chính sách!');
      queryClient.invalidateQueries({ queryKey: ['pay-policies', 'INSURANCE'] });
    },
    onError: (err: any) => {
      toast.error(`Lỗi khi cập nhật trạng thái: ${err.message}`);
    }
  });

  const handleSaveToDB = () => {
    if (!selectedPolicy) return;
    savePolicyMutation.mutate(selectedPolicy);
  };

  const handleAddNewPolicy = () => {
    const newId = `ins_new_${Date.now()}`;
    const newPolicy = {
      id: newId,
      code: `INS_NEW_${Math.floor(Math.random() * 1000)}`,
      name: 'Chính sách Bảo hiểm mới',
      policy_type: 'statutory',
      status: 'ACTIVE',
      effective_from: new Date().toISOString().split('T')[0],
      params: {
        emp_rate: 8,
        er_rate: 17.5,
        cap_amount: 0
      },
      target_conditions: []
    };
    setPolicies([...policies, newPolicy]);
    setSelectedPolicyId(newId);
    setIsSheetOpen(true);
  };

  const handleUpdatePolicyField = (field: string, value: any) => {
    if (!selectedPolicyId) return;
    setPolicies(policies.map(p => {
      if (p.id === selectedPolicyId) {
        if (field === 'policy_type') {
          // Reset default rates on type change
          let er = 0, em = 0;
          if (value === 'statutory') { er = 8; em = 17.5; }
          return { ...p, [field]: value, params: { ...p.params, emp_rate: er, er_rate: em } };
        }
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const handleUpdateParams = (field: string, value: any) => {
    if (!selectedPolicyId) return;
    setPolicies(policies.map(p => p.id === selectedPolicyId ? { ...p, params: { ...p.params, [field]: value } } : p));
  };

  if (isLoadingPolicies) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="flex h-full flex-col bg-slate-50/50 p-6 space-x-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[20px] font-bold font-display text-xevn-text">
            Insurance Rules Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý đối tượng đóng Bảo hiểm hoàn toàn tự động bằng Điều kiện</p>
        </div>
        <Button onClick={handleAddNewPolicy} className="h-9 px-4 shadow-sm">
          <Plus className="w-4 h-4 mr-1" /> Tạo chính sách mới
        </Button>
      </div>

      <div className="bg-white rounded-md border shadow-sm overflow-hidden flex-1">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[300px]">Tên chính sách</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày áp dụng</TableHead>
              <TableHead className="text-right">Mã DB</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((policy) => (
              <TableRow 
                key={policy.id} 
                className="cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => { setSelectedPolicyId(policy.id); setIsSheetOpen(true); }}
              >
                <TableCell className="font-semibold text-slate-800">
                  {policy.name}
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-slate-600 text-xs">
                    <Settings2 className="w-3.5 h-3.5 mr-1" />
                    {policy.policy_type === 'statutory' ? 'Luật định' : 'Tuỳ chỉnh'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={policy.id.includes('ins_new_') ? 'secondary' : (policy.status === 'ACTIVE' ? 'default' : 'secondary')} className={`text-[10px] uppercase shadow-none ${policy.status === 'ACTIVE' && !policy.id.includes('ins_new_') ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                    {policy.id.includes('ins_new_') ? 'Bản nháp' : (policy.status === 'ACTIVE' ? 'Đang áp dụng' : 'Tạm ngưng')}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {policy.effective_from || '—'}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-slate-400">
                  {policy.id.substring(0, 12)}...
                </TableCell>
              </TableRow>
            ))}
            {policies.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Chưa có chính sách bảo hiểm nào. Hãy tạo mới.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* RIGHT: Policy Details Popup (Sheet) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" aria-describedby={undefined} className="w-full sm:max-w-[1400px] flex flex-col p-0 border-l shadow-2xl">
          <SheetTitle className="sr-only">Chi tiết bảo hiểm</SheetTitle>
          {selectedPolicy && (
            <>
              <SheetHeader className="p-6 border-b bg-slate-50/80">
                <div className="flex justify-between items-start w-full">
                  <div className="space-y-3 w-3/4">
                    <Input 
                      value={selectedPolicy.name} 
                      onChange={(e) => handleUpdatePolicyField('name', e.target.value)}
                      className="text-xl font-bold text-slate-800 border-slate-200 bg-white px-3 py-6 shadow-sm focus-visible:ring-1" 
                      placeholder="Nhập tên chính sách..."
                    />
                    <div className="flex items-center space-x-3 text-sm text-slate-500 px-1">
                      <div className="flex items-center space-x-2">
                        <span>Mã DB:</span>
                        <strong className="text-xs text-slate-400">{selectedPolicy.id.substring(0, 15)}...</strong>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-2">
                        <span>Ngày áp dụng:</span>
                        <Input 
                          type="date"
                          value={selectedPolicy.effective_from} 
                          onChange={(e) => handleUpdatePolicyField('effective_from', e.target.value)}
                          className="h-7 w-36 text-xs bg-white border-slate-200 px-2"
                        />
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-2">
                        <span>Loại:</span>
                        <Select value={selectedPolicy.policy_type} onValueChange={(val) => handleUpdatePolicyField('policy_type', val)}>
                          <SelectTrigger className="h-7 w-[160px] text-xs border-slate-200">
                            <SelectValue placeholder="Chọn loại BH" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="compulsory_vn">BH Bắt buộc VN</SelectItem>
                            <SelectItem value="health_premium">BHYT Cao cấp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-2">
                        <span>Trạng thái:</span>
                        <Select value={selectedPolicy.status} onValueChange={(val) => handleUpdatePolicyField('status', val)}>
                          <SelectTrigger className="h-7 w-[120px] text-xs border-slate-200">
                            <SelectValue placeholder="Trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Đang áp dụng</SelectItem>
                            <SelectItem value="INACTIVE">Tạm ngưng</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 shrink-0">
                      <Button variant="outline" className="h-9 px-6 font-semibold" onClick={() => toggleStatusMutation.mutate(selectedPolicy.id)} disabled={toggleStatusMutation.isPending}>
                        {selectedPolicy.status === 'ACTIVE' ? 'Tạm ngưng' : 'Kích hoạt'}
                      </Button>
                    <Button className="h-9 px-6 bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm" onClick={handleSaveToDB} disabled={savePolicyMutation.isPending}>
                      {savePolicyMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2"/>}
                      Lưu xuống Database
                    </Button>
                  </div>
                </div>
              </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* CỘT 1: ĐỐI TƯỢNG ÁP DỤNG */}
                <div className="space-y-6">
                  <RuleConditionBuilder 
                    conditions={selectedPolicy.target_conditions} 
                    fieldOptions={fieldOptions}
                    onChange={(newConds) => {
                      setPolicies(policies.map(p => p.id === selectedPolicyId ? { ...p, target_conditions: newConds } : p));
                    }} 
                  />
                </div>

                {/* CỘT 2: QUY TẮC TÍNH TOÁN */}
                <div className="space-y-4 lg:border-l lg:pl-8">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-lg text-slate-800">Tham số Tính toán (Calculation Logic)</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 border border-slate-200 rounded-md bg-white shadow-sm">
                    <div className="space-y-1.5">
                      <Label>Tỷ lệ Nhân viên đóng (%)</Label>
                      <Input 
                        value={selectedPolicy.params.employee_rate || ''} 
                        onChange={(e) => handleUpdateParams('employee_rate', Number(e.target.value))}
                        className="bg-white h-9 border-slate-200" type="number" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tỷ lệ Công ty đóng (%)</Label>
                      <Input 
                        value={selectedPolicy.params.employer_rate || ''} 
                        onChange={(e) => handleUpdateParams('employer_rate', Number(e.target.value))}
                        className="bg-white h-9 border-slate-200" type="number" 
                      />
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-md bg-white shadow-sm">
                    <div className="space-y-1.5">
                      <Label>Căn cứ tính phí</Label>
                      <Select value={selectedPolicy.params.base_type} onValueChange={(val) => handleUpdateParams('base_type', val)}>
                        <SelectTrigger className="w-full bg-white border-slate-200"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contract">Mức lương đóng BHXH trên Hợp đồng</SelectItem>
                          <SelectItem value="basic_salary">Lương cơ sở (Pháp định)</SelectItem>
                          <SelectItem value="fixed_amount">Mức tiền cố định</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Info banner */}
                  <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>Dựa trên Điều kiện đối tượng và Cấu hình tỷ lệ ở trên, hệ thống sẽ tự động quét và khấu trừ/tích lũy đúng số tiền BHXH cho từng đợt lương. KHÔNG CẦN CHỌN TAY TỪNG NHÂN VIÊN.</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
