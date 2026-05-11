import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { vi, enUS, zhCN } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

interface Insurance {
  id: string;
  employee_code: string;
  employee_name: string;
  employee_avatar: string | null;
  department: string | null;
  social_insurance_number: string | null;
  health_insurance_number: string | null;
  unemployment_insurance_number: string | null;
  social_insurance_rate: number | null;
  health_insurance_rate: number | null;
  unemployment_insurance_rate: number | null;
  base_salary: number | null;
  effective_date: string | null;
  expiry_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  company_id: string;
}

interface AddInsuranceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingInsurance?: Insurance | null;
}

export function AddInsuranceDialog({ open, onOpenChange, editingInsurance }: AddInsuranceDialogProps) {
  const { t, i18n } = useTranslation();
  const d = (key: string) => String(t(`insurance.dialog.${key}`));
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!editingInsurance;

  const getCalendarLocale = () => {
    switch (i18n.language) {
      case 'vi': return vi;
      case 'zh': return zhCN;
      default: return enUS;
    }
  };

  const formSchema = z.object({
    employee_code: z.string().min(1, d('codeRequired')).max(50),
    employee_name: z.string().min(1, d('nameRequired')).max(100),
    department: z.string().max(100).optional(),
    social_insurance_number: z.string().max(20).optional(),
    health_insurance_number: z.string().max(20).optional(),
    unemployment_insurance_number: z.string().max(20).optional(),
    social_insurance_rate: z.coerce.number().min(0).max(100).optional(),
    health_insurance_rate: z.coerce.number().min(0).max(100).optional(),
    unemployment_insurance_rate: z.coerce.number().min(0).max(100).optional(),
    base_salary: z.coerce.number().min(0).optional(),
    effective_date: z.date().optional(),
    expiry_date: z.date().optional(),
    status: z.string().default('active'),
    notes: z.string().max(500).optional(),
  });

  type FormData = z.infer<typeof formSchema>;

  // Fetch employees for dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-list', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, employee_code, department, avatar_url')
        .eq('company_id', currentCompanyId)
        .is('deleted_at', null)
        .order('full_name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentCompanyId && open,
  });
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_code: '',
      employee_name: '',
      department: '',
      social_insurance_number: '',
      health_insurance_number: '',
      unemployment_insurance_number: '',
      social_insurance_rate: 8,
      health_insurance_rate: 1.5,
      unemployment_insurance_rate: 1,
      base_salary: 0,
      status: 'active',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (editingInsurance) {
        form.reset({
          employee_code: editingInsurance.employee_code,
          employee_name: editingInsurance.employee_name,
          department: editingInsurance.department || '',
          social_insurance_number: editingInsurance.social_insurance_number || '',
          health_insurance_number: editingInsurance.health_insurance_number || '',
          unemployment_insurance_number: editingInsurance.unemployment_insurance_number || '',
          social_insurance_rate: editingInsurance.social_insurance_rate || 8,
          health_insurance_rate: editingInsurance.health_insurance_rate || 1.5,
          unemployment_insurance_rate: editingInsurance.unemployment_insurance_rate || 1,
          base_salary: editingInsurance.base_salary || 0,
          effective_date: editingInsurance.effective_date ? new Date(editingInsurance.effective_date) : undefined,
          expiry_date: editingInsurance.expiry_date ? new Date(editingInsurance.expiry_date) : undefined,
          status: editingInsurance.status,
          notes: editingInsurance.notes || '',
        });
      } else {
        form.reset({
          employee_code: '',
          employee_name: '',
          department: '',
          social_insurance_number: '',
          health_insurance_number: '',
          unemployment_insurance_number: '',
          social_insurance_rate: 8,
          health_insurance_rate: 1.5,
          unemployment_insurance_rate: 1,
          base_salary: 0,
          status: 'active',
          notes: '',
        });
      }
    }
  }, [open, editingInsurance, form]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!currentCompanyId) throw new Error('No company selected');
      const { error } = await supabase.from('insurance').insert({
        employee_code: data.employee_code,
        employee_name: data.employee_name,
        department: data.department || null,
        social_insurance_number: data.social_insurance_number || null,
        health_insurance_number: data.health_insurance_number || null,
        unemployment_insurance_number: data.unemployment_insurance_number || null,
        social_insurance_rate: data.social_insurance_rate || null,
        health_insurance_rate: data.health_insurance_rate || null,
        unemployment_insurance_rate: data.unemployment_insurance_rate || null,
        base_salary: data.base_salary || null,
        effective_date: data.effective_date ? format(data.effective_date, 'yyyy-MM-dd') : null,
        expiry_date: data.expiry_date ? format(data.expiry_date, 'yyyy-MM-dd') : null,
        status: data.status,
        notes: data.notes || null,
        company_id: currentCompanyId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance'] });
      toast.success(d('addSuccess'));
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(d('addError') + ': ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!editingInsurance) throw new Error('No insurance to update');
      const { error } = await supabase
        .from('insurance')
        .update({
          employee_code: data.employee_code,
          employee_name: data.employee_name,
          department: data.department || null,
          social_insurance_number: data.social_insurance_number || null,
          health_insurance_number: data.health_insurance_number || null,
          unemployment_insurance_number: data.unemployment_insurance_number || null,
          social_insurance_rate: data.social_insurance_rate || null,
          health_insurance_rate: data.health_insurance_rate || null,
          unemployment_insurance_rate: data.unemployment_insurance_rate || null,
          base_salary: data.base_salary || null,
          effective_date: data.effective_date ? format(data.effective_date, 'yyyy-MM-dd') : null,
          expiry_date: data.expiry_date ? format(data.expiry_date, 'yyyy-MM-dd') : null,
          status: data.status,
          notes: data.notes || null,
        })
        .eq('id', editingInsurance.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance'] });
      toast.success(d('updateSuccess'));
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(d('updateError') + ': ' + error.message);
    },
  });

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      form.setValue('employee_code', employee.employee_code);
      form.setValue('employee_name', employee.full_name);
      form.setValue('department', employee.department || '');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const baseSalary = form.watch('base_salary') || 0;
  const bhxhRate = form.watch('social_insurance_rate') || 0;
  const bhytRate = form.watch('health_insurance_rate') || 0;
  const bhtnRate = form.watch('unemployment_insurance_rate') || 0;

  const bhxhAmount = (baseSalary * bhxhRate) / 100;
  const bhytAmount = (baseSalary * bhytRate) / 100;
  const bhtnAmount = (baseSalary * bhtnRate) / 100;
  const totalAmount = bhxhAmount + bhytAmount + bhtnAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : i18n.language, {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const calLocale = getCalendarLocale();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? d('editTitle') : d('addTitle')}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Employee Selection */}
            {!isEditing && employees.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{d('selectEmployee')}</label>
                <Select onValueChange={handleEmployeeSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder={d('selectEmployeePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name} - {emp.employee_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Employee Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employee_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{d('employeeCode')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={d('employeeCodePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employee_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{d('employeeName')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={d('employeeNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{d('department')}</FormLabel>
                  <FormControl>
                    <Input placeholder={d('departmentPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Insurance Numbers */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">{d('insuranceNumbers')}</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="social_insurance_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('socialNumber')}</FormLabel>
                      <FormControl>
                        <Input placeholder={d('socialNumberPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="health_insurance_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('healthNumber')}</FormLabel>
                      <FormControl>
                        <Input placeholder={d('healthNumberPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unemployment_insurance_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('unemploymentNumber')}</FormLabel>
                      <FormControl>
                        <Input placeholder={d('unemploymentNumberPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Insurance Rates */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">{d('contributionRates')}</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="social_insurance_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('socialRate')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="health_insurance_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('healthRate')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unemployment_insurance_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('unemploymentRate')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Salary and Dates */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="base_salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{d('baseSalary')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="VNĐ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="effective_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{d('effectiveDate')}</FormLabel>
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
                            {field.value ? format(field.value, 'dd/MM/yyyy') : d('selectDate')}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={calLocale}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{d('expiryDate')}</FormLabel>
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
                            {field.value ? format(field.value, 'dd/MM/yyyy') : d('selectDate')}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={calLocale}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Insurance Amount Preview */}
            {baseSalary > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-medium mb-3">{d('estimatedAmount')}</h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-center">
                    <p className="text-xs text-blue-600 dark:text-blue-400">{d('socialInsurance')}</p>
                    <p className="font-semibold text-blue-700 dark:text-blue-300 text-sm">{formatCurrency(bhxhAmount)}</p>
                  </div>
                  <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded text-center">
                    <p className="text-xs text-rose-600 dark:text-rose-400">{d('healthInsurance')}</p>
                    <p className="font-semibold text-rose-700 dark:text-rose-300 text-sm">{formatCurrency(bhytAmount)}</p>
                  </div>
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-center">
                    <p className="text-xs text-amber-600 dark:text-amber-400">{d('unemploymentInsurance')}</p>
                    <p className="font-semibold text-amber-700 dark:text-amber-300 text-sm">{formatCurrency(bhtnAmount)}</p>
                  </div>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded text-center">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">{d('totalAmount')}</p>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm">{formatCurrency(totalAmount)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{d('status')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={d('statusPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">{d('statusActive')}</SelectItem>
                      <SelectItem value="pending">{d('statusPending')}</SelectItem>
                      <SelectItem value="expired">{d('statusExpired')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{d('notes')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={d('notesPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {d('cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? d('saving') : isEditing ? d('update') : d('save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
