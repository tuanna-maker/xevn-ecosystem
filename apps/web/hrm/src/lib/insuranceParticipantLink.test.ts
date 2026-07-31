import { describe, expect, it } from 'vitest';
import type { InsuranceListItem } from '@/hooks/useInsuranceList';
import {
  ACT_HRM_INS_LINK_CAPABILITY,
  attachParticipantIdToListItem,
  buildInsuranceParticipantApiPayload,
  buildPolicyParticipantIdByCode,
  filterActiveInsurancePolicies,
  formatInsurancePolicyPickerLabel,
  isInsuranceParticipantPolicyAmbig,
  isInsuranceParticipantPolicyBlocked,
  resolveInsuranceParticipantMutateTarget,
  resolveInsurancePolicyPickerOptions,
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
    expect(payload).not.toHaveProperty('policy_id');
  });

  it('includes policy_id when selected (cấm orphan null)', () => {
    const withId = buildInsuranceParticipantApiPayload('main', {
      employee_id: 'emp-uuid-1',
      employee_code: 'LOG-0003',
      employee_name: 'Lê Văn An',
      base_salary: 12_000_000,
      status: 'active',
      policy_id: '  pol-uuid-1  ',
    });
    expect(withId.policy_id).toBe('pol-uuid-1');
    const blank = buildInsuranceParticipantApiPayload('main', {
      employee_id: 'emp-uuid-1',
      employee_code: 'LOG-0003',
      employee_name: 'Lê Văn An',
      base_salary: 0,
      status: 'active',
      policy_id: '   ',
    });
    expect(blank).not.toHaveProperty('policy_id');
  });

  it('resolves active policy picker options (0 / match / AMBIG fallback)', () => {
    const rows = [
      {
        id: 'p1',
        policy_code: 'POL-A',
        policy_name: 'BHXH A',
        insurer_key: 'bao_viet',
        status: 'active',
      },
      {
        id: 'p2',
        policy_code: 'POL-B',
        policy_name: 'BHXH B',
        insurer_key: 'bao_viet',
        status: 'active',
      },
      {
        id: 'p3',
        policy_code: 'POL-DRAFT',
        policy_name: 'Draft',
        insurer_key: 'bao_viet',
        status: 'draft',
      },
      {
        id: 'p4',
        policy_code: 'POL-C',
        policy_name: 'Other',
        insurer_key: 'pvi',
        status: 'active',
      },
    ];
    expect(filterActiveInsurancePolicies(rows)).toHaveLength(3);
    expect(resolveInsurancePolicyPickerOptions([], 'bao_viet')).toEqual([]);
    expect(isInsuranceParticipantPolicyBlocked([])).toBe(true);
    const matched = resolveInsurancePolicyPickerOptions(rows, 'bao_viet');
    expect(matched.map((r) => r.id)).toEqual(['p1', 'p2']);
    expect(isInsuranceParticipantPolicyAmbig(matched)).toBe(true);
    const singleInsurer = resolveInsurancePolicyPickerOptions(rows, 'pvi');
    expect(singleInsurer.map((r) => r.id)).toEqual(['p4']);
    expect(isInsuranceParticipantPolicyAmbig(singleInsurer)).toBe(false);
    expect(formatInsurancePolicyPickerLabel(rows[0]!)).toBe('POL-A — BHXH A');
  });
});
