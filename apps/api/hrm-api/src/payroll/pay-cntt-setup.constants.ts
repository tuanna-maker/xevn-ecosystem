/** Error codes — PO-HRM-PAY-CNTT-API-01 §9 */
export const HRM_PAY_POL_409_CODE = 'HRM-PAY-POL-409-CODE';
export const HRM_PAY_POL_400_DATE = 'HRM-PAY-POL-400-DATE';
export const HRM_PAY_INP_PROF_409_CODE = 'HRM-PAY-INP-PROF-409-CODE';
export const HRM_PAY_SETUP_404_PACK = 'HRM-PAY-SETUP-404-PACK';
export const HRM_PAY_INP_PROFILE_422 = 'HRM-PAY-INP-PROFILE-422';

export const PAY_POLICY_PACK_SCOPES = ['CHUNG', 'RIENG'] as const;
export const PAY_POLICY_PACK_STATUSES = ['draft', 'active', 'retired'] as const;
export const PAY_INPUT_PROFILE_STATUSES = [
  'draft',
  'active',
  'retired',
] as const;

/** Open slug — same family as pay sheet template codes. */
export const PAY_CNTT_CODE_FORMAT = /^[a-z0-9][a-z0-9_-]{0,63}$/;

export type PayPolicyPackScope = (typeof PAY_POLICY_PACK_SCOPES)[number];
export type PayPolicyPackStatus = (typeof PAY_POLICY_PACK_STATUSES)[number];
export type PayInputProfileStatus = (typeof PAY_INPUT_PROFILE_STATUSES)[number];

export type PaySetupContextSnapshot = {
  policyPackId?: string;
  policyPackCode?: string;
  policyPackVersionAt?: string;
  policyPackRateParams?: Record<string, unknown>;
  inputPackProfileId?: string;
  inputPackProfileCode?: string;
  inputPackProfileVersionAt?: string;
  allowedSourceKinds?: string[];
  requiredComponentCodes?: string[];
};
