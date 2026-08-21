/**
 * @CODE-MEMORY
 * Screen:     /performance — chu kỳ & đánh giá
 * Purpose:    List/create performance cycles + evaluations via Nest API
 * WorkItem:   D-HRM-PERF-CYCLE-ISO-DISPLAY-01
 * Coded:      2026-07-20
 * must_keep:  cycle mutate payload unchanged; display-only date humanize
 * LastVerified: lib/formatDisplayDate.test.ts · d-hrm-ui-strip-tech-chrome-02
 *
 * @CODE-MEMORY-CHANGE 2026-07-20
 * WorkItem: D-HRM-PERF-CYCLE-ISO-DISPLAY-01
 * change_mode: FIX
 * What: Render cycle start/end via formatDisplayDate (not raw ISO-Z)
 * Why: QA menu sweep — raw timestamps on Performance list
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-U72-LABEL-FE-01
 * change_mode: FIX
 * What: cycle status + eval employee via labelMaps (no draft/UUID leak)
 * Why: BA F-13 U72
 * SRS/BR: SRS_FIELD_DISPLAY.md AC-FD-13 · FR-HRM-U72-LABEL-01 · BR-CO-LABEL-01
 * must_keep: cycle mutate payload unchanged
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-FE-ERP-E3-01
 * change_mode: ADD
 * What: Zod cycle/eval; PATCH/DELETE cycle; eval SM buttons U72; KPI/grade/dept pickers;
 *       EmptyState+CTA; F5 invalidate after 2xx
 * Why: FR-HRM-PERF-SM-E3-01 · AC-PERF-* · AC-E3-ZOD · sa-erp-e3-ack
 * SRS: BA_ERP_E3_SRS · DB/API_DESIGN_HRM_ERP_E3
 * must_keep: cycle status ≠ eval SM; E1 pickers elsewhere; E2 pay/contract untouched
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: BUILD-GAP-PERF-FORM-SCHEMA-01
 * change_mode: FIX
 * What: Import @/lib/performanceFormSchema — module restored on disk (git 43c479a)
 * Why: Vite build failed missing module; no page logic change
 * must_keep: cycle mutate payload; MD panel · Leave · AUTH/EMP/CAT lanes untouched
 */
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CatalogSearchPicker } from "@/components/common/CatalogSearchPicker";
import { EmptyState } from "@/components/hrm/EmptyState";
import {
  createPerformanceCycle,
  createPerformanceEvaluation,
  deletePerformanceCycle,
  deletePerformanceEvaluation,
  listPerformanceCycles,
  listPerformanceEvaluations,
  updatePerformanceCycle,
  updatePerformanceEvaluation,
  type HrmPerformanceCycle,
  type HrmPerformanceEvaluation,
} from "@/integrations/hrmApi";
import { useAuth } from "@/contexts/AuthContext";
import { useSettingsCatalogsOverview } from "@/hooks/useSettingsCatalogsOverview";
import { formatDisplayDate } from "@/lib/formatDisplayDate";
import { toErrorMessage } from "@/lib/apiError";
import { toast } from "sonner";
import {
  resolvePerformanceCycleStatusDisplay,
  resolvePerformanceEmployeeDisplay,
  resolvePerformanceEvalStatusDisplay,
} from "@/lib/labelMaps";
import {
  createPerformanceCycleFormSchema,
  createPerformanceEvalFormSchema,
  type PerformanceCycleFormValues,
  type PerformanceEvalFormValues,
} from "@/lib/performanceFormSchema";
import {
  canDeletePerformanceCycle,
  canDeletePerformanceEval,
  isPerformanceCycleContentEditable,
  nextPerformanceCycleStatuses,
  nextPerformanceEvalStatuses,
  type PerformanceCycleStatus,
  type PerformanceEvalStatus,
} from "@/lib/statusMachineE3";
import {
  departmentOptionsFromCatalog,
  jobGradeOptionsFromCatalog,
  kpiLibraryOptionsFromCatalog,
  resolveKpiLibraryLabel,
} from "@/lib/catalogSearchPicker";
import { hrmPathWithEmbedSearch } from "@/lib/hrmEmbedNavigation";

const CYCLE_MSG = {
  nameRequired: "Nhập tên chu kỳ",
  startRequired: "Chọn ngày bắt đầu",
  endRequired: "Chọn ngày kết thúc",
  dateOrder: "Ngày kết thúc phải sau ngày bắt đầu",
};

