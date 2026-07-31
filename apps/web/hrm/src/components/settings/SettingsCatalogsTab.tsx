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
 */
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
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
import { resolveCatalogKeyDisplayLabel } from "@/lib/catalogDisplayLabels";
import { resolveSettingsCatalogItemStatusDisplay } from "@/lib/labelMaps";

export function SettingsCatalogsTab() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [catalogKeyInput, setCatalogKeyInput] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const overviewQuery = useSettingsCatalogsOverview();
  const scope = overviewQuery.scope;

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
    mutationFn: () =>
      upsertSettingsCatalogItem(
        {
          companyId: scope!.companyId,
          catalogKey: catalogKeyInput.trim(),
          code: newCode.trim(),
          label: newLabel.trim(),
        },
        scope!,
      ),
    onSuccess: (data) => {
      const msg =
        data?.item_key
          ? t("settings.catalogs.savedExtensions")
          : t("settings.catalogs.savedExtensions");
      toast.success(msg);
      setNewCode("");
      setNewLabel("");
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

  useEffect(() => {
    if (catalogs.length > 0 && !catalogKeyInput.trim()) {
      setCatalogKeyInput(catalogs[0].catalogKey);
    }
  }, [catalogs, catalogKeyInput]);

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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{t("settings.catalogs.title")}</CardTitle>
            <CardDescription>{t("settings.catalogs.subtitle")}</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={syncMutation.isPending}
            onClick={() => syncMutation.mutate()}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            {t("settings.catalogs.syncFromXbos")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {overviewQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : overviewQuery.isError ? (
            <p className="text-sm text-destructive">{t("settings.catalogs.loadError")}</p>
          ) : catalogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("settings.catalogs.emptyCatalogs")}</p>
          ) : (
            <div className="space-y-6">
              {catalogs.map((cat) => {
                const catalogTitle = resolveCatalogKeyDisplayLabel(cat.catalogKey, cat.name);
                return (
                <div key={cat.catalogKey} className="rounded-lg border p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div>
                      <h3 className="font-semibold" title={cat.catalogKey}>
                        {catalogTitle}
                      </h3>
                      <p className="text-xs text-muted-foreground" data-testid="catalog-sync-stamp">
                        {cat.domain ? `${cat.domain} · ` : ""}
                        {cat.xbosSyncedAt
                          ? t("settings.catalogs.xbosSyncedAt", {
                              time: formatDisplayDate(cat.xbosSyncedAt, "dd/MM/yyyy HH:mm"),
                            })
                          : t("settings.catalogs.notSyncedYet")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{t("settings.catalogs.badgeXbos", { n: cat.xbosItems.length })}</Badge>
                      <Badge variant="outline">{t("settings.catalogs.badgeHrm", { n: cat.hrmExtensionItems.length })}</Badge>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("settings.catalogs.colCode")}</TableHead>
                        <TableHead>{t("settings.catalogs.colLabel")}</TableHead>
                        <TableHead>{t("settings.catalogs.colOrigin")}</TableHead>
                        <TableHead>{t("settings.catalogs.colStatus")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cat.effectiveItems.map((row) => (
                        <TableRow key={`${cat.catalogKey}-${row.code}`}>
                          <TableCell className="font-mono text-xs">{row.code}</TableCell>
                          <TableCell>{row.label}</TableCell>
                          <TableCell>
                            {row.origin === "xbos"
                              ? t("settings.catalogs.originXbos")
                              : t("settings.catalogs.originHrm")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{resolveSettingsCatalogItemStatusDisplay(row.status)}</span>
                              {row.origin === "hrm" && (
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-destructive"
                                  title="Gửi yêu cầu xóa trường (cần XBOS + lãnh đạo tập đoàn phê duyệt)"
                                  disabled={removeRequestMutation.isPending}
                                  onClick={() =>
                                    removeRequestMutation.mutate({
                                      catalogKey: cat.catalogKey,
                                      code: row.code,
                                      label: row.label,
                                    })
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.catalogs.addTitle")}</CardTitle>
          <CardDescription>{t("settings.catalogs.addDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ext-catalog-key">{t("settings.catalogs.catalogKeyField")}</Label>
            <Select
              value={catalogKeyInput || undefined}
              onValueChange={setCatalogKeyInput}
              disabled={catalogs.length === 0}
            >
              <SelectTrigger id="ext-catalog-key">
                <SelectValue placeholder={t("settings.catalogs.catalogKeyPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {catalogs.map((c) => (
                  <SelectItem key={c.catalogKey} value={c.catalogKey}>
                    {resolveCatalogKeyDisplayLabel(c.catalogKey, c.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t("settings.catalogs.catalogKeyHint")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ext-code">{t("settings.catalogs.colCode")}</Label>
            <Input
              id="ext-code"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ext-label">{t("settings.catalogs.colLabel")}</Label>
            <Input
              id="ext-label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-4">
            <Button
              type="button"
              disabled={
                appendMutation.isPending ||
                !catalogKeyInput.trim() ||
                !newCode.trim() ||
                !newLabel.trim()
              }
              onClick={() => appendMutation.mutate()}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("settings.catalogs.addButton")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
