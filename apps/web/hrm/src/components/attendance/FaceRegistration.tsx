/**
 * @CODE-MEMORY
 * Screen:     /attendance → Clock-In → Face đăng ký / xóa (S17, S19)
 * UC:         MOB-04 Face MVP (mobile) · web = honesty only
 * BR:         R-FACE-01 web STUB · ADR A5 stub honesty
 * SRS:        docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md S17 · S19
 * TechSpec:   ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10
 * Purpose:    Shell đăng ký khuôn mặt web — chrome Precision Motion; featureHold chặn register/delete LIVE.
 * WorkItem:   PO-HRM-UI-BRAND-W3-ATT-G1
 * Coded:      2026-08-05
 * must_keep:  featureHold block register/delete; không claim Face LIVE
 * SOLID:      Registration UI tách hook useFaceRecognition
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-G1
 * change_mode: UPGRADE
 * What: Remaster Face registration chrome — titles ≥20, primary CTA, AlertDialog ≥20; keep featureHold
 * Why: inventory W3-ATT-G1 S17/S19 · ADR §8–§10
 * must_keep: featureHold mutate block; no Face LIVE invent
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-G1 stall#2
 * change_mode: FIX
 * What: Confirm S19 delete AlertDialog ≥20 + GĐ2 badge; no LIVE enable; evidence close
 * Why: PM RE-DISPATCH stall evidence MISS
 * must_keep: featureHold; no Face LIVE invent
 */
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  UserPlus,
  Camera,
  CameraOff,
  CheckCircle2,
  Loader2,
  User,
  Building2,
  Briefcase,
  Trash2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useFaceRecognition } from '@/hooks/useFaceRecognition';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function FaceRegistration({ featureHold = false }: { featureHold?: boolean }) {
  const { t } = useTranslation();
  const { employees } = useEmployees();
  const {
    modelsLoaded,
    isLoadingModels,
    loadModels,
    detectFace,
    registerFace,
    deleteFaceData,
    hasRegisteredFace,
    fetchFaceData,
    faceDataList,
  } = useFaceRecognition();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedFace, setCapturedFace] = useState<{
    imageDataUrl: string;
    descriptor: Float32Array;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const employeeHasFace = selectedEmployeeId && hasRegisteredFace(selectedEmployeeId);

  useEffect(() => {
    loadModels();
    fetchFaceData();
  }, [loadModels, fetchFaceData]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
      setIsCameraOn(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error(t('faceRegistration.cameraError'));
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
    setIsCameraOn(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) {
      toast.error(t('faceRegistration.cameraNotReady'));
      return;
    }

    setIsCapturing(true);
    try {
      const detection = await detectFace(videoRef.current);

      if (!detection) {
        toast.error(t('faceRegistration.noFaceDetected'));
        setIsCapturing(false);
        return;
      }

      // Capture image from video
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(video, 0, 0);

        // Draw face detection box
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        const box = detection.detection.box;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedFace({
          imageDataUrl,
          descriptor: detection.descriptor,
        });

        toast.success(t('faceRegistration.captureSuccess'));
      }
    } catch (error) {
      console.error('Error capturing face:', error);
      toast.error(t('faceRegistration.captureError'));
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRegister = async () => {
    if (featureHold) {
      toast.error(t('attPage.faceIdHold'));
      return;
    }
    if (!capturedFace || !selectedEmployeeId) {
      toast.error(t('faceRegistration.selectAndCapture'));
      return;
    }

    const success = await registerFace(
      selectedEmployeeId,
      capturedFace.descriptor,
      capturedFace.imageDataUrl
    );

    if (success) {
      setCapturedFace(null);
      stopCamera();
    }
  };

  const handleDelete = async () => {
    if (featureHold) {
      toast.error(t('attPage.faceIdHold'));
      return;
    }
    if (!selectedEmployeeId) return;

    const success = await deleteFaceData(selectedEmployeeId);
    if (success) {
      setDeleteDialogOpen(false);
    }
  };

  const retakePhoto = () => {
    setCapturedFace(null);
  };

  // Get list of employees with registered faces
  const registeredEmployeeIds = new Set(faceDataList.map((d) => d.employee_id));

  return (
    <>
      <Card className="w-full rounded-card border-xevn-border bg-xevn-surface" data-testid="att-face-registration-precision">
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-wrap items-center gap-2 text-[20px] font-bold text-xevn-text">
            <UserPlus className="h-5 w-5 text-xevn-primary" />
            {t('faceRegistration.title')}
            {featureHold ? (
              <Badge variant="outline" className="border-xevn-border text-xevn-textSecondary text-[10px] font-semibold">
                {t('attPage.gd2HoldBadge', 'GĐ2')}
              </Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingModels && (
            <div className="flex items-center justify-center p-8 bg-xevn-background rounded-lg border border-xevn-border">
              <Loader2 className="h-8 w-8 animate-spin text-xevn-primary mr-3" />
              <span className="text-[15px] text-xevn-text">{t('faceRegistration.loadingModels')}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium text-xevn-text">{t('faceRegistration.selectEmployee')}</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId} disabled={featureHold}>
              <SelectTrigger className="text-xevn-text">
                <SelectValue placeholder={t('faceRegistration.selectEmployeePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{emp.employee_code}</span>
                      <span>-</span>
                      <span>{emp.full_name}</span>
                      {registeredEmployeeIds.has(emp.id) && (
                        <Badge variant="secondary" className="ml-2 text-xs text-xevn-text">
                          <CheckCircle2 className="h-3 w-3 mr-1 text-xevn-success" />
                          {t('faceRegistration.registered')}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEmployee && (
            <div className="flex items-center gap-4 p-4 bg-xevn-background rounded-lg border border-xevn-border">
              <Avatar className="h-14 w-14">
                <AvatarImage src={selectedEmployee.avatar_url || ''} />
                <AvatarFallback className="text-lg bg-xevn-primary/10 text-xevn-primary">
                  {selectedEmployee.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-lg text-xevn-text">{selectedEmployee.full_name}</div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-xevn-textSecondary">
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
                      <Briefcase className="h-3.5 w-3.5" />
                      {selectedEmployee.position}
                    </span>
                  )}
                </div>
              </div>
              {employeeHasFace && (
                <Badge className="bg-xevn-success text-white hover:bg-xevn-success">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {t('faceRegistration.registered')}
                </Badge>
              )}
            </div>
          )}

          {!isLoadingModels && selectedEmployee && (
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video border border-xevn-border">
              {!capturedFace ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
                  />
                  {!isCameraOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-xevn-background/90">
                      <Camera className="h-16 w-16 text-xevn-textMuted mb-4" />
                      <p className="text-xevn-textSecondary text-[15px] text-center px-4">
                        {featureHold
                          ? t('attPage.faceIdHold')
                          : t('faceRegistration.clickToStart')}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <img
                  src={capturedFace.imageDataUrl}
                  alt="Captured face"
                  className="w-full h-full object-cover"
                />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {selectedEmployee && !isLoadingModels && (
            <div className="flex flex-wrap gap-3">
              {!capturedFace ? (
                <>
                  {!isCameraOn ? (
                    <Button
                      onClick={startCamera}
                      disabled={featureHold}
                      className="flex-1 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
                      title={featureHold ? t('attPage.faceIdHold') : undefined}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      {t('faceRegistration.startCamera')}
                    </Button>
                  ) : (
                    <>
                      <Button onClick={stopCamera} variant="outline" className="flex-1 border-xevn-border text-xevn-text">
                        <CameraOff className="mr-2 h-4 w-4" />
                        {t('faceRegistration.stopCamera')}
                      </Button>
                      <Button
                        onClick={capturePhoto}
                        disabled={isCapturing || featureHold}
                        className="flex-1 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
                      >
                        {isCapturing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="mr-2 h-4 w-4" />
                        )}
                        {isCapturing ? t('faceRegistration.capturing') : t('faceRegistration.capture')}
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Button onClick={retakePhoto} variant="outline" className="flex-1 border-xevn-border text-xevn-text">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('faceRegistration.retake')}
                  </Button>
                  <Button
                    onClick={handleRegister}
                    disabled={featureHold}
                    className="flex-1 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
                    title={featureHold ? t('attPage.faceIdHold') : undefined}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {employeeHasFace ? t('faceRegistration.updateFace') : t('faceRegistration.registerFace')}
                  </Button>
                </>
              )}
              {employeeHasFace && !capturedFace && (
                <Button
                  onClick={() => setDeleteDialogOpen(true)}
                  variant="destructive"
                  className="flex-1"
                  disabled={featureHold}
                  title={featureHold ? t('attPage.faceIdHold') : undefined}
                  data-testid="att-face-delete-open"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('faceRegistration.deleteFaceData')}
                </Button>
              )}
            </div>
          )}

          <div className="p-4 bg-xevn-background rounded-lg border border-xevn-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-[15px] text-xevn-text flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-xevn-primary" />
                {t('faceRegistration.stats')}
              </h4>
              <Button variant="ghost" size="sm" onClick={fetchFaceData} className="h-8 text-xevn-textSecondary">
                <RefreshCw className="h-4 w-4 mr-1" />
                {t('faceRegistration.refresh')}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-xevn-surface rounded-lg border border-xevn-border">
                <div className="text-2xl font-bold text-xevn-primary tabular-nums">{faceDataList.length}</div>
                <div className="text-xevn-textSecondary">{t('faceRegistration.registeredCount')}</div>
              </div>
              <div className="p-3 bg-xevn-surface rounded-lg border border-xevn-border">
                <div className="text-2xl font-bold text-xevn-textSecondary tabular-nums">{employees.length - faceDataList.length}</div>
                <div className="text-xevn-textSecondary">{t('faceRegistration.notRegisteredCount')}</div>
              </div>
            </div>
          </div>

          <div className="text-sm text-xevn-textSecondary space-y-1">
            <p className="font-semibold text-xevn-text">{t('faceRegistration.registrationNotes')}:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('faceRegistration.note1')}</li>
              <li>{t('faceRegistration.note2')}</li>
              <li>{t('faceRegistration.note3')}</li>
              <li>{t('faceRegistration.note4')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* S19 Delete registration — GĐ2-HOLD honesty when featureHold */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-xevn-border" data-testid="att-face-delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-bold text-xevn-text">
              {t('faceRegistration.confirmDeleteTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-xevn-textSecondary">
              {featureHold
                ? t('attPage.faceIdHold')
                : t('faceRegistration.confirmDeleteDesc', { name: selectedEmployee?.full_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-xevn-border text-xevn-text">{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={featureHold}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
