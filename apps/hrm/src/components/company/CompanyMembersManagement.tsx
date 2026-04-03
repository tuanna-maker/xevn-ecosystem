import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Mail,
  UserPlus,
  Shield,
  ShieldCheck,
  UserCog,
  MoreHorizontal,
  Crown,
  User,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Calculator,
  Briefcase,
  Eye,
  Loader2,
  UsersRound,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSystemRoles } from '@/hooks/usePermissions';

interface Company {
  id: string;
  name: string;
  code: string | null;
}

interface CompanyMember {
  id: string;
  user_id: string;
  company_id: string;
  role: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_primary: boolean | null;
  status: string;
  invited_at: string | null;
  invited_by: string | null;
  employee_id: string | null;
  created_at: string;
  updated_at: string;
}

interface EmployeeOption {
  id: string;
  employee_code: string;
  full_name: string;
  email: string | null;
  department: string | null;
  position: string | null;
  company_id: string;
}

const memberFormSchema = z.object({
  email: z.string().email('Invalid email'),
  full_name: z.string().min(1, 'Required').max(100),
  role: z.string().min(1, 'Required'),
  company_id: z.string().min(1, 'Required'),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

const roleIcons: Record<string, React.ElementType> = {
  owner: Crown,
  admin: ShieldCheck,
  hr_manager: Shield,
  accountant: Calculator,
  recruiter: UserPlus,
  manager: Briefcase,
  employee: User,
  viewer: Eye,
  member: User,
};

const roleColors: Record<string, string> = {
  owner: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  hr_manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  accountant: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  recruiter: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  manager: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  employee: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  member: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export function CompanyMembersManagement() {
  const { t } = useTranslation();
  const { data: systemRoles = [] } = useSystemRoles();
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isLinkEmployeeDialogOpen, setIsLinkEmployeeDialogOpen] = useState(false);
  const [isBulkInviteDialogOpen, setIsBulkInviteDialogOpen] = useState(false);
  const [bulkInviteCompanyId, setBulkInviteCompanyId] = useState<string>('');
  const [bulkSelectedEmployees, setBulkSelectedEmployees] = useState<string[]>([]);
  const [bulkInviteLoading, setBulkInviteLoading] = useState(false);
  const [linkingMember, setLinkingMember] = useState<CompanyMember | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [editingMember, setEditingMember] = useState<CompanyMember | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [changingRoleMember, setChangingRoleMember] = useState<CompanyMember | null>(null);
  const [newRole, setNewRole] = useState<string>('');

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      email: '',
      full_name: '',
      role: 'employee',
      company_id: '',
    },
  });

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, code')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setCompanies((data as Company[]) || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_company_memberships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers((data as CompanyMember[]) || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: t('common.error'),
        description: t('company.memberLoadError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_code, full_name, email, department, position, company_id')
        .is('deleted_at', null)
        .order('full_name');

      if (error) throw error;
      setEmployees((data as EmployeeOption[]) || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchMembers();
    fetchEmployees();
  }, []);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      (member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesCompany = companyFilter === 'all' || member.company_id === companyFilter;
    return matchesSearch && matchesRole && matchesCompany;
  });

  const stats = {
    total: members.length,
    admins: members.filter((m) => m.role === 'admin' || m.role === 'owner').length,
    members: members.filter((m) => m.role === 'member').length,
    active: members.filter((m) => m.status === 'active').length,
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    return company?.name || 'N/A';
  };

  const handleAddMember = () => {
    setEditingMember(null);
    form.reset({
      email: '',
      full_name: '',
      role: 'employee',
      company_id: companies[0]?.id || '',
    });
    setIsDialogOpen(true);
  };

  const handleEditMember = (member: CompanyMember) => {
    setEditingMember(member);
    form.reset({
      email: member.email || '',
      full_name: member.full_name || '',
      role: member.role,
      company_id: member.company_id,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingMemberId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteMember = async () => {
    if (!deletingMemberId) return;

    try {
      const { error } = await supabase
        .from('user_company_memberships')
        .delete()
        .eq('id', deletingMemberId);

      if (error) throw error;

      setMembers(members.filter((m) => m.id !== deletingMemberId));
      toast({
        title: t('common.success'),
        description: t('company.memberDeleted'),
      });
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: t('common.error'),
        description: t('company.memberDeleteError'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingMemberId(null);
    }
  };

  const handleChangeRoleClick = (member: CompanyMember) => {
    setChangingRoleMember(member);
    setNewRole(member.role);
    setIsRoleDialogOpen(true);
  };

  const handleLinkEmployeeClick = (member: CompanyMember) => {
    setLinkingMember(member);
    setSelectedEmployeeId(member.employee_id || '');
    setIsLinkEmployeeDialogOpen(true);
  };

  const handleLinkEmployee = async () => {
    if (!linkingMember) return;
    const empId = selectedEmployeeId && selectedEmployeeId !== 'none' ? selectedEmployeeId : null;

    try {
      const { error } = await supabase
        .from('user_company_memberships')
        .update({ employee_id: empId })
        .eq('id', linkingMember.id);

      if (error) throw error;

      if (empId) {
        await syncMemberEmployee(linkingMember.id, empId);
      }

      await fetchMembers();
      await fetchEmployees();
      toast({
        title: t('common.success'),
        description: empId ? t('company.linkSyncSuccess') : t('company.unlinkSuccess'),
      });
    } catch (error) {
      console.error('Error linking employee:', error);
      toast({
        title: t('common.error'),
        description: t('company.linkError'),
        variant: 'destructive',
      });
    } finally {
      setIsLinkEmployeeDialogOpen(false);
      setLinkingMember(null);
    }
  };

  const syncMemberEmployee = async (membershipId: string, employeeId: string) => {
    const [{ data: member }, { data: employee }] = await Promise.all([
      supabase.from('user_company_memberships').select('*').eq('id', membershipId).single(),
      supabase.from('employees').select('*').eq('id', employeeId).single(),
    ]);

    if (!member || !employee) return;

    const memberUpdated = new Date(member.updated_at).getTime();
    const employeeUpdated = new Date(employee.updated_at).getTime();

    const employeeUpdates: Record<string, any> = {};
    if (member.full_name && memberUpdated > employeeUpdated) {
      employeeUpdates.full_name = member.full_name;
    }
    if (member.email && memberUpdated > employeeUpdated) {
      employeeUpdates.email = member.email;
    }
    if (member.avatar_url && memberUpdated > employeeUpdated) {
      employeeUpdates.avatar_url = member.avatar_url;
    }

    const memberUpdates: Record<string, any> = {};
    if (employee.full_name && employeeUpdated >= memberUpdated) {
      memberUpdates.full_name = employee.full_name;
    }
    if (employee.email && employeeUpdated >= memberUpdated) {
      memberUpdates.email = employee.email;
    }
    if (employee.avatar_url && employeeUpdated >= memberUpdated) {
      memberUpdates.avatar_url = employee.avatar_url;
    }

    const promises = [];
    if (Object.keys(employeeUpdates).length > 0) {
      promises.push(
        supabase.from('employees').update(employeeUpdates).eq('id', employeeId)
      );
    }
    if (Object.keys(memberUpdates).length > 0) {
      promises.push(
        supabase.from('user_company_memberships').update(memberUpdates).eq('id', membershipId)
      );
    }
    await Promise.all(promises);
  };

  const handleSyncMember = async (member: CompanyMember) => {
    if (!member.employee_id) {
      toast({
        title: t('common.error'),
        description: t('company.notLinked'),
        variant: 'destructive',
      });
      return;
    }

    try {
      await syncMemberEmployee(member.id, member.employee_id);
      await fetchMembers();
      await fetchEmployees();
      toast({
        title: t('common.success'),
        description: t('company.syncSuccess'),
      });
    } catch (error) {
      console.error('Error syncing:', error);
      toast({
        title: t('common.error'),
        description: t('company.syncError'),
        variant: 'destructive',
      });
    }
  };

  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return null;
    const emp = employees.find(e => e.id === employeeId);
    return emp ? `${emp.full_name} (${emp.employee_code})` : null;
  };

  // Employees that can be bulk-invited (have email, not already linked to a membership in selected company)
  const getUnlinkedEmployees = (companyId: string) => {
    return employees.filter(emp => {
      if (!emp.id || emp.company_id !== companyId) return false;
      const alreadyMember = members.some(
        m => m.company_id === companyId && m.employee_id === emp.id
      );
      return !alreadyMember;
    });
  };

  const handleBulkInvite = async () => {
    if (!bulkInviteCompanyId || bulkSelectedEmployees.length === 0) return;
    setBulkInviteLoading(true);

    try {
      const selectedEmps = employees.filter(e => bulkSelectedEmployees.includes(e.id));
      const empsWithEmail = selectedEmps.filter(emp => (emp as any).email);
      const empsWithoutEmail = selectedEmps.filter(emp => !(emp as any).email);

      if (empsWithoutEmail.length > 0) {
        toast({
          title: t('common.warning') || 'Cảnh báo',
          description: `${empsWithoutEmail.length} nhân viên không có email sẽ bị bỏ qua`,
          variant: 'destructive',
        });
      }

      if (empsWithEmail.length === 0) {
        toast({
          title: t('common.error'),
          description: 'Không có nhân viên nào có email để mời',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('invite-employee', {
        body: {
          company_id: bulkInviteCompanyId,
          employees: empsWithEmail.map(emp => ({
            email: (emp as any).email,
            full_name: emp.full_name,
            employee_id: emp.id,
          })),
        },
      });

      if (error) throw error;

      if (data?.failed > 0) {
        const failedEmails = data.results?.filter((r: any) => !r.success).map((r: any) => r.email).join(', ');
        toast({
          title: `Đã mời ${data.invited}/${data.total} nhân viên`,
          description: failedEmails ? `Lỗi: ${failedEmails}` : undefined,
          variant: data.invited > 0 ? 'default' : 'destructive',
        });
      } else {
        toast({
          title: t('common.success'),
          description: `Đã gửi email mời cho ${data.invited} nhân viên thành công`,
        });
      }

      await fetchMembers();
      setIsBulkInviteDialogOpen(false);
      setBulkSelectedEmployees([]);
    } catch (error) {
      console.error('Bulk invite error:', error);
      toast({
        title: t('common.error'),
        description: t('company.bulkInviteError'),
        variant: 'destructive',
      });
    } finally {
      setBulkInviteLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!changingRoleMember || !newRole) return;

    try {
      // Update old membership role
      const { error } = await supabase
        .from('user_company_memberships')
        .update({ role: newRole })
        .eq('id', changingRoleMember.id);

      if (error) throw error;

      // Update new permission system: delete old role, insert new
      if (changingRoleMember.user_id) {
        // Delete existing roles for this user+company
        await supabase
          .from('company_user_roles' as any)
          .delete()
          .eq('user_id', changingRoleMember.user_id)
          .eq('company_id', changingRoleMember.company_id);

        // Find system role by code
        const targetRole = systemRoles.find(r => r.code === newRole);
        if (targetRole) {
          await supabase
            .from('company_user_roles' as any)
            .insert({
              user_id: changingRoleMember.user_id,
              company_id: changingRoleMember.company_id,
              role_id: targetRole.id,
            });
        }
      }

      setMembers(members.map((m) => 
        m.id === changingRoleMember.id ? { ...m, role: newRole } : m
      ));
      toast({
        title: t('common.success'),
        description: t('company.roleUpdated'),
      });
    } catch (error) {
      console.error('Error changing role:', error);
      toast({
        title: t('common.error'),
        description: t('company.roleUpdateError'),
        variant: 'destructive',
      });
    } finally {
      setIsRoleDialogOpen(false);
      setChangingRoleMember(null);
    }
  };

  const onSubmit = async (values: MemberFormValues) => {
    try {
      const memberData = {
        email: values.email,
        full_name: values.full_name,
        role: values.role,
        company_id: values.company_id,
        user_id: crypto.randomUUID(),
        status: 'active',
        invited_at: new Date().toISOString(),
        invited_by: 'Admin',
      };

      if (editingMember) {
        const { error } = await supabase
          .from('user_company_memberships')
          .update({
            email: values.email,
            full_name: values.full_name,
            role: values.role,
            company_id: values.company_id,
          })
          .eq('id', editingMember.id);

        if (error) throw error;

        toast({
          title: t('common.success'),
          description: t('company.memberUpdated'),
        });
      } else {
        const { error } = await supabase
          .from('user_company_memberships')
          .insert([memberData]);

        if (error) throw error;

        toast({
          title: t('common.success'),
          description: t('company.memberCreated'),
        });
      }

      await fetchMembers();
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error saving member:', error);
      toast({
        title: t('common.error'),
        description: t('company.memberSaveError'),
        variant: 'destructive',
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const Icon = roleIcons[role as keyof typeof roleIcons] || User;
    const color = roleColors[role as keyof typeof roleColors] || roleColors.member;
    return (
      <Badge variant="secondary" className={cn('font-medium gap-1', color)}>
        <Icon className="w-3 h-3" />
        {t(`roles.${role}`)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { labelKey: string; color: string }> = {
      active: { labelKey: 'common.status.active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      pending: { labelKey: 'common.status.pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
      inactive: { labelKey: 'common.status.inactive', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
    };
    const config = statusMap[status] || statusMap.inactive;
    return (
      <Badge variant="secondary" className={cn('font-medium', config.color)}>
        {t(config.labelKey)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">{t('company.totalMembers')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-xs text-muted-foreground">{t('company.adminCount')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.members}</p>
                <p className="text-xs text-muted-foreground">{t('company.memberCount')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">{t('company.activeMembers')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('company.memberList')}
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-2" onClick={() => {
                setBulkInviteCompanyId(companies[0]?.id || '');
                setBulkSelectedEmployees([]);
                setIsBulkInviteDialogOpen(true);
              }}>
                <UsersRound className="w-4 h-4" />
                {t('company.bulkInvite')}
              </Button>
              <Button size="sm" className="gap-2" onClick={handleAddMember}>
                <Plus className="w-4 h-4" />
                {t('company.addMember')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('company.searchMember')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={t('nav.company')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('company.allCompanies')}</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder={t('company.role')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {systemRoles.map(role => (
                  <SelectItem key={role.code} value={role.code}>{t(`roles.${role.code}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>{t('company.members')}</TableHead>
                  <TableHead>{t('nav.company')}</TableHead>
                  <TableHead>{t('company.linkedEmployee')}</TableHead>
                  <TableHead>{t('company.role')}</TableHead>
                  <TableHead>{t('common.status.label')}</TableHead>
                  <TableHead>{t('company.joinDate')}</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        {t('common.loading')}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchTerm || roleFilter !== 'all' || companyFilter !== 'all'
                        ? t('company.noMembersMatch')
                        : t('company.noMembers')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar_url || undefined} alt={member.full_name || ''} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {member.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{member.full_name || t('company.notUpdated')}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {member.email || '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          {getCompanyName(member.company_id)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.employee_id ? (
                          <Badge variant="secondary" className="font-medium bg-primary/10 text-primary">
                            {getEmployeeName(member.employee_id) || t('company.linked')}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">{t('company.notLinked')}</span>
                        )}
                      </TableCell>
                      <TableCell>{getRoleBadge(member.role)}</TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {member.invited_at
                          ? format(new Date(member.invited_at), 'dd/MM/yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditMember(member)}>
                              <Edit className="w-4 h-4 mr-2" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRoleClick(member)}>
                              <UserCog className="w-4 h-4 mr-2" />
                              {t('company.changeRole')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleLinkEmployeeClick(member)}>
                              <Users className="w-4 h-4 mr-2" />
                              {member.employee_id ? t('company.changeLinkEmployee') : t('company.linkEmployee')}
                            </DropdownMenuItem>
                            {member.employee_id && (
                              <DropdownMenuItem onClick={() => handleSyncMember(member)}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                {t('company.syncData')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(member.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('company.removeFromCompany')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Member Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? t('company.editMember') : t('company.addMember')}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? t('company.updateMemberDesc')
                : t('company.addMemberDesc')}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('company.fullName')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t('company.fullNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('company.email')} *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('nav.company')} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('company.selectCompany')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('company.role')} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('company.selectRole')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {systemRoles.map(role => {
                          const Icon = roleIcons[role.code] || User;
                          return (
                            <SelectItem key={role.code} value={role.code}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {t(`roles.${role.code}`)}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit">
                  {editingMember ? t('common.update') : t('common.add')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('company.changeRoleTitle')}</DialogTitle>
            <DialogDescription>
              {t('company.selectNewRole', { name: changingRoleMember?.full_name })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {systemRoles.map((role) => {
              const Icon = roleIcons[role.code] || User;
              return (
                <div
                  key={role.code}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    newRole === role.code ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  )}
                  onClick={() => setNewRole(role.code)}
                >
                  <Icon className={cn('w-5 h-5', newRole === role.code ? 'text-primary' : 'text-muted-foreground')} />
                  <div className="flex-1">
                    <p className="font-medium">{t(`roles.${role.code}`)}</p>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                  {newRole === role.code && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleChangeRole}>
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('company.deleteMemberConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('company.deleteMemberDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Link Employee Dialog */}
      <Dialog open={isLinkEmployeeDialogOpen} onOpenChange={setIsLinkEmployeeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('company.linkEmployeeTitle')}</DialogTitle>
            <DialogDescription>
              {t('company.linkEmployeeDesc', { name: linkingMember?.full_name })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder={t('company.selectEmployee')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— {t('company.noLink')} —</SelectItem>
                {employees
                  .filter(emp => {
                    const alreadyLinked = members.some(
                      m => m.employee_id === emp.id && m.id !== linkingMember?.id
                    );
                    return !alreadyLinked;
                  })
                  .map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.employee_code}) {emp.department ? `- ${emp.department}` : ''}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsLinkEmployeeDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleLinkEmployee}>
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Invite Dialog */}
      <Dialog open={isBulkInviteDialogOpen} onOpenChange={setIsBulkInviteDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UsersRound className="w-5 h-5" />
              {t('company.bulkInviteTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('company.bulkInviteDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select value={bulkInviteCompanyId} onValueChange={(v) => {
              setBulkInviteCompanyId(v);
              setBulkSelectedEmployees([]);
            }}>
              <SelectTrigger>
                <SelectValue placeholder={t('company.selectCompany')} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {bulkInviteCompanyId && (() => {
              const unlinked = getUnlinkedEmployees(bulkInviteCompanyId);
              return unlinked.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t('company.allEmployeesLinked')}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {t('company.unlinkedCount', { count: unlinked.length })}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (bulkSelectedEmployees.length === unlinked.length) {
                          setBulkSelectedEmployees([]);
                        } else {
                          setBulkSelectedEmployees(unlinked.map(e => e.id));
                        }
                      }}
                    >
                      {bulkSelectedEmployees.length === unlinked.length
                        ? t('common.deselectAll')
                        : t('common.selectAll')}
                    </Button>
                  </div>
                  <div className="border rounded-lg max-h-[350px] overflow-y-auto">
                    {unlinked.map((emp) => {
                      const isSelected = bulkSelectedEmployees.includes(emp.id);
                      return (
                        <div
                          key={emp.id}
                          className={cn(
                            'flex items-center gap-3 p-3 border-b last:border-b-0 cursor-pointer transition-colors',
                            isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'
                          )}
                          onClick={() => {
                            setBulkSelectedEmployees(prev =>
                              isSelected
                                ? prev.filter(id => id !== emp.id)
                                : [...prev, emp.id]
                            );
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded border-muted-foreground"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{emp.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {emp.employee_code} {emp.department ? `• ${emp.department}` : ''} {emp.position ? `• ${emp.position}` : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsBulkInviteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleBulkInvite}
              disabled={bulkInviteLoading || bulkSelectedEmployees.length === 0}
              className="gap-2"
            >
              {bulkInviteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('company.bulkInviteBtn', { count: bulkSelectedEmployees.length })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
