/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công → Clock-In → QR scanner (S13–S14)
 * UC:         UC-HRM-ATT-CLOCK-QR
 * Purpose:    QR clock channel — camera scan + confirm check-in/out dialog
 * WorkItem:   PO-HRM-UI-BRAND-W3-ATT-E
 * Coded:      2026-08-05
 * must_keep:  checkIn/checkOut API wire; PROP-03e EmployeeQRCard SKIP; Face honesty; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-E
 * change_mode: UPGRADE
 * What: Remaster QR clock chrome → Precision Motion; DialogTitle ≥20; primary CTA; ban orange checkout icon
 * Why: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10 · inventory W3-ATT-E S13–S14
 * must_keep: mutate checkIn/checkOut signatures; no invent EmployeeQRCard; no Face LIVE; no Attendance CLOSED
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-E (RE-DISPATCH stall)
 * change_mode: FIX
 * What: Finish remaster body + evidence close after stall n=1 evidence MISS (preserve scan wires)
 * Why: PM RE-DISPATCH — prior seat evidence MISS; chrome-only remaster
 * must_keep: checkIn/checkOut + Html5Qrcode start/stop + audio beep; PROP-03e SKIP; no Attendance CLOSED
 */

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      <Card className="w-full rounded-card border-xevn-border bg-xevn-surface" data-testid="att-qr-clock-precision">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[20px] font-bold text-xevn-text">
              <QrCode className="h-5 w-5 text-xevn-primary" />
              {t('qrScanner.title')}
            </CardTitle>
            <div className="text-right">
              <div className="text-2xl font-bold text-xevn-primary tabular-nums">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-xs text-xevn-textSecondary">
                {format(currentTime, 'EEEE, dd/MM/yyyy', { locale: getDateLocale() })}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scanner Area */}
          <div className="relative rounded-card overflow-hidden bg-xevn-background border border-xevn-border">
            <div
              id={scannerContainerId}
              className={`w-full aspect-square max-h-[400px] ${!isScanning ? 'hidden' : ''}`}
            />
            
            {!isScanning && (
              <div className="w-full aspect-square max-h-[400px] flex flex-col items-center justify-center bg-xevn-background border-2 border-dashed border-xevn-border rounded-card">
                <QrCode className="h-24 w-24 text-xevn-textMuted mb-4" />
                <p className="text-[15px] text-xevn-textSecondary text-center px-4">
                  {t('qrScanner.clickToStart')}
                </p>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {scanStatus === 'error' && errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-card text-destructive">
              <XCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          {scanStatus === 'success' && scannedEmployee && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-card text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span className="text-sm">
                {t('qrScanner.recognized')}: <strong>{scannedEmployee.full_name}</strong> ({scannedEmployee.employee_code})
              </span>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-3">
            {!isScanning ? (
              <Button onClick={startScanner} className="flex-1 h-12 bg-xevn-primary hover:bg-xevn-primaryPressed text-white" data-testid="att-qr-start-scan">
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
          <div className="p-4 bg-xevn-background rounded-card border border-xevn-border">
            <h4 className="font-semibold text-[15px] text-xevn-text mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-xevn-primary" />
              {t('qrScanner.instructions')}
            </h4>
            <ul className="text-sm text-xevn-textSecondary space-y-1">
              <li>• {t('qrScanner.instruction1')}</li>
              <li>• {t('qrScanner.instruction2')}</li>
              <li>• {t('qrScanner.instruction3')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" data-testid="att-qr-confirm-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[20px] font-bold text-xevn-text">
              <QrCode className="h-5 w-5 text-xevn-primary" />
              {t('qrScanner.confirmAttendance')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Employee Info */}
            {scannedEmployee && (
              <div className="flex items-center gap-4 p-4 bg-xevn-background rounded-card border border-xevn-border">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={scannedEmployee.avatar_url || ''} />
                  <AvatarFallback className="text-lg bg-xevn-primary/10 text-xevn-primary">
                    {scannedEmployee.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-[15px] text-xevn-text">{scannedEmployee.full_name}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-xevn-textSecondary">
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
            <div className="flex items-center gap-2 p-3 bg-xevn-primary/10 rounded-card">
              <Clock className="h-5 w-5 text-xevn-primary" />
              <div>
                <div className="text-sm text-xevn-textSecondary">{t('faceIdScanner.time')}</div>
                <div className="font-semibold text-[15px] text-xevn-text tabular-nums">
                  {format(currentTime, 'HH:mm:ss - dd/MM/yyyy')}
                </div>
              </div>
            </div>

            {/* Today's Status */}
            {currentRecord && (
              <div className="p-3 border rounded-card space-y-2">
                <div className="text-sm font-medium">{t('faceIdScanner.todayStatus')}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4 text-xevn-success" />
                    <span>{t('faceIdScanner.checkIn')}:</span>
                    <strong>{currentRecord.check_in_time || '--:--'}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <LogOut className="h-4 w-4 text-xevn-warning" />
                    <span>{t('faceIdScanner.checkOut')}:</span>
                    <strong>{currentRecord.check_out_time || '--:--'}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Already Completed */}
            {isCompleted && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-card text-green-700 dark:text-green-300">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm">{t('faceIdScanner.completedToday')}</span>
              </div>
            )}

            {/* Attendance Type (for check-in) */}
            {canCheckIn && (
              <div className="space-y-2">
                <Label className="text-xevn-text">{t('faceIdScanner.attendanceType')}</Label>
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
                  <Label className="text-xevn-text">{t('faceIdScanner.location')}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-xevn-textMuted" />
                    <Input
                      placeholder={t('faceIdScanner.locationPlaceholder')}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xevn-text">{t('faceIdScanner.notes')}</Label>
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
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="sm:flex-1 border-xevn-border">
              {t('common.cancel')}
            </Button>
            {canCheckIn && (
              <Button
                onClick={() => handleConfirmAttendance('checkin')}
                disabled={isProcessing}
                className="sm:flex-1 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
                data-testid="att-qr-confirm-checkin"
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
                data-testid="att-qr-confirm-checkout"
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
