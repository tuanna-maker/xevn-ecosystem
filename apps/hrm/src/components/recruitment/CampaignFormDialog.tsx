import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { vi, enUS, zhCN } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

type CampaignFormValues = z.infer<ReturnType<typeof createSchema>>;

const createSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t('camForm.val.nameRequired')).max(200, t('camForm.val.nameMax')),
    description: z.string().optional(),
    status: z.string().min(1, t('camForm.val.statusRequired')),
    start_date: z.date({ required_error: t('camForm.val.startDateRequired') }),
    end_date: z.date().optional().nullable(),
    owner_name: z.string().optional(),
    follower_name: z.string().optional(),
    position: z.string().optional(),
    title: z.string().optional(),
    department: z.string().optional(),
    work_type: z.string().optional(),
    location: z.string().optional(),
    evaluation_criteria: z.string().optional(),
    salary_level: z.string().optional(),
    quantity: z.coerce.number().min(1, t('camForm.val.quantityMin')).optional(),
    requirements: z.string().optional(),
    degree: z.string().optional(),
    major: z.string().optional(),
  });

interface Campaign {
  id: string;
  company_id: string;
  name: string;
  description?: string | null;
  status: string;
  start_date: string;
  end_date?: string | null;
  owner_name?: string | null;
  follower_name?: string | null;
  position?: string | null;
  title?: string | null;
  department?: string | null;
  work_type?: string | null;
  location?: string | null;
  evaluation_criteria?: string | null;
  salary_level?: string | null;
  quantity?: number | null;
  requirements?: string | null;
  degree?: string | null;
  major?: string | null;
}

interface CampaignFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Campaign | null;
  companyId: string;
  onSuccess: () => void;
}

