import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Box,
  CheckCircle2,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Scale,
  Shield,
  Truck,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import dagre from 'dagre';
import {
  WF_NODE_BOD,
  WF_NODE_END_OK,
  WF_NODE_END_REJECT,
  WF_NODE_START,
  type WorkflowGraphStep,
  type WorkflowTransitionKind,
  WORKFLOW_EDGE_FULL_LABELS,
  workflowHandlerRoleAllowsRejectOutcome,
} from '../../data/workflow-graph';
import { SETTINGS_RADIUS_CARD } from './settings-form-pattern';

export type { WorkflowGraphStep } from '../../data/workflow-graph';

type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'start' | 'endOk' | 'endReject' | 'special' | 'step';
};

const CARD_STEP_W = 264;
const CARD_STEP_H = 158;
/** Bố cục ngang: khoảng cách tối thiểu giữa các cột — chừa chỗ đường cong nối */
const RANKSEP = 300;
/** Dagre LR: khoảng cách dọc giữa các nút cùng rank; nhánh reject/else xếp chồng tương đương */
const NODESEP = 150;
const PAD = 48;
const ICON_STROKE = 1.25;

/** Icon module liên quan (góc dưới card) */
const MODULE_ICONS: Record<string, LucideIcon> = {
  hr: Users,
  finance: Wallet,
  logistics: Truck,
  xbos: Box,
  legal: Scale,
};

type Cubic = {
  d: string;
  x1: number;
  y1: number;
  cx1: number;
  cy1: number;
  cx2: number;
  cy2: number;
  x2: number;
  y2: number;
};

function cubicHorizontal(x1: number, y1: number, x2: number, y2: number): Cubic {
  const dx = x2 - x1;
  const t = Math.min(Math.abs(dx) * 0.42, 132);
  const cx1 = x1 + t;
  const cy1 = y1;
  const cx2 = x2 - t;
  const cy2 = y2;
  return {
    d: `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`,
    x1,
    y1,
    cx1,
    cy1,
    cx2,
    cy2,
    x2,
    y2,
  };
}

function cubicBranch(x1: number, y1: number, x2: number, y2: number): Cubic {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx1 = x1 + dx * 0.24;
  const cy1 = y1 + dy * 0.58;
  const cx2 = x2 - dx * 0.24;
  const cy2 = y2 - dy * 0.58;
  return {
    d: `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`,
    x1,
    y1,
    cx1,
    cy1,
    cx2,
    cy2,
    x2,
    y2,
  };
}

function bezierAt(c: Cubic, t: number): { x: number; y: number } {
  const { x1, y1, cx1, cy1, cx2, cy2, x2, y2 } = c;
  const mt = 1 - t;
  const x =
    mt ** 3 * x1 + 3 * mt ** 2 * t * cx1 + 3 * mt * t ** 2 * cx2 + t ** 3 * x2;
  const y =
    mt ** 3 * y1 + 3 * mt ** 2 * t * cy1 + 3 * mt * t ** 2 * cy2 + t ** 3 * y2;
  return { x, y };
}

/** Đẩy nhãn theo pháp tuyến tại tAnchor — tránh đè nét và vùng mũi tên (đích t ≈ 1) */
function labelOffsetAlongNormal(
  c: Cubic,
  dist: number,
  tAnchor: number,
): { dx: number; dy: number } {
  const dt = 0.04;
  const p0 = bezierAt(c, Math.max(0.02, tAnchor - dt));
  const p1 = bezierAt(c, Math.min(0.98, tAnchor + dt));
  const tx = p1.x - p0.x;
  const ty = p1.y - p0.y;
  const len = Math.hypot(tx, ty) || 1;
  const nx = -ty / len;
  const ny = tx / len;
  return { dx: nx * dist, dy: ny * dist };
}

function centerRight(r: Rect): { x: number; y: number } {
  return { x: r.x + r.w, y: r.y + r.h / 2 };
}

function centerLeft(r: Rect): { x: number; y: number } {
  return { x: r.x, y: r.y + r.h / 2 };
}

function bottomCenter(r: Rect): { x: number; y: number } {
  return { x: r.x + r.w / 2, y: r.y + r.h };
}

function topCenter(r: Rect): { x: number; y: number } {
  return { x: r.x + r.w / 2, y: r.y };
}

