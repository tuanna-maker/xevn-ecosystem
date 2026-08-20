"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDirectoryView = isDirectoryView;
exports.resolveDirectorySearchTerm = resolveDirectorySearchTerm;
exports.readDepartment = readDepartment;
exports.readPhoneNumber = readPhoneNumber;
exports.maskDirectoryEmail = maskDirectoryEmail;
exports.mapDirectoryListItem = mapDirectoryListItem;
exports.mapDirectoryDetail = mapDirectoryDetail;
exports.directoryItemPassesAttendanceFilter = directoryItemPassesAttendanceFilter;
exports.todayIsoInHoChiMinh = todayIsoInHoChiMinh;
const employee_update_policy_1 = require("./employee-update-policy");
function isDirectoryView(view) {
    return view?.trim().toLowerCase() === 'directory';
}
function resolveDirectorySearchTerm(keyword, q) {
    const term = (q ?? keyword)?.trim();
    return term || undefined;
}
function readDepartment(customFields) {
    const value = customFields?.department?.trim();
    return value || null;
}
function readPhoneNumber(customFields) {
    const phone = customFields?.phone_number?.trim() || customFields?.work_phone?.trim();
    return phone || null;
}
function maskDirectoryEmail(email) {
    const trimmed = email.trim();
    const at = trimmed.indexOf('@');
    if (at <= 0) {
        return '***';
    }
    const local = trimmed.slice(0, at);
    const domain = trimmed.slice(at + 1);
    const maskedLocal = local.length <= 1 ? '*' : `${local[0]}***`;
    return `${maskedLocal}@${domain}`;
}
function mapDirectoryListItem(row, attendance, includeAttendanceToday) {
    const item = {
        id: row.id,
        employee_code: row.employee_code,
        full_name: row.full_name,
        job_title_key: row.job_title_key,
        job_title: row.job_title_key,
        department: readDepartment(row.custom_fields),
        avatar_url: row.avatar_url ?? null,
        status: row.status,
    };
    if (includeAttendanceToday) {
        item.attendance_today = {
            checked_in: Boolean(attendance?.check_in_at),
            check_in_at: attendance?.check_in_at ?? null,
            status: attendance?.status ?? null,
        };
    }
    return item;
}
function mapDirectoryDetail(row, authorization, attendance, includeAttendanceToday) {
    const base = mapDirectoryListItem(row, attendance, includeAttendanceToday);
    const detail = {
        ...base,
        manager_id: row.manager_id,
        phone_number: readPhoneNumber(row.custom_fields),
    };
    if ((0, employee_update_policy_1.canFullEmployeeUpdate)(authorization)) {
        detail.email = row.email;
    }
    else {
        detail.email = maskDirectoryEmail(row.email);
    }
    return detail;
}
function directoryItemPassesAttendanceFilter(item, filter) {
    if (!filter || filter === 'all') {
        return true;
    }
    const checkedIn = item.attendance_today?.checked_in ?? false;
    if (filter === 'checked_in') {
        return checkedIn;
    }
    if (filter === 'not_checked_in') {
        return !checkedIn;
    }
    return true;
}
function todayIsoInHoChiMinh() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
}
//# sourceMappingURL=employee-directory.js.map