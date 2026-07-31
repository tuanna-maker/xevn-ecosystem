/**
 * @CODE-MEMORY
 * Screen:     N/A — HRM cockpit table shell constants (no catalog)
 * UC:         UC-HRM-20 (M-CC-02)
 * BR:         BR-MOCK-01, BR-EXEC-01b
 * SRS:        docs/hrm/SRS.md §13
 * TechSpec:   docs/hrm/TECHSPEC.md §11.3
 * Purpose:    Table layout tokens only. Legacy HRM_MOCK_* catalog removed (PCOMP-W2-FE-01).
 * WorkItem:   PCOMP-W2-FE-01
 * Coded:      2026-06-07
 *
 * Callers:
 *   - HrmWorkspacePanel.tsx / HrmMetadataQueueSection.tsx → HRM_TABLE_*
 *
 * Callees: N/A
 * FE-Actions: N/A
 * BE-Chain: N/A
 * Impact: Re-adding HRM_MOCK_* exports regresses M-CC-02 gate
 * must_keep: zero HRM_MOCK_* exports (enforced by mock-data.test.ts)
 * SOLID: SRP — styling constants only
 * LastVerified: mock-data.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19
 * WorkItem: PCOMP-W2-FE-01
 * What: Document CODE-MEMORY; catalog remains stripped
 * Why: Re-verify W2 residual close
 * SRS/BR: BR-MOCK-01
 */
import { SETTINGS_CONTROL_TEXT, SETTINGS_RADIUS_CARD } from '../../pages/command-center/settings-form-pattern';

export const HRM_TABLE_SHELL = `w-full max-w-full overflow-x-auto border border-xevn-border bg-white mt-4 ${SETTINGS_RADIUS_CARD}`;
export const HRM_TABLE_CLASS = `w-full ${SETTINGS_CONTROL_TEXT}`;
