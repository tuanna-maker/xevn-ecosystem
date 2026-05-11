import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  Heart,
  Flag,
  Users,
  Home,
  CreditCard,
  FileUp,
  Eye,
  MoreHorizontal,
  Loader2,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EmployeeResumeProps {
  employeeId: string;
  employeeName: string;
}

interface Employee {
  id: string;
  full_name: string;
  employee_code: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  id_number: string | null;
  id_issue_date: string | null;
  id_issue_place: string | null;
  permanent_address: string | null;
  temporary_address: string | null;
  department: string | null;
  position: string | null;
  start_date: string | null;
  status: string;
}

interface ResumeFile {
  id: string;
  employee_id: string;
  company_id: string;
  name: string;
  file_type: string | null;
  file_url: string;
  file_size: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-start gap-3 py-2">
    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{value || '—'}</p>
    </div>
  </div>
);

export function EmployeeResume({ employeeId, employeeName }: EmployeeResumeProps) {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Fetch employee data
  const { data: employee, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single();
      
      if (error) throw error;
      return data as Employee;
    },
    enabled: !!employeeId,
  });

  // Fetch resume files
  const { data: resumeFiles, isLoading: isLoadingFiles } = useQuery({
    queryKey: ['employee-resume-files', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_resume_files')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ResumeFile[];
    },
    enabled: !!employeeId && !!currentCompanyId,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('resume.fileSizeLimit'));
        return;
      }
      setSelectedFile(file);
      setNewFileName(file.name);
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; size: string }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `resume/${employeeId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('employee-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('employee-documents')
      .getPublicUrl(data.path);

    const size = file.size < 1024 * 1024 
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    return { url: urlData.publicUrl, size };
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      toast.error(t('resume.pleaseSelectFile'));
      return;
    }

    if (!currentCompanyId) {
      toast.error(t('resume.companyNotFound'));
      return;
    }

    setIsUploading(true);

    try {
      const { url, size } = await uploadFile(selectedFile);
      const fileType = selectedFile.name.split('.').pop() || 'file';

      const { error } = await supabase
        .from('employee_resume_files')
        .insert({
          employee_id: employeeId,
          company_id: currentCompanyId,
          name: newFileName || selectedFile.name,
          file_type: fileType,
          file_url: url,
          file_size: size,
        });

      if (error) throw error;

      toast.success(t('resume.uploadSuccess'));
      queryClient.invalidateQueries({ queryKey: ['employee-resume-files', employeeId] });
      setIsFileDialogOpen(false);
      setSelectedFile(null);
      setNewFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || t('resume.error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (file: ResumeFile) => {
    if (!confirm(t('resume.confirmDelete'))) return;

    try {
      // Delete from storage
      const filePath = file.file_url.split('/employee-documents/')[1];
      if (filePath) {
        await supabase.storage.from('employee-documents').remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('employee_resume_files')
        .delete()
        .eq('id', file.id);

      if (error) throw error;
      toast.success(t('resume.deleteSuccess'));
      queryClient.invalidateQueries({ queryKey: ['employee-resume-files', employeeId] });
    } catch (error: any) {
      toast.error(error.message || t('resume.error'));
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateStr;
    }
  };

  if (isLoadingEmployee) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{t('resume.employeeNotFound')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{t('resume.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('resume.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              {t('resume.personalInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <InfoRow icon={User} label={t('resume.fullName')} value={employee.full_name} />
              <InfoRow icon={CreditCard} label={t('resume.employeeCode')} value={employee.employee_code} />
              <InfoRow icon={Calendar} label={t('resume.birthDate')} value={formatDate(employee.birth_date)} />
              <InfoRow icon={User} label={t('resume.gender')} value={employee.gender || ''} />
              <InfoRow icon={Phone} label={t('resume.phone')} value={employee.phone || ''} />
              <InfoRow icon={Mail} label={t('resume.email')} value={employee.email || ''} />
              <InfoRow icon={Home} label={t('resume.permanentAddress')} value={employee.permanent_address || ''} />
              <InfoRow icon={MapPin} label={t('resume.temporaryAddress')} value={employee.temporary_address || ''} />
            </div>
          </CardContent>
        </Card>

        {/* Files */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileUp className="w-5 h-5 text-emerald-500" />
              {t('resume.attachments')}
            </CardTitle>
            <Button size="sm" onClick={() => setIsFileDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              {t('resume.addFile')}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingFiles ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !resumeFiles?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('resume.noAttachments')}</p>
                <p className="text-sm">{t('resume.noAttachmentsHint')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resumeFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.file_size} • {format(new Date(file.created_at), 'dd/MM/yyyy', { locale: vi })}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4 mr-2" />
                            {t('resume.viewFile')}
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={file.file_url} download={file.name}>
                            <Download className="w-4 h-4 mr-2" />
                            {t('resume.download')}
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteFile(file)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('resume.deleteFile')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Identity Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-500" />
              {t('resume.identityInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <InfoRow icon={CreditCard} label={t('resume.idNumber')} value={employee.id_number || ''} />
              <InfoRow icon={Calendar} label={t('resume.idIssueDate')} value={formatDate(employee.id_issue_date)} />
              <InfoRow icon={MapPin} label={t('resume.idIssuePlace')} value={employee.id_issue_place || ''} />
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-rose-500" />
              {t('resume.workInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <InfoRow icon={CreditCard} label={t('resume.employeeCode')} value={employee.employee_code} />
              <InfoRow icon={Briefcase} label={t('resume.department')} value={employee.department || ''} />
              <InfoRow icon={Briefcase} label={t('resume.position')} value={employee.position || ''} />
              <InfoRow icon={Calendar} label={t('resume.startDate')} value={formatDate(employee.start_date)} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Upload Dialog */}
      <Dialog open={isFileDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setSelectedFile(null);
          setNewFileName('');
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
        setIsFileDialogOpen(open);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('resume.uploadDialogTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('resume.chooseFile')}</Label>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              {selectedFile ? (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="flex-1 text-sm truncate">{selectedFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setSelectedFile(null);
                      setNewFileName('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t('resume.clickToSelect')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('resume.acceptedFormats')}</p>
                </div>
              )}
            </div>
            {selectedFile && (
              <div className="space-y-2">
                <Label>{t('resume.fileName')}</Label>
                <Input
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder={t('resume.fileNamePlaceholder')}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFileDialogOpen(false)} disabled={isUploading}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleUploadFile} disabled={!selectedFile || isUploading}>
              {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Upload className="w-4 h-4 mr-1" />
              {t('resume.upload')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
