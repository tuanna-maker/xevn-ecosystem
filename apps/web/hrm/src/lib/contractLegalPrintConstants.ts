/**
 * @CODE-MEMORY
 * Screen:     Settings HĐ / form HĐ — labels gói nghề + nhóm điều khoản
 * UC:         FR-UC-BP-CORE-09a · 09b · 09d
 * BR:         BR-CTR-CL-03 — cấm hardcode body luật; chỉ mã/nhãn UI
 * SRS:        docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md §B–C
 * TechSpec:   docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md §3
 * Purpose:    Catalog mã pack/clause_group cho picker — không chứa body_vi.
 * WorkItem:   PO-HRM-CONTRACT-LEGAL-PRINT-FE-01
 * Coded:      2026-08-06
 * must_keep:  Không paste DOC UNICOM; body chỉ từ API library
 * SOLID:      Constants-only; UI/API bind display-ready từ BE
 * LastVerified: docs/qa/evidence/po-hrm-contract-legal-print-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-01
 * change_mode: EXPAND
 * What: Re-export open-catalog helpers; cấm hardcode 8-only picker (DYNAMIC LOCK)
 * Why: CORR-01 AC-CTR-XEVN-11 · BE-01 READY_FOR_QA
 * must_keep: pack/clause_group labels; printable=false; UF-HRM-02 · Q-CTR
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-09A-CLUSTER-FE-01
 * What: ADD CONTRACT_CLAUSE_STATUS_LABELS (Nháp / Hiệu lực / Ngừng dùng) — FE map O11
 * Why: API-01 display-ready residual · UC-BP-CORE-09a
 * must_keep: printable=false · no body hardcode · pack/group labels
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-09B-CLUSTER-FE-01
 * What: RETAIN pack VI labels GENERAL/IT_OFFICE/DRIVER (+ LOGISTICS optional)
 * Why: UC-BP-CORE-09b MVP pack picker · AC-CORE-09B-01
 * must_keep: printable=false · no body hardcode
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-09C-CLUSTER-FE-01
 * What: RETAIN CONTRACTS_PRINTABLE_READY=false — VER/PDF fidelity ≠ printable UAT flip
 * Why: UC-BP-CORE-09c honesty · O10 · DENY contracts_printable_ready=true
 * must_keep: printable=false · no body hardcode · CORE-09b seals
 */

export {
  CONTRACT_MATRIX_FAMILIES,
  CONTRACT_MATRIX_FAMILY_LABELS,
  CONTRACT_NUMBER_PATTERN_DEFAULT,
  CONTRACT_SETTING_NUMBER_PATTERN,
  CONTRACT_SETTING_ORG_SUFFIX,
  CONTRACT_TERM_TYPE_LABELS,
  CONTRACT_TERM_TYPES,
  XEVN_STARTER_TEMPLATE_CODES,
  isValidTemplateCodeFormat,
  isXevnStarterTemplateCode,
  missingStarterTemplateCodes,
  normalizeTemplateCode,
} from '@/lib/contractTemplateCatalog';
export type {
  ContractMatrixFamily,
  ContractTermType,
  XevnStarterTemplateCode,
} from '@/lib/contractTemplateCatalog';


export const CONTRACT_PACK_CODES = ['GENERAL', 'IT_OFFICE', 'DRIVER', 'LOGISTICS'] as const;
export type ContractPackCode = (typeof CONTRACT_PACK_CODES)[number];

export const CONTRACT_PACK_LABELS: Record<ContractPackCode, string> = {
  GENERAL: 'Chung',
  IT_OFFICE: 'IT / văn phòng',
  DRIVER: 'Lái xe',
  LOGISTICS: 'Logistics',
};

/** SPEC §B.3 + UNICOM LEGAL_BASIS — labels only. */
export const CONTRACT_CLAUSE_GROUPS = [
  'LEGAL_BASIS',
  'PARTIES',
  'JOB_DUTIES',
  'TERM_PROBATION',
  'COMPENSATION',
  'GRADE_RAISE',
  'WORKING_HOURS',
  'PPE',
  'SOCIAL_INSURANCE',
  'TRAINING',
  'NDA_TRADE_SECRET',
  'IP_WORK_PRODUCT',
  'IT_EQUIPMENT',
  'DRIVER_VEHICLE',
  'DRIVER_SAFETY_ALCOHOL',
  'DRIVER_LIABILITY',
  'TERMINATION_GENERAL',
  'DISPUTE_LAW',
] as const;

export type ContractClauseGroup = (typeof CONTRACT_CLAUSE_GROUPS)[number];

export const CONTRACT_CLAUSE_GROUP_LABELS: Record<string, string> = {
  LEGAL_BASIS: 'Căn cứ pháp lý',
  PARTIES: 'Bên A / Bên B',
  JOB_DUTIES: 'Công việc / nghĩa vụ',
  TERM_PROBATION: 'Thời hạn / thử việc',
  COMPENSATION: 'Lương / đãi ngộ',
  GRADE_RAISE: 'Nâng bậc / nâng lương',
  WORKING_HOURS: 'Thời giờ làm việc',
  PPE: 'Bảo hộ lao động',
  SOCIAL_INSURANCE: 'BHXH / BHYT / BHTN',
  TRAINING: 'Đào tạo',
  NDA_TRADE_SECRET: 'Bảo mật',
  IP_WORK_PRODUCT: 'Sở hữu trí tuệ',
  IT_EQUIPMENT: 'Thiết bị CNTT',
  DRIVER_VEHICLE: 'Phương tiện / GPLX',
  DRIVER_SAFETY_ALCOHOL: 'An toàn / cấm rượu bia',
  DRIVER_LIABILITY: 'Trách nhiệm TNGT',
  TERMINATION_GENERAL: 'Chấm dứt HĐ',
  DISPUTE_LAW: 'Giải quyết tranh chấp',
};

export const CONTRACT_CLAUSE_STATUSES = ['draft', 'active', 'retired'] as const;
export type ContractClauseStatus = (typeof CONTRACT_CLAUSE_STATUSES)[number];

/** Display-ready VI — FE map OK (API-01 O11 residual); DENY second body SoT. */
export const CONTRACT_CLAUSE_STATUS_LABELS: Record<ContractClauseStatus, string> = {
  draft: 'Nháp',
  active: 'Hiệu lực',
  retired: 'Ngừng dùng',
};

/** Honesty — program flag; FE must not claim printable UAT. */
export const CONTRACTS_PRINTABLE_READY = false;
