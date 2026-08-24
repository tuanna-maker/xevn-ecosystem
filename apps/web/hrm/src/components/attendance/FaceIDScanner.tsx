/**
 * @CODE-MEMORY
 * Screen:     /attendance → Clock-In → Khuôn mặt (S17–S18 shell)
 * UC:         MOB-04 Face MVP (mobile) · web = honesty only
 * BR:         R-FACE-01 web STUB · ADR A5 stub honesty
 * SRS:        docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md S17–S18
 * TechSpec:   ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10
 * Purpose:    Shell nhận diện khuôn mặt web — chrome Precision Motion; featureHold chặn mutate LIVE.
 * WorkItem:   PO-HRM-UI-BRAND-W3-ATT-G1
 * Coded:      2026-08-05
 * must_keep:  featureHold block check-in/out; không claim Face LIVE; PROP-03e QR card SKIP riêng
 * SOLID:      Scanner UI tách hook useFaceRecognition
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-G1
 * change_mode: UPGRADE
 * What: Remaster Face scan chrome — titles ≥20, primary #1E40AF, ban blue/orange AI; keep featureHold
 * Why: inventory W3-ATT-G1 S17–S18 · ADR §8–§10
 * must_keep: featureHold mutate block; no Face LIVE invent; parent pointer-events-none shell
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-G1 stall#2
 * change_mode: FIX
 * What: Confirm GĐ2-HOLD chrome + DialogTitle ≥20; no LIVE enable; evidence close
 * Why: PM RE-DISPATCH stall evidence MISS
 * must_keep: featureHold; no Face LIVE invent
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Scan,
  Camera,
  CameraOff,
  CheckCircle2,
  LogIn,
  LogOut,
  Clock,
  MapPin,
  User,
  Building2,
  AlertCircle,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useAttendanceRecords, type AttendanceRecord } from '@/hooks/useAttendanceRecords';
import { useFaceRecognition } from '@/hooks/useFaceRecognition';
import { format } from 'date-fns';
import { vi, enUS, zhCN } from 'date-fns/locale';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface FaceIDScannerProps {
  onCheckInOut?: (record: AttendanceRecord) => void;
  /** GĐ2-HOLD — block mutate + success toasts (PO-MFD-M2). */
  featureHold?: boolean;
}

