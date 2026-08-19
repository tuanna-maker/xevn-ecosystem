/**
 * @CODE-MEMORY
 * Screen:     HRM Lương → Thiết lập lương → Chức danh & Phòng ban/Chi nhánh (Wave 3)
 * UC:         UC-HRM-DEPT-01, UC-HRM-POS-01
 * SRS:        docs/program/deltas/BA_HRM_POSITION_DEPARTMENT_SRS_01_20260813.md
 * TechSpec:   docs/program/deltas/BA_HRM_POSITION_DEPARTMENT_TECHSPEC_01_20260813.md
 * UI:         docs/hrm/ui-screens/UI-HRM-POSITION-DEPARTMENT-01.md
 * WorkItem:   D-PO-HRM-POS-DEPT-FE-01
 * Coded:      2026-08-13
 */
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

export type DepartmentTreeItem = {
  id: string;
  code: string;
  name: string;
  regionCode: string;
  parentId?: string;
  children?: DepartmentTreeItem[];
};

export type PositionItem = {
  id: string;
  code: string;
  titleName: string;
  departmentId: string;
  departmentName: string;
  gradeCode: string; // MUST NOT BE NULL
  gradeName: string;
  status: 'active' | 'archived';
};

const SAMPLE_DEPARTMENTS: DepartmentTreeItem[] = [
  {
    id: 'd1',
    code: 'DEPT_HOLDING',
    name: 'Tập đoàn X.E Việt Nam',
    regionCode: 'VUNG_1',
    children: [
      { id: 'd2', code: 'DEPT_NAM_DINH', name: 'Chi nhánh Nam Định', regionCode: 'VUNG_2', parentId: 'd1' },
      { id: 'd3', code: 'DEPT_NINH_BINH', name: 'Chi nhánh Ninh Bình', regionCode: 'VUNG_3', parentId: 'd1' },
      { id: 'd4', code: 'DEPT_THAI_BINH', name: 'Chi nhánh Thái Bình', regionCode: 'VUNG_3', parentId: 'd1' },
      { id: 'd5', code: 'DEPT_FLEET_OPS', name: 'Phòng Vận tải & Đội xe', regionCode: 'VUNG_1', parentId: 'd1' },
    ],
  },
];

const SAMPLE_POSITIONS: PositionItem[] = [
  { id: 'p1', code: 'POS_DRIVER_MAIN', titleName: 'Lái xe đường dài', departmentId: 'd5', departmentName: 'Phòng Vận tải & Đội xe', gradeCode: 'E1', gradeName: 'Ngạch E1 - Lái xe đường dài', status: 'active' },
  { id: 'p2', code: 'POS_LEADER_FLEET', titleName: 'Đội trưởng Đội xe', departmentId: 'd5', departmentName: 'Phòng Vận tải & Đội xe', gradeCode: 'E2', gradeName: 'Ngạch E2 - Lái xe trung tâm / Đội trưởng', status: 'active' },
  { id: 'p3', code: 'POS_STAFF_ND', titleName: 'Nhân viên kinh doanh Nam Định', departmentId: 'd2', departmentName: 'Chi nhánh Nam Định', gradeCode: 'D1', gradeName: 'Ngạch D1 - Nhân viên nghiệp vụ phổ thông', status: 'active' },
  { id: 'p4', code: 'POS_SPECIALIST_NB', titleName: 'Chuyên viên điều hành Ninh Bình', departmentId: 'd3', departmentName: 'Chi nhánh Ninh Bình', gradeCode: 'D2', gradeName: 'Ngạch D2 - Chuyên viên sơ cấp', status: 'active' },
];

export function PositionsDepartmentsSetupScreen() {
  const [selectedDeptId, setSelectedDeptId] = useState<string>('d1');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPosDialogOpen, setIsAddPosDialogOpen] = useState(false);

  // Form State
  const [posCode, setPosCode] = useState('');
  const [posTitle, setPosTitle] = useState('');
  const [posGradeCode, setPosGradeCode] = useState<string>('D1'); // Grade MUST NOT be null

  const filteredPositions = useMemo(() => {
    return SAMPLE_POSITIONS.filter((pos) => {
      const matchSearch =
        pos.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pos.titleName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = selectedDeptId === 'd1' || pos.departmentId === selectedDeptId;
      return matchSearch && matchDept;
    });
  }, [searchTerm, selectedDeptId]);

  const handleCreatePosition = () => {
    if (!posCode || !posTitle || !posGradeCode) return;
    setIsAddPosDialogOpen(false);
    setPosCode('');
    setPosTitle('');
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
              {SAMPLE_DEPARTMENTS[0].children?.map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`w-full text-left p-2.5 rounded-md transition-colors text-sm flex items-center justify-between ${
                    selectedDeptId === dept.id
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-muted text-foreground'
                  }`}
                  data-testid={`dept-node-${dept.code}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span className="truncate">{dept.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                    {dept.regionCode}
                  </Badge>
                </button>
              ))}
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
                    {filteredPositions.map((pos) => (
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
                          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Hoạt động
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="D1">D1 - Nhân viên nghiệp vụ phổ thông</SelectItem>
                  <SelectItem value="D2">D2 - Chuyên viên sơ cấp</SelectItem>
                  <SelectItem value="E1">E1 - Lái xe đường dài</SelectItem>
                  <SelectItem value="E2">E2 - Lái xe trung tâm / Đội trưởng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddPosDialogOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleCreatePosition} data-testid="btn-save-position">
              Lưu chức danh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
