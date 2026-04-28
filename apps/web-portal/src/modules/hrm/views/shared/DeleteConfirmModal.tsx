import React from 'react';
import { CenteredModal } from './CenteredModal';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title = "Xác nhận xóa",
  description = "Bạn có chắc chắn muốn xóa dữ liệu này? Hành động này không thể hoàn tác."
}) => {
  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <span className="text-base font-bold text-slate-900">{title}</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3 p-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center px-6 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-9 items-center gap-2 px-8 rounded-full bg-red-500 text-sm font-bold text-white shadow-md shadow-red-100 hover:bg-red-600 transition-all active:scale-95"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Xác nhận xóa
          </button>
        </div>
      }
    >
      <div className="p-2">
        <p className="text-sm text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>
    </CenteredModal>
  );
};
