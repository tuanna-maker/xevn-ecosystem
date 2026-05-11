import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createPerformanceCycle,
  createPerformanceEvaluation,
  listPerformanceCycles,
  listPerformanceEvaluations,
} from "@/integrations/hrmApi";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Performance() {
  const { currentCompanyId, user } = useAuth();
  const queryClient = useQueryClient();
  const [cycleForm, setCycleForm] = useState({
    cycle_name: "",
    start_date: "",
    end_date: "",
  });
  const [evalForm, setEvalForm] = useState({
    employee_id: "",
    cycle_id: "",
    score: "80",
    summary: "",
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

  const cycleMutation = useMutation({
    mutationFn: async () => {
      if (!currentCompanyId) throw new Error("Thiếu company_id");
      if (!cycleForm.cycle_name || !cycleForm.start_date || !cycleForm.end_date) {
        throw new Error("Vui lòng nhập đủ thông tin chu kỳ");
      }
      return createPerformanceCycle({
        company_id: currentCompanyId,
        cycle_name: cycleForm.cycle_name,
        start_date: cycleForm.start_date,
        end_date: cycleForm.end_date,
        created_by: user?.email ?? "system",
      });
    },
    onSuccess: () => {
      toast.success("Đã tạo chu kỳ đánh giá");
      setCycleForm({ cycle_name: "", start_date: "", end_date: "" });
      queryClient.invalidateQueries({ queryKey: ["performance-cycles"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const evaluationMutation = useMutation({
    mutationFn: async () => {
      if (!currentCompanyId) throw new Error("Thiếu company_id");
      if (!evalForm.employee_id || !evalForm.cycle_id || !evalForm.summary) {
        throw new Error("Vui lòng nhập đủ thông tin đánh giá");
      }
      return createPerformanceEvaluation({
        company_id: currentCompanyId,
        employee_id: evalForm.employee_id,
        cycle_id: evalForm.cycle_id,
        score: Number(evalForm.score),
        summary: evalForm.summary,
        reviewer: user?.email ?? "system",
      });
    },
    onSuccess: () => {
      toast.success("Đã tạo đánh giá hiệu suất");
      setEvalForm({ employee_id: "", cycle_id: "", score: "80", summary: "" });
      queryClient.invalidateQueries({ queryKey: ["performance-evaluations"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const cycleOptions = useMemo(() => cyclesQuery.data?.data ?? [], [cyclesQuery.data]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Hiệu suất - Chu kỳ đánh giá</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <Label>Tên chu kỳ</Label>
            <Input
              value={cycleForm.cycle_name}
              onChange={(e) => setCycleForm((prev) => ({ ...prev, cycle_name: e.target.value }))}
              placeholder="Q3/2026"
            />
          </div>
          <div className="space-y-1">
            <Label>Từ ngày</Label>
            <Input
              type="date"
              value={cycleForm.start_date}
              onChange={(e) => setCycleForm((prev) => ({ ...prev, start_date: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Đến ngày</Label>
            <Input
              type="date"
              value={cycleForm.end_date}
              onChange={(e) => setCycleForm((prev) => ({ ...prev, end_date: e.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={() => cycleMutation.mutate()} disabled={cycleMutation.isPending}>
              Tạo chu kỳ
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nhập đánh giá hiệu suất</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label>Employee ID</Label>
              <Input
                value={evalForm.employee_id}
                onChange={(e) => setEvalForm((prev) => ({ ...prev, employee_id: e.target.value }))}
                placeholder="UUID nhân sự"
              />
            </div>
            <div className="space-y-1">
              <Label>Cycle ID</Label>
              <Input
                value={evalForm.cycle_id}
                onChange={(e) => setEvalForm((prev) => ({ ...prev, cycle_id: e.target.value }))}
                placeholder={cycleOptions[0]?.id ?? "UUID chu kỳ"}
              />
            </div>
            <div className="space-y-1">
              <Label>Điểm (0-100)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={evalForm.score}
                onChange={(e) => setEvalForm((prev) => ({ ...prev, score: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Nhận xét</Label>
            <Textarea
              value={evalForm.summary}
              onChange={(e) => setEvalForm((prev) => ({ ...prev, summary: e.target.value }))}
              placeholder="Tổng kết hiệu suất theo kỳ"
            />
          </div>
          <Button onClick={() => evaluationMutation.mutate()} disabled={evaluationMutation.isPending}>
            Tạo đánh giá
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách chu kỳ ({cyclesQuery.data?.total ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(cyclesQuery.data?.data ?? []).map((item) => (
            <div key={item.id} className="rounded border p-2 text-sm">
              <div className="font-medium">{item.cycle_name}</div>
              <div className="text-muted-foreground">
                {item.start_date} - {item.end_date} ({item.status})
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách đánh giá ({evaluationsQuery.data?.total ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(evaluationsQuery.data?.data ?? []).map((item) => (
            <div key={item.id} className="rounded border p-2 text-sm">
              <div className="font-medium">
                Employee {item.employee_id} - {item.score} điểm
              </div>
              <div className="text-muted-foreground">{item.summary}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
