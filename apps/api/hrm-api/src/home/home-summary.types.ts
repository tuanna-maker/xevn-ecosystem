export type HomeSummaryTaskItem = {
  id: string;
  kind:
    | 'inbox'
    | 'own_pending_leave'
    | 'own_pending_update'
    | 'manager_approval_leave'
    | 'manager_approval_update';
  title: string;
  subtitle: string | null;
  priority: number;
  entity_type:
    | 'leave_request'
    | 'attendance_update_request'
    | 'inbox_notification';
  entity_id: string;
  created_at: string;
  deep_link: string;
};

export type HomeSummaryManagerPreviewItem = {
  id: string;
  kind: 'leave_request' | 'attendance_update_request';
  employee_name: string;
  title: string;
  subtitle: string | null;
  entity_id: string;
  created_at: string;
};

export type HomeCelebrationItem = {
  employee_id: string;
  display_name: string;
  month_day: string;
  display_date: string;
  avatar_url: string | null;
  avatar_initials: string;
};

export type HomeWhosOutItem = {
  employee_id: string;
  display_name: string;
  leave_type: string;
  leave_request_id: string;
  avatar_url: string | null;
};

export type HomeSummaryData = {
  viewer: {
    employee_id: string;
    display_name: string;
    is_manager: boolean;
    is_birthday_today: boolean;
  };
  tasks: {
    total_count: number;
    unread_inbox_count: number;
    own_pending_count: number;
    items: HomeSummaryTaskItem[];
  };
  manager_pending: {
    total_count: number;
    leave_count: number;
    update_count: number;
    preview: HomeSummaryManagerPreviewItem[];
  };
  celebrations: {
    total_count: number;
    items: HomeCelebrationItem[];
  };
  whos_out: {
    total_count: number;
    items: HomeWhosOutItem[];
  };
  attendance_today: {
    checked_in: boolean;
    check_in_at: string | null;
    status: string | null;
  };
  generated_at: string;
};
