export declare const HRM_SC_POS_KEYS: readonly ["job_titles", "departments", "department_catalog", "org_departments", "positions"];
export declare const HRM_SC_LEAVE_KEY: "leave_types";
export declare const HRM_SC_DEC_KEY: "decision_types";
export declare const HRM_SC_PAY_KEYS: readonly ["salary_components", "payroll_templates"];
export type HrmSettingsMasterKey = (typeof HRM_SC_POS_KEYS)[number] | typeof HRM_SC_LEAVE_KEY | typeof HRM_SC_DEC_KEY | (typeof HRM_SC_PAY_KEYS)[number];
export declare function normalizeMasterCatalogKey(catalogKey: string): string;
export declare function isPosCatalogKey(catalogKey: string): boolean;
