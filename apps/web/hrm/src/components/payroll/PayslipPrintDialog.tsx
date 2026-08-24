/**
 * @CODE-MEMORY
 * Screen:     /payroll · In phiếu lương (modal)
 * UC:         UC-HRM-PAY · payslip print preview
 * Purpose:    Dialog xem trước + in phiếu lương — chrome Precision Motion;
 *             tiền vi-VN; cộng thu nhập/khấu trừ chỉ từ field batch (không invent công thức).
 * WorkItem:   PO-HRM-UI-BRAND-W4-PAY-A
 * Coded:      2026-08-05
 * Callers:    pages/Payroll.tsx → showPayslipPrintDialog
 * Callees:    Dialog foundation (4px brand bar / glass / wordmark)
 * must_keep:  formatCurrency/formatNumber vi-VN; netSalary từ employee; không seed;
 *             Face HOLD; Attendance not CLOSED; remaster DONE false
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-w4-pay-a.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-UI-BRAND-W4-PAY-A
 * change_mode: UPGRADE
 * What: Kill emerald AI print chrome → primary #1E40AF; sharp labels; DialogTitle ≥20;
 *       data-testid pay-payslip-print-dialog-precision
 * Why: ADR §16 LOCK · inventory P15 · B4 cấm AI palette
 * must_keep: vi-VN money; display sums only; Dialog foundation chrome
 */
import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, ChevronLeft, ChevronRight } from 'lucide-react';

interface PayrollEmployee {
  id: string;
  code: string;
  name: string;
  department: string;
  position: string;
  baseSalary: number;
  allowances: number;
  bonus: number;
  insurance: number;
  tax: number;
  deductions: number;
  netSalary: number;
}

interface PayslipPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: PayrollEmployee[];
  batchName: string;
  salaryPeriod: string;
  companyName?: string;
  initialEmployeeIndex?: number;
}

/** Display-only vi-VN currency — no payroll formula invent. */
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value);

