import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Printer, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value);

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

  const grossSalary = employee.baseSalary + employee.allowances + employee.bonus;
  const totalDeductions = employee.insurance + employee.tax + employee.deductions;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Phiếu lương - ${employee.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              color: #1a1a1a;
            }
            .payslip {
              max-width: 800px;
              margin: 0 auto;
              border: 2px solid #10b981;
              border-radius: 12px;
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .company-info h1 { font-size: 20px; font-weight: 700; }
            .company-info p { font-size: 12px; opacity: 0.9; margin-top: 4px; }
            .payslip-title { text-align: right; }
            .payslip-title h2 { font-size: 24px; font-weight: 700; }
            .payslip-title p { font-size: 14px; opacity: 0.9; }
            .employee-section {
              background: #f0fdf4;
              padding: 20px 24px;
              border-bottom: 1px solid #d1fae5;
            }
            .employee-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
            }
            .employee-field label { 
              font-size: 11px; 
              color: #6b7280; 
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
              color: #374151;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 1px solid #e5e7eb;
            }
            .salary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 13px;
            }
            .salary-row.income .amount { color: #059669; }
            .salary-row.deduction .amount { color: #dc2626; }
            .salary-row .label { color: #4b5563; }
            .salary-row .amount { font-weight: 600; }
            .subtotal {
              background: #f9fafb;
              padding: 10px 12px;
              border-radius: 6px;
              margin-top: 8px;
              font-weight: 600;
            }
            .subtotal.income { background: #ecfdf5; color: #059669; }
            .subtotal.deduction { background: #fef2f2; color: #dc2626; }
            .net-salary-section {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 24px;
              text-align: center;
            }
            .net-salary-section h3 {
              font-size: 14px;
              font-weight: 600;
              opacity: 0.9;
              margin-bottom: 8px;
            }
            .net-salary-amount {
              font-size: 32px;
              font-weight: 700;
            }
            .footer {
              padding: 20px 24px;
              background: #f9fafb;
              border-top: 1px solid #e5e7eb;
            }
            .signatures {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 24px;
              text-align: center;
            }
            .signature-box h4 { font-size: 12px; font-weight: 600; color: #374151; }
            .signature-line {
              height: 60px;
              border-bottom: 1px dashed #9ca3af;
              margin: 12px 0 8px;
            }
            .signature-box p { font-size: 11px; color: #6b7280; }
            @media print {
              body { padding: 0; }
              .payslip { border: 1px solid #ccc; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
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

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const allPayslips = employees.map((emp, idx) => {
      const gross = emp.baseSalary + emp.allowances + emp.bonus;
      const deduct = emp.insurance + emp.tax + emp.deductions;
      return `
        <div class="payslip" style="page-break-after: always; margin-bottom: 40px;">
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
            ${emp.deductions > 0 ? `
            <div class="salary-row deduction">
              <span class="label">Khấu trừ khác</span>
              <span class="amount">-${formatNumber(emp.deductions)} ₫</span>
            </div>
            ` : ''}
            <div class="subtotal deduction">
              <div class="salary-row" style="padding: 0;">
                <span>Tổng khấu trừ</span>
                <span>-${formatNumber(deduct)} ₫</span>
              </div>
            </div>
          </div>
          <div class="net-salary-section">
            <h3>THỰC LÃNH</h3>
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
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Phiếu lương - Tất cả nhân viên</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              color: #1a1a1a;
            }
            .payslip {
              max-width: 800px;
              margin: 0 auto;
              border: 2px solid #10b981;
              border-radius: 12px;
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .company-info h1 { font-size: 20px; font-weight: 700; }
            .company-info p { font-size: 12px; opacity: 0.9; margin-top: 4px; }
            .payslip-title { text-align: right; }
            .payslip-title h2 { font-size: 24px; font-weight: 700; }
            .payslip-title p { font-size: 14px; opacity: 0.9; }
            .employee-section {
              background: #f0fdf4;
              padding: 20px 24px;
              border-bottom: 1px solid #d1fae5;
            }
            .employee-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
            }
            .employee-field label { 
              font-size: 11px; 
              color: #6b7280; 
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
              color: #374151;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 1px solid #e5e7eb;
            }
            .salary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 13px;
            }
            .salary-row.income .amount { color: #059669; }
            .salary-row.deduction .amount { color: #dc2626; }
            .salary-row .label { color: #4b5563; }
            .salary-row .amount { font-weight: 600; }
            .subtotal {
              background: #f9fafb;
              padding: 10px 12px;
              border-radius: 6px;
              margin-top: 8px;
              font-weight: 600;
            }
            .subtotal.income { background: #ecfdf5; color: #059669; }
            .subtotal.deduction { background: #fef2f2; color: #dc2626; }
            .net-salary-section {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 24px;
              text-align: center;
            }
            .net-salary-section h3 {
              font-size: 14px;
              font-weight: 600;
              opacity: 0.9;
              margin-bottom: 8px;
            }
            .net-salary-amount {
              font-size: 32px;
              font-weight: 700;
            }
            .footer {
              padding: 20px 24px;
              background: #f9fafb;
              border-top: 1px solid #e5e7eb;
            }
            .signatures {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 24px;
              text-align: center;
            }
            .signature-box h4 { font-size: 12px; font-weight: 600; color: #374151; }
            .signature-line {
              height: 60px;
              border-bottom: 1px dashed #9ca3af;
              margin: 12px 0 8px;
            }
            .signature-box p { font-size: 11px; color: #6b7280; }
            @media print {
              body { padding: 0; }
              .payslip { border: 1px solid #ccc; }
            }
          </style>
        </head>
        <body>
          ${allPayslips}
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

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : employees.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < employees.length - 1 ? prev + 1 : 0));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Xem trước phiếu lương</DialogTitle>
            <div className="flex items-center gap-2 mr-8">
              <Button variant="outline" size="sm" onClick={goToPrev} disabled={employees.length <= 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {currentIndex + 1} / {employees.length}
              </span>
              <Button variant="outline" size="sm" onClick={goToNext} disabled={employees.length <= 1}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Payslip Preview */}
        <div ref={printRef} className="payslip">
          <div className="border-2 border-emerald-500 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold">{companyName}</h1>
                  <p className="text-sm opacity-90">Phiếu lương nhân viên</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold">PHIẾU LƯƠNG</h2>
                  <p className="text-sm opacity-90">{salaryPeriod}</p>
                </div>
              </div>
            </div>

            {/* Employee Info */}
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 border-b border-emerald-100 dark:border-emerald-900">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Mã nhân viên</label>
                  <p className="font-semibold">{employee.code}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Họ và tên</label>
                  <p className="font-semibold">{employee.name}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Phòng ban</label>
                  <p className="font-semibold">{employee.department}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Vị trí</label>
                  <p className="font-semibold">{employee.position}</p>
                </div>
              </div>
            </div>

            {/* Salary Details */}
            <div className="p-6 space-y-6">
              {/* Income */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b">THU NHẬP</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lương cơ bản</span>
                    <span className="font-semibold text-emerald-600">{formatNumber(employee.baseSalary)} ₫</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phụ cấp</span>
                    <span className="font-semibold text-emerald-600">+{formatNumber(employee.allowances)} ₫</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Thưởng</span>
                    <span className="font-semibold text-emerald-600">+{formatNumber(employee.bonus)} ₫</span>
                  </div>
                  <div className="flex justify-between bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg mt-3">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">Tổng thu nhập</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatNumber(grossSalary)} ₫</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b">KHẤU TRỪ</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bảo hiểm xã hội, y tế, thất nghiệp</span>
                    <span className="font-semibold text-red-600">-{formatNumber(employee.insurance)} ₫</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Thuế thu nhập cá nhân</span>
                    <span className="font-semibold text-red-600">-{formatNumber(employee.tax)} ₫</span>
                  </div>
                  {employee.deductions > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Khấu trừ khác</span>
                      <span className="font-semibold text-red-600">-{formatNumber(employee.deductions)} ₫</span>
                    </div>
                  )}
                  <div className="flex justify-between bg-red-50 dark:bg-red-950/20 p-3 rounded-lg mt-3">
                    <span className="font-semibold text-red-700 dark:text-red-400">Tổng khấu trừ</span>
                    <span className="font-bold text-red-700 dark:text-red-400">-{formatNumber(totalDeductions)} ₫</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 text-center">
              <h3 className="text-sm font-semibold opacity-90 mb-2">THỰC LÃNH</h3>
              <div className="text-3xl font-bold">{formatNumber(employee.netSalary)} ₫</div>
            </div>

            {/* Signatures */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400">Người lập bảng</h4>
                  <div className="h-16 border-b border-dashed border-gray-300 dark:border-gray-600 my-3" />
                  <p className="text-xs text-muted-foreground">(Ký, ghi rõ họ tên)</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400">Kế toán trưởng</h4>
                  <div className="h-16 border-b border-dashed border-gray-300 dark:border-gray-600 my-3" />
                  <p className="text-xs text-muted-foreground">(Ký, ghi rõ họ tên)</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400">Giám đốc</h4>
                  <div className="h-16 border-b border-dashed border-gray-300 dark:border-gray-600 my-3" />
                  <p className="text-xs text-muted-foreground">(Ký, đóng dấu)</p>
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
          <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            In phiếu này
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
