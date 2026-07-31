/**
 * @CODE-MEMORY
 * Screen:     HRM status machines (insurance / leave / performance / recruitment)
 * UC:         FR-HRM-CONSTRAINT-E3-01 · AC-E3-SM-01
 * BR:         Illegal reverse transitions → HRM-SM-001
 * SRS:        docs/hrm · E3 insurance / leave SM
 * TechSpec:   DB_DESIGN_HRM_ERP_E3 §2.2
 * Purpose:    Khóa chuyển trạng thái theo domain; chặn nhánh SM bất hợp lệ.
 * WorkItem:   DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-01 (compile dep restore)
 * Coded:      2026-07-31
 * Callers:    contracts-insurance.service · leave-requests.service · performance.service
 * Callees:    ApiException
 * FEActions:  n/a (BE guard)
 * BEChain:    service mutate → assertStatusTransition → DB update
 * Impact:     Thiếu file → Nest/jest fail; SM không enforce
 * must_keep:  ALLOWED map per domain; HRM-SM-001 code
 * SOLID:      Pure helper tách khỏi service SQL
 * LastVerified: contracts-insurance jest
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api.exception';

export const HRM_SM_001 = 'HRM-SM-001';

export type StatusTransitionDomain =
  | 'performance_cycle'
  | 'performance_evaluation'
  | 'insurance_policy'
  | 'insurance_record'
  | 'leave'
  | 'recruitment';

export type AssertStatusTransitionInput = {
  domain: StatusTransitionDomain;
  from: string;
  to: string;
  entityId?: string;
};

const DOMAIN_ERROR: Record<StatusTransitionDomain, string> = {
  performance_cycle: 'HRM-PERF-SM',
  performance_evaluation: 'HRM-PERF-SM',
  insurance_policy: 'HRM-INS-SM',
  insurance_record: 'HRM-INS-SM',
  leave: 'HRM-LEAVE-SM',
  recruitment: 'HRM-REC-SM',
};

const ALLOWED: Record<StatusTransitionDomain, Record<string, string[]>> = {
  performance_cycle: {
    draft: ['draft', 'active', 'closed'],
    active: ['active', 'closed'],
    closed: ['closed'],
  },
  performance_evaluation: {
    draft: ['draft', 'submitted'],
    submitted: ['submitted', 'approved'],
    approved: ['approved', 'completed'],
    completed: ['completed'],
  },
  insurance_policy: {
    draft: ['draft', 'active', 'cancelled'],
    active: ['active', 'expired', 'cancelled'],
    expired: ['expired'],
    cancelled: ['cancelled'],
  },
  insurance_record: {
    active: ['active', 'expired', 'cancelled'],
    expired: ['expired'],
    cancelled: ['cancelled'],
  },
  leave: {
    pending: ['pending', 'approved', 'rejected', 'cancelled'],
    approved: ['approved'],
    rejected: ['rejected'],
    cancelled: ['cancelled'],
  },
  recruitment: {
    applied: ['applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'],
    screening: ['screening', 'interview', 'offer', 'rejected', 'withdrawn'],
    interview: ['interview', 'offer', 'hired', 'rejected', 'withdrawn'],
    offer: ['offer', 'hired', 'rejected', 'withdrawn'],
    hired: ['hired'],
    rejected: ['rejected'],
    withdrawn: ['withdrawn'],
  },
};

export function assertStatusTransition(input: AssertStatusTransitionInput): void {
  const from = String(input.from ?? '')
    .trim()
    .toLowerCase();
  const to = String(input.to ?? '')
    .trim()
    .toLowerCase();
  if (!from || !to) {
    throw new ApiException(
      HRM_SM_001,
      `Illegal status transition (${input.domain}): empty from/to`,
      HttpStatus.BAD_REQUEST,
    );
  }
  if (from === to) return;
  const map = ALLOWED[input.domain];
  const allowedNext = map[from];
  if (!allowedNext || !allowedNext.includes(to)) {
    const domainCode = DOMAIN_ERROR[input.domain];
    const hint = domainCode ? ` [${domainCode}]` : '';
    throw new ApiException(
      HRM_SM_001,
      `Illegal status transition (${input.domain}): ${from} → ${to}${hint}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
