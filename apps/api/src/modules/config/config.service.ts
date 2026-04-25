import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CONFIG_CATEGORY_ITEMS, CONFIG_ORIGINS, CONFIG_VARIANTS } from './config.seed';
import {
  ConfigDataType,
  ConfigFieldContract,
  ConfigOrigin,
  ConfigVariant,
  EffectiveConfig,
  FieldValidationError,
  ConfigBlockContract,
} from './config.types';

@Injectable()
export class ConfigService {
  private readonly origins = new Map<string, ConfigOrigin>();
  private readonly variants = new Map<string, ConfigVariant>();

  constructor() {
    CONFIG_ORIGINS.forEach((origin) => this.origins.set(origin.originCode, origin));
    CONFIG_VARIANTS.forEach((variant) => {
      this.variants.set(this.variantKey(variant.originCode, variant.legalEntityId), variant);
    });
  }

  upsertOrigin(payload: {
    tenantId: string;
    moduleCode: string;
    originCode: string;
    blocks: ConfigBlockContract[];
    fields: ConfigFieldContract[];
  }): ConfigOrigin {
    this.assertUniqueFieldCodes(payload.fields);
    const existing = this.origins.get(payload.originCode);
    const next: ConfigOrigin = {
      tenantId: payload.tenantId,
      moduleCode: payload.moduleCode,
      originCode: payload.originCode,
      ownerLayer: existing?.ownerLayer ?? 'module',
      originVersion: existing ? existing.originVersion + 1 : 1,
      status: 'draft',
      blocks: payload.blocks,
      fields: payload.fields,
    };
    this.origins.set(next.originCode, next);
    return next;
  }

  publishOrigin(originCode: string): ConfigOrigin {
    const origin = this.origins.get(originCode);
    if (!origin) throw new NotFoundException(`Origin ${originCode} không tồn tại.`);
    const next: ConfigOrigin = {
      ...origin,
      status: 'published',
    };
    this.origins.set(originCode, next);
    return next;
  }

  upsertVariant(payload: {
    tenantId: string;
    moduleCode: string;
    originCode: string;
    legalEntityId: string;
    diffJson: ConfigVariant['diffJson'];
  }): ConfigVariant {
    const origin = this.origins.get(payload.originCode);
    if (!origin) throw new NotFoundException(`Origin ${payload.originCode} không tồn tại.`);
    const fieldCodes = new Set(origin.fields.map((field) => field.fieldCode));
    (payload.diffJson.fields ?? []).forEach((field) => {
      if (typeof field.fieldCode !== 'string' || !fieldCodes.has(field.fieldCode)) {
        throw new BadRequestException({
          fieldCode: field.fieldCode ?? 'unknown',
          errorCode: 'FIELD_NOT_ALLOWED',
          messageVi: `Field ${field.fieldCode} không thuộc origin ${payload.originCode}.`,
        });
      }
    });

    const key = this.variantKey(payload.originCode, payload.legalEntityId);
    const existing = this.variants.get(key);
    const next: ConfigVariant = {
      id: existing?.id ?? `var-${payload.originCode}-${payload.legalEntityId}`,
      tenantId: payload.tenantId,
      moduleCode: payload.moduleCode,
      originCode: payload.originCode,
      ownerLayer: existing?.ownerLayer ?? 'module',
      legalEntityId: payload.legalEntityId,
      variantVersion: existing ? existing.variantVersion + 1 : 1,
      status: 'draft',
      diffJson: payload.diffJson,
    };
    this.variants.set(key, next);
    return next;
  }

  publishVariant(variantId: string): ConfigVariant {
    const match = [...this.variants.values()].find((variant) => variant.id === variantId);
    if (!match) throw new NotFoundException(`Variant ${variantId} không tồn tại.`);
    const next: ConfigVariant = {
      ...match,
      status: 'published',
    };
    this.variants.set(this.variantKey(next.originCode, next.legalEntityId), next);
    return next;
  }

