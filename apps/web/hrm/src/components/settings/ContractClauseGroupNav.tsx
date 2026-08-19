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
import { useMemo } from 'react';

export type ContractClauseGroupNavProps = {
  clauses: HrmContractClauseRecord[];
  selected: string;
  onSelect: (groupKey: string) => void;
};

export function ContractClauseGroupNav({ clauses, selected, onSelect }: ContractClauseGroupNavProps) {
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of clauses) {
      const key = normalizeClauseGroupKey(c.clause_group) || 'UNKNOWN';
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [clauses]);

  const unknownGroups = useMemo(() => {
    const known = new Set<string>(CONTRACT_CLAUSE_GROUPS as unknown as string[]);
    return [...counts.keys()].filter((k) => k !== 'UNKNOWN' && !known.has(k));
  }, [counts]);

  const total = clauses.length;

  const renderItem = (value: string, label: string, count: number) => {
    const active = selected === value;
    return (
      <li key={value}>
        <button
          type="button"
          data-testid={`settings-contract-clauses-group-${value}`}
          onClick={() => onSelect(value)}
          className={cn(
            'flex h-10 w-full items-center justify-between gap-2 rounded-input px-2.5 text-left text-sm transition-colors',
            active
              ? 'bg-primary/10 font-semibold text-primary'
              : 'text-xevn-textSecondary hover:bg-muted/80 hover:text-xevn-text',
          )}
        >
          <span className="truncate">{label}</span>
          <span
            className={cn(
              'shrink-0 tabular-nums text-xs',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            {count}
          </span>
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
      <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-xevn-textMuted">
        Nhóm điều khoản
      </p>
      <ul className="max-h-[min(52vh,520px)] space-y-0.5 overflow-y-auto">
        {renderItem('__all__', 'Tất cả nhóm', total)}
        {CONTRACT_CLAUSE_GROUPS.map((g) =>
          renderItem(g, CONTRACT_CLAUSE_GROUP_LABELS[g] ?? g, counts.get(g) ?? 0),
        )}
        {unknownGroups.map((g) =>
          renderItem(g, clauseGroupLabelVi(g), counts.get(g) ?? 0),
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
