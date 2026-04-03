import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { 
  GraduationCap, 
  Calendar, 
  Award, 
  Plus, 
  Edit2, 
  Trash2, 
  Upload, 
  FileText,
  MoreHorizontal,
  Download,
  Eye,
  ExternalLink,
  Loader2,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EmployeeDegreesProps {
  employeeId: string;
}

interface Degree {
  id: string;
  employee_id: string;
  company_id: string;
  name: string;
  institution: string;
  major: string;
  graduation_year: string | null;
  grade: string | null;
  degree_number: string | null;
  file_url: string | null;
  file_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  institution: string;
  major: string;
  graduation_year: string;
  grade: string;
  degree_number: string;
  notes: string;
}

const initialFormData: FormData = {
  name: '',
  institution: '',
  major: '',
  graduation_year: new Date().getFullYear().toString(),
  grade: '',
  degree_number: '',
  notes: '',
};

export function EmployeeDegrees({ employeeId }: EmployeeDegreesProps) {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDegree, setEditingDegree] = useState<Degree | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const degreeTypes = [
    { value: 'Trung cấp', label: t('degrees.types.intermediate') },
    { value: 'Cao đẳng', label: t('degrees.types.college') },
    { value: 'Cử nhân', label: t('degrees.types.bachelor') },
    { value: 'Kỹ sư', label: t('degrees.types.engineer') },
    { value: 'Thạc sĩ', label: t('degrees.types.master') },
    { value: 'Tiến sĩ', label: t('degrees.types.doctorate') },
    { value: 'Bác sĩ', label: t('degrees.types.doctor') },
    { value: 'Dược sĩ', label: t('degrees.types.pharmacist') },
    { value: 'Khác', label: t('degrees.types.other') },
  ];

  const gradeOptions = [
    { value: 'Xuất sắc', label: t('degrees.grades.excellent') },
    { value: 'Giỏi', label: t('degrees.grades.veryGood') },
    { value: 'Khá', label: t('degrees.grades.good') },
    { value: 'Trung bình Khá', label: t('degrees.grades.fair') },
    { value: 'Trung bình', label: t('degrees.grades.average') },
  ];

  // Fetch degrees
  const { data: degrees, isLoading } = useQuery({
    queryKey: ['employee-degrees', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_degrees')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Degree[];
    },
    enabled: !!employeeId && !!currentCompanyId,
  });

  const handleOpenDialog = (degree?: Degree) => {
    if (degree) {
      setEditingDegree(degree);
      setFormData({
        name: degree.name,
        institution: degree.institution,
        major: degree.major,
        graduation_year: degree.graduation_year || '',
        grade: degree.grade || '',
        degree_number: degree.degree_number || '',
        notes: degree.notes || '',
      });
    } else {
      setEditingDegree(null);
      setFormData(initialFormData);
    }
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDegree(null);
    setSelectedFile(null);
    setFormData(initialFormData);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('degrees.validation.fileTooLarge'));
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; name: string }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `degrees/${employeeId}/${Date.now()}.${fileExt}`;
    
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

    return { url: urlData.publicUrl, name: file.name };
  };

  const handleSave = async () => {
    if (!formData.name || !formData.institution || !formData.major) {
      toast.error(t('degrees.validation.required'));
      return;
    }

    if (!currentCompanyId) {
      toast.error(t('degrees.validation.noCompany'));
      return;
    }

    setIsSubmitting(true);

    try {
      let fileUrl = editingDegree?.file_url || null;
      let fileName = editingDegree?.file_name || null;

      if (selectedFile) {
        const uploaded = await uploadFile(selectedFile);
        fileUrl = uploaded.url;
        fileName = uploaded.name;
      }

      const degreeData = {
        employee_id: employeeId,
        company_id: currentCompanyId,
        name: formData.name.trim(),
        institution: formData.institution.trim(),
        major: formData.major.trim(),
        graduation_year: formData.graduation_year || null,
        grade: formData.grade || null,
        degree_number: formData.degree_number.trim() || null,
        notes: formData.notes.trim() || null,
        file_url: fileUrl,
        file_name: fileName,
      };

      if (editingDegree) {
        const { error } = await supabase
          .from('employee_degrees')
          .update(degreeData)
          .eq('id', editingDegree.id);

        if (error) throw error;
        toast.success(t('degrees.toast.updated'));
      } else {
        const { error } = await supabase
          .from('employee_degrees')
          .insert(degreeData);

        if (error) throw error;
        toast.success(t('degrees.toast.added'));
      }

      queryClient.invalidateQueries({ queryKey: ['employee-degrees', employeeId] });
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving degree:', error);
      toast.error(error.message || t('commonEmployee.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (degree: Degree) => {
    if (!confirm(t('degrees.confirmDelete'))) return;

    try {
      if (degree.file_url) {
        const filePath = degree.file_url.split('/employee-documents/')[1];
        if (filePath) {
          await supabase.storage.from('employee-documents').remove([filePath]);
        }
      }

      const { error } = await supabase
        .from('employee_degrees')
        .delete()
        .eq('id', degree.id);

      if (error) throw error;
      toast.success(t('degrees.toast.deleted'));
      queryClient.invalidateQueries({ queryKey: ['employee-degrees', employeeId] });
    } catch (error: any) {
      toast.error(error.message || t('commonEmployee.error'));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          {t('degrees.title')}
        </CardTitle>
        <Button size="sm" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-1" />
          {t('degrees.add')}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !degrees?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('degrees.empty')}</p>
            <p className="text-sm">{t('degrees.emptyHint')}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {degrees.map((degree) => (
              <div
                key={degree.id}
                className="border rounded-lg p-4 hover:border-primary/50 transition-colors group relative"
              >
                {/* Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(degree)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        {t('common.edit')}
                      </DropdownMenuItem>
                      {degree.file_url && (
                        <>
                          <DropdownMenuItem asChild>
                            <a href={degree.file_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4 mr-2" />
                              {t('degrees.viewFile')}
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={degree.file_url} download={degree.file_name || undefined}>
                              <Download className="w-4 h-4 mr-2" />
                              {t('degrees.download')}
                            </a>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDelete(degree)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-start justify-between mb-2 pr-8">
                  <h4 className="font-semibold text-sm">{degree.name}</h4>
                  {degree.grade && (
                    <Badge variant="secondary" className="text-xs">
                      {degree.grade}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{degree.institution}</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    <span>{t('degrees.major')}: {degree.major}</span>
                  </div>
                  {degree.graduation_year && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{t('degrees.graduationYear')}: {degree.graduation_year}</span>
                    </div>
                  )}
                  {degree.degree_number && (
                    <div className="flex items-center gap-1">
                      <span>{t('degrees.degreeNumber')}: {degree.degree_number}</span>
                    </div>
                  )}
                  {degree.file_url && (
                    <div className="flex items-center gap-1 mt-2">
                      <FileText className="w-3 h-3 text-blue-500" />
                      <a 
                        href={degree.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-1"
                      >
                        {degree.file_name || t('degrees.viewAttachment')}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingDegree ? t('degrees.edit') : t('degrees.addNew')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('degrees.type')} <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.name}
                  onValueChange={(value) => setFormData({ ...formData, name: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('degrees.selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {degreeTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('degrees.grade')}</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => setFormData({ ...formData, grade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('degrees.selectGrade')} />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('degrees.institution')} <span className="text-destructive">*</span></Label>
              <Input
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="VD: Đại học Bách khoa TP.HCM"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('degrees.major')} <span className="text-destructive">*</span></Label>
              <Input
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                placeholder="VD: Công nghệ thông tin"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('degrees.graduationYear')}</Label>
                <Input
                  type="number"
                  value={formData.graduation_year}
                  onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                  placeholder="VD: 2023"
                  min="1950"
                  max={new Date().getFullYear() + 5}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('degrees.degreeNumber')}</Label>
                <Input
                  value={formData.degree_number}
                  onChange={(e) => setFormData({ ...formData, degree_number: e.target.value })}
                  placeholder="VD: CN-2023-12345"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('degrees.file')}</Label>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
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
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : editingDegree?.file_url ? (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="flex-1 text-sm truncate">{editingDegree.file_name}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    {t('certificates.replace')}
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {t('certificates.selectFile')}
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
