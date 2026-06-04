import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, Clock, MapPin, Video, Phone, Building2, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';
import { createInterviewCatalog } from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const interviewSchema = z.object({
  interview_date: z.date({ required_error: 'Vui lĂ²ng chá»n ngĂ y phá»ng váº¥n' }),
  interview_time: z.string().min(1, 'Vui lĂ²ng chá»n giá» phá»ng váº¥n'),
  duration_minutes: z.number().min(15, 'Thá»i lÆ°á»£ng tá»‘i thiá»ƒu 15 phĂºt').max(480, 'Thá»i lÆ°á»£ng tá»‘i Ä‘a 8 giá»'),
  interview_type: z.enum(['onsite', 'online', 'phone']),
  location: z.string().max(255, 'Äá»‹a Ä‘iá»ƒm khĂ´ng quĂ¡ 255 kĂ½ tá»±').optional(),
  meeting_link: z.string().url('Link há»p khĂ´ng há»£p lá»‡').max(500, 'Link khĂ´ng quĂ¡ 500 kĂ½ tá»±').optional().or(z.literal('')),
  interviewer_name: z.string().max(100, 'TĂªn khĂ´ng quĂ¡ 100 kĂ½ tá»±').optional(),
  interviewer_email: z.string().email('Email khĂ´ng há»£p lá»‡').max(255, 'Email khĂ´ng quĂ¡ 255 kĂ½ tá»±').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Ghi chĂº khĂ´ng quĂ¡ 1000 kĂ½ tá»±').optional(),
});

type InterviewFormData = z.infer<typeof interviewSchema>;

interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  position?: string;
}

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
  onSuccess?: () => void;
}

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

const durationOptions = [
  { value: 30, label: '30 phĂºt' },
  { value: 45, label: '45 phĂºt' },
  { value: 60, label: '1 giá»' },
  { value: 90, label: '1.5 giá»' },
  { value: 120, label: '2 giá»' },
];

export function ScheduleInterviewDialog({ 
  open, 
  onOpenChange, 
  candidate,
  onSuccess 
}: ScheduleInterviewDialogProps) {
  const { toast } = useToast();
  const { currentCompanyId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InterviewFormData>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      interview_time: '09:00',
      duration_minutes: 60,
      interview_type: 'onsite',
      location: '',
      meeting_link: '',
      interviewer_name: '',
      interviewer_email: '',
      notes: '',
    },
  });

  const interviewType = form.watch('interview_type');

  const handleSubmit = async (data: InterviewFormData) => {
    if (!candidate || !currentCompanyId) {
      toast({
        title: 'Lá»—i',
        description: 'Thiáº¿u thĂ´ng tin á»©ng viĂªn hoáº·c cĂ´ng ty',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createInterviewCatalog({
        company_id: currentCompanyId,
        candidate_id: candidate.id,
        candidate_name: candidate.fullName,
        candidate_email: candidate.email,
        candidate_phone: candidate.phone ?? null,
        position: candidate.position ?? null,
        interview_date: format(data.interview_date, 'yyyy-MM-dd'),
        interview_time: data.interview_time,
        duration_minutes: data.duration_minutes,
        interview_type: data.interview_type,
        location: data.location ?? null,
        meeting_link: data.meeting_link || null,
        interviewer_name: data.interviewer_name ?? null,
        interviewer_email: data.interviewer_email || null,
        notes: data.notes ?? null,
        status: 'scheduled',
      });
      toast({
        title: 'Đã lên lịch phỏng vấn',
        description: `Lịch phỏng vấn cho ${candidate.fullName} đã được tạo thành công`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Error scheduling interview:', error);
      toast({
        title: 'Lỗi',
        description: toErrorMessage(error, 'Không thể lên lịch phỏng vấn'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!candidate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            LĂªn lá»‹ch phá»ng váº¥n
          </DialogTitle>
        </DialogHeader>

        {/* Candidate Info */}
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{candidate.fullName}</p>
              <p className="text-sm text-muted-foreground">{candidate.position || 'ChÆ°a cĂ³ vá»‹ trĂ­'}</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interview_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NgĂ y phá»ng váº¥n *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: vi })
                            ) : (
                              <span>Chá»n ngĂ y</span>
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
                          disabled={(date) => date < new Date()}
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
                name="interview_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá» phá»ng váº¥n *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <Clock className="w-4 h-4 mr-2 opacity-50" />
                          <SelectValue placeholder="Chá»n giá»" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duration & Type Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thá»i lÆ°á»£ng</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(parseInt(val))} 
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chá»n thá»i lÆ°á»£ng" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durationOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value.toString()}>
                            {opt.label}
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
                name="interview_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HĂ¬nh thá»©c</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="onsite">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Trá»±c tiáº¿p
                          </div>
                        </SelectItem>
                        <SelectItem value="online">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Online
                          </div>
                        </SelectItem>
                        <SelectItem value="phone">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Äiá»‡n thoáº¡i
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location or Meeting Link based on type */}
            {interviewType === 'onsite' && (
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Äá»‹a Ä‘iá»ƒm phá»ng váº¥n</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          {...field} 
                          placeholder="Nháº­p Ä‘á»‹a Ä‘iá»ƒm phá»ng váº¥n" 
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {interviewType === 'online' && (
              <FormField
                control={form.control}
                name="meeting_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link phĂ²ng há»p</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          {...field} 
                          placeholder="https://meet.google.com/..." 
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Interviewer Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interviewer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NgÆ°á»i phá»ng váº¥n</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="TĂªn ngÆ°á»i phá»ng váº¥n" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interviewer_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email ngÆ°á»i phá»ng váº¥n</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="email@company.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chĂº</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="ThĂ´ng tin thĂªm vá» buá»•i phá»ng váº¥n..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Há»§y
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                LĂªn lá»‹ch phá»ng váº¥n
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
