# D5 — Payroll Form Validation Audit (UX-UI-ERP-AUDIT-01)

D5 is PARTIALLY CONFIRMED. Payroll salary component form (lines 1317-1412) uses
manual `validateAddSalaryComponentForm()` — NOT Zod + react-hook-form.

Compare: Employees.tsx uses Zod schema. Cursor should refactor Payroll form
to Employees pattern: Zod schema → RHF `useForm` → `zodResolver`.

Scope for D5 refactor:
1. Replace validateAddSalaryComponentForm with Zod schema
2. Migrate to useForm(t('payroll.salaryComponents')) pattern
3. Match Employees.tsx error mapping (fieldErrors → t('errors.X'))

Risk: Revenue data (salary/tax) needs zero-tolerance validation.
D5 is P1 but priority justified by compliance angle.

Status: OPEN — Cursor owns D5 in synthesis split.
