/**
 * @CODE-MEMORY
 * Screen:     / — HRM Index (PORT-09)
 * UC:         UX-10 · UC-HRM-20 dashboard home
 * BR:         Ops-dense home · no marketing hero
 * SRS:        N/A theme remaster
 * TechSpec:   docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§9
 * Purpose:    Thin re-export → Dashboard (Precision Motion remaster on Dashboard).
 * WorkItem:   PO-HRM-UI-BRAND-W3-PORT-B
 * Coded:      2026-08-05
 * Callers:    App routes `/`
 * Callees:    pages/Dashboard
 * must_keep:  Dashboard wires + EmptyState; no Nest/seed
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-w3-port-b.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-PORT-B
 * change_mode: UPGRADE
 * What: Document PORT-09 surface; remaster lives in Dashboard.tsx
 * Why: Inventory W3-PORT-B
 * must_keep: re-export only — no second dashboard invent
 */
import Dashboard from './Dashboard';

const Index = () => {
  return <Dashboard />;
};

export default Index;
