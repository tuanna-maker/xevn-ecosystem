import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, X, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from './RichTextEditor';
import { GuideContent } from '@/hooks/useGuideContent';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface GuideStepEditorProps {
  open: boolean;
  onClose: () => void;
  sectionId: string;
  stepIndex: number | null;
  defaultTitle: string;
  defaultContent: string;
  existingData?: GuideContent;
  onSave: (data: {
    section_id: string;
    step_index: number | null;
    custom_title?: string;
    custom_content?: string;
    image_urls?: string[];
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  isSaving: boolean;
}

export function GuideStepEditor({
  open,
  onClose,
  sectionId,
  stepIndex,
  defaultTitle,
  defaultContent,
  existingData,
  onSave,
  onDelete,
  isSaving,
}: GuideStepEditorProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setTitle(existingData?.custom_title || defaultTitle);
      setContent(existingData?.custom_content || `<p>${defaultContent}</p>`);
      setImageUrls(existingData?.image_urls || []);
    }
  }, [open, existingData, defaultTitle, defaultContent]);

  const handleSave = async () => {
    await onSave({
      section_id: sectionId,
      step_index: stepIndex,
      custom_title: title,
      custom_content: content,
      image_urls: imageUrls,
    });
    onClose();
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete();
      onClose();
    }
  };

  const handleImageUpload = (url: string) => {
    setImageUrls((prev) => [...prev, url]);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            {t('guide.editor.editStep', 'Chỉnh sửa hướng dẫn')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('guide.editor.title', 'Tiêu đề')}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={defaultTitle}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('guide.editor.content', 'Nội dung')}
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              onImageUpload={handleImageUpload}
            />
          </div>

          {imageUrls.length > 0 && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t('guide.editor.images', 'Ảnh đã upload')} ({imageUrls.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={`Guide ${idx}`}
                      className="h-20 w-20 object-cover rounded-lg border border-border"
                    />
                    <button
                      onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {existingData && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isSaving}
              className="mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {t('guide.editor.reset', 'Khôi phục mặc định')}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            <X className="h-4 w-4 mr-1" />
            {t('common.cancel', 'Hủy')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? t('common.saving', 'Đang lưu...') : t('common.save', 'Lưu')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
