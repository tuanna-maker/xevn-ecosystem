import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCheck, Loader2, Check, X, ExternalLink, CalendarClock } from 'lucide-react';
import { useJobRequisitions } from '@/hooks/useJobRequisitions';
import { useJobPostings } from '@/hooks/useJobPostings';
import { format } from 'date-fns';
import { resolveWorkflowInstanceDisplay } from '@/lib/labelMaps';
import { updateJobRequisition, updateJobPosting } from '@/integrations/hrmApi';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function RecruitmentApprovalsTab() {
  const { t } = useTranslation();
  const { requisitions, refetch: refetchReqs, loading: reqsLoading } = useJobRequisitions();
  const { jobs: jobPostings, refetch: refetchJobs, isLoading: jobsLoading } = useJobPostings();
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const pendingRequisitions = requisitions.filter(r => r.status === 'pending_approval');
  const pendingJobs = jobPostings.filter(j => j.status === 'pending_approval');

  const handleApproveRequisition = async (id: string) => {
    if (!currentCompanyId) return;
    setApprovingId(id);
    try {
      // Direct approve logic for mock without full WF engine
      await updateJobRequisition(id, currentCompanyId, { status: 'open' });
      toast({ title: 'Thành công', description: 'Đã duyệt yêu cầu tuyển dụng.' });
      void refetchReqs();
    } catch (e: any) {
      toast({ title: 'Lỗi', description: e.message, variant: 'destructive' });
    } finally {
      setApprovingId(null);
    }
  };

  const handleApproveJobPosting = async (id: string) => {
    if (!currentCompanyId) return;
    setApprovingId(id);
    try {
      // Direct approve logic
      await updateJobPosting(id, currentCompanyId, { status: 'active' });
      toast({ title: 'Thành công', description: 'Đã duyệt tin tuyển dụng.' });
      void refetchJobs();
    } catch (e: any) {
      toast({ title: 'Lỗi', description: e.message, variant: 'destructive' });
    } finally {
      setApprovingId(null);
    }
  };

  const isLoading = reqsLoading || jobsLoading;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-xevn-text">Phê duyệt Tuyển dụng</h2>
        <p className="text-sm text-xevn-textSecondary">
          Quản lý các yêu cầu và tin tuyển dụng đang chờ phê duyệt
        </p>
      </div>

      <Tabs defaultValue="requisitions">
        <TabsList className="mb-4">
          <TabsTrigger value="requisitions" className="gap-2">
            Yêu cầu tuyển dụng
            {pendingRequisitions.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 min-w-[20px] h-5 justify-center rounded-full">
                {pendingRequisitions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="jobs" className="gap-2">
            Tin tuyển dụng
            {pendingJobs.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 min-w-[20px] h-5 justify-center rounded-full">
                {pendingJobs.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requisitions">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Yêu cầu tuyển dụng chờ duyệt</CardTitle>
              <CardDescription>Danh sách YCTD đã gửi quy trình duyệt.</CardDescription>
            </CardHeader>
            <CardContent>
              {reqsLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : pendingRequisitions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                  <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Không có yêu cầu tuyển dụng nào cần duyệt</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu đề / Vị trí</TableHead>
                      <TableHead>Mã quy trình</TableHead>
                      <TableHead>Phòng ban</TableHead>
                      <TableHead>SL</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequisitions.map(req => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div className="font-medium">{req.title}</div>
                          <div className="text-xs text-muted-foreground">{req.position_name}</div>
                        </TableCell>
                        <TableCell>
                          {req.workflow_instance_id ? (
                            <Badge variant="outline" className="font-mono text-[10px]">
                              {resolveWorkflowInstanceDisplay(req.workflow_instance_id)}
                            </Badge>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-sm">{req.department || '—'}</TableCell>
                        <TableCell className="text-sm font-medium">{req.headcount}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveRequisition(req.id)}
                            disabled={approvingId === req.id}
                            className="h-8"
                          >
                            {approvingId === req.id ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1.5" />}
                            Duyệt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tin tuyển dụng chờ duyệt</CardTitle>
              <CardDescription>Danh sách tin đăng đã gửi duyệt.</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : pendingJobs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                  <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Không có tin tuyển dụng nào cần duyệt</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu đề tin đăng</TableHead>
                      <TableHead>Mã quy trình</TableHead>
                      <TableHead>Phòng ban</TableHead>
                      <TableHead>SL</TableHead>
                      <TableHead>Hạn nộp</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingJobs.map(job => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="font-medium">{job.title}</div>
                          <div className="text-xs text-muted-foreground">{job.position || '—'}</div>
                        </TableCell>
                        <TableCell>
                          {job.workflow_instance_id ? (
                            <Badge variant="outline" className="font-mono text-[10px]">
                              {resolveWorkflowInstanceDisplay(job.workflow_instance_id)}
                            </Badge>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-sm">{job.department || '—'}</TableCell>
                        <TableCell className="text-sm font-medium">{job.headcount}</TableCell>
                        <TableCell className="text-sm">
                          {job.deadline ? format(new Date(job.deadline), 'dd/MM/yyyy') : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveJobPosting(job.id)}
                            disabled={approvingId === job.id}
                            className="h-8"
                          >
                            {approvingId === job.id ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1.5" />}
                            Duyệt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
