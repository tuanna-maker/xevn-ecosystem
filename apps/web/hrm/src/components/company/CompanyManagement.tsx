import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Building2,
  Users,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  CalendarIcon,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Camera,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Company {
  id: string;
  name: string;
  code: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  tax_code: string | null;
  website: string | null;
  industry: string | null;
  employee_count: number | null;
  founded_date: string | null;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const companyFormSchema = z.object({
  name: z.string().min(1, 'Required').max(200),
  code: z.string().max(50).optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  tax_code: z.string().max(50).optional(),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().max(100).optional(),
  employee_count: z.number().min(0).optional(),
  founded_date: z.date().optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'inactive', 'suspended']),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

const industryKeys = [
  'it', 'manufacturing', 'trading', 'services', 'finance',
  'realestate', 'education', 'healthcare', 'tourism', 'logistics',
  'construction', 'other',
] as const;

export function CompanyManagement() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [deletingCompanyId, setDeletingCompanyId] = useState<string | null>(null);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '',
      code: '',
      logo_url: '',
      address: '',
      phone: '',
      email: '',
      tax_code: '',
      website: '',
      industry: '',
      employee_count: 0,
      description: '',
      status: 'active',
    },
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies((data as Company[]) || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: t('common.error'),
        description: t('company.loadError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.code?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: companies.length,
    active: companies.filter((c) => c.status === 'active').length,
    inactive: companies.filter((c) => c.status === 'inactive').length,
    totalEmployees: companies.reduce((acc, c) => acc + (c.employee_count || 0), 0),
  };

  const handleAddCompany = () => {
    setEditingCompany(null);
    form.reset({
      name: '',
      code: '',
      logo_url: '',
      address: '',
      phone: '',
      email: '',
      tax_code: '',
      website: '',
      industry: '',
      employee_count: 0,
      description: '',
      status: 'active',
    });
    setIsDialogOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    form.reset({
      name: company.name,
      code: company.code || '',
      logo_url: company.logo_url || '',
      address: company.address || '',
      phone: company.phone || '',
      email: company.email || '',
      tax_code: company.tax_code || '',
      website: company.website || '',
      industry: company.industry || '',
      employee_count: company.employee_count || 0,
      founded_date: company.founded_date ? new Date(company.founded_date) : undefined,
      description: company.description || '',
      status: company.status as 'active' | 'inactive' | 'suspended',
    });
    setIsDialogOpen(true);
  };

  const handleViewCompany = (company: Company) => {
    setViewingCompany(company);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingCompanyId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCompany = async () => {
    if (!deletingCompanyId) return;

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', deletingCompanyId);

      if (error) throw error;

      setCompanies(companies.filter((c) => c.id !== deletingCompanyId));
      toast({
        title: t('common.success'),
        description: t('company.companyDeleted'),
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: t('common.error'),
        description: t('company.deleteError'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingCompanyId(null);
    }
  };

  const onSubmit = async (values: CompanyFormValues) => {
    try {
      const companyData = {
        name: values.name,
        code: values.code || null,
        logo_url: values.logo_url || null,
        address: values.address || null,
        phone: values.phone || null,
        email: values.email || null,
        tax_code: values.tax_code || null,
        website: values.website || null,
        industry: values.industry || null,
        employee_count: values.employee_count || 0,
        founded_date: values.founded_date ? format(values.founded_date, 'yyyy-MM-dd') : null,
        description: values.description || null,
        status: values.status,
      };

      if (editingCompany) {
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', editingCompany.id);

        if (error) throw error;

        toast({
          title: t('common.success'),
          description: t('company.companyUpdated'),
        });
      } else {
        const { error } = await supabase
          .from('companies')
          .insert([companyData]);

        if (error) throw error;

        toast({
          title: t('common.success'),
          description: t('company.companyCreated'),
        });
      }

      await fetchCompanies();
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error saving company:', error);
      toast({
        title: t('common.error'),
        description: t('company.saveError'),
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { labelKey: string; color: string }> = {
      active: { labelKey: 'common.status.active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      inactive: { labelKey: 'common.status.inactive', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
      suspended: { labelKey: 'company.suspended', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
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
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">{t('company.totalCompanies')}</p>
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
                <p className="text-xs text-muted-foreground">{t('company.activeCompanies')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inactive}</p>
                <p className="text-xs text-muted-foreground">{t('company.inactiveCompanies')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                <p className="text-xs text-muted-foreground">{t('company.totalEmployees')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {t('company.companyList')}
            </CardTitle>
            <Button size="sm" className="gap-2" onClick={handleAddCompany}>
              <Plus className="w-4 h-4" />
              {t('company.addCompany')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('company.searchCompany')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('common.status.label')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="active">{t('common.status.active')}</SelectItem>
                <SelectItem value="inactive">{t('common.status.inactive')}</SelectItem>
                <SelectItem value="suspended">{t('company.suspended')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>{t('company.companyName')}</TableHead>
                  <TableHead>{t('company.companyCode')}</TableHead>
                  <TableHead>{t('company.industry')}</TableHead>
                  <TableHead>{t('company.employeeCount')}</TableHead>
                  <TableHead>{t('common.status.label')}</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        {t('common.loading')}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm || statusFilter !== 'all'
                        ? t('company.noCompaniesMatch')
                        : t('company.noCompanies')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={company.logo_url || undefined} alt={company.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <Building2 className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{company.name}</p>
                          {company.email && (
                            <p className="text-xs text-muted-foreground">{company.email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {company.code || '-'}
                        </code>
                      </TableCell>
                      <TableCell>{company.industry || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {company.employee_count || 0}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(company.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewCompany(company)}>
                              <Eye className="w-4 h-4 mr-2" />
                              {t('common.viewDetail')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditCompany(company)}>
                              <Edit className="w-4 h-4 mr-2" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(company.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('common.delete')}
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCompany ? t('company.editCompany') : t('company.addCompany')}
            </DialogTitle>
            <DialogDescription>
              {editingCompany
                ? t('company.updateCompanyDesc')
                : t('company.addCompanyDesc')}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t('company.companyName')} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t('company.companyNamePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('company.companyCode')}</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: COMPANY001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tax_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('company.taxCode')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('company.taxCodePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('company.industry')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('company.selectIndustry')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industryKeys.map((key) => (
                            <SelectItem key={key} value={t(`industries.${key}`)}>
                              {t(`industries.${key}`)}
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
                  name="employee_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('company.employeeCount')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
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
                      <FormLabel>{t('company.email')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('company.phone')}</FormLabel>
                      <FormControl>
                        <Input placeholder="(028) 1234 5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('company.website')}</FormLabel>
                      <FormControl>
                        <Input placeholder="https://company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="founded_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('company.foundedDate')}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'dd/MM/yyyy')
                              ) : (
                                <span>{t('common.selectDate')}</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t('company.address')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('company.addressPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logo_url"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/logo.png" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t('company.description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('company.descriptionPlaceholder')}
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.status.label')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('company.selectStatus')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">{t('common.status.active')}</SelectItem>
                          <SelectItem value="inactive">{t('common.status.inactive')}</SelectItem>
                          <SelectItem value="suspended">{t('company.suspended')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit">
                  {editingCompany ? t('common.update') : t('common.create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={viewingCompany?.logo_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Building2 className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl">{viewingCompany?.name}</p>
                {viewingCompany?.code && (
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {viewingCompany.code}
                  </code>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {viewingCompany && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(viewingCompany.status)}
                {viewingCompany.industry && (
                  <Badge variant="outline">{viewingCompany.industry}</Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{viewingCompany.email || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{viewingCompany.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  {viewingCompany.website ? (
                    <a
                      href={viewingCompany.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {viewingCompany.website}
                    </a>
                  ) : (
                    <span>-</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span>{t('company.taxCode')}: {viewingCompany.tax_code || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{viewingCompany.employee_count || 0} {t('company.employeeUnit')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {t('company.foundedDate')}:{' '}
                    {viewingCompany.founded_date
                      ? format(new Date(viewingCompany.founded_date), 'dd/MM/yyyy')
                      : '-'}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm md:col-span-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span>{viewingCompany.address || '-'}</span>
                </div>
              </div>

              {viewingCompany.description && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-1">{t('company.description')}</p>
                  <p className="text-sm text-muted-foreground">{viewingCompany.description}</p>
                </div>
              )}

              <div className="pt-2 border-t text-xs text-muted-foreground">
                <p>{t('company.createdAt')}: {format(new Date(viewingCompany.created_at), 'dd/MM/yyyy HH:mm')}</p>
                <p>{t('company.updatedAt')}: {format(new Date(viewingCompany.updated_at), 'dd/MM/yyyy HH:mm')}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              {t('common.close')}
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                if (viewingCompany) handleEditCompany(viewingCompany);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              {t('common.edit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('company.deleteCompanyConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('company.deleteCompanyDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompany}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
