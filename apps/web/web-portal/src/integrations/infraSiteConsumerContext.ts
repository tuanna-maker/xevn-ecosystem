/**
 * Infra site detail consumer — wizard modal and Điểm hạ tầng form share this read path (R-QA-FCAT-01).
 */
import type { InfrastructureFoundationCategory } from '../data/infrastructure-foundation-catalog';
import {
  isFoundationCategoryDisplayable,
  mergeFoundationCategoryIntoList,
} from '../pages/command-center/foundationCategoryList';
import {
  countVisibleMetadataFieldDefs,
  resolveMetadataBlockTitleOverrides,
  resolveMetadataCustomBlocks,
  resolveMetadataFieldDefs,
  type MetadataCustomBlockDef,
  type MetadataFieldDef,
} from './metadataConsumerResolver';

/** Merge in-flight wizard draft into saved categories for scope-aware resolver reads. */
export function buildEffectiveInfraFoundationCategories(
  saved: InfrastructureFoundationCategory[],
  draft: InfrastructureFoundationCategory | null,
  wizardOpen: boolean,
): InfrastructureFoundationCategory[] {
  if (!wizardOpen || !draft || !isFoundationCategoryDisplayable(draft)) {
    return saved;
  }
  return mergeFoundationCategoryIntoList(saved, draft);
}

export function resolveInfraSiteConsumerFieldDefs<T extends MetadataFieldDef>(
  operatingEntityId: string,
  foundationCategories: InfrastructureFoundationCategory[],
  defsByEntity: Record<string, T[] | undefined>,
): T[] {
  const entityId = operatingEntityId.trim();
  if (!entityId) return [];
  return resolveMetadataFieldDefs(
    {
      pipeline: 'infra',
      entityId,
      foundationCategories,
    },
    defsByEntity,
  );
}

export function resolveInfraSiteConsumerCustomBlocks(
  operatingEntityId: string,
  foundationCategories: InfrastructureFoundationCategory[],
  blocksByEntity: Record<string, MetadataCustomBlockDef[] | undefined>,
): MetadataCustomBlockDef[] {
  const entityId = operatingEntityId.trim();
  if (!entityId) return [];
  return resolveMetadataCustomBlocks(
    {
      pipeline: 'infra',
      entityId,
      foundationCategories,
    },
    blocksByEntity,
  );
}

export function resolveInfraSiteConsumerBlockTitleOverrides(
  operatingEntityId: string,
  foundationCategories: InfrastructureFoundationCategory[],
  byEntity: Record<string, Record<string, string> | undefined>,
): Record<string, string> {
  const entityId = operatingEntityId.trim();
  if (!entityId) return {};
  return resolveMetadataBlockTitleOverrides(
    {
      pipeline: 'infra',
      entityId,
      foundationCategories,
    },
    byEntity,
  );
}

export function countInfraSiteVisibleCustomFields(
  operatingEntityId: string,
  foundationCategories: InfrastructureFoundationCategory[],
  defsByEntity: Record<string, MetadataFieldDef[] | undefined>,
): number {
  const entityId = operatingEntityId.trim();
  if (!entityId) return 0;
  return countVisibleMetadataFieldDefs(
    {
      pipeline: 'infra',
      entityId,
      foundationCategories,
    },
    defsByEntity,
  );
}

/** Pick default operating entity for new site form (post-wizard / tab 2). */
export function resolveDefaultInfraSiteOperatingEntityId(
  foundationCategories: InfrastructureFoundationCategory[],
  preferredEntityId?: string | null,
): string {
  const displayable = foundationCategories.filter(
    (c) => isFoundationCategoryDisplayable(c) && c.appliesToCompanyIds.length > 0,
  );
  const preferred = preferredEntityId?.trim();
  if (preferred) {
    for (const cat of displayable) {
      if (cat.appliesToCompanyIds.includes(preferred)) return preferred;
    }
  }
  for (const cat of displayable) {
    const first = cat.appliesToCompanyIds[0]?.trim();
    if (first) return first;
  }
  return '';
}
