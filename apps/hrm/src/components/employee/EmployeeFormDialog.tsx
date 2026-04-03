import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Employee, EmployeeFormData } from '@/hooks/useEmployees';
import { EmployeeAvatarUpload } from './EmployeeAvatarUpload';

const employeeFormSchema = z.object({
  employee_code: z.string().min(1),
  full_name: z.string().min(1),
  company_id: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  start_date: z.string().optional(),
  salary: z.coerce.number().optional(),
  status: z.string().optional(),
  gender: z.string().optional(),
  birth_date: z.string().optional(),
  id_number: z.string().optional(),
  id_issue_date: z.string().optional(),
  id_issue_place: z.string().optional(),
  permanent_address: z.string().optional(),
  temporary_address: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  employment_type: z.string().optional(),
  work_location: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account: z.string().optional(),
  tax_code: z.string().optional(),
  social_insurance_number: z.string().optional(),
  health_insurance_number: z.string().optional(),
});

type FormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  departments: { id: string; name: string }[];
  companies?: { id: string; name: string }[];
  onSubmit: (data: EmployeeFormData & { company_id?: string }) => Promise<boolean>;
  isLoading?: boolean;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  departments,
  companies,
  onSubmit,
  isLoading,
}: EmployeeFormDialogProps) {
  const { t } = useTranslation();
  const isEditing = !!employee;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(employee?.avatar_url || null);

  const form = useForm<FormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      employee_code: '',
      full_name: '',
      company_id: companies?.[0]?.id || '',
      email: '',
      phone: '',
      department: '',
      position: '',
      start_date: '',
      salary: undefined,
      status: 'active',
      gender: '',
      birth_date: '',
      id_number: '',
      id_issue_date: '',
      id_issue_place: '',
      permanent_address: '',
      temporary_address: '',
      emergency_contact: '',
      emergency_phone: '',
      employment_type: 'full-time',
      work_location: '',
      bank_name: '',
      bank_account: '',
      tax_code: '',
      social_insurance_number: '',
      health_insurance_number: '',
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        employee_code: employee.employee_code,
        full_name: employee.full_name,
        company_id: employee.company_id || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || '',
        position: employee.position || '',
        start_date: employee.start_date || '',
        salary: employee.salary || undefined,
        status: employee.status,
        gender: employee.gender || '',
        birth_date: employee.birth_date || '',
        id_number: employee.id_number || '',
        id_issue_date: employee.id_issue_date || '',
        id_issue_place: employee.id_issue_place || '',
        permanent_address: employee.permanent_address || '',
        temporary_address: employee.temporary_address || '',
        emergency_contact: employee.emergency_contact || '',
        emergency_phone: employee.emergency_phone || '',
        employment_type: employee.employment_type || 'full-time',
        work_location: employee.work_location || '',
        bank_name: employee.bank_name || '',
        bank_account: employee.bank_account || '',
        tax_code: employee.tax_code || '',
        social_insurance_number: employee.social_insurance_number || '',
        health_insurance_number: employee.health_insurance_number || '',
      });
      setAvatarUrl(employee.avatar_url || null);
    } else {
      form.reset({
        employee_code: '',
        full_name: '',
        company_id: companies?.[0]?.id || '',
        email: '',
        phone: '',
        department: '',
        position: '',
        start_date: '',
        salary: undefined,
        status: 'active',
        gender: '',
        birth_date: '',
        id_number: '',
        id_issue_date: '',
        id_issue_place: '',
        permanent_address: '',
        temporary_address: '',
        emergency_contact: '',
        emergency_phone: '',
        employment_type: 'full-time',
        work_location: '',
        bank_name: '',
        bank_account: '',
        tax_code: '',
        social_insurance_number: '',
        health_insurance_number: '',
      });
      setAvatarUrl(null);
    }
  }, [employee, form, companies]);

  const handleSubmit = async (values: FormValues) => {
    const success = await onSubmit({
      employee_code: values.employee_code,
      full_name: values.full_name,
      status: values.status,
      avatar_url: avatarUrl,
      company_id: values.company_id || undefined,
      email: values.email || null,
      phone: values.phone || null,
      department: values.department || null,
      position: values.position || null,
      start_date: values.start_date || null,
      salary: values.salary || null,
      gender: values.gender || null,
      birth_date: values.birth_date || null,
      id_number: values.id_number || null,
      id_issue_date: values.id_issue_date || null,
      id_issue_place: values.id_issue_place || null,
      permanent_address: values.permanent_address || null,
      temporary_address: values.temporary_address || null,
      emergency_contact: values.emergency_contact || null,
      emergency_phone: values.emergency_phone || null,
      employment_type: values.employment_type || null,
      work_location: values.work_location || null,
      bank_name: values.bank_name || null,
      bank_account: values.bank_account || null,
      tax_code: values.tax_code || null,
      social_insurance_number: values.social_insurance_number || null,
      health_insurance_number: values.health_insurance_number || null,
    });
    
    if (success) {
      onOpenChange(false);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('employeeForm.editEmployee') : t('employees.addEmployee')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="flex flex-wrap gap-1 h-auto p-1 w-full">
                <TabsTrigger value="basic">{t('employeeForm.basicInfo')}</TabsTrigger>
                <TabsTrigger value="personal">{t('employeeForm.personal')}</TabsTrigger>
                <TabsTrigger value="work">{t('employeeForm.work')}</TabsTrigger>
                <TabsTrigger value="finance">{t('employeeForm.finance')}</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                {/* Avatar Upload */}
                <div className="flex justify-center pb-4 border-b">
                  <EmployeeAvatarUpload
                    currentAvatarUrl={avatarUrl}
                    employeeCode={form.watch('employee_code') || 'new'}
                    fullName={form.watch('full_name') || t('employeeForm.employee')}
                    onAvatarChange={setAvatarUrl}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {companies && companies.length > 1 && (
                    <FormField
                      control={form.control}
                      name="company_id"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>{t('company.title')} *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('employeeForm.selectCompany')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {companies.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="employee_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('employees.employeeCode')} *</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: NV001" {...field} disabled={isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('employees.fullName')} *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nguyễn Văn A" {...field} />
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
                        <FormLabel>{t('employees.email')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@company.vn" {...field} />
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
                        <FormLabel>{t('employees.phone')}</FormLabel>
                        <FormControl>
                          <Input placeholder="0901234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('employees.department')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('employeeForm.selectDepartment')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.name}>
                                {dept.name}
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
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('employees.position')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('employeeForm.positionPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('employees.startDate')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                        <Select onValueChange={field.onChange} value={field.value || 'active'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">{t('employees.active')}</SelectItem>
                            <SelectItem value="probation">{t('employees.probation')}</SelectItem>
                            <SelectItem value="inactive">{t('employees.inactive')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="personal" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('employeeForm.gender')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('employeeForm.selectGender')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">{t('employeeForm.male')}</SelectItem>
                            <SelectItem value="female">{t('employeeForm.female')}</SelectItem>
                            <SelectItem value="other">{t('employeeForm.other')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('employeeForm.birthDate')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="id_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('employeeForm.idNumber')}</FormLabel>
                        <FormControl>
                          <Input placeholder="012345678901" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="id_issue_place"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('employeeForm.idIssuePlace')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Công an TP.HCM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="permanent_address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>{t('employeeForm.permanentAddress')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('employeeForm.fullAddressPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="temporary_address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>{t('employeeForm.temporaryAddress')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('employeeForm.temporaryAddress')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergency_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('employeeForm.emergencyContact')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Họ tên" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergency_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('employeeForm.emergencyPhone')}</FormLabel>
                        <FormControl>
                          <Input placeholder="0901234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="work" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employment_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('employeeForm.employmentType')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('employeeForm.selectType')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full-time">{t('employeeForm.fullTime')}</SelectItem>
                            <SelectItem value="part-time">{t('employeeForm.partTime')}</SelectItem>
                            <SelectItem value="contract">{t('employeeForm.contract')}</SelectItem>
                            <SelectItem value="intern">{t('employeeForm.intern')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="work_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('employeeForm.workLocation')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('employeeForm.mainOfficePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="finance" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('employees.salary')}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="20000000" {...field} />
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
                        <FormLabel>{t('employeeForm.taxCode')}</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('employeeForm.bankName')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Vietcombank" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bank_account"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('employeeForm.bankAccount')}</FormLabel>
                        <FormControl>
                          <Input placeholder="0123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="social_insurance_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('employeeForm.socialInsurance')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Số bảo hiểm xã hội" {...field} />
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
                        <FormLabel>{t('employeeForm.healthInsurance')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Số bảo hiểm y tế" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('employeeForm.saving') : isEditing ? t('employeeForm.update') : t('employees.addEmployee')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
