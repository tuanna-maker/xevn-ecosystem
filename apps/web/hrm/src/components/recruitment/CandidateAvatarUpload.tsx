import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CandidateAvatarUploadProps {
  candidateId: string;
  candidateName: string;
  currentAvatarUrl?: string | null;
  onAvatarChange?: (newUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
}

export function CandidateAvatarUpload({
  candidateId,
  candidateName,
  currentAvatarUrl,
  onAvatarChange,
  size = 'lg',
  editable = true,
}: CandidateAvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn file ảnh',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Lỗi',
        description: 'Kích thước ảnh không được vượt quá 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${candidateId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('candidate-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('candidate-avatars')
        .getPublicUrl(filePath);

      const newAvatarUrl = urlData.publicUrl;
      setAvatarUrl(newAvatarUrl);
      onAvatarChange?.(newAvatarUrl);

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật ảnh đại diện',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Lỗi upload',
        description: 'Không thể tải ảnh lên. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarUrl(null);
    onAvatarChange?.('');
    toast({
      title: 'Đã xóa',
      description: 'Ảnh đại diện đã được xóa',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').pop()?.charAt(0) || 'U';
  };

  return (
    <div className="relative inline-block">
      <Avatar className={cn(sizeClasses[size], 'border-4 border-background shadow-lg')}>
        <AvatarImage src={avatarUrl || undefined} alt={candidateName} />
        <AvatarFallback className="text-3xl bg-primary/10 text-primary font-semibold">
          {getInitials(candidateName)}
        </AvatarFallback>
      </Avatar>

      {editable && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          
          <div className="absolute -bottom-1 -right-1 flex gap-1">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-md"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
              ) : (
                <Camera className={iconSizes[size]} />
              )}
            </Button>
            
            {avatarUrl && (
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8 rounded-full shadow-md"
                onClick={handleRemoveAvatar}
              >
                <X className={iconSizes[size]} />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
