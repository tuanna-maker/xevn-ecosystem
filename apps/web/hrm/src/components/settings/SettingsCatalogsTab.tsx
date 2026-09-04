/**
 * @CODE-MEMORY
 * Screen:     /settings — SettingsCatalogsTab (UF-HRM-10)
 * UC:         UF-HRM-10
 * BR:         XBOS publish → HRM pull catalogs
 * SRS:        docs/hrm/SRS.md § settings catalogs
 * TechSpec:   cd-fb-03 perf audit FE-03
 * Purpose:    Catalog overview + sync/upsert; shares RQ key with Contracts/EmployeeForm.
 * WorkItem:   CD-FB-04-PERF-FIX / P1-HRM-PERF-FE-03
 * Coded:      2026-07-19
 * must_keep:  UF-HRM-10 mutate ACs; invalidate SETTINGS_CATALOGS_QUERY_KEY only
 * LastVerified: apps/web/hrm/src/hooks/p1-hrm-perf-fe-03.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 CD-FB-04-PERF-FIX
 * what: Switch to useSettingsCatalogsOverview + shared invalidate key
 * why: Eliminate duplicate GET /settings-catalogs across HRM screens (FE-03)
 *
 * @CODE-MEMORY-CHANGE 2026-07-20
 * WorkItem: D-HRM-SETTINGS-SYNC-ISO-FORMAT-01
 * change_mode: FIX
 * What: Humanize xbosSyncedAt via formatDisplayDate (dd/MM/yyyy HH:mm)
 * Why: QA menu sweep — raw ISO-Z visible on Danh mục
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-U72-LABEL-FE-01
 * change_mode: FIX
 * What: item status qua resolveSettingsCatalogItemStatusDisplay (Đang dùng/Nháp; unknown→—)
 * Why: BA F-12 / AC-FD-12 FAIL-LABEL-LEAK
 * SRS/BR: docs/hrm/SRS_FIELD_DISPLAY.md §2 F-12 · FR-HRM-U72-LABEL-01
 * must_keep: code cột mono cạnh label; UF-HRM-10 mutate
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-ATT-LVT-SOT-FE-01
 * change_mode: FIX
 * What: leave_types overview — tenantWriter REF-only banner; block extension add/trash; CTA Loại phép ATT
 * Why: HRM-SC-01 dual SoT — tránh 409 HRM-SC-LEAVE-REF-ONLY trên UF-HRM-10
 * must_keep: other catalog mutate paths; U65
 *
 * @CODE-MEMORY-CHANGE 2026-09-04 PO-HRM-SETTINGS-CATALOGS-TABBED-UX-01
 * change_mode: REFACTOR & ENHANCE
 * What: Redesign SettingsCatalogsTab with Sub-Nav Tabs for catalog families & Dialog Portal modal for +Thêm mới
 * Why: User UX feedback — long vertical scrolling was tedious; missing direct +Thêm mới button per catalog family.
 * must_keep: formatDisplayDate(cat.xbosSyncedAt, 'dd/MM/yyyy HH:mm'); isLeaveTypesGroupRefReadOnly; SETTINGS_CATALOGS_QUERY_KEY; useSettingsCatalogsOverview
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Plus, Trash2, Search, Layers, FolderKanban, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { CatalogJobTitlesSettingsPanel } from "@/components/settings/CatalogJobTitlesSettingsPanel";
import {
  requestSettingsCatalogFieldRemoval,
  syncSettingsCatalogsFromXbos,
  upsertSettingsCatalogItem,
} from "@/integrations/hrmApi";
import {
  SETTINGS_CATALOGS_QUERY_KEY,
  useSettingsCatalogsOverview,
} from "@/hooks/useSettingsCatalogsOverview";
import { ApiClientError } from "@/lib/apiError";
import { formatDisplayDate } from "@/lib/formatDisplayDate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resolveCatalogKeyDisplayLabel } from "@/lib/catalogDisplayLabels";
import { resolveSettingsCatalogItemStatusDisplay } from "@/lib/labelMaps";
import { hrmPathWithEmbedSearch } from "@/lib/hrmEmbedNavigation";
import {
  isLeaveTypesGroupRefReadOnly,
  LEAVE_TYPES_REF_READONLY_MD_COPY,
  SETTINGS_ATT_LEAVE_TYPES_PATH,
} from "@/lib/hrmSettingsLeaveTypeSot";

export function SettingsCatalogsTab() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Active Catalog Family Tab & Filter States
  const [activeCatalogKey, setActiveCatalogKey] = useState<string>("");
  const [catalogSearch, setCatalogSearch] = useState<string>("");
  const [tableSearch, setTableSearch] = useState<string>("");
  const [debouncedTableSearch, setDebouncedTableSearch] = useState<string>("");
  const [originFilter, setOriginFilter] = useState<"all" | "xbos" | "hrm">("all");

  // Add Item Modal Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [addCode, setAddCode] = useState<string>("");
  const [addLabel, setAddLabel] = useState<string>("");
  const [addStatus, setAddStatus] = useState<"active" | "draft">("active");

  const overviewQuery = useSettingsCatalogsOverview();
  const scope = overviewQuery.scope;

  // Debounce table search (300ms - Rule U-10)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTableSearch(tableSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [tableSearch]);

  const syncMutation = useMutation({
    mutationFn: () => syncSettingsCatalogsFromXbos(scope!),
    onSuccess: (data) => {
      toast.success(t("settings.catalogs.syncDone", { count: data.pulledKeys.length }));
      void queryClient.invalidateQueries({ queryKey: [SETTINGS_CATALOGS_QUERY_KEY] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof ApiClientError ? e.message : t("common.error");
      toast.error(msg);
    },
  });

  const appendMutation = useMutation({
    mutationFn: (payload: { catalogKey: string; code: string; label: string; status: "active" | "draft" }) =>
      upsertSettingsCatalogItem(
        {
          companyId: scope!.companyId,
          catalogKey: payload.catalogKey,
          code: payload.code.trim(),
          label: payload.label.trim(),
          status: payload.status,
        },
        scope!,
      ),
    onSuccess: () => {
      toast.success(t("settings.catalogs.savedExtensions"));
      setAddCode("");
      setAddLabel("");
      setAddStatus("active");
      setIsAddDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: [SETTINGS_CATALOGS_QUERY_KEY] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof ApiClientError ? e.message : t("common.error");
      toast.error(msg);
    },
  });

  const removeRequestMutation = useMutation({
    mutationFn: (payload: { catalogKey: string; code: string; label?: string }) =>
      requestSettingsCatalogFieldRemoval(
        payload.catalogKey,
        {
          code: payload.code,
          label: payload.label,
          reason:
            "Yêu cầu xóa trường danh mục từ HRM công ty. Cần phê duyệt từ XBOS và nhóm lãnh đạo cấp tập đoàn.",
          requested_by_name: user?.user_metadata?.full_name ?? undefined,
          requested_by_email: user?.email ?? undefined,
        },
        scope!,
      ),
    onSuccess: (data) => {
      const leadershipText =
        data.leadershipEmails && data.leadershipEmails.length > 0
          ? ` | leadership: ${data.leadershipEmails.join(", ")}`
          : "";
      toast.success(`Đã gửi yêu cầu xóa trường (${data.requestId})${leadershipText}`);
    },
    onError: (e: unknown) => {
      const msg = e instanceof ApiClientError ? e.message : t("common.error");
      toast.error(msg);
    },
  });

  const catalogs = overviewQuery.catalogs;
  const attLeaveTypesSettingsHref = hrmPathWithEmbedSearch(SETTINGS_ATT_LEAVE_TYPES_PATH);

  // Set default active tab when catalogs load
  useEffect(() => {
    if (catalogs.length > 0 && (!activeCatalogKey || !catalogs.some((c) => c.catalogKey === activeCatalogKey))) {
      setActiveCatalogKey(catalogs[0].catalogKey);
    }
  }, [catalogs, activeCatalogKey]);

  // Filter catalog family tabs by user search
  const filteredCatalogTabs = useMemo(() => {
    if (!catalogSearch.trim()) return catalogs;
    const term = catalogSearch.toLowerCase().trim();
    return catalogs.filter((c) => {
      const label = resolveCatalogKeyDisplayLabel(c.catalogKey, c.name).toLowerCase();
      return label.includes(term) || c.catalogKey.toLowerCase().includes(term);
    });
  }, [catalogs, catalogSearch]);

  // Current active catalog object
  const activeCatalog = useMemo(
    () => catalogs.find((c) => c.catalogKey === activeCatalogKey) ?? catalogs[0],
    [catalogs, activeCatalogKey],
  );

  const activeLeaveTypesRefOnly = isLeaveTypesGroupRefReadOnly(activeCatalog);

  // Filter items in table by code/label & origin
  const filteredItems = useMemo(() => {
    if (!activeCatalog) return [];
    let items = activeCatalog.effectiveItems;

    if (originFilter === "xbos") {
      items = items.filter((item) => item.origin === "xbos");
    } else if (originFilter === "hrm") {
      items = items.filter((item) => item.origin === "hrm");
    }

    if (debouncedTableSearch.trim()) {
      const q = debouncedTableSearch.toLowerCase().trim();
      items = items.filter(
        (item) => item.code.toLowerCase().includes(q) || item.label.toLowerCase().includes(q),
      );
    }

    return items;
  }, [activeCatalog, originFilter, debouncedTableSearch]);

  const handleOpenAddDialog = () => {
    setAddCode("");
    setAddLabel("");
    setAddStatus("active");
    setIsAddDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (!activeCatalogKey || !addCode.trim() || !addLabel.trim()) return;
    appendMutation.mutate({
      catalogKey: activeCatalogKey,
      code: addCode.trim(),
      label: addLabel.trim(),
      status: addStatus,
    });
  };

  if (!scope) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.catalogs.title")}</CardTitle>
          <CardDescription>{t("settings.catalogs.noCompany")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const activeCatalogTitle = activeCatalog
    ? resolveCatalogKeyDisplayLabel(activeCatalog.catalogKey, activeCatalog.name)
    : "";

  return (
    <div className="space-y-4">
      {/* Top Header & Sync Action */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-bold">{t("settings.catalogs.title")}</CardTitle>
            </div>
            <CardDescription className="text-sm">
              {t("settings.catalogs.subtitle")}
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-2 shadow-xs border-slate-300 hover:bg-slate-50"
            disabled={syncMutation.isPending}
            onClick={() => syncMutation.mutate()}
          >
            <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? "animate-spin text-primary" : ""}`} />
            {t("settings.catalogs.syncFromXbos")}
          </Button>
        </CardHeader>
      </Card>

      {overviewQuery.isLoading ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
          </div>
        </Card>
      ) : overviewQuery.isError ? (
        <Card className="p-8 text-center border-red-200 bg-red-50/50">
          <p className="text-sm font-medium text-destructive">{t("settings.catalogs.loadError")}</p>
        </Card>
      ) : catalogs.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">{t("settings.catalogs.emptyCatalogs")}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Sub-Nav Catalog Family Tabs */}
          <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200 space-y-2">
            {/* Filter Search Bar for Tabs (if > 5 catalog families) */}
            {catalogs.length > 5 && (
              <div className="px-1 pt-1 pb-2 flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Lọc danh mục (Loại HĐ, Khu vực, Chức danh...)"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="pl-8 h-8 text-xs bg-white border-slate-200"
                  />
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {filteredCatalogTabs.length} / {catalogs.length} danh mục
                </div>
              </div>
            )}

            {/* Scrollable Horizontal Pill Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {filteredCatalogTabs.map((cat) => {
                const title = resolveCatalogKeyDisplayLabel(cat.catalogKey, cat.name);
                const isActive = cat.catalogKey === activeCatalogKey;
                const totalCount = cat.effectiveItems.length;

                return (
                  <button
                    key={cat.catalogKey}
                    type="button"
                    onClick={() => {
                      setActiveCatalogKey(cat.catalogKey);
                      setTableSearch("");
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-white text-primary shadow-sm border border-slate-200 ring-1 ring-primary/10"
                        : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 border border-transparent"
                    }`}
                  >
                    <span>{title}</span>
                    <Badge
                      variant={isActive ? "default" : "secondary"}
                      className={`text-[10px] px-1.5 py-0 h-4 min-w-4 justify-center ${
                        isActive ? "bg-primary text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {totalCount}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Catalog View Card */}
          {activeCatalog && (
            activeCatalogKey === 'job_titles' || activeCatalogKey === 'positions' || activeCatalogKey === 'employee_positions' ? (
              <CatalogJobTitlesSettingsPanel />
            ) : (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/40 pb-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900" title={activeCatalog.catalogKey}>
                        {activeCatalogTitle}
                      </h3>
                      <Badge variant="outline" className="font-mono text-[11px] text-slate-500 bg-white">
                        {activeCatalog.catalogKey}
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        {t("settings.catalogs.badgeXbos", { n: activeCatalog.xbosItems.length })}
                      </Badge>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {t("settings.catalogs.badgeHrm", { n: activeCatalog.hrmExtensionItems.length })}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500" data-testid="catalog-sync-stamp">
                      {activeCatalog.domain ? `${activeCatalog.domain} · ` : ""}
                      {activeCatalog.xbosSyncedAt
                        ? t("settings.catalogs.xbosSyncedAt", {
                            time: formatDisplayDate(activeCatalog.xbosSyncedAt, "dd/MM/yyyy HH:mm"),
                          })
                        : t("settings.catalogs.notSyncedYet")}
                    </p>

                    {activeLeaveTypesRefOnly ? (
                      <p
                        className="text-xs font-medium text-amber-800 flex items-center gap-1 mt-1"
                        data-testid={`catalog-leave-types-tenant-writer-${activeCatalog.catalogKey}`}
                      >
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                        REF tập đoàn — Quản lý CRUD tenant tại: <Link to={attLeaveTypesSettingsHref} className="underline font-bold">Tab Loại phép ATT</Link>
                      </p>
                    ) : null}
                  </div>

                  {/* Primary Action Button: + Thêm mới [Catalog Name] */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="gap-1.5 shadow-xs font-medium bg-primary hover:bg-primary/90 text-white"
                      disabled={activeLeaveTypesRefOnly}
                      onClick={handleOpenAddDialog}
                    >
                      <Plus className="h-4 w-4" />
                      Thêm mới {activeCatalogTitle}
                    </Button>
                  </div>
                </div>

                {/* Filter Controls Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder={`Tìm theo mã hoặc nhãn trong ${activeCatalogTitle}...`}
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      className="pl-9 h-9 text-xs bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-slate-500 font-normal">Nguồn gốc:</Label>
                    <Select
                      value={originFilter}
                      onValueChange={(v: "all" | "xbos" | "hrm") => setOriginFilter(v)}
                    >
                      <SelectTrigger className="h-9 text-xs w-[130px] bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả nguồn</SelectItem>
                        <SelectItem value="xbos">Từ XBOS</SelectItem>
                        <SelectItem value="hrm">Thêm từ HRM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {filteredItems.length === 0 ? (
                  <div className="py-12 px-4 text-center space-y-3">
                    <Layers className="h-10 w-10 text-slate-300 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-700">Chưa có mục danh mục phù hợp</p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        {tableSearch.trim()
                          ? `Không tìm thấy mục nào khớp với từ khóa "${tableSearch}".`
                          : `Chưa có mục nào trong danh mục ${activeCatalogTitle}.`}
                      </p>
                    </div>
                    {!activeLeaveTypesRefOnly && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={handleOpenAddDialog}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Thêm mới {activeCatalogTitle}
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-slate-50/60">
                      <TableRow>
                        <TableHead className="w-[180px] font-semibold text-slate-700">
                          {t("settings.catalogs.colCode")}
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700">
                          {t("settings.catalogs.colLabel")}
                        </TableHead>
                        <TableHead className="w-[140px] font-semibold text-slate-700">
                          {t("settings.catalogs.colOrigin")}
                        </TableHead>
                        <TableHead className="w-[140px] font-semibold text-slate-700">
                          {t("settings.catalogs.colStatus")}
                        </TableHead>
                        <TableHead className="w-[80px] text-right font-semibold text-slate-700">
                          Thao tác
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((row) => {
                        const statusDisplay = resolveSettingsCatalogItemStatusDisplay(row.status);
                        const isActiveStatus = row.status === "active";

                        return (
                          <TableRow key={`${activeCatalog.catalogKey}-${row.code}`} className="hover:bg-slate-50/80">
                            <TableCell className="font-mono text-xs font-semibold text-slate-800">
                              {row.code}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-slate-900">
                              {row.label}
                            </TableCell>
                            <TableCell>
                              {row.origin === "xbos" ? (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-[11px]">
                                  {t("settings.catalogs.originXbos")}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]">
                                  {t("settings.catalogs.originHrm")}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {isActiveStatus ? (
                                <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {statusDisplay}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 text-[11px]">
                                  {statusDisplay}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {row.origin === "hrm" && !activeLeaveTypesRefOnly && (
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                  title="Gửi yêu cầu xóa trường danh mục"
                                  disabled={removeRequestMutation.isPending}
                                  onClick={() =>
                                    removeRequestMutation.mutate({
                                      catalogKey: activeCatalog.catalogKey,
                                      code: row.code,
                                      label: row.label,
                                    })
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )
        )}
        </div>
      )}

      {/* Command Center Portal Modal: Add Item Dialog (Rule #14/#15) */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-slate-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Plus className="h-5 w-5 text-primary" />
              Thêm mới mục danh mục — {activeCatalogTitle}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Khai báo mục danh mục bổ sung (HRM) cho danh mục <span className="font-semibold text-slate-700">{activeCatalogTitle}</span> ({activeCatalogKey})
            </DialogDescription>
          </DialogHeader>

          {activeLeaveTypesRefOnly ? (
            <div
              className="rounded-md border border-amber-200 bg-amber-50 p-4 space-y-2"
              data-testid="settings-catalogs-leave-types-ref-readonly"
            >
              <p className="text-sm text-amber-900">{LEAVE_TYPES_REF_READONLY_MD_COPY}</p>
              <Button asChild variant="outline" size="sm" data-testid="settings-catalogs-open-att-leave-types">
                <Link to={attLeaveTypesSettingsHref}>Mở tab Loại phép ATT</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="ext-code" className="text-xs font-semibold text-slate-700">
                  {t("settings.catalogs.colCode")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ext-code"
                  value={addCode}
                  onChange={(e) => setAddCode(e.target.value)}
                  placeholder="VD: HN, HDLD_12, KHO_01"
                  autoComplete="off"
                  className="font-mono uppercase text-xs"
                />
                <p className="text-[11px] text-slate-400">Mã danh mục duy nhất trong hệ thống (viết hoa, không dấu).</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ext-label" className="text-xs font-semibold text-slate-700">
                  {t("settings.catalogs.colLabel")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ext-label"
                  value={addLabel}
                  onChange={(e) => setAddLabel(e.target.value)}
                  placeholder="VD: Chi nhánh Hà Nội, Hợp đồng thử việc"
                  autoComplete="off"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ext-status" className="text-xs font-semibold text-slate-700">
                  Trạng thái áp dụng
                </Label>
                <Select
                  value={addStatus}
                  onValueChange={(val: "active" | "draft") => setAddStatus(val)}
                >
                  <SelectTrigger id="ext-status" className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang dùng (Active)</SelectItem>
                    <SelectItem value="draft">Nháp (Draft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Hủy
            </Button>
            {!activeLeaveTypesRefOnly && (
              <Button
                type="button"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white font-medium"
                disabled={
                  appendMutation.isPending ||
                  !activeCatalogKey ||
                  !addCode.trim() ||
                  !addLabel.trim()
                }
                onClick={handleSaveItem}
              >
                {appendMutation.isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Lưu mục danh mục
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
