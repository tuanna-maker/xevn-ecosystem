import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Loader2, X, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
      const fileExt = file.name.split('.').pop();
      const fileName = `${employeeCode}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('employee-avatars')
            .remove([`avatars/${oldPath}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('employee-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('employee-avatars')
        .getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      onAvatarChange(publicUrl);
      toast.success(t('avatar.uploadSuccess'));
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(t('avatar.uploadError') + ': ' + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) {
      setPreviewUrl(null);
      onAvatarChange(null);
      return;
    }

    setIsUploading(true);

    try {
      const urlParts = currentAvatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `avatars/${fileName}`;

      const { error } = await supabase.storage
        .from('employee-avatars')
        .remove([filePath]);

      if (error) throw error;

      setPreviewUrl(null);
      onAvatarChange(null);
      toast.success(t('avatar.removeSuccess'));
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast.error(t('avatar.removeError') + ': ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = () => {
    return fullName.split(' ').pop()?.charAt(0).toUpperCase() || 'N';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="w-24 h-24 border-2 border-border">
          <AvatarImage src={previewUrl || undefined} alt={fullName} />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {getInitials()}
          </AvatarFallback>
        </Avatar>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {!disabled && !isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          <Camera className="w-4 h-4 mr-2" />
          {previewUrl ? t('avatar.change') : t('avatar.upload')}
        </Button>

        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={disabled || isUploading}
            className="text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4 mr-2" />
            {t('common.delete')}
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {t('avatar.formatHint')}
      </p>
    </div>
  );
}
