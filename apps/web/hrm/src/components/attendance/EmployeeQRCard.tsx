import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { QrCode, Download, Printer, User, Building2, Briefcase } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useState, useRef } from 'react';

export function EmployeeQRCard() {
  const { employees } = useEmployees();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  const handleDownloadQR = () => {
    if (!selectedEmployee) return;

    const svg = document.getElementById('employee-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 380;
      
      if (ctx) {
        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // QR Code
        ctx.drawImage(img, 50, 20, 200, 200);
        
        // Employee info
        ctx.fillStyle = 'black';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(selectedEmployee.full_name, 150, 250);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText(selectedEmployee.employee_code, 150, 275);
        
        if (selectedEmployee.department) {
          ctx.fillText(selectedEmployee.department, 150, 300);
        }
        
        if (selectedEmployee.position) {
          ctx.fillText(selectedEmployee.position, 150, 325);
        }

        // Download
        const link = document.createElement('a');
        link.download = `QR-${selectedEmployee.employee_code}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrintQR = () => {
    if (!qrRef.current || !selectedEmployee) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${selectedEmployee.employee_code}</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .qr-card {
              text-align: center;
              padding: 20px;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              width: 280px;
            }
            .qr-code {
              margin: 20px 0;
            }
            .employee-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .employee-code {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 4px;
            }
            .employee-dept {
              font-size: 14px;
              color: #6b7280;
            }
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-card">
            <div class="qr-code">
              ${document.getElementById('employee-qr-code')?.outerHTML || ''}
            </div>
            <div class="employee-name">${selectedEmployee.full_name}</div>
            <div class="employee-code">${selectedEmployee.employee_code}</div>
            ${selectedEmployee.department ? `<div class="employee-dept">${selectedEmployee.department}</div>` : ''}
            ${selectedEmployee.position ? `<div class="employee-dept">${selectedEmployee.position}</div>` : ''}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <QrCode className="h-5 w-5 text-primary" />
          Mã QR nhân viên
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Employee Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Chọn nhân viên</Label>
          <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
            <SelectTrigger>
              <SelectValue placeholder="-- Chọn nhân viên để xem mã QR --" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{emp.employee_code}</span>
                    <span>-</span>
                    <span>{emp.full_name}</span>
                    {emp.department && (
                      <span className="text-muted-foreground">({emp.department})</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* QR Code Display */}
        {selectedEmployee && (
          <div
            ref={qrRef}
            className="flex flex-col items-center p-6 bg-white rounded-lg border"
          >
            <QRCodeSVG
              id="employee-qr-code"
              value={selectedEmployee.employee_code}
              size={200}
              level="H"
              includeMargin
              imageSettings={{
                src: selectedEmployee.avatar_url || '',
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
            <div className="mt-4 text-center">
              <div className="font-semibold text-lg">{selectedEmployee.full_name}</div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {selectedEmployee.employee_code}
                </span>
                {selectedEmployee.department && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {selectedEmployee.department}
                  </span>
                )}
                {selectedEmployee.position && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {selectedEmployee.position}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {selectedEmployee && (
          <div className="flex gap-3">
            <Button onClick={handleDownloadQR} variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Tải xuống
            </Button>
            <Button onClick={handlePrintQR} variant="outline" className="flex-1">
              <Printer className="mr-2 h-4 w-4" />
              In mã QR
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          <p className="mb-2">
            <strong>Hướng dẫn:</strong>
          </p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Mỗi nhân viên có một mã QR riêng dựa trên mã nhân viên</li>
            <li>In hoặc tải mã QR để nhân viên sử dụng khi chấm công</li>
            <li>Quét mã QR bằng camera để check-in/check-out nhanh</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