const EVAL_MSG = {
  employeeRequired: "Chọn nhân viên",
  cycleRequired: "Chọn chu kỳ",
  scoreRange: "Điểm từ 0 đến 100",
  summaryRequired: "Nhập nhận xét",
  kpiNotInCatalog: "Chọn KPI từ danh mục (hoặc đồng bộ Settings khi trống)",
  gradeNotInCatalog: "Ngạch không thuộc danh mục",
  deptNotInCatalog: "Phòng ban không thuộc danh mục",
};

export default function Performance() {
  const { currentCompanyId, user } = useAuth();
  const queryClient = useQueryClient();
  const { catalogs, isLoading: catalogsLoading } = useSettingsCatalogsOverview();
  const [editingCycle, setEditingCycle] = useState<HrmPerformanceCycle | null>(null);

  const kpiOptions = useMemo(() => kpiLibraryOptionsFromCatalog(catalogs), [catalogs]);
  const gradeOptions = useMemo(() => jobGradeOptionsFromCatalog(catalogs), [catalogs]);
  const deptOptions = useMemo(() => departmentOptionsFromCatalog(catalogs), [catalogs]);

  const cycleSchema = useMemo(() => createPerformanceCycleFormSchema(CYCLE_MSG), []);
  const evalSchema = useMemo(
    () =>
      createPerformanceEvalFormSchema(
        EVAL_MSG,
        () => kpiOptions.map((o) => o.value),
        () => gradeOptions.map((o) => o.value),
        () => deptOptions.map((o) => o.value),
      ),
    [kpiOptions, gradeOptions, deptOptions],
  );

  const cycleForm = useForm<PerformanceCycleFormValues>({
    resolver: zodResolver(cycleSchema),
    defaultValues: { cycle_name: "", start_date: "", end_date: "" },
  });

  const evalForm = useForm<PerformanceEvalFormValues>({
    resolver: zodResolver(evalSchema),
    defaultValues: {
      employee_id: "",
      cycle_id: "",
      score: 80,
      summary: "",
      kpi_code: "",
      job_grade_key: "",
      department_key: "",
    },
  });

  const cyclesQuery = useQuery({
    queryKey: ["performance-cycles", currentCompanyId],
    queryFn: () => listPerformanceCycles({ company_id: currentCompanyId! }),
    enabled: !!currentCompanyId,
  });

  const evaluationsQuery = useQuery({
    queryKey: ["performance-evaluations", currentCompanyId],
    queryFn: () => listPerformanceEvaluations({ company_id: currentCompanyId! }),
    enabled: !!currentCompanyId,
  });

  const invalidatePerf = () => {
    void queryClient.invalidateQueries({ queryKey: ["performance-cycles"] });
    void queryClient.invalidateQueries({ queryKey: ["performance-evaluations"] });
  };

  const cycleMutation = useMutation({
    mutationFn: async (values: PerformanceCycleFormValues) => {
      if (!currentCompanyId) throw new Error("Thiếu company_id");
      if (editingCycle) {
        return updatePerformanceCycle(editingCycle.id, {
          company_id: currentCompanyId,
          cycle_name: values.cycle_name,
          start_date: values.start_date,
          end_date: values.end_date,
        });
      }
      return createPerformanceCycle({
        company_id: currentCompanyId,
        cycle_name: values.cycle_name,
        start_date: values.start_date,
        end_date: values.end_date,
        created_by: user?.email ?? "system",
      });
    },
    onSuccess: () => {
      toast.success(editingCycle ? "Đã cập nhật chu kỳ" : "Đã tạo chu kỳ đánh giá");
      cycleForm.reset({ cycle_name: "", start_date: "", end_date: "" });
      setEditingCycle(null);
      invalidatePerf();
    },
    onError: (error: unknown) => toast.error(toErrorMessage(error)),
  });

  const cycleStatusMutation = useMutation({
    mutationFn: async (args: { id: string; status: PerformanceCycleStatus }) => {
      if (!currentCompanyId) throw new Error("Thiếu company_id");
      return updatePerformanceCycle(args.id, {
        company_id: currentCompanyId,
        status: args.status,
      });
    },
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái chu kỳ");
      invalidatePerf();
    },
    onError: (error: unknown) => toast.error(toErrorMessage(error)),
  });

  const cycleDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentCompanyId) throw new Error("Thiếu company_id");
      return deletePerformanceCycle(id, currentCompanyId);
    },
    onSuccess: () => {
      toast.success("Đã xóa chu kỳ");
      invalidatePerf();
    },
    onError: (error: unknown) => toast.error(toErrorMessage(error)),
  });

  const evaluationMutation = useMutation({
    mutationFn: async (values: PerformanceEvalFormValues) => {
      if (!currentCompanyId) throw new Error("Thiếu company_id");
      const kpiLabel = resolveKpiLibraryLabel(kpiOptions, values.kpi_code);
      return createPerformanceEvaluation({
        company_id: currentCompanyId,
        employee_id: values.employee_id,
        cycle_id: values.cycle_id,
        score: Number(values.score),
        summary: values.summary,
        reviewer: user?.email ?? "system",
        kpi_code: values.kpi_code?.trim() || undefined,
        kpi_name: kpiLabel !== "—" ? kpiLabel : undefined,
        job_grade_key: values.job_grade_key?.trim() || undefined,
        department_key: values.department_key?.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Đã tạo đánh giá hiệu suất");
      evalForm.reset({
        employee_id: "",
        cycle_id: "",
        score: 80,
        summary: "",
        kpi_code: "",
        job_grade_key: "",
        department_key: "",
      });
      invalidatePerf();
    },
    onError: (error: unknown) => toast.error(toErrorMessage(error)),
  });

  const evalStatusMutation = useMutation({
    mutationFn: async (args: { id: string; status: PerformanceEvalStatus }) => {
      if (!currentCompanyId) throw new Error("Thiếu company_id");
      return updatePerformanceEvaluation(args.id, {
        company_id: currentCompanyId,
        status: args.status,
      });
    },
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái đánh giá");
      invalidatePerf();
    },
    onError: (error: unknown) => toast.error(toErrorMessage(error)),
  });

  const evalDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentCompanyId) throw new Error("Thiếu company_id");
      return deletePerformanceEvaluation(id, currentCompanyId);
    },
    onSuccess: () => {
      toast.success("Đã xóa phiếu nháp");
      invalidatePerf();
    },
    onError: (error: unknown) => toast.error(toErrorMessage(error)),
  });

  const cycleOptions = useMemo(() => cyclesQuery.data?.data ?? [], [cyclesQuery.data]);
  const cycles = cycleOptions;
  const evaluations = evaluationsQuery.data?.data ?? [];

  const startEditCycle = (cycle: HrmPerformanceCycle) => {
    if (!isPerformanceCycleContentEditable(cycle.status)) {
      toast.error("Chu kỳ đã đóng — không sửa tên/ngày");
      return;
    }
    setEditingCycle(cycle);
    cycleForm.reset({
      cycle_name: cycle.cycle_name,
      start_date: cycle.start_date.slice(0, 10),
      end_date: cycle.end_date.slice(0, 10),
    });
  };

  const settingsCta = hrmPathWithEmbedSearch("/settings");

  return (
    <div className="space-y-4" data-testid="performance-page-e3">
      <h1 className="sr-only">Hiệu suất (Performance)</h1>
      <Card>
        <CardHeader>
          <CardTitle>
            {editingCycle ? "Sửa chu kỳ đánh giá" : "Hiệu suất — Tạo chu kỳ đánh giá"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...cycleForm}>
            <form
              className="grid gap-3 md:grid-cols-4"
              onSubmit={cycleForm.handleSubmit((v) => cycleMutation.mutate(v))}
            >
              <FormField
                control={cycleForm.control}
                name="cycle_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên chu kỳ</FormLabel>
                    <FormControl>
                      <Input placeholder="Q3/2026" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={cycleForm.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Từ ngày</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={cycleForm.control}
                name="end_date"
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
              <div className="flex items-end gap-2">
                <Button type="submit" disabled={cycleMutation.isPending}>
                  {editingCycle ? "Lưu chu kỳ" : "Tạo chu kỳ"}
                </Button>
                {editingCycle ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingCycle(null);
                      cycleForm.reset({ cycle_name: "", start_date: "", end_date: "" });
                    }}
                  >
                    Hủy
                  </Button>
                ) : null}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nhập đánh giá hiệu suất</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...evalForm}>
            <form
              className="space-y-3"
              onSubmit={evalForm.handleSubmit((v) => evaluationMutation.mutate(v))}
            >
              <div className="grid gap-3 md:grid-cols-3">
                <FormField
                  control={evalForm.control}
                  name="employee_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã nhân viên (UUID)</FormLabel>
                      <FormControl>
                        <Input placeholder="UUID nhân sự" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={evalForm.control}
                  name="cycle_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chu kỳ</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn chu kỳ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cycleOptions.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.cycle_name} ({resolvePerformanceCycleStatusDisplay(c.status)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={evalForm.control}
                  name="score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Điểm (0-100)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <FormField
                  control={evalForm.control}
                  name="kpi_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>KPI (danh mục)</FormLabel>
                      <CatalogSearchPicker
                        options={kpiOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        loading={catalogsLoading}
                        placeholder="Chọn KPI…"
                        emptyHint={
                          <a href={settingsCta} className="text-primary underline text-xs font-medium">
                            Mở Cài đặt danh mục KPI / đồng bộ
                          </a>
                        }
                        aria-label="KPI"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={evalForm.control}
                  name="job_grade_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngạch (tuỳ chọn)</FormLabel>
                      <CatalogSearchPicker
                        options={gradeOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        loading={catalogsLoading}
                        placeholder="Chọn ngạch…"
                        emptyHint={
                          <a href={settingsCta} className="text-primary underline text-xs font-medium">
                            Mở Cài đặt ngạch bậc
                          </a>
                        }
                        aria-label="Ngạch"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={evalForm.control}
                  name="department_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phòng ban (tuỳ chọn)</FormLabel>
                      <CatalogSearchPicker
                        options={deptOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        loading={catalogsLoading}
                        placeholder="Chọn phòng ban…"
                        emptyHint={
                          <a href={settingsCta} className="text-primary underline text-xs font-medium">
                            Mở Cài đặt phòng ban
                          </a>
                        }
                        aria-label="Phòng ban"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={evalForm.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhận xét</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tổng kết hiệu suất theo kỳ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={evaluationMutation.isPending}>
                Tạo đánh giá
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách chu kỳ ({cyclesQuery.data?.total ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {cycles.length === 0 ? (
            <EmptyState
              mood="none"
              title="Chưa có chu kỳ đánh giá"
              description="Tạo chu kỳ ở form phía trên để bắt đầu."
              actionLabel="Làm mới"
              onAction={() => void cyclesQuery.refetch()}
              compact
              data-testid="perf-cycles-empty"
            />
          ) : (
            cycles.map((item) => {
              const next = nextPerformanceCycleStatuses(item.status);
              return (
                <div
                  key={item.id}
                  className="rounded border p-3 text-sm space-y-2"
                  data-testid="perf-cycle-row"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{item.cycle_name}</div>
                      <div className="text-muted-foreground">
                        {formatDisplayDate(item.start_date)} – {formatDisplayDate(item.end_date)} (
                        {resolvePerformanceCycleStatusDisplay(item.status)})
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {isPerformanceCycleContentEditable(item.status) ? (
                        <Button type="button" size="sm" variant="outline" onClick={() => startEditCycle(item)}>
                          Sửa
                        </Button>
                      ) : null}
                      {canDeletePerformanceCycle(item.status) ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={cycleDeleteMutation.isPending}
                          onClick={() => cycleDeleteMutation.mutate(item.id)}
                        >
                          Xóa
                        </Button>
                      ) : null}
                      {next.map((st) => (
                        <Button
                          key={st}
                          type="button"
                          size="sm"
                          disabled={cycleStatusMutation.isPending}
                          onClick={() => cycleStatusMutation.mutate({ id: item.id, status: st })}
                          data-testid={`perf-cycle-sm-${st}`}
                        >
                          → {resolvePerformanceCycleStatusDisplay(st)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách đánh giá ({evaluationsQuery.data?.total ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {evaluations.length === 0 ? (
            <EmptyState
              mood="none"
              title="Chưa có phiếu đánh giá"
              description="Tạo phiếu ở form phía trên. Trạng thái đi Nháp → Đã nộp → Đã duyệt → Hoàn thành."
              actionLabel="Làm mới"
              onAction={() => void evaluationsQuery.refetch()}
              compact
              data-testid="perf-evals-empty"
            />
          ) : (
            evaluations.map((item: HrmPerformanceEvaluation) => {
              const status = item.status ?? "draft";
              const next = nextPerformanceEvalStatuses(status);
              return (
                <div key={item.id} className="rounded border p-3 text-sm space-y-2" data-testid="perf-eval-row">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">
                        {resolvePerformanceEmployeeDisplay(item)} — {item.score} điểm ·{" "}
                        {resolvePerformanceEvalStatusDisplay(status)}
                      </div>
                      <div className="text-muted-foreground">{item.summary}</div>
                      {item.kpi_code ? (
                        <div className="text-xs text-muted-foreground">
                          KPI: {resolveKpiLibraryLabel(kpiOptions, item.kpi_code)}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {canDeletePerformanceEval(status) ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={evalDeleteMutation.isPending}
                          onClick={() => evalDeleteMutation.mutate(item.id)}
                        >
                          Xóa nháp
                        </Button>
                      ) : null}
                      {next.map((st) => (
                        <Button
                          key={st}
                          type="button"
                          size="sm"
                          disabled={evalStatusMutation.isPending}
                          onClick={() => evalStatusMutation.mutate({ id: item.id, status: st })}
                          data-testid={`perf-eval-sm-${st}`}
                        >
                          → {resolvePerformanceEvalStatusDisplay(st)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