/** Shared print stylesheet — Precision Motion brand (ADR §7 / §16). */
const PRINT_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Source Sans 3', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 20px;
    color: #111827;
  }
  .payslip {
    max-width: 800px;
    margin: 0 auto;
    border: 2px solid #1E40AF;
    border-radius: 12px;
    overflow: hidden;
  }
  .header {
    background: #1E40AF;
    color: #FFFFFF;
    padding: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .company-info h1 {
    font-family: Montserrat, 'Segoe UI', sans-serif;
    font-size: 20px;
    font-weight: 700;
  }
  .company-info p { font-size: 13px; color: #E5E7EB; margin-top: 4px; }
  .payslip-title { text-align: right; }
  .payslip-title h2 {
    font-family: Montserrat, 'Segoe UI', sans-serif;
    font-size: 24px;
    font-weight: 700;
  }
  .payslip-title p { font-size: 14px; color: #E5E7EB; }
  .employee-section {
    background: #F9FAFB;
    padding: 20px 24px;
    border-bottom: 1px solid #E5E7EB;
  }
  .employee-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .employee-field label {
    font-size: 11px;
    color: #4B5563;
    text-transform: uppercase;
    font-weight: 600;
  }
  .employee-field p {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin-top: 2px;
  }
  .salary-section { padding: 24px; }
  .salary-section h3 {
    font-size: 14px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #E5E7EB;
  }
  .salary-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 13px;
  }
  .salary-row.income .amount { color: #059669; }
  .salary-row.deduction .amount { color: #DC2626; }
  .salary-row .label { color: #4B5563; }
  .salary-row .amount { font-weight: 600; }
  .subtotal {
    background: #F9FAFB;
    padding: 10px 12px;
    border-radius: 6px;
    margin-top: 8px;
    font-weight: 600;
  }
  .subtotal.income { background: #ECFDF5; color: #059669; }
  .subtotal.deduction { background: #FEF2F2; color: #DC2626; }
  .net-salary-section {
    background: #1E40AF;
    color: #FFFFFF;
    padding: 24px;
    text-align: center;
  }
  .net-salary-section h3 {
    font-size: 14px;
    font-weight: 600;
    color: #E5E7EB;
    margin-bottom: 8px;
  }
  .net-salary-amount {
    font-family: Montserrat, 'Segoe UI', sans-serif;
    font-size: 32px;
    font-weight: 700;
  }
  .footer {
    padding: 20px 24px;
    background: #F9FAFB;
    border-top: 1px solid #E5E7EB;
  }
  .signatures {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    text-align: center;
  }
  .signature-box h4 { font-size: 12px; font-weight: 600; color: #111827; }
  .signature-line {
    height: 60px;
    border-bottom: 1px dashed #9CA3AF;
    margin: 12px 0 8px;
  }
  .signature-box p { font-size: 12px; color: #6B7280; }
  @media print {
    body { padding: 0; }
    .payslip { border: 1px solid #1E40AF; }
  }
`;

function buildPayslipHtml(
  emp: PayrollEmployee,
  companyName: string,
  salaryPeriod: string,
): string {
  const gross = emp.baseSalary + emp.allowances + emp.bonus;
  const deduct = emp.insurance + emp.tax + emp.deductions;
  return `
    <div class="payslip">
      <div class="header">
        <div class="company-info">
          <h1>${companyName}</h1>
          <p>Phiếu lương nhân viên</p>
        </div>
        <div class="payslip-title">
          <h2>PHIẾU LƯƠNG</h2>
          <p>${salaryPeriod}</p>
        </div>
      </div>
      <div class="employee-section">
        <div class="employee-grid">
          <div class="employee-field">
            <label>Mã nhân viên</label>
            <p>${emp.code}</p>
          </div>
          <div class="employee-field">
            <label>Họ và tên</label>
            <p>${emp.name}</p>
          </div>
          <div class="employee-field">
            <label>Phòng ban</label>
            <p>${emp.department}</p>
          </div>
          <div class="employee-field">
            <label>Vị trí</label>
            <p>${emp.position}</p>
          </div>
        </div>
      </div>
      <div class="salary-section">
        <h3>THU NHẬP</h3>
        <div class="salary-row income">
          <span class="label">Lương cơ bản</span>
          <span class="amount">${formatNumber(emp.baseSalary)} ₫</span>
        </div>
        <div class="salary-row income">
          <span class="label">Phụ cấp</span>
          <span class="amount">+${formatNumber(emp.allowances)} ₫</span>
        </div>
        <div class="salary-row income">
          <span class="label">Thưởng</span>
          <span class="amount">+${formatNumber(emp.bonus)} ₫</span>
        </div>
        <div class="subtotal income">
          <div class="salary-row" style="padding: 0;">
            <span>Tổng thu nhập</span>
            <span>${formatNumber(gross)} ₫</span>
          </div>
        </div>
      </div>
      <div class="salary-section" style="padding-top: 0;">
        <h3>KHẤU TRỪ</h3>
        <div class="salary-row deduction">
          <span class="label">Bảo hiểm xã hội, y tế, thất nghiệp</span>
          <span class="amount">-${formatNumber(emp.insurance)} ₫</span>
        </div>
        <div class="salary-row deduction">
          <span class="label">Thuế thu nhập cá nhân</span>
          <span class="amount">-${formatNumber(emp.tax)} ₫</span>
        </div>
        ${
          emp.deductions > 0
            ? `
        <div class="salary-row deduction">
          <span class="label">Khấu trừ khác</span>
          <span class="amount">-${formatNumber(emp.deductions)} ₫</span>
        </div>`
            : ''
        }
        <div class="subtotal deduction">
          <div class="salary-row" style="padding: 0;">
            <span>Tổng khấu trừ</span>
            <span>-${formatNumber(deduct)} ₫</span>
          </div>
        </div>
      </div>
      <div class="net-salary-section">
        <h3>THỰC LĨNH</h3>
        <div class="net-salary-amount">${formatNumber(emp.netSalary)} ₫</div>
      </div>
      <div class="footer">
        <div class="signatures">
          <div class="signature-box">
            <h4>Người lập bảng</h4>
            <div class="signature-line"></div>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
          <div class="signature-box">
            <h4>Kế toán trưởng</h4>
            <div class="signature-line"></div>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
          <div class="signature-box">
            <h4>Giám đốc</h4>
            <div class="signature-line"></div>
            <p>(Ký, đóng dấu)</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function PayslipPrintDialog({
  open,
  onOpenChange,
  employees,
  batchName,
  salaryPeriod,
  companyName = 'Công ty Cổ phần UNICOM',
  initialEmployeeIndex = 0,
}: PayslipPrintDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(initialEmployeeIndex);
  const printRef = useRef<HTMLDivElement>(null);

  const employee = employees[currentIndex];

  if (!employee) return null;

  // Display-only rollups from batch fields — not a salary formula engine.
  const grossSalary = employee.baseSalary + employee.allowances + employee.bonus;
  const totalDeductions = employee.insurance + employee.tax + employee.deductions;

  const openPrintWindow = (title: string, bodyHtml: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>${PRINT_STYLES}</style>
        </head>
        <body>
          ${bodyHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    openPrintWindow(`Phiếu lương - ${employee.name}`, printContent.innerHTML);
  };

  const handlePrintAll = () => {
    const allPayslips = employees
      .map((emp) => buildPayslipHtml(emp, companyName, salaryPeriod))
      .join('<div style="page-break-after: always; height: 24px;"></div>');
    openPrintWindow('Phiếu lương - Tất cả nhân viên', allPayslips);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : employees.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < employees.length - 1 ? prev + 1 : 0));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        data-testid="pay-payslip-print-dialog-precision"
      >
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="xevn-type-title text-[20px] font-bold font-display text-xevn-text">
              Xem trước phiếu lương
              {batchName ? (
                <span className="ml-2 text-sm font-medium text-xevn-textSecondary font-sans">
                  · {batchName}
                </span>
              ) : null}
            </DialogTitle>
            <div className="flex items-center gap-2 mr-8">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrev}
                disabled={employees.length <= 1}
                aria-label="Phiếu trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-xevn-textSecondary px-2 tabular-nums">
                {currentIndex + 1} / {employees.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                disabled={employees.length <= 1}
                aria-label="Phiếu sau"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div ref={printRef} className="payslip">
          <div className="border-2 border-xevn-primary rounded-xl overflow-hidden">
            <div className="bg-xevn-primary text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-[20px] font-bold font-display">{companyName}</h1>
                  <p className="text-sm text-white/90 mt-1">Phiếu lương nhân viên</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold font-display">PHIẾU LƯƠNG</h2>
                  <p className="text-sm text-white/90 mt-1">{salaryPeriod}</p>
                </div>
              </div>
            </div>

            <div className="bg-xevn-background p-5 border-b border-xevn-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-xevn-textSecondary uppercase font-semibold">
                    Mã nhân viên
                  </label>
                  <p className="font-semibold text-xevn-text">{employee.code}</p>
                </div>
                <div>
                  <label className="text-xs text-xevn-textSecondary uppercase font-semibold">
                    Họ và tên
                  </label>
                  <p className="font-semibold text-xevn-text">{employee.name}</p>
                </div>
                <div>
                  <label className="text-xs text-xevn-textSecondary uppercase font-semibold">
                    Phòng ban
                  </label>
                  <p className="font-semibold text-xevn-text">{employee.department}</p>
                </div>
                <div>
                  <label className="text-xs text-xevn-textSecondary uppercase font-semibold">
                    Vị trí
                  </label>
                  <p className="font-semibold text-xevn-text">{employee.position}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-xevn-text mb-3 pb-2 border-b border-xevn-border">
                  THU NHẬP
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-xevn-textSecondary">Lương cơ bản</span>
                    <span className="font-semibold text-success">
                      {formatNumber(employee.baseSalary)} ₫
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-xevn-textSecondary">Phụ cấp</span>
                    <span className="font-semibold text-success">
                      +{formatNumber(employee.allowances)} ₫
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-xevn-textSecondary">Thưởng</span>
                    <span className="font-semibold text-success">
                      +{formatNumber(employee.bonus)} ₫
                    </span>
                  </div>
                  <div className="flex justify-between bg-success/10 p-3 rounded-lg mt-3">
                    <span className="font-semibold text-success">Tổng thu nhập</span>
                    <span className="font-bold text-success">
                      {formatNumber(grossSalary)} ₫
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-xevn-text mb-3 pb-2 border-b border-xevn-border">
                  KHẤU TRỪ
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-xevn-textSecondary">
                      Bảo hiểm xã hội, y tế, thất nghiệp
                    </span>
                    <span className="font-semibold text-destructive">
                      -{formatNumber(employee.insurance)} ₫
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-xevn-textSecondary">Thuế thu nhập cá nhân</span>
                    <span className="font-semibold text-destructive">
                      -{formatNumber(employee.tax)} ₫
                    </span>
                  </div>
                  {employee.deductions > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-xevn-textSecondary">Khấu trừ khác</span>
                      <span className="font-semibold text-destructive">
                        -{formatNumber(employee.deductions)} ₫
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between bg-destructive/10 p-3 rounded-lg mt-3">
                    <span className="font-semibold text-destructive">Tổng khấu trừ</span>
                    <span className="font-bold text-destructive">
                      -{formatNumber(totalDeductions)} ₫
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-xevn-primary text-white p-6 text-center">
              <h3 className="text-sm font-semibold text-white/90 mb-2">THỰC LĨNH</h3>
              <div className="text-3xl font-bold font-display">
                {formatNumber(employee.netSalary)} ₫
              </div>
              <p className="sr-only">{formatCurrency(employee.netSalary)}</p>
            </div>

            <div className="p-6 bg-xevn-background border-t border-xevn-border">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <h4 className="text-sm font-semibold text-xevn-text">Người lập bảng</h4>
                  <div className="h-16 border-b border-dashed border-xevn-border my-3" />
                  <p className="text-sm text-xevn-textMuted">(Ký, ghi rõ họ tên)</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-xevn-text">Kế toán trưởng</h4>
                  <div className="h-16 border-b border-dashed border-xevn-border my-3" />
                  <p className="text-sm text-xevn-textMuted">(Ký, ghi rõ họ tên)</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-xevn-text">Giám đốc</h4>
                  <div className="h-16 border-b border-dashed border-xevn-border my-3" />
                  <p className="text-sm text-xevn-textMuted">(Ký, đóng dấu)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button variant="outline" className="gap-2" onClick={handlePrintAll}>
            <Printer className="w-4 h-4" />
            In tất cả ({employees.length} phiếu)
          </Button>
          <Button className="gap-2 bg-xevn-primary hover:bg-xevn-primary/90 text-white" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            In phiếu này
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
