/**
 * @CODE-MEMORY
 * Screen:      HRM · Policy Builder (Wizard)
 * Route:       /hr/payroll/policy-engine → click Xem/Sửa
 * WorkItem:    HRM-POLICY-FE-FLEX-WIZARD & G10 - Khôi phục và Đồng bộ Hóa Giao diện Cấu hình Thuế TNCN
 * Coded:       2026-08-27
 * Description: Màn hình Wizard tạo/sửa chính sách lương động. Cập nhật hỗ trợ chuyển đổi linh hoạt
 *              lựa chọn cấu trúc và thuộc tính component lưu trữ tương thích với chính sách Thuế.
 *
 * @CODE-MEMORY-CHANGE 2026-09-04 PO-HRM-STEP-PROGRESSION-FIELD-OPTIONS-01
 * change_mode: UPGRADE
 * What: Bổ sung current_step (Bậc lương hiện tại) và kpi_score vào RuleConditionBuilder fieldOptions
 * Why: Cho phép thiết lập điều kiện áp dụng chính sách lương theo Bậc và KPI của nhân sự
 * SRS/BR: SRS_PAYROLL.md §17 · BR-STEP-PROGRESSION-01
 * must_keep: Command Center Portal Dialog (@/components/ui/dialog), Master catalog pickers
 */
import { useEffect, useState, useMemo } from "react";
import { useDepartments } from "@/hooks/useDepartments";
import { useJobTitles } from "@/hooks/useJobTitles";
import { usePaySteps } from "@/hooks/usePaySteps";
import { useSettingsCatalogsOverview } from "@/hooks/useSettingsCatalogsOverview";
import { contractTypeOptionsFromCatalog } from "@/lib/catalogSearchPicker";
import { useToast } from "@/components/ui/use-toast";
import { type Policy, type PolicyComponent, PolicyAPI } from "../../../lib/api/hrm-policy-api";
import { ComponentFormBuilder } from "./ComponentFormBuilder";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Rocket, Plus, Trash2, Loader2, Settings2, ShieldCheck, Database, SlidersHorizontal } from "lucide-react";
import { RuleConditionBuilder, type Condition } from "../RuleConditionBuilder";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ViDatePickerField } from "@/components/ui/ViDatePickerField";

type WizardStep = "definition" | "tariff" | "rules";

const STRUCTURE_TYPES = [
  { value: "step_only_table", label: "Bảng lương theo Bậc (1 chiều)" },
  { value: "grade_step_matrix", label: "Bảng lương Ngạch-Bậc (2 chiều)" },
  { value: "fixed_amount", label: "Mức cố định (Flat)" },
  { value: "formula_based", label: "Tính theo công thức/thời gian" },
];

