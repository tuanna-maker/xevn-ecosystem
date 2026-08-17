/**
 * @CODE-MEMORY
 * Screen:     /insurance — chính sách BH master (E3)
 * UC:         FR-HRM-INS-DEPTH-E3-01 · AC-INS-01..05 · AC-E3-ZOD-I-01 · AC-PLT-SI-INS-01 · AC-PLT-SI-INSURER-01
 * BR:         BR-HRM-INS-E3-01/03 · BR-HRM-E3-U72-01 · BR-PLT-SI-INS-05 · BR-PLT-SI-INR-05
 * SRS:        docs/program/deltas/BA_ERP_E3_SRS_01_20260728.md · PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01 · SI-INSURER-CATALOG-BA-01
 * TechSpec:   docs/hrm/API_DESIGN_HRM_ERP_E3.md §6–10 · F-SI-CAT-EFF-01 · F-SI-CAT-INS-EFF-01
 * Purpose:    CRUD policy master + insurer Nest EFF + type Nest EFF picker + SM buttons U72 + Empty+CTA.
 * WorkItem:   D-FE-ERP-E3-01
 * Coded:      2026-07-28
 * Callers:    pages/Insurance.tsx
 * Callees:    create/list/update/deleteInsurancePolicy · CatalogSearchPicker · EmptyState · Zod schema
 * Impact:     Free-text insurer SoT / illegal SM UI → FAIL AC-INS
 * must_keep:  E1 pickers · E2 pay_types/contract_types · participant AddInsuranceDialog riêng · CTR seals · SI type L1 RETAIN
 * SOLID:      Panel tách khỏi list participant
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-BF-03-BH-FE-PICKER-01
 * change_mode: ADD
 * What: id anchor insurance-policy-master-e3 cho CTA «Tạo chính sách BH» từ AddInsuranceDialog
 * Why: TC-049 UAT 0 active — FE-only tạo+kích hoạt trước enroll (U65 no seed)
 * must_keep: CRUD/SM policy; SoftDel/Employees untouched
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-BF-03-BH-POL-DTO-01
 * change_mode: FIX
 * What: create omit insurer_label; SM/update PATCH body không company_id (query trên hrmApi)
 * Why: QA R-INS-POL-CREATE-LABEL-01 / R-INS-POL-SM-COMPANYID-01 → 400 HRM-VAL-001
 * must_keep: TC-049 enroll picker · SoftDel · TC-025/041 · BE soft-resolve
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-FE-01
 * change_mode: FIX
 * What: insurance_type picker binds GET /contracts-insurance/insurance-types/effective; empty CTA → Settings Loại BH
 * Why: AC-PLT-SI-INS-01/01c · VAL-SI-CNS-04 — REJECT Settings MD sole SoT; insurers OUT retain MD
 * Spec: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01 §4 S-SI-CNS-01
 * must_keep: enrollment ONE SoT · CTR legal-print · U65 · printable/personnel false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-FE-01
 * change_mode: FIX
 * What: insurer_key picker binds GET /contracts-insurance/insurers/effective; empty CTA → Settings Nhà BH
 * Why: AC-PLT-SI-INSURER-01/01c · VAL-SI-INR-CNS-01 — REJECT Settings MD sole SoT; SI type L1 RETAIN
 * Spec: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01 §4 S-SI-INR-CNS-01
 * must_keep: type EFF picker · enrollment/CTR seals · U65 · printable/personnel false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-fe-01.md
 */
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { EmptyState } from '@/components/hrm/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useSiInsuranceTypesEffective } from '@/hooks/useSiInsuranceTypesEffective';
import { useSiInsurersEffective } from '@/hooks/useSiInsurersEffective';
import {
  createInsurancePolicy,
  deleteInsurancePolicy,
  listInsurancePolicies,
  updateInsurancePolicy,
  type HrmInsurancePolicy,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import { formatDisplayDate } from '@/lib/formatDisplayDate';
import { hrmPathWithEmbedSearch } from '@/lib/hrmEmbedNavigation';
import { resolveInsurancePolicyStatusDisplay } from '@/lib/labelMaps';
import {
  createInsurancePolicyFormSchema,
  type InsurancePolicyFormValues,
} from '@/lib/insurancePolicyFormSchema';
import {
  buildInsurancePolicyCreateBody,
  buildInsurancePolicyStatusPatchBody,
  buildInsurancePolicyUpdateBody,
} from '@/lib/insurancePolicyPayload';
import { resolveSiInsurerLabel } from '@/lib/siInsurerCatalog';
import { resolveSiInsuranceTypeLabel } from '@/lib/siInsuranceTypeCatalog';
import {
  nextInsurancePolicyStatuses,
  type InsurancePolicyStatus,
} from '@/lib/statusMachineE3';
import { toast } from 'sonner';

const POLICY_MSG = {
  codeRequired: 'Nhập mã chính sách',
  nameRequired: 'Nhập tên chính sách',
  insurerRequired: 'Chọn nhà bảo hiểm',
  insurerNotInCatalog: 'Chọn nhà BH từ catalog Nest (Cài đặt → Nhà BH / Insurers)',
  typeRequired: 'Chọn loại bảo hiểm',
  typeNotInCatalog: 'Chọn loại BH từ catalog Nest (Cài đặt → Loại BH / SI type)',
  effectiveRequired: 'Chọn ngày hiệu lực',
  dateOrder: 'Ngày hết hạn phải sau ngày hiệu lực',
};

export function InsurancePolicyMasterPanel() {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<HrmInsurancePolicy | null>(null);
  const {
    insurerOptions,
    isLoading: insurersLoading,
  } = useSiInsurersEffective({ historyKey: editing?.insurer_key });
  const {
    insuranceTypeOptions: typeOptions,
    isLoading: typesLoading,
  } = useSiInsuranceTypesEffective({ historyKey: editing?.insurance_type });

  const schema = useMemo(
    () =>
      createInsurancePolicyFormSchema(
        POLICY_MSG,
        () => insurerOptions.map((o) => o.value),
        () => typeOptions.map((o) => o.value),
      ),
    [insurerOptions, typeOptions],
  );

  const form = useForm<InsurancePolicyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      policy_code: '',
      policy_name: '',
      insurer_key: '',
      insurance_type: '',
      effective_date: '',
      expiry_date: '',
      notes: '',
    },
  });

  const policiesQuery = useQuery({
    queryKey: ['insurance-policies', currentCompanyId],
    queryFn: () => listInsurancePolicies({ company_id: currentCompanyId! }),
    enabled: !!currentCompanyId,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['insurance-policies'] });
  };

  const saveMutation = useMutation({
    mutationFn: async (values: InsurancePolicyFormValues) => {
      if (!currentCompanyId) throw new Error('Thiếu company_id');
      if (editing) {
        return updateInsurancePolicy(
          editing.id,
          currentCompanyId,
          buildInsurancePolicyUpdateBody(values),
        );
      }
      return createInsurancePolicy(buildInsurancePolicyCreateBody(currentCompanyId, values));
    },
    onSuccess: () => {
      toast.success(editing ? 'Đã cập nhật chính sách BH' : 'Đã tạo chính sách BH');
      form.reset({
        policy_code: '',
        policy_name: '',
        insurer_key: '',
        insurance_type: '',
        effective_date: '',
        expiry_date: '',
        notes: '',
      });
      setEditing(null);
      invalidate();
    },
    onError: (error: unknown) => toast.error(toErrorMessage(error)),
  });

  const statusMutation = useMutation({
    mutationFn: async (args: { id: string; status: InsurancePolicyStatus }) => {
      if (!currentCompanyId) throw new Error('Thiếu company_id');
      return updateInsurancePolicy(
        args.id,
        currentCompanyId,
        buildInsurancePolicyStatusPatchBody(args.status),
      );
    },
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái chính sách');
      invalidate();
    },
    onError: (error: unknown) => toast.error(toErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentCompanyId) throw new Error('Thiếu company_id');
      return deleteInsurancePolicy(id, currentCompanyId);
    },
    onSuccess: () => {
      toast.success('Đã xóa / đóng chính sách');
      invalidate();
    },
    onError: (error: unknown) => toast.error(toErrorMessage(error)),
  });

  const siInsurerSettingsCta = hrmPathWithEmbedSearch('/settings?tab=si-insurers');
  const siTypeSettingsCta = hrmPathWithEmbedSearch('/settings?tab=si-insurance-types');
  const rows = policiesQuery.data?.data ?? [];

  const startEdit = (row: HrmInsurancePolicy) => {
    setEditing(row);
    form.reset({
      policy_code: row.policy_code,
      policy_name: row.policy_name,
      insurer_key: row.insurer_key,
      insurance_type: row.insurance_type,
      effective_date: row.effective_date?.slice(0, 10) ?? '',
      expiry_date: row.expiry_date?.slice(0, 10) ?? '',
      notes: row.notes ?? '',
    });
  };

  return (
    <Card id="insurance-policy-master-e3" data-testid="insurance-policy-master-e3">
      <CardHeader>
        <CardTitle>
          {editing ? 'Sửa chính sách bảo hiểm' : 'Chính sách bảo hiểm (master)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form
            className="grid gap-3 md:grid-cols-2"
            onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))}
          >
            <FormField
              control={form.control}
              name="policy_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã chính sách *</FormLabel>
                  <FormControl>
                    <Input placeholder="POL-2026-01" {...field} disabled={!!editing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="policy_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên chính sách *</FormLabel>
                  <FormControl>
                    <Input placeholder="BHXH tập đoàn 2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="insurer_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhà bảo hiểm *</FormLabel>
                  <CatalogSearchPicker
                    options={insurerOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    loading={insurersLoading}
                    placeholder="Chọn nhà BH…"
                    emptyHint={
                      <a
                        href={siInsurerSettingsCta}
                        className="text-primary underline text-xs font-medium"
                        data-testid="hdsd-policy-open-si-insurers"
                      >
                        Mở Cài đặt → Nhà BH / Insurers (tạo mã mới)
                      </a>
                    }
                    aria-label="Nhà bảo hiểm"
                    data-testid="hdsd-policy-insurer-picker"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="insurance_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại bảo hiểm *</FormLabel>
                  <CatalogSearchPicker
                    options={typeOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    loading={typesLoading}
                    placeholder="Chọn loại BH…"
                    emptyHint={
                      <a
                        href={siTypeSettingsCta}
                        className="text-primary underline text-xs font-medium"
                        data-testid="hdsd-policy-open-si-insurance-types"
                      >
                        Mở Cài đặt → Loại BH / SI type (tạo mã mới)
                      </a>
                    }
                    aria-label="Loại bảo hiểm"
                    data-testid="hdsd-policy-insurance-type-picker"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="effective_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hiệu lực từ *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiry_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đến ngày</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={saveMutation.isPending}>
                {editing ? 'Lưu chính sách' : 'Tạo chính sách'}
              </Button>
              {editing ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing(null);
                    form.reset({
                      policy_code: '',
                      policy_name: '',
                      insurer_key: '',
                      insurance_type: '',
                      effective_date: '',
                      expiry_date: '',
                      notes: '',
                    });
                  }}
                >
                  Hủy
                </Button>
              ) : null}
            </div>
          </form>
        </Form>

        <div className="space-y-2 border-t pt-4">
          <h3 className="text-sm font-medium">
            Danh sách chính sách ({policiesQuery.data?.total ?? rows.length})
          </h3>
          {rows.length === 0 ? (
            <EmptyState
              mood="none"
              title="Chưa có chính sách bảo hiểm"
              description="Tạo chính sách với nhà BH và loại từ catalog Nest. Khi catalog trống, mở Cài đặt → Nhà BH / Loại BH."
              actionLabel="Mở Cài đặt — Nhà BH"
              actionTo={siInsurerSettingsCta}
              compact
              data-testid="ins-policies-empty"
            />
          ) : (
            rows.map((row) => {
              const next = nextInsurancePolicyStatuses(row.status);
              return (
                <div
                  key={row.id}
                  className="rounded border p-3 text-sm space-y-2"
                  data-testid="ins-policy-row"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">
                        {row.policy_name}{' '}
                        <span className="text-muted-foreground">({row.policy_code})</span>
                      </div>
                      <div className="text-muted-foreground">
                        {resolveSiInsurerLabel(insurerOptions, row.insurer_key)} ·{' '}
                        {resolveSiInsuranceTypeLabel(typeOptions, row.insurance_type)} ·{' '}
                        {resolveInsurancePolicyStatusDisplay(row.status)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDisplayDate(row.effective_date)}
                        {row.expiry_date ? ` – ${formatDisplayDate(row.expiry_date)}` : ''}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => startEdit(row)}>
                        Sửa
                      </Button>
                      {row.status === 'draft' || row.status === 'cancelled' ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(row.id)}
                        >
                          Xóa
                        </Button>
                      ) : null}
                      {next.map((st) => (
                        <Button
                          key={st}
                          type="button"
                          size="sm"
                          disabled={statusMutation.isPending}
                          onClick={() => statusMutation.mutate({ id: row.id, status: st })}
                          data-testid={`ins-policy-sm-${st}`}
                        >
                          → {resolveInsurancePolicyStatusDisplay(st)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
