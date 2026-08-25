function WorkflowStepsCard({
  draft,
  setDraft,
  updateStep,
  employees,
  customActions,
}: {
  draft: WorkflowDraft;
  setDraft: DraftSetter;
  updateStep: (id: string, patch: Partial<WorkflowStep>) => void;
  employees: Array<{ id: string; full_name: string; job_title?: string; department_id?: string }>;
  customActions: { id: string; name: string }[];
}) {