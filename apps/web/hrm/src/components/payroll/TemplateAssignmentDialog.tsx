import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { hrmApi } from '@/integrations/hrmApi';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { toErrorMessage } from '@/lib/apiError';
import { Search, Loader2 } from 'lucide-react';

interface Employee {
  id: string;
  code: string;
  full_name: string;
  job_title?: string;
  department_name?: string;
}

interface TemplateAssignmentDialogProps {
  templateId: string | null;
  templateName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateAssignmentDialog({
  templateId,
  templateName,
  isOpen,
  onClose,
}: TemplateAssignmentDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());

  // Using tenant's global companyId or operating unit depending on context
  const { companyId, effectiveCompanyId } = useHrmOperatingUnitFilter();
  const activeCompanyId = effectiveCompanyId || companyId;

  // 1. Fetch assigned employees
  const { data: assignmentsData, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['template-assignments', templateId, activeCompanyId],
    queryFn: async () => {
      if (!templateId) return { data: [] };
      const res = await hrmApi.get(
        `/payroll/salary-templates/${templateId}/employees?company_id=${activeCompanyId}`
      );
      return res.data;
    },
    enabled: isOpen && !!templateId && !!activeCompanyId,
  });

  // 2. Fetch all employees to select from (simplified list)
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees-list', activeCompanyId],
    queryFn: async () => {
      const res = await hrmApi.get(`/employees?company_id=${activeCompanyId}&limit=500`);
      return res.data;
    },
    enabled: isOpen && !!activeCompanyId,
  });

  // Initialize selected set when assignments data changes
  useEffect(() => {
    if (assignmentsData?.data) {
      const assignedIds = new Set<string>();
      assignmentsData.data.forEach((a: any) => assignedIds.add(a.employee_id));
      setSelectedEmployeeIds(assignedIds);
    } else {
      setSelectedEmployeeIds(new Set());
    }
  }, [assignmentsData]);

  // Mutations
  const assignMutation = useMutation({
    mutationFn: async (employeeIds: string[]) => {
      return hrmApi.post(`/payroll/salary-templates/${templateId}/assign-employees`, {
        company_id: activeCompanyId,
        employee_ids: employeeIds,
      });
    },
    onSuccess: () => {
      toast.success('Đã lưu danh sách gán mẫu bảng lương');
      queryClient.invalidateQueries({ queryKey: ['template-assignments', templateId] });
      onClose();
    },
    onError: (err) => {
      toast.error(toErrorMessage(err));
    },
  });

  const handleSave = () => {
    if (!templateId) return;
    const ids = Array.from(selectedEmployeeIds);
    assignMutation.mutate(ids);
  };

  const handleToggle = (empId: string) => {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(empId)) {
        next.delete(empId);
      } else {
        next.add(empId);
      }
      return next;
    });
  };

  const employees = employeesData?.data || [];
  const filteredEmployees = employees.filter((emp: Employee) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (emp.code && emp.code.toLowerCase().includes(term)) ||
      (emp.full_name && emp.full_name.toLowerCase().includes(term))
    );
  });

  const handleSelectAll = () => {
    if (filteredEmployees.length === 0) return;
    const allSelected = filteredEmployees.every((emp: Employee) => selectedEmployeeIds.has(emp.id));
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        filteredEmployees.forEach((emp: Employee) => next.delete(emp.id));
      } else {
        filteredEmployees.forEach((emp: Employee) => next.add(emp.id));
      }
      return next;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gán nhân viên: {templateName}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm nhân viên theo mã, tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={
                  filteredEmployees.length > 0 &&
                  filteredEmployees.every((emp: Employee) => selectedEmployeeIds.has(emp.id))
                }
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="cursor-pointer">
                Chọn tất cả ({filteredEmployees.length})
              </Label>
            </div>
            <Badge variant="secondary">
              Đã chọn: {selectedEmployeeIds.size} / {employees.length}
            </Badge>
          </div>

          <ScrollArea className="flex-1 border rounded-md p-2">
            {isLoadingEmployees || isLoadingAssignments ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Đang tải dữ liệu...
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">Không tìm thấy nhân viên</div>
            ) : (
              <div className="grid grid-cols-1 gap-1">
                {filteredEmployees.map((emp: Employee) => (
                  <label
                    key={emp.id}
                    className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedEmployeeIds.has(emp.id)}
                      onCheckedChange={() => handleToggle(emp.id)}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {emp.code} - {emp.full_name}
                      </span>
                      {(emp.job_title || emp.department_name) && (
                        <span className="text-xs text-muted-foreground">
                          {[emp.job_title, emp.department_name].filter(Boolean).join(' • ')}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={assignMutation.isPending}>
            {assignMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Lưu gán nhân viên
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
