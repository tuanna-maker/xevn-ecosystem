import { mapDirectoryListItem } from '../employees/employee-directory';
import type { EmployeeRow } from '../employees/employee-directory.types';
import { mapServiceRequestRow } from '../operations/operations.service';

describe('P1-G6-FIELD-01 (MOB-PARITY MP-01 / MP-14)', () => {
  const employeeRow: EmployeeRow = {
    id: '11111111-1111-4111-8111-111111111111',
    company_id: 'holding',
    employee_code: 'NV0001',
    email: 'uat.nv0001@xe.vn',
    full_name: 'UAT NV0001',
    job_title_key: 'STAFF',
    manager_id: null,
    status: 'active',
    hired_at: '2024-01-01',
    archived_at: null,
    avatar_url: null,
    custom_fields: { department: 'Vận hành' },
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  it('MP-01 directory list item includes job_title for mobile probe fieldCheck', () => {
    const item = mapDirectoryListItem(employeeRow);
    expect(item).toHaveProperty('job_title', 'STAFF');
    expect(item).toHaveProperty('job_title_key', 'STAFF');
  });

  it('MP-14 service request row includes request_type alias of service_type', () => {
    const mapped = mapServiceRequestRow({
      id: 'sr-1',
      company_id: '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013',
      service_type: 'meal',
      employee_id: employeeRow.id,
      employee_name: employeeRow.full_name,
      employee_code: employeeRow.employee_code,
      department: 'Vận hành',
      request_date: '2026-06-09',
      status: 'pending',
      notes: null,
      meal_type: 'lunch',
      meal_date: '2026-06-09',
      meal_quantity: 1,
      vehicle_purpose: null,
      vehicle_destination: null,
      vehicle_date: null,
      vehicle_time_start: null,
      vehicle_time_end: null,
      vehicle_passengers: null,
      supply_items: null,
      supply_urgency: null,
      approved_by: null,
      approved_at: null,
      rejected_reason: null,
      created_at: '2026-06-09T00:00:00.000Z',
      updated_at: '2026-06-09T00:00:00.000Z',
    });
    expect(mapped.request_type).toBe('meal');
    expect(mapped.service_type).toBe('meal');
    expect(mapped.status).toBe('pending');
  });
});
