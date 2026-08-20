// @CODE-MEMORY: Cấu hình Mẫu Phiếu Lương (Payslip Template).
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-[12px] shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

export const PayPaySlipTemplateSettingsPanel = () => {
  const [settings, setSettings] = useState({
    showLogo: true,
    hideZeroValues: true,
    showCompanyStamp: false,
    footerNote: 'Trân trọng cảm ơn sự đóng góp của anh/chị. Mọi thắc mắc về phiếu lương vui lòng liên hệ phòng Nhân sự qua email hr@xevn.com trong vòng 3 ngày làm việc.',
    layoutType: 'email_modern',
  });

  const handleSave = () => {
    // In a real app, dispatch to a generic settings API
    toast.success('Lưu cấu hình Mẫu phiếu lương thành công!');
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Mẫu Phiếu Lương (Payslip)</h2>
          <p className="text-sm text-gray-500 mt-1">Cấu hình hiển thị phiếu lương gửi cho nhân viên qua Email và App.</p>
        </div>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 rounded-lg">
          Lưu cấu hình
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Config Form */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Tùy chọn hiển thị</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Hiển thị Logo công ty</Label>
                <div className="text-xs text-gray-500">Logo lấy từ Cấu hình Thương hiệu</div>
              </div>
              <Switch 
                checked={settings.showLogo} 
                onCheckedChange={(c) => setSettings({...settings, showLogo: c})} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Ẩn các khoản bằng 0đ</Label>
                <div className="text-xs text-gray-500">Giúp phiếu lương gọn gàng hơn</div>
              </div>
              <Switch 
                checked={settings.hideZeroValues} 
                onCheckedChange={(c) => setSettings({...settings, hideZeroValues: c})} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Hiển thị con dấu công ty</Label>
                <div className="text-xs text-gray-500">Gắn ảnh con dấu ở cuối phiếu</div>
              </div>
              <Switch 
                checked={settings.showCompanyStamp} 
                onCheckedChange={(c) => setSettings({...settings, showCompanyStamp: c})} 
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Bố cục Phiếu lương</h3>
            <RadioGroup 
              value={settings.layoutType} 
              onValueChange={(v) => setSettings({...settings, layoutType: v})}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="email_modern" id="email_modern" />
                <Label htmlFor="email_modern" className="flex-1 cursor-pointer">Giao diện hiện đại (Web/Email)</Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="print_a4" id="print_a4" />
                <Label htmlFor="print_a4" className="flex-1 cursor-pointer">Giao diện in A4 truyền thống</Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="print_a5" id="print_a5" />
                <Label htmlFor="print_a5" className="flex-1 cursor-pointer">Giao diện in A5 ngang (Mật mã xé)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Ghi chú chân trang</Label>
            <Textarea 
              value={settings.footerNote}
              onChange={(e) => setSettings({...settings, footerNote: e.target.value})}
              className="h-24 text-sm"
            />
            <p className="text-xs text-gray-500">Thông báo này sẽ xuất hiện dưới cùng của mọi phiếu lương.</p>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col items-center">
          <h3 className="text-sm font-medium text-gray-500 mb-4 self-start">Xem trước (Preview)</h3>
          
          <div className="bg-white w-full max-w-sm rounded-lg shadow-sm border border-gray-200 p-5 scale-90 origin-top">
            <div className="flex justify-between items-start mb-4 border-b pb-4">
              {settings.showLogo ? (
                <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                  XeVN
                </div>
              ) : <div />}
              <div className="text-right">
                <h4 className="font-bold text-gray-900 text-sm">PHIẾU LƯƠNG</h4>
                <p className="text-xs text-gray-500">Tháng 08/2026</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold">Nguyễn Văn A - Lái xe hạng D</p>
              <p className="text-xs text-gray-500">Mã NV: EMP-1020</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Lương cơ bản</span>
                <span className="font-medium">10,000,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phụ cấp</span>
                <span className="font-medium">2,000,000</span>
              </div>
              {!settings.hideZeroValues && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Thưởng</span>
                  <span className="font-medium text-gray-400">0</span>
                </div>
              )}
              <div className="flex justify-between text-red-600">
                <span>Khấu trừ (BHXH, Thuế)</span>
                <span>-1,200,000</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t flex justify-between items-center">
              <span className="font-bold text-sm text-gray-900">THỰC LÃNH</span>
              <span className="font-bold text-lg text-blue-600">10,800,000</span>
            </div>

            <div className="mt-6 text-[10px] text-gray-400 italic text-center leading-relaxed">
              {settings.footerNote}
            </div>

            {settings.showCompanyStamp && (
              <div className="mt-4 flex justify-end">
                <div className="w-16 h-16 border-2 border-red-500 text-red-500 rounded-full flex items-center justify-center text-[8px] font-bold rotate-[-15deg] opacity-70">
                  XeVN STAMP
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
