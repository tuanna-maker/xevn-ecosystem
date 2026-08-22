/**
 * @CODE-MEMORY
 * Screen:     HRM Lương → Thiết lập lương → Ngạch bậc lương (Wave 1)
 * UC:         UC-HRM-GRADE-01..02
 * SRS:        docs/program/deltas/BA_HRM_PAYROLL_GRADE_SRS_01_20260813.md
 * TechSpec:   docs/program/deltas/BA_HRM_PAYROLL_GRADE_TECHSPEC_01_20260813.md
 * UI:         docs/hrm/ui-screens/UI-HRM-PAYROLL-GRADE-01.md
 * WorkItem:   D-PO-HRM-PAY-GRADE-FE-01
 * Coded:      2026-08-13
 */
import { useState, useMemo } from 'react';
import { Search, Shield, CheckCircle2, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export type JobGradeStep = {
  stepNumber: number;
  salaryCoefficient: number;
  baseSalaryAmount: number;
};

export type JobGradeItem = {
  id: string;
  code: string;
  name: string;
  categoryGroup: string; // VD: Chuyên viên / Lái xe / Quản lý
  minRegionalWageFloor: number;
  status: 'active' | 'archived';
  steps: JobGradeStep[];
};

/** Seed data from Decision 2A (QĐ 2A) (11 grades D1 to E2) */
export const SAMPLE_GRADES: JobGradeItem[] = [
  {
    id: 'g1',
    code: 'D1',
    name: 'Ngạch D1 - Nhân viên nghiệp vụ phổ thông',
    categoryGroup: 'Nghiệp vụ',
    minRegionalWageFloor: 4960000,
    status: 'active',
    steps: [
      { stepNumber: 1, salaryCoefficient: 1.0, baseSalaryAmount: 4960000 },
      { stepNumber: 2, salaryCoefficient: 1.15, baseSalaryAmount: 5704000 },
      { stepNumber: 3, salaryCoefficient: 1.3, baseSalaryAmount: 6448000 },
    ],
  },
  {
    id: 'g2',
    code: 'D2',
    name: 'Ngạch D2 - Chuyên viên sơ cấp',
    categoryGroup: 'Chuyên viên',
    minRegionalWageFloor: 4960000,
    status: 'active',
    steps: [
      { stepNumber: 1, salaryCoefficient: 1.2, baseSalaryAmount: 5952000 },
      { stepNumber: 2, salaryCoefficient: 1.38, baseSalaryAmount: 6844800 },
      { stepNumber: 3, salaryCoefficient: 1.56, baseSalaryAmount: 7737600 },
    ],
  },
  {
    id: 'g3',
    code: 'E1',
    name: 'Ngạch E1 - Lái xe đường dài',
    categoryGroup: 'Lái xe',
    minRegionalWageFloor: 4960000,
    status: 'active',
    steps: [
      { stepNumber: 1, salaryCoefficient: 1.25, baseSalaryAmount: 6200000 },
      { stepNumber: 2, salaryCoefficient: 1.45, baseSalaryAmount: 7192000 },
      { stepNumber: 3, salaryCoefficient: 1.65, baseSalaryAmount: 8184000 },
    ],
  },
  {
    id: 'g4',
    code: 'E2',
    name: 'Ngạch E2 - Lái xe trung tâm / Đội trưởng',
    categoryGroup: 'Lái xe',
    minRegionalWageFloor: 4960000,
    status: 'active',
    steps: [
      { stepNumber: 1, salaryCoefficient: 1.4, baseSalaryAmount: 6944000 },
      { stepNumber: 2, salaryCoefficient: 1.62, baseSalaryAmount: 8035200 },
      { stepNumber: 3, salaryCoefficient: 1.84, baseSalaryAmount: 9126400 },
    ],
  },
];

export function PayrollGradeSetupScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState<string>(SAMPLE_GRADES[0].id);

  const filteredGrades = useMemo(() => {
    return SAMPLE_GRADES.filter(
      (g) =>
        g.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.categoryGroup.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  const selectedGrade = useMemo(() => {
    return SAMPLE_GRADES.find((g) => g.id === selectedGradeId) || SAMPLE_GRADES[0];
  }, [selectedGradeId]);

  return (
    <div className="space-y-4" data-testid="payroll-grade-setup-screen">
      {/* Readonly Banner for Member Tenant */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-sky-600 shrink-0" />
          <span>
            Danh mục Ngạch Bậc Lương được quản lý tập trung từ <strong>XBOS Holding Master</strong>.
            Đơn vị thành viên chỉ được đọc và áp dụng.
          </span>
        </div>
        <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-800">
          <Lock className="mr-1 h-3 w-3" /> Read-Only Scope
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left List: Grade Catalog */}
        <div className="md:col-span-1 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm ngạch bậc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-sm"
              data-testid="search-grade-input"
            />
          </div>

          <Card>
            <CardContent className="p-2 space-y-1">
              {filteredGrades.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGradeId(g.id)}
                  className={`w-full text-left p-2.5 rounded-md transition-colors text-sm flex items-center justify-between ${
                    selectedGradeId === g.id
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-muted text-foreground'
                  }`}
                  data-testid={`grade-item-${g.code}`}
                >
                  <div>
                    <div className="font-mono font-bold">{g.code}</div>
                    <div className="text-xs opacity-90 truncate max-w-[180px]">{g.name}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-normal shrink-0">
                    {g.categoryGroup}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Details: Steps Breakdown */}
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold font-mono text-foreground">{selectedGrade.code}</h2>
                    <Badge variant="outline">{selectedGrade.categoryGroup}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{selectedGrade.name}</p>
                </div>
                <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Đang áp dụng
                </span>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Bảng các Bậc Lương & Hệ số Lương
                </h3>
                <div className="overflow-x-auto border rounded-md">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
                      <tr>
                        <th className="px-4 py-2.5">Bậc lương</th>
                        <th className="px-4 py-2.5 text-center">Hệ số lương</th>
                        <th className="px-4 py-2.5 text-right">Lương cơ sở / Sàn (VNĐ)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedGrade.steps.map((st) => (
                        <tr key={st.stepNumber} className="hover:bg-muted/50">
                          <td className="px-4 py-2.5 font-medium">Bậc {st.stepNumber}</td>
                          <td className="px-4 py-2.5 text-center font-mono font-bold text-sky-700">
                            {st.salaryCoefficient.toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-emerald-700 font-semibold">
                            {st.baseSalaryAmount.toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-md text-xs text-muted-foreground space-y-1">
                <div>
                  • Sàn lương tối thiểu vùng (NĐ 293/2025/NĐ-CP):{' '}
                  <strong className="font-mono text-foreground">
                    {selectedGrade.minRegionalWageFloor.toLocaleString('vi-VN')} đ
                  </strong>
                </div>
                <div>• Mức lương bậc 1 đảm bảo không thấp hơn sàn tối thiểu vùng áp dụng cho chi nhánh.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
