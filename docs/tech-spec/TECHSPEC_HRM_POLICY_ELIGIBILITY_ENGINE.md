# TECHSPEC: ARCHITECTURE FOR HRM POLICY ELIGIBILITY & MASTER SETTINGS ENGINE

**Document Code:** XEVN-TECHSPEC-HRM-POLICY-ELIGIBILITY-v1.0  
**Target:** NestJS Backend (`apps/api/hrm-api`) & React Frontend (`apps/web/hrm`)  
**Status:** APPROVED  

---

## 1. TỔNG QUAN KIẾN TRÚC MÔ-ĐUN (SOLID FE & BE)

Kiến trúc tuân thủ nguyên lý **SOLID**:
- **Single Responsibility Principle (SRP):** Tách riêng `SettingsService` (quản lý Master Catalog), `PolicyService` (quản lý Cấu hình Chính sách), `PolicyEligibilityService` (quản lý Quét & Áp dụng Chính sách cho Nhân sự).
- **Open/Closed Principle (OCP):** Cấu trúc `RuleConditionBuilder` và `ComponentFormBuilder` mở rộng các tiêu chí mới (Khu vực, Chi nhánh, Bậc lương) mà không cần sửa đổi logic nhân lõi.
- **Dependency Inversion Principle (DIP):** Tất cả dịch vụ phụ thuộc vào DB Interface `HrmDbService`.

---

## 2. THUẬT TOÁN QUÉT & ÁP DỤNG CHÍNH SÁCH (ELIGIBILITY MATCHING ALGORITHM)

```typescript
export interface EmployeeContext {
  employee_id: string;
  location_code: string;  // e.g. 'HN', 'YB', 'TINH'
  branch_code: string;    // e.g. 'TRAN_DAI_NGHIA', 'NGOC_HOI'
  department_id: string;
  job_title_code: string;
  step_code: string;
  contract_type: string;
  seniority_months: number;
}

export function evaluatePolicyLevel(policy: Policy, emp: EmployeeContext): number | null {
  const scope = policy.scope;
  const conditions = policy.conditions || [];

  // Check conditions
  for (const cond of conditions) {
    if (cond.field === 'location' && !cond.value.split(',').includes(emp.location_code)) return null;
    if (cond.field === 'branch' && !cond.value.split(',').includes(emp.branch_code)) return null;
    if (cond.field === 'department' && !cond.value.split(',').includes(emp.department_id)) return null;
    if (cond.field === 'title' && !cond.value.split(',').includes(emp.job_title_code)) return null;
    if (cond.field === 'contract_type' && !cond.value.split(',').includes(emp.contract_type)) return null;
    if (cond.field === 'seniority' && emp.seniority_months < Number(cond.value)) return null;
  }

  // Assign Hierarchy Priority Level
  if (scope === 'individual') return 1; // Highest
  if (scope === 'branch') return 2;
  if (scope === 'location') return 3;
  if (scope === 'department' || scope === 'position') return 4;
  return 5; // Global - Lowest
}
```
