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
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
              <p>{t('deletedEmployees.empty')}</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {deletedEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
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
                          <span className="font-medium">{emp.full_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {emp.employee_code}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {emp.department} • {emp.position}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {t('deletedEmployees.deletedAt')}: {formatDate(emp.deleted_at)}
                          </span>
                        </div>
                        {emp.delete_reason && (
                          <div className="text-xs text-muted-foreground mt-1">
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
            <AlertDialogTitle>{t('deletedEmployees.restoreConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
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
