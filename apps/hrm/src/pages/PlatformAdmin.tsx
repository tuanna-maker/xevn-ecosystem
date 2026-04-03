import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import {
  Building2, Users, BarChart3, Search, MoreHorizontal,
  CheckCircle2, Lock, Unlock, Eye, TrendingUp, Activity,
  UserPlus, Shield, ArrowUpRight, Globe, Plus, Trash2, Mail,
  ChevronRight, ExternalLink, UserCog, AlertTriangle,
  CreditCard, Bell, Settings2, ScrollText, Menu, LogOut,
  Info, AlertCircle, ToggleLeft, ToggleRight,
  Clock, User, Loader2, BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { toast } from 'sonner';
import {
  usePlatformStats, usePlatformCompanies, usePlatformUsers, useUpdateCompanyStatus,
  usePlatformAdmins, useAddPlatformAdmin, useRemovePlatformAdmin, useCompanyMembers,
  useAuditLogs, useSystemAnnouncements, useCreateAnnouncement, useToggleAnnouncement,
  useDeleteAnnouncement, useSystemConfig, useUpdateSystemConfig,
  usePlatformSubscriptions, useUpdateTrialDate, useActivateSubscription,
  useCreateCompanyAdmin, useAllCompanyAdmins,
} from '@/hooks/usePlatformAdmin';
import { useSubscriptionPlans, useCreatePlan, useUpdatePlan, useDeletePlan, useActiveSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { GuideManagementPage } from '@/components/platform/GuideManagementPage';

// Helper for admin translations
const useAdminT = () => {
  const { t, i18n } = useTranslation();
  const a = (key: string, fallback?: string) => t(`platformAdmin.${key}`, fallback || key) as string;
  return { a, t, i18n };
};

type AdminPage = 'stats' | 'companies' | 'users' | 'admins' | 'logs' | 'announcements' | 'config' | 'subscriptions' | 'trials' | 'guide';

function useNavItems() {
  const { a } = useAdminT();
  return [
    { key: 'stats' as AdminPage, label: a('overview'), icon: BarChart3, group: a('groupMain') },
    { key: 'companies' as AdminPage, label: a('companies'), icon: Building2, group: a('groupMain') },
    { key: 'users' as AdminPage, label: a('users'), icon: Users, group: a('groupMain') },
    { key: 'admins' as AdminPage, label: a('admins'), icon: UserCog, group: a('groupMain') },
    { key: 'trials' as AdminPage, label: a('trials', 'Dùng thử'), icon: Clock, group: a('groupMain') },
    { key: 'logs' as AdminPage, label: a('logs'), icon: ScrollText, group: a('groupSystem') },
    { key: 'announcements' as AdminPage, label: a('announcements'), icon: Bell, group: a('groupSystem') },
    { key: 'config' as AdminPage, label: a('config'), icon: Settings2, group: a('groupSystem') },
    { key: 'subscriptions' as AdminPage, label: a('subscriptions'), icon: CreditCard, group: a('groupSystem') },
    { key: 'guide' as AdminPage, label: a('guide', 'Hướng dẫn SD'), icon: BookOpen, group: a('groupSystem') },
  ];
}

// ─── Admin Language Toggle (VI/EN only) ──────────────────────
function AdminLanguageToggle() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const toggle = () => {
    const next = isEn ? 'vi' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('language', next);
  };

  return (
    <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={toggle}>
      <Globe className="w-3.5 h-3.5" />
      <span>{isEn ? '🇺🇸 EN' : '🇻🇳 VI'}</span>
    </Button>
  );
}

// ─── Stats Page ──────────────────────────────────────────────
function StatsPage() {
  const { a } = useAdminT();
  const { data: stats, isLoading } = usePlatformStats();
  const { data: companies = [] } = usePlatformCompanies();

  const cards = [
    { label: a('totalCompanies'), value: stats?.totalCompanies ?? 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
    { label: a('activeLabel'), value: stats?.activeCompanies ?? 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950' },
    { label: a('newMonth'), value: stats?.newCompaniesThisMonth ?? 0, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950' },
    { label: a('totalUsers'), value: stats?.totalUsers ?? 0, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
    { label: a('newUsers'), value: stats?.newUsersThisMonth ?? 0, icon: UserPlus, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-950' },
    { label: a('totalEmployees'), value: stats?.totalEmployees ?? 0, icon: Activity, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950' },
    { label: a('activeEmployees'), value: stats?.activeEmployees ?? 0, icon: ArrowUpRight, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950' },
  ];

  const suspendedCount = companies.filter((c: any) => c.status !== 'active').length;
  const activeRate = stats?.totalCompanies ? Math.round(((stats.activeCompanies ?? 0) / stats.totalCompanies) * 100) : 0;
  const employeeActiveRate = stats?.totalEmployees ? Math.round(((stats.activeEmployees ?? 0) / stats.totalEmployees) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-3">
        {cards.map((card) => (
          <Card key={card.label} className="border-none shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${card.bg} shrink-0`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-foreground">{isLoading ? '—' : card.value.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground truncate">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{a('activeCompanyRate')}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold">{activeRate}%</span>
              <span className="text-xs text-muted-foreground pb-1">({stats?.activeCompanies ?? 0}/{stats?.totalCompanies ?? 0})</span>
            </div>
            <Progress value={activeRate} className="h-2" />
            {suspendedCount > 0 && <p className="text-xs text-destructive mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{suspendedCount} {a('locked')}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{a('activeEmployeeRate')}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold">{employeeActiveRate}%</span>
              <span className="text-xs text-muted-foreground pb-1">({stats?.activeEmployees ?? 0}/{stats?.totalEmployees ?? 0})</span>
            </div>
            <Progress value={employeeActiveRate} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{a('avgEmployeePerCompany')}</CardTitle></CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{stats?.totalCompanies ? Math.round((stats?.totalEmployees ?? 0) / stats.totalCompanies) : 0}</span>
            <span className="text-xs text-muted-foreground ml-1">{a('employees')}</span>
          </CardContent>
        </Card>
      </div>

      {companies.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">{a('topCompanies')}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companies.sort((a: any, b: any) => (b.active_employee_count ?? 0) - (a.active_employee_count ?? 0)).slice(0, 5).map((c: any, i: number) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-5">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.industry || '—'}</p>
                  </div>
                  <Badge variant="secondary">{c.active_employee_count ?? 0} {a('employeeCount')}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Company Detail Dialog ───────────────────────────────────
function CompanyDetailDialog({ company, open, onOpenChange }: { company: any; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { a } = useAdminT();
  const { data: members = [], isLoading } = useCompanyMembers(company?.id ?? null);
  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" />{company.name}</DialogTitle>
          <DialogDescription>{a('companyDetail')}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">{a('industry')}:</span><p className="font-medium">{company.industry || '—'}</p></div>
          <div><span className="text-muted-foreground">{a('status')}:</span><p><Badge variant={company.status === 'active' ? 'default' : 'destructive'}>{company.status === 'active' ? a('active') : a('suspended')}</Badge></p></div>
          <div><span className="text-muted-foreground">{a('phone')}:</span><p className="font-medium">{company.phone || '—'}</p></div>
          <div><span className="text-muted-foreground">{a('email')}:</span><p className="font-medium">{company.email || '—'}</p></div>
          <div><span className="text-muted-foreground">{a('website')}:</span><p className="font-medium">{company.website ? <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">{company.website}<ExternalLink className="w-3 h-3" /></a> : '—'}</p></div>
          <div><span className="text-muted-foreground">{a('taxCode')}:</span><p className="font-medium">{company.tax_code || '—'}</p></div>
          <div className="col-span-2"><span className="text-muted-foreground">{a('address')}:</span><p className="font-medium">{company.address || '—'}</p></div>
        </div>
        <Separator />
        <div className="flex gap-4">
          {[{ v: company.member_count ?? 0, l: a('members') }, { v: company.active_employee_count ?? 0, l: a('employees') }].map(s => (
            <Card key={s.l} className="flex-1 border-none bg-muted/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{s.v}</p><p className="text-xs text-muted-foreground">{s.l}</p></CardContent></Card>
          ))}
        </div>
        <Separator />
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4" />{a('members')} ({members.length})</h3>
          {isLoading ? <p className="text-sm text-muted-foreground">{a('loading')}</p> : members.length === 0 ? <p className="text-sm text-muted-foreground">{a('none')}</p> : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {members.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="min-w-0"><p className="text-sm font-medium truncate">{m.full_name || m.email || '—'}</p><p className="text-xs text-muted-foreground">{m.email}</p></div>
                  <div className="flex items-center gap-2"><Badge variant="outline" className="text-xs capitalize">{m.role}</Badge></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create Company Dialog ───────────────────────────────────
function CreateCompanyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { a } = useAdminT();
  const createCompany = useCreateCompanyAdmin();
  const [form, setForm] = useState({ name: '', industry: '', phone: '', email: '', website: '', address: '', tax_code: '' });

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error(a('companyNameRequired')); return; }
    createCompany.mutate(form, {
      onSuccess: (data) => {
        toast.success(`${a('companyCreatedSuccess')} ${data.name}`);
        setForm({ name: '', industry: '', phone: '', email: '', website: '', address: '', tax_code: '' });
        onOpenChange(false);
      },
      onError: () => toast.error(a('failed')),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" />{a('createCompanyTitle')}</DialogTitle>
          <DialogDescription>{a('createCompanyDesc')}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Label>{a('name')} <span className="text-destructive">*</span></Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={a('companyNamePlaceholder')} />
          </div>
          <div>
            <Label>{a('industry')}</Label>
            <Input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} placeholder={a('industryPlaceholder')} />
          </div>
          <div>
            <Label>{a('taxCode')}</Label>
            <Input value={form.tax_code} onChange={e => setForm({ ...form, tax_code: e.target.value })} />
          </div>
          <div>
            <Label>{a('phone')}</Label>
            <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label>{a('email')}</Label>
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label>{a('website')}</Label>
            <Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
          </div>
          <div className="sm:col-span-2">
            <Label>{a('address')}</Label>
            <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{a('cancel')}</Button>
          <Button onClick={handleSubmit} disabled={createCompany.isPending}>
            {createCompany.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{a('processing')}</> : <><Plus className="w-4 h-4 mr-2" />{a('createCompanyBtn')}</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create Company Admin Dialog ─────────────────────────────
function CreateCompanyAdminDialog({ company, open, onOpenChange }: { company: any; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { a } = useAdminT();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'admin' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      toast.error(a('fillRequired', 'Vui lòng điền đầy đủ thông tin bắt buộc'));
      return;
    }
    if (form.password.length < 8) {
      toast.error(a('passwordMinLength', 'Mật khẩu tối thiểu 8 ký tự'));
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('create-company-admin', {
        body: {
          email: form.email.trim(),
          password: form.password,
          full_name: form.full_name.trim() || undefined,
          company_id: company.id,
          role: form.role,
        },
      });
      if (res.error || res.data?.error) {
        toast.error(res.data?.error || res.error?.message || a('failed'));
      } else {
        toast.success(
          res.data?.is_existing_user
            ? `Đã gán quyền ${form.role} cho ${form.email} tại ${company.name}`
            : `Đã tạo tài khoản ${form.email} và gán quyền ${form.role} tại ${company.name}`
        );
        setForm({ email: '', password: '', full_name: '', role: 'admin' });
        queryClient.invalidateQueries({ queryKey: ['platform-all-company-admins'] });
        queryClient.invalidateQueries({ queryKey: ['platform-company-members', company.id] });
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err.message || a('failed'));
    } finally {
      setLoading(false);
    }
  };

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            {a('createAdminAccount', 'Tạo tài khoản Admin')}
          </DialogTitle>
          <DialogDescription>
            {a('createAdminDesc', 'Tạo tài khoản quản trị cho công ty')} <span className="font-semibold">{company.name}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>{a('email')} <span className="text-destructive">*</span></Label>
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="admin@company.com" />
          </div>
          <div>
            <Label>{a('password', 'Mật khẩu')} <span className="text-destructive">*</span></Label>
            <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Tối thiểu 8 ký tự" />
          </div>
          <div>
            <Label>{a('fullName', 'Họ tên')}</Label>
            <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <Label>{a('role', 'Vai trò')}</Label>
            <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="hr_manager">HR Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{a('cancel')}</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{a('processing')}</> : <><UserPlus className="w-4 h-4 mr-2" />{a('createAccount', 'Tạo tài khoản')}</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Companies Page ──────────────────────────────────────────
function CompaniesPage() {
  const { a } = useAdminT();
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createAdminCompany, setCreateAdminCompany] = useState<any>(null);
  const { data: companies = [], isLoading } = usePlatformCompanies();
  const { data: allAdmins = [] } = useAllCompanyAdmins();
  const updateStatus = useUpdateCompanyStatus();

  // Group admins by company_id
  const adminsByCompany: Record<string, any[]> = {};
  allAdmins.forEach((m: any) => {
    if (!adminsByCompany[m.company_id]) adminsByCompany[m.company_id] = [];
    adminsByCompany[m.company_id].push(m);
  });

  const filtered = companies.filter((c: any) => c.name?.toLowerCase().includes(search.toLowerCase()) || c.industry?.toLowerCase().includes(search.toLowerCase()));

  const handleToggle = (c: any) => {
    const s = c.status === 'active' ? 'suspended' : 'active';
    updateStatus.mutate({ companyId: c.id, status: s }, {
      onSuccess: () => toast.success(`${s === 'active' ? a('unlockedSuccess') : a('lockedSuccess')} ${c.name}`),
      onError: () => toast.error(a('failed')),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder={a('searchCompanies')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{filtered.length} {a('companyCount')}</Badge>
          <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1" /><span className="hidden sm:inline">{a('createCompanyBtn')}</span><span className="sm:hidden">+</span></Button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>{a('name')}</TableHead><TableHead className="hidden md:table-cell">{a('industry')}</TableHead><TableHead className="hidden lg:table-cell">{a('adminAccounts', 'Admin Accounts')}</TableHead><TableHead className="text-center hidden sm:table-cell">{a('memberCount')}</TableHead><TableHead className="text-center">{a('employeeCount')}</TableHead><TableHead>{a('status')}</TableHead><TableHead className="hidden sm:table-cell">{a('createdDate')}</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{a('loading')}</TableCell></TableRow>
              : filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{a('noData')}</TableCell></TableRow>
              : filtered.map((c: any) => {
                const companyAdmins = adminsByCompany[c.id] || [];
                return (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedCompany(c); setDetailOpen(true); }}>
                    <TableCell className="font-medium"><div className="flex items-center gap-1">{c.name}<ChevronRight className="w-3 h-3 text-muted-foreground" /></div></TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">{c.industry || '—'}</TableCell>
                    <TableCell className="max-w-[250px] hidden lg:table-cell">
                      {companyAdmins.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {companyAdmins.map((adm: any) => (
                            <Badge key={adm.id} variant="outline" className="text-xs font-normal gap-1">
                              <Shield className="w-3 h-3 text-primary" />
                              <span className="truncate max-w-[120px]">{adm.email}</span>
                              <span className="text-muted-foreground capitalize">({adm.role})</span>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell">{c.member_count ?? 0}</TableCell>
                    <TableCell className="text-center">{c.active_employee_count ?? 0}</TableCell>
                    <TableCell><Badge variant={c.status === 'active' ? 'default' : 'destructive'} className="text-xs">{c.status === 'active' ? a('active') : a('suspended')}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-xs hidden sm:table-cell">{c.created_at ? format(new Date(c.created_at), 'dd/MM/yyyy') : '—'}</TableCell>
                    <TableCell>
                      <DropdownMenu><DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); setSelectedCompany(c); setDetailOpen(true); }}><Eye className="w-4 h-4 mr-2" />{a('view')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); handleToggle(c); }}>{c.status === 'active' ? <><Lock className="w-4 h-4 mr-2" />{a('lock')}</> : <><Unlock className="w-4 h-4 mr-2" />{a('unlock')}</>}</DropdownMenuItem>
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); setCreateAdminCompany(c); }}><UserPlus className="w-4 h-4 mr-2" />{a('createAdminAccount', 'Tạo Admin')}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
      <CompanyDetailDialog company={selectedCompany} open={detailOpen} onOpenChange={setDetailOpen} />
      <CreateCompanyDialog open={createOpen} onOpenChange={setCreateOpen} />
      <CreateCompanyAdminDialog company={createAdminCompany} open={!!createAdminCompany} onOpenChange={(v) => { if (!v) setCreateAdminCompany(null); }} />
    </div>
  );
}

// ─── Users Page ──────────────────────────────────────────────
function UsersPage() {
  const { a } = useAdminT();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { data: users = [], isLoading } = usePlatformUsers();
  const filtered = users.filter((u: any) => u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder={a('searchUsers')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Badge variant="secondary">{filtered.length} {a('usersCount')}</Badge>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>{a('fullName')}</TableHead><TableHead>{a('email')}</TableHead><TableHead className="text-center hidden sm:table-cell">{a('company')}</TableHead><TableHead className="hidden md:table-cell">{a('companyName')}</TableHead><TableHead className="hidden sm:table-cell">{a('onboarding')}</TableHead><TableHead className="hidden sm:table-cell">{a('createdDate')}</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{a('loading')}</TableCell></TableRow>
              : filtered.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{a('noData')}</TableCell></TableRow>
              : filtered.map((u: any) => (
                <TableRow key={u.profile_id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedUser(u)}>
                  <TableCell className="font-medium">{u.full_name || '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-xs sm:text-sm">{u.email || '—'}</TableCell>
                  <TableCell className="text-center hidden sm:table-cell">{u.company_count ?? 0}</TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-[180px] truncate hidden md:table-cell">{u.company_names || '—'}</TableCell>
                  <TableCell className="hidden sm:table-cell"><Badge variant={u.onboarding_completed ? 'default' : 'secondary'} className="text-xs">{u.onboarding_completed ? 'Done' : 'No'}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-xs hidden sm:table-cell">{u.created_at ? format(new Date(u.created_at), 'dd/MM/yyyy') : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" />{selectedUser?.full_name || 'User'}</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">{a('email')}:</span><p className="font-medium">{selectedUser.email}</p></div>
              <div><span className="text-muted-foreground">{a('phone')}:</span><p className="font-medium">{selectedUser.phone || '—'}</p></div>
              <div><span className="text-muted-foreground">{a('jobTitle')}:</span><p className="font-medium">{selectedUser.job_title || '—'}</p></div>
              <div><span className="text-muted-foreground">{a('regDate')}:</span><p className="font-medium">{selectedUser.created_at ? format(new Date(selectedUser.created_at), 'dd/MM/yyyy') : '—'}</p></div>
              {selectedUser.company_names && (
                <div className="col-span-2"><span className="text-muted-foreground">{a('company')}:</span><div className="flex flex-wrap gap-1 mt-1">{selectedUser.company_names.split(', ').map((n: string, i: number) => <Badge key={i} variant="outline">{n}</Badge>)}</div></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Admins Page ─────────────────────────────────────────────
function AdminsPage() {
  const { a } = useAdminT();
  const { user } = useAuth();
  const { data: admins = [], isLoading } = usePlatformAdmins();
  const addAdmin = useAddPlatformAdmin();
  const removeAdmin = useRemovePlatformAdmin();
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<any>(null);
  const [email, setEmail] = useState('');

  const handleAdd = () => {
    if (!email.trim()) return;
    addAdmin.mutate({ email: email.trim() }, {
      onSuccess: () => { toast.success(a('added')); setEmail(''); setAddOpen(false); },
      onError: (e: any) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div><h3 className="text-base font-semibold">Platform Admins</h3><p className="text-sm text-muted-foreground">{a('adminAccounts')}</p></div>
        <Button onClick={() => setAddOpen(true)} size="sm"><Plus className="w-4 h-4 mr-1" />{a('add')}</Button>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>{a('email')}</TableHead><TableHead className="hidden sm:table-cell">{a('userId')}</TableHead><TableHead className="hidden md:table-cell">{a('grantedBy')}</TableHead><TableHead className="hidden sm:table-cell">{a('grantedDate')}</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{a('loading')}</TableCell></TableRow>
              : admins.map((ad: any) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium"><div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary shrink-0" /><span className="truncate">{ad.email || '—'}</span></div></TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono hidden sm:table-cell">{ad.user_id?.slice(0, 8)}...</TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{ad.granted_by || '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-xs hidden sm:table-cell">{ad.granted_at ? format(new Date(ad.granted_at), 'dd/MM/yyyy HH:mm') : '—'}</TableCell>
                  <TableCell>{ad.user_id !== user?.id && <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setRemoveTarget(ad)}><Trash2 className="w-4 h-4" /></Button>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{a('addAdmin')}</DialogTitle><DialogDescription>{a('enterEmail')}</DialogDescription></DialogHeader>
          <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-9" onKeyDown={e => e.key === 'Enter' && handleAdd()} /></div>
          <p className="text-xs text-muted-foreground">{a('adminWarning')}</p>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>{a('cancel')}</Button><Button onClick={handleAdd} disabled={addAdmin.isPending || !email.trim()}>{addAdmin.isPending ? a('processing') : a('add')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{a('confirmDelete')}</AlertDialogTitle><AlertDialogDescription>{a('confirmDeleteAdmin')} <strong>{removeTarget?.email}</strong>?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{a('cancel')}</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => removeTarget && removeAdmin.mutate({ adminId: removeTarget.id, email: removeTarget.email }, { onSuccess: () => { toast.success(a('deleted')); setRemoveTarget(null); } })}>{a('delete')}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Audit Logs Page ─────────────────────────────────────────
function LogsPage() {
  const { a } = useAdminT();
  const [search, setSearch] = useState('');
  const { data: logs = [], isLoading } = useAuditLogs(200);

  const filtered = logs.filter((l: any) =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    l.entity_name?.toLowerCase().includes(search.toLowerCase())
  );

  const actionLabels: Record<string, { label: string; color: string }> = {
    company_locked: { label: a('actionLockCompany'), color: 'text-destructive' },
    company_unlocked: { label: a('actionUnlockCompany'), color: 'text-emerald-600' },
    admin_added: { label: a('actionAddAdmin'), color: 'text-blue-600' },
    admin_removed: { label: a('actionRemoveAdmin'), color: 'text-orange-600' },
    announcement_created: { label: a('actionCreateAnnouncement'), color: 'text-violet-600' },
    config_updated: { label: a('actionUpdateConfig'), color: 'text-cyan-600' },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder={a('searchLogs')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Badge variant="secondary">{filtered.length} {a('records')}</Badge>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="hidden sm:table-cell">{a('time')}</TableHead><TableHead>{a('action')}</TableHead><TableHead>{a('performer')}</TableHead><TableHead className="hidden md:table-cell">{a('target')}</TableHead><TableHead className="hidden lg:table-cell">{a('details')}</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{a('loading')}</TableCell></TableRow>
              : filtered.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{a('noLogs')}</TableCell></TableRow>
              : filtered.map((l: any) => {
                const al = actionLabels[l.action] || { label: l.action, color: 'text-foreground' };
                return (
                  <TableRow key={l.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap hidden sm:table-cell"><Clock className="w-3 h-3 inline mr-1" />{l.created_at ? format(new Date(l.created_at), 'dd/MM/yyyy HH:mm:ss') : '—'}</TableCell>
                    <TableCell><span className={`text-xs sm:text-sm font-medium ${al.color}`}>{al.label}</span></TableCell>
                    <TableCell className="text-muted-foreground text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{l.user_email || '—'}</TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{l.entity_name || l.entity_id || '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate hidden lg:table-cell">{l.details ? JSON.stringify(l.details) : '—'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

// ─── Announcements Page ──────────────────────────────────────
function AnnouncementsPage() {
  const { a } = useAdminT();
  const { user } = useAuth();
  const { data: items = [], isLoading } = useSystemAnnouncements();
  const create = useCreateAnnouncement();
  const toggle = useToggleAnnouncement();
  const del = useDeleteAnnouncement();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'info', priority: 'normal' });
  const [delTarget, setDelTarget] = useState<any>(null);

  const handleCreate = () => {
    if (!form.title || !form.content) return;
    create.mutate({ ...form, created_by: user?.id, created_by_email: user?.email }, {
      onSuccess: () => { toast.success(a('createdAnnouncement')); setForm({ title: '', content: '', type: 'info', priority: 'normal' }); setCreateOpen(false); },
      onError: () => toast.error(a('failed')),
    });
  };

  const typeIcon = (t: string) => t === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : t === 'error' ? <AlertCircle className="w-4 h-4 text-destructive" /> : <Info className="w-4 h-4 text-blue-500" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h3 className="text-base font-semibold">{a('systemAnnouncements')}</h3><p className="text-sm text-muted-foreground">{a('sendToAllUsers')}</p></div>
        <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1" />{a('createAnnouncement')}</Button>
      </div>

      <div className="space-y-3">
        {isLoading ? <p className="text-muted-foreground">{a('loading')}</p> : items.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground">{a('noAnnouncements')}</CardContent></Card>
        : items.map((item: any) => (
          <Card key={item.id} className={!item.is_active ? 'opacity-50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {typeIcon(item.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold">{item.title}</h4>
                    <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'normal' ? 'default' : 'secondary'} className="text-[10px]">{item.priority}</Badge>
                    {!item.is_active && <Badge variant="outline" className="text-[10px]">{a('disabled')}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.content}</p>
                  <p className="text-[11px] text-muted-foreground mt-2">{a('by')} {item.created_by_email} · {item.created_at ? format(new Date(item.created_at), 'dd/MM/yyyy HH:mm') : ''}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggle.mutate({ id: item.id, is_active: !item.is_active })}>
                    {item.is_active ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDelTarget(item)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{a('createNew')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{a('announcementTitle')}</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>{a('content')}</Label><Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{a('type')}</Label><Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="info">{a('typeInfo')}</SelectItem><SelectItem value="warning">{a('typeWarning')}</SelectItem><SelectItem value="error">{a('typeError')}</SelectItem></SelectContent></Select></div>
              <div><Label>{a('priority')}</Label><Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">{a('priorityLow')}</SelectItem><SelectItem value="normal">{a('priorityNormal')}</SelectItem><SelectItem value="high">{a('priorityHigh')}</SelectItem></SelectContent></Select></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>{a('cancel')}</Button><Button onClick={handleCreate} disabled={create.isPending}>{create.isPending ? a('creating') : a('create')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delTarget} onOpenChange={() => setDelTarget(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{a('deleteAnnouncement')}</AlertDialogTitle><AlertDialogDescription>"{delTarget?.title}" {a('deleteAnnouncementDesc')}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{a('cancel')}</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => delTarget && del.mutate({ id: delTarget.id }, { onSuccess: () => { toast.success(a('deleted')); setDelTarget(null); } })}>{a('delete')}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Config Page ─────────────────────────────────────────────
function ConfigPage() {
  const { a } = useAdminT();
  const { data: configs = [], isLoading } = useSystemConfig();
  const update = useUpdateSystemConfig();

  const categories: Record<string, string> = { general: a('generalSettings'), limits: a('limits'), features: a('featuresLabel') };

  const grouped = configs.reduce((acc: any, c: any) => {
    const cat = c.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {});

  const handleToggle = (config: any, field: string) => {
    const newVal = { ...config.value, [field]: !config.value[field] };
    update.mutate({ id: config.id, value: newVal }, {
      onSuccess: () => toast.success(a('updated')),
      onError: () => toast.error(a('failed')),
    });
  };

  const handleValueChange = (config: any, field: string, val: any) => {
    const newVal = { ...config.value, [field]: val };
    update.mutate({ id: config.id, value: newVal }, {
      onSuccess: () => toast.success(a('updated')),
      onError: () => toast.error(a('failed')),
    });
  };

  if (isLoading) return <p className="text-muted-foreground">{a('loading')}</p>;

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([cat, items]: [string, any]) => (
        <Card key={cat}>
          <CardHeader><CardTitle className="text-sm">{categories[cat] || cat}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {items.map((c: any) => {
              const val = c.value || {};
              const hasEnabled = 'enabled' in val;
              const hasValue = 'value' in val;

              return (
                <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{c.description || c.key}</p>
                    <p className="text-xs text-muted-foreground font-mono">{c.key}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {hasEnabled && (
                      <div className="flex items-center gap-2">
                        <Switch checked={val.enabled} onCheckedChange={() => handleToggle(c, 'enabled')} />
                        <span className="text-xs text-muted-foreground">{val.enabled ? a('on') : a('off')}</span>
                      </div>
                    )}
                    {hasValue && (
                      <Input
                        className="w-24 text-right"
                        value={val.value}
                        onChange={e => handleValueChange(c, 'value', isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Subscriptions Page ──────────────────────────────────────
function SubscriptionsPage() {
  const { a, i18n } = useAdminT();
  const isEn = i18n.language === 'en';
  const { data: plans = [], isLoading } = useSubscriptionPlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();
  const [editPlan, setEditPlan] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);

  const emptyPlan = {
    code: '', name_vi: '', name_en: '', description_vi: '', description_en: '',
    price_monthly: 0, price_yearly: 0, currency: 'VND', max_employees: 0,
    is_popular: false, is_active: true, sort_order: plans.length + 1,
    features_vi: [] as string[], features_en: [] as string[],
  };

  const [form, setForm] = useState(emptyPlan);
  const [featVi, setFeatVi] = useState('');
  const [featEn, setFeatEn] = useState('');

  const openEdit = (plan: any) => {
    setForm({
      ...plan,
      features_vi: Array.isArray(plan.features_vi) ? plan.features_vi : [],
      features_en: Array.isArray(plan.features_en) ? plan.features_en : [],
    });
    setFeatVi((Array.isArray(plan.features_vi) ? plan.features_vi : []).join('\n'));
    setFeatEn((Array.isArray(plan.features_en) ? plan.features_en : []).join('\n'));
    setEditPlan(plan);
  };

  const openCreate = () => {
    setForm({ ...emptyPlan, sort_order: plans.length + 1 });
    setFeatVi('');
    setFeatEn('');
    setEditPlan('new');
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      features_vi: featVi.split('\n').map(s => s.trim()).filter(Boolean),
      features_en: featEn.split('\n').map(s => s.trim()).filter(Boolean),
    };
    try {
      if (editPlan === 'new') {
        await createPlan.mutateAsync(payload);
        toast.success(isEn ? 'Plan created' : 'Đã tạo gói dịch vụ');
      } else {
        await updatePlan.mutateAsync({ id: editPlan.id, ...payload });
        toast.success(isEn ? 'Plan updated' : 'Đã cập nhật gói dịch vụ');
      }
      setEditPlan(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePlan.mutateAsync(id);
      toast.success(isEn ? 'Plan deleted' : 'Đã xóa gói dịch vụ');
      setDeleteOpen(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{isEn ? 'Manage subscription plans displayed on Landing Page' : 'Quản lý gói dịch vụ hiển thị trên Landing Page'}</p>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" />{isEn ? 'Add plan' : 'Thêm gói'}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((p) => (
          <Card key={p.id} className={`relative ${p.is_popular ? 'border-primary shadow-md ring-1 ring-primary/20' : ''} ${!p.is_active ? 'opacity-60' : ''}`}>
            {p.is_popular && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <Badge className="bg-amber-500 hover:bg-amber-500 text-white border-0 text-xs">{isEn ? 'Popular' : 'Phổ biến'}</Badge>
              </div>
            )}
            {!p.is_active && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs">{isEn ? 'Inactive' : 'Tắt'}</Badge>
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-4 h-4 text-primary" />
                {isEn ? p.name_en : p.name_vi}
                <span className="text-xs text-muted-foreground ml-auto">#{p.sort_order}</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">{isEn ? p.description_en : p.description_vi}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-2xl font-bold">{formatPrice(p.price_monthly)}<span className="text-xs font-normal text-muted-foreground">/{isEn ? 'month' : 'tháng'}</span></p>
                <p className="text-sm text-muted-foreground">{formatPrice(p.price_yearly)}/{isEn ? 'year' : 'năm'}</p>
              </div>
              <p className="text-sm"><span className="font-medium">{p.max_employees}</span> {isEn ? 'employees' : 'nhân viên'}</p>
              <ul className="space-y-1">
                {(isEn ? p.features_en : p.features_vi)?.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs"><CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />{f}</li>
                ))}
              </ul>
              <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(p)}>
                  {isEn ? 'Edit' : 'Sửa'}
                </Button>
                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteOpen(p.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={!!editPlan} onOpenChange={(o) => !o && setEditPlan(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editPlan === 'new' ? (isEn ? 'Create plan' : 'Tạo gói dịch vụ') : (isEn ? 'Edit plan' : 'Sửa gói dịch vụ')}</DialogTitle>
            <DialogDescription>{isEn ? 'Configure subscription plan details' : 'Cấu hình chi tiết gói dịch vụ'}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{isEn ? 'Code' : 'Mã'}</Label>
              <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="starter" />
            </div>
            <div className="space-y-1.5">
              <Label>{isEn ? 'Sort order' : 'Thứ tự'}</Label>
              <Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>{isEn ? 'Name (VI)' : 'Tên (VI)'}</Label>
              <Input value={form.name_vi} onChange={e => setForm(f => ({ ...f, name_vi: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>{isEn ? 'Name (EN)' : 'Tên (EN)'}</Label>
              <Input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>{isEn ? 'Description (VI)' : 'Mô tả (VI)'}</Label>
              <Input value={form.description_vi || ''} onChange={e => setForm(f => ({ ...f, description_vi: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>{isEn ? 'Description (EN)' : 'Mô tả (EN)'}</Label>
              <Input value={form.description_en || ''} onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>{isEn ? 'Monthly price' : 'Giá tháng'}</Label>
              <Input type="number" value={form.price_monthly} onChange={e => setForm(f => ({ ...f, price_monthly: +e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>{isEn ? 'Yearly price' : 'Giá năm'}</Label>
              <Input type="number" value={form.price_yearly} onChange={e => setForm(f => ({ ...f, price_yearly: +e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>{isEn ? 'Max employees' : 'Số nhân viên tối đa'}</Label>
              <Input type="number" value={form.max_employees} onChange={e => setForm(f => ({ ...f, max_employees: +e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>{isEn ? 'Currency' : 'Tiền tệ'}</Label>
              <Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} />
            </div>
            <div className="flex items-center gap-6 col-span-2">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_popular} onCheckedChange={v => setForm(f => ({ ...f, is_popular: v }))} />
                <Label>{isEn ? 'Popular' : 'Phổ biến'}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                <Label>{isEn ? 'Active' : 'Kích hoạt'}</Label>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{isEn ? 'Features (VI) - one per line' : 'Tính năng (VI) - mỗi dòng 1 tính năng'}</Label>
              <Textarea rows={5} value={featVi} onChange={e => setFeatVi(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{isEn ? 'Features (EN) - one per line' : 'Tính năng (EN) - mỗi dòng 1 tính năng'}</Label>
              <Textarea rows={5} value={featEn} onChange={e => setFeatEn(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setEditPlan(null)}>{isEn ? 'Cancel' : 'Hủy'}</Button>
            <Button onClick={handleSave} disabled={createPlan.isPending || updatePlan.isPending}>
              {(createPlan.isPending || updatePlan.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              {isEn ? 'Save' : 'Lưu'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteOpen} onOpenChange={() => setDeleteOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isEn ? 'Delete plan?' : 'Xóa gói dịch vụ?'}</AlertDialogTitle>
            <AlertDialogDescription>{isEn ? 'This action cannot be undone.' : 'Hành động này không thể hoàn tác.'}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isEn ? 'Cancel' : 'Hủy'}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteOpen && handleDelete(deleteOpen)}>{isEn ? 'Delete' : 'Xóa'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Trial Management Page ───────────────────────────────────
function TrialManagementPage() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const { data: subscriptions = [], isLoading } = usePlatformSubscriptions();
  const { data: plans = [] } = useActiveSubscriptionPlans();
  const updateTrialDate = useUpdateTrialDate();
  const activateSubscription = useActivateSubscription();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'trial_active' | 'trial_expired' | 'active'>('all');
  const [editSub, setEditSub] = useState<any>(null);
  const [newTrialEnd, setNewTrialEnd] = useState('');
  const [activateDialog, setActivateDialog] = useState<any>(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const filtered = subscriptions.filter((s: any) => {
    const matchSearch = s.company_name?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'trial_active') return s.subscription_status === 'trial' && s.is_active;
    if (filter === 'trial_expired') return s.subscription_status === 'trial' && !s.is_active;
    if (filter === 'active') return s.subscription_status === 'active';
    return true;
  });

  const trialActive = subscriptions.filter((s: any) => s.subscription_status === 'trial' && s.is_active).length;
  const trialExpired = subscriptions.filter((s: any) => s.subscription_status === 'trial' && !s.is_active).length;
  const paidActive = subscriptions.filter((s: any) => s.subscription_status === 'active').length;
  const conversionRate = (trialActive + trialExpired + paidActive) > 0 
    ? Math.round((paidActive / (trialActive + trialExpired + paidActive)) * 100) : 0;

  const handleExtendTrial = () => {
    if (!editSub || !newTrialEnd) return;
    updateTrialDate.mutate(
      { subscriptionId: editSub.id, trialEndDate: new Date(newTrialEnd).toISOString(), companyId: editSub.company_id },
      {
        onSuccess: () => {
          toast.success(isEn ? 'Trial date updated!' : 'Đã cập nhật ngày dùng thử!');
          setEditSub(null);
        },
        onError: (e: any) => toast.error(e.message),
      }
    );
  };

  const handleActivate = () => {
    if (!activateDialog || !selectedPlanId) return;
    const plan = plans.find((p: any) => p.id === selectedPlanId);
    if (!plan) return;
    activateSubscription.mutate(
      { subscriptionId: activateDialog.id, planId: plan.id, planCode: plan.code, maxEmployees: plan.max_employees, companyId: activateDialog.company_id },
      {
        onSuccess: () => {
          toast.success(isEn ? 'Subscription activated!' : 'Đã kích hoạt gói dịch vụ!');
          setActivateDialog(null);
          setSelectedPlanId('');
        },
        onError: (e: any) => toast.error(e.message),
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: isEn ? 'Trial Active' : 'Đang dùng thử', value: trialActive, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
          { label: isEn ? 'Trial Expired' : 'Hết hạn thử', value: trialExpired, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950' },
          { label: isEn ? 'Paid Active' : 'Trả phí', value: paidActive, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950' },
          { label: isEn ? 'Conversion Rate' : 'Tỷ lệ chuyển đổi', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950' },
        ].map((card) => (
          <Card key={card.label} className="border-none shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${card.bg} shrink-0`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-foreground">{isLoading ? '—' : card.value}</p>
                <p className="text-[11px] text-muted-foreground truncate">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={isEn ? 'Search company...' : 'Tìm kiếm công ty...'} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-[150px] sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isEn ? 'All' : 'Tất cả'}</SelectItem>
              <SelectItem value="trial_active">{isEn ? 'Trial Active' : 'Đang dùng thử'}</SelectItem>
              <SelectItem value="trial_expired">{isEn ? 'Trial Expired' : 'Hết hạn thử'}</SelectItem>
              <SelectItem value="active">{isEn ? 'Paid Active' : 'Trả phí'}</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="shrink-0">{filtered.length} {isEn ? 'subscriptions' : 'gói'}</Badge>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isEn ? 'Company' : 'Công ty'}</TableHead>
              <TableHead className="hidden sm:table-cell">{isEn ? 'Plan' : 'Gói'}</TableHead>
              <TableHead>{isEn ? 'Status' : 'Trạng thái'}</TableHead>
              <TableHead className="hidden md:table-cell">{isEn ? 'Trial End' : 'Hết hạn thử'}</TableHead>
              <TableHead>{isEn ? 'Days Left' : 'Còn lại'}</TableHead>
              <TableHead className="hidden sm:table-cell">{isEn ? 'Max Employees' : 'Tối đa NV'}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />{isEn ? 'Loading...' : 'Đang tải...'}</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{isEn ? 'No data' : 'Không có dữ liệu'}</TableCell></TableRow>
            ) : filtered.map((sub: any) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{sub.company_name}</p>
                    <p className="text-xs text-muted-foreground">{sub.industry || '—'}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline" className="text-xs">{isEn ? sub.plan_name_en : sub.plan_name_vi || sub.plan_code}</Badge>
                </TableCell>
                <TableCell>
                  {sub.subscription_status === 'active' ? (
                    <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />{isEn ? 'Active' : 'Hoạt động'}</Badge>
                  ) : sub.is_active ? (
                    <Badge variant="secondary" className="text-xs"><Clock className="w-3 h-3 mr-1" />{isEn ? 'Trial' : 'Dùng thử'}</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs"><AlertTriangle className="w-3 h-3 mr-1" />{isEn ? 'Expired' : 'Hết hạn'}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                  {sub.trial_end_date ? format(new Date(sub.trial_end_date), 'dd/MM/yyyy') : '—'}
                </TableCell>
                <TableCell>
                  {sub.trial_days_remaining !== null ? (
                    <span className={`text-sm font-medium ${sub.trial_days_remaining <= 3 ? 'text-destructive' : sub.trial_days_remaining <= 7 ? 'text-amber-500' : 'text-foreground'}`}>
                      {sub.trial_days_remaining} {isEn ? 'days' : 'ngày'}
                    </span>
                  ) : '—'}
                </TableCell>
                <TableCell className="text-sm hidden sm:table-cell">{sub.max_employees}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {sub.subscription_status === 'trial' && (
                        <DropdownMenuItem onClick={() => {
                          setEditSub(sub);
                          setNewTrialEnd(sub.trial_end_date ? new Date(sub.trial_end_date).toISOString().split('T')[0] : '');
                        }}>
                          <Clock className="w-4 h-4 mr-2" />
                          {isEn ? 'Extend/Shorten Trial' : 'Gia hạn / Rút ngắn trial'}
                        </DropdownMenuItem>
                      )}
                      {sub.subscription_status !== 'active' && (
                        <DropdownMenuItem onClick={() => { setActivateDialog(sub); setSelectedPlanId(sub.plan_id || ''); }}>
                          <ArrowUpRight className="w-4 h-4 mr-2" />
                          {isEn ? 'Activate Subscription' : 'Kích hoạt trả phí'}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </Card>

      {/* Extend/Shorten Trial Dialog */}
      <Dialog open={!!editSub} onOpenChange={() => setEditSub(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEn ? 'Update Trial Period' : 'Cập nhật thời gian dùng thử'}</DialogTitle>
            <DialogDescription>{editSub?.company_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{isEn ? 'Current trial end date' : 'Ngày hết hạn hiện tại'}</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {editSub?.trial_end_date ? format(new Date(editSub.trial_end_date), 'dd/MM/yyyy HH:mm') : '—'}
              </p>
            </div>
            <div>
              <Label>{isEn ? 'New trial end date' : 'Ngày hết hạn mới'}</Label>
              <Input type="date" value={newTrialEnd} onChange={e => setNewTrialEnd(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSub(null)}>{isEn ? 'Cancel' : 'Hủy'}</Button>
            <Button onClick={handleExtendTrial} disabled={!newTrialEnd || updateTrialDate.isPending}>
              {updateTrialDate.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {isEn ? 'Save' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Subscription Dialog */}
      <Dialog open={!!activateDialog} onOpenChange={() => setActivateDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEn ? 'Activate Subscription' : 'Kích hoạt gói trả phí'}</DialogTitle>
            <DialogDescription>{activateDialog?.company_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{isEn ? 'Select plan' : 'Chọn gói dịch vụ'}</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={isEn ? 'Choose plan...' : 'Chọn gói...'} />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan: any) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {isEn ? plan.name_en : plan.name_vi} — {formatPrice(plan.price_monthly)}/{isEn ? 'mo' : 'th'} ({plan.max_employees} {isEn ? 'employees' : 'NV'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivateDialog(null)}>{isEn ? 'Cancel' : 'Hủy'}</Button>
            <Button onClick={handleActivate} disabled={!selectedPlanId || activateSubscription.isPending}>
              {activateSubscription.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {isEn ? 'Activate' : 'Kích hoạt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sidebar Nav Content (shared) ────────────────────────────
function SidebarNavContent({ page, setPage, groups, onItemClick }: { page: AdminPage; setPage: (p: AdminPage) => void; groups: Record<string, ReturnType<typeof useNavItems>>; onItemClick?: () => void }) {
  const { a } = useAdminT();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <div className="flex flex-col h-full">
      <div className="h-14 flex items-center gap-2 px-4 border-b shrink-0">
        <Shield className="w-5 h-5 text-primary shrink-0" />
        <span className="font-bold text-sm truncate">Platform Admin</span>
      </div>
      <ScrollArea className="flex-1 py-2">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="mb-2">
            <p className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{group}</p>
            {items.map(item => (
              <button
                key={item.key}
                onClick={() => { setPage(item.key); onItemClick?.(); }}
                className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors hover:bg-muted/50 ${page === item.key ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary' : 'text-muted-foreground'}`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </ScrollArea>
      <div className="border-t p-3 shrink-0">
        <button onClick={async () => { await signOut(); navigate('/login'); }} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50">
          <LogOut className="w-4 h-4" />
          <span>{a('logout', 'Đăng xuất')}</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Layout ─────────────────────────────────────────────
export default function PlatformAdmin() {
  const [page, setPage] = useState<AdminPage>('stats');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { a } = useAdminT();
  const NAV_ITEMS = useNavItems();

  const currentNav = NAV_ITEMS.find(n => n.key === page);
  const groups = NAV_ITEMS.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof NAV_ITEMS>);

  const renderPage = () => {
    switch (page) {
      case 'stats': return <StatsPage />;
      case 'companies': return <CompaniesPage />;
      case 'users': return <UsersPage />;
      case 'admins': return <AdminsPage />;
      case 'logs': return <LogsPage />;
      case 'announcements': return <AnnouncementsPage />;
      case 'config': return <ConfigPage />;
      case 'subscriptions': return <SubscriptionsPage />;
      case 'trials': return <TrialManagementPage />;
      case 'guide': return <GuideManagementPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sheet Sidebar */}
      <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
        <SheetContent side="left" className="p-0 w-64 md:hidden">
          <SidebarNavContent page={page} setPage={setPage} groups={groups} onItemClick={() => setMobileSheetOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-0 overflow-hidden'} shrink-0 border-r bg-card transition-all duration-200 hidden md:flex flex-col`}>
        <SidebarNavContent page={page} setPage={setPage} groups={groups} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-card flex items-center gap-2 px-3 md:px-4 shrink-0 sticky top-0 z-30">
          {/* Mobile hamburger */}
          <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => setMobileSheetOpen(true)}>
            <Menu className="w-4 h-4" />
          </Button>
          {/* Desktop toggle */}
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:flex" onClick={() => setSidebarOpen(v => !v)}>
            <Menu className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            {currentNav && <currentNav.icon className="w-4 h-4 text-primary shrink-0" />}
            <h2 className="text-sm font-semibold truncate">{currentNav?.label}</h2>
          </div>
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <AdminLanguageToggle />
            <Badge variant="outline" className="text-xs hidden sm:flex"><Globe className="w-3 h-3 mr-1" />UniHRM</Badge>
            <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[120px]">{profile?.email}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
