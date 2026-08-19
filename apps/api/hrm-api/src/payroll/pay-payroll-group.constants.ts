/** F-PAY-GROUP-01 — phân nhóm bảng lương (FR-UC-BP-PAY-09 · BR-BP-PAY-04). */
export const HRM_PAY_GROUP_409 = 'HRM-PAY-GROUP-409';
export const HRM_PAY_GROUP_412 = 'HRM-PAY-GROUP-412';

export const PAY_PAYROLL_GROUP_STATUS_ACTIVE = 'active';
export const PAY_PAYROLL_GROUP_STATUS_RETIRED = 'retired';

export const PAY_GROUP_MATCH_SOURCES = ['explicit_list', 'department', 'position'] as const;
export type PayPayrollGroupMatchSource = (typeof PAY_GROUP_MATCH_SOURCES)[number];
