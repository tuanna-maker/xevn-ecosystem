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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileCheck, 
  Calendar, 
  Plus, 
  Pencil, 
  Upload, 
  FileText, 
  ExternalLink, 
  Trash2,
  Loader2,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi, enUS, zhCN } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EmployeeCertificatesProps {
  employeeId: string;
}

interface Certificate {
  id: string;
  employee_id: string;
  company_id: string;
  name: string;
  issuing_org: string;
  issue_date: string | null;
  expiry_date: string | null;
  status: string;
  certificate_id: string | null;
  score: string | null;
  file_url: string | null;
  file_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  issuing_org: string;
  issue_date: string;
  expiry_date: string;
  status: string;
  certificate_id: string;
  score: string;
  notes: string;
}

const initialFormData: FormData = {
  name: '',
  issuing_org: '',
  issue_date: '',
  expiry_date: '',
  status: 'active',
  certificate_id: '',
  score: '',
  notes: '',
};

export function EmployeeCertificates({ employeeId }: EmployeeCertificatesProps) {
  const { t, i18n } = useTranslation();
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDateLocale = () => {
    switch (i18n.language) {
      case 'en': return enUS;
      case 'zh': return zhCN;
      default: return vi;
    }
  };

  // Fetch certificates
  const { data: certificates, isLoading } = useQuery({
    queryKey: ['employee-certificates', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_certificates')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Certificate[];
    },
    enabled: !!employeeId && !!currentCompanyId,
  });

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedFile(null);
    setEditingCert(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenDialog = (cert?: Certificate) => {
    if (cert) {
      setEditingCert(cert);
      setFormData({
        name: cert.name,
        issuing_org: cert.issuing_org,
        issue_date: cert.issue_date || '',
        expiry_date: cert.expiry_date || '',
        status: cert.status,
        certificate_id: cert.certificate_id || '',
        score: cert.score || '',
        notes: cert.notes || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('certificates.validation.fileTooLarge'));
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; name: string }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `certificates/${employeeId}/${Date.now()}.${fileExt}`;
    
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
    if (!formData.name || !formData.issuing_org || !formData.certificate_id) {
      toast.error(t('certificates.validation.required'));
      return;
    }

    if (!currentCompanyId) {
      toast.error(t('certificates.validation.noCompany'));
      return;
    }

    setIsSubmitting(true);

    try {
      let fileUrl = editingCert?.file_url || null;
      let fileName = editingCert?.file_name || null;

      if (selectedFile) {
        const uploaded = await uploadFile(selectedFile);
        fileUrl = uploaded.url;
        fileName = uploaded.name;
      }

      const certData = {
        employee_id: employeeId,
        company_id: currentCompanyId,
        name: formData.name.trim(),
        issuing_org: formData.issuing_org.trim(),
        issue_date: formData.issue_date || null,
        expiry_date: formData.expiry_date || null,
        status: formData.status,
        certificate_id: formData.certificate_id.trim() || null,
        score: formData.score.trim() || null,
        notes: formData.notes.trim() || null,
        file_url: fileUrl,
        file_name: fileName,
      };

      if (editingCert) {
        const { error } = await supabase
          .from('employee_certificates')
          .update(certData)
          .eq('id', editingCert.id);

        if (error) throw error;
        toast.success(t('certificates.toast.updated'));
      } else {
        const { error } = await supabase
          .from('employee_certificates')
          .insert(certData);

        if (error) throw error;
        toast.success(t('certificates.toast.added'));
      }

      queryClient.invalidateQueries({ queryKey: ['employee-certificates', employeeId] });
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving certificate:', error);
      toast.error(error.message || t('commonEmployee.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cert: Certificate) => {
    if (!confirm(t('certificates.confirmDelete'))) return;

    try {
      if (cert.file_url) {
        const filePath = cert.file_url.split('/employee-documents/')[1];
        if (filePath) {
          await supabase.storage.from('employee-documents').remove([filePath]);
        }
      }

      const { error } = await supabase
        .from('employee_certificates')
        .delete()
        .eq('id', cert.id);

      if (error) throw error;
      toast.success(t('certificates.toast.deleted'));
      queryClient.invalidateQueries({ queryKey: ['employee-certificates', employeeId] });
    } catch (error: any) {
      toast.error(error.message || t('commonEmployee.error'));
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return t('certificates.noExpiry');
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: getDateLocale() });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <FileCheck className="w-4 h-4" />
          {t('certificates.title')}
        </CardTitle>
        <Button size="sm" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-1" />
          {t('certificates.add')}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !certificates?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('certificates.empty')}</p>
            <p className="text-sm">{t('certificates.emptyHint')}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="border rounded-lg p-4 hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm flex-1 pr-2">{cert.name}</h4>
                  <Badge
                    variant={cert.status === 'active' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {cert.status === 'active' ? t('certificates.status.active') : t('certificates.status.expired')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{cert.issuing_org}</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{t('certificates.issueDate')}: {formatDate(cert.issue_date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{t('certificates.expiryDate')}: {formatDate(cert.expiry_date)}</span>
                  </div>
                  {cert.certificate_id && (
                    <div className="flex items-center gap-1">
                      <span>{t('certificates.certNumber')}: {cert.certificate_id}</span>
                    </div>
                  )}
                  {cert.score && (
                    <div className="flex items-center gap-1">
                      <span>{t('certificates.score')}: {cert.score}</span>
                    </div>
                  )}
                  {cert.file_url && (
                    <div className="flex items-center gap-1 text-primary">
                      <FileText className="w-3 h-3" />
                      <a 
                        href={cert.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        {cert.file_name || t('certificates.viewFile')}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                    onClick={() => handleOpenDialog(cert)}
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    {t('common.edit')}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => handleDelete(cert)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    {t('common.delete')}
                  </Button>
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
              {editingCert ? t('certificates.edit') : t('certificates.addNew')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('certificates.name')} *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="VD: Chứng chỉ IELTS"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('certificates.issuingOrg')} *</Label>
              <Input
                value={formData.issuing_org}
                onChange={(e) => setFormData(prev => ({ ...prev, issuing_org: e.target.value }))}
                placeholder="VD: British Council"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('certificates.issueDate')}</Label>
                <Input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('certificates.expiryDate')}</Label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('certificates.certNumber')} *</Label>
                <Input
                  value={formData.certificate_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, certificate_id: e.target.value }))}
                  placeholder="VD: IELTS-7.0"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('certificates.score')}</Label>
                <Input
                  value={formData.score}
                  onChange={(e) => setFormData(prev => ({ ...prev, score: e.target.value }))}
                  placeholder="VD: 7.0"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t('common.status')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('certificates.status.active')}</SelectItem>
                  <SelectItem value="expired">{t('certificates.status.expired')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t('certificates.file')}</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
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
              ) : editingCert?.file_url ? (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="flex-1 text-sm">{editingCert.file_name || t('certificates.uploadedFile')}</span>
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
              <p className="text-xs text-muted-foreground">
                {t('certificates.fileHint')}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingCert ? t('common.save') : t('common.add')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
