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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const interviewSchema = z.object({
  interview_date: z.date({ required_error: 'Vui lòng chọn ngày phỏng vấn' }),
  interview_time: z.string().min(1, 'Vui lòng chọn giờ phỏng vấn'),
  duration_minutes: z.number().min(15, 'Thời lượng tối thiểu 15 phút').max(480, 'Thời lượng tối đa 8 giờ'),
  interview_type: z.enum(['onsite', 'online', 'phone']),
  location: z.string().max(255, 'Địa điểm không quá 255 ký tự').optional(),
  meeting_link: z.string().url('Link họp không hợp lệ').max(500, 'Link không quá 500 ký tự').optional().or(z.literal('')),
  interviewer_name: z.string().max(100, 'Tên không quá 100 ký tự').optional(),
  interviewer_email: z.string().email('Email không hợp lệ').max(255, 'Email không quá 255 ký tự').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Ghi chú không quá 1000 ký tự').optional(),
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
  { value: 30, label: '30 phút' },
  { value: 45, label: '45 phút' },
  { value: 60, label: '1 giờ' },
  { value: 90, label: '1.5 giờ' },
  { value: 120, label: '2 giờ' },
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
        title: 'Lỗi',
        description: 'Thiếu thông tin ứng viên hoặc công ty',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('interviews').insert({
        company_id: currentCompanyId,
        candidate_name: candidate.fullName,
        candidate_email: candidate.email,
        candidate_phone: candidate.phone || null,
        position: candidate.position || null,
        interview_date: format(data.interview_date, 'yyyy-MM-dd'),
        interview_time: data.interview_time,
        duration_minutes: data.duration_minutes,
        interview_type: data.interview_type,
        location: data.location || null,
        meeting_link: data.meeting_link || null,
        interviewer_name: data.interviewer_name || null,
        interviewer_email: data.interviewer_email || null,
        notes: data.notes || null,
        status: 'scheduled',
      });

      if (error) throw error;

      toast({
        title: 'Đã lên lịch phỏng vấn',
        description: `Lịch phỏng vấn cho ${candidate.fullName} đã được tạo thành công`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error scheduling interview:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể lên lịch phỏng vấn',
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
            Lên lịch phỏng vấn
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
              <p className="text-sm text-muted-foreground">{candidate.position || 'Chưa có vị trí'}</p>
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
                    <FormLabel>Ngày phỏng vấn *</FormLabel>
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
                              <span>Chọn ngày</span>
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
                    <FormLabel>Giờ phỏng vấn *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <Clock className="w-4 h-4 mr-2 opacity-50" />
                          <SelectValue placeholder="Chọn giờ" />
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
                    <FormLabel>Thời lượng</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(parseInt(val))} 
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn thời lượng" />
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
                    <FormLabel>Hình thức</FormLabel>
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
                            Trực tiếp
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
                            Điện thoại
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
                    <FormLabel>Địa điểm phỏng vấn</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          {...field} 
                          placeholder="Nhập địa điểm phỏng vấn" 
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
                    <FormLabel>Link phòng họp</FormLabel>
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
                    <FormLabel>Người phỏng vấn</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tên người phỏng vấn" />
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
                    <FormLabel>Email người phỏng vấn</FormLabel>
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
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Thông tin thêm về buổi phỏng vấn..."
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
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Lên lịch phỏng vấn
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
