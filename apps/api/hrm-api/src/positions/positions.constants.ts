export const PAY_POSITION_SCOPES = ['company', 'department'] as const;
export type PayPositionScope = (typeof PAY_POSITION_SCOPES)[number];

export const HRM_POS_GRADE_REQUIRED = 'GRADE_CODE_REQUIRED';
export const HRM_POS_GRADE_INVALID = 'INVALID_GRADE_CODE';
export const HRM_POS_404 = 'HRM-POS-404';
export const HRM_POS_409 = 'HRM-POS-409';

/** Employee invent / unknown position when pay_position EFF>0. */
export const HRM_EMP_POSITION_KEY = 'HRM-EMP-POSITION-KEY';

/** Department-scoped position requires department on employee (Approach A). */
export const HRM_EMP_POSITION_DEPT_REQUIRED = 'HRM-EMP-POSITION-DEPT-REQUIRED';

/** Position not enabled for employee's department. */
export const HRM_EMP_POSITION_DEPT_MISMATCH = 'HRM-EMP-POSITION-DEPT-MISMATCH';
