/**
 * Screen:     HRM · Chạy lương (S6)
 * WorkItem:   HRM-POLICY-FE-S6
 * Coded:      2026-08-22
 */
import { useState } from "react";
import { BatchAPI, type Payslip } from "../../../lib/api/hrm-policy-api";
import { PayslipPanel } from "../payslip/PayslipPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayCircle, CheckCircle, ChevronDown, ChevronUp, Search, Loader2 } from "lucide-react";

type BatchResult = { batch_id: string; employee_count: number; warnings: string[] };

export function BatchRunnerScreen() {
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);
  const [payslipEmpId, setPayslipEmpId] = useState("");
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [loadingPayslip, setLoadingPayslip] = useState(false);

  const handleRun = async () => {
    if (!period) return;
    setRunning(true);
    setResult(null);
    setApproved(false);
    setPayslip(null);
    try {
      const r = await BatchAPI.run(period);
      setResult(r);
    } catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi chạy lương"); }
    finally { setRunning(false); }
  };

  const handleApprove = async () => {
    if (!result) return;
    setApproving(true);
    try { await BatchAPI.approve(result.batch_id); setApproved(true); }
    catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi approve"); }
    finally { setApproving(false); }
  };

  const handleGetPayslip = async () => {
    if (!payslipEmpId || !period) return;
    setLoadingPayslip(true);
    try { setPayslip(await BatchAPI.getPayslip(payslipEmpId, period)); }
    catch (e: unknown) { alert((e as { message?: string }).message ?? "Không tìm thấy phiếu lương"); }
    finally { setLoadingPayslip(false); }
  };

  return (
    <div className="space-y-6">
      {/* Run form */}
      <Card className="p-6 bg-white border-xevn-border shadow-sm">
        <h2 className="text-[20px] font-bold font-display text-xevn-text flex items-center gap-2 mb-1">
          <PlayCircle className="w-5 h-5 text-xevn-primary" /> Chạy lương tháng
        </h2>
        <p className="text-sm text-xevn-textSecondary mb-6">
          Hệ thống sẽ tự động tính lương cho tất cả nhân viên theo chính sách đang ACTIVE của từng nhóm.
        </p>
        <div className="flex gap-4 items-end flex-wrap">
          <div className="space-y-1">
            <label className="text-xs text-xevn-textSecondary font-medium">Kỳ lương</label>
            <Input type="month" className="w-48 bg-white" value={period} onChange={e => setPeriod(e.target.value)} />
          </div>
          <Button className="bg-xevn-primary text-white font-medium px-6 h-10 gap-2" onClick={handleRun} disabled={running}>
            {running ? <><Loader2 className="w-4 h-4 animate-spin"/> Đang chạy lương...</> : <><PlayCircle className="w-4 h-4"/> Bắt đầu chạy</>}
          </Button>
        </div>
        
        {running && (
          <div className="mt-6 bg-xevn-surface border border-xevn-border rounded-lg p-5">
            <div className="flex items-center gap-3 text-xevn-primary font-medium mb-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang xử lý batch — vui lòng chờ...</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-xevn-primary w-[60%] rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </Card>

      {/* Result */}
      {result && (
        <Card className="p-6 bg-white border-xevn-border shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${approved ? 'text-green-600' : 'text-xevn-text'}`}>
                <CheckCircle className="w-5 h-5" /> {approved ? "Đã duyệt bảng lương" : "Hoàn thành tính toán batch"}
              </h3>
              <p className="text-xs text-xevn-textSecondary mt-1 font-mono">Batch ID: {result.batch_id}</p>
            </div>
            {!approved && (
              <Button className="bg-green-600 hover:bg-green-700 text-white gap-2" onClick={handleApprove} disabled={approving}>
                {approving ? <><Loader2 className="w-4 h-4 animate-spin"/> Đang duyệt...</> : <><CheckCircle className="w-4 h-4"/> Duyệt bảng lương</>}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-xevn-surface border border-xevn-border rounded-xl p-5 text-center">
              <div className="text-4xl font-bold text-xevn-primary">{result.employee_count}</div>
              <div className="text-sm text-xevn-textSecondary mt-1">Nhân viên đã tính</div>
            </div>
            <div className="bg-xevn-surface border border-xevn-border rounded-xl p-5 text-center">
              <div className={`text-4xl font-bold ${(result.warnings ?? []).length > 0 ? 'text-amber-500' : 'text-slate-400'}`}>{(result.warnings ?? []).length}</div>
              <div className="text-sm text-xevn-textSecondary mt-1">Cảnh báo (Warnings)</div>
            </div>
            <div className={`border rounded-xl p-5 text-center ${approved ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className={`text-2xl font-bold mt-2 ${approved ? 'text-green-600' : 'text-blue-600'}`}>
                {approved ? "APPROVED" : "COMPLETED"}
              </div>
              <div className="text-sm text-xevn-textSecondary mt-1">Trạng thái Batch</div>
            </div>
          </div>

          {(result.warnings ?? []).length > 0 && (
            <div className="border border-amber-200 rounded-lg overflow-hidden">
              <button className="w-full bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 flex justify-between items-center" onClick={() => setShowWarnings(s => !s)}>
                <span>Có {(result.warnings ?? []).length} cảnh báo cần xem xét</span>
                {showWarnings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showWarnings && (
                <div className="p-4 bg-white max-h-60 overflow-y-auto space-y-2">
                  {(result.warnings ?? []).map((w, i) => (
                    <div key={i} className="text-sm text-amber-700 flex gap-2 items-start">
                      <span className="mt-0.5">⚠️</span> <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Payslip lookup */}
      <Card className="p-6 bg-white border-xevn-border shadow-sm">
        <h3 className="text-lg font-bold text-xevn-text mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-xevn-textSecondary" /> Tra cứu phiếu lương cá nhân
        </h3>
        <div className="flex gap-3 items-center flex-wrap">
          <Input placeholder="Nhập mã nhân viên (VD: LX-001)" className="w-64 bg-white" value={payslipEmpId} onChange={e => setPayslipEmpId(e.target.value)} />
          <Button variant="outline" className="border-xevn-primary text-xevn-primary hover:bg-xevn-primary/5" onClick={handleGetPayslip} disabled={loadingPayslip}>
            {loadingPayslip ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
            Tra cứu
          </Button>
        </div>
        {payslip && (
          <div className="mt-6 border-t border-xevn-border pt-6">
            <PayslipPanel payslip={payslip} />
          </div>
        )}
      </Card>
    </div>
  );
}
