import {
  Users,
  Clock,
  Wallet,
  UserPlus,
  Building2,
  BarChart3,
  Settings,
  Bot,
  FileSignature,
  Shield,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react';

export interface GuideStep {
  titleKey: string;
  contentKey: string;
}

export interface GuideSection {
  id: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  color: string;
  steps: GuideStep[];
}

export const guideSections: GuideSection[] = [
  {
    id: 'getting-started',
    icon: Lightbulb,
    titleKey: 'guide.sections.gettingStarted.title',
    descKey: 'guide.sections.gettingStarted.desc',
    color: 'bg-amber-500',
    steps: [
      { titleKey: 'guide.sections.gettingStarted.steps.register.title', contentKey: 'guide.sections.gettingStarted.steps.register.content' },
      { titleKey: 'guide.sections.gettingStarted.steps.company.title', contentKey: 'guide.sections.gettingStarted.steps.company.content' },
      { titleKey: 'guide.sections.gettingStarted.steps.navigate.title', contentKey: 'guide.sections.gettingStarted.steps.navigate.content' },
    ],
  },
  {
    id: 'employees',
    icon: Users,
    titleKey: 'guide.sections.employees.title',
    descKey: 'guide.sections.employees.desc',
    color: 'bg-indigo-500',
    steps: [
      { titleKey: 'guide.sections.employees.steps.add.title', contentKey: 'guide.sections.employees.steps.add.content' },
      { titleKey: 'guide.sections.employees.steps.profile.title', contentKey: 'guide.sections.employees.steps.profile.content' },
      { titleKey: 'guide.sections.employees.steps.import.title', contentKey: 'guide.sections.employees.steps.import.content' },
    ],
  },
  {
    id: 'attendance',
    icon: Clock,
    titleKey: 'guide.sections.attendance.title',
    descKey: 'guide.sections.attendance.desc',
    color: 'bg-teal-500',
    steps: [
      { titleKey: 'guide.sections.attendance.steps.checkin.title', contentKey: 'guide.sections.attendance.steps.checkin.content' },
      { titleKey: 'guide.sections.attendance.steps.rules.title', contentKey: 'guide.sections.attendance.steps.rules.content' },
      { titleKey: 'guide.sections.attendance.steps.leave.title', contentKey: 'guide.sections.attendance.steps.leave.content' },
      { titleKey: 'guide.sections.attendance.steps.reports.title', contentKey: 'guide.sections.attendance.steps.reports.content' },
    ],
  },
  {
    id: 'payroll',
    icon: Wallet,
    titleKey: 'guide.sections.payroll.title',
    descKey: 'guide.sections.payroll.desc',
    color: 'bg-emerald-500',
    steps: [
      { titleKey: 'guide.sections.payroll.steps.components.title', contentKey: 'guide.sections.payroll.steps.components.content' },
      { titleKey: 'guide.sections.payroll.steps.templates.title', contentKey: 'guide.sections.payroll.steps.templates.content' },
      { titleKey: 'guide.sections.payroll.steps.batch.title', contentKey: 'guide.sections.payroll.steps.batch.content' },
    ],
  },
  {
    id: 'recruitment',
    icon: UserPlus,
    titleKey: 'guide.sections.recruitment.title',
    descKey: 'guide.sections.recruitment.desc',
    color: 'bg-blue-500',
    steps: [
      { titleKey: 'guide.sections.recruitment.steps.posting.title', contentKey: 'guide.sections.recruitment.steps.posting.content' },
      { titleKey: 'guide.sections.recruitment.steps.candidates.title', contentKey: 'guide.sections.recruitment.steps.candidates.content' },
      { titleKey: 'guide.sections.recruitment.steps.interviews.title', contentKey: 'guide.sections.recruitment.steps.interviews.content' },
    ],
  },
  {
    id: 'contracts',
    icon: FileSignature,
    titleKey: 'guide.sections.contracts.title',
    descKey: 'guide.sections.contracts.desc',
    color: 'bg-violet-500',
    steps: [
      { titleKey: 'guide.sections.contracts.steps.create.title', contentKey: 'guide.sections.contracts.steps.create.content' },
      { titleKey: 'guide.sections.contracts.steps.manage.title', contentKey: 'guide.sections.contracts.steps.manage.content' },
    ],
  },
  {
    id: 'insurance',
    icon: Shield,
    titleKey: 'guide.sections.insurance.title',
    descKey: 'guide.sections.insurance.desc',
    color: 'bg-orange-500',
    steps: [
      { titleKey: 'guide.sections.insurance.steps.policy.title', contentKey: 'guide.sections.insurance.steps.policy.content' },
      { titleKey: 'guide.sections.insurance.steps.employee.title', contentKey: 'guide.sections.insurance.steps.employee.content' },
    ],
  },
  {
    id: 'company',
    icon: Building2,
    titleKey: 'guide.sections.company.title',
    descKey: 'guide.sections.company.desc',
    color: 'bg-rose-500',
    steps: [
      { titleKey: 'guide.sections.company.steps.info.title', contentKey: 'guide.sections.company.steps.info.content' },
      { titleKey: 'guide.sections.company.steps.departments.title', contentKey: 'guide.sections.company.steps.departments.content' },
      { titleKey: 'guide.sections.company.steps.members.title', contentKey: 'guide.sections.company.steps.members.content' },
    ],
  },
  {
    id: 'reports',
    icon: BarChart3,
    titleKey: 'guide.sections.reports.title',
    descKey: 'guide.sections.reports.desc',
    color: 'bg-cyan-500',
    steps: [
      { titleKey: 'guide.sections.reports.steps.overview.title', contentKey: 'guide.sections.reports.steps.overview.content' },
      { titleKey: 'guide.sections.reports.steps.export.title', contentKey: 'guide.sections.reports.steps.export.content' },
    ],
  },
  {
    id: 'uniai',
    icon: Bot,
    titleKey: 'guide.sections.uniai.title',
    descKey: 'guide.sections.uniai.desc',
    color: 'bg-purple-500',
    steps: [
      { titleKey: 'guide.sections.uniai.steps.chat.title', contentKey: 'guide.sections.uniai.steps.chat.content' },
      { titleKey: 'guide.sections.uniai.steps.tools.title', contentKey: 'guide.sections.uniai.steps.tools.content' },
    ],
  },
  {
    id: 'settings',
    icon: Settings,
    titleKey: 'guide.sections.settings.title',
    descKey: 'guide.sections.settings.desc',
    color: 'bg-gray-500',
    steps: [
      { titleKey: 'guide.sections.settings.steps.branding.title', contentKey: 'guide.sections.settings.steps.branding.content' },
      { titleKey: 'guide.sections.settings.steps.roles.title', contentKey: 'guide.sections.settings.steps.roles.content' },
    ],
  },
];
