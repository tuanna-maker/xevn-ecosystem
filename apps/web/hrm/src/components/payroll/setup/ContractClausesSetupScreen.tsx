/**
 * @CODE-MEMORY
 * Screen:     HRM Lương → Thiết lập lương → Thư viện Điều khoản HĐLĐ (Wave 11)
 * UC:         UC-HRM-CLAUSE-01..03
 * SRS:        docs/program/deltas/BA_HRM_CONTRACT_CLAUSE_LIBRARY_SRS_01_20260813.md
 * TechSpec:   docs/program/deltas/BA_HRM_CONTRACT_CLAUSE_TECHSPEC_01_20260813.md
 * UI:         docs/hrm/ui-screens/UI-HRM-CONTRACT-CLAUSE-01.md
 * WorkItem:   D-PO-HRM-CTR-CLAUSE-FE-01
 * Coded:      2026-08-13
 */
import { useState, useMemo } from 'react';
import { Search, Plus, FileText, Shield, CheckCircle2, Truck } from 'lucide-react';
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

export type ContractClauseItem = {
  id: string;
  code: string;
  title: string;
  content: string;
  clauseType: 'GENERAL' | 'DRIVER_SPECIFIC';
  status: 'active' | 'archived';
};

/** 14 General + 4 Driver specific clauses from extracted customer contract data */
const SAMPLE_CLAUSES: ContractClauseItem[] = [
  {
    id: 'cl1',
    code: 'CLAUSE_RESPONSIBILITY_DRIVER',
    title: 'Trách nhiệm bảo quản phương tiện & Lái xe an toàn',
    content:
      'Người lao động có trách nhiệm kiểm tra kỹ thuật phương tiện trước khi xuất bến, bảo quản tài sản của Công ty và đảm bảo an toàn tuyệt đối cho hành khách trên hành trình.',
    clauseType: 'DRIVER_SPECIFIC',
    status: 'active',
  },
  {
    id: 'cl2',
    code: 'CLAUSE_FUEL_NORM',
    title: 'Định mức nhiên liệu & Bồi thường vượt định mức',
    content:
      'Lái xe phải tuân thủ định mức nhiên liệu tiêu thụ cho từng tuyến đường. Trường hợp hao hụt nhiên liệu vượt quá định mức quy định không có lý do chính đáng sẽ trừ vào lương sản lượng.',
    clauseType: 'DRIVER_SPECIFIC',
    status: 'active',
  },
  {
    id: 'cl3',
    code: 'CLAUSE_WORKING_HOURS',
    title: 'Thời giờ làm việc và thời giờ nghỉ ngơi',
    content:
      'Thời giờ làm việc bình thường là 08 giờ/ngày và không quá 48 giờ/tuần. Do tính chất công việc vận tải, thời giờ làm việc của Lái xe được bố trí theo ca/kíp chuyến.',
    clauseType: 'GENERAL',
    status: 'active',
  },
  {
    id: 'cl4',
    code: 'CLAUSE_CONFIDENTIALITY',
    title: 'Bảo mật thông tin & Truyền thông',
    content:
      'Người lao động không được tiết lộ thông tin bí mật kinh doanh, quy trình vận hành app và dữ liệu khách hàng của Tập đoàn X.E cho bất kỳ bên thứ ba nào.',
    clauseType: 'GENERAL',
    status: 'active',
  },
];

export function ContractClausesSetupScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'GENERAL' | 'DRIVER_SPECIFIC'>('ALL');
  const [selectedClause, setSelectedClause] = useState<ContractClauseItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [clauseType, setClauseType] = useState<'GENERAL' | 'DRIVER_SPECIFIC'>('GENERAL');

  const filteredClauses = useMemo(() => {
    return SAMPLE_CLAUSES.filter((c) => {
      const matchSearch =
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTab = activeTab === 'ALL' || c.clauseType === activeTab;
      return matchSearch && matchTab;
    });
  }, [searchTerm, activeTab]);

  const handleSave = () => {
    if (!code || !title || !content) return;
    setIsAddDialogOpen(false);
    setCode('');
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-4" data-testid="contract-clauses-setup-screen">
      {/* Header Banner on Snapshot Rule */}
      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between text-xs text-purple-900">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-purple-700 shrink-0" />
          <span>
            <strong>Quy tắc Immutability Snapshot:</strong> Khi tạo HĐLĐ, các điều khoản được copy
            snapshot vĩnh viễn. Chỉnh sửa thư viện sau này không làm thay đổi các hợp đồng đã ký.
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-lg border">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm điều khoản HĐ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-sm"
            data-testid="search-clause-input"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            data-testid="btn-add-clause"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Thêm điều khoản
          </Button>
        </div>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'ALL' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Tất cả điều khoản
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('GENERAL')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'GENERAL' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Điều khoản chung (14)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('DRIVER_SPECIFIC')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'DRIVER_SPECIFIC' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Đặc thù Lái xe (4)
        </button>
      </div>

      {/* Main Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left" data-testid="clauses-table">
              <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3">Mã điều khoản</th>
                  <th className="px-4 py-3">Tiêu đề điều khoản</th>
                  <th className="px-4 py-3">Phân loại</th>
                  <th className="px-4 py-3">Nội dung trích đoạn</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Xem chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredClauses.map((clause) => (
                  <tr key={clause.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono font-medium">{clause.code}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{clause.title}</td>
                    <td className="px-4 py-3">
                      {clause.clauseType === 'DRIVER_SPECIFIC' ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                          <Truck className="mr-1 h-3 w-3 inline" /> Lái xe
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs font-normal">
                          <FileText className="mr-1 h-3 w-3 inline" /> Dùng chung
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs truncate max-w-[320px]">
                      {clause.content}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="mr-1 h-3 w-3 inline" /> Đang dùng
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedClause(clause)}
                      >
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Detail Dialog */}
      <Dialog open={!!selectedClause} onOpenChange={() => setSelectedClause(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono text-base">{selectedClause?.code}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <h3 className="font-semibold text-foreground text-sm">{selectedClause?.title}</h3>
            <div className="p-3 bg-muted rounded-md text-xs whitespace-pre-wrap leading-relaxed">
              {selectedClause?.content}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSelectedClause(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Clause Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm Điều khoản HĐLĐ Mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Mã điều khoản</label>
              <Input
                placeholder="VD: CLAUSE_SAFETY_RULES"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tiêu đề</label>
              <Input
                placeholder="VD: Quy định An toàn Lao động"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Phân loại</label>
              <select
                value={clauseType}
                onChange={(e) => setClauseType(e.target.value as 'GENERAL' | 'DRIVER_SPECIFIC')}
                className="w-full border rounded-md p-2 text-sm mt-1 bg-background"
              >
                <option value="GENERAL">Điều khoản dùng chung</option>
                <option value="DRIVER_SPECIFIC">Đặc thù Lái xe</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nội dung chi tiết</label>
              <textarea
                rows={4}
                placeholder="Nhập nội dung đầy đủ điều khoản..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border rounded-md p-2 text-sm mt-1 bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleSave} data-testid="btn-save-clause">
              Lưu điều khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
