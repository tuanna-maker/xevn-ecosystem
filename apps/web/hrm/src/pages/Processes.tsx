import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Plus, FileText, BookOpen, Eye, Edit, Trash2, Loader2, Upload, X, Download, Paperclip } from 'lucide-react';
import { useProcesses, CompanyProcess } from '@/hooks/useProcesses';
import { useDepartments } from '@/hooks/useDepartments';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

const emptyForm = {
  type: 'process' as string,
  name: '',
  code: '',
  category: '',
  department: '',
  description: '',
  content: '',
  status: 'draft',
  effective_date: '',
  expiry_date: '',
  version: 1,
  issuing_authority: '',
  file_urls: [] as string[],
};

export default function Processes() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialog, setViewDialog] = useState<CompanyProcess | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: items = [], isLoading, addProcess, updateProcess, deleteProcess } = useProcesses();
  const { departments } = useDepartments();

  const processes = items.filter(i => i.type === 'process').filter(i =>
    !searchTerm || i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const policies = items.filter(i => i.type === 'policy').filter(i =>
    !searchTerm || i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAdd = (type: string) => {
    setEditingId(null);
    setForm({ ...emptyForm, type });
    setDialogOpen(true);
  };

  const openEdit = (item: CompanyProcess) => {
    setEditingId(item.id);
    setForm({
      type: item.type,
      name: item.name,
      code: item.code || '',
      category: item.category || '',
      department: item.department || '',
      description: item.description || '',
      content: item.content || '',
      status: item.status,
      effective_date: item.effective_date || '',
      expiry_date: item.expiry_date || '',
      version: item.version || 1,
      issuing_authority: item.issuing_authority || '',
      file_urls: item.file_urls || [],
    });
    setDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('process-files').upload(path, file);
      if (error) {
        toast.error(`Lỗi tải file ${file.name}: ${error.message}`);
        continue;
      }
      const { data: urlData } = supabase.storage.from('process-files').getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
    }
    setForm(f => ({ ...f, file_urls: [...f.file_urls, ...newUrls] }));
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (url: string) => {
    setForm(f => ({ ...f, file_urls: f.file_urls.filter(u => u !== url) }));
  };

  const getFileName = (url: string) => {
    try {
      return decodeURIComponent(url.split('/').pop() || 'file');
    } catch {
      return 'file';
    }
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const payload = {
      ...form,
      effective_date: form.effective_date || null,
      expiry_date: form.expiry_date || null,
      version: form.version || 1,
      issuing_authority: form.issuing_authority || null,
      file_urls: form.file_urls,
    };
    if (editingId) {
      updateProcess.mutate({ id: editingId, ...payload });
    } else {
      addProcess.mutate(payload);
    }
    setDialogOpen(false);
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
    if (isLoading) return (
      <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
    );
    if (list.length === 0) return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{type === 'process' ? 'Chưa có quy trình nào' : 'Chưa có quy định nào'}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => openAdd(type)}>
            <Plus className="w-4 h-4 mr-1.5" />Thêm mới
          </Button>
        </CardContent>
      </Card>
    );
    return (
      <div className="grid gap-3">
        {list.map(item => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {type === 'process' ? <FileText className="w-5 h-5 text-primary" /> : <BookOpen className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {item.code && <span>{item.code}</span>}
                      {item.version && <><span>•</span><span>v{item.version}</span></>}
                      {item.issuing_authority && <><span>•</span><span>{item.issuing_authority}</span></>}
                      {item.department && <><span>•</span><span>{item.department}</span></>}
                      {item.category && <><span>•</span><span>{item.category}</span></>}
                      {item.effective_date && <><span>•</span><span>Hiệu lực: {item.effective_date}</span></>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {item.description && <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>}
                      {item.file_urls && item.file_urls.length > 0 && (
                        <Badge variant="outline" className="text-[10px] h-5 shrink-0">
                          <Paperclip className="w-3 h-3 mr-0.5" />{item.file_urls.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {statusBadge(item.status)}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewDialog(item)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>Bạn có chắc muốn xóa "{item.name}"?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteProcess.mutate(item.id)}>Xóa</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
        subtitle={t('processes.description', 'Quản lý quy trình, quy định nội bộ của công ty')}
      />

      <Tabs defaultValue="processes" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <TabsList className="h-auto bg-transparent gap-1 p-0 overflow-x-auto scrollbar-hide flex flex-nowrap w-full sm:w-auto">
            <TabsTrigger value="processes" className="shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-1.5 text-sm">
              <FileText className="w-4 h-4 mr-1.5" />{t('processes.tab.processes', 'Quy trình')}
              {processes.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px] h-5">{processes.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="policies" className="shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-1.5 text-sm">
              <BookOpen className="w-4 h-4 mr-1.5" />{t('processes.tab.policies', 'Quy định')}
              {policies.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px] h-5">{policies.length}</Badge>}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t('common.search', 'Tìm kiếm...')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
          </div>
        </div>

        <TabsContent value="processes" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => openAdd('process')}><Plus className="w-4 h-4 mr-1.5" />Thêm quy trình</Button>
          </div>
          {renderList(processes, 'process')}
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => openAdd('policy')}><Plus className="w-4 h-4 mr-1.5" />Thêm quy định</Button>
          </div>
          {renderList(policies, 'policy')}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Chỉnh sửa' : 'Thêm mới'} {form.type === 'process' ? 'quy trình' : 'quy định'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tên <span className="text-destructive">*</span></Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Mã</Label>
                <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Phiên bản</Label>
                <Input type="number" min={1} value={form.version} onChange={e => setForm(f => ({ ...f, version: parseInt(e.target.value) || 1 }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Đơn vị ban hành</Label>
                <Input value={form.issuing_authority} onChange={e => setForm(f => ({ ...f, issuing_authority: e.target.value }))} placeholder="VD: Ban Giám đốc, Phòng HC..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Phòng ban</Label>
                <Select value={form.department} onValueChange={v => setForm(f => ({ ...f, department: v }))}>
                  <SelectTrigger><SelectValue placeholder="Chọn phòng ban" /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Phân loại</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="VD: Lao động, An ninh..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Trạng thái</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="active">Đang áp dụng</SelectItem>
                    <SelectItem value="review">Đang xét duyệt</SelectItem>
                    <SelectItem value="archived">Lưu trữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Ngày hiệu lực</Label>
                <Input type="date" value={form.effective_date} onChange={e => setForm(f => ({ ...f, effective_date: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Mô tả</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Nội dung chi tiết</Label>
              <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4} />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Tài liệu đính kèm</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Upload className="w-4 h-4 mr-1.5" />}
                  {uploading ? 'Đang tải...' : 'Chọn file'}
                </Button>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt" />
              </div>
              {form.file_urls.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {form.file_urls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm">
                      <Paperclip className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1 text-xs">{getFileName(url)}</span>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6"><Download className="w-3.5 h-3.5" /></Button>
                      </a>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFile(url)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={!form.name.trim() || addProcess.isPending || updateProcess.isPending || uploading}>
              {(addProcess.isPending || updateProcess.isPending) && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {editingId ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewDialog} onOpenChange={() => setViewDialog(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {viewDialog && (
            <>
              <DialogHeader>
                <DialogTitle>{viewDialog.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  {statusBadge(viewDialog.status)}
                  {viewDialog.version && <Badge variant="outline">v{viewDialog.version}</Badge>}
                  {viewDialog.code && <Badge variant="outline">{viewDialog.code}</Badge>}
                  {viewDialog.department && <Badge variant="outline">{viewDialog.department}</Badge>}
                </div>
                {viewDialog.issuing_authority && (
                  <div><Label className="text-muted-foreground">Đơn vị ban hành</Label><p>{viewDialog.issuing_authority}</p></div>
                )}
                {viewDialog.description && <div><Label className="text-muted-foreground">Mô tả</Label><p>{viewDialog.description}</p></div>}
                {viewDialog.content && <div><Label className="text-muted-foreground">Nội dung</Label><p className="whitespace-pre-wrap">{viewDialog.content}</p></div>}
                {viewDialog.effective_date && <div><Label className="text-muted-foreground">Ngày hiệu lực:</Label> {viewDialog.effective_date}</div>}
                
                {/* Attached files */}
                {viewDialog.file_urls && viewDialog.file_urls.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Tài liệu đính kèm</Label>
                    <div className="space-y-1.5 mt-1">
                      {viewDialog.file_urls.map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm hover:bg-muted transition-colors">
                          <Paperclip className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate flex-1 text-xs">{getFileName(url)}</span>
                          <Download className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">Tạo lúc: {format(new Date(viewDialog.created_at), 'dd/MM/yyyy HH:mm')}</div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
