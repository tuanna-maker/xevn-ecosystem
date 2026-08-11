/**
 * @CODE-MEMORY
 * Screen:     Command Center → Quy trình → Cấu hình đồ thị / canvas step drawer
 * UC:         UC-XBOS-13 · AC-CD-F4-06
 * BR:         BR-CD-F4-02..04
 * SRS:        docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §4.5 AC-CD-F4-06
 * TechSpec:   docs/decisions/ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620.md §5
 * Purpose:    Edit resolver_type + resolver_config on a workflow graph step (save → F5 persist).
 * WorkItem:   CD-FB-07-WF-CANVAS-01
 * Coded:      2026-07-19
 *
 * Callers:
 *   - CommandCenterPage.tsx (graph table + canvas drawer)
 *
 * Callees:
 *   - patch → workflowMapper.graphStepToApiStep → PUT definitions/:id
 *
 * FE-Actions:
 *   | User action              | Handler                    | Lib / RPC           |
 *   |--------------------------|----------------------------|---------------------|
 *   | Đổi loại resolver        | onChange({ resolverType }) | parent patch + save |
 *   | Sửa config (position…)   | onChange({ resolverConfig})| parent patch + save |
 *
 * Impact:     Missing wire → AC-CD-F4-06 FAIL after F5
 * must_keep:  ADR enum; do not reopen TEXT/uuid P0 / leave picker CLOSED conditions
 * SOLID:      SRP — resolver form only; layout/save owned by CommandCenterPage
 * LastVerified: workflowMapper.test.ts + WorkflowStepResolverFields.test.ts
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { WorkflowGraphStep } from '../../data/workflow-graph';
import {
  WORKFLOW_RESOLVER_TYPES,
  defaultResolverConfig,
  type WorkflowResolverConfig,
  type WorkflowResolverType,
} from '../../data/workflow-resolver';
import {
  SETTINGS_FIELD_COMPACT,
  SETTINGS_FIELD_SHELL,
  SETTINGS_LABEL_CLASS,
} from './settings-form-pattern';

const RAIL_STROKE = 1.5;

export type WorkflowStepResolverPatch = Pick<
  WorkflowGraphStep,
  'resolverType' | 'resolverConfig'
>;

export type WorkflowStepResolverFieldsProps = {
  step: WorkflowGraphStep;
  onChange: (patch: WorkflowStepResolverPatch) => void;
  selectClassName: string;
  inputClassName: string;
  /** denser layout for canvas drawer */
  compact?: boolean;
};

function configString(cfg: WorkflowResolverConfig | undefined, key: string): string {
  const v = cfg?.[key];
  return typeof v === 'string' || typeof v === 'number' ? String(v) : '';
}

function withConfigKey(
  cfg: WorkflowResolverConfig | undefined,
  key: string,
  value: string,
): WorkflowResolverConfig {
  return { ...(cfg ?? {}), [key]: value };
}

