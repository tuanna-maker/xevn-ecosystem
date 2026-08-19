/**
 * @CODE-MEMORY
 * Screen:                HRM Lương → Thiết lập lương → Loại quyết định (Wave 2)
 * UC:                    UC-HRM-DEC-01..02
 * SRS:                   docs/program/deltas/BA_HRM_DECISION_TYPE_SRS_01_20260813.md
 * TechSpec:              docs/program/deltas/BA_HRM_DECISION_TYPE_TECHSPEC_01_20260813.md
 * UI:                    docs/hrm/ui-screens/UI-HRM-DECISION-TYPE-01.md
 * WorkItem:              D-PO-HRM-DEC-TYPE-FE-01
 * solid_convention_ack:  Refactored to SOLID. Container screen consumes useDecisionTypes hook & CatalogHeaderBanner.
 */
import { useState } from 'react';
import { Search, Plus, FileCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useDecisionTypes } from './hooks/useDecisionTypes';
import { CatalogHeaderBanner } from './components/CatalogHeaderBanner';

export function DecisionTypesSetupScreen() {
  const {
    items,
    searchTerm,
    setSearchTerm,
    isAddDialogOpen,
    setIsAddDialogOpen,
    addExtensionItem,
  } = useDecisionTypes();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  const handleSave = () => {
    addExtensionItem(code, name);
    setCode('');
    setName('');
  };

  return (
    <div className="space-y-4" data-testid="decision-types-setup-screen">
      <CatalogHeaderBanner
        message={
          <>
            Danh mục Loại quyết định sử dụng cơ chế <strong>`hr_decision_types` Dual-SoT</strong>. Các
            loại quyết định chuẩn được ban hành từ Tập đoàn.
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-lg border">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm loại quyết định..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-sm"
            data-testid="search-decision-input"
          />
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setIsAddDialogOpen(true)}
          data-testid="btn-add-decision-type"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Bổ sung loại riêng
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left" data-testid="decision-types-table">
              <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3">Mã loại quyết định</th>
                  <th className="px-4 py-3">Tên loại quyết định</th>
                  <th className="px-4 py-3">Nguồn ban hành</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono font-medium">{item.code}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                    <td className="px-4 py-3">
                      {item.origin === 'holding' ? (
                        <Badge className="bg-sky-100 text-sky-800 border-sky-300">
                          <FileCheck className="mr-1 h-3 w-3 inline" /> Chuẩn Tập đoàn
                        </Badge>
                      ) : (
                        <Badge variant="outline">Mở rộng cục bộ</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="mr-1 h-3 w-3 inline" /> Hoạt động
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bổ sung Loại Quyết định Cục bộ</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Mã quyết định</label>
              <Input
                placeholder="VD: DEC_SPECIAL_ALLOWANCE"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tên hiển thị</label>
              <Input
                placeholder="VD: Quyết định Phụ cấp Đặc thù Chi nhánh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-sm mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleSave} data-testid="btn-save-decision-type">
              Lưu loại quyết định
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
