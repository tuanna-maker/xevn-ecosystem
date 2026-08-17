/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → tab Gia đình (E24) · welfare dependents
 * UC:         UC-BP-CORE-01 · FR-UC-BP-CORE-01 Diễn biến #3–#4 · E24
 * BR:         BR-CORE-DEP-WELFARE · BR-CORE-FAMILY-≠-SALARY · BR-CORE-DEP-ONE
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-01 · AC-CORE-01-06/07
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md F-CORE-DEP-01
 * Purpose:    Người phụ thuộc → GET/POST/PATCH/soft-DELETE /api/hrm/employees/:id/dependents*;
 *             hiển thị relation_label + DOB dd/MM/yyyy; toast DEP-*; không mở vòng C&B.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-01-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    EmployeeProfile activeTab=family
 * Callees:    hrmApi list/create/update/softDeleteEmployeeDependent · empCorePublicRing · ViDateField
 * must_keep: SoftDel soft archive; Nest /employees path only; DENY Nest /core; family≠salary; U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-EMP-C
 * change_mode: UPGRADE
 * What: Labels/empty → text-xevn-textSecondary; blue/purple AI chrome → xevn DNA; KPI ops-dense
 * Why: ADR-20260805 §8–§10 · inventory W3-EMP-C
 * must_keep: SoftDel; navigate(/employees/:id); stub honesty; no OCR/QR invent; no Nest/seed; no Employees CLOSED
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-01-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Bind dependents to Nest F-CORE-DEP-01; relation_code picker + relation_label display;
 *       DOB via ViDateField (dd/MM/yyyy); emergency contact remains stub honesty (OUT this seat)
 * Why: API-01 CONFIRMED · O5/O6 · J-HRM-CORE-01-03
 * must_keep: SoftDel; /employees/:id/dependents* physical; CB-MAP; hire≠CORE DONE; U65; C-SLICE
 */

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Phone, Plus, Pencil, Trash2, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { formatDisplayDate } from '@/lib/formatDisplayDate';
import { toErrorMessage } from '@/lib/apiError';
import {
  CORE_DEP_RELATION_OPTIONS,
  resolveDependentRelationLabel,
} from '@/lib/empCorePublicRing';
import { ViDateField } from '@/components/ui/ViDateField';
import {
  createEmployeeDependent,
  listEmployeeDependents,
  softDeleteEmployeeDependent,
  updateEmployeeDependent,
  type HrmEmployeeDependentRecord,
} from '@/integrations/hrmApi';

interface EmployeeFamilyInfoProps {
  employeeId: string;
}

