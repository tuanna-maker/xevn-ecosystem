import type { Company } from '../../data/mock-data';

export function getParentEntityLabel(parentId: string | null | undefined, list: Company[]): string {
  if (!parentId) return '';
  const p = list.find((x) => x.id === parentId);
  return p ? `${p.code} — ${p.name}` : '';
}
