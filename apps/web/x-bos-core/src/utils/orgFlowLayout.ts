import type { OrgUnit } from '@/types';
import type { Edge, Node } from '@xyflow/react';

/** Bố trí cây theo tầng phục vụ kéo thả trên React Flow */
export function buildOrgFlowGraph(units: OrgUnit[]): { nodes: Node[]; edges: Edge[] } {
  const byParent = new Map<string | null, OrgUnit[]>();
  for (const u of units) {
    const k = u.parentId;
    if (!byParent.has(k)) byParent.set(k, []);
    byParent.get(k)!.push(u);
  }
  for (const arr of byParent.values()) {
    arr.sort((a, b) => a.code.localeCompare(b.code));
  }

  const positions = new Map<string, { x: number; y: number }>();
  let row: OrgUnit[] = byParent.get(null) ?? [];
  let depth = 0;
  while (row.length) {
    const rowWidth = Math.max(row.length * 260, 280);
    row.forEach((u, i) => {
      const x = i * 260 - rowWidth / 2 + 130;
      const y = depth * 140;
      positions.set(u.id, { x, y });
    });
    const next: OrgUnit[] = [];
    for (const n of row) {
      next.push(...(byParent.get(n.id) ?? []));
    }
    row = next;
    depth++;
  }

  const nodes: Node[] = units.map((u) => {
    const p = positions.get(u.id) ?? { x: 0, y: 0 };
    return {
      id: u.id,
      position: p,
      data: {
        label: u.name,
        code: u.code,
        type: u.orgTypeCode,
      },
      type: 'orgCard',
    };
  });

  const edges: Edge[] = units
    .filter((u) => u.parentId)
    .map((u) => ({
      id: `${u.parentId}-${u.id}`,
      source: u.parentId!,
      target: u.id,
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 1.5 },
    }));

  return { nodes, edges };
}
