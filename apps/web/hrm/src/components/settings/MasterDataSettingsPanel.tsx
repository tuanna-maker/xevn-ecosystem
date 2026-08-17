/**
 * @CODE-MEMORY
 * Screen:     /settings — Master data CRUD (FR-HRM-SC-POS/LEAVE/DEC + JT/PAY pointers)
 * UC:         FR-HRM-SC-POS-01 · SC-LEAVE-01 · SC-DEC-01 · SC-JT-01 · SC-PAY-01
 * BR:         BR-HRM-MD-01 · ADR S3 Settings UX on L1/L2a
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH_DELTA_CAI_DAT_20260723.md §2–6
 * TechSpec:   docs/hrm/TECHSPEC.md §18.1 · POST /settings-catalogs/items
 * Purpose:    CRUD UX chức danh/phòng ban/loại nghỉ/loại QĐ; deep-link JT + thành phần lương.
 * WorkItem:   D-HRM-SETTINGS-MD-CRUD-FE-01
 * Coded:      2026-07-23
 * Callers:    pages/Settings.tsx tab master-data
 * Callees:    useSettingsCatalogsOverview · upsertSettingsCatalogItem · CatalogSearchPicker
 * Impact:     Missing panel → free-text forms / orphan hardcode
 * must_keep:  U65 no seed; empty/loading/error; invalidate SETTINGS_CATALOGS_QUERY_KEY after Lưu
 * SOLID:      Panel owns catalog mutate; JT/PAY stay domain tabs (Recruitment/Payroll)
 * LastVerified: docs/qa/evidence/fe-hrm-settings-md-crud-01-20260723.md
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem:   D-HRM-SETTINGS-MD-FORM-VIS-FE-01
 * Coded:      2026-07-25
 * What:       Upsert form `#md-code-*` mounts whenever scope allows — not gated by catalog
 *             loading/error early-return; CRUD TabsContent forceMount so nested Loại nghỉ /
 *             Phòng ban keep form in DOM (QA U65 create path).
 * Why:        qa-hrm-settings-master-data-02 — `#md-code-leaveTypes` missing → create→F5 blocked
 * SRS:        FR-HRM-SC-POS-01 AC-SC-POS-01 · FR-HRM-SC-LEAVE-01 · AC-SET-FS (BA matrix)
 * TechSpec:   §18.1 Settings CRUD + POST /settings-catalogs/items
 * must_keep:  dept/leave empty CTA + value=code picker locks (LEAVE/DEPT-FE-01); U65 no seed
 * LastVerified: docs/qa/evidence/dev-fe-hrm-settings-md-form-vis-01-20260725.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-U72-LABEL-FE-01
 * change_mode: FIX
 * What: status cột → resolveSettingsCatalogItemStatusDisplay (Đang dùng/Nháp; unknown→—)
 * Why: BA F-12 / AC-FD-12
 * SRS/BR: docs/hrm/SRS_FIELD_DISPLAY.md §2 F-12 · FR-HRM-U72-LABEL-01
 * must_keep: code mono cạnh label; form mount vis-fe-01
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-FE-ERP-E1B-MD-PANEL-01
 * change_mode: ADD
 * What: ≥10 MD CRUD buckets (E1-B); DEC keys hr_decision_types+decision_types;
 *       writeKey prefer hr_decision_types; search filter mã/nhãn; Ngưng = status draft;
 *       merge alias family items; tab labels VI (U72). Keep JT/PAY deep-link stubs.
 * Why: AC-SET-UI-01..07 · FR-HRM-SC-SET-UI-01 · BR-HRM-SC-ALIAS-01/02
 * SRS: docs/program/deltas/BA_ERP_E1B_SRS_01_20260728.md
 * TechSpec/DB/API: DB_DESIGN_HRM_SETTINGS_E1B · API_DESIGN_HRM_SETTINGS_E1B
 * SA: docs/qa/evidence/sa-erp-e1b-design-review-01-20260728.md
 * must_keep: 4 bucket cũ; forceMount form; U65 no seed; cấm work_shifts dual-write; cấm E1-A FREE_TEXT rewrite
 * LastVerified: docs/qa/evidence/d-fe-erp-e1b-md-panel-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: BUILD-GAP-MD-PANEL-01
 * change_mode: FIX
 * What: Khôi phục file panel từ git 43c479a — import Settings.tsx resolve lại; mdBucketRegistry 14 bucket giữ nguyên trên disk.
 * Why: QA BUILD_GAP-MD-PANEL-01 — Vite 500 tab «Danh mục nghiệp vụ» UF-HRM-10
 * must_keep: E1-B buckets; forceMount form; U65 no seed; Leave/AUTH/EMP/CAT/Contracts/Payroll paths untouched
 * LastVerified: docs/qa/evidence/build-gap-md-panel-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-ATT-LVT-SOT-FE-01
 * change_mode: FIX
 * What: leaveTypes bucket — hide extension upsert/Ngưng when overview tenantWriter.groupRefReadOnly; CTA tab Loại phép ATT
 * Why: HRM-SC-01 dual SoT — cấm dual master UX (409 HRM-SC-LEAVE-REF-ONLY)
 * SRS: FR-HRM-SC-LEAVE-01 · API_DESIGN_HRM_SETTINGS_CATALOG.md
 * must_keep: other buckets md-code-* U65; PUT att leave-types admin tab; effective picker SoT
 * LastVerified: docs/qa/evidence/po-hrm-settings-att-lvt-sot-fe-01.md
 */

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  SETTINGS_CATALOGS_QUERY_KEY,
  useSettingsCatalogsOverview,
} from '@/hooks/useSettingsCatalogsOverview';
import {
  syncSettingsCatalogsFromXbos,
  upsertSettingsCatalogItem,
  type HrmSettingsCatalogItem,
} from '@/integrations/hrmApi';
import { ApiClientError } from '@/lib/apiError';
import {
  filterCatalogPickerOptions,
  findCatalogRowByKeys,
  HRM_MASTER_DATA_CATALOG_KEYS,
  mergeEffectiveItemsByKeys,
  resolveCatalogWriteKey,
  toCatalogPickerOptions,
} from '@/lib/catalogSearchPicker';
import { MD_BUCKET_META, MD_BUCKET_ORDER, type MdBucket } from '@/lib/mdBucketRegistry';
import { resolveCatalogKeyDisplayLabel } from '@/lib/catalogDisplayLabels';
import { resolveSettingsCatalogItemStatusDisplay } from '@/lib/labelMaps';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { hrmPathWithEmbedSearch } from '@/lib/hrmEmbedNavigation';
import {
  isLeaveTypesGroupRefReadOnly,
  LEAVE_TYPES_REF_READONLY_MD_COPY,
  SETTINGS_ATT_LEAVE_TYPES_PATH,
} from '@/lib/hrmSettingsLeaveTypeSot';