interface EmergencyContact {
  id: string;
  employee_id: string;
  company_id: string;
  name: string;
  relationship: string;
  phone: string;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface DependentFormData {
  relation_code: string;
  full_name: string;
  date_of_birth: string;
  is_tax_dependent: boolean;
}

interface EmergencyFormData {
  name: string;
  relationship: string;
  phone: string;
  is_primary: boolean;
}

const RELATIONSHIP_KEYS = [
  'father', 'mother', 'wife', 'husband', 'son', 'daughter',
  'brother', 'sisterOlder', 'brotherYounger', 'sisterYounger', 'grandfather', 'grandmother', 'other',
] as const;

const initialDependentForm: DependentFormData = {
  relation_code: '',
  full_name: '',
  date_of_birth: '',
  is_tax_dependent: false,
};

const initialEmergencyForm: EmergencyFormData = {
  name: '',
  relationship: '',
  phone: '',
  is_primary: false,
};

function unwrapDependentsList(raw: unknown): HrmEmployeeDependentRecord[] {
  if (Array.isArray(raw)) return raw as HrmEmployeeDependentRecord[];
  if (raw && typeof raw === 'object') {
    const o = raw as { data?: unknown; items?: unknown };
    if (Array.isArray(o.data)) return o.data as HrmEmployeeDependentRecord[];
    if (Array.isArray(o.items)) return o.items as HrmEmployeeDependentRecord[];
  }
  return [];
}

export function EmployeeFamilyInfo({ employeeId }: EmployeeFamilyInfoProps) {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  const relationshipOptions = RELATIONSHIP_KEYS.map((key) => ({
    value: t(`family.relationships.${key}`),
    label: t(`family.relationships.${key}`),
  }));

  const [isDependentDialogOpen, setIsDependentDialogOpen] = useState(false);
  const [editingDependent, setEditingDependent] = useState<HrmEmployeeDependentRecord | null>(null);
  const [dependentForm, setDependentForm] = useState<DependentFormData>(initialDependentForm);
  const [isDependentSubmitting, setIsDependentSubmitting] = useState(false);

  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [emergencyFormData, setEmergencyFormData] = useState<EmergencyFormData>(initialEmergencyForm);
  const [isEmergencySubmitting, setIsEmergencySubmitting] = useState(false);

  const {
    data: dependents = [],
    isLoading: isLoadingDependents,
  } = useQuery({
    queryKey: ['employee-dependents', employeeId, currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [] as HrmEmployeeDependentRecord[];
      const res = await listEmployeeDependents(employeeId, currentCompanyId);
      return unwrapDependentsList(res);
    },
    enabled: !!employeeId && !!currentCompanyId,
  });

  /** Emergency contacts — stub honesty (OUT CORE-01 seat; not F-CORE-DEP-01). */
  const { data: emergencyContacts, isLoading: isLoadingEmergency } = useQuery({
    queryKey: ['employee-emergency-contacts', employeeId],
    queryFn: async () => null as EmergencyContact[] | null,
    enabled: !!employeeId && !!currentCompanyId,
  });

  const handleOpenDependentDialog = (row?: HrmEmployeeDependentRecord) => {
    if (row) {
      setEditingDependent(row);
      setDependentForm({
        relation_code: row.relation_code || '',
        full_name: row.full_name || '',
        date_of_birth: (row.date_of_birth || '').slice(0, 10),
        is_tax_dependent: Boolean(row.is_tax_dependent),
      });
    } else {
      setEditingDependent(null);
      setDependentForm(initialDependentForm);
    }
    setIsDependentDialogOpen(true);
  };

  const handleCloseDependentDialog = () => {
    setIsDependentDialogOpen(false);
    setEditingDependent(null);
    setDependentForm(initialDependentForm);
  };

  const handleSaveDependent = async () => {
    if (!dependentForm.relation_code || !dependentForm.full_name.trim() || !dependentForm.date_of_birth) {
      toast.error(
        toErrorMessage(
          { code: 'HRM-CORE-DEP-VAL-400' },
          'Thiếu họ tên, quan hệ hoặc ngày sinh người phụ thuộc.',
        ),
      );
      return;
    }
    if (!currentCompanyId) {
      toast.error(t('commonEmployee.validation.noCompany'));
      return;
    }

    setIsDependentSubmitting(true);
    try {
      const payload = {
        full_name: dependentForm.full_name.trim(),
        relation_code: dependentForm.relation_code.trim().toLowerCase(),
        date_of_birth: dependentForm.date_of_birth.slice(0, 10),
        is_tax_dependent: dependentForm.is_tax_dependent,
      };
      if (editingDependent) {
        await updateEmployeeDependent(
          employeeId,
          editingDependent.id,
          currentCompanyId,
          payload,
        );
        toast.success(t('family.toast.updated', { defaultValue: 'Đã cập nhật người phụ thuộc' }));
      } else {
        await createEmployeeDependent(employeeId, currentCompanyId, payload);
        toast.success(t('family.toast.created', { defaultValue: 'Đã thêm người phụ thuộc' }));
      }
      await queryClient.invalidateQueries({
        queryKey: ['employee-dependents', employeeId, currentCompanyId],
      });
      handleCloseDependentDialog();
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, t('commonEmployee.error', { defaultValue: 'Không thể lưu' })));
    } finally {
      setIsDependentSubmitting(false);
    }
  };

  const handleDeleteDependent = async (row: HrmEmployeeDependentRecord) => {
    if (!confirm(t('family.confirmDelete', { defaultValue: 'Xóa mềm người phụ thuộc này?' }))) return;
    if (!currentCompanyId) {
      toast.error(t('commonEmployee.validation.noCompany'));
      return;
    }
    try {
      await softDeleteEmployeeDependent(employeeId, row.id, currentCompanyId);
      toast.success(t('family.toast.deleted', { defaultValue: 'Đã xóa người phụ thuộc' }));
      await queryClient.invalidateQueries({
        queryKey: ['employee-dependents', employeeId, currentCompanyId],
      });
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, t('commonEmployee.error', { defaultValue: 'Không thể xóa' })));
    }
  };

  const handleOpenEmergencyDialog = (contact?: EmergencyContact) => {
    if (contact) {
      setEditingContact(contact);
      setEmergencyFormData({
        name: contact.name,
        relationship: contact.relationship,
        phone: contact.phone,
        is_primary: contact.is_primary,
      });
    } else {
      setEditingContact(null);
      setEmergencyFormData(initialEmergencyForm);
    }
    setIsEmergencyDialogOpen(true);
  };

  const handleCloseEmergencyDialog = () => {
    setIsEmergencyDialogOpen(false);
    setEditingContact(null);
    setEmergencyFormData(initialEmergencyForm);
  };

  const handleSaveEmergencyContact = async () => {
    if (!emergencyFormData.name || !emergencyFormData.phone || !emergencyFormData.relationship) {
      toast.error(t('commonEmployee.validation.required'));
      return;
    }
    if (!currentCompanyId) {
      toast.error(t('commonEmployee.validation.noCompany'));
      return;
    }
    setIsEmergencySubmitting(true);
    try {
      // Stub honesty — emergency Nest SoT OUT this CORE-01 seat.
      toast.message(
        t('emergency.toast.stub', {
          defaultValue: 'Liên hệ khẩn cấp chưa gắn API Nest — dùng người phụ thuộc cho phúc lợi.',
        }),
      );
      handleCloseEmergencyDialog();
    } finally {
      setIsEmergencySubmitting(false);
    }
  };

  const handleDeleteEmergencyContact = async (_contact: EmergencyContact) => {
    if (!confirm(t('emergency.confirmDelete'))) return;
    toast.message(
      t('emergency.toast.stub', {
        defaultValue: 'Liên hệ khẩn cấp chưa gắn API Nest.',
      }),
    );
  };

  return (
    <div className="space-y-6" data-testid="emp-core-dependents-panel">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('family.title', { defaultValue: 'Người phụ thuộc' })}
          </CardTitle>
          <Button
            size="sm"
            onClick={() => handleOpenDependentDialog()}
            data-testid="emp-core-dependent-add"
          >
            <Plus className="w-4 h-4 mr-1" />
            {t('family.add', { defaultValue: 'Thêm' })}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingDependents ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-xevn-textSecondary" />
            </div>
          ) : !dependents.length ? (
            <div className="text-center py-8 text-xevn-textSecondary">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('family.empty', { defaultValue: 'Chưa có người phụ thuộc' })}</p>
              <p className="text-sm">
                {t('family.emptyHint', {
                  defaultValue: 'Thêm họ tên, quan hệ và ngày sinh (dd/MM/yyyy) cho phúc lợi / quà 1/6.',
                })}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('family.relationship', { defaultValue: 'Quan hệ' })}</TableHead>
                    <TableHead>{t('family.fullName', { defaultValue: 'Họ tên' })}</TableHead>
                    <TableHead>{t('family.dateOfBirth', { defaultValue: 'Ngày sinh' })}</TableHead>
                    <TableHead>{t('family.isDependant', { defaultValue: 'Phụ thuộc thuế' })}</TableHead>
                    <TableHead className="w-[100px]">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dependents.map((row) => (
                    <TableRow key={row.id} data-testid={`emp-core-dependent-row-${row.id}`}>
                      <TableCell className="font-medium">
                        {resolveDependentRelationLabel(row.relation_code, row.relation_label)}
                      </TableCell>
                      <TableCell>{row.full_name}</TableCell>
                      <TableCell>{formatDisplayDate(row.date_of_birth)}</TableCell>
                      <TableCell>
                        {row.is_tax_dependent ? (
                          <Badge variant="default" className="text-xs">
                            {t('family.yes', { defaultValue: 'Có' })}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {t('family.no', { defaultValue: 'Không' })}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleOpenDependentDialog(row)}
                            aria-label={t('common.edit')}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => void handleDeleteDependent(row)}
                            aria-label={t('common.delete')}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {t('emergency.title')}
          </CardTitle>
          <Button size="sm" onClick={() => handleOpenEmergencyDialog()}>
            <Plus className="w-4 h-4 mr-1" />
            {t('emergency.add')}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingEmergency ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-xevn-textSecondary" />
            </div>
          ) : !emergencyContacts?.length ? (
            <div className="text-center py-8 text-xevn-textSecondary">
              <Phone className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('emergency.empty')}</p>
              <p className="text-sm">{t('emergency.emptyHint')}</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="border rounded-lg p-4 hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{contact.name}</h4>
                      {contact.is_primary && (
                        <Badge variant="default" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          {t('emergency.primary')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-xevn-textSecondary">{contact.relationship}</p>
                  <p className="text-sm mt-1">{contact.phone}</p>
                  <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleOpenEmergencyDialog(contact)}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      {t('common.edit')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={() => void handleDeleteEmergencyContact(contact)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isDependentDialogOpen}
        onOpenChange={(open) => !open && handleCloseDependentDialog()}
      >
        <DialogContent className="max-w-lg" data-testid="emp-core-dependent-dialog">
          <DialogHeader>
            <DialogTitle>
              {editingDependent
                ? t('family.edit', { defaultValue: 'Sửa người phụ thuộc' })
                : t('family.addNew', { defaultValue: 'Thêm người phụ thuộc' })}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('family.relationship', { defaultValue: 'Quan hệ' })} *</Label>
                <Select
                  value={dependentForm.relation_code}
                  onValueChange={(value) =>
                    setDependentForm((prev) => ({ ...prev, relation_code: value }))
                  }
                >
                  <SelectTrigger data-testid="emp-core-dependent-relation">
                    <SelectValue placeholder={t('family.relationship')} />
                  </SelectTrigger>
                  <SelectContent>
                    {CORE_DEP_RELATION_OPTIONS.map((rel) => (
                      <SelectItem key={rel.code} value={rel.code}>
                        {rel.labelVi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('family.fullName', { defaultValue: 'Họ tên' })} *</Label>
                <Input
                  value={dependentForm.full_name}
                  onChange={(e) =>
                    setDependentForm((prev) => ({ ...prev, full_name: e.target.value }))
                  }
                  data-testid="emp-core-dependent-name"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t('family.dateOfBirth', { defaultValue: 'Ngày sinh' })} *</Label>
              <ViDateField
                value={dependentForm.date_of_birth}
                onValueChange={(iso) =>
                  setDependentForm((prev) => ({ ...prev, date_of_birth: iso }))
                }
                data-testid="emp-core-dependent-dob"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_tax_dependent"
                checked={dependentForm.is_tax_dependent}
                onCheckedChange={(c) =>
                  setDependentForm((prev) => ({ ...prev, is_tax_dependent: c === true }))
                }
              />
              <Label htmlFor="is_tax_dependent" className="font-normal">
                {t('family.isDependant', {
                  defaultValue: 'Đánh dấu phụ thuộc thuế (chi tiết GTCG = vòng C&B)',
                })}
              </Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleCloseDependentDialog}>
                {t('common.cancel')}
              </Button>
              <Button
                type="button"
                disabled={isDependentSubmitting}
                onClick={() => void handleSaveDependent()}
                data-testid="emp-core-dependent-save"
              >
                {isDependentSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t('common.save', { defaultValue: 'Lưu' })
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEmergencyDialogOpen}
        onOpenChange={(open) => !open && handleCloseEmergencyDialog()}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? t('emergency.edit') : t('emergency.addNew')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('emergency.name')} *</Label>
              <Input
                value={emergencyFormData.name}
                onChange={(e) =>
                  setEmergencyFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('family.relationship')} *</Label>
                <Select
                  value={emergencyFormData.relationship}
                  onValueChange={(value) =>
                    setEmergencyFormData((prev) => ({ ...prev, relationship: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('family.relationship')} />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map((rel) => (
                      <SelectItem key={rel.value} value={rel.value}>
                        {rel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('emergency.phone')} *</Label>
                <Input
                  value={emergencyFormData.phone}
                  onChange={(e) =>
                    setEmergencyFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_primary"
                checked={emergencyFormData.is_primary}
                onCheckedChange={(c) =>
                  setEmergencyFormData((prev) => ({ ...prev, is_primary: c === true }))
                }
              />
              <Label htmlFor="is_primary" className="font-normal">
                {t('emergency.primary')}
              </Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleCloseEmergencyDialog}>
                {t('common.cancel')}
              </Button>
              <Button
                type="button"
                disabled={isEmergencySubmitting}
                onClick={() => void handleSaveEmergencyContact()}
              >
                {isEmergencySubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t('common.save')
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