export function FaceIDScanner({ onCheckInOut, featureHold = false }: FaceIDScannerProps) {
  const { t, i18n } = useTranslation();
  const { employees } = useEmployees();
  const { checkIn, checkOut, fetchTodayRecord } = useAttendanceRecords();
  const {
    modelsLoaded,
    isLoadingModels,
    loadModels,
    detectFace,
    matchFace,
    fetchFaceData,
  } = useFaceRecognition();

  const getDateLocale = () => {
    switch (i18n.language) {
      case 'en': return enUS;
      case 'zh': return zhCN;
      default: return vi;
    }
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'detected' | 'matched' | 'no_match'>('idle');
  const [matchedEmployee, setMatchedEmployee] = useState<{
    id: string;
    full_name: string;
    employee_code: string;
    department?: string;
    avatar_url?: string;
    confidence: number;
  } | null>(null);
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [attendanceType, setAttendanceType] = useState('normal');

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // Load models and face data on mount - only once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadModels(); fetchFaceData(); }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      streamRef.current = stream;
      return true;
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error(t('faceIdScanner.cameraAccessError'));
      return false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const isScanningRef = useRef(false);
  
  const startScanning = async () => {
    if (!modelsLoaded) {
      toast.error(t('faceIdScanner.cameraNotReady'));
      return;
    }

    const cameraStarted = await startCamera();
    if (!cameraStarted) return;

    setIsScanning(true);
    isScanningRef.current = true;
    setScanStatus('scanning');
    setMatchedEmployee(null);

    // Wait for video to be ready before starting scan
    const waitForVideo = () => {
      return new Promise<void>((resolve) => {
        const check = () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    };

    const scanLoop = async () => {
      await waitForVideo();
      
      // Scan with debounce - only scan when isScanningRef is still true
      while (isScanningRef.current) {
        await scanForFace();
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms debounce between scans
      }
    };

    scanLoop();
  };

  const stopScanning = useCallback(() => {
    // Set ref to false first to stop the async while loop
    isScanningRef.current = false;
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    stopCamera();
    setIsScanning(false);
    setScanStatus('idle');
  }, []);

  const scanForFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const detection = await detectFace(videoRef.current);

    if (detection) {
      // Draw face detection on canvas
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        const box = detection.detection.box;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
      }

      if (scanStatus !== 'detected') {
        setScanStatus('detected');
      }

      // Try to match the face
      const match = await matchFace(detection.descriptor, employees);

      if (match) {
        // Face matched!
        if (scanStatus !== 'matched') {
          setScanStatus('matched');
        }
        const employee = employees.find((e) => e.id === match.employee_id);
        
        if (employee) {
          setMatchedEmployee({
            id: employee.id,
            full_name: employee.full_name,
            employee_code: employee.employee_code,
            department: employee.department || undefined,
            avatar_url: employee.avatar_url || undefined,
            confidence: match.confidence,
          });

          // Fetch today's record
          const record = await fetchTodayRecord(employee.id);
          setCurrentRecord(record);

          // Stop scanning and open dialog
          stopScanning();
          setDialogOpen(true);

          // Play success sound
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQEqpuq9gw8ACYy7kz0FGXygdgELF4WfXgEPGIOYUAEdHImXSgAdI5CYRgAcJZaYQAAZKJmZPgATLJyZPAANL52bOwEIL56dPAEFLp+fPwABLaChQgD+K6GjRwD8KaKlTAD5J6OpUQD2JaWtVwDzI6ayXQDwIam4YwDrHqy+aQDnHK/FbwDiGbLMdQDdFrbUfQDXE7ndgwDRD73miQDLCsHvkADEBcX6lwC9AML/nQC4ALv/pAC1ALb/qwCyALH/sgCwAKz/uQCvAKf/wACuAKH/xgCuAJv/zQCuAJX/0wCuAI7/2gCuAIf/4QCuAH//5wCuAHj/7gCuAHD/9ACuAGj/+gCuAF///wCuAFj/AwGwAFD/BwGzAEj/CgG3AD//DgG7ADf/EQG/AC7/FAHDADb/FwHFAC7/GQHKACf/GwHNAB//HQHRAB3/HgHUABX/HwHYAA3/HQHXAAX/HAHbAP7+GwHdAPb+GAHdAPD+FQHdAOn+EQHdAOP+DQHdAN3+CQHdANj+BAHdANL+/wDdAM7++QDdAMj+8wDdAMP+7QDdAL/+5wDdALv+4QDdALj+2wDdALX+1QDdALL+zwDdALD+yQDdAK/+wwDdAK3+vQDdAKz+twDdAKv+sQDdAKr+qwDdAKn+pQDdAKn+oADdAKj+mgDdAKj+lADdAKj+jwDdAKj+iQDdAKn+gwDdAKr+fQDdAKv+dwDdAKz+cQDdAK7+bADdALD+ZgDdALP+YADdALX+WgDdALj+VADdALz+TgDdAMD+RwDdAMT+QQDdAMn+OwDdAM3+NADdANL+LQDdANj+JwDdAN3+IADdAOP+GQDdAOr+EQDdAPD+CgDdAPf+AwDdAP/+/P/dAAb//f/dAA7/+f/dABb/9f/dAB7/8v/dACf/7v/dADD/6//dADn/5//dAET/4//dAE//3//dAFr/3P/dAGb/2P/dAHL/1f/dAH7/0f/dAIr/zv/dAJf/yv/dAKT/xv/dALD/w//dAL7/v//dAMz/u//dANj/t//dAOb/s//dAPT/sP/dAAIArP/dABABqP/dAB4BpP/dAC4Bo//dAD0Bof/dAE0Bof/dAF4BoP/dAG4BoP/dAIABoP/dAJEBof/dAKMBoP/dALQBoP/dAMcBn//dANkBnv/dAOwBnf/dAP8BnP/dABICm//dACUCmv/dADkCmf/dAEwCmP/dAGACl//dAHQClv/d');
          audio.volume = 0.5;
          audio.play().catch(() => {});

          toast.success(`${t('faceIdScanner.recognitionSuccess')}: ${employee.full_name}`, {
            description: `${t('faceIdScanner.accuracy')}: ${match.confidence}%`,
          });
        }
      }
    }
    // Don't set 'scanning' status when no face detected - prevents flickering
  };

  const handleConfirmAttendance = async (action: 'checkin' | 'checkout') => {
    if (featureHold) {
      toast.error(t('attPage.faceIdHold'));
      return;
    }
    if (!matchedEmployee) return;

    setIsProcessing(true);
    try {
      let result: AttendanceRecord | null = null;

      if (action === 'checkin') {
        result = await checkIn({
          employee_id: matchedEmployee.id,
          employee_code: matchedEmployee.employee_code,
          employee_name: matchedEmployee.full_name,
          department: matchedEmployee.department,
          check_in_location: location || undefined,
          check_in_device: 'Face ID',
          attendance_type: attendanceType,
          notes: notes || undefined,
        });

        if (result) {
          toast.success(t('faceIdScanner.checkInSuccess'), {
            description: `${matchedEmployee.full_name} - ${format(new Date(), 'HH:mm:ss')}`,
          });
        }
      } else {
        result = await checkOut(matchedEmployee.id, {
          check_out_location: location || undefined,
          check_out_device: 'Face ID',
          notes: notes || undefined,
        });

        if (result) {
          toast.success(t('faceIdScanner.checkOutSuccess'), {
            description: `${matchedEmployee.full_name} - ${format(new Date(), 'HH:mm:ss')}`,
          });
        }
      }

      if (result) {
        onCheckInOut?.(result);
      }

      resetScanner();
    } catch (error) {
      console.error('Error processing attendance:', error);
      toast.error(t('faceIdScanner.processError'));
    } finally {
      setIsProcessing(false);
      setDialogOpen(false);
    }
  };

  const resetScanner = () => {
    setMatchedEmployee(null);
    setCurrentRecord(null);
    setScanStatus('idle');
    setLocation('');
    setNotes('');
    setAttendanceType('normal');
  };

  const canCheckIn = matchedEmployee && !currentRecord?.check_in_time;
  const canCheckOut = matchedEmployee && currentRecord?.check_in_time && !currentRecord?.check_out_time;
  const isCompleted = currentRecord?.check_in_time && currentRecord?.check_out_time;

  const getStatusMessage = () => {
    switch (scanStatus) {
      case 'scanning':
        return { text: t('faceIdScanner.scanning'), color: 'text-xevn-primary' };
      case 'detected':
        return { text: t('faceIdScanner.detected'), color: 'text-xevn-warning' };
      case 'matched':
        return { text: t('faceIdScanner.matched'), color: 'text-xevn-success' };
      case 'no_match':
        return { text: t('faceIdScanner.noMatch'), color: 'text-xevn-danger' };
      default:
        return { text: t('faceIdScanner.idle'), color: 'text-xevn-textSecondary' };
    }
  };

  const status = getStatusMessage();

  return (
    <>
      <Card className="w-full rounded-card border-xevn-border bg-xevn-surface" data-testid="att-faceid-scanner-precision">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex flex-wrap items-center gap-2 text-[20px] font-bold text-xevn-text">
              <Scan className="h-5 w-5 text-xevn-primary" />
              {t('faceIdScanner.title')}
              {featureHold ? (
                <Badge variant="outline" className="border-xevn-border text-xevn-textSecondary text-[10px] font-semibold">
                  {t('attPage.gd2HoldBadge', 'GĐ2')}
                </Badge>
              ) : null}
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
          {isLoadingModels && (
            <div className="flex items-center justify-center p-8 bg-xevn-background rounded-lg border border-xevn-border">
              <Loader2 className="h-8 w-8 animate-spin text-xevn-primary mr-3" />
              <span className="text-[15px] text-xevn-text">{t('faceIdScanner.loadingModels')}</span>
            </div>
          )}

          {!isLoadingModels && (
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video border border-xevn-border">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!isScanning ? 'hidden' : ''}`}
              />
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full ${!isScanning ? 'hidden' : ''}`}
              />

              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-xevn-background/90">
                  <Scan className="h-24 w-24 text-xevn-textMuted mb-4" />
                  <p className="text-xevn-textSecondary text-center px-4 text-[15px]">
                    {featureHold
                      ? t('attPage.faceIdHold')
                      : t('faceIdScanner.clickToStart')}
                  </p>
                </div>
              )}

              {isScanning && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/60 rounded-lg p-3 text-white text-center">
                    <div className="flex items-center justify-center gap-2">
                      {scanStatus === 'scanning' && (
                        <Loader2 className="h-4 w-4 animate-spin text-xevn-primary" />
                      )}
                      {scanStatus === 'detected' && (
                        <UserCheck className="h-4 w-4 text-xevn-warning" />
                      )}
                      {scanStatus === 'matched' && (
                        <CheckCircle2 className="h-4 w-4 text-xevn-success" />
                      )}
                      <span className={status.color}>{status.text}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            {!isScanning ? (
              <Button
                onClick={startScanning}
                disabled={featureHold || !modelsLoaded || isLoadingModels}
                className="flex-1 h-12 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
                title={featureHold ? t('attPage.faceIdHold') : undefined}
                data-testid="att-faceid-start-scan"
              >
                <Camera className="mr-2 h-5 w-5" />
                {t('faceIdScanner.startScan')}
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="destructive" className="flex-1 h-12">
                <CameraOff className="mr-2 h-5 w-5" />
                {t('faceIdScanner.stopScan')}
              </Button>
            )}
          </div>

          <div className="p-4 bg-xevn-background rounded-lg border border-xevn-border">
            <h4 className="font-semibold text-[15px] text-xevn-text mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-xevn-primary" />
              {t('faceIdScanner.instructions')}
            </h4>
            <ul className="text-sm text-xevn-textSecondary space-y-1">
              <li>• {t('faceIdScanner.instruction1')}</li>
              <li>• {t('faceIdScanner.instruction2')}</li>
              <li>• {t('faceIdScanner.instruction3')}</li>
              <li>• {t('faceIdScanner.instruction4')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* S18 Confirm — honesty when featureHold; chrome Precision Motion */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md border-xevn-border" data-testid="att-faceid-confirm-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[20px] font-bold text-xevn-text">
              <UserCheck className="h-5 w-5 text-xevn-success" />
              {t('faceIdScanner.confirmAttendance')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {featureHold ? (
              <p className="text-[15px] text-xevn-textSecondary" data-testid="att-faceid-confirm-hold">
                {t('attPage.faceIdHold')}
              </p>
            ) : null}
            {matchedEmployee && (
              <div className="flex items-center gap-4 p-4 bg-xevn-success/10 rounded-lg border border-xevn-border">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={matchedEmployee.avatar_url || ''} />
                  <AvatarFallback className="text-xl bg-xevn-primary/10 text-xevn-primary">
                    {matchedEmployee.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-lg text-xevn-text">{matchedEmployee.full_name}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-xevn-textSecondary">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {matchedEmployee.employee_code}
                    </span>
                    {matchedEmployee.department && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {matchedEmployee.department}
                      </span>
                    )}
                  </div>
                  <Badge variant="secondary" className="mt-2 text-xevn-text">
                    {t('faceIdScanner.accuracy')}: {matchedEmployee.confidence}%
                  </Badge>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-xevn-primary/10 rounded-lg border border-xevn-border">
              <Clock className="h-5 w-5 text-xevn-primary" />
              <div>
                <div className="text-sm text-xevn-textSecondary">{t('faceIdScanner.time')}</div>
                <div className="font-semibold text-lg text-xevn-text">
                  {format(currentTime, 'HH:mm:ss - dd/MM/yyyy')}
                </div>
              </div>
            </div>

            {currentRecord && (
              <div className="p-3 border border-xevn-border rounded-lg space-y-2">
                <div className="text-sm font-medium text-xevn-text">{t('faceIdScanner.todayStatus')}</div>
                <div className="grid grid-cols-2 gap-2 text-sm text-xevn-text">
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4 text-xevn-success" />
                    <span>{t('faceIdScanner.checkIn')}:</span>
                    <strong>{currentRecord.check_in_time || '--:--'}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <LogOut className="h-4 w-4 text-xevn-primary" />
                    <span>{t('faceIdScanner.checkOut')}:</span>
                    <strong>{currentRecord.check_out_time || '--:--'}</strong>
                  </div>
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="flex items-center gap-2 p-3 bg-xevn-success/10 rounded-lg text-xevn-success border border-xevn-border">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm">{t('faceIdScanner.completedToday')}</span>
              </div>
            )}

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
                      className="pl-9 text-xevn-text"
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
                    className="text-xevn-text"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetScanner();
              }}
              className="sm:flex-1 border-xevn-border text-xevn-text"
            >
              {t('common.cancel')}
            </Button>
            {canCheckIn && (
              <Button
                onClick={() => handleConfirmAttendance('checkin')}
                disabled={isProcessing || featureHold}
                className="sm:flex-1 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
                title={featureHold ? t('attPage.faceIdHold') : undefined}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {isProcessing ? t('common.processing') : t('faceIdScanner.checkIn')}
              </Button>
            )}
            {canCheckOut && (
              <Button
                onClick={() => handleConfirmAttendance('checkout')}
                disabled={isProcessing || featureHold}
                className="sm:flex-1 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
                title={featureHold ? t('attPage.faceIdHold') : undefined}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isProcessing ? t('common.processing') : t('faceIdScanner.checkOut')}
              </Button>
            )}
            {isCompleted && (
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  resetScanner();
                }}
                className="sm:flex-1 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
              >
                {t('common.close')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
