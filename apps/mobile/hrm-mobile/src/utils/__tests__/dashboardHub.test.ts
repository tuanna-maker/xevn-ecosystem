import { describe, expect, it } from 'vitest';
import {
  buildManagerPreviewRows,
  mapInboxToHomeTask,
  mapOwnPendingLeave,
  mapOwnPendingUpdate,
  mergeHomeTasks,
  parseInboxEntity,
  resolveManagerPendingCount,
  type InboxHubRow,
  type ManagerLeaveRow,
  type ManagerUpdateRow,
  type OwnPendingLeaveRow,
  type OwnPendingUpdateRow,
} from '../dashboardHub';

describe('dashboardHub — Smart Hub v2 (MOB-UX-04a)', () => {
  it('parseInboxEntity extracts leave_request_id from payload', () => {
    const parsed = parseInboxEntity({
      leave_request_id: 'leave-1',
      employee_name: 'Trần B',
    });
    expect(parsed.entityId).toBe('leave-1');
    expect(parsed.entityType).toBe('leave_request');
    expect(parsed.displayName).toBe('Trần B');
  });

  it('mapInboxToHomeTask maps leave_request.created for manager vs employee', () => {
    const row: InboxHubRow = {
      id: 'inbox-1',
      event_type: 'leave_request.created',
      payload: { employee_name: 'Trần B', leave_request_id: 'lr-1' },
      read_at: null,
      created_at: '2026-06-07T08:00:00Z',
    };
    const mgr = mapInboxToHomeTask(row, true);
    expect(mgr?.title).toContain('Trần B');
    expect(mgr?.navigate).toEqual({ target: 'ManagerApprovals' });
    expect(mgr?.unread).toBe(true);

    const emp = mapInboxToHomeTask(row, false);
    expect(emp?.navigate).toEqual({ target: 'LeaveRequestsList' });
  });

  it('mapInboxToHomeTask maps approved leave to detail deep link', () => {
    const row: InboxHubRow = {
      id: 'inbox-2',
      event_type: 'leave_request.approved',
      payload: { leave_request_id: 'lr-9' },
      read_at: '2026-06-07T09:00:00Z',
      created_at: '2026-06-07T08:30:00Z',
    };
    const task = mapInboxToHomeTask(row, false);
    expect(task?.navigate).toEqual({ target: 'LeaveRequestDetail', id: 'lr-9' });
    expect(task?.title).toContain('được duyệt');
  });

  it('mergeHomeTasks dedupes inbox + own pending by entity id (BR-MGR-TASK-08)', () => {
    const inbox: InboxHubRow[] = [
      {
        id: 'inbox-3',
        event_type: 'leave_request.approved',
        payload: { leave_request_id: 'lr-dup' },
        read_at: null,
        created_at: '2026-06-07T07:00:00Z',
      },
    ];
    const ownLeave: OwnPendingLeaveRow[] = [
      {
        id: 'lr-dup',
        leave_type: 'annual',
        start_date: '2026-06-10',
        end_date: '2026-06-11',
        status: 'pending',
      },
    ];
    const ownUpdate: OwnPendingUpdateRow[] = [
      { id: 'upd-1', update_type: 'Quên check-out', status: 'pending' },
    ];

    const { totalCount, preview } = mergeHomeTasks(inbox, ownLeave, ownUpdate, false, 3);
    expect(totalCount).toBe(2);
    expect(preview.some((r) => r.dedupeKey === 'leave_request:lr-dup')).toBe(true);
    expect(preview.find((r) => r.dedupeKey === 'leave_request:lr-dup')?.key).toBe('own-leave:lr-dup');
  });

  it('mergeHomeTasks counts unread inbox + own pending for badge total', () => {
    const inbox: InboxHubRow[] = [
      {
        id: 'inbox-4',
        event_type: 'attendance_update_request.created',
        payload: { update_request_id: 'u-2', employee_name: 'A' },
        read_at: null,
        created_at: '2026-06-07T08:00:00Z',
      },
    ];
    const { totalCount } = mergeHomeTasks(inbox, [], [], true, 3);
    expect(totalCount).toBe(1);
  });

  it('mapOwnPendingLeave and mapOwnPendingUpdate produce business titles', () => {
    const leave = mapOwnPendingLeave({
      id: 'l1',
      leave_type: 'LVT_01',
      start_date: '2026-06-10',
      end_date: '2026-06-12',
      status: 'pending',
    });
    expect(leave.title).toContain('chờ duyệt');
    expect(leave.navigate).toEqual({ target: 'LeaveRequestDetail', id: 'l1' });

    const upd = mapOwnPendingUpdate({ id: 'u1', update_type: 'Sửa giờ vào', status: 'pending' });
    expect(upd.title).toContain('Chỉnh sửa CC');
    expect(upd.navigate).toEqual({ target: 'UpdateRequestDetail', id: 'u1' });
  });

  it('resolveManagerPendingCount matches leave + update rows (AC-MOB-HUB-07-02)', () => {
    const leaves: ManagerLeaveRow[] = [
      {
        id: 'ml-1',
        employee_name: 'NV A',
        leave_type: 'annual',
        start_date: '2026-06-10',
        end_date: '2026-06-11',
      },
      {
        id: 'ml-2',
        employee_name: 'NV B',
        leave_type: 'sick',
        start_date: '2026-06-12',
        end_date: '2026-06-13',
      },
    ];
    const updates: ManagerUpdateRow[] = [{ id: 'mu-1', employee_name: 'NV C', update_type: 'Quên OUT' }];
    expect(resolveManagerPendingCount(leaves, updates)).toBe(3);
  });

  it('buildManagerPreviewRows caps preview and formats subtitles', () => {
    const leaves: ManagerLeaveRow[] = [
      {
        id: 'ml-1',
        employee_name: 'Nguyễn A',
        leave_type: 'LVT_01',
        start_date: '2026-06-10',
        end_date: '2026-06-11',
      },
    ];
    const updates: ManagerUpdateRow[] = [{ id: 'mu-1', employee_name: 'Trần B', update_type: 'IN' }];
    const preview = buildManagerPreviewRows(leaves, updates, 3);
    expect(preview).toHaveLength(2);
    expect(preview[0].subtitle).toContain('Nghỉ phép');
    expect(preview[1].subtitle).toContain('Chỉnh sửa CC');
  });
});
