/**
 * @CODE-MEMORY-CHANGE 2026-08-26
 * Module/Screen: HRM · Tiền lương · Chính sách Thuế (Rules Engine)
 * Trace: XEVN_SRS_HRM_PAYROLL_POLICY_ENGINE_v1.md
 * WorkItem: PO-HRM-PAY-TAX-FE-02
 * change_mode: UPGRADE
 * What: Đập đi xây lại theo kiến trúc Split-pane Rules Engine, 100% Data-driven từ API
 * Why: Đồng bộ UI/UX cấu trúc XEVN_POLICY_CATALOG.md, bỏ fix cứng mock data.
 * SOLID: Tách RuleConditionBuilder ra để đảm bảo SRP cho Component này, chỉ lo việc mapping Thuế.
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, FileText, Users, Plus, Trash2, Settings2, Loader2 } from 'lucide-react';
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

export function TaxPolicyTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  // 1. Fetch Tax Policies from Database
  const { data: dbPolicies = [], isLoading: isLoadingPolicies } = useQuery({
    queryKey: ['pay-policies', 'TAX'],
    queryFn: async () => {
      const all = await PolicyAPI.list({ pay_group_code: 'TAX' });
      return all;
    }
  });

  const { data: fieldOptions = [] } = useMasterDataFields();

  // 2. Local State for drafting/editing
  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const dbPoliciesStr = JSON.stringify(dbPolicies);
  
  useEffect(() => {
    if (dbPolicies.length > 0) {
      // Map DB structure to UI structure (Tax is stored as the first component of a Policy)
      const mapped = dbPolicies.map(p => {
        const taxComp = p.components?.[0];
        const params = taxComp?.params || {};
        return {
          id: p.id,
          code: p.name.toUpperCase().replace(/\s/g, '_'), // DB doesn't have policy code natively
          name: p.name,
          policy_type: taxComp?.component_type === 'tax_flat' ? 'flat' : 'progressive',
          status: p.status,
          effective_from: p.effective_from,
          params: params.calculation_rules || { personal_deduction: 0, dependent_deduction: 0, tiers: [], rate: 0 },
          target_conditions: params.target_conditions || []
        };
      });
      setPolicies(mapped);
    } else {
      setPolicies(prev => prev.length === 0 ? prev : []);
      if (selectedPolicyId && !selectedPolicyId.includes('tax_new_')) {
        setSelectedPolicyId(null);
      }
    }
  }, [dbPoliciesStr]);

  const selectedPolicy = policies.find(p => p.id === selectedPolicyId);

  // --- Mutations ---
  const savePolicyMutation = useMutation({
    mutationFn: async (policyToSave: any) => {
      const isNew = policyToSave.id.startsWith('tax_new_');
      
      let policyId = policyToSave.id;
      if (isNew) {
        const res: any = await PolicyAPI.create({
          name: policyToSave.name,
          pay_group_code: 'TAX',
          effective_from: policyToSave.effective_from,
          status: 'DRAFT' // always DRAFT first to avoid 409 Conflict when adding components
        });
        policyId = res.id || res.policy_id;
      } else {
        // If updating, status is not updated here to avoid 409 if changing from DRAFT to ACTIVE before component update
        await PolicyAPI.update(policyId, {
          name: policyToSave.name,
          effective_from: policyToSave.effective_from,
          description: `Chính sách thuế: ${policyToSave.name}`
        });
      }

      // Upsert Component inside the Policy to store Tiers & Conditions in JSONB
      await PolicyAPI.addComponent(policyId, {
        component_type: policyToSave.policy_type === 'flat' ? 'tax_flat' : 'tax_progressive',
        name: 'Luật tính thuế',
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
      toast.success('Đã lưu Cấu hình Thuế vào Database thành công!');
      queryClient.invalidateQueries({ queryKey: ['pay-policies', 'TAX'] });
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
      queryClient.invalidateQueries({ queryKey: ['pay-policies', 'TAX'] });
    },
    onError: (err: any) => {
      toast.error(`Lỗi khi cập nhật trạng thái: ${err.message}`);
    }
  });

  const handleSaveToDB = () => {
    if (!selectedPolicy) return;
    savePolicyMutation.mutate(selectedPolicy);
  };

  // --- Handlers for Policy List (Local State Edit) ---
  const handleAddNewPolicy = () => {
    const newId = `tax_new_${Date.now()}`;
    const newPolicy = {
      id: newId,
      code: `PIT_NEW_${Math.floor(Math.random() * 1000)}`,
      name: 'Chính sách Thuế mới',
      policy_type: 'progressive',
      status: 'ACTIVE',
      effective_from: new Date().toISOString().split('T')[0],
      params: {
        personal_deduction: 11000000,
        dependent_deduction: 4400000,
        tiers: [
          { id: `t_${Date.now()}`, min: 0, max: null, rate: 5 }
        ]
      },
      target_conditions: []
    };
    setPolicies([...policies, newPolicy]);
    setSelectedPolicyId(newId);
    setIsSheetOpen(true);
  };

  const handleUpdatePolicyField = (field: string, value: string) => {
    if (!selectedPolicyId) return;
    setPolicies(policies.map(p => {
      if (p.id === selectedPolicyId) {
        if (field === 'policy_type' && p.policy_type !== value) {
          const newParams = value === 'progressive' 
            ? { personal_deduction: 0, dependent_deduction: 0, tiers: [{ id: `t_${Date.now()}`, min: 0, max: null, rate: 0 }] }
            : { rate: 0, min_taxable_income: 0 };
          return { ...p, [field]: value, params: newParams };
        }
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  // --- Handlers for Progressive Tiers ---
  const handleAddTier = () => {
    setPolicies(policies.map(p => {
      if (p.id === selectedPolicyId && p.policy_type === 'progressive') {
        const tiers = [...p.params.tiers];
        const lastTier = tiers[tiers.length - 1];
        if (lastTier && lastTier.max === null) {
            lastTier.max = lastTier.min + 10000000;
        }
        const newMin = lastTier ? (lastTier.max || 0) : 0;
        tiers.push({ id: `t_${Date.now()}`, min: newMin, max: null, rate: 0 });
        return { ...p, params: { ...p.params, tiers } };
      }
      return p;
    }));
  };

  const handleUpdateTier = (tierId: string, field: string, value: number | null) => {
    setPolicies(policies.map(p => {
      if (p.id === selectedPolicyId && p.policy_type === 'progressive') {
        return {
          ...p,
          params: {
            ...p.params,
            tiers: p.params.tiers.map((t: any) => t.id === tierId ? { ...t, [field]: value } : t)
          }
        };
      }
      return p;
    }));
  };

  const handleRemoveTier = (tierId: string) => {
    setPolicies(policies.map(p => {
      if (p.id === selectedPolicyId && p.policy_type === 'progressive') {
        return {
          ...p,
          params: {
            ...p.params,
            tiers: p.params.tiers.filter((t: any) => t.id !== tierId)
          }
        };
      }
      return p;
    }));
  };

  if (isLoadingPolicies) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="flex h-full flex-col bg-slate-50/50 p-6 space-x-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[20px] font-bold font-display text-xevn-text">
            Tax Rules Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý danh sách Chính sách Thuế</p>
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
                    {policy.policy_type === 'progressive' ? 'Thuế luỹ tiến' : 'Thuế toàn phần'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={policy.id.includes('tax_new_') ? 'secondary' : (policy.status === 'ACTIVE' ? 'default' : 'secondary')} className={`text-[10px] uppercase shadow-none ${policy.status === 'ACTIVE' && !policy.id.includes('tax_new_') ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                    {policy.id.includes('tax_new_') ? 'Bản nháp' : (policy.status === 'ACTIVE' ? 'Đang áp dụng' : 'Tạm ngưng')}
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
                  <p>Chưa có chính sách nào trong Database. Hãy tạo mới.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* RIGHT: Policy Details Popup (Sheet) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" aria-describedby={undefined} className="w-full sm:max-w-[1400px] flex flex-col p-0 border-l shadow-2xl">
          <SheetTitle className="sr-only">Chi tiết chính sách</SheetTitle>
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
                        <span>Loại:</span>
                        <Select value={selectedPolicy.policy_type} onValueChange={(val) => handleUpdatePolicyField('policy_type', val)}>
                          <SelectTrigger className="h-7 w-[160px] text-xs border-slate-200">
                            <SelectValue placeholder="Chọn loại thuế" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="progressive">Thuế luỹ tiến từng phần</SelectItem>
                            <SelectItem value="flat">Tỷ lệ cố định (Flat)</SelectItem>
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
                    </div>
                  </div>
                  <div className="flex space-x-2 shrink-0">
                    {!selectedPolicy.id.includes('tax_new_') && (
                      <Button variant="outline" className="h-9 px-6 font-semibold" onClick={() => toggleStatusMutation.mutate(selectedPolicy.id)} disabled={toggleStatusMutation.isPending}>
                        {selectedPolicy.status === 'ACTIVE' ? 'Tạm ngưng' : 'Kích hoạt'}
                      </Button>
                    )}
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

                  {selectedPolicy.policy_type === 'progressive' ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-slate-50 shadow-sm">
                        <div className="space-y-1.5">
                          <Label>Giảm trừ gia cảnh bản thân (VNĐ/tháng)</Label>
                          <ViMoneyInput 
                            value={selectedPolicy.params.personal_deduction || undefined} 
                            onValueChange={(val) => {
                              setPolicies(policies.map(p => 
                                p.id === selectedPolicyId 
                                  ? { ...p, params: { ...p.params, personal_deduction: Number(val) || 0 } } 
                                  : p
                              ));
                            }}
                            className="bg-white h-9" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Giảm trừ người phụ thuộc (VNĐ/tháng/người)</Label>
                          <ViMoneyInput 
                            value={selectedPolicy.params.dependent_deduction || undefined} 
                            onValueChange={(val) => {
                              setPolicies(policies.map(p => 
                                p.id === selectedPolicyId 
                                  ? { ...p, params: { ...p.params, dependent_deduction: Number(val) || 0 } } 
                                  : p
                              ));
                            }}
                            className="bg-white h-9" 
                          />
                        </div>
                      </div>

                      <div className="border rounded-md p-4 bg-white shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <Label className="font-semibold text-slate-700">Bảng Bậc Thuế Luỹ Tiến Động</Label>
                          <Button variant="outline" size="sm" onClick={handleAddTier} className="h-8 text-xs">
                            <Plus className="w-3 h-3 mr-1" /> Thêm bậc
                          </Button>
                        </div>

                        <table className="w-full border-collapse border text-sm">
                          <thead>
                            <tr className="bg-slate-100">
                              <th className="border p-2 text-left w-[30%]">Từ (VNĐ)</th>
                              <th className="border p-2 text-left w-[30%]">Đến (VNĐ)</th>
                              <th className="border p-2 text-left w-[25%]">Thuế suất (%)</th>
                              <th className="border p-2 text-center w-[15%]">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedPolicy.params.tiers?.map((tier: any, idx: number) => (
                              <tr key={tier.id} className="hover:bg-slate-50 transition-colors">
                                <td className="border p-1">
                                  <ViMoneyInput 
                                    value={tier.min || undefined} 
                                    onValueChange={(val) => handleUpdateTier(tier.id, 'min', Number(val) || 0)}
                                    className="h-8 shadow-none bg-transparent focus-visible:ring-1" 
                                  />
                                </td>
                                <td className="border p-1 relative">
                                  <ViMoneyInput 
                                    value={tier.max === null ? undefined : tier.max} 
                                    onValueChange={(val) => handleUpdateTier(tier.id, 'max', val ? Number(val) : null)}
                                    placeholder="Không giới hạn" 
                                    className="h-8 shadow-none bg-transparent focus-visible:ring-1" 
                                  />
                                </td>
                                <td className="border p-1 relative">
                                  <div className="relative">
                                    <Input 
                                      value={tier.rate} 
                                      onChange={(e) => handleUpdateTier(tier.id, 'rate', Number(e.target.value))}
                                      type="number" className="h-8 pr-6 shadow-none bg-transparent focus-visible:ring-1" 
                                    />
                                    <span className="absolute right-3 top-2 text-slate-400 text-xs">%</span>
                                  </div>
                                </td>
                                <td className="border p-1 text-center">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleRemoveTier(tier.id)}
                                    disabled={selectedPolicy.params.tiers.length === 1}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-slate-50 shadow-sm">
                      <div className="space-y-1.5">
                        <Label>Thuế suất toàn phần (%)</Label>
                        <Input 
                          value={selectedPolicy.params.rate || ''} 
                          onChange={(e) => {
                            setPolicies(policies.map(p => 
                              p.id === selectedPolicyId 
                                ? { ...p, params: { ...p.params, rate: Number(e.target.value) } } 
                                : p
                            ));
                          }}
                          className="bg-white h-9" type="number" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Mức thu nhập tối thiểu bị khấu trừ (VNĐ/lần)</Label>
                        <ViMoneyInput 
                          value={selectedPolicy.params.min_taxable_income || undefined} 
                          onValueChange={(val) => {
                            setPolicies(policies.map(p => 
                              p.id === selectedPolicyId 
                                ? { ...p, params: { ...p.params, min_taxable_income: Number(val) || 0 } } 
                                : p
                            ));
                          }}
                          className="bg-white h-9" 
                        />
                      </div>
                    </div>
                  )}
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
