import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  QrCode,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  Clock,
  MapPin,
  User,
  Building2,
  AlertCircle,
  Volume2,
} from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useAttendanceRecords, type AttendanceRecord } from '@/hooks/useAttendanceRecords';
import { format } from 'date-fns';
import { vi, enUS, zhCN } from 'date-fns/locale';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface QRCodeScannerProps {
  onScanSuccess?: (record: AttendanceRecord) => void;
}

export function QRCodeScanner({ onScanSuccess }: QRCodeScannerProps) {
  const { t, i18n } = useTranslation();
  const { employees } = useEmployees();
  const { checkIn, checkOut, fetchTodayRecord } = useAttendanceRecords();

  const getDateLocale = () => {
    switch (i18n.language) {
      case 'en': return enUS;
      case 'zh': return zhCN;
      default: return vi;
    }
  };

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannedEmployee, setScannedEmployee] = useState<typeof employees[0] | null>(null);
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [attendanceType, setAttendanceType] = useState('normal');
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch {
          // Scanner not initialized, nothing to stop
        }
        scannerRef.current = null;
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setScanStatus('idle');
      setErrorMessage('');
      setScanResult(null);
      setScannedEmployee(null);

      const scanner = new Html5Qrcode(scannerContainerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // QR code scanned successfully
          await handleQRCodeScanned(decodedText);
          await stopScanner();
        },
        () => {
          // QR code scanning error - ignore, keep scanning
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
      setErrorMessage(t('qrScanner.cameraAccessError'));
      setScanStatus('error');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleQRCodeScanned = async (qrData: string) => {
    // Play success sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQEqpuq9gw8ACYy7kz0FGXygdgELF4WfXgEPGIOYUAEdHImXSgAdI5CYRgAcJZaYQAAZKJmZPgATLJyZPAANL52bOwEIL56dPAEFLp+fPwABLaChQgD+K6GjRwD8KaKlTAD5J6OpUQD2JaWtVwDzI6ayXQDwIam4YwDrHqy+aQDnHK/FbwDiGbLMdQDdFrbUfQDXE7ndgwDRD73miQDLCsHvkADEBcX6lwC9AML/nQC4ALv/pAC1ALb/qwCyALH/sgCwAKz/uQCvAKf/wACuAKH/xgCuAJv/zQCuAJX/0wCuAI7/2gCuAIf/4QCuAH//5wCuAHj/7gCuAHD/9ACuAGj/+gCuAF///wCuAFj/AwGwAFD/BwGzAEj/CgG3AD//DgG7ADf/EQG/AC7/FAHDADb/FwHFAC7/GQHKACf/GwHNAB//HQHRAB3/HgHUABX/HwHYAA3/HQHXAAX/HAHbAP7+GwHdAPb+GAHdAPD+FQHdAOn+EQHdAOP+DQHdAN3+CQHdANj+BAHdANL+/wDdAM7++QDdAMj+8wDdAMP+7QDdAL/+5wDdALv+4QDdALj+2wDdALX+1QDdALL+zwDdALD+yQDdAK/+wwDdAK3+vQDdAKz+twDdAKv+sQDdAKr+qwDdAKn+pQDdAKn+oADdAKj+mgDdAKj+lADdAKj+jwDdAKj+iQDdAKn+gwDdAKr+fQDdAKv+dwDdAKz+cQDdAK7+bADdALD+ZgDdALP+YADdALX+WgDdALj+VADdALz+TgDdAMD+RwDdAMT+QQDdAMn+OwDdAM3+NADdANL+LQDdANj+JwDdAN3+IADdAOP+GQDdAOr+EQDdAPD+CgDdAPf+AwDdAP/+/P/dAAb//f/dAA7/+f/dABb/9f/dAB7/8v/dACf/7v/dADD/6//dADn/5//dAET/4//dAE//3//dAFr/3P/dAGb/2P/dAHL/1f/dAH7/0f/dAIr/zv/dAJf/yv/dAKT/xv/dALD/w//dAL7/v//dAMz/u//dANj/t//dAOb/s//dAPT/sP/dAAIArP/dABABqP/dAB4BpP/dAC4Bo//dAD0Bof/dAE0Bof/dAF4BoP/dAG4BoP/dAIABoP/dAJEBof/dAKMBoP/dALQBoP/dAMcBn//dANkBnv/dAOwBnf/dAP8BnP/dABICm//dACUCmv/dADkCmf/dAEwCmP/dAGACl//dAHQClv/d');
    audio.volume = 0.5;
    audio.play().catch(() => {});

    // Find employee by employee_code or id
    const employee = employees.find(
      (e) => e.employee_code === qrData || e.id === qrData
    );

    if (!employee) {
      setScanStatus('error');
      setErrorMessage(`${t('qrScanner.employeeNotFound')}: ${qrData}`);
      toast.error(t('qrScanner.employeeNotFound'), {
        description: `${t('qrScanner.invalidQrCode')}: ${qrData}`,
      });
      return;
    }

    setScanResult(qrData);
    setScannedEmployee(employee);
    setScanStatus('success');

    // Fetch today's record for this employee
    const record = await fetchTodayRecord(employee.id);
    setCurrentRecord(record);

    // Open confirmation dialog
    setDialogOpen(true);
  };

  const handleConfirmAttendance = async (action: 'checkin' | 'checkout') => {
    if (!scannedEmployee) return;

    setIsProcessing(true);
    try {
      let result: AttendanceRecord | null = null;

      if (action === 'checkin') {
        result = await checkIn({
          employee_id: scannedEmployee.id,
          employee_code: scannedEmployee.employee_code,
          employee_name: scannedEmployee.full_name,
          department: scannedEmployee.department || undefined,
          check_in_location: location || undefined,
          check_in_device: 'QR Code Scanner',
          attendance_type: attendanceType,
          notes: notes || undefined,
        });

        if (result) {
          toast.success(t('qrScanner.checkInSuccess'), {
            description: `${scannedEmployee.full_name} - ${format(new Date(), 'HH:mm:ss')}`,
          });
        }
      } else {
        result = await checkOut(scannedEmployee.id, {
          check_out_location: location || undefined,
          check_out_device: 'QR Code Scanner',
          notes: notes || undefined,
        });

        if (result) {
          toast.success(t('qrScanner.checkOutSuccess'), {
            description: `${scannedEmployee.full_name} - ${format(new Date(), 'HH:mm:ss')}`,
          });
        }
      }

      if (result) {
        onScanSuccess?.(result);
      }

      // Reset for next scan
      resetScanner();
    } catch (error) {
      console.error('Error processing attendance:', error);
      toast.error(t('qrScanner.processError'));
    } finally {
      setIsProcessing(false);
      setDialogOpen(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setScannedEmployee(null);
    setCurrentRecord(null);
    setScanStatus('idle');
    setErrorMessage('');
    setLocation('');
    setNotes('');
    setAttendanceType('normal');
  };

  const canCheckIn = scannedEmployee && !currentRecord?.check_in_time;
  const canCheckOut = scannedEmployee && currentRecord?.check_in_time && !currentRecord?.check_out_time;
  const isCompleted = currentRecord?.check_in_time && currentRecord?.check_out_time;

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <QrCode className="h-5 w-5 text-primary" />
              {t('qrScanner.title')}
            </CardTitle>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(currentTime, 'EEEE, dd/MM/yyyy', { locale: getDateLocale() })}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scanner Area */}
          <div className="relative rounded-lg overflow-hidden bg-black/5 dark:bg-white/5">
            <div
              id={scannerContainerId}
              className={`w-full aspect-square max-h-[400px] ${!isScanning ? 'hidden' : ''}`}
            />
            
            {!isScanning && (
              <div className="w-full aspect-square max-h-[400px] flex flex-col items-center justify-center bg-muted/30 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <QrCode className="h-24 w-24 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center px-4">
                  {t('qrScanner.clickToStart')}
                </p>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {scanStatus === 'error' && errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive">
              <XCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          {scanStatus === 'success' && scannedEmployee && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span className="text-sm">
                {t('qrScanner.recognized')}: <strong>{scannedEmployee.full_name}</strong> ({scannedEmployee.employee_code})
              </span>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-3">
            {!isScanning ? (
              <Button onClick={startScanner} className="flex-1 h-12">
                <Camera className="mr-2 h-5 w-5" />
                {t('qrScanner.startScan')}
              </Button>
            ) : (
              <Button onClick={stopScanner} variant="destructive" className="flex-1 h-12">
                <CameraOff className="mr-2 h-5 w-5" />
                {t('qrScanner.stopScan')}
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              {t('qrScanner.instructions')}
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {t('qrScanner.instruction1')}</li>
              <li>• {t('qrScanner.instruction2')}</li>
              <li>• {t('qrScanner.instruction3')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              {t('qrScanner.confirmAttendance')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Employee Info */}
            {scannedEmployee && (
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={scannedEmployee.avatar_url || ''} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {scannedEmployee.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{scannedEmployee.full_name}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {scannedEmployee.employee_code}
                    </span>
                    {scannedEmployee.department && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {scannedEmployee.department}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Current Time */}
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">{t('faceIdScanner.time')}</div>
                <div className="font-semibold text-lg">
                  {format(currentTime, 'HH:mm:ss - dd/MM/yyyy')}
                </div>
              </div>
            </div>

            {/* Today's Status */}
            {currentRecord && (
              <div className="p-3 border rounded-lg space-y-2">
                <div className="text-sm font-medium">{t('faceIdScanner.todayStatus')}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4 text-green-500" />
                    <span>{t('faceIdScanner.checkIn')}:</span>
                    <strong>{currentRecord.check_in_time || '--:--'}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <LogOut className="h-4 w-4 text-orange-500" />
                    <span>{t('faceIdScanner.checkOut')}:</span>
                    <strong>{currentRecord.check_out_time || '--:--'}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Already Completed */}
            {isCompleted && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-green-700 dark:text-green-300">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm">{t('faceIdScanner.completedToday')}</span>
              </div>
            )}

            {/* Attendance Type (for check-in) */}
            {canCheckIn && (
              <div className="space-y-2">
                <Label>{t('faceIdScanner.attendanceType')}</Label>
                <Select value={attendanceType} onValueChange={setAttendanceType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">{t('faceIdScanner.office')}</SelectItem>
                    <SelectItem value="remote">{t('faceIdScanner.remote')}</SelectItem>
                    <SelectItem value="field_work">{t('faceIdScanner.fieldWork')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Location */}
            {(canCheckIn || canCheckOut) && (
              <>
                <div className="space-y-2">
                  <Label>{t('faceIdScanner.location')}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('faceIdScanner.locationPlaceholder')}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('faceIdScanner.notes')}</Label>
                  <Textarea
                    placeholder={t('faceIdScanner.notesPlaceholder')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="sm:flex-1">
              {t('common.cancel')}
            </Button>
            {canCheckIn && (
              <Button
                onClick={() => handleConfirmAttendance('checkin')}
                disabled={isProcessing}
                className="sm:flex-1"
              >
                <LogIn className="mr-2 h-4 w-4" />
                {isProcessing ? t('common.processing') : t('faceIdScanner.checkIn')}
              </Button>
            )}
            {canCheckOut && (
              <Button
                onClick={() => handleConfirmAttendance('checkout')}
                disabled={isProcessing}
                variant="destructive"
                className="sm:flex-1"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isProcessing ? t('common.processing') : t('faceIdScanner.checkOut')}
              </Button>
            )}
            {isCompleted && (
              <Button onClick={() => setDialogOpen(false)} className="sm:flex-1">
                {t('common.close')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
