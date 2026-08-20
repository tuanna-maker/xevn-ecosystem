/**
 * @CODE-MEMORY
 * Screen:     /settings — Cấu hình JD động (Q1 catalog @ Cài đặt)
 * UC:         UC-BP-REC-00a · 00d · 00e · 00f · FG1–FG3
 * BR:         BR-BP-JD-DYN-01 · BR-BP-JD-GRP-01..04
 * SRS:        docs/program/specs/PO-HRM-JD-GROUP-SPEC-01.md §7–9
 * TechSpec:   docs/program/specs/PO-HRM-JD-GROUP-ARCH-01.md §2 FG1–FG3 · ARCH-02 §2 F-JD-DEF/LAY
 * Purpose:    Settings CRUD: field catalog · group defs · default packs · pack rules (không DnD writer).
 * WorkItem:   PO-HRM-JD-DYNAMIC-FE-01
 * Coded:      2026-08-06
 * Callers:    pages/Settings.tsx tab jd-dynamic
 * Callees:    hrmApi list/create/update jd-field-defs · jd-group-defs · jd-default-packs · jd-pack-rules
 * must_keep:  Q1 Settings-only for catalog; U65 no seed; empty/error/F5; Precision Motion tokens
 * SOLID:      Panel owns CFG mutate; writer stays in JobTemplatesTab
 * LastVerified: docs/qa/evidence/po-hrm-jd-dynamic-fe-03.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-DYNAMIC-FE-03
 * What: Rules Lưu relies on putJdPackRules DTO strip (id/company_id/pack_label dropped).
 * must_keep: Settings mount · no JobPostingsTab JD write
 *
 * @CODE-MEMORY-CHANGE 2026-08-13 PO-HRM-SETTINGS-IA-COPY-WAVE2-FE-01
 * change_mode: UPGRADE
 * What: 5 sub-tab (Catalog trường / Nhóm thông tin / Gói mặc định / Rule chọn gói / Bố cục
 *       mặc định) chuyển form thêm/sửa từ Card cố định trên bảng sang Dialog (nút "Thêm mới" /
 *       "Sửa rules" / "Cấu hình bố cục" mở Dialog); thêm ô tìm kiếm mã/nhãn cho 3 tab danh sách
 *       (trường/nhóm/gói). Dọn copy: bỏ hậu tố mã (FG1/FG2/FG3/Q6) khỏi CardTitle; bỏ mã
 *       F-JD-DEF khỏi CardDescription; diễn giải tiếng Việt cho label/enum raw (usage/
 *       view_style/field_type/group_codes/field_id); bỏ ghi chú kỹ thuật "PUT ... ASC".
 * Why: PO-HRM-SETTINGS-IA-COPY-WAVE2-FE-01 — chuẩn PAT-SETTINGS-CATALOG-01 (List+Dialog),
 *      UX-PRODUCT-RULES.md §10 (cấm mã tracing/jargon nội bộ render thẳng ra UI end-user).
 * SRS: (không phát sinh SRS mới — IA + copy hygiene, không đổi hành vi mutate/validate)
 * must_keep: mọi data-testid cũ nguyên vẹn (jd-settings-field-key/label/save,
 *            jd-settings-fields-empty, jd-settings-field-row, jd-settings-group-code/label/save,
 *            jd-settings-groups-empty, jd-settings-group-row, jd-settings-pack-code/label/save,
 *            jd-settings-rules-json/save, jd-settings-resolve-position); upsertMutation/API
 *            logic, validate rule, putJdPackRules DTO strip không đổi; chỉ đổi NƠI render + text
 * LastVerified: docs/qa/evidence/po-hrm-settings-ia-copy-wave2-fe-01.md
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileText, GripVertical, Plus, RefreshCw, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import {
  createJdFieldDef,
  createJdGroupDef,
  listJdDefaultPacks,
  listJdFieldDefs,
  listJdGroupDefs,
  listJdPackRules,
  putJdDefaultFormLayout,
  putJdPackRules,
  resolveJdPack,
  updateJdFieldDef,
  updateJdGroupDef,
  upsertJdDefaultPack,
  type HrmJdDefaultPack,
  type HrmJdFieldDef,
  type HrmJdGroupDef,
  type HrmJdPackRule,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const FIELD_TYPES = ['short_text', 'long_text', 'select', 'number', 'date'] as const;
const VIEW_STYLES = ['heading', 'bullets', 'chips', 'key_value'] as const;

const FIELD_TYPE_LABELS: Record<string, string> = {
  short_text: 'Văn bản ngắn',
  long_text: 'Văn bản dài',
  select: 'Danh sách chọn',
  number: 'Số',
  date: 'Ngày',
};

// JD_SELECT_ALLOWLIST from DATA-01 §12.7
const JD_SELECT_ALLOWLIST = [
  { key: 'job_titles', label: 'Chức danh (job_titles)' },
  { key: 'job_grades', label: 'Cấp bậc (job_grades)' },
  { key: 'employment_types', label: 'Loại HĐ / Hình thức (employment_types)' },
  { key: 'departments', label: 'Phòng ban (departments)' },
  { key: 'recruitment_channels', label: 'Kênh tuyển dụng (recruitment_channels)' },
] as const;

const VALIDATION_SOURCE_OPTIONS = [
  { value: 'static', label: 'Tự định nghĩa' },
  { value: 'catalog', label: 'Từ danh mục hệ thống' },
] as const;

const VIEW_STYLE_LABELS: Record<string, string> = {
  heading: 'Tiêu đề',
  bullets: 'Gạch đầu dòng',
  chips: 'Thẻ nhãn',
  key_value: 'Cặp nhãn - giá trị',
};

const GROUP_USAGE_LABELS: Record<string, string> = {
  default_eligible: 'Mặc định hiển thị',
  optional_only: 'Chỉ khi cần',
};

function displayFieldType(t: string): string {
  return FIELD_TYPE_LABELS[t] ?? t;
}

function displayViewStyle(s: string): string {
  return VIEW_STYLE_LABELS[s] ?? s;
}

function displayGroupUsage(u: string): string {
  return GROUP_USAGE_LABELS[u] ?? u;
}

function groupCodeOf(g: HrmJdGroupDef): string {
  return (g.group_code || g.code || '').trim();
}

function packCodeOf(p: HrmJdDefaultPack): string {
  return (p.pack_code || p.code || '').trim();
}

export function JdDynamicSettingsPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;

  const [fields, setFields] = useState<HrmJdFieldDef[]>([]);
  const [groups, setGroups] = useState<HrmJdGroupDef[]>([]);
  const [packs, setPacks] = useState<HrmJdDefaultPack[]>([]);
  const [rules, setRules] = useState<HrmJdPackRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fieldForm, setFieldForm] = useState({
    field_key: '',
    label: '',
    field_type: 'short_text',
    is_required: false,
    validation_source: 'static',
    validation_options: '',
    validation_catalog_key: '',
  });
  const [fieldSearch, setFieldSearch] = useState('');
  // Uncontrolled ref for validation_options textarea: decouples keystrokes from parent re-render (prevents Radix FocusScope from stealing focus on each character)
  const validationOptionsRef = useRef<HTMLTextAreaElement>(null);
  const fieldKeyRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLInputElement>(null);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  const [groupForm, setGroupForm] = useState({
    group_code: '',
    label: '',
    kind: 'tenant_custom',
    usage: 'optional_only',
    view_style: 'heading',
    field_ids: '' as string,
  });
  const [groupSearch, setGroupSearch] = useState('');
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);

  const [packForm, setPackForm] = useState({
    pack_code: '',
    label: '',
    group_codes: '',
  });
  const [packSearch, setPackSearch] = useState('');
  const [packDialogOpen, setPackDialogOpen] = useState(false);

  const [rulesJson, setRulesJson] = useState('[]');
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
  const [previewPosition, setPreviewPosition] = useState('');
  const [previewResult, setPreviewResult] = useState<string | null>(null);

  const [layoutFieldIds, setLayoutFieldIds] = useState('');
  const [layoutDialogOpen, setLayoutDialogOpen] = useState(false);

  const loadAll = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const [f, g, p, r] = await Promise.all([
        listJdFieldDefs({ company_id: companyId }),
        listJdGroupDefs({ company_id: companyId }),
        listJdDefaultPacks({ company_id: companyId }),
        listJdPackRules({ company_id: companyId }),
      ]);
      setFields(f.items);
      setGroups(g.items);
      setPacks(p.items);
      setRules(r.items);
      setRulesJson(JSON.stringify(r.items, null, 2));
    } catch (err: unknown) {
      setError(
        toErrorMessage(
          err,
          'Không tải được cấu hình JD động. Thử tải lại trang hoặc liên hệ quản trị hệ thống.',
        ),
      );
      setFields([]);
      setGroups([]);
      setPacks([]);
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const activeFieldOptions = useMemo(
    () => fields.filter((f) => f.is_active !== false),
    [fields],
  );

  const filteredFields = useMemo(() => {
    const q = fieldSearch.trim().toLowerCase();
    if (!q) return fields;
    return fields.filter(
      (f) => f.field_key.toLowerCase().includes(q) || f.label.toLowerCase().includes(q),
    );
  }, [fields, fieldSearch]);

  const filteredGroups = useMemo(() => {
    const q = groupSearch.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) => groupCodeOf(g).toLowerCase().includes(q) || g.label.toLowerCase().includes(q),
    );
  }, [groups, groupSearch]);

  const filteredPacks = useMemo(() => {
    const q = packSearch.trim().toLowerCase();
    if (!q) return packs;
    return packs.filter(
      (p) => packCodeOf(p).toLowerCase().includes(q) || p.label.toLowerCase().includes(q),
    );
  }, [packs, packSearch]);

  const handleFieldDialogOpenChange = (next: boolean) => {
    setFieldDialogOpen(next);
    if (!next) {
      setEditingFieldId(null);
      setFieldForm({
        field_key: '',
        label: '',
        field_type: 'short_text',
        is_required: false,
        validation_source: 'static',
        validation_options: '',
        validation_catalog_key: '',
      });
    }
  };

  const handleGroupDialogOpenChange = (next: boolean) => {
    setGroupDialogOpen(next);
    if (!next) {
      setGroupForm({
        group_code: '',
        label: '',
        kind: 'tenant_custom',
        usage: 'optional_only',
        view_style: 'heading',
        field_ids: '',
      });
    }
  };

  const handlePackDialogOpenChange = (next: boolean) => {
    setPackDialogOpen(next);
    if (!next) {
      setPackForm({ pack_code: '', label: '', group_codes: '' });
    }
  };

  const handleRulesDialogOpenChange = (next: boolean) => {
    setRulesDialogOpen(next);
    if (!next) {
      // Đóng không lưu — bỏ chỉnh sửa dở dang, quay lại đúng rule đang có trên server.
      setRulesJson(JSON.stringify(rules, null, 2));
    }
  };

  const handleLayoutDialogOpenChange = (next: boolean) => {
    setLayoutDialogOpen(next);
  };

  const onCreateField = async () => {
    if (!companyId) return;
    if (!(fieldKeyRef.current?.value ?? fieldForm.field_key).trim() || !(labelRef.current?.value ?? fieldForm.label).trim()) {
      toast({ title: 'Thiếu mã hoặc nhãn trường', variant: 'destructive' });
      return;
    }

    // Validate validation_json for select type
    let validation_json: Record<string, unknown> | undefined;
    if (fieldForm.field_type === 'select') {
      if (fieldForm.validation_source === 'static') {
        const options = (validationOptionsRef.current?.value ?? fieldForm.validation_options)
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        if (options.length === 0) {
          toast({ title: 'Cần ít nhất 1 tùy chọn cho trường Danh sách chọn', variant: 'destructive' });
          return;
        }
        if (options.length > 50) {
          toast({ title: 'Tối đa 50 tùy chọn cho trường Danh sách chọn', variant: 'destructive' });
          return;
        }
        validation_json = { source: 'static', options };
      } else if (fieldForm.validation_source === 'catalog') {
        if (!fieldForm.validation_catalog_key) {
          toast({ title: 'Chọn danh mục nguồn cho trường Danh sách chọn', variant: 'destructive' });
          return;
        }
        validation_json = { source: 'catalog', catalog_key: fieldForm.validation_catalog_key };
      }
    }

    try {
      await createJdFieldDef({
        company_id: companyId,        // field_key: immutable — not in UpdateJdFieldDefDto (forbidNonWhitelisted rejects it)
        label: (labelRef.current?.value ?? fieldForm.label).trim(),
        field_type: fieldForm.field_type,
        is_required: fieldForm.is_required,
        sort_order: fields.length,
        validation_json,
      });
      toast({ title: 'Đã tạo trường JD', description: 'F5 / Làm mới để xác nhận còn trên list.' });
      setFieldForm({
        field_key: '',
        label: '',
        field_type: 'short_text',
        is_required: false,
        validation_source: 'static',
        validation_options: '',
        validation_catalog_key: '',
      });
      setFieldDialogOpen(false);
      await loadAll();
    } catch (err: unknown) {
      toast({
        title: 'Không tạo được trường',
        description: toErrorMessage(err, 'Kiểm tra trùng mã hoặc kiểu trường.'),
        variant: 'destructive',
      });
    }
  };

  const handleEditField = (row: HrmJdFieldDef) => {
    setEditingFieldId(row.id);
    // Pre-fill form with existing data
    let validation_source = 'static';
    let validation_options = '';
    let validation_catalog_key = '';

    if (row.field_type === 'select' && row.validation_json) {
      const vj = row.validation_json as { source?: string; options?: string[]; catalog_key?: string };
      if (vj.source === 'catalog') {
        validation_source = 'catalog';
        validation_catalog_key = vj.catalog_key || '';
      } else {
        validation_source = 'static';
        validation_options = (vj.options || []).join(', ');
      }
    }

    setFieldForm({
      field_key: row.field_key,
      label: row.label,
      field_type: row.field_type,
      is_required: row.is_required,
      validation_source,
      validation_options,
      validation_catalog_key,
    });
    setFieldDialogOpen(true);
  };

  const onUpdateField = async () => {
    if (!companyId || !editingFieldId) return;
    if (!(fieldKeyRef.current?.value ?? fieldForm.field_key).trim() || !(labelRef.current?.value ?? fieldForm.label).trim()) {
      toast({ title: 'Thiếu mã hoặc nhãn trường', variant: 'destructive' });
      return;
    }

    // Validate validation_json for select type
    let validation_json: Record<string, unknown> | undefined;
    if (fieldForm.field_type === 'select') {
      if (fieldForm.validation_source === 'static') {
        const options = (validationOptionsRef.current?.value ?? fieldForm.validation_options)
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        if (options.length === 0) {
          toast({ title: 'Cần ít nhất 1 tùy chọn cho trường Danh sách chọn', variant: 'destructive' });
          return;
        }
        if (options.length > 50) {
          toast({ title: 'Tối đa 50 tùy chọn cho trường Danh sách chọn', variant: 'destructive' });
          return;
        }
        validation_json = { source: 'static', options };
      } else if (fieldForm.validation_source === 'catalog') {
        if (!fieldForm.validation_catalog_key) {
          toast({ title: 'Chọn danh mục nguồn cho trường Danh sách chọn', variant: 'destructive' });
          return;
        }
        validation_json = { source: 'catalog', catalog_key: fieldForm.validation_catalog_key };
      }
    }

    try {
      await updateJdFieldDef(editingFieldId, companyId, {        // field_key: immutable — not in UpdateJdFieldDefDto (forbidNonWhitelisted rejects it)
        label: (labelRef.current?.value ?? fieldForm.label).trim(),
        field_type: fieldForm.field_type,
        is_required: fieldForm.is_required,
        validation_json,
      });
      toast({ title: 'Đã cập nhật trường JD', description: 'F5 / Làm mới để xác nhận còn trên list.' });
      setFieldForm({
        field_key: '',
        label: '',
        field_type: 'short_text',
        is_required: false,
        validation_source: 'static',
        validation_options: '',
        validation_catalog_key: '',
      });
      setEditingFieldId(null);
      setFieldDialogOpen(false);
      await loadAll();
    } catch (err: unknown) {
      toast({
        title: 'Không cập nhật được trường',
        description: toErrorMessage(err, 'Kiểm tra trùng mã hoặc kiểu trường.'),
        variant: 'destructive',
      });
    }
  };

  const onCreateGroup = async () => {
    if (!companyId) return;
    if (!groupForm.group_code.trim() || !groupForm.label.trim()) {
      toast({ title: 'Thiếu mã hoặc nhãn nhóm', variant: 'destructive' });
      return;
    }
    const fieldIds = groupForm.field_ids
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      await createJdGroupDef({
        company_id: companyId,
        group_code: groupForm.group_code.trim(),
        label: groupForm.label.trim(),
        kind: groupForm.kind,
        usage: groupForm.usage,
        view_style: groupForm.view_style,
        fields: fieldIds.map((field_id, sort_order) => ({ field_id, sort_order })),
      });
      toast({ title: 'Đã tạo nhóm thông tin JD' });
      setGroupForm({
        group_code: '',
        label: '',
        kind: 'tenant_custom',
        usage: 'optional_only',
        view_style: 'heading',
        field_ids: '',
      });
      setGroupDialogOpen(false);
      await loadAll();
    } catch (err: unknown) {
      toast({
        title: 'Không tạo được nhóm',
        description: toErrorMessage(err, 'Kiểm tra mã nhóm / field thuộc catalog.'),
        variant: 'destructive',
      });
    }
  };

  const onSavePack = async () => {
    if (!companyId) return;
    if (!packForm.pack_code.trim() || !packForm.label.trim()) {
      toast({ title: 'Thiếu mã hoặc nhãn gói', variant: 'destructive' });
      return;
    }
    const group_codes = packForm.group_codes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (group_codes.length === 0) {
      toast({ title: 'Pack cần ≥1 group always_on', variant: 'destructive' });
      return;
    }
    try {
      await upsertJdDefaultPack({
        company_id: companyId,
        pack_code: packForm.pack_code.trim(),
        label: packForm.label.trim(),
        status: 'published',
        group_codes,
      });
      toast({ title: 'Đã lưu gói mặc định JD' });
      setPackDialogOpen(false);
      await loadAll();
    } catch (err: unknown) {
      toast({
        title: 'Không lưu được pack',
        description: toErrorMessage(err),
        variant: 'destructive',
      });
    }
  };

  const onSaveRules = async () => {
    if (!companyId) return;
    try {
      const parsed = JSON.parse(rulesJson) as HrmJdPackRule[];
      if (!Array.isArray(parsed)) throw new Error('Rules phải là mảng JSON');
      // Strip happens in putJdPackRules (FE-RULES-PUT-STRIP) — pass GET-shaped JSON safely.
      await putJdPackRules({ company_id: companyId, rules: parsed });
      toast({ title: 'Đã lưu quy tắc chọn gói' });
      setRulesDialogOpen(false);
      await loadAll();
    } catch (err: unknown) {
      toast({
        title: 'Không lưu được rules',
        description: toErrorMessage(err, 'JSON rules không hợp lệ.'),
        variant: 'destructive',
      });
    }
  };

  const onPreviewResolve = async () => {
    if (!companyId || !previewPosition.trim()) return;
    try {
      const res = await resolveJdPack({
        company_id: companyId,
        position_code: previewPosition.trim(),
      });
      setPreviewResult(
        `${res.pack_code}${res.pack_label ? ` — ${res.pack_label}` : ''} · ${res.groups?.length ?? 0} nhóm`,
      );
    } catch (err: unknown) {
      setPreviewResult(null);
      toast({
        title: 'Resolve pack thất bại',
        description: toErrorMessage(err, 'Gọi F-JD-RUL-03 resolve — không hardcode FE.'),
        variant: 'destructive',
      });
    }
  };

  const onPublishLayout = async () => {
    if (!companyId) return;
    const ids = layoutFieldIds
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length === 0) {
      toast({ title: 'Chọn field_id cho layout mặc định', variant: 'destructive' });
      return;
    }
    try {
      await putJdDefaultFormLayout({
        company_id: companyId,
        name: 'Layout mặc định JD',
        items: ids.map((field_id, sort_order) => ({
          field_id,
          section: sort_order === 0 ? 'hero' : 'other',
          sort_order,
        })),
      });
      toast({ title: 'Đã publish bố cục mặc định L1' });
      setLayoutDialogOpen(false);
    } catch (err: unknown) {
      toast({
        title: 'Không publish layout',
        description: toErrorMessage(err, 'Title phải đứng đầu (VAL-JD-06).'),
        variant: 'destructive',
      });
    }
  };

  if (!companyId) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground">
          Chưa xác định phạm vi pháp nhân — chọn đơn vị vận hành rồi thử lại.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="jd-dynamic-settings-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-[20px] font-bold tracking-tight text-xevn-text">
            <FileText className="h-5 w-5 text-primary" />
            Cấu hình mô tả công việc (JD)
          </h2>
          <p className="text-sm text-xevn-textSecondary">
            Catalog trường · nhóm thông tin · gói mặc định · rule chọn gói (Q1 @ Cài đặt). Kéo thả khi viết JD ở
            Thư viện.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void loadAll()} disabled={loading}>
          <RefreshCw className="mr-1.5 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      {error ? (
        <div
          className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning"
          role="alert"
        >
          {error}
          <Button type="button" variant="link" className="ml-2 h-auto p-0" onClick={() => void loadAll()}>
            Thử lại
          </Button>
        </div>
      ) : null}

      <Tabs defaultValue="fields" className="space-y-3">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="fields">Trường JD</TabsTrigger>
          <TabsTrigger value="groups">Nhóm thông tin</TabsTrigger>
          <TabsTrigger value="packs">Gói mặc định</TabsTrigger>
          <TabsTrigger value="rules">Quy tắc chọn gói</TabsTrigger>
          <TabsTrigger value="layout">Bố cục mặc định</TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="space-y-3">
          <Dialog open={fieldDialogOpen} onOpenChange={handleFieldDialogOpenChange}>
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 pb-2">
                <div>
                  <CardTitle className="text-base">Catalog trường</CardTitle>
                  <CardDescription>
                    Danh sách trường có thể dùng khi tạo nhóm thông tin JD. Trường không dùng nữa có thể Ngừng
                    thay vì xoá.
                  </CardDescription>
                </div>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    data-testid="jd-settings-field-add-new"
                    onClick={() => setFieldDialogOpen(true)}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Thêm mới
                  </Button>
                </DialogTrigger>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="max-w-sm space-y-1">
                  <Label htmlFor="jd-settings-field-search">Tìm theo mã / nhãn</Label>
                  <Input
                    id="jd-settings-field-search"
                    value={fieldSearch}
                    onChange={(e) => setFieldSearch(e.target.value)}
                    placeholder="Gõ để lọc…"
                  />
                </div>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Đang tải…</p>
                ) : fields.length === 0 ? (
                  <p className="py-6 text-sm text-muted-foreground" data-testid="jd-settings-fields-empty">
                    Chưa có trường — bấm «Thêm mới» ở trên.
                  </p>
                ) : filteredFields.length === 0 ? (
                  <p className="py-6 text-sm text-muted-foreground">Không có trường khớp bộ lọc.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã</TableHead>
                        <TableHead>Nhãn</TableHead>
                        <TableHead>Kiểu</TableHead>
                        <TableHead>TT</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFields.map((row) => (
                        <TableRow key={row.id} data-testid="jd-settings-field-row">
                          <TableCell className="font-mono text-xs">{row.field_key}</TableCell>
                          <TableCell>{row.label}</TableCell>
                          <TableCell className="text-xs">{displayFieldType(row.field_type)}</TableCell>
                          <TableCell className="text-xs">
                            {row.is_active === false ? 'Ngừng' : 'Hiệu lực'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditField(row)}
                            >
                              Sửa
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={row.is_system}
                              onClick={() =>
                                void updateJdFieldDef(row.id, companyId, {
                                  is_active: row.is_active === false,
                                }).then(loadAll)
                              }
                            >
                              {row.is_active === false ? 'Bật' : 'Ngừng'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <DialogContent data-testid="jd-settings-field-dialog">
              <DialogHeader>
                <DialogTitle>{editingFieldId ? 'Sửa trường JD' : 'Thêm trường JD'}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 space-y-1 sm:col-span-6">
                  <Label>Mã trường *</Label>
                  <Input
                    className="xevn-field-code"
                    key={`fkey-${editingFieldId ?? '__new__'}`}
                    ref={fieldKeyRef}
                    defaultValue={fieldForm.field_key}
                    readOnly={!!editingFieldId}

                    onBlur={(e) => setFieldForm((s) => ({ ...s, field_key: e.target.value }))}
                    placeholder="vd: benefits"
                    data-testid="jd-settings-field-key"
                  />
                </div>
                <div className="col-span-12 space-y-1 sm:col-span-6">
                  <Label>Nhãn *</Label>
                  <Input
                    key={`label-${editingFieldId ?? '__new__'}`}
                    ref={labelRef}
                    defaultValue={fieldForm.label}
                    onBlur={(e) => setFieldForm((s) => ({ ...s, label: e.target.value }))}
                    placeholder="Chế độ đãi ngộ"
                    data-testid="jd-settings-field-label"
                  />
                </div>
                <div className="col-span-12 space-y-1 sm:col-span-6">
                  <Label>Kiểu</Label>
                  <Select
                    value={fieldForm.field_type}
                    onValueChange={(v) => setFieldForm((s) => ({ ...s, field_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {displayFieldType(t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {fieldForm.field_type === 'select' && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="col-span-12 space-y-1 sm:col-span-6">
                    <Label>Nguồn danh sách *</Label>
                    <Select
                      value={fieldForm.validation_source}
                      onValueChange={(v) => setFieldForm((s) => ({ ...s, validation_source: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VALIDATION_SOURCE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {fieldForm.validation_source === 'static' && (
                    <div className="col-span-12 space-y-1">
                      <Label>Tùy chọn (cách nhau bằng Enter hoặc dấu phẩy) *</Label>
                      <Textarea
                        key={`vo-${editingFieldId ?? '__new__'}`}
                        ref={validationOptionsRef}
                        defaultValue={fieldForm.validation_options}
                        onBlur={(e) => setFieldForm((s) => ({ ...s, validation_options: e.target.value }))}
                        onKeyDown={(e) => e.stopPropagation()}
                        placeholder="B2&#10;C&#10;D&#10;E"
                        rows={4}
                        className="min-h-[80px]"
                        data-testid="jd-settings-field-options"
                      />
                      <p className="text-xs text-xevn-textSecondary">Mỗi dòng hoặc cách nhau bởi dấu phẩy. Tối thiểu 1, tối đa 50 tùy chọn.</p>
                    </div>
                  )}

                  {fieldForm.validation_source === 'catalog' && (
                    <div className="col-span-12 space-y-1 sm:col-span-6">
                      <Label>Catalog key *</Label>
                      <Select
                        value={fieldForm.validation_catalog_key}
                        onValueChange={(v) => setFieldForm((s) => ({ ...s, validation_catalog_key: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục…" />
                        </SelectTrigger>
                        <SelectContent>
                          {JD_SELECT_ALLOWLIST.map((item) => (
                            <SelectItem key={item.key} value={item.key}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-xevn-textSecondary">Lấy từ danh mục XBOS/HRM có sẵn.</p>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleFieldDialogOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button type="button" onClick={() => void (editingFieldId ? onUpdateField() : onCreateField())} data-testid="jd-settings-field-save">
                  {editingFieldId ? null : <Plus className="mr-1 h-4 w-4" />}
                  {editingFieldId ? 'Lưu' : 'Thêm'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="groups" className="space-y-3">
          <Dialog open={groupDialogOpen} onOpenChange={handleGroupDialogOpenChange}>
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 pb-2">
                <div>
                  <CardTitle className="text-base">Nhóm thông tin JD</CardTitle>
                  <CardDescription>
                    Gộp các trường đã tạo ở tab Trường JD thành một nhóm hiển thị trên JD (nhập mã trường,
                    cách nhau bởi dấu phẩy). Chọn nhóm luôn hiển thị mặc định hay chỉ hiển thị khi cần.
                  </CardDescription>
                </div>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    data-testid="jd-settings-group-add-new"
                    onClick={() => setGroupDialogOpen(true)}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Thêm mới
                  </Button>
                </DialogTrigger>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="max-w-sm space-y-1">
                  <Label htmlFor="jd-settings-group-search">Tìm theo mã / nhãn</Label>
                  <Input
                    id="jd-settings-group-search"
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    placeholder="Gõ để lọc…"
                  />
                </div>
                {groups.length === 0 ? (
                  <p className="py-6 text-sm text-muted-foreground" data-testid="jd-settings-groups-empty">
                    Chưa có nhóm — CTA «Thêm mới» ở trên.
                  </p>
                ) : filteredGroups.length === 0 ? (
                  <p className="py-6 text-sm text-muted-foreground">Không có nhóm khớp bộ lọc.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã</TableHead>
                        <TableHead>Nhãn</TableHead>
                        <TableHead>Cách hiển thị</TableHead>
                        <TableHead>Kiểu trình bày</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGroups.map((row) => (
                        <TableRow key={row.id} data-testid="jd-settings-group-row">
                          <TableCell className="font-mono text-xs">{groupCodeOf(row)}</TableCell>
                          <TableCell>{row.label}</TableCell>
                          <TableCell className="text-xs">{displayGroupUsage(row.usage)}</TableCell>
                          <TableCell className="text-xs">{displayViewStyle(row.view_style)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                void updateJdGroupDef(row.id, companyId, {
                                  is_active: row.is_active === false,
                                }).then(loadAll)
                              }
                            >
                              {row.is_active === false ? 'Bật' : 'Ngừng'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <DialogContent data-testid="jd-settings-group-dialog">
              <DialogHeader>
                <DialogTitle>Thêm nhóm thông tin JD</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 space-y-1 sm:col-span-6">
                  <Label>Mã nhóm *</Label>
                  <Input
                    className="xevn-field-code"
                    value={groupForm.group_code}
                    onChange={(e) => setGroupForm((s) => ({ ...s, group_code: e.target.value }))}
                    placeholder="SEC_CUSTOM_X"
                    data-testid="jd-settings-group-code"
                  />
                </div>
                <div className="col-span-12 space-y-1 sm:col-span-6">
                  <Label>Nhãn *</Label>
                  <Input
                    value={groupForm.label}
                    onChange={(e) => setGroupForm((s) => ({ ...s, label: e.target.value }))}
                    data-testid="jd-settings-group-label"
                  />
                </div>
                <div className="col-span-6 space-y-1">
                  <Label>Cách hiển thị nhóm</Label>
                  <Select
                    value={groupForm.usage}
                    onValueChange={(v) => setGroupForm((s) => ({ ...s, usage: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default_eligible">Mặc định hiển thị</SelectItem>
                      <SelectItem value="optional_only">Chỉ khi cần</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-6 space-y-1">
                  <Label>Kiểu trình bày</Label>
                  <Select
                    value={groupForm.view_style}
                    onValueChange={(v) => setGroupForm((s) => ({ ...s, view_style: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIEW_STYLES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {displayViewStyle(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-12 space-y-1">
                  <Label>Mã trường thuộc nhóm (cách nhau dấu phẩy)</Label>
                  <Input
                    value={groupForm.field_ids}
                    onChange={(e) => setGroupForm((s) => ({ ...s, field_ids: e.target.value }))}
                    placeholder={activeFieldOptions.map((f) => f.id).slice(0, 3).join(',') || 'uuid,…'}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleGroupDialogOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button type="button" onClick={() => void onCreateGroup()} data-testid="jd-settings-group-save">
                  <Plus className="mr-1 h-4 w-4" />
                  Thêm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="packs" className="space-y-3">
          <Dialog open={packDialogOpen} onOpenChange={handlePackDialogOpenChange}>
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 pb-2">
                <div>
                  <CardTitle className="text-base">Gói mặc định</CardTitle>
                  <CardDescription>
                    Chọn các nhóm luôn hiển thị mặc định trong gói này (nhập mã nhóm, cách nhau bởi dấu
                    phẩy, theo đúng thứ tự hiển thị).
                  </CardDescription>
                </div>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    data-testid="jd-settings-pack-add-new"
                    onClick={() => setPackDialogOpen(true)}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Thêm mới
                  </Button>
                </DialogTrigger>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="max-w-sm space-y-1">
                  <Label htmlFor="jd-settings-pack-search">Tìm theo mã / nhãn</Label>
                  <Input
                    id="jd-settings-pack-search"
                    value={packSearch}
                    onChange={(e) => setPackSearch(e.target.value)}
                    placeholder="Gõ để lọc…"
                  />
                </div>
                {packs.length === 0 ? (
                  <p className="py-6 text-sm text-muted-foreground">
                    Chưa có gói mặc định — bấm «Thêm mới» ở trên.
                  </p>
                ) : filteredPacks.length === 0 ? (
                  <p className="py-6 text-sm text-muted-foreground">Không có gói khớp bộ lọc.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã</TableHead>
                        <TableHead>Nhãn</TableHead>
                        <TableHead>Nhóm</TableHead>
                        <TableHead>TT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPacks.map((row) => (
                        <TableRow key={packCodeOf(row) || row.id} data-testid="jd-settings-pack-row">
                          <TableCell className="font-mono text-xs">{packCodeOf(row)}</TableCell>
                          <TableCell>{row.label}</TableCell>
                          <TableCell className="text-xs">
                            {(row.group_codes || row.groups?.map((g) => g.group_code) || []).join(', ') ||
                              '—'}
                          </TableCell>
                          <TableCell className="text-xs">{row.status ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <DialogContent data-testid="jd-settings-pack-dialog">
              <DialogHeader>
                <DialogTitle>Thêm gói mặc định JD</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 space-y-1 sm:col-span-6">
                  <Label>Mã pack *</Label>
                  <Input
                    className="xevn-field-code"
                    value={packForm.pack_code}
                    onChange={(e) => setPackForm((s) => ({ ...s, pack_code: e.target.value }))}
                    placeholder="PACK_…"
                    data-testid="jd-settings-pack-code"
                  />
                </div>
                <div className="col-span-12 space-y-1 sm:col-span-6">
                  <Label>Nhãn *</Label>
                  <Input
                    value={packForm.label}
                    onChange={(e) => setPackForm((s) => ({ ...s, label: e.target.value }))}
                    data-testid="jd-settings-pack-label"
                  />
                </div>
                <div className="col-span-12 space-y-1">
                  <Label>Mã nhóm luôn bật (phân cách bởi dấu phẩy)</Label>
                  <Input
                    value={packForm.group_codes}
                    onChange={(e) => setPackForm((s) => ({ ...s, group_codes: e.target.value }))}
                    placeholder="SEC_META,SEC_ABOUT_ROLE,…"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePackDialogOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button type="button" onClick={() => void onSavePack()} data-testid="jd-settings-pack-save">
                  <Save className="mr-1 h-4 w-4" />
                  Lưu
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="rules" className="space-y-3">
          <Dialog open={rulesDialogOpen} onOpenChange={handleRulesDialogOpenChange}>
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 pb-2">
                <div>
                  <CardTitle className="text-base">Quy tắc chọn gói</CardTitle>
                  <CardDescription>
                    Rule áp dụng theo thứ tự ưu tiên tăng dần để chọn gói mặc định phù hợp cho từng vị trí.
                  </CardDescription>
                </div>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    data-testid="jd-settings-rules-edit"
                    onClick={() => setRulesDialogOpen(true)}
                  >
                    Sửa rules
                  </Button>
                </DialogTrigger>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Đang có {rules.length} rule trên server (sau Làm mới).
                </p>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="jd-settings-resolve-position-input">Xem trước theo mã vị trí</Label>
                    <Input
                      id="jd-settings-resolve-position-input"
                      className="max-w-xs"
                      placeholder="Nhập mã vị trí…"
                      value={previewPosition}
                      onChange={(e) => setPreviewPosition(e.target.value)}
                      data-testid="jd-settings-resolve-position"
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={() => void onPreviewResolve()}>
                    Xem trước gói
                  </Button>
                </div>
                {previewResult ? (
                  <p className="text-sm text-xevn-text" data-testid="jd-settings-resolve-result">
                    <GripVertical className="mr-1 inline h-4 w-4 text-primary" />
                    {previewResult}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <DialogContent className="max-w-2xl" data-testid="jd-settings-rules-dialog">
              <DialogHeader>
                <DialogTitle>Sửa quy tắc chọn gói</DialogTitle>
              </DialogHeader>
              <Textarea
                className="min-h-[180px] font-mono text-xs"
                value={rulesJson}
                onChange={(e) => setRulesJson(e.target.value)}
                data-testid="jd-settings-rules-json"
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleRulesDialogOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button type="button" onClick={() => void onSaveRules()} data-testid="jd-settings-rules-save">
                  <Save className="mr-1 h-4 w-4" />
                  Lưu rules
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="layout" className="space-y-3">
          <Dialog open={layoutDialogOpen} onOpenChange={handleLayoutDialogOpenChange}>
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 pb-2">
                <div>
                  <CardTitle className="text-base">Bố cục mặc định</CardTitle>
                  <CardDescription>
                    Publish flatten field layout — fallback khi chưa có pack. Title field phải đứng đầu.
                  </CardDescription>
                </div>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    data-testid="jd-settings-layout-edit"
                    onClick={() => setLayoutDialogOpen(true)}
                  >
                    Cấu hình bố cục
                  </Button>
                </DialogTrigger>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {layoutFieldIds.trim()
                    ? `Đã chọn ${
                        layoutFieldIds.split(',').map((s) => s.trim()).filter(Boolean).length
                      } trường cho bố cục mặc định.`
                    : 'Chưa cấu hình bố cục mặc định — bấm «Cấu hình bố cục» ở trên.'}
                </p>
              </CardContent>
            </Card>

            <DialogContent data-testid="jd-settings-layout-dialog">
              <DialogHeader>
                <DialogTitle>Cấu hình bố cục mặc định</DialogTitle>
              </DialogHeader>
              <div className="space-y-1">
                <Label htmlFor="jd-settings-layout-fields">
                  Mã trường theo thứ tự hiển thị (cách nhau dấu phẩy, trường tiêu đề đứng đầu)
                </Label>
                <Input
                  id="jd-settings-layout-fields"
                  data-testid="jd-settings-layout-fields"
                  value={layoutFieldIds}
                  onChange={(e) => setLayoutFieldIds(e.target.value)}
                  placeholder={activeFieldOptions.map((f) => f.id).slice(0, 4).join(',')}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleLayoutDialogOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button type="button" onClick={() => void onPublishLayout()}>
                  <Save className="mr-1 h-4 w-4" />
                  Publish layout mặc định
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
