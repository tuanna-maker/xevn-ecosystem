/**
 * @CODE-MEMORY
 * Screen: HRM Chấm công → Clock-In → GPS (`clock-in-panel-gps`)
 * UC: HRM-AT-01 · BR: geofence 200m / HRM-ATT-GEO-001 khi ngoài site
 * SRS: SRS_VN GPS/geofence · matrix fidelity #10 · by-uc/HRM-AT-01.md
 * TechSpec: POST /attendance/records + CreateAttendanceRecordDto.latitude/longitude
 * Purpose: Lấy GPS browser → check-in/out; bắt buộc gửi lat/lon số trên POST (không chỉ string location).
 * WorkItem: PO-MFD-M2-ATT-CLOCK-GPS-LATLON-01
 * Coded: 2026-08-04
 * Callers: Attendance.tsx lazy GPSAttendance (clock-in method gps)
 * Callees: useAttendanceRecords.checkIn/checkOut → createAttendanceRecord
 * must_keep: Face GĐ2-HOLD không đụng; manual CheckInOutWidget riêng; U65 no seed
 * Impact: Chỉ gửi check_in_location string → BE bỏ qua assertWithinWorkSite (silent 201)
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-CLOCK-GPS-LATLON-01
 * change_mode: FIX
 * What: checkIn nhận latitude+longitude từ gpsLocation; dialog chỉ đóng khi success
 * Why: QA CLOCK-01 GEO silent bypass — UI 10,10 nhưng body omit lat/lon
 * must_keep: formatLocationString vẫn hiển thị; checkout path không claim GEO (status PATCH)
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-A
 * change_mode: UPGRADE
 * What: GPS clock chrome → Precision Motion sharp text / primary (S20–S21)
 * Why: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10
 * must_keep: latitude+longitude on checkIn POST; ATT-03d work-sites wires elsewhere; Face hold untouched
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT
 * change_mode: ADD
 * What: Confirm dialog title ≥20 + compact select/reason + primary CTA; ban muted/orange chrome
 * Why: ADR §16 LOCK · FE-DIALOG-01 shell extend · stall#2 remaining clock modals
 * must_keep: lat/lon POST; legacy clock-in-gps-confirm-dialog; Face HOLD; U65 no seed
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-w4-att-dialog-ext.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-FE-01
 * change_mode: ADD
 * What: checkIn POST gửi check_in_method: 'gps' cùng latitude/longitude
 * Why: R-PLT-ATT-WS-FE-CNS-05 / VAL-ATT-WS-CNS-05 — BE HRM-ATT-GEO-REQ khi omit coords + method=gps
 * must_keep: lat/lon GPS; Face HOLD; manual omit method; soft empty CTA Nest worksites; no ensureDefault; U65; ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Empty active work-sites → punch skip banner + CTA Settings GPS; RETAIN lat/lon +
 *       method=gps for GEO-001/GEO-REQ; Nest /core 0 · ≠ PLT WS alone = ATT-03d DONE.
 * Why: UC-BP-ATT-03d Diễn biến #3–#6 · F-ATT-PUNCH-01 · J-HRM-ATT-03D-03..06 · U65
 * Spec: docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-API-01.md · ADR D3
 * must_keep: ATTWSQA2-MSJCG47P ≠ ATT-03d DONE · DENY ensureDefaultWorkSite · Face HOLD · printable false
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-02
 * change_mode: FIX
 * What: EFF>0 bind picker ký hiệu công Nest; POST status từ catalog — cấm sole hardcode present
 * Why: R-ATT-03D-CNS-STATUS-CODE · HRM-ATT-CODE-KEY khi EFF>0 và present ∉ effective
 * must_keep: lat/lon + method=gps · GEO-001/GEO-REQ · empty CTA · Nest /core 0 · ≠ ATT-03d DONE · U65
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-fe-02.md
 */