function capsuleTargetIn(r: Rect): { x: number; y: number } {
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

/**
 * Lớp đường nối nằm dưới thẻ nút → mũi tên tại mép nút bị nền thẻ che.
 * Điểm cuối *hiển thị* phải nằm ngoài bbox đích một khoảng đủ chỗ mũi tên.
 */
const EDGE_TARGET_OUTSET = 16;

function intersectRayAabbInterval(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
): { tMin: number; tMax: number } | null {
  let t0 = -Infinity;
  let t1 = Infinity;
  const EPS = 1e-9;

  if (Math.abs(dx) < EPS) {
    if (ox < minX || ox > maxX) return null;
  } else {
    const a = (minX - ox) / dx;
    const b = (maxX - ox) / dx;
    const near = Math.min(a, b);
    const far = Math.max(a, b);
    t0 = Math.max(t0, near);
    t1 = Math.min(t1, far);
  }
  if (Math.abs(dy) < EPS) {
    if (oy < minY || oy > maxY) return null;
  } else {
    const a = (minY - oy) / dy;
    const b = (maxY - oy) / dy;
    const near = Math.min(a, b);
    const far = Math.max(a, b);
    t0 = Math.max(t0, near);
    t1 = Math.min(t1, far);
  }
  if (t0 > t1) return null;
  return { tMin: t0, tMax: t1 };
}

/** Khoảng cách dọc tia từ `from` tới mép vào bbox đích đầu tiên (from ngoài hộp). */
function rayFirstEntryToRect(
  fromX: number,
  fromY: number,
  towardX: number,
  towardY: number,
  rect: Rect,
): number | null {
  const dx = towardX - fromX;
  const dy = towardY - fromY;
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return null;
  const ux = dx / len;
  const uy = dy / len;
  const hit = intersectRayAabbInterval(
    fromX,
    fromY,
    ux,
    uy,
    rect.x,
    rect.y,
    rect.x + rect.w,
    rect.y + rect.h,
  );
  if (!hit) return null;
  const { tMin, tMax } = hit;
  if (tMax < 0) return null;
  if (tMin >= 0) return tMin;
  if (tMax >= 0) return 0;
  return null;
}

function visibleEdgeEnd(
  fromX: number,
  fromY: number,
  rawToX: number,
  rawToY: number,
  targetRect: Rect,
): { x: number; y: number } {
  const dx = rawToX - fromX;
  const dy = rawToY - fromY;
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return { x: rawToX, y: rawToY };
  const ux = dx / len;
  const uy = dy / len;

  const tBorder = rayFirstEntryToRect(fromX, fromY, rawToX, rawToY, targetRect);
  if (tBorder != null && Number.isFinite(tBorder)) {
    let tVisible: number;
    if (tBorder > EDGE_TARGET_OUTSET + 4) {
      tVisible = tBorder - EDGE_TARGET_OUTSET;
    } else {
      tVisible = Math.max(2, tBorder * 0.35);
    }
    if (tVisible > 0 && tVisible < tBorder) {
      return { x: fromX + ux * tVisible, y: fromY + uy * tVisible };
    }
  }

  const pull = Math.min(EDGE_TARGET_OUTSET, len * 0.42);
  return { x: rawToX - ux * pull, y: rawToY - uy * pull };
}

function terminalKind(id: string): Rect['kind'] {
  if (id === WF_NODE_START) return 'start';
  if (id === WF_NODE_END_OK) return 'endOk';
  if (id === WF_NODE_END_REJECT) return 'endReject';
  return 'special';
}

function terminalWidth(id: string): number {
  if (id === WF_NODE_END_OK) return 132;
  if (id === WF_NODE_END_REJECT) return 120;
  if (id === WF_NODE_BOD) return 140;
  return 108;
}

const CAPSULE_H = 48;

function collectAllNodeIds(steps: WorkflowGraphStep[]): Set<string> {
  const s = new Set<string>([
    WF_NODE_START,
    WF_NODE_END_OK,
    WF_NODE_END_REJECT,
    WF_NODE_BOD,
  ]);
  for (const st of steps) {
    s.add(st.id);
    for (const t of st.transitions) s.add(t.destinationId);
  }
  return s;
}

function computeIncoming(steps: WorkflowGraphStep[]): Map<string, Set<string>> {
  const inc = new Map<string, Set<string>>();
  const add = (to: string, from: string) => {
    if (!inc.has(to)) inc.set(to, new Set());
    inc.get(to)!.add(from);
  };
  for (const st of steps) {
    for (const t of st.transitions) add(t.destinationId, st.id);
  }
  return inc;
}

function entryStepIds(steps: WorkflowGraphStep[], incoming: Map<string, Set<string>>): string[] {
  if (steps.length === 0) return [];
  const entries = steps
    .filter((s) => {
      const p = incoming.get(s.id);
      return !p || p.size === 0;
    })
    .map((s) => s.id);
  if (entries.length > 0) return entries;
  const minOrder = Math.min(...steps.map((s) => s.order));
  const fb = steps.find((s) => s.order === minOrder);
  return fb ? [fb.id] : [];
}

/**
 * Cạnh Đồng ý + Start→entry dùng để tự bố trí; không gộp nhánh từ chối/ngoại lệ để tránh vòng lặp.
 */
function buildApproveForwardEdges(
  steps: WorkflowGraphStep[],
  entrySet: Set<string>,
): { from: string; to: string }[] {
  const edges: { from: string; to: string }[] = [];
  for (const eid of entrySet) edges.push({ from: WF_NODE_START, to: eid });
  for (const st of steps) {
    const appr = st.transitions.find((t) => t.kind === 'approve');
    if (appr) edges.push({ from: st.id, to: appr.destinationId });
  }
  return edges;
}

function nodeRectMeta(
  id: string,
  sorted: WorkflowGraphStep[],
): { w: number; h: number; kind: Rect['kind'] } {
  const isStep = sorted.some((s) => s.id === id);
  if (isStep) return { w: CARD_STEP_W, h: CARD_STEP_H, kind: 'step' };
  return { w: terminalWidth(id), h: CAPSULE_H, kind: terminalKind(id) };
}

function buildLayout(steps: WorkflowGraphStep[]): {
  rects: Map<string, Rect>;
  worldW: number;
  worldH: number;
  contentBounds: { minX: number; minY: number; maxX: number; maxY: number; cw: number; ch: number };
} {
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  const allIds = collectAllNodeIds(sorted);
  const incoming = computeIncoming(sorted);
  const entries = entryStepIds(sorted, incoming);
  const entrySet = new Set(entries);
  const approveEdges = buildApproveForwardEdges(sorted, entrySet);

  const reachable = new Set<string>([WF_NODE_START]);
  const queue = [WF_NODE_START];
  while (queue.length > 0) {
    const u = queue.shift()!;
    for (const e of approveEdges) {
      if (e.from === u && !reachable.has(e.to)) {
        reachable.add(e.to);
        queue.push(e.to);
      }
    }
  }

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'LR',
    ranksep: RANKSEP,
    nodesep: NODESEP,
    edgesep: 48,
    marginx: PAD,
    marginy: PAD,
    acyclicer: 'greedy',
    ranker: 'network-simplex',
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const id of allIds) {
    if (!reachable.has(id)) continue;
    const { w, h } = nodeRectMeta(id, sorted);
    g.setNode(id, { width: w, height: h });
  }

  for (const e of approveEdges) {
    if (reachable.has(e.from) && reachable.has(e.to)) {
      g.setEdge(e.from, e.to);
    }
  }

  dagre.layout(g);

  const rects = new Map<string, Rect>();
  for (const id of reachable) {
    const n = g.node(id) as { x?: number; y?: number } | undefined;
    if (!n || n.x === undefined || n.y === undefined) continue;
    const { w, h, kind } = nodeRectMeta(id, sorted);
    rects.set(id, {
      x: n.x - w / 2,
      y: n.y - h / 2,
      w,
      h,
      kind,
    });
  }

  for (const st of sorted) {
    const srcR = rects.get(st.id);
    if (!srcR) continue;
    const branchTargets = [
      ...new Set(
        st.transitions.filter((t) => t.kind !== 'approve').map((t) => t.destinationId),
      ),
    ]
      .filter((id) => allIds.has(id) && !rects.has(id))
      .sort();

    let stackIdx = 0;
    for (const destId of branchTargets) {
      if (rects.has(destId)) continue;
      const { w, h, kind } = nodeRectMeta(destId, sorted);
      const y = srcR.y + srcR.h + NODESEP + stackIdx * (h + NODESEP);
      const x = srcR.x + Math.min(40, Math.max(8, srcR.w * 0.08));
      rects.set(destId, { x, y, w, h, kind });
      stackIdx += 1;
    }
  }

  for (const id of allIds) {
    if (rects.has(id)) continue;
    const { w, h, kind } = nodeRectMeta(id, sorted);
    rects.set(id, {
      x: PAD,
      y: PAD + rects.size * 8,
      w,
      h,
      kind,
    });
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxYRect = -Infinity;
  rects.forEach((r) => {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.w);
    maxYRect = Math.max(maxYRect, r.y + r.h);
  });
  if (!Number.isFinite(minX)) {
    minX = 0;
    minY = 0;
    maxX = PAD * 4;
    maxYRect = PAD * 4;
  }
  const cw = Math.max(1, maxX - minX);
  const ch = Math.max(1, maxYRect - minY);
  const margin = PAD;
  const worldW = maxX + margin;
  const worldH = maxYRect + margin;

  return {
    rects,
    worldW,
    worldH,
    contentBounds: { minX, minY, maxX, maxY: maxYRect, cw, ch },
  };
}