export function PolicyBuilderScreen({ policyId, onBack }: { policyId: string; onBack: () => void }) {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [components, setComponents] = useState<PolicyComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState<WizardStep>("definition");
  const { departments } = useDepartments();
  const { data: jobTitles = [] } = useJobTitles() as { data: any[] };
  const { steps: dbPaySteps = [] } = usePaySteps();
  const { catalogs } = useSettingsCatalogsOverview();
  const contractTypePickerOptions = useMemo(
    () => contractTypeOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );
  const { toast } = useToast();
  const isReadOnly = policy?.status === "ACTIVE";
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  // Local state for Definition
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [paramsStr, setParamsStr] = useState("{}");
  const [policyDef, setPolicyDef] = useState({
    name: "",
    description: "",
    effective_from: "",
    structureType: "step_only_table",
    scope: "global"
  });

  const load = async () => {
    setLoading(true);
    try { 
      const p = await PolicyAPI.get(policyId); 
      setPolicy(p);
      const comps = p.components || [];
      setComponents(comps);
      
      const comp = comps[0];
      if (comp) {
        setParamsStr(JSON.stringify(comp.params || {}));
        setPolicyDef({
          name: p.name || "",
          description: p.description || "",
          effective_from: p.effective_from || "",
          structureType: comp.component_type || "step_only_table",
          scope: (comp.params as any)?.scope || "global"
        });
        setConditions((comp.params as any)?.conditions || []);
      } else {
        setParamsStr("{}");
        setPolicyDef({
          name: p.name || "",
          description: p.description || "",
          effective_from: p.effective_from || "",
          structureType: "step_only_table",
          scope: "global"
        });
        setConditions([]);
      }
    }
    catch { setPolicy(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [policyId]);

  const handleActivate = () => {
    setConfirmDialog({
      title: "Kích hoạt chính sách",
      description: "Kích hoạt chính sách này? Phiên bản cũ sẽ bị đóng.",
      onConfirm: async () => {
        try {
          await PolicyAPI.toggleStatus(policyId);
          await load();
          toast({ title: "Đã kích hoạt chính sách thành công!" });
        } catch (e: any) {
          toast({ title: "Lỗi kích hoạt", description: e.message, variant: "destructive" });
        }
      }
    });
  };

  const handleDeactivate = () => {
    setConfirmDialog({
      title: "Hủy kích hoạt chính sách",
      description: "Hủy kích hoạt chính sách này? Trạng thái sẽ chuyển về INACTIVE.",
      onConfirm: async () => {
        try {
          await PolicyAPI.toggleStatus(policyId);
          await load();
          toast({ title: "Đã hủy kích hoạt chính sách thành công!" });
        } catch (e: any) {
          toast({ title: "Lỗi hủy kích hoạt", description: e.message, variant: "destructive" });
        }
      }
    });
  };

  const handleSaveDef = async () => {
    try {
      setSaving(true);
      await PolicyAPI.update(policyId, { 
        name: policyDef.name, 
        description: policyDef.description
      });
      toast({ title: "Đã lưu thông tin chung thành công" });
      setActiveStep("tariff");
    } catch (e) {
      toast({ title: "Lỗi lưu chính sách", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !policy) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onBack(); }}>
      <DialogContent className="max-w-[99vw] w-[99vw] h-[98vh] max-h-[98vh] flex flex-col p-0 overflow-hidden bg-white border border-slate-200 shadow-2xl rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-slate-100 rounded-full text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Thiết lập chính sách: {policy.name}
                <Badge variant={policy.status === "ACTIVE" ? "default" : "outline"} className={policy.status === "ACTIVE" ? "bg-emerald-600 text-white font-semibold" : "text-slate-600"}>
                  {policy.status === "ACTIVE" ? "ACTIVE" : policy.status}
                </Badge>
              </DialogTitle>
              <p className="text-xs text-slate-500">Mã: {policy.pay_group_code} • v{policy.version || 1} • Từ {policy.effective_from}</p>
            </div>
          </div>
        <div className="flex gap-2">
          {policy.status === "DRAFT" && (
            <Button onClick={handleActivate} className="bg-emerald-600 hover:bg-emerald-700 font-semibold text-white">
              <Rocket className="w-4 h-4 mr-2" /> Kích hoạt bản nháp
            </Button>
          )}
          {policy.status === "INACTIVE" && (
            <Button onClick={handleActivate} className="bg-emerald-600 hover:bg-emerald-700 font-semibold text-white">
              <Rocket className="w-4 h-4 mr-2" /> Kích hoạt chính sách
            </Button>
          )}
          {policy.status === "ACTIVE" && (
            <Button onClick={handleDeactivate} className="bg-amber-600 hover:bg-amber-700 font-semibold text-white">
              <Rocket className="w-4 h-4 mr-2" /> Hủy kích hoạt
            </Button>
          )}
          <Button variant="outline" onClick={onBack}>Đóng</Button>
          {!isReadOnly && (
            <Button className="bg-primary" disabled={saving} onClick={async () => {
                try {
                  setSaving(true);
                  // 1. Save policy name, description and effective date
                  await PolicyAPI.update(policyId, {
                    name: policyDef.name,
                    description: policyDef.description,
                    effective_from: policyDef.effective_from
                  });

                  // 2. Save component matrix and rules
                  const isTaxPolicy = policy.pay_group_code === "TAX";
                  let parsedParams = {};
                  try {
                    parsedParams = JSON.parse(paramsStr);
                  } catch {}
                  const paramsPayload = {
                    ...parsedParams,
                    conditions,
                    scope: policyDef.scope
                  };
                  await PolicyAPI.addComponent(policyId, {
                    name: isTaxPolicy ? "Luật tính thuế" : "Main Matrix",
                    component_type: policyDef.structureType,
                    sort_order: 1,
                    is_deduction: isTaxPolicy ? true : false,
                    input_source: isTaxPolicy ? "system" : "manual",
                    params: paramsPayload
                  } as any);
                  
                  toast({ title: "Lưu cấu hình chính sách thành công!" });
                  onBack();
                } catch(e: any) {
                  console.error("Save policy error:", e);
                  toast({ 
                    title: "Lỗi lưu cấu hình chính sách", 
                    description: e?.response?.data?.message || e?.message || "Đã xảy ra lỗi khi lưu cấu hình chính sách",
                    variant: "destructive" 
                  });
                } finally {
                  setSaving(false);
                }
              }}>Hoàn tất & Lưu Chính sách</Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden p-3 bg-slate-50/50">
        {isReadOnly && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg mb-2 flex items-center shadow-sm shrink-0">
            <span className="text-xs font-medium">
              ⚠️ Chính sách đang hoạt động (ACTIVE) không được phép chỉnh sửa trực tiếp. Vui lòng quay lại danh sách và thực hiện "Clone" để tạo phiên bản mới.
            </span>
          </div>
        )}
        <div className="grid grid-cols-12 gap-3 flex-1 overflow-hidden">

            <div className="col-span-3 h-full overflow-hidden flex flex-col"><Card className="shadow-sm border-slate-200 h-full flex flex-col">
                <CardHeader className="p-3.5 pb-1 shrink-0">
                  <CardTitle className="text-base font-bold text-slate-900">Định nghĩa Chính sách</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Tên gọi & kiểu cấu trúc bảng lương</CardDescription>
                </CardHeader>
                <CardContent className="p-3.5 pt-2 space-y-2.5 flex-1 overflow-hidden">
                  <div className="grid gap-1">
                    <Label className="text-xs font-semibold text-slate-700">Tên chính sách</Label>
                    <Input className="h-8 text-xs" value={policyDef.name} disabled={isReadOnly} onChange={e => setPolicyDef({...policyDef, name: e.target.value})} />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs font-semibold text-slate-700">Ngày hiệu lực</Label>
                    <ViDatePickerField 
                      className="h-8 text-xs"
                      value={policyDef.effective_from} 
                      onValueChange={v => setPolicyDef({...policyDef, effective_from: v})} 
                      placeholder="dd/MM/yyyy"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs font-semibold text-slate-700">Kiểu Cấu trúc Bảng lương</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(policy?.pay_group_code === "TAX"
                        ? [
                            { value: "tax_progressive", label: "Biểu thuế lũy tiến" },
                            { value: "tax_flat", label: "Thuế suất cố định" }
                          ]
                        : STRUCTURE_TYPES
                      ).map(t => (
                        <div 
                          key={t.value} 
                          onClick={() => !isReadOnly && setPolicyDef({...policyDef, structureType: t.value})}
                          className={`p-2 border rounded-lg transition-all text-xs flex items-center justify-center text-center ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${policyDef.structureType === t.value ? 'border-indigo-600 ring-1 ring-indigo-500 bg-indigo-50/50 text-indigo-900 font-bold' : 'hover:border-slate-300 hover:bg-slate-50 text-slate-700'}`}
                        >
                          <div className="leading-tight">{t.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs font-semibold text-slate-700">Phạm vi áp dụng</Label>
                    <select className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={policyDef.scope} disabled={isReadOnly} onChange={e => setPolicyDef({...policyDef, scope: e.target.value})}>
                      <option value="global">Toàn công ty</option>
                      <option value="location">Theo Khu vực / Vùng miền (HN / YB / Tỉnh)</option>
                      <option value="branch">Theo Chi nhánh / Văn phòng (Bưu cục)</option>
                      <option value="department">Theo Phòng ban</option>
                      <option value="position">Theo Chức danh / Vị trí</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
<div className="col-span-5 h-full overflow-hidden flex flex-col"><Card className="shadow-sm border-slate-200 h-full flex flex-col">
                <CardHeader className="p-3.5 pb-1 shrink-0">
                  <CardTitle className="text-base font-bold text-slate-900">Quy tắc & Điều kiện (Rules)</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Các điều kiện phụ thuộc & đối tượng áp dụng</CardDescription>
                </CardHeader>
                <CardContent className="p-3.5 pt-2 flex-1 overflow-hidden">
                  <RuleConditionBuilder 
                    conditions={conditions} 
                    onChange={setConditions}
                    disabled={isReadOnly} 
                    fieldOptions={[
                      { 
                        value: 'department', 
                        label: 'Phòng ban', 
                        type: 'select', 
                        options: departments.map(d => ({ value: String(d.department_id || d.id), label: d.name }))
                      },
                      { 
                        value: 'title', 
                        label: 'Chức danh', 
                        type: 'select',
                        options: jobTitles.map(p => ({ value: String(p.code), label: String(p.label) }))
                      },
                      { 
                        value: 'location', 
                        label: 'Khu vực / Vùng miền', 
                        type: 'select',
                        options: (() => {
                          const catItems = (catalogs?.find((cat: any) => cat.catalogKey === 'locations' || cat.code === 'locations')?.items || []);
                          const defaultLocations = [
                            { value: 'HN', label: 'Khu vực Hà Nội (HN)' },
                            { value: 'YB', label: 'Khu vực Yên Bái (YB)' },
                            { value: 'TINH', label: 'Khu vực Tỉnh (Ninh Bình, Nam Định, Thái Bình...)' }
                          ];
                          if (catItems.length > 0) {
                            return catItems.map((i: any) => ({ value: String(i.code || i.item_key || i.id), label: String(i.label || i.name) }));
                          }
                          return defaultLocations;
                        })()
                      },
                      { 
                        value: 'branch', 
                        label: 'Chi nhánh / Bưu cục', 
                        type: 'select',
                        options: departments.map(d => ({ value: String(d.department_id || d.id), label: d.name }))
                      },
                      { 
                        value: 'contract_type', 
                        label: 'Loại hợp đồng', 
                        type: 'select',
                        options: contractTypePickerOptions.map(ct => ({ value: String(ct.value), label: String(ct.label) }))
                      },
                      { 
                        value: 'current_step', 
                        label: 'Bậc lương hiện tại', 
                        type: 'select',
                        options: dbPaySteps.map(s => ({
                          value: String(s.code || s.id),
                          label: `${s.name || 'Bậc ' + s.code} (${s.code})`
                        }))
                      },
                      { value: 'seniority', label: 'Thâm niên (tháng)', type: 'number' },
                      { value: 'kpi_score', label: 'Điểm KPI bình quân năm (%)', type: 'number' }
                    ]} 
                  />
                </CardContent>
              </Card>
            </div>
            <div className="col-span-4 h-full overflow-hidden flex flex-col"><Card className="shadow-sm border-slate-200 h-full flex flex-col">
                <CardHeader className="p-3.5 pb-1 shrink-0 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900">Cấu hình Bảng giá trị (Tariff Matrix)</CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    {policyDef.structureType === 'step_only_table' && "Bảng cấu hình theo Bậc (1 chiều). Phù hợp cho Nhân viên Điều phối."}
                    {policyDef.structureType === 'grade_step_matrix' && "Bảng cấu hình theo Ngạch & Bậc (2 chiều)."}
                    {policyDef.structureType === 'fixed_amount' && "Cấu hình một mức tiền cố định."}
                    {policyDef.structureType === 'formula_based' && "Cấu hình theo tham số và công thức linh hoạt."}
                    {policyDef.structureType === 'tax_progressive' && "Biểu thuế luỹ tiến từng phần tính thuế thu nhập cá nhân."}
                    {policyDef.structureType === 'tax_flat' && "Biểu thuế suất cố định toàn phần."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3.5 flex-1 overflow-y-auto">
                  <ComponentFormBuilder 
                    componentType={policyDef.structureType} 
                    paramsStr={paramsStr} 
                    onChange={setParamsStr} 
                    disabled={isReadOnly}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

      {/* Confirm Action Dialog */}
      <AlertDialog open={!!confirmDialog} onOpenChange={(open) => { if (!open) setConfirmDialog(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (confirmDialog?.onConfirm) {
                await confirmDialog.onConfirm();
              }
              setConfirmDialog(null);
            }}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DialogContent>
  </Dialog>
  );
}
