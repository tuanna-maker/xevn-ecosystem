import { describe, expect, it, vi } from 'vitest';
import {
  handleLeaveSwipeAction,
  handleManagerSwipeAction,
  resolveLeaveListSwipeActions,
  resolveManagerApprovalSwipeActions,
} from '../swipeRowActions';

describe('swipeRowActions — MOB-UX-13f', () => {
  it('resolveManagerApprovalSwipeActions returns Duyệt + Từ chối', () => {
    const actions = resolveManagerApprovalSwipeActions();
    expect(actions.map((a) => a.label)).toEqual(['Từ chối', 'Duyệt']);
    expect(actions.map((a) => a.kind)).toEqual(['decline', 'approve']);
    expect(actions[0].tone).toBe('danger');
    expect(actions[1].tone).toBe('success');
  });

  it('resolveLeaveListSwipeActions — pending tab includes cancel + detail', () => {
    const actions = resolveLeaveListSwipeActions('review', 'pending');
    expect(actions.map((a) => a.kind)).toEqual(['cancel', 'detail']);
    expect(actions[0].label).toBe('Hủy đơn');
    expect(actions[1].label).toBe('Chi tiết');
  });

  it('resolveLeaveListSwipeActions — approved tab is detail only', () => {
    const actions = resolveLeaveListSwipeActions('approved', 'approved');
    expect(actions).toHaveLength(1);
    expect(actions[0].kind).toBe('detail');
  });

  it('resolveLeaveListSwipeActions — rejected tab is detail only', () => {
    const actions = resolveLeaveListSwipeActions('rejected', 'rejected');
    expect(actions).toHaveLength(1);
    expect(actions[0].kind).toBe('detail');
  });

  it('handleManagerSwipeAction routes approve and decline', () => {
    const onApprove = vi.fn();
    const onDecline = vi.fn();
    handleManagerSwipeAction('approve', { onApprove, onDecline });
    expect(onApprove).toHaveBeenCalledOnce();
    expect(onDecline).not.toHaveBeenCalled();

    handleManagerSwipeAction('decline', { onApprove, onDecline });
    expect(onDecline).toHaveBeenCalledOnce();
  });

  it('handleLeaveSwipeAction routes detail and cancel', () => {
    const onDetail = vi.fn();
    const onCancel = vi.fn();
    handleLeaveSwipeAction('detail', { onDetail, onCancel });
    expect(onDetail).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();

    handleLeaveSwipeAction('cancel', { onDetail, onCancel });
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
