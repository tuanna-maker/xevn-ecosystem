import type { UpdateEmployeeDto } from './dto/update-employee.dto';
export declare const SELF_PATCH_CUSTOM_FIELD_KEYS: readonly ["phone_number", "work_phone"];
export type SelfPatchCustomFieldKey = (typeof SELF_PATCH_CUSTOM_FIELD_KEYS)[number];
export declare function readJwtEmployeeId(authorization?: string): string | undefined;
export declare function isSelfEmployeeTarget(employeeId: string, authorization?: string): boolean;
export declare function canFullEmployeeUpdate(authorization?: string): boolean;
export declare function mergeSelfEssCustomFields(existing: Record<string, string> | null | undefined, patch: Record<string, string> | null | undefined): Record<string, string>;
export declare function assertEmployeeUpdateAllowed(employeeId: string, payload: UpdateEmployeeDto, authorization?: string): void;
