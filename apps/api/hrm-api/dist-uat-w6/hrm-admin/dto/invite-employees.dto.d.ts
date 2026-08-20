declare class InviteEmployeeItemDto {
    email: string;
    full_name?: string;
    employee_id?: string;
}
export declare class InviteEmployeesDto {
    company_id: string;
    employees: InviteEmployeeItemDto[];
}
export {};
