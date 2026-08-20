import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsCatalogRowActions } from './SettingsCatalogRowActions';
import { SettingsCatalogScreenShell } from './SettingsCatalogScreenShell';
import { Plus } from 'lucide-react';
import { hrmApi } from '@/integrations/hrmApi';
import {
  listAttRules,
  upsertAttRule,
  retireAttRule,
  type HrmAttRuleRecord,
} from '@/integrations/hrmApi';

export function AttWorkRuleSettingsPanel() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const companyId = hrmApi.resolvePortalParentCompanyId();

  const [q, setQ] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: '',
    nameVi: '',
    ruleType: 'STANDARD_WORK',
    formulaDesc: '',
    applyTo: '',
    description: '',
    status: 'active',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['att-rules', companyId, q],
    queryFn: () => listAttRules({ company_id: companyId!, q }),
    enabled: !!companyId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['att-rules'] });

  const resetForm = () => {
    setForm({
      code: '',
      nameVi: '',
      ruleType: 'STANDARD_WORK',
      formulaDesc: '',
      applyTo: '',
      description: '',
      status: 'active',
    });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (row: HrmAttRuleRecord) => {
    setForm({
      code: row.code,
      nameVi: row.name_vi,
      ruleType: row.rule_type,
      formulaDesc: row.formula_desc || '',
      applyTo: row.apply_to || '',
      description: row.description || '',
      status: row.status,
    });
    setEditingId(row.id);
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      upsertAttRule({
        company_id: companyId!,
        code: form.code,
        name_vi: form.nameVi,
        rule_type: form.ruleType,
        formula_desc: form.formulaDesc || null,
        apply_to: form.applyTo || null,
        description: form.description || null,
        status: form.status,
      }),
    onSuccess: () => {
      toast({ title: 'Đã lưu quy tắc' });
      setDialogOpen(false);
      invalidate();
    },
    onError: (err: any) => {
      toast({
        title: 'Lỗi',
        description: err.message || 'Không thể lưu quy tắc',
        variant: 'destructive',
      });
    },
  });

  const retireMutation = useMutation({
    mutationFn: (id: string) => retireAttRule(id, companyId!),
    onSuccess: () => {
      toast({ title: 'Đã ngừng quy tắc' });
      invalidate();
    },
    onError: (err: any) => {
      toast({
        title: 'Lỗi',
        description: err.message || 'Không thể ngừng quy tắc',
        variant: 'destructive',
      });
    },
  });

  const handleRetire = (row: HrmAttRuleRecord) => {
    if (confirm(`Ngừng quy tắc "${row.name_vi}"?`)) {
      retireMutation.mutate(row.id);
    }
  };

  const items = data?.items || [];

  return (
    <SettingsCatalogScreenShell
      title="Quy tắc tính công"
      description="Quản lý các quy tắc công chuẩn, tăng ca, phạt đi muộn/về sớm."
      q={q}
      setQ={setQ}
      onRefresh={invalidate}
      renderActions={() => (
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm quy tắc
        </Button>
      )}
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã quy tắc</TableHead>
              <TableHead>Tên quy tắc</TableHead>
              <TableHead>Phân loại</TableHead>
              <TableHead>Công thức / Mô tả</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono">{row.code}</TableCell>
                  <TableCell className="font-medium">{row.name_vi}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.rule_type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {row.formula_desc || '--'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
                      {row.status === 'active' ? 'Đang dùng' : 'Ngừng'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <SettingsCatalogRowActions
                      onEdit={() => openEdit(row)}
                      onRetire={() => handleRetire(row)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa quy tắc' : 'Thêm quy tắc'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mã quy tắc *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  disabled={!!editingId}
                  placeholder="VD: RULE_STD"
                />
              </div>
              <div className="space-y-2">
                <Label>Phân loại *</Label>
                <Select value={form.ruleType} onValueChange={(v) => setForm({ ...form, ruleType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD_WORK">Công chuẩn</SelectItem>
                    <SelectItem value="DEDUCTION">Khấu trừ (phạt)</SelectItem>
                    <SelectItem value="OVERTIME">Tăng ca</SelectItem>
                    <SelectItem value="SPECIAL">Đặc thù</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tên quy tắc *</Label>
              <Input
                value={form.nameVi}
                onChange={(e) => setForm({ ...form, nameVi: e.target.value })}
                placeholder="VD: Công chuẩn 8h"
              />
            </div>

            <div className="space-y-2">
              <Label>Diễn giải công thức</Label>
              <Input
                value={form.formulaDesc}
                onChange={(e) => setForm({ ...form, formulaDesc: e.target.value })}
                placeholder="VD: 1 ngày = 8h"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="VD: Áp dụng khối VP"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              Lưu lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsCatalogScreenShell>
  );
}