function exitPoint(
  r: Rect,
  kind: WorkflowTransitionKind,
): { x: number; y: number } {
  if (r.kind === 'step') {
    if (kind === 'approve') return centerRight(r);
    if (kind === 'reject') return bottomCenter(r);
    return { x: r.x + r.w - 6, y: r.y + 16 };
  }
  return centerRight(r);
}

function entryPoint(
  r: Rect,
  kind: WorkflowTransitionKind,
  targetIsStep: boolean,
): { x: number; y: number } {
  if (!targetIsStep) return capsuleTargetIn(r);
  if (kind === 'approve') return centerLeft(r);
  if (kind === 'reject') return topCenter(r);
  return centerLeft(r);
}

type CanvasEdge = {
  id: string;
  cubic: Cubic;
  /** Path đầy đủ tới anchor đích — vùng hit rộng; nét hiển thị dùng `cubic` (rút ngắn). */
  hitD: string;
  transitionKind: WorkflowTransitionKind;
  labelX: number;
  labelY: number;
  /** Nhãn lệch theo pháp tuyến đường cong để không đè lên nét */
  lineLabel: string;
};

function buildEdges(
  steps: WorkflowGraphStep[],
  rects: Map<string, Rect>,
  entryIds: string[],
): CanvasEdge[] {
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  const out: CanvasEdge[] = [];
  const pushEdge = (
    id: string,
    from: string,
    to: string,
    transitionKind: WorkflowTransitionKind,
    preferHorizontal: boolean,
  ) => {
    const ra = rects.get(from);
    const rb = rects.get(to);
    if (!ra || !rb) return;
    const targetIsStep = sorted.some((s) => s.id === to);
    const p1 = exitPoint(ra, transitionKind);
    const p2Raw = entryPoint(rb, transitionKind, targetIsStep);
    const p2 = visibleEdgeEnd(p1.x, p1.y, p2Raw.x, p2Raw.y, rb);
    const cubicHit =
      preferHorizontal && transitionKind === 'approve'
        ? cubicHorizontal(p1.x, p1.y, p2Raw.x, p2Raw.y)
        : cubicBranch(p1.x, p1.y, p2Raw.x, p2Raw.y);
    const cubic =
      preferHorizontal && transitionKind === 'approve'
        ? cubicHorizontal(p1.x, p1.y, p2.x, p2.y)
        : cubicBranch(p1.x, p1.y, p2.x, p2.y);
    /** Gần nguồn hơn đích (t=1 có marker) — gap-1 (~4px) khỏi vùng mũi tên; reject xa hơn để “Từ chối” nằm trên nét đứt */
    const tLabel =
      transitionKind === 'approve' ? 0.38 : transitionKind === 'reject' ? 0.28 : 0.36;
    const anchor = bezierAt(cubic, tLabel);
    const labelLiftBase =
      transitionKind === 'approve' ? 14 : transitionKind === 'reject' ? 15 : 14;
    const gap1 = 4;
    const { dx, dy } = labelOffsetAlongNormal(cubic, labelLiftBase + gap1, tLabel);
    out.push({
      id,
      cubic,
      hitD: cubicHit.d,
      transitionKind,
      labelX: anchor.x + dx,
      labelY: anchor.y + dy,
      lineLabel: WORKFLOW_EDGE_FULL_LABELS[transitionKind],
    });
  };

  const stR = rects.get(WF_NODE_START);
  if (stR) {
    for (const eid of entryIds) {
      pushEdge(`e-start-${eid}`, WF_NODE_START, eid, 'approve', true);
    }
  }

  for (const st of sorted) {
    for (const t of st.transitions) {
      if (t.kind === 'reject' && !workflowHandlerRoleAllowsRejectOutcome(st.handlerRoleId)) {
        continue;
      }
      const hid = `${st.id}-${t.kind}-${t.destinationId}`;
      pushEdge(hid, st.id, t.destinationId, t.kind, t.kind === 'approve');
    }
  }

  return out;
}

