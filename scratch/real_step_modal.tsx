function WorkflowStepModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  employees,
  stepCount,
  customActions,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData: WorkflowStep | null;
  onSave: (data: WorkflowStep) => void;
  employees: Array<{ id: string; full_name: string; job_title?: string; department_id?: string }>;
  stepCount: number;
  customActions: { id: string; name: string }[];
}) {