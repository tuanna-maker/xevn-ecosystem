import { describe, expect, it } from 'vitest';
import type { InsuranceListItem } from '@/hooks/useInsuranceList';
import {
  ACT_HRM_INS_LINK_CAPABILITY,
  attachParticipantIdToListItem,
  buildInsuranceParticipantApiPayload,
  buildPolicyParticipantIdByCode,
  resolveInsuranceParticipantMutateTarget,
  resolveParticipantIdForListItem,
} from './insuranceParticipantLink';

const baseItem: InsuranceListItem = {
  id: 'workforce-ins-1',
  employee_code: 'LOG-0003',
  employee_name: 'Lê Văn An',
  employee_avatar: null,
  department: 'Logistics',
  social_insurance_number: 'BH-001',
  health_insurance_number: null,
  unemployment_insurance_number: null,
  social_insurance_rate: 8,
  health_insurance_rate: null,
  unemployment_insurance_rate: null,
  base_salary: 10_000_000,
  effective_date: '2026-01-01',
  expiry_date: null,
  status: 'active',
  notes: null,
  created_at: '2026-01-01T00:00:00.000Z',
  company_id: 'main',
};

describe('ACT-HRM-INS-LINK participant helpers', () => {
  it('exports capability code for QA traceability', () => {
    expect(ACT_HRM_INS_LINK_CAPABILITY).toBe('ACT-HRM-INS-LINK');
  });

  it('maps employee_code to participant id for PATCH target', () => {
    const lookup = buildPolicyParticipantIdByCode([
      { id: 'participant-uuid-1', employee_code: 'LOG-0003' },
    ]);
    expect(resolveParticipantIdForListItem(baseItem, lookup)).toBe('participant-uuid-1');
    expect(attachParticipantIdToListItem(baseItem, lookup).participant_id).toBe(
      'participant-uuid-1',
    );
  });

  it('prefers explicit participant_id on list item', () => {
    const lookup = buildPolicyParticipantIdByCode([
      { id: 'other-id', employee_code: 'LOG-0003' },
    ]);
    expect(
      resolveParticipantIdForListItem(
        { ...baseItem, participant_id: 'explicit-participant' },
        lookup,
      ),
    ).toBe('explicit-participant');
  });

  it('resolves update vs create mutate target (UF-HRM-04 link/save)', () => {
    const lookup = buildPolicyParticipantIdByCode([
      { id: 'participant-uuid-1', employee_code: 'LOG-0003' },
    ]);
    expect(resolveInsuranceParticipantMutateTarget(null, lookup)).toEqual({ mode: 'create' });
    expect(
      resolveInsuranceParticipantMutateTarget(
        { ...baseItem, participant_id: 'participant-uuid-1' },
        lookup,
      ),
    ).toEqual({ mode: 'update', participantId: 'participant-uuid-1' });
    expect(resolveInsuranceParticipantMutateTarget(baseItem, lookup)).toEqual({
      mode: 'update',
      participantId: 'participant-uuid-1',
    });
    expect(
      resolveInsuranceParticipantMutateTarget(
        { ...baseItem, employee_code: 'UNKNOWN' },
        lookup,
      ),
    ).toEqual({ mode: 'create' });
  });

  it('builds POST/PATCH payload with employee_id link + company scope', () => {
    const payload = buildInsuranceParticipantApiPayload('main', {
      employee_id: 'emp-uuid-1',
      employee_code: 'LOG-0003',
      employee_name: 'Lê Văn An',
      base_salary: 12_000_000,
      status: 'active',
      social_insurance_number: 'BH-001',
    });
    expect(payload.company_id).toBe('main');
    expect(payload.employee_id).toBe('emp-uuid-1');
    expect(payload.employee_code).toBe('LOG-0003');
    expect(payload.insurance_type).toBe('all');
  });
});
