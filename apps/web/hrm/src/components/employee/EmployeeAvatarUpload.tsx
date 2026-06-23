import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Loader2, X, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { hrmStorageRemoveStub, hrmStorageUploadStub } from '@/lib/hrmStorageUploadStub';

interface EmployeeAvatarUploadProps {
  currentAvatarUrl?: string | null;
  employeeCode: string;
  fullName: string;
  onAvatarChange: (url: string | null) => void;
  disabled?: boolean;
}

export function EmployeeAvatarUpload({
  currentAvatarUrl,
  employeeCode,
  fullName,
  onAvatarChange,
  disabled,
}: EmployeeAvatarUploadProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(currentAvatarUrl || null);
  }, [currentAvatarUrl]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('avatar.selectImageFile'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('avatar.maxSize'));
      return;
    }

    setIsUploading(true);

    try {
      if (currentAvatarUrl) {
        hrmStorageRemoveStub('employee-avatar-remove');
      }

      const publicUrl = await hrmStorageUploadStub(file, 'employee-avatar-upload');
      if (!publicUrl) throw new Error('Upload failed');

      setPreviewUrl(publicUrl);
      onAvatarChange(publicUrl);
      toast.success(t('avatar.uploadSuccess'));
    } catch (error: unknown) {
      console.error('Error uploading avatar:', error);
      toast.error(t('avatar.uploadError'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    hrmStorageRemoveStub('employee-avatar-remove');
    setPreviewUrl(null);
    onAvatarChange(null);
    toast.success(t('avatar.removeSuccess'));
  };

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={previewUrl || undefined} alt={fullName} />
          <AvatarFallback className="text-lg">{initials || <User className="h-8 w-8" />}</AvatarFallback>
        </Avatar>
        {!disabled && (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </Button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
      />
      {previewUrl && !disabled && (
        <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
          <X className="h-4 w-4 mr-1" />
          {t('avatar.remove')}
        </Button>
      )}
      <p className="text-xs text-muted-foreground text-center">{employeeCode}</p>
    </div>
  );
}
