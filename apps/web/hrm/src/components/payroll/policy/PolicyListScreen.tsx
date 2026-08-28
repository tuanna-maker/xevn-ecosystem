/**
 * @CODE-MEMORY
 * Screen:     HRM · Lương · Danh sách chính sách (S1)
 * Route:      /hr/payroll/policy-engine (tab "Chính sách")
 * BEEndpoint: GET /api/hrm/pay-policies
 * WorkItem:   HRM-POLICY-FE-S1
 * Coded:      2026-08-22
 */
import { useEffect, useState } from "react";
import { BatchAPI, type Payslip, type Policy, PolicyAPI } from "../../../lib/api/hrm-policy-api";
import { PayslipPanel } from "../payslip/PayslipPanel";
import { PolicyBuilderScreen } from "./PolicyBuilderScreen";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ViDatePickerField } from "@/components/ui/ViDatePickerField";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, Loader2, Plus, RefreshCw, Settings2 } from "lucide-react";

type View = "list" | "builder" | "payslip";

export function PolicyListScreen({ defaultGroupCode }: { defaultGroupCode?: string }) {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGroup, setFilterGroup] = useState(defaultGroupCode || "");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<View>("list");
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", pay_group_code: defaultGroupCode || "", effective_from: "", description: "" });
  const [assignForm, setAssignForm] = useState({ policy_id: "", target_type: "employee" as "employee" | "pay_group" | "department", target_ids: "", effective_from: "" });
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [payslipLoading, setPayslipLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Custom styled dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);
  const [clonePolicy, setClonePolicy] = useState<Policy | null>(null);
  const [cloneForm, setCloneForm] = useState({ name: "", effective_from: "" });
  const [payslipPreviewPolicyId, setPayslipPreviewPolicyId] = useState<string | null>(null);
  const [payslipForm, setPayslipForm] = useState({ employee_id: "", period_month: new Date().toISOString().slice(0, 7) });

  const load = async (statusOverride?: string, groupOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      const activeStatus = statusOverride !== undefined ? statusOverride : filterStatus;
      const activeGroup = groupOverride !== undefined ? groupOverride : filterGroup;
      const data = await PolicyAPI.list({
        status: activeStatus === "ALL" ? undefined : activeStatus || undefined,
        pay_group_code: activeGroup === "ALL" ? undefined : activeGroup || undefined
      });
      setPolicies(data);
    } catch (e: unknown) { setError((e as { message?: string }).message ?? "Lỗi tải dữ liệu"); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [filterStatus, filterGroup]);

  // Sync when defaultGroupCode prop changes
  useEffect(() => {
    if (defaultGroupCode !== undefined) {
      setFilterGroup(defaultGroupCode);
      setCreateForm(f => ({ ...f, pay_group_code: defaultGroupCode }));
    }
  }, [defaultGroupCode]);

  const handleActivate = (id: string) => {
    setConfirmDialog({
      title: "Kích hoạt chính sách",
      description: "Kích hoạt chính sách này? Phiên bản cũ sẽ bị đóng.",
      onConfirm: async () => {
        try {
          await PolicyAPI.toggleStatus(id);
          await load();
          toast({ title: "Đã kích hoạt chính sách thành công!" });
        } catch (e: any) {
          toast({ title: "Lỗi kích hoạt", description: e.message, variant: "destructive" });
        }
      }
    });
  };

  const handleDeactivate = (id: string) => {
    setConfirmDialog({
      title: "Hủy kích hoạt chính sách",
      description: "Hủy kích hoạt chính sách này? Trạng thái sẽ chuyển về INACTIVE.",
      onConfirm: async () => {
        try {
          await PolicyAPI.toggleStatus(id);
          await load();
          toast({ title: "Đã hủy kích hoạt chính sách thành công!" });
        } catch (e: any) {
          toast({ title: "Lỗi hủy kích hoạt", description: e.message, variant: "destructive" });
        }
      }
    });
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      title: "Xóa chính sách",
      description: "Bạn có chắc chắn muốn xóa chính sách này? Hành động này không thể hoàn tác.",
      onConfirm: async () => {
        try {
          await PolicyAPI.delete(id);
          toast({ title: "Đã xóa chính sách thành công!" });
          await load();
        } catch (e: any) {
          toast({ title: "Lỗi xóa chính sách", description: e.message, variant: "destructive" });
        }
      }
    });
  };

  const handleCloneClick = (p: Policy) => {
    setClonePolicy(p);
    setCloneForm({
      name: `${p.name} (clone)`,
      effective_from: new Date().toISOString().slice(0, 10)
    });
  };

  const handleCloneSubmit = async () => {
    if (!clonePolicy) return;
    if (!cloneForm.name || !cloneForm.effective_from) {
      return toast({ title: "Điền đủ thông tin bắt buộc", variant: "destructive" });
    }
    try {
      await PolicyAPI.clone(clonePolicy.id, { name: cloneForm.name, effective_from: cloneForm.effective_from });
      toast({ title: "Đã clone thành công chính sách mới!" });
      setClonePolicy(null);
      await load();
    } catch (e: any) {
      toast({ title: "Lỗi clone chính sách", description: e.message, variant: "destructive" });
    }
  };

  const handleCreate = async () => {
    if (!createForm.name || !createForm.pay_group_code || !createForm.effective_from) {
      return toast({ title: "Điền đủ thông tin bắt buộc", variant: "destructive" });
    }
    setCreating(true);
    try {
      await PolicyAPI.create(createForm);
      setShowCreate(false);
      toast({ title: "Tạo mới chính sách thành công!" });
      
      setFilterGroup(createForm.pay_group_code);
      setCreateForm({ name: "", pay_group_code: createForm.pay_group_code, effective_from: "", description: "" });
      
      await load(filterStatus, createForm.pay_group_code);
    } catch (e: any) {
      toast({ title: "Lỗi tạo chính sách", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleViewPayslipClick = (policyId: string) => {
    setPayslipPreviewPolicyId(policyId);
    setPayslipForm({
      employee_id: "",
      period_month: new Date().toISOString().slice(0, 7)
    });
  };

  const handlePayslipSubmit = async () => {
    if (!payslipForm.employee_id || !payslipForm.period_month) {
      return toast({ title: "Vui lòng nhập đầy đủ thông tin", variant: "destructive" });
    }
    setPayslipLoading(true);
    try {
      const ps = await BatchAPI.getPayslip(payslipForm.employee_id, payslipForm.period_month);
      setPayslip(ps);
      setPayslipPreviewPolicyId(null);
      setView("payslip");
    } catch (e: any) {
      toast({ title: "Lỗi tải phiếu lương", description: e.message, variant: "destructive" });
    } finally {
      setPayslipLoading(false);
    }
  };

  const handleOpenAssign = (policy: Policy) => {
    setAssignForm({
      policy_id: policy.id,
      target_type: "employee",
      target_ids: "",
      effective_from: new Date().toISOString().slice(0, 10)
    });
    setShowAssign(true);
  };

  const handleAssign = async () => {
    if (!assignForm.target_ids || !assignForm.effective_from) {
      return toast({ title: "Vui lòng điền đối tượng và ngày hiệu lực", variant: "destructive" });
    }
    setAssigning(true);
    try {
      const ids = assignForm.target_ids.split(",").map(id => id.trim()).filter(Boolean);
      await PolicyAPI.assignToTarget(assignForm.policy_id, {
        target_type: assignForm.target_type as any,
        target_ids: ids,
        effective_from: assignForm.effective_from
      });
      setShowAssign(false);
      toast({ title: "Đã áp dụng chính sách thành công!" });
      await load();
    } catch (e: any) {
      toast({ title: "Lỗi áp dụng chính sách", description: e.message, variant: "destructive" });
    } finally {
      setAssigning(false);
    }
  };

  if (view === "payslip" && payslip) {
    return (
      <div className="bg-slate-50/50 p-6 min-h-screen">
        <Button variant="outline" onClick={() => setView("list")} className="mb-6">← Quay lại</Button>
        <div><PayslipPanel payslip={payslip} /></div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-6 space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl shadow-sm border border-border bg-card">
        <div className="flex flex-1 items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Hoạt động (ACTIVE)</SelectItem>
              <SelectItem value="DRAFT">Nháp (DRAFT)</SelectItem>
              <SelectItem value="ARCHIVED">Lưu trữ (ARCHIVED)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterGroup || "ALL"} onValueChange={setFilterGroup}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Lọc theo Nhóm chính sách..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả Nhóm chính sách</SelectItem>
              <SelectItem value="GRADE">Lương Ngạch-Bậc</SelectItem>
              <SelectItem value="TAX">Chính sách Thuế</SelectItem>
              <SelectItem value="INSURANCE">Chính sách Bảo hiểm</SelectItem>
              <SelectItem value="ALLOWANCE">Chính sách Phụ cấp</SelectItem>
              <SelectItem value="BONUS">Chính sách Thưởng</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" /> Tạo chính sách
          </Button>
          <Button variant="outline" onClick={load}>
            <RefreshCw className="w-4 h-4 mr-2" /> Làm mới
          </Button>
        </div>
      </div>

      {/* Create modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tạo chính sách mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Tên chính sách</Label>
              <Input id="name" placeholder="Ví dụ: Chính sách Dev" className="col-span-3" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pay_group" className="text-right">Nhóm chính sách (Pay Group)</Label>
              <div className="col-span-3">
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={createForm.pay_group_code} onChange={e => setCreateForm(f => ({ ...f, pay_group_code: e.target.value }))}>
                  <option value="GRADE">Lương Ngạch-Bậc</option>
                  <option value="TAX">Chính sách Thuế</option>
                  <option value="INSURANCE">Chính sách Bảo hiểm</option>
                  <option value="ALLOWANCE">Chính sách Phụ cấp</option>
                  <option value="BONUS">Chính sách Thưởng</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="effective" className="text-right">Ngày hiệu lực</Label>
              <div className="col-span-3">
                <ViDatePickerField 
                  value={createForm.effective_from} 
                  onValueChange={v => setCreateForm(f => ({ ...f, effective_from: v }))} 
                  placeholder="dd/MM/yyyy"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="desc" className="text-right">Mô tả</Label>
              <Input id="desc" placeholder="Mô tả ngắn..." className="col-span-3" value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreate} disabled={creating}>{creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}{creating ? "Đang tạo..." : "Tạo mới"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* Builder Dialog */}
      <Dialog open={view === "builder" && !!selectedId} onOpenChange={(open) => { if (!open) { setView("list"); void load(); } }}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] max-h-[95vh] p-0 flex flex-col overflow-hidden bg-slate-50 border-slate-200">
          <div className="flex-1 overflow-auto">
            {selectedId && <PolicyBuilderScreen policyId={selectedId} onBack={() => { setView("list"); void load(); }} />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 bg-red-50">❌ {error}</div>
        ) : policies.length === 0 ? (
          <div className="text-center py-16 text-slate-400 flex flex-col items-center">
            <FileText className="w-12 h-12 mb-4 opacity-20" />
            <p>Chưa có chính sách nào. Nhấn "+ Tạo chính sách" để bắt đầu.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[300px]">Tên chính sách</TableHead>
                <TableHead>Pay Group</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Phiên bản</TableHead>
                <TableHead>Hiệu lực từ</TableHead>
                <TableHead className="text-center">Đối tượng áp dụng</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map(p => (
                <TableRow key={p.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-semibold text-slate-800">{p.name}</TableCell>
                  <TableCell>
                    <code className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-mono">{p.pay_group_code}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.status === "ACTIVE" ? "default" : (p.status === "DRAFT" ? "secondary" : "outline")} className={p.status === "ACTIVE" ? "bg-green-600 hover:bg-green-700" : ""}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs text-slate-500">v{p.version}</TableCell>
                  <TableCell className="text-slate-600 text-sm">{p.effective_from}</TableCell>
                  <TableCell className="text-center text-slate-600">{p.assignment_count ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedId(p.id); setView("builder"); }} className="h-8 text-muted-foreground hover:text-foreground">
                        {p.status === "ACTIVE" || p.status === "ARCHIVED" ? "Xem" : "Xem/Sửa"}
                      </Button>
                      {(p.status === "DRAFT" || p.status === "INACTIVE") && (
                        <Button variant="ghost" size="sm" onClick={() => handleActivate(p.id)} className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                          Kích hoạt
                        </Button>
                      )}
                      {p.status === "ACTIVE" && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeactivate(p.id)} className="h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                          Hủy kích hoạt
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleCloneClick(p)} className="h-8 text-muted-foreground hover:text-foreground">
                        Clone
                      </Button>
                      {p.status === "ACTIVE" && (
                        <Button variant="ghost" size="sm" onClick={() => handleViewPayslipClick(p.id)} disabled={payslipLoading} className="h-8 text-muted-foreground hover:text-foreground">
                          Payslip
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
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

      {/* Clone Policy Dialog */}
      <Dialog open={!!clonePolicy} onOpenChange={(open) => { if (!open) setClonePolicy(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Sao chép chính sách (Clone)</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="clone-name">Tên chính sách mới</Label>
              <Input id="clone-name" value={cloneForm.name} onChange={e => setCloneForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="clone-effective">Ngày hiệu lực</Label>
              <ViDatePickerField 
                value={cloneForm.effective_from} 
                onValueChange={v => setCloneForm(f => ({ ...f, effective_from: v }))} 
                placeholder="dd/MM/yyyy"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClonePolicy(null)}>Hủy</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCloneSubmit}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payslip Preview Dialog */}
      <Dialog open={!!payslipPreviewPolicyId} onOpenChange={(open) => { if (!open) setPayslipPreviewPolicyId(null); }}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Xem trước Phiếu lương (Payslip Preview)</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ps-emp-id">Mã nhân viên</Label>
              <Input id="ps-emp-id" placeholder="VD: EMP001" value={payslipForm.employee_id} onChange={e => setPayslipForm(f => ({ ...f, employee_id: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ps-period">Kỳ lương</Label>
              <Input id="ps-period" type="month" value={payslipForm.period_month} onChange={e => setPayslipForm(f => ({ ...f, period_month: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayslipPreviewPolicyId(null)}>Hủy</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePayslipSubmit} disabled={payslipLoading}>
              {payslipLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {payslipLoading ? "Đang tải..." : "Xem phiếu lương"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
