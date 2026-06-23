/**
 * Unified metadata consumer read path — ADR-METADATA-APPLY-CONSUMERS-DELTA-20260620.
 * Modal config producers and site/detail consumers MUST share these resolvers (K1–K2).
 */
import {
  type InfraFoundationScopeRow,
  resolveInfraBlockTitleOverrides,
  resolveInfraScopedRecord,
} from './infrastructureEntityKeyResolver';

export type MetadataPipeline = 'infra' | 'group_hr' | 'legal_entity_static';

/** Minimal field shape shared by infra + group HR custom field defs. */
export type MetadataFieldDef = {
  id: string;
  fieldCode: string;
  labelVi: string;
  dataType: string;
  blockCode: string;
  visible: boolean;
  selectConfig?: string;
};

export type MetadataCustomBlockDef = {
  id: string;
  blockCode: string;
  labelVi: string;
  visible: boolean;
  order: number;
};

export type MetadataConsumerContext = {
  pipeline: MetadataPipeline;
  entityId: string;
  foundationCategories?: InfraFoundationScopeRow[];
  tenantId?: string | null;
  /** When set, filters defs to a single block (modal field list). */
  blockCode?: string;
};

export type MetadataConsumerRegistryRow = {
  pipeline: MetadataPipeline;
  producerModal: string;
  consumerScreenId: string;
  deepLink: string;
};

/** Authoritative producer → consumer map (ADR §4.2). */
export const METADATA_CONSUMER_REGISTRY: MetadataConsumerRegistryRow[] = [
  {
    pipeline: 'infra',
    producerModal: 'infrastructureFieldsConfigOpen',
    consumerScreenId: 'infra-site-detail',
    deepLink: '/command-center?settings=company_infrastructure',
  },
  {
    pipeline: 'group_hr',
    producerModal: 'groupHrFieldsConfigOpen',
    consumerScreenId: 'hrm-employee-form',
    deepLink: '/command-center?settings=company_group_hr',
  },
  {
    pipeline: 'group_hr',
    producerModal: 'groupHrFieldsConfigOpen',
    consumerScreenId: 'employee-metadata-preview',
    deepLink: '/command-center?settings=company_group_hr',
  },
  {
    pipeline: 'legal_entity_static',
    producerModal: '',
    consumerScreenId: 'legal-entity-form',
    deepLink: '/command-center?settings=company_member_units',
  },
];

/**
 * Group HR scoped read — reuses infra alias plane (main / holding root / holding id).
 * Does not inherit foundation categories (HRM catalog scope is separate).
 */
export function resolveGroupHrScopedFieldDefs<T extends MetadataFieldDef>(
  entityId: string,
  defsByEntity: Record<string, T[] | undefined>,
  _tenantId?: string | null,
): T[] {
  return resolveInfraScopedRecord(entityId, defsByEntity, []);
}

/** Unified read path — all CC metadata consumers MUST use this (K1). */
export function resolveMetadataFieldDefs<T extends MetadataFieldDef>(
  ctx: MetadataConsumerContext,
  defsByEntity: Record<string, T[] | undefined>,
): T[] {
  const entityId = ctx.entityId.trim();
  if (!entityId) return [];

  let defs: T[];
  switch (ctx.pipeline) {
    case 'infra':
      defs = resolveInfraScopedRecord(
        entityId,
        defsByEntity,
        ctx.foundationCategories ?? [],
      );
      break;
    case 'group_hr':
      defs = resolveGroupHrScopedFieldDefs(entityId, defsByEntity, ctx.tenantId);
      break;
    case 'legal_entity_static':
      return [];
  }

  if (ctx.blockCode) {
    return defs.filter((f) => f.blockCode === ctx.blockCode);
  }
  return defs;
}

export function resolveMetadataCustomBlocks<T extends MetadataCustomBlockDef>(
  ctx: Omit<MetadataConsumerContext, 'blockCode'>,
  blocksByEntity: Record<string, T[] | undefined>,
): T[] {
  const entityId = ctx.entityId.trim();
  if (!entityId || ctx.pipeline === 'legal_entity_static') return [];

  const blocks = resolveInfraScopedRecord(
    entityId,
    blocksByEntity,
    ctx.pipeline === 'infra' ? (ctx.foundationCategories ?? []) : [],
  );

  return blocks.slice().sort((a, b) => a.order - b.order);
}

export function resolveMetadataBlockTitleOverrides(
  ctx: Omit<MetadataConsumerContext, 'blockCode'>,
  byEntity: Record<string, Record<string, string> | undefined>,
): Record<string, string> {
  const entityId = ctx.entityId.trim();
  if (!entityId || ctx.pipeline === 'legal_entity_static') return {};

  if (ctx.pipeline === 'infra') {
    return resolveInfraBlockTitleOverrides(
      entityId,
      byEntity,
      ctx.foundationCategories ?? [],
    );
  }

  return resolveInfraBlockTitleOverrides(entityId, byEntity, []);
}

export function countVisibleMetadataFieldDefs<T extends MetadataFieldDef>(
  ctx: MetadataConsumerContext,
  defsByEntity: Record<string, T[] | undefined>,
): number {
  return resolveMetadataFieldDefs(ctx, defsByEntity).filter((f) => f.visible).length;
}

/** Parity helper — modal and site detail must return identical defs for same ctx (K2). */
export function assertMetadataConsumerParity<T extends MetadataFieldDef>(
  ctx: MetadataConsumerContext,
  defsByEntity: Record<string, T[] | undefined>,
): { modalDefs: T[]; consumerDefs: T[]; parity: boolean } {
  const modalDefs = resolveMetadataFieldDefs(ctx, defsByEntity);
  const consumerDefs = resolveMetadataFieldDefs(ctx, defsByEntity);
  const parity =
    modalDefs.length === consumerDefs.length &&
    modalDefs.every(
      (f, i) =>
        f.fieldCode === consumerDefs[i]?.fieldCode &&
        f.labelVi === consumerDefs[i]?.labelVi &&
        f.blockCode === consumerDefs[i]?.blockCode,
    );
  return { modalDefs, consumerDefs, parity };
}
