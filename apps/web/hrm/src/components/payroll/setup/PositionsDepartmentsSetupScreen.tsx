import { useState, useMemo } from 'react';
import { Search, Plus, FolderTree, Building2, Briefcase } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDepartments } from '@/hooks/useDepartments';
import { usePayPositions, useDepartmentPositions } from '@/hooks/usePayPositions';
import { useGrades } from '@/hooks/useGrades';
import { useToast } from '@/hooks/use-toast';

export type PositionItem = {
  id: string;
  code: string;
  titleName: string;
  departmentId: string;
  departmentName: string;
  gradeCode: string;
  gradeName: string;
  status: string;
};

export function PositionsDepartmentsSetupScreen() {
  const { toast } = useToast();
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPosDialogOpen, setIsAddPosDialogOpen] = useState(false);

  // Form State
  const [posCode, setPosCode] = useState('');
  const [posTitle, setPosTitle] = useState('');
  const [posGradeCode, setPosGradeCode] = useState<string>('');

  const { departments, isLoading: deptsLoading } = useDepartments();
  const { positions: allPositions, createPosition, isLoading: posLoading } = usePayPositions();
  const { departmentPositions, isLoading: deptPosLoading } = useDepartmentPositions(
    selectedDeptId !== 'ALL' ? selectedDeptId : undefined
  );
  const { grades } = useGrades();

  // Build department tree
  const deptTree = useMemo(() => {
    const rootNodes = departments.filter(d => !d.parent_id);
    const getChildren = (parentId: string) => departments.filter(d => d.parent_id === parentId);
    
    return rootNodes.map(root => ({
      ...root,
      children: getChildren(root.id)
    }));
  }, [departments]);

  const displayPositions: PositionItem[] = useMemo(() => {
    let list: PositionItem[] = [];
    
    if (selectedDeptId === 'ALL') {
      list = allPositions.map(p => ({
        id: p.id,
        code: p.code,
        titleName: p.name,
        departmentId: 'ALL',
        departmentName: 'Toàn công ty',
        gradeCode: p.grade_code,
        gradeName: 'Ngạch ',
        status: p.status,
      }));
    } else {
      const selectedDept = departments.find(d => d.id === selectedDeptId);
      list = departmentPositions.map(p => ({
        id: p.id,
        code: p.position_code,
        titleName: p.effective_name,
        departmentId: p.department_id,
        departmentName: selectedDept?.name || 'Phòng ban',
        gradeCode: p.effective_grade_code,
        gradeName: 'Ngạch ',
        status: p.status,
      }));
    }

    return list.filter((pos) => {
      const search = searchTerm.toLowerCase();
      return (
        pos.code.toLowerCase().includes(search) ||
        pos.titleName.toLowerCase().includes(search)
      );
    });
  }, [selectedDeptId, allPositions, departmentPositions, searchTerm, departments]);

  const handleCreatePosition = async () => {
    if (!posCode || !posTitle || !posGradeCode) {
      toast({ title: 'Lỗi', description: 'Vui lòng điền đủ mã, tên và ngạch lương', variant: 'destructive' });
      return;
    }
    
    try {
      await createPosition.mutateAsync({
        code: posCode,
        name: posTitle,
        grade_code: posGradeCode,
        position_scope: 'company'
      });
      toast({ title: 'Thành công', description: 'Đã tạo chức danh mới' });
      setIsAddPosDialogOpen(false);
      setPosCode('');
      setPosTitle('');
      setPosGradeCode('');
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message || 'Không thể tạo chức danh', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4" data-testid="positions-departments-setup-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Pane: Department / Branch TreeView */}
        <div className="md:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <FolderTree className="h-4 w-4 text-primary" /> Cơ cấu Chi nhánh / Phòng ban
            </h3>
          </div>

          <Card>
            <CardContent className="p-2 space-y-1">
              {deptsLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Đang tải...</div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedDeptId('ALL')}
                    className="w-full text-left p-2.5 rounded-md transition-colors text-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">Toàn công ty</span>
                    </div>
                  </button>
                  
                  {deptTree.map((dept) => (
                    <div key={dept.id} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setSelectedDeptId(dept.id)}
                        className="w-full text-left p-2.5 rounded-md transition-colors text-sm flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Building2 className="h-4 w-4 shrink-0" />
                          <span className="truncate">{dept.name}</span>
                        </div>
                      </button>
                      
                      {dept.children.map(child => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => setSelectedDeptId(child.id)}
                          className="w-full text-left p-2.5 pl-8 rounded-md transition-colors text-sm flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="truncate">{child.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Pane: Position Table & Standard Grade Mapping */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-lg border">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm chức danh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-sm"
                data-testid="search-position-input"
              />
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsAddPosDialogOpen(true)}
              data-testid="btn-add-position"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Thêm chức danh
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left" data-testid="positions-table">
                  <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
                    <tr>
                      <th className="px-4 py-3">Mã chức danh</th>
                      <th className="px-4 py-3">Tên chức danh</th>
                      <th className="px-4 py-3">Đơn vị / Chi nhánh</th>
                      <th className="px-4 py-3">Ngạch lương Map (Bắt buộc)</th>
                      <th className="px-4 py-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(posLoading || deptPosLoading) ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Đang tải...</td></tr>
                    ) : displayPositions.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Không có chức danh nào</td></tr>
                    ) : displayPositions.map((pos) => (
                      <tr key={pos.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-mono font-medium">{pos.code}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{pos.titleName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{pos.departmentName}</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-sky-100 text-sky-800 border-sky-300 font-mono font-bold">
                            <Briefcase className="mr-1 h-3 w-3 inline" /> {pos.gradeCode}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full border">
                            {pos.status === 'active' ? 'Hoạt động' : 'Đã đóng'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Position Dialog with Mandatory Grade Mapping */}
      <Dialog open={isAddPosDialogOpen} onOpenChange={setIsAddPosDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo mới Chức danh (Bắt buộc Map Ngạch Lương)</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Mã Chức danh (Unique)</label>
              <Input
                placeholder="VD: POS_STAFF_SALES"
                value={posCode}
                onChange={(e) => setPosCode(e.target.value)}
                className="font-mono text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tên Chức danh</label>
              <Input
                placeholder="VD: Nhân viên Kinh doanh"
                value={posTitle}
                onChange={(e) => setPosTitle(e.target.value)}
                className="text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Ngạch lương chuẩn hóa <span className="text-rose-600 font-bold">* (NOT NULL)</span>
              </label>
              <Select value={posGradeCode} onValueChange={setPosGradeCode}>
                <SelectTrigger className="mt-1 font-mono">
                  <SelectValue placeholder="Chọn ngạch lương..." />
                </SelectTrigger>
                <SelectContent>
                  {grades?.map(g => (
                    <SelectItem key={g.id} value={g.grade_code}>{g.grade_code} - {g.grade_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddPosDialogOpen(false)} disabled={createPosition.isPending}>
              Hủy
            </Button>
            <Button type="button" onClick={handleCreatePosition} disabled={createPosition.isPending} data-testid="btn-save-position">
              {createPosition.isPending ? 'Đang lưu...' : 'Lưu chức danh'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
