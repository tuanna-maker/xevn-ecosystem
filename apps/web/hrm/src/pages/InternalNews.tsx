/**
 * @CODE-MEMORY
 * Screen:     /internal-news — Quản lý tin nội bộ HRM
 * UC:         UC-HRM-INTERNAL-NEWS-01
 * BR:         Tin nội bộ công ty: thông báo, chính sách, sự kiện
 * TechSpec:   Internal News CRUD — HRM API + React
 * Purpose:    List/create/edit/delete tin nội bộ; pinned news hiển thị đầu tiên
 * WorkItem:   HRM-NEWS-FE-01
 * Coded:      2026-08-25
 * Callers:    apps/web/hrm/src/App.tsx → Route /internal-news
 * Callees:    useInternalNews → list/create/update/deleteHrmInternalNews → /api/hrm/internal-news
 */
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInternalNews, type InternalNewsFormData, initialFormData } from '@/hooks/useInternalNews';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Pin,
  PinOff,
  CalendarIcon,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { key: 'all', labelKey: 'dashboard.internalNews.categories.all', icon: Newspaper, color: 'bg-slate-500' },
  { key: 'general', labelKey: 'dashboard.internalNews.categories.general', icon: Newspaper, color: 'bg-blue-500' },
  { key: 'policy', labelKey: 'dashboard.internalNews.categories.policy', icon: Newspaper, color: 'bg-purple-500' },
  { key: 'announcement', labelKey: 'dashboard.internalNews.categories.announcement', icon: Newspaper, color: 'bg-amber-500' },
  { key: 'event', labelKey: 'dashboard.internalNews.categories.event', icon: Newspaper, color: 'bg-green-500' },
];

const STATUS_OPTIONS = [
  { value: 'draft', labelKey: 'dashboard.internalNews.statuses.draft' },
  { value: 'published', labelKey: 'dashboard.internalNews.statuses.published' },
  { value: 'archived', labelKey: 'dashboard.internalNews.statuses.archived' },
];

const VISIBILITY_OPTIONS = [
  { value: 'all', labelKey: 'dashboard.internalNews.visibility.all' },
  { value: 'management', labelKey: 'dashboard.internalNews.visibility.management' },
  { value: 'hr', labelKey: 'dashboard.internalNews.visibility.hr' },
];