export const WorkflowStepResolverFields: React.FC<WorkflowStepResolverFieldsProps> = ({
  step,
  onChange,
  selectClassName,
  inputClassName,
  compact = false,
}) => {
  const resolverType = step.resolverType;
  const cfg = step.resolverConfig ?? {};

  const setType = (next: string) => {
    if (!next) {
      onChange({ resolverType: undefined, resolverConfig: undefined });
      return;
    }
    const typed = next as WorkflowResolverType;
    onChange({
      resolverType: typed,
      resolverConfig: defaultResolverConfig(typed),
    });
  };

  const setConfig = (next: WorkflowResolverConfig) => {
    onChange({
      resolverType,
      resolverConfig: next,
    });
  };

  return (
    <div
      className={
        compact
          ? 'space-y-3'
          : 'mt-4 space-y-3 border-t border-xevn-border/70 pt-4'
      }
      data-testid="workflow-step-resolver-fields"
    >
      <p className="text-sm font-medium text-slate-600">
        Resolver động (assignee)
        {!compact ? (
          <span className="ml-2 font-normal text-slate-500">
            — lưu rồi F5 phải giữ nguyên (AC-CD-F4-06)
          </span>
        ) : null}
      </p>
      <label className={`${SETTINGS_FIELD_SHELL} min-w-0 ${SETTINGS_FIELD_COMPACT}`}>
        <span className={SETTINGS_LABEL_CLASS}>Loại resolver</span>
        <div className="relative min-w-0">
          <select
            value={resolverType ?? ''}
            onChange={(e) => setType(e.target.value)}
            className={selectClassName}
            aria-label="Loại resolver động"
            data-testid="workflow-resolver-type"
          >
            <option value="">Legacy (hat / cố định — không set resolver_type)</option>
            {WORKFLOW_RESOLVER_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            strokeWidth={RAIL_STROKE}
            aria-hidden
          />
        </div>
      </label>

      {resolverType === 'direct_manager' ? (
        <label className={`${SETTINGS_FIELD_SHELL} min-w-0 ${SETTINGS_FIELD_COMPACT}`}>
          <span className={SETTINGS_LABEL_CLASS}>fallback_role_code</span>
          <input
            type="text"
            value={configString(cfg, 'fallback_role_code')}
            onChange={(e) =>
              setConfig(withConfigKey(cfg, 'fallback_role_code', e.target.value))
            }
            className={inputClassName}
            aria-label="fallback_role_code"
            placeholder="hrbp"
          />
        </label>
      ) : null}

      {resolverType === 'position_template' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={`${SETTINGS_FIELD_SHELL} min-w-0 ${SETTINGS_FIELD_COMPACT}`}>
            <span className={SETTINGS_LABEL_CLASS}>position_code</span>
            <input
              type="text"
              value={configString(cfg, 'position_code')}
              onChange={(e) =>
                setConfig(withConfigKey(cfg, 'position_code', e.target.value))
              }
              className={inputClassName}
              aria-label="position_code"
              placeholder="TRUONG_PHONG"
            />
          </label>
          <label className={`${SETTINGS_FIELD_SHELL} min-w-0 ${SETTINGS_FIELD_COMPACT}`}>
            <span className={SETTINGS_LABEL_CLASS}>company_id (slug)</span>
            <input
              type="text"
              value={configString(cfg, 'company_id')}
              onChange={(e) =>
                setConfig(withConfigKey(cfg, 'company_id', e.target.value))
              }
              className={inputClassName}
              aria-label="company_id slug"
              placeholder="main"
            />
          </label>
        </div>
      ) : null}

      {resolverType === 'fixed_user' ? (
        <label className={`${SETTINGS_FIELD_SHELL} min-w-0 ${SETTINGS_FIELD_COMPACT}`}>
          <span className={SETTINGS_LABEL_CLASS}>user_id</span>
          <input
            type="text"
            value={configString(cfg, 'user_id')}
            onChange={(e) => setConfig(withConfigKey(cfg, 'user_id', e.target.value))}
            className={inputClassName}
            aria-label="user_id"
            placeholder="user@xe.vn"
          />
        </label>
      ) : null}

      {resolverType === 'role_code' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={`${SETTINGS_FIELD_SHELL} min-w-0 ${SETTINGS_FIELD_COMPACT}`}>
            <span className={SETTINGS_LABEL_CLASS}>role_code</span>
            <input
              type="text"
              value={configString(cfg, 'role_code')}
              onChange={(e) => setConfig(withConfigKey(cfg, 'role_code', e.target.value))}
              className={inputClassName}
              aria-label="role_code"
            />
          </label>
          <label className={`${SETTINGS_FIELD_SHELL} min-w-0 ${SETTINGS_FIELD_COMPACT}`}>
            <span className={SETTINGS_LABEL_CLASS}>tenant_id</span>
            <input
              type="text"
              value={configString(cfg, 'tenant_id')}
              onChange={(e) => setConfig(withConfigKey(cfg, 'tenant_id', e.target.value))}
              className={inputClassName}
              aria-label="tenant_id"
              placeholder="xevn"
            />
          </label>
        </div>
      ) : null}

      {resolverType === 'parallel_group' ? (
        <div className="space-y-3">
          <label className={`${SETTINGS_FIELD_SHELL} min-w-0 ${SETTINGS_FIELD_COMPACT}`}>
            <span className={SETTINGS_LABEL_CLASS}>parallel_policy</span>
            <div className="relative min-w-0">
              <select
                value={configString(cfg, 'parallel_policy') || 'all'}
                onChange={(e) =>
                  setConfig(withConfigKey(cfg, 'parallel_policy', e.target.value))
                }
                className={selectClassName}
                aria-label="parallel_policy"
                data-testid="workflow-parallel-policy"
              >
                <option value="all">all — đủ người duyệt mới advance</option>
                <option value="any">any — một người duyệt là đủ</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                strokeWidth={RAIL_STROKE}
                aria-hidden
              />
            </div>
          </label>
          <p className="text-sm leading-snug text-slate-500">
            Mặc định con: <code className="text-xs">direct_manager</code> +{' '}
            <code className="text-xs">position_template</code> (ADR parallel_group). Có thể
            chỉnh chi tiết JSON sau khi lưu nếu cần.
          </p>
        </div>
      ) : null}
    </div>
  );
};
