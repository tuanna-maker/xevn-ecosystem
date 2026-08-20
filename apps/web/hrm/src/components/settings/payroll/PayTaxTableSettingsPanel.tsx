// @CODE-MEMORY: Cấu hình Biểu thuế TNCN & Bảo hiểm xã hội.
// Cung cấp giao diện thiết lập các bậc thuế và mức trần bảo hiểm.
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-[12px] shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

export const PayTaxTableSettingsPanel = () => {
  const [activeTab, setActiveTab] = useState<'tax' | 'insurance'>('tax');

  // Default VN PIT brackets
  const [taxBrackets, setTaxBrackets] = useState([
    { level: 1, upTo: '5,000,000', rate: 5 },
    { level: 2, upTo: '10,000,000', rate: 10 },
    { level: 3, upTo: '18,000,000', rate: 15 },
    { level: 4, upTo: '32,000,000', rate: 20 },
    { level: 5, upTo: '52,000,000', rate: 25 },
    { level: 6, upTo: '80,000,000', rate: 30 },
    { level: 7, upTo: 'Trở lên', rate: 35 },
  ]);

  const [insuranceCaps, setInsuranceCaps] = useState({
    baseSalary: '2,340,000', // Lương cơ sở (Mới nhất)
    maxSi: '46,800,000', // 20 lần lương cơ sở
    maxHi: '46,800,000',
    maxUi: '93,600,000', // 20 lần lương tối thiểu vùng (Vùng 1: 4.68tr)
  });

  const handleSaveTax = () => {
    toast.success('Lưu cấu hình Biểu thuế thành công!');
  };

  const handleSaveInsurance = () => {
    toast.success('Lưu cấu hình Mức trần Bảo hiểm thành công!');
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Cấu hình Thuế & Bảo hiểm</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý biểu thuế TNCN lũy tiến và mức trần đóng BHXH.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('tax')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'tax' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Biểu thuế TNCN Lũy tiến
        </button>
        <button
          onClick={() => setActiveTab('insurance')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'insurance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Mức trần Bảo hiểm
        </button>
      </div>

      {activeTab === 'tax' && (
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500">
                  <th className="px-4 py-3 font-medium">Bậc</th>
                  <th className="px-4 py-3 font-medium">Phần thu nhập tính thuế/tháng (VNĐ)</th>
                  <th className="px-4 py-3 font-medium">Thuế suất (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {taxBrackets.map((bracket, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">Bậc {bracket.level}</td>
                    <td className="px-4 py-3">
                      {bracket.level === 7 ? (
                        <span>Trên 80,000,000</span>
                      ) : bracket.level === 1 ? (
                        <span>Đến {bracket.upTo}</span>
                      ) : (
                        <span>Trên {taxBrackets[idx - 1].upTo} đến {bracket.upTo}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-600">{bracket.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveTax} className="bg-blue-600 hover:bg-blue-700 rounded-lg">Lưu cấu hình</Button>
          </div>
        </div>
      )}

      {activeTab === 'insurance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6 max-w-2xl">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Mức lương cơ sở (VNĐ)</Label>
              <Input 
                value={insuranceCaps.baseSalary} 
                onChange={e => setInsuranceCaps({...insuranceCaps, baseSalary: e.target.value})} 
              />
              <span className="text-xs text-gray-500">Áp dụng từ 01/07/2024</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Trần đóng BHXH & BHYT (VNĐ)</Label>
              <Input 
                value={insuranceCaps.maxSi} 
                onChange={e => setInsuranceCaps({...insuranceCaps, maxSi: e.target.value, maxHi: e.target.value})} 
              />
              <span className="text-xs text-gray-500">20 lần mức lương cơ sở</span>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Trần đóng BHTN (VNĐ)</Label>
              <Input 
                value={insuranceCaps.maxUi} 
                onChange={e => setInsuranceCaps({...insuranceCaps, maxUi: e.target.value})} 
              />
              <span className="text-xs text-gray-500">20 lần mức lương tối thiểu vùng</span>
            </div>
          </div>
          <div className="flex justify-start">
            <Button onClick={handleSaveInsurance} className="bg-blue-600 hover:bg-blue-700 rounded-lg">Lưu cấu hình</Button>
          </div>
        </div>
      )}
    </Card>
  );
};