function CatalogItemsTable({
  items,
  emptyLabel,
  onPick,
  onDeactivate,
  deactivatingCode,
  extensionMutateDisabled = false,
}: {
  items: HrmSettingsCatalogItem[];
  emptyLabel: string;
  onPick: (row: HrmSettingsCatalogItem) => void;
  onDeactivate: (row: HrmSettingsCatalogItem) => void;
  deactivatingCode: string | null;
  extensionMutateDisabled?: boolean;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">{emptyLabel}</p>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã</TableHead>
          <TableHead>Tên</TableHead>
          <TableHead>Nguồn</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead className="w-[120px]">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((row) => (
          <TableRow
            key={row.code}
            className="cursor-pointer"
            data-testid={`md-row-${row.code}`}
            onClick={() => onPick(row)}
          >
            <TableCell className="font-mono text-xs">{row.code}</TableCell>
            <TableCell>{row.label}</TableCell>
            <TableCell>
              <Badge variant={row.origin === 'xbos' ? 'secondary' : 'outline'}>
                {row.origin === 'xbos' ? 'XBOS' : 'HRM'}
              </Badge>
            </TableCell>
            <TableCell>{resolveSettingsCatalogItemStatusDisplay(row.status)}</TableCell>
            <TableCell>
              {row.status === 'active' && !extensionMutateDisabled ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-testid={`md-deactivate-${row.code}`}
                  disabled={deactivatingCode === row.code}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeactivate(row);
                  }}
                >
                  Ngưng
                </Button>
              ) : row.status === 'active' && extensionMutateDisabled ? (
                <span className="text-xs text-muted-foreground">Chỉ đọc REF</span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function MasterDataBucketPanel({ bucket }: { bucket: MdBucket }) {
  const meta = MD_BUCKET_META[bucket];
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [search, setSearch] = useState('');
  const [deactivatingCode, setDeactivatingCode] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const overview = useSettingsCatalogsOverview();
  const catalogs = overview.catalogs ?? [];

  const catalog = useMemo(
    () => findCatalogRowByKeys(catalogs, meta.keys),
    [catalogs, meta.keys],
  );

  const items = useMemo(
    () => mergeEffectiveItemsByKeys(catalogs, meta.keys) as HrmSettingsCatalogItem[],
    [catalogs, meta.keys],
  );

  const writeCatalogKey = useMemo(
    () => resolveCatalogWriteKey(catalogs, meta.keys, meta.writeKey),
    [catalogs, meta.keys, meta.writeKey],
  );

  const leaveTypesRefReadOnly =
    bucket === 'leaveTypes' && isLeaveTypesGroupRefReadOnly(catalog ?? undefined);

  const attLeaveTypesSettingsHref = hrmPathWithEmbedSearch(SETTINGS_ATT_LEAVE_TYPES_PATH);

  const filteredItems = useMemo(() => {
    const opts = toCatalogPickerOptions(items, { includeInactive: true });
    const matched = new Set(filterCatalogPickerOptions(opts, search).map((o) => o.value));
    if (!search.trim()) return items;
    return items.filter((row) => matched.has(row.code));
  }, [items, search]);

  const upsertMutation = useMutation({
    mutationFn: (input: { code: string; label: string; status?: 'active' | 'draft' }) =>
      upsertSettingsCatalogItem(
        {
          companyId: overview.scope!.companyId,
          catalogKey: writeCatalogKey,
          code: input.code.trim(),
          label: input.label.trim(),
          status: input.status,
        },
        overview.scope!,
      ),
    onSuccess: (_data, vars) => {
      toast.success(
        vars.status === 'draft'
          ? 'Đã ngưng mục danh mục — vẫn giữ lịch sử trên danh sách.'
          : 'Đã lưu mục danh mục — làm mới danh sách.',
      );
      if (vars.status !== 'draft') {
        setCode('');
        setLabel('');
      }
      setDeactivatingCode(null);
      void queryClient.invalidateQueries({ queryKey: [SETTINGS_CATALOGS_QUERY_KEY] });
    },
    onError: (e: unknown) => {
      setDeactivatingCode(null);
      toast.error(e instanceof ApiClientError ? e.message : 'Không lưu được mục danh mục');
    },
  });

  if (!overview.scope) {
    return (
      <p className="text-sm text-muted-foreground" data-testid={`md-bucket-${bucket}-no-scope`}>
        Chưa chọn phạm vi công ty — mở HRM từ Command Center.
      </p>
    );
  }

  /** List may load/fail; upsert form MUST stay mounted when scope allows (AC-SC-POS-01 / U65). */
  const listBlock = overview.isLoading ? (
    <p className="text-sm text-muted-foreground" data-testid={`md-bucket-${bucket}-loading`}>
      Đang tải danh mục…
    </p>
  ) : overview.isError ? (
    <p className="text-sm text-destructive" role="alert" data-testid={`md-bucket-${bucket}-error`}>
      Không tải được danh mục Cài đặt. Thử đồng bộ XBOS hoặc tải lại trang. Vẫn có thể thêm mục bên dưới.
    </p>
  ) : (
    <div className="space-y-3">
      <div className="max-w-md space-y-1.5">
        <Label htmlFor={`md-search-${bucket}`}>Tìm theo mã / tên</Label>
        <Input
          id={`md-search-${bucket}`}
          data-testid={`md-search-${bucket}`}
          className="rounded-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Gõ ≥1 ký tự để lọc…"
        />
      </div>
      <CatalogItemsTable
        items={filteredItems}
        emptyLabel={
          items.length === 0
            ? leaveTypesRefReadOnly
              ? 'Chưa có mục REF — đồng bộ XBOS hoặc cấu hình loại phép tại tab Loại phép ATT.'
              : 'Chưa có mục — đồng bộ XBOS hoặc thêm mục bên dưới.'
            : 'Không có mục khớp bộ lọc.'
        }
        deactivatingCode={deactivatingCode}
        extensionMutateDisabled={leaveTypesRefReadOnly}
        onPick={(row) => {
          setCode(row.code);
          setLabel(row.label);
        }}
        onDeactivate={(row) => {
          setDeactivatingCode(row.code);
          upsertMutation.mutate({
            code: row.code,
            label: row.label || row.code,
            status: 'draft',
          });
        }}
      />
    </div>
  );

  return (
    <div className="space-y-4" data-testid={`md-bucket-${bucket}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-foreground">{meta.title}</h3>
          <p className="text-sm text-muted-foreground">{meta.description}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {meta.fr}
            {catalog
              ? ` · ${resolveCatalogKeyDisplayLabel(catalog.catalogKey, catalog.name)}`
              : ' · chưa có snapshot — thêm mục sẽ tạo extension'}
          </p>
        </div>
      </div>

      {listBlock}

      {leaveTypesRefReadOnly ? (
        <div
          className="rounded-card border border-amber-200 bg-amber-50/80 p-4 space-y-3"
          data-testid="md-leave-types-ref-readonly-banner"
        >
          <p className="text-sm text-foreground">{LEAVE_TYPES_REF_READONLY_MD_COPY}</p>
          <p className="text-xs text-muted-foreground">
            Picker nghỉ phép dùng{' '}
            <span className="font-mono">GET …/attendance/leave-types/effective</span> — không thêm
            extension trên leave_types.
          </p>
          <Button asChild variant="default" size="sm" data-testid="md-leave-types-open-att-tab">
            <Link to={attLeaveTypesSettingsHref}>Mở tab Loại phép ATT</Link>
          </Button>
        </div>
      ) : (
        <div
          className="rounded-card border border-xevn-border p-4 space-y-3 bg-surface/80"
          data-testid={`md-upsert-form-${bucket}`}
        >
          <p className="text-sm font-medium">Thêm / cập nhật mục (extension HRM)</p>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4 space-y-1.5">
              <Label htmlFor={`md-code-${bucket}`}>Mã *</Label>
              <Input
                id={`md-code-${bucket}`}
                data-testid={`md-code-${bucket}`}
                className="rounded-input font-mono text-sm"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={meta.codePlaceholder}
                disabled={upsertMutation.isPending}
              />
            </div>
            <div className="sm:col-span-5 space-y-1.5">
              <Label htmlFor={`md-label-${bucket}`}>Tên hiển thị *</Label>
              <Input
                id={`md-label-${bucket}`}
                data-testid={`md-label-${bucket}`}
                className="rounded-input"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={meta.labelPlaceholder}
                disabled={upsertMutation.isPending}
              />
            </div>
            <div className="sm:col-span-3 flex items-end">
              <Button
                type="button"
                className="w-full"
                data-testid={`md-save-${bucket}`}
                disabled={
                  upsertMutation.isPending || !code.trim() || !label.trim()
                }
                onClick={() =>
                  upsertMutation.mutate({
                    code: code.trim(),
                    label: label.trim(),
                    status: 'active',
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                Lưu
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Sau Lưu danh sách cập nhật; F5 vẫn còn (U65). Chọn dòng để sửa nhãn; Ngưng = soft-stop (không xóa
            cứng). Form nghiệp vụ chỉ chọn qua picker — không gõ free-text SoT.
          </p>
        </div>
      )}
    </div>
  );
}

/** Compact preview that Settings pickers resolve the same catalog options. */
function PickerSmokePreview() {
  const overview = useSettingsCatalogsOverview();
  const [value, setValue] = useState('');
  const options = useMemo(() => {
    const items = mergeEffectiveItemsByKeys(
      overview.catalogs,
      HRM_MASTER_DATA_CATALOG_KEYS.leaveTypes,
    );
    return toCatalogPickerOptions(items);
  }, [overview.catalogs]);

  return (
    <div className="space-y-2 max-w-md">
      <Label>Thử picker loại nghỉ (AC-HRM-PICKER-01)</Label>
      <CatalogSearchPicker
        options={options}
        value={value}
        onValueChange={setValue}
        loading={overview.isLoading}
        errorText={overview.isError ? 'Lỗi tải danh mục' : undefined}
        placeholder="Chọn loại nghỉ…"
      />
    </div>
  );
}

export function MasterDataSettingsPanel() {
  const overview = useSettingsCatalogsOverview();
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: () => syncSettingsCatalogsFromXbos(overview.scope!),
    onSuccess: (data) => {
      toast.success(`Đã đồng bộ ${data.pulledKeys.length} danh mục từ XBOS`);
      void queryClient.invalidateQueries({ queryKey: [SETTINGS_CATALOGS_QUERY_KEY] });
    },
    onError: (e: unknown) => {
      toast.error(e instanceof ApiClientError ? e.message : 'Đồng bộ XBOS thất bại');
    },
  });

  return (
    <div className="space-y-4" data-testid="md-settings-panel">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Danh mục nghiệp vụ (master data)</CardTitle>
            <CardDescription>
              ≥10 nhóm danh mục ERP (E1-B) — CRUD Cài đặt theo FR-HRM-SC-*; mẫu JD và vận hành TP lương tại
              module chuyên biệt. Tab và trạng thái hiển thị tiếng Việt (U72); mã kỹ thuật chỉ trên Network.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="md-sync-xbos"
            disabled={!overview.scope || syncMutation.isPending}
            onClick={() => syncMutation.mutate()}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`}
            />
            Đồng bộ XBOS
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="positions" className="space-y-4">
            <TabsList
              className="flex flex-wrap h-auto gap-1 p-1"
              data-testid="md-bucket-tabs"
            >
              {MD_BUCKET_ORDER.map((bucket) => (
                <TabsTrigger key={bucket} value={bucket} data-testid={`md-tab-${bucket}`}>
                  {MD_BUCKET_META[bucket].title}
                </TabsTrigger>
              ))}
              <TabsTrigger value="jt" data-testid="md-tab-jt">
                Mẫu JD
              </TabsTrigger>
              <TabsTrigger value="pay" data-testid="md-tab-pay">
                Phân hệ lương
              </TabsTrigger>
            </TabsList>

            {/* forceMount: keep #md-code-* in DOM for nested tabs (QA create path); Radix hides inactive */}
            {MD_BUCKET_ORDER.map((bucket) => (
              <TabsContent
                key={bucket}
                value={bucket}
                forceMount
                className="data-[state=inactive]:hidden"
              >
                <MasterDataBucketPanel bucket={bucket} />
              </TabsContent>
            ))}
            <TabsContent value="jt" className="space-y-3">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">FR-HRM-SC-JT-01</strong> — CRUD mẫu tin tuyển dụng
                (company-local) tại Thư viện JD. YCTD chọn mẫu bằng picker có search.
              </p>
              <Button asChild variant="default">
                <Link to="/recruitment">Mở Tuyển dụng → tab Thư viện JD</Link>
              </Button>
            </TabsContent>
            <TabsContent value="pay" className="space-y-3">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">FR-HRM-SC-PAY-01</strong> — CRUD vận hành thành phần
                lương tại Phân hệ Lương. Dictionary Settings ở tab «Thành phần lương (danh mục)».
              </p>
              <Button asChild variant="default">
                <Link to="/payroll">Mở Lương → tab Thành phần lương</Link>
              </Button>
            </TabsContent>
          </Tabs>

          <div className="border-t pt-4">
            <PickerSmokePreview />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
