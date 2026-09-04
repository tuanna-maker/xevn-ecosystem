/**
 * Master pane — nhóm điều khoản HĐ (bấm nhóm → lọc danh sách bên phải).
 * WorkItem: PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01
 */
import type { HrmContractClauseRecord } from '@/integrations/hrmApi';
import {
  clauseGroupLabelVi,
  clauseMatchesGroupFilter,
  normalizeClauseGroupKey,
} from '@/lib/contractClauseLibraryUx';
import {
  CONTRACT_CLAUSE_GROUP_LABELS,
  CONTRACT_CLAUSE_GROUPS,
} from '@/lib/contractLegalPrintConstants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Pencil, Plus } from 'lucide-react';
import { useMemo } from 'react';

export type ContractClauseGroupNavProps = {
  clauses: HrmContractClauseRecord[];
  selected: string;
  onSelect: (groupKey: string) => void;
  customGroupLabels?: Record<string, string>;
  customGroupKeys?: string[];
  onAddGroup?: () => void;
  onEditGroup?: (group: { key: string; label: string }) => void;
};

export function ContractClauseGroupNav({
  clauses,
  selected,
  onSelect,
  customGroupLabels,
  customGroupKeys,
  onAddGroup,
  onEditGroup,
}: ContractClauseGroupNavProps) {
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of clauses) {
      const key = normalizeClauseGroupKey(c.clause_group) || 'UNKNOWN';
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [clauses]);

  const allGroupKeys = useMemo(() => {
    const set = new Set<string>([...CONTRACT_CLAUSE_GROUPS, ...(customGroupKeys || [])]);
    return Array.from(set);
  }, [customGroupKeys]);

  const getGroupLabel = (g: string) => {
    if (customGroupLabels && customGroupLabels[g]) {
      return customGroupLabels[g];
    }
    return CONTRACT_CLAUSE_GROUP_LABELS[g] ?? clauseGroupLabelVi(g, customGroupLabels);
  };

  const unknownGroups = useMemo(() => {
    const known = new Set<string>(allGroupKeys);
    return [...counts.keys()].filter((k) => k !== 'UNKNOWN' && !known.has(k));
  }, [counts, allGroupKeys]);

  const total = clauses.length;

  const renderItem = (value: string, label: string, count: number) => {
    const active = selected === value;
    const isEditable = value !== '__all__' && Boolean(onEditGroup);

    return (
      <li key={value} className="group/nav-item flex items-center">
        <button
          type="button"
          data-testid={`settings-contract-clauses-group-${value}`}
          onClick={() => {
            onSelect(value);
            if (isEditable) {
              onEditGroup?.({ key: value, label });
            }
          }}
          className={cn(
            'flex h-10 w-full items-center justify-between gap-2 rounded-input px-2.5 text-left text-sm transition-colors',
            active
              ? 'bg-primary/10 font-semibold text-primary'
              : 'text-xevn-textSecondary hover:bg-muted/80 hover:text-xevn-text',
          )}
        >
          <span className="truncate flex-1">{label}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            {isEditable ? (
              <span
                role="button"
                title="Sửa nhóm"
                data-testid={`settings-contract-clauses-group-edit-${value}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(value);
                  onEditGroup?.({ key: value, label });
                }}
                className="p-1 text-muted-foreground opacity-60 hover:text-primary hover:opacity-100 transition-opacity"
              >
                <Pencil className="h-3.5 w-3.5" />
              </span>
            ) : null}
            <span
              className={cn(
                'tabular-nums text-xs',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {count}
            </span>
          </div>
        </button>
      </li>
    );
  };

  return (
    <nav
      className="rounded-card border border-xevn-border bg-surface/80 p-2 shadow-soft"
      aria-label="Nhóm điều khoản"
      data-testid="settings-contract-clauses-group-nav"
    >
      <div className="flex items-center justify-between px-2 py-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-xevn-textMuted">
          Nhóm điều khoản
        </p>
        {onAddGroup ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-xevn-textMuted hover:bg-muted hover:text-primary"
            title="Thêm nhóm điều khoản mới"
            data-testid="settings-contract-clauses-add-group-btn"
            onClick={(e) => {
              e.stopPropagation();
              onAddGroup();
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      <ul className="max-h-[min(52vh,520px)] space-y-0.5 overflow-y-auto">
        {renderItem('__all__', 'Tất cả nhóm', total)}
        {allGroupKeys.map((g) => renderItem(g, getGroupLabel(g), counts.get(g) ?? 0))}
        {unknownGroups.map((g) =>
          renderItem(g, clauseGroupLabelVi(g, customGroupLabels), counts.get(g) ?? 0),
        )}
      </ul>
    </nav>
  );
}

/** Lọc client — dùng chung với nav. */
export function filterClausesByGroupAndSearch(
  clauses: HrmContractClauseRecord[],
  groupFilter: string,
  search: string,
): HrmContractClauseRecord[] {
  const q = search.trim().toLowerCase();
  return clauses.filter((c) => {
    if (!clauseMatchesGroupFilter(c.clause_group, groupFilter)) return false;
    if (!q) return true;
    return (
      c.code.toLowerCase().includes(q) ||
      (c.title_vi ?? '').toLowerCase().includes(q)
    );
  });
}
