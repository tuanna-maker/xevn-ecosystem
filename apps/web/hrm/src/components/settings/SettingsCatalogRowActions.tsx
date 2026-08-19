/**
 * Hàng thao tác chuẩn catalog Settings — Sửa · Ngừng (soft-delete).
 * WorkItem: PO-HRM-IA-UX-REMasters-SPONSOR-01
 */
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type SettingsCatalogRowActionsProps = {
  onEdit: () => void;
  onRetire?: () => void;
  editTestId?: string;
  retireTestId?: string;
  retireLabel?: string;
};

export function SettingsCatalogRowActions({
  onEdit,
  onRetire,
  editTestId,
  retireTestId,
  retireLabel = 'Ngừng',
}: SettingsCatalogRowActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-9 px-2.5"
        onClick={onEdit}
        data-testid={editTestId}
      >
        <Pencil className="mr-1 h-3.5 w-3.5" />
        Sửa
      </Button>
      {onRetire ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 px-2.5 text-destructive hover:text-destructive"
          onClick={onRetire}
          data-testid={retireTestId}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          {retireLabel}
        </Button>
      ) : null}
    </div>
  );
}
