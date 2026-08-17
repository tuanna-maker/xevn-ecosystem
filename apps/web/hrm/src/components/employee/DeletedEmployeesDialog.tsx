/**
 * @CODE-MEMORY
 * Screen:     Employees → Đã xóa (n) + Khôi phục (E14–E15)
 * UC:         TC-HRM-HDSD SoftDel archive restore
 * WorkItem:   PO-HRM-UI-BRAND-W3-EMP-B
 * Purpose:    Archive list dialog + restore confirm — ops-dense chrome.
 * must_keep:  onRestore → restoreEmployee API; SoftDel path; no hard-delete invent
 * ADR:        docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-EMP-B
 * change_mode: UPGRADE
 * What: Title sharp; row border-xevn; empty icon textMuted; restore AlertDialog title sharp
 * Why: ADR pale ban · inventory W3-EMP-B E14 E15
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw, Trash2, User, Calendar, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
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
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Employee } from '@/hooks/useEmployees';

interface DeletedEmployeesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deletedEmployees: Employee[];
  onRestore: (id: string) => Promise<boolean>;
}

export function DeletedEmployeesDialog({
  open,
  onOpenChange,
  deletedEmployees,
  onRestore,
}: DeletedEmployeesDialogProps) {
  const { t } = useTranslation();
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<Employee | null>(null);

  const handleRestore = async () => {
    if (!confirmRestore) return;
    
    setRestoringId(confirmRestore.id);
    await onRestore(confirmRestore.id);
    setRestoringId(null);
    setConfirmRestore(null);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              {t('deletedEmployees.title')}
            </DialogTitle>
          </DialogHeader>

          {deletedEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-xevn-textSecondary">
              <AlertCircle className="mb-4 h-12 w-12 text-xevn-textMuted opacity-70" />
              <p className="text-[15px] text-xevn-textSecondary">{t('deletedEmployees.empty')}</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {deletedEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between rounded-card border border-xevn-border bg-xevn-surface p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={emp.avatar_url || undefined} />
                        <AvatarFallback className="bg-destructive/10 text-destructive">
                          {emp.full_name.split(' ').pop()?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xevn-text">{emp.full_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {emp.employee_code}
                          </Badge>
                        </div>
                        <div className="text-sm text-xevn-textSecondary">
                          {emp.department} • {emp.position}
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-xs text-xevn-textSecondary">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {t('deletedEmployees.deletedAt')}: {formatDate(emp.deleted_at)}
                          </span>
                        </div>
                        {emp.delete_reason && (
                          <div className="mt-1 text-xs text-xevn-textSecondary">
                            {t('deletedEmployees.reason')}: {emp.delete_reason}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmRestore(emp)}
                      disabled={restoringId === emp.id}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {t('deletedEmployees.restore')}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmRestore} onOpenChange={() => setConfirmRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-bold text-xevn-text">
              {t('deletedEmployees.restoreConfirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xevn-textSecondary">
              {t('deletedEmployees.restoreConfirmDesc', { name: confirmRestore?.full_name, code: confirmRestore?.employee_code })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>
              {t('deletedEmployees.restore')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
