import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

export type AttendanceUpdateRequestRealtimePayload = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  status: string;
  attendance_date: string;
  update_type: string;
  created_at: string;
  updated_at: string;
};

/** Đơn nghỉ (bảng public.leave_requests trên Postgres HRM API). */
export type LeaveRequestRealtimePayload = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  status: string;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejected_reason?: string | null;
};

/** Dịch vụ / vận hành (bảng public.service_requests). `employee_id` có thể NULL. */
export type ServiceRequestRealtimePayload = {
  id: string;
  company_id: string;
  employee_id: string | null;
  employee_name: string;
  employee_code: string | null;
  service_type: string;
  request_date: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
};

/** R-CORE-07-ATT-12 — readable activate signal (OUT invent ATT enroll DONE). */
export type EmployeeActivatedRealtimePayload = {
  employee_id: string;
  company_id: string;
  effective_date: string;
};

export type HrmRealtimeEventEnvelope =
  | {
      type:
        | 'attendance_update_request.created'
        | 'attendance_update_request.approved'
        | 'attendance_update_request.rejected';
      at: string;
      request: AttendanceUpdateRequestRealtimePayload;
    }
  | {
      type: 'leave_request.created' | 'leave_request.approved' | 'leave_request.rejected';
      at: string;
      request: LeaveRequestRealtimePayload;
    }
  | {
      type: 'service_request.created' | 'service_request.approved' | 'service_request.rejected';
      at: string;
      request: ServiceRequestRealtimePayload;
    }
  | {
      type: 'employee.activated';
      at: string;
      request: EmployeeActivatedRealtimePayload;
    };

type EmployeeActivatedHandler = (
  payload: EmployeeActivatedRealtimePayload,
) => void | Promise<void>;

@Injectable()
export class HrmRealtimeService {
  private server: Server | null = null;
  private readonly employeeActivatedHandlers: EmployeeActivatedHandler[] = [];

  attachServer(server: Server) {
    this.server = server;
  }

  /** R-ATT-12-CONSUMER — attendance lane subscribes without grant logic on employees.service. */
  registerEmployeeActivatedHandler(handler: EmployeeActivatedHandler): void {
    this.employeeActivatedHandlers.push(handler);
  }

  /**
   * Fan-out Socket.IO: đơn mới → room công ty; quyết định → công ty + nhân viên (nếu có employee_id).
   * Cùng pipeline với inbox DB / webhook / push (xem AttendanceEventFanoutService).
   */
  publishAttendanceEvent(envelope: HrmRealtimeEventEnvelope) {
    if (!this.server) return;
    const { request, type } = envelope;
    if (
      type === 'attendance_update_request.created' ||
      type === 'leave_request.created' ||
      type === 'service_request.created' ||
      type === 'employee.activated'
    ) {
      this.server.to(`company:${request.company_id}`).emit('hrm:event', envelope);
      if (type === 'employee.activated') {
        this.server.to(`employee:${request.employee_id}`).emit('hrm:event', envelope);
      }
      return;
    }
    this.server.to(`company:${request.company_id}`).emit('hrm:event', envelope);
    const emp =
      'employee_id' in request && request.employee_id != null && request.employee_id !== ''
        ? request.employee_id
        : null;
    if (emp) this.server.to(`employee:${emp}`).emit('hrm:event', envelope);
  }

  /**
   * R-CORE-07-ATT-12 — emit readable employee.activated (wire-only · OUT invent ATT enroll).
   */
  publishEmployeeActivated(payload: EmployeeActivatedRealtimePayload) {
    this.publishAttendanceEvent({
      type: 'employee.activated',
      at: new Date().toISOString(),
      request: payload,
    });
    for (const handler of this.employeeActivatedHandlers) {
      void Promise.resolve(handler(payload)).catch(() => {
        // Consumer logs errors — CORE activate must not fail on enroll side effects.
      });
    }
  }
}
