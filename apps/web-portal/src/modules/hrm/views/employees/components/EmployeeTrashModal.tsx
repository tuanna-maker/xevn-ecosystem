import React from 'react';
import { CenteredModal } from '../../shared/CenteredModal';
import { Trash2 } from 'lucide-react';

interface EmployeeTrashModalProps {
  open: boolean;
  onClose: () => void;
}

export const EmployeeTrashModal: React.FC<EmployeeTrashModalProps> = ({ open, onClose }) => {
  return (
    <CenteredModal 
      open={open} 
      title="Danh sách nhân viên đã xóa" 
      onClose={onClose}
      className="max-w-2xl"
    >
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-24 h-24 rounded-[32px] bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
          <Trash2 className="w-12 h-12 text-slate-300" strokeWidth={1} />
        </div>
        <h4 className="text-xl font-black text-slate-700 tracking-tight">Thùng rác đang trống</h4>
        <p className="text-slate-400 mt-3 max-w-xs font-medium leading-relaxed">
          Tuyệt vời! Hiện tại không có hồ sơ nhân sự nào nằm trong danh sách chờ xóa vĩnh viễn.
        </p>
      </div>
    </CenteredModal>
  );
};
