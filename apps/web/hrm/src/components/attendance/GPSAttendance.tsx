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
  const [notes, setNotes] = useState('');

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
        result = await checkIn({
          employee_id: selectedEmployee.id,
          employee_code: selectedEmployee.employee_code,
          employee_name: selectedEmployee.full_name,
          department: selectedEmployee.department || undefined,
          check_in_location: locationString,
          check_in_device: 'GPS Attendance',
          attendance_type: attendanceType,
          notes: notes || undefined,
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
      }

      setDialogOpen(false);
      setNotes('');
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
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              {t('gpsAttendance.title')}
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
          {/* GPS Location Display */}
          <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border">
            <div className="p-6">
              {isLoadingLocation ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  <p className="text-muted-foreground">{t('gpsAttendance.loadingLocation')}</p>
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
                  <div className="relative bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/30 rounded-lg p-8 flex items-center justify-center">
                    <div className="absolute inset-0 overflow-hidden rounded-lg">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.05)_100%)]" />
                      {/* Grid lines */}
                      <div className="absolute inset-0 opacity-20">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={`h-${i}`}
                            className="absolute left-0 right-0 border-t border-gray-400"
                            style={{ top: `${i * 10}%` }}
                          />
                        ))}
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={`v-${i}`}
                            className="absolute top-0 bottom-0 border-l border-gray-400"
                            style={{ left: `${i * 10}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-primary/20 animate-ping absolute inset-0" />
                      <div className="w-20 h-20 rounded-full bg-primary/30 flex items-center justify-center relative">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                          <Navigation className="h-6 w-6 text-primary-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coordinates Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background rounded-lg p-4 border">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Globe className="h-4 w-4" />
                        {t('gpsAttendance.latitude')}
                      </div>
                      <div className="text-lg font-mono font-semibold">
                        {gpsLocation.latitude.toFixed(6)}°
                      </div>
                    </div>
                    <div className="bg-background rounded-lg p-4 border">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
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
                      <Crosshair className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <div className="text-muted-foreground text-xs">{t('gpsAttendance.accuracy')}</div>
                      <div className="font-semibold">{gpsLocation.accuracy.toFixed(0)}m</div>
                    </div>
                    <div className="bg-background rounded-lg p-3 border text-center">
                      <Signal className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <div className="text-muted-foreground text-xs">{t('gpsAttendance.altitude')}</div>
                      <div className="font-semibold">
                        {gpsLocation.altitude ? `${gpsLocation.altitude.toFixed(0)}m` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-background rounded-lg p-3 border text-center">
                      <Compass className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <div className="text-muted-foreground text-xs">{t('gpsAttendance.heading')}</div>
                      <div className="font-semibold">
                        {gpsLocation.heading ? `${gpsLocation.heading.toFixed(0)}°` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Accuracy Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('gpsAttendance.signalQuality')}:</span>
                    {getAccuracyBadge(gpsLocation.accuracy)}
                  </div>

                  {/* Address */}
                  {isLoadingAddress ? (
                    <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{t('gpsAttendance.searchingAddress')}</span>
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
                      <span className="text-muted-foreground">({employee.employee_code})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Employee Card */}
          {selectedEmployee && (
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedEmployee.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedEmployee.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold">{selectedEmployee.full_name}</div>
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
              className="flex-1 h-12"
            >
              <MapPin className="mr-2 h-5 w-5" />
              {t('gpsAttendance.title')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {t('gpsAttendance.confirmAttendance')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Employee Info */}
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

            {/* GPS Location */}
            {gpsLocation && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium text-sm">{t('gpsAttendance.gpsLocation')}</span>
                </div>
                <div className="mt-2 text-sm">
                  <div className="font-mono">
                    {gpsLocation.latitude.toFixed(6)}, {gpsLocation.longitude.toFixed(6)}
                  </div>
                  {address && (
                    <div className="mt-1 text-muted-foreground text-xs line-clamp-2">
                      {address}
                    </div>
                  )}
                </div>
              </div>
            )}

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

            {/* Notes */}
            {(canCheckIn || canCheckOut) && (
              <div className="space-y-2">
                <Label>{t('faceIdScanner.notes')}</Label>
                <Textarea
                  placeholder={t('faceIdScanner.notesPlaceholder')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
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
                {isProcessing ? t('common.processing') : t('gpsAttendance.checkIn')}
              </Button>
            )}
            {canCheckOut && (
              <Button
                onClick={() => handleConfirmAttendance('checkout')}
                disabled={isProcessing}
                variant="secondary"
                className="sm:flex-1"
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