export default function InternalNews() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  /** Admin quản trị tin — mặc định hiện draft (DB hiện có toàn draft). */
  const [includeDrafts, setIncludeDrafts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Dialogs state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Editing state
  const [editingNews, setEditingNews] = useState<any | null>(null);
  const [viewingNews, setViewingNews] = useState<any | null>(null);
  const [deletingNews, setDeletingNews] = useState<any | null>(null);
  const [formData, setFormData] = useState<InternalNewsFormData>(initialFormData);

  // Hook
  const {
    news,
    total,
    isLoading,
    createNews,
    isCreating,
    updateNews,
    isUpdating,
    deleteNews,
    isDeleting,
  } = useInternalNews({ selectedCategory, includeDrafts });

  // Filter by search
  const filteredNews = useMemo(() => {
    if (!searchQuery.trim()) return news;
    const query = searchQuery.toLowerCase();
    return news.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.summary?.toLowerCase().includes(query) ||
        item.author_name.toLowerCase().includes(query)
    );
  }, [news, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredNews.length);
  const paginatedNews = filteredNews.slice(startIndex, endIndex);

  // Handlers
  const handleOpenCreate = () => {
    setEditingNews(null);
    setFormData(initialFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingNews(item);
    setFormData({
      title: item.title || '',
      slug: item.slug || '',
      summary: item.summary || '',
      content: item.content || '',
      category: item.category || 'general',
      status: item.status || 'draft',
      pinned: item.pinned || false,
      visibility: item.visibility || 'all',
      featured_image_url: item.featured_image_url || '',
      tags: item.tags || [],
      attachments: item.attachments || [],
      department_ids: item.department_ids || [],
      author_name: item.author_name || '',
    });
    setDialogOpen(true);
  };

  const handleOpenView = (item: any) => {
    setViewingNews(item);
    setViewDialogOpen(true);
  };

  const handleOpenDelete = (item: any) => {
    setDeletingNews(item);
    setDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingNews(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    try {
      if (editingNews) {
        await updateNews({ id: editingNews.id, data: formData });
      } else {
        await createNews(formData);
      }
      handleCloseDialog();
      setCurrentPage(1);
    } catch {
      // Error handled in hook
    }
  };

  const handleDelete = async () => {
    if (deletingNews) {
      await deleteNews(deletingNews.id);
      setDeleteDialogOpen(false);
      setDeletingNews(null);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const getCategoryLabel = (key: string) => {
    const cat = CATEGORIES.find((c) => c.key === key);
    return cat ? t(cat.labelKey) : key;
  };

  const getStatusLabel = (status: string) => {
    const opt = STATUS_OPTIONS.find((s) => s.value === status);
    return opt ? t(opt.labelKey) : status;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      ...cat,
      count: cat.key === 'all' ? news.length : news.filter((n) => n.category === cat.key).length,
    }));
  }, [news]);

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 pt-4 pb-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-xevn-text">
            {t('dashboard.internalNews.title')}
          </h1>
          <p className="text-sm text-xevn-textSecondary">
            {t('dashboard.internalNews.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('dashboard.internalNews.search')}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Button size="sm" className="gap-2" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4" />
            <span>{t('dashboard.internalNews.addNew')}</span>
          </Button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="px-4 md:px-6 py-3 border-b bg-card">
        <div className="flex items-center gap-2 flex-wrap">
          {categoryCounts.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleCategoryChange(cat.key)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                selectedCategory === cat.key
                  ? 'bg-primary/10 text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50'
              )}
            >
              <cat.icon className="w-3.5 h-3.5" />
              <span>{t(cat.labelKey)}</span>
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{cat.count}</span>
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Checkbox
              id="include-drafts"
              checked={includeDrafts}
              onCheckedChange={(checked) => {
                setIncludeDrafts(!!checked);
                setCurrentPage(1);
              }}
            />
            <Label htmlFor="include-drafts" className="text-sm text-muted-foreground cursor-pointer">
              {t('dashboard.internalNews.includeDrafts')}
            </Label>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50 z-10">
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t('dashboard.internalNews.tableHeaders.title')}</TableHead>
              <TableHead>{t('dashboard.internalNews.tableHeaders.category')}</TableHead>
              <TableHead>{t('dashboard.internalNews.tableHeaders.status')}</TableHead>
              <TableHead>{t('dashboard.internalNews.tableHeaders.author')}</TableHead>
              <TableHead>{t('dashboard.internalNews.tableHeaders.publishedAt')}</TableHead>
              <TableHead className="w-28 text-center">{t('dashboard.internalNews.tableHeaders.views')}</TableHead>
              <TableHead className="w-28 text-center">{t('dashboard.internalNews.tableHeaders.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  {t('dashboard.internalNews.loading')}
                </TableCell>
              </TableRow>
            ) : paginatedNews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  <div className="flex flex-col items-center gap-2">
                    <Newspaper className="w-8 h-8 text-muted-foreground" />
                    <p>{t('dashboard.internalNews.noData')}</p>
                    <Button size="sm" onClick={handleOpenCreate}>
                      {t('dashboard.internalNews.addNew')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedNews.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">
                    {startIndex + idx + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.pinned && (
                        <Pin className="w-3.5 h-3.5 text-primary shrink-0" />
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium">{item.title}</span>
                        {item.summary && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {item.summary}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getCategoryLabel(item.category)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{item.author_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.published_at
                      ? format(new Date(item.published_at), 'dd/MM/yyyy HH:mm', { locale: vi })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-center">{item.view_count}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenView(item)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleOpenDelete(item)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t bg-card">
          <span className="text-sm text-muted-foreground">
            {t('dashboard.internalNews.showingRecords', {
              start: startIndex + 1,
              end: Math.min(endIndex, filteredNews.length),
              total: filteredNews.length,
            })}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {getPageNumbers().map((page, idx) =>
              typeof page === 'number' ? (
                <Button
                  key={idx}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ) : (
                <span key={idx} className="px-1">
                  {page}
                </span>
              )
            )}
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNews ? t('dashboard.internalNews.editTitle') : t('dashboard.internalNews.addTitle')}
            </DialogTitle>
            <DialogDescription>
              {editingNews
                ? t('dashboard.internalNews.editDesc')
                : t('dashboard.internalNews.addDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label>
                {t('dashboard.internalNews.form.titleLabel')} <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder={t('dashboard.internalNews.form.titlePlaceholder')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <Label>{t('dashboard.internalNews.form.summaryLabel')}</Label>
              <Input
                placeholder={t('dashboard.internalNews.form.summaryPlaceholder')}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label>{t('dashboard.internalNews.form.contentLabel')}</Label>
              <Textarea
                placeholder={t('dashboard.internalNews.form.contentPlaceholder')}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
              />
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('dashboard.internalNews.form.categoryLabel')}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c.key !== 'all').map((cat) => (
                      <SelectItem key={cat.key} value={cat.key}>
                        {t(cat.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('dashboard.internalNews.form.statusLabel')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {t(opt.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label>{t('dashboard.internalNews.form.visibilityLabel')}</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) => setFormData({ ...formData, visibility: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VISIBILITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pinned */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="pinned"
                checked={formData.pinned}
                onCheckedChange={(checked) => setFormData({ ...formData, pinned: !!checked })}
              />
              <Label htmlFor="pinned" className="cursor-pointer">
                {t('dashboard.internalNews.form.pinnedLabel')}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              {t('dashboard.internalNews.cancelBtn')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.title.trim() || isSubmitting}
            >
              {isSubmitting ? t('dashboard.internalNews.saving') : editingNews ? t('dashboard.internalNews.update') : t('dashboard.internalNews.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingNews?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{getCategoryLabel(viewingNews?.category)}</Badge>
              <Badge variant={getStatusBadgeVariant(viewingNews?.status)}>
                {getStatusLabel(viewingNews?.status)}
              </Badge>
              {viewingNews?.pinned && (
                <Badge variant="default">
                  <Pin className="w-3 h-3 mr-1" />
                  {t('dashboard.internalNews.pinned')}
                </Badge>
              )}
            </div>

            {viewingNews?.summary && (
              <div>
                <Label className="text-muted-foreground">{t('dashboard.internalNews.form.summaryLabel')}</Label>
                <p className="mt-1">{viewingNews.summary}</p>
              </div>
            )}

            {viewingNews?.content && (
              <div>
                <Label className="text-muted-foreground">{t('dashboard.internalNews.form.contentLabel')}</Label>
                <p className="mt-1 whitespace-pre-wrap">{viewingNews.content}</p>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{viewingNews?.author_name}</span>
              </div>
              {viewingNews?.published_at && (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    {format(new Date(viewingNews.published_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </span>
                </div>
              )}
              <div>
                {viewingNews?.view_count} {t('dashboard.internalNews.views')}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              {t('dashboard.internalNews.closeBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dashboard.internalNews.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dashboard.internalNews.deleteConfirmDesc')} "{deletingNews?.title}"
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('dashboard.internalNews.cancelBtn')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('dashboard.internalNews.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