export function CampaignFormDialog({
  open,
  onOpenChange,
  campaign,
  companyId,
  onSuccess,
}: CampaignFormDialogProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  const d = (key: string) => String(t(`camForm.${key}`));
  const calLocale = i18n.language === 'vi' ? vi : i18n.language === 'zh' ? zhCN : enUS;

  const statusOptions = [
    { value: 'active', label: d('status.active') },
    { value: 'completed', label: d('status.completed') },
    { value: 'paused', label: d('status.paused') },
    { value: 'cancelled', label: d('status.cancelled') },
  ];

  const workTypeOptions = [
    { value: 'onsite', label: d('workType.onsite') },
    { value: 'remote', label: d('workType.remote') },
    { value: 'hybrid', label: d('workType.hybrid') },
  ];

  const degreeOptions = [
    { value: 'vocational', label: d('degree.vocational') },
    { value: 'college', label: d('degree.college') },
    { value: 'bachelor', label: d('degree.bachelor') },
    { value: 'master', label: d('degree.master') },
    { value: 'phd', label: d('degree.phd') },
    { value: 'none', label: d('degree.none') },
  ];

  const schema = createSchema(t);

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', description: '', status: 'active',
      start_date: new Date(), end_date: null,
      owner_name: '', follower_name: '', position: '', title: '',
      department: '', work_type: '', location: '', evaluation_criteria: '',
      salary_level: '', quantity: 1, requirements: '', degree: '', major: '',
    },
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!companyId) return;
      const { data } = await supabase
        .from('departments')
        .select('id, name')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .order('name');
      if (data) setDepartments(data);
    };
    fetchDepartments();
  }, [companyId]);

  useEffect(() => {
    if (campaign) {
      form.reset({
        name: campaign.name, description: campaign.description || '',
        status: campaign.status,
        start_date: campaign.start_date ? new Date(campaign.start_date) : new Date(),
        end_date: campaign.end_date ? new Date(campaign.end_date) : null,
        owner_name: campaign.owner_name || '', follower_name: campaign.follower_name || '',
        position: campaign.position || '', title: campaign.title || '',
        department: campaign.department || '', work_type: campaign.work_type || '',
        location: campaign.location || '', evaluation_criteria: campaign.evaluation_criteria || '',
        salary_level: campaign.salary_level || '', quantity: campaign.quantity || 1,
        requirements: campaign.requirements || '', degree: campaign.degree || '',
        major: campaign.major || '',
      });
    } else {
      form.reset({
        name: '', description: '', status: 'active',
        start_date: new Date(), end_date: null,
        owner_name: '', follower_name: '', position: '', title: '',
        department: '', work_type: '', location: '', evaluation_criteria: '',
        salary_level: '', quantity: 1, requirements: '', degree: '', major: '',
      });
    }
  }, [campaign, form, open]);

  const onSubmit = async (data: CampaignFormValues) => {
    setIsSubmitting(true);
    try {
      const campaignData = {
        company_id: companyId,
        name: data.name,
        description: data.description || null,
        status: data.status,
        start_date: format(data.start_date, 'yyyy-MM-dd'),
        end_date: data.end_date ? format(data.end_date, 'yyyy-MM-dd') : null,
        owner_name: data.owner_name || null,
        follower_name: data.follower_name || null,
        position: data.position || null,
        title: data.title || null,
        department: data.department || null,
        work_type: data.work_type || null,
        location: data.location || null,
        evaluation_criteria: data.evaluation_criteria || null,
        salary_level: data.salary_level || null,
        quantity: data.quantity || null,
        requirements: data.requirements || null,
        degree: data.degree || null,
        major: data.major || null,
      };

      if (campaign) {
        const { error } = await supabase
          .from('recruitment_campaigns')
          .update(campaignData)
          .eq('id', campaign.id);
        if (error) throw error;
        toast({ title: t('common.success'), description: d('updateSuccess') });
      } else {
        const { error } = await supabase
          .from('recruitment_campaigns')
          .insert(campaignData);
        if (error) throw error;
        toast({ title: t('common.success'), description: d('createSuccess') });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving campaign:', error);
      toast({
        title: t('common.error'),
        description: error.message || d('saveError'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {campaign ? d('editTitle') : d('createTitle')}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">{d('sectionBasic')}</h3>
                
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{d('campaignName')} *</FormLabel>
                    <FormControl><Input placeholder={d('campaignNamePlaceholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{d('description')}</FormLabel>
                    <FormControl><Textarea placeholder={d('descriptionPlaceholder')} rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.status.label')} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder={d('selectStatus')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {statusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="start_date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('startDate')} *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                              {field.value ? format(field.value, 'dd/MM/yyyy', { locale: calLocale }) : <span>{d('selectDate')}</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={calLocale} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="end_date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('endDate')}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                              {field.value ? format(field.value, 'dd/MM/yyyy', { locale: calLocale }) : <span>{d('selectDate')}</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} locale={calLocale} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="owner_name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('owner')}</FormLabel>
                      <FormControl><Input placeholder={d('ownerPlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="follower_name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('follower')}</FormLabel>
                      <FormControl><Input placeholder={d('followerPlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Position Info */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-sm text-muted-foreground">{d('sectionPosition')}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="position" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('position')}</FormLabel>
                      <FormControl><Input placeholder={d('positionPlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('jobTitle')}</FormLabel>
                      <FormControl><Input placeholder={d('jobTitlePlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="department" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('payroll.department')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder={d('selectDepartment')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="work_type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('workType.label')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder={d('selectWorkType')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {workTypeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('location')}</FormLabel>
                      <FormControl><Input placeholder={d('locationPlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="salary_level" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('salaryLevel')}</FormLabel>
                      <FormControl><Input placeholder={d('salaryLevelPlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="quantity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('quantity')}</FormLabel>
                      <FormControl><Input type="number" min={1} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-sm text-muted-foreground">{d('sectionRequirements')}</h3>

                <FormField control={form.control} name="requirements" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{d('requirements')}</FormLabel>
                    <FormControl><Textarea placeholder={d('requirementsPlaceholder')} rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="degree" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('educationLevel')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder={d('selectDegree')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {degreeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="major" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('major')}</FormLabel>
                      <FormControl><Input placeholder={d('majorPlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="evaluation_criteria" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('evaluationTemplate')}</FormLabel>
                      <FormControl><Input placeholder={d('evaluationTemplatePlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {campaign ? t('common.update') : d('createBtn')}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
