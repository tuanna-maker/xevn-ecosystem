export type ConfigDataType = 'text' | 'number' | 'date' | 'select' | 'phone' | 'email';

export type ConfigScope = 'global' | 'legal_entity';

export type ValidationRules = {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
};

export type ConfigFieldContract = {
  fieldCode: string;
  blockCode: string;
  labelVi: string;
  dataType: ConfigDataType;
  required: boolean;
  readonly: boolean;
  hidden: boolean;
  order: number;
  validationRules?: ValidationRules;
  optionsSource?: {
    categoryCode: string;
    scope: ConfigScope;
  };
};

export type ConfigBlockContract = {
  blockCode: string;
  labelVi: string;
  order: number;
  hidden?: boolean;
};

export type ConfigOptionItem = {
  itemCode: string;
  labelVi: string;
  payloadJson?: Record<string, unknown>;
};

export type ConfigCategory = {
  categoryCode: string;
  scope: ConfigScope;
  legalEntityId?: string;
  items: ConfigOptionItem[];
};

export type ConfigOrigin = {
  tenantId: string;
  moduleCode: string;
  originCode: string;
  originVersion: number;
  status: 'draft' | 'published';
  blocks: ConfigBlockContract[];
  fields: ConfigFieldContract[];
};

export type ConfigVariant = {
  id: string;
  tenantId: string;
  moduleCode: string;
  originCode: string;
  legalEntityId: string;
  variantVersion: number;
  status: 'draft' | 'published';
  diffJson: {
    blocks?: Partial<ConfigBlockContract>[];
    fields?: Partial<ConfigFieldContract>[];
  };
};

export type EffectiveConfig = {
  tenantId: string;
  moduleCode: string;
  originCode: string;
  legalEntityId: string;
  effectiveVersion: {
    originVersion: number;
    variantVersion?: number;
  };
  blocks: ConfigBlockContract[];
  fields: ConfigFieldContract[];
  options: ConfigCategory[];
  etag: string;
  effectiveAt: string;
};

export type FieldValidationError = {
  fieldCode: string;
  errorCode: string;
  messageVi: string;
  meta?: Record<string, unknown>;
};