  getEffectiveConfig(input: {
    tenantId: string;
    moduleCode: string;
    originCode: string;
    legalEntityId?: string;
  }): EffectiveConfig {
    const origin = this.origins.get(input.originCode);
    if (!origin || origin.moduleCode !== input.moduleCode) {
      throw new NotFoundException(`Không tìm thấy effective config cho ${input.moduleCode}/${input.originCode}.`);
    }
    const variant =
      input.legalEntityId != null
        ? this.variants.get(this.variantKey(input.originCode, input.legalEntityId))
        : undefined;
    const publishedVariant = variant?.status === 'published' ? variant : undefined;
    const blockOverrides = new Map(
      (publishedVariant?.diffJson.blocks ?? [])
        .filter((block): block is Partial<ConfigBlockContract> & { blockCode: string } => typeof block.blockCode === 'string')
        .map((block) => [block.blockCode, block]),
    );
    const fieldOverrides = new Map(
      (publishedVariant?.diffJson.fields ?? [])
        .filter((field): field is Partial<ConfigFieldContract> & { fieldCode: string } => typeof field.fieldCode === 'string')
        .map((field) => [field.fieldCode, field]),
    );
    const blocks = origin.blocks
      .map((block) => ({
        ...block,
        ...blockOverrides.get(block.blockCode),
      }))
      .sort((a, b) => a.order - b.order);
    const fields = origin.fields
      .map((field) => {
        const override = fieldOverrides.get(field.fieldCode);
        const merged: ConfigFieldContract = {
          ...field,
          ...override,
          validationRules: {
            ...(field.validationRules ?? {}),
            ...(override?.validationRules ?? {}),
          },
          optionsSource: override?.optionsSource ?? field.optionsSource,
        };
        if (merged.hidden) {
          merged.required = false;
        }
        return merged;
      })
      .sort((a, b) => a.order - b.order);
    const categoryCodes = Array.from(
      new Set(fields.map((field) => field.optionsSource?.categoryCode).filter(Boolean) as string[]),
    );
    const options = categoryCodes.map((categoryCode) => ({
      categoryCode,
      scope: 'global' as const,
      items: CONFIG_CATEGORY_ITEMS.filter((category) => {
        if (category.categoryCode !== categoryCode) return false;
        if (category.scope === 'global') return true;
        return category.legalEntityId === input.legalEntityId;
      }).flatMap((category) => category.items),
    }));

    return {
      tenantId: input.tenantId,
      moduleCode: input.moduleCode,
      originCode: input.originCode,
      legalEntityId: input.legalEntityId ?? 'global',
      effectiveVersion: {
        originVersion: origin.originVersion,
        variantVersion: publishedVariant?.variantVersion,
      },
      etag: `${origin.originCode}:${origin.originVersion}:${publishedVariant?.variantVersion ?? 0}`,
      blocks,
      fields,
      options,
      effectiveAt: new Date().toISOString(),
    };
  }

  validatePayload(fields: ConfigFieldContract[], values: Record<string, unknown>): FieldValidationError[] {
    const errors: FieldValidationError[] = [];
    fields
      .filter((field) => !field.hidden)
      .forEach((field) => {
        const value = values[field.fieldCode];
        const normalized = value == null ? '' : String(value).trim();
        if (field.required && normalized.length === 0) {
          errors.push({
            fieldCode: field.fieldCode,
            errorCode: 'REQUIRED',
            messageVi: `${field.labelVi} là bắt buộc.`,
          });
          return;
        }
        if (normalized.length === 0) return;
        this.validateType(field, normalized, errors);
        const pattern = field.validationRules?.pattern;
        if (typeof pattern === 'string' && !new RegExp(pattern).test(normalized)) {
          errors.push({
            fieldCode: field.fieldCode,
            errorCode: 'PATTERN_MISMATCH',
            messageVi: `${field.labelVi} không đúng định dạng.`,
            meta: { pattern },
          });
        }
      });
    return errors;
  }

  private validateType(field: ConfigFieldContract, value: string, errors: FieldValidationError[]) {
    const validators: Partial<Record<ConfigDataType, (value: string) => boolean>> = {
      number: (v) => Number.isFinite(Number(v)),
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      phone: (v) => /^[0-9+\-().\s]{8,20}$/.test(v),
      date: (v) => !Number.isNaN(Date.parse(v)),
    };
    const validator = validators[field.dataType];
    if (validator && !validator(value)) {
      errors.push({
        fieldCode: field.fieldCode,
        errorCode: 'CONTRACT_TYPE_MISMATCH',
        messageVi: `${field.labelVi} phải đúng kiểu ${field.dataType}.`,
      });
    }
  }

  private assertUniqueFieldCodes(fields: ConfigFieldContract[]) {
    const seen = new Set<string>();
    fields.forEach((field) => {
      if (seen.has(field.fieldCode)) {
        throw new BadRequestException({
          fieldCode: field.fieldCode,
          errorCode: 'DUPLICATE_FIELD_CODE',
          messageVi: `fieldCode ${field.fieldCode} bị trùng trong origin.`,
        });
      }
      seen.add(field.fieldCode);
    });
  }

  private variantKey(originCode: string, legalEntityId: string): string {
    return `${originCode}::${legalEntityId}`;
  }
}
