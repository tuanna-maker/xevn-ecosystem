/**
 * @CODE-MEMORY
 * Screen: /processes · Quy trình & Quy định
 * UC: XBOS-DM-HRM-14
 * BR: UI read-only OK — workflow ref from XBOS; no HRM mutate
 * SRS: docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md §2.1–2.2 processes
 * TechSpec: Catalog workflow codes §55–58
 * Purpose: Browse process/policy refs. View dialog only. No Add/Edit/Delete
 *   stubs and no fake success toasts (P1-HRM-PROCESSES-FE-01).
 * WorkItem: P1-HRM-PROCESSES-FE-01
 * Coded: 2026-07-17
 * Callers: App.tsx route /processes
 * Callees: useProcesses, Dialog (+ Title/Description)
 * FEActions: Search · tab filter · Eye → view dialog
 * Impact: Misleading CRUD stubs previously toasted success with empty list
 * must_keep: DialogTitle + DialogDescription on view dialog; no mutate buttons
 * SOLID: Page owns presentation; hook owns query
 * LastVerified: pages/Processes.readOnly.test.ts
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, FileText, BookOpen, Eye, Loader2, Download, Paperclip } from 'lucide-react';
import {
  useProcesses,
  CompanyProcess,
  PROCESSES_MUTATION_UNSUPPORTED_VI,
} from '@/hooks/useProcesses';
import { format } from 'date-fns';

export default function Processes() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDialog, setViewDialog] = useState<CompanyProcess | null>(null);

  const { data: items = [], isLoading } = useProcesses();

  const processes = items
    .filter((i) => i.type === 'process')
    .filter((i) => !searchTerm || i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const policies = items
    .filter((i) => i.type === 'policy')
    .filter((i) => !searchTerm || i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getFileName = (url: string) => {
    try {
      return decodeURIComponent(url.split('/').pop() || 'file');
    } catch {
      return 'file';
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      active: { variant: 'default', label: 'Đang áp dụng' },
      draft: { variant: 'secondary', label: 'Bản nháp' },
      review: { variant: 'outline', label: 'Đang xét duyệt' },
      archived: { variant: 'destructive', label: 'Đã lưu trữ' },
    };
    const s = map[status] || { variant: 'secondary' as const, label: status };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const renderList = (list: CompanyProcess[], type: string) => {
    if (isLoading) {
      return (
        <div className="flex justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    if (list.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground space-y-2">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{type === 'process' ? 'Chưa có quy trình nào' : 'Chưa có quy định nào'}</p>
            <p className="text-xs max-w-md mx-auto" data-testid="processes-readonly-notice">
              {PROCESSES_MUTATION_UNSUPPORTED_VI}
            </p>
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="grid gap-3">
        {list.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {type === 'process' ? (
                      <FileText className="w-5 h-5 text-primary" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {item.code && <span>{item.code}</span>}
                      {item.version != null && item.version > 0 && (
                        <>
                          <span>•</span>
                          <span>v{item.version}</span>
                        </>
                      )}
                      {item.issuing_authority && (
                        <>
                          <span>•</span>
                          <span>{item.issuing_authority}</span>
                        </>
                      )}
                      {item.department && (
                        <>
                          <span>•</span>
                          <span>{item.department}</span>
                        </>
                      )}
                      {item.category && (
                        <>
                          <span>•</span>
                          <span>{item.category}</span>
                        </>
                      )}
                      {item.effective_date && (
                        <>
                          <span>•</span>
                          <span>Hiệu lực: {item.effective_date}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                      )}
                      {item.file_urls && item.file_urls.length > 0 && (
                        <Badge variant="outline" className="text-[10px] h-5 shrink-0">
                          <Paperclip className="w-3 h-3 mr-0.5" />
                          {item.file_urls.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {statusBadge(item.status)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={`Xem ${item.name}`}
                    onClick={() => setViewDialog(item)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title={t('processes.title', 'Quy trình & Quy định')}
        subtitle={t(
          'processes.description',
          'Tham chiếu quy trình / quy định (chỉ xem — cấu hình mã quy trình trên XBOS)',
        )}
      />

      <Tabs defaultValue="processes" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <TabsList className="h-auto bg-transparent gap-1 p-0 overflow-x-auto scrollbar-hide flex flex-nowrap w-full sm:w-auto">
            <TabsTrigger
              value="processes"
              className="shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-1.5 text-sm"
            >
              <FileText className="w-4 h-4 mr-1.5" />
              {t('processes.tab.processes', 'Quy trình')}
              {processes.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-[10px] h-5">
                  {processes.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="policies"
              className="shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-1.5 text-sm"
            >
              <BookOpen className="w-4 h-4 mr-1.5" />
              {t('processes.tab.policies', 'Quy định')}
              {policies.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-[10px] h-5">
                  {policies.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search', 'Tìm kiếm...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value="processes" className="space-y-4">
          {renderList(processes, 'process')}
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          {renderList(policies, 'policy')}
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewDialog} onOpenChange={(open) => !open && setViewDialog(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby="processes-view-desc">
          <DialogHeader>
            <DialogTitle>{viewDialog?.name ?? 'Chi tiết quy trình'}</DialogTitle>
            <DialogDescription id="processes-view-desc">
              Xem chi tiết quy trình / quy định (chỉ đọc)
            </DialogDescription>
          </DialogHeader>
          {viewDialog && (
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                {statusBadge(viewDialog.status)}
                {viewDialog.version != null && viewDialog.version > 0 && (
                  <Badge variant="outline">v{viewDialog.version}</Badge>
                )}
                {viewDialog.code && <Badge variant="outline">{viewDialog.code}</Badge>}
                {viewDialog.department && <Badge variant="outline">{viewDialog.department}</Badge>}
              </div>
              {viewDialog.issuing_authority && (
                <div>
                  <Label className="text-muted-foreground">Đơn vị ban hành</Label>
                  <p>{viewDialog.issuing_authority}</p>
                </div>
              )}
              {viewDialog.description && (
                <div>
                  <Label className="text-muted-foreground">Mô tả</Label>
                  <p>{viewDialog.description}</p>
                </div>
              )}
              {viewDialog.content && (
                <div>
                  <Label className="text-muted-foreground">Nội dung</Label>
                  <p className="whitespace-pre-wrap">{viewDialog.content}</p>
                </div>
              )}
              {viewDialog.effective_date && (
                <div>
                  <Label className="text-muted-foreground">Ngày hiệu lực:</Label> {viewDialog.effective_date}
                </div>
              )}

              {viewDialog.file_urls && viewDialog.file_urls.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Tài liệu đính kèm</Label>
                  <div className="space-y-1.5 mt-1">
                    {viewDialog.file_urls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm hover:bg-muted transition-colors"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate flex-1 text-xs">{getFileName(url)}</span>
                        <Download className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Tạo lúc: {format(new Date(viewDialog.created_at), 'dd/MM/yyyy HH:mm')}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
