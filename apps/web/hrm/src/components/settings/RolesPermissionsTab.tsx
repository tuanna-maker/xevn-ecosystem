import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Crown,
  UserCog,
  Users,
  Calculator,
  UserSearch,
  Briefcase,
  Eye,
  User,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useSystemRoles } from '@/hooks/usePermissions';
import { usePermissions } from '@/hooks/usePermissions';
import {
  useAllPermissions,
  useAllRolePermissions,
  useToggleRolePermission,
  type Permission,
  type RolePermissionMap,
} from '@/hooks/useRolePermissionsManagement';

const ROLE_ICONS: Record<string, React.ElementType> = {
  owner: Crown,
  admin: Shield,
  hr_manager: UserCog,
  accountant: Calculator,
  recruiter: UserSearch,
  manager: Briefcase,
  employee: User,
  viewer: Eye,
};

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-amber-500',
  admin: 'bg-red-500',
  hr_manager: 'bg-indigo-500',
  accountant: 'bg-emerald-500',
  recruiter: 'bg-violet-500',
  manager: 'bg-blue-500',
  employee: 'bg-slate-500',
  viewer: 'bg-gray-400',
};

const getModuleLabels = (t: any): Record<string, string> => ({
  dashboard: t('sidebar.dashboard', 'Dashboard'),
  employees: t('sidebar.employees', 'Nhân viên'),
  contracts: t('sidebar.contracts', 'Hợp đồng'),
  insurance: t('sidebar.insurance', 'Bảo hiểm'),
  decisions: t('sidebar.decisions', 'Quyết định'),
  recruitment: t('sidebar.recruitment', 'Tuyển dụng'),
  attendance: t('sidebar.attendance', 'Chấm công'),
  payroll: t('sidebar.payroll', 'Bảng lương'),
  company: t('sidebar.company', 'Công ty'),
  reports: t('sidebar.reports', 'Báo cáo'),
  settings: t('sidebar.settings', 'Cài đặt'),
  tasks: t('sidebar.tasks', 'Công việc'),
  ai: 'UniAI',
});

const getActionLabel = (t: any, action: string): string => {
  return t(`settings.actionLabels.${action}`, action);
};

interface GroupedPermissions {
  [module: string]: Permission[];
}

function groupPermissions(permissions: Permission[]): GroupedPermissions {
  const grouped: GroupedPermissions = {};
  permissions.forEach((p) => {
    if (!grouped[p.module]) grouped[p.module] = [];
    grouped[p.module].push(p);
  });
  return grouped;
}

interface RoleCardProps {
  role: { id: string; code: string; name: string; description: string; level: number };
  permsByModule: GroupedPermissions;
  rolePermMap: RolePermissionMap;
  canEdit: boolean;
  onToggle: (roleId: string, permissionId: string, has: boolean) => void;
  isToggling: boolean;
}

function RoleCard({ role, permsByModule, rolePermMap, canEdit, onToggle, isToggling }: RoleCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const Icon = ROLE_ICONS[role.code] || Users;
  const color = ROLE_COLORS[role.code] || 'bg-primary';
  const rolePerms = rolePermMap[role.id] || new Set();
  const totalPerms = rolePerms.size;

  // Owner cannot be edited
  const isReadOnly = role.code === 'owner' || !canEdit;

  return (
    <div className="border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm', color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{t(`roles.${role.code}`, role.name)}</p>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Lv.{role.level}
              </Badge>
              {isReadOnly && canEdit && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                  {t('settings.readOnly', 'Chỉ xem')}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{role.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            {totalPerms} {t('settings.permissionCount', 'quyền')}
          </Badge>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t bg-muted/20 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(permsByModule).map(([module, perms]) => (
              <div key={module} className="rounded-lg border bg-card p-3">
                <h4 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {getModuleLabels(t)[module] || module}
                </h4>
                <ul className="space-y-1.5">
                  {perms.map((perm) => {
                    const has = rolePerms.has(perm.id);
                    return (
                      <li key={perm.id} className="flex items-center gap-2 text-xs">
                        {isReadOnly ? (
                          <>
                            {has ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                            )}
                            <span className={cn('text-muted-foreground', !has && 'opacity-40')}>
                              {perm.description}
                            </span>
                          </>
                        ) : (
                          <>
                            <Checkbox
                              id={`${role.id}-${perm.id}`}
                              checked={has}
                              disabled={isToggling}
                              onCheckedChange={() => onToggle(role.id, perm.id, has)}
                              className="h-3.5 w-3.5"
                            />
                            <label
                              htmlFor={`${role.id}-${perm.id}`}
                              className="text-muted-foreground cursor-pointer select-none"
                            >
                              {perm.description}
                            </label>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function RolesPermissionsTab() {
  const { t } = useTranslation();
  const { data: roles = [], isLoading: rolesLoading } = useSystemRoles();
  const { data: allPermissions = [], isLoading: permsLoading } = useAllPermissions();
  const { isAdmin } = usePermissions();

  const sortedRoles = useMemo(
    () => [...roles].sort((a, b) => b.level - a.level),
    [roles],
  );

  const roleIds = useMemo(() => sortedRoles.map((r) => r.id), [sortedRoles]);
  const { data: rolePermMap = {}, isLoading: mapLoading } = useAllRolePermissions(roleIds);
  const { toggle, isLoading: isToggling } = useToggleRolePermission();

  const permsByModule = useMemo(() => groupPermissions(allPermissions), [allPermissions]);

  const isLoading = rolesLoading || permsLoading || mapLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          {t('settings.roles')}
        </CardTitle>
        <CardDescription>
          {isAdmin
            ? t('settings.rolesDescAdmin', 'Cấu hình quyền hạn cho từng vai trò trong hệ thống. Vai trò Owner không thể chỉnh sửa.')
            : t('settings.rolesDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                permsByModule={permsByModule}
                rolePermMap={rolePermMap}
                canEdit={isAdmin}
                onToggle={toggle}
                isToggling={isToggling}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
