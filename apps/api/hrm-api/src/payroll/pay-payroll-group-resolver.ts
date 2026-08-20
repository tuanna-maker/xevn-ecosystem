import {
  PAY_GROUP_MATCH_SOURCES,
  type PayPayrollGroupMatchSource,
} from './pay-payroll-group.constants';

export type PayPayrollGroupMatchRule = {
  department_ids?: string[];
  position_keys?: string[];
  employee_ids?: string[];
};

export type PayPayrollGroupCatalogRow = {
  id: string;
  company_id: string;
  code: string;
  name_vi: string;
  priority: number;
  match_rule_json: PayPayrollGroupMatchRule;
  status: string;
};

export type EmployeePayrollGroupAttrs = {
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department_id: string | null;
  position_key: string | null;
};

export function parsePayPayrollGroupMatchRule(
  raw: unknown,
): PayPayrollGroupMatchRule {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('INVALID_MATCH_RULE');
  }
  const obj = raw as Record<string, unknown>;
  const rule: PayPayrollGroupMatchRule = {};
  if (obj.department_ids != null) {
    if (
      !Array.isArray(obj.department_ids) ||
      obj.department_ids.some((v) => typeof v !== 'string')
    ) {
      throw new Error('INVALID_MATCH_RULE');
    }
    rule.department_ids = obj.department_ids
      .map((v) => String(v).trim())
      .filter(Boolean);
  }
  if (obj.position_keys != null) {
    if (
      !Array.isArray(obj.position_keys) ||
      obj.position_keys.some((v) => typeof v !== 'string')
    ) {
      throw new Error('INVALID_MATCH_RULE');
    }
    rule.position_keys = obj.position_keys
      .map((v) => String(v).trim())
      .filter(Boolean);
  }
  if (obj.employee_ids != null) {
    if (
      !Array.isArray(obj.employee_ids) ||
      obj.employee_ids.some((v) => typeof v !== 'string')
    ) {
      throw new Error('INVALID_MATCH_RULE');
    }
    rule.employee_ids = obj.employee_ids
      .map((v) => String(v).trim())
      .filter(Boolean);
  }
  return rule;
}

export function employeeMatchesPayrollGroupRule(
  attrs: EmployeePayrollGroupAttrs,
  rule: PayPayrollGroupMatchRule,
): { match: boolean; match_source?: PayPayrollGroupMatchSource } {
  const employeeIds = rule.employee_ids ?? [];
  if (employeeIds.includes(attrs.employee_id)) {
    return { match: true, match_source: 'explicit_list' };
  }
  const deptIds = rule.department_ids ?? [];
  if (attrs.department_id && deptIds.includes(attrs.department_id)) {
    return { match: true, match_source: 'department' };
  }
  const positionKeys = rule.position_keys ?? [];
  if (attrs.position_key && positionKeys.includes(attrs.position_key)) {
    return { match: true, match_source: 'position' };
  }
  return { match: false };
}

export function resolvePayrollGroupWinner(
  groups: PayPayrollGroupCatalogRow[],
  attrs: EmployeePayrollGroupAttrs,
): {
  winner_id: string | null;
  ambiguous: boolean;
  group_ids?: string[];
  match_source?: PayPayrollGroupMatchSource;
} {
  const matched: Array<{
    id: string;
    priority: number;
    match_source: PayPayrollGroupMatchSource;
  }> = [];
  for (const group of groups) {
    const rule = group.match_rule_json ?? {};
    const hit = employeeMatchesPayrollGroupRule(attrs, rule);
    if (hit.match && hit.match_source) {
      matched.push({
        id: group.id,
        priority: group.priority,
        match_source: hit.match_source,
      });
    }
  }
  if (matched.length === 0) {
    return { winner_id: null, ambiguous: false };
  }
  const maxPriority = Math.max(...matched.map((m) => m.priority));
  const top = matched.filter((m) => m.priority === maxPriority);
  if (top.length > 1) {
    return {
      winner_id: null,
      ambiguous: true,
      group_ids: top.map((t) => t.id),
    };
  }
  return {
    winner_id: top[0].id,
    ambiguous: false,
    match_source: top[0].match_source,
  };
}

export function assertPayGroupMatchSource(
  value: string,
): PayPayrollGroupMatchSource {
  if ((PAY_GROUP_MATCH_SOURCES as readonly string[]).includes(value)) {
    return value as PayPayrollGroupMatchSource;
  }
  throw new Error('INVALID_MATCH_SOURCE');
}
