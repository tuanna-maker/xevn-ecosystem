import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  LogIn,
  LogOut,
  Clock,
  MapPin,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Timer,
  Calendar,
  User,
  Building2,
} from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useAttendanceRecords, type AttendanceRecord } from '@/hooks/useAttendanceRecords';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CheckInOutWidgetProps {
  onCheckInOut?: (record: AttendanceRecord) => void;
}

export function CheckInOutWidget({ onCheckInOut }: CheckInOutWidgetProps) {
  const { t } = useTranslation();
  const { employees, isLoading: isLoadingEmployees } = useEmployees();
  const { checkIn, checkOut, fetchTodayRecord, todayRecord } = useAttendanceRecords();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'checkin' | 'checkout'>('checkin');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [attendanceType, setAttendanceType] = useState('normal');

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's record when employee changes
  useEffect(() => {
    if (selectedEmployeeId) {
      fetchTodayRecord(selectedEmployeeId).then(record => {
        setCurrentRecord(record);
      });
    } else {
      setCurrentRecord(null);
    }
  }, [selectedEmployeeId, fetchTodayRecord]);

  // Update from todayRecord
  useEffect(() => {
    if (todayRecord && todayRecord.employee_id === selectedEmployeeId) {
      setCurrentRecord(todayRecord);
    }
  }, [todayRecord, selectedEmployeeId]);

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  const handleOpenDialog = (type: 'checkin' | 'checkout') => {
    setDialogType(type);
    setLocation('');
    setNotes('');
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedEmployee) return;

    setIsProcessing(true);
    try {
      let result: AttendanceRecord | null = null;

      if (dialogType === 'checkin') {
        result = await checkIn({
          employee_id: selectedEmployee.id,
          employee_code: selectedEmployee.employee_code,
          employee_name: selectedEmployee.full_name,
          department: selectedEmployee.department || undefined,
          check_in_location: location || undefined,
          check_in_device: 'Web App',
          attendance_type: attendanceType,
          notes: notes || undefined,
        });
      } else {
        result = await checkOut(selectedEmployee.id, {
          check_out_location: location || undefined,
          check_out_device: 'Web App',
          notes: notes || undefined,
        });
      }

      if (result) {
        setCurrentRecord(result);
        onCheckInOut?.(result);
      }
    } finally {
      setIsProcessing(false);
      setDialogOpen(false);
    }
  };

  const canCheckIn = selectedEmployee && !currentRecord?.check_in_time;
  const canCheckOut = selectedEmployee && currentRecord?.check_in_time && !currentRecord?.check_out_time;

  const getStatusBadge = () => {
    if (!currentRecord) return null;

    const statusMap: Record<string, { labelKey: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      present: { labelKey: 'status.present', variant: 'default' },
      late: { labelKey: 'checkinout.lateMinutes', variant: 'destructive' },
      early_leave: { labelKey: 'status.earlyLeave', variant: 'secondary' },
      absent: { labelKey: 'status.absent', variant: 'destructive' },
    };

    const status = statusMap[currentRecord.status] || { labelKey: currentRecord.status, variant: 'outline' as const };
    const label = currentRecord.status === 'late' 
      ? t('checkinout.lateMinutes', { minutes: currentRecord.late_minutes })
      : t(status.labelKey);
    return <Badge variant={status.variant}>{label}</Badge>;
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              {t('checkinout.title')}
            </CardTitle>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(currentTime, 'EEEE, dd/MM/yyyy', { locale: vi })}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('checkinout.selectEmployee')}</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder={t('checkinout.selectEmployeePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{emp.employee_code}</span>
                      <span>-</span>
                      <span>{emp.full_name}</span>
                      {emp.department && (
                        <span className="text-muted-foreground">({emp.department})</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Employee Info */}
          {selectedEmployee && (
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <Avatar className="h-14 w-14">
                <AvatarImage src={selectedEmployee.avatar_url || ''} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {selectedEmployee.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-lg">{selectedEmployee.full_name}</div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {selectedEmployee.employee_code}
                  </span>
                  {selectedEmployee.department && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {selectedEmployee.department}
                    </span>
                  )}
                  {selectedEmployee.position && (
                    <span className="flex items-center gap-1">
                      {selectedEmployee.position}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Today's Status */}
          {selectedEmployee && currentRecord && (
            <div className="p-4 border rounded-lg bg-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{t('checkinout.todayStatus')}</span>
                {getStatusBadge()}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LogIn className="h-4 w-4 text-green-500" />
                    Check-in
                  </div>
                  <div className="font-semibold text-lg">
                    {currentRecord.check_in_time || '--:--'}
                  </div>
                  {currentRecord.check_in_location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {currentRecord.check_in_location}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LogOut className="h-4 w-4 text-orange-500" />
                    Check-out
                  </div>
                  <div className="font-semibold text-lg">
                    {currentRecord.check_out_time || '--:--'}
                  </div>
                  {currentRecord.check_out_location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {currentRecord.check_out_location}
                    </div>
                  )}
                </div>
              </div>
              {currentRecord.actual_hours && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Timer className="h-4 w-4" />
                    {t('checkinout.totalWorkHours')}
                  </span>
                  <span className="font-semibold">
                    {currentRecord.actual_hours}h
                    {currentRecord.overtime_hours && currentRecord.overtime_hours > 0 && (
                      <span className="text-primary ml-2">(+{currentRecord.overtime_hours}h OT)</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              className="flex-1 h-14 text-lg"
              variant={canCheckIn ? 'default' : 'outline'}
              disabled={!canCheckIn || isProcessing}
              onClick={() => handleOpenDialog('checkin')}
            >
              <LogIn className="mr-2 h-5 w-5" />
              Check-in
            </Button>
            <Button
              className="flex-1 h-14 text-lg"
              variant={canCheckOut ? 'destructive' : 'outline'}
              disabled={!canCheckOut || isProcessing}
              onClick={() => handleOpenDialog('checkout')}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Check-out
            </Button>
          </div>

          {/* Status Messages */}
          {selectedEmployee && !currentRecord && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-blue-700 dark:text-blue-300">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{t('checkinout.notCheckedIn')}</span>
            </div>
          )}
          {currentRecord?.check_in_time && currentRecord?.check_out_time && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm">{t('checkinout.completedToday')}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogType === 'checkin' ? (
                <>
                  <LogIn className="h-5 w-5 text-green-500" />
                  {t('checkinout.confirmCheckin')}
                </>
              ) : (
                <>
                  <LogOut className="h-5 w-5 text-orange-500" />
                  {t('checkinout.confirmCheckout')}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedEmployee && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar>
                  <AvatarFallback>{selectedEmployee.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedEmployee.full_name}</div>
                  <div className="text-sm text-muted-foreground">{selectedEmployee.employee_code}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">{t('checkinout.time')}</div>
                <div className="font-semibold text-lg">{format(currentTime, 'HH:mm:ss - dd/MM/yyyy')}</div>
              </div>
            </div>

            {dialogType === 'checkin' && (
              <div className="space-y-2">
                <Label>{t('checkinout.attendanceType')}</Label>
                <Select value={attendanceType} onValueChange={setAttendanceType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">{t('attendanceType.normal')}</SelectItem>
                    <SelectItem value="remote">{t('attendanceType.remote')}</SelectItem>
                    <SelectItem value="field_work">{t('attendanceType.fieldWork')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t('checkinout.location')} ({t('checkinout.optional')})</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('checkinout.locationPlaceholder')}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('checkinout.notes')} ({t('checkinout.optional')})</Label>
              <Textarea
                placeholder={t('checkinout.notesPlaceholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isProcessing}
              variant={dialogType === 'checkin' ? 'default' : 'destructive'}
            >
              {isProcessing ? t('checkinout.processing') : dialogType === 'checkin' ? t('checkinout.confirmCheckin') : t('checkinout.confirmCheckout')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
