"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceOverviewService = void 0;
const common_1 = require("@nestjs/common");
const attendance_requests_service_1 = require("./attendance-requests.service");
const leave_requests_service_1 = require("./leave-requests.service");
const MONTH_LABELS = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];
const LEAVE_TYPE_COLORS = {
    annual: '#3b82f6',
    'Nghỉ phép': '#3b82f6',
    other: '#a3a3a3',
    'Khác': '#a3a3a3',
};
function leaveDays(totalDays) {
    const parsed = Number.parseFloat(String(totalDays ?? '0'));
    return Number.isFinite(parsed) ? parsed : 0;
}
function monthIndex(isoDate) {
    const m = new Date(isoDate).getMonth();
    return Number.isFinite(m) ? m : 0;
}
let AttendanceOverviewService = class AttendanceOverviewService {
    leaveRequests;
    attendanceRequests;
    constructor(leaveRequests, attendanceRequests) {
        this.leaveRequests = leaveRequests;
        this.attendanceRequests = attendanceRequests;
    }
    async getOverview(query, authorization, tenantId) {
        const selectedYear = query.year ?? new Date().getFullYear();
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const [leaveRes, lateRes] = await Promise.all([
            this.leaveRequests.listLeaveRequests({ company_id: query.company_id }, authorization, tenantId),
            this.attendanceRequests.listLateEarlyRequests({ company_id: query.company_id }, authorization, tenantId),
        ]);
        const leaves = (leaveRes.data ?? []).filter((l) => {
            const y = new Date(l.start_date).getFullYear();
            return y === selectedYear;
        });
        const lateEarlyAll = lateRes.data ?? [];
        const lateEarlyToday = lateEarlyAll.filter((r) => r.request_date === todayStr).length;
        const monthlyLeaveData = MONTH_LABELS.map((month, idx) => {
            const monthLeaves = leaves.filter((l) => monthIndex(l.start_date) === idx);
            const value = monthLeaves.reduce((sum, l) => sum + leaveDays(l.total_days), 0);
            return { month, value };
        });
        const deptMap = new Map();
        for (const l of leaves) {
            const dept = l.department || 'Không xác định';
            deptMap.set(dept, (deptMap.get(dept) ?? 0) + leaveDays(l.total_days));
        }
        const departmentLeaveData = Array.from(deptMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({
            name: name.length > 12 ? `${name.slice(0, 12)}...` : name,
            value,
        }));
        const typeMap = new Map();
        for (const l of leaves) {
            const type = l.leave_type || 'Khác';
            typeMap.set(type, (typeMap.get(type) ?? 0) + 1);
        }
        const leaveTypeData = Array.from(typeMap.entries()).map(([name, value]) => ({
            name,
            value,
            color: LEAVE_TYPE_COLORS[name] ?? LEAVE_TYPE_COLORS.Khác,
        }));
        const lateEarlyMap = new Map();
        for (const r of lateEarlyAll) {
            const existing = lateEarlyMap.get(r.employee_id);
            if (existing) {
                existing.count += 1;
            }
            else {
                lateEarlyMap.set(r.employee_id, {
                    name: r.employee_name,
                    dept: r.department || 'Không xác định',
                    count: 1,
                });
            }
        }
        const lateEarlyList = Array.from(lateEarlyMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const thisWeekLeaves = leaves.filter((l) => {
            const d = new Date(l.start_date);
            return d >= weekStart && d <= weekEnd;
        });
        const nextWeekStart = new Date(today);
        nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
        const nextWeekLeaves = leaves.filter((l) => {
            const d = new Date(l.start_date);
            return d >= nextWeekStart && d <= nextWeekEnd;
        });
        return {
            stats: {
                lateEarlyToday,
                lateEarlyChange: 0,
                actualLeaveThisWeek: thisWeekLeaves.reduce((sum, l) => sum + leaveDays(l.total_days), 0),
                actualLeaveChange: 0,
                plannedLeaveNextWeek: nextWeekLeaves.reduce((sum, l) => sum + leaveDays(l.total_days), 0),
                plannedLeaveChange: 0,
            },
            monthlyLeaveData,
            departmentLeaveData,
            leaveTypeData,
            lateEarlyList,
        };
    }
};
exports.AttendanceOverviewService = AttendanceOverviewService;
exports.AttendanceOverviewService = AttendanceOverviewService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [leave_requests_service_1.LeaveRequestsService,
        attendance_requests_service_1.AttendanceRequestsService])
], AttendanceOverviewService);
//# sourceMappingURL=attendance-overview.service.js.map