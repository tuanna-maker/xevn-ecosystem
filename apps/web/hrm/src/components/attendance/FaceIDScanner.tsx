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
  XCircle,
  LogIn,
  LogOut,
  Clock,
  MapPin,
  User,
  Building2,
  AlertCircle,
  Loader2,
  UserCheck,
  RefreshCw,
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
}

export function FaceIDScanner({ onCheckInOut }: FaceIDScannerProps) {
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

  // Load models and face data on mount
  useEffect(() => {
    loadModels();
    fetchFaceData();
  }, [loadModels, fetchFaceData]);

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

  const startScanning = async () => {
    if (!modelsLoaded) {
      toast.error(t('faceIdScanner.cameraNotReady'));
      return;
    }

    const cameraStarted = await startCamera();
    if (!cameraStarted) return;

    setIsScanning(true);
    setScanStatus('scanning');
    setMatchedEmployee(null);

    // Start continuous face detection
    scanIntervalRef.current = setInterval(async () => {
      await scanForFace();
    }, 500);
  };

  const stopScanning = useCallback(() => {
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

      setScanStatus('detected');

      // Try to match the face
      const match = await matchFace(detection.descriptor, employees);

      if (match) {
        // Face matched!
        setScanStatus('matched');
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
    } else {
      setScanStatus('scanning');
    }
  };

  const handleConfirmAttendance = async (action: 'checkin' | 'checkout') => {
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
        return { text: t('faceIdScanner.scanning'), color: 'text-blue-500' };
      case 'detected':
        return { text: t('faceIdScanner.detected'), color: 'text-yellow-500' };
      case 'matched':
        return { text: t('faceIdScanner.matched'), color: 'text-green-500' };
      case 'no_match':
        return { text: t('faceIdScanner.noMatch'), color: 'text-red-500' };
      default:
        return { text: t('faceIdScanner.idle'), color: 'text-muted-foreground' };
    }
  };

  const status = getStatusMessage();

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scan className="h-5 w-5 text-primary" />
              {t('faceIdScanner.title')}
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
          {/* Loading Models */}
          {isLoadingModels && (
            <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
              <span>{t('faceIdScanner.loadingModels')}</span>
            </div>
          )}

          {/* Camera Area */}
          {!isLoadingModels && (
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/30">
                  <Scan className="h-24 w-24 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-center px-4">
                    {t('faceIdScanner.clickToStart')}
                  </p>
                </div>
              )}

              {/* Scanning Overlay */}
              {isScanning && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-center">
                    <div className="flex items-center justify-center gap-2">
                      {scanStatus === 'scanning' && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {scanStatus === 'detected' && (
                        <UserCheck className="h-4 w-4 text-yellow-400" />
                      )}
                      {scanStatus === 'matched' && (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      )}
                      <span className={status.color}>{status.text}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-3">
            {!isScanning ? (
              <Button
                onClick={startScanning}
                disabled={!modelsLoaded || isLoadingModels}
                className="flex-1 h-12"
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

          {/* Instructions */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              {t('faceIdScanner.instructions')}
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {t('faceIdScanner.instruction1')}</li>
              <li>• {t('faceIdScanner.instruction2')}</li>
              <li>• {t('faceIdScanner.instruction3')}</li>
              <li>• {t('faceIdScanner.instruction4')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              {t('faceIdScanner.confirmAttendance')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Matched Employee */}
            {matchedEmployee && (
              <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={matchedEmployee.avatar_url || ''} />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {matchedEmployee.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{matchedEmployee.full_name}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
                  <Badge variant="secondary" className="mt-2">
                    {t('faceIdScanner.accuracy')}: {matchedEmployee.confidence}%
                  </Badge>
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
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetScanner();
              }}
              className="sm:flex-1"
            >
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
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  resetScanner();
                }}
                className="sm:flex-1"
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