import { useState, useEffect, useCallback } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  Navigation,
  Crosshair,
  LogIn,
  LogOut,
  Clock,
  User,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Compass,
  Signal,
  Globe,
} from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useAttendanceRecords, type AttendanceRecord } from '@/hooks/useAttendanceRecords';
import { useAuth } from '@/contexts/AuthContext';
import { listAttendanceWorkSites } from '@/integrations/hrmApi';
import {
  att03dEmptyPunchSkipMessage,
  isAtt03dActiveEmpty,
} from '@/lib/attWorkSite03dRing';
import {
  resolveCheckInRecordStatus,
  resolveDefaultCheckInStatusFromCatalog,
  useAttAttendanceCodesEffective,
} from '@/hooks/useAttAttendanceCodesEffective';
import { format } from 'date-fns';
import { vi, enUS, zhCN } from 'date-fns/locale';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

interface GPSAttendanceProps {
  onAttendanceSuccess?: (record: AttendanceRecord) => void;
}

export function GPSAttendance({ onAttendanceSuccess }: GPSAttendanceProps) {
  const { t, i18n } = useTranslation();
  const { employees } = useEmployees();
  const { checkIn, checkOut, fetchTodayRecord } = useAttendanceRecords();
  const { currentCompanyId } = useAuth();
  const {
    nestOptions: attCodeOptions,
    effectiveCount: attCodeEffectiveCount,
  } = useAttAttendanceCodesEffective();
  const attCodeCatalogBound = attCodeEffectiveCount > 0;
  const [activeSiteCount, setActiveSiteCount] = useState<number | null>(null);

  const getDateLocale = () => {
    switch (i18n.language) {
      case 'en': return enUS;
      case 'zh': return zhCN;
      default: return vi;
    }
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  const [gpsLocation, setGpsLocation] = useState<GPSLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<typeof employees[0] | null>(null);
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attendanceType, setAttendanceType] = useState('normal');
  const [checkInStatusCode, setCheckInStatusCode] = useState('');
  const [notes, setNotes] = useState('');

  // Active work-sites count — empty → skip geofence + CTA (AC-ATT-03D-EMPTY · no ensureDefault)
  useEffect(() => {
    if (!currentCompanyId) {
      setActiveSiteCount(null);
      return;
    }
    let cancelled = false;
    void listAttendanceWorkSites(currentCompanyId)
      .then((res) => {
        if (cancelled) return;
        setActiveSiteCount((res.data ?? []).length);
      })
      .catch(() => {
        if (!cancelled) setActiveSiteCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [currentCompanyId]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get current GPS location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError(t('gpsAttendance.browserNotSupport'));
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: GPSLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        };
        setGpsLocation(location);
        setIsLoadingLocation(false);
        
        // Try to get address from coordinates
        getAddressFromCoords(location.latitude, location.longitude);
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(t('gpsAttendance.permissionDenied'));
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError(t('gpsAttendance.positionUnavailable'));
            break;
          case error.TIMEOUT:
            setLocationError(t('gpsAttendance.timeout'));
            break;
          default:
            setLocationError(t('gpsAttendance.unknownError'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, []);

  // Try to get address from coordinates using reverse geocoding
  const getAddressFromCoords = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    try {
      // Using Nominatim (OpenStreetMap) for reverse geocoding - free and no API key needed
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.display_name) {
          setAddress(data.display_name);
        }
      }
    } catch (error) {
      console.log('Could not fetch address');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Get location on mount
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Fetch employee record when employee is selected
  useEffect(() => {
    if (selectedEmployeeId) {
      const employee = employees.find(e => e.id === selectedEmployeeId);
      setSelectedEmployee(employee || null);
      if (employee) {
        fetchTodayRecord(employee.id).then(record => {
          setCurrentRecord(record);
        });
      }
    } else {
      setSelectedEmployee(null);
      setCurrentRecord(null);
    }
  }, [selectedEmployeeId, employees, fetchTodayRecord]);

  const handleOpenDialog = () => {
    if (!selectedEmployee) {
      toast.error(t('gpsAttendance.selectEmployee'));
      return;
    }
    if (!gpsLocation) {
      toast.error(t('gpsAttendance.allowGpsAccess'));
      return;
    }
    setDialogOpen(true);
    if (attCodeCatalogBound) {
      const suggested = resolveDefaultCheckInStatusFromCatalog(attCodeOptions);
      setCheckInStatusCode(suggested ?? '');
    } else {
      setCheckInStatusCode('');
    }
  };

  const formatLocationString = () => {
    if (!gpsLocation) return '';
    const parts = [];
    parts.push(`GPS: ${gpsLocation.latitude.toFixed(6)}, ${gpsLocation.longitude.toFixed(6)}`);
    if (address) {
      parts.push(address);
    }
    return parts.join(' - ');
  };

  const handleConfirmAttendance = async (action: 'checkin' | 'checkout') => {
    if (!selectedEmployee || !gpsLocation) return;

    setIsProcessing(true);
    try {
      const locationString = formatLocationString();
      let result: AttendanceRecord | null = null;

      if (action === 'checkin') {
        const resolvedStatus = attCodeCatalogBound
          ? resolveCheckInRecordStatus({
              catalogBound: true,
              nestOptions: attCodeOptions,
              explicitStatus: checkInStatusCode,
            })
          : resolveCheckInRecordStatus({
              catalogBound: false,
              nestOptions: attCodeOptions,
              explicitStatus: checkInStatusCode || undefined,
            });
        if (attCodeCatalogBound && !resolvedStatus) {
          toast.error(t('gpsAttendance.selectAttendanceCode'));
          return;
        }
        // Geofence honesty: numeric lat/lon must reach Nest CreateAttendanceRecordDto
        // (string check_in_location alone does not trigger HRM-ATT-GEO-001).
        // CNS-05: check_in_method=gps so BE can emit HRM-ATT-GEO-REQ when coords omitted.
        result = await checkIn({
          employee_id: selectedEmployee.id,
          employee_code: selectedEmployee.employee_code,
          employee_name: selectedEmployee.full_name,
          department: selectedEmployee.department || undefined,
          check_in_location: locationString,
          check_in_device: 'GPS Attendance',
          attendance_type: attendanceType,
          notes: notes || undefined,
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude,
          check_in_method: 'gps',
          ...(resolvedStatus ? { status: resolvedStatus } : {}),
        });

        if (result) {
          toast.success(t('gpsAttendance.checkInSuccess'), {
            description: `${selectedEmployee.full_name} - ${format(new Date(), 'HH:mm:ss')}`,
          });
        }
      } else {
        result = await checkOut(selectedEmployee.id, {
          check_out_location: locationString,
          check_out_device: 'GPS Attendance',
          notes: notes || undefined,
        });

        if (result) {
          toast.success(t('gpsAttendance.checkOutSuccess'), {
            description: `${selectedEmployee.full_name} - ${format(new Date(), 'HH:mm:ss')}`,
          });
        }
      }

      if (result) {
        onAttendanceSuccess?.(result);
        setCurrentRecord(result);
        setDialogOpen(false);
        setNotes('');
      }
      // GEO-001 / other API fail: hook already toasts; keep dialog open for retry
    } catch (error) {
      console.error('Error processing attendance:', error);
      toast.error(t('gpsAttendance.processError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const canCheckIn = !!selectedEmployee && !currentRecord?.check_in_time;
  const canCheckOut = !!selectedEmployee && !!currentRecord?.check_in_time && !currentRecord?.check_out_time;
  const isCompleted = !!currentRecord?.check_in_time && !!currentRecord?.check_out_time;

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy <= 10) {
      return <Badge className="bg-green-500/10 text-green-600 border-green-200">{t('gpsAttendance.veryAccurate')}</Badge>;
    } else if (accuracy <= 50) {
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">{t('gpsAttendance.accurate')}</Badge>;
    } else if (accuracy <= 100) {
      return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">{t('gpsAttendance.medium')}</Badge>;
    } else {
      return <Badge className="bg-red-500/10 text-red-600 border-red-200">{t('gpsAttendance.poor')}</Badge>;
    }
  };

  return (
    <>
      <Card className="w-full rounded-card border-xevn-border" data-testid="clock-in-gps-widget">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-xevn-text">
              <MapPin className="h-5 w-5 text-xevn-primary" />
              {t('gpsAttendance.title')}
            </CardTitle>
            <div className="text-right">
              <div className="text-2xl font-bold text-xevn-primary tabular-nums">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-sm text-xevn-textSecondary">
                {format(currentTime, 'EEEE, dd/MM/yyyy', { locale: getDateLocale() })}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAtt03dActiveEmpty(activeSiteCount) ? (
            <div
              className="rounded-card border border-dashed border-xevn-border bg-xevn-background p-3 text-[15px] text-xevn-textSecondary"
              data-testid="att-03d-punch-empty-cta"
              role="status"
            >
              {att03dEmptyPunchSkipMessage()}
            </div>
          ) : null}
          {/* GPS Location Display */}
          <div className="relative rounded-card overflow-hidden bg-xevn-background border border-xevn-border">
            <div className="p-6">
              {isLoadingLocation ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-12 w-12 text-xevn-primary animate-spin mb-4" />
                  <p className="text-[15px] text-xevn-textSecondary">{t('gpsAttendance.loadingLocation')}</p>
                </div>
              ) : locationError ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                  <p className="text-destructive text-center mb-4">{locationError}</p>
                  <Button onClick={getCurrentLocation} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('gpsAttendance.tryAgain')}
                  </Button>
                </div>
              ) : gpsLocation ? (
                <div className="space-y-4">
                  {/* Map Visualization */}
                  <div className="relative bg-xevn-primary/5 rounded-card p-8 flex items-center justify-center border border-xevn-border">
                    <div className="absolute inset-0 overflow-hidden rounded-card">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(17,24,39,0.04)_100%)]" />
                      {/* Grid lines */}
                      <div className="absolute inset-0 opacity-20">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={`h-${i}`}
                            className="absolute left-0 right-0 border-t border-xevn-border"
                            style={{ top: `${i * 10}%` }}
                          />
                        ))}
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={`v-${i}`}
                            className="absolute top-0 bottom-0 border-l border-xevn-border"
                            style={{ left: `${i * 10}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-xevn-primary/20 animate-ping absolute inset-0" />
                      <div className="w-20 h-20 rounded-full bg-xevn-primary/30 flex items-center justify-center relative">
                        <div className="w-12 h-12 rounded-full bg-xevn-primary flex items-center justify-center shadow-soft">
                          <Navigation className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coordinates Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background rounded-lg p-4 border">
                      <div className="flex items-center gap-2 text-xevn-textSecondary text-sm mb-1">
                        <Globe className="h-4 w-4" />
                        {t('gpsAttendance.latitude')}
                      </div>
                      <div className="text-lg font-mono font-semibold">
                        {gpsLocation.latitude.toFixed(6)}°
                      </div>
                    </div>
                    <div className="bg-background rounded-lg p-4 border">
                      <div className="flex items-center gap-2 text-xevn-textSecondary text-sm mb-1">
                        <Globe className="h-4 w-4" />
                        {t('gpsAttendance.longitude')}
                      </div>
                      <div className="text-lg font-mono font-semibold">
                        {gpsLocation.longitude.toFixed(6)}°
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-background rounded-lg p-3 border text-center">
                      <Crosshair className="h-4 w-4 mx-auto mb-1 text-xevn-textSecondary" />
                      <div className="text-xevn-textSecondary text-xs">{t('gpsAttendance.accuracy')}</div>
                      <div className="font-semibold">{gpsLocation.accuracy.toFixed(0)}m</div>
                    </div>
                    <div className="bg-background rounded-lg p-3 border text-center">
                      <Signal className="h-4 w-4 mx-auto mb-1 text-xevn-textSecondary" />
                      <div className="text-xevn-textSecondary text-xs">{t('gpsAttendance.altitude')}</div>
                      <div className="font-semibold">
                        {gpsLocation.altitude ? `${gpsLocation.altitude.toFixed(0)}m` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-background rounded-lg p-3 border text-center">
                      <Compass className="h-4 w-4 mx-auto mb-1 text-xevn-textSecondary" />
                      <div className="text-xevn-textSecondary text-xs">{t('gpsAttendance.heading')}</div>
                      <div className="font-semibold">
                        {gpsLocation.heading ? `${gpsLocation.heading.toFixed(0)}°` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Accuracy Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-xevn-textSecondary">{t('gpsAttendance.signalQuality')}:</span>
                    {getAccuracyBadge(gpsLocation.accuracy)}
                  </div>

                  {/* Address */}
                  {isLoadingAddress ? (
                    <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                      <Loader2 className="h-4 w-4 animate-spin text-xevn-textSecondary" />
                      <span className="text-sm text-xevn-textSecondary">{t('gpsAttendance.searchingAddress')}</span>
                    </div>
                  ) : address ? (
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm">{address}</span>
                      </div>
                    </div>
                  ) : null}

                  {/* Refresh Button */}
                  <Button variant="outline" onClick={getCurrentLocation} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('gpsAttendance.updateLocation')}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Employee Selection */}
          <div className="space-y-2">
            <Label>{t('gpsAttendance.selectEmployee')}</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder={t('gpsAttendance.selectEmployeePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{employee.full_name}</span>
                      <span className="text-xevn-textSecondary">({employee.employee_code})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Employee Card */}
          {selectedEmployee && (
            <div className="flex items-center gap-4 p-4 bg-xevn-background rounded-card border border-xevn-border">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedEmployee.avatar_url || ''} />
                <AvatarFallback className="bg-xevn-primary/10 text-xevn-primary">
                  {selectedEmployee.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-xevn-text">{selectedEmployee.full_name}</div>
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
                </div>
              </div>
              {currentRecord && (
                <div className="text-right text-sm">
                  {currentRecord.check_in_time && (
                    <div className="flex items-center gap-1 text-green-600">
                      <LogIn className="h-3.5 w-3.5" />
                      {currentRecord.check_in_time}
                    </div>
                  )}
                  {currentRecord.check_out_time && (
                    <div className="flex items-center gap-1 text-orange-600">
                      <LogOut className="h-3.5 w-3.5" />
                      {currentRecord.check_out_time}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Status Message */}
          {isCompleted && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm">{t('gpsAttendance.completedToday')}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleOpenDialog}
              disabled={!selectedEmployee || !gpsLocation || isCompleted}
              className="flex-1 h-12 bg-xevn-primary hover:bg-xevn-primaryPressed"
              data-testid="clock-in-gps-open-confirm"
            >
              <MapPin className="mr-2 h-5 w-5" />
              {t('gpsAttendance.title')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog — W4 shared Dialog chrome + compact fields */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" data-testid="clock-in-gps-confirm-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[20px] font-bold text-xevn-text">
              <MapPin className="h-5 w-5 text-xevn-primary" />
              {t('gpsAttendance.confirmAttendance')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Employee Info */}
            {selectedEmployee && (
              <div className="flex items-center gap-4 p-4 rounded-card border border-xevn-border bg-xevn-background">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={selectedEmployee.avatar_url || ''} />
                  <AvatarFallback className="text-lg bg-xevn-primary/10 text-xevn-primary">
                    {selectedEmployee.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-[15px] text-xevn-text">{selectedEmployee.full_name}</div>
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
                  </div>
                </div>
              </div>
            )}

            {/* Current Time */}
            <div className="flex items-center gap-2 p-3 bg-xevn-primary/10 rounded-card">
              <Clock className="h-5 w-5 text-xevn-primary" />
              <div>
                <div className="text-sm text-xevn-textSecondary">{t('faceIdScanner.time')}</div>
                <div className="font-semibold text-lg text-xevn-text tabular-nums">
                  {format(currentTime, 'HH:mm:ss - dd/MM/yyyy')}
                </div>
              </div>
            </div>

            {/* GPS Location */}
            {gpsLocation && (
              <div className="p-3 bg-xevn-primary/5 rounded-card border border-xevn-border">
                <div className="flex items-center gap-2 text-xevn-primary">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium text-[15px]">{t('gpsAttendance.gpsLocation')}</span>
                </div>
                <div className="mt-2 text-[15px] text-xevn-text">
                  <div className="font-mono tabular-nums">
                    {gpsLocation.latitude.toFixed(6)}, {gpsLocation.longitude.toFixed(6)}
                  </div>
                  {address && (
                    <div className="mt-1 text-xevn-textSecondary text-xs line-clamp-2">
                      {address}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Today's Status */}
            {currentRecord && (
              <div className="p-3 rounded-card border border-xevn-border space-y-2">
                <div className="text-sm font-medium text-xevn-text">{t('faceIdScanner.todayStatus')}</div>
                <div className="grid grid-cols-2 gap-2 text-sm text-xevn-text">
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

            {/* Attendance status code (EFF>0 — Nest catalog) */}
            {canCheckIn && attCodeCatalogBound && (
              <div className="space-y-2">
                <Label className="text-xevn-text">{t('attPage.attendanceCode')}</Label>
                <Select value={checkInStatusCode} onValueChange={setCheckInStatusCode}>
                  <SelectTrigger
                    className="xevn-field-select-md"
                    data-testid="clock-in-gps-attendance-code"
                  >
                    <SelectValue placeholder={t('gpsAttendance.selectAttendanceCode')} />
                  </SelectTrigger>
                  <SelectContent>
                    {attCodeOptions.map((opt) => (
                      <SelectItem key={opt.code} value={opt.code}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Attendance Type (for check-in) */}
            {canCheckIn && (
              <div className="space-y-2">
                <Label className="text-xevn-text">{t('faceIdScanner.attendanceType')}</Label>
                <Select value={attendanceType} onValueChange={setAttendanceType}>
                  <SelectTrigger className="xevn-field-select-md">
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

            {/* Notes */}
            {(canCheckIn || canCheckOut) && (
              <div className="space-y-2">
                <Label className="text-xevn-text">{t('faceIdScanner.notes')}</Label>
                <Textarea
                  placeholder={t('faceIdScanner.notesPlaceholder')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="xevn-field-reason text-xevn-text"
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="sm:flex-1 border-xevn-border">
              {t('common.cancel')}
            </Button>
            {canCheckIn && (
              <Button
                onClick={() => handleConfirmAttendance('checkin')}
                disabled={isProcessing || (attCodeCatalogBound && !checkInStatusCode)}
                className="sm:flex-1 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
                data-testid="clock-in-gps-confirm-checkin"
              >
                <LogIn className="mr-2 h-4 w-4" />
                {isProcessing ? t('common.processing') : t('gpsAttendance.checkIn')}
              </Button>
            )}
            {canCheckOut && (
              <Button
                onClick={() => handleConfirmAttendance('checkout')}
                disabled={isProcessing}
                variant="destructive"
                className="sm:flex-1"
                data-testid="clock-in-gps-confirm-checkout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isProcessing ? t('common.processing') : t('gpsAttendance.checkOut')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
