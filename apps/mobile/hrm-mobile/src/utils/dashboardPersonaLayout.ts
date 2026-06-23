import type { MobilePersonaId } from './mobilePersona';



/** Ordered Home scroll sections — MOBILE_PERSONA_UX_MATRIX §4.1 + MOB-UX-14b 1-screen budget. */

export type HomeSectionKey =

  | 'above_fold_stats'

  | 'activity_hub'

  | 'hero_carousel'

  | 'manager_inbox_hero'

  | 'leader_pulse'

  | 'pending_strip'

  | 'team_snapshot'

  | 'tasks'

  | 'action_grid'

  | 'payslip_feed'

  | 'manager_expandable'

  | 'today'

  | 'upcoming'

  | 'culture_strip'

  | 'journey_timeline'

  | 'celebrations'

  | 'whos_out'

  | 'ess_date_bar'

  | 'ess_stats'

  | 'ess_stat_cards';



export type DashboardPersonaLayout = {

  persona: MobilePersonaId;

  sectionOrder: HomeSectionKey[];

  showManagerInboxHero: boolean;

  showLeaderPulse: boolean;

  showPendingStrip: boolean;

  showTeamSnapshot: boolean;

  taskSectionBeforeGrid: boolean;

  hideCheckInTile: boolean;

  hideCheckInFab: boolean;

  approveTileLabel: string;

  showManagerExpandable: boolean;

  showManagerApprovalsPath: boolean;

  showReportsTile: boolean;

  showDatePicker: boolean;

};



/** Below-fold scroll — activity feed sections live in «Hoạt động» sheet only (MOB-UX-14b). */

const BELOW_FOLD_TAIL: HomeSectionKey[] = [

  'hero_carousel',

  'culture_strip',

  'journey_timeline',

  'celebrations',

  'whos_out',

  'ess_date_bar',

  'ess_stats',

];



/** Above-fold: grid + EssStatRow then activity hub trigger — no stacked expandables. */

/** Grid → compact stats → Hoạt động — seeded rows in a11y tree + activity above fold (MOB-UX-14-R4). */
export const HOME_ABOVE_FOLD_RENDER_ORDER: ReadonlyArray<HomeSectionKey> = [
  'action_grid',
  'above_fold_stats',
  'activity_hub',
];



const EMP_ORDER: HomeSectionKey[] = [...HOME_ABOVE_FOLD_RENDER_ORDER, ...BELOW_FOLD_TAIL];



const MGR_ORDER: HomeSectionKey[] = [...HOME_ABOVE_FOLD_RENDER_ORDER, ...BELOW_FOLD_TAIL];



const LDR_ORDER: HomeSectionKey[] = [...HOME_ABOVE_FOLD_RENDER_ORDER, ...BELOW_FOLD_TAIL];



/** Layout flags + scroll order for DashboardScreen (MOB-UX-13e + MOB-UX-14b). */

export function resolveDashboardPersonaLayout(persona: MobilePersonaId): DashboardPersonaLayout {

  switch (persona) {

    case 'leader':

      return {

        persona,

        sectionOrder: LDR_ORDER,

        showManagerInboxHero: false,

        showLeaderPulse: false,

        showPendingStrip: false,

        showTeamSnapshot: false,

        taskSectionBeforeGrid: false,

        hideCheckInTile: true,

        hideCheckInFab: true,

        approveTileLabel: 'Duyệt',

        showManagerExpandable: true,

        showManagerApprovalsPath: true,

        showReportsTile: true,

        showDatePicker: true,

      };

    case 'manager':

      return {

        persona,

        sectionOrder: MGR_ORDER,

        showManagerInboxHero: false,

        showLeaderPulse: false,

        showPendingStrip: false,

        showTeamSnapshot: false,

        taskSectionBeforeGrid: false,

        hideCheckInTile: false,

        hideCheckInFab: false,

        approveTileLabel: 'Duyệt',

        showManagerExpandable: true,

        showManagerApprovalsPath: true,

        showReportsTile: true,

        showDatePicker: true,

      };

    default:

      return {

        persona: 'employee',

        sectionOrder: EMP_ORDER,

        showManagerInboxHero: false,

        showLeaderPulse: false,

        showPendingStrip: false,

        showTeamSnapshot: false,

        taskSectionBeforeGrid: false,

        hideCheckInTile: false,

        hideCheckInFab: false,

        approveTileLabel: 'Việc',

        showManagerExpandable: false,

        showManagerApprovalsPath: false,

        showReportsTile: false,

        showDatePicker: false,

      };

  }

}

