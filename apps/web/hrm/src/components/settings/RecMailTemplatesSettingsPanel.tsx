/**
 * @CODE-MEMORY
 * Screen:     /settings — tab Mẫu thư tuyển (3 chuẩn + tùy chỉnh CRUD)
 * UC:         UC-BP-REC-06 · F-REC-MAIL-01 catalog CFG
 * Purpose:    Thêm / sửa / xóa (custom) · bật/tắt · Lưu PUT /recruitment/mail-templates.
 * WorkItem:   PO-HRM-REC-MAIL-TEMPLATES-CFG-01
 * must_keep:  3 mã chuẩn không xóa · sync template_codes · U65 · no stage mutate
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Mail, Plus, RefreshCw, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { useToast } from '@/hooks/use-toast';
import {
  listRecruitmentMailTemplates,
  putRecruitmentMailTemplates,
  type HrmRecMailTemplateItem,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  buildDefaultRecMailTemplateCatalog,
  isStandardRecMailTemplateCode,
  isValidRecMailTemplateCode,
  normalizeRecMailTemplateCode,
  REC_MAIL_TEMPLATE_CATALOG_MAX,
  REC_MAIL_TEMPLATE_CODES,
  type RecMailTemplateCode,
} from '@/lib/recCandidateMailEval';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const PLACEHOLDERS = [
  { token: '{{candidate_name}}', hint: 'Tên ứng viên' },
  { token: '{{position}}', hint: 'Vị trí / YCTD' },
  { token: '{{company}}', hint: 'Đơn vị' },
] as const;

function normalizeCatalog(rows: HrmRecMailTemplateItem[]): HrmRecMailTemplateItem[] {
  const byCode = new Map<string, HrmRecMailTemplateItem>();
  for (const r of rows) {
    const code = String(r?.code ?? '')
      .trim()
      .toLowerCase();
    if (!isValidRecMailTemplateCode(code)) continue;
    byCode.set(code, {
      code,
      label_vi: (r.label_vi ?? code).trim() || code,
      subject: (r.subject ?? '').trim(),
      body: (r.body ?? '').trim(),
      active: typeof r.active === 'boolean' ? r.active : true,
    });
  }

  const defaults = buildDefaultRecMailTemplateCatalog();
  const standards = defaults.map((d) => {
    const hit = byCode.get(d.code);
    if (!hit) return { ...d };
    return {
      code: d.code,
      label_vi: (hit.label_vi ?? d.label_vi).trim() || d.label_vi,
      subject: (hit.subject ?? d.subject).trim() || d.subject,
      body: (hit.body ?? d.body).trim() || d.body,
      active: typeof hit.active === 'boolean' ? hit.active : true,
    };
  });

  const customs = [...byCode.values()].filter(
    (t) => !isStandardRecMailTemplateCode(t.code),
  );
  return [...standards, ...customs].slice(0, REC_MAIL_TEMPLATE_CATALOG_MAX);
}

function blankCustomTemplate(code: string): HrmRecMailTemplateItem {
  return {
    code,
    label_vi: 'Mẫu thư mới',
    subject: '[{{company}}] Thư tuyển dụng — {{position}}',
    body: `Kính gửi {{candidate_name}},

{{company}} gửi thư liên quan vị trí {{position}}.

Trân trọng,
Phòng Nhân sự — {{company}}`,
    active: true,
  };
}

export function RecMailTemplatesSettingsPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = (listCompanyId || currentCompanyId || 'main').trim();
  const { toast } = useToast();

  const [items, setItems] = useState<HrmRecMailTemplateItem[]>(() =>
    normalizeCatalog([]),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string>('interview_invite');
  const [dirty, setDirty] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newLabel, setNewLabel] = useState('Mẫu thư mới');

  const selected = useMemo(
    () => items.find((t) => t.code === selectedCode) ?? items[0] ?? null,
    [items, selectedCode],
  );

  const activeCount = useMemo(() => items.filter((t) => t.active).length, [items]);
  const selectedIsStandard = selected
    ? isStandardRecMailTemplateCode(selected.code)
    : false;

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await listRecruitmentMailTemplates(companyId);
      const next = normalizeCatalog(res.items);
      setItems(next);
      setDirty(false);
      setSelectedCode((prev) =>
        next.some((t) => t.code === prev) ? prev : (next[0]?.code ?? 'interview_invite'),
      );
    } catch (error) {
      const msg = toErrorMessage(error, 'Không tải được mẫu thư từ API.');
      setLoadError(msg);
      setItems(normalizeCatalog([]));
      setDirty(false);
      toast({
        title: 'Dùng mẫu mặc định tạm thời',
        description: `${msg} Bạn vẫn có thể sửa và Lưu khi API sẵn sàng.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [companyId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const patchSelected = (patch: Partial<HrmRecMailTemplateItem>) => {
    if (!selected) return;
    setItems((prev) =>
      prev.map((t) => (t.code === selected.code ? { ...t, ...patch } : t)),
    );
    setDirty(true);
  };

  const resetSelectedToDefault = () => {
    if (!selected || !selectedIsStandard) return;
    const code = selected.code as RecMailTemplateCode;
    if (!REC_MAIL_TEMPLATE_CODES.includes(code)) return;
    const def = buildDefaultRecMailTemplateCatalog().find((d) => d.code === code);
    if (!def) return;
    patchSelected({
      label_vi: def.label_vi,
      subject: def.subject,
      body: def.body,
      active: true,
    });
  };

  const insertPlaceholder = (token: string) => {
    if (!selected) return;
    patchSelected({
      body: `${selected.body}${selected.body.endsWith('\n') ? '' : '\n'}${token}`,
    });
  };

  const handleAddTemplate = () => {
    const code = normalizeRecMailTemplateCode(newCode);
    if (!isValidRecMailTemplateCode(code)) {
      toast({
        title: 'Mã mẫu không hợp lệ',
        description: 'Dùng slug: bắt đầu bằng chữ cái, chỉ a-z 0-9 _ - (2–64 ký tự).',
        variant: 'destructive',
      });
      return;
    }
    if (items.some((t) => t.code === code)) {
      toast({
        title: 'Mã đã tồn tại',
        description: `«${code}» đã có trong danh sách.`,
        variant: 'destructive',
      });
      return;
    }
    if (items.length >= REC_MAIL_TEMPLATE_CATALOG_MAX) {
      toast({
        title: 'Đã đủ số mẫu',
        description: `Tối đa ${REC_MAIL_TEMPLATE_CATALOG_MAX} mẫu / đơn vị.`,
        variant: 'destructive',
      });
      return;
    }
    const tpl = blankCustomTemplate(code);
    tpl.label_vi = newLabel.trim() || tpl.label_vi;
    setItems((prev) => [...prev, tpl]);
    setSelectedCode(code);
    setDirty(true);
    setAddOpen(false);
    setNewCode('');
    setNewLabel('Mẫu thư mới');
    toast({
      title: 'Đã thêm mẫu',
      description: 'Chỉnh nội dung rồi bấm Lưu để ghi vào hệ thống.',
    });
  };

  const handleDeleteSelected = () => {
    if (!selected) return;
    if (isStandardRecMailTemplateCode(selected.code)) {
      toast({
        title: 'Không xóa mẫu chuẩn',
        description: 'Ba mẫu hệ thống (từ chối CV / mời PV / offer) chỉ tắt được, không xóa.',
        variant: 'destructive',
      });
      return;
    }
    const removed = selected.code;
    const next = items.filter((t) => t.code !== removed);
    setItems(next);
    setSelectedCode(next[0]?.code ?? 'interview_invite');
    setDirty(true);
    toast({
      title: 'Đã xóa khỏi danh sách',
      description: `«${removed}» — bấm Lưu để xác nhận ghi xuống máy chủ.`,
    });
  };

  const handleSave = async () => {
    for (const t of items) {
      if (!isValidRecMailTemplateCode(t.code)) {
        toast({
          title: 'Mã mẫu không hợp lệ',
          description: t.code,
          variant: 'destructive',
        });
        setSelectedCode(t.code);
        return;
      }
      if (!t.label_vi.trim() || !t.subject.trim() || !t.body.trim()) {
        toast({
          title: 'Thiếu nội dung mẫu',
          description: `Mẫu «${t.label_vi || t.code}»: cần nhãn, tiêu đề và nội dung.`,
          variant: 'destructive',
        });
        setSelectedCode(t.code);
        return;
      }
    }
    if (activeCount === 0) {
      toast({
        title: 'Cần ít nhất một mẫu bật',
        description: 'Bật tối thiểu một mẫu để dialog Gửi thư có lựa chọn.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const catalog = items.map((t) => ({
        code: t.code,
        label_vi: t.label_vi.trim(),
        subject: t.subject.trim(),
        body: t.body.trim(),
        active: Boolean(t.active),
      }));
      const saved = await putRecruitmentMailTemplates(companyId, catalog);
      const next = normalizeCatalog(
        Array.isArray(saved?.data) ? saved.data : catalog,
      );
      setItems(next);
      setDirty(false);
      setLoadError(null);
      toast({
        title: 'Đã lưu mẫu thư',
        description: `${next.filter((t) => t.active).length}/${next.length} mẫu đang bật · dialog Gửi thư dùng catalog này.`,
      });
    } catch (error) {
      toast({
        title: 'Lưu thất bại',
        description: toErrorMessage(error, 'Không ghi được mẫu thư tuyển.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card
        className="w-full max-w-none border-border/80 shadow-sm"
        data-testid="settings-rec-mail-templates"
      >
        <CardHeader className="space-y-3 border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                Mẫu thư tuyển dụng
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed max-w-2xl">
                Ba mẫu chuẩn (từ chối CV / mời phỏng vấn / offer) luôn có — có thể sửa và bật/tắt,
                không xóa. Thêm mẫu tùy chỉnh khi cần thư riêng. Dialog Gửi thư chỉ hiện mẫu đang
                bật.
              </CardDescription>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant="outline" className="font-normal">
                  Đơn vị: {companyId}
                </Badge>
                <Badge variant="secondary" className="font-normal">
                  {activeCount}/{items.length} đang bật
                </Badge>
                {dirty ? (
                  <Badge className="font-normal bg-amber-500/15 text-amber-800 hover:bg-amber-500/15">
                    Chưa lưu
                  </Badge>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddOpen(true)}
                disabled={loading || saving || items.length >= REC_MAIL_TEMPLATE_CATALOG_MAX}
                data-testid="settings-rec-mail-templates-add"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Thêm mẫu
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void load()}
                disabled={loading || saving}
                data-testid="settings-rec-mail-templates-refresh"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="ml-1.5 hidden sm:inline">Tải lại</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => void handleSave()}
                disabled={loading || saving || items.length === 0}
                data-testid="settings-rec-mail-templates-save"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-1.5" />
                )}
                Lưu
              </Button>
            </div>
          </div>
          {loadError ? (
            <p
              className="text-xs rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive"
              data-testid="settings-rec-mail-templates-error"
            >
              {loadError}
            </p>
          ) : null}
        </CardHeader>

        <CardContent className="p-0">
          {loading && items.length === 0 ? (
            <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Đang tải mẫu thư…
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] min-h-[28rem]">
              <aside
                className="border-b lg:border-b-0 lg:border-r border-border/60 bg-muted/20 p-3 space-y-1.5"
                data-testid="settings-rec-mail-templates-list"
              >
                <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Danh sách mẫu
                </p>
                {items.map((t) => {
                  const active = t.code === selected?.code;
                  const isStd = isStandardRecMailTemplateCode(t.code);
                  return (
                    <button
                      key={t.code}
                      type="button"
                      onClick={() => setSelectedCode(t.code)}
                      data-testid={`settings-rec-mail-template-${t.code}`}
                      className={cn(
                        'w-full rounded-md px-3 py-2.5 text-left transition-colors',
                        'hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        active
                          ? 'bg-background shadow-sm ring-1 ring-border'
                          : 'bg-transparent',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium leading-snug">{t.label_vi}</span>
                        <Badge
                          variant={t.active ? 'default' : 'secondary'}
                          className="shrink-0 text-[10px] px-1.5 py-0"
                        >
                          {t.active ? 'Bật' : 'Tắt'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground font-mono truncate">
                        {t.code}
                        {isStd ? ' · chuẩn' : ' · tùy chỉnh'}
                      </p>
                    </button>
                  );
                })}
              </aside>

              <div
                className="p-4 sm:p-5 space-y-4"
                data-testid="settings-rec-mail-templates-editor"
              >
                {selected ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold">{selected.label_vi}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {selectedIsStandard
                            ? 'Mẫu chuẩn hệ thống — có thể sửa nội dung / tắt, không xóa.'
                            : 'Mẫu tùy chỉnh — có thể sửa hoặc xóa (sau đó Lưu).'}{' '}
                          Mã: <code className="text-[11px]">{selected.code}</code>
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {selectedIsStandard ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={resetSelectedToDefault}
                            disabled={saving}
                            data-testid="settings-rec-mail-template-reset"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                            Khôi phục mặc định
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={handleDeleteSelected}
                            disabled={saving}
                            data-testid="settings-rec-mail-template-delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Xóa mẫu
                          </Button>
                        )}
                        <div className="flex items-center gap-2 rounded-md border px-3 py-1.5">
                          <Label htmlFor="rec-mail-tpl-active" className="text-xs cursor-pointer">
                            Bật mẫu
                          </Label>
                          <Switch
                            id="rec-mail-tpl-active"
                            checked={selected.active}
                            onCheckedChange={(v) => patchSelected({ active: v })}
                            data-testid="settings-rec-mail-template-active"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rec-mail-tpl-label">Nhãn hiển thị</Label>
                      <Input
                        id="rec-mail-tpl-label"
                        value={selected.label_vi}
                        onChange={(e) => patchSelected({ label_vi: e.target.value })}
                        data-testid="settings-rec-mail-template-label"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rec-mail-tpl-subject">Tiêu đề email</Label>
                      <Input
                        id="rec-mail-tpl-subject"
                        value={selected.subject}
                        onChange={(e) => patchSelected({ subject: e.target.value })}
                        data-testid="settings-rec-mail-template-subject"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Label htmlFor="rec-mail-tpl-body">Nội dung email</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {PLACEHOLDERS.map((p) => (
                            <Button
                              key={p.token}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-[11px] font-mono px-2"
                              title={p.hint}
                              onClick={() => insertPlaceholder(p.token)}
                            >
                              {p.token}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <Textarea
                        id="rec-mail-tpl-body"
                        value={selected.body}
                        onChange={(e) => patchSelected({ body: e.target.value })}
                        rows={14}
                        className="min-h-[16rem] font-sans text-sm leading-relaxed"
                        data-testid="settings-rec-mail-template-body"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Placeholder được thay khi gửi. Có thể chỉnh lại nội dung trên dialog trước
                        mỗi lần gửi.
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Không có mẫu để chỉnh.</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md" data-testid="settings-rec-mail-template-add-dialog">
          <DialogHeader>
            <DialogTitle>Thêm mẫu thư tùy chỉnh</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-2">
              <Label htmlFor="rec-mail-new-code">Mã mẫu (slug)</Label>
              <Input
                id="rec-mail-new-code"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="vd. thank_you / reminder_docs"
                data-testid="settings-rec-mail-template-new-code"
              />
              <p className="text-[11px] text-muted-foreground">
                Chỉ a-z, 0-9, gạch dưới / gạch ngang. Không trùng mã chuẩn.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rec-mail-new-label">Nhãn hiển thị</Label>
              <Input
                id="rec-mail-new-label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                data-testid="settings-rec-mail-template-new-label"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleAddTemplate}
              data-testid="settings-rec-mail-template-add-confirm"
            >
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