export type WorkflowCanvasProps = {
  steps: WorkflowGraphStep[];
  selectedStepId: string | null;
  onSelectStep: (id: string | null) => void;
  resolveRoleLabel: (handlerRoleId: string) => string;
  resolveModuleLabel: (relatedModuleId: string) => string;
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  steps,
  selectedStepId,
  onSelectStep,
  resolveRoleLabel,
  resolveModuleLabel,
}) => {
  const sorted = useMemo(
    () => [...steps].sort((a, b) => a.order - b.order),
    [steps],
  );
  const { rects, worldW, worldH, contentBounds } = useMemo(
    () => buildLayout(sorted),
    [sorted],
  );
  const entryIds = useMemo(() => {
    const inc = computeIncoming(sorted);
    return entryStepIds(sorted, inc);
  }, [sorted]);

  const edges = useMemo(
    () => buildEdges(sorted, rects, entryIds),
    [sorted, rects, entryIds],
  );

  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const drag = useRef(false);
  const lastPt = useRef({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  const fitView = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    const { minX, minY, cw, ch } = contentBounds;
    if (vw < 24 || vh < 24 || cw < 8 || ch < 8) return;
    const pad = 36;
    const sx = (vw - pad * 2) / cw;
    const sy = (vh - pad * 2) / ch;
    const k = Math.min(1, sx, sy);
    const x = pad - minX * k;
    const y = pad - minY * k;
    setView({ x, y, k });
  }, [contentBounds]);

  useLayoutEffect(() => {
    fitView();
  }, [fitView]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => fitView());
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitView]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest('[data-wf-node]') || t.closest('[data-wf-edge-hit]')) return;
    drag.current = true;
    lastPt.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - lastPt.current.x;
    const dy = e.clientY - lastPt.current.y;
    lastPt.current = { x: e.clientX, y: e.clientY };
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  }, []);

  const endDrag = useCallback(() => {
    drag.current = false;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.07 : 0.07;
    setView((v) => ({ ...v, k: Math.min(2, Math.max(0.35, v.k + delta)) }));
  }, []);

  const zoomIn = () => setView((v) => ({ ...v, k: Math.min(2, v.k + 0.12) }));
  const zoomOut = () => setView((v) => ({ ...v, k: Math.max(0.35, v.k - 0.12) }));
  const resetView = () => fitView();

  const edgeGroupClass = (kind: WorkflowTransitionKind) => {
    if (kind === 'approve') return 'group/wf-appr';
    if (kind === 'reject') return 'group/wf-rej';
    return 'group/wf-exc';
  };

  /** Độ dày nét 1.5px — đồng bộ với icon giao diện */
  const edgeStrokeClasses = (kind: WorkflowTransitionKind) => {
    if (kind === 'approve')
      return 'stroke-[#1E40AF] stroke-[1.5px] transition-opacity duration-200 group-hover/wf-appr:opacity-90';
    if (kind === 'reject')
      return 'stroke-[#E11D48] stroke-[1.5px] stroke-linecap-round transition-opacity duration-200 group-hover/wf-rej:opacity-90';
    return 'stroke-[#ea580c] stroke-[1.5px] transition-opacity duration-200 group-hover/wf-exc:opacity-90';
  };

  const edgePathStyle = (kind: WorkflowTransitionKind): React.CSSProperties | undefined =>
    kind === 'reject' ? { strokeDasharray: '5,5' } : undefined;

  const edgeLabelFill = (kind: WorkflowTransitionKind) => {
    if (kind === 'approve') return '#1E40AF';
    if (kind === 'reject') return '#E11D48';
    return '#ea580c';
  };

  const markerEndForKind = (kind: WorkflowTransitionKind) => {
    if (kind === 'approve') return 'url(#wf-arrow-blue)';
    if (kind === 'reject') return 'url(#wf-arrow-red)';
    return 'url(#wf-arrow-orange)';
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="flex items-center gap-0.5 rounded-xl border border-slate-100 bg-white p-0.5 shadow-soft">
          <button
            type="button"
            onClick={zoomOut}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-50"
            aria-label="Thu nhỏ"
          >
            <Minus className="h-4 w-4" strokeWidth={ICON_STROKE} />
          </button>
          <span className="min-w-[2.75rem] text-center text-xs tabular-nums text-slate-500">
            {Math.round(view.k * 100)}%
          </span>
          <button
            type="button"
            onClick={zoomIn}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-50"
            aria-label="Phóng to"
          >
            <Plus className="h-4 w-4" strokeWidth={ICON_STROKE} />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-50"
            aria-label="Reset khung nhìn"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={ICON_STROKE} />
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="relative isolate h-[min(640px,72vh)] w-full cursor-grab overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50 bg-workflow-canvas-dots active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onWheel={onWheel}
        role="application"
        aria-label="Sơ đồ mạng lưới quy trình"
      >
        <div
          className="absolute left-0 top-0 origin-top-left will-change-transform"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
          }}
        >
          <svg
            width={worldW}
            height={worldH}
            className="block overflow-visible"
            aria-hidden
          >
            <defs>
              {/* Mũi tên nét mảnh 1.5px; màu trùng nét cạnh */}
              <marker
                id="wf-arrow-blue"
                markerUnits="userSpaceOnUse"
                markerWidth="11"
                markerHeight="10"
                refX="10"
                refY="5"
                orient="auto"
                overflow="visible"
              >
                <path
                  d="M1,1.75 L10,5 L1,8.25"
                  fill="none"
                  stroke="#1E40AF"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </marker>
              <marker
                id="wf-arrow-red"
                markerUnits="userSpaceOnUse"
                markerWidth="11"
                markerHeight="10"
                refX="10"
                refY="5"
                orient="auto"
                overflow="visible"
              >
                <path
                  d="M1,1.75 L10,5 L1,8.25"
                  fill="none"
                  stroke="#E11D48"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </marker>
              <marker
                id="wf-arrow-orange"
                markerUnits="userSpaceOnUse"
                markerWidth="11"
                markerHeight="10"
                refX="10"
                refY="5"
                orient="auto"
                overflow="visible"
              >
                <path
                  d="M1,1.75 L10,5 L1,8.25"
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </marker>
            </defs>
            {edges.map((e) => (
              <g key={e.id} className={edgeGroupClass(e.transitionKind)}>
                <path
                  data-wf-edge-hit
                  d={e.hitD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={18}
                  className="cursor-pointer"
                />
                <path
                  d={e.cubic.d}
                  fill="none"
                  strokeLinecap="round"
                  markerEnd={markerEndForKind(e.transitionKind)}
                  style={edgePathStyle(e.transitionKind)}
                  className={`pointer-events-none ${edgeStrokeClasses(e.transitionKind)}`}
                />
                <text
                  x={e.labelX}
                  y={e.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none text-[10px] font-medium"
                  fill={edgeLabelFill(e.transitionKind)}
                  style={{
                    paintOrder: 'stroke fill',
                    stroke: 'rgb(248 250 252)',
                    strokeWidth: 4,
                    strokeLinejoin: 'round',
                  }}
                >
                  {e.lineLabel}
                </text>
              </g>
            ))}
          </svg>

          {Array.from(rects.entries()).map(([id, r]) => {
            if (r.kind === 'step') {
              const step = sorted.find((s) => s.id === id);
              if (!step) return null;
              const selected = selectedStepId === id;
              const ModIcon = MODULE_ICONS[step.relatedModuleId] ?? Box;
              const roleTitle = resolveRoleLabel(step.handlerRoleId);
              const moduleTitle = resolveModuleLabel(step.relatedModuleId);
              return (
                <button
                  key={id}
                  type="button"
                  data-wf-node
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onSelectStep(selected ? null : id);
                  }}
                  className={`absolute grid h-full min-h-0 border border-slate-100/90 bg-white p-4 text-left shadow-soft transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${SETTINGS_RADIUS_CARD} grid-rows-[auto_minmax(0,1fr)_auto] gap-3 ${
                    selected
                      ? 'z-[2] scale-105 border-xevn-primary/35 shadow-[0_12px_40px_rgb(30,64,175,0.09)]'
                      : 'hover:border-slate-200'
                  }`}
                  style={{
                    left: r.x,
                    top: r.y,
                    width: r.w,
                    height: r.h,
                  }}
                >
                  <p className="min-w-0 text-center text-[15px] font-bold leading-snug text-xevn-text">
                    {roleTitle}
                  </p>
                  <p className="min-w-0 self-center text-center text-base font-medium leading-snug text-slate-800 [text-wrap:balance] line-clamp-4">
                    {step.taskName?.trim() || '—'}
                  </p>
                  <div className="flex min-w-0 items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <span className="flex min-w-0 items-center gap-2 text-slate-500">
                      <ModIcon
                        className="h-5 w-5 shrink-0 text-slate-400"
                        strokeWidth={ICON_STROKE}
                        aria-hidden
                      />
                      <span className="truncate text-xs font-medium text-slate-500">{moduleTitle}</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-xs font-semibold text-slate-600">
                      SLA {step.slaHours}h
                    </span>
                  </div>
                </button>
              );
            }

            const capLabel =
              r.kind === 'start'
                ? 'START'
                : r.kind === 'endOk'
                  ? 'END'
                  : r.kind === 'endReject'
                    ? 'END'
                    : 'SPECIAL';
            const capTitle =
              r.kind === 'start'
                ? 'Khởi tạo'
                : r.kind === 'endOk'
                  ? 'Hoàn thành'
                  : r.kind === 'endReject'
                    ? 'Từ chối'
                    : 'BOD / Ngoại lệ';
            const CapIcon: LucideIcon =
              r.kind === 'start'
                ? Play
                : r.kind === 'endOk'
                  ? CheckCircle2
                  : r.kind === 'endReject'
                    ? XCircle
                    : Shield;

            return (
              <div
                key={id}
                data-wf-node
                className={`absolute flex items-center justify-center gap-2 border border-slate-100 bg-white px-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}
                style={{
                  left: r.x,
                  top: r.y,
                  width: r.w,
                  height: r.h,
                  borderRadius: 9999,
                }}
                title={capTitle}
              >
                <CapIcon
                  className="h-4 w-4 shrink-0 text-slate-400"
                  strokeWidth={ICON_STROKE}
                  aria-hidden
                />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {capLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export function formatWorkflowDrawerDetails(
  step: WorkflowGraphStep,
  roleLabel: (id: string) => string,
  actionLabel: (k: string) => string,
  moduleLabel: (id: string) => string,
  destinationLabel: (id: string) => string,
) {
  const base = [
    { k: 'Tên đầu việc', v: step.taskName || '—' },
    { k: 'Vai trò xử lý', v: roleLabel(step.handlerRoleId) },
    { k: 'Hành động', v: actionLabel(step.stepAction) },
    { k: 'SLA bước (giờ)', v: String(step.slaHours) },
    { k: 'Dữ liệu liên quan', v: moduleLabel(step.relatedModuleId) },
  ];
  const trans = step.transitions.map((t) => {
    if (t.kind === 'reject' && !workflowHandlerRoleAllowsRejectOutcome(step.handlerRoleId)) {
      return {
        k: '→ Từ chối',
        v: 'Không áp dụng — vai trò không có thẩm quyền từ chối',
      };
    }
    return {
      k: `→ ${WORKFLOW_EDGE_FULL_LABELS[t.kind]}`,
      v: destinationLabel(t.destinationId),
    };
  });
  return [...base, ...trans];
}
