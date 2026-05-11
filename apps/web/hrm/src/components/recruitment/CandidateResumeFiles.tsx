import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Upload,
  FileText,
  Trash2,
  Download,
  Eye,
  Loader2,
  File,
  FileImage,
  FileSpreadsheet,
  Plus,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ResumeFile {
  id: string;
  name: string;
  file_url: string;
  file_type: string | null;
  file_size: string | null;
  notes: string | null;
  created_at: string;
}

interface CandidateResumeFilesProps {
  candidateId: string;
  companyId: string;
  candidateName: string;
}

const getFileIcon = (fileType: string | null) => {
  if (!fileType) return File;
  if (fileType.includes('pdf')) return FileText;
  if (fileType.includes('image')) return FileImage;
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return FileSpreadsheet;
  if (fileType.includes('word') || fileType.includes('document')) return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function CandidateResumeFiles({
  candidateId,
  companyId,
  candidateName,
}: CandidateResumeFilesProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<ResumeFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingFile, setDeletingFile] = useState<ResumeFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>('');

  const fetchFiles = async () => {
    if (!candidateId || !companyId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('candidate_resume_files')
        .select('*')
        .eq('candidate_id', candidateId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles((data as ResumeFile[]) || []);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách file',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [candidateId, companyId]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    const uploadedFiles: ResumeFile[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExt = file.name.split('.').pop();
        const filePath = `${companyId}/${candidateId}/${Date.now()}-${file.name}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('candidate-resumes')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('candidate-resumes')
          .getPublicUrl(filePath);

        // Save to database
        const { data, error: dbError } = await supabase
          .from('candidate_resume_files')
          .insert({
            candidate_id: candidateId,
            company_id: companyId,
            name: file.name,
            file_url: publicUrl,
            file_type: file.type,
            file_size: formatFileSize(file.size),
          })
          .select()
          .single();

        if (dbError) throw dbError;
        uploadedFiles.push(data as ResumeFile);
      }

      setFiles((prev) => [...uploadedFiles, ...prev]);
      toast({
        title: 'Thành công',
        description: `Đã tải lên ${uploadedFiles.length} file`,
      });
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải lên file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingFile) return;

    try {
      // Extract file path from URL
      const url = new URL(deletingFile.file_url);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.indexOf('candidate-resumes');
      if (bucketIndex !== -1) {
        const filePath = pathParts.slice(bucketIndex + 1).join('/');
        
        // Delete from storage
        await supabase.storage
          .from('candidate-resumes')
          .remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('candidate_resume_files')
        .delete()
        .eq('id', deletingFile.id);

      if (error) throw error;

      setFiles((prev) => prev.filter((f) => f.id !== deletingFile.id));
      toast({
        title: 'Thành công',
        description: 'Đã xóa file',
      });
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa file',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingFile(null);
    }
  };

  const handlePreview = (file: ResumeFile) => {
    setPreviewUrl(file.file_url);
    setPreviewFileName(file.name);
  };

  const handleDownload = (file: ResumeFile) => {
    window.open(file.file_url, '_blank');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Hồ sơ / CV đính kèm
          </CardTitle>
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Tải lên
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          multiple
          onChange={handleFileSelect}
        />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : files.length === 0 ? (
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Chưa có file nào. Click để tải lên CV, hồ sơ ứng viên.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.file_type);
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{file.file_size || 'N/A'}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(file.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {file.file_type?.includes('pdf') || file.file_type?.includes('image') ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handlePreview(file)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        setDeletingFile(file);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Upload more button */}
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Tải thêm file
            </Button>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa file "{deletingFile?.name}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate">{previewFileName}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewUrl(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="h-[70vh] overflow-hidden">
            {previewUrl && (
              previewUrl.includes('.pdf') ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="Preview"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
